"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, BookOpen, Flag, Lightbulb, Lock, RotateCcw, Trophy } from "lucide-react";
import { roadmaps } from "@/data/roadmaps";
import { challengeHref, challengesHref, courseHref, lessonHref } from "../../shared/links";
import { useLang } from "@/lib/lang-context";
import { fill } from "@/lib/codelab/format";
import type { LabContext } from "@/lib/codelab/context";
import TextBlock from "@/components/lesson/TextBlock";
import { CopyButton, btnGhost, focusRing } from "./ui";

/** Canonical track chips: titles always come from data/roadmaps.ts, never hard-coded. */
export function TrackChips({ track }: { track: string }) {
  const { tx } = useLang();
  const r = roadmaps.find((x) => x.id === track);
  if (!r) return null;
  const t = tx.codelab.tracks;
  const chip = `inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 min-h-8 text-xs font-medium text-fg-soft hover:text-fg hover:border-line-strong ${focusRing}`;
  return (
    <nav aria-label={t.label} className="flex flex-wrap gap-2">
      <Link href={courseHref(track)} className={chip}>
        <BookOpen size={12} aria-hidden="true" />
        {fill(t.course, { title: r.title })}
      </Link>
      <Link href={challengesHref(track)} className={chip}>
        <Flag size={12} aria-hidden="true" />
        {fill(t.challenges, { title: r.title })}
      </Link>
    </nav>
  );
}

/** Statement of an exercise/challenge/demo: prompt, hints, solution, links back. */
export default function TaskPanel({
  ctx,
  failedChecks,
  onResetStarter,
}: {
  ctx: Exclude<LabContext, { kind: "free" } | { kind: "snippet" }>;
  failedChecks: number;
  onResetStarter?: () => void;
}) {
  const { tx, lang } = useLang();
  const e = tx.codelab.exercise;
  const c = tx.codelab.challenge;
  const [hints, setHints] = useState(0);
  const [solution, setSolution] = useState(false);

  if (ctx.kind === "demo") {
    return (
      <div className="p-3 sm:p-4 space-y-3" data-testid="task-panel">
        <p className="text-sm text-fg-soft">{fill(e.demoBanner, { lesson: ctx.lessonTitle[lang] })}</p>
        <Link href={lessonHref(ctx.track, ctx.lessonId)} className={`${btnGhost} w-fit`}>
          <ArrowLeft size={15} aria-hidden="true" className="rtl-flip" />
          {e.backToLesson}
        </Link>
        <TrackChips track={ctx.track} />
      </div>
    );
  }

  if (ctx.kind === "challenge") {
    const m = ctx.meta;
    return (
      <div className="p-3 sm:p-4 space-y-4" data-testid="task-panel">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-extrabold text-fg">{m.title[lang]}</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
            <Trophy size={12} aria-hidden="true" />
            {fill(c.points, { n: m.points })}
          </span>
        </div>
        <TrackChips track={m.track} />
        <TextBlock body={m.description} />
        {m.sampleInput !== undefined && <p className="text-xs text-fg-subtle">{c.sampleInput}</p>}
        <Link href={challengeHref(m.id)} className={`${btnGhost} w-fit`}>
          <ArrowLeft size={15} aria-hidden="true" className="rtl-flip" />
          {c.backToChallenge}
        </Link>
      </div>
    );
  }

  const s = ctx.section;
  const canSolution = failedChecks >= 2;
  return (
    <div className="p-3 sm:p-4 space-y-4" data-testid="task-panel">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">{e.lessonExercise}</p>
        <h2 className="mt-1 text-base font-extrabold text-fg">{ctx.lessonTitle[lang]}</h2>
      </div>
      <TrackChips track={ctx.track} />
      <TextBlock body={s.prompt} />

      {s.hints.length > 0 && (
        <section aria-label={e.hints} className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-fg-subtle">{e.hints}</h3>
          {s.hints.slice(0, hints).map((h, i) => (
            <div key={i} className="rounded-lg border border-line bg-surface-2 p-3 text-sm text-fg-soft" data-testid="hint">
              <p className="text-xs font-bold text-fg-subtle mb-1">{fill(e.hintLabel, { n: i + 1 })}</p>
              <TextBlock body={h} />
            </div>
          ))}
          {hints < s.hints.length && (
            <button type="button" onClick={() => setHints((n) => n + 1)} className={btnGhost}>
              <Lightbulb size={15} aria-hidden="true" />
              {e.showHint} <span className="text-fg-subtle">({fill(e.hintsLeft, { shown: hints, total: s.hints.length })})</span>
            </button>
          )}
        </section>
      )}

      <section className="space-y-2">
        {canSolution ? (
          <>
            <button type="button" onClick={() => setSolution((v) => !v)} aria-expanded={solution} className={btnGhost}>
              {solution ? e.hideSolution : e.showSolution}
            </button>
            {solution && (
              <div data-testid="solution">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-fg-subtle">{e.solution}</h3>
                  <CopyButton text={s.solution} label={tx.codelab.copy} copiedLabel={tx.codelab.copied} />
                </div>
                <pre tabIndex={0} role="region" aria-label={e.solution} dir="ltr" className="m-0 max-h-72 overflow-auto rounded-lg border border-line bg-surface-2 p-3 font-mono text-[13px] whitespace-pre text-fg text-start">
                  {s.solution}
                </pre>
              </div>
            )}
          </>
        ) : (
          <p className="flex items-center gap-2 text-xs text-fg-subtle">
            <Lock size={13} aria-hidden="true" />
            {e.solutionLocked}
          </p>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        {onResetStarter && (
          <button type="button" onClick={onResetStarter} className={btnGhost}>
            <RotateCcw size={15} aria-hidden="true" />
            {e.resetStarter}
          </button>
        )}
        <Link href={lessonHref(ctx.track, ctx.lessonId)} className={btnGhost}>
          <ArrowLeft size={15} aria-hidden="true" className="rtl-flip" />
          {e.backToLesson}
        </Link>
      </div>
    </div>
  );
}
