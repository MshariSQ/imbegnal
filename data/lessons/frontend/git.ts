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
- \`.gitignore\` — keeping secrets and junk out of your history
- What GitHub is (and how it gets you hired)
- A simulated coding exercise modeling how commit history works

This lesson is mostly theory + quiz — Git itself runs in your computer's terminal, so we'll prepare you to use it there, plus one browser exercise that models the core idea.`,
        ar: `## ماذا ستتعلم

- لماذا يستخدم كل مبرمج على وجه الأرض Git
- الأوامر الخمسة التي ستكتبها كل يوم
- \`.gitignore\` — إبقاء الأسرار والملفات غير المهمة خارج سجلّك
- ما هو GitHub (وكيف يوصلك إلى وظيفة)
- تمرين برمجي محاكٍ يمثّل كيف يعمل سجلّ الـ commits

هذا الدرس نظري + اختبار في معظمه — لأن Git نفسه يعمل في طرفية جهازك، سنجهزك لاستخدامه هناك، بالإضافة إلى تمرين واحد في المتصفح يحاكي الفكرة الجوهرية.`,
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
      type: "text",
      body: {
        en: `## .gitignore — keeping junk (and secrets) out 🚫

Not everything in your project folder belongs in the photo album. Two categories you must **never** commit:

1. **Generated junk** — folders like \`node_modules/\` (downloaded libraries, sometimes gigabytes) or \`.next/\` (build output). They can always be regenerated from your actual code, so committing them just bloats the album for no reason.
2. **Secrets** — API keys, database passwords, \`.env\` files. If you commit a secret once, it lives in your Git history *forever*, even if you delete the file in a later commit — anyone with repo access (or who finds a leaked public repo) can dig it out. This is a real, common cause of security breaches.

The fix is a file named exactly \`.gitignore\` in your project's root, listing what Git should never track:

\`\`\`
node_modules/
.env
.next/
*.log
\`\`\`

Create it *before* your first commit. Git will simply skip anything listed here — \`git status\` won't even mention it.`,
        ar: `## .gitignore — إبقاء الفوضى (والأسرار) خارجاً 🚫

ليس كل ما في مجلد مشروعك ينتمي لألبوم الصور. فئتان يجب **ألا** تودعهما (commit) أبداً:

1. **الفوضى المولّدة** — مجلدات مثل \`node_modules/\` (مكتبات مُنزَّلة، أحياناً بحجم جيجابايتات) أو \`.next/\` (ناتج البناء). يمكن دائماً إعادة توليدها من كودك الفعلي، فإيداعها يُضخّم الألبوم بلا داعٍ.
2. **الأسرار** — مفاتيح API، كلمات مرور قواعد البيانات، ملفات \`.env\`. إن أودعت سراً مرة، يعيش في سجلّ Git *للأبد*، حتى لو حذفت الملف في commit لاحق — أي شخص لديه وصول للمستودع (أو يجد مستودعاً عاماً مسرّباً) يستطيع استخراجه. هذا سبب حقيقي وشائع لاختراقات الأمن.

الحل ملف اسمه بالضبط \`.gitignore\` في جذر مشروعك، يسرد ما يجب ألا يتتبعه Git:

\`\`\`
node_modules/
.env
.next/
*.log
\`\`\`

أنشئه *قبل* أول commit. سيتجاهل Git ببساطة أي شيء مذكور هنا — حتى \`git status\` لن يذكره.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Model how \`git log\` shows recent history. Write \`recentCommits(commits, n)\` where \`commits\` is an array of messages in chronological order (oldest first). Return the **last \`n\` commits, most recent first** — exactly what \`git log -n\` shows you.

Example: \`recentCommits(["Init", "Add navbar", "Fix bug", "Add footer"], 2)\` → \`["Add footer", "Fix bug"]\``,
        ar: `حاكِ كيف يعرض \`git log\` السجلّ الأخير. اكتب \`recentCommits(commits, n)\` حيث \`commits\` مصفوفة رسائل بالترتيب الزمني (الأقدم أولاً). أعِد **آخر \`n\` commits، الأحدث أولاً** — تماماً كما يعرضها \`git log -n\`.

مثال: \`recentCommits(["Init", "Add navbar", "Fix bug", "Add footer"], 2)\` ← \`["Add footer", "Fix bug"]\``,
      },
      starterCode: `function recentCommits(commits, n) {
  // take the last n, then reverse them (most recent first)

}

console.log(recentCommits(["Init", "Add navbar", "Fix bug", "Add footer"], 2));
// ["Add footer", "Fix bug"]`,
      solution: `function recentCommits(commits, n) {
  const lastN = commits.slice(-n);
  return lastN.reverse();
}

console.log(recentCommits(["Init", "Add navbar", "Fix bug", "Add footer"], 2));
// ["Add footer", "Fix bug"]`,
      hints: [
        { en: `commits.slice(-n) grabs the last n items while keeping chronological order.`, ar: `commits.slice(-n) يأخذ آخر n عناصر مع الحفاظ على الترتيب الزمني.` },
        { en: `Then .reverse() flips them so the most recent comes first.`, ar: `ثم .reverse() يعكسها ليأتي الأحدث أولاً.` },
      ],
      tests: [
        { name: { en: "Returns the last 2, most recent first", ar: "يعيد آخر 2، الأحدث أولاً" }, check: `JSON.stringify(recentCommits(["Init","Add navbar","Fix bug","Add footer"],2)) === JSON.stringify(["Add footer","Fix bug"])` },
        { name: { en: "Works with n=1", ar: "يعمل مع n=1" }, check: `JSON.stringify(recentCommits(["A","B","C"],1)) === JSON.stringify(["C"])` },
        { name: { en: "Works when n equals the full list", ar: "يعمل عندما n تساوي القائمة كاملة" }, check: `JSON.stringify(recentCommits(["A","B"],2)) === JSON.stringify(["B","A"])` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: this exact platform 🔍

This isn't hypothetical — the very site you're learning on is built exactly this way. Its [CONTRIBUTING.md](https://github.com/MshariSQ/skillforge/blob/main/CONTRIBUTING.md) tells every contributor to branch off \`main\`, commit their roadmap or lesson changes, and open a Pull Request for review before anything merges. Every lesson you've completed on this site shipped through that exact \`branch → commit → push → Pull Request → merge\` flow you just learned. Open-source projects you use every day — React, VS Code, Python itself — all run on this same rhythm.`,
        ar: `## دراسة حالة واقعية: هذه المنصة بالضبط 🔍

هذا ليس افتراضياً — الموقع نفسه الذي تتعلم عليه مبني بهذه الطريقة بالضبط. ملف [CONTRIBUTING.md](https://github.com/MshariSQ/skillforge/blob/main/CONTRIBUTING.md) الخاص به يطلب من كل مساهم التفرّع من \`main\`، وإيداع تعديلاته على خرائط التعلم أو الدروس، وفتح Pull Request للمراجعة قبل أن يُدمج أي شيء. كل درس أنهيته على هذا الموقع وصل عبر نفس تدفق \`فرع ← commit ← push ← Pull Request ← دمج\` الذي تعلمته للتو. مشاريع مفتوحة المصدر تستخدمها يومياً — React، VS Code، بايثون نفسه — تعمل جميعها بنفس هذا الإيقاع.`,
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
        {
          q: { en: "Why should you never commit a .env file with real secrets?", ar: "لماذا يجب ألا تودع (commit) ملف .env بأسرار حقيقية أبداً؟" },
          choices: [
            { en: "Once committed, the secret stays in Git history forever, even if deleted later", ar: "بمجرد إيداعه، يبقى السر في سجلّ Git للأبد، حتى لو حُذف لاحقاً" },
            { en: ".env files are too small for Git to handle", ar: "ملفات .env صغيرة جداً على Git" },
            { en: "It slows down git push", ar: "يبطئ git push" },
          ],
          answer: 0,
          explain: {
            en: "Deleting a file in a new commit doesn't erase it from history — anyone with repo access can still find it in an old commit. List secrets in .gitignore instead.",
            ar: "حذف ملف في commit جديد لا يمحوه من السجلّ — أي شخص لديه وصول للمستودع يستطيع إيجاده في commit قديم. أدرج الأسرار في .gitignore بدلاً من ذلك.",
          },
        },
        {
          q: { en: "Why skip committing node_modules/?", ar: "لماذا نتجنب إيداع node_modules/؟" },
          choices: [
            { en: "It can always be regenerated from your code, and just bloats the repo", ar: "يمكن دائماً إعادة توليده من كودك، وإيداعه يُضخّم المستودع فقط" },
            { en: "Git cannot read folders", ar: "Git لا يستطيع قراءة المجلدات" },
            { en: "It contains secrets by default", ar: "يحتوي أسراراً افتراضياً" },
          ],
          answer: 0,
          explain: {
            en: "Generated/downloaded folders belong in .gitignore — they add no real information and can be rebuilt anytime with a single install command.",
            ar: "المجلدات المولّدة/المُنزَّلة مكانها .gitignore — لا تضيف معلومة حقيقية ويمكن إعادة بنائها بأمر تثبيت واحد.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Git = snapshot album on your machine (init, status, add, commit)
- \`.gitignore\` keeps junk and secrets out of that album forever
- GitHub = your album online (push) + your public portfolio
- Branch = safe parallel universe; merge via Pull Request
- Real open-source projects — including this very site — run on exactly this workflow

**Career tip:** commit and push something every week. A green GitHub activity graph is one of the strongest signals a junior developer can show an employer.`,
        ar: `## الخلاصة

- Git = ألبوم لقطات على جهازك (init، status، add، commit)
- \`.gitignore\` يُبقي الفوضى والأسرار خارج ذلك الألبوم للأبد
- GitHub = ألبومك على الإنترنت (push) + معرض أعمالك العام
- الفرع = كون موازٍ آمن؛ والدمج عبر Pull Request
- مشاريع مفتوحة المصدر حقيقية — بما فيها هذا الموقع نفسه — تعمل بنفس سير العمل هذا بالضبط

**نصيحة مهنية:** ارفع commit كل أسبوع. مخطط النشاط الأخضر في GitHub من أقوى الإشارات التي يقدمها المبرمج المبتدئ لصاحب العمل.`,
      },
    },
  ],
};
