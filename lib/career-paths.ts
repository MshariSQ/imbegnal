/**
 * Career paths, resolved against the course catalog. Pure and light (no lesson bodies), so it runs
 * in the browser, on the server and in the unit tests.
 *
 * Path data (roles, course order, levels) lives in data/career-paths.ts. What a path is made of in
 * numbers (lessons, minutes) is computed here from `CourseFigures`: the lesson ids of each course in
 * the catalog (lib/catalog, the same list the Worker's generated catalog has) and their minutes
 * (lesson `estMinutes`, read on the server by lib/catalog-server). Nothing is hard-coded, so lessons
 * added to a course are counted in every path that contains it.
 */
import {
  PATH_LEVELS,
  careerPaths,
  getPlannedCourse,
  type CareerPath,
  type PathCategory,
  type PathLevel,
} from "@/data/career-paths";
import type { L10n } from "@/data/lessons/types";
import { getCourse, trackMeta } from "./catalog";

/** What a course is made of: its lessons in study order and their total minutes. */
export interface CourseFigures {
  lessonIds: string[];
  minutes: number;
}

/** Course id -> figures, for the courses that exist (a course with lessons in lib/catalog). */
export type CourseFiguresMap = Readonly<Record<string, CourseFigures | undefined>>;

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

/**
 * A course is available when it is in the course catalog with at least one lesson. A course id
 * that is neither available nor planned is a data error (the unit tests reject it); it is shown as
 * coming soon with its id so a page never breaks.
 */
function resolveCourse(id: string, figures: CourseFiguresMap) {
  const meta = getCourse(id) ? trackMeta(id) : null;
  const fig = figures[id];
  if (meta && fig && fig.lessonIds.length > 0) {
    return { available: true, title: meta.title, description: meta.description, icon: meta.icon, accent: meta.accent, lessonIds: fig.lessonIds, minutes: fig.minutes };
  }
  const planned = getPlannedCourse(id);
  const known = trackMeta(id);
  return {
    available: false,
    title: planned?.title ?? known?.title ?? { en: id, ar: id },
    description: planned?.description ?? known?.description ?? { en: "", ar: "" },
    icon: planned?.icon ?? known?.icon ?? "📘",
    accent: planned?.accent ?? known?.accent ?? "#10b981",
    lessonIds: [],
    minutes: 0,
  };
}

export function resolvePath(path: CareerPath, figures: CourseFiguresMap): PathSummary {
  const courses: PathCourse[] = path.courses.map((step, i) => ({
    id: step.course,
    position: i + 1,
    level: step.level,
    why: step.why,
    ...resolveCourse(step.course, figures),
  }));
  const available = courses.filter((c) => c.available);
  return {
    id: path.id,
    title: path.title,
    icon: path.icon,
    accent: path.accent,
    category: path.category,
    description: path.description,
    ifYouLike: path.ifYouLike,
    skills: path.skills,
    jobs: path.jobs,
    courses,
    totals: {
      courses: courses.length,
      available: available.length,
      comingSoon: courses.length - available.length,
      lessons: available.reduce((n, c) => n + c.lessonIds.length, 0),
      minutes: available.reduce((n, c) => n + c.minutes, 0),
    },
    levels: PATH_LEVELS.filter((lv) => courses.some((c) => c.level === lv)),
  };
}

export function resolvePaths(figures: CourseFiguresMap, source: readonly CareerPath[] = careerPaths): PathSummary[] {
  return source.map((p) => resolvePath(p, figures));
}

export interface PathMembership {
  path: CareerPath;
  /** 1-based position of the course in that path. */
  position: number;
  total: number;
  level: PathLevel;
}

/** The career paths that include a course, in data order. */
export function pathsWithCourse(courseId: string, source: readonly CareerPath[] = careerPaths): PathMembership[] {
  return source.flatMap((path) => {
    const i = path.courses.findIndex((s) => s.course === courseId);
    return i < 0 ? [] : [{ path, position: i + 1, total: path.courses.length, level: path.courses[i].level }];
  });
}

/** Course level from data/roadmaps.ts ("Beginner", …) as a path level; "All Levels" counts as every level. */
export function trackLevels(level: string): PathLevel[] {
  const lv = level.toLowerCase();
  return (PATH_LEVELS as readonly string[]).includes(lv) ? [lv as PathLevel] : [...PATH_LEVELS];
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

/** The first available course that is not complete (where "Continue" goes), else the first available one. */
export function nextCourse(summary: Pick<PathSummary, "courses">, progress: PathProgress): PathCourse | undefined {
  const available = summary.courses.filter((c) => c.available);
  return available.find((c) => !progress.perCourse[c.id]?.complete) ?? available[0];
}
