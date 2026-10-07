// Login-CSRF nonce on the OAuth flows (GitHub and Google).
//
// The site passes a per-tab nonce to the start endpoint (?nonce=...). The Worker keeps it in the
// HttpOnly state cookie ("<state>.<nonce>") and appends it to the success fragment
// (#token=...&nonce=...). It is read ONLY from that cookie on the callback. A malformed nonce is
// ignored (documented choice): the flow continues without one and the site refuses the token.
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { parseStateCookie, stateCookieValue, verifyJWT, type Env } from "../src/util";
import { TestD1 } from "./helpers/d1";
import { JWT_SECRET, call, makeEnv } from "./helpers/harness";

const NONCE = "AbCdEfGhIjKlMnOpQrStUvWxYz012-_9"; // 32 chars, base64url
const OTHER_NONCE = "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz";

let env: Env;
let db: TestD1;
const originalFetch = globalThis.fetch;

beforeEach(() => {
  db = new TestD1();
  env = makeEnv(db, { GOOGLE_CLIENT_ID: "gid", GOOGLE_CLIENT_SECRET: "gsecret" });
  // Fake GitHub and Google: token exchange + profile. Anything else is a test bug.
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url === "https://github.com/login/oauth/access_token") return Response.json({ access_token: "gh-at" });
    if (url === "https://api.github.com/user") return Response.json({ id: 4242, login: "octo", name: "Octo Cat", avatar_url: "", email: "", bio: "" });
    if (url === "https://oauth2.googleapis.com/token") return Response.json({ access_token: "g-at" });
    if (url === "https://openidconnect.googleapis.com/v1/userinfo") return Response.json({ sub: "g-77", name: "Gee", email: "g@example.com", email_verified: true });
    throw new Error(`unexpected network access in test: ${url}`);
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

interface Provider {
  name: string;
  start: string;
  callback: string;
  cookie: string;
  authorizeHost: string;
}

const PROVIDERS: Provider[] = [
  { name: "GitHub", start: "/api/auth/github", callback: "/api/auth/callback", cookie: "sf_oauth_state", authorizeHost: "github.com" },
  { name: "Google", start: "/api/auth/google", callback: "/api/auth/google/callback", cookie: "imb_google_state", authorizeHost: "accounts.google.com" },
];

/** Starts a flow; returns the state sent to the provider and the raw state-cookie value. */
async function start(p: Provider, query = ""): Promise<{ res: Response; state: string; cookieValue: string; setCookie: string }> {
  const res = await call(env, `${p.start}${query}`);
  assert.equal(res.status, 302);
  const location = new URL(res.headers.get("Location") ?? "");
  assert.equal(location.host, p.authorizeHost);
  const state = location.searchParams.get("state") ?? "";
  const setCookie = res.headers.get("Set-Cookie") ?? "";
  const m = setCookie.match(new RegExp(`^${p.cookie}=([^;]*);`));
  assert.ok(m, `sets ${p.cookie}: ${setCookie}`);
  return { res, state, cookieValue: m[1], setCookie };
}

async function finish(p: Provider, query: string, cookieValue: string | null): Promise<Response> {
  return call(env, `${p.callback}?${query}`, { headers: cookieValue === null ? {} : { Cookie: `${p.cookie}=${cookieValue}` } });
}

/** Parses the success redirect: #token=...&nonce=... on the frontend callback page. */
function fragmentOf(res: Response): URLSearchParams {
  const loc = res.headers.get("Location") ?? "";
  assert.ok(loc.startsWith("https://imbegnal.com/auth/callback/#"), `success redirect: ${loc}`);
  return new URLSearchParams(loc.slice(loc.indexOf("#") + 1));
}

for (const p of PROVIDERS) {
  describe(`${p.name} login nonce`, () => {
    test("the start endpoint stores a valid nonce with the state in the HttpOnly cookie", async () => {
      const { state, cookieValue, setCookie, res } = await start(p, `?nonce=${NONCE}`);
      assert.equal(cookieValue, `${state}.${NONCE}`);
      assert.match(setCookie, /HttpOnly; Secure; SameSite=Lax; Path=\/api\/auth; Max-Age=600/);
      // The nonce never goes to the provider (it is not part of the OAuth state either).
      assert.ok(!(res.headers.get("Location") ?? "").includes(NONCE));
      assert.ok(!state.includes(NONCE));
    });

    test("malformed nonces are ignored: the cookie carries only the state", async () => {
      for (const bad of ["short", "x".repeat(65), "has.dot.inside.0123456789", "spaces%20are%20bad%20here", "%3Cscript%3Ealert(1)%3C%2Fscript%3E", ""]) {
        const { state, cookieValue } = await start(p, `?nonce=${bad}`);
        assert.equal(cookieValue, state, `nonce ${JSON.stringify(bad)} must be ignored`);
      }
      const plain = await start(p);
      assert.equal(plain.cookieValue, plain.state, "no nonce: unchanged from before");
    });

    test("a successful callback appends the cookie's nonce to the fragment", async () => {
      const { state, cookieValue } = await start(p, `?nonce=${NONCE}`);
      const res = await finish(p, `code=c&state=${state}`, cookieValue);
      assert.equal(res.status, 302);
      const frag = fragmentOf(res);
      assert.equal(frag.get("nonce"), NONCE);
      const payload = await verifyJWT(frag.get("token") ?? "", JWT_SECRET);
      assert.ok(payload, "a valid token");
      assert.match(res.headers.get("Set-Cookie") ?? "", new RegExp(`^${p.cookie}=; .*Max-Age=0`), "state cookie cleared");
    });

    test("without a nonce at the start, the fragment has none (old sites keep working)", async () => {
      const { state, cookieValue } = await start(p);
      const frag = fragmentOf(await finish(p, `code=c&state=${state}`, cookieValue));
      assert.ok(frag.get("token"));
      assert.equal(frag.get("nonce"), null);
    });

    test("a nonce passed only on the callback URL is ignored", async () => {
      const { state, cookieValue } = await start(p);
      const frag = fragmentOf(await finish(p, `code=c&state=${state}&nonce=${OTHER_NONCE}`, cookieValue));
      assert.equal(frag.get("nonce"), null);
    });

    test("the callback query cannot replace the cookie's nonce", async () => {
      const { state, cookieValue } = await start(p, `?nonce=${NONCE}`);
      const frag = fragmentOf(await finish(p, `code=c&state=${state}&nonce=${OTHER_NONCE}`, cookieValue));
      assert.equal(frag.get("nonce"), NONCE);
    });

    test("the state check is as strict as before, and failures do not leak the nonce", async () => {
      const { state, cookieValue } = await start(p, `?nonce=${NONCE}`);
      const failures = [
        await finish(p, `code=c&state=${state}`, null), // no cookie
        await finish(p, `code=c&state=wrong`, cookieValue), // wrong state
        await finish(p, `code=c`, cookieValue), // no state
        await finish(p, `state=${state}`, cookieValue), // no code
        await finish(p, `code=c&state=${encodeURIComponent(cookieValue)}`, cookieValue), // whole cookie as state
        await finish(p, `code=c&state=${state}`, NONCE), // cookie is only a nonce
      ];
      for (const res of failures) {
        assert.equal(res.status, 302);
        const loc = res.headers.get("Location") ?? "";
        assert.equal(loc, "https://imbegnal.com/auth/callback/?error=auth_failed");
        assert.ok(!loc.includes(NONCE) && !loc.includes("token="));
      }
    });
  });
}

describe("state cookie helpers", () => {
  test("round trip and malformed parts", () => {
    assert.deepEqual(parseStateCookie(stateCookieValue("s-1", NONCE)), { state: "s-1", nonce: NONCE });
    assert.deepEqual(parseStateCookie(stateCookieValue("s-1", "bad")), { state: "s-1", nonce: null });
    assert.deepEqual(parseStateCookie(stateCookieValue("s-1", null)), { state: "s-1", nonce: null });
    assert.deepEqual(parseStateCookie("s-1.not valid!"), { state: "s-1", nonce: null });
    assert.deepEqual(parseStateCookie(null), { state: null, nonce: null });
  });
});

describe("email/password sign-in is unaffected", () => {
  test("register and login return the token in JSON, with no nonce and no redirect", async () => {
    const reg = await call(env, "/api/auth/register", { body: { name: "Ema", email: "ema@example.com", password: "correct horse battery" } });
    assert.equal(reg.status, 201, await reg.clone().text());
    assert.equal(reg.headers.get("Location"), null);
    const regBody = (await reg.json()) as Record<string, unknown>;
    assert.equal(typeof regBody.token, "string");
    assert.equal("nonce" in regBody, false);

    const login = await call(env, "/api/auth/login", { body: { email: "ema@example.com", password: "correct horse battery" } });
    assert.equal(login.status, 200);
    assert.equal(login.headers.get("Location"), null);
    const body = (await login.json()) as Record<string, unknown>;
    assert.ok(await verifyJWT(String(body.token), JWT_SECRET));
  });
});
