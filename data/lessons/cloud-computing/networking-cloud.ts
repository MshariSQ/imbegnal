import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "networking-cloud",
  title: { en: "Cloud Networking — Connecting Safely", ar: "الشبكات السحابية — الربط بأمان" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What a **VPC** is (your private cloud neighborhood)
- Subnets, security groups, and firewalls
- How traffic flows in and out safely
- The networking that keeps cloud apps secure`,
        ar: `## ماذا ستتعلم

- ما هي **VPC** (حيّك الخاص في السحابة)
- الشبكات الفرعية، مجموعات الأمان، والجدران النارية
- كيف تتدفق البيانات داخلاً وخارجاً بأمان
- الشبكات التي تُبقي تطبيقات السحابة آمنة`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Your own gated neighborhood 🏘️

When you rent servers in a shared data center, you need your own private, isolated space — otherwise your database would sit on the open internet next to strangers. That private space is a **VPC (Virtual Private Cloud)**: your own walled-off section of the cloud, like a gated neighborhood where only your buildings live.

Inside your VPC you organize things into **subnets** (streets within the neighborhood):
- **Public subnet** — has a door to the internet. Your web server lives here (users must reach it).
- **Private subnet** — no direct internet access. Your **database** lives here, hidden. It can only be reached by your web server *inside* the VPC, never directly from outside. This is a core security pattern: never expose your database to the internet.

Controlling who can talk to what, you use **security groups** — virtual firewalls wrapped around each server. A security group is a list of allow-rules:
\`\`\`
Web server security group:
  ✅ allow port 443 (HTTPS) from anywhere    → users can load the site
  ✅ allow port 22 (SSH) from my office IP    → only I can log in
  ❌ everything else is denied by default
\`\`\`

This is **least privilege** (from the security track) applied to networking: open only the exact ports you need, only to the sources that need them. The default-deny stance is what keeps attackers out.

Putting it together — a secure cloud app:
\`\`\`
Internet → [public subnet: web server, ports 443 open]
                    ↓ (internal only)
           [private subnet: database, no internet access]
\`\`\`

Master VPCs, subnets, and security groups and you can design cloud systems that are open where they must be and locked down everywhere else — which is exactly what a cloud engineer is paid to do.`,
        ar: `## حيّك المسوّر الخاص 🏘️

حين تستأجر خوادم في مركز بيانات مشترك، تحتاج مساحتك الخاصة المعزولة — وإلا جلست قاعدة بياناتك على الإنترنت المفتوح بجوار الغرباء. تلك المساحة الخاصة **VPC (السحابة الخاصة الافتراضية)**: قسمك المسوّر من السحابة، كحيّ مغلق تعيش فيه مبانيك فقط.

داخل VPC تنظّم الأشياء في **شبكات فرعية (subnets)** (شوارع داخل الحيّ):
- **شبكة فرعية عامة** — لها باب إلى الإنترنت. خادم الويب يعيش هنا (المستخدمون يجب أن يصلوه).
- **شبكة فرعية خاصة** — بلا وصول مباشر للإنترنت. **قاعدة بياناتك** تعيش هنا، مخفية. لا يصلها إلا خادم الويب *داخل* VPC، أبداً من الخارج مباشرة. هذا نمط أمني جوهري: لا تكشف قاعدة بياناتك للإنترنت أبداً.

للتحكّم بمن يكلّم من، تستخدم **مجموعات الأمان (security groups)** — جدراناً نارية افتراضية حول كل خادم. مجموعة الأمان قائمة قواعد سماح:
\`\`\`
مجموعة أمان خادم الويب:
  ✅ اسمح بالمنفذ 443 (HTTPS) من أي مكان    → المستخدمون يحمّلون الموقع
  ✅ اسمح بالمنفذ 22 (SSH) من IP مكتبي     → أنا فقط أسجّل الدخول
  ❌ كل ما عداه مرفوض افتراضياً
\`\`\`

هذه **أقل صلاحية** (من مسار الأمن) مطبّقة على الشبكات: افتح فقط المنافذ التي تحتاجها بالضبط، فقط للمصادر التي تحتاجها. موقف الرفض الافتراضي هو ما يُبقي المهاجمين خارجاً.

تجميعاً — تطبيق سحابي آمن:
\`\`\`
الإنترنت → [شبكة عامة: خادم ويب، المنفذ 443 مفتوح]
                    ↓ (داخلياً فقط)
           [شبكة خاصة: قاعدة بيانات، بلا وصول إنترنت]
\`\`\`

أتقن VPCs والشبكات الفرعية ومجموعات الأمان فتصمّم أنظمة سحابية مفتوحة حيث يجب ومقفلة في كل مكان آخر — وهو بالضبط ما يُدفع لمهندس السحابة مقابله.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is a VPC?", ar: "ما هي VPC؟" },
          choices: [
            { en: "Your own private, isolated network within the cloud", ar: "شبكتك الخاصة المعزولة داخل السحابة" },
            { en: "A type of database", ar: "نوع قاعدة بيانات" },
            { en: "A programming language", ar: "لغة برمجة" },
          ],
          answer: 0,
          explain: {
            en: "A Virtual Private Cloud is your walled-off section of the provider's cloud — a gated neighborhood for your resources.",
            ar: "السحابة الخاصة الافتراضية قسمك المسوّر من سحابة المزوّد — حيّ مغلق لمواردك.",
          },
        },
        {
          q: { en: "Where should a database live for security?", ar: "أين يجب أن تعيش قاعدة البيانات للأمان؟" },
          choices: [
            { en: "A private subnet with no direct internet access", ar: "شبكة فرعية خاصة بلا وصول مباشر للإنترنت" },
            { en: "A public subnet open to everyone", ar: "شبكة فرعية عامة مفتوحة للجميع" },
            { en: "On the user's phone", ar: "على هاتف المستخدم" },
          ],
          answer: 0,
          explain: {
            en: "Keep databases in private subnets reachable only from inside the VPC. Never expose them directly to the internet.",
            ar: "أبقِ قواعد البيانات في شبكات خاصة تُصل فقط من داخل VPC. لا تكشفها للإنترنت مباشرة أبداً.",
          },
        },
        {
          q: { en: "A security group is basically…", ar: "مجموعة الأمان هي أساساً…" },
          choices: [
            { en: "A firewall with allow-rules for ports and sources", ar: "جدار ناري بقواعد سماح للمنافذ والمصادر" },
            { en: "A team of security guards", ar: "فريق حرّاس أمن" },
            { en: "An encryption key", ar: "مفتاح تشفير" },
          ],
          answer: 0,
          explain: {
            en: "It wraps a server and allows only specified ports from specified sources; everything else is denied by default (least privilege).",
            ar: "تحيط بخادم وتسمح فقط بمنافذ محددة من مصادر محددة؛ وكل ما عداه مرفوض افتراضياً (أقل صلاحية).",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A VPC is your isolated private network in the cloud
- Public subnets face the internet (web servers); private subnets stay hidden (databases)
- Security groups are per-server firewalls — allow only what's needed (least privilege)
- Never expose your database to the internet

**Next:** Infrastructure as Code — defining all this networking in code instead of clicking.`,
        ar: `## الخلاصة

- VPC شبكتك الخاصة المعزولة في السحابة
- الشبكات العامة تواجه الإنترنت (خوادم ويب)؛ والخاصة تبقى مخفية (قواعد بيانات)
- مجموعات الأمان جدران نارية لكل خادم — اسمح فقط بما يلزم (أقل صلاحية)
- لا تكشف قاعدة بياناتك للإنترنت أبداً

**التالي:** البنية التحتية ككود — تعريف كل هذه الشبكات بالكود بدل النقر.`,
      },
    },
  ],
};
