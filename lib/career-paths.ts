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
import { PATH_LEVELS, careerPaths, getPlannedCourse, type CareerPath, type PathLevel } from "@/data/career-paths";
import type { L10n } from "@/data/lessons/types";
import { getCourse, trackMeta } from "./catalog";
import type { PathCourse, PathSummary } from "./path-progress";

// The shapes the pages render and the progress helpers are in lib/path-progress.ts (no path text,
// so client components that get a PathSummary as props stay light); re-exported for the callers here.
export {
  hoursFromMinutes,
  nextCourse,
  pathProgress,
  type CourseProgress,
  type LessonRecords,
  type PathCourse,
  type PathProgress,
  type PathState,
  type PathSummary,
  type PathTotals,
} from "./path-progress";

/** What a course is made of: its lessons in study order and their total minutes. */
export interface CourseFigures {
  lessonIds: string[];
  minutes: number;
}

/** Course id -> figures, for the courses that exist (a course with lessons in lib/catalog). */
export type CourseFiguresMap = Readonly<Record<string, CourseFigures | undefined>>;

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

/** One "Part of these career paths" link, small enough to pass from a server page as props. */
export interface CoursePathLink {
  id: string;
  title: L10n;
  icon: string;
  position: number;
  total: number;
  level: PathLevel;
}

/** pathsWithCourse as plain links (the server pages hand these to the client, not the path data). */
export function coursePathLinks(courseId: string, source: readonly CareerPath[] = careerPaths): CoursePathLink[] {
  return pathsWithCourse(courseId, source).map(({ path, position, total, level }) => ({ id: path.id, title: path.title, icon: path.icon, position, total, level }));
}

/** Course level from data/roadmaps.ts ("Beginner", …) as a path level; "All Levels" counts as every level. */
export function trackLevels(level: string): PathLevel[] {
  const lv = level.toLowerCase();
  return (PATH_LEVELS as readonly string[]).includes(lv) ? [lv as PathLevel] : [...PATH_LEVELS];
}

