import type { ChallengeGrader, OutputTest } from "../../../../shared/challenges";

/** SERVER-ONLY graders for the "algorithms" group (tracks: data-structures-algorithms, databases, data-science, artificial-intelligence). Matching meta: data/challenges/algorithms.ts */

// ── deterministic generators ──────────────────────────────────────────────────
// Large hidden inputs are generated from fixed seeds instead of being pasted in, which keeps this
// file small. The runner caps stdin at 64 KiB, so "large" means roughly 10 000 numbers.

/** mulberry32: tiny seeded PRNG, identical on every JS engine. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const randInt = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

// ── dsa-pair-sum-count ───────────────────────────────────────────────────────

function pairSumCount(cards: number[], target: number): number {
  const seen = new Map<number, number>();
  let total = 0;
  for (const v of cards) {
    total += seen.get(target - v) ?? 0;
    seen.set(v, (seen.get(v) ?? 0) + 1);
  }
  return total;
}

function pairSumTest(name: string, cards: number[], target: number, extra: Partial<OutputTest> = {}): OutputTest {
  return {
    name,
    stdin: `${cards.length} ${target}\n${cards.join(" ")}\n`,
    expected: String(pairSumCount(cards, target)),
    hidden: true,
    ...extra,
  };
}

const pairSumDense = (() => {
  const r = rng(20261007);
  return Array.from({ length: 10_000 }, () => randInt(r, 0, 9_999));
})();
const pairSumFewDistinct = (() => {
  const r = rng(77);
  return Array.from({ length: 10_000 }, () => randInt(r, 1, 50));
})();

const dsaPairSumCount: ChallengeGrader = {
  id: "dsa-pair-sum-count",
  kind: "output",
  tests: [
    { name: "example", stdin: "6 10\n3 7 5 5 5 2\n", expected: "4" },
    { name: "negatives", stdin: "4 0\n1 -1 2 -2\n", expected: "2" },
    { name: "no pairs", stdin: "3 100\n1 2 3\n", expected: "0" },
    pairSumTest("all equal", Array<number>(2_000).fill(7), 14),
    pairSumTest("single card", [2], 4),
    pairSumTest("zero target", [0, 0, 0, 5, -5], 0),
    pairSumTest("beyond int32", [1_000_000_000, 1_000_000_000, 999_999_999, -1_000_000_000, -1_000_000_000], 2_000_000_000),
    pairSumTest("negative beyond int32", [-1_000_000_000, -1_000_000_000, -999_999_999, 1_000_000_000], -2_000_000_000),
    pairSumTest("dense 10000", pairSumDense, 10_000, { timeoutMs: 2_000 }),
    pairSumTest("few distinct 10000", pairSumFewDistinct, 51, { timeoutMs: 2_000 }),
  ],
};

export const algorithmsGraders: ChallengeGrader[] = [dsaPairSumCount];
