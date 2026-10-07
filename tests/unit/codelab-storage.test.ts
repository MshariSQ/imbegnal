import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PREFS,
  FONT_MAX,
  FONT_MIN,
  LOCAL_HISTORY_MAX,
  MAX_DRAFTS,
  addLocalRun,
  clampFont,
  clearLocalHistory,
  draftKey,
  getDraft,
  loadDrafts,
  loadLocalHistory,
  loadPrefs,
  readJson,
  saveDraft,
  savePrefs,
  removeDraft,
  type KV,
  type LocalRun,
} from "../../lib/codelab/storage";

function memory(initial: Record<string, string> = {}): KV & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => void (data[k] = v),
    removeItem: (k) => void delete data[k],
  };
}

const throwing: KV = {
  getItem() {
    throw new Error("blocked");
  },
  setItem() {
    throw new DOMException("full", "QuotaExceededError");
  },
  removeItem() {
    throw new Error("blocked");
  },
};

test("draft keys are scoped per language, exercise, challenge and fork", () => {
  assert.equal(draftKey({ kind: "free", lang: "rust" }), "free:rust");
  assert.equal(draftKey({ kind: "exercise", ref: "a/b/c" }), "ex:a/b/c");
  assert.equal(draftKey({ kind: "demo", ref: "a/b/3" }), "demo:a/b/3");
  assert.equal(draftKey({ kind: "challenge", id: "x", lang: "go" }), "ch:x:go");
  assert.equal(draftKey({ kind: "fork", id: "abc123" }), "fork:abc123");
});

test("a draft round-trips and keeps languages separate", () => {
  const kv = memory();
  assert.ok(saveDraft(kv, "free:python", { code: "print(1)", stdin: "in", at: 1 }));
  assert.ok(saveDraft(kv, "free:go", { code: "package main", stdin: "", at: 2 }));
  assert.deepEqual(getDraft(kv, "free:python"), { code: "print(1)", stdin: "in", at: 1 });
  assert.equal(getDraft(kv, "free:go")?.code, "package main");
  assert.equal(getDraft(kv, "free:ruby"), null);
  removeDraft(kv, "free:go");
  assert.equal(getDraft(kv, "free:go"), null);
});

test("storage failures never throw: every operation degrades to memory-only", () => {
  assert.equal(saveDraft(throwing, "k", { code: "x", stdin: "", at: 1 }), false);
  assert.equal(getDraft(throwing, "k"), null);
  assert.deepEqual(loadDrafts(null), {});
  assert.deepEqual(loadPrefs(throwing), { ...DEFAULT_PREFS, lastLang: undefined });
  assert.equal(savePrefs(throwing, DEFAULT_PREFS), false);
  assert.deepEqual(loadLocalHistory(throwing), []);
  assert.doesNotThrow(() => clearLocalHistory(throwing));
  assert.equal(readJson(null, "k", 7), 7);
});

test("corrupted storage content is ignored, valid siblings survive", () => {
  assert.deepEqual(loadDrafts(memory({ "imb-codelab-drafts-v1": "{not json" })), {});
  const kv = memory({
    "imb-codelab-drafts-v1": JSON.stringify({ good: { code: "a", stdin: "", at: 1 }, bad: { code: 5 }, worse: null }),
  });
  assert.deepEqual(Object.keys(loadDrafts(kv)), ["good"]);
});

test("oversized drafts are not persisted and the store keeps only the newest ones", () => {
  const kv = memory();
  assert.equal(saveDraft(kv, "big", { code: "x".repeat(200_001), stdin: "", at: 1 }), false);
  for (let i = 0; i < MAX_DRAFTS + 5; i++) saveDraft(kv, `k${i}`, { code: String(i), stdin: "", at: i });
  const keys = Object.keys(loadDrafts(kv));
  assert.equal(keys.length, MAX_DRAFTS);
  assert.ok(keys.includes(`k${MAX_DRAFTS + 4}`));
  assert.ok(!keys.includes("k0"));
});

test("preferences are validated and font size is clamped", () => {
  assert.equal(clampFont(3), FONT_MIN);
  assert.equal(clampFont(99), FONT_MAX);
  assert.equal(clampFont(15.6), 16);
  assert.equal(clampFont(Number.NaN), DEFAULT_PREFS.fontSize);
  const kv = memory();
  savePrefs(kv, { fontSize: 18, wrap: true, lastLang: "rust", preferBrowser: true });
  assert.deepEqual(loadPrefs(kv), { fontSize: 18, wrap: true, lastLang: "rust", preferBrowser: true });
  const junk = memory({ "imb-codelab-prefs-v1": JSON.stringify({ fontSize: "huge", wrap: "yes", lastLang: 4 }) });
  assert.deepEqual(loadPrefs(junk), { ...DEFAULT_PREFS, lastLang: undefined });
});

const run = (i: number, over: Partial<LocalRun> = {}): LocalRun => ({
  id: `id${i}`,
  lang: "javascript",
  code: `console.log(${i})`,
  stdin: "",
  status: "ok",
  exitCode: 0,
  runMs: i,
  at: i,
  ...over,
});

test("local history keeps the newest 20 runs, newest first", () => {
  const kv = memory();
  for (let i = 0; i < LOCAL_HISTORY_MAX + 7; i++) addLocalRun(kv, run(i));
  const h = loadLocalHistory(kv);
  assert.equal(h.length, LOCAL_HISTORY_MAX);
  assert.equal(h[0].id, `id${LOCAL_HISTORY_MAX + 6}`);
  assert.equal(h[h.length - 1].id, "id7");
});

test("local history de-duplicates by id, skips huge programs and can be cleared", () => {
  const kv = memory();
  addLocalRun(kv, run(1));
  addLocalRun(kv, run(1, { status: "runtime_error" }));
  assert.equal(loadLocalHistory(kv).length, 1);
  assert.equal(loadLocalHistory(kv)[0].status, "runtime_error");
  addLocalRun(kv, run(2, { code: "x".repeat(50_001) }));
  assert.equal(loadLocalHistory(kv).length, 1);
  clearLocalHistory(kv);
  assert.deepEqual(loadLocalHistory(kv), []);
});
