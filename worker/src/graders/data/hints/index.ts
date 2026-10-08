/**
 * SERVER-ONLY hint texts (never import this from the site). Matched to data/challenges/** by
 * challenge id: the public meta lists only each hint's cost, in the same order.
 */
import type { L10nText } from "../../../../../shared/challenges";
import { securityHints } from "./security";
import { systemsHints } from "./systems";
import { algorithmsHints } from "./algorithms";
import { webHints } from "./web";

export const challengeHints: Readonly<Record<string, readonly L10nText[]>> = {
  ...securityHints,
  ...systemsHints,
  ...algorithmsHints,
  ...webHints,
};
