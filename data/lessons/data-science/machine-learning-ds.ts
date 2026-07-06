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
      type: "text",
      body: {
        en: `## The student who memorized the answer key 📖

Here's a trap that catches every beginner at least once: you train a model, test it on the *same* data you trained it on, and get 99% accuracy. Exciting — until it fails miserably on real, new data. What happened?

**The model memorized instead of learning.** This is called **overfitting** — like a student who memorizes last year's exact exam questions and answers instead of understanding the subject. Ask that student the *same* questions and they look brilliant. Ask slightly different questions, and they're lost — because they never learned the underlying pattern, just the specific answers.

**The fix data scientists always use: the train/test split.**
- Split your data *before* training: commonly 80% for **training** (the model learns from this), 20% held back as a **test set** the model never sees during training.
- Train only on the 80%. Then measure accuracy only on the 20% test set — data the model has genuinely never encountered.
- If training accuracy is 99% but test accuracy is 60%, that gap **is** overfitting, caught red-handed.

**Why this matters more than almost anything else in ML:** a model's *only* job is to work on data it hasn't seen yet (tomorrow's customers, next month's transactions). A model that only performs well on data it already memorized is worthless in production — no matter how impressive its training-set number looks. This is why every serious project, every scikit-learn tutorial, and every job interview question about ML circles back to one habit: **never trust a score computed on training data.**`,
        ar: `## الطالب الذي حفظ ورقة الإجابات 📖

إليك فخّاً يقع فيه كل مبتدئ مرة واحدة على الأقل: تُدرّب نموذجاً، تختبره على *نفس* البيانات التي دُرّب عليها، وتحصل على دقة 99%. مثير — حتى يفشل فشلاً ذريعاً على بيانات حقيقية جديدة. ماذا حدث؟

**النموذج حفظ بدل أن يتعلّم.** يُسمّى هذا **الإفراط في التخصيص (overfitting)** — كطالب يحفظ أسئلة وإجابات امتحان العام الماضي بالضبط بدل فهم المادة. اسأل ذلك الطالب *نفس* الأسئلة فيبدو رائعاً. اسأله أسئلة مختلفة قليلاً، ويضيع — لأنه لم يتعلّم النمط الأساسي أبداً، فقط الإجابات المحددة.

**الحل الذي يستخدمه علماء البيانات دائماً: تقسيم التدريب/الاختبار.**
- قسّم بياناتك *قبل* التدريب: عادة 80% لـ**التدريب** (يتعلّم منها النموذج)، و20% محجوزة كـ**مجموعة اختبار** لا يراها النموذج أبداً أثناء التدريب.
- درّب فقط على الـ80%. ثم قِس الدقة فقط على مجموعة الاختبار 20% — بيانات لم يواجهها النموذج فعلياً أبداً.
- إن كانت دقة التدريب 99% لكن دقة الاختبار 60%، تلك الفجوة **هي** الإفراط في التخصيص، متلبَّس بالجرم المشهود.

**لماذا يهم هذا أكثر من أي شيء آخر تقريباً في ML:** وظيفة النموذج *الوحيدة* هي العمل على بيانات لم يرها بعد (عملاء الغد، معاملات الشهر القادم). النموذج الذي يؤدي جيداً فقط على بيانات حفظها بالفعل عديم القيمة في الإنتاج — مهما بدا رقم مجموعة التدريب مثيراً للإعجاب. لهذا كل مشروع جاد، وكل درس scikit-learn تعليمي، وكل سؤال مقابلة عمل عن ML يعود لعادة واحدة: **لا تثق أبداً بدرجة محسوبة على بيانات التدريب.**`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Simulate a train/test split without any library. Write \`split(data, train_fraction)\` that returns a tuple \`(train, test)\`: the first \`train_fraction\` portion of the list goes to \`train\`, the rest to \`test\`. Assume the split size (\`len(data) * train_fraction\`) is always a whole number in the tests below.

Example: \`split([1,2,3,4,5,6,7,8,9,10], 0.8)\` → \`([1,2,3,4,5,6,7,8], [9,10])\` — 8 training rows, 2 test rows, and critically, **no overlap** between them.`,
        ar: `حاكِ تقسيم تدريب/اختبار دون أي مكتبة. اكتب \`split(data, train_fraction)\` تُعيد زوجاً \`(train, test)\`: الجزء الأول بنسبة \`train_fraction\` من القائمة يذهب لـ\`train\`، والباقي لـ\`test\`. افترض أن حجم التقسيم (\`len(data) * train_fraction\`) دائماً عدد صحيح في الاختبارات أدناه.

مثال: \`split([1,2,3,4,5,6,7,8,9,10], 0.8)\` ← \`([1,2,3,4,5,6,7,8], [9,10])\` — 8 صفوف تدريب، 2 صف اختبار، والأهم، **بلا تداخل** بينهما.`,
      },
      starterCode: `def split(data, train_fraction):
    cut = int(len(data) * train_fraction)
    # train = the first "cut" items
    # test = everything after that
    return data[:cut], data[:cut]

train, test = split([1,2,3,4,5,6,7,8,9,10], 0.8)
print(train)  # [1, 2, 3, 4, 5, 6, 7, 8]
print(test)   # [9, 10]`,
      solution: `def split(data, train_fraction):
    cut = int(len(data) * train_fraction)
    train = data[:cut]
    test = data[cut:]
    return train, test

train, test = split([1,2,3,4,5,6,7,8,9,10], 0.8)
print(train)  # [1, 2, 3, 4, 5, 6, 7, 8]
print(test)   # [9, 10]`,
      hints: [
        { en: `cut = int(len(data) * train_fraction) gives you the boundary index.`, ar: `cut = int(len(data) * train_fraction) يعطيك فهرس الحد الفاصل.` },
        { en: `train = data[:cut], test = data[cut:] — slicing never overlaps.`, ar: `train = data[:cut]، test = data[cut:] — التقطيع لا يتداخل أبداً.` },
      ],
      tests: [
        { name: { en: "80/10 split gives correct train", ar: "تقسيم 80/10 يعطي التدريب الصحيح" }, check: `assert split([1,2,3,4,5,6,7,8,9,10], 0.8)[0] == [1,2,3,4,5,6,7,8]` },
        { name: { en: "80/10 split gives correct test", ar: "تقسيم 80/10 يعطي الاختبار الصحيح" }, check: `assert split([1,2,3,4,5,6,7,8,9,10], 0.8)[1] == [9,10]` },
        { name: { en: "train and test never overlap", ar: "التدريب والاختبار لا يتداخلان أبداً" }, check: `train, test = split([1,2,3,4,5,6,7,8,9,10], 0.8); assert set(train).isdisjoint(set(test))` },
        { name: { en: "50/50 split halves the data", ar: "تقسيم 50/50 ينصّف البيانات" }, check: `assert split([1,2,3,4], 0.5) == ([1,2], [3,4])` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the flu-prediction model that vanished 🔍

In 2008, Google launched **Google Flu Trends**, a widely celebrated project that predicted flu outbreaks by analyzing which health-related search terms ("fever," "flu symptoms") were trending in different regions — often faster than official government health reports. It looked like a triumph of big data.

By 2013, it had badly failed: it predicted more than **double** the actual flu cases that the U.S. Centers for Disease Control (CDC) reported that season. Researchers who studied the collapse pointed to a version of overfitting at the *system* level: the model had been tuned to match historical search patterns so closely that it drifted out of sync as real-world behavior changed — media coverage of flu season itself drove extra searches unrelated to actual illness, and Google's own search algorithm kept changing underneath the model, feeding it a shifting target it had implicitly "memorized" rather than truly modeled.

Google quietly retired the public Flu Trends project a couple of years later. The lesson generalizes far beyond flu: **a model that fits its training conditions perfectly can still fail once the world shifts even slightly underneath it** — which is exactly why data scientists don't just check train/test accuracy once, but keep monitoring live models after deployment, watching for the moment their real-world accuracy starts drifting away from what the lab numbers promised.`,
        ar: `## دراسة حالة واقعية: نموذج التنبؤ بالإنفلونزا الذي اختفى 🔍

في 2008، أطلقت Google **Google Flu Trends**، مشروعاً احتُفي به على نطاق واسع تنبّأ بتفشّي الإنفلونزا بتحليل أي مصطلحات بحث متعلقة بالصحة ("حمى"، "أعراض إنفلونزا") كانت رائجة في مناطق مختلفة — غالباً أسرع من التقارير الصحية الحكومية الرسمية. بدا كانتصار للبيانات الضخمة.

بحلول 2013، فشل فشلاً ذريعاً: تنبّأ بأكثر من **ضعف** حالات الإنفلونزا الفعلية التي أبلغ عنها مركز السيطرة على الأمراض الأمريكي (CDC) ذلك الموسم. الباحثون الذين درسوا الانهيار أشاروا إلى نسخة من الإفراط في التخصيص على مستوى *النظام*: كان النموذج مضبوطاً ليطابق أنماط البحث التاريخية بدقة شديدة لدرجة أنه انحرف عن التزامن مع تغيّر سلوك العالم الحقيقي — تغطية وسائل الإعلام لموسم الإنفلونزا نفسها دفعت عمليات بحث إضافية لا علاقة لها بالمرض الفعلي، وخوارزمية بحث Google نفسها استمرت بالتغيّر تحت النموذج، مُغذّية إياه بهدف متحرّك "حفظه" ضمنياً بدل أن ينمذجه حقاً.

تقاعدت Google بهدوء عن مشروع Flu Trends العام بعد بضع سنوات. الدرس يتعمّم إلى أبعد من الإنفلونزا بكثير: **نموذج يطابق ظروف تدريبه تماماً قد يفشل رغم ذلك بمجرد أن يتغيّر العالم ولو قليلاً تحته** — ولهذا بالضبط لا يكتفي علماء البيانات بفحص دقة التدريب/الاختبار مرة واحدة، بل يستمرون بمراقبة النماذج الحيّة بعد النشر، متيقّظين للحظة التي تبدأ فيها دقتها الواقعية بالانحراف عمّا وعدت به أرقام المختبر.`,
      },
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
        {
          q: { en: "A model gets 99% accuracy on training data but only 60% on new data. What's happening?", ar: "نموذج يحصل على دقة 99% على بيانات التدريب لكن 60% فقط على بيانات جديدة. ماذا يحدث؟" },
          choices: [
            { en: "Overfitting — it memorized the training data instead of learning the pattern", ar: "إفراط في التخصيص — حفظ بيانات التدريب بدل تعلّم النمط" },
            { en: "The model is perfect and the new data is wrong", ar: "النموذج مثالي والبيانات الجديدة خاطئة" },
            { en: "This always happens and can't be prevented", ar: "هذا يحدث دائماً ولا يمكن منعه" },
          ],
          answer: 0,
          explain: {
            en: "A big gap between training and test accuracy is the signature of overfitting — like memorizing an answer key instead of understanding the subject.",
            ar: "فجوة كبيرة بين دقة التدريب والاختبار هي بصمة الإفراط في التخصيص — كحفظ ورقة إجابات بدل فهم المادة.",
          },
        },
        {
          q: { en: "Why is a train/test split necessary?", ar: "لماذا تقسيم التدريب/الاختبار ضروري؟" },
          choices: [
            { en: "It measures accuracy on data the model never saw during training, revealing true performance", ar: "يقيس الدقة على بيانات لم يرها النموذج أثناء التدريب، كاشفاً الأداء الحقيقي" },
            { en: "It makes training faster", ar: "يجعل التدريب أسرع" },
            { en: "It is only needed for very large datasets", ar: "ضروري فقط لمجموعات البيانات الكبيرة جداً" },
          ],
          answer: 0,
          explain: {
            en: "Testing on unseen data is the only honest way to know if a model actually learned the pattern or just memorized examples.",
            ar: "الاختبار على بيانات غير مرئية هو الطريقة الصادقة الوحيدة لمعرفة إن كان النموذج تعلّم النمط فعلاً أو حفظ الأمثلة فقط.",
          },
        },
        {
          q: { en: "Why did Google Flu Trends eventually fail?", ar: "لماذا فشل Google Flu Trends في النهاية؟" },
          choices: [
            { en: "It was tuned so closely to past search patterns that it drifted out of sync as real-world behavior changed", ar: "كان مضبوطاً بدقة شديدة على أنماط بحث سابقة لدرجة أنه انحرف عن التزامن مع تغيّر سلوك العالم الحقيقي" },
            { en: "Google deleted all its search data", ar: "حذفت Google كل بيانات بحثها" },
            { en: "Flu stopped existing", ar: "توقفت الإنفلونزا عن الوجود" },
          ],
          answer: 0,
          explain: {
            en: "A model that perfectly fits its training conditions can still fail once the world shifts — which is why live models need ongoing monitoring, not a one-time accuracy check.",
            ar: "نموذج يطابق ظروف تدريبه تماماً قد يفشل رغم ذلك بمجرد تغيّر العالم — لهذا تحتاج النماذج الحيّة مراقبة مستمرة، لا فحص دقة لمرة واحدة.",
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
- Overfitting is memorizing instead of learning — always evaluate on a held-out test set, never on training data
- You coded a train/test split from scratch
- Google Flu Trends shows how even a well-tuned model can silently drift and fail once the real world shifts

**Next:** Data Engineering Basics — building the pipelines that feed clean data to everything you've learned.`,
        ar: `## الخلاصة

- تعلّم الآلة خطوة "التنبؤ" في سير العمل (احصل←نظّف←صوّر←نمذج←وصّل)
- scikit-learn: أنشئ ← درّب ← تنبّأ في ~3 أسطر
- الدقة قد تكذب على بيانات غير متوازنة — استخدم precision وrecall أيضاً
- حسبت الدقة من الصفر
- الإفراط في التخصيص هو الحفظ بدل التعلّم — قيّم دائماً على مجموعة اختبار محجوزة، لا على بيانات التدريب
- برمجت تقسيم تدريب/اختبار من الصفر
- Google Flu Trends يُظهر كيف يمكن حتى لنموذج مضبوط جيداً أن ينحرف بصمت ويفشل بمجرد تغيّر العالم الحقيقي

**التالي:** أساسيات هندسة البيانات — بناء الخطوط التي تغذّي البيانات النظيفة لكل ما تعلّمته.`,
      },
    },
  ],
};
