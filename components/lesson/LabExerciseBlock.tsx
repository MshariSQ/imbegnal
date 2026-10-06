"use client";

import { CheckCircle2, FlaskConical, ListChecks, Trophy } from "lucide-react";
import type { LabExerciseSection } from "@/data/lessons/types";
import { useLang } from "@/lib/lang-context";
import { useLabPassed } from "@/lib/lab-progress";
import { XP } from "@/lib/study-store";
import { codeLabHref } from "@/shared/links";
import { fmt, langLabel, TryInCodeLab } from "@/components/learn/PracticeLink";
import TextBlock from "./TextBlock";

const PREVIEW_LINES = 12;

/**
 * A graded exercise that lives in Code Lab: the lesson shows the task, the
 * visible tests and a starter preview; Code Lab runs and grades it. It never
 * gates lesson completion (most languages need the server runner).
 */
export default function LabExerciseBlock({
  section,
  trackId,
  lessonId,
  index,
}: {
  section: LabExerciseSection;
  trackId: string;
  lessonId: string;
  index: number;
}) {
  const { lang, tx } = useLang();
  const T = tx.curriculum;
  const ref = `${trackId}/${lessonId}/${section.id}`;
  const passed = useLabPassed(ref); // empty during SSR/hydration, then localStorage
  const href = codeLabHref({ kind: "exercise", ref });

  const lines = section.starterCode.replace(/\n+$/, "").split("\n");
  const preview = lines.slice(0, PREVIEW_LINES).join("\n");
  const hidden = lines.length - PREVIEW_LINES;
  const example = section.tests[0];

  return (
    <section
      aria-labelledby={`lab-${section.id}`}
      className={`my-8 border rounded-2xl overflow-hidden ${passed ? "border-emerald-500/40" : "border-line-strong"}`}
    >
      <div className={`px-5 py-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 ${passed ? "bg-emerald-500/10" : "bg-surface"}`}>
        <FlaskConical size={16} className={passed ? "text-emerald-400" : "text-purple-400"} aria-hidden />
        <h3 id={`lab-${section.id}`} className="text-sm font-bold text-fg">
          {fmt(T.labExercise, { n: index })}
        </h3>
        <span dir="ltr" className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-line text-fg-muted">
          {langLabel(section.lang)}
        </span>
        <span className="text-[11px] text-fg-subtle">{T.labGraded}</span>
        {passed && (
          <span className="ms-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
            <CheckCircle2 size={14} aria-hidden /> {T.labPassedBadge}
          </span>
        )}
      </div>

      <div className="p-5">
        <TextBlock body={section.prompt} />

        <div className="grid md:grid-cols-2 gap-5 mt-5">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-fg-subtle mb-2">
              <ListChecks size={13} aria-hidden /> {T.labTests} · {fmt(T.labTestsCount, { n: section.tests.length })}
            </div>
            <ul className="space-y-1.5 text-sm text-fg-soft">
              {section.tests.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 rounded-full bg-fg-faint shrink-0" aria-hidden />
                  {t.name[lang]}
                </li>
              ))}
            </ul>
            {example && (
              <details className="mt-3 group">
                <summary className="cursor-pointer min-h-10 inline-flex items-center text-xs font-semibold text-emerald-400 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">
                  {T.labExample}
                </summary>
                <dl dir="ltr" className="mt-2 grid gap-2 text-start">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-fg-subtle">{T.labInput}</dt>
                    <dd>
                      <pre className="bg-surface border border-line rounded-lg p-3 text-[12.5px] font-mono text-fg-soft overflow-x-auto whitespace-pre">
                        {example.stdin?.trimEnd() || T.labNoInput}
                      </pre>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-fg-subtle">{T.labExpected}</dt>
                    <dd>
                      <pre className="bg-surface border border-line rounded-lg p-3 text-[12.5px] font-mono text-fg-soft overflow-x-auto whitespace-pre">
                        {example.expected.trimEnd() || T.labNoInput}
                      </pre>
                    </dd>
                  </div>
                </dl>
              </details>
            )}
          </div>

          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-widest text-fg-subtle mb-2">{T.labStarter}</div>
            <pre dir="ltr" className="bg-surface border border-line rounded-xl p-3.5 text-[12.5px] leading-relaxed font-mono text-fg-soft overflow-x-auto text-start whitespace-pre" tabIndex={0} aria-label={T.labStarter}>
              {preview}
            </pre>
            {hidden > 0 && <p className="text-xs text-fg-subtle mt-1.5">{fmt(T.labStarterMore, { n: hidden })}</p>}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <TryInCodeLab href={href} />
          <p className="text-xs text-fg-subtle max-w-md">{T.labHintsNote} {T.labOptional}</p>
        </div>
        {!passed && <p className="text-xs text-fg-subtle mt-3 max-w-2xl">{T.labSignInNote}</p>}

        {passed && (
          <div role="status" className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <Trophy size={15} aria-hidden /> {fmt(T.labXpEarned, { n: XP.exercise })}
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer min-h-10 inline-flex items-center text-xs font-semibold text-fg-soft rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">
                {T.labSolution}
              </summary>
              <p className="text-xs text-fg-subtle mt-1 mb-2">{T.labSolutionNote}</p>
              <pre dir="ltr" className="bg-surface border border-line rounded-xl p-4 overflow-x-auto text-start" tabIndex={0} aria-label={T.labSolution}>
                <code className="font-mono text-[13px] text-fg-soft whitespace-pre">{section.solution}</code>
              </pre>
            </details>
          </div>
        )}
      </div>
    </section>
  );
}
