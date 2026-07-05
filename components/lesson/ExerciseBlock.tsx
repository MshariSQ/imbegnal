"use client";

import { useState } from "react";
import { Dumbbell, Lightbulb, Eye, EyeOff, RotateCcw, CheckCircle2, XCircle, Lock } from "lucide-react";
import type { ExerciseSection } from "@/data/lessons/types";
import type { TestResult } from "@/lib/runner/web-sandbox";
import { useLang } from "@/lib/lang-context";
import CodeRunner from "./CodeRunner";

export default function ExerciseBlock({
  section,
  index,
  passed,
  onPass,
}: {
  section: ExerciseSection;
  index: number;
  passed: boolean;
  onPass: () => void;
}) {
  const { lang, tx } = useLang();
  const L = tx.lesson;

  const [code, setCode] = useState(section.starterCode);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [failedChecks, setFailedChecks] = useState(0);
  const [hintsShown, setHintsShown] = useState(0);
  const [solutionOpen, setSolutionOpen] = useState(false);

  const solutionUnlocked = failedChecks >= 2 || passed;
  const allPassed = passed || (results !== null && results.length > 0 && results.every((r) => r.pass));

  function handleCheck(ok: boolean, res: TestResult[]) {
    setResults(res);
    if (ok) {
      onPass();
    } else {
      setFailedChecks((n) => n + 1);
    }
  }

  return (
    <div className={`my-8 border rounded-2xl overflow-hidden ${allPassed ? "border-emerald-500/40" : "border-[#30363d]"}`}>
      <div className={`px-5 py-3 flex items-center gap-2.5 ${allPassed ? "bg-emerald-500/10" : "bg-[#161B22]"}`}>
        <Dumbbell size={15} className={allPassed ? "text-emerald-400" : "text-blue-400"} />
        <span className="text-sm font-bold text-white flex-1">
          {lang === "ar" ? `تمرين ${index}` : `Exercise ${index}`}
        </span>
        {allPassed && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={13} /> {L.testsPassed}
          </span>
        )}
      </div>

      <div className="p-5">
        <p className="text-[15px] leading-relaxed text-gray-300 mb-4">{section.prompt[lang]}</p>

        <CodeRunner
          lang={section.lang}
          value={code}
          onChange={setCode}
          tests={section.tests}
          onCheck={handleCheck}
        />

        {/* Test checklist */}
        {results !== null && (
          <div className="mt-4 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">{L.tests}</div>
            {section.tests.map((t, i) => {
              const r = results.find((x) => x.i === i);
              const pass = r?.pass ?? false;
              return (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {pass ? (
                    <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                  )}
                  <span className={pass ? "text-gray-300" : "text-red-300"}>
                    {t.name[lang]}
                    {r?.error && r.error !== "timeout" && (
                      <span dir="ltr" className="text-gray-600 text-xs ms-2 font-mono">({r.error})</span>
                    )}
                  </span>
                </div>
              );
            })}
            {!allPassed && <p className="text-xs text-amber-400 pt-1">{L.testsFailed}</p>}
          </div>
        )}

        {/* Hints + solution + reset */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {hintsShown < section.hints.length && (
            <button
              onClick={() => setHintsShown((n) => n + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all"
            >
              <Lightbulb size={12} /> {L.showHint} ({hintsShown}/{section.hints.length})
            </button>
          )}
          <button
            onClick={() => (solutionUnlocked ? setSolutionOpen((v) => !v) : undefined)}
            disabled={!solutionUnlocked}
            title={solutionUnlocked ? undefined : L.solutionLocked}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              solutionUnlocked
                ? "border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                : "border-[#30363d] text-gray-600 cursor-not-allowed"
            }`}
          >
            {solutionUnlocked ? (solutionOpen ? <EyeOff size={12} /> : <Eye size={12} />) : <Lock size={12} />}
            {solutionOpen ? L.hideSolution : L.showSolution}
          </button>
          <button
            onClick={() => { setCode(section.starterCode); setResults(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#30363d] text-gray-500 hover:text-gray-300 transition-all"
          >
            <RotateCcw size={12} /> {L.resetCode}
          </button>
        </div>

        {hintsShown > 0 && (
          <div className="mt-3 space-y-2">
            {section.hints.slice(0, hintsShown).map((h, i) => (
              <div key={i} className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2 text-sm text-amber-200/90">
                <Lightbulb size={13} className="text-amber-400 mt-0.5 shrink-0" />
                <span><strong className="text-amber-300">{L.hint} {i + 1}:</strong> {h[lang]}</span>
              </div>
            ))}
          </div>
        )}

        {solutionOpen && solutionUnlocked && (
          <div className="mt-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-2">{L.solution}</div>
            <pre dir="ltr" className="bg-[#161B22] border border-purple-500/20 rounded-xl p-4 overflow-x-auto text-start">
              <code className="font-mono text-[13px] text-gray-200 whitespace-pre">{section.solution}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
