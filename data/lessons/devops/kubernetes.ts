import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "kubernetes",
  title: { en: "Kubernetes — Orchestrating Containers", ar: "Kubernetes — تنسيق الحاويات" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- The problem Kubernetes solves
- Pods, nodes, and the desired-state idea
- Self-healing and auto-scaling
- Why "K8s" is a career-defining skill`,
        ar: `## ماذا ستتعلم

- المشكلة التي يحلها Kubernetes
- الـ Pods والـ nodes وفكرة الحالة المطلوبة
- الشفاء الذاتي والتوسّع التلقائي
- لماذا "K8s" مهارة تحدّد المسار المهني`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The conductor of the container orchestra 🎼

One container is easy to run. But real systems have *hundreds* — a web service needs 20 copies, the API needs 50, and they're spread across dozens of servers. Managing that by hand is impossible: what starts them? what restarts a crashed one at 3 a.m.? what adds copies when traffic spikes? The answer is **Kubernetes (K8s)** — the industry-standard **container orchestrator**, the conductor that keeps the whole orchestra playing.

**The vocabulary:**
- **Pod** — the smallest unit; usually one running container (plus its close helpers).
- **Node** — a worker machine (server) that runs pods.
- **Cluster** — all your nodes together, managed as one.

**The big idea: desired state.** This is what makes Kubernetes special. You don't give it step-by-step commands. Instead you *declare* the state you want — "I always want 5 copies of my web app running" — and Kubernetes **continuously works to make reality match**. This is the declarative idea from Infrastructure as Code, applied to running containers.

From that one idea, superpowers emerge automatically:
- **Self-healing** — a container crashes? Kubernetes notices reality (4 running) doesn't match desired (5) and instantly starts a replacement. No human paged at night.
- **Auto-scaling** — traffic spikes? It launches more pods; traffic drops? It removes them. You declare the rules; it enforces them.
- **Rolling updates** — deploy a new version gradually, pod by pod, with zero downtime; roll back instantly if something's wrong.
- **Load balancing** — spread requests across all healthy pods.

**The trade-off (honesty):** Kubernetes is *powerful* but *genuinely complex* — it has a steep learning curve and is overkill for small projects (a simple app is fine with plain containers or serverless). But for large-scale systems, K8s is the standard, and skilled Kubernetes engineers are among the best-paid in DevOps. It's worth learning once you're comfortable with Docker.`,
        ar: `## قائد أوركسترا الحاويات 🎼

حاوية واحدة سهلة التشغيل. لكن الأنظمة الحقيقية فيها *مئات* — خدمة ويب تحتاج 20 نسخة، والـ API يحتاج 50، وهي موزّعة عبر عشرات الخوادم. إدارة ذلك يدوياً مستحيلة: ما الذي يشغّلها؟ ما الذي يعيد تشغيل متعطّلة الساعة 3 فجراً؟ ما الذي يضيف نسخاً عند موجة ضغط؟ الجواب **Kubernetes (K8s)** — **منسّق الحاويات** المعياري، القائد الذي يُبقي الأوركسترا كلها تعزف.

**المفردات:**
- **Pod** — أصغر وحدة؛ عادة حاوية عاملة واحدة (مع مساعديها القريبين).
- **Node** — آلة عاملة (خادم) تشغّل الـ pods.
- **Cluster** — كل الـ nodes معاً، تُدار كوحدة.

**الفكرة الكبرى: الحالة المطلوبة.** هذا ما يميّز Kubernetes. لا تعطيه أوامر خطوة بخطوة. بل *تُصرّح* بالحالة التي تريد — "أريد دائماً 5 نسخ من تطبيقي عاملة" — وKubernetes **يعمل باستمرار ليطابق الواقع**. هذه الفكرة التصريحية من البنية ككود، مطبّقة على تشغيل الحاويات.

من تلك الفكرة الواحدة، تنبثق قوى خارقة تلقائياً:
- **الشفاء الذاتي** — انهارت حاوية؟ يلاحظ Kubernetes أن الواقع (4 عاملة) لا يطابق المطلوب (5) فيبدأ بديلاً فوراً. بلا إنسان يُستدعى ليلاً.
- **التوسّع التلقائي** — موجة ضغط؟ يطلق pods أكثر؛ انخفض الضغط؟ يزيلها. تُصرّح بالقواعد؛ ويفرضها.
- **التحديثات المتدرّجة** — انشر نسخة جديدة تدريجياً، pod تلو pod، بلا توقّف؛ وتراجع فوراً إن ساء شيء.
- **موازنة الحِمل** — وزّع الطلبات عبر كل الـ pods السليمة.

**المقايضة (بصدق):** Kubernetes *قوي* لكن *معقّد فعلاً* — منحنى تعلّم حاد ومبالغة للمشاريع الصغيرة (تطبيق بسيط يكفيه حاويات عادية أو بلا خادم). لكن للأنظمة واسعة النطاق، K8s هو المعيار، ومهندسو Kubernetes المهرة من أعلى الأجور في DevOps. يستحق التعلّم متى ارتحت مع Docker.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Rolling updates and health checks 🩺

Pods are constantly created and destroyed — during scaling, self-healing, and especially **deployments**. So how does Kubernetes deploy a new version of your app without downtime?

**Rolling updates** replace pods gradually, never all at once:

\`\`\`
Desired: 4 pods running v2 (currently: 4 running v1)

Step 1: start 1 pod on v2  → [v1 v1 v1 v1 v2]      (5 running briefly)
Step 2: kill 1 pod on v1   → [v1 v1 v1 v2]
Step 3: start 1 pod on v2  → [v1 v1 v1 v2 v2]
... repeat until all 4 are v2, one small batch at a time
\`\`\`

At every moment, there are always enough healthy pods serving traffic — users never see a gap. If a **health check** on the new version fails partway through, Kubernetes automatically halts the rollout before it replaces every pod, limiting the blast radius of a bad release.

**Health checks (probes)** are how Kubernetes knows a pod is actually working, not just "running":
- **Liveness probe** — "is this pod still alive?" If it fails repeatedly, Kubernetes kills and restarts the pod (self-healing in action).
- **Readiness probe** — "is this pod ready to receive traffic yet?" A pod can be alive but still warming up (loading data, connecting to a database) — Kubernetes won't send it traffic until readiness passes.

Without probes, Kubernetes would treat a frozen, unresponsive pod as perfectly healthy just because the process hasn't crashed — probes are what make self-healing and rolling updates actually safe in practice.`,
        ar: `## التحديثات المتدرّجة وفحوص السلامة 🩺

الـ pods تُنشأ وتُدمَّر باستمرار — أثناء التوسّع، الشفاء الذاتي، وخصوصاً **النشرات**. فكيف ينشر Kubernetes نسخة جديدة من تطبيقك بلا توقّف؟

**التحديثات المتدرّجة (rolling updates)** تستبدل الـ pods تدريجياً، لا كلها دفعة واحدة:

\`\`\`
المطلوب: 4 pods تعمل v2 (حالياً: 4 تعمل v1)

خطوة 1: ابدأ pod واحدة على v2  → [v1 v1 v1 v1 v2]      (5 تعمل لحظياً)
خطوة 2: اقتل pod واحدة على v1  → [v1 v1 v1 v2]
خطوة 3: ابدأ pod واحدة على v2  → [v1 v1 v1 v2 v2]
... كرّر حتى تصبح كل الـ 4 على v2، دفعة صغيرة تلو الأخرى
\`\`\`

في كل لحظة، هناك دائماً ما يكفي من الـ pods السليمة تخدم الحركة — المستخدمون لا يرون فجوة أبداً. إن فشل **فحص سلامة (health check)** على النسخة الجديدة في منتصف الطريق، يوقف Kubernetes تلقائياً النشر قبل استبدال كل pod، محدّداً نطاق ضرر إصدار سيّئ.

**فحوص السلامة (probes)** هي كيف يعرف Kubernetes أن pod تعمل فعلاً، لا فقط "تشتغل":
- **فحص الحيوية (Liveness probe)** — "هل هذه الـ pod ما زالت حية؟" إن فشل مراراً، يقتل Kubernetes الـ pod ويعيد تشغيلها (الشفاء الذاتي في العمل).
- **فحص الجاهزية (Readiness probe)** — "هل هذه الـ pod جاهزة لاستقبال حركة بعد؟" قد تكون pod حية لكنها لا تزال تُحمَّى (تحمّل بيانات، تتصل بقاعدة بيانات) — لن يرسل لها Kubernetes حركة حتى ينجح فحص الجاهزية.

بلا فحوص، سيعامل Kubernetes pod متجمّدة وغير مستجيبة كسليمة تماماً لمجرد أن العملية لم تنهر — الفحوص هي ما يجعل الشفاء الذاتي والتحديثات المتدرّجة آمنة فعلياً في الممارسة.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Simulate a rolling update step-count. Write \`rolloutSteps(totalPods)\` that returns the number of individual "start new, kill old" steps needed to fully replace \`totalPods\` pods one at a time (a simple one-by-one rolling strategy).

Example: \`rolloutSteps(4)\` → \`4\` (each of the 4 pods gets replaced individually)`,
        ar: `حاكِ عدّ خطوات تحديث متدرّج. اكتب \`rolloutSteps(totalPods)\` يعيد عدد خطوات "ابدأ جديدة، اقتل قديمة" الفردية اللازمة لاستبدال \`totalPods\` pod كاملاً واحدة تلو الأخرى (استراتيجية تدرّج بسيطة واحدة تلو الأخرى).

مثال: \`rolloutSteps(4)\` ← \`4\` (كل من الـ 4 pods تُستبدل فردياً)`,
      },
      starterCode: `function rolloutSteps(totalPods) {
  // one-by-one strategy: each pod needs exactly one replacement step
}

console.log(rolloutSteps(4)); // 4
console.log(rolloutSteps(1)); // 1`,
      solution: `function rolloutSteps(totalPods) {
  return totalPods;
}

console.log(rolloutSteps(4)); // 4
console.log(rolloutSteps(1)); // 1`,
      hints: [
        { en: `With a strict one-by-one strategy, replacing N pods takes exactly N steps.`, ar: `مع استراتيجية واحدة تلو الأخرى الصارمة، استبدال N pod يأخذ بالضبط N خطوة.` },
        { en: `No loop needed — just return totalPods directly.`, ar: `لا حاجة لحلقة — فقط أعِد totalPods مباشرة.` },
      ],
      tests: [
        { name: { en: "4 pods need 4 steps", ar: "4 pods تحتاج 4 خطوات" }, check: `rolloutSteps(4) === 4` },
        { name: { en: "1 pod needs 1 step", ar: "pod واحدة تحتاج خطوة واحدة" }, check: `rolloutSteps(1) === 1` },
        { name: { en: "10 pods need 10 steps", ar: "10 pods تحتاج 10 خطوات" }, check: `rolloutSteps(10) === 10` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Pokémon GO's launch-day crush 🔍

When Pokémon GO launched in 2016, demand exploded far beyond anyone's forecasts — reportedly **50x** the traffic the team had planned for, arriving within days. The game's backend ran on Google's cloud infrastructure with container orchestration handling the workload, and the team has since spoken publicly about how that architecture was the only reason the service survived launch week at all: instead of provisioning fixed servers sized for an estimate, the orchestration layer could keep adding capacity as real traffic demanded it.

A launch of that scale on traditional, manually-provisioned servers would have meant an outright outage lasting days while engineers scrambled to rack up more hardware. This is the exact promise of Kubernetes-style orchestration you learned in this lesson: you declare "keep enough healthy pods running to serve demand," and the system keeps making that true — even when demand is 50 times higher than anyone predicted.`,
        ar: `## دراسة حالة واقعية: ازدحام إطلاق Pokémon GO 🔍

حين أُطلقت Pokémon GO عام 2016، انفجر الطلب متجاوزاً كل توقعات الفريق — أُبلغ عن حركة أعلى بـ**50 ضعفاً** مما خطط له الفريق، وصلت خلال أيام. عملت خلفية اللعبة على بنية Google السحابية بتنسيق حاويات يتعامل مع الحمل، وتحدّث الفريق علناً منذ ذلك الحين عن كون تلك البنية السبب الوحيد لنجاة الخدمة أسبوع الإطلاق أصلاً: بدل توفير خوادم ثابتة بحجم تقديري، استطاعت طبقة التنسيق الاستمرار بإضافة سعة كلما تطلّبتها الحركة الحقيقية.

إطلاق بذلك الحجم على خوادم تقليدية موفَّرة يدوياً كان سيعني انقطاعاً صريحاً يدوم أياماً بينما يتسابق المهندسون لتركيب عتاد إضافي. هذا بالضبط وعد التنسيق بأسلوب Kubernetes الذي تعلمته في هذا الدرس: تُصرّح "أبقِ ما يكفي من pods سليمة تعمل لخدمة الطلب"، والنظام يستمر بتحقيق ذلك — حتى حين يكون الطلب أعلى بـ50 ضعفاً مما توقعه أحد.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What does Kubernetes do?", ar: "ماذا يفعل Kubernetes؟" },
          choices: [
            { en: "Orchestrates many containers across many servers automatically", ar: "ينسّق حاويات كثيرة عبر خوادم كثيرة تلقائياً" },
            { en: "Writes your application code", ar: "يكتب كود تطبيقك" },
            { en: "Replaces the database", ar: "يستبدل قاعدة البيانات" },
          ],
          answer: 0,
          explain: {
            en: "K8s is the container orchestrator: it deploys, scales, heals, and load-balances containers across a cluster.",
            ar: "K8s منسّق الحاويات: ينشر ويوسّع ويشفي ويوازن الحاويات عبر عنقود.",
          },
        },
        {
          q: { en: "What is Kubernetes' 'desired state' model?", ar: "ما نموذج 'الحالة المطلوبة' في Kubernetes؟" },
          choices: [
            { en: "You declare what you want; K8s continuously makes reality match", ar: "تُصرّح بما تريد؛ وK8s يطابق الواقع باستمرار" },
            { en: "You manually start each container", ar: "تشغّل كل حاوية يدوياً" },
            { en: "It picks the state randomly", ar: "يختار الحالة عشوائياً" },
          ],
          answer: 0,
          explain: {
            en: "Declare '5 replicas' and K8s enforces it forever — the declarative approach behind self-healing and scaling.",
            ar: "صرّح بـ '5 نسخ' وينفّذها K8s للأبد — النهج التصريحي وراء الشفاء الذاتي والتوسّع.",
          },
        },
        {
          q: { en: "A pod crashes at night. What does K8s do?", ar: "تنهار pod ليلاً. ماذا يفعل K8s؟" },
          choices: [
            { en: "Automatically starts a replacement to match desired state", ar: "يبدأ بديلاً تلقائياً ليطابق الحالة المطلوبة" },
            { en: "Emails you to fix it manually", ar: "يراسلك لإصلاحها يدوياً" },
            { en: "Shuts down the whole cluster", ar: "يطفئ العنقود كله" },
          ],
          answer: 0,
          explain: {
            en: "Self-healing: reality (4) ≠ desired (5), so K8s launches a new pod instantly. No 3 a.m. page needed.",
            ar: "الشفاء الذاتي: الواقع (4) ≠ المطلوب (5)، فيطلق K8s pod جديدة فوراً. بلا استدعاء الساعة 3 فجراً.",
          },
        },
        {
          q: { en: "What is the purpose of a rolling update?", ar: "ما الغرض من التحديث المتدرّج؟" },
          choices: [
            { en: "Replace pods gradually in small batches so there's zero downtime during a deployment", ar: "استبدال الـ pods تدريجياً بدفعات صغيرة بلا توقّف أثناء النشر" },
            { en: "Delete all pods at once for a clean slate", ar: "حذف كل الـ pods دفعة واحدة لبداية نظيفة" },
            { en: "Roll the servers physically to a new data center", ar: "نقل الخوادم فعلياً لمركز بيانات جديد" },
          ],
          answer: 0,
          explain: {
            en: "Rolling updates swap old pods for new ones a few at a time, keeping enough healthy pods serving traffic throughout the deploy.",
            ar: "التحديثات المتدرّجة تستبدل pods قديمة بجديدة قليلاً في كل مرة، مُبقيةً ما يكفي من pods سليمة تخدم الحركة طوال النشر.",
          },
        },
        {
          q: { en: "What's the difference between a liveness probe and a readiness probe?", ar: "ما الفرق بين فحص الحيوية وفحص الجاهزية؟" },
          choices: [
            { en: "Liveness checks if a pod should be restarted; readiness checks if it should receive traffic yet", ar: "الحيوية تفحص إن كان يجب إعادة تشغيل pod؛ والجاهزية تفحص إن كان يجب أن تستقبل حركة بعد" },
            { en: "They are two names for the exact same check", ar: "اسمان لنفس الفحص تماماً" },
            { en: "Liveness only runs once at pod creation", ar: "الحيوية تعمل مرة واحدة فقط عند إنشاء pod" },
          ],
          answer: 0,
          explain: {
            en: "A failing liveness probe triggers a restart (self-healing); a failing readiness probe just withholds traffic until the pod is truly ready.",
            ar: "فشل فحص الحيوية يحفّز إعادة تشغيل (شفاء ذاتي)؛ وفشل فحص الجاهزية يمنع الحركة فقط حتى تصبح الـ pod جاهزة فعلاً.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Kubernetes orchestrates hundreds of containers across a cluster
- Pods run on nodes; you declare desired state and K8s enforces it
- Self-healing, auto-scaling, rolling updates, load balancing come for free
- Rolling updates deploy new versions gradually with zero downtime; liveness/readiness probes are what make self-healing and rollouts actually safe
- Powerful but complex — worth it at scale, overkill for small apps
- Pokémon GO's 2016 launch (50x expected traffic) shows why declarative, self-scaling orchestration matters at real-world scale

**Next:** Infrastructure as Code — declaring not just containers but entire environments.`,
        ar: `## الخلاصة

- Kubernetes ينسّق مئات الحاويات عبر عنقود
- الـ Pods تعمل على nodes؛ تُصرّح بالحالة المطلوبة وينفّذها K8s
- الشفاء الذاتي، التوسّع التلقائي، التحديثات المتدرّجة، موازنة الحِمل مجاناً
- التحديثات المتدرّجة تنشر نسخاً جديدة تدريجياً بلا توقّف؛ فحوص الحيوية/الجاهزية هي ما يجعل الشفاء الذاتي والنشرات آمنة فعلياً
- قوي لكن معقّد — يستحق على نطاق واسع، ومبالغة للتطبيقات الصغيرة
- إطلاق Pokémon GO عام 2016 (حركة أعلى بـ50 ضعفاً من المتوقع) يُظهر لماذا يهم التنسيق التصريحي ذاتي التوسّع على نطاق واقعي

**التالي:** البنية التحتية ككود — التصريح ليس بالحاويات فقط بل بالبيئات كاملة.`,
      },
    },
  ],
};
