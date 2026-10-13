// AI_DAILY_LIMIT_FREE / _PRO / _GLOBAL are read like every other Worker number (positiveInt in
// lab/config.ts): a value that is not a positive integer falls back to the default. Before, a
// non-numeric value became NaN, and `count > NaN` is never true, so the limit (the global one is
// the spend kill switch) disappeared.
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import type { Env } from "../src/util";
import { TestD1 } from "./helpers/d1";
import { addUser, call, makeEnv, tokenFor } from "./helpers/harness";

let db: TestD1;
let realFetch: typeof fetch;

const STREAM = [
  ["message_start", { type: "message_start", message: { id: "m", type: "message", role: "assistant", model: "claude-test", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 0 } } }],
  ["content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }],
  ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "ok" } }],
  ["content_block_stop", { type: "content_block_stop", index: 0 }],
  ["message_delta", { type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 1 } }],
  ["message_stop", { type: "message_stop" }],
]
  .map(([event, data]) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  .join("");

beforeEach(() => {
  db = new TestD1();
  addUser(db, { id: "u1" });
  addUser(db, { id: "p1", plan: "pro" });
  realFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(STREAM, { headers: { "Content-Type": "text/event-stream" } })) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

const envWith = (vars: Partial<Env>) => makeEnv(db, { ANTHROPIC_API_KEY: "test-key-not-real", ...vars });

async function ask(env: Env, user: string): Promise<number> {
  const res = await call(env, "/api/ai/chat", {
    token: await tokenFor(user),
    body: { messages: [{ role: "user", content: "What is a loop?" }], track: "python", lesson: "basics", context: "Loops repeat.", lessonTitle: "Basics" },
  });
  await res.text();
  return res.status;
}

/** Questions answered before the first 429, asking at most `max` times. */
async function answered(env: Env, user: string, max: number): Promise<number> {
  for (let i = 0; i < max; i++) if ((await ask(env, user)) !== 200) return i;
  return max;
}

describe("AI_DAILY_LIMIT_* parsing", () => {
  for (const bad of ["lots", "", "  ", "-5", "0", "2.5", "1e3x"]) {
    test(`AI_DAILY_LIMIT_FREE=${JSON.stringify(bad)} falls back to the default of 20 questions`, async () => {
      assert.equal(await answered(envWith({ AI_DAILY_LIMIT_FREE: bad }), "u1", 25), 20);
    });
  }

  test("a valid value is used as is", async () => {
    assert.equal(await answered(envWith({ AI_DAILY_LIMIT_FREE: "3" }), "u1", 10), 3);
    assert.equal(await answered(envWith({ AI_DAILY_LIMIT_PRO: "4" }), "p1", 10), 4);
  });

  test("AI_DAILY_LIMIT_PRO=\"lots\" falls back to the default of 200", async () => {
    db.execute("INSERT INTO ai_usage (github_id, day, count) VALUES ('p1', ?, 199)", new Date().toISOString().slice(0, 10));
    assert.equal(await answered(envWith({ AI_DAILY_LIMIT_PRO: "lots" }), "p1", 5), 1);
  });

  test("AI_DAILY_LIMIT_GLOBAL=\"lots\" keeps the global ceiling at its default of 600", async () => {
    db.execute("INSERT INTO ai_usage (github_id, day, count) VALUES ('_global', ?, 600)", new Date().toISOString().slice(0, 10));
    assert.equal(await ask(envWith({ AI_DAILY_LIMIT_GLOBAL: "lots" }), "u1"), 429, "the spend kill switch still holds");
    assert.equal(await ask(envWith({ AI_DAILY_LIMIT_GLOBAL: "601" }), "u1"), 200);
  });
});
