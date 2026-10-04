import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { courses, getCourse } from "@/lib/catalog";
import { getCourseOutline } from "@/lib/catalog-server";
import { loadLesson } from "@/data/lessons";
import { NODE_DATA } from "@/data/roadmap-nodes";
import { SITE_URL } from "@/lib/site";
import LessonPlayer from "@/components/learn/LessonPlayer";

export const dynamicParams = false;

// One static page per lesson: each is individually indexable and only ships
// its own lesson content.
export function generateStaticParams() {
  return courses.flatMap((c) => c.lessons.map((l) => ({ track: c.id, lesson: l.lessonId })));
}

type Props = { params: Promise<{ track: string; lesson: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { track, lesson: lessonId } = await params;
  const lesson = await loadLesson(track, lessonId);
  const course = getCourse(track);
  if (!lesson || !course) return {};
  const description =
    NODE_DATA[track]?.find((n) => n.id === lessonId)?.description ??
    `Interactive ${course.roadmap.title} lesson with exercises and a quiz.`;
  return {
    title: `${lesson.title.en} — ${course.roadmap.title}`,
    description,
    alternates: { canonical: `/learn/${track}/${lessonId}/` },
    openGraph: { type: "article", title: lesson.title.en, description, url: `/learn/${track}/${lessonId}/` },
  };
}

export default async function LessonPage({ params }: Props) {
  const { track, lesson: lessonId } = await params;
  const course = getCourse(track);
  const lesson = await loadLesson(track, lessonId);
  if (!course || !lesson) notFound();
  const outline = await getCourseOutline(track);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.title.en,
    learningResourceType: "Lesson",
    timeRequired: `PT${lesson.estMinutes}M`,
    inLanguage: ["en", "ar"],
    isAccessibleForFree: true,
    url: `${SITE_URL}/learn/${track}/${lessonId}/`,
    isPartOf: { "@type": "Course", name: course.roadmap.title, url: `${SITE_URL}/learn/${track}/` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <LessonPlayer
        trackId={track}
        trackIcon={course.roadmap.icon}
        lesson={lesson}
        outline={outline.map(({ lessonId, title, minutes, module }) => ({ lessonId, title, minutes, module }))}
      />
    </>
  );
}
