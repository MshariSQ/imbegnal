"use client";

/**
 * Which API generation is deployed? The site can ship before the Worker does
 * (see docs/PLATFORM.md, "frontend-only mode"), so copy that describes cloud
 * features must not claim them while the API lacks them.
 *
 * Probe: GET /api/state with no token. The study-platform Worker answers 401;
 * the previous Worker has no such route and answers 404. Anything else
 * (offline, 5xx, blocked) stays "unknown", and the UI assumes the full API.
 * The sign-in callback (lib/auth-nonce.ts) awaits `getApiLevel()` and also
 * treats "unknown" as the full API, i.e. it fails closed.
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

let inflight: Promise<ApiLevel> | null = null;

/** One probe request: 404 = legacy, 401 = full, anything else (or no answer within `timeoutMs`) = unknown. */
async function probeOnce(timeoutMs: number): Promise<ApiLevel> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${API_URL}/api/state`, { signal: ctrl.signal, cache: "no-store" });
    return r.status === 404 ? "legacy" : r.status === 401 ? "full" : "unknown";
  } catch {
    return "unknown";
  } finally {
    clearTimeout(timer);
  }
}

export function probeApi(): void {
  if (started) return;
  started = true;
  inflight = probeOnce(10_000).then((l) => {
    setLevel(l);
    inflight = null;
    return l;
  });
}

/**
 * Resolves the API generation for code that must decide on it (the sign-in callback). Reuses a known
 * answer or a probe in flight; otherwise probes, retrying once when the answer is inconclusive.
 * Still "unknown" after that: callers that guard security decisions must treat it as the new API.
 */
export async function getApiLevel(): Promise<ApiLevel> {
  if (level !== "unknown") return level;
  if (inflight) {
    const l = await inflight;
    if (l !== "unknown") return l;
  }
  for (let attempt = 0; attempt < 2; attempt++) {
    const l = await probeOnce(5_000);
    if (l !== "unknown") {
      started = true;
      setLevel(l);
      return l;
    }
  }
  return "unknown";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useApiLevel(): ApiLevel {
  return useSyncExternalStore(subscribe, () => level, () => "unknown" as ApiLevel);
}
