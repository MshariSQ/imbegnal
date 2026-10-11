"use client";

/**
 * Keeps the local study store and the user's server copy in sync.
 * Pull+merge once per page load, then push (debounced) after local changes.
 * Failures are silent: the local copy is always the source of truth for the UI.
 */
import { getCurrentUser, getToken, removeToken } from "./auth";
import { getStudyStateRemote, putStudyStateRemote } from "./api";
import { fetchLabProgress } from "./codelab/api";
import { LabApiError } from "./codelab/api-error";
import { mergeLabProgress } from "./lab-progress";
import { getStudyState, mergeStates, onStudyChange, setStudyState, type StudyState } from "./study-store";

const PUSH_DELAY = 2500;
let started = false;
let pushTimer: ReturnType<typeof setTimeout> | undefined;
let lastPushed = 0;

/*
 * What signs this tab out — ONE rule, applied in ONE place (dropRejectedToken):
 *
 *   the study-state endpoint (/api/state: the GET probe on page load or sign-in, or a PUT push)
 *   answers 401 for the token that is still the stored one.
 *
 * Every guarded Worker route shares one guard (worker/src/auth/guard.ts), so a 401 means that token is
 * dead: revoked by a sign-out on another device (POST /api/auth/logout ends every session), expired, or
 * the account is gone. Nothing else signs out:
 *   - 403 (account_suspended: the token is fine, the account is paused; lib/suspension.ts), 404 (a Worker
 *     without the route), 5xx and network errors keep the user signed in and the local copy as it is
 *     (a push that failed is retried on the next change);
 *   - a 401 for a token that is no longer stored (a new sign-in meanwhile) changes nothing;
 *   - other routes never sign out by themselves. syncLabProgress follows the rule: a 401 from
 *     GET /api/lab/progress only asks the state probe about the same token (probeState), and the probe
 *     signs out if it answers 401 too. Concurrent probes for one token share one request, and
 *     dropRejectedToken acts only while the token is still stored, so a tab is signed out once.
 */
function dropRejectedToken(e: unknown, token: string) {
  if (e instanceof Error && e.message === "API 401" && getToken() === token) {
    removeToken();
    started = false; // a later sign-in on this page pulls again
  }
}

let probing: { token: string; promise: Promise<{ data: unknown } | null> } | null = null;

/** GET /api/state with `token` (the state probe): its answer, or null after any failure (401 signs out, see above). */
function probeState(token: string): Promise<{ data: unknown } | null> {
  if (probing?.token === token) return probing.promise;
  const promise = getStudyStateRemote(token)
    .catch((e: unknown) => {
      dropRejectedToken(e, token);
      return null;
    })
    .finally(() => {
      if (probing?.promise === promise) probing = null;
    });
  probing = { token, promise };
  return promise;
}

function schedulePush() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    const token = getToken();
    const state = getStudyState();
    if (!token || state.updated <= lastPushed) return;
    try {
      await putStudyStateRemote(state, token);
      lastPushed = state.updated;
    } catch (e) {
      dropRejectedToken(e, token);
      // offline or server error — retry on the next change
    }
  }, PUSH_DELAY);
}

export async function startSync() {
  if (started) return;
  started = true;
  const token = getToken();
  if (!token) {
    started = false;
    return;
  }
  const res = await probeState(token); // null: failed (keep local state; we'll still push later)
  const data = res?.data;
  if (data && typeof data === "object") {
    const merged = mergeStates(getStudyState(), data as StudyState);
    setStudyState(merged, false);
  }
  schedulePush();
  onStudyChange(schedulePush);
}

let labSync: { user: string; promise: Promise<void> } | null = null;

/**
 * Signed-in only: GET /api/lab/progress, then merge its passes and keep the lab XP the
 * Worker awarded (lib/lab-progress.ts). Calls for the same user while one is in flight
 * share it. Failures change nothing locally (offline, 403 suspended, 404 from a Worker
 * without the route); a Worker that answers without `xp` (before the XP ledger) still
 * merges the passes. A 401 never signs out here: it asks the state probe (rule above).
 */
export function syncLabProgress(user: string): Promise<void> {
  if (labSync?.user === user) return labSync.promise;
  const token = getToken(); // the token fetchLabProgress sends
  const promise = fetchLabProgress()
    .then((res) => {
      if (getCurrentUser()?.sub !== user || !Array.isArray(res.passed)) return; // signed out or switched meanwhile
      const lab = res.xp?.lab;
      mergeLabProgress(res.passed, typeof lab === "number" && Number.isFinite(lab) ? { user, labXp: lab } : undefined);
    })
    .catch(async (e: unknown) => {
      if (token && e instanceof LabApiError && e.status === 401 && getToken() === token) await probeState(token);
    })
    .finally(() => {
      if (labSync?.promise === promise) labSync = null;
    });
  labSync = { user, promise };
  return promise;
}
