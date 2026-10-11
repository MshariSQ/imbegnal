// Small request/response helpers shared by the Challenges, certificate and instructor handlers.
import { type GuardOptions, optionalGuard, requireAuth } from "../auth/guard";
import { type Env, NO_STORE, json } from "../util";

export interface AuthedUser {
  sub: string;
  username?: string;
  name?: string;
}

/** Stable machine error body (see the status table at the top of shared/api.ts). */
export function apiError(origin: string, status: number, error: string, message?: string, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}): Response {
  return json({ error, ...(message ? { message } : {}), ...extra }, status, origin, { ...NO_STORE, ...headers });
}

const authed = (u: { sub: string; username?: string; name?: string }): AuthedUser => ({ sub: u.sub, username: u.username, name: u.name });

/**
 * The caller of a public route that personalises its answer (challenge list, leaderboard); null for
 * anonymous callers and for missing, invalid, expired or revoked tokens and deleted accounts
 * (auth/guard.ts optionalGuard). A suspended account still reads its own public progress. Never throws, never 401s.
 */
export async function optionalUser(req: Request, env: Env): Promise<AuthedUser | null> {
  const u = await optionalGuard(req, env, { allowSuspended: true });
  return u ? authed(u) : null;
}

/**
 * auth/guard.ts for the Challenges and certificate routes: a valid, unrevoked token of an account
 * that still exists (a deleted account must not create progress rows) and is not suspended.
 * 401 unauthorized, 403 account_suspended.
 */
export async function requireLiveUser(req: Request, env: Env, origin: string, opts: GuardOptions = {}): Promise<{ ok: true; user: AuthedUser } | { ok: false; response: Response }> {
  const auth = await requireAuth(req, env, origin, opts);
  return auth.ok ? { ok: true, user: authed(auth.user) } : auth;
}

/** Same as requireLiveUser (kept for existing callers). */
export const requireUser = requireLiveUser;

/** Reads a JSON object body, refusing to buffer more than `maxBytes`. */
export async function readBoundedJson(req: Request, maxBytes: number): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; reason: "invalid" | "too_large" }> {
  const declared = Number(req.headers.get("Content-Length"));
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false, reason: "too_large" };
  if (!req.body) return { ok: false, reason: "invalid" };
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      return { ok: false, reason: "too_large" };
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    bytes.set(c, off);
    off += c.byteLength;
  }
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return { ok: false, reason: "invalid" };
    return { ok: true, body: parsed as Record<string, unknown> };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

// ── Time ──────────────────────────────────────────────────────────────────────
// D1 stores CURRENT_TIMESTAMP as "YYYY-MM-DD HH:MM:SS" (UTC). Every timestamp this module
// writes or compares uses the same format so string comparison is chronological.

export function sqlTime(ms: number): string {
  return new Date(ms).toISOString().slice(0, 19).replace("T", " ");
}

/** "YYYY-MM-DD HH:MM:SS" (UTC) → epoch ms; NaN when malformed. */
export function parseSqlTime(s: string): number {
  return Date.parse(`${s.replace(" ", "T")}Z`);
}

export function toIso(s: string | null | undefined): string | undefined {
  if (!s) return undefined;
  const ms = parseSqlTime(s);
  return Number.isNaN(ms) ? undefined : new Date(ms).toISOString();
}

export const round1 = (n: number): number => Math.round(n * 10) / 10;
