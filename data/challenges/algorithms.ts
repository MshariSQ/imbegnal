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

export const algorithmsChallenges: ChallengeMeta[] = [dsaPairSumCount, dsaBracketBalance];
