/**
 * Login nonce: binds an OAuth sign-in to the browser tab that started it (login-CSRF protection).
 *
 * Without it, anyone could send a victim https://imbegnal.com/auth/callback/#token=<attacker's JWT>
 * and silently sign them in to the attacker's account (whose notes, progress and Code Lab runs the
 * attacker can then read). Flow:
 *
 *   1. `begin()` on "Continue with GitHub/Google": a random 32-char base64url nonce goes to
 *      sessionStorage (per tab, with its creation time) and to the Worker as `?nonce=`.
 *   2. The Worker keeps it in its HttpOnly OAuth-state cookie and, on success, redirects to
 *      `/auth/callback/#token=...&nonce=...` (worker/src/util.ts).
 *   3. `check()` on the callback page accepts the token only if the fragment's nonce equals the
 *      stored one and is at most 10 minutes old. The stored nonce is deleted on every check (one use).
 *
 * Compatibility: the previous Worker never echoes a nonce. A fragment WITHOUT a nonce is accepted only
 * when the API is positively identified as that old ("legacy") Worker AND this tab holds a stored nonce
 * that is still within its 10 minutes (the old flow, too, starts with a click on the login button, so a
 * fresh tab opened from an attacker's link is refused). With the new API, or when the API generation
 * cannot be determined, it is refused (fail closed). The narrow residual window (a victim who is in the
 * middle of a sign-in in this very tab) is listed in docs/PLATFORM.md (Known gaps) and closes when the
 * new Worker is deployed.
 *
 * Pure apart from the injected storage/clock/random source, so it is unit-tested in tests/unit.
 */
import type { ApiLevel } from "./capabilities";

export const NONCE_KEY = "imb_login_nonce";
export const NONCE_TTL_MS = 10 * 60 * 1000;
/** Same rule as the Worker (worker/src/util.ts isValidNonce). */
export const NONCE_RE = /^[A-Za-z0-9_-]{16,64}$/;

export type NonceStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** 24 random bytes as base64url: exactly 32 characters, no padding. */
export function makeNonce(random: (bytes: Uint8Array) => Uint8Array = (b) => crypto.getRandomValues(b)): string {
  const bytes = random(new Uint8Array(24));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Creates and stores a fresh nonce (replacing any earlier one in this tab); returns it. */
export function begin(storage: NonceStorage, now: number, random?: (bytes: Uint8Array) => Uint8Array): string {
  const nonce = makeNonce(random);
  storage.setItem(NONCE_KEY, JSON.stringify({ n: nonce, t: now }));
  return nonce;
}

/** Drops the stored nonce (e.g. after an OAuth error). */
export function clear(storage: NonceStorage): void {
  storage.removeItem(NONCE_KEY);
}

function readStored(storage: NonceStorage): { n: string; t: number } | null {
  try {
    const v = JSON.parse(storage.getItem(NONCE_KEY) ?? "null") as unknown;
    if (v && typeof v === "object" && typeof (v as { n: unknown }).n === "string" && typeof (v as { t: unknown }).t === "number") {
      return v as { n: string; t: number };
    }
  } catch {
    /* corrupt entry: treated as missing */
  }
  return null;
}

/** Constant-time string comparison (the nonce is a secret for its short lifetime). */
function same(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export type CheckFailure =
  /** No token in the fragment. */
  | "missing_token"
  /** This tab started no sign-in (or a different one): the classic login-CSRF link. */
  | "nonce_mismatch"
  /** The tab's nonce is older than NONCE_TTL_MS. */
  | "nonce_expired"
  /** No nonce in the fragment while the API is (or may be) the new one. */
  | "nonce_missing";

export type CheckResult = { ok: true; token: string; legacy: boolean } | { ok: false; reason: CheckFailure };

export interface CheckOptions {
  storage: NonceStorage;
  /** Asked only when the fragment has no nonce. May be async (a network probe). */
  apiLevel: () => ApiLevel | Promise<ApiLevel>;
}

/**
 * Decides whether the callback fragment's token may be saved. Always consumes the stored nonce,
 * whatever the outcome, so a nonce works once.
 */
export async function check(fragment: URLSearchParams, now: number, { storage, apiLevel }: CheckOptions): Promise<CheckResult> {
  const stored = readStored(storage);
  clear(storage);

  const token = fragment.get("token");
  if (!token) return { ok: false, reason: "missing_token" };

  const fresh = (s: { t: number }) => now >= s.t && now - s.t <= NONCE_TTL_MS;

  const nonce = fragment.get("nonce");
  if (nonce === null || nonce === "") {
    // Only the old Worker may omit the nonce (it cannot echo one); anything else fails closed.
    if ((await apiLevel()) !== "legacy") return { ok: false, reason: "nonce_missing" };
    // Even then, only in a tab that just started a sign-in: the old Worker's real flow always begins
    // with a click on the login button (begin()), whereas an attacker's link opens a tab with nothing stored.
    if (!stored) return { ok: false, reason: "nonce_mismatch" };
    if (!fresh(stored)) return { ok: false, reason: "nonce_expired" };
    return { ok: true, token, legacy: true };
  }

  if (!stored || !NONCE_RE.test(nonce) || !same(nonce, stored.n)) return { ok: false, reason: "nonce_mismatch" };
  if (!fresh(stored)) return { ok: false, reason: "nonce_expired" };
  return { ok: true, token, legacy: false };
}

/** Browser helper for the sign-in buttons: a fresh nonce for this tab. Call it from an event handler, never during render. */
export function beginInBrowser(): string | null {
  try {
    return begin(window.sessionStorage, Date.now());
  } catch {
    // sessionStorage blocked: the flow continues without a nonce, and the callback (old or new API) refuses it.
    return null;
  }
}
