import type { Lesson, LessonSection } from "../types";
import { estimateMinutes } from "./estimate";

// Large inputs are generated here (not pasted) so the file stays readable. Expected outputs are
// derived by methods that differ from the reference solutions (closed forms or other algorithms).

// Coin lab, two coins 7 and 11: enumerate how many 11s are used instead of filling a DP table.
const COIN_AMOUNT = 9998;
const sevenElevenExpected = (() => {
  let best = -1;
  for (let b = 0; 11 * b <= COIN_AMOUNT; b++) {
    const rest = COIN_AMOUNT - 11 * b;
    if (rest % 7 === 0 && (best === -1 || rest / 7 + b < best)) best = rest / 7 + b;
  }
  return String(best);
})();
// US coins {1, 5, 10, 25} form a canonical system, so taking the largest coin first is optimal:
// 9 999 = 399 x 25 + 2 x 10 + 4 x 1, which is 405 coins.

// LCS lab: two pseudo-random 2 000-letter strings. The expected length uses the Hunt-Szymanski
// reduction (longest strictly increasing sequence of matching positions), not the DP table.
const lcsA = Array.from({ length: 2000 }, (_, i) => String.fromCharCode(97 + (((i * 7919 + 13) % 100003) % 26))).join("");
const lcsB = Array.from({ length: 2000 }, (_, j) => String.fromCharCode(97 + (((j * 104729 + 7) % 100019) % 26))).join("");
const lcsExpected = (() => {
  const positions = new Map<string, number[]>();
  for (let j = lcsB.length - 1; j >= 0; j--) {
    const list = positions.get(lcsB[j]) ?? [];
    list.push(j); // decreasing order, so one letter of lcsA can extend the sequence only once
    positions.set(lcsB[j], list);
  }
  const tails: number[] = [];
  for (const ch of lcsA) {
    for (const j of positions.get(ch) ?? []) {
      let lo = 0;
      let hi = tails.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (tails[mid] >= j) hi = mid;
        else lo = mid + 1;
      }
      tails[lo] = j;
    }
  }
  return String(tails.length);
})();

// Knapsack lab: 80 copies each of (w 6, v 10), (w 5, v 8) and (w 4, v 6), capacity 1 001. The
// expected value enumerates how many of the first two kinds are taken and fills the rest with the
// third kind: a counting argument, not the DP.
const KNAP_KINDS: [number, number][] = [
  [6, 10],
  [5, 8],
  [4, 6],
];
const KNAP_COPIES = 80;
const KNAP_CAP = 1001;
const knapInput = `${KNAP_KINDS.length * KNAP_COPIES} ${KNAP_CAP}\n${Array.from({ length: KNAP_COPIES }, () =>
  KNAP_KINDS.map(([w, v]) => `${w} ${v}`)
)
  .flat()
  .join("\n")}\n`;
const knapExpected = (() => {
  let best = 0;
  for (let a = 0; a <= KNAP_COPIES; a++) {
    for (let b = 0; b <= KNAP_COPIES; b++) {
      const rest = KNAP_CAP - 6 * a - 5 * b;
      if (rest < 0) continue;
      const c = Math.min(KNAP_COPIES, Math.floor(rest / 4));
      best = Math.max(best, 10 * a + 8 * b + 6 * c);
    }
  }
  return String(best);
})();

const sections: LessonSection[] = [
  {
    type: "text",
    body: {
      en: `## What you'll learn

- How **recursion** solves a problem with smaller copies of itself: the **base case**, the **recursive case** and the **call stack** underneath
- Why naive recursion can explode **exponentially**, and how to spot it in the call tree
- **Memoization** (top-down) and **tabulation** (bottom-up): two ways to solve every subproblem only once
- A five-step recipe for **dynamic programming**: state, transition, base case, order, answer
- The classics: **Fibonacci**, **coin change**, **longest common subsequence** and the **0/1 knapsack**
- You will write: a minimum-coins solver, an LCS table and a knapsack packer`,
      ar: `## ماذا ستتعلم

- كيف يحلّ **التكرار الذاتي (recursion)** مسألةً بنسخ أصغر منها: **الحالة الأساسية (base case)** و**حالة الاستدعاء الذاتي** و**مكدّس الاستدعاءات** الذي يعمل تحتهما
- لماذا قد ينفجر التكرار الذاتي الساذج **أسّياً**، وكيف تكتشف ذلك في شجرة الاستدعاءات
- **الحفظ المؤقت (memoization)** من الأعلى إلى الأسفل و**الجدولة (tabulation)** من الأسفل إلى الأعلى: طريقتان لحلّ كل مسألة فرعية مرة واحدة فقط
- وصفة من خمس خطوات **للبرمجة الديناميكية (dynamic programming)**: الحالة، والانتقال، والحالة الأساسية، والترتيب، والجواب
- المسائل الكلاسيكية: **فيبوناتشي** و**صرف النقود (coin change)** و**أطول تتابع جزئي مشترك (LCS)** و**حقيبة الظهر 0/1 (knapsack)**
- ستكتب: حلّالاً لأقل عدد من القطع النقدية، وجدول LCS، ومُعبّئاً لحقيبة الظهر`,
    },
  },
  {
    type: "text",
    body: {
      en: `## The staircase and the notebook

You climb a staircase of \`n\` steps, taking **1 or 2 steps** at a time. In how many different ways can you reach the top?

Think about your **last move**. You arrived at step \`n\` either from step \`n - 1\` (a single step) or from step \`n - 2\` (a double step). So:

\`\`\`
ways(n) = ways(n - 1) + ways(n - 2)        ways(1) = 1, ways(2) = 2
\`\`\`

That is recursion: the answer for \`n\` is built from answers to **smaller copies of the same question**. It is also the Fibonacci sequence in disguise.

Now a friend asks for \`ways(40)\`. If you follow the rule blindly, you compute \`ways(38)\` twice, \`ways(37)\` three times, \`ways(36)\` five times... and hundreds of millions of calls later you have the answer. If you keep a **notebook** and write down each answer the first time you find it, you need only 40 small additions.

**Dynamic programming is recursion plus a notebook.** The name was chosen by the mathematician Richard Bellman in the 1950s; "programming" meant planning a schedule, not writing code.`,
      ar: `## الدَّرَج والدفتر

تصعد دَرَجاً من \`n\` درجة، **درجةً أو درجتين** في كل مرة. بكم طريقة مختلفة يمكنك أن تبلغ القمة؟

فكّر في **خطوتك الأخيرة**. وصلت إلى الدرجة \`n\` إما من الدرجة \`n - 1\` (خطوة مفردة) وإما من الدرجة \`n - 2\` (خطوة مزدوجة). إذن:

\`\`\`
ways(n) = ways(n - 1) + ways(n - 2)        ways(1) = 1, ways(2) = 2
\`\`\`

هذا هو التكرار الذاتي: جواب \`n\` مبنيّ من أجوبة **نسخ أصغر من السؤال نفسه**. وهو أيضاً متتالية فيبوناتشي في ثوب آخر.

الآن يسألك صديق عن \`ways(40)\`. إن اتبعت القاعدة بلا تفكير فستحسب \`ways(38)\` مرتين، و\`ways(37)\` ثلاث مرات، و\`ways(36)\` خمس مرات... وبعد مئات الملايين من الاستدعاءات تحصل على الجواب. أما إن احتفظت **بدفتر** وكتبت كل جواب أول مرة تجده، فلن تحتاج إلا إلى 40 عملية جمع صغيرة.

**البرمجة الديناميكية هي التكرار الذاتي مع دفتر.** وقد اختار الاسمَ عالمُ الرياضيات Richard Bellman في خمسينيات القرن العشرين؛ وكانت كلمة "programming" تعني تخطيط جدول زمني، لا كتابة الشيفرة.`,
    },
  },
  {
    type: "text",
    body: {
      en: `## Recursion and the call stack

A **recursive function** calls itself on a smaller input. It always has two parts:

- **Base case:** an input small enough to answer directly, without another call.
- **Recursive case:** shrink the problem, call yourself, and combine the result.

Every call gets a **frame** on the call stack (its parameters and local variables). The frames pile up until a base case is reached, then they are removed in reverse order as each call returns:

\`\`\`
fact(4)                       call stack at the deepest point:
= 4 * fact(3)                   fact(1)   <- base case, returns 1
      = 3 * fact(2)             fact(2)
            = 2 * fact(1)       fact(3)
                  = 1           fact(4)
then 2 * 1 = 2, 3 * 2 = 6, 4 * 6 = 24 as the frames pop
\`\`\`

**Trust the smaller call.** When you write \`fact(n) = n * fact(n - 1)\`, assume \`fact(n - 1)\` already works and only check two things: the combination is right, and every path eventually reaches a base case.

**No reachable base case means infinite recursion.** The stack grows until the language stops it: Python raises \`RecursionError\` (its default limit is about 1,000 nested calls, see \`sys.getrecursionlimit()\`), C and Rust programs crash with a *stack overflow*. Python also does not optimise tail calls, so a very deep recursion must be rewritten as a loop, with an explicit stack if needed (as with DFS in Trees & Graphs).

**Halving instead of shrinking by one** is where recursion shines. Computing x to the power n by multiplying n times is O(n); recursion gives O(log n):

\`\`\`python
def power(x, n):
    if n == 0:
        return 1                       # base case
    half = power(x, n // 2)            # solve a problem half the size, once
    return half * half if n % 2 == 0 else half * half * x
\`\`\`

This is **divide and conquer**, the same idea as merge sort: split, solve the parts, combine.`,
      ar: `## التكرار الذاتي ومكدّس الاستدعاءات

**الدالة ذاتية الاستدعاء (recursive function)** تستدعي نفسها على مدخل أصغر. ولها دائماً جزءان:

- **الحالة الأساسية (base case):** مدخل صغير بما يكفي لنجيب عنه مباشرة، دون استدعاء آخر.
- **حالة الاستدعاء الذاتي (recursive case):** صغّر المسألة، واستدعِ نفسك، واجمع النتيجة.

كل استدعاء يحصل على **إطار (frame)** في مكدّس الاستدعاءات (معاملاته ومتغيراته المحلية). تتراكم الإطارات حتى نبلغ حالة أساسية، ثم تُزال بالترتيب المعكوس كلما عاد استدعاء:

\`\`\`
fact(4)                       call stack at the deepest point:
= 4 * fact(3)                   fact(1)   <- base case, returns 1
      = 3 * fact(2)             fact(2)
            = 2 * fact(1)       fact(3)
                  = 1           fact(4)
then 2 * 1 = 2, 3 * 2 = 6, 4 * 6 = 24 as the frames pop
\`\`\`

**ثق بالاستدعاء الأصغر.** حين تكتب \`fact(n) = n * fact(n - 1)\` افترض أن \`fact(n - 1)\` تعمل أصلاً، وافحص أمرين فقط: أن طريقة الجمع صحيحة، وأن كل مسار يبلغ حالة أساسية في النهاية.

**غياب حالة أساسية يمكن بلوغها يعني تكراراً لا ينتهي.** يكبر المكدّس حتى توقفه اللغة: Python ترفع \`RecursionError\` (حدّها الافتراضي نحو 1,000 استدعاء متداخل، انظر \`sys.getrecursionlimit()\`)، وبرامج C وRust تنهار بـ*فيضان المكدّس (stack overflow)*. كما أن Python لا تحسّن الاستدعاءات الذيلية (tail calls)، فالتكرار الذاتي العميق جداً يجب أن يُعاد كتابته كحلقة، مع مكدّس صريح عند الحاجة (كما فعلنا مع DFS في درس الأشجار والـ Graphs).

**التنصيف بدل التصغير بواحد** هو حيث يتألق التكرار الذاتي. حساب x مرفوعاً للقوة n بضرب n مرة هو O(n)؛ أما التكرار الذاتي فيعطي O(log n):

\`\`\`python
def power(x, n):
    if n == 0:
        return 1                       # الحالة الأساسية
    half = power(x, n // 2)            # حلّ مسألة بنصف الحجم، مرة واحدة
    return half * half if n % 2 == 0 else half * half * x
\`\`\`

هذا هو **فرّق تسد (divide and conquer)**، الفكرة نفسها في merge sort: قسّم، وحلّ الأجزاء، ثم اجمع.`,
    },
  },
  {
    type: "text",
    body: {
      en: `## When recursion explodes, and how to stop it

Here is the call tree of the naive \`fib(5)\` (with \`fib(0) = 0\`, \`fib(1) = 1\`, and \`fib(n) = fib(n - 1) + fib(n - 2)\`):

\`\`\`
                 fib(5)
              /          \\
         fib(4)            fib(3)
        /      \\          /      \\
    fib(3)    fib(2)   fib(2)    fib(1)
    /    \\     ...      ...
 fib(2) fib(1)
   ...
\`\`\`

\`fib(3)\` is computed twice and \`fib(2)\` three times. The number of calls for \`fib(n)\` is exactly \`2 x fib(n + 1) - 1\`: 177 calls for \`fib(10)\`, but **2,692,537** for \`fib(30)\`. Each step up multiplies the work by about 1.618 (the golden ratio): **exponential** time.

The waste comes from **overlapping subproblems**: the same smaller question is asked again and again. Dynamic programming applies when a problem has overlapping subproblems **and optimal substructure** (the best answer is built from the best answers to subproblems). Merge sort has no overlap (each half is different), so a notebook would not help it.

**Memoization (top-down).** Keep the recursive code and add a cache keyed by the arguments: look up before computing, store after computing. In Python, \`@functools.cache\` (or \`@functools.lru_cache(maxsize=None)\`) does it for you; the arguments must be hashable.

**Tabulation (bottom-up).** Fill an array from the base cases upwards, in an order where everything an entry needs is already filled. No recursion, so no depth limit, and you can often keep only the last row or the last two values.

Either way, **time = number of states x work per state**. For Fibonacci that is n states x O(1) = **O(n)** instead of O(1.618ⁿ).

**The recipe** for any DP problem:

1. **State:** say in one sentence what \`dp[i]\` (or \`dp[i][j]\`) means.
2. **Transition:** how a state is computed from smaller states.
3. **Base cases:** the smallest states, known directly.
4. **Order:** compute every state after the states it depends on.
5. **Answer:** which state holds the final result.`,
      ar: `## حين ينفجر التكرار الذاتي، وكيف نوقفه

هذه شجرة استدعاءات \`fib(5)\` الساذجة (مع \`fib(0) = 0\` و\`fib(1) = 1\` و\`fib(n) = fib(n - 1) + fib(n - 2)\`):

\`\`\`
                 fib(5)
              /          \\
         fib(4)            fib(3)
        /      \\          /      \\
    fib(3)    fib(2)   fib(2)    fib(1)
    /    \\     ...      ...
 fib(2) fib(1)
   ...
\`\`\`

تُحسب \`fib(3)\` مرتين و\`fib(2)\` ثلاث مرات. وعدد الاستدعاءات لـ \`fib(n)\` هو بالضبط \`2 × fib(n + 1) - 1\`: أي 177 استدعاءً لـ \`fib(10)\`، لكن **2,692,537** لـ \`fib(30)\`. وكل زيادة بخطوة تضرب العمل في نحو 1.618 (النسبة الذهبية): زمن **أسّي**.

يأتي الهدر من **المسائل الفرعية المتداخلة (overlapping subproblems)**: السؤال الأصغر نفسه يُطرح مرة بعد مرة. وتنطبق البرمجة الديناميكية حين يكون في المسألة تداخل في المسائل الفرعية **وبنية جزئية مثلى (optimal substructure)** (أي أن أفضل جواب مبنيّ من أفضل أجوبة المسائل الفرعية). أما merge sort فلا تداخل فيه (كل نصف مختلف)، فلن يفيده الدفتر.

**الحفظ المؤقت (Memoization) من الأعلى إلى الأسفل.** أبقِ الشيفرة ذاتية الاستدعاء وأضف ذاكرة مخبئية مفتاحها المعاملات: ابحث قبل أن تحسب، وخزّن بعد أن تحسب. وفي Python يفعل ذلك عنك \`@functools.cache\` (أو \`@functools.lru_cache(maxsize=None)\`)؛ ويجب أن تكون المعاملات hashable.

**الجدولة (Tabulation) من الأسفل إلى الأعلى.** املأ مصفوفة بدءاً من الحالات الأساسية صعوداً، بترتيب يكون فيه كل ما يحتاجه المدخل قد مُلئ قبله. لا تكرار ذاتي، فلا حدّ للعمق، وكثيراً ما تكتفي بالاحتفاظ بآخر صف أو بآخر قيمتين.

وفي الحالتين **الزمن = عدد الحالات × العمل لكل حالة**. وفي فيبوناتشي هذا n حالة × O(1) = **O(n)** بدل O(1.618ⁿ).

**الوصفة** لأي مسألة برمجة ديناميكية:

1. **الحالة (State):** قل في جملة واحدة ماذا تعني \`dp[i]\` (أو \`dp[i][j]\`).
2. **الانتقال (Transition):** كيف تُحسب الحالة من حالات أصغر.
3. **الحالات الأساسية:** أصغر الحالات، المعروفة مباشرة.
4. **الترتيب:** احسب كل حالة بعد الحالات التي تعتمد عليها.
5. **الجواب:** أي حالة تحمل النتيجة النهائية.`,
    },
  },
  {
    type: "code-demo",
    lang: "python",
    code: `from functools import lru_cache

calls = 0

def fib_naive(n):
    global calls
    calls += 1
    if n < 2:                      # base cases: fib(0) = 0, fib(1) = 1
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)

for n in (10, 20, 25):
    calls = 0
    value = fib_naive(n)
    print(f"naive fib({n}) = {value:>6}   calls: {calls:,}")

memo_calls = 0

@lru_cache(maxsize=None)           # the notebook: every n is computed once
def fib_memo(n):
    global memo_calls
    memo_calls += 1
    if n < 2:
        return n
    return fib_memo(n - 1) + fib_memo(n - 2)

print("memo  fib(90) =", fib_memo(90), "  calls:", memo_calls)

def fib_table(n):                  # bottom-up, keeping only the last two values
    prev, cur = 0, 1               # fib(0), fib(1)
    for _ in range(n):
        prev, cur = cur, prev + cur
    return prev

print("table fib(90) =", fib_table(90), "  no recursion, O(1) memory")
print("fib(1000) has", len(str(fib_table(1000))), "digits")
`,
    explanation: {
      en: "The naive version needs 177, then 21,891, then 242,785 calls: the work multiplies with every step. The memoized version computes each of fib(0) to fib(90) exactly once (91 calls), and the table version does the same with a plain loop and two variables, so even fib(1000) is instant.",
      ar: "تحتاج النسخة الساذجة إلى 177 ثم 21,891 ثم 242,785 استدعاءً: العمل يتضاعف مع كل خطوة. أما نسخة الحفظ المؤقت فتحسب كل قيمة من fib(0) إلى fib(90) مرة واحدة بالضبط (91 استدعاءً)، ونسخة الجدول تفعل الشيء نفسه بحلقة بسيطة ومتغيرين، فحتى fib(1000) فورية.",
    },
  },
  {
    type: "text",
    body: {
      en: `## Coin change

You must pay an amount \`A\` using as **few coins** as possible, with unlimited coins of each given value.

**Greedy is not always right.** "Take the largest coin that fits" works for coins like 1, 5, 10, 25, but not for 1, 3, 4: for \`A = 6\` greedy pays 4 + 1 + 1 (three coins) while 3 + 3 needs only two. A greedy choice can be wrong because it never reconsiders; DP considers every last coin.

**The recipe:**

1. **State:** \`dp[a]\` = the fewest coins that make exactly \`a\` (infinity if impossible).
2. **Transition:** the last coin is some \`c <= a\`, so \`dp[a] = 1 + min(dp[a - c])\` over all coins.
3. **Base case:** \`dp[0] = 0\`.
4. **Order:** \`a = 1, 2, ..., A\` (every \`a - c\` is smaller).
5. **Answer:** \`dp[A]\`, or -1 if it is still infinity.

\`\`\`
coins {1, 3, 4}

a       0  1  2  3  4  5  6
dp[a]   0  1  2  1  1  2  2       dp[6] = 1 + min(dp[5], dp[3], dp[2]) = 1 + 1
\`\`\`

Time **O(A x k)** for \`k\` coin values, memory O(A).

**A close cousin: counting the ways.** How many *combinations* of coins make \`A\`? Put the coin loop **outside**, so each combination is counted once, in coin order:

\`\`\`python
ways = [1] + [0] * A            # one way to make 0: no coins
for c in coins:
    for a in range(c, A + 1):
        ways[a] += ways[a - c]
\`\`\`

Swap the two loops and you count ordered sequences instead (1 + 2 and 2 + 1 become different). Loop order is part of the state's meaning.`,
      ar: `## صرف النقود (Coin change)

عليك أن تدفع مبلغاً \`A\` بأقل **عدد من القطع النقدية**، ولديك عدد غير محدود من كل قيمة معطاة.

**الجشع ليس صحيحاً دائماً.** قاعدة "خذ أكبر قطعة تتسع" تعمل مع قطع مثل 1 و5 و10 و25، لكنها لا تعمل مع 1 و3 و4: فمع \`A = 6\` يدفع الجشع 4 + 1 + 1 (ثلاث قطع) بينما يكفي 3 + 3 بقطعتين. قد يخطئ الاختيار الجشع لأنه لا يعيد النظر أبداً؛ أما البرمجة الديناميكية فتجرّب كل قطعة أخيرة ممكنة.

**الوصفة:**

1. **الحالة:** \`dp[a]\` = أقل عدد قطع يكوّن \`a\` بالضبط (ما لا نهاية إن تعذّر).
2. **الانتقال:** القطعة الأخيرة هي قطعة ما \`c <= a\`، إذن \`dp[a] = 1 + min(dp[a - c])\` على كل القطع.
3. **الحالة الأساسية:** \`dp[0] = 0\`.
4. **الترتيب:** \`a = 1, 2, ..., A\` (فكل \`a - c\` أصغر).
5. **الجواب:** \`dp[A]\`، أو -1 إن بقيت ما لا نهاية.

\`\`\`
coins {1, 3, 4}

a       0  1  2  3  4  5  6
dp[a]   0  1  2  1  1  2  2       dp[6] = 1 + min(dp[5], dp[3], dp[2]) = 1 + 1
\`\`\`

الزمن **O(A × k)** لـ \`k\` قيمة من القطع، والذاكرة O(A).

**قريب منها: عدّ الطرق.** كم *تركيبة* من القطع تكوّن \`A\`؟ ضع حلقة القطع في **الخارج**، فتُعدّ كل تركيبة مرة واحدة، بترتيب القطع:

\`\`\`python
ways = [1] + [0] * A            # طريقة واحدة لتكوين 0: بلا قطع
for c in coins:
    for a in range(c, A + 1):
        ways[a] += ways[a - c]
\`\`\`

بدّل الحلقتين فتعدّ المتتاليات المرتّبة بدلاً من ذلك (فيصبح 1 + 2 و2 + 1 مختلفين). فترتيب الحلقات جزء من معنى الحالة.`,
    },
  },
  {
    type: "lab",
    id: "coin-change-min",
    lang: "python",
    prompt: {
      en: `**Pay with the fewest coins.** You have unlimited coins of each given value. Find the minimum number of coins whose values add up to exactly \`A\`.

**Input:** the first line has \`k A\` (\`A\` is between 0 and 10,000). The second line has \`k\` different positive coin values.

**Output:** the minimum number of coins, or \`-1\` if \`A\` cannot be made.

**Example:** input
\`\`\`
3 6
1 3 4
\`\`\`
prints \`2\` (3 + 3).

The starter code is the **greedy** "largest coin first" idea: run it and see which tests it fails. Replace it with the bottom-up DP from the lesson: \`dp[0] = 0\` and \`dp[a] = 1 + min(dp[a - c])\`.`,
      ar: `**ادفع بأقل عدد من القطع.** لديك عدد غير محدود من كل قيمة نقدية معطاة. أوجد أقل عدد من القطع مجموع قيمها يساوي \`A\` بالضبط.

**المدخل:** السطر الأول فيه \`k A\` (و\`A\` بين 0 و10,000). والسطر الثاني فيه \`k\` قيمة نقدية موجبة مختلفة.

**المخرج:** أقل عدد من القطع، أو \`-1\` إن تعذّر تكوين \`A\`.

**مثال:** المدخل
\`\`\`
3 6
1 3 4
\`\`\`
يطبع \`2\` (3 + 3).

شيفرة البداية هي فكرة **الجشع** "أكبر قطعة أولاً": شغّلها وانظر أي الاختبارات تفشل فيها. ثم استبدل بها البرمجة الديناميكية من الأسفل إلى الأعلى كما في الدرس: \`dp[0] = 0\` و\`dp[a] = 1 + min(dp[a - c])\`.`,
    },
    starterCode: `import sys

data = sys.stdin.read().split()
k, amount = int(data[0]), int(data[1])
coins = [int(x) for x in data[2:2 + k]]

# Greedy: always take the largest coin that still fits.
# It is fast, but it is WRONG for some coin systems (try coins 1 3 4 and amount 6).
# TODO: replace it with dynamic programming:
#   dp = [0] + [infinity] * amount        dp[a] = fewest coins that make exactly a
#   for a in 1..amount: for every coin c <= a: dp[a] = min(dp[a], dp[a - c] + 1)
#   print dp[amount], or -1 if it is still infinity
rest, used = amount, 0
for c in sorted(coins, reverse=True):
    used += rest // c
    rest %= c
print(used if rest == 0 else -1)
`,
    solution: `import sys

data = sys.stdin.read().split()
k, amount = int(data[0]), int(data[1])
coins = [int(x) for x in data[2:2 + k]]

INF = float("inf")
dp = [0] + [INF] * amount          # dp[a] = fewest coins that make exactly a
for a in range(1, amount + 1):
    for c in coins:
        if c <= a and dp[a - c] + 1 < dp[a]:
            dp[a] = dp[a - c] + 1  # the last coin is c

print(dp[amount] if dp[amount] != INF else -1)
`,
    hints: [
      { en: "Make a list dp of length amount + 1. dp[0] = 0 (no coins for nothing); every other entry starts at float('inf').", ar: "أنشئ قائمة dp طولها amount + 1. dp[0] = 0 (لا قطع لمبلغ صفر)؛ وكل مدخل آخر يبدأ بـ float('inf')." },
      { en: "For a from 1 to amount, try every coin c with c <= a: if dp[a - c] + 1 is smaller than dp[a], keep it. The loop order guarantees dp[a - c] is already final.", ar: "لكل a من 1 إلى amount جرّب كل قطعة c تحقق c <= a: إن كان dp[a - c] + 1 أصغر من dp[a] فاحتفظ به. وترتيب الحلقة يضمن أن dp[a - c] نهائية مسبقاً." },
      { en: "At the end dp[amount] is the answer; if it is still infinity, print -1. A recursive solution without a cache would time out on amount 9,998.", ar: "في النهاية dp[amount] هي الجواب؛ وإن بقيت ما لا نهاية فاطبع -1. والحل التكراري الذاتي بلا ذاكرة مخبئية سيتجاوز المهلة مع المبلغ 9,998." },
    ],
    tests: [
      { name: { en: "The example: greedy says 3", ar: "المثال: الجشع يقول 3" }, stdin: "3 6\n1 3 4\n", expected: "2" },
      { name: { en: "Greedy fails again: 9 + 1 + 1 vs 5 + 6", ar: "الجشع يفشل مجدداً: 9 + 1 + 1 مقابل 5 + 6" }, stdin: "4 11\n1 5 6 9\n", expected: "2" },
      { name: { en: "Impossible amount", ar: "مبلغ مستحيل" }, stdin: "1 3\n2\n", expected: "-1" },
      { name: { en: "Amount zero", ar: "المبلغ صفر" }, stdin: "1 0\n1\n", expected: "0" },
      { name: { en: "Coins 7 and 11, amount 9,998", ar: "القطعتان 7 و11، والمبلغ 9,998" }, stdin: `2 ${COIN_AMOUNT}\n7 11\n`, expected: sevenElevenExpected },
      { name: { en: "US coins, 9,999 cents", ar: "العملات الأمريكية، 9,999 سنتاً" }, stdin: "4 9999\n1 5 10 25\n", expected: "405" },
    ],
    sampleInput: "3 6\n1 3 4\n",
  },
  {
    type: "text",
    body: {
      en: `## Longest common subsequence

A **subsequence** keeps the order of characters but may skip some: \`ACE\` is a subsequence of \`ABCDE\`; \`AEC\` is not. (A *substring* would have to be contiguous.) The **longest common subsequence (LCS)** of two strings is the longest string that is a subsequence of both. For \`ABCBDAB\` and \`BDCABA\` it has length 4, for example \`BCBA\`.

LCS is the heart of comparing sequences. A line-based \`diff\` shows the lines to delete and insert, and the lines it keeps are a longest common subsequence of the two files' lines (Git's default diff algorithm is Myers' algorithm, published in 1986). The same idea aligns DNA sequences.

**The recipe:**

1. **State:** \`dp[i][j]\` = LCS length of the first \`i\` characters of \`X\` and the first \`j\` characters of \`Y\`.
2. **Transition:** if \`X[i-1] == Y[j-1]\`, that character can end the common subsequence: \`dp[i][j] = dp[i-1][j-1] + 1\`. Otherwise one of the two last characters is not used: \`dp[i][j] = max(dp[i-1][j], dp[i][j-1])\`.
3. **Base cases:** \`dp[0][j] = dp[i][0] = 0\` (an empty string has nothing in common).
4. **Order:** row by row, left to right.
5. **Answer:** \`dp[n][m]\`.

\`\`\`
X = ACE, Y = ABCDE

         ""  A  B  C  D  E
    ""    0  0  0  0  0  0
    A     0  1  1  1  1  1      A = A: diagonal + 1
    C     0  1  1  2  2  2      C = C: dp[A][B] + 1 = 2
    E     0  1  1  2  2  3      E = E: dp[C][D] + 1 = 3  -> LCS length 3
\`\`\`

Time and memory **O(n x m)**. If you only need the length, each row depends only on the previous one, so two rows (O(m) memory) are enough. To print the subsequence itself, keep the full table and walk back from \`dp[n][m]\`: move diagonally on a match, otherwise towards the larger neighbour.`,
      ar: `## أطول تتابع جزئي مشترك (LCS)

**التتابع الجزئي (subsequence)** يحافظ على ترتيب المحارف لكنه قد يتخطّى بعضها: \`ACE\` تتابع جزئي من \`ABCDE\`؛ أما \`AEC\` فلا. (أما *النص الجزئي substring* فيجب أن يكون متصلاً.) و**أطول تتابع جزئي مشترك (LCS)** بين نصّين هو أطول نص يكون تتابعاً جزئياً من كليهما. وطوله بين \`ABCBDAB\` و\`BDCABA\` يساوي 4، ومن أمثلته \`BCBA\`.

الـ LCS هو قلب مقارنة المتتاليات. فأداة \`diff\` المعتمدة على الأسطر تُظهر الأسطر التي تُحذف والتي تُدرج، والأسطر التي تُبقيها هي أطول تتابع جزئي مشترك بين أسطر الملفين (وخوارزمية diff الافتراضية في Git هي خوارزمية Myers المنشورة عام 1986). والفكرة نفسها تُستخدم لمحاذاة تسلسلات الحمض النووي (DNA).

**الوصفة:**

1. **الحالة:** \`dp[i][j]\` = طول الـ LCS بين أول \`i\` محرفاً من \`X\` وأول \`j\` محرفاً من \`Y\`.
2. **الانتقال:** إن كان \`X[i-1] == Y[j-1]\` فيمكن لهذا المحرف أن يُنهي التتابع المشترك: \`dp[i][j] = dp[i-1][j-1] + 1\`. وإلا فأحد المحرفين الأخيرين غير مستخدم: \`dp[i][j] = max(dp[i-1][j], dp[i][j-1])\`.
3. **الحالات الأساسية:** \`dp[0][j] = dp[i][0] = 0\` (النص الفارغ لا يشترك في شيء).
4. **الترتيب:** صفاً بعد صف، من اليسار إلى اليمين.
5. **الجواب:** \`dp[n][m]\`.

\`\`\`
X = ACE, Y = ABCDE

         ""  A  B  C  D  E
    ""    0  0  0  0  0  0
    A     0  1  1  1  1  1      A = A: diagonal + 1
    C     0  1  1  2  2  2      C = C: dp[A][B] + 1 = 2
    E     0  1  1  2  2  3      E = E: dp[C][D] + 1 = 3  -> LCS length 3
\`\`\`

الزمن والذاكرة **O(n × m)**. وإن كنت تحتاج إلى الطول فقط فكل صف يعتمد على الصف السابق وحده، فيكفيك صفّان (ذاكرة O(m)). ولطباعة التتابع نفسه احتفظ بالجدول كاملاً وامشِ عائداً من \`dp[n][m]\`: قطرياً عند التطابق، وإلا نحو الجار الأكبر.`,
    },
  },
  {
    type: "lab",
    id: "lcs-length",
    lang: "java",
    prompt: {
      en: `**Longest common subsequence.** Read two strings and print the length of their longest common subsequence.

**Input:** two lines, each a string of 0 to 2,000 letters (a line can be empty).

**Output:** one integer, the LCS length.

**Example:** input
\`\`\`
ABCBDAB
BDCABA
\`\`\`
prints \`4\` (for example \`BCBA\`).

Fill the table \`dp[i][j]\` from the lesson: \`dp[i-1][j-1] + 1\` when the characters match, otherwise \`Math.max(dp[i-1][j], dp[i][j-1])\`. Row 0 and column 0 stay 0. With 2,000 x 2,000 cells the O(n x m) table takes a fraction of a second; a plain recursion without a table would never finish.`,
      ar: `**أطول تتابع جزئي مشترك.** اقرأ نصّين واطبع طول أطول تتابع جزئي مشترك بينهما.

**المدخل:** سطران، في كل منهما نص من 0 إلى 2,000 حرف (وقد يكون السطر فارغاً).

**المخرج:** عدد صحيح واحد، هو طول الـ LCS.

**مثال:** المدخل
\`\`\`
ABCBDAB
BDCABA
\`\`\`
يطبع \`4\` (ومن أمثلته \`BCBA\`).

املأ الجدول \`dp[i][j]\` كما في الدرس: \`dp[i-1][j-1] + 1\` حين يتطابق المحرفان، وإلا \`Math.max(dp[i-1][j], dp[i][j-1])\`. ويبقى الصف 0 والعمود 0 أصفاراً. ومع 2,000 × 2,000 خلية يستغرق جدول O(n × m) جزءاً من الثانية؛ أما التكرار الذاتي البسيط بلا جدول فلن ينتهي أبداً.`,
    },
    starterCode: `import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String a = in.readLine();
        String b = in.readLine();
        a = (a == null) ? "" : a.trim();
        b = (b == null) ? "" : b.trim();
        int n = a.length(), m = b.length();

        // TODO: dp[i][j] = LCS length of a[0..i) and b[0..j).
        // int[][] dp = new int[n + 1][m + 1];   (row 0 and column 0 stay 0)
        // for i in 1..n, for j in 1..m:
        //   characters a.charAt(i - 1) and b.charAt(j - 1) equal -> dp[i - 1][j - 1] + 1
        //   otherwise                                         -> Math.max(dp[i - 1][j], dp[i][j - 1])
        int answer = 0;
        System.out.println(answer);
    }
}
`,
    solution: `import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String a = in.readLine();
        String b = in.readLine();
        a = (a == null) ? "" : a.trim();
        b = (b == null) ? "" : b.trim();
        int n = a.length(), m = b.length();

        int[][] dp = new int[n + 1][m + 1]; // dp[i][j] = LCS of a[0..i) and b[0..j)
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;                 // extend the diagonal
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); // drop one last character
                }
            }
        }
        System.out.println(dp[n][m]);
    }
}
`,
    hints: [
      { en: "Create int[][] dp = new int[n + 1][m + 1]. Java fills it with zeros, which are exactly the base cases for row 0 and column 0.", ar: "أنشئ int[][] dp = new int[n + 1][m + 1]. تملؤها Java بالأصفار، وهي بالضبط الحالات الأساسية للصف 0 والعمود 0." },
      { en: "Loop i from 1 to n and j from 1 to m. Compare a.charAt(i - 1) with b.charAt(j - 1): the table is shifted by one because row 0 means 'no characters yet'.", ar: "كرّر i من 1 إلى n وj من 1 إلى m. وقارن a.charAt(i - 1) بـ b.charAt(j - 1): فالجدول مُزاح بواحد لأن الصف 0 يعني 'لا محارف بعد'." },
      { en: "On a match dp[i][j] = dp[i - 1][j - 1] + 1, otherwise Math.max(dp[i - 1][j], dp[i][j - 1]). Print dp[n][m].", ar: "عند التطابق dp[i][j] = dp[i - 1][j - 1] + 1، وإلا Math.max(dp[i - 1][j], dp[i][j - 1]). ثم اطبع dp[n][m]." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "ABCBDAB\nBDCABA\n", expected: "4" },
      { name: { en: "A subsequence of the other string", ar: "تتابع جزئي من النص الآخر" }, stdin: "ACE\nABCDE\n", expected: "3" },
      { name: { en: "Nothing in common", ar: "لا شيء مشترك" }, stdin: "abc\nxyz\n", expected: "0" },
      { name: { en: "One empty line", ar: "سطر فارغ" }, stdin: "\nabc\n", expected: "0" },
      { name: { en: "Identical strings", ar: "نصّان متطابقان" }, stdin: "dynamic\ndynamic\n", expected: "7" },
      { name: { en: "Two strings of 2,000 letters", ar: "نصّان من 2,000 حرف" }, stdin: `${lcsA}\n${lcsB}\n`, expected: lcsExpected },
    ],
    sampleInput: "ABCBDAB\nBDCABA\n",
  },
  {
    type: "text",
    body: {
      en: `## The 0/1 knapsack

A hiker can carry at most \`W\` kilograms. There are \`n\` items, each with a weight and a value, and each item can be taken **at most once** (that is the "0/1"). Which items give the largest total value?

**Greedy by value per kilogram fails.** Items (weight 1, value 6), (2, 10) and (3, 12) with \`W = 5\`: the best ratios are 6 and 5, so greedy takes the first two for 16 and has no room for the third. Taking (2, 10) and (3, 12) gives **22**.

**The recipe:**

1. **State:** \`dp[i][c]\` = best value using only the first \`i\` items with capacity \`c\`.
2. **Transition:** skip item \`i\`, or take it if it fits: \`dp[i][c] = max(dp[i-1][c], dp[i-1][c - w] + v)\`.
3. **Base cases:** \`dp[0][c] = 0\` (no items, no value).
4. **Order:** item by item.
5. **Answer:** \`dp[n][W]\`.

\`\`\`
items (w, v): (1, 6)  (2, 10)  (3, 12)        W = 5

capacity c        0   1   2   3   4   5
no items          0   0   0   0   0   0
+ (1, 6)          0   6   6   6   6   6
+ (2, 10)         0   6  10  16  16  16
+ (3, 12)         0   6  10  16  18  22      dp[5] = max(16, dp_prev[2] + 12) = 22
\`\`\`

**One row is enough** if you update capacities from **high to low**:

\`\`\`python
dp = [0] * (W + 1)
for w, v in items:
    for c in range(W, w - 1, -1):        # downwards: dp[c - w] still means "without this item"
        dp[c] = max(dp[c], dp[c - w] + v)
\`\`\`

Going **upwards** would let \`dp[c - w]\` already include the same item, so it could be taken again and again: that is the *unbounded* knapsack, the same loop shape as coin change. The direction of one loop decides which problem you solve.

**O(n x W) is called pseudo-polynomial**: it grows with the numeric value of \`W\`, not with the number of digits needed to write it. The knapsack problem is NP-hard in general, so no algorithm is known that is polynomial in \`n\` and the size of the numbers; DP works well when \`W\` is moderate.`,
      ar: `## حقيبة الظهر 0/1 (knapsack)

يستطيع متنزّه أن يحمل \`W\` كيلوغراماً على الأكثر. وأمامه \`n\` غرضاً، لكل منها وزن وقيمة، ويمكن أخذ كل غرض **مرة واحدة على الأكثر** (وهذا معنى "0/1"). أي الأغراض تعطي أكبر قيمة إجمالية؟

**الجشع حسب القيمة لكل كيلوغرام يفشل.** الأغراض (الوزن 1، القيمة 6) و(2، 10) و(3، 12) مع \`W = 5\`: أفضل النسب 6 و5، فيأخذ الجشع الغرضين الأولين بقيمة 16 ولا يبقى مكان للثالث. أما أخذ (2، 10) و(3، 12) فيعطي **22**.

**الوصفة:**

1. **الحالة:** \`dp[i][c]\` = أفضل قيمة باستخدام أول \`i\` غرضاً فقط مع سعة \`c\`.
2. **الانتقال:** تخطَّ الغرض \`i\`، أو خذه إن اتسع: \`dp[i][c] = max(dp[i-1][c], dp[i-1][c - w] + v)\`.
3. **الحالات الأساسية:** \`dp[0][c] = 0\` (لا أغراض، لا قيمة).
4. **الترتيب:** غرضاً بعد غرض.
5. **الجواب:** \`dp[n][W]\`.

\`\`\`
items (w, v): (1, 6)  (2, 10)  (3, 12)        W = 5

capacity c        0   1   2   3   4   5
no items          0   0   0   0   0   0
+ (1, 6)          0   6   6   6   6   6
+ (2, 10)         0   6  10  16  16  16
+ (3, 12)         0   6  10  16  18  22      dp[5] = max(16, dp_prev[2] + 12) = 22
\`\`\`

**يكفي صف واحد** إن حدّثت السعات من **الأعلى إلى الأدنى**:

\`\`\`python
dp = [0] * (W + 1)
for w, v in items:
    for c in range(W, w - 1, -1):        # نزولاً: ما زالت dp[c - w] تعني "بدون هذا الغرض"
        dp[c] = max(dp[c], dp[c - w] + v)
\`\`\`

أما السير **صعوداً** فسيجعل \`dp[c - w]\` تتضمن الغرض نفسه مسبقاً، فيمكن أخذه مرة بعد مرة: وهذه حقيبة الظهر *غير المحدودة (unbounded)*، بشكل الحلقة نفسه في صرف النقود. فاتجاه حلقة واحدة يحدّد أي مسألة تحلّ.

**الزمن O(n × W) يُسمّى شبه متعدد الحدود (pseudo-polynomial)**: فهو ينمو مع القيمة العددية لـ \`W\`، لا مع عدد الخانات اللازمة لكتابتها. ومسألة حقيبة الظهر NP-hard عموماً، فلا تُعرف خوارزمية متعددة الحدود في \`n\` وفي حجم الأعداد؛ والبرمجة الديناميكية تعمل جيداً حين تكون \`W\` معتدلة.`,
    },
  },
  {
    type: "lab",
    id: "knapsack-01",
    lang: "rust",
    prompt: {
      en: `**Pack the knapsack.** Each item can be taken at most once. Find the largest total value whose total weight is at most \`W\`.

**Input:** the first line has \`n W\` (\`n\` up to 300, \`W\` up to 20,000). Then \`n\` lines, each \`w v\`: a weight of at least 1 and a value up to 10⁹.

**Output:** the maximum total value. Values can add up beyond 2³², so use \`u64\`.

**Example:** input
\`\`\`
3 5
1 6
2 10
3 12
\`\`\`
prints \`22\` (the items of weight 2 and 3).

Use the one-row DP from the lesson: \`let mut dp = vec![0u64; cap + 1];\` and, for each item, loop \`for c in (w..=cap).rev()\` (downwards!) with \`dp[c] = max(dp[c], dp[c - w] + v)\`.`,
      ar: `**عبّئ حقيبة الظهر.** يمكن أخذ كل غرض مرة واحدة على الأكثر. أوجد أكبر قيمة إجمالية لا يتجاوز وزنها الإجمالي \`W\`.

**المدخل:** السطر الأول فيه \`n W\` (و\`n\` حتى 300، و\`W\` حتى 20,000). ثم \`n\` سطراً، في كل منها \`w v\`: وزن لا يقل عن 1 وقيمة حتى 10⁹.

**المخرج:** أكبر قيمة إجمالية. قد يتجاوز مجموع القيم 2³²، فاستخدم \`u64\`.

**مثال:** المدخل
\`\`\`
3 5
1 6
2 10
3 12
\`\`\`
يطبع \`22\` (الغرضان ذوا الوزنين 2 و3).

استخدم البرمجة الديناميكية بصف واحد كما في الدرس: \`let mut dp = vec![0u64; cap + 1];\` ولكل غرض كرّر \`for c in (w..=cap).rev()\` (نزولاً!) مع \`dp[c] = max(dp[c], dp[c - w] + v)\`.`,
    },
    starterCode: `use std::io::Read;

fn main() {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input).unwrap();
    let mut it = input.split_whitespace().map(|t| t.parse::<u64>().unwrap());
    let n = it.next().unwrap() as usize;
    let cap = it.next().unwrap() as usize;
    let mut items: Vec<(usize, u64)> = Vec::with_capacity(n);
    for _ in 0..n {
        let w = it.next().unwrap() as usize;
        let v = it.next().unwrap();
        items.push((w, v));
    }

    // dp[c] = best value with capacity c using the items processed so far.
    let dp = vec![0u64; cap + 1];
    // TODO: make dp mutable and fill it, one item at a time:
    // for each item (w, v) in items with w <= cap:
    //     for c in (w..=cap).rev()            downwards, so every item is used at most once
    //         dp[c] = max(dp[c], dp[c - w] + v)
    println!("{}", dp[cap]);
}
`,
    solution: `use std::io::Read;

fn main() {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input).unwrap();
    let mut it = input.split_whitespace().map(|t| t.parse::<u64>().unwrap());
    let n = it.next().unwrap() as usize;
    let cap = it.next().unwrap() as usize;
    let mut items: Vec<(usize, u64)> = Vec::with_capacity(n);
    for _ in 0..n {
        let w = it.next().unwrap() as usize;
        let v = it.next().unwrap();
        items.push((w, v));
    }

    let mut dp = vec![0u64; cap + 1]; // dp[c] = best value with capacity c, items so far
    for &(w, v) in &items {
        if w > cap {
            continue; // this item never fits
        }
        for c in (w..=cap).rev() {
            // downwards: dp[c - w] does not include this item yet
            let take = dp[c - w] + v;
            if take > dp[c] {
                dp[c] = take;
            }
        }
    }
    println!("{}", dp[cap]);
}
`,
    hints: [
      { en: "Start with let mut dp = vec![0u64; cap + 1]; dp[c] is the best value for capacity c using the items processed so far.", ar: "ابدأ بـ let mut dp = vec![0u64; cap + 1]; و dp[c] هي أفضل قيمة للسعة c باستخدام الأغراض التي عولجت حتى الآن." },
      { en: "For each &(w, v) in &items, skip it if w > cap. Otherwise loop for c in (w..=cap).rev() and keep the larger of dp[c] and dp[c - w] + v.", ar: "لكل &(w, v) في &items تخطَّه إن كان w > cap. وإلا فكرّر for c in (w..=cap).rev() واحتفظ بالأكبر من dp[c] و dp[c - w] + v." },
      { en: "The loop must go downwards: going upwards takes the same item several times (the test 'each item at most once' catches that). Print dp[cap] alone.", ar: "يجب أن تسير الحلقة نزولاً: فالسير صعوداً يأخذ الغرض نفسه عدة مرات (والاختبار 'كل غرض مرة واحدة على الأكثر' يكشف ذلك). واطبع dp[cap] وحدها." },
    ],
    tests: [
      { name: { en: "The example: greedy says 16", ar: "المثال: الجشع يقول 16" }, stdin: "3 5\n1 6\n2 10\n3 12\n", expected: "22" },
      { name: { en: "Nothing fits", ar: "لا شيء يتسع" }, stdin: "2 3\n4 100\n5 200\n", expected: "0" },
      { name: { en: "Each item at most once", ar: "كل غرض مرة واحدة على الأكثر" }, stdin: "1 10\n3 5\n", expected: "5" },
      { name: { en: "No items", ar: "لا أغراض" }, stdin: "0 10\n", expected: "0" },
      { name: { en: "A total beyond 32 bits", ar: "مجموع يتجاوز 32 بت" }, stdin: "5 5\n1 1000000000\n1 1000000000\n1 1000000000\n1 1000000000\n1 1000000000\n", expected: "5000000000" },
      { name: { en: "240 items, capacity 1,001", ar: "240 غرضاً، والسعة 1,001" }, stdin: knapInput, expected: knapExpected },
    ],
    sampleInput: "3 5\n1 6\n2 10\n3 12\n",
  },
  {
    type: "quiz",
    questions: [
      {
        q: {
          en: "What happens when a recursive function has no base case that can be reached?",
          ar: "ماذا يحدث حين لا تملك دالة ذاتية الاستدعاء حالة أساسية يمكن بلوغها؟",
        },
        choices: [
          { en: "It returns 0 after a while", ar: "تعيد 0 بعد قليل" },
          { en: "It keeps calling itself until the call stack overflows (Python raises RecursionError)", ar: "تواصل استدعاء نفسها حتى يفيض مكدّس الاستدعاءات (وPython ترفع RecursionError)" },
          { en: "The language turns it into a loop that uses constant memory", ar: "تحوّلها اللغة إلى حلقة تستخدم ذاكرة ثابتة" },
          { en: "Nothing: the base case is optional", ar: "لا شيء: الحالة الأساسية اختيارية" },
        ],
        answer: 1,
        explain: {
          en: "Every call pushes a frame, and without a base case no call ever returns, so frames pile up until the limit: RecursionError in Python, a crash in C or Rust. Python does not convert recursion into loops, and the base case is what makes recursion finish.",
          ar: "كل استدعاء يدفع إطاراً، وبدون حالة أساسية لا يعود أي استدعاء، فتتراكم الإطارات حتى الحد: RecursionError في Python، وانهيار في C أو Rust. وPython لا تحوّل التكرار الذاتي إلى حلقات، والحالة الأساسية هي ما يجعل التكرار الذاتي ينتهي.",
        },
      },
      {
        q: {
          en: "Why is the naive recursive fib(n) so slow?",
          ar: "لماذا تكون fib(n) ذاتية الاستدعاء الساذجة بطيئة إلى هذا الحد؟",
        },
        choices: [
          { en: "It solves the same subproblems again and again, so the number of calls grows exponentially", ar: "تحلّ المسائل الفرعية نفسها مرة بعد مرة، فينمو عدد الاستدعاءات أسّياً" },
          { en: "Adding big integers is slow in Python", ar: "جمع الأعداد الكبيرة بطيء في Python" },
          { en: "Recursion is always slower than a loop by a constant factor", ar: "التكرار الذاتي أبطأ دائماً من الحلقة بمعامل ثابت" },
          { en: "Its base cases are wrong", ar: "حالاتها الأساسية خاطئة" },
        ],
        answer: 0,
        explain: {
          en: "fib(30) makes 2,692,537 calls because fib(28), fib(27) and so on are recomputed in every branch. With a cache each value is computed once, so only 31 calls are needed. A constant factor or slow additions cannot explain an exponential blow-up, and the base cases are fine.",
          ar: "تُجري fib(30) عدد 2,692,537 استدعاءً لأن fib(28) وfib(27) وغيرهما تُعاد حسابها في كل فرع. ومع ذاكرة مخبئية تُحسب كل قيمة مرة واحدة، فلا يلزم إلا 31 استدعاءً. والمعامل الثابت أو بطء الجمع لا يفسّران انفجاراً أسّياً، والحالات الأساسية سليمة.",
        },
      },
      {
        q: {
          en: "Coins 1, 3 and 4, amount 6. How many coins does greedy (largest coin first) use, and how many are needed?",
          ar: "القطع 1 و3 و4، والمبلغ 6. كم قطعة يستخدم الجشع (أكبر قطعة أولاً)، وكم قطعة تلزم فعلاً؟",
        },
        choices: [
          { en: "Both use 2 coins", ar: "كلاهما يستخدم قطعتين" },
          { en: "Greedy 2, optimal 3", ar: "الجشع 2، والأمثل 3" },
          { en: "Greedy 3 (4 + 1 + 1), optimal 2 (3 + 3)", ar: "الجشع 3 (4 + 1 + 1)، والأمثل 2 (3 + 3)" },
          { en: "Both use 3 coins", ar: "كلاهما يستخدم 3 قطع" },
        ],
        answer: 2,
        explain: {
          en: "Greedy grabs the 4 and is left with 2, which only 1 + 1 can pay. DP tries every possible last coin: dp[6] = 1 + min(dp[5], dp[3], dp[2]) = 1 + dp[3] = 2. An optimal answer can never use more coins than greedy, so 'greedy 2, optimal 3' is impossible.",
          ar: "يأخذ الجشع القطعة 4 فيبقى 2، ولا يدفعها إلا 1 + 1. أما البرمجة الديناميكية فتجرّب كل قطعة أخيرة ممكنة: dp[6] = 1 + min(dp[5], dp[3], dp[2]) = 1 + dp[3] = 2. والجواب الأمثل لا يمكن أن يستخدم قطعاً أكثر من الجشع، فخيار 'الجشع 2 والأمثل 3' مستحيل.",
        },
      },
      {
        q: {
          en: "In the one-row 0/1 knapsack, why does the capacity loop run from W down to w?",
          ar: "في حقيبة الظهر 0/1 بصف واحد، لماذا تسير حلقة السعة من W نزولاً إلى w؟",
        },
        choices: [
          { en: "Going down is faster on modern CPUs", ar: "السير نزولاً أسرع في المعالجات الحديثة" },
          { en: "It avoids negative indexes", ar: "يتجنّب الفهارس السالبة" },
          { en: "The answer is stored in dp[0]", ar: "الجواب مخزّن في dp[0]" },
          { en: "dp[c - w] is then still the value without this item, so each item is used at most once", ar: "لأن dp[c - w] تبقى حينها قيمةً بدون هذا الغرض، فيُستخدم كل غرض مرة واحدة على الأكثر" },
        ],
        answer: 3,
        explain: {
          en: "Updating from high to low capacities reads entries that this item has not touched yet, which is the previous row of the 2D table. Going upwards reads entries that may already contain the item, so it can be taken repeatedly: the unbounded knapsack. Both directions stay at c >= w (the downward loop ends at w, the upward one starts there), so neither creates negative indexes, and the answer is dp[W].",
          ar: "التحديث من السعات العليا إلى الدنيا يقرأ مدخلات لم يلمسها هذا الغرض بعد، وهي الصف السابق في الجدول ثنائي الأبعاد. أما السير صعوداً فيقرأ مدخلات قد تحتوي الغرض مسبقاً، فيمكن أخذه مراراً: حقيبة الظهر غير المحدودة. وكلا الاتجاهين يتوقف عند c = w فلا ينشأ فهرس سالب، والجواب هو dp[W].",
        },
      },
      {
        q: {
          en: "For the LCS table, what is dp[i][j] when X[i-1] and Y[j-1] are different?",
          ar: "في جدول LCS، كم تساوي dp[i][j] حين يختلف X[i-1] عن Y[j-1]؟",
        },
        choices: [
          { en: "max(dp[i-1][j], dp[i][j-1])", ar: "max(dp[i-1][j], dp[i][j-1])" },
          { en: "dp[i-1][j-1] + 1", ar: "dp[i-1][j-1] + 1" },
          { en: "0, because the strings stop matching", ar: "0، لأن النصّين توقّفا عن التطابق" },
          { en: "dp[i-1][j] + dp[i][j-1]", ar: "dp[i-1][j] + dp[i][j-1]" },
        ],
        answer: 0,
        explain: {
          en: "If the last characters differ, at least one of them is not part of a longest common subsequence, so the answer is the better of dropping X's last character or Y's. The diagonal + 1 is for a match. Resetting to 0 would confuse subsequences with substrings, and adding the two neighbours counts shared characters twice.",
          ar: "إن اختلف المحرفان الأخيران فأحدهما على الأقل ليس جزءاً من أطول تتابع جزئي مشترك، فيكون الجواب الأفضلَ بين حذف آخر محرف من X أو من Y. أما القطر + 1 فهو للتطابق. والعودة إلى 0 تخلط بين التتابع الجزئي والنص الجزئي، وجمع الجارين يعدّ المحارف المشتركة مرتين.",
        },
      },
    ],
  },
  {
    type: "text",
    body: {
      en: `## Summary

- **Recursion** = a base case + a recursive case on a smaller input. Each call is a frame on the **call stack**; without a reachable base case the stack overflows. Halving the problem (fast power, merge sort) gives logarithmic depth.
- Naive recursion explodes when it re-solves **overlapping subproblems** (\`fib(30)\` makes 2,692,537 calls). **Memoization** caches answers top-down; **tabulation** fills a table bottom-up. Time = number of states x work per state.
- The DP recipe: **state, transition, base cases, order, answer**. Say what \`dp[...]\` means in one sentence before writing any loop.
- **Coin change:** \`dp[a] = 1 + min(dp[a - c])\`; greedy can be wrong. Coin loop outside counts combinations.
- **LCS:** \`dp[i][j]\` grows along the diagonal on a match, otherwise takes the larger neighbour; O(n x m), two rows for the length alone.
- **0/1 knapsack:** \`dp[c] = max(dp[c], dp[c - w] + v)\` with capacities **downwards**; upwards is the unbounded version.

**Practice next:** compute the edit distance between two words (insert, delete, replace), find the longest increasing subsequence, and count the paths through a grid with obstacles. Then continue with **Heaps & Priority Queues**.`,
      ar: `## الخلاصة

- **التكرار الذاتي** = حالة أساسية + حالة استدعاء ذاتي على مدخل أصغر. كل استدعاء إطار في **مكدّس الاستدعاءات**؛ وبدون حالة أساسية يمكن بلوغها يفيض المكدّس. وتنصيف المسألة (القوة السريعة، وmerge sort) يعطي عمقاً لوغاريتمياً.
- ينفجر التكرار الذاتي الساذج حين يعيد حلّ **المسائل الفرعية المتداخلة** (تُجري \`fib(30)\` عدد 2,692,537 استدعاءً). **الحفظ المؤقت** يخزّن الأجوبة من الأعلى إلى الأسفل؛ و**الجدولة** تملأ جدولاً من الأسفل إلى الأعلى. الزمن = عدد الحالات × العمل لكل حالة.
- وصفة البرمجة الديناميكية: **الحالة، والانتقال، والحالات الأساسية، والترتيب، والجواب**. قل ماذا تعني \`dp[...]\` في جملة واحدة قبل أن تكتب أي حلقة.
- **صرف النقود:** \`dp[a] = 1 + min(dp[a - c])\`؛ وقد يخطئ الجشع. وحلقة القطع في الخارج تعدّ التركيبات.
- **LCS:** تزيد \`dp[i][j]\` على امتداد القطر عند التطابق، وإلا تأخذ الجار الأكبر؛ الزمن O(n × m)، ويكفي صفّان للطول وحده.
- **حقيبة الظهر 0/1:** \`dp[c] = max(dp[c], dp[c - w] + v)\` مع السعات **نزولاً**؛ والسير صعوداً هو النسخة غير المحدودة.

**تدرّب بعد ذلك:** احسب مسافة التحرير (edit distance) بين كلمتين (إدراج، حذف، استبدال)، وأوجد أطول تتابع جزئي متزايد، وعُدّ المسارات عبر شبكة فيها عوائق. ثم تابع إلى **الكومات وطوابير الأولوية (Heaps & Priority Queues)**.`,
    },
  },
];

export const lesson: Lesson = {
  nodeId: "recursion-dp",
  title: { en: "Recursion & Dynamic Programming: Solve It Once, Remember It", ar: "التكرار الذاتي والبرمجة الديناميكية: حُلَّها مرة وتذكّرها" },
  estMinutes: estimateMinutes(sections),
  sections,
};
