/**
 * Shared plumbing for the curriculum browser specs: a tiny static server for
 * the exported site (`out/`), a Chromium launcher that finds whatever browser
 * is installed, and a page factory that pins language/theme before first paint.
 *
 * The specs use the `playwright` library with node:test (the repo has no
 * @playwright/test), see tests/e2e/curriculum/README.md.
 */
import { createServer, type Server } from "node:http";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";

export const ROOT = resolve(import.meta.dirname ?? __dirname, "../../..");
const OUT = join(ROOT, "out");

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

/** Serves out/ the way a static host does (directory → index.html, trailing-slash routes, 404.html). */
export async function serveOut(): Promise<{ url: string; close: () => Promise<void> }> {
  if (!existsSync(join(OUT, "index.html"))) throw new Error("out/ is missing: run `npm run build` first");
  const server: Server = createServer((req, res) => {
    const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
    let file = normalize(join(OUT, path));
    if (file !== OUT && !file.startsWith(OUT + sep)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) {
      res.writeHead(404, { "content-type": MIME[".html"] }).end(existsSync(join(OUT, "404.html")) ? readFileSync(join(OUT, "404.html")) : "not found");
      return;
    }
    res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
  });
  await new Promise<void>((ok) => server.listen(0, "127.0.0.1", ok)); // port 0: a free port, never collides with other engineers' servers
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  return { url: `http://127.0.0.1:${port}`, close: () => new Promise((ok) => server.close(() => ok())) };
}

function findChromium(): string | undefined {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  if (existsSync(chromium.executablePath())) return undefined; // the version playwright expects is installed
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!existsSync(base)) return undefined;
  for (const dir of readdirSync(base).filter((d) => /^chromium(_headless_shell)?-\d+$/.test(d)).sort().reverse()) {
    for (const rel of ["chrome-linux/chrome", "chrome-linux64/chrome", "chrome-linux/headless_shell", "chrome-headless-shell-linux64/chrome-headless-shell"]) {
      if (existsSync(join(base, dir, rel))) return join(base, dir, rel);
    }
  }
  return undefined;
}

export const launch = (): Promise<Browser> => chromium.launch({ executablePath: findChromium() });

export interface PageOptions {
  lang?: "en" | "ar";
  theme?: "light" | "dark";
  width?: number;
  height?: number;
  /** localStorage entries written before the app boots. */
  storage?: Record<string, string>;
}

export interface Watched {
  page: Page;
  context: BrowserContext;
  /** console.error / pageerror / same-origin failed requests collected while the page ran. */
  problems: string[];
}

/** New page with language, theme and storage pinned before first paint; collects console problems. */
export async function newPage(browser: Browser, base: string, opts: PageOptions = {}): Promise<Watched> {
  const context = await browser.newContext({
    viewport: { width: opts.width ?? 1280, height: opts.height ?? 900 },
    colorScheme: opts.theme ?? "dark",
    acceptDownloads: true,
  });
  await context.addInitScript(
    ({ lang, theme, storage }) => {
      try {
        localStorage.setItem("sf-lang", lang);
        localStorage.setItem("imb-theme", theme);
        for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, v);
      } catch {
        /* storage blocked */
      }
    },
    { lang: opts.lang ?? "en", theme: opts.theme ?? "dark", storage: opts.storage ?? {} }
  );
  // The Worker API is not part of these specs (and this sandbox has no outbound network): answer
  // fire-and-forget calls such as analytics events. Specs add page.route() for the calls they test.
  await context.route(/\/api\//, (route) => route.fulfill({ status: 204, body: "" }));
  const page = await context.newPage();
  const problems: string[] = [];
  // Routes owned by other workstreams (Code Lab, Challenges) may be absent from this build: their
  // prefetches 404. That is not a curriculum problem, but a 404 anywhere else is.
  const foreignRoute = (url: string) => {
    const path = new URL(url).pathname;
    return /^\/(code-lab|challenges)(\/|$)/.test(path) && !existsSync(join(OUT, path, "index.html"));
  };
  let ignored404 = 0;
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    if (/Failed to load resource.*404/.test(m.text()) && ignored404 > 0) {
      ignored404--;
      return;
    }
    problems.push(`console.error: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) => {
    const reason = r.failure()?.errorText ?? "";
    if (r.url().startsWith(base) && !reason.includes("ERR_ABORTED")) problems.push(`requestfailed: ${r.url()} ${reason}`); // aborted = a navigation cancelled a prefetch
  });
  page.on("response", (r) => {
    if (!r.url().startsWith(base) || r.status() < 400) return;
    if (r.status() === 404 && foreignRoute(r.url())) {
      ignored404++;
      return;
    }
    problems.push(`HTTP ${r.status()}: ${r.url()}`);
  });
  return { page, context, problems };
}

/** Fails the test with every collected problem, ignoring nothing silently. */
export function assertNoProblems(problems: string[]) {
  if (problems.length) throw new Error(`browser reported ${problems.length} problem(s):\n${problems.join("\n")}`);
}

/** axe-core violations of serious/critical impact on the current page. */
export async function axeSeriousViolations(page: Page): Promise<string[]> {
  await page.addScriptTag({ path: join(ROOT, "node_modules/axe-core/axe.min.js") });
  const violations = await page.evaluate(async () => {
    interface AxeViolation {
      id: string;
      impact?: string | null;
      nodes: { target: unknown[] }[];
    }
    const axe = (window as unknown as { axe: { run: (ctx: object, opts: object) => Promise<{ violations: AxeViolation[] }> } }).axe;
    const result = await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } });
    return result.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => `${v.impact} ${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
  });
  return violations;
}
