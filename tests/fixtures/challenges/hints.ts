/**
 * Hint TEXTS of the fixtures, the stand-in for worker/src/graders/data/hints. Kept in their own
 * module on purpose: the fixture site build imports challenges.ts only, so like the real data the
 * public fixture meta lists only each hint's cost and the mocked Worker
 * (tests/e2e/challenges/harness.ts) is the only thing that hands a text to the page.
 */
import type { L10nText } from "../../../shared/challenges";

export const fixtureHintTexts: Record<string, L10nText[]> = {
  "caesar-warmup": [
    { en: "Count how many letters 'Wkh' is away from a common three-letter English word.", ar: "قارن 'Wkh' بكلمة إنجليزية شائعة من ثلاثة أحرف." },
    { en: "The shift is the same for every letter, so only 25 keys exist.", ar: "الإزاحة نفسها لكل الحروف، لذا يوجد 25 مفتاحًا فقط." },
  ],
  "hidden-in-logs": [{ en: "Filter on the word Failed, then count by address.", ar: "صفِّ السجل بكلمة Failed ثم عُدّ حسب العنوان." }],
};
