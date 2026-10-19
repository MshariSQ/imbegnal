import type { MetadataRoute } from "next";
import { courses } from "@/lib/catalog";
import { roadmaps } from "@/data/roadmaps";
import { careerPaths } from "@/data/career-paths";
import { SITE_URL } from "@/lib/site";

// Statically generated at build time (required by `output: "export"`).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "monthly") => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    url("/", 1, "weekly"),
    url("/courses/", 0.9, "weekly"),
    url("/learn/", 0.8, "weekly"),
    ...courses.map((c) => url(`/learn/${c.id}/`, 0.8)),
    ...courses.flatMap((c) => c.lessons.map((l) => url(`/learn/${c.id}/${l.lessonId}/`, 0.7))),
    // Career paths (role pages) and each course's map (the URLs roadmaps had before career paths)
    url("/roadmaps/", 0.8, "weekly"),
    ...careerPaths.map((p) => url(`/roadmaps/${p.id}/`, 0.7)),
    ...roadmaps.map((r) => url(`/roadmaps/${r.id}/`, 0.5)),
    url("/certifications/", 0.6),
    url("/resources/", 0.5),
    url("/pricing/", 0.5),
    url("/about/", 0.4),
    url("/privacy/", 0.2),
    url("/terms/", 0.2),
  ];
}
