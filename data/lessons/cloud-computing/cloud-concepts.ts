import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "cloud-concepts",
  title: { en: "Cloud Concepts — IaaS, PaaS, SaaS", ar: "مفاهيم السحابة — IaaS و PaaS و SaaS" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why the cloud took over the world
- The three service models: **IaaS, PaaS, SaaS**
- Key benefits: elasticity, pay-as-you-go
- The pizza analogy that makes it all click`,
        ar: `## ماذا ستتعلم

- لماذا اجتاحت السحابة العالم
- نماذج الخدمة الثلاثة: **IaaS و PaaS و SaaS**
- الفوائد الأساسية: المرونة، الدفع حسب الاستخدام
- تشبيه البيتزا الذي يوضّح كل شيء`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Pizza as a Service 🍕

The three cloud models describe **how much the provider handles for you**. The classic way to understand them is making pizza:

- **On-premises** = make pizza at home. You buy everything, own the kitchen, do all the work. (Your own servers.)
- **IaaS** (Infrastructure as a Service) = buy a frozen pizza kit. The provider gives you the raw ingredients (virtual servers, storage, networking); *you* assemble and bake. You manage the OS and app. Example: AWS EC2. Maximum control, maximum responsibility.
- **PaaS** (Platform as a Service) = pizza delivery. You just say what you want; they cook and deliver; you provide the table and drinks. The provider manages servers and OS; *you* just deploy your code. Example: Heroku, Vercel, Google App Engine. Less control, way less hassle.
- **SaaS** (Software as a Service) = eat at a restaurant. You do nothing but enjoy the finished product. Fully managed software you just *use*. Examples: Gmail, Netflix, Google Docs, this very website.

The pattern: **top to bottom, the provider does more and you do less.**

**Why the cloud won** — the benefits are enormous:
- **Pay-as-you-go** — no huge upfront hardware cost; rent by the hour/second. A startup can launch for pennies.
- **Elasticity** — automatically scale up for a traffic spike (Black Friday!) and back down after, paying only for what you used. Owning servers means buying for your *peak* and wasting them the rest of the time.
- **Global reach** — deploy in data centers worldwide in minutes.
- **No maintenance** — the provider handles hardware failures, power, cooling, security patches.

That shift — from a huge upfront investment in machines you maintain, to a flexible utility you rent like electricity — is why nearly every modern company runs on the cloud.`,
        ar: `## البيتزا كخدمة 🍕

نماذج السحابة الثلاثة تصف **كم يتولّى المزوّد عنك**. الطريقة الكلاسيكية لفهمها صناعة البيتزا:

- **في الموقع (On-premises)** = اصنع البيتزا في البيت. تشتري كل شيء، تملك المطبخ، تؤدي كل العمل. (خوادمك الخاصة.)
- **IaaS** (البنية التحتية كخدمة) = اشترِ طقم بيتزا مجمّدة. يعطيك المزوّد المكوّنات الخام (خوادم افتراضية، تخزين، شبكة)؛ و*أنت* تجمّع وتخبز. تدير نظام التشغيل والتطبيق. مثال: AWS EC2. أقصى تحكّم، أقصى مسؤولية.
- **PaaS** (المنصة كخدمة) = توصيل بيتزا. تقول ما تريد؛ يطبخون ويوصّلون؛ وأنت توفّر الطاولة والمشروبات. يدير المزوّد الخوادم ونظام التشغيل؛ و*أنت* فقط تنشر كودك. مثال: Heroku، Vercel، Google App Engine. تحكّم أقل، عناء أقل بكثير.
- **SaaS** (البرمجيات كخدمة) = كُل في مطعم. لا تفعل شيئاً سوى الاستمتاع بالمنتج الجاهز. برمجيات مُدارة بالكامل *تستخدمها* فقط. أمثلة: Gmail، Netflix، Google Docs، وهذا الموقع نفسه.

النمط: **من الأعلى للأسفل، المزوّد يفعل أكثر وأنت تفعل أقل.**

**لماذا انتصرت السحابة** — الفوائد هائلة:
- **الدفع حسب الاستخدام** — بلا تكلفة عتاد أولية ضخمة؛ استأجر بالساعة/الثانية. شركة ناشئة تنطلق بقروش.
- **المرونة (Elasticity)** — توسّع تلقائياً لموجة ضغط (الجمعة البيضاء!) ثم انكمش بعدها، وادفع فقط مقابل ما استخدمت. امتلاك الخوادم يعني الشراء لـ*ذروتك* وإهدارها بقية الوقت.
- **الوصول العالمي** — انشر في مراكز بيانات حول العالم بدقائق.
- **بلا صيانة** — المزوّد يتولّى أعطال العتاد والطاقة والتبريد والتحديثات الأمنية.

ذلك التحوّل — من استثمار أولي ضخم في آلات تصونها، إلى مرفق مرن تستأجره كالكهرباء — هو لماذا تعمل كل شركة حديثة تقريباً على السحابة.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Multi-cloud and the vendor lock-in trap 🔗

Once a company builds deeply on one provider's unique services, switching becomes painful — this is **vendor lock-in**. It's like renovating your kitchen entirely around one company's proprietary appliances: perfectly fine until you want to switch brands and discover nothing else fits the cabinets.

Lock-in happens gradually: you start using AWS's proprietary Lambda triggers, its specific database quirks, its unique networking setup — each convenient on its own, but together they make your app *only* runnable on AWS. Rewriting all of that to move to Azure could take months and cost a fortune.

Some companies respond with a **multi-cloud** strategy — deliberately spreading workloads across two or more providers (say, AWS *and* Google Cloud). Reasons include:
- **Avoiding lock-in** — negotiating leverage and a fallback if one provider raises prices or has an outage.
- **Best-of-breed** — using each provider's strongest service (e.g. one cloud's AI tools, another's database).
- **Regulatory/geographic requirements** — some countries require certain data to stay with a local or specific provider.

The trade-off is real, though: multi-cloud means your team must learn multiple platforms, duplicate tooling, and manage more complexity — often *increasing* cost and effort rather than reducing it. Most companies deliberately stay single-cloud and manage lock-in risk instead by favoring open standards (containers, Kubernetes, Terraform) that are easier to move between providers than each provider's proprietary services. Multi-cloud is a serious architectural decision, not a free win.`,
        ar: `## السحابة المتعددة وفخ الارتباط بالمزوّد 🔗

حين تبني شركة بعمق على خدمات فريدة لمزوّد واحد، يصبح التبديل مؤلماً — هذا **الارتباط بالمزوّد (vendor lock-in)**. مثل تجديد مطبخك بالكامل حول أجهزة خاصة بشركة واحدة: يعمل تماماً حتى تريد تبديل العلامة التجارية فتكتشف أن لا شيء آخر يناسب الخزائن.

يحدث الارتباط تدريجياً: تبدأ باستخدام محفّزات Lambda الخاصة بـ AWS، وخصائص قاعدة بياناتها المحددة، وإعداد شبكتها الفريد — كل واحدة مريحة بمفردها، لكنها معاً تجعل تطبيقك يعمل *فقط* على AWS. إعادة كتابة كل ذلك للانتقال إلى Azure قد تستغرق أشهراً وتكلّف ثروة.

بعض الشركات تستجيب باستراتيجية **السحابة المتعددة (multi-cloud)** — توزيع الأحمال عمداً عبر مزوّدين أو أكثر (مثلاً AWS *و*Google Cloud). الأسباب تشمل:
- **تجنّب الارتباط** — نفوذ تفاوضي وبديل احتياطي إن رفع مزوّد الأسعار أو تعطّل.
- **الأفضل في كل مجال** — استخدام أقوى خدمة لكل مزوّد (مثلاً أدوات ذكاء اصطناعي لسحابة، وقاعدة بيانات لأخرى).
- **متطلبات تنظيمية/جغرافية** — بعض الدول تشترط بقاء بيانات معينة مع مزوّد محلي أو محدد.

لكن المقايضة حقيقية: السحابة المتعددة تعني أن فريقك يجب أن يتعلّم منصات متعددة، ويكرّر الأدوات، ويدير تعقيداً أكبر — غالباً *يزيد* التكلفة والجهد بدل تقليلهما. معظم الشركات تبقى عمداً على سحابة واحدة وتدير خطر الارتباط بدلاً من ذلك بتفضيل المعايير المفتوحة (الحاويات، Kubernetes، Terraform) الأسهل نقلاً بين المزوّدين من خدمات كل مزوّد الخاصة. السحابة المتعددة قرار معماري جاد، لا مكسباً مجانياً.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: "**Build a service-model classifier.** Write `classifyModel(managesOS, managesApp)` — both booleans meaning \"does the *customer* manage the OS?\" and \"does the *customer* manage the app deployment?\". Return `\"IaaS\"` if the customer manages both, `\"PaaS\"` if the customer manages only the app (not the OS), and `\"SaaS\"` if the customer manages neither. This is the exact decision tree used to categorize any cloud offering.",
        ar: "**ابنِ مصنّف نماذج الخدمة.** اكتب `classifyModel(managesOS, managesApp)` — كلاهما قيمتان منطقيتان تعنيان \"هل *العميل* يدير نظام التشغيل؟\" و\"هل *العميل* يدير نشر التطبيق؟\". أعِد `\"IaaS\"` إذا كان العميل يدير كليهما، و`\"PaaS\"` إذا كان يدير التطبيق فقط (لا نظام التشغيل)، و`\"SaaS\"` إذا لم يدر أياً منهما. هذه شجرة القرار بالضبط المستخدمة لتصنيف أي عرض سحابي.",
      },
      starterCode: `function classifyModel(managesOS, managesApp) {
  // TODO: return "IaaS", "PaaS", or "SaaS"
}
`,
      solution: `function classifyModel(managesOS, managesApp) {
  if (managesOS && managesApp) return "IaaS";
  if (!managesOS && managesApp) return "PaaS";
  return "SaaS";
}
`,
      hints: [
        { en: "If the customer manages the OS, they're always managing the app too — that's IaaS.", ar: "إن كان العميل يدير نظام التشغيل، فهو يدير التطبيق أيضاً دائماً — هذا IaaS." },
        { en: "PaaS = app managed by customer but not the OS. SaaS = neither is managed by the customer.", ar: "PaaS = العميل يدير التطبيق لا نظام التشغيل. SaaS = لا يدير العميل أياً منهما." },
      ],
      tests: [
        { name: { en: "Managing both is IaaS", ar: "إدارة الاثنين IaaS" }, check: `classifyModel(true, true) === "IaaS"` },
        { name: { en: "App only, no OS, is PaaS", ar: "التطبيق فقط بلا نظام تشغيل PaaS" }, check: `classifyModel(false, true) === "PaaS"` },
        { name: { en: "Managing neither is SaaS", ar: "عدم إدارة أي منهما SaaS" }, check: `classifyModel(false, false) === "SaaS"` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Netflix's move to AWS 🔍

In 2008, a database corruption incident in Netflix's own data center halted DVD shipments for three days. That outage pushed Netflix to rethink owning its infrastructure entirely, and it began an eight-year migration of its whole streaming service to AWS — running on IaaS building blocks like EC2 and S3, the same services you learned about in this course.

By January 2016, Netflix had shut down its last owned data centers and moved 100% of its streaming infrastructure to the cloud. The payoff: Netflix can now automatically scale to handle enormous, unpredictable demand spikes (a new season dropping, a regional event) across 190+ countries, without ever buying a single physical server itself.

Netflix's story is often cited as the definitive proof that the cloud's elasticity and managed services can outperform even a tech giant's own data centers — while also illustrating vendor lock-in in practice: Netflix's architecture is now deeply built around AWS-specific services, a trade-off it accepted deliberately for the operational simplicity gained.`,
        ar: `## دراسة حالة واقعية: انتقال Netflix إلى AWS 🔍

في 2008، أوقف حادث تلف قاعدة بيانات في مركز بيانات Netflix الخاص شحن أقراص DVD لثلاثة أيام. دفعت تلك الحادثة Netflix لإعادة التفكير في امتلاك بنيتها التحتية كلياً، فبدأت هجرة استغرقت ثماني سنوات لخدمة البث كاملة إلى AWS — تعمل على لبنات IaaS مثل EC2 وS3، نفس الخدمات التي تعلمتها في هذه الدورة.

بحلول يناير 2016، أغلقت Netflix آخر مراكز بياناتها المملوكة ونقلت 100% من بنية البث التحتية إلى السحابة. المكسب: تستطيع Netflix الآن التوسّع تلقائياً للتعامل مع موجات طلب هائلة غير متوقعة (صدور موسم جديد، حدث إقليمي) عبر أكثر من 190 دولة، دون شراء خادم فيزيائي واحد بنفسها.

غالباً ما تُستشهد قصة Netflix كبرهان حاسم على أن مرونة السحابة وخدماتها المُدارة يمكن أن تتفوّق حتى على مراكز بيانات عملاق تقني خاصة به — بينما تُظهر أيضاً الارتباط بالمزوّد عملياً: معمارية Netflix الآن مبنية بعمق حول خدمات خاصة بـ AWS، مقايضة قبلتها عمداً مقابل البساطة التشغيلية المكتسبة.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Gmail and Netflix are examples of…", ar: "Gmail وNetflix أمثلة على…" },
          choices: [
            { en: "SaaS (Software as a Service)", ar: "SaaS (البرمجيات كخدمة)" },
            { en: "IaaS", ar: "IaaS" },
            { en: "On-premises", ar: "في الموقع" },
          ],
          answer: 0,
          explain: {
            en: "SaaS = fully managed software you just use. You manage nothing — the 'eat at a restaurant' model.",
            ar: "SaaS = برمجيات مُدارة بالكامل تستخدمها فقط. لا تدير شيئاً — نموذج 'كُل في مطعم'.",
          },
        },
        {
          q: { en: "You rent raw virtual servers and manage the OS yourself. That's…", ar: "تستأجر خوادم افتراضية خام وتدير نظام التشغيل بنفسك. هذا…" },
          choices: [
            { en: "IaaS", ar: "IaaS" },
            { en: "SaaS", ar: "SaaS" },
            { en: "It's not cloud", ar: "ليست سحابة" },
          ],
          answer: 0,
          explain: {
            en: "IaaS gives raw infrastructure (like AWS EC2); you handle the OS and app. Most control, most responsibility.",
            ar: "IaaS يعطي بنية خام (مثل AWS EC2)؛ وأنت تتولّى النظام والتطبيق. أكثر تحكّم، أكثر مسؤولية.",
          },
        },
        {
          q: { en: "What is 'elasticity' in the cloud?", ar: "ما هي 'المرونة' في السحابة؟" },
          choices: [
            { en: "Automatically scaling resources up and down with demand", ar: "توسيع الموارد وتقليصها تلقائياً حسب الطلب" },
            { en: "Making servers physically bendable", ar: "جعل الخوادم قابلة للثني فيزيائياً" },
            { en: "Deleting data", ar: "حذف البيانات" },
          ],
          answer: 0,
          explain: {
            en: "Scale up for a spike, down afterward, paying only for what you use — impossible when you own fixed hardware.",
            ar: "توسّع لموجة، ثم انكمش، وادفع فقط لما تستخدم — مستحيل حين تملك عتاداً ثابتاً.",
          },
        },
        {
          q: { en: "The main financial benefit of the cloud is…", ar: "الفائدة المالية الرئيسية للسحابة هي…" },
          choices: [
            { en: "Pay-as-you-go instead of huge upfront hardware cost", ar: "الدفع حسب الاستخدام بدل تكلفة عتاد أولية ضخمة" },
            { en: "It's always completely free", ar: "مجانية تماماً دائماً" },
            { en: "You must buy servers first", ar: "يجب شراء خوادم أولاً" },
          ],
          answer: 0,
          explain: {
            en: "Rent by the second like a utility. Startups launch cheaply and only pay more as they actually grow.",
            ar: "استأجر بالثانية كمرفق. الشركات الناشئة تنطلق بثمن رخيص وتدفع أكثر فقط مع نموّها الفعلي.",
          },
        },
        {
          q: { en: "What is 'vendor lock-in'?", ar: "ما هو 'الارتباط بالمزوّد' (vendor lock-in)؟" },
          choices: [
            { en: "Being so dependent on one provider's specific services that switching becomes very costly", ar: "الاعتماد الشديد على خدمات مزوّد واحد بحيث يصبح التبديل مكلفاً جداً" },
            { en: "A provider physically locking your office door", ar: "مزوّد يقفل باب مكتبك فيزيائياً" },
            { en: "A type of encryption", ar: "نوع من التشفير" },
          ],
          answer: 0,
          explain: {
            en: "Deep use of a provider's proprietary services makes migrating to another provider slow and expensive — a key architectural risk.",
            ar: "الاستخدام العميق لخدمات مزوّد خاصة يجعل الانتقال إلى مزوّد آخر بطيئاً ومكلفاً — خطر معماري رئيسي.",
          },
        },
        {
          q: { en: "A cloud offering where the customer manages the app but NOT the OS is…", ar: "عرض سحابي يدير فيه العميل التطبيق لكن ليس نظام التشغيل هو…" },
          choices: [
            { en: "PaaS", ar: "PaaS" },
            { en: "IaaS", ar: "IaaS" },
            { en: "On-premises", ar: "في الموقع" },
          ],
          answer: 0,
          explain: {
            en: "PaaS hands you a platform to deploy code on — the provider manages the OS and servers underneath.",
            ar: "PaaS يمنحك منصة لنشر الكود عليها — والمزوّد يدير نظام التشغيل والخوادم تحتها.",
          },
        },
        {
          q: { en: "Why did Netflix migrate fully to AWS by 2016?", ar: "لماذا هاجرت Netflix بالكامل إلى AWS بحلول 2016؟" },
          choices: [
            { en: "To gain the cloud's elasticity for unpredictable global demand, after an outage exposed the risk of owning its infrastructure", ar: "لكسب مرونة السحابة أمام الطلب العالمي غير المتوقع، بعد أن كشف انقطاع عن خطر امتلاك بنيتها التحتية" },
            { en: "Because AWS was the only company offering internet access", ar: "لأن AWS كانت الشركة الوحيدة التي تقدّم وصولاً للإنترنت" },
            { en: "It was legally required to do so", ar: "كان ذلك مطلوباً قانونياً" },
          ],
          answer: 0,
          explain: {
            en: "A 2008 data-center outage pushed Netflix toward the cloud; by 2016 it had shut its own data centers and ran fully on AWS's elastic infrastructure.",
            ar: "دفع انقطاع مركز بيانات عام 2008 Netflix نحو السحابة؛ وبحلول 2016 أغلقت مراكز بياناتها الخاصة وعملت بالكامل على بنية AWS المرنة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- IaaS / PaaS / SaaS = provider does progressively more, you do less (pizza analogy)
- Cloud won on pay-as-you-go, elasticity, global reach, and no maintenance
- SaaS = use it; PaaS = deploy code; IaaS = manage the servers
- It's renting computing like electricity

**Next:** AWS Core Services — hands-on with the biggest cloud provider's building blocks.`,
        ar: `## الخلاصة

- IaaS / PaaS / SaaS = المزوّد يفعل تدريجياً أكثر وأنت أقل (تشبيه البيتزا)
- انتصرت السحابة بالدفع حسب الاستخدام والمرونة والوصول العالمي وبلا صيانة
- SaaS = استخدمها؛ PaaS = انشر كوداً؛ IaaS = أدر الخوادم
- إنها استئجار الحوسبة كالكهرباء

**التالي:** خدمات AWS الأساسية — تطبيق عملي مع لبنات أكبر مزوّد سحابي.`,
      },
    },
  ],
};
