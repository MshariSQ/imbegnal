import { courses } from "@/lib/catalog";
import { getCourseOutline } from "@/lib/catalog-server";
import Dashboard, { type DashboardCourse } from "@/components/learn/Dashboard";

export default async function DashboardPage() {
  // Lesson titles/durations are resolved at build time; progress is client-side.
  const data: DashboardCourse[] = await Promise.all(
    courses.map(async (c) => ({
      id: c.id,
      icon: c.roadmap.icon,
      accent: c.roadmap.accent,
      level: c.roadmap.level,
      lessons: (await getCourseOutline(c.id)).map((l) => ({ id: l.lessonId, title: l.title, minutes: l.minutes })),
    }))
  );
  return <Dashboard courses={data} />;
}
