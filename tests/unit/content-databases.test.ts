import { test } from "node:test";
import assert from "node:assert/strict";
import { databasesLessons } from "../../data/lessons/databases";
import { databasesNodes } from "../../data/roadmap-nodes/databases";
import type { CodeDemoSection, L10n, LabExerciseSection, Lesson, QuizSection } from "../../data/lessons/types";
import { isLangId } from "../../shared/languages";
import { matchOutput } from "../../shared/match";
import { localSupports, runLocal } from "../helpers/exec-local";

/**
 * Content checks for the Databases track:
 *  (a) structure and bilingual completeness,
 *  (b) every lab reference solution passes every visible test,
 *  (c) every untouched starter fails at least one test,
 *  (d) every runnable code-demo executes without error.
 * Labs run on the HOST toolchain (tests/helpers/exec-local.ts, not sandboxed).
 */

const LESSON_IDS = [
  "relational-sql-basics",
  "data-modeling-normalization",
  "joins-aggregation",
  "indexes-performance",
];
const NODE_IDS = [
  ...LESSON_IDS,
  "transactions-acid",
  "nosql-models",
  "backup-replication",
  "db-security",
  "data-warehousing",
];
const LAB_LANGS = new Set(["python", "javascript", "typescript", "java", "c", "cpp", "go", "rust", "ruby", "php", "bash"]);
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const ARABIC = /[؀-ۿ]/;
// Interpreted languages must run a lab well inside the 2 s budget; compiled ones include compile time.
const FAST_LANGS = new Set(["python", "javascript", "ruby", "php", "bash"]);

async function loadAll(): Promise<Map<string, Lesson>> {
  const out = new Map<string, Lesson>();
  for (const [key, loader] of Object.entries(databasesLessons)) {
    const mod = await loader();
    out.set(key, mod.lesson);
  }
  return out;
}

/** Every `{ en, ar }` object reachable from a value, with a path for error messages. */
function collectL10n(value: unknown, path: string, out: Array<[string, L10n]> = []): Array<[string, L10n]> {
  if (Array.isArray(value)) {
    value.forEach((v, i) => collectL10n(v, `${path}[${i}]`, out));
  } else if (value && typeof value === "object") {
    const rec = value as Record<string, unknown>;
    if ("en" in rec && "ar" in rec) {
      out.push([path, rec as unknown as L10n]);
    } else {
      for (const [k, v] of Object.entries(rec)) collectL10n(v, `${path}.${k}`, out);
    }
  }
  return out;
}

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** Honest-ish study time: reading + ~7 min per lab + quiz + demos, rounded to 5. */
function estimateMinutes(lesson: Lesson): number {
  let readWords = 0;
  let labs = 0;
  let demos = 0;
  let questions = 0;
  for (const s of lesson.sections) {
    if (s.type === "text") readWords += words(s.body.en);
    else if (s.type === "code-demo") {
      demos++;
      readWords += words(s.explanation.en);
    } else if (s.type === "lab") {
      labs++;
      readWords += words(s.prompt.en);
    } else if (s.type === "quiz") questions += s.questions.length;
  }
  const minutes = readWords / 170 + labs * 7 + demos * 1.5 + questions * 0.8;
  return Math.round(minutes / 5) * 5;
}

function labs(lesson: Lesson): LabExerciseSection[] {
  return lesson.sections.filter((s): s is LabExerciseSection => s.type === "lab");
}

test("roadmap nodes: ids, order, status and descriptions", () => {
  assert.deepEqual(databasesNodes.map((n) => n.id), NODE_IDS);
  assert.equal(new Set(databasesNodes.map((n) => n.id)).size, databasesNodes.length);
  for (const n of databasesNodes) {
    assert.match(n.id, KEBAB);
    assert.ok(n.label.trim().length > 0, `${n.id}: label`);
    assert.ok(n.description.trim().length >= 80, `${n.id}: description too short`);
    assert.ok(n.description.length <= 400, `${n.id}: description too long`);
    assert.ok(["required", "important", "optional"].includes(n.status), `${n.id}: status`);
    for (const r of Object.values(n.resources)) {
      assert.match(r.url, /^https:\/\/[^\s]+$/, `${n.id}: resource url`);
      assert.ok(r.title.trim().length > 0 && r.tags.length > 0, `${n.id}: resource title/tags`);
    }
  }
  const required = databasesNodes.filter((n) => n.status === "required").map((n) => n.id);
  assert.deepEqual(required, [...LESSON_IDS, "transactions-acid"]);
});

test("registry fragment: keys are databases/<node-id> and match the planned lessons", () => {
  assert.deepEqual(Object.keys(databasesLessons).sort(), LESSON_IDS.map((id) => `databases/${id}`).sort());
});

test("lessons: structure and bilingual completeness", async (t) => {
  const lessons = await loadAll();
  const nodeIds = new Set(databasesNodes.map((n) => n.id));
  for (const [key, lesson] of lessons) {
    await t.test(key, () => {
      assert.equal(key, `databases/${lesson.nodeId}`);
      assert.ok(nodeIds.has(lesson.nodeId), "nodeId must exist in the roadmap node file");
      assert.ok(lesson.estMinutes >= 20 && lesson.estMinutes <= 60, `estMinutes ${lesson.estMinutes}`);
      const est = estimateMinutes(lesson);
      assert.ok(Math.abs(lesson.estMinutes - est) <= 5, `estMinutes ${lesson.estMinutes} is far from the content-based estimate ${est}`);

      const first = lesson.sections[0];
      const last = lesson.sections[lesson.sections.length - 1];
      assert.equal(first.type, "text", "opens with text");
      assert.equal(last.type, "text", "closes with text");
      assert.equal(lesson.sections.filter((s) => s.type === "quiz").length, 1, "exactly one quiz");
      assert.ok(labs(lesson).length >= 2 && labs(lesson).length <= 3, "2-3 labs");
      const demos = lesson.sections.filter((s): s is CodeDemoSection => s.type === "code-demo");
      assert.ok(demos.length >= 1 && demos.length <= 2, "1-2 code demos");
      for (const d of demos) assert.ok(d.lang === "python" || d.lang === "js", "demo language must run in the browser");
      assert.ok(!lesson.sections.some((s) => s.type === "exercise"), "use lab sections, not in-browser exercises");

      for (const [path, l10n] of collectL10n(lesson, key)) {
        assert.ok(typeof l10n.en === "string" && l10n.en.trim().length > 0, `${path}: en is empty`);
        assert.ok(typeof l10n.ar === "string" && l10n.ar.trim().length > 0, `${path}: ar is empty`);
        assert.ok(ARABIC.test(l10n.ar) || l10n.ar === l10n.en, `${path}: ar has no Arabic text`);
      }

      const quiz = lesson.sections.find((s): s is QuizSection => s.type === "quiz");
      assert.ok(quiz);
      assert.equal(quiz.questions.length, 5, "quiz has 5 questions");
      quiz.questions.forEach((q, i) => {
        assert.ok(q.choices.length >= 3 && q.choices.length <= 4, `q${i}: 3-4 choices`);
        assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length, `q${i}: answer index`);
        assert.equal(new Set(q.choices.map((c) => c.en)).size, q.choices.length, `q${i}: duplicate choices`);
        assert.ok(q.explain.en.length >= 40, `q${i}: explanation should teach`);
      });
      // Answers should not always sit in the same slot.
      assert.ok(new Set(quiz.questions.map((q) => q.answer)).size >= 2, "vary the correct answer position");

      const ids = labs(lesson).map((l) => l.id);
      assert.equal(new Set(ids).size, ids.length, "lab ids unique");
      for (const lab of labs(lesson)) {
        const where = `${key}/${lab.id}`;
        assert.match(lab.id, KEBAB, `${where}: id`);
        assert.ok(LAB_LANGS.has(lab.lang) && isLangId(lab.lang), `${where}: lang ${lab.lang}`);
        assert.ok(lab.hints.length >= 2 && lab.hints.length <= 3, `${where}: 2-3 hints`);
        assert.ok(lab.tests.length >= 3 && lab.tests.length <= 6, `${where}: 3-6 tests`);
        const names = lab.tests.map((x) => x.name.en);
        assert.equal(new Set(names).size, names.length, `${where}: duplicate test names`);
        assert.ok(/TODO/.test(lab.starterCode), `${where}: starter needs a TODO comment`);
        assert.ok(lab.starterCode.trim() !== lab.solution.trim(), `${where}: starter equals solution`);
        for (const x of lab.tests) assert.ok(x.expected.trim().length > 0, `${where}: empty expected output`);
        // Programs talk through stdin/stdout only: no network or process-spawning APIs in solutions.
        assert.ok(!/\b(socket|urllib|requests|http\.client|fetch\(|child_process|subprocess|os\.system)\b/.test(lab.solution), `${where}: forbidden API`);
      }
    });
  }
});

test("labs: every reference solution passes every test; every starter fails at least one", async (t) => {
  const lessons = await loadAll();
  for (const [key, lesson] of lessons) {
    for (const lab of labs(lesson)) {
      const where = `${key}/${lab.id} (${lab.lang})`;
      await t.test(where, { skip: !localSupports(lab.lang) }, () => {
        let failedStarter = 0;
        for (const x of lab.tests) {
          const mode = x.mode ?? "trim";
          const started = Date.now();
          const sol = runLocal(lab.lang, lab.solution, x.stdin ?? "");
          const ms = Date.now() - started;
          assert.equal(sol.timedOut, false, `solution timed out on "${x.name.en}"`);
          assert.equal(sol.exitCode, 0, `solution crashed on "${x.name.en}": ${sol.stderr}`);
          assert.ok(
            matchOutput(sol.stdout, x.expected, mode, x.epsilon),
            `solution fails "${x.name.en}"\n--- expected\n${x.expected}\n--- actual\n${sol.stdout}`,
          );
          if (FAST_LANGS.has(lab.lang)) assert.ok(ms < 2000, `solution too slow (${ms} ms) on "${x.name.en}"`);

          const st = runLocal(lab.lang, lab.starterCode, x.stdin ?? "");
          assert.equal(st.timedOut, false, `starter timed out on "${x.name.en}"`);
          if (st.exitCode !== 0 || !matchOutput(st.stdout, x.expected, mode, x.epsilon)) failedStarter++;
        }
        assert.ok(failedStarter >= 1, "the untouched starter must fail at least one test");
      });
    }
  }
});

test("code demos run without error", async (t) => {
  const lessons = await loadAll();
  for (const [key, lesson] of lessons) {
    const demos = lesson.sections.filter((s): s is CodeDemoSection => s.type === "code-demo");
    for (const [i, d] of demos.entries()) {
      const lang = d.lang === "js" ? "javascript" : "python";
      await t.test(`${key} demo ${i + 1} (${lang})`, { skip: !localSupports(lang) }, () => {
        const r = runLocal(lang, d.code);
        assert.equal(r.timedOut, false);
        assert.equal(r.exitCode, 0, r.stderr);
        assert.ok(r.stdout.trim().length > 0, "a demo should print something");
      });
    }
  }
});
