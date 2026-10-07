// Grading of lesson lab exercises: the learner's program runs once per catalog
// test (with that test's stdin) and its stdout is compared with `matchOutput`.
// Lab tests are visible by design (they are in the lesson), so failing tests
// report expected/actual. Hidden challenge tests are A2b's, never handled here.
import type { GradeResult, GradeTestResult } from "../../../shared/api";
import type { CatalogLab } from "../../../shared/catalog";
import { matchOutput } from "../../../shared/match";
import type { RunResult } from "../../../shared/protocol";
import { catalog } from "../generated/catalog";
import type { Env } from "../util";
import { GRADE_TEXT_CHARS, MAX_GRADED_TESTS } from "./config";
import { runOnRunner } from "./runner";

/** The lab exercise for `track/lesson/exercise`, or null when the catalog has none. */
export function findLab(ref: string): CatalogLab | null {
  return catalog.labs.find((l) => l.ref === ref) ?? null;
}

const clip = (s: string): string => (s.length > GRADE_TEXT_CHARS ? `${s.slice(0, GRADE_TEXT_CHARS)}…` : s);

/** After these statuses every remaining test would fail the same way, so they are skipped (saves runner time). */
const ABORTS_GRADING = new Set<RunResult["status"]>(["compile_error", "unsupported", "internal_error", "timeout", "memory_limit", "output_limit"]);

export interface GradedRun {
  grade: GradeResult;
  /** The run the learner sees: the first failing one, else the first. */
  shown: RunResult;
  /** stdin of the shown run (each test brings its own). */
  shownStdin: string;
  /** Every runner invocation, in order (for quota settlement and abuse signals). */
  runs: RunResult[];
}

export async function gradeLab(env: Env, lab: CatalogLab, code: string): Promise<GradedRun> {
  const tests = lab.tests.slice(0, MAX_GRADED_TESTS);
  const results: GradeTestResult[] = [];
  const runs: RunResult[] = []; // runs[i] belongs to tests[i]; tests after an abort have no run
  let aborted = false;

  for (const test of tests) {
    if (aborted) {
      results.push({ name: test.name, passed: false, message: "not_run" });
      continue;
    }
    const run = await runOnRunner(env, { lang: lab.lang, code, stdin: test.stdin });
    runs.push(run);
    if (run.status === "ok" && matchOutput(run.stdout, test.expected, test.mode, test.epsilon)) {
      results.push({ name: test.name, passed: true });
      continue;
    }
    results.push({
      name: test.name,
      passed: false,
      expected: clip(test.expected),
      actual: clip(run.stdout),
      message: run.status === "ok" ? "wrong_output" : run.status,
    });
    if (ABORTS_GRADING.has(run.status)) aborted = true;
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failed = runs.findIndex((_, i) => !results[i].passed);
  const shownIndex = failed >= 0 ? failed : 0;
  return {
    grade: { passed: results.length > 0 && passedCount === results.length, score: results.length ? passedCount / results.length : 0, tests: results },
    shown: runs[shownIndex],
    shownStdin: tests[shownIndex]?.stdin ?? "",
    runs,
  };
}
