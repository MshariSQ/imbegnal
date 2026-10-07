import type { ChallengeGrader } from "../../../../shared/challenges";

/**
 * SERVER-ONLY graders for the "security" group (tracks: cyber-security, reverse-engineering).
 * Matching meta: data/challenges/security.ts. Flags are stored as SHA-256 hashes only; the
 * reference solvers that derive them from the public puzzle files live in
 * tests/fixtures/challenge-references/security.ts.
 */
export const securityGraders: ChallengeGrader[] = [
  { id: "sec-auth-log-hunt", kind: "flag", flagHash: "9ed7785431fe10ad23d4490148cd5b08e080e9dcf0eaabafabf82018dfca551a" },
  { id: "sec-salted-wordlist", kind: "flag", flagHash: "c196e59a3804d35679817eae5ea277907b9794871c62c5608cf9d845bf7226ef" },
  { id: "sec-crypto-ladder", kind: "flag", flagHash: "4dd3a82180f7295fb70e9cb2331071995c7961e702140b4e5a6b56c715283156" },
];
