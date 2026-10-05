"use client";

/**
 * Local-first study state: lesson progress, XP, streak days, notes.
 *
 * - Works for guests (localStorage only) — no account needed to learn.
 * - When signed in, lib/sync.ts merges it with the server copy so progress
 *   follows the user across devices.
 * - Exposed to React via useSyncExternalStore (no provider, no re-render storms).
 */
import { useSyncExternalStore } from "react";

export interface LessonRecord {
  visited?: number; // last visit (ms epoch)
  done?: number; // completion time (ms epoch)
  quiz?: number; // best quiz accuracy 0..1
  bonus?: number; // XP earned from exercises/quizzes inside the lesson
}

export interface NoteRecord {
  text: string;
  updated: number;
}

export interface StudyState {
  v: 1;
  lessons: Record<string, LessonRecord>; // key: "track/lesson"
  notes: Record<string, NoteRecord>;
  days: string[]; // local YYYY-MM-DD dates with learning activity (sorted, capped)
  last?: { key: string; at: number };
  updated: number;
}

export const XP = { lesson: 50, exercise: 15, quiz: 10 } as const;

const KEY = "imb-study-v1";
const MAX_DAYS = 400;
const EMPTY: StudyState = { v: 1, lessons: {}, notes: {}, days: [], updated: 0 };

let cache: StudyState | null = null;
const listeners = new Set<() => void>();

function load(): StudyState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as StudyState;
      return { ...EMPTY, ...s, lessons: s.lessons ?? {}, notes: s.notes ?? {}, days: s.days ?? [] };
    }
  } catch {
    // corrupted or blocked storage — start fresh
  }
  return migrateLegacy({ ...EMPTY });
}

/** One-time import of per-lesson completion stored by the original lesson UI. */
function migrateLegacy(s: StudyState): StudyState {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const m = k?.match(/^sf-lesson:([^:]+):([^:]+)$/);
      if (!m) continue;
      const p = JSON.parse(localStorage.getItem(k!) ?? "{}") as { done?: 1 };
      if (p.done) s.lessons[`${m[1]}/${m[2]}`] = { done: Date.now() };
    }
  } catch {
    // ignore — legacy data is best-effort
  }
  return s;
}

export function getStudyState(): StudyState {
  if (!cache) cache = load();
  return cache;
}

function emit() {
  listeners.forEach((l) => l());
}

/** Replace state (used by sync after a merge). `touch` bumps `updated`. */
export function setStudyState(next: StudyState, touch = true) {
  cache = touch ? { ...next, updated: Date.now() } : next;
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // quota exceeded — keep in memory for this session
  }
  emit();
}

function update(fn: (s: StudyState) => StudyState) {
  setStudyState(fn(getStudyState()));
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null; // another tab wrote — reload lazily
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useStudy(): StudyState {
  return useSyncExternalStore(subscribe, getStudyState, () => EMPTY);
}

// ── Dates & derived stats ─────────────────────────────────────────────────────

export function today(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const noopSubscribe = () => () => {};

/** Today's local date key. Empty during SSR/hydration so prerendered HTML never
 *  bakes in the build-time date (avoids hydration mismatches). */
export function useToday(): string {
  return useSyncExternalStore(noopSubscribe, () => today(), () => "");
}

function addDay(days: string[]): string[] {
  const t = today();
  if (days[days.length - 1] === t) return days;
  return [...days.filter((d) => d !== t), t].sort().slice(-MAX_DAYS);
}

/** Consecutive active days ending today (or yesterday, so the streak survives until midnight). */
export function streak(s: StudyState): number {
  const set = new Set(s.days);
  const d = new Date();
  if (!set.has(today(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(today(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Level curve: each level needs 100 XP more than the previous (L1 at 0, L2 at 100, L3 at 300…). */
export function levelInfo(xp: number) {
  let level = 1;
  let floor = 0;
  let need = 100;
  while (xp >= floor + need) {
    floor += need;
    level++;
    need += 100;
  }
  return { level, progress: (xp - floor) / need, toNext: floor + need - xp };
}

/**
 * XP is derived from per-lesson records (never stored as a single counter),
 * so merging two devices' progress can't double-count or lose XP.
 */
export function totalXp(s: StudyState): number {
  let xp = 0;
  for (const r of Object.values(s.lessons)) xp += (r.done ? XP.lesson : 0) + (r.bonus ?? 0);
  return xp;
}

export function completedCount(s: StudyState, keys?: string[]): number {
  const list = keys ?? Object.keys(s.lessons);
  return list.filter((k) => s.lessons[k]?.done).length;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function visitLesson(key: string) {
  update((s) => ({
    ...s,
    lessons: { ...s.lessons, [key]: { ...s.lessons[key], visited: Date.now() } },
    last: { key, at: Date.now() },
  }));
}

/** Marks a lesson complete. Returns XP awarded (0 if it was already done). */
export function completeLesson(key: string): number {
  const s = getStudyState();
  if (s.lessons[key]?.done) return 0;
  update((st) => ({
    ...st,
    lessons: { ...st.lessons, [key]: { ...st.lessons[key], done: Date.now() } },
    days: addDay(st.days),
  }));
  return XP.lesson;
}

/** Adds exercise/quiz XP to a lesson and counts today as an active day. */
export function awardXp(key: string, amount: number) {
  update((s) => ({
    ...s,
    lessons: { ...s.lessons, [key]: { ...s.lessons[key], bonus: (s.lessons[key]?.bonus ?? 0) + amount } },
    days: addDay(s.days),
  }));
}

export function recordQuiz(key: string, accuracy: number) {
  update((s) => {
    const prev = s.lessons[key]?.quiz ?? 0;
    return { ...s, lessons: { ...s.lessons, [key]: { ...s.lessons[key], quiz: Math.max(prev, accuracy) } } };
  });
}

export function setNote(key: string, text: string) {
  update((s) => {
    const notes = { ...s.notes };
    if (text.trim()) notes[key] = { text, updated: Date.now() };
    else delete notes[key];
    return { ...s, notes };
  });
}

// ── Merge (used by server sync) ───────────────────────────────────────────────

/** Conflict-free merge of two devices' states: completions union, newest notes win. */
export function mergeStates(a: StudyState, b: StudyState): StudyState {
  const lessons: Record<string, LessonRecord> = { ...a.lessons };
  for (const [k, r] of Object.entries(b.lessons ?? {})) {
    const l = lessons[k] ?? {};
    lessons[k] = {
      visited: Math.max(l.visited ?? 0, r.visited ?? 0) || undefined,
      done: l.done && r.done ? Math.min(l.done, r.done) : l.done ?? r.done,
      quiz: Math.max(l.quiz ?? 0, r.quiz ?? 0) || undefined,
      bonus: Math.max(l.bonus ?? 0, r.bonus ?? 0) || undefined,
    };
  }
  const notes: Record<string, NoteRecord> = { ...a.notes };
  for (const [k, n] of Object.entries(b.notes ?? {})) {
    if (!notes[k] || n.updated > notes[k].updated) notes[k] = n;
  }
  const days = [...new Set([...(a.days ?? []), ...(b.days ?? [])])].sort().slice(-MAX_DAYS);
  const last = (a.last?.at ?? 0) >= (b.last?.at ?? 0) ? a.last : b.last;
  return {
    v: 1,
    lessons,
    notes,
    days,
    last,
    updated: Math.max(a.updated ?? 0, b.updated ?? 0),
  };
}

/** Non-React change listener (used by the sync engine). */
export function onStudyChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
