import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { Browser } from "playwright";
import { API_ORIGIN, card, cardTitles, collectErrors, defaultMock, eventually, launchBrowser, mockApi, newContext, openPage, startSite } from "./harness";
import { fixtureStats } from "../../fixtures/challenges/api";

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

const LIST = "/challenges/";
/** innerText without the invisible bidi isolates around solver names. */
const plain = (s: string) => s.replace(/[\u2068\u2069]/g, "");
const count = (page: import("playwright").Page) => page.getByTestId("ctf-count").innerText();

describe("challenge list", () => {
  it("renders every challenge with its metadata and no console errors", async () => {
    const t = await openPage(browser, origin, LIST);
    try {
      await t.page.getByTestId("ctf-grid").waitFor();
      assert.equal((await cardTitles(t.page)).length, 9);
      assert.match(await count(t.page), /9 challenges/);
      const needle = card(t.page, "Needle in the Logs");
      assert.equal(await needle.getByRole("link").getAttribute("href"), "/challenges/hidden-in-logs/");
      assert.equal(await needle.getByRole("link").count(), 1, "one focus stop per card");
      const text = await needle.innerText();
      assert.match(text, /Cyber Security/);
      assert.match(text, /Medium/);
      assert.match(text, /Flag/);
      assert.match(text, /150 pts/);
      assert.match(text, /25 min/);
      assert.match(text, /Forensics/);
      assert.equal(await t.page.locator("h1").innerText(), "Challenges");
      assert.equal(await t.page.getByRole("link", { name: "Practice in Code Lab" }).getAttribute("href"), "/code-lab/");
      assert.deepEqual(t.errors, []);
    } finally {
      await t.close();
    }
  });

  it("derives the track chips from the roadmaps that have challenges", async () => {
    const t = await openPage(browser, origin, LIST);
    try {
      await t.page.getByTestId("ctf-grid").waitFor();
      const labels = await t.page.locator('input[name="ctf-track"]').evaluateAll((els) => els.map((e) => (e.closest("label") as HTMLElement).innerText.trim().split("\n").pop() as string));
      assert.equal(labels[0], "All tracks");
      assert.deepEqual(
        new Set(labels.slice(1)),
        new Set(["Cyber Security", "Frontend Development", "Networking", "Operating Systems", "Data Structures & Algorithms", "Databases", "Reverse Engineering"])
      );
    } finally {
      await t.close();
    }
  });

  it("shows live stats: solve counts, first blood and the signed-in solved state", async () => {
    const t = await openPage(browser, origin, LIST, { signedIn: true });
    try {
      const caesar = card(t.page, "Caesar's Warm-up");
      await eventually(async () => assert.match(await caesar.innerText(), /412 solves/));
      const text = plain(await caesar.innerText());
      assert.match(text, /First blood: Layla Hassan, last month/);
      assert.match(text, /Solved/);
      assert.match(text, /\+45 pts/);
      // first blood 2 hours ago on another card, relative to the fixed test clock
      assert.match(plain(await card(t.page, "Packet Detective").innerText()), /First blood: Omar, 2 hours ago/);
      assert.match(await card(t.page, "Needle in the Logs").innerText(), /0 solves/);
      assert.doesNotMatch(await card(t.page, "Needle in the Logs").innerText(), /First blood/);
      // header summary from `me`
      const header = await t.page.locator("dl").first().innerText();
      assert.match(header, /45/);
      assert.match(header, /#128/);
      assert.ok(t.api.callsTo("GET", "/api/challenges")[0].auth?.startsWith("Bearer "), "stats request carries the token when signed in");
    } finally {
      await t.close();
    }
  });

  it("signed-out visitors browse freely and are invited to sign in", async () => {
    const t = await openPage(browser, origin, LIST);
    try {
      await t.page.getByTestId("ctf-grid").waitFor();
      await eventually(async () => assert.match(await card(t.page, "Caesar's Warm-up").innerText(), /412 solves/));
      assert.doesNotMatch(await card(t.page, "Caesar's Warm-up").innerText(), /Solved/);
      assert.equal(t.api.callsTo("GET", "/api/challenges")[0].auth, null);
      const signIn = t.page.getByRole("link", { name: "Sign in", exact: true });
      assert.match((await signIn.getAttribute("href")) ?? "", /^\/login\/\?next=%2Fchallenges%2F/);
    } finally {
      await t.close();
    }
  });

  it("filters by track and keeps the URL in sync", async () => {
    const t = await openPage(browser, origin, LIST);
    try {
      await t.page.getByTestId("ctf-grid").waitFor();
      await t.page.locator("label", { hasText: "Networking" }).first().click();
      await eventually(async () => assert.deepEqual(await cardTitles(t.page), ["Packet Detective"]));
      assert.match(t.page.url(), /\?track=networking$/);
      assert.match(await count(t.page), /1 challenge$/);
      await t.page.locator("label", { hasText: "All tracks" }).click();
      await eventually(async () => assert.equal((await cardTitles(t.page)).length, 9));
      assert.doesNotMatch(t.page.url(), /track=/);
    } finally {
      await t.close();
    }
  });

  it("filters by difficulty, type and status", async () => {
    const t = await openPage(browser, origin, LIST, { signedIn: true });
    try {
      await t.page.getByTestId("ctf-grid").waitFor();
      await t.page.locator("label", { hasText: /^\s*Hard\s*$/ }).click();
      await eventually(async () => assert.deepEqual((await cardTitles(t.page)).sort(), ["Merge the Intervals", "Strings and Symbols"]));
      assert.match(t.page.url(), /difficulty=3/);

      await t.page.selectOption("#ctf-kind", "code");
      await eventually(async () => assert.deepEqual(await cardTitles(t.page), ["Merge the Intervals"]));
      assert.match(t.page.url(), /kind=code/);

      await t.page.getByRole("button", { name: "Clear filters" }).click();
      await eventually(async () => assert.equal((await cardTitles(t.page)).length, 9));
      assert.equal(new URL(t.page.url()).search, "");

      // status comes from the server stats (only caesar-warmup is solved)
      await eventually(async () => assert.match(await card(t.page, "Caesar's Warm-up").innerText(), /Solved/));
      await t.page.locator("label", { hasText: /^\s*Solved\s*$/ }).click();
      await eventually(async () => assert.deepEqual(await cardTitles(t.page), ["Caesar's Warm-up"]));
      await t.page.locator("label", { hasText: /^\s*Unsolved\s*$/ }).click();
      await eventually(async () => assert.equal((await cardTitles(t.page)).length, 8));
      assert.ok(!(await cardTitles(t.page)).includes("Caesar's Warm-up"));
      assert.match(t.page.url(), /status=unsolved/);
    } finally {
      await t.close();
    }
  });

  it("searches title, topic and tags, debounced into the URL", async () => {
    const t = await openPage(browser, origin, LIST);
    try {
      await t.page.getByTestId("ctf-grid").waitFor();
      await t.page.getByRole("searchbox", { name: "Search" }).fill("cipher");
      await eventually(async () => assert.deepEqual(await cardTitles(t.page), ["Caesar's Warm-up"]));
      await eventually(() => assert.match(t.page.url(), /q=cipher/));
      await t.page.getByRole("searchbox", { name: "Search" }).fill("forensics");
      await eventually(async () => assert.deepEqual(await cardTitles(t.page), ["Needle in the Logs"]));
    } finally {
      await t.close();
    }
  });

  it("sorts by recommended, newest, points and most solved", async () => {
    const t = await openPage(browser, origin, LIST);
    try {
      await t.page.getByTestId("ctf-grid").waitFor();
      assert.equal((await cardTitles(t.page))[0], "FizzBuzz Sum");
      await t.page.selectOption("#ctf-sort", "points");
      await eventually(async () => assert.equal((await cardTitles(t.page))[0], "Round-Robin Scheduler"));
      await t.page.selectOption("#ctf-sort", "newest");
      await eventually(async () => assert.equal((await cardTitles(t.page))[0], "Specificity Showdown"));
      await t.page.selectOption("#ctf-sort", "solves");
      await eventually(async () => assert.equal((await cardTitles(t.page))[0], "FizzBuzz Sum")); // 980 solves
      assert.match(t.page.url(), /sort=solves/);
    } finally {
      await t.close();
    }
  });

  it("restores every filter from a shared URL", async () => {
    const t = await openPage(browser, origin, `${LIST}?track=data-structures-algorithms&difficulty=3&kind=code&sort=points&q=interval`);
    try {
      await eventually(async () => assert.deepEqual(await cardTitles(t.page), ["Merge the Intervals"]));
      assert.equal(await t.page.locator('input[name="ctf-track"]:checked').getAttribute("value"), "data-structures-algorithms");
      assert.equal(await t.page.locator('input[name="ctf-difficulty"]:checked').getAttribute("value"), "3");
      assert.equal(await t.page.locator("#ctf-kind").inputValue(), "code");
      assert.equal(await t.page.locator("#ctf-sort").inputValue(), "points");
      assert.equal(await t.page.getByRole("searchbox", { name: "Search" }).inputValue(), "interval");
      assert.deepEqual(t.errors, []);
    } finally {
      await t.close();
    }
  });

  it("falls back to 'all' for an unknown track and ignores junk parameters", async () => {
    const t = await openPage(browser, origin, `${LIST}?track=ghost&difficulty=99&sort=nope`);
    try {
      await eventually(async () => assert.equal((await cardTitles(t.page)).length, 9));
    } finally {
      await t.close();
    }
  });

  it("shows an empty state with a clear button when nothing matches", async () => {
    const t = await openPage(browser, origin, `${LIST}?q=zzzzzz`);
    try {
      await t.page.getByRole("heading", { name: "No challenges match your filters" }).waitFor();
      assert.match(await count(t.page), /0 challenges/);
      assert.equal((await cardTitles(t.page)).length, 0);
      await t.page.locator("main").getByRole("button", { name: "Clear filters" }).first().click();
      await eventually(async () => assert.equal((await cardTitles(t.page)).length, 9));
    } finally {
      await t.close();
    }
  });

  it("still renders the list from static data, with a quiet note, when the API is unreachable", async () => {
    const api = defaultMock();
    api.stats = () => null;
    const t = await openPage(browser, origin, LIST, { api });
    try {
      await t.page.getByTestId("ctf-grid").waitFor();
      await t.page.getByText(/Live stats .* are unavailable right now/).waitFor();
      assert.equal((await cardTitles(t.page)).length, 9);
      assert.doesNotMatch(await card(t.page, "Caesar's Warm-up").innerText(), /solves/);
      assert.deepEqual(t.errors, []);
      // Retry recovers once the API is back
      api.stats = (s) => fixtureStats(s);
      await t.page.getByRole("button", { name: "Retry" }).click();
      await eventually(async () => assert.match(await card(t.page, "Caesar's Warm-up").innerText(), /412 solves/));
      assert.equal(await t.page.getByText(/are unavailable right now/).count(), 0);
    } finally {
      await t.close();
    }
  });

  it("shows solved badges instantly from the local cache while stats are still loading", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => (release = r));
    const ctx = await newContext(browser, { signedIn: true });
    await mockApi(ctx, defaultMock());
    // Seed the cache for the test user, then hold the stats response back.
    await ctx.addInitScript(() => localStorage.setItem("imb-ctf-solved:u-test", JSON.stringify(["fizzbuzz-sum"])));
    await ctx.route(`${API_ORIGIN}/api/challenges`, async (route) => {
      await gate;
      await route.fallback();
    });
    const page = await ctx.newPage();
    const errors = collectErrors(page);
    try {
      await page.goto(origin + LIST);
      const fizz = card(page, "FizzBuzz Sum");
      await eventually(async () => assert.match(await fizz.innerText(), /Solved/));
      release();
      // the server is authoritative once it answers: fizzbuzz-sum is NOT solved there, caesar-warmup is
      await eventually(async () => assert.doesNotMatch(await fizz.innerText(), /Solved/));
      assert.match(await card(page, "Caesar's Warm-up").innerText(), /Solved/);
      const cached = await page.evaluate(() => localStorage.getItem("imb-ctf-solved:u-test"));
      assert.equal(cached, '["caesar-warmup"]');
      assert.deepEqual(errors, []);
    } finally {
      release();
      await ctx.close();
    }
  });
});
