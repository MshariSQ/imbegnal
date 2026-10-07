/**
 * Mapping of what happened in a container step to a `RunStatus` + human message.
 *
 * Pure, and deliberately blind to the program's own output: the verdict only depends on
 * facts the HOST observed (exit code, our own timers and caps, the kernel's OOM flag), so a
 * program can never talk its way into a different status by printing something.
 */
import type { RunStatus } from "../../shared/protocol";

const SIGNALS: Record<number, string> = {
  1: "SIGHUP",
  2: "SIGINT",
  3: "SIGQUIT",
  4: "SIGILL",
  6: "SIGABRT",
  7: "SIGBUS",
  8: "SIGFPE",
  9: "SIGKILL",
  11: "SIGSEGV",
  13: "SIGPIPE",
  14: "SIGALRM",
  15: "SIGTERM",
  24: "SIGXCPU",
  25: "SIGXFSZ",
  31: "SIGSYS",
};

const SIGNAL_HINTS: Record<string, string> = {
  SIGSEGV: "segmentation fault",
  SIGABRT: "aborted",
  SIGFPE: "arithmetic exception",
  SIGILL: "illegal instruction",
  SIGBUS: "bus error",
  SIGKILL: "killed",
  SIGTERM: "terminated",
  SIGXFSZ: "file size limit exceeded",
  SIGXCPU: "CPU time limit exceeded",
  SIGSYS: "blocked system call",
  SIGPIPE: "broken pipe",
};

/** Signal name for a shell-style exit status (128 + n), or null. */
export function signalFromExitCode(code: number | null): string | null {
  if (code === null || code <= 128 || code > 159) return null;
  return SIGNALS[code - 128] ?? null;
}

export interface StepFacts {
  exitCode: number | null;
  /** The host's wall-clock timer fired and the container was killed. */
  timedOut: boolean;
  /** A stream passed the kill cap and the container was killed. */
  outputLimit: boolean;
  /** The kernel OOM-killed something inside the container during this step. */
  oomKilled: boolean;
}

export interface StepContext {
  step: "compile" | "run";
  timeoutMs: number;
  memoryMb: number;
  outputKillBytes: number;
}

export interface StepVerdict {
  /** "ok" means the step succeeded; anything else ends the job. */
  status: RunStatus;
  signal: string | null;
  message?: string;
}

function seconds(ms: number): string {
  const s = ms / 1000;
  return Number.isInteger(s) ? `${s}s` : `${s.toFixed(1)}s`;
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024 && n % (1024 * 1024) === 0) return `${n / (1024 * 1024)} MiB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KiB`;
  return `${n} B`;
}

export function classifyStep(facts: StepFacts, ctx: StepContext): StepVerdict {
  const compiling = ctx.step === "compile";
  if (facts.outputLimit) {
    return {
      status: "output_limit",
      signal: null,
      message: `Output limit exceeded (${formatBytes(ctx.outputKillBytes)} per stream)`,
    };
  }
  if (facts.oomKilled) {
    return {
      status: "memory_limit",
      signal: null,
      message: `${compiling ? "Compilation memory" : "Memory"} limit exceeded (${ctx.memoryMb} MB)`,
    };
  }
  if (facts.timedOut) {
    return {
      status: "timeout",
      signal: null,
      message: `${compiling ? "Compilation time" : "Time"} limit exceeded (${seconds(ctx.timeoutMs)})`,
    };
  }
  if (facts.exitCode === 0) return { status: "ok", signal: null };

  if (compiling) {
    return { status: "compile_error", signal: null, message: "Compilation failed" };
  }
  const signal = signalFromExitCode(facts.exitCode);
  if (signal) {
    const hint = SIGNAL_HINTS[signal];
    return {
      status: "runtime_error",
      signal,
      message: `Terminated by signal ${signal}${hint ? ` (${hint})` : ""}`,
    };
  }
  return { status: "runtime_error", signal: null, message: `Program exited with code ${facts.exitCode ?? "unknown"}` };
}
