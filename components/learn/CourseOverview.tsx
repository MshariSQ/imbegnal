"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Circle, Clock, Code2, HelpCircle, Map, PlayCircle, Briefcase, BarChart3 } from "lucide-react";
import type { L10n } from "@/data/lessons/types";
import { MODULE_ORDER, type ModuleKey } from "@/lib/catalog";
import { useLang } from "@/lib/lang-context";
import { countLabel } from "@/lib/plural";
import { useStudy } from "@/lib/study-store";
import ProgressRing from "@/components/ui/ProgressRing";

interface OutlineItem {
  lessonId: string;
  title: L10n;
  minutes: number;
  module: ModuleKey;
  exercises: number;
  quizzes: number;
  description: string;
}

export default function CourseOverview({
  course,
  outline,
}: {
  course: { id: string; icon: string; accent: string; level: string; duration: string; jobs: string[] };
  outline: OutlineItem[];
}) {
  const { tx, lang } = useLang();
  const study = useStudy();
  const t = tx.tracks[course.id];
  const key = (id: string) => `${course.id}/${id}`;

  const doneCount = outline.filter((l) => study.lessons[key(l.lessonId)]?.done).length;
  const pct = outline.length ? doneCount / outline.length : 0;
  // Resume at the first unfinished lesson (or the first lesson for new learners)
  const resume = outline.find((l) => !study.lessons[key(l.lessonId)]?.done) ?? outline[0];
  const started = outline.some((l) => study.lessons[key(l.lessonId)]?.visited);
  const totalMin = outline.reduce((s, l) => s + l.minutes, 0);
  const modules = MODULE_ORDER.map((m) => ({ key: m, lessons: outline.filter((l) => l.module === m) })).filter((m) => m.lessons.length);

  let n = 0;
  return (
    <main className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-60" />
        <div aria-hidden className="absolute -top-32 start-1/3 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-15" style={{ background: course.accent }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid lg:grid-cols-[1fr_320px] gap-10 items-start">
          <div>
            <Link href="/learn/" className="text-sm text-fg-subtle hover:text-fg">{tx.learn.eyebrow}</Link>
            <div className="flex items-center gap-3 mt-4 mb-3">
              <span className="text-4xl">{course.icon}</span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-fg">{t?.title}</h1>
            </div>
            <p className="text-lg text-fg-muted leading-relaxed max-w-2xl">{t?.desc}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm text-fg-muted">
              <span className="flex items-center gap-1.5"><BookOpen size={15} /> {countLabel(tx, "lesson", outline.length)}</span>
              <span className="flex items-center gap-1.5"><Clock size={15} /> ~{Math.round(totalMin / 60)}h</span>
              <span className="flex items-center gap-1.5"><BarChart3 size={15} /> {course.level}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-8">
              {resume && (
                <Link
                  href={`/learn/${course.id}/${resume.lessonId}/`}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-brand hover:bg-brand-strong text-brand-fg font-bold transition-colors"
                >
                  <PlayCircle size={18} /> {started ? tx.learn.continueCourse : tx.learn.startCourse}
                </Link>
              )}
              <Link href={`/roadmaps/${course.id}/`} className="inline-flex items-center gap-2 h-12 px-5 rounded-xl border border-line-strong text-fg-soft hover:text-fg hover:bg-fg/5 transition-colors">
                <Map size={16} /> {tx.learn.roadmapLink}
              </Link>
            </div>
          </div>

          {/* Progress card */}
          <aside className="card p-6 animate-fade-up">
            <div className="flex items-center gap-4 mb-5">
              <ProgressRing value={pct} size={64}>
                <span dir="ltr">{Math.round(pct * 100)}%</span>
              </ProgressRing>
              <div>
                <div className="text-sm font-semibold text-fg">{tx.learn.courseProgress}</div>
                <div className="text-xs text-fg-subtle" dir="ltr">{doneCount} / {outline.length}</div>
              </div>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-fg-subtle mb-3">{tx.learn.includes}</div>
            <ul className="space-y-2.5">
              {tx.learn.includesItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-fg-soft">
                  <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-[1fr_320px] gap-10">
        {/* Curriculum */}
        <section>
          <h2 className="text-xl font-bold text-fg mb-5">{tx.learn.curriculum}</h2>
          <div className="space-y-6">
            {modules.map((m, mi) => (
              <div key={m.key} className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-surface-2/50">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-fg-subtle">{tx.common.module} {mi + 1} · {countLabel(tx, "lesson", m.lessons.length)}</div>
                    <div className="font-bold text-fg">{tx.modules[m.key]}</div>
                  </div>
                  <span className="text-xs text-fg-subtle" dir="ltr">
                    {m.lessons.filter((l) => study.lessons[key(l.lessonId)]?.done).length}/{m.lessons.length}
                  </span>
                </div>
                <ol className="divide-y divide-line">
                  {m.lessons.map((l) => {
                    n++;
                    const done = !!study.lessons[key(l.lessonId)]?.done;
                    return (
                      <li key={l.lessonId}>
                        <Link href={`/learn/${course.id}/${l.lessonId}/`} className="group flex items-start gap-4 px-5 py-4 hover:bg-fg/[0.03] transition-colors">
                          <span className="mt-0.5">
                            {done ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Circle size={20} className="text-fg-faint" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[15px] font-semibold text-fg group-hover:text-emerald-400 transition-colors">
                              <span className="text-fg-subtle font-medium me-1.5" dir="ltr">{n}.</span>
                              {l.title[lang]}
                            </div>
                            {lang === "en" && l.description && <p className="text-sm text-fg-subtle mt-1 line-clamp-2">{l.description}</p>}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-fg-subtle">
                              <span className="flex items-center gap-1"><Clock size={12} /> {l.minutes} {tx.common.minutes}</span>
                              {l.exercises > 0 && <span className="flex items-center gap-1"><Code2 size={12} /> {countLabel(tx, "exercise", l.exercises)}</span>}
                              {l.quizzes > 0 && <span className="flex items-center gap-1"><HelpCircle size={12} /> {countLabel(tx, "quiz", l.quizzes)}</span>}
                            </div>
                          </div>
                          <ArrowRight size={16} className="rtl-flip text-fg-faint group-hover:text-emerald-400 mt-1 shrink-0 transition-colors" />
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-fg mb-4"><Briefcase size={15} /> {tx.learn.careers}</div>
            <div className="flex flex-wrap gap-2">
              {course.jobs.map((j) => (
                <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-fg/5 border border-line text-fg-soft">{j}</span>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-line text-sm text-fg-muted flex justify-between">
              <span>{tx.learn.duration}</span>
              <span className="text-fg-soft font-medium">{course.duration}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
