import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { courses, getCourse, trackDescription, trackTitle } from "@/lib/catalog";
import { getCourseOutline, getCurriculum, recommendedChallenges } from "@/lib/catalog-server";
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
  const title = `${trackTitle(track)} course`;
  const description = `${trackDescription(track)}. ${course.lessons.length} free interactive lessons with graded labs, quizzes and an AI tutor — in English and Arabic.`;
  return {
    title,
    description,
    alternates: { canonical: `/learn/${track}/` },
    openGraph: { title, description: trackDescription(track), url: `/learn/${track}/` },
  };
}

const EDUCATIONAL_LEVEL = { Beginner: "Beginner", Intermediate: "Intermediate", Advanced: "Advanced", "All Levels": "Beginner to Advanced" } as const;

export default async function CoursePage({ params }: Props) {
  const { track } = await params;
  const course = getCourse(track);
  const curriculum = getCurriculum(track);
  if (!course || !curriculum) notFound();
  const outline = await getCourseOutline(track);
  const challenges = recommendedChallenges(track, undefined, 6);
  const workload = `PT${Math.max(1, Math.round(curriculum.estimatedHours))}H`;

  // Structured data so search engines can show this as a free course
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: trackTitle(track),
    description: trackDescription(track),
    url: `${SITE_URL}/learn/${track}/`,
    inLanguage: ["en", "ar"],
    isAccessibleForFree: true,
    educationalLevel: EDUCATIONAL_LEVEL[course.roadmap.level],
    teaches: curriculum.objectives.map((o) => o.en),
    timeRequired: workload,
    numberOfLessons: outline.length,
    coursePrerequisites: curriculum.prerequisites.map((p) => ("track" in p ? trackTitle(p.track) : p.text.en)),
    provider: { "@type": "Organization", name: "IMBEGNAL", sameAs: SITE_URL },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: workload },
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD", category: "Free" },
    hasPart: outline.map((l) => ({
      "@type": "LearningResource",
      name: l.title.en,
      url: `${SITE_URL}/learn/${track}/${l.lessonId}/`,
      timeRequired: `PT${l.minutes}M`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <CourseOverview
        trackId={track}
        curriculum={curriculum}
        lessons={outline}
        challenges={challenges}
        courseTracks={courses.map((c) => c.id)}
      />
    </>
  );
}
