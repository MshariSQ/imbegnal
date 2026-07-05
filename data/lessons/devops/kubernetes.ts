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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Kubernetes orchestrates hundreds of containers across a cluster
- Pods run on nodes; you declare desired state and K8s enforces it
- Self-healing, auto-scaling, rolling updates, load balancing come for free
- Powerful but complex — worth it at scale, overkill for small apps

**Next:** Infrastructure as Code — declaring not just containers but entire environments.`,
        ar: `## الخلاصة

- Kubernetes ينسّق مئات الحاويات عبر عنقود
- الـ Pods تعمل على nodes؛ تُصرّح بالحالة المطلوبة وينفّذها K8s
- الشفاء الذاتي، التوسّع التلقائي، التحديثات المتدرّجة، موازنة الحِمل مجاناً
- قوي لكن معقّد — يستحق على نطاق واسع، ومبالغة للتطبيقات الصغيرة

**التالي:** البنية التحتية ككود — التصريح ليس بالحاويات فقط بل بالبيئات كاملة.`,
      },
    },
  ],
};
