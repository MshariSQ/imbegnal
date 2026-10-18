import type { Lesson, LessonSection } from "../types";
import { estimateMinutes } from "./estimate";

// Large inputs are generated here (not pasted) so the file stays readable. Expected outputs are
// derived by methods that differ from the reference solutions (sorted arrays instead of heaps).

/** Index of the first element >= x in an ascending array (binary search). */
const lowerBound = (a: number[], x: number) => {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] >= x) hi = mid;
    else lo = mid + 1;
  }
  return lo;
};

// Heap lab: 3 000 pseudo-random commands, about two pushes (values 0-999, duplicates included) for
// every pop or peek. The expected output keeps an ascending array with binary-search insertion.
const heapCommands = Array.from({ length: 3000 }, (_, i) => {
  const r = (i * 7919 + 13) % 100003;
  if (r % 3 === 0) return r % 2 === 0 ? "pop" : "peek";
  return `push ${r % 1000}`;
});
const heapInput = `${heapCommands.length}\n${heapCommands.join("\n")}\n`;
const heapExpected = (() => {
  const sorted: number[] = [];
  const out: string[] = [];
  for (const c of heapCommands) {
    if (c.startsWith("push")) {
      const x = Number(c.slice(5));
      sorted.splice(lowerBound(sorted, x), 0, x);
    } else if (sorted.length === 0) {
      out.push("EMPTY");
    } else {
      out.push(String(sorted[0]));
      if (c === "pop") sorted.shift();
    }
  }
  return out.join("\n");
})();

// k-th largest lab: 2 500 pseudo-random values, k = 100. The expected output keeps the k largest
// values in an ascending array (binary-search insertion, drop the front when it grows past k).
const KTH_K = 100;
const kthValues = Array.from({ length: 2500 }, (_, i) => ((i * 104729 + 7) % 100019) % 100000);
const kthInput = `${kthValues.length} ${KTH_K}\n${kthValues.join(" ")}\n`;
const kthExpected = (() => {
  const top: number[] = [];
  return kthValues
    .map((x) => {
      top.splice(lowerBound(top, x), 0, x);
      if (top.length > KTH_K) top.shift();
      return top.length < KTH_K ? "-" : String(top[0]);
    })
    .join("\n");
})();

// Merge lab: 60 sorted lists of 50 values each. The expected output concatenates and sorts.
const mergeLists = Array.from({ length: 60 }, (_, li) => {
  let v = ((li * 7919) % 997) - 500;
  return Array.from({ length: 50 }, (_, j) => {
    v += ((li * 31 + j * 17) % 23) + (j % 5 === 0 ? 0 : 1); // non-decreasing, repeats allowed
    return v;
  });
});
const mergeInput = `${mergeLists.length}\n${mergeLists.map((l) => `${l.length} ${l.join(" ")}`).join("\n")}\n`;
const mergeExpected = mergeLists
  .flat()
  .sort((a, b) => a - b)
  .join(" ");

const sections: LessonSection[] = [
  {
    type: "text",
    body: {
      en: `## What you'll learn

- What a **priority queue** promises: it always hands you the smallest (or largest) item next
- How a **binary heap** keeps that promise in **O(log n)** using nothing but an array and the **heap order** rule
- **Push** (sift up), **pop** (sift down) and **heapify**, which builds a heap in O(n)
- How to use the heap in your language (Python \`heapq\`, Java \`PriorityQueue\`, C++ \`std::priority_queue\`) and avoid its traps
- Two classic patterns: **top-k** with a heap of size k, and **merging k sorted streams**
- You will write: your own min-heap, a running k-th largest tracker and a k-way merge`,
      ar: `## ماذا ستتعلم

- ماذا يَعِد به **طابور الأولوية (priority queue)**: أن يسلّمك دائماً أصغر عنصر (أو أكبره) في المرة التالية
- كيف تفي **الكومة الثنائية (binary heap)** بهذا الوعد في **O(log n)** بلا شيء سوى مصفوفة وقاعدة **ترتيب الكومة (heap order)**
- **الإضافة push** (التصعيد sift up) و**السحب pop** (التنزيل sift down) و**heapify** الذي يبني كومة في O(n)
- كيف تستخدم الكومة في لغتك (\`heapq\` في Python، و\`PriorityQueue\` في Java، و\`std::priority_queue\` في C++) وتتجنب فخاخها
- نمطان كلاسيكيان: **أكبر k عنصراً (top-k)** بكومة حجمها k، و**دمج k تدفقاً مرتّباً**
- ستكتب: كومة صغرى (min-heap) خاصة بك، ومتتبّعاً للقيمة الكبرى رقم k أثناء التدفق، ودمجاً لـ k قائمة`,
    },
  },
  {
    type: "text",
    body: {
      en: `## The emergency room

At a hospital emergency department, patients are not seen in the order they arrive. A nurse assigns each one an **urgency** (triage), and whenever a doctor becomes free the question is always the same: **who is the most urgent right now?** New patients keep arriving while others are being treated.

You could keep the waiting list **sorted** at all times, but then every arrival shifts the list. You could leave it **unsorted** and scan everyone each time a doctor is free. A **heap** sits in between: it keeps just enough order to answer "who is next?" instantly and to absorb a new arrival quickly.

The same question appears everywhere in software: an operating system choosing the next process to run, a simulation processing the next event in time order, a router sending high-priority packets first, a "top 10 trending" list, and Dijkstra's shortest-path algorithm, which you will meet in the next lesson.`,
      ar: `## قسم الطوارئ

في قسم الطوارئ بالمستشفى لا يُعاين المرضى بترتيب وصولهم. تمنح الممرضة كل مريض **درجة إلحاح** (الفرز الطبي triage)، وكلما أصبح طبيب متاحاً كان السؤال نفسه دائماً: **من الأشدّ إلحاحاً الآن؟** والمرضى الجدد يواصلون الوصول بينما يُعالَج غيرهم.

يمكنك أن تُبقي قائمة الانتظار **مرتّبة** طوال الوقت، لكن كل وصول جديد سيزيح القائمة حينها. ويمكنك أن تتركها **غير مرتّبة** وتفحص الجميع كلما تفرّغ طبيب. أما **الكومة (heap)** فتقف في الوسط: تحتفظ بقدر من الترتيب يكفي للإجابة عن سؤال "من التالي؟" فوراً ولاستيعاب الوافد الجديد بسرعة.

والسؤال نفسه يظهر في كل مكان في البرمجيات: نظام تشغيل يختار العملية التالية للتشغيل، ومحاكاة تعالج الحدث التالي بترتيبه الزمني، وموجّه يرسل الحزم ذات الأولوية العالية أولاً، وقائمة "الأكثر تداولاً"، وخوارزمية Dijkstra لأقصر المسارات التي ستلتقي بها في الدرس التالي.`,
    },
  },
  {
    type: "text",
    body: {
      en: `## Priority queues and the binary heap

A **priority queue** supports three operations: \`push\` an item, \`peek\` at the smallest, and \`pop\` (remove and return) the smallest. (A max-priority queue does the same for the largest.) The obvious implementations each make one operation slow:

\`\`\`
                   push        pop smallest    peek
unsorted array     O(1)        O(n)            O(n)
sorted array       O(n)        O(1)            O(1)
binary heap        O(log n)    O(log n)        O(1)
\`\`\`

**A binary heap is a complete binary tree stored in an array.** "Complete" means every level is full except possibly the last, which fills from the left. Because there are no gaps, the tree needs no pointers: with 0-based indexes,

- the **children** of index \`i\` are at \`2i + 1\` and \`2i + 2\`
- the **parent** of index \`i\` is at \`(i - 1) // 2\`

**Heap order (min-heap):** every parent is **less than or equal to** its children. So the smallest item is always at the root, index 0. Nothing is said about siblings or cousins: a heap is **not sorted**, and that freedom is what makes it cheap.

\`\`\`
              1
           /     \\
          3       2
         / \\     / \\
        7   4   5   9
       /
      8

index:  0  1  2  3  4  5  6  7
array: [1, 3, 2, 7, 4, 5, 9, 8]
\`\`\`

A complete tree with n nodes has height ⌊log₂ n⌋, and both operations walk a single root-to-leaf path:

- **push (sift up):** append the item at the end (the next free leaf), then, while it is smaller than its parent, swap it with the parent. Pushing 0 above: it starts at index 8 under the 7, swaps with 7, then 3, then 1, and becomes the root.
- **pop (sift down):** remember the root, move the **last** item to the root, then, while it is larger than one of its children, swap it with the **smaller** child (swapping with the larger one would put a large value above a small one). Popping from the array above: 8 moves to the root, swaps with 2 (the smaller child), then with 5, and stops: \`[2, 3, 5, 7, 4, 8, 9]\`.`,
      ar: `## طوابير الأولوية والكومة الثنائية

يدعم **طابور الأولوية** ثلاث عمليات: إضافة عنصر \`push\`، والنظر إلى الأصغر \`peek\`، وسحب الأصغر (حذفه وإعادته) \`pop\`. (وطابور الأولوية العظمى يفعل الشيء نفسه للأكبر.) والتنفيذات البديهية تجعل كل منها عملية واحدة بطيئة:

\`\`\`
                   push        pop smallest    peek
unsorted array     O(1)        O(n)            O(n)
sorted array       O(n)        O(1)            O(1)
binary heap        O(log n)    O(log n)        O(1)
\`\`\`

**الكومة الثنائية شجرة ثنائية مكتملة مخزّنة في مصفوفة.** و"مكتملة" تعني أن كل مستوى ممتلئ إلا الأخير ربما، وهو يمتلئ من اليسار. ولأنه لا فراغات فيها فلا تحتاج الشجرة إلى مؤشرات: مع فهارس تبدأ من 0،

- **ابنا** الفهرس \`i\` في \`2i + 1\` و\`2i + 2\`
- و**أب** الفهرس \`i\` في \`(i - 1) // 2\`

**ترتيب الكومة (الكومة الصغرى min-heap):** كل أب **أصغر من أبنائه أو يساويهم**. فيكون أصغر عنصر دائماً في الجذر، أي الفهرس 0. ولا يُشترط شيء بين الإخوة أو أبناء العمومة: فالكومة **ليست مرتّبة**، وهذه الحرية هي ما يجعلها رخيصة.

\`\`\`
              1
           /     \\
          3       2
         / \\     / \\
        7   4   5   9
       /
      8

index:  0  1  2  3  4  5  6  7
array: [1, 3, 2, 7, 4, 5, 9, 8]
\`\`\`

الشجرة المكتملة ذات n عقدة ارتفاعها ⌊log₂ n⌋، وكلتا العمليتين تمشي على مسار واحد من الجذر إلى ورقة:

- **الإضافة push (التصعيد sift up):** ضع العنصر في النهاية (الورقة الشاغرة التالية)، ثم ما دام أصغر من أبيه فبادله مع أبيه. إضافة 0 إلى الكومة أعلاه: يبدأ في الفهرس 8 تحت 7، فيبادل 7 ثم 3 ثم 1، ويصبح الجذر.
- **السحب pop (التنزيل sift down):** احفظ الجذر، وانقل العنصر **الأخير** إلى الجذر، ثم ما دام أكبر من أحد ابنيه فبادله مع الابن **الأصغر** (فمبادلته مع الأكبر تضع قيمة كبيرة فوق قيمة صغيرة). السحب من المصفوفة أعلاه: ينتقل 8 إلى الجذر، ويبادل 2 (الابن الأصغر)، ثم 5، ويتوقف: \`[2, 3, 5, 7, 4, 8, 9]\`.`,
    },
  },
  {
    type: "code-demo",
    lang: "python",
    code: `class MinHeap:
    def __init__(self):
        self.a = []

    def push(self, x):
        a = self.a
        a.append(x)                        # the new item starts as the last leaf
        i = len(a) - 1
        while i > 0 and a[(i - 1) // 2] > a[i]:
            p = (i - 1) // 2
            a[i], a[p] = a[p], a[i]        # sift up: swap with the parent
            i = p

    def pop(self):
        a = self.a
        top = a[0]
        last = a.pop()                     # remove the last leaf...
        if a:
            a[0] = last                    # ...and move it to the root
            i = 0
            while True:
                small, l, r = i, 2 * i + 1, 2 * i + 2
                if l < len(a) and a[l] < a[small]:
                    small = l
                if r < len(a) and a[r] < a[small]:
                    small = r
                if small == i:
                    break
                a[i], a[small] = a[small], a[i]   # sift down: swap with the SMALLER child
                i = small
        return top

h = MinHeap()
for x in [5, 3, 8, 1, 9, 2, 7]:
    h.push(x)
    print(f"push {x}: {h.a}")
print("pop, pop:", h.pop(), h.pop(), "->", h.a)
print("the rest in order:", [h.pop() for _ in range(len(h.a))])

import heapq
data = [5, 3, 8, 1, 9, 2, 7]
heapq.heapify(data)                        # O(n), in place
print("heapq.heapify:", data)
print("3 largest:", heapq.nlargest(3, [5, 3, 8, 1, 9, 2, 7]))

tasks = []                                 # (priority, counter, task): the counter breaks ties
for n, (prio, task) in enumerate([(2, "write tests"), (1, "fix outage"), (2, "review PR")]):
    heapq.heappush(tasks, (prio, n, task))
print("next task:", heapq.heappop(tasks)[2], "| then:", heapq.heappop(tasks)[2])
`,
    explanation: {
      en: "Watch the array after each push: the smallest value is always at index 0, yet [1, 3, 2, 5, 9, 8, 7] is not sorted (3 comes before 2). Popping returns the values in ascending order, which is heap sort in miniature. heapq works on a plain list with the same layout, and the counter in the task tuples decides between equal priorities in arrival order without ever comparing the task strings.",
      ar: "راقب المصفوفة بعد كل إضافة: أصغر قيمة دائماً في الفهرس 0، ومع ذلك فإن [1, 3, 2, 5, 9, 8, 7] ليست مرتّبة (3 يأتي قبل 2). والسحب يعيد القيم بترتيب تصاعدي، وهذا هو heap sort في صورة مصغّرة. وتعمل heapq على قائمة عادية بالتخطيط نفسه، والعدّاد في صفوف المهام يحسم بين الأولويات المتساوية بترتيب الوصول دون أن يقارن نصوص المهام أبداً.",
    },
  },
  {
    type: "text",
    body: {
      en: `## Heapify, heap sort and the heap in your language

**Heapify in O(n).** Building a heap with n pushes costs O(n log n). Robert Floyd's method (1964) is faster: put the items in the array as they are, then **sift down** every node that has children, from the last parent (\`n // 2 - 1\`) back to the root. Half the nodes are leaves and never move, a quarter move at most one level, an eighth at most two, and so on; the total is less than n swaps, so heapify is **O(n)**. Python's \`heapq.heapify\` documents exactly this: it transforms a list into a heap in place, in linear time.

**Heap sort** (J. W. J. Williams, 1964) heapifies, then pops n times: **O(n log n) in the worst case with O(1) extra space**. It is not stable, and in practice library sorts are usually faster, but it is a guaranteed-time fallback (introsort, behind many C++ \`std::sort\` implementations, switches to heap sort when quicksort recursion gets too deep).

**The heap in your language:**

- **Python \`heapq\`**: functions on a plain list, always a **min**-heap: \`heappush\`, \`heappop\`, \`heapify\`, \`heapreplace\`, \`heappushpop\`, \`nsmallest\`, \`nlargest\` and \`merge\`. For a max-heap, push \`-x\` (Python 3.14 added \`heappush_max\` and related functions, but negation works in every version). To store items that cannot be compared, or to break ties in insertion order, push tuples \`(priority, counter, item)\`, as the \`heapq\` documentation recommends.
- **Java \`PriorityQueue\`**: a min-heap by natural order or by a \`Comparator\`. Its documentation promises O(log n) for \`offer\` and \`poll\`, constant time for \`peek\`, but **linear** time for \`remove(Object)\` and \`contains\`. Iterating over it does not give sorted order.
- **C++ \`std::priority_queue\`**: a **max**-heap by default. For a min-heap write \`std::priority_queue<T, std::vector<T>, std::greater<T>>\`.
- **Rust \`BinaryHeap\`**: also a max-heap; wrap items in \`std::cmp::Reverse\` for a min-heap. **Go** offers \`container/heap\`, which runs on your own type once it implements five methods (\`Len\`, \`Less\`, \`Swap\`, \`Push\`, \`Pop\`).

**What heaps do not do:** find an arbitrary item, or change its priority, quickly. The common workaround is **lazy deletion**: push the item again with its new priority and, when an outdated entry is popped later, skip it. Dijkstra's algorithm uses exactly that trick.`,
      ar: `## heapify وheap sort والكومة في لغتك

**heapify في O(n).** بناء كومة بـ n عملية إضافة يكلّف O(n log n). وطريقة Robert Floyd (عام 1964) أسرع: ضع العناصر في المصفوفة كما هي، ثم **نزّل (sift down)** كل عقدة لها أبناء، من آخر أب (\`n // 2 - 1\`) رجوعاً إلى الجذر. نصف العقد أوراق لا تتحرك أبداً، وربعها يتحرك مستوى واحداً على الأكثر، وثُمنها مستويين على الأكثر، وهكذا؛ والمجموع أقل من n مبادلة، فيكون heapify بزمن **O(n)**. ووثائق \`heapq.heapify\` في Python تنصّ على ذلك تماماً: فهي تحوّل القائمة إلى كومة في مكانها، بزمن خطي.

أما **heap sort** (الذي قدّمه J. W. J. Williams عام 1964) فيطبّق heapify ثم يسحب n مرة: **O(n log n) في أسوأ الحالات مع مساحة إضافية O(1)**. وهو غير مستقرّ، ودوال الفرز في المكتبات أسرع منه عادةً عملياً، لكنه بديل مضمون الزمن (فخوارزمية introsort، التي تقف خلف كثير من تنفيذات \`std::sort\` في C++، تنتقل إلى heap sort حين يتعمّق التكرار الذاتي في quicksort أكثر من اللازم).

**الكومة في لغتك:**

- **\`heapq\` في Python**: دوال تعمل على قائمة عادية، وهي كومة **صغرى** دائماً: \`heappush\` و\`heappop\` و\`heapify\` و\`heapreplace\` و\`heappushpop\` و\`nsmallest\` و\`nlargest\` و\`merge\`. وللكومة العظمى أضف \`-x\` (أضافت Python 3.14 الدالة \`heappush_max\` ودوال مشابهة، لكن عكس الإشارة يعمل في كل الإصدارات). ولتخزين عناصر لا تقبل المقارنة، أو لحسم التعادل بترتيب الإضافة، أضف صفوفاً \`(priority, counter, item)\` كما توصي وثائق \`heapq\`.
- **\`PriorityQueue\` في Java**: كومة صغرى بالترتيب الطبيعي أو بمقارِن \`Comparator\`. وتَعِد وثائقها بـ O(log n) لـ \`offer\` و\`poll\` وبزمن ثابت لـ \`peek\`، لكن بزمن **خطي** لـ \`remove(Object)\` و\`contains\`. والمرور عليها لا يعطي ترتيباً مرتّباً.
- **\`std::priority_queue\` في C++**: كومة **عظمى** افتراضياً. وللكومة الصغرى اكتب \`std::priority_queue<T, std::vector<T>, std::greater<T>>\`.
- **\`BinaryHeap\` في Rust**: كومة عظمى أيضاً؛ غلّف العناصر بـ \`std::cmp::Reverse\` لتحصل على كومة صغرى. وتقدّم **Go** الحزمة \`container/heap\` التي تعمل على نوعك الخاص متى نفّذ خمس دوال (\`Len\` و\`Less\` و\`Swap\` و\`Push\` و\`Pop\`).

**ما لا تفعله الكومات:** إيجاد عنصر عشوائي أو تغيير أولويته بسرعة. والحل الشائع هو **الحذف الكسول (lazy deletion)**: أضف العنصر من جديد بأولويته الجديدة، وحين يُسحب لاحقاً مدخل قديم فتجاهله. وخوارزمية Dijkstra تستخدم هذه الحيلة بالضبط.`,
    },
  },
  {
    type: "lab",
    id: "min-heap",
    lang: "javascript",
    prompt: {
      en: `**Build a min-heap.** JavaScript has no built-in priority queue, so write one: an array plus sift up and sift down.

**Input:** the first line has \`n\`. Then \`n\` commands, one per line:
- \`push x\`: add the integer \`x\` (duplicates and negative numbers are allowed)
- \`pop\`: remove the smallest value and print it, or print \`EMPTY\` if the heap is empty
- \`peek\`: print the smallest value without removing it, or \`EMPTY\`

**Output:** one line for every \`pop\` and \`peek\`.

**Example:** input
\`\`\`
8
push 5
push 3
peek
push 8
pop
pop
pop
pop
\`\`\`
prints \`3\`, \`3\`, \`5\`, \`8\`, \`EMPTY\` (one per line).

The starter's \`push\` just appends and its \`pop\` removes the last item: complete \`push\` (sift up while smaller than the parent at \`(i - 1) >> 1\`) and \`pop\` (move the last item to the root, then sift down towards the **smaller** child at \`2i + 1\` or \`2i + 2\`).`,
      ar: `**ابنِ كومة صغرى.** لا تملك JavaScript طابور أولوية جاهزاً، فاكتب واحداً: مصفوفة مع تصعيد وتنزيل.

**المدخل:** السطر الأول فيه \`n\`. ثم \`n\` أمراً، أمر في كل سطر:
- \`push x\`: أضف العدد الصحيح \`x\` (القيم المكررة والسالبة مسموح بها)
- \`pop\`: احذف أصغر قيمة واطبعها، أو اطبع \`EMPTY\` إن كانت الكومة فارغة
- \`peek\`: اطبع أصغر قيمة دون حذفها، أو \`EMPTY\`

**المخرج:** سطر لكل \`pop\` و\`peek\`.

**مثال:** المدخل
\`\`\`
8
push 5
push 3
peek
push 8
pop
pop
pop
pop
\`\`\`
يطبع \`3\` ثم \`3\` ثم \`5\` ثم \`8\` ثم \`EMPTY\` (كل قيمة في سطر).

الدالة \`push\` في شيفرة البداية تضيف في النهاية فقط، و\`pop\` تحذف العنصر الأخير: أكمل \`push\` (صعّد العنصر ما دام أصغر من أبيه في \`(i - 1) >> 1\`) و\`pop\` (انقل العنصر الأخير إلى الجذر، ثم نزّله نحو الابن **الأصغر** في \`2i + 1\` أو \`2i + 2\`).`,
    },
    starterCode: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const n = Number(lines[0]);

class MinHeap {
  constructor() {
    this.a = [];
  }
  size() {
    return this.a.length;
  }
  peek() {
    return this.a[0]; // correct only once push and pop keep the heap order
  }
  push(x) {
    this.a.push(x);
    // TODO: sift up. Let i be the new item's index. While i > 0 and the parent
    // p = (i - 1) >> 1 holds a larger value, swap a[i] and a[p] and continue from p.
  }
  pop() {
    // TODO: remember a[0]; remove the last item and, if the heap is not empty now, put it at
    // index 0 and sift it down: swap with the SMALLER child (2i + 1 or 2i + 2) while that
    // child is smaller. Return the remembered value.
    return this.a.pop();
  }
}

const heap = new MinHeap();
const out = [];
for (let k = 1; k <= n; k++) {
  const [cmd, arg] = lines[k].trim().split(" ");
  if (cmd === "push") heap.push(Number(arg));
  else if (cmd === "pop") out.push(heap.size() ? heap.pop() : "EMPTY");
  else if (cmd === "peek") out.push(heap.size() ? heap.peek() : "EMPTY");
}
console.log(out.join("\\n"));
`,
    solution: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const n = Number(lines[0]);

class MinHeap {
  constructor() {
    this.a = [];
  }
  size() {
    return this.a.length;
  }
  peek() {
    return this.a[0];
  }
  push(x) {
    const a = this.a;
    a.push(x); // the new item starts as the last leaf
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p] <= a[i]) break; // heap order holds: stop
      [a[p], a[i]] = [a[i], a[p]]; // sift up
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last; // the last leaf moves to the root...
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let small = i;
        if (l < a.length && a[l] < a[small]) small = l;
        if (r < a.length && a[r] < a[small]) small = r;
        if (small === i) break;
        [a[small], a[i]] = [a[i], a[small]]; // ...and sinks below the smaller child
        i = small;
      }
    }
    return top;
  }
}

const heap = new MinHeap();
const out = [];
for (let k = 1; k <= n; k++) {
  const [cmd, arg] = lines[k].trim().split(" ");
  if (cmd === "push") heap.push(Number(arg));
  else if (cmd === "pop") out.push(heap.size() ? heap.pop() : "EMPTY");
  else if (cmd === "peek") out.push(heap.size() ? heap.peek() : "EMPTY");
}
console.log(out.join("\\n"));
`,
    hints: [
      { en: "push: after this.a.push(x), let i = a.length - 1. While i > 0, compute p = (i - 1) >> 1; stop if a[p] <= a[i], otherwise swap them and set i = p.", ar: "push: بعد this.a.push(x) اجعل i = a.length - 1. وما دام i > 0 احسب p = (i - 1) >> 1؛ وتوقف إن كان a[p] <= a[i]، وإلا فبادلهما واجعل i = p." },
      { en: "pop: const top = a[0]; const last = a.pop(); if the array is still not empty, a[0] = last and sift down from i = 0. Return top.", ar: "pop: const top = a[0]; const last = a.pop(); وإن لم تصبح المصفوفة فارغة فاجعل a[0] = last ونزّل بدءاً من i = 0. ثم أعد top." },
      { en: "Sift down: l = 2 * i + 1, r = l + 1, small = i. If a[l] < a[small] then small = l; if a[r] < a[small] then small = r (check l and r are inside the array). If small === i stop, otherwise swap and continue from small.", ar: "التنزيل: l = 2 * i + 1 وr = l + 1 وsmall = i. إن كان a[l] < a[small] فاجعل small = l؛ وإن كان a[r] < a[small] فاجعل small = r (وتحقق أن l وr داخل المصفوفة). وإن كان small === i فتوقف، وإلا فبادل وتابع من small." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "8\npush 5\npush 3\npeek\npush 8\npop\npop\npop\npop\n", expected: "3\n3\n5\n8\nEMPTY", mode: "lines" },
      { name: { en: "Pops come out sorted", ar: "السحب يخرج مرتّباً" }, stdin: "12\npush 9\npush 4\npush 7\npush 1\npush 8\npush 2\npop\npop\npop\npop\npop\npop\n", expected: "1\n2\n4\n7\n8\n9", mode: "lines" },
      { name: { en: "Duplicates and negative numbers", ar: "قيم مكررة وسالبة" }, stdin: "8\npush -3\npush 5\npush -3\npush 0\npop\npop\npop\npop\n", expected: "-3\n-3\n0\n5", mode: "lines" },
      { name: { en: "An empty heap", ar: "كومة فارغة" }, stdin: "2\npop\npeek\n", expected: "EMPTY\nEMPTY", mode: "lines" },
      { name: { en: "Pushes and pops interleaved", ar: "إضافة وسحب متداخلان" }, stdin: "9\npush 2\npush 7\npush 4\npop\npush 1\npop\npop\npeek\npop\n", expected: "2\n1\n4\n7\n7", mode: "lines" },
      { name: { en: "3,000 commands", ar: "3,000 أمر" }, stdin: heapInput, expected: heapExpected, mode: "lines" },
    ],
    sampleInput: "8\npush 5\npush 3\npeek\npush 8\npop\npop\npop\npop\n",
  },
  {
    type: "text",
    body: {
      en: `## Top-k: a small heap for a big stream

You want the **k largest** values from n numbers, or the **k-th largest** at every moment of a stream. Sorting everything costs O(n log n) time and O(n) memory, and you cannot sort a stream that never ends.

**Keep a min-heap of size k** holding the k largest values seen so far. For each new value, push it; if the heap now has k + 1 items, pop the smallest. The root is then the **k-th largest** value so far, the weakest member of the top k, which is exactly the one to evict when something better arrives. That is why the k *largest* use a *min*-heap.

\`\`\`
k = 3, stream 5 1 9 3 7 6

read 5   heap holds {5}            fewer than 3 values: no answer yet
read 1   heap holds {1, 5}
read 9   heap holds {1, 5, 9}      3rd largest = 1 (the root)
read 3   push 3, pop 1  -> {3, 5, 9}   3rd largest = 3
read 7   push 7, pop 3  -> {5, 7, 9}   3rd largest = 5
read 6   push 6, pop 5  -> {6, 7, 9}   3rd largest = 6
\`\`\`

Every step is O(log k), so the whole stream costs **O(n log k)** time and only **O(k)** memory. For k = 10 and a hundred million numbers that is a few comparisons per number and ten stored values. Python's \`heapq.nlargest(k, data)\` applies the same idea, and \`heapq.heappushpop\` does the push and the pop in one step.

The mirror image also holds: the k **smallest** use a **max**-heap of size k. Combining both, a max-heap for the lower half and a min-heap for the upper half, gives the **median** of a stream in O(log n) per value.`,
      ar: `## أكبر k: كومة صغيرة لتدفق كبير

تريد **أكبر k قيمة** من بين n عدداً، أو **القيمة الكبرى رقم k (k-th largest)** في كل لحظة من تدفق. فرز كل شيء يكلّف زمن O(n log n) وذاكرة O(n)، ولا يمكنك فرز تدفق لا ينتهي.

**احتفظ بكومة صغرى حجمها k** تحمل أكبر k قيمة رأيتها حتى الآن. ولكل قيمة جديدة أضفها؛ وإن صار في الكومة k + 1 عنصراً فاسحب الأصغر. فيكون الجذر حينها **القيمة الكبرى رقم k** حتى الآن، أي أضعف أعضاء قائمة الأكبر k، وهو بالضبط من يجب إخراجه حين تصل قيمة أفضل. ولهذا تستخدم *أكبر* k قيمة كومةً *صغرى*.

\`\`\`
k = 3, stream 5 1 9 3 7 6

read 5   heap holds {5}            fewer than 3 values: no answer yet
read 1   heap holds {1, 5}
read 9   heap holds {1, 5, 9}      3rd largest = 1 (the root)
read 3   push 3, pop 1  -> {3, 5, 9}   3rd largest = 3
read 7   push 7, pop 3  -> {5, 7, 9}   3rd largest = 5
read 6   push 6, pop 5  -> {6, 7, 9}   3rd largest = 6
\`\`\`

كل خطوة O(log k)، فيكلّف التدفق كله زمن **O(n log k)** وذاكرة **O(k)** فقط. ومع k = 10 ومئة مليون عدد يعني ذلك بضع مقارنات لكل عدد وعشر قيم مخزّنة. والدالة \`heapq.nlargest(k, data)\` في Python تطبّق الفكرة نفسها، و\`heapq.heappushpop\` تنفّذ الإضافة والسحب في خطوة واحدة.

والصورة المعكوسة صحيحة أيضاً: أصغر k قيمة تستخدم كومة **عظمى** حجمها k. والجمع بينهما، كومة عظمى للنصف الأدنى وكومة صغرى للنصف الأعلى، يعطي **وسيط (median)** التدفق بزمن O(log n) لكل قيمة.`,
    },
  },
  {
    type: "lab",
    id: "kth-largest-stream",
    lang: "python",
    prompt: {
      en: `**The k-th largest, live.** Numbers arrive one by one. After each one, print the **k-th largest** value seen so far, or \`-\` if fewer than \`k\` numbers have arrived. Equal values count separately (in \`4 4 1\` the 2nd largest is 4).

**Input:** the first line has \`n k\`. The second line has the \`n\` integers of the stream.

**Output:** \`n\` lines, one answer after each number.

**Example:** input
\`\`\`
6 3
5 1 9 3 7 6
\`\`\`
prints \`-\`, \`-\`, \`1\`, \`3\`, \`5\`, \`6\` (one per line), as traced in the lesson.

Keep a \`heapq\` min-heap with at most \`k\` items: push each number, pop the smallest when the size exceeds \`k\`, and read the answer at \`heap[0]\`. That is O(log k) per number; re-sorting everything after each number would be O(n log n) per step.`,
      ar: `**القيمة الكبرى رقم k، مباشرةً.** تصل الأعداد واحداً تلو الآخر. بعد كل عدد اطبع **القيمة الكبرى رقم k** بين ما رأيته حتى الآن، أو \`-\` إن وصل أقل من \`k\` عدداً. والقيم المتساوية تُعدّ منفصلة (في \`4 4 1\` ثاني أكبر قيمة هي 4).

**المدخل:** السطر الأول فيه \`n k\`. والسطر الثاني فيه الأعداد الصحيحة الـ \`n\` للتدفق.

**المخرج:** \`n\` سطراً، جواب بعد كل عدد.

**مثال:** المدخل
\`\`\`
6 3
5 1 9 3 7 6
\`\`\`
يطبع \`-\` ثم \`-\` ثم \`1\` ثم \`3\` ثم \`5\` ثم \`6\` (كل قيمة في سطر)، كما تتبّعناه في الدرس.

احتفظ بكومة صغرى من \`heapq\` فيها \`k\` عنصراً على الأكثر: أضف كل عدد، واسحب الأصغر حين يتجاوز الحجم \`k\`، واقرأ الجواب في \`heap[0]\`. هذا O(log k) لكل عدد؛ أما إعادة فرز كل شيء بعد كل عدد فتكلّف O(n log n) في كل خطوة.`,
    },
    starterCode: `import sys
import heapq

data = sys.stdin.read().split()
n, k = int(data[0]), int(data[1])
stream = [int(x) for x in data[2:2 + n]]

heap = []      # min-heap holding the k largest values seen so far
out = []
for x in stream:
    # TODO: heapq.heappush(heap, x); if len(heap) > k: heapq.heappop(heap)
    # Then the answer is heap[0] when len(heap) == k, otherwise "-".
    out.append("-")

print("\\n".join(out))
`,
    solution: `import sys
import heapq

data = sys.stdin.read().split()
n, k = int(data[0]), int(data[1])
stream = [int(x) for x in data[2:2 + n]]

heap = []      # min-heap holding the k largest values seen so far
out = []
for x in stream:
    heapq.heappush(heap, x)
    if len(heap) > k:
        heapq.heappop(heap)          # evict the weakest of the top k + 1
    out.append(str(heap[0]) if len(heap) == k else "-")

print("\\n".join(out))
`,
    hints: [
      { en: "Push every number with heapq.heappush(heap, x). The heap keeps the smallest value at heap[0].", ar: "أضف كل عدد بـ heapq.heappush(heap, x). والكومة تُبقي أصغر قيمة في heap[0]." },
      { en: "As soon as len(heap) > k, call heapq.heappop(heap): the value removed is smaller than all k that remain, so it cannot be among the k largest.", ar: "فور أن يصبح len(heap) > k استدعِ heapq.heappop(heap): فالقيمة المحذوفة أصغر من كل القيم الـ k الباقية، فلا يمكن أن تكون بين أكبر k قيمة." },
      { en: "After that, if len(heap) == k the answer is heap[0] (the smallest of the k largest); otherwise print '-'.", ar: "بعد ذلك، إن كان len(heap) == k فالجواب heap[0] (أصغر أكبر k قيمة)؛ وإلا فاطبع '-'." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "6 3\n5 1 9 3 7 6\n", expected: "-\n-\n1\n3\n5\n6", mode: "lines" },
      { name: { en: "k = 1 is the running maximum", ar: "k = 1 هي القيمة العظمى الجارية" }, stdin: "5 1\n3 1 4 1 5\n", expected: "3\n3\n4\n4\n5", mode: "lines" },
      { name: { en: "Equal values count separately", ar: "القيم المتساوية تُعدّ منفصلة" }, stdin: "5 2\n4 4 4 1 9\n", expected: "-\n4\n4\n4\n4", mode: "lines" },
      { name: { en: "k is larger than the stream", ar: "k أكبر من التدفق" }, stdin: "3 5\n1 2 3\n", expected: "-\n-\n-", mode: "lines" },
      { name: { en: "Negative numbers", ar: "أعداد سالبة" }, stdin: "4 2\n-5 -1 -3 -2\n", expected: "-\n-5\n-3\n-2", mode: "lines" },
      { name: { en: "2,500 numbers, k = 100", ar: "2,500 عدد، k = 100" }, stdin: kthInput, expected: kthExpected, mode: "lines" },
    ],
    sampleInput: "6 3\n5 1 9 3 7 6\n",
  },
  {
    type: "text",
    body: {
      en: `## Merging k sorted streams

You have **k sorted lists** with N values in total and need one sorted list. Concatenating and sorting costs O(N log N) and ignores the order you already have. Merging the lists one after another costs up to O(N x k), because early values are copied again in every round.

**Use a heap of the current front of every list.** Each heap entry is \`(value, list index, position)\`. Pop the smallest entry, output its value, and push the next value of the **same** list, if there is one. The heap never holds more than k entries, so every step is O(log k) and the whole merge is **O(N log k)**.

\`\`\`
A = 1 4 9     B = 2 3 10     C = 5 6

heap of fronts        pop     push the next value of that list
1A  2B  5C            1       4 (from A)
2B  4A  5C            2       3 (from B)
3B  4A  5C            3       10 (from B)
4A  5C  10B           4       9 (from A)
5C  9A  10B           5       6 (from C)
6C  9A  10B           6       -  (C is finished)
9A  10B               9       -
10B                   10      -
output: 1 2 3 4 5 6 9 10
\`\`\`

The list index inside the entry is more than bookkeeping: when two values are equal, the comparison moves on to the list index, so ties are broken in a fixed order and the entries never need to compare anything else.

**Where this runs for real:** external sorting (sort chunks that fit in memory, write them to disk, then k-way merge the sorted runs), log-structured storage engines that merge sorted files in the background, and combining time-ordered logs from many servers. Python's \`heapq.merge\` performs the same merge lazily, one value at a time.`,
      ar: `## دمج k تدفقاً مرتّباً

لديك **k قائمة مرتّبة** فيها N قيمة إجمالاً، وتحتاج إلى قائمة مرتّبة واحدة. الربط ثم الفرز يكلّف O(N log N) ويتجاهل الترتيب الموجود لديك أصلاً. ودمج القوائم واحدة بعد أخرى يكلّف حتى O(N × k)، لأن القيم المبكرة تُنسخ من جديد في كل جولة.

**استخدم كومة من العنصر الأمامي لكل قائمة.** كل مدخل في الكومة هو \`(القيمة، فهرس القائمة، الموضع)\`. اسحب أصغر مدخل، واطبع قيمته، وأضف القيمة التالية من القائمة **نفسها** إن وُجدت. ولا تحمل الكومة أكثر من k مدخلاً أبداً، فكل خطوة O(log k) والدمج كله **O(N log k)**.

\`\`\`
A = 1 4 9     B = 2 3 10     C = 5 6

heap of fronts        pop     push the next value of that list
1A  2B  5C            1       4 (from A)
2B  4A  5C            2       3 (from B)
3B  4A  5C            3       10 (from B)
4A  5C  10B           4       9 (from A)
5C  9A  10B           5       6 (from C)
6C  9A  10B           6       -  (C is finished)
9A  10B               9       -
10B                   10      -
output: 1 2 3 4 5 6 9 10
\`\`\`

وفهرس القائمة داخل المدخل أكثر من مجرد حساب: فحين تتساوى قيمتان تنتقل المقارنة إلى فهرس القائمة، فيُحسم التعادل بترتيب ثابت ولا تحتاج المدخلات إلى مقارنة أي شيء آخر.

**أين يعمل هذا فعلاً:** الفرز الخارجي (افرز قطعاً تتسع لها الذاكرة، واكتبها على القرص، ثم ادمج المقاطع المرتّبة دمجاً من k طريقاً)، ومحركات التخزين المبنية على السجلات (log-structured) التي تدمج ملفات مرتّبة في الخلفية، وجمع سجلات مرتّبة زمنياً من خوادم كثيرة. والدالة \`heapq.merge\` في Python تنفّذ الدمج نفسه بكسل، قيمة بعد قيمة.`,
    },
  },
  {
    type: "code-demo",
    lang: "python",
    code: `import heapq

def k_way_merge(lists):
    heap = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
    heapq.heapify(heap)                    # one entry per list: the k fronts
    out, largest = [], len(heap)
    while heap:
        value, i, pos = heapq.heappop(heap)
        out.append(value)
        if pos + 1 < len(lists[i]):        # refill from the same list
            heapq.heappush(heap, (lists[i][pos + 1], i, pos + 1))
        largest = max(largest, len(heap))
    return out, largest

lists = [[1, 4, 9], [2, 3, 10], [5, 6]]
merged, largest = k_way_merge(lists)
print("merged:", merged, "| heap size never above", largest)
print("heapq.merge:", list(heapq.merge(*lists)))

# External sorting in miniature: sort chunks that "fit in memory", then merge the sorted runs
data = [42, 7, 19, 88, 3, 56, 71, 25, 90, 14, 63, 38, 5, 77, 29, 51, 96, 12, 67, 34]
runs = [sorted(data[i:i + 5]) for i in range(0, len(data), 5)]
for r in runs:
    print("run:", r)
merged, largest = k_way_merge(runs)
print("merged:", merged)
print("same as sorted(data):", merged == sorted(data), "| heap size never above", largest)
`,
    explanation: {
      en: "The heap holds one entry per list, so it never grows beyond k (3, then 4) however long the lists are. heapq.merge gives the same result lazily. The second half is external sorting in miniature: each run is sorted on its own, as if it were a chunk written to disk, and one k-way merge produces the fully sorted data.",
      ar: "تحمل الكومة مدخلاً واحداً لكل قائمة، فلا تكبر أبداً عن k (3 ثم 4) مهما طالت القوائم. وتعطي heapq.merge النتيجة نفسها بكسل. والنصف الثاني فرز خارجي في صورة مصغّرة: كل مقطع يُفرز وحده، كأنه قطعة كُتبت على القرص، ثم يُنتج دمج واحد من k طريقاً البيانات مرتّبة بالكامل.",
    },
  },
  {
    type: "lab",
    id: "merge-k-sorted",
    lang: "cpp",
    prompt: {
      en: `**Merge k sorted lists.** Combine several sorted lists into one sorted list.

**Input:** the first line has \`k\`. Then \`k\` lines; each starts with \`m\` (the list's length, possibly 0) followed by \`m\` integers in non-decreasing order.

**Output:** all the values in non-decreasing order on one line, separated by single spaces (an empty line if there are none).

**Example:** input
\`\`\`
3
3 1 4 9
3 2 3 10
2 5 6
\`\`\`
prints \`1 2 3 4 5 6 9 10\`.

Use a min-heap of \`(value, list, position)\` tuples. Careful: \`std::priority_queue\` is a **max**-heap by default, so declare it as \`priority_queue<Entry, vector<Entry>, greater<Entry>>\`.`,
      ar: `**ادمج k قائمة مرتّبة.** اجمع عدة قوائم مرتّبة في قائمة مرتّبة واحدة.

**المدخل:** السطر الأول فيه \`k\`. ثم \`k\` سطراً؛ يبدأ كل منها بـ \`m\` (طول القائمة، وقد يكون 0) تليه \`m\` قيمة صحيحة بترتيب غير تنازلي.

**المخرج:** كل القيم بترتيب غير تنازلي في سطر واحد تفصل بينها مسافة واحدة (وسطر فارغ إن لم توجد قيم).

**مثال:** المدخل
\`\`\`
3
3 1 4 9
3 2 3 10
2 5 6
\`\`\`
يطبع \`1 2 3 4 5 6 9 10\`.

استخدم كومة صغرى من الصفوف \`(القيمة، القائمة، الموضع)\`. انتبه: \`std::priority_queue\` كومة **عظمى** افتراضياً، فصرّح بها هكذا: \`priority_queue<Entry, vector<Entry>, greater<Entry>>\`.`,
    },
    starterCode: `#include <iostream>
#include <queue>
#include <tuple>
#include <vector>
using namespace std;

int main() {
    int k = 0;
    cin >> k;
    vector<vector<long long>> lists(k);
    for (auto& list : lists) {
        int m = 0;
        cin >> m;
        list.resize(m);
        for (auto& x : list) cin >> x;
    }

    // TODO: k-way merge with a min-heap of (value, list index, position).
    //   using Entry = tuple<long long, int, int>;
    //   priority_queue<Entry, vector<Entry>, greater<Entry>> heap;   // greater: smallest on top
    //   push the first value of every non-empty list;
    //   while the heap is not empty: take top(), pop(), print the value,
    //   and push the next value of the same list if there is one.
    // For now the lists are printed one after another, which is not sorted.
    bool first = true;
    for (const auto& list : lists) {
        for (long long x : list) {
            cout << (first ? "" : " ") << x;
            first = false;
        }
    }
    cout << '\\n';
}
`,
    solution: `#include <iostream>
#include <queue>
#include <tuple>
#include <vector>
using namespace std;

int main() {
    int k = 0;
    cin >> k;
    vector<vector<long long>> lists(k);
    for (auto& list : lists) {
        int m = 0;
        cin >> m;
        list.resize(m);
        for (auto& x : list) cin >> x;
    }

    // (value, list index, position); greater<> turns the default max-heap into a min-heap
    using Entry = tuple<long long, int, int>;
    priority_queue<Entry, vector<Entry>, greater<Entry>> heap;
    for (int i = 0; i < k; i++) {
        if (!lists[i].empty()) heap.emplace(lists[i][0], i, 0);
    }

    bool first = true;
    while (!heap.empty()) {
        auto [value, i, pos] = heap.top();
        heap.pop();
        cout << (first ? "" : " ") << value;
        first = false;
        if (pos + 1 < (int)lists[i].size()) {
            heap.emplace(lists[i][pos + 1], i, pos + 1); // the next value of the same list
        }
    }
    cout << '\\n';
}
`,
    hints: [
      { en: "Declare using Entry = tuple<long long, int, int>; and priority_queue<Entry, vector<Entry>, greater<Entry>> heap; Tuples compare by value first, then by list index.", ar: "صرّح بـ using Entry = tuple<long long, int, int>; وبـ priority_queue<Entry, vector<Entry>, greater<Entry>> heap; والصفوف تُقارَن بالقيمة أولاً ثم بفهرس القائمة." },
      { en: "Start by pushing (lists[i][0], i, 0) for every list that is not empty. Empty lists simply never enter the heap.", ar: "ابدأ بإضافة (lists[i][0], i, 0) لكل قائمة غير فارغة. أما القوائم الفارغة فلا تدخل الكومة أبداً." },
      { en: "Loop: auto [value, i, pos] = heap.top(); heap.pop(); print value; if pos + 1 < lists[i].size() push (lists[i][pos + 1], i, pos + 1).", ar: "الحلقة: auto [value, i, pos] = heap.top(); heap.pop(); اطبع value؛ وإن تحقق pos + 1 < lists[i].size() فأضف (lists[i][pos + 1], i, pos + 1)." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "3\n3 1 4 9\n3 2 3 10\n2 5 6\n", expected: "1 2 3 4 5 6 9 10" },
      { name: { en: "Empty lists in the input", ar: "قوائم فارغة في المدخل" }, stdin: "3\n0\n2 1 2\n0\n", expected: "1 2" },
      { name: { en: "Equal values in different lists", ar: "قيم متساوية في قوائم مختلفة" }, stdin: "2\n3 1 1 2\n2 1 2\n", expected: "1 1 1 2 2" },
      { name: { en: "Negative numbers", ar: "أعداد سالبة" }, stdin: "2\n2 -5 0\n3 -7 -1 8\n", expected: "-7 -5 -1 0 8" },
      { name: { en: "A single list", ar: "قائمة واحدة" }, stdin: "1\n4 1 2 3 4\n", expected: "1 2 3 4" },
      { name: { en: "60 lists of 50 values", ar: "60 قائمة في كل منها 50 قيمة" }, stdin: mergeInput, expected: mergeExpected },
    ],
    sampleInput: "3\n3 1 4 9\n3 2 3 10\n2 5 6\n",
  },
  {
    type: "quiz",
    questions: [
      {
        q: {
          en: "A binary heap is stored in an array with 0-based indexes. Where are the children of index i?",
          ar: "كومة ثنائية مخزّنة في مصفوفة فهارسها تبدأ من 0. أين يقع ابنا الفهرس i؟",
        },
        choices: [
          { en: "i + 1 and i + 2", ar: "i + 1 و i + 2" },
          { en: "2i and 2i + 1", ar: "2i و 2i + 1" },
          { en: "2i + 1 and 2i + 2", ar: "2i + 1 و 2i + 2" },
          { en: "(i - 1) / 2 and (i + 1) / 2", ar: "(i - 1) / 2 و (i + 1) / 2" },
        ],
        answer: 2,
        explain: {
          en: "With the root at index 0, the children of i are 2i + 1 and 2i + 2, and the parent is (i - 1) // 2. The pair 2i and 2i + 1 is the formula for 1-based arrays (root at index 1). i + 1 and i + 2 are just the next cells, and (i - 1) / 2 is the parent, not a child.",
          ar: "مع الجذر في الفهرس 0 يكون ابنا i في 2i + 1 و2i + 2، والأب في (i - 1) // 2. أما الزوج 2i و2i + 1 فهو صيغة المصفوفات التي تبدأ من 1 (الجذر في الفهرس 1). وi + 1 وi + 2 مجرد الخانتين التاليتين، و(i - 1) / 2 هو الأب لا الابن.",
        },
      },
      {
        q: {
          en: "Which statement about a min-heap is true?",
          ar: "أي العبارات الآتية عن الكومة الصغرى صحيحة؟",
        },
        choices: [
          { en: "The smallest item is at the root, but the array as a whole is usually not sorted", ar: "أصغر عنصر في الجذر، لكن المصفوفة ككل ليست مرتّبة عادةً" },
          { en: "The array is always sorted in ascending order", ar: "المصفوفة مرتّبة تصاعدياً دائماً" },
          { en: "Every left child is smaller than its right sibling", ar: "كل ابن أيسر أصغر من أخيه الأيمن" },
          { en: "The largest item is always the last element of the array", ar: "أكبر عنصر هو دائماً آخر عنصر في المصفوفة" },
        ],
        answer: 0,
        explain: {
          en: "Heap order only compares parents with their children, so the root is the minimum. Siblings are not ordered, and the largest item can be any leaf. For example [1, 3, 2] is a valid min-heap even though 3 comes before 2.",
          ar: "ترتيب الكومة يقارن الآباء بأبنائهم فقط، فيكون الجذر هو الأصغر. أما الإخوة فلا ترتيب بينهم، وقد يكون أكبر عنصر أي ورقة. فمثلاً [1, 3, 2] كومة صغرى صحيحة مع أن 3 يأتي قبل 2.",
        },
      },
      {
        q: {
          en: "You need the 10 largest values from a stream of 100 million numbers. What is the best approach?",
          ar: "تحتاج إلى أكبر 10 قيم من تدفق فيه 100 مليون عدد. ما أفضل طريقة؟",
        },
        choices: [
          { en: "Store all the numbers, sort them and take the last 10", ar: "خزّن كل الأعداد، وافرزها، وخذ آخر 10" },
          { en: "Put all the numbers in a max-heap and pop 10 times", ar: "ضع كل الأعداد في كومة عظمى واسحب 10 مرات" },
          { en: "Binary-search for the 10th largest value", ar: "ابحث ثنائياً عن عاشر أكبر قيمة" },
          { en: "Keep a min-heap of size 10: push each number and pop the smallest whenever there are 11", ar: "احتفظ بكومة صغرى حجمها 10: أضف كل عدد واسحب الأصغر كلما صار فيها 11" },
        ],
        answer: 3,
        explain: {
          en: "The size-10 min-heap needs O(n log 10) time and stores only 10 values, and it works on a stream. Sorting needs O(n log n) time and memory for all 100 million values; a max-heap of everything also stores them all. Binary search needs data that is already sorted.",
          ar: "الكومة الصغرى بحجم 10 تحتاج زمن O(n log 10) ولا تخزّن إلا 10 قيم، وتعمل على التدفق. أما الفرز فيحتاج زمن O(n log n) وذاكرة لكل المئة مليون قيمة؛ والكومة العظمى لكل شيء تخزّنها كلها أيضاً. والبحث الثنائي يحتاج بيانات مرتّبة مسبقاً.",
        },
      },
      {
        q: {
          en: "Why does heapify (sifting down from the last parent back to the root) take O(n) instead of O(n log n)?",
          ar: "لماذا يستغرق heapify (التنزيل من آخر أب رجوعاً إلى الجذر) زمن O(n) بدل O(n log n)؟",
        },
        choices: [
          { en: "It uses counting sort internally", ar: "لأنه يستخدم counting sort داخلياً" },
          { en: "Most nodes are near the bottom and sift down only a few levels, so the total work adds up to O(n)", ar: "لأن معظم العقد قرب القاع وتنزل بضعة مستويات فقط، فيبلغ مجموع العمل O(n)" },
          { en: "It only fixes the root", ar: "لأنه يصلح الجذر فقط" },
          { en: "It does not: heapify is O(n log n)", ar: "هذا غير صحيح: heapify هو O(n log n)" },
        ],
        answer: 1,
        explain: {
          en: "Half the nodes are leaves (0 levels to sink), a quarter can sink 1 level, an eighth 2 levels, and so on. The sum n/4 x 1 + n/8 x 2 + n/16 x 3 + ... stays below n. Only the few nodes near the top can travel log n levels. Heapify compares values, it does not count them, and it fixes every internal node, not only the root.",
          ar: "نصف العقد أوراق (0 مستويات للنزول)، وربعها قد ينزل مستوى واحداً، وثُمنها مستويين، وهكذا. والمجموع n/4 × 1 + n/8 × 2 + n/16 × 3 + ... يبقى أقل من n. ولا تقطع log n مستوى إلا العقد القليلة القريبة من القمة. وheapify يقارن القيم ولا يعدّها، ويصلح كل عقدة داخلية لا الجذر وحده.",
        },
      },
      {
        q: {
          en: "In C++, std::priority_queue<int> pq; receives 5, 1 and 8. What does pq.top() return?",
          ar: "في C++ يستقبل std::priority_queue<int> pq; القيم 5 و1 و8. ماذا تعيد pq.top()؟",
        },
        choices: [
          { en: "1, the smallest value", ar: "1، أصغر قيمة" },
          { en: "8, because std::priority_queue is a max-heap by default", ar: "8، لأن std::priority_queue كومة عظمى افتراضياً" },
          { en: "5, the first value pushed", ar: "5، أول قيمة أُضيفت" },
        ],
        answer: 1,
        explain: {
          en: "std::priority_queue uses std::less and keeps the largest element on top. For the smallest on top, pass std::greater<int> as the third template argument. Rust's BinaryHeap is also a max-heap, while Python's heapq and Java's PriorityQueue are min-heaps: check before you rely on it.",
          ar: "يستخدم std::priority_queue المقارِن std::less ويُبقي أكبر عنصر في الأعلى. ولتحصل على الأصغر في الأعلى مرّر std::greater<int> كمعامل القالب الثالث. وBinaryHeap في Rust كومة عظمى أيضاً، بينما heapq في Python وPriorityQueue في Java كومتان صغريان: تحقّق قبل أن تعتمد على ذلك.",
        },
      },
    ],
  },
  {
    type: "text",
    body: {
      en: `## Summary

- A **priority queue** hands out the smallest (or largest) item next. A **binary heap** implements it with an array: children of \`i\` at \`2i + 1\` and \`2i + 2\`, parent at \`(i - 1) // 2\`, and every parent no larger than its children.
- **push** sifts up and **pop** moves the last item to the root and sifts down towards the **smaller** child: both **O(log n)**; **peek** is O(1). A heap is not sorted.
- **heapify** builds a heap in **O(n)**; **heap sort** is O(n log n) worst case with O(1) extra space, but not stable.
- Know your library: Python \`heapq\` and Java \`PriorityQueue\` are min-heaps, C++ \`std::priority_queue\` and Rust \`BinaryHeap\` are max-heaps. Use \`(priority, counter, item)\` entries for ties, and lazy deletion to "change" a priority.
- **Top-k:** a min-heap of size k gives the k largest in O(n log k) time and O(k) memory, even on a stream. **k-way merge:** a heap of list fronts merges N values from k sorted lists in O(N log k).

**Practice next:** find the k closest points to the origin, keep the median of a stream with two heaps, and schedule tasks by deadline with a priority queue. Then continue with **Shortest Paths & Union-Find**, where Dijkstra's algorithm runs on a heap.`,
      ar: `## الخلاصة

- **طابور الأولوية** يسلّم أصغر عنصر (أو أكبره) في المرة التالية. و**الكومة الثنائية** تنفّذه بمصفوفة: ابنا \`i\` في \`2i + 1\` و\`2i + 2\`، وأبوه في \`(i - 1) // 2\`، وكل أب لا يزيد على أبنائه.
- **push** تصعّد العنصر، و**pop** تنقل العنصر الأخير إلى الجذر وتنزّله نحو الابن **الأصغر**: وكلتاهما **O(log n)**؛ و**peek** في O(1). والكومة ليست مرتّبة.
- **heapify** يبني كومة في **O(n)**؛ و**heap sort** هو O(n log n) في أسوأ الحالات بمساحة إضافية O(1)، لكنه غير مستقرّ.
- اعرف مكتبتك: \`heapq\` في Python و\`PriorityQueue\` في Java كومتان صغريان، و\`std::priority_queue\` في C++ و\`BinaryHeap\` في Rust كومتان عظميان. استخدم مدخلات \`(priority, counter, item)\` للتعادل، والحذف الكسول "لتغيير" الأولوية.
- **أكبر k:** كومة صغرى حجمها k تعطي أكبر k قيمة بزمن O(n log k) وذاكرة O(k)، حتى على تدفق. و**الدمج من k طريقاً:** كومة من مقدّمات القوائم تدمج N قيمة من k قائمة مرتّبة في O(N log k).

**تدرّب بعد ذلك:** أوجد أقرب k نقطة إلى نقطة الأصل، واحتفظ بوسيط تدفق باستخدام كومتين، وجدول المهام حسب مواعيدها النهائية بطابور أولوية. ثم تابع إلى **أقصر المسارات وUnion-Find (Shortest Paths & Union-Find)**، حيث تعمل خوارزمية Dijkstra على كومة.`,
    },
  },
];

export const lesson: Lesson = {
  nodeId: "heaps-priority-queues",
  title: { en: "Heaps & Priority Queues: The Most Urgent Item First", ar: "الكومات وطوابير الأولوية: الأهمّ أولاً" },
  estMinutes: estimateMinutes(sections),
  sections,
};
