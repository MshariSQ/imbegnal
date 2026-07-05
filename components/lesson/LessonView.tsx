"use client";

import { useState, useMemo, useRef } from "react";
import { Clock, PartyPopper } from "lucide-react";
import type { Lesson } from "@/data/lessons/types";
import { getLessonProgress, markSectionPassed, markLessonDone, type LessonProgress } from "@/lib/lesson-progress";
import { useLang } from "@/lib/lang-context";
import TextBlock from "./TextBlock";
import CodeDemo from "./CodeDemo";
import ExerciseBlock from "./ExerciseBlock";
import QuizBlock from "./QuizBlock";

// NOTE: rendered with key={nodeId} so the whole view (and its state) remounts
// per lesson — progress can therefore be initialized lazily from localStorage.
export default function LessonView({
  lesson,
  roadmapId,
  onLessonComplete,
}: {
  lesson: Lesson;
  roadmapId: string;
  onLessonComplete: () => void;
}) {
  const { tx } = useLang();
  const L = tx.lesson;

  const [progress, setProgress] = useState<LessonProgress>(() =>
    getLessonProgress(roadmapId, lesson.nodeId)
  );
  const [justCompleted, setJustCompleted] = useState(false);
  const completeFiredRef = useRef(!!progress.done);

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
      markLessonDone(roadmapId, lesson.nodeId);
      setJustCompleted(true);
      onLessonComplete();
    }
  }

  function handleExercisePass(sectionIndex: number) {
    const p = markSectionPassed(roadmapId, lesson.nodeId, "ex", sectionIndex);
    setProgress(p);
    checkCompletion(p);
  }

  function handleQuizPass(sectionIndex: number) {
    const p = markSectionPassed(roadmapId, lesson.nodeId, "quiz", sectionIndex);
    setProgress(p);
    checkCompletion(p);
  }

  const totalGates = gateIndexes.ex.length + gateIndexes.quiz.length;
  const passedGates =
    gateIndexes.ex.filter((i) => progress.ex.includes(i)).length +
    gateIndexes.quiz.filter((i) => progress.quiz.includes(i)).length;

  return (
    <div className="max-w-3xl">
      {/* Lesson header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={12} /> {lesson.estMinutes} {L.estMinutes}
        </span>
        {totalGates > 0 && (
          <span className="text-xs text-gray-500">
            {L.lessonProgress}: <span className="text-emerald-400 font-semibold">{passedGates}/{totalGates}</span>
          </span>
        )}
      </div>

      {justCompleted && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-4 mb-6">
          <PartyPopper size={20} className="text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-300 font-semibold">{L.lessonComplete}</p>
        </div>
      )}

      {lesson.sections.map((section, i) => {
        switch (section.type) {
          case "text":
            return <TextBlock key={i} body={section.body} />;
          case "code-demo":
            return <CodeDemo key={i} section={section} />;
          case "exercise":
            return (
              <ExerciseBlock
                key={i}
                section={section}
                index={exerciseNumbers.get(i) ?? 1}
                passed={progress.ex.includes(i)}
                onPass={() => handleExercisePass(i)}
              />
            );
          case "quiz":
            return (
              <QuizBlock
                key={i}
                section={section}
                passed={progress.quiz.includes(i)}
                onPass={() => handleQuizPass(i)}
              />
            );
        }
      })}
    </div>
  );
}
