import type { ChallengeMeta } from "../../shared/challenges";

/** Public challenge metadata for tracks: data-structures-algorithms, databases, data-science, artificial-intelligence. Matching graders: worker/src/graders/data/algorithms.ts */

const ADDED = "2026-10-07";

// ── data-structures-algorithms ────────────────────────────────────────────────

const dsaPairSumCount: ChallengeMeta = {
  id: "dsa-pair-sum-count",
  track: "data-structures-algorithms",
  topic: "hashing",
  title: { en: "Matching Gift Cards", ar: "بطاقات هدايا متطابقة" },
  summary: {
    en: "Count the pairs of gift cards whose values add up to a target. Duplicates, negatives and 10 000 cards are on the menu.",
    ar: "احسب عدد أزواج بطاقات الهدايا التي يساوي مجموع قيمتيها هدفًا محددًا، مع قيم مكررة وسالبة وحتى 10 000 بطاقة.",
  },
  description: {
    en: `## Story

The corner shop sells gift cards of many different values. Every evening the cashier pairs up the leftover cards so that each pair is worth exactly the price of the monthly special. How many different pairs can she make?

## Task

You are given the values of \`n\` cards and a target \`T\`. Count the pairs of cards \`(i, j)\` with \`i < j\` and \`a[i] + a[j] = T\`.

Two cards with the same value at different positions are different cards, and a card can never be paired with itself.

## Input

* Line 1: \`n\` and \`T\`
* Line 2: \`n\` integers \`a[1] … a[n]\`

Limits: \`1 ≤ n ≤ 10 000\`, \`|a[i]| ≤ 10^9\`, \`|T| ≤ 2·10^9\`. Checking all \`n²/2\` pairs is too slow on the largest tests; aim for one pass over the list.

## Output

One integer: the number of pairs.

## Example

\`\`\`
6 10
3 7 5 5 5 2
\`\`\`

Output: \`4\`, because 3 + 7 is one pair and the three 5s give 5 + 5 in three different ways.`,
    ar: `## القصة

يبيع المتجر القريب بطاقات هدايا بقيم مختلفة. في نهاية كل يوم يجمع أمين الصندوق البطاقات المتبقية في أزواج، بحيث يساوي مجموع قيمتي كل زوج سعر عرض الشهر بالضبط. كم زوجًا مختلفًا يمكنه تكوينه؟

## المطلوب

لديك قيم \`n\` بطاقة وعدد مستهدف \`T\`. احسب عدد الأزواج \`(i, j)\` حيث \`i < j\` و \`a[i] + a[j] = T\`.

البطاقتان المتساويتان في القيمة وموضعهما مختلف تُعدّان بطاقتين مختلفتين، ولا يجوز إقران البطاقة بنفسها.

## المدخلات

* السطر الأول: \`n\` ثم \`T\`
* السطر الثاني: \`n\` عددًا صحيحًا \`a[1] … a[n]\`

الحدود: \`1 ≤ n ≤ 10 000\` و \`|a[i]| ≤ 10^9\` و \`|T| ≤ 2·10^9\`. فحص كل الأزواج (حوالي \`n²/2\`) بطيء جدًا في أكبر الاختبارات، فاستهدف المرور على القائمة مرة واحدة.

## المخرجات

عدد صحيح واحد: عدد الأزواج.

## مثال

\`\`\`
6 10
3 7 5 5 5 2
\`\`\`

الناتج: \`4\`، لأن 3 + 7 زوج واحد، والبطاقات الثلاث ذات القيمة 5 تعطي 5 + 5 بثلاث طرق مختلفة.`,
  },
  difficulty: 1,
  points: 50,
  estMinutes: 15,
  kind: "output",
  lang: "python",
  starterCode: {
    python: `import sys


def main():
    data = sys.stdin.read().split()
    n, target = int(data[0]), int(data[1])
    cards = list(map(int, data[2:2 + n]))
    # Your code here: count the pairs i < j with cards[i] + cards[j] == target
    print(0)


main()
`,
    javascript: `const data = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean).map(Number);
const n = data[0];
const target = data[1];
const cards = data.slice(2, 2 + n);

// Your code here: count the pairs i < j with cards[i] + cards[j] === target
console.log(0);
`,
    cpp: `#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;

int main() {
    int n;
    long long target;
    cin >> n >> target;
    vector<long long> cards(n);
    for (auto &c : cards) cin >> c;

    // Your code here: count the pairs i < j with cards[i] + cards[j] == target
    cout << 0 << endl;
    return 0;
}
`,
  },
  sampleInput: "6 10\n3 7 5 5 5 2\n",
  hints: [
    {
      text: {
        en: "Trying every pair works on small inputs but needs about n²/2 steps, too slow for the biggest tests.",
        ar: "تجربة كل زوج تنجح مع المدخلات الصغيرة، لكنها تحتاج نحو n²/2 خطوة وهذا بطيء جدًا في أكبر الاختبارات.",
      },
      cost: 5,
    },
    {
      text: {
        en: "For a card worth v you need partners worth T − v. A dictionary from value to how many times you have seen it answers 'how many partners?' in one step.",
        ar: "للبطاقة التي قيمتها v تحتاج شركاء قيمتهم T − v. قاموس يربط القيمة بعدد مرات ظهورها يجيب عن سؤال «كم شريكًا؟» في خطوة واحدة.",
      },
      cost: 5,
    },
    {
      text: {
        en: "Walk left to right. Before recording the current card, add count[T − v] to the answer, then increase count[v]. That also stops a card from pairing with itself.",
        ar: "امشِ من اليسار إلى اليمين. قبل تسجيل البطاقة الحالية أضف count[T − v] إلى الجواب، ثم زد count[v]. وبهذا لا تُقرَن البطاقة بنفسها.",
      },
      cost: 10,
    },
  ],
  lessons: ["data-structures-algorithms/arrays-hashing", "data-structures-algorithms/complexity-big-o"],
  tags: ["hash-map", "counting", "two-sum"],
  addedAt: ADDED,
};

const dsaBracketBalance: ChallengeMeta = {
  id: "dsa-bracket-balance",
  track: "data-structures-algorithms",
  topic: "stack",
  title: { en: "Bracket Inspector", ar: "مفتش الأقواس" },
  summary: {
    en: "Write the check behind every code editor's bracket matching: three bracket types, any nesting depth, other characters ignored.",
    ar: "اكتب الفحص الذي يعمل خلف مطابقة الأقواس في محررات الشيفرة: ثلاثة أنواع من الأقواس، وتداخل بأي عمق، مع تجاهل بقية المحارف.",
  },
  description: {
    en: `## Story

Your editor plugin must decide, before it reformats a file, whether the brackets in a snippet are properly nested. A single stray \`)\` or a \`]\` closing a \`(\` means the formatter must refuse to touch the file.

## Task

Write a function that returns whether a string is **balanced**:

* the bracket pairs are \`()\`, \`[]\` and \`{}\`;
* every opening bracket must be closed by a bracket **of the same type**, and brackets must close in the reverse order they were opened;
* every other character (letters, digits, spaces, quotes…) is ignored and has no special meaning;
* the empty string is balanced.

Strings are at most 10 000 characters long, so a recursive solution can run out of stack: prefer a loop.

## Function to implement

| Language | Signature |
|---|---|
| Python | \`def is_balanced(s: str) -> bool\` |
| JavaScript | \`function isBalanced(s)\` returning \`true\` or \`false\` |

A hidden driver calls your function once per test string and prints \`yes\` or \`no\`. Do **not** read input or print anything yourself: just define the function (helper functions are fine).

## Example

\`\`\`
is_balanced("([]{})")   ->  True
is_balanced("a(b)c[d]") ->  True
is_balanced("(]")       ->  False   (wrong type)
is_balanced("([)]")     ->  False   (wrong order)
is_balanced("((")       ->  False   (never closed)
is_balanced("")         ->  True
\`\`\``,
    ar: `## القصة

يجب على إضافة المحرر أن تقرر، قبل إعادة تنسيق الملف، هل أقواس المقطع متداخلة بشكل صحيح. قوس \`)\` زائد واحد، أو \`]\` يغلق \`(\`، يعني أن المنسّق يجب أن يرفض لمس الملف.

## المطلوب

اكتب دالة تعيد هل النص **متوازن**:

* أزواج الأقواس هي \`()\` و \`[]\` و \`{}\`؛
* كل قوس فتح يجب أن يُغلق بقوس **من النوع نفسه**، وتُغلق الأقواس بعكس ترتيب فتحها؛
* كل محرف آخر (حروف وأرقام ومسافات وعلامات اقتباس…) يُتجاهل ولا معنى خاصًا له؛
* النص الفارغ متوازن.

طول النص لا يتجاوز 10 000 محرف، لذا قد تنفد ذاكرة المكدس في الحل التعاودي (recursive)؛ فضّل حلقة تكرار.

## الدالة المطلوبة

| اللغة | التوقيع |
|---|---|
| Python | \`def is_balanced(s: str) -> bool\` |
| JavaScript | \`function isBalanced(s)\` وتعيد \`true\` أو \`false\` |

يستدعي مشغّل خفي دالتك مرة لكل نص اختبار ويطبع \`yes\` أو \`no\`. **لا** تقرأ مدخلات ولا تطبع شيئًا بنفسك: عرّف الدالة فقط (ويمكنك تعريف دوال مساعدة).

## مثال

\`\`\`
is_balanced("([]{})")   ->  True
is_balanced("a(b)c[d]") ->  True
is_balanced("(]")       ->  False   (wrong type)
is_balanced("([)]")     ->  False   (wrong order)
is_balanced("((")       ->  False   (never closed)
is_balanced("")         ->  True
\`\`\``,
  },
  difficulty: 2,
  points: 100,
  estMinutes: 20,
  kind: "code",
  lang: "python",
  allowedLangs: ["python", "javascript"],
  starterCode: {
    python: `def is_balanced(s):
    """Return True when every bracket in s is closed by the same type, in the right order."""
    # Your code here
    return True


# Try it while you work (comment out or delete before submitting):
# print(is_balanced("([)]"))
`,
    javascript: `function isBalanced(s) {
  // Return true when every bracket in s is closed by the same type, in the right order.
  // Your code here
  return true;
}

// Try it while you work (comment out or delete before submitting):
// console.log(isBalanced("([)]"));
`,
  },
  hints: [
    {
      text: {
        en: "Counting how many ( and ) you have seen is not enough: '([)]' has equal counts but is wrong. The order and the types both matter.",
        ar: "لا يكفي عدّ الأقواس ( و ): النص '([)]' عدداهما متساويان لكنه خاطئ. الترتيب والنوع كلاهما مهم.",
      },
      cost: 10,
    },
    {
      text: {
        en: "The most recently opened bracket must be the first one closed. Which data structure gives you 'last in, first out'?",
        ar: "آخر قوس فُتح يجب أن يكون أول قوس يُغلق. أي بنية بيانات تعطيك «آخر ما دخل أول ما خرج»؟",
      },
      cost: 15,
    },
    {
      text: {
        en: "Push every opening bracket. On a closing bracket the stack must be non-empty and its top must be the matching opener, otherwise the answer is False. At the end the stack must be empty.",
        ar: "ضع كل قوس فتح في المكدس. عند قوس إغلاق يجب أن يكون المكدس غير فارغ وأن تكون قمته هي قوس الفتح المطابق، وإلا فالجواب False. وفي النهاية يجب أن يكون المكدس فارغًا.",
      },
      cost: 15,
    },
  ],
  lessons: ["data-structures-algorithms/arrays-hashing", "data-structures-algorithms/complexity-big-o"],
  tags: ["stack", "parsing", "strings"],
  addedAt: ADDED,
};

const dsaGridShortestPath: ChallengeMeta = {
  id: "dsa-grid-shortest-path",
  track: "data-structures-algorithms",
  topic: "graphs",
  title: { en: "Warehouse Robot", ar: "روبوت المستودع" },
  summary: {
    en: "Find the fewest moves a robot needs to cross a warehouse floor plan full of shelving, or report that the exit is unreachable.",
    ar: "اعثر على أقل عدد من الحركات يحتاجه روبوت لعبور مخطط مستودع مليء بالرفوف، أو أخبر أن المخرج لا يمكن بلوغه.",
  },
  description: {
    en: `## Story

A delivery robot starts at the loading dock \`S\` of a warehouse and must reach the exit \`E\`. Shelving units (\`#\`) block the way; the free floor (\`.\`) is where it can drive. The operator wants to know the **shortest** route, and whether a route exists at all.

## Task

On a grid the robot moves one cell at a time **up, down, left or right** (no diagonals), never onto a \`#\` cell and never off the grid. Print the minimum number of moves from \`S\` to \`E\`, or \`-1\` if \`E\` cannot be reached.

## Input

* Line 1: \`R C\`, the number of rows and columns
* Then \`R\` lines of exactly \`C\` characters: \`.\` free, \`#\` wall, \`S\` start, \`E\` exit

There is exactly one \`S\` and one \`E\`. Limits: \`1 ≤ R, C ≤ 200\` (up to 40 000 cells), so trying every possible path is hopeless.

## Output

One integer: the minimum number of moves, or \`-1\`.

## Example

\`\`\`
5 8
S..#....
.#.#.##.
.#...#..
.####.#.
......#E
\`\`\`

Output: \`15\`. The shelves force a long detour along the top and down the right-hand side.`,
    ar: `## القصة

يبدأ روبوت توصيل من رصيف التحميل \`S\` في مستودع، وعليه أن يصل إلى المخرج \`E\`. وحدات الرفوف (\`#\`) تسدّ الطريق، أما الأرضية الحرة (\`.\`) فيستطيع السير عليها. يريد المشغّل معرفة **أقصر** مسار، وهل يوجد مسار أصلًا.

## المطلوب

في شبكة يتحرك الروبوت خلية واحدة في كل مرة **إلى أعلى أو أسفل أو يمين أو يسار** (دون الحركة القطرية)، ولا يدخل خلية \`#\` ولا يخرج من الشبكة. اطبع أقل عدد من الحركات من \`S\` إلى \`E\`، أو \`-1\` إذا تعذّر الوصول إلى \`E\`.

## المدخلات

* السطر الأول: \`R C\` أي عدد الصفوف والأعمدة
* ثم \`R\` سطرًا، طول كل منها \`C\` محرفًا بالضبط: \`.\` أرض حرة، \`#\` جدار، \`S\` البداية، \`E\` المخرج

يوجد \`S\` واحد و\`E\` واحد بالضبط. الحدود: \`1 ≤ R, C ≤ 200\` (حتى 40 000 خلية)، لذا فتجربة كل المسارات الممكنة غير عملية.

## المخرجات

عدد صحيح واحد: أقل عدد من الحركات، أو \`-1\`.

## مثال

\`\`\`
5 8
S..#....
.#.#.##.
.#...#..
.####.#.
......#E
\`\`\`

الناتج: \`15\`. الرفوف تفرض التفافًا طويلًا عبر الأعلى ثم نزولًا على الجانب الأيمن.`,
  },
  difficulty: 2,
  points: 150,
  estMinutes: 30,
  kind: "output",
  lang: "python",
  starterCode: {
    python: `import sys


def main():
    rows, cols = map(int, sys.stdin.readline().split())
    grid = [sys.stdin.readline().rstrip("\\n") for _ in range(rows)]
    # Your code here: fewest moves from 'S' to 'E' (up/down/left/right), or -1
    print(-1)


main()
`,
    javascript: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const [rows, cols] = lines[0].split(" ").map(Number);
const grid = lines.slice(1, 1 + rows);

// Your code here: fewest moves from 'S' to 'E' (up/down/left/right), or -1
console.log(-1);
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    int rows, cols;
    cin >> rows >> cols;
    vector<string> grid(rows);
    for (auto &line : grid) cin >> line;

    // Your code here: fewest moves from 'S' to 'E' (up/down/left/right), or -1
    cout << -1 << endl;
    return 0;
}
`,
  },
  sampleInput: "5 8\nS..#....\n.#.#.##.\n.#...#..\n.####.#.\n......#E\n",
  hints: [
    {
      text: {
        en: "Depth-first search finds *a* path, not the shortest one, and trying every path explodes on an open 200 × 200 floor. Think in layers: every cell 1 move away, then every cell 2 moves away…",
        ar: "البحث بالعمق يجد مسارًا ما وليس الأقصر، وتجربة كل المسارات تنفجر على أرضية مفتوحة بحجم 200 × 200. فكّر في طبقات: كل الخلايا على بعد حركة واحدة، ثم على بعد حركتين…",
      },
      cost: 15,
    },
    {
      text: {
        en: "Breadth-first search with a FIFO queue visits cells in order of distance, so the first time you pop E its distance is the answer. Store the distance of every cell you reach.",
        ar: "البحث بالعرض (BFS) مع طابور FIFO يزور الخلايا بترتيب المسافة، فأول مرة تسحب فيها E تكون مسافتها هي الجواب. خزّن مسافة كل خلية تصل إليها.",
      },
      cost: 20,
    },
    {
      text: {
        en: "Mark a cell as seen when you push it into the queue, not when you pop it, so every cell enters the queue once. Then the whole search costs O(R·C). If the queue empties before E appears, print -1.",
        ar: "علّم الخلية «مرئية» عند إدخالها في الطابور لا عند سحبها، فتدخل كل خلية مرة واحدة فقط وتصبح كلفة البحث كله O(R·C). وإذا فرغ الطابور قبل ظهور E فاطبع -1.",
      },
      cost: 25,
    },
  ],
  lessons: ["data-structures-algorithms/trees-graphs", "data-structures-algorithms/complexity-big-o"],
  tags: ["bfs", "graph", "grid", "shortest-path"],
  addedAt: ADDED,
};

// ── databases ─────────────────────────────────────────────────────────────────
// SQL challenges are delivered through Python: the grader's harness builds a seeded in-memory SQLite
// database (different data on every test), runs the learner's statement read-only and prints the rows.

const dbLowStockReport: ChallengeMeta = {
  id: "db-low-stock-report",
  track: "databases",
  topic: "sql-select",
  title: { en: "The Reorder List", ar: "قائمة إعادة الطلب" },
  summary: {
    en: "Write one SELECT that filters a bookshop's catalogue, handles unknown stock correctly and sorts ties the way the manager wants.",
    ar: "اكتب استعلام SELECT واحدًا يصفّي كتالوج مكتبة، ويتعامل مع المخزون المجهول بشكل صحيح، ويرتّب التعادلات كما يريد المدير.",
  },
  description: {
    en: `## Story

Every Monday the bookshop manager wants a short **reorder list**: the recent fiction and science titles that are almost sold out. The catalogue lives in one table and you are the person who knows SQL.

## Task

Write **one SQL \`SELECT\` statement** over the table \`books\`:

| column | type | meaning |
|---|---|---|
| \`id\` | INTEGER | primary key |
| \`title\` | TEXT | book title |
| \`genre\` | TEXT | e.g. \`Fiction\`, \`Science\`, \`Travel\` |
| \`published_year\` | INTEGER | year of publication |
| \`price_cents\` | INTEGER | price in cents |
| \`stock\` | INTEGER | copies on the shelf; \`NULL\` means "not counted yet" |

List the books that satisfy **all** of these:

* \`genre\` is \`Fiction\` or \`Science\`
* published in **2015 or later**
* \`stock\` is **below 5** (a book with 5 copies is fine; books whose stock was never counted are not on the list)

Return the columns \`title\`, \`published_year\`, \`stock\` in that order, sorted by \`stock\` ascending, then \`published_year\` descending, then \`title\` ascending. Return **at most 5 rows**.

## How your answer is graded

Submit **only the SQL** (one statement, a trailing \`;\` is fine; do not use three double quotes in a row). A hidden Python program creates the \`books\` table with different data for each test, runs your statement read-only and prints every row with \`|\` between the values. When nothing matches it prints \`(no rows)\`. That is why the language is **Python** here, and why you cannot run your SQL directly in Code Lab: use the playground below to experiment.

## Example

Playground (paste into Code Lab, change \`query\`, run):

\`\`\`python
import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, genre TEXT NOT NULL,
                    published_year INTEGER NOT NULL, price_cents INTEGER NOT NULL, stock INTEGER);
INSERT INTO books VALUES
  (1, 'The Silent Orchard', 'Fiction', 2019, 1599, 3),
  (2, 'Quantum Gardens', 'Science', 2021, 2499, 0),
  (3, 'Atlas of Small Rivers', 'Travel', 2018, 1999, 2),
  (4, 'Salt and Ember', 'Fiction', 2016, 1299, 4),
  (5, 'Letters to a Young Coder', 'Science', 2012, 1799, 1),
  (6, 'The Clockmaker''s Daughter', 'Fiction', 2022, 1499, 5),
  (7, 'Deep Time', 'Science', 2020, 2199, NULL),
  (8, 'Harbor Lights', 'Fiction', 2019, 1399, 3),
  (9, 'Cooking with Fire', 'Cooking', 2021, 2899, 1),
  (10, 'Orbit Notes', 'Science', 2015, 1899, 2),
  (11, 'Paper Cities', 'Fiction', 2023, 1699, 4),
  (12, 'The Last Lighthouse', 'Fiction', 2014, 999, 0);
""")

query = """
SELECT title, published_year, stock
FROM books;
"""
for row in db.execute(query):
    print("|".join(map(str, row)))
\`\`\`

The correct statement prints exactly:

\`\`\`
Quantum Gardens|2021|0
Orbit Notes|2015|2
Harbor Lights|2019|3
The Silent Orchard|2019|3
Paper Cities|2023|4
\`\`\`

("Salt and Ember" also qualifies but is cut off by the 5-row limit.)`,
    ar: `## القصة

كل يوم اثنين يريد مدير المكتبة **قائمة إعادة طلب** قصيرة: عناوين الروايات والعلوم الحديثة التي أوشكت على النفاد. الكتالوج في جدول واحد، وأنت من يعرف SQL.

## المطلوب

اكتب **استعلام \`SELECT\` واحدًا** على الجدول \`books\`:

| العمود | النوع | المعنى |
|---|---|---|
| \`id\` | INTEGER | المفتاح الأساسي |
| \`title\` | TEXT | عنوان الكتاب |
| \`genre\` | TEXT | مثل \`Fiction\` و \`Science\` و \`Travel\` |
| \`published_year\` | INTEGER | سنة النشر |
| \`price_cents\` | INTEGER | السعر بالسنت |
| \`stock\` | INTEGER | عدد النسخ على الرف؛ \`NULL\` تعني «لم يُجرَد بعد» |

اعرض الكتب التي تحقق **كل** الشروط التالية:

* \`genre\` هو \`Fiction\` أو \`Science\`
* نُشر في **2015 أو بعدها**
* \`stock\` **أقل من 5** (كتاب بخمس نسخ لا بأس به؛ والكتب التي لم يُجرَد مخزونها لا تظهر في القائمة)

أعد الأعمدة \`title\` ثم \`published_year\` ثم \`stock\` بهذا الترتيب، مرتبة حسب \`stock\` تصاعديًا، ثم \`published_year\` تنازليًا، ثم \`title\` تصاعديًا. أعد **5 صفوف على الأكثر**.

## كيف يُقيَّم جوابك

أرسل **الاستعلام فقط** (جملة واحدة، ويجوز وضع \`;\` في آخرها؛ لا تستخدم ثلاث علامات اقتباس مزدوجة متتالية). برنامج Python خفي ينشئ جدول \`books\` ببيانات مختلفة لكل اختبار، ثم ينفذ استعلامك بصلاحية القراءة فقط ويطبع كل صف مع \`|\` بين القيم. وإذا لم يتطابق أي صف يطبع \`(no rows)\`. لهذا اللغة هنا **Python**، ولهذا لا يمكنك تشغيل الـ SQL مباشرة في Code Lab؛ استخدم ملعب التجربة أدناه.

## مثال

ملعب التجربة (الصقه في Code Lab، وغيّر \`query\`، ثم شغّله):

\`\`\`python
import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, genre TEXT NOT NULL,
                    published_year INTEGER NOT NULL, price_cents INTEGER NOT NULL, stock INTEGER);
INSERT INTO books VALUES
  (1, 'The Silent Orchard', 'Fiction', 2019, 1599, 3),
  (2, 'Quantum Gardens', 'Science', 2021, 2499, 0),
  (3, 'Atlas of Small Rivers', 'Travel', 2018, 1999, 2),
  (4, 'Salt and Ember', 'Fiction', 2016, 1299, 4),
  (5, 'Letters to a Young Coder', 'Science', 2012, 1799, 1),
  (6, 'The Clockmaker''s Daughter', 'Fiction', 2022, 1499, 5),
  (7, 'Deep Time', 'Science', 2020, 2199, NULL),
  (8, 'Harbor Lights', 'Fiction', 2019, 1399, 3),
  (9, 'Cooking with Fire', 'Cooking', 2021, 2899, 1),
  (10, 'Orbit Notes', 'Science', 2015, 1899, 2),
  (11, 'Paper Cities', 'Fiction', 2023, 1699, 4),
  (12, 'The Last Lighthouse', 'Fiction', 2014, 999, 0);
""")

query = """
SELECT title, published_year, stock
FROM books;
"""
for row in db.execute(query):
    print("|".join(map(str, row)))
\`\`\`

الاستعلام الصحيح يطبع بالضبط:

\`\`\`
Quantum Gardens|2021|0
Orbit Notes|2015|2
Harbor Lights|2019|3
The Silent Orchard|2019|3
Paper Cities|2023|4
\`\`\`

(الكتاب "Salt and Ember" مؤهل أيضًا لكنه خرج بسبب حد الصفوف الخمسة.)`,
  },
  difficulty: 1,
  points: 50,
  estMinutes: 15,
  kind: "code",
  lang: "python",
  allowedLangs: ["python"],
  starterCode: {
    python: `-- Write ONE SELECT statement. Submit only SQL: no Python code here.
-- Columns: title, published_year, stock
SELECT title, published_year, stock
FROM books;
`,
  },
  hints: [
    {
      text: {
        en: "Filter rows with WHERE and join the conditions with AND. `genre IN ('Fiction', 'Science')` is shorter than two OR comparisons.",
        ar: "صفِّ الصفوف بـ WHERE واربط الشروط بـ AND. العبارة `genre IN ('Fiction', 'Science')` أقصر من مقارنتين مربوطتين بـ OR.",
      },
      cost: 5,
    },
    {
      text: {
        en: "A comparison with NULL is never true, so think about what `stock < 5` does to books with an unknown stock. ORDER BY accepts several keys, each with its own ASC or DESC.",
        ar: "أي مقارنة مع NULL لا تكون صحيحة أبدًا، فتأمل ماذا يفعل الشرط `stock < 5` بالكتب ذات المخزون المجهول. ويقبل ORDER BY عدة مفاتيح، لكل منها ASC أو DESC خاص به.",
      },
      cost: 5,
    },
    {
      text: {
        en: "Clause order is WHERE, then ORDER BY stock ASC, published_year DESC, title ASC, and LIMIT 5 comes last.",
        ar: "ترتيب الجمل هو WHERE ثم ORDER BY stock ASC, published_year DESC, title ASC، وتأتي LIMIT 5 في النهاية.",
      },
      cost: 10,
    },
  ],
  lessons: ["databases/relational-sql-basics"],
  tags: ["sql", "where", "order-by", "null"],
  addedAt: ADDED,
};

const dbLoyalCustomers: ChallengeMeta = {
  id: "db-loyal-customers",
  track: "databases",
  topic: "joins-aggregation",
  title: { en: "Loyal Customers", ar: "العملاء المخلصون" },
  summary: {
    en: "Join three tables, aggregate per customer and keep only the repeat buyers. The row fan-out of a join is the trap.",
    ar: "اربط ثلاثة جداول، وجمّع لكل عميل، وأبقِ المشترين المتكررين فقط. والفخ هنا هو تضاعف الصفوف الناتج عن الربط.",
  },
  description: {
    en: `## Story

Marketing wants to thank customers who keep coming back. You get the shop's three tables and must produce the **loyalty report**: every customer with at least two delivered orders, and how much they spent on them.

## Task

Write **one SQL \`SELECT\` statement** over these tables:

| table | columns |
|---|---|
| \`customers\` | \`id\`, \`name\`, \`country\` |
| \`orders\` | \`id\`, \`customer_id\` → customers, \`status\` (\`delivered\`, \`cancelled\` or \`pending\`) |
| \`order_items\` | \`id\`, \`order_id\` → orders, \`quantity\`, \`unit_price_cents\` |

Rules:

* Only orders with status \`delivered\` count, both for the number of orders and for the money. Cancelled and pending orders are ignored completely.
* An order is worth the sum of \`quantity * unit_price_cents\` over its items. A delivered order **with no item rows** still counts as a delivered order, worth 0.
* Report only customers with **at least 2 delivered orders**.

Return one row per customer with the columns \`name\`, \`country\`, \`delivered_orders\`, \`total_cents\` (in that order), sorted by \`total_cents\` descending, then \`name\` ascending.

## How your answer is graded

Submit **only the SQL** (one statement, a trailing \`;\` is fine; no three double quotes in a row). A hidden Python program builds the three tables with different data for each test, runs your statement read-only and prints every row with \`|\` between the values (\`(no rows)\` when the result is empty). The language is **Python** because of that wrapper; experiment with the playground below.

## Example

Playground (paste into Code Lab, change \`query\`, run):

\`\`\`python
import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, country TEXT NOT NULL);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), status TEXT NOT NULL);
CREATE TABLE order_items (id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id),
                          quantity INTEGER NOT NULL, unit_price_cents INTEGER NOT NULL);
INSERT INTO customers VALUES
  (1, 'Amira Hassan', 'Egypt'), (2, 'Ben Carter', 'UK'), (3, 'Chiyo Tanaka', 'Japan'),
  (4, 'Diego Alves', 'Brazil'), (5, 'Esther Kamau', 'Kenya'), (6, 'Farid Nasser', 'Egypt');
INSERT INTO orders VALUES
  (101, 1, 'delivered'), (102, 1, 'delivered'), (103, 1, 'cancelled'), (104, 2, 'delivered'),
  (105, 2, 'pending'), (106, 3, 'delivered'), (107, 3, 'delivered'), (108, 3, 'delivered'),
  (109, 4, 'cancelled'), (110, 4, 'cancelled'), (111, 5, 'delivered'), (112, 5, 'delivered'),
  (113, 6, 'delivered'), (114, 6, 'delivered');
INSERT INTO order_items VALUES
  (1, 101, 2, 1500), (2, 101, 1, 2500), (3, 102, 1, 4000), (4, 103, 5, 1000), (5, 104, 3, 1000),
  (6, 106, 1, 9900), (7, 107, 2, 1200), (8, 107, 1, 300), (9, 107, 4, 250), (10, 108, 1, 5000),
  (11, 111, 10, 200), (12, 112, 1, 1000), (13, 113, 2, 2750);
""")

query = """
SELECT name, country FROM customers;
"""
for row in db.execute(query):
    print("|".join(map(str, row)))
\`\`\`

The correct statement prints exactly:

\`\`\`
Chiyo Tanaka|Japan|3|18600
Amira Hassan|Egypt|2|9500
Farid Nasser|Egypt|2|5500
Esther Kamau|Kenya|2|3000
\`\`\`

Ben has only one delivered order and Diego none, so they are left out. Farid's second order (114) has no items but still counts.`,
    ar: `## القصة

يريد فريق التسويق شكر العملاء الذين يعودون باستمرار. بين يديك جداول المتجر الثلاثة، وعليك إنتاج **تقرير الولاء**: كل عميل لديه طلبان مُسلَّمان على الأقل، ومقدار ما أنفقه عليهما.

## المطلوب

اكتب **استعلام \`SELECT\` واحدًا** على هذه الجداول:

| الجدول | الأعمدة |
|---|---|
| \`customers\` | \`id\` و \`name\` و \`country\` |
| \`orders\` | \`id\` و \`customer_id\` → customers و \`status\` (‏\`delivered\` أو \`cancelled\` أو \`pending\`) |
| \`order_items\` | \`id\` و \`order_id\` → orders و \`quantity\` و \`unit_price_cents\` |

القواعد:

* تُحتسب فقط الطلبات ذات الحالة \`delivered\`، سواء في عدد الطلبات أو في المبلغ. أما الطلبات الملغاة والمعلّقة فتُهمل تمامًا.
* قيمة الطلب هي مجموع \`quantity * unit_price_cents\` لبنوده. والطلب المُسلَّم **الذي ليس له صفوف بنود** يُحتسب طلبًا مسلّمًا قيمته 0.
* اعرض فقط العملاء الذين لديهم **طلبان مسلّمان على الأقل**.

أعد صفًا واحدًا لكل عميل بالأعمدة \`name\` و \`country\` و \`delivered_orders\` و \`total_cents\` (بهذا الترتيب)، مرتبة حسب \`total_cents\` تنازليًا ثم \`name\` تصاعديًا.

## كيف يُقيَّم جوابك

أرسل **الاستعلام فقط** (جملة واحدة، ويجوز وضع \`;\` في آخرها؛ ولا ثلاث علامات اقتباس مزدوجة متتالية). برنامج Python خفي ينشئ الجداول الثلاثة ببيانات مختلفة لكل اختبار، وينفذ استعلامك بصلاحية القراءة فقط ويطبع كل صف مع \`|\` بين القيم (و\`(no rows)\` إذا كانت النتيجة فارغة). اللغة **Python** بسبب هذا الغلاف؛ جرّب في ملعب التجربة أدناه.

## مثال

ملعب التجربة (الصقه في Code Lab، وغيّر \`query\`، ثم شغّله):

\`\`\`python
import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, country TEXT NOT NULL);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), status TEXT NOT NULL);
CREATE TABLE order_items (id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id),
                          quantity INTEGER NOT NULL, unit_price_cents INTEGER NOT NULL);
INSERT INTO customers VALUES
  (1, 'Amira Hassan', 'Egypt'), (2, 'Ben Carter', 'UK'), (3, 'Chiyo Tanaka', 'Japan'),
  (4, 'Diego Alves', 'Brazil'), (5, 'Esther Kamau', 'Kenya'), (6, 'Farid Nasser', 'Egypt');
INSERT INTO orders VALUES
  (101, 1, 'delivered'), (102, 1, 'delivered'), (103, 1, 'cancelled'), (104, 2, 'delivered'),
  (105, 2, 'pending'), (106, 3, 'delivered'), (107, 3, 'delivered'), (108, 3, 'delivered'),
  (109, 4, 'cancelled'), (110, 4, 'cancelled'), (111, 5, 'delivered'), (112, 5, 'delivered'),
  (113, 6, 'delivered'), (114, 6, 'delivered');
INSERT INTO order_items VALUES
  (1, 101, 2, 1500), (2, 101, 1, 2500), (3, 102, 1, 4000), (4, 103, 5, 1000), (5, 104, 3, 1000),
  (6, 106, 1, 9900), (7, 107, 2, 1200), (8, 107, 1, 300), (9, 107, 4, 250), (10, 108, 1, 5000),
  (11, 111, 10, 200), (12, 112, 1, 1000), (13, 113, 2, 2750);
""")

query = """
SELECT name, country FROM customers;
"""
for row in db.execute(query):
    print("|".join(map(str, row)))
\`\`\`

الاستعلام الصحيح يطبع بالضبط:

\`\`\`
Chiyo Tanaka|Japan|3|18600
Amira Hassan|Egypt|2|9500
Farid Nasser|Egypt|2|5500
Esther Kamau|Kenya|2|3000
\`\`\`

لدى Ben طلب مسلَّم واحد فقط ولا شيء لدى Diego، فاستُبعدا. وطلب Farid الثاني (114) بلا بنود لكنه يُحتسب.`,
  },
  difficulty: 2,
  points: 150,
  estMinutes: 30,
  kind: "code",
  lang: "python",
  allowedLangs: ["python"],
  starterCode: {
    python: `-- Write ONE SELECT statement. Submit only SQL: no Python code here.
-- Columns: name, country, delivered_orders, total_cents
SELECT c.name, c.country
FROM customers AS c;
`,
  },
  hints: [
    {
      text: {
        en: "You need all three tables: customers → orders → order_items. Decide what belongs in WHERE (rows removed before grouping) and what in HAVING (groups removed after).",
        ar: "تحتاج الجداول الثلاثة: customers ثم orders ثم order_items. حدّد ما مكانه WHERE (صفوف تُحذف قبل التجميع) وما مكانه HAVING (مجموعات تُحذف بعد التجميع).",
      },
      cost: 15,
    },
    {
      text: {
        en: "Joining the items repeats an order once per item row, so COUNT(*) counts items, not orders. Count distinct order ids instead.",
        ar: "ربط البنود يكرر الطلب مرة لكل صف بند، لذا COUNT(*) تعدّ البنود لا الطلبات. عُدّ معرّفات الطلبات المميزة بدلًا من ذلك.",
      },
      cost: 20,
    },
    {
      text: {
        en: "An INNER JOIN to order_items silently drops delivered orders that have no items. Use a LEFT JOIN there and COALESCE(SUM(...), 0) so those orders still count.",
        ar: "الربط الداخلي INNER JOIN مع order_items يُسقط بصمت الطلبات المسلَّمة التي لا بنود لها. استخدم LEFT JOIN هناك مع COALESCE(SUM(...), 0) كي تبقى محتسبة.",
      },
      cost: 25,
    },
  ],
  lessons: ["databases/joins-aggregation", "data-science/sql-data-science"],
  tags: ["sql", "join", "group-by", "having"],
  addedAt: ADDED,
};

// ── data-science ──────────────────────────────────────────────────────────────

const dsDescriptiveStats: ChallengeMeta = {
  id: "ds-descriptive-stats",
  track: "data-science",
  topic: "statistics",
  title: { en: "Rainfall Summary", ar: "ملخص هطول الأمطار" },
  summary: {
    en: "Turn a messy list of daily rainfall readings into the four numbers every report starts with: mean, median, mode and standard deviation.",
    ar: "حوّل قائمة غير مرتبة من قراءات المطر اليومية إلى الأرقام الأربعة التي يبدأ بها كل تقرير: المتوسط والوسيط والمنوال والانحراف المعياري.",
  },
  description: {
    en: `## Story

A weather station logs the rainfall (in millimetres) of every day of the season, in the order the readings arrived. Before the data goes into a dashboard, the analyst wants a one-glance summary.

## Task

Read the readings and print four statistics, **one per line, in this order**:

1. **mean**: the sum divided by the count
2. **median**: the middle value of the sorted readings; for an even count, the average of the two middle values
3. **mode**: the most frequent value; if several values share the highest frequency, print the **smallest** of them
4. **standard deviation**: the **population** standard deviation, \`sqrt( Σ(x − mean)² / n )\` (divide by \`n\`, not \`n − 1\`)

## Input

* Line 1: \`n\` (1 ≤ n ≤ 5000)
* Line 2: \`n\` numbers, each with at most 2 decimal places and \`|x| ≤ 100000\`, in no particular order

## Output

Four lines with the four numbers. Print at least 4 decimals; any answer within \`0.0001\` of the exact value is accepted.

## Example

\`\`\`
8
2 4 4 4 5 5 7 9
\`\`\`

Output:

\`\`\`
5
4.5
4
2
\`\`\`

(The mean is 40 / 8 = 5, the two middle values 4 and 5 give 4.5, the value 4 appears three times, and the squared distances from 5 add up to 32, so σ = √(32 / 8) = 2.)`,
    ar: `## القصة

تسجّل محطة أرصاد كمية المطر (بالميليمتر) لكل يوم من أيام الموسم بحسب ترتيب وصول القراءات. وقبل إدخال البيانات في لوحة المتابعة يريد المحلل ملخصًا يُقرأ بنظرة واحدة.

## المطلوب

اقرأ القراءات واطبع أربع إحصاءات، **كل واحدة في سطر وبهذا الترتيب**:

1. **المتوسط (mean)**: المجموع مقسومًا على العدد
2. **الوسيط (median)**: القيمة الوسطى للقراءات بعد ترتيبها؛ وإذا كان العدد زوجيًا فمتوسط القيمتين الوسطيين
3. **المنوال (mode)**: القيمة الأكثر تكرارًا؛ وإذا تساوى عدة قيم في أعلى تكرار فاطبع **أصغرها**
4. **الانحراف المعياري**: الانحراف المعياري **للمجتمع**، أي \`sqrt( Σ(x − mean)² / n )\` (قسمة على \`n\` وليس \`n − 1\`)

## المدخلات

* السطر الأول: \`n\` (‏1 ≤ n ≤ 5000)
* السطر الثاني: \`n\` عددًا، لكل منها منزلتان عشريتان على الأكثر و\`|x| ≤ 100000\`، بلا ترتيب معيّن

## المخرجات

أربعة أسطر بالأرقام الأربعة. اطبع 4 منازل عشرية على الأقل؛ ويُقبل أي جواب يبعد عن القيمة الدقيقة بأقل من \`0.0001\`.

## مثال

\`\`\`
8
2 4 4 4 5 5 7 9
\`\`\`

الناتج:

\`\`\`
5
4.5
4
2
\`\`\`

(المتوسط 40 / 8 = 5، والقيمتان الوسطيان 4 و5 تعطيان 4.5، والقيمة 4 تتكرر ثلاث مرات، ومجموع مربعات البعد عن 5 يساوي 32 فيكون σ = √(32 / 8) = 2.)`,
  },
  difficulty: 1,
  points: 50,
  estMinutes: 15,
  kind: "output",
  lang: "python",
  starterCode: {
    python: `import sys

data = sys.stdin.read().split()
n = int(data[0])
values = [float(x) for x in data[1:1 + n]]

# Your code here: compute mean, median, mode and population standard deviation
mean = median = mode = std = 0.0

print(f"{mean:.4f}")
print(f"{median:.4f}")
print(f"{mode:.4f}")
print(f"{std:.4f}")
`,
    javascript: `const data = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean);
const n = Number(data[0]);
const values = data.slice(1, 1 + n).map(Number);

// Your code here: compute mean, median, mode and population standard deviation
const mean = 0;
const median = 0;
const mode = 0;
const std = 0;

for (const v of [mean, median, mode, std]) console.log(v.toFixed(4));
`,
  },
  sampleInput: "8\n2 4 4 4 5 5 7 9\n",
  hints: [
    {
      text: {
        en: "The readings arrive unsorted. Sort a copy first: the median is its middle element, or the average of the two middle ones when n is even.",
        ar: "القراءات تصل غير مرتبة. رتّب نسخة منها أولًا: الوسيط هو عنصرها الأوسط، أو متوسط العنصرين الأوسطين عندما يكون n زوجيًا.",
      },
      cost: 5,
    },
    {
      text: {
        en: "Count how often each value appears with a dictionary (or Counter), then pick the highest count; break ties by taking the smallest value.",
        ar: "عُدّ مرات ظهور كل قيمة بقاموس (أو Counter)، ثم اختر أعلى تكرار، وعند التعادل خذ أصغر قيمة.",
      },
      cost: 5,
    },
    {
      text: {
        en: "Standard deviation: take the mean first, then the average of (x − mean)² over all n values, then the square root. Dividing by n − 1 gives the sample version, which is not asked here.",
        ar: "الانحراف المعياري: احسب المتوسط أولًا، ثم متوسط (x − mean)² على جميع القيم الـ n، ثم الجذر التربيعي. القسمة على n − 1 تعطي نسخة العينة وهي غير مطلوبة هنا.",
      },
      cost: 10,
    },
  ],
  lessons: ["data-science/statistics"],
  tags: ["statistics", "mean-median-mode", "standard-deviation"],
  addedAt: ADDED,
};

const dsClassifierReport: ChallengeMeta = {
  id: "ds-classifier-report",
  track: "data-science",
  topic: "model-evaluation",
  title: { en: "Report Card for a Classifier", ar: "بطاقة تقييم لمصنِّف" },
  summary: {
    en: "Score a ticket-triage model from its predictions: per-class precision, recall and F1, then macro-F1 and accuracy, with the zero-division traps handled.",
    ar: "قيّم نموذج فرز التذاكر انطلاقًا من تنبؤاته: الدقة (precision) والاسترجاع (recall) و F1 لكل صنف، ثم macro-F1 والصحة (accuracy)، مع معالجة حالات القسمة على صفر.",
  },
  description: {
    en: `## Story

The support team trained a bot that sorts incoming tickets into classes such as \`billing\`, \`bug\` and \`feature\`. Before it goes live, you must grade it: for a log of real tickets you know both the **actual** class and the class the bot **predicted**.

## Task

Read the log and print, for **every class** that appears (as an actual *or* a predicted label), its precision, recall and F1, then the macro F1 and the accuracy.

For a class \`c\`:

* **TP** = tickets that are actually \`c\` and predicted \`c\`
* **precision** = TP / (tickets predicted \`c\`)
* **recall** = TP / (tickets that are actually \`c\`)
* **F1** = 2 · precision · recall / (precision + recall)
* If a denominator is 0, that value is defined as **0** (a class that is never predicted has precision 0; never present has recall 0; F1 is 0 when precision + recall is 0)

Then **macro F1** = the plain average of the F1 of all classes, and **accuracy** = correct predictions / n.

## Input

* Line 1: \`n\` (1 ≤ n ≤ 3000)
* Then \`n\` lines \`actual predicted\`. Labels are lowercase letters, digits or underscores, at most 12 characters, without spaces.

## Output

One line per class, classes sorted by plain character code (like Python's \`sorted\`): \`<class> <precision> <recall> <f1>\`. Then the lines \`macro_f1 <value>\` and \`accuracy <value>\`. Print at least 4 decimals: every number within \`0.001\` of the exact value is accepted.

## Example

\`\`\`
12
bug bug
bug billing
bug bug
bug bug
billing billing
billing billing
billing bug
feature feature
feature bug
bug bug
billing billing
feature billing
\`\`\`

Output:

\`\`\`
billing 0.6 0.75 0.6667
bug 0.6667 0.8 0.7273
feature 1.0 0.3333 0.5
macro_f1 0.6313
accuracy 0.6667
\`\`\`

For \`feature\`: the bot predicted it once and was right (precision 1), but only 1 of the 3 real feature tickets was found (recall 0.3333).`,
    ar: `## القصة

درّب فريق الدعم روبوتًا يصنّف التذاكر الواردة إلى أصناف مثل \`billing\` و \`bug\` و \`feature\`. وقبل إطلاقه عليك تقييمه: لديك سجل لتذاكر حقيقية تعرف فيها الصنف **الفعلي** والصنف الذي **تنبأ** به الروبوت.

## المطلوب

اقرأ السجل واطبع، لكل **صنف** يظهر فيه (سواء كتسمية فعلية أو متنبَّأ بها)، الدقة (precision) والاسترجاع (recall) و F1، ثم macro F1 والصحة (accuracy).

لصنف \`c\`:

* **TP** = التذاكر التي صنفها الفعلي \`c\` وتنبأ بها الروبوت \`c\`
* **precision** = TP / (عدد التذاكر المتنبَّأ بأنها \`c\`)
* **recall** = TP / (عدد التذاكر التي صنفها الفعلي \`c\`)
* **F1** = 2 · precision · recall / (precision + recall)
* إذا كان المقام 0 فالقيمة تُعرَّف بأنها **0** (الصنف الذي لم يُتنبأ به أبدًا دقته 0؛ والذي لا وجود له فعليًا استرجاعه 0؛ و F1 تساوي 0 إذا كان precision + recall يساوي 0)

ثم **macro F1** = المتوسط العادي لقيم F1 لجميع الأصناف، و**accuracy** = التنبؤات الصحيحة / n.

## المدخلات

* السطر الأول: \`n\` (‏1 ≤ n ≤ 3000)
* ثم \`n\` سطرًا بالشكل \`actual predicted\`. التسميات حروف صغيرة أو أرقام أو شرطات سفلية، بطول 12 محرفًا على الأكثر وبلا مسافات.

## المخرجات

سطر لكل صنف، والأصناف مرتبة بحسب رمز المحرف المجرد (مثل \`sorted\` في Python): ‏\`<class> <precision> <recall> <f1>\`. ثم السطران \`macro_f1 <value>\` و \`accuracy <value>\`. اطبع 4 منازل عشرية على الأقل: يُقبل أي رقم يبعد عن القيمة الدقيقة بأقل من \`0.001\`.

## مثال

\`\`\`
12
bug bug
bug billing
bug bug
bug bug
billing billing
billing billing
billing bug
feature feature
feature bug
bug bug
billing billing
feature billing
\`\`\`

الناتج:

\`\`\`
billing 0.6 0.75 0.6667
bug 0.6667 0.8 0.7273
feature 1.0 0.3333 0.5
macro_f1 0.6313
accuracy 0.6667
\`\`\`

للصنف \`feature\`: تنبأ به الروبوت مرة واحدة وأصاب (الدقة 1)، لكنه وجد تذكرة واحدة فقط من أصل 3 تذاكر feature حقيقية (الاسترجاع 0.3333).`,
  },
  difficulty: 2,
  points: 150,
  estMinutes: 30,
  kind: "output",
  lang: "python",
  starterCode: {
    python: `import sys

data = sys.stdin.read().split()
n = int(data[0])
pairs = [(data[1 + 2 * i], data[2 + 2 * i]) for i in range(n)]

# Your code here: per-class precision / recall / F1, then macro_f1 and accuracy
print("macro_f1 0")
print("accuracy 0")
`,
    javascript: `const data = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean);
const n = Number(data[0]);
const pairs = [];
for (let i = 0; i < n; i++) pairs.push([data[1 + 2 * i], data[2 + 2 * i]]);

// Your code here: per-class precision / recall / F1, then macro_f1 and accuracy
console.log("macro_f1 0");
console.log("accuracy 0");
`,
  },
  sampleInput:
    "12\nbug bug\nbug billing\nbug bug\nbug bug\nbilling billing\nbilling billing\nbilling bug\nfeature feature\nfeature bug\nbug bug\nbilling billing\nfeature billing\n",
  hints: [
    {
      text: {
        en: "Do one pass over the pairs and keep three dictionaries keyed by label: true positives, how often the label was predicted, and how often it was actual.",
        ar: "اقرأ الأزواج في مرور واحد واحتفظ بثلاثة قواميس مفتاحها التسمية: الإيجابيات الصحيحة، وعدد مرات التنبؤ بالتسمية، وعدد مرات كونها فعلية.",
      },
      cost: 15,
    },
    {
      text: {
        en: "Write a small helper that divides and returns 0 when the denominator is 0, and use it for precision, recall and F1. A class that is never predicted must not crash your program.",
        ar: "اكتب دالة مساعدة صغيرة تقسم وتعيد 0 عندما يكون المقام 0، واستخدمها للدقة والاسترجاع و F1. الصنف الذي لا يُتنبأ به أبدًا يجب ألا يُسقط برنامجك.",
      },
      cost: 20,
    },
    {
      text: {
        en: "The class list is the union of both columns, sorted: a class may appear only among the predictions. Macro F1 averages the per-class F1 over all of them; accuracy is the sum of TP divided by n.",
        ar: "قائمة الأصناف هي اتحاد العمودين مرتبًا: قد يظهر صنف بين التنبؤات فقط. يحسب macro F1 متوسط F1 لكل الأصناف، والصحة هي مجموع TP مقسومًا على n.",
      },
      cost: 25,
    },
  ],
  lessons: ["data-science/machine-learning-ds", "data-science/statistics"],
  tags: ["classification", "precision-recall", "f1", "confusion-matrix"],
  addedAt: ADDED,
};

export const algorithmsChallenges: ChallengeMeta[] = [dsaPairSumCount, dsaBracketBalance, dsaGridShortestPath, dbLowStockReport, dbLoyalCustomers, dsDescriptiveStats, dsClassifierReport];
