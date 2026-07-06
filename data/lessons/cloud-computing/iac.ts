import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "iac",
  title: { en: "Infrastructure as Code — Cloud in Text Files", ar: "البنية التحتية ككود — السحابة في ملفات نصية" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why clicking in the cloud console doesn't scale
- **Infrastructure as Code (IaC)** — defining servers in text
- Terraform and the declarative idea
- You'll parse a mini infrastructure config`,
        ar: `## ماذا ستتعلم

- لماذا لا يتوسّع النقر في واجهة السحابة
- **البنية التحتية ككود (IaC)** — تعريف الخوادم بالنص
- Terraform والفكرة التصريحية
- ستحلّل إعداد بنية تحتية مصغّراً`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Blueprints, not handcrafting 📐

Imagine building 50 identical servers by clicking through a web console for each one. Slow, error-prone, and impossible to reproduce exactly. Now imagine a colleague asks "how is production set up?" — nobody truly knows, because it was all click-click-click over two years.

**Infrastructure as Code (IaC)** fixes this: you describe your entire cloud setup — servers, databases, networks, permissions — in **text files**, and a tool builds it for you. The infrastructure becomes a **blueprint you can version in Git**, review, and reproduce perfectly.

The most popular tool is **Terraform**. You write *what you want* (declarative), not *how to build it*:

\`\`\`hcl
resource "aws_instance" "web" {
  ami           = "ami-12345"
  instance_type = "t2.micro"
  tags = {
    Name = "web-server"
  }
}
\`\`\`

Run \`terraform apply\` and it creates exactly that server. Change \`t2.micro\` to \`t2.large\` and apply again — it resizes. Delete the block and apply — it removes the server. Your infrastructure now matches your code, always.

**Why this is transformative:**
- **Reproducible** — spin up an identical staging copy of production in minutes.
- **Version-controlled** — every infrastructure change is a Git commit you can review and roll back (remember Git from the frontend track?).
- **Documented** — the code *is* the documentation; there's no "mystery setup."
- **Fast & safe** — no manual clicking means no forgotten steps or human slips.

**Declarative vs imperative:** IaC is *declarative* — you state the desired end result ("I want one t2.micro server") and the tool figures out the steps. That's different from *imperative* code where you list every action. Declarative is why IaC is so reliable: you describe the destination, not the route.

This is a core skill for cloud engineers and DevOps — companies run entire global infrastructures from a folder of text files.`,
        ar: `## مخططات لا صناعة يدوية 📐

تخيّل بناء 50 خادماً متطابقاً بالنقر في واجهة ويب لكل واحد. بطيء، معرّض للخطأ، ويستحيل إعادة إنتاجه بدقة. الآن تخيّل زميلاً يسأل "كيف أُعدّ الإنتاج؟" — لا أحد يعرف حقاً، لأن كل شيء كان نقراً-نقراً على مدى سنتين.

**البنية التحتية ككود (IaC)** تحل هذا: تصف إعداد سحابتك كاملاً — خوادم، قواعد بيانات، شبكات، صلاحيات — في **ملفات نصية**، وتبنيها أداة لك. تصبح البنية **مخططاً تحفظه في Git**، تراجعه، وتعيد إنتاجه بإتقان.

الأداة الأشهر **Terraform**. تكتب *ما تريد* (تصريحي)، لا *كيف تبنيه*:

\`\`\`hcl
resource "aws_instance" "web" {
  ami           = "ami-12345"
  instance_type = "t2.micro"
  tags = {
    Name = "web-server"
  }
}
\`\`\`

نفّذ \`terraform apply\` فينشئ ذلك الخادم بالضبط. غيّر \`t2.micro\` إلى \`t2.large\` وطبّق مجدداً — يعيد التحجيم. احذف الكتلة وطبّق — يزيل الخادم. بنيتك الآن تطابق كودك، دائماً.

**لماذا هذا تحوّلي:**
- **قابل للتكرار** — أنشئ نسخة اختبار مطابقة للإنتاج بدقائق.
- **محفوظ بالإصدارات** — كل تغيير بنية هو commit في Git تراجعه وتتراجع عنه (تذكّر Git من مسار الواجهات؟).
- **موثّق** — الكود *هو* التوثيق؛ لا "إعداد غامض".
- **سريع وآمن** — بلا نقر يدوي يعني بلا خطوات منسية أو زلّات بشرية.

**تصريحي مقابل أمري:** IaC *تصريحي* — تذكر النتيجة النهائية المطلوبة ("أريد خادم t2.micro واحداً") وتحسب الأداة الخطوات. يختلف عن الكود *الأمري* حيث تسرد كل فعل. التصريحية هي لماذا IaC موثوقة جداً: تصف الوجهة لا الطريق.

هذه مهارة أساسية لمهندسي السحابة وDevOps — شركات تدير بُنى عالمية كاملة من مجلد ملفات نصية.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## State files and drift: keeping the blueprint honest 📋

Terraform's declarative model has a subtle requirement: to know what to *change*, it needs to know what it *already built*. That record is the **state file** — Terraform's memory of every resource it created, matched to the config that describes it.

Every time you run \`terraform apply\`, Terraform does three things: reads your config (desired state), reads the state file (what it believes exists), and compares them to compute the minimal set of changes needed. This is why deleting a block and applying removes exactly that resource — Terraform diffs desired vs. remembered state, not desired vs. "everything in the cloud."

This creates a real risk called **drift**: when someone manually changes a resource outside of Terraform — clicking in the AWS console to resize a server "just this once" — the actual cloud no longer matches the state file. Terraform doesn't know about the change until you run it again, at which point it may try to "fix" your manual tweak back to what the code says, silently undoing work, or the reverse: you assume the code describes reality when it no longer does.

The discipline that avoids drift is simple but strict: **all changes go through code, always** — no manual console clicks on Terraform-managed resources, ever. Teams also run scheduled \`terraform plan\` checks specifically to catch drift early, before it causes an incident. This is the same discipline as "the code is the documentation" from earlier in this lesson — the moment reality diverges from the code, that promise is broken.`,
        ar: `## ملفات الحالة والانحراف: إبقاء المخطط صادقاً 📋

نموذج Terraform التصريحي له متطلب دقيق: لمعرفة ما *يغيّره*، يحتاج معرفة ما *بناه بالفعل*. ذلك السجل هو **ملف الحالة (state file)** — ذاكرة Terraform لكل مورد أنشأه، مطابقاً للإعداد الذي يصفه.

في كل مرة تنفّذ \`terraform apply\`، يفعل Terraform ثلاثة أشياء: يقرأ إعدادك (الحالة المرغوبة)، يقرأ ملف الحالة (ما يعتقد أنه موجود)، ويقارنهما لحساب أقل مجموعة تغييرات لازمة. لهذا حذف كتلة وتطبيقها يزيل ذلك المورد بالضبط — Terraform يقارن المرغوب بالمحفوظ، لا المرغوب بـ"كل شيء في السحابة".

هذا يخلق خطراً حقيقياً يُسمى **الانحراف (drift)**: حين يغيّر أحدهم مورداً يدوياً خارج Terraform — بالنقر في واجهة AWS لتغيير حجم خادم "لمرة واحدة فقط" — لم تعد السحابة الفعلية تطابق ملف الحالة. لا يعرف Terraform بالتغيير حتى تشغّله مجدداً، وعندها قد يحاول "إصلاح" تعديلك اليدوي وإعادته لما يقوله الكود، فيُبطل العمل بصمت، أو العكس: تفترض أن الكود يصف الواقع بينما لم يعد كذلك.

الانضباط الذي يتجنّب الانحراف بسيط لكنه صارم: **كل التغييرات تمرّ عبر الكود، دائماً** — بلا نقرات يدوية في الواجهة على موارد يديرها Terraform، أبداً. الفرق أيضاً تشغّل فحوصات \`terraform plan\` مجدولة تحديداً لالتقاط الانحراف مبكراً، قبل أن يسبب حادثة. هذا نفس انضباط "الكود هو التوثيق" من سابقاً في هذا الدرس — لحظة تباعد الواقع عن الكود، ينكسر ذلك الوعد.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `IaC tools read config and report what they'll build. Write \`summarize(resources)\` where \`resources\` is an array of \`{ type, name }\` objects. Return a string like \`"2 resources: web (aws_instance), db (aws_db)"\` — the count, then each name with its type in parentheses, comma-separated.`,
        ar: `أدوات IaC تقرأ الإعداد وتبلّغ بما ستبنيه. اكتب \`summarize(resources)\` حيث \`resources\` مصفوفة كائنات \`{ type, name }\`. أعِد نصاً مثل \`"2 resources: web (aws_instance), db (aws_db)"\` — العدد، ثم كل اسم مع نوعه بين قوسين، مفصولة بفواصل.`,
      },
      starterCode: `function summarize(resources) {
  // build "N resources: name1 (type1), name2 (type2)"
}

console.log(summarize([
  { type: "aws_instance", name: "web" },
  { type: "aws_db", name: "db" },
]));
// "2 resources: web (aws_instance), db (aws_db)"`,
      solution: `function summarize(resources) {
  const parts = resources.map((r) => r.name + " (" + r.type + ")");
  return resources.length + " resources: " + parts.join(", ");
}

console.log(summarize([
  { type: "aws_instance", name: "web" },
  { type: "aws_db", name: "db" },
]));
// "2 resources: web (aws_instance), db (aws_db)"`,
      hints: [
        { en: `Map each resource to \`name + " (" + type + ")"\`.`, ar: `حوّل كل مورد إلى \`name + " (" + type + ")"\`.` },
        { en: `Join with ", " and prefix with \`resources.length + " resources: "\`.`, ar: `اجمع بـ ", " وابدأ بـ \`resources.length + " resources: "\`.` },
      ],
      tests: [
        { name: { en: "Summarizes two resources", ar: "يلخّص موردين" }, check: `summarize([{type:"aws_instance",name:"web"},{type:"aws_db",name:"db"}]) === "2 resources: web (aws_instance), db (aws_db)"` },
        { name: { en: "Handles a single resource", ar: "يتعامل مع مورد واحد" }, check: `summarize([{type:"t",name:"a"}]) === "1 resources: a (t)"` },
        { name: { en: "Counts correctly", ar: "يعدّ بشكل صحيح" }, check: `summarize([{type:"x",name:"a"},{type:"y",name:"b"},{type:"z",name:"c"}]).startsWith("3 resources:")` },
      ],
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: "**Build a drift detector.** Write `findDrift(stateValues, actualValues)` — both are objects mapping resource name to a value (e.g. instance type). Return an array of resource names where `actualValues[name]` does not equal `stateValues[name]` — these are the resources that drifted from what Terraform's state file expects. Return names in the order they appear in `stateValues`.",
        ar: "**ابنِ كاشف انحراف.** اكتب `findDrift(stateValues, actualValues)` — كلاهما كائنات تربط اسم المورد بقيمة (مثل نوع النسخة). أعِد مصفوفة أسماء الموارد حيث `actualValues[name]` لا تساوي `stateValues[name]` — هذه هي الموارد التي انحرفت عمّا يتوقعه ملف حالة Terraform. أعِد الأسماء بترتيب ظهورها في `stateValues`.",
      },
      starterCode: `function findDrift(stateValues, actualValues) {
  // TODO: return names where actualValues[name] !== stateValues[name]
}
`,
      solution: `function findDrift(stateValues, actualValues) {
  return Object.keys(stateValues).filter(
    (name) => actualValues[name] !== stateValues[name]
  );
}
`,
      hints: [
        { en: "Object.keys(stateValues) gives you the resource names to check, in order.", ar: "Object.keys(stateValues) يعطيك أسماء الموارد للفحص، بالترتيب." },
        { en: "Filter to names where the two objects disagree: actualValues[name] !== stateValues[name].", ar: "رشّح للأسماء حيث يختلف الكائنان: actualValues[name] !== stateValues[name]." },
      ],
      tests: [
        { name: { en: "No drift returns empty array", ar: "بلا انحراف تعيد مصفوفة فارغة" }, check: `JSON.stringify(findDrift({web:"t2.micro"},{web:"t2.micro"})) === "[]"` },
        { name: { en: "Detects one drifted resource", ar: "يكتشف مورداً واحداً منحرفاً" }, check: `JSON.stringify(findDrift({web:"t2.micro",db:"db.small"},{web:"t2.large",db:"db.small"})) === '["web"]'` },
        { name: { en: "Detects multiple drifted resources", ar: "يكتشف عدة موارد منحرفة" }, check: `JSON.stringify(findDrift({a:"1",b:"2"},{a:"9",b:"9"})) === '["a","b"]'` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: HashiCorp and the rise of IaC 🔍

Terraform was first released in 2014 by HashiCorp, at a time when most companies still configured cloud servers by hand or with ad-hoc scripts. Its core bet — that infrastructure should be described declaratively in a cloud-agnostic language and version-controlled like application code — was unproven at the scale it eventually reached.

A decade later, Terraform had become the de facto standard for IaC across the industry, used by a large share of companies running production workloads on AWS, Azure, and Google Cloud, specifically because it solved the "nobody knows how production is configured" problem described at the start of this lesson at massive scale. Large enterprises with thousands of cloud resources now manage them from version-controlled repositories of Terraform files, with changes reviewed like any other code change before they touch production.

The broader lesson mirrors this lesson's theme directly: the industry converged on Terraform not because clicking in a console was impossible, but because at any real scale, undocumented manual infrastructure becomes unmanageable risk — while code that describes infrastructure is reviewable, testable, and recoverable. IaC went from a nice-to-have to the baseline expectation for any serious cloud operation.`,
        ar: `## دراسة حالة واقعية: HashiCorp وصعود IaC 🔍

أُطلق Terraform لأول مرة عام 2014 من HashiCorp، في وقت كانت فيه معظم الشركات ما زالت تعدّ خوادم السحابة يدوياً أو بسكربتات مرتجلة. رهانه الجوهري — أن البنية التحتية يجب أن تُوصف تصريحياً بلغة محايدة عن السحابة ومحفوظة بالإصدارات كأي كود تطبيق — لم يكن مثبتاً بالمقياس الذي وصله لاحقاً.

بعد عقد، أصبح Terraform المعيار الفعلي لـ IaC في الصناعة، تستخدمه حصة كبيرة من الشركات التي تشغّل أحمال إنتاج على AWS وAzure وGoogle Cloud، تحديداً لأنه حلّ مشكلة "لا أحد يعرف كيف أُعدّ الإنتاج" الموصوفة في بداية هذا الدرس، على نطاق هائل. مؤسسات كبرى بآلاف موارد السحابة تديرها الآن من مستودعات ملفات Terraform محفوظة بالإصدارات، وتُراجع التغييرات كأي تغيير كود آخر قبل أن تلمس الإنتاج.

الدرس الأوسع يعكس موضوع هذا الدرس مباشرة: التقت الصناعة على Terraform ليس لأن النقر في الواجهة كان مستحيلاً، بل لأنه على أي مقياس حقيقي، تصبح البنية التحتية اليدوية غير الموثّقة خطراً لا يمكن إدارته — بينما الكود الذي يصف البنية قابل للمراجعة والاختبار والاستعادة. تحوّل IaC من ميزة إضافية إلى التوقّع الأساسي لأي عملية سحابية جادة.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is Infrastructure as Code?", ar: "ما هي البنية التحتية ككود؟" },
          choices: [
            { en: "Defining cloud resources in text files a tool builds for you", ar: "تعريف موارد السحابة في ملفات نصية تبنيها أداة لك" },
            { en: "Writing apps in assembly", ar: "كتابة التطبيقات بلغة التجميع" },
            { en: "A type of database", ar: "نوع قاعدة بيانات" },
          ],
          answer: 0,
          explain: {
            en: "IaC describes servers, networks, and permissions as code (e.g. Terraform), so infrastructure is versioned and reproducible.",
            ar: "IaC تصف الخوادم والشبكات والصلاحيات ككود (مثل Terraform)، فتصبح البنية محفوظة بالإصدارات وقابلة للتكرار.",
          },
        },
        {
          q: { en: "IaC is 'declarative'. That means…", ar: "IaC 'تصريحية'. هذا يعني…" },
          choices: [
            { en: "You describe the desired end state; the tool figures out the steps", ar: "تصف الحالة النهائية المطلوبة؛ وتحسب الأداة الخطوات" },
            { en: "You list every command manually", ar: "تسرد كل أمر يدوياً" },
            { en: "It only declares variables", ar: "تعلن المتغيرات فقط" },
          ],
          answer: 0,
          explain: {
            en: "State the destination ('one t2.micro'), not the route. The tool computes and applies the needed changes.",
            ar: "اذكر الوجهة ('t2.micro واحد')، لا الطريق. تحسب الأداة التغييرات اللازمة وتطبّقها.",
          },
        },
        {
          q: { en: "A key benefit of IaC is…", ar: "فائدة أساسية لـ IaC هي…" },
          choices: [
            { en: "Infrastructure is version-controlled in Git and reproducible", ar: "البنية محفوظة بالإصدارات في Git وقابلة للتكرار" },
            { en: "It makes servers physically smaller", ar: "تجعل الخوادم أصغر فيزيائياً" },
            { en: "It removes the need for the cloud", ar: "تلغي الحاجة للسحابة" },
          ],
          answer: 0,
          explain: {
            en: "Every change is a reviewable, revertible commit, and you can recreate identical environments on demand. No mystery setups.",
            ar: "كل تغيير commit قابل للمراجعة والتراجع، ويمكنك إعادة إنشاء بيئات متطابقة عند الطلب. بلا إعدادات غامضة.",
          },
        },
        {
          q: { en: "What is a Terraform 'state file' for?", ar: "لأجل ماذا 'ملف الحالة' في Terraform؟" },
          choices: [
            { en: "It records what Terraform has already built, so it can compute the minimal changes needed", ar: "يسجّل ما بناه Terraform بالفعل، ليحسب أقل تغييرات لازمة" },
            { en: "It stores your AWS password", ar: "يخزّن كلمة مرور AWS الخاصة بك" },
            { en: "It's just a backup copy of the config file", ar: "مجرد نسخة احتياطية من ملف الإعداد" },
          ],
          answer: 0,
          explain: {
            en: "Terraform compares your config (desired state) against the state file (remembered state) to figure out exactly what to create, change, or delete.",
            ar: "يقارن Terraform إعدادك (الحالة المرغوبة) بملف الحالة (الحالة المحفوظة) ليحدد بالضبط ما يُنشئ أو يغيّر أو يحذف.",
          },
        },
        {
          q: { en: "What is 'drift' in Infrastructure as Code?", ar: "ما هو 'الانحراف' في البنية التحتية ككود؟" },
          choices: [
            { en: "When a manual change outside the IaC tool makes real infrastructure no longer match the code", ar: "حين يجعل تغيير يدوي خارج أداة IaC البنيةَ الفعلية لا تطابق الكود" },
            { en: "A server physically moving to another data center", ar: "خادم ينتقل فيزيائياً لمركز بيانات آخر" },
            { en: "A normal, harmless part of every terraform apply", ar: "جزء طبيعي غير ضار من كل terraform apply" },
          ],
          answer: 0,
          explain: {
            en: "Manual console changes desync reality from the state file. The fix is discipline: all changes go through code, with scheduled checks to catch drift early.",
            ar: "التغييرات اليدوية في الواجهة تُخرج الواقع عن التزامن مع ملف الحالة. الحل انضباط: كل التغييرات عبر الكود، مع فحوصات مجدولة لالتقاط الانحراف مبكراً.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- IaC defines infrastructure in text files instead of manual clicking
- Terraform is the popular declarative tool: describe what you want, it builds it
- Benefits: reproducible, version-controlled, documented, safe
- The state file tracks what's built, and drift happens when manual changes desync it from reality
- You parsed a mini resource config and wrote a drift detector
- Terraform's rise shows how IaC became the baseline expectation for serious cloud operations

**Next:** Cloud Security — protecting all this infrastructure (IAM, encryption, the shared responsibility model).`,
        ar: `## الخلاصة

- IaC تعرّف البنية في ملفات نصية بدل النقر اليدوي
- Terraform الأداة التصريحية الشائعة: صِف ما تريد فيبنيه
- الفوائد: قابلة للتكرار، محفوظة بالإصدارات، موثّقة، آمنة
- ملف الحالة يتتبّع ما بُني، ويحدث الانحراف حين تُخرج تغييرات يدوية التزامن مع الواقع
- حلّلت إعداد موارد مصغّراً وكتبت كاشف انحراف
- صعود Terraform يُظهر كيف أصبح IaC التوقّع الأساسي لأي عملية سحابية جادة

**التالي:** أمن السحابة — حماية كل هذه البنية (IAM، التشفير، نموذج المسؤولية المشتركة).`,
      },
    },
  ],
};
