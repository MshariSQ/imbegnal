import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { Browser, Page } from "playwright";
import { collectErrors, defaultMock, eventually, launchBrowser, mockApi, newContext, openPage, startSite } from "./harness";
import { correctResponse, FIXTURE_FIRST_BLOOD_FLAG, FIXTURE_FLAG, fixtureStats, wrongResponse } from "../../fixtures/challenges/api";

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

const plain = (s: string) => s.replace(/[⁨⁩]/g, "");
const flagBox = (page: Page) => page.getByLabel("Flag", { exact: true });
const submitBtn = (page: Page) => page.getByRole("button", { name: "Submit", exact: true });

describe("challenge detail: content", () => {
  it("renders statement, badges, metadata, files, lessons, course link and related challenges", async () => {
    const t = await openPage(browser, origin, "/challenges/caesar-warmup/");
    try {
      await t.page.getByRole("heading", { level: 1, name: "Caesar's Warm-up" }).waitFor();
      assert.equal(await t.page.title().then((x) => x.includes("Caesar's Warm-up")), true);
      const main = await t.page.locator("main").innerText();
      for (const s of ["Cyber Security", "Easy", "Flag", "Crypto", "50 pts", "10 min", "Story", "substitution cipher", "IMB{...}"]) assert.ok(main.includes(s), s);
      // statement code block is LTR
      // Polled: hydration can swap the node, and a detached node reports an empty direction.
      await t.page.waitForFunction(() => {
        const pre = [...document.querySelectorAll("main pre")].find((e) => e.textContent?.includes("shift = 3"));
        return !!pre && getComputedStyle(pre).direction === "ltr";
      });
      // track chip + course link
      assert.equal(await t.page.getByRole("link", { name: "View the course" }).getAttribute("href"), "/learn/cyber-security/");
      // lesson that exists is linked with its real title; the unknown key is skipped, never invented
      const lessons = t.page.locator("section", { has: t.page.getByRole("heading", { name: "Lessons that teach this" }) }).getByRole("link");
      assert.equal(await lessons.count(), 1);
      assert.equal(await lessons.first().getAttribute("href"), "/learn/cyber-security/cyber-basics/");
      // related challenges link to their pages and never include itself
      const related = t.page.locator("section", { has: t.page.getByRole("heading", { name: "More challenges" }) }).getByRole("link");
      const hrefs = await related.evaluateAll((els) => els.map((e) => e.getAttribute("href")));
      assert.ok(hrefs.length >= 3 && hrefs.every((h) => /^\/challenges\/[a-z-]+\/$/.test(h ?? "")));
      assert.ok(!hrefs.includes("/challenges/caesar-warmup/"));
      assert.equal(hrefs[0], "/challenges/hidden-in-logs/"); // same track first
      assert.deepEqual(t.errors, []);
    } finally {
      await t.close();
    }
  });

  it("includes JSON-LD LearningResource metadata and no flag material", async () => {
    const t = await openPage(browser, origin, "/challenges/hidden-in-logs/");
    try {
      const raw = await t.page.locator('script[type="application/ld+json"]').first().textContent();
      const ld = JSON.parse(raw ?? "{}");
      assert.equal(ld["@type"], "LearningResource");
      assert.equal(ld.name, "Needle in the Logs");
      assert.equal(ld.educationalLevel, "Medium");
      assert.equal(ld.timeRequired, "PT25M");
      assert.match(ld.url, /\/challenges\/hidden-in-logs\/$/);
      assert.equal(await t.page.locator('link[rel="canonical"]').getAttribute("href") !== null, true);
      assert.ok(!(await t.page.content()).includes(FIXTURE_FLAG));
    } finally {
      await t.close();
    }
  });

  it("shows files inline with Copy and Download (Blob)", async () => {
    const t = await openPage(browser, origin, "/challenges/caesar-warmup/");
    try {
      await t.ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin });
      const viewer = t.page.getByLabel("note.txt", { exact: true }).first();
      await viewer.waitFor();
      assert.match(await viewer.innerText(), /Wkh vhfuhw lv lq wkh qrwh/);
      assert.equal(await viewer.getAttribute("dir"), "ltr");
      const [download] = await Promise.all([t.page.waitForEvent("download"), t.page.getByRole("button", { name: /Download/ }).click()]);
      assert.equal(download.suggestedFilename(), "note.txt");
      const { readFileSync } = await import("node:fs");
      assert.match(readFileSync((await download.path()) as string, "utf8"), /OLQH 2/);
      await t.page.getByRole("button", { name: /^Copy/ }).click();
      await eventually(async () => assert.match(await t.page.evaluate(() => navigator.clipboard.readText()), /Wkh vhfuhw/));
      await t.page.getByRole("button", { name: /^Copied/ }).waitFor();
    } finally {
      await t.close();
    }
  });

  it("shows sample input, allowed languages and the Code Lab link for output challenges", async () => {
    const t = await openPage(browser, origin, "/challenges/fizzbuzz-sum/", { signedIn: true });
    try {
      await t.page.getByRole("heading", { level: 1 }).waitFor();
      assert.match(await t.page.locator("main").innerText(), /Allowed languages: python, javascript, cpp/);
      assert.match(await t.page.locator("main").innerText(), /Sample input/);
    } finally {
      await t.close();
    }
  });

  it("links to Code Lab with the contract format and follows the language selector", async () => {
    const t = await openPage(browser, origin, "/challenges/interval-merge/", { signedIn: true });
    try {
      const link = t.page.getByTestId("open-code-lab");
      assert.equal(await link.getAttribute("href"), "/code-lab/?ch=interval-merge&lang=python");
      await t.page.getByLabel("Language").selectOption("javascript");
      assert.equal(await link.getAttribute("href"), "/code-lab/?ch=interval-merge&lang=javascript");
      assert.match(await t.page.locator("aside").innerText(), /submit from there/);
      // only allowed languages are offered
      assert.deepEqual(await t.page.getByLabel("Language").locator("option").evaluateAll((os) => os.map((o) => (o as HTMLOptionElement).value)), ["python", "javascript"]);
    } finally {
      await t.close();
    }
  });

  it("quick-submits code through the same endpoint", async () => {
    const api = defaultMock();
    api.submit = () => ({ correct: true, awarded: 250, alreadySolved: false, firstBlood: false });
    const t = await openPage(browser, origin, "/challenges/interval-merge/", { signedIn: true, api });
    try {
      await t.page.getByText("Quick submit").click();
      await t.page.getByLabel("Your solution").fill("def merge(x):\n    return x\n");
      await t.page.getByRole("button", { name: "Submit solution" }).click();
      await t.page.getByTestId("ctf-correct").waitFor();
      const call = t.api.callsTo("POST", "/submit")[0];
      assert.deepEqual(call.body, { lang: "python", code: "def merge(x):\n    return x\n" });
      assert.ok(call.auth?.startsWith("Bearer "));
    } finally {
      await t.close();
    }
  });

  it("stamps the open time once for signed-in learners and never for guests", async () => {
    const a = await openPage(browser, origin, "/challenges/hidden-in-logs/", { signedIn: true });
    try {
      await eventually(() => assert.equal(a.api.callsTo("POST", "/api/challenges/hidden-in-logs/open").length, 1));
      assert.ok(a.api.callsTo("POST", "/open")[0].auth?.startsWith("Bearer "));
    } finally {
      await a.close();
    }
    const b = await openPage(browser, origin, "/challenges/hidden-in-logs/");
    try {
      await b.page.getByRole("heading", { level: 1 }).waitFor();
      await b.page.waitForLoadState("networkidle");
      assert.equal(b.api.callsTo("POST", "/open").length, 0);
    } finally {
      await b.close();
    }
  });

  it("an open() failure is silent", async () => {
    const ctx = await newContext(browser, { signedIn: true });
    await mockApi(ctx, defaultMock());
    let opens = 0;
    await ctx.route("https://imbegnal-e2e.workers.dev/api/challenges/*/open", (r) => {
      opens++;
      return r.fulfill({ status: 500, body: "boom" });
    });
    const page = await ctx.newPage();
    const errors = collectErrors(page);
    try {
      await page.goto(`${origin}/challenges/hidden-in-logs/`);
      await eventually(() => assert.equal(opens, 1));
      await flagBox(page).waitFor();
      assert.deepEqual(errors, []);
      assert.equal(await page.getByTestId("ctf-error").count(), 0);
    } finally {
      await ctx.close();
    }
  });

  it("shows solve statistics and the learner's own progress", async () => {
    const t = await openPage(browser, origin, "/challenges/caesar-warmup/", { signedIn: true });
    try {
      const stats = t.page.locator("section", { has: t.page.getByRole("heading", { name: "Solve statistics" }) });
      await eventually(async () => assert.match(await stats.innerText(), /412/));
      const s = plain(await stats.innerText());
      assert.match(s, /First blood: Layla Hassan, last month/);
      assert.match(s, /8 min/);
      const mine = await t.page.locator("section", { has: t.page.getByRole("heading", { name: "Your progress" }) }).innerText();
      assert.match(mine, /Solved/);
      assert.match(mine, /Attempts\s*2/);
      assert.match(mine, /Hints used\s*1 \/ 2/);
      assert.match(mine, /Points earned\s*45/);
      assert.match(mine, /Time to solve\s*12 min/);
      await t.page.getByTestId("ctf-solved-badge").waitFor();
    } finally {
      await t.close();
    }
  });

  it("says 'needs 3 or more solves' without a median and survives stats being unavailable", async () => {
    const t = await openPage(browser, origin, "/challenges/interval-merge/");
    try {
      const stats = t.page.locator("section", { has: t.page.getByRole("heading", { name: "Solve statistics" }) });
      await eventually(async () => assert.match(await stats.innerText(), /Needs 3 or more solves/));
    } finally {
      await t.close();
    }
    const api = defaultMock();
    api.stats = () => null;
    const u = await openPage(browser, origin, "/challenges/interval-merge/", { api });
    try {
      const stats = u.page.locator("section", { has: u.page.getByRole("heading", { name: "Solve statistics" }) });
      await eventually(async () => assert.match(await stats.innerText(), /Live stats .* are unavailable right now/));
      assert.equal(await u.page.getByRole("heading", { level: 1 }).innerText(), "Merge the Intervals");
    } finally {
      await u.close();
    }
  });

  it("an id that does not exist is a 404, not a crash", async () => {
    const t = await openPage(browser, origin, "/challenges/does-not-exist/");
    try {
      assert.match(await t.page.locator("body").innerText(), /404|not be found|Not Found/i);
    } finally {
      await t.close();
    }
  });
});

describe("challenge detail: hints", () => {
  it("shows the cost before revealing, asks for confirmation, and only reveals after the server accepts", async () => {
    const t = await openPage(browser, origin, "/challenges/hidden-in-logs/", { signedIn: true });
    try {
      const reveal = t.page.getByRole("button", { name: /Reveal hint/ });
      await reveal.waitFor();
      assert.match(await reveal.innerText(), /Costs 20 points/); // visible to screen readers before committing
      await reveal.click();
      const dialog = t.page.getByRole("group", { name: "Reveal hint 1?" });
      const body = await dialog.innerText();
      assert.match(body, /This costs 20 points/);
      assert.match(body, /up to 130 points instead of 150/);
      assert.equal(t.api.callsTo("POST", "/hint").length, 0, "nothing is charged by opening the confirm step");
      // focus moves into the confirm step (Cancel first)
      assert.equal(await t.page.evaluate(() => document.activeElement?.textContent), "Cancel");
      // cancelling reveals nothing
      await t.page.getByRole("button", { name: "Cancel" }).click();
      assert.equal(await t.page.getByText("Filter on the word Failed").count(), 0);
      assert.equal(t.api.callsTo("POST", "/hint").length, 0);
      // confirm
      await reveal.click();
      await t.page.getByRole("button", { name: "Yes, reveal it" }).click();
      await t.page.getByText("Filter on the word Failed").waitFor();
      const call = t.api.callsTo("POST", "/api/challenges/hidden-in-logs/hint")[0];
      assert.deepEqual(call.body, { index: 0 });
      // progress reflects the hint and focus lands on the revealed text
      await eventually(async () => assert.match(await t.page.locator("aside").innerText(), /Hints used\s*1 \/ 1/));
      assert.match(await t.page.evaluate(() => document.activeElement?.textContent ?? ""), /Filter on the word Failed/);
    } finally {
      await t.close();
    }
  });

  it("reveals hints strictly in order", async () => {
    const t = await openPage(browser, origin, "/challenges/caesar-warmup/", { signedIn: true, api: (() => {
      const api = defaultMock();
      api.stats = () => ({ stats: [{ id: "caesar-warmup", solves: 5, mine: { solved: false, points: 0, attempts: 0, hintsUsed: 0 } }] });
      return api;
    })() });
    try {
      await t.page.getByRole("button", { name: /Reveal hint/ }).waitFor();
      assert.equal(await t.page.getByRole("button", { name: /Reveal hint/ }).count(), 1, "only the next hint can be revealed");
      assert.match(await t.page.locator("main").innerText(), /Reveal the previous hint first/);
    } finally {
      await t.close();
    }
  });

  it("keeps already revealed hints open and shows a failed reveal as an error without revealing", async () => {
    const api = defaultMock();
    api.stats = () => ({ stats: [{ id: "caesar-warmup", solves: 5, mine: { solved: false, points: 0, attempts: 1, hintsUsed: 1 } }] });
    api.hint = () => ({ status: 500, json: { error: "error" } });
    const t = await openPage(browser, origin, "/challenges/caesar-warmup/", { signedIn: true, api });
    try {
      await t.page.getByText("Count how many letters").waitFor();
      assert.equal(await t.page.getByText("The shift is the same for every letter").count(), 0);
      await t.page.getByRole("button", { name: /Reveal hint/ }).click();
      await t.page.getByRole("button", { name: "Yes, reveal it" }).click();
      await t.page.getByRole("alert").filter({ hasText: "Couldn't reveal the hint" }).waitFor();
      assert.equal(await t.page.getByText("The shift is the same for every letter").count(), 0);
    } finally {
      await t.close();
    }
  });

  it("asks signed-out visitors to sign in instead of offering to reveal", async () => {
    const t = await openPage(browser, origin, "/challenges/hidden-in-logs/");
    try {
      const link = t.page.getByRole("link", { name: "Sign in to reveal hints." });
      await link.waitFor();
      assert.match((await link.getAttribute("href")) ?? "", /^\/login\/\?next=%2Fchallenges%2Fhidden-in-logs%2F/);
      assert.equal(await t.page.getByRole("button", { name: /Reveal hint/ }).count(), 0);
    } finally {
      await t.close();
    }
  });
});

describe("challenge detail: flag submission", () => {
  async function flagPage(api = defaultMock(), opts: { signedIn?: boolean; reducedMotion?: boolean } = { signedIn: true }) {
    const t = await openPage(browser, origin, "/challenges/hidden-in-logs/", { ...opts, api });
    await flagBox(t.page).waitFor();
    return t;
  }

  it("a correct flag shows the celebration, awarded points, next challenge and updates the page state", async () => {
    const api = defaultMock();
    api.submit = (_id, body) => (body.flag === FIXTURE_FIRST_BLOOD_FLAG ? correctResponse(150, false) : wrongResponse);
    const t = await flagPage(api);
    try {
      await flagBox(t.page).fill(`  ${FIXTURE_FIRST_BLOOD_FLAG}  `);
      await submitBtn(t.page).click();
      const ok = t.page.getByTestId("ctf-correct");
      await ok.waitFor();
      assert.match(await ok.innerText(), /Correct!/);
      assert.match(await ok.innerText(), /You earned 150 points/);
      assert.equal(await t.page.getByTestId("ctf-first-blood").count(), 0);
      assert.equal(await t.page.getByTestId("ctf-celebration").count(), 1);
      const next = ok.getByRole("link", { name: /Next challenge/ });
      assert.match((await next.getAttribute("href")) ?? "", /^\/challenges\/[a-z-]+\/$/);
      assert.deepEqual(t.api.callsTo("POST", "/submit")[0].body, { flag: FIXTURE_FIRST_BLOOD_FLAG }, "the flag is trimmed");
      // focus moved to the result for keyboard / screen-reader users
      assert.equal(await t.page.evaluate(() => document.activeElement?.getAttribute("data-testid")), "ctf-result");
      // local state reflects the solve right away
      await t.page.getByTestId("ctf-solved-badge").waitFor();
      assert.match(await t.page.locator("aside").innerText(), /Points earned\s*150/);
      assert.equal(await t.page.evaluate(() => localStorage.getItem("imb-ctf-solved:u-test")), '["caesar-warmup","hidden-in-logs"]');
      assert.deepEqual(t.errors, []);
    } finally {
      await t.close();
    }
  });

  it("first blood gets its own banner, and reduced motion removes the burst", async () => {
    const api = defaultMock();
    api.submit = () => correctResponse(150, true);
    const t = await flagPage(api, { signedIn: true, reducedMotion: true });
    try {
      await flagBox(t.page).fill(FIXTURE_FIRST_BLOOD_FLAG);
      await submitBtn(t.page).click();
      const banner = t.page.getByTestId("ctf-first-blood");
      await banner.waitFor();
      assert.match(await banner.innerText(), /First blood!/);
      assert.equal(await t.page.getByTestId("ctf-celebration").count(), 0, "no animation under prefers-reduced-motion");
      // the solver becomes first blood in the stats panel
      await eventually(async () => assert.match(plain(await t.page.locator("aside").innerText()), /First blood: Test Learner/));
    } finally {
      await t.close();
    }
  });

  it("a wrong flag gets one neutral message, every time, and keeps the input", async () => {
    const t = await flagPage();
    try {
      const messages: string[] = [];
      for (const guess of ["IMB{wrong}", "IMB{203.0.113.8}", "nope"]) {
        await flagBox(t.page).fill(guess);
        await submitBtn(t.page).click();
        await eventually(async () => assert.equal(await t.page.getByTestId("ctf-incorrect").count(), 1));
        messages.push(await t.page.getByTestId("ctf-incorrect").innerText());
        assert.equal(await flagBox(t.page).inputValue(), guess);
        await eventually(async () => assert.equal(await submitBtn(t.page).isDisabled(), false));
      }
      assert.equal(new Set(messages).size, 1, "identical feedback regardless of closeness");
      assert.match(messages[0], /Not quite/);
      assert.doesNotMatch(messages[0], /close|almost|partial/i);
      await eventually(async () => assert.match(await t.page.locator("aside").innerText(), /Attempts\s*3/));
    } finally {
      await t.close();
    }
  });

  it("does not submit an empty flag", async () => {
    const t = await flagPage();
    try {
      assert.equal(await submitBtn(t.page).isDisabled(), true);
      await flagBox(t.page).fill("   ");
      assert.equal(await submitBtn(t.page).isDisabled(), true);
      assert.equal(t.api.callsTo("POST", "/submit").length, 0);
    } finally {
      await t.close();
    }
  });

  it("a rate limit shows a countdown and blocks resubmitting", async () => {
    const api = defaultMock();
    api.submit = () => ({ status: 429, headers: { "retry-after": "30" }, json: { error: "rate_limited", scope: "challenge", retryAfterSec: 30 } });
    const t = await flagPage(api);
    try {
      await flagBox(t.page).fill("IMB{x}");
      await submitBtn(t.page).click();
      const err = t.page.getByTestId("ctf-error");
      await err.waitFor();
      assert.equal(await err.getAttribute("data-kind"), "rate");
      assert.match(await err.innerText(), /submitting too fast\. Try again in 0:\d\d/);
      const blocked = t.page.getByRole("button", { name: /You can submit again in 0:\d\d/ });
      assert.equal(await blocked.isDisabled(), true);
      // the countdown is moving
      const first = await blocked.innerText();
      await eventually(async () => assert.notEqual(await t.page.getByRole("button", { name: /You can submit again in/ }).innerText(), first), 4000);
    } finally {
      await t.close();
    }
  });

  it("signed-out visitors are sent to sign in (with a way back) and nothing is sent", async () => {
    const t = await flagPage(defaultMock(), {});
    try {
      await flagBox(t.page).fill("IMB{x}");
      await submitBtn(t.page).click();
      const err = t.page.getByTestId("ctf-error");
      await err.waitFor();
      assert.equal(await err.getAttribute("data-kind"), "signin");
      assert.equal(await err.getByRole("link", { name: "Sign in to submit" }).getAttribute("href"), "/login/?next=%2Fchallenges%2Fhidden-in-logs%2F");
      assert.equal(t.api.callsTo("POST", "/submit").length, 0);
    } finally {
      await t.close();
    }
  });

  it("a 401 from the server (stale token) also becomes the sign-in prompt", async () => {
    const api = defaultMock();
    api.submit = () => ({ status: 401, json: { error: "unauthorized" } });
    const t = await flagPage(api);
    try {
      await flagBox(t.page).fill("IMB{x}");
      await submitBtn(t.page).click();
      await t.page.locator('[data-testid="ctf-error"][data-kind="signin"]').waitFor();
    } finally {
      await t.close();
    }
  });

  const failures: { name: string; status: number; json: object; kind: string; text: RegExp }[] = [
    { name: "quota exceeded", status: 429, json: { error: "quota_exceeded", scope: "daily", resetAt: "2026-06-02T00:00:00Z" }, kind: "quota", text: /run limit/ },
    { name: "suspended account", status: 403, json: { error: "account_suspended" }, kind: "suspended", text: /Submissions are disabled for your account/ },
    { name: "runner unavailable", status: 503, json: { error: "runner_unavailable" }, kind: "runner", text: /runner is unavailable.*wasn't counted/ },
    { name: "invalid request", status: 400, json: { error: "invalid_request" }, kind: "invalid", text: /couldn't be accepted/ },
    { name: "unknown challenge on the server", status: 404, json: { error: "not_found" }, kind: "notfound", text: /isn't available on the server yet/ },
    { name: "server error", status: 500, json: { error: "internal" }, kind: "generic", text: /Something went wrong/ },
  ];
  for (const f of failures) {
    it(`maps ${f.name} to a clear message`, async () => {
      const api = defaultMock();
      api.submit = () => ({ status: f.status, json: f.json });
      const t = await flagPage(api);
      try {
        await flagBox(t.page).fill("IMB{x}");
        await submitBtn(t.page).click();
        const err = t.page.locator(`[data-testid="ctf-error"][data-kind="${f.kind}"]`);
        await err.waitFor();
        assert.match(await err.innerText(), f.text);
      } finally {
        await t.close();
      }
    });
  }

  it("shows a network message when the Worker cannot be reached", async () => {
    const t = await flagPage();
    try {
      await t.ctx.route("https://imbegnal-e2e.workers.dev/api/challenges/*/submit", (r) => r.abort("connectionfailed"));
      await flagBox(t.page).fill("IMB{x}");
      await submitBtn(t.page).click();
      await t.page.locator('[data-testid="ctf-error"][data-kind="network"]').waitFor();
    } finally {
      await t.close();
    }
  });

  it("tells a learner who already solved it that nothing changes", async () => {
    const api = defaultMock();
    api.submit = () => ({ correct: true, awarded: 0, alreadySolved: true, firstBlood: false });
    const t = await openPage(browser, origin, "/challenges/caesar-warmup/", { signedIn: true, api });
    try {
      await t.page.getByText(/already solved this one/).waitFor();
      await flagBox(t.page).fill(FIXTURE_FLAG);
      await submitBtn(t.page).click();
      assert.match(await t.page.getByTestId("ctf-correct").innerText(), /Already solved\. No extra points/);
      assert.equal(fixtureStats(true).stats[0].solves, 412);
      // solves must not be double counted
      await eventually(async () => assert.match(await t.page.locator("aside").innerText(), /Solves\s*412/));
    } finally {
      await t.close();
    }
  });
});
