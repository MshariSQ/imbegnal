// Code Lab data owned by one account, for the self-serve account deletion batch
// (worker/src/account.ts). Returns prepared statements so the caller can run
// them in the same atomic `DB.batch` as the rest of the erasure.
//
// audit_log rows are deliberately kept: they are the operators' security
// record (suspensions, role changes) and carry ids and counters, no content.
import type { Env } from "../util";

export function labAccountDeleteStatements(env: Env, userId: string): D1PreparedStatement[] {
  return ["lab_runs", "lab_usage", "lab_snippets", "lab_progress", "abuse_signals"].map((table) =>
    env.DB.prepare(`DELETE FROM ${table} WHERE user_id = ?`).bind(userId),
  );
}
