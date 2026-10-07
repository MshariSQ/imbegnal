import type { RoadmapNodeInfo } from "./cyber-security";

export const dataStructuresAlgorithmsNodes: RoadmapNodeInfo[] = [
  {
    id: "complexity-big-o",
    label: "Complexity & Big-O",
    description: "How to measure an algorithm by how its work grows with the input, not by seconds on your laptop. Big-O notation, the common growth classes (constant, logarithmic, linear, n log n, quadratic, exponential) and how to read them off a loop.",
    status: "required",
    resources: {
      book: { title: "Algorithms, 4th Edition", url: "https://algs4.cs.princeton.edu/home/", provider: "Sedgewick & Wayne", tags: ["Free Companion Site", "Recommended"] },
      course: { title: "Introduction to Algorithms (6.006)", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", provider: "MIT OpenCourseWare", tags: ["Free", "University"] },
      docs: { title: "Python Time Complexity of Built-in Operations", url: "https://wiki.python.org/moin/TimeComplexity", provider: "Python Wiki", tags: ["Free", "Reference"] },
    },
  },
  {
    id: "arrays-hashing",
    label: "Arrays, Strings & Hash Maps",
    description: "The two workhorse structures of everyday programming: contiguous arrays (and strings) and hash maps/sets for constant-time lookup. Learn the counting, two-pointer and prefix-sum patterns that turn many O(n²) brute-force ideas into O(n).",
    status: "required",
    resources: {
      book: { title: "Open Data Structures", url: "https://opendatastructures.org/", provider: "Pat Morin", tags: ["Free", "Open Textbook"] },
      course: { title: "CS50x: Introduction to Computer Science", url: "https://cs50.harvard.edu/x/", provider: "Harvard", tags: ["Free", "Recommended"] },
      docs: { title: "Python Data Structures Tutorial", url: "https://docs.python.org/3/tutorial/datastructures.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "stacks-queues",
    label: "Linked Lists, Stacks & Queues",
    description: "Linked lists and the two classic access disciplines: stack (last in, first out) and queue (first in, first out). They power undo history, expression parsing, bracket matching, call stacks and breadth-first search.",
    status: "required",
    resources: {
      book: { title: "Open Data Structures", url: "https://opendatastructures.org/", provider: "Pat Morin", tags: ["Free", "Open Textbook"] },
      docs: { title: "collections.deque", url: "https://docs.python.org/3/library/collections.html#collections.deque", tags: ["Free", "Official"] },
    },
  },
  {
    id: "sorting-searching",
    label: "Sorting & Binary Search",
    description: "Why sorted data is powerful. Comparison sorts (insertion, merge, quick), what O(n log n) really means, when to use the built-in sort, and binary search, including searching for the first position where a condition becomes true and searching on the answer itself.",
    status: "required",
    resources: {
      course: { title: "Introduction to Algorithms (6.006)", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", provider: "MIT OpenCourseWare", tags: ["Free", "University"] },
      book: { title: "Algorithms, 4th Edition", url: "https://algs4.cs.princeton.edu/home/", provider: "Sedgewick & Wayne", tags: ["Free Companion Site", "Recommended"] },
      docs: { title: "bisect: Array bisection algorithm", url: "https://docs.python.org/3/library/bisect.html", tags: ["Free", "Official"] },
    },
  },
  {
    id: "trees-graphs",
    label: "Trees & Graphs (BFS/DFS)",
    description: "Trees (binary trees, binary search trees) and graphs as models of hierarchies, maps and networks. Representations (adjacency list vs matrix), depth-first and breadth-first traversal, grids as graphs, connected components and shortest paths in unweighted graphs.",
    status: "required",
    resources: {
      book: { title: "Algorithms (Jeff Erickson)", url: "https://jeffe.cs.illinois.edu/teaching/algorithms/", provider: "Jeff Erickson", tags: ["Free", "Open Textbook"] },
      docs: { title: "VisuAlgo: Visualising Data Structures and Algorithms", url: "https://visualgo.net/", provider: "VisuAlgo", tags: ["Free", "Interactive"] },
    },
  },
  {
    id: "recursion-dp",
    label: "Recursion & Dynamic Programming",
    description: "Solve a big problem by solving smaller copies of itself. Base cases and the call stack, why naive recursion can explode exponentially, then memoization and bottom-up tables (Fibonacci, coin change, longest common subsequence, knapsack).",
    status: "required",
    resources: {
      book: { title: "Algorithms (Jeff Erickson)", url: "https://jeffe.cs.illinois.edu/teaching/algorithms/", provider: "Jeff Erickson", tags: ["Free", "Open Textbook"] },
      docs: { title: "functools.lru_cache", url: "https://docs.python.org/3/library/functools.html#functools.lru_cache", tags: ["Free", "Official"] },
    },
  },
  {
    id: "heaps-priority-queues",
    label: "Heaps & Priority Queues",
    description: "A priority queue always hands you the smallest (or largest) item next, and a binary heap does it in O(log n). Learn heap order, push/pop, heapify, top-k problems and merging sorted streams.",
    status: "important",
    resources: {
      docs: { title: "heapq: Heap queue algorithm", url: "https://docs.python.org/3/library/heapq.html", tags: ["Free", "Official"] },
      book: { title: "Algorithms, 4th Edition", url: "https://algs4.cs.princeton.edu/home/", provider: "Sedgewick & Wayne", tags: ["Free Companion Site", "Recommended"] },
    },
  },
  {
    id: "graphs-shortest-paths",
    label: "Shortest Paths & Union-Find",
    description: "Weighted graphs: Dijkstra's algorithm with a heap, why negative edges break it, and when Bellman-Ford is needed. Plus the Union-Find (disjoint set) structure for connectivity and minimum spanning trees with Kruskal.",
    status: "important",
    resources: {
      docs: { title: "CP-Algorithms", url: "https://cp-algorithms.com/", tags: ["Free", "Reference"] },
      book: { title: "Algorithms (Jeff Erickson)", url: "https://jeffe.cs.illinois.edu/teaching/algorithms/", provider: "Jeff Erickson", tags: ["Free", "Open Textbook"] },
    },
  },
  {
    id: "greedy-backtracking",
    label: "Greedy & Backtracking",
    description: "Two strategies for hard-looking choices. Greedy makes the locally best pick and needs a proof that it is safe (interval scheduling); backtracking explores choices systematically and undoes them (subsets, permutations, N-Queens), pruning dead ends early.",
    status: "important",
    resources: {
      book: { title: "Algorithms (Jeff Erickson)", url: "https://jeffe.cs.illinois.edu/teaching/algorithms/", provider: "Jeff Erickson", tags: ["Free", "Open Textbook"] },
      docs: { title: "CP-Algorithms", url: "https://cp-algorithms.com/", tags: ["Free", "Reference"] },
    },
  },
  {
    id: "tries-advanced",
    label: "Tries, Segment Trees & Advanced Topics",
    description: "Specialised structures for specialised questions: tries for prefix search and autocomplete, segment trees and Fenwick trees for range queries with updates, and a tour of topics worth exploring next (string matching, topological sort, bit tricks).",
    status: "optional",
    resources: {
      docs: { title: "CP-Algorithms", url: "https://cp-algorithms.com/", tags: ["Free", "Reference"] },
    },
  },
];
