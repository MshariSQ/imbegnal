// Operator commands for the API Worker must name its config. Wrangler looks for wrangler.json, then
// wrangler.jsonc, then wrangler.toml, each one up the whole directory tree, so from worker/ a bare command
// finds the site's ../wrangler.jsonc first: `wrangler secret put X` then lands on the site Worker
// (`imbegnal`), and wrangler 4's `d1 create` offers to write the new binding into that JSON file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(__dirname, "../..");
const SKIP = new Set(["node_modules", "out"]);
// A secret by name, or a D1 subcommand on a named database (`skillforge-db`, `imbegnal-db`, ...).
const COMMAND = /\bwrangler (?:secret [a-z]+ [A-Z][A-Z0-9_]*|d1 (?:[a-z]+ )+[a-z][a-z0-9-]*-db)\b[^`\n]*/g;

function operatorTexts(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || SKIP.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...operatorTexts(path));
    else if (/\.(md|sh)$/.test(entry.name)) files.push(path);
  }
  return files;
}

test("the config files that make a bare wrangler command ambiguous are both there", () => {
  assert.ok(existsSync(join(ROOT, "wrangler.jsonc")), "site config");
  assert.ok(existsSync(join(ROOT, "worker/wrangler.toml")), "API Worker config");
});

test("every documented secret or D1 command for the API Worker passes --config wrangler.toml", () => {
  const files = operatorTexts(ROOT);
  const seen: string[] = [];
  const bare: string[] = [];
  for (const file of files) {
    readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      for (const [command] of line.matchAll(COMMAND)) {
        const where = `${relative(ROOT, file)}:${i + 1}: ${command.trim()}`;
        seen.push(where);
        if (!/--config wrangler\.toml\b/.test(command)) bare.push(where);
      }
    });
  }
  assert.ok(files.some((f) => relative(ROOT, f) === "runner/deploy/install.sh"), "scans the runner installer");
  assert.ok(seen.length >= 20, `finds the documented commands (${seen.length})`);
  assert.deepEqual(bare, []);
});
