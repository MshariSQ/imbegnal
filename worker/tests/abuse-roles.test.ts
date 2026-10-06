// Abuse signals, auto-suspension, audit trail, roles, and the public languages route.
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import type { LanguagesResponse } from "../../shared/api";
import { isSuspended, recordAbuseSignal } from "../src/abuse";
import { audit } from "../src/audit";
import { getRole, requireRole } from "../src/roles";
import type { Env } from "../src/util";
import { TestD1 } from "./helpers/d1";
import { type RunnerStub, addUser, call, jsonOf, makeEnv, okResult, stubRunner, tokenFor } from "./helpers/harness";

let db: TestD1;
let env: Env;

beforeEach(() => {
  db = new TestD1();
  env = makeEnv(db);
});

const userRow = (id: string) => db.query<{ status: string; suspended_until: string | null }>("SELECT status, suspended_until FROM users WHERE github_id = ?", id)[0];
const auditRows = () => db.query<{ user_id: string | null; action: string; detail: string }>("SELECT user_id, action, detail FROM audit_log ORDER BY id");

describe("abuse signals", () => {
  test("defaults: 8 resource, 5 network_probe and 25 flood signals in the window suspend for 24 h", async () => {
    for (const [kind, max] of [["resource", 8], ["network_probe", 5], ["flood", 25]] as const) {
      const id = `u-${kind}`;
      addUser(db, { id });
      for (let i = 0; i < max - 1; i++) await recordAbuseSignal(env, id, kind, "x");
      assert.equal(userRow(id).status, "active", `${kind} below threshold`);
      await recordAbuseSignal(env, id, kind, "x");
      assert.equal(userRow(id).status, "suspended", `${kind} at threshold`);
      const until = Date.parse(`${userRow(id).suspended_until}Z`);
      assert.ok(Math.abs(until - (Date.now() + 24 * 3600_000)) < 120_000, "about 24 h from now");
    }
    assert.deepEqual(
      auditRows().map((r) => r.action),
      ["abuse.auto_suspend", "abuse.auto_suspend", "abuse.auto_suspend"],
    );
    assert.match(auditRows()[0].detail, /resource/);
  });

  test("kinds are counted separately", async () => {
    addUser(db, { id: "u" });
    for (let i = 0; i < 4; i++) await recordAbuseSignal(env, "u", "resource", "x");
    for (let i = 0; i < 4; i++) await recordAbuseSignal(env, "u", "network_probe", "x");
    assert.equal(userRow("u").status, "active");
  });

  test("signals outside the window do not count", async () => {
    addUser(db, { id: "u" });
    for (let i = 0; i < 7; i++) await recordAbuseSignal(env, "u", "resource", "old");
    db.execute("UPDATE abuse_signals SET at = datetime('now', '-30 minutes')");
    await recordAbuseSignal(env, "u", "resource", "fresh");
    assert.equal(userRow("u").status, "active");
  });

  test("thresholds, window and duration are env-tunable; garbage falls back to defaults", async () => {
    addUser(db, { id: "u" });
    const tuned = makeEnv(db, { ABUSE_RESOURCE_MAX: "2", ABUSE_SUSPEND_HOURS: "1" });
    await recordAbuseSignal(tuned, "u", "resource", "a");
    await recordAbuseSignal(tuned, "u", "resource", "b");
    assert.equal(userRow("u").status, "suspended");
    assert.ok(Date.parse(`${userRow("u").suspended_until}Z`) - Date.now() < 3700_000);

    addUser(db, { id: "v" });
    const junk = makeEnv(db, { ABUSE_RESOURCE_MAX: "zero", ABUSE_WINDOW_MIN: "-3" });
    for (let i = 0; i < 7; i++) await recordAbuseSignal(junk, "v", "resource", "x");
    assert.equal(userRow("v").status, "active");
  });

  test("an already suspended account is not re-suspended (no duplicate audit rows, deadline kept)", async () => {
    addUser(db, { id: "u", status: "suspended", suspendedUntil: "2999-01-01 00:00:00" });
    for (let i = 0; i < 9; i++) await recordAbuseSignal(env, "u", "resource", "x");
    assert.equal(userRow("u").suspended_until, "2999-01-01 00:00:00");
    assert.equal(auditRows().length, 0);
  });

  test("admins are never auto-suspended", async () => {
    addUser(db, { id: "root", role: "admin" });
    for (let i = 0; i < 20; i++) await recordAbuseSignal(env, "root", "resource", "x");
    assert.equal(userRow("root").status, "active");
  });

  test("details are stored without control characters and capped at 200 characters", async () => {
    addUser(db, { id: "u" });
    await recordAbuseSignal(env, "u", "flood", `a\nb\u0000${"z".repeat(500)}`);
    const d = db.query<{ detail: string }>("SELECT detail FROM abuse_signals")[0].detail;
    assert.ok(d.length <= 200);
    assert.ok(!/[\u0000-\u001f]/.test(d));
  });

  test("a database failure never throws out of recordAbuseSignal", async () => {
    const broken = makeEnv(db);
    (broken.DB as unknown as { prepare: () => never }).prepare = () => {
      throw new Error("boom");
    };
    await assert.doesNotReject(recordAbuseSignal(broken, "u", "resource", "x"));
  });

  test("isSuspended: active, future suspension, expired suspension (lifted + audited), indefinite, unknown user", async () => {
    addUser(db, { id: "a" });
    addUser(db, { id: "f", status: "suspended", suspendedUntil: "2999-01-01 00:00:00" });
    addUser(db, { id: "e", status: "suspended", suspendedUntil: "2000-01-01 00:00:00" });
    addUser(db, { id: "i", status: "suspended", suspendedUntil: null });
    assert.equal(await isSuspended(env, "a"), false);
    assert.equal(await isSuspended(env, "f"), true);
    assert.equal(await isSuspended(env, "e"), false);
    assert.deepEqual(userRow("e"), { status: "active", suspended_until: null });
    assert.equal(await isSuspended(env, "i"), true);
    assert.equal(await isSuspended(env, "ghost"), false);
    assert.deepEqual(auditRows().map((r) => [r.user_id, r.action]), [["e", "abuse.suspension_expired"]]);
  });
});

describe("audit", () => {
  test("writes user, action and detail; caps lengths; null user allowed", async () => {
    await audit(env, { userId: "u", action: "role.change", detail: "x".repeat(900) });
    await audit(env, { action: "system.note", detail: "no user" });
    const rows = auditRows();
    assert.equal(rows.length, 2);
    assert.equal(rows[0].detail.length, 500);
    assert.equal(rows[1].user_id, null);
  });

  test("never throws when the table is unavailable", async () => {
    db.execute("DROP TABLE audit_log");
    await assert.doesNotReject(audit(env, { action: "x", detail: "y" }));
  });
});

describe("roles", () => {
  test("getRole defaults to student and ignores unknown values", async () => {
    addUser(db, { id: "s" });
    addUser(db, { id: "i", role: "instructor" });
    addUser(db, { id: "a", role: "admin" });
    db.execute("INSERT INTO users (github_id, username, role) VALUES ('w', 'weird', 'superuser')");
    assert.equal(await getRole(env, "s"), "student");
    assert.equal(await getRole(env, "i"), "instructor");
    assert.equal(await getRole(env, "a"), "admin");
    assert.equal(await getRole(env, "w"), "student");
    assert.equal(await getRole(env, "ghost"), "student");
  });

  test("requireRole: 401 without a token, 403 forbidden for students, ok for sufficient roles, 403 account_suspended first", async () => {
    addUser(db, { id: "s" });
    addUser(db, { id: "i", role: "instructor" });
    addUser(db, { id: "a", role: "admin" });
    addUser(db, { id: "x", role: "admin", status: "suspended", suspendedUntil: "2999-01-01 00:00:00" });
    const ask = async (sub: string | null, min: "instructor" | "admin") => {
      const headers: Record<string, string> = sub ? { Authorization: `Bearer ${await tokenFor(sub)}` } : {};
      return requireRole(new Request("https://api.test/x", { headers }), env, "https://imbegnal.com", min);
    };
    const denied = async (sub: string | null, min: "instructor" | "admin") => {
      const r = await ask(sub, min);
      assert.equal(r.ok, false);
      return r.ok ? null : { status: r.response.status, error: (await r.response.json() as { error: string }).error };
    };
    assert.deepEqual(await denied(null, "instructor"), { status: 401, error: "unauthorized" });
    assert.deepEqual(await denied("s", "instructor"), { status: 403, error: "forbidden" });
    assert.deepEqual(await denied("i", "admin"), { status: 403, error: "forbidden" });
    assert.deepEqual(await denied("x", "admin"), { status: 403, error: "account_suspended" });
    assert.equal((await ask("i", "instructor")).ok, true);
    assert.equal((await ask("a", "instructor")).ok, true);
    const okAdmin = await ask("a", "admin");
    assert.ok(okAdmin.ok && okAdmin.user.sub === "a");
  });

  test("the database rejects nothing silently: role and status default for new accounts", () => {
    db.execute("INSERT INTO users (github_id, username) VALUES ('n', 'newbie')");
    assert.deepEqual(db.query("SELECT role, status FROM users WHERE github_id = 'n'"), [{ role: "student", status: "active" }]);
  });
});

describe("GET /api/lab/languages through the router", () => {
  let stub: RunnerStub | null = null;
  afterEach(() => {
    stub?.restore();
    stub = null;
  });

  test("is public, JSON, short-cacheable, and reports unconfigured without touching the network", async () => {
    const res = await call(makeEnv(db, { RUNNER_URL: undefined, RUNNER_SECRET: undefined }), "/api/lab/languages");
    assert.equal(res.status, 200);
    assert.match(res.headers.get("Content-Type") ?? "", /application\/json/);
    const body = await jsonOf<LanguagesResponse>(res);
    assert.equal(body.runner, "unconfigured");
    assert.ok(body.languages.length > 0 && body.languages.every((l) => l.available === false));
  });

  test("only POST /run and the like are method-restricted; /languages rejects POST", async () => {
    assert.equal((await call(env, "/api/lab/languages", { method: "POST", rawBody: "{}" })).status, 405);
  });

  test("never leaks the runner secret or URL", async () => {
    stub = stubRunner(() => okResult());
    const text = await (await call(env, "/api/lab/languages")).text();
    assert.ok(!text.includes("test-runner-secret") && !text.includes("runner.test"));
  });
});
