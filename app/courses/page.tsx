import type { Metadata } from "next";
import { courses, trackTitle } from "@/lib/catalog";
import { courseFigures } from "@/lib/career-paths-server";
import { pageOpenGraph } from "@/lib/site";
import CourseDirectory, { type DirectoryCourse } from "@/components/courses/CourseDirectory";

const title = "Course catalog";
// Track names come from roadmaps[]: a rename (or a new course with lessons) updates this text.
const description = `Every IMBEGNAL course — ${courses.map((c) => trackTitle(c.id)).join(", ")} — with its lessons, hours, level and the career paths it counts toward. Free, in English and Arabic.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/courses/" },
  openGraph: pageOpenGraph({ title: `${title} · IMBEGNAL`, description, url: "/courses/" }),
};

export default async function CoursesPage() {
  const figures = await courseFigures();
  const data: DirectoryCourse[] = courses.map((c) => ({
    id: c.id,
    level: c.roadmap.level,
    lessonIds: figures[c.id]?.lessonIds ?? [],
    minutes: figures[c.id]?.minutes ?? 0,
  }));
  return <CourseDirectory courses={data} />;
}
