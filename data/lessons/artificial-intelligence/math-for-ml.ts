import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "math-for-ml",
  title: { en: "Math for ML — Less Than You Fear", ar: "رياضيات تعلّم الآلة — أقل مما تخشى" },
  estMinutes: 35,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- The 3 math areas ML actually uses (and why)
- What a **vector** is, intuitively
- **Averages, weights, and slopes** — the real core
- You'll compute a weighted prediction yourself

Good news: you need far less math than people fear. Intuition beats formulas here.`,
        ar: `## ماذا ستتعلم

- مجالات الرياضيات الثلاثة التي يستخدمها تعلّم الآلة فعلاً (ولماذا)
- ما هو **المتجه (vector)** حدسياً
- **المتوسطات والأوزان والميول** — الجوهر الحقيقي
- ستحسب تنبؤاً مرجّحاً بنفسك

خبر سار: تحتاج رياضيات أقل بكثير مما يخشى الناس. الحدس هنا يتفوّق على الصيغ.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Three tools, not a degree 🎓

Machine learning leans on three math areas — but you can start with the intuition of each:

**1. Linear Algebra = organizing numbers in rows.** A **vector** is just a list of numbers describing something. A house might be \`[120, 3, 2]\` = (size, bedrooms, bathrooms). An image is a huge vector of pixel brightnesses. ML represents *everything* as vectors, then does arithmetic on them. That's 90% of the "scary" linear algebra.

**2. Statistics = understanding data.** Averages, spread, probability. "What's typical? How much do things vary? How likely is this?" You already computed averages last lesson — that *is* the statistics ML leans on daily.

**3. Calculus = finding the best answer by tiny steps.** You won't compute derivatives by hand. The one idea: a model learns by checking "if I nudge this knob slightly, does my error go down?" and stepping in the better direction, over and over. That downhill-stepping is called **gradient descent** — imagine a ball rolling to the bottom of a valley. That's the engine of nearly all ML training.

**The single most important concept: weights.** A prediction is usually a **weighted sum** — multiply each input by how much it matters, then add:

\`\`\`
price = (size × 1000) + (bedrooms × 5000) + (bathrooms × 3000)
\`\`\`

"Training a model" mostly means: **find the best weights** so predictions match reality. Everything else is detail.`,
        ar: `## ثلاث أدوات، لا شهادة 🎓

تعلّم الآلة يعتمد على ثلاثة مجالات رياضية — لكن يمكنك البدء بحدس كلٍّ منها:

**1. الجبر الخطي = تنظيم الأرقام في صفوف.** **المتجه (vector)** مجرد قائمة أرقام تصف شيئاً. منزل قد يكون \`[120, 3, 2]\` = (المساحة، غرف النوم، الحمامات). الصورة متجه ضخم من سطوع البكسلات. تعلّم الآلة يمثّل *كل شيء* كمتجهات، ثم يجري عليها حساباً. هذه 90% من الجبر الخطي "المخيف".

**2. الإحصاء = فهم البيانات.** المتوسطات، التشتت، الاحتمال. "ما المعتاد؟ كم تتباين الأمور؟ ما احتمال هذا؟" حسبت المتوسطات في الدرس السابق — وذلك *هو* الإحصاء الذي يعتمده تعلّم الآلة يومياً.

**3. التفاضل والتكامل = إيجاد أفضل إجابة بخطوات صغيرة.** لن تحسب المشتقات يدوياً. الفكرة الوحيدة: يتعلّم النموذج بفحص "إذا حرّكت هذا المقبض قليلاً، هل يقلّ خطئي؟" ويخطو في الاتجاه الأفضل، مراراً. هذا التدرّج نزولاً يسمى **الانحدار التدريجي (gradient descent)** — تخيّل كرة تتدحرج إلى قاع وادٍ. إنه محرّك تدريب تعلّم الآلة كله تقريباً.

**أهم مفهوم على الإطلاق: الأوزان.** التنبؤ عادةً **مجموع مرجّح** — اضرب كل مدخل بمقدار أهميته، ثم اجمع:

\`\`\`
price = (size × 1000) + (bedrooms × 5000) + (bathrooms × 3000)
\`\`\`

"تدريب نموذج" يعني غالباً: **إيجاد أفضل الأوزان** لتطابق التنبؤات الواقع. وكل ما عدا ذلك تفاصيل.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Compute a model's prediction as a **weighted sum**. Write \`predict(features, weights)\` where both are equal-length lists. Multiply each feature by its weight and add them all up.

Example: features \`[120, 3, 2]\`, weights \`[1000, 5000, 3000]\` → \`120000 + 15000 + 6000 = 141000\``,
        ar: `احسب تنبؤ نموذج كـ**مجموع مرجّح**. اكتب \`predict(features, weights)\` حيث كلاهما قائمتان متساويتا الطول. اضرب كل سمة بوزنها واجمع الكل.

مثال: features \`[120, 3, 2]\`، weights \`[1000, 5000, 3000]\` ← \`120000 + 15000 + 6000 = 141000\``,
      },
      starterCode: `def predict(features, weights):
    total = 0
    # for each pair (f, w), add f * w to total
    return total

print(predict([120, 3, 2], [1000, 5000, 3000]))  # 141000`,
      solution: `def predict(features, weights):
    total = 0
    for f, w in zip(features, weights):
        total += f * w
    return total

print(predict([120, 3, 2], [1000, 5000, 3000]))  # 141000`,
      hints: [
        { en: `zip(features, weights) pairs them up: for f, w in zip(features, weights):`, ar: `zip(features, weights) يزاوجهما: for f, w in zip(features, weights):` },
        { en: `Add f * w to total each loop.`, ar: `أضف f * w إلى total في كل دورة.` },
      ],
      tests: [
        { name: { en: "The example gives 141000", ar: "المثال يعطي 141000" }, check: `assert predict([120,3,2],[1000,5000,3000]) == 141000` },
        { name: { en: "All-zero weights give 0", ar: "أوزان صفرية تعطي 0" }, check: `assert predict([5,5],[0,0]) == 0` },
        { name: { en: "Single feature works", ar: "سمة واحدة تعمل" }, check: `assert predict([4],[10]) == 40` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is a vector in ML?", ar: "ما هو المتجه في تعلّم الآلة؟" },
          choices: [
            { en: "A list of numbers describing something", ar: "قائمة أرقام تصف شيئاً" },
            { en: "A type of virus", ar: "نوع من الفيروسات" },
            { en: "A programming language", ar: "لغة برمجة" },
          ],
          answer: 0,
          explain: {
            en: "A house as [size, beds, baths], an image as pixel values — ML turns everything into vectors of numbers.",
            ar: "منزل كـ [المساحة، الغرف، الحمامات]، صورة كقيم بكسلات — تعلّم الآلة يحوّل كل شيء إلى متجهات أرقام.",
          },
        },
        {
          q: { en: "What does 'training a model' mostly mean?", ar: "ماذا يعني 'تدريب نموذج' غالباً؟" },
          choices: [
            { en: "Finding the best weights so predictions match reality", ar: "إيجاد أفضل الأوزان لتطابق التنبؤات الواقع" },
            { en: "Making the computer faster", ar: "جعل الحاسوب أسرع" },
            { en: "Writing more code", ar: "كتابة كود أكثر" },
          ],
          answer: 0,
          explain: {
            en: "Learning = adjusting weights to minimize error. Gradient descent is how the model steps toward better weights.",
            ar: "التعلّم = ضبط الأوزان لتقليل الخطأ. الانحدار التدريجي هو كيف يخطو النموذج نحو أوزان أفضل.",
          },
        },
        {
          q: { en: "Gradient descent is like…", ar: "الانحدار التدريجي يشبه…" },
          choices: [
            { en: "A ball rolling downhill to the lowest error", ar: "كرة تتدحرج للأسفل نحو أقل خطأ" },
            { en: "Sorting a list", ar: "ترتيب قائمة" },
            { en: "Deleting data", ar: "حذف بيانات" },
          ],
          answer: 0,
          explain: {
            en: "It nudges the weights step by step in the direction that lowers error — rolling down the valley to the bottom.",
            ar: "يحرّك الأوزان خطوة خطوة في الاتجاه الذي يقلّل الخطأ — يتدحرج في الوادي نحو القاع.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- ML math = linear algebra (vectors), statistics (understanding data), calculus (gradient descent)
- The core concept is weights: a prediction is a weighted sum of inputs
- Training = finding the weights that minimize error
- You computed a real weighted prediction

**Next:** Machine Learning — putting these pieces together into a model that learns from examples.`,
        ar: `## الخلاصة

- رياضيات تعلّم الآلة = الجبر الخطي (المتجهات)، الإحصاء (فهم البيانات)، التفاضل (الانحدار التدريجي)
- المفهوم الجوهري هو الأوزان: التنبؤ مجموع مرجّح للمدخلات
- التدريب = إيجاد الأوزان التي تقلّل الخطأ
- حسبت تنبؤاً مرجّحاً حقيقياً

**التالي:** تعلّم الآلة — تجميع هذه القطع في نموذج يتعلّم من الأمثلة.`,
      },
    },
  ],
};
