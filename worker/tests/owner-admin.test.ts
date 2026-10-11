// Owner-only admin: no client-controlled path writes users.role or users.plan, the JWT carries no role
// or plan, and instructor/admin routes read the role from D1 (401 without an account, 403 otherwise).
// Roles are granted only by the owner's CLI (worker/scripts/grant-role.mjs, see grant-role.test.ts).
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, test } from "node:test";
import { b64urlDecodeUtf8, type Env } from "../src/util";
import { TestD1 } from "./helpers/d1";
import { addUser, call, jsonOf, makeEnv, tokenFor } from "./helpers/harness";

let db: TestD1;
let env: Env;

beforeEach(() => {
  db = new TestD1();
  env = makeEnv(db, { GOOGLE_CLIENT_ID: "gid", GOOGLE_CLIENT_SECRET: "gsecret" });
});

const TOKEN_CLAIMS = ["avatar", "exp", "iat", "name", "sub", "tv", "username"];
const claims = (token: string) => JSON.parse(b64urlDecodeUtf8(token.split(".")[1])) as Record<string, unknown>;
const account = (where: string, ...params: string[]) =>
  db.query<{ github_id: string; role: string; plan: string; status: string; provider: string; token_version: number }>(
    `SELECT github_id, role, plan, status, provider, token_version FROM users WHERE ${where}`,
    ...params,
  );
/** Extra fields a client might try to smuggle into a body or a provider profile. */
const SMUGGLED = { role: "admin", plan: "pro", status: "active", provider: "github", github_id: "1", token_version: 99, tv: 99, site_admin: true };

describe("email registration and login", () => {
  test("register ignores role, plan and every other extra field; the token carries no role", async () => {
    const res = await call(env, "/api/auth/register", { body: { name: "Mallory", email: "m@example.com", password: "correct horse battery", ...SMUGGLED } });
    assert.equal(res.status, 201);
    const rows = account("email = ?", "m@example.com");
    assert.equal(rows.length, 1);
    assert.deepEqual({ ...rows[0], github_id: undefined, token_version: undefined }, { github_id: undefined, role: "student", plan: "free", status: "active", provider: "email", token_version: undefined });
    assert.ok(rows[0].token_version >= 1 && rows[0].token_version !== 99, "a random starting version (recreate-revocation.test.ts), not the smuggled one");
    assert.notEqual(rows[0].github_id, "1");
    const token = (await jsonOf<{ token: string }>(res)).token;
    assert.deepEqual(Object.keys(claims(token)).sort(), TOKEN_CLAIMS);
    assert.equal(claims(token).sub, rows[0].github_id);

    // The smuggled role does not open the role-gated routes.
    assert.equal((await call(env, "/api/admin/audit", { token })).status, 403);
    assert.equal((await call(env, "/api/instructor/analytics", { token })).status, 403);
  });

  test("login ignores extra fields and never touches role or plan", async () => {
    await call(env, "/api/auth/register", { body: { email: "m@example.com", password: "correct horse battery" } });
    db.execute("UPDATE users SET role = 'instructor', plan = 'pro' WHERE email = 'm@example.com'");
    const res = await call(env, "/api/auth/login", { body: { email: "m@example.com", password: "correct horse battery", ...SMUGGLED, role: "student", plan: "free" } });
    assert.equal(res.status, 200);
    assert.deepEqual([account("email = ?", "m@example.com")[0].role, account("email = ?", "m@example.com")[0].plan], ["instructor", "pro"]);
    assert.deepEqual(Object.keys(claims((await jsonOf<{ token: string }>(res)).token)).sort(), TOKEN_CLAIMS);
  });
});

describe("GitHub and Google sign-in", () => {
  const originalFetch = globalThis.fetch;
  beforeEach(() => {
    // Provider profiles with fields an attacker cannot set on our side anyway (GitHub's own site_admin, a role, a plan).
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url === "https://github.com/login/oauth/access_token") return Response.json({ access_token: "gh-at" });
      if (url === "https://api.github.com/user") return Response.json({ id: 4242, login: "octo", name: "Octo", avatar_url: "", email: "", bio: "", ...SMUGGLED });
      if (url === "https://oauth2.googleapis.com/token") return Response.json({ access_token: "g-at" });
      if (url === "https://openidconnect.googleapis.com/v1/userinfo") return Response.json({ sub: "77", name: "Gee", email: "g@example.com", email_verified: true, ...SMUGGLED });
      throw new Error(`unexpected network access in test: ${url}`);
    }) as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  async function signIn(start: string, callback: string, cookie: string): Promise<string> {
    const begin = await call(env, start);
    const state = new URL(begin.headers.get("Location") ?? "").searchParams.get("state") ?? "";
    const value = (begin.headers.get("Set-Cookie") ?? "").match(new RegExp(`^${cookie}=([^;]*);`))?.[1] ?? "";
    const done = await call(env, `${callback}?code=c&state=${state}`, { headers: { Cookie: `${cookie}=${value}` } });
    const loc = done.headers.get("Location") ?? "";
    const token = new URLSearchParams(loc.slice(loc.indexOf("#") + 1)).get("token");
    assert.ok(token, loc);
    return token;
  }

  for (const [name, sub, start, callback, cookie] of [
    ["GitHub", "4242", "/api/auth/github", "/api/auth/callback", "sf_oauth_state"],
    ["Google", "google:77", "/api/auth/google", "/api/auth/google/callback", "imb_google_state"],
  ] as const) {
    test(`${name}: a new account is a free student whatever the profile says; a returning one keeps its role and plan`, async () => {
      const token = await signIn(start, callback, cookie);
      assert.deepEqual(account("github_id = ?", sub).map((r) => [r.role, r.plan, r.status]), [["student", "free", "active"]]);
      assert.deepEqual(Object.keys(claims(token)).sort(), TOKEN_CLAIMS);
      assert.equal((await call(env, "/api/admin/audit", { token })).status, 403);

      db.execute("UPDATE users SET role = 'admin', plan = 'pro' WHERE github_id = ?", sub);
      const again = await signIn(start, callback, cookie);
      assert.deepEqual(account("github_id = ?", sub).map((r) => [r.role, r.plan]), [["admin", "pro"]], "the upsert does not reset them either");
      assert.equal("role" in claims(again), false);
      assert.equal((await call(env, "/api/admin/audit", { token: again })).status, 200, "the role comes from D1");
    });
  }
});

describe("authenticated writes", () => {
  test("PUT /api/state stores the document and nothing else: role and plan stay as they are", async () => {
    addUser(db, { id: "u" });
    const token = await tokenFor("u");
    const res = await call(env, "/api/state", { method: "PUT", token, body: { data: { v: 1, role: "admin", plan: "pro" }, ...SMUGGLED } });
    assert.equal(res.status, 200);
    assert.deepEqual(account("github_id = 'u'").map((r) => [r.role, r.plan, r.token_version]), [["student", "free", 0]]);
  });

  test("no Worker source writes users.role or users.plan (only the owner's CLI does)", () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (p.endsWith(".ts")) files.push(p);
      }
    };
    walk(join(__dirname, "../src"));
    let inserts = 0;
    let updates = 0;
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      for (const literal of src.match(/`[^`]*`|"(?:[^"\\\n]|\\.)*"/g) ?? []) {
        const sql = literal.replace(/\s+/g, " ");
        const insert = /INSERT (?:OR \w+ )?INTO users ?\(([^)]*)\)/i.exec(sql);
        if (insert) {
          inserts++;
          assert.doesNotMatch(insert[1], /\b(role|plan)\b/i, `${file}: ${sql}`);
        }
        for (const m of sql.matchAll(/(?:UPDATE users SET|DO UPDATE SET)(.*?)(?:\bWHERE\b|\bRETURNING\b|$)/gi)) {
          if (/UPDATE users SET/i.test(m[0]) || /INTO users/i.test(sql)) {
            updates++;
            assert.doesNotMatch(m[1], /\b(role|plan)\s*=/i, `${file}: ${sql}`);
          }
        }
      }
    }
    assert.ok(inserts >= 3, `found the GitHub, Google and email inserts (${inserts})`);
    assert.ok(updates >= 5, `found the users updates (${updates})`);
  });
});

describe("role-gated routes", () => {
  test("401 without a token or account, 403 for students, 200 once the owner grants the role", async () => {
    for (const path of ["/api/instructor/analytics", "/api/admin/audit"]) {
      assert.equal((await call(env, path)).status, 401, path);
      assert.equal((await call(env, path, { token: await tokenFor("ghost", { role: "admin" }) })).status, 401, path);
    }
    addUser(db, { id: "s" });
    const token = await tokenFor("s");
    assert.equal((await call(env, "/api/instructor/analytics", { token })).status, 403);
    db.execute("UPDATE users SET role = 'instructor' WHERE github_id = 's'");
    assert.equal((await call(env, "/api/instructor/analytics", { token })).status, 200);
    assert.equal((await call(env, "/api/admin/audit", { token })).status, 403);
  });
});
