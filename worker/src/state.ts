// Study-state sync: one JSON document per user (progress, XP sources, streak
// days, notes). The client merges server + local copies before pushing, so the
// server just stores the latest merged document, sanitized first so it cannot
// carry XP the lessons cannot award (lab XP is the Worker's own: xp_ledger).
import { catalog } from "./generated/catalog";
import { type Env, NO_STORE, json, readJson } from "./util";
import { LEGACY_401, requireAuth } from "./auth/guard";

const MAX_BYTES = 512 * 1024;
const MIN_TIME = Date.UTC(2020, 0, 1);
const DAY_MS = 24 * 60 * 60 * 1000;

/** The stored document: lib/study-store.ts StudyState, after sanitizeStudyState. */
export interface StoredStudyState {
  v: 1;
  lessons: Record<string, { visited?: number; done?: number; quiz?: number; bonus?: number }>;
  notes: Record<string, { text: string; updated: number }>;
  days: string[];
  last?: { key: string; at: number };
  updated: number;
}

let ceilings: Map<string, number> | null = null;

/** "track/lesson" -> the most bonus XP the browser can award in that lesson, for every catalog lesson. */
function bonusCeilings(): Map<string, number> {
  if (!ceilings) {
    ceilings = new Map();
    for (const t of catalog.tracks) for (const id of t.lessons) ceilings.set(`${t.id}/${id}`, t.maxBonus?.[id] ?? 0);
  }
  return ceilings;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/**
 * What PUT /api/state stores. Lessons: only keys of the generated catalog; `done` and
 * `visited` only as timestamps between 2020-01-01 and now + 1 day; `quiz` only in [0, 1];
 * `bonus` clamped to [0, the lesson's maxBonus] (in-lesson exercises and quizzes; lab XP is
 * not stored here). notes, days, last and updated are only type-checked; unknown fields are
 * dropped. Values the client never writes are what this removes, so an honest document
 * round-trips unchanged.
 */
export function sanitizeStudyState(data: Record<string, unknown>, now = Date.now()): StoredStudyState {
  const isTime = (v: unknown): v is number => isNumber(v) && v >= MIN_TIME && v <= now + DAY_MS;
  const limits = bonusCeilings();

  const lessons: StoredStudyState["lessons"] = {};
  if (isRecord(data.lessons)) {
    for (const [key, r] of Object.entries(data.lessons)) {
      const max = limits.get(key);
      if (max === undefined || !isRecord(r)) continue;
      const out: StoredStudyState["lessons"][string] = {};
      if (isTime(r.visited)) out.visited = r.visited;
      if (isTime(r.done)) out.done = r.done;
      if (isNumber(r.quiz) && r.quiz >= 0 && r.quiz <= 1) out.quiz = r.quiz;
      if (isNumber(r.bonus)) {
        const bonus = Math.min(Math.max(Math.floor(r.bonus), 0), max);
        if (bonus > 0) out.bonus = bonus;
      }
      if (Object.keys(out).length) lessons[key] = out;
    }
  }

  const notes = Object.fromEntries(
    Object.entries(isRecord(data.notes) ? data.notes : {})
      .filter((e): e is [string, { text: string; updated: number }] => isRecord(e[1]) && typeof e[1].text === "string" && isNumber(e[1].updated))
      .map(([k, n]) => [k, { text: n.text, updated: n.updated }]),
  );
  const days = Array.isArray(data.days) ? data.days.filter((d): d is string => typeof d === "string") : [];
  const last = isRecord(data.last) && typeof data.last.key === "string" && isNumber(data.last.at) ? { key: data.last.key, at: data.last.at } : undefined;

  return { v: 1, lessons, notes, days, ...(last ? { last } : {}), updated: isNumber(data.updated) ? data.updated : 0 };
}

export async function handleStateGet(req: Request, env: Env, origin: string): Promise<Response> {
  const auth = await requireAuth(req, env, origin, LEGACY_401);
  if (!auth.ok) return auth.response;
  const user = auth.user;
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
  const auth = await requireAuth(req, env, origin, LEGACY_401);
  if (!auth.ok) return auth.response;
  const user = auth.user;
  const body = await readJson(req);
  const data = body?.data as { v?: unknown } | undefined;
  if (!data || typeof data !== "object" || data.v !== 1) return json({ error: "invalid_state" }, 400, origin);
  if (JSON.stringify(data).length > MAX_BYTES) return json({ error: "state_too_large" }, 413, origin);
  const text = JSON.stringify(sanitizeStudyState(data as Record<string, unknown>));
  // Only for accounts that still exist, so a stale token can't re-create deleted data
  await env.DB.prepare(
    `INSERT INTO user_state (github_id, data, updated_at)
     SELECT ?1, ?2, CURRENT_TIMESTAMP WHERE EXISTS (SELECT 1 FROM users WHERE github_id = ?1)
     ON CONFLICT(github_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`
  ).bind(user.sub, text).run();
  return json({ ok: true }, 200, origin, NO_STORE);
}
