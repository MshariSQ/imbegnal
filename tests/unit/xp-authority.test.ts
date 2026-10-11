// XP authority: the per-lesson bonus ceiling the Worker clamps synced state to
// (generated catalog), and the client rules for lab XP (lib/lab-progress.ts, lib/xp.ts).
import { test } from "node:test";
import assert from "node:assert/strict";
import { courses } from "../../lib/catalog";
import { loadLesson } from "../../data/lessons";
import { catalog } from "../../worker/src/generated/catalog";
import { LAB_XP, XP, lessonMaxBonus } from "../../shared/xp";
import { XP as storeXp } from "../../lib/study-store";

test("one XP table: the study store re-exports shared/xp, and lab XP is the exercise XP", () => {
  assert.equal(storeXp, XP);
  assert.equal(LAB_XP, XP.exercise);
});

test("lessonMaxBonus counts what the lesson components can award: exercises with tests and quizzes with questions", () => {
  assert.equal(lessonMaxBonus([]), 0);
  assert.equal(
    lessonMaxBonus([
      { type: "text" },
      { type: "code-demo" },
      { type: "exercise", tests: [{}] },
      { type: "exercise", tests: [{}, {}] },
      { type: "exercise", tests: [] }, // no "Check" button: never passes
      { type: "quiz", questions: [{}, {}] },
      { type: "quiz", questions: [] }, // nothing to pick: never passes
      { type: "lab", tests: [{}] }, // lab XP is the Worker's (xp_ledger), not bonus
    ]),
    2 * XP.exercise + XP.quiz,
  );
});

test("the generated catalog carries every course lesson's maxBonus, computed from the lesson itself", async () => {
  let withLabs = 0;
  for (const course of courses) {
    const track = catalog.tracks.find((t) => t.id === course.id);
    assert.ok(track, `catalog track ${course.id}`);
    assert.deepEqual(Object.keys(track.maxBonus ?? {}), track.lessons, `${course.id}: one entry per lesson, in order`);
    for (const id of track.lessons) {
      const lesson = await loadLesson(course.id, id);
      assert.ok(lesson, `${course.id}/${id}`);
      const exercises = lesson.sections.filter((s) => s.type === "exercise" && s.tests.length > 0).length;
      const quizzes = lesson.sections.filter((s) => s.type === "quiz" && s.questions.length > 0).length;
      assert.equal(track.maxBonus![id], exercises * XP.exercise + quizzes * XP.quiz, `${course.id}/${id}`);
      if (lesson.sections.some((s) => s.type === "lab")) withLabs++;
    }
  }
  assert.ok(withLabs > 0, "some lessons have labs, and their XP is not part of maxBonus");
});
