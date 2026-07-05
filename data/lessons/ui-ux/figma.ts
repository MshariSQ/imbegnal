import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "figma",
  title: { en: "Figma — The Designer's Workshop", ar: "Figma — ورشة المصمّم" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why Figma became the industry standard
- Frames, components, and auto-layout
- How designers and developers collaborate in it
- Your plan to learn it hands-on (it's free)`,
        ar: `## ماذا ستتعلم

- لماذا صار Figma معيار الصناعة
- الإطارات، المكوّنات، والتخطيط التلقائي
- كيف يتعاون المصمّمون والمطوّرون فيه
- خطتك لتعلّمه عملياً (إنه مجاني)`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Where interfaces are born 🎨

Before a single line of code is written, interfaces are *designed* — and today that almost always happens in **Figma**. It's a free, browser-based design tool that became the industry standard because it's powerful, easy to start, and — crucially — **collaborative**: multiple people edit the same file live, like Google Docs for design. A designer, a developer, and a manager can all be in one file at once.

**The core concepts:**
- **Frames** — containers that represent a screen (a phone screen, a web page). You design inside frames.
- **Shapes, text, and images** — the raw building blocks you arrange, applying the typography and color principles you just learned.
- **Components** — reusable design elements. Design a button *once* as a component, reuse it everywhere; change the master and every copy updates. (Sound familiar? It's the same idea as React components and utility classes — define once, reuse.)
- **Auto Layout** — makes elements resize and rearrange automatically, like CSS flexbox inside the design tool. A button grows to fit its text; a list reflows when you add items.
- **Prototyping** — link frames together (click this button → go to that screen) to simulate a real, clickable app before any code exists (next lessons go deeper).

**Why it matters for your career:** Figma is where the *design-to-development handoff* happens. Developers open the Figma file to see exact colors, spacing, fonts, and sizes — Figma even shows the CSS values. If you learn frontend *and* Figma, you become the rare, valuable person who can both design *and* build an interface — hugely employable for startups and freelance work.

**Your plan:** Figma has a generous free tier. Create an account, follow their official "Figma for Beginners" tutorial (a few hours), and recreate a screen from an app you like (a login page, a profile card). Apply the hierarchy, typography, and color principles from the last lessons. Building real screens is how the tool clicks.`,
        ar: `## حيث تُولد الواجهات 🎨

قبل كتابة سطر كود واحد، تُصمَّم الواجهات — واليوم يحدث ذلك دائماً تقريباً في **Figma**. أداة تصميم مجانية تعمل في المتصفح صارت معيار الصناعة لأنها قوية، سهلة البدء، و— الأهم — **تعاونية**: عدة أشخاص يحرّرون نفس الملف مباشرة، كـ Google Docs للتصميم. مصمّم ومطوّر ومدير كلهم في ملف واحد في آن.

**المفاهيم الأساسية:**
- **الإطارات (Frames)** — حاويات تمثّل شاشة (شاشة هاتف، صفحة ويب). تصمّم داخل الإطارات.
- **الأشكال والنص والصور** — اللبنات الخام التي ترتّبها، مطبّقاً مبادئ الطباعة واللون التي تعلّمتها.
- **المكوّنات (Components)** — عناصر تصميم قابلة لإعادة الاستخدام. صمّم زراً *مرة* كمكوّن، أعد استخدامه في كل مكان؛ غيّر الأصل فتتحدث كل النسخ. (مألوف؟ نفس فكرة مكوّنات React وكلاسات الأدوات — عرّف مرة، أعد الاستخدام.)
- **التخطيط التلقائي (Auto Layout)** — يجعل العناصر تتحجّم وتعيد ترتيبها تلقائياً، كـ flexbox داخل أداة التصميم. الزر ينمو ليناسب نصه؛ والقائمة تتدفق حين تضيف عناصر.
- **النماذج الأولية (Prototyping)** — اربط الإطارات (انقر هذا الزر → اذهب لتلك الشاشة) لمحاكاة تطبيق حقيقي قابل للنقر قبل وجود أي كود (الدروس التالية تتعمّق).

**لماذا يهم مسارك:** Figma حيث يحدث *تسليم التصميم للتطوير*. المطوّرون يفتحون ملف Figma ليروا الألوان والمسافات والخطوط والأحجام بالضبط — وFigma حتى يُظهر قيم CSS. إن تعلّمت الواجهات *و*Figma، تصبح الشخص النادر القيّم الذي يستطيع التصميم *والبناء* — قابل للتوظيف بشدة للشركات الناشئة والعمل الحر.

**خطتك:** Figma فيه طبقة مجانية سخية. أنشئ حساباً، اتبع درسهم الرسمي "Figma for Beginners" (بضع ساعات)، وأعد إنشاء شاشة من تطبيق تحبه (صفحة دخول، بطاقة ملف). طبّق مبادئ التسلسل والطباعة واللون من الدروس السابقة. بناء شاشات حقيقية هو كيف تترسّخ الأداة.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Why did Figma become the industry standard?", ar: "لماذا صار Figma معيار الصناعة؟" },
          choices: [
            { en: "It's free, browser-based, and real-time collaborative", ar: "مجاني، يعمل في المتصفح، وتعاوني فوري" },
            { en: "It's the only design tool", ar: "أداة التصميم الوحيدة" },
            { en: "It writes code for you", ar: "يكتب الكود عنك" },
          ],
          answer: 0,
          explain: {
            en: "Collaboration (multiple live editors), zero install, and a free tier drove Figma's dominance in UI design.",
            ar: "التعاون (محرّرون مباشرون متعددون)، بلا تثبيت، وطبقة مجانية دفعت هيمنة Figma في تصميم الواجهات.",
          },
        },
        {
          q: { en: "What is a Figma component?", ar: "ما هو مكوّن Figma؟" },
          choices: [
            { en: "A reusable design element — change the master, all copies update", ar: "عنصر تصميم قابل لإعادة الاستخدام — غيّر الأصل فتتحدث كل النسخ" },
            { en: "A type of file", ar: "نوع ملف" },
            { en: "A color palette", ar: "لوحة ألوان" },
          ],
          answer: 0,
          explain: {
            en: "Just like React components and CSS utilities — define once, reuse everywhere, update in one place. Same principle.",
            ar: "تماماً كمكوّنات React وأدوات CSS — عرّف مرة، أعد الاستخدام، وحدّث في مكان واحد. نفس المبدأ.",
          },
        },
        {
          q: { en: "How does Figma help the design-to-development handoff?", ar: "كيف يساعد Figma في تسليم التصميم للتطوير؟" },
          choices: [
            { en: "Developers see exact colors, spacing, and sizes (even CSS values)", ar: "المطوّرون يرون الألوان والمسافات والأحجام بالضبط (حتى قيم CSS)" },
            { en: "It emails the code to users", ar: "يرسل الكود بالبريد للمستخدمين" },
            { en: "It deletes the design after coding", ar: "يحذف التصميم بعد البرمجة" },
          ],
          answer: 0,
          explain: {
            en: "The design file is the source of truth for developers — precise specs (and CSS) make building match the design exactly.",
            ar: "ملف التصميم مصدر الحقيقة للمطوّرين — مواصفات دقيقة (وCSS) تجعل البناء يطابق التصميم بالضبط.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Figma is the free, collaborative, browser-based industry-standard design tool
- Frames = screens; components = reusable elements; auto-layout = flexbox-like
- It powers the design-to-dev handoff with exact specs and CSS
- Learning frontend + Figma makes you rare and employable

**Next:** User Research — making sure you design the right thing, not just a pretty thing.`,
        ar: `## الخلاصة

- Figma أداة التصميم المجانية التعاونية معيار الصناعة في المتصفح
- الإطارات = شاشات؛ المكوّنات = عناصر معاد استخدامها؛ التخطيط التلقائي = شبيه flexbox
- يشغّل تسليم التصميم للتطوير بمواصفات دقيقة وCSS
- تعلّم الواجهات + Figma يجعلك نادراً وقابلاً للتوظيف

**التالي:** بحث المستخدم — التأكد من تصميم الشيء الصحيح، لا مجرد شيء جميل.`,
      },
    },
  ],
};
