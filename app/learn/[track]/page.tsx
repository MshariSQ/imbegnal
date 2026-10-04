import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { courses, getCourse } from "@/lib/catalog";
import { getCourseOutline } from "@/lib/catalog-server";
import { NODE_DATA } from "@/data/roadmap-nodes";
import { SITE_URL } from "@/lib/site";
import CourseOverview from "@/components/learn/CourseOverview";

export const dynamicParams = false;

export function generateStaticParams() {
  return courses.map((c) => ({ track: c.id }));
}

type Props = { params: Promise<{ track: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { track } = await params;
  const course = getCourse(track);
  if (!course) return {};
  const title = `${course.roadmap.title} course`;
  return {
    title,
    description: `${course.roadmap.description}. ${course.lessons.length} free interactive lessons with exercises, quizzes and an AI tutor — in English and Arabic.`,
    alternates: { canonical: `/learn/${track}/` },
    openGraph: { title, description: course.roadmap.description, url: `/learn/${track}/` },
  };
}

export default async function CoursePage({ params }: Props) {
  const { track } = await params;
  const course = getCourse(track);
  if (!course) notFound();
  const outline = await getCourseOutline(track);
  const nodeDesc = Object.fromEntries((NODE_DATA[track] ?? []).map((n) => [n.id, n.description]));

  // Structured data so search engines can show this as a free course
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${course.roadmap.title}`,
    description: course.roadmap.description,
    url: `${SITE_URL}/learn/${track}/`,
    inLanguage: ["en", "ar"],
    isAccessibleForFree: true,
    provider: { "@type": "Organization", name: "IMBEGNAL", sameAs: SITE_URL },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: `PT${Math.round(outline.reduce((s, l) => s + l.minutes, 0) / 60)}H` },
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD", category: "Free" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <CourseOverview
        course={{
          id: course.id,
          icon: course.roadmap.icon,
          accent: course.roadmap.accent,
          level: course.roadmap.level,
          duration: course.roadmap.duration,
          jobs: course.roadmap.jobs,
        }}
        outline={outline.map((l) => ({ ...l, description: nodeDesc[l.lessonId] ?? "" }))}
      />
    </>
  );
}
