import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "iac-devops",
  title: { en: "Infrastructure as Code — Environments in Git", ar: "البنية التحتية ككود — البيئات في Git" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- IaC from the DevOps angle: whole environments as code
- Terraform vs configuration tools (Ansible)
- Idempotency — the property that makes IaC safe
- How IaC completes the automation story`,
        ar: `## ماذا ستتعلم

- IaC من زاوية DevOps: بيئات كاملة ككود
- Terraform مقابل أدوات الإعداد (Ansible)
- الثبات (Idempotency) — الخاصية التي تجعل IaC آمنة
- كيف تُكمل IaC قصة الأتمتة`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The last piece of the automation puzzle 🧩

DevOps automates code (CI/CD) and packages it (Docker). But what about the **servers, networks, and databases** the code runs on? Setting those up by clicking is slow, inconsistent, and undocumented. **Infrastructure as Code (IaC)** automates that final piece: your entire environment defined in text files, versioned in Git, built by a tool.

(You saw IaC in the cloud track — here's the DevOps framing and one crucial new concept.)

**Two flavors of "as code" tools, often used together:**
- **Provisioning (Terraform)** — creates the *infrastructure itself*: "make 3 servers, a database, and a network." Declarative — you describe the end state.
- **Configuration management (Ansible, Chef, Puppet)** — sets up what's *inside* each server: "install nginx, copy these config files, start the service."

Together: Terraform builds the houses, Ansible furnishes them.

**The crucial concept: idempotency.** This is what makes IaC trustworthy. An operation is **idempotent** if running it once or ten times gives the *same result*. "Ensure exactly 3 servers exist" is idempotent — run it repeatedly and you always end with 3, never 6 or 30. Compare a non-idempotent "add a server" script: run it three times and you accidentally have three extra servers. Good IaC declares the *desired end state* (idempotent), not a list of actions (dangerous to re-run). It's the same declarative safety as Kubernetes' desired state.

**Why this completes DevOps:** now *everything* — the app code, its container, its tests, its deployment pipeline, AND the infrastructure it runs on — lives in Git, reviewed and reproducible. You can destroy your entire production environment and rebuild it identically from text files in minutes. A new team member can read the repo and understand the whole system. That is the DevOps dream: the entire path from a developer's idea to running production is automated, versioned, and repeatable.`,
        ar: `## القطعة الأخيرة من أحجية الأتمتة 🧩

DevOps يؤتمت الكود (CI/CD) ويحزمه (Docker). لكن ماذا عن **الخوادم والشبكات وقواعد البيانات** التي يعمل عليها الكود؟ إعدادها بالنقر بطيء وغير متسق وغير موثّق. **البنية التحتية ككود (IaC)** تؤتمت تلك القطعة الأخيرة: بيئتك كاملة معرّفة في ملفات نصية، محفوظة في Git، تبنيها أداة.

(رأيت IaC في مسار السحابة — هنا إطار DevOps ومفهوم جديد حاسم.)

**نوعان من أدوات "ككود"، تُستخدمان معاً غالباً:**
- **التوفير (Terraform)** — ينشئ *البنية نفسها*: "اصنع 3 خوادم، قاعدة بيانات، وشبكة." تصريحي — تصف الحالة النهائية.
- **إدارة الإعداد (Ansible، Chef، Puppet)** — يهيّئ ما *داخل* كل خادم: "ثبّت nginx، انسخ ملفات الإعداد هذه، شغّل الخدمة."

معاً: Terraform يبني البيوت، وAnsible يؤثّثها.

**المفهوم الحاسم: الثبات (idempotency).** هذا ما يجعل IaC جديرة بالثقة. العملية **ثابتة (idempotent)** إذا أعطى تشغيلها مرة أو عشراً *نفس النتيجة*. "تأكّد من وجود 3 خوادم بالضبط" ثابتة — شغّلها مراراً وتنتهي دائماً بـ 3، لا 6 ولا 30. قارن سكربت "أضف خادماً" غير الثابت: شغّله ثلاث مرات فتجد ثلاثة خوادم إضافية بالخطأ. IaC الجيدة تُصرّح بـ*الحالة النهائية المطلوبة* (ثابتة)، لا قائمة أفعال (خطرة عند إعادة التشغيل). إنها نفس الأمان التصريحي للحالة المطلوبة في Kubernetes.

**لماذا يُكمل هذا DevOps:** الآن *كل شيء* — كود التطبيق، حاويته، اختباراته، خط نشره، وأيضاً البنية التي يعمل عليها — يعيش في Git، مُراجَعاً وقابلاً للتكرار. يمكنك تدمير بيئة الإنتاج كاملة وإعادة بنائها بشكل مطابق من ملفات نصية بدقائق. وعضو فريق جديد يقرأ المستودع فيفهم النظام كله. هذا حلم DevOps: الطريق كله من فكرة المطوّر إلى الإنتاج العامل مؤتمت، محفوظ بالإصدارات، وقابل للتكرار.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is idempotency?", ar: "ما هو الثبات (idempotency)؟" },
          choices: [
            { en: "Running an operation once or many times gives the same end result", ar: "تشغيل عملية مرة أو مرات يعطي نفس النتيجة النهائية" },
            { en: "Making code run faster", ar: "جعل الكود أسرع" },
            { en: "Deleting servers", ar: "حذف الخوادم" },
          ],
          answer: 0,
          explain: {
            en: "'Ensure 3 servers' run repeatedly always yields 3. Declaring desired state (not actions) makes re-running safe.",
            ar: "'تأكّد من 3 خوادم' مكرّراً ينتج دائماً 3. التصريح بالحالة المطلوبة (لا الأفعال) يجعل إعادة التشغيل آمنة.",
          },
        },
        {
          q: { en: "Terraform vs Ansible — the typical split?", ar: "Terraform مقابل Ansible — التقسيم النموذجي؟" },
          choices: [
            { en: "Terraform provisions infrastructure; Ansible configures what's inside servers", ar: "Terraform يوفّر البنية؛ وAnsible يهيّئ ما داخل الخوادم" },
            { en: "They do exactly the same thing", ar: "يفعلان نفس الشيء تماماً" },
            { en: "Both are databases", ar: "كلاهما قواعد بيانات" },
          ],
          answer: 0,
          explain: {
            en: "Terraform builds the houses (servers, networks); Ansible furnishes them (installs and configures software).",
            ar: "Terraform يبني البيوت (خوادم، شبكات)؛ وAnsible يؤثّثها (يثبّت ويهيّئ البرامج).",
          },
        },
        {
          q: { en: "Why is IaC the completion of the DevOps automation story?", ar: "لماذا IaC هي إتمام قصة أتمتة DevOps؟" },
          choices: [
            { en: "Now infrastructure too is in Git — reviewable, reproducible, rebuildable", ar: "الآن البنية أيضاً في Git — قابلة للمراجعة والتكرار وإعادة البناء" },
            { en: "It replaces the developers", ar: "تستبدل المطوّرين" },
            { en: "It makes the app prettier", ar: "تجعل التطبيق أجمل" },
          ],
          answer: 0,
          explain: {
            en: "With IaC, the whole system — code, container, pipeline, and infrastructure — is versioned and reproducible from text files.",
            ar: "مع IaC، النظام كله — الكود، الحاوية، الخط، والبنية — محفوظ بالإصدارات وقابل للتكرار من ملفات نصية.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- IaC automates infrastructure setup: whole environments as versioned code
- Terraform provisions; Ansible/Chef/Puppet configure inside servers
- Idempotency (declare desired state) makes IaC safe to re-run
- Now the entire system lives in Git — the DevOps dream

**Next:** Monitoring & Observability — knowing what your automated systems are actually doing in production.`,
        ar: `## الخلاصة

- IaC تؤتمت إعداد البنية: بيئات كاملة ككود محفوظ بالإصدارات
- Terraform يوفّر؛ وAnsible/Chef/Puppet يهيّئون داخل الخوادم
- الثبات (التصريح بالحالة المطلوبة) يجعل IaC آمنة لإعادة التشغيل
- الآن النظام كله يعيش في Git — حلم DevOps

**التالي:** المراقبة وقابلية الملاحظة — معرفة ما تفعله أنظمتك المؤتمتة فعلاً في الإنتاج.`,
      },
    },
  ],
};
