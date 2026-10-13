// Server-side token revocation: POST /api/auth/logout increments users.token_version, and every token
// issuer (GitHub and Google callbacks, email register and login) embeds the current version as `tv`.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, test } from "node:test";
import { b64urlDecodeUtf8, type Env } from "../src/util";
// @ts-expect-error: plain .mjs module without type declarations
import { planMigration, splitStatements } from "../scripts/d1-reconcile.mjs";
import { TestD1, applyMigrations, listMigrations } from "./helpers/d1";
import { addUser, call, jsonOf, makeEnv, tokenFor } from "./helpers/harness";

let db: TestD1;
let env: Env;

beforeEach(() => {
  db = new TestD1();
  env = makeEnv(db, { GOOGLE_CLIENT_ID: "gid", GOOGLE_CLIENT_SECRET: "gsecret" });
});

const version = (id: string) => db.query<{ token_version: number }>("SELECT token_version FROM users WHERE github_id = ?", id)[0]?.token_version;
const claims = (token: string) => JSON.parse(b64urlDecodeUtf8(token.split(".")[1])) as Record<string, unknown>;
const logout = (token: string | null) => call(env, "/api/auth/logout", { method: "POST", token });
const me = (token: string) => call(env, "/api/auth/me", { token });

/** One request per protected route family (auth-guard.test.ts covers each route). */
const PROTECTED: [string, string, unknown?][] = [
  ["GET", "/api/auth/me"],
  ["GET", "/api/state"],
  ["GET", "/api/bookmarks"],
  ["GET", "/api/lab/quota"],
  ["POST", "/api/challenges/no-such-challenge/open", {}],
  ["GET", "/api/certificates/no-such-track"],
  ["GET", "/api/admin/audit"],
  ["POST", "/api/auth/logout", {}],
];

async function statuses(token: string, routes = PROTECTED): Promise<number[]> {
  const out: number[] = [];
  for (const [method, path, body] of routes) out.push((await call(env, path, { method, token, ...(body === undefined ? {} : { body }) })).status);
  return out;
}

describe("POST /api/auth/logout", () => {
  test("bumps token_version, audits auth.logout, answers 200 {ok:true}; the old token then fails everywhere", async () => {
    addUser(db, { id: "a", role: "admin" });
    const token = await tokenFor("a", { tv: 0 });
    assert.deepEqual(await statuses(token, PROTECTED.slice(0, -1)), [200, 200, 200, 200, 404, 404, 200], "works before (logout aside)");

    const res = await logout(token);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("Cache-Control"), "no-store");
    assert.deepEqual(await jsonOf(res), { ok: true });
    assert.equal(version("a"), 1);
    assert.deepEqual(db.query("SELECT user_id, action, detail FROM audit_log"), [{ user_id: "a", action: "auth.logout", detail: "token version 0 -> 1" }]);

    assert.deepEqual(await statuses(token), PROTECTED.map(() => 401), "revoked everywhere, logout included");
    assert.equal(version("a"), 1, "a stale token cannot bump the version again");
  });

  test("tokens issued before revocation existed (no `tv`) work while the version is 0 and die at the first logout", async () => {
    addUser(db, { id: "a" });
    const legacy = await tokenFor("a");
    assert.equal("tv" in claims(legacy), false);
    assert.equal((await me(legacy)).status, 200);
    assert.equal((await logout(legacy)).status, 200);
    assert.equal((await me(legacy)).status, 401);
  });

  test("revokes every token of the account (all devices), not only the one used", async () => {
    addUser(db, { id: "a" });
    const laptop = await tokenFor("a", { tv: 0 });
    const phone = await tokenFor("a", { tv: 0, iat: 1 });
    assert.equal((await logout(laptop)).status, 200);
    assert.equal((await me(phone)).status, 401);
  });

  test("works for a suspended account, and leaves the suspension in place", async () => {
    addUser(db, { id: "s", status: "suspended", suspendedUntil: "2999-01-01 00:00:00" });
    const token = await tokenFor("s");
    assert.equal((await logout(token)).status, 200);
    assert.equal(version("s"), 1);
    assert.deepEqual(db.query("SELECT status, suspended_until FROM users WHERE github_id = 's'"), [{ status: "suspended", suspended_until: "2999-01-01 00:00:00" }]);
  });

  test("401 without a usable token; only POST is a logout", async () => {
    addUser(db, { id: "a" });
    for (const token of [null, "garbage", await tokenFor("ghost"), await tokenFor("a", { tv: 3 })]) {
      const res = await logout(token);
      assert.equal(res.status, 401);
      assert.deepEqual(await jsonOf(res), { error: "unauthorized" });
    }
    assert.equal((await call(env, "/api/auth/logout", { token: await tokenFor("a") })).status, 404, "GET is not routed");
    assert.equal(version("a"), 0);
    assert.equal(db.query("SELECT 1 FROM audit_log").length, 0);
  });

  test("two concurrent logouts with one token move the version by exactly one", async () => {
    addUser(db, { id: "a" });
    const token = await tokenFor("a");
    const codes = (await Promise.all([logout(token), logout(token)])).map((r) => r.status).sort();
    assert.deepEqual(codes, [200, 401]);
    assert.equal(version("a"), 1);
    assert.equal(db.query("SELECT 1 FROM audit_log WHERE action = 'auth.logout'").length, 1);
  });
});

describe("every issuer embeds the current token_version as `tv`", () => {
  const originalFetch = globalThis.fetch;
  beforeEach(() => {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url === "https://github.com/login/oauth/access_token") return Response.json({ access_token: "gh-at" });
      if (url === "https://api.github.com/user") return Response.json({ id: 4242, login: "octo", name: "Octo Cat", avatar_url: "", email: "", bio: "" });
      if (url === "https://oauth2.googleapis.com/token") return Response.json({ access_token: "g-at" });
      if (url === "https://openidconnect.googleapis.com/v1/userinfo") return Response.json({ sub: "77", name: "Gee", email: "g@example.com", email_verified: true });
      throw new Error(`unexpected network access in test: ${url}`);
    }) as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  /** Runs an OAuth flow end to end (start -> callback) and returns the token from the success fragment. */
  async function oauthToken(start: string, callback: string, cookie: string): Promise<string> {
    const begin = await call(env, start);
    const state = new URL(begin.headers.get("Location") ?? "").searchParams.get("state") ?? "";
    const cookieValue = (begin.headers.get("Set-Cookie") ?? "").match(new RegExp(`^${cookie}=([^;]*);`))?.[1] ?? "";
    const done = await call(env, `${callback}?code=c&state=${state}`, { headers: { Cookie: `${cookie}=${cookieValue}` } });
    const loc = done.headers.get("Location") ?? "";
    const token = new URLSearchParams(loc.slice(loc.indexOf("#") + 1)).get("token");
    assert.ok(token, `success redirect: ${loc}`);
    return token;
  }

  for (const [name, sub, start, callback, cookie] of [
    ["GitHub", "4242", "/api/auth/github", "/api/auth/callback", "sf_oauth_state"],
    ["Google", "google:77", "/api/auth/google", "/api/auth/google/callback", "imb_google_state"],
  ] as const) {
    test(`${name} callback: a new account gets its random starting version; a returning one its current version, and the old token stays revoked`, async () => {
      const first = await oauthToken(start, callback, cookie);
      assert.equal(claims(first).sub, sub);
      const start0 = version(sub);
      assert.ok(start0 >= 1, "new accounts start at a random positive version (recreate-revocation.test.ts)");
      assert.equal(claims(first).tv, start0);
      assert.equal((await me(first)).status, 200);

      assert.equal((await logout(first)).status, 200);
      const second = await oauthToken(start, callback, cookie);
      assert.equal(claims(second).tv, start0 + 1);
      assert.equal((await me(second)).status, 200, "the new sign-in works");
      assert.equal((await me(first)).status, 401, "signing in again does not revive the old token");
    });
  }

  test("email register (the random starting version) and login (current version)", async () => {
    const reg = await call(env, "/api/auth/register", { body: { name: "Ema", email: "ema@example.com", password: "correct horse battery" } });
    assert.equal(reg.status, 201);
    const t0 = (await jsonOf<{ token: string }>(reg)).token;
    const start0 = version(claims(t0).sub as string);
    assert.ok(start0 >= 1);
    assert.equal(claims(t0).tv, start0);
    assert.equal((await logout(t0)).status, 200);
    assert.equal((await logout(t0)).status, 401);

    const login = await call(env, "/api/auth/login", { body: { email: "ema@example.com", password: "correct horse battery" } });
    assert.equal(login.status, 200);
    const t1 = (await jsonOf<{ token: string }>(login)).token;
    assert.equal(claims(t1).tv, start0 + 1);
    assert.equal((await me(t1)).status, 200);
  });
});

describe("migration 0008_token_version.sql", () => {
  test("one ADD COLUMN; existing accounts start at version 0, so their current tokens keep working", () => {
    const sql = readFileSync(new URL("../migrations/0008_token_version.sql", import.meta.url), "utf8");
    assert.deepEqual(splitStatements(sql), ["ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0"]);
    assert.deepEqual(planMigration(sql, () => new Set(["token_version"])), { action: "reconcile", statements: [], present: ["users.token_version"] }, "recorded when added by hand");

    const sqlite = new DatabaseSync(":memory:");
    applyMigrations(sqlite, listMigrations().filter((m) => m < "0008"));
    sqlite.exec("INSERT INTO users (github_id, username) VALUES ('1001', 'ada')");
    applyMigrations(sqlite, ["0008_token_version.sql"]);
    assert.deepEqual({ ...(sqlite.prepare("SELECT token_version FROM users").get() as object) }, { token_version: 0 });
  });
});
