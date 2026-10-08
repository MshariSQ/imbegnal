/**
 * UI tests for the sign-in callback's login-CSRF guard (lib/auth-nonce.ts, app/auth/callback/page.tsx).
 *
 * An attacker link https://<site>/auth/callback/#token=<attacker JWT> must NOT sign a visitor in when the
 * new Worker is deployed; a normal "Continue with GitHub" flow, whose fragment echoes this tab's nonce, must.
 * With the previous Worker (GET /api/state answers 404) a fragment without a nonce is accepted only in a tab
 * that has just started a sign-in (holds a fresh nonce); a fresh tab opened from an attacker link is refused.
 * What remains is the documented residual window (docs/PLATFORM.md, Known gaps).
 *
 * Run (build first; serves `out/` and mocks the Worker, no network needed):
 *   npm run build
 *   node --import tsx --test tests/e2e/auth/callback.spec.ts
 * Env: as for tests/e2e/phase3 (PHASE3_E2E_SITE_DIR, PHASE3_E2E_API_ORIGIN, CHROMIUM_PATH / PLAYWRIGHT_BROWSERS_PATH).
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { Browser, BrowserContext, Page, Route } from "playwright";
import { translations } from "../../../lib/i18n";
import { API_ORIGIN, TEST_TOKEN, eventually, launchBrowser, startSite } from "../phase3/harness";

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

const en = translations.en.auth;
const ar = translations.ar.auth;
const NONCE_RE = /^[A-Za-z0-9_-]{32}$/;

const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, content-type", "access-control-allow-methods": "GET, POST, PUT, OPTIONS" };

interface Session {
  page: Page;
  ctx: BrowserContext;
  /** ?nonce= values the OAuth start endpoints received ("" when absent). */
  startNonces: string[];
  pageErrors: string[];
  blocked: string[];
  close: () => Promise<void>;
}

/**
 * A browser context against a mocked Worker. `api` picks the generation: "new" answers GET /api/state
 * without a token with 401, "legacy" with 404 (the old Worker has no such route). The OAuth start
 * endpoints redirect straight back to the callback, echoing the nonce only when the Worker is new,
 * exactly like worker/src/util.ts redirectWithToken.
 */
async function session(api: "new" | "legacy", lang: "en" | "ar" = "en"): Promise<Session> {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: "block" });
  const startNonces: string[] = [];
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
    if (url.pathname === "/api/auth/github" || url.pathname === "/api/auth/google") {
      const nonce = url.searchParams.get("nonce") ?? "";
      startNonces.push(nonce);
      const fragment = api === "new" && nonce ? `token=${TEST_TOKEN}&nonce=${nonce}` : `token=${TEST_TOKEN}`;
      return route.fulfill({ status: 302, headers: { location: `${origin}/auth/callback/#${fragment}`, "cache-control": "no-store" } });
    }
    const auth = req.headers()["authorization"];
    if (url.pathname === "/api/state" && api === "new") {
      return auth
        ? route.fulfill({ status: 200, headers: { ...CORS, "content-type": "application/json" }, body: JSON.stringify({ data: null }) })
        : route.fulfill({ status: 401, headers: { ...CORS, "content-type": "application/json" }, body: '{"error":"unauthorized"}' });
    }
    return route.fulfill({ status: 404, headers: { ...CORS, "content-type": "application/json" }, body: '{"error":"not_found"}' });
  });
  await ctx.addInitScript((l) => {
    try {
      localStorage.setItem("sf-lang", l);
    } catch {
      /* ignore */
    }
  }, lang);
  const page = await ctx.newPage();
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource|net::ERR_/.test(m.text())) pageErrors.push(`console.error: ${m.text()}`);
  });
  return { page, ctx, startNonces, pageErrors, blocked, close: () => ctx.close() };
}

const savedToken = (p: Page) => p.evaluate(() => localStorage.getItem("sf_token"));
/** The login form's error (the page also has Next's route announcer with role="alert"). */
const loginAlert = (p: Page) => p.locator('p[role="alert"]').innerText();
const storedNonce = (p: Page) => p.evaluate(() => sessionStorage.getItem("imb_login_nonce"));

async function waitForPath(p: Page, path: string): Promise<URL> {
  return eventually(() => {
    const u = new URL(p.url());
    assert.equal(u.pathname, path);
    return u;
  });
}

function clean(s: Session) {
  assert.deepEqual(s.pageErrors, [], "no page errors or hydration warnings");
  assert.deepEqual(s.blocked, [], "hermetic: nothing left loopback or the Worker origin");
}

describe("new API (Worker echoes the login nonce)", () => {
  it("Continue with GitHub sends a fresh nonce, the echoed nonce signs in, and the nonce is used up", async () => {
    const s = await session("new");
    try {
      await s.page.goto(`${origin}/login/`);
      await s.page.getByTestId("oauth-github").click();
      await waitForPath(s.page, "/dashboard/");
      assert.equal(s.startNonces.length, 1);
      assert.match(s.startNonces[0], NONCE_RE, "32-char base64url nonce on /api/auth/github");
      assert.equal(await savedToken(s.page), TEST_TOKEN);
      assert.equal(await storedNonce(s.page), null, "one use: deleted after the callback");
      assert.equal(new URL(s.page.url()).hash, "", "token wiped from the address bar");
      clean(s);
    } finally {
      await s.close();
    }
  });

  it("each sign-in attempt gets a new nonce", async () => {
    const s = await session("new");
    try {
      for (let i = 0; i < 2; i++) {
        await s.page.goto(`${origin}/login/`);
        await s.page.getByTestId("oauth-github").click();
        await waitForPath(s.page, "/dashboard/");
      }
      assert.equal(s.startNonces.length, 2);
      assert.notEqual(s.startNonces[0], s.startNonces[1]);
    } finally {
      await s.close();
    }
  });

  it("an attacker link without the victim's nonce does NOT sign in, and explains why (English)", async () => {
    const s = await session("new");
    try {
      await s.page.goto(`${origin}/auth/callback/#token=${TEST_TOKEN}`);
      const u = await waitForPath(s.page, "/login/");
      assert.equal(u.searchParams.get("error"), "login_untrusted");
      assert.equal(await savedToken(s.page), null, "the attacker's token was not saved");
      assert.equal(await loginAlert(s.page), en.errorLoginUntrusted);
      clean(s);
    } finally {
      await s.close();
    }
  });

  it("an attacker link with the attacker's own nonce does not sign in either (Arabic message)", async () => {
    const s = await session("new", "ar");
    try {
      await s.page.goto(`${origin}/auth/callback/#token=${TEST_TOKEN}&nonce=${"A".repeat(32)}`);
      await waitForPath(s.page, "/login/");
      assert.equal(await savedToken(s.page), null);
      assert.equal(await loginAlert(s.page), ar.errorLoginUntrusted);
      clean(s);
    } finally {
      await s.close();
    }
  });

  it("a victim mid-sign-in who opens an attacker link in the same tab is not signed in, and the nonce is spent", async () => {
    const s = await session("new");
    try {
      await s.page.goto(`${origin}/login/`);
      // The victim's tab holds a nonce (as after clicking a sign-in button), then follows the attacker's link.
      await s.page.evaluate(() => sessionStorage.setItem("imb_login_nonce", JSON.stringify({ n: "victimNonce_victimNonce_victimNo", t: Date.now() })));
      await s.page.goto(`${origin}/auth/callback/#token=${TEST_TOKEN}&nonce=${"B".repeat(32)}`);
      await waitForPath(s.page, "/login/");
      assert.equal(await savedToken(s.page), null);
      assert.equal(await storedNonce(s.page), null);
    } finally {
      await s.close();
    }
  });

  it("an expired nonce is refused with its own message", async () => {
    const s = await session("new");
    try {
      await s.page.goto(`${origin}/login/`);
      const n = "C".repeat(32);
      await s.page.evaluate((nonce) => sessionStorage.setItem("imb_login_nonce", JSON.stringify({ n: nonce, t: Date.now() - 11 * 60 * 1000 })), n);
      await s.page.goto(`${origin}/auth/callback/#token=${TEST_TOKEN}&nonce=${n}`);
      const u = await waitForPath(s.page, "/login/");
      assert.equal(u.searchParams.get("error"), "login_expired");
      assert.equal(await savedToken(s.page), null);
      assert.equal(await loginAlert(s.page), en.errorLoginExpired);
    } finally {
      await s.close();
    }
  });

  it("an OAuth error still lands on the login page with the generic message", async () => {
    const s = await session("new");
    try {
      await s.page.goto(`${origin}/auth/callback/?error=auth_failed`);
      await waitForPath(s.page, "/login/");
      assert.equal(await loginAlert(s.page), en.errorAuthFailed);
      assert.equal(await savedToken(s.page), null);
    } finally {
      await s.close();
    }
  });
});

describe("previous API (frontend-only mode: the Worker never echoes a nonce)", () => {
  it("GitHub sign-in keeps working", async () => {
    const s = await session("legacy");
    try {
      await s.page.goto(`${origin}/login/`);
      await s.page.getByTestId("oauth-github").click();
      await waitForPath(s.page, "/dashboard/");
      assert.equal(s.startNonces.length, 1);
      assert.match(s.startNonces[0], NONCE_RE, "the click stored and sent a nonce, which the old Worker ignores");
      assert.equal(await savedToken(s.page), TEST_TOKEN);
      assert.equal(await storedNonce(s.page), null);
      clean(s);
    } finally {
      await s.close();
    }
  });

  it("a fragment that carries a wrong nonce is still refused", async () => {
    const s = await session("legacy");
    try {
      await s.page.goto(`${origin}/auth/callback/#token=${TEST_TOKEN}&nonce=${"D".repeat(32)}`);
      await waitForPath(s.page, "/login/");
      assert.equal(await savedToken(s.page), null);
    } finally {
      await s.close();
    }
  });

  it("an attacker link without a nonce, opened in a tab that started no sign-in, does NOT sign in (English)", async () => {
    const s = await session("legacy");
    try {
      await s.page.goto(`${origin}/auth/callback/#token=${TEST_TOKEN}`);
      const u = await waitForPath(s.page, "/login/");
      assert.equal(u.searchParams.get("error"), "login_untrusted");
      assert.equal(await savedToken(s.page), null, "the attacker's token was not saved");
      assert.equal(await loginAlert(s.page), en.errorLoginUntrusted);
      clean(s);
    } finally {
      await s.close();
    }
  });

  it("the same link is refused in Arabic too, and a stale sign-in (over 10 minutes) does not open the window", async () => {
    const s = await session("legacy", "ar");
    try {
      await s.page.goto(`${origin}/login/`);
      await s.page.evaluate(() => sessionStorage.setItem("imb_login_nonce", JSON.stringify({ n: "E".repeat(32), t: Date.now() - 11 * 60 * 1000 })));
      await s.page.goto(`${origin}/auth/callback/#token=${TEST_TOKEN}`);
      const u = await waitForPath(s.page, "/login/");
      assert.equal(u.searchParams.get("error"), "login_expired");
      assert.equal(await savedToken(s.page), null);
      assert.equal(await loginAlert(s.page), ar.errorLoginExpired);
      assert.equal(await storedNonce(s.page), null);
      clean(s);
    } finally {
      await s.close();
    }
  });

  it("residual window (documented): a victim mid-sign-in who follows a nonce-less link in the same tab is signed in", async () => {
    const s = await session("legacy");
    try {
      await s.page.goto(`${origin}/login/`);
      // As right after a click on a sign-in button: this tab holds a fresh nonce the old Worker cannot echo.
      await s.page.evaluate(() => sessionStorage.setItem("imb_login_nonce", JSON.stringify({ n: "F".repeat(32), t: Date.now() })));
      await s.page.goto(`${origin}/auth/callback/#token=${TEST_TOKEN}`);
      await waitForPath(s.page, "/dashboard/");
      assert.equal(await savedToken(s.page), TEST_TOKEN);
      assert.equal(await storedNonce(s.page), null, "the window is single-use");
    } finally {
      await s.close();
    }
  });
});
