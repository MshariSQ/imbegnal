"use client";

import Link from "next/link";
import { ArrowRight, Route } from "lucide-react";
import { pathsWithCourse } from "@/lib/career-paths";
import { useLang } from "@/lib/lang-context";
import { fmt } from "@/components/learn/PracticeLink";

/**
 * "Part of these career paths" for a course: a sidebar card on the course page (/learn/<track>/)
 * and a compact row of links in the course map header (/roadmaps/<track>/). Renders nothing for a
 * course that no path includes.
 */
export default function PathsForCourse({ trackId, variant = "card" }: { trackId: string; variant?: "card" | "inline" }) {
  const { tx, lang } = useLang();
  const T = tx.paths;
  const memberships = pathsWithCourse(trackId);
  if (memberships.length === 0) return null;

  if (variant === "inline") {
    return (
      <nav aria-label={T.partOf} className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-fg-subtle">{T.mapInPaths}</span>
        {memberships.map(({ path }) => (
          <Link
            key={path.id}
            href={`/roadmaps/${path.id}/`}
            className="inline-flex items-center gap-1 min-h-8 px-2.5 rounded-full bg-fg/5 border border-line text-fg-soft hover:text-fg hover:bg-fg/10 transition-colors"
          >
            <span aria-hidden>{path.icon}</span> {path.title[lang]}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <section aria-labelledby="course-paths" className="card p-6" data-testid="course-paths">
      <h2 id="course-paths" className="flex items-center gap-2 text-sm font-bold text-fg mb-4"><Route size={15} aria-hidden /> {T.partOf}</h2>
      <ul className="space-y-1">
        {memberships.map(({ path, position, total, level }) => (
          <li key={path.id}>
            <Link href={`/roadmaps/${path.id}/`} className="group flex items-start gap-3 rounded-lg px-2.5 py-2 -mx-2.5 hover:bg-fg/5 transition-colors">
              <span className="text-xl leading-none mt-0.5" aria-hidden>{path.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-fg group-hover:text-emerald-400 transition-colors">{path.title[lang]}</span>
                <span className="block text-xs text-fg-subtle mt-0.5">{fmt(T.position, { k: position, n: total, level: T.levels[level] })}</span>
              </span>
              <ArrowRight size={14} className="rtl-flip text-fg-faint group-hover:text-emerald-400 mt-1 shrink-0" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/roadmaps/" className="inline-flex items-center gap-1.5 min-h-10 mt-3 text-sm font-semibold text-emerald-400 hover:underline">
        {T.allPaths} <ArrowRight size={14} className="rtl-flip" aria-hidden />
      </Link>
    </section>
  );
}
