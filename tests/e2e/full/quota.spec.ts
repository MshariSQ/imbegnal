// Quota enforcement with clear errors, and refunds when the failure is not the user's.
// The E2E Worker runs with RUN_DAILY_LIMIT_FREE=12 (tests/e2e/run.mjs).
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { SITE, api, closeBrowser, newUser, openSession } from "./stack";
import type { QuotaError, QuotaInfo, RunApiResponse } from "../../../shared/api";

after(closeBrowser);

describe("quotas", { timeout: 300_000 }, () => {
  it("counts runs, refuses the 13th with quota_exceeded, and the UI explains it", async () => {
    const user = await newUser("quota");
    const before = await api<QuotaInfo>("/api/lab/quota", user);
    assert.equal(before.body.limit, 12);
    assert.equal(before.body.used, 0);

    for (let i = 0; i < 12; i++) {
      const r = await api<RunApiResponse>("/api/lab/run", user, { body: { lang: "python", code: `print(${i})` } });
      assert.equal(r.status, 200, `run ${i + 1}: ${JSON.stringify(r.body)}`);
      assert.equal(r.body.quota.used, i + 1);
    }
    const over = await api<QuotaError>("/api/lab/run", user, { body: { lang: "python", code: "print('one more')" } });
    assert.equal(over.status, 429);
    assert.equal(over.body.error, "quota_exceeded");
    assert.equal(over.body.scope, "user");
    assert.ok(over.body.resetAt);

    const s = await openSession(user);
    try {
      await s.page.goto(`${SITE}/code-lab/?lang=python`);
      await s.page.waitForSelector(".cm-content");
      await s.page.getByTestId("run-button").first().click();
      await s.page.getByText("Daily run limit reached").first().waitFor({ timeout: 30_000 });
      assert.match(await s.page.locator("body").innerText(), /You’ve used all of today’s server runs/);
    } finally {
      await s.context.close();
    }
  });

  it("does not charge for a language the runner cannot run (refund)", async () => {
    const user = await newUser("refund");
    const langs = await api<{ languages: { id: string; available: boolean }[] }>("/api/lab/languages", null);
    // Swift is the toolchain the slim and full-partial images leave out on purpose.
    const missing = langs.body.languages.find((l) => l.id === "swift" && !l.available) ?? langs.body.languages.find((l) => !l.available);
    if (!missing) return; // every toolchain is installed in this image: nothing to refund
    const r = await api<RunApiResponse & { error?: string }>("/api/lab/run", user, { body: { lang: missing.id, code: "x" } });
    const q = await api<QuotaInfo>("/api/lab/quota", user);
    assert.equal(q.body.used, 0, `unsupported ${missing.id} (HTTP ${r.status} ${JSON.stringify(r.body).slice(0, 300)}) must not consume quota`);
  });

  it("rejects unauthenticated runs", async () => {
    const r = await api<{ error: string }>("/api/lab/run", null, { body: { lang: "python", code: "print(1)" } });
    assert.equal(r.status, 401);
  });
});
