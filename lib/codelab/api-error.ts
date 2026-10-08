/**
 * The one error type the Code Lab API client throws. Kept in its own tiny
 * module (no browser globals) so the error-to-message mapping stays unit-testable.
 */
import type { ApiErrorBody, QuotaError } from "../../shared/api";

export type LabErrorCode =
  | "network" // fetch failed (offline, DNS, CORS, blocked)
  | "timeout" // the client gave up waiting
  | "bad_response" // 2xx but not the JSON we expected
  | string; // any ApiErrorBody.error from the Worker

export class LabApiError extends Error {
  /** HTTP status; 0 when the request never got a response. */
  readonly status: number;
  readonly code: LabErrorCode;
  /** Parsed error body when the Worker sent one. */
  readonly body?: Partial<QuotaError> & ApiErrorBody;

  constructor(status: number, code: LabErrorCode, body?: Partial<QuotaError> & ApiErrorBody) {
    super(`Lab API ${status}: ${code}`);
    this.name = "LabApiError";
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

export function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (typeof err === "object" && err !== null && (err as { name?: string }).name === "AbortError")
  );
}
