// Output / harness grading through the real submit handler with a scripted runner.
import { test } from "node:test";
import assert from "node:assert/strict";
import type { SubmitResponse } from "../../../shared/api";
import type { ChallengeGrader } from "../../../shared/challenges";
import { buildProgram, gradeTests, redactResult } from "../../src/graders/engine";
import { type World, makeWorld, metas, runResult, scriptedRunner } from "./helpers/world";

type Body = SubmitResponse & { error?: string; message?: string };

async function setup(opts: Parameters<typeof makeWorld>[0] = {}) {
  const w = await makeWorld(opts);
  await w.addUser({ sub: "u1" });
  return { w, token: await w.token("u1") };
}
const submit = (w: World, id: string, token: string, lang: string, code: unknown) => w.api<Body>(`/api/challenges/${id}/submit`, { method: "POST", token, body: { lang, code } });

test("output: all tests pass → correct, one quota unit for the whole submission, points awarded", async () => {
  const { w, token } = await setup();
  const r = await submit(w, "out-sum", token, "python", "# #SUM");
  assert.equal(r.status, 200);
  assert.equal(r.body.correct, true);
  assert.equal(r.body.awarded, 60);
  assert.equal(r.body.firstBlood, true);
  assert.equal(r.body.grade?.passed, true);
  assert.equal(r.body.grade?.score, 1);
  assert.equal(r.body.grade?.tests.length, 3);
  assert.equal(w.log.runs.length, 3, "one runner call per test");
  assert.deepEqual(w.log.reserve, [{ user: "u1", units: 1 }], "reserved once, not per test");
  assert.deepEqual(w.log.settle, ["ok"]);
  assert.ok(r.body.quota, "the settled quota is returned");
  assert.equal(r.body.result && "jobId" in r.body.result, false, "the public result carries no job id");
});

test("output: partial credit is reported, only the first failing VISIBLE test shows expected/actual", async () => {
  const { w, token } = await setup();
  const r = await submit(w, "out-sum", token, "python", "# #FIRSTONLY");
  assert.equal(r.body.correct, false);
  assert.equal(r.body.awarded, 0);
  const g = r.body.grade;
  assert.ok(g);
  assert.equal(g.passed, false);
  assert.ok(Math.abs(g.score - 1 / 3) < 1e-9);
  assert.deepEqual(g.tests.map((t) => t.passed), [true, false, false]);
  assert.equal(g.tests[1].expected, "-3");
  assert.equal(g.tests[1].actual, "0\n");
  assert.equal(g.tests[2].hidden, true);
  assert.equal(g.tests[2].expected, undefined);
  assert.equal(g.tests[2].actual, undefined);
  assert.equal(g.feedback, "1/3 tests passed");
  assert.equal(w.db.rows("SELECT * FROM challenge_solves").length, 0);
});

test("only the FIRST failing visible test carries expected/actual", async () => {
  const grader: ChallengeGrader = {
    id: "x",
    kind: "output",
    tests: [
      { name: "a", stdin: "1", expected: "ONE" },
      { name: "b", stdin: "2", expected: "TWO" },
    ],
  };
  const out = await gradeTests(grader, "python", "p", async () => runResult({ stdout: "nope\n" }));
  assert.equal(out.kind, "graded");
  if (out.kind !== "graded") return;
  assert.equal(out.grade.tests[0].expected, "ONE");
  assert.equal(out.grade.tests[1].expected, undefined);
});

test("hidden tests never leak expected output, stdin or actual output (response, logs, stored run)", async () => {
  const { w, token } = await setup();
  for (const code of ["# #UPPERVISIBLE", "# #UPPER", "# #WRONG", "# #CRASH", "# #TIMEOUT"]) {
    const r = await submit(w, "out-hidden", token, "python", code);
    assert.equal(r.status, 200, code);
    const wire = JSON.stringify(r.body);
    for (const secret of ["SECRET-OUT-9", "secret-in", "garbage-from-hidden", "SECRET-IN"]) assert.ok(!wire.includes(secret), `${code}: response leaks ${secret}`);
    const hidden = r.body.grade?.tests.find((t) => t.hidden);
    assert.ok(hidden);
    assert.equal(hidden.expected, undefined);
    assert.equal(hidden.actual, undefined);
  }
  const stored = JSON.stringify(w.db.rows("SELECT * FROM lab_runs"));
  assert.ok(!stored.includes("SECRET-OUT-9") && !stored.includes("secret-in"), "stored runs hold no hidden data");
  for (const row of w.db.rows<{ stdin: string | null }>("SELECT stdin FROM lab_runs")) assert.equal(row.stdin, null);
});

test("a passing hidden-only run does not echo its output (stdout is the expected output)", async () => {
  const grader: ChallengeGrader = { id: "x", kind: "output", tests: [{ name: "h", stdin: "i", expected: "TOP-SECRET", hidden: true }] };
  const out = await gradeTests(grader, "python", "p", async () => runResult({ stdout: "TOP-SECRET\n" }));
  assert.equal(out.kind, "graded");
  if (out.kind !== "graded") return;
  assert.equal(out.grade.passed, true);
  assert.equal(out.result.stdout, "");
  assert.ok(!JSON.stringify(out).includes("TOP-SECRET"));
});

test("redactResult keeps compile diagnostics of a hidden test but blanks its output", () => {
  const compile = runResult({ status: "compile_error", exitCode: 1, stderr: "boom.c:1: error", compileOutput: "boom.c:1: error" });
  assert.equal(redactResult(compile, true).compileOutput, "boom.c:1: error");
  const ran = runResult({ stdout: "secret", stderr: "secret-err", stdoutBytes: 6, stderrBytes: 10 });
  const red = redactResult(ran, true);
  assert.deepEqual([red.stdout, red.stderr, red.stdoutBytes, red.stderrBytes], ["", "", 0, 0]);
});

test("timeout / crash map to failed tests with a generic message; the quota charge is kept", async () => {
  const { w, token } = await setup();
  const t = await submit(w, "out-sum", token, "python", "# #TIMEOUT");
  assert.equal(t.body.correct, false);
  assert.ok(t.body.grade?.tests.every((x) => !x.passed && x.message === "Time limit exceeded"));
  assert.deepEqual(w.log.settle, ["timeout"]);
  const c = await submit(w, "out-sum", token, "python", "# #CRASH");
  assert.ok(c.body.grade?.tests.every((x) => x.message === "Runtime error"));
  assert.ok(!JSON.stringify(c.body.grade).includes("Traceback"), "stderr of a graded test is not echoed in the grade");
  assert.deepEqual(w.log.settle, ["timeout", "runtime_error"]);
});

test("compile error: stops after the first run, diagnostics are shown, attempt recorded, no points", async () => {
  const { w, token } = await setup();
  const r = await submit(w, "out-sum", token, "javascript", "# #COMPILE");
  assert.equal(r.body.correct, false);
  assert.equal(w.log.runs.length, 1, "the other tests are not run");
  assert.match(r.body.feedback ?? "", /Compilation failed/);
  assert.match(r.body.feedback ?? "", /expected ';'/);
  assert.ok(r.body.grade?.tests.every((t) => !t.passed));
  assert.deepEqual(w.log.settle, ["compile_error"]);
  assert.equal(w.db.one<{ attempts: number }>("SELECT attempts FROM challenge_progress WHERE user_id = 'u1' AND challenge_id = 'out-sum'")?.attempts, 1);
  assert.equal(w.db.one<{ first_error: string }>("SELECT first_error FROM lab_runs")?.first_error, "main.c:3: error: expected ';'");
});

test("infrastructure failure: 503 runner_unavailable, the quota unit is refunded, nothing is recorded", async () => {
  const { w, token } = await setup();
  const r = await submit(w, "out-sum", token, "python", "# #INFRA");
  assert.equal(r.status, 503);
  assert.equal(r.body.error, "runner_unavailable");
  assert.equal(w.log.runs.length, 1, "stops at the first infrastructure failure");
  assert.deepEqual(w.log.settle, ["internal_error"]);
  assert.equal(w.db.rows("SELECT * FROM challenge_attempts").length, 0);
  assert.equal(w.db.rows("SELECT * FROM lab_runs").length, 0);
  assert.equal(w.db.rows("SELECT * FROM challenge_progress").length, 0);
  const u = await submit(w, "out-sum", token, "python", "# #UNSUPPORTED");
  assert.equal(u.status, 503);
  assert.deepEqual(w.log.settle, ["internal_error", "unsupported"]);
});

test("a runner that throws is an infrastructure failure, not a 500", async () => {
  const { w, token } = await setup({ runner: () => Promise.reject(new Error("socket hang up")) });
  const r = await submit(w, "out-sum", token, "python", "# #SUM");
  assert.equal(r.status, 503);
  assert.deepEqual(w.log.settle, ["internal_error"]);
});

test("a failure after reserving settles the reservation as rejected (no leaked units)", async () => {
  const { w, token } = await setup();
  const orig = w.deps.lab.runOnRunner;
  w.deps.lab.runOnRunner = async (e, req) => {
    const res = await orig(e, req);
    w.db.exec("DROP TABLE IF EXISTS challenge_attempts"); // the next DB write after grading blows up
    return res;
  };
  const r = await submit(w, "out-sum", token, "python", "# #SUM");
  assert.equal(r.status, 500);
  assert.equal(w.log.settle.length, 1, "settled exactly once");
});

test("truncated output is a failure, never a guess", async () => {
  const { w, token } = await setup();
  const r = await submit(w, "out-sum", token, "python", "# #NOISY");
  assert.equal(r.body.correct, false);
  assert.ok(r.body.grade?.tests.every((t) => t.message === "Output too long"));
});

test("quota exhausted: the ready-made 429 is returned and nothing runs", async () => {
  const { w, token } = await setup({ quotaDenied: true });
  const r = await submit(w, "out-sum", token, "python", "# #SUM");
  assert.equal(r.status, 429);
  assert.equal(r.body.error, "quota_exceeded");
  assert.equal(w.log.runs.length, 0);
  assert.equal(w.log.settle.length, 0);
});

test("validation: language, allowedLangs, code size and shape are checked before any quota is reserved", async () => {
  const { w, token } = await setup();
  assert.equal((await submit(w, "out-sum", token, "cobol", "x")).status, 400);
  assert.equal((await submit(w, "out-sum", token, "ruby", "x")).status, 400, "ruby is not in allowedLangs");
  assert.equal((await submit(w, "out-sum", token, "python", "")).status, 400);
  assert.equal((await submit(w, "out-sum", token, "python", "  \n")).status, 400);
  assert.equal((await submit(w, "out-sum", token, "python", 7)).status, 400);
  assert.equal((await submit(w, "out-sum", token, "python", "x".repeat(32 * 1024 + 1))).status, 400);
  assert.equal((await submit(w, "out-sum", token, "python", "é".repeat(17 * 1024))).status, 400, "the limit is in bytes");
  assert.equal((await submit(w, "out-sum", token, "python", "x".repeat(32 * 1024))).status, 200, "exactly at the limit is accepted");
  assert.equal(w.log.reserve.length, 1);
});

test("a flag challenge refuses code and a code challenge refuses a flag", async () => {
  const { w, token } = await setup();
  assert.equal((await submit(w, "flag-basic", token, "python", "print(1)")).status, 400);
  const r = await w.api("/api/challenges/out-sum/submit", { method: "POST", token, body: { flag: "x" } });
  assert.equal(r.status, 400);
});

test("harness: the learner's code is spliced at {{CODE}} literally; languages without a harness are 400", async () => {
  const { w, token } = await setup();
  const code = "def double(x): return x * 2  # $& $1 $` $' #DOUBLE";
  const r = await submit(w, "code-double", token, "python", code);
  assert.equal(r.body.correct, true);
  assert.equal(r.body.awarded, 80);
  assert.equal(w.log.runs[0].code, `${code}\nprint(double(int(input())))\n`);
  assert.equal(w.log.runs[0].stdin, "2");

  const none = await submit(w, "code-double", token, "ruby", "def double(x) x end");
  assert.equal(none.status, 400);
  assert.equal(none.body.error, "invalid_request");
  assert.equal(w.log.runs.length, 2, "no extra runs for the unsupported language");
});

test("harness: code containing the {{CODE}} sentinel is rejected, a harness without one is misconfigured", async () => {
  const { w, token } = await setup();
  const r = await submit(w, "code-double", token, "python", "x = '{{CODE}}'");
  assert.equal(r.status, 400);
  assert.equal(w.log.runs.length, 0);
  assert.deepEqual(buildProgram({ id: "h", kind: "code", harness: { python: "no marker" }, tests: [] }, "python", "x"), { ok: false, reason: "misconfigured" });
  assert.deepEqual(buildProgram({ id: "h", kind: "code", harness: { python: "A{{CODE}}B{{CODE}}C" }, tests: [] }, "python", "x"), { ok: true, program: "AxB{{CODE}}C" }, "only the first marker is replaced");
});

test("harness: the compile error of the combined program is a failed grade; hidden test names stay generic", async () => {
  const { w, token } = await setup();
  const r = await submit(w, "code-double", token, "python", "# #WRONG");
  assert.equal(r.body.correct, false);
  assert.equal(r.body.grade?.tests[0].expected, "4", "the visible test shows the expected value");
  assert.equal(r.body.grade?.tests[1].expected, undefined);
});

test("at most 20 tests run per submission", async () => {
  const tests = Array.from({ length: 25 }, (_, i) => ({ name: `t${i}`, stdin: String(i), expected: "" }));
  let calls = 0;
  const out = await gradeTests({ id: "x", kind: "output", tests }, "python", "p", async () => {
    calls++;
    return runResult({ stdout: "\n" });
  });
  assert.equal(calls, 20);
  assert.equal(out.kind === "graded" && out.grade.tests.length, 20);
});

test("a grader without tests is misconfigured (500), the reservation is released", async () => {
  const { w, token } = await setup({ graders: [{ id: "out-sum", kind: "output", tests: [] }] });
  const r = await submit(w, "out-sum", token, "python", "# #SUM");
  assert.equal(r.status, 500);
  assert.equal(r.body.error, "challenge_misconfigured");
  assert.deepEqual(w.log.settle, ["rejected"]);
});

test("the time budget stops a slow grader: remaining tests fail as skipped, never run", async () => {
  let t = 0;
  const tests = [1, 2, 3].map((i) => ({ name: `t${i}`, stdin: String(i), expected: "ok" }));
  let calls = 0;
  const out = await gradeTests(
    { id: "x", kind: "output", tests },
    "python",
    "p",
    async () => {
      calls++;
      t += 40_000;
      return runResult({ stdout: "ok\n" });
    },
    { now: () => t, budgetMs: 50_000 },
  );
  assert.equal(calls, 2);
  assert.equal(out.kind === "graded" && out.grade.tests[2].message, "Skipped: time budget exceeded");
});

test("per-test timeoutMs can only lower the runner's limit", async () => {
  const seen: unknown[] = [];
  await gradeTests(
    { id: "x", kind: "output", tests: [{ name: "a", stdin: "", expected: "", timeoutMs: 1000 }, { name: "b", stdin: "", expected: "", timeoutMs: 60_000 }, { name: "c", stdin: "", expected: "" }] },
    "python",
    "p",
    async (req) => {
      seen.push(req.limits);
      return runResult({ stdout: "\n" });
    },
  );
  assert.deepEqual(seen, [{ runTimeoutMs: 1000 }, { runTimeoutMs: 5000 }, undefined]);
});

test("the scripted runner double is deterministic (guards the other tests)", () => {
  assert.equal(scriptedRunner({ lang: "python", code: "#SUM", stdin: "2 3" }).stdout, "5\n");
  assert.ok(metas.length > 0);
});

test("code submissions raise the same abuse signals as /api/lab/run (resource limits, network probes)", async () => {
  const { w, token } = await setup();
  const slow = await submit(w, "out-sum", token, "python", "# #TIMEOUT");
  assert.equal(slow.status, 200);
  assert.deepEqual(w.log.signals.map((x) => [x.userId, x.kind]), [["u1", "resource"]]);
  assert.match(w.log.signals[0].detail, /timeout/);

  const probe = await submit(w, "out-sum", token, "python", 'import urllib.request\nurllib.request.urlopen("http://169.254.169.254/latest/meta-data")\n# #SUM');
  assert.equal(probe.status, 200);
  assert.deepEqual(w.log.signals.map((x) => x.kind), ["resource", "network_probe"]);
});

test("an honest submission raises no abuse signal", async () => {
  const { w, token } = await setup();
  await submit(w, "out-sum", token, "python", "# #SUM");
  await submit(w, "out-sum", token, "python", "# #WRONG");
  assert.deepEqual(w.log.signals, []);
});
