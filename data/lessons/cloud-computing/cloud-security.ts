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
      type: "text",
      body: {
        en: `## MFA and DDoS protection — the other two locks 🔒

Beyond IAM and encryption, two more defenses close most of the remaining gaps.

**Multi-Factor Authentication (MFA)** means logging in requires more than just a password — usually a password *plus* a one-time code from your phone. Even if an attacker phishes or guesses your password, they still can't get in without your phone. Every cloud provider strongly urges (and many now force) MFA on the root/admin account specifically, because that account has unlimited power — it's the one login that must never be a single point of failure.

**DDoS (Distributed Denial-of-Service) protection** defends against a different kind of attack: instead of trying to break in, an attacker floods your service with fake traffic from thousands of hijacked devices at once, trying to overwhelm it so real users can't get through. Cloud providers run massive-scale protection (AWS Shield, Cloudflare, Google Cloud Armor) that automatically absorbs and filters this junk traffic before it reaches your servers — a scale of defense no single company could build alone.

Put together with IAM, encryption, and the shared responsibility model, a simple mental checklist emerges for any cloud deployment:
1. Is MFA required on every privileged account?
2. Is every IAM permission the *minimum* needed?
3. Is data encrypted at rest and in transit?
4. Is DDoS protection enabled in front of anything public-facing?

Four questions, and you've covered the defenses behind the overwhelming majority of real cloud security incidents.`,
        ar: `## المصادقة الثنائية والحماية من DDoS — القفلان الآخران 🔒

بعد IAM والتشفير، دفاعان إضافيان يغلقان معظم الثغرات المتبقية.

**المصادقة متعددة العوامل (MFA)** تعني أن تسجيل الدخول يتطلب أكثر من كلمة مرور — عادة كلمة مرور *بالإضافة* إلى رمز لمرة واحدة من هاتفك. حتى لو خدع مهاجم كلمة مرورك أو خمّنها، لن يستطيع الدخول دون هاتفك. كل مزوّد سحابي يحثّ بشدة (والكثير يفرض الآن) MFA على حساب الجذر/المدير تحديداً، لأن ذلك الحساب له سلطة غير محدودة — إنه تسجيل الدخول الوحيد الذي يجب ألا يكون أبداً نقطة فشل واحدة.

**الحماية من DDoS (رفض الخدمة الموزّع)** تدافع ضد نوع مختلف من الهجوم: بدل محاولة الاختراق، يُغرق المهاجم خدمتك بحركة زائفة من آلاف الأجهزة المخترقة دفعة واحدة، محاولاً إغراقها بحيث لا يستطيع المستخدمون الحقيقيون الوصول. مزوّدو السحابة يشغّلون حماية بمقياس هائل (AWS Shield، Cloudflare، Google Cloud Armor) تمتص وتفلتر تلقائياً حركة المرور المزيفة هذه قبل وصولها لخوادمك — مقياس دفاع لا تستطيع شركة واحدة بناءه بمفردها.

مع IAM والتشفير ونموذج المسؤولية المشتركة، تبرز قائمة فحص ذهنية بسيطة لأي نشر سحابي:
1. هل MFA مطلوبة على كل حساب مميّز؟
2. هل كل صلاحية IAM هي *الحد الأدنى* اللازم؟
3. هل البيانات مشفّرة أثناء التخزين والنقل؟
4. هل الحماية من DDoS مفعّلة أمام أي شيء يواجه العامة؟

أربعة أسئلة، وتكون قد غطّيت الدفاعات وراء الغالبية العظمى من حوادث أمن السحابة الحقيقية.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: "**Build an IAM policy validator.** Write `isLeastPrivilege(role, actions)` — `role` is a string like `\"backup-script\"`, and `actions` is an array of permission strings it requests, e.g. `[\"s3:GetObject\"]`. Return `false` if `actions` includes `\"*\"` (wildcard = full admin access, never least-privilege) OR if `actions.length` is `0` (a role needs at least one permission to do its job). Otherwise return `true`.",
        ar: "**ابنِ مدقّق سياسات IAM.** اكتب `isLeastPrivilege(role, actions)` — `role` نص مثل `\"backup-script\"`، و`actions` مصفوفة نصوص صلاحيات مطلوبة، مثل `[\"s3:GetObject\"]`. أعِد `false` إذا احتوت `actions` على `\"*\"` (حرف بدل = صلاحية مدير كاملة، ليست أقل صلاحية أبداً) أو إذا كان طول `actions` يساوي `0` (الدور يحتاج صلاحية واحدة على الأقل لأداء عمله). وإلا أعِد `true`.",
      },
      starterCode: `function isLeastPrivilege(role, actions) {
  // TODO: return false for wildcard "*" or empty actions, true otherwise
}
`,
      solution: `function isLeastPrivilege(role, actions) {
  if (actions.includes("*")) return false;
  if (actions.length === 0) return false;
  return true;
}
`,
      hints: [
        { en: "Use actions.includes(\"*\") to catch the dangerous wildcard permission.", ar: "استخدم actions.includes(\"*\") لالتقاط صلاحية الحرف البدل الخطرة." },
        { en: "An empty actions array also fails the check — a role with zero permissions can't do its job (and isn't the point of this check anyway, but it's still invalid input).", ar: "مصفوفة actions الفارغة ترسب الفحص أيضاً — دور بلا صلاحيات لا يستطيع أداء عمله." },
      ],
      tests: [
        { name: { en: "Specific single permission passes", ar: "صلاحية محددة واحدة تنجح" }, check: `isLeastPrivilege("backup-script", ["s3:GetObject"]) === true` },
        { name: { en: "Wildcard fails", ar: "الحرف البدل يرسب" }, check: `isLeastPrivilege("admin-tool", ["*"]) === false` },
        { name: { en: "Empty actions fails", ar: "صلاحيات فارغة ترسب" }, check: `isLeastPrivilege("mystery-role", []) === false` },
        { name: { en: "Multiple specific permissions pass", ar: "عدة صلاحيات محددة تنجح" }, check: `isLeastPrivilege("app-server", ["s3:GetObject", "dynamodb:Query"]) === true` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: The Capital One breach 🔍

In 2019, Capital One disclosed a breach affecting over 100 million customers, one of the largest breaches in U.S. financial history. The attacker was a former employee of a cloud provider who exploited a misconfigured web application firewall on Capital One's cloud infrastructure to trick a server into fetching sensitive credentials it should never have been able to reach, then used those credentials to access and download data from cloud storage.

This is a direct, real illustration of the shared responsibility model from this lesson: the cloud provider's infrastructure was not "hacked" in the traditional sense — the breach traced to a misconfiguration and overly broad permissions on the *customer's* side, exactly the kind of issue the "breach checklist" in this lesson warns about.

The case became one of the most-cited examples in cloud security training precisely because it wasn't exotic — no zero-day exploit, no nation-state hacking tools. It was a misconfigured firewall rule and permissions that were broader than they needed to be, letting one compromised credential reach far more than it should have. It's the textbook argument for least-privilege IAM and rigorous configuration review as routine practice, not an afterthought.`,
        ar: `## دراسة حالة واقعية: اختراق Capital One 🔍

في 2019، كشفت Capital One عن اختراق طال أكثر من 100 مليون عميل، أحد أكبر الاختراقات في تاريخ القطاع المالي الأمريكي. كان المهاجم موظفاً سابقاً لدى مزوّد سحابي استغل جداراً نارياً لتطبيق ويب سيئ الإعداد على بنية Capital One السحابية لخداع خادم لجلب بيانات اعتماد حساسة ما كان يجب أن يصلها إطلاقاً، ثم استخدم تلك البيانات للوصول وتنزيل بيانات من التخزين السحابي.

هذا توضيح مباشر وحقيقي لنموذج المسؤولية المشتركة من هذا الدرس: لم تُخترق بنية المزوّد السحابي بالمعنى التقليدي — بل عاد الاختراق إلى سوء إعداد وصلاحيات واسعة جداً من جهة *العميل*، بالضبط نوع المشكلة التي تحذّر منها "قائمة فحص الاختراق" في هذا الدرس.

أصبحت هذه الحالة من أكثر الأمثلة استشهاداً في تدريب أمن السحابة تحديداً لأنها لم تكن غريبة — لا استغلال يوم صفر، ولا أدوات قرصنة دولة. كانت قاعدة جدار ناري سيئة الإعداد وصلاحيات أوسع مما يلزم، سمحت لبيانات اعتماد واحدة مخترقة بالوصول لأكثر بكثير مما يجب. إنها الحجة الكلاسيكية لصلاحية IAM الأقل والمراجعة الصارمة للإعدادات كممارسة روتينية، لا فكرة لاحقة.`,
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
        {
          q: { en: "Why should MFA be required on cloud admin/root accounts specifically?", ar: "لماذا يجب فرض MFA على حسابات المدير/الجذر السحابية تحديداً؟" },
          choices: [
            { en: "That account has unlimited power, so it must never be a single point of failure protected only by a password", ar: "ذلك الحساب له سلطة غير محدودة، فيجب ألا يكون أبداً نقطة فشل واحدة محمية بكلمة مرور فقط" },
            { en: "MFA makes login faster", ar: "MFA تجعل تسجيل الدخول أسرع" },
            { en: "It's only needed for regular user accounts", ar: "لا تلزم إلا لحسابات المستخدمين العاديين" },
          ],
          answer: 0,
          explain: {
            en: "A phished or guessed password alone shouldn't be enough to compromise the most powerful account — MFA adds a second factor the attacker doesn't have.",
            ar: "كلمة مرور مخدوعة أو مخمّنة وحدها لا يجب أن تكفي لاختراق أقوى حساب — MFA تضيف عاملاً ثانياً لا يملكه المهاجم.",
          },
        },
        {
          q: { en: "What actually caused the 2019 Capital One breach?", ar: "ما الذي تسبّب فعلياً في اختراق Capital One عام 2019؟" },
          choices: [
            { en: "A misconfigured firewall and overly broad permissions on the customer side, not the cloud provider being hacked", ar: "جدار ناري سيئ الإعداد وصلاحيات واسعة جداً من جهة العميل، لا اختراق مزوّد السحابة" },
            { en: "AWS's own data centers were physically breached", ar: "اختراق مراكز بيانات AWS فيزيائياً" },
            { en: "A previously unknown zero-day exploit in the cloud hypervisor", ar: "استغلال يوم صفر غير معروف سابقاً في الـ hypervisor السحابي" },
          ],
          answer: 0,
          explain: {
            en: "A misconfigured web application firewall and permissions broader than needed let an attacker reach credentials and data — a textbook shared-responsibility failure on the customer's side.",
            ar: "جدار ناري لتطبيق ويب سيئ الإعداد وصلاحيات أوسع من اللازم سمحا لمهاجم بالوصول لبيانات اعتماد وبيانات — فشل كلاسيكي في المسؤولية المشتركة من جهة العميل.",
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
- MFA on privileged accounts and provider-scale DDoS protection close most remaining gaps
- The Capital One breach shows a real-world least-privilege and misconfiguration failure

**Next:** Serverless & Containers — modern ways to run your code in the cloud.`,
        ar: `## الخلاصة

- المسؤولية المشتركة: المزوّد يؤمّن السحابة، وأنت تؤمّن ما فيها
- IAM = تحكّم وصول بأقل صلاحية؛ لا تستخدم الجذر يومياً
- شفّر أثناء النقل (TLS) وأثناء التخزين
- معظم الاختراقات = buckets عامة، IAM واسع، أسرار مسرّبة، برامج غير محدّثة
- MFA على الحسابات المميّزة والحماية من DDoS بمقياس المزوّد تغلقان معظم الثغرات المتبقية
- اختراق Capital One يُظهر فشلاً حقيقياً في أقل صلاحية وسوء إعداد

**التالي:** بلا خادم والحاويات — طرق حديثة لتشغيل كودك في السحابة.`,
      },
    },
  ],
};
