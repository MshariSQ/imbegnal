import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "css-frameworks",
  title: { en: "Tailwind CSS — Style at the Speed of Thought", ar: "Tailwind CSS — نسّق بسرعة التفكير" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- The idea that took over frontend: **utility classes**
- Reading Tailwind code (every modern codebase has it)
- Build your own mini-Tailwind to *truly* understand it
- How to add the real Tailwind to a project`,
        ar: `## ماذا ستتعلم

- الفكرة التي اجتاحت عالم الواجهات: **كلاسات الأدوات (utility classes)**
- قراءة كود Tailwind (كل مشروع حديث يحتوي عليه)
- بناء Tailwind مصغّر بنفسك *لتفهمه* حقاً
- كيف تضيف Tailwind الحقيقي إلى مشروعك`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The spice rack 🧂

Classic CSS is like cooking where every dish needs its own custom sauce made from scratch:

\`\`\`css
.product-card { padding: 16px; background: white; border-radius: 8px; }
.profile-card { padding: 16px; background: white; border-radius: 8px; }
/* …the same sauce, re-made, forever */
\`\`\`

**Utility-first CSS** is a spice rack: hundreds of tiny, single-job classes already prepared. You season the HTML directly:

\`\`\`html
<div class="p-4 bg-white rounded-lg shadow">
  A card, styled inline — no CSS file touched.
</div>
\`\`\`

That's **Tailwind CSS** — each class does exactly one thing:

- \`p-4\` → padding: 1rem
- \`bg-white\` → white background
- \`rounded-lg\` → large border radius
- \`text-xl\` → bigger text
- \`flex gap-2\` → flexbox with spacing
- \`hover:bg-gray-100\` → different background on hover

At first it looks "messy". Then you notice: you never invent class names, never jump between files, never break another page by editing shared CSS, and deleting HTML deletes its styles with it. That's why it won — this exact site is built with Tailwind.`,
        ar: `## رف التوابل 🧂

الـ CSS التقليدي مثل مطبخ يحتاج كل طبق فيه صلصة خاصة تُعدّ من الصفر:

\`\`\`css
.product-card { padding: 16px; background: white; border-radius: 8px; }
.profile-card { padding: 16px; background: white; border-radius: 8px; }
/* …نفس الصلصة، تُعاد صناعتها، إلى الأبد */
\`\`\`

**CSS بأسلوب الأدوات** هو رف توابل: مئات الكلاسات الصغيرة أحادية المهمة جاهزة مسبقاً. تتبّل الـ HTML مباشرة:

\`\`\`html
<div class="p-4 bg-white rounded-lg shadow">
  بطاقة منسقة مباشرة — دون لمس ملف CSS.
</div>
\`\`\`

هذا هو **Tailwind CSS** — كل كلاس يفعل شيئاً واحداً بالضبط:

- \`p-4\` ← padding: 1rem
- \`bg-white\` ← خلفية بيضاء
- \`rounded-lg\` ← زوايا دائرية كبيرة
- \`text-xl\` ← نص أكبر
- \`flex gap-2\` ← فليكس بوكس مع مسافات
- \`hover:bg-gray-100\` ← خلفية مختلفة عند التمرير

في البداية يبدو "فوضوياً". ثم تلاحظ: لا تخترع أسماء كلاسات أبداً، لا تقفز بين الملفات، لا تكسر صفحة أخرى بتعديل CSS مشترك، وحذف الـ HTML يحذف تنسيقاته معه. لهذا انتصر — هذا الموقع نفسه مبني بـ Tailwind.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `**Build your own mini-Tailwind!** Nothing teaches the concept better.

In the \`<style>\` block, define these 4 utility classes:
1. \`.p-4\` → \`padding: 16px\`
2. \`.bg-white\` → \`background: white\`
3. \`.rounded\` → \`border-radius: 8px\`
4. \`.shadow\` → \`box-shadow: 0 2px 8px rgba(0,0,0,0.15)\`

The HTML already uses them — define the classes and watch both cards light up **at once**. (That's the "define once, season everywhere" effect.)`,
        ar: `**ابنِ Tailwind مصغّراً بنفسك!** لا شيء يشرح الفكرة أفضل من هذا.

في كتلة \`<style>\`، عرّف هذه الكلاسات الأربعة:
1. \`.p-4\` ← \`padding: 16px\`
2. \`.bg-white\` ← \`background: white\`
3. \`.rounded\` ← \`border-radius: 8px\`
4. \`.shadow\` ← \`box-shadow: 0 2px 8px rgba(0,0,0,0.15)\`

الـ HTML يستخدمها مسبقاً — عرّف الكلاسات وشاهد البطاقتين تكتسيان **معاً**. (هذا أثر "عرّف مرة، تبّل في كل مكان".)`,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { background: #e2e8f0; font-family: sans-serif; padding: 20px; }

      /* define your utilities here:
         .p-4 { ... }  .bg-white { ... }  .rounded { ... }  .shadow { ... } */

    </style>
  </head>
  <body>
    <div class="p-4 bg-white rounded shadow">
      <h3>Card one</h3>
      <p>Styled with utilities only.</p>
    </div>
    <br>
    <div class="p-4 bg-white rounded shadow">
      <h3>Card two</h3>
      <p>Same utilities, zero repetition.</p>
    </div>
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { background: #e2e8f0; font-family: sans-serif; padding: 20px; }

      .p-4 { padding: 16px; }
      .bg-white { background: white; }
      .rounded { border-radius: 8px; }
      .shadow { box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    </style>
  </head>
  <body>
    <div class="p-4 bg-white rounded shadow">
      <h3>Card one</h3>
      <p>Styled with utilities only.</p>
    </div>
    <br>
    <div class="p-4 bg-white rounded shadow">
      <h3>Card two</h3>
      <p>Same utilities, zero repetition.</p>
    </div>
  </body>
</html>`,
      hints: [
        { en: `Each utility is a one-line rule: \`.p-4 { padding: 16px; }\``, ar: `كل أداة قاعدة من سطر واحد: \`.p-4 { padding: 16px; }\`` },
        { en: `Copy the box-shadow value exactly from the prompt for .shadow.`, ar: `انسخ قيمة box-shadow كما في نص التمرين لكلاس .shadow.` },
      ],
      tests: [
        {
          name: { en: ".p-4 applies 16px padding", ar: ".p-4 يطبّق padding بمقدار 16px" },
          check: `parseFloat(getComputedStyle(document.querySelector(".p-4")).paddingTop) === 16`,
        },
        {
          name: { en: ".bg-white applies a white background", ar: ".bg-white يطبّق خلفية بيضاء" },
          check: `getComputedStyle(document.querySelector(".bg-white")).backgroundColor === "rgb(255, 255, 255)"`,
        },
        {
          name: { en: ".rounded applies 8px radius", ar: ".rounded يطبّق زوايا 8px" },
          check: `parseFloat(getComputedStyle(document.querySelector(".rounded")).borderTopLeftRadius) === 8`,
        },
        {
          name: { en: ".shadow applies a box-shadow", ar: ".shadow يطبّق ظلاً" },
          check: `getComputedStyle(document.querySelector(".shadow")).boxShadow !== "none"`,
        },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is a utility class?", ar: "ما هو كلاس الأداة (utility class)؟" },
          choices: [
            { en: "A tiny class that does exactly one styling job", ar: "كلاس صغير يؤدي مهمة تنسيق واحدة بالضبط" },
            { en: "A class that styles the whole page", ar: "كلاس ينسّق الصفحة كاملة" },
            { en: "A JavaScript helper function", ar: "دالة مساعدة في JavaScript" },
          ],
          answer: 0,
          explain: {
            en: "One class = one job (p-4 = padding only). You compose many small utilities instead of writing custom CSS per component.",
            ar: "كلاس واحد = مهمة واحدة (p-4 = padding فقط). تركّب أدوات صغيرة كثيرة بدل كتابة CSS مخصص لكل مكوّن.",
          },
        },
        {
          q: { en: "In Tailwind, hover:bg-gray-100 means…", ar: "في Tailwind، hover:bg-gray-100 تعني…" },
          choices: [
            { en: "Gray background all the time", ar: "خلفية رمادية دائماً" },
            { en: "Gray background only while the mouse is over it", ar: "خلفية رمادية فقط أثناء مرور الفأرة فوقه" },
            { en: "Hide the element on hover", ar: "إخفاء العنصر عند التمرير" },
          ],
          answer: 1,
          explain: {
            en: "Prefixes like hover:, focus:, md: apply the utility conditionally — on state or screen size. md:p-8 = that padding only on medium screens and up.",
            ar: "بادئات مثل hover: و focus: و md: تطبّق الأداة شرطياً — حسب الحالة أو حجم الشاشة. md:p-8 = هذا الـ padding على الشاشات المتوسطة فأكبر فقط.",
          },
        },
        {
          q: { en: "The biggest practical win of utility-first CSS is…", ar: "أكبر مكسب عملي لأسلوب الأدوات هو…" },
          choices: [
            { en: "Web pages load twice as fast", ar: "تحميل الصفحات أسرع بمرتين" },
            { en: "You stop inventing names and stop fearing edits to shared CSS", ar: "تتوقف عن اختراع الأسماء وعن الخوف من تعديل CSS المشترك" },
            { en: "It removes the need to learn CSS", ar: "يلغي الحاجة لتعلم CSS" },
          ],
          answer: 1,
          explain: {
            en: "Styles live with their markup, so changes are local and safe. And no — you still need real CSS knowledge; Tailwind is CSS shorthand, not a replacement.",
            ar: "التنسيقات تعيش مع وسومها، فالتغييرات محلية وآمنة. ولا — ما زلت تحتاج فهم CSS الحقيقي؛ Tailwind اختصار لـ CSS وليس بديلاً عنه.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Add the real Tailwind

In a Vite/Next project:

\`\`\`
npm install tailwindcss @tailwindcss/vite
\`\`\`

…then follow the 2-minute framework guide at **tailwindcss.com/docs/installation** (each framework has an exact recipe).

**Practice plan:** rebuild your HTML & CSS lesson card using only Tailwind classes, then browse a real project (this site's source on GitHub!) and read its class lists — you'll understand every one now.`,
        ar: `## أضف Tailwind الحقيقي

في مشروع Vite/Next:

\`\`\`
npm install tailwindcss @tailwindcss/vite
\`\`\`

…ثم اتبع دليل الدقيقتين لإطارك على **tailwindcss.com/docs/installation** (لكل إطار وصفة دقيقة).

**خطة التدريب:** أعد بناء بطاقة درس HTML و CSS باستخدام كلاسات Tailwind فقط، ثم تصفح مشروعاً حقيقياً (كود هذا الموقع على GitHub!) واقرأ قوائم الكلاسات — ستفهم كل واحدة الآن.`,
      },
    },
  ],
};
