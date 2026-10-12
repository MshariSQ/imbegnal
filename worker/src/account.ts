// Self-serve account deletion (privacy right to erasure) and anonymous usage events.
import { type Env, NO_STORE, corsHeaders, json } from "./util";
import { labAccountDeleteStatements } from "./lab/account-data";
import { LEGACY_401, requireAuth } from "./auth/guard";
import { audit } from "./audit";
import { emailAccountKey } from "./auth-email";

// ── DELETE /api/account ───────────────────────────────────────────────────────
// Removes the user and everything keyed to them in one atomic batch, except the little
// enforcement state that must survive a "delete and sign in again" (see lab/account-data.ts).
// A suspended account cannot delete itself until the suspension ends: otherwise deleting and
// signing in again (same GitHub/Google id) would lift the suspension. Operators can still
// erase it on request.
export async function handleAccountDelete(req: Request, env: Env, origin: string): Promise<Response> {
  const auth = await requireAuth(req, env, origin, { ...LEGACY_401, allowSuspended: true });
  if (!auth.ok) return auth.response;
  const id = auth.user.sub;
  if (auth.user.suspended) {
    return json(
      { error: "account_suspended", message: "This account is suspended. You can delete it once the suspension ends, or ask us to." },
      409,
      origin,
      NO_STORE,
    );
  }
  await audit(env, { userId: id, action: "account.delete", detail: "self-serve erasure" });
  const rekey = await legacyEmailRekeyStatements(env, id);
  await env.DB.batch([
    env.DB.prepare("DELETE FROM user_state WHERE github_id = ?").bind(id),
    // Today's AI tutor counter is kept, older days are erased (why: lab/account-data.ts).
    env.DB.prepare("DELETE FROM ai_usage WHERE github_id = ? AND day < date('now')").bind(id),
    env.DB.prepare("DELETE FROM user_roadmap_progress WHERE github_id = ?").bind(id),
    env.DB.prepare("DELETE FROM user_bookmarks WHERE github_id = ?").bind(id),
    // Code Lab runs/snippets/quotas/progress, lab XP (xp_ledger) and Challenges progress, solves
    // and certificates (audit_log is kept on purpose: operators' security record).
    ...labAccountDeleteStatements(env, id),
    ...["challenge_progress", "challenge_solves", "certificates"].map((t) =>
      env.DB.prepare(`DELETE FROM ${t} WHERE user_id = ?`).bind(id)
    ),
    // Flag attempts of the last 24 hours are kept (the brute-force limits count them), older ones erased.
    env.DB.prepare("DELETE FROM challenge_attempts WHERE user_id = ? AND at < datetime('now', '-1 day')").bind(id),
    ...rekey,
    env.DB.prepare("DELETE FROM users WHERE github_id = ?").bind(id),
  ]);
  return json({ ok: true }, 200, origin, NO_STORE);
}

/**
 * An email account created before keys were derived from the email has the key email:<uuid>, and
 * registering that email again creates email:<HMAC> (auth-email.ts emailAccountKey): the counters kept
 * above would stay under a key nobody uses again. For such an account, the batch moves what it keeps
 * (today's lab_usage and ai_usage, the last 24 h of abuse_signals and challenge_attempts; the statements
 * run after the deletes of older rows) to the derived key. A derived-key row for the same day can only
 * exist if an account with that key used it today; the counts are then added (ON CONFLICT ... count +
 * excluded.count), so a move never lowers a counter. Signals and attempts have their own row ids, so
 * they move with a plain UPDATE. audit_log rows keep the old key: they record what that account did.
 */
async function legacyEmailRekeyStatements(env: Env, id: string): Promise<D1PreparedStatement[]> {
  const row = await env.DB.prepare("SELECT provider, email FROM users WHERE github_id = ?").bind(id).first<{ provider: string | null; email: string | null }>();
  const email = row?.provider === "email" ? (row.email ?? "").trim().toLowerCase() : "";
  if (!email) return [];
  const derived = await emailAccountKey(env, email);
  if (derived === id) return [];
  return [
    env.DB.prepare(
      `INSERT INTO lab_usage (user_id, day, count) SELECT ?2, day, count FROM lab_usage WHERE user_id = ?1
       ON CONFLICT(user_id, day) DO UPDATE SET count = count + excluded.count`,
    ).bind(id, derived),
    env.DB.prepare("DELETE FROM lab_usage WHERE user_id = ?").bind(id),
    env.DB.prepare(
      `INSERT INTO ai_usage (github_id, day, count) SELECT ?2, day, count FROM ai_usage WHERE github_id = ?1
       ON CONFLICT(github_id, day) DO UPDATE SET count = count + excluded.count`,
    ).bind(id, derived),
    env.DB.prepare("DELETE FROM ai_usage WHERE github_id = ?").bind(id),
    env.DB.prepare("UPDATE abuse_signals SET user_id = ? WHERE user_id = ?").bind(derived, id),
    env.DB.prepare("UPDATE challenge_attempts SET user_id = ? WHERE user_id = ?").bind(derived, id),
  ];
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
