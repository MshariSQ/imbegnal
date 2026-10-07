/**
 * Browser persistence for Code Lab: drafts per language/exercise, editor
 * preferences and the guest run history.
 *
 * Everything takes a `KV` (the subset of `Storage` we use) so the logic is
 * unit-testable and every read/write is wrapped: storage can be missing,
 * blocked, full or corrupted (private windows, cleared site data) and the lab
 * must keep working in memory.
 */

export interface KV {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** The page's localStorage, or null when it is unavailable. */
export function browserStorage(): KV | null {
  try {
    if (typeof window === "undefined") return null;
    const ls = window.localStorage;
    return ls ?? null;
  } catch {
    return null;
  }
}

export function readJson<T>(kv: KV | null, key: string, fallback: T): T {
  if (!kv) return fallback;
  try {
    const raw = kv.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(kv: KV | null, key: string, value: unknown): boolean {
  if (!kv) return false;
  try {
    kv.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ── Drafts ───────────────────────────────────────────────────────────────────

export interface Draft {
  code: string;
  stdin: string;
  /** Last edit, ms epoch. */
  at: number;
}
export type DraftMap = Record<string, Draft>;

export const DRAFTS_KEY = "imb-codelab-drafts-v1";
export const MAX_DRAFTS = 40;
/** A draft larger than this is not persisted (the runner accepts 64 KiB anyway). */
export const MAX_DRAFT_CHARS = 200_000;

/** What a draft belongs to. Free drafts are per language; others per exercise/challenge/snippet. */
export type DraftScope =
  | { kind: "free"; lang: string }
  | { kind: "exercise"; ref: string }
  | { kind: "demo"; ref: string }
  | { kind: "challenge"; id: string; lang: string }
  | { kind: "fork"; id: string };

export function draftKey(scope: DraftScope): string {
  switch (scope.kind) {
    case "free":
      return `free:${scope.lang}`;
    case "exercise":
      return `ex:${scope.ref}`;
    case "demo":
      return `demo:${scope.ref}`;
    case "challenge":
      return `ch:${scope.id}:${scope.lang}`;
    case "fork":
      return `fork:${scope.id}`;
  }
}

function isDraft(v: unknown): v is Draft {
  if (!v || typeof v !== "object") return false;
  const d = v as Record<string, unknown>;
  return typeof d.code === "string" && typeof d.stdin === "string" && typeof d.at === "number";
}

export function loadDrafts(kv: KV | null): DraftMap {
  const raw = readJson<Record<string, unknown>>(kv, DRAFTS_KEY, {});
  const out: DraftMap = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw)) if (isDraft(v)) out[k] = v;
  return out;
}

export function getDraft(kv: KV | null, key: string): Draft | null {
  return loadDrafts(kv)[key] ?? null;
}

/** Keeps the `max` most recently edited drafts. */
export function pruneDrafts(map: DraftMap, max = MAX_DRAFTS): DraftMap {
  const keys = Object.keys(map);
  if (keys.length <= max) return map;
  const keep = keys.sort((a, b) => map[b].at - map[a].at).slice(0, max);
  return Object.fromEntries(keep.map((k) => [k, map[k]]));
}

/** Saves a draft (pruning old ones). Returns false when it could not be stored. */
export function saveDraft(kv: KV | null, key: string, draft: Draft): boolean {
  if (draft.code.length > MAX_DRAFT_CHARS || draft.stdin.length > MAX_DRAFT_CHARS) return false;
  const next = pruneDrafts({ ...loadDrafts(kv), [key]: draft });
  return writeJson(kv, DRAFTS_KEY, next);
}

export function removeDraft(kv: KV | null, key: string): void {
  const map = loadDrafts(kv);
  if (!(key in map)) return;
  delete map[key];
  writeJson(kv, DRAFTS_KEY, map);
}

// ── Editor preferences ───────────────────────────────────────────────────────

export interface LabPrefs {
  fontSize: number;
  wrap: boolean;
  /** Last language used on /code-lab/ without a deep link. */
  lastLang?: string;
  /** Signed-in users: run JavaScript/Python in the browser instead of on the server. */
  preferBrowser: boolean;
}

export const PREFS_KEY = "imb-codelab-prefs-v1";
export const FONT_MIN = 12;
export const FONT_MAX = 22;
export const DEFAULT_PREFS: LabPrefs = { fontSize: 14, wrap: false, preferBrowser: false };

export function clampFont(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_PREFS.fontSize;
  return Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(n)));
}

export function loadPrefs(kv: KV | null): LabPrefs {
  const raw = readJson<Partial<LabPrefs>>(kv, PREFS_KEY, {});
  return {
    fontSize: typeof raw.fontSize === "number" ? clampFont(raw.fontSize) : DEFAULT_PREFS.fontSize,
    wrap: raw.wrap === true,
    lastLang: typeof raw.lastLang === "string" ? raw.lastLang : undefined,
    preferBrowser: raw.preferBrowser === true,
  };
}

export function savePrefs(kv: KV | null, prefs: LabPrefs): boolean {
  return writeJson(kv, PREFS_KEY, prefs);
}

// ── Guest history (browser runs) ─────────────────────────────────────────────

export interface LocalRun {
  id: string;
  lang: string;
  code: string;
  stdin: string;
  status: string;
  exitCode: number | null;
  runMs: number;
  /** ms epoch */
  at: number;
}

export const LOCAL_HISTORY_KEY = "imb-codelab-history-v1";
export const LOCAL_HISTORY_MAX = 20;
/** Runs with larger programs are simply not recorded. */
export const LOCAL_HISTORY_MAX_CODE = 50_000;

function isLocalRun(v: unknown): v is LocalRun {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.lang === "string" &&
    typeof r.code === "string" &&
    typeof r.stdin === "string" &&
    typeof r.status === "string" &&
    typeof r.runMs === "number" &&
    typeof r.at === "number"
  );
}

export function loadLocalHistory(kv: KV | null): LocalRun[] {
  const raw = readJson<unknown[]>(kv, LOCAL_HISTORY_KEY, []);
  return Array.isArray(raw) ? raw.filter(isLocalRun).slice(0, LOCAL_HISTORY_MAX) : [];
}

/** Newest first, capped at 20. Returns the list that is now stored. */
export function addLocalRun(kv: KV | null, run: LocalRun): LocalRun[] {
  if (run.code.length > LOCAL_HISTORY_MAX_CODE || run.stdin.length > LOCAL_HISTORY_MAX_CODE) return loadLocalHistory(kv);
  const next = [run, ...loadLocalHistory(kv).filter((r) => r.id !== run.id)].slice(0, LOCAL_HISTORY_MAX);
  writeJson(kv, LOCAL_HISTORY_KEY, next);
  return next;
}

export function clearLocalHistory(kv: KV | null): void {
  try {
    kv?.removeItem(LOCAL_HISTORY_KEY);
  } catch {
    // storage blocked: nothing to clear
  }
}
