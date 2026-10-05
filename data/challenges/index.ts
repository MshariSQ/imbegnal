/**
 * PUBLIC challenge metadata (shipped to the browser). Server-only graders live in
 * worker/src/graders/data/ and are matched by `id`. See shared/challenges.ts.
 */
import type { ChallengeMeta } from "../../shared/challenges";
import { securityChallenges } from "./security";
import { systemsChallenges } from "./systems";
import { algorithmsChallenges } from "./algorithms";
import { webChallenges } from "./web";

export const challenges: ChallengeMeta[] = [
  ...securityChallenges,
  ...systemsChallenges,
  ...algorithmsChallenges,
  ...webChallenges,
];

export function getChallenge(id: string): ChallengeMeta | undefined {
  return challenges.find((c) => c.id === id);
}
