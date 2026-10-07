/**
 * Typed client for the Code Lab part of the Worker API (docs/CODE_LAB.md §3).
 * Every function throws `LabApiError` (never a bare Error) so the UI can map
 * failures to messages; an aborted request rethrows the platform AbortError.
 */
import type {
  LanguagesApiResponse,
  QuotaInfo,
  RunApiRequest,
  RunApiResponse,
  RunDetail,
  RunsApiResponse,
  Snippet,
  SnippetCreateRequest,
  SnippetCreateResponse,
  SubmitRequest,
  SubmitResponse,
} from "../../shared/api";
import { API_URL } from "../site";
import { getToken } from "../auth";
import { LabApiError, isAbortError } from "./api-error";

/** Longest we wait for a run: compile (20 s) + run (15 s) ceilings plus queueing. */
export const RUN_REQUEST_TIMEOUT_MS = 60_000;
const DEFAULT_TIMEOUT_MS = 20_000;

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  /** Send the Bearer token (default true when one exists). */
  auth?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  const token = opts.auth === false ? null : getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  // Own controller so the timeout and the caller's signal both cancel the fetch.
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  if (opts.signal) {
    if (opts.signal.aborted) controller.abort();
    else opts.signal.addEventListener("abort", onAbort, { once: true });
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      signal: controller.signal,
    });
  } catch (err) {
    if (timedOut) throw new LabApiError(0, "timeout");
    if (isAbortError(err)) throw err;
    throw new LabApiError(0, "network");
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener("abort", onAbort);
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // empty or non-JSON body
  }
  if (!res.ok) {
    const body = (data && typeof data === "object" ? data : {}) as ConstructorParameters<typeof LabApiError>[2];
    throw new LabApiError(res.status, typeof body?.error === "string" ? body.error : `http_${res.status}`, body);
  }
  if (data === null || typeof data !== "object") throw new LabApiError(res.status, "bad_response");
  return data as T;
}

// ── Languages (cached in memory) ─────────────────────────────────────────────

const LANGUAGES_TTL_MS = 30_000;
let languagesCache: { at: number; value: LanguagesApiResponse } | null = null;
let languagesInflight: Promise<LanguagesApiResponse> | null = null;

export function fetchLanguages(opts: { force?: boolean; signal?: AbortSignal } = {}): Promise<LanguagesApiResponse> {
  if (!opts.force && languagesCache && Date.now() - languagesCache.at < LANGUAGES_TTL_MS) {
    return Promise.resolve(languagesCache.value);
  }
  if (!opts.force && languagesInflight) return languagesInflight;
  const p = request<LanguagesApiResponse>("/api/lab/languages", { auth: false, signal: opts.signal })
    .then((value) => {
      languagesCache = { at: Date.now(), value };
      return value;
    })
    .finally(() => {
      languagesInflight = null;
    });
  languagesInflight = p;
  return p;
}

export function clearLanguagesCache(): void {
  languagesCache = null;
}

// ── Runs ─────────────────────────────────────────────────────────────────────

export const runCode = (req: RunApiRequest, signal?: AbortSignal) =>
  request<RunApiResponse>("/api/lab/run", { method: "POST", body: req, signal, timeoutMs: RUN_REQUEST_TIMEOUT_MS });

export const fetchQuota = (signal?: AbortSignal) => request<QuotaInfo>("/api/lab/quota", { signal });

export function listRuns(opts: { limit?: number; before?: string; signal?: AbortSignal } = {}) {
  const q = new URLSearchParams();
  q.set("limit", String(opts.limit ?? 20));
  if (opts.before) q.set("before", opts.before);
  return request<RunsApiResponse>(`/api/lab/runs?${q.toString()}`, { signal: opts.signal });
}

export const getRunDetail = (id: string, signal?: AbortSignal) =>
  request<RunDetail>(`/api/lab/runs/${encodeURIComponent(id)}`, { signal });

// ── Snippets ─────────────────────────────────────────────────────────────────

export const createSnippet = (req: SnippetCreateRequest, signal?: AbortSignal) =>
  request<SnippetCreateResponse>("/api/lab/snippets", { method: "POST", body: req, signal });

export const fetchSnippet = (id: string, signal?: AbortSignal) =>
  request<Snippet>(`/api/lab/snippets/${encodeURIComponent(id)}`, { auth: false, signal });

// ── Challenges ───────────────────────────────────────────────────────────────

export const submitChallenge = (id: string, req: SubmitRequest, signal?: AbortSignal) =>
  request<SubmitResponse>(`/api/challenges/${encodeURIComponent(id)}/submit`, {
    method: "POST",
    body: req,
    signal,
    timeoutMs: RUN_REQUEST_TIMEOUT_MS,
  });
