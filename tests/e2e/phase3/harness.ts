/**
 * Shared Playwright harness for the Phase 3 specs (/certificate/ and /instructor/).
 *
 * It serves the static export (`out/` from `npm run build`) on a loopback port, launches Chromium and
 * answers every Worker request from an in-memory mock with the exact shapes of shared/api.ts. The tests
 * are hermetic: only loopback and the Worker origin are reachable; anything else (fonts, CDNs, avatars)
 * is aborted and recorded in `blocked`, which the specs assert stays empty.
 *
 * The production build bakes in `https://skillforge-api.skillforge.workers.dev` as the API origin when
 * NEXT_PUBLIC_API_URL is unset (lib/site.ts); override with PHASE3_E2E_API_ORIGIN if you built with another.
 */
import { createServer, type Server } from "node:http";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import type { AddressInfo } from "node:net";
import { chromium, type Browser, type BrowserContext, type Page, type Route } from "playwright";
import type { CertificateVerifyResponse, InstructorAnalytics } from "../../../shared/api";

export const ROOT = resolve(__dirname, "../../..");
export const SITE_DIR = process.env.PHASE3_E2E_SITE_DIR ?? join(ROOT, "out");
export const API_ORIGIN = (process.env.PHASE3_E2E_API_ORIGIN ?? "https://skillforge-api.skillforge.workers.dev").replace(/\/$/, "");

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

/** Fails early, with the fix, when `out/` is missing or was built for another API origin. */
function assertSiteBuilt(): void {
  for (const page of ["certificate", "instructor"]) {
    if (!existsSync(join(SITE_DIR, page, "index.html"))) throw new Error(`No ${page}/index.html in ${SITE_DIR}. Run: npm run build`);
  }
  const chunks = join(SITE_DIR, "_next/static/chunks");
  const baked = readdirSync(chunks).some((f) => f.endsWith(".js") && readFileSync(join(chunks, f), "utf8").includes(API_ORIGIN));
  if (!baked) throw new Error(`${SITE_DIR} was not built for the API origin ${API_ORIGIN}. Rebuild without NEXT_PUBLIC_API_URL or set PHASE3_E2E_API_ORIGIN.`);
}

/** Static server with the same URL semantics as the Cloudflare export (`/x/` -> x/index.html). */
export function startSite(): Promise<{ server: Server; origin: string }> {
  assertSiteBuilt();
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
export const TEST_USER = { sub: "u-instructor", username: "dana", name: "Dana Instructor", avatar: "", exp: 4_102_444_800 };
/** Structurally valid (unsigned) token: the client only parses the payload; the mocked Worker accepts anything. */
export const TEST_TOKEN = `${b64url('{"alg":"none"}')}.${b64url(JSON.stringify(TEST_USER))}.sig`;

// ── mocked Worker ────────────────────────────────────────────────────────────
export interface ApiCall {
  method: string;
  path: string;
  auth: string | null;
}

/** One mocked answer. `abort` simulates an unreachable server. */
export type Reply = { status?: number; json?: unknown; text?: string } | { abort: true };

export interface MockWorker {
  calls: ApiCall[];
  /** GET /api/certificates/verify/:code (no auth). `call` counts requests for this code, from 1. */
  verify: (code: string, call: number) => Reply;
  /** GET /api/instructor/analytics?days=N */
  analytics: (days: number, auth: string | null, call: number) => Reply;
  callsTo: (pathPart: string) => ApiCall[];
}

export function defaultWorker(): MockWorker {
  const w: MockWorker = {
    calls: [],
    verify: () => ({ json: { valid: false } satisfies CertificateVerifyResponse }),
    analytics: () => ({ status: 403, json: { error: "forbidden" } }),
    callsTo: (part) => w.calls.filter((c) => c.path.includes(part)),
  };
  return w;
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "GET, POST, PUT, OPTIONS",
};

async function answer(route: Route, worker: MockWorker, counts: Map<string, number>): Promise<void> {
  const req = route.request();
  const url = new URL(req.url());
  if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
  const auth = req.headers()["authorization"] ?? null;
  worker.calls.push({ method: req.method(), path: url.pathname + url.search, auth });
  const send = (r: Reply) =>
    "abort" in r
      ? route.abort("connectionfailed")
      : route.fulfill({
          status: r.status ?? 200,
          headers: { ...CORS, "content-type": r.text !== undefined ? "text/plain" : "application/json" },
          body: r.text !== undefined ? r.text : JSON.stringify(r.json ?? {}),
        });
  const count = (k: string) => counts.set(k, (counts.get(k) ?? 0) + 1).get(k) as number;

  const verify = url.pathname.match(/^\/api\/certificates\/verify\/([^/]+)$/);
  if (req.method() === "GET" && verify) return send(worker.verify(decodeURIComponent(verify[1]), count(`v:${verify[1]}`)));
  if (req.method() === "GET" && url.pathname === "/api/instructor/analytics") {
    return send(worker.analytics(Number(url.searchParams.get("days")), auth, count("analytics")));
  }
  // Layout probes: the capability probe expects 401 without a token; the study-state sync answers empty.
  if (url.pathname === "/api/state") return auth ? send({ json: { data: null } }) : send({ status: 401, json: { error: "unauthorized" } });
  return send({ status: 404, json: { error: "not_found" } });
}

// ── contexts and pages ───────────────────────────────────────────────────────
export interface ContextOptions {
  lang?: "en" | "ar";
  theme?: "light" | "dark";
  signedIn?: boolean;
  viewport?: { width: number; height: number };
  javaScript?: boolean;
  worker?: MockWorker;
}

export interface OpenedPage {
  page: Page;
  ctx: BrowserContext;
  worker: MockWorker;
  /** console errors and uncaught page errors (hydration mismatches log as console errors) */
  errors: string[];
  /** requests the hermetic router refused (anything that is not loopback or the Worker) */
  blocked: string[];
  close: () => Promise<void>;
}

export async function openPage(browser: Browser, origin: string, path: string, o: ContextOptions = {}): Promise<OpenedPage> {
  const ctx = await browser.newContext({
    viewport: o.viewport ?? { width: 1280, height: 900 },
    colorScheme: o.theme ?? "dark",
    javaScriptEnabled: o.javaScript ?? true,
    serviceWorkers: "block",
  });
  const worker = o.worker ?? defaultWorker();
  const blocked: string[] = [];
  const counts = new Map<string, number>();
  await ctx.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" || url.hostname === "localhost") return route.continue();
    if (url.origin === API_ORIGIN) return answer(route, worker, counts);
    blocked.push(url.href);
    return route.abort();
  });
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
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const text = m.text();
    // Aborted or non-2xx mocked requests log a generic resource failure; that is the scenario, not a bug.
    if (/Failed to load resource|net::ERR_/.test(text)) return;
    errors.push(`console.error: ${text}`);
  });
  await page.goto(origin + path);
  if (o.javaScript !== false && (o.lang ?? "en") === "ar") await page.waitForFunction(() => document.documentElement.dir === "rtl");
  return { page, ctx, worker, errors, blocked, close: () => ctx.close() };
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

/** `document.documentElement.scrollWidth <= innerWidth`: the page itself must never scroll sideways. */
export async function pageOverflow(page: Page): Promise<{ scrollWidth: number; innerWidth: number; ok: boolean }> {
  return page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth, ok: document.documentElement.scrollWidth <= window.innerWidth }));
}

// ── accessibility ────────────────────────────────────────────────────────────
interface AxeViolation {
  id: string;
  impact?: string | null;
  help: string;
  nodes: { target: unknown[]; html: string }[];
}

/** Runs axe-core (injected over CDP, so the page CSP does not matter); returns serious + critical violations. */
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

// ── fixtures ─────────────────────────────────────────────────────────────────
export const CERT_CODE = "IMB-ABCD-EFGH-2345";

export const VALID_CERT: CertificateVerifyResponse = {
  valid: true,
  code: CERT_CODE,
  track: "frontend",
  recipient: "Layla Hassan",
  issuedAt: "2026-06-15T23:30:00.000Z",
};

/** A realistic 30-day payload. Hand-checked numbers: 902 / 1284 runs = 70.2 %, python 612 / 1284 = 47.7 %. */
export const ANALYTICS_30: InstructorAnalytics = {
  generatedAt: "2026-06-15T10:00:00.000Z",
  days: 30,
  runs: {
    total: 1284,
    success: 902,
    byLang: { python: 612, javascript: 340, java: 118, cpp: 96, go: 58, rust: 38, typescript: 22 },
    byStatus: { ok: 902, compile_error: 143, runtime_error: 121, timeout: 64, memory_limit: 21, output_limit: 9, internal_error: 24 },
  },
  tracks: [
    { track: "frontend", learners: 148, completed: 37, completionRate: 0.25, medianMinutesToComplete: 410.5 },
    { track: "cyber-security", learners: 96, completed: 12, completionRate: 0.125, medianMinutesToComplete: 1520 },
    { track: "data-science", learners: 54, completed: 0, completionRate: 0 },
    { track: "legacy-track", learners: 3, completed: 1, completionRate: 0.333, medianMinutesToComplete: 45 },
  ],
  exercises: [
    {
      exercise: "frontend/html-basics/hello-page",
      attempts: 320,
      learners: 110,
      passRate: 0.82,
      medianRunMs: 140,
      failures: { wrong_output: 41, compile_error: 9 },
      commonErrors: [{ text: "SyntaxError: Unexpected token '<'", count: 12 }],
    },
    {
      exercise: "cyber-security/networking/subnet-calc",
      attempts: 210,
      learners: 64,
      passRate: 0.31,
      medianRunMs: 1350,
      failures: { wrong_output: 120, timeout: 8, runtime_error: 5, compile_error: 2 },
      commonErrors: [
        { text: "IndexError: list index out of range", count: 31 },
        { text: "<img src=x onerror=alert(1)>", count: 4 },
        { text: "main.py:14: TypeError: unsupported operand type(s) for <<: 'str' and 'int'", count: 3 },
      ],
    },
    {
      exercise: "challenge:caesar-warmup",
      attempts: 96,
      learners: 52,
      passRate: 0.58,
      medianRunMs: 88,
      failures: { wrong_output: 30 },
      commonErrors: [],
    },
    { exercise: "data-science/python-basics/mean", attempts: 12, learners: 4, passRate: 0, medianRunMs: 61, failures: {}, commonErrors: [] },
  ],
  challenges: [
    { id: "scheduler-sim", solves: 2, attempts: 88, medianMinutesToSolve: 95 },
    { id: "idle-one", solves: 0, attempts: 0 },
    { id: "caesar-warmup", solves: 41, attempts: 96, medianMinutesToSolve: 7.5 },
    { id: "idle-two", solves: 0, attempts: 0 },
  ],
};

/** Same shape for the 7-day view, visibly different numbers. */
export const ANALYTICS_7: InstructorAnalytics = {
  ...ANALYTICS_30,
  days: 7,
  runs: { total: 311, success: 233, byLang: { python: 200, javascript: 111 }, byStatus: { ok: 233, compile_error: 78 } },
};

export const ANALYTICS_EMPTY: InstructorAnalytics = {
  generatedAt: "2026-06-15T10:00:00.000Z",
  days: 30,
  runs: { total: 0, success: 0, byLang: {}, byStatus: {} },
  tracks: [],
  exercises: [],
  challenges: [{ id: "idle-one", solves: 0, attempts: 0 }],
};
