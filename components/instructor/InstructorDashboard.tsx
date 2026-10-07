"use client";

/**
 * /instructor/: aggregated learning analytics for instructors and admins (GET /api/instructor/analytics).
 * Not linked from the navbar; instructors get the URL. The Worker enforces the role (401 / 403); the page only
 * explains the outcome. Everything that depends on the token, the network or the clock appears after mount.
 */
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2, LogIn, RefreshCw, ShieldAlert } from "lucide-react";
import type { InstructorAnalytics } from "../../shared/api";
import type { L10nText } from "../../shared/challenges";
import { getLanguage } from "../../shared/languages";
import PageHeader from "@/components/ui/PageHeader";
import { getToken, useAuthUser } from "@/lib/auth";
import { intlLocale, formatDuration as formatMs } from "@/lib/codelab/format";
import { classifyFailure, loginHref } from "@/lib/ctf/errors";
import { plural } from "@/lib/ctf/format";
import { formatDuration as formatMinutes } from "@/lib/ctf/time";
import { useLang } from "@/lib/lang-context";
import { fetchInstructorAnalytics } from "@/lib/instructor/api";
import { DEFAULT_PERIOD, PERIODS, barRows, formatCount, formatPercent, humanizeKey, successRate, totalChallengeSolves, totalCompletions, type Period } from "@/lib/instructor/analytics";
import BarList from "./BarList";
import { ChallengesTable, ExercisesTable, TracksTable, type Fmt } from "./Tables";

const BTN = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

type Load =
  | { key: string; status: "loading" }
  | { key: string; status: "ok"; data: InstructorAnalytics }
  | { key: string; status: "unauthorized" | "forbidden" | "suspended" | "error" };

const noopSubscribe = () => () => {};
/** False on the server and during hydration, true afterwards: the "is the browser state readable yet" switch. */
function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

interface Props {
  /** roadmap id -> English title (canonical data/roadmaps.ts); localized titles win, this is the fallback. */
  trackTitles: Record<string, string>;
  /** challenge id -> localized title, from the public challenge registry (may be empty). */
  challengeTitles: Record<string, L10nText>;
}

export default function InstructorDashboard({ trackTitles, challengeTitles }: Props) {
  const { tx, lang } = useLang();
  const t = tx.instructor;
  const user = useAuthUser();
  const hydrated = useHydrated();
  const [days, setDays] = useState<Period>(DEFAULT_PERIOD);
  const [attempt, setAttempt] = useState(0);
  const viewer = user?.sub ?? "";
  const key = `${viewer}|${days}|${attempt}`;
  const [load, setLoad] = useState<Load>({ key: "", status: "loading" });

  useEffect(() => {
    const token = viewer ? getToken() : null;
    if (!token) return;
    const ctl = new AbortController();
    fetchInstructorAnalytics(days, token, ctl.signal)
      .then((data) => setLoad({ key, status: "ok", data }))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        const kind = classifyFailure(e).kind;
        setLoad({ key, status: kind === "signin" ? "unauthorized" : kind === "forbidden" ? "forbidden" : kind === "suspended" ? "suspended" : "error" });
      });
    return () => ctl.abort();
  }, [key, viewer, days]);

  const fmt: Fmt = useMemo(
    () => ({
      count: (n) => formatCount(n, lang),
      percent: (r) => formatPercent(r, lang),
      ms: (n) => formatMs(n, t.units),
      minutes: (n) => (n === undefined ? "—" : formatMinutes(n, t.units)),
    }),
    [lang, t.units]
  );

  // Data for another viewer/period/attempt counts as loading: never show last period's numbers under this label.
  const current: Load = load.key === key ? load : { key, status: "loading" };
  const signedOut = hydrated && !user;
  const known = hydrated && !!user;
  const blocked = known && (current.status === "forbidden" || current.status === "suspended" || current.status === "unauthorized");

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6">
      <PageHeader eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />

      {signedOut && <Notice icon="login" title={t.signIn.title} body={t.signIn.body} action={<SignInLink label={t.signIn.cta} />} testId="instructor-signin" />}

      {known && current.status === "unauthorized" && <Notice icon="login" title={t.signIn.title} body={t.signIn.expired} action={<SignInLink label={t.signIn.cta} />} testId="instructor-expired" />}
      {known && current.status === "forbidden" && <Notice icon="lock" title={t.forbidden.title} body={t.forbidden.body} testId="instructor-forbidden" />}
      {known && current.status === "suspended" && <Notice icon="lock" title={t.suspended.title} body={t.suspended.body} testId="instructor-suspended" />}

      {(!hydrated || (known && !blocked)) && (
        <>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label={t.period} className="inline-flex self-start rounded-xl border border-line bg-surface p-1" data-testid="period">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={days === p}
                  disabled={!hydrated}
                  onClick={() => setDays(p)}
                  className={`min-h-10 min-w-20 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${days === p ? "bg-brand text-brand-fg" : "text-fg-muted hover:text-fg"}`}
                >
                  {plural(t.days, p, lang, { n: formatCount(p, lang) })}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p role="status" className="text-sm text-fg-muted" data-testid="updated">
                {current.status === "loading" && hydrated && (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" aria-hidden />
                    {t.loading}
                  </span>
                )}
                {current.status === "ok" && <Updated iso={current.data.generatedAt} />}
              </p>
              <button
                type="button"
                onClick={() => setAttempt((a) => a + 1)}
                disabled={!known || current.status === "loading"}
                className={`${BTN} border border-line text-fg-soft hover:bg-fg/5 hover:text-fg disabled:opacity-50`}
              >
                <RefreshCw size={14} aria-hidden />
                {t.refresh}
              </button>
            </div>
          </div>

          {(!hydrated || current.status === "loading") && <Skeleton />}

          {current.status === "error" && (
            <Notice icon="alert" title={t.error.title} body={t.error.body} testId="instructor-error" action={
              <button type="button" onClick={() => setAttempt((a) => a + 1)} className={`${BTN} border border-line-strong text-fg hover:bg-fg/5`}>
                <RefreshCw size={14} aria-hidden />
                {t.error.retry}
              </button>
            } />
          )}

          {current.status === "ok" && <Report data={current.data} fmt={fmt} trackTitles={trackTitles} challengeTitles={challengeTitles} />}
        </>
      )}
    </main>
  );
}

function SignInLink({ label }: { label: string }) {
  return (
    <Link href={loginHref("/instructor/")} className={`${BTN} bg-brand text-brand-fg hover:bg-brand-strong`}>
      <LogIn size={15} aria-hidden />
      {label}
    </Link>
  );
}

function Notice({ icon, title, body, action, testId }: { icon: "login" | "lock" | "alert"; title: string; body: string; action?: React.ReactNode; testId: string }) {
  const Icon = icon === "login" ? LogIn : icon === "lock" ? ShieldAlert : AlertTriangle;
  return (
    <div role={icon === "alert" ? "alert" : "status"} className="card mx-auto max-w-xl p-8 text-center" data-testid={testId}>
      <Icon size={28} aria-hidden className="mx-auto mb-3 text-amber-400" />
      <h2 className="mb-1 text-lg font-bold text-fg">{title}</h2>
      <p className="text-sm leading-relaxed text-fg-muted">{body}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

function Skeleton() {
  return (
    <div aria-hidden className="space-y-4" data-testid="instructor-skeleton">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-line bg-surface" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-56 animate-pulse rounded-2xl border border-line bg-surface" />
        <div className="h-56 animate-pulse rounded-2xl border border-line bg-surface" />
      </div>
    </div>
  );
}

/** "Updated Jun 15, 2026, 10:00 AM": formatted only once data exists (after mount), in the viewer's time zone. */
function Updated({ iso }: { iso: string }) {
  const { tx, lang } = useLang();
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return null;
  const text = new Intl.DateTimeFormat(intlLocale(lang), { dateStyle: "medium", timeStyle: "short" }).format(ms);
  return <time dateTime={iso}>{tx.instructor.updated.replace("{time}", text)}</time>;
}

function StatCard({ label, value, hint, testId }: { label: string; value: string; hint: string; testId: string }) {
  return (
    <div className="card min-w-0 p-4 sm:p-5" data-testid={testId}>
      <dt className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">{label}</dt>
      <dd className="mt-2 text-3xl font-black tabular-nums tracking-tight text-fg">{value}</dd>
      <dd className="mt-1 text-xs text-fg-muted">{hint}</dd>
    </div>
  );
}

function Report({ data, fmt, trackTitles, challengeTitles }: { data: InstructorAnalytics; fmt: Fmt } & Pick<Props, "trackTitles" | "challengeTitles">) {
  const { tx } = useLang();
  const t = tx.instructor;
  const rate = successRate(data.runs);
  const langRows = barRows(data.runs.byLang);
  const statusRows = barRows(data.runs.byStatus);
  const share = (s: number) => fmt.percent(s);
  return (
    <div data-testid="instructor-report">
      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">
          {t.summary.heading}
        </h2>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard testId="stat-runs" label={t.summary.runs} value={fmt.count(data.runs.total)} hint={t.summary.runsHint} />
          <StatCard
            testId="stat-success"
            label={t.summary.success}
            value={fmt.percent(rate)}
            hint={rate === null ? t.runsByLang.empty : t.summary.successHint.replace("{success}", fmt.count(data.runs.success)).replace("{total}", fmt.count(data.runs.total))}
          />
          <StatCard testId="stat-solves" label={t.summary.solves} value={fmt.count(totalChallengeSolves(data.challenges))} hint={t.summary.solvesHint} />
          <StatCard testId="stat-completions" label={t.summary.completions} value={fmt.count(totalCompletions(data.tracks))} hint={t.summary.completionsHint} />
        </dl>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section aria-labelledby="by-lang-heading" className="card min-w-0 p-5 sm:p-6" data-testid="runs-by-lang">
          <h2 id="by-lang-heading" className="mb-4 text-lg font-extrabold text-fg">
            {t.runsByLang.title}
          </h2>
          {langRows.length === 0 ? (
            <p className="text-sm text-fg-muted">{t.runsByLang.empty}</p>
          ) : (
            <BarList rows={langRows} ariaLabel={t.runsByLang.title} labelOf={(id) => getLanguage(id)?.label ?? id} count={fmt.count} percent={share} />
          )}
        </section>
        <section aria-labelledby="by-status-heading" className="card min-w-0 p-5 sm:p-6" data-testid="runs-by-status">
          <h2 id="by-status-heading" className="mb-4 text-lg font-extrabold text-fg">
            {t.runsByStatus.title}
          </h2>
          {statusRows.length === 0 ? (
            <p className="text-sm text-fg-muted">{t.runsByStatus.empty}</p>
          ) : (
            <BarList
              rows={statusRows}
              ariaLabel={t.runsByStatus.title}
              labelOf={(k) => t.status[k] ?? humanizeKey(k)}
              count={fmt.count}
              percent={share}
              barClassOf={(k) => (k === "ok" ? "bg-brand" : "bg-amber-400")}
            />
          )}
        </section>
      </div>

      <div>
        <TracksTable tracks={data.tracks} trackTitles={trackTitles} fmt={fmt} />
        <ExercisesTable exercises={data.exercises} trackTitles={trackTitles} challengeTitles={challengeTitles} fmt={fmt} />
        <ChallengesTable challenges={data.challenges} challengeTitles={challengeTitles} fmt={fmt} />
      </div>
    </div>
  );
}
