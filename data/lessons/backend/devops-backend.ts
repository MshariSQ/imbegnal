import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "devops-backend",
  title: { en: "Docker & Deployment — Ship It Anywhere", ar: "Docker والنشر — انشره في أي مكان" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- The "works on my machine" problem — and how **containers** solve it
- What Docker actually does, in plain terms
- The path from your laptop to a live server
- Core deployment vocabulary`,
        ar: `## ماذا ستتعلم

- مشكلة "يعمل على جهازي" — وكيف تحلّها **الحاويات (containers)**
- ماذا يفعل Docker فعلاً، ببساطة
- الطريق من حاسوبك إلى خادم حيّ
- مفردات النشر الأساسية`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The shipping container 📦

Every developer has said it: *"but it works on my machine!"* The app runs on your laptop, then breaks on the server — a different OS, a missing library, a wrong version. Chaos.

**Docker** solves this the way global trade solved cargo: the **shipping container**. Before containers, loading a ship meant custom-fitting every odd-shaped item. The standardized container changed everything — any container fits any ship, truck, or crane, anywhere.

A **Docker container** packs your app **plus everything it needs** — the exact OS libraries, the right language version, all dependencies — into one standardized box. That box runs *identically* on your laptop, your teammate's machine, and the production server. "Works on my machine" becomes "works on every machine."

You describe the box in a **Dockerfile** (a recipe):

\`\`\`dockerfile
FROM node:20              # start from a box that already has Node 20
WORKDIR /app
COPY package.json .       # copy dependency list
RUN npm install           # install them
COPY . .                  # copy your code
CMD ["node", "server.js"] # command to run when the box starts
\`\`\`

**The deployment journey:**
1. Write code → 2. Build a Docker **image** (the packed box) → 3. Push it to a registry → 4. Run it on a **server** in the cloud (AWS, a VPS, etc.) → 5. Users reach it via a domain name.

Related words you'll hear: an **image** is the blueprint, a **container** is a running instance of it; **hosting** is renting the server; a **domain** points to that server's IP (remember DNS!).`,
        ar: `## حاوية الشحن 📦

كل مطوّر قالها: *"لكنه يعمل على جهازي!"* التطبيق يشتغل على حاسوبك، ثم يتعطّل على الخادم — نظام مختلف، مكتبة ناقصة، إصدار خاطئ. فوضى.

**Docker** يحلّها كما حلّت التجارة العالمية مشكلة الشحن: **حاوية الشحن**. قبل الحاويات، كان تحميل سفينة يعني تفصيل مكان لكل غرض غريب الشكل. الحاوية القياسية غيّرت كل شيء — أي حاوية تناسب أي سفينة أو شاحنة أو رافعة، في أي مكان.

**حاوية Docker** تحزم تطبيقك **مع كل ما يحتاجه** — مكتبات النظام بالضبط، إصدار اللغة الصحيح، كل الاعتماديات — في صندوق قياسي واحد. ذلك الصندوق يعمل *بشكل مطابق* على حاسوبك، وجهاز زميلك، وخادم الإنتاج. "يعمل على جهازي" تصبح "يعمل على كل جهاز".

تصف الصندوق في **Dockerfile** (وصفة):

\`\`\`dockerfile
FROM node:20              # ابدأ من صندوق فيه Node 20 مسبقاً
WORKDIR /app
COPY package.json .       # انسخ قائمة الاعتماديات
RUN npm install           # ثبّتها
COPY . .                  # انسخ كودك
CMD ["node", "server.js"] # الأمر الذي يعمل عند تشغيل الصندوق
\`\`\`

**رحلة النشر:**
1. اكتب الكود ← 2. ابنِ **صورة (image)** Docker (الصندوق المحزوم) ← 3. ادفعها إلى مستودع ← 4. شغّلها على **خادم** في السحابة (AWS، VPS…) ← 5. يصلها المستخدمون عبر اسم نطاق.

كلمات مرتبطة ستسمعها: **الصورة (image)** هي المخطط، و**الحاوية (container)** نسخة عاملة منها؛ و**الاستضافة (hosting)** استئجار الخادم؛ و**النطاق (domain)** يشير إلى IP ذلك الخادم (تذكّر DNS!).`,
      },
    },
    {
      type: "text",
      body: {
        en: `## CI/CD — the automatic safety net 🤖

Packaging your app in a container answers "how do I ship it?" A different question is "how do I make sure what I ship actually works, every single time, without me babysitting it?" That's **CI/CD**.

**CI (Continuous Integration)** means every time someone pushes code, a robot automatically: installs dependencies, runs the test suite, and checks the code builds — *before* it's allowed to merge. Nobody has to remember to run tests by hand; the pipeline just refuses broken code.

**CD (Continuous Deployment/Delivery)** picks up right after: once code passes CI on the main branch, it's automatically built into an image and shipped to production — no human manually copying files onto a server at 2am. "Delivery" means it's staged and ready for a human to click "go"; "Deployment" means it goes live with no click at all.

A typical pipeline, as a sequence of steps that must each pass before the next runs:

\`\`\`
push code → install deps → run tests → build Docker image → deploy to staging → (manual approval) → deploy to production
\`\`\`

If any step fails, the pipeline **stops** — bad code never reaches users. Popular tools: **GitHub Actions**, **GitLab CI**, **Jenkins**. This entire platform's own static site rebuilds and redeploys automatically through exactly this kind of pipeline every time code is pushed — no one manually uploads files.`,
        ar: `## CI/CD — شبكة الأمان الآلية 🤖

تغليف تطبيقك في حاوية يجيب على "كيف أشحنه؟" سؤال مختلف هو "كيف أتأكد أن ما أشحنه يعمل فعلاً، في كل مرة، دون أن أراقبه؟" هذا هو **CI/CD**.

**CI (التكامل المستمر)** يعني أنه في كل مرة يدفع فيها أحدهم كوداً، يقوم روبوت تلقائياً بـ: تثبيت الاعتماديات، وتشغيل حزمة الاختبارات، وفحص أن الكود يُبنى — *قبل* السماح بدمجه. لا أحد يحتاج تذكّر تشغيل الاختبارات يدوياً؛ خط الأنابيب يرفض الكود المعطوب ببساطة.

**CD (التسليم/النشر المستمر)** يكمل من هناك: بمجرد اجتياز الكود لـ CI على الفرع الرئيسي، يُبنى تلقائياً كصورة ويُشحن للإنتاج — دون إنسان ينسخ ملفات يدوياً على خادم في الساعة 2 صباحاً. "التسليم (Delivery)" يعني أنه جاهز ومُجهّز لينقر إنسان "تنفيذ"؛ و"النشر (Deployment)" يعني أنه يصبح حياً دون أي نقرة إطلاقاً.

خط أنابيب نموذجي، كسلسلة خطوات يجب أن تنجح كل واحدة قبل تشغيل التالية:

\`\`\`
دفع الكود ← تثبيت الاعتماديات ← تشغيل الاختبارات ← بناء صورة Docker ← نشر على staging ← (موافقة يدوية) ← نشر على الإنتاج
\`\`\`

إن فشلت أي خطوة، **يتوقف** خط الأنابيب — الكود المعطوب لا يصل أبداً للمستخدمين. أدوات شائعة: **GitHub Actions**، **GitLab CI**، **Jenkins**. موقع هذه المنصة الثابت نفسه يُعاد بناؤه ونشره تلقائياً عبر خط أنابيب من هذا النوع بالضبط في كل مرة يُدفع فيها كود — لا أحد يرفع الملفات يدوياً.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Simulate a CI/CD pipeline. Write \`runPipeline(steps)\` where \`steps\` is an array of functions, each returning \`true\` (pass) or \`false\` (fail). Run them **in order**, stopping at the first failure. Return \`{ passed: N, stoppedAt: index or null }\` — \`stoppedAt\` is the index of the failing step, or \`null\` if all passed.

This mirrors a real pipeline: one broken step blocks everything after it.`,
        ar: `حاكِ خط أنابيب CI/CD. اكتب \`runPipeline(steps)\` حيث \`steps\` مصفوفة دوال، كل واحدة تعيد \`true\` (نجاح) أو \`false\` (فشل). شغّلها **بالترتيب**، وتوقّف عند أول فشل. أعِد \`{ passed: N, stoppedAt: index or null }\` — \`stoppedAt\` هو فهرس الخطوة الفاشلة، أو \`null\` إن نجحت كلها.

هذا يحاكي خط أنابيب حقيقياً: خطوة معطوبة واحدة تعطّل كل ما بعدها.`,
      },
      starterCode: `function runPipeline(steps) {
  let passed = 0;
  // loop through steps by index
  // call each step(); if it returns true, passed++ and continue
  // if it returns false, stop and return { passed, stoppedAt: thatIndex }
  // if the loop finishes, return { passed, stoppedAt: null }
}

const ok = () => true;
const fail = () => false;

console.log(runPipeline([ok, ok, ok]));      // { passed: 3, stoppedAt: null }
console.log(runPipeline([ok, fail, ok]));    // { passed: 1, stoppedAt: 1 }`,
      solution: `function runPipeline(steps) {
  let passed = 0;
  for (let i = 0; i < steps.length; i++) {
    if (steps[i]()) {
      passed++;
    } else {
      return { passed, stoppedAt: i };
    }
  }
  return { passed, stoppedAt: null };
}

const ok = () => true;
const fail = () => false;

console.log(runPipeline([ok, ok, ok]));
console.log(runPipeline([ok, fail, ok]));`,
      hints: [
        { en: `Use a for loop with an index: for (let i = 0; i < steps.length; i++) { ... }`, ar: `استخدم حلقة for بفهرس: for (let i = 0; i < steps.length; i++) { ... }` },
        { en: `Inside: if (steps[i]()) passed++; else return { passed, stoppedAt: i };  — after the loop: return { passed, stoppedAt: null };`, ar: `بالداخل: if (steps[i]()) passed++; else return { passed, stoppedAt: i };  — بعد الحلقة: return { passed, stoppedAt: null };` },
      ],
      tests: [
        { name: { en: "All passing steps run to completion", ar: "كل الخطوات الناجحة تُكمَل" }, check: `(function(){ const r = runPipeline([()=>true,()=>true]); return r.passed === 2 && r.stoppedAt === null; })()` },
        { name: { en: "Stops at the first failing step", ar: "يتوقف عند أول خطوة فاشلة" }, check: `(function(){ const r = runPipeline([()=>true,()=>false,()=>true]); return r.passed === 1 && r.stoppedAt === 1; })()` },
        { name: { en: "A step after the failure never runs", ar: "خطوة بعد الفشل لا تعمل أبداً" }, check: `(function(){ let ran3 = false; runPipeline([()=>true, ()=>false, ()=>{ran3=true; return true;}]); return ran3 === false; })()` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Knight Capital's 45-minute, $460 million deploy 🔍

In August 2012, Knight Capital, a major U.S. stock trading firm, deployed new trading software to its production servers. The deployment process was manual: an engineer was supposed to copy the new code to eight servers, but it only actually got copied to seven — the eighth kept running old, dormant code that had been dead for years, repurposed for a different feature with the same flag name reused.

When the markets opened, that eighth server started executing the old code path, which triggered millions of unintended trades in 45 minutes, before anyone could diagnose what was happening or roll it back cleanly. The company lost roughly $460 million and nearly collapsed overnight, eventually getting acquired.

This is the textbook argument for everything in this lesson. A real CI/CD pipeline deploys the **same built artifact** to every server automatically, so "it went to 7 of 8 machines" simply cannot happen — there's no manual copy step to get half-right. Automated tests would have run against a full deploy, not a partial one. And a proper rollback mechanism (redeploy the last known-good image) would have ended the incident in seconds instead of 45 minutes of manual scrambling. The whole discipline of CI/CD exists because human hands copying files to production, one server at a time, is a genuine, well-documented, company-ending risk.`,
        ar: `## دراسة حالة واقعية: نشر Knight Capital لـ45 دقيقة الذي كلّف 460 مليون دولار 🔍

في أغسطس 2012، نشرت Knight Capital، شركة تداول أسهم أمريكية كبرى، برنامج تداول جديداً على خوادم إنتاجها. كانت عملية النشر يدوية: كان على مهندس نسخ الكود الجديد إلى ثمانية خوادم، لكنه نُسخ فعلياً إلى سبعة فقط — الخادم الثامن ظلّ يشغّل كوداً قديماً خاملاً كان ميتاً لسنوات، أُعيد استخدامه لميزة مختلفة بنفس اسم العلامة (flag).

حين افتتحت الأسواق، بدأ ذلك الخادم الثامن بتنفيذ مسار الكود القديم، ما أطلق ملايين الصفقات غير المقصودة خلال 45 دقيقة، قبل أن يتمكن أحد من تشخيص ما يحدث أو التراجع عنه بنظافة. خسرت الشركة نحو 460 مليون دولار وكادت تنهار بين ليلة وضحاها، وانتهى بها الأمر إلى الاستحواذ عليها.

هذه هي الحجة المدرسية لكل شيء في هذا الدرس. خط أنابيب CI/CD حقيقي ينشر **نفس الأداة المبنية (artifact)** على كل خادم تلقائياً، فـ"وصل إلى 7 من 8 أجهزة" لا يمكن أن يحدث ببساطة — لا توجد خطوة نسخ يدوية قد تُنجَز بشكل نصفي. الاختبارات الآلية كانت ستعمل على نشر كامل، لا جزئي. وآلية تراجع (rollback) سليمة (إعادة نشر آخر صورة معروفة بأنها سليمة) كانت لتنهي الحادثة خلال ثوانٍ بدل 45 دقيقة من الفوضى اليدوية. تخصص CI/CD بأكمله موجود لأن الأيدي البشرية التي تنسخ ملفات إلى الإنتاج، خادماً تلو الآخر، خطر حقيقي وموثّق جيداً وقد ينهي شركة.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What problem does Docker primarily solve?", ar: "ما المشكلة التي يحلها Docker أساساً؟" },
          choices: [
            { en: `"It works on my machine but breaks elsewhere"`, ar: `"يعمل على جهازي لكنه يتعطّل في مكان آخر"` },
            { en: "Slow internet", ar: "بطء الإنترنت" },
            { en: "Weak passwords", ar: "كلمات مرور ضعيفة" },
          ],
          answer: 0,
          explain: {
            en: "Containers bundle the app with its exact environment, so it runs identically everywhere. Consistency is the win.",
            ar: "الحاويات تحزم التطبيق مع بيئته بالضبط، فيعمل بشكل مطابق في كل مكان. الاتساق هو المكسب.",
          },
        },
        {
          q: { en: "What's the difference between an image and a container?", ar: "ما الفرق بين الصورة والحاوية؟" },
          choices: [
            { en: "Image = blueprint; container = a running instance of it", ar: "الصورة = مخطط؛ الحاوية = نسخة عاملة منها" },
            { en: "They're identical", ar: "متطابقان" },
            { en: "Image runs, container is stored", ar: "الصورة تعمل، الحاوية تُخزَّن" },
          ],
          answer: 0,
          explain: {
            en: "You build an image (the packed box), then run it to create a live container. One image → many containers.",
            ar: "تبني صورة (الصندوق المحزوم)، ثم تشغّلها لتنشئ حاوية حيّة. صورة واحدة ← حاويات كثيرة.",
          },
        },
        {
          q: { en: "In a Dockerfile, what does FROM node:20 do?", ar: "في Dockerfile، ماذا يفعل FROM node:20؟" },
          choices: [
            { en: "Starts from a base image that already includes Node 20", ar: "يبدأ من صورة أساس تتضمن Node 20 مسبقاً" },
            { en: "Downloads the internet", ar: "ينزّل الإنترنت" },
            { en: "Deletes Node", ar: "يحذف Node" },
          ],
          answer: 0,
          explain: {
            en: "FROM sets the starting base image so you don't build the OS + runtime from scratch. You layer your app on top.",
            ar: "FROM يحدد صورة الأساس كي لا تبني النظام + بيئة التشغيل من الصفر. تضيف تطبيقك فوقها.",
          },
        },
        {
          q: { en: "What does CI (Continuous Integration) automatically do on every push?", ar: "ماذا يفعل CI (التكامل المستمر) تلقائياً عند كل دفع؟" },
          choices: [
            { en: "Installs dependencies and runs tests before code can merge", ar: "يثبّت الاعتماديات ويشغّل الاختبارات قبل السماح بدمج الكود" },
            { en: "Deletes the repository", ar: "يحذف المستودع" },
            { en: "Emails every user of the app", ar: "يرسل بريداً لكل مستخدم للتطبيق" },
          ],
          answer: 0,
          explain: {
            en: "CI is an automatic gate: it builds and tests every change so broken code is caught before it reaches anyone else.",
            ar: "CI بوابة تلقائية: يبني ويختبر كل تغيير فيُكتشف الكود المعطوب قبل وصوله لأي شخص آخر.",
          },
        },
        {
          q: { en: "What went wrong in the Knight Capital incident?", ar: "ما الخطأ الذي حدث في حادثة Knight Capital؟" },
          choices: [
            { en: "New code was manually copied to only 7 of 8 servers, leaving one running dangerous old code", ar: "نُسخ الكود الجديد يدوياً إلى 7 من 8 خوادم فقط، تاركاً واحداً يشغّل كوداً قديماً خطيراً" },
            { en: "A hacker broke into their servers", ar: "اخترق هاكر خوادمهم" },
            { en: "They used too much Docker caching", ar: "استخدموا تخزيناً مؤقتاً زائداً لـ Docker" },
          ],
          answer: 0,
          explain: {
            en: "A manual, partial deploy left inconsistent code across servers — exactly what automated CI/CD pipelines are designed to prevent.",
            ar: "نشر يدوي جزئي ترك كوداً غير متسق عبر الخوادم — بالضبط ما صُمّمت خطوط أنابيب CI/CD الآلية لمنعه.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Containers package your app + its entire environment → runs identically everywhere
- A Dockerfile is the recipe; you build an image and run it as a container
- Deploy path: code → image → registry → server → domain
- **CI/CD** automates testing and deployment so broken code can't reach users — you built a pipeline runner that stops at the first failing step
- Knight Capital's $460M manual-deploy disaster is the real-world case for automating this

**Try it:** install Docker Desktop, write the Dockerfile above for a small Node app, and run \`docker build\` then \`docker run\`. **Next:** System Design — architecting backends that scale to millions.`,
        ar: `## الخلاصة

- الحاويات تحزم تطبيقك + بيئته كاملة ← يعمل بشكل مطابق في كل مكان
- Dockerfile هو الوصفة؛ تبني صورة وتشغّلها كحاوية
- طريق النشر: كود ← صورة ← مستودع ← خادم ← نطاق
- **CI/CD** يؤتمت الاختبار والنشر فلا يصل كود معطوب للمستخدمين — بنيت مُشغّل خط أنابيب يتوقف عند أول خطوة فاشلة
- كارثة Knight Capital بخسارة 460 مليون دولار بسبب نشر يدوي هي الحجة الواقعية لأتمتة هذا

**جرّبه:** ثبّت Docker Desktop، اكتب الـ Dockerfile أعلاه لتطبيق Node صغير، ونفّذ \`docker build\` ثم \`docker run\`. **التالي:** تصميم الأنظمة — هندسة خلفيات تتوسّع لملايين المستخدمين.`,
      },
    },
  ],
};
