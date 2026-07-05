import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "design-systems",
  title: { en: "Design Systems — Consistency at Scale", ar: "أنظمة التصميم — الاتساق على نطاق واسع" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What a design system is and why big products need one
- **Design tokens** and reusable components
- How design systems connect design and code
- You'll define design tokens with CSS variables`,
        ar: `## ماذا ستتعلم

- ما هو نظام التصميم ولماذا تحتاجه المنتجات الكبيرة
- **رموز التصميم (Design tokens)** والمكوّنات المعاد استخدامها
- كيف تربط أنظمة التصميم التصميم بالكود
- ستعرّف رموز تصميم بمتغيرات CSS`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A LEGO kit for your product 🧱

Imagine a big product with 50 screens designed by 5 people. Without coordination you'd get 12 slightly different blues, 8 button styles, and inconsistent spacing everywhere — it looks unprofessional and confuses users. A **design system** solves this: it's a single, shared library of **reusable components and rules** that everyone builds from — a LEGO kit for your product where every piece fits.

A design system has two layers:

**1. Design tokens** — the smallest decisions, named and stored in one place: the exact brand colors, the font sizes, the spacing scale, the border radii. Instead of "this blue is #2563EB" scattered across 50 files, you define \`color-primary\` *once*. Change it in one place and the whole product updates. (You've seen this idea everywhere now — CSS variables, Tailwind's scale, Figma components: define once, reuse.)

**2. Components** — reusable, pre-designed elements built from those tokens: the Button, the Card, the Input, the Modal — each with defined states (hover, disabled, error). A designer grabs the standard Button instead of drawing a new one; a developer uses the coded Button component. Same button, everywhere, forever consistent.

**Why it's powerful:**
- **Consistency** — every screen feels like one coherent product, because it's built from the same parts.
- **Speed** — assembling from ready components is *far* faster than designing each screen from scratch.
- **Collaboration** — designers and developers share one language. A "Primary Button" means the exact same thing in Figma and in code.
- **Easy updates** — rebrand? Change the tokens, and thousands of screens update at once.

Famous examples: Google's **Material Design**, IBM's **Carbon**, Shopify's **Polaris**. This very SkillForge site has an informal one — consistent emerald accents, the same card style, one spacing rhythm.

**The big idea unifying the whole track:** *define once, reuse everywhere.* It's the same principle as functions, React components, Tailwind utilities, and Figma components — a design system applies it to your entire product's visual language. Master this, and you can build interfaces that are consistent, fast to produce, and easy to maintain — exactly what companies pay senior designers and frontend engineers to do.`,
        ar: `## طقم ليغو لمنتجك 🧱

تخيّل منتجاً كبيراً بـ 50 شاشة صمّمها 5 أشخاص. بلا تنسيق ستحصل على 12 درجة زرقاء مختلفة قليلاً، و8 أنماط أزرار، ومسافات غير متسقة في كل مكان — يبدو غير احترافي ويربك المستخدمين. **نظام التصميم** يحل هذا: مكتبة واحدة مشتركة من **المكوّنات والقواعد المعاد استخدامها** يبني منها الجميع — طقم ليغو لمنتجك حيث تتناسب كل قطعة.

لنظام التصميم طبقتان:

**1. رموز التصميم (Design tokens)** — أصغر القرارات، مسمّاة ومخزّنة في مكان واحد: ألوان العلامة بالضبط، أحجام الخطوط، مقياس المسافات، أنصاف أقطار الحواف. بدل "هذا الأزرق #2563EB" مبعثراً عبر 50 ملفاً، تعرّف \`color-primary\` *مرة*. غيّره في مكان واحد فيتحدث المنتج كله. (رأيت هذه الفكرة في كل مكان الآن — متغيرات CSS، مقياس Tailwind، مكوّنات Figma: عرّف مرة، أعد الاستخدام.)

**2. المكوّنات (Components)** — عناصر معاد استخدامها مصمّمة مسبقاً من تلك الرموز: الزر، البطاقة، الحقل، النافذة — كلٌّ بحالات محددة (تمرير، معطّل، خطأ). المصمّم يأخذ الزر القياسي بدل رسم جديد؛ والمطوّر يستخدم مكوّن الزر المبرمج. نفس الزر، في كل مكان، متسق للأبد.

**لماذا هو قوي:**
- **الاتساق** — كل شاشة تبدو منتجاً متماسكاً واحداً، لأنها مبنية من نفس الأجزاء.
- **السرعة** — التجميع من مكوّنات جاهزة أسرع *بكثير* من تصميم كل شاشة من الصفر.
- **التعاون** — المصمّمون والمطوّرون يتشاركون لغة واحدة. "الزر الأساسي" يعني الشيء نفسه بالضبط في Figma والكود.
- **التحديثات السهلة** — إعادة علامة؟ غيّر الرموز، فتتحدث آلاف الشاشات دفعة واحدة.

أمثلة شهيرة: **Material Design** من قوقل، و**Carbon** من IBM، و**Polaris** من Shopify. وموقع SkillForge نفسه له واحد غير رسمي — لمسات زمردية متسقة، نفس نمط البطاقة، إيقاع مسافات واحد.

**الفكرة الكبرى التي توحّد المسار كله:** *عرّف مرة، أعد الاستخدام في كل مكان.* إنه نفس مبدأ الدوال ومكوّنات React وأدوات Tailwind ومكوّنات Figma — نظام التصميم يطبّقه على لغة منتجك البصرية كاملة. أتقن هذا فتبني واجهات متسقة، سريعة الإنتاج، وسهلة الصيانة — بالضبط ما تدفع الشركات لكبار المصمّمين ومهندسي الواجهات مقابله.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `Build design tokens with CSS variables. In \`:root\`, define three tokens, then the two buttons below will use them. Define:
1. \`--color-primary\` set to any green (e.g. \`#10b981\`)
2. \`--radius\` set to at least \`8px\`

Both \`.btn\` buttons already reference \`var(--color-primary)\` and \`var(--radius)\` — define the tokens so they take effect. (Change one token → both buttons update: that's the power.)`,
        ar: `ابنِ رموز تصميم بمتغيرات CSS. في \`:root\`، عرّف ثلاثة رموز، فيستخدمها الزرّان أدناه. عرّف:
1. \`--color-primary\` بأي أخضر (مثل \`#10b981\`)
2. \`--radius\` بما لا يقل عن \`8px\`

كلا زرّي \`.btn\` يشيران أصلاً إلى \`var(--color-primary)\` و\`var(--radius)\` — عرّف الرموز لتأخذ مفعولها. (غيّر رمزاً واحداً ← يتحدث الزرّان: تلك هي القوة.)`,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <style>
      :root {
        /* define --color-primary and --radius here */
      }
      body { font-family: sans-serif; padding: 24px; }
      .btn {
        background: var(--color-primary);
        border-radius: var(--radius);
        color: white; border: none; padding: 12px 20px;
        font-size: 15px; margin-right: 8px; cursor: pointer;
      }
    </style>
  </head>
  <body>
    <button class="btn">Save</button>
    <button class="btn">Continue</button>
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <head>
    <style>
      :root {
        --color-primary: #10b981;
        --radius: 10px;
      }
      body { font-family: sans-serif; padding: 24px; }
      .btn {
        background: var(--color-primary);
        border-radius: var(--radius);
        color: white; border: none; padding: 12px 20px;
        font-size: 15px; margin-right: 8px; cursor: pointer;
      }
    </style>
  </head>
  <body>
    <button class="btn">Save</button>
    <button class="btn">Continue</button>
  </body>
</html>`,
      hints: [
        { en: `Inside :root, write --color-primary: #10b981; and --radius: 10px;`, ar: `داخل :root، اكتب --color-primary: #10b981; و --radius: 10px;` },
        { en: `CSS variables are defined with -- and read with var(--name).`, ar: `متغيرات CSS تُعرّف بـ -- وتُقرأ بـ var(--name).` },
      ],
      tests: [
        { name: { en: "Buttons have a green background from the token", ar: "للأزرار خلفية خضراء من الرمز" }, check: `(function(){ var bg = getComputedStyle(document.querySelector(".btn")).backgroundColor; var m = bg.match(/\\d+/g); return m && parseInt(m[1]) > parseInt(m[0]) && parseInt(m[1]) > parseInt(m[2]); })()` },
        { name: { en: "Border-radius from token is ≥ 8px", ar: "نصف قطر الحافة من الرمز ≥ 8px" }, check: `parseFloat(getComputedStyle(document.querySelector(".btn")).borderTopLeftRadius) >= 8` },
        { name: { en: "Both buttons share the token (consistent)", ar: "الزرّان يتشاركان الرمز (متسق)" }, check: `getComputedStyle(document.querySelectorAll(".btn")[0]).backgroundColor === getComputedStyle(document.querySelectorAll(".btn")[1]).backgroundColor` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is a design token?", ar: "ما هو رمز التصميم (design token)؟" },
          choices: [
            { en: "A named, reusable design decision (color, spacing, radius) stored once", ar: "قرار تصميم مسمّى معاد استخدامه (لون، مسافة، نصف قطر) مخزّن مرة" },
            { en: "A cryptocurrency", ar: "عملة رقمية" },
            { en: "A login password", ar: "كلمة مرور دخول" },
          ],
          answer: 0,
          explain: {
            en: "Tokens like color-primary are defined once and reused everywhere — change one place, the whole product updates.",
            ar: "الرموز مثل color-primary تُعرّف مرة وتُعاد في كل مكان — غيّر مكاناً واحداً فيتحدث المنتج كله.",
          },
        },
        {
          q: { en: "Why do large products need a design system?", ar: "لماذا تحتاج المنتجات الكبيرة نظام تصميم؟" },
          choices: [
            { en: "Consistency, speed, and shared language between design and code", ar: "الاتساق والسرعة ولغة مشتركة بين التصميم والكود" },
            { en: "To use more colors", ar: "لاستخدام ألوان أكثر" },
            { en: "To slow down development", ar: "لإبطاء التطوير" },
          ],
          answer: 0,
          explain: {
            en: "Reusable components + tokens keep 50 screens coherent, speed up work, and let designers and devs share one vocabulary.",
            ar: "المكوّنات + الرموز المعاد استخدامها تُبقي 50 شاشة متماسكة، تسرّع العمل، وتتيح للمصمّمين والمطوّرين لغة واحدة.",
          },
        },
        {
          q: { en: "What single principle unifies functions, React components, and design systems?", ar: "ما المبدأ الواحد الذي يوحّد الدوال ومكوّنات React وأنظمة التصميم؟" },
          choices: [
            { en: "Define once, reuse everywhere", ar: "عرّف مرة، أعد الاستخدام في كل مكان" },
            { en: "Copy and paste often", ar: "انسخ والصق كثيراً" },
            { en: "Always start from scratch", ar: "ابدأ دائماً من الصفر" },
          ],
          answer: 0,
          explain: {
            en: "It's the throughline of the whole platform: one definition, reused and updated in one place. Design systems apply it to visuals.",
            ar: "إنه الخيط الناظم للمنصة كلها: تعريف واحد، معاد ومحدّث في مكان واحد. أنظمة التصميم تطبّقه على المرئيات.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A design system is a shared library of reusable components + tokens
- Design tokens (color, spacing, radius) are defined once and reused
- Benefits: consistency, speed, collaboration, easy rebranding
- You built real design tokens with CSS variables

**Next:** Accessibility — making sure your beautiful, consistent designs work for *everyone*.`,
        ar: `## الخلاصة

- نظام التصميم مكتبة مشتركة من مكوّنات + رموز معاد استخدامها
- رموز التصميم (لون، مسافة، نصف قطر) تُعرّف مرة وتُعاد
- الفوائد: الاتساق، السرعة، التعاون، إعادة العلامة السهلة
- بنيت رموز تصميم حقيقية بمتغيرات CSS

**التالي:** إمكانية الوصول — التأكد من أن تصاميمك الجميلة المتسقة تعمل لـ*الجميع*.`,
      },
    },
  ],
};
