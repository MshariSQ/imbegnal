/**
 * Content tests for the "Operating Systems" track.
 *
 * Structure: every lesson loads through the registry fragment, is bilingual, well formed and
 * honestly timed. Behaviour: every lab reference solution passes ALL its visible tests, the
 * untouched starter code fails at least one, and every runnable code-demo executes cleanly.
 * Programs run on the host toolchain via tests/helpers/exec-local (authoring only, not sandboxed).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { operatingSystemsNodes } from "../../data/roadmap-nodes/operating-systems";
import { operatingSystemsLessons } from "../../data/lessons/operating-systems";
import type { L10n, LabExerciseSection, Lesson, LessonSection } from "../../data/lessons/types";
import { LANG_IDS } from "../../shared/languages";
import { matchOutput } from "../../shared/match";
import { localSupports, runLocal } from "../helpers/exec-local";

const TRACK = "operating-systems";
const ARABIC = /[؀-ۿ]/;
/** Languages whose toolchains are verifiable here (csharp/kotlin/swift are not). */
const LAB_LANGS = new Set(["python", "javascript", "typescript", "java", "c", "cpp", "go", "rust", "ruby", "php", "bash"]);

/** Lessons that must exist (the node-only roadmap entries have none). */
const EXPECTED_LESSONS = ["processes-threads", "cpu-scheduling", "memory-management"];

async function loadAll(): Promise<{ key: string; lesson: Lesson }[]> {
  const out: { key: string; lesson: Lesson }[] = [];
  for (const [key, load] of Object.entries(operatingSystemsLessons)) out.push({ key, lesson: (await load()).lesson });
  return out;
}

const labs = (l: Lesson) => l.sections.filter((s): s is LabExerciseSection => s.type === "lab");

function words(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

/** Honest reading + doing time: reading 200 wpm, 2 min per demo, 8 min per lab, 1 min per quiz question. */
function computedMinutes(l: Lesson): number {
  let read = 0;
  let demos = 0;
  let labCount = 0;
  let questions = 0;
  for (const s of l.sections) {
    if (s.type === "text") read += words(s.body.en);
    else if (s.type === "code-demo") {
      demos++;
      read += words(s.explanation.en);
    } else if (s.type === "lab") labCount++;
    else if (s.type === "quiz") questions += s.questions.length;
  }
  return read / 200 + 2 * demos + 8 * labCount + questions;
}

function checkL10n(label: string, v: L10n, opts: { arabicScript: boolean }) {
  assert.ok(v && typeof v.en === "string" && v.en.trim().length > 0, `${label}: empty en`);
  assert.ok(typeof v.ar === "string" && v.ar.trim().length > 0, `${label}: empty ar`);
  if (opts.arabicScript) assert.ok(ARABIC.test(v.ar), `${label}: ar has no Arabic text`);
}

/** Markdown subset guard: balanced fences, no tables, heading first. */
function checkMarkdown(label: string, md: string) {
  assert.ok(/^## \S/.test(md), `${label}: must start with a "## " heading`);
  const fences = md.split("\n").filter((l) => l.trimStart().startsWith("```")).length;
  assert.equal(fences % 2, 0, `${label}: unbalanced code fences`);
  let inFence = false;
  for (const line of md.split("\n")) {
    if (line.trimStart().startsWith("```")) inFence = !inFence;
    else if (!inFence) assert.ok(!/^\s*\|.*\|\s*$/.test(line), `${label}: tables are not supported: ${line}`);
  }
}

test("operating-systems node file lists the planned nodes in order", () => {
  assert.deepEqual(
    operatingSystemsNodes.map((n) => n.id),
    [
      "processes-threads",
      "cpu-scheduling",
      "memory-management",
      "files-linux-shell",
      "concurrency-sync",
      "file-systems",
      "virtualization-containers",
      "io-devices",
      "os-security",
    ],
  );
  const ids = new Set<string>();
  for (const n of operatingSystemsNodes) {
    assert.ok(!ids.has(n.id), `duplicate node ${n.id}`);
    ids.add(n.id);
    assert.ok(n.label.trim() && n.description.trim().length > 40, `${n.id}: label/description`);
    assert.ok(["required", "important", "optional"].includes(n.status), `${n.id}: status`);
    for (const [kind, r] of Object.entries(n.resources)) {
      assert.ok(r.title && /^https:\/\/[^\s]+$/.test(r.url) && r.tags.length > 0, `${n.id}.${kind}: resource shape`);
    }
  }
});

test("registry fragment: keys, loaders and node ids line up", async () => {
  const all = await loadAll();
  assert.deepEqual(
    all.map((a) => a.key).sort(),
    EXPECTED_LESSONS.map((id) => `${TRACK}/${id}`).sort(),
  );
  const nodeIds = new Set(operatingSystemsNodes.map((n) => n.id));
  for (const { key, lesson } of all) {
    assert.equal(key, `${TRACK}/${lesson.nodeId}`, `${key}: nodeId mismatch`);
    assert.ok(nodeIds.has(lesson.nodeId), `${key}: nodeId is not a roadmap node`);
  }
});

test("every lesson is well formed and bilingual", async () => {
  for (const { key, lesson } of await loadAll()) {
    checkL10n(`${key} title`, lesson.title, { arabicScript: true });
    assert.ok(Number.isInteger(lesson.estMinutes) && lesson.estMinutes >= 20 && lesson.estMinutes <= 60, `${key}: estMinutes ${lesson.estMinutes}`);

    const sections: LessonSection[] = lesson.sections;
    const first = sections[0];
    const last = sections[sections.length - 1];
    assert.equal(first.type, "text", `${key}: must open with text`);
    assert.equal(last.type, "text", `${key}: must close with text`);
    if (first.type === "text") assert.match(first.body.en, /^## What you'll learn/, `${key}: opening heading`);
    if (last.type === "text") assert.match(last.body.en, /^## Summary/, `${key}: closing heading`);

    const quizzes = sections.filter((s) => s.type === "quiz");
    assert.equal(quizzes.length, 1, `${key}: exactly one quiz`);
    assert.ok(labs(lesson).length >= 2 && labs(lesson).length <= 3, `${key}: 2-3 labs`);
    const demos = sections.filter((s) => s.type === "code-demo");
    assert.ok(demos.length >= 1 && demos.length <= 2, `${key}: 1-2 code demos`);

    let i = 0;
    for (const s of sections) {
      const where = `${key} section ${i++} (${s.type})`;
      switch (s.type) {
        case "text":
          checkL10n(where, s.body, { arabicScript: true });
          checkMarkdown(`${where} en`, s.body.en);
          checkMarkdown(`${where} ar`, s.body.ar);
          break;
        case "code-demo":
          assert.ok(s.lang === "python" || s.lang === "js", `${where}: lang`);
          assert.ok(s.code.trim().length > 0, `${where}: code`);
          checkL10n(`${where} explanation`, s.explanation, { arabicScript: true });
          break;
        case "quiz":
          assert.equal(s.questions.length, 5, `${where}: 5 questions`);
          for (const [qi, q] of s.questions.entries()) {
            checkL10n(`${where} q${qi}`, q.q, { arabicScript: true });
            checkL10n(`${where} q${qi} explain`, q.explain, { arabicScript: true });
            assert.ok(q.choices.length >= 3 && q.choices.length <= 4, `${where} q${qi}: 3-4 choices`);
            assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length, `${where} q${qi}: answer index`);
            q.choices.forEach((c, ci) => checkL10n(`${where} q${qi} choice ${ci}`, c, { arabicScript: false }));
            const enChoices = q.choices.map((c) => c.en);
            assert.equal(new Set(enChoices).size, enChoices.length, `${where} q${qi}: duplicate choices`);
          }
          break;
        case "lab":
          break; // checked below
        case "exercise":
          assert.fail(`${where}: use "lab" sections in this track`);
      }
    }
  }
});

test("quiz answers are not always the same position", async () => {
  for (const { key, lesson } of await loadAll()) {
    const quiz = lesson.sections.find((s) => s.type === "quiz");
    assert.ok(quiz && quiz.type === "quiz");
    const positions = new Set(quiz.questions.map((q) => q.answer));
    assert.ok(positions.size >= 3, `${key}: quiz answer positions should vary`);
  }
});

test("lab definitions are well formed", async () => {
  for (const { key, lesson } of await loadAll()) {
    const ids = new Set<string>();
    for (const lab of labs(lesson)) {
      const where = `${key}/${lab.id}`;
      assert.match(lab.id, /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, `${where}: id must be kebab-case`);
      assert.ok(!ids.has(lab.id), `${where}: duplicate lab id`);
      ids.add(lab.id);
      assert.ok((LANG_IDS as readonly string[]).includes(lab.lang) && LAB_LANGS.has(lab.lang), `${where}: lang ${lab.lang}`);
      checkL10n(`${where} prompt`, lab.prompt, { arabicScript: true });
      assert.ok(lab.starterCode.trim() && lab.solution.trim() && lab.starterCode !== lab.solution, `${where}: code`);
      assert.match(lab.starterCode, /TODO/, `${where}: starter needs TODO comments`);
      assert.ok(lab.hints.length >= 2 && lab.hints.length <= 3, `${where}: 2-3 hints`);
      lab.hints.forEach((h, i) => checkL10n(`${where} hint ${i}`, h, { arabicScript: true }));
      assert.ok(lab.tests.length >= 3 && lab.tests.length <= 6, `${where}: 3-6 tests`);
      const enNames = lab.tests.map((t) => t.name.en);
      const arNames = lab.tests.map((t) => t.name.ar);
      assert.equal(new Set(enNames).size, enNames.length, `${where}: duplicate en test names`);
      assert.equal(new Set(arNames).size, arNames.length, `${where}: duplicate ar test names`);
      lab.tests.forEach((t, i) => {
        checkL10n(`${where} test ${i}`, t.name, { arabicScript: true });
        assert.equal(typeof t.expected, "string", `${where} test ${i}: expected`);
        assert.ok(t.stdin === undefined || typeof t.stdin === "string", `${where} test ${i}: stdin`);
      });
      // No two visible tests should be identical.
      const sigs = lab.tests.map((t) => `${t.stdin ?? ""}\u0000${t.expected}`);
      assert.equal(new Set(sigs).size, sigs.length, `${where}: duplicate test cases`);
    }
  }
});

test("estMinutes matches the content (within 5 minutes of the computed reading+doing time)", async () => {
  for (const { key, lesson } of await loadAll()) {
    const raw = computedMinutes(lesson);
    assert.ok(Math.abs(lesson.estMinutes - raw) <= 5, `${key}: estMinutes ${lesson.estMinutes} but content works out to ${raw.toFixed(1)}`);
    assert.ok(lesson.estMinutes >= 30 && lesson.estMinutes <= 45, `${key}: target is 30-45 minutes, got ${lesson.estMinutes}`);
  }
});

test("every runnable code-demo executes without error", async (t) => {
  for (const { key, lesson } of await loadAll()) {
    for (const [i, s] of lesson.sections.entries()) {
      if (s.type !== "code-demo" || s.runnable === false) continue;
      const lang = s.lang === "python" ? "python" : "javascript";
      await t.test(`${key} demo #${i} (${s.lang})`, { skip: !localSupports(lang) }, () => {
        const r = runLocal(lang, s.code);
        assert.equal(r.exitCode, 0, r.stderr);
        assert.ok(!r.timedOut);
        assert.ok(r.stdout.trim().length > 0, "demo prints something");
      });
    }
  }
});

test("lab reference solutions pass every visible test; starters fail", async (t) => {
  for (const { key, lesson } of await loadAll()) {
    for (const lab of labs(lesson)) {
      const ref = `${key}/${lab.id} [${lab.lang}]`;
      await t.test(ref, { skip: !localSupports(lab.lang) }, () => {
        for (const test of lab.tests) {
          const r = runLocal(lab.lang, lab.solution, test.stdin ?? "");
          assert.equal(r.exitCode, 0, `${ref} "${test.name.en}": exit ${r.exitCode}\n${r.stderr}`);
          assert.ok(!r.timedOut, `${ref} "${test.name.en}": timed out`);
          assert.ok(
            matchOutput(r.stdout, test.expected, test.mode, test.epsilon),
            `${ref} "${test.name.en}"\n--- expected ---\n${test.expected}\n--- got ---\n${r.stdout}\n--- stderr ---\n${r.stderr}`,
          );
        }
        // The learner starts from code that compiles/runs but is not yet correct.
        let failing = 0;
        for (const test of lab.tests) {
          const r = runLocal(lab.lang, lab.starterCode, test.stdin ?? "");
          assert.ok(r.exitCode !== null || r.timedOut, `${ref}: starter must not be unsupported`);
          if (r.exitCode !== 0 || r.timedOut || !matchOutput(r.stdout, test.expected, test.mode, test.epsilon)) failing++;
        }
        assert.ok(failing >= 1, `${ref}: untouched starter code passes every test`);
        // The starter must be valid code: it has to at least build (exit code 0 on some input, or a clean run).
        const sample = runLocal(lab.lang, lab.starterCode, lab.tests[0].stdin ?? "");
        assert.ok(!/error|Traceback|SyntaxError/i.test(sample.stderr.replace(/Picked up JAVA_TOOL_OPTIONS[^\n]*\n?/g, "")) || sample.exitCode === 0, `${ref}: starter does not compile/run:\n${sample.stderr}`);
      });
    }
  }
});
