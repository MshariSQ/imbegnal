import type { Metadata } from "next";
import { courses } from "@/lib/catalog";
import { getCourseOutline } from "@/lib/catalog-server";
import CourseCatalog, { type CatalogCourse } from "@/components/learn/CourseCatalog";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Free interactive courses in Cyber Security, AI, Data Science, Cloud, DevOps, Frontend, Backend and UI/UX — bilingual lessons, coding exercises, quizzes and an AI tutor.",
  alternates: { canonical: "/learn/" },
};

export default async function LearnPage() {
  const data: CatalogCourse[] = await Promise.all(
    courses.map(async (c) => {
      const outline = await getCourseOutline(c.id);
      return {
        id: c.id,
        icon: c.roadmap.icon,
        accent: c.roadmap.accent,
        level: c.roadmap.level,
        duration: c.roadmap.duration,
        lessons: outline.map((l) => ({ id: l.lessonId, title: l.title, minutes: l.minutes })),
        minutes: outline.reduce((sum, l) => sum + l.minutes, 0),
      };
    })
  );
  return <CourseCatalog courses={data} />;
}
