// lib/sync.ts: the one rule for what signs a tab out. Only a 401 from the study-state endpoint
// (/api/state) for the token that is still stored does; GET /api/lab/progress (syncLabProgress) never
// signs out by itself: its 401 asks the state probe, which decides. 403 (suspended), 404 (a Worker
// without the route), 5xx and network errors keep the user signed in and the local data as it is.
import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { getLabProgress, getServerLabXp } from "../../lib/lab-progress";
import { getStudyState, setStudyState } from "../../lib/study-store";
import { startSync, syncLabProgress } from "../../lib/sync";

class MemoryStorage {
  private m = new Map<string, string>();
  tokenRemovals = 0;
  get length() {
    return this.m.size;
  }
  key(i: number) {
    return [...this.m.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, String(v));
  }
  removeItem(k: string) {
    if (k === "sf_token" && this.m.has(k)) this.tokenRemovals++;
    this.m.delete(k);
  }
}
const storage = new MemoryStorage();
Object.assign(globalThis, { localStorage: storage, window: { addEventListener() {}, removeEventListener() {} } });

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
const tokenOf = (sub: string, n = 1) => `${b64({ alg: "none" })}.${b64({ sub, username: sub, name: sub, avatar: "", exp: 4_102_444_800, n })}.sig`;

type Answer = number | "network";
interface Seen {
  method: string;
  path: string;
  auth: string | null;
}
let seen: Seen[] = [];

/** A fake Worker: `lab` answers GET /api/lab/progress, `state` GET/PUT /api/state. */
function worker(opts: { lab: Answer | (() => Promise<Response>); state?: Answer | (() => Promise<Response>); labBody?: unknown }) {
  const reply = (a: Answer, body: unknown): Response => {
    if (a === "network") throw new TypeError("fetch failed");
    if (a === 200) return Response.json(body);
    const error = a === 401 ? "unauthorized" : a === 403 ? "account_suspended" : a === 404 ? "not_found" : "internal_error";
    return Response.json({ error, ...(a === 403 ? { message: "This account is suspended.", until: "2026-11-20T09:30:00.000Z" } : {}) }, { status: a });
  };
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    seen.push({ method: init?.method ?? "GET", path: url.pathname, auth: new Headers(init?.headers).get("Authorization") });
    if (url.pathname === "/api/lab/progress") return typeof opts.lab === "function" ? opts.lab() : reply(opts.lab, opts.labBody ?? { passed: [] });
    if (url.pathname === "/api/state") {
      const s = opts.state ?? 200;
      return typeof s === "function" ? s() : reply(s, { data: null });
    }
    return reply(404, null);
  }) as typeof fetch;
}
const calls = (path: string) => seen.filter((s) => s.path === path);

beforeEach(() => {
  seen = [];
  storage.tokenRemovals = 0;
});

test("lab progress 403 (suspended), 404 (old Worker), 500 and network errors: no state probe, still signed in", async () => {
  const token = tokenOf("u1");
  storage.setItem("sf_token", token);
  for (const lab of [403, 404, 500, "network"] as const) {
    worker({ lab });
    await syncLabProgress("u1");
    assert.equal(calls("/api/state").length, 0, `${lab}: no probe`);
    assert.equal(storage.getItem("sf_token"), token, `${lab}: still signed in`);
  }
  assert.equal(storage.tokenRemovals, 0);
});

test("lab progress 401 asks the state probe; the tab stays signed in when the probe accepts the token", async () => {
  const token = tokenOf("u1");
  storage.setItem("sf_token", token);
  worker({ lab: 401, state: 200 });
  await syncLabProgress("u1");
  assert.deepEqual(calls("/api/state").map((c) => [c.method, c.auth]), [["GET", `Bearer ${token}`]]);
  assert.equal(storage.getItem("sf_token"), token);
});

test("lab progress 401 + state probe 403/404/network: still signed in (only a 401 on the probe signs out)", async () => {
  const token = tokenOf("u1");
  storage.setItem("sf_token", token);
  for (const state of [403, 404, "network"] as const) {
    worker({ lab: 401, state });
    await syncLabProgress("u1");
    assert.equal(storage.getItem("sf_token"), token, `probe ${state}`);
  }
  assert.equal(storage.tokenRemovals, 0);
});

test("lab progress 401 + state probe 401: signed out once", async () => {
  storage.setItem("sf_token", tokenOf("u1"));
  worker({ lab: 401, state: 401 });
  await syncLabProgress("u1");
  assert.equal(storage.getItem("sf_token"), null);
  assert.equal(storage.tokenRemovals, 1);
});

test("a 401 for a token that is no longer stored (new sign-in meanwhile) neither probes nor signs out", async () => {
  const old = tokenOf("u1", 1);
  const fresh = tokenOf("u1", 2);
  storage.setItem("sf_token", old);
  worker({
    lab: async () => {
      storage.setItem("sf_token", fresh); // signed in again while the request was in flight
      return Response.json({ error: "unauthorized" }, { status: 401 });
    },
    state: 401,
  });
  await syncLabProgress("u1");
  assert.equal(calls("/api/state").length, 0);
  assert.equal(storage.getItem("sf_token"), fresh);
  storage.removeItem("sf_token");
});

test("a Worker from before the XP ledger (no `xp` in /api/lab/progress) still merges the passes", async () => {
  storage.setItem("sf_token", tokenOf("u2"));
  worker({ lab: 200, labBody: { passed: [{ ref: "old/lesson/a", at: "2026-10-01T00:00:00Z" }] } });
  await syncLabProgress("u2");
  assert.ok(getLabProgress()["old/lesson/a"], "pass merged");
  assert.notEqual(getServerLabXp()?.user, "u2", "no server XP recorded from an answer without it");
  assert.ok(storage.getItem("sf_token"));
  storage.removeItem("sf_token");
});

test("page load: startSync and syncLabProgress both see 401 -> one state request, one sign-out", async () => {
  const token = tokenOf("u3");
  storage.setItem("sf_token", token);
  let releaseState!: () => void;
  const stateGate = new Promise<void>((ok) => (releaseState = ok));
  worker({
    lab: async () => Response.json({ error: "unauthorized" }, { status: 401 }),
    state: async () => {
      await stateGate; // the probe is still in flight when the lab 401 arrives
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    },
  });
  const sync = startSync();
  const lab = syncLabProgress("u3");
  await new Promise((r) => setTimeout(r, 20));
  releaseState();
  await Promise.all([sync, lab]);
  assert.equal(calls("/api/state").length, 1, "the lab 401 shares the in-flight probe");
  assert.equal(storage.getItem("sf_token"), null);
  assert.equal(storage.tokenRemovals, 1, "signed out once");
});

test("page load while suspended: the state probe's 403 keeps the token and the local study state", async () => {
  const token = tokenOf("u4");
  storage.setItem("sf_token", token);
  setStudyState({ ...getStudyState(), lessons: { "frontend/html-css": { done: 1_750_000_000_000 } }, updated: 5 }, false);
  worker({ lab: 403, state: 403 });
  await startSync(); // the previous test signed out, so this page load pulls again
  await syncLabProgress("u4");
  assert.deepEqual(calls("/api/state").map((c) => c.method), ["GET"]);
  assert.equal(storage.getItem("sf_token"), token);
  assert.ok(getStudyState().lessons["frontend/html-css"]?.done, "local progress kept");
  assert.equal(storage.tokenRemovals, 0);
  storage.removeItem("sf_token"); // the debounced push then finds no token and does nothing
});
