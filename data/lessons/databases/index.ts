import type { Lesson } from "../types";

/** Lesson registry fragment for the databases track: add `"databases/<node-id>": () => import("./<file>")`. */
export const databasesLessons: Record<string, () => Promise<{ lesson: Lesson }>> = {
  "databases/relational-sql-basics": () => import("./relational-sql-basics"),
  "databases/data-modeling-normalization": () => import("./data-modeling-normalization"),
  "databases/joins-aggregation": () => import("./joins-aggregation"),
};
