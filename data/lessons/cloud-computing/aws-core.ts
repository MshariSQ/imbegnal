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

**Practice:** AWS has a Free Tier — spin up an EC2 instance and an S3 bucket to see them for real. **Next:** Cloud Networking — connecting these pieces securely.`,
        ar: `## الخلاصة

- ~4 خدمات AWS تشغّل معظم التطبيقات: EC2 (حوسبة)، S3 (تخزين)، RDS (قاعدة بيانات)، Lambda (بلا خادم)
- تتكامل: EC2/Lambda تشغّل الكود، RDS تحفظ البيانات، S3 يحفظ الملفات
- Azure وGoogle Cloud لهما مكافئات بأسماء أخرى
- احذر صلاحيات S3 — الـ buckets العامة تسرّب البيانات

**تدرّب:** AWS فيه طبقة مجانية — شغّل نسخة EC2 وbucket في S3 لتراهما حقيقة. **التالي:** الشبكات السحابية — ربط هذه القطع بأمان.`,
      },
    },
  ],
};
