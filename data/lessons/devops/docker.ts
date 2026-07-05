import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "docker",
  title: { en: "Docker — Containers for DevOps", ar: "Docker — الحاويات لـ DevOps" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Containers vs virtual machines (why containers won)
- The Dockerfile → image → container flow
- Docker's role in the DevOps pipeline
- The commands you'll run daily`,
        ar: `## ماذا ستتعلم

- الحاويات مقابل الأجهزة الافتراضية (لماذا انتصرت الحاويات)
- تدفق Dockerfile ← صورة ← حاوية
- دور Docker في خط DevOps
- الأوامر التي ستشغّلها يومياً`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The container, DevOps-style 📦

You met Docker in the backend track as the fix for "works on my machine." For DevOps, it's the **standard unit of deployment** — the thing pipelines build and ship.

**Containers vs Virtual Machines** — why containers took over:
- A **VM** virtualizes a *whole computer*, including a full guest operating system. It's heavy (gigabytes) and slow to start (minutes).
- A **container** shares the host's OS kernel and packages *just your app + its dependencies*. It's tiny (megabytes) and starts in *milliseconds*.

Think of VMs as separate houses (each with its own foundation, plumbing, everything) and containers as apartments in one building (sharing the structure, but isolated inside). You can run *far* more containers than VMs on the same hardware — which is exactly what you want when deploying and scaling.

**The core flow** (recap, now as your daily DevOps loop):
\`\`\`
Dockerfile  →  docker build  →  Image  →  docker run  →  Container
(the recipe)                   (the box)              (running app)
\`\`\`

The everyday commands:
- \`docker build -t myapp .\` — build an image from the Dockerfile in this folder.
- \`docker run myapp\` — start a container from that image.
- \`docker ps\` — list running containers.
- \`docker push myapp\` — upload the image to a registry (like Docker Hub) so servers can pull it.

**Where it fits in DevOps:** your CI/CD pipeline (next lesson) builds a Docker image on every push, tests it, pushes it to a registry, and deploys that exact image to production. Because the image is identical everywhere, "it worked in testing" reliably means "it works in production." Containers make deployments predictable — the foundation everything else in DevOps stands on.`,
        ar: `## الحاوية، بأسلوب DevOps 📦

قابلت Docker في مسار الخلفية كحلّ لـ "يعمل على جهازي". في DevOps، إنه **وحدة النشر القياسية** — ما تبنيه الخطوط وتشحنه.

**الحاويات مقابل الأجهزة الافتراضية** — لماذا اجتاحت الحاويات:
- **الجهاز الافتراضي (VM)** يحاكي *حاسوباً كاملاً*، بما فيه نظام تشغيل ضيف كامل. ثقيل (جيجابايتات) وبطيء الإقلاع (دقائق).
- **الحاوية** تتشارك نواة نظام المضيف وتحزم *تطبيقك + اعتمادياته فقط*. صغيرة (ميجابايتات) وتقلع في *أجزاء من الثانية*.

فكّر في الأجهزة الافتراضية كبيوت منفصلة (لكلٍّ أساسه وسباكته وكل شيء) والحاويات كشقق في مبنى واحد (تتشارك الهيكل، لكنها معزولة داخلياً). تشغّل حاويات *أكثر بكثير* من الأجهزة الافتراضية على نفس العتاد — وهو بالضبط ما تريده عند النشر والتوسّع.

**التدفق الأساسي** (تلخيص، الآن كحلقتك اليومية في DevOps):
\`\`\`
Dockerfile  →  docker build  →  صورة  →  docker run  →  حاوية
(الوصفة)                     (الصندوق)              (تطبيق عامل)
\`\`\`

الأوامر اليومية:
- \`docker build -t myapp .\` — ابنِ صورة من Dockerfile في هذا المجلد.
- \`docker run myapp\` — شغّل حاوية من تلك الصورة.
- \`docker ps\` — اعرض الحاويات العاملة.
- \`docker push myapp\` — ارفع الصورة إلى مستودع (مثل Docker Hub) لتسحبها الخوادم.

**أين يندمج في DevOps:** خط CI/CD (الدرس التالي) يبني صورة Docker مع كل دفعة، يختبرها، يدفعها لمستودع، وينشر تلك الصورة بالضبط للإنتاج. ولأن الصورة متطابقة في كل مكان، "نجح في الاختبار" يعني بموثوقية "يعمل في الإنتاج". الحاويات تجعل النشر متوقعاً — الأساس الذي يقف عليه كل شيء آخر في DevOps.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "How does a container differ from a virtual machine?", ar: "كيف تختلف الحاوية عن الجهاز الافتراضي؟" },
          choices: [
            { en: "A container shares the host OS kernel; a VM includes a full guest OS", ar: "الحاوية تتشارك نواة نظام المضيف؛ والجهاز الافتراضي يتضمن نظام ضيف كامل" },
            { en: "They are identical", ar: "متطابقان" },
            { en: "Containers are larger and slower", ar: "الحاويات أكبر وأبطأ" },
          ],
          answer: 0,
          explain: {
            en: "Containers are lightweight (share the kernel, package just the app) — MBs and milliseconds vs a VM's GBs and minutes.",
            ar: "الحاويات خفيفة (تتشارك النواة، تحزم التطبيق فقط) — ميجابايتات وأجزاء ثانية مقابل جيجابايتات ودقائق للجهاز الافتراضي.",
          },
        },
        {
          q: { en: "What's the correct Docker flow?", ar: "ما تدفق Docker الصحيح؟" },
          choices: [
            { en: "Dockerfile → build → image → run → container", ar: "Dockerfile ← build ← صورة ← run ← حاوية" },
            { en: "Container → image → Dockerfile", ar: "حاوية ← صورة ← Dockerfile" },
            { en: "Image → Dockerfile → run", ar: "صورة ← Dockerfile ← run" },
          ],
          answer: 0,
          explain: {
            en: "Write the Dockerfile (recipe), build it into an image (box), then run the image to get a live container.",
            ar: "اكتب Dockerfile (الوصفة)، ابنِه صورة (صندوق)، ثم شغّل الصورة لتحصل على حاوية حيّة.",
          },
        },
        {
          q: { en: "Why do containers make DevOps deployments predictable?", ar: "لماذا تجعل الحاويات نشر DevOps متوقعاً؟" },
          choices: [
            { en: "The identical image runs the same in testing and production", ar: "الصورة المتطابقة تعمل بنفس الشكل في الاختبار والإنتاج" },
            { en: "They delete bugs automatically", ar: "تحذف الأخطاء تلقائياً" },
            { en: "They make code run faster", ar: "تجعل الكود أسرع" },
          ],
          answer: 0,
          explain: {
            en: "Same image everywhere means 'passed in testing' reliably equals 'works in production' — no environment surprises.",
            ar: "نفس الصورة في كل مكان يعني 'نجح في الاختبار' يساوي بموثوقية 'يعمل في الإنتاج' — بلا مفاجآت بيئة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Containers share the host kernel — tiny and fast vs heavyweight VMs
- Flow: Dockerfile → build → image → run → container; push to a registry
- Docker is the DevOps unit of deployment: build once, run identically everywhere
- Predictable images make "works in prod" reliable

**Next:** CI/CD Pipelines — the automation that builds, tests, and ships these containers on every commit.`,
        ar: `## الخلاصة

- الحاويات تتشارك نواة المضيف — صغيرة وسريعة مقابل الأجهزة الافتراضية الثقيلة
- التدفق: Dockerfile ← build ← صورة ← run ← حاوية؛ ادفع لمستودع
- Docker وحدة النشر في DevOps: ابنِ مرة، شغّل بشكل مطابق في كل مكان
- الصور المتوقعة تجعل "يعمل في الإنتاج" موثوقاً

**التالي:** خطوط CI/CD — الأتمتة التي تبني وتختبر وتشحن هذه الحاويات مع كل commit.`,
      },
    },
  ],
};
