/**
 * What the career path pages render (PathSummary, resolved on the server by lib/career-paths.ts) and
 * the learner's progress in it. No value imports from data/: client components that get a PathSummary
 * as props import this module, so the paths' text (data/career-paths.ts) stays out of their bundle.
 */
import type { PathCategory, PathLevel } from "@/data/career-path-keys";
import type { L10n } from "@/data/lessons/types";

export interface PathCourse {
  id: string;
  /** 1-based position in the path ("Course 2 of 4"). */
  position: number;
  level: PathLevel;
  why: L10n;
  /** True for a course with lessons; false for a planned course ("coming soon", never linked). */
  available: boolean;
  title: L10n;
  description: L10n;
  icon: string;
  accent: string;
  /** Lesson ids in study order (empty for a coming-soon course). */
  lessonIds: string[];
  minutes: number;
}

export interface PathTotals {
  courses: number;
  available: number;
  comingSoon: number;
  /** Lessons and minutes of the available courses only. */
  lessons: number;
  minutes: number;
}

/** Everything the path pages show about a path, without the learner's progress. Serializable. */
export interface PathSummary {
  id: string;
  title: L10n;
  icon: string;
  accent: string;
  category: PathCategory;
  description: L10n;
  ifYouLike: L10n[];
  skills: L10n[];
  jobs: L10n[];
  courses: PathCourse[];
  totals: PathTotals;
  /** Levels present in the path, Beginner first. */
  levels: PathLevel[];
}

/** Whole hours, at least 1, the way course cards round them. */
export function hoursFromMinutes(minutes: number): number {
  return Math.max(1, Math.round(minutes / 60));
}

// ── Progress (the learner's study store; client-side) ────────────────────────────────────────────

export type LessonRecords = Readonly<Record<string, { done?: number | boolean } | undefined>>;

export type PathState =
  /** No lesson of the path done. */
  | "not-started"
  | "in-progress"
  /** Every available course is complete, but the path still has coming-soon courses. */
  | "available-complete"
  /** Every course of the path exists and is complete. */
  | "complete";

export interface CourseProgress {
  done: number;
  total: number;
  complete: boolean;
}

export interface PathProgress {
  /** Lessons done / lessons of the available courses. */
  done: number;
  total: number;
  /** 0..1 */
  ratio: number;
  perCourse: Record<string, CourseProgress>;
  coursesComplete: number;
  state: PathState;
}

/**
 * Progress in a path from the study store (`lessons` keyed "track/lesson"). A course's lessons count
 * in every path that contains it, because the key is the course's, not the path's.
 */
export function pathProgress(summary: Pick<PathSummary, "courses">, lessons: LessonRecords): PathProgress {
  const perCourse: Record<string, CourseProgress> = {};
  let done = 0;
  let total = 0;
  let coursesComplete = 0;
  let available = 0;
  for (const c of summary.courses) {
    if (!c.available) continue;
    available++;
    const d = c.lessonIds.filter((id) => {
      const v = lessons[`${c.id}/${id}`]?.done;
      return v === true || (typeof v === "number" && v > 0);
    }).length;
    const complete = c.lessonIds.length > 0 && d === c.lessonIds.length;
    perCourse[c.id] = { done: d, total: c.lessonIds.length, complete };
    done += d;
    total += c.lessonIds.length;
    if (complete) coursesComplete++;
  }
  const allAvailableDone = available > 0 && coursesComplete === available;
  const state: PathState =
    allAvailableDone && available === summary.courses.length ? "complete"
    : allAvailableDone ? "available-complete"
    : done > 0 ? "in-progress"
    : "not-started";
  return { done, total, ratio: total ? done / total : 0, perCourse, coursesComplete, state };
}

/**
 * The first available course that is not complete (where "Start" / "Continue" goes). Undefined when
 * every available course is complete: there is nothing left to continue until a coming-soon course
 * is published.
 */
export function nextCourse(summary: Pick<PathSummary, "courses">, progress: PathProgress): PathCourse | undefined {
  return summary.courses.find((c) => c.available && !progress.perCourse[c.id]?.complete);
}
