import type { Lesson } from "../types";

/** Lesson registry fragment for the reverse-engineering track: add `"reverse-engineering/<node-id>": () => import("./<file>")`. */
export const reverseEngineeringLessons: Record<string, () => Promise<{ lesson: Lesson }>> = {};
