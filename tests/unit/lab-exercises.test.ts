import { test } from "node:test";
import assert from "node:assert/strict";
import { roadmaps } from "../../data/roadmaps";
import { NODE_DATA } from "../../data/roadmap-nodes";
import { hasLesson, loadLesson } from "../../data/lessons";
import type { LabExerciseSection } from "../../data/lessons/types";
import { matchOutput } from "../../shared/match";
import { localSupports, runLocal } from "../helpers/exec-local";

// runLocal reports the run step alone (runMs), like the runner. Java (single-file source
// launch) and TypeScript (type stripping) still translate the program inside that step.
const IN_RUN_COMPILE_MS: Partial<Record<string, number>> = {
  typescript: 1500,
  java: 5000,
};

/** The eight tracks that existed before the specialty tracks; each must ship at least one graded lab. */
const LEGACY_TRACKS = ["cyber-security", "artificial-intelligence", "data-science", "cloud-computing", "devops", "frontend", "backend", "ui-ux"];

interface LabCase {
  ref: string;
  track: string;
  lab: LabExerciseSection;
}

async function collectLabs(): Promise<LabCase[]> {
  const labs: LabCase[] = [];
  for (const r of roadmaps) {
    for (const node of NODE_DATA[r.id] ?? []) {
      if (!hasLesson(r.id, node.id)) continue;
      const lesson = await loadLesson(r.id, node.id);
      for (const s of lesson?.sections ?? []) {
        if (s.type === "lab") labs.push({ ref: `${r.id}/${node.id}/${s.id}`, track: r.id, lab: s });
      }
    }
  }
  return labs;
}

test("lab exercises", async (t) => {
  const labs = await collectLabs();

  await t.test("there are 10-14 graded labs per the curriculum plan, at least one in every legacy track", () => {
    assert.ok(labs.length >= 10, `only ${labs.length} lab exercises`);
    for (const track of LEGACY_TRACKS) assert.ok(labs.some((l) => l.track === track), `track ${track} has no lab exercise`);
  });

  await t.test("lab refs are unique and URL-safe (they travel in /code-lab/?ex=)", () => {
    const seen = new Set<string>();
    for (const { ref } of labs) {
      assert.match(ref, /^[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/, ref);
      assert.ok(!seen.has(ref), `duplicate ${ref}`);
      seen.add(ref);
    }
  });

  for (const { ref, lab } of labs) {
    await t.test(`lab shape: ${ref}`, () => {
      assert.ok(lab.prompt.en.trim().length > 40 && lab.prompt.ar.trim().length > 40, "bilingual prompt");
      assert.match(lab.prompt.ar, /[\u0600-\u06FF]/, "the Arabic prompt is written in Arabic");
      assert.ok(lab.tests.length >= 2 && lab.tests.length <= 6, `${lab.tests.length} tests (want 2-6)`);
      assert.ok(lab.hints.length >= 2, "progressive hints");
      for (const h of lab.hints) assert.ok(h.en.trim() && h.ar.trim());
      for (const test of lab.tests) assert.ok(test.name.en.trim() && test.name.ar.trim(), "bilingual test names");
      assert.match(lab.starterCode, /TODO/, "starter code has TODO comments");
      assert.ok(lab.solution.trim().length > 0 && lab.solution !== lab.starterCode);
      assert.ok(!/https?:\/\//.test(lab.starterCode + lab.solution), "no network access in exercises");
    });

    await t.test(`reference solution passes every test: ${ref}`, { skip: !localSupports(lab.lang) }, () => {
      for (const test of lab.tests) {
        const r = runLocal(lab.lang, lab.solution, test.stdin ?? "");
        const ms = r.runMs ?? 0;
        assert.equal(r.exitCode, 0, `${test.name.en}: exit ${r.exitCode}\n${r.stderr}`);
        assert.ok(!r.timedOut, `${test.name.en}: timed out`);
        assert.ok(
          matchOutput(r.stdout, test.expected, test.mode ?? "trim", test.epsilon),
          `${test.name.en}\nexpected: ${JSON.stringify(test.expected)}\nactual:   ${JSON.stringify(r.stdout)}`
        );
        assert.ok(ms < 2000 + (IN_RUN_COMPILE_MS[lab.lang] ?? 0), `${test.name.en}: ran for ${ms} ms (limit 2 s)`);
      }
    });

    await t.test(`untouched starter code fails at least one test: ${ref}`, { skip: !localSupports(lab.lang) }, () => {
      const failed = lab.tests.filter((test) => {
        const r = runLocal(lab.lang, lab.starterCode, test.stdin ?? "");
        return r.exitCode !== 0 || !matchOutput(r.stdout, test.expected, test.mode ?? "trim", test.epsilon);
      });
      assert.ok(failed.length >= 1, "the starter already passes every test, so the exercise would be trivially 'passed'");
    });
  }
});
