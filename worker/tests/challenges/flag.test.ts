import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeFlag, hashFlag, timingSafeEqual } from "../../src/graders/engine";
import { FLAG, FLAG_CI, makeWorld, T0 } from "./helpers/world";

interface SubmitBody { correct: boolean; awarded: number; alreadySolved: boolean; firstBlood: boolean; error?: string; scope?: string; retryAfterSec?: number }

async function setup() {
  const w = await makeWorld();
  await w.addUser({ sub: "u1" });
  return { w, token: await w.token("u1") };
}
const submit = (w: Awaited<ReturnType<typeof makeWorld>>, id: string, token: string | null, flag: unknown) =>
  w.api<SubmitBody>(`/api/challenges/${id}/submit`, { method: "POST", token, body: { flag } });

test("gradeFlag: exact, trimmed, case-sensitive by default", async () => {
  const g = { id: "x", kind: "flag" as const, flagHash: await hashFlag(FLAG) };
  assert.equal(await gradeFlag(g, FLAG), true);
  assert.equal(await gradeFlag(g, `  ${FLAG}\n`), true);
  assert.equal(await gradeFlag(g, FLAG.toLowerCase()), false);
  assert.equal(await gradeFlag(g, `${FLAG} `.replace("}", "")), false);
  assert.equal(await gradeFlag(g, ""), false);
});

test("gradeFlag: caseInsensitive hashes the lower-cased flag", async () => {
  const g = { id: "x", kind: "flag" as const, flagHash: await hashFlag(FLAG_CI, true), caseInsensitive: true };
  assert.equal(await gradeFlag(g, FLAG_CI), true);
  assert.equal(await gradeFlag(g, FLAG_CI.toUpperCase()), true);
  assert.equal(await gradeFlag(g, FLAG_CI.toLowerCase()), true);
  assert.equal(await gradeFlag(g, "IMB{other}"), false);
});

test("gradeFlag fails closed on a malformed flagHash", async () => {
  assert.equal(await gradeFlag({ id: "x", kind: "flag", flagHash: "" }, ""), false);
  assert.equal(await gradeFlag({ id: "x", kind: "flag", flagHash: "zz" }, "zz"), false);
  assert.equal(await gradeFlag({ id: "x", kind: "flag", flagHash: "A".repeat(64) }, "anything"), false);
});

test("timingSafeEqual", () => {
  assert.equal(timingSafeEqual("abc", "abc"), true);
  assert.equal(timingSafeEqual("abc", "abd"), false);
  assert.equal(timingSafeEqual("abc", "abcd"), false);
});

test("submit: a correct flag awards the full points once; trimming and case mode apply", async () => {
  const { w, token } = await setup();
  const ok = await submit(w, "flag-basic", token, `  ${FLAG}  `);
  assert.equal(ok.status, 200);
  assert.deepEqual({ ...ok.body }, { correct: true, awarded: 100, alreadySolved: false, firstBlood: true });

  const ci = await submit(w, "flag-ci", token, FLAG_CI.toUpperCase());
  assert.equal(ci.body.correct, true);
  assert.equal(ci.body.awarded, 50);
});

test("submit: a wrong flag is just incorrect, with no hint about closeness", async () => {
  const { w, token } = await setup();
  const near = await submit(w, "flag-basic", token, "IMB{hello_worl}");
  const far = await submit(w, "flag-basic", token, "nothing");
  assert.equal(near.status, 200);
  assert.deepEqual(near.body, far.body, "near and far misses must be indistinguishable");
  assert.deepEqual({ ...near.body }, { correct: false, awarded: 0, alreadySolved: false, firstBlood: false });
});

test("submitted flags are never stored or logged", async () => {
  const { w, token } = await setup();
  const logged: string[] = [];
  const orig = console.error;
  console.error = (...a: unknown[]) => void logged.push(a.join(" "));
  try {
    await submit(w, "flag-basic", token, "IMB{secret_wrong_guess}");
    await submit(w, "flag-basic", token, FLAG);
  } finally {
    console.error = orig;
  }
  const dump = JSON.stringify([w.db.rows("SELECT * FROM challenge_attempts"), w.db.rows("SELECT * FROM challenge_progress"), w.db.rows("SELECT * FROM challenge_solves"), w.db.rows("SELECT * FROM abuse_signals"), logged, w.log.signals]);
  assert.ok(!dump.includes("secret_wrong_guess"));
  assert.ok(!dump.includes("hello_world"));
});

test("submit validation: missing/oversized flag, bad json, oversized body", async () => {
  const { w, token } = await setup();
  assert.equal((await submit(w, "flag-basic", token, undefined)).status, 400);
  assert.equal((await submit(w, "flag-basic", token, 42)).status, 400);
  assert.equal((await submit(w, "flag-basic", token, "   ")).status, 400);
  assert.equal((await submit(w, "flag-basic", token, "x".repeat(257))).status, 400);
  assert.equal((await w.api("/api/challenges/flag-basic/submit", { method: "POST", token, rawBody: "not json" })).status, 400);
  assert.equal((await w.api("/api/challenges/flag-basic/submit", { method: "POST", token, rawBody: "[]" })).status, 400);
  const big = await w.api<{ error: string }>("/api/challenges/flag-basic/submit", { method: "POST", token, body: { flag: "x".repeat(300 * 1024) } });
  assert.equal(big.status, 400);
  assert.equal(big.body.error, "invalid_request");
  assert.equal(w.db.rows("SELECT * FROM challenge_attempts").length, 0, "invalid requests are not attempts");
});

test("auth: 401 without a token, before any D1 work; stale accounts are refused", async () => {
  const { w } = await setup();
  const none = await submit(w, "flag-basic", null, FLAG);
  assert.equal(none.status, 401);
  assert.equal(none.body.error, "unauthorized");
  const ghost = await submit(w, "flag-basic", await w.token("ghost-account"), FLAG);
  assert.equal(ghost.status, 401, "a valid token of a deleted account must not create rows");
  assert.equal(w.db.rows("SELECT * FROM challenge_solves").length, 0);
});

test("unknown, grader-less, meta-less and kind-mismatched challenge ids are 404 on open/hint/submit", async () => {
  const { w, token } = await setup();
  for (const id of ["does-not-exist", "no-grader", "grader-only", "UPPER", "a".repeat(80)]) {
    for (const action of ["open", "hint", "submit"]) {
      const r = await w.api<{ error: string }>(`/api/challenges/${id}/${action}`, { method: "POST", token, body: { index: 0, flag: "x" } });
      assert.equal(r.status, 404, `${action} ${id}`);
      assert.equal(r.body.error, "not_found");
    }
  }
});

test("wrong HTTP method is 405, unknown paths fall through", async () => {
  const { w, token } = await setup();
  assert.equal((await w.api("/api/challenges/flag-basic/submit", { method: "GET", token })).status, 405);
  assert.equal((await w.api("/api/challenges", { method: "POST", token, body: {} })).status, 405);
});

test("brute force: the 6th wrong guess in a minute is refused with 429, an abuse signal, and is not graded", async () => {
  const { w, token } = await setup();
  for (let i = 0; i < 5; i++) {
    const r = await submit(w, "flag-basic", token, `wrong-${i}`);
    assert.equal(r.status, 200);
    w.clock.now += 1000;
  }
  const blocked = await submit(w, "flag-basic", token, FLAG); // even the RIGHT flag is refused while throttled
  assert.equal(blocked.status, 429);
  assert.equal(blocked.body.error, "rate_limited");
  assert.equal(blocked.body.scope, "rate");
  assert.ok((blocked.body.retryAfterSec ?? 0) >= 1 && (blocked.body.retryAfterSec ?? 0) <= 60);
  assert.equal(blocked.res.headers.get("Retry-After"), String(blocked.body.retryAfterSec));
  assert.equal(w.log.signals.length, 1);
  assert.equal(w.log.signals[0].kind, "bruteforce");
  assert.equal(w.log.signals[0].userId, "u1");
  assert.equal(w.db.rows("SELECT * FROM challenge_solves").length, 0);

  // another challenge is not throttled by this one's per-challenge limit
  assert.equal((await submit(w, "flag-ci", token, "wrong")).status, 200);

  // after the window passes the learner may try again
  w.clock.now += 3 * 60_000;
  const later = await submit(w, "flag-basic", token, FLAG);
  assert.equal(later.status, 200);
  assert.equal(later.body.correct, true);
});

test("brute force: 30 wrong guesses per hour per challenge", async () => {
  const { w, token } = await setup();
  let lastStatus = 0;
  let accepted = 0;
  for (let i = 0; i < 40; i++) {
    const r = await submit(w, "flag-basic", token, `guess-${i}`);
    lastStatus = r.status;
    if (r.status === 200) accepted++;
    w.clock.now += 20_000; // 3/min stays under the per-minute limit
  }
  assert.equal(accepted, 30);
  assert.equal(lastStatus, 429);
  assert.ok(w.log.signals.length >= 1);
});

test("brute force: concurrent guesses cannot slip past the limit", async () => {
  const { w, token } = await setup();
  const results = await Promise.all(Array.from({ length: 12 }, (_, i) => submit(w, "flag-basic", token, `race-${i}`)));
  const ok = results.filter((r) => r.status === 200).length;
  const blocked = results.filter((r) => r.status === 429).length;
  // Each guess is logged BEFORE the limit is evaluated, so a burst may be refused more eagerly
  // than strictly necessary but can never be graded beyond the limit.
  assert.ok(ok <= 5, `${ok} guesses were graded`);
  assert.equal(ok + blocked, 12);
  assert.ok(blocked >= 7);
});

test("a suspended account cannot submit flags", async () => {
  const w = await makeWorld();
  await w.addUser({ sub: "bad", status: "suspended" });
  const r = await submit(w, "flag-basic", await w.token("bad"), FLAG);
  assert.equal(r.status, 403);
  assert.equal(r.body.error, "account_suspended");
  assert.equal(w.db.rows("SELECT * FROM challenge_attempts").length, 0);
});

test("attempts are counted for the learner and the correct one is marked", async () => {
  const { w, token } = await setup();
  await submit(w, "flag-basic", token, "no");
  await submit(w, "flag-basic", token, "no2");
  await submit(w, "flag-basic", token, FLAG);
  const p = w.db.one<{ attempts: number; solved_at: string | null; points: number }>("SELECT attempts, solved_at, points FROM challenge_progress WHERE user_id = 'u1' AND challenge_id = 'flag-basic'");
  assert.equal(p?.attempts, 3);
  assert.ok(p?.solved_at);
  assert.equal(p?.points, 100);
  const rows = w.db.rows<{ correct: number }>("SELECT correct FROM challenge_attempts ORDER BY id");
  assert.deepEqual(rows.map((r) => r.correct), [0, 0, 1]);
  void T0;
});
