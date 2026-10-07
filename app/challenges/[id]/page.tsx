import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { challenges, getChallenge } from "@/data/challenges";
import { loadLesson } from "@/data/lessons";
import { roadmaps } from "@/data/roadmaps";
import { relatedItems } from "@/lib/ctf/filters";
import { toListItems, tracksWithChallenges } from "@/lib/ctf/types";
import { SITE_URL } from "@/lib/site";
import ChallengeDetail, { type LessonLink } from "@/components/challenges/ChallengeDetail";

export const dynamicParams = false;

/** `leaderboard` is its own static route; a challenge must never shadow it. */
const RESERVED_IDS = new Set(["leaderboard"]);

/**
 * `output: export` refuses a dynamic route whose generateStaticParams() returns
 * nothing, so an EMPTY registry (content not written yet) emits one placeholder
 * param that renders notFound(). It disappears as soon as a challenge exists.
 */
const EMPTY_REGISTRY_PARAM = "_none";

export function generateStaticParams() {
  const ids = challenges.filter((c) => !RESERVED_IDS.has(c.id)).map((c) => ({ id: c.id }));
  return ids.length > 0 ? ids : [{ id: EMPTY_REGISTRY_PARAM }];
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = getChallenge(id);
  if (!c) return {};
  const title = `${c.title.en} (${c.points} pts)`;
  return {
    title,
    description: c.summary.en,
    alternates: { canonical: `/challenges/${c.id}/` },
    openGraph: { title, description: c.summary.en, url: `/challenges/${c.id}/` },
  };
}

const DIFFICULTY_NAME = ["Easy", "Medium", "Hard", "Insane"] as const;

export default async function ChallengePage({ params }: Props) {
  const { id } = await params;
  const challenge = getChallenge(id);
  if (!challenge) notFound();

  const items = toListItems(challenges);
  const current = items.find((i) => i.id === challenge.id)!;
  const related = relatedItems(items, current, 6);
  const track = tracksWithChallenges([challenge], roadmaps)[0];

  // Lesson titles come from the lesson registry at build time; unknown keys are skipped, never invented.
  const lessons = (
    await Promise.all(
      (challenge.lessons ?? []).map(async (key): Promise<LessonLink | null> => {
        const [lessonTrack, ...rest] = key.split("/");
        const lessonId = rest.join("/");
        if (!lessonTrack || !lessonId) return null;
        const lesson = await loadLesson(lessonTrack, lessonId);
        return lesson ? { track: lessonTrack, lesson: lessonId, title: lesson.title } : null;
      })
    )
  ).filter((l): l is LessonLink => l !== null);

  // Structured data. Nothing here can contain a flag: ChallengeMeta never does.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: challenge.title.en,
    alternateName: challenge.title.ar,
    description: challenge.summary.en,
    url: `${SITE_URL}/challenges/${challenge.id}/`,
    inLanguage: ["en", "ar"],
    learningResourceType: "Challenge",
    educationalLevel: DIFFICULTY_NAME[challenge.difficulty - 1],
    timeRequired: `PT${Math.max(1, Math.round(challenge.estMinutes))}M`,
    isAccessibleForFree: true,
    about: track ? track.title : challenge.topic,
    keywords: [challenge.topic, ...(challenge.tags ?? [])].join(", "),
    provider: { "@type": "Organization", name: "IMBEGNAL", sameAs: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ChallengeDetail challenge={challenge} track={track} lessons={lessons} related={related} />
    </>
  );
}
