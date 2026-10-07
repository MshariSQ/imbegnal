/**
 * Visual capture of the key states. Skipped unless SCREENSHOTS=1 so the normal
 * run stays fast; PNGs go to tests/e2e/codelab/artifacts/ (git-ignored).
 */
import { after, before, describe, it } from "node:test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "playwright";
import { MockApi, bootSuite, gradeOf, openLab, quotaInfo, resultPanel, runButton, runResult, setEditor, withPage, type Suite } from "./support";

const DIR = join(__dirname, "artifacts");
const on = process.env.SCREENSHOTS === "1";

const PY = `def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

for i in range(10):
    print(i, fib(i))
`;

describe("Code Lab: screenshots", { skip: !on && "set SCREENSHOTS=1" }, () => {
  let s: Suite;
  before(async () => {
    mkdirSync(DIR, { recursive: true });
    s = await bootSuite();
  });
  after(async () => s?.close());

  const shot = (page: Page, name: string) => page.screenshot({ path: join(DIR, `${name}.png`) });

  const okRun = (api: MockApi) => {
    api.run = () => ({
      body: {
        runId: "r1",
        result: runResult({ stdout: Array.from({ length: 10 }, (_, i) => `${i} ${[0, 1, 1, 2, 3, 5, 8, 13, 21, 34][i]}`).join("\n") + "\n", stderr: "warning: demo stderr line\n", runMs: 38, compileMs: 0 }),
        quota: quotaInfo(),
      },
    });
  };

  for (const [lang, theme, viewport, name] of [
    ["en", "dark", { width: 1360, height: 860 }, "desktop-en-dark"],
    ["en", "light", { width: 1360, height: 860 }, "desktop-en-light"],
    ["ar", "dark", { width: 1360, height: 860 }, "desktop-ar-dark"],
    ["ar", "light", { width: 360, height: 760 }, "mobile-ar-light"],
    ["en", "dark", { width: 360, height: 760 }, "mobile-en-dark"],
  ] as const) {
    it(`finished run: ${name}`, async () => {
      const api = new MockApi();
      okRun(api);
      await withPage(s, { signedIn: true, lang, theme, viewport }, async (h) => {
        await openLab(h, s.site);
        await setEditor(h.page, PY);
        await runButton(h.page).click();
        await resultPanel(h.page).waitFor();
        await h.page.waitForTimeout(400);
        await shot(h.page, name);
      }, api);
    });
  }

  it("error states", async () => {
    for (const [name, status, body] of [
      ["quota", 429, { error: "quota_exceeded", scope: "user", resetAt: "2030-01-02T00:00:00.000Z", quota: quotaInfo({ used: 50, remaining: 0 }) }],
      ["runner-down", 503, { error: "runner_unavailable" }],
    ] as const) {
      const api = new MockApi();
      api.quota = quotaInfo({ used: 50, remaining: 0 });
      api.run = () => ({ status, body });
      await withPage(s, { signedIn: true, lang: "en", theme: "dark" }, async (h) => {
        await openLab(h, s.site, "lang=javascript");
        await runButton(h.page).click();
        await h.page.getByRole("alert").first().waitFor();
        await shot(h.page, `error-${name}`);
      }, api);
    }
    await withPage(s, { signedIn: false, lang: "en", theme: "light", viewport: { width: 360, height: 760 } }, async (h) => {
      await openLab(h, s.site, "lang=rust");
      await runButton(h.page).click();
      await h.page.getByRole("alert").first().waitFor();
      await shot(h.page, "error-guest-mobile");
    });
  });

  it("lesson exercise with grading", async () => {
    const lesson = {
      nodeId: "html-css",
      title: { en: "Reading input", ar: "قراءة المدخلات" },
      estMinutes: 8,
      sections: [
        {
          type: "lab",
          id: "sum-two",
          lang: "python",
          prompt: { en: "Read two integers, one per line, and print their **sum**.", ar: "اقرأ عددين صحيحين، كل واحد في سطر، واطبع **مجموعهما**." },
          starterCode: "a = int(input())\nb = int(input())\n# print the sum\n",
          solution: "print(int(input()) + int(input()))\n",
          hints: [{ en: "input() returns text: convert it with int().", ar: "الدالة input() تعيد نصاً: حوّله بـ int()." }],
          tests: [
            { name: { en: "small numbers", ar: "أعداد صغيرة" }, stdin: "1\n2\n", expected: "3" },
            { name: { en: "negative numbers", ar: "أعداد سالبة" }, stdin: "-1\n-2\n", expected: "-3" },
          ],
          sampleInput: "1\n2\n",
        },
      ],
    };
    for (const lang of ["en", "ar"] as const) {
      const api = new MockApi();
      api.run = () => ({
        body: {
          runId: "g",
          result: runResult({ stdout: "" }),
          grade: gradeOf([
            { name: lang === "en" ? "small numbers" : "أعداد صغيرة", passed: true },
            { name: lang === "en" ? "negative numbers" : "أعداد سالبة", passed: false, expected: "-3", actual: "" },
          ]),
          quota: quotaInfo(),
        },
      });
      await withPage(s, { signedIn: true, lang, theme: "dark", fixtures: { lessons: { "frontend/html-css": lesson } } }, async (h) => {
        await openLab(h, s.site, "ex=frontend/html-css/sum-two");
        await h.page.getByTestId("task-panel").waitFor();
        await runButton(h.page).click();
        await h.page.getByTestId("tests-panel").waitFor();
        await h.page.waitForTimeout(400);
        await shot(h.page, `exercise-${lang}`);
      }, api);
    }
  });
});
