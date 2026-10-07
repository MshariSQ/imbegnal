// Hints cost points, so their TEXT must never reach the browser except through the Worker
// (POST /api/challenges/:id/hint, or `mine.revealedHints` for hints already revealed). These checks
// look for every Worker-only hint text in: the public challenge data, every source file the site is
// built from, and the static export in out/ (opt-in, see below). In CI the "checks" job runs this file
// again right after `npm run build` with HINT_LEAK_REQUIRE_OUT=1, so the export is always scanned.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { challenges } from "../../data/challenges";
import { challengeHints } from "../../worker/src/graders/data/hints";

const ROOT = resolve(__dirname, "../..");
const OUT = join(ROOT, "out");

/**
 * A distinctive piece of a text that survives bundling: the longest run of letters, digits and
 * spaces (quotes, backticks and markdown may be escaped differently in HTML, RSC payloads and JS).
 */
export function probeOf(text: string): string | null {
  const runs = text.split(/[^A-Za-z0-9 ؀-ۿ]+/).map((s) => s.trim());
  const best = runs.reduce((a, b) => (b.length > a.length ? b : a), "");
  return best.length >= 12 ? best : null;
}

/** The forms a probe may take in a build: raw UTF-8 and \uXXXX-escaped (lower and upper hex). */
const forms = (probe: string): string[] => {
  const esc = (upper: boolean) =>
    [...probe].map((ch) => (ch.charCodeAt(0) > 0x7e ? "\\u" + (upper ? ch.charCodeAt(0).toString(16).toUpperCase() : ch.charCodeAt(0).toString(16)).padStart(4, "0") : ch)).join("");
  return [...new Set([probe, esc(false), esc(true)])];
};

const probes: { id: string; probe: string }[] = Object.entries(challengeHints).flatMap(([id, texts]) =>
  texts.flatMap((t) => [t.en, t.ar].map((s) => probeOf(s)).filter((p): p is string => p !== null).map((probe) => ({ id, probe })))
);

function leaksIn(haystack: string): string[] {
  const found: string[] = [];
  for (const { id, probe } of probes) if (forms(probe).some((f) => haystack.includes(f))) found.push(`${id}: "${probe}"`);
  return found;
}

function* walk(dir: string, exts: ReadonlySet<string> | null): Generator<string> {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p, exts);
    else if (st.size < 8_000_000 && (!exts || exts.has(extname(name)))) yield p;
  }
}

test("probeOf picks a long plain run and refuses texts too short to be distinctive", () => {
  assert.equal(probeOf("Compare the triples as tuples (lexicographically), never by their sum"), "Compare the triples as tuples");
  assert.equal(probeOf("قارن الثلاثيات كمجموعات مرتبة (قاموسياً) وليس بمجموعها"), "قارن الثلاثيات كمجموعات مرتبة");
  assert.equal(probeOf("`a` (b)"), null);
  assert.deepEqual(forms("ab"), ["ab"]);
  assert.deepEqual(forms("aب"), ["aب", "a\\u0628"]);
});

test("every Worker-only hint text yields probes (the scans below are not vacuous)", () => {
  const hintCount = Object.values(challengeHints).reduce((n, t) => n + t.length, 0);
  assert.ok(hintCount >= 50, `expected the real hint data, got ${hintCount} texts`);
  // At least one probe per language for almost every hint (very short hints are the only exception).
  assert.ok(probes.length >= hintCount * 2 * 0.9, `${probes.length} probes for ${hintCount} hints`);
});

test("the public challenge data carries hint costs only, never a hint text", () => {
  for (const c of challenges) for (const h of c.hints ?? []) assert.deepEqual(Object.keys(h), ["cost"], `${c.id}: public hint keys`);
  assert.deepEqual(leaksIn(JSON.stringify(challenges)), []);
});

test("no file the site is built from contains a hint text or imports the Worker-only hint data", () => {
  const exts = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".mdx", ".css", ".txt", ".html"]);
  const leaks: string[] = [];
  for (const dir of ["app", "components", "lib", "data", "shared", "public"]) {
    const abs = join(ROOT, dir);
    if (!existsSync(abs)) continue;
    for (const file of walk(abs, exts)) {
      const src = readFileSync(file, "utf8");
      const rel = relative(ROOT, file);
      if (/(?:from|import\s*\(|require\s*\()\s*["'][^"']*graders\/data\/hints/.test(src)) leaks.push(`${rel}: imports the Worker-only hint data`);
      for (const l of leaksIn(src)) leaks.push(`${rel}: ${l}`);
    }
  }
  assert.deepEqual(leaks, []);
});

// Opt-in: an out/ left over from an older build would report texts that are no longer shipped, so the
// export is scanned only when asked to, right after a fresh `npm run build` (CI does exactly that).
const scanOut = process.env.HINT_LEAK_REQUIRE_OUT === "1";
test(
  "the static export (out/) contains no hint text: HTML, RSC payloads and JS chunks",
  { skip: scanOut ? false : "set HINT_LEAK_REQUIRE_OUT=1 right after `npm run build` to scan out/ (CI does)" },
  () => {
    assert.ok(existsSync(join(OUT, "challenges", "index.html")), "out/ must hold a full build of the site (npm run build)");
    let scanned = 0;
    let all = "";
    const leaks: string[] = [];
    for (const file of walk(OUT, null)) {
      const body = readFileSync(file, "utf8");
      scanned++;
      for (const l of leaksIn(body)) leaks.push(`${relative(ROOT, file)}: ${l}`);
      if (file.endsWith(".html")) all += body;
    }
    assert.ok(scanned > 50, `scanned ${scanned} files`);
    // Sanity: the same scan does find public challenge text, so encodings are handled.
    const c = challenges.find((x) => probeOf(x.summary.en) && probeOf(x.summary.ar));
    assert.ok(c, "a challenge with probe-able summaries");
    for (const s of [c.summary.en, c.summary.ar]) {
      const p = probeOf(s) as string;
      assert.ok(forms(p).some((f) => all.includes(f)), `sanity: public summary of ${c.id} found in out/ (${p})`);
    }
    assert.deepEqual(leaks, []);
  }
);
