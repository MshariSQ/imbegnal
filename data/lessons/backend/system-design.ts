import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "system-design",
  title: { en: "System Design — Building for Millions", ar: "تصميم الأنظمة — البناء للملايين" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- How one server becomes many (scaling)
- **Load balancers**, **replicas**, and **horizontal vs vertical** scaling
- The famous trade-offs every senior engineer weighs
- The mental model behind big-tech architecture`,
        ar: `## ماذا ستتعلم

- كيف يصبح خادم واحد خوادم كثيرة (التوسّع)
- **موازِنات الحِمل**، و**النسخ (replicas)**، و**التوسّع الأفقي مقابل الرأسي**
- المقايضات الشهيرة التي يوازنها كل مهندس خبير
- النموذج الذهني خلف معمارية الشركات الكبرى`,
      },
    },
    {
      type: "text",
      body: {
        en: `## From food truck to restaurant chain 🍔

One server is a food truck: perfect for 50 customers a day. But 50,000? The truck melts down. **System design** is how you grow from truck to global chain without collapsing.

**Two ways to scale:**
- **Vertical scaling** = a bigger truck. Add more CPU/RAM to one server. Simple, but there's a ceiling (and it gets expensive fast).
- **Horizontal scaling** = more trucks. Run many servers and split the work. Nearly unlimited — this is how big systems actually scale.

When you have many servers, a **load balancer** stands in front like a host at a busy restaurant, sending each customer to a free table (server). If one server dies, the balancer just stops routing to it — instant resilience.

**The database becomes the bottleneck.** Common fixes:
- **Replicas** — copies of the database. Send all the *reads* to copies, *writes* to the main. Most apps read far more than they write.
- **Caching** (you learned it!) — keep hot data in Redis so the database is touched less.
- **Sharding** — split one giant database into pieces (users A–M here, N–Z there).

**The senior mindset = trade-offs.** There's rarely a "best" — only "best for this situation":
- More servers = more scale **but** more complexity and cost.
- Caching = speed **but** risk of stale data.
- The famous **CAP theorem**: in a distributed system you can't perfectly have Consistency, Availability, *and* Partition-tolerance all at once — you choose what to prioritize.

You don't need to design Netflix on day one. But knowing these words and trade-offs is exactly what separates a junior from a senior in interviews.`,
        ar: `## من عربة طعام إلى سلسلة مطاعم 🍔

الخادم الواحد عربة طعام: مثالية لـ 50 زبوناً يومياً. لكن 50,000؟ تنهار العربة. **تصميم الأنظمة** هو كيف تنمو من عربة إلى سلسلة عالمية دون انهيار.

**طريقتان للتوسّع:**
- **التوسّع الرأسي** = عربة أكبر. أضف معالجاً/ذاكرة أكثر لخادم واحد. بسيط، لكن له سقف (ويصبح مكلفاً بسرعة).
- **التوسّع الأفقي** = عربات أكثر. شغّل خوادم كثيرة وقسّم العمل. شبه لا محدود — وهكذا تتوسّع الأنظمة الكبيرة فعلاً.

حين تملك خوادم كثيرة، يقف **موازِن الحِمل (load balancer)** في المقدمة كمضيف في مطعم مزدحم، يرسل كل زبون إلى طاولة (خادم) فارغة. وإن مات خادم، يتوقف الموازِن عن توجيهه إليه — مرونة فورية.

**قاعدة البيانات تصبح عنق الزجاجة.** حلول شائعة:
- **النسخ (replicas)** — نسخ من قاعدة البيانات. أرسل كل *القراءات* للنسخ، و*الكتابات* للرئيسية. معظم التطبيقات تقرأ أكثر بكثير مما تكتب.
- **التخزين المؤقت** (تعلّمته!) — أبقِ البيانات الساخنة في Redis فتُمَسّ قاعدة البيانات أقل.
- **التجزئة (sharding)** — قسّم قاعدة عملاقة إلى قطع (مستخدمو A–M هنا، وN–Z هناك).

**عقلية الخبير = المقايضات.** نادراً ما يوجد "الأفضل" — بل "الأفضل لهذا الموقف":
- خوادم أكثر = توسّع أكبر **لكن** تعقيد وتكلفة أكثر.
- التخزين المؤقت = سرعة **لكن** خطر بيانات بائتة.
- **نظرية CAP** الشهيرة: في نظام موزّع لا يمكنك امتلاك الاتساق والتوفّر وتحمّل الانقسام كلها بكمال في آن — تختار ما تعطيه الأولوية.

لا تحتاج تصميم Netflix في أول يوم. لكن معرفة هذه الكلمات والمقايضات هو بالضبط ما يفصل المبتدئ عن الخبير في المقابلات.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Rate limiting — the bouncer at the door 🚧

Scaling protects your system from *legitimate* growth. **Rate limiting** protects it from abuse and accidents: one buggy script, or one attacker, hammering your API thousands of times a second, starving every real user of capacity.

The idea: track how many requests each client (usually identified by IP address or account) has made recently, and once they cross a threshold within a time window, reject further requests — typically with HTTP status **429 Too Many Requests** — until the window resets.

A common approach is the **sliding window**: keep a list of timestamps for each client's recent requests, drop any older than the window size, and check whether what's left is still under the limit:

\`\`\`
client makes a request →
  remove timestamps older than (now - windowMs)
  if remaining timestamps >= limit → reject (429)
  else → record this timestamp, allow the request
\`\`\`

Sensitive endpoints (like login) usually get a **much stricter** limit than general browsing endpoints — a login endpoint is the classic target for a password-guessing attack, so it's worth deliberately slowing down repeated attempts even for legitimate-looking traffic. Rate limiting is a small piece of code, but it's one of the cheapest, highest-leverage defenses a backend can have.`,
        ar: `## تحديد معدل الطلبات — الحارس عند الباب 🚧

التوسّع يحمي نظامك من النمو *المشروع*. **تحديد معدل الطلبات (rate limiting)** يحميه من الإساءة والأخطاء: سكربت معطوب واحد، أو مهاجم واحد، يقصف واجهتك آلاف المرات في الثانية، فيُجوّع كل مستخدم حقيقي من السعة.

الفكرة: تتبّع كم طلباً أرسله كل عميل (يُعرَّف عادة بعنوان IP أو الحساب) مؤخراً، وحين يتجاوز حداً معيناً ضمن نافذة زمنية، ارفض الطلبات الإضافية — عادة بحالة HTTP **429 طلبات كثيرة جداً** — حتى تُعاد ضبط النافذة.

نهج شائع هو **النافذة المنزلقة (sliding window)**: احتفظ بقائمة طوابع زمنية لطلبات كل عميل الأخيرة، احذف أي طابع أقدم من حجم النافذة، وافحص هل ما تبقّى لا يزال دون الحد:

\`\`\`
العميل يرسل طلباً ←
  أزِل الطوابع الزمنية الأقدم من (الآن - نافذة الوقت)
  إن كانت الطوابع المتبقية >= الحد ← ارفض (429)
  وإلا ← سجّل هذا الطابع الزمني، اسمح بالطلب
\`\`\`

نقاط النهاية الحساسة (كتسجيل الدخول) تحصل عادة على حد **أشد صرامة بكثير** من نقاط التصفّح العامة — نقطة تسجيل الدخول هي الهدف الكلاسيكي لهجوم تخمين كلمات المرور، فيستحق الأمر إبطاء المحاولات المتكررة عمداً حتى للحركة التي تبدو مشروعة. تحديد معدل الطلبات كود صغير، لكنه من أرخص وأنجع الدفاعات التي يمكن أن تملكها خلفية.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Build a sliding-window rate limiter. Complete \`makeRateLimiter(limit, windowMs)\` returning a function \`allow(clientId)\` that returns \`true\` if this client is still under the limit within the current window (and records the attempt), or \`false\` if they've hit the limit.

Store each client's recent request timestamps and drop the ones older than the window before checking.`,
        ar: `ابنِ محدّد معدل طلبات بنافذة منزلقة. أكمل \`makeRateLimiter(limit, windowMs)\` التي تعيد دالة \`allow(clientId)\` تعيد \`true\` إن كان هذا العميل لا يزال دون الحد ضمن النافذة الحالية (وتسجّل المحاولة)، أو \`false\` إن تجاوز الحد.

خزّن طوابع الطلبات الأخيرة لكل عميل واحذف الأقدم من النافذة قبل الفحص.`,
      },
      starterCode: `function makeRateLimiter(limit, windowMs) {
  const hits = {}; // clientId -> array of timestamps

  function allow(clientId, now = Date.now()) {
    // 1. get hits[clientId] (or [] if none yet)
    // 2. filter out timestamps older than (now - windowMs)
    // 3. if remaining.length >= limit -> save the filtered list, return false
    // 4. otherwise -> push "now", save the list, return true
  }

  return allow;
}

const allow = makeRateLimiter(3, 1000);
console.log(allow("ip1")); // true (1st)
console.log(allow("ip1")); // true (2nd)
console.log(allow("ip1")); // true (3rd)
console.log(allow("ip1")); // false (4th, over limit)`,
      solution: `function makeRateLimiter(limit, windowMs) {
  const hits = {};

  function allow(clientId, now = Date.now()) {
    const existing = hits[clientId] || [];
    const recent = existing.filter(t => now - t < windowMs);
    if (recent.length >= limit) {
      hits[clientId] = recent;
      return false;
    }
    recent.push(now);
    hits[clientId] = recent;
    return true;
  }

  return allow;
}

const allow = makeRateLimiter(3, 1000);
console.log(allow("ip1"));
console.log(allow("ip1"));
console.log(allow("ip1"));
console.log(allow("ip1"));`,
      hints: [
        { en: `Filter step: const recent = (hits[clientId] || []).filter(t => now - t < windowMs);`, ar: `خطوة الفلترة: const recent = (hits[clientId] || []).filter(t => now - t < windowMs);` },
        { en: `If recent.length >= limit, save recent and return false. Otherwise push(now), save, return true.`, ar: `إن كان recent.length >= limit، احفظ recent وأعِد false. وإلا ادفع(now)، احفظ، وأعِد true.` },
      ],
      tests: [
        { name: { en: "Allows requests under the limit", ar: "يسمح بالطلبات دون الحد" }, check: `(function(){ const a = makeRateLimiter(2, 1000); return a("x") === true && a("x") === true; })()` },
        { name: { en: "Rejects requests once the limit is hit", ar: "يرفض الطلبات عند بلوغ الحد" }, check: `(function(){ const a = makeRateLimiter(2, 1000); a("x"); a("x"); return a("x") === false; })()` },
        { name: { en: "Different clients are tracked separately", ar: "العملاء المختلفون يُتتبَّعون منفصلين" }, check: `(function(){ const a = makeRateLimiter(1, 1000); a("x"); return a("y") === true; })()` },
        { name: { en: "Old requests outside the window no longer count", ar: "الطلبات القديمة خارج النافذة لا تُحتسب" }, check: `(function(){ const a = makeRateLimiter(1, 100); const t0 = 1000; a("x", t0); return a("x", t0 + 200) === true; })()` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: this platform's own rate limiter 🔍

This exact algorithm runs, right now, in this platform's Cloudflare Worker (\`worker/src/index.ts\`). Its \`rateLimited(ip, isAuth)\` function keeps a \`Map\` of recent request timestamps per client, filters out anything older than the window, and rejects the request once the count is at or above the limit — the same sliding-window shape you just built.

Notice the deliberate asymmetry mirroring this lesson's "protect sensitive endpoints harder" point: general API paths allow 60 requests per minute, but anything under \`/api/auth/\` is capped at just 10 per minute:

\`\`\`ts
const RATE_GENERAL = { limit: 60, windowMs: 60_000 };
const RATE_AUTH = { limit: 10, windowMs: 60_000 };
\`\`\`

The router checks \`pathname.startsWith("/api/auth/")\` and picks the stricter bucket specifically because auth endpoints are the classic target for credential-stuffing and brute-force attacks — exactly the reasoning this lesson just walked through, applied for real.

There's also an explicit, honest trade-off documented right in the code: the rate limiter is "best-effort per-isolate," meaning each Cloudflare Worker isolate keeps its own in-memory map rather than sharing counts globally across every server instance. A real system-design decision was made here — a perfectly accurate global rate limiter would need a shared store (like a Durable Object or Redis), which costs latency and complexity on every single request. For this platform's scale, an approximate, free, per-isolate limiter is judged "good enough" — a textbook example of this lesson's core idea that there's no universally "best" answer, only the best trade-off for the situation at hand.`,
        ar: `## دراسة حالة واقعية: محدّد معدل الطلبات الخاص بهذه المنصة 🔍

هذه الخوارزمية بالضبط تعمل، الآن، في Cloudflare Worker الخاص بهذه المنصة (\`worker/src/index.ts\`). دالتها \`rateLimited(ip, isAuth)\` تحتفظ بـ \`Map\` من طوابع الطلبات الأخيرة لكل عميل، تفلتر أي شيء أقدم من النافذة، وترفض الطلب حين يبلغ العدد الحد أو يتجاوزه — نفس شكل النافذة المنزلقة الذي بنيته للتو.

لاحظ التفاوت المقصود الذي يعكس نقطة "احمِ نقاط النهاية الحساسة بصرامة أكبر" من هذا الدرس: مسارات API العامة تسمح بـ60 طلباً في الدقيقة، لكن أي شيء تحت \`/api/auth/\` محدود بـ10 فقط في الدقيقة:

\`\`\`ts
const RATE_GENERAL = { limit: 60, windowMs: 60_000 };
const RATE_AUTH = { limit: 10, windowMs: 60_000 };
\`\`\`

الموجّه يفحص \`pathname.startsWith("/api/auth/")\` ويختار الحاوية الأشد صرامة تحديداً لأن نقاط نهاية المصادقة هي الهدف الكلاسيكي لهجمات حشو بيانات الاعتماد والقوة الغاشمة — بالضبط المنطق الذي استعرضه هذا الدرس للتو، مطبّقاً فعلياً.

توجد أيضاً مقايضة صريحة وصادقة موثّقة مباشرة في الكود: محدّد معدل الطلبات "أفضل جهد لكل عزلة (isolate)"، أي أن كل عزلة Cloudflare Worker تحتفظ بخريطتها الخاصة في الذاكرة بدل مشاركة العدّ عالمياً عبر كل نسخة خادم. اتُّخذ قرار تصميم نظام حقيقي هنا — محدّد معدل طلبات عالمي دقيق تماماً كان سيحتاج مخزناً مشتركاً (كـ Durable Object أو Redis)، وهذا يكلّف زمن استجابة وتعقيداً في كل طلب واحد. بمقياس هذه المنصة، حُكم على محدّد تقريبي، مجاني، لكل عزلة بأنه "كافٍ" — مثال مدرسي على فكرة هذا الدرس الجوهرية بأنه لا توجد إجابة "الأفضل" عالمياً، بل فقط أفضل مقايضة للموقف المطروح.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Horizontal scaling means…", ar: "التوسّع الأفقي يعني…" },
          choices: [
            { en: "Adding more servers and splitting the work", ar: "إضافة خوادم أكثر وتقسيم العمل" },
            { en: "Making one server bigger", ar: "جعل خادم واحد أكبر" },
            { en: "Deleting old data", ar: "حذف البيانات القديمة" },
          ],
          answer: 0,
          explain: {
            en: "Horizontal = more machines (nearly unlimited). Vertical = a bigger single machine (has a ceiling).",
            ar: "الأفقي = أجهزة أكثر (شبه لا محدود). الرأسي = جهاز واحد أكبر (له سقف).",
          },
        },
        {
          q: { en: "What does a load balancer do?", ar: "ماذا يفعل موازِن الحِمل؟" },
          choices: [
            { en: "Distributes incoming requests across multiple servers", ar: "يوزّع الطلبات الواردة على عدة خوادم" },
            { en: "Stores passwords", ar: "يخزّن كلمات المرور" },
            { en: "Writes the code", ar: "يكتب الكود" },
          ],
          answer: 0,
          explain: {
            en: "Like a restaurant host seating guests at free tables, it routes each request to an available server and skips dead ones.",
            ar: "كمضيف يجلس الضيوف على طاولات فارغة، يوجّه كل طلب إلى خادم متاح ويتخطّى الميت.",
          },
        },
        {
          q: { en: "Read replicas help because…", ar: "نسخ القراءة تساعد لأن…" },
          choices: [
            { en: "Most apps read data far more than they write it", ar: "معظم التطبيقات تقرأ البيانات أكثر بكثير مما تكتبها" },
            { en: "Writing is impossible", ar: "الكتابة مستحيلة" },
            { en: "They delete the main database", ar: "تحذف قاعدة البيانات الرئيسية" },
          ],
          answer: 0,
          explain: {
            en: "Spread the heavy read traffic across copies; send the rarer writes to the primary. It relieves the main bottleneck.",
            ar: "وزّع حِمل القراءة الثقيل على النسخ؛ وأرسل الكتابات الأندر للرئيسية. يخفّف عنق الزجاجة الأساسي.",
          },
        },
        {
          q: { en: "The core mindset of system design is…", ar: "العقلية الجوهرية لتصميم الأنظمة هي…" },
          choices: [
            { en: "There's always one perfect answer", ar: "هناك دائماً إجابة مثالية واحدة" },
            { en: "Weighing trade-offs for the specific situation", ar: "موازنة المقايضات حسب الموقف المحدد" },
            { en: "Always use the newest technology", ar: "استخدم أحدث تقنية دائماً" },
          ],
          answer: 1,
          explain: {
            en: "Every choice costs something (complexity, money, staleness). Seniors reason about trade-offs, not silver bullets.",
            ar: "كل خيار له ثمن (تعقيد، مال، بيانات بائتة). الخبراء يفكرون بالمقايضات لا بالحلول السحرية.",
          },
        },
        {
          q: { en: "What does a sliding-window rate limiter check on each request?", ar: "ماذا يفحص محدّد معدل الطلبات بنافذة منزلقة عند كل طلب؟" },
          choices: [
            { en: "Whether the client's recent request count within the time window is still under the limit", ar: "هل عدد طلبات العميل الأخيرة ضمن النافذة الزمنية لا يزال دون الحد" },
            { en: "The client's password", ar: "كلمة مرور العميل" },
            { en: "The size of the database", ar: "حجم قاعدة البيانات" },
          ],
          answer: 0,
          explain: {
            en: "It drops timestamps older than the window, then checks if what's left is at or over the limit — rejecting with 429 if so.",
            ar: "يحذف الطوابع الزمنية الأقدم من النافذة، ثم يفحص هل ما تبقّى بلغ الحد أو تجاوزه — فيرفض بـ429 إن كان كذلك.",
          },
        },
        {
          q: { en: "Why does this platform's Worker give /api/auth/ a much stricter rate limit (10/min) than general paths (60/min)?", ar: "لماذا يمنح Worker هذه المنصة /api/auth/ حداً أشد صرامة (10/دقيقة) من المسارات العامة (60/دقيقة)؟" },
          choices: [
            { en: "Auth endpoints are the classic target for brute-force/credential attacks, so they deserve tighter limits", ar: "نقاط نهاية المصادقة هي الهدف الكلاسيكي لهجمات القوة الغاشمة/بيانات الاعتماد، فتستحق حدوداً أشد" },
            { en: "Login is technically slower to compute than other routes", ar: "تسجيل الدخول أبطأ تقنياً في الحساب من مسارات أخرى" },
            { en: "It's an arbitrary, meaningless choice", ar: "خيار عشوائي بلا معنى" },
          ],
          answer: 0,
          explain: {
            en: "Stricter limits on sensitive endpoints slow down attackers guessing credentials, while general browsing stays snappy.",
            ar: "الحدود الأشد على النقاط الحساسة تبطئ المهاجمين الذين يخمّنون بيانات الاعتماد، بينما يبقى التصفّح العام سريعاً.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Track complete! 🎓

Your backend foundation is built:

- Programming logic + databases + REST APIs
- Authentication & security done right
- Node.js, caching, queues, Docker, and scaling
- **Rate limiting** — you built a sliding-window limiter, the same shape and auth-vs-general split this platform's own Worker runs in production

**Path to paid work:** build a real API (users + auth + a database), containerize it with Docker, deploy it to a cloud host, and put it on your GitHub. A working, deployed backend with clean auth is a portfolio piece that gets interviews. Keep building!`,
        ar: `## اكتمل المسار! 🎓

أساس الخلفية لديك مبنيّ:

- منطق البرمجة + قواعد البيانات + واجهات REST
- المصادقة والأمن بشكل صحيح
- Node.js، التخزين المؤقت، الطوابير، Docker، والتوسّع
- **تحديد معدل الطلبات** — بنيت محدّداً بنافذة منزلقة، بنفس الشكل والتقسيم بين المصادقة والعام الذي يشغّله Worker هذه المنصة فعلياً في الإنتاج

**طريق العمل المدفوع:** ابنِ API حقيقياً (مستخدمون + مصادقة + قاعدة بيانات)، غلّفه بـ Docker، انشره على مستضيف سحابي، وضعه على GitHub. خلفية عاملة منشورة بمصادقة نظيفة قطعة معرض تجلب المقابلات. واصل البناء!`,
      },
    },
  ],
};
