import type { Lesson } from "../types";

/** Lesson registry fragment for the data-structures-algorithms track: add `"data-structures-algorithms/<node-id>": () => import("./<file>")`. */
export const dataStructuresAlgorithmsLessons: Record<string, () => Promise<{ lesson: Lesson }>> = {
  "data-structures-algorithms/complexity-big-o": () => import("./complexity-big-o"),
  "data-structures-algorithms/arrays-hashing": () => import("./arrays-hashing"),
  "data-structures-algorithms/sorting-searching": () => import("./sorting-searching"),
  "data-structures-algorithms/trees-graphs": () => import("./trees-graphs"),
};
