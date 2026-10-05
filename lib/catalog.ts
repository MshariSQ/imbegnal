/**
 * Course catalog — derived from the existing roadmap + lesson data so there is
 * one source of truth. A "course" is a roadmap track; its "modules" are the
 * roadmap's status groups (foundations → core → advanced); its "lessons" are
 * the topic nodes that have an interactive lesson.
 *
 * This module is light (no lesson bodies) and safe to import client-side.
 * Lesson content itself is loaded per-page (see app/learn/[track]/[lesson]).
 */
import { roadmaps, type Roadmap } from "@/data/roadmaps";
import { NODE_DATA, type RoadmapNodeInfo } from "@/data/roadmap-nodes";
import { hasLesson } from "@/data/lessons";

export type ModuleKey = RoadmapNodeInfo["status"];
export const MODULE_ORDER: ModuleKey[] = ["required", "important", "optional"];

export interface CourseLessonRef {
  trackId: string;
  lessonId: string;
  label: string; // English topic label (localized title lives in the lesson file)
  module: ModuleKey;
}

export interface Course {
  id: string;
  roadmap: Roadmap;
  lessons: CourseLessonRef[]; // in study order (module order, then roadmap order)
}

function buildCourse(r: Roadmap): Course {
  const nodes = NODE_DATA[r.id] ?? [];
  const lessons = MODULE_ORDER.flatMap((m) =>
    nodes
      .filter((n) => n.status === m && hasLesson(r.id, n.id))
      .map((n) => ({ trackId: r.id, lessonId: n.id, label: n.label, module: m }))
  );
  return { id: r.id, roadmap: r, lessons };
}

export const courses: Course[] = roadmaps.map(buildCourse).filter((c) => c.lessons.length > 0);

export function getCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export const lessonKey = (trackId: string, lessonId: string) => `${trackId}/${lessonId}`;

export function lessonHref(trackId: string, lessonId: string) {
  return `/learn/${trackId}/${lessonId}/`;
}

/** Previous/next lesson in a course's study order. */
export function neighbors(trackId: string, lessonId: string) {
  const course = getCourse(trackId);
  const i = course?.lessons.findIndex((l) => l.lessonId === lessonId) ?? -1;
  return {
    prev: i > 0 ? course!.lessons[i - 1] : null,
    next: course && i >= 0 && i < course.lessons.length - 1 ? course.lessons[i + 1] : null,
    index: i,
    total: course?.lessons.length ?? 0,
  };
}
