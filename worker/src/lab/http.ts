// HTTP plumbing shared by the Code Lab handlers: authentication, bounded JSON
// body reading and the JSON error shape of shared/api.ts (ApiErrorBody).
import type { ApiErrorBody } from "../../../shared/api";
import { evaluateSuspension } from "../abuse";
import { type Env, NO_STORE, getUser, json } from "../util";
import { MAX_BODY_BYTES } from "./config";

export interface LabUser {
  sub: string;
  username?: string;
  name?: string;
}

/** JSON response that is never cached (private, per-user data). */
export function reply(data: unknown, status: number, origin: string, extra: Record<string, string> = {}): Response {
  return json(data, status, origin, { ...NO_STORE, ...extra });
}

export function apiError(error: string, status: number, origin: string, message?: string, extra: Record<string, unknown> = {}): Response {
  const body: ApiErrorBody & Record<string, unknown> = { error, ...(message ? { message } : {}), ...extra };
  return reply(body, status, origin);
}

/** The signed-in user from the Bearer token, or null. Only the subject is trusted to be a string. */
export async function authenticate(req: Request, env: Env): Promise<LabUser | null> {
  const payload = await getUser(req, env);
  if (!payload || typeof payload.sub !== "string" || payload.sub.length === 0 || payload.sub.length > 128) return null;
  return {
    sub: payload.sub,
    username: typeof payload.username === "string" ? payload.username : undefined,
    name: typeof payload.name === "string" ? payload.name : undefined,
  };
}

export type BodyResult = { ok: true; body: Record<string, unknown> } | { ok: false };

/** Reads a JSON object body of at most MAX_BODY_BYTES without buffering more than that. */
export async function readBody(req: Request): Promise<BodyResult> {
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return { ok: false };
  if (!req.body) return { ok: false };

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => {});
        return { ok: false };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      bytes.set(c, offset);
      offset += c.byteLength;
    }
    const parsed: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { ok: false };
    return { ok: true, body: parsed as Record<string, unknown> };
  } catch {
    return { ok: false };
  }
}

/** SQLite `YYYY-MM-DD HH:MM:SS` (UTC) -> ISO 8601. */
export const toIso = (sqlite: string): string => `${sqlite.replace(" ", "T")}Z`;

/**
 * Authenticated AND not suspended AND still existing. Used by every endpoint
 * except /run (which gets the same checks from reserveQuota) and the public ones.
 */
export async function requireActiveUser(req: Request, env: Env, origin: string): Promise<{ ok: true; user: LabUser } | { ok: false; response: Response }> {
  const user = await authenticate(req, env);
  if (!user) return { ok: false, response: apiError("unauthorized", 401, origin) };
  const row = await env.DB.prepare("SELECT status, suspended_until FROM users WHERE github_id = ?")
    .bind(user.sub)
    .first<{ status: string | null; suspended_until: string | null }>();
  if (!row) return { ok: false, response: apiError("unauthorized", 401, origin) };
  if (await evaluateSuspension(env, user.sub, row)) {
    return { ok: false, response: apiError("account_suspended", 403, origin, "This account is suspended after automated abuse protection triggered.") };
  }
  return { ok: true, user };
}
