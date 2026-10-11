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
