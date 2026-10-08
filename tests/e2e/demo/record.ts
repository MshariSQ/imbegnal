/**
 * Records the demo GIF in docs/media/: lesson → "Try in Code Lab" → starter fails the tests →
 * reference solution → all tests pass (XP) → the lesson shows "Passed". Drives the REAL stack.
 *
 *   E2E_KEEP=1 E2E_SPECS=none node tests/e2e/run.mjs     # terminal 1: leaves the stack running
 *   node --import tsx tests/e2e/demo/record.ts             # terminal 2 (needs /usr/bin/ffmpeg)
 *
 * Output: docs/media/code-lab-demo.gif (and the raw .webm in tests/e2e/artifacts/demo/).
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, renameSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Page } from "playwright";
import { SITE, closeBrowser, getBrowser, newUser, setEditorCode } from "../full/stack";
import { loadLesson } from "../../../data/lessons";
import type { LabExerciseSection } from "../../../data/lessons/types";

const ROOT = resolve(__dirname, "../../..");
const RAW = join(ROOT, "tests/e2e/artifacts/demo");
const GIF = join(ROOT, "docs/media/code-lab-demo.gif");
const TRACK = "networking";
const LESSON = "ip-subnetting";
const LAB = "cidr-calc";
const SIZE = { width: 1280, height: 800 };

const pause = (page: Page, ms: number) => page.waitForTimeout(ms);

/** Brings the lab section's header (title, "Passed" badge, "Try in Code Lab") under the navbar. */
async function showLab(page: Page): Promise<void> {
  const block = page.locator(`section[aria-labelledby="lab-${LAB}"]`);
  await block.waitFor();
  await block.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: "instant" }));
}

async function main(): Promise<void> {
  const lesson = await loadLesson(TRACK, LESSON);
  const lab = lesson?.sections.find((s): s is LabExerciseSection => s.type === "lab" && s.id === LAB);
  if (!lab) throw new Error("demo lab not found");

  rmSync(RAW, { recursive: true, force: true });
  mkdirSync(RAW, { recursive: true });
  mkdirSync(join(ROOT, "docs/media"), { recursive: true });

  const user = await newUser("demo");
  const browser = await getBrowser();
  const context = await browser.newContext({ viewport: SIZE, recordVideo: { dir: RAW, size: SIZE }, colorScheme: "dark" });
  await context.addInitScript((token) => localStorage.setItem("sf_token", token), user.token);
  await context.route((url) => url.hostname !== "127.0.0.1" && url.hostname !== "localhost", (r) => r.abort("blockedbyclient"));
  const page = await context.newPage();

  // 1. The lesson, scrolled to its graded lab.
  await page.goto(`${SITE}/learn/${TRACK}/${LESSON}/`);
  const block = page.locator(`section[aria-labelledby="lab-${LAB}"]`);
  await showLab(page);
  await pause(page, 2500);

  // 2. One click into the Code Lab: starter code and the task are preloaded.
  await block.locator(`a[href*="/code-lab/?ex=${encodeURIComponent(`${TRACK}/${LESSON}/${LAB}`)}"]`).first().click();
  await page.waitForURL(/\/code-lab\/\?ex=/);
  await page.locator(".cm-content").first().waitFor();
  await pause(page, 2200);

  // 3. The starter runs on the sandboxed runner and fails the tests.
  await page.locator('[data-testid="run-button"]:visible').first().click();
  await page.locator('[data-testid="grade-banner"]').first().waitFor({ timeout: 120_000 });
  await pause(page, 2500);

  // 4. A working solution passes every test and earns XP.
  await setEditorCode(page, lab.solution);
  await pause(page, 900);
  await page.locator('[data-testid="run-button"]:visible').first().click();
  await page.locator('[data-testid="grade-banner"][data-passed="true"]').waitFor({ timeout: 120_000 });
  await pause(page, 4500);

  // 5. Back on the lesson, the lab is marked as passed.
  await page.goto(`${SITE}/learn/${TRACK}/${LESSON}/`);
  await block.getByText("Passed").first().waitFor();
  await showLab(page);
  await pause(page, 3500);

  await context.close(); // flushes the video
  await closeBrowser();

  const webm = readdirSync(RAW).find((f) => f.endsWith(".webm"));
  if (!webm) throw new Error("no video recorded");
  renameSync(join(RAW, webm), join(RAW, "demo.webm"));
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-i", join(RAW, "demo.webm"),
    // 1.6x speed (the runner waits are long), 5 fps, 760 px: about 2.5 MB.
    "-vf", "setpts=PTS/1.6,fps=5,scale=760:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=48:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle",
    "-loop", "0", GIF,
  ]);
  console.log(`wrote ${GIF} (${Math.round(statSync(GIF).size / 1024)} KiB)`);
}

main().catch(async (e) => {
  console.error(e);
  await closeBrowser();
  process.exit(1);
});
