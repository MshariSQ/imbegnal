import type { Tx } from "./i18n";

/** "1 lesson" / "3 lessons" (and the Arabic equivalents) — avoids "1 lessons". */
export function countLabel(tx: Tx, kind: "lesson" | "exercise" | "quiz", n: number): string {
  const one = { lesson: tx.common.lessonOne, exercise: tx.common.exerciseOne, quiz: tx.common.quizOne }[kind];
  const many = { lesson: tx.common.lessons, exercise: tx.lesson.exercisesLabel, quiz: tx.lesson.quizzesLabel }[kind];
  return `${n} ${n === 1 ? one : many}`;
}
