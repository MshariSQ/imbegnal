// Minimal typings for the part of node:sqlite the D1 test shim uses
// (@types/node 20 predates the module; the runtime is Node >= 22.13).
declare module "node:sqlite" {
  type SqlValue = string | number | bigint | null | Uint8Array;
  interface StatementResultingChanges {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  }
  class StatementSync {
    run(...params: SqlValue[]): StatementResultingChanges;
    all(...params: SqlValue[]): Record<string, unknown>[];
    get(...params: SqlValue[]): Record<string, unknown> | undefined;
  }
  class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
