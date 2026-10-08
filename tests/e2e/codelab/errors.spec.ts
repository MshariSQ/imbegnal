import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MockApi,
  bootSuite,
  openLab,
  quotaInfo,
  resultPanel,
  runButton,
  runResult,
  setEditor,
  withPage,
  type MockReply,
  type Suite,
} from "./support";

const failWith = (reply: MockReply) => {
  const api = new MockApi();
  api.run = () => reply;
  return api;
};

const alertText = (page: import("playwright").Page) => page.getByRole("alert").filter({ hasText: /./ }).first();

describe("Code Lab: every failure has its own, actionable message", () => {
  let s: Suite;
  before(async () => void (s = await bootSuite()));
  after(async () => s.close());

  it("guest + server language: asks to sign in (no request is made) and links to /login/?next=", async () => {
    await withPage(s, { signedIn: false }, async (h) => {
      await openLab(h, s.site, "lang=rust");
      await runButton(h.page).click();
      const a = alertText(h.page);
      await a.waitFor();
      assert.match(await a.innerText(), /Sign in to run Rust/);
      const link = a.getByRole("link", { name: "Sign in to continue" });
      const href = (await link.getAttribute("href")) ?? "";
      assert.match(href, /^\/login\/\?next=/);
      assert.equal(decodeURIComponent(href.split("next=")[1]), "/code-lab/?lang=rust");
      assert.equal(h.api.runs.length, 0, "guests never hit the run endpoint for server languages");
    });
  });

  it("a 401 for a signed-in user means the session expired", async () => {
    const api = failWith({ status: 401, body: { error: "unauthorized" } });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site, "lang=go");
      await runButton(h.page).click();
      const a = alertText(h.page);
      await a.waitFor();
      assert.match(await a.innerText(), /session expired/i);
      assert.equal(await a.getByRole("link", { name: "Sign in to continue" }).count(), 1);
    }, api);
  });

  it("daily quota exhausted: reset time, Pro link and the browser alternative for JavaScript", async () => {
    const api = failWith({ status: 429, body: { error: "quota_exceeded", scope: "user", resetAt: "2030-01-02T00:00:00.000Z" } });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site, "lang=javascript");
      await runButton(h.page).click();
      const a = alertText(h.page);
      await a.waitFor();
      const t = await a.innerText();
      assert.match(t, /Daily run limit reached/);
      assert.match(t, /resets/);
      assert.equal(await a.getByRole("link", { name: "See Pro" }).getAttribute("href"), "/pricing/");
      assert.equal(await a.getByRole("button", { name: "Run in my browser instead" }).count(), 1);
    }, api);
  });

  it("the shared server capacity is used up: its own wording, no Pro upsell", async () => {
    const api = failWith({ status: 429, body: { error: "quota_exceeded", scope: "global" } });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site, "lang=java");
      await runButton(h.page).click();
      const a = alertText(h.page);
      await a.waitFor();
      assert.match(await a.innerText(), /at capacity today/);
      assert.equal(await a.getByRole("link", { name: "See Pro" }).count(), 0);
    }, api);
  });

  it("rate limit: counts down and re-enables Try again", async () => {
    const api = failWith({ status: 429, body: { error: "rate_limited", scope: "rate", retryAfterSec: 2 } });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      await runButton(h.page).click();
      const a = alertText(h.page);
      await a.waitFor();
      assert.match(await a.innerText(), /too fast/i);
      const retry = a.getByRole("button", { name: "Try again" });
      assert.equal(await retry.isDisabled(), true);
      assert.match(await a.innerText(), /Try again in [12] s/);
      await h.page.waitForFunction(() => !document.querySelector('[role="alert"] button:disabled'), null, { timeout: 6000 });
      assert.match(await a.innerText(), /run again now/i);
    }, api);
  });

  it("concurrency limit names the number of parallel runs", async () => {
    const api = failWith({ status: 429, body: { error: "quota_exceeded", scope: "concurrency" } });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      await runButton(h.page).click();
      const a = alertText(h.page);
      await a.waitFor();
      assert.match(await a.innerText(), /already in progress/);
      assert.match(await a.innerText(), /2 runs at the same time/);
    }, api);
  });

  it("runner down: refund note, retry, and a real in-browser run for JavaScript", async () => {
    const api = failWith({ status: 503, body: { error: "runner_unavailable" } });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site, "lang=javascript");
      await setEditor(h.page, 'console.log("from the browser fallback");\n');
      await runButton(h.page).click();
      const a = alertText(h.page);
      await a.waitFor();
      const t = await a.innerText();
      assert.match(t, /code runner is unavailable/);
      assert.match(t, /wasn.t counted/);
      await a.getByRole("button", { name: "Run in my browser instead" }).click();
      await resultPanel(h.page).waitFor();
      assert.match(await resultPanel(h.page).innerText(), /from the browser fallback/);
      assert.match(await resultPanel(h.page).innerText(), /Runs in your browser/);
      assert.equal(h.api.runs.length, 1, "only the first attempt reached the server");
    }, api);
  });

  it("runner down for a language without a browser runtime: retry only", async () => {
    const api = failWith({ status: 503, body: { error: "runner_unavailable" } });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site, "lang=rust");
      await runButton(h.page).click();
      const a = alertText(h.page);
      await a.waitFor();
      assert.equal(await a.getByRole("button", { name: "Run in my browser instead" }).count(), 0);
      assert.equal(await a.getByRole("button", { name: "Try again" }).count(), 1);
    }, api);
  });

  it("suspended accounts get a clear message and no retry loop", async () => {
    const api = failWith({ status: 403, body: { error: "account_suspended" } });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      await runButton(h.page).click();
      const a = alertText(h.page);
      await a.waitFor();
      assert.match(await a.innerText(), /Account suspended/);
      assert.equal(await a.getByRole("button").count(), 0);
    }, api);
  });

  it("an unreachable network is reported, with retry", async () => {
    const api = new MockApi();
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      await h.page.route(/\/api\/lab\/run$/, (route) => route.abort("failed"));
      await runButton(h.page).click();
      const a = alertText(h.page);
      await a.waitFor();
      assert.match(await a.innerText(), /Can.t reach the server/);
      assert.equal(await a.getByRole("button", { name: "Try again" }).isEnabled(), true);
    }, api);
  });

  it("a language the runner reports as unavailable disables Run and says why", async () => {
    const api = new MockApi();
    api.languages = { runner: "up", languages: [{ id: "swift", available: false }, { id: "python", available: true }] };
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site, "lang=swift");
      await h.page.getByTestId("unavailable-note").waitFor();
      assert.equal(await runButton(h.page).isDisabled(), true);
      assert.match(await h.page.getByTestId("unavailable-note").innerText(), /Swift isn.t available on this server/);
      await h.page.getByTestId("lang-trigger").click();
      assert.match(await h.page.locator('[data-lang="swift"]').innerText(), /Not available on this server/);
    }, api);
  });

  it("unsupported status from the runner is explained", async () => {
    const api = new MockApi();
    api.run = () => ({ runId: "r", result: runResult({ status: "unsupported", exitCode: null, stdout: "" }), quota: quotaInfo() });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site, "lang=kotlin");
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();
      assert.match(await resultPanel(h.page).innerText(), /isn.t installed on the runner/);
    }, api);
  });

  it("low quota nudges towards Pro; Pro users get no nudge", async () => {
    const low = new MockApi();
    low.quota = quotaInfo({ used: 48, remaining: 2 });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      const q = h.page.getByTestId("quota");
      await q.waitFor();
      assert.match(await q.innerText(), /2 of 50 runs left today/);
      assert.equal(await q.getByRole("link", { name: "Pro raises the daily limit." }).getAttribute("href"), "/pricing/");
    }, low);
    const pro = new MockApi();
    pro.quota = quotaInfo({ plan: "pro", used: 498, remaining: 2, limit: 500 });
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      const q = h.page.getByTestId("quota");
      await q.waitFor();
      assert.match(await q.innerText(), /Pro plan/);
      assert.equal(await q.getByRole("link").count(), 0);
    }, pro);
  });
});
