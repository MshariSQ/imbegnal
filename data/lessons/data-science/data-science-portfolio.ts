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
      type: "text",
      body: {
        en: `## Anatomy of a project people actually read 📓

A portfolio project isn't a code dump — it's a **short story** that happens to include code. Reviewers (recruiters, hiring managers, other analysts) skim; you have seconds to earn a real read. Structure every project the same way:

1. **Title + one-sentence question** at the top — "Do Riyadh house prices depend more on size or location?" Not "House Price Analysis."
2. **Why it matters** — 2–3 sentences on why anyone should care about the answer.
3. **Data source** — where it came from, how big it is, any known limitations (be honest — this builds trust).
4. **Process, briefly** — cleaning steps and key decisions, but don't paste every line of code; summarize, and link to the notebook for detail.
5. **The finding** — 1–2 charts that directly answer the question, with a plain-English caption.
6. **Conclusion** — a direct answer, plus one honest limitation ("this only covers 2023 listings, so seasonal effects aren't captured").

**The checklist before you publish:**
- Does the README alone (no need to open the notebook) tell the whole story?
- Could someone re-run your notebook top-to-bottom without errors?
- Is there a clear conclusion, not just "here are some charts"?
- Did you credit the data source?

Three projects built this way outperform ten half-finished notebooks with no writeup. Depth and honesty beat volume every time.`,
        ar: `## تشريح مشروع يقرأه الناس فعلاً 📓

مشروع المعرض ليس تفريغ كود — إنه **قصة قصيرة** تتضمّن كوداً بالصدفة. المراجعون (مسؤولو التوظيف، المديرون، محلّلون آخرون) يتصفّحون سريعاً؛ لديك ثوانٍ لكسب قراءة حقيقية. رتّب كل مشروع بنفس الطريقة:

1. **عنوان + سؤال بجملة واحدة** في الأعلى — "هل تعتمد أسعار منازل الرياض على المساحة أكثر أم الموقع؟" لا "تحليل أسعار المنازل."
2. **لماذا يهم** — 2–3 جمل عن سبب اهتمام أي أحد بالإجابة.
3. **مصدر البيانات** — من أين جاءت، حجمها، أي قيود معروفة (كن صادقاً — هذا يبني الثقة).
4. **العملية، باختصار** — خطوات التنظيف والقرارات الأساسية، لكن لا تلصق كل سطر كود؛ لخّص، واربط بالدفتر للتفاصيل.
5. **الاكتشاف** — 1–2 رسم يجيب مباشرة على السؤال، بتعليق واضح بلغة بسيطة.
6. **الاستنتاج** — إجابة مباشرة، بالإضافة إلى قيد صادق واحد ("هذا يغطي فقط قوائم 2023، فالتأثيرات الموسمية غير مُلتقطة").

**قائمة التحقق قبل النشر:**
- هل يروي الـ README وحده (دون فتح الدفتر) القصة كاملة؟
- هل يستطيع أحد إعادة تشغيل دفترك من البداية للنهاية دون أخطاء؟
- هل يوجد استنتاج واضح، لا مجرد "إليك بعض الرسوم"؟
- هل نسبت الفضل لمصدر البيانات؟

ثلاثة مشاريع مبنية بهذه الطريقة تتفوّق على عشرة دفاتر نصف منجزة بلا شرح. العمق والصدق يتفوّقان على الكمّ دائماً.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the Netflix Prize 🔍

In 2006, Netflix publicly released a dataset of about 100 million anonymized movie ratings and offered **$1,000,000** to anyone who could improve its recommendation algorithm's accuracy by 10%. It became one of the most famous open data science competitions ever run — a direct ancestor of every Kaggle competition today.

Thousands of teams worldwide — students, hobbyists, and professional researchers — competed for nearly three years. The eventual winning team, "BellKor's Pragmatic Chaos," didn't win with one clever trick; they won by **combining (ensembling) hundreds of different models** built by merging several competing teams' approaches together. The competition also became a landmark case study in data privacy: researchers later showed that some "anonymized" viewers could be re-identified by cross-referencing the ratings with public data (like IMDb reviews) — a lesson every data scientist since has had to reckon with when handling "anonymous" data.

The takeaway for your own portfolio: the Netflix Prize proved that **public datasets + transparent competition + a clear, measurable goal** is one of the best ways to learn real data science and get noticed — exactly what Kaggle offers you today, minus the million-dollar prize (usually).`,
        ar: `## دراسة حالة واقعية: جائزة Netflix 🔍

في 2006، أصدرت Netflix علناً مجموعة بيانات من نحو 100 مليون تقييم فيلم مجهول الهوية، وعرضت **مليون دولار** لأي فريق يحسّن دقة خوارزمية توصياتها بنسبة 10%. أصبحت واحدة من أشهر مسابقات علم البيانات المفتوحة على الإطلاق — سلف مباشر لكل مسابقة Kaggle اليوم.

تنافست آلاف الفرق حول العالم — طلاب، هواة، وباحثون محترفون — لقرابة ثلاث سنوات. الفريق الفائز أخيراً، "BellKor's Pragmatic Chaos"، لم يفز بحيلة ذكية واحدة؛ بل فاز بـ**دمج (ensembling) مئات النماذج المختلفة** المبنية بدمج طرق عدة فرق متنافسة معاً. أصبحت المسابقة أيضاً دراسة حالة بارزة في خصوصية البيانات: أظهر باحثون لاحقاً أن بعض المشاهدين "المجهولين" يمكن إعادة تحديد هويتهم بمطابقة التقييمات مع بيانات عامة (كمراجعات IMDb) — درس اضطر كل عالِم بيانات منذ ذلك الحين للتعامل معه عند التعامل مع بيانات "مجهولة الهوية".

الدرس المستفاد لمعرضك الخاص: أثبتت جائزة Netflix أن **بيانات عامة + منافسة شفافة + هدف واضح قابل للقياس** من أفضل طرق تعلّم علم البيانات الحقيقي ولفت الانتباه — بالضبط ما يقدّمه لك Kaggle اليوم، بلا جائزة المليون دولار (عادة).`,
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
        {
          q: { en: "What structure should a portfolio project README follow?", ar: "أي بنية يجب أن يتّبعها README مشروع المعرض؟" },
          choices: [
            { en: "Question → why it matters → data source → brief process → finding → conclusion", ar: "سؤال ← لماذا يهم ← مصدر البيانات ← عملية موجزة ← اكتشاف ← استنتاج" },
            { en: "Just the raw code with no explanation", ar: "الكود الخام فقط بلا شرح" },
            { en: "A list of every library you imported", ar: "قائمة بكل مكتبة استوردتها" },
          ],
          answer: 0,
          explain: {
            en: "A reviewer should get the whole story from the README alone — question, context, data, process, finding, and a clear conclusion.",
            ar: "يجب أن يحصل المراجع على القصة كاملة من الـ README وحده — السؤال، السياق، البيانات، العملية، الاكتشاف، واستنتاج واضح.",
          },
        },
        {
          q: { en: "What did the Netflix Prize demonstrate about real-world data science?", ar: "ماذا أظهرت جائزة Netflix عن علم البيانات في الواقع؟" },
          choices: [
            { en: "Public datasets + a clear measurable goal can drive huge collective progress — and 'anonymized' data can still be re-identified", ar: "البيانات العامة + هدف واضح قابل للقياس يمكن أن يدفعا تقدماً جماعياً ضخماً — والبيانات 'مجهولة الهوية' قد يُعاد تحديد هويتها" },
            { en: "One person working alone always beats a team", ar: "شخص واحد يعمل بمفرده يتفوّق دائماً على فريق" },
            { en: "Anonymized data can never be traced back to individuals", ar: "البيانات مجهولة الهوية لا يمكن أبداً تتبعها لأفراد" },
          ],
          answer: 0,
          explain: {
            en: "The winning solution combined many teams' models, and researchers later showed some 'anonymous' viewers could be re-identified — a lasting privacy lesson.",
            ar: "الحل الفائز دمج نماذج فرق عديدة، وأظهر باحثون لاحقاً أن بعض المشاهدين 'المجهولين' يمكن إعادة تحديد هويتهم — درس خصوصية دائم.",
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
- You now know how to structure a project README so it actually gets read
- The Netflix Prize shows how public data + a clear goal turns into real skill and recognition

**Your path to paid work:** build 3 honest, curious projects on GitHub, practice on Kaggle, learn a BI tool, and apply the job/freelance tactics from the "Getting Paid" lesson. Data roles are plentiful and well-paid — go earn one. 🚀`,
        ar: `## اكتمل المسار! 🎓

أساس علم البيانات لديك مبنيّ:

- الإحصاء + pandas + SQL — فهم البيانات واستعلامها
- التصوير + BI — توصيلها
- ML + هندسة البيانات — التنبؤ وبناء الخطوط
- المعرض + Kaggle — إثباتها والحصول على وظيفة
- تعرف الآن كيف تبني README مشروع بحيث يُقرأ فعلاً
- جائزة Netflix تُظهر كيف تتحوّل البيانات العامة + هدف واضح إلى مهارة حقيقية وتقدير

**طريقك للعمل المدفوع:** ابنِ 3 مشاريع صادقة فضولية على GitHub، تدرّب على Kaggle، تعلّم أداة BI، وطبّق تكتيكات الوظيفة/العمل الحر من درس "التكسّب". أدوار البيانات كثيرة وجيدة الأجر — اذهب واكسب واحدة. 🚀`,
      },
    },
  ],
};
