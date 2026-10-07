// A D1 look-alike over node:sqlite, with the REAL migrations applied in order.
// (A2a ships the same idea as worker/tests/helpers/d1.ts; this private copy keeps the Challenges
// tests self-contained until both branches are merged.)
//
// Migration 0004 (Code Lab: roles, lab_runs, audit_log…) belongs to another branch. When this
// tree does not have it yet, the schema from the shared brief is applied in its place so the
// 0005/0006 migrations are exercised on top of the real column set.
import { createRequire } from "node:module";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface SqliteStatement {
  all(...params: unknown[]): Record<string, unknown>[];
  get(...params: unknown[]): Record<string, unknown> | undefined;
  run(...params: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  setReturnArrays?(enabled: boolean): void;
}
interface SqliteDb {
  exec(sql: string): void;
  prepare(sql: string): SqliteStatement;
  close(): void;
}
const { DatabaseSync } = createRequire(import.meta.url)("node:sqlite") as { DatabaseSync: new (path: string) => SqliteDb };

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "../../../migrations");

/** The code-lab schema from the shared brief (stand-in for worker/migrations/0004_code_lab.sql). */
const FALLBACK_0004 = `
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student';
ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE users ADD COLUMN suspended_until DATETIME;
CREATE TABLE lab_runs (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, ref_kind TEXT NOT NULL,
  track TEXT, lesson TEXT, exercise TEXT, challenge_id TEXT, lang TEXT NOT NULL, status TEXT NOT NULL,
  exit_code INTEGER, run_ms INTEGER, compile_ms INTEGER, stdout_bytes INTEGER, stderr_bytes INTEGER,
  success INTEGER NOT NULL DEFAULT 0, passed INTEGER, first_error TEXT,
  code TEXT, stdin TEXT, stdout TEXT, stderr TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE lab_usage (user_id TEXT NOT NULL, day TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (user_id, day));
CREATE TABLE lab_snippets (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, lang TEXT NOT NULL, code TEXT NOT NULL, stdin TEXT NOT NULL DEFAULT '', title TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE lab_progress (user_id TEXT NOT NULL, ref TEXT NOT NULL, passed_at DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, ref));
CREATE TABLE audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, at DATETIME DEFAULT CURRENT_TIMESTAMP, user_id TEXT, action TEXT NOT NULL, detail TEXT NOT NULL);
CREATE TABLE abuse_signals (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, kind TEXT NOT NULL, detail TEXT, at DATETIME DEFAULT CURRENT_TIMESTAMP);
`;

export function applyMigrations(db: SqliteDb): void {
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort();
  const hasLab = files.some((f) => f.startsWith("0004_"));
  let fallbackApplied = hasLab;
  for (const f of files) {
    if (!fallbackApplied && f >= "0005") {
      db.exec(FALLBACK_0004);
      fallbackApplied = true;
    }
    db.exec(readFileSync(join(MIGRATIONS_DIR, f), "utf8"));
  }
  if (!fallbackApplied) db.exec(FALLBACK_0004);
}

type Param = string | number | null;

function checkParams(params: unknown[]): Param[] {
  return params.map((p) => {
    if (p === undefined) throw new Error("D1 shim: undefined bind parameter");
    if (typeof p === "boolean") throw new Error("D1 shim: boolean bind parameter (D1 rejects these too)");
    return p as Param;
  });
}

export interface ShimMeta {
  changes: number;
  last_row_id: number;
  duration: number;
}

export class Stmt {
  constructor(
    private readonly db: SqliteDb,
    readonly sql: string,
    private readonly params: Param[] = [],
  ) {}

  bind(...params: unknown[]): Stmt {
    return new Stmt(this.db, this.sql, checkParams(params));
  }

  async first<T = Record<string, unknown>>(column?: string): Promise<T | null> {
    await Promise.resolve(); // yield, so concurrent requests interleave like on D1
    const row = this.db.prepare(this.sql).get(...this.params);
    if (!row) return null;
    return (column === undefined ? row : row[column]) as T;
  }

  async all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: true; meta: ShimMeta }> {
    await Promise.resolve();
    const results = this.db.prepare(this.sql).all(...this.params) as T[];
    return { results, success: true, meta: { changes: 0, last_row_id: 0, duration: 0 } };
  }

  async run(): Promise<{ results: never[]; success: true; meta: ShimMeta }> {
    await Promise.resolve();
    return this.runSync();
  }

  runSync(): { results: never[]; success: true; meta: ShimMeta } {
    const r = this.db.prepare(this.sql).run(...this.params);
    return { results: [], success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid), duration: 0 } };
  }

  async raw<T = unknown[]>(): Promise<T[]> {
    await Promise.resolve();
    const stmt = this.db.prepare(this.sql);
    stmt.setReturnArrays?.(true);
    return stmt.all(...this.params) as unknown as T[];
  }
}

export class D1Shim {
  readonly sqlite: SqliteDb;

  constructor() {
    this.sqlite = new DatabaseSync(":memory:");
    applyMigrations(this.sqlite);
  }

  prepare(sql: string): Stmt {
    return new Stmt(this.sqlite, sql);
  }

  /** Runs the statements in one transaction, like D1's batch(). */
  async batch(stmts: Stmt[]): Promise<{ results: never[]; success: true; meta: ShimMeta }[]> {
    await Promise.resolve();
    this.sqlite.exec("BEGIN");
    try {
      const out = stmts.map((s) => s.runSync());
      this.sqlite.exec("COMMIT");
      return out;
    } catch (e) {
      this.sqlite.exec("ROLLBACK");
      throw e;
    }
  }

  /** Test convenience: run raw SQL (seeding). */
  exec(sql: string): void {
    this.sqlite.exec(sql);
  }

  /** Test convenience: synchronous query. */
  rows<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] {
    return this.sqlite.prepare(sql).all(...checkParams(params)) as T[];
  }

  one<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T | undefined {
    return this.sqlite.prepare(sql).get(...checkParams(params)) as T | undefined;
  }

  insert(sql: string, ...params: unknown[]): void {
    this.sqlite.prepare(sql).run(...checkParams(params));
  }
}
