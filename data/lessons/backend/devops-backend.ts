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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Containers package your app + its entire environment → runs identically everywhere
- A Dockerfile is the recipe; you build an image and run it as a container
- Deploy path: code → image → registry → server → domain

**Try it:** install Docker Desktop, write the Dockerfile above for a small Node app, and run \`docker build\` then \`docker run\`. **Next:** System Design — architecting backends that scale to millions.`,
        ar: `## الخلاصة

- الحاويات تحزم تطبيقك + بيئته كاملة ← يعمل بشكل مطابق في كل مكان
- Dockerfile هو الوصفة؛ تبني صورة وتشغّلها كحاوية
- طريق النشر: كود ← صورة ← مستودع ← خادم ← نطاق

**جرّبه:** ثبّت Docker Desktop، اكتب الـ Dockerfile أعلاه لتطبيق Node صغير، ونفّذ \`docker build\` ثم \`docker run\`. **التالي:** تصميم الأنظمة — هندسة خلفيات تتوسّع لملايين المستخدمين.`,
      },
    },
  ],
};
