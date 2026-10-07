// GET /api/leaderboard: ordering, ties, period and track filters, `me`, privacy, caps.
import { test } from "node:test";
import assert from "node:assert/strict";
import type { LeaderboardResponse } from "../../../shared/api";
import { makeWorld, seedSolve, T0, type World } from "./helpers/world";

const board = (w: World, qs = "", token?: string | null) => w.api<LeaderboardResponse & { error?: string }>(`/api/leaderboard${qs}`, { token });
const DAY = 86_400_000;
const sql = (ms: number) => new Date(ms).toISOString().slice(0, 19).replace("T", " ");

async function seeded() {
  const w = await makeWorld();
  await w.addUser({ sub: "a", username: "ann", name: "Ann", avatar: "https://img.test/ann.png" });
  await w.addUser({ sub: "b", username: "ben", name: "Ben" });
  await w.addUser({ sub: "c", username: "cat", name: null });
  await w.addUser({ sub: "d", username: "dan", name: "Dan" });
  // ann: 150 (flag-basic fb + flag-ci)   ben: 150 (earlier last solve)   cat: 100   dan: 40 (algorithms track)
  seedSolve(w.db, { challenge: "flag-basic", user: "a", points: 100, at: "2026-05-01 10:00:00", firstBlood: true });
  seedSolve(w.db, { challenge: "flag-ci", user: "a", points: 50, at: "2026-05-05 10:00:00" });
  seedSolve(w.db, { challenge: "flag-basic", user: "b", points: 100, at: "2026-05-02 10:00:00" });
  seedSolve(w.db, { challenge: "flag-ci", user: "b", points: 50, at: "2026-05-03 10:00:00" });
  seedSolve(w.db, { challenge: "flag-basic", user: "c", points: 100, at: "2026-05-04 10:00:00" });
  seedSolve(w.db, { challenge: "flag-algo", user: "d", points: 40, at: "2026-05-06 10:00:00" });
  return w;
}

test("ordering: points desc, ties go to the earlier last solve, ranks are 1..n", async () => {
  const w = await seeded();
  const r = await board(w);
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.entries.map((e) => [e.rank, e.username, e.points]), [[1, "ben", 150], [2, "ann", 150], [3, "cat", 100], [4, "dan", 40]]);
  assert.equal(r.body.track, "all");
  assert.equal(r.body.period, "all");
  assert.equal(r.body.me, undefined, "anonymous callers get no me entry");
  const ann = r.body.entries[1];
  assert.deepEqual([ann.solves, ann.firstBloods, ann.avatar, ann.lastSolveAt], [2, 1, "https://img.test/ann.png", "2026-05-05T10:00:00.000Z"]);
});

test("a user with no display name appears under the username, never an email", async () => {
  const w = await seeded();
  const r = await board(w);
  assert.equal(r.body.entries.find((e) => e.username === "cat")?.name, "cat");
  assert.ok(!JSON.stringify(r.body).includes("@private.example"));
});

test("track filter counts only that track's challenges; unknown tracks are 400", async () => {
  const w = await seeded();
  const algo = await board(w, "?track=data-structures-algorithms");
  assert.deepEqual(algo.body.entries.map((e) => [e.username, e.points]), [["dan", 40]]);
  assert.equal(algo.body.track, "data-structures-algorithms");
  const cyber = await board(w, "?track=cyber-security");
  assert.deepEqual(cyber.body.entries.map((e) => e.username), ["ben", "ann", "cat"]);
  assert.equal((await board(w, "?track=nope")).status, 400);
  assert.equal((await board(w, "?track=all")).body.entries.length, 4);
  assert.equal((await board(w, "?track=%27%3B%20DROP%20TABLE%20users")).status, 400);
  assert.equal((await board(w, "?track=empty-track")).body.entries.length, 0, "a valid track with no solves is an empty board");
});

test("period=week counts only solves from the last 7 days", async () => {
  const w = await makeWorld();
  await w.addUser({ sub: "a", username: "ann" });
  await w.addUser({ sub: "b", username: "ben" });
  seedSolve(w.db, { challenge: "flag-basic", user: "a", points: 100, at: sql(T0 - 8 * DAY) });
  seedSolve(w.db, { challenge: "flag-ci", user: "a", points: 50, at: sql(T0 - 2 * DAY) });
  seedSolve(w.db, { challenge: "flag-basic", user: "b", points: 100, at: sql(T0 - 6 * DAY) });
  const all = await board(w);
  assert.deepEqual(all.body.entries.map((e) => [e.username, e.points]), [["ann", 150], ["ben", 100]]);
  const week = await board(w, "?period=week");
  assert.equal(week.body.period, "week");
  assert.deepEqual(week.body.entries.map((e) => [e.username, e.points]), [["ben", 100], ["ann", 50]]);
  assert.equal((await board(w, "?period=month")).status, 400);
});

test("me entry: present for an authenticated caller with their rank; absent for a caller with no solves", async () => {
  const w = await seeded();
  const t = await w.token("c");
  const r = await board(w, "", t);
  assert.deepEqual([r.body.me?.rank, r.body.me?.points, r.body.me?.username], [3, 100, "cat"]);
  assert.match(r.res.headers.get("Cache-Control") ?? "", /no-store/);
  await w.addUser({ sub: "e", username: "eve" });
  const none = await board(w, "", await w.token("e"));
  assert.equal(none.body.me, undefined);
  assert.equal(none.body.entries.length, 4);
  const stale = await board(w, "", "bad.token.x");
  assert.equal(stale.status, 200, "an invalid token is treated as anonymous");
  assert.equal(stale.body.me, undefined);
  assert.match((await board(w)).res.headers.get("Cache-Control") ?? "", /max-age=30/);
});

test("me.rank is the true rank even beyond the 100-entry cap; the list is capped at 100", async () => {
  const w = await makeWorld();
  for (let i = 0; i < 120; i++) {
    const sub = `u${String(i).padStart(3, "0")}`;
    await w.addUser({ sub, username: sub });
    seedSolve(w.db, { challenge: "flag-basic", user: sub, points: 1000 - i, at: "2026-05-01 10:00:00" });
  }
  const r = await board(w, "", await w.token("u110"));
  assert.equal(r.body.entries.length, 100);
  assert.equal(r.body.entries[99].rank, 100);
  assert.equal(r.body.me?.rank, 111);
  assert.equal(r.body.me?.points, 890);
});

test("solves of unplayable challenges (no grader, unknown id) and of deleted accounts are ignored", async () => {
  const w = await seeded();
  seedSolve(w.db, { challenge: "no-grader", user: "d", points: 5000, at: "2026-05-07 10:00:00" });
  seedSolve(w.db, { challenge: "retired-challenge", user: "d", points: 5000, at: "2026-05-07 10:00:00" });
  seedSolve(w.db, { challenge: "flag-basic", user: "ghost", points: 9999, at: "2026-05-07 10:00:00" });
  const r = await board(w);
  assert.deepEqual(r.body.entries.map((e) => [e.username, e.points]), [["ben", 150], ["ann", 150], ["cat", 100], ["dan", 40]]);
});

test("solving through the API moves the board and the caller's rank", async () => {
  const w = await seeded();
  await w.addUser({ sub: "z", username: "zed", name: "Zed" });
  const t = await w.token("z");
  const sub = (id: string, flag: string) => w.api(`/api/challenges/${id}/submit`, { method: "POST", token: t, body: { flag } });
  await sub("flag-basic", "IMB{hello_world}");
  await sub("flag-ci", "imb{caseflag}");
  const r = await board(w, "", t);
  assert.equal(r.body.me?.points, 150);
  assert.equal(r.body.me?.rank, 3, "ties with ann and ben but solved later");
});

test("wrong method is 405", async () => {
  const w = await seeded();
  assert.equal((await w.api("/api/leaderboard", { method: "POST", body: {} })).status, 405);
});
