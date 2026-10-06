// GET /api/leaderboard?track=&period=all|week
//
// points = Σ points awarded by challenge_solves (already net of hint costs). Ordering is
// points DESC, then the EARLIER last solve wins a tie (whoever reached the total first),
// then user id so ranks are a stable 1..n. Names come from users.name/username only.
import type { LeaderboardEntry, LeaderboardResponse } from "../../../shared/api";
import { type Env, json } from "../util";
import { apiError, optionalUser, sqlTime, toIso } from "./http";
import type { ChallengeDeps } from "./types";

export const LEADERBOARD_CAP = 100;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface RankedRow {
  rnk: number;
  user_id: string;
  points: number;
  solves: number;
  first_bloods: number;
  last_solve: string | null;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
}

// ?1 playable challenge ids (JSON array) · ?2 period start or NULL · ?3 rank cap · ?4 caller id
// The caller's own row is returned even beyond the cap so `me` always carries the true rank.
const RANKED_SQL = `
WITH agg AS (
  SELECT user_id, SUM(points) AS points, COUNT(*) AS solves, SUM(first_blood) AS first_bloods, MAX(solved_at) AS last_solve
  FROM challenge_solves
  WHERE challenge_id IN (SELECT value FROM json_each(?1)) AND (?2 IS NULL OR solved_at >= ?2)
  GROUP BY user_id
), ranked AS (
  SELECT agg.*, ROW_NUMBER() OVER (ORDER BY agg.points DESC, agg.last_solve ASC, agg.user_id ASC) AS rnk
  FROM agg JOIN users uu ON uu.github_id = agg.user_id
)
SELECT r.rnk, r.user_id, r.points, r.solves, r.first_bloods, r.last_solve, u.name, u.username, u.avatar_url
FROM ranked r JOIN users u ON u.github_id = r.user_id
WHERE r.rnk <= ?3 OR r.user_id = ?4
ORDER BY r.rnk`;

function toEntry(r: RankedRow): LeaderboardEntry {
  const entry: LeaderboardEntry = {
    rank: r.rnk,
    name: r.name?.trim() || r.username || "Learner",
    points: r.points,
    solves: r.solves,
    firstBloods: r.first_bloods,
  };
  if (r.username) entry.username = r.username;
  if (r.avatar_url) entry.avatar = r.avatar_url;
  const last = toIso(r.last_solve);
  if (last) entry.lastSolveAt = last;
  return entry;
}

/** Ranked rows for `ids`; `since` null = all time. `meId` null = anonymous caller. */
export async function loadLeaderboard(
  env: Env,
  ids: string[],
  since: string | null,
  meId: string | null,
): Promise<{ entries: LeaderboardEntry[]; me?: LeaderboardEntry }> {
  const rows = await env.DB.prepare(RANKED_SQL).bind(JSON.stringify(ids), since, LEADERBOARD_CAP, meId ?? "").all<RankedRow>();
  const entries: LeaderboardEntry[] = [];
  let me: LeaderboardEntry | undefined;
  for (const r of rows.results) {
    const e = toEntry(r);
    if (e.rank <= LEADERBOARD_CAP) entries.push(e);
    if (meId !== null && r.user_id === meId) me = e;
  }
  return me ? { entries, me } : { entries };
}

export async function handleLeaderboard(req: Request, env: Env, origin: string, deps: ChallengeDeps): Promise<Response> {
  const url = new URL(req.url);
  const track = url.searchParams.get("track") || "all";
  const period = url.searchParams.get("period") || "all";
  if (track !== "all" && !deps.roadmapIds.has(track)) return apiError(origin, 400, "invalid_request", "unknown track");
  if (period !== "all" && period !== "week") return apiError(origin, 400, "invalid_request", "period must be all or week");

  const user = await optionalUser(req, env);
  const since = period === "week" ? sqlTime(deps.now() - WEEK_MS) : null;
  const board = await loadLeaderboard(env, deps.registry.playableIds(track === "all" ? undefined : track), since, user?.sub ?? null);
  const body: LeaderboardResponse = { ...board, track, period };
  // Anonymous boards are identical for everyone: let the edge hold them briefly.
  return json(body, 200, origin, {
    "Cache-Control": user ? "private, no-store" : "public, max-age=30",
    Vary: "Origin, Authorization",
  });
}
