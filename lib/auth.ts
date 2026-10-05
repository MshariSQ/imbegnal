import { useSyncExternalStore } from "react";

export interface AuthUser {
  sub: string;
  username: string;
  name: string;
  avatar: string;
  exp: number;
}

const TOKEN_KEY = "sf_token";

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  notifyAuthChange();
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  notifyAuthChange();
}

export function parseToken(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // The payload is UTF-8 (display names may be Arabic); atob alone yields Latin-1 bytes.
    const bin = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))) as AuthUser;
    // Pure check (no side effects) — it also runs during React render.
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getCurrentUser(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  return parseToken(token);
}

export function signOut(): void {
  removeToken();
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  window.location.href = `${base}/`;
}

// ── React binding ─────────────────────────────────────────────────────────────
// A tiny external store so every component re-renders on sign-in/out without a
// context provider. Snapshot is the raw token string (stable between reads).

const authListeners = new Set<() => void>();

export function notifyAuthChange(): void {
  authListeners.forEach((l) => l());
}

function subscribeAuth(cb: () => void) {
  authListeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === TOKEN_KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    authListeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** Current signed-in user (null for guests and during prerender). */
export function useAuthUser(): AuthUser | null {
  const token = useSyncExternalStore(subscribeAuth, getToken, () => null);
  return token ? parseToken(token) : null;
}
