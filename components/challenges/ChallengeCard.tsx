"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Users } from "lucide-react";
import type { ChallengeStat } from "@/shared/api";
import { challengeHref } from "@/shared/links";
import { useLang } from "@/lib/lang-context";
import { fmt, plural } from "@/lib/ctf/format";
import { topicLabel } from "@/lib/ctf/labels";
import { formatDuration, formatNumber } from "@/lib/ctf/time";
import type { ChallengeListItem, TrackInfo } from "@/lib/ctf/types";
import { DifficultyBadge, FirstBlood, KindBadge, TrackChip } from "./Badges";

/**
 * One challenge in the list. The whole card is a single link (one focus stop,
 * like CourseCard); its accessible name is the title and the summary + facts
 * are exposed as its description.
 */
export default function ChallengeCard({
  item,
  track,
  stat,
  solved,
  statsLoading,
}: {
  item: ChallengeListItem;
  track?: TrackInfo;
  stat?: ChallengeStat;
  solved: boolean;
  statsLoading: boolean;
}) {
  const { tx, lang } = useLang();
  const t = tx.ctf;
  const titleId = `ch-${item.id}-title`;
  const descId = `ch-${item.id}-desc`;
  const earned = stat?.mine?.solved ? stat.mine.points : undefined;
  const solves = stat?.solves ?? 0;

  return (
    <Link
      href={challengeHref(item.id)}
      aria-labelledby={titleId}
      aria-describedby={descId}
      className={`group card card-hover relative flex h-full flex-col overflow-hidden p-5 ${solved ? "border-emerald-500/40" : ""}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -end-16 h-36 w-36 rounded-full opacity-15 blur-3xl transition-opacity group-hover:opacity-30"
        style={{ background: track?.accent ?? "var(--brand)" }}
      />

      <div className="mb-3 flex items-center justify-between gap-3">
        <TrackChip id={item.track} track={track} />
        <span className="shrink-0 text-sm font-extrabold text-fg" dir="ltr">
          {fmt(t.card.points, { n: formatNumber(item.points) })}
        </span>
      </div>

      <h3 id={titleId} className="mb-1.5 text-lg font-bold leading-snug text-fg">
        {item.title[lang]}
      </h3>

      <div id={descId} className="flex flex-1 flex-col">
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-fg-muted">{item.summary[lang]}</p>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={item.difficulty} />
          <KindBadge kind={item.kind} />
          <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-fg-subtle">{topicLabel(tx, item.topic)}</span>
        </div>

        <div className="mt-auto space-y-2.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-subtle">
            <span className="inline-flex items-center gap-1.5" title={t.card.est}>
              <Clock size={13} aria-hidden />
              <span>
                <span className="sr-only">{t.card.est}: </span>
                {formatDuration(item.estMinutes, t.units)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={13} aria-hidden />
              {statsLoading ? (
                <span aria-hidden className="inline-block h-3 w-14 animate-pulse rounded bg-line" />
              ) : stat ? (
                plural(t.card.solves, solves, lang, { n: formatNumber(solves) })
              ) : (
                <span>—</span>
              )}
            </span>
          </div>

          {stat?.firstBlood ? <FirstBlood firstBlood={stat.firstBlood} className="max-w-full" /> : null}

          {solved && (
            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
              <CheckCircle2 size={16} aria-hidden />
              <span>{t.card.solved}</span>
              {earned !== undefined && (
                <span className="text-xs font-bold" dir="ltr">
                  {fmt(t.card.earned, { n: formatNumber(earned) })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
