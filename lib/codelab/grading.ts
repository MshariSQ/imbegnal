/**
 * Browser-side grading for lab exercises that can run locally (JavaScript and
 * Python for guests or "this browser" runs). The visible tests are public by
 * design, and the comparison is the same `matchOutput` the Worker uses, so a
 * local pass means the same thing as a server pass. Pure: the caller supplies
 * `runOne`, which executes the learner's program for one stdin.
 */
import type { GradeResult, GradeTestResult, PublicRunResult } from "../../shared/api";
import { matchOutput } from "../../shared/match";
import type { LabTest } from "../../data/lessons/types";

export interface LocalTestRun {
  stdout: string;
  result: PublicRunResult;
}

/** Longest expected/actual text kept for the diff view. */
const MAX_DIFF_CHARS = 2_000;

const HARD = new Set<PublicRunResult["status"]>(["timeout", "output_limit", "memory_limit"]);

const clip = (s: string) => (s.length > MAX_DIFF_CHARS ? `${s.slice(0, MAX_DIFF_CHARS)}…` : s);

export async function gradeLocally(args: {
  tests: LabTest[];
  lang: "en" | "ar";
  runOne: (stdin: string) => Promise<LocalTestRun>;
  signal?: AbortSignal;
  /** Set when the learner's own run already hit a hard limit: nothing is re-run. */
  hardFailure?: string;
}): Promise<GradeResult> {
  const out: GradeTestResult[] = [];
  let hardFailure = args.hardFailure;
  for (const t of args.tests) {
    if (args.signal?.aborted) throw new DOMException("The run was stopped", "AbortError");
    if (hardFailure) {
      // A runaway program would burn the full time limit on every remaining test.
      out.push({ name: t.name[args.lang], passed: false, expected: clip(t.expected), actual: "", message: hardFailure });
      continue;
    }
    const run = await args.runOne(t.stdin ?? "");
    if (HARD.has(run.result.status)) hardFailure = run.result.status;
    const ok = run.result.status === "ok" && matchOutput(run.stdout, t.expected, t.mode ?? "trim", t.epsilon);
    const entry: GradeTestResult = { name: t.name[args.lang], passed: ok };
    if (!ok) {
      entry.expected = clip(t.expected);
      entry.actual = clip(run.stdout);
      if (run.result.status !== "ok") entry.message = run.result.message ?? run.result.status;
    }
    out.push(entry);
  }
  const passed = out.filter((t) => t.passed).length;
  return { passed: out.length > 0 && passed === out.length, score: out.length ? passed / out.length : 0, tests: out };
}
