import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "cloud-architecture",
  title: { en: "Cloud Architecture — Designing Real Systems", ar: "معمارية السحابة — تصميم أنظمة حقيقية" },
  estMinutes: 35,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- How the pieces combine into a real architecture
- The pillars: reliability, cost, security, performance
- **Cost awareness** — the skill that gets you promoted
- You'll build a cloud cost calculator`,
        ar: `## ماذا ستتعلم

- كيف تتكامل القطع في معمارية حقيقية
- الركائز: الموثوقية، التكلفة، الأمن، الأداء
- **الوعي بالتكلفة** — المهارة التي تُرقّيك
- ستبني حاسبة تكلفة سحابية`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Putting the LEGO together 🏗️

You now know the pieces: servers (EC2), storage (S3), databases (RDS), functions (Lambda), networks (VPC), containers, and IaC. **Cloud architecture** is combining them wisely into a system that is reliable, secure, fast, and affordable.

A well-architected web app often looks like:

\`\`\`
Users
  ↓
CDN (cached copies worldwide, fast delivery)
  ↓
Load balancer (spreads traffic)
  ↓
Auto-scaling group of servers/containers (grows with demand)
  ↓
Database (with read replicas) + S3 (files) + cache (Redis)
\`\`\`

Notice this reuses ideas from the whole course: load balancers and replicas (backend system design), caching (backend), VPC isolation (cloud networking), auto-scaling (cloud elasticity). Architecture is *composition*.

**AWS's "Well-Architected Framework"** names the pillars to balance — a great checklist for any design:
- **Reliability** — survives failures (multiple availability zones, backups).
- **Security** — least privilege, encryption, private subnets.
- **Performance** — right-sized resources, caching, CDNs.
- **Cost optimization** — don't pay for what you don't need.
- **Operational excellence** — monitoring, automation, IaC.

**The pillar juniors ignore and seniors obsess over: COST.** The cloud's pay-as-you-go is a double-edged sword — it's easy to accidentally run up a huge bill (a forgotten large server, un-deleted storage, a runaway function). Companies pay real money here, so an engineer who can **estimate and control cloud costs** is hugely valuable. Simple wins: shut down idle resources, right-size servers (don't run a giant machine for a tiny load), use serverless for spiky work, and set billing alerts.

Being able to answer "what will this design cost per month, and how do we cut it 30%?" is what turns a cloud practitioner into a cloud *architect*.`,
        ar: `## تجميع الليغو 🏗️

تعرف الآن القطع: خوادم (EC2)، تخزين (S3)، قواعد بيانات (RDS)، دوال (Lambda)، شبكات (VPC)، حاويات، وIaC. **معمارية السحابة** هي دمجها بحكمة في نظام موثوق وآمن وسريع وميسور التكلفة.

تطبيق ويب جيد المعمارية غالباً يبدو:

\`\`\`
المستخدمون
  ↓
CDN (نسخ مخزّنة حول العالم، توصيل سريع)
  ↓
موازِن الحِمل (يوزّع البيانات)
  ↓
مجموعة خوادم/حاويات ذاتية التوسّع (تنمو مع الطلب)
  ↓
قاعدة بيانات (بنسخ قراءة) + S3 (ملفات) + ذاكرة مؤقتة (Redis)
\`\`\`

لاحظ أن هذا يعيد استخدام أفكار المسار كله: موازِنات الحِمل والنسخ (تصميم أنظمة الخلفية)، التخزين المؤقت (الخلفية)، عزل VPC (شبكات السحابة)، التوسّع التلقائي (مرونة السحابة). المعمارية *تركيب*.

**"إطار AWS جيد المعمارية"** يسمّي الركائز التي توازنها — قائمة فحص رائعة لأي تصميم:
- **الموثوقية** — ينجو من الأعطال (مناطق توفّر متعددة، نسخ احتياطية).
- **الأمن** — أقل صلاحية، تشفير، شبكات خاصة.
- **الأداء** — موارد بالحجم المناسب، تخزين مؤقت، CDNs.
- **تحسين التكلفة** — لا تدفع لما لا تحتاج.
- **التميّز التشغيلي** — مراقبة، أتمتة، IaC.

**الركيزة التي يتجاهلها المبتدئون ويهووس بها الخبراء: التكلفة.** الدفع حسب الاستخدام سيف ذو حدّين — يسهل أن تراكم فاتورة ضخمة بالخطأ (خادم كبير منسيّ، تخزين غير محذوف، دالة جامحة). الشركات تدفع مالاً حقيقياً هنا، فالمهندس القادر على **تقدير تكاليف السحابة والتحكّم بها** قيّم جداً. مكاسب بسيطة: أطفئ الموارد الخاملة، اضبط حجم الخوادم (لا تشغّل آلة عملاقة لحِمل ضئيل)، استخدم بلا خادم للعمل المتقطّع، واضبط تنبيهات الفوترة.

القدرة على الإجابة "كم يكلّف هذا التصميم شهرياً، وكيف نخفضه 30%؟" هي ما يحوّل ممارس السحابة إلى *مهندس* سحابة.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Build a cloud cost estimator. Write \`monthlyCost(servers, pricePerHour)\` that returns the monthly cost: \`servers × pricePerHour × 24 × 30\` (assume a 30-day month).

Example: \`monthlyCost(2, 0.05)\` → 2 servers × $0.05/hr × 720 hrs = \`72\``,
        ar: `ابنِ مقدّر تكلفة سحابية. اكتب \`monthlyCost(servers, pricePerHour)\` تعيد التكلفة الشهرية: \`servers × pricePerHour × 24 × 30\` (افترض شهراً من 30 يوماً).

مثال: \`monthlyCost(2, 0.05)\` ← خادمان × 0.05$/ساعة × 720 ساعة = \`72\``,
      },
      starterCode: `function monthlyCost(servers, pricePerHour) {
  // hours in a month = 24 * 30 = 720
}

console.log(monthlyCost(2, 0.05));  // 72
console.log(monthlyCost(1, 0.10));  // 72`,
      solution: `function monthlyCost(servers, pricePerHour) {
  const hoursPerMonth = 24 * 30;
  return servers * pricePerHour * hoursPerMonth;
}

console.log(monthlyCost(2, 0.05));  // 72
console.log(monthlyCost(1, 0.10));  // 72`,
      hints: [
        { en: `Hours per month = 24 * 30 = 720.`, ar: `ساعات الشهر = 24 * 30 = 720.` },
        { en: `Return servers * pricePerHour * 720.`, ar: `أعِد servers * pricePerHour * 720.` },
      ],
      tests: [
        { name: { en: "2 servers at $0.05 → 72", ar: "خادمان بـ 0.05$ ← 72" }, check: `monthlyCost(2, 0.05) === 72` },
        { name: { en: "Zero servers cost 0", ar: "صفر خوادم تكلفتها 0" }, check: `monthlyCost(0, 0.10) === 0` },
        { name: { en: "10 servers at $0.20 → 1440", ar: "10 خوادم بـ 0.20$ ← 1440" }, check: `monthlyCost(10, 0.20) === 1440` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Cloud architecture is mainly about…", ar: "معمارية السحابة أساساً عن…" },
          choices: [
            { en: "Combining cloud services wisely into reliable, secure, cost-effective systems", ar: "دمج خدمات السحابة بحكمة في أنظمة موثوقة وآمنة وميسورة التكلفة" },
            { en: "Writing one giant function", ar: "كتابة دالة عملاقة واحدة" },
            { en: "Buying the most servers", ar: "شراء أكثر الخوادم" },
          ],
          answer: 0,
          explain: {
            en: "It's composition: load balancers, auto-scaling, databases, caches, CDNs assembled to meet the pillars.",
            ar: "إنها تركيب: موازِنات حِمل، توسّع تلقائي، قواعد بيانات، ذواكر، CDNs مجمّعة لتحقيق الركائز.",
          },
        },
        {
          q: { en: "Which skill separates a senior cloud engineer?", ar: "أي مهارة تميّز مهندس السحابة الخبير؟" },
          choices: [
            { en: "Estimating and controlling cost", ar: "تقدير التكلفة والتحكّم بها" },
            { en: "Typing faster", ar: "الطباعة أسرع" },
            { en: "Using every service at once", ar: "استخدام كل خدمة دفعة واحدة" },
          ],
          answer: 0,
          explain: {
            en: "Cloud bills are real money. Engineers who right-size, shut down idle resources, and forecast cost are highly valued.",
            ar: "فواتير السحابة مال حقيقي. المهندسون الذين يضبطون الأحجام ويطفئون الخامل ويتوقعون التكلفة قيّمون جداً.",
          },
        },
        {
          q: { en: "A quick way to cut cloud costs is…", ar: "طريقة سريعة لخفض تكاليف السحابة هي…" },
          choices: [
            { en: "Shut down idle resources and right-size servers", ar: "أطفئ الموارد الخاملة واضبط حجم الخوادم" },
            { en: "Always buy the biggest server", ar: "اشترِ دائماً أكبر خادم" },
            { en: "Never use billing alerts", ar: "لا تستخدم تنبيهات الفوترة أبداً" },
          ],
          answer: 0,
          explain: {
            en: "Turn off what you're not using and match server size to actual load. Billing alerts catch runaway costs early.",
            ar: "أطفئ ما لا تستخدمه وطابِق حجم الخادم مع الحِمل الفعلي. وتنبيهات الفوترة تلتقط التكاليف الجامحة مبكراً.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Track complete! 🎓

Your cloud foundation is built:

- IT fundamentals + cloud concepts (IaaS/PaaS/SaaS)
- AWS core services, networking (VPC), and IaC
- Security, serverless & containers, and architecture with cost awareness

**Path to paid work:** get a certification (start with **AWS Cloud Practitioner**, then Solutions Architect Associate), build a small architecture on the AWS Free Tier, define it with Terraform, and put it on GitHub. Cloud skills are among the highest-paid in tech, and cost-aware architects are always in demand. Combine with the "Getting Paid" lesson and go land a role! ☁️`,
        ar: `## اكتمل المسار! 🎓

أساس السحابة لديك مبنيّ:

- أساسيات تقنية المعلومات + مفاهيم السحابة (IaaS/PaaS/SaaS)
- خدمات AWS الأساسية، الشبكات (VPC)، وIaC
- الأمن، بلا خادم والحاويات، والمعمارية بوعي التكلفة

**طريق العمل المدفوع:** احصل على شهادة (ابدأ بـ **AWS Cloud Practitioner** ثم Solutions Architect Associate)، ابنِ معمارية صغيرة على طبقة AWS المجانية، عرّفها بـ Terraform، وضعها على GitHub. مهارات السحابة من أعلى الأجور في التقنية، ومهندسو التكلفة الواعون مطلوبون دائماً. اجمعها مع درس "التكسّب" واذهب لتحصل على وظيفة! ☁️`,
      },
    },
  ],
};
