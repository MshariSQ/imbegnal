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
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
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

const working = new Map<string, boolean>();

/**
 * The toolchain is installed AND runs: `command -v` alone is not enough (GitHub's Ubuntu image
 * ships a rustup `rustc` proxy with no default toolchain, which exists but cannot compile).
 */
function has(cmd: string): boolean {
  const cached = working.get(cmd);
  if (cached !== undefined) return cached;
  const versionArgs = cmd === "go" ? ["version"] : ["--version"];
  const ok =
    spawnSync("sh", ["-c", `command -v ${cmd}`], { encoding: "utf8" }).status === 0 &&
    spawnSync(cmd, versionArgs, { encoding: "utf8", timeout: 20_000 }).status === 0;
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

export function runLocal(lang: LangId, code: string, stdin = "", timeoutMs = 20_000): LocalResult {
  const r = RECIPES[lang];
  const spec = getLanguage(lang);
  if (!r || !spec || !has(r.needs)) return { unsupported: true, exitCode: null, stdout: "", stderr: "", timedOut: false };
  const dir = mkdtempSync(join(tmpdir(), "imb-local-"));
  try {
    writeFileSync(join(dir, spec.filename), code);
    const env = { ...process.env, HOME: dir, GOCACHE, GOFLAGS: "-mod=mod" };
    if (r.compile) {
      const [cmd, ...args] = r.compile(spec.filename);
      const c = spawnSync(cmd, args, { cwd: dir, encoding: "utf8", timeout: timeoutMs, env });
      if (c.status !== 0) return { exitCode: c.status, stdout: "", stderr: c.stderr ?? "", timedOut: c.error?.name === "Error" && (c.error as NodeJS.ErrnoException).code === "ETIMEDOUT" };
    }
    const [cmd, ...args] = r.run(spec.filename);
    const started = Date.now();
    const p = spawnSync(cmd, args, { cwd: dir, input: stdin, encoding: "utf8", timeout: timeoutMs, env, maxBuffer: 8 * 1024 * 1024 });
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
