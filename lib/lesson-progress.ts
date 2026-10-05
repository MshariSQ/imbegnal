export interface LessonProgress {
  ex: number[]; // section indexes of passed exercises
  quiz: number[]; // section indexes of passed quizzes
  done?: 1;
}

const key = (roadmapId: string, nodeId: string) => `sf-lesson:${roadmapId}:${nodeId}`;

const listeners = new Set<() => void>();

/** For useSyncExternalStore — re-renders subscribers whenever progress is saved. */
export function subscribeLessonProgress(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Raw stored string ("" when none) — a stable primitive snapshot. */
export function readLessonProgressRaw(roadmapId: string, nodeId: string): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(key(roadmapId, nodeId)) ?? "";
  } catch {
    return "";
  }
}

export function parseLessonProgress(raw: string): LessonProgress {
  if (!raw) return { ex: [], quiz: [] };
  try {
    const p = JSON.parse(raw) as LessonProgress;
    return { ex: p.ex ?? [], quiz: p.quiz ?? [], done: p.done };
  } catch {
    return { ex: [], quiz: [] };
  }
}

export function getLessonProgress(roadmapId: string, nodeId: string): LessonProgress {
  return parseLessonProgress(readLessonProgressRaw(roadmapId, nodeId));
}

export function saveLessonProgress(roadmapId: string, nodeId: string, p: LessonProgress): void {
  try {
    localStorage.setItem(key(roadmapId, nodeId), JSON.stringify(p));
  } catch {
    // storage full or blocked — progress just won't persist
  }
  listeners.forEach((l) => l());
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
