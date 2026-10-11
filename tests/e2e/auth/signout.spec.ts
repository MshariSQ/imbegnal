/**
 * UI tests for server-side sign-out and revoked tokens.
 *
 * Signing out (lib/auth.ts signOut, the navbar's "Sign out") first asks the Worker to revoke the session
 * (POST /api/auth/logout with the token), then clears the token and goes home. The call is best effort: the
 * previous Worker answers 404, an unreachable or silent Worker must not keep anyone signed in. A token the
 * Worker rejects with 401 on the study-state sync (revoked by a sign-out on another device, or the account is
 * gone) signs the tab out (lib/sync.ts); a 404 (previous Worker) or a network error does not.
 *
 * Run (build first; serves `out/` and mocks the Worker, no network needed):
 *   npm run build
 *   node --import tsx --test tests/e2e/auth/signout.spec.ts
 * Env: as for tests/e2e/phase3 (PHASE3_E2E_SITE_DIR, PHASE3_E2E_API_ORIGIN, CHROMIUM_PATH / PLAYWRIGHT_BROWSERS_PATH).
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { Browser, BrowserContext, Page, Route } from "playwright";
import { translations } from "../../../lib/i18n";
import { API_ORIGIN, TEST_TOKEN, TEST_USER, eventually, launchBrowser, startSite } from "../phase3/harness";

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

const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, content-type", "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS" };

type Answer = "ok" | "404" | "hang" | "unreachable";

interface Session {
  page: Page;
  ctx: BrowserContext;
  /** Authorization headers of the POST /api/auth/logout requests that reached the mock. */
  logouts: (string | null)[];
  pageErrors: string[];
  blocked: string[];
  close: () => Promise<void>;
}

/**
 * A signed-in browser context against a mocked Worker. `logout` picks how POST /api/auth/logout answers;
 * `state` how GET /api/state answers a request that carries a token (without one it is always 401, the
 * capability probe of lib/capabilities.ts).
 */
async function session(opts: { logout?: Answer; state?: 200 | 401 | 404 | "unreachable"; viewport?: { width: number; height: number } } = {}): Promise<Session> {
  const ctx = await browser.newContext({ viewport: opts.viewport ?? { width: 1280, height: 900 }, serviceWorkers: "block" });
  const logouts: (string | null)[] = [];
  const blocked: string[] = [];
  await ctx.route("**/*", (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.hostname === "127.0.0.1" || url.hostname === "localhost") return route.continue();
    if (url.origin !== API_ORIGIN) {
      blocked.push(url.href);
      return route.abort();
    }
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const auth = req.headers()["authorization"] ?? null;
    const json = (status: number, body: unknown) => route.fulfill({ status, headers: { ...CORS, "content-type": "application/json" }, body: JSON.stringify(body) });
    if (url.pathname === "/api/auth/logout" && req.method() === "POST") {
      logouts.push(auth);
      const answer = opts.logout ?? "ok";
      if (answer === "hang") return new Promise<void>(() => undefined); // never answers
      if (answer === "unreachable") return route.abort("connectionfailed");
      return answer === "404" ? json(404, { error: "Not found" }) : json(200, { ok: true });
    }
    if (url.pathname === "/api/state") {
      if (!auth) return json(401, { error: "Unauthorized" });
      const state = opts.state ?? 200;
      if (state === "unreachable") return route.abort("connectionfailed");
      return state === 200 ? json(200, { data: null }) : json(state, { error: state === 401 ? "Unauthorized" : "Not found" });
    }
    return json(404, { error: "not_found" });
  });
  await ctx.addInitScript((token) => {
    try {
      localStorage.setItem("sf-lang", "en");
      // Only before the first load of the context: a later navigation must see what the page left behind.
      if (!sessionStorage.getItem("signout-spec-seeded")) {
        localStorage.setItem("sf_token", token);
        sessionStorage.setItem("signout-spec-seeded", "1");
      }
    } catch {
      /* ignore */
    }
  }, TEST_TOKEN);
  const page = await ctx.newPage();
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource|net::ERR_/.test(m.text())) pageErrors.push(`console.error: ${m.text()}`);
  });
  return { page, ctx, logouts, pageErrors, blocked, close: () => ctx.close() };
}

const savedToken = (p: Page) => p.evaluate(() => localStorage.getItem("sf_token"));
const nav = translations.en.nav;

function clean(s: Session) {
  assert.deepEqual(s.pageErrors, [], "no page errors or hydration warnings");
  assert.deepEqual(s.blocked, [], "hermetic: nothing left loopback or the Worker origin");
}

/** Desktop navbar: open the account menu, press "Sign out". */
async function signOutFromMenu(page: Page) {
  await page.getByRole("button", { name: TEST_USER.name }).click();
  await page.getByRole("button", { name: nav.signOut }).click();
}

/** Home page, no token, and the navbar offers "Log in" (inside the menu sheet on phones). */
async function expectSignedOutAtHome(s: Session, mobile = false) {
  await eventually(async () => {
    assert.equal(new URL(s.page.url()).pathname, "/");
    assert.equal(await savedToken(s.page), null);
  }, 10_000);
  if (mobile) await s.page.getByRole("button", { name: nav.menu }).click();
  await s.page.getByRole("link", { name: nav.login }).first().waitFor();
}

describe("signing out", () => {
  it("revokes the session on the Worker with the current token, then clears it and goes home", async () => {
    const s = await session();
    try {
      await s.page.goto(`${origin}/dashboard/`);
      await signOutFromMenu(s.page);
      await expectSignedOutAtHome(s);
      assert.deepEqual(s.logouts, [`Bearer ${TEST_TOKEN}`]);
      clean(s);
    } finally {
      await s.close();
    }
  });

  it("the mobile menu's Sign out does the same", async () => {
    const s = await session({ viewport: { width: 390, height: 844 } });
    try {
      await s.page.goto(`${origin}/dashboard/`);
      await s.page.getByRole("button", { name: nav.menu }).click();
      await s.page.getByRole("button", { name: nav.signOut }).click();
      await expectSignedOutAtHome(s, true);
      assert.deepEqual(s.logouts, [`Bearer ${TEST_TOKEN}`]);
      clean(s);
    } finally {
      await s.close();
    }
  });

  for (const [answer, why] of [
    ["404", "the previous Worker has no logout route"],
    ["unreachable", "the Worker cannot be reached"],
    ["hang", "the Worker never answers (sign-out waits about 1.5 s, not forever)"],
  ] as const) {
    it(`still signs out locally when ${why}`, async () => {
      const s = await session({ logout: answer });
      try {
        await s.page.goto(`${origin}/dashboard/`);
        const t0 = Date.now();
        await signOutFromMenu(s.page);
        await expectSignedOutAtHome(s);
        assert.equal(s.logouts.length, 1);
        if (answer === "hang") assert.ok(Date.now() - t0 < 8_000, "bounded wait");
        clean(s);
      } finally {
        await s.close();
      }
    });
  }
});

describe("a token the Worker no longer accepts", () => {
  it("a 401 from the study-state sync signs this tab out (revoked elsewhere, or the account is gone)", async () => {
    const s = await session({ state: 401 });
    try {
      await s.page.goto(`${origin}/dashboard/`);
      await eventually(async () => assert.equal(await savedToken(s.page), null), 10_000);
      await s.page.getByRole("link", { name: nav.login }).first().waitFor();
      assert.deepEqual(s.logouts, [], "no logout call: the token is already dead");
      clean(s);
    } finally {
      await s.close();
    }
  });

  for (const state of [404, "unreachable"] as const) {
    it(`a ${state === 404 ? "404 (previous Worker)" : "network error"} keeps the user signed in`, async () => {
      const s = await session({ state });
      try {
        await s.page.goto(`${origin}/dashboard/`);
        await s.page.getByRole("button", { name: TEST_USER.name }).waitFor();
        await s.page.waitForTimeout(500); // the sync's pull has answered by now
        assert.equal(await savedToken(s.page), TEST_TOKEN);
        clean(s);
      } finally {
        await s.close();
      }
    });
  }
});
