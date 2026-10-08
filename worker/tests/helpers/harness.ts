// Shared test harness: an Env over the D1 shim, signed user tokens, a request
// helper that goes through the real router (worker/src/index.ts) and a stub for
// the runner service that VERIFIES the HMAC signature independently.
import { createHmac } from "node:crypto";
import worker from "../../src/index";
import { type Env, signJWT } from "../../src/util";
import type { RunRequest, RunResult } from "../../../shared/protocol";
import { SIG_HEADER, TS_HEADER } from "../../../shared/protocol";
import { TestD1 } from "./d1";

export const JWT_SECRET = "test-jwt-secret-not-for-production";
export const RUNNER_SECRET = "test-runner-secret-0123456789abcdef";
export const RUNNER_URL = "https://runner.test";

export function makeEnv(db: TestD1, extra: Partial<Env> = {}): Env {
  return {
    DB: db as unknown as D1Database,
    GITHUB_CLIENT_ID: "x",
    GITHUB_CLIENT_SECRET: "x",
    JWT_SECRET,
    FRONTEND_URL: "https://imbegnal.com",
    WORKER_URL: "https://api.test",
    RUNNER_URL,
    RUNNER_SECRET,
    ...extra,
  };
}

export interface SeedUser {
  id: string;
  plan?: "free" | "pro";
  role?: "student" | "instructor" | "admin";
  status?: "active" | "suspended";
  suspendedUntil?: string | null;
  name?: string | null;
  username?: string;
}

export function addUser(db: TestD1, u: SeedUser): void {
  db.execute(
    "INSERT INTO users (github_id, username, name, plan, role, status, suspended_until) VALUES (?, ?, ?, ?, ?, ?, ?)",
    u.id,
    u.username ?? `user-${u.id.replace(/[^a-z0-9]/gi, "")}`,
    u.name === undefined ? `Name ${u.id}` : u.name,
    u.plan ?? "free",
    u.role ?? "student",
    u.status ?? "active",
    u.suspendedUntil ?? null,
  );
}

export async function tokenFor(sub: string, extra: Record<string, unknown> = {}): Promise<string> {
  return signJWT({ sub, username: `user-${sub}`, name: `Name ${sub}`, avatar: "", exp: Math.floor(Date.now() / 1000) + 3600, ...extra }, JWT_SECRET);
}

let ipCounter = 0;

export interface CallOptions {
  method?: string;
  token?: string | null;
  body?: unknown;
  /** Raw body (overrides `body`). */
  rawBody?: string;
  origin?: string;
  headers?: Record<string, string>;
}

/** Sends a request through the Worker's real router. Each call comes from a fresh client IP so the per-IP limiter never interferes. */
export async function call(env: Env, path: string, opts: CallOptions = {}): Promise<Response> {
  const headers: Record<string, string> = { "CF-Connecting-IP": `10.1.${(ipCounter >> 8) & 255}.${ipCounter++ & 255}`, ...opts.headers };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.origin) headers.Origin = opts.origin;
  const raw = opts.rawBody ?? (opts.body === undefined ? undefined : JSON.stringify(opts.body));
  if (raw !== undefined) headers["Content-Type"] = "application/json";
  const req = new Request(`https://api.test${path}`, { method: opts.method ?? (raw === undefined ? "GET" : "POST"), headers, body: raw });
  return worker.fetch(req, env, { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext);
}

export async function jsonOf<T = Record<string, unknown>>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

// ── Runner stub ───────────────────────────────────────────────────────────────

export const okResult = (over: Partial<RunResult> = {}): RunResult => ({
  jobId: "stub",
  status: "ok",
  exitCode: 0,
  signal: null,
  stdout: "Hello, World!\n",
  stderr: "",
  stdoutBytes: 14,
  stderrBytes: 0,
  truncated: { stdout: false, stderr: false },
  runMs: 12,
  compileMs: 0,
  ...over,
});

export interface SeenRequest {
  url: string;
  method: string;
  headers: Headers;
  rawBody: string;
  signatureValid: boolean;
  job?: RunRequest;
  signal?: AbortSignal | null;
}

export type RunnerHandler = (job: RunRequest, seen: SeenRequest) => RunResult | Response | Promise<RunResult | Response>;

export interface RunnerStub {
  seen: SeenRequest[];
  /** Requests currently waiting inside a handler. */
  readonly pending: number;
  restore(): void;
}

const hmacHex = (secret: string, data: string) => createHmac("sha256", secret).update(data).digest("hex");

/**
 * Replaces globalThis.fetch with a fake runner at RUNNER_URL. `onRun` decides the answer for POST /v1/run,
 * `languages` (default: all available) for GET /v1/languages. Requests whose HMAC does not verify get 401,
 * exactly like the real runner would, so a wrong signature shows up as a runner outage in tests.
 */
export function stubRunner(onRun: RunnerHandler, languages: () => Response | Promise<Response> = () => Response.json({ protocol: 1, driver: "docker", limits: {}, languages: [] })): RunnerStub {
  const original = globalThis.fetch;
  const stub: RunnerStub = {
    seen: [],
    pending: 0,
    restore() {
      globalThis.fetch = original;
    },
  };
  let pending = 0;
  Object.defineProperty(stub, "pending", { get: () => pending });

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!url.startsWith(RUNNER_URL)) throw new Error(`unexpected network access in test: ${url}`);
    const headers = new Headers(init?.headers);
    const rawBody = typeof init?.body === "string" ? init.body : "";
    const ts = headers.get(TS_HEADER) ?? "";
    const seen: SeenRequest = {
      url,
      method: init?.method ?? "GET",
      headers,
      rawBody,
      signal: init?.signal,
      signatureValid: headers.get(SIG_HEADER) === hmacHex(RUNNER_SECRET, `${ts}.${rawBody}`),
    };
    stub.seen.push(seen);
    if (!seen.signatureValid) return new Response("bad signature", { status: 401 });

    pending++;
    try {
      const path = new URL(url).pathname;
      if (path === "/v1/languages") return await languages();
      if (path === "/v1/run" && seen.method === "POST") {
        const job = JSON.parse(rawBody) as RunRequest;
        seen.job = job;
        const out = await onRun(job, seen);
        return out instanceof Response ? out : Response.json({ ...out, jobId: job.jobId });
      }
      return new Response("not found", { status: 404 });
    } finally {
      pending--;
    }
  }) as typeof fetch;
  return stub;
}

/** Never answers until the caller aborts (to test the Worker's own timeout): `await hang(seen.signal)`. */
export const hang = (signal?: AbortSignal | null): Promise<never> =>
  new Promise((_, reject) => {
    signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
  });
