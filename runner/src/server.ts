/**
 * The runner's HTTP service.
 *
 *   GET  /healthz       no auth, no details
 *   GET  /v1/languages  signed   -> LanguagesResponse
 *   POST /v1/run        signed   -> RunResult (HTTP 200 whenever a job ran, whatever its outcome)
 *
 * Request order for /v1/run: bounded body read -> HMAC + timestamp window -> content type ->
 * strict validation -> replay check -> slot queue -> execute. Errors are `{error, message?}`
 * (shared/protocol.ts RunnerErrorCode) and never carry host paths, environment or stack traces.
 */
import { randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import {
  RUNNER_DEFAULTS,
  RUNNER_PATHS,
  RUNNER_PROTOCOL_VERSION,
  SIG_HEADER,
  TS_HEADER,
  type LanguagesResponse,
  type RunResult,
  type RunnerErrorBody,
  type RunnerErrorCode,
} from "../../shared/protocol";
import { ReplayGuard, verifyRequest } from "./auth";
import { Availability } from "./availability";
import type { RunnerConfig } from "./config";
import { Docker } from "./docker";
import { JobExecutor } from "./executor";
import { getRecipe } from "./languages";
import type { Logger } from "./log";
import { BusyError, SlotQueue } from "./queue";
import { Reaper } from "./reaper";
import { MAX_BODY_BYTES, validateRunRequest } from "./validate";

const JSON_CONTENT_TYPE = /^application\/json\s*(;|$)/i;
/** Signed GET requests carry no body; anything bigger than this is not ours. */
const MAX_EMPTY_BODY_BYTES = 1024;

class BodyTooLarge extends Error {}

function readBody(req: IncomingMessage, limit: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const declared = Number(req.headers["content-length"]);
    if (Number.isFinite(declared) && declared > limit) {
      reject(new BodyTooLarge());
      return;
    }
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > limit) {
        chunks.length = 0;
        reject(new BodyTooLarge());
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks, size)));
    req.on("error", (e) => reject(e));
    req.on("aborted", () => reject(new Error("aborted")));
  });
}

function send(res: ServerResponse, status: number, body: unknown, extraHeaders: Record<string, string> = {}): void {
  if (res.headersSent || res.writableEnded) return;
  const payload = Buffer.from(JSON.stringify(body));
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": String(payload.length),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...extraHeaders,
  });
  res.end(payload);
}

function sendError(res: ServerResponse, status: number, error: RunnerErrorCode, message?: string, extra: Record<string, string> = {}): void {
  const body: RunnerErrorBody = message ? { error, message } : { error };
  send(res, status, body, extra);
}

export interface RunnerServiceOptions {
  config: RunnerConfig;
  logger: Logger;
  /** Override the docker wrapper (tests). */
  docker?: Docker;
  /** Unique id of this process, stamped on its containers. */
  instance?: string;
}

export class RunnerService {
  readonly config: RunnerConfig;
  readonly instance: string;
  readonly docker: Docker;
  readonly executor: JobExecutor;
  readonly availability: Availability;
  readonly reaper: Reaper;
  readonly slots: SlotQueue;
  private readonly log: Logger;
  private readonly replay: ReplayGuard;
  private readonly server: Server;
  private readonly jobs = new Map<AbortController, Promise<unknown>>();
  private shuttingDown = false;
  private closed: Promise<void> | null = null;
  /** Resolves when the start-up language smoke tests have finished. */
  ready: Promise<void> = Promise.resolve();

  constructor(opts: RunnerServiceOptions) {
    this.config = opts.config;
    this.log = opts.logger;
    this.instance = opts.instance ?? randomUUID().slice(0, 12);
    this.docker =
      opts.docker ??
      new Docker({
        bin: opts.config.dockerBin,
        host: opts.config.dockerHost,
        runtime: opts.config.dockerRuntime,
        image: opts.config.image,
        owner: this.instance,
        extraLabels: opts.config.reapLabels,
        logger: opts.logger,
      });
    this.executor = new JobExecutor(this.docker, this.log);
    this.slots = new SlotQueue(opts.config.maxConcurrency, opts.config.queueMax, opts.config.queueTimeoutMs);
    this.availability = new Availability(
      opts.config.enabledLangs,
      this.executor,
      this.slots,
      this.log,
      opts.config.availabilityTtlMs,
      opts.config.smokeOnStart,
    );
    this.replay = new ReplayGuard(opts.config.replayTtlMs);
    this.reaper = new Reaper(
      this.docker,
      () => this.executor.activeContainers,
      this.log,
      Math.max(opts.config.reapAgeMs, 1000),
      opts.config.reapIntervalMs,
    );

    this.server = createServer((req, res) => {
      this.handle(req, res).catch((e: unknown) => {
        // Last resort: the client gets a bare 500, the operator a class name (no message, no stack).
        this.log.error("unhandled request error", { error: e instanceof Error ? e.name : "error" });
        sendError(res, 500, "internal_error");
      });
    });
    this.server.requestTimeout = 30_000;
    this.server.headersTimeout = 15_000;
    this.server.keepAliveTimeout = 5_000;
  }

  /** Bind, sweep orphans, kick off the language smoke tests. Resolves with the bound port. */
  async start(): Promise<number> {
    if (this.config.prepull && (await this.docker.ping()) && !(await this.docker.imageExists())) {
      try {
        await this.docker.pull();
      } catch (e) {
        this.log.warn("image pre-pull failed", { error: e instanceof Error ? e.name : "error" });
      }
    }
    await this.reaper.reapOnce(); // stale containers left by a previous process
    this.reaper.start();

    await new Promise<void>((resolve, reject) => {
      this.server.once("error", reject);
      this.server.listen(this.config.port, this.config.host, () => {
        this.server.off("error", reject);
        resolve();
      });
    });
    const port = (this.server.address() as AddressInfo).port;
    this.log.info("runner listening", {
      host: this.config.host,
      port,
      image: this.config.image,
      concurrency: this.config.maxConcurrency,
      queueMax: this.config.queueMax,
      runtime: this.config.dockerRuntime ?? "default",
      driver: "docker",
      instance: this.instance,
    });
    this.ready = this.availability.refreshNow();
    return port;
  }

  /** Graceful stop: refuse new work, let running jobs finish (up to the grace period), then kill the rest. */
  close(): Promise<void> {
    this.closed ??= this.doClose();
    return this.closed;
  }

  private async doClose(): Promise<void> {
    this.shuttingDown = true;
    this.slots.close();
    this.reaper.stop();
    const stopped = new Promise<void>((resolve) => this.server.close(() => resolve()));
    this.server.closeIdleConnections();

    const pending = (): Promise<unknown>[] => [...this.jobs.values()];
    const grace = new Promise<"grace">((r) => setTimeout(() => r("grace"), this.config.shutdownGraceMs).unref());
    const drained = Promise.allSettled(pending()).then(() => "drained" as const);
    if ((await Promise.race([drained, grace])) === "grace") {
      for (const ac of this.jobs.keys()) ac.abort();
      await Promise.allSettled(pending());
    }
    await this.executor.removeAll();
    this.server.closeAllConnections();
    await stopped;
    this.log.info("runner stopped", { running: 0 });
  }

  private async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const method = req.method ?? "GET";
    const path = (req.url ?? "/").split("?")[0] ?? "/";

    if (path === RUNNER_PATHS.health) {
      if (method !== "GET" && method !== "HEAD") return sendError(res, 405, "method_not_allowed", undefined, { allow: "GET, HEAD" });
      return send(res, this.shuttingDown ? 503 : 200, { ok: !this.shuttingDown });
    }

    const isRun = path === RUNNER_PATHS.run;
    const isLangs = path === RUNNER_PATHS.languages;
    if (!isRun && !isLangs) return sendError(res, 404, "not_found");
    const allowed = isRun ? "POST" : "GET";
    if (method !== allowed) return sendError(res, 405, "method_not_allowed", undefined, { allow: allowed });
    if (this.shuttingDown) return sendError(res, 503, "shutting_down");

    let body: Buffer;
    try {
      body = await readBody(req, isRun ? MAX_BODY_BYTES : MAX_EMPTY_BODY_BYTES);
    } catch (e) {
      if (e instanceof BodyTooLarge) {
        this.reject(method, path, 413, "body_too_large");
        return sendError(res, 413, "too_large", "request body is too large", { connection: "close" });
      }
      return; // client went away mid-upload
    }

    const failure = verifyRequest({
      secret: this.config.secret,
      timestamp: header(req, TS_HEADER),
      signature: header(req, SIG_HEADER),
      rawBody: body,
      now: Date.now(),
    });
    if (failure) {
      this.reject(method, path, 401, failure);
      return sendError(res, 401, "unauthorized");
    }

    if (isLangs) return this.languages(res);
    return this.run(req, res, body);
  }

  private reject(method: string, path: string, httpStatus: number, reason: string, jobId?: string): void {
    this.log.info("request rejected", { method, path, httpStatus, reason, jobId });
  }

  private async languages(res: ServerResponse): Promise<void> {
    if (!this.availability.measured) await this.availability.refreshNow();
    else void this.availability.refreshIfStale();
    const out: LanguagesResponse = {
      protocol: RUNNER_PROTOCOL_VERSION,
      languages: this.availability.snapshot(),
      driver: "docker",
      limits: RUNNER_DEFAULTS,
    };
    send(res, 200, out);
  }

  private async run(req: IncomingMessage, res: ServerResponse, body: Buffer): Promise<void> {
    if (!JSON_CONTENT_TYPE.test(req.headers["content-type"] ?? "")) {
      this.reject("POST", RUNNER_PATHS.run, 415, "content_type");
      return sendError(res, 415, "unsupported_media_type", "expected application/json");
    }
    const v = validateRunRequest(body);
    if (!v.ok) {
      this.reject("POST", RUNNER_PATHS.run, v.status, "invalid_body");
      return sendError(res, v.status, v.status === 413 ? "too_large" : "bad_request", v.message);
    }
    const jr = v.request;
    if (!this.replay.claim(jr.jobId)) {
      this.reject("POST", RUNNER_PATHS.run, 409, "replay", jr.jobId);
      return sendError(res, 409, "duplicate_job", "jobId was already used");
    }

    const t0 = Date.now();
    const ac = new AbortController();
    res.on("close", () => {
      if (!res.writableFinished) ac.abort(); // the caller hung up: stop spending resources on it
    });

    let slot: { release: () => void; queueMs: number };
    try {
      if (!this.availability.measured) await this.availability.refreshNow();
      else void this.availability.refreshIfStale();
      if (this.availability.isUnsupported(jr.lang)) {
        const name = getRecipe(jr.lang).name;
        const result = unsupportedResult(jr.jobId, `${name} is not available on this runner.`);
        this.logJob(jr.lang, jr.code, jr.stdin, jr.jobId, result, 0, t0);
        return send(res, 200, result);
      }
      slot = await this.slots.acquire({ signal: ac.signal });
    } catch (e) {
      this.replay.release(jr.jobId); // never started: the caller may retry the same job
      if (e instanceof BusyError && e.reason === "closed" && this.shuttingDown) return sendError(res, 503, "shutting_down");
      if (e instanceof BusyError && !ac.signal.aborted) {
        this.reject("POST", RUNNER_PATHS.run, 503, e.reason, jr.jobId);
        return sendError(res, 503, "busy", undefined, { "retry-after": "2" });
      }
      return;
    }

    // Shutdown waits for the response to be flushed (or the caller to hang up), not just the job.
    const flushed = res.closed
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          res.once("close", () => resolve());
        });
    this.jobs.set(ac, flushed);
    void flushed.then(() => this.jobs.delete(ac));
    try {
      const { result } = await this.executor.execute(jr, { signal: ac.signal });
      this.logJob(jr.lang, jr.code, jr.stdin, jr.jobId, result, slot.queueMs, t0);
      send(res, 200, result);
    } finally {
      slot.release();
    }
  }

  private logJob(lang: string, code: string, stdin: string, jobId: string, r: RunResult, queueMs: number, t0: number): void {
    // Only ids, language, status, timings and byte COUNTS: never code, stdin or program output.
    this.log.info("job finished", {
      jobId,
      lang,
      status: r.status,
      exitCode: r.exitCode,
      signal: r.signal ?? null,
      compileMs: r.compileMs,
      runMs: r.runMs,
      queueMs,
      totalMs: Date.now() - t0,
      stdoutBytes: r.stdoutBytes,
      stderrBytes: r.stderrBytes,
      codeBytes: Buffer.byteLength(code),
      stdinBytes: Buffer.byteLength(stdin),
    });
  }
}

function header(req: IncomingMessage, name: string): string | undefined {
  const v = req.headers[name];
  return typeof v === "string" ? v : undefined;
}

function unsupportedResult(jobId: string, message: string): RunResult {
  return {
    jobId,
    status: "unsupported",
    exitCode: null,
    signal: null,
    stdout: "",
    stderr: "",
    stdoutBytes: 0,
    stderrBytes: 0,
    truncated: { stdout: false, stderr: false },
    runMs: 0,
    compileMs: 0,
    message,
  };
}
