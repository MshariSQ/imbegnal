import type { Lesson, LessonSection } from "../types";
import { estimateMinutes } from "./estimate";

// Large inputs are generated here (not pasted) so the file stays readable; the expected
// outputs below were computed independently and are checked by the unit tests.
const bigTwoSum = (() => {
  const a = Array.from({ length: 3000 }, (_, i) => (i * 7919 + 13) % 100003);
  return `${a.length} ${a[1200] + a[2500]}\n${a.join(" ")}\n`;
})();

const bigAnagrams = (() => {
  const perms = (s: string): string[] =>
    s.length <= 1 ? [s] : [...s].flatMap((c, i) => perms(s.slice(0, i) + s.slice(i + 1)).map((p) => c + p));
  // 120 arrangements of "stone" interleaved with 6 arrangements of "abc"
  const a = perms("stone");
  const b = perms("abc");
  const words = a.flatMap((w, i) => (i % 20 === 0 ? [w, b[i / 20]] : [w]));
  return `${words.length}\n${words.join(" ")}\n`;
})();

const sections: LessonSection[] = [
  {
    type: "text",
    body: {
      en: `## What you'll learn

- How **arrays** and **strings** are stored, and what is cheap or expensive about them
- How a **hash map** (dictionary) and a **hash set** give you lookups in O(1) on average
- The patterns that turn O(n²) ideas into O(n): **seen-set**, **frequency counting**, **canonical keys**, **prefix sums**, **sliding window**
- You will solve: two-sum, grouping anagrams and the longest substring without repeats`,
      ar: `## ماذا ستتعلم

- كيف تُخزَّن **المصفوفات** و**النصوص** وما الرخيص والمكلف فيها
- كيف تمنحك **hash map** (القاموس) و**hash set** بحثاً بتعقيد O(1) في المتوسط
- الأنماط التي تحوّل أفكار O(n²) إلى O(n): **seen-set** و**عدّ التكرارات** و**المفاتيح القانونية** و**المجاميع التراكمية (prefix sums)** و**النافذة المنزلقة (sliding window)**
- ستحلّ: two-sum وتجميع الجُمل المقلوبة (anagrams) وأطول نص جزئي بلا تكرار`,
    },
  },
  {
    type: "text",
    body: {
      en: `## Lockers and a coat check 🧥

**An array is a hallway of numbered lockers.** You can walk straight to locker 57 without opening 1 to 56, so reading \`a[57]\` is instant: **O(1)**. But if you want to squeeze a new locker into the middle of the hallway, every locker after it has to slide over one place: **O(n)**.

**A hash map is a coat check.** You hand over your coat with the name "Sara". The attendant does not search the whole rack: a fixed rule turns "Sara" into a hook number (say 7) and the coat is right there. Anyone can later say "Sara" and get the coat back immediately, and it does not matter whether the cloakroom holds 10 coats or 10 million.

That one trick, **computing where to look from the thing you are looking for**, is behind most of the speed-ups in this lesson.`,
      ar: `## خزائن مرقّمة ومكتب لحفظ المعاطف 🧥

**المصفوفة ممرّ من الخزائن المرقّمة.** تستطيع أن تمشي مباشرة إلى الخزانة 57 دون أن تفتح الخزائن من 1 إلى 56، لذا قراءة \`a[57]\` فورية: **O(1)**. لكن إن أردت حشر خزانة جديدة في منتصف الممر فعلى كل خزانة بعدها أن تنزاح مكاناً واحداً: **O(n)**.

**أما الـ hash map فهي مكتب حفظ المعاطف.** تسلّم معطفك باسم "Sara". الموظف لا يفتّش الرفّ كله: قاعدة ثابتة تحوّل "Sara" إلى رقم علّاقة (لنقل 7) والمعطف هناك مباشرة. ويستطيع أي شخص لاحقاً أن يقول "Sara" ويستلم المعطف فوراً، ولا فرق إن كان المكتب يحفظ 10 معاطف أو 10 ملايين.

هذه الحيلة الواحدة، **أن تحسب مكان البحث من الشيء الذي تبحث عنه**، هي وراء معظم التسريعات في هذا الدرس.`,
    },
  },
  {
    type: "text",
    body: {
      en: `## Arrays and strings

An **array** stores items **next to each other in memory**, all the same size. The address of item \`i\` is simply \`start + i × size\`, so any index is reached in one step.

- **Read or write \`a[i]\`:** O(1)
- **Append at the end:** O(1) **amortised** (a Python \`list\`, JavaScript \`Array\` and Java \`ArrayList\` are *dynamic arrays*: when full they allocate a bigger block and copy once in a while)
- **Insert or delete in the middle or at the front:** O(n), because items shift
- **Search for a value in an unsorted array:** O(n)

A **string** is an array of characters with extra rules. In Python, JavaScript and Java strings are **immutable**: you cannot change one character in place, every "change" builds a new string. Comparing or hashing a string costs time proportional to its length, so "O(1) lookup" really means O(1) for short keys.

**Two habits that save you:**

- Decide whether your indices are **0-based** and whether a range is **inclusive** (\`a[l..r]\`) or half-open (\`a[l:r]\`, which excludes \`r\`). Most off-by-one bugs live here.
- Think about the **empty** and **one-element** array before you write the loop.`,
      ar: `## المصفوفات والنصوص

**المصفوفة** تخزّن العناصر **متجاورة في الذاكرة**، كلها بالحجم نفسه. وعنوان العنصر \`i\` هو ببساطة \`البداية + i × الحجم\`، فيُوصَل إلى أي فهرس بخطوة واحدة.

- **قراءة أو كتابة \`a[i]\`:** O(1)
- **الإضافة في النهاية:** O(1) **مُهلَكة (amortised)** (قائمة Python و\`Array\` في JavaScript و\`ArrayList\` في Java مصفوفات *ديناميكية*: حين تمتلئ تحجز كتلة أكبر وتنسخ إليها من حين لآخر)
- **الإدراج أو الحذف في المنتصف أو في البداية:** O(n) لأن العناصر تنزاح
- **البحث عن قيمة في مصفوفة غير مرتّبة:** O(n)

**النص (string)** مصفوفة من المحارف مع قواعد إضافية. في Python وJavaScript وJava النصوص **غير قابلة للتعديل (immutable)**: لا يمكنك تغيير حرف في مكانه، وكل "تعديل" يبني نصاً جديداً. ومقارنة النص أو حساب hash له تكلّف زمناً يتناسب مع طوله، لذا فعبارة "بحث O(1)" تعني فعلاً O(1) للمفاتيح القصيرة.

**عادتان تنقذانك:**

- حدّد هل فهارسك **تبدأ من 0** وهل المجال **شامل** (\`a[l..r]\`) أم نصف مفتوح (\`a[l:r]\` الذي يستثني \`r\`). معظم أخطاء "الواحد الزائد" تسكن هنا.
- فكّر في المصفوفة **الفارغة** وفي مصفوفة **العنصر الواحد** قبل أن تكتب الحلقة.`,
    },
  },
  {
    type: "text",
    body: {
      en: `## Hash maps and hash sets

A **hash map** stores **key → value** pairs. A **hash set** stores just keys and answers "is this in here?".

How it works, simply: a **hash function** turns the key into a big integer; the table uses \`integer mod table size\` as the slot. Two different keys can land in the same slot (a **collision**); the table copes (by keeping a small list per slot, or by probing for a free slot) and grows when it gets crowded. With a good hash function:

- **Insert, lookup, delete:** **O(1) on average** (worst case O(n) if everything collides, which good implementations make very unlikely)
- **Space:** O(n)

**Names in different languages:** Python \`dict\` and \`set\` · JavaScript \`Map\` and \`Set\` · Java \`HashMap\` and \`HashSet\` · C++ \`unordered_map\` and \`unordered_set\` · Go \`map\` · Rust \`HashMap\` and \`HashSet\`.

**Things to remember:**

- Keys must be **immutable (hashable)**. In Python a tuple \`(2, 3)\` can be a key, a list \`[2, 3]\` cannot, because changing it would change its hash.
- **Do not rely on the order** of a set, or of a map in languages that do not promise it. Sort before printing when order matters.
- Ask for what you need only once: \`if k in d: d[k]\` hashes twice; \`d.get(k)\` hashes once.

**Pattern 1, frequency counting.** To count how often each item occurs, walk once and bump a counter per key. In Python that is \`collections.Counter\`; elsewhere, \`counts[x] = counts.get(x, 0) + 1\`.

**Pattern 2, the seen-set (complement lookup).** To find two numbers that add up to \`target\`, process the list left to right. For each \`x\` the partner you need is \`target - x\`. Ask the map "have I already seen that partner?". If yes, you are done. If no, remember \`x\` and move on. One pass: **O(n) time, O(n) space**, instead of trying all pairs in O(n²).`,
      ar: `## جداول Hash والمجموعات (Hash Sets)

الـ **hash map** تخزّن أزواج **مفتاح ← قيمة**. والـ **hash set** تخزّن المفاتيح فقط وتجيب عن سؤال "هل هذا موجود هنا؟".

كيف تعمل ببساطة: **دالة hash** تحوّل المفتاح إلى عدد صحيح كبير، ويستخدم الجدول \`العدد mod حجم الجدول\` كموضع. قد يقع مفتاحان مختلفان في الموضع نفسه (**تصادم collision**)؛ فيتعامل الجدول مع ذلك (بقائمة صغيرة في كل موضع، أو بالبحث عن موضع شاغر) ويكبر حين يزدحم. ومع دالة hash جيدة:

- **الإدراج والبحث والحذف:** **O(1) في المتوسط** (وفي أسوأ الحالات O(n) إن تصادم كل شيء، وهو ما تجعله التطبيقات الجيدة بعيد الاحتمال جداً)
- **المساحة:** O(n)

**الأسماء في اللغات المختلفة:** Python: \`dict\` و\`set\` · JavaScript: \`Map\` و\`Set\` · Java: \`HashMap\` و\`HashSet\` · C++: \`unordered_map\` و\`unordered_set\` · Go: \`map\` · Rust: \`HashMap\` و\`HashSet\`.

**أمور يجب تذكّرها:**

- يجب أن تكون المفاتيح **غير قابلة للتعديل (hashable)**. في Python يصلح الـ tuple \`(2, 3)\` مفتاحاً، ولا تصلح القائمة \`[2, 3]\` لأن تعديلها يغيّر قيمة hash الخاصة بها.
- **لا تعتمد على ترتيب** الـ set، ولا على ترتيب الـ map في اللغات التي لا تضمنه. رتّب قبل الطباعة حين يهمّ الترتيب.
- اسأل عمّا تحتاجه مرة واحدة فقط: \`if k in d: d[k]\` تحسب hash مرتين؛ أما \`d.get(k)\` فتحسبه مرة واحدة.

**النمط 1: عدّ التكرارات.** لتعدّ كم مرة يظهر كل عنصر، امشِ مرة واحدة وزد عدّاداً لكل مفتاح. في Python تفعل ذلك \`collections.Counter\`؛ وفي غيرها: \`counts[x] = counts.get(x, 0) + 1\`.

**النمط 2: مجموعة المرئيات (البحث عن المتمّم).** لإيجاد عددين مجموعهما \`target\` عالج القائمة من اليسار إلى اليمين. لكل \`x\` الشريك الذي تحتاجه هو \`target - x\`. اسأل الـ map: "هل رأيت هذا الشريك من قبل؟". إن نعم فقد انتهيت. وإن لا فتذكّر \`x\` وتابع. مرور واحد: **زمن O(n) ومساحة O(n)**، بدل تجربة كل الأزواج في O(n²).`,
    },
  },
  {
    type: "code-demo",
    lang: "python",
    code: `from collections import Counter

# Pattern 1: frequency counting
text = "the quick brown fox jumps over the lazy dog and the quick cat"
counts = Counter(text.split())
print("the appears", counts["the"], "times")
print("two most common:", counts.most_common(2))
print("a word that never appears:", counts["zebra"])   # a Counter returns 0, no KeyError

# A key must be hashable: a tuple works, a list does not.
visited = {(0, 0), (0, 1)}
print((0, 1) in visited, (5, 5) in visited)
try:
    visited.add([1, 2])
except TypeError as err:
    print("lists cannot be keys:", err)

# Two words are anagrams exactly when their sorted letters are equal.
for word in ["listen", "silent", "enlist", "google"]:
    print(word, "->", "".join(sorted(word)))
`,
    explanation: {
      en: "A Counter is a dict specialised for counting. Notice the sorted-letters key at the end: three different words share the same key. That idea powers the second lab.",
      ar: "الـ Counter هو dict مخصّص للعدّ. لاحظ مفتاح الحروف المرتّبة في النهاية: ثلاث كلمات مختلفة تشترك في المفتاح نفسه. هذه الفكرة هي أساس المختبر الثاني.",
    },
  },
  {
    type: "lab",
    id: "two-sum",
    lang: "javascript",
    prompt: {
      en: `**Two-sum.** Find two different positions whose values add up to a target.

**Input:** the first line has \`n target\`. The second line has \`n\` integers (they may be negative or repeat). At least one valid pair exists.

**Output:** the two 0-based positions \`i j\` with \`i < j\` and \`a[i] + a[j] == target\`. If several pairs exist, print the pair with the **smallest j**, and for that j the **smallest i**. (A one-pass hash map gives exactly that.)

**Example:** input \`4 9\` and \`2 7 11 15\` prints \`0 1\` because 2 + 7 = 9.

Use a Map from value to the first index it appeared at. Check the partner **before** inserting the current value, so a value never pairs with itself.`,
      ar: `**Two-sum.** أوجد موضعين مختلفين مجموع قيمتيهما يساوي هدفاً معيّناً.

**المدخل:** السطر الأول فيه \`n target\`. والسطر الثاني فيه \`n\` عدداً صحيحاً (قد تكون سالبة أو مكرّرة). يوجد زوج صالح واحد على الأقل.

**المخرج:** الموضعان \`i j\` (يبدآن من 0) مع \`i < j\` و\`a[i] + a[j] == target\`. إن وُجد أكثر من زوج فاطبع الزوج ذا **أصغر j**، وفيه **أصغر i**. (مرور واحد بـ hash map يعطيك ذلك تماماً.)

**مثال:** المدخل \`4 9\` و\`2 7 11 15\` يطبع \`0 1\` لأن 2 + 7 = 9.

استخدم Map من القيمة إلى أول فهرس ظهرت فيه. افحص الشريك **قبل** إدراج القيمة الحالية حتى لا تُزاوَج القيمة مع نفسها.`,
    },
    starterCode: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const [n, target] = lines[0].split(" ").map(Number);
const a = lines[1].split(" ").map(Number);

// TODO: find i < j with a[i] + a[j] === target (smallest j, then smallest i).
// Walk j from left to right; keep a Map from value to the first index where it appeared.
// For each a[j], ask the Map for the partner target - a[j] BEFORE inserting a[j].
let i = 0;
let j = 0;

console.log(i + " " + j);
`,
    solution: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const [n, target] = lines[0].split(" ").map(Number);
const a = lines[1].split(" ").map(Number);

const firstIndex = new Map(); // value -> first index where it appeared

for (let j = 0; j < n; j++) {
  const partner = target - a[j];
  if (firstIndex.has(partner)) {
    console.log(firstIndex.get(partner) + " " + j);
    break;
  }
  // insert only after checking, and keep the earliest index
  if (!firstIndex.has(a[j])) firstIndex.set(a[j], j);
}
`,
    hints: [
      { en: "For each a[j] the partner you need is target - a[j]. Ask yourself: have I already seen that value?", ar: "لكل a[j] الشريك الذي تحتاجه هو target - a[j]. اسأل نفسك: هل رأيت هذه القيمة من قبل؟" },
      { en: "Keep a Map of value → index. Check map.has(partner) first; only then do map.set(a[j], j).", ar: "احتفظ بـ Map من القيمة إلى الفهرس. افحص map.has(partner) أولاً؛ ثم نفّذ map.set(a[j], j)." },
      { en: "Print map.get(partner) and j, then stop. For repeated values keep the earliest index: set only when the value is not already in the map.", ar: "اطبع map.get(partner) ثم j وتوقف. وللقيم المكررة احتفظ بأبكر فهرس: أدرج فقط إن لم تكن القيمة موجودة في الـ map." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "4 9\n2 7 11 15\n", expected: "0 1" },
      { name: { en: "The pair is at the end", ar: "الزوج في النهاية" }, stdin: "3 6\n3 2 4\n", expected: "1 2" },
      { name: { en: "The same value twice", ar: "القيمة نفسها مرتين" }, stdin: "2 6\n3 3\n", expected: "0 1" },
      { name: { en: "Negative numbers and a zero target", ar: "أعداد سالبة وهدف صفر" }, stdin: "5 0\n-3 4 3 90 -1\n", expected: "0 2" },
      { name: { en: "Several pairs: the one that completes first", ar: "عدة أزواج: التي تكتمل أولاً" }, stdin: "6 8\n1 4 4 4 3 5\n", expected: "1 2" },
      { name: { en: "3,000 numbers", ar: "3,000 رقم" }, stdin: bigTwoSum, expected: "1849 1851" },
    ],
    sampleInput: "4 9\n2 7 11 15\n",
  },
  {
    type: "text",
    body: {
      en: `## Canonical keys and prefix sums

**Pattern 3, canonical keys.** To group things that are "the same up to rearranging", compute a **canonical form** that is identical for every member of a group, and use it as the map key. Two words are **anagrams** when their sorted letters are equal, so \`"tea"\`, \`"eat"\` and \`"ate"\` all map to the key \`"aet"\`. A \`dict\` from key to list of words then groups them in one pass. (Another common key: a tuple of letter counts.)

**Pattern 4, prefix sums.** If you must answer many questions of the form "what is the sum of \`a[l..r]\`?", don't loop each time. Precompute once:

\`\`\`
prefix[0] = 0
prefix[i + 1] = prefix[i] + a[i]
sum(a[l..r]) = prefix[r + 1] - prefix[l]
\`\`\`

Preparation is O(n), then **every query is O(1)**. The idea extends: with a hash map from "prefix sum seen so far" to "how often", you can count subarrays with a given sum in a single pass. The same trick works with products, XOR and 2D grids.`,
      ar: `## المفاتيح القانونية والمجاميع التراكمية

**النمط 3: المفاتيح القانونية.** لتجمّع أشياء "متماثلة حتى إعادة الترتيب" احسب **صيغة قانونية** تكون واحدة لكل أفراد المجموعة، واستخدمها مفتاحاً في الـ map. الكلمتان **مقلوبتان (anagrams)** إذا تساوت حروفهما بعد الترتيب، فالكلمات \`"tea"\` و\`"eat"\` و\`"ate"\` كلها تُنتج المفتاح \`"aet"\`. ثم يجمّعها \`dict\` من المفتاح إلى قائمة كلمات في مرور واحد. (مفتاح شائع آخر: tuple بعدد تكرارات كل حرف.)

**النمط 4: المجاميع التراكمية (prefix sums).** إن كان عليك الإجابة عن أسئلة كثيرة من نوع "ما مجموع \`a[l..r]\`؟" فلا تكرّر الحلقة في كل مرة. احسب مسبقاً مرة واحدة:

\`\`\`
prefix[0] = 0
prefix[i + 1] = prefix[i] + a[i]
sum(a[l..r]) = prefix[r + 1] - prefix[l]
\`\`\`

التحضير O(n)، ثم **كل استعلام O(1)**. وتمتدّ الفكرة: بربط hash map من "المجموع التراكمي الذي مرّ بي" إلى "كم مرة"، تستطيع عدّ المصفوفات الجزئية ذات مجموع معيّن في مرور واحد. والحيلة نفسها تصلح مع الجداء وXOR والشبكات ثنائية الأبعاد.`,
    },
  },
  {
    type: "code-demo",
    lang: "js",
    code: `const a = [3, 1, 4, 1, 5, 9, 2, 6];

// prefix[i] = sum of the first i numbers
const prefix = [0];
for (const x of a) prefix.push(prefix[prefix.length - 1] + x);
console.log("prefix:", prefix.join(" "));

// sum of a[l..r], both ends included, in O(1)
function rangeSum(l, r) {
  return prefix[r + 1] - prefix[l];
}

console.log("a[2..5] =", rangeSum(2, 5));   // 4 + 1 + 5 + 9
console.log("a[0..7] =", rangeSum(0, 7));   // everything
console.log("a[3..3] =", rangeSum(3, 3));   // a single element
`,
    explanation: {
      en: "Build the table once, then any range is one subtraction. Change a to your own numbers and check a few ranges by hand.",
      ar: "ابنِ الجدول مرة واحدة، ثم يصبح أي مجال عملية طرح واحدة. غيّر a إلى أرقامك وتحقّق من بعض المجالات يدوياً.",
    },
  },
  {
    type: "lab",
    id: "group-anagrams",
    lang: "python",
    prompt: {
      en: `**Group the anagrams.** Words are anagrams when they use exactly the same letters.

**Input:** the first line has \`n\`. The second line has \`n\` lowercase words separated by spaces. Words can repeat.

**Output:** one line per group. Inside a line, list the group's words **sorted alphabetically** (a repeated word appears as many times as in the input), separated by one space. Print the lines **sorted by each line's first word**.

**Example:** input \`6\` and \`eat tea tan ate nat bat\` prints
\`\`\`
ate eat tea
bat
nat tan
\`\`\`
Use a dict whose key is the word's sorted letters.`,
      ar: `**جمّع الكلمات المقلوبة (anagrams).** الكلمتان مقلوبتان إذا استخدمتا الحروف نفسها تماماً.

**المدخل:** السطر الأول فيه \`n\`. والسطر الثاني فيه \`n\` كلمة بأحرف صغيرة تفصل بينها مسافات. قد تتكرر الكلمات.

**المخرج:** سطر لكل مجموعة. داخل السطر اكتب كلمات المجموعة **مرتّبة أبجدياً** (والكلمة المكررة تظهر بعدد مرّاتها في المدخل) تفصل بينها مسافة واحدة. واطبع الأسطر **مرتّبة حسب الكلمة الأولى في كل سطر**.

**مثال:** المدخل \`6\` و\`eat tea tan ate nat bat\` يطبع
\`\`\`
ate eat tea
bat
nat tan
\`\`\`
استخدم dict مفتاحه حروف الكلمة مرتّبة.`,
    },
    starterCode: `import sys

data = sys.stdin.read().split()
n = int(data[0])
words = data[1:1 + n]

# TODO: group the words that are anagrams of each other.
# 1. Build a dict: key = "".join(sorted(word)), value = list of words with that key.
# 2. Sort the words inside each group, then sort the groups by their first word.
# 3. Print one group per line, words separated by a single space.
for word in words:
    print(word)
`,
    solution: `import sys

data = sys.stdin.read().split()
n = int(data[0])
words = data[1:1 + n]

groups = {}
for word in words:
    key = "".join(sorted(word))                # same letters -> same key
    groups.setdefault(key, []).append(word)

result = [sorted(group) for group in groups.values()]
result.sort(key=lambda group: group[0])

for group in result:
    print(" ".join(group))
`,
    hints: [
      { en: "Anagrams share the same sorted letters: sorted('tea') and sorted('eat') are both ['a', 'e', 't'].", ar: "الكلمات المقلوبة تشترك في الحروف المرتّبة نفسها: sorted('tea') وsorted('eat') كلتاهما ['a', 'e', 't']." },
      { en: "Use groups.setdefault(key, []).append(word) to collect the words under each key.", ar: "استخدم groups.setdefault(key, []).append(word) لجمع الكلمات تحت كل مفتاح." },
      { en: "Sort each group, then sort the list of groups with key=lambda g: g[0], and join each with ' '.", ar: "رتّب كل مجموعة، ثم رتّب قائمة المجموعات بـ key=lambda g: g[0]، وادمج كل مجموعة بـ ' '." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "6\neat tea tan ate nat bat\n", expected: "ate eat tea\nbat\nnat tan", mode: "lines" },
      { name: { en: "A single word", ar: "كلمة واحدة" }, stdin: "1\nhello\n", expected: "hello", mode: "lines" },
      { name: { en: "No anagrams at all", ar: "لا توجد كلمات مقلوبة" }, stdin: "3\ncat dog bird\n", expected: "bird\ncat\ndog", mode: "lines" },
      { name: { en: "Repeated words stay repeated", ar: "الكلمات المكررة تبقى مكررة" }, stdin: "4\nabc cab abc bca\n", expected: "abc abc bca cab", mode: "lines" },
      { name: { en: "Single letters", ar: "حروف مفردة" }, stdin: "5\nb a b a c\n", expected: "a a\nb b\nc", mode: "lines" },
      { name: { en: "126 words in two big groups", ar: "126 كلمة في مجموعتين كبيرتين" }, stdin: bigAnagrams, expected: "abc acb bac bca cab cba\nenost enots ensot ensto entos entso eonst eonts eosnt eostn eotns eotsn esnot esnto esont esotn estno eston etnos etnso etons etosn etsno etson neost neots nesot nesto netos netso noest noets noset noste notes notse nseot nseto nsoet nsote nsteo nstoe nteos nteso ntoes ntose ntseo ntsoe oenst oents oesnt oestn oetns oetsn onest onets onset onste ontes ontse osent osetn osnet osnte osten ostne otens otesn otnes otnse otsen otsne senot sento seont seotn setno seton sneot sneto snoet snote snteo sntoe soent soetn sonet sonte soten sotne steno steon stneo stnoe stoen stone tenos tenso teons teosn tesno teson tneos tneso tnoes tnose tnseo tnsoe toens toesn tones tonse tosen tosne tseno tseon tsneo tsnoe tsoen tsone", mode: "lines" },
    ],
    sampleInput: "6\neat tea tan ate nat bat\n",
  },
  {
    type: "text",
    body: {
      en: `## Sliding window and two pointers

**Pattern 5, sliding window.** When the question is about a **contiguous piece** of an array or string ("longest substring such that...", "shortest run with sum at least..."), keep two indices, \`start\` and \`i\`, that mark a window. Grow the window by moving \`i\`; whenever the window breaks the rule, move \`start\` forward until it is valid again.

It looks like a loop inside a loop, but **each index only moves forward**: \`start\` and \`i\` each travel at most n steps, so the total work is **O(n)**, not O(n²).

**Longest substring without repeating characters.** Keep a map from character to the **last index where it was seen**. When the next character \`c\` was last seen at position \`p\` **inside the current window** (\`p >= start\`), jump the window's start to \`p + 1\`. The window \`[start, i]\` never contains a repeat, so its length \`i - start + 1\` is a candidate for the answer.

\`\`\`
"abcabcbb"
 abc    -> window "abc" (3)
 abca   -> 'a' was at 0, start moves to 1 -> window "bca" (3)
 ...
answer 3
\`\`\`

**Two pointers** is the cousin for **sorted** data: one pointer at each end, moving inward depending on a comparison. For example, "do two numbers in this sorted array add up to the target?" runs in O(n) with no hash map: if the sum is too small move the left pointer right, if too big move the right pointer left.

Watch the traps: a repeat that sits **before** the window must be ignored (the string \`"abba"\` catches that bug), and never let \`start\` move backwards.`,
      ar: `## النافذة المنزلقة والمؤشران

**النمط 5: النافذة المنزلقة (sliding window).** حين يتعلق السؤال بـ**قطعة متصلة** من مصفوفة أو نص ("أطول نص جزئي بحيث..."، "أقصر مقطع مجموعه لا يقل عن...") احتفظ بمؤشرين، \`start\` و\`i\`، يحدّدان نافذة. وسّع النافذة بتحريك \`i\`؛ وكلما كسرت النافذة القاعدة حرّك \`start\` للأمام حتى تصح من جديد.

يبدو الأمر كحلقة داخل حلقة، لكن **كل مؤشر يتحرك للأمام فقط**: \`start\` و\`i\` يقطع كل منهما n خطوة على الأكثر، فمجموع العمل **O(n)** لا O(n²).

**أطول نص جزئي بلا محارف مكررة.** احتفظ بـ map من المحرف إلى **آخر فهرس رُئي فيه**. حين يكون المحرف التالي \`c\` قد رُئي آخر مرة في الموضع \`p\` **داخل النافذة الحالية** (\`p >= start\`) فانقل بداية النافذة إلى \`p + 1\`. النافذة \`[start, i]\` لا تحتوي أي تكرار، فطولها \`i - start + 1\` مرشّح للجواب.

\`\`\`
"abcabcbb"
 abc    -> window "abc" (3)
 abca   -> 'a' was at 0, start moves to 1 -> window "bca" (3)
 ...
answer 3
\`\`\`

أما **المؤشران (two pointers)** فهما قريب هذا النمط مع البيانات **المرتّبة**: مؤشر عند كل طرف يتحركان نحو الداخل بحسب مقارنة. مثلاً، "هل يوجد عددان في هذه المصفوفة المرتّبة مجموعهما الهدف؟" تُحلّ في O(n) دون hash map: إن كان المجموع أصغر من اللازم حرّك المؤشر الأيسر لليمين، وإن كان أكبر حرّك الأيمن لليسار.

احذر الفخاخ: التكرار الواقع **قبل** النافذة يجب تجاهله (النص \`"abba"\` يكشف هذا الخطأ)، ولا تدع \`start\` يرجع إلى الوراء أبداً.`,
    },
  },
  {
    type: "lab",
    id: "longest-unique-run",
    lang: "rust",
    prompt: {
      en: `**Longest run without a repeat.** Read one line of text (it may contain spaces, and may be empty). Print the length of the longest **contiguous** substring in which **no character appears twice**.

**Example:** \`abcabcbb\` prints \`3\` (the substring \`abc\`). \`bbbbb\` prints \`1\`. \`pwwkew\` prints \`3\` (\`wke\`).

Use the sliding window: remember the last index of every character in a \`HashMap<char, usize>\`, and when you meet a character already inside the window, move \`start\` just past its previous position, but **never backwards**.`,
      ar: `**أطول مقطع بلا تكرار.** اقرأ سطراً واحداً من النص (قد يحتوي مسافات، وقد يكون فارغاً). اطبع طول أطول نص جزئي **متصل** لا يظهر فيه أي محرف مرتين.

**مثال:** \`abcabcbb\` يطبع \`3\` (النص \`abc\`). و\`bbbbb\` يطبع \`1\`. و\`pwwkew\` يطبع \`3\` (\`wke\`).

استخدم النافذة المنزلقة: تذكّر آخر فهرس لكل محرف في \`HashMap<char, usize>\`، وحين تقابل محرفاً موجوداً داخل النافذة فانقل \`start\` إلى ما بعد موضعه السابق مباشرة، لكن **لا ترجع إلى الوراء أبداً**.`,
    },
    starterCode: `use std::io::Read;

fn main() {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input).unwrap();
    let line = input.lines().next().unwrap_or("");

    // TODO: print the length of the longest substring of \`line\` with no repeated character.
    // Keep \`start\` (left edge of the window) and a HashMap<char, usize> with the last index of
    // each character; when a character repeats inside the window, move \`start\` just past it.
    let mut best = 0;
    for (i, _ch) in line.chars().enumerate() {
        best = i + 1; // placeholder: pretends the whole line is always fine
    }
    println!("{}", best);
}
`,
    solution: `use std::collections::HashMap;
use std::io::Read;

fn main() {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input).unwrap();
    let line = input.lines().next().unwrap_or("");

    let mut last_seen: HashMap<char, usize> = HashMap::new();
    let mut start = 0; // left edge of the window
    let mut best = 0;

    for (i, ch) in line.chars().enumerate() {
        if let Some(&prev) = last_seen.get(&ch) {
            if prev >= start {
                start = prev + 1; // skip past the earlier copy, never move backwards
            }
        }
        last_seen.insert(ch, i);
        best = best.max(i + 1 - start);
    }
    println!("{}", best);
}
`,
    hints: [
      { en: "The window is line[start..=i]. Its length is i + 1 - start. Update the best length after every character.", ar: "النافذة هي line[start..=i] وطولها i + 1 - start. حدّث أفضل طول بعد كل محرف." },
      { en: "If the current char was last seen at prev and prev >= start, it repeats inside the window: set start = prev + 1.", ar: "إن كان المحرف الحالي قد رُئي آخر مرة عند prev وكان prev >= start فهو متكرر داخل النافذة: اجعل start = prev + 1." },
      { en: "Always do last_seen.insert(ch, i) afterwards. The check prev >= start is what keeps 'abba' correct (answer 2).", ar: "نفّذ دائماً last_seen.insert(ch, i) بعد ذلك. والشرط prev >= start هو ما يُبقي 'abba' صحيحة (الجواب 2)." },
    ],
    tests: [
      { name: { en: "abcabcbb", ar: "abcabcbb" }, stdin: "abcabcbb\n", expected: "3" },
      { name: { en: "pwwkew: the window restarts", ar: "pwwkew: تبدأ النافذة من جديد" }, stdin: "pwwkew\n", expected: "3" },
      { name: { en: "Empty line", ar: "سطر فارغ" }, stdin: "\n", expected: "0" },
      { name: { en: "abba: a repeat before the window is ignored", ar: "abba: التكرار قبل النافذة يُتجاهل" }, stdin: "abba\n", expected: "2" },
      { name: { en: "Spaces count as characters", ar: "المسافات تُعدّ محارف" }, stdin: "abc abc\n", expected: "4" },
      { name: { en: "20,800 characters", ar: "20,800 محرف" }, stdin: "abcdefghijklmnopqrstuvwxyz".repeat(800) + "\n", expected: "26" },
    ],
    sampleInput: "abcabcbb\n",
  },
  {
    type: "quiz",
    questions: [
      {
        q: {
          en: "Why does Python raise an error for my_dict[[1, 2]] = 'x' but accept my_dict[(1, 2)] = 'x'?",
          ar: "لماذا يرفع Python خطأً عند my_dict[[1, 2]] = 'x' ويقبل my_dict[(1, 2)] = 'x'؟",
        },
        choices: [
          { en: "Lists are too long to be hashed", ar: "القوائم أطول من أن تُحسب لها قيمة hash" },
          { en: "Keys must be hashable, and a mutable list could change its hash after insertion", ar: "يجب أن تكون المفاتيح hashable، والقائمة القابلة للتعديل قد تتغير قيمة hash لها بعد الإدراج" },
          { en: "Only numbers and tuples can ever be dictionary keys", ar: "لا يصلح مفتاحاً في القاموس إلا الأعداد والـ tuples" },
        ],
        answer: 1,
        explain: {
          en: "The dictionary finds a key by its hash. If a key could be modified, its hash would change and the entry would be lost in the wrong slot. Immutable values (numbers, strings, tuples of those) are safe keys.",
          ar: "يجد القاموس المفتاح عن طريق hash الخاص به. لو أمكن تعديل المفتاح لتغيّرت قيمة hash وضاع الإدخال في موضع خاطئ. القيم غير القابلة للتعديل (الأعداد والنصوص والـ tuples منها) مفاتيح آمنة.",
        },
      },
      {
        q: {
          en: "You solve two-sum with a hash map in one pass. What are the time and extra space?",
          ar: "تحلّ two-sum بـ hash map في مرور واحد. ما الزمن والمساحة الإضافية؟",
        },
        choices: [
          { en: "O(n²) time, O(1) space", ar: "زمن O(n²) ومساحة O(1)" },
          { en: "O(n log n) time, O(1) space", ar: "زمن O(n log n) ومساحة O(1)" },
          { en: "O(n) time, O(n) space", ar: "زمن O(n) ومساحة O(n)" },
          { en: "O(1) time, O(n) space", ar: "زمن O(1) ومساحة O(n)" },
        ],
        answer: 2,
        explain: {
          en: "Each element is visited once with O(1) average map operations (O(n) time), and the map may end up holding all n values (O(n) space). You bought speed with memory.",
          ar: "يُزار كل عنصر مرة واحدة بعمليات map متوسطها O(1) (زمن O(n))، وقد ينتهي الـ map بتخزين كل القيم n (مساحة O(n)). اشتريت السرعة بالذاكرة.",
        },
      },
      {
        q: {
          en: "With the prefix array built once, how do you get the sum of a[l..r] (both ends included)?",
          ar: "بعد بناء مصفوفة prefix مرة واحدة، كيف تحصل على مجموع a[l..r] (الطرفان مشمولان)؟",
        },
        choices: [
          { en: "prefix[r + 1] - prefix[l]", ar: "prefix[r + 1] - prefix[l]" },
          { en: "prefix[r] - prefix[l]", ar: "prefix[r] - prefix[l]" },
          { en: "prefix[r] - prefix[l - 1]", ar: "prefix[r] - prefix[l - 1]" },
        ],
        answer: 0,
        explain: {
          en: "With prefix[0] = 0 and prefix[i] holding the sum of the first i items, prefix[r + 1] is a[0..r] and prefix[l] is a[0..l-1]. Their difference is exactly a[l..r]. The leading 0 also makes l = 0 work with no special case.",
          ar: "مع prefix[0] = 0 وأن prefix[i] يحمل مجموع أول i عنصراً، فإن prefix[r + 1] هو a[0..r] وprefix[l] هو a[0..l-1]. وفرقهما هو a[l..r] بالضبط. كما أن الصفر في البداية يجعل l = 0 يعمل دون حالة خاصة.",
        },
      },
      {
        q: {
          en: "A sliding-window solution has a while loop inside a for loop. Why can it still be O(n)?",
          ar: "في حلّ النافذة المنزلقة حلقة while داخل حلقة for. فلماذا يبقى O(n)؟",
        },
        choices: [
          { en: "Because the inner loop always runs only once", ar: "لأن الحلقة الداخلية تعمل مرة واحدة دائماً" },
          { en: "Because each index only moves forward, so the two pointers travel at most n steps each in total", ar: "لأن كل مؤشر يتحرك للأمام فقط، فيقطع كل من المؤشرين n خطوة على الأكثر في المجموع" },
          { en: "Because Big-O ignores inner loops", ar: "لأن Big-O يتجاهل الحلقات الداخلية" },
          { en: "It is not O(n); it is always O(n²)", ar: "ليس O(n)؛ بل هو دائماً O(n²)" },
        ],
        answer: 1,
        explain: {
          en: "Complexity is about total work. The inner loop only advances start, which never goes backwards, so across the entire run start moves at most n times. Total: n steps for i plus n for start, which is O(n).",
          ar: "التعقيد يتعلق بإجمالي العمل. الحلقة الداخلية لا تحرّك إلا start الذي لا يرجع للخلف، فعلى امتداد التنفيذ كله يتحرك start n مرة على الأكثر. المجموع: n خطوة لـ i وn لـ start، أي O(n).",
        },
      },
      {
        q: {
          en: "Which key puts every anagram of a word in the same group?",
          ar: "أي مفتاح يضع كل الكلمات المقلوبة لكلمة ما في المجموعة نفسها؟",
        },
        choices: [
          { en: "The word's length", ar: "طول الكلمة" },
          { en: "The word's first letter", ar: "أول حرف في الكلمة" },
          { en: "The word's letters sorted", ar: "حروف الكلمة مرتّبة" },
          { en: "The word's letters in reverse order", ar: "حروف الكلمة بترتيب معكوس" },
        ],
        answer: 2,
        explain: {
          en: "Anagrams use the same letters in a different order, so sorting the letters removes the order and leaves an identical key. Length or first letter would also merge words that are not anagrams, and reversing keeps the order problem.",
          ar: "الكلمات المقلوبة تستخدم الحروف نفسها بترتيب مختلف، فترتيب الحروف يُزيل الترتيب ويترك مفتاحاً متطابقاً. أما الطول أو الحرف الأول فسيدمجان كلمات ليست مقلوبة، والعكس يُبقي مشكلة الترتيب.",
        },
      },
    ],
  },
  {
    type: "text",
    body: {
      en: `## Summary

- An **array** gives O(1) access by index but O(n) inserts in the middle and O(n) searches when unsorted. Strings are arrays of characters, immutable in most languages.
- A **hash map / set** gives **O(1) average** insert, lookup and delete. Keys must be immutable, and you should not depend on iteration order.
- The patterns to recognise: **frequency counting**, **seen-set / complement lookup** (two-sum), **canonical keys** (anagrams), **prefix sums** (O(1) range sums), **sliding window** (longest/shortest contiguous piece) and **two pointers** (sorted data).
- Many "try all pairs" solutions become one pass once you ask "what have I already seen that would help right now?".

**Practice next:** count how many subarrays have sum exactly k (prefix sums plus a hash map), find the first non-repeating character of a string, and check whether two strings are anagrams using a frequency table. Then continue with **Linked Lists, Stacks & Queues**, and **Sorting & Binary Search**.`,
      ar: `## الخلاصة

- **المصفوفة** تمنح وصولاً O(1) بالفهرس لكن الإدراج في المنتصف O(n) والبحث O(n) إن لم تكن مرتّبة. والنصوص مصفوفات محارف، غير قابلة للتعديل في أغلب اللغات.
- الـ **hash map / set** تمنح إدراجاً وبحثاً وحذفاً بتعقيد **O(1) في المتوسط**. يجب أن تكون المفاتيح غير قابلة للتعديل، ولا تعتمد على ترتيب التكرار.
- الأنماط التي عليك تمييزها: **عدّ التكرارات** و**مجموعة المرئيات / البحث عن المتمّم** (two-sum) و**المفاتيح القانونية** (anagrams) و**المجاميع التراكمية** (مجاميع المجالات في O(1)) و**النافذة المنزلقة** (أطول/أقصر قطعة متصلة) و**المؤشران** (البيانات المرتّبة).
- كثير من حلول "جرّب كل الأزواج" تصبح مروراً واحداً حين تسأل: "ما الذي رأيته سابقاً وينفعني الآن؟".

**تدرّب بعد ذلك:** عُدّ المصفوفات الجزئية التي مجموعها k بالضبط (prefix sums مع hash map)، وأوجد أول محرف غير متكرر في نص، وتحقق هل نصّان مقلوبان باستخدام جدول تكرارات. ثم تابع إلى **القوائم المترابطة والمكدّسات والطوابير**، وإلى **الفرز والبحث الثنائي**.`,
    },
  },
];

export const lesson: Lesson = {
  nodeId: "arrays-hashing",
  title: { en: "Arrays, Strings & Hash Maps: The Everyday Toolkit", ar: "المصفوفات والنصوص وHash Maps: صندوق الأدوات اليومي" },
  estMinutes: estimateMinutes(sections),
  sections,
};
