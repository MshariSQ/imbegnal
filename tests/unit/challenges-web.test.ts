// Authoring tests for the "web" challenge group (frontend, backend, ui-ux): public metadata, server-only graders and the
// reference solutions are checked together. References run with the host toolchains (tests/helpers/exec-local.ts, NOT a
// sandbox) both directly and through the production grader engine, so harness substitution and match modes are exactly
// what the Worker uses.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { webChallenges } from "../../data/challenges/web";
import { roadmaps } from "../../data/roadmaps";
import { hasLesson } from "../../data/lessons";
import { webGraders } from "../../worker/src/graders/data/web";
import { webMistakes, webReferences } from "../fixtures/challenge-references/web";
import type { ChallengeGrader, ChallengeMeta, HarnessGrader, OutputGrader } from "../../shared/challenges";
import { LANG_IDS, type LangId } from "../../shared/languages";
import { matchOutput } from "../../shared/match";
import type { RunResult } from "../../shared/protocol";
import { buildProgram, gradeTests, type RunFn } from "../../worker/src/graders/engine";
import { localSupports, runLocal } from "../helpers/exec-local";

const ARABIC = /[؀-ۿ]/;
const POINTS_BY_DIFFICULTY: Record<number, [number, number]> = { 1: [50, 50], 2: [100, 150], 3: [200, 300], 4: [400, 500] };
/** Every test of a reference must finish well under this (the runner limit is 5 s; the brief asks for 2 s). */
const MAX_TEST_MS = 2_000;

type TestGrader = OutputGrader | HarnessGrader;
const isTestGrader = (g: ChallengeGrader): g is TestGrader => g.kind === "output" || g.kind === "code";
const graderOf = (id: string) => webGraders.find((g) => g.id === id);
const referenceOf = (id: string) => webReferences.find((r) => r.id === id);

/** Every string value anywhere inside `value`. */
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

/** The engine's RunFn, executed with the host toolchains. */
const localRun: RunFn = async ({ lang, code, stdin }) => {
  const started = Date.now();
  const r = runLocal(lang, code, stdin, 10_000);
  const result: RunResult = {
    jobId: "local",
    status: r.timedOut ? "timeout" : r.exitCode === 0 ? "ok" : "runtime_error",
    exitCode: r.exitCode,
    stdout: r.stdout,
    stderr: r.stderr,
    stdoutBytes: Buffer.byteLength(r.stdout),
    stderrBytes: Buffer.byteLength(r.stderr),
    truncated: { stdout: false, stderr: false },
    runMs: Date.now() - started,
    compileMs: 0,
  };
  return result;
};

test("web challenges: at least one challenge per track of the group", () => {
  const tracks = new Set(webChallenges.map((c) => c.track));
  for (const t of ["frontend", "backend", "ui-ux"]) assert.ok(tracks.has(t), `no challenge for ${t}`);
});

test("every meta has exactly one grader with the same id and kind, and vice versa", () => {
  const metaIds = webChallenges.map((c) => c.id);
  const graderIds = webGraders.map((g) => g.id);
  assert.equal(new Set(metaIds).size, metaIds.length, "duplicate meta ids");
  assert.equal(new Set(graderIds).size, graderIds.length, "duplicate grader ids");
  assert.deepEqual([...metaIds].sort(), [...graderIds].sort());
  for (const c of webChallenges) assert.equal(graderOf(c.id)?.kind, c.kind, `${c.id}: kind`);
  assert.deepEqual([...webReferences.map((r) => r.id)].sort(), [...metaIds].sort(), "every challenge needs a reference");
});

const roadmapIds = new Set(roadmaps.map((r) => r.id));
const prefixes: Record<string, string> = { frontend: "fe-", backend: "be-", "ui-ux": "ux-" };

for (const c of webChallenges) {
  test(`${c.id}: metadata is complete and consistent`, () => {
    assert.match(c.id, /^[a-z0-9][a-z0-9-]{0,63}$/);
    assert.ok(roadmapIds.has(c.track), `track ${c.track} is not a roadmap id`);
    assert.ok(c.id.startsWith(prefixes[c.track] ?? "\0"), `id prefix for track ${c.track}`);
    assert.ok(c.topic.trim().length > 0 && (c.tags?.length ?? 0) > 0, "topic and tags");
    for (const field of ["title", "summary", "description"] as const) {
      assert.ok(c[field].en.trim().length > 0, `${field}.en`);
      assert.ok(ARABIC.test(c[field].ar), `${field}.ar must be written in Arabic`);
    }
    assert.ok(c.title.en.length <= 60 && c.summary.en.length <= 260, "title/summary length");
    assert.ok(c.description.en.length > 400 && c.description.ar.length > 300, "description is a real statement");
    assert.ok(/```/.test(c.description.en) && /```/.test(c.description.ar), "statement has a worked example in both languages");

    const [lo, hi] = POINTS_BY_DIFFICULTY[c.difficulty];
    assert.ok(c.points >= lo && c.points <= hi, `points ${c.points} outside ${lo}-${hi} for difficulty ${c.difficulty}`);
    assert.ok(Number.isInteger(c.estMinutes) && c.estMinutes >= 5 && c.estMinutes <= 120, "estMinutes");
    assert.match(c.addedAt ?? "", /^\d{4}-\d{2}-\d{2}$/);

    const hints = c.hints ?? [];
    assert.ok(hints.length >= 2 && hints.length <= 3, "2-3 hints");
    let total = 0;
    let previous = 0;
    for (const h of hints) {
      assert.ok(h.text.en.trim() && ARABIC.test(h.text.ar), "hints are bilingual");
      assert.ok(Number.isInteger(h.cost) && h.cost > 0 && h.cost >= previous, "hint costs are positive and non-decreasing");
      previous = h.cost;
      total += h.cost;
    }
    assert.ok(total <= c.points * 0.4, `hints cost ${total} > 40% of ${c.points}`);

    for (const l of c.lessons ?? []) {
      assert.match(l, /^[a-z-]+\/[a-z0-9-]+$/, `lesson ref ${l}`);
      const [track, lesson] = l.split("/");
      assert.ok(roadmapIds.has(track), `lesson track of ${l}`);
      // Lessons of the specialty tracks are authored in parallel; existing tracks must resolve.
      if (["frontend", "backend", "ui-ux"].includes(track)) assert.ok(hasLesson(track, lesson), `unknown lesson ${l}`);
    }
    assert.equal(new Set(c.tags).size, c.tags?.length, "duplicate tags");

    if (c.kind === "flag") {
      assert.equal(c.flagFormat, "IMB{...}");
      assert.ok((c.files?.length ?? 0) > 0, "flag challenges ship their puzzle material in files");
      assert.equal(c.starterCode, undefined);
    } else {
      assert.equal(c.flagFormat, undefined);
      assert.ok(c.lang && (LANG_IDS as readonly string[]).includes(c.lang), "default lang");
      assert.ok(c.sampleInput && c.sampleInput.endsWith("\n"), "sampleInput");
      const starters = Object.keys(c.starterCode ?? {});
      assert.ok(starters.length >= 2 && starters.includes("python"), "starter code for python and one more language");
      for (const lang of starters) {
        assert.ok((LANG_IDS as readonly string[]).includes(lang), `unknown starter language ${lang}`);
        if (c.allowedLangs) assert.ok(c.allowedLangs.includes(lang as LangId), `starter ${lang} not in allowedLangs`);
      }
      if (c.allowedLangs) assert.ok(c.allowedLangs.includes(c.lang), "lang is allowed");
    }
  });
}

test("ids are unique across the whole challenge registry", async () => {
  const { challenges } = await import("../../data/challenges");
  const ids = challenges.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate challenge ids across authors");
});

// ── Secret safety ─────────────────────────────────────────────────────────────

for (const g of webGraders) {
  const meta = webChallenges.find((c) => c.id === g.id) as ChallengeMeta;
  test(`${g.id}: no grader secret leaks into the public metadata`, () => {
    const publicStrings = strings(meta);
    if (g.kind === "flag") {
      assert.match(g.flagHash, /^[0-9a-f]{64}$/);
      const flag = referenceOf(g.id)?.flag;
      assert.ok(flag && /^IMB\{[^}]+\}$/.test(flag), "the vault must provide the plaintext flag");
      for (const s of [...publicStrings, ...strings(g)]) assert.ok(!s.includes(flag), `${g.id}: plaintext flag found in data/worker strings`);
      for (const s of publicStrings) assert.ok(!s.includes(g.flagHash), "flag hash leaked into the meta");
      return;
    }
    assert.ok(isTestGrader(g));
    const hidden = g.tests.filter((t) => t.hidden);
    const visible = g.tests.filter((t) => !t.hidden);
    assert.ok(visible.length >= 2 && visible.length <= 3, `${g.id}: needs 2-3 visible tests`);
    assert.ok(hidden.length >= 3, `${g.id}: needs at least 3 hidden tests`);
    assert.ok(g.tests.length <= 20, "the engine ignores tests beyond 20");
    for (const t of hidden) {
      for (const secret of [t.stdin.trim(), t.expected.trim()]) {
        if (secret.length < 12) continue; // too short to be a meaningful leak
        for (const s of publicStrings) assert.ok(!s.includes(secret), `${g.id}: hidden test "${t.name}" is copied into the meta`);
      }
    }
    // Visible tests are the statement's examples: the first one is spelled out in the English description.
    if (g.kind === "output") {
      assert.ok(meta.description.en.includes(visible[0].stdin.trim()), "first visible input appears in the statement");
      assert.ok(meta.description.en.includes(visible[0].expected.trim()), "first visible expected output appears in the statement");
    } else {
      // Code challenges show the calls, not the driver's stdin: every expected result line is spelled out.
      for (const line of visible[0].expected.split("\n")) assert.ok(meta.description.en.includes(line.trim()), `statement shows the result "${line}"`);
      assert.equal(meta.sampleInput, visible[0].stdin, "sampleInput is the first visible test's stdin");
    }
    assert.equal(new Set(g.tests.map((t) => t.name)).size, g.tests.length, "duplicate test names");
  });
}

// ── References ────────────────────────────────────────────────────────────────

for (const ref of webReferences) {
  const grader = graderOf(ref.id);
  const meta = webChallenges.find((c) => c.id === ref.id);

  if (grader?.kind === "flag") {
    test(`${ref.id}: the reference derives the flag whose SHA-256 is the grader's flagHash`, () => {
      assert.ok(ref.flag, "flag reference");
      assert.equal(createHash("sha256").update(ref.flag).digest("hex"), grader.flagHash);
    });
    continue;
  }
  if (!grader || !isTestGrader(grader) || !meta) continue;

  const langs = Object.keys(ref.solutions ?? {}) as LangId[];
  test(`${ref.id}: references exist for python and javascript`, () => {
    assert.ok(langs.includes("python") && langs.includes("javascript"));
    if (grader.kind === "code") for (const l of langs) assert.ok(grader.harness[l], `harness for ${l}`);
    for (const l of meta.allowedLangs ?? []) assert.ok(grader.kind !== "code" || grader.harness[l], `harness for allowed ${l}`);
  });

  for (const lang of langs) {
    const solution = ref.solutions?.[lang] as string;
    const skip = localSupports(lang) ? false : `no ${lang} toolchain on this machine`;

    test(`${ref.id} [${lang}]: reference passes every test (hidden included), each under ${MAX_TEST_MS} ms`, { skip }, () => {
      const built = buildProgram(grader, lang, solution);
      assert.ok(built.ok, "harness/program builds");
      for (const t of grader.tests) {
        const started = Date.now();
        const r = runLocal(lang, built.program, t.stdin);
        const ms = Date.now() - started;
        assert.equal(r.exitCode, 0, `${t.name}: exit ${r.exitCode}\n${r.stderr}`);
        assert.ok(matchOutput(r.stdout, t.expected, t.mode ?? "trim", t.epsilon ?? 1e-6), `${t.name}: wrong output\n${r.stdout}\n--- expected\n${t.expected}`);
        assert.ok(ms < MAX_TEST_MS, `${t.name}: took ${ms} ms`);
      }
    });

    test(`${ref.id} [${lang}]: the production grader engine accepts the reference`, { skip }, async () => {
      const built = buildProgram(grader, lang, solution);
      assert.ok(built.ok);
      const outcome = await gradeTests(grader, lang, built.program, localRun);
      assert.equal(outcome.kind, "graded");
      if (outcome.kind !== "graded") return;
      assert.deepEqual(outcome.grade.tests.filter((t) => !t.passed), []);
      assert.equal(outcome.grade.passed, true);
      assert.equal(outcome.grade.score, 1);
    });
  }

  for (const [lang, starter] of Object.entries(meta.starterCode ?? {}) as [LangId, string][]) {
    const skip = localSupports(lang) ? false : `no ${lang} toolchain on this machine`;
    test(`${ref.id} [${lang}]: the untouched starter code fails the grader`, { skip }, async () => {
      const built = buildProgram(grader, lang, starter);
      assert.ok(built.ok, "starter code builds into a program (harness exists for every starter language)");
      const outcome = await gradeTests(grader, lang, built.program, localRun);
      assert.equal(outcome.kind, "graded");
      if (outcome.kind !== "graded") return;
      assert.equal(outcome.grade.passed, false, "starter code must not solve the challenge");
      assert.ok(outcome.grade.tests.some((t) => !t.passed));
    });
  }

  test(`${ref.id}: tests are not trivially satisfiable (distinct expected outputs, no empty stdout)`, () => {
    const expected = new Set(grader.tests.map((t) => t.expected.trim()));
    assert.ok(expected.size >= Math.min(3, grader.tests.length), "several distinct expected outputs");
    for (const t of grader.tests) assert.ok(t.expected.trim().length > 0, `${t.name}: empty expectation`);
  });
}

// ── The hidden tests discriminate: classic mistakes must fail ─────────────────

for (const m of webMistakes) {
  const grader = graderOf(m.id);
  const reference = referenceOf(m.id)?.solutions?.python;
  test(`${m.id}: the mistake "${m.label}" is caught`, { skip: localSupports("python") ? false : "no python toolchain on this machine" }, async () => {
    assert.ok(grader && isTestGrader(grader) && reference, "known challenge with a python reference");
    let mutated = reference;
    for (const [from, to] of m.edits) {
      assert.ok(mutated.includes(from), `edit target not found in the reference: ${from}`);
      mutated = mutated.replace(from, () => to);
    }
    assert.notEqual(mutated, reference);
    const built = buildProgram(grader, "python", mutated);
    assert.ok(built.ok);
    const outcome = await gradeTests(grader, "python", built.program, localRun);
    assert.equal(outcome.kind, "graded");
    if (outcome.kind !== "graded") return;
    assert.equal(outcome.grade.passed, false, `"${m.label}" must not pass the grader`);
    assert.ok(outcome.grade.tests.some((t) => t.hidden && !t.passed) || outcome.grade.tests.some((t) => !t.passed));
  });
}
