/**
 * REFERENCE SOLUTIONS ("spoiler vault") for the algorithms group.
 *
 * Intentionally public in this open-source repo and used ONLY by tests/unit/challenges-algorithms.test.ts
 * to prove that every challenge is solvable and graded correctly. Never import this file from the site,
 * the Worker or the runner.
 */
import type { ChallengeReference } from "../../../shared/challenges";
import type { LangId } from "../../../shared/languages";

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
  {
    id: "db-low-stock-report",
    // SQL is delivered through the python harness.
    solutions: {
      python: `SELECT title, published_year, stock
FROM books
WHERE genre IN ('Fiction', 'Science')
  AND published_year >= 2015
  AND stock < 5
ORDER BY stock ASC, published_year DESC, title ASC
LIMIT 5;
`,
    },
  },
  {
    id: "db-loyal-customers",
    solutions: {
      python: `SELECT c.name,
       c.country,
       COUNT(DISTINCT o.id) AS delivered_orders,
       COALESCE(SUM(i.quantity * i.unit_price_cents), 0) AS total_cents
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id
LEFT JOIN order_items AS i ON i.order_id = o.id
WHERE o.status = 'delivered'
GROUP BY c.id, c.name, c.country
HAVING COUNT(DISTINCT o.id) >= 2
ORDER BY total_cents DESC, c.name ASC;
`,
    },
  },
  {
    id: "ds-descriptive-stats",
    solutions: {
      python: `import math
import sys
from collections import Counter

data = sys.stdin.read().split()
n = int(data[0])
values = [float(x) for x in data[1:1 + n]]
mean = sum(values) / n
ordered = sorted(values)
median = ordered[n // 2] if n % 2 else (ordered[n // 2 - 1] + ordered[n // 2]) / 2
counts = Counter(values)
top = max(counts.values())
mode = min(v for v, c in counts.items() if c == top)
std = math.sqrt(sum((v - mean) ** 2 for v in values) / n)
for v in (mean, median, mode, std):
    print(f"{v:.6f}")
`,
      javascript: `const data = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean);
const n = Number(data[0]);
const values = data.slice(1, 1 + n).map(Number);
const mean = values.reduce((a, b) => a + b, 0) / n;
const sorted = [...values].sort((a, b) => a - b);
const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
const counts = new Map();
for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
const top = Math.max(...counts.values());
const mode = Math.min(...[...counts].filter(([, c]) => c === top).map(([v]) => v));
const std = Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / n);
for (const v of [mean, median, mode, std]) console.log(v.toFixed(6));
`,
    },
  },
  {
    id: "ds-classifier-report",
    solutions: {
      python: `import sys
from collections import Counter

data = sys.stdin.read().split()
n = int(data[0])
pairs = [(data[1 + 2 * i], data[2 + 2 * i]) for i in range(n)]
actual = Counter(a for a, _ in pairs)
predicted = Counter(p for _, p in pairs)
hits = Counter(a for a, p in pairs if a == p)


def ratio(a, b):
    return a / b if b else 0.0


f1s = []
for c in sorted(set(actual) | set(predicted)):
    precision = ratio(hits[c], predicted[c])
    recall = ratio(hits[c], actual[c])
    f1 = ratio(2 * precision * recall, precision + recall)
    f1s.append(f1)
    print(f"{c} {precision:.6f} {recall:.6f} {f1:.6f}")
print(f"macro_f1 {sum(f1s) / len(f1s):.6f}")
print(f"accuracy {sum(hits.values()) / n:.6f}")
`,
      javascript: `const data = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean);
const n = Number(data[0]);
const actual = {};
const predicted = {};
const hits = {};
const classes = new Set();
let correct = 0;
for (let i = 0; i < n; i++) {
  const a = data[1 + 2 * i];
  const p = data[2 + 2 * i];
  classes.add(a);
  classes.add(p);
  actual[a] = (actual[a] || 0) + 1;
  predicted[p] = (predicted[p] || 0) + 1;
  if (a === p) {
    hits[a] = (hits[a] || 0) + 1;
    correct++;
  }
}
const ratio = (a, b) => (b ? a / b : 0);
const f1s = [];
for (const c of [...classes].sort()) {
  const precision = ratio(hits[c] || 0, predicted[c] || 0);
  const recall = ratio(hits[c] || 0, actual[c] || 0);
  const f1 = ratio(2 * precision * recall, precision + recall);
  f1s.push(f1);
  console.log(c, precision.toFixed(6), recall.toFixed(6), f1.toFixed(6));
}
console.log("macro_f1", (f1s.reduce((a, b) => a + b, 0) / f1s.length).toFixed(6));
console.log("accuracy", (correct / n).toFixed(6));
`,
    },
  },
  {
    id: "ai-kmeans-step",
    solutions: {
      python: `import sys

data = sys.stdin.read().split()
n, k, d = int(data[0]), int(data[1]), int(data[2])
values = list(map(float, data[3:]))
points = [values[i * d:(i + 1) * d] for i in range(n)]
centroids = [values[(n + j) * d:(n + j + 1) * d] for j in range(k)]

sums = [[0.0] * d for _ in range(k)]
counts = [0] * k
assignment = []
inertia = 0.0
for p in points:
    best, best_dist = 0, float("inf")
    for j, c in enumerate(centroids):
        dist = sum((x - y) ** 2 for x, y in zip(p, c))
        if dist < best_dist:
            best, best_dist = j, dist
    inertia += best_dist
    counts[best] += 1
    for i, x in enumerate(p):
        sums[best][i] += x
    assignment.append(best)

print(*assignment)
for j in range(k):
    new = centroids[j] if counts[j] == 0 else [s / counts[j] for s in sums[j]]
    print(*[f"{x:.6f}" for x in new])
print(f"{inertia:.6f}")
`,
      javascript: `const data = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean).map(Number);
const [n, k, d] = data;
const points = [];
const centroids = [];
for (let i = 0; i < n; i++) points.push(data.slice(3 + i * d, 3 + (i + 1) * d));
for (let j = 0; j < k; j++) centroids.push(data.slice(3 + (n + j) * d, 3 + (n + j + 1) * d));

const sums = centroids.map(() => new Array(d).fill(0));
const counts = new Array(k).fill(0);
const assignment = [];
let inertia = 0;
for (const p of points) {
  let best = 0;
  let bestDist = Infinity;
  centroids.forEach((c, j) => {
    const dist = p.reduce((acc, x, i) => acc + (x - c[i]) ** 2, 0);
    if (dist < bestDist) {
      best = j;
      bestDist = dist;
    }
  });
  inertia += bestDist;
  counts[best]++;
  p.forEach((x, i) => (sums[best][i] += x));
  assignment.push(best);
}
console.log(assignment.join(" "));
for (let j = 0; j < k; j++) {
  const next = counts[j] === 0 ? centroids[j] : sums[j].map((s) => s / counts[j]);
  console.log(next.map((x) => x.toFixed(6)).join(" "));
}
console.log(inertia.toFixed(6));
`,
      cpp: `#include <cstdio>
#include <iostream>
#include <limits>
#include <vector>
using namespace std;

int main() {
    int n, k, d;
    cin >> n >> k >> d;
    vector<vector<double>> points(n, vector<double>(d)), centroids(k, vector<double>(d));
    for (auto &p : points) for (auto &x : p) cin >> x;
    for (auto &c : centroids) for (auto &x : c) cin >> x;

    vector<vector<double>> sums(k, vector<double>(d, 0.0));
    vector<int> counts(k, 0), assignment(n);
    double inertia = 0.0;
    for (int i = 0; i < n; i++) {
        int best = 0;
        double bestDist = numeric_limits<double>::infinity();
        for (int j = 0; j < k; j++) {
            double dist = 0.0;
            for (int t = 0; t < d; t++) dist += (points[i][t] - centroids[j][t]) * (points[i][t] - centroids[j][t]);
            if (dist < bestDist) {
                bestDist = dist;
                best = j;
            }
        }
        inertia += bestDist;
        counts[best]++;
        for (int t = 0; t < d; t++) sums[best][t] += points[i][t];
        assignment[i] = best;
    }
    for (int i = 0; i < n; i++) printf("%d%c", assignment[i], i + 1 < n ? ' ' : '\\n');
    for (int j = 0; j < k; j++) {
        for (int t = 0; t < d; t++) {
            double v = counts[j] == 0 ? centroids[j][t] : sums[j][t] / counts[j];
            printf("%.6f%c", v, t + 1 < d ? ' ' : '\\n');
        }
    }
    printf("%.6f\\n", inertia);
    return 0;
}
`,
    },
  },
];

/**
 * Plausible-but-wrong submissions that the graders MUST reject: they prove the hidden tests are
 * discriminating (each one targets a specific trap) and not just satisfiable.
 */
export interface WrongAnswer {
  id: string;
  lang: LangId;
  /** The trap this submission falls into. */
  name: string;
  code: string;
}

export const algorithmsWrongAnswers: WrongAnswer[] = [
  {
    id: "dsa-pair-sum-count",
    lang: "python",
    name: "quadratic scan (too slow)",
    code: `import sys

data = sys.stdin.read().split()
n, target = int(data[0]), int(data[1])
a = list(map(int, data[2:2 + n]))
total = 0
for i in range(n):
    for j in range(i + 1, n):
        if a[i] + a[j] == target:
            total += 1
print(total)
`,
  },
  {
    id: "dsa-pair-sum-count",
    lang: "python",
    name: "counts distinct values only",
    code: `import sys

data = sys.stdin.read().split()
n, target = int(data[0]), int(data[1])
values = set(map(int, data[2:2 + n]))
print(sum(1 for v in values if target - v in values and v < target - v))
`,
  },
  {
    id: "dsa-pair-sum-count",
    lang: "javascript",
    name: "pairs a card with itself",
    code: `const data = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean).map(Number);
const n = data[0];
const target = data[1];
const seen = new Map();
let total = 0;
for (const v of data.slice(2, 2 + n)) {
  seen.set(v, (seen.get(v) || 0) + 1);
  total += seen.get(target - v) || 0;
}
console.log(total);
`,
  },
  {
    id: "dsa-bracket-balance",
    lang: "python",
    name: "counts each bracket type separately (ignores order)",
    code: `def is_balanced(s):
    return s.count("(") == s.count(")") and s.count("[") == s.count("]") and s.count("{") == s.count("}")
`,
  },
  {
    id: "dsa-bracket-balance",
    lang: "python",
    name: "recursive reduction (stack overflow on deep nesting)",
    code: `def is_balanced(s):
    t = "".join(ch for ch in s if ch in "()[]{}")
    if not t:
        return True
    for pair in ("()", "[]", "{}"):
        if pair in t:
            return is_balanced(t.replace(pair, "", 1))
    return False
`,
  },
  {
    id: "dsa-bracket-balance",
    lang: "javascript",
    name: "single depth counter for all bracket types",
    code: `function isBalanced(s) {
  let depth = 0;
  for (const ch of s) {
    if ("([{".includes(ch)) depth++;
    else if (")]}".includes(ch)) depth--;
    if (depth < 0) return false;
  }
  return depth === 0;
}
`,
  },
  {
    id: "dsa-grid-shortest-path",
    lang: "python",
    name: "depth-first search returns some path, not the shortest",
    code: `import sys

sys.setrecursionlimit(1_000_000)
rows, cols = map(int, sys.stdin.readline().split())
grid = [sys.stdin.readline().rstrip("\\n") for _ in range(rows)]
start = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == "S")
seen = set()
best = [-1]


def dfs(r, c, d):
    if (r, c) in seen or not (0 <= r < rows and 0 <= c < cols) or grid[r][c] == "#":
        return False
    if grid[r][c] == "E":
        best[0] = d
        return True
    seen.add((r, c))
    return dfs(r + 1, c, d + 1) or dfs(r, c + 1, d + 1) or dfs(r - 1, c, d + 1) or dfs(r, c - 1, d + 1)


import threading

threading.stack_size(512 * 1024 * 1024)
t = threading.Thread(target=lambda: dfs(*start, 0))
t.start()
t.join()
print(best[0])
`,
  },
  {
    id: "dsa-grid-shortest-path",
    lang: "python",
    name: "breadth-first search that also allows diagonal moves",
    code: `import sys
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
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != "#" and (nr, nc) not in dist:
                dist[(nr, nc)] = dist[(r, c)] + 1
                queue.append((nr, nc))
print(answer)
`,
  },
  {
    id: "db-low-stock-report",
    lang: "python",
    name: "stock <= 5 (off by one)",
    code: `SELECT title, published_year, stock FROM books
WHERE genre IN ('Fiction', 'Science') AND published_year >= 2015 AND stock <= 5
ORDER BY stock ASC, published_year DESC, title ASC LIMIT 5;
`,
  },
  {
    id: "db-low-stock-report",
    lang: "python",
    name: "treats unknown stock as zero",
    code: `SELECT title, published_year, COALESCE(stock, 0) FROM books
WHERE genre IN ('Fiction', 'Science') AND published_year >= 2015 AND COALESCE(stock, 0) < 5
ORDER BY COALESCE(stock, 0) ASC, published_year DESC, title ASC LIMIT 5;
`,
  },
  {
    id: "db-low-stock-report",
    lang: "python",
    name: "forgets the title tie-break",
    code: `SELECT title, published_year, stock FROM books
WHERE genre IN ('Fiction', 'Science') AND published_year >= 2015 AND stock < 5
ORDER BY stock ASC, published_year DESC LIMIT 5;
`,
  },
  {
    id: "db-low-stock-report",
    lang: "python",
    name: "forgets LIMIT",
    code: `SELECT title, published_year, stock FROM books
WHERE genre IN ('Fiction', 'Science') AND published_year >= 2015 AND stock < 5
ORDER BY stock ASC, published_year DESC, title ASC;
`,
  },
  {
    id: "db-loyal-customers",
    lang: "python",
    name: "COUNT(*) counts item rows instead of orders",
    code: `SELECT c.name, c.country, COUNT(*) AS delivered_orders, COALESCE(SUM(i.quantity * i.unit_price_cents), 0) AS total_cents
FROM customers c JOIN orders o ON o.customer_id = c.id LEFT JOIN order_items i ON i.order_id = o.id
WHERE o.status = 'delivered'
GROUP BY c.id HAVING COUNT(*) >= 2
ORDER BY total_cents DESC, c.name ASC;
`,
  },
  {
    id: "db-loyal-customers",
    lang: "python",
    name: "inner join drops delivered orders without items",
    code: `SELECT c.name, c.country, COUNT(DISTINCT o.id) AS delivered_orders, SUM(i.quantity * i.unit_price_cents) AS total_cents
FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items i ON i.order_id = o.id
WHERE o.status = 'delivered'
GROUP BY c.id HAVING COUNT(DISTINCT o.id) >= 2
ORDER BY total_cents DESC, c.name ASC;
`,
  },
  {
    id: "db-loyal-customers",
    lang: "python",
    name: "counts every order status",
    code: `SELECT c.name, c.country, COUNT(DISTINCT o.id) AS delivered_orders, COALESCE(SUM(i.quantity * i.unit_price_cents), 0) AS total_cents
FROM customers c JOIN orders o ON o.customer_id = c.id LEFT JOIN order_items i ON i.order_id = o.id
GROUP BY c.id HAVING COUNT(DISTINCT o.id) >= 2
ORDER BY total_cents DESC, c.name ASC;
`,
  },
  {
    id: "ds-descriptive-stats",
    lang: "python",
    name: "sample standard deviation (n - 1)",
    code: `import math
import sys
from collections import Counter

data = sys.stdin.read().split()
n = int(data[0])
values = [float(x) for x in data[1:1 + n]]
mean = sum(values) / n
ordered = sorted(values)
median = ordered[n // 2] if n % 2 else (ordered[n // 2 - 1] + ordered[n // 2]) / 2
counts = Counter(values)
top = max(counts.values())
mode = min(v for v, c in counts.items() if c == top)
std = math.sqrt(sum((v - mean) ** 2 for v in values) / max(n - 1, 1))
for v in (mean, median, mode, std):
    print(f"{v:.6f}")
`,
  },
  {
    id: "ds-descriptive-stats",
    lang: "python",
    name: "median without sorting and mode of the first-seen value",
    code: `import math
import sys
from collections import Counter

data = sys.stdin.read().split()
n = int(data[0])
values = [float(x) for x in data[1:1 + n]]
mean = sum(values) / n
median = values[n // 2] if n % 2 else (values[n // 2 - 1] + values[n // 2]) / 2
mode = Counter(values).most_common(1)[0][0]
std = math.sqrt(sum((v - mean) ** 2 for v in values) / n)
for v in (mean, median, mode, std):
    print(f"{v:.6f}")
`,
  },
  {
    id: "ds-descriptive-stats",
    lang: "javascript",
    name: "even-length median takes the upper middle value",
    code: `const data = require("fs").readFileSync(0, "utf8").split(/\\\\s+/).filter(Boolean);
const n = Number(data[0]);
const values = data.slice(1, 1 + n).map(Number);
const mean = values.reduce((a, b) => a + b, 0) / n;
const sorted = [...values].sort((a, b) => a - b);
const median = sorted[Math.floor(n / 2)];
const counts = new Map();
for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
const top = Math.max(...counts.values());
const mode = Math.min(...[...counts].filter(([, c]) => c === top).map(([v]) => v));
const std = Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / n);
for (const v of [mean, median, mode, std]) console.log(v.toFixed(6));
`,
  },
  {
    id: "ds-classifier-report",
    lang: "python",
    name: "no zero-division guard (crashes on a class that is never predicted)",
    code: `import sys
from collections import Counter

data = sys.stdin.read().split()
n = int(data[0])
pairs = [(data[1 + 2 * i], data[2 + 2 * i]) for i in range(n)]
actual = Counter(a for a, _ in pairs)
predicted = Counter(p for _, p in pairs)
hits = Counter(a for a, p in pairs if a == p)
f1s = []
for c in sorted(set(actual) | set(predicted)):
    precision = hits[c] / predicted[c]
    recall = hits[c] / actual[c]
    f1 = 2 * precision * recall / (precision + recall)
    f1s.append(f1)
    print(f"{c} {precision:.6f} {recall:.6f} {f1:.6f}")
print(f"macro_f1 {sum(f1s) / len(f1s):.6f}")
print(f"accuracy {sum(hits.values()) / n:.6f}")
`,
  },
  {
    id: "ds-classifier-report",
    lang: "python",
    name: "only classes that occur as actual labels",
    code: `import sys
from collections import Counter

data = sys.stdin.read().split()
n = int(data[0])
pairs = [(data[1 + 2 * i], data[2 + 2 * i]) for i in range(n)]
actual = Counter(a for a, _ in pairs)
predicted = Counter(p for _, p in pairs)
hits = Counter(a for a, p in pairs if a == p)


def ratio(a, b):
    return a / b if b else 0.0


f1s = []
for c in sorted(actual):
    precision = ratio(hits[c], predicted[c])
    recall = ratio(hits[c], actual[c])
    f1 = ratio(2 * precision * recall, precision + recall)
    f1s.append(f1)
    print(f"{c} {precision:.6f} {recall:.6f} {f1:.6f}")
print(f"macro_f1 {sum(f1s) / len(f1s):.6f}")
print(f"accuracy {sum(hits.values()) / n:.6f}")
`,
  },
  {
    id: "ds-classifier-report",
    lang: "python",
    name: "precision and recall swapped",
    code: `import sys
from collections import Counter

data = sys.stdin.read().split()
n = int(data[0])
pairs = [(data[1 + 2 * i], data[2 + 2 * i]) for i in range(n)]
actual = Counter(a for a, _ in pairs)
predicted = Counter(p for _, p in pairs)
hits = Counter(a for a, p in pairs if a == p)


def ratio(a, b):
    return a / b if b else 0.0


f1s = []
for c in sorted(set(actual) | set(predicted)):
    precision = ratio(hits[c], actual[c])
    recall = ratio(hits[c], predicted[c])
    f1 = ratio(2 * precision * recall, precision + recall)
    f1s.append(f1)
    print(f"{c} {precision:.6f} {recall:.6f} {f1:.6f}")
print(f"macro_f1 {sum(f1s) / len(f1s):.6f}")
print(f"accuracy {sum(hits.values()) / n:.6f}")
`,
  },
  {
    id: "ds-classifier-report",
    lang: "javascript",
    name: "macro F1 weighted by class size",
    code: `const data = require("fs").readFileSync(0, "utf8").split(/\\\\s+/).filter(Boolean);
const n = Number(data[0]);
const actual = {};
const predicted = {};
const hits = {};
const classes = new Set();
let correct = 0;
for (let i = 0; i < n; i++) {
  const a = data[1 + 2 * i];
  const p = data[2 + 2 * i];
  classes.add(a);
  classes.add(p);
  actual[a] = (actual[a] || 0) + 1;
  predicted[p] = (predicted[p] || 0) + 1;
  if (a === p) {
    hits[a] = (hits[a] || 0) + 1;
    correct++;
  }
}
const ratio = (a, b) => (b ? a / b : 0);
let weighted = 0;
for (const c of [...classes].sort()) {
  const precision = ratio(hits[c] || 0, predicted[c] || 0);
  const recall = ratio(hits[c] || 0, actual[c] || 0);
  const f1 = ratio(2 * precision * recall, precision + recall);
  weighted += f1 * (actual[c] || 0) / n;
  console.log(c, precision.toFixed(6), recall.toFixed(6), f1.toFixed(6));
}
console.log("macro_f1", weighted.toFixed(6));
console.log("accuracy", (correct / n).toFixed(6));
`,
  },
  {
    id: "ai-kmeans-step",
    lang: "python",
    name: "ties go to the highest index (<=)",
    code: `import sys

data = sys.stdin.read().split()
n, k, d = int(data[0]), int(data[1]), int(data[2])
values = list(map(float, data[3:]))
points = [values[i * d:(i + 1) * d] for i in range(n)]
centroids = [values[(n + j) * d:(n + j + 1) * d] for j in range(k)]

sums = [[0.0] * d for _ in range(k)]
counts = [0] * k
assignment = []
inertia = 0.0
for p in points:
    best, best_dist = 0, float("inf")
    for j, c in enumerate(centroids):
        dist = sum((x - y) ** 2 for x, y in zip(p, c))
        if dist <= best_dist:
            best, best_dist = j, dist
    inertia += best_dist
    counts[best] += 1
    for i, x in enumerate(p):
        sums[best][i] += x
    assignment.append(best)

print(*assignment)
for j in range(k):
    new = centroids[j] if counts[j] == 0 else [s / counts[j] for s in sums[j]]
    print(*[f"{x:.6f}" for x in new])
print(f"{inertia:.6f}")
`,
  },
  {
    id: "ai-kmeans-step",
    lang: "python",
    name: "empty cluster collapses to the origin",
    code: `import sys

data = sys.stdin.read().split()
n, k, d = int(data[0]), int(data[1]), int(data[2])
values = list(map(float, data[3:]))
points = [values[i * d:(i + 1) * d] for i in range(n)]
centroids = [values[(n + j) * d:(n + j + 1) * d] for j in range(k)]

sums = [[0.0] * d for _ in range(k)]
counts = [0] * k
assignment = []
inertia = 0.0
for p in points:
    best, best_dist = 0, float("inf")
    for j, c in enumerate(centroids):
        dist = sum((x - y) ** 2 for x, y in zip(p, c))
        if dist < best_dist:
            best, best_dist = j, dist
    inertia += best_dist
    counts[best] += 1
    for i, x in enumerate(p):
        sums[best][i] += x
    assignment.append(best)

print(*assignment)
for j in range(k):
    new = [0.0] * d if counts[j] == 0 else [s / counts[j] for s in sums[j]]
    print(*[f"{x:.6f}" for x in new])
print(f"{inertia:.6f}")
`,
  },
  {
    id: "ai-kmeans-step",
    lang: "python",
    name: "inertia reports sqrt of the squared distances' sum",
    code: `import sys

data = sys.stdin.read().split()
n, k, d = int(data[0]), int(data[1]), int(data[2])
values = list(map(float, data[3:]))
points = [values[i * d:(i + 1) * d] for i in range(n)]
centroids = [values[(n + j) * d:(n + j + 1) * d] for j in range(k)]

sums = [[0.0] * d for _ in range(k)]
counts = [0] * k
assignment = []
inertia = 0.0
for p in points:
    best, best_dist = 0, float("inf")
    for j, c in enumerate(centroids):
        dist = sum((x - y) ** 2 for x, y in zip(p, c))
        if dist < best_dist:
            best, best_dist = j, dist
    inertia += best_dist
    counts[best] += 1
    for i, x in enumerate(p):
        sums[best][i] += x
    assignment.append(best)

print(*assignment)
for j in range(k):
    new = centroids[j] if counts[j] == 0 else [s / counts[j] for s in sums[j]]
    print(*[f"{x:.6f}" for x in new])
print(f"{inertia ** 0.5:.6f}")
`,
  },
  {
    id: "ai-kmeans-step",
    lang: "python",
    name: "inertia measured against the NEW centroids",
    code: `import sys

data = sys.stdin.read().split()
n, k, d = int(data[0]), int(data[1]), int(data[2])
values = list(map(float, data[3:]))
points = [values[i * d:(i + 1) * d] for i in range(n)]
centroids = [values[(n + j) * d:(n + j + 1) * d] for j in range(k)]

sums = [[0.0] * d for _ in range(k)]
counts = [0] * k
assignment = []
for p in points:
    best, best_dist = 0, float("inf")
    for j, c in enumerate(centroids):
        dist = sum((x - y) ** 2 for x, y in zip(p, c))
        if dist < best_dist:
            best, best_dist = j, dist
    counts[best] += 1
    for i, x in enumerate(p):
        sums[best][i] += x
    assignment.append(best)

moved = [centroids[j] if counts[j] == 0 else [s / counts[j] for s in sums[j]] for j in range(k)]
inertia = sum(sum((x - y) ** 2 for x, y in zip(p, moved[a])) for p, a in zip(points, assignment))
print(*assignment)
for c in moved:
    print(*[f"{x:.6f}" for x in c])
print(f"{inertia:.6f}")
`,
  },
];
