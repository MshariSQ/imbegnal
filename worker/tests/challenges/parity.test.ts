// Parity guard between the PUBLIC challenge metadata (data/challenges) and the SERVER-ONLY graders
// (worker/src/graders/data), plus the registry join the API relies on. The parity checks are
// skipped while both registries are empty (nothing authored yet).
import { test } from "node:test";
import assert from "node:assert/strict";
import { challenges } from "../../../data/challenges";
import { roadmaps } from "../../../data/roadmaps";
import { SUBMIT_LIMITS, type ChallengeGrader, type ChallengeMeta } from "../../../shared/challenges";
import { LANG_IDS } from "../../../shared/languages";
import { graders } from "../../src/graders/data";
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

test("registry: duplicate ids keep the first definition and never throw", () => {
  const reg = createRegistry([meta("a", "flag"), { ...meta("a", "flag"), points: 999 }], [{ id: "a", kind: "flag", flagHash: "0".repeat(64) }]);
  assert.equal(reg.metas.length, 1);
  assert.equal(reg.entry("a")?.meta.points, 10);
});

test("the production registry builds from the real data files", () => {
  assert.equal(defaultRegistry.metas.length, challenges.length);
});
