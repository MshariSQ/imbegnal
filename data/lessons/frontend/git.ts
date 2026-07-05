import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "git",
  title: { en: "Git & GitHub — Save Your Work Like a Pro", ar: "Git و GitHub — احفظ عملك كالمحترفين" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why every developer on Earth uses Git
- The 5 commands you'll type every single day
- What GitHub is (and how it gets you hired)

This lesson is theory + quiz — Git runs in your computer's terminal, so we'll prepare you to use it there.`,
        ar: `## ماذا ستتعلم

- لماذا يستخدم كل مبرمج على وجه الأرض Git
- الأوامر الخمسة التي ستكتبها كل يوم
- ما هو GitHub (وكيف يوصلك إلى وظيفة)

هذا الدرس نظري + اختبار — لأن Git يعمل في طرفية جهازك، سنجهزك لاستخدامه هناك.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The magic photo album 📸

Imagine writing a school essay. You save it as \`essay.doc\`, then \`essay-final.doc\`, then \`essay-final-FINAL-2.doc\`… chaos, right?

**Git is a magic photo album for your code.** Whenever you finish a piece of work, you take a **snapshot** (called a *commit*). The album remembers every snapshot forever:

- You can look at any old snapshot
- You can go back in time if you break something
- You can see exactly *what changed* between snapshots and *who* changed it

**GitHub** is the *online copy* of your album. It means: your work is safe if your laptop dies, teammates can work with you, and — this matters for your career — **employers look at your GitHub like a portfolio**.`,
        ar: `## ألبوم الصور السحري 📸

تخيّل أنك تكتب واجب مدرسة. تحفظه \`essay.doc\`، ثم \`essay-final.doc\`، ثم \`essay-final-FINAL-2.doc\`… فوضى، صحيح؟

**Git هو ألبوم صور سحري لكودك.** كلما أنهيت جزءاً من العمل، تلتقط **لقطة** (تسمى *commit*). الألبوم يتذكر كل لقطة إلى الأبد:

- يمكنك مشاهدة أي لقطة قديمة
- يمكنك العودة بالزمن إذا كسرت شيئاً
- يمكنك رؤية *ما الذي تغيّر* بالضبط بين اللقطات و*مَن* غيّره

**GitHub** هو *النسخة الإلكترونية* من ألبومك. يعني: عملك آمن لو تعطل جهازك، وزملاؤك يعملون معك، و— هذا مهم لمستقبلك — **أصحاب العمل يتصفحون GitHub الخاص بك كمعرض أعمال**.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      runnable: false,
      code: `# start the album in your project folder (once per project)
git init

# see what changed since the last snapshot
git status

# choose which changes go in the next snapshot
git add .

# take the snapshot, with a note describing it
git commit -m "Add login page"

# upload your album to GitHub
git push`,
      explanation: {
        en: `These 5 commands are 90% of daily Git. Read them top to bottom — this is the exact rhythm of a working developer's day: change code → status → add → commit → push. (These run in your computer's terminal, not in the browser.)`,
        ar: `هذه الأوامر الخمسة هي 90% من الاستخدام اليومي لـ Git. اقرأها من الأعلى للأسفل — هذا هو إيقاع يوم المبرمج بالضبط: عدّل الكود ← status ← add ← commit ← push. (تُنفَّذ في طرفية جهازك، لا في المتصفح.)`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Branches — parallel universes 🌿

One more superpower: a **branch** is a parallel copy of your project where you can experiment safely. The main universe is called \`main\`.

\`\`\`
git checkout -b new-feature   # create + enter a parallel universe
# ...work, commit, work, commit...
git checkout main             # back to the main universe
git merge new-feature         # bring your experiment into main
\`\`\`

Why bother? Because \`main\` should **always work**. You experiment in a branch; only when it's good do you merge it in. On teams, every feature and bug-fix lives in its own branch, and merging happens through a **Pull Request** on GitHub — a page where teammates review your changes before they join \`main\`.

**Do this today (10 minutes):**
1. Create a free account at github.com
2. Install Git from git-scm.com
3. Make a folder, run \`git init\`, create a file, then \`add\` → \`commit\` → create a repo on GitHub → \`push\`

The full walkthrough is in the Resources tab (the Traversy crash course is 32 minutes and excellent).`,
        ar: `## الفروع — أكوان موازية 🌿

قوة خارقة أخيرة: **الفرع (branch)** هو نسخة موازية من مشروعك تجرّب فيها بأمان. الكون الرئيسي اسمه \`main\`.

\`\`\`
git checkout -b new-feature   # أنشئ وادخل كوناً موازياً
# ...اعمل، commit، اعمل، commit...
git checkout main             # عد إلى الكون الرئيسي
git merge new-feature         # أدخل تجربتك إلى main
\`\`\`

لماذا العناء؟ لأن \`main\` يجب أن **يعمل دائماً**. تجرّب في فرع؛ وعندما يصبح جيداً فقط تدمجه. في فرق العمل، كل ميزة وكل إصلاح يعيش في فرعه الخاص، والدمج يتم عبر **Pull Request** على GitHub — صفحة يراجع فيها زملاؤك تغييراتك قبل انضمامها إلى \`main\`.

**افعل هذا اليوم (10 دقائق):**
1. أنشئ حساباً مجانياً على github.com
2. ثبّت Git من git-scm.com
3. أنشئ مجلداً، نفّذ \`git init\`، أنشئ ملفاً، ثم \`add\` ← \`commit\` ← أنشئ مستودعاً على GitHub ← \`push\`

الشرح الكامل في تبويب المصادر (دورة Traversy مدتها 32 دقيقة وممتازة).`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is a commit?", ar: "ما هو الـ commit؟" },
          choices: [
            { en: "A snapshot of your work with a message", ar: "لقطة من عملك مع رسالة توضيحية" },
            { en: "Deleting old code", ar: "حذف الكود القديم" },
            { en: "Uploading code to GitHub", ar: "رفع الكود إلى GitHub" },
          ],
          answer: 0,
          explain: {
            en: "A commit is a saved snapshot in your local album. Uploading to GitHub is a separate step: push.",
            ar: "الـ commit لقطة محفوظة في ألبومك المحلي. أما الرفع إلى GitHub فخطوة منفصلة: push.",
          },
        },
        {
          q: { en: "What's the difference between Git and GitHub?", ar: "ما الفرق بين Git و GitHub؟" },
          choices: [
            { en: "They are the same thing", ar: "هما نفس الشيء" },
            { en: "Git is the tool on your machine; GitHub hosts your repositories online", ar: "Git الأداة على جهازك؛ GitHub يستضيف مستودعاتك على الإنترنت" },
            { en: "GitHub is the paid version of Git", ar: "GitHub هو النسخة المدفوعة من Git" },
          ],
          answer: 1,
          explain: {
            en: "Git works fully offline on your computer. GitHub (like GitLab or Bitbucket) is a website that stores and shares Git repositories.",
            ar: "Git يعمل بالكامل على جهازك دون إنترنت. أما GitHub (مثل GitLab و Bitbucket) فموقع يخزّن مستودعات Git ويشاركها.",
          },
        },
        {
          q: { en: "Which command takes the snapshot?", ar: "أي أمر يلتقط اللقطة؟" },
          choices: [
            { en: "git push", ar: "git push" },
            { en: "git add", ar: "git add" },
            { en: `git commit -m "message"`, ar: `git commit -m "message"` },
          ],
          answer: 2,
          explain: {
            en: "add chooses what goes in the snapshot (staging), commit takes it, push uploads it. Three separate steps.",
            ar: "add يختار ما يدخل اللقطة (staging)، و commit يلتقطها، و push يرفعها. ثلاث خطوات منفصلة.",
          },
        },
        {
          q: { en: "Why work in a branch instead of directly on main?", ar: "لماذا نعمل في فرع بدلاً من العمل مباشرة على main؟" },
          choices: [
            { en: "Branches make the code run faster", ar: "الفروع تجعل الكود أسرع" },
            { en: "So main always stays working while you experiment safely", ar: "ليبقى main يعمل دائماً بينما تجرّب أنت بأمان" },
            { en: "GitHub requires it", ar: "GitHub يفرض ذلك" },
          ],
          answer: 1,
          explain: {
            en: "The golden rule of teams: main is always deployable. Experiments live in branches and merge in only when ready (usually via a Pull Request).",
            ar: "القاعدة الذهبية للفرق: main قابل للنشر دائماً. التجارب تعيش في فروع وتُدمج فقط عندما تجهز (عادة عبر Pull Request).",
          },
        },
        {
          q: { en: "What is a Pull Request?", ar: "ما هو الـ Pull Request؟" },
          choices: [
            { en: "A request to delete a repository", ar: "طلب حذف مستودع" },
            { en: "A page where teammates review your branch before merging it", ar: "صفحة يراجع فيها زملاؤك فرعك قبل دمجه" },
            { en: "Downloading someone's code", ar: "تنزيل كود شخص آخر" },
          ],
          answer: 1,
          explain: {
            en: "A PR says: \"my branch is ready — please review and merge it.\" It's where code review happens and how open-source contributions work.",
            ar: "الـ PR يقول: \"فرعي جاهز — راجعوه وادمجوه.\" هنا تحدث مراجعة الكود، وهكذا تعمل المساهمات مفتوحة المصدر.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Git = snapshot album on your machine (init, status, add, commit)
- GitHub = your album online (push) + your public portfolio
- Branch = safe parallel universe; merge via Pull Request

**Career tip:** commit and push something every week. A green GitHub activity graph is one of the strongest signals a junior developer can show an employer.`,
        ar: `## الخلاصة

- Git = ألبوم لقطات على جهازك (init، status، add، commit)
- GitHub = ألبومك على الإنترنت (push) + معرض أعمالك العام
- الفرع = كون موازٍ آمن؛ والدمج عبر Pull Request

**نصيحة مهنية:** ارفع commit كل أسبوع. مخطط النشاط الأخضر في GitHub من أقوى الإشارات التي يقدمها المبرمج المبتدئ لصاحب العمل.`,
      },
    },
  ],
};
