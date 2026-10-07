// Client for the runner service (shared/protocol.ts). The Worker is the trusted
// caller: it signs every request with HMAC-SHA256, never follows redirects,
// bounds the wait, and validates the runner's JSON before trusting any of it.
// Failures NEVER throw: they come back as an "internal_error" result with the
// message "runner_unavailable" so the caller can refund the quota.
import type { LanguageAvailability, LanguagesApiResponse } from "../../../shared/api";
import { LANG_IDS, type LangId } from "../../../shared/languages";
import {
  RUNNER_CEILING,
  RUNNER_DEFAULTS,
  SIG_HEADER,
  TS_HEADER,
  type RunLimits,
  type RunRequest,
  type RunResult,
  type RunStatus,
} from "../../../shared/protocol";
import type { Env } from "../util";
import { stripControl } from "./config";

/** Slack on top of compile + run limits for queueing, container start-up and the network. */
const TIMEOUT_SLACK_MS = 5_000;
const LANGUAGES_TIMEOUT_MS = 4_000;
/** Largest response body we will read (two 64 KiB streams plus compiler output, JSON-escaped). */
const MAX_RESPONSE_BYTES = 1024 * 1024;
const MAX_MESSAGE_CHARS = 300;

const STATUSES: readonly RunStatus[] = [
  "ok",
  "compile_error",
  "runtime_error",
  "timeout",
  "memory_limit",
  "output_limit",
  "unsupported",
  "internal_error",
];

export interface RunOnRunnerRequest {
  lang: LangId;
  code: string;
  stdin: string;
  limits?: RunLimits;
}

// ── Signing ───────────────────────────────────────────────────────────────────

/** hex( HMAC-SHA256(secret, `${timestamp}.${rawBody}`) ), exactly as shared/protocol.ts specifies. */
export async function signRunnerRequest(secret: string, timestamp: string, rawBody: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${rawBody}`));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Configuration ─────────────────────────────────────────────────────────────

interface RunnerConfig {
  /** Base URL without trailing slash, e.g. https://runner.example.com */
  base: string;
  secret: string;
}

/** https only; plain http is accepted for loopback hosts (local development). */
function runnerConfig(env: Env): RunnerConfig | null {
  const raw = env.RUNNER_URL?.trim();
  const secret = env.RUNNER_SECRET;
  if (!raw || !secret) return null;
  try {
    const u = new URL(raw);
    const loopback = u.hostname === "localhost" || u.hostname === "127.0.0.1" || u.hostname === "[::1]";
    if (u.protocol !== "https:" && !(u.protocol === "http:" && loopback)) return null;
    if (u.username || u.password || u.search || u.hash) return null;
    return { base: `${u.origin}${u.pathname.replace(/\/+$/, "")}`, secret };
  } catch {
    return null;
  }
}

// ── Response validation ───────────────────────────────────────────────────────

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.trunc(v))) : fallback;
}

/** String capped at `max` chars; `clipped` tells whether anything was cut. */
function capString(v: unknown, max: number): { text: string; clipped: boolean } | null {
  if (v === undefined || v === null) return { text: "", clipped: false };
  if (typeof v !== "string") return null;
  return v.length > max ? { text: v.slice(0, max), clipped: true } : { text: v, clipped: false };
}

/** The runner's JSON → RunResult, or null when its shape cannot be trusted. */
export function parseRunnerResult(raw: unknown, jobId: string): RunResult | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.status !== "string" || !(STATUSES as readonly string[]).includes(raw.status)) return null;
  const status = raw.status as RunStatus;

  const keep = RUNNER_CEILING.outputKeepBytes;
  const stdout = capString(raw.stdout, keep);
  const stderr = capString(raw.stderr, keep);
  const compile = capString(raw.compileOutput, keep);
  if (!stdout || !stderr || !compile) return null;

  let message: string | undefined;
  if (typeof raw.message === "string") {
    message = stripControl(raw.message).trim().slice(0, MAX_MESSAGE_CHARS) || undefined;
  }
  // An infrastructure failure reported by the runner may carry internals; callers get a stable code.
  if (status === "internal_error") message = "runner_error";

  const trunc = isRecord(raw.truncated) ? raw.truncated : {};
  const signal = typeof raw.signal === "string" && /^[A-Z0-9_]{1,24}$/.test(raw.signal) ? raw.signal : null;

  return {
    jobId,
    status,
    exitCode: typeof raw.exitCode === "number" && Number.isFinite(raw.exitCode) ? clampInt(raw.exitCode, -2_147_483_648, 2_147_483_647, 0) : null,
    signal,
    stdout: stdout.text,
    stderr: stderr.text,
    ...(compile.text ? { compileOutput: compile.text } : {}),
    stdoutBytes: clampInt(raw.stdoutBytes, 0, Number.MAX_SAFE_INTEGER, stdout.text.length),
    stderrBytes: clampInt(raw.stderrBytes, 0, Number.MAX_SAFE_INTEGER, stderr.text.length),
    truncated: { stdout: trunc.stdout === true || stdout.clipped, stderr: trunc.stderr === true || stderr.clipped },
    runMs: clampInt(raw.runMs, 0, 3_600_000, 0),
    compileMs: clampInt(raw.compileMs, 0, 3_600_000, 0),
    ...(message ? { message } : {}),
  };
}

function unavailable(jobId: string): RunResult {
  return {
    jobId,
    status: "internal_error",
    exitCode: null,
    signal: null,
    stdout: "",
    stderr: "",
    stdoutBytes: 0,
    stderrBytes: 0,
    truncated: { stdout: false, stderr: false },
    runMs: 0,
    compileMs: 0,
    message: "runner_unavailable",
  };
}

/** Callers may only LOWER the runner's own limits; clamp to the protocol ceilings. */
function sanitizeLimits(limits: RunLimits | undefined): RunLimits | undefined {
  if (!limits) return undefined;
  const out: RunLimits = {};
  if (limits.compileTimeoutMs !== undefined) out.compileTimeoutMs = clampInt(limits.compileTimeoutMs, 100, RUNNER_CEILING.compileTimeoutMs, RUNNER_DEFAULTS.compileTimeoutMs);
  if (limits.runTimeoutMs !== undefined) out.runTimeoutMs = clampInt(limits.runTimeoutMs, 100, RUNNER_CEILING.runTimeoutMs, RUNNER_DEFAULTS.runTimeoutMs);
  if (limits.memoryMb !== undefined) out.memoryMb = clampInt(limits.memoryMb, 16, RUNNER_CEILING.memoryMb, RUNNER_DEFAULTS.memoryMb);
  return out;
}

/** Reads the body as text, refusing anything over MAX_RESPONSE_BYTES. */
async function readCapped(res: Response): Promise<string | null> {
  const declared = Number(res.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_RESPONSE_BYTES) return null;
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

/** One signed request. Returns parsed JSON, or null for any transport / HTTP / body problem. */
async function callRunner(cfg: RunnerConfig, method: "GET" | "POST", path: string, rawBody: string, timeoutMs: number): Promise<unknown> {
  const timestamp = String(Date.now());
  const signature = await signRunnerRequest(cfg.secret, timestamp, rawBody);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${cfg.base}${path}`, {
      method,
      headers: { [TS_HEADER]: timestamp, [SIG_HEADER]: signature, ...(method === "POST" ? { "content-type": "application/json" } : {}), accept: "application/json" },
      ...(method === "POST" ? { body: rawBody } : {}),
      redirect: "manual",
      signal: controller.signal,
    });
    if (!res.ok) {
      await res.body?.cancel().catch(() => {});
      return null;
    }
    const text = await readCapped(res);
    return text === null ? null : JSON.parse(text);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Runs one program on the runner. NEVER throws: an unconfigured, unreachable,
 * slow or misbehaving runner yields status "internal_error" with the message
 * "runner_unavailable".
 */
export async function runOnRunner(env: Env, req: RunOnRunnerRequest): Promise<RunResult> {
  const jobId = crypto.randomUUID();
  try {
    const cfg = runnerConfig(env);
    if (!cfg) return unavailable(jobId);
    const limits = sanitizeLimits(req.limits);
    const payload: RunRequest = { jobId, lang: req.lang, code: req.code, stdin: req.stdin, ...(limits ? { limits } : {}) };
    const compileMs = limits?.compileTimeoutMs ?? RUNNER_DEFAULTS.compileTimeoutMs;
    const runMs = limits?.runTimeoutMs ?? RUNNER_DEFAULTS.runTimeoutMs;
    const raw = await callRunner(cfg, "POST", "/v1/run", JSON.stringify(payload), compileMs + runMs + TIMEOUT_SLACK_MS);
    return (raw === null ? null : parseRunnerResult(raw, jobId)) ?? unavailable(jobId);
  } catch {
    return unavailable(jobId);
  }
}

// ── Language availability (GET /api/lab/languages) ────────────────────────────

const CACHE_UP_MS = 30_000;
const CACHE_DOWN_MS = 10_000;
let languagesCache: { key: string; at: number; ttl: number; value: LanguagesApiResponse } | null = null;

/** Test hook: forget the cached availability. */
export function resetLanguagesCache(): void {
  languagesCache = null;
}

const none = (runner: LanguagesApiResponse["runner"]): LanguagesApiResponse => ({
  runner,
  languages: LANG_IDS.map((id) => ({ id, available: false })),
});

export async function getLanguages(env: Env): Promise<LanguagesApiResponse> {
  const cfg = runnerConfig(env);
  if (!cfg) return none("unconfigured");
  const key = cfg.base;
  const now = Date.now();
  if (languagesCache && languagesCache.key === key && now - languagesCache.at < languagesCache.ttl) return languagesCache.value;

  const raw = await callRunner(cfg, "GET", "/v1/languages", "", LANGUAGES_TIMEOUT_MS);
  let value: LanguagesApiResponse;
  if (isRecord(raw) && Array.isArray(raw.languages)) {
    const reported = new Map<string, LanguageAvailability>();
    for (const l of raw.languages) {
      if (!isRecord(l) || typeof l.id !== "string" || l.available !== true) continue;
      const version = typeof l.version === "string" ? stripControl(l.version).trim().slice(0, 60) : "";
      reported.set(l.id, { id: l.id as LangId, available: true, ...(version ? { version } : {}) });
    }
    value = { runner: "up", languages: LANG_IDS.map((id) => reported.get(id) ?? { id, available: false }) };
  } else {
    value = none("down");
  }
  languagesCache = { key, at: now, ttl: value.runner === "up" ? CACHE_UP_MS : CACHE_DOWN_MS, value };
  return value;
}
