import type { LessonSection } from "../types";

/**
 * Honest lesson length, computed from the content instead of guessed:
 * technical reading at ~170 words/minute, 2 minutes per runnable demo (run it,
 * tweak it), 7 minutes per graded lab (read, write, debug, resubmit), and
 * 1 minute per quiz question. Rounded to the nearest 5 minutes.
 */
export function estimateMinutes(sections: readonly LessonSection[]): number {
  let minutes = 0;
  for (const s of sections) {
    if (s.type === "text") minutes += s.body.en.split(/\s+/).filter(Boolean).length / 170;
    else if (s.type === "code-demo") minutes += 2;
    else if (s.type === "lab") minutes += 7;
    else if (s.type === "quiz") minutes += s.questions.length;
    else if (s.type === "exercise") minutes += 6;
  }
  return Math.round(minutes / 5) * 5;
}
