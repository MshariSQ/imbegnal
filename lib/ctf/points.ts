/**
 * Points arithmetic for display. The Worker is the source of truth for what a
 * solve actually awards; these helpers only show the learner what a hint costs
 * and what is still on the table, so the UI can warn BEFORE a hint is revealed.
 */
import type { ChallengeHint } from "../../shared/challenges";

/** Total points deducted by the first `used` hints (hints are revealed in order). */
export function hintsCost(hints: readonly Pick<ChallengeHint, "cost">[], used: number): number {
  let sum = 0;
  for (let i = 0; i < Math.min(Math.max(0, used), hints.length); i++) sum += Math.max(0, hints[i].cost);
  return sum;
}

/** What a correct solve awards after the hints already used (never below zero). */
export function remainingAward(points: number, hints: readonly Pick<ChallengeHint, "cost">[], used: number): number {
  return Math.max(0, points - hintsCost(hints, used));
}

/** What would remain if the next hint were revealed too; `null` when there is no next hint. */
export function awardAfterNextHint(points: number, hints: readonly Pick<ChallengeHint, "cost">[], used: number): number | null {
  return used >= hints.length ? null : remainingAward(points, hints, used + 1);
}

/** Clamp a server-reported count into [0, max] (defends the UI against stale/odd stats). */
export function clampCount(n: number | undefined, max: number): number {
  return Math.min(Math.max(0, Math.floor(n ?? 0)), max);
}
