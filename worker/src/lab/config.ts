// Code Lab limits and tunables. Defaults follow docs/CODE_LAB.md; the RUN_* /
// ABUSE_* environment variables override them (never put them in wrangler.toml
// [vars]: deploys would overwrite values edited in the dashboard).
import type { Plan } from "../../../shared/api";
import type { Env } from "../util";

/** Size ceilings, shared with the runner (shared/protocol.ts RUNNER_CEILING). */
export const MAX_CODE_BYTES = 64 * 1024;
export const MAX_STDIN_BYTES = 64 * 1024;
/** Whole JSON request body. */
export const MAX_BODY_BYTES = 200 * 1024;

/** What is stored in lab_runs / lab_snippets (the user's own history copy). */
export const STORE_CODE_CHARS = 64 * 1024;
export const STORE_STDIN_CHARS = 16 * 1024;
export const STORE_OUTPUT_CHARS = 16 * 1024;

/** Graded lesson labs run the program once per catalog test, at most this many. */
export const MAX_GRADED_TESTS = 12;
/** `expected` / `actual` strings in a GradeResult are clipped to this many characters. */
export const GRADE_TEXT_CHARS = 2000;

export const SNIPPET_MAX_PER_USER = 200;
export const SNIPPET_MAX_PER_HOUR = 20;
export const SNIPPET_TITLE_CHARS = 80;

export const GLOBAL_BUCKET = "_global"; // lab_usage row that counts every user's runs

export { GRADING_BUDGET_MS } from "./budget";
export const RATE_WINDOW_SECONDS = 60;

/** Parses a positive integer env value; anything else falls back to the default. */
export function positiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 && n <= 1_000_000_000 ? n : fallback;
}

export interface QuotaLimits {
  daily: number;
  perMinute: number;
  global: number;
  concurrent: number;
}

export function quotaLimits(env: Env, plan: Plan): QuotaLimits {
  return {
    daily: plan === "pro" ? positiveInt(env.RUN_DAILY_LIMIT_PRO, 500) : positiveInt(env.RUN_DAILY_LIMIT_FREE, 50),
    perMinute: plan === "pro" ? positiveInt(env.RUN_PER_MINUTE_PRO, 30) : positiveInt(env.RUN_PER_MINUTE_FREE, 10),
    global: positiveInt(env.RUN_DAILY_LIMIT_GLOBAL, 20_000),
    concurrent: positiveInt(env.RUN_MAX_CONCURRENT, 2),
  };
}

export const planOf = (plan: string | null | undefined): Plan => (plan === "pro" ? "pro" : "free");

/** UTC day key; quotas reset at 00:00 UTC (03:00 Riyadh). */
export const utcDay = (now = new Date()): string => now.toISOString().slice(0, 10);

/** Next 00:00 UTC as an ISO string. */
export function nextResetIso(now = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();
}

export const utf8Bytes = (s: string): number => new TextEncoder().encode(s).length;

/** Replaces runs of control characters with one space (log lines, runner text, abuse details). */
// eslint-disable-next-line no-control-regex -- matching control characters is the point
export const stripControl = (s: string): string => s.replace(/[\u0000-\u001f\u007f]+/g, " ");
