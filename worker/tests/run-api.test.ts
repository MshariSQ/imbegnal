// POST /api/lab/run end to end through the real router: auth, validation,
// quota + refunds, logging, abuse hooks, lesson-lab grading.
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import type { GradeResult, QuotaError, RunApiResponse } from "../../shared/api";
import type { CatalogLab } from "../../shared/catalog";
import type { RunResult } from "../../shared/protocol";
import { catalog } from "../src/generated/catalog";
import { GRADING_BUDGET_MS } from "../src/lab/config";
import { gradeLab } from "../src/lab/grade";
import type { Env } from "../src/util";
import { TestD1 } from "./helpers/d1";
import { RUNNER_SECRET, type RunnerStub, addUser, call, jsonOf, makeEnv, okResult, stubRunner, tokenFor } from "./helpers/harness";

let db: TestD1;
let env: Env;
let stub: RunnerStub | null = null;
let token: string;

const today = () => new Date().toISOString().slice(0, 10);
const usage = (id: string) => db.query<{ count: number }>("SELECT count FROM lab_usage WHERE user_id = ? AND day = ?", id, today())[0]?.count ?? 0;
const runRows = () => db.query<Record<string, unknown>>("SELECT * FROM lab_runs ORDER BY created_at, id");
const post = (body: unknown, tok: string | null = token, opts: { origin?: string; rawBody?: string } = {}) =>
  call(env, "/api/lab/run", { method: "POST", token: tok, body, ...opts });

const PY = { lang: "python", code: "print('Hello, World!')" };

/** Runner stub that "executes" programs: code containing CORRECT sums stdin, anything else prints 99. */
const sumRunner = (job: { code: string; stdin: string }): RunResult => {
  if (job.code.includes("COMPILE_ERROR")) return okResult({ status: "compile_error", exitCode: 1, stdout: "", compileOutput: "main.py:3: error: oops" });
  if (job.code.includes("TIMEOUT")) return okResult({ status: "timeout", exitCode: null, stdout: "", message: "Time limit exceeded (5s)" });
  if (job.code.includes("CRASH")) return okResult({ status: "runtime_error", exitCode: 1, stdout: "", stderr: "Traceback (most recent call last):\n  File \"/work/main.py\", line 2, in <module>\nNameError: name 'foo' is not defined" });
  const nums = job.stdin.split(/\s+/).filter(Boolean).map(Number);
  const out = job.code.includes("CORRECT") ? String(nums.reduce((a, b) => a + b, 0)) : "99";
  return okResult({ stdout: `${out}\n`, stdoutBytes: out.length + 1 });
};

const LAB: CatalogLab = {
  ref: "python/basics/add",
  track: "python",
  lesson: "basics",
  id: "add",
  lang: "python",
  tests: [
    { name: "adds two numbers", stdin: "1 2\n", expected: "3", mode: "trim" },
    { name: "handles negatives", stdin: "-1 1\n", expected: "0", mode: "lines" },
    { name: "larger values", stdin: "40 2\n", expected: "42", mode: "trim" },
  ],
};

beforeEach(async () => {
  db = new TestD1();
  env = makeEnv(db, { RUN_PER_MINUTE_FREE: "1000", RUN_MAX_CONCURRENT: "100" });
  addUser(db, { id: "u1" });
  addUser(db, { id: "u2" });
  token = await tokenFor("u1");
  catalog.labs.push(LAB);
  stub = stubRunner(sumRunner);
});

afterEach(() => {
  stub?.restore();
  stub = null;
  catalog.labs.splice(catalog.labs.indexOf(LAB), 1);
});

describe("authentication and routing", () => {
  test("no token -> 401 unauthorized (JSON, no-store), and nothing is run", async () => {
    const res = await post(PY, null);
    assert.equal(res.status, 401);
    assert.equal(res.headers.get("Content-Type"), "application/json");
    assert.equal(res.headers.get("Cache-Control"), "no-store");
    assert.deepEqual(await res.json(), { error: "unauthorized" });
    assert.equal(stub!.seen.length, 0);
  });

  test("garbage, tampered and expired tokens -> 401", async () => {
    assert.equal((await post(PY, "garbage")).status, 401);
    assert.equal((await post(PY, `${token}x`)).status, 401);
    assert.equal((await post(PY, await tokenFor("u1", { exp: Math.floor(Date.now() / 1000) - 10 }))).status, 401);
    assert.equal((await post(PY, await tokenFor("u1", { sub: 42 }))).status, 401, "non-string subject");
  });

  test("wrong method and unknown path are JSON errors", async () => {
    const wrong = await call(env, "/api/lab/run", { method: "GET", token });
    assert.equal(wrong.status, 405);
    assert.equal((await jsonOf<{ error: string }>(wrong)).error, "method_not_allowed");
    const unknown = await call(env, "/api/lab/nope", { token });
    assert.equal(unknown.status, 404);
    assert.equal((await jsonOf<{ error: string }>(unknown)).error, "not_found");
  });

  test("errors carry CORS for the local E2E origin", async () => {
    const res = await post(PY, null, { origin: "http://localhost:4173" });
    assert.equal(res.headers.get("Access-Control-Allow-Origin"), "http://localhost:4173");
    const res2 = await post({ ...PY, lang: "nope" }, token, { origin: "http://127.0.0.1:4173" });
    assert.equal(res2.headers.get("Access-Control-Allow-Origin"), "http://127.0.0.1:4173");
  });
});

describe("validation matrix", () => {
  const big = (n: number) => "a".repeat(n);
  const cases: [string, unknown][] = [
    ["unknown language", { ...PY, lang: "cobol" }],
    ["language alias is not accepted", { ...PY, lang: "py" }],
    ["language wrong type", { ...PY, lang: 7 }],
    ["language missing", { code: "x" }],
    ["code missing", { lang: "python" }],
    ["code empty", { lang: "python", code: "" }],
    ["code wrong type", { lang: "python", code: ["x"] }],
    ["code larger than 64 KiB", { lang: "python", code: big(64 * 1024 + 1) }],
    ["code larger than 64 KiB in UTF-8 bytes (fits in characters)", { lang: "python", code: "é".repeat(33_000) }],
    ["code with NUL", { lang: "python", code: "print(1)\u0000" }],
    ["stdin larger than 64 KiB", { ...PY, stdin: big(64 * 1024 + 1) }],
    ["stdin wrong type", { ...PY, stdin: 12 }],
    ["stdin with NUL", { ...PY, stdin: "a\u0000b" }],
    ["ref is a string", { ...PY, ref: "lesson" }],
    ["ref is an array", { ...PY, ref: [] }],
    ["ref kind unknown", { ...PY, ref: { kind: "admin" } }],
    ["lesson ref missing parts", { ...PY, ref: { kind: "lesson", track: "python", lesson: "basics" } }],
    ["lesson ref uppercase id", { ...PY, ref: { kind: "lesson", track: "Python", lesson: "basics", exercise: "add" } }],
    ["lesson ref with a path", { ...PY, ref: { kind: "lesson", track: "python/..", lesson: "basics", exercise: "add" } }],
    ["lesson ref id too long", { ...PY, ref: { kind: "lesson", track: "a".repeat(65), lesson: "basics", exercise: "add" } }],
    ["lesson ref with SQL-ish id", { ...PY, ref: { kind: "lesson", track: "x'; DROP TABLE users;--", lesson: "b", exercise: "c" } }],
    ["challenge ref (graded by the challenges endpoint)", { ...PY, ref: { kind: "challenge", id: "caesar" } }],
    ["challenge ref with bad id", { ...PY, ref: { kind: "challenge", id: "../x" } }],
  ];

  for (const [name, body] of cases) {
    test(`400 invalid_request: ${name}`, async () => {
      const res = await post(body);
      assert.equal(res.status, 400);
      const json = await jsonOf<{ error: string; message?: string }>(res);
      assert.equal(json.error, "invalid_request");
      assert.equal(stub!.seen.length, 0, "the runner is never reached");
      assert.equal(usage("u1"), 0, "no quota is charged");
      assert.equal(runRows().length, 0);
    });
  }

  test("400 for non-JSON, JSON that is not an object, and an empty body", async () => {
    for (const rawBody of ["{nope", "[]", '"x"', "null", "12"]) {
      assert.equal((await post(undefined, token, { rawBody })).status, 400, rawBody);
    }
    const empty = await call(env, "/api/lab/run", { method: "POST", token });
    assert.equal(empty.status, 400);
  });

  test("400 for a request body over 200 KiB (by Content-Length and by streaming)", async () => {
    const huge = JSON.stringify({ ...PY, stdin: "a".repeat(210 * 1024) });
    assert.equal((await post(undefined, token, { rawBody: huge })).status, 400);
    // Even with a lying/absent Content-Length the reader stops at the cap.
    const req = new Request("https://api.test/api/lab/run", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "CF-Connecting-IP": "10.9.9.9" },
      body: new ReadableStream({
        start(c) {
          c.enqueue(new TextEncoder().encode('{"lang":"python","code":"x","stdin":"'));
          for (let i = 0; i < 30; i++) c.enqueue(new TextEncoder().encode("b".repeat(8192)));
          c.close();
        },
      }),
      // @ts-expect-error duplex is required for streaming request bodies in Node
      duplex: "half",
    });
    const { default: worker } = await import("../src/index");
    const res = await worker.fetch(req, env, { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext);
    assert.equal(res.status, 400);
    assert.equal(stub!.seen.length, 0);
  });

  test("accepts exactly 64 KiB of code and 64 KiB of stdin", async () => {
    const res = await post({ lang: "python", code: "a".repeat(64 * 1024), stdin: "b".repeat(64 * 1024) });
    assert.equal(res.status, 200);
  });

  test("unknown extra properties are ignored, not echoed", async () => {
    const res = await post({ ...PY, isAdmin: true, plan: "pro", __proto__: { x: 1 } });
    assert.equal(res.status, 200);
    assert.ok(!JSON.stringify(await res.json()).includes("isAdmin"));
  });
});

describe("free runs", () => {
  test("success: RunApiResponse shape, single execution, no grade, one quota unit", async () => {
    const res = await post({ ...PY, stdin: "7\n" });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("Cache-Control"), "no-store");
    const body = await jsonOf<RunApiResponse>(res);
    assert.match(body.runId, /^[0-9a-f-]{36}$/);
    assert.equal(body.result.status, "ok");
    assert.equal(body.result.stdout, "99\n");
    assert.equal(body.grade, undefined);
    assert.deepEqual([body.quota.plan, body.quota.used, body.quota.limit, body.quota.remaining, body.quota.perMinute], ["free", 1, 50, 49, 1000]);
    assert.equal(stub!.seen.length, 1);
    assert.equal(stub!.seen[0].job!.stdin, "7\n");
    assert.equal(usage("u1"), 1);
    assert.equal(usage("_global"), 1);
  });

  test("stdin defaults to the empty string", async () => {
    await post(PY);
    assert.equal(stub!.seen[0].job!.stdin, "");
  });

  test("the response is the public result only: no jobId, no memory figure, never the runner secret", async () => {
    stub!.restore();
    stub = stubRunner(() => ({ ...okResult(), memoryKb: 51234 }));
    const text = await (await post(PY)).text();
    assert.ok(!text.includes(RUNNER_SECRET));
    assert.ok(!text.includes("jobId"));
    assert.ok(!text.includes("memoryKb"));
    assert.ok(!text.includes("runner.test"));
  });

  test("one lab_runs row with the documented columns", async () => {
    const res = await post({ lang: "python", code: "print('hi')", stdin: "in" });
    const { runId } = await jsonOf<RunApiResponse>(res);
    const rows = runRows();
    assert.equal(rows.length, 1);
    const r = rows[0];
    assert.equal(r.id, runId);
    assert.deepEqual(
      [r.user_id, r.ref_kind, r.track, r.lesson, r.exercise, r.challenge_id, r.lang, r.status, r.exit_code, r.success, r.passed, r.first_error],
      ["u1", "free", null, null, null, null, "python", "ok", 0, 1, null, null],
    );
    assert.deepEqual([r.run_ms, r.compile_ms, r.stdout_bytes, r.stderr_bytes], [12, 0, 3, 0]);
    assert.deepEqual([r.code, r.stdin, r.stdout, r.stderr], ["print('hi')", "in", "99\n", ""]);
    assert.match(String(r.created_at), /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  test("history copies are size-capped (code 64 KiB, outputs 16 KiB) while the response keeps the runner's output", async () => {
    stub!.restore();
    stub = stubRunner(() => okResult({ stdout: "o".repeat(50_000), stderr: "e".repeat(50_000) }));
    await post({ lang: "python", code: "c".repeat(64 * 1024), stdin: "i".repeat(40_000) });
    const r = runRows()[0] as { code: string; stdin: string; stdout: string; stderr: string };
    assert.equal(r.code.length, 64 * 1024);
    assert.equal(r.stdin.length, 16 * 1024);
    assert.equal(r.stdout.length, 16 * 1024);
    assert.equal(r.stderr.length, 16 * 1024);
  });

  test("compile error: keeps the charge, 200, diagnostics in stderr copy, normalized first_error", async () => {
    const res = await post({ ...PY, code: "COMPILE_ERROR" });
    assert.equal(res.status, 200);
    const body = await jsonOf<RunApiResponse>(res);
    assert.equal(body.result.status, "compile_error");
    assert.equal(body.result.compileOutput, "main.py:3: error: oops");
    assert.equal(body.quota.used, 1);
    const r = runRows()[0];
    assert.equal(r.success, 0);
    assert.equal(r.first_error, "main.pyN: error: oops".replace("pyN", "py:N"));
    assert.match(String(r.stderr), /oops/);
  });

  test("runtime error: first_error is the exception line, not the stack frame, with names and numbers normalized", async () => {
    await post({ ...PY, code: "CRASH" });
    const r = runRows()[0];
    assert.equal(r.status, "runtime_error");
    assert.equal(r.first_error, "NameError: name '…' is not defined");
  });

  test("timeout keeps the charge and is logged", async () => {
    const body = await jsonOf<RunApiResponse>(await post({ ...PY, code: "TIMEOUT" }));
    assert.equal(body.result.status, "timeout");
    assert.equal(body.quota.used, 1);
    assert.equal(runRows()[0].status, "timeout");
  });

  test("runner says unsupported -> 200 with that status and the charge is refunded", async () => {
    stub!.restore();
    stub = stubRunner(() => okResult({ status: "unsupported", exitCode: null, stdout: "", message: "Swift is not installed on this runner" }));
    const res = await post({ lang: "swift", code: "print(1)" });
    assert.equal(res.status, 200);
    const body = await jsonOf<RunApiResponse>(res);
    assert.equal(body.result.status, "unsupported");
    assert.equal(body.quota.used, 0);
    assert.equal(usage("u1"), 0);
    assert.equal(usage("_global"), 0);
    assert.equal(runRows().length, 1, "still logged for operators");
  });

  test("runner reports internal_error -> 200 internal_error result, refunded, internals hidden", async () => {
    stub!.restore();
    stub = stubRunner(() => okResult({ status: "internal_error", message: "docker daemon at /var/run/docker.sock: denied" }));
    const res = await post(PY);
    const text = await res.text();
    assert.equal(res.status, 200);
    assert.ok(!text.includes("docker"));
    const body = JSON.parse(text) as RunApiResponse;
    assert.equal(body.result.status, "internal_error");
    assert.equal(body.quota.used, 0);
    assert.equal(usage("_global"), 0);
  });
});

describe("runner outages are 503 runner_unavailable and are refunded", () => {
  const expect503 = async (res: Response) => {
    assert.equal(res.status, 503);
    const body = await jsonOf<{ error: string; quota: { used: number } }>(res);
    assert.equal(body.error, "runner_unavailable");
    assert.equal(body.quota.used, 0);
    assert.equal(usage("u1"), 0);
    assert.equal(usage("_global"), 0);
    assert.equal(db.query("SELECT 1 FROM lab_runs WHERE status = 'running'").length, 0, "no in-flight row is left behind");
    const rows = runRows();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].status, "internal_error");
  };

  test("unconfigured RUNNER_URL", async () => {
    env = makeEnv(db, { RUNNER_URL: undefined, RUN_PER_MINUTE_FREE: "1000", RUN_MAX_CONCURRENT: "100" });
    await expect503(await post(PY));
    assert.equal(stub!.seen.length, 0);
  });

  test("runner answers 500", async () => {
    stub!.restore();
    stub = stubRunner(() => new Response("boom", { status: 500 }));
    await expect503(await post(PY));
  });

  test("runner answers garbage JSON", async () => {
    stub!.restore();
    stub = stubRunner(() => new Response("<<<not json"));
    await expect503(await post(PY));
  });

  test("fetch itself fails", async () => {
    stub!.restore();
    const original = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new TypeError("network down");
    }) as typeof fetch;
    try {
      await expect503(await post(PY));
    } finally {
      globalThis.fetch = original;
    }
  });
});

describe("quota enforcement on the endpoint", () => {
  test("429 quota_exceeded scope user once the daily limit is used, with resetAt", async () => {
    env = makeEnv(db, { RUN_DAILY_LIMIT_FREE: "2", RUN_PER_MINUTE_FREE: "1000", RUN_MAX_CONCURRENT: "100" });
    assert.equal((await post(PY)).status, 200);
    assert.equal((await post(PY)).status, 200);
    const res = await post(PY);
    assert.equal(res.status, 429);
    const body = await jsonOf<QuotaError>(res);
    assert.deepEqual([body.error, body.scope], ["quota_exceeded", "user"]);
    assert.ok(body.resetAt);
    assert.equal(stub!.seen.length, 2, "the third request never reached the runner");
  });

  test("429 rate_limited scope rate", async () => {
    env = makeEnv(db, { RUN_PER_MINUTE_FREE: "2", RUN_MAX_CONCURRENT: "100" });
    await post(PY);
    await post(PY);
    const res = await post(PY);
    assert.equal(res.status, 429);
    const body = await jsonOf<QuotaError>(res);
    assert.deepEqual([body.error, body.scope], ["rate_limited", "rate"]);
    assert.ok(res.headers.get("Retry-After"));
  });

  test("a graded submission costs ONE unit however many tests it runs", async () => {
    const res = await post({ lang: "python", code: "CORRECT", ref: { kind: "lesson", track: "python", lesson: "basics", exercise: "add" } });
    assert.equal(res.status, 200);
    assert.equal(stub!.seen.length, 3);
    assert.equal((await jsonOf<RunApiResponse>(res)).quota.used, 1);
    assert.equal(usage("u1"), 1);
    assert.equal(runRows().length, 1, "one lab_runs row per submission");
  });
});

describe("lesson lab grading", () => {
  const ref = { kind: "lesson", track: "python", lesson: "basics", exercise: "add" };
  const progress = () => db.query<{ user_id: string; ref: string; passed_at: string }>("SELECT * FROM lab_progress");

  test("all tests pass: grade passed, lab_progress recorded, run logged as passed", async () => {
    const res = await post({ lang: "python", code: "CORRECT", ref });
    const body = await jsonOf<RunApiResponse & { grade: GradeResult }>(res);
    assert.equal(body.grade.passed, true);
    assert.equal(body.grade.score, 1);
    assert.deepEqual(body.grade.tests.map((t) => [t.name, t.passed]), [["adds two numbers", true], ["handles negatives", true], ["larger values", true]]);
    assert.ok(body.grade.tests.every((t) => t.expected === undefined && t.actual === undefined), "passing tests carry no expected/actual");
    assert.deepEqual(stub!.seen.map((s) => s.job!.stdin), ["1 2\n", "-1 1\n", "40 2\n"], "each test runs with its own stdin");
    assert.equal(body.result.status, "ok");
    assert.deepEqual(progress().map((p) => [p.user_id, p.ref]), [["u1", "python/basics/add"]]);
    const row = runRows()[0];
    assert.deepEqual([row.ref_kind, row.track, row.lesson, row.exercise, row.passed, row.success], ["lesson", "python", "basics", "add", 1, 1]);
  });

  test("progress is idempotent: passing again keeps one row and the original timestamp", async () => {
    await post({ lang: "python", code: "CORRECT", ref });
    db.execute("UPDATE lab_progress SET passed_at = '2026-01-02 03:04:05'");
    await post({ lang: "python", code: "CORRECT", ref });
    assert.deepEqual(progress().map((p) => p.passed_at), ["2026-01-02 03:04:05"]);
    assert.equal(runRows().length, 2);
  });

  test("progress is per user", async () => {
    await post({ lang: "python", code: "CORRECT", ref });
    assert.equal(progress().filter((p) => p.user_id === "u2").length, 0);
  });

  test("partial pass: score is the fraction, failing visible tests show expected and actual, no progress", async () => {
    stub!.restore();
    // right on the first two inputs, wrong on the third
    stub = stubRunner((job) => okResult({ stdout: job.stdin.startsWith("40") ? "0\n" : sumRunner(job).stdout.replace("99", String(job.stdin.split(" ").reduce((a, b) => a + Number(b), 0))) }));
    const res = await post({ lang: "python", code: "whatever", ref });
    const body = await jsonOf<RunApiResponse & { grade: GradeResult }>(res);
    assert.equal(body.grade.passed, false);
    assert.ok(Math.abs(body.grade.score - 2 / 3) < 1e-9);
    const failed = body.grade.tests[2];
    assert.deepEqual([failed.passed, failed.expected, failed.actual, failed.message], [false, "42", "0\n", "wrong_output"]);
    assert.equal(progress().length, 0);
    assert.equal(body.result.stdout, "0\n", "the learner sees the failing run");
    assert.equal(runRows()[0].passed, 0);
    assert.equal(body.quota.used, 1, "a wrong answer still costs the unit");
  });

  test("compile error aborts the remaining tests as not_run and shows the compiler output", async () => {
    const res = await post({ lang: "python", code: "COMPILE_ERROR", ref });
    const body = await jsonOf<RunApiResponse & { grade: GradeResult }>(res);
    assert.equal(stub!.seen.length, 1);
    assert.deepEqual(body.grade.tests.map((t) => t.message), ["compile_error", "not_run", "not_run"]);
    assert.equal(body.grade.passed, false);
    assert.equal(body.grade.score, 0);
    assert.equal(body.result.status, "compile_error");
    assert.equal(body.quota.used, 1);
  });

  test("no test is started after the grading budget; the rest are not_run (bounds the reservation)", async () => {
    stub!.restore();
    let clock = 0;
    stub = stubRunner((job) => {
      clock += GRADING_BUDGET_MS / 2 + 1; // each run takes just over half the budget
      return sumRunner(job);
    });
    const graded = await gradeLab(env, LAB, "CORRECT", { now: () => clock });
    assert.equal(stub!.seen.length, 2, "the third test would start after the budget");
    assert.deepEqual(graded.grade.tests.map((t) => [t.passed, t.message]), [[true, undefined], [true, undefined], [false, "not_run"]]);
    assert.equal(graded.grade.passed, false);
    assert.equal(graded.runs.length, 2);
  });

  test("a runtime error on one test does not stop the others", async () => {
    stub!.restore();
    let n = 0;
    stub = stubRunner(() => (n++ === 0 ? okResult({ status: "runtime_error", exitCode: 1, stdout: "", stderr: "boom" }) : okResult({ stdout: "0\n" })));
    const body = await jsonOf<RunApiResponse & { grade: GradeResult }>(await post({ lang: "python", code: "x", ref }));
    assert.equal(stub!.seen.length, 3);
    assert.equal(body.grade.tests[0].message, "runtime_error");
  });

  test("the runner failing mid-grade is a refunded 503, not a wrong answer", async () => {
    stub!.restore();
    let n = 0;
    stub = stubRunner((job) => (n++ === 1 ? new Response("down", { status: 503 }) : sumRunner(job)));
    const res = await post({ lang: "python", code: "CORRECT", ref });
    // Same contract as an ungraded run: an outage is 503 runner_unavailable, never a wrong answer.
    assert.equal(res.status, 503);
    const body = await jsonOf<{ error: string; quota: { used: number } }>(res);
    assert.equal(body.error, "runner_unavailable");
    assert.equal(body.quota.used, 0);
    assert.equal(usage("_global"), 0);
    assert.equal(progress().length, 0);
    assert.equal(runRows()[0].passed, null, "an infrastructure failure is not a wrong answer");
  });

  test("a wrong language for the exercise is 400, an unknown exercise is 404; neither costs quota", async () => {
    const wrongLang = await post({ lang: "javascript", code: "x", ref });
    assert.equal(wrongLang.status, 400);
    assert.match((await jsonOf<{ message: string }>(wrongLang)).message, /Python/);
    const unknown = await post({ lang: "python", code: "x", ref: { ...ref, exercise: "nope" } });
    assert.equal(unknown.status, 404);
    assert.equal((await jsonOf<{ error: string }>(unknown)).error, "not_found");
    assert.equal(stub!.seen.length, 0);
    assert.equal(usage("u1"), 0);
  });

  test("at most 12 tests are run", async () => {
    const many: CatalogLab = { ...LAB, ref: "python/basics/many", id: "many", tests: Array.from({ length: 20 }, (_, i) => ({ name: `t${i}`, stdin: `${i} 1\n`, expected: String(i + 1), mode: "trim" as const })) };
    catalog.labs.push(many);
    try {
      const body = await jsonOf<RunApiResponse & { grade: GradeResult }>(await post({ lang: "python", code: "CORRECT", ref: { ...ref, exercise: "many" } }));
      assert.equal(stub!.seen.length, 12);
      assert.equal(body.grade.tests.length, 12);
      assert.equal(body.grade.passed, true);
    } finally {
      catalog.labs.splice(catalog.labs.indexOf(many), 1);
    }
  });

  test("a program that prints the right answer but exits non-zero does not pass", async () => {
    stub!.restore();
    stub = stubRunner(() => okResult({ status: "runtime_error", exitCode: 3, stdout: "3\n" }));
    const body = await jsonOf<RunApiResponse & { grade: GradeResult }>(await post({ lang: "python", code: "x", ref }));
    assert.equal(body.grade.passed, false);
  });
});

describe("abuse hooks", () => {
  const signals = (kind: string) => db.query<{ n: number }>("SELECT COUNT(*) AS n FROM abuse_signals WHERE user_id = 'u1' AND kind = ?", kind)[0].n;
  const status = () => db.query<{ status: string }>("SELECT status FROM users WHERE github_id = 'u1'")[0].status;

  test("timeouts raise a resource signal; ordinary runs do not", async () => {
    await post(PY);
    assert.equal(signals("resource"), 0);
    await post({ ...PY, code: "TIMEOUT" });
    assert.equal(signals("resource"), 1);
  });

  test("memory_limit and output_limit are resource signals too", async () => {
    stub!.restore();
    stub = stubRunner((job) => okResult({ status: job.code === "m" ? "memory_limit" : "output_limit", stdout: "" }));
    await post({ lang: "python", code: "m" });
    await post({ lang: "python", code: "o" });
    assert.equal(signals("resource"), 2);
  });

  test("network-probe-looking code raises a signal but is STILL RUN", async () => {
    const res = await post({ lang: "bash", code: "curl -s http://169.254.169.254/latest/meta-data/" });
    assert.equal(res.status, 200);
    assert.equal(stub!.seen.length, 1, "the signature scan never blocks a run");
    assert.equal(signals("network_probe"), 1);
  });

  test("ordinary code does not raise network_probe signals", async () => {
    await post({ lang: "python", code: "import socket\ns = socket.socket()\ns.connect(('127.0.0.1', 8080))\nprint('https://example.com')" });
    assert.equal(signals("network_probe"), 0);
  });

  test("repeated resource abuse auto-suspends the account; the next run is 403 and nothing runs", async () => {
    env = makeEnv(db, { ABUSE_RESOURCE_MAX: "3", RUN_PER_MINUTE_FREE: "1000", RUN_MAX_CONCURRENT: "100" });
    for (let i = 0; i < 3; i++) assert.equal((await post({ ...PY, code: "TIMEOUT" })).status, 200);
    assert.equal(status(), "suspended");
    const before = stub!.seen.length;
    const res = await post(PY);
    assert.equal(res.status, 403);
    assert.equal((await jsonOf<{ error: string }>(res)).error, "account_suspended");
    assert.equal(stub!.seen.length, before);
    const audit = db.query<{ action: string; user_id: string }>("SELECT action, user_id FROM audit_log");
    assert.deepEqual(audit, [{ action: "abuse.auto_suspend", user_id: "u1" }]);
  });

  test("hammering past the rate limit raises flood signals and eventually suspends", async () => {
    env = makeEnv(db, { RUN_PER_MINUTE_FREE: "1", ABUSE_FLOOD_MAX: "3", RUN_MAX_CONCURRENT: "100" });
    assert.equal((await post(PY)).status, 200);
    for (let i = 0; i < 3; i++) assert.equal((await post(PY)).status === 429 || i === 2, true);
    assert.equal(status(), "suspended");
    assert.equal((await post(PY)).status, 403);
  });
});

describe("failures are never echoed", () => {
  test("a database failure while logging -> 500 internal_error JSON, refund, no raw exception text", async () => {
    const real = env.DB;
    env = {
      ...env,
      DB: new Proxy(real, {
        get(target, prop, receiver) {
          if (prop === "prepare") {
            return (sql: string) => {
              if (sql.includes("ON CONFLICT(id) DO UPDATE")) throw new Error("SQLITE_ERROR secret-table-name leaked: " + RUNNER_SECRET);
              return target.prepare(sql);
            };
          }
          return Reflect.get(target, prop, receiver);
        },
      }),
    };
    const res = await post(PY);
    const text = await res.text();
    assert.equal(res.status, 500);
    assert.equal(JSON.parse(text).error, "internal_error");
    assert.ok(!text.includes("secret-table-name") && !text.includes(RUNNER_SECRET));
    assert.equal(usage("u1"), 0, "the reservation is refunded");
    assert.equal(db.query("SELECT 1 FROM lab_runs WHERE status = 'running'").length, 0);
  });
});

describe("suspended and deleted accounts", () => {
  test("a suspended account cannot run (403) and a deleted one gets 401", async () => {
    addUser(db, { id: "s1", status: "suspended" });
    const res = await post(PY, await tokenFor("s1"));
    assert.equal(res.status, 403);
    assert.equal((await jsonOf<{ error: string }>(res)).error, "account_suspended");
    assert.equal(stub!.seen.length, 0);
    assert.equal((await post(PY, await tokenFor("ghost"))).status, 401);
  });
});
