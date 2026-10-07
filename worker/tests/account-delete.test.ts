// Self-serve account deletion must erase Code Lab and Challenges data too (privacy right to erasure).
import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import type { Env } from "../src/util";
import { TestD1 } from "./helpers/d1";
import { addUser, call, jsonOf, makeEnv, tokenFor } from "./helpers/harness";

let db: TestD1;
let env: Env;

beforeEach(() => {
  db = new TestD1();
  env = makeEnv(db);
});

const count = (table: string, col: string, id: string) => db.query<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table} WHERE ${col} = ?`, id)[0].n;

function seed(id: string) {
  addUser(db, { id });
  db.execute("INSERT INTO lab_runs (id, user_id, ref_kind, lang, status) VALUES (?, ?, 'free', 'python', 'ok')", `run-${id}`, id);
  db.execute("INSERT INTO lab_usage (user_id, day, count) VALUES (?, '2026-01-01', 3)", id);
  db.execute("INSERT INTO lab_snippets (id, user_id, lang, code) VALUES (?, ?, 'python', 'print(1)')", `snip-${id}`, id);
  db.execute("INSERT INTO lab_progress (user_id, ref) VALUES (?, 'a/b/c')", id);
  db.execute("INSERT INTO abuse_signals (user_id, kind, at) VALUES (?, 'resource', '2026-01-01 00:00:00')", id);
  db.execute("INSERT INTO challenge_progress (user_id, challenge_id) VALUES (?, 'x')", id);
  db.execute("INSERT INTO challenge_solves (challenge_id, user_id, points) VALUES ('x', ?, 50)", id);
  db.execute("INSERT INTO challenge_attempts (user_id, challenge_id, correct) VALUES (?, 'x', 0)", id);
  db.execute("INSERT INTO certificates (code, user_id, track, recipient) VALUES (?, ?, 'frontend', 'R')", `IMB-${id}`, id);
  db.execute("INSERT INTO audit_log (user_id, action, detail) VALUES (?, 'abuse.signal', 'kept')", id);
}

describe("DELETE /api/account", () => {
  test("erases the account's Code Lab and Challenges data and nobody else's", async () => {
    seed("alice");
    seed("bob");
    const res = await call(env, "/api/account", { method: "DELETE", token: await tokenFor("alice") });
    assert.equal(res.status, 200);
    assert.deepEqual(await jsonOf(res), { ok: true });

    const tables: [string, string][] = [
      ["users", "github_id"], ["lab_runs", "user_id"], ["lab_usage", "user_id"], ["lab_snippets", "user_id"], ["lab_progress", "user_id"],
      ["abuse_signals", "user_id"], ["challenge_progress", "user_id"], ["challenge_solves", "user_id"], ["challenge_attempts", "user_id"], ["certificates", "user_id"],
    ];
    for (const [t, c] of tables) {
      assert.equal(count(t, c, "alice"), 0, `${t} erased for alice`);
      assert.equal(count(t, c, "bob"), 1, `${t} untouched for bob`);
    }
    // audit_log is the operators' security record: kept, and it carries no content.
    // The deletion itself is recorded too.
    assert.equal(count("audit_log", "user_id", "alice"), 2);
    assert.equal(db.query<{ n: number }>("SELECT COUNT(*) AS n FROM audit_log WHERE user_id = 'alice' AND action = 'account.delete'")[0].n, 1);
  });

  test("today's run counter and recent abuse signals survive, so delete + sign in again does not reset them", async () => {
    seed("alice");
    const today = new Date().toISOString().slice(0, 10);
    db.execute("INSERT INTO lab_usage (user_id, day, count) VALUES ('alice', ?, 50)", today);
    db.execute("INSERT INTO abuse_signals (user_id, kind) VALUES ('alice', 'network_probe')");
    const res = await call(env, "/api/account", { method: "DELETE", token: await tokenFor("alice") });
    assert.equal(res.status, 200);
    assert.equal(count("users", "github_id", "alice"), 0);
    assert.deepEqual(db.query("SELECT day, count FROM lab_usage WHERE user_id = 'alice'"), [{ day: today, count: 50 }]);
    assert.deepEqual(db.query("SELECT kind FROM abuse_signals WHERE user_id = 'alice'"), [{ kind: "network_probe" }]);
  });

  test("a suspended account cannot delete itself (that would lift the suspension on the next sign-in)", async () => {
    seed("alice");
    db.execute("UPDATE users SET status = 'suspended', suspended_until = datetime('now', '+1 day') WHERE github_id = 'alice'");
    const res = await call(env, "/api/account", { method: "DELETE", token: await tokenFor("alice") });
    assert.equal(res.status, 409);
    assert.equal((await jsonOf<{ error: string }>(res)).error, "account_suspended");
    assert.equal(count("users", "github_id", "alice"), 1);
    assert.equal(count("lab_runs", "user_id", "alice"), 1);
  });

  test("a suspension that has expired no longer blocks deletion", async () => {
    seed("alice");
    db.execute("UPDATE users SET status = 'suspended', suspended_until = datetime('now', '-1 hour') WHERE github_id = 'alice'");
    assert.equal((await call(env, "/api/account", { method: "DELETE", token: await tokenFor("alice") })).status, 200);
    assert.equal(count("users", "github_id", "alice"), 0);
  });

  test("requires a valid token", async () => {
    seed("alice");
    assert.equal((await call(env, "/api/account", { method: "DELETE" })).status, 401);
    assert.equal(count("lab_runs", "user_id", "alice"), 1);
  });
});
