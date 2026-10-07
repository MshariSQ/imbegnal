/**
 * REFERENCE SOLUTIONS ("spoiler vault") for the algorithms group.
 *
 * Intentionally public in this open-source repo and used ONLY by tests/unit/challenges-algorithms.test.ts
 * to prove that every challenge is solvable and graded correctly. Never import this file from the site,
 * the Worker or the runner.
 */
import type { ChallengeReference } from "../../../shared/challenges";

export const algorithmsReferences: ChallengeReference[] = [
  {
    id: "dsa-pair-sum-count",
    solutions: {
      python: `import sys

data = sys.stdin.read().split()
n, target = int(data[0]), int(data[1])
seen = {}
total = 0
for v in map(int, data[2:2 + n]):
    total += seen.get(target - v, 0)
    seen[v] = seen.get(v, 0) + 1
print(total)
`,
      javascript: `const data = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean).map(Number);
const n = data[0];
const target = data[1];
const seen = new Map();
let total = 0;
for (const v of data.slice(2, 2 + n)) {
  total += seen.get(target - v) || 0;
  seen.set(v, (seen.get(v) || 0) + 1);
}
console.log(total);
`,
      cpp: `#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;

int main() {
    int n;
    long long target;
    cin >> n >> target;
    unordered_map<long long, long long> seen;
    long long total = 0;
    for (int i = 0; i < n; i++) {
        long long v;
        cin >> v;
        auto it = seen.find(target - v);
        if (it != seen.end()) total += it->second;
        seen[v]++;
    }
    cout << total << endl;
    return 0;
}
`,
    },
  },
];
