// Challenges against the REAL stack: a flag solved through the UI is graded by the Worker
// (hash comparison, never a plaintext flag in the bundle), records points and first blood, and
// shows up on the leaderboard; an output challenge is graded by running the submission on the
// Docker runner against the hidden tests.
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { SITE, api, closeBrowser, newUser, openSession } from "./stack";
import { securityReferences } from "../../fixtures/challenge-references/security";
import type { ChallengesApiResponse, LeaderboardResponse, SubmitResponse } from "../../../shared/api";

after(closeBrowser);

const FLAG_ID = "sec-auth-log-hunt";
const OUTPUT_ID = "sec-password-strength";
const RUN_TIMEOUT = 120_000;

const reference = (id: string) => {
  const ref = securityReferences.find((r) => r.id === id);
  if (!ref) throw new Error(`no reference for ${id}`);
  return ref;
};

describe("Challenges · real Worker + runner", () => {
  it("a flag solved in the UI awards points and first blood, and lands on the leaderboard", { timeout: RUN_TIMEOUT }, async () => {
    const flag = reference(FLAG_ID).flag!;
    const first = await newUser("ctf-first");
    const second = await newUser("ctf-second");

    const s = await openSession(first);
    try {
      await s.page.goto(`${SITE}/challenges/${FLAG_ID}/`);
      const input = s.page.locator('input[name="flag"]');
      await input.waitFor();

      // A wrong flag is refused without points.
      await input.fill("IMB{not-the-flag}");
      await input.press("Enter");
      await s.page.getByTestId("ctf-incorrect").waitFor({ timeout: 30_000 });

      // The derived flag is accepted: points, first blood.
      await input.fill(flag);
      await input.press("Enter");
      await s.page.getByTestId("ctf-correct").waitFor({ timeout: 30_000 });
      assert.match(await s.page.getByTestId("ctf-correct").innerText(), /50/);
      await s.page.getByTestId("ctf-first-blood").waitFor();
      assert.deepEqual(s.errors, []);
    } finally {
      await s.context.close();
    }

    // The second solver gets the points but not first blood; a repeat awards nothing.
    const again = await api<SubmitResponse>(`/api/challenges/${FLAG_ID}/submit`, second, { body: { flag } });
    assert.equal(again.status, 200, JSON.stringify(again.body));
    assert.equal(again.body.correct, true);
    assert.equal(again.body.firstBlood, false);
    assert.equal(again.body.awarded, 50);
    const repeat = await api<SubmitResponse>(`/api/challenges/${FLAG_ID}/submit`, second, { body: { flag } });
    assert.equal(repeat.body.alreadySolved, true);
    assert.equal(repeat.body.awarded, 0);

    // Public stats and the leaderboard agree.
    const stats = await api<ChallengesApiResponse>("/api/challenges", first);
    const stat = stats.body.stats.find((c) => c.id === FLAG_ID);
    assert.ok(stat, "stats include the challenge");
    assert.equal(stat.solves, 2);
    assert.equal(stat.mine?.solved, true);
    assert.equal(stat.firstBlood?.name, first.name);

    const board = await api<LeaderboardResponse>("/api/leaderboard?track=cyber-security&period=all", first);
    assert.equal(board.status, 200);
    const mine = board.body.entries.find((e) => e.name === first.name);
    assert.ok(mine, `leaderboard lists ${first.name}`);
    assert.equal(mine.points, 50);
    assert.equal(mine.firstBloods, 1);

    // ...and so does the leaderboard page.
    const lb = await openSession(first);
    try {
      await lb.page.goto(`${SITE}/challenges/leaderboard/`);
      await lb.page.getByTestId("lb-rows").filter({ hasText: first.name }).waitFor({ timeout: 30_000 });
      assert.deepEqual(lb.errors, []);
    } finally {
      await lb.context.close();
    }
  });

  it("an output challenge runs the submission on the runner against hidden tests", { timeout: RUN_TIMEOUT }, async () => {
    const user = await newUser("ctf-output");
    const solution = reference(OUTPUT_ID).solutions!.python!;

    const wrong = await api<SubmitResponse>(`/api/challenges/${OUTPUT_ID}/submit`, user, { body: { lang: "python", code: "print('weak')\n" } });
    assert.equal(wrong.status, 200, JSON.stringify(wrong.body));
    assert.equal(wrong.body.correct, false);
    assert.equal(wrong.body.awarded, 0);

    const right = await api<SubmitResponse>(`/api/challenges/${OUTPUT_ID}/submit`, user, { body: { lang: "python", code: solution } });
    assert.equal(right.status, 200, JSON.stringify(right.body));
    assert.equal(right.body.correct, true, JSON.stringify(right.body.grade));
    assert.ok(right.body.awarded > 0);
    assert.equal(right.body.grade?.passed, true);
    // Hidden tests are graded but never revealed.
    for (const t of right.body.grade?.tests ?? []) if (t.hidden) assert.equal(t.expected, undefined);
  });
});
