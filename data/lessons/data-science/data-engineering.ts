import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "data-engineering",
  title: { en: "Data Engineering — The Plumbing of Data", ar: "هندسة البيانات — سباكة البيانات" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What data engineers do (and why data scientists depend on them)
- **ETL**: Extract, Transform, Load
- Data warehouses vs data lakes
- Why "garbage in, garbage out" rules everything`,
        ar: `## ماذا ستتعلم

- ماذا يفعل مهندسو البيانات (ولماذا يعتمد عليهم علماء البيانات)
- **ETL**: استخراج، تحويل، تحميل
- مستودعات البيانات مقابل بحيرات البيانات
- لماذا تحكم "المدخلات السيئة تعني مخرجات سيئة" كل شيء`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The water system behind the tap 🚰

When a data scientist opens clean data in pandas, someone built the plumbing that delivered it. That someone is a **data engineer**. Data scientists *use* data; data engineers *move and prepare* it at scale — building the pipes so clean water reaches every tap.

The core pattern is **ETL** (or its modern cousin ELT):

- **Extract** — pull raw data from many sources: app databases, APIs, log files, spreadsheets, sensors.
- **Transform** — clean and reshape it: fix missing values, standardize formats (is it "USA", "U.S.", or "United States"?), join sources together, remove duplicates.
- **Load** — put the clean result somewhere analysts can use it.

That "somewhere" is usually one of two:
- **Data warehouse** — highly organized, structured storage optimized for analytics queries (like a tidy library with a strict catalog). Tools: Snowflake, BigQuery.
- **Data lake** — stores raw data of *any* shape (structured or not) cheaply, to be processed later (like a giant storage unit). Good for huge, varied, or not-yet-defined data.

**Why this matters to you:** the famous rule is **"garbage in, garbage out."** The fanciest ML model trained on messy, wrong data produces confident nonsense. Studies say data scientists spend up to 80% of their time on data prep for exactly this reason. A good data engineer makes that faster and more reliable — which is why data engineering is one of the best-paid, most in-demand roles in the whole field.`,
        ar: `## نظام المياه خلف الصنبور 🚰

حين يفتح عالِم بيانات بيانات نظيفة في pandas، شخص ما بنى السباكة التي أوصلتها. ذلك الشخص **مهندس بيانات**. علماء البيانات *يستخدمون* البيانات؛ ومهندسو البيانات *ينقلونها ويهيّئونها* على نطاق واسع — يبنون الأنابيب ليصل الماء النظيف لكل صنبور.

النمط الأساسي **ETL** (أو قريبه الحديث ELT):

- **الاستخراج (Extract)** — سحب البيانات الخام من مصادر كثيرة: قواعد التطبيقات، APIs، ملفات السجلّات، جداول البيانات، الحسّاسات.
- **التحويل (Transform)** — تنظيفها وإعادة تشكيلها: إصلاح القيم الناقصة، توحيد الصيغ (أهي "USA" أم "U.S." أم "United States"؟)، دمج المصادر، إزالة التكرارات.
- **التحميل (Load)** — وضع النتيجة النظيفة حيث يستخدمها المحلّلون.

ذلك "الحيث" عادة أحد اثنين:
- **مستودع البيانات (Warehouse)** — تخزين منظّم مهيكل محسّن لاستعلامات التحليل (كمكتبة مرتّبة بفهرس صارم). أدوات: Snowflake، BigQuery.
- **بحيرة البيانات (Lake)** — تخزّن بيانات خام بـ*أي* شكل (مهيكلة أو لا) بثمن رخيص، لتُعالج لاحقاً (كمخزن ضخم). جيدة للبيانات الهائلة أو المتنوعة أو غير المعرّفة بعد.

**لماذا يهمّك:** القاعدة الشهيرة **"المدخلات السيئة تعني مخرجات سيئة."** أفخم نموذج ML مدرّب على بيانات فوضوية خاطئة ينتج هراءً واثقاً. تقول الدراسات إن علماء البيانات يقضون حتى 80% من وقتهم على تهيئة البيانات لهذا السبب بالضبط. مهندس البيانات الجيد يجعل ذلك أسرع وأوثق — ولهذا هندسة البيانات من أفضل الأدوار أجراً وأكثرها طلباً في المجال كله.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What does ETL stand for?", ar: "ماذا تعني ETL؟" },
          choices: [
            { en: "Extract, Transform, Load", ar: "استخراج، تحويل، تحميل" },
            { en: "Enter, Test, Leave", ar: "دخول، اختبار، خروج" },
            { en: "Export, Type, Link", ar: "تصدير، كتابة، ربط" },
          ],
          answer: 0,
          explain: {
            en: "Extract raw data → Transform (clean/reshape) → Load into a warehouse/lake. The core data pipeline pattern.",
            ar: "استخرج البيانات الخام ← حوّل (نظّف/أعد التشكيل) ← حمّل إلى مستودع/بحيرة. نمط خط البيانات الأساسي.",
          },
        },
        {
          q: { en: "A data warehouse vs a data lake — key difference?", ar: "مستودع البيانات مقابل بحيرة البيانات — الفرق الأساسي؟" },
          choices: [
            { en: "Warehouse = structured/organized; lake = raw data of any shape", ar: "المستودع = مهيكل/منظّم؛ والبحيرة = بيانات خام بأي شكل" },
            { en: "They're identical", ar: "متطابقان" },
            { en: "A lake only stores water data", ar: "البحيرة تخزّن بيانات المياه فقط" },
          ],
          answer: 0,
          explain: {
            en: "Warehouses hold clean, structured data for fast analytics; lakes cheaply hold raw, varied data to process later.",
            ar: "المستودعات تحفظ بيانات نظيفة مهيكلة لتحليل سريع؛ والبحيرات تحفظ بيانات خام متنوعة بثمن رخيص لمعالجة لاحقة.",
          },
        },
        {
          q: { en: "Why is 'garbage in, garbage out' so important?", ar: "لماذا 'المدخلات السيئة تعني مخرجات سيئة' مهمة جداً؟" },
          choices: [
            { en: "Even the best model gives wrong answers if fed messy/wrong data", ar: "حتى أفضل نموذج يعطي إجابات خاطئة إن غُذّي ببيانات فوضوية/خاطئة" },
            { en: "It only applies to spreadsheets", ar: "تنطبق على جداول البيانات فقط" },
            { en: "Garbage data trains faster", ar: "البيانات السيئة تتدرّب أسرع" },
          ],
          answer: 0,
          explain: {
            en: "Model quality is capped by data quality. That's why data prep dominates the workflow and data engineers are vital.",
            ar: "جودة النموذج مقيّدة بجودة البيانات. لهذا تهيمن تهيئة البيانات على سير العمل ومهندسو البيانات أساسيون.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Data engineers build the pipelines that deliver clean data
- ETL = Extract → Transform → Load
- Warehouse (structured, for analytics) vs Lake (raw, cheap, any shape)
- Garbage in, garbage out — data quality caps everything

**Next:** Business Intelligence — turning all this data into dashboards that drive decisions.`,
        ar: `## الخلاصة

- مهندسو البيانات يبنون الخطوط التي توصّل البيانات النظيفة
- ETL = استخراج ← تحويل ← تحميل
- المستودع (مهيكل، للتحليل) مقابل البحيرة (خام، رخيص، أي شكل)
- المدخلات السيئة تعني مخرجات سيئة — جودة البيانات تحدّ كل شيء

**التالي:** ذكاء الأعمال — تحويل كل هذه البيانات إلى لوحات تقود القرارات.`,
      },
    },
  ],
};
