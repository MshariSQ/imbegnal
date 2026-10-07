/**
 * Pure helpers for the hints UI. The public challenge data carries only each hint's COST; the text
 * of a hint reaches the browser exclusively from the Worker (POST .../hint, or `mine.revealedHints`
 * of GET /api/challenges for hints the learner already revealed). Unit-tested in
 * tests/unit/ctf-hints.test.ts.
 */
import type { RevealedHint } from "../../shared/api";
import type { ChallengeHint, L10nText } from "../../shared/challenges";

/** True for a well-formed bilingual text (server answers are validated before they reach the DOM). */
export const isL10nText = (v: unknown): v is L10nText =>
  typeof v === "object" && v !== null && typeof (v as L10nText).en === "string" && typeof (v as L10nText).ar === "string";

/** index -> text of the hints the Worker handed to this learner; malformed or out-of-range entries are dropped. */
export function textsByIndex(revealed: readonly RevealedHint[] | undefined, count: number): ReadonlyMap<number, L10nText> {
  const out = new Map<number, L10nText>();
  for (const r of revealed ?? []) {
    if (r && Number.isInteger(r.index) && r.index >= 0 && r.index < count && isL10nText(r.text)) out.set(r.index, r.text);
  }
  return out;
}

/** The hint to offer next: the first one whose text the learner does not hold yet; null when none is left. */
export function nextHintIndex(count: number, open: ReadonlyMap<number, unknown>): number | null {
  for (let i = 0; i < count; i++) if (!open.has(i)) return i;
  return null;
}

/** Add (or replace) one revealed hint, keeping the list sorted by index. */
export function mergeRevealed(list: readonly RevealedHint[] | undefined, hint: RevealedHint): RevealedHint[] {
  return [...(list ?? []).filter((h) => h.index !== hint.index), hint].sort((a, b) => a.index - b.index);
}

/** What a correct solve awards when exactly the hints at `open` were revealed (never below zero). */
export function awardWithHints(points: number, hints: readonly Pick<ChallengeHint, "cost">[], open: Iterable<number>): number {
  let cost = 0;
  for (const i of new Set(open)) if (i >= 0 && i < hints.length) cost += Math.max(0, hints[i].cost);
  return Math.max(0, points - cost);
}
