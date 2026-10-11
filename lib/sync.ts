"use client";

/**
 * Keeps the local study store and the user's server copy in sync.
 * Pull+merge once per page load, then push (debounced) after local changes.
 * Failures are silent: the local copy is always the source of truth for the UI.
 */
import { getCurrentUser, getToken, removeToken } from "./auth";
import { getStudyStateRemote, putStudyStateRemote } from "./api";
import { fetchLabProgress } from "./codelab/api";
import { mergeLabProgress } from "./lab-progress";
import { getStudyState, mergeStates, onStudyChange, setStudyState, type StudyState } from "./study-store";

const PUSH_DELAY = 2500;
let started = false;
let pushTimer: ReturnType<typeof setTimeout> | undefined;
let lastPushed = 0;

/**
 * The Worker answers 401 for a token it no longer accepts: revoked by signing out on another device
 * (POST /api/auth/logout ends every session), expired, or the account was deleted. Sign out here too,
 * unless the token has changed meanwhile (a new sign-in).
 */
function dropRejectedToken(e: unknown, token: string) {
  if (e instanceof Error && e.message === "API 401" && getToken() === token) {
    removeToken();
    started = false; // a later sign-in on this page pulls again
  }
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
  try {
    const { data } = await getStudyStateRemote(token);
    if (data && typeof data === "object") {
      const merged = mergeStates(getStudyState(), data as StudyState);
      setStudyState(merged, false);
    }
  } catch (e) {
    dropRejectedToken(e, token);
    // keep local state; we'll still push later
  }
  schedulePush();
  onStudyChange(schedulePush);
}

let labSync: { user: string; promise: Promise<void> } | null = null;

/**
 * Signed-in only: GET /api/lab/progress, then merge its passes and keep the lab XP the
 * Worker awarded (lib/lab-progress.ts). Calls for the same user while one is in flight
 * share it. Failures are silent (offline, or a Worker without the route): the local
 * copy stays as it is.
 */
export function syncLabProgress(user: string): Promise<void> {
  if (labSync?.user === user) return labSync.promise;
  const promise = fetchLabProgress()
    .then((res) => {
      if (getCurrentUser()?.sub !== user || !Array.isArray(res.passed)) return; // signed out or switched meanwhile
      const lab = res.xp?.lab;
      mergeLabProgress(res.passed, typeof lab === "number" && Number.isFinite(lab) ? { user, labXp: lab } : undefined);
    })
    .catch(() => {})
    .finally(() => {
      if (labSync?.promise === promise) labSync = null;
    });
  labSync = { user, promise };
  return promise;
}
