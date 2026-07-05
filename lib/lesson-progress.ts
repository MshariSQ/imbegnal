export interface LessonProgress {
  ex: number[]; // section indexes of passed exercises
  quiz: number[]; // section indexes of passed quizzes
  done?: 1;
}

const key = (roadmapId: string, nodeId: string) => `sf-lesson:${roadmapId}:${nodeId}`;

export function getLessonProgress(roadmapId: string, nodeId: string): LessonProgress {
  if (typeof window === "undefined") return { ex: [], quiz: [] };
  try {
    const raw = localStorage.getItem(key(roadmapId, nodeId));
    if (!raw) return { ex: [], quiz: [] };
    const p = JSON.parse(raw) as LessonProgress;
    return { ex: p.ex ?? [], quiz: p.quiz ?? [], done: p.done };
  } catch {
    return { ex: [], quiz: [] };
  }
}

export function saveLessonProgress(roadmapId: string, nodeId: string, p: LessonProgress): void {
  try {
    localStorage.setItem(key(roadmapId, nodeId), JSON.stringify(p));
  } catch {
    // storage full or blocked — progress just won't persist
  }
}

export function markSectionPassed(
  roadmapId: string,
  nodeId: string,
  kind: "ex" | "quiz",
  sectionIndex: number
): LessonProgress {
  const p = getLessonProgress(roadmapId, nodeId);
  if (!p[kind].includes(sectionIndex)) p[kind] = [...p[kind], sectionIndex];
  saveLessonProgress(roadmapId, nodeId, p);
  return p;
}

export function markLessonDone(roadmapId: string, nodeId: string): void {
  const p = getLessonProgress(roadmapId, nodeId);
  p.done = 1;
  saveLessonProgress(roadmapId, nodeId, p);
}
