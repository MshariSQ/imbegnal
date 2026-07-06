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
      type: "text",
      body: {
        en: `## Comparing two vectors: dot products and similarity 🧭

You now know a vector is just a list of numbers describing something. But ML constantly needs to answer a different question: **how similar are two vectors?** "Is this new email like the spam ones I've seen? Is this product similar to ones this customer already liked?"

The building block is the **dot product**: multiply the matching entries of two vectors together, then add up the results. You've actually already computed one — the weighted sum from a moment ago (\`price = size×1000 + bedrooms×5000 + ...\`) *is* a dot product between a "features" vector and a "weights" vector!

\`\`\`
a = [1, 2, 3]
b = [4, 5, 6]
dot(a, b) = (1×4) + (2×5) + (3×6) = 4 + 10 + 18 = 32
\`\`\`

On its own, the dot product's *size* is hard to interpret — it grows just because vectors are long or have big numbers. So ML usually uses **cosine similarity**: the dot product divided by the lengths of both vectors, which rescales the result to always sit between **-1 and 1**:

- **1** → the vectors point in exactly the same direction (very similar)
- **0** → no relationship (at right angles)
- **-1** → pointing in opposite directions (very different)

This one number is how a search engine finds the passage most relevant to your question, how a recommendation system finds "customers like you," and how an embedding lesson later will measure whether "king" and "queen" are close in meaning. Same math, everywhere: multiply matching entries, add them up, then rescale.`,
        ar: `## مقارنة متجهين: الجداء النقطي والتشابه 🧭

تعرف الآن أن المتجه مجرد قائمة أرقام تصف شيئاً. لكن تعلّم الآلة يحتاج باستمرار للإجابة عن سؤال مختلف: **ما مدى تشابه متجهين؟** "هل هذا البريد الجديد يشبه رسائل الإزعاج التي رأيتها؟ هل هذا المنتج يشبه ما أعجب هذا العميل من قبل؟"

اللبنة الأساسية هي **الجداء النقطي (dot product)**: اضرب المدخلات المتقابلة لمتجهين، ثم اجمع النتائج. لقد حسبت واحداً بالفعل — المجموع المرجّح قبل قليل (\`price = size×1000 + bedrooms×5000 + ...\`) *هو* جداء نقطي بين متجه "سمات" ومتجه "أوزان"!

\`\`\`
a = [1, 2, 3]
b = [4, 5, 6]
dot(a, b) = (1×4) + (2×5) + (3×6) = 4 + 10 + 18 = 32
\`\`\`

بمفرده، *حجم* الجداء النقطي صعب التفسير — يكبر لمجرد أن المتجهات طويلة أو أرقامها كبيرة. لذا يستخدم تعلّم الآلة عادة **تشابه جيب التمام (cosine similarity)**: الجداء النقطي مقسوماً على طولي المتجهين، ما يعيد تحجيم النتيجة لتقع دائماً بين **-1 و1**:

- **1** ← المتجهان يشيران لنفس الاتجاه تماماً (متشابهان جداً)
- **0** ← لا علاقة (بزاوية قائمة)
- **-1** ← يشيران لاتجاهين متعاكسين (مختلفان جداً)

هذا الرقم الواحد هو كيف يجد محرك بحث الفقرة الأكثر صلة بسؤالك، وكيف يجد نظام توصية "عملاء مثلك"، وكيف سيقيس درس embeddings لاحقاً هل "king" و"queen" متقاربان في المعنى. نفس الرياضيات، في كل مكان: اضرب المدخلات المتقابلة، اجمعها، ثم أعد التحجيم.`,
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
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Write \`dot_product(a, b)\` for two equal-length lists of numbers: multiply matching entries and sum the results. This is the exact operation behind similarity search and recommendation systems.

Example: \`dot_product([1, 2, 3], [4, 5, 6])\` → \`32\``,
        ar: `اكتب \`dot_product(a, b)\` لقائمتين متساويتي الطول من الأرقام: اضرب المدخلات المتقابلة واجمع النتائج. هذه بالضبط العملية خلف بحث التشابه وأنظمة التوصية.

مثال: \`dot_product([1, 2, 3], [4, 5, 6])\` ← \`32\``,
      },
      starterCode: `def dot_product(a, b):
    total = 0
    # for each pair (x, y) in zip(a, b): total += x * y
    return total

print(dot_product([1, 2, 3], [4, 5, 6]))  # 32`,
      solution: `def dot_product(a, b):
    total = 0
    for x, y in zip(a, b):
        total += x * y
    return total

print(dot_product([1, 2, 3], [4, 5, 6]))  # 32`,
      hints: [
        { en: `Pair up the two lists with zip(a, b): for x, y in zip(a, b):`, ar: `زاوج القائمتين بـ zip(a, b): for x, y in zip(a, b):` },
        { en: `Add x * y to total on each iteration.`, ar: `أضف x * y إلى total في كل تكرار.` },
      ],
      tests: [
        { name: { en: "The example gives 32", ar: "المثال يعطي 32" }, check: `assert dot_product([1,2,3],[4,5,6]) == 32` },
        { name: { en: "All-zero vector gives 0", ar: "متجه صفري يعطي 0" }, check: `assert dot_product([0,0,0],[1,2,3]) == 0` },
        { name: { en: "Single-element vectors work", ar: "متجهات بعنصر واحد تعمل" }, check: `assert dot_product([5],[3]) == 15` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: recommendation systems 🔍

When Netflix, Spotify, or Amazon suggest "you might also like," they aren't magic — they're mostly vector similarity at massive scale. Each user gets turned into a vector describing their taste (learned from what they watched, played, or bought), and each item gets turned into a vector describing its characteristics. Finding good recommendations becomes a search for items whose vectors have the highest cosine similarity to a user's vector.

This approach was proven at industrial scale during the well-documented **Netflix Prize** (2006–2009): Netflix publicly released a dataset of movie ratings and offered $1,000,000 to any team that could improve their recommendation accuracy by 10%. Thousands of teams competed for nearly three years; the winning approaches leaned heavily on representing users and movies as vectors in a shared "taste space" and measuring their similarity — the same dot-product idea from this lesson, just with far more dimensions and far more data.

The takeaway: a concept as simple as "multiply matching numbers, add them up, rescale" — something you just implemented in a few lines of Python — is the mathematical core of one of the most commercially valuable ideas in modern software.`,
        ar: `## دراسة حالة واقعية: أنظمة التوصية 🔍

حين تقترح Netflix أو Spotify أو Amazon "قد يعجبك أيضاً"، فهي ليست سحراً — بل غالباً تشابه متجهات على نطاق هائل. يتحوّل كل مستخدم إلى متجه يصف ذوقه (متعلَّم مما شاهده أو استمع إليه أو اشتراه)، ويتحوّل كل عنصر إلى متجه يصف خصائصه. إيجاد توصيات جيدة يصبح بحثاً عن عناصر متجهاتها الأعلى تشابه جيب تمام مع متجه المستخدم.

أُثبت هذا النهج على نطاق صناعي خلال **جائزة Netflix** الموثّقة جيداً (2006–2009): أصدرت Netflix علناً بيانات تقييمات أفلام وعرضت مليون دولار لأي فريق يحسّن دقة توصياتها بنسبة 10%. تنافست آلاف الفرق قرابة ثلاث سنوات؛ اعتمدت الأساليب الفائزة بشدة على تمثيل المستخدمين والأفلام كمتجهات في "فضاء ذوق" مشترك وقياس تشابهها — نفس فكرة الجداء النقطي من هذا الدرس، لكن بأبعاد وبيانات أكثر بكثير.

الخلاصة: مفهوم بسيط مثل "اضرب الأرقام المتقابلة، اجمعها، أعد التحجيم" — شيء نفّذته للتو في أسطر قليلة من بايثون — هو الجوهر الرياضي لواحدة من أكثر الأفكار قيمة تجارية في البرمجيات الحديثة.`,
      },
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
        {
          q: { en: "What does the dot product of two vectors compute?", ar: "ماذا يحسب الجداء النقطي لمتجهين؟" },
          choices: [
            { en: "Multiply matching entries together, then add up the results", ar: "اضرب المدخلات المتقابلة معاً، ثم اجمع النتائج" },
            { en: "Subtract one vector from the other", ar: "اطرح متجهاً من الآخر" },
            { en: "Sort both vectors", ar: "رتّب المتجهين" },
          ],
          answer: 0,
          explain: {
            en: "dot([1,2,3],[4,5,6]) = 1×4 + 2×5 + 3×6 = 32 — the same weighted-sum math used throughout ML.",
            ar: "dot([1,2,3],[4,5,6]) = 1×4 + 2×5 + 3×6 = 32 — نفس رياضيات المجموع المرجّح المستخدمة في تعلّم الآلة كله.",
          },
        },
        {
          q: { en: "A cosine similarity of 1 between two vectors means…", ar: "تشابه جيب تمام يساوي 1 بين متجهين يعني…" },
          choices: [
            { en: "They point in exactly the same direction — very similar", ar: "يشيران لنفس الاتجاه تماماً — متشابهان جداً" },
            { en: "They are completely unrelated", ar: "لا علاقة بينهما إطلاقاً" },
            { en: "One of them contains an error", ar: "أحدهما يحتوي خطأ" },
          ],
          answer: 0,
          explain: {
            en: "Cosine similarity rescales the dot product to between -1 and 1; 1 means maximum similarity, 0 means unrelated, -1 means opposite.",
            ar: "تشابه جيب التمام يعيد تحجيم الجداء النقطي بين -1 و1؛ 1 يعني أقصى تشابه، و0 يعني لا علاقة، و-1 يعني تعاكساً.",
          },
        },
        {
          q: { en: "What did the Netflix Prize competition rely on mathematically?", ar: "على ماذا اعتمدت مسابقة جائزة Netflix رياضياً؟" },
          choices: [
            { en: "Representing users and movies as vectors and measuring their similarity", ar: "تمثيل المستخدمين والأفلام كمتجهات وقياس تشابهها" },
            { en: "Manually written if/else rules for each movie", ar: "قواعد if/else مكتوبة يدوياً لكل فيلم" },
            { en: "Random guessing improved over time", ar: "تخمين عشوائي تحسّن مع الوقت" },
          ],
          answer: 0,
          explain: {
            en: "Winning teams placed users and movies in a shared vector 'taste space' and used similarity — the same dot-product idea, at scale.",
            ar: "وضعت الفرق الفائزة المستخدمين والأفلام في 'فضاء ذوق' متجهي مشترك واستخدمت التشابه — نفس فكرة الجداء النقطي، على نطاق واسع.",
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
- The dot product measures alignment between vectors; cosine similarity rescales it to -1..1
- You computed a real weighted prediction and a real dot product
- Case study: the Netflix Prize showed vector similarity is the mathematical core of recommendation systems

**Next:** Machine Learning — putting these pieces together into a model that learns from examples.`,
        ar: `## الخلاصة

- رياضيات تعلّم الآلة = الجبر الخطي (المتجهات)، الإحصاء (فهم البيانات)، التفاضل (الانحدار التدريجي)
- المفهوم الجوهري هو الأوزان: التنبؤ مجموع مرجّح للمدخلات
- التدريب = إيجاد الأوزان التي تقلّل الخطأ
- الجداء النقطي يقيس التوافق بين متجهين؛ وتشابه جيب التمام يعيد تحجيمه بين -1 و1
- حسبت تنبؤاً مرجّحاً حقيقياً وجداءً نقطياً حقيقياً
- دراسة الحالة: جائزة Netflix أظهرت أن تشابه المتجهات هو الجوهر الرياضي لأنظمة التوصية

**التالي:** تعلّم الآلة — تجميع هذه القطع في نموذج يتعلّم من الأمثلة.`,
      },
    },
  ],
};
