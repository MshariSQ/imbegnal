// The one authentication guard every protected route goes through.
//
// A request is authenticated when ALL of these hold:
//   1. it carries `Authorization: Bearer <jwt>` that verifies (HS256, JWT_SECRET, not expired),
//   2. the token's subject is still an account (users row; a deleted account's token is dead),
//   3. the token's `tv` claim equals users.token_version (a token without `tv` counts as 0), so
//      POST /api/auth/logout, which increments the version, revokes every earlier token.
// Then the account's suspension is evaluated (an expired one is lifted here, with its
// `abuse.suspension_expired` audit row) and a suspended account is refused with
// 403 account_suspended unless the route opted in with `allowSuspended`. `minRole` adds the role
// check (roles.ts ranking; the role is read from D1 on every request, never from the token).
//
// Failures: 401 unauthorized (1-3), 403 account_suspended (+ `until`, ISO, when the suspension has
// an end), 403 forbidden (role). Each route family keeps the 401 body its clients already know
// (see LEGACY_401). Route handlers use requireAuth(); the per-module helpers
// (challenges/http.ts, lab/http.ts, roles.ts) are thin wrappers over it.
import { evaluateSuspension } from "../abuse";
import { type Role, atLeast, roleOf } from "../roles";
import { type Env, NO_STORE, json, verifyJWT } from "../util";

export interface GuardUser {
  sub: string;
  username?: string;
  name?: string;
  /** From D1 on this request. */
  role: Role;
  /** users.token_version, equal to the token's `tv`. */
  tokenVersion: number;
  /** Only ever true on routes that passed `allowSuspended` (the others are refused). */
  suspended: boolean;
  /** ISO end of the current suspension; absent when not suspended or suspended until an operator lifts it. */
  suspendedUntil?: string;
}

export interface GuardOptions {
  /** Let a suspended account through (GET /api/auth/me, POST /api/auth/logout, DELETE /api/account). */
  allowSuspended?: boolean;
  minRole?: "instructor" | "admin";
}

export type GuardFailure = { reason: "unauthorized" } | { reason: "suspended"; until?: string } | { reason: "forbidden" };

export type GuardResult = { ok: true; user: GuardUser } | { ok: false; failure: GuardFailure };

interface UserRow {
  status: string | null;
  suspended_until: string | null;
  role: string | null;
  token_version: number | null;
}

const MAX_SUBJECT = 128;
const UNAUTHORIZED: GuardResult = { ok: false, failure: { reason: "unauthorized" } };

export const SUSPENDED_MESSAGE = "This account is suspended.";

/** The 401 body of the original site routes (/api/auth/me, state, progress, bookmarks, AI tutor, account): `{"error":"Unauthorized"}`. */
export const LEGACY_401 = { unauthorizedError: "Unauthorized" } as const;

export function bearerToken(req: Request): string | null {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  return token || null;
}

/** The token's `tv` claim: absent = 0 (tokens issued before revocation existed); anything but a non-negative integer is invalid (null). */
export function tokenVersionClaim(claims: Record<string, unknown>): number | null {
  const tv = claims.tv;
  if (tv === undefined) return 0;
  return typeof tv === "number" && Number.isSafeInteger(tv) && tv >= 0 ? tv : null;
}

/** SQLite "YYYY-MM-DD HH:MM:SS" (UTC) -> ISO 8601; undefined when missing or malformed. */
export function sqlToIso(s: string | null): string | undefined {
  if (!s) return undefined;
  const ms = Date.parse(`${s.replace(" ", "T")}Z`);
  return Number.isNaN(ms) ? undefined : new Date(ms).toISOString();
}

const str = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

export async function guard(req: Request, env: Env, opts: GuardOptions = {}): Promise<GuardResult> {
  const token = bearerToken(req);
  if (!token) return UNAUTHORIZED;
  const claims = await verifyJWT(token, env.JWT_SECRET);
  if (!claims) return UNAUTHORIZED;
  const sub = claims.sub;
  if (typeof sub !== "string" || sub.length === 0 || sub.length > MAX_SUBJECT) return UNAUTHORIZED;
  const tv = tokenVersionClaim(claims);
  if (tv === null) return UNAUTHORIZED;

  const row = await env.DB.prepare("SELECT status, suspended_until, role, token_version FROM users WHERE github_id = ?")
    .bind(sub)
    .first<UserRow>();
  if (!row) return UNAUTHORIZED; // deleted account
  const tokenVersion = row.token_version ?? 0;
  if (tv !== tokenVersion) return UNAUTHORIZED; // revoked by a logout

  const suspended = await evaluateSuspension(env, sub, row); // lifts (and audits) an expired suspension
  const suspendedUntil = suspended ? sqlToIso(row.suspended_until) : undefined;
  if (suspended && !opts.allowSuspended) return { ok: false, failure: { reason: "suspended", ...(suspendedUntil ? { until: suspendedUntil } : {}) } };

  const role = roleOf(row.role);
  if (opts.minRole && !atLeast(role, opts.minRole)) return { ok: false, failure: { reason: "forbidden" } };

  return {
    ok: true,
    user: { sub, username: str(claims.username), name: str(claims.name), role, tokenVersion, suspended, ...(suspendedUntil ? { suspendedUntil } : {}) },
  };
}

/**
 * Optional authentication (public routes that personalise for a signed-in caller): the user when
 * guard() accepts the request with `opts`, otherwise null — a missing, invalid, expired or revoked
 * token, or a deleted account, reads as anonymous. Never throws, never answers 401.
 */
export async function optionalGuard(req: Request, env: Env, opts: GuardOptions = {}): Promise<GuardUser | null> {
  if (!bearerToken(req)) return null;
  try {
    const r = await guard(req, env, opts);
    return r.ok ? r.user : null;
  } catch {
    return null;
  }
}

/** Body of a 403 for a suspended account. Shared with reserveQuota (lab/execute.ts) so both paths answer alike. */
export function suspendedBody(until?: string): { error: "account_suspended"; message: string; until?: string } {
  return { error: "account_suspended", message: SUSPENDED_MESSAGE, ...(until ? { until } : {}) };
}

export function guardFailureResponse(failure: GuardFailure, origin: string, unauthorizedError = "unauthorized"): Response {
  if (failure.reason === "unauthorized") return json({ error: unauthorizedError }, 401, origin, NO_STORE);
  if (failure.reason === "forbidden") return json({ error: "forbidden" }, 403, origin, NO_STORE);
  return json(suspendedBody(failure.until), 403, origin, NO_STORE);
}

/** guard() for route handlers: the user, or the ready error response. */
export async function requireAuth(
  req: Request,
  env: Env,
  origin: string,
  opts: GuardOptions & { unauthorizedError?: string } = {},
): Promise<{ ok: true; user: GuardUser } | { ok: false; response: Response }> {
  const r = await guard(req, env, opts);
  return r.ok ? r : { ok: false, response: guardFailureResponse(r.failure, origin, opts.unauthorizedError) };
}
