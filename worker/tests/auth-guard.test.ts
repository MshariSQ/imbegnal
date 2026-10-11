// The central auth guard (worker/src/auth/guard.ts) on EVERY protected route, through the real
// router: missing/invalid/expired tokens, revoked tokens (stale `tv`), deleted accounts, suspended
// accounts (and the routes that opt in), lazily lifted suspensions with their audit row, roles, and
// the optional-auth routes that read a bad token as anonymous.
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { signJWT, type Env } from "../src/util";
import { TestD1 } from "./helpers/d1";
import { type RunnerStub, type SeedUser, addUser, call, jsonOf, makeEnv, okResult, stubRunner, tokenFor } from "./helpers/harness";

interface RouteCase {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  /** 401 body `{"error":"Unauthorized"}` (the original site routes) instead of `{"error":"unauthorized"}`. */
  legacy401?: boolean;
  /** What a suspended account gets on a route that opts in with allowSuspended. */
  suspended?: 200 | 409;
}

// Bodies are chosen so that an authenticated call stops right after the guard (400/404) or does
// harmless work: nothing reaches the runner or the AI model.
const ROUTES: RouteCase[] = [
  { method: "GET", path: "/api/auth/me", legacy401: true, suspended: 200 },
  { method: "POST", path: "/api/auth/logout", body: {}, suspended: 200 },
  { method: "GET", path: "/api/state", legacy401: true },
  { method: "PUT", path: "/api/state", body: { data: null }, legacy401: true },
  { method: "GET", path: "/api/progress?roadmap_id=frontend", legacy401: true },
  { method: "POST", path: "/api/progress", body: {}, legacy401: true },
  { method: "DELETE", path: "/api/progress", body: {}, legacy401: true },
  { method: "GET", path: "/api/bookmarks", legacy401: true },
  { method: "POST", path: "/api/bookmarks", body: {}, legacy401: true },
  { method: "DELETE", path: "/api/bookmarks", body: {}, legacy401: true },
  { method: "POST", path: "/api/ai/chat", body: {}, legacy401: true },
  { method: "DELETE", path: "/api/account", legacy401: true, suspended: 409 },
  { method: "POST", path: "/api/lab/run", body: {} },
  { method: "GET", path: "/api/lab/quota" },
  { method: "GET", path: "/api/lab/runs" },
  { method: "GET", path: "/api/lab/runs/00000000-0000-4000-8000-000000000001" },
  { method: "GET", path: "/api/lab/progress" },
  { method: "POST", path: "/api/lab/snippets", body: {} },
  { method: "POST", path: "/api/challenges/no-such-challenge/open", body: {} },
  { method: "POST", path: "/api/challenges/no-such-challenge/hint", body: { index: 0 } },
  { method: "POST", path: "/api/challenges/no-such-challenge/submit", body: { flag: "IMB{x}" } },
  { method: "GET", path: "/api/certificates/no-such-track" },
  { method: "GET", path: "/api/instructor/analytics" },
  { method: "GET", path: "/api/admin/audit" },
];

let db: TestD1;
let env: Env;

beforeEach(() => {
  db = new TestD1();
  // The tutor answers 503 before authenticating when it is not configured; give it a key it never uses.
  env = makeEnv(db, { ANTHROPIC_API_KEY: "test-key-never-sent" });
});

const label = (r: RouteCase) => `${r.method} ${r.path}`;
const hit = (r: RouteCase, token: string | null) => call(env, r.path, { method: r.method, token, ...(r.body === undefined ? {} : { body: r.body }) });
const userRow = (id: string) => db.query<{ status: string; suspended_until: string | null; token_version: number }>("SELECT status, suspended_until, token_version FROM users WHERE github_id = ?", id)[0];
const auditOf = (id: string, action: string) => db.query<{ detail: string }>("SELECT detail FROM audit_log WHERE user_id = ? AND action = ?", id, action);

/** One fresh account per route (DELETE /api/account and logout change their account). Admins pass every role check. */
let seq = 0;
function seed(over: Partial<SeedUser> = {}): string {
  const id = `u${++seq}`;
  addUser(db, { id, role: "admin", ...over });
  return id;
}

async function expectUnauthorized(r: RouteCase, token: string | null, why: string) {
  const res = await hit(r, token);
  assert.equal(res.status, 401, `${label(r)}: ${why}`);
  assert.equal(res.headers.get("Cache-Control"), "no-store", `${label(r)}: 401 is not cacheable`);
  assert.deepEqual(await jsonOf(res), { error: r.legacy401 ? "Unauthorized" : "unauthorized" }, `${label(r)}: 401 body`);
}

describe("401: no usable token", () => {
  test("no token, a non-Bearer header, garbage, a wrong signature, an expired token, no or a non-string subject", async () => {
    const id = seed();
    const wrongSecret = await signJWT({ sub: id, exp: Math.floor(Date.now() / 1000) + 60 }, "another-secret");
    const bad: [string | null, string][] = [
      [null, "no token"],
      ["garbage", "garbage"],
      [`${await tokenFor(id)}x`, "tampered signature"],
      [wrongSecret, "signed with another secret"],
      [await tokenFor(id, { exp: Math.floor(Date.now() / 1000) - 10 }), "expired"],
      [await tokenFor(id, { exp: undefined }), "no expiry"],
      [await tokenFor(id, { sub: undefined }), "no subject"],
      [await tokenFor(id, { sub: 42 }), "numeric subject"],
      [await tokenFor(id, { sub: "x".repeat(129) }), "oversized subject"],
    ];
    for (const r of ROUTES) for (const [token, why] of bad) await expectUnauthorized(r, token, why);
    const basic = await call(env, "/api/state", { headers: { Authorization: `Basic ${await tokenFor(id)}` } });
    assert.equal(basic.status, 401, "only Bearer tokens count");
  });

  test("GET /api/state without a token stays 401 (lib/capabilities.ts identifies the API generation by it)", async () => {
    assert.equal((await call(env, "/api/state")).status, 401);
  });
});

describe("401: revoked tokens and deleted accounts", () => {
  test("a token whose `tv` is behind users.token_version is refused everywhere", async () => {
    for (const r of ROUTES) {
      const id = seed();
      const old = await tokenFor(id, { tv: 0 });
      const legacy = await tokenFor(id); // issued before tv existed: counts as version 0
      db.execute("UPDATE users SET token_version = 1 WHERE github_id = ?", id);
      await expectUnauthorized(r, old, "tv 0 < version 1");
      await expectUnauthorized(r, legacy, "no tv (0) < version 1");
    }
  });

  test("a `tv` ahead of the account, or not a non-negative integer, is refused too", async () => {
    const id = seed();
    for (const tv of [1, -1, 0.5, "0", null, true]) {
      for (const r of ROUTES) await expectUnauthorized(r, await tokenFor(id, { tv }), `tv ${JSON.stringify(tv)}`);
    }
  });

  test("a valid token of a deleted account is refused everywhere (nothing is created for it)", async () => {
    const ghost = await tokenFor("ghost", { tv: 0 });
    for (const r of ROUTES) await expectUnauthorized(r, ghost, "no users row");
    assert.equal(db.query<{ n: number }>("SELECT COUNT(*) AS n FROM users")[0].n, 0);
    assert.equal(db.query<{ n: number }>("SELECT COUNT(*) AS n FROM challenge_progress")[0].n, 0);
    assert.equal(db.query<{ n: number }>("SELECT COUNT(*) AS n FROM lab_runs")[0].n, 0);
  });
});

describe("an active account with a current token", () => {
  test("passes the guard on every route, with `tv` equal to the version and without `tv` while it is 0", async () => {
    for (const r of ROUTES) {
      for (const extra of [{ tv: 0 }, {}]) {
        const id = seed();
        const res = await hit(r, await tokenFor(id, extra));
        assert.ok(![401, 403].includes(res.status) && res.status < 500, `${label(r)} ${JSON.stringify(extra)}: got ${res.status}`);
      }
    }
    const id = seed();
    db.execute("UPDATE users SET token_version = 7 WHERE github_id = ?", id);
    assert.equal((await call(env, "/api/state", { token: await tokenFor(id, { tv: 7 }) })).status, 200, "tv equal to a bumped version");
  });
});

describe("403: suspended accounts", () => {
  test("a suspension with an end: 403 account_suspended with `until` (ISO) on every route that does not opt in", async () => {
    for (const r of ROUTES) {
      const id = seed({ status: "suspended", suspendedUntil: "2999-01-01 00:00:00" });
      const res = await hit(r, await tokenFor(id));
      const body = await jsonOf<Record<string, unknown>>(res);
      if (r.suspended === 200) {
        assert.equal(res.status, 200, label(r));
      } else if (r.suspended === 409) {
        assert.equal(res.status, 409, label(r));
        assert.equal(body.error, "account_suspended");
        assert.equal(userRow(id).status, "suspended", "the account was not deleted");
      } else {
        assert.equal(res.status, 403, label(r));
        assert.equal(res.headers.get("Cache-Control"), "no-store");
        assert.deepEqual(body, { error: "account_suspended", message: "This account is suspended.", until: "2999-01-01T00:00:00.000Z" }, label(r));
      }
    }
  });

  test("an indefinite suspension (suspended_until NULL): 403 without `until`", async () => {
    for (const r of ROUTES.filter((x) => !x.suspended)) {
      const id = seed({ status: "suspended", suspendedUntil: null });
      const res = await hit(r, await tokenFor(id));
      assert.equal(res.status, 403, label(r));
      assert.deepEqual(await jsonOf(res), { error: "account_suspended", message: "This account is suspended." }, label(r));
    }
  });

  test("GET /api/auth/me answers a suspended account and says so; active accounts read suspended: false", async () => {
    const s = seed({ status: "suspended", suspendedUntil: "2999-01-01 00:00:00" });
    const me = await jsonOf<Record<string, unknown>>(await call(env, "/api/auth/me", { token: await tokenFor(s) }));
    assert.equal(me.github_id, s);
    assert.equal(me.suspended, true);
    assert.equal(me.suspended_until, "2999-01-01T00:00:00.000Z");
    assert.equal("password_hash" in me, false);
    assert.equal("token_version" in me || "role" in me, false, "no new columns leak");

    const i = seed({ status: "suspended", suspendedUntil: null });
    const meI = await jsonOf<Record<string, unknown>>(await call(env, "/api/auth/me", { token: await tokenFor(i) }));
    assert.deepEqual([meI.suspended, meI.suspended_until], [true, null]);

    const a = seed();
    const meA = await jsonOf<Record<string, unknown>>(await call(env, "/api/auth/me", { token: await tokenFor(a) }));
    assert.deepEqual([meA.suspended, meA.suspended_until], [false, null]);
  });
});

describe("expired suspensions are lifted on any guarded route", () => {
  test("each route lifts it, lets the request through and writes exactly one abuse.suspension_expired row", async () => {
    for (const r of ROUTES) {
      const id = seed({ status: "suspended", suspendedUntil: "2000-01-01 00:00:00" });
      const res = await hit(r, await tokenFor(id));
      assert.ok(![401, 403, 409].includes(res.status) && res.status < 500, `${label(r)}: got ${res.status}`);
      if (r.path !== "/api/account") assert.deepEqual([userRow(id).status, userRow(id).suspended_until], ["active", null], label(r));
      const rows = auditOf(id, "abuse.suspension_expired");
      assert.equal(rows.length, 1, `${label(r)}: one audit row`);
      assert.match(rows[0].detail, /2000-01-01 00:00:00/);
    }
  });

  test("the optional-auth routes lift it too", async () => {
    for (const path of ["/api/challenges", "/api/leaderboard"]) {
      const id = seed({ status: "suspended", suspendedUntil: "2000-01-01 00:00:00" });
      assert.equal((await call(env, path, { token: await tokenFor(id) })).status, 200, path);
      assert.equal(userRow(id).status, "active", path);
      assert.equal(auditOf(id, "abuse.suspension_expired").length, 1, path);
    }
  });

  describe("a run that reaches reserveQuota", () => {
    let stub: RunnerStub | null = null;
    afterEach(() => {
      stub?.restore();
      stub = null;
    });

    test("is lifted once (guard), not audited again by reserveQuota, and the run goes ahead", async () => {
      stub = stubRunner(() => okResult());
      const id = seed({ status: "suspended", suspendedUntil: "2000-01-01 00:00:00" });
      const res = await call(env, "/api/lab/run", { token: await tokenFor(id), body: { lang: "python", code: "print('Hello, World!')" } });
      assert.equal(res.status, 200);
      assert.equal(stub.seen.length, 1, "the runner was called");
      assert.equal(auditOf(id, "abuse.suspension_expired").length, 1);
    });
  });
});

describe("roles (minRole, read from D1 on every request)", () => {
  const analytics = (token: string | null) => call(env, "/api/instructor/analytics", { token });
  const auditLog = (token: string | null) => call(env, "/api/admin/audit", { token });
  const status = async (p: Promise<Response>) => {
    const res = await p;
    return res.status === 200 ? 200 : `${res.status} ${(await jsonOf<{ error: string }>(res)).error}`;
  };

  test("student 403 forbidden on both; instructor reads analytics only; admin reads both", async () => {
    const s = await tokenFor(seed({ role: "student" }));
    const i = await tokenFor(seed({ role: "instructor" }));
    const a = await tokenFor(seed({ role: "admin" }));
    assert.equal(await status(analytics(s)), "403 forbidden");
    assert.equal(await status(auditLog(s)), "403 forbidden");
    assert.equal(await status(analytics(i)), 200);
    assert.equal(await status(auditLog(i)), "403 forbidden");
    assert.equal(await status(analytics(a)), 200);
    assert.equal(await status(auditLog(a)), 200);
  });

  test("no token or a deleted account 401; a suspended admin 403 account_suspended before the role check", async () => {
    assert.equal(await status(analytics(null)), "401 unauthorized");
    assert.equal(await status(auditLog(await tokenFor("ghost"))), "401 unauthorized");
    const x = await tokenFor(seed({ role: "admin", status: "suspended", suspendedUntil: "2999-01-01 00:00:00" }));
    assert.equal(await status(analytics(x)), "403 account_suspended");
    assert.equal(await status(auditLog(x)), "403 account_suspended");
  });

  test("a role claim in the token is ignored; a change of users.role applies to the very next request", async () => {
    const id = seed({ role: "student" });
    const forged = await tokenFor(id, { role: "admin", plan: "pro" }); // even when signed with the real secret
    assert.equal(await status(auditLog(forged)), "403 forbidden");
    assert.equal(await status(analytics(forged)), "403 forbidden");

    const token = await tokenFor(id);
    db.execute("UPDATE users SET role = 'instructor' WHERE github_id = ?", id);
    assert.equal(await status(analytics(token)), 200, "promoted: same token");
    db.execute("UPDATE users SET role = 'student' WHERE github_id = ?", id);
    assert.equal(await status(analytics(token)), "403 forbidden", "demoted: same token");
    db.execute("UPDATE users SET role = 'superuser' WHERE github_id = ?", id);
    assert.equal(await status(analytics(token)), "403 forbidden", "unknown roles are students");
  });
});

describe("optional auth (GET /api/challenges, GET /api/leaderboard)", () => {
  const board = (token: string | null) => call(env, "/api/leaderboard", { token });

  test("a current token personalises; a revoked, garbage or deleted-account token reads as anonymous (never 401)", async () => {
    const id = seed({ role: "student" });
    assert.match((await board(await tokenFor(id))).headers.get("Cache-Control") ?? "", /private/);
    const old = await tokenFor(id);
    db.execute("UPDATE users SET token_version = 1 WHERE github_id = ?", id);
    for (const token of [old, "garbage", await tokenFor("ghost")]) {
      const res = await board(token);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get("Cache-Control"), "public, max-age=30", "the anonymous board");
      const list = await call(env, "/api/challenges", { token });
      assert.equal(list.status, 200);
      assert.equal((await jsonOf<{ me?: unknown }>(list)).me, undefined);
    }
  });

  test("a suspended account still reads its own public progress (read only)", async () => {
    const id = seed({ role: "student", status: "suspended", suspendedUntil: "2999-01-01 00:00:00" });
    const res = await board(await tokenFor(id));
    assert.equal(res.status, 200);
    assert.match(res.headers.get("Cache-Control") ?? "", /private/);
  });
});
