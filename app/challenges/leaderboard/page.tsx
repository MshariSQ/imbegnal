import type { Metadata } from "next";
import { Suspense } from "react";
import { challenges } from "@/data/challenges";
import { roadmaps } from "@/data/roadmaps";
import { toListItems, tracksWithChallenges } from "@/lib/ctf/types";
import Leaderboard from "@/components/challenges/Leaderboard";
import LeaderboardFallback from "@/components/challenges/LeaderboardFallback";

const description = "Who is on top of the IMBEGNAL challenges? All-time and weekly rankings by points, solves and first bloods, per track.";

export const metadata: Metadata = {
  title: "Challenge leaderboard",
  description,
  alternates: { canonical: "/challenges/leaderboard/" },
  openGraph: { title: "Challenge leaderboard", description, url: "/challenges/leaderboard/" },
};

export default function LeaderboardPage() {
  const tracks = tracksWithChallenges(toListItems(challenges), roadmaps);
  return (
    <Suspense fallback={<LeaderboardFallback />}>
      <Leaderboard tracks={tracks} />
    </Suspense>
  );
}
