// open / hint / awarding / first blood / idempotent re-solve / GET /api/challenges.
import { test } from "node:test";
import assert from "node:assert/strict";
import type { ChallengesApiResponse, SubmitResponse } from "../../../shared/api";
import type { ChallengeHintResponse, ChallengeOpenResponse } from "../../../shared/challenges";
import { FLAG, makeWorld, seedSolve, type World } from "./helpers/world";

const flag = (w: World, id: string, token: string | null, value: string = FLAG) => w.api<SubmitResponse>(`/api/challenges/${id}/submit`, { method: "POST", token, body: { flag: value } });
const hint = (w: World, id: string, token: string | null, index: unknown) => w.api<ChallengeHintResponse & { error?: string }>(`/api/challenges/${id}/hint`, { method: "POST", token, body: { index } });
const MIN = 60_000;

async function twoUsers() {
  const w = await makeWorld();
  await w.addUser({ sub: "u1", username: "alice", name: "Alice A" });
  await w.addUser({ sub: "u2", username: "bob", name: "Bob B" });
  return { w, t1: await w.token("u1"), t2: await w.token("u2") };
}

test("open: stamps first_opened_at once and later opens never move it", async () => {
  const { w, t1 } = await twoUsers();
  const first = await w.api<ChallengeOpenResponse>("/api/challenges/flag-basic/open", { method: "POST", token: t1 });
  assert.equal(first.status, 200);
  assert.equal(first.body.ok, true);
  assert.equal(first.body.openedAt, new Date(w.clock.now).toISOString());
  w.clock.now += 10 * MIN;
  const again = await w.api<ChallengeOpenResponse>("/api/challenges/flag-basic/open", { method: "POST", token: t1 });
  assert.equal(again.body.openedAt, first.body.openedAt);
  assert.equal(w.db.rows("SELECT * FROM challenge_progress").length, 1);
  assert.equal((await w.api("/api/challenges/flag-basic/open", { method: "POST", token: null })).status, 401);
});

test("hint: reveals once, returns en+ar text, records the mask, is idempotent and charged once", async () => {
  const { w, t1 } = await twoUsers();
  const h0 = await hint(w, "flag-basic", t1, 0);
  assert.equal(h0.status, 200);
  assert.deepEqual(h0.body.text, { en: "hint zero", ar: "hint zero (ar)" });
  assert.equal(h0.body.cost, 20);
  assert.deepEqual(h0.body.revealed, [0]);
  assert.equal(h0.body.potentialPoints, 80);
  const again = await hint(w, "flag-basic", t1, 0);
  assert.deepEqual(again.body, h0.body, "revealing again changes nothing");
  const h2 = await hint(w, "flag-basic", t1, 2);
  assert.deepEqual(h2.body.revealed, [0, 2]);
  assert.equal(h2.body.hintsUsed, 2);
  assert.equal(h2.body.potentialPoints, 0, "never below zero: 100 - 20 - 90");
  const row = w.db.one<{ hint_mask: number; hints_used: number }>("SELECT hint_mask, hints_used FROM challenge_progress WHERE user_id = 'u1'");
  assert.deepEqual({ ...row }, { hint_mask: 0b101, hints_used: 2 });
});

test("hint: validation (index, auth, hint-less challenges) and no cross-learner effect", async () => {
  const { w, t1, t2 } = await twoUsers();
  for (const bad of [-1, 3, 1.5, "0", null, undefined]) assert.equal((await hint(w, "flag-basic", t1, bad)).status, 400, String(bad));
  assert.equal((await hint(w, "flag-basic", null, 0)).status, 401);
  assert.equal((await hint(w, "flag-ci", t1, 0)).status, 400, "a challenge without hints has no valid index");
  assert.equal((await w.api("/api/challenges/flag-basic/hint", { method: "POST", token: t1, rawBody: "nope" })).status, 400);
  await hint(w, "flag-basic", t1, 1);
  const other = await hint(w, "flag-basic", t2, 0);
  assert.deepEqual(other.body.revealed, [0], "u2's reveals are independent of u1's");
  assert.equal(other.body.potentialPoints, 80);
});

test("points = base - Σ revealed hint costs, per learner", async () => {
  const { w, t1, t2 } = await twoUsers();
  await hint(w, "flag-basic", t1, 0);
  await hint(w, "flag-basic", t1, 1);
  await hint(w, "flag-basic", t1, 1);
  const a = await flag(w, "flag-basic", t1);
  assert.equal(a.body.awarded, 50);
  const b = await flag(w, "flag-basic", t2);
  assert.equal(b.body.awarded, 100, "u2 revealed nothing");
  assert.equal(w.db.one<{ points: number }>("SELECT points FROM challenge_solves WHERE user_id = 'u1'")?.points, 50);
  assert.equal(w.db.one<{ points: number }>("SELECT points FROM challenge_progress WHERE user_id = 'u1' AND challenge_id = 'flag-basic'")?.points, 50);
});

test("hints revealed after solving are free and change nothing", async () => {
  const { w, t1 } = await twoUsers();
  await flag(w, "flag-basic", t1);
  const h = await hint(w, "flag-basic", t1, 2);
  assert.equal(h.status, 200);
  assert.equal(h.body.text.en, "hint two");
  assert.equal(w.db.one<{ points: number }>("SELECT points FROM challenge_solves WHERE user_id = 'u1'")?.points, 100);
  assert.equal(w.db.one<{ hint_mask: number }>("SELECT hint_mask FROM challenge_progress WHERE user_id = 'u1'")?.hint_mask, 0);
});

test("concurrent reveals of different hints keep both bits (no lost update)", async () => {
  const { w, t1 } = await twoUsers();
  await Promise.all([hint(w, "flag-basic", t1, 0), hint(w, "flag-basic", t1, 1), hint(w, "flag-basic", t1, 2)]);
  assert.equal(w.db.one<{ hint_mask: number }>("SELECT hint_mask FROM challenge_progress")?.hint_mask, 0b111);
});

test("minutes_to_solve is measured from the first open; never-opened solves store NULL", async () => {
  const { w, t1, t2 } = await twoUsers();
  await w.api("/api/challenges/flag-basic/open", { method: "POST", token: t1 });
  w.clock.now += 12.5 * MIN;
  await flag(w, "flag-basic", t1);
  await flag(w, "flag-basic", t2);
  assert.equal(w.db.one<{ m: number }>("SELECT minutes_to_solve AS m FROM challenge_solves WHERE user_id = 'u1'")?.m, 12.5);
  assert.equal(w.db.one<{ m: number | null }>("SELECT minutes_to_solve AS m FROM challenge_solves WHERE user_id = 'u2'")?.m, null);
});

test("idempotent re-solve: awards 0, alreadySolved, keeps the original solve", async () => {
  const { w, t1 } = await twoUsers();
  const first = await flag(w, "flag-basic", t1);
  assert.equal(first.body.awarded, 100);
  w.clock.now += 5 * MIN;
  const second = await flag(w, "flag-basic", t1);
  assert.deepEqual({ ...second.body }, { correct: true, awarded: 0, alreadySolved: true, firstBlood: false });
  assert.equal(w.db.rows("SELECT * FROM challenge_solves").length, 1);
  assert.equal(w.db.one<{ fb: number }>("SELECT first_blood AS fb FROM challenge_solves")?.fb, 1, "the original first blood is untouched");
  const wrong = await flag(w, "flag-basic", t1, "nope");
  assert.equal(wrong.body.alreadySolved, true);
});

test("first blood: the first solver gets it, the second does not", async () => {
  const { w, t1, t2 } = await twoUsers();
  const a = await flag(w, "flag-basic", t1);
  const b = await flag(w, "flag-basic", t2);
  assert.equal(a.body.firstBlood, true);
  assert.equal(b.body.firstBlood, false);
  assert.equal(b.body.awarded, 100, "late solvers still earn the full points");
  assert.deepEqual(w.db.rows<{ user_id: string }>("SELECT user_id FROM challenge_solves WHERE first_blood = 1").map((r) => r.user_id), ["u1"]);
});

test("first blood is atomic: two users solving concurrently yield exactly one first_blood row", async () => {
  for (let round = 0; round < 10; round++) {
    const w = await makeWorld();
    await w.addUser({ sub: "u1" });
    await w.addUser({ sub: "u2" });
    await w.addUser({ sub: "u3" });
    const tokens = await Promise.all(["u1", "u2", "u3"].map((s) => w.token(s)));
    const res = await Promise.all(tokens.map((t) => flag(w, "flag-basic", t)));
    assert.equal(res.filter((r) => r.body.firstBlood).length, 1, `round ${round}`);
    assert.ok(res.every((r) => r.body.correct && r.body.awarded === 100 && !r.body.alreadySolved));
    assert.equal(w.db.rows("SELECT * FROM challenge_solves WHERE first_blood = 1").length, 1);
    assert.equal(w.db.rows("SELECT * FROM challenge_solves").length, 3);
  }
});

test("the same learner submitting the correct flag concurrently is booked once", async () => {
  const { w, t1 } = await twoUsers();
  const res = await Promise.all([flag(w, "flag-basic", t1), flag(w, "flag-basic", t1), flag(w, "flag-basic", t1)]);
  assert.equal(res.filter((r) => r.body.awarded > 0).length, 1);
  assert.equal(res.filter((r) => r.body.firstBlood).length, 1);
  assert.equal(w.db.rows("SELECT * FROM challenge_solves").length, 1);
});

test("code challenges award points and first blood through the same path", async () => {
  const { w, t1, t2 } = await twoUsers();
  const sub = (t: string) => w.api<SubmitResponse>("/api/challenges/out-sum/submit", { method: "POST", token: t, body: { lang: "python", code: "# #SUM" } });
  const a = await sub(t1);
  const b = await sub(t2);
  assert.deepEqual([a.body.awarded, a.body.firstBlood, b.body.awarded, b.body.firstBlood], [60, true, 60, false]);
  const again = await sub(t1);
  assert.deepEqual([again.body.correct, again.body.awarded, again.body.alreadySolved], [true, 0, true]);
});

// ── GET /api/challenges ──────────────────────────────────────────────────────

const list = (w: World, token?: string | null) => w.api<ChallengesApiResponse>("/api/challenges", { token });
const statOf = (r: ChallengesApiResponse, id: string) => r.stats.find((s) => s.id === id);

test("list: anonymous callers get public stats for every public challenge, with no 401 and no `mine`/`me`", async () => {
  const { w } = await twoUsers();
  const r = await list(w);
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.stats.map((s) => s.id), ["flag-basic", "flag-ci", "flag-algo", "out-sum", "out-hidden", "code-double", "no-grader"]);
  assert.equal(r.body.me, undefined);
  assert.ok(r.body.stats.every((s) => s.solves === 0 && s.mine === undefined));
  assert.match(r.res.headers.get("Cache-Control") ?? "", /max-age/);
});

test("list: an invalid or stale token behaves like an anonymous caller (never 401)", async () => {
  const { w } = await twoUsers();
  const bad = await list(w, "garbage.token.value");
  assert.equal(bad.status, 200);
  assert.equal(bad.body.me, undefined);
  const ghost = await list(w, await w.token("ghost"));
  assert.equal(ghost.status, 200);
});

test("list: solves, first blood (name + username + time), median only from 3 solves, mine and me", async () => {
  const { w, t1 } = await twoUsers();
  await w.addUser({ sub: "u3", username: "carol", name: null });
  seedSolve(w.db, { challenge: "flag-basic", user: "u2", points: 100, at: "2026-05-01 10:00:00", firstBlood: true, minutes: 30 });
  seedSolve(w.db, { challenge: "flag-basic", user: "u3", points: 100, at: "2026-05-02 10:00:00", minutes: 10 });
  seedSolve(w.db, { challenge: "flag-ci", user: "u2", points: 50, at: "2026-05-03 10:00:00", firstBlood: true, minutes: 5 });
  seedSolve(w.db, { challenge: "flag-ci", user: "u3", points: 50, at: "2026-05-03 11:00:00", minutes: 7 });

  let r = await list(w, t1);
  let s = statOf(r.body, "flag-basic");
  assert.equal(s?.solves, 2);
  assert.equal(s?.medianSolveMinutes, undefined, "two solves are not enough for a median");
  assert.deepEqual(s?.firstBlood, { name: "Bob B", username: "bob", at: "2026-05-01T10:00:00.000Z" });

  // third solve by u1 through the API, 20 minutes after opening
  await w.api("/api/challenges/flag-basic/open", { method: "POST", token: t1 });
  w.clock.now += 20 * MIN;
  const solved = await flag(w, "flag-basic", t1);
  assert.equal(solved.body.firstBlood, false);

  r = await list(w, t1);
  s = statOf(r.body, "flag-basic");
  assert.equal(s?.solves, 3);
  assert.equal(s?.medianSolveMinutes, 20, "median of 10, 20, 30");
  assert.deepEqual({ ...s?.mine }, { solved: true, points: 100, attempts: 1, hintsUsed: 0, hintMask: 0, solvedAt: new Date(w.clock.now).toISOString(), minutesToSolve: 20 });
  assert.equal(statOf(r.body, "flag-ci")?.firstBlood?.name, "Bob B");
  assert.equal(r.body.me?.points, 100);
  assert.equal(r.body.me?.solved, 1);
  assert.equal(r.body.me?.rank, 3, "u2 has 150, u3 has 150 (earlier), u1 has 100");
  assert.match(r.res.headers.get("Cache-Control") ?? "", /no-store/);
  // a user whose display name is empty falls back to the username
  const carol = await list(w, null);
  assert.equal(statOf(carol.body, "flag-ci")?.firstBlood?.name, "Bob B");
});

test("list: a learner who has not started anything gets me = zeros and no mine rows", async () => {
  const { w, t2 } = await twoUsers();
  const r = await list(w, t2);
  assert.deepEqual(r.body.me, { points: 0, solved: 0 });
  assert.ok(r.body.stats.every((s) => s.mine === undefined));
});

test("list: opened-but-unsolved progress shows attempts and revealed hints", async () => {
  const { w, t1 } = await twoUsers();
  await hint(w, "flag-basic", t1, 1);
  await flag(w, "flag-basic", t1, "wrong");
  const mine = statOf((await list(w, t1)).body, "flag-basic")?.mine;
  assert.equal(mine?.solved, false);
  assert.equal(mine?.attempts, 1);
  assert.equal(mine?.hintsUsed, 1);
  assert.equal(mine?.hintMask, 2);
});

test("emails never appear in any challenge response", async () => {
  const { w, t1 } = await twoUsers();
  await flag(w, "flag-basic", t1);
  const wire = JSON.stringify([(await list(w, t1)).body, (await w.api("/api/leaderboard", { token: t1 })).body]);
  assert.ok(!wire.includes("@private.example"));
});
