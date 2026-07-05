import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "machine-learning-ds",
  title: { en: "Machine Learning for Data Science", ar: "تعلّم الآلة لعلم البيانات" },
  estMinutes: 40,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- How ML fits into the data science workflow
- **scikit-learn** — the 5-line model
- Measuring a model: **accuracy** and why it can lie
- You'll compute a model's accuracy yourself`,
        ar: `## ماذا ستتعلم

- كيف يندمج تعلّم الآلة في سير عمل علم البيانات
- **scikit-learn** — النموذج بخمسة أسطر
- قياس النموذج: **الدقة** ولماذا قد تكذب
- ستحسب دقة نموذج بنفسك`,
      },
    },
    {
      type: "text",
      body: {
        en: `## From "what happened" to "what will happen" 🔮

So far data science has been about **understanding the past**: stats, pandas, SQL, charts. Machine learning adds **predicting the future** — the same ideas from the AI track, but here it's a *tool in the analysis pipeline*, not the whole job.

The data science workflow:
1. **Get** data (SQL) → 2. **Clean & explore** (pandas) → 3. **Visualize** (charts) → 4. **Model** (ML) → 5. **Communicate** results.

In Python, **scikit-learn** makes modeling astonishingly short:

\`\`\`python
from sklearn.linear_model import LogisticRegression

model = LogisticRegression()
model.fit(X_train, y_train)      # learn from training data
predictions = model.predict(X_test)   # predict on unseen data
\`\`\`

Three lines: create, fit (train), predict. scikit-learn has dozens of models behind one consistent interface.

**But: how good is your model?** The first metric is **accuracy** = (correct predictions) ÷ (total predictions). 90 right out of 100 = 90% accuracy.

**The trap — accuracy can lie.** Imagine a disease that affects 1% of people. A lazy model that *always* predicts "healthy" is **99% accurate**… and completely useless — it never catches a single sick person! When classes are imbalanced, accuracy alone is dangerous. That's why data scientists also use **precision** (of those you flagged positive, how many really were?) and **recall** (of all the real positives, how many did you catch?). For the disease test, recall is what matters.

The lesson: always ask what a metric is *hiding*.`,
        ar: `## من "ماذا حدث" إلى "ماذا سيحدث" 🔮

حتى الآن كان علم البيانات عن **فهم الماضي**: الإحصاء، pandas، SQL، الرسوم. تعلّم الآلة يضيف **التنبؤ بالمستقبل** — نفس أفكار مسار الذكاء، لكنها هنا *أداة في خط التحليل*، لا العمل كله.

سير عمل علم البيانات:
1. **احصل** على البيانات (SQL) ← 2. **نظّف واستكشف** (pandas) ← 3. **صوّر** (رسوم) ← 4. **نمذج** (ML) ← 5. **وصّل** النتائج.

في بايثون، **scikit-learn** يجعل النمذجة قصيرة بشكل مذهل:

\`\`\`python
from sklearn.linear_model import LogisticRegression

model = LogisticRegression()
model.fit(X_train, y_train)      # تعلّم من بيانات التدريب
predictions = model.predict(X_test)   # تنبّأ على بيانات لم يرها
\`\`\`

ثلاثة أسطر: أنشئ، درّب (fit)، تنبّأ. scikit-learn فيه عشرات النماذج خلف واجهة واحدة متسقة.

**لكن: ما جودة نموذجك؟** أول مقياس **الدقة (accuracy)** = (التنبؤات الصحيحة) ÷ (إجمالي التنبؤات). 90 صحيحة من 100 = دقة 90%.

**الفخ — الدقة قد تكذب.** تخيّل مرضاً يصيب 1% من الناس. نموذج كسول يتنبأ *دائماً* بـ"سليم" دقته **99%**… وعديم الفائدة تماماً — لا يمسك مريضاً واحداً! حين تكون الفئات غير متوازنة، الدقة وحدها خطيرة. لهذا يستخدم علماء البيانات أيضاً **الدقة الموجبة (precision)** (من صنّفتهم إيجابيين، كم كانوا كذلك حقاً؟) و**الاستدعاء (recall)** (من كل الإيجابيين الحقيقيين، كم أمسكت؟). لاختبار المرض، الاستدعاء هو المهم.

الدرس: اسأل دائماً ما الذي *يخفيه* المقياس.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Measure a model. Write \`accuracy(predictions, actuals)\` — two equal-length lists — returning the fraction that match (correct ÷ total).

Example: predictions \`["spam","ok","spam"]\`, actuals \`["spam","ok","ok"]\` → 2 of 3 correct → \`0.666...\``,
        ar: `قِس نموذجاً. اكتب \`accuracy(predictions, actuals)\` — قائمتان متساويتا الطول — تعيد نسبة المتطابق (الصحيح ÷ الإجمالي).

مثال: predictions \`["spam","ok","spam"]\`، actuals \`["spam","ok","ok"]\` ← 2 من 3 صحيحة ← \`0.666...\``,
      },
      starterCode: `def accuracy(predictions, actuals):
    correct = 0
    # count how many predictions[i] == actuals[i]
    return correct / len(predictions)

print(accuracy(["spam","ok","spam"], ["spam","ok","ok"]))  # 0.666...`,
      solution: `def accuracy(predictions, actuals):
    correct = 0
    for p, a in zip(predictions, actuals):
        if p == a:
            correct += 1
    return correct / len(predictions)

print(accuracy(["spam","ok","spam"], ["spam","ok","ok"]))  # 0.666...`,
      hints: [
        { en: `Pair them with zip(predictions, actuals) and count matches.`, ar: `زاوجهما بـ zip(predictions, actuals) وعُدّ التطابقات.` },
        { en: `Return correct / len(predictions).`, ar: `أعِد correct / len(predictions).` },
      ],
      tests: [
        { name: { en: "2 of 3 correct → ~0.667", ar: "2 من 3 صحيحة ← ~0.667" }, check: `assert abs(accuracy(["spam","ok","spam"],["spam","ok","ok"]) - 2/3) < 0.001` },
        { name: { en: "All correct → 1.0", ar: "كلها صحيحة ← 1.0" }, check: `assert accuracy(["a","b"],["a","b"]) == 1.0` },
        { name: { en: "None correct → 0.0", ar: "لا شيء صحيح ← 0.0" }, check: `assert accuracy(["a","a"],["b","b"]) == 0.0` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What do the 3 scikit-learn lines do?", ar: "ماذا تفعل أسطر scikit-learn الثلاثة؟" },
          choices: [
            { en: "Create a model, fit (train) it, then predict", ar: "إنشاء نموذج، تدريبه (fit)، ثم التنبؤ" },
            { en: "Delete the data", ar: "حذف البيانات" },
            { en: "Draw a chart", ar: "رسم مخطط" },
          ],
          answer: 0,
          explain: {
            en: "create → fit(X_train, y_train) → predict(X_test). One consistent interface across dozens of models.",
            ar: "إنشاء ← fit(X_train, y_train) ← predict(X_test). واجهة واحدة متسقة عبر عشرات النماذج.",
          },
        },
        {
          q: { en: "A disease affects 1% of people. A model always says 'healthy'. Its accuracy is…", ar: "مرض يصيب 1% من الناس. نموذج يقول دائماً 'سليم'. دقته…" },
          choices: [
            { en: "99% — but it's useless (catches no sick people)", ar: "99% — لكنه عديم الفائدة (لا يمسك أي مريض)" },
            { en: "1%", ar: "1%" },
            { en: "50%", ar: "50%" },
          ],
          answer: 0,
          explain: {
            en: "High accuracy hides total failure on the rare class. With imbalance, use precision and recall, not accuracy alone.",
            ar: "الدقة العالية تخفي فشلاً تاماً في الفئة النادرة. مع عدم التوازن، استخدم precision وrecall، لا الدقة وحدها.",
          },
        },
        {
          q: { en: "Where does ML sit in the data science workflow?", ar: "أين يقع تعلّم الآلة في سير عمل علم البيانات؟" },
          choices: [
            { en: "One step (modeling) after get → clean → visualize", ar: "خطوة واحدة (النمذجة) بعد احصل ← نظّف ← صوّر" },
            { en: "It replaces the entire workflow", ar: "يستبدل سير العمل كله" },
            { en: "It comes before collecting any data", ar: "يأتي قبل جمع أي بيانات" },
          ],
          answer: 0,
          explain: {
            en: "Modeling is one step in a pipeline dominated by getting, cleaning, and understanding data first.",
            ar: "النمذجة خطوة في خط يهيمن عليه أولاً جمع البيانات وتنظيفها وفهمها.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- ML is the "predict" step in the data workflow (get→clean→visualize→model→communicate)
- scikit-learn: create → fit → predict in ~3 lines
- Accuracy can lie on imbalanced data — use precision and recall too
- You computed accuracy from scratch

**Next:** Data Engineering Basics — building the pipelines that feed clean data to everything you've learned.`,
        ar: `## الخلاصة

- تعلّم الآلة خطوة "التنبؤ" في سير العمل (احصل←نظّف←صوّر←نمذج←وصّل)
- scikit-learn: أنشئ ← درّب ← تنبّأ في ~3 أسطر
- الدقة قد تكذب على بيانات غير متوازنة — استخدم precision وrecall أيضاً
- حسبت الدقة من الصفر

**التالي:** أساسيات هندسة البيانات — بناء الخطوط التي تغذّي البيانات النظيفة لكل ما تعلّمته.`,
      },
    },
  ],
};
