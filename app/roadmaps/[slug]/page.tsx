import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { roadmaps } from "@/data/roadmaps";
import { careerPaths, getCareerPath } from "@/data/career-paths";
import { NODE_DATA } from "@/data/roadmap-nodes";
import { trackDescription, trackTitle } from "@/lib/catalog";
import { resolvePath } from "@/lib/career-paths";
import { courseFigures } from "@/lib/career-paths-server";
import { SITE_URL, pageOpenGraph } from "@/lib/site";
import CareerPathPage from "@/components/paths/CareerPathPage";
import RoadmapWrapper from "./RoadmapWrapper";

/**
 * One segment, two kinds of page (their ids never collide: tests/unit/career-paths.test.ts):
 *  - /roadmaps/<path-id>/   a career path (role page)
 *  - /roadmaps/<track-id>/  that course's map: the URL roadmaps had before career paths, kept so links
 *    and the roadmap node progress stored under the track id (/api/progress) keep working.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return [...careerPaths.map((p) => ({ slug: p.id })), ...roadmaps.map((r) => ({ slug: r.id }))];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const path = getCareerPath(slug);
  if (path) {
    const title = `${path.title.en} career path`;
    const description = path.description.en;
    return { title, description, alternates: { canonical: `/roadmaps/${slug}/` }, openGraph: pageOpenGraph({ title, description, url: `/roadmaps/${slug}/` }) };
  }
  if (roadmaps.some((r) => r.id === slug)) {
    const title = `${trackTitle(slug)} course map`;
    const description = `Topic-by-topic map of the ${trackTitle(slug)} course: ${trackDescription(slug)}. Mark topics done and find free videos, books and official docs for each one.`;
    return { title, description, alternates: { canonical: `/roadmaps/${slug}/` }, openGraph: pageOpenGraph({ title, description, url: `/roadmaps/${slug}/` }) };
  }
  return {};
}

export default async function RoadmapPage({ params }: Props) {
  const { slug } = await params;

  const path = getCareerPath(slug);
  if (path) {
    const summary = resolvePath(path, await courseFigures());
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "EducationalOccupationalProgram",
      name: `${path.title.en} career path`,
      description: path.description.en,
      url: `${SITE_URL}/roadmaps/${path.id}/`,
      inLanguage: ["en", "ar"],
      educationalProgramMode: "online",
      provider: { "@type": "Organization", name: "IMBEGNAL", sameAs: SITE_URL },
      offers: { "@type": "Offer", price: 0, priceCurrency: "USD", category: "Free" },
      hasCourse: summary.courses
        .filter((c) => c.available)
        .map((c) => ({
          "@type": "Course",
          name: c.title.en,
          description: c.description.en,
          url: `${SITE_URL}/learn/${c.id}/`,
          provider: { "@type": "Organization", name: "IMBEGNAL", sameAs: SITE_URL },
        })),
    };
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <CareerPathPage path={summary} />
      </>
    );
  }

  const roadmap = roadmaps.find((r) => r.id === slug);
  if (!roadmap) notFound();

  const nodeData = NODE_DATA[slug] ?? [];

  if (nodeData.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen text-fg-subtle">
        <div className="text-center">
          <div className="text-5xl mb-4">{roadmap.icon}</div>
          <p className="text-lg font-semibold text-fg mb-2">{roadmap.title} course map coming soon</p>
          <p className="text-sm">We&apos;re building this one. Check back soon!</p>
        </div>
      </div>
    );
  }

  return <RoadmapWrapper nodeData={nodeData} roadmapId={slug} />;
}
