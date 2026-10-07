import { test } from "node:test";
import assert from "node:assert/strict";
import type { ChallengeStat } from "../../shared/api";
import { indexStats, solvedSet, solvesOf, withAttempt, withHint, withSolve } from "../../lib/ctf/stats";
import {
  addSolved,
  parseSolved,
  readSolvedRaw,
  solvedKey,
  syncSolved,
  writeSolved,
  type StorageLike,
} from "../../lib/ctf/solved-cache";
import { fixtureStats } from "../fixtures/challenges/api";

class MemStorage implements StorageLike {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
}
const throwing: StorageLike = {
  getItem() {
    throw new Error("blocked");
  },
  setItem() {
    throw new Error("blocked");
  },
};

const NOW = "2026-06-01T12:00:00.000Z";

test("indexStats and solvesOf", () => {
  const idx = indexStats(fixtureStats(false).stats);
  assert.equal(solvesOf(idx, "caesar-warmup"), 412);
  assert.equal(solvesOf(idx, "unknown"), 0);
  assert.equal(solvesOf(null, "caesar-warmup"), 0);
  assert.equal(indexStats(undefined).size, 0);
});

test("solvedSet: signed-out viewers have nothing solved", () => {
  const server = indexStats(fixtureStats(true).stats);
  assert.equal(solvedSet({ signedIn: false, serverStats: server, cache: new Set(["a"]) }).size, 0);
});

test("solvedSet: the local cache fills in until the server answers, then the server wins", () => {
  const cache = new Set(["stale-id", "caesar-warmup"]);
  assert.deepEqual([...solvedSet({ signedIn: true, serverStats: null, cache })].sort(), ["caesar-warmup", "stale-id"]);
  const server = indexStats(fixtureStats(true).stats);
  assert.deepEqual([...solvedSet({ signedIn: true, serverStats: server, cache })], ["caesar-warmup"]);
});

test("withSolve adds a solve, first blood and the learner's progress", () => {
  const base: ChallengeStat = { id: "x", solves: 0 };
  const out = withSolve(base, "x", { awarded: 100, firstBlood: true, alreadySolved: false }, NOW, { name: "Me", username: "me" });
  assert.equal(out.solves, 1);
  assert.deepEqual(out.firstBlood, { name: "Me", username: "me", at: NOW });
  assert.deepEqual(out.mine, { solved: true, points: 100, attempts: 1, solvedAt: NOW, hintsUsed: 0, minutesToSolve: undefined });
  assert.equal(base.solves, 0); // input untouched
});

test("withSolve keeps an existing first blood and hint count; already-solved is a no-op", () => {
  const stat: ChallengeStat = {
    id: "x",
    solves: 5,
    firstBlood: { name: "Other", at: "2026-01-01T00:00:00Z" },
    mine: { solved: false, points: 0, attempts: 2, hintsUsed: 1 },
  };
  const out = withSolve(stat, "x", { awarded: 40, firstBlood: false, alreadySolved: false }, NOW);
  assert.equal(out.solves, 6);
  assert.equal(out.firstBlood?.name, "Other");
  assert.equal(out.mine?.attempts, 3);
  assert.equal(out.mine?.hintsUsed, 1);
  assert.equal(withSolve(stat, "x", { awarded: 0, firstBlood: false, alreadySolved: true }, NOW), stat);
  assert.equal(withSolve(undefined, "y", { awarded: 0, firstBlood: false, alreadySolved: true }, NOW).solves, 0);
});

test("withSolve without a name does not invent a first blood", () => {
  const out = withSolve(undefined, "x", { awarded: 10, firstBlood: true, alreadySolved: false }, NOW);
  assert.equal(out.firstBlood, undefined);
});

test("withHint reveals in order and never lowers the count", () => {
  const a = withHint(undefined, "x", 1);
  assert.equal(a.mine?.hintsUsed, 2);
  assert.equal(withHint(a, "x", 0).mine?.hintsUsed, 2);
  assert.equal(withHint(a, "x", 2).mine?.hintsUsed, 3);
});

test("withAttempt counts wrong attempts and keeps the rest of the progress", () => {
  const out = withAttempt({ id: "x", solves: 3, mine: { solved: false, points: 0, attempts: 1, hintsUsed: 2 } }, "x");
  assert.equal(out.mine?.attempts, 2);
  assert.equal(out.mine?.hintsUsed, 2);
  assert.equal(withAttempt(undefined, "x").mine?.attempts, 1);
});

test("parseSolved is tolerant of corrupt values", () => {
  assert.deepEqual(parseSolved(null), []);
  assert.deepEqual(parseSolved(""), []);
  assert.deepEqual(parseSolved("{not json"), []);
  assert.deepEqual(parseSolved('{"a":1}'), []);
  assert.deepEqual(parseSolved('["ok-id","ok-id",5,null,"Bad Id","../x","a"]'), ["ok-id", "a"]);
});

test("solved cache read/write/add/sync round trip per user", () => {
  const s = new MemStorage();
  assert.equal(readSolvedRaw(s, "u1"), "");
  addSolved(s, "u1", "b");
  addSolved(s, "u1", "a");
  addSolved(s, "u1", "a");
  assert.deepEqual(parseSolved(readSolvedRaw(s, "u1")), ["a", "b"]);
  assert.deepEqual(parseSolved(readSolvedRaw(s, "u2")), []);
  syncSolved(s, "u1", ["c", "a"]);
  assert.deepEqual(parseSolved(readSolvedRaw(s, "u1")), ["a", "c"]);
  assert.equal(s.getItem(solvedKey("u1")), '["a","c"]');
  writeSolved(s, "u2", []);
  assert.equal(s.getItem(solvedKey("u2")), "[]");
});

test("solved cache never throws when storage is blocked or missing", () => {
  assert.doesNotThrow(() => addSolved(throwing, "u", "a"));
  assert.doesNotThrow(() => syncSolved(throwing, "u", ["a"]));
  assert.equal(readSolvedRaw(throwing, "u"), "");
  assert.equal(readSolvedRaw(null, "u"), "");
  assert.doesNotThrow(() => writeSolved(null, "u", ["a"]));
});
