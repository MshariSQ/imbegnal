import type { Lang, Tx } from "./i18n";
import { plural } from "./ctf/format";

/**
 * Counts with the CLDR plural form of the dictionary's language (`tx.common.counts`). Arabic has
 * six forms: "درس واحد", "درسان", "3 دروس" (3-10), "11 درساً" (11-99), "100 درس"; English has two.
 */
const locale = (tx: Tx) => tx.common.locale as Lang;

/** "~5h" / "حوالي 5 ساعات" — localized, no bidi-reordered tilde. */
export function hoursLabel(tx: Tx, n: number): string {
  return plural(tx.common.counts.hours, n, locale(tx));
}

/** "1 lesson" / "3 lessons" / "11 درساً" — avoids "1 lessons" and "11 دروس". */
export function countLabel(tx: Tx, kind: "lesson" | "exercise" | "quiz", n: number): string {
  return plural(tx.common.counts[kind], n, locale(tx));
}
