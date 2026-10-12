// GET/PUT /api/state through the real router: the stored study document cannot carry
// lessons the catalog does not have, XP the lessons cannot award, or nonsense values.
import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { catalog } from "../src/generated/catalog";
import { LAB_XP } from "../../shared/xp";
import { sanitizeStudyState } from "../src/state";
import type { Env } from "../src/util";
import { TestD1 } from "./helpers/d1";
import { addUser, call, jsonOf, makeEnv, tokenFor } from "./helpers/harness";

let db: TestD1;
let env: Env;
let token: string;

beforeEach(async () => {
  db = new TestD1();
  env = makeEnv(db);
  addUser(db, { id: "u1" });
  token = await tokenFor("u1");
});

const put = (data: unknown, tok: string | null = token) => call(env, "/api/state", { method: "PUT", token: tok, body: { data } });
const get = async () => (await jsonOf<{ data: Record<string, unknown> | null }>(await call(env, "/api/state", { token }))).data;
const stored = () => JSON.parse(db.query<{ data: string }>("SELECT data FROM user_state WHERE github_id = 'u1'")[0].data);

// A catalog lesson with graded labs: its ceiling excludes their XP.
const KEY = "cyber-security/python";
const MAX = catalog.tracks.find((t) => t.id === "cyber-security")!.maxBonus!.python;
const OTHER = "frontend/html-css";
const T = Date.UTC(2026, 9, 1, 12);

const honest = () => ({
  v: 1,
  lessons: {
    [KEY]: { visited: T, done: T + 1000, quiz: 0.75, bonus: MAX },
    [OTHER]: { visited: T },
  },
  notes: { [KEY]: { text: "remember f-strings", updated: T } },
  days: ["2026-09-30", "2026-10-01"],
  last: { key: KEY, at: T },
  updated: T + 2000,
});

describe("PUT /api/state", () => {
  test("an honest document round-trips unchanged", async () => {
    assert.ok(MAX > 0, "the fixture lesson awards bonus XP");
    const res = await put(honest());
    assert.equal(res.status, 200);
    assert.deepEqual(await jsonOf(res), { ok: true });
    assert.deepEqual(await get(), honest());
  });

  test("lesson keys that are not catalog lessons are dropped", async () => {
    const doc = honest();
    Object.assign(doc.lessons, {
      "nope/lesson": { done: T, bonus: 15 },
      "cyber-security/not-a-lesson": { done: T },
      "cyber-security": { done: T },
      __proto__x: { done: T },
    });
    await put(JSON.parse(JSON.stringify(doc).replace('"__proto__x"', '"__proto__"')));
    assert.deepEqual(Object.keys(stored().lessons).sort(), [KEY, OTHER].sort());
  });

  test("bonus is clamped to [0, the lesson's maxBonus], which leaves lab XP out", async () => {
    const doc = honest();
    doc.lessons[KEY].bonus = 999_999;
    await put(doc);
    assert.equal(stored().lessons[KEY].bonus, MAX);
    doc.lessons[KEY].bonus = MAX + 15; // a pass graded in the browser used to add 15 here
    await put(doc);
    assert.equal(stored().lessons[KEY].bonus, MAX);
    doc.lessons[KEY].bonus = -40;
    await put(doc);
    assert.equal(stored().lessons[KEY].bonus, undefined, "negative bonus is dropped");
    doc.lessons[KEY].bonus = 10.9;
    await put(doc);
    assert.equal(stored().lessons[KEY].bonus, 10, "whole XP only");
    (doc.lessons[KEY] as Record<string, unknown>).bonus = "500";
    await put(doc);
    assert.equal(stored().lessons[KEY].bonus, undefined, "not a number");
  });

  test("a lab pass recorded before the XP ledger keeps its XP above maxBonus (the old client folded it into bonus)", async () => {
    const lab = catalog.labs.find((l) => `${l.track}/${l.lesson}` === KEY)!;
    assert.ok(lab, "the fixture lesson has a lab");
    const legacyPass = () => db.execute("INSERT INTO lab_progress (user_id, ref, passed_at) VALUES ('u1', ?, '2026-01-02 03:04:05')", lab.ref);
    legacyPass();
    const doc = honest();
    doc.lessons[KEY].bonus = MAX + LAB_XP; // what origin/main's client stored for this learner
    await put(doc);
    assert.equal(stored().lessons[KEY].bonus, MAX + LAB_XP, "the legacy pass keeps its 15");
    doc.lessons[KEY].bonus = MAX + 2 * LAB_XP;
    await put(doc);
    assert.equal(stored().lessons[KEY].bonus, MAX + LAB_XP, "one legacy pass allows one LAB_XP, no more");
    // Another learner's legacy pass, or a lab_progress row that is not a catalog lab, allows nothing.
    db.execute("INSERT INTO lab_progress (user_id, ref) VALUES ('u2', ?), ('u1', 'cyber-security/python/removed-lab')", lab.ref);
    db.execute("DELETE FROM lab_progress WHERE user_id = 'u1' AND ref = ?", lab.ref);
    doc.lessons[KEY].bonus = MAX + LAB_XP;
    await put(doc);
    assert.equal(stored().lessons[KEY].bonus, MAX, "forged: clamped to maxBonus");
  });

  test("a pass the ledger awarded gives no extra allowance: its XP is the Worker's, not bonus", async () => {
    const lab = catalog.labs.find((l) => `${l.track}/${l.lesson}` === KEY)!;
    db.execute("INSERT INTO lab_progress (user_id, ref) VALUES ('u1', ?)", lab.ref);
    db.execute("INSERT INTO xp_ledger (user_id, source, ref, xp) VALUES ('u1', 'lab', ?, ?)", lab.ref, LAB_XP);
    const doc = honest();
    doc.lessons[KEY].bonus = MAX + LAB_XP;
    await put(doc);
    assert.equal(stored().lessons[KEY].bonus, MAX);
    // The allowance is per lesson: another lesson gets none from this lab.
    await put({ ...honest(), lessons: { [OTHER]: { bonus: 999 } } });
    assert.equal(stored().lessons[OTHER].bonus, catalog.tracks.find((t) => t.id === "frontend")!.maxBonus!["html-css"]);
  });

  test("visited outside 2020-01-01 .. now + 1 day, or not a number, is dropped", async () => {
    const now = Date.now();
    const bad: unknown[] = [1, -5, Date.UTC(2019, 11, 31), now + 2 * 86_400_000, 8.64e15, "2026-10-01", true, null, {}];
    for (const v of bad) {
      await put({ ...honest(), lessons: { [KEY]: { visited: v, bonus: 10 } } });
      assert.deepEqual(stored().lessons[KEY], { bonus: 10 }, JSON.stringify(v));
    }
    for (const v of [Date.UTC(2020, 0, 1), now, now + 86_400_000 - 60_000]) {
      await put({ ...honest(), lessons: { [KEY]: { done: v, visited: v } } });
      assert.deepEqual(stored().lessons[KEY], { done: v, visited: v }, String(v));
    }
  });

  test("done keeps every completion the site and the certificates count: true, and any positive number (a future one is clamped)", async () => {
    const now = Date.now();
    // true: the legacy shape (migrations.test.ts); 1: what mergeStates makes of true and a timestamp (Math.min(true, t))
    for (const v of [true, 1, Date.UTC(2019, 11, 31), Date.UTC(2020, 0, 1), now]) {
      await put({ ...honest(), lessons: { [KEY]: { done: v, bonus: 10 } } });
      assert.deepEqual(stored().lessons[KEY], { done: v, bonus: 10 }, JSON.stringify(v));
    }
    for (const v of [now + 2 * 86_400_000, 8.64e15]) {
      await put({ ...honest(), lessons: { [KEY]: { done: v } } });
      const done = stored().lessons[KEY].done as number;
      assert.ok(done <= Date.now() + 86_400_000 && done >= now + 86_400_000 - 60_000, `clamped to now + 1 day: ${v}`);
    }
    for (const v of [0, -5, "2026-10-01", false, null, {}, [], Number.NaN]) {
      await put({ ...honest(), lessons: { [KEY]: { done: v, bonus: 10 } } });
      assert.deepEqual(stored().lessons[KEY], { bonus: 10 }, `not a completion: ${JSON.stringify(v)}`);
    }
  });

  test("the legacy production document ({done: true} lessons) keeps its completions and certificate eligibility", async () => {
    const track = catalog.tracks.find((t) => t.id === "cyber-security")!;
    const legacy = { v: 1, lessons: Object.fromEntries(track.lessons.map((l) => [`${track.id}/${l}`, { done: true }])) };
    db.execute("INSERT INTO user_state (github_id, data) VALUES ('u1', ?)", JSON.stringify(legacy));
    // The site pulls it, merges, and pushes it back.
    assert.equal((await put({ ...(await get()), notes: {}, days: [], updated: T })).status, 200);
    assert.deepEqual(stored().lessons, legacy.lessons);
    const cert = await call(env, "/api/certificates/cyber-security?format=json", { token });
    assert.equal(cert.status, 200, "still eligible");
  });

  test("quiz accuracy outside [0, 1] or not a number is dropped", async () => {
    for (const [v, kept] of [[0, true], [1, true], [0.5, true], [1.01, false], [-0.1, false], ["1", false], [true, false]] as const) {
      await put({ ...honest(), lessons: { [KEY]: { quiz: v, visited: T } } });
      assert.deepEqual(stored().lessons[KEY], kept ? { quiz: v, visited: T } : { visited: T }, JSON.stringify(v));
    }
  });

  test("lesson records drop unknown fields and records that end up empty", async () => {
    await put({ ...honest(), lessons: { [KEY]: { done: T, xp: 100000, level: 99 }, [OTHER]: { visited: 1, quiz: 7 }, "networking/osi-tcpip": "done" } });
    assert.deepEqual(stored().lessons, { [KEY]: { done: T } });
  });

  test("notes and days are only type-checked; unknown top-level fields are dropped", async () => {
    const doc = {
      ...honest(),
      notes: { a: { text: "kept even for unknown keys", updated: 5 }, b: { text: 7, updated: 1 }, c: "x", d: { text: "no time" } },
      days: ["2026-10-01", 20261002, null, "anything"],
      xp: 1_000_000,
      level: 99,
    };
    await put(doc);
    const s = stored();
    assert.deepEqual(s.notes, { a: { text: "kept even for unknown keys", updated: 5 } });
    assert.deepEqual(s.days, ["2026-10-01", "anything"]);
    assert.equal("xp" in s, false);
    assert.equal("level" in s, false);
    await put({ ...honest(), notes: [], days: "2026-10-01", last: { key: 3 }, updated: "now" });
    const t = stored();
    assert.deepEqual([t.notes, t.days, "last" in t, t.updated], [{}, [], false, 0]);
  });

  test("still 400 for a document that is not v1 and 413 above 512 KiB; 401 without a token", async () => {
    assert.equal((await put({ ...honest(), v: 2 })).status, 400);
    assert.equal((await put(null)).status, 400);
    assert.equal((await put({ ...honest(), notes: { big: { text: "x".repeat(512 * 1024), updated: T } } })).status, 413);
    assert.equal((await put(honest(), null)).status, 401);
    assert.equal(db.query("SELECT 1 FROM user_state").length, 0);
  });

  test("a document stored before validation is returned as stored, and sanitized on the next PUT", async () => {
    const legacy = { v: 1, lessons: { [KEY]: { done: T, bonus: 5000 }, "nope/x": { done: T } }, notes: {}, days: [], updated: T };
    db.execute("INSERT INTO user_state (github_id, data) VALUES ('u1', ?)", JSON.stringify(legacy));
    assert.deepEqual(await get(), legacy);
    await put(await get());
    assert.deepEqual(stored().lessons, { [KEY]: { done: T, bonus: MAX } });
  });
});

test("sanitizeStudyState is pure and uses the given clock", () => {
  const doc = { v: 1, lessons: { [KEY]: { done: T } } };
  assert.deepEqual(sanitizeStudyState(doc, T - 2 * 86_400_000).lessons, { [KEY]: { done: T - 86_400_000 } }, "a completion after now + 1 day is clamped to it");
  assert.deepEqual(sanitizeStudyState(doc, T).lessons, { [KEY]: { done: T } });
  assert.deepEqual(doc, { v: 1, lessons: { [KEY]: { done: T } } }, "input untouched");
});
