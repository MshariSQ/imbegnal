/**
 * UI tests for the instructor analytics dashboard /instructor/.
 *
 * Run (build first; the specs serve `out/` and mock the Worker, no network needed):
 *   npm run build
 *   node --import tsx --test --test-concurrency=1 tests/e2e/phase3/*.spec.ts
 * Single file: node --import tsx --test tests/e2e/phase3/instructor.spec.ts
 * Env: PHASE3_E2E_SITE_DIR (another export), PHASE3_E2E_API_ORIGIN (if built with NEXT_PUBLIC_API_URL),
 *      CHROMIUM_PATH / PLAYWRIGHT_BROWSERS_PATH (when Playwright's own browser is not installed).
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { Browser, Locator, Page } from "playwright";
import { getLanguage } from "../../../shared/languages";
import { translations } from "../../../lib/i18n";
import {
  ANALYTICS_30,
  ANALYTICS_7,
  ANALYTICS_EMPTY,
  TEST_TOKEN,
  defaultWorker,
  describeViolations,
  launchBrowser,
  openPage,
  pageOverflow,
  seriousViolations,
  startSite,
  type MockWorker,
  type OpenedPage,
} from "./harness";

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

const en = translations.en.instructor;
const ar = translations.ar.instructor;

function workerFor(): MockWorker {
  const w = defaultWorker();
  w.analytics = (days) => ({ json: days === 7 ? ANALYTICS_7 : ANALYTICS_30 });
  return w;
}

function clean(t: OpenedPage) {
  assert.deepEqual(t.errors, [], "no console errors or hydration warnings");
  assert.deepEqual(t.blocked, [], "no request left loopback or the Worker origin");
}

async function noOverflow(t: OpenedPage, label: string) {
  const o = await pageOverflow(t.page);
  assert.ok(o.ok, `${label}: horizontal page overflow (${o.scrollWidth} > ${o.innerWidth})`);
}

const open = (o: Parameters<typeof openPage>[3] = {}) => openPage(browser, origin, "/instructor/", { signedIn: true, worker: workerFor(), ...o });
const report = (page: Page) => page.getByTestId("instructor-report");
const table = (page: Page, caption: string) => page.getByRole("table", { name: caption });
const rowKeys = (tbl: Locator) => tbl.locator("tbody tr").evaluateAll((rows) => rows.map((r) => r.getAttribute("data-row")));
const stat = (page: Page, id: string) => page.getByTestId(`stat-${id}`).locator("dd").first();

describe("signed out", () => {
  it("asks to sign in, links to the login page with a safe next, and never calls the Worker", async () => {
    const t = await open({ signedIn: false });
    try {
      const box = t.page.getByTestId("instructor-signin");
      await box.waitFor();
      assert.match(await box.innerText(), /Sign in to see analytics/);
      const href = await box.getByRole("link", { name: en.signIn.cta }).getAttribute("href");
      assert.equal(href, "/login/?next=%2Finstructor%2F");
      assert.equal(new URL(href!, "http://x").searchParams.get("next"), "/instructor/");
      assert.equal(t.worker.callsTo("/api/instructor/").length, 0);
      assert.equal(await t.page.getByRole("group", { name: en.period }).count(), 0, "no period selector without access");
      assert.equal(await t.page.locator('meta[name="robots"]').getAttribute("content"), "noindex, nofollow");
      clean(t);
    } finally {
      await t.close();
    }
  });

  it("the server-rendered HTML is a neutral shell (no sign-in prompt, no data)", async () => {
    const t = await open({ javaScript: false, signedIn: false });
    try {
      assert.equal(await t.page.getByRole("heading", { level: 1 }).innerText(), en.title);
      assert.equal(await t.page.getByTestId("instructor-signin").count(), 0);
      assert.equal(await t.page.getByTestId("instructor-report").count(), 0);
      assert.equal(await t.page.getByTestId("instructor-skeleton").count(), 1);
    } finally {
      await t.close();
    }
  });
});

describe("access errors", () => {
  it("403 explains that the page is for instructors", async () => {
    const w = defaultWorker();
    w.analytics = () => ({ status: 403, json: { error: "forbidden" } });
    const t = await open({ worker: w });
    try {
      const box = t.page.getByTestId("instructor-forbidden");
      await box.waitFor();
      assert.match(await box.innerText(), /This page is for instructors\. Ask an administrator to grant you the instructor role\./);
      assert.equal(await t.page.getByRole("group", { name: en.period }).count(), 0);
      assert.equal(await t.page.getByTestId("instructor-report").count(), 0);
      assert.equal(t.worker.callsTo("/api/instructor/analytics")[0].auth, `Bearer ${TEST_TOKEN}`);
      clean(t);
    } finally {
      await t.close();
    }
  });

  it("401 (stale token) asks to sign in again", async () => {
    const w = defaultWorker();
    w.analytics = () => ({ status: 401, json: { error: "unauthorized" } });
    const t = await open({ worker: w });
    try {
      const box = t.page.getByTestId("instructor-expired");
      await box.waitFor();
      assert.match(await box.innerText(), /session has expired/);
      assert.equal(await box.getByRole("link").getAttribute("href"), "/login/?next=%2Finstructor%2F");
      clean(t);
    } finally {
      await t.close();
    }
  });

  it("a suspended account gets its own message", async () => {
    const w = defaultWorker();
    w.analytics = () => ({ status: 403, json: { error: "account_suspended" } });
    const t = await open({ worker: w });
    try {
      await t.page.getByTestId("instructor-suspended").waitFor();
      assert.equal(await t.page.getByTestId("instructor-forbidden").count(), 0);
      clean(t);
    } finally {
      await t.close();
    }
  });

  it("a server error offers Retry, and Retry loads the report", async () => {
    const w = defaultWorker();
    w.analytics = (_d, _a, call) => (call === 1 ? { status: 500, json: { error: "internal_error" } } : { json: ANALYTICS_30 });
    const t = await open({ worker: w });
    try {
      const box = t.page.getByTestId("instructor-error");
      await box.waitFor();
      await box.getByRole("button", { name: en.error.retry }).click();
      await report(t.page).waitFor();
      assert.equal(await t.page.getByTestId("instructor-error").count(), 0);
      assert.equal(w.callsTo("/api/instructor/analytics").length, 2);
      clean(t);
    } finally {
      await t.close();
    }
  });

  it("an unreachable Worker and a garbage body both land on the retry state", async () => {
    for (const reply of [{ abort: true as const }, { status: 200, text: "<html>oops</html>" }]) {
      const w = defaultWorker();
      w.analytics = () => reply;
      const t = await open({ worker: w });
      try {
        await t.page.getByTestId("instructor-error").waitFor();
        clean(t);
      } finally {
        await t.close();
      }
    }
  });
});

describe("dashboard (English)", () => {
  it("renders the realistic payload: stats, bars, tables, ordering, details and period switching", async () => {
    const t = await open();
    try {
      const page = t.page;
      await report(page).waitFor();
      assert.equal(await page.getByRole("heading", { level: 1 }).innerText(), en.title);
      const call = t.worker.callsTo("/api/instructor/analytics")[0];
      assert.equal(call.path, "/api/instructor/analytics?days=30");
      assert.equal(call.auth, `Bearer ${TEST_TOKEN}`);

      // period selector: segmented buttons with aria-pressed
      const group = page.getByRole("group", { name: en.period });
      assert.equal(await group.getByRole("button").count(), 3);
      await group.getByRole("button", { name: "30 days", pressed: true }).waitFor();
      assert.equal(await group.getByRole("button", { name: "7 days" }).getAttribute("aria-pressed"), "false");
      assert.equal(await group.getByRole("button", { name: "90 days" }).getAttribute("aria-pressed"), "false");
      assert.equal(await page.locator("time").getAttribute("datetime"), ANALYTICS_30.generatedAt);

      // summary
      assert.equal(await stat(page, "runs").innerText(), "1,284");
      assert.equal(await stat(page, "success").innerText(), "70.2%");
      assert.match(await page.getByTestId("stat-success").innerText(), /902 of 1,284 runs succeeded/);
      assert.equal(await stat(page, "solves").innerText(), "43");
      assert.equal(await stat(page, "completions").innerText(), "50");

      // bar lists: labels from shared/languages, numbers as text
      const byLang = page.getByTestId("runs-by-lang");
      const python = byLang.locator('li[data-key="python"]');
      assert.match(await python.innerText(), new RegExp(`${getLanguage("python")!.label}[\\s\\S]*612[\\s\\S]*47\\.7%`));
      assert.match(await byLang.locator('li[data-key="javascript"]').innerText(), /JavaScript \(Node\.js\)/);
      assert.deepEqual(await byLang.locator("li").evaluateAll((l) => l.map((x) => x.getAttribute("data-key"))), ["python", "javascript", "java", "cpp", "go", "rust", "typescript"]);
      const byStatus = page.getByTestId("runs-by-status");
      assert.match(await byStatus.innerText(), /Succeeded[\s\S]*902/);
      assert.match(await byStatus.innerText(), /Compile error/);
      assert.match(await byStatus.innerText(), /Internal error/);

      // tracks table: real <table>, caption, scoped headers, localized titles, raw id fallback
      const tracks = table(page, en.tracks.caption);
      assert.equal(await tracks.locator("th[scope=col]").count(), 5);
      assert.equal(await tracks.locator("tbody th[scope=row]").count(), 4);
      assert.deepEqual(await rowKeys(tracks), ["frontend", "cyber-security", "data-science", "legacy-track"]);
      const frontend = await tracks.locator('tr[data-row="frontend"]').innerText();
      assert.match(frontend, /Frontend Development/);
      assert.match(frontend, /148/);
      assert.match(frontend, /25%/);
      assert.match(frontend, /6 h 51 min/);
      assert.match(await tracks.locator('tr[data-row="legacy-track"]').innerText(), /legacy-track/);
      assert.match(await tracks.locator('tr[data-row="data-science"]').innerText(), /—/, "no median yet");

      // exercises: lowest pass rate first
      const ex = table(page, en.exercises.caption);
      assert.equal(await ex.locator("th[scope=col]").count(), 7);
      assert.deepEqual(await rowKeys(ex), ["data-science/python-basics/mean", "cyber-security/networking/subnet-calc", "challenge:caesar-warmup", "frontend/html-basics/hello-page"]);
      const subnet = ex.locator('tr[data-row="cyber-security/networking/subnet-calc"]');
      const subnetText = await subnet.innerText();
      assert.match(subnetText, /31%/);
      assert.match(subnetText, /1\.3 s/);
      assert.match(subnetText, /Wrong output \(120\)/);
      assert.match(subnetText, /Time limit exceeded \(8\)/);
      assert.doesNotMatch(subnetText, /Compile error/, "only the top three reasons");
      assert.match(await ex.locator('tr[data-row="challenge:caesar-warmup"]').innerText(), /Challenge/);
      assert.match(await ex.locator('tr[data-row="frontend/html-basics/hello-page"]').innerText(), /140 ms/);

      // commonErrors live in <details>, rendered as plain text
      const details = subnet.locator("details");
      assert.equal(await details.evaluate((d) => (d as HTMLDetailsElement).open), false);
      await details.locator("summary").click();
      assert.equal(await details.evaluate((d) => (d as HTMLDetailsElement).open), true);
      assert.equal(await details.locator("summary").innerText(), "3 common errors");
      assert.ok((await details.innerText()).includes("<img src=x onerror=alert(1)>"), "markup in an error line is shown literally");
      assert.equal(await ex.locator("img").count(), 0, "nothing was injected as an element");
      assert.equal(await details.locator("code").first().getAttribute("dir"), "ltr");

      // challenges: active first by attempts, idle ones summarised
      const ch = table(page, en.challenges.caption);
      assert.deepEqual(await rowKeys(ch), ["caesar-warmup", "scheduler-sim"]);
      const caesar = await ch.locator('tr[data-row="caesar-warmup"]').innerText();
      assert.match(caesar, /41/);
      assert.match(caesar, /8 min/);
      assert.match(await ch.locator('tr[data-row="scheduler-sim"]').innerText(), /1 h 35 min/);
      assert.match(await ch.locator("tfoot").innerText(), /2 other challenges had no activity in this period\./);

      // switching the period refetches and replaces every number
      await group.getByRole("button", { name: "7 days" }).click();
      await group.getByRole("button", { name: "7 days", pressed: true }).waitFor();
      await page.waitForFunction(() => document.querySelector('[data-testid="stat-runs"] dd')?.textContent === "311");
      assert.equal(await group.getByRole("button", { name: "30 days" }).getAttribute("aria-pressed"), "false");
      assert.equal(t.worker.callsTo("/api/instructor/analytics?days=7").length, 1);
      assert.equal(await stat(page, "success").innerText(), "74.9%");
      clean(t);
    } finally {
      await t.close();
    }
  });

  it("empty payload shows an empty state in every block", async () => {
    const w = defaultWorker();
    w.analytics = () => ({ json: ANALYTICS_EMPTY });
    const t = await open({ worker: w });
    try {
      await report(t.page).waitFor();
      assert.equal(await stat(t.page, "runs").innerText(), "0");
      assert.equal(await stat(t.page, "success").innerText(), "—", "no runs means no rate, not 0%");
      assert.equal(await t.page.locator("[data-empty]").count(), 3);
      assert.match(await t.page.getByTestId("runs-by-lang").innerText(), /No runs in this period\./);
      assert.match(await t.page.getByTestId("runs-by-status").innerText(), /No runs in this period\./);
      assert.equal(await t.page.getByRole("table").count(), 0);
      await noOverflow(t, "empty");
      clean(t);
    } finally {
      await t.close();
    }
  });
});

describe("dashboard (Arabic, RTL)", () => {
  it("mirrors the layout, translates every block and keeps Latin digits", async () => {
    const t = await open({ lang: "ar" });
    try {
      const page = t.page;
      await report(page).waitFor();
      assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
      assert.equal(await page.getByRole("heading", { level: 1 }).innerText(), ar.title);
      const group = page.getByRole("group", { name: ar.period });
      await group.getByRole("button", { name: "30 يوماً", pressed: true }).waitFor();
      await group.getByRole("button", { name: "7 أيام" }).waitFor();

      assert.equal(await stat(page, "runs").innerText(), "1,284");
      assert.match(await stat(page, "success").innerText(), /^70\.2/);
      const text = await report(page).innerText();
      assert.doesNotMatch(text, /[٠-٩]/, "Latin digits");
      assert.ok(text.includes(translations.ar.tracks["frontend"].title), "Arabic course title");
      assert.ok(text.includes(ar.status["compile_error"]));
      assert.ok(text.includes("Python"), "language names are product names");

      const ex = table(page, ar.exercises.caption);
      assert.equal(await ex.locator("th[scope=col]").count(), 7);
      assert.ok((await ex.locator("thead").innerText()).includes(ar.exercises.cols.passRate));
      assert.equal(await ex.locator('tr[data-row="cyber-security/networking/subnet-calc"] summary').innerText(), "3 أخطاء شائعة");
      assert.match(await table(page, ar.challenges.caption).locator("tfoot").innerText(), /تحدّيان آخران بلا نشاط/);

      // the bar fills from the inline start: the right edge in RTL
      const track = page.getByTestId("runs-by-lang").locator("li").first().locator("div[aria-hidden]");
      const fill = track.locator("div");
      const [tb, fb] = [await track.boundingBox(), await fill.boundingBox()];
      assert.ok(tb && fb);
      assert.ok(Math.abs(tb.x + tb.width - (fb.x + fb.width)) < 1.5, "bar starts at the right in RTL");

      // table text aligns to the start (right) in RTL
      assert.equal(await ex.locator("thead th").first().evaluate((el) => getComputedStyle(el).textAlign), "start");
      await noOverflow(t, "ar desktop");
      clean(t);
    } finally {
      await t.close();
    }
  });
});

describe("responsive and accessible", () => {
  for (const lang of ["en", "ar"] as const) {
    for (const width of [390, 1280]) {
      it(`${lang} at ${width}px: no page overflow, tables scroll inside their own region, axe clean`, async () => {
        const t = await open({ lang, viewport: { width, height: 900 }, theme: lang === "en" ? "dark" : "light" });
        try {
          const page = t.page;
          await report(page).waitFor();
          await noOverflow(t, `${lang} ${width}`);
          const tx = lang === "en" ? en : ar;
          for (const title of [tx.tracks.title, tx.exercises.title, tx.challenges.title]) {
            const region = page.getByRole("region", { name: title });
            assert.equal(await region.getAttribute("tabindex"), "0", `${title}: keyboard reachable scroll region`);
            assert.equal(await region.evaluate((el) => getComputedStyle(el).overflowX), "auto");
          }
          if (width === 390) {
            const region = page.getByRole("region", { name: tx.exercises.title });
            assert.ok(await region.evaluate((el) => el.scrollWidth > el.clientWidth), "the wide table scrolls inside its container");
          }
          const found = await seriousViolations(page);
          assert.equal(found.length, 0, `\n${describeViolations(found)}`);
          clean(t);
        } finally {
          await t.close();
        }
      });
    }
  }
});
