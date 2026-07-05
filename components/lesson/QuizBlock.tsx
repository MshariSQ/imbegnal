"use client";

import { useState } from "react";
import { HelpCircle, CheckCircle2, XCircle } from "lucide-react";
import type { QuizSection } from "@/data/lessons/types";
import { useLang } from "@/lib/lang-context";

export default function QuizBlock({
  section,
  passed,
  onPass,
}: {
  section: QuizSection;
  passed: boolean;
  onPass: () => void;
}) {
  const { lang, tx } = useLang();
  const L = tx.lesson;

  // per-question: selected index and whether the submitted answer was correct
  const [selected, setSelected] = useState<(number | null)[]>(section.questions.map(() => null));
  const [answered, setAnswered] = useState<("correct" | "wrong" | null)[]>(section.questions.map(() => null));

  const allCorrect = passed || answered.every((a) => a === "correct");

  function submit(qi: number) {
    const sel = selected[qi];
    if (sel === null) return;
    const ok = sel === section.questions[qi].answer;
    const next = [...answered];
    next[qi] = ok ? "correct" : "wrong";
    setAnswered(next);
    if (ok && next.every((a) => a === "correct")) onPass();
  }

  return (
    <div className={`my-8 border rounded-2xl overflow-hidden ${allCorrect ? "border-emerald-500/40" : "border-[#30363d]"}`}>
      <div className={`px-5 py-3 flex items-center gap-2.5 ${allCorrect ? "bg-emerald-500/10" : "bg-[#161B22]"}`}>
        <HelpCircle size={15} className={allCorrect ? "text-emerald-400" : "text-purple-400"} />
        <span className="text-sm font-bold text-white flex-1">{L.quizTitle}</span>
        {allCorrect && <span className="text-xs font-semibold text-emerald-400">{L.quizDone}</span>}
      </div>

      <div className="p-5 space-y-8">
        {section.questions.map((q, qi) => {
          const state = passed ? "correct" : answered[qi];
          return (
            <div key={qi}>
              <p className="text-sm text-gray-500 mb-1.5">
                {L.questionOf.replace("{i}", String(qi + 1)).replace("{n}", String(section.questions.length))}
              </p>
              <p className="text-[15px] font-semibold text-white mb-3">{q.q[lang]}</p>
              <div className="space-y-2">
                {q.choices.map((c, ci) => {
                  const isSel = selected[qi] === ci;
                  const showCorrect = state === "correct" && ci === q.answer;
                  const showWrong = state === "wrong" && isSel;
                  return (
                    <button
                      key={ci}
                      disabled={state === "correct"}
                      onClick={() => {
                        const next = [...selected];
                        next[qi] = ci;
                        setSelected(next);
                        if (answered[qi] === "wrong") {
                          const a = [...answered];
                          a[qi] = null;
                          setAnswered(a);
                        }
                      }}
                      className={`w-full text-start px-4 py-2.5 rounded-xl border text-sm transition-all ${
                        showCorrect
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                          : showWrong
                          ? "border-red-500 bg-red-500/10 text-red-300"
                          : isSel
                          ? "border-emerald-500/60 bg-emerald-500/5 text-white"
                          : "border-[#30363d] text-gray-400 hover:border-gray-500 hover:text-gray-200"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {showCorrect && <CheckCircle2 size={15} className="shrink-0" />}
                        {showWrong && <XCircle size={15} className="shrink-0" />}
                        {c[lang]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {state === null && (
                <button
                  onClick={() => submit(qi)}
                  disabled={selected[qi] === null}
                  className="mt-3 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-all disabled:opacity-40"
                >
                  {L.quizCheck}
                </button>
              )}
              {state === "wrong" && <p className="mt-3 text-sm text-red-400">{L.quizWrong}</p>}
              {state === "correct" && (
                <div className="mt-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-4 py-3 text-sm">
                  <p className="text-emerald-400 font-semibold mb-1">{L.quizCorrect}</p>
                  <p className="text-gray-300">
                    <strong className="text-gray-200">{L.quizExplain}</strong> {q.explain[lang]}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
