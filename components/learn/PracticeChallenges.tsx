"use client";

import Link from "next/link";
import { ArrowRight, Flag, Timer } from "lucide-react";
import type { PracticeChallenge } from "@/lib/catalog";
import { useLang } from "@/lib/lang-context";
import { fmt } from "./PracticeLink";

const TONE: Record<number, string> = {
  1: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  2: "text-blue-400 bg-blue-500/10 border-blue-500/25",
  3: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  4: "text-red-400 bg-red-500/10 border-red-500/25",
};

/** Card for one recommended challenge → /challenges/<id>/. Public card data only. */
export function ChallengeCard({ challenge }: { challenge: PracticeChallenge }) {
  const { tx, lang } = useLang();
  const T = tx.curriculum;
  return (
    <Link href={challenge.href} className="group card card-hover p-4 flex flex-col gap-3 h-full">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid place-items-center size-9 rounded-lg bg-fg/5 border border-line text-fg-muted shrink-0">
          <Flag size={16} aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-fg leading-snug group-hover:text-emerald-400 transition-colors">{challenge.title[lang]}</h3>
          <p dir="ltr" className="text-xs text-fg-subtle mt-0.5 text-start">{challenge.topic}</p>
        </div>
        <ArrowRight size={15} className="rtl-flip ms-auto mt-1 text-fg-faint group-hover:text-emerald-400 shrink-0" aria-hidden />
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
        <span className={`px-2 py-0.5 rounded-full border font-semibold ${TONE[challenge.difficulty] ?? TONE[1]}`}>{T.difficulty[challenge.difficulty]}</span>
        <span className="px-2 py-0.5 rounded-full border border-line text-fg-muted font-semibold">{fmt(T.points, { n: challenge.points })}</span>
        <span className="inline-flex items-center gap-1 text-fg-subtle">
          <Timer size={12} aria-hidden /> {fmt(T.minutesShort, { n: challenge.estMinutes })}
        </span>
      </div>
    </Link>
  );
}

export function ChallengeGrid({ challenges }: { challenges: PracticeChallenge[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {challenges.map((c) => (
        <li key={c.id}>
          <ChallengeCard challenge={c} />
        </li>
      ))}
    </ul>
  );
}
