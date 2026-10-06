// Grader engine: turns a ChallengeGrader + a submission into a GradeResult.
//
//   flag    SHA-256 of the trimmed (optionally lower-cased) flag, compared in constant time
//   output  the program is run once per test (stdin → stdout) and compared with matchOutput
//   code    like output, after wrapping the learner's code in the per-language harness
//
// The engine is deliberately free of D1, quota and HTTP concerns: the runner is injected
// (`RunFn`), so the same code is unit-testable and the callers own accounting. It never logs
// or stores a submission, and it never returns hidden expected output (see `redactResult`).
import { SUBMIT_LIMITS } from "../../../shared/challenges";
import type { ChallengeGrader, FlagGrader, HarnessGrader, OutputGrader, OutputTest } from "../../../shared/challenges";
import type { GradeResult, GradeTestResult } from "../../../shared/api";
import type { LangId } from "../../../shared/languages";
import { matchOutput } from "../../../shared/match";
import { RUNNER_DEFAULTS, type RunLimits, type RunResult, type RunStatus } from "../../../shared/protocol";

/** Literal marker in a harness template that receives the learner's code. */
export const CODE_SENTINEL = "{{CODE}}";
/** Wall-clock budget for all tests of one submission (ms); later tests are skipped as failed. */
export const DEFAULT_BUDGET_MS = 90_000;
/** Max characters of expected/actual echoed for the first failing visible test. */
const SHOWN_CHARS = 2_000;
/** Max characters of any stream returned to the learner. */
const STREAM_CHARS = 16 * 1024;

// ── Flags ─────────────────────────────────────────────────────────────────────

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  let hex = "";
  for (const b of new Uint8Array(digest)) hex += b.toString(16).padStart(2, "0");
  return hex;
}

/** The exact string a flag is hashed as: trimmed, and lower-cased for case-insensitive flags. */
export function normalizeFlag(flag: string, caseInsensitive = false): string {
  const t = flag.trim();
  return caseInsensitive ? t.toLowerCase() : t;
}

/** Authoring helper: the `flagHash` to store in a FlagGrader for `flag`. */
export function hashFlag(flag: string, caseInsensitive = false): Promise<string> {
  return sha256Hex(normalizeFlag(flag, caseInsensitive));
}

/** Constant-time string equality (no early exit on the first differing character). */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const HEX64 = /^[0-9a-f]{64}$/;

export async function gradeFlag(grader: FlagGrader, submitted: string): Promise<boolean> {
  const expected = grader.flagHash.toLowerCase();
  // A malformed grader entry must fail closed, never match by accident.
  if (!HEX64.test(expected)) return false;
  const actual = await sha256Hex(normalizeFlag(submitted, grader.caseInsensitive));
  return timingSafeEqual(actual, expected);
}

// ── Output / harness tests ────────────────────────────────────────────────────

export type RunFn = (req: { lang: LangId; code: string; stdin: string; limits?: RunLimits }) => Promise<RunResult>;

export type BuildProgramResult =
  | { ok: true; program: string }
  | { ok: false; reason: "unsupported_language" | "reserved_sentinel" | "misconfigured" };

/**
 * The program that is actually executed for a submission. `output` graders run the
 * learner's code as is; `code` graders substitute it into the language's harness at the
 * FIRST `{{CODE}}` (plain string splice: `$&` and friends in the learner's text are inert).
 */
export function buildProgram(grader: OutputGrader | HarnessGrader, lang: LangId, code: string): BuildProgramResult {
  if (grader.kind === "output") return { ok: true, program: code };
  const template = grader.harness[lang];
  if (template === undefined) return { ok: false, reason: "unsupported_language" };
  if (code.includes(CODE_SENTINEL)) return { ok: false, reason: "reserved_sentinel" };
  const at = template.indexOf(CODE_SENTINEL);
  if (at < 0) return { ok: false, reason: "misconfigured" };
  return { ok: true, program: template.slice(0, at) + code + template.slice(at + CODE_SENTINEL.length) };
}

export type TestsOutcome =
  | {
      kind: "graded";
      grade: GradeResult;
      /** Status used to settle the quota reservation (a user-caused status keeps the charge). */
      quotaOutcome: RunStatus;
      /** The one run result that is safe to show / log (see redactResult). */
      result: RunResult;
    }
  | { kind: "infrastructure"; status: "internal_error" | "unsupported"; message: string }
  | { kind: "misconfigured" };

interface TestRun {
  test: OutputTest;
  result: RunResult | null; // null: not run (skipped)
  passed: boolean;
  message?: string;
}

const FAIL_MESSAGES: Partial<Record<RunStatus, string>> = {
  compile_error: "Compilation failed",
  runtime_error: "Runtime error",
  timeout: "Time limit exceeded",
  memory_limit: "Memory limit exceeded",
  output_limit: "Output limit exceeded",
};

function limitsFor(test: OutputTest): RunLimits | undefined {
  // Tests may only LOWER the runner's default time limit.
  if (typeof test.timeoutMs !== "number" || !(test.timeoutMs > 0)) return undefined;
  return { runTimeoutMs: Math.min(Math.floor(test.timeoutMs), RUNNER_DEFAULTS.runTimeoutMs) };
}

function judge(test: OutputTest, r: RunResult): { passed: boolean; message?: string } {
  if (r.status === "ok") {
    // Truncated output cannot be compared reliably: treat as a failure, not a guess.
    if (r.truncated.stdout) return { passed: false, message: "Output too long" };
    return matchOutput(r.stdout, test.expected, test.mode ?? "trim", test.epsilon ?? 1e-6)
      ? { passed: true }
      : { passed: false, message: "Wrong output" };
  }
  return { passed: false, message: FAIL_MESSAGES[r.status] ?? "Run failed" };
}

const clip = (s: string, max: number) => (s.length > max ? `${s.slice(0, max)}…` : s);

/**
 * Strips everything that could echo hidden-test data. A run of a HIDDEN test has its streams
 * blanked (a passing hidden run's stdout IS the expected output); compile errors keep their
 * diagnostics (compilation happens before any test input is read).
 */
export function redactResult(r: RunResult, hidden: boolean): RunResult {
  if (r.status === "compile_error") {
    return {
      ...r,
      stdout: clip(r.stdout, STREAM_CHARS),
      stderr: clip(r.stderr, STREAM_CHARS),
      compileOutput: r.compileOutput === undefined ? undefined : clip(r.compileOutput, STREAM_CHARS),
    };
  }
  if (hidden) {
    return { ...r, stdout: "", stderr: "", stdoutBytes: 0, stderrBytes: 0, truncated: { stdout: false, stderr: false }, compileOutput: undefined };
  }
  return { ...r, stdout: clip(r.stdout, STREAM_CHARS), stderr: clip(r.stderr, STREAM_CHARS), compileOutput: r.compileOutput === undefined ? undefined : clip(r.compileOutput, STREAM_CHARS) };
}

export interface GradeTestsOptions {
  now?: () => number;
  budgetMs?: number;
}

/**
 * Runs the grader's tests (at most SUBMIT_LIMITS.maxTests) for one submission.
 * The caller reserves ONE quota unit for the whole submission, not one per test.
 */
export async function gradeTests(
  grader: OutputGrader | HarnessGrader,
  lang: LangId,
  program: string,
  run: RunFn,
  opts: GradeTestsOptions = {},
): Promise<TestsOutcome> {
  const tests = grader.tests.slice(0, SUBMIT_LIMITS.maxTests);
  if (tests.length === 0) return { kind: "misconfigured" };
  const now = opts.now ?? Date.now;
  const deadline = now() + (opts.budgetMs ?? DEFAULT_BUDGET_MS);

  const runs: TestRun[] = [];
  let stopMessage: string | null = null; // why the remaining tests were not run
  for (const test of tests) {
    if (stopMessage !== null) {
      runs.push({ test, result: null, passed: false, message: stopMessage });
      continue;
    }
    if (now() > deadline) {
      stopMessage = "Skipped: time budget exceeded";
      runs.push({ test, result: null, passed: false, message: stopMessage });
      continue;
    }
    let result: RunResult;
    try {
      result = await run({ lang, code: program, stdin: test.stdin, limits: limitsFor(test) });
    } catch {
      // runOnRunner never throws; if a replacement does, it is an infrastructure failure.
      return { kind: "infrastructure", status: "internal_error", message: "runner_unavailable" };
    }
    if (result.status === "internal_error") return { kind: "infrastructure", status: "internal_error", message: result.message ?? "runner_unavailable" };
    if (result.status === "unsupported") return { kind: "infrastructure", status: "unsupported", message: result.message ?? "language_unavailable" };
    const verdict = judge(test, result);
    runs.push({ test, result, passed: verdict.passed, message: verdict.message });
    // The same program fails to compile for every input: do not burn runner time on the rest.
    if (result.status === "compile_error") stopMessage = FAIL_MESSAGES.compile_error ?? "Compilation failed";
  }

  // expected/actual are shown for the FIRST failing visible test only.
  let detailed = false;
  const results: GradeTestResult[] = runs.map((t) => {
    const hidden = t.test.hidden === true;
    const entry: GradeTestResult = { name: t.test.name, passed: t.passed };
    if (hidden) entry.hidden = true;
    if (!t.passed) {
      if (t.message !== undefined) entry.message = t.message;
      if (!hidden && !detailed) {
        detailed = true;
        if (t.result !== null && t.result.status === "ok") {
          entry.expected = clip(t.test.expected, SHOWN_CHARS);
          entry.actual = clip(t.result.stdout, SHOWN_CHARS);
        }
      }
    }
    return entry;
  });

  const passedCount = runs.filter((t) => t.passed).length;
  const executed = runs.filter((t): t is TestRun & { result: RunResult } => t.result !== null);
  const first = executed.find((t) => t.result.status === "compile_error");
  let feedback = `${passedCount}/${runs.length} tests passed`;
  if (first) {
    const diagnostics = (first.result.compileOutput ?? first.result.stderr).trim();
    feedback = diagnostics ? `Compilation failed:\n${clip(diagnostics, SHOWN_CHARS)}` : "Compilation failed";
  }

  // Representative run to show/log: compile error first, then the first failing VISIBLE run,
  // then the first visible run; hidden-only graders get a redacted summary of the first failure.
  const pick =
    first ??
    executed.find((t) => !t.passed && t.test.hidden !== true) ??
    executed.find((t) => t.test.hidden !== true) ??
    executed.find((t) => !t.passed) ??
    executed[0];
  if (!pick) return { kind: "infrastructure", status: "internal_error", message: "time_budget_exceeded" };
  const result = redactResult(pick.result, pick.test.hidden === true);

  const firstBad = executed.find((t) => t.result.status !== "ok");
  return {
    kind: "graded",
    grade: { passed: passedCount === runs.length, score: passedCount / runs.length, tests: results, feedback },
    quotaOutcome: firstBad ? firstBad.result.status : "ok",
    result,
  };
}

/** Narrowing helper for callers that dispatch on the grader kind. */
export function isTestGrader(g: ChallengeGrader): g is OutputGrader | HarnessGrader {
  return g.kind === "output" || g.kind === "code";
}
