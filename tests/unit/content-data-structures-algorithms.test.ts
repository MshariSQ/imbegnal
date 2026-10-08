import { test } from "node:test";
import assert from "node:assert/strict";
import { dataStructuresAlgorithmsLessons } from "../../data/lessons/data-structures-algorithms";
import { estimateMinutes } from "../../data/lessons/data-structures-algorithms/estimate";
import { dataStructuresAlgorithmsNodes } from "../../data/roadmap-nodes/data-structures-algorithms";
import type { L10n, Lesson } from "../../data/lessons/types";
import { localSupports, runLocal } from "../helpers/exec-local";
import { matchOutput } from "../../shared/match";

const LAB_LANGS = new Set(["python", "javascript", "typescript", "java", "c", "cpp", "go", "rust", "ruby", "php", "bash"]);
const SOLUTION_TIMEOUT_MS = 8_000; // the runner's default run limit is 5 s; headroom for a busy CI box
const STARTER_TIMEOUT_MS = 6_000;
const STDIN_LIMIT = 32 * 1024; // the runner accepts 64 KiB; stay well below

const hasText = (v: L10n) => typeof v.en === "string" && v.en.trim() !== "" && typeof v.ar === "string" && v.ar.trim() !== "";
const hasArabic = (v: L10n) => /[؀-ۿ]/.test(v.ar);

/** Collects every learner-visible L10n of a lesson, with a path for error messages. */
function allL10n(lesson: Lesson): [string, L10n][] {
  const out: [string, L10n][] = [["title", lesson.title]];
  lesson.sections.forEach((s, i) => {
    const p = `sections[${i}]`;
    if (s.type === "text") out.push([`${p}.body`, s.body]);
    if (s.type === "code-demo") out.push([`${p}.explanation`, s.explanation]);
    if (s.type === "lab") {
      out.push([`${p}.prompt`, s.prompt]);
      s.hints.forEach((h, j) => out.push([`${p}.hints[${j}]`, h]));
      s.tests.forEach((t, j) => out.push([`${p}.tests[${j}].name`, t.name]));
    }
    if (s.type === "quiz") {
      s.questions.forEach((q, j) => {
        out.push([`${p}.q[${j}].q`, q.q], [`${p}.q[${j}].explain`, q.explain]);
        q.choices.forEach((c, k) => out.push([`${p}.q[${j}].choices[${k}]`, c]));
      });
    }
  });
  return out;
}

test("data-structures-algorithms: roadmap nodes are well formed", () => {
  const ids = dataStructuresAlgorithmsNodes.map((n) => n.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate node ids");
  assert.ok(ids.length >= 10);
  for (const n of dataStructuresAlgorithmsNodes) {
    assert.match(n.id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.ok(n.label.trim() && n.description.trim().length > 40, n.id);
    assert.ok(["required", "important", "optional"].includes(n.status), n.id);
    for (const r of Object.values(n.resources)) {
      assert.ok(r.title && /^https:\/\/[^\s]+$/.test(r.url), `${n.id}: bad resource ${r.url}`);
    }
  }
});

test("data-structures-algorithms: lessons (structure, labs, demos)", async (t) => {
  const nodeIds = new Set(dataStructuresAlgorithmsNodes.map((n) => n.id));
  const entries = Object.entries(dataStructuresAlgorithmsLessons);
  assert.ok(entries.length >= 1, "no lessons registered");

  for (const [key, load] of entries) {
    const { lesson } = await load();

    await t.test(`${key}: structure`, () => {
      assert.equal(key, `data-structures-algorithms/${lesson.nodeId}`);
      assert.ok(nodeIds.has(lesson.nodeId), `unknown node ${lesson.nodeId}`);
      assert.ok(lesson.estMinutes >= 20 && lesson.estMinutes <= 60, `estMinutes ${lesson.estMinutes}`);
      assert.equal(lesson.estMinutes, estimateMinutes(lesson.sections), "estMinutes must be computed with estimateMinutes");
      for (const [path, v] of allL10n(lesson)) {
        assert.ok(hasText(v), `${key} ${path}: empty en or ar`);
        // Arabic must actually be Arabic (code-only strings such as test names may stay Latin)
        if (v.ar.length > 60) assert.ok(hasArabic(v), `${key} ${path}: Arabic text contains no Arabic letters`);
      }
      const first = lesson.sections[0];
      const last = lesson.sections[lesson.sections.length - 1];
      assert.equal(first.type, "text", "opening section must be text");
      assert.equal(last.type, "text", "closing section must be text");
      assert.match(last.type === "text" ? last.body.en : "", /^##\s+Summary/m, "closing text starts with a Summary heading");

      const labs = lesson.sections.filter((s) => s.type === "lab");
      const quizzes = lesson.sections.filter((s) => s.type === "quiz");
      assert.ok(labs.length >= 2 && labs.length <= 3, `labs: ${labs.length}`);
      assert.equal(quizzes.length, 1, "exactly one quiz");
      const demos = lesson.sections.filter((s) => s.type === "code-demo");
      assert.ok(demos.length >= 1 && demos.length <= 2, `demos: ${demos.length}`);

      const ids = labs.map((l) => (l.type === "lab" ? l.id : ""));
      assert.equal(new Set(ids).size, ids.length, "duplicate lab ids");
      for (const l of labs) {
        if (l.type !== "lab") continue;
        assert.match(l.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `lab id ${l.id}`);
        assert.ok(LAB_LANGS.has(l.lang), `${l.id}: lang ${l.lang}`);
        assert.ok(l.hints.length >= 2 && l.hints.length <= 3, `${l.id}: hints`);
        assert.ok(l.tests.length >= 3 && l.tests.length <= 6, `${l.id}: tests ${l.tests.length}`);
        const names = l.tests.map((x) => x.name.en);
        assert.equal(new Set(names).size, names.length, `${l.id}: duplicate test names`);
        assert.notEqual(l.starterCode.trim(), l.solution.trim(), `${l.id}: starter equals solution`);
        assert.match(l.starterCode, /TODO/, `${l.id}: starter needs a TODO`);
        for (const x of l.tests) {
          assert.ok((x.stdin ?? "").length <= STDIN_LIMIT, `${l.id}: stdin too large`);
          assert.ok(x.expected.trim() !== "" || x.expected === "", `${l.id}: expected`);
        }
      }

      for (const s of quizzes) {
        if (s.type !== "quiz") continue;
        assert.equal(s.questions.length, 5, "quiz has 5 questions");
        for (const q of s.questions) {
          assert.ok(q.choices.length >= 3 && q.choices.length <= 4, "3-4 choices");
          assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length, "answer index valid");
          const texts = q.choices.map((c) => c.en);
          assert.equal(new Set(texts).size, texts.length, `duplicate choice in "${q.q.en}"`);
        }
        const positions = new Set(s.questions.map((q) => q.answer));
        assert.ok(positions.size >= 3, "correct answers must not always sit at the same position");
      }

      const text = lesson.sections.flatMap((s) => (s.type === "text" ? [s.body.en, s.body.ar] : []));
      for (const body of text) {
        assert.ok(!/^\s*\|.*\|\s*$/m.test(body), "markdown tables are not supported");
        assert.ok((body.match(/```/g)?.length ?? 0) % 2 === 0, "unbalanced code fence");
      }
    });

    for (const s of lesson.sections) {
      if (s.type === "code-demo" && s.runnable !== false) {
        const lang = s.lang === "python" ? "python" : s.lang === "js" ? "javascript" : null;
        await t.test(`${key}: code-demo (${s.lang}) runs`, { skip: !lang || !localSupports(lang) }, () => {
          const r = runLocal(lang!, s.code, "", SOLUTION_TIMEOUT_MS);
          assert.equal(r.exitCode, 0, r.stderr);
          assert.ok(r.stdout.trim().length > 0, "demo prints something");
        });
      }
      if (s.type !== "lab") continue;
      await t.test(`${key}/${s.id}: reference solution passes every test (${s.lang})`, { skip: !localSupports(s.lang) }, () => {
        for (const x of s.tests) {
          const r = runLocal(s.lang, s.solution, x.stdin ?? "", SOLUTION_TIMEOUT_MS);
          assert.equal(r.timedOut, false, `${x.name.en}: timed out`);
          assert.equal(r.exitCode, 0, `${x.name.en}: ${r.stderr.slice(0, 400)}`);
          assert.ok(matchOutput(r.stdout, x.expected, x.mode ?? "trim", x.epsilon), `${x.name.en}: expected ${JSON.stringify(x.expected)}, got ${JSON.stringify(r.stdout.slice(0, 200))}`);
        }
      });
      await t.test(`${key}/${s.id}: untouched starter fails at least one test`, { skip: !localSupports(s.lang) }, () => {
        let failed = 0;
        for (const x of s.tests) {
          const r = runLocal(s.lang, s.starterCode, x.stdin ?? "", STARTER_TIMEOUT_MS);
          // a starter must compile and run cleanly (a time-out on a big input is its intended failure)
          assert.ok(r.timedOut || r.exitCode === 0, `${x.name.en}: starter does not compile/run: ${r.stderr.slice(0, 300)}`);
          if (r.timedOut || !matchOutput(r.stdout, x.expected, x.mode ?? "trim", x.epsilon)) {
            failed++;
            break; // one failing test is enough, and a compile+run already happened
          }
        }
        assert.ok(failed >= 1, "starter must not already pass");
      });
    }
  }
});
