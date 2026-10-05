import type { Lesson } from "../types";

/** Lesson registry fragment for the operating-systems track: add `"operating-systems/<node-id>": () => import("./<file>")`. */
export const operatingSystemsLessons: Record<string, () => Promise<{ lesson: Lesson }>> = {};
