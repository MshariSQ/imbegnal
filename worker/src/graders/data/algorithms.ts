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

// ── dsa-grid-shortest-path ───────────────────────────────────────────────────

function gridShortest(rows: string[]): number {
  const R = rows.length;
  const C = rows[0].length;
  const dist = new Int32Array(R * C).fill(-1);
  const queue = new Int32Array(R * C);
  let head = 0;
  let tail = 0;
  for (let i = 0; i < R * C; i++) {
    if (rows[Math.floor(i / C)][i % C] === "S") {
      dist[i] = 0;
      queue[tail++] = i;
    }
  }
  while (head < tail) {
    const cur = queue[head++];
    const r = Math.floor(cur / C);
    const c = cur % C;
    if (rows[r][c] === "E") return dist[cur];
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= R || nc >= C || rows[nr][nc] === "#") continue;
      const next = nr * C + nc;
      if (dist[next] >= 0) continue;
      dist[next] = dist[cur] + 1;
      queue[tail++] = next;
    }
  }
  return -1;
}

function gridTest(name: string, rows: string[], hidden = true): OutputTest {
  return {
    name,
    stdin: `${rows.length} ${rows[0].length}\n${rows.join("\n")}\n`,
    expected: String(gridShortest(rows)),
    hidden: hidden || undefined,
  };
}

const gridOpenField = (() => {
  const rows = Array.from({ length: 200 }, () => ".".repeat(200));
  rows[0] = `S${rows[0].slice(1)}`;
  rows[199] = `${rows[199].slice(0, 199)}E`;
  return rows;
})();

/** Full-width corridors separated by walls with one gap that alternates sides: a very long forced path. */
const gridSerpentine = (() => {
  const size = 199;
  const rows: string[] = [];
  for (let r = 0; r < size; r++) {
    if (r % 2 === 0) rows.push(".".repeat(size));
    else {
      const gap = (r - 1) % 4 === 0 ? size - 1 : 0;
      rows.push(Array.from({ length: size }, (_, c) => (c === gap ? "." : "#")).join(""));
    }
  }
  rows[0] = `S${rows[0].slice(1)}`;
  rows[size - 1] = `${rows[size - 1].slice(0, size - 1)}E`;
  return rows;
})();

/** Random maze with the given wall density; the seed is advanced until the result is reachable (or not) as requested. */
function randomMaze(seed: number, size: number, density: number, wantReachable: boolean): string[] {
  for (let s = seed; ; s++) {
    const r = rng(s);
    const rows = Array.from({ length: size }, () => Array.from({ length: size }, () => (r() < density ? "#" : ".")));
    rows[0][0] = "S";
    rows[size - 1][size - 1] = "E";
    const lines = rows.map((row) => row.join(""));
    if ((gridShortest(lines) >= 0) === wantReachable) return lines;
  }
}

const dsaGridShortestPath: ChallengeGrader = {
  id: "dsa-grid-shortest-path",
  kind: "output",
  tests: [
    gridTest("example", ["S..#....", ".#.#.##.", ".#...#..", ".####.#.", "......#E"], false),
    gridTest("detour", ["S.#", ".##", "..E"], false),
    gridTest("blocked", ["S#E"], false),
    gridTest("adjacent", ["SE"]),
    gridTest("single row", ["S....E"]),
    gridTest("single column", ["S", ".", ".", ".", ".", "E"]),
    gridTest("start walled in", ["S#.", "##.", "..E"]),
    gridTest("open field 200x200", gridOpenField),
    gridTest("serpentine corridor", gridSerpentine),
    gridTest("random maze, reachable", randomMaze(11, 120, 0.3, true)),
    gridTest("random maze, sealed", randomMaze(5, 120, 0.5, false)),
  ],
};

// ── db-low-stock-report ──────────────────────────────────────────────────────

// The learner submits SQL. The Python harness builds an in-memory SQLite database from the dataset named
// on stdin (hidden datasets differ from the published sample), runs the statement read-only and prints rows.
const dbLowStockReport: ChallengeGrader = {
  id: "db-low-stock-report",
  kind: "code",
  harness: {
    python: `import sqlite3
import sys

USER_SQL = r"""
{{CODE}}
"""

SCHEMA = """
CREATE TABLE books (
    id             INTEGER PRIMARY KEY,
    title          TEXT NOT NULL,
    genre          TEXT NOT NULL,
    published_year INTEGER NOT NULL,
    price_cents    INTEGER NOT NULL,
    stock          INTEGER
);
"""

DATASETS = {
# dataset: sample
    "sample": [
        (1, "The Silent Orchard", "Fiction", 2019, 1599, 3),
        (2, "Quantum Gardens", "Science", 2021, 2499, 0),
        (3, "Atlas of Small Rivers", "Travel", 2018, 1999, 2),
        (4, "Salt and Ember", "Fiction", 2016, 1299, 4),
        (5, "Letters to a Young Coder", "Science", 2012, 1799, 1),
        (6, "The Clockmaker's Daughter", "Fiction", 2022, 1499, 5),
        (7, "Deep Time", "Science", 2020, 2199, None),
        (8, "Harbor Lights", "Fiction", 2019, 1399, 3),
        (9, "Cooking with Fire", "Cooking", 2021, 2899, 1),
        (10, "Orbit Notes", "Science", 2015, 1899, 2),
        (11, "Paper Cities", "Fiction", 2023, 1699, 4),
        (12, "The Last Lighthouse", "Fiction", 2014, 999, 0),
    ],
# dataset: boundaries
    "boundaries": [
        (1, "Amber Road", "Fiction", 2015, 1200, 4),
        (2, "Birch Hollow", "Fiction", 2014, 1200, 0),
        (3, "Cedar Lane", "Science", 2016, 1500, 5),
        (4, "Dune Maps", "Science", 2016, 1500, 4),
        (5, "Ember Tide", "Fantasy", 2020, 1100, 1),
        (6, "Fable Hill", "Fiction", 2024, 1300, None),
        (7, "Glass River", "Science", 2015, 900, 0),
    ],
# dataset: ties
    "ties": [
        (1, "Zephyr", "Fiction", 2020, 1000, 2),
        (2, "Yonder", "Fiction", 2020, 1000, 2),
        (3, "Xenon Dawn", "Science", 2020, 1000, 2),
        (4, "Willow", "Fiction", 2020, 1000, 2),
        (5, "Vesper", "Fiction", 2020, 1000, 2),
        (6, "Umber", "Science", 2020, 1000, 2),
        (7, "Tidewater", "Fiction", 2020, 1000, 2),
        (8, "Solace", "Fiction", 2020, 1000, 2),
        (9, "Riddle", "Science", 2020, 1000, 2),
        (10, "Quill", "Fiction", 2018, 1000, 1),
        (11, "Pioneer", "Fiction", 2021, 1000, 2),
    ],
# dataset: nothing-low
    "nothing-low": [
        (1, "Opal Coast", "Fiction", 2022, 1700, 5),
        (2, "Nightingale", "Science", 2019, 2100, 12),
        (3, "Marble Sky", "Fiction", 2016, 1250, None),
        (4, "Lantern Row", "History", 2021, 1900, 0),
        (5, "Kite Season", "Fiction", 2010, 800, 1),
    ],
# dataset: two-matches
    "two-matches": [
        (1, "Juniper Bay", "Science", 2018, 1400, 3),
        (2, "Iris Gate", "Fiction", 2023, 1600, 3),
        (3, "Hollow Pine", "Fiction", 2023, 1600, 7),
        (4, "Garnet Hill", "Poetry", 2023, 1600, 0),
    ],
}


def main():
    name = sys.stdin.read().strip()
    conn = sqlite3.connect(":memory:")
    conn.executescript(SCHEMA)
    conn.executemany("INSERT INTO books VALUES (?, ?, ?, ?, ?, ?)", DATASETS[name])
    conn.commit()
    conn.execute("PRAGMA query_only = ON")
    try:
        cursor = conn.execute(USER_SQL)
        if cursor.description is None:
            raise ValueError("the statement must be a SELECT query")
        rows = cursor.fetchall()
    except (sqlite3.Error, sqlite3.Warning, ValueError) as exc:
        print("SQL error: " + str(exc), file=sys.stderr)
        sys.exit(1)
    if not rows:
        print("(no rows)")
    for row in rows:
        print("|".join("NULL" if value is None else str(value) for value in row))


if __name__ == "__main__":
    main()
`,
  },
  tests: [
    { name: "sample", stdin: "sample", expected: "Quantum Gardens|2021|0\nOrbit Notes|2015|2\nHarbor Lights|2019|3\nThe Silent Orchard|2019|3\nPaper Cities|2023|4", mode: "lines" },
    { name: "boundaries", stdin: "boundaries", expected: "Glass River|2015|0\nDune Maps|2016|4\nAmber Road|2015|4", mode: "lines", hidden: true },
    { name: "ties", stdin: "ties", expected: "Quill|2018|1\nPioneer|2021|2\nRiddle|2020|2\nSolace|2020|2\nTidewater|2020|2", mode: "lines", hidden: true },
    { name: "nothing-low", stdin: "nothing-low", expected: "(no rows)", mode: "lines", hidden: true },
    { name: "two-matches", stdin: "two-matches", expected: "Iris Gate|2023|3\nJuniper Bay|2018|3", mode: "lines", hidden: true },
  ],
};

// ── db-loyal-customers ───────────────────────────────────────────────────────

const dbLoyalCustomers: ChallengeGrader = {
  id: "db-loyal-customers",
  kind: "code",
  harness: {
    python: `import sqlite3
import sys

USER_SQL = r"""
{{CODE}}
"""

SCHEMA = """
CREATE TABLE customers (
    id      INTEGER PRIMARY KEY,
    name    TEXT NOT NULL,
    country TEXT NOT NULL
);
CREATE TABLE orders (
    id          INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    status      TEXT NOT NULL
);
CREATE TABLE order_items (
    id               INTEGER PRIMARY KEY,
    order_id         INTEGER NOT NULL REFERENCES orders(id),
    quantity         INTEGER NOT NULL,
    unit_price_cents INTEGER NOT NULL
);
"""


def generated(seed, customers, orders):
    """A larger deterministic dataset (small linear congruential generator, no random module)."""
    state = [seed]

    def rnd(n):
        state[0] = (state[0] * 1103515245 + 12345) % 2147483648
        return (state[0] >> 8) % n

    countries = ["Egypt", "Japan", "Brazil", "Kenya", "Norway"]
    statuses = ["delivered", "delivered", "delivered", "cancelled", "pending"]
    cust = [(i, "Customer %02d" % i, countries[rnd(5)]) for i in range(1, customers + 1)]
    ords, items = [], []
    for oid in range(1, orders + 1):
        ords.append((oid, 1 + rnd(customers), statuses[rnd(5)]))
        for _ in range(rnd(4)):
            items.append((len(items) + 1, oid, 1 + rnd(5), 100 * (1 + rnd(40))))
    return {"customers": cust, "orders": ords, "order_items": items}


DATASETS = {
# dataset: sample
    "sample": {
        "customers": [
            (1, "Amira Hassan", "Egypt"),
            (2, "Ben Carter", "UK"),
            (3, "Chiyo Tanaka", "Japan"),
            (4, "Diego Alves", "Brazil"),
            (5, "Esther Kamau", "Kenya"),
            (6, "Farid Nasser", "Egypt"),
        ],
        "orders": [
            (101, 1, "delivered"),
            (102, 1, "delivered"),
            (103, 1, "cancelled"),
            (104, 2, "delivered"),
            (105, 2, "pending"),
            (106, 3, "delivered"),
            (107, 3, "delivered"),
            (108, 3, "delivered"),
            (109, 4, "cancelled"),
            (110, 4, "cancelled"),
            (111, 5, "delivered"),
            (112, 5, "delivered"),
            (113, 6, "delivered"),
            (114, 6, "delivered"),
        ],
        "order_items": [
            (1, 101, 2, 1500),
            (2, 101, 1, 2500),
            (3, 102, 1, 4000),
            (4, 103, 5, 1000),
            (5, 104, 3, 1000),
            (6, 106, 1, 9900),
            (7, 107, 2, 1200),
            (8, 107, 1, 300),
            (9, 107, 4, 250),
            (10, 108, 1, 5000),
            (11, 111, 10, 200),
            (12, 112, 1, 1000),
            (13, 113, 2, 2750),
        ],
    },
# dataset: ties
    "ties": {
        "customers": [
            (1, "Zoe Adler", "Norway"),
            (2, "Yara Nabil", "Egypt"),
            (3, "Xavier Moreau", "Brazil"),
            (4, "Wanjiru Njeri", "Kenya"),
        ],
        "orders": [
            (1, 1, "delivered"),
            (2, 1, "delivered"),
            (3, 2, "delivered"),
            (4, 2, "delivered"),
            (5, 3, "delivered"),
            (6, 3, "delivered"),
            (7, 3, "delivered"),
            (8, 4, "delivered"),
            (9, 4, "delivered"),
        ],
        "order_items": [
            (1, 1, 1, 2000),
            (2, 2, 1, 3000),
            (3, 3, 5, 600),
            (4, 3, 1, 1000),
            (5, 4, 1, 1000),
            (6, 5, 1, 5000),
            (7, 6, 1, 0),
            (8, 8, 1, 5000),
            (9, 9, 1, 100),
        ],
    },
# dataset: many-items
    "many-items": {
        "customers": [
            (1, "Layla Farouk", "Egypt"),
            (2, "Mikael Berg", "Norway"),
        ],
        "orders": [
            (1, 1, "delivered"),
            (2, 1, "delivered"),
            (3, 2, "delivered"),
            (4, 2, "cancelled"),
        ],
        "order_items": [
            (1, 1, 1, 100),
            (2, 1, 1, 100),
            (3, 1, 1, 100),
            (4, 1, 1, 100),
            (5, 1, 1, 100),
            (6, 2, 2, 250),
            (7, 2, 2, 250),
            (8, 3, 9, 900),
            (9, 4, 9, 900),
        ],
    },
# dataset: nobody-qualifies
    "nobody-qualifies": {
        "customers": [
            (1, "Noor Saleh", "Egypt"),
            (2, "Oskar Lund", "Norway"),
        ],
        "orders": [
            (1, 1, "delivered"),
            (2, 1, "cancelled"),
            (3, 1, "pending"),
            (4, 2, "cancelled"),
            (5, 2, "cancelled"),
        ],
        "order_items": [
            (1, 1, 3, 400),
            (2, 2, 3, 400),
            (3, 4, 1, 100),
        ],
    },
# dataset: generated
    "generated": generated(20261007, 25, 90),
}


def main():
    name = sys.stdin.read().strip()
    data = DATASETS[name]
    conn = sqlite3.connect(":memory:")
    conn.executescript(SCHEMA)
    conn.executemany("INSERT INTO customers VALUES (?, ?, ?)", data["customers"])
    conn.executemany("INSERT INTO orders VALUES (?, ?, ?)", data["orders"])
    conn.executemany("INSERT INTO order_items VALUES (?, ?, ?, ?)", data["order_items"])
    conn.commit()
    conn.execute("PRAGMA query_only = ON")
    try:
        cursor = conn.execute(USER_SQL)
        if cursor.description is None:
            raise ValueError("the statement must be a SELECT query")
        rows = cursor.fetchall()
    except (sqlite3.Error, sqlite3.Warning, ValueError) as exc:
        print("SQL error: " + str(exc), file=sys.stderr)
        sys.exit(1)
    if not rows:
        print("(no rows)")
    for row in rows:
        print("|".join("NULL" if value is None else str(value) for value in row))


if __name__ == "__main__":
    main()
`,
  },
  tests: [
    { name: "sample", stdin: "sample", expected: "Chiyo Tanaka|Japan|3|18600\nAmira Hassan|Egypt|2|9500\nFarid Nasser|Egypt|2|5500\nEsther Kamau|Kenya|2|3000", mode: "lines" },
    { name: "ties", stdin: "ties", expected: "Wanjiru Njeri|Kenya|2|5100\nXavier Moreau|Brazil|3|5000\nYara Nabil|Egypt|2|5000\nZoe Adler|Norway|2|5000", mode: "lines", hidden: true },
    { name: "many-items", stdin: "many-items", expected: "Layla Farouk|Egypt|2|1500", mode: "lines", hidden: true },
    { name: "nobody-qualifies", stdin: "nobody-qualifies", expected: "(no rows)", mode: "lines", hidden: true },
    { name: "generated", stdin: "generated", expected: "Customer 16|Egypt|4|81300\nCustomer 19|Kenya|4|51500\nCustomer 17|Japan|4|51400\nCustomer 20|Kenya|3|50100\nCustomer 05|Egypt|3|47700\nCustomer 25|Japan|4|46700\nCustomer 10|Egypt|2|32200\nCustomer 01|Kenya|2|27900\nCustomer 12|Kenya|2|26700\nCustomer 03|Kenya|2|25400\nCustomer 11|Norway|3|21300\nCustomer 08|Kenya|3|9800\nCustomer 15|Egypt|3|7000\nCustomer 23|Brazil|2|5500\nCustomer 09|Kenya|2|5200\nCustomer 04|Kenya|3|0\nCustomer 22|Brazil|2|0", mode: "lines", hidden: true },
  ],
};

export const algorithmsGraders: ChallengeGrader[] = [dsaPairSumCount, dsaBracketBalance, dsaGridShortestPath, dbLowStockReport, dbLoyalCustomers];
