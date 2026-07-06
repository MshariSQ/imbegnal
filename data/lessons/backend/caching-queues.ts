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
      type: "text",
      body: {
        en: `## Eviction and invalidation — when to forget 🗑️

A cache that never forgets isn't a cache, it's a second, worse database — memory is expensive and finite. Two separate problems, both called "the hard part of caching":

**Eviction — running out of room.** A cache has a size limit. When it's full and a new item needs to go in, something must be thrown out. The most common strategy is **LRU (Least Recently Used)**: evict whichever cached item hasn't been touched in the longest time, on the theory that "if nobody wanted it recently, nobody wants it now." Other strategies exist (LFU = least *frequently* used, FIFO = oldest inserted), but LRU is the default almost everywhere, including Redis.

**Invalidation — the data changed underneath you.** Suppose you cache "Sara's profile" for 10 minutes, but Sara updates her bio 30 seconds later. Now the cache is lying. Two common fixes:
- **TTL (time-to-live):** every cached entry auto-expires after N seconds, capping how wrong it can be.
- **Explicit invalidation:** the code that updates Sara's bio also actively deletes (or overwrites) her cached profile at the same moment, so nobody serves stale data even briefly.

There's a famous line by Phil Karlton: *"There are only two hard things in computer science: cache invalidation and naming things."* It's a joke with a real point — deciding exactly when a cached value stops being trustworthy is genuinely one of the trickiest judgment calls in backend engineering, and picking a TTL that's "long enough to help, short enough to stay honest" is a real skill.`,
        ar: `## الإخلاء والإبطال — متى تنسى 🗑️

الذاكرة المؤقتة التي لا تنسى أبداً ليست ذاكرة مؤقتة، بل قاعدة بيانات ثانية أسوأ — الذاكرة مكلفة ومحدودة. مشكلتان منفصلتان، تُسمّيان كلتاهما "الجزء الصعب من التخزين المؤقت":

**الإخلاء (eviction) — نفاد المساحة.** للذاكرة المؤقتة حدّ حجم. حين تمتلئ ويحتاج عنصر جديد الدخول، يجب طرد شيء. الاستراتيجية الأشيع هي **LRU (الأقل استخداماً حديثاً)**: أخلِ أياً كان العنصر المخزَّن الذي لم يُلمَس منذ أطول وقت، على افتراض أن "إن لم يُرِده أحد حديثاً، فلا أحد يريده الآن". توجد استراتيجيات أخرى (LFU = الأقل *تكراراً* في الاستخدام، وFIFO = الأقدم إدراجاً)، لكن LRU هي الافتراضية في كل مكان تقريباً، بما فيها Redis.

**الإبطال (invalidation) — تغيّرت البيانات تحتك.** لنفترض أنك خزّنت "ملف Sara الشخصي" لعشر دقائق، لكنها حدّثت سيرتها الذاتية بعد 30 ثانية. الآن الذاكرة المؤقتة تكذب. حلّان شائعان:
- **TTL (وقت البقاء):** كل مُدخل مخزَّن ينتهي تلقائياً بعد N ثانية، فيحدّ من مدى خطئه المحتمل.
- **الإبطال الصريح:** الكود الذي يحدّث سيرة Sara يحذف (أو يستبدل) أيضاً ملفها المخزَّن في اللحظة نفسها، فلا يقدّم أحد بيانات بائتة ولو لحظياً.

هناك عبارة شهيرة لـ Phil Karlton: *"يوجد شيئان صعبان فقط في علوم الحاسوب: إبطال الذاكرة المؤقتة وتسمية الأشياء."* نكتة بمغزى حقيقي — تحديد متى بالضبط تتوقف قيمة مخزَّنة عن كونها موثوقة هو فعلاً أحد أصعب قرارات الحكم في هندسة الخلفية، واختيار TTL "طويل بما يكفي ليفيد، قصير بما يكفي ليبقى صادقاً" مهارة حقيقية.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Add a **TTL** to a cache. Complete \`makeTTLCache(ttlMs)\` returning \`{ set(key, value), get(key) }\` where \`get\` returns the value if it was set less than \`ttlMs\` milliseconds ago, or \`undefined\` if it has expired (or was never set).

You'll need to store *when* each value was set alongside the value itself.`,
        ar: `أضِف **TTL** إلى ذاكرة مؤقتة. أكمل \`makeTTLCache(ttlMs)\` التي تعيد \`{ set(key, value), get(key) }\` حيث تعيد \`get\` القيمة إذا كانت وُضعت منذ أقل من \`ttlMs\` ميلي ثانية، أو \`undefined\` إن انتهت صلاحيتها (أو لم توضع قط).

ستحتاج تخزين *متى* وُضعت كل قيمة إلى جانب القيمة نفسها.`,
      },
      starterCode: `function makeTTLCache(ttlMs) {
  const store = {}; // key -> { value, setAt }

  function set(key, value) {
    // store { value, setAt: Date.now() }
  }

  function get(key) {
    // if not present -> undefined
    // if Date.now() - setAt >= ttlMs -> expired -> undefined
    // otherwise -> return the value
  }

  return { set, get };
}

const cache = makeTTLCache(50);
cache.set("a", 1);
console.log(cache.get("a")); // 1 (fresh)`,
      solution: `function makeTTLCache(ttlMs) {
  const store = {};

  function set(key, value) {
    store[key] = { value, setAt: Date.now() };
  }

  function get(key) {
    const entry = store[key];
    if (!entry) return undefined;
    if (Date.now() - entry.setAt >= ttlMs) return undefined;
    return entry.value;
  }

  return { set, get };
}

const cache = makeTTLCache(50);
cache.set("a", 1);
console.log(cache.get("a")); // 1`,
      hints: [
        { en: `set stores an object: store[key] = { value, setAt: Date.now() };`, ar: `set تخزّن كائناً: store[key] = { value, setAt: Date.now() };` },
        { en: `get checks: if (!entry) return undefined; then if (Date.now() - entry.setAt >= ttlMs) return undefined; else return entry.value;`, ar: `get تفحص: if (!entry) return undefined; ثم if (Date.now() - entry.setAt >= ttlMs) return undefined; وإلا return entry.value;` },
      ],
      tests: [
        { name: { en: "Fresh value is returned", ar: "القيمة الطازجة تُعاد" }, check: `(function(){ const c = makeTTLCache(1000); c.set("x", 42); return c.get("x") === 42; })()` },
        { name: { en: "Missing key returns undefined", ar: "المفتاح غير الموجود يعيد undefined" }, check: `makeTTLCache(1000).get("nope") === undefined` },
        { name: { en: "Expired value returns undefined", ar: "القيمة المنتهية تعيد undefined" }, check: `(async function(){ const c = makeTTLCache(10); c.set("x", 1); await new Promise(r => setTimeout(r, 30)); return c.get("x") === undefined; })()` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Cloudflare's global cache 🔍

Every request to this platform's static site is served through Cloudflare's CDN — one of the largest caching systems on Earth. The concept is exactly the one in this lesson, just scaled to hundreds of cities: the first time someone in Tokyo requests a page, Cloudflare's Tokyo data center has a **cache miss**, fetches it from the origin, and stores a copy locally. Every subsequent visitor in Tokyo gets a **cache hit** — served in milliseconds from nearby, without the request ever crossing an ocean.

The invalidation half of this lesson matters enormously at that scale. Static assets (JS/CSS bundles) are typically named with a content hash in the filename (like \`main.a1b2c3.js\`) and cached with a very long TTL — since the filename itself changes whenever the content does, there's nothing to invalidate; a new deploy simply produces new filenames and old cached copies quietly age out, unreferenced. HTML pages, which need to reflect fresher content, are usually cached with a short TTL or a \`Cache-Control: no-cache\` header that forces a quick revalidation check.

This two-tier approach — cache the unchanging stuff practically forever, cache the changing stuff briefly or not at all — is the same TTL judgment call from this lesson, just applied at planet scale. One famous real incident illustrates the risk: in July 2019, a bad regex deployed to Cloudflare's edge caused a global outage affecting a huge share of the web for about 30 minutes, a reminder that infrastructure this deeply cached and this widely relied-upon has to treat every deploy with extreme care.`,
        ar: `## دراسة حالة واقعية: الذاكرة المؤقتة العالمية لـ Cloudflare 🔍

كل طلب لموقع هذه المنصة الثابت يُخدَّم عبر شبكة توصيل محتوى Cloudflare (CDN) — أحد أكبر أنظمة التخزين المؤقت على الأرض. الفكرة هي نفسها بالضبط في هذا الدرس، لكن بمقياس مئات المدن: أول مرة يطلب فيها أحد في طوكيو صفحة، يحصل مركز بيانات طوكيو لدى Cloudflare على **إخفاق (cache miss)**، فيجلبها من المصدر ويخزّن نسخة محلياً. كل زائر لاحق في طوكيو يحصل على **إصابة (cache hit)** — يُخدَّم خلال ميلي ثوانٍ من مكان قريب، دون أن يعبر الطلب محيطاً أبداً.

نصف الإبطال من هذا الدرس مهم جداً بهذا المقياس. الأصول الثابتة (حزم JS/CSS) تُسمّى عادة بتضمين تجزئة محتوى في اسم الملف (مثل \`main.a1b2c3.js\`) وتُخزَّن بـ TTL طويل جداً — بما أن اسم الملف نفسه يتغيّر كلما تغيّر المحتوى، لا شيء يحتاج إبطالاً؛ عملية نشر جديدة تُنتج ببساطة أسماء ملفات جديدة، والنسخ المخزَّنة القديمة تشيخ بهدوء دون إشارة إليها. أما صفحات HTML، التي تحتاج عكس محتوى أحدث، فتُخزَّن عادة بـ TTL قصير أو ترويسة \`Cache-Control: no-cache\` تفرض فحص إعادة تحقق سريعاً.

هذا النهج ثنائي المستوى — خزّن الأشياء الثابتة إلى الأبد تقريباً، وخزّن المتغيّرة لفترة قصيرة أو لا تخزّنها إطلاقاً — هو نفس قرار الحكم على TTL من هذا الدرس، مطبّقاً فقط بمقياس كوكبي. حادثة واقعية شهيرة توضح الخطر: في يوليو 2019، تسبّب تعبير نمطي (regex) معطوب نُشر على حافة Cloudflare بانقطاع عالمي أثّر على حصة ضخمة من الويب لنحو 30 دقيقة، تذكير بأن بنية تحتية مخزَّنة بهذا العمق ومُعتمَد عليها بهذا الاتساع يجب أن تعامل كل نشر بحذر شديد.`,
      },
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
        {
          q: { en: "What does the LRU eviction strategy do?", ar: "ماذا تفعل استراتيجية الإخلاء LRU؟" },
          choices: [
            { en: "Throws out whichever cached item hasn't been used in the longest time", ar: "تطرد أياً كان العنصر المخزَّن الذي لم يُستخدم منذ أطول وقت" },
            { en: "Deletes the newest item first", ar: "تحذف أحدث عنصر أولاً" },
            { en: "Never removes anything", ar: "لا تزيل شيئاً أبداً" },
          ],
          answer: 0,
          explain: {
            en: "LRU = Least Recently Used. When the cache is full, it evicts the item that's gone the longest untouched — the default in Redis and most caches.",
            ar: "LRU = الأقل استخداماً حديثاً. حين تمتلئ الذاكرة المؤقتة، تُخلي العنصر الذي مرّ عليه أطول وقت دون لمس — الافتراضي في Redis ومعظم الذواكر المؤقتة.",
          },
        },
        {
          q: { en: "What is a TTL (time-to-live) for in caching?", ar: "ما وظيفة TTL (وقت البقاء) في التخزين المؤقت؟" },
          choices: [
            { en: "It auto-expires a cached entry after N seconds so it can't be wrong forever", ar: "يُنهي صلاحية مُدخل مخزَّن تلقائياً بعد N ثانية فلا يبقى خاطئاً للأبد" },
            { en: "It measures how much RAM the server has", ar: "يقيس مقدار ذاكرة RAM لدى الخادم" },
            { en: "It encrypts cached data", ar: "يشفّر البيانات المخزَّنة" },
          ],
          answer: 0,
          explain: {
            en: "A TTL caps how stale a cached value can get — the trade-off is picking a value long enough to help but short enough to stay honest.",
            ar: "الـ TTL يحدّ سقفاً لمدى بأت القيمة المخزَّنة — المقايضة هي اختيار قيمة طويلة بما يكفي لتفيد لكن قصيرة بما يكفي لتبقى صادقة.",
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
- You built a working cache with hit/miss counting, then added TTL-based expiry
- **Eviction** (LRU) handles a full cache; **invalidation** (TTL or explicit) handles stale data — the two "hard parts" of caching
- Cloudflare's global CDN caches this very platform's assets using these exact ideas, at planetary scale

**Next:** Docker & Deployment — packaging your backend so it runs identically everywhere.`,
        ar: `## الخلاصة

- التخزين المؤقت = ملاحظة لاصقة: خزّن الإجابات البطيئة لإعادة استخدام فوري (احذر البيانات البائتة)
- الطوابير = صندوق مهام: انقل المهام الثقيلة لعمّال الخلفية، ورُدّ بسرعة
- بنيت ذاكرة مؤقتة عاملة بعدّ الإصابة/الإخفاق، ثم أضفت انتهاء صلاحية قائماً على TTL
- **الإخلاء** (LRU) يعالج امتلاء الذاكرة المؤقتة؛ و**الإبطال** (TTL أو صريح) يعالج البيانات البائتة — "الجزءان الصعبان" في التخزين المؤقت
- شبكة Cloudflare العالمية تخزّن أصول هذه المنصة نفسها مؤقتاً باستخدام هذه الأفكار بالضبط، بمقياس كوكبي

**التالي:** Docker والنشر — تغليف خلفيتك لتعمل بنفس الشكل في كل مكان.`,
      },
    },
  ],
};
