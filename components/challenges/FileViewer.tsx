"use client";

import { useRef, useState } from "react";
import { Check, Copy, Download, FileText } from "lucide-react";
import type { ChallengeFile } from "@/shared/challenges";
import { useLang } from "@/lib/lang-context";
import { plural } from "@/lib/ctf/format";

/** Longer files are previewed up to this many characters; Download always carries the whole file. */
const PREVIEW_CHARS = 20_000;

function download(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // revoke after the browser has started the download
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** One public puzzle file: inline viewer (always LTR), Copy and Download (Blob URL). */
export default function FileViewer({ file }: { file: ChallengeFile }) {
  const { tx, lang } = useLang();
  const t = tx.ctf.detail;
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const truncated = file.content.length > PREVIEW_CHARS;
  const shown = truncated ? file.content.slice(0, PREVIEW_CHARS) : file.content;
  const lines = file.content === "" ? 0 : file.content.split("\n").length;

  async function copy() {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: the content is still selectable in the viewer
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-3">
        <FileText size={16} aria-hidden className="shrink-0 text-fg-subtle" />
        <span className="min-w-0 flex-1 break-all font-mono text-sm font-semibold text-fg" dir="ltr">
          {file.name}
        </span>
        <span className="text-xs text-fg-subtle">{plural(t.fileLines, lines, lang)}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copy}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-fg-soft hover:border-line-strong hover:text-fg"
          >
            {copied ? <Check size={14} aria-hidden className="text-emerald-400" /> : <Copy size={14} aria-hidden />}
            {copied ? t.fileCopied : t.fileCopy}
            <span className="sr-only"> {file.name}</span>
          </button>
          <button
            type="button"
            onClick={() => download(file.name, file.content)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-fg-soft hover:border-line-strong hover:text-fg"
          >
            <Download size={14} aria-hidden />
            {t.fileDownload}
            <span className="sr-only"> {file.name}</span>
          </button>
        </div>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? t.fileCopied : ""}
      </span>
      {file.description && <p className="px-4 pt-3 text-sm text-fg-muted">{file.description[lang]}</p>}
      <pre
        dir="ltr"
        tabIndex={0}
        aria-label={file.name}
        className="m-4 max-h-80 overflow-auto rounded-lg border border-line bg-bg p-3 text-start font-mono text-[13px] leading-relaxed text-fg-soft"
      >
        {shown}
        {truncated ? "\n…" : ""}
      </pre>
    </div>
  );
}
