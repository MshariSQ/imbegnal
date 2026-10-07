// Code Lab data owned by one account, for the self-serve account deletion batch
// (worker/src/account.ts). Returns prepared statements so the caller can run
// them in the same atomic `DB.batch` as the rest of the erasure.
//
// Kept on purpose, because deleting them would let "delete account, sign in again" reset
// the controls (security review finding): audit_log rows (the operators' security record),
// TODAY's lab_usage counter (id, date, number) and abuse signals from the last 24 hours
// (kind + a fixed-format detail, no content). Older counters and signals are erased.
import type { Env } from "../util";
import { utcDay } from "./config";

export function labAccountDeleteStatements(env: Env, userId: string): D1PreparedStatement[] {
  return [
    ...["lab_runs", "lab_snippets", "lab_progress"].map((table) => env.DB.prepare(`DELETE FROM ${table} WHERE user_id = ?`).bind(userId)),
    env.DB.prepare("DELETE FROM lab_usage WHERE user_id = ? AND day < ?").bind(userId, utcDay()),
    env.DB.prepare("DELETE FROM abuse_signals WHERE user_id = ? AND at < datetime('now', '-1 day')").bind(userId),
  ];
}
