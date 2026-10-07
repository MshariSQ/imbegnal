"use client";

import PageHeader from "@/components/ui/PageHeader";
import { useLang } from "@/lib/lang-context";

/** Prerendered shell for /challenges/leaderboard/ while the search params resolve (keeps the h1 in the static HTML). */
export default function LeaderboardFallback() {
  const { tx } = useLang();
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6">
      <PageHeader eyebrow={tx.ctf.eyebrow} title={tx.ctf.leaderboardPage.title} subtitle={tx.ctf.leaderboardPage.subtitle} />
      <div aria-hidden className="space-y-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl border border-line bg-surface" />
        ))}
      </div>
    </main>
  );
}
