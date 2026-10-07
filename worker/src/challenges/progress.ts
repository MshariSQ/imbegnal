// POST /api/challenges/:id/open   stamps the first-open time (time-to-solve starts here)
// POST /api/challenges/:id/hint   reveals a hint once; its cost comes off THIS learner's award
import type { RevealedHint } from "../../../shared/api";
import { SUBMIT_LIMITS, type ChallengeHintResponse, type ChallengeMeta, type ChallengeOpenResponse } from "../../../shared/challenges";
import type { ChallengeEntry } from "../graders/registry";
import { type Env, json } from "../util";
import { apiError, readBoundedJson, requireLiveUser, sqlTime, toIso } from "./http";
import type { ChallengeDeps } from "./types";

/** Sum of the costs of the hints whose bit is set in `mask` (unknown bits are ignored). */
export function hintCost(meta: ChallengeMeta, mask: number): number {
  let cost = 0;
  (meta.hints ?? []).slice(0, SUBMIT_LIMITS.maxHints).forEach((h, i) => {
    if (mask & (1 << i)) cost += Math.max(0, Math.floor(h.cost));
  });
  return cost;
}

/** Points a correct solve awards for a learner whose revealed hints are `mask`. */
export function awardFor(meta: ChallengeMeta, mask: number): number {
  return Math.max(0, meta.points - hintCost(meta, mask));
}

const revealedIndexes = (mask: number, count: number): number[] => {
  const out: number[] = [];
  for (let i = 0; i < Math.min(count, SUBMIT_LIMITS.maxHints); i++) if (mask & (1 << i)) out.push(i);
  return out;
};

/**
 * The hint texts this learner is entitled to read: the ones whose bit is set in `mask`, or every
 * hint once the challenge is solved (the award is booked by then). The ONLY place hint text leaves
 * the Worker besides the reveal response below; an unrevealed hint of an unsolved challenge is
 * never returned. A hint whose text is missing (count mismatch) is skipped, never invented.
 */
export function readableHints(entry: ChallengeEntry, mask: number, solved: boolean): RevealedHint[] {
  const count = Math.min(entry.meta.hints?.length ?? 0, SUBMIT_LIMITS.maxHints);
  const out: RevealedHint[] = [];
  for (let i = 0; i < count; i++) {
    const text = entry.hints[i];
    if (text && (solved || (mask & (1 << i)) !== 0)) out.push({ index: i, text });
  }
  return out;
}

interface ProgressRow {
  first_opened_at: string | null;
  hint_mask: number;
  solved_at: string | null;
}

export async function handleOpen(req: Request, env: Env, origin: string, id: string, deps: ChallengeDeps): Promise<Response> {
  const auth = await requireLiveUser(req, env, origin);
  if (!auth.ok) return auth.response;
  if (!deps.registry.entry(id)) return apiError(origin, 404, "not_found");

  const stamp = sqlTime(deps.now());
  // The first open wins; later opens never move it.
  await env.DB.prepare(
    `INSERT INTO challenge_progress (user_id, challenge_id, first_opened_at) VALUES (?1, ?2, ?3)
     ON CONFLICT(user_id, challenge_id) DO UPDATE SET first_opened_at = COALESCE(first_opened_at, excluded.first_opened_at)`,
  )
    .bind(auth.user.sub, id, stamp)
    .run();
  const row = await env.DB.prepare("SELECT first_opened_at FROM challenge_progress WHERE user_id = ? AND challenge_id = ?")
    .bind(auth.user.sub, id)
    .first<{ first_opened_at: string | null }>();
  const body: ChallengeOpenResponse = { ok: true, openedAt: toIso(row?.first_opened_at ?? stamp) ?? new Date(deps.now()).toISOString() };
  return json(body, 200, origin, { "Cache-Control": "no-store" });
}

export async function handleHint(req: Request, env: Env, origin: string, id: string, deps: ChallengeDeps): Promise<Response> {
  const auth = await requireLiveUser(req, env, origin);
  if (!auth.ok) return auth.response;
  const entry = deps.registry.entry(id);
  if (!entry) return apiError(origin, 404, "not_found");
  const hints = (entry.meta.hints ?? []).slice(0, SUBMIT_LIMITS.maxHints);

  const parsed = await readBoundedJson(req, 1024);
  if (!parsed.ok) return apiError(origin, 400, "invalid_request", parsed.reason === "too_large" ? "request body too large" : "expected a JSON body");
  const index = parsed.body.index;
  if (typeof index !== "number" || !Number.isInteger(index) || index < 0 || index >= hints.length) {
    return apiError(origin, 400, "invalid_request", "index must be the position of an existing hint");
  }
  // Fail closed BEFORE charging anything when the Worker-only text of a public hint is missing
  // (the parity test makes this unreachable in a deployed build).
  const text = entry.hints[index];
  if (!text) {
    console.error("challenge hint text missing", id, index);
    return apiError(origin, 500, "internal_error");
  }

  const userId = auth.user.sub;
  const before = await env.DB.prepare("SELECT first_opened_at, hint_mask, solved_at FROM challenge_progress WHERE user_id = ? AND challenge_id = ?")
    .bind(userId, id)
    .first<ProgressRow>();

  let mask = before?.hint_mask ?? 0;
  // After solving, hints are free to read and change nothing (the award is already booked).
  if (before?.solved_at == null) {
    const bit = 1 << index;
    await env.DB.prepare(
      `INSERT INTO challenge_progress (user_id, challenge_id, first_opened_at, hint_mask, hints_used) VALUES (?1, ?2, ?3, ?4, 1)
       ON CONFLICT(user_id, challenge_id) DO UPDATE SET
         first_opened_at = COALESCE(first_opened_at, excluded.first_opened_at),
         hint_mask = hint_mask | excluded.hint_mask`,
    )
      .bind(userId, id, sqlTime(deps.now()), bit)
      .run();
    // Re-read: a concurrent reveal of another hint may have changed the mask. The cost is always
    // derived from the mask at solve time, so revealing the same hint twice can never charge twice.
    const row = await env.DB.prepare("SELECT hint_mask FROM challenge_progress WHERE user_id = ? AND challenge_id = ?").bind(userId, id).first<{ hint_mask: number }>();
    mask = row?.hint_mask ?? bit;
    await env.DB.prepare("UPDATE challenge_progress SET hints_used = ?3 WHERE user_id = ?1 AND challenge_id = ?2")
      .bind(userId, id, revealedIndexes(mask, hints.length).length)
      .run();
  }

  const revealed = revealedIndexes(mask, hints.length);
  const body: ChallengeHintResponse = {
    index,
    text,
    cost: Math.max(0, Math.floor(hints[index].cost)),
    revealed,
    hintsUsed: revealed.length,
    potentialPoints: awardFor(entry.meta, mask),
  };
  return json(body, 200, origin, { "Cache-Control": "no-store" });
}
