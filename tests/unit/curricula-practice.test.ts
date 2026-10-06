import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { roadmaps } from "../../data/roadmaps";
import { loadLesson } from "../../data/lessons";
import { curricula } from "../../data/curricula";
import type { ChallengeMeta } from "../../shared/challenges";
import { parseCodeLabQuery } from "../../shared/links";
import { courses, pickChallenges, practiceCount, resolvePractice } from "../../lib/catalog";

function challenge(over: Partial<ChallengeMeta> & Pick<ChallengeMeta, "id" | "track">): ChallengeMeta {
  return {
    topic: "misc",
    title: { en: over.id, ar: over.id },
    summary: { en: "s", ar: "s" },
    description: { en: "SECRET STORY", ar: "قصة" },
    difficulty: 1,
    points: 100,
    estMinutes: 10,
    kind: "flag",
    ...over,
  };
}

test("every lesson of every track has at least one practice link, and every link round-trips through shared/links", async () => {
  let lessons = 0;
  for (const course of courses) {
    for (const ref of course.lessons) {
      const lesson = await loadLesson(course.id, ref.lessonId);
      assert.ok(lesson, `${course.id}/${ref.lessonId}`);
      const p = resolvePractice(course.id, ref.lessonId, lesson.sections, []);
      assert.ok(practiceCount(p) >= 1, `${course.id}/${ref.lessonId} has no practice link`);
      lessons++;

      for (const lab of p.labs) {
        const intent = parseCodeLabQuery(new URL(lab.href, "https://x.test").searchParams);
        assert.deepEqual(intent, { kind: "exercise", ref: lab.ref, lang: undefined });
        assert.equal(lesson.sections[lab.section].type, "lab");
      }
      for (const d of p.demos) {
        const intent = parseCodeLabQuery(new URL(d.href, "https://x.test").searchParams);
        assert.deepEqual(intent, { kind: "demo", track: course.id, lesson: ref.lessonId, section: d.section });
        const section = lesson.sections[d.section];
        assert.ok(section.type === "code-demo" || section.type === "exercise", "demo points at a runnable section");
        if (section.type === "code-demo") assert.notEqual(section.runnable, false);
      }
      if (p.blank) {
        const intent = parseCodeLabQuery(new URL(p.blank.href, "https://x.test").searchParams);
        assert.deepEqual(intent, { kind: "blank", lang: p.blank.lang });
      }
    }
  }
  assert.ok(lessons >= 60, `only ${lessons} lessons checked`);
});

test("every runnable code-demo and exercise is offered, pseudo-code demos are not", async () => {
  const lesson = await loadLesson("cyber-security", "python");
  assert.ok(lesson);
  const p = resolvePractice("cyber-security", "python", lesson.sections, []);
  const expected = lesson.sections.flatMap((s, i) => (s.type === "exercise" || (s.type === "code-demo" && s.runnable !== false) ? [i] : []));
  assert.deepEqual(p.demos.map((d) => d.section), expected);
  assert.ok(p.labs.some((l) => l.id === "failed-logins"));
});

test("lab: false drops the blank Code Lab only when the lesson has other practice", () => {
  const sections = [{ type: "text" as const, body: { en: "x", ar: "x" } }];
  // html-css opts out of a blank lab; with no demos/labs/challenges it still gets the fallback
  const alone = resolvePractice("frontend", "html-css", sections, []);
  assert.ok(alone.blank, "fallback keeps the guarantee");
  const withDemo = resolvePractice("frontend", "html-css", [...sections, { type: "code-demo", lang: "web", code: "<p>x</p>", explanation: { en: "x", ar: "x" } }], []);
  assert.equal(withDemo.blank, null);
  assert.equal(withDemo.demos.length, 1);
  assert.equal(withDemo.demos[0].lang, "web");
});

test("the blank Code Lab uses the lesson language, else the track's primaryLang", () => {
  const sections = [{ type: "text" as const, body: { en: "x", ar: "x" } }];
  assert.equal(resolvePractice("cyber-security", "linux", sections, []).blank?.lang, "bash");
  assert.equal(resolvePractice("cyber-security", "setup", sections, []).blank?.lang, curricula["cyber-security"].primaryLang);
  assert.equal(resolvePractice("frontend", "typescript", sections, []).blank?.lang, "typescript");
});

test("recommended challenges: empty registry works; lesson links, difficulty order and no leaked statements", () => {
  assert.deepEqual(pickChallenges([], "cyber-security"), []);
  assert.deepEqual(pickChallenges([], "cyber-security", "linux"), []);

  const registry = [
    challenge({ id: "c-hard", track: "cyber-security", difficulty: 3, points: 300 }),
    challenge({ id: "c-easy", track: "cyber-security", difficulty: 1, points: 50 }),
    challenge({ id: "c-linked", track: "cyber-security", difficulty: 2, points: 150, lessons: ["cyber-security/linux"] }),
    challenge({ id: "other-track", track: "frontend", difficulty: 1, lessons: ["frontend/javascript"] }),
  ];
  assert.deepEqual(pickChallenges(registry, "cyber-security").map((c) => c.id), ["c-linked", "c-easy", "c-hard"]);
  assert.deepEqual(pickChallenges(registry, "cyber-security", "linux").map((c) => c.id), ["c-linked"]);
  assert.deepEqual(pickChallenges(registry, "cyber-security", "python"), []);
  assert.equal(pickChallenges(registry, "cyber-security", undefined, 2).length, 2);
  const card = pickChallenges(registry, "cyber-security")[0];
  assert.equal(card.href, "/challenges/c-linked/");
  assert.ok(!JSON.stringify(card).includes("SECRET STORY"), "cards carry public card data only");

  const withChallenges = resolvePractice("cyber-security", "linux", [], registry);
  assert.deepEqual(withChallenges.challenges.map((c) => c.id), ["c-linked"]);
});

test("catalog-server helpers read the real registries (server-only marker stubbed for node)", async () => {
  const require = createRequire(import.meta.url);
  const marker = require.resolve("server-only");
  require.cache[marker] = { id: marker, filename: marker, loaded: true, exports: {}, children: [], paths: [], path: "", parent: null } as unknown as NodeJS.Module;
  const server = await import("../../lib/catalog-server");
  for (const r of roadmaps) {
    assert.ok(Array.isArray(server.recommendedChallenges(r.id)));
    const course = courses.find((c) => c.id === r.id);
    if (!course) continue;
    const outline = await server.getCourseOutline(r.id);
    assert.equal(outline.length, course.lessons.length);
    for (const l of outline) assert.ok(practiceCount(l.practice) >= 1);
    const first = course.lessons[0];
    const p = await server.practiceFor(r.id, first.lessonId);
    assert.ok(p && practiceCount(p) >= 1);
  }
  assert.equal(await server.practiceFor("frontend", "does-not-exist"), null);
});
