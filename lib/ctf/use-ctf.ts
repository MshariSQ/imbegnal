"use client";

/**
 * Client state for the Challenges UI, all hydration-safe: every store is read
 * through useSyncExternalStore with a server snapshot, so the first client
 * render matches the prerendered HTML and real values appear after mount.
 *
 *   useChallengeStats()  live stats from GET /api/challenges (shared, deduped, 60 s fresh)
 *   useSolvedCache()     solved ids cached in localStorage for instant badges
 *   useNow()             a once-a-minute clock (null on the server) for relative times
 */
import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { ChallengeStat, ChallengesApiResponse } from "../../shared/api";
import { getCurrentUser, getToken, useAuthUser } from "../auth";
import { fetchChallenges } from "./api";
import { indexStats, solvedSet, withAttempt, withHint, withSolve, type StatsIndex } from "./stats";
import { addSolved, parseSolved, readSolvedRaw, syncSolved, type StorageLike } from "./solved-cache";

// ── localStorage handle ──────────────────────────────────────────────────────
function storage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

// ── solved-id cache ──────────────────────────────────────────────────────────
const solvedListeners = new Set<() => void>();
const notifySolved = () => solvedListeners.forEach((l) => l());

function subscribeSolved(cb: () => void) {
  solvedListeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key?.startsWith("imb-ctf-solved:") && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    solvedListeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** Solved ids cached for the signed-in user (empty on the server, for guests and during hydration). */
export function useSolvedCache(): ReadonlySet<string> {
  const sub = useAuthUser()?.sub;
  const raw = useSyncExternalStore(subscribeSolved, () => (sub ? readSolvedRaw(storage(), sub) : ""), () => "");
  return useMemo(() => new Set(parseSolved(raw)), [raw]);
}

// ── live stats store ─────────────────────────────────────────────────────────
export interface StatsState {
  status: "idle" | "loading" | "ok" | "error";
  stats: ChallengeStat[];
  index: StatsIndex;
  me?: ChallengesApiResponse["me"];
  /** viewer the data belongs to: user sub or "anon" */
  key: string;
  fetchedAt: number;
}

const EMPTY_INDEX: StatsIndex = new Map();
const INITIAL: StatsState = { status: "idle", stats: [], index: EMPTY_INDEX, key: "", fetchedAt: 0 };
const FRESH_MS = 60_000;

let state: StatsState = INITIAL;
let requestSeq = 0;
const listeners = new Set<() => void>();

function setState(next: StatsState) {
  state = next;
  listeners.forEach((l) => l());
}

const subscribeStats = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

/** Fetch stats for the current viewer unless fresh data for them is already here (or in flight). */
export function loadChallengeStats(force = false): void {
  const user = getCurrentUser();
  const key = user?.sub ?? "anon";
  const sameViewer = state.key === key;
  if (!force && sameViewer && state.status === "loading") return;
  if (!force && sameViewer && state.status === "ok" && Date.now() - state.fetchedAt < FRESH_MS) return;

  const seq = ++requestSeq;
  // Keep showing the same viewer's previous numbers while refreshing; never another viewer's.
  setState(sameViewer && state.status === "ok" ? { ...state, status: "loading" } : { ...INITIAL, status: "loading", key });

  fetchChallenges(user ? getToken() : null)
    .then((res) => {
      if (seq !== requestSeq) return;
      const stats = Array.isArray(res.stats) ? res.stats : [];
      const index = indexStats(stats);
      setState({ status: "ok", stats, index, me: res.me, key, fetchedAt: Date.now() });
      if (user) {
        syncSolved(storage(), user.sub, stats.filter((s) => s.mine?.solved).map((s) => s.id));
        notifySolved();
      }
    })
    .catch(() => {
      if (seq !== requestSeq) return;
      setState({ ...(sameViewer ? state : INITIAL), status: "error", key });
    });
}

function patchStat(id: string, fn: (s: ChallengeStat | undefined) => ChallengeStat) {
  const next = fn(state.index.get(id));
  const stats = state.index.has(id) ? state.stats.map((s) => (s.id === id ? next : s)) : [...state.stats, next];
  // Patching must not mark data fresh: keep fetchedAt so the next visit refetches.
  setState({ ...state, stats, index: indexStats(stats) });
}

/** Reflect a correct submission locally: stat, points header and the solved cache. */
export function recordSolve(id: string, r: { awarded: number; firstBlood: boolean; alreadySolved: boolean }, who?: { name: string; username?: string }) {
  const user = getCurrentUser();
  patchStat(id, (s) => withSolve(s, id, r, new Date().toISOString(), who));
  if (!r.alreadySolved && state.me) {
    setState({ ...state, me: { ...state.me, points: state.me.points + r.awarded, solved: state.me.solved + 1 } });
  }
  if (user) {
    addSolved(storage(), user.sub, id);
    notifySolved();
  }
}

export const recordHint = (id: string, index: number) => patchStat(id, (s) => withHint(s, id, index));
export const recordAttempt = (id: string) => patchStat(id, (s) => withAttempt(s, id));

/** Stats + the solved set (server-authoritative once loaded, local cache before that). */
export function useChallengeStats() {
  const user = useAuthUser();
  const sub = user?.sub;
  const snap = useSyncExternalStore(subscribeStats, () => state, () => INITIAL);
  const cache = useSolvedCache();

  useEffect(() => {
    loadChallengeStats();
  }, [sub]);

  // Data that belongs to a different viewer (just signed in/out) counts as not loaded yet.
  const mine = snap.key === (sub ?? "anon");
  const serverIndex = mine && snap.status === "ok" ? snap.index : null;
  const solved = useMemo(() => solvedSet({ signedIn: !!sub, serverStats: serverIndex, cache }), [sub, serverIndex, cache]);
  return {
    status: mine ? snap.status : "loading",
    index: mine ? snap.index : EMPTY_INDEX,
    me: mine ? snap.me : undefined,
    solved,
    signedIn: !!sub,
    reload: () => loadChallengeStats(true),
  };
}

// ── clock ────────────────────────────────────────────────────────────────────
const clockListeners = new Set<() => void>();
let clock = 0;
let clockTimer: ReturnType<typeof setInterval> | undefined;

const minute = () => Math.floor(Date.now() / 60_000) * 60_000;

function subscribeClock(cb: () => void) {
  clockListeners.add(cb);
  if (clockListeners.size === 1) {
    clock = minute();
    clockTimer = setInterval(() => {
      clock = minute();
      clockListeners.forEach((l) => l());
    }, 60_000);
  }
  return () => {
    clockListeners.delete(cb);
    if (clockListeners.size === 0 && clockTimer) clearInterval(clockTimer);
  };
}

/** Current time in ms, rounded to the minute; null while prerendering/hydrating. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribeClock, () => clock || (clock = minute()), () => null);
}
