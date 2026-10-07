// Login nonce (lib/auth-nonce.ts): the callback page saves an OAuth token only when the fragment
// echoes the nonce this tab stored when it started the sign-in.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { NONCE_KEY, NONCE_RE, NONCE_TTL_MS, begin, check, clear, makeNonce, type NonceStorage } from "../../lib/auth-nonce";
import type { ApiLevel } from "../../lib/capabilities";

class MemStorage implements NonceStorage {
  map = new Map<string, string>();
  getItem(k: string) {
    return this.map.has(k) ? (this.map.get(k) as string) : null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, String(v));
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
}

const T0 = 1_790_000_000_000;
const TOKEN = "header.payload.sig";
const frag = (o: Record<string, string>) => new URLSearchParams(o);

/** apiLevel stub that records whether it was asked. */
function level(l: ApiLevel) {
  const fn = () => {
    fn.calls++;
    return Promise.resolve(l);
  };
  fn.calls = 0;
  return fn;
}

describe("makeNonce / begin", () => {
  test("32 base64url characters, accepted by the Worker's rule, different every time", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const n = makeNonce();
      assert.equal(n.length, 32);
      assert.match(n, NONCE_RE);
      seen.add(n);
    }
    assert.equal(seen.size, 200);
    // All-0xff bytes exercise the "+" and "/" replacements.
    assert.equal(makeNonce((b) => b.fill(0xff)), "_".repeat(32));
    assert.equal(makeNonce((b) => b.fill(0xfb)), "-_v7".repeat(8));
  });

  test("stores the nonce with its creation time, replacing an earlier one", () => {
    const s = new MemStorage();
    const a = begin(s, T0);
    const b = begin(s, T0 + 5);
    assert.notEqual(a, b);
    assert.deepEqual(JSON.parse(s.getItem(NONCE_KEY) ?? ""), { n: b, t: T0 + 5 });
    clear(s);
    assert.equal(s.getItem(NONCE_KEY), null);
  });
});

describe("check", () => {
  test("match: the token is accepted and the API generation is not even asked", async () => {
    const s = new MemStorage();
    const n = begin(s, T0);
    const api = level("full");
    assert.deepEqual(await check(frag({ token: TOKEN, nonce: n }), T0 + 1000, { storage: s, apiLevel: api }), { ok: true, token: TOKEN, legacy: false });
    assert.equal(api.calls, 0);
  });

  test("mismatch: an attacker's link with another nonce is refused", async () => {
    const s = new MemStorage();
    begin(s, T0);
    const r = await check(frag({ token: TOKEN, nonce: makeNonce() }), T0 + 1000, { storage: s, apiLevel: level("legacy") });
    assert.deepEqual(r, { ok: false, reason: "nonce_mismatch" });
  });

  test("a nonce in the link but none stored in this tab (a fresh tab opened from a link) is refused, even with the old API", async () => {
    const r = await check(frag({ token: TOKEN, nonce: makeNonce() }), T0, { storage: new MemStorage(), apiLevel: level("legacy") });
    assert.deepEqual(r, { ok: false, reason: "nonce_mismatch" });
  });

  test("malformed fragment nonces and corrupt storage are mismatches", async () => {
    const s = new MemStorage();
    const n = begin(s, T0);
    assert.deepEqual(await check(frag({ token: TOKEN, nonce: `${n}!` }), T0, { storage: s, apiLevel: level("full") }), { ok: false, reason: "nonce_mismatch" });
    s.setItem(NONCE_KEY, "{not json");
    assert.deepEqual(await check(frag({ token: TOKEN, nonce: n }), T0, { storage: s, apiLevel: level("full") }), { ok: false, reason: "nonce_mismatch" });
    s.setItem(NONCE_KEY, JSON.stringify({ n }));
    assert.deepEqual(await check(frag({ token: TOKEN, nonce: n }), T0, { storage: s, apiLevel: level("full") }), { ok: false, reason: "nonce_mismatch" });
  });

  test("missing nonce: refused with the new API and when the API generation is unknown (fail closed)", async () => {
    for (const l of ["full", "unknown"] as const) {
      const s = new MemStorage();
      begin(s, T0);
      const api = level(l);
      assert.deepEqual(await check(frag({ token: TOKEN }), T0, { storage: s, apiLevel: api }), { ok: false, reason: "nonce_missing" }, l);
      assert.equal(api.calls, 1);
      assert.deepEqual(await check(frag({ token: TOKEN, nonce: "" }), T0, { storage: s, apiLevel: level(l) }), { ok: false, reason: "nonce_missing" });
    }
  });

  test("old-API compatibility: without a nonce in the fragment, the legacy Worker's token is accepted as before", async () => {
    // With or without a stored nonce: the old Worker never echoes one.
    assert.deepEqual(await check(frag({ token: TOKEN }), T0, { storage: new MemStorage(), apiLevel: level("legacy") }), { ok: true, token: TOKEN, legacy: true });
    const s = new MemStorage();
    begin(s, T0);
    assert.deepEqual(await check(frag({ token: TOKEN }), T0, { storage: s, apiLevel: () => "legacy" }), { ok: true, token: TOKEN, legacy: true });
    assert.equal(s.getItem(NONCE_KEY), null, "still consumed");
  });

  test("expired: older than 10 minutes (or from the future) is refused", async () => {
    const s = new MemStorage();
    let n = begin(s, T0);
    assert.equal((await check(frag({ token: TOKEN, nonce: n }), T0 + NONCE_TTL_MS, { storage: s, apiLevel: level("full") })).ok, true, "exactly 10 minutes is fine");
    n = begin(s, T0);
    assert.deepEqual(await check(frag({ token: TOKEN, nonce: n }), T0 + NONCE_TTL_MS + 1, { storage: s, apiLevel: level("full") }), { ok: false, reason: "nonce_expired" });
    n = begin(s, T0);
    assert.deepEqual(await check(frag({ token: TOKEN, nonce: n }), T0 - 1, { storage: s, apiLevel: level("full") }), { ok: false, reason: "nonce_expired" });
  });

  test("one-time use: a second check with the same nonce fails, and failures consume it too", async () => {
    const s = new MemStorage();
    const n = begin(s, T0);
    assert.equal((await check(frag({ token: TOKEN, nonce: n }), T0, { storage: s, apiLevel: level("full") })).ok, true);
    assert.equal(s.getItem(NONCE_KEY), null);
    assert.deepEqual(await check(frag({ token: TOKEN, nonce: n }), T0, { storage: s, apiLevel: level("full") }), { ok: false, reason: "nonce_mismatch" });

    const n2 = begin(s, T0);
    await check(frag({ token: TOKEN, nonce: makeNonce() }), T0, { storage: s, apiLevel: level("full") });
    assert.deepEqual(await check(frag({ token: TOKEN, nonce: n2 }), T0, { storage: s, apiLevel: level("full") }), { ok: false, reason: "nonce_mismatch" });
  });

  test("no token: refused before anything else", async () => {
    const s = new MemStorage();
    const n = begin(s, T0);
    assert.deepEqual(await check(frag({ nonce: n }), T0, { storage: s, apiLevel: level("legacy") }), { ok: false, reason: "missing_token" });
    assert.deepEqual(await check(frag({}), T0, { storage: s, apiLevel: level("legacy") }), { ok: false, reason: "missing_token" });
  });
});
