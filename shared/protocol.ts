/**
 * Runner protocol — the contract between the Worker (trusted caller) and the
 * runner service (which executes UNTRUSTED code inside throw-away containers).
 *
 *   Worker ──HTTPS + HMAC──▶ runner  POST /v1/run         (RunRequest → RunResult)
 *                                    GET  /v1/languages   (LanguagesResponse)
 *                                    GET  /healthz
 *
 * Authentication: every request carries
 *   X-IMB-Timestamp: <unix milliseconds>
 *   X-IMB-Signature: hex( HMAC-SHA256(secret, `${timestamp}.${rawBody}`) )
 * The runner rejects timestamps older/newer than SIGNATURE_WINDOW_MS and any
 * `jobId` it has already seen (replay protection).
 *
 * Pure types + constants (no imports): usable from Node, Workers and the browser.
 */
import type { LangId } from "./languages";

export const RUNNER_PROTOCOL_VERSION = 1;
export const SIGNATURE_WINDOW_MS = 30_000;
export const SIG_HEADER = "x-imb-signature";
export const TS_HEADER = "x-imb-timestamp";

/** Hard ceilings the runner enforces no matter what the caller asks for. */
export const RUNNER_CEILING = {
  codeBytes: 64 * 1024,
  stdinBytes: 64 * 1024,
  /** Bytes of each stream kept and returned; the rest is dropped. */
  outputKeepBytes: 64 * 1024,
  /** Bytes of a stream after which the job is killed as "output_limit". */
  outputKillBytes: 1024 * 1024,
  compileTimeoutMs: 20_000,
  runTimeoutMs: 15_000,
  memoryMb: 1024,
} as const;

/** Defaults used when the caller does not override (callers may only LOWER these). */
export const RUNNER_DEFAULTS = {
  compileTimeoutMs: 10_000,
  runTimeoutMs: 5_000,
  memoryMb: 256,
  cpus: 1,
  pids: 64,
  tmpfsMb: 64,
} as const;

export interface RunLimits {
  /** Wall-clock limit for the compile step (ms). */
  compileTimeoutMs?: number;
  /** Wall-clock limit for the program run (ms). */
  runTimeoutMs?: number;
  /** Container memory cap (MiB). */
  memoryMb?: number;
}

export interface RunRequest {
  /** Unique per job (uuid). Used for idempotency, logging and container names. */
  jobId: string;
  lang: LangId;
  code: string;
  /** Written to the program's stdin. */
  stdin: string;
  limits?: RunLimits;
}

/**
 * ok              exit code 0
 * compile_error   the compiler/interpreter front-end rejected the program
 * runtime_error   program ran and exited non-zero (or was killed by a signal)
 * timeout         wall-clock or CPU limit hit; the process tree was killed
 * memory_limit    container OOM-killed
 * output_limit    stdout/stderr flood; job killed
 * unsupported     language toolchain is not installed on this runner
 * internal_error  runner/infrastructure failure (NOT the user's fault → quota refund)
 */
export type RunStatus =
  | "ok"
  | "compile_error"
  | "runtime_error"
  | "timeout"
  | "memory_limit"
  | "output_limit"
  | "unsupported"
  | "internal_error";

export interface RunResult {
  jobId: string;
  status: RunStatus;
  /** Exit code of the program (or compiler on compile_error); null when killed before exiting. */
  exitCode: number | null;
  /** Terminating signal name, when applicable ("SIGKILL", "SIGSEGV", …). */
  signal?: string | null;
  stdout: string;
  stderr: string;
  /** Compiler diagnostics (also present when compilation succeeded but warned). */
  compileOutput?: string;
  /** Total bytes the program wrote, before truncation. */
  stdoutBytes: number;
  stderrBytes: number;
  truncated: { stdout: boolean; stderr: boolean };
  /** Wall time of the run step (ms). */
  runMs: number;
  /** Wall time of the compile step (ms); 0 for interpreted languages. */
  compileMs: number;
  /** Peak memory in KiB when the driver can measure it. */
  memoryKb?: number;
  /** Human-readable runner message (e.g. "Time limit exceeded (5s)"). Never contains host paths. */
  message?: string;
}

export interface LanguageStatus {
  id: LangId;
  /** Toolchain present and smoke-tested at runner start-up. */
  available: boolean;
  /** e.g. "Python 3.12.3"; absent when unavailable. */
  version?: string;
}

export interface LanguagesResponse {
  protocol: number;
  languages: LanguageStatus[];
  /** Isolation driver in use ("docker"). Informational. */
  driver: string;
  limits: typeof RUNNER_DEFAULTS;
}
