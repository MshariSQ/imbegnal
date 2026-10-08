import type { Lesson, LessonSection } from "../types";
import { estimateMinutes } from "./estimate";

// Large inputs are generated here (not pasted) so the file stays readable. Expected outputs are
// derived by methods that differ from the reference solutions (closed forms or iterative code).

// Grid lab: a serpentine maze. Even rows are open corridors, odd rows are walls with a single gap
// that alternates between the right and the left end, so the only route snakes through all of it.
// Length by hand: 21 corridors x 40 steps + 2 vertical steps for each of the 20 gaps = 880.
const SNAKE = 41;
const snakeGrid = (() => {
  const rows: string[] = [];
  for (let r = 0; r < SNAKE; r++) {
    if (r % 2 === 0) {
      rows.push(".".repeat(SNAKE));
    } else {
      const gap = r % 4 === 1 ? SNAKE - 1 : 0;
      rows.push(Array.from({ length: SNAKE }, (_, c) => (c === gap ? "." : "#")).join(""));
    }
  }
  rows[0] = "S" + rows[0].slice(1);
  rows[SNAKE - 1] = rows[SNAKE - 1].slice(0, -1) + "E";
  return `${SNAKE} ${SNAKE}\n${rows.join("\n")}\n`;
})();

// An open 100 x 100 field: the shortest route is the Manhattan distance, 99 + 99 = 198.
const openGrid = (() => {
  const rows = Array.from({ length: 100 }, () => ".".repeat(100));
  rows[0] = "S" + rows[0].slice(1);
  rows[99] = rows[99].slice(0, -1) + "E";
  return `100 100\n${rows.join("\n")}\n`;
})();

// Components lab: 2 400 nodes wired in separate paths of 3 nodes => exactly 800 components.
const tripleGroups = (() => {
  const edges: string[] = [];
  for (let k = 0; k < 800; k++) edges.push(`${3 * k} ${3 * k + 1}`, `${3 * k + 1} ${3 * k + 2}`);
  return `2400 ${edges.length}\n${edges.join("\n")}\n`;
})();

// BST lab: 3 000 pseudo-random distinct keys. The expected output uses an iterative insertion
// with depth bookkeeping (no recursion, no node objects) plus a numeric sort for the in-order line.
const bstKeys = Array.from({ length: 3000 }, (_, i) => (i * 7919 + 13) % 100003);
const bstInput = `${bstKeys.length}\n${bstKeys.join(" ")}\n`;
const bstExpected = (() => {
  const key: number[] = [];
  const lc: number[] = [];
  const rc: number[] = [];
  const depth: number[] = [];
  let height = 0;
  for (const k of bstKeys) {
    if (key.length === 0) {
      key.push(k);
      lc.push(-1);
      rc.push(-1);
      depth.push(1);
      height = 1;
      continue;
    }
    let cur = 0;
    for (;;) {
      if (k === key[cur]) break;
      const next = k < key[cur] ? lc[cur] : rc[cur];
      if (next === -1) {
        key.push(k);
        lc.push(-1);
        rc.push(-1);
        depth.push(depth[cur] + 1);
        if (k < key[cur]) lc[cur] = key.length - 1;
        else rc[cur] = key.length - 1;
        height = Math.max(height, depth[cur] + 1);
        break;
      }
      cur = next;
    }
  }
  return `${[...new Set(bstKeys)].sort((a, b) => a - b).join(" ")}\n${height}`;
})();

const sections: LessonSection[] = [
  {
    type: "text",
    body: {
      en: `## What you'll learn

- What **trees** and **graphs** are, and why so much of computing is secretly one of them
- Tree vocabulary, **binary search trees** and the four classic **traversals**
- How to store a graph: **adjacency list** vs **adjacency matrix**
- **DFS** and **BFS**: how each works, when to pick which, and why you must remember what you **visited**
- How a **grid** is just a graph, how BFS finds the **fewest steps**, and how to count **connected components**
- You will write: a maze solver, a component counter and a binary search tree`,
      ar: `## ماذا ستتعلم

- ما هي **الأشجار (trees)** و**الرسوم البيانية (graphs)**، ولماذا يخفي جزء كبير من علوم الحاسوب أحدهما في داخله
- مصطلحات الشجرة و**أشجار البحث الثنائية (BST)** وأنواع **المرور (traversals)** الأربعة الكلاسيكية
- كيف نخزّن graph: **قائمة الجوار (adjacency list)** أم **مصفوفة الجوار (adjacency matrix)**
- **DFS** و**BFS**: كيف يعمل كل منهما، ومتى تختار أيهما، ولماذا يجب أن تتذكّر ما **زرته**
- كيف تكون **الشبكة (grid)** مجرد graph، وكيف يجد BFS **أقل عدد خطوات**، وكيف تعدّ **المكوّنات المتصلة (connected components)**
- ستكتب: برنامجاً يخرج من متاهة، وعدّاد مكوّنات، وشجرة بحث ثنائية`,
    },
  },
  {
    type: "text",
    body: {
      en: `## The family tree and the subway map

**A family tree** has one ancestor at the top. Everyone has parents above and maybe children below, and you never loop back to yourself. That is a **tree**: a hierarchy. Folders on your computer, the HTML of a web page and a company's org chart are trees too.

**A subway map** is different. Stations are connected in every direction, you can ride in circles, and there is no "top". That is a **graph**: things (stations) and the links between them (tracks). Friends on a social network, cities and roads, web pages and links, tasks that depend on other tasks: all graphs.

Two big ideas for this lesson. First, **a tree is a special graph**: connected, with no cycles. Second, almost every "how do I get from here to there?" or "what is connected to this?" question is answered by walking the graph in one of two ways: **depth-first** (go as deep as you can, then back up) or **breadth-first** (explore everything close first, then farther out).`,
      ar: `## شجرة العائلة وخريطة المترو

**شجرة العائلة** فيها جدّ واحد في القمة. لكل شخص آباء فوقه وربما أبناء تحته، ولا تعود أبداً إلى نفسك. هذه **شجرة (tree)**: تسلسل هرمي. والمجلدات في حاسوبك وشيفرة HTML لصفحة الويب والهيكل التنظيمي لشركة كلها أشجار أيضاً.

**خريطة المترو** مختلفة. المحطات متصلة في كل اتجاه، ويمكنك أن تدور في حلقة، وليس هناك "قمة". هذا **graph**: أشياء (محطات) والروابط بينها (سكك). الأصدقاء في شبكة اجتماعية، والمدن والطرق، وصفحات الويب والروابط، والمهام التي تعتمد على مهام أخرى: كلها graphs.

فكرتان كبيرتان في هذا الدرس. الأولى أن **الشجرة graph من نوع خاص**: متصلة وبلا دورات (cycles). والثانية أن أغلب أسئلة "كيف أصل من هنا إلى هناك؟" أو "ما المتصل بهذا؟" يُجاب عنها بالتجوّل في الـ graph بإحدى طريقتين: **أولاً بالعمق (depth-first)** أي انزل أبعد ما تستطيع ثم ارجع، أو **أولاً بالعرض (breadth-first)** أي استكشف كل القريب أولاً ثم الأبعد.`,
    },
  },
  {
    type: "text",
    body: {
      en: `## Trees and binary search trees

**Vocabulary.** A tree has a **root** (the top node). Each node has a **parent** (except the root) and zero or more **children**. A node with no children is a **leaf**. The **depth** of a node is how many edges separate it from the root. The **height** of the tree is the longest root-to-leaf path. (Some books count that path in edges, others in nodes. In this lesson's lab, height counts **nodes**, so a single node has height 1 and an empty tree has height 0.)

**Binary tree:** every node has at most two children, called **left** and **right**.

**Binary search tree (BST):** a binary tree with an ordering rule at every node: **all keys in the left subtree are smaller, all keys in the right subtree are larger**. Search and insert follow one path from the root, turning left or right, so they cost **O(height)**.

- If the tree stays **balanced**, height is about log₂ n, so operations are **O(log n)**.
- If you insert already-sorted keys 1, 2, 3, ... into a plain BST, every key goes to the right: the tree **degenerates into a linked list** of height n and operations become **O(n)**. Self-balancing trees (AVL, red-black) fix this, and they are what \`TreeMap\` in Java and \`std::map\` in C++ use.

**The four traversals.** A traversal visits every node exactly once. With recursion each is three lines:

\`\`\`python
def inorder(node):            # left, node, right
    if node is None:
        return
    inorder(node.left)
    print(node.key)
    inorder(node.right)

def height(node):             # nodes on the longest path down
    if node is None:
        return 0
    return 1 + max(height(node.left), height(node.right))
\`\`\`

- **Pre-order** (node, left, right): copy a tree, print a folder before its contents.
- **In-order** (left, node, right): on a BST this visits keys in **sorted order**. This is the link between trees and sorting.
- **Post-order** (left, right, node): children before the parent, for example to add up folder sizes or delete a tree.
- **Level-order** (row by row from the top): it is the BFS you will meet in a minute, using a queue.`,
      ar: `## الأشجار وأشجار البحث الثنائية

**المصطلحات.** للشجرة **جذر (root)** هو العقدة العليا. لكل عقدة **أب (parent)** (عدا الجذر) وصفر أو أكثر من **الأبناء (children)**. والعقدة التي لا أبناء لها **ورقة (leaf)**. و**عمق (depth)** العقدة هو عدد الحواف التي تفصلها عن الجذر. أما **ارتفاع (height)** الشجرة فهو أطول مسار من الجذر إلى ورقة. (بعض الكتب تعدّ هذا المسار بالحواف وبعضها بالعقد. وفي مختبر هذا الدرس يُعدّ الارتفاع **بالعقد**، فالعقدة المفردة ارتفاعها 1 والشجرة الفارغة ارتفاعها 0.)

**الشجرة الثنائية (Binary tree):** لكل عقدة ابنان على الأكثر، يُسمّيان **الأيسر (left)** و**الأيمن (right)**.

**شجرة البحث الثنائية (BST):** شجرة ثنائية بقاعدة ترتيب عند كل عقدة: **كل مفاتيح الشجرة الفرعية اليسرى أصغر، وكل مفاتيح الشجرة الفرعية اليمنى أكبر**. البحث والإدراج يتبعان مساراً واحداً من الجذر مع الانعطاف يساراً أو يميناً، فتكلفتهما **O(height)**.

- إن بقيت الشجرة **متوازنة** فالارتفاع نحو log₂ n، فتكون العمليات **O(log n)**.
- وإن أدرجت مفاتيح مرتّبة أصلاً 1 ثم 2 ثم 3 ... في BST عادية فسيذهب كل مفتاح إلى اليمين: **تتدهور الشجرة إلى قائمة مترابطة** ارتفاعها n وتصبح العمليات **O(n)**. والأشجار ذاتية التوازن (AVL وred-black) تعالج هذا، وهي ما تستخدمه \`TreeMap\` في Java و\`std::map\` في C++.

**أنواع المرور الأربعة.** المرور (traversal) يزور كل عقدة مرة واحدة بالضبط. وبالتكرار الذاتي (recursion) يكون كل نوع من ثلاثة أسطر:

\`\`\`python
def inorder(node):            # الأيسر، العقدة، الأيمن
    if node is None:
        return
    inorder(node.left)
    print(node.key)
    inorder(node.right)

def height(node):             # عدد العقد على أطول مسار نازل
    if node is None:
        return 0
    return 1 + max(height(node.left), height(node.right))
\`\`\`

- **Pre-order** (العقدة، الأيسر، الأيمن): لنسخ شجرة، أو لطباعة المجلد قبل محتوياته.
- **In-order** (الأيسر، العقدة، الأيمن): في الـ BST يزور المفاتيح **بترتيب تصاعدي**. وهذه هي الصلة بين الأشجار والفرز.
- **Post-order** (الأيسر، الأيمن، العقدة): الأبناء قبل الأب، مثلاً لجمع أحجام المجلدات أو لحذف شجرة.
- **Level-order** (صفاً صفاً من القمة): وهو الـ BFS الذي ستلتقي به بعد قليل، ويستخدم طابوراً (queue).`,
    },
  },
  {
    type: "code-demo",
    lang: "js",
    code: `class Node {
  constructor(key) { this.key = key; this.left = null; this.right = null; }
}

function insert(root, key) {
  if (root === null) return new Node(key);
  if (key < root.key) root.left = insert(root.left, key);
  else if (key > root.key) root.right = insert(root.right, key);
  return root;                       // equal keys are ignored
}
const inorder = (n, out = []) => { if (n) { inorder(n.left, out); out.push(n.key); inorder(n.right, out); } return out; };
const preorder = (n, out = []) => { if (n) { out.push(n.key); preorder(n.left, out); preorder(n.right, out); } return out; };
const height = (n) => (n === null ? 0 : 1 + Math.max(height(n.left), height(n.right)));
const build = (keys) => keys.reduce((root, k) => insert(root, k), null);

const mixed = build([8, 3, 10, 1, 6, 14, 4]);
console.log("in-order :", inorder(mixed).join(" "), " <- sorted!");
console.log("pre-order:", preorder(mixed).join(" "));
console.log("height   :", height(mixed));

const chain = build([1, 2, 3, 4, 5, 6, 7]);
console.log("keys inserted in sorted order -> height", height(chain), "(a linked list in disguise)");
`,
    explanation: {
      en: "The in-order walk prints the keys sorted without ever calling a sort function. The last line shows the weakness of a plain BST: seven sorted keys make a tree of height 7, so every search walks all of them.",
      ar: "المرور in-order يطبع المفاتيح مرتّبة دون أن تستدعي أي دالة فرز. والسطر الأخير يُظهر ضعف الـ BST العادية: سبعة مفاتيح مرتّبة تصنع شجرة ارتفاعها 7، فيمشي كل بحث على جميعها.",
    },
  },
  {
    type: "text",
    body: {
      en: `## Graphs and how to store them

A **graph** is a set of **vertices** (nodes) and **edges** (links). Edges can be **undirected** (friendship) or **directed** (a one-way street, "follows", "depends on"), and may carry a **weight** (distance, cost). Two vertices are **neighbours** when an edge joins them. A **cycle** is a path that returns to where it started.

**Adjacency list:** for each vertex, a list of its neighbours.

\`\`\`python
graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A"],
    "D": ["B"],
}
\`\`\`

Memory **O(V + E)** and visiting all neighbours of a vertex costs exactly its degree. This is the default choice.

**Adjacency matrix:** a V x V table where \`m[u][v]\` says whether the edge exists. Memory **O(V²)**, but "is there an edge u-v?" is O(1). It only pays off for small or very dense graphs. A graph with 100,000 vertices and 200,000 edges would need 10¹⁰ cells as a matrix but only about 400,000 list entries.

**A grid is a graph without anyone drawing it.** Every cell is a vertex; its neighbours are the cells up, down, left and right (stay inside the board, skip walls). You never store the edges, you compute them on the fly:

\`\`\`python
for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
    nr, nc = r + dr, c + dc
    if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] != "#":
        ...   # (nr, nc) is a neighbour of (r, c)
\`\`\``,
      ar: `## الـ Graphs وكيف نخزّنها

الـ **graph** مجموعة من **الرؤوس (vertices)** (العقد) و**الحواف (edges)** (الروابط). قد تكون الحواف **غير موجّهة** (الصداقة) أو **موجّهة** (شارع باتجاه واحد، "يتابع"، "يعتمد على")، وقد تحمل **وزناً** (مسافة، تكلفة). والرأسان **جاران** حين تصل بينهما حافة. و**الدورة (cycle)** مسار يعود إلى نقطة بدايته.

**قائمة الجوار (Adjacency list):** لكل رأس قائمة بجيرانه.

\`\`\`python
graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A"],
    "D": ["B"],
}
\`\`\`

الذاكرة **O(V + E)**، وزيارة كل جيران رأس تكلّف درجته (degree) بالضبط. وهذا هو الخيار الافتراضي.

**مصفوفة الجوار (Adjacency matrix):** جدول V × V تقول فيه \`m[u][v]\` هل الحافة موجودة. الذاكرة **O(V²)** لكن سؤال "هل توجد حافة u-v؟" يُجاب في O(1). ولا تفيد إلا في الـ graphs الصغيرة أو الكثيفة جداً. فـ graph فيه 100,000 رأس و200,000 حافة سيحتاج 10¹⁰ خلية كمصفوفة ونحو 400,000 مدخل فقط كقوائم.

**الشبكة (grid) هي graph لم يرسمه أحد.** كل خلية رأس؛ وجيرانها الخلايا فوقها وتحتها ويسارها ويمينها (ابقَ داخل اللوح وتخطَّ الجدران). لا تخزّن الحواف أبداً، بل تحسبها لحظياً:

\`\`\`python
for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
    nr, nc = r + dr, c + dc
    if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] != "#":
        ...   # الخلية (nr, nc) جارة للخلية (r, c)
\`\`\``,
    },
  },
  {
    type: "text",
    body: {
      en: `## DFS and BFS

Both visit every vertex reachable from a start vertex, in **O(V + E)** time. The only difference is the container that holds "vertices still to visit".

**Depth-first search (DFS): a stack** (or recursion, which is the call stack). Take a neighbour, then a neighbour of that neighbour, and so on until you are stuck, then back up. Like exploring a maze by always taking the next corridor and backtracking at dead ends.

**Breadth-first search (BFS): a queue.** Visit the start, then all its neighbours, then all of *their* new neighbours. It spreads like a ripple in a pond, one layer at a time.

\`\`\`python
from collections import deque

def bfs(graph, start):
    dist = {start: 0}                 # also serves as the "visited" set
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for nxt in graph[node]:
            if nxt not in dist:       # never queue a vertex twice
                dist[nxt] = dist[node] + 1
                queue.append(nxt)
    return dist                       # fewest edges from start to every reachable vertex
\`\`\`

Replace \`popleft()\` by \`pop()\` on a list used as a stack and you have DFS (mark visited when you take a vertex off the stack, or when you push it, but be consistent).

**Always remember what you visited.** Graphs have cycles, so without a visited set the walk goes A, B, A, B ... forever. (A tree has no cycles and needs none; the only way "back" is the parent.) Mark a vertex when you **enqueue** it in BFS, otherwise it can be queued many times.

**Which to use?**

- **BFS gives the fewest edges** from the start to every other vertex *when all steps cost the same*. The queue processes vertices in order of distance: all at distance 1, then all at 2, and so on. That is why BFS solves "minimum moves in a maze". (With different edge weights you need Dijkstra, a later topic.)
- **DFS** is the natural fit for "explore everything", detecting cycles, ordering tasks by dependency and trying all options (backtracking). It uses memory proportional to the depth. With recursion, very deep graphs can overflow the call stack (Python stops at about 1,000 nested calls by default): use an explicit stack.

**Connected components.** In an undirected graph a component is a group of vertices that can all reach each other. To count them: loop over all vertices; whenever one is **not visited yet**, you found a new component, so add 1 and run a DFS or BFS from it to mark its whole group. Isolated vertices count as components of size 1.`,
      ar: `## DFS و BFS

كلاهما يزور كل رأس يمكن الوصول إليه من رأس البداية، بزمن **O(V + E)**. والفرق الوحيد هو الحاوية التي تحمل "الرؤوس التي بقي علينا زيارتها".

**البحث بالعمق (DFS): مكدّس (stack)** (أو تكرار ذاتي، وهو مكدّس الاستدعاءات). خذ جاراً، ثم جاراً لذلك الجار، وهكذا حتى تنسدّ بك الطريق، ثم ارجع. كاستكشاف متاهة بأخذ الممر التالي دائماً والرجوع عند الطرق المسدودة.

**البحث بالعرض (BFS): طابور (queue).** زر البداية، ثم كل جيرانها، ثم كل الجيران الجدد لـ*هؤلاء*. ينتشر كالتموّج في بركة، طبقة بعد طبقة.

\`\`\`python
from collections import deque

def bfs(graph, start):
    dist = {start: 0}                 # يعمل أيضاً كمجموعة "المزورات"
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for nxt in graph[node]:
            if nxt not in dist:       # لا تضع رأساً في الطابور مرتين
                dist[nxt] = dist[node] + 1
                queue.append(nxt)
    return dist                       # أقل عدد حواف من البداية إلى كل رأس يمكن بلوغه
\`\`\`

استبدل \`popleft()\` بـ \`pop()\` على قائمة تعمل كمكدّس فيصبح لديك DFS (علّم الرأس حين تخرجه من المكدّس أو حين تدفعه، لكن كن متسقاً).

**تذكّر دائماً ما زرته.** الـ graphs فيها دورات، فبدون مجموعة المزورات يدور المشي A ثم B ثم A ثم B ... إلى الأبد. (الشجرة بلا دورات ولا تحتاج إلى ذلك؛ فالطريق الوحيد "للخلف" هو الأب.) علّم الرأس حين **تضعه في الطابور** في BFS، وإلا قد يوضع فيه مرات كثيرة.

**أيهما تستخدم؟**

- **BFS يعطي أقل عدد من الحواف** من البداية إلى كل رأس آخر *حين تكلّف كل الخطوات الشيء نفسه*. فالطابور يعالج الرؤوس بترتيب المسافة: كلها على مسافة 1، ثم كلها على 2، وهكذا. ولهذا يحلّ BFS مسألة "أقل عدد حركات في متاهة". (مع أوزان مختلفة للحواف تحتاج Dijkstra، وهو موضوع لاحق.)
- **DFS** هو الأنسب لـ "استكشف كل شيء" وكشف الدورات وترتيب المهام حسب الاعتماد وتجربة كل الخيارات (backtracking). ويستخدم ذاكرة تتناسب مع العمق. ومع التكرار الذاتي قد تُفيض الـ graphs العميقة جداً مكدّس الاستدعاءات (Python يتوقف عند نحو 1,000 استدعاء متداخل افتراضياً): استخدم مكدّساً صريحاً.

**المكوّنات المتصلة (Connected components).** في graph غير موجّه المكوّن مجموعة رؤوس يستطيع كل منها بلوغ الآخر. ولعدّها: مرّ على كل الرؤوس؛ وكلما وجدت رأساً **لم يُزَر بعد** فقد وجدت مكوّناً جديداً، فأضف 1 وشغّل DFS أو BFS منه لتعلّم مجموعته كلها. والرؤوس المعزولة تُعدّ مكوّنات حجمها 1.`,
    },
  },
  {
    type: "code-demo",
    lang: "python",
    code: `from collections import deque

graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D", "E"],
    "D": ["B", "C", "F"],
    "E": ["C", "F"],
    "F": ["D", "E"],
}

def bfs(start):
    dist = {start: 0}
    order = []
    queue = deque([start])
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in graph[node]:
            if nxt not in dist:
                dist[nxt] = dist[node] + 1
                queue.append(nxt)
    return order, dist

def dfs(start):
    seen, order = set(), []
    stack = [start]
    while stack:
        node = stack.pop()
        if node in seen:
            continue
        seen.add(node)
        order.append(node)
        for nxt in reversed(graph[node]):   # reversed: so the first neighbour is visited first
            if nxt not in seen:
                stack.append(nxt)
    return order

order, dist = bfs("A")
print("BFS order:", " ".join(order))
print("BFS distances from A:", dist)
print("DFS order:", " ".join(dfs("A")))

# With adjacency lists the memory is the number of list entries, not V * V
print("list entries:", sum(len(v) for v in graph.values()), "| matrix cells:", len(graph) ** 2)
`,
    explanation: {
      en: "BFS reaches B and C (distance 1) before D and E (distance 2) and F (distance 3). DFS dives A, B, D, C, E, F, going deep before it goes wide. Both visit every vertex exactly once.",
      ar: "يبلغ BFS الرأسين B وC (المسافة 1) قبل D وE (المسافة 2) ثم F (المسافة 3). أما DFS فيغوص A ثم B ثم D ثم C ثم E ثم F، فيذهب عميقاً قبل أن يتّسع. وكلاهما يزور كل رأس مرة واحدة بالضبط.",
    },
  },
  {
    type: "lab",
    id: "maze-shortest-path",
    lang: "python",
    prompt: {
      en: `**Escape the maze.** Find the fewest moves from \`S\` to \`E\` on a grid. You may move up, down, left or right (not diagonally) onto any cell that is not a wall.

**Input:** the first line has \`R C\`. Then \`R\` lines of exactly \`C\` characters: \`.\` open, \`#\` wall, \`S\` start, \`E\` exit (each appears exactly once).

**Output:** the minimum number of moves from \`S\` to \`E\`, or \`-1\` if the exit cannot be reached.

**Example:** input
\`\`\`
3 4
S.#.
.##.
...E
\`\`\`
prints \`5\`: down, down, right, right, right.

Use **BFS** with a queue and a \`dist\` dictionary (it doubles as the visited set).`,
      ar: `**اهرب من المتاهة.** أوجد أقل عدد حركات من \`S\` إلى \`E\` على شبكة. يمكنك التحرك لأعلى أو لأسفل أو يساراً أو يميناً (لا قطرياً) إلى أي خلية ليست جداراً.

**المدخل:** السطر الأول فيه \`R C\`. ثم \`R\` سطراً من \`C\` محرفاً بالضبط: \`.\` مفتوح، \`#\` جدار، \`S\` البداية، \`E\` المخرج (يظهر كل منهما مرة واحدة بالضبط).

**المخرج:** أقل عدد حركات من \`S\` إلى \`E\`، أو \`-1\` إن تعذّر بلوغ المخرج.

**مثال:** المدخل
\`\`\`
3 4
S.#.
.##.
...E
\`\`\`
يطبع \`5\`: لأسفل ثم لأسفل ثم يميناً ثلاث مرات.

استخدم **BFS** مع طابور وقاموس \`dist\` (يعمل أيضاً كمجموعة المزورات).`,
    },
    starterCode: `import sys
from collections import deque

data = sys.stdin.read().split()
R, C = int(data[0]), int(data[1])
grid = data[2:2 + R]

start = None
for r in range(R):
    for c in range(C):
        if grid[r][c] == "S":
            start = (r, c)

# TODO: breadth-first search from \`start\`.
# 1. dist = {start: 0} and queue = deque([start]).
# 2. Pop a cell; if it is "E", its distance is the answer.
# 3. Try the four neighbours (up, down, left, right): inside the grid, not "#", and not in dist yet.
#    Give each dist[cell] + 1 and append it to the queue.
answer = -1
print(answer)
`,
    solution: `import sys
from collections import deque

data = sys.stdin.read().split()
R, C = int(data[0]), int(data[1])
grid = data[2:2 + R]

start = None
for r in range(R):
    for c in range(C):
        if grid[r][c] == "S":
            start = (r, c)

dist = {start: 0}              # also the visited set
queue = deque([start])
answer = -1
while queue:
    r, c = queue.popleft()
    if grid[r][c] == "E":
        answer = dist[(r, c)]  # BFS reaches E first by the shortest route
        break
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] != "#" and (nr, nc) not in dist:
            dist[(nr, nc)] = dist[(r, c)] + 1
            queue.append((nr, nc))

print(answer)
`,
    hints: [
      { en: "Start the queue with the S cell and dist = {S: 0}. Each loop takes the oldest cell from the queue with popleft().", ar: "ابدأ الطابور بخلية S و dist = {S: 0}. وفي كل دورة خذ أقدم خلية من الطابور بـ popleft()." },
      { en: "For each of the 4 directions compute (nr, nc). Skip it if it is outside the grid, is a '#', or is already in dist.", ar: "لكل اتجاه من الاتجاهات الأربعة احسب (nr, nc). تجاهلها إن كانت خارج الشبكة أو '#' أو موجودة في dist من قبل." },
      { en: "Otherwise set dist[(nr, nc)] = dist[(r, c)] + 1 and append it. When the popped cell is 'E', print its distance; if the queue empties first, print -1.", ar: "وإلا فاجعل dist[(nr, nc)] = dist[(r, c)] + 1 وأضفها للطابور. وحين تكون الخلية المسحوبة 'E' اطبع مسافتها؛ وإن فرغ الطابور قبل ذلك فاطبع -1." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "3 4\nS.#.\n.##.\n...E\n", expected: "5" },
      { name: { en: "The exit is walled off", ar: "المخرج محاط بالجدران" }, stdin: "2 3\nS#E\n.#.\n", expected: "-1" },
      { name: { en: "Start next to the exit", ar: "البداية بجوار المخرج" }, stdin: "1 2\nSE\n", expected: "1" },
      { name: { en: "Walk around a wall", ar: "التفاف حول جدار" }, stdin: "3 3\nS#E\n.#.\n...\n", expected: "6" },
      { name: { en: "A snaking 41 x 41 maze", ar: "متاهة متعرّجة 41 × 41" }, stdin: snakeGrid, expected: "880" },
      { name: { en: "An open 100 x 100 field", ar: "ساحة مفتوحة 100 × 100" }, stdin: openGrid, expected: "198" },
    ],
    sampleInput: "3 4\nS.#.\n.##.\n...E\n",
  },
  {
    type: "lab",
    id: "count-components",
    lang: "rust",
    prompt: {
      en: `**Count the islands of friends.** A network has \`n\` people numbered \`0\` to \`n - 1\` and \`m\` friendships. Friendship works both ways. Count the **connected components**: groups of people who are linked directly or through other people. A person with no friends is a component on their own.

**Input:** the first line has \`n m\`. Then \`m\` lines, each \`u v\` (a friendship between \`u\` and \`v\`). Edges can repeat and \`u\` can equal \`v\`.

**Output:** the number of connected components.

**Example:** input
\`\`\`
6 3
0 1
1 2
3 4
\`\`\`
prints \`3\`: {0, 1, 2}, {3, 4} and {5}.

Build an adjacency list \`Vec<Vec<usize>>\`, then loop over the people. Each time you meet one that is not visited, add 1 and explore its whole group with a stack (an iterative DFS, so very long chains cannot overflow the call stack).`,
      ar: `**عُدّ جزر الأصدقاء.** في شبكة \`n\` شخصاً مرقّمين من \`0\` إلى \`n - 1\` و\`m\` صداقة. الصداقة في الاتجاهين. عُدّ **المكوّنات المتصلة**: مجموعات الأشخاص المرتبطين مباشرة أو عبر أشخاص آخرين. والشخص بلا أصدقاء مكوّن قائم بذاته.

**المدخل:** السطر الأول فيه \`n m\`. ثم \`m\` سطراً، في كل منها \`u v\` (صداقة بين \`u\` و\`v\`). قد تتكرر الحواف وقد تكون \`u\` مساوية لـ \`v\`.

**المخرج:** عدد المكوّنات المتصلة.

**مثال:** المدخل
\`\`\`
6 3
0 1
1 2
3 4
\`\`\`
يطبع \`3\`: {0, 1, 2} و{3, 4} و{5}.

ابنِ قائمة جوار \`Vec<Vec<usize>>\`، ثم مرّ على الأشخاص. وكلما صادفت شخصاً لم يُزَر أضف 1 واستكشف مجموعته كلها بمكدّس (DFS تكراري، فلا تُفيض السلاسل الطويلة جداً مكدّس الاستدعاءات).`,
    },
    starterCode: `use std::io::Read;

fn main() {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input).unwrap();
    let mut it = input.split_whitespace().map(|t| t.parse::<usize>().unwrap());
    let n = it.next().unwrap();
    let m = it.next().unwrap();

    // adjacency list: adj[u] holds the friends of u
    let mut adj: Vec<Vec<usize>> = vec![Vec::new(); n];
    for _ in 0..m {
        let u = it.next().unwrap();
        let v = it.next().unwrap();
        adj[u].push(v);
        adj[v].push(u);
    }

    // TODO: count the connected components.
    // Keep \`visited: Vec<bool>\`. For every person \`start\` that is not visited yet:
    //   add 1 to the counter, mark them visited, and walk their whole group with a stack:
    //   pop a person, push every unvisited friend (marking each as visited when pushed).
    let components = 0;
    println!("{}", components);
}
`,
    solution: `use std::io::Read;

fn main() {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input).unwrap();
    let mut it = input.split_whitespace().map(|t| t.parse::<usize>().unwrap());
    let n = it.next().unwrap();
    let m = it.next().unwrap();

    let mut adj: Vec<Vec<usize>> = vec![Vec::new(); n];
    for _ in 0..m {
        let u = it.next().unwrap();
        let v = it.next().unwrap();
        adj[u].push(v);
        adj[v].push(u);
    }

    let mut visited = vec![false; n];
    let mut components = 0;
    for start in 0..n {
        if visited[start] {
            continue;
        }
        components += 1; // a new, still unexplored group
        visited[start] = true;
        let mut stack = vec![start]; // iterative DFS: no deep recursion
        while let Some(u) = stack.pop() {
            for &v in &adj[u] {
                if !visited[v] {
                    visited[v] = true;
                    stack.push(v);
                }
            }
        }
    }
    println!("{}", components);
}
`,
    hints: [
      { en: "Make visited = vec![false; n]. Loop start from 0 to n - 1 and skip every person who is already visited.", ar: "أنشئ visited = vec![false; n]. وكرّر start من 0 إلى n - 1 وتجاوز كل شخص زُرته من قبل." },
      { en: "For an unvisited start: components += 1, mark it visited, and put it on a stack: let mut stack = vec![start].", ar: "لـ start غير المزور: components += 1 وعلّمه مزوراً وضعه في مكدّس: let mut stack = vec![start]." },
      { en: "while let Some(u) = stack.pop() { for &v in &adj[u] { if !visited[v] { visited[v] = true; stack.push(v); } } } marks the whole group.", ar: "الحلقة while let Some(u) = stack.pop() { for &v in &adj[u] { if !visited[v] { visited[v] = true; stack.push(v); } } } تعلّم المجموعة كلها." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "6 3\n0 1\n1 2\n3 4\n", expected: "3" },
      { name: { en: "Nobody knows anybody", ar: "لا أحد يعرف أحداً" }, stdin: "4 0\n", expected: "4" },
      { name: { en: "One big cycle", ar: "حلقة كبيرة واحدة" }, stdin: "4 4\n0 1\n1 2\n2 3\n3 0\n", expected: "1" },
      { name: { en: "Self-loops and repeated edges", ar: "حواف ذاتية ومتكررة" }, stdin: "3 3\n0 0\n1 2\n2 1\n", expected: "2" },
      { name: { en: "No people", ar: "لا أشخاص" }, stdin: "0 0\n", expected: "0" },
      { name: { en: "2,400 people in groups of three", ar: "2,400 شخص في مجموعات من ثلاثة" }, stdin: tripleGroups, expected: "800" },
    ],
    sampleInput: "6 3\n0 1\n1 2\n3 4\n",
  },
  {
    type: "lab",
    id: "bst-inorder-height",
    lang: "java",
    prompt: {
      en: `**Build a binary search tree.** Insert the given keys, in the given order, into an (unbalanced) BST. A key that is already in the tree is ignored.

**Input:** the first line has \`n\`. The second line has \`n\` integers (it is missing when n is 0).

**Output:** two lines. First the **in-order** traversal (keys separated by single spaces; an empty line for an empty tree). Then the **height** of the tree counted in **nodes** on the longest root-to-leaf path (0 for an empty tree).

**Example:** input \`7\` and \`8 3 10 1 6 14 4\` prints
\`\`\`
1 3 4 6 8 10 14
4
\`\`\`
The longest path is 8, 3, 6, 4: four nodes.

Write three small recursive methods: \`insert\`, \`inorder\` and \`height\`.`,
      ar: `**ابنِ شجرة بحث ثنائية.** أدرج المفاتيح المعطاة، بالترتيب المعطى، في BST (غير متوازنة). والمفتاح الموجود في الشجرة من قبل يُتجاهل.

**المدخل:** السطر الأول فيه \`n\`. والسطر الثاني فيه \`n\` عدداً صحيحاً (وهو غير موجود حين n تساوي 0).

**المخرج:** سطران. أولاً المرور **in-order** (المفاتيح تفصل بينها مسافة واحدة؛ وسطر فارغ للشجرة الفارغة). ثم **ارتفاع** الشجرة محسوباً **بالعقد** على أطول مسار من الجذر إلى ورقة (0 للشجرة الفارغة).

**مثال:** المدخل \`7\` و\`8 3 10 1 6 14 4\` يطبع
\`\`\`
1 3 4 6 8 10 14
4
\`\`\`
أطول مسار هو 8 ثم 3 ثم 6 ثم 4: أربع عقد.

اكتب ثلاث دوال تكرارية صغيرة: \`insert\` و\`inorder\` و\`height\`.`,
    },
    starterCode: `import java.util.*;

public class Main {
    static class Node {
        int key;
        Node left, right;
        Node(int key) { this.key = key; }
    }

    // TODO: insert key into the BST rooted at root and return the (possibly new) root.
    // Smaller keys go left, larger keys go right, equal keys are ignored.
    static Node insert(Node root, int key) {
        return root;
    }

    // TODO: append the keys to out in sorted order (left subtree, node, right subtree),
    // separated by single spaces.
    static void inorder(Node node, StringBuilder out) {
    }

    // TODO: number of nodes on the longest path from this node down to a leaf (0 for null).
    static int height(Node node) {
        return 0;
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        Node root = null;
        for (int i = 0; i < n; i++) root = insert(root, in.nextInt());

        StringBuilder out = new StringBuilder();
        inorder(root, out);
        System.out.println(out);
        System.out.println(height(root));
    }
}
`,
    solution: `import java.util.*;

public class Main {
    static class Node {
        int key;
        Node left, right;
        Node(int key) { this.key = key; }
    }

    static Node insert(Node root, int key) {
        if (root == null) return new Node(key);
        if (key < root.key) root.left = insert(root.left, key);
        else if (key > root.key) root.right = insert(root.right, key);
        // equal key: already in the tree, nothing to do
        return root;
    }

    static void inorder(Node node, StringBuilder out) {
        if (node == null) return;
        inorder(node.left, out);
        if (out.length() > 0) out.append(' ');
        out.append(node.key);
        inorder(node.right, out);
    }

    static int height(Node node) {
        if (node == null) return 0;
        return 1 + Math.max(height(node.left), height(node.right));
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        Node root = null;
        for (int i = 0; i < n; i++) root = insert(root, in.nextInt());

        StringBuilder out = new StringBuilder();
        inorder(root, out);
        System.out.println(out);
        System.out.println(height(root));
    }
}
`,
    hints: [
      { en: "insert: if root is null return new Node(key). If key < root.key then root.left = insert(root.left, key); if key > root.key do the same on the right. Return root.", ar: "insert: إن كان root يساوي null فأعد new Node(key). وإن كان key < root.key فاجعل root.left = insert(root.left, key)؛ وإن كان key > root.key فافعل الشيء نفسه لليمين. ثم أعد root." },
      { en: "inorder: stop on null, recurse left, append the key (add a space first when out is not empty), recurse right.", ar: "inorder: توقف عند null، ثم كرّر على اليسار، ثم أضف المفتاح (وأضف مسافة قبله إن لم يكن out فارغاً)، ثم كرّر على اليمين." },
      { en: "height(null) is 0; otherwise it is 1 + Math.max(height(left), height(right)). Same shape as the Python example in the lesson.", ar: "height(null) تساوي 0؛ وإلا فهي 1 + Math.max(height(left), height(right)). والشكل نفسه كمثال Python في الدرس." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "7\n8 3 10 1 6 14 4\n", expected: "1 3 4 6 8 10 14\n4", mode: "lines" },
      { name: { en: "Sorted input makes a chain", ar: "المدخل المرتّب يصنع سلسلة" }, stdin: "5\n1 2 3 4 5\n", expected: "1 2 3 4 5\n5", mode: "lines" },
      { name: { en: "A single key", ar: "مفتاح واحد" }, stdin: "1\n42\n", expected: "42\n1", mode: "lines" },
      { name: { en: "Repeated keys are ignored", ar: "المفاتيح المكرّرة تُتجاهل" }, stdin: "5\n5 5 3 5 3\n", expected: "3 5\n2", mode: "lines" },
      { name: { en: "Empty tree", ar: "شجرة فارغة" }, stdin: "0\n", expected: "\n0", mode: "lines" },
      { name: { en: "3,000 pseudo-random keys", ar: "3,000 مفتاح شبه عشوائي" }, stdin: bstInput, expected: bstExpected, mode: "lines" },
    ],
    sampleInput: "7\n8 3 10 1 6 14 4\n",
  },
  {
    type: "quiz",
    questions: [
      {
        q: {
          en: "Which traversal of a binary search tree visits the keys in sorted order?",
          ar: "أي أنواع المرور على شجرة بحث ثنائية يزور المفاتيح بترتيب تصاعدي؟",
        },
        choices: [
          { en: "Pre-order (node, left, right)", ar: "Pre-order (العقدة، الأيسر، الأيمن)" },
          { en: "In-order (left, node, right)", ar: "In-order (الأيسر، العقدة، الأيمن)" },
          { en: "Post-order (left, right, node)", ar: "Post-order (الأيسر، الأيمن، العقدة)" },
          { en: "Level-order (row by row)", ar: "Level-order (صفاً صفاً)" },
        ],
        answer: 1,
        explain: {
          en: "Everything in the left subtree is smaller than the node and everything in the right subtree is larger, so visiting left, then the node, then right yields ascending order at every level of the tree. The other orders mix keys of different sizes.",
          ar: "كل ما في الشجرة الفرعية اليسرى أصغر من العقدة، وكل ما في اليمنى أكبر، فزيارة الأيسر ثم العقدة ثم الأيمن تعطي ترتيباً تصاعدياً عند كل مستوى من الشجرة. أما الأنواع الأخرى فتخلط مفاتيح مختلفة الحجم.",
        },
      },
      {
        q: {
          en: "Every move in a maze costs the same. You need the fewest moves from the start to the exit. Which is the right tool?",
          ar: "كل حركة في متاهة تكلّف الشيء نفسه. وتحتاج أقل عدد حركات من البداية إلى المخرج. ما الأداة الصحيحة؟",
        },
        choices: [
          { en: "BFS with a queue", ar: "BFS مع طابور" },
          { en: "DFS with a stack, taking the first path that reaches the exit", ar: "DFS مع مكدّس، وأخذ أول مسار يبلغ المخرج" },
          { en: "Sorting all the cells by their row number", ar: "فرز كل الخلايا حسب رقم الصف" },
          { en: "Binary search on the number of rows", ar: "بحث ثنائي على عدد الصفوف" },
        ],
        answer: 0,
        explain: {
          en: "BFS explores cells in order of distance (all cells 1 move away, then 2, then 3...), so the first time it reaches the exit is by a shortest route. DFS finds some path, often a long winding one. Sorting and binary search do not walk the maze at all.",
          ar: "يستكشف BFS الخلايا بترتيب المسافة (كل الخلايا على بعد حركة، ثم حركتين، ثم ثلاث...)، فأول مرة يبلغ فيها المخرج تكون بأقصر مسار. أما DFS فيجد مساراً ما، وغالباً يكون طويلاً ملتوياً. والفرز والبحث الثنائي لا يمشيان في المتاهة أصلاً.",
        },
      },
      {
        q: {
          en: "Why does a graph traversal keep a set of visited vertices?",
          ar: "لماذا يحتفظ المرور على graph بمجموعة من الرؤوس المزورة؟",
        },
        choices: [
          { en: "To make the output sorted", ar: "لتكون المخرجات مرتّبة" },
          { en: "Because a queue cannot hold the same value twice", ar: "لأن الطابور لا يستطيع حمل القيمة نفسها مرتين" },
          { en: "Graphs can contain cycles, so without it the walk could loop forever or repeat work", ar: "لأن الـ graphs قد تحتوي دورات، فبدونها قد يدور المشي إلى الأبد أو يكرّر العمل" },
        ],
        answer: 2,
        explain: {
          en: "In a graph with a cycle (A to B to C and back to A) you can keep walking forever. Marking vertices stops that, and also makes the whole traversal O(V + E) because each vertex is expanded once. A queue happily stores duplicates, and the visited set has nothing to do with sorting.",
          ar: "في graph فيه دورة (من A إلى B إلى C ثم العودة إلى A) يمكنك أن تواصل المشي إلى الأبد. وتعليم الرؤوس يمنع ذلك، ويجعل المرور كله O(V + E) لأن كل رأس يُوسَّع مرة واحدة. أما الطابور فيخزّن المكرّرات بلا مشكلة، ومجموعة المزورات لا علاقة لها بالترتيب.",
        },
      },
      {
        q: {
          en: "A social network has 100,000 users and 200,000 friendships. Which representation should you normally use?",
          ar: "شبكة اجتماعية فيها 100,000 مستخدم و200,000 صداقة. أي تمثيل تستخدمه عادةً؟",
        },
        choices: [
          { en: "An adjacency matrix, because lookups are O(1)", ar: "مصفوفة جوار، لأن البحث فيها O(1)" },
          { en: "An adjacency list, because the matrix would need V² = 10¹⁰ cells", ar: "قائمة جوار، لأن المصفوفة ستحتاج V² = 10¹⁰ خلية" },
          { en: "A sorted array of all users", ar: "مصفوفة مرتّبة بكل المستخدمين" },
          { en: "A binary search tree of friendships", ar: "شجرة بحث ثنائية للصداقات" },
        ],
        answer: 1,
        explain: {
          en: "The graph is sparse: each user has about four friends on average. A list stores only the 400,000 neighbour entries (O(V + E)), while a matrix needs 100,000 x 100,000 = 10 billion cells. The matrix's O(1) edge lookup is rarely worth that.",
          ar: "الـ graph متفرّق (sparse): لكل مستخدم نحو أربعة أصدقاء في المتوسط. القائمة تخزّن 400,000 مدخل جار فقط (O(V + E))، بينما تحتاج المصفوفة إلى 100,000 × 100,000 = 10 مليارات خلية. وبحث الحافة بـ O(1) في المصفوفة نادراً ما يستحق ذلك.",
        },
      },
      {
        q: {
          en: "You insert the keys 1, 2, 3, ..., n, in that order, into a plain (non-balancing) binary search tree. What do you get?",
          ar: "أدرجت المفاتيح 1 ثم 2 ثم 3 ... ثم n، بهذا الترتيب، في شجرة بحث ثنائية عادية (غير متوازنة). ماذا تحصل؟",
        },
        choices: [
          { en: "A perfectly balanced tree of height about log n", ar: "شجرة متوازنة تماماً ارتفاعها نحو log n" },
          { en: "An error, because a BST cannot hold sorted input", ar: "خطأ، لأن الـ BST لا تستطيع حمل مدخل مرتّب" },
          { en: "A tree that keeps only the first key", ar: "شجرة لا تحتفظ إلا بالمفتاح الأول" },
          { en: "A chain of height n, so search and insert become O(n)", ar: "سلسلة ارتفاعها n، فيصبح البحث والإدراج O(n)" },
        ],
        answer: 3,
        explain: {
          en: "Each new key is larger than everything so far, so it goes to the right of the previous one. The tree degenerates into a linked list. This is why production libraries use self-balancing trees (AVL, red-black) that keep the height near log n whatever the insertion order.",
          ar: "كل مفتاح جديد أكبر من كل ما سبقه، فيذهب إلى يمين السابق. فتتدهور الشجرة إلى قائمة مترابطة. ولهذا تستخدم المكتبات الإنتاجية أشجاراً ذاتية التوازن (AVL وred-black) تُبقي الارتفاع قريباً من log n أياً كان ترتيب الإدراج.",
        },
      },
    ],
  },
  {
    type: "text",
    body: {
      en: `## Summary

- A **tree** is a connected graph without cycles; a **BST** keeps smaller keys left and larger keys right, so operations cost **O(height)**: O(log n) balanced, O(n) when degenerate. **In-order** traversal of a BST gives sorted keys.
- A **graph** is vertices plus edges. Store it as an **adjacency list** (O(V + E) memory) unless it is small or dense. A **grid** is an implicit graph: compute neighbours on the fly.
- **DFS** (stack or recursion) goes deep; **BFS** (queue) goes layer by layer and finds the **fewest edges** when all steps cost the same. Both run in **O(V + E)**.
- **Always track visited vertices** in a graph, and mark them when you enqueue them. Use an explicit stack for very deep graphs.
- **Connected components**: start a traversal from every unvisited vertex and count how many times you start.

**Practice next:** count the islands in a grid of land and water, check whether a graph has a cycle, and compute the level-order traversal of a binary tree with a queue. Then continue with **Recursion & Dynamic Programming**, and later **Shortest Paths & Union-Find**, which extends BFS to weighted graphs.`,
      ar: `## الخلاصة

- **الشجرة (tree)** هي graph متصل بلا دورات؛ و**BST** تُبقي المفاتيح الأصغر يساراً والأكبر يميناً، فتكلّف العمليات **O(height)**: أي O(log n) إن كانت متوازنة، وO(n) إن تدهورت. والمرور **in-order** على BST يعطي المفاتيح مرتّبة.
- الـ **graph** رؤوس وحواف. خزّنه كـ **قائمة جوار** (ذاكرة O(V + E)) ما لم يكن صغيراً أو كثيفاً. و**الشبكة (grid)** graph ضمني: احسب الجيران لحظياً.
- **DFS** (مكدّس أو تكرار ذاتي) يذهب عميقاً؛ و**BFS** (طابور) يتقدّم طبقة طبقة ويجد **أقل عدد حواف** حين تكلّف كل الخطوات الشيء نفسه. وكلاهما **O(V + E)**.
- **تتبّع الرؤوس المزورة دائماً** في الـ graph، وعلّمها حين تضعها في الطابور. واستخدم مكدّساً صريحاً للـ graphs العميقة جداً.
- **المكوّنات المتصلة**: ابدأ مروراً من كل رأس لم يُزَر وعُدّ كم مرة بدأت.

**تدرّب بعد ذلك:** عُدّ الجزر في شبكة من اليابسة والماء، وتحقق هل في graph دورة، واحسب المرور level-order لشجرة ثنائية بطابور. ثم تابع إلى **التكرار الذاتي والبرمجة الديناميكية (Recursion & Dynamic Programming)**، ولاحقاً **أقصر المسارات وUnion-Find** الذي يوسّع BFS إلى graphs ذات الأوزان.`,
    },
  },
];

export const lesson: Lesson = {
  nodeId: "trees-graphs",
  title: { en: "Trees & Graphs: Walking Through Networks", ar: "الأشجار والـ Graphs: التجوّل في الشبكات" },
  estMinutes: estimateMinutes(sections),
  sections,
};
