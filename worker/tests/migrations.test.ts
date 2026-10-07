// Migration 0004 must apply on an empty database AND on top of 0001-0003 with
// legacy rows in place (production already has users and synced state).
import assert from "node:assert/strict";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { TestD1, applyMigrations, listMigrations } from "./helpers/d1";

const LAB_TABLES = ["lab_runs", "lab_usage", "lab_snippets", "lab_progress", "audit_log", "abuse_signals"];

const tables = (db: TestD1) => db.query<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table'").map((r) => r.name);

test("all migrations apply to an empty database in order, with foreign keys on", () => {
  const db = new TestD1("all");
  for (const t of LAB_TABLES) assert.ok(tables(db).includes(t), `missing table ${t}`);
  assert.deepEqual(db.query("PRAGMA foreign_key_check"), []);
  assert.equal(db.query<{ integrity_check: string }>("PRAGMA integrity_check")[0].integrity_check, "ok");
});

test("0004 adds role/status/suspended_until with safe defaults", () => {
  const db = new TestD1("all");
  db.execute("INSERT INTO users (github_id, username) VALUES ('1', 'ada')");
  const row = db.query<{ role: string; status: string; suspended_until: string | null }>("SELECT role, status, suspended_until FROM users")[0];
  assert.deepEqual(row, { role: "student", status: "active", suspended_until: null });
});

test("0004 applies on top of 0001-0003 and keeps legacy rows intact", () => {
  const migrations = listMigrations();
  assert.ok(migrations.includes("0004_code_lab.sql"));
  const before = migrations.filter((m) => m < "0004");
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  applyMigrations(sqlite, before);

  // Legacy data as production has it: every provider's account shape, synced state, progress, AI usage, events.
  sqlite.exec(`
    INSERT INTO users (github_id, username, name, avatar_url, email, bio, plan) VALUES
      ('1001', 'ada', 'Ada Lovelace', 'https://a/1.png', 'ada@example.com', 'bio', 'pro'),
      ('email:5d5e0c1e-aaaa-bbbb-cccc-0123456789ab', 'sam', 'سامي', NULL, 'sam@example.com', NULL, 'free'),
      ('google:77', 'gia', 'Gia', NULL, 'gia@example.com', NULL, 'free');
    INSERT INTO user_state (github_id, data) VALUES ('1001', '{"v":1,"lessons":{"python/intro":{"done":true}}}');
    INSERT INTO user_roadmap_progress (github_id, roadmap_id, node_id) VALUES ('1001', 'frontend', 'html');
    INSERT INTO user_bookmarks (github_id, type, item_id) VALUES ('1001', 'course', 'react');
    INSERT INTO ai_usage (github_id, day, count) VALUES ('1001', '2026-10-01', 3);
    INSERT INTO events (day, name, anon) VALUES ('2026-10-01', 'lesson_start', '5d5e0c1e-aaaa-bbbb-cccc-0123456789ab');
  `);

  applyMigrations(sqlite, ["0004_code_lab.sql"]);

  const count = (sql: string) => (sqlite.prepare(sql).get() as { n: number }).n;
  assert.equal(count("SELECT COUNT(*) AS n FROM users"), 3);
  assert.equal(count("SELECT COUNT(*) AS n FROM users WHERE role = 'student' AND status = 'active' AND suspended_until IS NULL"), 3);
  assert.equal((sqlite.prepare("SELECT plan FROM users WHERE github_id = '1001'").get() as { plan: string }).plan, "pro");
  assert.equal((sqlite.prepare("SELECT name FROM users WHERE github_id LIKE 'email:%'").get() as { name: string }).name, "سامي");
  assert.match((sqlite.prepare("SELECT data FROM user_state").get() as { data: string }).data, /python\/intro/);
  assert.equal(count("SELECT COUNT(*) AS n FROM user_roadmap_progress"), 1);
  assert.equal(count("SELECT COUNT(*) AS n FROM ai_usage"), 1);
  assert.equal(count("SELECT COUNT(*) AS n FROM events"), 1);
  assert.deepEqual(sqlite.prepare("PRAGMA foreign_key_check").all(), []);

  // The new tables are usable right away for a legacy account.
  sqlite.exec("INSERT INTO lab_runs (id, user_id, ref_kind, lang, status) VALUES ('r1', '1001', 'free', 'python', 'ok')");
  sqlite.exec("INSERT INTO lab_usage (user_id, day, count) VALUES ('1001', '2026-10-05', 1)");
  assert.equal(count("SELECT COUNT(*) AS n FROM lab_runs"), 1);
});

test("lab_runs defaults: success 0, created_at stamped; lab_progress is unique per (user, ref)", () => {
  const db = new TestD1("all");
  db.execute("INSERT INTO lab_runs (id, user_id, ref_kind, lang, status) VALUES ('r1', 'u', 'free', 'python', 'running')");
  const r = db.query<{ success: number; created_at: string | null }>("SELECT success, created_at FROM lab_runs")[0];
  assert.equal(r.success, 0);
  assert.match(String(r.created_at), /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  db.execute("INSERT INTO lab_progress (user_id, ref) VALUES ('u', 'a/b/c')");
  assert.throws(() => db.execute("INSERT INTO lab_progress (user_id, ref) VALUES ('u', 'a/b/c')"), /UNIQUE|constraint/i);
});
