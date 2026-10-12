"use client";

/**
 * Which graded lab exercises (lesson `lab` sections) the learner has passed, and the lab XP shown for them.
 *
 * Lab XP is never put into the synced study state (lib/study-store.ts `bonus`): that state is max-merged
 * between devices and the server copy (mergeStates), so XP added there could not be taken out again when
 * the Worker awards the same exercise. Instead:
 *  - Guests: a pass graded in this browser earns LAB_XP once per exercise, kept per ref in this browser
 *    only (GUEST_KEY, never synced). lib/xp.ts adds the sum to a guest's total.
 *  - Signed-in learners: the Worker is the XP authority (xp_ledger). A pass it graded and recorded is
 *    kept with the XP it reported (`xpAwarded`), and GET /api/lab/progress (lib/sync.ts syncLabProgress →
 *    `mergeLabProgress`) brings the Worker's lab XP and passes for that user (SERVER_KEY). lib/xp.ts adds
 *    that lab XP to a signed-in total; guest awards never count there. Any other pass is unverified for
 *    that user (the Passed badge and the "checked on the server" note, no XP): graded in this browser,
 *    or graded by a Worker too old to report `xpAwarded`. After signing in, a guest's passes are
 *    unverified passes of that user until the Worker awards them.
 *  - Legacy: the client before this change (origin/main 79314d1 and earlier) added LAB_XP to the lesson's
 *    `bonus` for every pass it recorded, and that XP stays there (PUT /api/state keeps it for server passes
 *    from before the ledger: worker/src/state.ts legacyLabAllowance; a browser-graded one shares the
 *    lesson's maxBonus). A pass in the list without a GUEST_KEY entry is such a pass: it counts as earned
 *    for everyone on this device and earns no guest XP again. Residual: if the Worker later awards the
 *    same exercise, that lab counts twice for the learner, bounded by the lesson's maxBonus on the server
 *    copy.
 *
 * Ref format: `${track}/${lesson}/${exerciseId}`.
 */
import { useSyncExternalStore } from "react";
import { LAB_XP } from "../shared/xp";

/** ref → pass time: every pass recorded on this device (the Passed badge), whoever was signed in. */
const KEY = "imb-labs-v1";
/** `ServerLabXp`: what the Worker reported for one signed-in user. */
const SERVER_KEY = "imb-labs-server-v1";
/**
 * ref → the lab XP a guest earned for it in this browser: LAB_XP, or 0 for a pass this code recorded
 * without guest XP (signed in, or merged from the server). A passed ref without an entry is legacy (above).
 */
const GUEST_KEY = "imb-labs-guest-xp-v1";
const EMPTY: Readonly<Record<string, number>> = {};
let cache: Record<string, number> | null = null;
let serverCache: ServerLabXp | null | undefined; // undefined: not read yet
let guestCache: Record<string, number> | null = null;
const listeners = new Set<() => void>();

export interface ServerLabXp {
  user: string;
  /** The Worker's lab XP for `user` (GET /api/lab/progress xp.lab, plus xpAwarded of runs graded since). */
  lab: number;
  /** Passes the Worker has recorded for `user` (lab_progress): their XP is the Worker's, or legacy bonus. */
  refs: readonly string[];
}

function readRecord(key: string): Record<string, number> {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? "null") as unknown;
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full/blocked — kept in memory for this session
  }
  listeners.forEach((l) => l());
}

function load(): Record<string, number> {
  return (cache ??= readRecord(KEY));
}

function save(next: Record<string, number>) {
  cache = next;
  write(KEY, next);
}

function loadGuest(): Record<string, number> {
  return (guestCache ??= readRecord(GUEST_KEY));
}

function saveGuest(next: Record<string, number>) {
  guestCache = next;
  write(GUEST_KEY, next);
}

function loadServer(): ServerLabXp | null {
  if (serverCache !== undefined) return serverCache;
  try {
    const v = JSON.parse(localStorage.getItem(SERVER_KEY) ?? "null") as Partial<ServerLabXp> | null;
    serverCache =
      v && typeof v.user === "string" && typeof v.lab === "number" && Number.isFinite(v.lab)
        ? { user: v.user, lab: v.lab, refs: Array.isArray(v.refs) ? v.refs.filter((r): r is string => typeof r === "string") : [] }
        : null;
  } catch {
    serverCache = null;
  }
  return serverCache;
}

function saveServer(next: ServerLabXp) {
  serverCache = next;
  write(SERVER_KEY, next);
}

/** Records the passes in the device list; a new one gets a guest entry of 0 unless `legacy` says its XP is in the bonus. */
function recordPasses(passes: { ref: string; at: number; legacy?: boolean }[]) {
  const cur = load();
  const fresh = passes.filter((p) => !cur[p.ref]);
  if (!fresh.length) return;
  const guest = loadGuest();
  const entries = fresh.filter((p) => !p.legacy && guest[p.ref] === undefined);
  if (entries.length) saveGuest({ ...guest, ...Object.fromEntries(entries.map((p) => [p.ref, 0])) });
  save({ ...cur, ...Object.fromEntries(fresh.map((p) => [p.ref, p.at])) });
}

export function getLabProgress(): Readonly<Record<string, number>> {
  return typeof window === "undefined" ? EMPTY : load();
}

export function isLabPassed(ref: string): boolean {
  return !!getLabProgress()[ref];
}

/** The Worker's lab XP and passes as last reported for whoever was signed in (null before any report). */
export function getServerLabXp(): ServerLabXp | null {
  return typeof window === "undefined" ? null : loadServer();
}

/** The Worker's lab XP for `user` (0 for another user's figure, or before GET /api/lab/progress answered). */
export function serverLabXpOf(user: string): number {
  const s = getServerLabXp();
  return s?.user === user ? s.lab : 0;
}

/** The lab XP guests earned in this browser (never synced; it counts only while nobody is signed in). */
export function getGuestLabXp(): number {
  if (typeof window === "undefined") return 0;
  let sum = 0;
  for (const xp of Object.values(loadGuest())) if (typeof xp === "number" && xp > 0) sum += xp;
  return sum;
}

/**
 * True when `ref` is passed on this device but its XP does not count for `user` (null: a guest): for a
 * signed-in user, the Worker has not recorded that pass; for a guest, it was passed only while signed in.
 * Legacy passes (XP in the lesson bonus) are never unverified.
 */
export function isLabUnverified(ref: string, user: string | null): boolean {
  if (!isLabPassed(ref)) return false;
  const guest = loadGuest()[ref];
  if (guest === undefined) return false; // legacy
  if (user === null) return !(guest > 0);
  const s = loadServer();
  return !(s?.user === user && s.refs.includes(ref));
}

/**
 * Who graded a pass, which decides the XP it earns:
 *  - "local":      a guest, graded in this browser: LAB_XP in this browser's guest awards, once
 *  - "server":     the Worker graded and recorded it; `xpAwarded` is what it wrote to xp_ledger
 *                  (0 when this exercise was already awarded)
 *  - "unverified": signed in, but no XP from the Worker: graded in this browser, or by a Worker too
 *                  old to report `xpAwarded`: the Passed badge, no XP
 */
export type LabGrader = { by: "local" } | { by: "server"; user: string; xpAwarded: number } | { by: "unverified"; user: string };

/** The grader of a passing Code Lab run: who is signed in, where it was graded, and what the Worker reported. */
export function labGrader(run: { user: string | null; gradeSource: "server" | "browser" | null; xpAwarded?: number }): LabGrader {
  if (!run.user) return { by: "local" };
  if (run.gradeSource === "server" && typeof run.xpAwarded === "number") return { by: "server", user: run.user, xpAwarded: run.xpAwarded };
  return { by: "unverified", user: run.user };
}

/** Marks a lab exercise passed. Returns the XP this pass earned for whoever is using the site (0 when none). */
export function markLabPassed(ref: string, grader: LabGrader = { by: "local" }, at = Date.now()): number {
  recordPasses([{ ref, at }]);
  switch (grader.by) {
    case "server": {
      const prev = loadServer();
      const same = prev?.user === grader.user;
      const refs = same ? prev.refs : [];
      const lab = (same ? prev.lab : 0) + grader.xpAwarded;
      if (!same || prev.lab !== lab || !refs.includes(ref)) saveServer({ user: grader.user, lab, refs: refs.includes(ref) ? refs : [...refs, ref] });
      return grader.xpAwarded;
    }
    case "unverified":
      return 0;
    default: {
      // Guests: once per exercise. Not for a legacy pass (no entry: its XP is in the bonus already).
      const guest = loadGuest();
      if (guest[ref] !== 0) return 0;
      saveGuest({ ...guest, [ref]: LAB_XP });
      return LAB_XP;
    }
  }
}

/**
 * Merges what GET /api/lab/progress reported: the passes (no guest XP) and, with `server`, the Worker's
 * lab XP and recorded passes for that user, which replace this browser's figure for that user. A pass
 * the Worker recorded before the ledger (no `xp`) earned its XP in the synced bonus: it is legacy.
 */
export function mergeLabProgress(passed: { ref: string; at: string; xp?: number }[], server?: { user: string; labXp: number }) {
  recordPasses(passed.map((p) => ({ ref: p.ref, at: Date.parse(p.at) || Date.now(), legacy: !!server && !(typeof p.xp === "number" && p.xp > 0) })));
  if (!server) return;
  const prev = loadServer();
  // Passes this browser saw the Worker record since the request was sent are kept (same user only).
  const refs = [...new Set([...passed.map((p) => p.ref), ...(prev?.user === server.user ? prev.refs : [])])];
  if (prev?.user !== server.user || prev.lab !== server.labXp || refs.length !== prev.refs.length) saveServer({ user: server.user, lab: server.labXp, refs });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cache = null;
    else if (e.key === SERVER_KEY) serverCache = undefined;
    else if (e.key === GUEST_KEY) guestCache = null;
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

/** isLabUnverified for `user` (null: a guest), kept current. */
export function useLabUnverified(ref: string, user: string | null): boolean {
  return useSyncExternalStore(subscribe, () => isLabUnverified(ref, user), () => false);
}

/** The Worker's lab XP for `user` (0 for guests, another user's figure, or before GET /api/lab/progress answered). */
export function useServerLabXp(user: string | null): number {
  const s = useSyncExternalStore(subscribe, getServerLabXp, () => null);
  return user && s?.user === user ? s.lab : 0;
}

/** getGuestLabXp, kept current (0 during SSR/hydration). */
export function useGuestLabXp(): number {
  return useSyncExternalStore(subscribe, getGuestLabXp, () => 0);
}
