"use client";

import { useState, useMemo, useRef, useSyncExternalStore } from "react";
import { Clock, PartyPopper } from "lucide-react";
import type { Lesson } from "@/data/lessons/types";
import { getLessonProgress, markSectionPassed, markLessonDone, parseLessonProgress, readLessonProgressRaw, subscribeLessonProgress, type LessonProgress } from "@/lib/lesson-progress";
import { useLang } from "@/lib/lang-context";
import TextBlock from "./TextBlock";
import CodeDemo from "./CodeDemo";
import ExerciseBlock from "./ExerciseBlock";
import QuizBlock from "./QuizBlock";

/** DOM id of a lesson section — used by the "On this page" outline. */
export const sectionId = (i: number) => `sec-${i}`;

// NOTE: rendered with key={nodeId} so the whole view (and its state) remounts
// per lesson. Progress lives in localStorage and is read through
// useSyncExternalStore: empty during SSR/hydration, then the stored value.
export default function LessonView({
  lesson,
  roadmapId,
  onLessonComplete,
  onSectionPassed,
  onQuizScore,
  hideHeader = false,
}: {
  lesson: Lesson;
  roadmapId: string;
  onLessonComplete: () => void;
  /** Fired once per exercise/quiz the first time it is passed (for XP). */
  onSectionPassed?: (kind: "ex" | "quiz") => void;
  /** First-try accuracy (0..1) each time a quiz is completed. */
  onQuizScore?: (accuracy: number) => void;
  hideHeader?: boolean;
}) {
  const { tx } = useLang();
  const L = tx.lesson;

  const rawProgress = useSyncExternalStore(
    subscribeLessonProgress,
    () => readLessonProgressRaw(roadmapId, lesson.nodeId),
    () => ""
  );
  const progress = useMemo(() => parseLessonProgress(rawProgress), [rawProgress]);
  const [justCompleted, setJustCompleted] = useState(false);
  const completeFiredRef = useRef(false);

  const gateIndexes = useMemo(() => {
    const ex: number[] = [];
    const quiz: number[] = [];
    lesson.sections.forEach((s, i) => {
      if (s.type === "exercise" && s.tests.length > 0) ex.push(i);
      if (s.type === "quiz") quiz.push(i);
    });
    return { ex, quiz };
  }, [lesson]);

  const exerciseNumbers = useMemo(() => {
    const nums = new Map<number, number>();
    let n = 0;
    lesson.sections.forEach((s, i) => {
      if (s.type === "exercise") nums.set(i, ++n);
    });
    return nums;
  }, [lesson]);

  function checkCompletion(p: LessonProgress) {
    const allEx = gateIndexes.ex.every((i) => p.ex.includes(i));
    const allQuiz = gateIndexes.quiz.every((i) => p.quiz.includes(i));
    if (allEx && allQuiz && !completeFiredRef.current) {
      completeFiredRef.current = true;
      if (getLessonProgress(roadmapId, lesson.nodeId).done) return; // finished in an earlier visit
      markLessonDone(roadmapId, lesson.nodeId);
      setJustCompleted(true);
      onLessonComplete();
    }
  }

  function handlePass(kind: "ex" | "quiz", sectionIndex: number) {
    const firstTime = !getLessonProgress(roadmapId, lesson.nodeId)[kind].includes(sectionIndex);
    const p = markSectionPassed(roadmapId, lesson.nodeId, kind, sectionIndex);
    if (firstTime) onSectionPassed?.(kind);
    checkCompletion(p);
  }

  const totalGates = gateIndexes.ex.length + gateIndexes.quiz.length;
  const passedGates =
    gateIndexes.ex.filter((i) => progress.ex.includes(i)).length +
    gateIndexes.quiz.filter((i) => progress.quiz.includes(i)).length;

  return (
    <div>
      {!hideHeader && (
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-fg-subtle">
            <Clock size={12} /> {lesson.estMinutes} {L.estMinutes}
          </span>
          {totalGates > 0 && (
            <span className="text-xs text-fg-subtle">
              {L.lessonProgress}: <span className="text-emerald-400 font-semibold">{passedGates}/{totalGates}</span>
            </span>
          )}
        </div>
      )}

      {justCompleted && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-4 mb-6 animate-fade-up">
          <PartyPopper size={20} className="text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-300 font-semibold">{L.lessonComplete}</p>
        </div>
      )}

      {lesson.sections.map((section, i) => {
        const id = sectionId(i);
        switch (section.type) {
          case "text":
            return (
              <div key={i} id={id} className="scroll-mt-32">
                <TextBlock body={section.body} />
              </div>
            );
          case "code-demo":
            return (
              <div key={i} id={id} className="scroll-mt-32">
                <CodeDemo section={section} />
              </div>
            );
          case "exercise":
            return (
              <div key={i} id={id} className="scroll-mt-32">
                <ExerciseBlock
                  section={section}
                  index={exerciseNumbers.get(i) ?? 1}
                  passed={progress.ex.includes(i)}
                  onPass={() => handlePass("ex", i)}
                />
              </div>
            );
          case "lab":
            return null; // rendered by the curriculum workstream (LabExerciseBlock)
          case "quiz":
            return (
              <div key={i} id={id} className="scroll-mt-32">
                <QuizBlock
                  section={section}
                  passed={progress.quiz.includes(i)}
                  onPass={() => handlePass("quiz", i)}
                  onScore={onQuizScore}
                />
              </div>
            );
        }
      })}
    </div>
  );
}
