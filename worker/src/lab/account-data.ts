// Code Lab data owned by one account, for the self-serve account deletion batch
// (worker/src/account.ts). Returns prepared statements so the caller can run
// them in the same atomic `DB.batch` as the rest of the erasure.
//
// Kept on purpose, because deleting them would let "delete account, sign in again" reset
// the controls (security review finding): audit_log rows (the operators' security record),
// and everything a rate limit or abuse check counts, for at least as long as it counts:
//   - TODAY's lab_usage counter (id, date, number): the daily Code Lab run quota;
//   - TODAY's ai_usage counter (id, date, number): the AI tutor's daily quota (account.ts);
//   - abuse signals from the last 24 hours (kind + a fixed-format detail, no content):
//     automatic suspension counts them;
//   - challenge_attempts from the last 24 hours (id, challenge id, correct yes/no, time; the
//     submitted flag is never stored): the flag brute-force limits count them (account.ts).
// Older counters, signals and attempts are erased, and so is all user content (code, snippets,
// notes, study state, progress, XP awards in xp_ledger, solves, certificates). What is kept is counters only, under the
// opaque account key alone (GitHub's numeric id, google:<sub>, email:<keyed hash> from
// auth-email.ts, or the email:<uuid> of older email accounts): no email address, name or content.
// Every provider's key is deterministic, so signing up again with the same GitHub or Google
// account or the same email address gets the same key and is still counted by these rows. An
// email:<uuid> account's kept rows are moved to its email's derived key when it is deleted (account.ts).
import type { Env } from "../util";
import { utcDay } from "./config";

export function labAccountDeleteStatements(env: Env, userId: string): D1PreparedStatement[] {
  return [
    ...["lab_runs", "lab_snippets", "lab_progress"].map((table) => env.DB.prepare(`DELETE FROM ${table} WHERE user_id = ?`).bind(userId)),
    env.DB.prepare("DELETE FROM xp_ledger WHERE user_id = ?").bind(userId),
    env.DB.prepare("DELETE FROM lab_usage WHERE user_id = ? AND day < ?").bind(userId, utcDay()),
    env.DB.prepare("DELETE FROM abuse_signals WHERE user_id = ? AND at < datetime('now', '-1 day')").bind(userId),
  ];
}
