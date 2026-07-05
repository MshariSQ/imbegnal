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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A trained model is only half the job; MLOps runs it in production
- Covers deployment, monitoring, versioning, and automated retraining
- Model drift makes models silently decay — fight it with a monitor→retrain loop
- MLOps = DevOps for machine learning

**Next:** Generative AI — the models that create text, images, and code.`,
        ar: `## الخلاصة

- النموذج المدرّب نصف المهمة؛ وMLOps يشغّله في الإنتاج
- يغطّي النشر والمراقبة والإصدارات وإعادة التدريب الآلية
- انجراف النموذج يجعل النماذج تتحلّل بصمت — كافحه بحلقة مراقبة←إعادة تدريب
- MLOps = DevOps لتعلّم الآلة

**التالي:** الذكاء التوليدي — النماذج التي تنشئ النصوص والصور والكود.`,
      },
    },
  ],
};
