// One lab exercise counts once. A pass this browser awarded locally (a guest, or any pass of the client
// before the XP ledger) put XP.exercise into the lesson's study-store bonus; when the Worker later awards
// the same exercise (xp_ledger: a server-graded pass here, or GET /api/lab/progress reporting it), that
// local award is taken back out of the bonus once, and lib/sync.ts keeps the removal through the next
// pull + max-merge until the reduced document has been pushed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { XP } from "../../shared/xp";
import { getStudyState, setStudyState, totalXp, type StudyState } from "../../lib/study-store";
import { getServerLabXp, labGrader, markLabPassed, mergeLabProgress } from "../../lib/lab-progress";
import { shownXp } from "../../lib/xp";
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
const shown = () => shownXp(getStudyState(), getServerLabXp()?.lab ?? 0);
const localXp = () => JSON.parse(storage.getItem("imb-labs-local-xp-v1") ?? "{}") as Record<string, { xp: number; removed?: number; at?: number }>;
const server = (user: string, xpAwarded: number) => labGrader({ user, gradeSource: "server", xpAwarded });

// First in this file, so the stores start from exactly what the old client left in localStorage.
test("data from the client before this change: every lab pass it recorded had added XP to the bonus", () => {
  // What origin/main's client left: the pass list and the bonus, nothing else (no local-award record yet).
  storage.setItem("imb-labs-v1", JSON.stringify({ "old/l1/a": 1700000000000 }));
  storage.setItem("imb-study-v1", JSON.stringify({ v: 1, lessons: { "old/l1": { done: 1700000000000, bonus: XP.exercise + XP.quiz } }, notes: {}, days: [], updated: 1700000000000 }));
  mergeLabProgress([{ ref: "new/l1/x", at: "2026-10-01T00:00:00Z", xp: XP.exercise }], { user: "u1", labXp: 2 * XP.exercise });
  assert.equal(markLabPassed("old/l1/a", server("u1", XP.exercise)), 0);
  assert.equal(bonusOf("old/l1"), XP.quiz, "the old local award is taken out once");
  assert.equal(localXp()["new/l1/x"], undefined, "a pass merged from the server is not a local award");
  setStudyState({ v: 1, lessons: {}, notes: {}, days: [], updated: 0 });
});

test("guest pass, then a server-graded pass of the same exercise: counted once, the banner shows no new XP", () => {
  assert.equal(markLabPassed("t1/l1/a", labGrader({ user: null, gradeSource: "browser" })), XP.exercise, "guest: local award");
  assert.deepEqual(localXp()["t1/l1/a"], { xp: XP.exercise });
  assert.equal(totalXp(getStudyState()), XP.exercise);
  // Signs in as u2 (a new account on this device: its server lab XP starts at 0) and passes it on the server.
  assert.equal(markLabPassed("t1/l1/a", server("u2", XP.exercise)), 0, "the XP moved to the server: nothing new for this pass");
  assert.equal(bonusOf("t1/l1"), 0, "the local award is taken out of the bonus");
  assert.deepEqual(getServerLabXp(), { user: "u2", lab: XP.exercise });
  assert.equal(shown(), XP.exercise, "one exercise, 15 XP, not 30");
  assert.equal(localXp()["t1/l1/a"].xp, 0, "server-verified");
  // Once only: a later award report for the same ref removes nothing more.
  setStudyState({ ...getStudyState(), lessons: { ...getStudyState().lessons, "t1/l1": { bonus: XP.quiz } } });
  mergeLabProgress([{ ref: "t1/l1/a", at: "2026-10-01T00:00:00Z", xp: XP.exercise }], { user: "u2", labXp: XP.exercise });
  assert.equal(bonusOf("t1/l1"), XP.quiz, "other XP of the lesson is untouched");
});

test("guest pass, then the server reports the same exercise already awarded (passed on another device): counted once", () => {
  assert.equal(markLabPassed("t2/l1/a"), XP.exercise);
  const before = totalXp(getStudyState());
  mergeLabProgress([{ ref: "t2/l1/a", at: "2026-10-01T00:00:00Z", xp: XP.exercise }], { user: "u1", labXp: 2 * XP.exercise });
  assert.equal(totalXp(getStudyState()), before - XP.exercise);
  assert.equal(bonusOf("t2/l1"), 0);
});

test("no removal without a local award: a signed-in browser pass (unverified), a server pass, a pre-ledger server pass", () => {
  setStudyState({ ...getStudyState(), lessons: { ...getStudyState().lessons, "t3/l1": { bonus: 25 } } });
  markLabPassed("t3/l1/unv", { by: "unverified" });
  assert.equal(markLabPassed("t3/l1/unv", server("u1", XP.exercise)), XP.exercise, "XP earned now");
  assert.equal(markLabPassed("t3/l1/srv", server("u1", XP.exercise)), XP.exercise);
  // A pass the Worker recorded before the ledger (no xp in the report): its XP lives in bonus (PUT /api/state allows it).
  mergeLabProgress([{ ref: "t3/l1/old", at: "2026-01-01T00:00:00Z" }], { user: "u1", labXp: 0 });
  assert.equal(bonusOf("t3/l1"), 25, "nothing was taken out");
  // An older Worker that reports no XP at all: nothing is taken out either.
  assert.equal(markLabPassed("t3/l1/g"), XP.exercise);
  mergeLabProgress([{ ref: "t3/l1/g", at: "2026-10-01T00:00:00Z" }]);
  assert.equal(bonusOf("t3/l1"), 25 + XP.exercise);
});

test("the removal never makes the bonus negative", () => {
  assert.equal(markLabPassed("t4/l1/a"), XP.exercise);
  setStudyState({ ...getStudyState(), lessons: { ...getStudyState().lessons, "t4/l1": { bonus: 5 } } }); // e.g. edited elsewhere
  markLabPassed("t4/l1/a", server("u1", XP.exercise));
  assert.equal(getStudyState().lessons["t4/l1"]?.bonus, undefined, "floor 0");
});

test("startSync: the next pull + max-merge does not bring the removed award back; a pushed removal stops applying", async () => {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  storage.setItem("sf_token", `${b64({ alg: "none" })}.${b64({ sub: "u5", username: "x", name: "X", avatar: "", exp: 4_102_444_800 })}.sig`);
  setStudyState({ ...getStudyState(), lessons: { ...getStudyState().lessons, "t5/l1": { bonus: XP.quiz } } });
  assert.equal(markLabPassed("t5/l1/a"), XP.exercise);
  // The server copy still has the local award (pushed while it was in the bonus), plus a quiz synced from another device.
  const serverCopy: StudyState = { v: 1, lessons: { "t5/l1": { bonus: XP.quiz + XP.exercise + XP.quiz } }, notes: {}, days: [], updated: 1 };
  markLabPassed("t5/l1/a", server("u5", XP.exercise)); // removal; its push has not happened yet (reload, offline)
  assert.equal(bonusOf("t5/l1"), XP.quiz);

  const puts: StudyState[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    if ((init?.method ?? "GET") === "PUT") {
      puts.push((JSON.parse(String(init?.body)) as { data: StudyState }).data);
      return Response.json({ ok: true });
    }
    assert.match(String(input), /\/api\/state$/);
    return Response.json({ data: serverCopy });
  }) as typeof fetch;
  try {
    await startSync();
    assert.equal(bonusOf("t5/l1"), XP.quiz + XP.quiz, "max-merge takes the other device's quiz, not the removed award");
    // The debounced push sends the reduced document; after it succeeded the removal is settled.
    for (let i = 0; i < 100 && puts.length === 0; i++) await new Promise((r) => setTimeout(r, 50));
    assert.equal(puts.length, 1, "pushed");
    assert.equal(puts[0].lessons["t5/l1"].bonus, XP.quiz + XP.quiz);
    assert.deepEqual(localXp()["t5/l1/a"], { xp: 0 }, "settled: no longer re-applied");
  } finally {
    globalThis.fetch = realFetch;
  }
});
