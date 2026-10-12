/**
 * UI tests for the lab XP rule (lib/xp.ts, lib/lab-progress.ts): lab XP never goes into the synced study
 * state. A guest's total is the study-state XP plus the lab XP guests earned in this browser; a signed-in
 * total is the study-state XP plus the Worker's lab XP for that account (GET /api/lab/progress). A pass the
 * Worker has not recorded for the account (a guest pass, after signing in) shows the "checked on the server"
 * note and no XP until the Worker awards it.
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
import { type MockWorker, defaultWorker, eventually, launchBrowser, openPage, startSite } from "./harness";

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
/** What a guest pass of REF leaves on a device: Passed, and its 15 XP in this browser's guest awards (not in the study state). */
const GUEST_PASS = { "imb-labs-v1": JSON.stringify({ [REF]: 1_760_000_000_000 }), "imb-labs-guest-xp-v1": JSON.stringify({ [REF]: 15 }) };
const study = (bonus?: number) => JSON.stringify({ v: 1, lessons: bonus ? { [LESSON]: { bonus } } : {}, notes: {}, days: [], updated: 1 });

/** The dashboard's "Total XP" figure. */
const totalXp = (page: Page) =>
  page.evaluate(() => [...document.querySelectorAll("main .card")].find((c) => /Total XP/.test(c.textContent ?? ""))?.querySelector("bdi")?.textContent?.trim() ?? "");
const labBlock = (page: Page) => page.locator('section[aria-labelledby="lab-failed-logins"]');

/** A Worker whose server copy has `bonus` XP for LESSON and whose ledger has (or has not) awarded REF. */
function worker(o: { bonus: number; awarded: boolean }): MockWorker {
  const w = defaultWorker();
  const stored = { v: 1, lessons: { [LESSON]: { bonus: o.bonus } }, notes: {}, days: [], updated: 1 };
  w.state = (method) => (method === "GET" ? { json: { data: stored } } : { json: { ok: true } });
  w.other = (method, path) =>
    method === "GET" && path === "/api/lab/progress"
      ? { json: o.awarded ? { passed: [{ ref: REF, at: "2026-10-01T10:00:00Z", xp: 15 }], xp: { total: 15, lab: 15 } } : { passed: [], xp: { total: 0, lab: 0 } } }
      : undefined;
  return w;
}

describe("lab XP on the lesson page", () => {
  it("a pass made while signed in: a guest sees neither line, a signed-in learner the 'checked on the server' note", async () => {
    // Recorded by a signed-in session without guest XP (graded in the browser): 0 in the guest awards.
    const storage = { "imb-labs-v1": JSON.stringify({ [REF]: 1_760_000_000_000 }), "imb-labs-guest-xp-v1": JSON.stringify({ [REF]: 0 }) };
    const guest = await openPage(browser, origin, `/learn/${LESSON}/`, { storage });
    try {
      await labBlock(guest.page).getByText("Passed", { exact: true }).first().waitFor();
      await guest.page.waitForTimeout(300);
      const text = await labBlock(guest.page).innerText();
      assert.doesNotMatch(text, /checked on the server/, "a guest earns this XP by passing it in the browser");
      assert.doesNotMatch(text, /You earned/, "and has not earned it yet");
    } finally {
      await guest.close();
    }
    const member = await openPage(browser, origin, `/learn/${LESSON}/`, { storage, signedIn: true });
    try {
      await eventually(async () => assert.match(await labBlock(member.page).innerText(), /XP is earned when the exercise is checked on the server/));
    } finally {
      await member.close();
    }
  });

  it("a guest pass: 'You earned 15 XP' for the guest; signed in, the note until the Worker awards it", async () => {
    const guest = await openPage(browser, origin, `/learn/${LESSON}/`, { storage: GUEST_PASS });
    try {
      await eventually(async () => assert.match(await labBlock(guest.page).innerText(), /You earned 15 XP/));
    } finally {
      await guest.close();
    }
    const unverified = await openPage(browser, origin, `/learn/${LESSON}/`, { storage: GUEST_PASS, signedIn: true, worker: worker({ bonus: 0, awarded: false }) });
    try {
      await unverified.page.waitForFunction(() => localStorage.getItem("imb-labs-server-v1") !== null);
      await eventually(async () => assert.match(await labBlock(unverified.page).innerText(), /XP is earned when the exercise is checked on the server/));
      assert.doesNotMatch(await labBlock(unverified.page).innerText(), /You earned/);
      assert.deepEqual(unverified.errors, []);
    } finally {
      await unverified.close();
    }
    const awarded = await openPage(browser, origin, `/learn/${LESSON}/`, { storage: GUEST_PASS, signedIn: true, worker: worker({ bonus: 0, awarded: true }) });
    try {
      await eventually(async () => assert.match(await labBlock(awarded.page).innerText(), /You earned 15 XP/));
      assert.doesNotMatch(await labBlock(awarded.page).innerText(), /checked on the server/);
    } finally {
      await awarded.close();
    }
  });
});

describe("lab XP on the dashboard", () => {
  it("guest pass, sign-in to a server copy with 25 bonus XP, the Worker's award: 40, and the bonus pushed stays 25", async () => {
    const guest = await openPage(browser, origin, "/dashboard/", { storage: { ...GUEST_PASS, "imb-study-v1": study() } });
    try {
      await eventually(async () => assert.equal(await totalXp(guest.page), "15", "a guest: the browser's own lab award"));
    } finally {
      await guest.close();
    }

    // The server copy has 25 bonus XP for the lesson (an exercise and a quiz, from a laptop).
    const puts: { lessons: Record<string, { bonus?: number }> }[] = [];
    const o = await openPage(browser, origin, "/dashboard/", { storage: { ...GUEST_PASS, "imb-study-v1": study() }, signedIn: true, worker: worker({ bonus: 25, awarded: true }) });
    o.page.on("request", (r) => {
      if (r.method() === "PUT" && r.url().endsWith("/api/state")) puts.push((JSON.parse(r.postData() ?? "{}") as { data: (typeof puts)[number] }).data);
    });
    try {
      await o.page.waitForFunction(() => localStorage.getItem("imb-labs-server-v1") !== null);
      await eventually(async () => assert.equal(await totalXp(o.page), "40", "25 synced bonus + 15 from the Worker; the guest award is not counted on top"));
      await eventually(() => assert.ok(puts.length > 0, "pushed"), 10_000);
      assert.equal(puts.at(-1)?.lessons[LESSON]?.bonus, 25, "lab XP never enters the synced bonus");
      assert.deepEqual(o.errors, []);
    } finally {
      await o.close();
    }

    // Signed in, but the Worker has not awarded the exercise: the guest award does not count.
    const pending = await openPage(browser, origin, "/dashboard/", { storage: { ...GUEST_PASS, "imb-study-v1": study() }, signedIn: true, worker: worker({ bonus: 25, awarded: false }) });
    try {
      await pending.page.waitForFunction(() => localStorage.getItem("imb-labs-server-v1") !== null);
      await eventually(async () => assert.equal(await totalXp(pending.page), "25"));
    } finally {
      await pending.close();
    }

    // Signed out again, with what the sign-in synced: the guest rule, 25 + the browser's own 15.
    const after = await openPage(browser, origin, "/dashboard/", { storage: { ...GUEST_PASS, "imb-study-v1": study(25) } });
    try {
      await eventually(async () => assert.equal(await totalXp(after.page), "40"));
    } finally {
      await after.close();
    }

    // Another device of the same account: the server copy and the ledger, 40 again.
    const other = await openPage(browser, origin, "/dashboard/", { signedIn: true, worker: worker({ bonus: 25, awarded: true }) });
    try {
      await other.page.waitForFunction(() => localStorage.getItem("imb-labs-server-v1") !== null);
      await eventually(async () => assert.equal(await totalXp(other.page), "40", "a fresh device"));
    } finally {
      await other.close();
    }
  });
});
