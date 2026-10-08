import type { L10nText } from "../../../../../shared/challenges";

/**
 * SERVER-ONLY hint texts for the algorithms (tracks: data-structures-algorithms, databases, data-science, artificial-intelligence) group, keyed by challenge id.
 * Matching public meta: data/challenges/algorithms.ts, which carries only the per-hint COST
 * (same order, same count; worker/tests/challenges/parity.test.ts enforces it). The text is
 * returned by POST /api/challenges/:id/hint after the cost is charged and must never be
 * imported by the site or copied into shared/ or data/.
 */
export const algorithmsHints: Record<string, L10nText[]> = {
  "dsa-pair-sum-count": [
    {
      en: "Trying every pair works on small inputs but needs about n²/2 steps, too slow for the biggest tests.",
      ar: "تجربة كل زوج تنجح مع المدخلات الصغيرة، لكنها تحتاج نحو n²/2 خطوة وهذا بطيء جدًا في أكبر الاختبارات.",
    },
    {
      en: "For a card worth v you need partners worth T − v. A dictionary from value to how many times you have seen it answers 'how many partners?' in one step.",
      ar: "للبطاقة التي قيمتها v تحتاج شركاء قيمتهم T − v. قاموس يربط القيمة بعدد مرات ظهورها يجيب عن سؤال «كم شريكًا؟» في خطوة واحدة.",
    },
    {
      en: "Walk left to right. Before recording the current card, add count[T − v] to the answer, then increase count[v]. That also stops a card from pairing with itself.",
      ar: "امشِ من اليسار إلى اليمين. قبل تسجيل البطاقة الحالية أضف count[T − v] إلى الجواب، ثم زد count[v]. وبهذا لا تُقرَن البطاقة بنفسها.",
    },
  ],
  "dsa-bracket-balance": [
    {
      en: "Counting how many ( and ) you have seen is not enough: '([)]' has equal counts but is wrong. The order and the types both matter.",
      ar: "لا يكفي عدّ الأقواس ( و ): النص '([)]' عدداهما متساويان لكنه خاطئ. الترتيب والنوع كلاهما مهم.",
    },
    {
      en: "The most recently opened bracket must be the first one closed. Which data structure gives you 'last in, first out'?",
      ar: "آخر قوس فُتح يجب أن يكون أول قوس يُغلق. أي بنية بيانات تعطيك «آخر ما دخل أول ما خرج»؟",
    },
    {
      en: "Push every opening bracket. On a closing bracket the stack must be non-empty and its top must be the matching opener, otherwise the answer is False. At the end the stack must be empty.",
      ar: "ضع كل قوس فتح في المكدس. عند قوس إغلاق يجب أن يكون المكدس غير فارغ وأن تكون قمته هي قوس الفتح المطابق، وإلا فالجواب False. وفي النهاية يجب أن يكون المكدس فارغًا.",
    },
  ],
  "dsa-grid-shortest-path": [
    {
      en: "Depth-first search finds *a* path, not the shortest one, and trying every path explodes on an open 200 × 200 floor. Think in layers: every cell 1 move away, then every cell 2 moves away…",
      ar: "البحث بالعمق يجد مسارًا ما وليس الأقصر، وتجربة كل المسارات تنفجر على أرضية مفتوحة بحجم 200 × 200. فكّر في طبقات: كل الخلايا على بعد حركة واحدة، ثم على بعد حركتين…",
    },
    {
      en: "Breadth-first search with a FIFO queue visits cells in order of distance, so the first time you pop E its distance is the answer. Store the distance of every cell you reach.",
      ar: "البحث بالعرض (BFS) مع طابور FIFO يزور الخلايا بترتيب المسافة، فأول مرة تسحب فيها E تكون مسافتها هي الجواب. خزّن مسافة كل خلية تصل إليها.",
    },
    {
      en: "Mark a cell as seen when you push it into the queue, not when you pop it, so every cell enters the queue once. Then the whole search costs O(R·C). If the queue empties before E appears, print -1.",
      ar: "علّم الخلية «مرئية» عند إدخالها في الطابور لا عند سحبها، فتدخل كل خلية مرة واحدة فقط وتصبح كلفة البحث كله O(R·C). وإذا فرغ الطابور قبل ظهور E فاطبع -1.",
    },
  ],
  "db-low-stock-report": [
    {
      en: "Filter rows with WHERE and join the conditions with AND. `genre IN ('Fiction', 'Science')` is shorter than two OR comparisons.",
      ar: "صفِّ الصفوف بـ WHERE واربط الشروط بـ AND. العبارة `genre IN ('Fiction', 'Science')` أقصر من مقارنتين مربوطتين بـ OR.",
    },
    {
      en: "A comparison with NULL is never true, so think about what `stock < 5` does to books with an unknown stock. ORDER BY accepts several keys, each with its own ASC or DESC.",
      ar: "أي مقارنة مع NULL لا تكون صحيحة أبدًا، فتأمل ماذا يفعل الشرط `stock < 5` بالكتب ذات المخزون المجهول. ويقبل ORDER BY عدة مفاتيح، لكل منها ASC أو DESC خاص به.",
    },
    {
      en: "Clause order is WHERE, then ORDER BY stock ASC, published_year DESC, title ASC, and LIMIT 5 comes last.",
      ar: "ترتيب الجمل هو WHERE ثم ORDER BY stock ASC, published_year DESC, title ASC، وتأتي LIMIT 5 في النهاية.",
    },
  ],
  "db-loyal-customers": [
    {
      en: "You need all three tables: customers → orders → order_items. Decide what belongs in WHERE (rows removed before grouping) and what in HAVING (groups removed after).",
      ar: "تحتاج الجداول الثلاثة: customers ثم orders ثم order_items. حدّد ما مكانه WHERE (صفوف تُحذف قبل التجميع) وما مكانه HAVING (مجموعات تُحذف بعد التجميع).",
    },
    {
      en: "Joining the items repeats an order once per item row, so COUNT(*) counts items, not orders. Count distinct order ids instead.",
      ar: "ربط البنود يكرر الطلب مرة لكل صف بند، لذا COUNT(*) تعدّ البنود لا الطلبات. عُدّ معرّفات الطلبات المميزة بدلًا من ذلك.",
    },
    {
      en: "An INNER JOIN to order_items silently drops delivered orders that have no items. Use a LEFT JOIN there and COALESCE(SUM(...), 0) so those orders still count.",
      ar: "الربط الداخلي INNER JOIN مع order_items يُسقط بصمت الطلبات المسلَّمة التي لا بنود لها. استخدم LEFT JOIN هناك مع COALESCE(SUM(...), 0) كي تبقى محتسبة.",
    },
  ],
  "ds-descriptive-stats": [
    {
      en: "The readings arrive unsorted. Sort a copy first: the median is its middle element, or the average of the two middle ones when n is even.",
      ar: "القراءات تصل غير مرتبة. رتّب نسخة منها أولًا: الوسيط هو عنصرها الأوسط، أو متوسط العنصرين الأوسطين عندما يكون n زوجيًا.",
    },
    {
      en: "Count how often each value appears with a dictionary (or Counter), then pick the highest count; break ties by taking the smallest value.",
      ar: "عُدّ مرات ظهور كل قيمة بقاموس (أو Counter)، ثم اختر أعلى تكرار، وعند التعادل خذ أصغر قيمة.",
    },
    {
      en: "Standard deviation: take the mean first, then the average of (x − mean)² over all n values, then the square root. Dividing by n − 1 gives the sample version, which is not asked here.",
      ar: "الانحراف المعياري: احسب المتوسط أولًا، ثم متوسط (x − mean)² على جميع القيم الـ n، ثم الجذر التربيعي. القسمة على n − 1 تعطي نسخة العينة وهي غير مطلوبة هنا.",
    },
  ],
  "ds-classifier-report": [
    {
      en: "Do one pass over the pairs and keep three dictionaries keyed by label: true positives, how often the label was predicted, and how often it was actual.",
      ar: "اقرأ الأزواج في مرور واحد واحتفظ بثلاثة قواميس مفتاحها التسمية: الإيجابيات الصحيحة، وعدد مرات التنبؤ بالتسمية، وعدد مرات كونها فعلية.",
    },
    {
      en: "Write a small helper that divides and returns 0 when the denominator is 0, and use it for precision, recall and F1. A class that is never predicted must not crash your program.",
      ar: "اكتب دالة مساعدة صغيرة تقسم وتعيد 0 عندما يكون المقام 0، واستخدمها للدقة والاسترجاع و F1. الصنف الذي لا يُتنبأ به أبدًا يجب ألا يُسقط برنامجك.",
    },
    {
      en: "The class list is the union of both columns, sorted: a class may appear only among the predictions. Macro F1 averages the per-class F1 over all of them; accuracy is the sum of TP divided by n.",
      ar: "قائمة الأصناف هي اتحاد العمودين مرتبًا: قد يظهر صنف بين التنبؤات فقط. يحسب macro F1 متوسط F1 لكل الأصناف، والصحة هي مجموع TP مقسومًا على n.",
    },
  ],
  "ai-kmeans-step": [
    {
      en: "Split the work in two phases. First decide every point's cluster using the OLD centroids only; then compute the new centroids. Comparing squared distances is enough, no square root needed.",
      ar: "قسّم العمل إلى مرحلتين. حدّد أولًا عنقود كل نقطة باستخدام المراكز القديمة فقط، ثم احسب المراكز الجديدة. تكفي مقارنة المسافات المربعة دون جذر تربيعي.",
    },
    {
      en: "Scan the centroids in index order and replace the best one only when the new distance is STRICTLY smaller; that gives the lowest index on ties. Keep a sum vector and a count per cluster, and only divide when the count is above 0.",
      ar: "امسح المراكز بترتيب فهارسها ولا تستبدل الأفضل إلا إذا كانت المسافة الجديدة أصغر **تمامًا**؛ فيفوز الفهرس الأدنى عند التعادل. احتفظ لكل عنقود بمتجه مجاميع وعدّاد، ولا تقسم إلا عندما يكون العدّاد أكبر من 0.",
    },
    {
      en: "The inertia uses the distances to the centroids the points were assigned to (the old ones). Add each point's best squared distance to a running total while assigning, before any centroid moves.",
      ar: "يستخدم القصور الذاتي المسافات إلى المراكز التي أُسندت إليها النقاط (القديمة). أضف أفضل مسافة مربعة لكل نقطة إلى مجموع جارٍ أثناء الإسناد، قبل أن يتحرك أي مركز.",
    },
  ],
};
