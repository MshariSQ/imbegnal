import { test } from "node:test";
import assert from "node:assert/strict";
import { codelabAr, codelabEn } from "../../lib/i18n-codelab";
import { LabApiError } from "../../lib/codelab/api-error";
import { RuntimeLoadError, describeError, describeRunStatus, type ErrorContext } from "../../lib/codelab/errors";
import { RUNNER_DEFAULTS } from "../../shared/protocol";
import type { RunStatus } from "../../shared/protocol";
import type { Tx } from "../../lib/i18n";

const en = codelabEn.codelab as unknown as Tx["codelab"];
const ar = codelabAr.codelab as unknown as Tx["codelab"];
const NOW = Date.parse("2030-01-01T10:00:00Z");

const ctx = (over: Partial<ErrorContext> = {}): ErrorContext => ({
  tx: en,
  locale: "en-US",
  langLabel: "Rust",
  signedIn: true,
  browserFallback: false,
  quota: null,
  now: NOW,
  ...over,
});

test("401 for a guest asks to sign in, naming the language and offering the browser when it has one", () => {
  const p = describeError(new LabApiError(401, "unauthorized"), ctx({ signedIn: false }));
  assert.equal(p.kind, "signin");
  assert.match(p.title, /Rust/);
  assert.deepEqual(p.actions, ["signin"]);
  const js = describeError(new LabApiError(401, "unauthorized"), ctx({ signedIn: false, langLabel: "JavaScript", browserFallback: true }));
  assert.deepEqual(js.actions, ["signin", "browser"]);
});

test("401 for a signed-in user means the session expired", () => {
  const p = describeError(new LabApiError(401, "unauthorized"), ctx());
  assert.equal(p.kind, "expired");
  assert.deepEqual(p.actions, ["signin"]);
});

test("each quota scope has its own wording and actions", () => {
  const reset = "2030-01-02T00:00:00Z";
  const user = describeError(new LabApiError(429, "quota_exceeded", { error: "quota_exceeded", scope: "user", resetAt: reset }), ctx({ quota: { plan: "free", used: 50, limit: 50, remaining: 0, resetAt: reset, perMinute: 10 } }));
  assert.equal(user.kind, "quota");
  assert.ok(user.actions.includes("pricing"));
  assert.match(user.body, /resets around/);

  const pro = describeError(new LabApiError(429, "quota_exceeded", { error: "quota_exceeded", scope: "user", resetAt: reset }), ctx({ quota: { plan: "pro", used: 500, limit: 500, remaining: 0, resetAt: reset, perMinute: 30 } }));
  assert.ok(!pro.actions.includes("pricing"));

  const global = describeError(new LabApiError(429, "quota_exceeded", { error: "quota_exceeded", scope: "global" }), ctx({ browserFallback: true }));
  assert.equal(global.kind, "global");
  assert.deepEqual(global.actions, ["browser"]);
  assert.doesNotMatch(global.body, /\{reset\}/);

  const rate = describeError(new LabApiError(429, "rate_limited", { error: "rate_limited", scope: "rate", retryAfterSec: 12.2 }), ctx());
  assert.equal(rate.kind, "rate");
  assert.equal(rate.retryAfterSec, 13);
  assert.ok(rate.actions.includes("retry"));

  const conc = describeError(new LabApiError(429, "quota_exceeded", { error: "quota_exceeded", scope: "concurrency" }), ctx({ maxConcurrent: 2 }));
  assert.equal(conc.kind, "concurrency");
  assert.match(conc.body, /2/);
  assert.equal(conc.retryAfterSec, 3);
});

test("a 429 without a body falls back to the code to pick the scope", () => {
  assert.equal(describeError(new LabApiError(429, "rate_limited"), ctx()).kind, "rate");
  assert.equal(describeError(new LabApiError(429, "http_429"), ctx()).kind, "quota");
});

test("runner down offers the in-browser fallback only when the language has one", () => {
  const withFallback = describeError(new LabApiError(503, "runner_unavailable"), ctx({ browserFallback: true }));
  assert.equal(withFallback.kind, "runner");
  assert.deepEqual(withFallback.actions, ["retry", "browser"]);
  assert.match(withFallback.body, /browser/);
  const without = describeError(new LabApiError(503, "runner_unavailable"), ctx());
  assert.deepEqual(without.actions, ["retry"]);
});

test("suspension, forbidden, not found, invalid and network failures are distinct", () => {
  assert.equal(describeError(new LabApiError(403, "account_suspended"), ctx()).kind, "suspended");
  assert.equal(describeError(new LabApiError(403, "forbidden"), ctx()).kind, "forbidden");
  assert.equal(describeError(new LabApiError(404, "not_found"), ctx()).kind, "not_found");
  assert.equal(describeError(new LabApiError(400, "invalid_request"), ctx()).kind, "invalid");
  const net = describeError(new LabApiError(0, "network"), ctx({ browserFallback: true }));
  assert.equal(net.kind, "network");
  assert.deepEqual(net.actions, ["retry", "browser"]);
  assert.equal(describeError(new LabApiError(0, "timeout"), ctx()).body, en.problems.timeoutBody);
});

test("unexpected failures never leak a stack, only a short detail", () => {
  const p = describeError(new Error("boom"), ctx());
  assert.equal(p.kind, "unknown");
  assert.match(p.body, /boom/);
  const weird = describeError(new LabApiError(500, "http_500"), ctx());
  assert.match(weird.body, /500 http_500/);
  assert.equal(describeError(new RuntimeLoadError("python"), ctx()).kind, "python_load");
});

test("run statuses teach: timeouts name the limit and loops, memory names the cap", () => {
  const t = describeRunStatus("timeout", en);
  assert.match(t.help ?? "", new RegExp(`${RUNNER_DEFAULTS.runTimeoutMs / 1000} s`));
  assert.match(t.help ?? "", /infinite loop/);
  assert.match(describeRunStatus("timeout", en, { limits: { runTimeoutMs: 2500 } }).help ?? "", /2\.5 s/);
  assert.match(describeRunStatus("memory_limit", en).help ?? "", /256 MB/);
  assert.match(describeRunStatus("output_limit", en).help ?? "", /prints? forever|printed far more/);
  assert.equal(describeRunStatus("ok", en).help, null);
  assert.doesNotMatch(describeRunStatus("timeout", en, { browser: true }).help ?? "", /\{/);
});

test("a browser timeout from the Web loop guard names the loop's line, in both languages", () => {
  for (const dict of [en, ar]) {
    const help = describeRunStatus("timeout", dict, { browser: true, line: 12 }).help ?? "";
    assert.match(help, /12/);
    assert.match(help, /5/);
    assert.doesNotMatch(help, /\{\w+\}/);
  }
  assert.match(describeRunStatus("timeout", en, { browser: true, line: 12 }).help ?? "", /loop on line 12 .*longer than 5 s/);
  // Without a line (the watchdog) or on the server, the generic text stays.
  assert.equal(describeRunStatus("timeout", en, { browser: true }).help, describeRunStatus("timeout", en, { browser: true, line: undefined }).help);
  assert.doesNotMatch(describeRunStatus("timeout", en, { line: 12 }).help ?? "", /line 12/);
});

test("every run status and problem string exists in English and Arabic without leftover placeholders", () => {
  const statuses: RunStatus[] = ["ok", "compile_error", "runtime_error", "timeout", "memory_limit", "output_limit", "unsupported", "internal_error"];
  for (const dict of [en, ar]) {
    for (const s of statuses) {
      const d = describeRunStatus(s, dict);
      assert.ok(d.label.length > 0, s);
      if (s !== "ok") assert.ok(d.help && !/\{\w+\}/.test(d.help), `${s}: ${d.help}`);
    }
  }
  assert.notEqual(ar.problems.runnerTitle, en.problems.runnerTitle);
});
