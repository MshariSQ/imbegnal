import type { Lesson, LessonSection } from "../types";
import { estimateMinutes } from "./estimate";

// Large inputs are generated here (not pasted) so the file stays readable. Expected outputs are
// derived by construction or by a method that differs from the reference solutions.

// Bracket lab: 1 000 copies of "([{" (3 000 openers), then the matching closers in reverse order,
// except the very last one, which is wrong. The first error is therefore at position 6 000.
const bracketOpen = "([{".repeat(1000);
const bracketClose = bracketOpen
  .split("")
  .reverse()
  .map((c) => (c === "(" ? ")" : c === "[" ? "]" : "}"))
  .join("");
const deepBrackets = `${bracketOpen}${bracketClose.slice(0, -1)}]\n`;

// Editor lab: start with "x", then 2 600 times "insert a letter, move left", so every new letter
// lands just after the "x" and the letters end up in reverse order. Then 600 times "move right,
// backspace", which deletes the first 600 of those letters. Expected text by construction.
const EDIT_INSERTS = 2600;
const EDIT_DELETES = 600;
const letterAt = (i: number) => String.fromCharCode(97 + (i % 26));
const editorCommands = [
  ...Array.from({ length: EDIT_INSERTS }, (_, i) => [`I ${letterAt(i)}`, "L"]).flat(),
  ...Array.from({ length: EDIT_DELETES }, () => ["R", "B"]).flat(),
];
const editorInput = `x\n${editorCommands.length}\n${editorCommands.join("\n")}\n`;
const editorExpected =
  "x" +
  Array.from({ length: EDIT_INSERTS }, (_, i) => letterAt(EDIT_INSERTS - 1 - i))
    .join("")
    .slice(EDIT_DELETES);

// Rate-limiter lab: 4 000 timestamps that grow by 0, 1 or 2 seconds (pseudo-random). The expected
// answers count the allowed requests inside the window with a binary search over all of them
// instead of a queue: a different method from the reference solution.
const RL_LIMIT = 20;
const RL_WINDOW = 50;
const rlTimes = (() => {
  const out: number[] = [];
  let t = 0;
  for (let i = 0; i < 4000; i++) {
    t += ((i * 7919 + 13) % 100003) % 3;
    out.push(t);
  }
  return out;
})();
const rlInput = `${RL_LIMIT} ${RL_WINDOW} ${rlTimes.length}\n${rlTimes.join(" ")}\n`;
const rlExpected = (() => {
  const allowed: number[] = [];
  const firstAtLeast = (x: number) => {
    let lo = 0;
    let hi = allowed.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (allowed[mid] >= x) hi = mid;
      else lo = mid + 1;
    }
    return lo;
  };
  return rlTimes
    .map((t) => {
      const inWindow = allowed.length - firstAtLeast(t - RL_WINDOW + 1);
      if (inWindow < RL_LIMIT) {
        allowed.push(t);
        return "ALLOW";
      }
      return "DENY";
    })
    .join("\n");
})();

const sections: LessonSection[] = [
  {
    type: "text",
    body: {
      en: `## What you'll learn

- How a **linked list** stores items as nodes joined by pointers, and when that beats an array
- The two classic rules for "who goes next": the **stack** (last in, first out) and the **queue** (first in, first out)
- Where they hide in real software: **undo**, the **call stack**, **bracket matching**, **expression evaluation**, job queues and **rate limiters**
- How to get O(1) operations in practice: a dynamic array as a stack, \`collections.deque\` as a queue, and the **ring buffer**
- You will write: a bracket checker, a text editor whose cursor walks a linked list, and a rate limiter`,
      ar: `## ماذا ستتعلم

- كيف تخزّن **القائمة المترابطة (linked list)** العناصر كعقد تربط بينها مؤشرات، ومتى تتفوّق على المصفوفة
- القاعدتان الكلاسيكيتان لسؤال "من التالي؟": **المكدّس (stack)** (آخر من يدخل أول من يخرج) و**الطابور (queue)** (أول من يدخل أول من يخرج)
- أين يختبئان في البرمجيات الحقيقية: **التراجع (undo)** و**مكدّس الاستدعاءات** و**مطابقة الأقواس** و**حساب التعابير** وطوابير المهام و**محدِّدات المعدّل (rate limiters)**
- كيف تحصل عملياً على عمليات O(1): مصفوفة ديناميكية كمكدّس، و\`collections.deque\` كطابور، و**المخزن الدائري (ring buffer)**
- ستكتب: مدقّقاً للأقواس، ومحرّر نصوص يمشي مؤشره على قائمة مترابطة، ومحدِّداً للمعدّل`,
    },
  },
  {
    type: "text",
    body: {
      en: `## Plates, a bakery line and a treasure hunt

**A pile of plates** in a kitchen: you put a clean plate on top, and you take the top plate when you need one. The plate you added last is the first one used. That is a **stack**, and it is exactly how the **undo** button works: the last change you made is the first one undone.

**The line at a bakery** is the opposite. The first customer to arrive is the first one served, and newcomers join at the back. That is a **queue**: print jobs, support tickets and requests waiting for a busy server all line up this way, because it is fair.

**A treasure hunt** is a chain of clues. Each clue tells you where the next one is hidden. You cannot jump straight to clue number 7: you must follow the chain from the first clue. But adding a new clue in the middle is easy: write one new note and change where the previous clue points. That is a **linked list**.

Stacks and queues are **rules** about the order in which items leave. Arrays and linked lists are two ways to **store** items. This lesson connects the two.`,
      ar: `## أطباق وطابور مخبز ورحلة بحث عن كنز

**كومة أطباق** في مطبخ: تضع الطبق النظيف في الأعلى، وتأخذ الطبق العلوي حين تحتاج إلى واحد. الطبق الذي أضفته أخيراً هو أول ما يُستخدم. هذا **مكدّس (stack)**، وهذا تماماً ما يفعله زرّ **التراجع (undo)**: آخر تعديل أجريته هو أول ما يُلغى.

أما **الطابور أمام المخبز** فهو العكس. أول زبون يصل هو أول من يُخدَم، والقادمون الجدد يقفون في المؤخرة. هذا **طابور (queue)**: مهام الطباعة وتذاكر الدعم الفني والطلبات المنتظرة أمام خادم مشغول كلها تصطفّ بهذه الطريقة، لأنها عادلة.

و**رحلة البحث عن الكنز** سلسلة من الأدلة. كل دليل يخبرك أين خُبّئ الدليل التالي. لا يمكنك القفز مباشرة إلى الدليل رقم 7: عليك أن تتبع السلسلة من الدليل الأول. لكن إضافة دليل جديد في المنتصف سهلة: اكتب ورقة جديدة واحدة وغيّر المكان الذي يشير إليه الدليل السابق. هذه **قائمة مترابطة (linked list)**.

المكدّسات والطوابير **قواعد** تحدّد ترتيب خروج العناصر. أما المصفوفات والقوائم المترابطة فطريقتان **لتخزين** العناصر. وهذا الدرس يصل بين الأمرين.`,
    },
  },
  {
    type: "text",
    body: {
      en: `## Linked lists

A **singly linked list** is a chain of **nodes**. Each node holds a value and a **pointer** (a reference) to the next node. The list itself only remembers the first node, the **head**; the last node points to nothing (\`None\`, \`null\`).

\`\`\`
head -> [3] -> [7] -> [9] -> None
\`\`\`

The nodes can live anywhere in memory, so there is no "start + i x size" formula as in an array. That decides the costs:

- **Read the k-th item:** O(k), up to **O(n)**: you walk from the head, one pointer at a time
- **Insert or delete at the head:** **O(1)**
- **Insert or delete right after a node you already hold:** **O(1)**: change one or two pointers, nothing shifts
- **Search for a value:** O(n)
- **Append at the end:** O(1) only if you also keep a pointer to the last node (the **tail**)

\`\`\`
insert 8 after 7:

before:  [3] -> [7] -------> [9]
after:   [3] -> [7] -> [8] -> [9]      two pointers changed, nothing moved
\`\`\`

A **doubly linked list** gives every node a \`prev\` pointer as well. Now you can walk backwards, and delete a node you hold in O(1) because you can reach both neighbours. Java's \`LinkedList\` and C++'s \`std::list\` are doubly linked; C++'s \`std::forward_list\` is singly linked. Python's \`list\` is **not** a linked list: it is a dynamic array.

Two tricks make linked-list code much less buggy:

- A **sentinel** (dummy) node that sits before the first real node. The list is never truly empty, so "insert at the front" and "insert in the middle" become the same code.
- **Draw the arrows** before you change them. The classic exercise, reversing a list in place, needs three pointers:

\`\`\`python
def reverse(head):
    prev = None
    cur = head
    while cur is not None:
        nxt = cur.next      # remember the rest of the list
        cur.next = prev     # turn this arrow around
        prev = cur
        cur = nxt
    return prev             # the old tail is the new head
\`\`\`

**Array or linked list?** In practice an array is usually faster for scanning, because its items sit next to each other and the CPU cache loads them in blocks. Linked lists win when you keep **references to positions** and insert or delete there all the time: the cursor of a text editor, the "least recently used" order of a cache (a hash map plus a doubly linked list), or the free blocks of a memory allocator.`,
      ar: `## القوائم المترابطة

**القائمة المترابطة الأحادية (singly linked list)** سلسلة من **العقد (nodes)**. كل عقدة تحمل قيمة و**مؤشراً (pointer)** (مرجعاً) إلى العقدة التالية. والقائمة نفسها لا تتذكّر إلا العقدة الأولى، وهي **الرأس (head)**؛ أما العقدة الأخيرة فلا تشير إلى شيء (\`None\` أو \`null\`).

\`\`\`
head -> [3] -> [7] -> [9] -> None
\`\`\`

يمكن أن تقع العقد في أي مكان من الذاكرة، فلا توجد صيغة "البداية + i × الحجم" كما في المصفوفة. وهذا ما يحدّد التكاليف:

- **قراءة العنصر رقم k:** O(k)، أي حتى **O(n)**: تمشي من الرأس مؤشراً بعد مؤشر
- **الإدراج أو الحذف عند الرأس:** **O(1)**
- **الإدراج أو الحذف بعد عقدة تمسكها أصلاً:** **O(1)**: تغيّر مؤشراً أو اثنين، ولا ينزاح شيء
- **البحث عن قيمة:** O(n)
- **الإضافة في النهاية:** O(1) فقط إن احتفظت أيضاً بمؤشر إلى العقدة الأخيرة (**الذيل tail**)

\`\`\`
insert 8 after 7:

before:  [3] -> [7] -------> [9]
after:   [3] -> [7] -> [8] -> [9]      two pointers changed, nothing moved
\`\`\`

أما **القائمة المترابطة الثنائية (doubly linked list)** فتعطي كل عقدة مؤشر \`prev\` أيضاً. فتستطيع المشي إلى الخلف، وحذف عقدة تمسكها في O(1) لأنك تصل إلى جارتيها كلتيهما. والقائمتان \`LinkedList\` في Java و\`std::list\` في C++ مترابطتان ثنائياً؛ أما \`std::forward_list\` في C++ فمترابطة أحادياً. وقائمة Python (\`list\`) **ليست** قائمة مترابطة: إنها مصفوفة ديناميكية.

حيلتان تقلّلان أخطاء شيفرة القوائم المترابطة كثيراً:

- **عقدة حارسة (sentinel)** وهمية تقع قبل أول عقدة حقيقية. فلا تكون القائمة فارغة فعلاً أبداً، ويصبح "الإدراج في البداية" و"الإدراج في المنتصف" الشيفرة نفسها.
- **ارسم الأسهم** قبل أن تغيّرها. فالتمرين الكلاسيكي، عكس القائمة في مكانها، يحتاج إلى ثلاثة مؤشرات:

\`\`\`python
def reverse(head):
    prev = None
    cur = head
    while cur is not None:
        nxt = cur.next      # تذكّر بقية القائمة
        cur.next = prev     # اقلب هذا السهم
        prev = cur
        cur = nxt
    return prev             # الذيل القديم هو الرأس الجديد
\`\`\`

**مصفوفة أم قائمة مترابطة؟** عملياً تكون المصفوفة عادةً أسرع في المرور على العناصر، لأن عناصرها متجاورة فتحمّلها ذاكرة المعالج المخبئية (cache) على دفعات. وتفوز القوائم المترابطة حين تحتفظ **بمراجع إلى مواضع** وتُدرج وتحذف عندها باستمرار: مؤشر الكتابة في محرّر النصوص، وترتيب "الأقل استخداماً مؤخراً" في ذاكرة مخبئية (hash map مع قائمة مترابطة ثنائية)، أو الكتل الحرة في مدير الذاكرة.`,
    },
  },
  {
    type: "code-demo",
    lang: "python",
    code: `class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next

def show(head):
    parts = []
    while head is not None:
        parts.append(str(head.value))
        head = head.next
    return " -> ".join(parts + ["None"])

def get(head, k):            # O(k): there is no shortcut to the k-th node
    for _ in range(k):
        head = head.next
    return head.value

def reverse(head):
    prev, cur = None, head
    while cur is not None:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    return prev

# Build 3 -> 7 -> 9 by pushing at the front: O(1) each time
head = None
for v in (9, 7, 3):
    head = Node(v, head)
print("built:     ", show(head))

seven = head.next
seven.next = Node(8, seven.next)          # insert after a node we hold: O(1)
print("insert 8:  ", show(head))

head.next = head.next.next                # unlink the 7: one pointer change
print("delete 7:  ", show(head))
print("item at 2: ", get(head, 2))

head = reverse(head)
print("reversed:  ", show(head))
`,
    explanation: {
      en: "Every edit changes one or two pointers and never moves the other nodes. Reading the item at index 2 has to walk there node by node. Reversal turns each arrow around once, so it is O(n) time and O(1) extra space.",
      ar: "كل تعديل يغيّر مؤشراً أو اثنين ولا يحرّك العقد الأخرى أبداً. أما قراءة العنصر في الفهرس 2 فتمشي إليه عقدة بعد عقدة. والعكس يقلب كل سهم مرة واحدة، فزمنه O(n) ومساحته الإضافية O(1).",
    },
  },
  {
    type: "text",
    body: {
      en: `## Stacks: last in, first out

A **stack** offers three operations, all **O(1)**: \`push\` (put on top), \`pop\` (take the top off) and \`peek\` (look at the top). You never touch the middle.

**Implementing one is easy.** Use the **end** of a dynamic array: Python \`list.append\` / \`list.pop()\`, JavaScript \`push\` / \`pop\`, C++ \`std::stack\` or \`std::vector\`. In Java, use \`ArrayDeque\`: its documentation notes it is likely to be faster than the legacy \`Stack\` class when used as a stack. The head of a linked list works too.

**Where stacks appear:**

- **Undo and redo**: two stacks. Undo pops from "done" and pushes onto "undone"; redo does the reverse; any new action clears "undone".
- **The call stack**: every function call pushes a frame with its local variables, every \`return\` pops it. That is why the most recent call finishes first, and why runaway recursion ends in a *stack overflow* (next lesson).
- **Depth-first search** keeps the vertices still to explore on a stack (you met it in Trees & Graphs).
- **Bracket matching** and **expression evaluation**, below.

**Bracket matching.** Push every opening bracket. For every closing bracket, the top of the stack must be its partner: pop it. Watch the stack for \`{[()]}\`:

\`\`\`
read {   push        stack: {
read [   push        stack: { [
read (   push        stack: { [ (
read )   top is (    pop  -> stack: { [
read ]   top is [    pop  -> stack: {
read }   top is {    pop  -> stack: (empty)   => balanced
\`\`\`

There are exactly three ways to fail: a closing bracket that does **not match** the top, a closing bracket when the stack is **empty**, and opening brackets **left over** at the end. Counting brackets is not enough: \`([)]\` has two of each but is wrong.

**Expression evaluation.** In **postfix** notation, also called Reverse Polish Notation (RPN), the operator comes after its operands: \`3 4 + 2 *\` means (3 + 4) x 2. A stack evaluates it in one pass: a number is pushed; an operator pops **two** values (the first pop is the **right** operand), applies itself and pushes the result. No parentheses and no precedence rules are needed. The Java Virtual Machine executes bytecode the same way on an *operand stack* (the JVM specification, section 2.6.2: \`iadd\` pops two ints and pushes their sum), and Dijkstra's *shunting-yard* algorithm uses a stack of operators to turn ordinary infix expressions into postfix.

\`\`\`
3 4 + 2 *
push 3        [3]
push 4        [3, 4]
+  pop 4, 3   [7]
push 2        [7, 2]
*  pop 2, 7   [14]     -> 14
\`\`\``,
      ar: `## المكدّسات: آخر من يدخل أول من يخرج

يقدّم **المكدّس (stack)** ثلاث عمليات، كلها **O(1)**: \`push\` (ضع في الأعلى) و\`pop\` (انزع العنصر العلوي) و\`peek\` (انظر إلى العنصر العلوي). ولا تلمس المنتصف أبداً.

**تنفيذه سهل.** استخدم **نهاية** مصفوفة ديناميكية: \`list.append\` و\`list.pop()\` في Python، و\`push\` و\`pop\` في JavaScript، و\`std::stack\` أو \`std::vector\` في C++. وفي Java استخدم \`ArrayDeque\`: إذ تذكر وثائقه أنه على الأرجح أسرع من الصنف القديم \`Stack\` حين يُستخدم كمكدّس. ورأس القائمة المترابطة يصلح أيضاً.

**أين تظهر المكدّسات:**

- **التراجع والإعادة (undo/redo)**: مكدّسان. التراجع يسحب من "المنجَز" ويدفع إلى "الملغى"؛ والإعادة تفعل العكس؛ وأي إجراء جديد يُفرغ "الملغى".
- **مكدّس الاستدعاءات (call stack)**: كل استدعاء دالة يدفع إطاراً (frame) فيه متغيراتها المحلية، وكل \`return\` يسحبه. ولهذا ينتهي أحدث استدعاء أولاً، ولهذا ينتهي التكرار الذاتي الجامح بـ*فيضان المكدّس (stack overflow)* (الدرس التالي).
- **البحث بالعمق (DFS)** يحفظ الرؤوس التي بقي استكشافها في مكدّس (التقيت به في درس الأشجار والـ Graphs).
- **مطابقة الأقواس** و**حساب التعابير**، كما يلي.

**مطابقة الأقواس.** ادفع كل قوس فتح. ولكل قوس إغلاق يجب أن يكون أعلى المكدّس شريكه: فاسحبه. راقب المكدّس مع \`{[()]}\`:

\`\`\`
read {   push        stack: {
read [   push        stack: { [
read (   push        stack: { [ (
read )   top is (    pop  -> stack: { [
read ]   top is [    pop  -> stack: {
read }   top is {    pop  -> stack: (empty)   => balanced
\`\`\`

هناك ثلاث طرق للفشل بالضبط: قوس إغلاق **لا يطابق** أعلى المكدّس، وقوس إغلاق والمكدّس **فارغ**، وأقواس فتح **متبقية** في النهاية. وعدّ الأقواس لا يكفي: فـ \`([)]\` فيها اثنان من كل نوع لكنها خاطئة.

**حساب التعابير.** في الصيغة **اللاحقة (postfix)**، وتُسمّى أيضاً الترميز البولندي العكسي (RPN)، يأتي المعامل بعد معاملَيه: \`3 4 + 2 *\` تعني (3 + 4) × 2. والمكدّس يحسبها في مرور واحد: العدد يُدفع؛ والمعامل يسحب **قيمتين** (أول ما يُسحب هو المعامَل **الأيمن**)، ويطبّق نفسه ويدفع النتيجة. لا حاجة إلى أقواس ولا إلى قواعد أسبقية. وآلة Java الافتراضية (JVM) تنفّذ الـ bytecode بالطريقة نفسها على *مكدّس المعاملات (operand stack)* (مواصفة JVM، القسم 2.6.2: التعليمة \`iadd\` تسحب عددين صحيحين وتدفع مجموعهما)، وخوارزمية *ساحة التحويل (shunting-yard)* التي وضعها Dijkstra تستخدم مكدّساً للمعاملات لتحويل التعابير المعتادة (infix) إلى الصيغة اللاحقة.

\`\`\`
3 4 + 2 *
push 3        [3]
push 4        [3, 4]
+  pop 4, 3   [7]
push 2        [7, 2]
*  pop 2, 7   [14]     -> 14
\`\`\``,
    },
  },
  {
    type: "lab",
    id: "bracket-checker",
    lang: "python",
    prompt: {
      en: `**Check the brackets** the way a code editor does. Read one line of text. It may contain the brackets \`()\`, \`[]\`, \`{}\` and any other characters, which you ignore.

**Output:** \`OK\` if every bracket is matched. Otherwise the **1-based position** of the first problem:
- a closing bracket that does not match the most recent unclosed opening bracket, or that arrives when nothing is open: print **its** position;
- if the line ends while brackets are still open: print the position of the **earliest** (leftmost) bracket that was never closed.

**Examples:** \`print(a[i] + {b: (c)})\` prints \`OK\`. \`foo(bar[i)\` prints \`10\`: the \`)\` at position 10 arrives while \`[\` is the most recent open bracket. \`while (x[i] {\` prints \`7\`: both \`(\` (position 7) and \`{\` (position 13) stay open, and the earliest is reported.

Keep a stack of \`(bracket, position)\` pairs.`,
      ar: `**دقّق الأقواس** كما يفعل محرّر الشيفرة. اقرأ سطراً واحداً من النص. قد يحتوي الأقواس \`()\` و\`[]\` و\`{}\` وأي محارف أخرى تتجاهلها.

**المخرج:** \`OK\` إن كان كل قوس مطابَقاً. وإلا فاطبع **الموضع (بدءاً من 1)** لأول مشكلة:
- قوس إغلاق لا يطابق آخر قوس فتح لم يُغلق بعد، أو يصل والمكدّس فارغ: اطبع موضع**ه** هو؛
- وإن انتهى السطر وما زالت أقواس مفتوحة: اطبع موضع **أبكر** قوس (الأقصى يساراً) لم يُغلق أبداً.

**أمثلة:** \`print(a[i] + {b: (c)})\` يطبع \`OK\`. و\`foo(bar[i)\` يطبع \`10\`: فالقوس \`)\` في الموضع 10 يصل بينما \`[\` هو آخر قوس مفتوح. و\`while (x[i] {\` يطبع \`7\`: فالقوسان \`(\` (الموضع 7) و\`{\` (الموضع 13) يبقيان مفتوحين، ويُبلَّغ عن الأبكر.

احتفظ بمكدّس من الأزواج \`(القوس، الموضع)\`.`,
    },
    starterCode: `import sys

line = sys.stdin.readline().rstrip("\\r\\n")
pairs = {")": "(", "]": "[", "}": "{"}

# TODO: check the brackets with a stack.
# 1. For every character (enumerate(line, start=1) gives 1-based positions):
#    an opening bracket -> push (bracket, position);
#    a closing bracket  -> if the stack is empty or its top is not pairs[ch], the answer is this position;
#                          otherwise pop.
# 2. If the line ends with brackets still open, the answer is the position at the BOTTOM of the stack.
answer = "OK"
print(answer)
`,
    solution: `import sys

line = sys.stdin.readline().rstrip("\\r\\n")
pairs = {")": "(", "]": "[", "}": "{"}

stack = []                       # (bracket, 1-based position), most recent on top
answer = "OK"
for pos, ch in enumerate(line, start=1):
    if ch in "([{":
        stack.append((ch, pos))
    elif ch in pairs:
        if not stack or stack[-1][0] != pairs[ch]:
            answer = str(pos)    # wrong partner, or nothing is open
            break
        stack.pop()

if answer == "OK" and stack:
    answer = str(stack[0][1])    # the earliest bracket that was never closed

print(answer)
`,
    hints: [
      { en: "Loop with for pos, ch in enumerate(line, start=1). Push (ch, pos) for '(', '[' and '{'; ignore every character that is not a bracket.", ar: "كرّر بـ for pos, ch in enumerate(line, start=1). ادفع (ch, pos) لـ '(' و'[' و'{'؛ وتجاهل كل محرف ليس قوساً." },
      { en: "For a closing bracket: if not stack or stack[-1][0] != pairs[ch], print pos and stop. Otherwise stack.pop().", ar: "لقوس الإغلاق: إن تحقق not stack or stack[-1][0] != pairs[ch] فاطبع pos وتوقف. وإلا فنفّذ stack.pop()." },
      { en: "After the loop, leftover brackets mean an error at the earliest one: that is the bottom of the stack, stack[0][1], not the top.", ar: "بعد الحلقة، الأقواس المتبقية تعني خطأً عند أبكرها: وهو قاع المكدّس stack[0][1] لا أعلاه." },
    ],
    tests: [
      { name: { en: "Balanced code with other characters", ar: "شيفرة متوازنة مع محارف أخرى" }, stdin: "print(a[i] + {b: (c)})\n", expected: "OK" },
      { name: { en: "The example: wrong closing bracket", ar: "المثال: قوس إغلاق خاطئ" }, stdin: "foo(bar[i)\n", expected: "10" },
      { name: { en: "A closing bracket with nothing open", ar: "قوس إغلاق ولا شيء مفتوح" }, stdin: "a)b(\n", expected: "2" },
      { name: { en: "Never closed: report the earliest", ar: "لم يُغلق أبداً: بلّغ عن الأبكر" }, stdin: "while (x[i] {\n", expected: "7" },
      { name: { en: "Empty line", ar: "سطر فارغ" }, stdin: "\n", expected: "OK" },
      { name: { en: "6,000 nested brackets, wrong at the very end", ar: "6,000 قوس متداخل، والخطأ في آخرها" }, stdin: deepBrackets, expected: "6000" },
    ],
    sampleInput: "foo(bar[i)\n",
  },
  {
    type: "text",
    body: {
      en: `## Queues: first in, first out

A **queue** adds at the **back** (\`enqueue\`) and removes from the **front** (\`dequeue\`), both in **O(1)** when it is implemented well. A **deque** (double-ended queue) allows both operations at both ends.

**The classic trap.** Removing the first item of a dynamic array shifts every other item one place left: **O(n)** per dequeue, O(n²) for a whole run. The Python documentation says it plainly: lists "incur O(n) memory movement costs for \`pop(0)\` and \`insert(0, v)\`", while \`collections.deque\` appends and pops at either end in approximately O(1). JavaScript's \`Array.prototype.shift\` is specified (ECMAScript) as moving every remaining element down one index, so treat it as O(n) too. What to use instead:

- Python: \`collections.deque\` with \`append\` and \`popleft\`
- Java: \`ArrayDeque\` with \`offer\` and \`poll\`
- C++: \`std::queue\` (built on \`std::deque\`)
- JavaScript or Go: an array plus a **head index** that moves forward, or a ring buffer

**The ring buffer** (circular buffer) is the standard array implementation. Keep a fixed array, the index of the front item (\`head\`) and the number of items (\`size\`). The next free slot is \`(head + size) % capacity\`: when the back reaches the end of the array it **wraps around** to index 0. Nothing ever shifts.

\`\`\`
capacity 5: enqueue A B C D, dequeue twice (A, B), enqueue E F

index:  0   1   2   3   4
slot: [ F | . | C | D | E ]
        ^       ^
        |       head = 2: C leaves next
        F wrapped around to index 0; the next free slot is (2 + 4) % 5 = 1
\`\`\`

When the buffer is full you either **refuse** new items (fixed-size buffers in keyboards, audio and network devices do that) or **grow**: copy the items, in queue order, into an array twice as large. Growing now and then keeps enqueue at O(1) **amortised**, like appending to a dynamic array.

**Two stacks make a queue.** Push new items onto an *in* stack. To dequeue, pop from an *out* stack; only when *out* is empty, move everything from *in* to *out* (which reverses the order). A single dequeue can cost O(n), but every item is moved at most once, so a sequence of n operations costs O(n) in total: **O(1) amortised** per operation.

**Where queues appear:** print and job queues, message queues between services, the run queue of an operating system's round-robin scheduler, packets waiting in a router, keyboard input buffers, and breadth-first search (Trees & Graphs), which visits vertices in the order it discovered them.`,
      ar: `## الطوابير: أول من يدخل أول من يخرج

يضيف **الطابور (queue)** في **المؤخرة** (\`enqueue\`) ويحذف من **المقدّمة** (\`dequeue\`)، وكلتاهما **O(1)** إن نُفّذ جيداً. أما **الـ deque** (الطابور ثنائي الطرف) فيسمح بالعمليتين عند الطرفين كليهما.

**الفخ الكلاسيكي.** حذف أول عنصر من مصفوفة ديناميكية يزيح كل العناصر الأخرى مكاناً إلى اليسار: **O(n)** لكل سحب، وO(n²) لتشغيل كامل. ووثائق Python تقولها صراحة: القوائم "تتكبّد كلفة O(n) لتحريك الذاكرة مع \`pop(0)\` و\`insert(0, v)\`"، بينما يضيف \`collections.deque\` ويسحب عند أي من الطرفين بنحو O(1). والدالة \`Array.prototype.shift\` في JavaScript معرَّفة في المواصفة (ECMAScript) بأنها تنقل كل عنصر متبقٍّ فهرساً واحداً إلى الأسفل، فاعتبرها O(n) أيضاً. وما تستخدمه بدلاً من ذلك:

- Python: \`collections.deque\` مع \`append\` و\`popleft\`
- Java: \`ArrayDeque\` مع \`offer\` و\`poll\`
- C++: \`std::queue\` (المبني على \`std::deque\`)
- JavaScript أو Go: مصفوفة مع **فهرس للمقدّمة** يتقدّم إلى الأمام، أو مخزن دائري

**المخزن الدائري (ring buffer)** هو التنفيذ القياسي بالمصفوفة. احتفظ بمصفوفة ثابتة الحجم، وبفهرس العنصر الأمامي (\`head\`)، وبعدد العناصر (\`size\`). والموضع الشاغر التالي هو \`(head + size) % capacity\`: فحين تبلغ المؤخرة نهاية المصفوفة **تلتفّ** إلى الفهرس 0. ولا ينزاح شيء أبداً.

\`\`\`
capacity 5: enqueue A B C D, dequeue twice (A, B), enqueue E F

index:  0   1   2   3   4
slot: [ F | . | C | D | E ]
        ^       ^
        |       head = 2: C leaves next
        F wrapped around to index 0; the next free slot is (2 + 4) % 5 = 1
\`\`\`

وحين يمتلئ المخزن فإما أن **ترفض** العناصر الجديدة (المخازن ثابتة الحجم في لوحات المفاتيح وأجهزة الصوت والشبكات تفعل ذلك)، وإما أن **تُكبّره**: انسخ العناصر بترتيب الطابور إلى مصفوفة بضعف الحجم. والتكبير من حين لآخر يُبقي الإضافة O(1) **مُهلَكة (amortised)**، تماماً كالإضافة إلى مصفوفة ديناميكية.

**مكدّسان يصنعان طابوراً.** ادفع العناصر الجديدة إلى مكدّس *الدخول (in)*. وللسحب، اسحب من مكدّس *الخروج (out)*؛ ولا تنقل كل ما في *in* إلى *out* (وهذا يعكس الترتيب) إلا حين يكون *out* فارغاً. قد يكلّف سحب واحد O(n)، لكن كل عنصر يُنقل مرة واحدة على الأكثر، فتكلّف سلسلة من n عملية O(n) في المجموع: أي **O(1) مُهلَكة** لكل عملية.

**أين تظهر الطوابير:** طوابير الطباعة والمهام، وطوابير الرسائل بين الخدمات، وطابور التشغيل في مجدول round-robin لنظام التشغيل، والحزم المنتظرة في الموجّه (router)، ومخازن إدخال لوحة المفاتيح، والبحث بالعرض BFS (درس الأشجار والـ Graphs) الذي يزور الرؤوس بترتيب اكتشافها.`,
    },
  },
  {
    type: "code-demo",
    lang: "js",
    code: `// A queue on a ring buffer: O(1) enqueue and dequeue, nothing ever shifts
class RingQueue {
  constructor(capacity = 4) {
    this.buf = new Array(capacity).fill(null);
    this.head = 0; // index of the front item
    this.size = 0;
  }
  enqueue(x) {
    if (this.size === this.buf.length) this.grow();
    this.buf[(this.head + this.size) % this.buf.length] = x;
    this.size++;
  }
  dequeue() {
    if (this.size === 0) return undefined;
    const x = this.buf[this.head];
    this.buf[this.head] = null;
    this.head = (this.head + 1) % this.buf.length;
    this.size--;
    return x;
  }
  grow() { // copy the items in queue order into an array twice as large
    const bigger = new Array(this.buf.length * 2).fill(null);
    for (let i = 0; i < this.size; i++) bigger[i] = this.buf[(this.head + i) % this.buf.length];
    this.buf = bigger;
    this.head = 0;
  }
}

const slots = (q) => q.buf.map((x) => x ?? ".").join(" ");
const q = new RingQueue(4);
for (const job of ["A", "B", "C"]) q.enqueue(job);
console.log("served:", q.dequeue(), q.dequeue());
for (const job of ["D", "E", "F"]) q.enqueue(job); // E and F wrap around to the front of the array
console.log("slots:", slots(q), "| head =", q.head);
q.enqueue("G"); // full: grow to 8 slots
console.log("after growing:", slots(q));
const order = [];
while (q.size > 0) order.push(q.dequeue());
console.log("served in order:", order.join(" "));

// Undo and redo are two stacks
const done = [];
const undone = [];
const type = (word) => { done.push(word); undone.length = 0; }; // a new action clears redo
const undo = () => { if (done.length) undone.push(done.pop()); };
const redo = () => { if (undone.length) done.push(undone.pop()); };
type("Hello"); type("big"); type("world");
undo(); undo(); redo();
console.log("text:", done.join(" "), "| can still redo:", undone.join(" "));
`,
    explanation: {
      en: "E and F land at indexes 0 and 1 while C and D are still at 2 and 3: the queue wraps around instead of shifting. When G arrives the buffer is full, so it grows and the items are copied in queue order. The undo part shows the two-stack design: undo moves a word from one stack to the other, redo moves it back.",
      ar: "يقع E وF في الفهرسين 0 و1 بينما ما زال C وD في 2 و3: فالطابور يلتفّ بدل أن يزيح العناصر. وحين يصل G يكون المخزن ممتلئاً، فيكبر وتُنسخ العناصر بترتيب الطابور. أما جزء التراجع فيُظهر تصميم المكدّسين: التراجع ينقل كلمة من مكدّس إلى الآخر، والإعادة تعيدها.",
    },
  },
  {
    type: "lab",
    id: "linked-list-editor",
    lang: "c",
    prompt: {
      en: `**A text editor with a cursor.** Store the text in a **doubly linked list** of characters, so that every edit at the cursor costs O(1) however long the text is. The cursor sits *between* characters and starts **after the last character**.

**Input:** the first line is the starting text (1 to 10,000 lowercase letters). The second line has \`m\`, the number of commands. Then \`m\` lines, each one of:
- \`L\`: move the cursor one character left (nothing happens at the start)
- \`R\`: move the cursor one character right (nothing happens at the end)
- \`B\`: delete the character just left of the cursor (nothing happens at the start)
- \`I c\`: insert the lowercase letter \`c\` just left of the cursor (the cursor ends up after it)

**Output:** the final text on one line (an empty line if everything was deleted).

**Example:** text \`abc\` and the commands \`L\`, \`L\`, \`B\`, \`I x\`, \`R\`, \`I y\`:
\`\`\`
abc|  -> L -> ab|c -> L -> a|bc -> B -> |bc -> I x -> x|bc -> R -> xb|c -> I y -> xby|c
\`\`\`
prints \`xbyc\`.

The nodes are array slots: \`ch[i]\`, \`prv[i]\` and \`nxt[i]\` (-1 means "no node"). Slot 0 is a **sentinel** before the first letter, and \`cursor\` is the node just left of the cursor (0 when the cursor is at the start). The starter already builds the list; you write the four commands.`,
      ar: `**محرّر نصوص بمؤشر كتابة.** خزّن النص في **قائمة مترابطة ثنائية** من المحارف، لتكلّف كل عملية تعديل عند المؤشر O(1) مهما طال النص. يقع المؤشر *بين* المحارف ويبدأ **بعد آخر محرف**.

**المدخل:** السطر الأول هو النص الابتدائي (من 1 إلى 10,000 حرف لاتيني صغير). والسطر الثاني فيه \`m\`، عدد الأوامر. ثم \`m\` سطراً، كل منها واحد مما يلي:
- \`L\`: حرّك المؤشر محرفاً واحداً إلى اليسار (لا يحدث شيء عند البداية)
- \`R\`: حرّك المؤشر محرفاً واحداً إلى اليمين (لا يحدث شيء عند النهاية)
- \`B\`: احذف المحرف الواقع مباشرة يسار المؤشر (لا يحدث شيء عند البداية)
- \`I c\`: أدرج الحرف الصغير \`c\` مباشرة يسار المؤشر (فيصبح المؤشر بعده)

**المخرج:** النص النهائي في سطر واحد (سطر فارغ إن حُذف كل شيء).

**مثال:** النص \`abc\` والأوامر \`L\` و\`L\` و\`B\` و\`I x\` و\`R\` و\`I y\`:
\`\`\`
abc|  -> L -> ab|c -> L -> a|bc -> B -> |bc -> I x -> x|bc -> R -> xb|c -> I y -> xby|c
\`\`\`
يطبع \`xbyc\`.

العقد خانات في مصفوفات: \`ch[i]\` و\`prv[i]\` و\`nxt[i]\` (والقيمة -1 تعني "لا عقدة"). والخانة 0 **عقدة حارسة** قبل أول حرف، و\`cursor\` هي العقدة الواقعة مباشرة يسار المؤشر (0 حين يكون المؤشر في البداية). شيفرة البداية تبني القائمة مسبقاً؛ وأنت تكتب الأوامر الأربعة.`,
    },
    starterCode: `#include <stdio.h>
#include <string.h>

#define MAXN 200005 /* starting letters + one node per insert */

char text[MAXN];
char ch[MAXN];
int prv[MAXN], nxt[MAXN]; /* -1 means "no node" */

int main(void) {
    int m = 0;
    if (scanf("%10005s", text) != 1) return 0;
    if (scanf("%d", &m) != 1) m = 0;
    int n = (int)strlen(text);

    /* Node 0 is the sentinel; nodes 1..n hold the starting letters in order. */
    prv[0] = -1;
    nxt[0] = -1;
    int last = 0;
    for (int i = 1; i <= n; i++) {
        ch[i] = text[i - 1];
        prv[i] = last;
        nxt[i] = -1;
        nxt[last] = i;
        last = i;
    }
    int used = n + 1;  /* the next free node */
    int cursor = last; /* the node just left of the cursor (0 = at the start) */

    for (int k = 0; k < m; k++) {
        char cmd[2], c[2];
        if (scanf("%1s", cmd) != 1) break;
        if (cmd[0] == 'I' && scanf("%1s", c) != 1) break;
        /* TODO: carry out the command:
         *  L: if cursor is not 0, move it to prv[cursor].
         *  R: if nxt[cursor] is not -1, move it to nxt[cursor].
         *  B: if cursor is not 0, unlink it (fix nxt of its prev and prv of its next) and move to its prev.
         *  I: take node = used++, store c[0], link it between cursor and nxt[cursor], then cursor = node.
         */
        (void)used;
        (void)cursor;
    }

    for (int i = nxt[0]; i != -1; i = nxt[i]) putchar(ch[i]);
    putchar('\\n');
    return 0;
}
`,
    solution: `#include <stdio.h>
#include <string.h>

#define MAXN 200005 /* starting letters + one node per insert */

char text[MAXN];
char ch[MAXN];
int prv[MAXN], nxt[MAXN]; /* -1 means "no node" */

int main(void) {
    int m = 0;
    if (scanf("%10005s", text) != 1) return 0;
    if (scanf("%d", &m) != 1) m = 0;
    int n = (int)strlen(text);

    /* Node 0 is the sentinel; nodes 1..n hold the starting letters in order. */
    prv[0] = -1;
    nxt[0] = -1;
    int last = 0;
    for (int i = 1; i <= n; i++) {
        ch[i] = text[i - 1];
        prv[i] = last;
        nxt[i] = -1;
        nxt[last] = i;
        last = i;
    }
    int used = n + 1;  /* the next free node */
    int cursor = last; /* the node just left of the cursor (0 = at the start) */

    for (int k = 0; k < m; k++) {
        char cmd[2], c[2];
        if (scanf("%1s", cmd) != 1) break;
        if (cmd[0] == 'I' && scanf("%1s", c) != 1) break;
        if (cmd[0] == 'L') {
            if (cursor != 0) cursor = prv[cursor];
        } else if (cmd[0] == 'R') {
            if (nxt[cursor] != -1) cursor = nxt[cursor];
        } else if (cmd[0] == 'B') {
            if (cursor != 0) {
                int p = prv[cursor], q = nxt[cursor];
                nxt[p] = q;              /* unlink: the neighbours now point at each other */
                if (q != -1) prv[q] = p;
                cursor = p;
            }
        } else if (cmd[0] == 'I') {
            int node = used++;
            ch[node] = c[0];
            prv[node] = cursor;          /* link the new node between cursor and its old next */
            nxt[node] = nxt[cursor];
            if (nxt[cursor] != -1) prv[nxt[cursor]] = node;
            nxt[cursor] = node;
            cursor = node;
        }
    }

    for (int i = nxt[0]; i != -1; i = nxt[i]) putchar(ch[i]);
    putchar('\\n');
    return 0;
}
`,
    hints: [
      { en: "L and R only move the cursor: cursor = prv[cursor] (unless cursor is 0) and cursor = nxt[cursor] (unless nxt[cursor] is -1).", ar: "الأمران L وR يحرّكان المؤشر فقط: cursor = prv[cursor] (إلا إن كانت cursor تساوي 0) وcursor = nxt[cursor] (إلا إن كانت nxt[cursor] تساوي -1)." },
      { en: "B deletes the node cursor: with p = prv[cursor] and q = nxt[cursor], set nxt[p] = q, and prv[q] = p if q is not -1. Then cursor = p. The sentinel means p always exists.", ar: "الأمر B يحذف العقدة cursor: مع p = prv[cursor] وq = nxt[cursor] اجعل nxt[p] = q، واجعل prv[q] = p إن لم تكن q تساوي -1. ثم cursor = p. والعقدة الحارسة تضمن وجود p دائماً." },
      { en: "I: node = used++; ch[node] = c[0]; prv[node] = cursor; nxt[node] = nxt[cursor]; if nxt[cursor] != -1 then prv[nxt[cursor]] = node; nxt[cursor] = node; cursor = node. The order of these lines matters.", ar: "الأمر I: node = used++; ch[node] = c[0]; prv[node] = cursor; nxt[node] = nxt[cursor]; وإن كانت nxt[cursor] != -1 فاجعل prv[nxt[cursor]] = node؛ ثم nxt[cursor] = node; cursor = node. وترتيب هذه الأسطر مهم." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "abc\n6\nL\nL\nB\nI x\nR\nI y\n", expected: "xbyc" },
      { name: { en: "Edits at both ends", ar: "تعديلات عند الطرفين" }, stdin: "mid\n10\nL\nL\nL\nB\nI a\nR\nR\nR\nR\nI z\n", expected: "amidz" },
      { name: { en: "Backspace in the middle", ar: "حذف في المنتصف" }, stdin: "abcd\n5\nL\nL\nB\nB\nI z\n", expected: "zcd" },
      { name: { en: "Delete everything", ar: "حذف كل شيء" }, stdin: "abc\n4\nB\nB\nB\nB\n", expected: "" },
      { name: { en: "Moving alone changes nothing", ar: "التحريك وحده لا يغيّر شيئاً" }, stdin: "hello\n5\nL\nR\nL\nL\nR\n", expected: "hello" },
      { name: { en: "6,400 commands", ar: "6,400 أمر" }, stdin: editorInput, expected: editorExpected },
    ],
    sampleInput: "abc\n6\nL\nL\nB\nI x\nR\nI y\n",
  },
  {
    type: "text",
    body: {
      en: `## A queue at work: the rate limiter

Public APIs protect themselves with **rate limits**: "at most 100 requests per minute per user". A server that refuses a request for that reason answers with HTTP status **429 Too Many Requests**, defined in RFC 6585.

One precise way to enforce "at most \`L\` requests in any window of \`W\` seconds" is the **sliding log**: remember the timestamps of the requests you allowed, oldest first. That is a queue, because timestamps arrive in order and leave in the same order:

1. A request arrives at time \`t\`.
2. **Dequeue** every timestamp \`s\` with \`s <= t - W\`: those requests have left the window \`(t - W, t]\`.
3. If fewer than \`L\` timestamps remain, **allow** the request and **enqueue** \`t\`. Otherwise **deny** it, and do not record it: a refused request should not use up the quota.

\`\`\`
L = 2, W = 10            window = (t - 10, t]

t = 1   queue []        -> allow   queue [1]
t = 2   queue [1]       -> allow   queue [1, 2]
t = 3   queue [1, 2]    -> deny    (2 requests already in (-7, 3])
t = 11  drop 1          -> allow   queue [2, 11]
t = 12  drop 2          -> allow   queue [11, 12]
\`\`\`

Each timestamp is enqueued once and dequeued at most once, so n requests cost **O(n)** in total even though step 2 is a loop. The queue never holds more than \`L\` items. (Production systems often use cheaper approximations such as fixed windows or token buckets; the sliding log is the exact version.)`,
      ar: `## طابور في العمل: محدِّد المعدّل

تحمي واجهات API العامة نفسها **بحدود للمعدّل (rate limits)**: "100 طلب في الدقيقة على الأكثر لكل مستخدم". والخادم الذي يرفض طلباً لهذا السبب يجيب برمز حالة HTTP **‏429 Too Many Requests**، المعرَّف في RFC 6585.

ومن الطرق الدقيقة لفرض "\`L\` طلباً على الأكثر في أي نافذة مدتها \`W\` ثانية" طريقة **السجل المنزلق (sliding log)**: تذكّر الطوابع الزمنية للطلبات التي سمحت بها، الأقدم أولاً. وهذا طابور، لأن الطوابع الزمنية تصل بالترتيب وتغادر بالترتيب نفسه:

1. يصل طلب في اللحظة \`t\`.
2. **اسحب** كل طابع زمني \`s\` يحقق \`s <= t - W\`: فتلك الطلبات غادرت النافذة \`(t - W, t]\`.
3. إن بقي أقل من \`L\` طابعاً **فاسمح** بالطلب و**أضف** \`t\` إلى الطابور. وإلا **فارفضه** ولا تسجّله: فالطلب المرفوض لا ينبغي أن يستهلك الحصة.

\`\`\`
L = 2, W = 10            window = (t - 10, t]

t = 1   queue []        -> allow   queue [1]
t = 2   queue [1]       -> allow   queue [1, 2]
t = 3   queue [1, 2]    -> deny    (2 requests already in (-7, 3])
t = 11  drop 1          -> allow   queue [2, 11]
t = 12  drop 2          -> allow   queue [11, 12]
\`\`\`

كل طابع زمني يُضاف مرة واحدة ويُسحب مرة واحدة على الأكثر، فتكلّف n طلباً **O(n)** في المجموع رغم أن الخطوة 2 حلقة. ولا يحمل الطابور أكثر من \`L\` عنصراً أبداً. (الأنظمة الإنتاجية تستخدم غالباً تقريبات أرخص مثل النوافذ الثابتة أو دلو الرموز token bucket؛ أما السجل المنزلق فهو النسخة الدقيقة.)`,
    },
  },
  {
    type: "lab",
    id: "rate-limiter",
    lang: "go",
    prompt: {
      en: `**Build a rate limiter.** An API allows at most \`L\` requests in any window of \`W\` seconds. Requests arrive at whole-second timestamps that never decrease. A request at time \`t\` is **allowed** if fewer than \`L\` *allowed* requests have a timestamp \`s\` with \`t - W < s <= t\`; otherwise it is **denied**. A denied request does not count against later ones.

**Input:** the first line has \`L W n\` (all at least 1). The second line has the \`n\` timestamps.

**Output:** \`n\` lines, each \`ALLOW\` or \`DENY\`.

**Example:** input
\`\`\`
2 10 6
1 2 3 11 12 21
\`\`\`
prints \`ALLOW\`, \`ALLOW\`, \`DENY\`, \`ALLOW\`, \`ALLOW\`, \`ALLOW\` (one per line), as traced in the lesson; at 21 the 11 leaves the window.

Keep the timestamps of the allowed requests in a queue: a slice plus a \`head\` index (dequeue is \`head++\`: nothing is copied). Before deciding about \`t\`, dequeue every timestamp \`<= t - W\`.`,
      ar: `**ابنِ محدِّداً للمعدّل.** تسمح واجهة API بـ \`L\` طلباً على الأكثر في أي نافذة مدتها \`W\` ثانية. تصل الطلبات بطوابع زمنية بالثواني الكاملة لا تتناقص أبداً. الطلب في اللحظة \`t\` **يُسمح** به إن كان عدد الطلبات *المسموح بها* ذات الطابع \`s\` الذي يحقق \`t - W < s <= t\` أقل من \`L\`؛ وإلا **يُرفض**. والطلب المرفوض لا يُحتسب على الطلبات اللاحقة.

**المدخل:** السطر الأول فيه \`L W n\` (كلها 1 على الأقل). والسطر الثاني فيه الطوابع الزمنية الـ \`n\`.

**المخرج:** \`n\` سطراً، في كل منها \`ALLOW\` أو \`DENY\`.

**مثال:** المدخل
\`\`\`
2 10 6
1 2 3 11 12 21
\`\`\`
يطبع \`ALLOW\` ثم \`ALLOW\` ثم \`DENY\` ثم \`ALLOW\` ثم \`ALLOW\` ثم \`ALLOW\` (كل كلمة في سطر)، كما تتبّعناه في الدرس؛ وعند 21 يغادر الطابع 11 النافذة.

احتفظ بطوابع الطلبات المسموح بها في طابور: شريحة (slice) مع فهرس \`head\` (السحب هو \`head++\`: لا يُنسخ شيء). وقبل أن تقرّر بشأن \`t\` اسحب كل طابع \`<= t - W\`.`,
    },
    starterCode: `package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	in := bufio.NewReader(os.Stdin)
	out := bufio.NewWriter(os.Stdout)
	defer out.Flush()

	var limit, window, n int
	fmt.Fscan(in, &limit, &window, &n)

	// TODO: keep the timestamps of ALLOWED requests in a queue:
	//   queue := make([]int, 0, n) and head := 0 (queue[head:] is the live part).
	// For each request t:
	//   1. while head < len(queue) and queue[head] <= t-window: head++ (it left the window)
	//   2. if len(queue)-head < limit: append t and print ALLOW, otherwise print DENY.
	for i := 0; i < n; i++ {
		var t int
		fmt.Fscan(in, &t)
		fmt.Fprintln(out, "ALLOW")
	}
}
`,
    solution: `package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	in := bufio.NewReader(os.Stdin)
	out := bufio.NewWriter(os.Stdout)
	defer out.Flush()

	var limit, window, n int
	fmt.Fscan(in, &limit, &window, &n)

	queue := make([]int, 0, n) // timestamps of allowed requests, oldest first
	head := 0                  // queue[head:] is the live part: dequeue = head++
	for i := 0; i < n; i++ {
		var t int
		fmt.Fscan(in, &t)
		for head < len(queue) && queue[head] <= t-window {
			head++ // this request has left the window (t-window, t]
		}
		if len(queue)-head < limit {
			queue = append(queue, t)
			fmt.Fprintln(out, "ALLOW")
		} else {
			fmt.Fprintln(out, "DENY") // denied requests are not recorded
		}
	}
}
`,
    hints: [
      { en: "Declare queue := make([]int, 0, n) and head := 0. The requests still in the window are queue[head:], and there are len(queue) - head of them.", ar: "صرّح بـ queue := make([]int, 0, n) و head := 0. الطلبات التي ما زالت في النافذة هي queue[head:]، وعددها len(queue) - head." },
      { en: "Before deciding about t: for head < len(queue) && queue[head] <= t-window { head++ }. A request at exactly t - window is already outside (the window is t - W < s <= t).", ar: "قبل أن تقرّر بشأن t: for head < len(queue) && queue[head] <= t-window { head++ }. فالطلب عند t - window بالضبط أصبح خارج النافذة (النافذة t - W < s <= t)." },
      { en: "If len(queue)-head < limit, append t and print ALLOW; otherwise print DENY and do NOT append it, so a refused request never uses up the quota.", ar: "إن تحقق len(queue)-head < limit فأضف t واطبع ALLOW؛ وإلا فاطبع DENY ولا تُضفه، حتى لا يستهلك الطلب المرفوض الحصة أبداً." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "2 10 6\n1 2 3 11 12 21\n", expected: "ALLOW\nALLOW\nDENY\nALLOW\nALLOW\nALLOW", mode: "lines" },
      { name: { en: "One request per second", ar: "طلب واحد في الثانية" }, stdin: "1 1 6\n5 5 6 6 6 7\n", expected: "ALLOW\nDENY\nALLOW\nDENY\nDENY\nALLOW", mode: "lines" },
      { name: { en: "Denied requests do not count", ar: "الطلبات المرفوضة لا تُحتسب" }, stdin: "2 5 7\n0 1 2 3 4 5 6\n", expected: "ALLOW\nALLOW\nDENY\nDENY\nDENY\nALLOW\nALLOW", mode: "lines" },
      { name: { en: "A burst in the same second", ar: "اندفاعة في الثانية نفسها" }, stdin: "3 60 6\n100 100 100 100 159 160\n", expected: "ALLOW\nALLOW\nALLOW\nDENY\nDENY\nALLOW", mode: "lines" },
      { name: { en: "A single request", ar: "طلب واحد" }, stdin: "1 1 1\n0\n", expected: "ALLOW", mode: "lines" },
      { name: { en: "4,000 requests, 20 per 50 seconds", ar: "4,000 طلب، 20 لكل 50 ثانية" }, stdin: rlInput, expected: rlExpected, mode: "lines" },
    ],
    sampleInput: "2 10 6\n1 2 3 11 12 21\n",
  },
  {
    type: "quiz",
    questions: [
      {
        q: {
          en: "You hold a reference to a node in the middle of a doubly linked list. What does it cost to delete that node?",
          ar: "تمسك مرجعاً إلى عقدة في منتصف قائمة مترابطة ثنائية. كم يكلّف حذف تلك العقدة؟",
        },
        choices: [
          { en: "O(1): point its two neighbours at each other", ar: "O(1): اجعل جارتيها تشير كل منهما إلى الأخرى" },
          { en: "O(log n): it needs a binary search first", ar: "O(log n): يحتاج أولاً إلى بحث ثنائي" },
          { en: "O(n): every later node must shift one place", ar: "O(n): يجب أن تنزاح كل عقدة لاحقة مكاناً واحداً" },
          { en: "O(n²): the list must be rebuilt", ar: "O(n²): يجب إعادة بناء القائمة" },
        ],
        answer: 0,
        explain: {
          en: "With prev and next pointers you can reach both neighbours directly and relink them; no other node moves. Shifting is what arrays have to do. Finding the node in the first place would be O(n), but here you already hold it.",
          ar: "بمؤشري prev وnext تصل إلى الجارتين مباشرة وتعيد ربطهما؛ ولا تتحرك أي عقدة أخرى. أما الإزاحة فهي ما تضطر إليه المصفوفات. وإيجاد العقدة ابتداءً كان سيكلّف O(n)، لكنك هنا تمسكها أصلاً.",
        },
      },
      {
        q: {
          en: "Why is list.pop(0) a poor way to dequeue in Python?",
          ar: "لماذا يُعدّ list.pop(0) طريقة سيئة للسحب من طابور في Python؟",
        },
        choices: [
          { en: "It raises an error when the list has more than 1,000 items", ar: "يرفع خطأً حين يكون في القائمة أكثر من 1,000 عنصر" },
          { en: "It removes the last item, not the first", ar: "يحذف العنصر الأخير لا الأول" },
          { en: "Every remaining item moves one place left, so each dequeue is O(n); deque.popleft() is O(1)", ar: "كل عنصر متبقٍّ ينزاح مكاناً إلى اليسار، فكل سحب O(n)؛ أما deque.popleft() فهو O(1)" },
          { en: "Lists cannot hold the same value twice", ar: "القوائم لا تستطيع حمل القيمة نفسها مرتين" },
        ],
        answer: 2,
        explain: {
          en: "A Python list is a dynamic array: removing index 0 shifts all other items, which the documentation describes as O(n) memory movement. collections.deque is designed for fast appends and pops at both ends. pop(0) does remove the first item, and lists have no size limit of 1,000.",
          ar: "قائمة Python مصفوفة ديناميكية: حذف الفهرس 0 يزيح كل العناصر الأخرى، وهو ما تصفه الوثائق بأنه تحريك للذاكرة بكلفة O(n). أما collections.deque فمصمَّم للإضافة والسحب السريعين عند الطرفين. والدالة pop(0) تحذف العنصر الأول فعلاً، والقوائم ليس لها حد 1,000 عنصر.",
        },
      },
      {
        q: {
          en: "What is the value of the postfix (RPN) expression 5 1 2 + 4 * + 3 - ?",
          ar: "ما قيمة التعبير اللاحق (RPN) الآتي: 5 1 2 + 4 * + 3 - ؟",
        },
        choices: [
          { en: "12", ar: "12" },
          { en: "17", ar: "17" },
          { en: "6", ar: "6" },
          { en: "14", ar: "14" },
        ],
        answer: 3,
        explain: {
          en: "Push 5, 1, 2. + pops 2 and 1 and pushes 3. Push 4. * pops 4 and 3 and pushes 12. + pops 12 and 5 and pushes 17. Push 3. - pops 3 (the right operand) and 17 and pushes 17 - 3 = 14. The other numbers are intermediate results.",
          ar: "ادفع 5 و1 و2. المعامل + يسحب 2 و1 ويدفع 3. ادفع 4. المعامل * يسحب 4 و3 ويدفع 12. المعامل + يسحب 12 و5 ويدفع 17. ادفع 3. المعامل - يسحب 3 (المعامَل الأيمن) ثم 17 ويدفع 17 - 3 = 14. والأعداد الأخرى نتائج وسيطة.",
        },
      },
      {
        q: {
          en: "A bracket checker reads ( [ ) ]. What does it report?",
          ar: "يقرأ مدقّق الأقواس ( [ ) ]. بماذا يُبلغ؟",
        },
        choices: [
          { en: "Balanced, because there are two opening and two closing brackets", ar: "متوازن، لأن فيه قوسَي فتح وقوسَي إغلاق" },
          { en: "An error at ), because the top of the stack is [", ar: "خطأ عند )، لأن أعلى المكدّس هو [" },
          { en: "An error at the final ], because the line ends there", ar: "خطأ عند ] الأخير، لأن السطر ينتهي هناك" },
        ],
        answer: 1,
        explain: {
          en: "After ( and [ are pushed, the most recent unclosed bracket is [. The ) must match the top, and it does not, so the error is reported right there. Counting brackets cannot see this: the order matters, which is exactly what the stack checks.",
          ar: "بعد دفع ( و[ يكون آخر قوس لم يُغلق هو [. ويجب أن يطابق ) أعلى المكدّس، وهو لا يطابقه، فيُبلَّغ عن الخطأ هناك مباشرة. وعدّ الأقواس لا يرى ذلك: فالترتيب مهم، وهذا بالضبط ما يفحصه المكدّس.",
        },
      },
      {
        q: {
          en: "A queue built from two stacks moves items from the in-stack to the out-stack only when the out-stack is empty. What does a dequeue cost?",
          ar: "طابور مبني من مكدّسين لا ينقل العناصر من مكدّس الدخول إلى مكدّس الخروج إلا حين يكون مكدّس الخروج فارغاً. كم يكلّف السحب؟",
        },
        choices: [
          { en: "O(log n) every time", ar: "O(log n) في كل مرة" },
          { en: "O(n) every time, because the stacks are reversed on each call", ar: "O(n) في كل مرة، لأن المكدّسين يُعكسان في كل استدعاء" },
          { en: "Sometimes O(n), but O(1) amortised, because each item is moved at most once", ar: "أحياناً O(n)، لكنه O(1) مُهلَكة، لأن كل عنصر يُنقل مرة واحدة على الأكثر" },
        ],
        answer: 2,
        explain: {
          en: "The expensive dequeue happens only when the out-stack is empty, and it moves each waiting item once. Over n operations every item is pushed twice and popped twice at most, so the total is O(n) and the average per operation is O(1). That is what amortised means.",
          ar: "السحب المكلف لا يحدث إلا حين يكون مكدّس الخروج فارغاً، وينقل كل عنصر منتظر مرة واحدة. وعلى امتداد n عملية يُدفع كل عنصر ويُسحب مرتين على الأكثر، فيكون المجموع O(n) والمتوسط لكل عملية O(1). وهذا معنى مُهلَكة (amortised).",
        },
      },
    ],
  },
  {
    type: "text",
    body: {
      en: `## Summary

- A **linked list** is a chain of nodes and pointers: O(1) insert and delete at a node you hold (or at the head), but O(n) to reach the k-th item. A **doubly** linked list can also delete a held node and walk backwards. A **sentinel** node removes edge cases.
- A **stack** is last in, first out: push, pop and peek in O(1) at the end of a dynamic array. It powers undo, the call stack, DFS, **bracket matching** and **postfix evaluation**.
- A **queue** is first in, first out. Never dequeue by shifting an array: use \`collections.deque\`, \`ArrayDeque\`, a head index or a **ring buffer**. Two stacks also make a queue with O(1) amortised operations.
- Queues order work fairly (job queues, schedulers, BFS) and keep sliding records, like the exact **rate limiter** that dequeues expired timestamps.

**Practice next:** detect a cycle in a linked list with a slow and a fast pointer, implement a stack that also returns its minimum in O(1), and compute the maximum of every window of k numbers with a deque. Then continue with **Sorting & Binary Search**.`,
      ar: `## الخلاصة

- **القائمة المترابطة** سلسلة من العقد والمؤشرات: إدراج وحذف O(1) عند عقدة تمسكها (أو عند الرأس)، لكن الوصول إلى العنصر رقم k يكلّف O(n). والقائمة المترابطة **الثنائية** تستطيع أيضاً حذف عقدة تمسكها والمشي إلى الخلف. و**العقدة الحارسة** تُزيل الحالات الحدّية.
- **المكدّس** آخر من يدخل أول من يخرج: push وpop وpeek في O(1) عند نهاية مصفوفة ديناميكية. وهو أساس التراجع ومكدّس الاستدعاءات وDFS و**مطابقة الأقواس** و**حساب الصيغة اللاحقة**.
- **الطابور** أول من يدخل أول من يخرج. لا تسحب منه أبداً بإزاحة مصفوفة: استخدم \`collections.deque\` أو \`ArrayDeque\` أو فهرساً للمقدّمة أو **مخزناً دائرياً**. ومكدّسان يصنعان أيضاً طابوراً بعمليات O(1) مُهلَكة.
- الطوابير ترتّب العمل بعدل (طوابير المهام، والمجدولات، وBFS) وتحفظ السجلات المنزلقة، مثل **محدِّد المعدّل** الدقيق الذي يسحب الطوابع الزمنية المنتهية.

**تدرّب بعد ذلك:** اكتشف وجود دورة في قائمة مترابطة بمؤشر بطيء وآخر سريع، ونفّذ مكدّساً يعيد أيضاً أصغر عناصره في O(1)، واحسب أكبر قيمة في كل نافذة من k عدداً باستخدام deque. ثم تابع إلى **الفرز والبحث الثنائي (Sorting & Binary Search)**.`,
    },
  },
];

export const lesson: Lesson = {
  nodeId: "stacks-queues",
  title: { en: "Linked Lists, Stacks & Queues: Who Goes Next?", ar: "القوائم المترابطة والمكدّسات والطوابير: من التالي؟" },
  estMinutes: estimateMinutes(sections),
  sections,
};
