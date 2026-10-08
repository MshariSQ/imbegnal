/**
 * Typed client for the Challenges part of the Worker API (shapes: shared/api.ts).
 * Errors are normalised into CtfApiError so the UI can map the stable machine
 * `error` code to a localized message (see errors.ts).
 */
import type { ApiErrorBody, ChallengesApiResponse, LeaderboardResponse, SubmitRequest, SubmitResponse } from "../../shared/api";
import type { ChallengeHintResponse } from "../../shared/challenges";
import { API_URL } from "../site";
import { isL10nText } from "./hints";

export class CtfApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly body?: Partial<ApiErrorBody> & { scope?: string; resetAt?: string; retryAfterSec?: number },
    /** Seconds from the Retry-After header, when present. */
    public readonly retryAfterHeader?: number
  ) {
    super(`API ${status}: ${code}`);
    this.name = "CtfApiError";
  }

  /** Seconds to wait before retrying (body hint first, then header), when the server gave one. */
  get retryAfterSec(): number | undefined {
    const v = this.body?.retryAfterSec ?? this.retryAfterHeader;
    return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : undefined;
  }
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
}

async function request<T>(path: string, { method = "GET", body, token, signal }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new CtfApiError(0, "network");
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as CtfApiError["body"];
    const ra = Number(res.headers.get("retry-after"));
    throw new CtfApiError(res.status, typeof data?.error === "string" ? data.error : "error", data, Number.isFinite(ra) && res.headers.get("retry-after") !== null ? ra : undefined);
  }
  // 204 / empty bodies are fine for fire-and-forget endpoints (open, hint)
  return (await res.json().catch(() => ({}))) as T;
}

/** GET /api/challenges: stats for every challenge, plus the caller's progress when a token is sent. */
export const fetchChallenges = (token?: string | null, signal?: AbortSignal) =>
  request<ChallengesApiResponse>("/api/challenges", { token, signal });

/** POST /api/challenges/:id/open: stamps the first-open time (time-to-solve). Idempotent server-side. */
export const openChallenge = (id: string, token: string) =>
  request<unknown>(`/api/challenges/${encodeURIComponent(id)}/open`, { method: "POST", body: {}, token });

/**
 * POST /api/challenges/:id/hint {index}. This is the ONLY way the text of a hint reaches the page
 * (besides `mine.revealedHints` of GET /api/challenges for hints already revealed): the public
 * challenge data carries just the cost. An answer without a well-formed text counts as a failure,
 * so nothing is shown as revealed that the server did not actually hand over.
 */
export async function revealHint(id: string, index: number, token: string): Promise<ChallengeHintResponse> {
  const res = await request<Partial<ChallengeHintResponse>>(`/api/challenges/${encodeURIComponent(id)}/hint`, { method: "POST", body: { index }, token });
  if (!isL10nText(res.text)) throw new CtfApiError(200, "invalid_response");
  return res as ChallengeHintResponse;
}

/** POST /api/challenges/:id/submit */
export const submitChallenge = (id: string, req: SubmitRequest, token: string) =>
  request<SubmitResponse>(`/api/challenges/${encodeURIComponent(id)}/submit`, { method: "POST", body: req, token });

/** GET /api/leaderboard?track=&period= */
export const fetchLeaderboard = (opts: { track: string; period: "all" | "week" }, token?: string | null, signal?: AbortSignal) => {
  const q = new URLSearchParams({ period: opts.period });
  if (opts.track !== "all") q.set("track", opts.track);
  return request<LeaderboardResponse>(`/api/leaderboard?${q.toString()}`, { token, signal });
};
