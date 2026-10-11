/**
 * XP rules shared by the site and the Worker, so the two cannot drift.
 *
 *  - lesson:   completing a lesson (site, lib/study-store.ts `done`)
 *  - exercise: first pass of an in-lesson exercise (site, study-store `bonus`), and
 *              first server-graded pass of a lesson lab exercise (Worker, xp_ledger)
 *  - quiz:     first pass of an in-lesson quiz (site, study-store `bonus`)
 *
 * Pure; no imports.
 */
export const XP = { lesson: 50, exercise: 15, quiz: 10 } as const;

/** XP the Worker awards once per user and lab exercise (xp_ledger source 'lab'). */
export const LAB_XP = XP.exercise;

/** The parts of a lesson section that decide whether the browser awards XP for it. */
export interface XpSection {
  type: string;
  tests?: readonly unknown[];
  questions?: readonly unknown[];
}

/**
 * The most `bonus` XP the browser can award inside one lesson, exactly as the lesson
 * components award it: components/lesson/LessonView.tsx calls onSectionPassed once per
 * section, for an exercise (ExerciseBlock only offers "Check" when it has tests) or a
 * quiz (QuizBlock passes once every question is answered, so it needs one), and
 * components/learn/LessonPlayer.tsx adds XP.exercise or XP.quiz. Lab sections are not
 * counted: for signed-in learners the Worker awards their XP (xp_ledger).
 */
export function lessonMaxBonus(sections: readonly XpSection[]): number {
  let max = 0;
  for (const s of sections) {
    if (s.type === "exercise" && (s.tests?.length ?? 0) > 0) max += XP.exercise;
    else if (s.type === "quiz" && (s.questions?.length ?? 0) > 0) max += XP.quiz;
  }
  return max;
}
