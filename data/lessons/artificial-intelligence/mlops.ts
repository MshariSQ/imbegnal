import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "mlops",
  title: { en: "MLOps — From Notebook to Production", ar: "MLOps — من الدفتر إلى الإنتاج" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why a working model is only *half* the job
- What **MLOps** covers: deploy, monitor, retrain
- **Model drift** and why models get worse over time
- The lifecycle that keeps AI reliable`,
        ar: `## ماذا ستتعلم

- لماذا النموذج العامل هو *نصف* المهمة فقط
- ماذا يغطّي **MLOps**: النشر، المراقبة، إعادة التدريب
- **انجراف النموذج (drift)** ولماذا تسوء النماذج مع الوقت
- الدورة التي تُبقي الذكاء موثوقاً`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Building the car vs running the taxi fleet 🚕

Training a great model in a notebook is like building a beautiful car in a garage. **MLOps** is running the whole taxi fleet: getting cars on the road, keeping them fueled, spotting breakdowns, and replacing worn parts. It's DevOps (which you may have seen in the backend track) applied to machine learning.

A model that's 95% accurate in your notebook is worthless until it's **serving real users reliably**. MLOps covers everything after training:

- **Deployment** — wrap the model in an API so apps can send it data and get predictions (often in a Docker container — remember those?).
- **Monitoring** — track accuracy, speed, and errors in production. Is it still good *today*?
- **Versioning** — track model versions and the exact data each was trained on, so you can roll back a bad one.
- **Automation (CI/CD)** — pipelines that retrain, test, and redeploy without manual work.

**The sneaky problem: model drift.** Unlike normal code, a model can silently get *worse over time even if you never touch it* — because the *world* changes. A model trained on 2020 shopping habits degrades as fashions, prices, and behavior shift. The data it sees in production drifts away from its training data.

The fix is a **loop**, not a one-time launch:

\`\`\`
Train → Deploy → Monitor → (accuracy dropping?) → Retrain on fresh data → Deploy → ...
\`\`\`

This is why MLOps engineers are in demand: anyone can train a model from a tutorial, but keeping it accurate and reliable in production for years is the hard, valuable part.`,
        ar: `## بناء السيارة مقابل تشغيل أسطول الأجرة 🚕

تدريب نموذج ممتاز في دفتر مثل بناء سيارة جميلة في كراج. **MLOps** هو تشغيل أسطول الأجرة كله: إخراج السيارات للطريق، تزويدها بالوقود، رصد الأعطال، واستبدال الأجزاء البالية. إنه DevOps (الذي ربما رأيته في مسار الخلفية) مطبّقاً على تعلّم الآلة.

النموذج بدقة 95% في دفترك بلا قيمة حتى **يخدم مستخدمين حقيقيين بموثوقية**. MLOps يغطّي كل ما بعد التدريب:

- **النشر (Deployment)** — غلّف النموذج في API لترسل له التطبيقات بيانات وتحصل على تنبؤات (غالباً في حاوية Docker — تذكرها؟).
- **المراقبة (Monitoring)** — تتبّع الدقة والسرعة والأخطاء في الإنتاج. هل ما زال جيداً *اليوم*؟
- **الإصدارات (Versioning)** — تتبّع إصدارات النموذج والبيانات التي دُرّب عليها كل إصدار، لتتمكن من التراجع عن سيّئ.
- **الأتمتة (CI/CD)** — خطوط تعيد التدريب والاختبار والنشر دون عمل يدوي.

**المشكلة الخبيثة: انجراف النموذج (drift).** خلافاً للكود العادي، قد يسوء النموذج بصمت *مع الوقت حتى لو لم تلمسه* — لأن *العالم* يتغير. نموذج دُرّب على عادات تسوّق 2020 يتدهور مع تغيّر الموضة والأسعار والسلوك. البيانات التي يراها في الإنتاج تنجرف بعيداً عن بيانات تدريبه.

الحل **حلقة**، لا إطلاق لمرة واحدة:

\`\`\`
تدريب → نشر → مراقبة → (الدقة تنخفض؟) → إعادة تدريب على بيانات جديدة → نشر → ...
\`\`\`

لهذا مهندسو MLOps مطلوبون: أي أحد يدرّب نموذجاً من درس، لكن إبقاءه دقيقاً وموثوقاً في الإنتاج لسنوات هو الجزء الصعب القيّم.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Catching drift before users do: monitoring in practice 📊

Saying "monitor for drift" is easy; doing it means comparing numbers over time. The simplest and most common technique: track the **distribution** of the data the model sees in production, and compare it against the distribution it was trained on.

Concretely, teams often track simple summary statistics — like the **average** and **range** of a key input feature — computed on a rolling window of recent production data, and alert when they stray too far from the training-time baseline. For example, if a house-pricing model was trained when average house size was 150 m², and this month's incoming requests average 300 m², something has shifted in the population the model is seeing — maybe a new market segment, maybe a data pipeline bug. Either way, it's a signal to investigate before accuracy visibly degrades.

Beyond data drift, teams also run **A/B tests** when deploying a new model version: send a small percentage of real traffic to the new "challenger" model, keep most traffic on the proven "champion" model, and compare business metrics (not just accuracy) before fully rolling out. This protects against a model that looks great on a test set but behaves badly on real users.

None of this requires exotic tools to understand the *idea*: monitoring is fundamentally taking the statistics you learned about earlier in this track (averages, spread) and running them continuously in production instead of once during training.`,
        ar: `## رصد الانجراف قبل أن يرصده المستخدمون: المراقبة عملياً 📊

قول "راقب الانجراف" سهل؛ فعله يعني مقارنة أرقام عبر الوقت. الأسلوب الأبسط والأشيع: تتبّع **توزيع** البيانات التي يراها النموذج في الإنتاج، ومقارنته بالتوزيع الذي دُرّب عليه.

عملياً، تتبّع الفرق غالباً إحصاءات ملخّصة بسيطة — كـ**المتوسط** و**المدى** لسمة مدخل رئيسية — محسوبة على نافذة متحرّكة من بيانات الإنتاج الحديثة، وتنبّه حين تبتعد كثيراً عن خط الأساس وقت التدريب. مثلاً، إذا دُرّب نموذج تسعير منازل حين كان متوسط مساحة المنزل 150 م²، وطلبات هذا الشهر متوسطها 300 م²، فقد تغيّر شيء في المجتمع الذي يراه النموذج — ربما شريحة سوق جديدة، أو ربما خلل في خط أنابيب البيانات. في الحالتين، إنها إشارة للتحقيق قبل أن تتدهور الدقة بشكل ملحوظ.

إلى جانب انجراف البيانات، تُجري الفرق أيضاً **اختبارات A/B** عند نشر إصدار نموذج جديد: أرسل نسبة صغيرة من الحركة الحقيقية إلى النموذج "المتحدي" الجديد، وأبقِ معظم الحركة على النموذج "البطل" المُثبت، وقارن مقاييس العمل (لا الدقة فقط) قبل النشر الكامل. هذا يحمي من نموذج يبدو رائعاً على مجموعة اختبار لكن يتصرّف بشكل سيئ مع مستخدمين حقيقيين.

لا شيء من هذا يحتاج أدوات غريبة لفهم *الفكرة*: المراقبة في جوهرها أخذ الإحصاءات التي تعلّمتها سابقاً في هذا المسار (المتوسطات، التشتت) وتشغيلها باستمرار في الإنتاج بدلاً من مرة واحدة أثناء التدريب.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Write a tiny drift detector. Write \`has_drifted(training_avg, production_values, threshold)\` that:
1. Computes the average of \`production_values\`
2. Returns \`True\` if the absolute difference between that average and \`training_avg\` is greater than \`threshold\`, otherwise \`False\`

Example: \`has_drifted(150, [280, 300, 320], 50)\` → production average is 300, difference from 150 is 150, which is > 50 → \`True\``,
        ar: `اكتب كاشف انجراف مصغّراً. اكتب \`has_drifted(training_avg, production_values, threshold)\`:
1. يحسب متوسط \`production_values\`
2. يعيد \`True\` إذا كان الفرق المطلق بين ذلك المتوسط و\`training_avg\` أكبر من \`threshold\`، وإلا \`False\`

مثال: \`has_drifted(150, [280, 300, 320], 50)\` ← متوسط الإنتاج 300، والفرق عن 150 هو 150، وهو > 50 ← \`True\``,
      },
      starterCode: `def has_drifted(training_avg, production_values, threshold):
    prod_avg = sum(production_values) / len(production_values)
    # compare abs(prod_avg - training_avg) to threshold
    return False

print(has_drifted(150, [280, 300, 320], 50))  # True
print(has_drifted(150, [140, 155, 160], 50))  # False`,
      solution: `def has_drifted(training_avg, production_values, threshold):
    prod_avg = sum(production_values) / len(production_values)
    return abs(prod_avg - training_avg) > threshold

print(has_drifted(150, [280, 300, 320], 50))  # True
print(has_drifted(150, [140, 155, 160], 50))  # False`,
      hints: [
        { en: `Python's abs() gives the absolute value: abs(prod_avg - training_avg)`, ar: `abs() في بايثون تعطي القيمة المطلقة: abs(prod_avg - training_avg)` },
        { en: `Return the comparison directly: return abs(prod_avg - training_avg) > threshold`, ar: `أعِد المقارنة مباشرة: return abs(prod_avg - training_avg) > threshold` },
      ],
      tests: [
        { name: { en: "Detects real drift", ar: "يكتشف الانجراف الحقيقي" }, check: `assert has_drifted(150, [280,300,320], 50) == True` },
        { name: { en: "No drift when values are close", ar: "لا انجراف عندما القيم متقاربة" }, check: `assert has_drifted(150, [140,155,160], 50) == False` },
        { name: { en: "Boundary is exclusive (equal to threshold is not drift)", ar: "الحد الفاصل غير شامل (يساوي الحد ليس انجرافاً)" }, check: `assert has_drifted(100, [150,150,150], 50) == False` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Zillow's home-buying algorithm 🔍

Zillow, the online real-estate company, ran a program called **Zillow Offers** that used a machine learning model — nicknamed internally as a pricing algorithm — to make instant cash offers on homes, aiming to buy, lightly renovate, and resell them for a profit. The model estimated a home's future sale price to decide how much to bid.

In late 2021, Zillow shut the entire program down and took a massive financial write-down, after the algorithm had been systematically overpaying for homes. Housing market conditions shifted quickly and unpredictably during that period, and the model's price predictions hadn't kept pace with the changing reality on the ground — the exact **model drift** problem from this lesson, except each wrong prediction meant overpaying for an actual house, not just a wrong label in a spreadsheet.

The company had to lay off a large share of the division's staff and absorb hundreds of millions of dollars in losses on homes purchased above what they could resell them for. Zillow's own leadership publicly acknowledged that the algorithm's error rate had been wider than anticipated and that they'd been unable to accurately forecast home prices amid unprecedented market conditions.

This is one of the most vivid, well-documented illustrations of why MLOps — continuous monitoring, and the willingness to catch and react to drift fast — is not a "nice to have." When a model quietly stops matching reality and nobody catches it in time, the cost isn't an abstract accuracy metric; real money, real houses, and real jobs are on the line.`,
        ar: `## دراسة حالة واقعية: خوارزمية شراء المنازل لدى Zillow 🔍

شغّلت Zillow، شركة العقارات الإلكترونية، برنامجاً يسمى **Zillow Offers** استخدم نموذج تعلّم آلة — يُلقَّب داخلياً بخوارزمية التسعير — لتقديم عروض نقدية فورية لشراء منازل، بهدف الشراء وتجديدها قليلاً وإعادة بيعها بربح. قدّر النموذج سعر بيع المنزل المستقبلي لتحديد قيمة العرض.

في أواخر 2021، أغلقت Zillow البرنامج بالكامل وسجّلت خسارة مالية ضخمة، بعد أن كانت الخوارزمية تدفع أكثر من اللازم لشراء المنازل بشكل منهجي. تغيّرت ظروف سوق الإسكان بسرعة وبشكل غير متوقّع خلال تلك الفترة، ولم تواكب تنبؤات أسعار النموذج الواقع المتغيّر على الأرض — بالضبط مشكلة **انجراف النموذج** من هذا الدرس، إلا أن كل تنبؤ خاطئ عنى دفع مبلغ زائد لمنزل حقيقي، لا مجرد وسم خاطئ في جدول بيانات.

اضطرت الشركة لتسريح جزء كبير من موظفي القسم واستيعاب خسائر بمئات ملايين الدولارات على منازل اشترتها بأكثر مما تستطيع بيعها به. اعترفت قيادة Zillow نفسها علناً بأن معدّل خطأ الخوارزمية كان أوسع من المتوقع وأنهم عجزوا عن توقّع أسعار المنازل بدقة وسط ظروف سوق غير مسبوقة.

هذه من أوضح الأمثلة الموثّقة جيداً على لماذا MLOps — المراقبة المستمرة، والاستعداد لرصد الانجراف والاستجابة له بسرعة — ليست "ميزة إضافية". حين يتوقف نموذج بصمت عن مطابقة الواقع ولا يرصده أحد في الوقت المناسب، لا تكون التكلفة مقياس دقة مجرداً؛ بل أموال حقيقية ومنازل حقيقية ووظائف حقيقية على المحك.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What does MLOps cover?", ar: "ماذا يغطّي MLOps؟" },
          choices: [
            { en: "Everything after training: deploy, monitor, version, retrain", ar: "كل ما بعد التدريب: نشر، مراقبة، إصدارات، إعادة تدريب" },
            { en: "Only training the model", ar: "تدريب النموذج فقط" },
            { en: "Designing the website UI", ar: "تصميم واجهة الموقع" },
          ],
          answer: 0,
          explain: {
            en: "MLOps is DevOps for ML — turning a trained model into a reliable, monitored, maintainable production service.",
            ar: "MLOps هو DevOps لتعلّم الآلة — تحويل نموذج مدرّب إلى خدمة إنتاج موثوقة ومراقَبة وقابلة للصيانة.",
          },
        },
        {
          q: { en: "What is model drift?", ar: "ما هو انجراف النموذج؟" },
          choices: [
            { en: "A model getting less accurate over time as the world changes", ar: "نموذج تقلّ دقته مع الوقت بتغيّر العالم" },
            { en: "The model file moving folders", ar: "انتقال ملف النموذج بين المجلدات" },
            { en: "A faster training method", ar: "طريقة تدريب أسرع" },
          ],
          answer: 0,
          explain: {
            en: "Real-world data shifts away from the training data, so accuracy silently degrades — even with unchanged code.",
            ar: "بيانات العالم الحقيقي تنجرف عن بيانات التدريب، فتتدهور الدقة بصمت — حتى بكود لم يتغيّر.",
          },
        },
        {
          q: { en: "How do teams fight model drift?", ar: "كيف تكافح الفرق انجراف النموذج؟" },
          choices: [
            { en: "Monitor accuracy and retrain on fresh data periodically", ar: "مراقبة الدقة وإعادة التدريب على بيانات جديدة دورياً" },
            { en: "Never touch the model again", ar: "عدم لمس النموذج أبداً مجدداً" },
            { en: "Delete the model", ar: "حذف النموذج" },
          ],
          answer: 0,
          explain: {
            en: "ML is a loop: monitor → detect drop → retrain on recent data → redeploy. Deployment is the start, not the finish.",
            ar: "تعلّم الآلة حلقة: مراقبة ← رصد الانخفاض ← إعادة تدريب على بيانات حديثة ← إعادة نشر. النشر البداية لا النهاية.",
          },
        },
        {
          q: { en: "What is an A/B test used for when deploying a new model version?", ar: "لماذا يُستخدم اختبار A/B عند نشر إصدار نموذج جديد؟" },
          choices: [
            { en: "Sending a small share of real traffic to the new model and comparing results before a full rollout", ar: "إرسال حصة صغيرة من الحركة الحقيقية للنموذج الجديد ومقارنة النتائج قبل النشر الكامل" },
            { en: "Testing the model's code for syntax errors", ar: "اختبار كود النموذج بحثاً عن أخطاء صياغية" },
            { en: "Deleting the old model immediately", ar: "حذف النموذج القديم فوراً" },
          ],
          answer: 0,
          explain: {
            en: "A/B testing protects against a model that scores well offline but behaves badly with real users, by comparing champion vs. challenger on live traffic.",
            ar: "اختبار A/B يحمي من نموذج يسجّل جيداً دون اتصال لكن يتصرّف بسوء مع مستخدمين حقيقيين، بمقارنة البطل مقابل المتحدي على حركة حية.",
          },
        },
        {
          q: { en: "What ultimately went wrong with Zillow's home-buying algorithm (Zillow Offers)?", ar: "ما الذي حدث في النهاية بخوارزمية شراء المنازل لدى Zillow (Zillow Offers)؟" },
          choices: [
            { en: "The model's price predictions didn't keep up with fast-shifting housing market conditions, causing systematic overpaying", ar: "تنبؤات أسعار النموذج لم تواكب تغيّرات سوق الإسكان السريعة، ما سبّب دفع مبالغ زائدة بشكل منهجي" },
            { en: "The website's servers crashed permanently", ar: "انهارت خوادم الموقع بشكل دائم" },
            { en: "The algorithm refused to make any offers at all", ar: "رفضت الخوارزمية تقديم أي عروض إطلاقاً" },
          ],
          answer: 0,
          explain: {
            en: "This was model drift in the real world: predictions trained on older market data stopped matching a rapidly changing market, leading to major financial losses and the program's shutdown.",
            ar: "كان هذا انجراف نموذج في الواقع: توقّفت تنبؤات مدرَّبة على بيانات سوق أقدم عن مطابقة سوق يتغيّر بسرعة، ما أدى لخسائر مالية كبيرة وإغلاق البرنامج.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A trained model is only half the job; MLOps runs it in production
- Covers deployment, monitoring, versioning, and automated retraining
- Model drift makes models silently decay — fight it with a monitor→retrain loop
- Monitoring in practice means tracking data statistics (like averages) over time and using A/B tests before a full model rollout
- MLOps = DevOps for machine learning
- You wrote a real drift-detection function
- Case study: Zillow's home-buying algorithm shows the real financial cost of undetected model drift

**Next:** Generative AI — the models that create text, images, and code.`,
        ar: `## الخلاصة

- النموذج المدرّب نصف المهمة؛ وMLOps يشغّله في الإنتاج
- يغطّي النشر والمراقبة والإصدارات وإعادة التدريب الآلية
- انجراف النموذج يجعل النماذج تتحلّل بصمت — كافحه بحلقة مراقبة←إعادة تدريب
- المراقبة عملياً تعني تتبّع إحصاءات البيانات (كالمتوسطات) عبر الوقت واستخدام اختبارات A/B قبل النشر الكامل للنموذج
- MLOps = DevOps لتعلّم الآلة
- كتبت دالة كشف انجراف حقيقية
- دراسة الحالة: خوارزمية شراء المنازل لدى Zillow تُظهر التكلفة المالية الحقيقية لانجراف نموذج لم يُرصد

**التالي:** الذكاء التوليدي — النماذج التي تنشئ النصوص والصور والكود.`,
      },
    },
  ],
};
