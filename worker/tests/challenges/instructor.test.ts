// Instructor analytics (math on seeded runs, anonymisation, bounds) and the admin audit feed.
import { test } from "node:test";
import assert from "node:assert/strict";
import type { AuditEntry, InstructorAnalytics } from "../../../shared/api";
import { makeWorld, seedSolve, T0, type World } from "./helpers/world";

const DAY = 86_400_000;
const MIN = 60_000;
const sql = (ms: number) => new Date(ms).toISOString().slice(0, 19).replace("T", " ");

interface RunSeed {
  user: string;
  status: string;
  lang?: string;
  kind?: "lesson" | "challenge" | "free";
  exercise?: string; // "track/lesson/exerciseId" or challenge id
  passed?: 0 | 1 | null;
  runMs?: number | null;
  firstError?: string | null;
  at?: number;
}

let seq = 0;
function seedRun(w: World, r: RunSeed): void {
  const kind = r.kind ?? "lesson";
  const [track, lesson, exercise] = kind === "lesson" ? (r.exercise ?? "").split("/") : [null, null, null];
  w.db.insert(
    `INSERT INTO lab_runs (id, user_id, ref_kind, track, lesson, exercise, challenge_id, lang, status, run_ms, success, passed, first_error, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    `run-${seq++}`, r.user, kind, track, lesson, exercise, kind === "challenge" ? (r.exercise ?? null) : null, r.lang ?? "python", r.status, r.runMs ?? null,
    r.status === "ok" ? 1 : 0, r.passed ?? null, r.firstError ?? null, sql(r.at ?? T0 - DAY),
  );
}

const stateJson = (lessons: Record<string, { visited?: number; done?: number }>) => JSON.stringify({ v: 1, lessons, notes: {}, days: [] });

async function seededWorld() {
  const w = await makeWorld();
  await w.addUser({ sub: "teacher", username: "mr-teacher", role: "instructor" });
  for (const s of ["stu-alpha", "stu-beta", "stu-gamma", "stu-delta"]) await w.addUser({ sub: s, username: `name-${s}`, name: `Real ${s}` });

  const ex = "cyber-security/setup/ex1";
  // alpha: wrong output, runtime error, then pass
  seedRun(w, { user: "stu-alpha", status: "ok", exercise: ex, passed: 0, runMs: 10 });
  seedRun(w, { user: "stu-alpha", status: "runtime_error", exercise: ex, passed: null, runMs: 40, firstError: "NameError: foo" });
  seedRun(w, { user: "stu-alpha", status: "ok", exercise: ex, passed: 1, runMs: 30 });
  // beta: compile error (no run time)
  seedRun(w, { user: "stu-beta", status: "compile_error", lang: "c", exercise: ex, passed: null, runMs: null, firstError: "main.c:1: error: x" });
  // gamma: wrong output + a different runtime error line
  seedRun(w, { user: "stu-gamma", status: "ok", exercise: ex, passed: 0, runMs: 20 });
  seedRun(w, { user: "stu-gamma", status: "runtime_error", exercise: ex, passed: null, runMs: 50, firstError: "NameError: foo" });
  // infrastructure outcomes and runs outside the window do not count as attempts
  seedRun(w, { user: "stu-delta", status: "internal_error", exercise: ex, runMs: 1 });
  seedRun(w, { user: "stu-delta", status: "unsupported", exercise: ex });
  seedRun(w, { user: "stu-delta", status: "ok", exercise: ex, passed: 1, runMs: 5, at: T0 - 40 * DAY });
  // another exercise, a challenge run and a free run
  seedRun(w, { user: "stu-alpha", status: "ok", exercise: "frontend/html-css/ex2", passed: 1, runMs: 7 });
  seedRun(w, { user: "stu-beta", status: "timeout", kind: "challenge", exercise: "out-sum", passed: 0, runMs: 5000, lang: "javascript" });
  seedRun(w, { user: "stu-gamma", status: "ok", kind: "free", lang: "go", runMs: 3 });

  // study state: alpha finished cyber-security (visit 90 min before the last completion), beta 1/3, gamma only visited, delta frontend done
  const done = T0;
  w.db.insert("INSERT INTO user_state (github_id, data) VALUES (?, ?)", "stu-alpha", stateJson({ "cyber-security/setup": { visited: done - 90 * MIN, done: done - 80 * MIN }, "cyber-security/networking": { visited: done - 60 * MIN, done: done - 30 * MIN }, "cyber-security/linux": { done } }));
  w.db.insert("INSERT INTO user_state (github_id, data) VALUES (?, ?)", "stu-beta", stateJson({ "cyber-security/setup": { done } }));
  w.db.insert("INSERT INTO user_state (github_id, data) VALUES (?, ?)", "stu-gamma", stateJson({ "cyber-security/networking": { visited: done } }));
  w.db.insert("INSERT INTO user_state (github_id, data) VALUES (?, ?)", "stu-delta", stateJson({ "frontend/html-css": { visited: done - 10 * MIN, done: done - 5 * MIN }, "frontend/javascript": { done } }));

  // challenge solves + attempts
  seedSolve(w.db, { challenge: "flag-basic", user: "stu-alpha", points: 100, at: sql(T0 - DAY), minutes: 10 });
  seedSolve(w.db, { challenge: "flag-basic", user: "stu-beta", points: 100, at: sql(T0 - DAY), minutes: 30 });
  seedSolve(w.db, { challenge: "flag-basic", user: "stu-gamma", points: 100, at: sql(T0 - 50 * DAY), minutes: 1000 });
  for (const [u, c, ok, at] of [["stu-alpha", "flag-basic", 0, T0 - DAY], ["stu-alpha", "flag-basic", 1, T0 - DAY], ["stu-beta", "flag-basic", 1, T0 - DAY], ["stu-beta", "flag-ci", 0, T0 - DAY], ["stu-gamma", "flag-basic", 1, T0 - 50 * DAY]] as const) {
    w.db.insert("INSERT INTO challenge_attempts (user_id, challenge_id, correct, at) VALUES (?, ?, ?, ?)", u, c, ok, sql(at));
  }
  return { w, teacher: await w.token("teacher") };
}

const analytics = (w: World, token: string | null, qs = "") => w.api<InstructorAnalytics & { error?: string }>(`/api/instructor/analytics${qs}`, { token });
const exercise = (r: InstructorAnalytics, key: string) => r.exercises.find((e) => e.exercise === key);

test("runs: totals, successes, by language and by status over the window", async () => {
  const { w, teacher } = await seededWorld();
  const r = await analytics(w, teacher);
  assert.equal(r.status, 200);
  assert.equal(r.body.days, 30);
  assert.equal(r.body.generatedAt, new Date(T0).toISOString());
  // 8 runs of ex1 (the 40-day-old one is out) + ex2 + the challenge run + the free run
  assert.equal(r.body.runs.total, 11);
  assert.equal(r.body.runs.success, 5);
  assert.deepEqual(r.body.runs.byLang, { python: 8, c: 1, javascript: 1, go: 1 });
  assert.deepEqual(r.body.runs.byStatus, { ok: 5, runtime_error: 2, compile_error: 1, internal_error: 1, unsupported: 1, timeout: 1 });
});

test("exercises: attempts, learners, pass rate, median run time, failure buckets, common first errors", async () => {
  const { w, teacher } = await seededWorld();
  const r = await analytics(w, teacher);
  assert.deepEqual(r.body.exercises.map((e) => e.exercise), ["cyber-security/setup/ex1", "challenge:out-sum", "frontend/html-css/ex2"], "most attempted first, ties by key");
  const ex1 = exercise(r.body, "cyber-security/setup/ex1");
  assert.ok(ex1);
  assert.equal(ex1.attempts, 6, "infrastructure outcomes and out-of-window runs are not attempts");
  assert.equal(ex1.learners, 3);
  assert.equal(ex1.passRate, 0.333, "1 of 3 learners passed");
  assert.equal(ex1.medianRunMs, 30, "median of 10, 20, 30, 40, 50 (runs without a time are skipped)");
  assert.deepEqual(ex1.failures, { wrong_output: 2, runtime_error: 2, compile_error: 1 });
  assert.deepEqual(ex1.commonErrors, [{ text: "NameError: foo", count: 2 }, { text: "main.c:1: error: x", count: 1 }]);
  const ch = exercise(r.body, "challenge:out-sum");
  assert.deepEqual({ ...ch, failures: { ...ch?.failures } }, { exercise: "challenge:out-sum", attempts: 1, learners: 1, passRate: 0, medianRunMs: 5000, failures: { timeout: 1 }, commonErrors: [] });
  assert.equal(exercise(r.body, "frontend/html-css/ex2")?.passRate, 1);
});

test("the days window moves what is counted; days is clamped to 365 and validated", async () => {
  const { w, teacher } = await seededWorld();
  const wide = await analytics(w, teacher, "?days=60");
  assert.equal(wide.body.runs.total, 12, "the 40-day-old run is inside 60 days");
  assert.equal(wide.body.runs.success, 6);
  const wideEx = exercise(wide.body, "cyber-security/setup/ex1");
  assert.deepEqual([wideEx?.attempts, wideEx?.learners, wideEx?.passRate], [7, 4, 0.5]);
  assert.equal((await analytics(w, teacher, "?days=1")).body.runs.total, 11, "the window boundary is inclusive");
  w.clock.now += 60 * MIN;
  const narrow = await analytics(w, teacher, "?days=1");
  assert.equal(narrow.body.runs.total, 0, "runs older than the window are left out");
  assert.equal((await analytics(w, teacher, "?days=9999")).body.days, 365);
  for (const bad of ["0", "-3", "abc", "1.5", "99999", "30d"]) assert.equal((await analytics(w, teacher, `?days=${bad}`)).status, 400, bad);
  assert.equal((await analytics(w, teacher, "?days=")).body.days, 30);
});

test("tracks: learners, completers, completion rate and median minutes first visit → last completion", async () => {
  const { w, teacher } = await seededWorld();
  const r = await analytics(w, teacher);
  assert.deepEqual(r.body.tracks.map((t) => t.track), ["cyber-security", "frontend"], "lesson-less tracks are not listed");
  assert.deepEqual({ ...r.body.tracks[0] }, { track: "cyber-security", learners: 3, completed: 1, completionRate: 0.333, medianMinutesToComplete: 90 });
  assert.deepEqual({ ...r.body.tracks[1] }, { track: "frontend", learners: 1, completed: 1, completionRate: 1, medianMinutesToComplete: 10 });
});

test("challenges: solves and attempts inside the window and the median minutes to solve", async () => {
  const { w, teacher } = await seededWorld();
  const r = await analytics(w, teacher);
  assert.equal(r.body.challenges.length, 7, "every public challenge is listed");
  const basic = r.body.challenges.find((c) => c.id === "flag-basic");
  assert.deepEqual({ ...basic }, { id: "flag-basic", solves: 2, attempts: 3, medianMinutesToSolve: 20 });
  assert.deepEqual({ ...r.body.challenges.find((c) => c.id === "flag-ci") }, { id: "flag-ci", solves: 0, attempts: 1 });
  const wide = await analytics(w, teacher, "?days=90");
  assert.deepEqual({ ...wide.body.challenges.find((c) => c.id === "flag-basic") }, { id: "flag-basic", solves: 3, attempts: 4, medianMinutesToSolve: 30 });
});

test("anonymised: no user ids, usernames, names or emails anywhere in the payload", async () => {
  const { w, teacher } = await seededWorld();
  const wire = JSON.stringify((await analytics(w, teacher)).body);
  for (const leak of ["stu-alpha", "stu-beta", "stu-gamma", "stu-delta", "name-stu", "Real stu", "@private.example", "teacher"]) assert.ok(!wire.includes(leak), leak);
});

test("empty database: zeros everywhere, never an error", async () => {
  const w = await makeWorld();
  await w.addUser({ sub: "root", role: "admin" });
  const r = await analytics(w, await w.token("root"));
  assert.equal(r.status, 200);
  assert.deepEqual({ total: r.body.runs.total, ex: r.body.exercises.length }, { total: 0, ex: 0 });
  assert.ok(r.body.tracks.every((t) => t.learners === 0 && t.completionRate === 0 && t.medianMinutesToComplete === undefined));
});

test("bounded: at most 200 exercises are returned, most attempted first", async () => {
  const w = await makeWorld();
  await w.addUser({ sub: "root", role: "admin" });
  for (let i = 0; i < 210; i++) seedRun(w, { user: "x", status: "ok", exercise: `cyber-security/setup/e${String(i).padStart(3, "0")}`, passed: 1, runMs: 1 });
  for (let i = 0; i < 3; i++) seedRun(w, { user: "x", status: "ok", exercise: "cyber-security/setup/busy", passed: 1, runMs: 1 });
  const r = await analytics(w, await w.token("root"));
  assert.equal(r.body.exercises.length, 200);
  assert.equal(r.body.exercises[0].exercise, "cyber-security/setup/busy");
});

test("role gating: anonymous 401, student 403, instructor and admin allowed", async () => {
  const { w, teacher } = await seededWorld();
  await w.addUser({ sub: "root", role: "admin" });
  assert.equal((await analytics(w, null)).status, 401);
  assert.equal((await analytics(w, await w.token("stu-alpha"))).status, 403);
  assert.equal((await analytics(w, await w.token("not-a-user"))).status, 403, "unknown accounts are plain students");
  assert.equal((await analytics(w, teacher)).status, 200);
  assert.equal((await analytics(w, await w.token("root"))).status, 200);
  assert.equal((await w.api("/api/instructor/analytics", { method: "POST", token: teacher, body: {} })).status, 405);
});

test("admin audit: admin only, newest first, limit validated and capped", async () => {
  const { w, teacher } = await seededWorld();
  await w.addUser({ sub: "root", role: "admin" });
  for (let i = 0; i < 600; i++) w.db.insert("INSERT INTO audit_log (at, user_id, action, detail) VALUES (?, ?, ?, ?)", sql(T0 - (600 - i) * MIN), i % 2 ? "stu-beta" : null, i % 2 ? "abuse.signal" : "role.change", `entry ${i}`);
  const audit = (token: string | null, qs = "") => w.api<AuditEntry[] & { error?: string }>(`/api/admin/audit${qs}`, { token });

  assert.equal((await audit(null)).status, 401);
  assert.equal((await audit(await w.token("stu-alpha"))).status, 403);
  assert.equal((await audit(teacher)).status, 403, "instructors can read analytics but not the audit log");
  const root = await w.token("root");
  const def = await audit(root);
  assert.equal(def.status, 200);
  assert.equal(def.body.length, 100);
  assert.equal(def.body[0].detail, "entry 599");
  assert.deepEqual({ ...def.body[0] }, { id: 600, at: new Date(T0 - MIN).toISOString(), userId: "stu-beta", action: "abuse.signal", detail: "entry 599" });
  assert.equal(def.body[1].userId, undefined, "system entries have no user");
  assert.equal((await audit(root, "?limit=5")).body.length, 5);
  assert.equal((await audit(root, "?limit=9999")).body.length, 500);
  for (const bad of ["0", "-1", "x", "1.5", "99999"]) assert.equal((await audit(root, `?limit=${bad}`)).status, 400, bad);
});
