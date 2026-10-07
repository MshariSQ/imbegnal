import { test } from "node:test";
import assert from "node:assert/strict";
import type { ExerciseAnalytics, InstructorAnalytics } from "../../shared/api";
import {
  activeChallenges,
  barRows,
  formatCount,
  formatPercent,
  humanizeKey,
  normalizeAnalytics,
  parseExerciseRef,
  sortExercisesByPassRate,
  successRate,
  topFailures,
  totalChallengeSolves,
  totalCompletions,
} from "../../lib/instructor/analytics";

const ex = (exercise: string, passRate: number, attempts: number): ExerciseAnalytics => ({ exercise, attempts, learners: 3, passRate, medianRunMs: 100, failures: {}, commonErrors: [] });

test("exercises sort hardest first, ties by attempts then ref, without mutating the input", () => {
  const input = [ex("b/l/x", 0.9, 10), ex("a/l/x", 0.2, 5), ex("c/l/x", 0.2, 50), ex("a/l/w", 0.2, 5), ex("d/l/x", 0, 1)];
  const copy = structuredClone(input);
  assert.deepEqual(sortExercisesByPassRate(input).map((e) => e.exercise), ["d/l/x", "c/l/x", "a/l/w", "a/l/x", "b/l/x"]);
  assert.deepEqual(input, copy);
  assert.deepEqual(sortExercisesByPassRate([]), []);
});

test("barRows sorts by count, shares add up to 1 and junk is dropped", () => {
  const rows = barRows({ python: 30, go: 10, java: 10, rust: 0, c: -4, cpp: Number.NaN });
  assert.deepEqual(rows.map((r) => r.key), ["python", "go", "java"]);
  assert.deepEqual(rows.map((r) => r.count), [30, 10, 10]);
  assert.equal(rows[0].share, 0.6);
  assert.ok(Math.abs(rows.reduce((s, r) => s + r.share, 0) - 1) < 1e-9);
  assert.deepEqual(barRows({}), []);
  assert.deepEqual(barRows({ a: 0 }), []);
});

test("topFailures keeps the most frequent reasons", () => {
  const f = { compile_error: 12, wrong_output: 30, timeout: 2, runtime_error: 7 };
  assert.deepEqual(topFailures(f).map((r) => r.key), ["wrong_output", "compile_error", "runtime_error"]);
  assert.deepEqual(topFailures(f, 1).map((r) => r.key), ["wrong_output"]);
  assert.deepEqual(topFailures({}), []);
});

test("parseExerciseRef understands lesson and challenge refs", () => {
  assert.deepEqual(parseExerciseRef("frontend/html-basics/hello"), { kind: "lesson", track: "frontend", lesson: "html-basics", exercise: "hello" });
  assert.deepEqual(parseExerciseRef("challenge:caesar-warmup"), { kind: "challenge", id: "caesar-warmup" });
  assert.deepEqual(parseExerciseRef("challenge:"), { kind: "other", ref: "challenge:" });
  assert.deepEqual(parseExerciseRef("a/b"), { kind: "other", ref: "a/b" });
  assert.deepEqual(parseExerciseRef("a//c"), { kind: "other", ref: "a//c" });
  assert.deepEqual(parseExerciseRef("a/b/c/d"), { kind: "other", ref: "a/b/c/d" });
});

test("successRate is null without runs and clamped otherwise", () => {
  assert.equal(successRate({ total: 0, success: 0 }), null);
  assert.equal(successRate({ total: 4, success: 3 }), 0.75);
  assert.equal(successRate({ total: 4, success: 9 }), 1);
});

test("activeChallenges drops idle ones, orders by attempts and counts the idle tail", () => {
  const list = [
    { id: "idle-a", solves: 0, attempts: 0 },
    { id: "easy", solves: 40, attempts: 60, medianMinutesToSolve: 5 },
    { id: "hard", solves: 2, attempts: 90 },
    { id: "alpha", solves: 1, attempts: 60 },
    { id: "idle-b", solves: 0, attempts: 0 },
  ];
  const { rows, idle } = activeChallenges(list);
  assert.deepEqual(rows.map((r) => r.id), ["hard", "easy", "alpha"]);
  assert.equal(idle, 2);
  assert.deepEqual(activeChallenges([]), { rows: [], idle: 0 });
});

test("totals", () => {
  assert.equal(totalChallengeSolves([{ id: "a", solves: 3, attempts: 5 }, { id: "b", solves: 4, attempts: 4 }]), 7);
  const tracks: InstructorAnalytics["tracks"] = [
    { track: "frontend", learners: 10, completed: 4, completionRate: 0.4 },
    { track: "devops", learners: 5, completed: 0, completionRate: 0 },
  ];
  assert.equal(totalCompletions(tracks), 4);
  assert.equal(totalCompletions([]), 0);
});

test("formatPercent and formatCount use Latin digits in both languages", () => {
  assert.equal(formatPercent(0.5, "en"), "50%");
  assert.equal(formatPercent(0.6667, "en"), "66.7%");
  assert.equal(formatPercent(0, "en"), "0%");
  assert.equal(formatPercent(null, "en"), "—");
  assert.equal(formatPercent(Number.NaN, "ar"), "—");
  assert.match(formatPercent(0.6667, "ar"), /^66[.٫]7/);
  assert.doesNotMatch(formatPercent(0.6667, "ar"), /[٠-٩]/);
  assert.equal(formatCount(1234567, "en"), "1,234,567");
  assert.match(formatCount(1234567, "ar"), /^1.234.567$/);
  assert.doesNotMatch(formatCount(1234567, "ar"), /[٠-٩]/);
  assert.equal(formatCount(Number.NaN, "en"), "0");
});

test("humanizeKey", () => {
  assert.equal(humanizeKey("wrong_output"), "Wrong output");
  assert.equal(humanizeKey("out-of-memory"), "Out of memory");
  assert.equal(humanizeKey(""), "");
});

test("normalizeAnalytics passes a well-formed payload through unchanged", () => {
  const payload: InstructorAnalytics = {
    generatedAt: "2026-06-15T10:00:00.000Z",
    days: 30,
    runs: { total: 10, success: 7, byLang: { python: 6, go: 4 }, byStatus: { ok: 7, timeout: 3 } },
    tracks: [{ track: "frontend", learners: 5, completed: 2, completionRate: 0.4, medianMinutesToComplete: 12.5 }],
    exercises: [{ exercise: "frontend/a/b", attempts: 9, learners: 3, passRate: 0.5, medianRunMs: 120, failures: { wrong_output: 4 }, commonErrors: [{ text: "boom", count: 2 }] }],
    challenges: [{ id: "caesar-warmup", solves: 1, attempts: 3, medianMinutesToSolve: 4 }],
  };
  assert.deepEqual(normalizeAnalytics(JSON.parse(JSON.stringify(payload))), payload);
});

test("normalizeAnalytics turns a partial or hostile answer into safe empty blocks", () => {
  assert.equal(normalizeAnalytics(null), null);
  assert.equal(normalizeAnalytics("oops"), null);
  assert.equal(normalizeAnalytics([]), null);
  assert.equal(normalizeAnalytics({}), null);
  assert.equal(normalizeAnalytics({ runs: 5 }), null);
  const partial = normalizeAnalytics({
    runs: { total: "12", success: 3, byLang: { python: 2, bad: "x", worse: null }, byStatus: [] },
    tracks: [{ track: "" }, { track: "devops", learners: 2 }, 7, null],
    exercises: [{ exercise: "a/b/c", commonErrors: [{ text: "", count: 1 }, { text: "ok", count: 2 }, "junk"], failures: { timeout: Number.NaN } }, { attempts: 4 }],
    challenges: "nope",
  });
  assert.ok(partial);
  assert.equal(partial.runs.total, 0, "non-numeric totals become 0");
  assert.deepEqual(partial.runs.byLang, { python: 2 });
  assert.deepEqual(partial.runs.byStatus, {});
  assert.deepEqual(partial.tracks, [{ track: "devops", learners: 2, completed: 0, completionRate: 0, medianMinutesToComplete: undefined }]);
  assert.equal(partial.exercises.length, 1);
  assert.deepEqual(partial.exercises[0].commonErrors, [{ text: "ok", count: 2 }]);
  assert.deepEqual(partial.exercises[0].failures, {});
  assert.deepEqual(partial.challenges, []);
});
