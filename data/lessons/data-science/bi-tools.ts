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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- BI reports the present clearly via dashboards; data science predicts the future
- Tableau and Power BI are the code-light industry tools
- Good dashboards answer a question and highlight what matters
- BI Analyst is one of the fastest data roles to break into

**Next:** Portfolio & Kaggle — proving your skills and getting hired.`,
        ar: `## الخلاصة

- BI يقرّر الحاضر بوضوح عبر اللوحات؛ وعلم البيانات يتنبأ بالمستقبل
- Tableau وPower BI أداتا الصناعة قليلتا الكود
- اللوحات الجيدة تجيب على سؤال وتُبرز ما يهم
- محلل BI من أسرع أدوار البيانات للدخول فيها

**التالي:** المعرض وKaggle — إثبات مهاراتك والحصول على وظيفة.`,
      },
    },
  ],
};
