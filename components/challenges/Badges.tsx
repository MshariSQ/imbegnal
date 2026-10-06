"use client";

import { Code2, Flag, Terminal, Droplet } from "lucide-react";
import type { ChallengeKind, Difficulty } from "@/shared/challenges";
import type { ChallengeStat } from "@/shared/api";
import { useLang } from "@/lib/lang-context";
import { difficultyLabel, trackTitle } from "@/lib/ctf/labels";
import { absoluteDate, relativeTime } from "@/lib/ctf/time";
import { fmt } from "@/lib/ctf/format";
import { useNow } from "@/lib/ctf/use-ctf";
import type { TrackInfo } from "@/lib/ctf/types";

// Difficulty is never conveyed by color alone: the label is always visible and
// the pips show the level (1-4 filled) as a second, non-color cue.
const DIFF_STYLE: Record<Difficulty, string> = {
  1: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  2: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  3: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  4: "text-red-400 border-red-500/30 bg-red-500/10",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const { tx } = useLang();
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${DIFF_STYLE[difficulty]}`}>
      <span aria-hidden className="flex items-end gap-px" dir="ltr">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className="w-[3px] rounded-sm bg-current" style={{ height: 4 + i * 2, opacity: i <= difficulty ? 1 : 0.25 }} />
        ))}
      </span>
      {difficultyLabel(tx, difficulty)}
    </span>
  );
}

const KIND_ICON = { flag: Flag, output: Terminal, code: Code2 } as const;

export function KindBadge({ kind }: { kind: ChallengeKind }) {
  const { tx } = useLang();
  const Icon = KIND_ICON[kind];
  return (
    <span
      title={tx.ctf.kindDesc[kind]}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs font-semibold text-fg-muted"
    >
      <Icon size={12} aria-hidden />
      {tx.ctf.kind[kind]}
    </span>
  );
}

export function TrackChip({ id, track }: { id: string; track?: TrackInfo }) {
  const { tx } = useLang();
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-semibold text-fg-muted">
      <span aria-hidden className="text-base leading-none">
        {track?.icon ?? "🏁"}
      </span>
      <span className="truncate">{trackTitle(tx, id, track?.title)}</span>
    </span>
  );
}

/**
 * First solver marker: droplet icon, solver name and a relative time. The
 * relative time needs the clock, which is unavailable while prerendering, so
 * the first paint shows the absolute UTC date and the relative text replaces
 * it right after hydration.
 */
export function FirstBlood({ firstBlood, className = "", wrap = false }: { firstBlood: NonNullable<ChallengeStat["firstBlood"]>; className?: string; wrap?: boolean }) {
  const { tx, lang } = useLang();
  const now = useNow();
  const when = now === null ? absoluteDate(firstBlood.at) : relativeTime(firstBlood.at, now, lang);
  // U+2068/U+2069 isolate the solver's name so an Arabic name inside English text (or the reverse) keeps its own direction.
  const text = fmt(tx.ctf.card.firstBloodBy, { name: `\u2068${firstBlood.name}\u2069`, when });
  return (
    <span title={text} className={`inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-red-400 ${className}`}>
      <Droplet size={13} aria-hidden className="shrink-0 fill-current" />
      <span className={wrap ? undefined : "truncate"}>{text}</span>
    </span>
  );
}
