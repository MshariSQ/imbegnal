// HTTP plumbing shared by the Code Lab handlers: authentication, bounded JSON
// body reading and the JSON error shape of shared/api.ts (ApiErrorBody).
import type { ApiErrorBody } from "../../../shared/api";
import { optionalGuard, requireAuth } from "../auth/guard";
import { type Env, NO_STORE, json } from "../util";
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

const labUser = (u: LabUser): LabUser => ({ sub: u.sub, username: u.username, name: u.name });

/**
 * The signed-in user (valid, unrevoked token of an existing account; suspended accounts included), or
 * null. Endpoints use requireActiveUser; this is for callers that only personalise.
 */
export async function authenticate(req: Request, env: Env): Promise<LabUser | null> {
  const u = await optionalGuard(req, env, { allowSuspended: true });
  return u ? labUser(u) : null;
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
 * auth/guard.ts for every authenticated lab endpoint (run included): a valid, unrevoked token of an
 * account that still exists and is not suspended. 401 unauthorized, 403 account_suspended.
 */
export async function requireActiveUser(req: Request, env: Env, origin: string): Promise<{ ok: true; user: LabUser } | { ok: false; response: Response }> {
  const auth = await requireAuth(req, env, origin);
  return auth.ok ? { ok: true, user: labUser(auth.user) } : auth;
}
