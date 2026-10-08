// Dependency-free on purpose: the grader engine (also type-checked by the site's tsconfig
// through the authoring tests) imports it without pulling in Worker-only types.

/**
 * Wall-clock budget for the tests of ONE reservation: a graded lesson run (gradeLab) or a
 * challenge submission (graders/engine gradeTests). No further test is started after it, so a
 * reservation lasts at most this plus one runner call (see RUNNING_STALE_SECONDS in execute.ts).
 */
export const GRADING_BUDGET_MS = 90_000;
