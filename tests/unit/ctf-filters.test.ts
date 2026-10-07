import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_FILTERS,
  filterItems,
  filtersToQuery,
  hasActiveFilters,
  matchesQuery,
  normalizeText,
  parseFilters,
  relatedItems,
  sortItems,
  type CtfFilters,
} from "../../lib/ctf/filters";
import { toListItems, tracksWithChallenges } from "../../lib/ctf/types";
import { fixtureChallenges } from "../fixtures/challenges/challenges";

const items = toListItems(fixtureChallenges);
const byId = (id: string) => items.find((i) => i.id === id)!;
const trackTitle = (id: string) => ({ "cyber-security": "Cyber Security", networking: "Networking" })[id] ?? id;
const ctx = (solved: string[] = [], lang: "en" | "ar" = "en") => ({ lang, solved: new Set(solved), trackTitle });
const ids = (xs: { id: string }[]) => xs.map((x) => x.id);
const f = (patch: Partial<CtfFilters>): CtfFilters => ({ ...DEFAULT_FILTERS, ...patch });

test("parseFilters reads every parameter and falls back to defaults on junk", () => {
  const sp = new URLSearchParams("track=networking&difficulty=3&status=solved&kind=code&q=hello&sort=points");
  assert.deepEqual(parseFilters(sp), { track: "networking", difficulty: 3, status: "solved", kind: "code", q: "hello", sort: "points" });
  const junk = new URLSearchParams("difficulty=9&status=nope&kind=x&sort=random");
  assert.deepEqual(parseFilters(junk), DEFAULT_FILTERS);
  assert.deepEqual(parseFilters(new URLSearchParams("")), DEFAULT_FILTERS);
});

test("parseFilters drops unknown tracks only when the valid set is given and caps q", () => {
  assert.equal(parseFilters(new URLSearchParams("track=ghost")).track, "ghost");
  assert.equal(parseFilters(new URLSearchParams("track=ghost"), new Set(["networking"])).track, "all");
  assert.equal(parseFilters(new URLSearchParams("track=networking"), new Set(["networking"])).track, "networking");
  assert.equal(parseFilters(new URLSearchParams(`q=${"a".repeat(500)}`)).q.length, 80);
});

test("filtersToQuery emits only non-default values and round-trips", () => {
  assert.equal(filtersToQuery(DEFAULT_FILTERS), "");
  const full = f({ track: "databases", difficulty: 2, status: "unsolved", kind: "flag", q: " sql ", sort: "newest" });
  const qs = filtersToQuery(full);
  assert.equal(qs, "track=databases&difficulty=2&status=unsolved&kind=flag&q=sql&sort=newest");
  assert.deepEqual(parseFilters(new URLSearchParams(qs)), { ...full, q: "sql" });
  assert.equal(filtersToQuery(f({ q: "   " })), "");
});

test("hasActiveFilters ignores the sort order", () => {
  assert.equal(hasActiveFilters(f({ sort: "points" })), false);
  assert.equal(hasActiveFilters(f({ kind: "flag" })), true);
  assert.equal(hasActiveFilters(f({ q: "x" })), true);
});

test("normalizeText folds case, diacritics, tatweel and alef/ya/ta-marbuta forms", () => {
  assert.equal(normalizeText("  Hello  "), "hello");
  assert.equal(normalizeText("مُحَقِّق"), "محقق");
  assert.equal(normalizeText("أحمد"), normalizeText("احمد"));
  assert.equal(normalizeText("شيفرة"), normalizeText("شيفره"));
  assert.equal(normalizeText("مستوى"), normalizeText("مستوي"));
  assert.equal(normalizeText("الــقيصر"), "القيصر");
});

test("filter by track, difficulty and kind", () => {
  assert.deepEqual(ids(filterItems(items, f({ track: "data-structures-algorithms" }), ctx())).sort(), ["fizzbuzz-sum", "interval-merge"]);
  assert.deepEqual(ids(filterItems(items, f({ difficulty: 1 }), ctx())).sort(), ["caesar-warmup", "css-specificity", "fizzbuzz-sum"]);
  assert.deepEqual(ids(filterItems(items, f({ kind: "code" }), ctx())).sort(), ["interval-merge", "scheduler-sim"]);
  assert.deepEqual(ids(filterItems(items, f({ track: "cyber-security", difficulty: 2, kind: "flag" }), ctx())), ["hidden-in-logs"]);
});

test("filter by solved status uses the solved set", () => {
  const c = ctx(["caesar-warmup", "fizzbuzz-sum"]);
  assert.deepEqual(ids(filterItems(items, f({ status: "solved" }), c)).sort(), ["caesar-warmup", "fizzbuzz-sum"]);
  assert.equal(filterItems(items, f({ status: "unsolved" }), c).length, items.length - 2);
  assert.equal(filterItems(items, f({ status: "solved" }), ctx()).length, 0);
});

test("text search matches title, summary, topic, tags and track name in the current language", () => {
  assert.deepEqual(ids(filterItems(items, f({ q: "caesar" }), ctx())), ["caesar-warmup"]);
  assert.deepEqual(ids(filterItems(items, f({ q: "forensics" }), ctx())), ["hidden-in-logs"]);
  assert.deepEqual(ids(filterItems(items, f({ q: "WARM-UP" }), ctx())).sort(), ["caesar-warmup", "fizzbuzz-sum"]);
  assert.deepEqual(ids(filterItems(items, f({ q: "networking" }), ctx())), ["packet-detective"]);
  assert.deepEqual(ids(filterItems(items, f({ q: "intervals merge" }), ctx())), ["interval-merge"]);
  assert.equal(filterItems(items, f({ q: "zzzz" }), ctx()).length, 0);
  // Arabic searches the Arabic text only
  assert.deepEqual(ids(filterItems(items, f({ q: "قيصر" }), ctx([], "ar"))), ["caesar-warmup"]);
  assert.equal(filterItems(items, f({ q: "قيصر" }), ctx([], "en")).length, 0);
});

test("matchesQuery treats an empty needle as a match and requires every word", () => {
  assert.equal(matchesQuery(byId("caesar-warmup"), "  ", ctx()), true);
  assert.equal(matchesQuery(byId("caesar-warmup"), "caesar crypto", ctx()), true);
  assert.equal(matchesQuery(byId("caesar-warmup"), "caesar sql", ctx()), false);
});

test("recommended sort ramps difficulty, then points, then registry order", () => {
  const out = ids(sortItems(items, "recommended", () => 0));
  assert.deepEqual(out.slice(0, 3), ["fizzbuzz-sum", "caesar-warmup", "css-specificity"]); // 40, 50, 60 pts at difficulty 1
  assert.equal(out[out.length - 1], "scheduler-sim");
});

test("points, solves and newest sorts", () => {
  assert.equal(sortItems(items, "points", () => 0)[0].id, "scheduler-sim");
  const solves: Record<string, number> = { "css-specificity": 5000, "caesar-warmup": 10 };
  const bySolves = sortItems(items, "solves", (id) => solves[id] ?? 0);
  assert.deepEqual(ids(bySolves).slice(0, 2), ["css-specificity", "caesar-warmup"]);
  assert.equal(sortItems(items, "newest", () => 0)[0].id, "css-specificity"); // latest addedAt
});

test("newest falls back to registry order when addedAt is missing", () => {
  const bare = items.map((i, n) => ({ ...i, addedAt: undefined, order: n }));
  assert.equal(sortItems(bare, "newest", () => 0)[0].id, items[items.length - 1].id);
});

test("sortItems never mutates its input", () => {
  const before = ids(items);
  sortItems(items, "points", () => 0);
  assert.deepEqual(ids(items), before);
});

test("relatedItems prefers same track, then topic, then nearest difficulty, and excludes the current one", () => {
  const rel = relatedItems(items, byId("caesar-warmup"), 3);
  assert.equal(rel[0].id, "hidden-in-logs"); // same track
  assert.ok(!ids(rel).includes("caesar-warmup"));
  assert.equal(rel.length, 3);
  assert.equal(relatedItems(items, byId("caesar-warmup"), 0).length, 0);
});

test("tracksWithChallenges keeps roadmap order and only tracks that have challenges", () => {
  const roadmaps = [
    { id: "a", title: "A", icon: "i", accent: "x" },
    { id: "b", title: "B", icon: "i", accent: "x" },
    { id: "c", title: "C", icon: "i", accent: "x" },
  ];
  assert.deepEqual(tracksWithChallenges([{ track: "c" }, { track: "a" }], roadmaps).map((t) => t.id), ["a", "c"]);
  assert.deepEqual(tracksWithChallenges([], roadmaps), []);
});

test("toListItems strips statements, files, hints and graders-related fields", () => {
  const li = toListItems(fixtureChallenges)[0] as unknown as Record<string, unknown>;
  for (const k of ["description", "files", "hints", "starterCode", "sampleInput", "flagFormat"]) assert.ok(!(k in li), k);
  assert.equal(li.order, 0);
});
