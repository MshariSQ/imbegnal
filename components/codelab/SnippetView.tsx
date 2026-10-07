"use client";

/**
 * /code-lab/s/?id=<id>: a read-only view of a shared snippet. Anyone can read
 * and run it; "Open in Code Lab" forks it into an editable lab.
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, FilePlus2, GitFork, User } from "lucide-react";
import type { Snippet } from "../../shared/api";
import { codeLabHref } from "../../shared/links";
import { useLang } from "@/lib/lang-context";
import { fetchSnippet } from "@/lib/codelab/api";
import { LabApiError, isAbortError } from "@/lib/codelab/api-error";
import { fill, formatDate, intlLocale } from "@/lib/codelab/format";
import { getLabLanguage } from "@/lib/codelab/langs";
import { decideRunTarget } from "@/lib/codelab/run-target";
import { browserStorage, loadPrefs, type LabPrefs } from "@/lib/codelab/storage";
import EditorSlot from "./EditorSlot";
import { LabSkeleton } from "./CodeLab";
import OutputPanel, { StatusLine } from "./OutputPanel";
import QuotaBar from "./QuotaBar";
import { RunButton } from "./Toolbar";
import { btnGhost, btnPrimary, focusRing } from "./ui";
import { useAvailability, useRunner } from "./use-runner";

const ID_RE = /^[A-Za-z0-9_-]{6,40}$/;

type Load = { status: "loading" } | { status: "notfound" } | { status: "error" } | { status: "ready"; snippet: Snippet };

export default function SnippetView() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  return <SnippetSession key={id} id={id} />;
}

function SnippetSession({ id }: { id: string }) {
  const { tx, lang: ui } = useLang();
  const t = tx.codelab;
  const runner = useRunner();
  const availability = useAvailability();
  const [load, setLoad] = useState<Load>(ID_RE.test(id) ? { status: "loading" } : { status: "notfound" });
  const [attempt, setAttempt] = useState(0);
  // Only used inside the editor (loaded client-side), so reading storage here cannot desync hydration.
  const [prefs] = useState<LabPrefs>(() => loadPrefs(browserStorage()));
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ID_RE.test(id)) return;
    const ac = new AbortController();
    fetchSnippet(id, ac.signal)
      .then((snippet) => setLoad({ status: "ready", snippet }))
      .catch((err) => {
        if (isAbortError(err)) return;
        setLoad(err instanceof LabApiError && (err.status === 404 || err.code === "not_found") ? { status: "notfound" } : { status: "error" });
      });
    return () => ac.abort();
  }, [id, attempt]);

  const snippet = load.status === "ready" ? load.snippet : null;
  const target = snippet ? decideRunTarget({ lang: snippet.lang, signedIn: runner.signedIn, preferBrowser: prefs.preferBrowser, availability }) : "unavailable";
  const run = useCallback(
    async (forceBrowser = false) => {
      if (!snippet || runner.busy) return;
      const spec = getLabLanguage(snippet.lang);
      const tgt = forceBrowser && spec.browser ? "browser" : target;
      if (tgt === "unavailable") return;
      await runner.run({ lang: snippet.lang, code: snippet.code, stdin: snippet.stdin, target: tgt });
      const a = document.activeElement;
      if (a === document.body || (a instanceof HTMLElement && a.closest("[data-run-wrap]"))) resultsRef.current?.focus({ preventScroll: true });
    },
    [snippet, runner, target]
  );

  const returnTo = `/code-lab/s/?id=${encodeURIComponent(id)}`;

  if (load.status === "loading") return <LabSkeleton />;
  if (load.status !== "ready") {
    const notFound = load.status === "notfound";
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-8">
        <div className="card max-w-xl p-6 sm:p-8" role="alert" data-testid="snippet-error">
          <h1 className="text-xl font-extrabold text-fg">{notFound ? t.snippet.notFoundTitle : t.problems.unknownTitle}</h1>
          <p className="mt-2 text-sm text-fg-soft leading-relaxed">{notFound ? t.snippet.notFoundBody : t.problems.networkBody}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {!notFound && (
              <button type="button" className={btnPrimary} onClick={() => { setLoad({ status: "loading" }); setAttempt((n) => n + 1); }}>
                {t.retry}
              </button>
            )}
            <Link href={codeLabHref({ kind: "blank" })} className={notFound ? btnPrimary : btnGhost}>
              {t.snippet.newLab}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const s = load.snippet;
  const spec = getLabLanguage(s.lang);
  const locale = intlLocale(ui);
  const canRun = target !== "unavailable";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-8">
      <header className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-fg break-words" data-testid="snippet-title">
          {s.title?.trim() || t.snippet.untitled}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-muted">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 font-semibold text-fg-soft" data-testid="snippet-lang">
            {spec.label}
          </span>
          <span className="inline-flex items-center gap-1.5" data-testid="snippet-author">
            <User size={14} aria-hidden="true" />
            {fill(t.snippet.by, { name: s.authorName?.trim() || t.snippet.anonymous })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} aria-hidden="true" />
            {formatDate(s.createdAt, locale)}
          </span>
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card" data-testid="lab">
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-2">
          <p className="me-auto text-xs text-fg-muted">{t.snippet.readOnlyNote}</p>
          <Link href={codeLabHref({ kind: "snippet", id: s.id })} className={btnPrimary} data-testid="fork-link">
            <GitFork size={15} aria-hidden="true" />
            {t.snippet.openInLab}
          </Link>
          <span data-run-wrap className="hidden lg:block">
            <RunButton busy={runner.busy} disabled={!canRun} onRun={() => run()} onStop={runner.stop} />
          </span>
        </div>
        <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:h-[calc(100dvh-20rem)] lg:min-h-[28rem]">
          <div className="min-h-[18rem] max-lg:h-[22rem] min-w-0 lg:border-e border-line">
            <EditorSlot
              value={s.code}
              mode={spec.editor}
              ariaLabel={fill(t.editor.ariaReadOnly, { lang: spec.label })}
              fontSize={prefs.fontSize}
              wrap={prefs.wrap}
              readOnly
              onRun={() => run()}
              loadFailedText={t.editor.loadFailed}
            />
          </div>
          <div className="flex min-h-0 min-w-0 flex-col">
            {s.stdin && (
              <section className="border-b border-line p-3">
                <h2 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-fg-subtle">{t.snippet.stdin}</h2>
                <pre tabIndex={0} role="region" aria-label={t.snippet.stdin} dir="ltr" className="m-0 max-h-32 overflow-auto rounded-lg border border-line bg-surface-2 p-3 font-mono text-[13px] whitespace-pre text-start text-fg">
                  {s.stdin}
                </pre>
              </section>
            )}
            <div className="flex flex-wrap items-center gap-x-3 border-b border-line bg-surface px-3 py-2">
              <div className="min-w-0 flex-1">
                <StatusLine state={runner.state} />
              </div>
            </div>
            {runner.signedIn && runner.quota && (
              <div className="border-b border-line px-3 py-1.5">
                <QuotaBar quota={runner.quota} />
              </div>
            )}
            <div ref={resultsRef} tabIndex={-1} aria-label={t.output.regionLabel} className="min-h-[14rem] flex-1 overflow-y-auto outline-none">
              <OutputPanel
                state={runner.state}
                preview={runner.preview}
                frameRef={runner.frameRef}
                returnTo={returnTo}
                onRetry={() => run()}
                onRunInBrowser={() => run(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 mt-3 flex items-center gap-2 border-t border-line bg-bg/95 px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden" data-run-wrap>
        <RunButton busy={runner.busy} disabled={!canRun} onRun={() => run()} onStop={runner.stop} className="flex-1" />
        <Link href={codeLabHref({ kind: "blank" })} className={`${btnGhost} ${focusRing}`} aria-label={t.snippet.newLab}>
          <FilePlus2 size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
