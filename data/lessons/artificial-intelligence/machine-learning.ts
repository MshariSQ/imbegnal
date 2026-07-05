import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "machine-learning",
  title: { en: "Machine Learning — Learning from Examples", ar: "تعلّم الآلة — التعلّم من الأمثلة" },
  estMinutes: 40,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What ML *really* is (vs normal programming)
- **Supervised vs unsupervised** learning
- Training data, features, labels, and the train/test split
- You'll build a simple classifier by hand`,
        ar: `## ماذا ستتعلم

- ما هو تعلّم الآلة *حقاً* (مقابل البرمجة العادية)
- التعلّم **الموجَّه مقابل غير الموجَّه**
- بيانات التدريب، السمات، التسميات، وتقسيم التدريب/الاختبار
- ستبني مصنّفاً بسيطاً بيدك`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Teaching by showing, not telling 👶

Normal programming: *you* write the rules. "If email contains 'lottery' and 'winner', mark as spam." But spammers adapt, and you'd write rules forever.

**Machine learning flips it:** instead of writing rules, you show the computer thousands of **examples** (emails already labeled spam / not-spam) and it *figures out the rules itself*. Like a child learning "cat" — you don't define whiskers-and-tail; you point at cats until they just know.

**The vocabulary:**
- **Features** — the inputs (words in the email, size of a house).
- **Label** — the answer you want to predict (spam? price?).
- **Training data** — many examples *with* their labels, to learn from.
- **Model** — the thing that learns the pattern (the weights from last lesson).

**Two big families:**
- **Supervised learning** — you have labeled examples (emails marked spam/not). The model learns input → label. Includes **classification** (which category? spam/not) and **regression** (what number? house price).
- **Unsupervised learning** — no labels; the model finds hidden structure on its own, like **clustering** customers into groups you didn't know existed.

**The golden rule: train/test split.** You *never* judge a model on the data it studied — of course it memorized those. You hold back some examples as a **test set** it never saw, and check if it generalizes to those. A model that aces training but fails the test set is **overfitting** — it memorized instead of learning (like a student who memorized the answer key but can't solve new problems).`,
        ar: `## التعليم بالإراءة لا بالإخبار 👶

البرمجة العادية: *أنت* تكتب القواعد. "إذا احتوى البريد 'يانصيب' و'فائز'، صنّفه مزعجاً." لكن المرسلين يتكيّفون، وستكتب قواعد بلا نهاية.

**تعلّم الآلة يقلبها:** بدل كتابة القواعد، تُري الحاسوب آلاف **الأمثلة** (رسائل مُصنّفة مسبقاً مزعج/غير مزعج) فـ*يستنتج القواعد بنفسه*. مثل طفل يتعلّم "قطة" — لا تعرّف الشوارب والذيل؛ بل تشير إلى القطط حتى يعرف.

**المفردات:**
- **السمات (Features)** — المدخلات (كلمات البريد، مساحة المنزل).
- **التسمية (Label)** — الإجابة المطلوب التنبؤ بها (مزعج؟ سعر؟).
- **بيانات التدريب** — أمثلة كثيرة *مع* تسمياتها، للتعلّم منها.
- **النموذج (Model)** — الشيء الذي يتعلّم النمط (الأوزان من الدرس السابق).

**عائلتان كبيرتان:**
- **التعلّم الموجَّه (Supervised)** — لديك أمثلة مُسمّاة (رسائل مُعلَّمة مزعج/لا). يتعلّم النموذج مدخل ← تسمية. يشمل **التصنيف** (أي فئة؟ مزعج/لا) و**الانحدار** (أي رقم؟ سعر المنزل).
- **التعلّم غير الموجَّه (Unsupervised)** — بلا تسميات؛ يجد النموذج بنية خفية بنفسه، مثل **التجميع (clustering)** للعملاء في فئات لم تكن تعرفها.

**القاعدة الذهبية: تقسيم تدريب/اختبار.** *لا* تحكم أبداً على نموذج ببيانات درسها — بالطبع حفظها. تحتفظ ببعض الأمثلة كـ**مجموعة اختبار** لم يرها أبداً، وتتحقق هل يعمّم عليها. النموذج الذي يتقن التدريب ويفشل في الاختبار **مُفرِط في الملاءمة (overfitting)** — حفظ بدل أن يتعلّم (كطالب حفظ مفتاح الإجابات لكنه يعجز عن حلّ مسائل جديدة).`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Build a tiny classifier. A model learned that emails with a **spam score ≥ 0.5** are spam. Write \`classify(scores, threshold)\` that returns a list of \`"spam"\` / \`"ok"\` labels — one per score.

Example: \`classify([0.9, 0.2, 0.5], 0.5)\` → \`["spam", "ok", "spam"]\``,
        ar: `ابنِ مصنّفاً صغيراً. تعلّم نموذج أن الرسائل ذات **درجة إزعاج ≥ 0.5** مزعجة. اكتب \`classify(scores, threshold)\` تعيد قائمة تسميات \`"spam"\` / \`"ok"\` — واحدة لكل درجة.

مثال: \`classify([0.9, 0.2, 0.5], 0.5)\` ← \`["spam", "ok", "spam"]\``,
      },
      starterCode: `def classify(scores, threshold):
    labels = []
    # for each score: "spam" if score >= threshold else "ok"
    return labels

print(classify([0.9, 0.2, 0.5], 0.5))  # ['spam', 'ok', 'spam']`,
      solution: `def classify(scores, threshold):
    labels = []
    for score in scores:
        if score >= threshold:
            labels.append("spam")
        else:
            labels.append("ok")
    return labels

print(classify([0.9, 0.2, 0.5], 0.5))  # ['spam', 'ok', 'spam']`,
      hints: [
        { en: `Loop over scores; append "spam" if score >= threshold else "ok".`, ar: `كرّر على scores؛ أضف "spam" إذا score >= threshold وإلا "ok".` },
        { en: `Note: >= means 0.5 counts as spam (the boundary is included).`, ar: `لاحظ: >= تعني أن 0.5 تُحتسب مزعجة (الحد مشمول).` },
      ],
      tests: [
        { name: { en: "Classifies the example correctly", ar: "يصنّف المثال بشكل صحيح" }, check: `assert classify([0.9,0.2,0.5],0.5) == ["spam","ok","spam"]` },
        { name: { en: "The threshold value counts as spam", ar: "قيمة الحد تُحتسب مزعجة" }, check: `assert classify([0.5],0.5) == ["spam"]` },
        { name: { en: "All-low scores are ok", ar: "الدرجات المنخفضة كلها ok" }, check: `assert classify([0.1,0.3],0.5) == ["ok","ok"]` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "How is ML different from normal programming?", ar: "كيف يختلف تعلّم الآلة عن البرمجة العادية؟" },
          choices: [
            { en: "You show examples and it learns the rules, instead of you writing the rules", ar: "تُري أمثلة فيتعلّم القواعد، بدل أن تكتبها أنت" },
            { en: "It's just faster code", ar: "مجرد كود أسرع" },
            { en: "It doesn't use data", ar: "لا يستخدم بيانات" },
          ],
          answer: 0,
          explain: {
            en: "Classic code = human-written rules. ML = the model infers rules from labeled examples. That's the paradigm shift.",
            ar: "الكود التقليدي = قواعد يكتبها الإنسان. تعلّم الآلة = النموذج يستنتج القواعد من أمثلة مُسمّاة. هذا التحوّل الجوهري.",
          },
        },
        {
          q: { en: "Predicting a house PRICE from features is…", ar: "التنبؤ بـ سعر منزل من سماته هو…" },
          choices: [
            { en: "Classification", ar: "تصنيف" },
            { en: "Regression (predicting a number)", ar: "انحدار (تنبؤ برقم)" },
            { en: "Clustering", ar: "تجميع" },
          ],
          answer: 1,
          explain: {
            en: "Predicting a continuous number = regression. Predicting a category (spam/not) = classification. Both are supervised.",
            ar: "التنبؤ برقم مستمر = انحدار. التنبؤ بفئة (مزعج/لا) = تصنيف. كلاهما موجَّه.",
          },
        },
        {
          q: { en: "Why hold back a test set?", ar: "لماذا نحتفظ بمجموعة اختبار؟" },
          choices: [
            { en: "To check the model generalizes to data it never studied", ar: "للتحقق أن النموذج يعمّم على بيانات لم يدرسها" },
            { en: "To make training slower", ar: "لإبطاء التدريب" },
            { en: "Test sets are useless", ar: "مجموعات الاختبار عديمة الفائدة" },
          ],
          answer: 0,
          explain: {
            en: "A model can memorize training data (overfitting). The unseen test set reveals whether it truly learned the pattern.",
            ar: "قد يحفظ النموذج بيانات التدريب (الإفراط في الملاءمة). مجموعة الاختبار غير المرئية تكشف هل تعلّم النمط حقاً.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- ML learns rules from labeled examples instead of hand-written rules
- Supervised (labeled: classification/regression) vs unsupervised (clustering)
- Always use a train/test split; beware overfitting (memorizing, not learning)
- You built a threshold classifier

**Practice:** try scikit-learn's tutorials (Resources). **Next:** Deep Learning — neural networks, the tech behind modern AI.`,
        ar: `## الخلاصة

- تعلّم الآلة يتعلّم القواعد من أمثلة مُسمّاة بدل قواعد مكتوبة يدوياً
- موجَّه (مُسمّى: تصنيف/انحدار) مقابل غير موجَّه (تجميع)
- استخدم دائماً تقسيم تدريب/اختبار؛ واحذر الإفراط في الملاءمة (الحفظ لا التعلّم)
- بنيت مصنّف عتبة

**تدرّب:** جرّب دروس scikit-learn (المصادر). **التالي:** التعلّم العميق — الشبكات العصبية، التقنية خلف الذكاء الحديث.`,
      },
    },
  ],
};
