import type { Lesson, LessonSection } from "../types";
import { estimateMinutes } from "./estimate";

// A long input for the max-subarray lab: 5 000 small numbers, generated so the file stays small.
const streakInput = (() => {
  const nums = Array.from({ length: 5000 }, (_, i) => ((i * 37) % 101) - 50);
  return `${nums.length}\n${nums.join(" ")}\n`;
})();

const sections: LessonSection[] = [
  {
    type: "text",
    body: {
      en: `## What you'll learn

- Why we judge an algorithm by how its work **grows**, not by seconds on your laptop
- How to **count steps** and write the result in **Big-O** notation
- The common growth classes: \`O(1)\`, \`O(log n)\`, \`O(n)\`, \`O(n log n)\`, \`O(n²)\`, \`O(2ⁿ)\`
- How to read the complexity straight off a loop, and how to spot **hidden costs**
- You will feel it: a slow idea that times out on a big input, and the fast idea that passes instantly`,
      ar: `## ماذا ستتعلم

- لماذا نحكم على الخوارزمية بمدى **نموّ** عملها مع حجم المدخلات، لا بعدد الثواني على حاسوبك
- كيف **تعدّ الخطوات** وتكتب النتيجة بترميز **Big-O**
- فئات النموّ الشائعة: \`O(1)\` و\`O(log n)\` و\`O(n)\` و\`O(n log n)\` و\`O(n²)\` و\`O(2ⁿ)\`
- كيف تقرأ التعقيد مباشرة من الحلقات، وكيف تكتشف **التكاليف الخفية**
- ستختبر الفرق بنفسك: فكرة بطيئة تتجاوز المهلة على مدخلات كبيرة، وفكرة سريعة تنجح فوراً`,
    },
  },
  {
    type: "text",
    body: {
      en: `## The phone book problem 📖

Imagine a paper phone book with **1,000,000** names and you want to find "Omar".

- **Method A:** start at page one and check every name until you find him. In the worst case that is 1,000,000 checks.
- **Method B:** open the book in the middle. "Omar" comes after the name you see? Throw away the first half. Repeat on what is left. This needs only about **20** checks.

Now the city doubles to 2,000,000 names. Method A needs up to 2,000,000 checks. Method B needs **one more** check (21).

That is the whole idea of complexity: not "how fast is it today?" but **"what happens to the work when the problem gets bigger?"** Computers get faster every year, but a better algorithm beats a faster machine as soon as the input is large enough.

Big-O is the shorthand we use to talk about it. Method A is **O(n)** (work grows in step with the number of names). Method B is **O(log n)** (work grows only by one step each time the input doubles).`,
      ar: `## مشكلة دليل الهاتف 📖

تخيّل دليل هاتف ورقياً فيه **1,000,000** اسم، وتريد العثور على "Omar".

- **الطريقة A:** تبدأ من الصفحة الأولى وتفحص كل اسم حتى تجده. في أسوأ الحالات هذا يعني 1,000,000 فحص.
- **الطريقة B:** تفتح الدليل من المنتصف. إن كان "Omar" يأتي بعد الاسم الذي تراه فتتجاهل النصف الأول كله، ثم تكرّر على ما تبقى. يكفيك نحو **20** فحصاً فقط.

الآن تتضاعف المدينة فتصبح 2,000,000 اسم. الطريقة A تحتاج حتى 2,000,000 فحص، أما الطريقة B فتحتاج فحصاً **واحداً إضافياً** فقط (21).

هذه هي فكرة التعقيد كلها: ليس "ما مدى سرعتها اليوم؟" بل **"ماذا يحدث للعمل حين تكبر المسألة؟"**. الحواسيب تزداد سرعة كل عام، لكن الخوارزمية الأفضل تتفوق على الجهاز الأسرع بمجرد أن تكبر المدخلات بما يكفي.

و**Big-O** هو الاختصار الذي نتحدث به عن ذلك. الطريقة A من الرتبة **O(n)** (العمل ينمو بنمو عدد الأسماء)، والطريقة B من الرتبة **O(log n)** (العمل يزيد خطوة واحدة فقط كلما تضاعف حجم المدخلات).`,
    },
  },
  {
    type: "text",
    body: {
      en: `## Big-O in one page

We count **steps** (a comparison, an addition, an array read) as a function of the input size **n**. Then we keep only the term that grows fastest and throw away constant multipliers:

\`\`\`
3n² + 50n + 7   →   O(n²)
\`\`\`

Why throw things away? For big n the \`n²\` term dwarfs everything else, and the constant (3) depends on the machine and the language, not on the idea. Big-O compares **ideas**, not computers.

Big-O is an **upper bound on growth**. Unless we say otherwise we quote the **worst case**: the item is last, or missing.

**The ladder, from best to worst:**

- **O(1) constant:** read \`a[5]\`, push onto a stack, look up a key in a hash map (on average)
- **O(log n) logarithmic:** halve the problem each step, like the phone book (binary search)
- **O(n) linear:** one pass over the data (sum, maximum, linear search)
- **O(n log n):** efficient sorting (merge sort, the built-in sort)
- **O(n²) quadratic:** every pair of items, usually two nested loops
- **O(2ⁿ) exponential:** try every subset of n items. Hopeless beyond n of about 40

**Feel the scale** with n = 1,000,000:

- \`O(log n)\` is about **20** steps
- \`O(n)\` is **1 million** steps
- \`O(n log n)\` is about **20 million** steps
- \`O(n²)\` is **1,000,000,000,000** steps: hours of computing

A rule of thumb: a compiled language does roughly 10⁸ simple operations per second, and Python tens of millions. So you can afford about n = 10⁶ for \`O(n log n)\` but only n of a few thousand for \`O(n²)\` if you want the answer in a second or two.`,
      ar: `## Big-O في صفحة واحدة

نعدّ **الخطوات** (مقارنة، جمع، قراءة عنصر من مصفوفة) كدالة في حجم المدخلات **n**. ثم نُبقي على الحدّ الأسرع نمواً فقط ونتخلص من المعاملات الثابتة:

\`\`\`
3n² + 50n + 7   →   O(n²)
\`\`\`

لماذا نتخلص منها؟ لأن الحدّ \`n²\` يطغى على كل ما عداه حين تكبر n، ولأن الثابت (3) يعتمد على الجهاز واللغة لا على الفكرة. Big-O يقارن **الأفكار** لا الحواسيب.

و Big-O هو **حدّ أعلى للنموّ**. وما لم نقل غير ذلك فإننا نذكر **أسوأ حالة**: العنصر في آخر القائمة، أو غير موجود.

**السلّم من الأفضل إلى الأسوأ:**

- **O(1) ثابت:** قراءة \`a[5]\`، الإضافة إلى مكدّس، البحث عن مفتاح في hash map (في المتوسط)
- **O(log n) لوغاريتمي:** تنصّف المسألة في كل خطوة كما في دليل الهاتف (binary search)
- **O(n) خطي:** مرور واحد على البيانات (المجموع، القيمة العظمى، البحث الخطي)
- **O(n log n):** الفرز الكفؤ (merge sort ودالة الفرز المدمجة)
- **O(n²) تربيعي:** كل زوج من العناصر، وغالباً حلقتان متداخلتان
- **O(2ⁿ) أسّي:** تجربة كل المجموعات الجزئية من n عنصراً. ميؤوس منه حين تتجاوز n نحو 40

**لتتخيّل الحجم** حين n = 1,000,000:

- \`O(log n)\` تعني نحو **20** خطوة
- \`O(n)\` تعني **مليون** خطوة
- \`O(n log n)\` تعني نحو **20 مليون** خطوة
- \`O(n²)\` تعني **1,000,000,000,000** خطوة: ساعات من الحساب

قاعدة تقريبية: اللغات المُصرَّفة تنفّذ نحو 10⁸ عملية بسيطة في الثانية، وPython عشرات الملايين. لذا يمكنك تحمّل n بحدود 10⁶ مع \`O(n log n)\`، لكن بضعة آلاف فقط مع \`O(n²)\` إن أردت الجواب خلال ثانية أو ثانيتين.`,
    },
  },
  {
    type: "code-demo",
    lang: "python",
    code: `def linear_search_steps(a, target):
    steps = 0
    for x in a:
        steps += 1
        if x == target:
            break
    return steps


def binary_search_steps(a, target):
    lo, hi, steps = 0, len(a) - 1, 0
    while lo <= hi:
        steps += 1
        mid = (lo + hi) // 2
        if a[mid] == target:
            break
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return steps


for n in (10, 1_000, 1_000_000):
    a = list(range(n))   # already sorted
    target = n - 1       # the last item: a worst case for the linear search
    print(n, "items ->", linear_search_steps(a, target), "linear steps,", binary_search_steps(a, target), "binary steps")
`,
    explanation: {
      en: "Both functions find the last item, but one counts every item and the other halves the search range each time. Multiply the list size by 1,000 and watch which counter grows. Try n = 10_000_000 as well.",
      ar: "الدالتان تجدان العنصر الأخير، لكن إحداهما تمرّ على كل العناصر والأخرى تنصّف مجال البحث في كل مرة. اضرب حجم القائمة في 1,000 وراقب أي عدّاد ينمو. جرّب أيضاً n = 10_000_000.",
    },
  },
  {
    type: "text",
    body: {
      en: `## Reading complexity off the code

You rarely need math. Look at the loops.

**One loop over the data is O(n):**

\`\`\`python
def total(a):
    s = 0
    for x in a:        # runs n times
        s += x         # 1 step each
    return s
\`\`\`

**A loop inside a loop multiplies, O(n²):**

\`\`\`python
def has_pair_sum(a, target):
    for i in range(len(a)):                # n times
        for j in range(i + 1, len(a)):     # up to n times
            if a[i] + a[j] == target:
                return True
    return False
\`\`\`

The inner loop runs \`(n-1) + (n-2) + ... + 1 + 0\` times, which is \`n(n-1)/2\`. Drop the constant and the smaller term: **O(n²)**.

**A loop that halves (or doubles) its variable is O(log n):**

\`\`\`python
def halvings(n):
    steps = 0
    while n > 1:
        n //= 2        # 1,000,000 -> 500,000 -> 250,000 -> ... -> 1
        steps += 1
    return steps
\`\`\`

**Four rules that cover most code:**

1. **Blocks one after another add**, and the biggest wins: \`O(n) + O(n²)\` is \`O(n²)\`.
2. **Nested blocks multiply:** a loop of n running an O(m) step is \`O(n·m)\`.
3. **Different inputs get different letters.** Looping over list \`a\` and then list \`b\` is \`O(a + b)\`, not \`O(n)\`.
4. **Check what each line costs.** A single line can hide a whole loop.

**Hidden costs worth memorising (Python, similar elsewhere):**

- \`x in my_list\` scans the list: **O(n)**. On a \`set\` or \`dict\` it is **O(1)** on average.
- \`my_list.pop(0)\` and \`my_list.insert(0, x)\` shift every element: **O(n)**.
- \`a[1:]\` copies the list: **O(n)**. Slicing inside a loop quietly makes it quadratic.
- Building a string with \`s += piece\` in a loop can cost O(n²) overall because strings are immutable. Collect pieces in a list and \`"".join(pieces)\` once.`,
      ar: `## قراءة التعقيد من الشيفرة

نادراً ما تحتاج إلى الرياضيات. انظر إلى الحلقات.

**حلقة واحدة على البيانات تعني O(n):**

\`\`\`python
def total(a):
    s = 0
    for x in a:        # runs n times
        s += x         # 1 step each
    return s
\`\`\`

**حلقة داخل حلقة تضرب العددين، فتصبح O(n²):**

\`\`\`python
def has_pair_sum(a, target):
    for i in range(len(a)):                # n times
        for j in range(i + 1, len(a)):     # up to n times
            if a[i] + a[j] == target:
                return True
    return False
\`\`\`

الحلقة الداخلية تعمل \`(n-1) + (n-2) + ... + 1 + 0\` مرة، أي \`n(n-1)/2\`. أسقط الثابت والحد الأصغر فتحصل على **O(n²)**.

**حلقة تنصّف متغيّرها (أو تضاعفه) هي O(log n):**

\`\`\`python
def halvings(n):
    steps = 0
    while n > 1:
        n //= 2        # 1,000,000 -> 500,000 -> 250,000 -> ... -> 1
        steps += 1
    return steps
\`\`\`

**أربع قواعد تغطي معظم الشيفرات:**

1. **الكتل المتتابعة تُجمع**، والأكبر هو الذي يبقى: \`O(n) + O(n²)\` تساوي \`O(n²)\`.
2. **الكتل المتداخلة تُضرب:** حلقة من n مرة تنفّذ خطوة O(m) تعني \`O(n·m)\`.
3. **المدخلات المختلفة تأخذ رموزاً مختلفة.** المرور على القائمة \`a\` ثم على القائمة \`b\` هو \`O(a + b)\` لا \`O(n)\`.
4. **تحقّق من كلفة كل سطر.** سطر واحد قد يخفي حلقة كاملة.

**تكاليف خفية تستحق الحفظ (في Python، وتشبهها لغات أخرى):**

- \`x in my_list\` تمسح القائمة كلها: **O(n)**. أما على \`set\` أو \`dict\` فهي **O(1)** في المتوسط.
- \`my_list.pop(0)\` و\`my_list.insert(0, x)\` تُزيح كل العناصر: **O(n)**.
- \`a[1:]\` تنسخ القائمة: **O(n)**. والتقطيع داخل حلقة يجعلها تربيعية دون أن تنتبه.
- بناء نص بـ \`s += piece\` داخل حلقة قد يكلّف O(n²) إجمالاً لأن النصوص غير قابلة للتعديل. اجمع القطع في قائمة ثم استدعِ \`"".join(pieces)\` مرة واحدة.`,
    },
  },
  {
    type: "lab",
    id: "count-the-steps",
    lang: "cpp",
    prompt: {
      en: `**Count the steps without running them.** Read an integer \`n\` (1 ≤ n ≤ 10⁹). Three snippets of pseudo-code each call \`work()\` a number of times:

\`\`\`
A:  for i in 0 .. n-1:
        work()

B:  for i in 0 .. n-1:
        for j in i+1 .. n-1:
            work()

C:  x = n
    while x > 1:
        x = x / 2        // integer division
        work()
\`\`\`

Print **three lines**: how many times \`work()\` is called by A, by B and by C.

For n up to 10⁹ you cannot simulate B (it makes about 5·10¹⁷ calls), so derive a formula. That is exactly what Big-O thinking is for.

**Example:** n = 10 prints
\`\`\`
10
45
3
\`\`\`
Use 64-bit integers (\`long long\`).`,
      ar: `**عُدّ الخطوات دون تنفيذها.** اقرأ عدداً صحيحاً \`n\` (1 ≤ n ≤ 10⁹). ثلاث شيفرات وهمية تستدعي كل منها \`work()\` عدداً من المرات:

\`\`\`
A:  for i in 0 .. n-1:
        work()

B:  for i in 0 .. n-1:
        for j in i+1 .. n-1:
            work()

C:  x = n
    while x > 1:
        x = x / 2        // integer division
        work()
\`\`\`

اطبع **ثلاثة أسطر**: عدد استدعاءات \`work()\` في A ثم في B ثم في C.

مع n حتى 10⁹ لا يمكنك محاكاة B (تستدعي نحو 5·10¹⁷ مرة)، فاستنتج صيغة رياضية. وهذا بالضبط ما يخدمه التفكير بـ Big-O.

**مثال:** إدخال n = 10 يطبع
\`\`\`
10
45
3
\`\`\`
استخدم أعداداً صحيحة بحجم 64 بت (\`long long\`).`,
    },
    starterCode: `#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;

    // TODO: compute how many times work() is called by each snippet.
    // Do not simulate snippet B: n can be a billion. Find a formula.
    long long a = 0, b = 0, c = 0;

    cout << a << "\\n" << b << "\\n" << c << "\\n";
    return 0;
}
`,
    solution: `#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;

    long long a = n;                // one call per item
    long long b = n * (n - 1) / 2;  // pairs i < j: (n-1) + (n-2) + ... + 0
    long long c = 0;                // how many times n can be halved before it reaches 1
    for (long long x = n; x > 1; x /= 2) c++;

    cout << a << "\\n" << b << "\\n" << c << "\\n";
    return 0;
}
`,
    hints: [
      { en: "Snippet A is a single loop over n items, so it calls work() exactly n times.", ar: "المقطع A حلقة واحدة على n عنصراً، فيستدعي work() بالضبط n مرة." },
      { en: "For B, the inner loop runs n-1 times when i = 0, n-2 times when i = 1, and so on down to 0. Add them up: that is n(n-1)/2.", ar: "في B تعمل الحلقة الداخلية n-1 مرة حين i = 0، ثم n-2 حين i = 1، وهكذا حتى 0. اجمعها فتحصل على n(n-1)/2." },
      { en: "For C, a loop that halves x needs only about 30 iterations even for a billion: it is cheap to just run it.", ar: "في C حلقة تنصّف x لا تحتاج إلا نحو 30 دورة حتى لمليار: لا بأس بتنفيذها فعلياً." },
    ],
    tests: [
      { name: { en: "n = 1: only the first loop runs", ar: "n = 1: تعمل الحلقة الأولى فقط" }, stdin: "1\n", expected: "1\n0\n0" },
      { name: { en: "n = 2", ar: "n = 2" }, stdin: "2\n", expected: "2\n1\n1" },
      { name: { en: "n = 10 (the example)", ar: "n = 10 (المثال)" }, stdin: "10\n", expected: "10\n45\n3" },
      { name: { en: "n = 1000", ar: "n = 1000" }, stdin: "1000\n", expected: "1000\n499500\n9" },
      { name: { en: "n = 10⁹ cannot be simulated", ar: "n = 10⁹ لا يمكن محاكاته" }, stdin: "1000000000\n", expected: "1000000000\n499999999500000000\n29" },
    ],
    sampleInput: "10\n",
  },
  {
    type: "text",
    body: {
      en: `## Trade memory for time

The cheapest way to make a slow algorithm fast is often to **remember what you have already seen**. Checking "have I seen this number before?" by scanning all previous numbers costs O(n) per question. A **hash set** answers the same question in O(1) on average, at the price of storing the numbers: \`O(n)\` extra **space**.

This is the most common trade in programming: **spend memory to save time.** Space complexity is written exactly like time complexity (it counts extra memory as the input grows).

\`\`\`
Nested loops : O(n²) time, O(1) extra space
Hash set     : O(n)  time, O(n) extra space
\`\`\`

Run the next demo and compare how much work each version does on the same data.`,
      ar: `## مقايضة الذاكرة بالزمن

أرخص طريقة لتسريع خوارزمية بطيئة غالباً هي أن **تتذكّر ما رأيته سابقاً**. فالسؤال "هل رأيت هذا الرقم من قبل؟" إن أجبته بمسح كل الأرقام السابقة كلّفك O(n) في كل مرة. أما **hash set** فتجيب عن السؤال نفسه بـ O(1) في المتوسط، مقابل تخزين الأرقام: أي **مساحة** إضافية من الرتبة \`O(n)\`.

هذه أشهر مقايضة في البرمجة: **ننفق ذاكرة لنوفّر زمناً.** وتُكتب تعقيدات المساحة كما تُكتب تعقيدات الزمن (تعدّ الذاكرة الإضافية مع نموّ المدخلات).

\`\`\`
Nested loops : O(n²) time, O(1) extra space
Hash set     : O(n)  time, O(n) extra space
\`\`\`

شغّل العرض التالي وقارن مقدار العمل الذي تبذله كل نسخة على البيانات نفسها.`,
    },
  },
  {
    type: "code-demo",
    lang: "js",
    code: `function hasDuplicateSlow(a) {
  let comparisons = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      comparisons++;
      if (a[i] === a[j]) return { found: true, work: comparisons };
    }
  }
  return { found: false, work: comparisons };
}

function hasDuplicateFast(a) {
  const seen = new Set();
  let lookups = 0;
  for (const x of a) {
    lookups++;
    if (seen.has(x)) return { found: true, work: lookups };
    seen.add(x);
  }
  return { found: false, work: lookups };
}

for (const n of [100, 1000, 10000]) {
  const a = Array.from({ length: n }, (_, i) => i); // all different: the worst case
  console.log("n =", n, "| nested loops:", hasDuplicateSlow(a).work, "comparisons | Set:", hasDuplicateFast(a).work, "lookups");
}
`,
    explanation: {
      en: "Multiply n by 10 and the nested loops do about 100 times more work, while the Set version does 10 times more. That gap is the difference between O(n²) and O(n).",
      ar: "اضرب n في 10 فتبذل الحلقات المتداخلة عملاً أكبر بنحو 100 مرة، بينما تبذل نسخة Set عملاً أكبر 10 مرات فقط. هذه الفجوة هي الفرق بين O(n²) وO(n).",
    },
  },
  {
    type: "lab",
    id: "contains-duplicate",
    lang: "python",
    prompt: {
      en: `**Does any value appear twice?** The input is one line with two integers \`n m\`. To keep the test files tiny, the program builds the list itself with a fixed formula:

\`\`\`
a[i] = (i * 7919 + 13) mod m        for i = 0 .. n-1
\`\`\`

(The starter code already builds it.) Print \`yes\` if some value occurs at least twice in \`a\`, otherwise \`no\`.

**Example:** \`5 3\` builds the values 1, 0, 2, 1, 0 (five numbers but only three possible values), so the answer is \`yes\`.

The starter uses two nested loops. It is correct, but one test has n large enough that O(n²) cannot finish in the runner's time limit. Replace it with an O(n) idea. Note: when \`n ≤ m\` all the values are different (m is never a multiple of 7919).`,
      ar: `**هل تظهر أي قيمة مرتين؟** المدخل سطر واحد فيه عددان صحيحان \`n m\`. ولكي تبقى ملفات الاختبار صغيرة يبني البرنامج القائمة بنفسه بصيغة ثابتة:

\`\`\`
a[i] = (i * 7919 + 13) mod m        for i = 0 .. n-1
\`\`\`

(شيفرة البداية تبنيها لك). اطبع \`yes\` إن تكرّرت أي قيمة مرتين على الأقل في \`a\`، وإلا اطبع \`no\`.

**مثال:** \`5 3\` تبني القيم 1, 0, 2, 1, 0 (خمسة أعداد لكن ثلاث قيم ممكنة فقط)، فالجواب \`yes\`.

تستخدم شيفرة البداية حلقتين متداخلتين. هي صحيحة، لكن أحد الاختبارات يملك n كبيرة بحيث لا تنتهي خوارزمية O(n²) ضمن مهلة المشغّل. استبدلها بفكرة O(n). ملاحظة: حين \`n ≤ m\` تكون كل القيم مختلفة (فالعدد m ليس من مضاعفات 7919 أبداً).`,
    },
    starterCode: `n, m = map(int, input().split())
a = [(i * 7919 + 13) % m for i in range(n)]


def has_duplicate(a):
    # TODO: this brute force is correct but O(n^2): far too slow when n is 100000.
    # Replace it with an O(n) approach that remembers what it has already seen.
    for i in range(len(a)):
        for j in range(i + 1, len(a)):
            if a[i] == a[j]:
                return True
    return False


print("yes" if has_duplicate(a) else "no")
`,
    solution: `n, m = map(int, input().split())
a = [(i * 7919 + 13) % m for i in range(n)]


def has_duplicate(a):
    seen = set()
    for x in a:
        if x in seen:       # O(1) on average, instead of scanning the list
            return True
        seen.add(x)
    return False


print("yes" if has_duplicate(a) else "no")
`,
    hints: [
      { en: "The slow part is asking 'have I seen x before?' by comparing x with every other element.", ar: "الجزء البطيء هو سؤال 'هل رأيت x من قبل؟' بمقارنة x مع كل عنصر آخر." },
      { en: "A set answers that question in O(1) on average. Create an empty set before the loop.", ar: "الـ set تجيب عن هذا السؤال في O(1) في المتوسط. أنشئ set فارغة قبل الحلقة." },
      { en: "For each x: if x is already in the set, return True; otherwise add it. Return False after the loop.", ar: "لكل x: إن كان موجوداً في الـ set فأعِد True، وإلا أضفه. وأعِد False بعد الحلقة." },
    ],
    tests: [
      { name: { en: "Empty list", ar: "قائمة فارغة" }, stdin: "0 7\n", expected: "no" },
      { name: { en: "Five numbers, three possible values", ar: "خمسة أعداد وثلاث قيم ممكنة" }, stdin: "5 3\n", expected: "yes" },
      { name: { en: "Exactly as many numbers as values: all different", ar: "عدد الأرقام مساوٍ لعدد القيم: كلها مختلفة" }, stdin: "7 7\n", expected: "no" },
      { name: { en: "One more number than values: a repeat is forced", ar: "رقم زائد عن عدد القيم: التكرار حتمي" }, stdin: "8 7\n", expected: "yes" },
      { name: { en: "100,000 different numbers (O(n²) times out)", ar: "100,000 رقم مختلف (O(n²) تتجاوز المهلة)" }, stdin: "100000 1000003\n", expected: "no" },
    ],
    sampleInput: "5 3\n",
  },
  {
    type: "text",
    body: {
      en: `## Best, average, worst, and when Big-O misleads

- **Worst case** is what Big-O usually quotes: linear search is O(n) because the item might be last. Its **best case** (item is first) is O(1).
- **Average case** assumes a typical input. A hash map lookup is O(1) on average, but a pathological set of keys that all collide could degrade it. Production languages defend against this.
- **Amortised cost** averages over a whole sequence of operations. Appending to a Python list is **O(1) amortised**: now and then it has to copy everything into a bigger block, but spread over many appends the cost per append stays constant.

**Big-O is not the whole story:**

- It hides constants. An algorithm taking \`100n\` steps beats one taking \`n²\` steps only once n is above 100. For tiny inputs the "worse" algorithm can win.
- Two O(n) solutions can differ by a factor of 50 in real time because of memory access patterns.
- Measure before optimising. But when the input is large, **growth rate beats everything else**.

A solid habit for any problem: (1) write the simplest correct solution, (2) estimate its complexity, (3) compare with the input limits, (4) only then look for a better idea.`,
      ar: `## الأفضل والمتوسط والأسوأ، ومتى يضلّلنا Big-O

- **أسوأ حالة** هي ما يذكره Big-O عادة: البحث الخطي O(n) لأن العنصر قد يكون الأخير. أما **أفضل حالة** (العنصر الأول) فهي O(1).
- **الحالة المتوسطة** تفترض مدخلات نموذجية. بحث hash map هو O(1) في المتوسط، لكن مجموعة مفاتيح مُفتعلة تتصادم كلها قد تُبطئه. واللغات الإنتاجية تحمي نفسها من ذلك.
- **التكلفة المُهلَكة (amortised)** هي المتوسط على سلسلة عمليات كاملة. إضافة عنصر إلى قائمة Python هي **O(1) مُهلَكة**: بين حين وآخر تنسخ القائمة كل شيء إلى كتلة أكبر، لكن موزّعةً على إضافات كثيرة تبقى كلفة الإضافة الواحدة ثابتة.

**Big-O ليس القصة كلها:**

- يُخفي الثوابت. خوارزمية تأخذ \`100n\` خطوة لا تتفوق على أخرى تأخذ \`n²\` إلا حين تتجاوز n الـ 100. ومع مدخلات صغيرة جداً قد تفوز الخوارزمية "الأسوأ".
- حلّان من الرتبة O(n) قد يختلفان 50 ضعفاً في الزمن الفعلي بسبب أنماط الوصول إلى الذاكرة.
- قِس قبل أن تحسّن. لكن حين تكون المدخلات كبيرة **فمعدّل النموّ يتفوق على كل شيء**.

عادة سليمة مع أي مسألة: (1) اكتب أبسط حلّ صحيح، (2) قدّر تعقيده، (3) قارنه بحدود المدخلات، (4) ثم ابحث عن فكرة أفضل.`,
    },
  },
  {
    type: "lab",
    id: "best-streak",
    lang: "java",
    prompt: {
      en: `**Best streak.** A shop records its profit (positive) or loss (negative) each day. Find the **largest total over any run of consecutive days** (at least one day).

**Input:** the first line has \`n\` (1 ≤ n ≤ 10000), the next line has \`n\` integers, each between -1000 and 1000.

**Output:** one integer, the best total.

**Example:** for \`9\` days \`-2 1 -3 4 -1 2 1 -5 4\` the answer is \`6\` (the run \`4 -1 2 1\`).

Trying every start and end day is O(n²). Aim for **one pass, O(n)**: while walking, keep the best run that **ends today**. Careful: if every day is a loss the answer is the least bad single day, not 0.`,
      ar: `**أفضل سلسلة أيام.** يسجّل متجر ربحه (موجب) أو خسارته (سالب) كل يوم. أوجد **أكبر مجموع على أي سلسلة أيام متتالية** (يوم واحد على الأقل).

**المدخل:** السطر الأول فيه \`n\` (1 ≤ n ≤ 10000)، والسطر التالي فيه \`n\` عدداً صحيحاً، كل منها بين -1000 و1000.

**المخرج:** عدد صحيح واحد، هو أفضل مجموع.

**مثال:** لـ \`9\` أيام \`-2 1 -3 4 -1 2 1 -5 4\` الجواب \`6\` (السلسلة \`4 -1 2 1\`).

تجربة كل يوم بداية وكل يوم نهاية هي O(n²). استهدف **مروراً واحداً، O(n)**: أثناء المشي احتفظ بأفضل سلسلة **تنتهي اليوم**. انتبه: إن كانت كل الأيام خسارة فالجواب هو أقل الأيام سوءاً، لا 0.`,
    },
    starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        long[] a = new long[n];
        for (int i = 0; i < n; i++) a[i] = in.nextLong();

        // TODO: print the largest sum of any non-empty run of consecutive days.
        // Idea: walk once, tracking the best run that ENDS at the current day.
        long best = 0;
        System.out.println(best);
    }
}
`,
    solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();

        long best = Long.MIN_VALUE; // best run seen anywhere so far
        long endingHere = 0;        // best run that ends at the current day

        for (int i = 0; i < n; i++) {
            long x = in.nextLong();
            // Either extend yesterday's run with today, or start a new run today.
            endingHere = Math.max(x, endingHere + x);
            best = Math.max(best, endingHere);
        }
        System.out.println(best);
    }
}
`,
    hints: [
      { en: "Let endingHere be the best total of a run that finishes exactly at the current day.", ar: "ليكن endingHere أفضل مجموع لسلسلة تنتهي بالضبط في اليوم الحالي." },
      { en: "Today you have two choices: extend yesterday's run (endingHere + x) or start fresh (x). Keep the larger.", ar: "أمامك اليوم خياران: تمديد سلسلة الأمس (endingHere + x) أو البدء من جديد (x). احتفظ بالأكبر." },
      { en: "The answer is the maximum endingHere seen on any day. Start it at the smallest possible value, not at 0.", ar: "الجواب هو أكبر endingHere ظهرت في أي يوم. ابدأه بأصغر قيمة ممكنة لا بـ 0." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "9\n-2 1 -3 4 -1 2 1 -5 4\n", expected: "6" },
      { name: { en: "Every day is a loss", ar: "كل الأيام خسارة" }, stdin: "3\n-5 -2 -9\n", expected: "-2" },
      { name: { en: "A single day", ar: "يوم واحد" }, stdin: "1\n7\n", expected: "7" },
      { name: { en: "All profits: take everything", ar: "كلها أرباح: خذ كل شيء" }, stdin: "5\n1 2 3 4 5\n", expected: "15" },
      { name: { en: "A big loss in the middle is worth skipping", ar: "خسارة كبيرة في الوسط يستحق تجاوزها" }, stdin: "6\n5 -10 5 -1 5 -1\n", expected: "9" },
      { name: { en: "5,000 days", ar: "5,000 يوم" }, stdin: streakInput, expected: "124" },
    ],
    sampleInput: "9\n-2 1 -3 4 -1 2 1 -5 4\n",
  },
  {
    type: "quiz",
    questions: [
      {
        q: {
          en: "A loop over n items contains another loop over the same n items, and the body is a single addition. What is the time complexity?",
          ar: "حلقة على n عنصراً تحتوي حلقة أخرى على العناصر n نفسها، وجسمها عملية جمع واحدة. ما التعقيد الزمني؟",
        },
        choices: [
          { en: "O(n)", ar: "O(n)" },
          { en: "O(n²)", ar: "O(n²)" },
          { en: "O(2n)", ar: "O(2n)" },
          { en: "O(log n)", ar: "O(log n)" },
        ],
        answer: 1,
        explain: {
          en: "The inner loop runs n times for each of the n outer iterations, so the addition runs n × n = n² times. (O(2n) would be two separate loops, and it simplifies to O(n) anyway.)",
          ar: "الحلقة الداخلية تعمل n مرة لكل واحدة من n دورة خارجية، فتُنفَّذ عملية الجمع n × n = n² مرة. (أما O(2n) فتعني حلقتين منفصلتين، وتُختزل أصلاً إلى O(n).)",
        },
      },
      {
        q: {
          en: "Roughly how many halving steps does binary search need for 1,000,000 sorted items?",
          ar: "كم خطوة تنصيف تقريباً تحتاجها binary search لمليون عنصر مرتّب؟",
        },
        choices: [
          { en: "About 20", ar: "نحو 20" },
          { en: "About 1,000", ar: "نحو 1,000" },
          { en: "About 500,000", ar: "نحو 500,000" },
        ],
        answer: 0,
        explain: {
          en: "Each step halves the range, and 2²⁰ is about a million, so about 20 halvings reach a single item. That is why O(log n) feels almost free.",
          ar: "كل خطوة تنصّف المجال، و2²⁰ يساوي نحو المليون، فنحو 20 تنصيفاً تصل إلى عنصر واحد. لهذا تبدو O(log n) شبه مجانية.",
        },
      },
      {
        q: {
          en: "Which one is NOT O(1) on average in Python?",
          ar: "أي مما يلي ليس O(1) في المتوسط في Python؟",
        },
        choices: [
          { en: "Reading my_list[500]", ar: "قراءة my_list[500]" },
          { en: "Looking up a key in a dict", ar: "البحث عن مفتاح في dict" },
          { en: "Checking x in my_list", ar: "فحص x in my_list" },
          { en: "Appending to the end of a list", ar: "الإضافة إلى نهاية القائمة" },
        ],
        answer: 2,
        explain: {
          en: "x in my_list scans the list element by element: O(n). The same test on a set or dict is O(1) on average. This hidden cost is behind many accidentally quadratic programs.",
          ar: "x in my_list تمسح القائمة عنصراً عنصراً: O(n). أما الفحص نفسه على set أو dict فهو O(1) في المتوسط. هذه التكلفة الخفية وراء كثير من البرامج التربيعية دون قصد.",
        },
      },
      {
        q: {
          en: "Algorithm A takes 100·n steps. Algorithm B takes n² steps. Which statement is true?",
          ar: "الخوارزمية A تأخذ 100·n خطوة، والخوارزمية B تأخذ n² خطوة. أي عبارة صحيحة؟",
        },
        choices: [
          { en: "A is always faster, because O(n) beats O(n²)", ar: "A أسرع دائماً لأن O(n) تتفوق على O(n²)" },
          { en: "B is faster for n below 100, but A wins once n is larger", ar: "B أسرع حين تكون n أقل من 100، لكن A تفوز حين تكبر n" },
          { en: "They are equal, because Big-O ignores constants", ar: "هما متساويتان لأن Big-O يتجاهل الثوابت" },
          { en: "B is always faster, because 100 is bigger than 2", ar: "B أسرع دائماً لأن 100 أكبر من 2" },
        ],
        answer: 1,
        explain: {
          en: "Big-O describes growth, not speed at one particular size. At n = 10: A needs 1,000 steps and B only 100. At n = 1,000,000 the picture reverses completely: A needs 10⁸ and B needs 10¹².",
          ar: "Big-O يصف النموّ لا السرعة عند حجم معيّن. عند n = 10: تحتاج A إلى 1,000 خطوة وB إلى 100 فقط. وعند n = 1,000,000 ينقلب المشهد كلياً: A تحتاج 10⁸ وB تحتاج 10¹².",
        },
      },
      {
        q: {
          en: "Simplify 3n² + 50n + 7 into Big-O form.",
          ar: "بسّط 3n² + 50n + 7 إلى صيغة Big-O.",
        },
        choices: [
          { en: "O(3n²)", ar: "O(3n²)" },
          { en: "O(n² + n)", ar: "O(n² + n)" },
          { en: "O(n²)", ar: "O(n²)" },
        ],
        answer: 2,
        explain: {
          en: "Keep only the fastest-growing term (n²) and drop its constant multiplier (3). The 50n and 7 are dwarfed by n² as n grows.",
          ar: "احتفظ بالحدّ الأسرع نمواً فقط (n²) وأسقط معامله الثابت (3). أما 50n و7 فيبتلعها n² كلما كبرت n.",
        },
      },
    ],
  },
  {
    type: "text",
    body: {
      en: `## Summary

- Complexity measures how the **work grows** with the input size, so it compares ideas independently of hardware.
- Keep the fastest-growing term and drop constants: \`3n² + 50n + 7\` is \`O(n²)\`.
- The ladder: \`O(1)\` < \`O(log n)\` < \`O(n)\` < \`O(n log n)\` < \`O(n²)\` < \`O(2ⁿ)\`.
- Read it off the code: sequential blocks add, nested blocks multiply, halving loops are logarithmic, and watch for hidden O(n) lines such as \`x in list\`, slicing and \`pop(0)\`.
- A hash set trades **O(n) memory** for **O(1) lookups** and often turns O(n²) into O(n).
- Always compare your complexity with the input limits before you code.

**Practice next:** take any loop you wrote recently and write its complexity in a comment. Then continue with **Arrays, Strings & Hash Maps**, where these ideas become everyday tools.`,
      ar: `## الخلاصة

- التعقيد يقيس كيف **ينمو العمل** مع حجم المدخلات، فيقارن الأفكار بمعزل عن العتاد.
- احتفظ بالحدّ الأسرع نمواً وأسقط الثوابت: \`3n² + 50n + 7\` تساوي \`O(n²)\`.
- السلّم: \`O(1)\` < \`O(log n)\` < \`O(n)\` < \`O(n log n)\` < \`O(n²)\` < \`O(2ⁿ)\`.
- اقرأه من الشيفرة: الكتل المتتابعة تُجمع، والمتداخلة تُضرب، وحلقات التنصيف لوغاريتمية، وانتبه للأسطر الخفية من الرتبة O(n) مثل \`x in list\` والتقطيع و\`pop(0)\`.
- الـ hash set تبادل **ذاكرة O(n)** بـ **بحث O(1)** وكثيراً ما تحوّل O(n²) إلى O(n).
- قارن تعقيدك دائماً بحدود المدخلات قبل أن تكتب الشيفرة.

**تدرّب بعد ذلك:** خذ أي حلقة كتبتها مؤخراً واكتب تعقيدها في تعليق. ثم تابع إلى **المصفوفات والنصوص وHash Maps** حيث تصبح هذه الأفكار أدوات يومية.`,
    },
  },
];

export const lesson: Lesson = {
  nodeId: "complexity-big-o",
  title: { en: "Complexity & Big-O: Measuring How Work Grows", ar: "التعقيد وBig-O: قياس نموّ العمل" },
  estMinutes: estimateMinutes(sections),
  sections,
};
