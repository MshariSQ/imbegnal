"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { trackDescription, trackMeta, trackTitle } from "@/lib/catalog";
import { useLang } from "@/lib/lang-context";
import { countLabel, hoursLabel } from "@/lib/plural";
import ProgressBar from "@/components/ui/ProgressBar";

export interface CourseCardData {
  /** Roadmap id: the name, icon and accent are read from roadmaps[], never from here. */
  id: string;
  /** @deprecated ignored: the canonical icon comes from roadmaps[]. Kept so existing callers compile. */
  icon?: string;
  /** @deprecated ignored: the canonical accent comes from roadmaps[]. */
  accent?: string;
  level: string;
  lessonCount: number;
  minutes: number;
}

export default function CourseCard({ course, done = 0 }: { course: CourseCardData; done?: number }) {
  const { tx, lang } = useLang();
  const meta = trackMeta(course.id);
  const icon = meta?.icon ?? course.icon;
  const accent = meta?.accent ?? course.accent;
  const pct = course.lessonCount ? done / course.lessonCount : 0;
  const hours = Math.max(1, Math.round(course.minutes / 60));
  return (
    <Link
      href={`/learn/${course.id}/`}
      className="group card card-hover relative overflow-hidden p-5 flex flex-col h-full"
    >
      <div
        aria-hidden
        className="absolute -top-16 -end-16 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl leading-none" aria-hidden>{icon}</span>
        <span className="text-[11px] font-semibold px-2 py-1 rounded-full border border-line text-fg-muted">{tx.common.levels[course.level as keyof typeof tx.common.levels] ?? course.level}</span>
      </div>
      <h3 className="text-lg font-bold text-fg mb-1.5">{trackTitle(course.id, lang)}</h3>
      <p className="text-sm text-fg-muted leading-relaxed line-clamp-2 mb-5">{trackDescription(course.id, lang)}</p>
      <div className="mt-auto">
        <div className="flex items-center gap-4 text-xs text-fg-subtle mb-3">
          <span className="flex items-center gap-1.5"><BookOpen size={13} /> {countLabel(tx, "lesson", course.lessonCount)}</span>
          <span className="flex items-center gap-1.5"><Clock size={13} /> {hoursLabel(tx, hours)}</span>
        </div>
        {done > 0 ? (
          <div className="flex items-center gap-3">
            <ProgressBar value={pct} className="flex-1" />
            <span className="text-xs font-semibold text-emerald-400" dir="ltr">{Math.round(pct * 100)}%</span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
            {tx.learn.startCourse} <ArrowRight size={14} className="rtl-flip transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </Link>
  );
}
