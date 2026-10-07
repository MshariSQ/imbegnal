/**
 * Merging live Worker stats with the static challenge list and the local
 * "solved" cache. Pure: unit-tested in tests/unit/ctf-stats.test.ts.
 */
import type { ChallengeStat } from "../../shared/api";
import type { L10nText } from "../../shared/challenges";
import { mergeRevealed } from "./hints";

export type StatsIndex = ReadonlyMap<string, ChallengeStat>;

export function indexStats(stats: readonly ChallengeStat[] | null | undefined): StatsIndex {
  return new Map((stats ?? []).map((s) => [s.id, s]));
}

/**
 * Which challenges the viewer has solved. The server is authoritative once its
 * answer is in (`serverStats` non-null and the viewer is signed in); until then
 * the local cache fills in so badges show instantly. Signed-out viewers have none.
 */
export function solvedSet(opts: {
  signedIn: boolean;
  serverStats: StatsIndex | null;
  cache: ReadonlySet<string>;
}): Set<string> {
  if (!opts.signedIn) return new Set();
  if (opts.serverStats) {
    const out = new Set<string>();
    for (const s of opts.serverStats.values()) if (s.mine?.solved) out.add(s.id);
    return out;
  }
  return new Set(opts.cache);
}

export const solvesOf = (index: StatsIndex | null, id: string): number => index?.get(id)?.solves ?? 0;

/** Optimistically reflect a correct submission in a stat (server reconciles on the next fetch). */
export function withSolve(
  stat: ChallengeStat | undefined,
  id: string,
  r: { awarded: number; firstBlood: boolean; alreadySolved: boolean },
  nowIso: string,
  firstBloodName?: { name: string; username?: string }
): ChallengeStat {
  const base: ChallengeStat = stat ?? { id, solves: 0 };
  if (r.alreadySolved) return base;
  const mine = base.mine;
  return {
    ...base,
    solves: base.solves + 1,
    firstBlood: r.firstBlood && firstBloodName ? { ...firstBloodName, at: nowIso } : base.firstBlood,
    mine: {
      solved: true,
      points: r.awarded,
      attempts: (mine?.attempts ?? 0) + 1,
      solvedAt: nowIso,
      hintsUsed: mine?.hintsUsed ?? 0,
      minutesToSolve: mine?.minutesToSolve,
      ...(mine?.revealedHints ? { revealedHints: mine.revealedHints } : {}),
    },
  };
}

/**
 * Reflect a revealed hint and keep the text the Worker answered with, so the panel can show it
 * again without asking (and charging) twice. Without `text` hints reveal in order, so `index + 1`
 * hints are now used. On a solved challenge nothing is charged: the counter does not move.
 */
export function withHint(stat: ChallengeStat | undefined, id: string, index: number, text?: L10nText): ChallengeStat {
  const base: ChallengeStat = stat ?? { id, solves: 0 };
  const m = base.mine;
  const revealedHints = text ? mergeRevealed(m?.revealedHints, { index, text }) : m?.revealedHints;
  const before = m?.hintsUsed ?? 0;
  const hintsUsed = m?.solved ? before : Math.max(before, text && revealedHints ? revealedHints.length : index + 1);
  return {
    ...base,
    mine: {
      solved: m?.solved ?? false,
      points: m?.points ?? 0,
      attempts: m?.attempts ?? 0,
      solvedAt: m?.solvedAt,
      hintsUsed,
      minutesToSolve: m?.minutesToSolve,
      ...(revealedHints ? { revealedHints } : {}),
    },
  };
}

/** Reflect a wrong attempt in the learner's counters. */
export function withAttempt(stat: ChallengeStat | undefined, id: string): ChallengeStat {
  const base: ChallengeStat = stat ?? { id, solves: 0 };
  const m = base.mine;
  return {
    ...base,
    mine: {
      solved: m?.solved ?? false,
      points: m?.points ?? 0,
      attempts: (m?.attempts ?? 0) + 1,
      solvedAt: m?.solvedAt,
      hintsUsed: m?.hintsUsed ?? 0,
      minutesToSolve: m?.minutesToSolve,
      ...(m?.revealedHints ? { revealedHints: m.revealedHints } : {}),
    },
  };
}
