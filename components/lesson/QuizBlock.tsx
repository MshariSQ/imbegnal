"use client";

import { useState } from "react";
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import type { QuizSection } from "@/data/lessons/types";
import { useLang } from "@/lib/lang-context";

type QState = { picked: number[]; correct: boolean }; // every choice tried, in order

/**
 * Multiple-choice quiz with instant feedback: picking a choice grades it right
 * away. Wrong picks can be retried; the explanation shows once correct. The
 * score counts questions answered correctly on the first try.
 */
export default function QuizBlock({
  section,
  passed,
  onPass,
  onScore,
}: {
  section: QuizSection;
  passed: boolean;
  onPass: () => void;
  onScore?: (accuracy: number) => void;
}) {
  const { lang, tx } = useLang();
  const L = tx.lesson;
  const fresh = () => section.questions.map(() => ({ picked: [], correct: false }) as QState);
  const [state, setState] = useState<QState[]>(fresh);
  const [practice, setPractice] = useState(false); // re-taking after a pass

  const total = section.questions.length;
  const finished = state.every((s) => s.correct);
  const firstTry = state.filter((s) => s.correct && s.picked.length === 1).length;
  const showAsPassed = passed && !practice && !finished;

  function pick(qi: number, ci: number) {
    if (state[qi].correct || state[qi].picked.includes(ci)) return;
    const ok = ci === section.questions[qi].answer;
    const next = state.map((s, i) => (i === qi ? { picked: [...s.picked, ci], correct: ok } : s));
    setState(next);
    if (ok && next.every((s) => s.correct)) {
      const score = next.filter((s) => s.picked.length === 1).length / total;
      onScore?.(score);
      onPass();
    }
  }

  function retry() {
    setState(fresh());
    setPractice(true);
  }

  const done = finished || showAsPassed;

  return (
    <section className={`my-8 border rounded-2xl overflow-hidden ${done ? "border-emerald-500/40" : "border-line-strong"}`}>
      <div className={`px-5 py-3 flex items-center gap-2.5 ${done ? "bg-emerald-500/10" : "bg-surface"}`}>
        <HelpCircle size={15} className={done ? "text-emerald-400" : "text-purple-400"} />
        <span className="text-sm font-bold text-fg flex-1">{L.quizTitle}</span>
        {finished && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5" dir="ltr">
            {firstTry === total && <Trophy size={13} className="text-amber-400" />}
            {tx.quiz.score}: {firstTry}/{total}
          </span>
        )}
        {showAsPassed && <span className="text-xs font-semibold text-emerald-400">{L.quizDone}</span>}
      </div>

      <div className="p-5 space-y-8">
        {section.questions.map((q, qi) => {
          const s = state[qi];
          const solved = s.correct || showAsPassed;
          const lastWrong = !s.correct && s.picked.length > 0;
          return (
            <div key={qi}>
              <p className="text-xs text-fg-subtle mb-1.5">
                {L.questionOf.replace("{i}", String(qi + 1)).replace("{n}", String(total))}
              </p>
              <p className="text-[15px] font-semibold text-fg mb-3">{q.q[lang]}</p>
              <div className="space-y-2" role="group">
                {q.choices.map((c, ci) => {
                  const isAnswer = ci === q.answer;
                  const wasPicked = s.picked.includes(ci);
                  const showCorrect = solved && isAnswer;
                  const showWrong = wasPicked && !isAnswer;
                  return (
                    <button
                      key={ci}
                      disabled={solved || wasPicked}
                      onClick={() => pick(qi, ci)}
                      className={`w-full text-start px-4 py-3 rounded-xl border text-sm transition-all ${
                        showCorrect
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                          : showWrong
                          ? "border-red-500/60 bg-red-500/10 text-red-300"
                          : solved
                          ? "border-line text-fg-faint"
                          : "border-line-strong text-fg-soft hover:border-brand/60 hover:bg-brand/5 active:scale-[0.99]"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {showCorrect ? (
                          <CheckCircle2 size={16} className="shrink-0" />
                        ) : showWrong ? (
                          <XCircle size={16} className="shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-current opacity-50 shrink-0" />
                        )}
                        {c[lang]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {lastWrong && <p className="mt-3 text-sm text-red-400 animate-fade-in">{L.quizWrong}</p>}
              {s.correct && (
                <div className="mt-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-4 py-3 text-sm animate-fade-in">
                  <p className="text-emerald-400 font-semibold mb-1">{L.quizCorrect}</p>
                  <p className="text-fg-soft">
                    <strong className="text-fg">{L.quizExplain}</strong> {q.explain[lang]}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {(finished || showAsPassed) && (
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-line">
            <p className="text-sm text-fg-muted pt-4">{finished && firstTry === total ? tx.quiz.perfect : L.quizDone}</p>
            <button onClick={retry} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-fg-soft hover:text-fg px-3 py-2 rounded-lg border border-line hover:bg-fg/5">
              <RotateCcw size={14} /> {tx.quiz.retry}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
