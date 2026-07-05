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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- DevOps = automating code → production, based in the Linux terminal
- Shell scripts turn repetitive manual steps into one reliable command
- Pipes (|) chain small tools; redirection (>) saves output to files
- You simulated a grep|wc pipe

**Next:** Git & Version Control — the DevOps branching workflows that make team automation possible.`,
        ar: `## الخلاصة

- DevOps = أتمتة الكود ← الإنتاج، قاعدته طرفية لينكس
- سكربتات الصدفة تحوّل الخطوات اليدوية المتكررة إلى أمر واحد موثوق
- الأنابيب (|) تسلسل أدوات صغيرة؛ وإعادة التوجيه (>) تحفظ المخرج في ملفات
- حاكيت أنبوب grep|wc

**التالي:** Git والتحكّم بالإصدارات — سير عمل الفروع في DevOps الذي يجعل أتمتة الفريق ممكنة.`,
      },
    },
  ],
};
