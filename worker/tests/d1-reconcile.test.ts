// The deploy's pre-migration step (worker/scripts/d1-reconcile.mjs): a migration that was already
// applied by hand from the old schema*.sql files must be recorded, not re-run (it would fail with
// "duplicate column" and stop the deploy). These tests drive its planning on the real migration files
// and on a node:sqlite database shaped like production after the old hand-run schema files.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
// @ts-expect-error: plain .mjs module without type declarations
import { addColumnTarget, planMigration, splitStatements } from "../scripts/d1-reconcile.mjs";

const DIR = join(__dirname, "../migrations");
const files = readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort();
const read = (f: string) => readFileSync(join(DIR, f), "utf8");

type Plan = { action: "leave" } | { action: "reconcile"; statements: string[]; present: string[] } | { action: "refuse"; reason: string };
const plan = (sql: string, cols: (t: string) => Set<string>) => planMigration(sql, cols) as Plan;

const columnsIn = (db: DatabaseSync) => (table: string) =>
  new Set((db.prepare(`SELECT name FROM pragma_table_info(?)`).all(table) as { name: string }[]).map((r) => r.name));

function applyPlanned(db: DatabaseSync, applied: Set<string>) {
  for (const f of files) {
    if (applied.has(f)) continue;
    const p = plan(read(f), columnsIn(db));
    assert.notEqual(p.action, "refuse", `${f}: ${(p as { reason?: string }).reason}`);
    if (p.action === "reconcile") {
      for (const s of p.statements) db.exec(s);
      applied.add(f);
    }
  }
  // what wrangler then does with the rest: run each pending file as is
  for (const f of files) if (!applied.has(f)) db.exec(read(f));
}

test("statements are split without comments; ADD COLUMN targets are recognised", () => {
  assert.deepEqual(splitStatements("-- a\nALTER TABLE users ADD COLUMN x TEXT; -- why\nCREATE TABLE IF NOT EXISTS t (a INT);\n"), [
    "ALTER TABLE users ADD COLUMN x TEXT",
    "CREATE TABLE IF NOT EXISTS t (a INT)",
  ]);
  assert.deepEqual(addColumnTarget("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student'"), { table: "users", column: "role" });
  assert.deepEqual(addColumnTarget('alter table "users" add "plan" TEXT'), { table: "users", column: "plan" });
  assert.equal(addColumnTarget("CREATE TABLE IF NOT EXISTS x (a INT)"), null);
});

test("every migration is either column-free or adds columns next to idempotent statements only", () => {
  // If this fails, a new migration needs a non-idempotent statement: the reconcile step would refuse to
  // record it after a partial manual run, so make the statement idempotent or document a manual step.
  const allPresent = () => new Set(["provider", "password_hash", "plan", "role", "status", "suspended_until"]);
  for (const f of files) assert.notEqual(plan(read(f), allPresent).action, "refuse", f);
});

test("a fresh database: nothing is reconciled, every migration is left to wrangler", () => {
  const db = new DatabaseSync(":memory:");
  for (const f of files) assert.equal(plan(read(f), columnsIn(db)).action, "leave", f);
});

test("production built by hand from schema.sql + schema-v3 (= 0002): 0002 is recorded and the rest applies cleanly", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(read("0001_base.sql"));
  db.exec(read("0002_accounts_sync_ai.sql")); // the old schema-v3.sql, run by hand
  db.exec("INSERT INTO users (github_id, username, email, provider, plan) VALUES ('1', 'layla', 'l@example.com', 'github', 'pro')");
  // Without the step, wrangler would re-run 0002 and fail:
  assert.throws(() => db.exec(read("0002_accounts_sync_ai.sql")), /duplicate column/);

  const p = plan(read("0002_accounts_sync_ai.sql"), columnsIn(db));
  assert.equal(p.action, "reconcile");
  assert.deepEqual((p as { present: string[] }).present, ["users.provider", "users.password_hash", "users.plan"]);

  const applied = new Set<string>();
  applyPlanned(db, applied);
  assert.deepEqual([...applied], ["0002_accounts_sync_ai.sql"]);
  const cols = columnsIn(db)("users");
  for (const c of ["provider", "password_hash", "plan", "role", "status", "suspended_until"]) assert.ok(cols.has(c), c);
  assert.equal((db.prepare("SELECT plan FROM users WHERE github_id = '1'").get() as { plan: string }).plan, "pro", "existing rows are kept");
  for (const t of ["lab_runs", "challenge_solves", "certificates", "events"]) {
    assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(t), t);
  }
});

test("a partial manual run (some columns of 0004 added by hand): the missing ones are added, then it is recorded", () => {
  const db = new DatabaseSync(":memory:");
  for (const f of files.slice(0, 3)) db.exec(read(f));
  db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student'");
  const p = plan(read("0004_code_lab.sql"), columnsIn(db));
  assert.equal(p.action, "reconcile");
  for (const s of (p as { statements: string[] }).statements) db.exec(s);
  const cols = columnsIn(db)("users");
  assert.ok(cols.has("status") && cols.has("suspended_until"));
  assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='lab_runs'").get());
});

test("a partly present migration with a non-idempotent statement is refused (nothing is guessed)", () => {
  const cols = () => new Set(["x"]);
  const p = plan("ALTER TABLE users ADD COLUMN x TEXT;\nCREATE TABLE plain (a INT);\nUPDATE users SET x = 'y';", cols);
  assert.equal(p.action, "refuse");
  assert.match((p as { reason: string }).reason, /users\.x already exist.*CREATE TABLE plain/);
});
