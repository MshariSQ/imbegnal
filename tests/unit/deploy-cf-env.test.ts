// The deploy job's Cloudflare credentials (worker/scripts/cf-env.sh + the "Check Cloudflare credentials"
// step of .github/workflows/deploy.yml): a secret pasted with a trailing newline must still deploy
// (wrangler 4 refuses an account ID with whitespace), a malformed ID must fail with a clear message, and
// no value is ever printed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
const WORKER = join(ROOT, "worker");
const WORKFLOW = readFileSync(join(ROOT, ".github/workflows/deploy.yml"), "utf8");
const ACCOUNT = "0123456789abcdef0123456789abcdef";
const TOKEN = "tok_ABCdef-123_xyz";

/** The steps of the file as blocks of lines (a step starts at `      - ` under `steps:`). */
function steps(): string[][] {
  const blocks: string[][] = [];
  for (const line of WORKFLOW.split("\n")) {
    if (/^ {6}- /.test(line)) blocks.push([line]);
    else if (blocks.length && (/^ {7,}\S/.test(line) || line.trim() === "")) blocks[blocks.length - 1].push(line);
    else if (/^\s{0,5}\S/.test(line)) blocks.push([]); // a new job or top-level key ends the current step
  }
  return blocks.filter((b) => b.length);
}

/** The `run: |` script of the step named `name`, dedented. */
function runScript(name: string): string {
  const block = steps().find((b) => b[0].includes(`name: ${name}`));
  assert.ok(block, `step "${name}" exists`);
  const at = block.findIndex((l) => /^ {8}run: \|/.test(l));
  assert.ok(at >= 0, `step "${name}" has a run: | script`);
  return block
    .slice(at + 1)
    .filter((l) => l.startsWith("          ") || l.trim() === "")
    .map((l) => l.slice(10))
    .join("\n");
}

function sh(script: string, env: Record<string, string | undefined>) {
  const dir = mkdtempSync(join(tmpdir(), "imb-cf-env-"));
  const out = join(dir, "output");
  const summary = join(dir, "summary");
  try {
    const r = spawnSync("bash", ["-e", "-c", script], {
      cwd: WORKER,
      encoding: "utf8",
      // only what the step gets in CI, so the runner's own variables cannot hide a bug
      env: { NODE_ENV: "test", PATH: process.env.PATH, GITHUB_OUTPUT: out, GITHUB_STEP_SUMMARY: summary, ...env },
    });
    let output = "";
    try {
      output = readFileSync(out, "utf8");
    } catch {
      // nothing written
    }
    return { status: r.status, stdout: r.stdout, stderr: r.stderr, output };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("cf-env.sh removes every whitespace character, keeps clean values, tolerates unset ones", () => {
  const read = `. scripts/cf-env.sh; printf '%s|%s' "$CLOUDFLARE_ACCOUNT_ID" "$CLOUDFLARE_API_TOKEN"`;
  assert.equal(sh(read, { CLOUDFLARE_ACCOUNT_ID: `${ACCOUNT}\n`, CLOUDFLARE_API_TOKEN: ` ${TOKEN}\r\n` }).stdout, `${ACCOUNT}|${TOKEN}`);
  assert.equal(sh(read, { CLOUDFLARE_ACCOUNT_ID: ACCOUNT, CLOUDFLARE_API_TOKEN: TOKEN }).stdout, `${ACCOUNT}|${TOKEN}`);
  assert.equal(sh(`set -u; ${read}`, {}).stdout, "|", "unset under set -u");
  // exported, so the wrangler child process sees the cleaned values
  const child = sh(`. scripts/cf-env.sh; bash -c 'printf %s "$CLOUDFLARE_ACCOUNT_ID"'`, { CLOUDFLARE_ACCOUNT_ID: `${ACCOUNT}\n` });
  assert.equal(child.stdout, ACCOUNT);
});

test("every deploy step that receives the Cloudflare secrets sources cf-env.sh before using them", () => {
  const withSecrets = steps().filter((b) => b.some((l) => l.includes("secrets.CLOUDFLARE_")));
  assert.ok(withSecrets.length >= 4, "credentials check, reconcile, migrations, deploy");
  for (const block of withSecrets) {
    const name = block[0].trim();
    const script = block.slice(block.findIndex((l) => /^ {8}run:/.test(l)));
    const source = script.findIndex((l) => l.trim() === ". scripts/cf-env.sh");
    assert.ok(source > 0, `${name}: sources scripts/cf-env.sh`);
    const firstUse = script.findIndex((l, i) => i > 0 && /wrangler|d1-reconcile|\$CLOUDFLARE_|\$\{CLOUDFLARE_/.test(l) && !l.includes("raw_"));
    assert.ok(firstUse === -1 || firstUse > source, `${name}: cleans the values before using them`);
  }
});

test("credentials check: a trailing newline deploys with a notice, never echoing the value", () => {
  const r = sh(runScript("Check Cloudflare credentials"), { CLOUDFLARE_ACCOUNT_ID: `${ACCOUNT}\n`, CLOUDFLARE_API_TOKEN: `${TOKEN}\n` });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.output, /^ready=true$/m);
  assert.match(r.stdout, /::notice title=CLOUDFLARE_ACCOUNT_ID has whitespace::/);
  assert.match(r.stdout, /::notice title=CLOUDFLARE_API_TOKEN has whitespace::/);
  assert.ok(!r.stdout.includes(ACCOUNT) && !r.stdout.includes(TOKEN), "values are not printed");
});

test("credentials check: clean secrets deploy silently; missing ones stay frontend-only; a malformed ID fails clearly", () => {
  const script = runScript("Check Cloudflare credentials");
  const clean = sh(script, { CLOUDFLARE_ACCOUNT_ID: ACCOUNT, CLOUDFLARE_API_TOKEN: TOKEN });
  assert.equal(clean.status, 0, clean.stderr);
  assert.match(clean.output, /^ready=true$/m);
  assert.doesNotMatch(clean.stdout, /::notice|::error|::warning/);

  const missing = sh(script, { CLOUDFLARE_ACCOUNT_ID: ACCOUNT, CLOUDFLARE_API_TOKEN: " \n" });
  assert.equal(missing.status, 0, missing.stderr);
  assert.match(missing.output, /^ready=false$/m);
  assert.match(missing.stdout, /::warning title=API not deployed::Missing repository secret\(s\): CLOUDFLARE_API_TOKEN\./);

  const bad = sh(script, { CLOUDFLARE_ACCOUNT_ID: "dash.cloudflare.com/abc", CLOUDFLARE_API_TOKEN: TOKEN });
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /::error title=Invalid CLOUDFLARE_ACCOUNT_ID::/);
  assert.ok(!bad.stdout.includes("dash.cloudflare.com/abc"), "the bad value is not printed");
  assert.doesNotMatch(bad.output, /ready=/);
});
