"use client";

/**
 * Keeps the local study store and the user's server copy in sync.
 * Pull+merge once per page load, then push (debounced) after local changes.
 * Failures are silent: the local copy is always the source of truth for the UI.
 */
import { getToken } from "./auth";
import { getStudyStateRemote, putStudyStateRemote } from "./api";
import { getStudyState, mergeStates, onStudyChange, setStudyState, type StudyState } from "./study-store";

const PUSH_DELAY = 2500;
let started = false;
let pushTimer: ReturnType<typeof setTimeout> | undefined;
let lastPushed = 0;

function schedulePush() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    const token = getToken();
    const state = getStudyState();
    if (!token || state.updated <= lastPushed) return;
    try {
      await putStudyStateRemote(state, token);
      lastPushed = state.updated;
    } catch {
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
  } catch {
    // keep local state; we'll still push later
  }
  schedulePush();
  onStudyChange(schedulePush);
}
