import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IMBEGNAL",
    short_name: "IMBEGNAL",
    description: "Free bilingual study platform: interactive courses, quizzes, notes and an AI tutor.",
    start_url: "/dashboard/",
    display: "standalone",
    background_color: "#0a0c10",
    theme_color: "#10b981",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
