/**
 * Shared Playwright harness for the Challenges specs: serves the static
 * fixture export, launches Chromium, mocks the Worker API with page.route and
 * collects console / page errors so every spec can assert there are none.
 */
import { createServer, type Server } from "node:http";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import type { AddressInfo } from "node:net";
import { chromium, type Browser, type BrowserContext, type Page, type Route } from "playwright";
import type { ChallengeStat, ChallengesApiResponse, LeaderboardResponse, SubmitResponse } from "../../../shared/api";
import type { ChallengeHintResponse } from "../../../shared/challenges";
import { FIXTURE_NOW, fixtureLeaderboardResponse, fixtureStats } from "../../fixtures/challenges/api";
import { fixtureChallenges } from "../../fixtures/challenges/challenges";
import { fixtureHintTexts } from "../../fixtures/challenges/hints";

export const ROOT = resolve(__dirname, "../../..");
export const SITE_DIR = process.env.CTF_E2E_SITE_DIR ?? join(ROOT, "node_modules/.cache/ctf-e2e-site");
export const API_ORIGIN = "https://imbegnal-e2e.workers.dev";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

/** Static server with the same URL semantics as the Cloudflare export (`/x/` -> x/index.html). */
export function startSite(): Promise<{ server: Server; origin: string }> {
  if (!existsSync(join(SITE_DIR, "challenges/index.html"))) {
    throw new Error(`No fixture site at ${SITE_DIR}. Run: node tests/e2e/challenges/build-fixture-site.mjs`);
  }
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://x");
    const rel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
    let file = join(SITE_DIR, rel);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!file.startsWith(SITE_DIR) || !existsSync(file)) {
      const nf = join(SITE_DIR, "404.html");
      res.writeHead(404, { "content-type": MIME[".html"] });
      res.end(existsSync(nf) ? readFileSync(nf) : "not found");
      return;
    }
    res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok({ server, origin: `http://127.0.0.1:${(server.address() as AddressInfo).port}` })));
}

function findChromium(): string | undefined {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!existsSync(base)) return undefined;
  for (const d of readdirSync(base).filter((n) => /^chromium-\d+$/.test(n)).sort().reverse()) {
    for (const sub of ["chrome-linux/chrome", "chrome-linux64/chrome"]) {
      const p = join(base, d, sub);
      if (existsSync(p)) return p;
    }
  }
  return undefined;
}

/** Launch Chromium: Playwright's own install when present, else the newest chromium under PLAYWRIGHT_BROWSERS_PATH. */
export async function launchBrowser(): Promise<Browser> {
  try {
    return await chromium.launch();
  } catch (e) {
    const executablePath = findChromium();
    if (!executablePath) throw e;
    return chromium.launch({ executablePath });
  }
}

// ── auth ─────────────────────────────────────────────────────────────────────
const b64url = (s: string) => Buffer.from(s, "utf8").toString("base64url");
export const TEST_USER = { sub: "u-test", username: "tester", name: "Test Learner", avatar: "", exp: 4_102_444_800 };
/** A structurally valid (unsigned) token: the client only parses the payload; the mocked Worker accepts anything. */
export const TEST_TOKEN = `${b64url('{"alg":"none"}')}.${b64url(JSON.stringify(TEST_USER))}.sig`;

export interface ContextOptions {
  lang?: "en" | "ar";
  theme?: "light" | "dark";
  signedIn?: boolean;
  viewport?: { width: number; height: number };
  reducedMotion?: boolean;
}

export async function newContext(browser: Browser, o: ContextOptions = {}): Promise<BrowserContext> {
  const ctx = await browser.newContext({
    viewport: o.viewport ?? { width: 1280, height: 900 },
    reducedMotion: o.reducedMotion ? "reduce" : "no-preference",
    colorScheme: o.theme ?? "dark",
    serviceWorkers: "block",
  });
  // Deterministic relative times ("2 hours ago") while timers keep running.
  await ctx.clock.setFixedTime(FIXTURE_NOW);
  await ctx.addInitScript(
    ({ lang, theme, token }) => {
      try {
        localStorage.setItem("sf-lang", lang);
        localStorage.setItem("imb-theme", theme);
        if (token) localStorage.setItem("sf_token", token);
      } catch {
        /* ignore */
      }
    },
    { lang: o.lang ?? "en", theme: o.theme ?? "dark", token: o.signedIn ? TEST_TOKEN : null }
  );
  return ctx;
}

// ── mocked Worker ────────────────────────────────────────────────────────────
export interface ApiCall {
  method: string;
  path: string;
  auth: string | null;
  body: unknown;
}

export interface MockApi {
  calls: ApiCall[];
  /** replace the GET /api/challenges answer; return null to answer with a network failure */
  stats: (signedIn: boolean) => ChallengesApiResponse | null;
  /** return null to answer with a network failure */
  leaderboard: (q: { track?: string; period: "all" | "week"; signedIn: boolean }) => LeaderboardResponse | null;
  /** answer for POST .../submit; may return a custom status */
  submit: (id: string, body: Record<string, unknown>, callNo: number) => { status?: number; headers?: Record<string, string>; json: unknown } | SubmitResponse;
  hint: (id: string, index: number) => { status?: number; json: unknown };
  callsTo: (method: string, pathPart: string) => ApiCall[];
}

export function defaultMock(): MockApi {
  const api: MockApi = {
    calls: [],
    stats: (signedIn) => fixtureStats(signedIn),
    leaderboard: (q) => fixtureLeaderboardResponse(q),
    submit: () => ({ correct: false, awarded: 0, alreadySolved: false, firstBlood: false }),
    hint: (id, index) => ({ json: fixtureHintReveal(id, index) }),
    callsTo: (method, pathPart) => api.calls.filter((c) => c.method === method && c.path.includes(pathPart)),
  };
  return api;
}

/**
 * The mocked Worker's answer to POST .../hint: like the real one, it is the ONLY source of the hint
 * text (the fixture site's public data carries just the costs). Hints count as revealed in order.
 */
export function fixtureHintReveal(id: string, index: number): ChallengeHintResponse | { error: string } {
  const meta = fixtureChallenges.find((c) => c.id === id);
  const text = fixtureHintTexts[id]?.[index];
  if (!meta?.hints?.[index] || !text) return { error: "invalid_request" };
  const revealed = Array.from({ length: index + 1 }, (_, i) => i);
  const spent = revealed.reduce((s, i) => s + (meta.hints?.[i]?.cost ?? 0), 0);
  return { index, text, cost: meta.hints[index].cost, revealed, hintsUsed: revealed.length, potentialPoints: Math.max(0, meta.points - spent) };
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "GET, POST, OPTIONS",
};

/** Intercepts every request to the Worker origin and answers with the given mock. */
export async function mockApi(ctx: BrowserContext, api: MockApi): Promise<void> {
  const submitCounts = new Map<string, number>();
  await ctx.route(`${API_ORIGIN}/**`, async (route: Route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    const auth = req.headers()["authorization"] ?? null;
    let body: unknown = undefined;
    try {
      body = req.postData() ? JSON.parse(req.postData() as string) : undefined;
    } catch {
      body = req.postData();
    }
    api.calls.push({ method: req.method(), path: url.pathname + url.search, auth, body });
    const json = (status: number, data: unknown, headers: Record<string, string> = {}) =>
      route.fulfill({ status, headers: { ...CORS, "content-type": "application/json", ...headers }, body: JSON.stringify(data) });

    const signedIn = !!auth;
    if (req.method() === "GET" && url.pathname === "/api/challenges") {
      const s = api.stats(signedIn);
      return s ? json(200, s) : route.abort("connectionfailed");
    }
    if (req.method() === "GET" && url.pathname === "/api/leaderboard") {
      const period = url.searchParams.get("period") === "week" ? "week" : "all";
      const lb = api.leaderboard({ track: url.searchParams.get("track") ?? undefined, period, signedIn });
      return lb ? json(200, lb) : route.abort("connectionfailed");
    }
    const m = url.pathname.match(/^\/api\/challenges\/([^/]+)\/(open|hint|submit)$/);
    if (req.method() === "POST" && m) {
      const [, id, action] = m;
      if (action === "open") return json(200, { ok: true });
      if (!auth) return json(401, { error: "unauthorized" });
      if (action === "hint") {
        const r = api.hint(id, Number((body as { index?: number })?.index ?? 0));
        return json(r.status ?? 200, r.json);
      }
      const n = (submitCounts.get(id) ?? 0) + 1;
      submitCounts.set(id, n);
      const r = api.submit(id, (body ?? {}) as Record<string, unknown>, n);
      if ("json" in r) return json(r.status ?? 200, r.json, r.headers);
      return json(200, r);
    }
    return json(404, { error: "not_found" });
  });
}

// ── error collection ─────────────────────────────────────────────────────────
/** Console errors/warnings of interest and uncaught page errors. Hydration mismatches log as console errors. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const text = m.text();
    // Aborted requests (the "API unreachable" scenarios) legitimately log a failed fetch.
    if (/Failed to load resource|net::ERR_/.test(text)) return;
    errors.push(`console.error: ${text}`);
  });
  return errors;
}

export function statById(stats: ChallengesApiResponse | null, id: string): ChallengeStat | undefined {
  return stats?.stats.find((s) => s.id === id);
}

// ── page helpers ─────────────────────────────────────────────────────────────
export interface OpenedPage {
  page: Page;
  ctx: BrowserContext;
  errors: string[];
  api: MockApi;
  close: () => Promise<void>;
}

/** New context + mocked Worker + page navigated to `path` (relative to the static site). */
export async function openPage(
  browser: Browser,
  origin: string,
  path: string,
  o: ContextOptions & { api?: MockApi; /** extra routes etc., registered after the mock (so they run first) */ beforeGoto?: (ctx: BrowserContext) => Promise<void> } = {}
): Promise<OpenedPage> {
  const ctx = await newContext(browser, o);
  const api = o.api ?? defaultMock();
  await mockApi(ctx, api);
  await o.beforeGoto?.(ctx);
  const page = await ctx.newPage();
  const errors = collectErrors(page);
  await page.goto(origin + path);
  return { page, ctx, errors, api, close: () => ctx.close() };
}

/** Poll until `fn` stops throwing (async-friendly stand-in for expect.poll). */
export async function eventually<T>(fn: () => T | Promise<T>, timeoutMs = 8000): Promise<T> {
  const start = Date.now();
  for (;;) {
    try {
      return await fn();
    } catch (e) {
      if (Date.now() - start > timeoutMs) throw e;
      await new Promise((r) => setTimeout(r, 50));
    }
  }
}

/** The list card whose (single) link has exactly this accessible name. */
export const card = (page: Page, name: string) => page.getByTestId("ctf-card").filter({ has: page.getByRole("link", { name, exact: true }) });

/** Titles of the visible challenge cards, in DOM order. */
export const cardTitles = (page: Page) => page.locator('[data-testid="ctf-grid"] h3').allTextContents();

// ── accessibility ────────────────────────────────────────────────────────────
interface AxeViolation {
  id: string;
  impact?: string | null;
  help: string;
  nodes: { target: unknown[]; html: string }[];
}

/** Runs axe-core (injected via CDP, so the page CSP does not matter); returns serious + critical violations. */
export async function seriousViolations(page: Page): Promise<AxeViolation[]> {
  const source = readFileSync(join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8");
  await page.evaluate(source);
  const result = await page.evaluate(async () => {
    const axe = (globalThis as unknown as { axe: { run: (ctx: Document, opts: object) => Promise<{ violations: AxeViolation[] }> } }).axe;
    return axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } });
  });
  return result.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

export const describeViolations = (vs: AxeViolation[]) =>
  vs.map((v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.slice(0, 3).map((n) => `${n.target.join(" ")} :: ${n.html.slice(0, 120)}`).join("\n    ")}`).join("\n");
