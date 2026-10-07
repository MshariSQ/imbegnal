// GET /api/instructor/analytics?days=30   (role: instructor | admin)
// GET /api/admin/audit?limit=100          (role: admin)
//
// Everything is aggregated in SQL and bounded: `days` ≤ 365, at most MAX_EXERCISES exercises,
// at most MAX_STATE_ROWS synced study states scanned. Nothing returned carries a user id or
// a name: the instructor sees populations, not people.
import type { AuditEntry, ExerciseAnalytics, InstructorAnalytics, TrackAnalytics } from "../../../shared/api";
import { apiError, round1, sqlTime, toIso } from "../challenges/http";
import type { ChallengeDeps } from "../challenges/types";
import { type Env, json } from "../util";

export const MAX_DAYS = 365;
export const DEFAULT_DAYS = 30;
const MAX_EXERCISES = 200;
const MAX_STATE_ROWS = 20_000;
const DAY_MS = 86_400_000;
const round3 = (n: number) => Math.round(n * 1000) / 1000;

export function parseDays(raw: string | null): number | null {
  if (raw === null || raw === "") return DEFAULT_DAYS;
  if (!/^\d{1,4}$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 1 ? Math.min(n, MAX_DAYS) : null;
}

// ── Runs ──────────────────────────────────────────────────────────────────────

async function loadRuns(env: Env, since: string): Promise<InstructorAnalytics["runs"]> {
  const rows = await env.DB.prepare("SELECT lang, status, COUNT(*) AS n, COALESCE(SUM(success), 0) AS ok FROM lab_runs WHERE created_at >= ? GROUP BY lang, status")
    .bind(since)
    .all<{ lang: string; status: string; n: number; ok: number }>();
  const runs: InstructorAnalytics["runs"] = { total: 0, success: 0, byLang: {}, byStatus: {} };
  for (const r of rows.results) {
    runs.total += r.n;
    runs.success += r.ok;
    runs.byLang[r.lang] = (runs.byLang[r.lang] ?? 0) + r.n;
    runs.byStatus[r.status] = (runs.byStatus[r.status] ?? 0) + r.n;
  }
  return runs;
}

// ── Tracks (from the synced study state) ──────────────────────────────────────

// ?1 JSON array of every catalog lesson key · ?2 JSON object {track: lessonCount} · ?3 state-row cap
// Per (learner, track): lessons done (only catalog lessons count), first visit, last completion.
const PER_LEARNER = `
WITH st AS (
  SELECT github_id, data FROM user_state WHERE json_valid(data) ORDER BY updated_at DESC LIMIT ?3
), per AS (
  SELECT st.github_id AS uid, substr(j.key, 1, instr(j.key, '/') - 1) AS track,
         COUNT(DISTINCT CASE WHEN json_extract(j.value, '$.done') > 0 AND j.key IN (SELECT value FROM json_each(?1)) THEN j.key END) AS done,
         MIN(COALESCE(json_extract(j.value, '$.visited'), json_extract(j.value, '$.done'))) AS first_ts,
         MAX(json_extract(j.value, '$.done')) AS last_done
  FROM st, json_each(st.data, '$.lessons') j
  WHERE instr(j.key, '/') > 1
  GROUP BY st.github_id, track
)`;

async function loadTracks(env: Env, deps: ChallengeDeps): Promise<TrackAnalytics[]> {
  const tracks = deps.catalog.tracks.filter((t) => t.lessons.length > 0);
  const lessonKeys = JSON.stringify(tracks.flatMap((t) => t.lessons.map((l) => `${t.id}/${l}`)));
  const totals = JSON.stringify(Object.fromEntries(tracks.map((t) => [t.id, t.lessons.length])));

  const [counts, medians] = await Promise.all([
    env.DB.prepare(
      `${PER_LEARNER}
       SELECT per.track AS track, COUNT(*) AS learners, SUM(CASE WHEN per.done >= t.value THEN 1 ELSE 0 END) AS completed
       FROM per JOIN json_each(?2) t ON t.key = per.track GROUP BY per.track`,
    )
      .bind(lessonKeys, totals, MAX_STATE_ROWS)
      .all<{ track: string; learners: number; completed: number }>(),
    // Median minutes between the first visit and the last completion, over learners who finished.
    env.DB.prepare(
      `${PER_LEARNER}, dur AS (
         SELECT per.track AS track, (per.last_done - per.first_ts) / 60000.0 AS m
         FROM per JOIN json_each(?2) t ON t.key = per.track
         WHERE per.done >= t.value AND per.first_ts IS NOT NULL AND per.last_done >= per.first_ts
       ), ranked AS (
         SELECT track, m, ROW_NUMBER() OVER (PARTITION BY track ORDER BY m) AS rn, COUNT(*) OVER (PARTITION BY track) AS c FROM dur
       )
       SELECT track, AVG(m) AS median FROM ranked WHERE rn IN ((c + 1) / 2, (c + 2) / 2) GROUP BY track`,
    )
      .bind(lessonKeys, totals, MAX_STATE_ROWS)
      .all<{ track: string; median: number }>(),
  ]);
  const countMap = new Map(counts.results.map((r) => [r.track, r]));
  const medianMap = new Map(medians.results.map((r) => [r.track, r.median]));

  return tracks.map((t) => {
    const c = countMap.get(t.id);
    const learners = c?.learners ?? 0;
    const completed = c?.completed ?? 0;
    const row: TrackAnalytics = { track: t.id, learners, completed, completionRate: learners > 0 ? round3(completed / learners) : 0 };
    const median = medianMap.get(t.id);
    if (median !== undefined) row.medianMinutesToComplete = round1(median);
    return row;
  });
}

// ── Exercises (lab_runs of lessons and challenges) ────────────────────────────

// ?1 window start. Infrastructure outcomes are not the learner's attempt and are left out.
const EXERCISE_RUNS = `
WITH r AS (
  SELECT CASE ref_kind WHEN 'lesson' THEN track || '/' || lesson || '/' || exercise
                       WHEN 'challenge' THEN 'challenge:' || challenge_id END AS key,
         user_id, status, passed, run_ms, first_error
  FROM lab_runs
  WHERE created_at >= ?1 AND ref_kind IN ('lesson', 'challenge') AND status NOT IN ('running', 'internal_error', 'unsupported')
)`;

async function loadExercises(env: Env, since: string): Promise<ExerciseAnalytics[]> {
  const top = await env.DB.prepare(
    `${EXERCISE_RUNS}
     SELECT key, COUNT(*) AS attempts, COUNT(DISTINCT user_id) AS learners,
            COUNT(DISTINCT CASE WHEN passed = 1 THEN user_id END) AS passers
     FROM r WHERE key IS NOT NULL GROUP BY key ORDER BY attempts DESC, key LIMIT ?2`,
  )
    .bind(since, MAX_EXERCISES)
    .all<{ key: string; attempts: number; learners: number; passers: number }>();
  if (top.results.length === 0) return [];
  const keys = JSON.stringify(top.results.map((r) => r.key));

  const [medians, failures, errors] = await Promise.all([
    env.DB.prepare(
      `${EXERCISE_RUNS}
       SELECT key, AVG(run_ms) AS median FROM (
         SELECT key, run_ms, ROW_NUMBER() OVER (PARTITION BY key ORDER BY run_ms) AS rn, COUNT(*) OVER (PARTITION BY key) AS c
         FROM r WHERE run_ms IS NOT NULL AND key IN (SELECT value FROM json_each(?2))
       ) WHERE rn IN ((c + 1) / 2, (c + 2) / 2) GROUP BY key`,
    )
      .bind(since, keys)
      .all<{ key: string; median: number }>(),
    // Graded runs that failed, bucketed: a graded run whose program ran fine failed on its output.
    env.DB.prepare(
      `${EXERCISE_RUNS}
       SELECT key, bucket, COUNT(*) AS n FROM (
         SELECT key, CASE WHEN passed = 1 THEN NULL
                          WHEN passed = 0 THEN CASE WHEN status = 'ok' THEN 'wrong_output' ELSE status END
                          WHEN status <> 'ok' THEN status END AS bucket
         FROM r WHERE key IN (SELECT value FROM json_each(?2))
       ) WHERE bucket IS NOT NULL GROUP BY key, bucket`,
    )
      .bind(since, keys)
      .all<{ key: string; bucket: string; n: number }>(),
    // Most common first error lines, anonymised by construction (text + count only).
    env.DB.prepare(
      `${EXERCISE_RUNS}
       SELECT key, first_error, n FROM (
         SELECT key, first_error, COUNT(*) AS n,
                ROW_NUMBER() OVER (PARTITION BY key ORDER BY COUNT(*) DESC, first_error) AS rn
         FROM r WHERE key IN (SELECT value FROM json_each(?2)) AND first_error IS NOT NULL AND first_error <> ''
         GROUP BY key, first_error
       ) WHERE rn <= 5 ORDER BY key, rn`,
    )
      .bind(since, keys)
      .all<{ key: string; first_error: string; n: number }>(),
  ]);

  const medianMap = new Map(medians.results.map((r) => [r.key, r.median]));
  const failMap = new Map<string, Record<string, number>>();
  for (const f of failures.results) failMap.set(f.key, { ...failMap.get(f.key), [f.bucket]: f.n });
  const errMap = new Map<string, { text: string; count: number }[]>();
  for (const e of errors.results) errMap.set(e.key, [...(errMap.get(e.key) ?? []), { text: e.first_error, count: e.n }]);

  return top.results.map((r) => ({
    exercise: r.key,
    attempts: r.attempts,
    learners: r.learners,
    passRate: r.learners > 0 ? round3(r.passers / r.learners) : 0,
    medianRunMs: Math.round(medianMap.get(r.key) ?? 0),
    failures: failMap.get(r.key) ?? {},
    commonErrors: errMap.get(r.key) ?? [],
  }));
}

// ── Challenges ────────────────────────────────────────────────────────────────

async function loadChallenges(env: Env, deps: ChallengeDeps, since: string): Promise<InstructorAnalytics["challenges"]> {
  const ids = JSON.stringify(deps.registry.metas.map((m) => m.id));
  const [solves, attempts, medians] = await Promise.all([
    env.DB.prepare("SELECT challenge_id AS id, COUNT(*) AS n FROM challenge_solves WHERE solved_at >= ?1 AND challenge_id IN (SELECT value FROM json_each(?2)) GROUP BY challenge_id")
      .bind(since, ids)
      .all<{ id: string; n: number }>(),
    env.DB.prepare("SELECT challenge_id AS id, COUNT(*) AS n FROM challenge_attempts WHERE at >= ?1 AND challenge_id IN (SELECT value FROM json_each(?2)) GROUP BY challenge_id")
      .bind(since, ids)
      .all<{ id: string; n: number }>(),
    env.DB.prepare(
      `SELECT challenge_id AS id, AVG(minutes_to_solve) AS median FROM (
         SELECT challenge_id, minutes_to_solve,
                ROW_NUMBER() OVER (PARTITION BY challenge_id ORDER BY minutes_to_solve) AS rn,
                COUNT(*) OVER (PARTITION BY challenge_id) AS c
         FROM challenge_solves
         WHERE solved_at >= ?1 AND minutes_to_solve IS NOT NULL AND challenge_id IN (SELECT value FROM json_each(?2))
       ) WHERE rn IN ((c + 1) / 2, (c + 2) / 2) GROUP BY challenge_id`,
    )
      .bind(since, ids)
      .all<{ id: string; median: number }>(),
  ]);
  const solveMap = new Map(solves.results.map((r) => [r.id, r.n]));
  const attemptMap = new Map(attempts.results.map((r) => [r.id, r.n]));
  const medianMap = new Map(medians.results.map((r) => [r.id, r.median]));
  return deps.registry.metas.map((m) => {
    const row: InstructorAnalytics["challenges"][number] = { id: m.id, solves: solveMap.get(m.id) ?? 0, attempts: attemptMap.get(m.id) ?? 0 };
    const median = medianMap.get(m.id);
    if (median !== undefined) row.medianMinutesToSolve = round1(median);
    return row;
  });
}

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function handleInstructorAnalytics(req: Request, env: Env, origin: string, deps: ChallengeDeps): Promise<Response> {
  const role = await deps.requireRole(req, env, origin, "instructor");
  if (!role.ok) return role.response;
  const days = parseDays(new URL(req.url).searchParams.get("days"));
  if (days === null) return apiError(origin, 400, "invalid_request", `days must be an integer from 1 to ${MAX_DAYS}`);

  const now = deps.now();
  const since = sqlTime(now - days * DAY_MS);
  const [runs, tracks, exercises, challenges] = await Promise.all([loadRuns(env, since), loadTracks(env, deps), loadExercises(env, since), loadChallenges(env, deps, since)]);
  const body: InstructorAnalytics = { generatedAt: new Date(now).toISOString(), days, runs, tracks, exercises, challenges };
  return json(body, 200, origin, { "Cache-Control": "private, no-store" });
}

export async function handleAdminAudit(req: Request, env: Env, origin: string, deps: ChallengeDeps): Promise<Response> {
  const role = await deps.requireRole(req, env, origin, "admin");
  if (!role.ok) return role.response;
  const raw = new URL(req.url).searchParams.get("limit");
  let limit = 100;
  if (raw !== null && raw !== "") {
    if (!/^\d{1,4}$/.test(raw) || Number(raw) < 1) return apiError(origin, 400, "invalid_request", "limit must be an integer from 1 to 500");
    limit = Math.min(Number(raw), 500);
  }
  const rows = await env.DB.prepare("SELECT id, at, user_id, action, detail FROM audit_log ORDER BY id DESC LIMIT ?")
    .bind(limit)
    .all<{ id: number; at: string; user_id: string | null; action: string; detail: string }>();
  const entries: AuditEntry[] = rows.results.map((r) => {
    const e: AuditEntry = { id: r.id, at: toIso(r.at) ?? r.at, action: r.action, detail: r.detail };
    if (r.user_id) e.userId = r.user_id;
    return e;
  });
  return json(entries, 200, origin, { "Cache-Control": "private, no-store" });
}
