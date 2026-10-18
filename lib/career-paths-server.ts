/**
 * Build-time career path data. Import ONLY from server components (page.tsx / generateMetadata):
 * it reads lesson files through lib/catalog-server to sum lesson minutes.
 */
import "server-only";
import { careerPaths } from "@/data/career-paths";
import { courses } from "./catalog";
import { getCourseOutline } from "./catalog-server";
import { resolvePaths, type CourseFigures, type PathSummary } from "./career-paths";

/** Lesson ids (study order) and total lesson minutes of every course in the catalog. */
export async function courseFigures(): Promise<Record<string, CourseFigures>> {
  const entries = await Promise.all(
    courses.map(async (c): Promise<[string, CourseFigures]> => {
      const outline = await getCourseOutline(c.id);
      return [c.id, { lessonIds: outline.map((l) => l.lessonId), minutes: outline.reduce((n, l) => n + l.minutes, 0) }];
    })
  );
  return Object.fromEntries(entries);
}

/** Every career path with its computed lessons and hours. */
export async function pathSummaries(): Promise<PathSummary[]> {
  return resolvePaths(await courseFigures(), careerPaths);
}
