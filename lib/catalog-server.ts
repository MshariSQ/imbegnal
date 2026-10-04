/**
 * Build-time helpers that read lesson files. Import ONLY from server
 * components (page.tsx / generateMetadata) — this pulls lesson bodies in.
 */
import "server-only";
import { loadLesson } from "@/data/lessons";
import type { L10n, Lesson } from "@/data/lessons/types";
import { getCourse, type ModuleKey } from "./catalog";

export interface LessonMeta {
  lessonId: string;
  title: L10n;
  minutes: number;
  module: ModuleKey;
  exercises: number;
  quizzes: number;
}

export function lessonStats(lesson: Lesson) {
  return {
    exercises: lesson.sections.filter((s) => s.type === "exercise").length,
    quizzes: lesson.sections.filter((s) => s.type === "quiz").length,
  };
}

/** Ordered lesson metadata for a course (titles, durations, activity counts). */
export async function getCourseOutline(trackId: string): Promise<LessonMeta[]> {
  const course = getCourse(trackId);
  if (!course) return [];
  const metas = await Promise.all(
    course.lessons.map(async (ref) => {
      const lesson = await loadLesson(trackId, ref.lessonId);
      if (!lesson) return null;
      return { lessonId: ref.lessonId, title: lesson.title, minutes: lesson.estMinutes, module: ref.module, ...lessonStats(lesson) };
    })
  );
  return metas.filter((m): m is LessonMeta => m !== null);
}
