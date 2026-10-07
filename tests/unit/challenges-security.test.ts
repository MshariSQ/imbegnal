// Authoring tests for the "security" challenge group (cyber-security, reverse-engineering):
// parity of meta/grader, metadata rubric, secret safety, and proof that every challenge is
// solvable (reference solvers/solutions, through both matchOutput and the REAL grader engine).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { securityChallenges } from "../../data/challenges/security";
import { securityGraders } from "../../worker/src/graders/data/security";
import { securityReferences, puzzleFile } from "../fixtures/challenge-references/security";
import { roadmaps } from "../../data/roadmaps";
import { hasLesson } from "../../data/lessons";
import { LANG_IDS, type LangId } from "../../shared/languages";
import type { ChallengeGrader, ChallengeMeta, HarnessGrader, OutputGrader } from "../../shared/challenges";
import { matchOutput } from "../../shared/match";
import type { RunResult } from "../../shared/protocol";
import { buildProgram, gradeFlag, gradeTests, type RunFn } from "../../worker/src/graders/engine";
import { localSupports, runLocal } from "../helpers/exec-local";

const ROOT = join(import.meta.dirname, "..", "..");
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const nonEmpty = (s: unknown) => typeof s === "string" && s.trim().length > 0;

const metaOf = (id: string): ChallengeMeta => {
  const m = securityChallenges.find((c) => c.id === id);
  assert.ok(m, `meta ${id}`);
  return m;
};
const isTestGrader = (g: ChallengeGrader): g is OutputGrader | HarnessGrader => g.kind !== "flag";
const refOf = (id: string) => {
  const r = securityReferences.find((x) => x.id === id);
  assert.ok(r, `reference ${id}`);
  return r;
};

/** The track prefix rule from the brief. */
const PREFIX: Record<string, string> = { "cyber-security": "sec-", "reverse-engineering": "re-" };
/** Lessons authored by other engineers for the new specialty tracks (exact ids from the brief). */
const SPECIALTY_LESSONS = new Set([
  "reverse-engineering/how-programs-run",
  "reverse-engineering/assembly-basics",
  "reverse-engineering/static-analysis-deobfuscation",
]);
const RUBRIC: Record<number, [number, number]> = { 1: [50, 50], 2: [100, 150], 3: [200, 300], 4: [400, 500] };

// ── 1. parity ─────────────────────────────────────────────────────────────────

test("every meta has exactly one grader with the same id and kind, and vice versa", () => {
  assert.ok(securityChallenges.length >= 1, "the security group ships 6-7 challenges");
  const metaIds = securityChallenges.map((c) => c.id);
  const graderIds = securityGraders.map((g) => g.id);
  assert.equal(new Set(metaIds).size, metaIds.length, "duplicate meta ids");
  assert.equal(new Set(graderIds).size, graderIds.length, "duplicate grader ids");
  assert.deepEqual([...metaIds].sort(), [...graderIds].sort());
  for (const g of securityGraders) assert.equal(metaOf(g.id).kind, g.kind, `kind of ${g.id}`);
  assert.deepEqual(securityReferences.map((r) => r.id).sort(), [...metaIds].sort(), "one reference per challenge");
});

// ── 2. metadata ───────────────────────────────────────────────────────────────

const roadmapIds = new Set(roadmaps.map((r) => r.id));

for (const c of securityChallenges) {
  test(`metadata rubric: ${c.id}`, () => {
    assert.match(c.id, /^[a-z0-9][a-z0-9-]{0,63}$/);
    assert.ok(roadmapIds.has(c.track), `track ${c.track} is a roadmap id`);
    assert.ok(c.id.startsWith(PREFIX[c.track] ?? "\0"), `${c.id} must start with ${PREFIX[c.track]}`);
    assert.ok(nonEmpty(c.topic));
    for (const field of ["title", "summary", "description"] as const) {
      assert.ok(nonEmpty(c[field].en) && nonEmpty(c[field].ar), `${c.id}.${field} is bilingual`);
    }
    assert.ok(/[؀-ۿ]/.test(c.title.ar) && /[؀-ۿ]/.test(c.summary.ar) && /[؀-ۿ]/.test(c.description.ar), "Arabic text contains Arabic letters");
    assert.ok(c.summary.en.length <= 260 && c.summary.ar.length <= 260, "summary is one or two sentences");

    assert.ok([1, 2, 3, 4].includes(c.difficulty));
    const [lo, hi] = RUBRIC[c.difficulty];
    assert.ok(c.points >= lo && c.points <= hi, `${c.id}: ${c.points} points outside ${lo}-${hi} for difficulty ${c.difficulty}`);
    assert.ok(Number.isInteger(c.estMinutes) && c.estMinutes >= 5 && c.estMinutes <= 120, "estMinutes");
    assert.match(c.addedAt ?? "", /^\d{4}-\d{2}-\d{2}$/);
    assert.ok((c.tags?.length ?? 0) >= 2);

    const hints = c.hints ?? [];
    assert.ok(hints.length >= 2 && hints.length <= 3, `${c.id}: 2-3 hints`);
    for (const h of hints) assert.ok(nonEmpty(h.text.en) && nonEmpty(h.text.ar) && Number.isInteger(h.cost) && h.cost > 0);
    const costs = hints.map((h) => h.cost);
    assert.deepEqual(costs, [...costs].sort((a, b) => a - b), "hint costs increase");
    assert.ok(costs.reduce((a, b) => a + b, 0) <= c.points * 0.4, `${c.id}: hints cost more than 40% of the points`);

    for (const l of c.lessons ?? []) {
      assert.match(l, /^[a-z0-9-]+\/[a-z0-9-]+$/, `lesson ref ${l}`);
      assert.ok(roadmapIds.has(l.split("/")[0]), `lesson track of ${l}`);
      const [track, node] = l.split("/");
      assert.ok(hasLesson(track, node) || SPECIALTY_LESSONS.has(l), `lesson ${l} exists (or is a planned specialty lesson)`);
    }
    assert.ok((c.lessons?.length ?? 0) >= 1, "ties to at least one lesson");

    if (c.kind === "flag") {
      assert.equal(c.flagFormat, "IMB{...}");
      assert.ok((c.files?.length ?? 0) >= 1, "flag challenges ship puzzle files");
      assert.equal(c.starterCode, undefined);
      for (const f of c.files ?? []) assert.ok(nonEmpty(f.name) && f.content.length > 0);
    } else {
      assert.ok(c.lang && (LANG_IDS as readonly string[]).includes(c.lang), "default lang");
      const starters = Object.keys(c.starterCode ?? {}) as LangId[];
      assert.ok(starters.includes("python") && starters.length >= 2, "starter code for python and one more language");
      for (const l of starters) {
        assert.ok((LANG_IDS as readonly string[]).includes(l), `known language ${l}`);
        if (c.allowedLangs) assert.ok(c.allowedLangs.includes(l), `${l} starter is in allowedLangs`);
        assert.ok(nonEmpty(c.starterCode?.[l]));
      }
      if (c.allowedLangs) assert.ok(c.lang && c.allowedLangs.includes(c.lang));
      assert.ok(nonEmpty(c.sampleInput), "sampleInput");
    }
    assert.ok(c.description.en.includes("##") && c.description.ar.includes("##"), "structured statement");
  });
}

test("every grader is well formed", () => {
  for (const g of securityGraders) {
    if (g.kind === "flag") {
      assert.match(g.flagHash, /^[0-9a-f]{64}$/, `${g.id}: flagHash`);
      continue;
    }
    const meta = metaOf(g.id);
    assert.ok(g.tests.length >= 5 && g.tests.length <= 20, `${g.id}: test count`);
    const visible = g.tests.filter((t) => !t.hidden);
    const hidden = g.tests.filter((t) => t.hidden);
    assert.ok(visible.length >= 2 && visible.length <= 3, `${g.id}: 2-3 visible tests`);
    assert.ok(hidden.length >= 3, `${g.id}: at least 3 hidden tests`);
    assert.equal(new Set(g.tests.map((t) => t.name)).size, g.tests.length, "unique test names");
    // Visible tests are the statement's examples, so the statement must show their expected output.
    for (const t of visible) {
      for (const lang of ["en", "ar"] as const) {
        assert.ok(meta.description[lang].includes(t.expected.trim()), `${g.id}: ${lang} statement shows visible test ${t.name}`);
      }
    }
    if (g.kind === "code") {
      for (const lang of ["python", "javascript"] as const) assert.ok(g.harness[lang], `${g.id}: ${lang} harness`);
      for (const [lang, tpl] of Object.entries(g.harness)) assert.equal(tpl?.split("{{CODE}}").length, 2, `${g.id}/${lang}: one {{CODE}}`);
      for (const l of meta.allowedLangs ?? []) assert.ok(g.harness[l], `${g.id}: allowed language ${l} has a harness`);
    }
  }
});

// ── 3. secret safety ──────────────────────────────────────────────────────────

const FLAG_SHAPE = /IMB\{[A-Za-z0-9_\-!@#$%^&*+=.:;]{8,}\}/;
const publicSource = () => ["data/challenges/security.ts", "worker/src/graders/data/security.ts"].map((p) => readFileSync(join(ROOT, p), "utf8"));

test("no flag appears in any meta, grader or source file of data/ and worker/", () => {
  const blob = JSON.stringify(securityChallenges) + JSON.stringify(securityGraders);
  assert.ok(!FLAG_SHAPE.test(blob), "a complete IMB{...} flag is present in meta/grader data");
  for (const src of publicSource()) assert.ok(!FLAG_SHAPE.test(src), "a complete IMB{...} flag is present in source text");
  for (const g of securityGraders) {
    if (g.kind !== "flag") continue;
    const ref = refOf(g.id);
    assert.ok(ref.flag, `${g.id}: reference flag`);
    for (const surface of [JSON.stringify(securityChallenges), JSON.stringify(securityGraders), ...publicSource()]) {
      assert.ok(!surface.includes(ref.flag), `${g.id}: plaintext flag leaked`);
      // nor the secret payload inside the braces
      assert.ok(!surface.includes(ref.flag.slice(4, -1)), `${g.id}: flag payload leaked`);
    }
  }
});

test("no grader secret is copied into public meta", () => {
  for (const g of securityGraders) {
    const metaJson = JSON.stringify(metaOf(g.id));
    if (g.kind === "flag") {
      assert.ok(!metaJson.includes(g.flagHash), `${g.id}: flagHash in meta`);
      continue;
    }
    for (const t of g.tests.filter((x) => x.hidden)) {
      // JSON.stringify escapes newlines, so compare against the escaped form as well as the raw text.
      for (const s of [t.stdin, t.expected]) {
        const trimmed = s.trim();
        if (trimmed.length < 6) continue;
        assert.ok(!metaJson.includes(trimmed) && !metaJson.includes(JSON.stringify(trimmed).slice(1, -1)), `${g.id}: hidden test ${t.name} leaked into meta`);
      }
    }
  }
});

test("puzzle files do not carry the answer in a greppable form", () => {
  for (const g of securityGraders) {
    if (g.kind !== "flag") continue;
    for (const f of metaOf(g.id).files ?? []) {
      assert.ok(!/IMB\{/i.test(f.content), `${g.id}/${f.name}: contains the flag marker`);
    }
  }
});

// ── 4. references ─────────────────────────────────────────────────────────────

test("flag solvers derive a flag whose SHA-256 equals the grader's flagHash", async () => {
  let checked = 0;
  for (const g of securityGraders) {
    if (g.kind !== "flag") continue;
    const flag = refOf(g.id).flag;
    assert.ok(flag, `${g.id}: reference flag`);
    assert.match(flag, /^IMB\{[A-Za-z0-9_\-!@#$%^&*+=.:;]{8,}\}$/, `${g.id}: flag shape`);
    assert.equal(sha256(flag), g.flagHash, `${g.id}: solver output does not match flagHash`);
    // through the real engine, plus a wrong and a near-miss submission
    assert.equal(await gradeFlag(g, flag), true);
    assert.equal(await gradeFlag(g, `  ${flag}\n`), true, "surrounding whitespace is trimmed");
    assert.equal(await gradeFlag(g, flag.slice(0, -1) + "x}"), false);
    assert.equal(await gradeFlag(g, "IMB{wrong}"), false);
    checked++;
  }
  assert.ok(checked >= 1, "flag challenges are covered");
});

const toRunResult = (r: ReturnType<typeof runLocal>): RunResult => ({
  jobId: "local",
  status: r.timedOut ? "timeout" : r.exitCode === 0 ? "ok" : "runtime_error",
  exitCode: r.exitCode,
  stdout: r.stdout,
  stderr: r.stderr,
  stdoutBytes: r.stdout.length,
  stderrBytes: r.stderr.length,
  truncated: { stdout: false, stderr: false },
  runMs: 0,
  compileMs: 0,
});

/** Stub runner for the real engine: executes with the host toolchain (tests only). */
const localRun: RunFn = async ({ lang, code, stdin }) => toRunResult(runLocal(lang, code, stdin));

function program(g: OutputGrader | HarnessGrader, lang: LangId, code: string): string {
  const built = buildProgram(g, lang, code);
  assert.ok(built.ok, `${g.id}/${lang}: buildProgram failed (${built.ok ? "" : built.reason})`);
  return built.program;
}

for (const g of securityGraders) {
  if (!isTestGrader(g)) continue;
  const meta = metaOf(g.id);

  test(`reference solutions pass every test (hidden included): ${g.id}`, async () => {
    const solutions = refOf(g.id).solutions ?? {};
    const langs = Object.keys(solutions) as LangId[];
    assert.ok(langs.includes("python") && langs.includes("javascript"), "python and javascript solutions");
    for (const lang of langs) {
      assert.ok(localSupports(lang), `${lang} toolchain is required to verify ${g.id}`);
      if (meta.allowedLangs) assert.ok(meta.allowedLangs.includes(lang));
      const code = solutions[lang] as string;
      const prog = program(g, lang, code);
      for (const t of g.tests) {
        const started = Date.now();
        const r = runLocal(lang, prog, t.stdin);
        const ms = Date.now() - started;
        assert.equal(r.exitCode, 0, `${g.id}/${lang}/${t.name}: exit ${r.exitCode}\n${r.stderr.slice(0, 400)}`);
        assert.ok(matchOutput(r.stdout, t.expected, t.mode ?? "trim", t.epsilon ?? 1e-6), `${g.id}/${lang}/${t.name}: wrong output\n--- got\n${r.stdout.slice(0, 400)}\n--- want\n${t.expected.slice(0, 400)}`);
        if (lang === "python" || lang === "javascript") assert.ok(ms < 2000, `${g.id}/${lang}/${t.name}: took ${ms} ms`);
      }
      // and once more through the production grading path
      const outcome = await gradeTests(g, lang, prog, localRun);
      assert.equal(outcome.kind, "graded");
      if (outcome.kind === "graded") assert.equal(outcome.grade.passed, true, `${g.id}/${lang}: engine says ${outcome.grade.feedback}`);
    }
  });

  test(`untouched starter code fails: ${g.id}`, async () => {
    let verified = 0;
    for (const [lang, code] of Object.entries(meta.starterCode ?? {}) as [LangId, string][]) {
      if (!localSupports(lang)) continue;
      const outcome = await gradeTests(g, lang, program(g, lang, code), localRun);
      assert.equal(outcome.kind, "graded");
      if (outcome.kind === "graded") assert.equal(outcome.grade.passed, false, `${g.id}/${lang}: the starter must not pass`);
      verified++;
    }
    assert.ok(verified >= 2, `${g.id}: at least two starters verified locally`);
  });

  test(`hidden tests cannot be hard-coded from the visible ones: ${g.id}`, () => {
    const visible = new Set(g.tests.filter((t) => !t.hidden).map((t) => t.expected.trim()));
    for (const t of g.tests.filter((x) => x.hidden)) {
      assert.ok(!visible.has(t.expected.trim()) || t.expected.trim().length < 12, `${g.id}/${t.name}: hidden expected duplicates a visible one`);
    }
    // a learner who pastes the visible expected outputs for any input must fail the hidden tests
    const distinctInputs = new Set(g.tests.map((t) => t.stdin));
    assert.equal(distinctInputs.size, g.tests.length, "every test has its own input");
  });

  if (g.kind === "code") {
    test(`harness works end to end with the reference: ${g.id}`, async () => {
      const code = refOf(g.id).solutions?.python;
      assert.ok(code);
      const prog = program(g, "python", code);
      const first = g.tests[0];
      const r = runLocal("python", prog, first.stdin);
      assert.equal(r.exitCode, 0, r.stderr);
      assert.ok(matchOutput(r.stdout, first.expected, first.mode ?? "trim"));
      // the sentinel is substituted exactly once and the learner's code is spliced verbatim
      assert.ok(prog.includes(code));
      assert.ok(!prog.includes("{{CODE}}"));
    });
  }
}

// ── 5. challenge specifics: the puzzles are fair and the traps work ───────────

test("sec-auth-log-hunt: the intended answer is unique and the tempting shortcuts are wrong", () => {
  const log = puzzleFile("sec-auth-log-hunt", "auth.log");
  assert.equal(log.trimEnd().split("\n").length, 48, "the statement says 48 lines");
  const re = /(Failed|Accepted) password for (?:invalid user )?(\S+) from (\S+)/;
  const total = new Map<string, number>();
  const before = new Map<string, number>();
  const accepted = new Set<string>();
  for (const line of log.split("\n")) {
    const m = re.exec(line);
    if (!m) continue;
    const [, verb, , ip] = m;
    if (verb === "Accepted") accepted.add(ip);
    else {
      total.set(ip, (total.get(ip) ?? 0) + 1);
      if (!accepted.has(ip)) before.set(ip, (before.get(ip) ?? 0) + 1);
    }
  }
  const top = (m: Map<string, number>, only?: Set<string>) =>
    [...m].filter(([ip]) => !only || only.has(ip)).sort((a, b) => b[1] - a[1]);
  const everAccepted = new Set<string>();
  for (const line of log.split("\n")) {
    const m = re.exec(line);
    if (m && m[1] === "Accepted") everAccepted.add(m[3]);
  }
  const correct = top(before, everAccepted);
  assert.ok(correct[0][1] > correct[1][1], "unique maximum");
  assert.notEqual(top(total)[0][0], correct[0][0], "most failures overall is a decoy (never got in)");
  assert.notEqual(top(total, everAccepted)[0][0], correct[0][0], "most failures among successful IPs is a decoy (failures after login)");
});

test("sec-salted-wordlist: every account is crackable exactly once, salts matter, the statement's demo entry checks out", () => {
  const shadow = puzzleFile("sec-salted-wordlist", "shadow.txt").trimEnd().split("\n");
  const words = puzzleFile("sec-salted-wordlist", "wordlist.txt").trimEnd().split("\n");
  assert.equal(words.length, 106, "the statement says 106 candidates");
  assert.equal(new Set(words).size, words.length);
  assert.ok(!words.includes("hello"), "the demo password is not on the real list");
  const salts = new Set<string>();
  for (const line of shadow) {
    const m = /^([a-z]+):\$imb1\$([0-9a-f]{8})\$([0-9a-f]{64})$/.exec(line);
    assert.ok(m, `entry format: ${line.slice(0, 20)}`);
    const [, , salt, digest] = m;
    salts.add(salt);
    assert.equal(words.filter((w) => sha256(`${salt}:${w}`) === digest).length, 1, "exactly one candidate matches");
    assert.equal(words.filter((w) => sha256(w) === digest).length, 0, "forgetting the salt finds nothing");
  }
  assert.equal(salts.size, shadow.length, "salts are unique per account");
  const demo = /demo:\$imb1\$a1b2c3d4\$([0-9a-f]{64})/.exec(metaOf("sec-salted-wordlist").description.en);
  assert.ok(demo);
  assert.equal(demo[1], sha256("a1b2c3d4:hello"));
  assert.ok(metaOf("sec-salted-wordlist").description.ar.includes(demo[1]), "the Arabic statement shows the same demo entry");
});

test("sec-crypto-ladder: exactly one Caesar shift reads as English and the statement's toolbox examples are right", () => {
  const stage1 = puzzleFile("sec-crypto-ladder", "stage1.txt");
  const words = ["the", "next", "note", "is", "in", "and", "then", "so", "to", "it", "was", "with"];
  const readable = Array.from({ length: 25 }, (_, i) => i + 1).filter((k) => {
    const plain = stage1.replace(/[a-z]/gi, (c) => {
      const base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base - k + 26) % 26) + base);
    });
    return plain.toLowerCase().split(/\W+/).filter((w) => words.includes(w)).length >= 6;
  });
  assert.equal(readable.length, 1, "a single shift produces English");
  // the toolbox examples in the statement
  assert.equal(Buffer.from("48656c6c6f", "hex").toString(), "Hello");
  assert.equal(Buffer.from("SGVsbG8=", "base64").toString(), "Hello");
  assert.equal("A".charCodeAt(0) ^ "b".charCodeAt(0), 0x23);
  // stage 3 is not valid text before decryption (no accidental plaintext shortcut)
  const raw = Buffer.from(puzzleFile("sec-crypto-ladder", "stage3.txt").trim(), "hex").toString("latin1");
  assert.ok(!/FLAG=/.test(raw));
});

test("sec-password-strength: expected outputs match an independent implementation and every rating band is exercised", () => {
  const g = securityGraders.find((x) => x.id === "sec-password-strength");
  assert.ok(g && g.kind === "output");
  const COMMON = new Set(["password", "123456", "12345678", "qwerty", "abc123", "letmein", "iloveyou", "admin"]);
  const band = (b: number) => (b < 28 ? "very weak" : b < 36 ? "weak" : b < 60 ? "reasonable" : b < 128 ? "strong" : "very strong");
  const seen = new Set<string>();
  for (const t of g.tests) {
    const [count, ...pws] = t.stdin.split("\n");
    assert.equal(pws.length - 1, Number(count), `${t.name}: N matches the number of lines (plus the final newline)`);
    const want = pws.slice(0, Number(count)).map((pw) => {
      let pool = 0;
      if (/[a-z]/.test(pw)) pool += 26;
      if (/[A-Z]/.test(pw)) pool += 26;
      if (/\d/.test(pw)) pool += 10;
      if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
      const bits = COMMON.has(pw.toLowerCase()) || pool === 0 ? 0 : pw.length * Math.log2(pool);
      seen.add(band(bits));
      return `${bits.toFixed(1)} ${band(bits)}`;
    });
    // same words, numbers within the grader's tolerance
    assert.ok(matchOutput(want.join("\n"), t.expected, "float", t.epsilon), `${t.name}: expected output disagrees with the independent implementation`);
    for (const pw of pws.slice(0, Number(count))) {
      assert.ok(pw === pw.trim() && pw.length <= 200 && /^[\x20-\x7e]*$/.test(pw), `${t.name}: password obeys the input rules`);
    }
  }
  assert.deepEqual([...seen].sort(), ["reasonable", "strong", "very strong", "very weak", "weak"]);
});
