"use client";

/**
 * Which graded lab exercises (lesson `lab` sections) the learner has passed.
 * Local-first like the study store: works for guests; signed-in users also get
 * the server's list merged in (GET /api/lab/progress → `mergeLabProgress`).
 *
 * Ref format: `${track}/${lesson}/${exerciseId}`.
 */
import { useSyncExternalStore } from "react";
import { XP, awardXp } from "./study-store";

const KEY = "imb-labs-v1";
const EMPTY: Readonly<Record<string, number>> = {};
let cache: Record<string, number> | null = null;
const listeners = new Set<() => void>();

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

function save(next: Record<string, number>) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full/blocked — kept in memory for this session
  }
  listeners.forEach((l) => l());
}

export function getLabProgress(): Readonly<Record<string, number>> {
  return typeof window === "undefined" ? EMPTY : load();
}

export function isLabPassed(ref: string): boolean {
  return !!getLabProgress()[ref];
}

/** Marks a lab exercise passed. Returns XP awarded (0 when it was already passed). */
export function markLabPassed(ref: string, at = Date.now()): number {
  const cur = load();
  if (cur[ref]) return 0;
  save({ ...cur, [ref]: at });
  const [track, lesson] = ref.split("/");
  awardXp(`${track}/${lesson}`, XP.exercise);
  return XP.exercise;
}

/** Merges passes reported by the server (no XP: those were awarded on the other device). */
export function mergeLabProgress(passed: { ref: string; at: string }[]) {
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
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
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
