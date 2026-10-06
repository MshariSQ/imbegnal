"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { SampleCode } from "@/data/curricula";
import CodeRunner from "@/components/lesson/CodeRunnerLazy";
import { useLang } from "@/lib/lang-context";
import { codeLabHref } from "@/shared/links";
import { OpenInCodeLab, langLabel } from "./PracticeLink";

/**
 * The course's runnable example: editable code run by the existing in-browser
 * runners (JavaScript sandbox / Pyodide). Only languages the browser can run
 * are ever configured; anything else renders as a plain read-only listing.
 */
export default function PracticeSample({ sample }: { sample: SampleCode }) {
  const { tx, lang } = useLang();
  const T = tx.curriculum;
  const [code, setCode] = useState(sample.code);
  const runnerLang = sample.lang === "python" ? "python" : sample.lang === "javascript" ? "js" : null;

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-line flex flex-wrap items-center gap-x-3 gap-y-2 bg-surface-2/50">
        <Play size={16} className="text-emerald-400 rtl-flip" aria-hidden />
        <p className="text-sm text-fg-muted flex-1 min-w-[12rem]">{T.sampleIntro}</p>
        <span dir="ltr" className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-line text-fg-muted">{langLabel(sample.lang)}</span>
      </div>
      <div className="p-5">
        <p className="text-sm text-fg-soft mb-4 leading-relaxed">{sample.caption[lang]}</p>
        {runnerLang ? (
          <CodeRunner lang={runnerLang} value={code} onChange={setCode} tests={[]} editorHeight="260px" />
        ) : (
          <pre dir="ltr" className="bg-surface border border-line rounded-xl p-4 overflow-x-auto text-start" tabIndex={0}>
            <code className="font-mono text-[13px] text-fg-soft whitespace-pre">{sample.code}</code>
          </pre>
        )}
        <div className="mt-4 flex justify-end">
          <OpenInCodeLab href={codeLabHref({ kind: "blank", lang: sample.lang })} />
        </div>
      </div>
    </div>
  );
}
