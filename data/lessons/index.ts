import type { Lesson } from "./types";

const registry: Record<string, () => Promise<{ lesson: Lesson }>> = {
  "frontend/html-css": () => import("./frontend/html-css"),
  "frontend/javascript": () => import("./frontend/javascript"),
  "frontend/git": () => import("./frontend/git"),
  "frontend/react": () => import("./frontend/react"),
  "frontend/typescript": () => import("./frontend/typescript"),
  "frontend/css-frameworks": () => import("./frontend/css-frameworks"),
  "frontend/nextjs": () => import("./frontend/nextjs"),
  "frontend/frontend-testing": () => import("./frontend/frontend-testing"),
  "frontend/getting-paid": () => import("./frontend/getting-paid"),
};

export function hasLesson(roadmapId: string, nodeId: string): boolean {
  return `${roadmapId}/${nodeId}` in registry;
}

export async function loadLesson(roadmapId: string, nodeId: string): Promise<Lesson | null> {
  const loader = registry[`${roadmapId}/${nodeId}`];
  if (!loader) return null;
  const mod = await loader();
  return mod.lesson;
}
