import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "prototyping",
  title: { en: "Prototyping — Test Before You Build", ar: "النماذج الأولية — اختبر قبل أن تبني" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What a prototype is and why it's powerful
- Clickable prototypes in Figma
- Testing interactions before writing code
- The iterate-fast design loop`,
        ar: `## ماذا ستتعلم

- ما هو النموذج الأولي ولماذا هو قوي
- النماذج القابلة للنقر في Figma
- اختبار التفاعلات قبل كتابة الكود
- حلقة التصميم سريعة التكرار`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A fake that feels real 🎭

A **prototype** is a *simulation* of your product that a person can click through — it looks and behaves like the real app, but there's no code behind it. It's a movie set: the storefront looks real from the front, but it's held up by sticks. That fakery is exactly the point — it lets you **test the experience before spending weeks building it for real**.

In Figma, you turn static screens into a prototype by **linking them**: "when the user taps this *Login* button, go to the *Dashboard* screen." Chain these links across your screens and you get something that *feels* like a working app on a phone or in a browser — you can tap through the whole flow. You can even add transitions (slide, fade) to mimic real motion.

**Why prototypes are so valuable:**
- **Test real interactions** — a static wireframe can't reveal that your checkout flow is confusing; a clickable prototype can. Users *do* the task and you watch where they get stuck (usability testing from the research lesson — now with something clickable).
- **Catch problems for pennies** — fixing a flawed flow in Figma is dragging arrows around. Fixing it after developers built it costs weeks. Prototyping moves discovery to the cheapest possible moment.
- **Communicate clearly** — a clickable demo shows your team, boss, or client exactly what you mean far better than words or static images. It gets everyone aligned before a line of code is written.

**The design loop this enables:**
\`\`\`
Sketch idea → prototype it → test with users → learn → refine → test again → ...
\`\`\`

This fast, cheap loop is the heart of good UX design. Each turn of the loop costs little but improves the design a lot, so you *iterate your way* to something genuinely good — instead of guessing once, building it, and hoping. The best designers aren't the ones who get it perfect on the first try; they're the ones who iterate quickly with prototypes and real feedback.

Only after the prototype proves the experience works do you hand it to developers to build for real — now with confidence that you're building the *right* thing.`,
        ar: `## زيف يبدو حقيقياً 🎭

**النموذج الأولي (prototype)** *محاكاة* لمنتجك يستطيع شخص النقر خلالها — يبدو ويتصرّف كالتطبيق الحقيقي، لكن لا كود خلفه. إنه موقع تصوير سينمائي: الواجهة تبدو حقيقية من الأمام، لكنها مسنودة بعصيّ. ذلك الزيف هو الغاية بالضبط — يتيح لك **اختبار التجربة قبل إنفاق أسابيع في بنائها فعلاً**.

في Figma، تحوّل الشاشات الساكنة إلى نموذج بـ**ربطها**: "حين ينقر المستخدم زر *تسجيل الدخول* هذا، اذهب لشاشة *لوحة التحكم*." سلسِل هذه الروابط عبر شاشاتك فتحصل على شيء *يبدو* كتطبيق عامل على هاتف أو في متصفح — تنقر خلال التدفق كله. ويمكنك إضافة انتقالات (انزلاق، تلاشٍ) لمحاكاة الحركة الحقيقية.

**لماذا النماذج قيّمة جداً:**
- **اختبر التفاعلات الحقيقية** — إطار سلكي ساكن لا يكشف أن تدفق الدفع محيّر؛ ونموذج قابل للنقر يكشفه. المستخدمون *ينفّذون* المهمة وتراقب أين يعلقون (اختبار الاستخدام من درس البحث — الآن بشيء قابل للنقر).
- **امسك المشاكل بقروش** — إصلاح تدفق معيب في Figma هو سحب أسهم. وإصلاحه بعد أن بناه المطوّرون يكلّف أسابيع. النماذج تنقل الاكتشاف لأرخص لحظة ممكنة.
- **تواصل بوضوح** — عرض قابل للنقر يُري فريقك أو مديرك أو عميلك ما تعنيه بالضبط أفضل بكثير من الكلمات أو الصور الساكنة. يوائم الجميع قبل كتابة سطر كود.

**حلقة التصميم التي يتيحها هذا:**
\`\`\`
اسكتش فكرة → نمذجها → اختبر مع مستخدمين → تعلّم → صقل → اختبر مجدداً → ...
\`\`\`

هذه الحلقة السريعة الرخيصة قلب تصميم UX الجيد. كل دورة تكلّف قليلاً لكنها تحسّن التصميم كثيراً، فتـ*كرّر طريقك* إلى شيء جيد فعلاً — بدل التخمين مرة وبنائه والأمل. أفضل المصمّمين ليسوا من يتقنونه من أول محاولة؛ بل من يكرّرون بسرعة بالنماذج والملاحظات الحقيقية.

فقط بعد أن يثبت النموذج أن التجربة تعمل تسلّمه للمطوّرين ليبنوه فعلاً — الآن بثقة أنك تبني الشيء *الصحيح*.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is a prototype?", ar: "ما هو النموذج الأولي؟" },
          choices: [
            { en: "A clickable simulation that feels real but has no code behind it", ar: "محاكاة قابلة للنقر تبدو حقيقية لكن لا كود خلفها" },
            { en: "The final production app", ar: "التطبيق النهائي في الإنتاج" },
            { en: "A database schema", ar: "مخطط قاعدة بيانات" },
          ],
          answer: 0,
          explain: {
            en: "It's a movie-set version of the app — looks and clicks like the real thing so you can test the experience early.",
            ar: "نسخة موقع تصوير من التطبيق — تبدو وتُنقر كالحقيقي لتختبر التجربة مبكراً.",
          },
        },
        {
          q: { en: "Why prototype before building for real?", ar: "لماذا ننمذج قبل البناء الفعلي؟" },
          choices: [
            { en: "Fixing flaws in a prototype costs minutes; fixing built code costs weeks", ar: "إصلاح العيوب في نموذج يكلّف دقائق؛ وإصلاح كود مبنيّ يكلّف أسابيع" },
            { en: "Prototypes are the final deliverable", ar: "النماذج هي المُخرَج النهائي" },
            { en: "It skips the design step", ar: "يتخطّى خطوة التصميم" },
          ],
          answer: 0,
          explain: {
            en: "Prototyping moves problem-discovery to the cheapest moment — dragging arrows, not rewriting production code.",
            ar: "النماذج تنقل اكتشاف المشاكل لأرخص لحظة — سحب أسهم، لا إعادة كتابة كود الإنتاج.",
          },
        },
        {
          q: { en: "What makes a great designer, per this lesson?", ar: "ما الذي يصنع مصمّماً عظيماً، حسب هذا الدرس؟" },
          choices: [
            { en: "Iterating quickly with prototypes and real feedback", ar: "التكرار السريع بالنماذج والملاحظات الحقيقية" },
            { en: "Getting it perfect on the first try", ar: "إتقانه من أول محاولة" },
            { en: "Never testing with users", ar: "عدم الاختبار مع المستخدمين أبداً" },
          ],
          answer: 0,
          explain: {
            en: "The iterate loop (prototype → test → refine) beats one-shot guessing. Great design is refined, not divined.",
            ar: "حلقة التكرار (نموذج ← اختبار ← صقل) تتفوّق على التخمين مرة واحدة. التصميم العظيم يُصقل لا يُلهَم.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A prototype is a clickable, code-free simulation of your product
- Link Figma screens to test real interactions before building
- Catch flaws for pennies, communicate clearly, iterate fast
- Great design = the sketch → prototype → test → refine loop

**Next:** Design Systems — turning your proven designs into reusable, consistent building blocks.`,
        ar: `## الخلاصة

- النموذج الأولي محاكاة قابلة للنقر بلا كود لمنتجك
- اربط شاشات Figma لاختبار التفاعلات الحقيقية قبل البناء
- امسك العيوب بقروش، تواصل بوضوح، كرّر بسرعة
- التصميم العظيم = حلقة اسكتش ← نموذج ← اختبار ← صقل

**التالي:** أنظمة التصميم — تحويل تصاميمك المثبتة إلى لبنات متسقة معاد استخدامها.`,
      },
    },
  ],
};
