"use client";

/**
 * Which graded lab exercises (lesson `lab` sections) the learner has passed, and
 * the lab XP they earned.
 *
 * - Guests: local-first, as before. A pass graded in this browser adds
 *   XP.exercise to the lesson's study-store `bonus`.
 * - Signed-in learners: the Worker is the XP authority (xp_ledger). A pass it
 *   graded is recorded with the XP it reported (`xpAwarded`); a pass graded in
 *   this browser (runner down, or "run in this browser") earns the Passed badge
 *   only and is remembered as unverified. GET /api/lab/progress (lib/sync.ts
 *   syncLabProgress → `mergeLabProgress`) merges the server's passes and keeps
 *   its lab XP total here, per user.
 *
 * Ref format: `${track}/${lesson}/${exerciseId}`.
 */
import { useSyncExternalStore } from "react";
import { XP, awardXp } from "./study-store";

const KEY = "imb-labs-v1";
/** `ServerLabXp`: the Worker's lab XP for one signed-in user. */
const SERVER_KEY = "imb-labs-server-v1";
/** Refs passed while signed in but graded in this browser (no XP yet). */
const UNVERIFIED_KEY = "imb-labs-unverified-v1";
const EMPTY: Readonly<Record<string, number>> = {};
const NONE: readonly string[] = [];
let cache: Record<string, number> | null = null;
let serverCache: ServerLabXp | null | undefined; // undefined: not read yet
let unverifiedCache: readonly string[] | null = null;
const listeners = new Set<() => void>();

export interface ServerLabXp {
  user: string;
  lab: number;
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

/** Marks a lab exercise passed. Returns the XP this pass earned (0 when it earned none). */
export function markLabPassed(ref: string, grader: LabGrader = { by: "local" }, at = Date.now()): number {
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
      return grader.xpAwarded;
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
      return XP.exercise;
    }
  }
}

/**
 * Merges what GET /api/lab/progress reported: the passes (no local XP: the Worker
 * awarded those) and, with `server`, the Worker's lab XP for that user. Passes the
 * server knows are no longer unverified.
 */
export function mergeLabProgress(passed: { ref: string; at: string }[], server?: { user: string; labXp: number }) {
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
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cache = null;
    else if (e.key === SERVER_KEY) serverCache = undefined;
    else if (e.key === UNVERIFIED_KEY) unverifiedCache = null;
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
