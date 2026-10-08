/**
 * Runs code with the HOST's toolchains: NOT SANDBOXED.
 *
 * Purpose: content authoring tests only ("does the reference solution of this
 * lab/challenge produce the expected output?"). Never import this from the
 * Worker, the runner or the site; production execution goes through the
 * runner's container sandbox. Everything executed here is code we wrote
 * and committed, in a temp dir, with a timeout.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { getLanguage, type LangId } from "../../shared/languages";

export interface LocalResult {
  unsupported?: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  /** Wall time of the program run alone (compilation excluded), like the runner's runMs. */
  runMs?: number;
}

/**
 * One Go build cache for every call (test code only): with a fresh cache per call each Go run
 * rebuilt the standard library first, 4-10 s on a busy machine.
 */
const GOCACHE = join(tmpdir(), "imb-local-gocache");

/**
 * Programs run with HOME set to their temp dir. rustup locates its toolchains and default
 * through RUSTUP_HOME / CARGO_HOME, which default to ~/.rustup and ~/.cargo of the REAL home:
 * pin them, or every rustc call fails with "no default is configured" (seen on GitHub CI).
 */
const TOOLCHAIN_HOMES = {
  RUSTUP_HOME: process.env.RUSTUP_HOME || join(homedir(), ".rustup"),
  CARGO_HOME: process.env.CARGO_HOME || join(homedir(), ".cargo"),
};

/**
 * Compiled programs, built once per (language, source) and reused for every test case of that
 * source. Rebuilding for each case put the compiler inside every case's time limit: `rustc -O`
 * alone can take longer than an 8 s case limit on a loaded CI runner, so a correct reference
 * solution was reported as "timed out". Compilation gets its own, generous limit
 * (COMPILE_TIMEOUT_MS); the case limit applies to the run only, like the runner's runMs.
 */
const COMPILE_TIMEOUT_MS = 180_000;
const BUILD_ROOT = mkdtempSync(join(tmpdir(), "imb-local-builds-"));
process.on("exit", () => rmSync(BUILD_ROOT, { recursive: true, force: true }));
type Build = { ok: true; dir: string } | { ok: false; result: LocalResult };
const builds = new Map<string, Build>();

const working = new Map<string, boolean>();

/**
 * The toolchain is installed AND runs: `command -v` alone is not enough (GitHub's Ubuntu image
 * ships a rustup `rustc` proxy with no default toolchain, which exists but cannot compile).
 */
function has(cmd: string): boolean {
  const cached = working.get(cmd);
  if (cached !== undefined) return cached;
  const versionArgs = cmd === "go" ? ["version"] : ["--version"];
  // Probe with the same kind of environment runLocal uses (a throw-away HOME), so a toolchain
  // that only works with the real HOME is caught here instead of failing every test.
  const probeHome = mkdtempSync(join(tmpdir(), "imb-probe-"));
  let ok = false;
  try {
    ok =
      spawnSync("sh", ["-c", `command -v ${cmd}`], { encoding: "utf8" }).status === 0 &&
      spawnSync(cmd, versionArgs, { encoding: "utf8", timeout: 20_000, env: { ...process.env, ...TOOLCHAIN_HOMES, HOME: probeHome } }).status === 0;
  } finally {
    rmSync(probeHome, { recursive: true, force: true });
  }
  working.set(cmd, ok);
  return ok;
}

const RECIPES: Partial<Record<LangId, { needs: string; compile?: (f: string) => string[]; run: (f: string) => string[] }>> = {
  python: { needs: "python3", run: (f) => ["python3", f] },
  javascript: { needs: "node", run: (f) => ["node", f] },
  typescript: { needs: "node", run: (f) => ["node", "--experimental-strip-types", "--no-warnings", f] },
  java: { needs: "java", run: (f) => ["java", f] }, // single-file source-launch mode
  c: { needs: "gcc", compile: (f) => ["gcc", "-O2", "-std=c17", "-o", "prog", f, "-lm"], run: () => ["./prog"] },
  cpp: { needs: "g++", compile: (f) => ["g++", "-O2", "-std=c++20", "-o", "prog", f], run: () => ["./prog"] },
  go: { needs: "go", compile: (f) => ["go", "build", "-o", "prog", f], run: () => ["./prog"] },
  rust: { needs: "rustc", compile: (f) => ["rustc", "-O", "-o", "prog", f], run: () => ["./prog"] },
  ruby: { needs: "ruby", run: (f) => ["ruby", f] },
  php: { needs: "php", run: (f) => ["php", f] },
  bash: { needs: "bash", run: (f) => ["bash", f] },
};

export function localSupports(lang: LangId): boolean {
  const r = RECIPES[lang];
  return !!r && has(r.needs);
}

const envFor = (dir: string) => ({ ...process.env, ...TOOLCHAIN_HOMES, HOME: dir, GOCACHE, GOFLAGS: "-mod=mod" });

/** Compiles `code` once per (language, source); later calls reuse the program (or the compile error). */
function build(lang: LangId, filename: string, code: string, compile: (f: string) => string[]): Build {
  const key = `${lang}:${createHash("sha256").update(code).digest("hex")}`;
  const cached = builds.get(key);
  if (cached) return cached;
  const dir = mkdtempSync(join(BUILD_ROOT, `${lang}-`));
  writeFileSync(join(dir, filename), code);
  const [cmd, ...args] = compile(filename);
  const c = spawnSync(cmd, args, { cwd: dir, encoding: "utf8", timeout: COMPILE_TIMEOUT_MS, env: envFor(dir) });
  const out: Build =
    c.status === 0
      ? { ok: true, dir }
      : { ok: false, result: { exitCode: c.status, stdout: "", stderr: c.stderr ?? "", timedOut: (c.error as NodeJS.ErrnoException | undefined)?.code === "ETIMEDOUT" } };
  builds.set(key, out);
  return out;
}

export function runLocal(lang: LangId, code: string, stdin = "", timeoutMs = 20_000): LocalResult {
  const r = RECIPES[lang];
  const spec = getLanguage(lang);
  if (!r || !spec || !has(r.needs)) return { unsupported: true, exitCode: null, stdout: "", stderr: "", timedOut: false };
  const dir = mkdtempSync(join(tmpdir(), "imb-local-"));
  try {
    let argv: string[];
    if (r.compile) {
      const b = build(lang, spec.filename, code, r.compile);
      if (!b.ok) return b.result;
      // The recipe runs "./prog" from the build directory; each case still gets its own fresh cwd.
      argv = r.run(spec.filename).map((a) => (a.startsWith("./") ? join(b.dir, a.slice(2)) : a));
    } else {
      writeFileSync(join(dir, spec.filename), code);
      argv = r.run(spec.filename);
    }
    const [cmd, ...args] = argv;
    const started = Date.now();
    const p = spawnSync(cmd, args, { cwd: dir, input: stdin, encoding: "utf8", timeout: timeoutMs, env: envFor(dir), maxBuffer: 8 * 1024 * 1024 });
    return {
      runMs: Date.now() - started,
      exitCode: p.status,
      stdout: p.stdout ?? "",
      stderr: p.stderr ?? "",
      timedOut: (p.error as NodeJS.ErrnoException | undefined)?.code === "ETIMEDOUT",
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
