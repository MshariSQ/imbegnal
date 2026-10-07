import type { Metadata } from "next";
import { challenges } from "@/data/challenges";
import { roadmaps } from "@/data/roadmaps";
import InstructorDashboard from "@/components/instructor/InstructorDashboard";

// Private tool: not in the navbar or the sitemap, and not for search engines.
export const metadata: Metadata = {
  title: "Instructor analytics",
  description: "Aggregated learning analytics for IMBEGNAL instructors: runs, course completion, exercise pass rates and challenge solves.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/instructor/" },
};

export default function InstructorPage() {
  // Titles come from the canonical sources at build time; only id -> title maps are shipped to the browser.
  const trackTitles = Object.fromEntries(roadmaps.map((r) => [r.id, r.title]));
  const challengeTitles = Object.fromEntries(challenges.map((c) => [c.id, c.title]));
  return <InstructorDashboard trackTitles={trackTitles} challengeTitles={challengeTitles} />;
}
