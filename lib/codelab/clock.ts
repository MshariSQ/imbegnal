"use client";

/**
 * A shared, hydration-safe clock. Components that print relative times or
 * count down read `useNow()` instead of calling `Date.now()` during render:
 * the server snapshot is 0 (callers treat 0 as "not mounted yet"), and the
 * client value only advances while at least one component is subscribed.
 */
import { useSyncExternalStore } from "react";

let current = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();
const TICK_MS = 1000;

function tick() {
  current = Date.now();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) {
    current = Date.now();
    timer = setInterval(tick, TICK_MS);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => current;
const getServerSnapshot = () => 0;

/** Epoch ms, refreshed every second while mounted; 0 during prerender/hydration. */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
