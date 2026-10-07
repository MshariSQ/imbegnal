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
