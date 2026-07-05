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

**Path to paid work:** build a real API (users + auth + a database), containerize it with Docker, deploy it to a cloud host, and put it on your GitHub. A working, deployed backend with clean auth is a portfolio piece that gets interviews. Keep building!`,
        ar: `## اكتمل المسار! 🎓

أساس الخلفية لديك مبنيّ:

- منطق البرمجة + قواعد البيانات + واجهات REST
- المصادقة والأمن بشكل صحيح
- Node.js، التخزين المؤقت، الطوابير، Docker، والتوسّع

**طريق العمل المدفوع:** ابنِ API حقيقياً (مستخدمون + مصادقة + قاعدة بيانات)، غلّفه بـ Docker، انشره على مستضيف سحابي، وضعه على GitHub. خلفية عاملة منشورة بمصادقة نظيفة قطعة معرض تجلب المقابلات. واصل البناء!`,
      },
    },
  ],
};
