import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "linux-devops",
  title: { en: "Linux & Shell — The DevOps Cockpit", ar: "لينكس والصدفة — قمرة قيادة DevOps" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why DevOps lives in the Linux terminal
- Shell scripting — automating with text commands
- Pipes and redirection, the Unix superpower
- You'll write shell-style automation logic`,
        ar: `## ماذا ستتعلم

- لماذا يعيش DevOps في طرفية لينكس
- برمجة الصدفة — الأتمتة بأوامر نصية
- الأنابيب وإعادة التوجيه، قوة يونكس الخارقة
- ستكتب منطق أتمتة بأسلوب الصدفة`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Automate everything ⚙️

**DevOps** is the culture and practice of getting code from a developer's laptop into production **fast, reliably, and automatically**. Its home base is the **Linux terminal** — servers run Linux, and DevOps is about *automating* what you'd otherwise do by hand on them.

The key upgrade beyond typing commands one by one: a **shell script** — a text file of commands that run in sequence. Instead of manually deploying in 10 steps every time, you write them once and run one script.

\`\`\`bash
#!/bin/bash
echo "Starting deployment..."
git pull                    # get latest code
npm install                 # install dependencies
npm run build               # build the app
systemctl restart myapp     # restart the service
echo "Deployment complete!"
\`\`\`

Run that once and a whole deployment happens. This is the heart of DevOps: replace repetitive manual work with a script that's fast, consistent, and never forgets a step.

**The Unix superpower: pipes (\`|\`).** A pipe takes the output of one command and feeds it as input to the next, letting you chain tiny tools into powerful one-liners:

\`\`\`bash
cat access.log | grep "ERROR" | wc -l
#   read file  → keep error lines → count them
\`\`\`

That one line counts errors in a log — three simple tools combined. **Redirection** (\`>\`) sends output to a file instead of the screen: \`echo "done" > status.txt\`.

The Unix philosophy — *small tools that each do one thing well, combined via pipes* — is exactly how DevOps engineers build automation. You already saw \`grep\`, \`ls\`, and \`cat\` in the security track; here they become building blocks for scripts that deploy, monitor, and maintain systems automatically.`,
        ar: `## أتمِت كل شيء ⚙️

**DevOps** ثقافة وممارسة إيصال الكود من حاسوب المطوّر إلى الإنتاج **بسرعة وموثوقية وتلقائياً**. قاعدته **طرفية لينكس** — الخوادم تعمل بلينكس، وDevOps عن *أتمتة* ما كنت ستفعله يدوياً عليها.

الترقية الأساسية بعد كتابة الأوامر واحداً واحداً: **سكربت الصدفة** — ملف نصي من أوامر تعمل بالتتابع. بدل النشر يدوياً في 10 خطوات كل مرة، تكتبها مرة وتشغّل سكربتاً واحداً.

\`\`\`bash
#!/bin/bash
echo "Starting deployment..."
git pull                    # اجلب أحدث كود
npm install                 # ثبّت الاعتماديات
npm run build               # ابنِ التطبيق
systemctl restart myapp     # أعد تشغيل الخدمة
echo "Deployment complete!"
\`\`\`

شغّله مرة فيحدث نشر كامل. هذا قلب DevOps: استبدال العمل اليدوي المتكرر بسكربت سريع، متسق، ولا ينسى خطوة أبداً.

**قوة يونكس الخارقة: الأنابيب (\`|\`).** الأنبوب يأخذ مخرج أمر ويغذّيه مدخلاً للتالي، فتسلسل أدوات صغيرة في أسطر أحادية قوية:

\`\`\`bash
cat access.log | grep "ERROR" | wc -l
#   اقرأ الملف  → أبقِ أسطر الخطأ → عُدّها
\`\`\`

ذلك السطر يعدّ الأخطاء في سجلّ — ثلاث أدوات بسيطة مجموعة. **إعادة التوجيه** (\`>\`) ترسل المخرج لملف بدل الشاشة: \`echo "done" > status.txt\`.

فلسفة يونكس — *أدوات صغيرة كل منها يتقن شيئاً واحداً، مجموعة عبر الأنابيب* — هي بالضبط كيف يبني مهندسو DevOps الأتمتة. رأيت \`grep\` و\`ls\` و\`cat\` في مسار الأمن؛ وهنا تصير لبنات لسكربتات تنشر وتراقب وتصون الأنظمة تلقائياً.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Simulate a pipe: \`grep "ERROR" | wc -l\`. Write \`countErrors(lines)\` where \`lines\` is an array of log strings. Return how many contain \`"ERROR"\` (case-sensitive).

Example: \`["INFO ok", "ERROR bad", "ERROR worse"]\` → \`2\``,
        ar: `حاكِ أنبوباً: \`grep "ERROR" | wc -l\`. اكتب \`countErrors(lines)\` حيث \`lines\` مصفوفة نصوص سجلّ. أعِد كم منها يحوي \`"ERROR"\` (حساس لحالة الأحرف).

مثال: \`["INFO ok", "ERROR bad", "ERROR worse"]\` ← \`2\``,
      },
      starterCode: `function countErrors(lines) {
  // keep lines containing "ERROR", then count them
}

console.log(countErrors(["INFO ok", "ERROR bad", "ERROR worse"])); // 2`,
      solution: `function countErrors(lines) {
  return lines.filter((line) => line.includes("ERROR")).length;
}

console.log(countErrors(["INFO ok", "ERROR bad", "ERROR worse"])); // 2`,
      hints: [
        { en: `filter keeps matching lines: lines.filter(line => line.includes("ERROR")).`, ar: `filter يبقي الأسطر المطابقة: lines.filter(line => line.includes("ERROR")).` },
        { en: `Then take .length of the filtered array.`, ar: `ثم خذ .length للمصفوفة المصفّاة.` },
      ],
      tests: [
        { name: { en: "Counts two errors", ar: "يعدّ خطأين" }, check: `countErrors(["INFO ok","ERROR bad","ERROR worse"]) === 2` },
        { name: { en: "Zero errors gives 0", ar: "لا أخطاء تعطي 0" }, check: `countErrors(["INFO","WARN"]) === 0` },
        { name: { en: "Counts all when all error", ar: "يعدّ الكل عندما الكل خطأ" }, check: `countErrors(["ERROR a","ERROR b","ERROR c"]) === 3` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Environment variables and process control 🎛️

Scripts often need to behave differently depending on *where* they run — a staging server vs production, a testing pipeline vs your laptop. Hardcoding those differences into the script itself is fragile. The Linux answer is **environment variables**: named values that live in the shell's environment, readable by any program that runs inside it.

\`\`\`bash
export DATABASE_URL="postgres://prod-db:5432"
export LOG_LEVEL="info"

echo $DATABASE_URL          # read a variable with $
node app.js                 # app.js can read process.env.DATABASE_URL
\`\`\`

This is exactly how DevOps pipelines configure the *same* script or container differently per environment — staging gets \`DATABASE_URL\` pointing at a staging database, production gets the production one, with **zero changes to the code itself**. It's also the standard way to inject secrets at runtime (as you saw with Docker) instead of hardcoding them.

**Process control** matters just as much: a deploy script needs to know if the *previous* command actually succeeded before running the *next* one. Every command exits with a **status code** — \`0\` means success, anything else means failure:

\`\`\`bash
npm run build && systemctl restart myapp
#              ^^ only restarts if build's exit code was 0
\`\`\`

\`&&\` chains commands so the next only runs if the previous succeeded — the shell-level version of the CI/CD principle "if a stage fails, stop the pipeline."`,
        ar: `## متغيرات البيئة والتحكّم بالعمليات 🎛️

السكربتات غالباً تحتاج التصرّف بشكل مختلف حسب *أين* تعمل — خادم تجهيز مقابل إنتاج، خط اختبار مقابل جهازك. ترميز تلك الفروقات داخل السكربت نفسه هشّ. جواب لينكس هو **متغيرات البيئة**: قيم مسمّاة تعيش في بيئة الصدفة، قابلة للقراءة من أي برنامج يعمل داخلها.

\`\`\`bash
export DATABASE_URL="postgres://prod-db:5432"
export LOG_LEVEL="info"

echo $DATABASE_URL          # اقرأ متغيراً بـ $
node app.js                 # app.js يمكنه قراءة process.env.DATABASE_URL
\`\`\`

هذا بالضبط كيف تُعِدّ خطوط DevOps نفس السكربت أو الحاوية بشكل مختلف لكل بيئة — التجهيز يحصل على \`DATABASE_URL\` يشير لقاعدة بيانات تجهيز، والإنتاج يحصل على قاعدة الإنتاج، مع **صفر تغييرات على الكود نفسه**. إنها أيضاً الطريقة المعيارية لحقن الأسرار وقت التشغيل (كما رأيت مع Docker) بدل ترميزها.

**التحكّم بالعمليات** يهم بنفس القدر: سكربت النشر يحتاج معرفة إن كان الأمر *السابق* نجح فعلاً قبل تشغيل *التالي*. كل أمر يخرج برمز **حالة (status code)** — \`0\` يعني نجاحاً، أي شيء آخر يعني فشلاً:

\`\`\`bash
npm run build && systemctl restart myapp
#              ^^ يعيد التشغيل فقط إن كان رمز خروج build هو 0
\`\`\`

\`&&\` يسلسل الأوامر بحيث التالي يعمل فقط إن نجح السابق — نسخة سطر الأوامر من مبدأ CI/CD "إن فشلت مرحلة، أوقف الخط."`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Simulate chained command execution with \`&&\`. Write \`runChain(commands)\` where \`commands\` is an array of \`{ name, exitCode }\`. Run them in order; if any \`exitCode !== 0\`, stop immediately and return \`"STOPPED at " + name\`. If all succeed, return \`"ALL SUCCEEDED"\`.`,
        ar: `حاكِ تنفيذ أوامر مسلسلة بـ \`&&\`. اكتب \`runChain(commands)\` حيث \`commands\` مصفوفة \`{ name, exitCode }\`. شغّلها بالترتيب؛ إن كان أي \`exitCode !== 0\`، توقّف فوراً وأعِد \`"STOPPED at " + name\`. إن نجحت كلها، أعِد \`"ALL SUCCEEDED"\`.`,
      },
      starterCode: `function runChain(commands) {
  // loop in order; stop at the first non-zero exitCode
}

console.log(runChain([
  { name: "build", exitCode: 0 },
  { name: "test", exitCode: 1 },
  { name: "deploy", exitCode: 0 },
]));
// "STOPPED at test"`,
      solution: `function runChain(commands) {
  for (const cmd of commands) {
    if (cmd.exitCode !== 0) return "STOPPED at " + cmd.name;
  }
  return "ALL SUCCEEDED";
}

console.log(runChain([
  { name: "build", exitCode: 0 },
  { name: "test", exitCode: 1 },
  { name: "deploy", exitCode: 0 },
]));
// "STOPPED at test"`,
      hints: [
        { en: `Loop through commands in order; the first one with exitCode !== 0 stops the chain.`, ar: `كرّر عبر الأوامر بالترتيب؛ أول واحد بـ exitCode !== 0 يوقف السلسلة.` },
        { en: `If the loop finishes without stopping, return "ALL SUCCEEDED".`, ar: `إن انتهت الحلقة دون توقّف، أعِد "ALL SUCCEEDED".` },
      ],
      tests: [
        { name: { en: "Stops at the failing command", ar: "يتوقف عند الأمر الفاشل" }, check: `runChain([{name:"build",exitCode:0},{name:"test",exitCode:1},{name:"deploy",exitCode:0}]) === "STOPPED at test"` },
        { name: { en: "All succeed when every exit code is 0", ar: "الكل ينجح عندما كل رمز خروج 0" }, check: `runChain([{name:"build",exitCode:0},{name:"deploy",exitCode:0}]) === "ALL SUCCEEDED"` },
        { name: { en: "Stops immediately if the first command fails", ar: "يتوقف فوراً إن فشل الأمر الأول" }, check: `runChain([{name:"build",exitCode:1},{name:"deploy",exitCode:0}]) === "STOPPED at build"` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: GitLab.com's 2017 database incident 🔍

In early 2017, GitLab.com suffered a severe outage after an engineer, trying to clear a replication backlog, ran a directory-removal command against what he believed was a lagging secondary database — but was actually connected to the **primary production database**. Roughly 300GB of live data was deleted in seconds.

What made the incident survivable rather than catastrophic was largely the deep bench of backup mechanisms — several of which, GitLab later admitted publicly in a widely-read post-incident report, had silently failed for weeks or months without anyone noticing, leaving only one out of five backup/replication methods actually usable when it mattered. GitLab recovered from a snapshot that was several hours old, permanently losing some data in between.

The lesson connects directly to this lesson's themes: a single manually-typed shell command, run against the wrong target, caused the damage — exactly the kind of human error that scripting, guardrails, and double-checking your target *before* running a destructive command are meant to prevent. And a backup you've never test-restored isn't a real backup at all — GitLab's own transparent write-up became one of the most cited case studies in the industry for exactly that reason.`,
        ar: `## دراسة حالة واقعية: حادثة قاعدة بيانات GitLab.com عام 2017 🔍

في أوائل 2017، عانى GitLab.com انقطاعاً حاداً بعد أن شغّل مهندس، محاولاً تصفية تراكم تكرار، أمر حذف مجلد ضد ما ظنّه قاعدة بيانات ثانوية متأخرة — لكنه كان متصلاً فعلياً بـ**قاعدة بيانات الإنتاج الأساسية**. حُذف نحو 300 جيجابايت من بيانات حيّة خلال ثوانٍ.

ما جعل الحادثة قابلة للنجاة لا كارثية كان إلى حدّ كبير عمق آليات النسخ الاحتياطي — التي اعترف GitLab علناً لاحقاً في تقرير ما بعد الحادثة واسع الانتشار أن عدة منها فشلت بصمت لأسابيع أو أشهر دون أن يلاحظ أحد، تاركة طريقة نسخ احتياطي/تكرار واحدة فقط من خمس قابلة للاستخدام فعلياً حين احتاجوها. استعاد GitLab من لقطة عمرها ساعات عدة، خاسراً بعض البيانات بينهما للأبد.

الدرس يتصل مباشرة بمواضيع هذا الدرس: أمر صدفة واحد مكتوب يدوياً، شُغّل ضد الهدف الخطأ، سبب الضرر — بالضبط نوع الخطأ البشري الذي تهدف البرمجة النصية والحواجز الوقائية والتحقق المزدوج من هدفك *قبل* تشغيل أمر مدمّر لمنعه. ونسخة احتياطية لم تُختبَر استعادتها أبداً ليست نسخة احتياطية حقيقية أصلاً — تقرير GitLab الشفاف نفسه صار من أكثر دراسات الحالة استشهاداً في الصناعة لهذا السبب بالضبط.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is DevOps fundamentally about?", ar: "عن ماذا DevOps جوهرياً؟" },
          choices: [
            { en: "Getting code to production fast, reliably, and automatically", ar: "إيصال الكود للإنتاج بسرعة وموثوقية وتلقائياً" },
            { en: "Designing logos", ar: "تصميم الشعارات" },
            { en: "Writing frontend CSS", ar: "كتابة CSS للواجهة" },
          ],
          answer: 0,
          explain: {
            en: "DevOps unites development and operations to automate the path from code to reliable, fast releases.",
            ar: "DevOps يوحّد التطوير والعمليات لأتمتة الطريق من الكود إلى إصدارات موثوقة سريعة.",
          },
        },
        {
          q: { en: "What does a pipe (|) do in the shell?", ar: "ماذا يفعل الأنبوب (|) في الصدفة؟" },
          choices: [
            { en: "Feeds one command's output into the next command", ar: "يغذّي مخرج أمر مدخلاً للأمر التالي" },
            { en: "Deletes a file", ar: "يحذف ملفاً" },
            { en: "Restarts the computer", ar: "يعيد تشغيل الحاسوب" },
          ],
          answer: 0,
          explain: {
            en: "Pipes chain small tools: cat | grep | wc lets each do one job, combined into a powerful one-liner.",
            ar: "الأنابيب تسلسل أدوات صغيرة: cat | grep | wc يجعل كلاً يؤدي مهمة، مجموعة في سطر قوي.",
          },
        },
        {
          q: { en: "Why write a shell script instead of typing commands manually?", ar: "لماذا نكتب سكربت صدفة بدل كتابة الأوامر يدوياً؟" },
          choices: [
            { en: "It runs the steps consistently and never forgets one", ar: "ينفّذ الخطوات باتساق ولا ينسى واحدة" },
            { en: "Scripts are slower", ar: "السكربتات أبطأ" },
            { en: "It uses more memory", ar: "يستهلك ذاكرة أكثر" },
          ],
          answer: 0,
          explain: {
            en: "Automation is the core of DevOps: write the steps once, run them reliably every time, eliminating human error.",
            ar: "الأتمتة قلب DevOps: اكتب الخطوات مرة، شغّلها بموثوقية كل مرة، ملغياً الخطأ البشري.",
          },
        },
        {
          q: { en: "Why do pipelines use environment variables instead of hardcoding values like database URLs?", ar: "لماذا تستخدم الخطوط متغيرات البيئة بدل ترميز قيم مثل روابط قواعد البيانات؟" },
          choices: [
            { en: "The same script/container can behave differently per environment (staging vs prod) with zero code changes", ar: "نفس السكربت/الحاوية يمكنه التصرّف مختلفاً لكل بيئة (تجهيز مقابل إنتاج) بلا أي تغيير كود" },
            { en: "Environment variables make scripts run faster", ar: "متغيرات البيئة تجعل السكربتات أسرع" },
            { en: "Hardcoding is always required by Linux", ar: "الترميز المباشر مطلوب دائماً في لينكس" },
          ],
          answer: 0,
          explain: {
            en: "Injecting config (and secrets) via environment variables at runtime keeps the same artifact deployable anywhere, which is central to reliable DevOps pipelines.",
            ar: "حقن الإعداد (والأسرار) عبر متغيرات البيئة وقت التشغيل يُبقي نفس القطعة قابلة للنشر في أي مكان، وهذا محوري لخطوط DevOps الموثوقة.",
          },
        },
        {
          q: { en: "What does `npm run build && systemctl restart myapp` guarantee?", ar: "ماذا يضمن `npm run build && systemctl restart myapp`؟" },
          choices: [
            { en: "The restart only happens if the build's exit code was 0 (success)", ar: "إعادة التشغيل تحدث فقط إن كان رمز خروج البناء 0 (نجاح)" },
            { en: "Both commands always run regardless of success or failure", ar: "كلا الأمرين يعملان دائماً بغض النظر عن النجاح أو الفشل" },
            { en: "It restarts the app twice", ar: "يعيد تشغيل التطبيق مرتين" },
          ],
          answer: 0,
          explain: {
            en: "&& only runs the next command if the previous one exited with status 0 — the shell-level version of 'stop the pipeline on failure.'",
            ar: "&& يشغّل الأمر التالي فقط إن خرج السابق برمز 0 — نسخة سطر الأوامر من 'أوقف الخط عند الفشل'.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- DevOps = automating code → production, based in the Linux terminal
- Shell scripts turn repetitive manual steps into one reliable command
- Pipes (|) chain small tools; redirection (>) saves output to files
- Environment variables configure the same script per environment; exit codes and \`&&\` chain commands safely
- You simulated a grep|wc pipe and a chained command runner
- GitLab's 2017 database incident shows why destructive commands need guardrails and tested backups

**Next:** Git & Version Control — the DevOps branching workflows that make team automation possible.`,
        ar: `## الخلاصة

- DevOps = أتمتة الكود ← الإنتاج، قاعدته طرفية لينكس
- سكربتات الصدفة تحوّل الخطوات اليدوية المتكررة إلى أمر واحد موثوق
- الأنابيب (|) تسلسل أدوات صغيرة؛ وإعادة التوجيه (>) تحفظ المخرج في ملفات
- متغيرات البيئة تُعِدّ نفس السكربت لكل بيئة؛ ورموز الخروج و\`&&\` تسلسل الأوامر بأمان
- حاكيت أنبوب grep|wc ومُشغّل أوامر مسلسلة
- حادثة قاعدة بيانات GitLab عام 2017 تُظهر لماذا تحتاج الأوامر المدمّرة حواجز وقائية ونسخاً احتياطية مُختبَرة

**التالي:** Git والتحكّم بالإصدارات — سير عمل الفروع في DevOps الذي يجعل أتمتة الفريق ممكنة.`,
      },
    },
  ],
};
