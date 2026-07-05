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
