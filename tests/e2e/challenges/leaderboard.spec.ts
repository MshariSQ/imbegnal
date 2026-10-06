import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { Browser } from "playwright";
import { defaultMock, eventually, launchBrowser, openPage, startSite } from "./harness";
import { fixtureLeaderboardResponse } from "../../fixtures/challenges/api";

let server: Server;
let origin: string;
let browser: Browser;

before(async () => {
  ({ server, origin } = await startSite());
  browser = await launchBrowser();
});
after(async () => {
  await browser.close();
  server.close();
});

const PATH = "/challenges/leaderboard/";
const rows = (page: import("playwright").Page) => page.locator('[role="table"] [role="row"]');
const names = (page: import("playwright").Page) => page.locator('[role="table"] ol[role="rowgroup"] > [role="row"]').evaluateAll((els) => els.map((e) => e.textContent ?? ""));

describe("leaderboard", () => {
  it("renders ranks, avatars, points, solves, first bloods and last solve", async () => {
    const t = await openPage(browser, origin, PATH);
    try {
      await t.page.getByRole("table", { name: "Leaderboard table" }).waitFor();
      const first = t.page.locator('[role="table"] ol[role="rowgroup"] > [role="row"]').first();
      const text = await first.innerText();
      for (const s of ["1", "Layla Hassan", "@layla", "2,450", "14", "3", "ago"]) assert.ok(text.includes(s), s);
      assert.equal(await first.locator("img, [aria-hidden]").count() > 0, true);
      assert.match(await t.page.getByRole("status").filter({ hasText: /players/ }).innerText(), /6 players/);
      assert.equal(await t.page.getByRole("columnheader").count(), 6);
      assert.match(await t.page.getByRole("link", { name: "Sign in to appear on the leaderboard." }).getAttribute("href") ?? "", /^\/login\/\?next=/);
      assert.deepEqual(t.errors, []);
    } finally {
      await t.close();
    }
  });

  it("marks the podium with text, not colour alone", async () => {
    const t = await openPage(browser, origin, PATH);
    try {
      await t.page.getByRole("table").waitFor();
      const podium = await t.page.locator('[role="table"] ol[role="rowgroup"] > [role="row"]').evaluateAll((els) => els.slice(0, 4).map((e) => e.textContent ?? ""));
      assert.match(podium[0], /1st place/);
      assert.match(podium[1], /2nd place/);
      assert.match(podium[2], /3rd place/);
      assert.doesNotMatch(podium[3], /place/);
    } finally {
      await t.close();
    }
  });

  it("switches between All time and This week with arrow keys and the URL", async () => {
    const t = await openPage(browser, origin, PATH);
    try {
      await t.page.getByRole("table").waitFor();
      const all = t.page.getByRole("tab", { name: "All time" });
      const week = t.page.getByRole("tab", { name: "This week" });
      assert.equal(await all.getAttribute("aria-selected"), "true");
      await week.click();
      await eventually(async () => assert.equal(await week.getAttribute("aria-selected"), "true"));
      assert.match(t.page.url(), /\?period=week$/);
      await eventually(async () => assert.match(await t.page.getByRole("status").filter({ hasText: /players/ }).innerText(), /3 players/));
      assert.ok(t.api.callsTo("GET", "/api/leaderboard?period=week").length >= 1);
      // roving tabindex + arrow keys (LTR: ArrowLeft goes back)
      assert.equal(await all.getAttribute("tabindex"), "-1");
      await week.focus();
      await t.page.keyboard.press("ArrowLeft");
      await eventually(async () => assert.equal(await all.getAttribute("aria-selected"), "true"));
      assert.equal(await t.page.evaluate(() => document.activeElement?.textContent), "All time");
    } finally {
      await t.close();
    }
  });

  it("filters by track through the URL and the API", async () => {
    const t = await openPage(browser, origin, PATH);
    try {
      await t.page.getByRole("table").waitFor();
      await t.page.getByLabel("Track").selectOption("networking");
      await eventually(() => assert.match(t.page.url(), /\?track=networking$/));
      await eventually(() => assert.ok(t.api.callsTo("GET", "track=networking").length >= 1));
      // deep link restores the same view (track + period)
      const d = await openPage(browser, origin, `${PATH}?track=databases&period=week`);
      try {
        await eventually(() => assert.ok(d.api.callsTo("GET", "/api/leaderboard?period=week&track=databases").length === 1));
        assert.equal(await d.page.getByLabel("Track").inputValue(), "databases");
        assert.equal(await d.page.getByRole("tab", { name: "This week" }).getAttribute("aria-selected"), "true");
      } finally {
        await d.close();
      }
    } finally {
      await t.close();
    }
  });

  it("highlights the signed-in learner when inside the visible range, without duplicating them", async () => {
    const api = defaultMock();
    api.leaderboard = (q) => fixtureLeaderboardResponse({ ...q, meInside: true });
    const t = await openPage(browser, origin, PATH, { signedIn: true, api });
    try {
      await t.page.getByRole("table").waitFor();
      const mine = t.page.locator('[role="row"][aria-current="true"]');
      await mine.first().waitFor();
      assert.equal(await mine.count(), 1);
      assert.match(await mine.innerText(), /Test Learner/);
      assert.match(await mine.innerText(), /You/);
      assert.equal(await t.page.getByTestId("lb-me-pinned").count(), 0);
    } finally {
      await t.close();
    }
  });

  it("pins the learner below the table when outside the visible range", async () => {
    const t = await openPage(browser, origin, PATH, { signedIn: true });
    try {
      const pinned = t.page.getByTestId("lb-me-pinned");
      await pinned.waitFor();
      const text = await pinned.innerText();
      assert.match(text, /128/);
      assert.match(text, /Test Learner/);
      assert.match(text, /You/);
      assert.equal(await pinned.locator('[role="row"]').getAttribute("aria-current"), "true");
      assert.equal(await t.page.getByRole("link", { name: "Sign in to appear on the leaderboard." }).count(), 0);
      assert.ok(t.api.callsTo("GET", "/api/leaderboard")[0].auth?.startsWith("Bearer "));
    } finally {
      await t.close();
    }
  });

  it("shows an empty state", async () => {
    const api = defaultMock();
    api.leaderboard = (q) => ({ entries: [], track: q.track ?? "all", period: q.period });
    const t = await openPage(browser, origin, PATH, { api });
    try {
      await t.page.getByRole("heading", { name: "No solves yet" }).waitFor();
      assert.equal(await t.page.getByRole("table").count(), 0);
    } finally {
      await t.close();
    }
  });

  it("shows a retryable error when the API fails, then recovers", async () => {
    let fail = true;
    const api = defaultMock();
    const ok = api.leaderboard;
    api.leaderboard = (q) => {
      return fail ? null : ok(q);
    };
    const t = await openPage(browser, origin, PATH, { api });
    try {
      await t.page.getByRole("alert").filter({ hasText: "Couldn't load the leaderboard" }).waitFor();
      fail = false;
      await t.page.getByRole("button", { name: "Try again" }).click();
      await t.page.getByRole("table").waitFor();
      assert.equal((await names(t.page)).length, 6);
    } finally {
      await t.close();
    }
  });

  it("never shows one tab's numbers under another tab's label while loading", async () => {
    const api = defaultMock();
    const t = await openPage(browser, origin, PATH, { api });
    try {
      await t.page.getByRole("table").waitFor();
      await t.page.getByRole("tab", { name: "This week" }).click();
      await eventually(async () => assert.equal((await names(t.page)).length, 3));
      assert.ok(!(await t.page.locator("main").innerText()).includes("2,450"));
      assert.equal(await rows(t.page).count() > 0, true);
    } finally {
      await t.close();
    }
  });
});
