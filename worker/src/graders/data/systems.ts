import type { ChallengeGrader } from "../../../../shared/challenges";

/**
 * SERVER-ONLY graders for the "systems" group (tracks: networking, operating-systems, devops, cloud-computing).
 * Matching meta: data/challenges/systems.ts. Generated expectations were produced by the reference solutions in
 * tests/fixtures/challenge-references/systems.ts and cross-checked in two languages.
 */
export const systemsGraders: ChallengeGrader[] = [
  {
    id: "cloud-cost-estimator",
    kind: "output",
    tests: [
      { name: "Free tier and two paid tiers", stdin: "3\n100 0.00\n1000 0.023\ninf 0.021\n2\nalice 50\nbob 1500.5\n", expected: "alice 0.00\nbob 31.21\n", mode: "float", epsilon: 0.006 },
      { name: "One flat tier, zero usage", stdin: "1\ninf 0.09\n3\napi 10\nweb 250\nidle 0\n", expected: "api 0.90\nweb 22.50\nidle 0.00\n", mode: "float", epsilon: 0.006 },
      { name: "Usage exactly on a tier boundary", stdin: "2\n500 0.10\ninf 0.04\n3\nedge 500\njust-over 501\njust-under 499.5\n", expected: "edge 50.00\njust-over 50.04\njust-under 49.95\n", mode: "float", epsilon: 0.006 },
      { name: "Five tiers, one very large customer", stdin: "5\n1 0.00\n10 0.50\n100 0.40\n10000 0.25\ninf 0.10\n4\nhobby 0.5\nsmall 12\nmid 4321.25\nwhale 12345678.9\n", expected: "hobby 0.00\nsmall 5.30\nmid 1095.81\nwhale 1236083.39\n", mode: "float", epsilon: 0.006, hidden: true },
      { name: "A premium last tier costs MORE per GB", stdin: "3\n50 0.20\n150 0.30\ninf 0.45\n3\nx 49.9\ny 150\nz 400.75\n", expected: "x 9.98\ny 40.00\nz 152.84\n", mode: "float", epsilon: 0.006, hidden: true },
      { name: "Many customers, sub-cent amounts", stdin: "2\n1000 0.0007\ninf 0.0003\n6\na 0.01\nb 3.5\nc 999.99\nd 1000\ne 1000.01\nf 250000\n", expected: "a 0.00\nb 0.00\nc 0.70\nd 0.70\ne 0.70\nf 75.40\n", mode: "float", epsilon: 0.006, hidden: true },
      { name: "Two tiers with a free allowance, fractional GB", stdin: "2\n5.5 0\ninf 1.25\n4\nu1 5.5\nu2 5.7\nu3 20.1\nu4 0\n", expected: "u1 0.00\nu2 0.25\nu3 18.25\nu4 0.00\n", mode: "float", epsilon: 0.006, hidden: true },
      { name: "Single customer, tiny tiers", stdin: "4\n2 1\n4 2\n6 3\ninf 4\n1\nsolo 9\n", expected: "solo 24.00\n", mode: "float", epsilon: 0.006, hidden: true },
    ],
  },
  {
    id: "os-clock-faults",
    kind: "code",
    harness: {
      python: `import sys

{{CODE}}

_tokens = sys.stdin.read().split()
print(clock_faults(int(_tokens[0]), [int(_t) for _t in _tokens[1:]]))
`,
      javascript: `{{CODE}}

const _tokens = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean).map(Number);
console.log(String(clockFaults(_tokens[0], _tokens.slice(1))));
`,
    },
    tests: [
      { name: "The textbook reference string, 3 frames", stdin: "3\n1 2 3 4 1 2 5 1 2 3 4 5\n", expected: "9\n" },
      { name: "A re-referenced page gets its second chance", stdin: "3\n1 2 3 4 2 5 3\n", expected: "6\n" },
      { name: "A tiny memory, 2 frames", stdin: "2\n1 2 1 3 1 2 3 4\n", expected: "7\n" },
      { name: "No references at all", stdin: "4\n", expected: "0\n", hidden: true },
      { name: "A single frame faults on every change", stdin: "1\n7 7 7 8 8 7 9 9 9 9\n", expected: "4\n", hidden: true },
      { name: "Page 0 is a real page, not an empty frame", stdin: "3\n0 0 1 2 0 3 0 4 2 0\n", expected: "7\n", hidden: true },
      { name: "More frames than distinct pages", stdin: "8\n1 2 3 4 1 2 3 4 5 6 5 6 1 2\n", expected: "6\n", hidden: true },
      { name: "Cyclic scan one page larger than memory", stdin: "5\n0 1 2 3 4 5 0 1 2 3 4 5 0 1 2 3 4 5 0 1 2 3 4 5 0 1 2 3 4 5 0 1 2 3 4 5\n", expected: "36\n", hidden: true },
      { name: "Random references with locality, 5 frames", stdin: "5\n7 8 7 7 8 3 2 8 7 2 1 7 4 2 1 8 0 6 7 2 0 8 1 0 0 3 3 0 7 5 7 3 8 3 4 7 0 1 7 4 6 8 1 4 5 3 8 4 0 1 1 6 1 4 6 1 0 0 3 3 0 7 6 6 6 1 3 4 5 1 4 5 0 6 1 2 3 1 0 0 7 7 2 8 3 7 8 3 2 6 6 1 6 6 3 0 4 4 0 3 2 6 1 0 2 3 7 4 0 5 4 6 1 1 1 3 3 0 5 5 7 2 7 2 6 2 2 4 3 3 3 2 8 3 6 7 1 6 0 1 1 0 8 4 3 6 4 6 7 4 8 2 1 2 3 7 8 1 4 3\n", expected: "70\n", hidden: true },
      { name: "Long random run, 7 frames", stdin: "7\n8 1 10 13 7 2 8 0 5 6 9 3 1 6 6 1 0 1 12 3 6 1 6 0 9 0 8 8 1 12 3 12 3 0 11 3 12 12 10 6 7 5 8 0 9 1 8 3 3 1 3 9 0 1 12 2 8 5 1 9 7 12 4 7 13 9 2 13 11 5 8 7 8 12 12 7 6 11 1 12 11 9 6 10 9 0 12 5 13 9 13 3 5 3 8 8 9 4 2 13 4 5 4 5 1 8 2 10 13 4 8 4 9 10 2 0 5 11 9 8 12 9 8 8 9 2 8 6 13 5 8 3 4 9 0 8 9 6 10 0 3 3 3 3 2 10 7 13 9 12 2 4 8 0 1 9 6 3 2 2 13 10 3 11 5 4 10 2 11 10 5 11 5 2 6 3 9 12 7 12 2 1 8 2 3 10 6 5 12 11 12 13 10 10 9 8 3 0 12 5 11 11 8 5 5 8 7 5 4 1 2 4 11 8 7 9 6 9 9 6 5 5 1 12 10 3 13 9 2 4 13 1 5 3 11 2 7 10 2 11 8 10 1 1 2 4 5 13 12 9 0 13 13 0 9 1 12 10 9 9 5 12 4 3 10 4 9 4 3 10 0 10 6 8 9 6 11 12 4 8 4 10 5 3 4 7 10 10 10 0 5 0 12 8 11 13 11 9 7 8 2 11 11 10 1 13 10 13 6 6 5 6 0 1 13 12 4 1 12 1 8 6 7 8 5 1 4 1 5 11 5 12 8 0 13 13 2 8 11 7 4 1 5 4 4 1 10 7 0 11 9 12 5 4 10 4 0 0 10 0 11 4 4 10 6 0 2 13 11 5 8 5 9 5 10 2 13 2 2 9 13 3 4 0 10 7 7 7 2 3 3 9 12 1 6 11 4 2 1 10 4 13 4 3 0 6 13 8 8 2 6 10 10 11 3 3 0 8 13 1 5 13 7 4 6 0 0 4 2 0 3 5 2 4 4 13 12 10 0 2 1 2 11 0 2 3 2 7 12 9 9 2 1 8 0 3 12 10 8 2 10 1 1 12 5 3 10 5 2 5 9 11 6 7 3 2 5 13 8 3 9 3 4 8 3 4 5 12 10 2 9 7 5 6 0 10 2 10 2 1\n", expected: "240\n", hidden: true },
      { name: "Large page numbers, 4 frames", stdin: "4\n100000 7 100000 2147483647 7 9 100000 8 2147483647 9 7\n", expected: "5\n", hidden: true },
    ],
  },
];
