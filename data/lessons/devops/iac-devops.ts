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
      type: "text",
      body: {
        en: `## Plan before apply, and configuration drift 📐

Real IaC tools never just blindly change your infrastructure — they follow a **plan → apply** workflow, which is the safety mechanism that makes declarative infrastructure trustworthy in production:

\`\`\`bash
terraform plan   # "Here's exactly what I WOULD change: +2 servers, ~1 modified, -0"
terraform apply  # only after a human (or a pipeline gate) reviews and approves the plan
\`\`\`

\`plan\` compares your code's *desired state* against the *real, current state* of your infrastructure, and prints a preview — additions, changes, deletions — **without touching anything**. Only \`apply\` actually executes it. This two-step dance means nobody is ever surprised by what a deploy is about to do; the plan output is often attached to a Pull Request for teammates to review, exactly like reviewing code.

**Configuration drift** is the problem this whole workflow guards against: it happens when someone changes real infrastructure **outside of the IaC tool** — clicking around in a cloud console to "quickly fix" something. Now your Terraform files (the declared desired state) and reality have diverged. The next \`terraform plan\` will notice the mismatch and may try to "correct" the manual change back to what the code says — which is *exactly* why the rule in serious DevOps teams is: **all infrastructure changes go through the IaC code, no exceptions, no console-clicking.** Reality must always match the versioned, reviewed text file — never the other way around.`,
        ar: `## التخطيط قبل التطبيق، وانحراف الإعداد 📐

أدوات IaC الحقيقية لا تغيّر بنيتك التحتية بعمى أبداً — بل تتبع سير عمل **plan ← apply**، وهي آلية الأمان التي تجعل البنية التحتية التصريحية جديرة بالثقة في الإنتاج:

\`\`\`bash
terraform plan   # "هذا بالضبط ما سأغيّره: +2 خادم، ~1 معدَّل، -0"
terraform apply  # فقط بعد أن يراجع إنسان (أو بوابة خط) الخطة ويوافق عليها
\`\`\`

يقارن \`plan\` *الحالة المطلوبة* في كودك مع *الحالة الحقيقية الحالية* لبنيتك التحتية، ويطبع معاينة — إضافات، تغييرات، حذوفات — **دون لمس أي شيء**. \`apply\` فقط ينفّذها فعلياً. هذه الرقصة بخطوتين تعني ألا يتفاجأ أحد أبداً بما سيفعله نشر — مخرج الخطة غالباً يُرفق بـ Pull Request ليراجعه الزملاء، تماماً كمراجعة الكود.

**انحراف الإعداد (configuration drift)** هي المشكلة التي يحمي منها سير العمل هذا كله: يحدث حين يغيّر أحد البنية التحتية الحقيقية **خارج أداة IaC** — بالنقر هنا وهناك في لوحة تحكّم سحابية لـ"إصلاح شيء بسرعة." الآن ملفات Terraform (الحالة المطلوبة المُصرَّح بها) والواقع قد افترقا. \`terraform plan\` التالي سيلاحظ التباين وقد يحاول "تصحيح" التغيير اليدوي ليعود لما يقوله الكود — وهذا بالضبط سبب أن القاعدة في فرق DevOps الجادة: **كل تغييرات البنية التحتية تمر عبر كود IaC، بلا استثناءات، بلا نقر في لوحة تحكّم.** يجب أن يطابق الواقع دائماً الملف النصي المحفوظ بالإصدارات والمُراجَع — لا العكس أبداً.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Simulate \`terraform plan\`. Write \`planDiff(desired, current)\` where both are arrays of server names. Return \`{ toAdd, toRemove }\`:
- \`toAdd\`: names in \`desired\` but not in \`current\` (need to be created)
- \`toRemove\`: names in \`current\` but not in \`desired\` (need to be destroyed)`,
        ar: `حاكِ \`terraform plan\`. اكتب \`planDiff(desired, current)\` حيث كلاهما مصفوفة أسماء خوادم. أعِد \`{ toAdd, toRemove }\`:
- \`toAdd\`: أسماء في \`desired\` وليست في \`current\` (تحتاج إنشاءً)
- \`toRemove\`: أسماء في \`current\` وليست في \`desired\` (تحتاج تدميراً)`,
      },
      starterCode: `function planDiff(desired, current) {
  // toAdd: in desired but not current
  // toRemove: in current but not desired
}

console.log(planDiff(["web1","web2","db1"], ["web1","db1","cache1"]));
// { toAdd: ["web2"], toRemove: ["cache1"] }`,
      solution: `function planDiff(desired, current) {
  const toAdd = desired.filter((name) => !current.includes(name));
  const toRemove = current.filter((name) => !desired.includes(name));
  return { toAdd, toRemove };
}

console.log(planDiff(["web1","web2","db1"], ["web1","db1","cache1"]));
// { toAdd: ["web2"], toRemove: ["cache1"] }`,
      hints: [
        { en: `toAdd = desired.filter(name => !current.includes(name))`, ar: `toAdd = desired.filter(name => !current.includes(name))` },
        { en: `toRemove = current.filter(name => !desired.includes(name))`, ar: `toRemove = current.filter(name => !desired.includes(name))` },
      ],
      tests: [
        { name: { en: "Detects a server to add and one to remove", ar: "يكتشف خادماً للإضافة وآخر للحذف" }, check: `JSON.stringify(planDiff(["web1","web2","db1"],["web1","db1","cache1"])) === JSON.stringify({toAdd:["web2"],toRemove:["cache1"]})` },
        { name: { en: "No changes when desired equals current", ar: "لا تغييرات عندما desired تساوي current" }, check: `JSON.stringify(planDiff(["a","b"],["a","b"])) === JSON.stringify({toAdd:[],toRemove:[]})` },
        { name: { en: "Everything is new when current is empty", ar: "كل شيء جديد عندما current فارغة" }, check: `JSON.stringify(planDiff(["a","b"],[])) === JSON.stringify({toAdd:["a","b"],toRemove:[]})` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the console-click that broke the build 🔍

A pattern familiar to almost every team that adopts IaC: everything is humming along, infrastructure defined neatly in Terraform, until an engineer under time pressure needs a "quick fix" in production — a firewall rule, a bumped disk size — and just clicks it directly in the cloud provider's web console to save time. It works, the incident is resolved, everyone moves on.

Weeks later, someone runs \`terraform plan\` for an unrelated change, and it proposes *reverting* that manual fix back to the old, broken configuration — because as far as the code is concerned, that manual click never happened. If nobody notices the plan output carefully, \`apply\` silently undoes the fix and reintroduces the very problem it solved. This exact "drift" scenario is one of the most common IaC incidents reported across the industry, and it's precisely why the discipline in this lesson — *all* changes go through code, plan output is always reviewed, never click fixes directly into production — exists. The tool did exactly what it was told; the failure was a process failure, not a technology one.`,
        ar: `## دراسة حالة واقعية: نقرة لوحة التحكّم التي كسرت البناء 🔍

نمط مألوف لدى كل فريق تقريباً يتبنّى IaC: كل شيء يعمل بسلاسة، والبنية التحتية معرَّفة بدقة في Terraform، حتى يحتاج مهندس تحت ضغط الوقت "إصلاحاً سريعاً" في الإنتاج — قاعدة جدار ناري، زيادة حجم قرص — فينقرها مباشرة في لوحة تحكّم مزوّد السحابة توفيراً للوقت. يعمل الأمر، وتُحلّ الحادثة، ويمضي الجميع قدماً.

بعد أسابيع، يشغّل أحدهم \`terraform plan\` لتغيير غير متعلّق، فيقترح *التراجع* عن ذلك الإصلاح اليدوي عائداً للإعداد القديم المكسور — لأنه بقدر ما يهم الكود، تلك النقرة اليدوية لم تحدث أبداً. إن لم ينتبه أحد بعناية لمخرج الخطة، \`apply\` يُلغي الإصلاح بصمت ويعيد إدخال المشكلة نفسها التي حلّها. سيناريو "الانحراف" هذا بالضبط من أشيع حوادث IaC المُبلَّغ عنها عبر الصناعة، وهو بالضبط سبب وجود الانضباط في هذا الدرس — *كل* التغييرات تمر عبر الكود، مخرج الخطة يُراجَع دائماً، لا نقر إصلاحات مباشرة في الإنتاج أبداً. الأداة فعلت بالضبط ما طُلب منها؛ الفشل كان فشل عملية، لا تقنية.`,
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
        {
          q: { en: "What does `terraform plan` do?", ar: "ماذا يفعل `terraform plan`؟" },
          choices: [
            { en: "Previews exactly what would change, without touching any real infrastructure", ar: "يعاين بالضبط ما سيتغيّر، دون لمس أي بنية تحتية حقيقية" },
            { en: "Immediately deletes all resources", ar: "يحذف كل الموارد فوراً" },
            { en: "Deploys the application code", ar: "ينشر كود التطبيق" },
          ],
          answer: 0,
          explain: {
            en: "plan compares desired vs current state and prints a preview of additions/changes/deletions; only apply actually executes it.",
            ar: "plan يقارن الحالة المطلوبة بالحالية ويطبع معاينة للإضافات/التغييرات/الحذوفات؛ apply فقط ينفّذها فعلياً.",
          },
        },
        {
          q: { en: "What is 'configuration drift'?", ar: "ما هو 'انحراف الإعداد'؟" },
          choices: [
            { en: "Real infrastructure changed outside the IaC tool, so it no longer matches the code's declared state", ar: "تغيّرت البنية التحتية الحقيقية خارج أداة IaC، فلم تعد تطابق الحالة المُصرَّح بها في الكود" },
            { en: "A server physically moving to a new data center", ar: "خادم ينتقل فعلياً لمركز بيانات جديد" },
            { en: "Terraform code that has syntax errors", ar: "كود Terraform فيه أخطاء نحوية" },
          ],
          answer: 0,
          explain: {
            en: "Drift happens when someone manually changes infrastructure (e.g. clicking in a cloud console) instead of going through the IaC code — the next plan will detect the mismatch.",
            ar: "الانحراف يحدث حين يغيّر أحد البنية التحتية يدوياً (مثل النقر في لوحة تحكّم سحابية) بدل المرور عبر كود IaC — الخطة التالية ستكتشف التباين.",
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
- The plan → apply workflow previews changes safely; configuration drift is why all changes must go through code, never manual console clicks
- You built a plan-diff calculator that spots what needs adding vs removing
- Now the entire system lives in Git — the DevOps dream

**Next:** Monitoring & Observability — knowing what your automated systems are actually doing in production.`,
        ar: `## الخلاصة

- IaC تؤتمت إعداد البنية: بيئات كاملة ككود محفوظ بالإصدارات
- Terraform يوفّر؛ وAnsible/Chef/Puppet يهيّئون داخل الخوادم
- الثبات (التصريح بالحالة المطلوبة) يجعل IaC آمنة لإعادة التشغيل
- سير عمل plan ← apply يعاين التغييرات بأمان؛ وانحراف الإعداد سبب وجوب مرور كل تغيير عبر الكود، لا نقر لوحة تحكّم يدوي أبداً
- بنيت حاسبة فرق خطة تكتشف ما يحتاج إضافة مقابل حذفاً
- الآن النظام كله يعيش في Git — حلم DevOps

**التالي:** المراقبة وقابلية الملاحظة — معرفة ما تفعله أنظمتك المؤتمتة فعلاً في الإنتاج.`,
      },
    },
  ],
};
