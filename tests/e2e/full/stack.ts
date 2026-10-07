/**
 * Full-stack E2E harness: the REAL pieces, wired together on loopback.
 *
 *   runner  (runner/src/main.ts, Docker sandbox)      http://127.0.0.1:4242
 *   Worker  (wrangler dev, local D1 + real migrations) http://127.0.0.1:8787
 *   site    (the static export in out/, built with NEXT_PUBLIC_API_URL pointing at the Worker)
 *                                                      http://127.0.0.1:4173
 *
 * Started once by tests/e2e/run.mjs, which passes the URLs to the specs through
 * E2E_SITE / E2E_API / E2E_RUNNER. Nothing here is mocked.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";

export const SITE = process.env.E2E_SITE ?? "http://127.0.0.1:4173";
export const API = process.env.E2E_API ?? "http://127.0.0.1:8787";

let counter = 0;

export interface TestUser {
  email: string;
  name: string;
  token: string;
}

/** Registers a fresh email account through the real Worker and returns its JWT. */
export async function newUser(prefix = "e2e"): Promise<TestUser> {
  const id = `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;
  const email = `${id}@example.test`;
  const name = `E2E ${id}`;
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: SITE },
    body: JSON.stringify({ name, email, password: "correct-horse-battery-staple-9" }),
  });
  if (!res.ok) throw new Error(`register failed: ${res.status} ${await res.text()}`);
  const { token } = (await res.json()) as { token: string };
  return { email, name, token };
}

/** Calls the Worker API as `user`. */
export async function api<T = unknown>(path: string, user: TestUser | null, init: { method?: string; body?: unknown } = {}): Promise<{ status: number; body: T }> {
  const headers: Record<string, string> = { Origin: SITE };
  if (user) headers.Authorization = `Bearer ${user.token}`;
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${API}${path}`, {
    method: init.method ?? (init.body === undefined ? "GET" : "POST"),
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // non-JSON (e.g. PDF) stays text
  }
  return { status: res.status, body: body as T };
}

let browser: Browser | null = null;

/**
 * The Chromium Playwright expects, or else the newest one under PLAYWRIGHT_BROWSERS_PATH
 * (preinstalled browsers can lag the playwright package by a few revisions).
 */
function findChromium(): string | undefined {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE) return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  if (existsSync(chromium.executablePath())) return undefined;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!existsSync(base)) return undefined;
  for (const dir of readdirSync(base).filter((d) => /^chromium(_headless_shell)?-\d+$/.test(d)).sort().reverse()) {
    for (const rel of ["chrome-linux/chrome", "chrome-linux64/chrome", "chrome-headless-shell-linux64/chrome-headless-shell"]) {
      if (existsSync(join(base, dir, rel))) return join(base, dir, rel);
    }
  }
  return undefined;
}

export async function getBrowser(): Promise<Browser> {
  if (!browser) browser = await chromium.launch({ executablePath: findChromium() });
  return browser;
}

export async function closeBrowser(): Promise<void> {
  await browser?.close();
  browser = null;
}

export interface Session {
  context: BrowserContext;
  page: Page;
  /** Console errors and uncaught page errors collected during the test. */
  errors: string[];
}

/** A browser context signed in as `user` (token in localStorage, like the real callback does). */
export async function openSession(user: TestUser | null, opts: { lang?: "en" | "ar"; viewport?: { width: number; height: number } } = {}): Promise<Session> {
  const b = await getBrowser();
  const context = await b.newContext({ viewport: opts.viewport ?? { width: 1360, height: 900 } });
  await context.addInitScript(
    ([token, lang]) => {
      try {
        if (token) localStorage.setItem("sf_token", token);
        if (lang) localStorage.setItem("sf-lang", lang);
      } catch {
        // storage blocked: the test will fail on the missing session instead
      }
    },
    [user?.token ?? "", opts.lang ?? ""] as const,
  );
  // Hermetic: only the loopback stack is reachable. Web fonts and CDNs are cosmetic here, and
  // waiting on them (or on a proxy that never answers) would only make the specs flaky.
  await context.route(
    (url) => url.hostname !== "127.0.0.1" && url.hostname !== "localhost",
    (route) => route.abort("blockedbyclient"),
  );
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(`console: ${m.text()}`);
  });
  return { context, page, errors };
}

/**
 * Replaces the CodeMirror document: select all, delete, then insert the text in one
 * input event (no per-key auto-indent or bracket closing), like a paste.
 */
export async function setEditorCode(page: Page, code: string): Promise<void> {
  const el = page.locator(".cm-content").first();
  await el.waitFor();
  await el.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.press("Delete");
  await page.keyboard.insertText(code);
}

/** The editor text as rendered (one line per CodeMirror line element). */
export const getEditorCode = (page: Page): Promise<string> => page.locator(".cm-content").first().innerText();
