"use client";

import { useId, useState } from "react";
import { PATH_CATEGORIES, PATH_LEVELS, type PathCategory, type PathLevel } from "@/data/career-paths";
import type { PathSummary } from "@/lib/career-paths";
import { useLang } from "@/lib/lang-context";
import PageHeader from "@/components/ui/PageHeader";
import { fmt } from "@/components/learn/PracticeLink";
import { FilterChip } from "./PathBits";
import PathCard from "./PathCard";

/** /roadmaps/: every career path as a card, filtered by category and by the levels a path includes. */
export default function CareerPathsGrid({ paths }: { paths: PathSummary[] }) {
  const { tx } = useLang();
  const T = tx.paths;
  const [category, setCategory] = useState<PathCategory | "all">("all");
  const [level, setLevel] = useState<PathLevel | "all">("all");
  const catLabel = useId();
  const levelLabel = useId();

  const filtered = paths.filter((p) => (category === "all" || p.category === category) && (level === "all" || p.levels.includes(level)));
  const results = filtered.length === 1 ? T.resultsOne : fmt(T.results, { n: filtered.length });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16">
      <PageHeader eyebrow={T.eyebrow} title={T.title} subtitle={T.subtitle} />

      <div role="group" aria-label={T.filtersLabel} className="space-y-3 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span id={catLabel} className="text-xs font-bold uppercase tracking-widest text-fg-subtle sm:w-44 shrink-0">{T.categoryLabel}</span>
          <div role="group" aria-labelledby={catLabel} className="flex flex-wrap gap-2">
            <FilterChip pressed={category === "all"} onClick={() => setCategory("all")}>{T.allCategories}</FilterChip>
            {PATH_CATEGORIES.map((c) => (
              <FilterChip key={c} pressed={category === c} onClick={() => setCategory(c)}>{T.categories[c]}</FilterChip>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span id={levelLabel} className="text-xs font-bold uppercase tracking-widest text-fg-subtle sm:w-44 shrink-0">{T.levelLabel}</span>
          <div role="group" aria-labelledby={levelLabel} className="flex flex-wrap gap-2">
            <FilterChip pressed={level === "all"} onClick={() => setLevel("all")}>{T.allLevels}</FilterChip>
            {PATH_LEVELS.map((lv) => (
              <FilterChip key={lv} pressed={level === lv} onClick={() => setLevel(lv)}>{T.levels[lv]}</FilterChip>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-fg-subtle mb-5" aria-live="polite" data-testid="path-results">{results}</p>

      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-fg-muted mb-4">{T.noResults}</p>
          <button
            type="button"
            onClick={() => { setCategory("all"); setLevel("all"); }}
            className="min-h-10 px-4 rounded-lg border border-line-strong text-sm font-semibold text-fg hover:bg-fg/5"
          >
            {T.clearFilters}
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <PathCard key={p.id} path={p} />)}
        </div>
      )}
    </main>
  );
}
