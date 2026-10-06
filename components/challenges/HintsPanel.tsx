"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lightbulb, Lock } from "lucide-react";
import type { ChallengeHint } from "@/shared/challenges";
import { getToken, useAuthUser } from "@/lib/auth";
import { useLang } from "@/lib/lang-context";
import { revealHint } from "@/lib/ctf/api";
import { classifyFailure, loginHref } from "@/lib/ctf/errors";
import { fmt } from "@/lib/ctf/format";
import { awardAfterNextHint, clampCount, remainingAward } from "@/lib/ctf/points";
import { recordHint } from "@/lib/ctf/use-ctf";

/**
 * Progressive hints. They reveal strictly in order; the cost is shown before
 * the learner commits, and a confirm step stands between the click and the
 * deduction. The server (POST .../hint) is what actually charges: nothing is
 * shown as revealed until it answers 2xx.
 */
export default function HintsPanel({
  challengeId,
  hints,
  points,
  hintsUsed,
  solved,
}: {
  challengeId: string;
  hints: ChallengeHint[];
  points: number;
  /** hints already revealed according to the server */
  hintsUsed: number;
  solved: boolean;
}) {
  const { tx, lang } = useLang();
  const t = tx.ctf.hints;
  const user = useAuthUser();
  const pathname = usePathname();
  const [confirming, setConfirming] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const openRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [focusRevealed, setFocusRevealed] = useState<number | null>(null);

  const used = clampCount(hintsUsed, hints.length);
  // A solved challenge has nothing left to protect: every hint is open for review.
  const open = solved ? hints.length : used;

  useEffect(() => {
    if (confirming !== null) cancelRef.current?.focus();
  }, [confirming]);

  useEffect(() => {
    if (focusRevealed !== null) {
      openRefs.current[focusRevealed]?.focus();
      setFocusRevealed(null);
    }
  }, [focusRevealed]);

  async function reveal(index: number) {
    const token = user ? getToken() : null;
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      await revealHint(challengeId, index, token);
      recordHint(challengeId, index);
      setConfirming(null);
      setFocusRevealed(index);
    } catch (e) {
      const k = classifyFailure(e).kind;
      setError(k === "signin" ? tx.ctf.errors.signIn : k === "network" ? tx.ctf.errors.network : t.failed);
    } finally {
      setBusy(false);
    }
  }

  if (hints.length === 0) {
    return <p className="text-sm text-fg-muted">{t.none}</p>;
  }

  return (
    <div>
      <p className="mb-4 text-sm text-fg-muted">{solved ? t.solvedNote : t.intro}</p>
      <ol className="space-y-3">
        {hints.map((h, i) => {
          const isOpen = i < open;
          const isNext = i === used && !solved;
          const n = i + 1;
          return (
            <li key={i} className="card p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-fg">
                  {isOpen ? <Lightbulb size={16} aria-hidden className="text-amber-400" /> : <Lock size={16} aria-hidden className="text-fg-subtle" />}
                  {fmt(t.hintN, { n })}
                </span>
                <span className="text-xs font-semibold text-fg-subtle" dir="ltr">
                  {isOpen ? (solved && i >= used ? t.revealedNote : fmt(t.paid, { n: h.cost })) : h.cost > 0 ? fmt(t.cost, { n: h.cost }) : t.free}
                </span>
              </div>

              {isOpen ? (
                <div
                  ref={(el) => {
                    openRefs.current[i] = el;
                  }}
                  tabIndex={-1}
                  className="mt-3 text-sm leading-relaxed text-fg-soft outline-none"
                >
                  {h.text[lang]}
                </div>
              ) : isNext ? (
                !user ? (
                  <p className="mt-3 text-sm text-fg-muted">
                    <Link href={loginHref(pathname || "/challenges/")} className="font-semibold text-emerald-400 hover:underline">
                      {t.signIn}
                    </Link>
                  </p>
                ) : confirming === i ? (
                  <div role="group" aria-labelledby={`hint-${i}-confirm`} className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                    <p id={`hint-${i}-confirm`} className="mb-1 text-sm font-bold text-fg">
                      {fmt(t.confirmTitle, { n })}
                    </p>
                    <p className="mb-3 text-sm text-fg-soft">
                      {fmt(t.confirmBody, {
                        cost: h.cost,
                        before: remainingAward(points, hints, used),
                        after: awardAfterNextHint(points, hints, used) ?? 0,
                      })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => reveal(i)}
                        className="inline-flex min-h-10 items-center rounded-lg bg-amber-500 px-4 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-60"
                      >
                        {busy ? t.revealing : t.confirm}
                      </button>
                      <button
                        ref={cancelRef}
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirming(null)}
                        className="inline-flex min-h-10 items-center rounded-lg border border-line px-4 text-sm font-semibold text-fg hover:border-line-strong"
                      >
                        {t.cancel}
                      </button>
                    </div>
                    {error && (
                      <p role="alert" className="mt-3 text-sm text-red-400">
                        {error}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setConfirming(i);
                    }}
                    className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-line px-4 text-sm font-semibold text-fg hover:border-line-strong"
                  >
                    <Lightbulb size={15} aria-hidden />
                    {t.reveal}
                    <span className="sr-only">
                      {" "}
                      {fmt(t.hintN, { n })}, {h.cost > 0 ? fmt(t.cost, { n: h.cost }) : t.free}
                    </span>
                  </button>
                )
              ) : (
                <p className="mt-3 text-sm text-fg-subtle">{t.locked}</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
