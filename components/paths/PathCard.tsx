"use client";

import Link from "next/link";
import { BarChart3, BookOpen, Check, Clock } from "lucide-react";
import { hoursFromMinutes, pathProgress, type PathSummary } from "@/lib/career-paths";
import { useLang } from "@/lib/lang-context";
import { hoursLabel } from "@/lib/plural";
import { useStudy } from "@/lib/study-store";
import ProgressBar from "@/components/ui/ProgressBar";
import { fmt } from "@/components/learn/PracticeLink";
import { coursesCount, levelRange } from "./PathBits";

/** Courses listed on a card before "+N more". */
const SHOWN = 3;

/**
 * One role on the /roadmaps/ grid (and the home page): role, description, "If you like", its
 * courses as credentials, level range and total hours. The title link stretches over the card,
 * so the whole card is clickable while the card's text stays plain text for screen readers.
 */
export default function PathCard({ path, headingLevel = 2 }: { path: PathSummary; headingLevel?: 2 | 3 }) {
  const { tx, lang } = useLang();
  const T = tx.paths;
  const study = useStudy();
  const progress = pathProgress(path, study.lessons);
  const shown = path.courses.length <= SHOWN ? path.courses : path.courses.slice(0, SHOWN);
  const more = path.courses.length - shown.length;
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const Sub = headingLevel === 2 ? "h3" : "h4";
  const titleId = `path-card-${path.id}`;

  return (
    <article
      aria-labelledby={titleId}
      data-path={path.id}
      className="group card card-hover relative overflow-hidden p-5 sm:p-6 flex flex-col h-full has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand"
    >
      <div aria-hidden className="absolute -top-16 -end-16 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" style={{ background: path.accent }} />
      <div className="relative flex items-start justify-between gap-3 mb-4">
        <span className="text-3xl leading-none" aria-hidden>{path.icon}</span>
        <span className="text-[11px] font-semibold px-2 py-1 rounded-full border border-line text-fg-muted">{T.categories[path.category]}</span>
      </div>
      <Heading id={titleId} className="text-lg font-bold text-fg mb-1.5">
        <Link
          href={`/roadmaps/${path.id}/`}
          className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none group-hover:text-emerald-400 transition-colors"
        >
          {path.title[lang]}
        </Link>
      </Heading>
      <p className="relative text-sm text-fg-muted leading-relaxed line-clamp-3 mb-4">{path.description[lang]}</p>

      <div className="relative mb-4">
        <Sub className="text-[11px] font-bold uppercase tracking-widest text-fg-subtle mb-1.5">{T.ifYouLike}</Sub>
        <ul className="space-y-1">
          {path.ifYouLike.map((item) => (
            <li key={item.en} className="flex items-start gap-2 text-sm text-fg-soft leading-snug">
              <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" aria-hidden /> {item[lang]}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mb-5">
        <Sub className="text-[11px] font-bold uppercase tracking-widest text-fg-subtle mb-1.5">{T.credentials}</Sub>
        <ul className="space-y-1.5">
          {shown.map((c) => (
            <li key={c.id} className="flex items-center gap-2 text-sm min-w-0">
              <span aria-hidden className="shrink-0">{c.icon}</span>
              <span className={`truncate ${c.available ? "text-fg-soft" : "text-fg-subtle"}`}>{c.title[lang]}</span>
              {!c.available && (
                <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">{T.comingSoon}</span>
              )}
            </li>
          ))}
          {more > 0 && <li className="text-xs font-semibold text-fg-subtle ps-6">{fmt(T.more, { n: more })}</li>}
        </ul>
      </div>

      <div className="relative mt-auto pt-4 border-t border-line">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-fg-subtle">
          <li className="flex items-center gap-1.5"><BarChart3 size={13} aria-hidden /> {levelRange(tx, path.levels)}</li>
          <li className="flex items-center gap-1.5"><Clock size={13} aria-hidden /> {hoursLabel(tx, hoursFromMinutes(path.totals.minutes))}</li>
          <li className="flex items-center gap-1.5">
            <BookOpen size={13} aria-hidden /> {coursesCount(tx, path.totals.courses)}
            {path.totals.comingSoon > 0 && <span>· {fmt(T.comingSoonCount, { n: path.totals.comingSoon })}</span>}
          </li>
        </ul>
        {progress.done > 0 && (
          <div className="flex items-center gap-3 mt-3">
            <ProgressBar value={progress.ratio} className="flex-1" label={`${T.progressLabel}: ${path.title[lang]}`} />
            <span className="text-xs font-semibold text-emerald-400" dir="ltr">{Math.round(progress.ratio * 100)}%</span>
          </div>
        )}
      </div>
    </article>
  );
}
