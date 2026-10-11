// Roles: student (default) < instructor < admin. Roles are granted by the owner with
// worker/scripts/grant-role.mjs (docs/PLATFORM.md, "Owner provisioning"), never by the API:
// no route writes users.role, the JWT carries no role, and the role is read from D1 on every request.
import { requireAuth } from "./auth/guard";
import type { Env } from "./util";

export type Role = "student" | "instructor" | "admin";

const RANK: Record<Role, number> = { student: 0, instructor: 1, admin: 2 };

/** A users.role value as a Role; anything unknown (or missing) is a plain student. */
export function roleOf(raw: unknown): Role {
  return raw === "admin" || raw === "instructor" ? raw : "student";
}

/** True when `role` ranks at least as high as `min`. */
export function atLeast(role: Role, min: Role): boolean {
  return RANK[role] >= RANK[min];
}

export async function getRole(env: Env, sub: string): Promise<Role> {
  const row = await env.DB.prepare("SELECT role FROM users WHERE github_id = ?").bind(sub).first<{ role: string | null }>();
  return roleOf(row?.role);
}

/**
 * Authenticates the request (auth/guard.ts: valid, unrevoked token of an existing account that is
 * not suspended) and requires at least `min`: 401 unauthorized, 403 account_suspended, 403 forbidden.
 */
export async function requireRole(
  req: Request,
  env: Env,
  origin: string,
  min: "instructor" | "admin",
): Promise<{ ok: true; user: { sub: string } } | { ok: false; response: Response }> {
  const auth = await requireAuth(req, env, origin, { minRole: min });
  return auth.ok ? { ok: true, user: { sub: auth.user.sub } } : auth;
}
