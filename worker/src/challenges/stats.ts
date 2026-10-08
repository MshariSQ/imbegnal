// GET /api/challenges — per-challenge stats for the list page (+ the caller's own progress).
// Optional auth: an anonymous or stale-token caller gets the public numbers, never a 401.
import type { ChallengesApiResponse } from "../../../shared/api";
import type { ChallengeMine } from "../../../shared/challenges";
import { type Env, json } from "../util";
import { optionalUser, round1, toIso } from "./http";
import { loadLeaderboard } from "./leaderboard";
import { readableHints } from "./progress";
import type { ChallengeDeps } from "./types";

/** A median needs a few data points before it says anything about difficulty. */
const MIN_SOLVES_FOR_MEDIAN = 3;

interface SolveCount { challenge_id: string; n: number }
interface BloodRow { challenge_id: string; solved_at: string; name: string | null; username: string | null }
interface MedianRow { challenge_id: string; median: number }
interface MineRow {
  challenge_id: string;
  attempts: number;
  hints_used: number;
  hint_mask: number;
  solved_at: string | null;
  points: number;
  s_points: number | null;
  s_at: string | null;
  s_minutes: number | null;
}

export async function handleChallengeList(req: Request, env: Env, origin: string, deps: ChallengeDeps): Promise<Response> {
  const user = await optionalUser(req, env);
  const ids = deps.registry.metas.map((m) => m.id);
  const idsJson = JSON.stringify(ids);

  const [solves, blood, medians] = await Promise.all([
    env.DB.prepare("SELECT challenge_id, COUNT(*) AS n FROM challenge_solves WHERE challenge_id IN (SELECT value FROM json_each(?1)) GROUP BY challenge_id")
      .bind(idsJson)
      .all<SolveCount>(),
    env.DB.prepare(
      `SELECT s.challenge_id, s.solved_at, u.name, u.username
       FROM challenge_solves s LEFT JOIN users u ON u.github_id = s.user_id
       WHERE s.first_blood = 1 AND s.challenge_id IN (SELECT value FROM json_each(?1))`,
    )
      .bind(idsJson)
      .all<BloodRow>(),
    // Median per challenge (window functions): the middle one or the mean of the two middle ones.
    env.DB.prepare(
      `SELECT challenge_id, AVG(minutes_to_solve) AS median FROM (
         SELECT challenge_id, minutes_to_solve,
                ROW_NUMBER() OVER (PARTITION BY challenge_id ORDER BY minutes_to_solve) AS rn,
                COUNT(*) OVER (PARTITION BY challenge_id) AS c
         FROM challenge_solves
         WHERE minutes_to_solve IS NOT NULL AND challenge_id IN (SELECT value FROM json_each(?1))
       ) WHERE c >= ?2 AND rn IN ((c + 1) / 2, (c + 2) / 2)
       GROUP BY challenge_id`,
    )
      .bind(idsJson, MIN_SOLVES_FOR_MEDIAN)
      .all<MedianRow>(),
  ]);

  const solveMap = new Map(solves.results.map((r) => [r.challenge_id, r.n]));
  const bloodMap = new Map(blood.results.map((r) => [r.challenge_id, r]));
  const medianMap = new Map(medians.results.map((r) => [r.challenge_id, r.median]));

  const mineMap = new Map<string, ChallengeMine>();
  let me: ChallengesApiResponse["me"];
  if (user) {
    const mine = await env.DB.prepare(
      `SELECT p.challenge_id, p.attempts, p.hints_used, p.hint_mask, p.solved_at, p.points,
              s.points AS s_points, s.solved_at AS s_at, s.minutes_to_solve AS s_minutes
       FROM challenge_progress p
       LEFT JOIN challenge_solves s ON s.challenge_id = p.challenge_id AND s.user_id = p.user_id
       WHERE p.user_id = ?1 AND p.challenge_id IN (SELECT value FROM json_each(?2))`,
    )
      .bind(user.sub, idsJson)
      .all<MineRow>();
    for (const r of mine.results) {
      const solved = r.s_at !== null || r.solved_at !== null;
      const m: ChallengeMine = {
        solved,
        points: r.s_points ?? r.points,
        attempts: r.attempts,
        hintsUsed: r.hints_used,
        hintMask: r.hint_mask,
      };
      // Only the hints this learner revealed (all of them once solved): the text of an unrevealed
      // hint of an unsolved challenge must never leave the Worker.
      const entry = deps.registry.entry(r.challenge_id);
      const revealedHints = entry ? readableHints(entry, r.hint_mask, solved) : [];
      if (revealedHints.length > 0) m.revealedHints = revealedHints;
      const at = toIso(r.s_at ?? r.solved_at);
      if (at) m.solvedAt = at;
      if (r.s_minutes !== null) m.minutesToSolve = round1(r.s_minutes);
      mineMap.set(r.challenge_id, m);
    }
    // Rank on the all-time, all-tracks board (same ordering as /api/leaderboard).
    const board = await loadLeaderboard(env, deps.registry.playableIds(), null, user.sub);
    me = board.me ? { points: board.me.points, solved: board.me.solves, rank: board.me.rank } : { points: 0, solved: 0 };
  }

  const stats: ChallengesApiResponse["stats"] = ids.map((id) => {
    const stat: ChallengesApiResponse["stats"][number] = { id, solves: solveMap.get(id) ?? 0 };
    const fb = bloodMap.get(id);
    if (fb) {
      stat.firstBlood = { name: fb.name?.trim() || fb.username || "Learner", at: toIso(fb.solved_at) ?? fb.solved_at };
      if (fb.username) stat.firstBlood.username = fb.username;
    }
    const median = medianMap.get(id);
    if (median !== undefined && stat.solves >= MIN_SOLVES_FOR_MEDIAN) stat.medianSolveMinutes = round1(median);
    const mine = mineMap.get(id);
    if (mine) stat.mine = mine;
    return stat;
  });

  const body: ChallengesApiResponse = me ? { stats, me } : { stats };
  return json(body, 200, origin, {
    "Cache-Control": user ? "private, no-store" : "public, max-age=30",
    Vary: "Origin, Authorization",
  });
}
