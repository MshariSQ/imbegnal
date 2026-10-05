/**
 * PUBLIC challenge metadata (shipped to the browser). Server-only graders live in
 * worker/src/graders/data/ and are matched by `id`. See shared/challenges.ts.
 */
import type { ChallengeMeta } from "../../shared/challenges";

export const challenges: ChallengeMeta[] = [];

export function getChallenge(id: string): ChallengeMeta | undefined {
  return challenges.find((c) => c.id === id);
}
