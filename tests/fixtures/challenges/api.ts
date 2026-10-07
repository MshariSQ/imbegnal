/**
 * Mocked Worker responses for the Challenges UI tests, built with the exact
 * shapes of shared/api.ts. Used by the unit tests and by the Playwright specs
 * (served through page.route).
 */
import type { ChallengeStat, ChallengesApiResponse, LeaderboardEntry, LeaderboardResponse, SubmitResponse } from "../../../shared/api";
import { fixtureChallenges } from "./challenges";

/** Fake flag accepted by the mocked Worker for "caesar-warmup" (unrelated to any real challenge). */
export const FIXTURE_FLAG = "IMB{future_fixture}";
/** Flag the mock treats as a first-blood solve on "hidden-in-logs". */
export const FIXTURE_FIRST_BLOOD_FLAG = "IMB{203.0.113.9}";

/** Fixed clock for tests: stats timestamps are relative to this. */
export const FIXTURE_NOW = Date.parse("2026-06-01T12:00:00Z");
const ago = (ms: number) => new Date(FIXTURE_NOW - ms).toISOString();
const HOUR = 3600_000;
const DAY = 24 * HOUR;

export function fixtureStats(signedIn: boolean): ChallengesApiResponse {
  const stats: ChallengeStat[] = [
    {
      id: "caesar-warmup",
      solves: 412,
      firstBlood: { name: "Layla Hassan", username: "layla", at: ago(40 * DAY) },
      medianSolveMinutes: 8,
      mine: signedIn ? { solved: true, points: 45, attempts: 2, solvedAt: ago(2 * DAY), hintsUsed: 1, minutesToSolve: 12 } : undefined,
    },
    { id: "hidden-in-logs", solves: 0 },
    { id: "packet-detective", solves: 57, firstBlood: { name: "Omar", at: ago(2 * HOUR) }, medianSolveMinutes: 31 },
    { id: "strings-and-symbols", solves: 9, firstBlood: { name: "ريم", at: ago(3 * DAY) }, medianSolveMinutes: 70 },
    { id: "fizzbuzz-sum", solves: 980, medianSolveMinutes: 6 },
    { id: "interval-merge", solves: 31 },
    { id: "sql-detective", solves: 140, mine: signedIn ? { solved: false, points: 0, attempts: 3, hintsUsed: 0 } : undefined },
    { id: "scheduler-sim", solves: 2, firstBlood: { name: "Noor Al-Din", username: "noor", at: ago(11 * DAY) } },
    { id: "css-specificity", solves: 301 },
  ];
  return { stats, me: signedIn ? { points: 45, solved: 1, rank: 128 } : undefined };
}

export const fixtureLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Layla Hassan", username: "layla", points: 2450, solves: 14, firstBloods: 3, lastSolveAt: ago(3 * HOUR) },
  { rank: 2, name: "Omar", username: "omar", points: 2210, solves: 13, firstBloods: 2, lastSolveAt: ago(1 * DAY) },
  { rank: 3, name: "ريم السالم", username: "reem", points: 1980, solves: 12, firstBloods: 1, lastSolveAt: ago(2 * DAY) },
  { rank: 4, name: "Noor Al-Din", username: "noor", points: 1500, solves: 9, firstBloods: 1, lastSolveAt: ago(5 * DAY) },
  { rank: 5, name: "Sam", points: 900, solves: 6, firstBloods: 0, lastSolveAt: ago(9 * DAY) },
  { rank: 6, name: "Huda", username: "huda", points: 640, solves: 5, firstBloods: 0 },
];

export const fixtureMe: LeaderboardEntry = { rank: 128, name: "Test Learner", username: "tester", points: 45, solves: 1, firstBloods: 0, lastSolveAt: ago(2 * DAY) };

export function fixtureLeaderboardResponse(opts: { track?: string; period: "all" | "week"; signedIn: boolean; meInside?: boolean }): LeaderboardResponse {
  let entries = opts.period === "week" ? fixtureLeaderboard.slice(0, 3).map((e, i) => ({ ...e, rank: i + 1, points: Math.round(e.points / 10) })) : fixtureLeaderboard;
  let me: LeaderboardEntry | undefined = opts.signedIn ? fixtureMe : undefined;
  if (opts.signedIn && opts.meInside) {
    // The learner sits inside the visible range (rank 5), so no pinned row is needed.
    me = { ...fixtureMe, rank: 5 };
    entries = entries.map((e) => (e.rank === 5 ? me! : e));
  }
  return { entries, me, track: opts.track ?? "all", period: opts.period };
}

export const correctResponse = (awarded: number, firstBlood = false): SubmitResponse => ({ correct: true, awarded, alreadySolved: false, firstBlood });
export const wrongResponse: SubmitResponse = { correct: false, awarded: 0, alreadySolved: false, firstBlood: false };

export const fixtureIds = fixtureChallenges.map((c) => c.id);
