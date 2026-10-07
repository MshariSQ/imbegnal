import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { SubmitResponse } from "../../../shared/api";
import type { ChallengeMeta } from "../../../shared/challenges";
import type { Lesson } from "../../../data/lessons/types";
import { MockApi, bootSuite, withPage, editorText, gradeOf, hasPyodide, openLab, quotaInfo, resultPanel, runButton, runResult, type Suite } from "./support";

// Fabricated fixtures, injected through the documented window.__IMB_LAB_FIXTURES__ seam:
// data/** is owned by the content engineers and is never edited by these tests.
// `frontend/html-css` is a real course lesson, so "Next lesson" resolves to its successor.
const lesson: Lesson = {
  nodeId: "html-css",
  title: { en: "Fixture lesson: sums", ar: "درس تجريبي: المجاميع" },
  estMinutes: 10,
  sections: [
    { type: "text", body: { en: "Intro", ar: "مقدمة" } },
    { type: "code-demo", lang: "js", code: 'console.log("demo says hi");\n', explanation: { en: "x", ar: "س" } },
    {
      type: "lab",
      id: "sum-two",
      lang: "python",
      prompt: { en: "Read two numbers and print their **sum**.", ar: "اقرأ رقمين واطبع **مجموعهما**." },
      starterCode: "a = int(input())\nb = int(input())\n# print the sum\n",
      solution: "a = int(input())\nb = int(input())\nprint(a + b)\n",
      hints: [
        { en: "Use int() to convert input.", ar: "استخدم int() لتحويل المدخل." },
        { en: "print(a + b)", ar: "print(a + b)" },
      ],
      tests: [
        { name: { en: "adds small numbers", ar: "جمع أعداد صغيرة" }, stdin: "1\n2\n", expected: "3" },
        { name: { en: "adds negatives", ar: "جمع الأعداد السالبة" }, stdin: "-1\n-2\n", expected: "-3" },
      ],
      sampleInput: "1\n2\n",
    },
  ],
} as Lesson;

const challenge: ChallengeMeta = {
  id: "fixture-echo",
  track: "frontend",
  topic: "warmup",
  title: { en: "Echo the name", ar: "ردّد الاسم" },
  summary: { en: "Print a greeting.", ar: "اطبع تحية." },
  description: { en: "Read a name and print `Hello, <name>!`.", ar: "اقرأ اسماً واطبع `Hello, <name>!`." },
  difficulty: 1,
  points: 100,
  estMinutes: 5,
  kind: "code",
  lang: "python",
  starterCode: { python: "name = input()\n# greet\n", ruby: "name = gets\n" },
  allowedLangs: ["python", "ruby"],
  sampleInput: "Ada\n",
};

const fixtures = { lessons: { "frontend/html-css": lesson }, challenges: { [challenge.id]: challenge } };
const EX = "ex=frontend/html-css/sum-two";

describe("Code Lab: deep links", () => {
  let s: Suite;
  before(async () => void (s = await bootSuite()));
  after(async () => s.close());

  const withFixtures = (opts: { signedIn?: boolean; lang?: "en" | "ar" }, api: MockApi, fn: Parameters<typeof withPage>[2]) => withPage(s, { ...opts, fixtures }, fn, api);

  it("?ex= preloads the lab exercise: prompt, visible tests, track chips, progressive hints, locked solution", async () => {
    await withFixtures({ signedIn: true }, new MockApi(), async (h) => {
      await openLab(h, s.site, EX);
      const task = h.page.getByTestId("task-panel");
      await task.waitFor();
      assert.match(await task.innerText(), /Fixture lesson: sums/);
      assert.match(await task.innerText(), /Read two numbers and print their sum/);
      assert.match(await editorText(h.page), /# print the sum/);
      assert.match(await h.page.getByTestId("lang-locked").innerText(), /Python/, "an exercise fixes its language");
      assert.equal(await h.page.getByLabel("Standard input (stdin)").inputValue(), "1\n2\n");
      // Canonical track chips: the title comes from data/roadmaps.ts.
      const nav = task.getByRole("navigation", { name: "Tracks" });
      assert.equal(await nav.getByRole("link", { name: /Course: Frontend Development/ }).getAttribute("href"), "/learn/frontend/");
      assert.equal(await nav.getByRole("link", { name: /Challenges: Frontend Development/ }).getAttribute("href"), "/challenges/?track=frontend");
      // Hints reveal one at a time.
      assert.equal(await h.page.getByTestId("hint").count(), 0);
      await task.getByRole("button", { name: /Show a hint/ }).click();
      assert.equal(await h.page.getByTestId("hint").count(), 1);
      await task.getByRole("button", { name: /Show a hint/ }).click();
      assert.equal(await h.page.getByTestId("hint").count(), 2);
      assert.equal(await task.getByRole("button", { name: /Show a hint/ }).count(), 0);
      assert.match(await task.innerText(), /Unlocks after 2 failed checks/);
      assert.equal(await task.getByRole("button", { name: "Show solution" }).count(), 0);
      assert.deepEqual(h.errors, []);
    });
  });

  it("graded runs send the lesson ref, show per-test diffs, unlock the solution after 2 failures and award XP once on a pass", async () => {
    const api = new MockApi();
    const failing = gradeOf([
      { name: "adds small numbers", passed: true },
      { name: "adds negatives", passed: false, expected: "-3", actual: "3" },
    ]);
    const passing = gradeOf([
      { name: "adds small numbers", passed: true },
      { name: "adds negatives", passed: true },
    ]);
    api.run = (_req, n) => ({
      body: {
        runId: `g${n}`,
        result: runResult({ stdout: "3\n" }),
        grade: n < 2 ? failing : passing,
        quota: quotaInfo(),
      },
    });
    await withFixtures({ signedIn: true }, api, async (h) => {
      await openLab(h, s.site, EX);
      await runButton(h.page).click();
      await h.page.getByTestId("tests-panel").waitFor();
      assert.deepEqual(api.runs[0].ref, { kind: "lesson", track: "frontend", lesson: "html-css", exercise: "sum-two" });
      const rows = h.page.getByTestId("test-row");
      assert.equal(await rows.count(), 2);
      assert.equal(await rows.nth(0).getAttribute("data-passed"), "true");
      assert.equal(await rows.nth(1).getAttribute("data-passed"), "false");
      const failed = await rows.nth(1).innerText();
      assert.match(failed, /expected/i);
      assert.match(failed, /-3/);
      assert.match(failed, /actual/i);
      assert.match(await h.page.getByTestId("grade-banner").innerText(), /1 of 2 tests passed/);
      assert.equal(await h.page.getByTestId("grade-banner").getAttribute("data-passed"), "false");
      assert.match(await h.page.getByTestId("grade-score").innerText(), /1\/2 passed/);

      const task = h.page.getByTestId("task-panel");
      assert.equal(await task.getByRole("button", { name: "Show solution" }).count(), 0, "locked after one failed check");
      await runButton(h.page).click();
      await task.getByRole("button", { name: "Show solution" }).waitFor();
      await task.getByRole("button", { name: "Show solution" }).click();
      assert.match(await h.page.getByTestId("solution").innerText(), /print\(a \+ b\)/);

      await runButton(h.page).click();
      await h.page.waitForFunction(() => document.querySelector('[data-testid="grade-banner"]')?.getAttribute("data-passed") === "true");
      assert.match(await h.page.getByTestId("xp").innerText(), /\+\d+ XP/);
      const banner = h.page.getByTestId("grade-banner");
      assert.equal(await banner.getByRole("link", { name: "Back to lesson" }).getAttribute("href"), "/learn/frontend/html-css/");
      assert.equal(await banner.getByRole("link", { name: "Next lesson" }).getAttribute("href"), "/learn/frontend/javascript/");
      const stored = await h.page.evaluate(() => localStorage.getItem("imb-labs-v1") ?? "");
      assert.match(stored, /frontend\/html-css\/sum-two/);

      // A second pass awards no more XP.
      await runButton(h.page).click();
      await h.page.waitForFunction(() => /Already completed/.test(document.querySelector('[data-testid="xp"]')?.textContent ?? ""));
    });
  });

  it("guests solve a JavaScript-or-Python exercise locally: the browser grades it, no server call", { skip: !hasPyodide() && "PYODIDE_DIR not set" }, async () => {
    const api = new MockApi();
    await withFixtures({ signedIn: false }, api, async (h) => {
      await openLab(h, s.site, EX);
      await h.page.getByTestId("task-panel").waitFor();
      await h.page.locator(".cm-content").click();
      await h.page.keyboard.press("ControlOrMeta+A");
      await h.page.keyboard.press("Delete");
      await h.page.keyboard.insertText("a = int(input())\nb = int(input())\nprint(a + b)\n");
      await runButton(h.page).click();
      await h.page.waitForFunction(() => document.querySelector('[data-testid="grade-banner"]')?.getAttribute("data-passed") === "true", undefined, { timeout: 90_000 });
      assert.equal(api.runs.length, 0, "browser grading never calls the Worker");
      assert.match(await h.page.getByTestId("tests-panel").innerText(), /Checked in your browser/);
    });
  });

  it("an unknown exercise shows a friendly not-found with a link back to the course", async () => {
    await withFixtures({ signedIn: true }, new MockApi(), async (h) => {
      await h.page.goto(`${s.site.url}/code-lab/?ex=frontend/html-css/does-not-exist`);
      const card = h.page.getByTestId("lab-not-found");
      await card.waitFor();
      assert.match(await card.innerText(), /couldn.t find that exercise/);
      assert.equal(await card.getByRole("link", { name: "Back to the course" }).getAttribute("href"), "/learn/frontend/");
    });
  });

  it("?demo= preloads a code-demo section, links back to the lesson and runs in the browser without grading", async () => {
    const api = new MockApi();
    await withFixtures({ signedIn: false }, api, async (h) => {
      await openLab(h, s.site, "demo=frontend/html-css/1");
      const task = h.page.getByTestId("task-panel");
      await task.waitFor();
      assert.match(await task.innerText(), /Fixture lesson: sums/);
      assert.equal(await task.getByRole("link", { name: "Back to lesson" }).getAttribute("href"), "/learn/frontend/html-css/");
      assert.match(await editorText(h.page), /demo says hi/);
      assert.match(await h.page.getByTestId("lang-trigger").innerText(), /JavaScript/);
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();
      assert.match(await resultPanel(h.page).innerText(), /demo says hi/);
      assert.match(await h.page.locator("body").innerText(), /Runs in your browser/);
      assert.equal(api.runs.length, 0);
      assert.equal(await h.page.getByTestId("tests-panel").count(), 0, "no grading for demos");
    });
  });

  it("?demo= pointing at a non-code section is a friendly not-found", async () => {
    await withFixtures({ signedIn: false }, new MockApi(), async (h) => {
      await h.page.goto(`${s.site.url}/code-lab/?demo=frontend/html-css/0`);
      await h.page.getByTestId("lab-not-found").waitFor();
      assert.match(await h.page.getByTestId("lab-not-found").innerText(), /couldn.t find that example/);
    });
  });

  it("?ch= preloads a challenge (starter, stdin, statement, chips) and Submit solution renders the grade, points and first blood", async () => {
    const api = new MockApi();
    const reply: SubmitResponse = {
      correct: true,
      awarded: 100,
      alreadySolved: false,
      firstBlood: true,
      grade: gradeOf([
        { name: "sample", passed: true },
        { name: "unicode names", passed: true },
      ]),
      quota: quotaInfo(),
    };
    api.submit = () => reply;
    await withFixtures({ signedIn: true }, api, async (h) => {
      await openLab(h, s.site, `ch=${challenge.id}`);
      const task = h.page.getByTestId("task-panel");
      await task.waitFor();
      assert.match(await task.innerText(), /Echo the name/);
      assert.match(await task.innerText(), /100 pts/);
      assert.match(await task.innerText(), /Hello, <name>!/);
      assert.match(await editorText(h.page), /# greet/);
      assert.equal(await h.page.getByLabel("Standard input (stdin)").inputValue(), "Ada\n");
      assert.equal(await task.getByRole("link", { name: "Back to challenge" }).getAttribute("href"), "/challenges/fixture-echo/");
      assert.equal(await task.getByRole("link", { name: /Challenges: Frontend Development/ }).getAttribute("href"), "/challenges/?track=frontend");

      await h.page.getByTestId("submit-button").click();
      const banner = h.page.getByTestId("submit-banner");
      await banner.waitFor();
      assert.deepEqual(api.submits, [{ id: "fixture-echo", body: { lang: "python", code: "name = input()\n# greet\n" } }]);
      assert.equal(await banner.getAttribute("data-correct"), "true");
      assert.match(await banner.innerText(), /\+100 points/);
      assert.match(await h.page.getByTestId("first-blood").innerText(), /First blood/);
    });
  });

  it("a rejected or already-solved submission is explained; guests are asked to sign in first", async () => {
    const api = new MockApi();
    api.submit = () => ({ correct: false, awarded: 0, alreadySolved: true, firstBlood: false, feedback: "Output differs on the unicode test." });
    await withFixtures({ signedIn: true }, api, async (h) => {
      await openLab(h, s.site, `ch=${challenge.id}&lang=ruby`);
      await h.page.getByTestId("task-panel").waitFor();
      assert.match(await h.page.getByTestId("lang-trigger").innerText(), /Ruby/);
      await h.page.getByTestId("submit-button").click();
      const banner = h.page.getByTestId("submit-banner");
      await banner.waitFor();
      assert.equal(await banner.getAttribute("data-correct"), "false");
      assert.match(await banner.innerText(), /already solved/);
      assert.match(await banner.innerText(), /unicode test/);
      assert.equal(api.submits[0].body.lang, "ruby");
    });
    await withFixtures({ signedIn: false }, new MockApi(), async (h) => {
      await openLab(h, s.site, `ch=${challenge.id}`);
      await h.page.getByTestId("submit-button").click();
      await h.page.getByRole("link", { name: /Sign in/ }).first().waitFor();
    });
  });

  it("an unknown challenge is a friendly not-found", async () => {
    await withFixtures({ signedIn: false }, new MockApi(), async (h) => {
      await h.page.goto(`${s.site.url}/code-lab/?ch=nope-nope`);
      await h.page.getByTestId("lab-not-found").waitFor();
      assert.match(await h.page.getByTestId("lab-not-found").innerText(), /couldn.t find that challenge/);
    });
  });

  it("?lang= alone pre-selects the language and its Hello World template", async () => {
    await withFixtures({ signedIn: true }, new MockApi(), async (h) => {
      await openLab(h, s.site, "lang=go");
      assert.match(await h.page.getByTestId("lang-trigger").innerText(), /Go/);
      assert.match(await editorText(h.page), /package main/);
    });
  });

  it("the exercise renders in Arabic with RTL chrome and an LTR editor", async () => {
    await withFixtures({ signedIn: true, lang: "ar" }, new MockApi(), async (h) => {
      await openLab(h, s.site, EX);
      await h.page.getByTestId("task-panel").waitFor();
      assert.equal(await h.page.evaluate(() => document.documentElement.dir), "rtl");
      assert.match(await h.page.getByTestId("task-panel").innerText(), /درس تجريبي/);
      assert.match(await h.page.getByTestId("task-panel").innerText(), /مجموعهما/);
      assert.equal(await h.page.locator(".cm-editor").first().evaluate((el) => getComputedStyle(el).direction), "ltr");
    });
  });
});
