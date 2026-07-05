import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "cicd",
  title: { en: "CI/CD Pipelines — Automated Delivery", ar: "خطوط CI/CD — التسليم الآلي" },
  estMinutes: 35,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What **CI** and **CD** actually mean
- The stages of a real pipeline
- Why automation beats manual deployment every time
- You'll build a pipeline-stage runner`,
        ar: `## ماذا ستتعلم

- ماذا تعني **CI** و**CD** فعلاً
- مراحل خط حقيقي
- لماذا تتفوّق الأتمتة على النشر اليدوي دائماً
- ستبني مشغّل مراحل خط`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The automated assembly line 🏭

CI/CD is the beating heart of DevOps — the **assembly line** that carries code from a Git push to live production, automatically.

**CI = Continuous Integration.** Every time anyone pushes code, an automated system immediately **builds it and runs the tests**. If something breaks, the team knows in *minutes*, not after release. This catches bugs while they're small and cheap — no more "it worked on my machine, why is main broken?"

**CD = Continuous Delivery/Deployment.** After CI passes, the code is automatically **prepared for release** (Delivery) or **pushed straight to production** (Deployment). The best teams deploy dozens of times a day, each change small and safe.

A typical pipeline is a sequence of **stages**, and if *any* stage fails, the pipeline stops — bad code never reaches users:

\`\`\`
push → [Build] → [Test] → [Security scan] → [Deploy to staging] → [Deploy to production]
          ✓         ✓            ✓                  ✓                     ✓
     (any ✗ stops the line and alerts the team)
\`\`\`

You define this pipeline as a config file in your repo (tools: **GitHub Actions**, GitLab CI, Jenkins). This very SkillForge site uses GitHub Actions — every push to main automatically builds the site and deploys it. That's CI/CD in action.

**Why it's transformative:**
- **Speed** — ship features in minutes, not weeks of manual release rituals.
- **Safety** — automated tests + gates catch problems *before* users do.
- **Consistency** — the same steps every time; no forgotten manual step at 2 a.m.
- **Confidence** — small, frequent, automated releases are far less risky than rare, giant, manual ones.

CI/CD is the skill that ties together everything in DevOps: Git triggers it, Docker is what it builds, and the cloud is where it deploys. Mastering pipelines is what makes you a DevOps engineer rather than just someone who knows the tools.`,
        ar: `## خط التجميع الآلي 🏭

CI/CD هو القلب النابض لـ DevOps — **خط التجميع** الذي يحمل الكود من دفعة Git إلى الإنتاج الحيّ، تلقائياً.

**CI = التكامل المستمر.** كلما دفع أحد كوداً، يقوم نظام آلي فوراً بـ**بنائه وتشغيل الاختبارات**. وإن انكسر شيء، يعرف الفريق خلال *دقائق*، لا بعد الإصدار. هذا يمسك الأخطاء وهي صغيرة رخيصة — لا مزيد من "نجح على جهازي، لماذا main مكسور؟"

**CD = التسليم/النشر المستمر.** بعد نجاح CI، يُحضَّر الكود تلقائياً **للإصدار** (Delivery) أو **يُدفع مباشرة للإنتاج** (Deployment). أفضل الفرق تنشر عشرات المرات يومياً، كل تغيير صغير وآمن.

الخط النموذجي سلسلة **مراحل**، وإن فشلت *أي* مرحلة يتوقف الخط — الكود السيّئ لا يصل المستخدمين أبداً:

\`\`\`
دفع → [بناء] → [اختبار] → [فحص أمني] → [نشر للتجهيز] → [نشر للإنتاج]
        ✓        ✓           ✓              ✓                ✓
   (أي ✗ يوقف الخط وينبّه الفريق)
\`\`\`

تعرّف هذا الخط كملف إعداد في مستودعك (أدوات: **GitHub Actions**، GitLab CI، Jenkins). موقع SkillForge نفسه يستخدم GitHub Actions — كل دفعة إلى main تبني الموقع وتنشره تلقائياً. هذا CI/CD في العمل.

**لماذا هو تحوّلي:**
- **السرعة** — اشحن الميزات بدقائق، لا أسابيع من طقوس الإصدار اليدوي.
- **الأمان** — الاختبارات الآلية + البوابات تمسك المشاكل *قبل* المستخدمين.
- **الاتساق** — نفس الخطوات كل مرة؛ بلا خطوة يدوية منسية الساعة 2 فجراً.
- **الثقة** — إصدارات صغيرة متكررة آلية أقل خطورة بكثير من نادرة عملاقة يدوية.

CI/CD هو المهارة التي تربط كل شيء في DevOps: Git يحفّزه، وDocker ما يبنيه، والسحابة حيث ينشر. إتقان الخطوط هو ما يجعلك مهندس DevOps لا مجرد شخص يعرف الأدوات.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Build a pipeline runner. Write \`runPipeline(stages)\` where \`stages\` is an array of \`{ name, passed }\`. Run them in order and return a string reporting where it stopped:
- If all pass: \`"SUCCESS: all stages passed"\`
- If one fails: \`"FAILED at <stage name>"\` (stop at the first failure — later stages don't run)`,
        ar: `ابنِ مشغّل خط. اكتب \`runPipeline(stages)\` حيث \`stages\` مصفوفة \`{ name, passed }\`. شغّلها بالترتيب وأعِد نصاً يبلّغ أين توقفت:
- إن نجحت كلها: \`"SUCCESS: all stages passed"\`
- إن فشلت واحدة: \`"FAILED at <اسم المرحلة>"\` (توقّف عند أول فشل — المراحل اللاحقة لا تعمل)`,
      },
      starterCode: `function runPipeline(stages) {
  // loop in order; on first passed === false, return "FAILED at " + name
  // if none fail, return "SUCCESS: all stages passed"
}

console.log(runPipeline([
  { name: "Build", passed: true },
  { name: "Test", passed: false },
  { name: "Deploy", passed: true },
]));
// "FAILED at Test"`,
      solution: `function runPipeline(stages) {
  for (const stage of stages) {
    if (!stage.passed) return "FAILED at " + stage.name;
  }
  return "SUCCESS: all stages passed";
}

console.log(runPipeline([
  { name: "Build", passed: true },
  { name: "Test", passed: false },
  { name: "Deploy", passed: true },
]));
// "FAILED at Test"`,
      hints: [
        { en: `Loop in order; the first stage with passed === false returns "FAILED at " + stage.name.`, ar: `كرّر بالترتيب؛ أول مرحلة passed === false تعيد "FAILED at " + stage.name.` },
        { en: `If the loop finishes with no failure, return the success message.`, ar: `إن انتهت الحلقة بلا فشل، أعِد رسالة النجاح.` },
      ],
      tests: [
        { name: { en: "Stops at the first failure", ar: "يتوقف عند أول فشل" }, check: `runPipeline([{name:"Build",passed:true},{name:"Test",passed:false},{name:"Deploy",passed:true}]) === "FAILED at Test"` },
        { name: { en: "All passing → success", ar: "الكل ناجح ← نجاح" }, check: `runPipeline([{name:"Build",passed:true},{name:"Test",passed:true}]) === "SUCCESS: all stages passed"` },
        { name: { en: "Fails at the very first stage", ar: "يفشل عند أول مرحلة" }, check: `runPipeline([{name:"Build",passed:false},{name:"Test",passed:true}]) === "FAILED at Build"` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is Continuous Integration (CI)?", ar: "ما هو التكامل المستمر (CI)؟" },
          choices: [
            { en: "Automatically building and testing code on every push", ar: "بناء واختبار الكود تلقائياً مع كل دفعة" },
            { en: "Manually deploying once a year", ar: "النشر يدوياً مرة سنوياً" },
            { en: "Writing documentation", ar: "كتابة التوثيق" },
          ],
          answer: 0,
          explain: {
            en: "CI runs build + tests automatically on each push, catching breakage in minutes instead of at release time.",
            ar: "CI يشغّل البناء + الاختبارات تلقائياً مع كل دفعة، ماسكاً الكسر بدقائق بدل وقت الإصدار.",
          },
        },
        {
          q: { en: "If a pipeline's Test stage fails, what happens?", ar: "إن فشلت مرحلة الاختبار في الخط، ماذا يحدث؟" },
          choices: [
            { en: "The pipeline stops and later stages don't run", ar: "يتوقف الخط والمراحل اللاحقة لا تعمل" },
            { en: "It deploys to production anyway", ar: "ينشر للإنتاج على أي حال" },
            { en: "It skips to the end", ar: "يقفز للنهاية" },
          ],
          answer: 0,
          explain: {
            en: "A failed gate stops the line and alerts the team, so broken code can't reach production. That's the safety net.",
            ar: "بوابة فاشلة توقف الخط وتنبّه الفريق، فلا يصل الكود المكسور للإنتاج. تلك شبكة الأمان.",
          },
        },
        {
          q: { en: "Why is frequent automated deployment safer than rare manual releases?", ar: "لماذا النشر الآلي المتكرر أأمن من الإصدارات اليدوية النادرة؟" },
          choices: [
            { en: "Small, tested changes are low-risk and easy to trace if something breaks", ar: "التغييرات الصغيرة المختبرة منخفضة الخطورة وسهلة التتبّع إن انكسر شيء" },
            { en: "Because it uses more servers", ar: "لأنه يستخدم خوادم أكثر" },
            { en: "It never fails", ar: "لا يفشل أبداً" },
          ],
          answer: 0,
          explain: {
            en: "Frequent small releases mean each change is isolated and easy to debug/roll back — far safer than a giant risky launch.",
            ar: "الإصدارات الصغيرة المتكررة تعني كل تغيير معزول وسهل التصحيح/التراجع — أأمن بكثير من إطلاق عملاق محفوف بالخطر.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- CI = auto build + test on every push; CD = auto prepare/deploy after CI passes
- Pipelines are staged; any failed stage stops bad code from shipping
- Tools: GitHub Actions, GitLab CI, Jenkins (this site uses GitHub Actions!)
- You built a stage-by-stage pipeline runner

**Next:** Kubernetes — orchestrating containers at scale in production.`,
        ar: `## الخلاصة

- CI = بناء + اختبار آلي مع كل دفعة؛ CD = تحضير/نشر آلي بعد نجاح CI
- الخطوط مرحلية؛ أي مرحلة فاشلة تمنع شحن الكود السيّئ
- الأدوات: GitHub Actions، GitLab CI، Jenkins (هذا الموقع يستخدم GitHub Actions!)
- بنيت مشغّل خط مرحلة بمرحلة

**التالي:** Kubernetes — تنسيق الحاويات على نطاق واسع في الإنتاج.`,
      },
    },
  ],
};
