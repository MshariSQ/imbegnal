import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "aws-core",
  title: { en: "AWS Core Services — The Building Blocks", ar: "خدمات AWS الأساسية — اللبنات" },
  estMinutes: 35,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- The 4 AWS services that power most apps
- **EC2, S3, RDS, Lambda** in plain terms
- How they fit together into a real system
- The names that unlock the whole cloud`,
        ar: `## ماذا ستتعلم

- خدمات AWS الأربع التي تشغّل معظم التطبيقات
- **EC2 و S3 و RDS و Lambda** بلغة بسيطة
- كيف تتكامل في نظام حقيقي
- الأسماء التي تفتح السحابة كلها`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The four workhorses ⚙️

**AWS** (Amazon Web Services) is the biggest cloud provider, with 200+ services. Sounds overwhelming — but ~4 services power the vast majority of apps. Learn these and you understand the cloud (Azure and Google have near-identical equivalents under different names).

**1. EC2 (Elastic Compute Cloud) = a rented computer.** A virtual server in the cloud you can start in a minute, install anything on, and run 24/7. This is IaaS — the raw compute. Need a bigger machine? Resize it. Need ten? Launch ten. When people say "spin up a server," this is usually it.

**2. S3 (Simple Storage Service) = an infinite hard drive.** Store any file — images, videos, backups, data — with essentially unlimited space, cheaply, accessible from anywhere via a URL. Files live in "buckets." Most websites store their images and user uploads in S3. (Fun fact: misconfigured public S3 buckets are a famous cause of data leaks — remember least privilege from the security track!)

**3. RDS (Relational Database Service) = a managed database.** It's a SQL database (MySQL/PostgreSQL) that AWS runs *for* you — handling backups, updates, and scaling. You just connect and query. No installing or maintaining database software yourself.

**4. Lambda = run code without a server.** This is "serverless": you upload a function, and AWS runs it *only when triggered*, charging you per execution (often fractions of a cent). No server to manage, no idle cost. Perfect for tasks that run occasionally.

**How they combine** in a typical app:
\`\`\`
User → website → EC2 (or Lambda) runs your code
                    ├── reads/writes data in RDS (database)
                    └── serves images from S3 (storage)
\`\`\`

That's a real, production-shaped architecture built from four named boxes. Learn these four and the intimidating AWS console suddenly makes sense.`,
        ar: `## عمّال المهام الأربعة ⚙️

**AWS** (خدمات أمازون السحابية) أكبر مزوّد سحابي، بأكثر من 200 خدمة. يبدو مربكاً — لكن ~4 خدمات تشغّل الغالبية العظمى من التطبيقات. تعلّمها فتفهم السحابة (Azure وGoogle لهما مكافئات شبه متطابقة بأسماء مختلفة).

**1. EC2 (سحابة الحوسبة المرنة) = حاسوب مستأجَر.** خادم افتراضي في السحابة تشغّله بدقيقة، تثبّت عليه أي شيء، وتشغّله 24/7. هذا IaaS — الحوسبة الخام. تحتاج آلة أكبر؟ غيّر حجمها. تحتاج عشراً؟ شغّل عشراً. حين يقول الناس "شغّل خادماً"، هذا هو عادة.

**2. S3 (خدمة التخزين البسيط) = قرص صلب لا نهائي.** خزّن أي ملف — صور، فيديو، نسخ احتياطية، بيانات — بمساحة غير محدودة عملياً، بثمن رخيص، ويُصل من أي مكان عبر رابط. الملفات تعيش في "buckets". معظم المواقع تخزّن صورها ورفعات مستخدميها في S3. (معلومة: buckets عامة سيئة الإعداد سبب شهير لتسريب البيانات — تذكّر أقل صلاحية من مسار الأمن!)

**3. RDS (خدمة قاعدة البيانات العلائقية) = قاعدة بيانات مُدارة.** قاعدة SQL (MySQL/PostgreSQL) يشغّلها AWS *عنك* — يتولّى النسخ الاحتياطي والتحديثات والتوسّع. تتصل وتستعلم فقط. بلا تثبيت أو صيانة لبرنامج قاعدة البيانات بنفسك.

**4. Lambda = شغّل كوداً بلا خادم.** هذا "بلا خادم (serverless)": ترفع دالة، ويشغّلها AWS *فقط عند التحفيز*، ويحاسبك لكل تنفيذ (غالباً أجزاء من السنت). بلا خادم تديره، بلا تكلفة خمول. مثالي للمهام التي تعمل أحياناً.

**كيف تتكامل** في تطبيق نموذجي:
\`\`\`
مستخدم → موقع → EC2 (أو Lambda) يشغّل كودك
                    ├── يقرأ/يكتب بيانات في RDS (قاعدة بيانات)
                    └── يخدم صوراً من S3 (تخزين)
\`\`\`

هذه معمارية حقيقية بشكل إنتاجي مبنية من أربعة صناديق مسمّاة. تعلّم هذه الأربعة فتصبح واجهة AWS المخيفة مفهومة فجأة.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Regions and Availability Zones 🌍

AWS doesn't run one giant data center — it runs many, grouped into **Regions** (like *us-east-1* in Virginia, or *eu-west-1* in Ireland), and each Region contains several **Availability Zones (AZs)** — physically separate data centers with their own power and cooling, connected by fast private links.

Think of a Region as a city, and its AZs as separate buildings on opposite sides of that city. Why split things up this way?

- **Pick a Region close to your users** — a user in Japan gets faster load times from *ap-northeast-1* (Tokyo) than from Virginia. Lower distance = lower latency.
- **Some data must legally stay in-country** — data-residency laws (common in finance, healthcare, government) may require EU customer data to stay in an EU Region.
- **Spread across AZs for reliability** — if you run your EC2 servers in only one AZ and that building loses power, your app goes down. Run copies in *two or three* AZs in the same Region, and losing one building doesn't take down your app — a load balancer just routes around it.

This is why "multi-AZ" is one of the first things a cloud architect checks: it's cheap insurance against a single data-center failure, and it's *entirely different* from multi-cloud (which spans providers, not just buildings). Most production AWS systems live in one Region, spread across multiple AZs — global reach and resilience without the complexity of juggling multiple providers.`,
        ar: `## المناطق ومناطق التوفر 🌍

لا يشغّل AWS مركز بيانات ضخماً واحداً — بل يشغّل عدة مراكز، مجمّعة في **مناطق (Regions)** (مثل *us-east-1* في فرجينيا، أو *eu-west-1* في إيرلندا)، وكل منطقة تحتوي عدة **مناطق توفر (Availability Zones/AZs)** — مراكز بيانات منفصلة فيزيائياً بطاقتها وتبريدها الخاص، متصلة بروابط خاصة سريعة.

فكّر في المنطقة كمدينة، ومناطق توفرها كمبانٍ منفصلة على طرفي تلك المدينة. لماذا التقسيم هكذا؟

- **اختر منطقة قريبة من مستخدميك** — مستخدم في اليابان يحصل على تحميل أسرع من *ap-northeast-1* (طوكيو) مقارنة بفرجينيا. مسافة أقل = زمن استجابة أقل.
- **بعض البيانات يجب أن تبقى داخل البلد قانونياً** — قوانين إقامة البيانات (شائعة في المال والصحة والحكومة) قد تشترط بقاء بيانات عملاء الاتحاد الأوروبي في منطقة أوروبية.
- **انتشر عبر مناطق التوفر للموثوقية** — إن شغّلت خوادم EC2 في منطقة توفر واحدة فقط وفقد ذلك المبنى الطاقة، يسقط تطبيقك. شغّل نسخاً في منطقتي أو ثلاث توفر في نفس المنطقة، وفقدان مبنى واحد لن يُسقط تطبيقك — موازِن الحِمل يوجّه حوله ببساطة.

لهذا "متعدد مناطق التوفر" أول ما يفحصه مهندس السحابة: تأمين رخيص ضد عطل مركز بيانات واحد، ويختلف *تماماً* عن السحابة المتعددة (التي تمتد عبر مزوّدين، لا مبانٍ فقط). معظم أنظمة AWS الإنتاجية تعيش في منطقة واحدة، منتشرة عبر عدة مناطق توفر — وصول عالمي ومرونة بلا تعقيد التنقل بين مزوّدين متعددين.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: "**Build an instance-size picker.** Write `pickInstanceSize(cpuNeeded, memNeeded)` — both numbers. Return `\"small\"` if `cpuNeeded <= 2` AND `memNeeded <= 4`, `\"large\"` if `cpuNeeded <= 8` AND `memNeeded <= 32`, otherwise `\"xlarge\"`. This mirrors the real decision of choosing an EC2 instance type to fit a workload without overpaying.",
        ar: "**ابنِ مُنتقي حجم نسخة.** اكتب `pickInstanceSize(cpuNeeded, memNeeded)` — كلاهما أرقام. أعِد `\"small\"` إذا كان `cpuNeeded <= 2` و`memNeeded <= 4`، و`\"large\"` إذا كان `cpuNeeded <= 8` و`memNeeded <= 32`، وإلا `\"xlarge\"`. هذا يحاكي القرار الحقيقي لاختيار نوع نسخة EC2 يناسب الحِمل دون دفع زائد.",
      },
      starterCode: `function pickInstanceSize(cpuNeeded, memNeeded) {
  // TODO: return "small", "large", or "xlarge"
}
`,
      solution: `function pickInstanceSize(cpuNeeded, memNeeded) {
  if (cpuNeeded <= 2 && memNeeded <= 4) return "small";
  if (cpuNeeded <= 8 && memNeeded <= 32) return "large";
  return "xlarge";
}
`,
      hints: [
        { en: "Check the smallest tier first: cpuNeeded <= 2 and memNeeded <= 4 both must hold for \"small\".", ar: "افحص أصغر فئة أولاً: يجب أن يتحقق cpuNeeded <= 2 وmemNeeded <= 4 معاً لـ \"small\"." },
        { en: "If it doesn't fit small, check the large thresholds (<=8 CPU, <=32 mem); anything bigger is xlarge.", ar: "إن لم تناسب small، افحص عتبات large (<=8 معالج، <=32 ذاكرة)؛ أي شيء أكبر هو xlarge." },
      ],
      tests: [
        { name: { en: "Tiny workload is small", ar: "حِمل صغير هو small" }, check: `pickInstanceSize(1, 2) === "small"` },
        { name: { en: "Medium workload is large", ar: "حِمل متوسط هو large" }, check: `pickInstanceSize(4, 16) === "large"` },
        { name: { en: "Huge workload is xlarge", ar: "حِمل ضخم هو xlarge" }, check: `pickInstanceSize(16, 64) === "xlarge"` },
        { name: { en: "Boundary of small still small", ar: "حد small لا يزال small" }, check: `pickInstanceSize(2, 4) === "small"` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: The 2017 AWS S3 outage 🔍

On February 28, 2017, an AWS engineer ran a routine command to take a small number of S3 servers offline for debugging in the us-east-1 Region. A typo in the command's input caused it to remove far more capacity than intended, and S3 in that Region went down for about four hours.

Because so many popular websites and apps store files in S3 or depend on services that do, the outage rippled outward: image uploads failed, some smart-home devices stopped responding, and status-check dashboards on other sites couldn't load — because those dashboards themselves stored their icons in the very S3 buckets that were down.

The incident became a textbook lesson in two things covered in this lesson: first, how deeply the modern internet depends on a handful of core services like S3, and second, why spreading critical systems across multiple Regions (not just multiple AZs) matters for anything that truly cannot go down. AWS responded by adding more safeguards around large-scale operational commands — a reminder that even the biggest cloud provider's "four workhorses" are operated by humans who can make a typo.`,
        ar: `## دراسة حالة واقعية: انقطاع S3 في AWS عام 2017 🔍

في 28 فبراير 2017، نفّذ مهندس في AWS أمراً روتينياً لإخراج عدد قليل من خوادم S3 من الخدمة لتصحيح الأخطاء في منطقة us-east-1. تسبّب خطأ إملائي في مدخل الأمر بإزالة سعة أكبر بكثير من المقصود، فتعطّلت خدمة S3 في تلك المنطقة لنحو أربع ساعات.

ولأن مواقع وتطبيقات شهيرة كثيرة تخزّن ملفاتها في S3 أو تعتمد على خدمات تفعل ذلك، امتدت آثار الانقطاع: فشلت رفعات الصور، توقفت بعض أجهزة المنزل الذكي عن الاستجابة، وتعذّر تحميل لوحات فحص الحالة في مواقع أخرى — لأن تلك اللوحات نفسها خزّنت أيقوناتها في نفس buckets S3 المتعطلة.

أصبحت الحادثة درساً كلاسيكياً في أمرين تناولهما هذا الدرس: أولاً، مدى اعتماد الإنترنت الحديث بعمق على حفنة من الخدمات الأساسية مثل S3، وثانياً، لماذا يهم توزيع الأنظمة الحرجة عبر مناطق متعددة (لا مناطق توفر فقط) لأي شيء لا يجب أن يتعطّل إطلاقاً. استجاب AWS بإضافة ضمانات أكثر حول الأوامر التشغيلية واسعة النطاق — تذكير بأن حتى "عمّال المهام الأربعة" لأكبر مزوّد سحابي يشغّلهم بشر قد يرتكبون خطأً إملائياً.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Which AWS service is a rented virtual computer?", ar: "أي خدمة AWS حاسوب افتراضي مستأجَر؟" },
          choices: [
            { en: "EC2", ar: "EC2" },
            { en: "S3", ar: "S3" },
            { en: "RDS", ar: "RDS" },
          ],
          answer: 0,
          explain: {
            en: "EC2 = Elastic Compute Cloud = virtual servers. S3 is storage, RDS is a database.",
            ar: "EC2 = سحابة الحوسبة المرنة = خوادم افتراضية. وS3 تخزين، وRDS قاعدة بيانات.",
          },
        },
        {
          q: { en: "Where would you store a website's images?", ar: "أين تخزّن صور موقع؟" },
          choices: [
            { en: "S3 (object storage)", ar: "S3 (تخزين كائنات)" },
            { en: "Lambda", ar: "Lambda" },
            { en: "EC2's CPU", ar: "معالج EC2" },
          ],
          answer: 0,
          explain: {
            en: "S3 is cheap, near-unlimited file storage accessed by URL — the standard home for images and uploads.",
            ar: "S3 تخزين ملفات رخيص شبه غير محدود يُصل برابط — المكان القياسي للصور والرفعات.",
          },
        },
        {
          q: { en: "What makes Lambda 'serverless'?", ar: "ما الذي يجعل Lambda 'بلا خادم'؟" },
          choices: [
            { en: "You run code on demand without managing a server, paying per execution", ar: "تشغّل كوداً عند الطلب دون إدارة خادم، وتدفع لكل تنفيذ" },
            { en: "It literally has no computers", ar: "لا حواسيب فيها حرفياً" },
            { en: "It only runs offline", ar: "تعمل دون اتصال فقط" },
          ],
          answer: 0,
          explain: {
            en: "Servers still exist — you just don't manage them. Code runs only when triggered, with no idle cost.",
            ar: "الخوادم موجودة — لكنك لا تديرها. الكود يعمل فقط عند التحفيز، بلا تكلفة خمول.",
          },
        },
        {
          q: { en: "Why does AWS split Regions into multiple Availability Zones?", ar: "لماذا يقسّم AWS المناطق إلى عدة مناطق توفر؟" },
          choices: [
            { en: "So a single data center failure doesn't take your whole app down", ar: "حتى لا يُسقط عطل مركز بيانات واحد تطبيقك بالكامل" },
            { en: "To make internet access faster for everyone worldwide", ar: "لتسريع الوصول للإنترنت للجميع عالمياً" },
            { en: "AZs are just a billing category, not physical locations", ar: "مناطق التوفر مجرد فئة فوترة، لا مواقع فيزيائية" },
          ],
          answer: 0,
          explain: {
            en: "AZs are physically separate data centers with independent power/cooling. Spreading servers across AZs means losing one building doesn't take down the app.",
            ar: "مناطق التوفر مراكز بيانات منفصلة فيزيائياً بطاقة وتبريد مستقلين. توزيع الخوادم عبرها يعني أن فقدان مبنى واحد لن يُسقط التطبيق.",
          },
        },
        {
          q: { en: "What caused the February 2017 AWS S3 outage?", ar: "ما الذي تسبّب في انقطاع S3 التابع لـ AWS في فبراير 2017؟" },
          choices: [
            { en: "A typo in a routine command removed far more server capacity than intended", ar: "خطأ إملائي في أمر روتيني أزال سعة خوادم أكبر بكثير من المقصود" },
            { en: "A hacker breached AWS's data centers", ar: "اخترق قرصان مراكز بيانات AWS" },
            { en: "A hurricane physically destroyed the servers", ar: "دمّر إعصار الخوادم فيزيائياً" },
          ],
          answer: 0,
          explain: {
            en: "An engineer's mistyped input took down more S3 capacity than planned, showing how much of the internet depends on a handful of core cloud services.",
            ar: "أدى مدخل خاطئ من مهندس إلى تعطيل سعة S3 أكبر من المخطط، ما أظهر مدى اعتماد الإنترنت على حفنة خدمات سحابية أساسية.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- ~4 AWS services power most apps: EC2 (compute), S3 (storage), RDS (database), Lambda (serverless)
- They combine: EC2/Lambda run code, RDS holds data, S3 holds files
- Azure and Google Cloud have equivalents under other names
- Watch S3 permissions — public buckets leak data
- Regions + Availability Zones let you place resources near users and survive a single data-center failure
- The 2017 S3 outage shows how much the internet leans on a few core cloud services

**Practice:** AWS has a Free Tier — spin up an EC2 instance and an S3 bucket to see them for real. **Next:** Cloud Networking — connecting these pieces securely.`,
        ar: `## الخلاصة

- ~4 خدمات AWS تشغّل معظم التطبيقات: EC2 (حوسبة)، S3 (تخزين)، RDS (قاعدة بيانات)، Lambda (بلا خادم)
- تتكامل: EC2/Lambda تشغّل الكود، RDS تحفظ البيانات، S3 يحفظ الملفات
- Azure وGoogle Cloud لهما مكافئات بأسماء أخرى
- احذر صلاحيات S3 — الـ buckets العامة تسرّب البيانات
- المناطق ومناطق التوفر تتيح وضع الموارد قرب المستخدمين والنجاة من عطل مركز بيانات واحد
- انقطاع S3 عام 2017 يُظهر مدى اعتماد الإنترنت على حفنة من الخدمات السحابية الأساسية

**تدرّب:** AWS فيه طبقة مجانية — شغّل نسخة EC2 وbucket في S3 لتراهما حقيقة. **التالي:** الشبكات السحابية — ربط هذه القطع بأمان.`,
      },
    },
  ],
};
