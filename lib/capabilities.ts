"use client";

/**
 * Which API generation is deployed? The site can ship before the Worker does
 * (see docs/PLATFORM.md, "frontend-only mode"), so copy that describes cloud
 * features must not claim them while the API lacks them.
 *
 * Probe: GET /api/state with no token. The study-platform Worker answers 401;
 * the previous Worker has no such route and answers 404. Anything else
 * (offline, 5xx, blocked) stays "unknown", and the UI assumes the full API.
 */
import { useSyncExternalStore } from "react";
import { API_URL } from "./site";

export type ApiLevel = "unknown" | "full" | "legacy";

let level: ApiLevel = "unknown";
let started = false;
const listeners = new Set<() => void>();

function setLevel(next: ApiLevel) {
  if (next === level) return;
  level = next;
  listeners.forEach((l) => l());
}

export function probeApi(): void {
  if (started) return;
  started = true;
  fetch(`${API_URL}/api/state`)
    .then((r) => setLevel(r.status === 404 ? "legacy" : r.status === 401 ? "full" : "unknown"))
    .catch(() => {});
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useApiLevel(): ApiLevel {
  return useSyncExternalStore(subscribe, () => level, () => "unknown" as ApiLevel);
}
