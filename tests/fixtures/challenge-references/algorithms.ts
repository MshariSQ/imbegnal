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
  {
    id: "dsa-bracket-balance",
    solutions: {
      python: `def is_balanced(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack
`,
      javascript: `function isBalanced(s) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
    else if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;
}
`,
    },
  },
  {
    id: "dsa-grid-shortest-path",
    solutions: {
      python: `import sys
from collections import deque

rows, cols = map(int, sys.stdin.readline().split())
grid = [sys.stdin.readline().rstrip("\\n") for _ in range(rows)]
start = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == "S")
dist = {start: 0}
queue = deque([start])
answer = -1
while queue:
    r, c = queue.popleft()
    if grid[r][c] == "E":
        answer = dist[(r, c)]
        break
    for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != "#" and (nr, nc) not in dist:
            dist[(nr, nc)] = dist[(r, c)] + 1
            queue.append((nr, nc))
print(answer)
`,
      javascript: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const [rows, cols] = lines[0].split(" ").map(Number);
const grid = lines.slice(1, 1 + rows);
const dist = Array.from({ length: rows }, () => new Array(cols).fill(-1));
const queue = [];
for (let r = 0; r < rows; r++) {
  const c = grid[r].indexOf("S");
  if (c >= 0) {
    dist[r][c] = 0;
    queue.push([r, c]);
  }
}
let answer = -1;
for (let head = 0; head < queue.length; head++) {
  const [r, c] = queue[head];
  if (grid[r][c] === "E") {
    answer = dist[r][c];
    break;
  }
  for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] !== "#" && dist[nr][nc] < 0) {
      dist[nr][nc] = dist[r][c] + 1;
      queue.push([nr, nc]);
    }
  }
}
console.log(answer);
`,
      cpp: `#include <iostream>
#include <queue>
#include <string>
#include <utility>
#include <vector>
using namespace std;

int main() {
    int rows, cols;
    cin >> rows >> cols;
    vector<string> grid(rows);
    for (auto &line : grid) cin >> line;
    vector<vector<int>> dist(rows, vector<int>(cols, -1));
    queue<pair<int, int>> q;
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (grid[r][c] == 'S') {
                dist[r][c] = 0;
                q.push({r, c});
            }
    const int dr[] = {1, -1, 0, 0};
    const int dc[] = {0, 0, 1, -1};
    int answer = -1;
    while (!q.empty()) {
        auto [r, c] = q.front();
        q.pop();
        if (grid[r][c] == 'E') {
            answer = dist[r][c];
            break;
        }
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] == '#' || dist[nr][nc] >= 0) continue;
            dist[nr][nc] = dist[r][c] + 1;
            q.push({nr, nc});
        }
    }
    cout << answer << endl;
    return 0;
}
`,
    },
  },
];
