// Authoring tests for the "systems" challenge group (networking, operating-systems, devops,
// cloud-computing): parity of public metadata and server-only graders, metadata rubric, secret
// safety, and proof that every challenge is solvable (reference solutions run with the host
// toolchains, directly and through the REAL grader engine with a local stub runner).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { systemsChallenges } from "../../data/challenges/systems";
import { systemsGraders } from "../../worker/src/graders/data/systems";
import { systemsFlagSolvers, systemsReferences } from "../fixtures/challenge-references/systems";
import { roadmaps } from "../../data/roadmaps";
import { hasLesson } from "../../data/lessons";
import { LANG_IDS, type LangId } from "../../shared/languages";
import { matchOutput } from "../../shared/match";
import type { ChallengeGrader, ChallengeMeta, FlagGrader, HarnessGrader, OutputGrader } from "../../shared/challenges";
import type { RunStatus } from "../../shared/protocol";
import { buildProgram, gradeFlag, gradeTests, type RunFn } from "../../worker/src/graders/engine";
import { localSupports, runLocal } from "../helpers/exec-local";

const ROADMAP_IDS = new Set(roadmaps.map((r) => r.id));
const SYSTEMS_TRACKS = new Set(["networking", "operating-systems", "devops", "cloud-computing"]);
const PREFIX: Record<string, string> = { networking: "net-", "operating-systems": "os-", devops: "devops-", "cloud-computing": "cloud-" };
const POINTS: Record<number, [number, number]> = { 1: [50, 50], 2: [100, 150], 3: [200, 300], 4: [400, 500] };
/** Languages every reference must cover (both are installed on the dev/CI hosts). */
const REQUIRED_LANGS: LangId[] = ["python", "javascript"];

const graderOf = (id: string): ChallengeGrader => {
  const g = systemsGraders.find((x) => x.id === id);
  assert.ok(g, `grader ${id}`);
  return g;
};
const refOf = (id: string) => systemsReferences.find((r) => r.id === id);
const testGraders = (): Array<{ meta: ChallengeMeta; grader: OutputGrader | HarnessGrader }> =>
  systemsChallenges.flatMap((meta) => {
    const g = graderOf(meta.id);
    return g.kind === "output" || g.kind === "code" ? [{ meta, grader: g }] : [];
  });
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** Every string value reachable in a JSON-like structure. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const localRun: RunFn = async ({ lang, code, stdin }) => {
  const t0 = Date.now();
  const r = runLocal(lang, code, stdin, 10_000);
  let status: RunStatus = "ok";
  if (r.unsupported) status = "unsupported";
  else if (r.timedOut) status = "timeout";
  else if (r.exitCode !== 0) status = "runtime_error";
  return {
    jobId: "local",
    status,
    exitCode: r.exitCode,
    stdout: r.stdout,
    stderr: r.stderr,
    stdoutBytes: r.stdout.length,
    stderrBytes: r.stderr.length,
    truncated: { stdout: false, stderr: false },
    runMs: Date.now() - t0,
    compileMs: 0,
  };
};

// ── 1. parity ────────────────────────────────────────────────────────────────

test("every meta has exactly one grader with the same id and kind, and vice versa", () => {
  assert.ok(systemsChallenges.length >= 7, "the group ships at least 7 challenges");
  const metaIds = systemsChallenges.map((c) => c.id);
  const graderIds = systemsGraders.map((g) => g.id);
  assert.equal(new Set(metaIds).size, metaIds.length, "duplicate meta ids");
  assert.equal(new Set(graderIds).size, graderIds.length, "duplicate grader ids");
  assert.deepEqual([...metaIds].sort(), [...graderIds].sort());
  for (const g of systemsGraders) assert.equal(systemsChallenges.find((c) => c.id === g.id)?.kind, g.kind, `kind of ${g.id}`);
  assert.deepEqual(systemsReferences.map((r) => r.id).sort(), [...metaIds].sort(), "one reference per challenge");
});

test("every grader is well formed", () => {
  for (const g of systemsGraders) {
    if (g.kind === "flag") {
      assert.match(g.flagHash, /^[0-9a-f]{64}$/, `${g.id}: flagHash`);
      continue;
    }
    assert.ok(g.tests.length >= 5 && g.tests.length <= 20, `${g.id}: 5..20 tests`);
    assert.equal(new Set(g.tests.map((t) => t.name)).size, g.tests.length, `${g.id}: test names are unique`);
    const hidden = g.tests.filter((t) => t.hidden).length;
    const visible = g.tests.length - hidden;
    assert.ok(visible >= 2 && visible <= 3, `${g.id}: 2-3 visible tests (has ${visible})`);
    assert.ok(hidden >= 3, `${g.id}: at least 3 hidden tests (has ${hidden})`);
    for (const t of g.tests) {
      assert.ok(t.expected.trim().length > 0, `${g.id}/${t.name}: empty expectation`);
      if (t.mode === "float") assert.ok(typeof t.epsilon === "number" && t.epsilon > 0, `${g.id}/${t.name}: float needs epsilon`);
    }
    if (g.kind === "code") {
      for (const [lang, template] of Object.entries(g.harness)) {
        assert.ok((LANG_IDS as readonly string[]).includes(lang), `${g.id}: unknown harness language ${lang}`);
        assert.equal(template?.split("{{CODE}}").length, 2, `${g.id}/${lang}: exactly one {{CODE}}`);
      }
      for (const lang of REQUIRED_LANGS) assert.ok(g.harness[lang], `${g.id}: harness for ${lang}`);
    }
  }
});

// ── 2. metadata ──────────────────────────────────────────────────────────────

test("metadata follows the authoring rubric", () => {
  for (const c of systemsChallenges) {
    const at = `challenge ${c.id}`;
    assert.ok(SYSTEMS_TRACKS.has(c.track) && ROADMAP_IDS.has(c.track), `${at}: track ${c.track}`);
    assert.match(c.id, /^[a-z0-9][a-z0-9-]{0,63}$/, `${at}: id shape`);
    assert.ok(c.id.startsWith(PREFIX[c.track]), `${at}: id must start with ${PREFIX[c.track]}`);
    assert.ok([1, 2, 3, 4].includes(c.difficulty), `${at}: difficulty`);
    const [lo, hi] = POINTS[c.difficulty];
    assert.ok(c.points >= lo && c.points <= hi, `${at}: ${c.points} points outside ${lo}..${hi} for difficulty ${c.difficulty}`);
    assert.ok(Number.isInteger(c.estMinutes) && c.estMinutes >= 5 && c.estMinutes <= 120, `${at}: estMinutes`);
    assert.match(c.topic, /^[a-z0-9-]+$/, `${at}: topic tag`);
    assert.ok(c.tags && c.tags.length >= 2, `${at}: tags`);
    for (const field of ["title", "summary", "description"] as const) {
      assert.ok(c[field].en.trim().length > 0 && c[field].ar.trim().length > 0, `${at}: ${field} must be bilingual`);
    }
    assert.ok(/[؀-ۿ]/.test(c.title.ar) && /[؀-ۿ]/.test(c.summary.ar) && /[؀-ۿ]/.test(c.description.ar), `${at}: Arabic text must contain Arabic script`);
    assert.ok(c.description.en.length >= 400 && c.description.ar.length >= 300, `${at}: description is too thin`);
    assert.ok(c.addedAt === undefined || /^\d{4}-\d{2}-\d{2}$/.test(c.addedAt), `${at}: addedAt`);

    const hints = c.hints ?? [];
    assert.ok(hints.length >= 2 && hints.length <= 3, `${at}: 2-3 hints`);
    let prev = 0;
    for (const h of hints) {
      assert.ok(h.text.en.trim() && h.text.ar.trim(), `${at}: hint must be bilingual`);
      assert.ok(Number.isInteger(h.cost) && h.cost > prev, `${at}: hint costs must increase strictly`);
      prev = h.cost;
    }
    assert.ok(hints.reduce((s, h) => s + h.cost, 0) <= c.points * 0.4, `${at}: hints cost more than 40% of the points`);

    assert.ok(c.lessons && c.lessons.length >= 1, `${at}: lessons`);
    for (const key of c.lessons ?? []) {
      assert.match(key, /^[a-z-]+\/[a-z0-9-]+$/, `${at}: lesson ref ${key}`);
      const [track, lesson] = key.split("/");
      assert.ok(ROADMAP_IDS.has(track), `${at}: lesson track ${track}`);
      assert.ok(hasLesson(track, lesson), `${at}: lesson ${key} does not exist`);
    }

    if (c.kind === "flag") {
      assert.equal(c.flagFormat, "IMB{...}", `${at}: flagFormat`);
      assert.ok(c.files && c.files.length >= 1, `${at}: flag challenges need puzzle files`);
      assert.equal(c.starterCode, undefined, `${at}: no starter code for flags`);
    } else {
      assert.equal(c.flagFormat, undefined, `${at}: flagFormat is for flags only`);
      assert.ok(c.lang && (LANG_IDS as readonly string[]).includes(c.lang), `${at}: lang`);
      const starters = Object.keys(c.starterCode ?? {}) as LangId[];
      assert.ok(starters.length >= 2 && starters.includes("python"), `${at}: starter code for python and one more language`);
      const allowed = c.allowedLangs;
      for (const l of starters) {
        assert.ok((LANG_IDS as readonly string[]).includes(l), `${at}: unknown starter language ${l}`);
        if (allowed) assert.ok(allowed.includes(l), `${at}: starter ${l} is not in allowedLangs`);
        assert.ok(!c.starterCode?.[l]?.includes("{{CODE}}"), `${at}: the harness sentinel must not appear in starters`);
      }
      assert.ok(allowed === undefined || allowed.includes(c.lang as LangId), `${at}: lang in allowedLangs`);
      assert.ok(c.sampleInput && c.sampleInput.length > 0, `${at}: sampleInput`);
      if (c.kind === "code") assert.ok(allowed && allowed.length >= 2, `${at}: code challenges list the harnessed languages`);
    }
    for (const f of c.files ?? []) assert.ok(f.name && f.content.length > 0, `${at}: file ${f.name}`);
  }
});

test("difficulty and kinds are spread across the group", () => {
  const count = (pred: (c: ChallengeMeta) => boolean) => systemsChallenges.filter(pred).length;
  for (const track of SYSTEMS_TRACKS) assert.equal(count((c) => c.track === track), 2, `two challenges in ${track}`);
  assert.ok(count((c) => c.difficulty === 1) >= 2, "easy entries");
  assert.ok(count((c) => c.difficulty === 2) >= 2, "medium entries");
  assert.ok(count((c) => c.difficulty >= 3) >= 1, "hard entries");
  for (const kind of ["flag", "output", "code"] as const) assert.ok(count((c) => c.kind === kind) >= 1, `at least one ${kind} challenge`);
});

// ── 3. secret safety ─────────────────────────────────────────────────────────

const SOURCES = ["data/challenges/systems.ts", "worker/src/graders/data/systems.ts"].map((p) => ({ p, text: readFileSync(new URL(`../../${p}`, import.meta.url), "utf8") }));

test("no flag plaintext in meta, grader or their source files; hashes match", () => {
  const flagIds = systemsChallenges.filter((c) => c.kind === "flag").map((c) => c.id);
  assert.ok(flagIds.length >= 1);
  for (const id of flagIds) {
    const ref = refOf(id);
    assert.ok(ref?.flag, `${id}: reference flag`);
    const flag = ref.flag;
    assert.match(flag, /^IMB\{[A-Za-z0-9_-]{16,}\}$/, `${id}: flag shape`);
    const inner = flag.slice(4, -1);
    const meta = systemsChallenges.find((c) => c.id === id) as ChallengeMeta;
    const grader = graderOf(id) as FlagGrader;
    for (const s of [...strings(meta), ...strings(grader), ...SOURCES.map((x) => x.text)]) {
      assert.ok(!s.includes(flag) && !s.includes(inner), `${id}: flag leaked`);
    }
    assert.match(grader.flagHash, /^[0-9a-f]{64}$/);
    assert.notEqual(grader.flagHash, sha256(flag.toLowerCase()), `${id}: flags are case-sensitive`);
    assert.ok(!grader.caseInsensitive, `${id}: random flags are case-sensitive`);
  }
});

test("no hidden test data is copied into the public metadata", () => {
  for (const { meta, grader } of testGraders()) {
    const pub = strings(meta).join("\n");
    for (const t of grader.tests.filter((x) => x.hidden)) {
      assert.ok(t.stdin.trim().length > 0, `${meta.id}/${t.name}: hidden tests need input`);
      assert.ok(!pub.includes(t.stdin.trim()) || t.stdin.trim().length < 12, `${meta.id}: hidden stdin of "${t.name}" is in the meta`);
      const shownByVisible = grader.tests.some((v) => !v.hidden && v.expected.trim() === t.expected.trim()); // e.g. a fixed error line
      assert.ok(!pub.includes(t.expected.trim()) || t.expected.trim().length < 12 || shownByVisible, `${meta.id}: hidden expectation of "${t.name}" is in the meta`);
    }
    // The statement and sampleInput show the visible tests, which are public by design.
    const first = grader.tests.find((t) => !t.hidden);
    assert.ok(first, `${meta.id}: a visible test`);
    assert.equal(meta.sampleInput, first.stdin, `${meta.id}: sampleInput is the first visible test`);
    for (const lang of ["en", "ar"] as const) assert.ok(meta.description[lang].includes(first.stdin.trim()), `${meta.id}: ${lang} statement shows the sample input`);
  }
  for (const c of systemsChallenges) {
    for (const s of strings(c)) assert.ok(!/IMB\{(?!\.\.\.\})/.test(s), `${c.id}: a flag-looking string in the public meta`);
  }
});

// ── 4/5. references: flags, starters, solutions, harnesses ───────────────────

test("flag solvers DERIVE a flag whose SHA-256 equals the grader's flagHash", async () => {
  for (const c of systemsChallenges.filter((x) => x.kind === "flag")) {
    const solver = systemsFlagSolvers[c.id];
    assert.ok(solver, `${c.id}: solver`);
    const flag = solver(c.files ?? []);
    const grader = graderOf(c.id) as FlagGrader;
    assert.equal(sha256(flag), grader.flagHash, `${c.id}: solver output does not match flagHash`);
    assert.equal(refOf(c.id)?.flag, flag, `${c.id}: reference flag is the derived one`);
    assert.equal(await gradeFlag(grader, flag), true, `${c.id}: real engine accepts it`);
    assert.equal(await gradeFlag(grader, ` ${flag}\n`), true, `${c.id}: engine trims`);
    assert.equal(await gradeFlag(grader, flag.toLowerCase() === flag ? flag.toUpperCase() : flag.toLowerCase()), false, `${c.id}: case matters`);
    assert.equal(await gradeFlag(grader, "IMB{wrong}"), false);
  }
});

test("solvers fail on tampered puzzle files (the flag is not a constant)", () => {
  for (const c of systemsChallenges.filter((x) => x.kind === "flag")) {
    // Shift every hex digit of the dump columns (not the offsets, not the ASCII column): a different capture.
    const bump = (d: string) => ((parseInt(d, 16) + 1) % 16).toString(16);
    const tampered = (c.files ?? []).map((f) => ({ ...f, content: f.content.replace(/^([0-9a-f]{8} {2})([^|]*)/gm, (_m, offset: string, hex: string) => offset + hex.replace(/[0-9a-f]/g, bump)) }));
    assert.ok(tampered.some((f, i) => f.content !== (c.files ?? [])[i].content), `${c.id}: the tamper step must change the files`);
    let derived: string | null = null;
    try {
      derived = systemsFlagSolvers[c.id](tampered);
    } catch {
      derived = null;
    }
    assert.notEqual(derived === null ? null : sha256(derived), (graderOf(c.id) as FlagGrader).flagHash, `${c.id}: solver ignores the puzzle files`);
  }
});

test("every reference solution passes ALL tests in each of its languages, within the time budget", () => {
  for (const { meta, grader } of testGraders()) {
    const ref = refOf(meta.id);
    assert.ok(ref?.solutions, `${meta.id}: solutions`);
    const langs = Object.keys(ref.solutions) as LangId[];
    for (const l of REQUIRED_LANGS) assert.ok(langs.includes(l), `${meta.id}: reference in ${l}`);
    for (const lang of langs) {
      if (!REQUIRED_LANGS.includes(lang) && !localSupports(lang)) continue;
      const built = buildProgram(grader, lang, ref.solutions[lang] as string);
      assert.ok(built.ok, `${meta.id}/${lang}: ${built.ok ? "" : built.reason}`);
      for (const t of grader.tests) {
        const t0 = Date.now();
        const r = runLocal(lang, built.program, t.stdin);
        const ms = Date.now() - t0;
        assert.equal(r.exitCode, 0, `${meta.id}/${lang}/${t.name}: exit ${r.exitCode}\n${r.stderr.slice(0, 400)}`);
        assert.ok(ms < 2000, `${meta.id}/${lang}/${t.name}: took ${ms} ms`);
        assert.ok(matchOutput(r.stdout, t.expected, t.mode ?? "trim", t.epsilon ?? 1e-6), `${meta.id}/${lang}/${t.name}: wrong output\n--- expected\n${t.expected}\n--- actual\n${r.stdout}`);
      }
    }
  }
});

test("the REAL grader engine accepts every reference and rejects every untouched starter", async () => {
  for (const { meta, grader } of testGraders()) {
    const ref = refOf(meta.id);
    for (const [lang, code] of Object.entries(ref?.solutions ?? {}) as Array<[LangId, string]>) {
      if (!REQUIRED_LANGS.includes(lang) && !localSupports(lang)) continue;
      const built = buildProgram(grader, lang, code);
      assert.ok(built.ok);
      const out = await gradeTests(grader, lang, built.program, localRun);
      assert.equal(out.kind, "graded", `${meta.id}/${lang}`);
      if (out.kind === "graded") assert.equal(out.grade.passed, true, `${meta.id}/${lang}: ${out.grade.feedback} ${JSON.stringify(out.grade.tests.filter((t) => !t.passed))}`);
    }
    for (const [lang, starter] of Object.entries(meta.starterCode ?? {}) as Array<[LangId, string]>) {
      if (!REQUIRED_LANGS.includes(lang) && !localSupports(lang)) continue;
      const built = buildProgram(grader, lang, starter);
      assert.ok(built.ok, `${meta.id}/${lang}: starter must be accepted by the harness`);
      const out = await gradeTests(grader, lang, built.program, localRun);
      assert.equal(out.kind, "graded", `${meta.id}/${lang}: starter`);
      if (out.kind === "graded") assert.equal(out.grade.passed, false, `${meta.id}/${lang}: the untouched starter must FAIL`);
    }
  }
});

test("hard-coding the visible examples does not pass (hidden tests differ in shape)", async () => {
  for (const { meta, grader } of testGraders()) {
    if (meta.kind !== "output") continue; // code challenges are covered by the starter check above
    const visible = grader.tests.filter((t) => !t.hidden);
    // JSON string escapes are valid Python string-literal escapes.
    const table = `[${visible.map((t) => `(${JSON.stringify(t.stdin)}, ${JSON.stringify(t.expected)})`).join(", ")}]`;
    const code = `import sys\ndata = sys.stdin.read()\nfor stdin, out in ${table}:\n    if stdin == data:\n        sys.stdout.write(out)\n`;
    const built = buildProgram(grader, "python", code);
    assert.ok(built.ok);
    const out = await gradeTests(grader, "python", built.program, localRun);
    assert.equal(out.kind, "graded");
    if (out.kind === "graded") assert.equal(out.grade.passed, false, `${meta.id}: a lookup table of the visible tests must not pass`);
  }
});
