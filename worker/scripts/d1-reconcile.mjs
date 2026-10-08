#!/usr/bin/env node
// Runs before `wrangler d1 migrations apply` (see .github/workflows/deploy.yml).
//
// Production's database was first built by hand from the old worker/schema*.sql files, which became
// migrations 0001-0003 later. A migration whose `ALTER TABLE ... ADD COLUMN` columns already exist was
// applied that way (schema-v3.sql = 0002): running it again fails with "duplicate column" and stops the
// deploy. For such a migration this script runs the rest of its statements (each one must be idempotent:
// CREATE ... IF NOT EXISTS, ADD COLUMN for a column that is still missing) and records the migration in
// wrangler's d1_migrations table, so `migrations apply` skips it. Migrations whose columns are all missing
// are left to wrangler. Anything it cannot prove safe stops the deploy with a message and changes nothing.
//
//   node scripts/d1-reconcile.mjs --remote                      (CI, needs CLOUDFLARE_API_TOKEN/ACCOUNT_ID)
//   node scripts/d1-reconcile.mjs --local [--persist-to DIR]    (local check)
//
// Pure planning functions are exported for worker/tests/d1-reconcile.test.ts.
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** Same table wrangler 3 creates (wrangler-dist/cli.js, DEFAULT_MIGRATION_TABLE). */
export const MIGRATIONS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);`;

/** Statements of a migration file, without comments. Migrations here never put ";" inside literals. */
export function splitStatements(sql) {
  return sql
    .split("\n")
    .map((line) => line.replace(/--.*$/, ""))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

const ADD_COLUMN = /^ALTER\s+TABLE\s+["`[]?(\w+)["`\]]?\s+ADD\s+(?:COLUMN\s+)?["`[]?(\w+)/i;
const IDEMPOTENT = /^(CREATE\s+(?:UNIQUE\s+)?(?:TABLE|INDEX|VIEW|TRIGGER)\s+IF\s+NOT\s+EXISTS|DROP\s+(?:TABLE|INDEX|VIEW|TRIGGER)\s+IF\s+EXISTS|INSERT\s+OR\s+(?:IGNORE|REPLACE))\b/i;

/** `{ table, column }` when the statement is `ALTER TABLE t ADD [COLUMN] c ...`, else null. */
export function addColumnTarget(statement) {
  const m = ADD_COLUMN.exec(statement);
  return m ? { table: m[1], column: m[2] } : null;
}

/**
 * Decides what to do with one pending migration, given the columns that exist now
 * (`columnsOf(table)` -> Set of column names, empty when the table does not exist).
 *   { action: "leave" }                      nothing of it is present: wrangler applies it as usual
 *   { action: "reconcile", statements }      some ADD COLUMNs already ran: run `statements`, then record it
 *   { action: "refuse", reason }             partly present but a remaining statement is not idempotent
 */
export function planMigration(sql, columnsOf) {
  const statements = splitStatements(sql);
  const present = [];
  const rest = [];
  for (const s of statements) {
    const t = addColumnTarget(s);
    if (t && columnsOf(t.table).has(t.column)) present.push(`${t.table}.${t.column}`);
    else rest.push(s);
  }
  if (present.length === 0) return { action: "leave" };
  for (const s of rest) {
    const t = addColumnTarget(s);
    if (t) continue; // a column that is still missing: adding it is exactly what the migration wants
    if (!IDEMPOTENT.test(s)) {
      return { action: "refuse", reason: `${present.join(", ")} already exist, but this statement is not idempotent: ${s.split("\n")[0]}` };
    }
  }
  return { action: "reconcile", statements: rest, present };
}

// ── CLI ──────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { mode: null, persistTo: null, database: "skillforge-db" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--remote" || a === "--local") out.mode = a;
    else if (a === "--persist-to") out.persistTo = argv[++i];
    else if (a === "--database") out.database = argv[++i];
    else throw new Error(`unknown argument ${a}`);
  }
  if (!out.mode) throw new Error("pass --remote or --local");
  return out;
}

function d1(opts, sql) {
  const args = ["wrangler", "d1", "execute", opts.database, "--config", "wrangler.toml", opts.mode, "--json", "--command", sql];
  if (opts.persistTo) args.push("--persist-to", opts.persistTo);
  const r = spawnSync("npx", args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`wrangler d1 execute failed (${r.status}): ${(r.stderr || r.stdout).trim().slice(-2000)}`);
  // --json prints a JSON array; anything before it (e.g. a proxy notice) is not part of the answer.
  const start = r.stdout.indexOf("[");
  if (start < 0) throw new Error(`no JSON in wrangler output: ${r.stdout.slice(0, 500)}`);
  const parsed = JSON.parse(r.stdout.slice(start));
  return parsed.flatMap((x) => x.results ?? []);
}

const quote = (s) => `'${String(s).replace(/'/g, "''")}'`;

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const dir = resolve(dirname(fileURLToPath(import.meta.url)), "../migrations");
  d1(opts, MIGRATIONS_TABLE_SQL);
  const applied = new Set(d1(opts, "SELECT name FROM d1_migrations").map((r) => r.name));
  const pending = readdirSync(dir).filter((f) => f.endsWith(".sql") && !applied.has(f)).sort();
  if (pending.length === 0) return console.log("d1-reconcile: every migration is recorded; nothing to do.");

  const cache = new Map();
  const columnsOf = (table) => {
    if (!/^\w+$/.test(table)) return new Set();
    if (!cache.has(table)) cache.set(table, new Set(d1(opts, `SELECT name FROM pragma_table_info(${quote(table)})`).map((r) => r.name)));
    return cache.get(table);
  };

  for (const file of pending) {
    const plan = planMigration(readFileSync(join(dir, file), "utf8"), columnsOf);
    if (plan.action === "leave") {
      console.log(`d1-reconcile: ${file} pending, left to wrangler.`);
      continue;
    }
    if (plan.action === "refuse") {
      console.error(`::error title=Database needs a manual check::${file}: ${plan.reason}. Nothing was changed.`);
      process.exit(1);
    }
    // Statements first (all idempotent), the record last: a failure in between is retried on the next run.
    if (plan.statements.length) d1(opts, plan.statements.join(";\n") + ";");
    d1(opts, `INSERT OR IGNORE INTO d1_migrations (name) VALUES (${quote(file)})`);
    cache.clear();
    console.log(`d1-reconcile: ${file} was already applied by hand (${plan.present.join(", ")} exist); ran its remaining idempotent statements and recorded it.`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    main();
  } catch (e) {
    console.error(`d1-reconcile: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  }
}
