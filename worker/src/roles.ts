// Roles: student (default) < instructor < admin. Roles are granted by an
// operator with SQL (see worker/README-lab.md), never by the API.
import { isSuspended } from "./abuse";
import { type Env, NO_STORE, getUser, json } from "./util";

export type Role = "student" | "instructor" | "admin";

const RANK: Record<Role, number> = { student: 0, instructor: 1, admin: 2 };

export async function getRole(env: Env, sub: string): Promise<Role> {
  const row = await env.DB.prepare("SELECT role FROM users WHERE github_id = ?").bind(sub).first<{ role: string | null }>();
  return row?.role === "admin" || row?.role === "instructor" ? row.role : "student";
}

/** Authenticates the request and requires at least `min`. */
export async function requireRole(
  req: Request,
  env: Env,
  origin: string,
  min: "instructor" | "admin",
): Promise<{ ok: true; user: { sub: string } } | { ok: false; response: Response }> {
  const user = await getUser(req, env);
  if (!user || typeof user.sub !== "string") return { ok: false, response: json({ error: "unauthorized" }, 401, origin, NO_STORE) };
  if (await isSuspended(env, user.sub)) {
    return { ok: false, response: json({ error: "account_suspended" }, 403, origin, NO_STORE) };
  }
  if (RANK[await getRole(env, user.sub)] < RANK[min]) {
    return { ok: false, response: json({ error: "forbidden" }, 403, origin, NO_STORE) };
  }
  return { ok: true, user: { sub: user.sub } };
}
