import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "bi-tools",
  title: { en: "Business Intelligence — Dashboards That Decide", ar: "ذكاء الأعمال — لوحات تصنع القرار" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What **BI** is and how it differs from data science
- **Tableau** and **Power BI** — the industry tools
- What makes a dashboard actually useful
- The fastest data career to get hired in`,
        ar: `## ماذا ستتعلم

- ما هو **ذكاء الأعمال (BI)** وكيف يختلف عن علم البيانات
- **Tableau** و**Power BI** — أدوات الصناعة
- ما الذي يجعل اللوحة مفيدة فعلاً
- أسرع مسار بيانات للتوظيف فيه`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The dashboard in the manager's office 📊

Not every data job requires Python and machine learning. **Business Intelligence (BI)** is about answering "**what is happening in the business right now?**" and putting it in front of decision-makers as clear, interactive **dashboards**.

**Data science vs BI:**
- **Data science** leans forward: *predict* the future, build models, use code. "Which customers *will* churn?"
- **BI** looks at the present/past: *report* what's happening, clearly and reliably. "How many customers churned *last month*, by region?"

Both are valuable; BI is often the **easier and faster entry point** into data careers because the main tools are visual, not code-heavy.

**The two dominant tools:**
- **Tableau** — powerful, beautiful drag-and-drop visualization. Loved by analysts.
- **Power BI** — Microsoft's tool, tightly integrated with Excel and the Office world; huge in companies.

Both let you connect to data, drag fields onto a canvas, and build interactive dashboards *without writing code* — filters, charts, KPIs, all clickable.

**What makes a dashboard actually good** (this separates pros from beginners):
- **Answers a specific question** the viewer has — not "here's all our data."
- **Highlights what matters** (a big KPI number, a red alert) instead of drowning them in charts.
- **Is honest and clear** — the visualization rules from the charts lesson apply.
- **Updates automatically** from live data.

**Career tip:** "Data Analyst / BI Analyst" is one of the quickest data roles to land. Learn SQL (you have!) + one BI tool + solid chart sense, build 2–3 dashboards for real or sample datasets, and you have a portfolio. Many people start in BI and grow into data science.`,
        ar: `## اللوحة في مكتب المدير 📊

ليست كل وظيفة بيانات تتطلب بايثون وتعلّم الآلة. **ذكاء الأعمال (BI)** عن الإجابة على "**ماذا يحدث في العمل الآن؟**" ووضعه أمام صنّاع القرار كـ**لوحات** واضحة تفاعلية.

**علم البيانات مقابل BI:**
- **علم البيانات** يتطلّع أماماً: *يتنبأ* بالمستقبل، يبني نماذج، يستخدم كوداً. "أي العملاء *سيغادرون*؟"
- **BI** ينظر للحاضر/الماضي: *يقرّر* ما يحدث، بوضوح وموثوقية. "كم عميلاً غادر *الشهر الماضي*، حسب المنطقة؟"

كلاهما قيّم؛ وBI غالباً **المدخل الأسهل والأسرع** لمهن البيانات لأن أدواته الرئيسية بصرية لا كثيفة الكود.

**الأداتان المهيمنتان:**
- **Tableau** — تصوير قوي وجميل بالسحب والإفلات. محبوب لدى المحلّلين.
- **Power BI** — أداة مايكروسوفت، مندمجة بإحكام مع Excel وعالم Office؛ ضخمة في الشركات.

كلاهما يتيح الاتصال بالبيانات، وسحب الحقول على لوحة، وبناء لوحات تفاعلية *دون كتابة كود* — مرشحات، رسوم، مؤشرات أداء، كلها قابلة للنقر.

**ما يجعل اللوحة جيدة فعلاً** (هذا يفصل المحترفين عن المبتدئين):
- **تجيب على سؤال محدد** لدى المشاهد — لا "إليك كل بياناتنا".
- **تُبرز ما يهم** (رقم مؤشر كبير، تنبيه أحمر) بدل إغراقه بالرسوم.
- **صادقة وواضحة** — قواعد التصوير من درس الرسوم تنطبق.
- **تتحدّث تلقائياً** من بيانات حيّة.

**نصيحة مهنية:** "محلل بيانات / محلل BI" من أسرع أدوار البيانات للحصول عليها. تعلّم SQL (لديك!) + أداة BI واحدة + حسّ رسوم جيد، ابنِ 2–3 لوحات لبيانات حقيقية أو تجريبية، فيكون لديك معرض. كثيرون يبدؤون في BI وينمون إلى علم البيانات.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## KPIs: the numbers that run the meeting 🎯

Open any real dashboard and the first thing you see is a handful of big numbers at the top — **KPIs (Key Performance Indicators)**. A KPI is a single, carefully chosen metric that tells you if the business is winning or losing on something that matters, at a glance.

**A good KPI has three properties:**
- **Tied to a goal** — "monthly active users" matters if growth is the goal; "page views" often doesn't.
- **Comparable over time** — a number alone means little. "1,200 signups" — is that good? "1,200 signups, up 15% from last month" tells a story.
- **Actionable** — if it moves, someone should know what to *do* about it. A metric nobody can act on is trivia, not a KPI.

**Common KPI families you'll see across industries:**
- **Growth:** new customers, revenue, active users.
- **Retention:** churn rate (% of customers who leave), repeat-purchase rate.
- **Efficiency:** cost per acquisition, conversion rate (visitors → buyers).

**The beginner mistake:** cramming a dashboard with 20 KPIs. A manager glancing between meetings can hold 3–5 numbers in their head. Pick the vital few, and let users drill into detail (a second tab, a filter) only if they want more. The best BI analysts are ruthless editors, not just chart-builders — the skill is choosing *which* numbers deserve the spotlight.`,
        ar: `## مؤشرات الأداء: الأرقام التي تُدير الاجتماع 🎯

افتح أي لوحة حقيقية وأول ما تراه حفنة أرقام كبيرة في الأعلى — **مؤشرات الأداء الرئيسية (KPIs)**. مؤشر الأداء رقم واحد مُختار بعناية يخبرك إن كان العمل يربح أو يخسر في شيء مهم، بنظرة واحدة.

**لمؤشر الأداء الجيد ثلاث خصائص:**
- **مرتبط بهدف** — "المستخدمون النشطون شهرياً" يهم إن كان النمو الهدف؛ "مشاهدات الصفحة" غالباً لا يهم.
- **قابل للمقارنة عبر الزمن** — رقم وحده يعني القليل. "1,200 تسجيل" — أهذا جيد؟ "1,200 تسجيل، بزيادة 15% عن الشهر الماضي" يروي قصة.
- **قابل للتصرف** — إن تحرّك، يجب أن يعرف أحد ما *يفعله* حياله. مقياس لا يمكن لأحد التصرف بناءً عليه معلومة عابرة، لا مؤشر أداء.

**عائلات مؤشرات أداء شائعة عبر الصناعات:**
- **النمو:** عملاء جدد، إيراد، مستخدمون نشطون.
- **الاحتفاظ:** معدّل التسرّب (% العملاء الذين يغادرون)، معدّل الشراء المتكرر.
- **الكفاءة:** تكلفة اكتساب العميل، معدّل التحويل (زوار ← مشترون).

**خطأ المبتدئين:** حشو اللوحة بعشرين مؤشر أداء. المدير الذي يُلقي نظرة بين اجتماعين يستطيع تذكّر 3–5 أرقام. اختر القليل الحيوي، ودع المستخدمين يتعمّقون في التفاصيل (تبويب ثانٍ، مرشّح) فقط إن أرادوا المزيد. أفضل محلّلي BI محرّرون لا يرحمون، لا مجرّد بُناة رسوم — المهارة هي اختيار *أي* الأرقام تستحق دائرة الضوء.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Checklist: is this dashboard any good? ✅

Before shipping a dashboard, run it through this checklist — the same one professional BI analysts use in review:

1. **Does it answer a specific question in under 5 seconds?** If a viewer has to hunt, it's failed.
2. **Is there one clear "headline" number or chart?** Not 15 equally-loud widgets.
3. **Do the charts follow the honest rules from the visualization lesson?** Axes start at zero, labels are clear, no cherry-picked date ranges.
4. **Is it filtered to the audience?** A regional manager needs their region, not all 30 at once.
5. **Does it update automatically?** A dashboard fed by a manual copy-paste from last Tuesday is already a liability.
6. **Would a new hire understand it with zero explanation?** If it needs a legend of acronyms, simplify.

Run through this list on any dashboard you build — for a class project, a Kaggle notebook, or your first real job — and you'll already be ahead of most beginners who just "add more charts."`,
        ar: `## قائمة تحقّق: هل هذه اللوحة جيدة فعلاً؟ ✅

قبل نشر لوحة، مرّرها على قائمة التحقق هذه — نفسها التي يستخدمها محلّلو BI المحترفون في المراجعة:

1. **هل تجيب على سؤال محدد خلال أقل من 5 ثوانٍ؟** إن اضطر المشاهد للبحث، فقد فشلت.
2. **هل يوجد رقم أو رسم "رئيسي" واضح واحد؟** لا 15 عنصراً بنفس الصخب.
3. **هل تتبع الرسوم قواعد الصدق من درس التصوير؟** المحاور تبدأ من صفر، التسميات واضحة، لا انتقاء مدى تاريخي مجامل.
4. **هل هي مرشّحة حسب الجمهور؟** مدير إقليمي يحتاج منطقته، لا الثلاثين كلها دفعة واحدة.
5. **هل تتحدّث تلقائياً؟** لوحة تُغذّى بنسخ-لصق يدوي من الثلاثاء الماضي عبء بالفعل.
6. **هل يفهمها موظف جديد بلا أي شرح؟** إن احتاجت قائمة اختصارات، بسّطها.

مرّر أي لوحة تبنيها — لمشروع دراسي، دفتر Kaggle، أو أول وظيفة حقيقية — على هذه القائمة، وستكون متقدّماً بالفعل على أغلب المبتدئين الذين "يضيفون رسوماً أكثر" فقط.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Florence Nightingale's rose diagram 🔍

Long before "data visualization" was a job title, **Florence Nightingale** — famous as a nurse during the Crimean War (1850s) — used a chart to save lives. She noticed that far more soldiers were dying from preventable diseases (poor sanitation, infection) in army hospitals than from battle wounds. Officials in London weren't listening to reports full of numbers.

So she designed what's now called the **"rose diagram"** (a polar area chart): a striking, wedge-shaped chart where the size of each colored wedge showed deaths by cause, month by month. The visual made one thing undeniable at a glance — the blue wedges (preventable disease deaths) dwarfed the red ones (battle deaths). No table of numbers had managed to make that case; the picture did it instantly.

The chart helped drive real sanitary reforms in military hospitals, and Nightingale became one of the first people in history to use a data visualization deliberately as a tool of persuasion, not just record-keeping. It's a direct ancestor of every dashboard KPI card you'll ever build: **the goal was never "here's the data," it was "here's what you must do about it."**`,
        ar: `## دراسة حالة واقعية: مخطط الوردة لفلورنس نايتنجيل 🔍

قبل أن يصبح "التصوير المرئي للبيانات" مسمّى وظيفياً بزمن طويل، استخدمت **فلورنس نايتنجيل** — الشهيرة كممرضة خلال حرب القرم (خمسينيات القرن التاسع عشر) — رسماً لإنقاذ أرواح. لاحظت أن جنوداً أكثر بكثير كانوا يموتون من أمراض يمكن الوقاية منها (سوء الصرف الصحي، العدوى) في مستشفيات الجيش مقارنة بجروح المعارك. المسؤولون في لندن لم يكونوا يصغون لتقارير مليئة بالأرقام.

فصمّمت ما يُعرف الآن بـ**"مخطط الوردة"** (رسم مساحة قطبية): رسم لافت على شكل شرائح، حيث حجم كل شريحة ملوّنة يُظهر الوفيات حسب السبب، شهراً بشهر. الرسم جعل شيئاً واحداً لا يُنكر بنظرة واحدة — الشرائح الزرقاء (وفيات الأمراض القابلة للوقاية) كانت أضخم بكثير من الحمراء (وفيات المعارك). لا جدول أرقام استطاع إثبات ذلك، لكن الصورة فعلتها فوراً.

ساعد الرسم في دفع إصلاحات صحية حقيقية في مستشفيات الجيش، وأصبحت نايتنجيل من أوائل من استخدموا التصوير المرئي للبيانات عمداً كأداة إقناع، لا مجرد توثيق. إنه سلف مباشر لكل بطاقة مؤشر أداء ستبنيها يوماً: **الهدف لم يكن أبداً "إليك البيانات"، بل "إليك ما يجب أن تفعله حيالها."**`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "How does BI differ from data science?", ar: "كيف يختلف BI عن علم البيانات؟" },
          choices: [
            { en: "BI reports what's happening now; data science predicts the future", ar: "BI يقرّر ما يحدث الآن؛ وعلم البيانات يتنبأ بالمستقبل" },
            { en: "They are identical", ar: "متطابقان" },
            { en: "BI requires more coding", ar: "BI يتطلب كوداً أكثر" },
          ],
          answer: 0,
          explain: {
            en: "BI = clear reporting of the present/past via dashboards. Data science = prediction and modeling with code.",
            ar: "BI = تقرير واضح للحاضر/الماضي عبر لوحات. علم البيانات = تنبؤ ونمذجة بالكود.",
          },
        },
        {
          q: { en: "Name a dominant BI tool.", ar: "اذكر أداة BI مهيمنة." },
          choices: [
            { en: "Tableau or Power BI", ar: "Tableau أو Power BI" },
            { en: "Photoshop", ar: "Photoshop" },
            { en: "Microsoft Word", ar: "Microsoft Word" },
          ],
          answer: 0,
          explain: {
            en: "Tableau and Power BI are the two industry standards — visual, drag-and-drop, largely code-free.",
            ar: "Tableau وPower BI معياران في الصناعة — بصريان، سحب وإفلات، وبلا كود إلى حد كبير.",
          },
        },
        {
          q: { en: "What makes a dashboard genuinely good?", ar: "ما الذي يجعل اللوحة جيدة حقاً؟" },
          choices: [
            { en: "It answers a specific question and highlights what matters", ar: "تجيب على سؤال محدد وتُبرز ما يهم" },
            { en: "It shows every chart possible", ar: "تعرض كل رسم ممكن" },
            { en: "It uses the most colors", ar: "تستخدم أكثر الألوان" },
          ],
          answer: 0,
          explain: {
            en: "Focus beats clutter: answer the viewer's real question and surface the key number. Don't dump all the data.",
            ar: "التركيز يتفوّق على الازدحام: أجب على سؤال المشاهد الحقيقي وأبرز الرقم المفتاح. لا تُفرغ كل البيانات.",
          },
        },
        {
          q: { en: "Which of these is the best KPI?", ar: "أي من هذه أفضل مؤشر أداء؟" },
          choices: [
            { en: "Monthly churn rate, tracked over time, tied to a retention goal", ar: "معدّل التسرّب الشهري، متتبَّع عبر الزمن، مرتبط بهدف احتفاظ" },
            { en: "Total page views ever, with no comparison point", ar: "إجمالي مشاهدات الصفحة على الإطلاق، بلا نقطة مقارنة" },
            { en: "The number of colors used in the dashboard", ar: "عدد الألوان المستخدمة في اللوحة" },
          ],
          answer: 0,
          explain: {
            en: "A good KPI is tied to a goal, comparable over time, and actionable. A raw all-time total with no comparison tells no story.",
            ar: "مؤشر الأداء الجيد مرتبط بهدف، وقابل للمقارنة عبر الزمن، وقابل للتصرف. إجمالي خام بلا مقارنة لا يروي قصة.",
          },
        },
        {
          q: { en: "Why is Florence Nightingale's rose diagram famous?", ar: "لماذا مخطط الوردة لفلورنس نايتنجيل مشهور؟" },
          choices: [
            { en: "It used a visual to prove preventable disease killed more soldiers than battle, driving real reform", ar: "استخدم رسماً لإثبات أن الأمراض القابلة للوقاية قتلت جنوداً أكثر من المعارك، مما دفع إصلاحاً حقيقياً" },
            { en: "It was the first pie chart ever drawn", ar: "كان أول رسم دائري يُرسم على الإطلاق" },
            { en: "It proved correlation equals causation", ar: "أثبت أن الارتباط يساوي السببية" },
          ],
          answer: 0,
          explain: {
            en: "Her wedge chart made an undeniable visual case that tables of numbers had failed to make, leading to sanitary reforms.",
            ar: "رسمها بالشرائح صنع حجة بصرية لا تُنكر فشلت جداول الأرقام في صنعها، مما أدى لإصلاحات صحية.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- BI reports the present clearly via dashboards; data science predicts the future
- Tableau and Power BI are the code-light industry tools
- Good dashboards answer a question and highlight what matters
- KPIs should be tied to a goal, comparable over time, and actionable — pick a vital few
- Run every dashboard through the 6-point "is this any good?" checklist before shipping
- Florence Nightingale's rose diagram shows visualization has been driving real decisions for over 150 years
- BI Analyst is one of the fastest data roles to break into

**Next:** Portfolio & Kaggle — proving your skills and getting hired.`,
        ar: `## الخلاصة

- BI يقرّر الحاضر بوضوح عبر اللوحات؛ وعلم البيانات يتنبأ بالمستقبل
- Tableau وPower BI أداتا الصناعة قليلتا الكود
- اللوحات الجيدة تجيب على سؤال وتُبرز ما يهم
- مؤشرات الأداء يجب أن تكون مرتبطة بهدف، وقابلة للمقارنة عبر الزمن، وقابلة للتصرف — اختر القليل الحيوي
- مرّر كل لوحة على قائمة التحقق ذات الست نقاط قبل نشرها
- مخطط الوردة لفلورنس نايتنجيل يُظهر أن التصوير المرئي يدفع قرارات حقيقية منذ أكثر من 150 عاماً
- محلل BI من أسرع أدوار البيانات للدخول فيها

**التالي:** المعرض وKaggle — إثبات مهاراتك والحصول على وظيفة.`,
      },
    },
  ],
};
