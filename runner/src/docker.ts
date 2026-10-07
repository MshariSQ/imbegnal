/**
 * Thin, shell-free wrapper around the Docker CLI.
 *
 * Every call is `spawn(bin, [argv...])`: there is no shell anywhere, so no value can be
 * interpreted as syntax. The only data that can originate from a learner and reach an argv
 * element is a validated Java class name (see languages.ts); source code and stdin only
 * ever travel through a container's stdin pipe.
 *
 * The CLI is spawned with a minimal environment: the runner's own environment (notably
 * RUNNER_SECRET) never reaches the docker process, and `docker create` is never given
 * `-e` for anything but the fixed variables below, so nothing from the host leaks into a
 * job container either.
 */
import { spawn } from "node:child_process";
import { OutputCollector } from "./output";
import type { Logger } from "./log";

/** Unprivileged uid:gid every job step runs as ("nobody"). */
export const JOB_USER = "65534:65534";
/**
 * uid:gid of the container's init and its idle keeper (`sleep infinity`). Deliberately NOT the
 * job's uid: without CAP_KILL a job cannot signal another uid's processes, so learner code
 * cannot stop the container from inside (which used to look like an infrastructure failure).
 */
export const KEEPER_USER = "65533:65533";
export const RUNNER_LABEL = "imbegnal.runner=1";
export const CONTAINER_PREFIX = "imb-run-";
export const WORKDIR = "/work";

/** Fixed container environment. Nothing else is ever passed in. */
export const JOB_PATH = "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt/kotlinc/bin:/opt/swift/usr/bin";

export function containerName(jobId: string): string {
  return `${CONTAINER_PREFIX}${jobId}`;
}

/** Host environment variables the docker CLI itself needs (never the runner's secrets). */
const CLI_ENV_PASSTHROUGH = [
  "PATH",
  "HOME",
  "USER",
  "DOCKER_HOST",
  "DOCKER_CONFIG",
  "DOCKER_CONTEXT",
  "DOCKER_CERT_PATH",
  "DOCKER_TLS_VERIFY",
  "XDG_RUNTIME_DIR",
] as const;

export function cliEnvironment(host: string | null, source: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const k of CLI_ENV_PASSTHROUGH) if (source[k] !== undefined) env[k] = source[k];
  env.PATH ??= "/usr/local/bin:/usr/bin:/bin";
  if (host) env.DOCKER_HOST = host;
  return env;
}

export class DockerError extends Error {
  constructor(
    readonly op: string,
    readonly detail: string,
  ) {
    super(`docker ${op} failed`);
  }
}

export interface DockerOptions {
  bin: string;
  host: string | null;
  runtime: string | null;
  image: string;
  /** Unique id of this runner process; stamped on every container so the reaper knows owners. */
  owner: string;
  /** Extra `k=v` labels stamped on every container (scopes the reaper; empty in production). */
  extraLabels: readonly string[];
  logger: Logger;
}

export interface ContainerSpec {
  name: string;
  jobId: string;
  memoryMb: number;
  cpus: number;
  pids: number;
  tmpfsMb: number;
  /** Largest single file a job may write (bytes). */
  fsizeBytes: number;
  /** Per-process CPU-second backstop behind the wall-clock timer. */
  cpuSeconds: number;
}

export interface CreateArgsInput extends ContainerSpec {
  image: string;
  runtime: string | null;
  owner: string;
  extraLabels: readonly string[];
}

function tmpfsMount(path: string, sizeMb: number): string {
  // exec: compilers write executables here. nosuid/nodev: no setuid files, no device nodes.
  return `${path}:rw,exec,nosuid,nodev,size=${sizeMb}m,mode=0755,uid=65534,gid=65534`;
}

/**
 * The full `docker create` argv for a job container. Exported (and pure) so the isolation
 * flags can be unit-tested without a daemon.
 */
export function buildCreateArgs(i: CreateArgsInput): string[] {
  const mem = `${i.memoryMb}m`;
  const args = [
    "create",
    "--name",
    i.name,
    "--label",
    RUNNER_LABEL,
    "--label",
    `imbegnal.job=${i.jobId}`,
    "--label",
    `imbegnal.owner=${i.owner}`,
  ];
  for (const l of i.extraLabels) args.push("--label", l);
  args.push(
    // Never pull at job time (and there is no network to pull from).
    "--pull",
    "never",
    "--network",
    "none",
    "--read-only",
    "--tmpfs",
    tmpfsMount(WORKDIR, i.tmpfsMb),
    "--tmpfs",
    tmpfsMount(`${WORKDIR}/tmp`, i.tmpfsMb),
    "--shm-size",
    "8m",
    "--user",
    KEEPER_USER,
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges",
    "--pids-limit",
    String(i.pids),
    "--memory",
    mem,
    "--memory-swap",
    mem,
    "--cpus",
    String(i.cpus),
    "--ulimit",
    "nofile=1024:1024",
    // RLIMIT_NPROC counts every process of the uid on the HOST, across containers, so it is only
    // a backstop; the per-container --pids-limit is the real fork-bomb control.
    "--ulimit",
    "nproc=4096:4096",
    "--ulimit",
    `fsize=${i.fsizeBytes}:${i.fsizeBytes}`,
    "--ulimit",
    "core=0:0",
    "--ulimit",
    `cpu=${i.cpuSeconds}:${i.cpuSeconds}`,
    "--init",
    "--stop-timeout",
    "0",
    "--hostname",
    "sandbox",
    "--workdir",
    WORKDIR,
    "-e",
    `HOME=${WORKDIR}`,
    "-e",
    `TMPDIR=${WORKDIR}/tmp`,
    "-e",
    `PATH=${JOB_PATH}`,
    "-e",
    "LANG=C.UTF-8",
  );
  if (i.runtime) args.push("--runtime", i.runtime);
  args.push(i.image, "sleep", "infinity");
  return args;
}

export interface CliResult {
  code: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  /** The docker binary could not be started at all. */
  spawnFailed: boolean;
}

export interface CliOptions {
  input?: Buffer | string;
  timeoutMs?: number;
  /** Cap on captured output per stream (the rest is dropped). */
  maxBytes?: number;
}

export interface StepSpec {
  name: string;
  argv: readonly string[];
  env?: Record<string, string>;
  /** Piped to the process's stdin (then closed); null leaves stdin closed. */
  stdin: Buffer | null;
  timeoutMs: number;
  keepBytes: number;
  killBytes: number;
  signal?: AbortSignal;
}

export interface StepResult {
  /** Exit status of the process; null when we killed it (timeout, output cap, abort). */
  exitCode: number | null;
  timedOut: boolean;
  outputLimit: boolean;
  aborted: boolean;
  spawnFailed: boolean;
  wallMs: number;
  stdout: OutputCollector;
  stderr: OutputCollector;
  /** Both streams in arrival order (compiler diagnostics). */
  combined: OutputCollector;
}

export interface ContainerState {
  running: boolean;
  oomKilled: boolean;
  exitCode: number;
}

export interface OwnedContainer {
  id: string;
  name: string;
  createdMs: number;
  owner: string;
}

export class Docker {
  private readonly env: NodeJS.ProcessEnv;

  constructor(private readonly o: DockerOptions) {
    this.env = cliEnvironment(o.host);
  }

  get image(): string {
    return this.o.image;
  }

  /** Run a short docker command and capture its output. Never throws. */
  cli(args: readonly string[], opts: CliOptions = {}): Promise<CliResult> {
    return new Promise((resolve) => {
      const maxBytes = opts.maxBytes ?? 256 * 1024;
      const out = new OutputCollector(maxBytes, Number.MAX_SAFE_INTEGER);
      const err = new OutputCollector(maxBytes, Number.MAX_SAFE_INTEGER);
      let timedOut = false;
      let settled = false;
      const child = spawn(this.o.bin, [...args], {
        env: this.env,
        stdio: [opts.input === undefined ? "ignore" : "pipe", "pipe", "pipe"],
        windowsHide: true,
      });
      const finish = (code: number | null, spawnFailed: boolean) => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        resolve({ code, stdout: out.text(), stderr: err.text(), timedOut, spawnFailed });
      };
      const timer = opts.timeoutMs
        ? setTimeout(() => {
            timedOut = true;
            child.kill("SIGKILL");
          }, opts.timeoutMs)
        : null;
      child.stdout?.on("data", (c: Buffer) => void out.push(c));
      child.stderr?.on("data", (c: Buffer) => void err.push(c));
      child.on("error", () => finish(null, true));
      child.on("close", (code) => finish(code, false));
      if (opts.input !== undefined && child.stdin) {
        child.stdin.on("error", () => {});
        child.stdin.end(opts.input);
      }
    });
  }

  private async must(op: string, args: readonly string[], opts?: CliOptions): Promise<CliResult> {
    const r = await this.cli(args, { timeoutMs: 30_000, ...opts });
    if (r.spawnFailed) throw new DockerError(op, "docker binary could not be started");
    if (r.timedOut) throw new DockerError(op, "timed out");
    if (r.code !== 0) throw new DockerError(op, r.stderr.trim().slice(0, 300) || `exit ${r.code}`);
    return r;
  }

  /** True when the daemon answers. */
  async ping(): Promise<boolean> {
    const r = await this.cli(["version", "--format", "{{.Server.Version}}"], { timeoutMs: 8_000 });
    return !r.spawnFailed && !r.timedOut && r.code === 0 && r.stdout.trim() !== "";
  }

  async imageExists(image: string = this.o.image): Promise<boolean> {
    const r = await this.cli(["image", "inspect", "--format", "{{.Id}}", image], { timeoutMs: 10_000 });
    return r.code === 0;
  }

  async pull(image: string = this.o.image): Promise<void> {
    await this.must("pull", ["pull", "--quiet", image], { timeoutMs: 10 * 60_000 });
  }

  async create(spec: ContainerSpec): Promise<void> {
    await this.must(
      "create",
      buildCreateArgs({ ...spec, image: this.o.image, runtime: this.o.runtime, owner: this.o.owner, extraLabels: this.o.extraLabels }),
    );
  }

  async start(name: string): Promise<void> {
    await this.must("start", ["start", name]);
  }

  /** Change the memory cap (and the equal swap cap) of a created container. */
  async setMemory(name: string, memoryMb: number): Promise<void> {
    const m = `${memoryMb}m`;
    await this.must("update", ["update", "--memory", m, "--memory-swap", m, name]);
  }

  async inspectState(name: string): Promise<ContainerState | null> {
    const r = await this.cli(["inspect", "--format", "{{json .State}}", name], { timeoutMs: 10_000 });
    if (r.code !== 0) return null;
    try {
      const s = JSON.parse(r.stdout) as { Running?: unknown; OOMKilled?: unknown; ExitCode?: unknown };
      return { running: s.Running === true, oomKilled: s.OOMKilled === true, exitCode: typeof s.ExitCode === "number" ? s.ExitCode : 0 };
    } catch {
      return null;
    }
  }

  /** Best effort SIGKILL of the whole container. Never throws. */
  async kill(name: string): Promise<void> {
    await this.cli(["kill", name], { timeoutMs: 10_000 });
  }

  /** Force-remove a container and its anonymous volumes. Returns true when it is gone. */
  async remove(name: string): Promise<boolean> {
    const r = await this.cli(["rm", "-f", "-v", name], { timeoutMs: 20_000 });
    if (r.code === 0) return true;
    return /No such container/i.test(r.stderr);
  }

  /** Containers created by this runner (label imbegnal.runner=1 + the configured extra labels). */
  async listOwned(): Promise<OwnedContainer[]> {
    const filters = ["--filter", `label=${RUNNER_LABEL}`];
    for (const l of this.o.extraLabels) filters.push("--filter", `label=${l}`);
    const ps = await this.must("ps", ["ps", "-a", "--no-trunc", "--format", "{{.ID}}", ...filters]);
    const ids = ps.stdout.split("\n").map((s) => s.trim()).filter((s) => /^[0-9a-f]{12,64}$/.test(s));
    if (ids.length === 0) return [];
    const r = await this.cli(
      ["inspect", "--format", '{{.Id}}\t{{.Name}}\t{{.Created}}\t{{index .Config.Labels "imbegnal.owner"}}', ...ids],
      { timeoutMs: 20_000 },
    );
    const out: OwnedContainer[] = [];
    for (const line of r.stdout.split("\n")) {
      const [id, name, created, owner] = line.split("\t");
      if (!id || !created) continue;
      const t = Date.parse(created);
      if (Number.isNaN(t)) continue;
      out.push({ id, name: (name ?? "").replace(/^\//, ""), createdMs: t, owner: owner ?? "" });
    }
    return out;
  }

  /**
   * `docker exec` one command in a running job container and stream its output into bounded
   * collectors. The HOST measures wall time and enforces every cap: on timeout, output flood
   * or abort the whole container is killed, so no stray process outlives the step.
   */
  execStep(spec: StepSpec): Promise<StepResult> {
    return new Promise((resolve) => {
      const stdout = new OutputCollector(spec.keepBytes, spec.killBytes);
      const stderr = new OutputCollector(spec.keepBytes, spec.killBytes);
      const combined = new OutputCollector(spec.keepBytes, Number.MAX_SAFE_INTEGER);
      const args = ["exec", "--user", JOB_USER];
      if (spec.stdin) args.push("-i");
      args.push("--workdir", WORKDIR);
      for (const k of Object.keys(spec.env ?? {}).sort()) args.push("-e", `${k}=${spec.env?.[k] ?? ""}`);
      args.push(spec.name, ...spec.argv);

      const t0 = performance.now();
      let timedOut = false;
      let outputLimit = false;
      let aborted = false;
      let settled = false;
      let killed = false;

      const child = spawn(this.o.bin, args, {
        env: this.env,
        stdio: [spec.stdin ? "pipe" : "ignore", "pipe", "pipe"],
        windowsHide: true,
      });

      const stop = () => {
        if (killed) return;
        killed = true;
        void this.kill(spec.name);
        child.kill("SIGKILL");
      };
      const finish = (code: number | null, spawnFailed: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        spec.signal?.removeEventListener("abort", onAbort);
        resolve({
          exitCode: killed || spawnFailed ? null : code,
          timedOut,
          outputLimit,
          aborted,
          spawnFailed,
          wallMs: Math.round(performance.now() - t0),
          stdout,
          stderr,
          combined,
        });
      };
      const onAbort = () => {
        aborted = true;
        stop();
      };

      const timer = setTimeout(() => {
        timedOut = true;
        stop();
      }, spec.timeoutMs);
      if (spec.signal) {
        if (spec.signal.aborted) onAbort();
        else spec.signal.addEventListener("abort", onAbort, { once: true });
      }

      child.stdout?.on("data", (c: Buffer) => {
        if (stdout.push(c) && !outputLimit) {
          outputLimit = true;
          stop();
        }
        combined.push(c);
      });
      child.stderr?.on("data", (c: Buffer) => {
        if (stderr.push(c) && !outputLimit) {
          outputLimit = true;
          stop();
        }
        combined.push(c);
      });
      child.on("error", () => finish(null, true));
      child.on("close", (code) => finish(code, false));
      if (spec.stdin && child.stdin) {
        // The program may exit without reading its stdin: EPIPE is not an error.
        child.stdin.on("error", () => {});
        child.stdin.end(spec.stdin);
      }
    });
  }
}
