// Abuse protection for Code Lab and Challenges. Features record *signals*; when
// a user produces too many signals of one kind inside a sliding window their
// account is suspended automatically for a while. Signals are advisory
// heuristics (the sandbox is the real security boundary), so the thresholds are
// deliberately above what an honest learner reaches by accident, and every
// suspension is audited and can be lifted by an operator (worker/README-lab.md).
import { audit } from "./audit";
import { positiveInt, stripControl } from "./lab/config";
import type { Env } from "./util";

export type AbuseKind = "resource" | "network_probe" | "flood" | "bruteforce" | "volume";

const DEFAULT_WINDOW_MIN = 10;
const DEFAULT_SUSPEND_HOURS = 24;
const DEFAULT_THRESHOLD: Record<AbuseKind, number> = {
  resource: 8,
  network_probe: 5,
  flood: 25,
  bruteforce: 30,
  volume: 5,
};

function threshold(env: Env, kind: AbuseKind): number {
  const raw = {
    resource: env.ABUSE_RESOURCE_MAX,
    network_probe: env.ABUSE_NETWORK_PROBE_MAX,
    flood: env.ABUSE_FLOOD_MAX,
    bruteforce: env.ABUSE_BRUTEFORCE_MAX,
    volume: env.ABUSE_VOLUME_MAX,
  }[kind];
  return positiveInt(raw, DEFAULT_THRESHOLD[kind]);
}

interface SuspensionRow {
  status: string | null;
  suspended_until: string | null;
}

/**
 * True when the account is currently suspended. A suspension whose
 * `suspended_until` has passed is lifted here (lazily, on the next request).
 * `suspended_until` NULL while suspended means "until an operator lifts it".
 */
export async function evaluateSuspension(env: Env, userId: string, row: SuspensionRow): Promise<boolean> {
  if (row.status !== "suspended") return false;
  if (!row.suspended_until) return true;
  const lifted = await env.DB.prepare(
    `UPDATE users SET status = 'active', suspended_until = NULL
     WHERE github_id = ? AND status = 'suspended' AND suspended_until IS NOT NULL AND suspended_until <= CURRENT_TIMESTAMP`,
  ).bind(userId).run();
  if (lifted.meta.changes > 0) {
    await audit(env, { userId, action: "abuse.suspension_expired", detail: `suspension ended (was until ${row.suspended_until})` });
    return false;
  }
  return true;
}

export async function isSuspended(env: Env, userId: string): Promise<boolean> {
  const row = await env.DB.prepare("SELECT status, suspended_until FROM users WHERE github_id = ?").bind(userId).first<SuspensionRow>();
  return row ? evaluateSuspension(env, userId, row) : false;
}

/**
 * Records one signal and suspends the account when the threshold for that kind
 * is reached inside the window. Never throws: abuse bookkeeping must not break
 * the request that raised the signal. Administrators are never auto-suspended
 * (an operator locked out by their own load test could not undo it).
 */
export async function recordAbuseSignal(env: Env, userId: string, kind: AbuseKind, detail: string): Promise<void> {
  try {
    await env.DB.prepare("INSERT INTO abuse_signals (user_id, kind, detail) VALUES (?, ?, ?)")
      .bind(userId, kind, stripControl(detail).slice(0, 200))
      .run();

    const windowMin = positiveInt(env.ABUSE_WINDOW_MIN, DEFAULT_WINDOW_MIN);
    const row = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM abuse_signals WHERE user_id = ? AND kind = ? AND at >= datetime('now', ?)",
    ).bind(userId, kind, `-${windowMin} minutes`).first<{ n: number }>();
    const count = row?.n ?? 0;
    if (count < threshold(env, kind)) return;

    const hours = positiveInt(env.ABUSE_SUSPEND_HOURS, DEFAULT_SUSPEND_HOURS);
    const res = await env.DB.prepare(
      `UPDATE users SET status = 'suspended', suspended_until = datetime('now', ?)
       WHERE github_id = ? AND role != 'admin' AND status != 'suspended'`,
    ).bind(`+${hours} hours`, userId).run();
    if (res.meta.changes > 0) {
      await audit(env, {
        userId,
        action: "abuse.auto_suspend",
        detail: `${count} "${kind}" signals in ${windowMin} min; suspended for ${hours} h`,
      });
    }
  } catch (e) {
    console.error("abuse signal failed", e instanceof Error ? e.message : "unknown");
  }
}
