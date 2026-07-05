import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "wireframing",
  title: { en: "Wireframing & IA — The Blueprint", ar: "الإطار السلكي وهندسة المعلومات — المخطط" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What a wireframe is and why it saves time
- Low-fidelity vs high-fidelity
- **Information Architecture** — organizing content
- Why you design structure before pixels`,
        ar: `## ماذا ستتعلم

- ما هو الإطار السلكي ولماذا يوفّر الوقت
- منخفض الدقة مقابل عالي الدقة
- **هندسة المعلومات** — تنظيم المحتوى
- لماذا تصمّم البنية قبل البكسلات`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The architect's blueprint 📐

You wouldn't build a house by immediately laying bricks — you'd draw a blueprint first: where the rooms go, how they connect. Designing an interface is the same. A **wireframe** is that blueprint: a rough, deliberately plain sketch of a screen's **layout and structure**, *before* any colors, fonts, or polish.

Wireframes are intentionally ugly — usually just grey boxes, lines for text, and Xs for images. That plainness is a feature, not a bug: by removing visual detail, everyone focuses on the questions that matter most first:
- What content goes on this screen?
- Where does each piece go?
- What's most prominent?
- How does the user get from here to the next step?

Solving layout in cheap grey boxes takes minutes and invites honest feedback ("the search should be at the top"). Solving it in a polished, colored mockup wastes hours — and people hesitate to critique something that *looks* finished. **Fail cheap, fail fast.**

**Fidelity levels:**
- **Low-fidelity** — rough sketches (even on paper!) or grey boxes. For quickly exploring layout ideas.
- **High-fidelity** — detailed, close to the final look with real colors, fonts, and content (built in Figma). Comes *later*, once the structure is agreed.

**Information Architecture (IA)** is the bigger-picture sibling: **how you organize and label all the content** across the whole product so people can find things. It's the site's "map" — what are the main sections? what lives under each menu? A great visual design with confusing IA still fails, because users can't find what they need. Good IA groups things the way *users* expect (not the way your company's org chart is arranged — remember, you are not the user).

**The principle:** structure before style. Nail *what goes where* and *how it's organized* with cheap wireframes and solid IA first; apply beautiful typography and color *after*. Doing it in this order saves enormous time and produces designs that are both usable and pretty.`,
        ar: `## مخطط المعماري 📐

لن تبني بيتاً بوضع الطوب فوراً — بل ترسم مخططاً أولاً: أين الغرف، كيف تتصل. تصميم الواجهة مثله. **الإطار السلكي (wireframe)** هو ذلك المخطط: رسم خام بسيط عمداً لـ**تخطيط الشاشة وبنيتها**، *قبل* أي ألوان أو خطوط أو صقل.

الإطارات السلكية قبيحة عمداً — عادة مجرد صناديق رمادية، وخطوط للنص، وإشارات X للصور. هذا البساطة ميزة لا عيب: بإزالة التفاصيل البصرية، يركّز الجميع على الأسئلة الأهم أولاً:
- ما المحتوى في هذه الشاشة؟
- أين يذهب كل جزء؟
- ما الأبرز؟
- كيف ينتقل المستخدم من هنا للخطوة التالية؟

حلّ التخطيط في صناديق رمادية رخيصة يأخذ دقائق ويدعو لملاحظات صادقة ("البحث يجب أن يكون بالأعلى"). وحلّه في نموذج مصقول ملوّن يهدر ساعات — والناس يترددون في نقد شيء *يبدو* مكتملاً. **افشل رخيصاً، افشل سريعاً.**

**مستويات الدقة:**
- **منخفض الدقة** — رسوم خام (حتى على ورق!) أو صناديق رمادية. لاستكشاف أفكار التخطيط بسرعة.
- **عالي الدقة** — مفصّل، قريب من الشكل النهائي بألوان وخطوط ومحتوى حقيقي (يُبنى في Figma). يأتي *لاحقاً*، متى اتُّفق على البنية.

**هندسة المعلومات (IA)** الأخت الأوسع صورة: **كيف تنظّم وتسمّي كل المحتوى** عبر المنتج كله ليجد الناس الأشياء. إنها "خريطة" الموقع — ما الأقسام الرئيسية؟ ما الذي يعيش تحت كل قائمة؟ تصميم بصري رائع بـ IA محيّرة يفشل، لأن المستخدمين لا يجدون ما يحتاجون. IA الجيدة تجمّع الأشياء كما يتوقّع *المستخدمون* (لا كما يُرتّب مخطط شركتك التنظيمي — تذكّر، أنت لست المستخدم).

**المبدأ:** البنية قبل الأسلوب. أتقن *ماذا يذهب أين* و*كيف يُنظَّم* بإطارات سلكية رخيصة وIA متينة أولاً؛ وطبّق الطباعة والألوان الجميلة *بعد*. الترتيب هكذا يوفّر وقتاً هائلاً وينتج تصاميم قابلة للاستخدام وجميلة معاً.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Why are wireframes intentionally plain (grey boxes)?", ar: "لماذا الإطارات السلكية بسيطة عمداً (صناديق رمادية)؟" },
          choices: [
            { en: "To focus on layout and structure before visual detail", ar: "للتركيز على التخطيط والبنية قبل التفاصيل البصرية" },
            { en: "Because designers can't use color", ar: "لأن المصمّمين لا يستطيعون استخدام الألوان" },
            { en: "To make them look bad on purpose for fun", ar: "لجعلها تبدو سيئة عمداً للمرح" },
          ],
          answer: 0,
          explain: {
            en: "Removing polish keeps everyone on the essential questions (what/where) and invites honest, early feedback. Fail cheap.",
            ar: "إزالة الصقل تُبقي الجميع على الأسئلة الجوهرية (ماذا/أين) وتدعو لملاحظات مبكرة صادقة. افشل رخيصاً.",
          },
        },
        {
          q: { en: "What is Information Architecture?", ar: "ما هي هندسة المعلومات؟" },
          choices: [
            { en: "How content is organized and labeled so people can find it", ar: "كيف يُنظَّم المحتوى ويُسمّى ليجده الناس" },
            { en: "The server hardware", ar: "عتاد الخادم" },
            { en: "The color palette", ar: "لوحة الألوان" },
          ],
          answer: 0,
          explain: {
            en: "IA is the product's map — sections, menus, grouping. Beautiful visuals with confusing IA still fail users.",
            ar: "IA خريطة المنتج — الأقسام، القوائم، التجميع. المرئيات الجميلة بـ IA محيّرة تفشل مع المستخدمين.",
          },
        },
        {
          q: { en: "The correct design order is…", ar: "ترتيب التصميم الصحيح هو…" },
          choices: [
            { en: "Structure (wireframe/IA) first, then style (color/type)", ar: "البنية (إطار سلكي/IA) أولاً، ثم الأسلوب (لون/خط)" },
            { en: "Colors first, structure last", ar: "الألوان أولاً، البنية أخيراً" },
            { en: "Order doesn't matter", ar: "الترتيب لا يهم" },
          ],
          answer: 0,
          explain: {
            en: "Decide what goes where cheaply, then make it beautiful. Reversing it wastes time polishing a layout that may change.",
            ar: "قرّر ماذا يذهب أين رخيصاً، ثم اجعله جميلاً. عكسه يهدر الوقت في صقل تخطيط قد يتغيّر.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A wireframe is a plain blueprint of layout — solve structure cheaply first
- Low-fi (rough, fast) → high-fi (detailed, later)
- Information Architecture organizes content so users can find things
- Structure before style saves time and makes better designs

**Next:** Prototyping — making your wireframes clickable to test real interactions.`,
        ar: `## الخلاصة

- الإطار السلكي مخطط بسيط للتخطيط — حلّ البنية رخيصاً أولاً
- منخفض الدقة (خام، سريع) ← عالي الدقة (مفصّل، لاحقاً)
- هندسة المعلومات تنظّم المحتوى ليجد المستخدمون الأشياء
- البنية قبل الأسلوب توفّر الوقت وتصنع تصاميم أفضل

**التالي:** النماذج الأولية — جعل إطاراتك قابلة للنقر لاختبار التفاعلات الحقيقية.`,
      },
    },
  ],
};
