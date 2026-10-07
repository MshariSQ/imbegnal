#!/usr/bin/env node
/**
 * Full-stack E2E: real runner (Docker) + real Worker (wrangler dev, local D1 with
 * the real migrations) + the exported site, then the specs in tests/e2e/full/.
 *
 *   npm run test:e2e
 *
 * Requirements: a reachable Docker daemon with a runner image (imbegnal-runner:full,
 * :full-partial or :slim; build with `runner/image/build.sh`), worker/node_modules
 * (`cd worker && npm ci`), Chromium for Playwright.
 *
 * Env: E2E_SKIP_BUILD=1 reuses out/ (must have been built with NEXT_PUBLIC_API_URL=http://127.0.0.1:8787),
 *      E2E_RUNNER_IMAGE=<tag>, E2E_KEEP=1 leaves the stack running for manual poking,
 *      E2E_SPECS="a b" limits the spec files (names under tests/e2e/full/).
 */
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "out");
const PORTS = { site: 4173, api: 8787, runner: 4242 };
const SITE = `http://127.0.0.1:${PORTS.site}`;
const API = `http://127.0.0.1:${PORTS.api}`;
const RUNNER = `http://127.0.0.1:${PORTS.runner}`;
const RUNNER_SECRET = randomBytes(32).toString("hex");
const JWT_SECRET = randomBytes(32).toString("hex");
// Local loopback must never go through the sandbox's HTTP proxy.
const NO_PROXY = "127.0.0.1,localhost,::1";

const children = [];
const log = (...a) => console.log("[e2e]", ...a);

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", cwd: ROOT, ...opts, env: { ...process.env, NO_PROXY, no_proxy: NO_PROXY, ...opts.env } });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} exited with ${r.status}`);
}

function start(name, cmd, args, opts = {}) {
  const child = spawn(cmd, args, {
    cwd: ROOT,
    detached: true, // own process group so cleanup kills grandchildren (wrangler -> workerd)
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
    env: { ...process.env, NO_PROXY, no_proxy: NO_PROXY, ...opts.env },
  });
  const tail = [];
  const keep = (d) => {
    tail.push(...String(d).split("\n"));
    if (tail.length > 80) tail.splice(0, tail.length - 80);
  };
  child.stdout.on("data", keep);
  child.stderr.on("data", keep);
  children.push({ name, child, tail });
  return child;
}

function signalGroup(child, sig) {
  try {
    process.kill(-child.pid, sig);
  } catch {
    // already gone
  }
}

/** SIGTERM every process group (newest first), then SIGKILL whatever is still alive after 20 s. */
async function stopAll() {
  const alive = () => children.filter((c) => c.child.exitCode === null && c.child.signalCode === null);
  for (const { child } of [...children].reverse()) signalGroup(child, "SIGTERM");
  const until = Date.now() + 20_000;
  while (alive().length && Date.now() < until) await new Promise((r) => setTimeout(r, 200));
  for (const { name, child } of alive()) {
    console.error(`[e2e] ${name} ignored SIGTERM; killing it`);
    signalGroup(child, "SIGKILL");
  }
}

async function waitFor(url, name, timeoutMs = 120_000) {
  const until = Date.now() + timeoutMs;
  let last = "";
  while (Date.now() < until) {
    try {
      const r = await fetch(url);
      if (r.status < 500) return;
      last = `HTTP ${r.status}`;
    } catch (e) {
      last = e.message;
    }
    const dead = children.find((c) => c.name === name && c.child.exitCode !== null);
    if (dead) throw new Error(`${name} exited (${dead.child.exitCode}):\n${dead.tail.join("\n")}`);
    await new Promise((r) => setTimeout(r, 500));
  }
  const c = children.find((x) => x.name === name);
  throw new Error(`${name} did not become ready at ${url} (${last})\n${c?.tail.join("\n") ?? ""}`);
}

function pickImage() {
  if (process.env.E2E_RUNNER_IMAGE) return process.env.E2E_RUNNER_IMAGE;
  for (const tag of ["imbegnal-runner:full", "imbegnal-runner:full-partial", "imbegnal-runner:slim"]) {
    if (spawnSync("docker", ["image", "inspect", tag], { stdio: "ignore" }).status === 0) return tag;
  }
  throw new Error("No runner image found. Build one: runner/image/build.sh slim");
}

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".xml": "application/xml",
};

function startSite() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, SITE).pathname);
    let file = normalize(join(OUT, path));
    if (!file.startsWith(OUT + sep) && file !== OUT) {
      res.writeHead(400).end();
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!existsSync(file)) {
      if (existsSync(`${file}.html`)) file = `${file}.html`;
      else {
        res.writeHead(404, { "Content-Type": MIME[".html"] }).end(existsSync(join(OUT, "404.html")) ? readFileSync(join(OUT, "404.html")) : "not found");
        return;
      }
    }
    res.writeHead(200, { "Content-Type": MIME[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
  });
  return new Promise((ok) => server.listen(PORTS.site, "127.0.0.1", () => ok(server)));
}

async function main() {
  const image = pickImage();
  log(`runner image: ${image}`);

  if (process.env.E2E_SKIP_BUILD !== "1") {
    log("building the site against the local Worker…");
    run("npm", ["run", "build"], { env: { NEXT_PUBLIC_API_URL: API } });
  }
  if (!existsSync(join(OUT, "code-lab", "index.html"))) throw new Error("out/ is missing: build the site first");

  log("starting the runner…");
  start("runner", process.execPath, ["--import", "tsx", "runner/src/main.ts"], {
    env: { RUNNER_SECRET, RUNNER_HOST: "127.0.0.1", RUNNER_PORT: String(PORTS.runner), RUNNER_IMAGE: image, RUNNER_MAX_CONCURRENCY: "4" },
  });
  await waitFor(`${RUNNER}/healthz`, "runner");

  const persist = mkdtempSync(join(tmpdir(), "imb-e2e-d1-"));
  log("applying D1 migrations (local)…");
  run("npx", ["wrangler", "d1", "migrations", "apply", "skillforge-db", "--local", "--persist-to", persist, "--config", "wrangler.toml"], {
    cwd: join(ROOT, "worker"),
    env: { CI: "1", WRANGLER_SEND_METRICS: "false" },
  });

  log("starting the Worker (wrangler dev)…");
  const vars = {
    RUNNER_URL: RUNNER,
    RUNNER_SECRET,
    JWT_SECRET,
    FRONTEND_URL: SITE,
    WORKER_URL: API,
    // Small, deterministic limits so the quota specs run fast.
    RUN_DAILY_LIMIT_FREE: "12",
    RUN_DAILY_LIMIT_PRO: "500",
    RUN_PER_MINUTE_FREE: "60",
    RUN_PER_MINUTE_PRO: "120",
    // Every spec signs up fresh accounts from one IP; production keeps 10 / 60 per minute.
    RATE_LIMIT_AUTH_PER_MIN: "1000",
    RATE_LIMIT_PER_MIN: "10000",
  };
  start(
    "worker",
    "npx",
    ["wrangler", "dev", "--config", "wrangler.toml", "--ip", "127.0.0.1", "--port", String(PORTS.api), "--persist-to", persist, "--log-level", "warn",
      ...Object.entries(vars).flatMap(([k, v]) => ["--var", `${k}:${v}`])],
    { cwd: join(ROOT, "worker"), env: { CI: "1", WRANGLER_SEND_METRICS: "false" } },
  );
  await waitFor(`${API}/api/health`, "worker");

  // Warm the runner's language smoke tests so the first spec does not pay for them.
  for (let i = 0; i < 60; i++) {
    const r = await fetch(`${API}/api/lab/languages`).then((x) => x.json()).catch(() => null);
    if (r?.runner === "up" && r.languages.some((l) => l.available)) {
      log(`languages available: ${r.languages.filter((l) => l.available).map((l) => l.id).join(", ")}`);
      break;
    }
    await new Promise((ok) => setTimeout(ok, 2000));
  }

  const site = await startSite();
  log(`stack ready: site ${SITE} · api ${API} · runner ${RUNNER}`);

  const specs = (process.env.E2E_SPECS?.split(/\s+/).filter(Boolean) ?? null)?.map((s) => `tests/e2e/full/${s}`) ?? ["tests/e2e/full/*.spec.ts"];
  // Async (not spawnSync) so Ctrl+C reaches the handler below and the stack is torn down.
  const testProc = spawn(process.execPath, ["--import", "tsx", "--test", "--test-concurrency=1", ...specs], {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, NO_PROXY, no_proxy: NO_PROXY, E2E_SITE: SITE, E2E_API: API, E2E_RUNNER: RUNNER, E2E_RUNNER_IMAGE: image },
  });
  current.test = testProc;
  const status = await new Promise((ok) => testProc.on("exit", (code) => ok(code)));
  current.test = null;

  if (process.env.E2E_KEEP === "1") {
    log("E2E_KEEP=1: stack left running; Ctrl+C to stop.");
    await new Promise(() => {});
  }
  site.close();
  await stopAll();
  rmSync(persist, { recursive: true, force: true });
  return status ?? 1;
}

const current = { test: null };

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    current.test?.kill("SIGTERM");
    await stopAll();
    process.exit(130);
  });
}

main()
  .then((code) => process.exit(code))
  .catch(async (e) => {
    console.error(e);
    for (const c of children) console.error(`--- ${c.name} (last lines) ---\n${c.tail.slice(-25).join("\n")}`);
    await stopAll();
    process.exit(1);
  });
