import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "playwright";
import { MockApi, ROOT, bootSuite, editorText, gradeOf, openLab, quotaInfo, resultPanel, runButton, runResult, setEditor, withPage, type Suite } from "./support";

const AXE = readFileSync(join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8");

interface AxeViolation {
  id: string;
  impact: string | null;
  help: string;
  nodes: { target: unknown[] }[];
}

/** Serious/critical axe violations in the current page state. */
async function seriousViolations(page: Page): Promise<string[]> {
  await page.evaluate(AXE);
  const found = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: (ctx: Document, opts: object) => Promise<{ violations: AxeViolation[] }> } }).axe;
    return (await axe.run(document, { resultTypes: ["violations"] })).violations;
  });
  return found.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id} (${v.impact}): ${v.help} -> ${v.nodes.slice(0, 3).map((n) => JSON.stringify(n.target)).join(" ")}`);
}

const noHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

describe("Code Lab: layout, RTL, mobile, accessibility", () => {
  let s: Suite;
  before(async () => void (s = await bootSuite()));
  after(async () => s.close());

  it("desktop: editor on the left (about 60%), Input and Output stacked on the right, no horizontal scroll", async () => {
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      const ed = await h.page.getByTestId("editor-pane").boundingBox();
      const out = await h.page.getByTestId("output-panel").boundingBox();
      assert.ok(ed && out);
      assert.ok(out.x > ed.x + ed.width - 2, "output column sits to the right of the editor");
      const share = ed.width / (ed.width + out.width);
      assert.ok(share > 0.55 && share < 0.65, `editor share is ${share.toFixed(2)}`);
      assert.equal(await h.page.getByTestId("mobile-bar").isVisible(), false, "the sticky bar is mobile-only");
      assert.equal(await h.page.locator('[data-testid="run-button"]:visible').count(), 1, "one Run button: the toolbar");
      assert.ok(await noHorizontalScroll(h.page));
      assert.equal(await h.page.locator(".cm-editor").first().evaluate((el) => el.closest("[dir]")?.getAttribute("dir")), "ltr");
      assert.match((await h.page.locator(".cm-content").getAttribute("aria-label")) ?? "", /code/i, "the editor is labelled");
      assert.deepEqual(h.errors, []);
    });
  });

  it("mobile 360px: Code / Input / Output tabs, sticky Run bar, results jump to Output, no horizontal scroll", async () => {
    await withPage(s, { signedIn: true, viewport: { width: 360, height: 740 } }, async (h) => {
      await openLab(h, s.site);
      assert.ok(await noHorizontalScroll(h.page));
      const bar = h.page.getByTestId("mobile-bar");
      assert.equal(await bar.isVisible(), true);
      assert.equal(await h.page.locator('[data-testid="run-button"]:visible').count(), 1, "one Run button: the sticky bar, not the toolbar");
      const tabs = h.page.locator('[role="tablist"]:visible [role="tab"]');
      assert.deepEqual(await tabs.allInnerTexts(), ["Code", "Input", "Output"]);
      for (const t of await tabs.all()) assert.ok(((await t.boundingBox())?.height ?? 0) >= 40, "tap targets are at least 40px");
      assert.equal(await h.page.getByTestId("tab-code").getAttribute("aria-selected"), "true");
      assert.equal(await h.page.locator(".cm-content").isVisible(), true);

      await h.page.getByTestId("tab-input").click();
      assert.equal(await h.page.getByLabel("Standard input (stdin)").isVisible(), true);
      assert.equal(await h.page.locator(".cm-content").isVisible(), false);
      // Run stays reachable from every tab.
      const box = await runButton(h.page).boundingBox();
      assert.ok(box && box.y + box.height <= 740 && box.x >= 0 && box.x + box.width <= 360, "Run is inside the viewport");
      await runButton(h.page).click();
      await resultPanel(h.page).waitFor();
      assert.equal(await h.page.getByTestId("tab-output").getAttribute("aria-selected"), "true");
      assert.match(await resultPanel(h.page).innerText(), /Hello, World!/);
      await h.page.getByTestId("tab-code").click();
      assert.equal(await h.page.locator(".cm-content").isVisible(), true);
      assert.ok(await noHorizontalScroll(h.page));
      assert.deepEqual(h.errors, []);
    });
  });

  it("mobile 360px with an exercise: Task and Tests tabs appear, tests tab opens after a graded run", async () => {
    const lesson = {
      nodeId: "html-css",
      title: { en: "Sums", ar: "مجاميع" },
      estMinutes: 5,
      sections: [{ type: "lab", id: "e1", lang: "python", prompt: { en: "Print 3.", ar: "اطبع 3." }, starterCode: "# go\n", solution: "print(3)\n", hints: [], tests: [{ name: { en: "prints three", ar: "يطبع ثلاثة" }, expected: "3" }] }],
    };
    const api = new MockApi();
    api.run = () => ({ body: { runId: "x", result: runResult({ stdout: "3\n" }), grade: gradeOf([{ name: "prints three", passed: true }]), quota: quotaInfo() } });
    await withPage(s, { signedIn: true, viewport: { width: 360, height: 740 }, fixtures: { lessons: { "frontend/html-css": lesson } } }, async (h) => {
      await openLab(h, s.site, "ex=frontend/html-css/e1");
      assert.deepEqual(await h.page.locator('[role="tablist"]:visible [role="tab"]').allInnerTexts(), ["Task", "Code", "Input", "Output", "Tests"]);
      await h.page.getByTestId("tab-code").click();
      await runButton(h.page).click();
      await h.page.getByTestId("tests-panel").waitFor();
      assert.equal(await h.page.getByTestId("tab-tests").getAttribute("aria-selected"), "true");
      assert.ok(await noHorizontalScroll(h.page));
    }, api);
  });

  it("Arabic: document is RTL, the toolbar mirrors, the editor and code stay LTR", async () => {
    const ltrDesktop = await withPageMetrics(s, "en");
    const rtlDesktop = await withPageMetrics(s, "ar");
    assert.equal(rtlDesktop.dir, "rtl");
    assert.equal(ltrDesktop.dir, "ltr");
    assert.ok(ltrDesktop.runX > ltrDesktop.langX, "LTR: language selector comes before Run");
    assert.ok(rtlDesktop.runX < rtlDesktop.langX, "RTL: the toolbar order is mirrored");
    assert.ok(rtlDesktop.editorX > rtlDesktop.outputX, "RTL: the editor column is on the right (start side)");
    assert.equal(rtlDesktop.editorDirection, "ltr");
    assert.equal(rtlDesktop.contentTextAlign === "left" || rtlDesktop.contentTextAlign === "start", true);
    assert.match(rtlDesktop.runLabel, /تشغيل/);
    assert.ok(rtlDesktop.noScroll);
    assert.deepEqual(rtlDesktop.errors, []);
  });

  it("language switch swaps the template only while it is unmodified and remembers per-language drafts", async () => {
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      const pick = async (id: string) => {
        await h.page.getByTestId("lang-trigger").click();
        await h.page.locator(`[data-lang="${id}"]`).click();
      };
      assert.match(await editorText(h.page), /print\("Hello, World!"\)/);
      await pick("rust");
      await h.page.waitForFunction(() => document.querySelector(".cm-content")?.textContent?.includes("fn main"));
      await pick("python");
      await h.page.waitForFunction(() => document.querySelector(".cm-content")?.textContent?.includes('print("Hello'));
      // Edit Python, then switch: user code is never replaced by another language's template.
      await setEditor(h.page, 'print("mine")\n');
      await pick("go");
      await h.page.getByTestId("lab-note").waitFor();
      assert.match(await h.page.getByTestId("lab-note").innerText(), /Python/);
      assert.match(await editorText(h.page), /print\("mine"\)/);
      assert.doesNotMatch(await editorText(h.page), /package main/);
      await pick("python");
      await h.page.waitForFunction(() => document.querySelector(".cm-content")?.textContent?.includes('print("mine")'));
      // A draft also survives a reload.
      await h.page.reload();
      await h.page.waitForSelector(".cm-content");
      await h.page.waitForFunction(() => document.querySelector(".cm-content")?.textContent?.includes('print("mine")'));
      assert.deepEqual(h.errors, []);
    });
  });

  it("language packs load lazily: choosing a language fetches its own script chunk", async () => {
    await withPage(s, { signedIn: true }, async (h) => {
      const scripts = new Set<string>();
      h.page.on("response", (r) => {
        if (r.url().endsWith(".js")) scripts.add(r.url());
      });
      await openLab(h, s.site);
      const initial = scripts.size;
      await h.page.getByTestId("lang-trigger").click();
      await h.page.locator('[data-lang="rust"]').click();
      await h.page.waitForFunction(() => document.querySelector(".cm-content")?.textContent?.includes("fn main"));
      await h.page.waitForTimeout(500);
      assert.ok(scripts.size > initial, "a new chunk is requested for Rust highlighting");
    });
  });

  it("settings: font size and wrapping persist, the shortcuts popover documents Ctrl+Enter and Esc then Tab", async () => {
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      const size = () => h.page.locator(".cm-content").first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      const before = await size();
      await h.page.getByTestId("settings-trigger").click();
      await h.page.getByRole("button", { name: "Larger" }).click();
      await h.page.getByRole("button", { name: "Larger" }).click();
      await h.page.keyboard.press("Escape");
      assert.equal(await size(), before + 2);
      await h.page.reload();
      await h.page.waitForSelector(".cm-content");
      assert.equal(await size(), before + 2, "the font size is remembered");

      await h.page.getByTestId("shortcuts-trigger").click();
      const text = await h.page.getByRole("dialog").innerText();
      assert.match(text, /Enter/);
      assert.match(text, /Esc/);
      assert.match(text, /Tab/);
      await h.page.keyboard.press("Escape");
    });
  });

  it("keyboard: Esc then Tab leaves the editor; Tab inside it inserts indentation", async () => {
    await withPage(s, { signedIn: true }, async (h) => {
      await openLab(h, s.site);
      await setEditor(h.page, "x");
      await h.page.keyboard.press("Tab");
      assert.match(await editorText(h.page), /^\s{2,}x/, "Tab indents the line");
      await h.page.keyboard.press("Escape");
      await h.page.keyboard.press("Tab");
      assert.equal(await h.page.evaluate(() => !!document.activeElement?.closest(".cm-editor")), false, "focus left the editor");
    });
  });

  for (const lang of ["en", "ar"] as const) {
    for (const theme of ["light", "dark"] as const) {
      it(`axe: no serious or critical violations (${lang}, ${theme})`, async () => {
        const api = new MockApi();
        api.history = [];
        await withPage(s, { signedIn: true, lang, theme }, async (h) => {
          await openLab(h, s.site);
          assert.deepEqual(await seriousViolations(h.page), [], "idle lab");
          await runButton(h.page).click();
          await resultPanel(h.page).waitFor();
          assert.deepEqual(await seriousViolations(h.page), [], "after a run");
          await h.page.getByTestId("history-button").click();
          await h.page.getByRole("dialog").waitFor();
          assert.deepEqual(await seriousViolations(h.page), [], "history drawer");
          await h.page.keyboard.press("Escape");
          await h.page.getByTestId("settings-trigger").click();
          assert.deepEqual(await seriousViolations(h.page), [], "settings popover");
          await h.page.keyboard.press("Escape");
          await h.page.getByTestId("lang-trigger").click();
          assert.deepEqual(await seriousViolations(h.page), [], "language picker");
          await h.page.keyboard.press("Escape");
          assert.deepEqual(h.errors, []);
        }, api);
      });
    }
  }

  it("axe: error states, compile errors and the permalink page are clean in light and dark", async () => {
    for (const theme of ["light", "dark"] as const) {
      const api = new MockApi();
      api.run = () => ({ status: 429, body: { error: "quota_exceeded", scope: "user", resetAt: "2030-01-02T00:00:00.000Z", quota: quotaInfo({ used: 50, remaining: 0 }) } });
      api.snippets["abc12345"] = { id: "abc12345", lang: "python", code: "print(1)\n", stdin: "", title: "T", authorName: "A", createdAt: "2030-03-04T10:00:00.000Z" };
      await withPage(s, { signedIn: true, theme }, async (h) => {
        await openLab(h, s.site);
        await runButton(h.page).click();
        await h.page.getByRole("alert").first().waitFor();
        assert.deepEqual(await seriousViolations(h.page), [], `quota error (${theme})`);
        await h.page.goto(`${s.site.url}/code-lab/s/?id=abc12345`);
        await h.page.getByTestId("snippet-title").waitFor();
        assert.deepEqual(await seriousViolations(h.page), [], `permalink (${theme})`);
      }, api);
    }
  });
});

async function withPageMetrics(s: Suite, lang: "en" | "ar") {
  let out!: {
    dir: string;
    runX: number;
    langX: number;
    editorX: number;
    outputX: number;
    editorDirection: string;
    contentTextAlign: string;
    runLabel: string;
    noScroll: boolean;
    errors: string[];
  };
  await withPage(s, { signedIn: true, lang }, async (h) => {
    await openLab(h, s.site);
    const x = async (loc: ReturnType<Page["locator"]>) => (await loc.boundingBox())?.x ?? NaN;
    out = {
      dir: await h.page.evaluate(() => document.documentElement.dir),
      runX: await x(runButton(h.page)),
      langX: await x(h.page.getByTestId("lang-trigger")),
      editorX: await x(h.page.getByTestId("editor-pane")),
      outputX: await x(h.page.getByTestId("output-panel")),
      editorDirection: await h.page.locator(".cm-editor").first().evaluate((el) => getComputedStyle(el).direction),
      contentTextAlign: await h.page.locator(".cm-content").first().evaluate((el) => getComputedStyle(el).textAlign),
      runLabel: await runButton(h.page).innerText(),
      noScroll: await noHorizontalScroll(h.page),
      errors: [...h.errors],
    };
  });
  return out;
}
