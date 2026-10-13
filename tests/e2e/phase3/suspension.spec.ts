/**
 * UI tests for a suspended account on the course certificate card and the AI tutor.
 *
 * Every guarded Worker route answers a suspended account with 403 {error:"account_suspended", message,
 * until?} (worker/src/auth/guard.ts). The certificate card and the AI tutor show an "Account suspended"
 * notice in the reader's language, with the end date when `until` is present, instead of their generic
 * "not ready" / "unavailable" text. Nothing signs the tab out and the local study progress stays.
 *
 * Run (build first; serves `out/` and mocks the Worker, no network needed):
 *   npm run build
 *   node --import tsx --test tests/e2e/phase3/suspension.spec.ts
 * Env: as for the other phase3 specs (PHASE3_E2E_SITE_DIR, PHASE3_E2E_API_ORIGIN, CHROMIUM_PATH / PLAYWRIGHT_BROWSERS_PATH).
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { Browser } from "playwright";
import { translations } from "../../../lib/i18n";
import { courses } from "../../../lib/catalog";
import { TEST_TOKEN, defaultWorker, launchBrowser, openPage, startSite, type MockWorker, type OpenedPage, type Reply } from "./harness";

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

const TRACK = "frontend";
const LESSON_PATH = `/learn/${TRACK}/html-css/`;
const UNTIL = "2026-11-20T09:30:00.000Z";
const STUDY_KEY = "imb-study-v1";

const suspended = (until?: string): Reply => ({ status: 403, json: { error: "account_suspended", message: "This account is suspended.", ...(until ? { until } : {}) } });

/** A Worker that refuses the account everywhere the real guard would (study state, lab progress, certificates, tutor). */
function suspendedWorker(until?: string): MockWorker {
  const w = defaultWorker();
  w.certificate = () => suspended(until);
  w.ai = () => suspended(until);
  w.state = () => suspended(until);
  w.other = (_method, path) => (path.startsWith("/api/lab/") || path.startsWith("/api/progress") ? suspended(until) : undefined);
  return w;
}

const studyAllDone = () =>
  JSON.stringify({
    v: 1,
    lessons: Object.fromEntries((courses.find((c) => c.id === TRACK)?.lessons ?? []).map((l) => [`${TRACK}/${l.lessonId}`, { done: 1_750_000_000_000, visited: 1_750_000_000_000 }])),
    notes: {},
    days: [],
    updated: 1,
  });

/** `template` with {date} matched by any text; returns that date text. */
function matchTemplate(text: string, template: string): string {
  const [head, tail] = template.split("{date}");
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = text.match(new RegExp(`${escape(head)}(.+?)${escape(tail)}`));
  assert.ok(m, `"${text}" follows "${template}"`);
  return m[1];
}

/** Still signed in with the same token, local progress intact, no page errors, hermetic. */
async function assertNothingLost(t: OpenedPage, study: string | null) {
  const saved = await t.page.evaluate((key) => ({ token: localStorage.getItem("sf_token"), study: localStorage.getItem(key) }), STUDY_KEY);
  assert.equal(saved.token, TEST_TOKEN, "a suspension never signs the tab out");
  if (study !== null) {
    const kept = JSON.parse(saved.study ?? "{}") as { lessons?: Record<string, { done?: number }> };
    const expected = JSON.parse(study) as { lessons: Record<string, unknown> };
    for (const key of Object.keys(expected.lessons)) assert.ok(kept.lessons?.[key]?.done, `local progress kept for ${key}`);
  }
  assert.deepEqual(t.errors, [], "no console errors or crashes");
  assert.deepEqual(t.blocked, [], "hermetic");
}

describe("course certificate card", () => {
  for (const lang of ["en", "ar"] as const) {
    const T = translations[lang].curriculum;
    it(`shows the suspension notice with its end date, for the PDF and the printable view (${lang})`, async () => {
      const study = studyAllDone();
      const worker = suspendedWorker(UNTIL);
      const t = await openPage(browser, origin, `/learn/${TRACK}/`, { worker, lang, signedIn: true, storage: { [STUDY_KEY]: study } });
      try {
        for (const name of [T.certificateDownload, T.certificatePrintable]) {
          await t.page.getByRole("button", { name }).click();
          const notice = t.page.getByRole("status").getByTestId("certificate-suspended");
          await notice.waitFor();
          const text = await notice.innerText();
          assert.ok(text.includes(translations[lang].codelab.problems.suspendedTitle), "the Code Lab suspension title");
          const date = matchTemplate(text.replace(/\s+/g, " "), T.certificateErrorSuspendedUntil);
          assert.match(date, /2026/, "the end date is shown");
          assert.match(date, /20/, "with its day");
          assert.ok(!text.includes(T.certificateErrorNotReady) && !text.includes(T.certificateErrorUnavailable), "not the generic text");
        }
        assert.equal(worker.callsTo(`/api/certificates/${TRACK}`).length, 2);
        assert.equal(new URL(t.page.url()).pathname, `/learn/${TRACK}/`, "no navigation");
        await assertNothingLost(t, study);
      } finally {
        await t.close();
      }
    });
  }

  it("without an end date: the open-ended message", async () => {
    const T = translations.en.curriculum;
    const study = studyAllDone();
    const t = await openPage(browser, origin, `/learn/${TRACK}/`, { worker: suspendedWorker(), signedIn: true, storage: { [STUDY_KEY]: study } });
    try {
      await t.page.getByRole("button", { name: T.certificateDownload }).click();
      const notice = t.page.getByTestId("certificate-suspended");
      await notice.waitFor();
      assert.match(await notice.innerText(), new RegExp(T.certificateErrorSuspended.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      await assertNothingLost(t, study);
    } finally {
      await t.close();
    }
  });

  it("a 403 that is not a suspension still reads as not ready", async () => {
    const T = translations.en.curriculum;
    const t = await openPage(browser, origin, `/learn/${TRACK}/`, { signedIn: true, storage: { [STUDY_KEY]: studyAllDone() } }); // default: 403 not_eligible
    try {
      await t.page.getByRole("button", { name: T.certificateDownload }).click();
      await t.page.getByRole("status").filter({ hasText: T.certificateErrorNotReady }).waitFor();
      assert.equal(await t.page.getByTestId("certificate-suspended").count(), 0);
    } finally {
      await t.close();
    }
  });
});

describe("AI tutor", () => {
  async function askFirstSuggestion(t: OpenedPage, lang: "en" | "ar") {
    const tx = translations[lang];
    await t.page.getByRole("tab", { name: tx.player.tabAi }).click();
    await t.page.getByRole("button", { name: tx.ai.suggestions[0] }).last().click();
  }

  for (const lang of ["en", "ar"] as const) {
    const ai = translations[lang].ai;
    it(`shows the suspension notice with its end date instead of "unavailable" (${lang})`, async () => {
      const worker = suspendedWorker(UNTIL);
      const t = await openPage(browser, origin, LESSON_PATH, { worker, lang, signedIn: true, viewport: { width: 1440, height: 900 } });
      try {
        await askFirstSuggestion(t, lang);
        const notice = t.page.getByTestId("ai-suspended");
        await notice.waitFor();
        const text = (await notice.innerText()).replace(/\s+/g, " ");
        assert.ok(text.includes(translations[lang].codelab.problems.suspendedTitle));
        assert.match(matchTemplate(text, ai.suspendedUntil), /2026/);
        assert.equal(await t.page.getByText(ai.unavailable).count(), 0, "not the generic text");
        const calls = worker.callsTo("/api/ai/chat");
        assert.equal(calls.length, 1);
        assert.equal(calls[0].auth, `Bearer ${TEST_TOKEN}`);
        await assertNothingLost(t, null);
      } finally {
        await t.close();
      }
    });
  }

  it("without an end date: the open-ended message; the next question starts over", async () => {
    const ai = translations.en.ai;
    const worker = suspendedWorker();
    worker.ai = (_auth, call) => (call === 1 ? suspended() : { status: 503, json: { error: "ai_unavailable" } }); // the suspension ended, the tutor is down
    const t = await openPage(browser, origin, LESSON_PATH, { worker, signedIn: true, viewport: { width: 1440, height: 900 } });
    try {
      await askFirstSuggestion(t, "en");
      const notice = t.page.getByTestId("ai-suspended");
      await notice.waitFor();
      assert.ok((await notice.innerText()).includes(ai.suspended));
      await t.page.getByRole("button", { name: ai.suggestions[0] }).last().click();
      await t.page.getByText(ai.unavailable).waitFor();
      assert.equal(await t.page.getByTestId("ai-suspended").count(), 0, "a new question clears the notice");
      await assertNothingLost(t, null);
    } finally {
      await t.close();
    }
  });

  it("other failures keep their own text (503 -> unavailable)", async () => {
    const ai = translations.en.ai;
    const t = await openPage(browser, origin, LESSON_PATH, { signedIn: true, viewport: { width: 1440, height: 900 } }); // default ai: 503
    try {
      await askFirstSuggestion(t, "en");
      await t.page.getByText(ai.unavailable).waitFor();
      assert.equal(await t.page.getByTestId("ai-suspended").count(), 0);
    } finally {
      await t.close();
    }
  });
});

describe("instructor analytics", () => {
  for (const lang of ["en", "ar"] as const) {
    it(`shows the suspension notice with its end date (${lang})`, async () => {
      const t3 = translations[lang].instructor.suspended;
      const worker = suspendedWorker(UNTIL);
      worker.analytics = () => suspended(UNTIL);
      const t = await openPage(browser, origin, "/instructor/", { worker, lang, signedIn: true });
      try {
        const notice = t.page.getByTestId("instructor-suspended");
        await notice.waitFor();
        const date = matchTemplate((await notice.innerText()).replace(/\s+/g, " "), t3.bodyUntil);
        assert.match(date, /2026/, "the end date is shown");
        await assertNothingLost(t, null);
      } finally {
        await t.close();
      }
    });
  }

  it("without an end date: the open-ended message", async () => {
    const worker = suspendedWorker();
    worker.analytics = () => suspended();
    const t = await openPage(browser, origin, "/instructor/", { worker, signedIn: true });
    try {
      const notice = t.page.getByTestId("instructor-suspended");
      await notice.waitFor();
      assert.ok((await notice.innerText()).includes(translations.en.instructor.suspended.body));
    } finally {
      await t.close();
    }
  });
});
