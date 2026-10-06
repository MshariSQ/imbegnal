/**
 * Build-time helpers that read lesson files or the challenge registry. Import
 * ONLY from server components (page.tsx / generateMetadata) — this pulls lesson
 * bodies in. Pure resolvers live in lib/catalog.ts so tests can run them.
 */
import "server-only";
import { loadLesson } from "@/data/lessons";
import { challenges } from "@/data/challenges";
import type { Lesson } from "@/data/lessons/types";
import {
  getCourse,
  pickChallenges,
  resolvePractice,
  type CourseLesson,
  type LessonPractice,
  type PracticeChallenge,
} from "./catalog";
import { NODE_DATA } from "@/data/roadmap-nodes";

export function lessonStats(lesson: Lesson) {
  return {
    exercises: lesson.sections.filter((s) => s.type === "exercise").length,
    quizzes: lesson.sections.filter((s) => s.type === "quiz").length,
  };
}

/** Challenges worth doing for a track (or one of its lessons). An empty registry yields []. */
export function recommendedChallenges(trackId: string, lessonId?: string, limit?: number): PracticeChallenge[] {
  return pickChallenges(challenges, trackId, lessonId, limit);
}

/**
 * Everything a learner can practice for a lesson: its graded labs (deep links
 * into Code Lab), runnable demos/exercises, recommended challenges and the
 * blank Code Lab fallback. Every lesson has at least one link.
 */
export async function practiceFor(trackId: string, lessonId: string): Promise<LessonPractice | null> {
  const lesson = await loadLesson(trackId, lessonId);
  return lesson ? resolvePractice(trackId, lessonId, lesson.sections, challenges) : null;
}

/** Ordered lesson data for a course (titles, durations, activity counts, practice). */
export async function getCourseOutline(trackId: string): Promise<CourseLesson[]> {
  const course = getCourse(trackId);
  if (!course) return [];
  const desc = Object.fromEntries((NODE_DATA[trackId] ?? []).map((n) => [n.id, n.description]));
  const metas = await Promise.all(
    course.lessons.map(async (ref): Promise<CourseLesson | null> => {
      const lesson = await loadLesson(trackId, ref.lessonId);
      if (!lesson) return null;
      return {
        lessonId: ref.lessonId,
        title: lesson.title,
        minutes: lesson.estMinutes,
        module: ref.module,
        description: desc[ref.lessonId] ?? "",
        practice: resolvePractice(trackId, ref.lessonId, lesson.sections, challenges),
        ...lessonStats(lesson),
      };
    })
  );
  return metas.filter((m): m is CourseLesson => m !== null);
}
