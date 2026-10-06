"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, PartyPopper, Sparkles, Trophy, XCircle } from "lucide-react";
import type { GradeResult, SubmitResponse } from "../../shared/api";
import { challengesHref, lessonHref } from "../../shared/links";
import { useLang } from "@/lib/lang-context";
import { fill } from "@/lib/codelab/format";
import { btnGhost, btnPrimary } from "./ui";

/** Outcome of a graded lesson-exercise run: success (with XP and next steps) or what to do next. */
export function GradeBanner({
  grade,
  xp,
  track,
  lesson,
  next,
}: {
  grade: GradeResult;
  /** XP awarded now; 0 when the exercise was already completed. */
  xp: number;
  track: string;
  lesson: string;
  next: { track: string; lesson: string } | null;
}) {
  const { tx } = useLang();
  const e = tx.codelab.exercise;
  const total = grade.tests.length;
  const passed = grade.tests.filter((t) => t.passed).length;
  if (grade.passed) {
    return (
      <div role="status" className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4" data-testid="grade-banner" data-passed="true">
        <div className="flex items-start gap-3">
          <PartyPopper size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-fg">{e.passedTitle}</p>
            <p className="mt-1 text-sm text-fg-soft">{e.passedBody}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300" data-testid="xp">
              <Sparkles size={12} aria-hidden="true" />
              {xp > 0 ? fill(e.xp, { xp }) : e.alreadyDone}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={lessonHref(track, lesson)} className={btnGhost}>
                <ArrowLeft size={15} aria-hidden="true" className="rtl-flip" />
                {e.backToLesson}
              </Link>
              {next && (
                <Link href={lessonHref(next.track, next.lesson)} className={btnPrimary}>
                  {e.nextLesson}
                  <ArrowRight size={15} aria-hidden="true" className="rtl-flip" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/[0.08] p-4" data-testid="grade-banner" data-passed="false">
      <div className="flex items-start gap-3">
        <XCircle size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-400" />
        <div>
          <p className="text-sm font-extrabold text-fg">{e.failedTitle}</p>
          <p className="mt-1 text-sm text-fg-soft">{fill(e.failedBody, { passed, total })}</p>
          {grade.feedback && <p className="mt-1 text-sm text-fg-muted">{grade.feedback}</p>}
        </div>
      </div>
    </div>
  );
}

/** Outcome of POST /api/challenges/:id/submit. */
export function SubmitBanner({ res, challengeId, track }: { res: SubmitResponse; challengeId: string; track: string }) {
  const { tx } = useLang();
  const c = tx.codelab.challenge;
  return (
    <div
      role="status"
      className={`rounded-xl border p-4 ${res.correct ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/[0.08]"}`}
      data-testid="submit-banner"
      data-correct={String(res.correct)}
    >
      <div className="flex items-start gap-3">
        {res.correct ? (
          <Trophy size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-400" />
        ) : (
          <XCircle size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-400" />
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-sm font-extrabold text-fg">{res.correct ? c.correctTitle : c.incorrectTitle}</p>
          <p className="text-sm font-semibold text-emerald-300">{res.awarded > 0 ? fill(c.awarded, { points: res.awarded }) : c.noPoints}</p>
          {res.firstBlood && <p className="text-sm font-bold text-amber-300" data-testid="first-blood">{c.firstBlood}</p>}
          {res.alreadySolved && <p className="text-sm text-fg-soft">{c.alreadySolved}</p>}
          {res.feedback && (
            <p className="text-sm text-fg-soft">
              <span className="font-semibold text-fg">{c.feedback}: </span>
              {res.feedback}
            </p>
          )}
          <div className="pt-1.5">
            <Link href={`/challenges/${encodeURIComponent(challengeId)}/`} className={btnGhost}>
              <ArrowLeft size={15} aria-hidden="true" className="rtl-flip" />
              {c.backToChallenge}
            </Link>{" "}
            <Link href={challengesHref(track)} className="text-xs text-fg-subtle hover:underline ms-2">
              {c.browseChallenges}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
