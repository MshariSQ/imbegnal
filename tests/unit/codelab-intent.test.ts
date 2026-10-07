import { test } from "node:test";
import assert from "node:assert/strict";
import { codeLabHref, parseCodeLabQuery } from "../../shared/links";
import type { ChallengeMeta } from "../../shared/challenges";
import type { Lesson } from "../../data/lessons/types";
import { challengeStart, findDemoSection, findLabSection, intentKey, splitExerciseRef } from "../../lib/codelab/intent";
import { getLabLanguage } from "../../lib/codelab/langs";

const q = (s: string) => parseCodeLabQuery(new URLSearchParams(s));

test("every producer URL parses back to the same intent", () => {
  const intents = [
    { kind: "blank" as const },
    { kind: "blank" as const, lang: "rust" as const },
    { kind: "exercise" as const, ref: "cyber-security/python/sum-two" },
    { kind: "demo" as const, track: "frontend", lesson: "javascript", section: 3 },
    { kind: "challenge" as const, id: "caesar-1", lang: "go" as const },
    { kind: "snippet" as const, id: "abc12345" },
  ];
  for (const i of intents) {
    const href = codeLabHref(i);
    // JSON drops the `lang: undefined` the parser adds for intents without a language.
    assert.deepEqual(JSON.parse(JSON.stringify(q(href.split("?")[1] ?? ""))), JSON.parse(JSON.stringify(i)));
  }
});

test("hostile or malformed query values fall back to a blank lab", () => {
  assert.equal(q("ex=../../etc/passwd").kind, "blank");
  assert.equal(q("ex=a/b").kind, "blank");
  assert.equal(q("demo=a/b/x").kind, "blank");
  assert.equal(q("ch=Not%20Valid!").kind, "blank");
  assert.equal(q("fork=short").kind, "blank");
  assert.equal(q("lang=cobol").kind, "blank");
  assert.deepEqual(q("lang=c%2B%2B"), { kind: "blank", lang: "cpp" });
});

test("intent keys differ per target so the session re-mounts", () => {
  const keys = new Set([q("").kind, q("lang=go"), q("ex=a/b/c"), q("demo=a/b/1"), q("ch=x"), q("fork=abcdef")].map((i) => (typeof i === "string" ? i : intentKey(i))));
  assert.equal(keys.size, 6);
  assert.notEqual(intentKey(q("ex=a/b/c")), intentKey(q("ex=a/b/d")));
});

test("exercise refs split into track, lesson and exercise", () => {
  assert.deepEqual(splitExerciseRef("cyber-security/python/sum-two"), { track: "cyber-security", lesson: "python", exercise: "sum-two" });
  assert.equal(splitExerciseRef("nope"), null);
  assert.equal(splitExerciseRef("A/b/c"), null);
});

const lesson: Lesson = {
  nodeId: "n",
  title: { en: "T", ar: "ع" },
  estMinutes: 5,
  sections: [
    { type: "text", body: { en: "x", ar: "x" } },
    { type: "code-demo", lang: "js", code: "console.log(1)", explanation: { en: "", ar: "" } },
    { type: "exercise", lang: "python", prompt: { en: "", ar: "" }, starterCode: "# start", solution: "", hints: [], tests: [] },
    { type: "exercise", lang: "web", prompt: { en: "", ar: "" }, starterCode: "<h1></h1>", solution: "", hints: [], tests: [] },
    { type: "lab", id: "sum-two", lang: "go", prompt: { en: "", ar: "" }, starterCode: "package main", solution: "", hints: [], tests: [] },
  ],
};

test("lab sections are found by id; demo sections map runner languages", () => {
  assert.equal(findLabSection(lesson, "sum-two")?.lang, "go");
  assert.equal(findLabSection(lesson, "missing"), null);
  assert.deepEqual(findDemoSection(lesson, 1), { lang: "javascript", code: "console.log(1)" });
  assert.deepEqual(findDemoSection(lesson, 2), { lang: "python", code: "# start" });
  assert.deepEqual(findDemoSection(lesson, 3), { lang: "web", code: "<h1></h1>" });
  assert.equal(findDemoSection(lesson, 0), null, "text sections have no code");
  assert.equal(findDemoSection(lesson, 4), null, "lab sections are exercises, not demos");
  assert.equal(findDemoSection(lesson, 99), null);
});

const meta = (over: Partial<ChallengeMeta> = {}): ChallengeMeta => ({
  id: "c1",
  track: "cyber-security",
  topic: "crypto",
  title: { en: "T", ar: "ع" },
  summary: { en: "", ar: "" },
  description: { en: "", ar: "" },
  difficulty: 1,
  points: 100,
  estMinutes: 10,
  kind: "output",
  lang: "python",
  starterCode: { python: "# py", go: "// go" },
  sampleInput: "3\n",
  ...over,
});

test("challenge start: requested language wins when allowed, then the default, then any starter", () => {
  assert.deepEqual(challengeStart(meta(), "go"), { lang: "go", code: "// go", stdin: "3\n", allowed: challengeStart(meta()).allowed, submittable: true });
  assert.equal(challengeStart(meta()).lang, "python");
  assert.equal(challengeStart(meta({ allowedLangs: ["go"] }), "rust").lang, "go");
  assert.equal(challengeStart(meta({ allowedLangs: ["rust"], starterCode: {}, lang: undefined })).code, getLabLanguage("rust").hello);
});

test("only code/output challenges are submittable from Code Lab", () => {
  assert.equal(challengeStart(meta({ kind: "flag" })).submittable, false);
  assert.equal(challengeStart(meta({ kind: "code" })).submittable, true);
});
