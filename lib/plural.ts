import type { Tx } from "./i18n";

/** "~5h" / "حوالي 5 ساعات" — localized, no bidi-reordered tilde. */
export function hoursLabel(tx: Tx, n: number): string {
  return (n === 1 ? tx.common.approxHoursOne : tx.common.approxHours).replace("{n}", String(n));
}

/** "1 lesson" / "3 lessons" (and the Arabic equivalents) — avoids "1 lessons". */
export function countLabel(tx: Tx, kind: "lesson" | "exercise" | "quiz", n: number): string {
  const one = { lesson: tx.common.lessonOne, exercise: tx.common.exerciseOne, quiz: tx.common.quizOne }[kind];
  const many = { lesson: tx.common.lessons, exercise: tx.lesson.exercisesLabel, quiz: tx.lesson.quizzesLabel }[kind];
  return `${n} ${n === 1 ? one : many}`;
}
