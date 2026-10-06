"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, PlayCircle } from "lucide-react";
import type { L10n } from "@/data/lessons/types";
import { trackMeta, trackTitle } from "@/lib/catalog";
import { useLang } from "@/lib/lang-context";
import { useStudy, completedCount } from "@/lib/study-store";
import PageHeader from "@/components/ui/PageHeader";
import CourseCard from "./CourseCard";

export interface CatalogCourse {
  /** Roadmap id: names, icons and accents come from roadmaps[] (lib/catalog). */
  id: string;
  level: string;
  minutes: number;
  lessons: { id: string; title: L10n; minutes: number }[];
}

export default function CourseCatalog({ courses }: { courses: CatalogCourse[] }) {
  const { tx, lang } = useLang();
  const study = useStudy();
  const [q, setQ] = useState("");

  // Lesson-level search across every course (titles in both languages)
  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (needle.length < 2) return null;
    return courses.flatMap((c) =>
      c.lessons
        .filter((l) => l.title.en.toLowerCase().includes(needle) || l.title.ar.includes(needle) || trackTitle(c.id, "en").toLowerCase().includes(needle) || trackTitle(c.id, "ar").includes(needle))
        .map((l) => ({ course: c, lesson: l }))
    );
  }, [q, courses]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16">
      <PageHeader eyebrow={tx.learn.eyebrow} title={tx.learn.title} subtitle={tx.learn.subtitle}>
        <div className="relative mt-7 max-w-xl">
          <Search size={17} className="absolute start-4 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tx.learn.searchPlaceholder}
            className="w-full h-12 ps-11 pe-4 rounded-xl bg-surface border border-line focus:border-brand/60 outline-none text-fg placeholder:text-fg-faint transition-colors"
          />
        </div>
      </PageHeader>

      {matches ? (
        <section aria-live="polite" className="card divide-y divide-line">
          {matches.length === 0 && <p className="p-6 text-sm text-fg-muted">{tx.learn.noResults}</p>}
          {matches.map(({ course, lesson }) => (
            <Link
              key={`${course.id}/${lesson.id}`}
              href={`/learn/${course.id}/${lesson.id}/`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-fg/5 transition-colors"
            >
              <span className="text-xl" aria-hidden>{trackMeta(course.id)?.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-fg truncate">{lesson.title[lang]}</div>
                <div className="text-xs text-fg-subtle">{trackTitle(course.id, lang)} · {lesson.minutes} {tx.common.minutes}</div>
              </div>
              <PlayCircle size={18} className="text-emerald-400 shrink-0" />
            </Link>
          ))}
        </section>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              course={{ id: c.id, level: c.level, lessonCount: c.lessons.length, minutes: c.minutes }}
              done={completedCount(study, c.lessons.map((l) => `${c.id}/${l.id}`))}
            />
          ))}
        </div>
      )}
    </main>
  );
}
