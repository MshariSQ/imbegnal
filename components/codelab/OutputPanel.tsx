"use client";

import { AlertCircle, CheckCircle2, Globe, Loader2, Server, Terminal, TriangleAlert } from "lucide-react";
import type { PublicRunResult } from "../../shared/api";
import { useLang } from "@/lib/lang-context";
import { describeRunStatus, type Problem } from "@/lib/codelab/errors";
import { fill, formatDuration, statusTone, stripAnsi, truncateForDisplay, formatCount, intlLocale } from "@/lib/codelab/format";
import type { PreviewState, RunnerState, RunView } from "./use-runner";
import ProblemNotice from "./ProblemNotice";
import { CopyButton } from "./ui";
import type { MutableRefObject } from "react";

/** Characters of one stream rendered in the DOM; the runner keeps up to 64 KiB. */
const DISPLAY_CHARS = 64 * 1024;

const TONE: Record<"ok" | "error" | "warn", string> = {
  ok: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  error: "bg-red-500/15 text-red-300 border-red-500/30",
  warn: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

/** The polite live status line: running… / finished with status, exit code, timings. */
export function StatusLine({ state, className = "" }: { state: RunnerState; className?: string }) {
  const { tx } = useLang();
  const s = tx.codelab.status;
  const labels = { ms: s.ms, sec: s.sec };
  let text = s.idle;
  let busy = false;
  let tone: "ok" | "error" | "warn" | null = null;

  switch (state.phase) {
    case "loading-runtime":
      text = s.loadingRuntime;
      busy = true;
      break;
    case "running":
      text = s.running;
      busy = true;
      break;
    case "grading":
      text = s.grading;
      busy = true;
      break;
    case "submitting":
      text = s.submitting;
      busy = true;
      break;
    case "stopped":
      text = s.stopped;
      break;
    case "failed":
      text = s.failed;
      tone = "error";
      break;
    case "done":
      if (state.view) {
        const r = state.view.result;
        const parts = [fill(s.finished, { status: tx.codelab.runStatus[r.status] })];
        if (r.exitCode !== null) parts.push(fill(tx.codelab.output.exitCode, { code: r.exitCode }));
        else if (r.signal) parts.push(fill(tx.codelab.output.signal, { signal: r.signal }));
        parts.push(fill(s.runTime, { time: formatDuration(r.runMs, labels) }));
        if (r.compileMs > 0) parts.push(fill(s.compileTime, { time: formatDuration(r.compileMs, labels) }));
        if (r.truncated.stdout || r.truncated.stderr) parts.push(s.truncated);
        text = parts.join(" · ");
        tone = statusTone(r.status);
      }
      break;
    default:
      break;
  }
  const color = tone === "ok" ? "text-emerald-400" : tone === "error" ? "text-red-400" : tone === "warn" ? "text-amber-400" : "text-fg-muted";
  return (
    <p aria-live="polite" role="status" className={`flex items-center gap-2 text-xs sm:text-[13px] min-w-0 ${color} ${className}`} data-testid="run-status">
      {busy ? (
        <Loader2 size={14} aria-hidden="true" className="shrink-0 motion-safe:animate-spin" />
      ) : tone === "ok" ? (
        <CheckCircle2 size={14} aria-hidden="true" className="shrink-0" />
      ) : tone ? (
        <AlertCircle size={14} aria-hidden="true" className="shrink-0" />
      ) : (
        <Terminal size={14} aria-hidden="true" className="shrink-0" />
      )}
      <span className="truncate">{text}</span>
    </p>
  );
}

function Chip({ tone, children }: { tone: "ok" | "error" | "warn" | "neutral"; children: React.ReactNode }) {
  const cls = tone === "neutral" ? "bg-fg/5 text-fg-soft border-line" : TONE[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>;
}

function Stream({
  label,
  text,
  tone,
  copyWhat,
  region,
  emptyHint,
  truncatedByRunner,
}: {
  label: string;
  text: string;
  tone: "neutral" | "error" | "warn";
  copyWhat: string;
  region: string;
  emptyHint?: string;
  truncatedByRunner?: boolean;
}) {
  const { tx, lang } = useLang();
  const o = tx.codelab.output;
  const clean = stripAnsi(text);
  const t = truncateForDisplay(clean, DISPLAY_CHARS);
  const locale = intlLocale(lang);
  const color = tone === "error" ? "text-red-300" : tone === "warn" ? "text-amber-300" : "text-fg";
  return (
    <section className="min-w-0">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-fg-subtle">{label}</h3>
        {clean && <CopyButton text={clean} label={fill(o.copy, { what: copyWhat })} copiedLabel={fill(o.copiedWhat, { what: copyWhat })} />}
      </div>
      {clean ? (
        <pre
          tabIndex={0}
          role="region"
          aria-label={region}
          dir="ltr"
          className={`m-0 max-h-[40vh] overflow-auto rounded-lg border border-line bg-surface-2 p-3 font-mono text-[13px] leading-relaxed whitespace-pre text-start ${color}`}
        >
          {t.text}
        </pre>
      ) : emptyHint ? (
        <p className="text-sm text-fg-subtle italic">{emptyHint}</p>
      ) : null}
      {(t.truncated || truncatedByRunner) && (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-400">
          <TriangleAlert size={13} aria-hidden="true" className="mt-px shrink-0" />
          <span>
            {t.truncated
              ? fill(o.truncatedStream, { shown: formatCount(t.shown, locale), total: formatCount(t.total, locale) })
              : o.truncatedBytes}
          </span>
        </p>
      )}
    </section>
  );
}

function ResultBody({ view, limitsHint }: { view: RunView; limitsHint?: { runTimeoutMs?: number; memoryMb?: number } }) {
  const { tx } = useLang();
  const o = tx.codelab.output;
  const r: PublicRunResult = view.result;
  const explain = describeRunStatus(r.status, tx.codelab, { browser: view.source === "browser", limits: limitsHint });
  const tone = statusTone(r.status);
  const compileFirst = r.status === "compile_error";
  const compile = r.compileOutput ? (
    <Stream key="compile" label={o.compile} text={r.compileOutput} tone={compileFirst ? "error" : "warn"} copyWhat={o.compile} region={o.compile} />
  ) : null;
  const isWeb = view.lang === "web";
  const nothing = !r.stdout && !r.stderr && !r.compileOutput;

  return (
    <div className="space-y-4" data-testid="run-result" data-status={r.status}>
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone={tone}>
          {tone === "ok" ? <CheckCircle2 size={13} aria-hidden="true" /> : <AlertCircle size={13} aria-hidden="true" />}
          {explain.label}
        </Chip>
        {r.exitCode !== null ? (
          <Chip tone="neutral">{fill(o.exitCode, { code: r.exitCode })}</Chip>
        ) : r.signal ? (
          <Chip tone="neutral">{fill(o.signal, { signal: r.signal })}</Chip>
        ) : null}
        <Chip tone="neutral">
          {view.source === "browser" ? <Globe size={12} aria-hidden="true" /> : <Server size={12} aria-hidden="true" />}
          {view.source === "browser" ? o.browserBadge : o.serverBadge}
        </Chip>
        {view.errorLine ? <Chip tone="error">{fill(o.errorLine, { n: view.errorLine })}</Chip> : null}
      </div>

      {explain.help && <p className="text-sm leading-relaxed text-fg-soft border-s-2 border-amber-500/60 ps-3">{explain.help}</p>}
      {r.message && r.status !== "ok" && !explain.help && <p className="text-sm text-fg-soft">{r.message}</p>}

      {compileFirst && compile}
      {(!isWeb || r.stdout) && (
        <Stream
          label={isWeb ? o.console : o.stdout}
          text={r.stdout}
          tone="neutral"
          copyWhat={isWeb ? o.console : o.stdout}
          region={isWeb ? o.console : o.stdout}
          emptyHint={nothing && !isWeb ? o.noOutput : undefined}
          truncatedByRunner={r.truncated.stdout}
        />
      )}
      {r.stderr && (
        <Stream label={o.stderr} text={r.stderr} tone="error" copyWhat={o.stderr} region={o.stderr} truncatedByRunner={r.truncated.stderr} />
      )}
      {!compileFirst && compile}
    </div>
  );
}

/**
 * Sandboxed preview for the Web mode. `allow-scripts` only: the page gets an
 * opaque origin, so it cannot read this site's storage, cookies or token.
 */
function WebPreview({ preview, frameRef, title, note }: { preview: PreviewState; frameRef: MutableRefObject<HTMLIFrameElement | null>; title: string; note: string }) {
  return (
    <section aria-label={title} className="mb-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-fg-subtle mb-1.5">{title}</h3>
      <iframe
        key={preview.key}
        ref={frameRef}
        title={title}
        sandbox="allow-scripts"
        srcDoc={preview.doc}
        referrerPolicy="no-referrer"
        className="block w-full h-64 rounded-lg border border-line bg-white"
      />
      <p className="mt-1.5 text-xs text-fg-subtle">{note}</p>
    </section>
  );
}

export default function OutputPanel({
  state,
  preview,
  frameRef,
  returnTo,
  onRetry,
  onRunInBrowser,
  extra,
}: {
  state: RunnerState;
  preview: PreviewState | null;
  frameRef: MutableRefObject<HTMLIFrameElement | null>;
  returnTo: string;
  onRetry: () => void;
  onRunInBrowser: () => void;
  /** Rendered above the result (e.g. grading banners). */
  extra?: React.ReactNode;
}) {
  const { tx } = useLang();
  const o = tx.codelab.output;
  const problem: Problem | null = state.problem;
  const showEmpty = state.phase === "idle" && !state.view && !problem;
  const waiting = (state.phase === "running" || state.phase === "loading-runtime" || state.phase === "grading" || state.phase === "submitting") && !state.view;

  return (
    <div className="p-3 sm:p-4" data-testid="output-panel">
      {extra}
      {preview && <WebPreview preview={preview} frameRef={frameRef} title={o.preview} note={o.previewNote} />}
      {problem && <ProblemNotice key={state.seq} problem={problem} returnTo={returnTo} onRetry={onRetry} onRunInBrowser={onRunInBrowser} />}
      {!problem && state.view && <ResultBody view={state.view} />}
      {waiting && (
        <p className="flex items-center gap-2 text-sm text-fg-muted">
          <Loader2 size={15} aria-hidden="true" className="motion-safe:animate-spin" />
          {state.phase === "loading-runtime" ? tx.codelab.status.loadingRuntime : o.wait}
        </p>
      )}
      {showEmpty && (
        <div className="grid place-items-center text-center py-10 text-fg-subtle">
          <Terminal size={28} aria-hidden="true" className="mb-3 opacity-60" />
          <p className="text-sm font-medium text-fg-muted">{o.empty}</p>
          <p className="text-xs mt-1">{o.emptyHint}</p>
        </div>
      )}
    </div>
  );
}
