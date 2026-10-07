// Quota reserve / settle / refund, rate limit, concurrency, user and global caps.
import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import type { QuotaError } from "../../shared/api";
import type { RunStatus } from "../../shared/protocol";
import { DEFAULT_BUDGET_MS, gradeTests } from "../src/graders/engine";
import { GRADING_BUDGET_MS, MAX_GRADED_TESTS } from "../src/lab/config";
import { RUNNING_STALE_SECONDS, getQuotaInfo, recordRun, reserveQuota, settleQuota, type Reservation } from "../src/lab/execute";
import { runTimeoutBudgetMs } from "../src/lab/runner";
import type { Env } from "../src/util";
import { TestD1 } from "./helpers/d1";
import { addUser, jsonOf, makeEnv, okResult } from "./helpers/harness";

let db: TestD1;
const make = (extra: Partial<Env> = {}) => makeEnv(db, extra);
const today = () => new Date().toISOString().slice(0, 10);
const usage = (id: string) => db.query<{ count: number }>("SELECT count FROM lab_usage WHERE user_id = ? AND day = ?", id, today())[0]?.count ?? 0;
const runsOf = (id: string) => db.query<{ id: string; status: string }>("SELECT id, status FROM lab_runs WHERE user_id = ?", id);

/** A lab_runs row `secondsAgo` seconds old. */
function seedRun(userId: string, status: string, secondsAgo: number): void {
  db.execute(
    "INSERT INTO lab_runs (id, user_id, ref_kind, lang, status, created_at) VALUES (?, ?, 'free', 'python', ?, datetime('now', ?))",
    crypto.randomUUID(),
    userId,
    status,
    `-${secondsAgo} seconds`,
  );
}

async function reserveOk(env: Env, sub: string): Promise<Reservation> {
  const r = await reserveQuota(env, { sub });
  assert.ok(r.ok, "reservation should succeed");
  return r.reservation;
}

async function deny(env: Env, sub: string) {
  const r = await reserveQuota(env, { sub });
  assert.ok(!r.ok, "reservation should be denied");
  return { res: r.response, body: await jsonOf<QuotaError & { message?: string }>(r.response.clone()) };
}

beforeEach(() => {
  db = new TestD1();
  addUser(db, { id: "u1" });
  addUser(db, { id: "u2" });
  addUser(db, { id: "p1", plan: "pro" });
});

describe("reserve", () => {
  test("charges the user and the global bucket and leaves an in-flight row", async () => {
    const env = make();
    const r = await reserveQuota(env, { sub: "u1" });
    assert.ok(r.ok);
    assert.equal(r.plan, "free");
    assert.equal(r.reservation.units, 1);
    assert.equal(r.reservation.day, today());
    assert.equal(usage("u1"), 1);
    assert.equal(usage("_global"), 1);
    assert.deepEqual(runsOf("u1"), [{ id: r.reservation.runId, status: "running" }]);
  });

  test("plan mapping: free 50/day 10/min, pro 500/day 30/min, with env overrides", async () => {
    const env = make();
    const free = await getQuotaInfo(env, { sub: "u1" });
    const pro = await getQuotaInfo(env, { sub: "p1" });
    assert.deepEqual([free.plan, free.limit, free.perMinute], ["free", 50, 10]);
    assert.deepEqual([pro.plan, pro.limit, pro.perMinute], ["pro", 500, 30]);
    const tuned = make({ RUN_DAILY_LIMIT_FREE: "7", RUN_DAILY_LIMIT_PRO: "70", RUN_PER_MINUTE_FREE: "3", RUN_PER_MINUTE_PRO: "9" });
    assert.deepEqual([(await getQuotaInfo(tuned, { sub: "u1" })).limit, (await getQuotaInfo(tuned, { sub: "u1" })).perMinute], [7, 3]);
    assert.deepEqual([(await getQuotaInfo(tuned, { sub: "p1" })).limit, (await getQuotaInfo(tuned, { sub: "p1" })).perMinute], [70, 9]);
  });

  test("garbage env values fall back to the documented defaults", async () => {
    const env = make({ RUN_DAILY_LIMIT_FREE: "lots", RUN_PER_MINUTE_FREE: "-4", RUN_MAX_CONCURRENT: "0" });
    const info = await getQuotaInfo(env, { sub: "u1" });
    assert.equal(info.limit, 50);
    assert.equal(info.perMinute, 10);
    await reserveOk(env, "u1");
    await reserveOk(env, "u1");
    assert.equal((await deny(env, "u1")).body.scope, "concurrency"); // default concurrency of 2
  });

  test("getQuotaInfo reports usage, remaining and the next 00:00 UTC reset", async () => {
    const env = make();
    await reserveOk(env, "u1");
    const info = await getQuotaInfo(env, { sub: "u1" });
    assert.equal(info.used, 1);
    assert.equal(info.remaining, 49);
    const reset = new Date(info.resetAt);
    assert.equal(reset.getUTCHours() + reset.getUTCMinutes() + reset.getUTCSeconds(), 0);
    const delta = reset.getTime() - Date.now();
    assert.ok(delta > 0 && delta <= 24 * 3600 * 1000);
  });

  test("an unknown account (deleted, stale token) is 401, not a free run", async () => {
    const { res, body } = await deny(make(), "ghost");
    assert.equal(res.status, 401);
    assert.equal(body.error, "unauthorized");
    assert.equal(usage("ghost"), 0);
    assert.equal(usage("_global"), 0);
  });

  test("rejections never carry cache headers other than no-store and include CORS for the caller's origin", async () => {
    const env = make({ RUN_DAILY_LIMIT_FREE: "1" });
    await settleQuota(env, await reserveOk(env, "u1"), "ok");
    const r = await reserveQuota(env, { sub: "u1" }, 1, "http://localhost:4173");
    assert.ok(!r.ok);
    assert.equal(r.response.status, 429);
    assert.equal(r.response.headers.get("Cache-Control"), "no-store");
    assert.equal(r.response.headers.get("Access-Control-Allow-Origin"), "http://localhost:4173");
  });
});

describe("settle", () => {
  const KEEP: RunStatus[] = ["ok", "compile_error", "runtime_error", "timeout", "memory_limit", "output_limit"];
  const REFUND: (RunStatus | "rejected")[] = ["internal_error", "unsupported", "rejected"];

  for (const outcome of KEEP) {
    test(`${outcome} keeps the charge`, async () => {
      const env = make();
      const resv = await reserveOk(env, "u1");
      const info = await settleQuota(env, resv, outcome);
      assert.equal(info.used, 1);
      assert.equal(usage("_global"), 1);
      assert.equal(runsOf("u1").filter((r) => r.status === "running").length, 0, "in-flight row removed when recordRun did not claim it");
    });
  }

  for (const outcome of REFUND) {
    test(`${outcome} refunds user and global units`, async () => {
      const env = make();
      const resv = await reserveOk(env, "u1");
      assert.equal(usage("u1"), 1);
      const info = await settleQuota(env, resv, outcome);
      assert.equal(info.used, 0);
      assert.equal(info.remaining, 50);
      assert.equal(usage("u1"), 0);
      assert.equal(usage("_global"), 0);
      assert.equal(runsOf("u1").length, 0);
    });
  }

  test("a refund never drives a counter below zero", async () => {
    const env = make();
    const resv = await reserveOk(env, "u1");
    db.execute("UPDATE lab_usage SET count = 0");
    await settleQuota(env, resv, "internal_error");
    assert.equal(usage("u1"), 0);
    assert.equal(usage("_global"), 0);
  });

  test("recordRun completes the in-flight row in place instead of adding a second one", async () => {
    const env = make();
    const resv = await reserveOk(env, "u1");
    const id = await recordRun(env, { id: resv.runId, userId: "u1", ref: { kind: "free" }, lang: "python", result: okResult(), code: "print(1)" });
    assert.equal(id, resv.runId);
    const rows = db.query<{ id: string; status: string; success: number; lang: string }>("SELECT id, status, success, lang FROM lab_runs WHERE user_id = 'u1'");
    assert.deepEqual(rows, [{ id: resv.runId, status: "ok", success: 1, lang: "python" }]);
    await settleQuota(env, resv, "ok");
    assert.equal(runsOf("u1").length, 1, "settling must not delete a completed row");
  });

  test("recordRun cannot overwrite another user's row", async () => {
    const env = make();
    const resv = await reserveOk(env, "u1");
    await recordRun(env, { id: resv.runId, userId: "u2", ref: { kind: "free" }, lang: "python", result: okResult({ stdout: "hijack" }), code: "x" });
    const row = db.query<{ user_id: string; status: string; stdout: string | null }>("SELECT user_id, status, stdout FROM lab_runs WHERE id = ?", resv.runId)[0];
    assert.deepEqual(row, { user_id: "u1", status: "running", stdout: null });
  });
});

describe("limits", () => {
  test("daily user cap: scope user, resetAt, nothing leaks into the counters", async () => {
    const env = make({ RUN_DAILY_LIMIT_FREE: "2", RUN_PER_MINUTE_FREE: "100", RUN_MAX_CONCURRENT: "100" });
    await settleQuota(env, await reserveOk(env, "u1"), "ok");
    await settleQuota(env, await reserveOk(env, "u1"), "ok");
    const { res, body } = await deny(env, "u1");
    assert.equal(res.status, 429);
    assert.equal(body.error, "quota_exceeded");
    assert.equal(body.scope, "user");
    assert.ok(body.resetAt && new Date(body.resetAt).getTime() > Date.now());
    assert.equal(usage("u1"), 2);
    assert.equal(usage("_global"), 2);
    assert.equal(runsOf("u1").filter((r) => r.status === "running").length, 0);
    // Another user is unaffected.
    assert.ok((await reserveQuota(env, { sub: "u2" })).ok);
  });

  test("global cap: scope global, the user's own counter is reverted", async () => {
    const env = make({ RUN_DAILY_LIMIT_GLOBAL: "2", RUN_PER_MINUTE_FREE: "100", RUN_MAX_CONCURRENT: "100" });
    await settleQuota(env, await reserveOk(env, "u1"), "ok");
    await settleQuota(env, await reserveOk(env, "u2"), "ok");
    const { res, body } = await deny(env, "p1");
    assert.equal(res.status, 429);
    assert.equal(body.error, "quota_exceeded");
    assert.equal(body.scope, "global");
    assert.equal(usage("p1"), 0);
    assert.equal(usage("_global"), 2);
  });

  test("refunds free the global cap again", async () => {
    const env = make({ RUN_DAILY_LIMIT_GLOBAL: "1", RUN_PER_MINUTE_FREE: "100", RUN_MAX_CONCURRENT: "100" });
    await settleQuota(env, await reserveOk(env, "u1"), "internal_error");
    assert.ok((await reserveQuota(env, { sub: "u2" })).ok);
  });

  test("per-minute rate limit: 429 rate_limited with Retry-After; older runs do not count", async () => {
    const env = make({ RUN_PER_MINUTE_FREE: "3", RUN_MAX_CONCURRENT: "100" });
    seedRun("u1", "ok", 5);
    seedRun("u1", "ok", 20);
    seedRun("u1", "runtime_error", 40);
    seedRun("u1", "ok", 300); // outside the window
    const { res, body } = await deny(env, "u1");
    assert.equal(res.status, 429);
    assert.equal(body.error, "rate_limited");
    assert.equal(body.scope, "rate");
    assert.ok(body.retryAfterSec && body.retryAfterSec >= 1 && body.retryAfterSec <= 60);
    assert.equal(res.headers.get("Retry-After"), String(body.retryAfterSec));
    assert.equal(usage("u1"), 0, "a rate-limited request is not charged");
    // The limit is per user.
    assert.ok((await reserveQuota(env, { sub: "u2" })).ok);
    // Once the oldest in-window run ages out there is room again.
    db.execute("UPDATE lab_runs SET created_at = datetime('now', '-70 seconds') WHERE user_id = 'u1' AND created_at > datetime('now', '-10 seconds')");
    assert.ok((await reserveQuota(env, { sub: "u1" })).ok);
  });

  test("rate limit hits are recorded as flood abuse signals", async () => {
    const env = make({ RUN_PER_MINUTE_FREE: "1", RUN_MAX_CONCURRENT: "100" });
    seedRun("u1", "ok", 1);
    await deny(env, "u1");
    await deny(env, "u1");
    assert.equal(db.query<{ n: number }>("SELECT COUNT(*) AS n FROM abuse_signals WHERE user_id = 'u1' AND kind = 'flood'")[0].n, 2);
  });

  test("pro users get the higher per-minute limit", async () => {
    const env = make({ RUN_PER_MINUTE_FREE: "1", RUN_PER_MINUTE_PRO: "3", RUN_MAX_CONCURRENT: "100" });
    seedRun("u1", "ok", 1);
    seedRun("p1", "ok", 1);
    assert.equal((await deny(env, "u1")).body.scope, "rate");
    assert.ok((await reserveQuota(env, { sub: "p1" })).ok);
  });

  test("concurrency cap: scope concurrency until a run settles", async () => {
    const env = make({ RUN_PER_MINUTE_FREE: "100" });
    const a = await reserveOk(env, "u1");
    await reserveOk(env, "u1");
    const { res, body } = await deny(env, "u1");
    assert.equal(res.status, 429);
    assert.equal(body.error, "quota_exceeded");
    assert.equal(body.scope, "concurrency");
    assert.equal(usage("u1"), 2, "a rejected request is not charged");
    await settleQuota(env, a, "ok");
    assert.ok((await reserveQuota(env, { sub: "u1" })).ok);
  });

  test("the stale window covers the longest reserved job: the grading budget plus one runner call", () => {
    assert.equal(RUNNING_STALE_SECONDS, Math.ceil((GRADING_BUDGET_MS + runTimeoutBudgetMs(undefined)) / 1000));
    assert.equal(DEFAULT_BUDGET_MS, GRADING_BUDGET_MS, "challenge submissions use the same budget");
    assert.ok(RUNNING_STALE_SECONDS > 90, "longer than a single graded job may run");
    assert.ok(RUNNING_STALE_SECONDS <= 300, "a leaked reservation blocks a slot for minutes, not an hour");
  });

  test("a 'running' row younger than the stale window still counts (a long graded job is still in flight)", async () => {
    const env = make({ RUN_PER_MINUTE_FREE: "100", RUN_MAX_CONCURRENT: "1" });
    seedRun("u1", "running", 30);
    assert.equal((await deny(env, "u1")).body.scope, "concurrency");
    // Older than the old 60 s window: a graded lesson run or challenge submission can still be running.
    db.execute("UPDATE lab_runs SET created_at = datetime('now', ?) WHERE user_id = 'u1'", `-${RUNNING_STALE_SECONDS - 5} seconds`);
    assert.equal((await deny(env, "u1")).body.scope, "concurrency");
  });

  test("a stuck 'running' row expires after the stale window", async () => {
    const env = make({ RUN_PER_MINUTE_FREE: "100", RUN_MAX_CONCURRENT: "1" });
    seedRun("u1", "running", RUNNING_STALE_SECONDS + 5);
    assert.ok((await reserveQuota(env, { sub: "u1" })).ok);
  });

  test("a challenge submission never starts a test after the budget, so it fits the stale window", async () => {
    let clock = 0;
    const started: number[] = [];
    const tests = Array.from({ length: 10 }, (_, i) => ({ name: `t${i}`, stdin: "", expected: "x", mode: "trim" as const }));
    await gradeTests({ id: "g", kind: "output", tests }, "python", "print('x')", async (r) => {
      started.push(clock);
      clock += runTimeoutBudgetMs(r.limits); // every call uses its whole wait
      return okResult({ stdout: "x\n" });
    }, { now: () => clock });
    const last = started[started.length - 1];
    assert.ok(started.length < tests.length, "later tests were skipped");
    assert.ok(last <= GRADING_BUDGET_MS);
    assert.ok(last + runTimeoutBudgetMs(undefined) <= RUNNING_STALE_SECONDS * 1000);
    assert.ok(MAX_GRADED_TESTS * runTimeoutBudgetMs(undefined) > RUNNING_STALE_SECONDS * 1000, "without the budget a graded lab could outlive the window");
  });

  test("parallel requests cannot all slip under the concurrency cap", async () => {
    const env = make({ RUN_PER_MINUTE_FREE: "100", RUN_MAX_CONCURRENT: "2" });
    const results = await Promise.all(Array.from({ length: 6 }, () => reserveQuota(env, { sub: "u1" })));
    assert.equal(results.filter((r) => r.ok).length, 2);
    assert.equal(usage("u1"), 2);
  });

  test("check order: rate before concurrency before daily quota before global cap", async () => {
    // rate AND concurrency AND daily AND global exceeded -> rate wins
    const env = make({ RUN_PER_MINUTE_FREE: "2", RUN_MAX_CONCURRENT: "1", RUN_DAILY_LIMIT_FREE: "1", RUN_DAILY_LIMIT_GLOBAL: "1" });
    db.execute("INSERT INTO lab_usage (user_id, day, count) VALUES ('u1', ?, 5), ('_global', ?, 5)", today(), today());
    seedRun("u1", "running", 2);
    seedRun("u1", "ok", 3);
    assert.equal((await deny(env, "u1")).body.scope, "rate");
    // drop the rate pressure: concurrency wins over daily and global
    db.execute("UPDATE lab_runs SET status = 'running' WHERE user_id = 'u1'");
    const env2 = make({ RUN_PER_MINUTE_FREE: "50", RUN_MAX_CONCURRENT: "1", RUN_DAILY_LIMIT_FREE: "1", RUN_DAILY_LIMIT_GLOBAL: "1" });
    assert.equal((await deny(env2, "u1")).body.scope, "concurrency");
    // drop concurrency: daily user quota wins over global
    db.execute("DELETE FROM lab_runs WHERE user_id = 'u1'");
    assert.equal((await deny(env2, "u1")).body.scope, "user");
    // user quota fine, global exhausted
    db.execute("UPDATE lab_usage SET count = 0 WHERE user_id = 'u1'");
    assert.equal((await deny(env2, "u1")).body.scope, "global");
  });
});

describe("account status", () => {
  test("a suspended account gets 403 account_suspended before any counter is touched", async () => {
    addUser(db, { id: "bad", status: "suspended", suspendedUntil: null });
    const env = make({ RUN_DAILY_LIMIT_FREE: "1" });
    db.execute("INSERT INTO lab_usage (user_id, day, count) VALUES ('bad', ?, 99)", today());
    const { res, body } = await deny(env, "bad");
    assert.equal(res.status, 403);
    assert.equal(body.error, "account_suspended");
    assert.equal(usage("bad"), 99);
    assert.equal(usage("_global"), 0);
  });

  test("a suspension in the future still blocks; an expired one is lifted and audited", async () => {
    addUser(db, { id: "later", status: "suspended" });
    db.execute("UPDATE users SET suspended_until = datetime('now', '+2 hours') WHERE github_id = 'later'");
    assert.equal((await deny(make(), "later")).res.status, 403);

    addUser(db, { id: "done", status: "suspended" });
    db.execute("UPDATE users SET suspended_until = datetime('now', '-1 minutes') WHERE github_id = 'done'");
    assert.ok((await reserveQuota(make(), { sub: "done" })).ok);
    assert.deepEqual(db.query("SELECT status, suspended_until FROM users WHERE github_id = 'done'"), [{ status: "active", suspended_until: null }]);
    assert.equal(db.query<{ n: number }>("SELECT COUNT(*) AS n FROM audit_log WHERE user_id = 'done' AND action = 'abuse.suspension_expired'")[0].n, 1);
  });
});
