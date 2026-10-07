"use client";

import Link from "next/link";
import { CheckCircle2, Flag, FlaskConical, SquareTerminal } from "lucide-react";
import type { LessonPractice } from "@/lib/catalog";
import { useLang } from "@/lib/lang-context";
import { useLabProgress } from "@/lib/lab-progress";
import { challengesHref } from "@/shared/links";
import { fmt } from "./PracticeLink";

const chip =
  "inline-flex items-center gap-1.5 min-h-10 px-3 rounded-full border text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400";

/** Where "Try in Code Lab" goes for a lesson: its first lab, else its first example, else a blank lab. */
export function primaryPracticeHref(p: LessonPractice): string {
  return p.labs[0]?.href ?? p.demos[0]?.href ?? p.blank?.href ?? p.challenges[0]?.href ?? "/code-lab/";
}

/** Per-lesson practice chips of the course curriculum: Lab, Challenge, Try in Code Lab. */
export default function PracticeChips({ practice, trackId }: { practice: LessonPractice; trackId: string }) {
  const { tx } = useLang();
  const T = tx.curriculum;
  const passed = useLabProgress();
  const labsPassed = practice.labs.filter((l) => passed[l.ref]).length;
  const allPassed = practice.labs.length > 0 && labsPassed === practice.labs.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {practice.labs.length > 0 && (
        <Link
          href={practice.labs[0].href}
          className={`${chip} ${allPassed ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-line text-fg-muted hover:text-fg hover:bg-fg/5"}`}
        >
          {allPassed ? <CheckCircle2 size={13} aria-hidden /> : <FlaskConical size={13} aria-hidden />}
          {allPassed ? T.chipLabPassed : practice.labs.length === 1 ? T.chipLab : fmt(T.chipLabs, { n: practice.labs.length })}
        </Link>
      )}
      {practice.challenges.length > 0 && (
        <Link href={practice.challenges.length === 1 ? practice.challenges[0].href : challengesHref(trackId)} className={`${chip} border-line text-fg-muted hover:text-fg hover:bg-fg/5`}>
          <Flag size={13} aria-hidden />
          {practice.challenges.length === 1 ? T.chipChallenge : fmt(T.chipChallenges, { n: practice.challenges.length })}
        </Link>
      )}
      <Link href={primaryPracticeHref(practice)} className={`${chip} border-brand/40 text-emerald-400 hover:bg-brand/10`}>
        <SquareTerminal size={13} aria-hidden /> {T.tryInCodeLab}
      </Link>
    </div>
  );
}
