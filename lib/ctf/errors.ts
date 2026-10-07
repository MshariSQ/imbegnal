/**
 * Maps API failures to a small set of UI situations. Pure; the localized copy
 * for each kind lives in lib/i18n-ctf.ts (`ctf.errors`).
 */
import { CtfApiError } from "./api";

export type SubmitFailureKind =
  | "signin" //     401: missing or stale token
  | "rate" //       429 rate_limited (retry-after countdown)
  | "quota" //      429 quota_exceeded (daily/global/concurrency)
  | "suspended" //  403 account_suspended
  | "forbidden" //  403 other
  | "runner" //     503 runner_unavailable
  | "invalid" //    400 invalid_request
  | "notfound" //   404
  | "network" //    fetch failed / offline
  | "generic";

export function classifyFailure(err: unknown): { kind: SubmitFailureKind; retryAfterSec?: number } {
  if (!(err instanceof CtfApiError)) return { kind: "generic" };
  const { status, code } = err;
  if (status === 0 || code === "network") return { kind: "network" };
  if (status === 401 || code === "unauthorized") return { kind: "signin" };
  if (code === "account_suspended") return { kind: "suspended" };
  if (status === 403) return { kind: "forbidden" };
  if (status === 404 || code === "not_found") return { kind: "notfound" };
  if (code === "rate_limited") return { kind: "rate", retryAfterSec: err.retryAfterSec };
  if (status === 429 || code === "quota_exceeded") return { kind: "quota", retryAfterSec: err.retryAfterSec };
  if (code === "runner_unavailable" || status === 503) return { kind: "runner" };
  if (status === 400 || code === "invalid_request") return { kind: "invalid" };
  return { kind: "generic" };
}

/** `/login/?next=` back to the current page (path + query), never an absolute URL. */
export function loginHref(next: string): string {
  return `/login/?next=${encodeURIComponent(next)}`;
}
