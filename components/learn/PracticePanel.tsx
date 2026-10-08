"use client";

import Link from "next/link";
import { CheckCircle2, Circle, FlaskConical, Play } from "lucide-react";
import type { LessonPractice } from "@/lib/catalog";
import { useLang } from "@/lib/lang-context";
import { useLabProgress } from "@/lib/lab-progress";
import { sectionId } from "@/components/lesson/LessonView";
import { ChallengeGrid } from "./PracticeChallenges";
import { OpenInCodeLab, TryInCodeLab, fmt, langLabel } from "./PracticeLink";

/**
 * "Practice" panel of the lesson page (above the completion block): the lesson's
 * graded labs, runnable examples, recommended challenges and a blank Code Lab.
 */
export default function PracticePanel({ practice }: { practice: LessonPractice }) {
  const { tx } = useLang();
  const T = tx.curriculum;
  const passed = useLabProgress(); // empty until hydrated: no mismatch
  let exampleNo = 0;
  let exerciseNo = 0;

  return (
    <section aria-labelledby="practice-title" className="card p-5 sm:p-6 mb-8">
      <div className="flex items-center gap-2.5">
        <FlaskConical size={18} className="text-purple-400" aria-hidden />
        <h2 id="practice-title" className="text-lg font-extrabold text-fg">{T.practiceTitle}</h2>
      </div>
      <p className="text-sm text-fg-muted mt-1">{T.practiceIntro}</p>

      {practice.labs.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-fg-subtle mb-2">{T.practiceLabs}</h3>
          <ul className="space-y-2">
            {practice.labs.map((lab, i) => {
              const done = !!passed[lab.ref];
              return (
                <li key={lab.ref} className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-4 py-3 ${done ? "border-emerald-500/40 bg-emerald-500/5" : "border-line"}`}>
                  {done ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0" aria-hidden /> : <Circle size={18} className="text-fg-faint shrink-0" aria-hidden />}
                  <a href={`#${sectionId(lab.section)}`} className="text-sm font-semibold text-fg hover:text-emerald-400 min-w-0">
                    {fmt(T.labExercise, { n: i + 1 })}
                  </a>
                  <span dir="ltr" className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-line text-fg-muted">{langLabel(lab.lang)}</span>
                  <span className={`text-xs ${done ? "text-emerald-400 font-semibold" : "text-fg-subtle"}`}>{done ? T.labPassedShort : T.labNotPassed}</span>
                  <TryInCodeLab href={lab.href} className="ms-auto" />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {practice.demos.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-fg-subtle mb-2">{T.practiceDemos}</h3>
          <ul className="flex flex-wrap gap-2">
            {practice.demos.map((d) => {
              const n = d.source === "exercise" ? ++exerciseNo : ++exampleNo;
              const label = `${fmt(d.source === "exercise" ? T.practiceExercise : T.practiceExample, { n })} · ${langLabel(d.lang)}`;
              return (
                <li key={d.section}>
                  <OpenInCodeLab href={d.href} label={label} />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {practice.challenges.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-fg-subtle mb-2">{T.practiceChallenges}</h3>
          <ChallengeGrid challenges={practice.challenges} />
        </div>
      )}

      {practice.blank && (
        <div className="mt-5 pt-4 border-t border-line">
          <Link
            href={practice.blank.href}
            className="inline-flex items-center gap-2 min-h-10 text-sm font-semibold text-fg-soft hover:text-fg rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            <Play size={14} className="rtl-flip" aria-hidden /> {fmt(T.practiceBlank, { lang: langLabel(practice.blank.lang) })}
          </Link>
        </div>
      )}
    </section>
  );
}
