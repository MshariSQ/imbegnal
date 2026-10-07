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

// ── dsa-bracket-balance ──────────────────────────────────────────────────────

const CLOSER_TO_OPENER: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

function isBalanced(s: string): boolean {
  const stack: string[] = [];
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
    else if (ch in CLOSER_TO_OPENER && stack.pop() !== CLOSER_TO_OPENER[ch]) return false;
  }
  return stack.length === 0;
}

function bracketsTest(name: string, strings: string[], hidden = true): OutputTest {
  return {
    name,
    stdin: `${strings.length}\n${strings.join("\n")}\n`,
    expected: strings.map((s) => (isBalanced(s) ? "yes" : "no")).join("\n"),
    mode: "lines",
    hidden: hidden || undefined,
  };
}

/** A balanced bracket string of exactly `pairs` pairs, with random letters sprinkled in. */
function randomBalanced(r: () => number, pairs: number): string {
  const kinds = ["()", "[]", "{}"];
  const stack: string[] = [];
  let out = "";
  let opened = 0;
  while (opened < pairs || stack.length > 0) {
    if (opened < pairs && (stack.length === 0 || r() < 0.55)) {
      const k = kinds[randInt(r, 0, 2)];
      out += k[0];
      stack.push(k[1]);
      opened++;
    } else {
      out += stack.pop();
    }
    if (r() < 0.2) out += "abc xyz 019"[randInt(r, 0, 10)];
  }
  return out;
}

const deepOpen = Array.from({ length: 3_000 }, (_, i) => "([{"[i % 3]);
const deepNested = deepOpen.join("") + deepOpen.map((c) => ({ "(": ")", "[": "]", "{": "}" })[c]).reverse().join("");
const deepBroken = `${deepNested.slice(0, 2_999)}]${deepNested.slice(3_000)}`; // one wrong closer in the middle
const randomLong = randomBalanced(rng(4242), 2_500);
const randomLongBroken = `${randomLong.slice(0, 2_000)}${randomLong[2_000] === ")" ? "]" : ")"}${randomLong.slice(2_001)}`;

const dsaBracketBalance: ChallengeGrader = {
  id: "dsa-bracket-balance",
  kind: "code",
  harness: {
    python: `import sys

{{CODE}}


def _main():
    lines = sys.stdin.read().split("\\n")
    count = int(lines[0])
    out = []
    for i in range(1, count + 1):
        s = lines[i].rstrip("\\r") if i < len(lines) else ""
        out.append("yes" if is_balanced(s) else "no")
    print("\\n".join(out))


_main()
`,
    javascript: `{{CODE}}

const _lines = require("fs").readFileSync(0, "utf8").split("\\n");
const _count = parseInt(_lines[0], 10);
const _out = [];
for (let i = 1; i <= _count; i++) {
  const s = i < _lines.length ? _lines[i].replace(/\\r$/, "") : "";
  _out.push(isBalanced(s) ? "yes" : "no");
}
console.log(_out.join("\\n"));
`,
  },
  tests: [
    bracketsTest("example", ["()[]{}", "([{}])", "(]", "((", "a(b)c[d]{e}"], false),
    bracketsTest("order and types", ["([)]", ")(", "{[()()]}", "]"], false),
    bracketsTest("empty and plain text", ["", "no brackets here", "   ", "1 + 2 = 3"]),
    bracketsTest("never closed or closed too often", ["(()", "())", "}{", "[", "]", "{{{}}"]),
    bracketsTest("text around brackets", ["a(b[c]d)e", "((a)", 'print("(")', "if (x[i] > {y}) { return [1, 2]; }", "{[}]"]),
    bracketsTest("deep nesting", [deepNested, deepBroken, deepNested.slice(0, -1), deepNested.slice(1)]),
    bracketsTest("long random strings", [randomLong, randomLongBroken, randomLong + ")", "(" + randomLong]),
  ],
};

export const algorithmsGraders: ChallengeGrader[] = [dsaPairSumCount, dsaBracketBalance];
