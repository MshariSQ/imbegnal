"use client";

/**
 * Which graded lab exercises (lesson `lab` sections) the learner has passed, and
 * the lab XP they earned.
 *
 * - Guests: local-first, as before. A pass graded in this browser adds
 *   XP.exercise to the lesson's study-store `bonus`, recorded as a local award.
 * - Signed-in learners: the Worker is the XP authority (xp_ledger). A pass it
 *   graded is recorded with the XP it reported (`xpAwarded`); a pass graded in
 *   this browser (runner down, or "run in this browser") earns the Passed badge
 *   only and is remembered as unverified. GET /api/lab/progress (lib/sync.ts
 *   syncLabProgress → `mergeLabProgress`) merges the server's passes and keeps
 *   its lab XP total here, per user.
 * - One exercise counts once: when the Worker awards a ref (xpAwarded > 0, or GET /api/lab/progress
 *   reports ledger XP for it) that this browser had awarded locally, the local award is taken back out
 *   of the lesson bonus once (`takeBackLocalAward`). The study state is max-merged with the server copy
 *   (lib/study-store.ts mergeStates), which would add it back from a copy pushed earlier, so lib/sync.ts
 *   re-applies the removal after every pull until a push of the reduced document has succeeded.
 *   Residual: another device's copy of a local award (made there, or synced there before the removal)
 *   can come back through that device's next push. PUT /api/state never stores more than the lesson's
 *   maxBonus (plus pre-ledger lab passes), so that double count is bounded by the lesson's maxBonus.
 *
 * Ref format: `${track}/${lesson}/${exerciseId}`.
 */
import { useSyncExternalStore } from "react";
import { XP, awardXp, getStudyState, setStudyState, type StudyState } from "./study-store";

const KEY = "imb-labs-v1";
/** `ServerLabXp`: the Worker's lab XP for one signed-in user. */
const SERVER_KEY = "imb-labs-server-v1";
/** Refs passed while signed in but graded in this browser (no XP yet). */
const UNVERIFIED_KEY = "imb-labs-unverified-v1";
/** `LocalAward` per ref: the lab XP this browser put into the lesson's study-store bonus. */
const LOCAL_XP_KEY = "imb-labs-local-xp-v1";
const EMPTY: Readonly<Record<string, number>> = {};
const NONE: readonly string[] = [];
let cache: Record<string, number> | null = null;
let serverCache: ServerLabXp | null | undefined; // undefined: not read yet
let unverifiedCache: readonly string[] | null = null;
let localXpCache: Record<string, LocalAward> | null = null;
const listeners = new Set<() => void>();

export interface ServerLabXp {
  user: string;
  lab: number;
}

/**
 * One ref's lab XP that this browser added to its lesson's study-store bonus:
 *  - `{ xp }`: awarded here (a guest pass, or any pass of the client before the XP ledger), still in the bonus;
 *  - `{ xp: 0, removed, at }`: server-verified; `removed` XP was taken out of the bonus when the study state's
 *    `updated` was `at`, and that removal has not been pushed yet (lib/sync.ts re-applies it after a pull);
 *  - `{ xp: 0 }`: server-verified, the removal has reached the server copy.
 */
export interface LocalAward {
  xp: number;
  removed?: number;
  at?: number;
}

function load(): Record<string, number> {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    cache = {};
  }
  return cache;
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full/blocked — kept in memory for this session
  }
  listeners.forEach((l) => l());
}

function save(next: Record<string, number>) {
  cache = next;
  write(KEY, next);
}

function loadServer(): ServerLabXp | null {
  if (serverCache !== undefined) return serverCache;
  try {
    const v = JSON.parse(localStorage.getItem(SERVER_KEY) ?? "null") as Partial<ServerLabXp> | null;
    serverCache = v && typeof v.user === "string" && typeof v.lab === "number" && Number.isFinite(v.lab) ? { user: v.user, lab: v.lab } : null;
  } catch {
    serverCache = null;
  }
  return serverCache;
}

function saveServer(next: ServerLabXp) {
  serverCache = next;
  write(SERVER_KEY, next);
}

function loadUnverified(): readonly string[] {
  if (unverifiedCache) return unverifiedCache;
  try {
    const v = JSON.parse(localStorage.getItem(UNVERIFIED_KEY) ?? "[]") as unknown;
    unverifiedCache = Array.isArray(v) ? v.filter((r): r is string => typeof r === "string") : NONE;
  } catch {
    unverifiedCache = NONE;
  }
  return unverifiedCache;
}

function saveUnverified(next: readonly string[]) {
  unverifiedCache = next;
  write(UNVERIFIED_KEY, next);
}

function loadLocalXp(): Record<string, LocalAward> {
  if (localXpCache) return localXpCache;
  try {
    const raw = localStorage.getItem(LOCAL_XP_KEY);
    if (raw === null) {
      // First run of this code in this browser: the client before it added XP.exercise to the bonus for
      // every pass it recorded (origin/main markLabPassed), except passes merged from the server. Those
      // were server passes of the same account: the Worker never awards them again (lab_progress), so
      // counting them as local awards removes nothing. Seeded before any pass is recorded by this code.
      const seeded: Record<string, LocalAward> = {};
      const unverified = new Set(loadUnverified());
      for (const ref of Object.keys(load())) if (!unverified.has(ref)) seeded[ref] = { xp: XP.exercise };
      localXpCache = seeded;
      localStorage.setItem(LOCAL_XP_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const v = JSON.parse(raw) as unknown;
    localXpCache = v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, LocalAward>) : {};
  } catch {
    localXpCache = localXpCache ?? {};
  }
  return localXpCache;
}

function saveLocalXp(next: Record<string, LocalAward>) {
  localXpCache = next;
  write(LOCAL_XP_KEY, next);
}

/**
 * The Worker awarded `ref` (xp_ledger). If this browser had awarded it locally, take that award back out of
 * the lesson's bonus, once (never below 0), and mark the ref server-verified. Returns the XP taken out.
 */
function takeBackLocalAward(ref: string): number {
  const all = loadLocalXp();
  const award = all[ref];
  if (!award || !(award.xp > 0)) return 0;
  const [track, lesson] = ref.split("/");
  const key = `${track}/${lesson}`;
  const s = getStudyState();
  const bonus = s.lessons[key]?.bonus ?? 0;
  const removed = Math.min(award.xp, bonus);
  if (removed > 0) setStudyState({ ...s, lessons: { ...s.lessons, [key]: { ...s.lessons[key], bonus: bonus - removed || undefined } } });
  saveLocalXp({ ...all, [ref]: removed > 0 ? { xp: 0, removed, at: getStudyState().updated } : { xp: 0 } });
  return removed;
}

/**
 * For lib/sync.ts after a pull: `merged` is mergeStates(local, server copy), which takes the larger bonus,
 * so a server copy pushed before a removal brings the removed award back. Removals not pushed yet are
 * applied again: per lesson, bonus = max(local bonus, merged bonus - removed XP), so XP the server copy
 * adds on top (another device's quiz) is kept, and nothing goes below what this device has.
 */
export function reapplyLabXpRemovals(merged: StudyState, local: StudyState): StudyState {
  const pending = new Map<string, number>();
  for (const [ref, a] of Object.entries(loadLocalXp())) {
    if (!a.removed) continue;
    const [track, lesson] = ref.split("/");
    const key = `${track}/${lesson}`;
    pending.set(key, (pending.get(key) ?? 0) + a.removed);
  }
  let lessons = merged.lessons;
  for (const [key, removed] of pending) {
    const m = merged.lessons[key]?.bonus ?? 0;
    const l = local.lessons[key]?.bonus ?? 0;
    if (m <= l) continue;
    lessons = { ...lessons, [key]: { ...lessons[key], bonus: Math.max(l, m - removed) || undefined } };
  }
  return lessons === merged.lessons ? merged : { ...merged, lessons };
}

/** For lib/sync.ts after a successful push of the study state whose `updated` was `pushed`: those removals reached the server. */
export function settleLabXpRemovals(pushed: number) {
  const all = loadLocalXp();
  const settled = Object.entries(all).filter(([, a]) => a.removed && (a.at ?? 0) <= pushed);
  if (settled.length) saveLocalXp({ ...all, ...Object.fromEntries(settled.map(([ref]) => [ref, { xp: 0 }])) });
}

function dropUnverified(refs: ReadonlySet<string>) {
  const cur = loadUnverified();
  if (cur.some((r) => refs.has(r))) saveUnverified(cur.filter((r) => !refs.has(r)));
}

export function getLabProgress(): Readonly<Record<string, number>> {
  return typeof window === "undefined" ? EMPTY : load();
}

export function isLabPassed(ref: string): boolean {
  return !!getLabProgress()[ref];
}

/** The Worker's lab XP as last reported for whoever was signed in (null before any report). */
export function getServerLabXp(): ServerLabXp | null {
  return typeof window === "undefined" ? null : loadServer();
}

/** Refs passed while signed in but graded in this browser: Passed, but no XP yet. */
export function getUnverifiedLabs(): readonly string[] {
  return typeof window === "undefined" ? NONE : loadUnverified();
}

/**
 * Who graded a pass, which decides the XP it earns:
 *  - "local":      graded in this browser for a guest (or by a Worker too old to report
 *                  `xpAwarded`): XP.exercise goes to the lesson's study-store bonus, once
 *  - "server":     the Worker graded it; `xpAwarded` is what it wrote to xp_ledger
 *                  (0 when this exercise was already awarded)
 *  - "unverified": signed in but graded in this browser: the Passed badge, no XP
 */
export type LabGrader = { by: "local" } | { by: "server"; user: string; xpAwarded: number } | { by: "unverified" };

/** The grader of a passing Code Lab run: who is signed in, where it was graded, and what the Worker reported. */
export function labGrader(run: { user: string | null; gradeSource: "server" | "browser" | null; xpAwarded?: number }): LabGrader {
  if (run.gradeSource === "server" && run.user && run.xpAwarded !== undefined) return { by: "server", user: run.user, xpAwarded: run.xpAwarded };
  if (run.gradeSource === "browser" && run.user) return { by: "unverified" };
  return { by: "local" };
}

/**
 * Marks a lab exercise passed. Returns the XP this pass earned (0 when it earned none, also when the
 * Worker's award only replaces this browser's earlier local award for the same exercise).
 */
export function markLabPassed(ref: string, grader: LabGrader = { by: "local" }, at = Date.now()): number {
  loadLocalXp(); // the one-time seed reads the pass list before this pass is added to it
  const cur = load();
  const fresh = !cur[ref];
  if (fresh) save({ ...cur, [ref]: at });
  const unverified = loadUnverified().includes(ref);
  switch (grader.by) {
    case "server": {
      if (unverified) dropUnverified(new Set([ref]));
      const prev = loadServer();
      const lab = (prev?.user === grader.user ? prev.lab : 0) + grader.xpAwarded;
      if (prev?.user !== grader.user || prev.lab !== lab) saveServer({ user: grader.user, lab });
      return grader.xpAwarded > 0 ? grader.xpAwarded - takeBackLocalAward(ref) : 0;
    }
    case "unverified":
      if (fresh) saveUnverified([...loadUnverified(), ref]);
      return 0;
    default: {
      // Guests: once per exercise, as before (an unverified pass has not earned it yet).
      if (!fresh && !unverified) return 0;
      if (unverified) dropUnverified(new Set([ref]));
      const [track, lesson] = ref.split("/");
      awardXp(`${track}/${lesson}`, XP.exercise);
      saveLocalXp({ ...loadLocalXp(), [ref]: { xp: XP.exercise } });
      return XP.exercise;
    }
  }
}

/**
 * Merges what GET /api/lab/progress reported: the passes (no local XP: the Worker
 * awarded those) and, with `server`, the Worker's lab XP for that user. Passes the
 * server knows are no longer unverified, and a pass the ledger awarded (`xp`) takes
 * back this browser's local award for the same exercise.
 */
export function mergeLabProgress(passed: { ref: string; at: string; xp?: number }[], server?: { user: string; labXp: number }) {
  loadLocalXp(); // seed before the server's passes join the pass list
  const cur = load();
  let changed = false;
  const next = { ...cur };
  for (const p of passed) {
    if (!next[p.ref]) {
      next[p.ref] = Date.parse(p.at) || Date.now();
      changed = true;
    }
  }
  if (changed) save(next);
  if (!server) return;
  dropUnverified(new Set(passed.map((p) => p.ref)));
  const prev = loadServer();
  if (prev?.user !== server.user || prev.lab !== server.labXp) saveServer({ user: server.user, lab: server.labXp });
  for (const p of passed) if (typeof p.xp === "number" && p.xp > 0) takeBackLocalAward(p.ref);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cache = null;
    else if (e.key === SERVER_KEY) serverCache = undefined;
    else if (e.key === UNVERIFIED_KEY) unverifiedCache = null;
    else if (e.key === LOCAL_XP_KEY) localXpCache = null;
    else return;
    cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** All passed refs (empty during SSR/hydration → hydration-safe). */
export function useLabProgress(): Readonly<Record<string, number>> {
  return useSyncExternalStore(subscribe, getLabProgress, () => EMPTY);
}

export function useLabPassed(ref: string): boolean {
  return !!useLabProgress()[ref];
}

/** True when `ref` was passed in this browser while signed in, so it has not earned XP yet. */
export function useLabUnverified(ref: string): boolean {
  return useSyncExternalStore(subscribe, getUnverifiedLabs, () => NONE).includes(ref);
}

/** The Worker's lab XP for `user` (0 for guests, another user's figure, or before GET /api/lab/progress answered). */
export function useServerLabXp(user: string | null): number {
  const s = useSyncExternalStore(subscribe, getServerLabXp, () => null);
  return user && s?.user === user ? s.lab : 0;
}
