// A D1Database look-alike over node:sqlite, with the REAL migrations applied in
// order. Handlers run against it unchanged, so the SQL (RETURNING, conditional
// INSERT ... SELECT, ON CONFLICT, datetime('now', ...)) is exercised for real.
//
// Mirrors the D1 surface the Worker uses: prepare().bind().first()/all()/run()/raw(),
// batch() (atomic), exec(). Like D1, bound values must be string | number | null
// (booleans and undefined are rejected) and foreign keys are enforced.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "migrations");

type Bindable = string | number | null;

interface Meta {
  changes: number;
  last_row_id: number;
  duration: number;
}

export interface D1Result<T> {
  success: true;
  results: T[];
  meta: Meta;
}

/** node:sqlite rows have a null prototype; D1 rows are plain objects. */
const plain = <T>(rows: Record<string, unknown>[]): T[] => rows.map((r) => ({ ...r }) as T);

const returnsRows = (sql: string) => /^\s*(SELECT|WITH|PRAGMA)\b/i.test(sql) || /\bRETURNING\b/i.test(sql);

export class TestStatement {
  constructor(
    private readonly db: DatabaseSync,
    readonly sql: string,
    private readonly params: Bindable[] = [],
  ) {}

  bind(...values: unknown[]): TestStatement {
    for (const v of values) {
      if (v !== null && typeof v !== "string" && typeof v !== "number") throw new TypeError(`D1_TYPE_ERROR: cannot bind ${typeof v}`);
    }
    return new TestStatement(this.db, this.sql, values as Bindable[]);
  }

  private rows(): Record<string, unknown>[] {
    return plain<Record<string, unknown>>(this.db.prepare(this.sql).all(...this.params));
  }

  async first<T = Record<string, unknown>>(column?: string): Promise<T | null> {
    const rows = this.rows();
    const row = rows[0];
    if (!row) return null;
    return (column ? row[column] : row) as T;
  }

  async all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    return this.runSync<T>();
  }

  async run(): Promise<D1Result<never>> {
    return this.runSync<never>();
  }

  async raw<T = unknown[]>(): Promise<T[]> {
    return this.rows().map((r) => Object.values(r)) as T[];
  }

  /** Used by batch(): synchronous so a batch is one uninterrupted transaction. */
  runSync<T>(): D1Result<T> {
    const stmt = this.db.prepare(this.sql);
    if (returnsRows(this.sql)) {
      const results = plain<T>(stmt.all(...this.params));
      return { success: true, results, meta: { changes: 0, last_row_id: 0, duration: 0 } };
    }
    const info = stmt.run(...this.params);
    return { success: true, results: [], meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid), duration: 0 } };
  }
}

export class TestD1 {
  readonly sqlite: DatabaseSync;

  constructor(migrations: string[] | "all" = "all") {
    this.sqlite = new DatabaseSync(":memory:");
    this.sqlite.exec("PRAGMA foreign_keys = ON");
    applyMigrations(this.sqlite, migrations);
  }

  prepare(sql: string): TestStatement {
    return new TestStatement(this.sqlite, sql);
  }

  async batch(statements: TestStatement[]): Promise<D1Result<unknown>[]> {
    this.sqlite.exec("BEGIN");
    try {
      const out = statements.map((s) => s.runSync<unknown>());
      this.sqlite.exec("COMMIT");
      return out;
    } catch (e) {
      this.sqlite.exec("ROLLBACK");
      throw e;
    }
  }

  async exec(sql: string): Promise<void> {
    this.sqlite.exec(sql);
  }

  /** Test convenience: synchronous query. */
  query<T = Record<string, unknown>>(sql: string, ...params: Bindable[]): T[] {
    return plain<T>(this.sqlite.prepare(sql).all(...params));
  }

  /** Test convenience: synchronous statement. */
  execute(sql: string, ...params: Bindable[]): void {
    this.sqlite.prepare(sql).run(...params);
  }
}

export function listMigrations(): string[] {
  return readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
}

/** Applies migrations in filename order. `files` limits which ones ("all" = every file). */
export function applyMigrations(db: DatabaseSync, files: string[] | "all" = "all"): void {
  const names = files === "all" ? listMigrations() : files;
  for (const name of names) db.exec(readFileSync(join(MIGRATIONS_DIR, name), "utf8"));
}
