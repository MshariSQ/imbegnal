"use client";

import Link from "next/link";
import {
  ArrowRight, BookOpenCheck, Bot, CheckCircle2, Code2, Flame, Languages, NotebookPen, Map, Sparkles, Award,
} from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { useAuthUser } from "@/lib/auth";
import CourseCard, { type CourseCardData } from "@/components/learn/CourseCard";

export type HomeCourse = CourseCardData;

const FEATURE_ICONS = [Code2, Bot, BookOpenCheck, NotebookPen, Flame, Languages];

/** Static mock of the lesson player: shows the product without shipping a video/image. */
function ProductPreview() {
  return (
    <div aria-hidden className="relative mx-auto max-w-5xl mt-16 animate-fade-up">
      <div className="absolute -inset-4 bg-brand/10 blur-3xl rounded-[2rem]" />
      <div className="relative card overflow-hidden shadow-2xl">
        <div className="flex items-center gap-1.5 px-4 h-10 border-b border-line bg-surface-2/60">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          <span className="ms-3 text-[11px] text-fg-subtle" dir="ltr">imbegnal.com/learn/frontend/react</span>
        </div>
        <div className="grid md:grid-cols-[1fr_280px] text-start" dir="ltr">
          <div className="p-6 sm:p-8">
            <div className="text-xs font-semibold text-emerald-400 mb-2">Foundations · Lesson 4/9</div>
            <div className="text-2xl font-black text-fg mb-4">React — Think in Components</div>
            <div className="space-y-2 mb-5">
              <div className="h-2.5 rounded bg-fg/10 w-11/12" /><div className="h-2.5 rounded bg-fg/10 w-9/12" /><div className="h-2.5 rounded bg-fg/10 w-10/12" />
            </div>
            <pre className="rounded-xl bg-surface-2 border border-line p-4 text-[12.5px] leading-relaxed font-mono text-fg-soft overflow-hidden"><span className="text-purple-400">function</span> Welcome(props) {"{"}{"\n"}  <span className="text-purple-400">return</span> {"<"}h1{">"}Hello, {"{"}props.name{"}"}!{"</"}h1{">"};{"\n"}{"}"}</pre>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-1.5">
              <CheckCircle2 size={14} /> All checks passed · +15 XP
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-3 border-s border-line p-4 bg-surface-2/30">
            <div className="flex items-center gap-1.5 text-xs font-bold text-fg"><Bot size={14} className="text-emerald-400" /> AI tutor</div>
            <div className="self-end max-w-[85%] rounded-2xl rounded-ee-md bg-brand text-brand-fg text-xs px-3 py-2">Explain props like I&apos;m 10</div>
            <div className="text-xs text-fg-soft leading-relaxed">Props are like the name tag you hand to a component: it reads the tag and greets that person. 👋</div>
            <div className="mt-auto h-9 rounded-xl border border-line-strong bg-surface" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home({ courses, totals }: { courses: HomeCourse[]; totals: { lessons: number; exercises: number } }) {
  const { tx } = useLang();
  const t = tx.landing;
  const user = useAuthUser();

  const stats = [
    { value: courses.length, label: t.statCourses },
    { value: totals.lessons, label: t.statLessons },
    { value: `${totals.exercises}+`, label: t.statExercises },
    { value: 2, label: t.statLanguages },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 sm:pt-40 pb-20 px-4 sm:px-6 text-center">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-60" />
        <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[48rem] h-[48rem] rounded-full blur-3xl opacity-20 bg-brand" />
        <div className="relative max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand/30 bg-brand/10 text-xs font-semibold text-emerald-400 mb-7">
            <Sparkles size={13} /> {t.badge}
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-fg leading-[1.05] text-balance">
            {t.title1} <span className="gradient-text">{t.title2}</span>
          </h1>
          <p className="mt-6 text-base sm:text-xl text-fg-muted leading-relaxed max-w-2xl mx-auto">{t.subtitle}</p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={user ? "/dashboard/" : "/learn/"} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-brand hover:bg-brand-strong text-brand-fg font-bold transition-colors">
              {user ? t.ctaContinue : t.ctaPrimary} <ArrowRight size={17} className="rtl-flip" />
            </Link>
            <Link href="/roadmaps/" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl border border-line-strong text-fg-soft hover:text-fg hover:bg-fg/5 font-semibold transition-colors">
              <Map size={17} /> {t.ctaSecondary}
            </Link>
          </div>
          <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-fg-subtle">
            {t.trust.map((x) => (
              <li key={x} className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> {x}</li>
            ))}
          </ul>
        </div>
        <ProductPreview />
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-5 text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-3xl font-black text-fg tabular-nums" dir="ltr">{s.value}</dd>
              <div aria-hidden className="text-xs text-fg-subtle mt-1">{s.label}</div>
            </div>
          ))}
        </dl>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-28">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400 mb-3">{t.featuresEyebrow}</p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-fg">{t.featuresTitle}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={f.title} className="card card-hover p-6">
                <span className="w-11 h-11 rounded-xl bg-brand/15 grid place-items-center mb-4"><Icon size={20} className="text-emerald-400" /></span>
                <h3 className="font-bold text-fg mb-1.5">{f.title}</h3>
                <p className="text-sm text-fg-muted leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-28">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400 mb-3">{t.coursesEyebrow}</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-fg">{t.coursesTitle}</h2>
          </div>
          <Link href="/learn/" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:underline shrink-0">
            {t.viewAll} <ArrowRight size={15} className="rtl-flip" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-28">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400 mb-3">{t.howEyebrow}</p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-fg">{t.howTitle}</h2>
        </div>
        <ol className="grid md:grid-cols-3 gap-5">
          {t.how.map((s, i) => (
            <li key={s.title} className="card p-6">
              <span className="w-9 h-9 rounded-full bg-brand text-brand-fg font-black grid place-items-center mb-4" dir="ltr">{i + 1}</span>
              <h3 className="font-bold text-fg mb-1.5">{s.title}</h3>
              <p className="text-sm text-fg-muted leading-relaxed">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Roadmaps & certifications */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-28">
        <div className="card p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <span className="w-12 h-12 rounded-2xl bg-amber-500/15 grid place-items-center shrink-0"><Award size={22} className="text-amber-400" /></span>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-fg mb-1.5">{t.resourcesTitle}</h2>
            <p className="text-sm text-fg-muted leading-relaxed">{t.resourcesText}</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/roadmaps/" className="h-10 px-4 grid place-items-center rounded-lg border border-line-strong text-sm font-semibold text-fg hover:bg-fg/5">{tx.nav.roadmaps}</Link>
            <Link href="/certifications/" className="h-10 px-4 grid place-items-center rounded-lg border border-line-strong text-sm font-semibold text-fg hover:bg-fg/5">{tx.nav.certifications}</Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 text-center">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-fg">{t.ctaTitle}</h2>
        <p className="mt-4 text-fg-muted text-lg">{t.ctaText}</p>
        <Link href={user ? "/dashboard/" : "/learn/"} className="mt-8 inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-brand hover:bg-brand-strong text-brand-fg font-bold transition-colors">
          {user ? t.ctaContinue : t.ctaPrimary} <ArrowRight size={17} className="rtl-flip" />
        </Link>
      </section>
    </main>
  );
}
