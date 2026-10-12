// Study-state sync: one JSON document per user (progress, XP sources, streak
// days, notes). The client merges server + local copies before pushing, so the
// server just stores the latest merged document, sanitized first so it cannot
// carry XP the lessons cannot award (lab XP is the Worker's own: xp_ledger, except the
// XP of lab passes from before the ledger, which stays in bonus: legacyLabAllowance).
import { catalog } from "./generated/catalog";
import { LAB_XP } from "../../shared/xp";
import { type Env, NO_STORE, json, readJson } from "./util";
import { LEGACY_401, requireAuth } from "./auth/guard";

const MAX_BYTES = 512 * 1024;
/** The earliest lesson timestamp (`visited`, `done`) read as a time; also instructor/analytics.ts. */
export const MIN_TIME = Date.UTC(2020, 0, 1);
const DAY_MS = 24 * 60 * 60 * 1000;

/** The stored document: lib/study-store.ts StudyState, after sanitizeStudyState. */
export interface StoredStudyState {
  v: 1;
  /** `done: true` is the legacy shape (worker/tests/migrations.test.ts); the certificates and the site count it as done. */
  lessons: Record<string, { visited?: number; done?: number | true; quiz?: number; bonus?: number }>;
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

let labLessons: Map<string, string> | null = null;

/** Catalog lab exercise ref ("track/lesson/exercise") -> its lesson key ("track/lesson"). */
function labLessonOf(ref: string): string | undefined {
  if (!labLessons) labLessons = new Map(catalog.labs.map((l) => [l.ref, `${l.track}/${l.lesson}`]));
  return labLessons.get(ref);
}

/**
 * Per lesson, the lab XP the user's synced `bonus` may still carry: LAB_XP for each of their lab_progress
 * passes of that lesson's catalog lab exercises with no xp_ledger 'lab' row. Those are exactly the passes
 * the Worker graded before the ledger existed, whose XP the client of that time added to the lesson's
 * bonus (and the ledger never awards them: lab/handlers.ts). Passes the ledger awarded carry their XP
 * there, not in bonus. The ledger is not backfilled instead: the same XP would then count twice (bonus
 * and ledger). One query per PUT.
 */
async function legacyLabAllowance(env: Env, userId: string): Promise<Map<string, number>> {
  const rows = await env.DB.prepare(
    `SELECT p.ref AS ref FROM lab_progress p
     LEFT JOIN xp_ledger l ON l.user_id = p.user_id AND l.source = 'lab' AND l.ref = p.ref
     WHERE p.user_id = ? AND l.ref IS NULL`,
  ).bind(userId).all<{ ref: string }>();
  const allowance = new Map<string, number>();
  for (const { ref } of rows.results) {
    const lesson = labLessonOf(ref);
    if (lesson) allowance.set(lesson, (allowance.get(lesson) ?? 0) + LAB_XP);
  }
  return allowance;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/**
 * What PUT /api/state stores. Lessons: only keys of the generated catalog; `visited` only as a
 * timestamp between 2020-01-01 and now + 1 day; `done` as every completion the site and the
 * certificates (certificates/handlers.ts countDone) count: `true` (legacy) or a positive number,
 * clamped to now + 1 day (so 1, which mergeStates makes of `true` and a timestamp, is kept); `quiz` only in [0, 1];
 * `bonus` clamped to [0, the lesson's maxBonus] (in-lesson exercises and quizzes; lab XP is
 * not stored here) plus `legacyLabXp` for that lesson (legacyLabAllowance: lab passes from before the
 * XP ledger, whose XP the client of that time stored in bonus). notes, days, last and updated are only
 * type-checked; unknown fields are dropped. Values the client never writes are what this removes, so
 * an honest document round-trips unchanged.
 */
export function sanitizeStudyState(data: Record<string, unknown>, now = Date.now(), legacyLabXp: ReadonlyMap<string, number> = new Map()): StoredStudyState {
  const isTime = (v: unknown): v is number => isNumber(v) && v >= MIN_TIME && v <= now + DAY_MS;
  const limits = bonusCeilings();

  const lessons: StoredStudyState["lessons"] = {};
  if (isRecord(data.lessons)) {
    for (const [key, r] of Object.entries(data.lessons)) {
      const max = limits.get(key);
      if (max === undefined || !isRecord(r)) continue;
      const out: StoredStudyState["lessons"][string] = {};
      if (isTime(r.visited)) out.visited = r.visited;
      if (r.done === true) out.done = true;
      else if (isNumber(r.done) && r.done > 0) out.done = Math.min(r.done, now + DAY_MS);
      if (isNumber(r.quiz) && r.quiz >= 0 && r.quiz <= 1) out.quiz = r.quiz;
      if (isNumber(r.bonus)) {
        const bonus = Math.min(Math.max(Math.floor(r.bonus), 0), max + (legacyLabXp.get(key) ?? 0));
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
  const text = JSON.stringify(sanitizeStudyState(data as Record<string, unknown>, Date.now(), await legacyLabAllowance(env, user.sub)));
  // Only for accounts that still exist, so a stale token can't re-create deleted data
  await env.DB.prepare(
    `INSERT INTO user_state (github_id, data, updated_at)
     SELECT ?1, ?2, CURRENT_TIMESTAMP WHERE EXISTS (SELECT 1 FROM users WHERE github_id = ?1)
     ON CONFLICT(github_id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP`
  ).bind(user.sub, text).run();
  return json({ ok: true }, 200, origin, NO_STORE);
}
