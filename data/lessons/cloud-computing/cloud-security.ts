import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "cloud-security",
  title: { en: "Cloud Security — Locking It Down", ar: "أمن السحابة — إحكام الإغلاق" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- The **shared responsibility model** (who secures what)
- **IAM** — controlling who can do what
- Encryption at rest and in transit
- The misconfigurations that cause most cloud breaches`,
        ar: `## ماذا ستتعلم

- **نموذج المسؤولية المشتركة** (من يؤمّن ماذا)
- **IAM** — التحكّم بمن يفعل ماذا
- التشفير أثناء التخزين وأثناء النقل
- سوء الإعدادات التي تسبب معظم اختراقات السحابة`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Who locks which door? 🔐

The most misunderstood idea in cloud security is the **shared responsibility model**. Think of a cloud provider as an apartment building:

- **The provider secures the building** — the physical hardware, the data center, the foundation, the walls. ("Security *of* the cloud.")
- **You secure your apartment** — your data, your passwords, your access rules, your locked doors. ("Security *in* the cloud.")

Most cloud breaches are NOT the provider being hacked — they're customers leaving their own door unlocked. AWS is extremely secure; the leaks come from a misconfigured S3 bucket left public, or a password left in code. Knowing *your* half of the responsibility is the whole game.

**IAM (Identity and Access Management)** is your control panel for "who can do what." It's least privilege (from the security track) at cloud scale:
- Create users and roles.
- Grant each the *minimum* permissions needed. A backup script needs read-only access to one bucket — not admin over everything.
- Never use the all-powerful root account for daily work.

A too-broad IAM permission is like handing every employee a master key to the entire building. When (not if) one account is phished, the damage is total.

**Encryption — two flavors, always use both:**
- **In transit** — data moving over the network is encrypted (HTTPS/TLS), so an eavesdropper gets gibberish. (Remember man-in-the-middle from the security track?)
- **At rest** — data sitting in storage/databases is encrypted, so a stolen disk is useless.

**The breach checklist** — nearly all cloud incidents trace to these:
1. Public storage buckets that should be private.
2. Over-permissioned IAM roles.
3. Secrets (passwords, API keys) hardcoded in code or repos.
4. Unpatched software.

Master the shared responsibility model, least-privilege IAM, and encryption, and you avoid the mistakes behind the vast majority of cloud data leaks.`,
        ar: `## من يقفل أي باب؟ 🔐

أكثر فكرة يُساء فهمها في أمن السحابة **نموذج المسؤولية المشتركة**. فكّر في مزوّد السحابة كمبنى شقق:

- **المزوّد يؤمّن المبنى** — العتاد الفيزيائي، مركز البيانات، الأساس، الجدران. ("أمن *السحابة* نفسها.")
- **أنت تؤمّن شقتك** — بياناتك، كلمات مرورك، قواعد وصولك، أبوابك المقفلة. ("الأمن *داخل* السحابة.")

معظم اختراقات السحابة ليست اختراق المزوّد — بل عملاء تركوا بابهم مفتوحاً. AWS آمن جداً؛ والتسريبات تأتي من bucket في S3 سيئ الإعداد تُرك عاماً، أو كلمة مرور تُركت في الكود. معرفة نصفك من المسؤولية هي اللعبة كلها.

**IAM (إدارة الهوية والوصول)** لوحة تحكّمك بـ"من يفعل ماذا". إنها أقل صلاحية (من مسار الأمن) على مقياس السحابة:
- أنشئ مستخدمين وأدواراً.
- امنح كلاً *الحد الأدنى* من الصلاحيات اللازمة. سكربت نسخ احتياطي يحتاج قراءة فقط لـ bucket واحد — لا صلاحية مدير على كل شيء.
- لا تستخدم حساب الجذر كامل الصلاحية للعمل اليومي أبداً.

صلاحية IAM واسعة جداً كتسليم كل موظف مفتاحاً رئيسياً للمبنى كله. وحين (لا إن) يُخدع حساب بالتصيّد، يكون الضرر شاملاً.

**التشفير — نكهتان، استخدم كلتيهما دائماً:**
- **أثناء النقل (In transit)** — البيانات المتحركة عبر الشبكة مشفّرة (HTTPS/TLS)، فيحصل المتنصّت على طلاسم. (تذكّر الوسيط من مسار الأمن؟)
- **أثناء التخزين (At rest)** — البيانات في التخزين/قواعد البيانات مشفّرة، فالقرص المسروق عديم الفائدة.

**قائمة فحص الاختراق** — كل حوادث السحابة تقريباً تعود لهذه:
1. buckets تخزين عامة يجب أن تكون خاصة.
2. أدوار IAM مفرطة الصلاحيات.
3. أسرار (كلمات مرور، مفاتيح API) مكتوبة في الكود أو المستودعات.
4. برامج غير محدّثة.

أتقن نموذج المسؤولية المشتركة، وIAM أقل صلاحية، والتشفير، فتتجنّب الأخطاء وراء الغالبية العظمى من تسريبات بيانات السحابة.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "In the shared responsibility model, who secures your data and access rules?", ar: "في نموذج المسؤولية المشتركة، من يؤمّن بياناتك وقواعد وصولك؟" },
          choices: [
            { en: "You (the customer)", ar: "أنت (العميل)" },
            { en: "The cloud provider", ar: "مزوّد السحابة" },
            { en: "Nobody", ar: "لا أحد" },
          ],
          answer: 0,
          explain: {
            en: "The provider secures the cloud itself (hardware); you secure what's in it (data, IAM, configs). Most breaches are the customer's half.",
            ar: "المزوّد يؤمّن السحابة نفسها (العتاد)؛ وأنت تؤمّن ما فيها (البيانات، IAM، الإعدادات). ومعظم الاختراقات نصف العميل.",
          },
        },
        {
          q: { en: "What is IAM for?", ar: "لأجل ماذا IAM؟" },
          choices: [
            { en: "Controlling who can do what, with least privilege", ar: "التحكّم بمن يفعل ماذا، بأقل صلاحية" },
            { en: "Storing images", ar: "تخزين الصور" },
            { en: "Speeding up the network", ar: "تسريع الشبكة" },
          ],
          answer: 0,
          explain: {
            en: "IAM manages users, roles, and permissions. Grant minimum access and avoid the root account for daily tasks.",
            ar: "IAM يدير المستخدمين والأدوار والصلاحيات. امنح أقل وصول وتجنّب حساب الجذر للمهام اليومية.",
          },
        },
        {
          q: { en: "What's the difference between encryption in transit and at rest?", ar: "ما الفرق بين التشفير أثناء النقل وأثناء التخزين؟" },
          choices: [
            { en: "In transit = data moving over the network; at rest = data in storage", ar: "أثناء النقل = بيانات تتحرك عبر الشبكة؛ أثناء التخزين = بيانات في التخزين" },
            { en: "They're the same", ar: "متطابقان" },
            { en: "At rest means the servers are asleep", ar: "أثناء التخزين تعني أن الخوادم نائمة" },
          ],
          answer: 0,
          explain: {
            en: "Encrypt both: TLS protects data on the wire; at-rest encryption protects stored data if a disk is stolen.",
            ar: "شفّر الاثنين: TLS يحمي البيانات على السلك؛ وتشفير التخزين يحمي البيانات المخزّنة إن سُرق قرص.",
          },
        },
        {
          q: { en: "The most common cause of cloud data leaks is…", ar: "أشيع سبب لتسريبات بيانات السحابة هو…" },
          choices: [
            { en: "Customer misconfigurations (public buckets, over-broad permissions, leaked secrets)", ar: "سوء إعدادات العميل (buckets عامة، صلاحيات واسعة، أسرار مسرّبة)" },
            { en: "The provider getting hacked", ar: "اختراق المزوّد" },
            { en: "Slow internet", ar: "بطء الإنترنت" },
          ],
          answer: 0,
          explain: {
            en: "Providers are hardened; leaks come from the customer side — public S3 buckets, broad IAM, hardcoded secrets, unpatched software.",
            ar: "المزوّدون محصّنون؛ والتسريبات من جهة العميل — buckets عامة، IAM واسع، أسرار مكتوبة، برامج غير محدّثة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Shared responsibility: provider secures the cloud, you secure what's in it
- IAM = least-privilege access control; never use root daily
- Encrypt in transit (TLS) and at rest (storage)
- Most breaches = public buckets, broad IAM, leaked secrets, unpatched software

**Next:** Serverless & Containers — modern ways to run your code in the cloud.`,
        ar: `## الخلاصة

- المسؤولية المشتركة: المزوّد يؤمّن السحابة، وأنت تؤمّن ما فيها
- IAM = تحكّم وصول بأقل صلاحية؛ لا تستخدم الجذر يومياً
- شفّر أثناء النقل (TLS) وأثناء التخزين
- معظم الاختراقات = buckets عامة، IAM واسع، أسرار مسرّبة، برامج غير محدّثة

**التالي:** بلا خادم والحاويات — طرق حديثة لتشغيل كودك في السحابة.`,
      },
    },
  ],
};
