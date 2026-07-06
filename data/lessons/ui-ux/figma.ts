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
      type: "text",
      body: {
        en: `## The layer panel and naming: the unglamorous skill 🗂️

Every Figma file has a **layers panel** — a tree of every frame, group, and shape in your design, top to bottom. Beginners ignore it and just click around the canvas; professionals live in it, because it's how you actually *think* about a design's structure, not just its pixels.

**Two habits separate a messy file from a professional one:**

- **Naming layers.** A shape called "Rectangle 47" tells you nothing a week later. The same shape named "card-background" or "primary-button" tells you (and any collaborator) exactly what it is at a glance. When a file has hundreds of layers, good names are the only thing that keeps it navigable — exactly like naming variables sensibly in code instead of leaving them as \`x1\`, \`x2\`, \`x3\`.
- **Grouping and frames as structure.** Related elements (an icon + its label, a card's title + description + button) should be grouped or wrapped in a frame together, mirroring how a developer nests \`<div>\`s. A flat pile of 200 ungrouped shapes is nearly impossible to edit later; a clean hierarchy of named groups is easy to update months on.

This is invisible in a screenshot — nobody sees your layer names in the final app — but it's exactly what a hiring manager or collaborator checks when they open your file. A beautifully designed screen built in one chaotic, unnamed layer soup signals an amateur; the same screen built with clean, named, grouped layers signals someone who can work on a real team. It costs a few extra seconds per layer and pays for itself the first time anyone (including future-you) needs to edit the file.`,
        ar: `## لوحة الطبقات والتسمية: المهارة غير البرّاقة 🗂️

كل ملف Figma فيه **لوحة طبقات** — شجرة لكل إطار ومجموعة وشكل في تصميمك، من الأعلى للأسفل. المبتدئون يتجاهلونها وينقرون في اللوحة فقط؛ المحترفون يعيشون فيها، لأنها كيف تفكّر فعلاً في بنية التصميم، لا بكسلاته فقط.

**عادتان تفصلان الملف الفوضوي عن المحترف:**

- **تسمية الطبقات.** شكل اسمه "Rectangle 47" لا يخبرك بشيء بعد أسبوع. نفس الشكل مسمّى "card-background" أو "primary-button" يخبرك (وأي متعاون) بالضبط ما هو بلمحة. حين يحتوي الملف مئات الطبقات، الأسماء الجيدة هي الشيء الوحيد الذي يُبقيه قابلاً للتصفّح — تماماً كتسمية المتغيرات بحكمة في الكود بدل تركها x1، x2، x3.
- **التجميع والإطارات كبنية.** العناصر المترابطة (أيقونة + تسميتها، عنوان بطاقة + وصفها + زرها) يجب تجميعها أو لفّها في إطار معاً، محاكيةً كيف يعشّش المطوّر \`<div>\`. كومة مسطحة من 200 شكل غير مجمّع يكاد يستحيل تعديلها لاحقاً؛ وتسلسل هرمي نظيف من مجموعات مسمّاة سهل التحديث بعد أشهر.

هذا غير مرئي في لقطة شاشة — لا أحد يرى أسماء طبقاتك في التطبيق النهائي — لكنه بالضبط ما يفحصه مدير التوظيف أو المتعاون عند فتح ملفك. شاشة مصمّمة بجمال لكن ببناء فوضوي من طبقات بلا أسماء تدل على هاوٍ؛ ونفس الشاشة ببناء نظيف مسمّى مجمّع تدل على شخص يستطيع العمل ضمن فريق حقيقي. يكلّف ثوانٍ إضافية قليلة لكل طبقة ويُسدَّد بمجرد أن يحتاج أي أحد (بما فيه أنت مستقبلاً) تعديل الملف.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Try it yourself: your first 30 minutes in Figma 🚀

Right now, before moving on, open Figma (free, no install — figma.com) and do this small, concrete exercise:

1. **Create a new file** and one Frame sized like a phone screen (Figma has phone-size presets).
2. **Draw a rectangle** for a button, add text on top saying "Sign Up," and give the rectangle a fill color and a corner radius.
3. **Rename both layers** properly — not "Rectangle 1" and "Text 1," but "button-bg" and "button-label."
4. **Turn it into a component** (right-click → "Create component"), then drag 2 more copies onto the canvas. Change the color of the original component — watch all 3 copies update instantly.
5. **Apply Auto Layout** to the button (select it, press Shift+A) and try changing the text — watch the button resize itself to fit.

This one small exercise touches frames, layers, naming, components, and auto-layout — every core concept from this lesson — in about 30 minutes, hands-on. That's worth more than an hour of reading about it.`,
        ar: `## جرّب بنفسك: أول 30 دقيقة في Figma 🚀

الآن، قبل المتابعة، افتح Figma (مجاني، بلا تثبيت — figma.com) وافعل هذا التمرين الصغير الملموس:

1. **أنشئ ملفاً جديداً** وإطاراً واحداً بحجم شاشة هاتف (Figma فيه أحجام هاتف جاهزة).
2. **ارسم مستطيلاً** لزر، أضف نصاً فوقه يقول "اشترك،" وأعطِ المستطيل لون تعبئة ونصف قطر زوايا.
3. **أعد تسمية الطبقتين** بشكل صحيح — لا "Rectangle 1" و"Text 1،" بل "button-bg" و"button-label."
4. **حوّله لمكوّن** (انقر بزر الفأرة الأيمن ← "Create component")، ثم اسحب نسختين إضافيتين للوحة. غيّر لون المكوّن الأصلي — راقب النسخ الثلاث تتحدث فوراً.
5. **طبّق Auto Layout** على الزر (اخترْه، اضغط Shift+A) وجرّب تغيير النص — راقب الزر يعيد تحجيم نفسه ليناسبه.

هذا التمرين الصغير يلمس الإطارات، والطبقات، والتسمية، والمكوّنات، وAuto Layout — كل مفهوم أساسي من هذا الدرس — في حوالي 30 دقيقة عملياً. يستحق أكثر من ساعة قراءة عنه.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Figma's live-collaboration bet 🔍

Before Figma, the dominant design tools (like Sketch) were desktop-only applications with files saved locally — designing together meant emailing files back and forth or manually merging versions, the same painful workflow developers had before real-time collaborative tools existed. Figma's founders made a contrarian bet: build a full professional design tool that runs *entirely in the browser*, with multiple people editing the same file live, like Google Docs.

Many in the industry doubted a browser could ever match desktop software's performance for serious design work. Figma proved it could, and the live-collaboration feature turned out to be the deciding factor for its adoption — teams that tried it once rarely wanted to go back to emailing design files. Remote and distributed teams in particular found they could run a design review with everyone watching (and even editing) the same file simultaneously, cursors visible, comments in context.

The lesson generalizes well beyond design tools: removing the friction of "whose version is the real one?" often matters more to adoption than any single feature. Figma didn't win by having more shapes or filters than competitors — it won by making design a shared, live activity instead of a solitary, file-passing one.`,
        ar: `## دراسة حالة واقعية: رهان Figma على التعاون المباشر 🔍

قبل Figma، كانت أدوات التصميم المهيمنة (مثل Sketch) تطبيقات سطح مكتب فقط بملفات محفوظة محلياً — والتصميم معاً يعني تبادل الملفات بالبريد أو دمج النسخ يدوياً، نفس سير العمل المؤلم الذي عاشه المطوّرون قبل وجود أدوات تعاون فورية حقيقية. راهن مؤسسو Figma رهاناً مخالفاً للسائد: بناء أداة تصميم احترافية كاملة تعمل *بالكامل في المتصفح*، بعدة أشخاص يحرّرون نفس الملف مباشرة، كـ Google Docs.

شكّك كثيرون في الصناعة أن يضاهي متصفح أداء برامج سطح المكتب لعمل تصميم جاد. أثبتت Figma أنها تستطيع، وتبيّن أن ميزة التعاون المباشر هي العامل الحاسم في تبنّيها — الفرق التي جرّبتها مرة نادراً ما أرادت العودة لتبادل ملفات التصميم بالبريد. الفرق البعيدة والموزّعة بالذات وجدت أنها تستطيع إجراء مراجعة تصميم بالجميع يشاهد (وحتى يحرّر) نفس الملف في آن واحد، مؤشرات مرئية، وتعليقات في سياقها.

الدرس يتعمّم أبعد من أدوات التصميم: إزالة احتكاك "أي نسخة هي الحقيقية؟" غالباً أهم للتبنّي من أي ميزة منفردة. لم تفز Figma بأشكال أو فلاتر أكثر من المنافسين — فازت بجعل التصميم نشاطاً مشتركاً مباشراً بدل نشاط منفرد بتبادل ملفات.`,
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
        {
          q: { en: "Why does naming layers well ('button-bg') matter instead of leaving defaults ('Rectangle 47')?", ar: "لماذا تهم تسمية الطبقات جيداً ('button-bg') بدل ترك الافتراضي ('Rectangle 47')؟" },
          choices: [
            { en: "It keeps large files navigable and understandable for you and collaborators later", ar: "تُبقي الملفات الكبيرة قابلة للتصفّح والفهم لك وللمتعاونين لاحقاً" },
            { en: "Figma requires unique names to save the file", ar: "Figma يتطلّب أسماء فريدة لحفظ الملف" },
            { en: "It changes how the design looks visually", ar: "يغيّر شكل التصميم بصرياً" },
          ],
          answer: 0,
          explain: {
            en: "Like naming variables sensibly in code, clear layer names are invisible in the final product but essential for maintainability.",
            ar: "كتسمية المتغيرات بحكمة في الكود، أسماء الطبقات الواضحة غير مرئية في المنتج النهائي لكنها أساسية لقابلية الصيانة.",
          },
        },
        {
          q: { en: "What was the key factor behind Figma's adoption over older desktop design tools?", ar: "ما العامل الأساسي وراء تبنّي Figma بدل أدوات تصميم سطح المكتب القديمة؟" },
          choices: [
            { en: "Real-time browser-based collaboration removed the pain of emailing files back and forth", ar: "التعاون الفوري في المتصفح أزال ألم تبادل الملفات بالبريد" },
            { en: "It had more filters and shapes than any competitor", ar: "كان لديه فلاتر وأشكال أكثر من أي منافس" },
            { en: "It was the first design tool ever created", ar: "كان أول أداة تصميم أُنشئت على الإطلاق" },
          ],
          answer: 0,
          explain: {
            en: "Figma won by making design a shared, live activity — the same shift real-time docs brought to writing.",
            ar: "فازت Figma بجعل التصميم نشاطاً مشتركاً مباشراً — نفس التحوّل الذي أحدثته المستندات الفورية في الكتابة.",
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
- Naming and grouping layers is what separates a maintainable file from a messy one
- Figma's live collaboration — not more features — is what won over desktop-only tools
- Learning frontend + Figma makes you rare and employable

**Next:** User Research — making sure you design the right thing, not just a pretty thing.`,
        ar: `## الخلاصة

- Figma أداة التصميم المجانية التعاونية معيار الصناعة في المتصفح
- الإطارات = شاشات؛ المكوّنات = عناصر معاد استخدامها؛ التخطيط التلقائي = شبيه flexbox
- يشغّل تسليم التصميم للتطوير بمواصفات دقيقة وCSS
- تسمية وتجميع الطبقات هو ما يفصل ملفاً قابلاً للصيانة عن آخر فوضوي
- تعاون Figma المباشر — لا ميزات أكثر — هو ما فاز به على أدوات سطح المكتب فقط
- تعلّم الواجهات + Figma يجعلك نادراً وقابلاً للتوظيف

**التالي:** بحث المستخدم — التأكد من تصميم الشيء الصحيح، لا مجرد شيء جميل.`,
      },
    },
  ],
};
