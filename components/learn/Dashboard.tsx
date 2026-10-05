"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Flame, NotebookPen, PlayCircle, Sparkles, Target, Trophy, Cloud } from "lucide-react";
import type { L10n } from "@/data/lessons/types";
import { useLang } from "@/lib/lang-context";
import { getToken, removeToken, useAuthUser } from "@/lib/auth";
import { deleteAccountRemote } from "@/lib/api";
import { completedCount, levelInfo, streak, today, totalXp, useStudy } from "@/lib/study-store";
import ProgressRing from "@/components/ui/ProgressRing";
import ProgressBar from "@/components/ui/ProgressBar";
import CourseCard from "./CourseCard";

export interface DashboardCourse {
  id: string;
  icon: string;
  accent: string;
  level: string;
  lessons: { id: string; title: L10n; minutes: number }[];
}

function Stat({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: React.ReactNode; tint: string }) {
  return (
    <div className="card p-4 sm:p-5">
      <span className={`w-9 h-9 rounded-xl grid place-items-center mb-3 ${tint}`}>{icon}</span>
      <div className="text-2xl sm:text-3xl font-black text-fg tabular-nums" dir="ltr">{value}</div>
      <div className="text-xs text-fg-subtle mt-0.5">{label}</div>
    </div>
  );
}

/** Last 7 days of activity as a tiny bar strip (oldest → newest). */
function WeekStrip({ days }: { days: string[] }) {
  const { lang } = useLang();
  const set = new Set(days);
  const cells = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { key: today(d), label: d.toLocaleDateString(lang === "ar" ? "ar" : "en", { weekday: "narrow" }), active: set.has(today(d)) };
  });
  return (
    <div className="flex items-end justify-between gap-2" dir="ltr">
      {cells.map((c, i) => (
        <div key={c.key} className="flex-1 flex flex-col items-center gap-1.5">
          <div className={`w-full rounded-md transition-all ${c.active ? "h-9 bg-brand" : "h-3 bg-surface-2"} ${i === 6 ? "ring-1 ring-brand/40" : ""}`} />
          <span className="text-[10px] text-fg-subtle">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ courses }: { courses: DashboardCourse[] }) {
  const { tx, lang } = useLang();
  const d = tx.dashboard;
  const user = useAuthUser();
  const study = useStudy();

  const xp = totalXp(study);
  const lvl = levelInfo(xp);
  const days = streak(study);
  const doneToday = study.days.includes(today());
  const done = completedCount(study);

  async function deleteAccount() {
    const token = getToken();
    if (!token || !window.confirm(d.deleteConfirm)) return;
    try {
      await deleteAccountRemote(token);
      removeToken(); // signs out; progress saved on this device is kept
    } catch {
      window.alert(tx.auth.errorGeneric);
    }
  }

  const lessonIndex = new Map<string, { course: DashboardCourse; lesson: DashboardCourse["lessons"][number] }>(
    courses.flatMap((c) => c.lessons.map((l) => [`${c.id}/${l.id}`, { course: c, lesson: l }] as [string, { course: DashboardCourse; lesson: DashboardCourse["lessons"][number] }]))
  );
  const courseDone = (c: DashboardCourse) => completedCount(study, c.lessons.map((l) => `${c.id}/${l.id}`));

  // Resume: the most recently visited lesson, unless done → next unfinished in that course
  const lastKey = study.last?.key;
  let resume = lastKey ? lessonIndex.get(lastKey) : undefined;
  if (resume && study.lessons[lastKey!]?.done) {
    const next = resume.course.lessons.find((l) => !study.lessons[`${resume!.course.id}/${l.id}`]?.done);
    resume = next ? { course: resume.course, lesson: next } : undefined;
  }

  const inProgress = courses.filter((c) => courseDone(c) > 0 && courseDone(c) < c.lessons.length);
  const started = new Set(inProgress.map((c) => c.id));
  // Suggest unstarted courses; beginner-friendly first
  const rank = (l: string) => (l === "Beginner" ? 0 : l === "All Levels" ? 1 : 2);
  const recommended = courses.filter((c) => courseDone(c) === 0 && !started.has(c.id)).sort((a, b) => rank(a.level) - rank(b.level)).slice(0, 3);

  const notes = Object.entries(study.notes)
    .sort((a, b) => b[1].updated - a[1].updated)
    .slice(0, 4)
    .map(([key, n]) => ({ key, text: n.text, ref: lessonIndex.get(key) }))
    .filter((n) => n.ref);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-fg">
          {user ? `${d.greeting}, ${(user.name || user.username).split(" ")[0]}` : d.greetingGuest}
        </h1>
        <p className="text-fg-muted mt-2">{d.subtitle}</p>
      </header>

      {/* Continue learning */}
      <section className="card relative overflow-hidden p-6 sm:p-8 mb-6">
        <div aria-hidden className="absolute -top-24 -end-24 w-72 h-72 rounded-full blur-3xl opacity-20 bg-brand" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          {resume ? (
            <>
              <span className="text-5xl">{resume.course.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1.5">{d.continueTitle}</div>
                <div className="text-xl sm:text-2xl font-bold text-fg truncate">{resume.lesson.title[lang]}</div>
                <div className="text-sm text-fg-subtle mt-1">{tx.tracks[resume.course.id]?.title} · {resume.lesson.minutes} {tx.common.minutes}</div>
              </div>
              <Link href={`/learn/${resume.course.id}/${resume.lesson.id}/`} className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-brand hover:bg-brand-strong text-brand-fg font-bold shrink-0">
                <PlayCircle size={18} /> {tx.common.continue}
              </Link>
            </>
          ) : (
            <>
              <span className="w-14 h-14 rounded-2xl bg-brand/15 grid place-items-center"><BookOpen size={26} className="text-emerald-400" /></span>
              <div className="flex-1">
                <div className="text-xl font-bold text-fg">{d.continueEmpty}</div>
                <div className="text-sm text-fg-muted mt-1">{tx.learn.subtitle}</div>
              </div>
              <Link href="/learn/" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-brand hover:bg-brand-strong text-brand-fg font-bold shrink-0">
                {d.browseCourses} <ArrowRight size={16} className="rtl-flip" />
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon={<BookOpen size={18} className="text-blue-400" />} tint="bg-blue-500/15" label={d.statLessons} value={done} />
        <Stat icon={<Flame size={18} className="text-orange-400" />} tint="bg-orange-500/15" label={d.statStreak} value={days} />
        <Stat icon={<Sparkles size={18} className="text-amber-400" />} tint="bg-amber-500/15" label={d.statXp} value={xp} />
        <div className="card p-4 sm:p-5 flex items-center gap-4">
          <ProgressRing value={lvl.progress} size={64}><span dir="ltr">{lvl.level}</span></ProgressRing>
          <div>
            <div className="text-sm font-semibold text-fg">{d.statLevel} {lvl.level}</div>
            <div className="text-xs text-fg-subtle" dir="ltr">{lvl.toNext} XP →</div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-8 min-w-0">
          {/* My courses */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-fg">{d.myCourses}</h2>
              <Link href="/learn/" className="text-sm text-emerald-400 hover:underline">{d.viewAll}</Link>
            </div>
            {inProgress.length === 0 ? (
              <p className="card p-6 text-sm text-fg-muted">{d.myCoursesEmpty}</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {inProgress.map((c) => (
                  <CourseCard key={c.id} course={{ id: c.id, icon: c.icon, accent: c.accent, level: c.level, lessonCount: c.lessons.length, minutes: c.lessons.reduce((s, l) => s + l.minutes, 0) }} done={courseDone(c)} />
                ))}
              </div>
            )}
          </section>

          {/* Recommended */}
          {recommended.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-fg mb-4">{d.recommended}</h2>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {recommended.map((c) => (
                  <CourseCard key={c.id} course={{ id: c.id, icon: c.icon, accent: c.accent, level: c.level, lessonCount: c.lessons.length, minutes: c.lessons.reduce((s, l) => s + l.minutes, 0) }} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {/* Daily goal + week */}
          <section className="card p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-fg mb-1"><Target size={15} className="text-emerald-400" /> {d.goalTitle}</div>
            <p className="text-sm text-fg-muted mb-4">{doneToday ? d.goalDone : d.goalText}</p>
            <ProgressBar value={doneToday ? 1 : 0} className="mb-5" label={d.goalTitle} />
            <div className="text-xs font-bold uppercase tracking-widest text-fg-subtle mb-3">{d.activityTitle}</div>
            <WeekStrip days={study.days} />
          </section>

          {/* Notes */}
          <section className="card p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-fg mb-3"><NotebookPen size={15} className="text-emerald-400" /> {d.notesTitle}</div>
            {notes.length === 0 ? (
              <p className="text-sm text-fg-subtle">{d.notesEmpty}</p>
            ) : (
              <ul className="space-y-1">
                {notes.map((n) => (
                  <li key={n.key}>
                    <Link href={`/learn/${n.key}/`} className="block rounded-lg px-2.5 py-2 -mx-2.5 hover:bg-fg/5">
                      <div className="text-xs font-semibold text-fg-soft truncate">{n.ref!.lesson.title[lang]}</div>
                      <div className="text-xs text-fg-subtle line-clamp-2 mt-0.5">{n.text}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5 flex items-start gap-3">
            {user ? <Cloud size={18} className="text-emerald-400 mt-0.5 shrink-0" /> : <Trophy size={18} className="text-amber-400 mt-0.5 shrink-0" />}
            <div className="text-sm text-fg-muted">
              {user ? (
                <>
                  {d.syncOn}
                  <button onClick={deleteAccount} className="block mt-2 text-xs text-fg-subtle hover:text-red-400 underline underline-offset-2">
                    {d.deleteAccount}
                  </button>
                </>
              ) : (<>{d.syncGuest} <Link href="/login/" className="text-emerald-400 font-semibold hover:underline">{tx.auth.signIn}</Link></>)}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
