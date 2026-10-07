// Safety of author-written regex-mode expected patterns (shared/match.ts mode "regex").
//
// A regex-mode test runs an author's pattern against up to 64 KiB of learner-controlled output
// inside the Worker, so a pattern prone to catastrophic backtracking would let one submission
// burn the Worker's CPU. Every regex-mode pattern from the lesson labs (data/lessons/**) and the
// challenge graders (worker/src/graders/data/**) must compile, must not nest unbounded
// quantifiers (the classic (a+)+ / (\w*)* shape), and must finish quickly on adversarial input.
//
// At the time of writing NO content uses mode "regex" (every lab and grader compares with
// trim / lines / contains / exact / float), so the per-pattern checks pass trivially. The
// collectors and the structural checker are still exercised below, so the first regex-mode
// test anyone adds is checked automatically.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { matchOutput } from "../../shared/match";

const ROOT = join(import.meta.dirname ?? __dirname, "..", "..");
const SOURCES = [join(ROOT, "data", "lessons"), join(ROOT, "worker", "src", "graders", "data")];
const MAX_MS = 50;
const KIB64 = 64 * 1024;

/** Adversarial learner outputs of 64 KiB (+1 char where a trailing mismatch forces backtracking). */
const ADVERSARIAL: Record<string, string> = {
  "a*64K + !": `${"a".repeat(KIB64)}!`,
  "spaces": " ".repeat(KIB64),
  "digits and spaces": "1 23 456 7890 ".repeat(Math.ceil(KIB64 / 14)).slice(0, KIB64),
  "newlines": "x\n".repeat(KIB64 / 2),
  "word chars + -": `${"ab1_".repeat(KIB64 / 4)}-`,
};

interface Expectation {
  source: string;
  expected: string;
  mode?: string;
}

/** Every *.ts module under `dir` (recursive). */
function modulesUnder(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".ts") && !e.name.endsWith(".d.ts"))
    .map((e) => join(e.parentPath, e.name))
    .sort();
}

/** Walks a module's exports and collects every `{ expected: string, mode? }` test object. */
function collect(value: unknown, source: string, out: Expectation[], seen: Set<object>): void {
  if (value === null || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const v of value) collect(v, source, out, seen);
    return;
  }
  const rec = value as Record<string, unknown>;
  if (typeof rec.expected === "string" && (rec.mode === undefined || typeof rec.mode === "string")) {
    out.push({ source, expected: rec.expected, mode: rec.mode as string | undefined });
  }
  for (const v of Object.values(rec)) collect(v, source, out, seen);
}

async function collectAll(): Promise<{ all: Expectation[]; perSource: Map<string, number> }> {
  const all: Expectation[] = [];
  const perSource = new Map<string, number>();
  const seen = new Set<object>();
  for (const dir of SOURCES) {
    const before = all.length;
    for (const file of modulesUnder(dir)) {
      const mod = (await import(pathToFileURL(file).href)) as Record<string, unknown>;
      collect(mod, relative(ROOT, file), all, seen);
    }
    perSource.set(relative(ROOT, dir), all.length - before);
  }
  return { all, perSource };
}

/**
 * True when a group that itself contains an unbounded quantifier (+, *, {n,}) is repeated by an
 * unbounded quantifier: (a+)+, (\w*)*, (?:x|y+){2,}, ((a+)b)*. A structural check, not a full
 * ReDoS analysis; it catches the shape behind nearly every catastrophic-backtracking pattern.
 */
function hasNestedUnboundedQuantifier(src: string): boolean {
  const stack: boolean[] = [false]; // per open group: does its body contain an unbounded quantifier?
  let i = 0;
  /** Length of the quantifier at `j` and whether it is unbounded; 0 when there is none. */
  const quantifier = (j: number): { len: number; unbounded: boolean } => {
    const c = src[j];
    if (c === "*" || c === "+") return { len: 1, unbounded: true };
    if (c === "?") return { len: 1, unbounded: false };
    if (c === "{") {
      const m = /^\{(\d+)(,(\d*))?\}/.exec(src.slice(j));
      if (m) return { len: m[0].length, unbounded: m[2] !== undefined && m[3] === "" };
    }
    return { len: 0, unbounded: false };
  };
  const markUnbounded = () => {
    stack[stack.length - 1] = true;
  };
  while (i < src.length) {
    const c = src[i];
    if (c === "\\") {
      i += 2;
    } else if (c === "[") {
      // character class: skip to the closing bracket, honouring escapes
      i++;
      if (src[i] === "^") i++;
      if (src[i] === "]") i++;
      while (i < src.length && src[i] !== "]") i += src[i] === "\\" ? 2 : 1;
      i++;
    } else if (c === "(") {
      stack.push(false);
      i++;
      continue;
    } else if (c === ")") {
      const inner = stack.length > 1 ? (stack.pop() as boolean) : false;
      i++;
      const q = quantifier(i);
      if (q.len > 0) {
        if (q.unbounded && inner) return true;
        if (q.unbounded) markUnbounded();
        i += q.len;
        if (src[i] === "?") i++; // lazy
      }
      if (inner) markUnbounded();
      continue;
    } else {
      i++;
    }
    // a quantifier applied to the atom just consumed
    const q = quantifier(i);
    if (q.len > 0) {
      if (q.unbounded) markUnbounded();
      i += q.len;
      if (src[i] === "?") i++;
    }
  }
  return false;
}

test("regex-mode expected patterns are safe to run against learner output", async (t) => {
  const { all, perSource } = await collectAll();
  const regex = all.filter((e) => e.mode === "regex");

  await t.test("the collectors find the lesson-lab and grader tests (so an empty result is real)", () => {
    for (const [dir, n] of perSource) assert.ok(n > 0, `no test objects collected under ${dir}`);
  });

  await t.test("the structural checker flags nested unbounded quantifiers and nothing else", () => {
    for (const bad of ["(a+)+", "(\\w*)*", "(?:a|b+)*", "(a{1,})+", "((a+)b)*", "(x+x+)+y", "(\\d+\\s?)+$", "^(a+?)+$", "(.*a){2,}"]) {
      assert.equal(hasNestedUnboundedQuantifier(bad), true, bad);
    }
    for (const ok of ["(ab)+", "a+b+", "[+*]+", "\\(a+\\)+", "(a+)?", "(a+){2}", "(a+){1,3}", "^\\d+\\.\\d+$", "(\\w+)\\s(\\w+)", "[(a+)]+", "(a|b)*c+"]) {
      assert.equal(hasNestedUnboundedQuantifier(ok), false, ok);
    }
  });

  await t.test("the timing harness itself is fast on a well-formed pattern", () => {
    for (const [name, input] of Object.entries(ADVERSARIAL)) {
      const t0 = performance.now();
      matchOutput(input, "^\\d+(\\.\\d+)?\\s*$", "regex");
      const ms = performance.now() - t0;
      assert.ok(ms < MAX_MS, `${name}: ${ms.toFixed(1)} ms`);
    }
  });

  // Currently zero regex-mode patterns exist; this loop is then empty by design.
  for (const { source, expected } of regex) {
    await t.test(`${source}: /${expected.slice(0, 60)}/`, () => {
      assert.doesNotThrow(() => new RegExp(expected, "s"), "compiles (with the flag shared/match.ts uses)");
      assert.equal(hasNestedUnboundedQuantifier(expected), false, "no nested unbounded quantifiers like (a+)+");
      for (const [name, input] of Object.entries(ADVERSARIAL)) {
        const t0 = performance.now();
        matchOutput(input, expected, "regex");
        const ms = performance.now() - t0;
        assert.ok(ms < MAX_MS, `${name}: took ${ms.toFixed(1)} ms (limit ${MAX_MS} ms)`);
      }
    });
  }
});
