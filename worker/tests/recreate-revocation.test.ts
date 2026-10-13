// A deleted account that is created again must not accept the deleted account's tokens.
// Account keys are deterministic (GitHub id, google:<sub>, email:<HMAC>), so the re-created row has the
// same key; it therefore starts at a fresh random token_version (util.ts newTokenVersion), and a token of
// the deleted account (its old `tv`, or no `tv` = 0) no longer matches. Signing in again (the upsert's
// ON CONFLICT branch) never changes token_version, and rows from before this change keep version 0, so
// nobody is signed out by it. Everything goes through the real router.
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, mock, test } from "node:test";
import { b64urlDecodeUtf8, type Env, newTokenVersion } from "../src/util";
import { TestD1 } from "./helpers/d1";
import { addUser, call, jsonOf, makeEnv, tokenFor } from "./helpers/harness";

const MAX_VERSION = 2 ** 31 - 1;
const PASSWORD = "correct horse battery";

let db: TestD1;
let env: Env;

const claims = (token: string) => JSON.parse(b64urlDecodeUtf8(token.split(".")[1])) as Record<string, unknown>;
const version = (id: string) => db.query<{ token_version: number }>("SELECT token_version FROM users WHERE github_id = ?", id)[0]?.token_version;
const me = (token: string) => call(env, "/api/auth/me", { token });

/** Guarded routes of every family; bodies stop right after the guard (200 or 404), nothing reaches the runner or a model. */
const GUARDED: [string, string, unknown?][] = [
  ["GET", "/api/auth/me"],
  ["GET", "/api/state"],
  ["GET", "/api/bookmarks"],
  ["GET", "/api/lab/quota"],
  ["GET", "/api/lab/progress"],
  ["POST", "/api/challenges/no-such-challenge/open", {}],
  ["GET", "/api/certificates/no-such-track"],
];

async function statuses(token: string): Promise<number[]> {
  const out: number[] = [];
  for (const [method, path, body] of GUARDED) out.push((await call(env, path, { method, token, ...(body === undefined ? {} : { body }) })).status);
  return out;
}
const ACCEPTED = [200, 200, 200, 200, 200, 404, 404];
const REFUSED = GUARDED.map(() => 401);

async function deleteAccount(token: string) {
  const res = await call(env, "/api/account", { method: "DELETE", token });
  assert.equal(res.status, 200, "account deleted");
}

async function register(email: string): Promise<string> {
  const res = await call(env, "/api/auth/register", { body: { email, password: PASSWORD } });
  assert.equal(res.status, 201, "registered");
  return (await jsonOf<{ token: string }>(res)).token;
}

async function login(email: string): Promise<string> {
  const res = await call(env, "/api/auth/login", { body: { email, password: PASSWORD } });
  assert.equal(res.status, 200, "signed in");
  return (await jsonOf<{ token: string }>(res)).token;
}

function assertFreshVersion(id: string, token: string) {
  const v = version(id);
  assert.ok(Number.isSafeInteger(v) && v >= 1 && v <= MAX_VERSION, `token_version ${v} is a positive 31-bit integer`);
  assert.equal(claims(token).tv, v, "the issued token carries the stored version (read back, not assumed 0)");
}

beforeEach(() => {
  db = new TestD1();
  env = makeEnv(db, { GOOGLE_CLIENT_ID: "gid", GOOGLE_CLIENT_SECRET: "gsecret" });
});

describe("email accounts", () => {
  test("delete, then register the same email again: the old token is refused everywhere, the new one works", async () => {
    const old = await register("ada@example.com");
    const sub = claims(old).sub as string;
    assertFreshVersion(sub, old);
    assert.deepEqual(await statuses(old), ACCEPTED, "the first account works");
    await deleteAccount(old);

    const fresh = await register("Ada@Example.com"); // same normalized email -> same key
    assert.equal(claims(fresh).sub, sub, "the same deterministic key comes back");
    assertFreshVersion(sub, fresh);
    assert.notEqual(claims(fresh).tv, claims(old).tv, "a new random version");

    assert.deepEqual(await statuses(old), REFUSED, "the deleted account's token stays dead");
    const meRes = await me(old);
    assert.equal(meRes.status, 401);
    assert.deepEqual(await jsonOf(meRes), { error: "Unauthorized" });
    assert.deepEqual(await statuses(await tokenFor(sub)), REFUSED, "a token without `tv` (counts as 0) is refused too");
    assert.deepEqual(await statuses(await tokenFor(sub, { tv: 0 })), REFUSED, "and one with tv 0");
    assert.deepEqual(await statuses(fresh), ACCEPTED, "the new account's token works");
  });

  test("signing in again never changes token_version", async () => {
    const reg = await register("bo@example.com");
    const sub = claims(reg).sub as string;
    const v = version(sub);
    const again = await login("bo@example.com");
    assert.equal(version(sub), v);
    assert.equal(claims(again).tv, v);
    assert.equal((await me(reg)).status, 200, "the earlier token still works");
    assert.equal((await me(again)).status, 200);
  });
});

describe("GitHub and Google accounts", () => {
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
  async function signIn(start: string, callback: string, cookie: string): Promise<string> {
    const begin = await call(env, start);
    const state = new URL(begin.headers.get("Location") ?? "").searchParams.get("state") ?? "";
    const value = (begin.headers.get("Set-Cookie") ?? "").match(new RegExp(`^${cookie}=([^;]*);`))?.[1] ?? "";
    const done = await call(env, `${callback}?code=c&state=${state}`, { headers: { Cookie: `${cookie}=${value}` } });
    const loc = done.headers.get("Location") ?? "";
    const token = new URLSearchParams(loc.slice(loc.indexOf("#") + 1)).get("token");
    assert.ok(token, `success redirect: ${loc}`);
    return token;
  }

  for (const [name, sub, start, callback, cookie] of [
    ["GitHub", "4242", "/api/auth/github", "/api/auth/callback", "sf_oauth_state"],
    ["Google", "google:77", "/api/auth/google", "/api/auth/google/callback", "imb_google_state"],
  ] as const) {
    test(`${name}: delete, then sign up again with the same id: the old token is refused, the new one works`, async () => {
      const old = await signIn(start, callback, cookie);
      assert.equal(claims(old).sub, sub);
      assertFreshVersion(sub, old);
      assert.deepEqual(await statuses(old), ACCEPTED);
      await deleteAccount(old);

      const fresh = await signIn(start, callback, cookie);
      assertFreshVersion(sub, fresh);
      assert.notEqual(claims(fresh).tv, claims(old).tv);
      assert.deepEqual(await statuses(old), REFUSED, "the deleted account's token stays dead");
      assert.equal((await me(old)).status, 401);
      assert.deepEqual(await statuses(await tokenFor(sub)), REFUSED, "a token without `tv` is refused too");
      assert.deepEqual(await statuses(fresh), ACCEPTED);
    });

    test(`${name}: a repeat sign-in (upsert conflict) keeps token_version, so earlier tokens stay valid`, async () => {
      const first = await signIn(start, callback, cookie);
      const v = version(sub);
      const second = await signIn(start, callback, cookie);
      assert.equal(version(sub), v);
      assert.equal(claims(second).tv, v);
      assert.equal((await me(first)).status, 200);
      assert.equal((await me(second)).status, 200);
    });

    test(`${name}: an account from before this change keeps version 0, and its tokens without \`tv\` keep working`, async () => {
      addUser(db, { id: sub }); // token_version defaults to 0, as for every row migration 0008 added the column to
      const legacy = await tokenFor(sub);
      assert.equal("tv" in claims(legacy), false);
      assert.equal((await me(legacy)).status, 200);
      assert.deepEqual(await statuses(legacy), ACCEPTED);

      const signedIn = await signIn(start, callback, cookie);
      assert.equal(version(sub), 0, "the upsert's conflict branch leaves token_version alone");
      assert.equal(claims(signedIn).tv, 0);
      assert.equal((await me(legacy)).status, 200, "nobody is signed out by the change");
      assert.equal((await me(signedIn)).status, 200);
    });
  }
});

describe("newTokenVersion", () => {
  test("is an integer in 1..2^31-1", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const v = newTokenVersion();
      assert.ok(Number.isSafeInteger(v) && v >= 1 && v <= MAX_VERSION, String(v));
      seen.add(v);
    }
    assert.ok(seen.size > 1990, "random, not a counter or a constant");
  });

  test("never 0: a zero draw is redrawn, and the top bit is dropped", () => {
    const draws = [0, 0x80000000, 0x80000005];
    const m = mock.method(globalThis.crypto, "getRandomValues", <T extends ArrayBufferView | null>(buf: T): T => {
      (buf as unknown as Uint32Array)[0] = draws.shift() ?? 1;
      return buf;
    });
    try {
      assert.equal(newTokenVersion(), 5);
      assert.equal(m.mock.callCount(), 3);
    } finally {
      m.mock.restore();
    }
  });
});
