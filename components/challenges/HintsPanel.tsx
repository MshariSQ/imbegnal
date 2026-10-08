"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lightbulb, Lock } from "lucide-react";
import type { RevealedHint } from "@/shared/api";
import type { ChallengeHint } from "@/shared/challenges";
import { getToken, useAuthUser } from "@/lib/auth";
import { useLang } from "@/lib/lang-context";
import { revealHint } from "@/lib/ctf/api";
import { classifyFailure, loginHref } from "@/lib/ctf/errors";
import { fmt } from "@/lib/ctf/format";
import { awardWithHints, nextHintIndex, textsByIndex } from "@/lib/ctf/hints";
import { clampCount } from "@/lib/ctf/points";
import { recordHint, type StatsState } from "@/lib/ctf/use-ctf";

/**
 * Progressive hints. They reveal strictly in order; the cost is shown before
 * the learner commits, and a confirm step stands between the click and the
 * deduction. The server (POST .../hint) is what actually charges: nothing is
 * shown as revealed until it answers 2xx.
 *
 * The public challenge data carries only each hint's COST. The TEXT of a hint is never
 * a prop of static data: it comes from the Worker, either in the answer to the reveal
 * request or, for hints the learner revealed earlier (or every hint once the challenge
 * is solved), in `revealed` (= `mine.revealedHints` of GET /api/challenges).
 */
export default function HintsPanel({
  challengeId,
  hints,
  points,
  hintsUsed,
  revealed,
  solved,
  statsStatus,
}: {
  challengeId: string;
  /** Prices only; the texts are Worker-only. */
  hints: ChallengeHint[];
  points: number;
  /** hints already paid for according to the server (labels only; what is OPEN comes from `revealed`) */
  hintsUsed: number;
  /** texts the Worker handed to this learner so far */
  revealed: readonly RevealedHint[] | undefined;
  solved: boolean;
  /** state of the live stats the revealed texts arrive with */
  statsStatus: StatsState["status"];
}) {
  const { tx, lang } = useLang();
  const t = tx.ctf.hints;
  const user = useAuthUser();
  const pathname = usePathname();
  const [confirming, setConfirming] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // `challengeId:index` of hints whose free load failed (kept per challenge, so navigating on never mixes them up)
  const [failedLoads, setFailedLoads] = useState<ReadonlySet<string>>(new Set());
  const cancelRef = useRef<HTMLButtonElement>(null);
  const openRefs = useRef<Record<number, HTMLDivElement | null>>({});
  // Set when a reveal succeeds; the effect below moves focus once the hint text is in the DOM.
  const focusRevealed = useRef<number | null>(null);
  // Solved hints already asked for (by the effect below), so a re-render never repeats a request.
  const requested = useRef(new Set<string>());

  const used = clampCount(hintsUsed, hints.length);
  // index -> text, from the Worker only. A hint without a text here has not been handed to this learner.
  const texts = useMemo(() => textsByIndex(revealed, hints.length), [revealed, hints.length]);
  const next = solved ? null : nextHintIndex(hints.length, texts);
  // Until the live stats settle we do not know which hints are already revealed (and free to open).
  const settled = statsStatus === "ok" || statsStatus === "error";
  // A solved challenge has nothing left to protect: hints that were not revealed before the solve are
  // free to read, and the Worker answers the reveal request without charging. Only ask once the
  // server has confirmed the solve (never from the local solved cache alone).
  const freeToLoad = solved && !!user && statsStatus === "ok";
  const missingKey = freeToLoad ? hints.map((_, i) => i).filter((i) => !texts.has(i)).join(",") : "";

  useEffect(() => {
    if (confirming !== null) cancelRef.current?.focus();
  }, [confirming]);

  useEffect(() => {
    if (focusRevealed.current !== null) {
      openRefs.current[focusRevealed.current]?.focus();
      focusRevealed.current = null;
    }
  }, [texts.size]);

  const loadFree = useCallback(
    async (index: number, token: string) => {
      const key = `${challengeId}:${index}`;
      try {
        const res = await revealHint(challengeId, index, token);
        recordHint(challengeId, index, res.text);
        setFailedLoads((prev) => {
          if (!prev.has(key)) return prev;
          const copy = new Set(prev);
          copy.delete(key);
          return copy;
        });
      } catch {
        setFailedLoads((prev) => new Set(prev).add(key));
      }
    },
    [challengeId]
  );

  useEffect(() => {
    if (!missingKey) return;
    const token = getToken();
    if (!token) return;
    const todo = missingKey
      .split(",")
      .map(Number)
      .filter((i) => !requested.current.has(`${challengeId}:${i}`));
    if (todo.length === 0) return;
    todo.forEach((i) => requested.current.add(`${challengeId}:${i}`));
    void (async () => {
      for (const i of todo) await loadFree(i, token);
    })();
  }, [missingKey, challengeId, loadFree]);

  function retryFree(index: number) {
    const token = getToken();
    if (token) void loadFree(index, token);
  }

  async function reveal(index: number) {
    const token = user ? getToken() : null;
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const res = await revealHint(challengeId, index, token);
      focusRevealed.current = index;
      recordHint(challengeId, index, res.text);
      setConfirming(null);
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
          const text = texts.get(i);
          const isOpen = text !== undefined;
          const isNext = i === next;
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
                  {text[lang]}
                </div>
              ) : solved ? (
                // Solved: the hint is free to read, its text just has not arrived yet (or could not be loaded).
                failedLoads.has(`${challengeId}:${i}`) ? (
                  <div className="mt-3">
                    <p role="alert" className="text-sm text-red-400">
                      {t.failed}
                    </p>
                    <button
                      type="button"
                      onClick={() => retryFree(i)}
                      className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg border border-line px-4 text-sm font-semibold text-fg hover:border-line-strong"
                    >
                      <Lightbulb size={15} aria-hidden />
                      {t.reveal}
                      <span className="sr-only"> {fmt(t.hintN, { n })}</span>
                    </button>
                  </div>
                ) : statsStatus === "error" ? (
                  <p className="mt-3 text-sm text-fg-subtle">{tx.ctf.stats.unavailable}</p>
                ) : (
                  <p className="mt-3 text-sm text-fg-subtle" aria-live="polite">
                    {t.loading}
                  </p>
                )
              ) : isNext ? (
                !user ? (
                  <p className="mt-3 text-sm text-fg-muted">
                    <Link href={loginHref(pathname || "/challenges/")} className="font-semibold text-emerald-400 hover:underline">
                      {t.signIn}
                    </Link>
                  </p>
                ) : !settled ? (
                  // Which hints the learner already revealed is not known yet: offering a paid reveal now could ask them to confirm a cost they already paid.
                  <p className="mt-3 text-sm text-fg-subtle" aria-live="polite">
                    {t.loading}
                  </p>
                ) : confirming === i ? (
                  <div role="group" aria-labelledby={`hint-${i}-confirm`} className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                    <p id={`hint-${i}-confirm`} className="mb-1 text-sm font-bold text-fg">
                      {fmt(t.confirmTitle, { n })}
                    </p>
                    <p className="mb-3 text-sm text-fg-soft">
                      {fmt(t.confirmBody, {
                        cost: h.cost,
                        before: awardWithHints(points, hints, texts.keys()),
                        after: awardWithHints(points, hints, [...texts.keys(), i]),
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
