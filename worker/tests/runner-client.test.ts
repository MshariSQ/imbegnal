// The runner client: HMAC signing, status mapping, timeouts, hostile or broken answers, languages cache.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { afterEach, describe, mock, test } from "node:test";
import { RUNNER_CEILING, SIG_HEADER, TS_HEADER } from "../../shared/protocol";
import { getLanguages, resetLanguagesCache, runOnRunner, runTimeoutBudgetMs, signRunnerRequest } from "../src/lab/runner";
import type { Env } from "../src/util";
import { TestD1 } from "./helpers/d1";
import { RUNNER_SECRET, RUNNER_URL, type RunnerStub, hang, makeEnv, okResult, stubRunner } from "./helpers/harness";

const env = (extra: Partial<Env> = {}) => makeEnv(new TestD1(), extra);
let stub: RunnerStub | null = null;
const use = (s: RunnerStub) => (stub = s);

afterEach(() => {
  stub?.restore();
  stub = null;
  resetLanguagesCache();
  mock.timers.reset();
});

const REQ = { lang: "python", code: "print('hi')", stdin: "" } as const;

describe("signing", () => {
  test("signature equals an independent HMAC-SHA256 over `${timestamp}.${rawBody}` (hex)", async () => {
    use(stubRunner(() => okResult()));
    await runOnRunner(env(), { ...REQ, stdin: "42\n" });
    const seen = stub!.seen[0];
    const ts = seen.headers.get(TS_HEADER)!;
    assert.match(ts, /^\d{13}$/, "timestamp is unix milliseconds");
    assert.ok(Math.abs(Date.now() - Number(ts)) < 5000);
    assert.equal(seen.headers.get(SIG_HEADER), createHmac("sha256", RUNNER_SECRET).update(`${ts}.${seen.rawBody}`).digest("hex"));
    assert.equal(seen.signatureValid, true);
  });

  test("signRunnerRequest is the documented HMAC for any body, including the empty one", async () => {
    for (const body of ["", "{}", '{"a":"é\\u0000"}']) {
      assert.equal(await signRunnerRequest("k", "1700000000000", body), createHmac("sha256", "k").update(`1700000000000.${body}`).digest("hex"));
    }
  });

  test("the request body is a RunRequest with a fresh uuid jobId per call", async () => {
    use(stubRunner(() => okResult()));
    await runOnRunner(env(), REQ);
    await runOnRunner(env(), REQ);
    const [a, b] = stub!.seen.map((s) => s.job!);
    assert.equal(a.lang, "python");
    assert.equal(a.code, "print('hi')");
    assert.equal(a.stdin, "");
    assert.match(a.jobId, /^[0-9a-f-]{36}$/);
    assert.notEqual(a.jobId, b.jobId);
    assert.equal(stub!.seen[0].method, "POST");
    assert.equal(stub!.seen[0].url, `${RUNNER_URL}/v1/run`);
  });

  test("the secret never appears in the request that leaves the Worker", async () => {
    use(stubRunner(() => okResult()));
    await runOnRunner(env(), REQ);
    const seen = stub!.seen[0];
    const wire = JSON.stringify([...seen.headers.entries()]) + seen.rawBody + seen.url;
    assert.ok(!wire.includes(RUNNER_SECRET));
  });

  test("caller limits are clamped to the protocol ceilings", async () => {
    use(stubRunner(() => okResult()));
    await runOnRunner(env(), { ...REQ, limits: { compileTimeoutMs: 10 ** 9, runTimeoutMs: 10 ** 9, memoryMb: 10 ** 9 } });
    assert.deepEqual(stub!.seen[0].job!.limits, {
      compileTimeoutMs: RUNNER_CEILING.compileTimeoutMs,
      runTimeoutMs: RUNNER_CEILING.runTimeoutMs,
      memoryMb: RUNNER_CEILING.memoryMb,
    });
  });
});

describe("results", () => {
  test("ok / compile_error / runtime_error / timeout / memory_limit / output_limit / unsupported are passed through", async () => {
    for (const status of ["ok", "compile_error", "runtime_error", "timeout", "memory_limit", "output_limit", "unsupported"] as const) {
      use(stubRunner(() => okResult({ status, exitCode: status === "ok" ? 0 : 1, message: `m-${status}` })));
      const r = await runOnRunner(env(), REQ);
      assert.equal(r.status, status);
      assert.equal(r.message, `m-${status}`);
      stub!.restore();
    }
  });

  test("keeps stdout/stderr/compileOutput and measurements", async () => {
    use(stubRunner(() => okResult({ stdout: "out", stderr: "err", compileOutput: "warn", stdoutBytes: 99, runMs: 7, compileMs: 3, exitCode: 2, signal: "SIGSEGV", truncated: { stdout: true, stderr: false } })));
    const r = await runOnRunner(env(), REQ);
    assert.deepEqual([r.stdout, r.stderr, r.compileOutput, r.stdoutBytes, r.runMs, r.compileMs, r.exitCode, r.signal], ["out", "err", "warn", 99, 7, 3, 2, "SIGSEGV"]);
    assert.deepEqual(r.truncated, { stdout: true, stderr: false });
  });

  test("the result carries OUR jobId, whatever the runner echoes", async () => {
    use(stubRunner(() => Response.json({ ...okResult(), jobId: "someone-elses" })));
    const r = await runOnRunner(env(), REQ);
    assert.equal(r.jobId, stub!.seen[0].job!.jobId);
  });

  test("a runner-reported internal_error is normalised and its message dropped", async () => {
    use(stubRunner(() => okResult({ status: "internal_error", message: "docker: /var/run/docker.sock permission denied" })));
    const r = await runOnRunner(env(), REQ);
    assert.equal(r.status, "internal_error");
    assert.equal(r.message, "runner_error");
  });

  test("oversized strings are capped and flagged as truncated; absurd numbers are clamped", async () => {
    use(stubRunner(() => Response.json({ ...okResult(), stdout: "x".repeat(300_000), message: "m".repeat(5000), runMs: 1e15, exitCode: 1e20, stdoutBytes: -5 })));
    const r = await runOnRunner(env(), REQ);
    assert.equal(r.stdout.length, RUNNER_CEILING.outputKeepBytes);
    assert.equal(r.truncated.stdout, true);
    assert.ok((r.message ?? "").length <= 300);
    assert.equal(r.runMs, 3_600_000);
    assert.equal(r.exitCode, 2_147_483_647);
    assert.equal(r.stdoutBytes, 0);
  });

  test("control characters in runner messages are stripped; bad signal names are dropped", async () => {
    use(stubRunner(() => Response.json({ ...okResult({ status: "runtime_error" }), message: "boom\u0000\u001b[31m", signal: "../../etc/passwd" })));
    const r = await runOnRunner(env(), REQ);
    assert.ok(!/[\u0000-\u001f]/.test(r.message ?? ""));
    assert.equal(r.signal, null);
  });
});

describe("failures never throw and read as runner_unavailable", () => {
  const expectUnavailable = (r: Awaited<ReturnType<typeof runOnRunner>>) => {
    assert.equal(r.status, "internal_error");
    assert.equal(r.message, "runner_unavailable");
    assert.equal(r.stdout, "");
  };

  test("RUNNER_URL / RUNNER_SECRET not configured -> no network call at all", async () => {
    use(stubRunner(() => okResult()));
    expectUnavailable(await runOnRunner(env({ RUNNER_URL: undefined }), REQ));
    expectUnavailable(await runOnRunner(env({ RUNNER_SECRET: undefined }), REQ));
    expectUnavailable(await runOnRunner(env({ RUNNER_URL: "" }), REQ));
    assert.equal(stub!.seen.length, 0);
  });

  test("plain http is refused except for loopback; credentials and queries in the URL are refused", async () => {
    use(stubRunner(() => okResult()));
    expectUnavailable(await runOnRunner(env({ RUNNER_URL: "http://runner.test" }), REQ));
    expectUnavailable(await runOnRunner(env({ RUNNER_URL: "https://user:pw@runner.test" }), REQ));
    expectUnavailable(await runOnRunner(env({ RUNNER_URL: "https://runner.test?x=1" }), REQ));
    expectUnavailable(await runOnRunner(env({ RUNNER_URL: "not a url" }), REQ));
    assert.equal(stub!.seen.length, 0);
  });

  test("http://localhost is allowed for local development", async () => {
    const original = globalThis.fetch;
    let called = "";
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      called = String(input);
      return Response.json(okResult());
    }) as typeof fetch;
    try {
      const r = await runOnRunner(env({ RUNNER_URL: "http://localhost:4242/" }), REQ);
      assert.equal(r.status, "ok");
      assert.equal(called, "http://localhost:4242/v1/run");
    } finally {
      globalThis.fetch = original;
    }
  });

  test("a path prefix in RUNNER_URL is preserved", async () => {
    const original = globalThis.fetch;
    let called = "";
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      called = String(input);
      return Response.json(okResult());
    }) as typeof fetch;
    try {
      await runOnRunner(env({ RUNNER_URL: "https://host.test/runner/" }), REQ);
      assert.equal(called, "https://host.test/runner/v1/run");
    } finally {
      globalThis.fetch = original;
    }
  });

  test("network error (fetch rejects)", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new TypeError("fetch failed");
    }) as typeof fetch;
    try {
      expectUnavailable(await runOnRunner(env(), REQ));
    } finally {
      globalThis.fetch = original;
    }
  });

  test("non-2xx answers (401 from a wrong secret, 500, 503)", async () => {
    use(stubRunner(() => okResult()));
    expectUnavailable(await runOnRunner(env({ RUNNER_SECRET: "the-wrong-secret" }), REQ)); // stub verifies the HMAC -> 401
    stub!.restore();
    for (const status of [409, 413, 429, 500, 502, 503]) {
      use(stubRunner(() => new Response("busy", { status })));
      expectUnavailable(await runOnRunner(env(), REQ));
      stub!.restore();
    }
  });

  test("redirects are never followed", async () => {
    const original = globalThis.fetch;
    const calls: (RequestRedirect | undefined)[] = [];
    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      calls.push(init?.redirect);
      return new Response(null, { status: 302, headers: { Location: "https://evil.test/" } });
    }) as typeof fetch;
    try {
      expectUnavailable(await runOnRunner(env(), REQ));
      assert.deepEqual(calls, ["manual"]);
    } finally {
      globalThis.fetch = original;
    }
  });

  test("garbage, non-JSON, wrong-shaped and unknown-status bodies", async () => {
    const bodies: (() => Response)[] = [
      () => new Response("<html>502 Bad Gateway</html>", { headers: { "content-type": "text/html" } }),
      () => new Response("{not json"),
      () => new Response(""),
      () => Response.json(null),
      () => Response.json([]),
      () => Response.json("ok"),
      () => Response.json({}),
      () => Response.json({ status: "pwned" }),
      () => Response.json({ ...okResult(), status: 7 }),
      () => Response.json({ ...okResult(), stdout: { not: "a string" } }),
      () => Response.json({ ...okResult(), stderr: 12 }),
    ];
    for (const body of bodies) {
      use(stubRunner(body));
      expectUnavailable(await runOnRunner(env(), REQ));
      stub!.restore();
    }
  });

});

// The job may have run: these are charged (and raise abuse signals upstream), never refunded.
// Refunding them let learner code trigger free runs on purpose (security review findings).
describe("answers that come too late or too large are charged, not refunded", () => {
  test("an honest worst-case answer fits: 3 x 64 KiB of control characters, JSON-escaped (~1.2 MB)", async () => {
    const ctrl = "\u0001".repeat(64 * 1024);
    use(stubRunner(() => new Response(JSON.stringify({ ...okResult(), stdout: ctrl, stderr: ctrl, compileOutput: ctrl }))));
    const r = await runOnRunner(env(), REQ);
    assert.equal(r.status, "ok");
    assert.equal(r.stdout.length, 64 * 1024);
  });

  test("an answer over the 2 MiB cap is output_limit", async () => {
    use(stubRunner(() => new Response(JSON.stringify({ ...okResult(), stdout: "y".repeat(3 * 1024 * 1024) }))));
    const r = await runOnRunner(env(), REQ);
    assert.equal(r.status, "output_limit");
    assert.notEqual(r.message, "runner_unavailable");
  });

  test("a runner that never answers is given up after queue + setup + compile + run + slack, as a timeout", async () => {
    mock.timers.enable({ apis: ["setTimeout"] });
    use(stubRunner((_job, seen) => hang(seen.signal)));
    const limits = { compileTimeoutMs: 1000, runTimeoutMs: 2000 };
    const budget = runTimeoutBudgetMs(limits);
    assert.equal(budget, 30_000 + 15_000 + 1000 + 2000 + 5000);
    const pending = runOnRunner(env(), { ...REQ, limits });
    while (stub!.pending === 0) await new Promise((r) => setImmediate(r));
    mock.timers.tick(budget - 1000);
    await new Promise((r) => setImmediate(r));
    assert.equal(stub!.pending, 1, "must not give up before the runner's own limits have expired");
    mock.timers.tick(2000);
    const r = await pending;
    assert.equal(r.status, "timeout");
    assert.equal(stub!.pending, 0);
  });

  test("without caller limits the wait covers the protocol ceilings (20 s compile for Go/Rust/Swift)", () => {
    assert.equal(runTimeoutBudgetMs(undefined), 30_000 + 15_000 + 20_000 + 15_000 + 5000);
  });
});

describe("GET /v1/languages", () => {
  const languagesBody = () =>
    Response.json({
      protocol: 1,
      driver: "docker",
      limits: {},
      languages: [
        { id: "python", available: true, version: "Python 3.12.3" },
        { id: "go", available: false },
        { id: "rust", available: true },
        { id: "cobol", available: true }, // unknown to the site: ignored
      ],
    });

  test("up: reported languages are available, everything else is not", async () => {
    use(stubRunner(() => okResult(), languagesBody));
    const res = await getLanguages(env());
    assert.equal(res.runner, "up");
    const by = Object.fromEntries(res.languages.map((l) => [l.id, l]));
    assert.deepEqual(by.python, { id: "python", available: true, version: "Python 3.12.3" });
    assert.equal(by.rust.available, true);
    assert.equal(by.go.available, false);
    assert.equal(by.java.available, false, "not reported -> unavailable");
    assert.equal(res.languages.length, 14);
    assert.ok(!("cobol" in by));
    assert.ok(stub!.seen[0].signatureValid, "the languages call is signed too (empty body)");
    assert.equal(stub!.seen[0].method, "GET");
  });

  test("unconfigured and down", async () => {
    use(stubRunner(() => okResult()));
    const none = await getLanguages(env({ RUNNER_URL: undefined }));
    assert.equal(none.runner, "unconfigured");
    assert.ok(none.languages.every((l) => !l.available));
    assert.equal(stub!.seen.length, 0);

    stub!.restore();
    use(stubRunner(() => okResult(), () => new Response("down", { status: 503 })));
    const down = await getLanguages(env());
    assert.equal(down.runner, "down");
    assert.ok(down.languages.every((l) => !l.available));
  });

  test("answers are cached for 30 s, failures for 10 s", async () => {
    mock.timers.enable({ apis: ["Date"] });
    use(stubRunner(() => okResult(), languagesBody));
    await getLanguages(env());
    await getLanguages(env());
    assert.equal(stub!.seen.length, 1, "second call served from the cache");
    mock.timers.tick(29_000);
    await getLanguages(env());
    assert.equal(stub!.seen.length, 1);
    mock.timers.tick(2_000);
    await getLanguages(env());
    assert.equal(stub!.seen.length, 2, "refreshed after 30 s");

    stub!.restore();
    resetLanguagesCache();
    use(stubRunner(() => okResult(), () => new Response("x", { status: 500 })));
    await getLanguages(env());
    mock.timers.tick(9_000);
    await getLanguages(env());
    assert.equal(stub!.seen.length, 1);
    mock.timers.tick(2_000);
    await getLanguages(env());
    assert.equal(stub!.seen.length, 2, "a down runner is re-probed after 10 s");
  });
});
