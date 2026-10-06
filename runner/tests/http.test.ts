/**
 * HTTP surface: authentication, replay protection, validation, error shapes.
 * These tests point the service at a docker binary that does not exist, so they need no
 * Docker: everything asserted here happens before (or without) a container.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, test } from "node:test";
import { sign } from "../src/auth";
import { RUNNER_CEILING, RUNNER_PATHS, SIGNATURE_WINDOW_MS, type LanguagesResponse, type RunResult } from "../../shared/protocol";
import { LANG_IDS } from "../../shared/languages";
import { MAX_BODY_BYTES } from "../src/validate";
import { signedFetch, startServer, type TestServer } from "./helpers";

const payload = (over: Record<string, unknown> = {}) => JSON.stringify({ jobId: randomUUID(), lang: "python", code: "print(1)", stdin: "", ...over });

describe("HTTP service (no Docker needed)", () => {
  let srv: TestServer;
  before(async () => {
    srv = await startServer({ env: { RUNNER_DOCKER_BIN: "/nonexistent/docker-binary" } });
  });
  after(async () => {
    await srv.close();
  });

  test("GET /healthz needs no auth and reveals nothing", async () => {
    const res = await fetch(`${srv.baseUrl}/healthz`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
    assert.equal(res.headers.get("cache-control"), "no-store");
  });

  test("unknown paths are 404, wrong methods 405 with an Allow header", async () => {
    assert.equal((await fetch(`${srv.baseUrl}/nope`)).status, 404);
    assert.equal((await fetch(`${srv.baseUrl}/`)).status, 404);
    const r = await fetch(`${srv.baseUrl}/v1/run`);
    assert.equal(r.status, 405);
    assert.equal(r.headers.get("allow"), "POST");
    const l = await fetch(`${srv.baseUrl}/v1/languages`, { method: "POST", body: "{}" });
    assert.equal(l.status, 405);
    assert.equal((await fetch(`${srv.baseUrl}/healthz`, { method: "POST" })).status, 405);
  });

  test("missing headers -> 401", async () => {
    const body = payload();
    assert.equal((await signedFetch(srv, RUNNER_PATHS.run, { body, omitSignature: true })).status, 401);
    assert.equal((await signedFetch(srv, RUNNER_PATHS.run, { body, omitTimestamp: true })).status, 401);
    assert.equal((await signedFetch(srv, RUNNER_PATHS.run, { body, omitSignature: true, omitTimestamp: true })).status, 401);
    assert.equal((await signedFetch(srv, RUNNER_PATHS.languages, { omitSignature: true })).status, 401);
  });

  test("bad signature -> 401 (wrong secret, tampered body, garbage)", async () => {
    const body = payload();
    assert.equal((await signedFetch(srv, RUNNER_PATHS.run, { body, secret: "z".repeat(40) })).status, 401);
    const ts = String(Date.now());
    const sig = sign(srv.secret, ts, body);
    assert.equal((await signedFetch(srv, RUNNER_PATHS.run, { body: body.replace("print(1)", "print(2)"), timestamp: ts, signature: sig })).status, 401);
    assert.equal((await signedFetch(srv, RUNNER_PATHS.run, { body, signature: "not-hex" })).status, 401);
    assert.equal((await signedFetch(srv, RUNNER_PATHS.run, { body, signature: "0".repeat(64) })).status, 401);
  });

  test("stale or future timestamp -> 401, even with a valid signature for it", async () => {
    const body = payload();
    for (const delta of [-(SIGNATURE_WINDOW_MS + 5_000), SIGNATURE_WINDOW_MS + 5_000, -3_600_000]) {
      const r = await signedFetch(srv, RUNNER_PATHS.run, { body, timestamp: String(Date.now() + delta) });
      assert.equal(r.status, 401, `delta ${delta}`);
    }
    assert.equal((await signedFetch(srv, RUNNER_PATHS.run, { body, timestamp: "yesterday" })).status, 401);
  });

  test("401 bodies are identical whatever was wrong (no oracle) and leak nothing", async () => {
    const a = await signedFetch(srv, RUNNER_PATHS.run, { body: payload(), omitSignature: true });
    const b = await signedFetch(srv, RUNNER_PATHS.run, { body: payload(), secret: "q".repeat(40) });
    const c = await signedFetch(srv, RUNNER_PATHS.run, { body: payload(), timestamp: "1" });
    assert.deepEqual(a.json, { error: "unauthorized" });
    assert.deepEqual(b.json, a.json);
    assert.deepEqual(c.json, a.json);
  });

  test("authenticated GET /v1/languages returns the protocol shape", async () => {
    const r = await signedFetch(srv, RUNNER_PATHS.languages);
    assert.equal(r.status, 200);
    const j = r.json as LanguagesResponse;
    assert.equal(j.driver, "docker");
    assert.equal(j.protocol, 1);
    assert.deepEqual(j.languages.map((l) => l.id), [...LANG_IDS]);
    assert.ok(j.languages.every((l) => typeof l.available === "boolean"));
    assert.equal(j.limits.runTimeoutMs, 5000);
  });

  test("replayed jobId -> 409 (the first use is consumed even if the job fails)", async () => {
    const jobId = randomUUID();
    const body = payload({ jobId });
    const first = await signedFetch(srv, RUNNER_PATHS.run, { body });
    assert.equal(first.status, 200);
    // A fresh, valid signature for the same jobId is still a replay.
    const second = await signedFetch(srv, RUNNER_PATHS.run, { body });
    assert.equal(second.status, 409);
    assert.deepEqual(second.json, { error: "duplicate_job", message: "jobId was already used" });
    // Replaying the exact same signed request (same timestamp+signature) is rejected too.
    const ts = String(Date.now());
    const sig = sign(srv.secret, ts, body);
    assert.equal((await signedFetch(srv, RUNNER_PATHS.run, { body, timestamp: ts, signature: sig })).status, 409);
  });

  test("validation errors: 400 with the field, 413 for oversized input, 415 for wrong content type", async () => {
    const bad = async (over: Record<string, unknown>, status: number) => {
      const r = await signedFetch(srv, RUNNER_PATHS.run, { body: payload(over) });
      assert.equal(r.status, status, JSON.stringify(over).slice(0, 80));
      return r.json as { error: string; message?: string };
    };
    assert.match((await bad({ lang: "cobol" }, 400)).message ?? "", /lang/);
    assert.match((await bad({ jobId: "x" }, 400)).message ?? "", /jobId/);
    assert.match((await bad({ code: "a\u0000b" }, 400)).message ?? "", /NUL/);
    assert.equal((await bad({ code: "a".repeat(RUNNER_CEILING.codeBytes + 1) }, 413)).error, "too_large");
    assert.equal((await bad({ stdin: "a".repeat(RUNNER_CEILING.stdinBytes + 1) }, 413)).error, "too_large");
    await bad({ limits: { runTimeoutMs: RUNNER_CEILING.runTimeoutMs + 1 } }, 400);
    await bad({ limits: { memoryMb: 100000 } }, 400);
    await bad({ extra: 1 }, 400);

    const broken = await signedFetch(srv, RUNNER_PATHS.run, { body: "{not json" });
    assert.equal(broken.status, 400);
    const wrongType = await signedFetch(srv, RUNNER_PATHS.run, { body: payload(), headers: { "content-type": "text/plain" } });
    assert.equal(wrongType.status, 415);
  });

  test("huge bodies are refused before being buffered", async () => {
    const huge = "x".repeat(MAX_BODY_BYTES + 10_000);
    const r = await signedFetch(srv, RUNNER_PATHS.run, { body: huge });
    assert.equal(r.status, 413);
    assert.equal((r.json as { error: string }).error, "too_large");
    // The server is still healthy afterwards.
    assert.equal((await fetch(`${srv.baseUrl}/healthz`)).status, 200);
  });

  test("Java class-name injection is rejected before any container exists", async () => {
    const attempts = [
      "public class a$(touch x) { public static void main(String[] a) {} }",
      "public class a-b { }",
      "public class ../../../tmp/x { }",
      "public class a$b { }",
      "public class `id` { }",
      "public class a/b { }",
      "public class a\\b { }",
    ];
    for (const code of attempts) {
      const r = await signedFetch(srv, RUNNER_PATHS.run, { body: payload({ lang: "java", code }) });
      assert.equal(r.status, 200, code);
      const j = r.json as RunResult;
      assert.equal(j.status, "compile_error", code);
      assert.match(j.compileOutput ?? "", /may only contain ASCII letters, digits and underscores/);
      assert.ok(!(j.compileOutput ?? "").includes("touch"), "diagnostics must not echo user text");
    }
  });

  test("docker unreachable -> internal_error (never a crash), and no internals leak", async () => {
    const r = await signedFetch(srv, RUNNER_PATHS.run, { body: payload() });
    assert.equal(r.status, 200);
    const j = r.json as RunResult;
    assert.equal(j.status, "internal_error");
    assert.equal(j.exitCode, null);
    const text = JSON.stringify(j);
    assert.ok(!text.includes("nonexistent"), "host paths must not leak");
    assert.ok(!text.includes(process.cwd()));
    assert.match(j.message ?? "", /temporarily unavailable/);
    // still alive
    assert.equal((await fetch(`${srv.baseUrl}/healthz`)).status, 200);
  });

  test("the response headers carry the protective defaults", async () => {
    const r = await signedFetch(srv, RUNNER_PATHS.languages);
    assert.equal(r.headers.get("x-content-type-options"), "nosniff");
    assert.match(r.headers.get("content-type") ?? "", /^application\/json/);
  });

  test("nothing from the request or the secret appears in the logs", async () => {
    const marker = `CODE-MARKER-${randomUUID()}`;
    const stdinMarker = `STDIN-MARKER-${randomUUID()}`;
    await signedFetch(srv, RUNNER_PATHS.run, { body: payload({ code: `print("${marker}")`, stdin: stdinMarker }) });
    await signedFetch(srv, RUNNER_PATHS.run, { body: payload(), secret: "bad".repeat(20) });
    const all = srv.logs.join("\n");
    assert.ok(all.length > 0);
    assert.ok(!all.includes(marker));
    assert.ok(!all.includes(stdinMarker));
    assert.ok(!all.includes(srv.secret));
    for (const line of srv.logs) JSON.parse(line); // every line is valid JSON
    const jobLine = srv.logs.map((l) => JSON.parse(l) as Record<string, unknown>).find((l) => l.msg === "job finished");
    assert.ok(jobLine);
    assert.equal(jobLine.lang, "python");
    assert.equal(typeof jobLine.codeBytes, "number");
  });
});

describe("HTTP service with an unreachable DOCKER_HOST", () => {
  let srv: TestServer;
  before(async () => {
    srv = await startServer({ env: { RUNNER_DOCKER_HOST: "unix:///nonexistent/docker.sock" } });
  });
  after(async () => {
    await srv.close();
  });
  test("a run answers internal_error and the service keeps serving", async () => {
    const r = await signedFetch(srv, RUNNER_PATHS.run, { body: payload() });
    assert.equal(r.status, 200);
    assert.equal((r.json as RunResult).status, "internal_error");
    const again = await signedFetch(srv, RUNNER_PATHS.run, { body: payload() });
    assert.equal((again.json as RunResult).status, "internal_error");
  });
});

describe("start-up refuses a weak secret", () => {
  test("RUNNER_SECRET shorter than 32 characters", async () => {
    await assert.rejects(startServer({ secret: "short" }), /RUNNER_SECRET/);
  });
});

