import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "it-fundamentals",
  title: { en: "IT Fundamentals — The Ground Floor", ar: "أساسيات تقنية المعلومات — الطابق الأرضي" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What "a server" really is
- Clients, servers, and how they connect
- Operating systems, storage, and networks in one picture
- The vocabulary the rest of cloud builds on`,
        ar: `## ماذا ستتعلم

- ما هو "الخادم" حقاً
- العملاء، الخوادم، وكيف يتصلون
- أنظمة التشغيل والتخزين والشبكات في صورة واحدة
- المفردات التي تبني عليها بقية السحابة`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A server is just a computer 🖥️

The word "server" sounds mysterious. It isn't. A **server is simply a computer that provides something to other computers** — usually running 24/7 in a data center instead of on a desk. Your laptop asking for a web page is the **client**; the computer that sends it back is the **server**. That's the whole client–server model, and the entire internet is built on it.

Quick reminder of the pieces (from the very first computer basics, now in an IT frame):
- **CPU + RAM** — the server's brain and short-term memory.
- **Storage** — hard drives (HDD, cheap/slow) and SSDs (fast) holding data permanently.
- **Operating System** — usually **Linux** on servers (you saw why in the security track): stable, free, scriptable.
- **Network** — how servers talk: IP addresses, ports, DNS (from the networking lesson).

A **data center** is a warehouse full of thousands of these servers, with massive internet connections, backup power, and cooling. When you "use the cloud," you're really renting a slice of someone's data center.

**Two words you'll hear constantly:**
- **On-premises ("on-prem")** — a company buys and runs its *own* servers in its *own* building. You own the hardware and all its headaches.
- **Cloud** — you rent computing from a provider (AWS, Azure, Google) over the internet and pay only for what you use.

Understanding cloud starts with this: it's not magic, it's *someone else's computers* that you rent instead of buy. Everything else — scaling, services, pricing — is built on that one shift from **owning** to **renting**.`,
        ar: `## الخادم مجرد حاسوب 🖥️

كلمة "خادم" تبدو غامضة. ليست كذلك. **الخادم ببساطة حاسوب يقدّم شيئاً لحواسيب أخرى** — يعمل عادة 24/7 في مركز بيانات بدل مكتب. حاسوبك يطلب صفحة ويب هو **العميل**؛ والحاسوب الذي يرسلها هو **الخادم**. هذا نموذج العميل–الخادم كله، والإنترنت كلها مبنية عليه.

تذكير سريع بالأجزاء (من أول أساسيات الحاسوب، الآن بإطار تقني):
- **المعالج + الذاكرة** — دماغ الخادم وذاكرته قصيرة المدى.
- **التخزين** — أقراص صلبة (HDD رخيص/بطيء) وSSD (سريع) تحفظ البيانات دائماً.
- **نظام التشغيل** — عادة **لينكس** على الخوادم (رأيت لماذا في مسار الأمن): مستقر، مجاني، قابل للبرمجة.
- **الشبكة** — كيف تتحدث الخوادم: عناوين IP، منافذ، DNS (من درس الشبكات).

**مركز البيانات** مستودع مليء بآلاف هذه الخوادم، باتصالات إنترنت ضخمة وطاقة احتياطية وتبريد. حين "تستخدم السحابة"، أنت فعلياً تستأجر شريحة من مركز بيانات أحدهم.

**كلمتان ستسمعهما باستمرار:**
- **في الموقع (On-premises)** — الشركة تشتري وتشغّل خوادمها *الخاصة* في مبناها *الخاص*. تملك العتاد وكل صداعه.
- **السحابة (Cloud)** — تستأجر الحوسبة من مزوّد (AWS، Azure، Google) عبر الإنترنت وتدفع فقط مقابل ما تستخدم.

فهم السحابة يبدأ من هذا: ليست سحراً، بل *حواسيب شخص آخر* تستأجرها بدل شرائها. وكل ما عداها — التوسّع، الخدمات، التسعير — مبنيّ على هذا التحوّل الواحد من **الامتلاك** إلى **الاستئجار**.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is a server?", ar: "ما هو الخادم؟" },
          choices: [
            { en: "A computer that provides services to other computers", ar: "حاسوب يقدّم خدمات لحواسيب أخرى" },
            { en: "A special kind of monitor", ar: "نوع خاص من الشاشات" },
            { en: "A programming language", ar: "لغة برمجة" },
          ],
          answer: 0,
          explain: {
            en: "A server is just a computer serving others (usually always-on in a data center). Your device is the client.",
            ar: "الخادم مجرد حاسوب يخدم غيره (يعمل دائماً عادة في مركز بيانات). وجهازك هو العميل.",
          },
        },
        {
          q: { en: "On-premises vs cloud — the core difference?", ar: "في الموقع مقابل السحابة — الفرق الجوهري؟" },
          choices: [
            { en: "On-prem = you own the servers; cloud = you rent them", ar: "في الموقع = تملك الخوادم؛ السحابة = تستأجرها" },
            { en: "Cloud has no servers at all", ar: "السحابة بلا خوادم إطلاقاً" },
            { en: "They're the same", ar: "متطابقان" },
          ],
          answer: 0,
          explain: {
            en: "The cloud is someone else's data center that you rent over the internet, paying only for what you use.",
            ar: "السحابة مركز بيانات شخص آخر تستأجره عبر الإنترنت، وتدفع فقط مقابل ما تستخدم.",
          },
        },
        {
          q: { en: "Which OS runs most servers?", ar: "أي نظام تشغيل يشغّل معظم الخوادم؟" },
          choices: [
            { en: "Linux", ar: "Linux" },
            { en: "A phone OS", ar: "نظام هاتف" },
            { en: "None — servers have no OS", ar: "لا شيء — الخوادم بلا نظام تشغيل" },
          ],
          answer: 0,
          explain: {
            en: "Linux dominates servers: stable, free, and scriptable — exactly why it's central to cloud and security work.",
            ar: "لينكس يهيمن على الخوادم: مستقر، مجاني، وقابل للبرمجة — بالضبط لماذا هو محوري في عمل السحابة والأمن.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A server is just a computer that serves others (client–server model)
- Pieces: CPU/RAM, storage, OS (usually Linux), network
- Data centers house thousands of servers; the cloud rents you a slice
- On-prem = own; cloud = rent

**Next:** Cloud Concepts — the models (IaaS/PaaS/SaaS) and why the cloud took over.`,
        ar: `## الخلاصة

- الخادم مجرد حاسوب يخدم غيره (نموذج العميل–الخادم)
- الأجزاء: المعالج/الذاكرة، التخزين، نظام التشغيل (لينكس عادة)، الشبكة
- مراكز البيانات تضم آلاف الخوادم؛ والسحابة تؤجّرك شريحة
- في الموقع = امتلاك؛ السحابة = استئجار

**التالي:** مفاهيم السحابة — النماذج (IaaS/PaaS/SaaS) ولماذا اجتاحت السحابة كل شيء.`,
      },
    },
  ],
};
