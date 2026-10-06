"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CheckCircle2, Droplet, Info, Loader2, ShieldAlert, Trophy, XCircle } from "lucide-react";
import type { GradeResult } from "@/shared/api";
import type { ChallengeKind } from "@/shared/challenges";
import { challengeHref } from "@/shared/links";
import { useLang } from "@/lib/lang-context";
import { loginHref } from "@/lib/ctf/errors";
import { fmt } from "@/lib/ctf/format";
import { formatCountdown, formatNumber } from "@/lib/ctf/time";
import type { ChallengeListItem } from "@/lib/ctf/types";
import Celebration from "./Celebration";
import type { SubmissionState } from "./useSubmission";

function GradeList({ grade }: { grade: GradeResult }) {
  const { tx } = useLang();
  const t = tx.ctf.result;
  if (grade.tests.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-subtle">{t.tests}</p>
      <ul className="space-y-1.5">
        {grade.tests.map((g, i) => (
          <li key={i} className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              {g.passed ? <CheckCircle2 size={15} aria-hidden className="shrink-0 text-emerald-400" /> : <XCircle size={15} aria-hidden className="shrink-0 text-red-400" />}
              <span className="min-w-0 flex-1 text-fg-soft">{g.hidden ? t.hidden : g.name}</span>
              <span className="text-xs font-semibold text-fg-muted">{g.passed ? t.passed : t.failed}</span>
            </div>
            {!g.passed && !g.hidden && (g.expected !== undefined || g.actual !== undefined) && (
              <dl className="mt-2 grid gap-1 font-mono text-xs" dir="ltr">
                {g.expected !== undefined && (
                  <div>
                    <dt className="text-fg-subtle">{t.expected}</dt>
                    <dd className="whitespace-pre-wrap break-all text-fg-soft">{g.expected}</dd>
                  </div>
                )}
                {g.actual !== undefined && (
                  <div>
                    <dt className="text-fg-subtle">{t.actual}</dt>
                    <dd className="whitespace-pre-wrap break-all text-fg-soft">{g.actual}</dd>
                  </div>
                )}
              </dl>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ErrorBody({ state, cooldown }: { state: Extract<SubmissionState, { phase: "error" }>; cooldown: number }) {
  const { tx, lang } = useLang();
  const e = tx.ctf.errors;
  const pathname = usePathname();
  const time = (iso?: string) => {
    if (!iso || Number.isNaN(Date.parse(iso))) return undefined;
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-u-nu-latn" : "en", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  };
  switch (state.kind) {
    case "signin":
      return (
        <>
          <p className="mb-3">{e.signIn}</p>
          <Link href={loginHref(pathname || "/challenges/")} className="inline-flex min-h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-brand-fg hover:bg-brand-strong">
            {tx.ctf.submit.signIn}
          </Link>
        </>
      );
    case "rate":
      return cooldown > 0 ? (
        <>
          <p>{fmt(e.rate, { time: formatCountdown(cooldown) })}</p>
        </>
      ) : (
        <p>{e.rateNoTime}</p>
      );
    case "quota": {
      const at = time(state.resetAt);
      return <p>{at ? fmt(e.quotaAt, { time: at }) : e.quota}</p>;
    }
    case "suspended":
      return <p>{e.suspended}</p>;
    case "forbidden":
      return <p>{e.forbidden}</p>;
    case "runner":
      return <p>{e.runner}</p>;
    case "invalid":
      return <p>{e.invalid}</p>;
    case "notfound":
      return <p>{e.notfound}</p>;
    case "network":
      return <p>{e.network}</p>;
    default:
      return <p>{e.generic}</p>;
  }
}

/**
 * The submission outcome. The wrapper is a polite live region that stays
 * mounted, and it is focusable so the page can move focus to the result after
 * a submit (keyboard and screen-reader users land on the answer).
 */
const ResultPanel = forwardRef<
  HTMLDivElement,
  { state: SubmissionState; kind: ChallengeKind; next?: ChallengeListItem; cooldown: number }
>(function ResultPanel({ state, kind, next, cooldown }, ref) {
  const { tx, lang } = useLang();
  const t = tx.ctf.result;
  return (
    <div ref={ref} tabIndex={-1} role="status" aria-live="polite" aria-label={t.status} className="mt-4 outline-none" data-testid="ctf-result">
      {state.phase === "pending" && (
        <p className="flex items-center gap-2 text-sm text-fg-muted">
          <Loader2 size={16} aria-hidden className="animate-spin" />
          {tx.ctf.submit.checking}
        </p>
      )}

      {state.phase === "error" && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-fg-soft" data-testid="ctf-error" data-kind={state.kind}>
          <div className="flex gap-3">
            <ShieldAlert size={18} aria-hidden className="mt-0.5 shrink-0 text-amber-400" />
            <div className="min-w-0 flex-1">
              <ErrorBody state={state} cooldown={cooldown} />
            </div>
          </div>
        </div>
      )}

      {state.phase === "done" && state.res.correct && (
        <div className="card relative overflow-hidden border-emerald-500/40 p-5" data-testid="ctf-correct">
          <Celebration />
          <div className="relative flex items-start gap-3">
            <Trophy size={26} aria-hidden className="mt-0.5 shrink-0 text-emerald-400" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-black text-fg">{t.correct}</p>
              <p className="mt-0.5 text-sm text-fg-soft">
                {state.res.alreadySolved || state.res.awarded === 0 ? t.alreadySolved : fmt(t.correctBody, { n: formatNumber(state.res.awarded) })}
              </p>
              {state.res.firstBlood && (
                <p className="mt-3 inline-flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400" data-testid="ctf-first-blood">
                  <Droplet size={16} aria-hidden className="mt-0.5 shrink-0 fill-current" />
                  <span>
                    {t.firstBlood} <span className="font-normal text-fg-soft">{t.firstBloodBody}</span>
                  </span>
                </p>
              )}
              {state.res.grade && <GradeList grade={state.res.grade} />}
              {next && (
                <Link
                  href={challengeHref(next.id)}
                  className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3 hover:border-line-strong"
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-fg-subtle">{t.next}</span>
                    <span className="block truncate text-sm font-bold text-fg">{next.title[lang]}</span>
                  </span>
                  <ArrowRight size={18} aria-hidden className="rtl-flip shrink-0 text-emerald-400" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {state.phase === "done" && !state.res.correct && (
        <div className="rounded-xl border border-line bg-surface-2 p-4 text-sm text-fg-soft" data-testid="ctf-incorrect">
          <div className="flex gap-3">
            <Info size={18} aria-hidden className="mt-0.5 shrink-0 text-fg-subtle" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-fg">{t.incorrect}</p>
              {/* A wrong flag gets the same neutral message every time: never a hint at how close it was. */}
              <p className="mt-1">{kind === "flag" ? t.incorrectFlag : t.incorrectCode}</p>
              {kind !== "flag" && state.res.feedback && <p className="mt-2 text-fg-muted">{state.res.feedback}</p>}
              {kind !== "flag" && state.res.grade && <GradeList grade={state.res.grade} />}
              {kind !== "flag" && (state.res.result?.compileOutput || state.res.result?.stderr) && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-fg-muted">{t.output}</summary>
                  <pre dir="ltr" className="mt-2 max-h-48 overflow-auto rounded-lg border border-line bg-bg p-3 text-start font-mono text-xs text-fg-soft">
                    {(state.res.result.compileOutput || state.res.result.stderr).slice(0, 4000)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ResultPanel;
