/**
 * Content verification for the Reverse Engineering track.
 *
 * (a) every lesson loaded through the registry fragment is structurally valid (bilingual,
 *     quiz well-formed, honest estMinutes, node exists),
 * (b) every lab `solution` passes every visible test, graded with the same `matchOutput`
 *     the Worker uses,
 * (c) every untouched `starterCode` fails at least one test (so a lab cannot be "passed" by doing nothing),
 * (d) every runnable code-demo snippet (python / js) executes without error.
 *
 * Execution uses the host toolchain (tests/helpers/exec-local.ts, not sandboxed); languages whose
 * toolchain is missing are skipped. Only code committed in this repository is executed.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { reverseEngineeringLessons } from "../../data/lessons/reverse-engineering";
import { reverseEngineeringNodes } from "../../data/roadmap-nodes/reverse-engineering";
import type { L10n, LabExerciseSection, Lesson } from "../../data/lessons/types";
import { LANG_IDS, type LangId } from "../../shared/languages";
import { matchOutput } from "../../shared/match";
import { localSupports, runLocal } from "../helpers/exec-local";

const TRACK = "reverse-engineering";

/** Languages the brief allows for labs (all verifiable on a typical dev machine). */
const LAB_LANGS: readonly LangId[] = ["python", "javascript", "typescript", "java", "c", "cpp", "go", "rust", "ruby", "php", "bash"];
/** Languages without a compile step: a single run is a fair measure of "well under 2 s". */
const INTERPRETED: readonly LangId[] = ["python", "javascript", "typescript", "ruby", "php", "bash"];

const ARABIC = /[؀-ۿ]/;
const LATIN_WORD = /[A-Za-z]{3,}/;

const lessonKeys = Object.keys(reverseEngineeringLessons).sort();

async function loadLesson(key: string): Promise<Lesson> {
  const loader = reverseEngineeringLessons[key];
  assert.ok(loader, `no loader for ${key}`);
  return (await loader()).lesson;
}

function isL10n(v: unknown): v is L10n {
  return typeof v === "object" && v !== null && "en" in v && "ar" in v && Object.keys(v).length === 2;
}

/** Collects every L10n in a value, with a readable path for failure messages. */
function collectL10n(value: unknown, path: string, out: { path: string; text: L10n }[] = []): { path: string; text: L10n }[] {
  if (isL10n(value)) {
    out.push({ path, text: value });
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => collectL10n(v, `${path}[${i}]`, out));
  } else if (typeof value === "object" && value !== null) {
    for (const [k, v] of Object.entries(value)) collectL10n(v, `${path}.${k}`, out);
  }
  return out;
}

/** Same formula the lessons were authored with: reading time + demos + labs + quiz. */
function expectedMinutes(lesson: Lesson): number {
  let words = 0;
  let demos = 0;
  let labs = 0;
  let questions = 0;
  for (const s of lesson.sections) {
    if (s.type === "text") words += s.body.en.split(/\s+/).filter(Boolean).length;
    else if (s.type === "code-demo") demos++;
    else if (s.type === "lab") {
      labs++;
      words += Math.floor(s.prompt.en.split(/\s+/).filter(Boolean).length / 2);
    } else if (s.type === "quiz") questions += s.questions.length;
  }
  return words / 170 + 2 * demos + 8 * labs + 0.75 * questions;
}

function labsOf(lesson: Lesson): LabExerciseSection[] {
  return lesson.sections.filter((s): s is LabExerciseSection => s.type === "lab");
}

function passes(lab: LabExerciseSection, code: string): { failed: string[]; unsupported: boolean; slowMs: number } {
  const failed: string[] = [];
  let slowMs = 0;
  for (const t of lab.tests) {
    const started = Date.now();
    const r = runLocal(lab.lang, code, t.stdin ?? "");
    slowMs = Math.max(slowMs, Date.now() - started);
    if (r.unsupported) return { failed, unsupported: true, slowMs };
    const ok = r.exitCode === 0 && !r.timedOut && matchOutput(r.stdout, t.expected, t.mode, t.epsilon);
    if (!ok) failed.push(t.name.en);
  }
  return { failed, unsupported: false, slowMs };
}

test("the track plan: 8 nodes in study order, unique ids, legal node is required", () => {
  const ids = reverseEngineeringNodes.map((n) => n.id);
  assert.deepEqual(ids, [
    "how-programs-run",
    "assembly-basics",
    "static-analysis-deobfuscation",
    "debugging-dynamic-analysis",
    "binary-formats-tools",
    "malware-analysis-basics",
    "legal-ethics-reporting",
    "anti-reversing-tricks",
  ]);
  assert.equal(new Set(ids).size, ids.length);
  const status = Object.fromEntries(reverseEngineeringNodes.map((n) => [n.id, n.status]));
  assert.equal(status["legal-ethics-reporting"], "required");
  assert.equal(status["malware-analysis-basics"], "optional");
  assert.equal(status["anti-reversing-tricks"], "optional");
  assert.equal(status["binary-formats-tools"], "important");
  for (const id of ["how-programs-run", "assembly-basics", "static-analysis-deobfuscation", "debugging-dynamic-analysis"]) {
    assert.equal(status[id], "required", id);
  }
});

test("nodes: precise 1-3 sentence descriptions and well-formed resources", () => {
  for (const n of reverseEngineeringNodes) {
    assert.ok(n.label.trim().length > 0, `${n.id}: label`);
    assert.doesNotMatch(n.description, /coming soon|lorem/i, `${n.id}: placeholder text`);
    const sentences = n.description.split(/(?<=[.!?])\s+/).filter(Boolean);
    assert.ok(sentences.length >= 1 && sentences.length <= 3, `${n.id}: description has ${sentences.length} sentences`);
    for (const [kind, r] of Object.entries(n.resources)) {
      assert.ok(r.title.trim().length > 0, `${n.id}.${kind}: title`);
      assert.match(r.url, /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/, `${n.id}.${kind}: url`);
      assert.ok(Array.isArray(r.tags), `${n.id}.${kind}: tags`);
    }
  }
});

test("registry fragment: keys are track/node-id and match the lesson's nodeId", async () => {
  assert.ok(lessonKeys.length >= 3, "the plan has at least three lessons");
  const nodeIds = new Set(reverseEngineeringNodes.map((n) => n.id));
  for (const key of lessonKeys) {
    assert.ok(key.startsWith(`${TRACK}/`), key);
    const lesson = await loadLesson(key);
    assert.equal(key, `${TRACK}/${lesson.nodeId}`);
    assert.ok(nodeIds.has(lesson.nodeId), `${key}: nodeId is not in reverseEngineeringNodes`);
  }
  assert.ok(lessonKeys.includes(`${TRACK}/how-programs-run`), "the first lesson frames law and ethics");
});

test("lesson 1 frames law, licenses and responsible disclosure before any technique", async () => {
  const lesson = await loadLesson(`${TRACK}/how-programs-run`);
  const firstTexts = lesson.sections.filter((s) => s.type === "text").slice(0, 3);
  const joined = firstTexts.map((s) => (s.type === "text" ? s.body.en : "")).join("\n");
  assert.match(joined, /written permission/i);
  assert.match(joined, /license/i);
  assert.match(joined, /coordinated disclosure/i);
  assert.match(joined, /not legal advice/i);
  const labIndex = lesson.sections.findIndex((s) => s.type === "lab");
  const rulesIndex = lesson.sections.findIndex((s) => s.type === "text" && /written permission/i.test(s.body.en));
  assert.ok(rulesIndex >= 0 && rulesIndex < labIndex, "rules of the road come before the first lab");
});

for (const key of lessonKeys) {
  test(`structure: ${key}`, async () => {
    const lesson = await loadLesson(key);
    const where = (s: string) => `${key}: ${s}`;

    // honest, bounded estimate
    assert.ok(Number.isInteger(lesson.estMinutes), where("estMinutes is an integer"));
    assert.ok(lesson.estMinutes >= 20 && lesson.estMinutes <= 60, where(`estMinutes ${lesson.estMinutes} outside 20-60`));
    const computed = expectedMinutes(lesson);
    assert.ok(
      lesson.estMinutes >= computed * 0.8 && lesson.estMinutes <= computed * 1.25,
      where(`estMinutes ${lesson.estMinutes} does not match the content (computed ${computed.toFixed(1)})`),
    );

    // bilingual: every L10n has both languages, Arabic is really Arabic, English really English
    const all = collectL10n(lesson, key);
    assert.ok(all.length > 20, where("suspiciously little content"));
    for (const { path, text } of all) {
      assert.ok(text.en.trim().length > 0, `${path}: empty en`);
      assert.ok(text.ar.trim().length > 0, `${path}: empty ar`);
      assert.ok(!ARABIC.test(text.en), `${path}: Arabic script in en`);
      if (LATIN_WORD.test(text.en)) assert.ok(ARABIC.test(text.ar), `${path}: ar has no Arabic text (copied English?)`);
    }

    // shape: opening and closing text, 1 quiz, 2-3 labs, demos only for the in-browser runtimes
    const sections = lesson.sections;
    assert.equal(sections[0].type, "text", where("opens with text"));
    assert.equal(sections[sections.length - 1].type, "text", where("closes with text"));
    const quizzes = sections.filter((s) => s.type === "quiz");
    assert.equal(quizzes.length, 1, where("exactly one quiz"));
    const labs = labsOf(lesson);
    assert.ok(labs.length >= 2 && labs.length <= 3, where(`${labs.length} labs (want 2-3)`));
    const quizIndex = sections.findIndex((s) => s.type === "quiz");
    assert.ok(sections.findIndex((s) => s.type === "lab") < quizIndex, where("labs come before the quiz"));
    const demos = sections.filter((s) => s.type === "code-demo");
    assert.ok(demos.length >= 1 && demos.length <= 2, where("1-2 code demos"));
    for (const d of demos) {
      assert.ok(d.type === "code-demo" && (d.lang === "python" || d.lang === "js"), where("demo language must be python or js"));
    }
    for (const s of sections) assert.notEqual(s.type, "exercise", where("legacy exercise sections are not used here"));

    // quiz
    const quiz = quizzes[0];
    assert.ok(quiz.type === "quiz");
    assert.equal(quiz.questions.length, 5, where("5 quiz questions"));
    for (const [i, q] of quiz.questions.entries()) {
      assert.ok(q.choices.length >= 3 && q.choices.length <= 4, where(`q${i + 1}: ${q.choices.length} choices`));
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length, where(`q${i + 1}: answer index`));
      assert.equal(new Set(q.choices.map((c) => c.en)).size, q.choices.length, where(`q${i + 1}: duplicate choices`));
      assert.ok(q.explain.en.split(/\s+/).length >= 12, where(`q${i + 1}: explanation should teach`));
    }
    const answers = new Set(quiz.questions.map((q) => q.answer));
    assert.ok(answers.size >= 2, where("the correct answer must not always be in the same position"));

    // labs: ids, languages, tests
    const labIds = labs.map((l) => l.id);
    assert.equal(new Set(labIds).size, labIds.length, where("duplicate lab ids"));
    for (const lab of labs) {
      const at = `${key}/${lab.id}`;
      assert.match(lab.id, /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, `${at}: id must be kebab-case`);
      assert.ok(LAB_LANGS.includes(lab.lang), `${at}: language ${lab.lang} is not allowed`);
      assert.ok(LANG_IDS.includes(lab.lang), `${at}: unknown language`);
      assert.ok(lab.tests.length >= 3 && lab.tests.length <= 6, `${at}: ${lab.tests.length} tests (want 3-6)`);
      assert.ok(lab.hints.length >= 2 && lab.hints.length <= 3, `${at}: ${lab.hints.length} hints (want 2-3)`);
      const names = lab.tests.map((t) => t.name.en);
      assert.equal(new Set(names).size, names.length, `${at}: duplicate test names`);
      assert.notEqual(lab.starterCode.trim(), lab.solution.trim(), `${at}: starter equals solution`);
      assert.match(lab.starterCode, /TODO/, `${at}: starter needs TODO comments`);
      assert.doesNotMatch(lab.solution, /TODO/, `${at}: solution must not contain TODO`);
      assert.ok(lab.prompt.en.length > 300, `${at}: prompt is too thin`);
      assert.match(lab.prompt.en, /Example/i, `${at}: prompt needs a worked example`);
      for (const t of lab.tests) {
        assert.equal(typeof t.expected, "string", `${at}: expected must be a string`);
        assert.ok(t.stdin === undefined || typeof t.stdin === "string", `${at}: stdin must be a string`);
      }
    }
  });
}

for (const key of lessonKeys) {
  test(`reference solutions pass every visible test: ${key}`, async (t) => {
    const lesson = await loadLesson(key);
    for (const lab of labsOf(lesson)) {
      await t.test(`${lab.id} (${lab.lang})`, { skip: !localSupports(lab.lang) ? `${lab.lang} toolchain not installed` : false }, () => {
        const r = passes(lab, lab.solution);
        assert.deepEqual(r.failed, [], `${key}/${lab.id}: failing tests`);
        if (INTERPRETED.includes(lab.lang)) assert.ok(r.slowMs < 2000, `${key}/${lab.id}: slowest run took ${r.slowMs} ms`);
      });
    }
  });

  test(`untouched starter code fails at least one test: ${key}`, async (t) => {
    const lesson = await loadLesson(key);
    for (const lab of labsOf(lesson)) {
      await t.test(`${lab.id} (${lab.lang})`, { skip: !localSupports(lab.lang) ? `${lab.lang} toolchain not installed` : false }, () => {
        // The starter must be valid code (it compiles/runs) yet not solve the task.
        const compiles = runLocal(lab.lang, lab.starterCode, lab.tests[0].stdin ?? "");
        assert.ok(!compiles.timedOut, `${key}/${lab.id}: starter timed out`);
        assert.equal(compiles.exitCode, 0, `${key}/${lab.id}: starter must compile and exit 0, got: ${compiles.stderr.slice(0, 300)}`);
        const r = passes(lab, lab.starterCode);
        assert.ok(r.failed.length >= 1, `${key}/${lab.id}: the starter code already passes every test`);
      });
    }
  });

  test(`code demos run without error: ${key}`, async (t) => {
    const lesson = await loadLesson(key);
    let n = 0;
    for (const s of lesson.sections) {
      if (s.type !== "code-demo") continue;
      n++;
      const lang: LangId = s.lang === "python" ? "python" : "javascript";
      await t.test(`demo ${n} (${s.lang})`, { skip: !localSupports(lang) ? `${lang} toolchain not installed` : false }, () => {
        const r = runLocal(lang, s.code);
        assert.equal(r.exitCode, 0, `${key} demo ${n}: ${r.stderr.slice(0, 400)}`);
        assert.ok(!r.timedOut, `${key} demo ${n}: timed out`);
        assert.ok(r.stdout.trim().length > 0, `${key} demo ${n}: a demo must print something`);
      });
    }
    assert.ok(n >= 1);
  });
}
