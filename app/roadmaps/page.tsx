import type { Metadata } from "next";
import { careerPaths } from "@/data/career-paths";
import { pathSummaries } from "@/lib/career-paths-server";
import { SITE_URL, pageOpenGraph } from "@/lib/site";
import CareerPathsGrid from "@/components/paths/CareerPathsGrid";

const title = "Career paths";
// Role names come from data/career-paths.ts: a new path updates this text.
const description = `Career paths for ${careerPaths.map((p) => p.title.en).join(", ")}: free IMBEGNAL courses ordered from beginner to advanced for each job role, in English and Arabic.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/roadmaps/" },
  openGraph: pageOpenGraph({ title: `${title} · IMBEGNAL`, description, url: "/roadmaps/" }),
};

export default async function RoadmapsPage() {
  const paths = await pathSummaries();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "IMBEGNAL career paths",
    itemListElement: paths.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title.en, url: `${SITE_URL}/roadmaps/${p.id}/` })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <CareerPathsGrid paths={paths} />
    </>
  );
}
