import type { Lesson } from "../types";

/** Lesson registry fragment for the data-structures-algorithms track: add `"data-structures-algorithms/<node-id>": () => import("./<file>")`. */
export const dataStructuresAlgorithmsLessons: Record<string, () => Promise<{ lesson: Lesson }>> = {};
