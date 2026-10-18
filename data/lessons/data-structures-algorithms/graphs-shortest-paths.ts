import type { Lesson, LessonSection } from "../types";
import { estimateMinutes } from "./estimate";

// Large inputs are generated here (not pasted) so the file stays readable. Expected outputs are
// derived by methods that differ from the reference solutions.

type Edge = [number, number, number];
const edgeLines = (edges: Edge[]) => edges.map(([u, v, w]) => `${u} ${v} ${w}`).join("\n");

// Dijkstra lab: 800 vertices. 0..749 are chained (i -> i + 1) plus 1 200 pseudo-random edges among
// them; 750..799 only have edges going out, so nothing can reach them (-1). The expected distances
// come from Bellman-Ford (repeat relaxing every edge until nothing changes), not from a heap.
const DJ_N = 800;
const dijkstraEdges: Edge[] = [
  ...Array.from({ length: 749 }, (_, i): Edge => [i, i + 1, ((i * 37) % 97) + 1]),
  ...Array.from({ length: 1200 }, (_, k): Edge => [(k * 7919 + 13) % 750, (k * 104729 + 7) % 750, (k * 31) % 100]),
  ...Array.from({ length: 251 }, (_, k): Edge => [750 + (k % 50), (k * 13) % DJ_N, (k * 17) % 100]),
];
const dijkstraInput = `${DJ_N} ${dijkstraEdges.length} 0\n${edgeLines(dijkstraEdges)}\n`;
const dijkstraExpected = (() => {
  const dist = new Array<number>(DJ_N).fill(Infinity);
  dist[0] = 0;
  for (let changed = true; changed; ) {
    changed = false;
    for (const [u, v, w] of dijkstraEdges) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        changed = true;
      }
    }
  }
  return dist.map((d) => (d === Infinity ? "-1" : String(d))).join(" ");
})();

// Bellman-Ford lab: 300 vertices, a chain 0 -> 1 -> ... -> 299 plus 1 701 pseudo-random edges, all
// going from a smaller to a larger index, with weights from -50 to 50. Such a graph has no cycle at
// all, so the expected distances come from one pass over the vertices in index order (dynamic
// programming on a DAG), not from Bellman-Ford. The edges are listed from the largest start vertex
// down, the worst order for Bellman-Ford: a single round of relaxations is far from enough.
const BF_N = 300;
const bfEdges: Edge[] = [
  ...Array.from({ length: BF_N - 1 }, (_, i): Edge => [i, i + 1, ((i * 37 + 11) % 101) - 50]),
  ...Array.from({ length: 1701 }, (_, k): Edge => {
    const u = (k * 7919 + 13) % (BF_N - 1);
    const v = u + 1 + ((k * 104729 + 7) % (BF_N - 1 - u));
    return [u, v, ((k * 31 + 7) % 101) - 50];
  }),
].sort((a, b) => b[0] - a[0]);
const bfInput = `${BF_N} ${bfEdges.length} 0\n${edgeLines(bfEdges)}\n`;
const bfExpected = (() => {
  const out: Edge[][] = Array.from({ length: BF_N }, () => []);
  for (const e of bfEdges) out[e[0]].push(e);
  const dist = new Array<number>(BF_N).fill(Infinity);
  dist[0] = 0;
  for (let u = 0; u < BF_N; u++) {
    if (dist[u] === Infinity) continue;
    for (const [, v, w] of out[u]) dist[v] = Math.min(dist[v], dist[u] + w);
  }
  return dist.map((d) => (d === Infinity ? "INF" : String(d))).join(" ");
})();

// Kruskal lab: 500 vertices joined by a chain in a scrambled order (so the graph is connected) plus
// 1 701 pseudo-random edges. The expected weight comes from Prim's algorithm on an adjacency matrix.
const MST_N = 500;
const mstPerm = Array.from({ length: MST_N }, (_, i) => (i * 7919) % MST_N); // 7919 is coprime with 500
const mstEdges: Edge[] = [
  ...Array.from({ length: MST_N - 1 }, (_, i): Edge => [mstPerm[i], mstPerm[i + 1], 500 + ((i * 37) % 400)]),
  ...Array.from({ length: 1701 }, (_, k): Edge => [(k * 104729 + 7) % MST_N, (k * 15485863 + 3) % MST_N, ((k * 31 + 11) % 999) + 1]),
];
const mstInput = `${MST_N} ${mstEdges.length}\n${edgeLines(mstEdges)}\n`;
const mstExpected = (() => {
  const w = Array.from({ length: MST_N }, () => new Array<number>(MST_N).fill(Infinity));
  for (const [u, v, c] of mstEdges) {
    if (u === v) continue;
    w[u][v] = Math.min(w[u][v], c);
    w[v][u] = w[u][v];
  }
  const inTree = new Array<boolean>(MST_N).fill(false);
  const best = new Array<number>(MST_N).fill(Infinity);
  best[0] = 0;
  let total = 0;
  for (let step = 0; step < MST_N; step++) {
    let pick = -1;
    for (let v = 0; v < MST_N; v++) if (!inTree[v] && (pick === -1 || best[v] < best[pick])) pick = v;
    inTree[pick] = true;
    total += best[pick];
    for (let v = 0; v < MST_N; v++) if (!inTree[v] && w[pick][v] < best[v]) best[v] = w[pick][v];
  }
  return String(total);
})();

const sections: LessonSection[] = [
  {
    type: "text",
    body: {
      en: `## What you'll learn

- How **weights** change the shortest-path question, and the single operation behind every shortest-path algorithm: **relaxing** an edge
- **Dijkstra's algorithm** with a heap: why its greedy choice is safe, how to rebuild the route, and why it costs O((V + E) log V)
- Why **negative edges** break Dijkstra, and how **Bellman-Ford** copes with them and detects **negative cycles**
- The **Union-Find** (disjoint set) structure, with union by size and path compression
- **Minimum spanning trees** and **Kruskal's algorithm**, built on Union-Find
- You will write: Dijkstra, Bellman-Ford with cycle detection, and Kruskal`,
      ar: `## ماذا ستتعلم

- كيف تغيّر **الأوزان** سؤال أقصر مسار، والعملية الوحيدة التي تقف خلف كل خوارزميات أقصر المسارات: **إرخاء (relaxing)** الحافة
- **خوارزمية Dijkstra** مع كومة: لماذا يكون اختيارها الجشع آمناً، وكيف تعيد بناء المسار، ولماذا تكلّف O((V + E) log V)
- لماذا **تكسر الحوافُ السالبة** خوارزميةَ Dijkstra، وكيف تتعامل معها **Bellman-Ford** وتكتشف **الدورات السالبة**
- بنية **Union-Find** (المجموعات المنفصلة disjoint set)، مع الدمج حسب الحجم وضغط المسار
- **الأشجار الممتدة الصغرى (MST)** و**خوارزمية Kruskal** المبنية على Union-Find
- ستكتب: Dijkstra، وBellman-Ford مع كشف الدورات، وKruskal`,
    },
  },
  {
    type: "text",
    body: {
      en: `## The GPS and the cable company

In Trees & Graphs, BFS found the **fewest moves** through a maze, because every step cost the same. A road map is different. A route of five short city streets can be faster than two long country roads, so each road (edge) carries a **weight**: minutes, kilometres or money. The question becomes: which route has the **smallest total weight**? Your GPS answers it on a graph with millions of junctions, and the internet answers it continuously: in the OSPF routing protocol (RFC 2328) every router builds a shortest-path tree of the network with Dijkstra's algorithm, while RIP (RFC 2453) is a distance-vector protocol built on the Bellman-Ford idea.

A cable company asks a different question. It must connect **every** town to the network, and laying cable between two towns has a cost. It does not care about the shortest route from one town to another; it wants the **cheapest set of cables that keeps everything connected**. That is a **minimum spanning tree**, and the tool that makes it fast is **Union-Find**, a structure that answers "are these two already connected?" almost instantly.`,
      ar: `## نظام الملاحة وشركة الكابلات

في درس الأشجار والـ Graphs وجد BFS **أقل عدد من الحركات** عبر المتاهة، لأن كل خطوة كانت تكلّف الشيء نفسه. أما خريطة الطرق فمختلفة. فمسار من خمسة شوارع قصيرة داخل المدينة قد يكون أسرع من طريقين ريفيين طويلين، ولذا يحمل كل طريق (حافة) **وزناً**: دقائق أو كيلومترات أو مالاً. ويصبح السؤال: أي مسار له **أصغر وزن إجمالي**؟ ونظام الملاحة (GPS) يجيب عنه على graph فيه ملايين التقاطعات، والإنترنت يجيب عنه باستمرار: ففي بروتوكول التوجيه OSPF (RFC 2328) يبني كل موجّه شجرة أقصر المسارات للشبكة بخوارزمية Dijkstra، بينما RIP (RFC 2453) بروتوكول من نوع متّجه المسافات (distance-vector) مبنيّ على فكرة Bellman-Ford.

أما شركة الكابلات فتسأل سؤالاً مختلفاً. عليها أن تصل **كل** البلدات بالشبكة، ومدّ كابل بين بلدتين له تكلفة. ولا يهمّها أقصر مسار من بلدة إلى أخرى؛ بل تريد **أرخص مجموعة من الكابلات تُبقي كل شيء متصلاً**. هذه **شجرة ممتدة صغرى (minimum spanning tree)**، والأداة التي تجعلها سريعة هي **Union-Find**، وهي بنية تجيب عن سؤال "هل هذان متصلان أصلاً؟" فوراً تقريباً.`,
    },
  },
  {
    type: "text",
    body: {
      en: `## Weighted graphs and Dijkstra's algorithm

Store a weighted graph as an adjacency list of \`(neighbour, weight)\` pairs. Every shortest-path algorithm keeps \`dist[v]\`, the best distance from the source found **so far** (0 for the source, infinity for the rest), and improves it with one operation, **relaxing** an edge \`u -> v\` of weight \`w\`:

\`\`\`
if dist[u] + w < dist[v]:
    dist[v] = dist[u] + w        # going through u is better
    parent[v] = u                # remember how we got here, to rebuild the route
\`\`\`

The algorithms differ only in the **order** in which they relax edges. BFS's order is wrong as soon as weights differ:

\`\`\`
A --5--> C
A --1--> B --1--> C

fewest edges:   A -> C        (1 edge, cost 5)
cheapest:       A -> B -> C   (2 edges, cost 2)
\`\`\`

**Dijkstra's algorithm** (Edsger Dijkstra, 1959) works when **no weight is negative**. Repeatedly take the vertex with the **smallest tentative distance** that is not final yet, declare its distance **final**, and relax its outgoing edges. A min-heap hands you that vertex. Why may it be declared final? Any other route to it must leave the finished vertices at some unfinished vertex whose tentative distance is already at least as large, and edges that cannot be negative never make a route shorter.

Library heaps cannot lower a priority in place, so use **lazy deletion**: push \`(new distance, v)\` every time \`dist[v]\` improves, and when you pop an entry whose distance is larger than \`dist[v]\`, it is outdated: skip it. With weights that are never negative, each vertex passes this check exactly once, at its final distance.

\`\`\`python
import heapq

def dijkstra(graph, source):
    dist = {v: float("inf") for v in graph}
    dist[source] = 0
    heap = [(0, source)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue                     # outdated entry
        for v, w in graph[u]:
            if d + w < dist[v]:          # relax u -> v
                dist[v] = d + w
                heapq.heappush(heap, (dist[v], v))
    return dist
\`\`\`

\`\`\`
S --4--> A,  S --1--> B,  B --2--> A,  A --1--> C,  B --5--> C

pop S (0)   relax: A = 4, B = 1
pop B (1)   relax: A = 1 + 2 = 3 (better than 4), C = 1 + 5 = 6
pop A (3)   relax: C = 3 + 1 = 4 (better than 6)
pop A (4)   outdated (dist[A] is 3): skip
pop C (4)   final.  Distances: S 0, B 1, A 3, C 4.  Route to C: S -> B -> A -> C
\`\`\`

Every improvement pushes one entry, so the heap holds O(E) entries and the algorithm runs in **O((V + E) log V)**. To print a route, follow \`parent\` back from the target and reverse the list.`,
      ar: `## الـ Graphs ذات الأوزان وخوارزمية Dijkstra

خزّن الـ graph ذا الأوزان كقائمة جوار من الأزواج \`(الجار، الوزن)\`. وكل خوارزمية لأقصر المسارات تحتفظ بـ \`dist[v]\`، أي أفضل مسافة من المصدر وُجدت **حتى الآن** (0 للمصدر، وما لا نهاية للبقية)، وتحسّنها بعملية واحدة هي **إرخاء (relaxing)** الحافة \`u -> v\` ذات الوزن \`w\`:

\`\`\`
if dist[u] + w < dist[v]:
    dist[v] = dist[u] + w        # المرور عبر u أفضل
    parent[v] = u                # تذكّر كيف وصلنا، لنعيد بناء المسار
\`\`\`

والخوارزميات لا تختلف إلا في **ترتيب** إرخاء الحواف. وترتيب BFS يصبح خاطئاً بمجرد أن تختلف الأوزان:

\`\`\`
A --5--> C
A --1--> B --1--> C

fewest edges:   A -> C        (1 edge, cost 5)
cheapest:       A -> B -> C   (2 edges, cost 2)
\`\`\`

**خوارزمية Dijkstra** (التي وضعها Edsger Dijkstra عام 1959) تعمل حين **لا يكون أي وزن سالباً**. خذ مراراً الرأس صاحب **أصغر مسافة مؤقتة** مما لم يصبح نهائياً بعد، وأعلن مسافته **نهائية**، وأرخِ حوافه الخارجة. والكومة الصغرى تسلّمك ذلك الرأس. لماذا يجوز إعلانه نهائياً؟ لأن أي مسار آخر إليه يجب أن يغادر الرؤوس المنتهية عند رأس غير منتهٍ مسافته المؤقتة لا تقل عن مسافته، والحواف التي لا يمكن أن تكون سالبة لا تجعل أي مسار أقصر أبداً.

الكومات الجاهزة في المكتبات لا تستطيع خفض الأولوية في مكانها، فاستخدم **الحذف الكسول (lazy deletion)**: أضف \`(المسافة الجديدة، v)\` كلما تحسّنت \`dist[v]\`، وحين تسحب مدخلاً مسافته أكبر من \`dist[v]\` فهو قديم: تجاهله. وما دامت الأوزان غير سالبة فإن كل رأس يجتاز هذا الشرط مرة واحدة بالضبط، عند مسافته النهائية.

\`\`\`python
import heapq

def dijkstra(graph, source):
    dist = {v: float("inf") for v in graph}
    dist[source] = 0
    heap = [(0, source)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue                     # مدخل قديم
        for v, w in graph[u]:
            if d + w < dist[v]:          # أرخِ u -> v
                dist[v] = d + w
                heapq.heappush(heap, (dist[v], v))
    return dist
\`\`\`

\`\`\`
S --4--> A,  S --1--> B,  B --2--> A,  A --1--> C,  B --5--> C

pop S (0)   relax: A = 4, B = 1
pop B (1)   relax: A = 1 + 2 = 3 (better than 4), C = 1 + 5 = 6
pop A (3)   relax: C = 3 + 1 = 4 (better than 6)
pop A (4)   outdated (dist[A] is 3): skip
pop C (4)   final.  Distances: S 0, B 1, A 3, C 4.  Route to C: S -> B -> A -> C
\`\`\`

كل تحسين يضيف مدخلاً واحداً، فتحمل الكومة O(E) مدخلاً وتعمل الخوارزمية في **O((V + E) log V)**. ولطباعة المسار اتبع \`parent\` رجوعاً من الهدف ثم اعكس القائمة.`,
    },
  },
  {
    type: "code-demo",
    lang: "python",
    code: `import heapq

def dijkstra(graph, source, limit=1000):
    dist = {v: float("inf") for v in graph}
    dist[source] = 0
    parent = {source: None}
    expanded = []                          # every (vertex, distance) whose edges we relax
    heap = [(0, source)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue                       # an outdated entry: u was reached more cheaply
        expanded.append((u, d))
        if len(expanded) > limit:
            raise RuntimeError(f"still running after {limit} expansions")
        for v, w in graph[u]:
            if d + w < dist[v]:
                dist[v] = d + w            # relax the edge u -> v
                parent[v] = u
                heapq.heappush(heap, (dist[v], v))
    return dist, parent, expanded

def path_to(parent, target):
    path = []
    while target is not None:
        path.append(target)
        target = parent[target]
    return path[::-1]

roads = {"S": [("A", 4), ("B", 1)], "A": [("C", 1)], "B": [("A", 2), ("C", 5)], "C": []}
dist, parent, _ = dijkstra(roads, "S")
print("distances from S:", dist)
print("route to C:", " -> ".join(path_to(parent, "C")), "| cost", dist["C"])

def bellman_ford(graph, source):
    dist = {v: float("inf") for v in graph}
    dist[source] = 0
    edges = [(u, v, w) for u in graph for v, w in graph[u]]
    for _ in range(len(graph) - 1):        # V - 1 rounds of relaxing every edge
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    cycle = any(dist[u] + w < dist[v] for u, v, w in edges)   # a V-th round still improves?
    return dist, cycle

refund = {"A": [("B", 2), ("C", 3)], "B": [("D", 1)], "C": [("B", -2)], "D": []}
dist, _, expanded = dijkstra(refund, "A")
print("Dijkstra, negative edge:", dist)
print("  expanded in this order:", ", ".join(f"{u} at {d}" for u, d in expanded))
print("Bellman-Ford:           ", bellman_ford(refund, "A")[0])
loop = {"A": [("B", 1)], "B": [("C", -2)], "C": [("B", 1)]}
print("negative cycle B -> C -> B detected:", bellman_ford(loop, "A")[1])
try:
    dijkstra(loop, "A")
except RuntimeError as err:
    print("Dijkstra on the same graph:", err)
`,
    explanation: {
      en: "On the road map Dijkstra finds the cost-4 route S, B, A, C, the one with more edges. On the 'refund' graph it expands B at 2, the distance it should be able to call final, and only then the edge C -> B of weight -2 lowers B to 1, so B is expanded a second time and D drops to 2 before it is ever expanded. The distances match Bellman-Ford (B = 1, D = 2) only because this code never trusts 'final'; a version that marks popped vertices as done and skips them would keep B = 2 and D = 3. On the negative cycle Bellman-Ford reports the cycle, while Dijkstra keeps lowering B and C and would never stop: the limit makes it give up.",
      ar: "على خريطة الطرق تجد Dijkstra المسار S ثم B ثم A ثم C بتكلفة 4، وهو المسار ذو الحواف الأكثر. أما على graph 'الاسترداد' فتوسّع B عند 2، وهي المسافة التي يُفترض أن تعلنها نهائية، ثم تخفض الحافة C -> B ذات الوزن -2 قيمة B إلى 1، فتُوسَّع B مرة ثانية وتنخفض D إلى 2 قبل أن تُوسَّع أصلاً. وتطابق المسافات ما تجده Bellman-Ford (B = 1 وD = 2) فقط لأن هذه الشيفرة لا تثق أبداً بأن المسافة 'نهائية'؛ أما النسخة التي تعلّم الرؤوس المسحوبة بأنها منتهية وتتخطاها فستُبقي B = 2 وD = 3. وعلى الدورة السالبة تبلّغ Bellman-Ford عن الدورة، بينما تظل Dijkstra تخفض B وC ولن تتوقف أبداً: والحد هو ما يجعلها تستسلم.",
    },
  },
  {
    type: "lab",
    id: "dijkstra-distances",
    lang: "python",
    prompt: {
      en: `**Dijkstra's shortest distances.** A directed graph has \`n\` vertices (\`0\` to \`n - 1\`) and \`m\` weighted edges, all weights **0 or more**. Print the shortest distance from the source \`s\` to every vertex.

**Input:** the first line has \`n m s\`. Then \`m\` lines, each \`u v w\`: an edge from \`u\` to \`v\` with weight \`w\`. Edges can repeat, and \`u\` can equal \`v\`.

**Output:** one line with \`n\` numbers separated by spaces: the distance to vertex 0, 1, ..., n - 1, or \`-1\` for a vertex that cannot be reached.

**Example:** input
\`\`\`
4 5 0
0 1 4
0 2 1
2 1 2
1 3 1
2 3 5
\`\`\`
prints \`0 3 1 4\`: this is the road map from the lesson with S = 0, A = 1, B = 2, C = 3.

Use \`heapq\` with \`(distance, vertex)\` entries and skip outdated entries (\`if d > dist[u]: continue\`).`,
      ar: `**أقصر المسافات بخوارزمية Dijkstra.** في graph موجّه \`n\` رأساً (من \`0\` إلى \`n - 1\`) و\`m\` حافة ذات وزن، وكل الأوزان **0 أو أكثر**. اطبع أقصر مسافة من المصدر \`s\` إلى كل رأس.

**المدخل:** السطر الأول فيه \`n m s\`. ثم \`m\` سطراً، في كل منها \`u v w\`: حافة من \`u\` إلى \`v\` وزنها \`w\`. قد تتكرر الحواف، وقد تساوي \`u\` الرأس \`v\`.

**المخرج:** سطر واحد فيه \`n\` عدداً تفصل بينها مسافات: المسافة إلى الرأس 0 ثم 1 ... ثم n - 1، أو \`-1\` للرأس الذي لا يمكن بلوغه.

**مثال:** المدخل
\`\`\`
4 5 0
0 1 4
0 2 1
2 1 2
1 3 1
2 3 5
\`\`\`
يطبع \`0 3 1 4\`: وهذه خريطة الطرق من الدرس مع S = 0 وA = 1 وB = 2 وC = 3.

استخدم \`heapq\` بمدخلات \`(المسافة، الرأس)\` وتجاهل المدخلات القديمة (\`if d > dist[u]: continue\`).`,
    },
    starterCode: `import sys
import heapq

data = sys.stdin.read().split()
n, m, s = int(data[0]), int(data[1]), int(data[2])
graph = [[] for _ in range(n)]          # graph[u] = list of (v, w)
for i in range(m):
    u, v, w = int(data[3 + 3 * i]), int(data[4 + 3 * i]), int(data[5 + 3 * i])
    graph[u].append((v, w))

INF = float("inf")
dist = [INF] * n
dist[s] = 0

# TODO: Dijkstra with a heap.
# heap = [(0, s)]; while the heap is not empty: d, u = heapq.heappop(heap)
#   if d > dist[u]: continue            (an outdated entry)
#   for each (v, w) in graph[u]: if d + w < dist[v]: dist[v] = d + w and push (dist[v], v)

print(" ".join(str(x) if x != INF else "-1" for x in dist))
`,
    solution: `import sys
import heapq

data = sys.stdin.read().split()
n, m, s = int(data[0]), int(data[1]), int(data[2])
graph = [[] for _ in range(n)]          # graph[u] = list of (v, w)
for i in range(m):
    u, v, w = int(data[3 + 3 * i]), int(data[4 + 3 * i]), int(data[5 + 3 * i])
    graph[u].append((v, w))

INF = float("inf")
dist = [INF] * n
dist[s] = 0

heap = [(0, s)]
while heap:
    d, u = heapq.heappop(heap)
    if d > dist[u]:
        continue                         # outdated: u was already reached more cheaply
    for v, w in graph[u]:
        if d + w < dist[v]:              # relax the edge u -> v
            dist[v] = d + w
            heapq.heappush(heap, (dist[v], v))

print(" ".join(str(x) if x != INF else "-1" for x in dist))
`,
    hints: [
      { en: "Start with heap = [(0, s)]. Each loop pops the entry with the smallest distance: d, u = heapq.heappop(heap).", ar: "ابدأ بـ heap = [(0, s)]. وفي كل دورة اسحب المدخل صاحب أصغر مسافة: d, u = heapq.heappop(heap)." },
      { en: "If d > dist[u], this entry is outdated (u was improved after it was pushed): continue. Otherwise d is u's final distance.", ar: "إن كان d > dist[u] فهذا المدخل قديم (فقد تحسّنت u بعد إضافته): نفّذ continue. وإلا فإن d هي المسافة النهائية لـ u." },
      { en: "Relax every edge: for v, w in graph[u]: if d + w < dist[v], set dist[v] = d + w and heapq.heappush(heap, (dist[v], v)).", ar: "أرخِ كل حافة: for v, w in graph[u]: إن كان d + w < dist[v] فاجعل dist[v] = d + w ونفّذ heapq.heappush(heap, (dist[v], v))." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "4 5 0\n0 1 4\n0 2 1\n2 1 2\n1 3 1\n2 3 5\n", expected: "0 3 1 4" },
      { name: { en: "Fewest edges is not cheapest", ar: "أقل عدد حواف ليس الأرخص" }, stdin: "4 4 0\n0 3 100\n0 1 1\n1 2 1\n2 3 1\n", expected: "0 1 2 3" },
      { name: { en: "An unreachable vertex", ar: "رأس لا يمكن بلوغه" }, stdin: "3 1 0\n0 1 7\n", expected: "0 7 -1" },
      { name: { en: "Zero-weight edges", ar: "حواف وزنها صفر" }, stdin: "3 3 0\n0 1 0\n1 2 0\n0 2 5\n", expected: "0 0 0" },
      { name: { en: "Repeated edges and a source that is not 0", ar: "حواف مكررة ومصدر ليس 0" }, stdin: "3 4 2\n2 0 9\n2 0 4\n0 1 6\n1 1 3\n", expected: "4 10 0" },
      { name: { en: "800 vertices and 2,200 edges", ar: "800 رأس و2,200 حافة" }, stdin: dijkstraInput, expected: dijkstraExpected },
    ],
    sampleInput: "4 5 0\n0 1 4\n0 2 1\n2 1 2\n1 3 1\n2 3 5\n",
  },
  {
    type: "text",
    body: {
      en: `## Negative edges and Bellman-Ford

Dijkstra's promise "the smallest tentative distance is final" relies on edges never being negative. Break that rule and the promise fails:

\`\`\`
        2           1
   A ------> B ------> D
    \\        ^
   3 \\       | -2
      \\----> C

pop A (0)   relax: B = 2, C = 3
pop B (2)   B "final" at 2;  relax: D = 3
pop C (3)   relax C -> B: 3 - 2 = 1 < 2
real:       B = 1 (A -> C -> B),  D = 2 (A -> C -> B -> D)
\`\`\`

The argument breaks the moment a popped vertex is treated as final: B was popped at 2, but a later edge of weight -2 makes it 1. A version that marks popped vertices as done and never touches them again keeps B = 2 and D = 3, both wrong. The lazy code above has no such mark: when C -> B lowers B, it pushes B again, expands it a second time and fixes D. It returns correct distances as long as no negative cycle is reachable, but it is no longer the algorithm whose cost you know: a vertex can be expanded many times, exponentially many in the worst case, and if a negative cycle is reachable the loop never ends. Negative weights need an algorithm built for them.

Negative weights are not exotic: a step that earns a refund or a bonus, or currency exchange, where taking \`-log(rate)\` as the weight turns "multiply the rates" into "add the weights", so a profitable loop of trades (arbitrage) becomes a cycle of negative total weight.

**Bellman-Ford** (Richard Bellman and Lester Ford, 1950s) makes no assumption about the order. It simply relaxes **every edge**, **V - 1 times**:

\`\`\`python
dist = {v: float("inf") for v in graph}
dist[source] = 0
for _ in range(V - 1):
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
\`\`\`

**Why V - 1 rounds?** A shortest path that does not repeat a vertex has at most V - 1 edges. After round 1, every vertex whose shortest path has 1 edge is correct; after round k, every vertex whose shortest path has at most k edges is correct. You can stop early when a round changes nothing. The cost is **O(V x E)**: slower than Dijkstra, but it accepts negative weights.

**Negative cycles.** If a cycle has negative total weight and the source can reach it, you can go around it forever and every loop makes the route cheaper: the shortest distance is not defined. Bellman-Ford detects this with one extra round: **if any edge can still be relaxed after V - 1 rounds, a negative cycle is reachable**. (A negative cycle the source cannot reach does no harm; skip edges that start at an unreachable vertex.) Distance-vector routing protocols are distributed Bellman-Ford: routers repeatedly send their distance tables to their neighbours, and RIP caps a route at 15 hops, using a metric of 16 to mean "unreachable".

**Which tool when?** All steps cost the same: BFS. Weights 0 or more: Dijkstra. Negative weights, or you must detect negative cycles: Bellman-Ford. (For all pairs on a small graph, Floyd-Warshall runs in O(V³).)`,
      ar: `## الحواف السالبة وBellman-Ford

وعد Dijkstra بأن "أصغر مسافة مؤقتة نهائية" يعتمد على ألا تكون الحواف سالبة أبداً. اكسر هذه القاعدة فيسقط الوعد:

\`\`\`
        2           1
   A ------> B ------> D
    \\        ^
   3 \\       | -2
      \\----> C

pop A (0)   relax: B = 2, C = 3
pop B (2)   B "final" at 2;  relax: D = 3
pop C (3)   relax C -> B: 3 - 2 = 1 < 2
real:       B = 1 (A -> C -> B),  D = 2 (A -> C -> B -> D)
\`\`\`

تنهار الحجة لحظةَ معاملة الرأس المسحوب على أنه نهائي: فقد سُحبت B عند 2، لكن حافة لاحقة وزنها -2 تجعلها 1. والنسخة التي تعلّم الرؤوس المسحوبة بأنها منتهية ولا تعود إليها أبداً تُبقي B = 2 وD = 3، وكلاهما خطأ. أما الشيفرة الكسولة أعلاه فليس فيها هذا التعليم: حين تخفض C -> B قيمة B تضيف B من جديد وتوسّعها مرة ثانية فتصلح D. وهي تعيد مسافات صحيحة ما دامت لا توجد دورة سالبة يمكن بلوغها، لكنها لم تعد الخوارزمية التي تعرف تكلفتها: فقد يُوسَّع الرأس مرات كثيرة، أُسّية العدد في أسوأ الحالات، وإن أمكن بلوغ دورة سالبة فلن تنتهي الحلقة أبداً. فالأوزان السالبة تحتاج خوارزمية صُمّمت لها.

والأوزان السالبة ليست غريبة: خطوة تمنحك استرداداً أو مكافأة، أو صرف العملات، حيث يحوّل أخذ \`-log(rate)\` وزناً عمليةَ "ضرب أسعار الصرف" إلى "جمع الأوزان"، فتصبح سلسلة صفقات مربحة تعود إلى نقطة البداية (المراجحة arbitrage) دورةً وزنها الإجمالي سالب.

أما **Bellman-Ford** (التي تُنسب إلى Richard Bellman وLester Ford في خمسينيات القرن العشرين) فلا تفترض شيئاً عن الترتيب. بل ترخي **كل الحواف** ببساطة، **V - 1 مرة**:

\`\`\`python
dist = {v: float("inf") for v in graph}
dist[source] = 0
for _ in range(V - 1):
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
\`\`\`

**لماذا V - 1 جولة؟** أقصر مسار لا يكرّر رأساً فيه V - 1 حافة على الأكثر. بعد الجولة 1 يصبح صحيحاً كل رأس أقصر مساره حافة واحدة؛ وبعد الجولة k يصبح صحيحاً كل رأس أقصر مساره k حافة على الأكثر. ويمكنك التوقف مبكراً حين لا تغيّر جولةٌ شيئاً. والتكلفة **O(V × E)**: أبطأ من Dijkstra، لكنها تقبل الأوزان السالبة.

**الدورات السالبة.** إن كان وزن دورة إجمالاً سالباً ويستطيع المصدر بلوغها، فيمكنك الدوران فيها إلى الأبد وكل دورة تجعل المسار أرخص: فأقصر مسافة غير معرّفة. وتكتشف Bellman-Ford ذلك بجولة إضافية واحدة: **إن أمكن إرخاء أي حافة بعد V - 1 جولة فهناك دورة سالبة يمكن بلوغها**. (أما الدورة السالبة التي لا يبلغها المصدر فلا تضرّ؛ تخطَّ الحواف التي تبدأ من رأس لا يمكن بلوغه.) وبروتوكولات التوجيه من نوع متّجه المسافات هي Bellman-Ford موزّعة: يرسل كل موجّه جدول مسافاته إلى جيرانه مراراً، ويحدّ RIP المسار بـ 15 قفزة ويستخدم القيمة 16 لتعني "لا يمكن بلوغه".

**أي أداة ومتى؟** كل الخطوات بالتكلفة نفسها: BFS. الأوزان 0 أو أكثر: Dijkstra. أوزان سالبة، أو عليك كشف الدورات السالبة: Bellman-Ford. (ولكل الأزواج في graph صغير تعمل Floyd-Warshall في O(V³).)`,
    },
  },
  {
    type: "lab",
    id: "bellman-ford",
    lang: "java",
    prompt: {
      en: `**Bellman-Ford with negative edges.** A directed graph has \`n\` vertices and \`m\` edges whose weights can be **negative**. Print the shortest distance from \`s\` to every vertex, unless a negative cycle can be reached from \`s\`.

**Input:** the first line has \`n m s\`. Then \`m\` lines, each \`u v w\` (from \`u\` to \`v\`, weight \`w\` between -1,000 and 1,000).

**Output:** \`NEGATIVE CYCLE\` if a cycle of negative total weight is reachable from \`s\`. Otherwise one line with \`n\` values separated by spaces: each distance, or \`INF\` for a vertex that cannot be reached. (\`-1\` cannot mean "unreachable" here, because it can be a real distance.)

**Example:** input
\`\`\`
4 4 0
0 1 2
0 2 3
2 1 -2
1 3 1
\`\`\`
prints \`0 1 3 2\`: the 'refund' graph from the lesson, where Dijkstra's "final" B = 2 turned out wrong.

Relax every edge \`n - 1\` times (stop early if a round changes nothing), then do one more pass: if any edge still improves a distance, print \`NEGATIVE CYCLE\`. Never relax from a vertex whose distance is still infinite.`,
      ar: `**Bellman-Ford مع حواف سالبة.** في graph موجّه \`n\` رأساً و\`m\` حافة قد تكون أوزانها **سالبة**. اطبع أقصر مسافة من \`s\` إلى كل رأس، إلا إن أمكن بلوغ دورة سالبة من \`s\`.

**المدخل:** السطر الأول فيه \`n m s\`. ثم \`m\` سطراً، في كل منها \`u v w\` (من \`u\` إلى \`v\`، والوزن \`w\` بين -1,000 و1,000).

**المخرج:** \`NEGATIVE CYCLE\` إن أمكن بلوغ دورة وزنها الإجمالي سالب من \`s\`. وإلا فسطر واحد فيه \`n\` قيمة تفصل بينها مسافات: كل مسافة، أو \`INF\` للرأس الذي لا يمكن بلوغه. (لا يمكن أن تعني \`-1\` هنا "لا يمكن بلوغه"، لأنها قد تكون مسافة حقيقية.)

**مثال:** المدخل
\`\`\`
4 4 0
0 1 2
0 2 3
2 1 -2
1 3 1
\`\`\`
يطبع \`0 1 3 2\`: وهو graph 'الاسترداد' من الدرس، حيث تبيّن أن B = 2 "النهائية" عند Dijkstra خطأ.

أرخِ كل حافة \`n - 1\` مرة (وتوقف مبكراً إن لم تغيّر جولةٌ شيئاً)، ثم نفّذ مروراً إضافياً واحداً: إن حسّنت أي حافة مسافة ما فاطبع \`NEGATIVE CYCLE\`. ولا ترخِ أبداً من رأس ما زالت مسافته لا نهائية.`,
    },
    starterCode: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder all = new StringBuilder();
        for (String line; (line = in.readLine()) != null; ) all.append(line).append(' ');
        StringTokenizer tok = new StringTokenizer(all.toString());
        int n = Integer.parseInt(tok.nextToken());
        int m = Integer.parseInt(tok.nextToken());
        int s = Integer.parseInt(tok.nextToken());
        int[] from = new int[m], to = new int[m];
        long[] weight = new long[m];
        for (int i = 0; i < m; i++) {
            from[i] = Integer.parseInt(tok.nextToken());
            to[i] = Integer.parseInt(tok.nextToken());
            weight[i] = Long.parseLong(tok.nextToken());
        }

        final long INF = Long.MAX_VALUE / 4;
        long[] dist = new long[n];
        Arrays.fill(dist, INF);
        dist[s] = 0;

        // TODO: Bellman-Ford.
        // 1. Repeat n - 1 rounds: for every edge i, if dist[from[i]] != INF and
        //    dist[from[i]] + weight[i] < dist[to[i]], improve dist[to[i]]. Stop early if nothing changed.
        // 2. One more pass over the edges: if any edge can still improve a distance (same test),
        //    print NEGATIVE CYCLE and return.

        StringBuilder out = new StringBuilder();
        for (int v = 0; v < n; v++) {
            if (v > 0) out.append(' ');
            out.append(dist[v] == INF ? "INF" : Long.toString(dist[v]));
        }
        System.out.println(out);
    }
}
`,
    solution: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder all = new StringBuilder();
        for (String line; (line = in.readLine()) != null; ) all.append(line).append(' ');
        StringTokenizer tok = new StringTokenizer(all.toString());
        int n = Integer.parseInt(tok.nextToken());
        int m = Integer.parseInt(tok.nextToken());
        int s = Integer.parseInt(tok.nextToken());
        int[] from = new int[m], to = new int[m];
        long[] weight = new long[m];
        for (int i = 0; i < m; i++) {
            from[i] = Integer.parseInt(tok.nextToken());
            to[i] = Integer.parseInt(tok.nextToken());
            weight[i] = Long.parseLong(tok.nextToken());
        }

        final long INF = Long.MAX_VALUE / 4;
        long[] dist = new long[n];
        Arrays.fill(dist, INF);
        dist[s] = 0;

        for (int round = 0; round < n - 1; round++) {
            boolean changed = false;
            for (int i = 0; i < m; i++) {
                if (dist[from[i]] != INF && dist[from[i]] + weight[i] < dist[to[i]]) {
                    dist[to[i]] = dist[from[i]] + weight[i]; // relax
                    changed = true;
                }
            }
            if (!changed) break; // every distance is final already
        }
        for (int i = 0; i < m; i++) {
            if (dist[from[i]] != INF && dist[from[i]] + weight[i] < dist[to[i]]) {
                System.out.println("NEGATIVE CYCLE"); // still improving after n - 1 rounds
                return;
            }
        }

        StringBuilder out = new StringBuilder();
        for (int v = 0; v < n; v++) {
            if (v > 0) out.append(' ');
            out.append(dist[v] == INF ? "INF" : Long.toString(dist[v]));
        }
        System.out.println(out);
    }
}
`,
    hints: [
      { en: "Write the relaxation test once: dist[from[i]] != INF && dist[from[i]] + weight[i] < dist[to[i]]. The INF check stops an unreachable vertex from 'improving' anything.", ar: "اكتب شرط الإرخاء مرة واحدة: dist[from[i]] != INF && dist[from[i]] + weight[i] < dist[to[i]]. والتحقق من INF يمنع رأساً لا يمكن بلوغه من 'تحسين' أي شيء." },
      { en: "Loop for (int round = 0; round < n - 1; round++) over all m edges, track boolean changed, and break when a whole round changed nothing.", ar: "كرّر for (int round = 0; round < n - 1; round++) على كل الحواف الـ m، وتتبّع المتغير المنطقي changed، واخرج بـ break حين لا تغيّر جولة كاملة شيئاً." },
      { en: "Afterwards loop over the edges once more with the same test. If it is ever true, print NEGATIVE CYCLE and return before printing the distances.", ar: "بعد ذلك مرّ على الحواف مرة أخرى بالشرط نفسه. فإن تحقق ولو مرة فاطبع NEGATIVE CYCLE ونفّذ return قبل طباعة المسافات." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "4 4 0\n0 1 2\n0 2 3\n2 1 -2\n1 3 1\n", expected: "0 1 3 2" },
      { name: { en: "A reachable negative cycle", ar: "دورة سالبة يمكن بلوغها" }, stdin: "3 3 0\n0 1 1\n1 2 -2\n2 1 1\n", expected: "NEGATIVE CYCLE" },
      { name: { en: "A negative cycle the source cannot reach", ar: "دورة سالبة لا يبلغها المصدر" }, stdin: "4 3 0\n0 1 5\n2 3 -2\n3 2 1\n", expected: "0 5 INF INF" },
      { name: { en: "Only negative weights, edges listed backwards", ar: "أوزان سالبة فقط، والحواف مسرودة بالعكس" }, stdin: "3 2 0\n1 2 -5\n0 1 -5\n", expected: "0 -5 -10" },
      { name: { en: "A single vertex", ar: "رأس واحد" }, stdin: "1 0 0\n", expected: "0" },
      { name: { en: "300 vertices, 2,000 edges, weights -50 to 50", ar: "300 رأس و2,000 حافة، والأوزان من -50 إلى 50" }, stdin: bfInput, expected: bfExpected },
    ],
    sampleInput: "4 4 0\n0 1 2\n0 2 3\n2 1 -2\n1 3 1\n",
  },
  {
    type: "text",
    body: {
      en: `## Union-Find: who is connected to whom?

Links keep appearing (friendships, cables, merged accounts) and you must answer, at any moment, **"are x and y in the same group?"**. Running a BFS for each question costs O(V + E). **Union-Find** (a disjoint-set structure) answers in almost constant time.

**The idea:** every group is a small tree, stored in a \`parent\` array; the root of the tree **represents** the group.

- \`find(x)\`: follow parents from \`x\` up to the root and return it. Two elements are in the same group exactly when \`find\` returns the same root.
- \`union(a, b)\`: find both roots; if they differ, hang one root under the other.

Two small tricks make the trees almost flat:

- **Union by size:** hang the **smaller** tree under the larger one. A tree can then only get one level deeper when its size at least doubles, so heights stay O(log n).
- **Path compression:** during \`find\`, point the nodes you pass closer to the root, so the next \`find\` is shorter. The one-line form below is called *path halving*.

\`\`\`python
parent = list(range(n))          # everyone starts alone
size = [1] * n

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]   # path halving: skip a level while climbing
        x = parent[x]
    return x

def union(a, b):
    ra, rb = find(a), find(b)
    if ra == rb:
        return False                    # already in the same group
    if size[ra] < size[rb]:
        ra, rb = rb, ra
    parent[rb] = ra                     # the smaller tree goes under the larger
    size[ra] += size[rb]
    return True
\`\`\`

\`\`\`
union(1, 2), union(3, 4):        1     3
                                 |     |          (a line joins a child to its parent)
                                 2     4
union(2, 4): roots 1 and 3       1
                                / \\
                               2   3
                                   |
                                   4              find(4) then re-points 4 straight at 1
\`\`\`

With both tricks, a sequence of operations costs **O(α(n)) amortised** per operation, where α is the inverse Ackermann function (Robert Tarjan proved the bound for full path compression in 1975, and Tarjan and Jan van Leeuwen showed in 1984 that path halving achieves it too). α(n) is at most 4 for any n you could ever store, so in practice it is constant time.`,
      ar: `## Union-Find: من متصل بمن؟

تظهر الروابط باستمرار (صداقات، وكابلات، وحسابات مدمجة) وعليك أن تجيب في أي لحظة: **"هل x وy في المجموعة نفسها؟"**. تشغيل BFS لكل سؤال يكلّف O(V + E). أما **Union-Find** (بنية المجموعات المنفصلة disjoint set) فتجيب في زمن ثابت تقريباً.

**الفكرة:** كل مجموعة شجرة صغيرة مخزّنة في مصفوفة \`parent\`؛ وجذر الشجرة **يمثّل** المجموعة.

- \`find(x)\`: اتبع الآباء من \`x\` صعوداً حتى الجذر وأعده. والعنصران في المجموعة نفسها تماماً حين تعيد \`find\` الجذر نفسه لكليهما.
- \`union(a, b)\`: أوجد الجذرين؛ فإن اختلفا فعلّق أحدهما تحت الآخر.

حيلتان صغيرتان تجعلان الأشجار شبه مسطّحة:

- **الدمج حسب الحجم (union by size):** علّق الشجرة **الأصغر** تحت الأكبر. فلا تزداد الشجرة عمقاً مستوى واحداً إلا حين يتضاعف حجمها على الأقل، فتبقى الارتفاعات O(log n).
- **ضغط المسار (path compression):** أثناء \`find\` اجعل العقد التي تمرّ بها تشير إلى أقرب من الجذر، فتصبح \`find\` التالية أقصر. والصيغة ذات السطر الواحد أدناه تُسمّى *تنصيف المسار (path halving)*.

\`\`\`python
parent = list(range(n))          # كل عنصر يبدأ وحيداً
size = [1] * n

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]   # تنصيف المسار: تخطَّ مستوى أثناء الصعود
        x = parent[x]
    return x

def union(a, b):
    ra, rb = find(a), find(b)
    if ra == rb:
        return False                    # في المجموعة نفسها أصلاً
    if size[ra] < size[rb]:
        ra, rb = rb, ra
    parent[rb] = ra                     # الشجرة الأصغر تحت الأكبر
    size[ra] += size[rb]
    return True
\`\`\`

\`\`\`
union(1, 2), union(3, 4):        1     3
                                 |     |          (a line joins a child to its parent)
                                 2     4
union(2, 4): roots 1 and 3       1
                                / \\
                               2   3
                                   |
                                   4              find(4) then re-points 4 straight at 1
\`\`\`

ومع الحيلتين معاً تكلّف سلسلة العمليات **O(α(n)) مُهلَكة** لكل عملية، حيث α دالة Ackermann العكسية (وقد أثبت Robert Tarjan هذا الحد لضغط المسار الكامل عام 1975، وبيّن Tarjan وJan van Leeuwen عام 1984 أن تنصيف المسار يبلغه أيضاً). وα(n) لا تتجاوز 4 لأي n يمكن أن تخزّنه يوماً، فهي عملياً زمن ثابت.`,
    },
  },
  {
    type: "code-demo",
    lang: "js",
    code: `// Union-Find with union by size and path halving
function makeSets(n) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const size = new Array(n).fill(1);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]; // path halving: skip a level while climbing
      x = parent[x];
    }
    return x;
  };
  const union = (a, b) => {
    let ra = find(a);
    let rb = find(b);
    if (ra === rb) return false; // already in the same group
    if (size[ra] < size[rb]) [ra, rb] = [rb, ra];
    parent[rb] = ra; // hang the smaller tree under the larger one
    size[ra] += size[rb];
    return true;
  };
  return { find, union, parent };
}

const s = makeSets(5);
s.union(1, 2);
s.union(3, 4);
console.log("1 and 4 connected?", s.find(1) === s.find(4));
s.union(2, 4);
console.log("after union(2, 4):", s.find(1) === s.find(4), "| parent array:", s.parent.join(" "));

// Kruskal: lightest edges first, skip any edge whose ends are already connected
const edges = [[0, 1, 1], [1, 2, 2], [0, 2, 3], [2, 3, 4], [1, 3, 5]];
const k = makeSets(4);
let total = 0;
for (const [u, v, w] of [...edges].sort((a, b) => a[2] - b[2])) {
  if (k.union(u, v)) {
    total += w;
    console.log(\`take \${u}-\${v} (\${w})\`);
  } else {
    console.log(\`skip \${u}-\${v} (\${w}): it would close a cycle\`);
  }
}
console.log("minimum spanning tree weight:", total);
`,
    explanation: {
      en: "After union(2, 4) the parent array is 0 1 1 1 1: the root 1 now represents {1, 2, 3, 4}, and the last find(4) re-pointed 4 straight at 1. The Kruskal part walks the edges from lightest to heaviest and skips 0-2 and 1-3 because their ends are already connected; the three edges it keeps weigh 7 in total.",
      ar: "بعد union(2, 4) تصبح مصفوفة الآباء 0 1 1 1 1: فالجذر 1 يمثّل الآن {1, 2, 3, 4}، وجعلت آخر find(4) العنصرَ 4 يشير مباشرة إلى 1. ويمرّ جزء Kruskal على الحواف من الأخف إلى الأثقل، ويتخطّى 0-2 و1-3 لأن طرفيهما متصلان أصلاً؛ والحواف الثلاث التي يحتفظ بها وزنها الإجمالي 7.",
    },
  },
  {
    type: "text",
    body: {
      en: `## Minimum spanning trees with Kruskal

A **spanning tree** of a connected, undirected graph keeps all V vertices connected using exactly **V - 1 edges** and no cycle. A **minimum spanning tree (MST)** is one with the smallest total weight: the cheapest cable network, the cheapest set of roads that links every village. MSTs are also used for clustering and as a building block of approximation algorithms.

**Kruskal's algorithm** (Joseph Kruskal, 1956) is greedy:

1. Sort the edges by weight, lightest first.
2. For each edge \`(u, v, w)\`: if \`find(u) != find(v)\`, **take** it and \`union(u, v)\`; otherwise **skip** it, because it would close a cycle.
3. Stop after V - 1 edges. If you run out of edges first, the graph is not connected and has no spanning tree.

\`\`\`
edges sorted:  0-1 (1)  1-2 (2)  0-2 (3)  2-3 (4)  1-3 (5)

0-1 (1)   different groups -> take    {0,1} {2} {3}
1-2 (2)   different groups -> take    {0,1,2} {3}
0-2 (3)   same group       -> skip    (0 and 2 are already connected)
2-3 (4)   different groups -> take    {0,1,2,3}: V - 1 = 3 edges, done
total weight 1 + 2 + 4 = 7
\`\`\`

**Why is greedy safe here?** The **cut property**: split the vertices into two sides in any way; the lightest edge crossing between the sides belongs to a minimum spanning tree (with equal weights, to at least one of them). When Kruskal takes an edge, every lighter edge has already been considered, so it is the lightest edge leaving the group of one of its ends. Negative weights are fine too: only the order of the weights matters.

**Cost:** sorting is O(E log E); the Union-Find work is nearly linear. **Prim's algorithm** is the alternative: grow one tree from a start vertex, always adding the cheapest edge that leaves it, with a heap, in O(E log V). Prim's idea is close to Dijkstra's, and Dijkstra's 1959 paper actually describes both problems.`,
      ar: `## الأشجار الممتدة الصغرى مع Kruskal

**الشجرة الممتدة (spanning tree)** لـ graph متصل غير موجّه تُبقي رؤوسه الـ V كلها متصلة باستخدام **V - 1 حافة** بالضبط وبلا دورة. و**الشجرة الممتدة الصغرى (MST)** هي التي لها أصغر وزن إجمالي: أرخص شبكة كابلات، وأرخص مجموعة طرق تصل كل القرى. وتُستخدم الأشجار الممتدة الصغرى أيضاً في التجميع (clustering) وكلبنة بناء في خوارزميات التقريب.

**خوارزمية Kruskal** (التي وضعها Joseph Kruskal عام 1956) جشعة:

1. افرز الحواف حسب الوزن، الأخف أولاً.
2. لكل حافة \`(u, v, w)\`: إن كان \`find(u) != find(v)\` **فخذها** ونفّذ \`union(u, v)\`؛ وإلا **فتخطَّها** لأنها ستغلق دورة.
3. توقف بعد V - 1 حافة. وإن نفدت الحواف قبل ذلك فالـ graph غير متصل ولا شجرة ممتدة له.

\`\`\`
edges sorted:  0-1 (1)  1-2 (2)  0-2 (3)  2-3 (4)  1-3 (5)

0-1 (1)   different groups -> take    {0,1} {2} {3}
1-2 (2)   different groups -> take    {0,1,2} {3}
0-2 (3)   same group       -> skip    (0 and 2 are already connected)
2-3 (4)   different groups -> take    {0,1,2,3}: V - 1 = 3 edges, done
total weight 1 + 2 + 4 = 7
\`\`\`

**لماذا يكون الجشع آمناً هنا؟** بسبب **خاصية القطع (cut property)**: قسّم الرؤوس إلى جانبين بأي طريقة؛ فأخف حافة تعبر بين الجانبين تنتمي إلى شجرة ممتدة صغرى (ومع تساوي الأوزان، إلى واحدة منها على الأقل). وحين تأخذ Kruskal حافة تكون كل حافة أخف منها قد دُرست، فهي أخف حافة تغادر مجموعة أحد طرفيها. والأوزان السالبة لا تضرّ أيضاً: فلا يهمّ إلا ترتيب الأوزان.

**التكلفة:** الفرز O(E log E)؛ وعمل Union-Find شبه خطي. و**خوارزمية Prim** هي البديل: نمِّ شجرة واحدة من رأس بداية، مضيفاً دائماً أرخص حافة تغادرها، باستخدام كومة، في O(E log V). وفكرة Prim قريبة من فكرة Dijkstra، بل إن ورقة Dijkstra عام 1959 تصف المسألتين كلتيهما.`,
    },
  },
  {
    type: "lab",
    id: "kruskal-mst",
    lang: "go",
    prompt: {
      en: `**The cheapest network.** An undirected graph has \`n\` vertices and \`m\` weighted edges. Print the total weight of a minimum spanning tree, or \`IMPOSSIBLE\` if the graph is not connected.

**Input:** the first line has \`n m\` (\`n\` is at least 1). Then \`m\` lines, each \`u v w\`: an edge between \`u\` and \`v\` with weight \`w\` (it can be negative). Edges can repeat, and \`u\` can equal \`v\`.

**Output:** the total weight of the minimum spanning tree (\`0\` for a single vertex), or \`IMPOSSIBLE\`.

**Example:** input
\`\`\`
4 5
0 1 1
1 2 2
0 2 3
2 3 4
1 3 5
\`\`\`
prints \`7\`, as traced in the lesson.

The starter already sorts the edges by weight. Write \`find\` (with path halving) and \`union\` (by size), then walk the sorted edges, add the weight of every edge that \`union\` accepts, and count them: a spanning tree needs exactly \`n - 1\`.`,
      ar: `**أرخص شبكة.** في graph غير موجّه \`n\` رأساً و\`m\` حافة ذات وزن. اطبع الوزن الإجمالي لشجرة ممتدة صغرى، أو \`IMPOSSIBLE\` إن لم يكن الـ graph متصلاً.

**المدخل:** السطر الأول فيه \`n m\` (و\`n\` لا يقل عن 1). ثم \`m\` سطراً، في كل منها \`u v w\`: حافة بين \`u\` و\`v\` وزنها \`w\` (وقد يكون سالباً). قد تتكرر الحواف، وقد تساوي \`u\` الرأس \`v\`.

**المخرج:** الوزن الإجمالي للشجرة الممتدة الصغرى (\`0\` لرأس واحد)، أو \`IMPOSSIBLE\`.

**مثال:** المدخل
\`\`\`
4 5
0 1 1
1 2 2
0 2 3
2 3 4
1 3 5
\`\`\`
يطبع \`7\`، كما تتبّعناه في الدرس.

شيفرة البداية تفرز الحواف حسب الوزن مسبقاً. اكتب \`find\` (مع تنصيف المسار) و\`union\` (حسب الحجم)، ثم امشِ على الحواف المفروزة، وأضف وزن كل حافة تقبلها \`union\`، وعُدّها: فالشجرة الممتدة تحتاج \`n - 1\` حافة بالضبط.`,
    },
    starterCode: `package main

import (
	"bufio"
	"fmt"
	"os"
	"sort"
)

type edge struct{ u, v, w int }

func main() {
	in := bufio.NewReader(os.Stdin)
	var n, m int
	fmt.Fscan(in, &n, &m)
	edges := make([]edge, m)
	for i := range edges {
		fmt.Fscan(in, &edges[i].u, &edges[i].v, &edges[i].w)
	}
	sort.Slice(edges, func(i, j int) bool { return edges[i].w < edges[j].w })

	// TODO: Kruskal with Union-Find.
	// 1. parent[i] = i and size[i] = 1 for every vertex.
	// 2. find(x): while parent[x] != x { parent[x] = parent[parent[x]]; x = parent[x] }; return x
	// 3. union(a, b): roots ra, rb; if equal return false; hang the smaller under the larger; return true
	// 4. For each edge in sorted order: if union(e.u, e.v) succeeds, add e.w and count the edge.
	// 5. Print the total if exactly n - 1 edges were taken, otherwise IMPOSSIBLE.
	fmt.Println("IMPOSSIBLE")
}
`,
    solution: `package main

import (
	"bufio"
	"fmt"
	"os"
	"sort"
)

type edge struct{ u, v, w int }

var parent, size []int

func find(x int) int {
	for parent[x] != x {
		parent[x] = parent[parent[x]] // path halving
		x = parent[x]
	}
	return x
}

func union(a, b int) bool {
	ra, rb := find(a), find(b)
	if ra == rb {
		return false // already connected: this edge would close a cycle
	}
	if size[ra] < size[rb] {
		ra, rb = rb, ra
	}
	parent[rb] = ra // the smaller tree goes under the larger one
	size[ra] += size[rb]
	return true
}

func main() {
	in := bufio.NewReader(os.Stdin)
	var n, m int
	fmt.Fscan(in, &n, &m)
	edges := make([]edge, m)
	for i := range edges {
		fmt.Fscan(in, &edges[i].u, &edges[i].v, &edges[i].w)
	}
	sort.Slice(edges, func(i, j int) bool { return edges[i].w < edges[j].w })

	parent = make([]int, n)
	size = make([]int, n)
	for i := range parent {
		parent[i] = i
		size[i] = 1
	}

	total, taken := 0, 0
	for _, e := range edges {
		if union(e.u, e.v) {
			total += e.w
			taken++
		}
	}
	if taken == n-1 {
		fmt.Println(total)
	} else {
		fmt.Println("IMPOSSIBLE")
	}
}
`,
    hints: [
      { en: "Declare var parent, size []int at package level so find and union can use them. In main, make both of length n with parent[i] = i and size[i] = 1.", ar: "صرّح بـ var parent, size []int على مستوى الحزمة لتستخدمهما find وunion. وفي main أنشئهما بطول n مع parent[i] = i وsize[i] = 1." },
      { en: "union(a, b) returns false when find(a) == find(b): that edge would close a cycle. Otherwise attach the root of the smaller tree to the other root, add the sizes and return true.", ar: "تعيد union(a, b) القيمة false حين يكون find(a) == find(b): فتلك الحافة ستغلق دورة. وإلا فاربط جذر الشجرة الأصغر بالجذر الآخر، واجمع الحجمين، وأعد true." },
      { en: "Loop over the sorted edges; when union(e.u, e.v) is true, total += e.w and taken++. At the end print total if taken == n-1, else IMPOSSIBLE (n = 1 needs 0 edges).", ar: "امشِ على الحواف المفروزة؛ وحين تكون union(e.u, e.v) صحيحة نفّذ total += e.w و taken++. وفي النهاية اطبع total إن كان taken == n-1، وإلا IMPOSSIBLE (والرأس الواحد يحتاج 0 حواف)." },
    ],
    tests: [
      { name: { en: "The example", ar: "المثال" }, stdin: "4 5\n0 1 1\n1 2 2\n0 2 3\n2 3 4\n1 3 5\n", expected: "7" },
      { name: { en: "A disconnected graph", ar: "graph غير متصل" }, stdin: "4 2\n0 1 3\n2 3 4\n", expected: "IMPOSSIBLE" },
      { name: { en: "Repeated edges and a self-loop", ar: "حواف مكررة وحلقة ذاتية" }, stdin: "3 4\n0 0 1\n0 1 10\n0 1 2\n1 2 5\n", expected: "7" },
      { name: { en: "Negative weights", ar: "أوزان سالبة" }, stdin: "3 3\n0 1 -2\n1 2 -3\n0 2 1\n", expected: "-5" },
      { name: { en: "A single vertex", ar: "رأس واحد" }, stdin: "1 0\n", expected: "0" },
      { name: { en: "500 vertices and 2,200 edges", ar: "500 رأس و2,200 حافة" }, stdin: mstInput, expected: mstExpected },
    ],
    sampleInput: "4 5\n0 1 1\n1 2 2\n0 2 3\n2 3 4\n1 3 5\n",
  },
  {
    type: "quiz",
    questions: [
      {
        q: {
          en: "Why does BFS not find the cheapest route in a weighted graph?",
          ar: "لماذا لا يجد BFS أرخص مسار في graph ذي أوزان؟",
        },
        choices: [
          { en: "BFS minimises the number of edges, not the sum of their weights", ar: "لأن BFS يقلّل عدد الحواف لا مجموع أوزانها" },
          { en: "BFS cannot follow directed edges", ar: "لأن BFS لا يستطيع اتباع الحواف الموجّهة" },
          { en: "BFS needs the adjacency lists to be sorted", ar: "لأن BFS يحتاج إلى قوائم جوار مرتّبة" },
          { en: "BFS only works on trees", ar: "لأن BFS لا يعمل إلا على الأشجار" },
        ],
        answer: 0,
        explain: {
          en: "BFS reaches vertices in order of how many edges away they are, which equals the cost only when every edge costs the same. A direct road of weight 100 beats three roads of weight 1 in BFS's eyes. BFS handles directed graphs, unsorted lists and general graphs without trouble.",
          ar: "يبلغ BFS الرؤوس بترتيب عدد الحواف التي تفصلها، وهذا يساوي التكلفة فقط حين تكلّف كل حافة الشيء نفسه. فالطريق المباشر بوزن 100 يتفوّق في نظر BFS على ثلاثة طرق وزن كل منها 1. وBFS يتعامل مع الـ graphs الموجّهة والقوائم غير المرتّبة والـ graphs العامة بلا مشكلة.",
        },
      },
      {
        q: {
          en: "Which condition must hold for Dijkstra's algorithm to be correct?",
          ar: "أي شرط يجب أن يتحقق لتكون خوارزمية Dijkstra صحيحة؟",
        },
        choices: [
          { en: "The graph must be undirected", ar: "أن يكون الـ graph غير موجّه" },
          { en: "The graph must have no cycles", ar: "ألا يكون في الـ graph دورات" },
          { en: "No edge may have a negative weight", ar: "ألا يكون لأي حافة وزن سالب" },
          { en: "All weights must be different", ar: "أن تكون كل الأوزان مختلفة" },
        ],
        answer: 2,
        explain: {
          en: "Dijkstra declares the closest unfinished vertex final, which is only safe if no later edge can make a route shorter, that is, if no weight is negative. Directed graphs, cycles and equal weights are all fine.",
          ar: "تعلن Dijkstra أقرب رأس غير منتهٍ نهائياً، وهذا آمن فقط إن لم تستطع حافة لاحقة أن تجعل مساراً أقصر، أي إن لم يكن أي وزن سالباً. أما الـ graphs الموجّهة والدورات والأوزان المتساوية فكلها لا تضرّ.",
        },
      },
      {
        q: {
          en: "Bellman-Ford has run its V - 1 rounds. In one more pass, an edge still lowers a distance. What does that tell you?",
          ar: "أنهت Bellman-Ford جولاتها الـ V - 1. وفي مرور إضافي ما زالت حافة تخفض مسافة ما. ماذا يخبرك ذلك؟",
        },
        choices: [
          { en: "Some vertex cannot be reached from the source", ar: "أن رأساً ما لا يمكن بلوغه من المصدر" },
          { en: "A negative cycle is reachable from the source, so shortest distances are not defined", ar: "أن هناك دورة سالبة يمكن بلوغها من المصدر، فأقصر المسافات غير معرّفة" },
          { en: "The graph is not connected", ar: "أن الـ graph غير متصل" },
          { en: "More rounds are needed: run 2V rounds instead", ar: "أن هناك حاجة إلى جولات أكثر: نفّذ 2V جولة بدلاً من ذلك" },
        ],
        answer: 1,
        explain: {
          en: "Without a reachable negative cycle every shortest path has at most V - 1 edges, so V - 1 rounds are always enough and nothing can improve afterwards. An improvement in round V means some route keeps getting cheaper by looping. Unreachable vertices stay at infinity and never improve, and more rounds would never settle a negative cycle.",
          ar: "بدون دورة سالبة يمكن بلوغها يكون في كل أقصر مسار V - 1 حافة على الأكثر، فتكفي V - 1 جولة دائماً ولا يمكن أن يتحسّن شيء بعدها. والتحسّن في الجولة V يعني أن مساراً ما يزداد رخصاً بالدوران. أما الرؤوس التي لا يمكن بلوغها فتبقى عند ما لا نهاية ولا تتحسّن أبداً، والجولات الإضافية لن تُنهي دورة سالبة أبداً.",
        },
      },
      {
        q: {
          en: "Union-Find uses union by size and path compression. What does an operation cost?",
          ar: "تستخدم Union-Find الدمج حسب الحجم وضغط المسار. كم تكلّف العملية الواحدة؟",
        },
        choices: [
          { en: "O(n) for every find, because it walks to the root", ar: "O(n) لكل find، لأنها تمشي حتى الجذر" },
          { en: "O(V + E), like a BFS for each question", ar: "O(V + E)، مثل BFS لكل سؤال" },
          { en: "O(n log n), because the trees are sorted", ar: "O(n log n)، لأن الأشجار مرتّبة" },
          { en: "O(α(n)) amortised, where α (inverse Ackermann) is at most 4 for any practical n", ar: "O(α(n)) مُهلَكة، حيث α (دالة Ackermann العكسية) لا تتجاوز 4 لأي n عملي" },
        ],
        answer: 3,
        explain: {
          en: "Union by size keeps every tree's height at O(log n), and path compression flattens the paths that find walks, so over a sequence of operations the average cost per operation is O(α(n)), as Tarjan proved. A BFS per question is what Union-Find avoids, and the trees are not sorted at all.",
          ar: "الدمج حسب الحجم يُبقي ارتفاع كل شجرة O(log n)، وضغط المسار يسطّح المسارات التي تمشي عليها find، فيكون متوسط تكلفة العملية على امتداد سلسلة من العمليات O(α(n)) كما أثبت Tarjan. وتشغيل BFS لكل سؤال هو بالضبط ما تتجنّبه Union-Find، والأشجار ليست مرتّبة أصلاً.",
        },
      },
      {
        q: {
          en: "Kruskal's algorithm reaches an edge whose two ends are already in the same group. What does it do?",
          ar: "تصل خوارزمية Kruskal إلى حافة طرفاها في المجموعة نفسها أصلاً. ماذا تفعل؟",
        },
        choices: [
          { en: "Skips it, because adding it would close a cycle", ar: "تتخطّاها، لأن إضافتها ستغلق دورة" },
          { en: "Takes it, because it is the lightest edge left", ar: "تأخذها، لأنها أخف حافة متبقية" },
          { en: "Stops, because the tree is complete", ar: "تتوقف، لأن الشجرة اكتملت" },
          { en: "Replaces the heaviest edge taken so far with it", ar: "تستبدل بها أثقل حافة أُخذت حتى الآن" },
        ],
        answer: 0,
        explain: {
          en: "Its ends are already connected by lighter edges, so the edge adds nothing but a cycle. Being the lightest remaining edge does not matter, the tree is complete only after V - 1 edges, and Kruskal never swaps edges: the cut property guarantees that every edge it took belongs to a minimum spanning tree.",
          ar: "طرفاها متصلان أصلاً بحواف أخف، فلا تضيف الحافة شيئاً سوى دورة. وكونها أخف حافة متبقية لا يهمّ، والشجرة لا تكتمل إلا بعد V - 1 حافة، وKruskal لا تستبدل الحواف أبداً: فخاصية القطع تضمن أن كل حافة أخذتها تنتمي إلى شجرة ممتدة صغرى.",
        },
      },
    ],
  },
  {
    type: "text",
    body: {
      en: `## Summary

- In a **weighted** graph the shortest route minimises the **sum of weights**, not the number of edges. Every algorithm improves \`dist[v]\` by **relaxing** edges; they differ in the order.
- **Dijkstra** (weights 0 or more) settles the closest unfinished vertex with a min-heap, skips outdated entries, and runs in **O((V + E) log V)**. Keep \`parent\` to rebuild the route.
- **Negative edges** break Dijkstra's promise that a popped vertex is final. **Bellman-Ford** relaxes every edge V - 1 times in **O(V x E)**, and an improvement in one extra pass reveals a reachable **negative cycle**.
- **Union-Find** answers "same group?" and merges groups in **O(α(n))** amortised with union by size and path compression.
- **Kruskal** sorts the edges and takes every edge that joins two different groups; the result is a **minimum spanning tree** with V - 1 edges, or proof that the graph is disconnected.

**Practice next:** compute how long a signal takes to reach every node of a network (Dijkstra), find the cheapest flight with at most k stops (a Bellman-Ford variant), count groups of friends and find the one redundant cable with Union-Find, and implement Prim's algorithm with a heap. Next on the roadmap is **Greedy & Backtracking**: Dijkstra and Kruskal were greedy algorithms whose choices you proved safe.`,
      ar: `## الخلاصة

- في الـ graph **ذي الأوزان** يقلّل أقصر مسار **مجموع الأوزان** لا عدد الحواف. وكل خوارزمية تحسّن \`dist[v]\` **بإرخاء** الحواف؛ والفرق بينها في الترتيب.
- **Dijkstra** (الأوزان 0 أو أكثر) تُثبّت أقرب رأس غير منتهٍ بكومة صغرى، وتتجاهل المدخلات القديمة، وتعمل في **O((V + E) log V)**. واحتفظ بـ \`parent\` لتعيد بناء المسار.
- **الحواف السالبة** تكسر وعد Dijkstra بأن الرأس المسحوب نهائي. و**Bellman-Ford** ترخي كل حافة V - 1 مرة في **O(V × E)**، والتحسّن في مرور إضافي واحد يكشف **دورة سالبة** يمكن بلوغها.
- **Union-Find** تجيب عن "هل هما في المجموعة نفسها؟" وتدمج المجموعات في **O(α(n))** مُهلَكة بالدمج حسب الحجم وضغط المسار.
- **Kruskal** تفرز الحواف وتأخذ كل حافة تصل بين مجموعتين مختلفتين؛ والنتيجة **شجرة ممتدة صغرى** من V - 1 حافة، أو دليل على أن الـ graph غير متصل.

**تدرّب بعد ذلك:** احسب كم تستغرق إشارة لتبلغ كل عقدة في شبكة (Dijkstra)، وأوجد أرخص رحلة جوية بـ k توقف على الأكثر (صيغة من Bellman-Ford)، وعُدّ مجموعات الأصدقاء وأوجد الكابل الزائد الوحيد باستخدام Union-Find، ونفّذ خوارزمية Prim بكومة. والتالي في خريطة المسار هو **الخوارزميات الجشعة والتراجع (Greedy & Backtracking)**: فـ Dijkstra وKruskal خوارزميتان جشعتان أثبتّ أن اختياراتهما آمنة.`,
    },
  },
];

export const lesson: Lesson = {
  nodeId: "graphs-shortest-paths",
  title: { en: "Shortest Paths & Union-Find: Weighted Roads and Cheap Networks", ar: "أقصر المسارات وUnion-Find: طرق ذات أوزان وشبكات رخيصة" },
  estMinutes: estimateMinutes(sections),
  sections,
};
