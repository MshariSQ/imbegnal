// Study-state sync: one JSON document per user (progress, XP sources, streak
// days, notes). The client merges server + local copies before pushing, so the
// server just stores the latest merged document.
import { type Env, NO_STORE, getUser, json, readJson } from "./util";

const MAX_BYTES = 512 * 1024;

export async function handleStateGet(req: Request, env: Env, origin: string): Promise<Response> {
  const user = await getUser(req, env);
  if (!user) return json({ error: "Unauthorized" }, 401, origin, NO_STORE);
  const row = await env.DB.prepare("SELECT data FROM user_state WHERE github_id = ?").bind(user.sub).first<{ data: string }>();
  let data: unknown = null;
  try {
    data = row ? JSON.parse(row.data) : null;
  } catch {
    data = null;
  }
  return json({ data }, 200, origin, NO_STORE);
}

export async function handleStatePut(req: Request, env: Env, origin: string): Promise<Response> {
  const user = await getUser(req, env);
  if (!user) return json({ error: "Unauthorized" }, 401, origin, NO_STORE);
  const body = await readJson(req);
  const data = body?.data as { v?: unknown } | undefined;
  if (!data || typeof data !== "object" || data.v !== 1) return json({ error: "invalid_state" }, 400, origin);
  const text = JSON.stringify(data);
  if (text.length > MAX_BYTES) return json({ error: "state_too_large" }, 413, origin);
  // Only for accounts that still exist, so a stale token can't re-create deleted data
  await env.DB.prepare(
    `INSERT INTO user_state (github_id, data, updated_at)
     SELECT ?1, ?2, CURRENT_TIMESTAMP WHERE EXISTS (SELECT 1 FROM users WHERE github_id = ?1)
     ON CONFLICT(github_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`
  ).bind(user.sub, text).run();
  return json({ ok: true }, 200, origin, NO_STORE);
}
