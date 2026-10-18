import type { Lesson } from "../types";

/** Lesson registry fragment for the databases track: add `"databases/<node-id>": () => import("./<file>")`. */
export const databasesLessons: Record<string, () => Promise<{ lesson: Lesson }>> = {
  "databases/relational-sql-basics": () => import("./relational-sql-basics"),
  "databases/data-modeling-normalization": () => import("./data-modeling-normalization"),
  "databases/joins-aggregation": () => import("./joins-aggregation"),
  "databases/indexes-performance": () => import("./indexes-performance"),
  "databases/transactions-acid": () => import("./transactions-acid"),
  "databases/nosql-models": () => import("./nosql-models"),
  "databases/backup-replication": () => import("./backup-replication"),
  "databases/db-security": () => import("./db-security"),
};
