// XP authority: the per-lesson bonus ceiling the Worker clamps synced state to
// (generated catalog), and the client rules for lab XP (lib/lab-progress.ts, lib/xp.ts).
import { test } from "node:test";
import assert from "node:assert/strict";
import { courses } from "../../lib/catalog";
import { loadLesson } from "../../data/lessons";
import { catalog } from "../../worker/src/generated/catalog";
import { LAB_XP, XP, lessonMaxBonus } from "../../shared/xp";
import { XP as storeXp, getStudyState, totalXp } from "../../lib/study-store";
import { getLabProgress, getServerLabXp, getUnverifiedLabs, labGrader, markLabPassed, mergeLabProgress } from "../../lib/lab-progress";
import { shownXp } from "../../lib/xp";
import { syncLabProgress } from "../../lib/sync";

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

test("labGrader: the Worker's xpAwarded when it graded the run; no XP for a signed-in browser pass; local XP for guests and older Workers", () => {
  assert.deepEqual(labGrader({ user: "u1", gradeSource: "server", xpAwarded: LAB_XP }), { by: "server", user: "u1", xpAwarded: LAB_XP });
  assert.deepEqual(labGrader({ user: "u1", gradeSource: "server", xpAwarded: 0 }), { by: "server", user: "u1", xpAwarded: 0 });
  assert.deepEqual(labGrader({ user: "u1", gradeSource: "browser" }), { by: "unverified" });
  assert.deepEqual(labGrader({ user: null, gradeSource: "browser" }), { by: "local" });
  // A Worker from before the ledger answers no xpAwarded and keeps no lab XP: award it locally as before.
  assert.deepEqual(labGrader({ user: "u1", gradeSource: "server" }), { by: "local" });
});

test("guests: a local pass awards XP.exercise to the lesson bonus once (unchanged behaviour)", () => {
  const before = bonusOf("guest/lesson");
  assert.equal(markLabPassed("guest/lesson/a"), XP.exercise);
  assert.equal(bonusOf("guest/lesson"), before + XP.exercise);
  assert.equal(markLabPassed("guest/lesson/a"), 0, "already passed");
  assert.equal(bonusOf("guest/lesson"), before + XP.exercise);
  assert.ok(getLabProgress()["guest/lesson/a"]);
});

test("signed in, server-graded: the pass records the Worker's xpAwarded as server lab XP, never local bonus", () => {
  mergeLabProgress([], { user: "u1", labXp: 30 });
  const before = totalXp(getStudyState());
  assert.equal(markLabPassed("srv/lesson/a", { by: "server", user: "u1", xpAwarded: LAB_XP }), LAB_XP);
  assert.deepEqual(getServerLabXp(), { user: "u1", lab: 30 + LAB_XP });
  assert.equal(markLabPassed("srv/lesson/a", { by: "server", user: "u1", xpAwarded: 0 }), 0, "already awarded by the Worker");
  assert.deepEqual(getServerLabXp(), { user: "u1", lab: 30 + LAB_XP });
  assert.equal(totalXp(getStudyState()), before, "no local XP");
  assert.equal(bonusOf("srv/lesson"), 0);
  assert.ok(getLabProgress()["srv/lesson/a"]);
});

test("signed in, graded in the browser: Passed but no XP, until the server grades it", () => {
  const before = totalXp(getStudyState());
  assert.equal(markLabPassed("unv/lesson/a", { by: "unverified" }), 0);
  assert.ok(getLabProgress()["unv/lesson/a"], "the Passed badge");
  assert.ok(getUnverifiedLabs().includes("unv/lesson/a"));
  assert.equal(totalXp(getStudyState()), before);
  const lab = getServerLabXp()!.lab;
  assert.equal(markLabPassed("unv/lesson/a", { by: "server", user: "u1", xpAwarded: LAB_XP }), LAB_XP);
  assert.ok(!getUnverifiedLabs().includes("unv/lesson/a"));
  assert.equal(getServerLabXp()!.lab, lab + LAB_XP);
  // Signed out on the same device, a guest's first local pass of an unverified exercise earns the local XP.
  markLabPassed("unv/lesson/b", { by: "unverified" });
  assert.equal(markLabPassed("unv/lesson/b"), XP.exercise);
  assert.ok(!getUnverifiedLabs().includes("unv/lesson/b"));
  assert.equal(markLabPassed("unv/lesson/b"), 0);
});

test("mergeLabProgress: merges the server's passes without local XP, replaces the server lab XP, clears verified refs", () => {
  markLabPassed("mrg/lesson/x", { by: "unverified" });
  const before = totalXp(getStudyState());
  mergeLabProgress(
    [
      { ref: "mrg/lesson/x", at: "2026-10-01T10:00:00Z" },
      { ref: "mrg/lesson/y", at: "2026-10-02T10:00:00Z" },
      { ref: "mrg/lesson/z", at: "garbage" },
    ],
    { user: "u1", labXp: 45 },
  );
  const p = getLabProgress();
  assert.equal(p["mrg/lesson/y"], Date.parse("2026-10-02T10:00:00Z"));
  assert.ok(p["mrg/lesson/z"] > 0, "unparseable time falls back to now");
  assert.notEqual(p["mrg/lesson/x"], Date.parse("2026-10-01T10:00:00Z"), "an existing local pass keeps its time");
  assert.equal(totalXp(getStudyState()), before, "the server's passes add no local XP");
  assert.deepEqual(getServerLabXp(), { user: "u1", lab: 45 }, "the server's total replaces the local figure");
  assert.ok(!getUnverifiedLabs().includes("mrg/lesson/x"), "the server knows this pass now");
  // Without the XP report (older Worker) only the passes merge.
  mergeLabProgress([{ ref: "mrg/lesson/w", at: "2026-10-03T10:00:00Z" }]);
  assert.deepEqual(getServerLabXp(), { user: "u1", lab: 45 });
  assert.ok(getLabProgress()["mrg/lesson/w"]);
  // Another account on this device: its own figure, nothing carried over.
  mergeLabProgress([], { user: "u2", labXp: 0 });
  assert.deepEqual(getServerLabXp(), { user: "u2", lab: 0 });
  assert.equal(JSON.parse(storage.getItem("imb-labs-server-v1") ?? "null").user, "u2", "persisted");
});

test("shownXp: guests see totalXp(state); signed-in learners also get the server lab XP", () => {
  const state = { v: 1 as const, lessons: { "a/b": { done: 1, bonus: 25 }, "a/c": { bonus: 10 } }, notes: {}, days: [], updated: 0 };
  assert.equal(totalXp(state), XP.lesson + 35);
  assert.equal(shownXp(state, null), totalXp(state));
  assert.equal(shownXp(state, 0), totalXp(state));
  assert.equal(shownXp(state, 45), totalXp(state) + 45);
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
    assert.deepEqual(getServerLabXp(), { user: "u9", lab: 60 });
    assert.ok(getLabProgress()["sync/lesson/a"]);
    // An answer for an account that is no longer the signed-in one is dropped.
    await syncLabProgress("someone-else");
    assert.deepEqual(getServerLabXp(), { user: "u9", lab: 60 });
    // Outages (or a Worker without the route) change nothing.
    globalThis.fetch = (async () => new Response('{"error":"not_found"}', { status: 404 })) as typeof fetch;
    await syncLabProgress("u9");
    assert.deepEqual(getServerLabXp(), { user: "u9", lab: 60 });
  } finally {
    globalThis.fetch = realFetch;
    storage.removeItem("sf_token");
  }
});
