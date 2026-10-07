"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Flag, Medal, RefreshCw, Terminal, Trophy } from "lucide-react";
import { codeLabHref, leaderboardHref } from "@/shared/links";
import PageHeader from "@/components/ui/PageHeader";
import { useAuthUser } from "@/lib/auth";
import { useLang } from "@/lib/lang-context";
import { filterItems, filtersToQuery, hasActiveFilters, parseFilters, sortItems, type CtfFilters } from "@/lib/ctf/filters";
import { plural } from "@/lib/ctf/format";
import { trackTitle } from "@/lib/ctf/labels";
import { loginHref } from "@/lib/ctf/errors";
import { solvesOf } from "@/lib/ctf/stats";
import { formatNumber } from "@/lib/ctf/time";
import type { ChallengeListItem, TrackInfo } from "@/lib/ctf/types";
import { useChallengeStats } from "@/lib/ctf/use-ctf";
import ChallengeCard from "./ChallengeCard";
import ChallengeFilters from "./ChallengeFilters";

const SEARCH_DEBOUNCE_MS = 250;

/** Prerendered shell: the real header text (so the static HTML has the h1) above placeholder cards. */
export function ChallengeListFallback() {
  const { tx } = useLang();
  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6">
      <PageHeader eyebrow={tx.ctf.eyebrow} title={tx.ctf.title} subtitle={tx.ctf.subtitle} />
      <ChallengeListSkeleton />
    </main>
  );
}

function ChallengeListSkeleton() {
  return (
    <div aria-hidden className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="card h-56 animate-pulse p-5">
          <div className="mb-4 h-4 w-1/3 rounded bg-line" />
          <div className="mb-3 h-5 w-3/4 rounded bg-line" />
          <div className="mb-2 h-3 w-full rounded bg-line" />
          <div className="mb-6 h-3 w-5/6 rounded bg-line" />
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded-full bg-line" />
            <div className="h-6 w-14 rounded-full bg-line" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Points / rank / solved for the signed-in learner, or the sign-in nudge for guests. */
function MeSummary({ me, solvedCount, status, signedIn }: { me?: { points: number; solved: number; rank?: number }; solvedCount: number; status: string; signedIn: boolean }) {
  const { tx } = useLang();
  const t = tx.ctf.me;
  const pathname = usePathname();
  if (!signedIn) {
    return (
      <div className="mt-7 flex max-w-xl flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3">
        <p className="min-w-0 flex-1 text-sm text-fg-muted">{t.signedOut}</p>
        <Link href={loginHref(pathname || "/challenges/")} className="inline-flex min-h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-brand-fg hover:bg-brand-strong">
          {t.signIn}
        </Link>
      </div>
    );
  }
  const loading = status === "loading" && !me;
  const cells: { label: string; value: string }[] = [
    { label: t.points, value: me ? formatNumber(me.points) : "—" },
    { label: t.rank, value: me?.rank ? `#${formatNumber(me.rank)}` : me ? t.unranked : "—" },
    { label: t.solved, value: formatNumber(me?.solved ?? solvedCount) },
  ];
  return (
    <dl className="mt-7 grid max-w-xl grid-cols-3 gap-3" aria-busy={loading}>
      {cells.map((c) => (
        <div key={c.label} className="card px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">{c.label}</dt>
          <dd className="mt-1 text-xl font-black text-fg" dir="ltr">
            {loading ? <span aria-hidden className="inline-block h-6 w-12 animate-pulse rounded bg-line" /> : c.value}
            {loading && <span className="sr-only">…</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function ChallengeList({ items, tracks }: { items: ChallengeListItem[]; tracks: TrackInfo[] }) {
  const { tx, lang } = useLang();
  const t = tx.ctf;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const user = useAuthUser();
  const stats = useChallengeStats();

  const validTracks = useMemo(() => new Set(tracks.map((x) => x.id)), [tracks]);
  const trackById = useMemo(() => new Map(tracks.map((x) => [x.id, x])), [tracks]);
  const filters = useMemo(() => parseFilters(params, validTracks), [params, validTracks]);
  const urlQ = filters.q;

  // The search box keeps a local draft so typing is instant; the URL follows after a short pause.
  // Back/forward navigation changes the URL and must win, so adopt it when it differs from what we last wrote.
  const [draft, setDraft] = useState(urlQ);
  const [seenUrlQ, setSeenUrlQ] = useState(urlQ);
  if (seenUrlQ !== urlQ) {
    setSeenUrlQ(urlQ);
    setDraft(urlQ);
  }
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const replaceUrl = useCallback(
    (next: CtfFilters) => {
      const qs = filtersToQuery(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  const onChange = useCallback(
    (patch: Partial<CtfFilters>) => {
      clearTimeout(timer.current);
      replaceUrl({ ...filters, q: draft, ...patch });
    },
    [filters, draft, replaceUrl]
  );

  const onSearch = useCallback(
    (q: string) => {
      setDraft(q);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => replaceUrl({ ...filters, q }), SEARCH_DEBOUNCE_MS);
    },
    [filters, replaceUrl]
  );

  const onClear = useCallback(() => {
    clearTimeout(timer.current);
    setDraft("");
    replaceUrl({ ...filters, track: "all", difficulty: 0, status: "all", kind: "all", q: "" });
  }, [filters, replaceUrl]);

  const effective = useMemo(() => ({ ...filters, q: draft }), [filters, draft]);
  const visible = useMemo(() => {
    const filtered = filterItems(items, effective, {
      lang,
      solved: stats.solved,
      trackTitle: (id) => trackTitle(tx, id, trackById.get(id)?.title),
    });
    return sortItems(filtered, filters.sort, (id) => solvesOf(stats.index, id));
  }, [items, effective, filters.sort, lang, stats.solved, stats.index, tx, trackById]);

  const hasActive = hasActiveFilters(effective);
  const activeCount = [effective.track !== "all", effective.difficulty !== 0, effective.status !== "all", effective.kind !== "all", effective.q.trim() !== ""].filter(Boolean).length;
  const statsLoading = stats.status === "loading";

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6">
      <PageHeader eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle}>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={codeLabHref({ kind: "blank" })}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-strong"
          >
            <Terminal size={16} aria-hidden />
            {t.practice}
          </Link>
          <Link
            href={leaderboardHref()}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-5 text-sm font-semibold text-fg transition-colors hover:border-line-strong"
          >
            <Trophy size={16} aria-hidden />
            {t.leaderboard}
          </Link>
        </div>
        <MeSummary me={stats.me} solvedCount={stats.solved.size} status={stats.status} signedIn={!!user} />
      </PageHeader>

      {items.length === 0 ? (
        <div className="card mx-auto max-w-xl p-10 text-center">
          <Flag size={32} aria-hidden className="mx-auto mb-4 text-fg-subtle" />
          <h2 className="mb-2 text-xl font-bold text-fg">{t.empty.noneTitle}</h2>
          <p className="mb-6 text-sm text-fg-muted">{t.empty.noneBody}</p>
          <Link href={codeLabHref({ kind: "blank" })} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-fg hover:bg-brand-strong">
            <Terminal size={16} aria-hidden />
            {t.practice}
          </Link>
        </div>
      ) : (
        <>
          <ChallengeFilters
            filters={filters}
            tracks={tracks}
            search={draft}
            onSearch={onSearch}
            onChange={onChange}
            onClear={onClear}
            hasActive={hasActive}
            activeCount={activeCount}
          />

          {stats.status === "error" && (
            <div role="status" className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-fg-soft">
              <AlertTriangle size={16} aria-hidden className="shrink-0 text-amber-400" />
              <span className="min-w-0 flex-1">{t.stats.unavailable}</span>
              <button type="button" onClick={stats.reload} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 font-semibold text-emerald-400 hover:underline">
                <RefreshCw size={14} aria-hidden />
                {t.stats.retry}
              </button>
            </div>
          )}

          <p aria-live="polite" role="status" className="mb-4 flex items-center gap-2 text-sm font-medium text-fg-muted" data-testid="ctf-count">
            <Medal size={15} aria-hidden className="text-fg-subtle" />
            {plural(t.results, visible.length, lang, { n: formatNumber(visible.length) })}
          </p>

          {visible.length === 0 ? (
            <div className="card mx-auto max-w-xl p-10 text-center">
              <h2 className="mb-2 text-lg font-bold text-fg">{t.empty.title}</h2>
              <p className="mb-5 text-sm text-fg-muted">{t.empty.body}</p>
              <button type="button" onClick={onClear} className="inline-flex min-h-10 items-center rounded-lg border border-line px-4 text-sm font-semibold text-fg hover:border-line-strong">
                {t.filters.clear}
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="ctf-grid">
              {visible.map((c) => (
                <li key={c.id}>
                  <ChallengeCard item={c} track={trackById.get(c.track)} stat={stats.index.get(c.id)} solved={stats.solved.has(c.id)} statsLoading={statsLoading && !stats.index.has(c.id)} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
