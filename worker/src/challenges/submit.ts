// POST /api/challenges/:id/submit  (SubmitRequest → SubmitResponse)
//
//  flag          constant-time hash comparison; every wrong guess is logged (never the guess) and
//                rate limited per learner and challenge; sustained guessing raises an abuse signal
//  output/code   one quota unit for the WHOLE submission, tests run on the runner, infrastructure
//                failures refund the unit and answer 503
//  award         points = max(0, meta.points - Σ revealed hint costs); first blood is decided by the
//                unique partial index; re-solving awards nothing (idempotent)
import type { SubmitResponse } from "../../../shared/api";
import { SUBMIT_LIMITS, type ChallengeMeta, type FlagGrader, type HarnessGrader, type OutputGrader } from "../../../shared/challenges";
import { LANG_IDS, type LangId } from "../../../shared/languages";
import { buildProgram, gradeFlag, gradeTests } from "../graders/engine";
import { looksLikeNetworkProbe } from "../lab/suspicious";
import { type Env, json } from "../util";
import { apiError, parseSqlTime, readBoundedJson, requireLiveUser, sqlTime } from "./http";
import { awardFor } from "./progress";
import type { ChallengeDeps } from "./types";

/** Run outcomes that count as resource abuse signals (same set as /api/lab/run). */
const RESOURCE_STATUSES: ReadonlySet<string> = new Set(["timeout", "memory_limit", "output_limit"]);

/** JSON escaping can inflate source code; the code itself is bounded separately (bytes). */
const MAX_BODY_BYTES = 256 * 1024;

/** Wrong flag guesses allowed per learner (a guess beyond these is refused, not graded). */
export const FLAG_LIMITS = { perMinute: 5, perHour: 30, perHourAllChallenges: 120 } as const;
const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;

const INSERT_SOLVE = `
INSERT OR IGNORE INTO challenge_solves (challenge_id, user_id, points, first_blood, minutes_to_solve, solved_at)
SELECT ?1, ?2, ?3, ?4, ?5, ?6
WHERE NOT EXISTS (SELECT 1 FROM challenge_solves WHERE challenge_id = ?1 AND user_id = ?2)`;

const noStore = { "Cache-Control": "no-store" };

// ── Attempt log + brute-force limits ──────────────────────────────────────────

async function recordAttempt(env: Env, userId: string, challengeId: string, atMs: number, correct: boolean): Promise<number> {
  const res = await env.DB.prepare("INSERT INTO challenge_attempts (user_id, challenge_id, correct, at) VALUES (?, ?, ?, ?)")
    .bind(userId, challengeId, correct ? 1 : 0, sqlTime(atMs))
    .run();
  return Number(res.meta.last_row_id);
}

async function bumpAttempts(env: Env, userId: string, challengeId: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO challenge_progress (user_id, challenge_id, attempts) VALUES (?1, ?2, 1)
     ON CONFLICT(user_id, challenge_id) DO UPDATE SET attempts = attempts + 1`,
  )
    .bind(userId, challengeId)
    .run();
}

interface WindowCounts {
  minute: number | null;
  minute_oldest: string | null;
  hour: number | null;
  hour_oldest: string | null;
  user_hour: number | null;
  user_oldest: string | null;
}

/**
 * The provisional attempt row is inserted BEFORE counting, so N concurrent guesses cannot all
 * slip under the limit between a check and an insert: each sees every row inserted before it.
 * Returns the seconds to wait when the guess must be refused.
 */
async function flagRetryAfter(env: Env, userId: string, challengeId: string, nowMs: number): Promise<number | null> {
  const row = await env.DB.prepare(
    `SELECT SUM(CASE WHEN challenge_id = ?2 AND at >= ?3 THEN 1 ELSE 0 END) AS minute,
            MIN(CASE WHEN challenge_id = ?2 AND at >= ?3 THEN at END) AS minute_oldest,
            SUM(CASE WHEN challenge_id = ?2 THEN 1 ELSE 0 END) AS hour,
            MIN(CASE WHEN challenge_id = ?2 THEN at END) AS hour_oldest,
            COUNT(*) AS user_hour, MIN(at) AS user_oldest
     FROM challenge_attempts WHERE user_id = ?1 AND correct = 0 AND at >= ?4`,
  )
    .bind(userId, challengeId, sqlTime(nowMs - MINUTE_MS), sqlTime(nowMs - HOUR_MS))
    .first<WindowCounts>();
  if (!row) return null;
  const wait = (oldest: string | null, windowMs: number) => {
    const t = oldest ? parseSqlTime(oldest) : NaN;
    return Number.isNaN(t) ? Math.ceil(windowMs / 1000) : Math.max(1, Math.ceil((t + windowMs - nowMs) / 1000));
  };
  let retry = 0;
  if ((row.minute ?? 0) > FLAG_LIMITS.perMinute) retry = Math.max(retry, wait(row.minute_oldest, MINUTE_MS));
  if ((row.hour ?? 0) > FLAG_LIMITS.perHour) retry = Math.max(retry, wait(row.hour_oldest, HOUR_MS));
  if ((row.user_hour ?? 0) > FLAG_LIMITS.perHourAllChallenges) retry = Math.max(retry, wait(row.user_oldest, HOUR_MS));
  return retry > 0 ? retry : null;
}

// ── Awarding ──────────────────────────────────────────────────────────────────

const round2 = (n: number) => Math.round(n * 100) / 100;

async function awardSolve(env: Env, deps: ChallengeDeps, userId: string, meta: ChallengeMeta): Promise<{ awarded: number; firstBlood: boolean; alreadySolved: boolean }> {
  const prog = await env.DB.prepare("SELECT first_opened_at, hint_mask FROM challenge_progress WHERE user_id = ? AND challenge_id = ?")
    .bind(userId, meta.id)
    .first<{ first_opened_at: string | null; hint_mask: number }>();
  const points = awardFor(meta, prog?.hint_mask ?? 0);
  const nowMs = deps.now();
  const opened = prog?.first_opened_at ? parseSqlTime(prog.first_opened_at) : NaN;
  const minutes = Number.isNaN(opened) ? null : Math.max(0, round2((nowMs - opened) / MINUTE_MS));
  const at = sqlTime(nowMs);

  // Try to be first: the partial unique index lets exactly one row per challenge carry
  // first_blood = 1; OR IGNORE turns losing the race (or an existing solve) into 0 changes.
  const first = await env.DB.prepare(INSERT_SOLVE).bind(meta.id, userId, points, 1, minutes, at).run();
  let firstBlood = first.meta.changes === 1;
  let inserted = firstBlood;
  if (!firstBlood) {
    // Either somebody else already holds first blood, or this learner has solved it before.
    const second = await env.DB.prepare(INSERT_SOLVE).bind(meta.id, userId, points, 0, minutes, at).run();
    inserted = second.meta.changes === 1;
    firstBlood = false;
  }

  // Mirror the booked solve into the learner's progress row (also repairs a row lost to a crash).
  const solve = await env.DB.prepare("SELECT points, solved_at FROM challenge_solves WHERE challenge_id = ? AND user_id = ?")
    .bind(meta.id, userId)
    .first<{ points: number; solved_at: string }>();
  if (solve) {
    await env.DB.prepare(
      `INSERT INTO challenge_progress (user_id, challenge_id, solved_at, points) VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(user_id, challenge_id) DO UPDATE SET
         solved_at = COALESCE(solved_at, excluded.solved_at),
         points = CASE WHEN solved_at IS NULL THEN excluded.points ELSE points END`,
    )
      .bind(userId, meta.id, solve.solved_at, solve.points)
      .run();
  }
  return { awarded: inserted ? points : 0, firstBlood, alreadySolved: !inserted };
}

async function hasSolved(env: Env, userId: string, challengeId: string): Promise<boolean> {
  const row = await env.DB.prepare("SELECT 1 AS ok FROM challenge_solves WHERE challenge_id = ? AND user_id = ?").bind(challengeId, userId).first<{ ok: number }>();
  return row !== null;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function handleSubmit(req: Request, env: Env, origin: string, id: string, deps: ChallengeDeps): Promise<Response> {
  const auth = await requireLiveUser(req, env, origin);
  if (!auth.ok) return auth.response;
  const entry = deps.registry.entry(id);
  if (!entry) return apiError(origin, 404, "not_found");

  const read = await readBoundedJson(req, MAX_BODY_BYTES);
  if (!read.ok) return apiError(origin, 400, "invalid_request", read.reason === "too_large" ? "request body too large" : "expected a JSON body");

  const { meta, grader } = entry;
  if (grader.kind === "flag") return submitFlag(env, origin, deps, auth.user.sub, meta, grader, read.body);
  return submitCode(env, origin, deps, auth.user, meta, grader, read.body);
}

async function submitFlag(env: Env, origin: string, deps: ChallengeDeps, userId: string, meta: ChallengeMeta, grader: FlagGrader, body: Record<string, unknown>): Promise<Response> {
  const flag = body.flag;
  if (typeof flag !== "string" || flag.trim().length === 0) return apiError(origin, 400, "invalid_request", "flag is required");
  if (flag.length > SUBMIT_LIMITS.flagMaxChars) return apiError(origin, 400, "invalid_request", "flag is too long");
  if (await deps.abuse.isSuspended(env, userId)) return apiError(origin, 403, "account_suspended", "This account is suspended.");

  const nowMs = deps.now();
  const attemptId = await recordAttempt(env, userId, meta.id, nowMs, false);
  const retryAfter = await flagRetryAfter(env, userId, meta.id, nowMs);
  if (retryAfter !== null) {
    // Refused before grading, so the answer to a throttled guess reveals nothing.
    await deps.abuse.recordAbuseSignal(env, userId, "bruteforce", `challenge=${meta.id} too many wrong flags`).catch(() => undefined);
    return apiError(origin, 429, "rate_limited", "Too many wrong attempts. Wait a moment before trying again.", { scope: "rate", retryAfterSec: retryAfter }, { "Retry-After": String(retryAfter) });
  }
  await bumpAttempts(env, userId, meta.id);

  const correct = await gradeFlag(grader, flag);
  if (!correct) {
    const body: SubmitResponse = { correct: false, awarded: 0, alreadySolved: await hasSolved(env, userId, meta.id), firstBlood: false };
    return json(body, 200, origin, noStore);
  }
  await env.DB.prepare("UPDATE challenge_attempts SET correct = 1 WHERE id = ?").bind(attemptId).run();
  const award = await awardSolve(env, deps, userId, meta);
  const res: SubmitResponse = { correct: true, awarded: award.awarded, alreadySolved: award.alreadySolved, firstBlood: award.firstBlood };
  return json(res, 200, origin, noStore);
}

async function submitCode(
  env: Env,
  origin: string,
  deps: ChallengeDeps,
  user: { sub: string; username?: string; name?: string },
  meta: ChallengeMeta,
  grader: OutputGrader | HarnessGrader,
  body: Record<string, unknown>,
): Promise<Response> {
  const lang = body.lang;
  const code = body.code;
  if (typeof lang !== "string" || !(LANG_IDS as readonly string[]).includes(lang)) return apiError(origin, 400, "invalid_request", "unknown language");
  const allowed: readonly string[] = meta.allowedLangs ?? LANG_IDS;
  if (!allowed.includes(lang)) return apiError(origin, 400, "invalid_request", "language not allowed for this challenge");
  if (typeof code !== "string" || code.trim().length === 0) return apiError(origin, 400, "invalid_request", "code is required");
  if (new TextEncoder().encode(code).length > SUBMIT_LIMITS.codeMaxBytes) return apiError(origin, 400, "invalid_request", "code is too large");

  const built = buildProgram(grader, lang as LangId, code);
  if (!built.ok) {
    if (built.reason === "misconfigured") return apiError(origin, 500, "challenge_misconfigured");
    return apiError(origin, 400, "invalid_request", built.reason === "unsupported_language" ? "no harness for this language" : "code contains a reserved marker");
  }

  const reserved = await deps.lab.reserveQuota(env, user, 1);
  if (!reserved.ok) return reserved.response;
  const { reservation } = reserved;
  let open = true; // the reservation is settled exactly once
  const settle = async (outcome: Parameters<ChallengeDeps["lab"]["settleQuota"]>[2]) => {
    open = false;
    return deps.lab.settleQuota(env, reservation, outcome);
  };

  try {
    const outcome = await gradeTests(grader, lang as LangId, built.program, (r) => deps.lab.runOnRunner(env, r), { now: deps.now });
    if (outcome.kind === "misconfigured") {
      await settle("rejected");
      return apiError(origin, 500, "challenge_misconfigured");
    }
    if (outcome.kind === "infrastructure") {
      await settle(outcome.status); // refunds the unit
      return apiError(origin, 503, "runner_unavailable", outcome.status === "unsupported" ? "This language is not available on the runner right now." : "The code runner is unavailable. Your quota was not charged.");
    }

    // The same advisory abuse signals as /api/lab/run: a challenge must not be an unmonitored
    // path to the sandbox (resource exhaustion, network probes). recordAbuseSignal never throws.
    if (RESOURCE_STATUSES.has(outcome.quotaOutcome)) {
      await deps.abuse.recordAbuseSignal(env, user.sub, "resource", `${lang} challenge run hit ${outcome.quotaOutcome}`);
    }
    if (looksLikeNetworkProbe(code)) {
      await deps.abuse.recordAbuseSignal(env, user.sub, "network_probe", `${lang} challenge code matched a network-probe signature`);
    }

    const quota = await settle(outcome.quotaOutcome);
    const passed = outcome.grade.passed;
    try {
      // stdin is deliberately not stored: it is hidden-test data.
      await deps.lab.recordRun(env, { userId: user.sub, ref: { kind: "challenge", id: meta.id }, lang: lang as LangId, result: outcome.result, passed, code });
    } catch (e) {
      console.error("challenge run log failed", e instanceof Error ? e.name : "error");
    }
    await recordAttempt(env, user.sub, meta.id, deps.now(), passed);
    await bumpAttempts(env, user.sub, meta.id);

    const res: SubmitResponse = {
      correct: passed,
      awarded: 0,
      alreadySolved: false,
      firstBlood: false,
      feedback: outcome.grade.feedback,
      grade: outcome.grade,
      result: deps.lab.toPublicResult(outcome.result),
      quota,
    };
    if (passed) Object.assign(res, await awardSolve(env, deps, user.sub, meta));
    else res.alreadySolved = await hasSolved(env, user.sub, meta.id);
    return json(res, 200, origin, noStore);
  } catch (e) {
    if (open) await deps.lab.settleQuota(env, reservation, "rejected").catch(() => undefined);
    throw e;
  }
}
