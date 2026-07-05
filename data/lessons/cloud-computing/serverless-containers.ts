import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "serverless-containers",
  title: { en: "Serverless & Containers — Modern Compute", ar: "بلا خادم والحاويات — الحوسبة الحديثة" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What **containers** are (a quick recap + why cloud loves them)
- **Serverless** — running code with zero server management
- When to choose each
- The trade-offs that decide real architectures`,
        ar: `## ماذا ستتعلم

- ما هي **الحاويات** (تلخيص سريع + لماذا تعشقها السحابة)
- **بلا خادم (Serverless)** — تشغيل الكود بلا إدارة خوادم
- متى تختار كلاً منهما
- المقايضات التي تحسم المعماريات الحقيقية`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Two modern ways to run code ☁️

Traditionally you rented a whole server (EC2) and kept it running 24/7 — paying even when idle, and managing the OS yourself. Two modern approaches improve on that.

**Containers (a recap from the backend track).** A container packages your app + everything it needs into one portable box that runs identically anywhere (Docker). In the cloud, containers shine because they're:
- **Lightweight** — many containers share one server efficiently.
- **Portable** — the same box runs on any cloud.
- **Scalable** — spin up 100 identical copies in seconds behind a load balancer.

When you have *many* containers, you need something to manage them — starting, stopping, restarting crashed ones, spreading them across servers. That manager is **Kubernetes** (often "K8s"): the industry-standard container orchestrator. It's powerful and complex — a whole DevOps specialty on its own.

**Serverless (e.g. AWS Lambda).** Take it further: don't manage *any* server, not even a container host. You upload just a **function**, and the cloud runs it **only when triggered** — an HTTP request, a file upload, a timer. You pay per execution (often fractions of a cent) and **nothing when idle**.

\`\`\`
Traditional server:  running 24/7, you pay always, you manage the OS
Container:           packaged app, you manage the container/cluster
Serverless:          just a function, provider runs it on demand, zero idle cost
\`\`\`

**How to choose:**
- **Serverless** wins for event-driven, spiky, or occasional workloads (a form handler, an image resizer, a scheduled job). Cheapest and simplest when traffic is uneven. Downside: "cold starts" (a small delay when a function hasn't run recently) and less control.
- **Containers** win for long-running services, complex apps, or when you need full control and portability across clouds. Downside: you manage more (especially with Kubernetes).
- **Plain servers (EC2)** still fit when you need a specific OS setup or steady, predictable load.

There's no universal best — it's the trade-off thinking from the backend system-design lesson, applied to compute.`,
        ar: `## طريقتان حديثتان لتشغيل الكود ☁️

تقليدياً كنت تستأجر خادماً كاملاً (EC2) وتُبقيه يعمل 24/7 — تدفع حتى وهو خامل، وتدير نظام التشغيل بنفسك. طريقتان حديثتان تحسّنان ذلك.

**الحاويات (تلخيص من مسار الخلفية).** الحاوية تحزم تطبيقك + كل ما يحتاجه في صندوق محمول يعمل بشكل مطابق في أي مكان (Docker). في السحابة تتألق الحاويات لأنها:
- **خفيفة** — حاويات كثيرة تتشارك خادماً واحداً بكفاءة.
- **محمولة** — نفس الصندوق يعمل على أي سحابة.
- **قابلة للتوسّع** — شغّل 100 نسخة متطابقة بثوانٍ خلف موازِن حِمل.

حين تملك *كثيراً* من الحاويات، تحتاج ما يديرها — تشغيلاً، إيقافاً، إعادة تشغيل المتعطّل، توزيعاً عبر الخوادم. ذلك المدير **Kubernetes** (غالباً "K8s"): منسّق الحاويات المعياري في الصناعة. قوي ومعقّد — تخصّص DevOps كامل بذاته.

**بلا خادم (مثل AWS Lambda).** خُذها أبعد: لا تدر *أي* خادم، ولا حتى مضيف حاوية. ترفع **دالة** فقط، وتشغّلها السحابة **فقط عند التحفيز** — طلب HTTP، رفع ملف، مؤقّت. تدفع لكل تنفيذ (غالباً أجزاء من السنت) و**لا شيء وهي خاملة**.

\`\`\`
خادم تقليدي:  يعمل 24/7، تدفع دائماً، تدير النظام
حاوية:        تطبيق محزوم، تدير الحاوية/العنقود
بلا خادم:     دالة فقط، المزوّد يشغّلها عند الطلب، بلا تكلفة خمول
\`\`\`

**كيف تختار:**
- **بلا خادم** يفوز للأحمال المدفوعة بالأحداث أو المتقطّعة أو العرضية (معالج نموذج، مصغّر صور، مهمة مجدولة). الأرخص والأبسط حين يكون الحِمل متفاوتاً. العيب: "البدايات الباردة" (تأخير صغير حين لم تعمل الدالة مؤخراً) وتحكّم أقل.
- **الحاويات** تفوز للخدمات طويلة العمر أو التطبيقات المعقّدة أو حين تحتاج تحكّماً كاملاً وقابلية نقل عبر السحابات. العيب: تدير أكثر (خاصة مع Kubernetes).
- **الخوادم العادية (EC2)** ما زالت تناسب حين تحتاج إعداد نظام محدداً أو حِملاً ثابتاً متوقعاً.

لا أفضل مطلق — إنه تفكير المقايضات من درس تصميم الأنظمة في الخلفية، مطبّقاً على الحوسبة.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is Kubernetes?", ar: "ما هو Kubernetes؟" },
          choices: [
            { en: "An orchestrator that manages many containers across servers", ar: "منسّق يدير حاويات كثيرة عبر الخوادم" },
            { en: "A programming language", ar: "لغة برمجة" },
            { en: "A type of database", ar: "نوع قاعدة بيانات" },
          ],
          answer: 0,
          explain: {
            en: "K8s automates deploying, scaling, and healing containers across a cluster — the standard for running containers at scale.",
            ar: "K8s يؤتمت نشر الحاويات وتوسيعها وإصلاحها عبر عنقود — المعيار لتشغيل الحاويات على نطاق واسع.",
          },
        },
        {
          q: { en: "With serverless (Lambda), what do you pay for when idle?", ar: "مع بلا خادم (Lambda)، ماذا تدفع وهي خاملة؟" },
          choices: [
            { en: "Nothing — you only pay per execution", ar: "لا شيء — تدفع فقط لكل تنفيذ" },
            { en: "A fixed monthly server fee", ar: "رسم خادم شهري ثابت" },
            { en: "Double the normal rate", ar: "ضعف السعر العادي" },
          ],
          answer: 0,
          explain: {
            en: "Serverless charges per invocation with no idle cost — ideal for spiky or occasional workloads.",
            ar: "بلا خادم يحاسب لكل استدعاء بلا تكلفة خمول — مثالي للأحمال المتقطّعة أو العرضية.",
          },
        },
        {
          q: { en: "Which workload best fits serverless?", ar: "أي حِمل يناسب بلا خادم أكثر؟" },
          choices: [
            { en: "An occasional, event-driven task like resizing an uploaded image", ar: "مهمة عرضية مدفوعة بالأحداث كتصغير صورة مرفوعة" },
            { en: "A constantly busy 24/7 service", ar: "خدمة مشغولة باستمرار 24/7" },
            { en: "Anything needing a custom OS", ar: "أي شيء يحتاج نظاماً مخصصاً" },
          ],
          answer: 0,
          explain: {
            en: "Event-driven, spiky, occasional work is serverless's sweet spot. Steady heavy load or full OS control favor containers/servers.",
            ar: "العمل المدفوع بالأحداث المتقطّع العرضي هو مثالية بلا خادم. الحِمل الثقيل الثابت أو التحكّم الكامل يفضّلان الحاويات/الخوادم.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Containers: portable app boxes; Kubernetes orchestrates them at scale
- Serverless: upload a function, run on demand, zero idle cost (cold-start trade-off)
- Choose by workload: serverless for spiky/event-driven, containers for long-running/portable
- It's trade-off thinking applied to compute

**Next:** Cloud Architecture — combining everything into well-designed, cost-aware systems.`,
        ar: `## الخلاصة

- الحاويات: صناديق تطبيقات محمولة؛ وKubernetes ينسّقها على نطاق واسع
- بلا خادم: ارفع دالة، شغّل عند الطلب، بلا تكلفة خمول (مقايضة البداية الباردة)
- اختر حسب الحِمل: بلا خادم للمتقطّع/المدفوع بالأحداث، والحاويات لطويل العمر/المحمول
- إنه تفكير المقايضات مطبّقاً على الحوسبة

**التالي:** معمارية السحابة — دمج كل شيء في أنظمة مصمّمة جيداً وواعية بالتكلفة.`,
      },
    },
  ],
};
