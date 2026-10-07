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
];
