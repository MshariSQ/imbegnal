import { test } from "node:test";
import assert from "node:assert/strict";
import { fmt, plural } from "../../lib/ctf/format";
import { absoluteDate, formatCountdown, formatDuration, formatNumber, relativeTime } from "../../lib/ctf/time";
import { awardAfterNextHint, clampCount, hintsCost, remainingAward } from "../../lib/ctf/points";
import { classifyFailure, loginHref } from "../../lib/ctf/errors";
import { CtfApiError } from "../../lib/ctf/api";

const NOW = Date.parse("2026-06-01T12:00:00Z");
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const H = 3600_000;

test("relativeTime in English", () => {
  assert.equal(relativeTime(ago(10_000), NOW, "en"), "now");
  assert.equal(relativeTime(ago(5 * 60_000), NOW, "en"), "5 minutes ago");
  assert.equal(relativeTime(ago(2 * H), NOW, "en"), "2 hours ago");
  assert.equal(relativeTime(ago(26 * H), NOW, "en"), "yesterday");
  assert.equal(relativeTime(ago(3 * 24 * H), NOW, "en"), "3 days ago");
  assert.equal(relativeTime(ago(14 * 24 * H), NOW, "en"), "2 weeks ago");
  assert.equal(relativeTime(ago(70 * 24 * H), NOW, "en"), "2 months ago");
  assert.equal(relativeTime(ago(800 * 24 * H), NOW, "en"), "2 years ago");
});

test("relativeTime in Arabic uses Arabic words with Latin digits", () => {
  const out = relativeTime(ago(5 * 60_000), NOW, "ar");
  assert.match(out, /5/);
  assert.match(out, /[؀-ۿ]/);
  assert.doesNotMatch(out, /[٠-٩]/);
  assert.match(relativeTime(ago(3 * 24 * H), NOW, "ar"), /3/);
});

test("relativeTime clamps the future and tolerates junk", () => {
  assert.equal(relativeTime(new Date(NOW + 5 * H).toISOString(), NOW, "en"), "now");
  assert.equal(relativeTime("not a date", NOW, "en"), "");
});

test("absoluteDate is deterministic", () => {
  assert.equal(absoluteDate("2026-02-01T10:00:00Z"), "2026-02-01");
  assert.equal(absoluteDate("garbage"), "");
});

test("formatDuration", () => {
  const u = { h: "h", min: "min" };
  assert.equal(formatDuration(45, u), "45 min");
  assert.equal(formatDuration(90, u), "1 h 30 min");
  assert.equal(formatDuration(120, u), "2 h");
  assert.equal(formatDuration(0, u), "1 min");
  assert.equal(formatDuration(0.4, u), "1 min");
  assert.equal(formatDuration(59.6, u), "1 h");
});

test("formatCountdown and formatNumber", () => {
  assert.equal(formatCountdown(75), "1:15");
  assert.equal(formatCountdown(9.2), "0:10");
  assert.equal(formatCountdown(-3), "0:00");
  assert.equal(formatNumber(1250), "1,250");
  assert.equal(formatNumber(0), "0");
});

test("fmt interpolates known keys and leaves unknown placeholders visible", () => {
  assert.equal(fmt("{a} of {b}", { a: 1, b: "x" }), "1 of x");
  assert.equal(fmt("{a} {missing}", { a: 2 }), "2 {missing}");
});

test("plural picks CLDR forms per language", () => {
  const forms = { zero: "no solves", one: "{n} solve", two: "two solves", few: "{n} solves (few)", many: "{n} solves (many)", other: "{n} solves" };
  assert.equal(plural(forms, 1, "en"), "1 solve");
  assert.equal(plural(forms, 5, "en"), "5 solves");
  assert.equal(plural(forms, 0, "en"), "0 solves");
  assert.equal(plural(forms, 0, "ar"), "no solves");
  assert.equal(plural(forms, 2, "ar"), "two solves");
  assert.equal(plural(forms, 4, "ar"), "4 solves (few)");
  assert.equal(plural(forms, 11, "ar"), "11 solves (many)");
  assert.equal(plural({ one: "{n} item", other: "{n} items" }, 100, "ar"), "100 items");
});

test("hint points math", () => {
  const hints = [{ cost: 5 }, { cost: 10 }, { cost: 20 }];
  assert.equal(hintsCost(hints, 0), 0);
  assert.equal(hintsCost(hints, 2), 15);
  assert.equal(hintsCost(hints, 99), 35);
  assert.equal(hintsCost(hints, -4), 0);
  assert.equal(remainingAward(50, hints, 2), 35);
  assert.equal(remainingAward(30, hints, 3), 0); // never negative
  assert.equal(awardAfterNextHint(50, hints, 1), 35);
  assert.equal(awardAfterNextHint(50, hints, 3), null);
  assert.equal(hintsCost([{ cost: -5 }], 1), 0);
});

test("clampCount defends against odd stats", () => {
  assert.equal(clampCount(undefined, 3), 0);
  assert.equal(clampCount(9, 3), 3);
  assert.equal(clampCount(-1, 3), 0);
  assert.equal(clampCount(1.9, 3), 1);
});

test("classifyFailure maps API errors to UI situations", () => {
  assert.deepEqual(classifyFailure(new CtfApiError(401, "unauthorized")), { kind: "signin" });
  assert.deepEqual(classifyFailure(new CtfApiError(429, "rate_limited", { retryAfterSec: 30 })), { kind: "rate", retryAfterSec: 30 });
  assert.deepEqual(classifyFailure(new CtfApiError(429, "rate_limited", {}, 12)), { kind: "rate", retryAfterSec: 12 });
  assert.equal(classifyFailure(new CtfApiError(429, "quota_exceeded")).kind, "quota");
  assert.equal(classifyFailure(new CtfApiError(403, "account_suspended")).kind, "suspended");
  assert.equal(classifyFailure(new CtfApiError(403, "forbidden")).kind, "forbidden");
  assert.equal(classifyFailure(new CtfApiError(503, "runner_unavailable")).kind, "runner");
  assert.equal(classifyFailure(new CtfApiError(400, "invalid_request")).kind, "invalid");
  assert.equal(classifyFailure(new CtfApiError(404, "not_found")).kind, "notfound");
  assert.equal(classifyFailure(new CtfApiError(0, "network")).kind, "network");
  assert.equal(classifyFailure(new Error("boom")).kind, "generic");
  assert.equal(classifyFailure(new CtfApiError(500, "error")).kind, "generic");
});

test("CtfApiError ignores invalid retry-after values", () => {
  assert.equal(new CtfApiError(429, "rate_limited", { retryAfterSec: -1 }).retryAfterSec, undefined);
  assert.equal(new CtfApiError(429, "rate_limited", undefined, Number.NaN).retryAfterSec, undefined);
});

test("loginHref encodes the return path", () => {
  assert.equal(loginHref("/challenges/x/?a=1"), "/login/?next=%2Fchallenges%2Fx%2F%3Fa%3D1");
});
