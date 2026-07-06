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
      type: "text",
      body: {
        en: `## Sitemaps and user flows: zooming out and zooming in 🗺️

Wireframes show *one screen's* layout. Two companion tools show the bigger picture around it — one from above, one from the side:

- **Sitemap.** A tree diagram of every page/screen in the product and how they nest — Home branches to Products, About, Contact; Products branches to Category, Product Detail. It's the literal map of Information Architecture (from earlier in this lesson) drawn as boxes and lines, usually made *before* any wireframe, so you agree on what pages exist and how they're organized before drawing a single one of them.
- **User flow.** A diagram of the *path* one specific user takes through several screens to complete one task — "Browse products → Add to cart → Log in → Enter address → Pay → Confirmation." Where a sitemap shows *everything that exists*, a user flow shows *one journey through it*, including decision points ("already have an account? yes/no") and dead ends to avoid.

Together with a wireframe, these three tools cover three different zoom levels of the exact same structure-before-style principle: the sitemap is the whole map, the user flow is one route drawn on that map, and the wireframe is what one single stop on that route actually looks like. Skipping the map-level tools and jumping straight to wireframing individual screens is how products end up with duplicate pages, orphaned screens nobody can navigate to, or a checkout flow that quietly forgets a required step.`,
        ar: `## خرائط الموقع وتدفقات المستخدم: تكبير وتصغير 🗺️

الإطار السلكي يُظهر تخطيط *شاشة واحدة*. أداتان مرافقتان تُظهران الصورة الأكبر حولها — واحدة من فوق، وواحدة من الجانب:

- **خريطة الموقع (Sitemap).** مخطط شجري لكل صفحة/شاشة في المنتج وكيف تتفرّع — الرئيسية تتفرّع للمنتجات، من نحن، تواصل؛ والمنتجات تتفرّع للفئة، تفاصيل المنتج. إنها الخريطة الحرفية لهندسة المعلومات (من سابقاً في هذا الدرس) مرسومة كصناديق وخطوط، عادة تُصنع *قبل* أي إطار سلكي، فتتفق على أي صفحات موجودة وكيف تُنظَّم قبل رسم واحدة منها.
- **تدفق المستخدم (User flow).** مخطط لـ*المسار* الذي يسلكه مستخدم محدد واحد عبر عدة شاشات لإتمام مهمة واحدة — "تصفّح المنتجات ← أضف للسلة ← سجّل دخول ← أدخل العنوان ← ادفع ← تأكيد." حيث تُظهر خريطة الموقع *كل ما هو موجود*، يُظهر تدفق المستخدم *رحلة واحدة عبره*، شاملة نقاط القرار ("لديك حساب مسبقاً؟ نعم/لا") والمآزق الواجب تجنّبها.

مع الإطار السلكي، تغطّي هذه الأدوات الثلاث ثلاثة مستويات تكبير مختلفة لنفس مبدأ البنية-قبل-الأسلوب بالضبط: خريطة الموقع هي الخريطة كاملة، وتدفق المستخدم مسار واحد مرسوم على تلك الخريطة، والإطار السلكي هو كيف تبدو فعلاً محطة واحدة على ذلك المسار. تخطّي أدوات مستوى الخريطة والقفز مباشرة لتصميم شاشات فردية هو كيف تنتهي المنتجات بصفحات مكرّرة، أو شاشات يتيمة لا يستطيع أحد الوصول إليها، أو تدفق دفع ينسى بصمت خطوة مطلوبة.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Try it yourself: sketch a sitemap in 10 minutes 🖍️

Pick an app or site you use often (or one you're designing) and, on paper or in any notes app:

1. Write "Home" in a box at the top.
2. Draw 4–6 boxes below it for the main sections a first-time user would expect (e.g. for a store: Products, Cart, Account, About, Contact).
3. For one of those (say, Products), draw 2–3 boxes below *it* for what's nested inside (Category page, Product detail page, Search results).
4. Now draw one user flow on top of it with arrows: pick one task ("buy a specific item") and trace the exact path of boxes and clicks from Home to a confirmation screen.

If you get stuck figuring out where something belongs, or find you need a page you hadn't listed, that's the exercise working exactly as intended — catching structural gaps on paper, for free, instead of after screens are built.`,
        ar: `## جرّب بنفسك: ارسم خريطة موقع في 10 دقائق 🖍️

اختر تطبيقاً أو موقعاً تستخدمه كثيراً (أو واحداً تصمّمه)، وعلى ورق أو أي تطبيق ملاحظات:

1. اكتب "الرئيسية" في صندوق بالأعلى.
2. ارسم 4-6 صناديق أسفله للأقسام الرئيسية التي يتوقّعها مستخدم لأول مرة (مثلاً لمتجر: المنتجات، السلة، الحساب، من نحن، تواصل).
3. لأحدها (لنقل المنتجات)، ارسم 2-3 صناديق أسفلها لما يتداخل بداخلها (صفحة فئة، صفحة تفاصيل منتج، نتائج بحث).
4. الآن ارسم تدفق مستخدم واحد فوقها بأسهم: اختر مهمة واحدة ("شراء عنصر محدد") وتتبّع المسار بالضبط من صناديق ونقرات من الرئيسية إلى شاشة تأكيد.

إن علقت في تحديد أين ينتمي شيء ما، أو وجدت أنك تحتاج صفحة لم تذكرها، فهذا هو التمرين يعمل بالضبط كما هو مقصود — يكتشف الفجوات البنيوية على الورق، مجاناً، بدل بعد بناء الشاشات.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Craigslist's ugly, unbeatable IA 🔍

Craigslist looks, by modern design standards, almost deliberately unstyled — plain blue links, minimal color, a layout that has barely changed in decades. Design critics have poked fun at it for years. And yet it has remained one of the most-used classifieds sites in the world, largely because its **Information Architecture** is so clear: categories are grouped exactly the way users think about them (Housing, Jobs, For Sale, Services), nested sensibly, and every page loads a list of plain text links straight to what you're looking for, with almost no visual noise competing for attention.

It's a useful, slightly humbling case study precisely because it inverts the usual story: Craigslist has close to zero high-fidelity visual polish, yet its wireframe-level bones — the structure, the IA, the findability — are so solid that the site keeps functioning extremely well for its purpose. It's living proof of the principle from this lesson taken to an extreme: **structure and IA matter more than visual polish.** A gorgeous interface with confusing navigation will frustrate users every single day; a plain interface with excellent structure will quietly keep working for them, year after year.

This doesn't mean visual design doesn't matter — it means get the structure right *first*, because it's the layer that determines whether people can actually use your product at all, no matter how it looks on top.`,
        ar: `## دراسة حالة واقعية: هندسة معلومات Craigslist القبيحة التي لا تُقهَر 🔍

يبدو Craigslist، بمعايير التصميم الحديثة، غير مُصمَّم عمداً تقريباً — روابط زرقاء بسيطة، لون أدنى، تخطيط بالكاد تغيّر عبر عقود. سخر منه نقّاد التصميم لسنوات. ومع ذلك ظل من أكثر مواقع الإعلانات المبوّبة استخداماً في العالم، غالباً لأن **هندسة المعلومات** فيه واضحة جداً: الفئات مجمّعة بالضبط كما يفكّر المستخدمون فيها (سكن، وظائف، للبيع، خدمات)، متداخلة بمنطقية، وكل صفحة تحمّل قائمة روابط نصية بسيطة مباشرة لما تبحث عنه، بلا ضجيج بصري تقريباً ينافس على الانتباه.

إنها دراسة حالة مفيدة ومتواضعة قليلاً بالضبط لأنها تعكس القصة المعتادة: Craigslist ليس فيه صقل بصري عالي الدقة تقريباً، ومع ذلك عظامه على مستوى الإطار السلكي — البنية، وIA، وسهولة الإيجاد — متينة جداً لدرجة أن الموقع يستمر بالعمل ممتازاً لغرضه. إنه دليل حي على مبدأ هذا الدرس مأخوذاً لأقصاه: **البنية وIA أهم من الصقل البصري.** واجهة رائعة بتنقّل محيّر ستُحبط المستخدمين كل يوم؛ وواجهة بسيطة ببنية ممتازة ستستمر بالعمل لهم بصمت، عاماً بعد عام.

هذا لا يعني أن التصميم البصري لا يهم — يعني أتقن البنية *أولاً*، لأنها الطبقة التي تحدد إن كان الناس يستطيعون استخدام منتجك أصلاً، بغض النظر عن مظهره فوقها.`,
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
        {
          q: { en: "What's the difference between a sitemap and a user flow?", ar: "ما الفرق بين خريطة الموقع وتدفق المستخدم؟" },
          choices: [
            { en: "A sitemap shows every page and how they nest; a user flow shows one path through them for one task", ar: "خريطة الموقع تُظهر كل صفحة وكيف تتفرّع؛ وتدفق المستخدم يُظهر مساراً واحداً عبرها لمهمة واحدة" },
            { en: "They are the exact same thing with different names", ar: "هما نفس الشيء بالضبط بأسماء مختلفة" },
            { en: "A sitemap is only for print, a user flow is only for apps", ar: "خريطة الموقع للطباعة فقط، وتدفق المستخدم للتطبيقات فقط" },
            { en: "None, one is for images", ar: "لا فرق، إحداهما للصور فقط" },
          ],
          answer: 0,
          explain: {
            en: "The sitemap is the whole map; the user flow is one traced route across it, including decision points and dead ends.",
            ar: "خريطة الموقع هي الخريطة كاملة؛ وتدفق المستخدم مسار واحد متتبَّع عبرها، شاملاً نقاط القرار والمآزق.",
          },
        },
        {
          q: { en: "What does the Craigslist case study illustrate?", ar: "ماذا توضّح دراسة حالة Craigslist؟" },
          choices: [
            { en: "Solid structure and IA can make a visually plain product succeed for decades", ar: "البنية وIA المتينتان تجعلان منتجاً بسيطاً بصرياً ينجح لعقود" },
            { en: "Visual polish always matters more than structure", ar: "الصقل البصري أهم من البنية دائماً" },
            { en: "Old websites always fail eventually", ar: "المواقع القديمة تفشل دائماً في النهاية" },
          ],
          answer: 0,
          explain: {
            en: "Craigslist has almost no visual polish, but its clear categories and findability keep it working extremely well — structure first.",
            ar: "Craigslist ليس فيه صقل بصري تقريباً، لكن فئاته الواضحة وسهولة إيجاده تُبقيانه يعمل ممتازاً — البنية أولاً.",
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
- Sitemaps map the whole product; user flows trace one task's path through it
- Craigslist shows structure/IA can outlast and outperform visual polish
- Structure before style saves time and makes better designs

**Next:** Prototyping — making your wireframes clickable to test real interactions.`,
        ar: `## الخلاصة

- الإطار السلكي مخطط بسيط للتخطيط — حلّ البنية رخيصاً أولاً
- منخفض الدقة (خام، سريع) ← عالي الدقة (مفصّل، لاحقاً)
- هندسة المعلومات تنظّم المحتوى ليجد المستخدمون الأشياء
- خرائط الموقع ترسم المنتج كله؛ وتدفقات المستخدم تتتبّع مسار مهمة واحدة عبره
- Craigslist يُظهر أن البنية/IA يمكن أن تتفوّق على الصقل البصري وتدوم أطول منه
- البنية قبل الأسلوب توفّر الوقت وتصنع تصاميم أفضل

**التالي:** النماذج الأولية — جعل إطاراتك قابلة للنقر لاختبار التفاعلات الحقيقية.`,
      },
    },
  ],
};
