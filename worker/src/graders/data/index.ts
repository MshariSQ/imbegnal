/**
 * SERVER-ONLY grader configuration (flag hashes, hidden tests). Never import
 * this from the site. Matched to data/challenges/** by `id`.
 */
import type { ChallengeGrader } from "../../../../shared/challenges";
import { securityGraders } from "./security";
import { systemsGraders } from "./systems";
import { algorithmsGraders } from "./algorithms";
import { webGraders } from "./web";

export const graders: ChallengeGrader[] = [
  ...securityGraders,
  ...systemsGraders,
  ...algorithmsGraders,
  ...webGraders,
];
