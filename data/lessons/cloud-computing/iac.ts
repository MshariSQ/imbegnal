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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- IaC defines infrastructure in text files instead of manual clicking
- Terraform is the popular declarative tool: describe what you want, it builds it
- Benefits: reproducible, version-controlled, documented, safe
- You parsed a mini resource config

**Next:** Cloud Security — protecting all this infrastructure (IAM, encryption, the shared responsibility model).`,
        ar: `## الخلاصة

- IaC تعرّف البنية في ملفات نصية بدل النقر اليدوي
- Terraform الأداة التصريحية الشائعة: صِف ما تريد فيبنيه
- الفوائد: قابلة للتكرار، محفوظة بالإصدارات، موثّقة، آمنة
- حلّلت إعداد موارد مصغّراً

**التالي:** أمن السحابة — حماية كل هذه البنية (IAM، التشفير، نموذج المسؤولية المشتركة).`,
      },
    },
  ],
};
