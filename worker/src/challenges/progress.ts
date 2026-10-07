// POST /api/challenges/:id/open   stamps the first-open time (time-to-solve starts here)
// POST /api/challenges/:id/hint   reveals a hint once; its cost comes off THIS learner's award
import { SUBMIT_LIMITS, type ChallengeHintResponse, type ChallengeMeta, type ChallengeOpenResponse } from "../../../shared/challenges";
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
    text: hints[index].text,
    cost: Math.max(0, Math.floor(hints[index].cost)),
    revealed,
    hintsUsed: revealed.length,
    potentialPoints: awardFor(entry.meta, mask),
  };
  return json(body, 200, origin, { "Cache-Control": "no-store" });
}
