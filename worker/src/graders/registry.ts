// Joins the PUBLIC challenge metadata (data/challenges) with the SERVER-ONLY graders
// (worker/src/graders/data) and hint texts (worker/src/graders/data/hints). A challenge is
// playable only when both halves exist with the same id and the same kind; anything else is
// invisible to open/hint/submit.
import { challenges as publicChallenges } from "../../../data/challenges";
import type { ChallengeGrader, ChallengeMeta, L10nText } from "../../../shared/challenges";
import { graders as serverGraders } from "./data";
import { challengeHints as serverHints } from "./data/hints";

/** Hint texts per challenge id (server-only; the public meta carries just each hint's cost). */
export type HintTexts = Readonly<Record<string, readonly L10nText[]>>;

export interface ChallengeEntry {
  meta: ChallengeMeta;
  grader: ChallengeGrader;
  /**
   * Hint texts in reveal order, parallel to `meta.hints` (worker/tests/challenges/parity.test.ts
   * fails when the counts differ; the hint endpoint fails closed on a missing text).
   */
  hints: readonly L10nText[];
}

export interface ChallengeRegistry {
  /** Every public challenge, in authoring order (stats are listed for all of them). */
  readonly metas: readonly ChallengeMeta[];
  meta(id: string): ChallengeMeta | undefined;
  /** The playable challenge (meta + grader of the same kind), or undefined. */
  entry(id: string): ChallengeEntry | undefined;
  /** Ids of playable challenges, optionally restricted to one track. */
  playableIds(track?: string): string[];
}

export function createRegistry(metas: readonly ChallengeMeta[], graders: readonly ChallengeGrader[], hints: HintTexts = {}): ChallengeRegistry {
  // First definition wins: a duplicate id must never take the whole API down at import time
  // (tests/challenges.parity enforces uniqueness at authoring time).
  const metaById = new Map<string, ChallengeMeta>();
  for (const m of metas) if (!metaById.has(m.id)) metaById.set(m.id, m);
  const graderById = new Map<string, ChallengeGrader>();
  for (const g of graders) if (!graderById.has(g.id)) graderById.set(g.id, g);

  const entries = new Map<string, ChallengeEntry>();
  for (const [id, meta] of metaById) {
    const grader = graderById.get(id);
    if (grader && grader.kind === meta.kind) entries.set(id, { meta, grader, hints: Object.hasOwn(hints, id) ? hints[id] : [] });
  }

  return {
    metas: [...metaById.values()],
    meta: (id) => metaById.get(id),
    entry: (id) => entries.get(id),
    playableIds: (track) => [...entries.values()].filter((e) => !track || e.meta.track === track).map((e) => e.meta.id),
  };
}

export const defaultRegistry: ChallengeRegistry = createRegistry(publicChallenges, serverGraders, serverHints);
