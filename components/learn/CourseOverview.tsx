"use client";

import Link from "next/link";
import {
  ArrowRight, BarChart3, BookOpen, Briefcase, CheckCircle2, Circle, Clock, Code2, FlaskConical, GraduationCap,
  HelpCircle, Map, PlayCircle, Target, Users, Flag, ListChecks, Route,
} from "lucide-react";
import type { Curriculum } from "@/data/curricula";
import { MODULE_ORDER, courseStats, evaluateBadges, trackDescription, trackMeta, trackTitle, type CourseLesson, type PracticeChallenge } from "@/lib/catalog";
import { useLang } from "@/lib/lang-context";
import { useLabProgress } from "@/lib/lab-progress";
import { countLabel } from "@/lib/plural";
import { useStudy } from "@/lib/study-store";
import { challengesHref, courseHref, lessonHref } from "@/shared/links";
import ProgressRing from "@/components/ui/ProgressRing";
import { ChallengeGrid } from "./PracticeChallenges";
import PracticeBadges from "./PracticeBadges";
import PracticeCertificate from "./PracticeCertificate";
import PracticeChips from "./PracticeChips";
import { fmt } from "./PracticeLink";
import PracticeSample from "./PracticeSample";

export interface CourseOverviewProps {
  trackId: string;
  curriculum: Curriculum;
  lessons: CourseLesson[];
  challenges: PracticeChallenge[];
  /** Roadmap ids that have a course page (prerequisite links go there, else to the roadmap). */
  courseTracks: string[];
}

function SectionTitle({ id, icon, children }: { id: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex items-center gap-2.5 text-xl font-extrabold text-fg mb-5 scroll-mt-28">
      <span className="text-emerald-400" aria-hidden>{icon}</span>
      {children}
    </h2>
  );
}

export default function CourseOverview({ trackId, curriculum: cur, lessons, challenges, courseTracks }: CourseOverviewProps) {
  const { tx, lang } = useLang();
  const T = tx.curriculum;
  const study = useStudy();
  const labsPassed = useLabProgress();

  const meta = trackMeta(trackId);
  const title = trackTitle(trackId, lang);
  const key = (id: string) => `${trackId}/${id}`;

  const stats = courseStats(trackId, lessons, { lessons: study.lessons, labs: labsPassed });
  const pct = stats.total ? stats.done / stats.total : 0;
  // Resume at the first unfinished lesson (or the first lesson for new learners)
  const resume = lessons.find((l) => !study.lessons[key(l.lessonId)]?.done) ?? lessons[0];
  const started = lessons.some((l) => study.lessons[key(l.lessonId)]?.visited);
  const badges = evaluateBadges(cur.badges, stats);
  const modules = MODULE_ORDER.map((m) => ({ key: m, lessons: lessons.filter((l) => l.module === m) })).filter((m) => m.lessons.length);
  const passing = cur.assessment.passing;
  const hours = cur.estimatedHours;
  const sourceIcon = { lessons: <BookOpen size={15} />, quizzes: <HelpCircle size={15} />, labs: <FlaskConical size={15} />, challenges: <Flag size={15} /> } as const;

  let n = 0;
  return (
    <main className="pt-16">
      {/* Hero */}
      <section aria-labelledby="course-title" className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-60" />
        <div aria-hidden className="absolute -top-32 start-1/3 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-15" style={{ background: meta?.accent }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid lg:grid-cols-[1fr_340px] gap-10 items-start">
          <div>
            <Link href="/learn/" className="text-sm text-fg-subtle hover:text-fg">{tx.learn.eyebrow}</Link>
            <div className="flex items-center gap-3 mt-4 mb-3">
              <span className="text-4xl" aria-hidden>{meta?.icon}</span>
              <h1 id="course-title" className="text-3xl sm:text-4xl font-black tracking-tight text-fg">{title}</h1>
            </div>
            <p className="text-lg text-fg-muted leading-relaxed max-w-2xl">{trackDescription(trackId, lang)}</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm text-fg-muted">
              <li className="flex items-center gap-1.5"><BookOpen size={15} aria-hidden /> {countLabel(tx, "lesson", lessons.length)}</li>
              <li className="flex items-center gap-1.5">
                <Clock size={15} aria-hidden /> {hours === 1 ? T.hoursValueOne : fmt(T.hoursValue, { n: hours })}
              </li>
              <li className="flex items-center gap-1.5"><BarChart3 size={15} aria-hidden /> {tx.common.levels[(meta?.level ?? "All Levels") as keyof typeof tx.common.levels] ?? meta?.level}</li>
              {stats.labsTotal > 0 && <li className="flex items-center gap-1.5"><FlaskConical size={15} aria-hidden /> {fmt(T.labsFact, { n: stats.labsTotal })}</li>}
            </ul>
            {cur.estimateOnly && <p className="text-xs text-fg-subtle mt-3">{T.estimateNote}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-8">
              {resume && (
                <Link
                  href={lessonHref(trackId, resume.lessonId)}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-brand hover:bg-brand-strong text-brand-fg font-bold transition-colors"
                >
                  <PlayCircle size={18} aria-hidden /> {started ? tx.learn.continueCourse : tx.learn.startCourse}
                </Link>
              )}
              <Link href={`/roadmaps/${trackId}/`} className="inline-flex items-center gap-2 h-12 px-5 rounded-xl border border-line-strong text-fg-soft hover:text-fg hover:bg-fg/5 transition-colors">
                <Map size={16} aria-hidden /> {tx.learn.roadmapLink}
              </Link>
            </div>
          </div>

          {/* Progress card */}
          <aside aria-label={tx.learn.courseProgress} className="card p-6 animate-fade-up">
            <div className="flex items-center gap-4 mb-5">
              <ProgressRing value={pct} size={64}>
                <span dir="ltr">{Math.round(pct * 100)}%</span>
              </ProgressRing>
              <div>
                <div className="text-sm font-semibold text-fg">{tx.learn.courseProgress}</div>
                <div className="text-xs text-fg-subtle" dir="ltr">{stats.done} / {stats.total}</div>
              </div>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-fg-subtle mb-3">{tx.learn.includes}</div>
            <ul className="space-y-2.5">
              {tx.learn.includesItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-fg-soft">
                  <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" aria-hidden /> {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-[1fr_340px] gap-x-10 gap-y-14">
        <div className="min-w-0 space-y-14">
          {/* Objectives */}
          <section aria-labelledby="sec-learn">
            <SectionTitle id="sec-learn" icon={<Target size={20} />}>{T.whatYouLearn}</SectionTitle>
            <ul className="grid gap-x-8 gap-y-3 md:grid-cols-2">
              {cur.objectives.map((o) => (
                <li key={o.en} className="flex items-start gap-2.5 text-[15px] text-fg-soft leading-relaxed">
                  <CheckCircle2 size={17} className="text-emerald-400 mt-0.5 shrink-0" aria-hidden /> {o[lang]}
                </li>
              ))}
            </ul>
          </section>

          {/* Assessment */}
          <section aria-labelledby="sec-assess">
            <SectionTitle id="sec-assess" icon={<ListChecks size={20} />}>{T.assessment}</SectionTitle>
            <p className="text-[15px] text-fg-soft leading-relaxed mb-5 max-w-3xl">{cur.assessment.summary[lang]}</p>
            <div className="card p-5 mb-5">
              <div className="text-xs font-bold uppercase tracking-widest text-fg-subtle mb-3">{T.passRule}</div>
              <ul className="grid gap-2 sm:grid-cols-2 text-sm text-fg-soft">
                <li className="flex items-center gap-2"><BookOpen size={15} className="text-emerald-400 shrink-0" aria-hidden /> {passing.lessons === "all" ? T.passLessonsAll : T.passLessonsRequired}</li>
                <li className="flex items-center gap-2"><HelpCircle size={15} className="text-emerald-400 shrink-0" aria-hidden /> {fmt(T.passQuiz, { n: Math.round(passing.quizAccuracy * 100) })}</li>
                {stats.labsTotal > 0 && passing.labs > 0 && (
                  <li className="flex items-center gap-2"><FlaskConical size={15} className="text-emerald-400 shrink-0" aria-hidden /> {fmt(T.passLabs, { n: Math.min(passing.labs, stats.labsTotal) })}</li>
                )}
                {passing.challenges > 0 && (
                  <li className="flex items-center gap-2"><Flag size={15} className="text-emerald-400 shrink-0" aria-hidden /> {fmt(T.passChallenges, { n: passing.challenges })}</li>
                )}
              </ul>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {cur.assessment.criteria.map((c) => (
                <li key={c.title.en} className="card p-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-fg-subtle mb-1.5">
                    <span aria-hidden>{sourceIcon[c.source]}</span> {T.sources[c.source]}
                  </div>
                  <h3 className="text-sm font-bold text-fg mb-1">{c.title[lang]}</h3>
                  <p className="text-sm text-fg-muted leading-relaxed">{c.detail[lang]}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Curriculum */}
          <section aria-labelledby="sec-curriculum">
            <SectionTitle id="sec-curriculum" icon={<BookOpen size={20} />}>{tx.learn.curriculum}</SectionTitle>
            <div className="space-y-6">
              {modules.map((m, mi) => {
                const done = m.lessons.filter((l) => study.lessons[key(l.lessonId)]?.done).length;
                return (
                  <div key={m.key} className="card overflow-hidden">
                    <div className="px-5 py-4 border-b border-line flex items-start justify-between gap-4 bg-surface-2/50">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold uppercase tracking-widest text-fg-subtle">{tx.common.module} {mi + 1} · {countLabel(tx, "lesson", m.lessons.length)}</div>
                        <h3 className="font-bold text-fg">{cur.modules[m.key].title[lang]}</h3>
                        <p className="text-sm text-fg-muted mt-0.5">{cur.modules[m.key].summary[lang]}</p>
                      </div>
                      <span className="text-xs text-fg-subtle shrink-0 mt-1" dir="ltr" aria-label={fmt(T.moduleLessons, { done, total: m.lessons.length })}>
                        {done}/{m.lessons.length}
                      </span>
                    </div>
                    <ol className="divide-y divide-line">
                      {m.lessons.map((l) => {
                        n++;
                        const isDone = !!study.lessons[key(l.lessonId)]?.done;
                        const labs = l.practice.labs.length;
                        return (
                          <li key={l.lessonId} className="px-5 py-4">
                            <div className="flex items-start gap-4">
                              <span className="mt-0.5" role="img" aria-label={isDone ? T.lessonCompleted : undefined} aria-hidden={isDone ? undefined : true}>
                                {isDone ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Circle size={20} className="text-fg-faint" />}
                              </span>
                              <div className="min-w-0 flex-1">
                                <Link href={lessonHref(trackId, l.lessonId)} className="group inline-flex items-start gap-2 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">
                                  <span className="text-[15px] font-semibold text-fg group-hover:text-emerald-400 transition-colors">
                                    <span className="text-fg-subtle font-medium me-2" dir="ltr">{lang === "en" ? `${n}.` : n}</span>
                                    {l.title[lang]}
                                  </span>
                                  <ArrowRight size={15} className="rtl-flip text-fg-faint group-hover:text-emerald-400 mt-1 shrink-0 transition-colors" aria-hidden />
                                </Link>
                                {lang === "en" && l.description && <p className="text-sm text-fg-subtle mt-1 line-clamp-2">{l.description}</p>}
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-fg-subtle">
                                  <span className="flex items-center gap-1"><Clock size={12} aria-hidden /> {l.minutes} {tx.common.minutes}</span>
                                  {l.exercises > 0 && <span className="flex items-center gap-1"><Code2 size={12} aria-hidden /> {countLabel(tx, "exercise", l.exercises)}</span>}
                                  {l.quizzes > 0 && <span className="flex items-center gap-1"><HelpCircle size={12} aria-hidden /> {countLabel(tx, "quiz", l.quizzes)}</span>}
                                  {labs > 0 && <span className="flex items-center gap-1"><FlaskConical size={12} aria-hidden /> {fmt(T.labsFact, { n: labs })}</span>}
                                </div>
                                <div className="mt-3">
                                  <PracticeChips practice={l.practice} trackId={trackId} />
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Runnable example */}
          <section aria-labelledby="sec-sample">
            <SectionTitle id="sec-sample" icon={<Code2 size={20} />}>{T.sampleTitle}</SectionTitle>
            <PracticeSample sample={cur.sampleCode} />
          </section>

          {/* Challenges */}
          <section aria-labelledby="sec-challenges">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
              <div>
                <h2 id="sec-challenges" className="flex items-center gap-2.5 text-xl font-extrabold text-fg scroll-mt-28">
                  <Flag size={20} className="text-emerald-400" aria-hidden /> {T.challengesTitle}
                </h2>
                <p className="text-sm text-fg-muted mt-1">{T.challengesSubtitle}</p>
              </div>
              <Link href={challengesHref(trackId)} className="inline-flex items-center gap-1.5 min-h-10 text-sm font-semibold text-emerald-400 hover:underline">
                {T.challengesAll} <ArrowRight size={14} className="rtl-flip" aria-hidden />
              </Link>
            </div>
            {challenges.length > 0 ? <ChallengeGrid challenges={challenges} /> : <p className="card p-5 text-sm text-fg-muted">{T.challengesEmpty}</p>}
          </section>

          {/* Badges + certificate */}
          <section aria-labelledby="sec-badges">
            <SectionTitle id="sec-badges" icon={<GraduationCap size={20} />}>{T.badgesTitle}</SectionTitle>
            <p className="text-sm text-fg-muted -mt-3 mb-5">{T.badgesSubtitle}</p>
            <div className="grid gap-5 xl:grid-cols-[1fr_300px] items-stretch">
              <PracticeBadges badges={badges} />
              <PracticeCertificate trackId={trackId} done={stats.done} total={stats.total} />
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:row-span-1 min-w-0">
          <div className="card p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-fg mb-3"><Users size={15} aria-hidden /> {T.audience}</div>
            <p className="text-sm text-fg-soft leading-relaxed">{cur.audience[lang]}</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-fg mb-3"><Route size={15} aria-hidden /> {T.prerequisites}</div>
            <ul className="space-y-2.5">
              {cur.prerequisites.map((p, i) =>
                "track" in p ? (
                  <li key={p.track}>
                    <Link href={courseTracks.includes(p.track) ? courseHref(p.track) : `/roadmaps/${p.track}/`} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:underline">
                      {trackMeta(p.track)?.icon} {trackTitle(p.track, lang)} <ArrowRight size={13} className="rtl-flip" aria-hidden />
                    </Link>
                  </li>
                ) : (
                  <li key={i} className="text-sm text-fg-soft leading-relaxed">{p.text[lang]}</li>
                )
              )}
            </ul>
            {cur.recommendedAfter.length > 0 && (
              <div className="mt-5 pt-5 border-t border-line">
                <div className="text-xs font-bold uppercase tracking-widest text-fg-subtle mb-2.5">{T.recommendedAfter}</div>
                <ul className="flex flex-wrap gap-2">
                  {cur.recommendedAfter.map((id) => (
                    <li key={id}>
                      <Link
                        href={courseTracks.includes(id) ? courseHref(id) : `/roadmaps/${id}/`}
                        className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-full text-xs bg-fg/5 border border-line text-fg-soft hover:text-fg hover:bg-fg/10 transition-colors"
                      >
                        <span aria-hidden>{trackMeta(id)?.icon}</span> {trackTitle(id, lang)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-fg mb-4"><Briefcase size={15} aria-hidden /> {tx.learn.careers}</div>
            <ul className="flex flex-wrap gap-2">
              {(meta?.jobs ?? []).map((j) => (
                <li key={j} className="text-xs px-2.5 py-1 rounded-full bg-fg/5 border border-line text-fg-soft">{j}</li>
              ))}
            </ul>
            <div className="mt-5 pt-5 border-t border-line text-sm text-fg-muted flex justify-between gap-3">
              <span>{tx.learn.duration}</span>
              <span className="text-fg-soft font-medium text-end">{meta?.duration}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
