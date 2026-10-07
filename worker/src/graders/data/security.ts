import type { ChallengeGrader } from "../../../../shared/challenges";

/**
 * SERVER-ONLY graders for the "security" group (tracks: cyber-security, reverse-engineering).
 * Matching meta: data/challenges/security.ts. Flags are stored as SHA-256 hashes only; the
 * reference solvers that derive them from the public puzzle files live in
 * tests/fixtures/challenge-references/security.ts.
 */
export const securityGraders: ChallengeGrader[] = [
  { id: "sec-auth-log-hunt", kind: "flag", flagHash: "9ed7785431fe10ad23d4490148cd5b08e080e9dcf0eaabafabf82018dfca551a" },
];
