/**
 * UI tests for lab XP after sign-in: one lab exercise counts once.
 *
 * A guest pass graded in the browser adds XP.exercise to the lesson's study-store bonus. When the learner
 * signs in and the Worker reports the same exercise as awarded by its XP ledger (GET /api/lab/progress,
 * `passed[].xp`), lib/lab-progress.ts takes the local award back out of the bonus, and lib/sync.ts keeps
 * it out through the next pull + max-merge until the reduced document has been pushed (PUT /api/state).
 *
 * Run (build first; serves `out/` and mocks the Worker, no network needed):
 *   npm run build
 *   node --import tsx --test tests/e2e/phase3/lab-xp.spec.ts
 * Env: as for the other phase3 specs (PHASE3_E2E_SITE_DIR, PHASE3_E2E_API_ORIGIN, CHROMIUM_PATH / PLAYWRIGHT_BROWSERS_PATH).
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { Browser, Page } from "playwright";
import { defaultWorker, eventually, launchBrowser, openPage, startSite } from "./harness";

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

const REF = "cyber-security/python/failed-logins";
const LESSON = "cyber-security/python";

/** The dashboard's "Total XP" figure. */
const totalXp = (page: Page) =>
  page.evaluate(() => [...document.querySelectorAll("main .card")].find((c) => /Total XP/.test(c.textContent ?? ""))?.querySelector("bdi")?.textContent?.trim() ?? "");

describe("lab XP after sign-in", () => {
  it("a guest pass the Worker has also awarded counts once on the dashboard, and on another device", async () => {
    // The server copy still holds the guest's award: it was pushed when the learner first signed in.
    let stored: unknown = { v: 1, lessons: { [LESSON]: { bonus: 15 } }, notes: {}, days: [], updated: 1 };
    const puts: { lessons: Record<string, { bonus?: number }> }[] = [];
    const mockWorker = () => {
      const w = defaultWorker();
      w.state = (method) => (method === "GET" ? { json: { data: stored } } : { json: { ok: true } });
      w.other = (method, path) => (method === "GET" && path === "/api/lab/progress" ? { json: { passed: [{ ref: REF, at: "2026-10-01T10:00:00Z", xp: 15 }], xp: { total: 15, lab: 15 } } } : undefined);
      return w;
    };
    const o = await openPage(browser, origin, "/dashboard/", {
      worker: mockWorker(),
      signedIn: true,
      // What a guest pass of REF left on this device: Passed, and 15 XP in the lesson bonus.
      storage: {
        "imb-labs-v1": JSON.stringify({ [REF]: 1_760_000_000_000 }),
        "imb-study-v1": JSON.stringify({ v: 1, lessons: { [LESSON]: { bonus: 15 } }, notes: {}, days: [], updated: 1 }),
      },
    });
    o.page.on("request", (r) => {
      if (r.method() === "PUT" && r.url().endsWith("/api/state")) {
        const data = (JSON.parse(r.postData() ?? "{}") as { data: { lessons: Record<string, { bonus?: number }> } }).data;
        puts.push(data);
        stored = data;
      }
    });
    try {
      await o.page.waitForFunction(() => localStorage.getItem("imb-labs-server-v1") !== null);
      await eventually(async () => assert.equal(await totalXp(o.page), "15", "one 15-XP lab exercise: 15, not 30"));
      // The reduced document reaches the server (debounced push), so the next pull cannot bring the award back.
      await eventually(() => assert.ok(puts.length > 0, "pushed"), 10_000);
      assert.equal(puts.at(-1)?.lessons[LESSON]?.bonus, undefined);
      assert.deepEqual(o.errors, []);
    } finally {
      await o.close();
    }
    // Another device of the same account: the server copy and the ledger, 15 again.
    const other = await openPage(browser, origin, "/dashboard/", { signedIn: true, worker: mockWorker() });
    try {
      await other.page.waitForFunction(() => localStorage.getItem("imb-labs-server-v1") !== null);
      await eventually(async () => assert.equal(await totalXp(other.page), "15", "a fresh device"));
    } finally {
      await other.close();
    }
  });
});
