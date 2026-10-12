// "Delete the account, register again with the same email" must not reset quotas, abuse history or
// the flag brute-force limits. Everything goes through the real router: register, use the AI tutor,
// Code Lab and flag submissions, DELETE /api/account, register again.
import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, test } from "node:test";
import { hashPassword } from "../src/auth-email";
import type { Env } from "../src/util";
import { TestD1 } from "./helpers/d1";
import { JWT_SECRET, type RunnerStub, call, jsonOf, makeEnv, okResult, stubRunner, tokenFor as signedToken } from "./helpers/harness";

const PASSWORD = "correct horse battery";
const FLAG_CHALLENGE = "sec-auth-log-hunt"; // a flag challenge of the real registry
const PROBE = "import os\nos.system('curl https://example.com')"; // matches the network-probe signature

let db: TestD1;
let env: Env;
let stub: RunnerStub | null = null;
let tutorCalls = 0;

const today = () => new Date().toISOString().slice(0, 10);
const keyFor = (email: string, secret = JWT_SECRET) =>
  `email:${createHmac("sha256", secret).update(`imbegnal:email-account:v1|${email}`).digest("hex").slice(0, 32)}`;
const subOf = (token: string): string => JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")).sub;

async function register(email: string, e: Env = env) {
  const res = await call(e, "/api/auth/register", { body: { email, password: PASSWORD } });
  const body = await jsonOf<{ token?: string; error?: string }>(res);
  return { status: res.status, error: body.error, token: body.token ?? "", sub: body.token ? subOf(body.token) : "" };
}

async function login(email: string) {
  const res = await call(env, "/api/auth/login", { body: { email, password: PASSWORD } });
  const body = await jsonOf<{ token?: string; error?: string }>(res);
  return { status: res.status, token: body.token ?? "", sub: body.token ? subOf(body.token) : "" };
}

async function deleteAccount(token: string) {
  const res = await call(env, "/api/account", { method: "DELETE", token });
  assert.equal(res.status, 200, "account deleted");
}

const ask = (token: string) =>
  call(env, "/api/ai/chat", { token, body: { messages: [{ role: "user", content: "What is a loop?" }], track: "python", lesson: "basics", context: "Loops repeat.", lessonTitle: "Basics" } });
const run = (token: string, code = "print('hi')") => call(env, "/api/lab/run", { token, body: { lang: "python", code } });
const guess = (token: string, flag: string) => call(env, `/api/challenges/${FLAG_CHALLENGE}/submit`, { token, body: { flag } });

const usersWithKey = (sub: string) => db.query<{ n: number }>("SELECT COUNT(*) AS n FROM users WHERE github_id = ?", sub)[0].n;
const aiRows = (sub: string) => db.query<{ day: string; count: number }>("SELECT day, count FROM ai_usage WHERE github_id = ? ORDER BY day", sub);

/** A minimal Messages API stream: one text block, then end_turn. */
const TUTOR_SSE = (
  [
    ["message_start", { type: "message_start", message: { id: "msg_test", type: "message", role: "assistant", model: "claude-test", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 0 } } }],
    ["content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }],
    ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "A loop repeats." } }],
    ["content_block_stop", { type: "content_block_stop", index: 0 }],
    ["message_delta", { type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 4 } }],
    ["message_stop", { type: "message_stop" }],
  ] as const
)
  .map(([event, data]) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  .join("");

beforeEach(() => {
  db = new TestD1();
  env = makeEnv(db, {
    ANTHROPIC_API_KEY: "test-key-not-real",
    AI_DAILY_LIMIT_FREE: "1",
    RUN_DAILY_LIMIT_FREE: "2",
    ABUSE_NETWORK_PROBE_MAX: "2",
  });
  tutorCalls = 0;
  stub = stubRunner(() => okResult());
  // The tutor's model call never leaves the process: a canned stream for any Messages API URL,
  // everything else goes to the runner stub (which refuses unknown hosts).
  const runnerFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (new URL(url).pathname.endsWith("/v1/messages")) {
      tutorCalls++;
      return new Response(TUTOR_SSE, { headers: { "Content-Type": "text/event-stream" } });
    }
    return runnerFetch(input, init);
  }) as typeof fetch;
});

afterEach(() => {
  stub?.restore(); // also removes the tutor wrapper (restores the original fetch)
  stub = null;
});

describe("email account keys", () => {
  test("are a keyed hash of the normalized email: the same key comes back after delete + register, whatever the letter case", async () => {
    const first = await register("Learner@Example.com");
    assert.equal(first.status, 201);
    assert.equal(first.sub, keyFor("learner@example.com"));
    assert.match(first.sub, /^email:[0-9a-f]{32}$/);
    // Not a plain hash: knowing the email is not enough to compute the key that appears in the JWT.
    assert.notEqual(first.sub, `email:${createHash("sha256").update("learner@example.com").digest("hex").slice(0, 32)}`);
    assert.notEqual(first.sub, `email:${createHash("sha256").update("imbegnal:email-account:v1|learner@example.com").digest("hex").slice(0, 32)}`);

    const dup = await register("LEARNER@example.com");
    assert.equal(dup.status, 409);
    assert.equal(dup.error, "email_taken");
    assert.equal((await login("  learner@EXAMPLE.com ")).sub, first.sub);

    await deleteAccount(first.token);
    assert.equal(usersWithKey(first.sub), 0);
    const again = await register("  LEARNER@example.COM ");
    assert.equal(again.status, 201);
    assert.equal(again.sub, first.sub, "same email, same key");
    assert.equal((await login("learner@example.com")).sub, first.sub);

    const other = await register("someone-else@example.com");
    assert.equal(other.status, 201);
    assert.notEqual(other.sub, first.sub);
  });

  test("depend on JWT_SECRET", async () => {
    const otherDb = new TestD1();
    const res = await register("learner@example.com", makeEnv(otherDb, { JWT_SECRET: "another-test-secret-not-for-production" }));
    assert.equal(res.status, 201);
    assert.equal(res.sub, keyFor("learner@example.com", "another-test-secret-not-for-production"));
    assert.notEqual(res.sub, keyFor("learner@example.com"));
  });

  test("a row already holding the derived key answers 409 email_taken, like a taken email", async () => {
    const key = keyFor("taken@example.com");
    db.execute("INSERT INTO users (github_id, username, name, provider) VALUES (?, 'holder', 'Holder', 'github')", key);
    const res = await register("taken@example.com");
    assert.equal(res.status, 409);
    assert.equal(res.error, "email_taken");
    assert.equal(usersWithKey(key), 1);
    assert.equal(db.query("SELECT 1 FROM users WHERE email = 'taken@example.com'").length, 0);
  });

  test("an old-style email:<uuid> account still logs in and deletes; the next registration gets the derived key", async () => {
    const legacy = "email:6f1c2a8e-4b7d-4e2a-9c3f-0d5e7a9b1c2d";
    db.execute(
      "INSERT INTO users (github_id, username, name, avatar_url, email, bio, provider, password_hash) VALUES (?, 'old', 'Old', '', 'old@example.com', '', 'email', ?)",
      legacy,
      await hashPassword(PASSWORD),
    );
    const signedIn = await login("Old@Example.com");
    assert.equal(signedIn.status, 200);
    assert.equal(signedIn.sub, legacy);
    assert.equal((await register("old@example.com")).error, "email_taken");

    await deleteAccount(signedIn.token);
    assert.equal(usersWithKey(legacy), 0);
    assert.equal((await login("old@example.com")).status, 401);

    const fresh = await register("old@example.com");
    assert.equal(fresh.status, 201);
    assert.equal(fresh.sub, keyFor("old@example.com"));
    assert.equal((await login("old@example.com")).sub, fresh.sub);
  });
});

describe("an old-style email:<uuid> account: delete + register again", () => {
  const legacy = "email:6f1c2a8e-4b7d-4e2a-9c3f-0d5e7a9b1c2d";
  const addLegacy = async (email: string) =>
    db.execute(
      "INSERT INTO users (github_id, username, name, avatar_url, email, bio, provider, password_hash) VALUES (?, 'old', 'Old', '', ?, '', 'email', ?)",
      legacy,
      email,
      await hashPassword(PASSWORD),
    );

  test("the kept counters move to the derived key, so the next registration is still counted", async () => {
    await addLegacy("old@example.com");
    const signedIn = await login("old@example.com");
    assert.equal(signedIn.sub, legacy);
    assert.equal((await ask(signedIn.token)).status, 200); // the day's only AI question
    assert.equal((await run(signedIn.token, PROBE)).status, 200); // 1 of 2 runs, 1 of 2 network-probe signals
    for (let i = 0; i < 5; i++) assert.equal((await guess(signedIn.token, `IMB{wrong_${i}}`)).status, 200);

    await deleteAccount(signedIn.token);
    const fresh = await register("Old@Example.com");
    assert.equal(fresh.sub, keyFor("old@example.com"));
    assert.notEqual(fresh.sub, legacy);
    for (const t of ["lab_usage", "abuse_signals", "challenge_attempts"]) {
      assert.equal(db.query(`SELECT 1 FROM ${t} WHERE user_id = ?`, legacy).length, 0, `${t}: nothing left under the old key`);
    }
    assert.deepEqual(aiRows(legacy), []);

    const refused = await ask(fresh.token);
    assert.equal(refused.status, 429, "today's AI question still counts");
    assert.equal((await jsonOf<{ error: string }>(refused)).error, "limit_reached");
    assert.equal((await guess(fresh.token, "IMB{one_more}")).status, 429, "the wrong flags still rate limit");
    assert.equal((await run(fresh.token, PROBE)).status, 200); // run 2 of 2; the second probe signal
    assert.deepEqual(db.query("SELECT status FROM users WHERE github_id = ?", fresh.sub), [{ status: "suspended" }], "the earlier signal still counts");
    assert.deepEqual(db.query("SELECT count FROM lab_usage WHERE user_id = ? AND day = ?", fresh.sub, today()), [{ count: 2 }]);
  });

  test("rows already under the derived key are merged (counts add up), older rows are still erased", async () => {
    await addLegacy("merge@example.com");
    const derived = keyFor("merge@example.com");
    db.execute("INSERT INTO lab_usage (user_id, day, count) VALUES (?, ?, 3), (?, ?, 4), (?, '2026-01-01', 9)", legacy, today(), derived, today(), legacy);
    db.execute("INSERT INTO ai_usage (github_id, day, count) VALUES (?, ?, 2), (?, ?, 5)", legacy, today(), derived, today());
    db.execute("INSERT INTO abuse_signals (user_id, kind, detail, at) VALUES (?, 'resource', 'x', datetime('now')), (?, 'resource', 'old', datetime('now', '-2 days'))", legacy, legacy);
    const signedIn = await login("merge@example.com");
    await deleteAccount(signedIn.token);
    assert.deepEqual(db.query("SELECT user_id, day, count FROM lab_usage WHERE user_id IN (?, ?) ORDER BY day", legacy, derived), [{ user_id: derived, day: today(), count: 7 }]);
    assert.deepEqual(aiRows(derived), [{ day: today(), count: 7 }]);
    assert.deepEqual(db.query("SELECT user_id, detail FROM abuse_signals"), [{ user_id: derived, detail: "x" }]);
  });

  test("a current account (derived key) and other providers are not re-keyed", async () => {
    const current = await register("now@example.com");
    assert.equal((await ask(current.token)).status, 200);
    await deleteAccount(current.token);
    assert.deepEqual(aiRows(current.sub), [{ day: today(), count: 1 }]);
    db.execute("INSERT INTO users (github_id, username, name, email, provider) VALUES ('4242', 'gh', 'GH', 'gh@example.com', 'github')");
    db.execute("INSERT INTO ai_usage (github_id, day, count) VALUES ('4242', ?, 1)", today());
    assert.equal((await call(env, "/api/account", { method: "DELETE", token: await signedToken("4242") })).status, 200);
    assert.deepEqual(aiRows("4242"), [{ day: today(), count: 1 }], "a GitHub id stays a GitHub id");
  });
});

describe("delete + register again with the same email", () => {
  test("today's AI tutor counter still counts; older ai_usage rows are erased", async () => {
    const first = await register("tutor@example.com");
    const answer = await ask(first.token);
    assert.equal(answer.status, 200);
    assert.match(await answer.text(), /A loop repeats\./);
    assert.equal(tutorCalls, 1);
    assert.deepEqual(aiRows(first.sub), [{ day: today(), count: 1 }]);
    db.execute("INSERT INTO ai_usage (github_id, day, count) VALUES (?, '2026-01-01', 7)", first.sub);

    await deleteAccount(first.token);
    assert.deepEqual(aiRows(first.sub), [{ day: today(), count: 1 }], "only today's row is kept");

    const again = await register("Tutor@Example.com");
    assert.equal(again.sub, first.sub);
    const refused = await ask(again.token);
    assert.equal(refused.status, 429);
    assert.equal((await jsonOf<{ error: string }>(refused)).error, "limit_reached");
    assert.equal(tutorCalls, 1, "the model is not called");

    // Control: a different email has its own, untouched quota.
    const other = await register("other@example.com");
    const ok = await ask(other.token);
    assert.equal(ok.status, 200);
    await ok.text();
  });

  test("today's Code Lab run counter still counts", async () => {
    const first = await register("lab@example.com");
    assert.equal((await run(first.token)).status, 200);
    assert.equal((await run(first.token)).status, 200);

    await deleteAccount(first.token);
    assert.equal(db.query("SELECT 1 FROM lab_runs WHERE user_id = ?", first.sub).length, 0, "runs (code) are erased");

    const again = await register("LAB@example.com");
    assert.equal(again.sub, first.sub);
    const refused = await run(again.token);
    assert.equal(refused.status, 429);
    assert.deepEqual(
      (({ error, scope }) => ({ error, scope }))(await jsonOf<{ error: string; scope: string }>(refused)),
      { error: "quota_exceeded", scope: "user" },
    );
    assert.equal((await run((await register("lab2@example.com")).token)).status, 200, "control: another email is not limited");
  });

  test("recent wrong flags still rate limit; attempts older than 24 hours are erased; no flag text is kept", async () => {
    const first = await register("ctf@example.com");
    for (let i = 0; i < 5; i++) {
      const res = await guess(first.token, `IMB{wrong_guess_${i}}`);
      assert.equal(res.status, 200);
      assert.equal((await jsonOf<{ correct: boolean }>(res)).correct, false);
    }
    db.execute("INSERT INTO challenge_attempts (user_id, challenge_id, correct, at) VALUES (?, ?, 0, datetime('now', '-25 hours'))", first.sub, FLAG_CHALLENGE);

    await deleteAccount(first.token);
    const kept = db.query<Record<string, unknown>>("SELECT * FROM challenge_attempts WHERE user_id = ?", first.sub);
    assert.equal(kept.length, 5, "the 24-hour-old attempt is erased, the recent ones are kept");
    assert.ok(!JSON.stringify(kept).includes("wrong_guess"), "no flag text");
    assert.equal(db.query("SELECT 1 FROM challenge_progress WHERE user_id = ?", first.sub).length, 0, "progress is erased");

    const again = await register("ctf@EXAMPLE.com");
    assert.equal(again.sub, first.sub);
    const blocked = await guess(again.token, "IMB{one_more}");
    assert.equal(blocked.status, 429);
    assert.equal((await jsonOf<{ error: string }>(blocked)).error, "rate_limited");

    const other = await register("ctf2@example.com");
    assert.equal((await guess(other.token, "IMB{first_try}")).status, 200, "control: another email is not limited");
  });

  test("abuse signals from before the deletion still count toward an automatic suspension", async () => {
    const first = await register("probe@example.com");
    assert.equal((await run(first.token, PROBE)).status, 200);
    assert.deepEqual(db.query("SELECT kind FROM abuse_signals WHERE user_id = ?", first.sub), [{ kind: "network_probe" }]);
    assert.deepEqual(db.query("SELECT status FROM users WHERE github_id = ?", first.sub), [{ status: "active" }], "one signal is below the threshold of 2");

    await deleteAccount(first.token);
    const again = await register("Probe@example.com");
    assert.equal(again.sub, first.sub);
    assert.equal((await run(again.token, PROBE)).status, 200); // the second signal reaches the threshold
    assert.deepEqual(db.query("SELECT status FROM users WHERE github_id = ?", again.sub), [{ status: "suspended" }]);

    const refused = await run(again.token);
    assert.equal(refused.status, 403);
    assert.equal((await jsonOf<{ error: string }>(refused)).error, "account_suspended");
    // And deleting again cannot shake the suspension off.
    assert.equal((await call(env, "/api/account", { method: "DELETE", token: again.token })).status, 409);
  });
});
