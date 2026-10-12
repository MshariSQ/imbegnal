// XP authority: the per-lesson bonus ceiling the Worker clamps synced state to
// (generated catalog), and the client rules for lab XP (lib/lab-progress.ts, lib/xp.ts): lab XP never
// goes into the synced study state; guests count their awards in this browser, signed-in learners the
// Worker's lab XP.
import { test } from "node:test";
import assert from "node:assert/strict";
import { courses } from "../../lib/catalog";
import { loadLesson } from "../../data/lessons";
import { catalog } from "../../worker/src/generated/catalog";
import { LAB_XP, XP, lessonMaxBonus } from "../../shared/xp";
import { XP as storeXp, getStudyState, setStudyState, totalXp, type StudyState } from "../../lib/study-store";
import { getGuestLabXp, getLabProgress, getServerLabXp, isLabUnverified, labGrader, markLabPassed, mergeLabProgress } from "../../lib/lab-progress";
import { currentXp, shownXp } from "../../lib/xp";
import { startSync, syncLabProgress } from "../../lib/sync";

// The client stores are localStorage-backed: give this process (node:test runs each file in its own) a browser-ish global.
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

test("one XP table: the study store re-exports shared/xp, and lab XP is the exercise XP", () => {
  assert.equal(storeXp, XP);
  assert.equal(LAB_XP, XP.exercise);
});

test("lessonMaxBonus counts what the lesson components can award: exercises with tests and quizzes with questions", () => {
  assert.equal(lessonMaxBonus([]), 0);
  assert.equal(
    lessonMaxBonus([
      { type: "text" },
      { type: "code-demo" },
      { type: "exercise", tests: [{}] },
      { type: "exercise", tests: [{}, {}] },
      { type: "exercise", tests: [] }, // no "Check" button: never passes
      { type: "quiz", questions: [{}, {}] },
      { type: "quiz", questions: [] }, // nothing to pick: never passes
      { type: "lab", tests: [{}] }, // lab XP is the Worker's (xp_ledger), not bonus
    ]),
    2 * XP.exercise + XP.quiz,
  );
});

test("the generated catalog carries every course lesson's maxBonus, computed from the lesson itself", async () => {
  let withLabs = 0;
  for (const course of courses) {
    const track = catalog.tracks.find((t) => t.id === course.id);
    assert.ok(track, `catalog track ${course.id}`);
    assert.deepEqual(Object.keys(track.maxBonus ?? {}), track.lessons, `${course.id}: one entry per lesson, in order`);
    for (const id of track.lessons) {
      const lesson = await loadLesson(course.id, id);
      assert.ok(lesson, `${course.id}/${id}`);
      const exercises = lesson.sections.filter((s) => s.type === "exercise" && s.tests.length > 0).length;
      const quizzes = lesson.sections.filter((s) => s.type === "quiz" && s.questions.length > 0).length;
      assert.equal(track.maxBonus![id], exercises * XP.exercise + quizzes * XP.quiz, `${course.id}/${id}`);
      if (lesson.sections.some((s) => s.type === "lab")) withLabs++;
    }
  }
  assert.ok(withLabs > 0, "some lessons have labs, and their XP is not part of maxBonus");
});

test("labGrader: the Worker's xpAwarded when it graded and recorded the run; guests earn local XP; any other signed-in pass is unverified", () => {
  assert.deepEqual(labGrader({ user: "u1", gradeSource: "server", xpAwarded: LAB_XP }), { by: "server", user: "u1", xpAwarded: LAB_XP });
  assert.deepEqual(labGrader({ user: "u1", gradeSource: "server", xpAwarded: 0 }), { by: "server", user: "u1", xpAwarded: 0 });
  assert.deepEqual(labGrader({ user: "u1", gradeSource: "browser" }), { by: "unverified", user: "u1" });
  assert.deepEqual(labGrader({ user: null, gradeSource: "browser" }), { by: "local" });
  // A Worker from before the ledger answers no xpAwarded: no XP for a signed-in learner (it keeps none).
  assert.deepEqual(labGrader({ user: "u1", gradeSource: "server" }), { by: "unverified", user: "u1" });
  // The Worker graded it but did not record it (account deleted or signed out everywhere mid-run).
  assert.deepEqual(labGrader({ user: "u1", gradeSource: "server", recorded: false }), { by: "unverified", user: "u1" });
  assert.deepEqual(labGrader({ user: "u1", gradeSource: "server", xpAwarded: LAB_XP, recorded: false }), { by: "unverified", user: "u1" });
});

test("guests: a local pass earns XP.exercise once, in this browser's guest awards, never in the synced study state", () => {
  const study = getStudyState();
  const guest = getGuestLabXp();
  assert.equal(markLabPassed("guest/lesson/a"), XP.exercise);
  assert.equal(getStudyState(), study, "the study state is untouched (nothing to sync, nothing to merge)");
  assert.equal(getGuestLabXp(), guest + XP.exercise);
  assert.equal(currentXp(null), totalXp(study) + getGuestLabXp(), "a guest's total includes it");
  assert.equal(markLabPassed("guest/lesson/a"), 0, "already passed");
  assert.equal(getGuestLabXp(), guest + XP.exercise);
  assert.ok(getLabProgress()["guest/lesson/a"]);
  assert.equal(isLabUnverified("guest/lesson/a", null), false, "earned, for the guest");
});

test("signed in, server-graded: the pass records the Worker's xpAwarded as server lab XP, never local XP", () => {
  mergeLabProgress([], { user: "u1", labXp: 30 });
  const before = totalXp(getStudyState());
  const guest = getGuestLabXp();
  assert.equal(markLabPassed("srv/lesson/a", { by: "server", user: "u1", xpAwarded: LAB_XP }), LAB_XP);
  assert.deepEqual(getServerLabXp(), { user: "u1", lab: 30 + LAB_XP, refs: ["srv/lesson/a"] });
  assert.equal(markLabPassed("srv/lesson/a", { by: "server", user: "u1", xpAwarded: 0 }), 0, "already awarded by the Worker");
  assert.deepEqual(getServerLabXp(), { user: "u1", lab: 30 + LAB_XP, refs: ["srv/lesson/a"] });
  assert.equal(totalXp(getStudyState()), before, "no study-state XP");
  assert.equal(getGuestLabXp(), guest, "no guest XP");
  assert.equal(bonusOf("srv/lesson"), 0);
  assert.ok(getLabProgress()["srv/lesson/a"]);
  assert.equal(isLabUnverified("srv/lesson/a", "u1"), false);
});

test("signed in, graded in the browser: Passed but no XP, until the server grades it", () => {
  const before = currentXp("u1");
  assert.equal(markLabPassed("unv/lesson/a", { by: "unverified", user: "u1" }), 0);
  assert.ok(getLabProgress()["unv/lesson/a"], "the Passed badge");
  assert.ok(isLabUnverified("unv/lesson/a", "u1"));
  assert.equal(currentXp("u1"), before);
  assert.equal(markLabPassed("unv/lesson/a", { by: "server", user: "u1", xpAwarded: LAB_XP }), LAB_XP);
  assert.ok(!isLabUnverified("unv/lesson/a", "u1"));
  assert.equal(currentXp("u1"), before + LAB_XP);
  // Signed out on the same device, a guest's first local pass of an exercise passed only while signed in earns the guest XP, once.
  markLabPassed("unv/lesson/b", { by: "unverified", user: "u1" });
  assert.ok(isLabUnverified("unv/lesson/b", null), "not earned by the guest: the block shows neither line");
  const guest = getGuestLabXp();
  assert.equal(markLabPassed("unv/lesson/b"), XP.exercise);
  assert.equal(getGuestLabXp(), guest + XP.exercise);
  assert.ok(!isLabUnverified("unv/lesson/b", null));
  assert.equal(markLabPassed("unv/lesson/b"), 0);
  assert.ok(isLabUnverified("unv/lesson/b", "u1"), "still unverified for the signed-in user: guest XP never counts there");
});

test("mergeLabProgress: merges the server's passes without local XP, replaces the server lab XP, verifies the reported refs", () => {
  markLabPassed("mrg/lesson/x", { by: "unverified", user: "u1" });
  const before = totalXp(getStudyState());
  const guest = getGuestLabXp();
  mergeLabProgress(
    [
      { ref: "mrg/lesson/x", at: "2026-10-01T10:00:00Z", xp: LAB_XP },
      { ref: "mrg/lesson/y", at: "2026-10-02T10:00:00Z", xp: LAB_XP },
      { ref: "mrg/lesson/z", at: "garbage", xp: LAB_XP },
    ],
    { user: "u1", labXp: 45 },
  );
  const p = getLabProgress();
  assert.equal(p["mrg/lesson/y"], Date.parse("2026-10-02T10:00:00Z"));
  assert.ok(p["mrg/lesson/z"] > 0, "unparseable time falls back to now");
  assert.notEqual(p["mrg/lesson/x"], Date.parse("2026-10-01T10:00:00Z"), "an existing local pass keeps its time");
  assert.equal(totalXp(getStudyState()), before, "the server's passes add no study-state XP");
  assert.equal(getGuestLabXp(), guest, "nor guest XP");
  assert.equal(getServerLabXp()?.lab, 45, "the server's total replaces the local figure");
  assert.ok(!isLabUnverified("mrg/lesson/x", "u1"), "the server knows this pass now");
  assert.ok(isLabUnverified("mrg/lesson/y", null), "a guest did not earn the server's passes");
  // Without the XP report (older Worker) only the passes merge, unverified.
  mergeLabProgress([{ ref: "mrg/lesson/w", at: "2026-10-03T10:00:00Z" }]);
  assert.equal(getServerLabXp()?.lab, 45);
  assert.ok(getLabProgress()["mrg/lesson/w"]);
  assert.ok(isLabUnverified("mrg/lesson/w", "u1"));
  // A pass the Worker recorded before the ledger (no xp): its XP is in the synced bonus (legacy), earned.
  mergeLabProgress([{ ref: "mrg/lesson/old", at: "2026-01-01T00:00:00Z" }], { user: "u1", labXp: 45 });
  assert.ok(!isLabUnverified("mrg/lesson/old", "u1"));
  assert.ok(!isLabUnverified("mrg/lesson/old", null));
  assert.equal(markLabPassed("mrg/lesson/old"), 0, "no guest XP on top of the legacy bonus");
  // Another account on this device: its own figure, nothing carried over.
  mergeLabProgress([], { user: "u2", labXp: 0 });
  assert.deepEqual(getServerLabXp(), { user: "u2", lab: 0, refs: [] });
  assert.ok(isLabUnverified("mrg/lesson/x", "u2"), "u1's pass is not u2's");
  assert.equal(JSON.parse(storage.getItem("imb-labs-server-v1") ?? "null").user, "u2", "persisted");
});

test("shownXp: guests see totalXp(state) + guest lab XP; signed-in learners totalXp(state) + the server lab XP", () => {
  const state = { v: 1 as const, lessons: { "a/b": { done: 1, bonus: 25 }, "a/c": { bonus: 10 } }, notes: {}, days: [], updated: 0 };
  assert.equal(totalXp(state), XP.lesson + 35);
  assert.equal(shownXp(state, null, 45, 0), totalXp(state), "a guest never gets server lab XP");
  assert.equal(shownXp(state, null, 0, 30), totalXp(state) + 30);
  assert.equal(shownXp(state, "u1", 0, 30), totalXp(state), "guest awards never count when signed in");
  assert.equal(shownXp(state, "u1", 45, 30), totalXp(state) + 45);
});

test("probe A: guest pass, sign-in pull of a richer server copy, then the Worker's award: 25 + 15 = 40, nothing lost, 25 pushed", async () => {
  setStudyState({ v: 1, lessons: {}, notes: {}, days: [], updated: 1 });
  const guest = getGuestLabXp();
  assert.equal(markLabPassed("pa/l1/a", labGrader({ user: null, gradeSource: "browser" })), LAB_XP);
  assert.equal(currentXp(null), guest + LAB_XP);
  // Signs in: the server copy has 25 bonus XP for that lesson (an exercise and a quiz, from a laptop).
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  storage.setItem("sf_token", `${b64({ alg: "none" })}.${b64({ sub: "pa", username: "x", name: "X", avatar: "", exp: 4_102_444_800 })}.sig`);
  const serverCopy: StudyState = { v: 1, lessons: { "pa/l1": { bonus: XP.exercise + XP.quiz } }, notes: {}, days: [], updated: 2 };
  const puts: StudyState[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    assert.match(String(input), /\/api\/state$/);
    if ((init?.method ?? "GET") === "PUT") {
      puts.push((JSON.parse(String(init?.body)) as { data: StudyState }).data);
      return Response.json({ ok: true });
    }
    return Response.json({ data: serverCopy });
  }) as typeof fetch;
  try {
    await startSync();
    assert.equal(bonusOf("pa/l1"), 25, "merged");
    assert.equal(currentXp("pa"), 25, "signed in: the guest's award does not count, the pass is unverified");
    assert.ok(isLabUnverified("pa/l1/a", "pa"));
    assert.equal(markLabPassed("pa/l1/a", labGrader({ user: "pa", gradeSource: "server", xpAwarded: LAB_XP })), LAB_XP);
    assert.equal(bonusOf("pa/l1"), 25, "the study state is untouched");
    assert.equal(currentXp("pa"), 40);
    assert.ok(!isLabUnverified("pa/l1/a", "pa"));
    for (let i = 0; i < 100 && puts.length === 0; i++) await new Promise((r) => setTimeout(r, 50));
    assert.equal(puts.length, 1, "pushed");
    assert.equal(puts[0].lessons["pa/l1"].bonus, 25, "the server copy keeps the laptop's 25");
    // Signed out again: the guest rule (its own award, not the Worker's).
    assert.equal(currentXp(null), 25 + guest + LAB_XP);
  } finally {
    globalThis.fetch = realFetch;
    storage.removeItem("sf_token");
  }
});

test("syncLabProgress: one authenticated GET /api/lab/progress per burst, merged for the signed-in user; failures are silent", async () => {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  storage.setItem("sf_token", `${b64({ alg: "none" })}.${b64({ sub: "u9", username: "x", name: "X", avatar: "", exp: 4_102_444_800 })}.sig`);
  const seen: { url: string; auth: string | null }[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    seen.push({ url: String(input), auth: new Headers(init?.headers).get("Authorization") });
    return Response.json({ passed: [{ ref: "sync/lesson/a", at: "2026-10-01T00:00:00Z" }], xp: { total: 60, lab: 60 } });
  }) as typeof fetch;
  try {
    await Promise.all([syncLabProgress("u9"), syncLabProgress("u9")]);
    assert.equal(seen.length, 1, "concurrent calls (layout + dashboard) share one request");
    assert.match(seen[0].url, /\/api\/lab\/progress$/);
    assert.match(seen[0].auth ?? "", /^Bearer /);
    assert.deepEqual(getServerLabXp(), { user: "u9", lab: 60, refs: ["sync/lesson/a"] });
    assert.ok(getLabProgress()["sync/lesson/a"]);
    // An answer for an account that is no longer the signed-in one is dropped.
    await syncLabProgress("someone-else");
    assert.deepEqual(getServerLabXp(), { user: "u9", lab: 60, refs: ["sync/lesson/a"] });
    // Outages (or a Worker without the route) change nothing.
    globalThis.fetch = (async () => new Response('{"error":"not_found"}', { status: 404 })) as typeof fetch;
    await syncLabProgress("u9");
    assert.deepEqual(getServerLabXp(), { user: "u9", lab: 60, refs: ["sync/lesson/a"] });
  } finally {
    globalThis.fetch = realFetch;
    storage.removeItem("sf_token");
  }
});
