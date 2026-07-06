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
      type: "text",
      body: {
        en: `## High availability: designing for failure 🛡️

Every piece of hardware eventually fails — disks die, servers reboot, entire data centers can lose power. **High availability (HA)** is the architecture discipline of designing systems that keep running *despite* individual failures, instead of hoping failures never happen.

The core technique is **redundancy**: never have a single point of failure. Concretely, this means:

- **Multiple servers, not one** — behind a load balancer, so if one crashes, traffic simply flows to the others.
- **Multiple Availability Zones** — as you learned in AWS Core Services, spreading servers across 2-3 AZs survives a whole data-center outage.
- **Database replicas** — a primary database plus one or more standby copies that can take over (failover) if the primary dies.
- **Health checks** — automated pings that detect a failed server and pull it out of rotation *before* users notice.

HA is measured in "nines" of uptime: 99.9% ("three nines") allows about 8.7 hours of downtime a year; 99.99% ("four nines") allows only about 52 minutes. Each additional nine is dramatically more expensive and complex to achieve — which is why the Well-Architected Framework's reliability pillar is a genuine engineering trade-off, not just "add more servers." A well-designed architecture picks the availability target that actually matches the business need, then builds redundancy to hit it — no more, no less.`,
        ar: `## التوفر العالي: التصميم لمواجهة الأعطال 🛡️

كل قطعة عتاد تتعطّل يوماً ما — الأقراص تموت، الخوادم تعيد التشغيل، مراكز بيانات كاملة قد تفقد الطاقة. **التوفر العالي (High Availability)** هو انضباط معماري لتصميم أنظمة تستمر بالعمل *رغم* الأعطال الفردية، بدل التأمل ألا تحدث أبداً.

التقنية الجوهرية هي **التكرار (redundancy)**: لا تملك أبداً نقطة فشل واحدة. عملياً هذا يعني:

- **خوادم متعددة، لا خادماً واحداً** — خلف موازِن حِمل، فإن تعطّل واحد، يتدفق الحِمل ببساطة للآخرين.
- **مناطق توفر متعددة** — كما تعلمت في خدمات AWS الأساسية، التوزيع عبر 2-3 مناطق توفر ينجو من انقطاع مركز بيانات كامل.
- **نسخ قاعدة بيانات احتياطية** — قاعدة بيانات رئيسية بالإضافة إلى نسخة احتياطية أو أكثر يمكنها التولّي (failover) إن ماتت الرئيسية.
- **فحوصات الصحة** — نبضات آلية تكتشف خادماً معطلاً وتُخرجه من الدوران *قبل* أن يلاحظ المستخدمون.

يُقاس التوفر العالي بـ"تسعات" وقت التشغيل: 99.9% ("ثلاث تسعات") تسمح بنحو 8.7 ساعة تعطّل سنوياً؛ و99.99% ("أربع تسعات") تسمح بنحو 52 دقيقة فقط. كل تسعة إضافية أكثر تكلفة وتعقيداً بشكل هائل — لهذا ركيزة الموثوقية في إطار AWS جيد المعمارية مقايضة هندسية حقيقية، لا مجرد "أضِف خوادم أكثر". المعمارية جيدة التصميم تختار هدف التوفر الذي يناسب فعلاً حاجة العمل، ثم تبني التكرار لتحقيقه — لا أكثر ولا أقل.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: "**Build a high-availability checker.** Write `isHighlyAvailable(numAzs, hasReplica)` — `numAzs` is how many Availability Zones your servers run in, `hasReplica` is whether your database has a standby replica. Return `true` only if `numAzs >= 2` AND `hasReplica` is `true` — otherwise `false`. This mirrors the real architecture-review checklist: redundant compute across AZs *and* a database that can fail over.",
        ar: "**ابنِ فاحص توفر عالٍ.** اكتب `isHighlyAvailable(numAzs, hasReplica)` — `numAzs` عدد مناطق التوفر التي تعمل فيها خوادمك، و`hasReplica` هل لقاعدة بياناتك نسخة احتياطية. أعِد `true` فقط إذا كان `numAzs >= 2` و`hasReplica` تساوي `true` — وإلا `false`. هذا يحاكي قائمة فحص المراجعة المعمارية الحقيقية: حوسبة متكررة عبر مناطق توفر *و*قاعدة بيانات قادرة على التولّي.",
      },
      starterCode: `function isHighlyAvailable(numAzs, hasReplica) {
  // TODO: return true only if numAzs >= 2 AND hasReplica
}
`,
      solution: `function isHighlyAvailable(numAzs, hasReplica) {
  return numAzs >= 2 && hasReplica;
}
`,
      hints: [
        { en: "Both conditions must be true at once — use &&.", ar: "يجب أن يتحقق الشرطان معاً — استخدم &&." },
        { en: "numAzs >= 2 handles the compute redundancy; hasReplica handles the database.", ar: "numAzs >= 2 يغطي تكرار الحوسبة؛ وhasReplica يغطي قاعدة البيانات." },
      ],
      tests: [
        { name: { en: "2 AZs with replica is HA", ar: "منطقتا توفر مع نسخة احتياطية = توفر عالٍ" }, check: `isHighlyAvailable(2, true) === true` },
        { name: { en: "1 AZ is never HA", ar: "منطقة توفر واحدة ليست توفراً عالياً أبداً" }, check: `isHighlyAvailable(1, true) === false` },
        { name: { en: "No replica is never HA", ar: "بلا نسخة احتياطية ليست توفراً عالياً أبداً" }, check: `isHighlyAvailable(3, false) === false` },
      ],
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
      type: "text",
      body: {
        en: `## Real-world case study: The 2021 Fastly outage 🔍

On June 8, 2021, a single customer somewhere in the world made a valid configuration change on Fastly, a major content-delivery-network (CDN) provider. That change triggered a latent software bug, and within about a minute, 85% of Fastly's global network started returning errors — knocking major sites like Amazon, Reddit, The New York Times, and the UK government's website offline or badly degraded for roughly an hour.

The architectural lesson is layered: these companies had done real work on reliability — multiple servers, multiple regions, redundant everything — but they had all placed a *shared dependency* on the same CDN layer in front of it all. When that one shared layer failed, all the redundancy behind it didn't matter, because the failure was upstream of it.

Fastly fixed the bug and rolled out the change globally within about 49 minutes, which is itself a case study in fast incident response. But the broader lesson for architects is that reliability isn't just "add redundant servers" — it requires mapping every dependency, including third-party ones like CDNs and DNS providers, and asking "if *this* fails, does everything downstream fail with it?"`,
        ar: `## دراسة حالة واقعية: انقطاع Fastly عام 2021 🔍

في 8 يونيو 2021، أجرى عميل واحد في مكان ما بالعالم تغيير إعداد صالحاً على Fastly، مزوّد شبكة توصيل محتوى (CDN) كبير. أطلق ذلك التغيير خللاً برمجياً كامناً، وخلال نحو دقيقة، بدأت 85% من شبكة Fastly العالمية بإرجاع أخطاء — ما أوقع مواقع كبرى مثل Amazon وReddit وThe New York Times وموقع الحكومة البريطانية دون اتصال أو بأداء سيئ جداً لنحو ساعة.

الدرس المعماري متعدد الطبقات: كانت هذه الشركات قد أنجزت عملاً حقيقياً في الموثوقية — خوادم متعددة، مناطق متعددة، تكرار في كل شيء — لكنها جميعاً وضعت *اعتماداً مشتركاً* على نفس طبقة CDN أمام كل ذلك. حين تعطّلت تلك الطبقة المشتركة الواحدة، لم يعد كل التكرار خلفها مهماً، لأن العطل كان أعلى منها في السلسلة.

أصلحت Fastly الخلل ونشرت التغيير عالمياً خلال نحو 49 دقيقة، وهذا بحد ذاته دراسة حالة في الاستجابة السريعة للحوادث. لكن الدرس الأوسع للمهندسين المعماريين أن الموثوقية ليست فقط "أضِف خوادم متكررة" — بل تتطلب رسم كل اعتماد، بما فيه اعتمادات الأطراف الثالثة مثل CDNs ومزوّدي DNS، وسؤال "إن تعطّل *هذا*، هل يتعطّل كل ما تحته معه؟"`,
      },
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
        {
          q: { en: "What does 'high availability' (HA) mean in architecture?", ar: "ماذا يعني 'التوفر العالي' في المعمارية؟" },
          choices: [
            { en: "Designing systems with redundancy so they keep running despite individual failures", ar: "تصميم أنظمة بتكرار بحيث تستمر بالعمل رغم الأعطال الفردية" },
            { en: "Making sure only one server ever runs the app", ar: "التأكد من أن خادماً واحداً فقط يشغّل التطبيق دائماً" },
            { en: "Hoping hardware never fails", ar: "الأمل ألا يتعطّل العتاد أبداً" },
          ],
          answer: 0,
          explain: {
            en: "HA assumes failure is inevitable and builds redundancy (multiple servers, AZs, database replicas) so no single failure takes the system down.",
            ar: "التوفر العالي يفترض أن العطل حتمي ويبني تكراراً (خوادم متعددة، مناطق توفر، نسخ قاعدة بيانات) بحيث لا يُسقط عطل واحد النظام.",
          },
        },
        {
          q: { en: "What was the deeper architectural lesson from the 2021 Fastly outage?", ar: "ما الدرس المعماري الأعمق من انقطاع Fastly عام 2021؟" },
          choices: [
            { en: "A shared upstream dependency (like a CDN) can defeat all the redundancy built behind it", ar: "اعتماد مشترك أعلى في السلسلة (مثل CDN) يمكن أن يبطل كل التكرار المبني خلفه" },
            { en: "CDNs are never worth using", ar: "شبكات CDN لا تستحق الاستخدام أبداً" },
            { en: "Only Fastly's own customers were affected", ar: "تأثر عملاء Fastly فقط" },
          ],
          answer: 0,
          explain: {
            en: "Sites with solid multi-server, multi-region redundancy still went down because they all shared a single CDN layer that failed upstream of their redundancy.",
            ar: "مواقع بتكرار قوي متعدد الخوادم والمناطق تعطّلت رغم ذلك لأنها شاركت جميعاً طبقة CDN واحدة تعطّلت أعلى من تكرارها.",
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
- High availability (redundancy across servers, AZs, and databases) and why shared dependencies like CDNs still need scrutiny

**Path to paid work:** get a certification (start with **AWS Cloud Practitioner**, then Solutions Architect Associate), build a small architecture on the AWS Free Tier, define it with Terraform, and put it on GitHub. Cloud skills are among the highest-paid in tech, and cost-aware architects are always in demand. Combine with the "Getting Paid" lesson and go land a role! ☁️`,
        ar: `## اكتمل المسار! 🎓

أساس السحابة لديك مبنيّ:

- أساسيات تقنية المعلومات + مفاهيم السحابة (IaaS/PaaS/SaaS)
- خدمات AWS الأساسية، الشبكات (VPC)، وIaC
- الأمن، بلا خادم والحاويات، والمعمارية بوعي التكلفة
- التوفر العالي (تكرار عبر الخوادم ومناطق التوفر وقواعد البيانات) ولماذا الاعتمادات المشتركة مثل CDNs ما زالت تحتاج تدقيقاً

**طريق العمل المدفوع:** احصل على شهادة (ابدأ بـ **AWS Cloud Practitioner** ثم Solutions Architect Associate)، ابنِ معمارية صغيرة على طبقة AWS المجانية، عرّفها بـ Terraform، وضعها على GitHub. مهارات السحابة من أعلى الأجور في التقنية، ومهندسو التكلفة الواعون مطلوبون دائماً. اجمعها مع درس "التكسّب" واذهب لتحصل على وظيفة! ☁️`,
      },
    },
  ],
};
