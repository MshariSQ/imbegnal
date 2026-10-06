"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ChevronLeft, Droplet, Medal, RefreshCw, Trophy } from "lucide-react";
import type { LeaderboardEntry, LeaderboardResponse } from "@/shared/api";
import { challengesHref } from "@/shared/links";
import Avatar from "@/components/ui/Avatar";
import PageHeader from "@/components/ui/PageHeader";
import { getCurrentUser, getToken, useAuthUser } from "@/lib/auth";
import { useLang } from "@/lib/lang-context";
import { fetchLeaderboard } from "@/lib/ctf/api";
import { loginHref } from "@/lib/ctf/errors";
import { plural } from "@/lib/ctf/format";
import { trackTitle } from "@/lib/ctf/labels";
import { formatNumber, relativeTime, absoluteDate } from "@/lib/ctf/time";
import type { TrackInfo } from "@/lib/ctf/types";
import { useNow } from "@/lib/ctf/use-ctf";

type Period = "all" | "week";

type Load = { key: string; status: "loading" } | { key: string; status: "ok"; data: LeaderboardResponse } | { key: string; status: "error" };

/** Which row is the signed-in learner? The Worker's `me` entry is authoritative; the username is a fallback. */
function isMe(e: LeaderboardEntry, me: LeaderboardEntry | undefined, username?: string): boolean {
  if (me && e.rank === me.rank && e.name === me.name && e.username === me.username) return true;
  return !!username && !!e.username && e.username === username;
}

const GRID = "grid grid-cols-[3rem_minmax(0,1fr)_auto] gap-x-3 sm:grid-cols-[4rem_minmax(0,1fr)_6rem_5rem_6rem_9rem] sm:items-center";

function Row({ entry, me, now }: { entry: LeaderboardEntry; me: boolean; now: number | null }) {
  const { tx, lang } = useLang();
  const t = tx.ctf.leaderboardPage;
  const top = entry.rank >= 1 && entry.rank <= 3;
  const place = top ? t.place[entry.rank] : undefined;
  const last = entry.lastSolveAt ? (now === null ? absoluteDate(entry.lastSolveAt) : relativeTime(entry.lastSolveAt, now, lang)) : "—";
  // Podium rows get a medal icon and the spelled-out place for assistive tech: color alone never carries rank.
  const podium = top ? ["border-amber-400/50 bg-amber-400/10", "border-slate-400/50 bg-slate-400/10", "border-orange-500/50 bg-orange-500/10"][entry.rank - 1] : "border-line bg-surface";
  return (
    <li
      role="row"
      aria-current={me ? "true" : undefined}
      data-me={me ? "true" : undefined}
      data-rank={entry.rank}
      className={`${GRID} rounded-xl border px-3 py-3 ${podium} ${me ? "outline outline-2 -outline-offset-2 outline-brand" : ""}`}
    >
      <span role="cell" className="flex items-center gap-1.5 self-center text-base font-black text-fg" dir="ltr">
        {top && <Medal size={16} aria-hidden />}
        <span aria-hidden={top}>{entry.rank}</span>
        {place ? <span className="sr-only">{place}</span> : null}
      </span>
      <span role="cell" className="flex min-w-0 items-center gap-3">
        <Avatar src={entry.avatar} name={entry.name} size={32} />
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-fg">{entry.name}</span>
            {me && <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-brand-fg">{t.you}</span>}
          </span>
          {entry.username && (
            <span className="block truncate text-xs text-fg-subtle" dir="ltr">
              @{entry.username}
            </span>
          )}
        </span>
      </span>
      <span role="cell" className="self-center text-end text-base font-black text-fg sm:text-start" dir="ltr">
        <span className="sr-only">{t.points}: </span>
        {formatNumber(entry.points)}
      </span>
      {/* Mobile: the secondary facts share one wrapped line under the name; desktop: one column each. */}
      <span role="presentation" className="col-start-2 col-end-4 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-fg-muted sm:contents">
        <span role="cell" className="sm:text-sm">
          <span className="font-semibold sm:hidden">{t.solves}: </span>
          <span dir="ltr">{formatNumber(entry.solves)}</span>
        </span>
        <span role="cell" className="inline-flex items-center gap-1 sm:text-sm">
          <Droplet size={12} aria-hidden className="text-red-400 sm:hidden" />
          <span className="font-semibold sm:hidden">{t.firstBloods}: </span>
          <span dir="ltr">{formatNumber(entry.firstBloods)}</span>
        </span>
        <span role="cell" className="text-fg-subtle">
          <span className="font-semibold sm:hidden">{t.lastSolve}: </span>
          {last}
        </span>
      </span>
    </li>
  );
}

export default function Leaderboard({ tracks }: { tracks: TrackInfo[] }) {
  const { tx, lang } = useLang();
  const t = tx.ctf.leaderboardPage;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const user = useAuthUser();
  const now = useNow();
  const tabsId = useId();

  const validTracks = useMemo(() => new Set(tracks.map((x) => x.id)), [tracks]);
  const trackParam = params.get("track") ?? "all";
  const track = trackParam !== "all" && validTracks.has(trackParam) ? trackParam : "all";
  const period: Period = params.get("period") === "week" ? "week" : "all";
  const viewer = user?.sub ?? "anon";
  const key = `${viewer}|${track}|${period}`;

  const [load, setLoad] = useState<Load>({ key: "", status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ctl = new AbortController();
    fetchLeaderboard({ track, period }, getCurrentUser() ? getToken() : null, ctl.signal)
      .then((data) => setLoad({ key, status: "ok", data }))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setLoad({ key, status: "error" });
      });
    return () => ctl.abort();
  }, [key, track, period, attempt]);

  const setView = useCallback(
    (patch: { track?: string; period?: Period }) => {
      const q = new URLSearchParams();
      const nextTrack = patch.track ?? track;
      const nextPeriod = patch.period ?? period;
      if (nextTrack !== "all") q.set("track", nextTrack);
      if (nextPeriod !== "all") q.set("period", nextPeriod);
      const s = q.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [router, pathname, track, period]
  );

  // Data for another view/viewer counts as loading: never show last tab's numbers under this tab's label.
  const current = load.key === key ? load : { key, status: "loading" as const };
  const data = current.status === "ok" ? current.data : undefined;
  const entries = data?.entries ?? [];
  const me = data?.me;
  const meInList = entries.some((e) => isMe(e, me, user?.username));

  // Tabs: roving tabindex + arrow keys, per the WAI-ARIA tabs pattern.
  const tabRefs = useRef<Record<Period, HTMLButtonElement | null>>({ all: null, week: null });
  const periods: Period[] = ["all", "week"];
  function onTabKey(e: React.KeyboardEvent) {
    const i = periods.indexOf(period);
    const rtl = lang === "ar";
    let n = i;
    if (e.key === "ArrowRight") n = rtl ? i - 1 : i + 1;
    else if (e.key === "ArrowLeft") n = rtl ? i + 1 : i - 1;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = periods.length - 1;
    else return;
    e.preventDefault();
    const next = periods[(n + periods.length) % periods.length];
    setView({ period: next });
    tabRefs.current[next]?.focus();
  }

  const label: Record<Period, string> = { all: t.allTime, week: t.week };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6">
      <nav aria-label={tx.ctf.allChallenges} className="mb-5">
        <Link href={challengesHref()} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-fg-muted hover:text-fg">
          <ChevronLeft size={16} aria-hidden className="rtl-flip" />
          {tx.ctf.allChallenges}
        </Link>
      </nav>
      <PageHeader eyebrow={tx.ctf.eyebrow} title={t.title} subtitle={t.subtitle} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div role="tablist" aria-label={t.periods} onKeyDown={onTabKey} className="inline-flex rounded-xl border border-line bg-surface p-1">
          {periods.map((p) => (
            <button
              key={p}
              ref={(el) => {
                tabRefs.current[p] = el;
              }}
              role="tab"
              id={`${tabsId}-${p}`}
              type="button"
              aria-selected={period === p}
              aria-controls={`${tabsId}-panel`}
              tabIndex={period === p ? 0 : -1}
              onClick={() => setView({ period: p })}
              className={`min-h-10 flex-1 rounded-lg px-5 text-sm font-semibold transition-colors sm:flex-none ${period === p ? "bg-brand text-brand-fg" : "text-fg-muted hover:text-fg"}`}
            >
              {label[p]}
            </button>
          ))}
        </div>
        <div className="sm:w-64">
          <label htmlFor={`${tabsId}-track`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            {t.track}
          </label>
          <select
            id={`${tabsId}-track`}
            value={track}
            onChange={(e) => setView({ track: e.target.value })}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-fg outline-none focus:border-brand/60 focus-visible:outline-2 focus-visible:outline-brand"
          >
            <option value="all">{t.allTracks}</option>
            {tracks.map((tr) => (
              <option key={tr.id} value={tr.id}>
                {tr.icon} {trackTitle(tx, tr.id, tr.title)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${period}`} aria-busy={current.status === "loading"}>
        <p role="status" aria-live="polite" className="mb-3 flex items-center gap-2 text-sm font-medium text-fg-muted">
          <Trophy size={15} aria-hidden className="text-fg-subtle" />
          {current.status === "loading" && t.loading}
          {current.status === "ok" && plural(t.playersCount, entries.length, lang, { n: formatNumber(entries.length) })}
        </p>

        {current.status === "loading" && (
          <div aria-hidden className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl border border-line bg-surface" />
            ))}
          </div>
        )}

        {current.status === "error" && (
          <div role="alert" className="card mx-auto max-w-xl p-8 text-center">
            <AlertTriangle size={28} aria-hidden className="mx-auto mb-3 text-amber-400" />
            <h2 className="mb-1 text-lg font-bold text-fg">{t.errorTitle}</h2>
            <p className="mb-5 text-sm text-fg-muted">{t.errorBody}</p>
            <button type="button" onClick={() => setAttempt((a) => a + 1)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line px-4 text-sm font-semibold text-fg hover:border-line-strong">
              <RefreshCw size={14} aria-hidden />
              {t.retry}
            </button>
          </div>
        )}

        {current.status === "ok" && entries.length === 0 && (
          <div className="card mx-auto max-w-xl p-8 text-center">
            <Trophy size={28} aria-hidden className="mx-auto mb-3 text-fg-subtle" />
            <h2 className="mb-1 text-lg font-bold text-fg">{t.emptyTitle}</h2>
            <p className="mb-5 text-sm text-fg-muted">{t.emptyBody}</p>
            <Link href={challengesHref(track === "all" ? undefined : track)} className="inline-flex min-h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-brand-fg hover:bg-brand-strong">
              {tx.ctf.allChallenges}
            </Link>
          </div>
        )}

        {current.status === "ok" && entries.length > 0 && (
          <div role="table" aria-label={t.table} className="space-y-2">
            <div role="rowgroup" className="hidden sm:block">
              <div role="row" className={`${GRID} px-3 text-xs font-semibold uppercase tracking-wider text-fg-subtle`}>
                <span role="columnheader" dir="ltr">{t.rank}</span>
                <span role="columnheader">{t.player}</span>
                <span role="columnheader">{t.points}</span>
                <span role="columnheader">{t.solves}</span>
                <span role="columnheader">{t.firstBloods}</span>
                <span role="columnheader">{t.lastSolve}</span>
              </div>
            </div>
            <ol role="rowgroup" className="space-y-2">
              {entries.map((e) => (
                <Row key={`${e.rank}-${e.username ?? e.name}`} entry={e} me={isMe(e, me, user?.username)} now={now} />
              ))}
            </ol>
            {me && !meInList && (
              <div role="rowgroup" className="pt-1" data-testid="lb-me-pinned">
                <p className="mb-2 mt-3 text-center text-xs font-semibold uppercase tracking-wider text-fg-subtle" aria-hidden>
                  ⋯
                </p>
                <ol className="space-y-2" aria-label={t.yourPosition}>
                  <Row entry={me} me now={now} />
                </ol>
              </div>
            )}
          </div>
        )}

        {current.status === "ok" && !user && (
          <p className="mt-6 text-center text-sm text-fg-muted">
            <Link href={loginHref(pathname || "/challenges/leaderboard/")} className="font-semibold text-emerald-400 hover:underline">
              {t.signInToRank}
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
