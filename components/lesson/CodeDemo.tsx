"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import type { CodeDemoSection } from "@/data/lessons/types";
import { useLang } from "@/lib/lang-context";
import CodeRunner from "./CodeRunnerLazy";
import TextBlock from "./TextBlock";

export default function CodeDemo({ section }: { section: CodeDemoSection }) {
  const { tx } = useLang();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(section.code);
  const runnable = section.runnable !== false;

  return (
    <div className="my-6">
      <div className="mb-3"><TextBlock body={section.explanation} /></div>
      {open && runnable ? (
        <CodeRunner lang={section.lang} value={code} onChange={setCode} tests={[]} />
      ) : (
        <div className="border border-line rounded-xl overflow-hidden">
          <pre dir="ltr" className="bg-surface p-4 overflow-x-auto text-start">
            <code className="font-mono text-[13px] text-fg-soft whitespace-pre">{section.code}</code>
          </pre>
          {runnable && (
            <button
              onClick={() => setOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border-t border-line transition-all"
            >
              <FlaskConical size={13} /> {tx.lesson.tryIt}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
