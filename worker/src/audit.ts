// Append-only audit trail for security-relevant events (auto-suspensions, role
// changes, lifted bans). Written by the Worker, read by operators with SQL or
// through GET /api/admin/audit. Never put code, flags or secrets in `detail`.
import type { Env } from "./util";

const MAX_DETAIL = 500;

export async function audit(env: Env, entry: { userId?: string; action: string; detail: string }): Promise<void> {
  try {
    await env.DB.prepare("INSERT INTO audit_log (user_id, action, detail) VALUES (?, ?, ?)")
      .bind(entry.userId ?? null, entry.action.slice(0, 64), entry.detail.slice(0, MAX_DETAIL))
      .run();
  } catch (e) {
    // The audit trail must never break the request that triggered it.
    console.error("audit write failed", e instanceof Error ? e.message : "unknown");
  }
}
