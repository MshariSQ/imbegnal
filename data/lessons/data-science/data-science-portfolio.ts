import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "data-science-portfolio",
  title: { en: "Portfolio & Kaggle — Get Hired", ar: "المعرض وKaggle — احصل على وظيفة" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why a portfolio beats a certificate
- What projects to build (and what to avoid)
- What **Kaggle** is and how to use it
- Your concrete plan to becoming hireable`,
        ar: `## ماذا ستتعلم

- لماذا يتفوّق المعرض على الشهادة
- أي مشاريع تبني (وما تتجنّب)
- ما هو **Kaggle** وكيف تستخدمه
- خطتك الملموسة لتصبح قابلاً للتوظيف`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Show, don't tell 💼

In data science, a **portfolio of real projects** beats any certificate. Employers don't want to hear you *can* analyze data — they want to *see* it. A portfolio is your proof.

**What makes a project worth showing:**
- **Asks a real question** — "Do Riyadh house prices depend more on size or location?" not "here's a dataset."
- **Shows the whole workflow** — get data → clean it → explore/visualize → model (if relevant) → **state a clear conclusion**. The conclusion is what matters most.
- **Is readable** — a clean notebook (Jupyter) with explanations, not just code. Tell the story.
- **Lives on GitHub** — public, so anyone can see it. (You learned Git for exactly this.)

**Avoid:** the overused Titanic/Iris datasets as your *only* projects (every beginner has them), and projects with no conclusion ("I made some charts"). Pick a dataset *you* find interesting — sports, games, your city, your hobby. Genuine curiosity shows.

**Kaggle** is your playground and proving ground:
- A huge library of **free datasets** on every topic imaginable.
- **Competitions** — real prediction problems (sometimes with prize money) where you rank against others. Great for learning and resume signal.
- **Notebooks** — public analyses you can read to learn how experts think, and publish your own.
- A built-in **community** and free compute (GPUs).

**Your concrete plan:**
1. Solidify the fundamentals from this track (stats, pandas, SQL, viz, a bit of ML).
2. Build **3 portfolio projects** answering real questions, each on GitHub with a clear writeup.
3. Do a couple of **Kaggle** notebooks/competitions to practice and show initiative.
4. Combine with the job-hunting and freelance skills from the Frontend track's "Getting Paid" lesson.

Data skills are among the most in-demand and well-paid on earth. A focused portfolio is how you turn learning into an offer.`,
        ar: `## أرِ، لا تقُل 💼

في علم البيانات، **معرض مشاريع حقيقية** يتفوّق على أي شهادة. أصحاب العمل لا يريدون سماع أنك *تستطيع* تحليل البيانات — يريدون *رؤية* ذلك. المعرض دليلك.

**ما يجعل المشروع جديراً بالعرض:**
- **يطرح سؤالاً حقيقياً** — "هل تعتمد أسعار منازل الرياض على المساحة أكثر أم الموقع؟" لا "إليك مجموعة بيانات".
- **يُظهر سير العمل كاملاً** — احصل على البيانات ← نظّفها ← استكشف/صوّر ← نمذج (إن لزم) ← **اذكر استنتاجاً واضحاً**. الاستنتاج هو الأهم.
- **مقروء** — دفتر (Jupyter) نظيف بشروح، لا كود فقط. احكِ القصة.
- **يعيش على GitHub** — عام، ليراه أي أحد. (تعلّمت Git لهذا بالضبط.)

**تجنّب:** مجموعات Titanic/Iris المستهلكة كمشاريعك *الوحيدة* (كل مبتدئ لديه إياها)، والمشاريع بلا استنتاج ("صنعت بعض الرسوم"). اختر مجموعة بيانات *أنت* تجدها ممتعة — رياضة، ألعاب، مدينتك، هوايتك. الفضول الحقيقي يظهر.

**Kaggle** ملعبك وميدان إثباتك:
- مكتبة ضخمة من **البيانات المجانية** في كل موضوع يخطر ببالك.
- **مسابقات** — مسائل تنبؤ حقيقية (أحياناً بجوائز مالية) تتنافس فيها مع الآخرين. رائعة للتعلّم وإشارة للسيرة.
- **دفاتر** — تحليلات عامة تقرؤها لتتعلّم كيف يفكّر الخبراء، وتنشر خاصتك.
- **مجتمع** مدمج وحوسبة مجانية (معالجات رسومية).

**خطتك الملموسة:**
1. رسّخ أساسيات هذا المسار (إحصاء، pandas، SQL، تصوير، قليل من ML).
2. ابنِ **3 مشاريع معرض** تجيب على أسئلة حقيقية، كل منها على GitHub بشرح واضح.
3. أنجز دفترين/مسابقتين على **Kaggle** للتدرّب وإظهار المبادرة.
4. اجمع ذلك مع مهارات البحث عن عمل والعمل الحر من درس "التكسّب" في مسار الواجهات.

مهارات البيانات من أكثر المهارات طلباً وأجراً على الأرض. المعرض المركّز هو كيف تحوّل التعلّم إلى عرض عمل.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What proves your data skills best to employers?", ar: "ما الذي يثبت مهاراتك في البيانات لأصحاب العمل أفضل؟" },
          choices: [
            { en: "A portfolio of real projects on GitHub", ar: "معرض مشاريع حقيقية على GitHub" },
            { en: "A long list of certificates only", ar: "قائمة طويلة من الشهادات فقط" },
            { en: "Saying you know Python", ar: "قول إنك تعرف بايثون" },
          ],
          answer: 0,
          explain: {
            en: "Show, don't tell. Projects with a clear question and conclusion prove you can actually do the work.",
            ar: "أرِ لا تقُل. المشاريع بسؤال واضح واستنتاج تثبت أنك تستطيع فعلاً أداء العمل.",
          },
        },
        {
          q: { en: "What's the most important part of a portfolio project?", ar: "ما أهم جزء في مشروع المعرض؟" },
          choices: [
            { en: "A clear conclusion that answers a real question", ar: "استنتاج واضح يجيب على سؤال حقيقي" },
            { en: "Using the most complex model", ar: "استخدام أعقد نموذج" },
            { en: "Having the most charts", ar: "امتلاك أكثر الرسوم" },
          ],
          answer: 0,
          explain: {
            en: "Employers want insight, not complexity. A clear question → clean analysis → honest conclusion beats a pile of charts.",
            ar: "أصحاب العمل يريدون البصيرة لا التعقيد. سؤال واضح ← تحليل نظيف ← استنتاج صادق يتفوّق على كومة رسوم.",
          },
        },
        {
          q: { en: "What is Kaggle?", ar: "ما هو Kaggle؟" },
          choices: [
            { en: "A platform with free datasets, competitions, and public notebooks", ar: "منصة فيها بيانات مجانية ومسابقات ودفاتر عامة" },
            { en: "A programming language", ar: "لغة برمجة" },
            { en: "A type of database", ar: "نوع قاعدة بيانات" },
          ],
          answer: 0,
          explain: {
            en: "Kaggle offers datasets, prediction competitions, learn-from notebooks, community, and free compute — ideal for practice and signal.",
            ar: "Kaggle يقدّم بيانات ومسابقات تنبؤ ودفاتر للتعلّم ومجتمعاً وحوسبة مجانية — مثالي للتدرّب والإشارة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Track complete! 🎓

Your data science foundation is built:

- Statistics + pandas + SQL — understanding and querying data
- Visualization + BI — communicating it
- ML + data engineering — predicting and pipelining
- Portfolio + Kaggle — proving it and getting hired

**Your path to paid work:** build 3 honest, curious projects on GitHub, practice on Kaggle, learn a BI tool, and apply the job/freelance tactics from the "Getting Paid" lesson. Data roles are plentiful and well-paid — go earn one. 🚀`,
        ar: `## اكتمل المسار! 🎓

أساس علم البيانات لديك مبنيّ:

- الإحصاء + pandas + SQL — فهم البيانات واستعلامها
- التصوير + BI — توصيلها
- ML + هندسة البيانات — التنبؤ وبناء الخطوط
- المعرض + Kaggle — إثباتها والحصول على وظيفة

**طريقك للعمل المدفوع:** ابنِ 3 مشاريع صادقة فضولية على GitHub، تدرّب على Kaggle، تعلّم أداة BI، وطبّق تكتيكات الوظيفة/العمل الحر من درس "التكسّب". أدوار البيانات كثيرة وجيدة الأجر — اذهب واكسب واحدة. 🚀`,
      },
    },
  ],
};
