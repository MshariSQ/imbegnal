"use client";

import Link from "next/link";
import {
  ArrowRight, Award, BarChart3, BookOpen, Briefcase, CheckCircle2, Circle, Clock, Heart, Map, PlayCircle, Sparkles, Trophy,
} from "lucide-react";
import { PATH_LEVELS } from "@/data/career-paths";
import { hoursFromMinutes, nextCourse, pathProgress, type PathCourse, type PathProgress, type PathSummary } from "@/lib/career-paths";
import { useLang } from "@/lib/lang-context";
import { countLabel, hoursLabel } from "@/lib/plural";
import { useStudy } from "@/lib/study-store";
import { courseHref } from "@/shared/links";
import ProgressBar from "@/components/ui/ProgressBar";
import ProgressRing from "@/components/ui/ProgressRing";
import { fmt } from "@/components/learn/PracticeLink";
import type { Tx } from "@/lib/i18n";
import { COMING_SOON_CLASS, LevelBadge, coursesCount, levelRange } from "./PathBits";

function SectionTitle({ id, icon, children }: { id: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex items-center gap-2.5 text-xl font-extrabold text-fg mb-2 scroll-mt-28">
      <span className="text-emerald-400" aria-hidden>{icon}</span>
      {children}
    </h2>
  );
}

/** One labelled row of chips in the hero: "If you like", skills, job titles. */
function ChipGroup({ icon, title, items, lang }: { icon: React.ReactNode; title: string; items: { en: string; ar: string }[]; lang: "en" | "ar" }) {
  return (
    <div>
      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-fg-subtle mb-2.5">{icon} {title}</h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.en} className="text-sm px-3 py-1.5 rounded-full bg-fg/5 border border-line text-fg-soft">{item[lang]}</li>
        ))}
      </ul>
    </div>
  );
}

function CourseStep({ course, total, progress, tx, lang }: { course: PathCourse; total: number; progress: PathProgress; tx: Tx; lang: "en" | "ar" }) {
  const T = tx.paths;
  const label = fmt(T.courseOf, { k: course.position, n: total });
  const titleId = `step-${course.id}`;

  if (!course.available) {
    return (
      <article
        aria-labelledby={titleId}
        data-course-state="coming-soon"
        data-course={course.id}
        className="rounded-2xl border border-dashed border-line-strong bg-surface/40 p-5"
      >
        <div className="flex items-start gap-4">
          <span className="text-3xl leading-none opacity-70" aria-hidden>{course.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-fg-subtle">{label}</span>
              <LevelBadge level={course.level} tx={tx} />
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${COMING_SOON_CLASS}`}>
                <Sparkles size={11} aria-hidden /> {T.comingSoon}
              </span>
            </div>
            <h4 id={titleId} className="text-lg font-bold text-fg-soft">{course.title[lang]}</h4>
            {course.description[lang] && <p className="text-sm text-fg-muted mt-1 leading-relaxed">{course.description[lang]}</p>}
            <p className="text-sm text-fg-soft mt-3 leading-relaxed"><span className="font-semibold">{T.whyLabel}:</span> {course.why[lang]}</p>
            <p className="text-xs text-fg-subtle mt-3">{T.comingSoonNote}</p>
          </div>
        </div>
      </article>
    );
  }

  const p = progress.perCourse[course.id] ?? { done: 0, total: course.lessonIds.length, complete: false };
  const status = p.complete ? T.statusComplete : p.done > 0 ? T.statusInProgress : T.statusNotStarted;
  return (
    <article aria-labelledby={titleId} data-course-state="available" data-course={course.id} className="card relative overflow-hidden p-5">
      <div aria-hidden className="absolute -top-16 -end-16 w-40 h-40 rounded-full blur-3xl opacity-15" style={{ background: course.accent }} />
      <div className="relative flex items-start gap-4">
        <span className="text-3xl leading-none" aria-hidden>{course.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-fg-subtle">{label}</span>
            <LevelBadge level={course.level} tx={tx} />
          </div>
          <h4 id={titleId} className="text-lg font-bold text-fg">
            <Link href={courseHref(course.id)} className="hover:text-emerald-400 transition-colors">{course.title[lang]}</Link>
          </h4>
          <p className="text-sm text-fg-soft mt-1.5 leading-relaxed"><span className="font-semibold">{T.whyLabel}:</span> {course.why[lang]}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-fg-subtle">
            <li className="flex items-center gap-1.5"><BookOpen size={13} aria-hidden /> {countLabel(tx, "lesson", course.lessonIds.length)}</li>
            <li className="flex items-center gap-1.5"><Clock size={13} aria-hidden /> {hoursLabel(tx, hoursFromMinutes(course.minutes))}</li>
            <li className="flex items-center gap-1.5">
              {p.complete ? <CheckCircle2 size={13} className="text-emerald-400" aria-hidden /> : <Circle size={13} aria-hidden />} {status}
            </li>
          </ul>
          <div className="flex items-center gap-3 mt-3">
            <ProgressBar value={p.total ? p.done / p.total : 0} className="flex-1" label={`${course.title[lang]}: ${fmt(T.lessonsDone, { done: p.done, total: p.total })}`} />
            <span className="text-xs text-fg-subtle shrink-0">{fmt(T.lessonsDone, { done: p.done, total: p.total })}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Link
              href={courseHref(course.id)}
              aria-label={`${p.done > 0 && !p.complete ? T.continue : T.openCourse}: ${course.title[lang]}`}
              className="inline-flex items-center gap-1.5 min-h-10 px-4 rounded-lg bg-brand hover:bg-brand-strong text-brand-fg text-sm font-semibold transition-colors"
            >
              {p.done > 0 && !p.complete ? T.continue : T.openCourse} <ArrowRight size={14} className="rtl-flip" aria-hidden />
            </Link>
            <Link
              href={`/roadmaps/${course.id}/`}
              aria-label={`${T.courseMap}: ${course.title[lang]}`}
              className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-lg border border-line text-sm text-fg-muted hover:text-fg hover:border-line-strong transition-colors"
            >
              <Map size={14} aria-hidden /> {T.courseMap}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/** /roadmaps/<path-id>/: the role page. Progress is the learner's own (study store); figures come from the build. */
export default function CareerPathPage({ path }: { path: PathSummary }) {
  const { tx, lang } = useLang();
  const T = tx.paths;
  const study = useStudy();
  const progress = pathProgress(path, study.lessons);
  const next = nextCourse(path, progress);
  const started = progress.done > 0;
  const available = path.courses.filter((c) => c.available);
  const groups = PATH_LEVELS.map((lv) => ({ level: lv, courses: path.courses.filter((c) => c.level === lv) })).filter((g) => g.courses.length);
  const pct = Math.round(progress.ratio * 100);
  const stateText = {
    "not-started": T.completion.notStarted,
    "in-progress": T.completion.inProgress,
    "available-complete": T.completion.availableComplete,
    complete: T.completion.complete,
  }[progress.state];
  const done = progress.state === "complete";

  return (
    <main className="pt-16">
      {/* Hero */}
      <section aria-labelledby="path-title" className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-60" />
        <div aria-hidden className="absolute -top-32 start-1/3 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-15" style={{ background: path.accent }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid lg:grid-cols-[1fr_340px] gap-10 items-start">
          <div className="min-w-0">
            <nav aria-label={T.eyebrow}>
              <ol className="flex flex-wrap items-center gap-2 text-sm text-fg-subtle">
                <li><Link href="/roadmaps/" className="hover:text-fg underline-offset-2 hover:underline">{tx.nav.roadmaps}</Link></li>
                <li aria-hidden>/</li>
                <li>{T.categories[path.category]}</li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="text-fg-muted">{path.title[lang]}</li>
              </ol>
            </nav>
            <div className="flex items-center gap-3 mt-4 mb-3">
              <span className="text-4xl" aria-hidden>{path.icon}</span>
              <h1 id="path-title" className="text-3xl sm:text-4xl font-black tracking-tight text-fg">{path.title[lang]}</h1>
            </div>
            <p className="text-lg text-fg-muted leading-relaxed max-w-2xl">{path.description[lang]}</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm text-fg-muted">
              <li className="flex items-center gap-1.5">
                <BookOpen size={15} aria-hidden /> {coursesCount(tx, path.totals.courses)}
                {path.totals.comingSoon > 0 && <span className="text-fg-subtle">· {fmt(T.comingSoonCount, { n: path.totals.comingSoon })}</span>}
              </li>
              <li className="flex items-center gap-1.5"><PlayCircle size={15} aria-hidden /> {countLabel(tx, "lesson", path.totals.lessons)}</li>
              <li className="flex items-center gap-1.5"><Clock size={15} aria-hidden /> {hoursLabel(tx, hoursFromMinutes(path.totals.minutes))}</li>
              <li className="flex items-center gap-1.5"><BarChart3 size={15} aria-hidden /> {levelRange(tx, path.levels)}</li>
            </ul>

            <div className="mt-7 space-y-5">
              <ChipGroup icon={<Heart size={13} aria-hidden />} title={T.ifYouLike} items={path.ifYouLike} lang={lang} />
              <ChipGroup icon={<Sparkles size={13} aria-hidden />} title={T.skills} items={path.skills} lang={lang} />
              <ChipGroup icon={<Briefcase size={13} aria-hidden />} title={T.jobs} items={path.jobs} lang={lang} />
            </div>

            {!done && (
              <div className="flex flex-wrap items-center gap-3 mt-8">
                {/* No "Continue" once every available course is done (next is undefined then) */}
                {next && (
                  <Link
                    href={courseHref(next.id)}
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-brand hover:bg-brand-strong text-brand-fg font-bold transition-colors"
                  >
                    <PlayCircle size={18} aria-hidden /> {started ? `${T.continue}: ${next.title[lang]}` : T.start}
                  </Link>
                )}
                <a href="#path-courses" className="inline-flex items-center gap-2 h-12 px-5 rounded-xl border border-line-strong text-fg-soft hover:text-fg hover:bg-fg/5 transition-colors">
                  {T.coursesTitle}
                </a>
              </div>
            )}
          </div>

          {/* Progress */}
          <aside aria-label={T.progressLabel} className="card p-6" data-path-progress={pct}>
            <div className="flex items-center gap-4 mb-4">
              <ProgressRing value={progress.ratio} size={64}>
                <span dir="ltr">{pct}%</span>
              </ProgressRing>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-fg">{T.progressLabel}</div>
                <div className="text-xs text-fg-subtle">{fmt(T.lessonsDone, { done: progress.done, total: progress.total })}</div>
                <div className="text-xs text-fg-subtle">{fmt(T.coursesComplete, { done: progress.coursesComplete, total: available.length })}</div>
              </div>
            </div>
            <ProgressBar value={progress.ratio} label={T.progressLabel} />
            {done && (
              <p className="flex items-center gap-2 mt-4 text-sm font-semibold text-emerald-400"><Trophy size={16} aria-hidden /> {T.completion.complete}</p>
            )}
          </aside>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="min-w-0 max-w-4xl space-y-14">
          {/* Courses by level */}
          <section aria-labelledby="path-courses">
            <SectionTitle id="path-courses" icon={<BookOpen size={20} />}>{T.coursesTitle}</SectionTitle>
            <p className="text-sm text-fg-muted mb-6 max-w-3xl">{T.coursesSubtitle}</p>
            <div className="space-y-8">
              {groups.map((g) => (
                <div key={g.level} data-level={g.level}>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-fg-subtle mb-3">
                    <LevelBadge level={g.level} tx={tx} />
                  </h3>
                  <ol className="space-y-4">
                    {g.courses.map((c) => (
                      <li key={c.id}>
                        <CourseStep course={c} total={path.courses.length} progress={progress} tx={tx} lang={lang} />
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>

          {/* Completion */}
          <section
            aria-labelledby="path-completion"
            data-path-state={progress.state}
            className={`card p-6 ${done ? "border-emerald-500/40 bg-emerald-500/5" : ""}`}
          >
            <SectionTitle id="path-completion" icon={done ? <Trophy size={20} /> : <Award size={20} />}>{T.completion.title}</SectionTitle>
            <p className={`text-[15px] leading-relaxed mb-5 ${done ? "text-fg font-semibold" : "text-fg-soft"}`}>{stateText}</p>
            <h3 className="text-xs font-bold uppercase tracking-widest text-fg-subtle mb-3">{T.completion.certificates}</h3>
            <ul className="divide-y divide-line border-y border-line">
              {path.courses.map((c) => {
                const p = progress.perCourse[c.id];
                const left = p ? p.total - p.done : 0;
                return (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
                    <span className="flex items-center gap-2 min-w-0 text-sm text-fg-soft">
                      <span aria-hidden>{c.icon}</span>
                      <span className="truncate">{c.title[lang]}</span>
                    </span>
                    {!c.available ? (
                      <span className="text-xs font-semibold text-amber-400">{T.comingSoon}</span>
                    ) : p?.complete ? (
                      <span className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400"><CheckCircle2 size={13} aria-hidden /> {T.completion.certificateReady}</span>
                        <Link
                          href={`${courseHref(c.id)}#sec-badges`}
                          aria-label={`${T.completion.getCertificate}: ${c.title[lang]}`}
                          className="inline-flex items-center min-h-10 px-3 rounded-lg border border-line text-xs font-semibold text-fg hover:bg-fg/5"
                        >
                          {T.completion.getCertificate}
                        </Link>
                      </span>
                    ) : (
                      <span className="text-xs text-fg-subtle">{left === 1 ? T.completion.certificateLeftOne : fmt(T.completion.certificateLeft, { n: left })}</span>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-fg-subtle mt-4 leading-relaxed">{T.completion.noPathCertificate}</p>
          </section>

          <Link href="/roadmaps/" className="inline-flex items-center gap-1.5 min-h-10 text-sm font-semibold text-emerald-400 hover:underline">
            {T.allPaths} <ArrowRight size={14} className="rtl-flip" aria-hidden />
          </Link>
        </div>
      </div>
    </main>
  );
}
