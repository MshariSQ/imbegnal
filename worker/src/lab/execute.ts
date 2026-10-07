// Quota, run logging and result shaping for Code Lab runs.
//
// Quota model (docs/CODE_LAB.md): a run is *reserved* before it executes and
// settled after. Order of checks: account status -> per-minute rate ->
// concurrency -> daily user quota -> global daily cap. Infrastructure failures
// are refunded; user-caused outcomes (compile/runtime error, timeout, memory)
// keep the charge. The pattern matches worker/src/ai.ts: atomic
// INSERT ... ON CONFLICT DO UPDATE ... RETURNING, compare, revert on overflow.
import type { LangId } from "../../../shared/languages";
import type { Plan, PublicRunResult, QuotaError, QuotaInfo, RunRef } from "../../../shared/api";
import type { RunResult, RunStatus } from "../../../shared/protocol";
import { evaluateSuspension, recordAbuseSignal } from "../abuse";
import type { Env } from "../util";
import {
  GLOBAL_BUCKET,
  RATE_WINDOW_SECONDS,
  RUNNING_STALE_SECONDS,
  STORE_CODE_CHARS,
  STORE_OUTPUT_CHARS,
  STORE_STDIN_CHARS,
  nextResetIso,
  planOf,
  quotaLimits,
  utcDay,
} from "./config";
import { reply, type LabUser } from "./http";

export { runOnRunner } from "./runner";
export type { LabUser } from "./http";

export interface Reservation {
  userId: string;
  plan: Plan;
  day: string;
  units: number;
  /** Id of the in-flight lab_runs row; pass it to recordRun so the row is completed in place. */
  runId: string;
}

export type ReserveResult = { ok: true; reservation: Reservation; plan: Plan } | { ok: false; response: Response };

/** Outcomes whose reserved units are given back. */
const REFUNDED: ReadonlySet<RunStatus | "rejected"> = new Set(["internal_error", "unsupported", "rejected"]);

async function bump(env: Env, id: string, day: string, units: number): Promise<number> {
  const row = await env.DB.prepare(
    `INSERT INTO lab_usage (user_id, day, count) VALUES (?, ?, ?)
     ON CONFLICT(user_id, day) DO UPDATE SET count = count + excluded.count
     RETURNING count`,
  ).bind(id, day, units).first<{ count: number }>();
  return row?.count ?? units;
}

async function unbump(env: Env, id: string, day: string, units: number): Promise<void> {
  await env.DB.prepare("UPDATE lab_usage SET count = MAX(count - ?, 0) WHERE user_id = ? AND day = ?").bind(units, id, day).run();
}

async function dropReservation(env: Env, runId: string): Promise<void> {
  await env.DB.prepare("DELETE FROM lab_runs WHERE id = ? AND status = 'running'").bind(runId).run();
}

/**
 * Reserves `units` runs for the user. `origin` is only used for the CORS headers of a
 * rejection response (pass the request's Origin so browsers on localhost/E2E origins can read it).
 */
export async function reserveQuota(env: Env, user: LabUser, units = 1, origin = ""): Promise<ReserveResult> {
  const deny = (error: string, status: number, message: string, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}): ReserveResult => ({
    ok: false,
    response: reply({ error, message, ...extra }, status, origin, headers),
  });

  const row = await env.DB.prepare("SELECT plan, status, suspended_until FROM users WHERE github_id = ?")
    .bind(user.sub)
    .first<{ plan: string | null; status: string | null; suspended_until: string | null }>();
  // A deleted account with a still-valid token must not keep running code.
  if (!row) return deny("unauthorized", 401, "Sign in again.");
  if (await evaluateSuspension(env, user.sub, row)) {
    return deny("account_suspended", 403, "This account is suspended after automated abuse protection triggered.");
  }

  const plan = planOf(row.plan);
  const limits = quotaLimits(env, plan);
  const day = utcDay();
  const runId = crypto.randomUUID();
  const resetAt = nextResetIso();

  // Rate + concurrency in ONE conditional insert so two parallel requests cannot both slip under the limits.
  // The inserted 'running' row is the reservation that later requests count.
  await env.DB.prepare("DELETE FROM lab_runs WHERE user_id = ? AND status = 'running' AND created_at < datetime('now', '-1 hour')").bind(user.sub).run();
  const inserted = await env.DB.prepare(
    `INSERT INTO lab_runs (id, user_id, ref_kind, lang, status)
     SELECT ?1, ?2, 'free', '', 'running'
     WHERE (SELECT COUNT(*) FROM lab_runs WHERE user_id = ?2 AND created_at >= datetime('now', ?3)) < ?4
       AND (SELECT COUNT(*) FROM lab_runs WHERE user_id = ?2 AND status = 'running' AND created_at >= datetime('now', ?5)) < ?6`,
  ).bind(runId, user.sub, `-${RATE_WINDOW_SECONDS} seconds`, limits.perMinute, `-${RUNNING_STALE_SECONDS} seconds`, limits.concurrent).run();

  if (inserted.meta.changes === 0) {
    const recent = await env.DB.prepare(
      `SELECT COUNT(*) AS n, CAST(strftime('%s','now') - strftime('%s', MIN(created_at)) AS INTEGER) AS age
       FROM lab_runs WHERE user_id = ? AND created_at >= datetime('now', ?)`,
    ).bind(user.sub, `-${RATE_WINDOW_SECONDS} seconds`).first<{ n: number; age: number | null }>();
    if ((recent?.n ?? 0) >= limits.perMinute) {
      await recordAbuseSignal(env, user.sub, "flood", `rate limit hit (${limits.perMinute}/min)`);
      const retryAfterSec = Math.max(1, RATE_WINDOW_SECONDS - (recent?.age ?? 0));
      return deny("rate_limited", 429, "Too many runs per minute. Wait a moment and try again.",
        { scope: "rate", retryAfterSec } satisfies Partial<QuotaError>, { "Retry-After": String(retryAfterSec) });
    }
    return deny("quota_exceeded", 429, "Too many runs in progress. Wait for one to finish.",
      { scope: "concurrency", retryAfterSec: 5 } satisfies Partial<QuotaError>, { "Retry-After": "5" });
  }

  if ((await bump(env, user.sub, day, units)) > limits.daily) {
    await unbump(env, user.sub, day, units);
    await dropReservation(env, runId);
    return deny("quota_exceeded", 429, "Daily run limit reached.", { scope: "user", resetAt } satisfies Partial<QuotaError>);
  }
  if ((await bump(env, GLOBAL_BUCKET, day, units)) > limits.global) {
    await unbump(env, GLOBAL_BUCKET, day, units);
    await unbump(env, user.sub, day, units);
    await dropReservation(env, runId);
    return deny("quota_exceeded", 429, "Code Lab is at capacity for today. Try again after the reset.", { scope: "global", resetAt } satisfies Partial<QuotaError>);
  }

  return { ok: true, plan, reservation: { userId: user.sub, plan, day, units, runId } };
}

/** Quota snapshot for the user (today's counter is read, nothing is changed). */
async function quotaInfoFor(env: Env, userId: string, plan: Plan): Promise<QuotaInfo> {
  const limits = quotaLimits(env, plan);
  const row = await env.DB.prepare("SELECT count FROM lab_usage WHERE user_id = ? AND day = ?").bind(userId, utcDay()).first<{ count: number }>();
  const used = row?.count ?? 0;
  return { plan, used, limit: limits.daily, remaining: Math.max(0, limits.daily - used), resetAt: nextResetIso(), perMinute: limits.perMinute };
}

export async function getQuotaInfo(env: Env, user: LabUser): Promise<QuotaInfo> {
  const row = await env.DB.prepare("SELECT plan FROM users WHERE github_id = ?").bind(user.sub).first<{ plan: string | null }>();
  return quotaInfoFor(env, user.sub, planOf(row?.plan));
}

/**
 * Closes a reservation. Refunds the units for infrastructure outcomes
 * ("internal_error" | "unsupported" | "rejected"); user-caused outcomes keep
 * the charge. Also removes the in-flight row if recordRun did not complete it.
 */
export async function settleQuota(env: Env, reservation: Reservation, outcome: RunStatus | "rejected"): Promise<QuotaInfo> {
  if (REFUNDED.has(outcome)) {
    await unbump(env, reservation.userId, reservation.day, reservation.units);
    await unbump(env, GLOBAL_BUCKET, reservation.day, reservation.units);
  }
  await dropReservation(env, reservation.runId);
  return quotaInfoFor(env, reservation.userId, reservation.plan);
}

// ── Result shaping ────────────────────────────────────────────────────────────

/** RunResult as shown to users: no job id, no runner measurements. */
export function toPublicResult(r: RunResult): PublicRunResult {
  return {
    status: r.status,
    exitCode: r.exitCode,
    signal: r.signal ?? null,
    stdout: r.stdout,
    stderr: r.stderr,
    ...(r.compileOutput ? { compileOutput: r.compileOutput } : {}),
    stdoutBytes: r.stdoutBytes,
    stderrBytes: r.stderrBytes,
    truncated: { stdout: r.truncated.stdout, stderr: r.truncated.stderr },
    runMs: r.runMs,
    compileMs: r.compileMs,
    ...(r.message ? { message: r.message } : {}),
  };
}

const ERROR_LINE = /(error|exception|panic|fatal|undefined|cannot|unexpected|not defined|segmentation fault)/i;
const STACK_FRAME = /^\s*(File "|at |from |\^|~)/;

/**
 * The first compiler/runtime error line, normalized so that the same mistake
 * made by different learners groups together (analytics: common failure points):
 * directories dropped, numbers -> N, quoted names -> '…'. <= 200 chars.
 */
export function firstErrorLine(text: string): string | null {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  const line = lines.find((l) => ERROR_LINE.test(l) && !STACK_FRAME.test(l) && !/^Traceback/.test(l)) ?? lines.find((l) => !STACK_FRAME.test(l));
  if (!line) return null;
  const norm = line
    .replace(/(?:[A-Za-z]:)?[\\/][^\s:'"`]*[\\/]/g, "")
    .replace(/(["'`])[^"'`\n]{1,40}\1/g, "$1…$1")
    .replace(/0x[0-9a-f]+/gi, "0xN")
    .replace(/\d+/g, "N")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  return norm || null;
}

export interface RecordRunInput {
  id?: string;
  userId: string;
  ref: RunRef;
  lang: LangId;
  result: RunResult;
  /** Graded runs: whether every test passed. */
  passed?: boolean | null;
  code?: string;
  stdin?: string;
}

/**
 * Writes (or completes the in-flight reservation row of) one run: metrics for
 * analytics plus the user's own size-capped history copy. Returns the run id.
 */
export async function recordRun(env: Env, row: RecordRunInput): Promise<string> {
  const id = row.id ?? crypto.randomUUID();
  const r = row.result;
  const compileFailed = r.status === "compile_error";
  // Compiler diagnostics live in `stderr` of the stored copy for compile errors so the history view shows them.
  const stderrCopy = compileFailed ? [r.compileOutput, r.stderr].filter(Boolean).join("\n") : r.stderr;
  const failure = r.status === "compile_error" || r.status === "runtime_error" ? firstErrorLine(compileFailed ? stderrCopy : r.stderr || (r.compileOutput ?? "")) : null;

  await env.DB.prepare(
    `INSERT INTO lab_runs (id, user_id, ref_kind, track, lesson, exercise, challenge_id, lang, status, exit_code, run_ms, compile_ms,
       stdout_bytes, stderr_bytes, success, passed, first_error, code, stdin, stdout, stderr)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       ref_kind = excluded.ref_kind, track = excluded.track, lesson = excluded.lesson, exercise = excluded.exercise,
       challenge_id = excluded.challenge_id, lang = excluded.lang, status = excluded.status, exit_code = excluded.exit_code,
       run_ms = excluded.run_ms, compile_ms = excluded.compile_ms, stdout_bytes = excluded.stdout_bytes,
       stderr_bytes = excluded.stderr_bytes, success = excluded.success, passed = excluded.passed,
       first_error = excluded.first_error, code = excluded.code, stdin = excluded.stdin, stdout = excluded.stdout,
       stderr = excluded.stderr
     WHERE lab_runs.user_id = excluded.user_id`,
  ).bind(
    id,
    row.userId,
    row.ref.kind,
    row.ref.kind === "lesson" ? row.ref.track : null,
    row.ref.kind === "lesson" ? row.ref.lesson : null,
    row.ref.kind === "lesson" ? row.ref.exercise : null,
    row.ref.kind === "challenge" ? row.ref.id : null,
    row.lang,
    r.status,
    r.exitCode,
    r.runMs,
    r.compileMs,
    r.stdoutBytes,
    r.stderrBytes,
    r.status === "ok" ? 1 : 0,
    row.passed === undefined || row.passed === null ? null : row.passed ? 1 : 0,
    failure,
    (row.code ?? "").slice(0, STORE_CODE_CHARS),
    (row.stdin ?? "").slice(0, STORE_STDIN_CHARS),
    r.stdout.slice(0, STORE_OUTPUT_CHARS),
    stderrCopy.slice(0, STORE_OUTPUT_CHARS),
  ).run();
  return id;
}
