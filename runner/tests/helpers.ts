/**
 * Test helpers: a real RunnerService on a random port with a random secret, real HMAC
 * signing, and a probe for "is there a Docker daemon and the test image".
 */
import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { sign } from "../src/auth";
import { loadConfig, type RunnerConfig } from "../src/config";
import { createLogger } from "../src/log";
import { RunnerService } from "../src/server";
import { RUNNER_PATHS, SIG_HEADER, TS_HEADER, type RunRequest, type RunResult } from "../../shared/protocol";
import type { LangId } from "../../shared/languages";

export const TEST_IMAGE = process.env.RUNNER_TEST_IMAGE?.trim() || "imbegnal-runner:slim";

/** Reason to skip Docker-dependent tests, or null when the daemon and the image are there. */
export function dockerSkipReason(): string | false {
  const v = spawnSync("docker", ["version", "--format", "{{.Server.Version}}"], { encoding: "utf8", timeout: 10_000 });
  if (v.error || v.status !== 0) return "skipped: no reachable Docker daemon";
  const i = spawnSync("docker", ["image", "inspect", "--format", "{{.Id}}", TEST_IMAGE], { encoding: "utf8", timeout: 10_000 });
  if (i.status !== 0) return `skipped: image ${TEST_IMAGE} is not present (build it with runner/image/build.sh slim)`;
  return false;
}

export const SKIP = dockerSkipReason();

export interface TestServer {
  service: RunnerService;
  baseUrl: string;
  secret: string;
  /** Every JSON log line the server wrote. */
  logs: string[];
  /** Label (`imbegnal.test=<id>`) on every container this server creates. */
  label: string;
  config: RunnerConfig;
  close(): Promise<void>;
}

export interface ServerOverrides {
  env?: Record<string, string>;
  secret?: string;
}

export async function startServer(o: ServerOverrides = {}): Promise<TestServer> {
  const secret = o.secret ?? randomBytes(32).toString("hex");
  const id = randomBytes(6).toString("hex");
  const label = `imbegnal.test=${id}`;
  const config = loadConfig({
    RUNNER_SECRET: secret,
    RUNNER_PORT: "0",
    RUNNER_IMAGE: TEST_IMAGE,
    RUNNER_SMOKE_ON_START: "0",
    RUNNER_REAP_LABELS: label,
    RUNNER_SHUTDOWN_GRACE_MS: "3000",
    ...o.env,
  });
  const logs: string[] = [];
  const service = new RunnerService({ config, logger: createLogger({ level: "debug", sink: (l) => logs.push(l) }) });
  const port = await service.start();
  return {
    service,
    baseUrl: `http://127.0.0.1:${port}`,
    secret,
    logs,
    label,
    config,
    close: () => service.close(),
  };
}

export interface SignedOptions {
  method?: string;
  /** Raw body (string) to send; signed unless `signature` is given. */
  body?: string;
  timestamp?: string;
  signature?: string;
  secret?: string;
  headers?: Record<string, string>;
  omitSignature?: boolean;
  omitTimestamp?: boolean;
}

export async function signedFetch(srv: TestServer, path: string, o: SignedOptions = {}): Promise<{ status: number; json: unknown; headers: Headers }> {
  const method = o.method ?? (path === RUNNER_PATHS.run ? "POST" : "GET");
  const body = o.body ?? "";
  const timestamp = o.timestamp ?? String(Date.now());
  const headers: Record<string, string> = { ...(method === "POST" ? { "content-type": "application/json" } : {}), ...o.headers };
  if (!o.omitTimestamp) headers[TS_HEADER] = timestamp;
  if (!o.omitSignature) headers[SIG_HEADER] = o.signature ?? sign(o.secret ?? srv.secret, timestamp, body);
  const res = await fetch(`${srv.baseUrl}${path}`, { method, headers, body: method === "POST" ? body : undefined });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json, headers: res.headers };
}

export interface RunOptions {
  stdin?: string;
  limits?: RunRequest["limits"];
  jobId?: string;
}

/** POST /v1/run, signed, expecting HTTP 200 and a RunResult. */
export async function run(srv: TestServer, lang: LangId, code: string, o: RunOptions = {}): Promise<RunResult> {
  const req: RunRequest = { jobId: o.jobId ?? randomUUID(), lang, code, stdin: o.stdin ?? "", ...(o.limits ? { limits: o.limits } : {}) };
  const r = await signedFetch(srv, RUNNER_PATHS.run, { body: JSON.stringify(req) });
  if (r.status !== 200) throw new Error(`POST /v1/run answered ${r.status}: ${JSON.stringify(r.json)}`);
  return r.json as RunResult;
}

/** Names of containers carrying this test server's label (running or not). */
export function ownedContainers(srv: TestServer, extra: string[] = []): string[] {
  const out = execFileSync("docker", ["ps", "-a", "--filter", `label=${srv.label}`, ...extra, "--format", "{{.Names}}"], { encoding: "utf8" });
  return out.split("\n").map((s) => s.trim()).filter(Boolean);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
