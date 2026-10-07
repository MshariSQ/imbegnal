import type { Lesson, LessonSection } from "../types";
import { estimateMinutes } from "./estimate";

// Large inputs are generated here (not pasted) so the file stays readable.
// Binary-search lab: the array is a[i] = 2i, so the expected answer has a closed form
// (ceil(x / 2) clamped to [0, n]) that does not use any search: an independent check.
const LOWER_N = 4000;
const LOWER_Q = 500;
const lowerQueries = Array.from({ length: LOWER_Q }, (_, k) => ((k * 7919) % 8200) - 100);
const lowerInput = `${LOWER_N} ${LOWER_Q}\n${Array.from({ length: LOWER_N }, (_, i) => 2 * i).join(" ")}\n${lowerQueries.join(" ")}\n`;
const lowerExpected = lowerQueries.map((x) => (x <= 0 ? 0 : Math.min(LOWER_N, (x + 1) >> 1))).join("\n");

// Inversions lab: 4 000 pseudo-random values. The expected count (3995007) was computed
// with an independent O(n²) brute-force script.
const inversionInput = `4000\n${Array.from({ length: 4000 }, (_, i) => (i * 7919 + 13) % 100003).join(" ")}\n`;

const sections: LessonSection[] = [
  {
    type: "text",
    body: {
      en: `## What you'll learn

- Why **sorted** data is so valuable, and how the classic sorting algorithms work
- The difference between **O(n²)** sorts and **O(n log n)** sorts, and what **stable** means
- How to use your language's built-in sort with a **comparator**, and the classic bug that goes with it
- **Binary search**: finding anything in a sorted list of a million items in about 20 steps
- The **lower-bound** template that avoids off-by-one errors, and how to binary-search on an **answer**
- You will write: a leaderboard sort, a binary-search query engine and a merge sort that counts inversions`,
      ar: `## ماذا ستتعلم

- لماذا تكتسب البيانات **المرتّبة** كل هذه القيمة، وكيف تعمل خوارزميات الفرز الكلاسيكية
- الفرق بين فرز **O(n²)** وفرز **O(n log n)**، ومعنى الفرز **المستقرّ (stable)**
- كيف تستخدم دالة الفرز الجاهزة في لغتك مع **مقارِن (comparator)**، والخطأ الشهير المرتبط بها
- **البحث الثنائي (Binary search)**: إيجاد أي عنصر في قائمة مرتّبة من مليون عنصر في نحو 20 خطوة
- قالب **lower-bound** الذي يجنّبك أخطاء الإزاحة بواحد، وكيف تبحث ثنائياً عن **جواب** لا عن عنصر
- ستكتب: فرز لوحة متصدّرين، ومحرّك استعلامات بالبحث الثنائي، وفرزاً بالدمج (merge sort) يعدّ الانقلابات (inversions)`,
    },
  },
  {
    type: "text",
    body: {
      en: `## The bookshelf and the guessing game

**Imagine a shelf of 1,000 books in random order.** To find one title you must pick up books one by one: in the worst case, all 1,000. Now imagine the same shelf sorted by title. Open it in the middle: if your title comes *before* the one you see, ignore the right half, otherwise ignore the left half. Repeat. After about **10 looks** you are standing at the book (2¹⁰ = 1,024).

It is the same as the guessing game "I'm thinking of a number from 1 to 1,000": the smart player says 500, hears "higher", says 750, and never needs more than 10 guesses. **Every guess throws away half of the possibilities.**

The price is that someone had to **sort the shelf first**. This lesson is about both halves of the deal: how to sort efficiently, and how to cash in on the order with binary search.`,
      ar: `## رفّ الكتب ولعبة التخمين

**تخيّل رفّاً فيه 1,000 كتاب بترتيب عشوائي.** لتجد عنواناً معيّناً عليك أن تمسك الكتب واحداً واحداً: وفي أسوأ الأحوال ستفحص الألف كلها. الآن تخيّل الرفّ نفسه مرتّباً حسب العنوان. افتحه من المنتصف: إن كان عنوانك يأتي *قبل* ما تراه فتجاهل النصف الأيمن، وإلا فتجاهل النصف الأيسر. كرّر ذلك. وبعد نحو **10 نظرات** ستكون واقفاً أمام الكتاب (2¹⁰ = 1,024).

وهذا هو نفسه ما في لعبة التخمين "أفكّر في رقم من 1 إلى 1,000": اللاعب الذكي يقول 500 فيسمع "أعلى"، فيقول 750، ولا يحتاج أبداً أكثر من 10 تخمينات. **كل تخمين يستبعد نصف الاحتمالات.**

الثمن أن شخصاً ما كان عليه **أن يرتّب الرفّ أولاً**. وهذا الدرس عن شقّي الصفقة: كيف نرتّب بكفاءة، وكيف نستثمر الترتيب بالبحث الثنائي.`,
    },
  },
  {
    type: "text",
    body: {
      en: `## Sorting: the toolbox

**The slow family, O(n²).** *Bubble*, *selection* and *insertion* sort compare items in nested loops. For n = 1,000 that is about a million steps; for n = 1,000,000 it is about 10¹², far too slow. **Insertion sort** deserves a mention: it is O(n²) in the worst case but close to **O(n)** when the data is almost sorted, so real libraries use it for small pieces.

**The fast family, O(n log n).**

- **Merge sort** (divide and conquer): split the list in half, sort each half recursively, then **merge** the two sorted halves by repeatedly taking the smaller front item. Always O(n log n), needs O(n) extra space, and is naturally **stable**.
- **Quicksort**: pick a pivot, partition into "smaller" and "larger", recurse on both. O(n log n) on average and very fast in practice, but a bad pivot choice (for example always the first item of already-sorted data) makes it O(n²).
- **Heap sort**: O(n log n) worst case with O(1) extra space (you will meet heaps later in this track).

**How fast can any comparison sort be?** A sort that only compares pairs of items needs at least about **n log n** comparisons in the worst case. You cannot do better, so O(n log n) is the practical target. If your keys are small integers you can beat it: **counting sort** runs in O(n + k) for keys in the range 0..k.

**Stable sort:** items with equal keys keep their **original relative order**. This matters when you sort twice: sort by name, then stable-sort by grade, and students with equal grades stay in alphabetical order.

**In real life you call the built-in sort.** Know what it guarantees:

- Python \`sorted()\` / \`list.sort()\`: stable (Timsort). JavaScript \`Array.prototype.sort\`: stable since ES2019. Rust \`slice.sort()\`: stable (\`sort_unstable\` is the faster, unstable one). Java \`Collections.sort\` and \`Arrays.sort\` on objects: stable.
- C++ \`std::sort\`: **not** stable; use \`std::stable_sort\` when you need it. Java \`Arrays.sort\` on primitive arrays: no stability concept, because equal ints are indistinguishable.

**The comparator.** To sort by your own rule you pass a function that returns a negative number if \`a\` goes first, positive if \`b\` goes first and 0 for a tie. **Warning for JavaScript:** without a comparator, \`sort()\` compares items **as text**, so \`[10, 9, 1].sort()\` gives \`[1, 10, 9]\`. Always pass \`(a, b) => a - b\` for numbers.`,
      ar: `## الفرز: صندوق الأدوات

**العائلة البطيئة، O(n²).** فرز الفقاعات (*bubble*) والاختيار (*selection*) والإدراج (*insertion*) تقارن العناصر بحلقات متداخلة. مع n = 1,000 يعني ذلك نحو مليون خطوة؛ ومع n = 1,000,000 نحو 10¹²، وهذا بطيء جداً. ويستحق **فرز الإدراج** إشارة خاصة: هو O(n²) في أسوأ الحالات لكنه قريب من **O(n)** حين تكون البيانات شبه مرتّبة، ولذلك تستخدمه المكتبات الحقيقية للقطع الصغيرة.

**العائلة السريعة، O(n log n).**

- **الفرز بالدمج (Merge sort)** (فرّق تسد): اقسم القائمة نصفين، ورتّب كل نصف بالتكرار الذاتي، ثم **ادمج** النصفين المرتّبين بأخذ الأصغر من العنصرين الأماميين مراراً. يعمل دائماً بزمن O(n log n)، ويحتاج مساحة إضافية O(n)، وهو **مستقرّ (stable)** بطبيعته.
- **الفرز السريع (Quicksort)**: اختر محوراً (pivot)، وقسّم العناصر إلى "أصغر" و"أكبر"، ثم كرّر على الجزأين. متوسطه O(n log n) وهو سريع جداً عملياً، لكن اختيار محور سيّئ (مثل أخذ أول عنصر دائماً في بيانات مرتّبة أصلاً) يجعله O(n²).
- **الفرز بالكومة (Heap sort)**: أسوأ حالاته O(n log n) بمساحة إضافية O(1) (ستلتقي بالكومات لاحقاً في هذا المسار).

**ما أسرع ما يمكن لأي فرز بالمقارنة؟** الفرز الذي لا يفعل سوى مقارنة الأزواج يحتاج على الأقل نحو **n log n** مقارنة في أسوأ الحالات. لا يمكن أفضل من ذلك، فهدفنا العملي هو O(n log n). وإن كانت مفاتيحك أعداداً صحيحة صغيرة فيمكنك التفوّق عليه: **counting sort** يعمل بزمن O(n + k) للمفاتيح في المدى 0..k.

**الفرز المستقرّ (Stable):** العناصر ذات المفاتيح المتساوية تحتفظ **بترتيبها الأصلي النسبي**. وهذا مهم حين ترتّب مرتين: رتّب حسب الاسم، ثم رتّب حسب الدرجة بفرز مستقرّ، فيبقى الطلاب أصحاب الدرجة نفسها مرتّبين أبجدياً.

**في الواقع تستدعي دالة الفرز الجاهزة.** اعرف ما تضمنه:

- في Python الدالتان \`sorted()\` و\`list.sort()\` مستقرّتان (Timsort). وفي JavaScript الدالة \`Array.prototype.sort\` مستقرّة منذ ES2019. وفي Rust الدالة \`slice.sort()\` مستقرّة (و\`sort_unstable\` أسرع لكنها غير مستقرّة). وفي Java الدالتان \`Collections.sort\` و\`Arrays.sort\` على الكائنات مستقرّتان.
- في C++ الدالة \`std::sort\` **غير** مستقرّة؛ استخدم \`std::stable_sort\` حين تحتاج الاستقرار. وفي Java الدالة \`Arrays.sort\` على مصفوفات الأنواع الأولية لا يهمّها الاستقرار لأن الأعداد المتساوية لا يمكن تمييزها.

**المقارِن (Comparator).** لتفرز بقاعدتك الخاصة تمرّر دالة تعيد عدداً سالباً إن كان \`a\` يأتي أولاً، وموجباً إن كان \`b\` يأتي أولاً، وصفراً عند التعادل. **تحذير في JavaScript:** بدون مقارِن تقارن \`sort()\` العناصر **كنصوص**، فيعطي \`[10, 9, 1].sort()\` النتيجة \`[1, 10, 9]\`. مرّر دائماً \`(a, b) => a - b\` للأعداد.`,
    },
  },
  {
    type: "code-demo",
    lang: "js",
    code: `const nums = [10, 9, 2, 1, 100];
console.log("default sort:", [...nums].sort());                  // compares as TEXT
console.log("ascending:   ", [...nums].sort((a, b) => a - b));
console.log("descending:  ", [...nums].sort((a, b) => b - a));

// Stability: equal grades keep their original order (guaranteed since ES2019)
const students = [
  { name: "Lina", grade: 90 },
  { name: "Omar", grade: 85 },
  { name: "Sara", grade: 90 },
  { name: "Yusuf", grade: 85 },
];
students.sort((a, b) => b.grade - a.grade);
console.log(students.map((s) => s.name + ":" + s.grade).join("  "));
`,
    explanation: {
      en: "The default sort puts 10 and 100 before 2 because the text \"10\" comes before \"2\". With a comparator the numbers sort correctly. In the last line Lina stays ahead of Sara and Omar ahead of Yusuf: that is stability.",
      ar: "الفرز الافتراضي يضع 10 و100 قبل 2 لأن النص \"10\" يسبق النص \"2\". ومع المقارِن تُفرز الأعداد صحيحاً. وفي السطر الأخير يبقى Lina قبل Sara وOmar قبل Yusuf: هذا هو الاستقرار.",
    },
  },
  {
    type: "lab",
    id: "sort-leaderboard",
    lang: "javascript",
    prompt: {
      en: `**Sort the leaderboard.** Rank players by score, highest first. Players with the same score are listed **alphabetically by name**.

**Input:** the first line has \`n\`. Then \`n\` lines follow, each \`name score\` (a lowercase name without spaces and an integer score that may be negative or have several digits).

**Output:** \`n\` lines in the form \`name score\`, in ranked order. If \`n\` is 0, print nothing.

**Example:** input
\`\`\`
4
zed 50
amy 70
bob 70
cy 20
\`\`\`
prints
\`\`\`
amy 70
bob 70
zed 50
cy 20
\`\`\`
Use \`players.sort(comparator)\`. Compare scores as **numbers**, and compare names with \`<\` and \`>\`.`,
      ar: `**رتّب لوحة المتصدّرين.** رتّب اللاعبين حسب النقاط من الأعلى إلى الأدنى. اللاعبون المتساوون في النقاط يُذكرون **أبجدياً حسب الاسم**.

**المدخل:** السطر الأول فيه \`n\`. ثم \`n\` سطراً، في كل منها \`name score\` (اسم بأحرف صغيرة بلا مسافات، ونقاط عدد صحيح قد يكون سالباً أو من عدة خانات).

**المخرج:** \`n\` سطراً بالصيغة \`name score\` بترتيب التصنيف. إن كانت \`n\` تساوي 0 فلا تطبع شيئاً.

**مثال:** المدخل
\`\`\`
4
zed 50
amy 70
bob 70
cy 20
\`\`\`
يطبع
\`\`\`
amy 70
bob 70
zed 50
cy 20
\`\`\`
استخدم \`players.sort(comparator)\`. قارن النقاط **كأعداد**، وقارن الأسماء بالمعاملين \`<\` و\`>\`.`,
    },
    starterCode: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const n = Number(lines[0]);

const players = [];
for (let i = 1; i <= n; i++) {
  const [name, score] = lines[i].split(" ");
  players.push({ name, score: Number(score) });
}

// TODO: sort \`players\` so the highest score comes first.
// When two scores are equal, the name that comes first alphabetically goes first.
// players.sort((a, b) => ...);

for (const p of players) {
  console.log(p.name + " " + p.score);
}
`,
    solution: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const n = Number(lines[0]);

const players = [];
for (let i = 1; i <= n; i++) {
  const [name, score] = lines[i].split(" ");
  players.push({ name, score: Number(score) });
}

players.sort((a, b) => {
  if (a.score !== b.score) return b.score - a.score; // higher score first (numeric!)
  if (a.name < b.name) return -1;                    // tie: alphabetical
  if (a.name > b.name) return 1;
  return 0;
});

for (const p of players) {
  console.log(p.name + " " + p.score);
}
`,
    hints: [
      { en: "A comparator returns a negative number when a must come first, a positive number when b must come first, and 0 for a tie.", ar: "المقارِن يعيد عدداً سالباً حين يجب أن يأتي a أولاً، وموجباً حين يجب أن يأتي b أولاً، وصفراً عند التعادل." },
      { en: "For 'highest first' return b.score - a.score. Do not compare the scores as text: 9 would beat 100.", ar: "لـ 'الأعلى أولاً' أعد b.score - a.score. ولا تقارن النقاط كنصوص: فالقيمة 9 ستتفوّق على 100." },
      { en: "Only when the scores are equal fall back to the names: return -1 if a.name < b.name, 1 if a.name > b.name, otherwise 0.", ar: "عند تساوي النقاط فقط ارجع إلى الأسماء: أعد -1 إن كان a.name < b.name، و1 إن كان a.name > b.name، وإلا 0." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "4\nzed 50\namy 70\nbob 70\ncy 20\n", expected: "amy 70\nbob 70\nzed 50\ncy 20", mode: "lines" },
      { name: { en: "Scores 9, 10 and 100 (numbers, not text)", ar: "النقاط 9 و10 و100 (أعداد لا نصوص)" }, stdin: "3\na 9\nb 10\nc 100\n", expected: "c 100\nb 10\na 9", mode: "lines" },
      { name: { en: "Negative scores", ar: "نقاط سالبة" }, stdin: "4\nw -5\nx 0\ny -20\nz 3\n", expected: "z 3\nx 0\nw -5\ny -20", mode: "lines" },
      { name: { en: "Everyone tied: alphabetical order", ar: "الجميع متعادلون: ترتيب أبجدي" }, stdin: "3\nmia 5\nada 5\nzoe 5\n", expected: "ada 5\nmia 5\nzoe 5", mode: "lines" },
      { name: { en: "A single player", ar: "لاعب واحد" }, stdin: "1\nsolo 42\n", expected: "solo 42", mode: "lines" },
      { name: { en: "No players", ar: "لا يوجد لاعبون" }, stdin: "0\n", expected: "", mode: "lines" },
    ],
    sampleInput: "4\nzed 50\namy 70\nbob 70\ncy 20\n",
  },
  {
    type: "text",
    body: {
      en: `## Binary search

**Binary search** finds a value in a **sorted** array by repeatedly looking at the middle item and discarding the half that cannot contain the answer. Each step halves the search range, so a million items need at most about **20** steps (2²⁰ = 1,048,576): **O(log n)**.

**The one requirement is order.** (More precisely: a yes/no question whose answer flips only once, from "no" to "yes". Sorted data gives you that for "is a[i] >= x?".)

Plain "find x" versions are famous for off-by-one bugs. Use one template for everything instead, the **lower bound**: *the first index whose value is at least x* (or \`n\` if there is none).

\`\`\`python
def lower_bound(a, x):
    lo, hi = 0, len(a)            # the answer is somewhere in [lo, hi]
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if a[mid] >= x:
            hi = mid              # mid might be the answer: keep it
        else:
            lo = mid + 1          # mid is too small: throw it away
    return lo
\`\`\`

**Why it is safe.** The loop keeps one **invariant**: every item before \`lo\` is smaller than \`x\`, and every item at \`hi\` or after is at least \`x\`. The range shrinks on every step and ends with \`lo == hi\`, which is the boundary.

**Everything else is a one-liner on top of it:**

- *Is x present?* \`i = lower_bound(a, x)\`, then \`i < len(a) and a[i] == x\`
- *First occurrence of x:* \`lower_bound(a, x)\`
- *How many copies of x (integers)?* \`lower_bound(a, x + 1) - lower_bound(a, x)\`
- *Where would x be inserted to keep the list sorted?* \`lower_bound(a, x)\` (Python's \`bisect.bisect_left\`, C++'s \`std::lower_bound\`)

**Two details that bite.**

- **Overflow.** In Java, C or C++ with 32-bit \`int\`, \`(lo + hi) / 2\` can overflow when \`lo + hi\` exceeds 2³¹ - 1. Write \`lo + (hi - lo) / 2\`. (Python integers do not overflow, but the habit is free.)
- **Duplicates.** Plain "return when a[mid] == x" finds *some* copy. Lower bound finds the *first* one every time.

**Binary search on the answer.** The same template works without any array. Suppose you want the **smallest x for which a yes/no check \`ok(x)\` is true**, and you know that once it is true it stays true for larger x (for example "can the job be done with x workers?" or "is x² at least N?"). Binary-search over the range of possible x, calling \`ok(mid)\` instead of reading \`a[mid]\`. The demo below does exactly that.`,
      ar: `## البحث الثنائي (Binary search)

**البحث الثنائي** يجد قيمة في مصفوفة **مرتّبة** بأن ينظر مراراً إلى العنصر الأوسط ويستبعد النصف الذي لا يمكن أن يحوي الجواب. كل خطوة تنصّف مدى البحث، فيحتاج المليون عنصر إلى نحو **20** خطوة على الأكثر (2²⁰ = 1,048,576): أي **O(log n)**.

**الشرط الوحيد هو الترتيب.** (بدقة أكبر: سؤال بنعم/لا تنقلب إجابته مرة واحدة فقط، من "لا" إلى "نعم". والبيانات المرتّبة تعطيك ذلك للسؤال "هل a[i] >= x؟".)

نسخ "ابحث عن x" العادية مشهورة بأخطاء الإزاحة بواحد. استخدم بدلاً منها قالباً واحداً لكل شيء، هو **lower bound**: *أول فهرس قيمته لا تقلّ عن x* (أو \`n\` إن لم يوجد).

\`\`\`python
def lower_bound(a, x):
    lo, hi = 0, len(a)            # الجواب في مكان ما ضمن [lo, hi]
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if a[mid] >= x:
            hi = mid              # قد يكون mid هو الجواب: احتفظ به
        else:
            lo = mid + 1          # mid أصغر من اللازم: تخلّص منه
    return lo
\`\`\`

**لماذا هو آمن.** الحلقة تحافظ على **شرط ثابت (invariant)** واحد: كل عنصر قبل \`lo\` أصغر من \`x\`، وكل عنصر عند \`hi\` أو بعده لا يقلّ عن \`x\`. المدى يتقلّص في كل خطوة وينتهي بـ \`lo == hi\`، وهذه هي الحدّ الفاصل.

**وكل ما عداه سطر واحد فوقه:**

- *هل x موجود؟* \`i = lower_bound(a, x)\` ثم \`i < len(a) and a[i] == x\`
- *أول ظهور لـ x:* \`lower_bound(a, x)\`
- *كم نسخة من x (للأعداد الصحيحة)؟* \`lower_bound(a, x + 1) - lower_bound(a, x)\`
- *أين يُدرَج x ليبقى الترتيب صحيحاً؟* \`lower_bound(a, x)\` (وهي \`bisect.bisect_left\` في Python و\`std::lower_bound\` في C++)

**تفصيلان يؤذيان.**

- **الفيضان (Overflow).** في Java أو C أو C++ مع \`int\` بحجم 32 بت قد يفيض \`(lo + hi) / 2\` حين يتجاوز \`lo + hi\` القيمة 2³¹ - 1. اكتب \`lo + (hi - lo) / 2\`. (أعداد Python لا تفيض، لكن العادة بلا كلفة.)
- **القيم المكرّرة.** الصيغة العادية "أرجِع حين a[mid] == x" تجد *نسخة ما*. أما lower bound فيجد *الأولى* دائماً.

**البحث الثنائي على الجواب.** القالب نفسه يعمل بلا أي مصفوفة. افترض أنك تريد **أصغر x يتحقق عنده فحص نعم/لا \`ok(x)\`**، وتعلم أنه متى تحقق بقي متحققاً لكل x أكبر (مثل "هل يمكن إنجاز العمل بـ x عاملاً؟" أو "هل x² لا يقلّ عن N؟"). ابحث ثنائياً في مدى قيم x الممكنة مستدعياً \`ok(mid)\` بدل قراءة \`a[mid]\`. العرض التالي يفعل ذلك تماماً.`,
    },
  },
  {
    type: "code-demo",
    lang: "python",
    code: `import bisect

def binary_search(a, target):
    lo, hi = 0, len(a) - 1
    steps = 0
    while lo <= hi:
        steps += 1
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid, steps
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1, steps

a = list(range(0, 2_000_000, 2))        # one million even numbers
print("found 1234566 at index / steps:", binary_search(a, 1_234_566))
print("looking for 7 (absent)  index / steps:", binary_search(a, 7))
print("bisect_left(7) =", bisect.bisect_left(a, 7), "(the position where 7 would be inserted)")

def first_true(lo, hi, ok):
    """Smallest x in [lo, hi] with ok(x) True; ok must be False...False True...True."""
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

# Binary search on an ANSWER: the smallest x with x * x >= 1_000_000_007
print("smallest x with x*x >= 10^9+7:", first_true(0, 10**9, lambda x: x * x >= 10**9 + 7))
`,
    explanation: {
      en: "One million items were searched in at most 20 steps. The second search shows that a failed lookup is just as fast. The last line searches over numbers 0 to a billion without any array: about 30 calls to ok().",
      ar: "تم البحث في مليون عنصر في 20 خطوة على الأكثر. والبحث الثاني يُظهر أن البحث الفاشل بالسرعة نفسها. والسطر الأخير يبحث بين الأعداد من 0 إلى مليار دون أي مصفوفة: نحو 30 استدعاء لـ ok().",
    },
  },
  {
    type: "lab",
    id: "lower-bound-queries",
    lang: "java",
    prompt: {
      en: `**A query engine with binary search.** You get a sorted array and several queries. For each query \`x\`, print the **smallest index** \`i\` (0-based) such that \`a[i] >= x\`. If every item is smaller than \`x\`, print \`n\`.

**Input:** the first line has \`n q\`. The second line has the \`n\` integers of the array, sorted in non-decreasing order (it is empty when n is 0). The third line has the \`q\` queries.

**Output:** \`q\` lines, one answer per query.

**Example:** input
\`\`\`
5 4
1 3 3 5 8
3 4 0 9
\`\`\`
prints \`1\`, \`3\`, \`0\`, \`5\` (one per line): the first item that is at least 3 is at index 1, at least 4 is the 5 at index 3, at least 0 is index 0, and nothing reaches 9 so the answer is n = 5.

Each query must take O(log n). Use the lower-bound template from the lesson with the half-open range \`[lo, hi)\`.`,
      ar: `**محرّك استعلامات بالبحث الثنائي.** يُعطى لك مصفوفة مرتّبة وعدة استعلامات. لكل استعلام \`x\` اطبع **أصغر فهرس** \`i\` (يبدأ من 0) بحيث \`a[i] >= x\`. وإن كان كل عنصر أصغر من \`x\` فاطبع \`n\`.

**المدخل:** السطر الأول فيه \`n q\`. والسطر الثاني فيه الأعداد الصحيحة الـ \`n\` للمصفوفة مرتّبة تصاعدياً (ويكون فارغاً حين n تساوي 0). والسطر الثالث فيه الاستعلامات الـ \`q\`.

**المخرج:** \`q\` سطراً، جواب واحد لكل استعلام.

**مثال:** المدخل
\`\`\`
5 4
1 3 3 5 8
3 4 0 9
\`\`\`
يطبع \`1\` ثم \`3\` ثم \`0\` ثم \`5\` (كل رقم في سطر): أول عنصر لا يقلّ عن 3 فهرسه 1، ولا يقلّ عن 4 هو العدد 5 في الفهرس 3، ولا يقلّ عن 0 هو الفهرس 0، وما من عنصر يبلغ 9 فالجواب n = 5.

يجب أن يستغرق كل استعلام O(log n). استخدم قالب lower-bound من الدرس مع المدى نصف المفتوح \`[lo, hi)\`.`,
    },
    starterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        int q = in.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = in.nextInt();

        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            int x = in.nextInt();

            // TODO: binary search for the first index i with a[i] >= x (n if there is none).
            // Keep the half-open range [lo, hi), start with lo = 0, hi = n.
            // While lo < hi: mid = lo + (hi - lo) / 2; if a[mid] >= x then hi = mid, else lo = mid + 1.
            int answer = 0;

            out.append(answer).append('\\n');
        }
        System.out.print(out);
    }
}
`,
    solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        int q = in.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = in.nextInt();

        StringBuilder out = new StringBuilder();
        for (int k = 0; k < q; k++) {
            int x = in.nextInt();

            // The answer always stays inside the half-open range [lo, hi).
            int lo = 0, hi = n;
            while (lo < hi) {
                int mid = lo + (hi - lo) / 2; // never overflows, unlike (lo + hi) / 2
                if (a[mid] >= x) {
                    hi = mid;      // mid might be the answer: keep it
                } else {
                    lo = mid + 1;  // mid is too small: discard it
                }
            }
            out.append(lo).append('\\n');
        }
        System.out.print(out);
    }
}
`,
    hints: [
      { en: "Start with lo = 0 and hi = n (not n - 1): n is a legal answer meaning 'no item is big enough'.", ar: "ابدأ بـ lo = 0 و hi = n (وليس n - 1): فالقيمة n جواب مشروع تعني 'لا يوجد عنصر كبير بما يكفي'." },
      { en: "While lo < hi, look at mid = lo + (hi - lo) / 2. If a[mid] >= x, the answer is mid or earlier: set hi = mid.", ar: "ما دام lo < hi انظر إلى mid = lo + (hi - lo) / 2. إن كان a[mid] >= x فالجواب هو mid أو قبله: اجعل hi = mid." },
      { en: "Otherwise a[mid] < x, so mid and everything before it is too small: set lo = mid + 1. When the loop ends, lo is the answer.", ar: "وإلا فإن a[mid] < x، فـ mid وكل ما قبله أصغر من اللازم: اجعل lo = mid + 1. وعند انتهاء الحلقة يكون lo هو الجواب." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "5 4\n1 3 3 5 8\n3 4 0 9\n", expected: "1\n3\n0\n5", mode: "lines" },
      { name: { en: "Duplicates: always the first copy", ar: "قيم مكررة: دائماً النسخة الأولى" }, stdin: "6 3\n2 2 2 2 2 2\n2 1 3\n", expected: "0\n0\n6", mode: "lines" },
      { name: { en: "One item", ar: "عنصر واحد" }, stdin: "1 3\n10\n9 10 11\n", expected: "0\n0\n1", mode: "lines" },
      { name: { en: "Negative numbers", ar: "أعداد سالبة" }, stdin: "4 3\n-9 -4 0 7\n-5 -4 1\n", expected: "1\n1\n3", mode: "lines" },
      { name: { en: "Empty array", ar: "مصفوفة فارغة" }, stdin: "0 2\n\n5 -5\n", expected: "0\n0", mode: "lines" },
      { name: { en: "4,000 numbers and 500 queries", ar: "4,000 عدد و500 استعلام" }, stdin: lowerInput, expected: lowerExpected, mode: "lines" },
    ],
    sampleInput: "5 4\n1 3 3 5 8\n3 4 0 9\n",
  },
  {
    type: "text",
    body: {
      en: `## Merge sort, and what the merge step knows

Here is merge sort in full. It is the cleanest example of **divide and conquer**: split, solve each half, combine.

\`\`\`python
def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left = merge_sort(a[:mid])
    right = merge_sort(a[mid:])
    merged, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:        # <= keeps equal items in order: stable
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
    return merged + left[i:] + right[j:]
\`\`\`

**Why O(n log n)?** The list is halved about log₂ n times, and every level of the recursion merges n items in total. So the work is n per level times log n levels.

**An inversion** is a pair of positions \`i < j\` with \`a[i] > a[j]\`: two items that are in the wrong order relative to each other. A sorted array has 0 inversions; a reversed array of n items has n(n - 1) / 2. Inversions measure "how unsorted" the data is (for instance, how different two people's rankings of the same movies are).

**Counting them naively takes O(n²)** (check every pair). But merge sort can count them **for free**. When you merge two sorted halves and you take an item from the **right** half while \`k\` items are still waiting in the left half, that right item is smaller than **all k** of them. That is exactly \`k\` inversions, found in one step. Add them up over the whole recursion and you get the answer in O(n log n).

**One caution:** with n up to hundreds of thousands the count can exceed the range of a 32-bit integer, so use a 64-bit counter (\`long long\`, \`long\`) as a habit.`,
      ar: `## الفرز بالدمج، وما يعرفه سطر الدمج

هذا هو merge sort كاملاً. وهو أنقى مثال على **فرّق تسد (divide and conquer)**: قسّم، وحلّ كل نصف، ثم اجمع.

\`\`\`python
def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left = merge_sort(a[:mid])
    right = merge_sort(a[mid:])
    merged, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:        # الإشارة <= تُبقي المتساويين بترتيبهما: فرز مستقرّ
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
    return merged + left[i:] + right[j:]
\`\`\`

**لماذا O(n log n)؟** القائمة تُنصَّف نحو log₂ n مرة، وكل مستوى من التكرار الذاتي يدمج n عنصراً في المجموع. فالعمل هو n في كل مستوى مضروباً في log n مستوى.

**الانقلاب (Inversion)** هو زوج مواضع \`i < j\` يحقق \`a[i] > a[j]\`: عنصران في وضع خاطئ بالنسبة لبعضهما. المصفوفة المرتّبة فيها 0 انقلاب، والمصفوفة المعكوسة ذات n عنصراً فيها n(n - 1) / 2. والانقلابات تقيس "مدى اختلال الترتيب" (مثلاً: كم يختلف ترتيبان وضعهما شخصان للأفلام نفسها).

**عدّها بالطريقة الساذجة يستغرق O(n²)** (فحص كل زوج). لكن merge sort يعدّها **مجاناً**. حين تدمج نصفين مرتّبين وتأخذ عنصراً من النصف **الأيمن** بينما ما زال \`k\` عنصراً ينتظر في النصف الأيسر، فهذا العنصر الأيمن أصغر من **جميع الـ k**. وهذا يساوي \`k\` انقلاباً بالضبط، وجدناها في خطوة واحدة. اجمعها على امتداد التكرار الذاتي كله فتحصل على الجواب في O(n log n).

**تنبيه:** مع n بمئات الآلاف قد يتجاوز العدد مدى العدد الصحيح بحجم 32 بت، فاستخدم عدّاداً بحجم 64 بت (\`long long\` أو \`long\`) كعادة.`,
    },
  },
  {
    type: "lab",
    id: "count-inversions",
    lang: "cpp",
    prompt: {
      en: `**Count the inversions.** An inversion is a pair of positions \`i < j\` with \`a[i] > a[j]\` (strictly greater: equal values are **not** inversions).

**Input:** the first line has \`n\` (0 to 5,000). The second line has the \`n\` integers (it is missing when n is 0).

**Output:** one integer, the number of inversions.

**Example:** input \`5\` and \`2 4 1 3 5\` prints \`3\`, from the pairs (2, 1), (4, 1) and (4, 3).

Write a merge sort that counts while it merges, as explained in the lesson. Keep the counter in a \`long long\`.`,
      ar: `**عُدّ الانقلابات.** الانقلاب هو زوج مواضع \`i < j\` يحقق \`a[i] > a[j]\` (أكبر تماماً: القيم المتساوية **ليست** انقلابات).

**المدخل:** السطر الأول فيه \`n\` (من 0 إلى 5,000). والسطر الثاني فيه الأعداد الصحيحة الـ \`n\` (وهو غير موجود حين n تساوي 0).

**المخرج:** عدد صحيح واحد، هو عدد الانقلابات.

**مثال:** المدخل \`5\` و\`2 4 1 3 5\` يطبع \`3\`، من الأزواج (2, 1) و(4, 1) و(4, 3).

اكتب merge sort يعدّ أثناء الدمج كما شُرح في الدرس. واحتفظ بالعدّاد في \`long long\`.`,
    },
    starterCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 0;
    cin >> n;
    vector<int> v(n);
    for (int& x : v) cin >> x;

    // TODO: print the number of inversions, i.e. pairs i < j with v[i] > v[j].
    // Plan: write a recursive merge sort on v[lo, hi). While merging the sorted halves
    // [lo, mid) and [mid, hi): whenever you take an item from the RIGHT half, add the number
    // of items still waiting in the left half (mid - i) to the counter.
    // Use long long for the counter.
    long long inversions = 0;
    cout << inversions << endl;
}
`,
    solution: `#include <iostream>
#include <vector>
using namespace std;

// Sorts v[lo, hi) and returns how many inversions that range contained.
long long sortAndCount(vector<int>& v, vector<int>& tmp, int lo, int hi) {
    if (hi - lo < 2) return 0;
    int mid = lo + (hi - lo) / 2;
    long long count = sortAndCount(v, tmp, lo, mid) + sortAndCount(v, tmp, mid, hi);

    int i = lo, j = mid, k = lo;
    while (i < mid && j < hi) {
        if (v[i] <= v[j]) {          // <= : equal values are not inversions
            tmp[k++] = v[i++];
        } else {
            tmp[k++] = v[j++];
            count += mid - i;        // v[j] is smaller than every item still waiting on the left
        }
    }
    while (i < mid) tmp[k++] = v[i++];
    while (j < hi) tmp[k++] = v[j++];
    for (int p = lo; p < hi; p++) v[p] = tmp[p];
    return count;
}

int main() {
    int n = 0;
    cin >> n;
    vector<int> v(n), tmp(n);
    for (int& x : v) cin >> x;
    cout << sortAndCount(v, tmp, 0, n) << endl;
}
`,
    hints: [
      { en: "Write sortAndCount(v, tmp, lo, hi) that sorts v[lo, hi) and returns the inversions inside it. A range of 0 or 1 items has none.", ar: "اكتب sortAndCount(v, tmp, lo, hi) تفرز v[lo, hi) وتعيد الانقلابات داخلها. المدى الذي فيه 0 أو 1 عنصر لا انقلابات فيه." },
      { en: "Total = inversions in the left half + inversions in the right half + the 'crossing' pairs counted during the merge.", ar: "المجموع = انقلابات النصف الأيسر + انقلابات النصف الأيمن + الأزواج 'العابرة' التي تُعدّ أثناء الدمج." },
      { en: "In the merge, if v[i] <= v[j] take the left item (no inversion). Otherwise take v[j] and add mid - i: it is smaller than all of those left items.", ar: "في الدمج، إن كان v[i] <= v[j] فخذ العنصر الأيسر (لا انقلاب). وإلا فخذ v[j] وأضف mid - i: فهو أصغر من كل تلك العناصر اليسرى." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "5\n2 4 1 3 5\n", expected: "3" },
      { name: { en: "Already sorted", ar: "مرتّبة أصلاً" }, stdin: "5\n1 2 3 4 5\n", expected: "0" },
      { name: { en: "Reversed: n(n-1)/2", ar: "معكوسة: n(n-1)/2" }, stdin: "5\n5 4 3 2 1\n", expected: "10" },
      { name: { en: "Equal values are not inversions", ar: "القيم المتساوية ليست انقلابات" }, stdin: "4\n2 1 2 1\n", expected: "3" },
      { name: { en: "No numbers at all", ar: "بلا أعداد" }, stdin: "0\n", expected: "0" },
      { name: { en: "4,000 pseudo-random numbers", ar: "4,000 عدد شبه عشوائي" }, stdin: inversionInput, expected: "3995007" },
    ],
    sampleInput: "5\n2 4 1 3 5\n",
  },
  {
    type: "quiz",
    questions: [
      {
        q: {
          en: "In JavaScript, [10, 9, 1].sort() returns [1, 10, 9]. Why?",
          ar: "في JavaScript تعيد [10, 9, 1].sort() النتيجة [1, 10, 9]. لماذا؟",
        },
        choices: [
          { en: "JavaScript's sort is unstable", ar: "فرز JavaScript غير مستقرّ" },
          { en: "Without a comparator the elements are compared as text, and \"10\" < \"9\" as text", ar: "بدون مقارِن تُقارَن العناصر كنصوص، والنص \"10\" أصغر من \"9\"" },
          { en: "Numbers with two digits cannot be sorted by sort()", ar: "الأعداد ذات الخانتين لا يمكن فرزها بـ sort()" },
        ],
        answer: 1,
        explain: {
          en: "The default comparison converts items to strings and compares them character by character, so \"10\" comes before \"9\" because \"1\" < \"9\". Pass (a, b) => a - b to sort numerically. Stability is a separate property and is not the cause here.",
          ar: "المقارنة الافتراضية تحوّل العناصر إلى نصوص وتقارنها محرفاً محرفاً، فيأتي \"10\" قبل \"9\" لأن \"1\" < \"9\". مرّر (a, b) => a - b للفرز العددي. أما الاستقرار فخاصية مستقلة وليس هو السبب هنا.",
        },
      },
      {
        q: {
          en: "What must be true for binary search to work?",
          ar: "ما الذي يجب أن يتحقق ليعمل البحث الثنائي؟",
        },
        choices: [
          { en: "The data is sorted (or the yes/no check flips only once)", ar: "أن تكون البيانات مرتّبة (أو أن ينقلب فحص نعم/لا مرة واحدة فقط)" },
          { en: "The array contains no duplicate values", ar: "ألا تحتوي المصفوفة قيماً مكررة" },
          { en: "The length of the array is a power of two", ar: "أن يكون طول المصفوفة قوة للعدد اثنين" },
          { en: "The array is stored as a linked list", ar: "أن تُخزَّن المصفوفة كقائمة مترابطة" },
        ],
        answer: 0,
        explain: {
          en: "Binary search discards half the range after one comparison, which is only valid if the order tells you which half can hold the answer. Duplicates are fine (lower bound handles them), any length works, and a linked list would make reaching the middle O(n) and destroy the speed-up.",
          ar: "البحث الثنائي يستبعد نصف المدى بعد مقارنة واحدة، وهذا لا يصح إلا إذا كان الترتيب يخبرك أي نصف قد يحوي الجواب. القيم المكررة لا تضرّ (فـ lower bound يعالجها)، وأي طول يصلح، والقائمة المترابطة تجعل الوصول إلى المنتصف O(n) وتُضيّع التسريع.",
        },
      },
      {
        q: {
          en: "About how many comparisons does binary search need, at most, on a sorted array of 1,000,000 items?",
          ar: "كم مقارنة يحتاج البحث الثنائي على الأكثر في مصفوفة مرتّبة من 1,000,000 عنصر؟",
        },
        choices: [
          { en: "About 1,000,000", ar: "نحو 1,000,000" },
          { en: "About 500,000", ar: "نحو 500,000" },
          { en: "About 1,000", ar: "نحو 1,000" },
          { en: "About 20", ar: "نحو 20" },
        ],
        answer: 3,
        explain: {
          en: "Each step halves the range, so you need about log₂(1,000,000) ≈ 20 steps (2²⁰ is 1,048,576). Doubling the array to two million items adds only one more step.",
          ar: "كل خطوة تنصّف المدى، فتحتاج نحو log₂(1,000,000) ≈ 20 خطوة (فالعدد 2²⁰ يساوي 1,048,576). ومضاعفة المصفوفة إلى مليونين تضيف خطوة واحدة فقط.",
        },
      },
      {
        q: {
          en: "In Java or C++ with 32-bit int, why is mid = lo + (hi - lo) / 2 preferred over mid = (lo + hi) / 2?",
          ar: "في Java أو C++ مع int بحجم 32 بت، لماذا يُفضَّل mid = lo + (hi - lo) / 2 على mid = (lo + hi) / 2؟",
        },
        choices: [
          { en: "The first form rounds up, the second rounds down", ar: "الصيغة الأولى تقرّب للأعلى والثانية للأسفل" },
          { en: "The second form is wrong for arrays with an even number of items", ar: "الصيغة الثانية خاطئة للمصفوفات ذات العدد الزوجي من العناصر" },
          { en: "lo + hi can exceed the largest int and overflow, while hi - lo cannot", ar: "قد يتجاوز lo + hi أكبر قيمة int فيفيض، بينما hi - lo لا يفيض" },
        ],
        answer: 2,
        explain: {
          en: "For huge arrays lo + hi can pass 2³¹ - 1 and wrap around to a negative number, giving a negative index. hi - lo is never larger than hi, so lo + (hi - lo) / 2 stays in range. Both forms round down for non-negative values and both work for any length.",
          ar: "في المصفوفات الضخمة قد يتجاوز lo + hi القيمة 2³¹ - 1 فيلتفّ إلى عدد سالب ويعطي فهرساً سالباً. أما hi - lo فلا يزيد عن hi أبداً، فيبقى lo + (hi - lo) / 2 ضمن المدى. وكلتا الصيغتين تقرّبان للأسفل للقيم غير السالبة وتعملان لأي طول.",
        },
      },
      {
        q: {
          en: "Which statement about merge sort and quicksort is correct?",
          ar: "أي العبارات الآتية عن merge sort وquicksort صحيحة؟",
        },
        choices: [
          { en: "Quicksort is O(n log n) in the worst case, merge sort is O(n²)", ar: "الـ quicksort هو O(n log n) في أسوأ الحالات، والـ merge sort هو O(n²)" },
          { en: "Merge sort is O(n log n) even in the worst case, but needs O(n) extra space", ar: "الـ merge sort هو O(n log n) حتى في أسوأ الحالات، لكنه يحتاج مساحة إضافية O(n)" },
          { en: "Both are always O(n log n) and both are always stable", ar: "كلاهما دائماً O(n log n) وكلاهما دائماً مستقرّ" },
        ],
        answer: 1,
        explain: {
          en: "Merge sort splits evenly no matter what the data looks like, so it is always O(n log n); the merge buffer costs O(n) space. Quicksort is O(n log n) on average but can degrade to O(n²) with consistently bad pivots, and the usual in-place version is not stable.",
          ar: "الـ merge sort يقسم بالتساوي أياً كانت البيانات، فهو دائماً O(n log n)؛ ومخزن الدمج يكلّف مساحة O(n). أما الـ quicksort فمتوسطه O(n log n) لكنه قد يتدهور إلى O(n²) مع محاور سيئة باستمرار، والنسخة المعتادة في المكان غير مستقرّة.",
        },
      },
    ],
  },
  {
    type: "text",
    body: {
      en: `## Summary

- **Sorted data is a superpower.** It enables binary search, easy duplicate detection, merging and many greedy algorithms.
- Simple sorts (bubble, selection, insertion) are **O(n²)**; merge sort, quicksort (on average) and heap sort are **O(n log n)**, which is also the best any comparison sort can do. In practice you call the built-in sort.
- **Stable** sorts keep equal items in their original order. Always give JavaScript's \`sort\` a numeric comparator.
- **Binary search** is O(log n): about 20 steps for a million items. Use the **lower-bound** template with a half-open range \`[lo, hi)\` and \`lo + (hi - lo) / 2\`.
- The same template can search an **answer** instead of an array whenever a yes/no check flips only once.
- Merge sort can count **inversions** while it merges, in O(n log n) instead of O(n²).

**Practice next:** use binary search to find the minimum capacity that ships all packages in D days (search on the answer), search for a value in a rotated sorted array, and implement quicksort with a random pivot. Then continue with **Trees & Graphs**.`,
      ar: `## الخلاصة

- **البيانات المرتّبة قوة خارقة.** فهي تتيح البحث الثنائي وكشف التكرار بسهولة والدمج وكثيراً من الخوارزميات الجشعة.
- الفرز البسيط (bubble وselection وinsertion) هو **O(n²)**؛ أما merge sort وquicksort (في المتوسط) وheap sort فهي **O(n log n)**، وهذا أيضاً أفضل ما يستطيعه أي فرز بالمقارنة. وعملياً تستدعي دالة الفرز الجاهزة.
- الفرز **المستقرّ** يُبقي العناصر المتساوية بترتيبها الأصلي. ومرّر دائماً مقارِناً عددياً إلى \`sort\` في JavaScript.
- **البحث الثنائي** هو O(log n): نحو 20 خطوة لمليون عنصر. استخدم قالب **lower-bound** مع المدى نصف المفتوح \`[lo, hi)\` والصيغة \`lo + (hi - lo) / 2\`.
- القالب نفسه يستطيع البحث عن **جواب** بدل مصفوفة كلما انقلب فحص نعم/لا مرة واحدة.
- يستطيع merge sort عدّ **الانقلابات** أثناء الدمج، بزمن O(n log n) بدل O(n²).

**تدرّب بعد ذلك:** استخدم البحث الثنائي لإيجاد أقل سعة تشحن كل الطرود في D يوماً (بحث على الجواب)، وابحث عن قيمة في مصفوفة مرتّبة مدوَّرة (rotated)، ونفّذ quicksort بمحور عشوائي. ثم تابع إلى **الأشجار والرسوم البيانية (Trees & Graphs)**.`,
    },
  },
];

export const lesson: Lesson = {
  nodeId: "sorting-searching",
  title: { en: "Sorting & Binary Search: Order Is a Superpower", ar: "الفرز والبحث الثنائي: الترتيب قوة خارقة" },
  estMinutes: estimateMinutes(sections),
  sections,
};
