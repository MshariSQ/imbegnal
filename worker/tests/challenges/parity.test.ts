// Parity guard between the PUBLIC challenge metadata (data/challenges) and the SERVER-ONLY graders
// (worker/src/graders/data), plus the registry join the API relies on. The parity checks are
// skipped while both registries are empty (nothing authored yet).
import { test } from "node:test";
import assert from "node:assert/strict";
import { challenges } from "../../../data/challenges";
import { roadmaps } from "../../../data/roadmaps";
import { SUBMIT_LIMITS, type ChallengeGrader, type ChallengeMeta, type L10nText } from "../../../shared/challenges";
import { LANG_IDS } from "../../../shared/languages";
import { graders } from "../../src/graders/data";
import { challengeHints } from "../../src/graders/data/hints";
import { algorithmsHints } from "../../src/graders/data/hints/algorithms";
import { securityHints } from "../../src/graders/data/hints/security";
import { systemsHints } from "../../src/graders/data/hints/systems";
import { webHints } from "../../src/graders/data/hints/web";
import { createRegistry, defaultRegistry } from "../../src/graders/registry";

const empty = challenges.length === 0 && graders.length === 0;
const skip = empty ? "no challenges authored yet" : false;

test("every grader has a public meta with the same id and kind, and vice versa", { skip }, () => {
  const metaIds = new Set(challenges.map((c) => c.id));
  const graderIds = new Set(graders.map((g) => g.id));
  assert.deepEqual([...graderIds].filter((id) => !metaIds.has(id)), [], "graders without a data/challenges meta");
  assert.deepEqual([...metaIds].filter((id) => !graderIds.has(id)), [], "metas without a worker/src/graders/data grader");
  for (const g of graders) assert.equal(challenges.find((c) => c.id === g.id)?.kind, g.kind, `kind of ${g.id}`);
});

test("ids are unique, URL-safe and every track is a roadmap id", { skip }, () => {
  const ids = challenges.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate meta ids");
  const gids = graders.map((g) => g.id);
  assert.equal(new Set(gids).size, gids.length, "duplicate grader ids");
  const roadmapIds = new Set(roadmaps.map((r) => r.id));
  for (const c of challenges) {
    assert.match(c.id, /^[a-z0-9][a-z0-9-]{0,63}$/, `id ${c.id}`);
    assert.ok(roadmapIds.has(c.track), `${c.id}: track ${c.track} is not a roadmap id`);
  }
});

test("every authored grader is well formed and its meta is consistent with it", { skip }, () => {
  for (const g of graders) {
    const meta = challenges.find((c) => c.id === g.id);
    if (g.kind === "flag") {
      assert.match(g.flagHash, /^[0-9a-f]{64}$/, `${g.id}: flagHash must be a lowercase hex SHA-256`);
      continue;
    }
    assert.ok(g.tests.length > 0, `${g.id}: needs tests`);
    assert.ok(g.tests.length <= SUBMIT_LIMITS.maxTests, `${g.id}: more than ${SUBMIT_LIMITS.maxTests} tests are ignored`);
    if (g.kind === "code") {
      const langs = Object.keys(g.harness);
      assert.ok(langs.length > 0, `${g.id}: needs a harness`);
      for (const [lang, template] of Object.entries(g.harness)) {
        assert.ok((LANG_IDS as readonly string[]).includes(lang), `${g.id}: unknown language ${lang}`);
        assert.equal(template?.split("{{CODE}}").length, 2, `${g.id}/${lang}: the harness needs exactly one {{CODE}}`);
      }
      for (const lang of meta?.allowedLangs ?? []) assert.ok(g.harness[lang], `${g.id}: allowed language ${lang} has no harness`);
    }
  }
});

test("meta hints fit the 30-bit reveal mask, costs are non-negative", { skip }, () => {
  for (const c of challenges) {
    assert.ok((c.hints?.length ?? 0) <= SUBMIT_LIMITS.maxHints, `${c.id}: too many hints`);
    for (const h of c.hints ?? []) assert.ok(Number.isInteger(h.cost) && h.cost >= 0, `${c.id}: hint cost`);
  }
});

// ── hint texts (Worker-only) vs hint costs (public) ───────────────────────────
// The public meta lists only the COST of each hint; the text is released by POST .../hint. The two
// halves are joined by challenge id and hint position, so a count mismatch would either hide a hint
// (cost without text) or serve a text nobody is charged for. Both fail here, loudly.

/** Human-readable problems between the public hint costs and the Worker-only hint texts ([] = in sync). */
function hintParityProblems(metas: readonly ChallengeMeta[], texts: Readonly<Record<string, readonly L10nText[]>>): string[] {
  const problems: string[] = [];
  const metaIds = new Set(metas.map((m) => m.id));
  for (const m of metas) {
    const publicCount = m.hints?.length ?? 0;
    const textCount = Object.hasOwn(texts, m.id) ? texts[m.id].length : 0;
    if (publicCount !== textCount) problems.push(`${m.id}: ${publicCount} public hint cost(s) but ${textCount} Worker-only hint text(s)`);
    for (const h of m.hints ?? []) {
      if (Object.keys(h).join() !== "cost") problems.push(`${m.id}: a public hint carries more than its cost (${Object.keys(h).join(", ")})`);
    }
  }
  for (const id of Object.keys(texts)) if (!metaIds.has(id)) problems.push(`${id}: hint texts without a public challenge`);
  return problems;
}

test("every public hint has exactly one Worker-only text (same count, same order) and vice versa", { skip }, () => {
  assert.deepEqual(hintParityProblems(challenges, challengeHints), []);
  // The production registry hands the texts to the hint endpoint in the same order as the costs.
  for (const c of challenges) {
    const entry = defaultRegistry.entry(c.id);
    assert.ok(entry, `${c.id} is playable`);
    assert.equal(entry.hints.length, c.hints?.length ?? 0, `${c.id}: registry hint texts`);
    assert.deepEqual(entry.hints, challengeHints[c.id] ?? [], `${c.id}: registry texts are the Worker-only texts`);
  }
});

test("the hint parity check fails loudly on a count mismatch, an orphan text and a leaked text", () => {
  const m = (id: string, hints?: ChallengeMeta["hints"]): ChallengeMeta => ({ ...meta(id, "flag"), hints });
  const t = (n: number): L10nText[] => Array.from({ length: n }, (_, i) => ({ en: `en ${i}`, ar: `ar ${i}` }));
  assert.deepEqual(hintParityProblems([m("a", [{ cost: 1 }, { cost: 2 }])], { a: t(2) }), []);
  assert.deepEqual(hintParityProblems([m("a")], {}), []);
  assert.match(hintParityProblems([m("a", [{ cost: 1 }, { cost: 2 }])], { a: t(1) }).join("\n"), /a: 2 public hint cost\(s\) but 1 Worker-only/);
  assert.match(hintParityProblems([m("a", [{ cost: 1 }])], {}).join("\n"), /a: 1 public hint cost\(s\) but 0/);
  assert.match(hintParityProblems([m("a", [{ cost: 1 }])], { a: t(3) }).join("\n"), /a: 1 public hint cost\(s\) but 3/);
  assert.match(hintParityProblems([m("a")], { a: t(1) }).join("\n"), /a: 0 public hint cost\(s\) but 1/);
  assert.match(hintParityProblems([m("a")], { ghost: t(1) }).join("\n"), /ghost: hint texts without a public challenge/);
  const leaked = [{ cost: 1, text: { en: "x", ar: "y" } }] as unknown as ChallengeMeta["hints"];
  assert.match(hintParityProblems([m("a", leaked)], { a: t(1) }).join("\n"), /carries more than its cost \(cost, text\)/);
});

test("hint texts: ids are unique across the four groups and every text is a non-empty en+ar pair", { skip }, () => {
  const groups = [securityHints, systemsHints, algorithmsHints, webHints];
  const ids = groups.flatMap((g) => Object.keys(g));
  assert.equal(new Set(ids).size, ids.length, "a challenge id has hint texts in two groups");
  assert.equal(Object.keys(challengeHints).length, ids.length, "the index merges every group");
  for (const [id, texts] of Object.entries(challengeHints)) {
    assert.ok(texts.length <= SUBMIT_LIMITS.maxHints, `${id}: too many hints`);
    for (const [i, h] of texts.entries()) {
      assert.deepEqual(Object.keys(h).sort(), ["ar", "en"], `${id}[${i}] keys`);
      assert.ok(h.en.trim().length > 0 && h.ar.trim().length > 0, `${id}[${i}] is bilingual`);
    }
  }
});

// The registry join itself is tested with fixtures, so it is covered even while the data files are empty.
const meta = (id: string, kind: ChallengeMeta["kind"], track = "cyber-security"): ChallengeMeta => ({
  id, track, topic: "t", title: { en: id, ar: id }, summary: { en: "", ar: "" }, description: { en: "", ar: "" }, difficulty: 1, points: 10, estMinutes: 1, kind,
});

test("registry: a challenge is playable only when meta and grader agree on id and kind", () => {
  const g: ChallengeGrader[] = [
    { id: "a", kind: "flag", flagHash: "0".repeat(64) },
    { id: "b", kind: "output", tests: [] },
    { id: "orphan", kind: "flag", flagHash: "0".repeat(64) },
  ];
  const reg = createRegistry([meta("a", "flag"), meta("b", "flag", "frontend"), meta("c", "flag")], g);
  assert.deepEqual(reg.metas.map((m) => m.id), ["a", "b", "c"], "stats are listed for every public challenge");
  assert.ok(reg.entry("a"));
  assert.equal(reg.entry("b"), undefined, "kind mismatch");
  assert.equal(reg.entry("c"), undefined, "no grader");
  assert.equal(reg.entry("orphan"), undefined, "no meta");
  assert.deepEqual(reg.playableIds(), ["a"]);
  assert.deepEqual(reg.playableIds("frontend"), []);
  assert.equal(reg.meta("b")?.id, "b");
});

test("registry: entries carry the Worker-only hint texts of their own id (and an empty list otherwise)", () => {
  const texts = { a: [{ en: "A0", ar: "أ0" }], constructor: [{ en: "no", ar: "no" }] };
  const reg = createRegistry(
    [{ ...meta("a", "flag"), hints: [{ cost: 3 }] }, meta("b", "flag"), meta("constructor", "flag"), meta("toString", "flag")],
    ["a", "b", "constructor", "toString"].map((id): ChallengeGrader => ({ id, kind: "flag", flagHash: "0".repeat(64) })),
    texts,
  );
  assert.deepEqual(reg.entry("a")?.hints, [{ en: "A0", ar: "أ0" }]);
  assert.deepEqual(reg.entry("b")?.hints, []);
  assert.deepEqual(reg.entry("toString")?.hints, [], "inherited Object properties are not hint lists");
  assert.equal(createRegistry([meta("a", "flag")], [{ id: "a", kind: "flag", flagHash: "0".repeat(64) }]).entry("a")?.hints.length, 0, "texts default to none");
});

test("registry: duplicate ids keep the first definition and never throw", () => {
  const reg = createRegistry([meta("a", "flag"), { ...meta("a", "flag"), points: 999 }], [{ id: "a", kind: "flag", flagHash: "0".repeat(64) }]);
  assert.equal(reg.metas.length, 1);
  assert.equal(reg.entry("a")?.meta.points, 10);
});

test("the production registry builds from the real data files", () => {
  assert.equal(defaultRegistry.metas.length, challenges.length);
});
