"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Download, Eye, Pencil, Cloud, HardDrive } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { useStudy, setNote } from "@/lib/study-store";
import { useAuthUser } from "@/lib/auth";

/** Per-lesson notes with autosave (local first, synced when signed in). */
export default function NotesPanel({ noteKey, lessonTitle }: { noteKey: string; lessonTitle: string }) {
  const { tx } = useLang();
  const user = useAuthUser();
  const study = useStudy();
  const stored = study.notes[noteKey]?.text ?? "";
  const [draft, setDraft] = useState<string | null>(null); // null = not editing, show stored
  const [preview, setPreview] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pending = useRef<string | null>(null);
  const text = draft ?? stored;
  const dirty = draft !== null && draft !== stored;

  // Save immediately (instead of after the debounce) when leaving the lesson
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (pending.current !== null) setNote(noteKey, pending.current);
    },
    [noteKey]
  );

  function onChange(v: string) {
    setDraft(v);
    pending.current = v;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setNote(noteKey, v);
      pending.current = null;
      setDraft(null);
    }, 600);
  }

  function exportMd() {
    const blob = new Blob([`# ${lessonTitle}\n\n${text}\n`], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${noteKey.replace("/", "-")}-notes.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="inline-flex rounded-lg border border-line p-0.5">
          <button onClick={() => setPreview(false)} aria-pressed={!preview} className={`p-1.5 rounded-md ${!preview ? "bg-fg/10 text-fg" : "text-fg-subtle"}`}>
            <Pencil size={14} />
          </button>
          <button onClick={() => setPreview(true)} aria-pressed={preview} className={`p-1.5 rounded-md ${preview ? "bg-fg/10 text-fg" : "text-fg-subtle"}`}>
            <Eye size={14} />
          </button>
        </div>
        <button onClick={exportMd} disabled={!text.trim()} className="inline-flex items-center gap-1.5 text-xs font-semibold text-fg-muted hover:text-fg disabled:opacity-40">
          <Download size={13} /> {tx.notes.export}
        </button>
      </div>

      {preview ? (
        <div className="flex-1 min-h-64 overflow-y-auto rounded-xl border border-line bg-surface-2/40 p-4 text-sm text-fg-soft leading-relaxed [&_h1]:font-bold [&_h2]:font-bold [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5 [&_p]:mb-3 [&_code]:font-mono [&_code]:text-emerald-300">
          {text.trim() ? <ReactMarkdown>{text}</ReactMarkdown> : <p className="text-fg-faint">{tx.notes.empty}</p>}
        </div>
      ) : (
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={tx.notes.placeholder}
          aria-label={tx.player.tabNotes}
          className="flex-1 min-h-64 w-full resize-none rounded-xl border border-line bg-surface-2/40 focus:border-brand/50 outline-none p-4 text-sm text-fg leading-relaxed placeholder:text-fg-faint"
        />
      )}

      <div className="flex items-center justify-between mt-2 text-[11px] text-fg-subtle">
        <span className="flex items-center gap-1.5">
          {user ? <Cloud size={12} /> : <HardDrive size={12} />}
          {dirty ? "…" : user ? tx.notes.savedSynced : tx.notes.savedLocal}
        </span>
        <span>{words} {tx.notes.words}</span>
      </div>
    </div>
  );
}
