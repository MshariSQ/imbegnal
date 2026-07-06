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

You define this pipeline as a config file in your repo (tools: **GitHub Actions**, GitLab CI, Jenkins). This very IMBEGNAL site uses GitHub Actions — every push to main automatically builds the site and deploys it. That's CI/CD in action.

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

تعرّف هذا الخط كملف إعداد في مستودعك (أدوات: **GitHub Actions**، GitLab CI، Jenkins). موقع IMBEGNAL نفسه يستخدم GitHub Actions — كل دفعة إلى main تبني الموقع وتنشره تلقائياً. هذا CI/CD في العمل.

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
      type: "text",
      body: {
        en: `## Triggers and parallel stages ⚡

So far you've seen a pipeline as one straight line. Two more ideas make real pipelines faster and smarter.

**Triggers.** A pipeline doesn't run because someone remembers to click a button — it runs because an event fired. The most common trigger is a **webhook**: GitHub itself calls your CI system's API the instant you push, saying "new commit on branch X, go!" Teams also configure *different* triggers for *different* branches: a push to any feature branch might only run **Build + Test** (fast feedback for the developer), while a push to \`main\` runs the **full pipeline** including deploy stages. A **scheduled trigger** (like a cron job) can also kick off a pipeline nightly — useful for slow test suites you don't want blocking every push.

**Parallel stages.** Not every stage has to wait for the one before it. If "run unit tests" and "run a linter" don't depend on each other, a smart pipeline runs them **at the same time**, on separate machines, instead of one after another:

\`\`\`
push → [Build] → ┬→ [Unit tests]   ┬→ [Deploy]
                  └→ [Lint + scan] ┘
        (both branches run in parallel, pipeline waits for both before deploying)
\`\`\`

This is called a **fan-out/fan-in** shape, and it's why a pipeline with 10 stages can still finish in a couple of minutes — independent checks run simultaneously, and only truly sequential steps (you can't deploy before tests pass) wait their turn. Recognizing which stages *must* be sequential and which can run in parallel is a core pipeline-design skill.`,
        ar: `## المُحفّزات والمراحل المتوازية ⚡

حتى الآن رأيت الخط كخط مستقيم واحد. فكرتان إضافيتان تجعلان الخطوط الحقيقية أسرع وأذكى.

**المُحفّزات (Triggers).** لا يعمل الخط لأن أحداً تذكّر النقر على زر — بل لأن حدثاً أُطلق. أشيع مُحفّز هو **webhook**: GitHub نفسه يستدعي واجهة برمجة نظام CI عندك لحظة الدفع، قائلاً "commit جديد على الفرع X، انطلق!" تُعِدّ الفرق أيضاً مُحفّزات *مختلفة* لفروع *مختلفة*: دفعة لأي فرع ميزة قد تشغّل فقط **البناء + الاختبار** (تغذية راجعة سريعة للمطوّر)، بينما دفعة إلى \`main\` تشغّل **الخط الكامل** بما فيه مراحل النشر. **المُحفّز المجدوَل** (مثل مهمة cron) يمكنه أيضاً إطلاق خط ليلاً — مفيد لمجموعات اختبار بطيئة لا تريدها تعطّل كل دفعة.

**المراحل المتوازية.** ليس على كل مرحلة الانتظار للتي قبلها. إن كانت "شغّل اختبارات الوحدة" و"شغّل فاحص أسلوب الكود" لا تعتمدان على بعضهما، يشغّلهما خط ذكي **في نفس الوقت**، على آلات منفصلة، بدل واحدة تلو الأخرى:

\`\`\`
دفع → [بناء] → ┬→ [اختبارات وحدة] ┬→ [نشر]
              └→ [فحص أسلوب + مسح] ┘
      (يعمل الفرعان معاً، والخط ينتظر كليهما قبل النشر)
\`\`\`

هذا يُسمّى شكل **fan-out/fan-in**، وهو سبب أن خطاً بـ10 مراحل قد ينتهي خلال دقيقتين — الفحوص المستقلة تعمل في آن واحد، وفقط الخطوات المتسلسلة حقاً (لا يمكن النشر قبل نجاح الاختبارات) تنتظر دورها. تمييز أي المراحل *يجب* أن تكون متسلسلة وأيها يمكن أن تتوازى مهارة أساسية في تصميم الخطوط.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Build a trigger router. Write \`pipelineFor(branch)\` that decides which pipeline to run based on the branch name:
- if \`branch\` is \`"main"\`, return \`"full"\` (build + test + scan + deploy)
- otherwise, return \`"fast"\` (build + test only)

This mirrors how real CI systems configure different jobs per branch.`,
        ar: `ابنِ موجّه مُحفّزات. اكتب \`pipelineFor(branch)\` يقرر أي خط يُشغَّل بناءً على اسم الفرع:
- إن كان \`branch\` هو \`"main"\`، أعِد \`"full"\` (بناء + اختبار + مسح + نشر)
- وإلا، أعِد \`"fast"\` (بناء + اختبار فقط)

هذا يحاكي كيف تُعِدّ أنظمة CI الحقيقية مهام مختلفة لكل فرع.`,
      },
      starterCode: `function pipelineFor(branch) {
  // TODO: "main" -> "full", anything else -> "fast"
}

console.log(pipelineFor("main"));            // "full"
console.log(pipelineFor("feature/login"));   // "fast"`,
      solution: `function pipelineFor(branch) {
  return branch === "main" ? "full" : "fast";
}

console.log(pipelineFor("main"));            // "full"
console.log(pipelineFor("feature/login"));   // "fast"`,
      hints: [
        { en: `A single ternary is enough: branch === "main" ? "full" : "fast".`, ar: `شرط واحد يكفي: branch === "main" ? "full" : "fast".` },
        { en: `Everything that isn't exactly "main" falls into the "fast" case.`, ar: `كل ما ليس "main" بالضبط يقع في حالة "fast".` },
      ],
      tests: [
        { name: { en: "main gets the full pipeline", ar: "main يحصل على الخط الكامل" }, check: `pipelineFor("main") === "full"` },
        { name: { en: "A feature branch gets the fast pipeline", ar: "فرع ميزة يحصل على الخط السريع" }, check: `pipelineFor("feature/login") === "fast"` },
        { name: { en: "A hotfix branch also gets the fast pipeline", ar: "فرع إصلاح عاجل يحصل أيضاً على الخط السريع" }, check: `pipelineFor("hotfix/bug-123") === "fast"` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Knight Capital's $440M deployment 🔍

In August 2012, Knight Capital, a major U.S. trading firm, deployed new trading software to its production servers. The deployment process was manual: an engineer had to copy the new code to **eight** servers by hand. They missed one — it still ran old, dormant test code left over from years earlier.

When markets opened, that one server's leftover code activated and began firing enormous, unintended stock orders. Nobody had an automated pipeline that verified *all eight* servers ran the *same, correct* version before going live — so nothing caught the mismatch. It took 45 minutes to even diagnose the problem, by which point Knight Capital had lost roughly **$440 million** and nearly went bankrupt overnight.

The lesson is exactly what this lesson teaches: a real CI/CD pipeline builds **one verified artifact** and deploys that *identical* artifact everywhere, with automated checks confirming every target matches — eliminating the "we forgot one server" class of failure entirely.`,
        ar: `## دراسة حالة واقعية: نشر Knight Capital بخسارة 440 مليون دولار 🔍

في أغسطس 2012، نشرت Knight Capital، شركة تداول أمريكية كبرى، برمجية تداول جديدة على خوادم إنتاجها. كانت عملية النشر يدوية: على مهندس نسخ الكود الجديد إلى **ثمانية** خوادم يدوياً. فاته واحد — وبقي يعمل بكود اختبار قديم خامل من سنوات سابقة.

حين فُتحت الأسواق، نشط كود ذلك الخادم المتبقي وبدأ بإطلاق أوامر أسهم ضخمة غير مقصودة. لم يكن لدى أحد خط آلي يتحقق أن *الثمانية خوادم كلها* تعمل بنفس النسخة *الصحيحة* قبل التشغيل الحيّ — فلم يلتقط شيء التباين. استغرق الأمر 45 دقيقة حتى لتشخيص المشكلة، وبحلول ذلك الوقت خسرت Knight Capital نحو **440 مليون دولار** وكادت تُفلس بين ليلة وضحاها.

الدرس هو بالضبط ما يعلّمه هذا الدرس: خط CI/CD حقيقي يبني **قطعة واحدة مُتحقَّقة** وينشر تلك القطعة *المطابقة* في كل مكان، بفحوص آلية تؤكد أن كل هدف مطابق — ما يُلغي فئة "نسينا خادماً" من الأخطاء كلياً.`,
      },
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
        {
          q: { en: "What typically triggers a CI/CD pipeline to run?", ar: "ما الذي يُحفّز عادة تشغيل خط CI/CD؟" },
          choices: [
            { en: "A webhook event, like a Git push, calling the CI system's API", ar: "حدث webhook، مثل دفعة Git، يستدعي واجهة برمجة نظام CI" },
            { en: "An engineer manually clicking a button every time", ar: "مهندس ينقر زراً يدوياً في كل مرة" },
            { en: "It runs continuously with no start signal", ar: "يعمل باستمرار بلا إشارة بدء" },
          ],
          answer: 0,
          explain: {
            en: "Real pipelines are event-driven: a webhook fires the instant you push, so the pipeline starts automatically without anyone remembering to trigger it.",
            ar: "الخطوط الحقيقية تعمل بالأحداث: webhook يُطلَق لحظة الدفع، فيبدأ الخط تلقائياً دون أن يتذكر أحد تشغيله.",
          },
        },
        {
          q: { en: "Why do pipelines run independent stages (like tests and linting) in parallel?", ar: "لماذا تشغّل الخطوط المراحل المستقلة (مثل الاختبارات وفحص الأسلوب) بالتوازي؟" },
          choices: [
            { en: "To finish faster, since stages that don't depend on each other don't need to wait in line", ar: "لتنتهي أسرع، لأن المراحل التي لا تعتمد على بعضها لا تحتاج الانتظار في طابور" },
            { en: "Parallel stages are required by law", ar: "المراحل المتوازية مطلوبة قانونياً" },
            { en: "It has no effect on pipeline speed", ar: "لا تأثير له على سرعة الخط" },
          ],
          answer: 0,
          explain: {
            en: "Fan-out/fan-in lets independent checks run simultaneously on separate machines, so a pipeline with many stages can still finish quickly.",
            ar: "شكل fan-out/fan-in يتيح للفحوص المستقلة العمل في آن واحد على آلات منفصلة، فينتهي خط بمراحل كثيرة بسرعة رغم ذلك.",
          },
        },
        {
          q: { en: "What actually caused Knight Capital's $440M loss in 2012?", ar: "ما الذي سبب فعلياً خسارة Knight Capital بـ440 مليون دولار عام 2012؟" },
          choices: [
            { en: "A manual deployment missed one server, which kept running old leftover code", ar: "نشر يدوي فاته خادم واحد، بقي يعمل بكود قديم متبقٍ" },
            { en: "A hacker broke into their trading systems", ar: "اخترق قرصان أنظمة تداولهم" },
            { en: "Their CI/CD pipeline had too many automated tests", ar: "خط CI/CD لديهم كان فيه اختبارات آلية كثيرة" },
          ],
          answer: 0,
          explain: {
            en: "The deployment was manual and inconsistent across eight servers; one kept stale code, and there was no automated check verifying every server matched.",
            ar: "كان النشر يدوياً وغير متسق عبر ثمانية خوادم؛ بقي أحدها بكود قديم، ولم يكن هناك فحص آلي يتحقق من تطابق كل خادم.",
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
- Pipelines are event-driven (webhook triggers) and can run independent stages in parallel (fan-out/fan-in) to finish faster
- You built a stage-by-stage pipeline runner and a branch-based trigger router
- Knight Capital's 2012 $440M loss shows why deploying one verified, identical artifact everywhere matters

**Next:** Kubernetes — orchestrating containers at scale in production.`,
        ar: `## الخلاصة

- CI = بناء + اختبار آلي مع كل دفعة؛ CD = تحضير/نشر آلي بعد نجاح CI
- الخطوط مرحلية؛ أي مرحلة فاشلة تمنع شحن الكود السيّئ
- الأدوات: GitHub Actions، GitLab CI، Jenkins (هذا الموقع يستخدم GitHub Actions!)
- الخطوط تعمل بالأحداث (مُحفّزات webhook) ويمكنها تشغيل مراحل مستقلة بالتوازي (fan-out/fan-in) لتنتهي أسرع
- بنيت مشغّل خط مرحلة بمرحلة وموجّه مُحفّزات حسب الفرع
- خسارة Knight Capital بـ440 مليون دولار عام 2012 تُظهر لماذا يهم نشر قطعة واحدة مُتحقَّقة ومتطابقة في كل مكان

**التالي:** Kubernetes — تنسيق الحاويات على نطاق واسع في الإنتاج.`,
      },
    },
  ],
};
