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
- **Responsive prefixes** (\`sm:\`, \`md:\`, \`lg:\`) — one class list, every screen size
- How to add the real Tailwind to a project`,
        ar: `## ماذا ستتعلم

- الفكرة التي اجتاحت عالم الواجهات: **كلاسات الأدوات (utility classes)**
- قراءة كود Tailwind (كل مشروع حديث يحتوي عليه)
- بناء Tailwind مصغّر بنفسك *لتفهمه* حقاً
- **بادئات الاستجابة** (\`sm:\`، \`md:\`، \`lg:\`) — قائمة كلاسات واحدة، لكل حجم شاشة
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
      type: "text",
      body: {
        en: `## Responsive design — one class list, every screen 📱💻

A phone screen is ~375px wide; a laptop is often 1440px+. Tailwind bakes responsiveness right into the class names using **breakpoint prefixes**:

\`\`\`html
<div class="p-4 md:p-8 lg:p-12">
  <!-- padding: 16px on phones, 32px on tablets, 48px on desktops -->
</div>
\`\`\`

The default breakpoints (memorize \`md\` and \`lg\` — you'll use them constantly):

- *(no prefix)* — applies to **all** sizes (mobile-first default)
- \`sm:\` — 640px and up
- \`md:\` — 768px and up (tablets)
- \`lg:\` — 1024px and up (small laptops)
- \`xl:\` — 1280px and up (desktops)

Read \`md:flex\` as "apply \`display: flex\`, but only on screens 768px and wider." Stack them to build a fully responsive layout without writing a single \`@media\` query by hand — e.g. \`hidden md:flex\` means "hidden on mobile, shown as flex from tablet up," the exact pattern behind "hide this menu on phones, show it on desktop."`,
        ar: `## التصميم المتجاوب — قائمة كلاسات واحدة، لكل شاشة 📱💻

شاشة الهاتف ~375px عرضاً؛ والحاسوب المحمول غالباً 1440px+. يدمج Tailwind الاستجابة مباشرة في أسماء الكلاسات عبر **بادئات نقاط الكسر (breakpoints)**:

\`\`\`html
<div class="p-4 md:p-8 lg:p-12">
  <!-- padding: 16px على الهواتف، 32px على الأجهزة اللوحية، 48px على الحواسيب -->
</div>
\`\`\`

نقاط الكسر الافتراضية (احفظ \`md\` و\`lg\` — ستستخدمهما باستمرار):

- *(بلا بادئة)* — تُطبَّق على **كل** الأحجام (افتراضي يبدأ من الجوال)
- \`sm:\` — 640px فأكثر
- \`md:\` — 768px فأكثر (الأجهزة اللوحية)
- \`lg:\` — 1024px فأكثر (حواسيب محمولة صغيرة)
- \`xl:\` — 1280px فأكثر (حواسيب مكتبية)

اقرأ \`md:flex\` كـ"طبّق \`display: flex\`، لكن فقط على شاشات 768px فأعرض." كدّسها لبناء تخطيط متجاوب كامل دون كتابة استعلام \`@media\` واحد يدوياً — مثلاً \`hidden md:flex\` تعني "مخفي على الجوال، معروض كـflex من الجهاز اللوحي فأكبر،" بالضبط النمط خلف "أخفِ هذه القائمة على الهواتف، أظهرها على الحاسوب."`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `**Add two more utilities to your mini-Tailwind.** In the \`<style>\` block, define:
1. \`.text-xl\` → \`font-size: 20px\`
2. \`.flex-row\` → \`display: flex\` and \`gap: 12px\`

The HTML below already uses both classes on a row of two badges.`,
        ar: `**أضف أداتين أخريين لـ Tailwind المصغّر خاصتك.** في كتلة \`<style>\`، عرّف:
1. \`.text-xl\` ← \`font-size: 20px\`
2. \`.flex-row\` ← \`display: flex\` و \`gap: 12px\`

الـ HTML أدناه يستخدم الكلاسين على صف من شارتين.`,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { background: #e2e8f0; font-family: sans-serif; padding: 20px; }

      /* define .text-xl and .flex-row here */

    </style>
  </head>
  <body>
    <div class="flex-row">
      <span class="text-xl">🔥</span>
      <span class="text-xl">⭐</span>
    </div>
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { background: #e2e8f0; font-family: sans-serif; padding: 20px; }

      .text-xl { font-size: 20px; }
      .flex-row { display: flex; gap: 12px; }
    </style>
  </head>
  <body>
    <div class="flex-row">
      <span class="text-xl">🔥</span>
      <span class="text-xl">⭐</span>
    </div>
  </body>
</html>`,
      hints: [
        { en: `.text-xl { font-size: 20px; }`, ar: `.text-xl { font-size: 20px; }` },
        { en: `.flex-row { display: flex; gap: 12px; }`, ar: `.flex-row { display: flex; gap: 12px; }` },
      ],
      tests: [
        { name: { en: ".text-xl sets font-size to 20px", ar: ".text-xl يضبط font-size على 20px" }, check: `parseFloat(getComputedStyle(document.querySelector(".text-xl")).fontSize) === 20` },
        { name: { en: ".flex-row is a flex container", ar: ".flex-row حاوية flex" }, check: `getComputedStyle(document.querySelector(".flex-row")).display === "flex"` },
        { name: { en: ".flex-row has a 12px gap", ar: ".flex-row لها فجوة 12px" }, check: `parseFloat(getComputedStyle(document.querySelector(".flex-row")).gap) === 12` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: this site's own buttons 🔍

Look at any green button throughout this platform's lessons — its class list is real Tailwind you can now read completely: \`bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl px-4 py-2\`. Translated: emerald background, slightly lighter emerald on hover, black text, extra-large rounded corners, and specific horizontal/vertical padding. Not a single custom CSS file was touched to make that button — it's utilities, composed. That's the entire craft of utility-first CSS.`,
        ar: `## دراسة حالة واقعية: أزرار هذا الموقع نفسها 🔍

انظر لأي زر أخضر عبر دروس هذه المنصة — قائمة كلاساته Tailwind حقيقي تستطيع الآن قراءتها كاملة: \`bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl px-4 py-2\`. مترجمة: خلفية زمردية، أفتح قليلاً عند التمرير، نص أسود، زوايا دائرية كبيرة جداً، وحشو أفقي/رأسي محدد. لم يُلمس ملف CSS مخصص واحد لصنع ذلك الزر — إنها أدوات، مُركَّبة. هذه هي حرفة CSS بأسلوب الأدوات كلها.`,
      },
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
        {
          q: { en: "What does md:flex mean?", ar: "ماذا تعني md:flex؟" },
          choices: [
            { en: "Apply display: flex only on screens 768px and wider", ar: "طبّق display: flex فقط على شاشات 768px فأعرض" },
            { en: "Apply flex only on mobile phones", ar: "طبّق flex على الهواتف فقط" },
            { en: "Make the text medium-sized", ar: "اجعل النص متوسط الحجم" },
          ],
          answer: 0,
          explain: {
            en: "md: is a responsive breakpoint prefix (768px+) — the class only takes effect at that screen width and above.",
            ar: "md: بادئة نقطة كسر متجاوبة (768px فأكثر) — يسري الكلاس فقط عند ذلك العرض فأكثر.",
          },
        },
        {
          q: { en: "What does hidden md:flex achieve?", ar: "ماذا يحقق hidden md:flex؟" },
          choices: [
            { en: "Hidden on mobile, shown as flex from tablet screens up", ar: "مخفي على الجوال، معروض كـflex من شاشات الأجهزة اللوحية فأكبر" },
            { en: "Always hidden, on every screen", ar: "مخفي دائماً، على كل شاشة" },
            { en: "Flex on mobile only", ar: "flex على الجوال فقط" },
          ],
          answer: 0,
          explain: {
            en: "Combining a base utility (hidden) with a breakpoint-prefixed one (md:flex) is exactly how a 'desktop-only nav, hidden on phones' is built without any @media query.",
            ar: "دمج أداة أساسية (hidden) مع أخرى ببادئة نقطة كسر (md:flex) هو بالضبط كيف يُبنى 'تنقّل للحاسوب فقط، مخفي على الهواتف' بلا أي استعلام @media.",
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

**Practice plan:** rebuild your HTML & CSS lesson card using only Tailwind classes, add \`md:\` and \`lg:\` variants so it resizes gracefully, then browse a real project (this site's source on GitHub!) and read its class lists — you'll understand every one now.`,
        ar: `## أضف Tailwind الحقيقي

في مشروع Vite/Next:

\`\`\`
npm install tailwindcss @tailwindcss/vite
\`\`\`

…ثم اتبع دليل الدقيقتين لإطارك على **tailwindcss.com/docs/installation** (لكل إطار وصفة دقيقة).

**خطة التدريب:** أعد بناء بطاقة درس HTML و CSS باستخدام كلاسات Tailwind فقط، أضف صيغتي \`md:\` و\`lg:\` لتتحجّم بسلاسة، ثم تصفح مشروعاً حقيقياً (كود هذا الموقع على GitHub!) واقرأ قوائم الكلاسات — ستفهم كل واحدة الآن.`,
      },
    },
  ],
};
