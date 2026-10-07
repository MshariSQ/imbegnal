import type { Metadata } from "next";
import { courses, trackTitle } from "@/lib/catalog";
import { getCourseOutline } from "@/lib/catalog-server";
import CourseCatalog, { type CatalogCourse } from "@/components/learn/CourseCatalog";

// Track names come from roadmaps[]: a rename (or a new track with lessons) updates this text.
export const metadata: Metadata = {
  title: "Courses",
  description: `Free interactive courses in ${courses.map((c) => trackTitle(c.id)).join(", ")} — bilingual lessons, graded lab exercises, quizzes and an AI tutor.`,
  alternates: { canonical: "/learn/" },
};

export default async function LearnPage() {
  const data: CatalogCourse[] = await Promise.all(
    courses.map(async (c) => {
      const outline = await getCourseOutline(c.id);
      return {
        id: c.id,
        level: c.roadmap.level,
        lessons: outline.map((l) => ({ id: l.lessonId, title: l.title, minutes: l.minutes })),
        minutes: outline.reduce((sum, l) => sum + l.minutes, 0),
      };
    })
  );
  return <CourseCatalog courses={data} />;
}
