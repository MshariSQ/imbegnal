// Authoring tests for the "algorithms" challenge group (data-structures-algorithms, databases,
// data-science, artificial-intelligence): metadata rubric, secret safety, and proof that every
// challenge is solvable AND graded correctly by the REAL grader engine (worker/src/graders/engine.ts)
// with a stub runner that executes on the host toolchains (tests/helpers/exec-local.ts, NOT sandboxed).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { algorithmsChallenges } from "../../data/challenges/algorithms";
import { algorithmsGraders } from "../../worker/src/graders/data/algorithms";
import { algorithmsReferences } from "../fixtures/challenge-references/algorithms";
import { roadmaps } from "../../data/roadmaps";
import { hasLesson } from "../../data/lessons";
import { LANG_IDS, type LangId } from "../../shared/languages";
import { SUBMIT_LIMITS, type ChallengeGrader, type ChallengeMeta, type HarnessGrader, type OutputGrader } from "../../shared/challenges";
import { RUNNER_CEILING, type RunResult } from "../../shared/protocol";
import { buildProgram, gradeTests, type RunFn } from "../../worker/src/graders/engine";
import { localSupports, runLocal } from "../helpers/exec-local";

const TRACKS = new Set(["data-structures-algorithms", "databases", "data-science", "artificial-intelligence"]);
const PREFIX: Record<string, string> = {
  "data-structures-algorithms": "dsa-",
  databases: "db-",
  "data-science": "ds-",
  "artificial-intelligence": "ai-",
};
const POINTS: Record<number, [number, number]> = { 1: [50, 50], 2: [100, 150], 3: [200, 300], 4: [400, 500] };
// Lessons written by other authors for the new specialty tracks (ids fixed by the feature brief).
const SPECIALTY_LESSONS = new Set([
  "data-structures-algorithms/complexity-big-o",
  "data-structures-algorithms/arrays-hashing",
  "data-structures-algorithms/sorting-searching",
  "data-structures-algorithms/trees-graphs",
  "databases/relational-sql-basics",
  "databases/data-modeling-normalization",
  "databases/joins-aggregation",
  "databases/indexes-performance",
]);

const metas = algorithmsChallenges;
const graders = algorithmsGraders;
const metaOf = (id: string): ChallengeMeta => {
  const m = metas.find((c) => c.id === id);
  assert.ok(m, `meta ${id}`);
  return m;
};
const graderOf = (id: string): ChallengeGrader => {
  const g = graders.find((c) => c.id === id);
  assert.ok(g, `grader ${id}`);
  return g;
};
const testGraderOf = (id: string): OutputGrader | HarnessGrader => {
  const g = graderOf(id);
  assert.ok(g.kind === "output" || g.kind === "code", `${id} is not a test grader`);
  return g;
};

/** Stub runner: executes the program on the host exactly like the production runner would (stdin → stdout). */
const COMPILED: readonly LangId[] = ["c", "cpp", "java", "go", "rust", "csharp", "kotlin", "swift"];
const localRun: RunFn = async ({ lang, code, stdin, limits }) => {
  const t0 = Date.now();
  // runLocal has one timeout for compile + run, so per-test limits would measure the compiler for
  // compiled languages; they are only enforced for interpreted ones (the real runner separates them).
  const r = runLocal(lang, code, stdin, COMPILED.includes(lang) ? 30_000 : (limits?.runTimeoutMs ?? 20_000));
  const status: RunResult["status"] = r.unsupported ? "unsupported" : r.timedOut ? "timeout" : r.exitCode === 0 ? "ok" : "runtime_error";
  return {
    jobId: "local",
    status,
    exitCode: r.exitCode,
    stdout: r.stdout,
    stderr: r.stderr,
    stdoutBytes: Buffer.byteLength(r.stdout),
    stderrBytes: Buffer.byteLength(r.stderr),
    truncated: { stdout: false, stderr: false },
    runMs: Date.now() - t0,
    compileMs: 0,
  };
};

// ── 1. meta ⇄ grader parity ──────────────────────────────────────────────────

test("every meta has exactly one grader with the same id and kind, and vice versa", () => {
  assert.ok(metas.length >= 7, "the group ships 7-8 challenges");
  const mIds = metas.map((m) => m.id);
  const gIds = graders.map((g) => g.id);
  assert.equal(new Set(mIds).size, mIds.length, "duplicate meta ids");
  assert.equal(new Set(gIds).size, gIds.length, "duplicate grader ids");
  assert.deepEqual([...gIds].sort(), [...mIds].sort());
  for (const g of graders) assert.equal(metaOf(g.id).kind, g.kind, `kind of ${g.id}`);
  const rIds = algorithmsReferences.map((r) => r.id);
  assert.deepEqual([...rIds].sort(), [...mIds].sort(), "every challenge has a reference entry");
});

// ── 2. metadata rubric ───────────────────────────────────────────────────────

const nonEmpty = (s: unknown): s is string => typeof s === "string" && s.trim().length > 0;
const hasArabic = (s: string) => /[؀-ۿ]/.test(s);

test("metadata follows the authoring rubric", () => {
  const roadmapIds = new Set(roadmaps.map((r) => r.id));
  for (const m of metas) {
    assert.ok(roadmapIds.has(m.track) && TRACKS.has(m.track), `${m.id}: track ${m.track}`);
    assert.match(m.id, /^[a-z0-9][a-z0-9-]{2,63}$/, `${m.id}: id shape`);
    assert.ok(m.id.startsWith(PREFIX[m.track]), `${m.id}: must start with ${PREFIX[m.track]}`);
    assert.ok(nonEmpty(m.topic), `${m.id}: topic`);
    for (const f of ["title", "summary", "description"] as const) {
      assert.ok(nonEmpty(m[f].en) && nonEmpty(m[f].ar), `${m.id}: ${f} must be bilingual`);
      assert.ok(hasArabic(m[f].ar), `${m.id}: ${f}.ar must contain Arabic text`);
      assert.ok(!hasArabic(m[f].en), `${m.id}: ${f}.en must not contain Arabic`);
    }
    assert.ok(m.summary.en.length <= 260 && m.summary.ar.length <= 260, `${m.id}: summary is one or two sentences`);
    assert.ok([1, 2, 3, 4].includes(m.difficulty), `${m.id}: difficulty`);
    const [lo, hi] = POINTS[m.difficulty];
    assert.ok(m.points >= lo && m.points <= hi, `${m.id}: ${m.points} points out of range for difficulty ${m.difficulty}`);
    assert.ok(Number.isInteger(m.estMinutes) && m.estMinutes >= 5 && m.estMinutes <= 120, `${m.id}: estMinutes`);
    assert.ok((m.tags?.length ?? 0) >= 2, `${m.id}: tags`);

    // description: story, exact task, I/O spec and a worked example, in both languages
    assert.match(m.description.en, /^## /m, `${m.id}: en headings`);
    assert.match(m.description.ar, /^## /m, `${m.id}: ar headings`);
    assert.equal((m.description.en.match(/^## /gm) ?? []).length, (m.description.ar.match(/^## /gm) ?? []).length, `${m.id}: en/ar section count`);
    assert.ok(m.description.en.includes("```") && m.description.ar.includes("```"), `${m.id}: worked example in a code fence`);

    // hints
    const hints = m.hints ?? [];
    assert.ok(hints.length >= 2 && hints.length <= 3, `${m.id}: 2-3 hints`);
    let total = 0;
    let prev = 0;
    for (const h of hints) {
      assert.ok(nonEmpty(h.text.en) && nonEmpty(h.text.ar) && hasArabic(h.text.ar), `${m.id}: bilingual hint`);
      assert.ok(Number.isInteger(h.cost) && h.cost > 0, `${m.id}: hint cost`);
      assert.ok(h.cost >= prev, `${m.id}: hint costs must not decrease`);
      prev = h.cost;
      total += h.cost;
    }
    assert.ok(total <= m.points * 0.4, `${m.id}: hints cost ${total} > 40% of ${m.points}`);

    // lessons
    for (const ref of m.lessons ?? []) {
      assert.match(ref, /^[a-z0-9-]+\/[a-z0-9-]+$/, `${m.id}: lesson ref ${ref}`);
      const [track, lesson] = ref.split("/");
      assert.ok(roadmapIds.has(track), `${m.id}: lesson track ${track}`);
      assert.ok(SPECIALTY_LESSONS.has(ref) || hasLesson(track, lesson), `${m.id}: unknown lesson ${ref}`);
    }
    assert.ok((m.lessons?.length ?? 0) >= 1, `${m.id}: link at least one lesson`);

    // kind-specific fields
    if (m.kind === "flag") {
      assert.equal(m.flagFormat, "IMB{...}", `${m.id}: flagFormat`);
      assert.ok((m.files?.length ?? 0) >= 1, `${m.id}: flag challenges need files`);
    } else {
      assert.ok(m.lang && (LANG_IDS as readonly string[]).includes(m.lang), `${m.id}: lang`);
      const allowed = m.allowedLangs ?? LANG_IDS;
      assert.ok(allowed.includes(m.lang), `${m.id}: lang must be allowed`);
      const starter = Object.keys(m.starterCode ?? {}) as LangId[];
      assert.ok(starter.length >= 2, `${m.id}: starter code for python + one more language`);
      assert.ok(m.starterCode?.python, `${m.id}: python starter`);
      for (const l of starter) {
        assert.ok(allowed.includes(l), `${m.id}: starter language ${l} not allowed`);
        assert.ok(nonEmpty(m.starterCode?.[l]));
      }
    }
  }
});

test("difficulty mix is a ladder: easy, medium and hard all appear", () => {
  const seen = new Set(metas.map((m) => m.difficulty));
  for (const d of [1, 2, 3]) assert.ok(seen.has(d as 1 | 2 | 3), `difficulty ${d} present`);
  for (const t of TRACKS) assert.ok(metas.some((m) => m.track === t), `track ${t} has a challenge`);
});

// ── 3. secret safety ─────────────────────────────────────────────────────────

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const allStrings = (v: unknown, out: string[] = []): string[] => {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => allStrings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => allStrings(x, out));
  return out;
};

test("flag graders store only a SHA-256 and the plaintext flag is nowhere in meta or grader", () => {
  for (const ref of algorithmsReferences) {
    const g = graderOf(ref.id);
    if (g.kind !== "flag") continue;
    assert.match(g.flagHash, /^[0-9a-f]{64}$/, `${ref.id}: flagHash`);
    assert.ok(ref.flag, `${ref.id}: vault flag`);
    const hay = [...allStrings(metaOf(ref.id)), ...allStrings(g).filter((s) => s !== g.flagHash)];
    for (const s of hay) assert.ok(!s.includes(ref.flag), `${ref.id}: plaintext flag leaked`);
    assert.equal(sha256(ref.flag.trim()), g.flagHash, `${ref.id}: vault flag matches the hash`);
  }
});

test("hidden tests and harnesses are not copied into the public meta", () => {
  for (const g of graders) {
    if (g.kind === "flag") continue;
    const publicText = allStrings(metaOf(g.id)).join("\n");
    for (const t of g.tests) {
      if (t.hidden !== true) continue;
      const stdin = t.stdin.trim();
      // Short hidden inputs ("1 4\n2") may coincide with prose by chance; anything real must not appear.
      if (stdin.length >= 12) assert.ok(!publicText.includes(stdin), `${g.id}/${t.name}: hidden stdin copied into meta`);
      const expected = t.expected.trim();
      if (expected.length >= 12) assert.ok(!publicText.includes(expected), `${g.id}/${t.name}: hidden expected output copied into meta`);
    }
    if (g.kind === "code") {
      for (const template of Object.values(g.harness)) {
        const body = (template ?? "").split("{{CODE}}")[1]?.trim() ?? "";
        const firstLines = body.split("\n").filter((l) => l.trim().length > 20).slice(0, 3);
        for (const l of firstLines) assert.ok(!publicText.includes(l.trim()), `${g.id}: harness line leaked into meta`);
      }
    }
  }
});

// ── 4. graders are well formed ───────────────────────────────────────────────

test("test graders are well formed: visible examples, hidden tests, sizes, harness contract", () => {
  for (const m of metas) {
    if (m.kind === "flag") continue;
    const g = testGraderOf(m.id);
    assert.ok(g.tests.length <= SUBMIT_LIMITS.maxTests, `${m.id}: more tests than maxTests`);
    const visible = g.tests.filter((t) => t.hidden !== true);
    const hidden = g.tests.filter((t) => t.hidden === true);
    assert.ok(visible.length >= 2 && visible.length <= 3, `${m.id}: 2-3 visible tests`);
    assert.ok(hidden.length >= 3, `${m.id}: at least 3 hidden tests`);
    assert.equal(new Set(g.tests.map((t) => t.name)).size, g.tests.length, `${m.id}: unique test names`);
    for (const t of g.tests) {
      assert.ok(Buffer.byteLength(t.stdin) <= RUNNER_CEILING.stdinBytes, `${m.id}/${t.name}: stdin above the runner ceiling`);
      assert.ok(nonEmpty(t.expected), `${m.id}/${t.name}: expected`);
      if (t.mode === "float") assert.ok(t.epsilon !== undefined && t.epsilon > 0, `${m.id}/${t.name}: float tests state an epsilon`);
    }
    if (m.sampleInput !== undefined) {
      assert.equal(m.sampleInput, visible[0].stdin, `${m.id}: sampleInput is the first visible test`);
      assert.ok(m.description.en.includes(m.sampleInput.trimEnd()) && m.description.ar.includes(m.sampleInput.trimEnd()), `${m.id}: sample shown in both statements`);
    }
    if (g.kind === "code") {
      assert.deepEqual(Object.keys(g.harness).sort(), [...(m.allowedLangs ?? Object.keys(g.harness))].sort(), `${m.id}: harness languages == allowedLangs`);
      for (const l of ["python", "javascript"] as const) {
        if (m.allowedLangs && !m.allowedLangs.includes(l)) continue;
        assert.ok(g.harness[l], `${m.id}: harness for ${l}`);
      }
    }
  }
});

// ── 5. references solve every test through the real engine ───────────────────

for (const ref of algorithmsReferences) {
  const meta = metas.find((m) => m.id === ref.id);
  if (!meta || meta.kind === "flag") continue;
  const grader = testGraderOf(ref.id);
  const solutions = Object.entries(ref.solutions ?? {}) as [LangId, string][];

  test(`${ref.id}: reference solutions exist (python + javascript at least)`, () => {
    assert.ok(ref.solutions?.python && ref.solutions.javascript, "python and javascript solutions");
    for (const [lang] of solutions) assert.ok((meta.allowedLangs ?? LANG_IDS).includes(lang), `${lang} allowed`);
    if (grader.kind === "code") for (const [lang] of solutions) assert.ok(grader.harness[lang], `${lang} has a harness`);
  });

  for (const [lang, code] of solutions) {
    test(`${ref.id}: ${lang} reference passes ALL tests through the grader engine`, { skip: localSupports(lang) ? false : `${lang} toolchain not installed` }, async () => {
      const built = buildProgram(grader, lang, code);
      assert.ok(built.ok, "program builds");
      if (grader.kind === "code") assert.equal(built.program.includes("{{CODE}}"), false, "sentinel replaced");
      const out = await gradeTests(grader, lang, built.program, localRun);
      assert.equal(out.kind, "graded");
      if (out.kind !== "graded") return;
      const failed = out.grade.tests.filter((t) => !t.passed).map((t) => `${t.name}: ${t.message ?? ""} ${t.expected !== undefined ? `expected ${JSON.stringify(t.expected)} got ${JSON.stringify(t.actual)}` : ""}`);
      assert.deepEqual(failed, [], `${ref.id}/${lang}`);
      assert.equal(out.grade.passed, true);
      assert.equal(out.grade.tests.length, grader.tests.length);
    });
  }

  for (const lang of Object.keys(meta.starterCode ?? {}) as LangId[]) {
    test(`${ref.id}: untouched ${lang} starter code runs but FAILS the tests`, { skip: localSupports(lang) ? false : `${lang} toolchain not installed` }, async () => {
      const built = buildProgram(grader, lang, meta.starterCode?.[lang] ?? "");
      assert.ok(built.ok, "starter builds");
      const first = await localRun({ lang, code: built.program, stdin: grader.tests[0].stdin });
      assert.equal(first.status, "ok", `starter must compile/run cleanly: ${first.stderr.slice(0, 300)}`);
      const out = await gradeTests(grader, lang, built.program, localRun);
      assert.equal(out.kind, "graded");
      if (out.kind === "graded") assert.equal(out.grade.passed, false, "starter must not pass");
    });
  }
}

test("unsupported-language and sentinel guards behave for the code graders", () => {
  for (const g of graders) {
    if (g.kind !== "code") continue;
    assert.equal(buildProgram(g, "rust", "fn main(){}").ok, false, `${g.id}: no rust harness`);
    assert.equal(buildProgram(g, "python", "x = '{{CODE}}'").ok, false, `${g.id}: reserved sentinel rejected`);
  }
});
