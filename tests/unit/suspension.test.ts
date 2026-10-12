import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatSuspensionEnd, suspensionMessage, suspensionOf } from "../../lib/suspension";

const UNTIL = "2026-11-20T09:30:00.000Z";
const copy = { open: "Suspended.", until: "Suspended until {date}." };

describe("suspensionOf", () => {
  it("reads 403 account_suspended, with `until` only when it is a date", () => {
    assert.deepEqual(suspensionOf(403, { error: "account_suspended", message: "x", until: UNTIL }), { until: UNTIL });
    assert.deepEqual(suspensionOf(403, { error: "account_suspended", message: "x" }), {});
    assert.deepEqual(suspensionOf(403, { error: "account_suspended", until: "soon" }), {});
    assert.deepEqual(suspensionOf(403, { error: "account_suspended", until: 5 }), {});
  });

  it("is null for every other answer", () => {
    assert.equal(suspensionOf(403, { error: "not_eligible" }), null);
    assert.equal(suspensionOf(403, { error: "forbidden" }), null);
    assert.equal(suspensionOf(409, { error: "account_suspended" }), null, "DELETE /api/account's 409 is its own case");
    assert.equal(suspensionOf(401, { error: "account_suspended" }), null);
    assert.equal(suspensionOf(403, null), null);
    assert.equal(suspensionOf(403, "account_suspended"), null);
  });
});

describe("suspensionMessage", () => {
  it("fills the end date in the reader's language, or uses the open-ended copy", () => {
    const en = suspensionMessage({ until: UNTIL }, copy, "en");
    assert.match(en, /^Suspended until .*2026.*\.$/);
    assert.ok(en.includes(formatSuspensionEnd(UNTIL, "en")));
    const ar = suspensionMessage({ until: UNTIL }, copy, "ar");
    assert.ok(ar.includes(formatSuspensionEnd(UNTIL, "ar")));
    assert.match(formatSuspensionEnd(UNTIL, "ar"), /2026/, "Latin digits in Arabic too");
    assert.equal(suspensionMessage({}, copy, "en"), "Suspended.");
    assert.equal(suspensionMessage({ until: "nonsense" }, copy, "en"), "Suspended.");
  });
});

// Every screen a suspended account can be refused on shows the same end date: the certificate card and the
// AI tutor did, while hints, flag/code submissions, Code Lab and the instructor page dropped `until`.
describe("the end date reaches every screen", () => {
  it("challenges (hints, submissions, instructor analytics): classifyFailure keeps `until`", async () => {
    const { CtfApiError } = await import("../../lib/ctf/api");
    const { classifyFailure } = await import("../../lib/ctf/errors");
    assert.deepEqual(classifyFailure(new CtfApiError(403, "account_suspended", { error: "account_suspended", message: "x", until: UNTIL } as never)), { kind: "suspended", until: UNTIL });
    assert.deepEqual(classifyFailure(new CtfApiError(403, "account_suspended", { error: "account_suspended" })), { kind: "suspended" });
  });

  it("Code Lab: the problem names the end date, and the copy no longer blames 'unusual activity'", async () => {
    const { codelabAr, codelabEn } = await import("../../lib/i18n-codelab");
    const { LabApiError } = await import("../../lib/codelab/api-error");
    const { describeError } = await import("../../lib/codelab/errors");
    const base = { langLabel: "Python", signedIn: true, browserFallback: false, quota: null, now: Date.parse("2026-11-01T00:00:00Z") };
    for (const [lang, dict] of [["en", codelabEn], ["ar", codelabAr]] as const) {
      const ctx = { ...base, tx: dict.codelab as never, locale: lang === "ar" ? "ar-u-ca-gregory-nu-latn" : "en-US" };
      const until = describeError(new LabApiError(403, "account_suspended", { error: "account_suspended", until: UNTIL } as never), ctx);
      assert.equal(until.kind, "suspended");
      assert.ok(until.body.includes(formatSuspensionEnd(UNTIL, lang)), `${lang}: ${until.body}`);
      const open = describeError(new LabApiError(403, "account_suspended", { error: "account_suspended" } as never), ctx);
      assert.ok(!open.body.includes("{date}") && !/2026/.test(open.body), `${lang}: open-ended`);
      for (const body of [until.body, open.body]) assert.doesNotMatch(body, /unusual activity|نشاط غير معتاد/, `${lang}: neutral about the cause`);
    }
  });

  it("every suspension notice has an EN and AR 'until {date}' variant", async () => {
    const { ctfAr, ctfEn } = await import("../../lib/i18n-ctf");
    const { phase3Ar, phase3En } = await import("../../lib/i18n-phase3");
    const { codelabAr, codelabEn } = await import("../../lib/i18n-codelab");
    for (const [ctf, phase3, codelab] of [[ctfEn, phase3En, codelabEn], [ctfAr, phase3Ar, codelabAr]] as const) {
      for (const s of [ctf.ctf.hints.suspendedUntil, ctf.ctf.errors.suspendedUntil, phase3.instructor.suspended.bodyUntil, codelab.codelab.problems.suspendedBodyUntil]) {
        assert.match(s, /\{date\}/);
      }
    }
  });
});
