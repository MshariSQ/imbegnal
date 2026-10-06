"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Globe, Loader2, LogIn, Server, Trash2 } from "lucide-react";
import type { RunSummary } from "../../shared/api";
import type { RunStatus } from "../../shared/protocol";
import { useLang } from "@/lib/lang-context";
import { useNow } from "@/lib/codelab/clock";
import { listRuns } from "@/lib/codelab/api";
import { isAbortError } from "@/lib/codelab/api-error";
import { formatDuration, intlLocale, statusTone, timeAgo, type StatusTone } from "@/lib/codelab/format";
import { isLabLangId, getLabLanguage } from "@/lib/codelab/langs";
import { loginHref } from "@/lib/codelab/nav";
import type { LocalRun } from "@/lib/codelab/storage";
import { btnGhost, focusRing } from "./ui";

const TONE_CLS: Record<StatusTone, string> = {
  ok: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  error: "bg-red-500/15 text-red-300 border-red-500/30",
  warn: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

const PAGE = 20;

function Row({
  lang,
  status,
  at,
  runMs,
  note,
  busy,
  onOpen,
}: {
  lang: string;
  status: string;
  at: number;
  runMs: number;
  note?: string;
  busy: boolean;
  onOpen: () => void;
}) {
  const { tx, lang: ui } = useLang();
  const t = tx.codelab;
  const now = useNow();
  const label = isLabLangId(lang) ? getLabLanguage(lang).label : lang;
  const known = status in t.runStatus;
  const tone = statusTone((known ? status : "internal_error") as RunStatus);
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        disabled={busy}
        aria-label={`${t.history.open}: ${label}`}
        className={`flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-start hover:border-line-strong disabled:opacity-60 ${focusRing}`}
        data-testid="history-item"
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-fg">{label}</span>
            <span className={`rounded-full border px-2 py-px text-[11px] font-semibold ${TONE_CLS[tone]}`}>{known ? t.runStatus[status as RunStatus] : status}</span>
            {note && <span className="text-[11px] text-fg-subtle">{note}</span>}
          </span>
          <span className="mt-0.5 block text-xs text-fg-subtle">
            {now ? timeAgo(at, now, intlLocale(ui), t.history.justNow) : ""} · {formatDuration(runMs, { ms: t.status.ms, sec: t.status.sec })}
          </span>
        </span>
        {busy && <Loader2 size={16} aria-hidden="true" className="shrink-0 motion-safe:animate-spin text-fg-subtle" />}
      </button>
    </li>
  );
}

/** Run history: server runs for signed-in users (paged) and the last 20 browser runs on this device. */
export default function HistoryPanel({
  signedIn,
  localRuns,
  returnTo,
  onOpenServer,
  onOpenLocal,
  onClearLocal,
}: {
  signedIn: boolean;
  localRuns: LocalRun[];
  returnTo: string;
  onOpenServer: (id: string) => Promise<boolean>;
  onOpenLocal: (run: LocalRun) => void;
  onClearLocal: () => void;
}) {
  const { tx } = useLang();
  const t = tx.codelab.history;
  const [tab, setTab] = useState<"server" | "device">(signedIn ? "server" : "device");
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [next, setNext] = useState<string | undefined>();
  const [state, setState] = useState<"idle" | "loading" | "failed">(signedIn ? "loading" : "idle");
  const [opening, setOpening] = useState<string | null>(null);
  const [openFailed, setOpenFailed] = useState(false);
  const [cleared, setCleared] = useState(false);
  const acRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback((before?: string) => {
    acRef.current?.abort();
    const ac = new AbortController();
    acRef.current = ac;
    listRuns({ limit: PAGE, before, signal: ac.signal })
      .then((res) => {
        setRuns((prev) => (before ? [...prev, ...res.runs] : res.runs));
        setNext(res.next);
        setState("idle");
      })
      .catch((err) => {
        if (!isAbortError(err)) setState("failed");
      });
  }, []);

  /** "Load more" / retry: shows the spinner, then fetches. */
  const load = useCallback(
    (before?: string) => {
      setState("loading");
      fetchPage(before);
    },
    [fetchPage]
  );

  // First page: the initial state is already "loading", so no synchronous setState here.
  useEffect(() => {
    if (signedIn) fetchPage();
    return () => acRef.current?.abort();
  }, [signedIn, fetchPage]);

  async function open(id: string) {
    setOpening(id);
    setOpenFailed(false);
    const ok = await onOpenServer(id);
    setOpening(null);
    if (!ok) setOpenFailed(true);
  }

  const tabCls = (active: boolean) =>
    `flex-1 inline-flex items-center justify-center gap-1.5 min-h-10 rounded-md text-sm font-semibold ${focusRing} ${active ? "bg-surface-2 text-fg shadow-sm" : "text-fg-muted hover:text-fg"}`;

  return (
    <div className="p-3 space-y-3">
      <div role="tablist" aria-label={t.title} className="flex gap-1 rounded-lg border border-line bg-bg p-1">
        <button type="button" role="tab" id="hist-tab-server" aria-selected={tab === "server"} aria-controls="hist-panel" onClick={() => setTab("server")} className={tabCls(tab === "server")}>
          <Server size={14} aria-hidden="true" />
          {t.server}
        </button>
        <button type="button" role="tab" id="hist-tab-device" aria-selected={tab === "device"} aria-controls="hist-panel" onClick={() => setTab("device")} className={tabCls(tab === "device")}>
          <Globe size={14} aria-hidden="true" />
          {t.device}
        </button>
      </div>

      <div id="hist-panel" role="tabpanel" aria-labelledby={`hist-tab-${tab}`} className="space-y-3">
        {openFailed && (
          <p role="alert" className="text-sm text-red-400">
            {t.openFailed}
          </p>
        )}

        {tab === "server" && !signedIn && (
          <div className="rounded-xl border border-line bg-surface p-4 text-sm text-fg-soft">
            <p>{t.signInPrompt}</p>
            <Link href={loginHref(returnTo)} className={`${btnGhost} mt-3 w-fit`}>
              <LogIn size={15} aria-hidden="true" />
              {tx.codelab.signIn}
            </Link>
          </div>
        )}

        {tab === "server" && signedIn && (
          <>
            {runs.length === 0 && state === "idle" && <p className="text-sm text-fg-subtle">{t.empty}</p>}
            <ul className="space-y-2">
              {runs.map((r) => (
                <Row
                  key={r.id}
                  lang={r.lang}
                  status={r.status}
                  at={Date.parse(r.createdAt)}
                  runMs={r.runMs}
                  note={r.ref.kind === "lesson" ? t.kindLesson : r.ref.kind === "challenge" ? t.kindChallenge : undefined}
                  busy={opening === r.id}
                  onOpen={() => open(r.id)}
                />
              ))}
            </ul>
            {state === "loading" && (
              <p role="status" className="flex items-center gap-2 text-sm text-fg-muted">
                <Loader2 size={15} aria-hidden="true" className="motion-safe:animate-spin" />
                {t.loading}
              </p>
            )}
            {state === "failed" && (
              <div role="alert" className="text-sm text-red-400">
                {t.failed}{" "}
                <button type="button" className="underline" onClick={() => load(runs.length ? next : undefined)}>
                  {tx.codelab.retry}
                </button>
              </div>
            )}
            {next && state === "idle" && (
              <button type="button" onClick={() => load(next)} className={`${btnGhost} w-full`}>
                {t.loadMore}
              </button>
            )}
          </>
        )}

        {tab === "device" && (
          <>
            <p className="text-xs text-fg-subtle">{t.browserOnlyNote}</p>
            {localRuns.length === 0 && <p className="text-sm text-fg-subtle">{t.emptyDevice}</p>}
            <ul className="space-y-2">
              {localRuns.map((r) => (
                <Row key={r.id} lang={r.lang} status={r.status} at={r.at} runMs={r.runMs} busy={false} onOpen={() => onOpenLocal(r)} />
              ))}
            </ul>
            {localRuns.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClearLocal();
                  setCleared(true);
                }}
                className={`${btnGhost} w-full`}
              >
                <Trash2 size={15} aria-hidden="true" />
                {t.clearLocal}
              </button>
            )}
            <p role="status" aria-live="polite" className="text-xs text-fg-subtle">
              {cleared && localRuns.length === 0 ? t.clearedLocal : ""}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
