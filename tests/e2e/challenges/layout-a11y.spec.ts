import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { Browser, Page } from "playwright";
import { describeViolations, eventually, launchBrowser, openPage, seriousViolations, startSite, type ContextOptions } from "./harness";

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

/** Waits until the page's async content (stats / leaderboard) has landed. */
const READY: Record<string, (p: Page) => Promise<unknown>> = {
  "/challenges/": (p) => p.getByTestId("ctf-card").filter({ hasText: /412/ }).first().waitFor(),
  "/challenges/caesar-warmup/": (p) => p.locator("aside dl").first().waitFor(),
  "/challenges/interval-merge/": (p) => p.getByTestId("open-code-lab").waitFor(),
  "/challenges/leaderboard/": (p) => p.getByRole("table").waitFor(),
};
const PATHS = Object.keys(READY);

const VARIANTS: { name: string; o: ContextOptions }[] = [
  { name: "EN light", o: { lang: "en", theme: "light" } },
  { name: "EN dark", o: { lang: "en", theme: "dark" } },
  { name: "AR light", o: { lang: "ar", theme: "light" } },
  { name: "AR dark", o: { lang: "ar", theme: "dark" } },
];

describe("accessibility (axe-core: zero serious/critical)", () => {
  for (const path of PATHS) {
    for (const v of VARIANTS) {
      it(`${path} ${v.name}, signed in`, async () => {
        const t = await openPage(browser, origin, path, { ...v.o, signedIn: true });
        try {
          await READY[path](t.page);
          const found = await seriousViolations(t.page);
          assert.equal(found.length, 0, `\n${describeViolations(found)}`);
          assert.deepEqual(t.errors, [], "no console errors or hydration warnings");
        } finally {
          await t.close();
        }
      });
    }
  }

  it("signed-out list and detail (light + dark, mobile)", async () => {
    for (const theme of ["light", "dark"] as const) {
      for (const path of ["/challenges/", "/challenges/hidden-in-logs/"]) {
        const t = await openPage(browser, origin, path, { theme, viewport: { width: 360, height: 780 } });
        try {
          await t.page.waitForLoadState("networkidle");
          const found = await seriousViolations(t.page);
          assert.equal(found.length, 0, `${path} ${theme}\n${describeViolations(found)}`);
        } finally {
          await t.close();
        }
      }
    }
  });

  it("interactive states: filters open, hint confirm, result panels (EN + AR, light + dark)", async () => {
    for (const lang of ["en", "ar"] as const) {
      for (const theme of ["light", "dark"] as const) {
        const list = await openPage(browser, origin, "/challenges/?difficulty=2", { lang, theme, signedIn: true, viewport: { width: 390, height: 800 } });
        try {
          await READY["/challenges/"](list.page);
          await list.page.locator('button[aria-controls="ctf-more-filters"]').click();
          const found = await seriousViolations(list.page);
          assert.equal(found.length, 0, `list ${lang} ${theme}\n${describeViolations(found)}`);
        } finally {
          await list.close();
        }

        const d = await openPage(browser, origin, "/challenges/hidden-in-logs/", { lang, theme, signedIn: true });
        try {
          await d.page.locator('button:has(svg.lucide-lightbulb)').first().click();
          assert.equal((await seriousViolations(d.page)).length, 0, `hint confirm ${lang} ${theme}`);
          await d.page.locator('input[name="flag"]').fill("IMB{wrong}");
          await d.page.locator('form button[type="submit"]').click();
          await d.page.getByTestId("ctf-incorrect").waitFor();
          const found = await seriousViolations(d.page);
          assert.equal(found.length, 0, `incorrect result ${lang} ${theme}\n${describeViolations(found)}`);
          // error + success variants
          d.api.submit = () => ({ status: 429, headers: { "retry-after": "20" }, json: { error: "rate_limited", retryAfterSec: 20 } });
          await d.page.locator('input[name="flag"]').fill("IMB{again}");
          await d.page.locator('form button[type="submit"]').click();
          await d.page.locator('[data-testid="ctf-error"]').waitFor();
          const rate = await seriousViolations(d.page);
          assert.equal(rate.length, 0, `rate limited ${lang} ${theme}\n${describeViolations(rate)}`);
        } finally {
          await d.close();
        }

        const ok = await openPage(browser, origin, "/challenges/hidden-in-logs/", {
          lang,
          theme,
          signedIn: true,
          api: Object.assign((await import("./harness")).defaultMock(), {
            submit: () => ({ correct: true, awarded: 150, alreadySolved: false, firstBlood: true }),
          }),
        });
        try {
          await ok.page.locator('input[name="flag"]').fill("IMB{x}");
          await ok.page.locator('form button[type="submit"]').click();
          await ok.page.getByTestId("ctf-first-blood").waitFor();
          await ok.page.waitForTimeout(1400); // let the celebration settle so contrast is measured on the final frame
          const found = await seriousViolations(ok.page);
          assert.equal(found.length, 0, `correct ${lang} ${theme}\n${describeViolations(found)}`);
        } finally {
          await ok.close();
        }
      }
    }
  });
});

describe("RTL and mobile layout", () => {
  it("Arabic sets rtl and renders localized strings and titles from the metadata", async () => {
    const t = await openPage(browser, origin, "/challenges/", { lang: "ar", signedIn: true });
    try {
      await READY["/challenges/"](t.page);
      assert.equal(await t.page.evaluate(() => document.documentElement.dir), "rtl");
      assert.equal(await t.page.evaluate(() => document.documentElement.lang), "ar");
      await eventually(async () => assert.equal(await t.page.locator("h1").innerText(), "التحديات"));
      const arCard = t.page.getByTestId("ctf-card").filter({ has: t.page.getByRole("link", { name: "تمرين قيصر", exact: true }) });
      assert.equal(await arCard.count(), 1);
      const text = await arCard.innerText();
      assert.match(text, /سهل/);
      assert.match(text, /412/);
      assert.deepEqual(t.errors, []);
    } finally {
      await t.close();
    }
  });

  it("Arabic detail page: statement is rtl, code and flag input stay ltr", async () => {
    const t = await openPage(browser, origin, "/challenges/caesar-warmup/", { lang: "ar", signedIn: true });
    try {
      await t.page.locator("aside dl").first().waitFor();
      // the prerendered HTML is English; the language switches right after hydration
      await eventually(async () => assert.equal(await t.page.getByRole("heading", { level: 1 }).innerText(), "تمرين قيصر"));
      const dir = (sel: string) => t.page.locator(sel).first().evaluate((e) => getComputedStyle(e).direction);
      await eventually(async () => {
        assert.equal(await dir("main pre"), "ltr");
        assert.equal(await dir('input[name="flag"]'), "ltr");
        assert.equal(await dir("h1"), "rtl");
      });
      // the sidebar sits at the inline end: left of the statement in RTL
      const stmt = await t.page.locator("#ctf-statement").boundingBox();
      const aside = await t.page.locator("aside").first().boundingBox();
      assert.ok(stmt && aside && aside.x < stmt.x, "aside is on the left in RTL");
      assert.match(await t.page.locator("main").innerText(), /تلميح/);
    } finally {
      await t.close();
    }
  });

  it("English detail page keeps the sidebar at the right", async () => {
    const t = await openPage(browser, origin, "/challenges/caesar-warmup/");
    try {
      await t.page.locator("aside dl, aside section").first().waitFor();
      const stmt = await t.page.locator("#ctf-statement").boundingBox();
      const aside = await t.page.locator("aside").first().boundingBox();
      assert.ok(stmt && aside && aside.x > stmt.x);
    } finally {
      await t.close();
    }
  });

  for (const lang of ["en", "ar"] as const) {
    for (const path of PATHS) {
      it(`360px: ${path} (${lang}) has no horizontal scroll and 40px+ tap targets`, async () => {
        const t = await openPage(browser, origin, path, { lang, signedIn: true, viewport: { width: 360, height: 760 } });
        try {
          await READY[path](t.page);
          await t.page.waitForTimeout(300);
          const m = await t.page.evaluate(() => {
            const vw = document.documentElement.clientWidth;
            const small: string[] = [];
            document.querySelectorAll("main a[href], main button, main select, main input:not([type=radio]), main textarea, main summary").forEach((el) => {
              const r = el.getBoundingClientRect();
              const cs = getComputedStyle(el);
              if (!r.width || cs.visibility === "hidden" || el.closest("[hidden]") || el.closest(".sr-only")) return;
              // a link stretched over its card (::after, position:absolute) is as large as the card
              if (el.tagName === "A" && getComputedStyle(el, "::after").position === "absolute") {
                const card = el.closest("article");
                if (card && card.getBoundingClientRect().height >= 40) return;
              }
              // inline text links inside paragraphs are exempt (WCAG 2.5.8 inline exception)
              if (el.tagName === "A" && el.closest("p, li > span") && cs.display === "inline") return;
              if (r.height < 40 - 0.5 && !(el.closest("nav") && r.height >= 32)) small.push(`${el.tagName} "${(el.textContent ?? "").trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
            });
            return { overflow: document.documentElement.scrollWidth - vw, small };
          });
          assert.ok(m.overflow <= 0, `page is ${m.overflow}px wider than the viewport`);
          assert.deepEqual(m.small, [], "tap targets under 40px");
        } finally {
          await t.close();
        }
      });
    }
  }

  it("leaderboard becomes stacked cards on mobile and a table on desktop", async () => {
    const mobile = await openPage(browser, origin, "/challenges/leaderboard/", { viewport: { width: 360, height: 760 } });
    try {
      await mobile.page.getByRole("table").waitFor();
      assert.equal(await mobile.page.getByRole("columnheader").first().isVisible(), false, "column headers are hidden on phones");
      const row = mobile.page.locator('[data-testid="lb-rows"] > [role="row"]').first();
      assert.match(await row.innerText(), /Layla Hassan/);
      assert.match(await row.innerText(), /2,450/);
      assert.ok(((await row.boundingBox())?.width ?? 999) <= 360);
    } finally {
      await mobile.close();
    }
    const desktop = await openPage(browser, origin, "/challenges/leaderboard/", { viewport: { width: 1280, height: 800 } });
    try {
      await desktop.page.getByRole("table").waitFor();
      assert.equal(await desktop.page.getByRole("columnheader").first().isVisible(), true);
    } finally {
      await desktop.close();
    }
  });

  it("list grid goes 1 / 2 / 3 columns across breakpoints", async () => {
    const cols = async (width: number) => {
      const t = await openPage(browser, origin, "/challenges/", { viewport: { width, height: 800 } });
      try {
        await t.page.getByTestId("ctf-grid").waitFor();
        return await t.page.getByTestId("ctf-grid").evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length);
      } finally {
        await t.close();
      }
    };
    assert.deepEqual([await cols(360), await cols(700), await cols(1300)], [1, 2, 3]);
  });

  it("mobile filters live behind a labelled toggle, with the search always visible", async () => {
    const t = await openPage(browser, origin, "/challenges/", { viewport: { width: 360, height: 760 } });
    try {
      await t.page.getByTestId("ctf-grid").waitFor();
      const toggle = t.page.locator('button[aria-controls="ctf-more-filters"]');
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
      assert.equal(await t.page.locator("#ctf-sort").isVisible(), false);
      assert.equal(await t.page.getByRole("searchbox").isVisible(), true);
      await toggle.click();
      assert.equal(await toggle.getAttribute("aria-expanded"), "true");
      await eventually(async () => assert.equal(await t.page.locator("#ctf-sort").isVisible(), true));
    } finally {
      await t.close();
    }
  });

  it("filters are real form controls with accessible names and keyboard support", async () => {
    const t = await openPage(browser, origin, "/challenges/");
    try {
      await t.page.getByTestId("ctf-grid").waitFor();
      assert.equal(await t.page.getByRole("radiogroup").count() + (await t.page.locator("fieldset").count()) > 0, true);
      assert.equal(await t.page.getByRole("combobox", { name: "Type" }).count(), 1);
      assert.equal(await t.page.getByRole("combobox", { name: "Sort by" }).count(), 1);
      assert.equal(await t.page.getByRole("searchbox", { name: "Search" }).count(), 1);
      // arrow keys move through the radio chips of a group (native behaviour) and apply the filter
      await t.page.locator('input[name="ctf-difficulty"]').first().focus();
      await t.page.keyboard.press("ArrowRight");
      await eventually(() => assert.match(t.page.url(), /difficulty=1/));
      // cards are single focus stops: one link per card
      assert.equal(await t.page.locator('[data-testid="ctf-grid"] li').first().locator("a, button").count(), 1);
    } finally {
      await t.close();
    }
  });
});
