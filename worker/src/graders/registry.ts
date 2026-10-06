// Joins the PUBLIC challenge metadata (data/challenges) with the SERVER-ONLY graders
// (worker/src/graders/data). A challenge is playable only when both halves exist with the
// same id and the same kind; anything else is invisible to open/hint/submit.
import { challenges as publicChallenges } from "../../../data/challenges";
import type { ChallengeGrader, ChallengeMeta } from "../../../shared/challenges";
import { graders as serverGraders } from "./data";

export interface ChallengeEntry {
  meta: ChallengeMeta;
  grader: ChallengeGrader;
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

export function createRegistry(metas: readonly ChallengeMeta[], graders: readonly ChallengeGrader[]): ChallengeRegistry {
  // First definition wins: a duplicate id must never take the whole API down at import time
  // (tests/challenges.parity enforces uniqueness at authoring time).
  const metaById = new Map<string, ChallengeMeta>();
  for (const m of metas) if (!metaById.has(m.id)) metaById.set(m.id, m);
  const graderById = new Map<string, ChallengeGrader>();
  for (const g of graders) if (!graderById.has(g.id)) graderById.set(g.id, g);

  const entries = new Map<string, ChallengeEntry>();
  for (const [id, meta] of metaById) {
    const grader = graderById.get(id);
    if (grader && grader.kind === meta.kind) entries.set(id, { meta, grader });
  }

  return {
    metas: [...metaById.values()],
    meta: (id) => metaById.get(id),
    entry: (id) => entries.get(id),
    playableIds: (track) => [...entries.values()].filter((e) => !track || e.meta.track === track).map((e) => e.meta.id),
  };
}

export const defaultRegistry: ChallengeRegistry = createRegistry(publicChallenges, serverGraders);
