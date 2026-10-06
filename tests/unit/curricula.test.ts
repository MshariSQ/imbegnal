import { test } from "node:test";
import assert from "node:assert/strict";
import { roadmaps } from "../../data/roadmaps";
import { NODE_DATA } from "../../data/roadmap-nodes";
import { loadLesson, hasLesson } from "../../data/lessons";
import { BADGE_ICONS, curricula, type Curriculum } from "../../data/curricula";
import type { L10n } from "../../data/lessons/types";
import { LANG_IDS } from "../../shared/languages";
import { MODULE_ORDER, courses, courseStats, evaluateBadges, type CourseLesson } from "../../lib/catalog";
import { localSupports, runLocal } from "../helpers/exec-local";

const ARABIC = /[؀-ۿ]/;
/** Words that may not open an objective: it must start with an action verb. */
const NOT_VERBS = new Set(["the", "a", "an", "understanding", "knowledge", "how", "what", "why", "basic", "introduction", "learning", "about"]);

/** Every bilingual string of a curriculum, with a path for readable failures. */
function* l10nOf(id: string, c: Curriculum): Generator<[string, L10n]> {
  for (const [i, o] of c.objectives.entries()) yield [`${id}.objectives[${i}]`, o];
  yield [`${id}.audience`, c.audience];
  for (const [i, p] of c.prerequisites.entries()) if ("text" in p) yield [`${id}.prerequisites[${i}]`, p.text];
  for (const m of MODULE_ORDER) {
    yield [`${id}.modules.${m}.title`, c.modules[m].title];
    yield [`${id}.modules.${m}.summary`, c.modules[m].summary];
  }
  yield [`${id}.assessment.summary`, c.assessment.summary];
  for (const [i, k] of c.assessment.criteria.entries()) {
    yield [`${id}.assessment.criteria[${i}].title`, k.title];
    yield [`${id}.assessment.criteria[${i}].detail`, k.detail];
  }
  for (const b of c.badges) {
    yield [`${id}.badges.${b.id}.title`, b.title];
    yield [`${id}.badges.${b.id}.criteria`, b.criteria];
  }
  yield [`${id}.sampleCode.caption`, c.sampleCode.caption];
}

test("every roadmap has a curriculum and no curriculum is orphaned", () => {
  const ids = roadmaps.map((r) => r.id).sort();
  assert.deepEqual(Object.keys(curricula).sort(), ids);
});

test("objectives: 4-8, verb-first, measurable sentences", () => {
  for (const [id, c] of Object.entries(curricula)) {
    assert.ok(c.objectives.length >= 4 && c.objectives.length <= 8, `${id}: ${c.objectives.length} objectives`);
    for (const o of c.objectives) {
      const first = (o.en.trim().split(/\s+/)[0] ?? "").replace(/,$/, "");
      assert.match(first, /^[A-Z][a-z]+$/, `${id}: objective must open with a capitalised verb: "${o.en}"`);
      assert.ok(!NOT_VERBS.has(first.toLowerCase()) && !/ing$/.test(first), `${id}: "${first}" is not an action verb`);
      assert.ok(o.en.length >= 40, `${id}: objective too vague: "${o.en}"`);
    }
    assert.equal(new Set(c.objectives.map((o) => o.en)).size, c.objectives.length, `${id}: duplicate objectives`);
  }
});

test("every learner-facing string is bilingual and the Arabic is Arabic", () => {
  for (const [id, c] of Object.entries(curricula)) {
    for (const [path, t] of l10nOf(id, c)) {
      assert.ok(t.en.trim().length > 0, `${path}: empty English`);
      assert.ok(t.ar.trim().length > 0, `${path}: empty Arabic`);
      assert.match(t.ar, ARABIC, `${path}: Arabic text contains no Arabic letters`);
    }
    assert.match(c.arabic.title, /[؀-ۿ]|^DevOps$/);
    assert.ok(c.arabic.description.length > 10);
  }
});

test("prerequisites and recommendations reference real tracks, never themselves, and the order is consistent", () => {
  const ids = new Set(roadmaps.map((r) => r.id));
  const orders = new Set<number>();
  for (const [id, c] of Object.entries(curricula)) {
    assert.ok(c.prerequisites.length > 0, `${id}: state prerequisites (use free text for "none")`);
    for (const p of c.prerequisites) if ("track" in p) assert.ok(ids.has(p.track) && p.track !== id, `${id}: bad prerequisite ${p.track}`);
    for (const t of c.recommendedAfter) {
      assert.ok(ids.has(t) && t !== id, `${id}: bad recommendedAfter ${t}`);
      assert.ok(curricula[t].recommendedOrder < c.recommendedOrder, `${id} is recommended after ${t}, which comes later in the suggested order`);
    }
    assert.ok(!orders.has(c.recommendedOrder), `${id}: duplicate recommendedOrder ${c.recommendedOrder}`);
    orders.add(c.recommendedOrder);
  }
});

test("estimatedHours match the lesson minutes within 35%, or the track is estimateOnly", async () => {
  for (const r of roadmaps) {
    const c = curricula[r.id];
    let minutes = 0;
    let lessons = 0;
    for (const n of NODE_DATA[r.id] ?? []) {
      if (!hasLesson(r.id, n.id)) continue;
      const lesson = await loadLesson(r.id, n.id);
      minutes += lesson?.estMinutes ?? 0;
      lessons++;
    }
    assert.ok(c.estimatedHours > 0, `${r.id}: estimatedHours`);
    if (lessons === 0) {
      assert.ok(c.estimateOnly, `${r.id} has no lessons yet, so its hours must be marked estimateOnly`);
      continue;
    }
    if (c.estimateOnly) continue; // lessons just landed: the plan stays until the integrator re-measures
    const hours = minutes / 60;
    assert.ok(Math.abs(c.estimatedHours - hours) <= hours * 0.35, `${r.id}: ${c.estimatedHours} h vs ${hours.toFixed(2)} h of lessons`);
  }
});

test("modules, assessment rules, badges and languages are well formed", () => {
  const langs = new Set<string>(LANG_IDS);
  for (const [id, c] of Object.entries(curricula)) {
    assert.deepEqual(Object.keys(c.modules).sort(), [...MODULE_ORDER].sort(), `${id}: module keys`);
    assert.ok(langs.has(c.primaryLang), `${id}: primaryLang`);
    const p = c.assessment.passing;
    assert.ok(p.quizAccuracy > 0 && p.quizAccuracy <= 1 && p.labs >= 0 && p.challenges >= 0, `${id}: passing rule`);
    assert.ok(c.assessment.criteria.length >= 3, `${id}: criteria`);
    for (const source of ["lessons", "quizzes", "labs", "challenges"] as const) {
      assert.ok(c.assessment.criteria.some((k) => k.source === source), `${id}: no assessment criterion for ${source}`);
    }
    assert.ok(c.badges.length >= 3 && c.badges.length <= 6, `${id}: ${c.badges.length} badges`);
    assert.equal(new Set(c.badges.map((b) => b.id)).size, c.badges.length, `${id}: duplicate badge ids`);
    for (const b of c.badges) {
      assert.match(b.id, /^[a-z0-9-]+$/);
      assert.ok((BADGE_ICONS as readonly string[]).includes(b.icon), `${id}.${b.id}: unknown icon ${b.icon}`);
    }
    assert.ok(c.badges.some((b) => b.rule.kind === "course"), `${id}: a badge for finishing the course`);
    for (const k of Object.keys(c.lessonLinks ?? {})) {
      assert.ok((NODE_DATA[id] ?? []).some((n) => n.id === k), `${id}: lessonLinks key "${k}" is not a node of the track`);
      const lang = c.lessonLinks?.[k]?.lang;
      assert.ok(!lang || langs.has(lang), `${id}.${k}: lang`);
    }
  }
});

test("every badge rule is reachable and evaluates deterministically from progress", async () => {
  for (const course of courses) {
    const lessons: CourseLesson[] = [];
    for (const ref of course.lessons) {
      const lesson = await loadLesson(course.id, ref.lessonId);
      assert.ok(lesson);
      lessons.push({
        lessonId: ref.lessonId,
        title: lesson.title,
        minutes: lesson.estMinutes,
        module: ref.module,
        exercises: 0,
        quizzes: lesson.sections.filter((s) => s.type === "quiz").length,
        description: "",
        practice: {
          labs: lesson.sections.flatMap((s) => (s.type === "lab" ? [{ kind: "lab" as const, ref: `${course.id}/${ref.lessonId}/${s.id}`, id: s.id, lang: s.lang, section: 0, href: "" }] : [])),
          demos: [],
          challenges: [],
          blank: null,
        },
      });
    }
    const none = courseStats(course.id, lessons, { lessons: {}, labs: {} });
    const allLabs = Object.fromEntries(lessons.flatMap((l) => l.practice.labs.map((x) => [x.ref, 1])));
    const everything = courseStats(
      course.id,
      lessons,
      { lessons: Object.fromEntries(lessons.map((l) => [`${course.id}/${l.lessonId}`, { done: 1, quiz: 1 }])), labs: allLabs }
    );
    const before = evaluateBadges(course.id, none);
    const after = evaluateBadges(course.id, everything);
    assert.ok(before.length >= 3, `${course.id}: fewer than 3 badges are available`);
    assert.ok(before.every((b) => !b.earned), `${course.id}: a badge is earned with zero progress`);
    assert.ok(after.every((b) => b.earned), `${course.id}: a badge is unreachable: ${after.filter((b) => !b.earned).map((b) => b.badge.id)}`);
    assert.ok(after.some((b) => b.badge.rule.kind === "course"));
    assert.deepEqual(evaluateBadges(course.id, everything), after, "deterministic");
  }
});

for (const [id, c] of Object.entries(curricula)) {
  const lang = c.sampleCode.lang;
  test(`sample code prints exactly its documented output: ${id}`, { skip: !localSupports(lang) }, () => {
    assert.ok(lang === "python" || lang === "javascript", "the course page can only run python and javascript");
    const r = runLocal(lang, c.sampleCode.code);
    assert.equal(r.exitCode, 0, r.stderr);
    assert.equal(r.stdout, c.sampleCode.output);
    assert.ok(c.sampleCode.code.length < 1600, "keep the sample short enough to read");
  });
}
