"use client";

import { Eraser, FileInput } from "lucide-react";
import { useId } from "react";
import { useLang } from "@/lib/lang-context";
import { btnGhost, focusRing } from "./ui";

export default function InputPanel({
  value,
  onChange,
  sample,
  disabled,
  webMode,
  rows = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  sample?: string;
  disabled?: boolean;
  webMode?: boolean;
  rows?: number;
}) {
  const { tx } = useLang();
  const t = tx.codelab.input;
  const id = useId();
  if (webMode) {
    return <p className="p-3 text-sm text-fg-subtle">{t.webNone}</p>;
  }
  return (
    <div className="p-3">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-fg-subtle">
          {t.label}
        </label>
        <div className="flex gap-1.5">
          {sample !== undefined && sample !== value && (
            <button type="button" onClick={() => onChange(sample)} disabled={disabled} className={`${btnGhost} !min-h-8 !px-2.5 !text-xs`}>
              <FileInput size={13} aria-hidden="true" />
              {t.useSample}
            </button>
          )}
          {value && (
            <button type="button" onClick={() => onChange("")} disabled={disabled} className={`${btnGhost} !min-h-8 !px-2.5 !text-xs`}>
              <Eraser size={13} aria-hidden="true" />
              {t.clear}
            </button>
          )}
        </div>
      </div>
      <textarea
        id={id}
        dir="ltr"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={rows}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        placeholder={t.placeholder}
        className={`block w-full resize-y rounded-lg border border-line bg-bg p-3 font-mono text-[13px] leading-relaxed text-fg placeholder:text-fg-subtle text-start ${focusRing}`}
      />
      <p className="mt-1.5 text-xs text-fg-subtle">{t.hint}</p>
    </div>
  );
}
