"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, ExternalLink, Route, Search } from "lucide-react";
import { PATH_LEVELS, careerPaths, type PathLevel } from "@/data/career-paths";
import { trackDescription, trackMeta, trackTitle } from "@/lib/catalog";
import { hoursFromMinutes, pathsWithCourse, trackLevels } from "@/lib/career-paths";
import { useLang } from "@/lib/lang-context";
import { countLabel, hoursLabel } from "@/lib/plural";
import { completedCount, useStudy } from "@/lib/study-store";
import { courseHref } from "@/shared/links";
import PageHeader from "@/components/ui/PageHeader";
import ProgressBar from "@/components/ui/ProgressBar";
import { fmt } from "@/components/learn/PracticeLink";
import { FilterChip } from "@/components/paths/PathBits";

export interface DirectoryCourse {
  /** Track id: names, icons and accents come from data/roadmaps.ts (lib/catalog). */
  id: string;
  /** data/roadmaps.ts level ("Beginner", …, "All Levels"). */
  level: string;
  lessonIds: string[];
  minutes: number;
}

/**
 * /courses/: the catalog of IMBEGNAL's own courses, with the career paths each one belongs to.
 * The external directory (other providers' courses) is its own page, /resources/.
 */
export default function CourseDirectory({ courses }: { courses: DirectoryCourse[] }) {
  const { tx, lang } = useLang();
  const T = tx.coursesCatalog;
  const study = useStudy();
  const [level, setLevel] = useState<PathLevel | "all">("all");
  const [path, setPath] = useState<string>("all");
  const levelLabel = useId();
  const pathSelect = useId();

  const pathCourses = path === "all" ? null : new Set(careerPaths.find((p) => p.id === path)?.courses.map((s) => s.course) ?? []);
  const filtered = courses.filter((c) => (level === "all" || trackLevels(c.level).includes(level)) && (!pathCourses || pathCourses.has(c.id)));
  const results = filtered.length === 1 ? T.resultsOne : fmt(T.results, { n: filtered.length });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16">
      <PageHeader eyebrow={T.eyebrow} title={T.title} subtitle={T.subtitle}>
        <Link href="/learn/" className="inline-flex items-center gap-2 min-h-10 mt-5 text-sm font-semibold text-emerald-400 hover:underline">
          <Search size={15} aria-hidden /> {T.searchLessons} <ArrowRight size={14} className="rtl-flip" aria-hidden />
        </Link>
      </PageHeader>

      <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
        <div className="flex-1">
          <span id={levelLabel} className="block text-xs font-bold uppercase tracking-widest text-fg-subtle mb-2">{T.levelLabel}</span>
          <div role="group" aria-labelledby={levelLabel} className="flex flex-wrap gap-2">
            <FilterChip pressed={level === "all"} onClick={() => setLevel("all")}>{T.allLevels}</FilterChip>
            {PATH_LEVELS.map((lv) => (
              <FilterChip key={lv} pressed={level === lv} onClick={() => setLevel(lv)}>{tx.paths.levels[lv]}</FilterChip>
            ))}
          </div>
        </div>
        <div className="lg:w-72">
          <label htmlFor={pathSelect} className="block text-xs font-bold uppercase tracking-widest text-fg-subtle mb-2">{T.pathLabel}</label>
          <select
            id={pathSelect}
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-surface border border-line text-sm text-fg focus:border-brand/60 outline-none"
          >
            <option value="all">{T.allPaths}</option>
            {careerPaths.map((p) => (
              <option key={p.id} value={p.id}>{p.title[lang]}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-fg-subtle mb-5" aria-live="polite" data-testid="course-results">{results}</p>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center mb-16">
          <p className="text-fg-muted mb-4">{T.noResults}</p>
          <button
            type="button"
            onClick={() => { setLevel("all"); setPath("all"); }}
            className="min-h-10 px-4 rounded-lg border border-line-strong text-sm font-semibold text-fg hover:bg-fg/5"
          >
            {T.clearFilters}
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {filtered.map((c) => {
            const meta = trackMeta(c.id);
            const done = completedCount(study, c.lessonIds.map((l) => `${c.id}/${l}`));
            const pct = c.lessonIds.length ? done / c.lessonIds.length : 0;
            const memberships = pathsWithCourse(c.id);
            const titleId = `course-card-${c.id}`;
            return (
              <article key={c.id} aria-labelledby={titleId} data-course={c.id} className="card relative overflow-hidden p-5 flex flex-col">
                <div aria-hidden className="absolute -top-16 -end-16 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: meta?.accent }} />
                <div className="relative flex items-start justify-between gap-3 mb-4">
                  <span className="text-3xl leading-none" aria-hidden>{meta?.icon}</span>
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full border border-line text-fg-muted">
                    {tx.common.levels[c.level as keyof typeof tx.common.levels] ?? c.level}
                  </span>
                </div>
                <h2 id={titleId} className="relative text-lg font-bold text-fg mb-1.5">
                  <Link href={courseHref(c.id)} className="hover:text-emerald-400 transition-colors">{trackTitle(c.id, lang)}</Link>
                </h2>
                <p className="relative text-sm text-fg-muted leading-relaxed line-clamp-2 mb-4">{trackDescription(c.id, lang)}</p>
                <ul className="relative flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-subtle mb-4">
                  <li className="flex items-center gap-1.5"><BookOpen size={13} aria-hidden /> {countLabel(tx, "lesson", c.lessonIds.length)}</li>
                  <li className="flex items-center gap-1.5"><Clock size={13} aria-hidden /> {hoursLabel(tx, hoursFromMinutes(c.minutes))}</li>
                </ul>
                {done > 0 && (
                  <div className="relative flex items-center gap-3 mb-4">
                    <ProgressBar value={pct} className="flex-1" label={`${tx.learn.courseProgress}: ${trackTitle(c.id, lang)}`} />
                    <span className="text-xs font-semibold text-emerald-400" dir="ltr">{Math.round(pct * 100)}%</span>
                  </div>
                )}
                <div className="relative mt-auto pt-4 border-t border-line">
                  <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-fg-subtle mb-2">
                    <Route size={12} aria-hidden /> {T.partOf}
                  </h3>
                  <ul className="flex flex-wrap gap-1.5">
                    {memberships.map(({ path: p }) => (
                      <li key={p.id}>
                        <Link
                          href={`/roadmaps/${p.id}/`}
                          className="inline-flex items-center gap-1 min-h-8 px-2.5 rounded-full text-xs bg-fg/5 border border-line text-fg-soft hover:text-fg hover:bg-fg/10 transition-colors"
                        >
                          <span aria-hidden>{p.icon}</span> {p.title[lang]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={courseHref(c.id)}
                    aria-label={`${done > 0 ? tx.learn.continueCourse : tx.learn.startCourse}: ${trackTitle(c.id, lang)}`}
                    className="inline-flex items-center gap-1.5 min-h-10 mt-3 text-sm font-semibold text-emerald-400 hover:underline"
                  >
                    {done > 0 ? tx.learn.continueCourse : tx.learn.startCourse} <ArrowRight size={14} className="rtl-flip" aria-hidden />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Secondary: other providers' courses */}
      <section aria-labelledby="external-resources" className="card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <span className="w-12 h-12 rounded-2xl bg-sky-500/15 grid place-items-center shrink-0" aria-hidden><ExternalLink size={20} className="text-sky-400" /></span>
        <div className="flex-1">
          <h2 id="external-resources" className="text-lg font-bold text-fg mb-1">{T.externalTitle}</h2>
          <p className="text-sm text-fg-muted leading-relaxed">{T.externalText}</p>
        </div>
        <Link href="/resources/" className="inline-flex items-center gap-1.5 min-h-10 px-4 rounded-lg border border-line-strong text-sm font-semibold text-fg hover:bg-fg/5 shrink-0">
          {T.externalCta} <ArrowRight size={14} className="rtl-flip" aria-hidden />
        </Link>
      </section>
    </main>
  );
}
