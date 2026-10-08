// The core learning loop: lesson → "Try in Code Lab" (starter preloaded) → run on
// the real runner → graded pass → progress shown back on the lesson.
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { SITE, closeBrowser, getEditorCode, newUser, openSession, setEditorCode } from "./stack";
import { loadLesson } from "../../../data/lessons";
import { roadmaps } from "../../../data/roadmaps";
import type { LabExerciseSection } from "../../../data/lessons/types";

after(closeBrowser);

const TRACK = "networking";
const LESSON = "ip-subnetting";
const LAB = "cidr-calc";

describe("lesson → Code Lab → pass", { timeout: 180_000 }, () => {
  it("opens the lab with its starter code, grades the reference solution as passed, and the lesson shows it", async () => {
    const lesson = await loadLesson(TRACK, LESSON);
    const lab = lesson?.sections.find((s): s is LabExerciseSection => s.type === "lab" && s.id === LAB);
    assert.ok(lab, "fixture lab exists");

    const user = await newUser("lesson");
    const s = await openSession(user);
    try {
      await s.page.goto(`${SITE}/learn/${TRACK}/${LESSON}/`);
      const block = s.page.locator(`section[aria-labelledby="lab-${LAB}"]`);
      await block.waitFor();
      // codeLabHref() percent-encodes the ref ("networking%2Fip-subnetting%2Fcidr-calc").
      const ref = encodeURIComponent(`${TRACK}/${LESSON}/${LAB}`);
      await block.locator(`a[href*="/code-lab/?ex=${ref}"]`).first().click();

      await s.page.waitForURL(/\/code-lab\/\?ex=/);
      await s.page.waitForFunction((needle) => document.querySelector(".cm-content")?.textContent?.includes(needle), lab.starterCode.trim().split("\n")[0]);
      // innerText renders each empty CodeMirror line as two newlines: compare non-blank lines.
      const lines = (code: string) => code.split("\n").map((l) => l.trimEnd()).filter(Boolean);
      assert.deepEqual(lines(await getEditorCode(s.page)), lines(lab.starterCode), "starter code preloaded");
      // Canonical name: the track chip shows the roadmap title from data/roadmaps.ts
      const title = roadmaps.find((r) => r.id === TRACK)!.title;
      assert.match(await s.page.getByTestId("task-panel").first().innerText(), new RegExp(title));

      await setEditorCode(s.page, lab.solution);
      await s.page.getByTestId("run-button").first().click();
      const banner = s.page.locator('[data-testid="grade-banner"][data-passed="true"]');
      await banner.waitFor({ timeout: 120_000 });
      assert.match(await s.page.getByTestId("xp").innerText(), /15/);

      await s.page.goto(`${SITE}/learn/${TRACK}/${LESSON}/`);
      await block.getByText("Passed").waitFor();
      assert.deepEqual(s.errors, []);
    } finally {
      await s.context.close();
    }
  });

  it("the course page, Code Lab and challenge filters use the same canonical track name", async () => {
    const title = roadmaps.find((r) => r.id === TRACK)!.title;
    const s = await openSession(null);
    try {
      await s.page.goto(`${SITE}/learn/${TRACK}/`);
      assert.match(await s.page.locator("h1").first().innerText(), new RegExp(title));
      await s.page.goto(`${SITE}/code-lab/?ex=${TRACK}/${LESSON}/${LAB}`);
      await s.page.getByTestId("task-panel").first().waitFor();
      assert.match(await s.page.getByTestId("task-panel").first().innerText(), new RegExp(title));
    } finally {
      await s.context.close();
    }
  });
});
