/**
 * Shared harness for the Code Lab browser tests.
 *
 *  - serves the exported site (`out/`, from `npm run build`) on a free port with a
 *    tiny static server (no extra dependency, honours trailing-slash routes);
 *  - launches Chromium (PLAYWRIGHT_CHROMIUM_EXECUTABLE, or the bundled/installed one);
 *  - mocks the Worker with `page.route`, using the exact shapes of shared/api.ts;
 *  - optionally serves a local Pyodide (PYODIDE_DIR) in place of the jsDelivr CDN so
 *    the Python runner executes for real without internet access.
 */
import { createServer, type Server } from "node:http";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { chromium, type Browser, type BrowserContext, type Page, type Route } from "playwright";
import type {
  ApiErrorBody,
  GradeResult,
  LanguagesApiResponse,
  PublicRunResult,
  QuotaInfo,
  RunApiRequest,
  RunApiResponse,
  RunDetail,
  RunSummary,
  RunsApiResponse,
  Snippet,
  SnippetCreateRequest,
  SubmitRequest,
  SubmitResponse,
} from "../../../shared/api";
import { LANG_IDS } from "../../../shared/languages";

export const ROOT = resolve(__dirname, "../../..");
const OUT = join(ROOT, "out");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
  ".webmanifest": "application/manifest+json",
};

export interface Site {
  url: string;
  close(): Promise<void>;
}

/** Static file server for `out/`. `/a/b/` maps to `out/a/b/index.html`; unknown paths get 404. */
export async function startSite(): Promise<Site> {
  if (!existsSync(join(OUT, "code-lab", "index.html"))) {
    throw new Error("out/code-lab/index.html is missing: run `npm run build` before the Code Lab browser tests.");
  }
  const server: Server = createServer((req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
      let file = normalize(join(OUT, pathname));
      if (file !== OUT && !file.startsWith(OUT + sep)) throw new Error("outside");
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
      if (!existsSync(file) && !extname(file)) file = `${file}.html`;
      if (!existsSync(file)) {
        res.writeHead(404, { "content-type": "text/plain" }).end("not found");
        return;
      }
      res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
    } catch {
      res.writeHead(400).end("bad request");
    }
  });
  await new Promise<void>((ok) => server.listen(0, "127.0.0.1", ok));
  const addr = server.address();
  if (!addr || typeof addr === "string") throw new Error("no port");
  return { url: `http://127.0.0.1:${addr.port}`, close: () => new Promise((ok) => server.close(() => ok())) };
}

function chromiumPath(): string | undefined {
  const env = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  if (env) return env;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  try {
    for (const d of readdirSync(base).filter((n) => /^chromium-\d+$/.test(n)).sort().reverse()) {
      const p = join(base, d, "chrome-linux", "chrome");
      if (existsSync(p)) return p;
    }
  } catch {
    // fall through to Playwright's own default
  }
  return undefined;
}

/**
 * Full Chromium, never the "headless shell": like desktop Chrome it puts the sandboxed Web
 * preview frame in its own process (IsolateSandboxedIframes), which the never-yielding-script
 * watchdog relies on. The headless shell keeps it in-process, so an infinite loop in the preview
 * freezes the page (see docs/CODE_LAB.md, residual risks).
 */
export const launch = (): Promise<Browser> => {
  const executablePath = chromiumPath();
  return chromium.launch(executablePath ? { executablePath, args: ["--no-sandbox"] } : { channel: "chromium", args: ["--no-sandbox"] });
};

// ── Fake session ─────────────────────────────────────────────────────────────

const b64url = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");

/** An unsigned JWT-shaped token: the site only decodes the payload client-side. */
export const FAKE_TOKEN = `${b64url({ alg: "none" })}.${b64url({ sub: "u-test", username: "tester", name: "Test Learner", avatar: "", exp: 4_102_444_800 })}.sig`;

export interface PageOptions {
  lang?: "en" | "ar";
  theme?: "light" | "dark";
  signedIn?: boolean;
  viewport?: { width: number; height: number };
  fixtures?: unknown;
}

export interface Harness {
  page: Page;
  context: BrowserContext;
  errors: string[];
  api: MockApi;
}

/** A page with storage pre-seeded (language, theme, token), console capture and the mocked Worker. */
export async function newHarness(browser: Browser, site: Site, opts: PageOptions = {}, api: MockApi = new MockApi()): Promise<Harness> {
  const context = await browser.newContext({ viewport: opts.viewport ?? { width: 1360, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("console", (m) => {
    // HTTP error statuses are part of the scenarios under test (mocked 401/429/503).
    if ((m.type() === "error" || m.type() === "warning") && !m.text().startsWith("Failed to load resource")) errors.push(`${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  const seed = { lang: opts.lang ?? "en", theme: opts.theme ?? "dark", token: opts.signedIn ? FAKE_TOKEN : null, fixtures: opts.fixtures ?? null };
  await page.addInitScript((s) => {
    try {
      if (!sessionStorage.getItem("imb-test-seeded")) {
        sessionStorage.setItem("imb-test-seeded", "1");
        localStorage.setItem("sf-lang", s.lang);
        localStorage.setItem("imb-theme", s.theme);
        if (s.token) localStorage.setItem("sf_token", s.token);
      }
    } catch {
      // storage unavailable
    }
    if (s.fixtures) (window as unknown as { __IMB_LAB_FIXTURES__: unknown }).__IMB_LAB_FIXTURES__ = s.fixtures;
  }, seed);
  await api.install(page);
  await installPyodide(page);
  return { page, context, errors, api };
}

// ── Pyodide from a local npm install (the sandbox has no CDN access) ─────────

export const PYODIDE_DIR = process.env.PYODIDE_DIR ?? "";
export const hasPyodide = () => !!PYODIDE_DIR && existsSync(join(PYODIDE_DIR, "pyodide.asm.wasm"));

async function installPyodide(page: Page) {
  if (!hasPyodide()) return;
  await page.route("https://cdn.jsdelivr.net/pyodide/**", async (route) => {
    const name = new URL(route.request().url()).pathname.split("/").pop() ?? "";
    const file = join(PYODIDE_DIR, name);
    if (!existsSync(file)) return route.fulfill({ status: 404 });
    await route.fulfill({
      status: 200,
      body: readFileSync(file),
      headers: { "content-type": MIME[extname(file)] ?? "application/octet-stream", "access-control-allow-origin": "*" },
    });
  });
}

// ── Worker mock ──────────────────────────────────────────────────────────────

export const quotaInfo = (over: Partial<QuotaInfo> = {}): QuotaInfo => ({
  plan: "free",
  used: 13,
  limit: 50,
  remaining: 37,
  resetAt: "2030-01-02T00:00:00.000Z",
  perMinute: 10,
  ...over,
});

export const runResult = (over: Partial<PublicRunResult> = {}): PublicRunResult => ({
  status: "ok",
  exitCode: 0,
  signal: null,
  stdout: "Hello, World!\n",
  stderr: "",
  stdoutBytes: 14,
  stderrBytes: 0,
  truncated: { stdout: false, stderr: false },
  runMs: 42,
  compileMs: 0,
  ...over,
});

export interface MockReply {
  status?: number;
  body?: unknown;
  /** Wait this long before answering (ms). */
  delayMs?: number;
}

export type RunHandler = (req: RunApiRequest, n: number) => MockReply | RunApiResponse | Promise<MockReply | RunApiResponse>;

/** Records what the page sent and answers with the configured handlers. */
export class MockApi {
  runs: RunApiRequest[] = [];
  snippetsCreated: SnippetCreateRequest[] = [];
  submits: { id: string; body: SubmitRequest }[] = [];
  requests: string[] = [];
  authHeaders: (string | undefined)[] = [];

  languages: LanguagesApiResponse = { runner: "up", languages: LANG_IDS.map((id) => ({ id, available: true, version: "test" })) };
  languagesReply?: MockReply;
  quota: QuotaInfo = quotaInfo();
  run: RunHandler = (req) => ({
    body: {
      runId: `run-${this.runs.length}`,
      result: runResult({ stdout: req.stdin ? `${req.stdin}` : "Hello, World!\n" }),
      quota: quotaInfo({ used: 13 + this.runs.length, remaining: 37 - this.runs.length }),
    } satisfies RunApiResponse,
  });
  history: RunSummary[] = [];
  historyPageSize = 20;
  runDetails: Record<string, RunDetail> = {};
  snippets: Record<string, Snippet> = {};
  createSnippetReply?: MockReply;
  submit?: (id: string, body: SubmitRequest) => MockReply | SubmitResponse;

  async install(page: Page): Promise<void> {
    await page.route(/\/api\//, (route) => this.handle(route));
  }

  private reply(route: Route, r: MockReply) {
    return route.fulfill({
      status: r.status ?? 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" },
      body: JSON.stringify(r.body ?? {}),
    });
  }

  private async handle(route: Route): Promise<void> {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    if (req.method() === "OPTIONS") return this.reply(route, { status: 204 });
    if (path === "/api/event") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*" } });
    this.requests.push(`${req.method()} ${path}${url.search}`);
    this.authHeaders.push(req.headers().authorization);

    const json = <T,>() => (req.postData() ? (JSON.parse(req.postData() as string) as T) : ({} as T));
    const respond = async (r: MockReply) => {
      if (r.delayMs) await new Promise((ok) => setTimeout(ok, r.delayMs));
      return this.reply(route, r);
    };
    // Handlers return either a ready API payload or a MockReply (status/body/delay) to simulate failures.
    const isPayload = (v: object, key: string) => key in v;

    if (path === "/api/lab/languages") return respond(this.languagesReply ?? { body: this.languages });
    if (path === "/api/lab/quota") return respond({ body: this.quota });
    if (path === "/api/lab/run" && req.method() === "POST") {
      const body = json<RunApiRequest>();
      this.runs.push(body);
      const out = await this.run(body, this.runs.length - 1);
      return respond(isPayload(out, "runId") ? { body: out } : (out as MockReply));
    }
    if (path === "/api/lab/runs" && req.method() === "GET") {
      const before = url.searchParams.get("before");
      const start = before ? this.history.findIndex((r) => r.id === before) : 0;
      const slice = this.history.slice(Math.max(0, start), Math.max(0, start) + this.historyPageSize);
      const nextItem = this.history[Math.max(0, start) + this.historyPageSize];
      const res: RunsApiResponse = { runs: slice, next: nextItem ? nextItem.id : undefined };
      return respond({ body: res });
    }
    const runId = path.match(/^\/api\/lab\/runs\/([^/]+)$/)?.[1];
    if (runId) {
      const d = this.runDetails[decodeURIComponent(runId)];
      return respond(d ? { body: d } : { status: 404, body: { error: "not_found" } satisfies ApiErrorBody });
    }
    if (path === "/api/lab/snippets" && req.method() === "POST") {
      const body = json<SnippetCreateRequest>();
      this.snippetsCreated.push(body);
      return respond(this.createSnippetReply ?? { status: 201, body: { id: "abc12345", path: "/code-lab/s/?id=abc12345" } });
    }
    const snipId = path.match(/^\/api\/lab\/snippets\/([^/]+)$/)?.[1];
    if (snipId) {
      const s = this.snippets[decodeURIComponent(snipId)];
      return respond(s ? { body: s } : { status: 404, body: { error: "not_found" } satisfies ApiErrorBody });
    }
    const sub = path.match(/^\/api\/challenges\/([^/]+)\/submit$/)?.[1];
    if (sub) {
      const body = json<SubmitRequest>();
      this.submits.push({ id: sub, body });
      const out = this.submit?.(sub, body) ?? { status: 404, body: { error: "not_found" } };
      return respond(isPayload(out, "correct") ? { body: out } : (out as MockReply));
    }
    return respond({ status: 404, body: { error: "not_found" } });
  }
}

export const gradeOf = (tests: GradeResult["tests"]): GradeResult => ({
  passed: tests.every((t) => t.passed),
  score: tests.filter((t) => t.passed).length / tests.length,
  tests,
});

export function summary(i: number, over: Partial<RunSummary> = {}): RunSummary {
  return {
    id: `r${String(i).padStart(3, "0")}`,
    lang: "python",
    status: "ok",
    exitCode: 0,
    runMs: 30 + i,
    stdoutBytes: 14,
    success: true,
    ref: { kind: "free" },
    createdAt: new Date(Date.UTC(2030, 0, 1, 12, 0) - i * 60_000).toISOString(),
    ...over,
  };
}

// ── Page helpers ─────────────────────────────────────────────────────────────

export const labUrl = (site: Site, query = "") => `${site.url}/code-lab/${query ? `?${query}` : ""}`;

/** Waits until the lab shell is interactive (skeleton replaced by the workspace and editor). */
export async function openLab(h: Harness, site: Site, query = ""): Promise<void> {
  await h.page.goto(labUrl(site, query), { waitUntil: "domcontentloaded" });
  await h.page.waitForSelector('[data-testid="lab"]');
  await h.page.waitForSelector(".cm-content");
}

export async function setEditor(page: Page, code: string): Promise<void> {
  const el = page.locator(".cm-content").first();
  await el.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.press("Delete");
  await page.keyboard.insertText(code);
}

export const editorText = (page: Page) => page.locator(".cm-content").first().innerText();

/** The visible Run button for the current viewport (desktop toolbar or mobile bar). */
export const runButton = (page: Page) => page.locator('[data-testid="run-button"]:visible').first();

// ── Suite plumbing ───────────────────────────────────────────────────────────

export interface Suite {
  site: Site;
  browser: Browser;
  close(): Promise<void>;
}

/** One static server + one browser per spec file; every test gets a fresh, isolated context. */
export async function bootSuite(): Promise<Suite> {
  const site = await startSite();
  const browser = await launch();
  return {
    site,
    browser,
    close: async () => {
      await browser.close();
      await site.close();
    },
  };
}

/** Runs `fn` with a harness and always closes its context. */
export async function withPage(s: Suite, opts: PageOptions, fn: (h: Harness) => Promise<void>, api?: MockApi): Promise<void> {
  const h = await newHarness(s.browser, s.site, opts, api);
  try {
    await fn(h);
  } finally {
    await h.context.close();
  }
}

export const resultPanel = (page: Page) => page.locator('[data-testid="run-result"]');
