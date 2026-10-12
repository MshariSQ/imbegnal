// The lab XP rule (lib/lab-progress.ts, lib/xp.ts): lab XP never goes into the synced study state, so no
// pull, max-merge or push can lose it or count it twice. Guests: totalXp(study) + their awards in this
// browser. Signed in: totalXp(study) + the Worker's lab XP for that user; a pass without it is unverified.
import { test } from "node:test";
import assert from "node:assert/strict";
import { LAB_XP, XP } from "../../shared/xp";
import { getStudyState, setStudyState, totalXp, type StudyState } from "../../lib/study-store";
import { getGuestLabXp, isLabUnverified, labGrader, markLabPassed, mergeLabProgress, serverLabXpOf } from "../../lib/lab-progress";
import { currentXp } from "../../lib/xp";
import { startSync } from "../../lib/sync";

class MemoryStorage {
  private m = new Map<string, string>();
  get length() {
    return this.m.size;
  }
  key(i: number) {
    return [...this.m.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, String(v));
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
}
const storage = new MemoryStorage();
Object.assign(globalThis, { localStorage: storage, window: { addEventListener() {}, removeEventListener() {} } });

const bonusOf = (key: string) => getStudyState().lessons[key]?.bonus ?? 0;
const guestPass = (ref: string) => markLabPassed(ref, labGrader({ user: null, gradeSource: "browser" }));
const serverPass = (ref: string, user: string, xpAwarded: number = LAB_XP) => markLabPassed(ref, labGrader({ user, gradeSource: "server", xpAwarded }));
const emptyState = (): StudyState => ({ v: 1, lessons: {}, notes: {}, days: [], updated: 1 });

// First in this file, so the stores start from exactly what the old client left in localStorage.
test("a pass recorded by the client before this change keeps its XP in the bonus: earned for everyone, never a guest award again", () => {
  // origin/main's client: the pass list and the bonus it added XP.exercise to, nothing else.
  storage.setItem("imb-labs-v1", JSON.stringify({ "old/l1/a": 1_700_000_000_000 }));
  storage.setItem("imb-study-v1", JSON.stringify({ v: 1, lessons: { "old/l1": { done: 1_700_000_000_000, bonus: XP.exercise + XP.quiz } }, notes: {}, days: [], updated: 1_700_000_000_000 }));
  const total = XP.lesson + XP.exercise + XP.quiz;
  assert.equal(currentXp(null), total);
  assert.equal(currentXp("u1"), total);
  assert.equal(guestPass("old/l1/a"), 0, "a guest passing it again earns nothing more");
  assert.equal(getGuestLabXp(), 0);
  assert.equal(isLabUnverified("old/l1/a", null), false, "You earned 15 XP: it is in the bonus");
  assert.equal(isLabUnverified("old/l1/a", "u1"), false);
  assert.equal(bonusOf("old/l1"), XP.exercise + XP.quiz, "nothing is taken out of the bonus");
  setStudyState(emptyState());
});

test("guests: the total includes their local lab awards; signed in, it does not; signing out returns to the guest rule", () => {
  setStudyState({ ...emptyState(), lessons: { "g/l1": { done: 1_760_000_000_000, bonus: XP.quiz } } });
  const study = totalXp(getStudyState());
  assert.equal(guestPass("g/l1/a"), LAB_XP);
  assert.equal(guestPass("g/l2/b"), LAB_XP);
  assert.equal(totalXp(getStudyState()), study, "no study-state XP");
  assert.equal(currentXp(null), study + 2 * LAB_XP, "guest");
  assert.equal(currentXp("u1"), study, "signed in: local awards never count");
  assert.ok(isLabUnverified("g/l1/a", "u1"), "a guest's pass is an unverified pass of whoever signs in");
  assert.equal(currentXp(null), study + 2 * LAB_XP, "signed out again: the guest rule");
  setStudyState(emptyState());
});

test("guest pass, sign in, the Worker awards the same exercise: 15 shown, not 30", () => {
  const before = currentXp("u2");
  assert.equal(guestPass("s/l1/a"), LAB_XP);
  assert.equal(currentXp("u2"), before, "signed in as u2: not counted, unverified");
  assert.ok(isLabUnverified("s/l1/a", "u2"));
  assert.equal(serverPass("s/l1/a", "u2"), LAB_XP, "the banner shows the Worker's award");
  assert.equal(currentXp("u2"), before + LAB_XP, "15, once");
  assert.equal(isLabUnverified("s/l1/a", "u2"), false);
  assert.equal(serverPass("s/l1/a", "u2", 0), 0, "already awarded");
  assert.equal(currentXp("u2"), before + LAB_XP);
});

test("a Worker too old to report xpAwarded grants a signed-in learner no XP: the pass is unverified", () => {
  const before = currentXp("u3");
  const guest = getGuestLabXp();
  const grader = labGrader({ user: "u3", gradeSource: "server" });
  assert.equal(markLabPassed("o/l1/a", grader), 0);
  assert.equal(currentXp("u3"), before);
  assert.equal(getGuestLabXp(), guest, "no local award either");
  assert.equal(bonusOf("o/l1"), 0);
  assert.ok(isLabUnverified("o/l1/a", "u3"));
});

test("a pass the Worker graded but did not record (recorded: false) earns no XP and stays unverified", () => {
  const before = currentXp("u3");
  // What the Worker answers (shared/api.ts: no xpAwarded with recorded: false), and the same with an xpAwarded 0.
  for (const xpAwarded of [undefined, 0]) {
    const grader = labGrader({ user: "u3", gradeSource: "server", xpAwarded, recorded: false });
    assert.deepEqual(grader, { by: "unverified", user: "u3" });
    assert.equal(markLabPassed("r/l1/a", grader), 0);
    assert.equal(currentXp("u3"), before);
    assert.ok(isLabUnverified("r/l1/a", "u3"), "the lesson block shows 'checked on the server', not 'You earned 15 XP'");
  }
});

test("unverified is per user: one user's verified pass is unverified for another user on the same device", () => {
  assert.equal(serverPass("p/l1/a", "u4"), LAB_XP);
  assert.equal(isLabUnverified("p/l1/a", "u4"), false);
  assert.equal(isLabUnverified("p/l1/a", "u5"), true, "u5 has not earned it");
  mergeLabProgress([{ ref: "p/l1/a", at: "2026-10-01T00:00:00Z", xp: LAB_XP }], { user: "u5", labXp: LAB_XP });
  assert.equal(isLabUnverified("p/l1/a", "u5"), false, "u5's Worker reports it");
  assert.equal(isLabUnverified("p/l1/a", null), true, "a guest did not earn it (the block shows neither line)");
});

test("probe B: guest award, the Worker awards it before any push, then a pull with another device's exercise XP: 15 + 15 = 30", async () => {
  setStudyState(emptyState());
  const guest = getGuestLabXp();
  assert.equal(guestPass("pb/l1/a"), LAB_XP);
  assert.equal(serverPass("pb/l1/a", "u6"), LAB_XP);
  assert.equal(currentXp("u6"), LAB_XP);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  storage.setItem("sf_token", `${b64({ alg: "none" })}.${b64({ sub: "u6", username: "x", name: "X", avatar: "", exp: 4_102_444_800 })}.sig`);
  // The server copy: 15 XP of an in-lesson exercise, synced from another device.
  const serverCopy: StudyState = { v: 1, lessons: { "pb/l1": { bonus: XP.exercise } }, notes: {}, days: [], updated: 2 };
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => ((init?.method ?? "GET") === "PUT" ? Response.json({ ok: true }) : Response.json({ data: serverCopy }))) as typeof fetch;
  try {
    await startSync();
    assert.equal(bonusOf("pb/l1"), XP.exercise, "the other device's exercise XP is kept");
    assert.equal(serverLabXpOf("u6"), LAB_XP);
    assert.equal(currentXp("u6"), 30);
    assert.equal(currentXp(null), XP.exercise + guest + LAB_XP, "the guest rule keeps the guest's own award");
  } finally {
    globalThis.fetch = realFetch;
    storage.removeItem("sf_token");
  }
});

test("a progress answer replaces the server figure: a pass the Worker no longer has (account deleted and created again) stops counting", () => {
  const since = Date.now();
  serverPass("gone/l1/a", "u-re");
  assert.equal(serverLabXpOf("u-re"), LAB_XP);
  assert.ok(!isLabUnverified("gone/l1/a", "u-re"));
  // The new account (same subject): the Worker has no passes and no XP; the request was sent after the pass.
  mergeLabProgress([], { user: "u-re", labXp: 0, since: since + 60_000 });
  assert.equal(serverLabXpOf("u-re"), 0, "the dashboard total drops the old account's XP");
  assert.ok(isLabUnverified("gone/l1/a", "u-re"), "and the lesson block no longer says it was earned");
});

test("a pass the Worker graded after the progress request was sent is kept on top of the answer, with its XP (no race)", () => {
  mergeLabProgress([{ ref: "race/l1/a", at: "2026-10-01T00:00:00Z", xp: LAB_XP }, { ref: "race/l1/b", at: "2026-10-01T00:00:00Z", xp: LAB_XP }], { user: "u-race", labXp: 2 * LAB_XP });
  const since = Date.now(); // the next GET /api/lab/progress leaves
  serverPass("race/l1/c", "u-race"); // a run graded while it is in flight
  assert.equal(serverLabXpOf("u-race"), 3 * LAB_XP);
  // The answer was computed before that run committed: it lists only a and b.
  mergeLabProgress([{ ref: "race/l1/a", at: "2026-10-01T00:00:00Z", xp: LAB_XP }, { ref: "race/l1/b", at: "2026-10-01T00:00:00Z", xp: LAB_XP }], { user: "u-race", labXp: 2 * LAB_XP, since });
  assert.equal(serverLabXpOf("u-race"), 3 * LAB_XP, "the newer pass keeps its XP");
  assert.ok(!isLabUnverified("race/l1/c", "u-race"));
  // A later answer that includes it: counted once.
  mergeLabProgress(
    ["a", "b", "c"].map((x) => ({ ref: `race/l1/${x}`, at: "2026-10-01T00:00:00Z", xp: LAB_XP })),
    { user: "u-race", labXp: 3 * LAB_XP, since: Date.now() },
  );
  assert.equal(serverLabXpOf("u-race"), 3 * LAB_XP, "not 45 + 15");
  // And a still later answer without it (the pass is older than that request): the Worker's word wins.
  mergeLabProgress([], { user: "u-race", labXp: 0, since: Date.now() + 1 });
  assert.equal(serverLabXpOf("u-race"), 0);
});
