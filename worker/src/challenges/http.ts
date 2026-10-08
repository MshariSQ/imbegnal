// Small request/response helpers shared by the Challenges, certificate and instructor handlers.
import { type Env, NO_STORE, getUser, json } from "../util";

export interface AuthedUser {
  sub: string;
  username?: string;
  name?: string;
}

/** Stable machine error body (see the status table at the top of shared/api.ts). */
export function apiError(origin: string, status: number, error: string, message?: string, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}): Response {
  return json({ error, ...(message ? { message } : {}), ...extra }, status, origin, { ...NO_STORE, ...headers });
}

const str = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

/** The caller when a valid token is present; null otherwise. Never throws, never 401s. */
export async function optionalUser(req: Request, env: Env): Promise<AuthedUser | null> {
  try {
    const u = await getUser(req, env);
    if (!u || typeof u.sub !== "string" || u.sub.length === 0) return null;
    return { sub: u.sub, username: str(u.username), name: str(u.name) };
  } catch {
    return null;
  }
}

export async function requireUser(req: Request, env: Env, origin: string): Promise<{ ok: true; user: AuthedUser } | { ok: false; response: Response }> {
  const user = await optionalUser(req, env);
  if (!user) return { ok: false, response: apiError(origin, 401, "unauthorized") };
  return { ok: true, user };
}

/**
 * Like requireUser, and the account must still exist: a valid token of a deleted account
 * must not be able to create progress rows (same rule as PUT /api/state).
 */
export async function requireLiveUser(req: Request, env: Env, origin: string): Promise<{ ok: true; user: AuthedUser } | { ok: false; response: Response }> {
  const auth = await requireUser(req, env, origin);
  if (!auth.ok) return auth;
  const row = await env.DB.prepare("SELECT 1 AS ok FROM users WHERE github_id = ?").bind(auth.user.sub).first<{ ok: number }>();
  if (!row) return { ok: false, response: apiError(origin, 401, "unauthorized") };
  return auth;
}

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
