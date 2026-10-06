/**
 * Content tests for the Networking track: roadmap nodes + lessons.
 *
 * (a) structure: every lesson loads through the registry fragment, ids are unique, every
 *     L10n has English AND Arabic, quizzes are well formed, estMinutes is honest;
 * (b) every lab `solution` is RUN with the host toolchain and must pass every visible test;
 * (c) every untouched `starterCode` must run but fail at least one test;
 * (d) every runnable code-demo (python / js) must run without error.
 *
 * Languages whose toolchain is missing locally are skipped (see tests/helpers/exec-local.ts).
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { networkingNodes } from "../../data/roadmap-nodes/networking";
import { networkingLessons } from "../../data/lessons/networking";
import type { L10n, Lesson, LabExerciseSection, LessonSection, CodeDemoSection } from "../../data/lessons/types";
import { matchOutput } from "../../shared/match";
import { LANG_IDS, type LangId } from "../../shared/languages";
import { localSupports, runLocal } from "../helpers/exec-local";

const LAB_LANGS: readonly LangId[] = ["python", "javascript", "typescript", "java", "c", "cpp", "go", "rust", "ruby", "php", "bash"];
const EXPECTED_LESSONS = ["osi-tcpip", "ip-subnetting", "transport-tcp-udp"];
const ARABIC = /[؀-ۿ]/;
const LATIN = /[A-Za-z]/;
/** Numbers, IP/MAC/hex notation: identical in both languages by design. */
const DATA_ONLY = /^[0-9a-f:.\/\-\s]+$/i;

async function loadAll(): Promise<{ key: string; lesson: Lesson }[]> {
  const out: { key: string; lesson: Lesson }[] = [];
  for (const [key, load] of Object.entries(networkingLessons)) out.push({ key, lesson: (await load()).lesson });
  return out;
}

/** Every L10n reachable from a lesson, with a path for readable failures. */
function collectL10n(lesson: Lesson): { path: string; value: L10n }[] {
  const out: { path: string; value: L10n }[] = [{ path: "title", value: lesson.title }];
  lesson.sections.forEach((s, i) => {
    const at = `sections[${i}](${s.type})`;
    switch (s.type) {
      case "text":
        out.push({ path: `${at}.body`, value: s.body });
        break;
      case "code-demo":
        out.push({ path: `${at}.explanation`, value: s.explanation });
        break;
      case "lab":
        out.push({ path: `${at}.prompt`, value: s.prompt });
        s.hints.forEach((h, j) => out.push({ path: `${at}.hints[${j}]`, value: h }));
        s.tests.forEach((t, j) => out.push({ path: `${at}.tests[${j}].name`, value: t.name }));
        break;
      case "quiz":
        s.questions.forEach((q, j) => {
          out.push({ path: `${at}.q[${j}].q`, value: q.q });
          q.choices.forEach((c, k) => out.push({ path: `${at}.q[${j}].choices[${k}]`, value: c }));
          out.push({ path: `${at}.q[${j}].explain`, value: q.explain });
        });
        break;
      case "exercise":
        out.push({ path: `${at}.prompt`, value: s.prompt });
        break;
    }
  });
  return out;
}

/** Same formula the lessons were sized with: reading 200 words/min, 2 min per demo, 8 per lab, 1 per quiz question. */
function computeMinutes(lesson: Lesson): number {
  let words = 0;
  let minutes = 0;
  for (const s of lesson.sections) {
    if (s.type === "text") words += s.body.en.split(/\s+/).filter(Boolean).length;
    else if (s.type === "code-demo") minutes += 2;
    else if (s.type === "lab") minutes += 8;
    else if (s.type === "quiz") minutes += s.questions.length;
  }
  return Math.round(words / 200 + minutes);
}

const isLab = (s: LessonSection): s is LabExerciseSection => s.type === "lab";
const isDemo = (s: LessonSection): s is CodeDemoSection => s.type === "code-demo";

describe("networking roadmap nodes", () => {
  test("nodes are well formed and in the planned order", () => {
    assert.deepEqual(
      networkingNodes.map((n) => n.id),
      ["osi-tcpip", "ip-subnetting", "transport-tcp-udp", "dns-http-tls", "routing-switching", "network-troubleshooting", "wireless-vpn-firewalls", "network-security-basics", "cloud-networking-sdn"],
    );
    const ids = new Set<string>();
    for (const n of networkingNodes) {
      assert.match(n.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `id ${n.id}`);
      assert.ok(!ids.has(n.id), `duplicate id ${n.id}`);
      ids.add(n.id);
      assert.ok(n.label.trim().length > 3, `label of ${n.id}`);
      assert.ok(["required", "important", "optional"].includes(n.status), `status of ${n.id}`);
      const sentences = n.description.split(/(?<=[.!?])\s+/).filter(Boolean).length;
      assert.ok(sentences >= 1 && sentences <= 3, `${n.id}: description must be 1-3 sentences, got ${sentences}`);
      assert.ok(n.description.length >= 80, `${n.id}: description too thin`);
      assert.doesNotMatch(n.description, /coming soon|lorem|todo/i, n.id);
    }
  });

  test("resources only use https URLs, have tags and no invented durations or prices", () => {
    const seen = new Map<string, string>();
    for (const n of networkingNodes) {
      for (const [kind, r] of Object.entries(n.resources)) {
        assert.ok(r, `${n.id}.${kind}`);
        const url = new URL(r.url);
        assert.equal(url.protocol, "https:", `${n.id}.${kind} must be https`);
        assert.ok(r.title.trim().length > 0 && r.tags.length > 0, `${n.id}.${kind} needs title and tags`);
        assert.equal(r.duration, undefined, `${n.id}.${kind}: durations are not published`);
        assert.ok(!r.tags.some((t) => /paid|\$|price/i.test(t)), `${n.id}.${kind}: no price claims`);
        const prior = seen.get(r.url);
        // Reusing a canonical reference for two nodes is fine, but its title must agree.
        if (prior) assert.equal(prior, r.title, `inconsistent title for ${r.url}`);
        seen.set(r.url, r.title);
      }
    }
  });

  test("the planned lessons are registered, each under networking/<node-id>", () => {
    const nodeIds = new Set(networkingNodes.map((n) => n.id));
    assert.deepEqual(Object.keys(networkingLessons).sort(), EXPECTED_LESSONS.map((id) => `networking/${id}`).sort());
    for (const key of Object.keys(networkingLessons)) {
      const id = key.replace(/^networking\//, "");
      assert.ok(nodeIds.has(id), `${key} has no roadmap node`);
    }
  });
});

describe("networking lessons: structure", async () => {
  const lessons = await loadAll();

  for (const { key, lesson } of lessons) {
    describe(key, () => {
      test("nodeId matches the registry key and a roadmap node", () => {
        assert.equal(`networking/${lesson.nodeId}`, key);
        assert.ok(networkingNodes.some((n) => n.id === lesson.nodeId));
      });

      test("every L10n has non-empty English and Arabic, and Arabic is not a copy of English", () => {
        for (const { path, value } of collectL10n(lesson)) {
          assert.ok(typeof value.en === "string" && value.en.trim().length > 0, `${path}.en is empty`);
          assert.ok(typeof value.ar === "string" && value.ar.trim().length > 0, `${path}.ar is empty`);
          // Pure data (a number, an address, a hex string) is shown identically in both languages.
          if (DATA_ONLY.test(value.en.trim())) {
            assert.equal(value.ar, value.en, `${path}: data-only text must be identical in both languages`);
            continue;
          }
          assert.match(value.en, LATIN, `${path}.en has no Latin letters`);
          assert.match(value.ar, ARABIC, `${path}.ar has no Arabic letters`);
          assert.notEqual(value.en, value.ar, `${path}: ar equals en`);
        }
      });

      test("estMinutes is between 20 and 60 and agrees with the content", () => {
        assert.ok(Number.isInteger(lesson.estMinutes));
        assert.ok(lesson.estMinutes >= 20 && lesson.estMinutes <= 60, `estMinutes ${lesson.estMinutes}`);
        const computed = computeMinutes(lesson);
        assert.ok(Math.abs(lesson.estMinutes - computed) <= 5, `estMinutes ${lesson.estMinutes} vs computed ${computed}`);
      });

      test("opens with a text section and closes with text after the quiz", () => {
        const first = lesson.sections[0];
        const last = lesson.sections[lesson.sections.length - 1];
        assert.equal(first.type, "text");
        assert.equal(last.type, "text");
        assert.ok(lesson.sections.some((s) => s.type === "quiz"));
        const quizAt = lesson.sections.findIndex((s) => s.type === "quiz");
        assert.ok(quizAt > 0 && quizAt < lesson.sections.length, "quiz must be followed by closing text or be last");
      });

      test("markdown is the supported subset (balanced tagged fences, no tables) and EN/AR have the same code blocks", () => {
        for (const [i, s] of lesson.sections.entries()) {
          if (s.type !== "text") continue;
          const fences = { en: 0, ar: 0 };
          for (const l of ["en", "ar"] as const) {
            const lines = s.body[l].split("\n");
            let open = false;
            for (const line of lines) {
              if (/^```/.test(line)) {
                if (!open) assert.match(line, /^```[a-z]+$/, `sections[${i}].${l}: fenced blocks need a language tag`);
                open = !open;
                fences[l] += 1;
              } else if (!open) {
                assert.doesNotMatch(line, /^\s*\|.*\|\s*$/, `sections[${i}].${l}: tables are not supported`);
              }
            }
            assert.equal(open, false, `sections[${i}].${l}: unbalanced code fence`);
          }
          assert.equal(fences.en, fences.ar, `sections[${i}]: EN and AR must show the same number of code blocks`);
        }
      });

      test("section ids and lab ids are unique; at least 2 labs and exactly one quiz of 5 questions", () => {
        const labs = lesson.sections.filter(isLab);
        assert.ok(labs.length >= 2 && labs.length <= 3, `labs: ${labs.length}`);
        const ids = labs.map((l) => l.id);
        assert.equal(new Set(ids).size, ids.length, "duplicate lab id");
        for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `lab id ${id}`);
        const quizzes = lesson.sections.filter((s) => s.type === "quiz");
        assert.equal(quizzes.length, 1);
        assert.equal(quizzes[0].type === "quiz" && quizzes[0].questions.length, 5);
        const demos = lesson.sections.filter(isDemo);
        assert.ok(demos.length >= 1 && demos.length <= 2, `code demos: ${demos.length}`);
        for (const d of demos) assert.ok(d.lang === "python" || d.lang === "js", "demos must run in the browser runner");
      });

      test("quiz questions are valid, answers are spread over positions, choices are distinct", () => {
        const quiz = lesson.sections.find((s) => s.type === "quiz");
        assert.ok(quiz && quiz.type === "quiz");
        const positions = new Set<number>();
        for (const [i, q] of quiz.questions.entries()) {
          assert.ok(q.choices.length >= 3 && q.choices.length <= 4, `q${i}: ${q.choices.length} choices`);
          assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length, `q${i}: answer index`);
          assert.equal(new Set(q.choices.map((c) => c.en)).size, q.choices.length, `q${i}: duplicate choices`);
          assert.ok(q.explain.en.length >= 60, `q${i}: explanation should teach`);
          positions.add(q.answer);
        }
        assert.ok(positions.size >= 3, `correct answers should not sit in the same slot (positions: ${[...positions]})`);
      });

      test("labs: languages, hints, tests and prompts are well formed", () => {
        for (const lab of lesson.sections.filter(isLab)) {
          const at = `${key}/${lab.id}`;
          assert.ok(LAB_LANGS.includes(lab.lang) && LANG_IDS.includes(lab.lang), `${at}: lang ${lab.lang}`);
          assert.ok(lab.hints.length >= 2 && lab.hints.length <= 3, `${at}: ${lab.hints.length} hints`);
          assert.ok(lab.tests.length >= 3 && lab.tests.length <= 6, `${at}: ${lab.tests.length} tests`);
          const names = lab.tests.map((t) => t.name.en);
          assert.equal(new Set(names).size, names.length, `${at}: duplicate test names`);
          const stdins = lab.tests.map((t) => `${t.stdin ?? ""}\u0000${t.expected}`);
          assert.equal(new Set(stdins).size, stdins.length, `${at}: duplicate test cases`);
          assert.match(lab.prompt.en, /Example/, `${at}: prompt needs a worked example`);
          assert.match(lab.prompt.ar, /مثال/, `${at}: Arabic prompt needs a worked example`);
          assert.match(lab.starterCode, /TODO/, `${at}: starter needs TODO comments`);
          assert.doesNotMatch(lab.solution, /TODO/, `${at}: solution has TODO`);
          assert.notEqual(lab.starterCode.trim(), lab.solution.trim(), `${at}: starter equals solution`);
          assert.ok(lab.tests.some((t) => (t.stdin ?? "").trim() === "" || /(^|\n)0(\n|$)/.test(t.stdin ?? "") || /error|empty|zero|short|invalid|unknown|no /i.test(t.name.en)), `${at}: needs an edge-case test`);
          if (lab.sampleInput !== undefined) assert.ok(lab.sampleInput.length < 4000, `${at}: sampleInput`);
        }
      });

      test("no secrets, flags or network targets are embedded in the content", () => {
        const raw = JSON.stringify(lesson);
        assert.doesNotMatch(raw, /flag\{|ctf\{|BEGIN (RSA |EC )?PRIVATE KEY|password\s*[:=]|api[_-]?key/i);
        for (const lab of lesson.sections.filter(isLab)) {
          assert.doesNotMatch(lab.solution, /(import\s+socket|from\s+socket|require\(\s*[\"'](?:net|http|https|dgram|dns|child_process)[\"']\s*\)|urllib|http\.client|requests\.|net\.Dial|net\/http|fetch\(|socket\(|\.connect\(|<sys\/socket\.h>|<netinet\/|<arpa\/inet\.h>|getaddrinfo|system\()/, `${lab.id}: labs must be offline`);
        }
      });
    });
  }
});

describe("networking lessons: code is executed", async () => {
  const lessons = await loadAll();

  for (const { key, lesson } of lessons) {
    const demos = lesson.sections.filter(isDemo);
    demos.forEach((d, i) => {
      const lang: LangId = d.lang === "python" ? "python" : "javascript";
      test(`${key} demo #${i + 1} (${d.lang}) runs without error`, { skip: !localSupports(lang) }, () => {
        const r = runLocal(lang, d.code);
        assert.equal(r.timedOut, false);
        assert.equal(r.exitCode, 0, r.stderr);
        assert.ok(r.stdout.trim().length > 0, "a demo must print something");
      });
    });

    for (const lab of lesson.sections.filter(isLab)) {
      const skip = !localSupports(lab.lang);

      test(`${key}/${lab.id} (${lab.lang}): reference solution passes every test`, { skip }, () => {
        for (const t of lab.tests) {
          const r = runLocal(lab.lang, lab.solution, t.stdin ?? "");
          assert.equal(r.timedOut, false, `timeout on "${t.name.en}"`);
          assert.equal(r.exitCode, 0, `crash on "${t.name.en}": ${r.stderr}`);
          assert.ok(
            matchOutput(r.stdout, t.expected, t.mode ?? "trim", t.epsilon),
            `"${t.name.en}" failed\n--- expected ---\n${t.expected}\n--- actual ---\n${r.stdout}\n--- stderr ---\n${r.stderr}`,
          );
        }
      });

      test(`${key}/${lab.id} (${lab.lang}): untouched starter runs but fails at least one test`, { skip }, () => {
        let failures = 0;
        for (const [i, t] of lab.tests.entries()) {
          const r = runLocal(lab.lang, lab.starterCode, t.stdin ?? "");
          assert.equal(r.timedOut, false, `starter timed out on "${t.name.en}"`);
          // The starter must be a valid program (it compiles and exits normally), so the learner starts from green syntax.
          assert.equal(r.exitCode, 0, `starter does not run cleanly on test #${i + 1}: ${r.stderr}`);
          if (!matchOutput(r.stdout, t.expected, t.mode ?? "trim", t.epsilon)) failures += 1;
        }
        assert.ok(failures >= 1, "the untouched starter must fail at least one test");
      });
    }
  }
});
