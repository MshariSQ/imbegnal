"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, CircleSlash, Hourglass, LogIn, RotateCw, ServerCrash, Sparkles, WifiOff, Globe } from "lucide-react";
import type { Problem, ProblemKind } from "@/lib/codelab/errors";
import { fill } from "@/lib/codelab/format";
import { loginHref } from "@/lib/codelab/nav";
import { useLang } from "@/lib/lang-context";
import { btnGhost, btnPrimary } from "./ui";

const ICONS: Record<ProblemKind, typeof AlertTriangle> = {
  signin: LogIn,
  expired: LogIn,
  quota: Hourglass,
  global: Hourglass,
  rate: Hourglass,
  concurrency: Hourglass,
  suspended: CircleSlash,
  runner: ServerCrash,
  invalid: AlertTriangle,
  forbidden: CircleSlash,
  not_found: CircleSlash,
  network: WifiOff,
  python_load: WifiOff,
  unknown: AlertTriangle,
};

/**
 * A localized, actionable error card. Rate and concurrency problems count down
 * and enable "Try again" when the wait is over; nothing here blocks the editor.
 */
export default function ProblemNotice({
  problem,
  returnTo,
  onRetry,
  onRunInBrowser,
}: {
  problem: Problem;
  /** Same-origin path (with query) the sign-in page should return to. */
  returnTo: string;
  onRetry?: () => void;
  onRunInBrowser?: () => void;
}) {
  const { tx } = useLang();
  const o = tx.codelab.problems;
  const Icon = ICONS[problem.kind];
  const [left, setLeft] = useState(problem.retryAfterSec ?? 0);

  // A fresh problem restarts the countdown (the card is re-keyed per problem by its parent).
  useEffect(() => {
    if (!problem.retryAfterSec) return;
    const end = Date.now() + problem.retryAfterSec * 1000;
    const id = setInterval(() => {
      const s = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) clearInterval(id);
    }, 500);
    return () => clearInterval(id);
  }, [problem]);

  const waiting = !!problem.retryAfterSec && left > 0;
  const has = (a: string) => (problem.actions as string[]).includes(a);

  return (
    <div role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/[0.07] p-4">
      <div className="flex gap-3">
        <Icon size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-fg">{problem.title}</p>
          <p className="mt-1 text-sm text-fg-soft leading-relaxed">{problem.body}</p>
          {problem.retryAfterSec ? (
            <p className="mt-2 text-sm font-medium text-fg" aria-live="off">
              {waiting ? fill(o.retryIn, { seconds: left }) : o.retryNow}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {has("signin") && (
              <Link href={loginHref(returnTo)} className={btnPrimary}>
                <LogIn size={15} aria-hidden="true" />
                {o.signinCta}
              </Link>
            )}
            {has("browser") && onRunInBrowser && (
              <button type="button" onClick={onRunInBrowser} className={has("signin") ? btnGhost : btnPrimary}>
                <Globe size={15} aria-hidden="true" />
                {o.runInBrowser}
              </button>
            )}
            {has("retry") && onRetry && (
              <button type="button" onClick={onRetry} disabled={waiting} className={btnGhost}>
                <RotateCw size={15} aria-hidden="true" />
                {tx.codelab.retry}
              </button>
            )}
            {has("pricing") && (
              <Link href="/pricing/" className={btnGhost}>
                <Sparkles size={15} aria-hidden="true" />
                {tx.codelab.seePlans}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
