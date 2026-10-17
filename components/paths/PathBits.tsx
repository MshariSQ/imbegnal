"use client";

import type { PathLevel } from "@/data/career-paths";
import type { Tx } from "@/lib/i18n";
import { fmt } from "@/components/learn/PracticeLink";

/** Level colors, as on the course cards elsewhere (light theme remaps the -400 text shades for contrast). */
export const LEVEL_CLASS: Record<PathLevel, string> = {
  beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  intermediate: "text-blue-400 bg-blue-500/10 border-blue-500/25",
  advanced: "text-orange-400 bg-orange-500/10 border-orange-500/25",
};

export function LevelBadge({ level, tx }: { level: PathLevel; tx: Tx }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${LEVEL_CLASS[level]}`}>
      {tx.paths.levels[level]}
    </span>
  );
}

/** "Beginner to Advanced", or one level when the path stays at one level. */
export function levelRange(tx: Tx, levels: readonly PathLevel[]): string {
  if (levels.length === 0) return "";
  const from = tx.paths.levels[levels[0]];
  const to = tx.paths.levels[levels[levels.length - 1]];
  return from === to ? from : fmt(tx.paths.levelRange, { from, to });
}

export function coursesCount(tx: Tx, n: number): string {
  return n === 1 ? tx.paths.coursesCountOne : fmt(tx.paths.coursesCount, { n });
}

/** Chip used by every filter row: a real toggle button with a 40px tap target. */
export function FilterChip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`min-h-10 px-3.5 text-sm rounded-lg border transition-colors ${
        pressed ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-semibold" : "border-line text-fg-muted hover:text-fg hover:border-line-strong"
      }`}
    >
      {children}
    </button>
  );
}
