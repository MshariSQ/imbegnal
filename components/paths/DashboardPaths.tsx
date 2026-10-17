"use client";

import Link from "next/link";
import { ArrowRight, Route } from "lucide-react";
import { pathProgress, resolvePaths, type CourseFiguresMap } from "@/lib/career-paths";
import { useLang } from "@/lib/lang-context";
import { useStudy } from "@/lib/study-store";
import ProgressBar from "@/components/ui/ProgressBar";

/** Dashboard card: the career paths the learner has progress in (most advanced first), or a way in. */
export default function DashboardPaths({ courses }: { courses: { id: string; lessons: { id: string; minutes: number }[] }[] }) {
  const { tx, lang } = useLang();
  const T = tx.paths;
  const study = useStudy();
  const figures: CourseFiguresMap = Object.fromEntries(
    courses.map((c) => [c.id, { lessonIds: c.lessons.map((l) => l.id), minutes: c.lessons.reduce((n, l) => n + l.minutes, 0) }])
  );
  const started = resolvePaths(figures)
    .map((path) => ({ path, progress: pathProgress(path, study.lessons) }))
    .filter((x) => x.progress.done > 0)
    .sort((a, b) => b.progress.ratio - a.progress.ratio)
    .slice(0, 3);

  return (
    <section aria-labelledby="dash-paths" className="card p-5">
      <h2 id="dash-paths" className="flex items-center gap-2 text-sm font-bold text-fg mb-3"><Route size={15} className="text-emerald-400" aria-hidden /> {T.dashTitle}</h2>
      {started.length === 0 ? (
        <p className="text-sm text-fg-subtle mb-2">{T.dashEmpty}</p>
      ) : (
        <ul className="space-y-1 mb-2">
          {started.map(({ path, progress }) => (
            <li key={path.id}>
              <Link href={`/roadmaps/${path.id}/`} className="block rounded-lg px-2.5 py-2 -mx-2.5 hover:bg-fg/5">
                <span className="flex items-center gap-2 text-xs font-semibold text-fg-soft">
                  <span aria-hidden>{path.icon}</span>
                  <span className="truncate flex-1">{path.title[lang]}</span>
                  <span className="text-emerald-400" dir="ltr">{Math.round(progress.ratio * 100)}%</span>
                </span>
                <ProgressBar value={progress.ratio} className="mt-1.5" label={`${T.progressLabel}: ${path.title[lang]}`} />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href="/roadmaps/" className="inline-flex items-center gap-1.5 min-h-10 text-sm font-semibold text-emerald-400 hover:underline">
        {T.dashExplore} <ArrowRight size={14} className="rtl-flip" aria-hidden />
      </Link>
    </section>
  );
}
