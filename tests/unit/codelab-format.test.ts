import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fill,
  formatBytes,
  formatDuration,
  formatResetTime,
  intlLocale,
  secondsUntil,
  statusTone,
  stripAnsi,
  timeAgo,
  truncateForDisplay,
} from "../../lib/codelab/format";

const labels = { ms: "{n} ms", sec: "{n} s" };

test("fill replaces known placeholders and leaves unknown ones", () => {
  assert.equal(fill("{a} of {b} {c}", { a: 1, b: "x" }), "1 of x {c}");
});

test("durations use ms below a second and one decimal below ten seconds", () => {
  assert.equal(formatDuration(0, labels), "0 ms");
  assert.equal(formatDuration(420.4, labels), "420 ms");
  assert.equal(formatDuration(1300, labels), "1.3 s");
  assert.equal(formatDuration(12_400, labels), "12 s");
  assert.equal(formatDuration(-5, labels), "0 ms");
});

test("byte sizes", () => {
  assert.equal(formatBytes(12), "12 B");
  assert.equal(formatBytes(2048), "2 KiB");
  assert.equal(formatBytes(3 * 1024 * 1024), "3 MiB");
});

test("relative time", () => {
  const now = Date.UTC(2030, 0, 1, 12);
  assert.equal(timeAgo(now - 10_000, now, "en-US", "just now"), "just now");
  assert.equal(timeAgo(now - 5 * 60_000, now, "en-US", "just now"), "5 minutes ago");
  assert.equal(timeAgo(now - 3 * 3600_000, now, "en-US", "just now"), "3 hours ago");
  assert.equal(timeAgo(now - 2 * 86_400_000, now, "en-US", "just now"), "2 days ago");
  assert.match(timeAgo(now - 5 * 60_000, now, intlLocale("ar"), "الآن"), /5/);
});

test("quota reset time is a clock time soon, with a date when far away", () => {
  const now = Date.parse("2030-01-01T10:00:00Z");
  const soon = formatResetTime("2030-01-01T20:00:00Z", now, "en-US");
  assert.match(soon, /^\d{2}:\d{2}$/);
  const later = formatResetTime("2030-01-05T20:00:00Z", now, "en-US");
  assert.match(later, /Jan/);
  assert.equal(formatResetTime("not a date", now, "en-US"), "");
});

test("truncation cuts on a line boundary and never splits a surrogate pair", () => {
  assert.deepEqual(truncateForDisplay("short", 100), { text: "short", shown: 5, total: 5, truncated: false });
  const lines = Array.from({ length: 50 }, (_, i) => `line ${i}`).join("\n");
  const t = truncateForDisplay(lines, 100);
  assert.ok(t.truncated);
  assert.ok(t.text.length <= 100);
  assert.ok(lines.startsWith(t.text));
  assert.ok(!t.text.endsWith("\n") || t.text.length === t.shown);
  const emoji = "a".repeat(9) + "😀" + "b".repeat(20);
  const e = truncateForDisplay(emoji, 10);
  assert.equal(e.text, "a".repeat(9));
  assert.equal(e.total, emoji.length);
});

test("status tones", () => {
  assert.equal(statusTone("ok"), "ok");
  assert.equal(statusTone("timeout"), "warn");
  assert.equal(statusTone("memory_limit"), "warn");
  assert.equal(statusTone("compile_error"), "error");
  assert.equal(statusTone("runtime_error"), "error");
  assert.equal(statusTone("internal_error"), "error");
});

test("seconds until never goes negative; ANSI colours are stripped", () => {
  assert.equal(secondsUntil(10_500, 10_000), 1);
  assert.equal(secondsUntil(9_000, 10_000), 0);
  assert.equal(stripAnsi("\u001b[31mred\u001b[0m text"), "red text");
});
