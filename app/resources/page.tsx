import type { Metadata } from "next";
import { courses } from "@/data/courses";
import { pageOpenGraph } from "@/lib/site";
import ExternalResources from "@/components/courses/ExternalResources";

const title = "External resources";
const description = `${courses.length} hand-picked courses from Google, Harvard, IBM, freeCodeCamp and other educators, filtered by field and price. Not IMBEGNAL courses: each link opens the provider's site.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/resources/" },
  openGraph: pageOpenGraph({ title: `${title} · IMBEGNAL`, description, url: "/resources/" }),
};

export default function ResourcesPage() {
  return <ExternalResources />;
}
