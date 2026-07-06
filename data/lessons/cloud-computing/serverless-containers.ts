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
      type: "text",
      body: {
        en: `## Auto-scaling and cold starts, up close 📈

Both containers and serverless promise to "scale automatically" — but the mechanics, and the trade-offs, differ in a way that matters when you're picking one.

**Container auto-scaling** works by watching a metric (usually CPU or memory usage, or requests-per-second) and adding or removing running container copies to match. If traffic doubles, the orchestrator (Kubernetes or a simpler managed service) starts more copies behind the load balancer — but each new copy still takes real time to start: pull the container image, boot the app, pass a health check. That's often several seconds to a minute. Good auto-scaling *anticipates* load (scaling up before a known traffic spike) rather than only reacting after users are already waiting.

**Serverless cold starts** are the same idea at a smaller scale. If a Lambda function hasn't run recently, the very first request has to wait while the cloud provisions a fresh execution environment for it — commonly tens to hundreds of milliseconds, sometimes longer for large functions or unusual runtimes. Once "warm," subsequent requests are fast, because the environment stays ready for a while. This is why serverless is a poor fit for latency-sensitive, constantly-hit endpoints (every request should be a "warm" hit) but a great fit for occasional or bursty triggers where an occasional cold start barely matters.

Both mechanisms are solving the same underlying problem — matching running capacity to real demand without a human watching a dashboard — just at different levels of the stack. Understanding *why* scaling has a delay (something has to actually start up) turns "the cloud scales automatically" from magic into an engineering trade-off you can reason about and design around.`,
        ar: `## التوسّع التلقائي والبدايات الباردة، عن قرب 📈

كل من الحاويات وبلا خادم يَعِدان بـ"التوسّع تلقائياً" — لكن الآلية، والمقايضات، تختلفان بطريقة تهم حين تختار أحدهما.

**التوسّع التلقائي للحاويات** يعمل بمراقبة مقياس (عادة استخدام المعالج أو الذاكرة، أو الطلبات في الثانية) وإضافة أو إزالة نسخ حاويات عاملة لتطابق ذلك. إن تضاعفت الحركة، يبدأ المنسّق (Kubernetes أو خدمة مُدارة أبسط) نسخاً أكثر خلف موازِن الحِمل — لكن كل نسخة جديدة ما زالت تستغرق وقتاً حقيقياً للبدء: سحب صورة الحاوية، تشغيل التطبيق، اجتياز فحص صحة. غالباً ثوانٍ عدة إلى دقيقة. التوسّع التلقائي الجيد *يتوقّع* الحِمل (يتوسّع قبل موجة حركة معروفة) بدل رد الفعل فقط بعد أن ينتظر المستخدمون بالفعل.

**البدايات الباردة (cold starts) بلا خادم** نفس الفكرة على مقياس أصغر. إن لم تعمل دالة Lambda مؤخراً، على الطلب الأول انتظار ريثما يهيّئ المزوّد بيئة تنفيذ جديدة لها — عادة عشرات إلى مئات المللي ثانية، وأحياناً أطول للدوال الكبيرة أو بيئات التشغيل غير المعتادة. بمجرد أن تصبح "دافئة"، الطلبات اللاحقة سريعة، لأن البيئة تبقى جاهزة لفترة. لهذا بلا خادم خيار سيئ لنقاط نهاية حساسة لزمن الاستجابة تُضرب باستمرار (كل طلب يجب أن يكون إصابة "دافئة") لكنه خيار رائع للمحفّزات العرضية أو المتقطعة حيث بداية باردة عرضية بالكاد تهم.

كلتا الآليتين تحلّان نفس المشكلة الأساسية — مطابقة السعة العاملة مع الطلب الفعلي دون إنسان يراقب لوحة معلومات — لكن على مستويات مختلفة من الطبقة. فهم *لماذا* للتوسّع تأخير (شيء ما يجب أن يبدأ فعلياً) يحوّل "السحابة تتوسّع تلقائياً" من سحر إلى مقايضة هندسية يمكنك التفكير بها والتصميم حولها.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: "**Build a compute-model picker.** Write `pickComputeModel(requestsPerDay, isSpiky)` — `requestsPerDay` is a number, `isSpiky` is a boolean (true if traffic is bursty/unpredictable). Return `\"serverless\"` if `requestsPerDay < 10000` OR `isSpiky` is `true` (low or unpredictable volume favors pay-per-execution). Otherwise return `\"containers\"` (steady, high volume favors always-on containers, which get cheaper per-request at scale).",
        ar: "**ابنِ مُنتقي نموذج حوسبة.** اكتب `pickComputeModel(requestsPerDay, isSpiky)` — `requestsPerDay` رقم، و`isSpiky` قيمة منطقية (true إن كانت الحركة متقطعة/غير متوقعة). أعِد `\"serverless\"` إذا كان `requestsPerDay < 10000` أو `isSpiky` تساوي `true` (حجم منخفض أو غير متوقع يفضّل الدفع لكل تنفيذ). وإلا أعِد `\"containers\"` (حجم ثابت مرتفع يفضّل حاويات دائمة التشغيل، أرخص لكل طلب على النطاق الواسع).",
      },
      starterCode: `function pickComputeModel(requestsPerDay, isSpiky) {
  // TODO: return "serverless" or "containers"
}
`,
      solution: `function pickComputeModel(requestsPerDay, isSpiky) {
  if (requestsPerDay < 10000 || isSpiky) return "serverless";
  return "containers";
}
`,
      hints: [
        { en: "Either condition alone is enough to pick serverless — use ||.", ar: "أي شرط وحده كافٍ لاختيار serverless — استخدم ||." },
        { en: "Only steady AND high-volume traffic (requestsPerDay >= 10000 and not spiky) should return \"containers\".", ar: "فقط الحركة الثابتة والمرتفعة (requestsPerDay >= 10000 وغير متقطعة) يجب أن تعيد \"containers\"." },
      ],
      tests: [
        { name: { en: "Low volume picks serverless", ar: "حجم منخفض يختار serverless" }, check: `pickComputeModel(500, false) === "serverless"` },
        { name: { en: "High volume but spiky picks serverless", ar: "حجم مرتفع لكن متقطع يختار serverless" }, check: `pickComputeModel(1000000, true) === "serverless"` },
        { name: { en: "High steady volume picks containers", ar: "حجم مرتفع ثابت يختار containers" }, check: `pickComputeModel(1000000, false) === "containers"` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Kubernetes and Google's Borg 🔍

Kubernetes was open-sourced by Google in 2014, but it wasn't a first attempt — it was a public reimagining of "Borg," an internal container-management system Google had already been running for over a decade to schedule and manage the containers behind services like Search and Gmail at enormous scale.

Google's insight was that the hard problems of running containers reliably — scheduling them onto servers efficiently, restarting crashed ones automatically, scaling based on load, rolling out updates without downtime — were the same problems every company running containers at any real scale would eventually face. Rather than keep that solved internally, Google released Kubernetes as an open-source project and donated it to the newly formed Cloud Native Computing Foundation.

A decade later, Kubernetes had become the industry-standard container orchestrator this lesson describes, run by companies of every size on every major cloud provider — not because those companies invented it themselves, but because Google had already spent ten years hardening the exact orchestration problem they were facing. It's a rare case of a company's internal infrastructure tool becoming the entire industry's shared standard, and it's why "learn Kubernetes" is such common advice for anyone going deep on cloud and DevOps careers.`,
        ar: `## دراسة حالة واقعية: Kubernetes وBorg من Google 🔍

فتحت Google كود Kubernetes عام 2014، لكنها لم تكن محاولة أولى — بل إعادة تصوّر عامة لـ"Borg"، نظام إدارة حاويات داخلي كانت Google تشغّله بالفعل لأكثر من عقد لجدولة وإدارة الحاويات وراء خدمات مثل Search وGmail على نطاق هائل.

رؤية Google كانت أن المشكلات الصعبة في تشغيل الحاويات بموثوقية — جدولتها على الخوادم بكفاءة، إعادة تشغيل المتعطلة تلقائياً، التوسّع حسب الحِمل، نشر التحديثات بلا توقّف — هي نفس المشكلات التي ستواجهها أي شركة تشغّل حاويات على أي نطاق حقيقي عاجلاً أم آجلاً. بدل إبقاء ذلك محلولاً داخلياً، أصدرت Google Kubernetes كمشروع مفتوح المصدر وتبرّعت به لمؤسسة Cloud Native Computing المشكّلة حديثاً.

بعد عقد، أصبح Kubernetes منسّق الحاويات المعياري في الصناعة الذي يصفه هذا الدرس، تشغّله شركات من كل حجم على كل مزوّد سحابي رئيسي — ليس لأن تلك الشركات اخترعته بنفسها، بل لأن Google كانت قد أنفقت بالفعل عشر سنوات في تحصين نفس مشكلة التنسيق التي تواجهها. إنها حالة نادرة لأداة بنية تحتية داخلية لشركة تصبح المعيار المشترك للصناعة بأكملها، ولهذا "تعلّم Kubernetes" نصيحة شائعة جداً لأي شخص يتعمّق في مسارات مهنية بالسحابة وDevOps.`,
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
        {
          q: { en: "Why does auto-scaling (containers) or a cold start (serverless) take noticeable time?", ar: "لماذا يستغرق التوسّع التلقائي (حاويات) أو البداية الباردة (بلا خادم) وقتاً ملحوظاً؟" },
          choices: [
            { en: "A new container or execution environment genuinely has to start up before it can serve traffic", ar: "حاوية أو بيئة تنفيذ جديدة يجب أن تبدأ فعلياً قبل أن تستطيع خدمة الحركة" },
            { en: "The cloud provider intentionally delays requests to save money", ar: "مزوّد السحابة يؤخّر الطلبات عمداً لتوفير المال" },
            { en: "It never actually takes any measurable time", ar: "لا يستغرق أي وقت ملحوظ فعلياً إطلاقاً" },
          ],
          answer: 0,
          explain: {
            en: "Whether it's pulling a container image and passing health checks, or provisioning a fresh serverless execution environment, something real has to boot up — that's the delay.",
            ar: "سواء سحب صورة حاوية واجتياز فحوصات صحة، أو تهيئة بيئة تنفيذ بلا خادم جديدة، شيء حقيقي يجب أن يبدأ — هذا هو التأخير.",
          },
        },
        {
          q: { en: "Where did Kubernetes originally come from?", ar: "من أين نشأ Kubernetes أصلاً؟" },
          choices: [
            { en: "Google open-sourced it in 2014 as a public reimagining of its internal 'Borg' system used for over a decade", ar: "فتحت Google كوده عام 2014 كإعادة تصوّر عامة لنظامها الداخلي 'Borg' المستخدم لأكثر من عقد" },
            { en: "It was built from scratch by a startup with no prior experience running containers", ar: "بُني من الصفر بواسطة شركة ناشئة بلا خبرة سابقة في تشغيل الحاويات" },
            { en: "It has always been a paid product with no open-source version", ar: "كان دائماً منتجاً مدفوعاً بلا نسخة مفتوحة المصدر" },
          ],
          answer: 0,
          explain: {
            en: "Kubernetes is a public version of Borg, Google's internal container orchestrator, released as open source and donated to the Cloud Native Computing Foundation.",
            ar: "Kubernetes نسخة عامة من Borg، منسّق الحاويات الداخلي لـ Google، صدر كمفتوح المصدر وتبرّعت به لمؤسسة Cloud Native Computing.",
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
- Auto-scaling and cold starts both take real time because something genuinely has to start up
- Kubernetes began as Google's internal Borg system before becoming the industry standard

**Next:** Cloud Architecture — combining everything into well-designed, cost-aware systems.`,
        ar: `## الخلاصة

- الحاويات: صناديق تطبيقات محمولة؛ وKubernetes ينسّقها على نطاق واسع
- بلا خادم: ارفع دالة، شغّل عند الطلب، بلا تكلفة خمول (مقايضة البداية الباردة)
- اختر حسب الحِمل: بلا خادم للمتقطّع/المدفوع بالأحداث، والحاويات لطويل العمر/المحمول
- إنه تفكير المقايضات مطبّقاً على الحوسبة
- التوسّع التلقائي والبدايات الباردة كلاهما يستغرقان وقتاً حقيقياً لأن شيئاً ما يجب أن يبدأ فعلياً
- بدأ Kubernetes كنظام Borg الداخلي لـ Google قبل أن يصبح معيار الصناعة

**التالي:** معمارية السحابة — دمج كل شيء في أنظمة مصمّمة جيداً وواعية بالتكلفة.`,
      },
    },
  ],
};
