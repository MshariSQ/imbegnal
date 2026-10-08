/**
 * Runs one job: one fresh container, separate `docker exec` steps for writing the source,
 * compiling and running, with the status decided from facts the HOST observed.
 *
 *   create -> start -> [probe version] -> write source -> compile -> (memory cap down) -> run -> rm -f
 *
 * Why separate execs: the host sees a distinct stdout/stderr pair per phase, so user code can
 * never forge compiler diagnostics or a runner status line by printing something.
 */
import { formatVersion, getRecipe, isRejection, type EffectiveLimits, type Plan } from "./languages";
import { resolveLimits } from "./limits";
import { classifyStep, type StepVerdict } from "./status";
import { containerName, Docker, DockerError, type ContainerState, type StepResult, type StepSpec } from "./docker";
import type { Logger } from "./log";
import { RUNNER_CEILING, type RunRequest, type RunResult, type RunStatus } from "../../shared/protocol";

export interface ExecuteOptions {
  /** Abort when the caller went away: the container is killed and the result is discarded. */
  signal?: AbortSignal;
  /** Also run the recipe's version command first (used by the availability smoke tests). */
  probeVersion?: boolean;
}

export interface ExecOutcome {
  result: RunResult;
  /** Toolchain version when `probeVersion` was requested and the probe worked. */
  version?: string;
  /** The failure was the runner's (docker, image, cancellation), not the user's or the toolchain's. */
  infra: boolean;
}

/** Source file names are fixed (shared/languages.ts) or a validated Java class: still re-checked here. */
const SAFE_FILENAME = /^[A-Za-z_][A-Za-z0-9_]{0,63}\.[A-Za-z]{1,8}$/;

const INFRA_MESSAGE = "The code runner is temporarily unavailable. Please try again.";
/** Wall limit for the bookkeeping steps (write source, version probe). */
const HOUSEKEEPING_TIMEOUT_MS = 10_000;

function blankResult(jobId: string): RunResult {
  return {
    jobId,
    status: "internal_error",
    exitCode: null,
    signal: null,
    stdout: "",
    stderr: "",
    stdoutBytes: 0,
    stderrBytes: 0,
    truncated: { stdout: false, stderr: false },
    runMs: 0,
    compileMs: 0,
  };
}

/** How long a job container may live at most: used by the reaper to define "stale". */
export function maxJobMs(): number {
  return RUNNER_CEILING.compileTimeoutMs + RUNNER_CEILING.runTimeoutMs + 3 * HOUSEKEEPING_TIMEOUT_MS;
}

export class JobExecutor {
  /** Names of the containers this process currently owns (the reaper must not touch them). */
  private readonly active = new Set<string>();

  constructor(
    private readonly docker: Docker,
    private readonly log: Logger,
  ) {}

  get activeContainers(): ReadonlySet<string> {
    return this.active;
  }

  /** Force-remove every container this process still owns (shutdown path). */
  async removeAll(): Promise<void> {
    await Promise.all([...this.active].map((n) => this.docker.remove(n)));
  }

  async execute(req: RunRequest, opts: ExecuteOptions = {}): Promise<ExecOutcome> {
    const recipe = getRecipe(req.lang);
    const limits = resolveLimits(recipe.defaults, req.limits);
    const plan = recipe.plan(req.code, limits);
    const base = blankResult(req.jobId);

    if (isRejection(plan)) {
      return {
        infra: false,
        result: { ...base, status: "compile_error", exitCode: 1, compileOutput: plan.reject, message: "Compilation failed" },
      };
    }
    if (!SAFE_FILENAME.test(plan.filename)) {
      // Defence in depth: the recipe layer already validates; never put an odd name in an argv.
      return { infra: false, result: { ...base, status: "compile_error", exitCode: 1, compileOutput: "Invalid program name.", message: "Compilation failed" } };
    }

    const name = containerName(req.jobId);
    this.active.add(name);
    try {
      return await this.inContainer(name, req, plan, limits, opts, base);
    } catch (e) {
      const detail = e instanceof DockerError ? `${e.op}: ${e.detail}` : e instanceof Error ? e.name : "unknown";
      this.log.warn("job infrastructure failure", { jobId: req.jobId, lang: req.lang, error: detail });
      return { infra: true, result: { ...base, status: "internal_error", message: INFRA_MESSAGE } };
    } finally {
      // Always: kill + remove, even after a timeout, an abort or an unexpected exception.
      const gone = await this.docker.remove(name);
      if (!gone) this.log.warn("container could not be removed", { jobId: req.jobId, error: "rm failed" });
      this.active.delete(name);
    }
  }

  private async inContainer(
    name: string,
    req: RunRequest,
    plan: Plan,
    limits: EffectiveLimits,
    opts: ExecuteOptions,
    base: RunResult,
  ): Promise<ExecOutcome> {
    const keep = RUNNER_CEILING.outputKeepBytes;
    const kill = RUNNER_CEILING.outputKillBytes;
    const cancelled = (): ExecOutcome => ({
      infra: true,
      result: { ...base, status: "internal_error", message: "The job was cancelled." },
    });

    await this.docker.create({
      name,
      jobId: req.jobId,
      memoryMb: plan.compile ? limits.compileMemoryMb : limits.memoryMb,
      cpus: limits.cpus,
      pids: limits.pids,
      tmpfsMb: limits.tmpfsMb,
      fsizeBytes: limits.tmpfsMb * 1024 * 1024,
      cpuSeconds: Math.ceil((Math.max(limits.compileTimeoutMs, limits.runTimeoutMs) / 1000) * limits.cpus) + 5,
    });
    await this.docker.start(name);
    if (opts.signal?.aborted) return cancelled();

    const step = (argv: readonly string[], timeoutMs: number, extra: Partial<StepSpec> = {}): Promise<StepResult> =>
      this.docker.execStep({
        name,
        argv,
        stdin: null,
        timeoutMs,
        keepBytes: keep,
        killBytes: kill,
        signal: opts.signal,
        ...extra,
      });

    let version: string | undefined;
    if (opts.probeVersion) {
      const probe = await step(getRecipe(req.lang).versionArgv, HOUSEKEEPING_TIMEOUT_MS);
      if (probe.aborted) return cancelled();
      if (probe.spawnFailed) throw new DockerError("exec", "docker binary could not be started");
      if (probe.exitCode !== 0) {
        // Missing toolchain: `docker exec` cannot find the executable (126/127) or the probe fails.
        return {
          infra: false,
          result: { ...base, status: "unsupported", message: `${getRecipe(req.lang).name} is not installed on this runner.` },
        };
      }
      version = formatVersion(req.lang, probe.combined.text());
    }

    // 1. Source goes in through stdin to a FIXED file name; dd takes no shell and no user data in argv.
    const write = await step(["dd", `of=${plan.filename}`, "status=none"], HOUSEKEEPING_TIMEOUT_MS, {
      stdin: Buffer.from(req.code, "utf8"),
    });
    if (write.aborted) return cancelled();
    if (write.spawnFailed || write.exitCode !== 0) throw new DockerError("exec", "could not write the source file");

    const result: RunResult = { ...base, status: "ok" };

    // Optional cache seeding (Go's pre-built standard library); never fatal.
    if (plan.prepare) {
      const p = await step(plan.prepare.argv, HOUSEKEEPING_TIMEOUT_MS, { env: plan.prepare.env });
      if (p.aborted) return cancelled();
    }

    // 2. Compile (separate wall-clock limit).
    if (plan.compile) {
      const c = await step(plan.compile.argv, limits.compileTimeoutMs, { env: plan.compile.env });
      if (c.aborted) return cancelled();
      if (c.spawnFailed) throw new DockerError("exec", "docker binary could not be started");
      result.compileMs = c.wallMs;
      const state = c.exitCode === 0 || c.timedOut || c.outputLimit ? null : await this.stateAfterFailure(name, c.exitCode);
      const v = classifyStep(
        { exitCode: c.exitCode, timedOut: c.timedOut, outputLimit: c.outputLimit, oomKilled: state?.oomKilled ?? false },
        { step: "compile", timeoutMs: limits.compileTimeoutMs, memoryMb: limits.compileMemoryMb, outputKillBytes: kill },
      );
      const diagnostics = c.combined.text();
      if (v.status !== "ok" && state && !state.running && !state.oomKilled) {
        return this.stoppedUnderJob(req, { ...result, compileOutput: diagnostics }, "compile");
      }
      if (v.status !== "ok") {
        return {
          infra: false,
          result: {
            ...result,
            status: v.status,
            exitCode: v.status === "compile_error" ? c.exitCode : null,
            compileOutput: diagnostics,
            message: v.message,
          },
        };
      }
      if (plan.keepCompileOutput && diagnostics.trim() !== "") result.compileOutput = diagnostics;

      // The run step gets the learner's memory budget, which may be lower than the compiler's.
      if (limits.compileMemoryMb !== limits.memoryMb) {
        try {
          await this.docker.setMemory(name, limits.memoryMb);
        } catch (e) {
          // The kernel refuses to lower the cap below what the job already holds: the build output
          // (tmpfs pages are charged to the container) does not fit the run budget. That is the
          // program's doing, so it is charged like any memory_limit. A container that is gone or a
          // daemon that does not answer stays an infrastructure failure.
          const now = await this.docker.inspectState(name);
          if (!now?.running) throw e;
          return {
            infra: false,
            result: {
              ...result,
              status: "memory_limit",
              exitCode: null,
              compileOutput: result.compileOutput ?? diagnostics,
              message: `The compiled program and its files need more than the ${limits.memoryMb} MiB memory limit for running.`,
            },
          };
        }
      }
    }

    // 3. Run: stdin through the exec pipe, own wall-clock limit, host-side output caps.
    const r = await step(plan.run.argv, limits.runTimeoutMs, { env: plan.run.env, stdin: Buffer.from(req.stdin, "utf8") });
    if (r.aborted) return cancelled();
    if (r.spawnFailed) throw new DockerError("exec", "docker binary could not be started");

    const killedByUs = r.timedOut || r.outputLimit;
    const state = r.exitCode === 0 || killedByUs ? null : await this.stateAfterFailure(name, r.exitCode);
    const verdict: StepVerdict = classifyStep(
      { exitCode: r.exitCode, timedOut: r.timedOut, outputLimit: r.outputLimit, oomKilled: state?.oomKilled ?? false },
      { step: "run", timeoutMs: limits.runTimeoutMs, memoryMb: limits.memoryMb, outputKillBytes: kill },
    );
    if (state && !state.running && !state.oomKilled) {
      return this.stoppedUnderJob(req, { ...result, stdout: r.stdout.text(), stderr: r.stderr.text() }, "run");
    }

    const status: RunStatus = verdict.status;
    return {
      infra: false,
      version,
      result: {
        ...result,
        status,
        exitCode: killedByUs || status === "memory_limit" ? null : r.exitCode,
        signal: verdict.signal,
        stdout: r.stdout.text(),
        stderr: r.stderr.text(),
        stdoutBytes: r.stdout.total,
        stderrBytes: r.stderr.total,
        truncated: { stdout: r.stdout.truncated, stderr: r.stderr.truncated },
        runMs: r.wallMs,
        message: verdict.message,
      },
    };
  }

  /**
   * Container state after a failed step. The kernel's OOM event reaches the daemon a moment
   * after the process dies, so exit codes that look like SIGKILL are polled briefly.
   */
  /**
   * The container stopped while a job step ran, and neither our kill nor the OOM killer did it.
   * The job cannot reach the keeper process (different uid), so the likely cause is the job
   * itself; it is reported and charged as a killed program, never refunded as infrastructure
   * (refunds are what made "kill the container" worth trying). Logged so operators can spot a
   * daemon problem behind repeated occurrences.
   */
  private stoppedUnderJob(req: RunRequest, result: RunResult, step: "compile" | "run"): ExecOutcome {
    this.log.warn("container stopped during a job step", { jobId: req.jobId, lang: req.lang, reason: step });
    return {
      infra: false,
      result: { ...result, status: "runtime_error", exitCode: null, signal: "SIGKILL", message: "The sandbox stopped while your program was running." },
    };
  }

  private async stateAfterFailure(name: string, exitCode: number | null): Promise<ContainerState | null> {
    let state = await this.docker.inspectState(name);
    if (state && !state.oomKilled && exitCode === 137) {
      for (let i = 0; i < 6 && state && !state.oomKilled; i++) {
        await new Promise((r) => setTimeout(r, 100));
        state = await this.docker.inspectState(name);
      }
    }
    return state;
  }
}
