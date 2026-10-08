// Per-IP request limiter in the router: production defaults and the RATE_LIMIT_* overrides.
// Each test uses its own client IP because the buckets live in module memory.
import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import type { Env } from "../src/util";
import { TestD1 } from "./helpers/d1";
import { call, makeEnv } from "./helpers/harness";

let env: Env;

beforeEach(() => {
  env = makeEnv(new TestD1());
});

/** Status codes of `n` sequential requests from one IP. */
async function hits(path: string, ip: string, n: number, e: Env = env): Promise<number[]> {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push((await call(e, path, { headers: { "CF-Connecting-IP": ip } })).status);
  return out;
}

describe("per-IP rate limit", () => {
  test("defaults: 60 requests a minute in general, 10 on /api/auth/*", async () => {
    const general = await hits("/api/health", "192.0.2.1", 61);
    assert.ok(general.slice(0, 60).every((s) => s === 200));
    assert.equal(general[60], 429);

    const auth = await hits("/api/auth/me", "192.0.2.2", 11);
    assert.ok(auth.slice(0, 10).every((s) => s !== 429));
    assert.equal(auth[10], 429);
  });

  test("RATE_LIMIT_PER_MIN and RATE_LIMIT_AUTH_PER_MIN override the defaults", async () => {
    const e = { ...env, RATE_LIMIT_PER_MIN: "3", RATE_LIMIT_AUTH_PER_MIN: "25" };
    assert.deepEqual(await hits("/api/health", "192.0.2.3", 4, e), [200, 200, 200, 429]);
    const auth = await hits("/api/auth/me", "192.0.2.4", 26, e);
    assert.ok(auth.slice(0, 25).every((s) => s !== 429));
    assert.equal(auth[25], 429);
  });

  test("invalid overrides fall back to the defaults", async () => {
    const e = { ...env, RATE_LIMIT_PER_MIN: "0", RATE_LIMIT_AUTH_PER_MIN: "lots" };
    const general = await hits("/api/health", "192.0.2.5", 61, e);
    assert.equal(general.filter((s) => s === 429).length, 1);
    const auth = await hits("/api/auth/me", "192.0.2.6", 11, e);
    assert.equal(auth[10], 429);
  });
});
