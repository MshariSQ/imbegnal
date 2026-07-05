import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "caching-queues",
  title: { en: "Caching & Queues — Fast and Resilient", ar: "التخزين المؤقت والطوابير — سريع ومرن" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- **Caching** — remembering answers so you don't redo slow work
- **Queues** — handling heavy jobs later, without making users wait
- When to use each
- You'll build a tiny cache yourself`,
        ar: `## ماذا ستتعلم

- **التخزين المؤقت (Caching)** — تذكّر الإجابات كي لا تكرّر العمل البطيء
- **الطوابير (Queues)** — معالجة المهام الثقيلة لاحقاً دون إبقاء المستخدم منتظراً
- متى تستخدم كلاً منهما
- ستبني ذاكرة تخزين مؤقت صغيرة بنفسك`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Sticky notes and the to-do tray 📝

**Caching = a sticky note on your monitor.** If someone asks you the WiFi password ten times a day, you don't walk to the router each time — you write it on a sticky note and read that. A cache stores the answer to a slow operation (a heavy database query, an external API call) so the next identical request is answered instantly from fast memory.

\`\`\`
Request → is it in the cache?
   ├── YES → return it instantly (a "cache hit")
   └── NO  → do the slow work, store the result, return it (a "cache miss")
\`\`\`

Tools like **Redis** are super-fast in-memory caches used everywhere. The catch: cached data can go **stale** — "how long do I trust the sticky note?" is the hard part of caching.

**Queues = a to-do tray.** Some jobs are slow: resizing a video, sending 10,000 emails, generating a report. You don't make the user stare at a spinner for two minutes. Instead you drop the job in a **queue** (the tray) and immediately tell the user "we're on it!". A separate **worker** picks jobs off the tray and processes them in the background.

\`\`\`
User uploads video → put "resize this" in the queue → respond "processing!" instantly
Background worker → takes the job → resizes → notifies when done
\`\`\`

Tools like **RabbitMQ** and **Redis** power queues. The payoff: your app stays snappy, survives traffic spikes (the tray just gets longer), and retries failed jobs automatically.`,
        ar: `## الملاحظات اللاصقة وصندوق المهام 📝

**التخزين المؤقت = ملاحظة لاصقة على شاشتك.** إن سألك أحدهم كلمة WiFi عشر مرات يومياً، لا تمشي إلى الراوتر كل مرة — بل تكتبها على ملاحظة لاصقة وتقرؤها. الذاكرة المؤقتة تخزّن إجابة عملية بطيئة (استعلام ثقيل، استدعاء API خارجي) ليُجاب الطلب المطابق التالي فوراً من ذاكرة سريعة.

\`\`\`
طلب → هل هو في الذاكرة المؤقتة؟
   ├── نعم → أعِده فوراً ("إصابة cache hit")
   └── لا  → نفّذ العمل البطيء، خزّن النتيجة، أعِدها ("إخفاق cache miss")
\`\`\`

أدوات مثل **Redis** ذواكر مؤقتة فائقة السرعة تُستخدم في كل مكان. المشكلة: البيانات المخزّنة قد تصبح **بائتة (stale)** — "كم أثق بالملاحظة اللاصقة؟" هو الجزء الصعب في التخزين المؤقت.

**الطوابير = صندوق مهام.** بعض المهام بطيئة: تصغير فيديو، إرسال 10,000 بريد، توليد تقرير. لا تجعل المستخدم يحدّق في مؤشر تحميل دقيقتين. بدلاً من ذلك تضع المهمة في **طابور** (الصندوق) وتخبر المستخدم فوراً "نعمل عليها!". ثم يلتقط **عامل (worker)** منفصل المهام من الصندوق ويعالجها في الخلفية.

\`\`\`
المستخدم يرفع فيديو → ضع "صغّر هذا" في الطابور → رُدّ "قيد المعالجة!" فوراً
العامل في الخلفية → يأخذ المهمة → يصغّرها → يُبلّغ عند الانتهاء
\`\`\`

أدوات مثل **RabbitMQ** و**Redis** تشغّل الطوابير. المكسب: يبقى تطبيقك سريعاً، ينجو من موجات الضغط (الصندوق يطول فقط)، ويعيد المحاولة تلقائياً للمهام الفاشلة.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Build a simple cache. Complete \`makeCachedSquare()\` which returns a function that computes \`n * n\` — but **remembers** past results in a cache object so repeated inputs are returned from cache.

The starter tracks how many real computations happen. Make \`square(4)\` compute once, then return from cache on the second call.`,
        ar: `ابنِ ذاكرة مؤقتة بسيطة. أكمل \`makeCachedSquare()\` التي تعيد دالة تحسب \`n * n\` — لكنها **تتذكّر** النتائج السابقة في كائن cache فتُعيد المدخلات المكرّرة من الذاكرة.

الكود المبدئي يعدّ كم عملية حساب حقيقية تحدث. اجعل \`square(4)\` يحسب مرة، ثم يعيد من الذاكرة في الاستدعاء الثاني.`,
      },
      starterCode: `function makeCachedSquare() {
  const cache = {};
  let computations = 0;

  function square(n) {
    // if n is in cache, return cache[n]
    // otherwise: computations++, compute n*n, store it, return it
  }

  square.getComputations = () => computations;
  return square;
}

const square = makeCachedSquare();
console.log(square(4)); // 16 (computed)
console.log(square(4)); // 16 (from cache)
console.log(square.getComputations()); // 1`,
      solution: `function makeCachedSquare() {
  const cache = {};
  let computations = 0;

  function square(n) {
    if (n in cache) return cache[n];
    computations++;
    cache[n] = n * n;
    return cache[n];
  }

  square.getComputations = () => computations;
  return square;
}

const square = makeCachedSquare();
console.log(square(4)); // 16
console.log(square(4)); // 16
console.log(square.getComputations()); // 1`,
      hints: [
        { en: `First line: if (n in cache) return cache[n];`, ar: `أول سطر: if (n in cache) return cache[n];` },
        { en: `Otherwise: computations++; cache[n] = n * n; return cache[n];`, ar: `وإلا: computations++; cache[n] = n * n; return cache[n];` },
      ],
      tests: [
        { name: { en: "square(4) returns 16", ar: "square(4) يعيد 16" }, check: `makeCachedSquare()(4) === 16` },
        { name: { en: "Repeated call uses cache (only 1 computation)", ar: "الاستدعاء المكرّر يستخدم الذاكرة (حساب واحد فقط)" }, check: `(function(){ const s = makeCachedSquare(); s(4); s(4); s(4); return s.getComputations() === 1; })()` },
        { name: { en: "Different inputs compute separately", ar: "المدخلات المختلفة تُحسب منفصلة" }, check: `(function(){ const s = makeCachedSquare(); s(2); s(3); return s.getComputations() === 2 && s(3) === 9; })()` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What problem does caching solve?", ar: "ما المشكلة التي يحلها التخزين المؤقت؟" },
          choices: [
            { en: "Avoiding repeated slow work by remembering results", ar: "تجنّب تكرار العمل البطيء بتذكّر النتائج" },
            { en: "Encrypting user data", ar: "تشفير بيانات المستخدم" },
            { en: "Sending emails", ar: "إرسال البريد" },
          ],
          answer: 0,
          explain: {
            en: "A cache stores answers to slow operations so repeat requests are instant (a cache hit). Redis is a common tool.",
            ar: "الذاكرة المؤقتة تخزّن إجابات العمليات البطيئة فتصبح الطلبات المكرّرة فورية (cache hit). وRedis أداة شائعة.",
          },
        },
        {
          q: { en: "The hard part of caching is…", ar: "الجزء الصعب في التخزين المؤقت هو…" },
          choices: [
            { en: "Deciding how long before cached data is stale", ar: "تحديد متى تصبح البيانات المخزّنة بائتة" },
            { en: "Typing the word cache", ar: "كتابة كلمة cache" },
            { en: "Buying more memory", ar: "شراء ذاكرة أكثر" },
          ],
          answer: 0,
          explain: {
            en: "Stale data — serving an old answer after the real data changed — is caching's classic pitfall (invalidation).",
            ar: "البيانات البائتة — تقديم إجابة قديمة بعد تغيّر البيانات الحقيقية — هي فخ التخزين المؤقت الكلاسيكي (الإبطال).",
          },
        },
        {
          q: { en: "Why put a slow job (like sending 10k emails) in a queue?", ar: "لماذا نضع مهمة بطيئة (كإرسال 10 آلاف بريد) في طابور؟" },
          choices: [
            { en: "So the user gets an instant response while a worker does it in the background", ar: "ليحصل المستخدم على رد فوري بينما يؤديها عامل في الخلفية" },
            { en: "To make it slower on purpose", ar: "لجعلها أبطأ عمداً" },
            { en: "Queues delete the job", ar: "الطوابير تحذف المهمة" },
          ],
          answer: 0,
          explain: {
            en: "Queues decouple slow work from the request. The user isn't blocked, spikes are absorbed, and failed jobs can retry.",
            ar: "الطوابير تفصل العمل البطيء عن الطلب. لا يُحجب المستخدم، وتُمتَص موجات الضغط، وتُعاد محاولة المهام الفاشلة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Caching = sticky note: store slow answers for instant reuse (watch for stale data)
- Queues = to-do tray: offload heavy jobs to background workers, respond fast
- You built a working cache with hit/miss counting

**Next:** Docker & Deployment — packaging your backend so it runs identically everywhere.`,
        ar: `## الخلاصة

- التخزين المؤقت = ملاحظة لاصقة: خزّن الإجابات البطيئة لإعادة استخدام فوري (احذر البيانات البائتة)
- الطوابير = صندوق مهام: انقل المهام الثقيلة لعمّال الخلفية، ورُدّ بسرعة
- بنيت ذاكرة مؤقتة عاملة بعدّ الإصابة/الإخفاق

**التالي:** Docker والنشر — تغليف خلفيتك لتعمل بنفس الشكل في كل مكان.`,
      },
    },
  ],
};
