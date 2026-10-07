import type { Metadata } from "next";
import { Suspense } from "react";
import { challenges } from "@/data/challenges";
import { roadmaps } from "@/data/roadmaps";
import { toListItems, tracksWithChallenges } from "@/lib/ctf/types";
import ChallengeList, { ChallengeListFallback } from "@/components/challenges/ChallengeList";

const title = "Challenges: capture-the-flag puzzles and coding problems";
const description =
  "Free hands-on challenges across security, systems, algorithms and web: solve puzzles, write code, earn points, take first blood and climb the leaderboard. Bilingual English and Arabic.";

export const metadata: Metadata = {
  title: "Challenges",
  description,
  alternates: { canonical: "/challenges/" },
  openGraph: { title, description, url: "/challenges/" },
};

export default function ChallengesPage() {
  // Only the slim list shape is serialized to the browser; statements, files and hints stay on the detail pages.
  const items = toListItems(challenges);
  const tracks = tracksWithChallenges(items, roadmaps);
  return (
    <Suspense fallback={<ChallengeListFallback />}>
      <ChallengeList items={items} tracks={tracks} />
    </Suspense>
  );
}
