/**
 * UI tests for the public certificate verification page /certificate/?code=IMB-XXXX-XXXX-XXXX.
 *
 * Run (build first; the specs serve `out/` and mock the Worker, no network needed):
 *   npm run build
 *   node --import tsx --test --test-concurrency=1 tests/e2e/phase3/*.spec.ts
 * Single file: node --import tsx --test tests/e2e/phase3/certificate.spec.ts
 * Env: PHASE3_E2E_SITE_DIR (another export), PHASE3_E2E_API_ORIGIN (if built with NEXT_PUBLIC_API_URL),
 *      CHROMIUM_PATH / PLAYWRIGHT_BROWSERS_PATH (when Playwright's own browser is not installed).
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { Browser } from "playwright";
import { translations } from "../../../lib/i18n";
import type { Page } from "playwright";
import { courses } from "../../../lib/catalog";
import { CERT_CODE, VALID_CERT, defaultWorker, describeViolations, eventually, launchBrowser, openPage, pageOverflow, seriousViolations, startSite, type OpenedPage } from "./harness";

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

const en = translations.en.certVerify;
const ar = translations.ar.certVerify;
const ARABIC_NAME = "ليلى حسن العبدالله";
const PRINT_PATH = `/certificate/?code=${CERT_CODE}&print=1`;

/** Common end-of-test assertions: hermetic, no console/hydration errors. */
function clean(t: OpenedPage) {
  assert.deepEqual(t.errors, [], "no console errors or hydration warnings");
  assert.deepEqual(t.blocked, [], "no request left loopback or the Worker origin");
}

async function noOverflow(t: OpenedPage, label: string) {
  const o = await pageOverflow(t.page);
  assert.ok(o.ok, `${label}: horizontal page overflow (${o.scrollWidth} > ${o.innerWidth})`);
}

describe("valid certificate", () => {
  it("shows the card, resolves the course title and calls the public endpoint without credentials", async () => {
    const worker = defaultWorker();
    worker.verify = () => ({ json: VALID_CERT });
    // Lower case on purpose: the page normalises like the Worker does.
    const t = await openPage(browser, origin, `/certificate/?code=${CERT_CODE.toLowerCase()}`, { worker });
    try {
      const card = t.page.getByTestId("cert-valid");
      await card.waitFor();
      assert.equal(await t.page.getByRole("heading", { level: 1 }).innerText(), en.title);
      assert.equal(await card.getByRole("heading", { level: 2 }).innerText(), "Valid certificate");
      const text = await card.innerText();
      assert.match(text, /Layla Hassan/);
      assert.match(text, /Frontend Development/, "course title looked up by track id");
      assert.match(text, /June 15, 2026/, "issue date in UTC, English");
      assert.match(text, new RegExp(CERT_CODE));
      assert.equal(await card.locator('[data-field="code"]').getAttribute("dir"), "ltr", "the code is always left-to-right");

      assert.equal(await t.page.getByTestId("cert-result").getAttribute("aria-live"), "polite");
      assert.equal(await t.page.locator('meta[name="robots"]').getAttribute("content"), "noindex");

      const calls = worker.callsTo("/api/certificates/verify/");
      assert.equal(calls.length, 1);
      assert.equal(calls[0].path, `/api/certificates/verify/${CERT_CODE}`);
      assert.equal(calls[0].auth, null, "verification is public: no Authorization header");
      assert.equal(await t.page.getByRole("link", { name: en.another }).getAttribute("href"), "/certificate/");
      clean(t);
    } finally {
      await t.close();
    }
  });

  it("falls back to the raw track id for an unknown course and omits missing fields", async () => {
    const worker = defaultWorker();
    worker.verify = () => ({ json: { valid: true, code: CERT_CODE, track: "retired-track" } });
    const t = await openPage(browser, origin, `/certificate/?code=${CERT_CODE}`, { worker });
    try {
      const card = t.page.getByTestId("cert-valid");
      await card.waitFor();
      const text = await card.innerText();
      assert.match(text, /retired-track/);
      assert.doesNotMatch(text, new RegExp(en.valid.recipient), "no recipient row when the Worker sent none");
      assert.doesNotMatch(text, new RegExp(en.valid.issued));
      clean(t);
    } finally {
      await t.close();
    }
  });

  it("renders right-to-left in Arabic with an Arabic course title and Latin digits", async () => {
    const worker = defaultWorker();
    worker.verify = () => ({ json: VALID_CERT });
    const t = await openPage(browser, origin, `/certificate/?code=${CERT_CODE}`, { worker, lang: "ar" });
    try {
      const card = t.page.getByTestId("cert-valid");
      await card.waitFor();
      assert.equal(await t.page.locator("html").getAttribute("dir"), "rtl");
      assert.equal(await card.getByRole("heading", { level: 2 }).innerText(), ar.valid.title);
      const text = await card.innerText();
      assert.ok(text.includes(translations.ar.tracks["frontend"].title), "Arabic course title");
      assert.match(text, /15/);
      assert.match(text, /2026/);
      assert.doesNotMatch(text, /[٠-٩]/, "Latin digits like the rest of the site");
      assert.equal(await card.locator('[data-field="code"]').getAttribute("dir"), "ltr");
      await noOverflow(t, "ar valid");
      clean(t);
    } finally {
      await t.close();
    }
  });
});

describe("invalid certificate", () => {
  it("says it could not find the certificate and offers the form again", async () => {
    const worker = defaultWorker(); // unknown codes answer { valid: false }
    const t = await openPage(browser, origin, `/certificate/?code=${CERT_CODE}`, { worker });
    try {
      const card = t.page.getByTestId("cert-invalid");
      await card.waitFor();
      assert.match(await card.innerText(), /We could not find a certificate with this code/);
      assert.equal(await t.page.getByLabel(en.form.label).inputValue(), CERT_CODE, "the form is prefilled so a typo can be fixed");
      assert.equal(await t.page.getByTestId("cert-valid").count(), 0);
      clean(t);
    } finally {
      await t.close();
    }
  });

  it("does not call the Worker for text that cannot be a code", async () => {
    const worker = defaultWorker();
    const t = await openPage(browser, origin, "/certificate/?code=hello-world", { worker });
    try {
      await t.page.getByTestId("cert-invalid").waitFor();
      assert.equal(worker.callsTo("/api/certificates/verify/").length, 0);
      clean(t);
    } finally {
      await t.close();
    }
  });
});

describe("verification unavailable", () => {
  it("5xx shows the retry state, and Retry recovers", async () => {
    const worker = defaultWorker();
    worker.verify = (_code, call) => (call === 1 ? { status: 503, json: { error: "internal_error" } } : { json: VALID_CERT });
    const t = await openPage(browser, origin, `/certificate/?code=${CERT_CODE}`, { worker });
    try {
      const card = t.page.getByTestId("cert-unavailable");
      await card.waitFor();
      assert.match(await card.innerText(), /Verification is unavailable right now, try again later/);
      assert.equal(await t.page.getByTestId("cert-invalid").count(), 0, "an outage is never reported as an invalid certificate");
      await card.getByRole("button", { name: en.unavailable.retry }).click();
      await t.page.getByTestId("cert-valid").waitFor();
      assert.equal(worker.callsTo("/api/certificates/verify/").length, 2);
      clean(t);
    } finally {
      await t.close();
    }
  });

  it("a network failure shows the same state", async () => {
    const worker = defaultWorker();
    worker.verify = () => ({ abort: true });
    const t = await openPage(browser, origin, `/certificate/?code=${CERT_CODE}`, { worker });
    try {
      await t.page.getByTestId("cert-unavailable").waitFor();
      clean(t);
    } finally {
      await t.close();
    }
  });
});

describe("no code in the URL", () => {
  it("shows the form, validates locally and updates the URL on submit", async () => {
    const worker = defaultWorker();
    worker.verify = () => ({ json: VALID_CERT });
    const t = await openPage(browser, origin, "/certificate/", { worker });
    try {
      const input = t.page.getByLabel(en.form.label);
      await input.waitFor();
      assert.equal(await t.page.getByTestId("cert-valid").count(), 0);

      await input.fill("not a code");
      await t.page.getByRole("button", { name: en.form.submit }).click();
      assert.equal(await t.page.locator("p[role=alert]").innerText(), en.form.invalid);
      assert.equal(await input.getAttribute("aria-invalid"), "true");
      assert.equal(worker.callsTo("/api/certificates/verify/").length, 0);

      await input.fill("imb abcd efgh 2345");
      await input.press("Enter");
      await t.page.getByTestId("cert-valid").waitFor();
      assert.equal(new URL(t.page.url()).searchParams.get("code"), CERT_CODE, "canonical code in the address bar");
      assert.equal(worker.callsTo("/api/certificates/verify/").length, 1);
      clean(t);
    } finally {
      await t.close();
    }
  });
});

describe("static HTML and layout", () => {
  it("the server-rendered page is a neutral shell: heading yes, result no", async () => {
    const t = await openPage(browser, origin, `/certificate/?code=${CERT_CODE}`, { javaScript: false });
    try {
      assert.equal(await t.page.getByRole("heading", { level: 1 }).innerText(), en.title);
      assert.equal(await t.page.getByTestId("cert-result").count(), 0);
      assert.equal(await t.page.getByTestId("cert-valid").count(), 0);
      assert.equal(await t.page.getByTestId("cert-invalid").count(), 0);
    } finally {
      await t.close();
    }
  });

  for (const lang of ["en", "ar"] as const) {
    for (const width of [390, 1280]) {
      it(`${lang} at ${width}px: every state fits the viewport and passes axe`, async () => {
        const worker = defaultWorker();
        worker.verify = (code) => (code === CERT_CODE ? { json: VALID_CERT } : { json: { valid: false } });
        const o = { worker, lang, viewport: { width, height: 900 } } as const;
        const valid = await openPage(browser, origin, `/certificate/?code=${CERT_CODE}`, o);
        try {
          await valid.page.getByTestId("cert-valid").waitFor();
          await noOverflow(valid, `${lang} ${width} valid`);
          const found = await seriousViolations(valid.page);
          assert.equal(found.length, 0, `\n${describeViolations(found)}`);
          clean(valid);
        } finally {
          await valid.close();
        }
        const invalid = await openPage(browser, origin, "/certificate/?code=IMB-ZZZZ-ZZZZ-ZZZZ", o);
        try {
          await invalid.page.getByTestId("cert-invalid").waitFor();
          await noOverflow(invalid, `${lang} ${width} invalid`);
          const found = await seriousViolations(invalid.page);
          assert.equal(found.length, 0, `\n${describeViolations(found)}`);
          clean(invalid);
        } finally {
          await invalid.close();
        }
        const down = defaultWorker();
        down.verify = () => ({ status: 500, json: {} });
        const unavailable = await openPage(browser, origin, `/certificate/?code=${CERT_CODE}`, { ...o, worker: down });
        try {
          await unavailable.page.getByTestId("cert-unavailable").waitFor();
          await eventually(async () => assert.ok((await pageOverflow(unavailable.page)).ok));
          clean(unavailable);
        } finally {
          await unavailable.close();
        }
      });
    }
  }
});

// ── printable certificate (/certificate/?code=...&print=1) ─────────────────────
/** What the printable sheet shows, read from the DOM (no screenshots). */
async function sheetState(page: Page) {
  // No named inner functions: tsx would wrap them in a `__name` helper that does not exist in the page.
  const raw = await page.getByTestId("cert-sheet").evaluate((sheet) => {
    const fields = Object.fromEntries(
      ["recipient", "course", "issued", "code", "verify-url"].map((n) => {
        const el = sheet.querySelector(`[data-field="${n}"]`);
        return [n, el ? { text: el.textContent, dir: el.getAttribute("dir") } : null];
      })
    );
    const css = getComputedStyle(sheet.querySelector('[data-field="recipient"]')!);
    return {
      fields,
      lang: sheet.getAttribute("lang"),
      dir: sheet.getAttribute("dir"),
      title: sheet.querySelector("h2")?.textContent ?? "",
      nameDirection: css.direction,
      nameColor: css.color,
      paper: getComputedStyle(sheet.querySelector(".cert-frame")!).backgroundColor,
      text: sheet.textContent ?? "",
    };
  });
  const f = raw.fields as Record<string, { text: string | null; dir: string | null } | null>;
  return {
    lang: raw.lang,
    dir: raw.dir,
    title: raw.title,
    name: f.recipient?.text ?? null,
    nameDirAttr: f.recipient?.dir ?? null,
    nameDirection: raw.nameDirection,
    nameColor: raw.nameColor,
    paper: raw.paper,
    course: f.course?.text ?? null,
    issued: f.issued?.text ?? null,
    code: f.code?.text ?? null,
    codeDir: f.code?.dir ?? null,
    verifyUrl: f["verify-url"]?.text ?? null,
    verifyDir: f["verify-url"]?.dir ?? null,
    text: raw.text,
  };
}

const visible = (page: Page, selector: string) => page.locator(selector).first().isVisible();

describe("printable certificate", () => {
  it("opens from a valid result, prints an Arabic name right-to-left, toggles the language and comes back", async () => {
    const worker = defaultWorker();
    worker.verify = () => ({ json: { ...VALID_CERT, recipient: ARABIC_NAME } });
    const t = await openPage(browser, origin, `/certificate/?code=${CERT_CODE}`, { worker }); // English UI, dark theme
    try {
      const card = t.page.getByTestId("cert-valid");
      await card.waitFor();
      const open = card.getByRole("link", { name: en.printable.open });
      assert.equal(await open.getAttribute("href"), PRINT_PATH);
      await open.click();
      await t.page.getByTestId("cert-sheet").waitFor();
      assert.equal(new URL(t.page.url()).searchParams.get("print"), "1");
      assert.equal(await t.page.getByRole("heading", { level: 1 }).innerText(), en.printable.title);
      await eventually(async () => assert.ok(await t.page.evaluate(() => !!document.activeElement?.closest("h1")), "focus moves to the new heading"));

      let s = await sheetState(t.page);
      assert.equal(s.lang, "en");
      assert.equal(s.dir, "ltr");
      assert.equal(s.title, "Certificate of completion");
      assert.equal(s.name, ARABIC_NAME, "the real display name, not a username or a placeholder");
      assert.equal(s.nameDirAttr, "auto");
      assert.equal(s.nameDirection, "rtl", "an Arabic name runs right-to-left even on the English certificate");
      assert.equal(s.course, "Frontend Development");
      assert.equal(s.issued, "June 15, 2026");
      assert.equal(s.code, CERT_CODE);
      assert.equal(s.codeDir, "ltr");
      assert.equal(s.verifyUrl, `${origin}/certificate/?code=${CERT_CODE}`, "verification URL from the current origin");
      assert.equal(s.verifyDir, "ltr");
      assert.ok(s.text.includes("شهادة إتمام"), "the other language's title as a subtitle");
      // Dark site theme, light paper.
      assert.equal(s.paper, "rgb(255, 255, 255)");
      assert.equal(s.nameColor, "rgb(14, 20, 32)");

      // Certificate language toggle (independent of the UI language).
      const group = t.page.getByRole("group", { name: en.printable.language });
      await group.getByRole("button", { name: "العربية" }).click();
      assert.equal(await group.getByRole("button", { name: "العربية" }).getAttribute("aria-pressed"), "true");
      assert.equal(await group.getByRole("button", { name: "English" }).getAttribute("aria-pressed"), "false");
      s = await sheetState(t.page);
      assert.equal(s.lang, "ar");
      assert.equal(s.dir, "rtl");
      assert.equal(s.title, "شهادة إتمام");
      assert.equal(s.name, ARABIC_NAME);
      assert.equal(s.nameDirection, "rtl");
      assert.equal(s.course, translations.ar.tracks["frontend"].title);
      assert.doesNotMatch(s.issued ?? "", /[٠-٩]/, "Latin digits");
      assert.match(s.issued ?? "", /15.*2026/);
      assert.equal(s.code, CERT_CODE);
      assert.equal(s.codeDir, "ltr");
      assert.equal(await t.page.locator("html").getAttribute("dir"), "ltr", "the page itself stays in the UI language");

      // Print: only the certificate, on one A4 landscape sheet.
      await t.page.emulateMedia({ media: "print" });
      assert.equal(await visible(t.page, "body > header"), false, "navbar hidden");
      assert.equal(await visible(t.page, "body > footer"), false, "footer hidden");
      assert.equal(await t.page.getByRole("button", { name: en.printable.print }).isVisible(), false, "buttons hidden");
      assert.equal(await t.page.getByTestId("cert-print-toolbar").isVisible(), false);
      assert.equal(await t.page.getByRole("heading", { level: 1 }).isVisible(), false);
      assert.equal(await t.page.getByTestId("cert-sheet").isVisible(), true);
      const box = (await t.page.getByTestId("cert-sheet").boundingBox())!;
      assert.ok(Math.abs(box.width - (297 / 25.4) * 96) < 2 && Math.abs(box.height - (210 / 25.4) * 96) < 2, `A4 landscape in print (${box.width}x${box.height})`);
      assert.equal(await t.page.evaluate(() => [...document.querySelectorAll("style")].some((el) => /@page\s*\{\s*size:\s*A4 landscape/.test(el.textContent ?? ""))), true);
      await t.page.emulateMedia({ media: "screen" });

      // Back to the result: no second verification request, focus on the result.
      await t.page.getByRole("link", { name: en.printable.back }).click();
      await card.waitFor();
      assert.equal(new URL(t.page.url()).searchParams.get("print"), null);
      await eventually(async () => assert.equal(await t.page.evaluate(() => document.activeElement?.textContent), en.valid.title));
      assert.equal(await t.page.evaluate(() => [...document.querySelectorAll("style")].some((el) => /@page/.test(el.textContent ?? ""))), false, "no landscape @page outside the view");
      assert.equal(worker.callsTo("/api/certificates/verify/").length, 1);
      clean(t);
    } finally {
      await t.close();
    }
  });

  it("deep link in the Arabic UI: Arabic certificate, a Latin name stays left-to-right, English on request", async () => {
    const worker = defaultWorker();
    worker.verify = () => ({ json: VALID_CERT });
    const t = await openPage(browser, origin, PRINT_PATH, { worker, lang: "ar", theme: "light" });
    try {
      await t.page.getByTestId("cert-sheet").waitFor();
      assert.equal(await t.page.getByRole("heading", { level: 1 }).innerText(), ar.printable.title);
      assert.ok(await t.page.getByRole("button", { name: ar.printable.print }).isVisible());
      let s = await sheetState(t.page);
      assert.equal(s.lang, "ar");
      assert.equal(s.dir, "rtl");
      assert.equal(s.title, "شهادة إتمام");
      assert.equal(s.name, "Layla Hassan");
      assert.equal(s.nameDirection, "ltr");
      assert.equal(s.course, translations.ar.tracks["frontend"].title);
      assert.doesNotMatch(s.text, /[٠-٩]/);
      assert.equal(s.paper, "rgb(255, 255, 255)");

      await t.page.getByRole("group", { name: ar.printable.language }).getByRole("button", { name: "English" }).click();
      s = await sheetState(t.page);
      assert.equal(s.lang, "en");
      assert.equal(s.dir, "ltr");
      assert.equal(s.title, "Certificate of completion");
      assert.equal(s.issued, "June 15, 2026");
      assert.equal(await t.page.locator("html").getAttribute("dir"), "rtl");

      await t.page.emulateMedia({ media: "print" });
      assert.equal(await visible(t.page, "body > header"), false);
      assert.equal(await visible(t.page, "body > footer"), false);
      assert.equal(await t.page.getByTestId("cert-sheet").isVisible(), true);
      assert.equal(await t.page.locator("main button:visible, main a:visible").count(), 0, "no buttons or links on paper");
      clean(t);
    } finally {
      await t.close();
    }
  });

  it("without a recipient the result card stays, with no printable link", async () => {
    const worker = defaultWorker();
    worker.verify = () => ({ json: { valid: true, code: CERT_CODE, track: "frontend" } });
    const t = await openPage(browser, origin, PRINT_PATH, { worker });
    try {
      await t.page.getByTestId("cert-valid").waitFor();
      assert.equal(await t.page.getByTestId("cert-sheet").count(), 0);
      assert.equal(await t.page.getByRole("link", { name: en.printable.open }).count(), 0);
      clean(t);
    } finally {
      await t.close();
    }
  });

  it("an invalid code with print=1 is still just 'not found'", async () => {
    const t = await openPage(browser, origin, `/certificate/?code=IMB-ZZZZ-ZZZZ-ZZZZ&print=1`);
    try {
      await t.page.getByTestId("cert-invalid").waitFor();
      assert.equal(await t.page.getByTestId("cert-sheet").count(), 0);
      clean(t);
    } finally {
      await t.close();
    }
  });

  it("is not in the static HTML", async () => {
    const t = await openPage(browser, origin, PRINT_PATH, { javaScript: false });
    try {
      assert.equal(await t.page.getByRole("heading", { level: 1 }).innerText(), en.title);
      assert.equal(await t.page.getByTestId("cert-sheet").count(), 0);
    } finally {
      await t.close();
    }
  });

  for (const lang of ["en", "ar"] as const) {
    for (const width of [360, 1280]) {
      it(`${lang} at ${width}px: fits the viewport, passes axe, no console errors (Arabic name)`, async () => {
        const worker = defaultWorker();
        worker.verify = () => ({ json: { ...VALID_CERT, recipient: ARABIC_NAME } });
        const t = await openPage(browser, origin, PRINT_PATH, { worker, lang, viewport: { width, height: 900 } });
        try {
          await t.page.getByTestId("cert-sheet").waitFor();
          await noOverflow(t, `${lang} ${width} printable`);
          const sheet = (await t.page.getByTestId("cert-sheet").boundingBox())!;
          assert.ok(sheet.x >= 0 && sheet.x + sheet.width <= width + 0.5, `the sheet preview stays inside the viewport (${sheet.x}+${sheet.width})`);
          assert.ok(Math.abs(sheet.width / sheet.height - 297 / 210) < 0.01, "A4 landscape proportions");
          assert.equal((await sheetState(t.page)).name, ARABIC_NAME);
          const found = await seriousViolations(t.page);
          assert.equal(found.length, 0, `\n${describeViolations(found)}`);
          clean(t);
        } finally {
          await t.close();
        }
      });
    }
  }
});

// ── course page certificate card -> printable certificate ─────────────────────
const studyAllDone = (track: string) =>
  JSON.stringify({
    v: 1,
    lessons: Object.fromEntries((courses.find((c) => c.id === track)?.lessons ?? []).map((l) => [`${track}/${l.lessonId}`, { done: 1, visited: 1 }])),
    notes: {},
    days: [],
    updated: 1,
  });

describe("course page: printable certificate", () => {
  const track = "frontend";
  for (const lang of ["en", "ar"] as const) {
    it(`asks the Worker for the code with the Bearer token and opens the printable view (${lang})`, async () => {
      const curriculum = translations[lang].curriculum;
      const worker = defaultWorker();
      worker.certificate = (tr, format) =>
        tr === track && format === "json"
          ? { json: { code: CERT_CODE, track, recipient: ARABIC_NAME, issuedAt: VALID_CERT.issuedAt, verifyUrl: `https://imbegnal.com/certificate/?code=${CERT_CODE}` } }
          : { status: 404, json: { error: "not_found" } };
      worker.verify = () => ({ json: { ...VALID_CERT, recipient: ARABIC_NAME } });
      const t = await openPage(browser, origin, `/learn/${track}/`, { worker, lang, signedIn: true, storage: { "imb-study-v1": studyAllDone(track) } });
      try {
        const button = t.page.getByRole("button", { name: curriculum.certificatePrintable });
        await button.waitFor();
        assert.equal(await t.page.getByRole("button", { name: curriculum.certificateDownload }).count(), 1, "the PDF download is still there");
        assert.equal(worker.callsTo("/api/certificates/").length, 0, "nothing is fetched until the learner asks");
        await button.click();
        await t.page.getByTestId("cert-sheet").waitFor();
        const url = new URL(t.page.url());
        assert.equal(url.pathname, "/certificate/");
        assert.equal(url.searchParams.get("code"), CERT_CODE);
        assert.equal(url.searchParams.get("print"), "1");
        const calls = worker.callsTo(`/api/certificates/${track}`);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].path, `/api/certificates/${track}?format=json`);
        assert.match(calls[0].auth ?? "", /^Bearer /);
        const s = await sheetState(t.page);
        assert.equal(s.name, ARABIC_NAME);
        assert.equal(s.lang, lang);
        clean(t);
      } finally {
        await t.close();
      }
    });
  }

  it("shows the card's error message when the Worker refuses", async () => {
    const worker = defaultWorker(); // certificate: 403 not_eligible
    const t = await openPage(browser, origin, `/learn/${track}/`, { worker, signedIn: true, storage: { "imb-study-v1": studyAllDone(track) } });
    try {
      await t.page.getByRole("button", { name: translations.en.curriculum.certificatePrintable }).click();
      await t.page.getByRole("status").filter({ hasText: translations.en.curriculum.certificateErrorNotReady }).waitFor();
      assert.equal(new URL(t.page.url()).pathname, `/learn/${track}/`);
      assert.equal(t.blocked.length, 0);
    } finally {
      await t.close();
    }
  });
});
