// Self-serve account deletion (privacy right to erasure) and anonymous usage events.
import { type Env, NO_STORE, corsHeaders, getUser, json } from "./util";
import { labAccountDeleteStatements } from "./lab/account-data";
import { isSuspended } from "./abuse";
import { audit } from "./audit";

// ── DELETE /api/account ───────────────────────────────────────────────────────
// Removes the user and everything keyed to them in one atomic batch, except the little
// enforcement state that must survive a "delete and sign in again" (see lab/account-data.ts).
// A suspended account cannot delete itself until the suspension ends: otherwise deleting and
// signing in again (same GitHub/Google id) would lift the suspension. Operators can still
// erase it on request.
export async function handleAccountDelete(req: Request, env: Env, origin: string): Promise<Response> {
  const user = await getUser(req, env);
  if (!user) return json({ error: "Unauthorized" }, 401, origin, NO_STORE);
  const id = user.sub;
  if (await isSuspended(env, id)) {
    return json(
      { error: "account_suspended", message: "This account is suspended. You can delete it once the suspension ends, or ask us to." },
      409,
      origin,
      NO_STORE,
    );
  }
  await audit(env, { userId: id, action: "account.delete", detail: "self-serve erasure" });
  await env.DB.batch([
    env.DB.prepare("DELETE FROM user_state WHERE github_id = ?").bind(id),
    env.DB.prepare("DELETE FROM ai_usage WHERE github_id = ?").bind(id),
    env.DB.prepare("DELETE FROM user_roadmap_progress WHERE github_id = ?").bind(id),
    env.DB.prepare("DELETE FROM user_bookmarks WHERE github_id = ?").bind(id),
    // Code Lab runs/snippets/quotas/progress and Challenges progress, solves,
    // attempts and certificates (audit_log is kept on purpose: operators' security record).
    ...labAccountDeleteStatements(env, id),
    ...["challenge_progress", "challenge_solves", "challenge_attempts", "certificates"].map((t) =>
      env.DB.prepare(`DELETE FROM ${t} WHERE user_id = ?`).bind(id)
    ),
    env.DB.prepare("DELETE FROM users WHERE github_id = ?").bind(id),
  ]);
  return json({ ok: true }, 200, origin, NO_STORE);
}

// ── POST /api/event ───────────────────────────────────────────────────────────
// Anonymous product analytics: an event name from a fixed list, a random
// browser id and a short label. No IP, no account id, no cookies.
const EVENTS = new Set(["lesson_start", "lesson_done", "ai_question", "auth", "pricing_view", "pro_click"]);
const ANON_RE = /^[0-9a-f-]{36}$/;

export async function handleEvent(req: Request, env: Env, origin: string): Promise<Response> {
  const quiet = new Response(null, { status: 204, headers: corsHeaders(origin) });
  // sendBeacon posts text/plain, so read the body as text
  const raw = await req.text().catch(() => "");
  if (!raw || raw.length > 512) return quiet;
  let b: { n?: unknown; a?: unknown; m?: unknown };
  try {
    b = JSON.parse(raw);
  } catch {
    return quiet;
  }
  if (typeof b.n !== "string" || !EVENTS.has(b.n) || typeof b.a !== "string" || !ANON_RE.test(b.a)) return quiet;
  const meta = typeof b.m === "string" ? b.m.slice(0, 64) : null;
  await env.DB.prepare("INSERT INTO events (day, name, anon, meta) VALUES (?, ?, ?, ?)")
    .bind(new Date().toISOString().slice(0, 10), b.n, b.a, meta)
    .run();
  return quiet;
}
