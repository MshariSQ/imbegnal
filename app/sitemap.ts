import type { MetadataRoute } from "next";
import { courses } from "@/lib/catalog";
import { roadmaps } from "@/data/roadmaps";
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
    url("/learn/", 0.9, "weekly"),
    ...courses.map((c) => url(`/learn/${c.id}/`, 0.8)),
    ...courses.flatMap((c) => c.lessons.map((l) => url(`/learn/${c.id}/${l.lessonId}/`, 0.7))),
    url("/roadmaps/", 0.8),
    ...roadmaps.map((r) => url(`/roadmaps/${r.id}/`, 0.6)),
    url("/certifications/", 0.6),
    url("/courses/", 0.5),
    url("/pricing/", 0.5),
    url("/about/", 0.4),
    url("/privacy/", 0.2),
    url("/terms/", 0.2),
  ];
}
