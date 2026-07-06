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
      type: "text",
      body: {
        en: `## Data validation: the pipeline's seatbelt 🛡️

Building a pipeline that moves data is only half the job — a good data engineer also builds **checks** that stop bad data before it spreads. This is called **data validation** (or "data quality checks"), and it runs automatically every time new data flows through.

**Common checks you'll see in real pipelines:**
- **Schema checks** — does this row have the columns we expect, in the right types? (A "price" column suddenly full of text means something upstream broke.)
- **Range checks** — is a person's age between 0 and 120? Is a percentage between 0 and 100? Impossible values usually mean a bug, not reality.
- **Null checks** — did a required field (like a customer ID) come through empty? Missing keys silently break every join downstream.
- **Uniqueness checks** — do we have the same order ID twice? Duplicates quietly inflate totals.
- **Freshness checks** — did today's data actually arrive today, or is the pipeline stuck showing yesterday's numbers as if they were current?

**Why this matters more than it sounds:** a broken pipeline that *crashes* is annoying but safe — someone notices immediately. A broken pipeline that *silently* loads corrupted data is dangerous — it can feed a wrong number into an executive dashboard or a machine learning model for weeks before anyone notices. Modern tools like **Great Expectations** or **dbt tests** let engineers write these checks as code, so every pipeline run automatically verifies its own output before anyone downstream trusts it.

This is the disciplined half of "garbage in, garbage out": it's not enough to hope data is clean, you build automated guards that catch it when it isn't.`,
        ar: `## التحقق من صحة البيانات: حزام أمان خط الأنابيب 🛡️

بناء خط ينقل البيانات نصف المهمة فقط — مهندس البيانات الجيد يبني أيضاً **فحوصات** توقف البيانات السيئة قبل أن تنتشر. يُسمّى هذا **التحقق من صحة البيانات (data validation)**، ويعمل تلقائياً كل مرة تتدفق فيها بيانات جديدة عبر الخط.

**فحوصات شائعة تراها في خطوط حقيقية:**
- **فحص المخطط (Schema)** — هل يحتوي هذا الصف الأعمدة المتوقعة، بالأنواع الصحيحة؟ (عمود "السعر" ممتلئ فجأة بنص يعني أن شيئاً تعطّل في مصدر أعلى.)
- **فحص المدى** — هل عمر شخص بين 0 و120؟ هل نسبة مئوية بين 0 و100؟ القيم المستحيلة عادة تعني خطأً برمجياً لا واقعاً.
- **فحص القيم الفارغة** — هل وصل حقل مطلوب (كمعرّف العميل) فارغاً؟ المفاتيح المفقودة تكسر بصمت كل ربط لاحق.
- **فحص التفرّد** — هل لدينا نفس رقم الطلب مرتين؟ التكرارات تُضخّم الإجماليات بصمت.
- **فحص الحداثة** — هل وصلت بيانات اليوم فعلاً اليوم، أم أن الخط عالق يعرض أرقام الأمس كأنها حالية؟

**لماذا يهم هذا أكثر مما يبدو:** خط أنابيب معطّل *يتعطّل بوضوح* مزعج لكنه آمن — يلاحظه أحد فوراً. أما خط أنابيب معطّل *يُحمّل بصمت* بيانات فاسدة فخطير — يمكن أن يُغذّي رقماً خاطئاً للوحة تنفيذية أو نموذج تعلّم آلة لأسابيع قبل أن يلاحظ أحد. أدوات حديثة مثل **Great Expectations** أو **اختبارات dbt** تتيح للمهندسين كتابة هذه الفحوصات ككود، بحيث يتحقق كل تشغيل لخط الأنابيب تلقائياً من مخرجاته قبل أن يثق به أي أحد لاحقاً.

هذا هو النصف المنضبط من "المدخلات السيئة تعني مخرجات سيئة": لا يكفي أن تأمل أن تكون البيانات نظيفة، بل تبني حرّاساً آليين يمسكونها حين لا تكون كذلك.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Checklist: would this pipeline pass a review? ✅

Before trusting a data pipeline in production, a data engineer walks through checks like these:

1. **Does every run validate its output** (schema, range, null, uniqueness) before downstream tools touch it?
2. **Does it fail loudly, not silently?** An alert on failure beats a dashboard quietly showing stale or wrong numbers.
3. **Is the source of truth documented?** Anyone should be able to trace a number back to where it originated.
4. **Can it be re-run safely?** Running it twice on the same day shouldn't double-count anything.
5. **Is sensitive data (names, emails, payment info) handled with care** — masked or access-controlled, not just dumped raw into a lake?

You don't need to write a professional-grade pipeline to internalize this — just get in the habit of asking these questions any time you load a CSV in pandas: *do I actually know this data is clean, or am I hoping?*`,
        ar: `## قائمة تحقّق: هل يجتاز هذا الخط مراجعة؟ ✅

قبل الوثوق بخط بيانات في الإنتاج، يمرّ مهندس البيانات بفحوصات كهذه:

1. **هل يتحقّق كل تشغيل من مخرجاته** (مخطط، مدى، قيم فارغة، تفرّد) قبل أن تلمسها أدوات لاحقة؟
2. **هل يفشل بوضوح، لا بصمت؟** تنبيه عند الفشل أفضل من لوحة تعرض بهدوء أرقاماً قديمة أو خاطئة.
3. **هل مصدر الحقيقة موثّق؟** يجب أن يستطيع أي أحد تتبّع رقم إلى مصدره.
4. **هل يمكن إعادة تشغيله بأمان؟** تشغيله مرتين في نفس اليوم لا يجب أن يضاعف أي شيء.
5. **هل تُعامَل البيانات الحساسة (أسماء، بريد إلكتروني، معلومات دفع) بعناية** — مُموَّهة أو محكومة الوصول، لا مُلقاة خاماً في بحيرة؟

لست بحاجة لكتابة خط أنابيب احترافي لتستوعب هذا — فقط اعتد سؤال هذه الأسئلة كل مرة تُحمّل فيها CSV في pandas: *هل أعرف فعلاً أن هذه البيانات نظيفة، أم أنني آمل ذلك؟*`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the Mars Climate Orbiter unit mix-up 🔍

In 1999, NASA lost the **Mars Climate Orbiter**, a $125 million spacecraft, because of a data pipeline problem — not a dramatic one, a mundane one. One engineering team's software calculated thruster force in **pound-seconds** (imperial units); NASA's navigation team expected the values in **newton-seconds** (metric units). The two pieces of software passed numbers between each other with no unit check in between.

The mismatch was small enough on paper — the spacecraft still made it all the way to Mars — but it accumulated over months of navigation corrections until the orbiter approached the planet at the wrong altitude and was destroyed entering the atmosphere.

This is a textbook data engineering failure: two systems exchanged data without a **schema/unit validation** step confirming they agreed on what the numbers meant. It's the exact same category of bug as a modern pipeline silently loading a "price" column that switched from dollars to cents, or a date column that switched from MM/DD to DD/MM. The fix NASA adopted afterward — and the fix every data engineer builds today — is the same: **never trust that two systems agree on units, formats, or meaning; verify it automatically, every time.**`,
        ar: `## دراسة حالة واقعية: خلط الوحدات في مسبار المريخ المناخي 🔍

في 1999، فقدت ناسا **مسبار المريخ المناخي (Mars Climate Orbiter)**، مركبة فضائية بقيمة 125 مليون دولار، بسبب مشكلة في خط بيانات — ليست دراميّة، بل عادية. حسب فريق هندسي قوّة الدفع بوحدة **رطل-ثانية** (النظام الإمبراطوري)؛ بينما توقّع فريق الملاحة في ناسا القيم بوحدة **نيوتن-ثانية** (النظام المتري). مرّر البرنامجان الأرقام بينهما دون أي فحص وحدات بينهما.

كان الفارق صغيراً على الورق — فقد وصلت المركبة فعلاً إلى المريخ — لكنه تراكم عبر أشهر من تصحيحات الملاحة حتى اقتربت المركبة من الكوكب بارتفاع خاطئ ودُمّرت عند دخول الغلاف الجوي.

هذا فشل هندسة بيانات نموذجي: تبادل نظامان بيانات دون خطوة **تحقّق من المخطط/الوحدات** تؤكّد اتفاقهما على معنى الأرقام. إنها نفس فئة الخطأ تماماً كخط أنابيب حديث يُحمّل بصمت عمود "سعر" تحوّل من دولارات إلى سنتات، أو عمود تاريخ تحوّل من يوم/شهر إلى شهر/يوم. الحل الذي تبنّته ناسا لاحقاً — ونفس الحل الذي يبنيه كل مهندس بيانات اليوم — واحد: **لا تثق أبداً أن نظامين متفقان على الوحدات أو الصيغ أو المعنى؛ تحقّق من ذلك آلياً، في كل مرة.**`,
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
        {
          q: { en: "A pipeline loads a row where 'age' = 350. What check would catch this?", ar: "خط أنابيب يُحمّل صفاً فيه 'العمر' = 350. أي فحص يمسك هذا؟" },
          choices: [
            { en: "A range check (age should be 0–120)", ar: "فحص المدى (العمر يجب أن يكون 0–120)" },
            { en: "A uniqueness check", ar: "فحص التفرّد" },
            { en: "A freshness check", ar: "فحص الحداثة" },
          ],
          answer: 0,
          explain: {
            en: "Range checks catch impossible values before they corrupt downstream analysis or models.",
            ar: "فحوصات المدى تمسك القيم المستحيلة قبل أن تُفسد التحليل أو النماذج اللاحقة.",
          },
        },
        {
          q: { en: "What actually destroyed the Mars Climate Orbiter?", ar: "ما الذي دمّر فعلاً مسبار المريخ المناخي؟" },
          choices: [
            { en: "Two systems exchanged data using different units with no validation check", ar: "تبادل نظامان بيانات بوحدات مختلفة دون فحص تحقّق" },
            { en: "A meteor collision", ar: "اصطدام بنيزك" },
            { en: "A typo in the spacecraft's name", ar: "خطأ إملائي في اسم المركبة" },
          ],
          answer: 0,
          explain: {
            en: "Pound-seconds vs newton-seconds, passed between systems with no unit/schema check — a classic data engineering failure.",
            ar: "رطل-ثانية مقابل نيوتن-ثانية، مُمرَّرة بين نظامين دون فحص وحدات/مخطط — فشل هندسة بيانات كلاسيكي.",
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
- Data validation (schema, range, null, uniqueness, freshness checks) stops bad data before it spreads
- The Mars Climate Orbiter shows how an un-validated unit mismatch between systems can be catastrophic

**Next:** Business Intelligence — turning all this data into dashboards that drive decisions.`,
        ar: `## الخلاصة

- مهندسو البيانات يبنون الخطوط التي توصّل البيانات النظيفة
- ETL = استخراج ← تحويل ← تحميل
- المستودع (مهيكل، للتحليل) مقابل البحيرة (خام، رخيص، أي شكل)
- المدخلات السيئة تعني مخرجات سيئة — جودة البيانات تحدّ كل شيء
- التحقق من صحة البيانات (فحوصات المخطط، المدى، القيم الفارغة، التفرّد، الحداثة) يوقف البيانات السيئة قبل انتشارها
- مسبار المريخ المناخي يُظهر كيف يمكن لخلط وحدات غير مُتحقَّق منه بين نظامين أن يكون كارثياً

**التالي:** ذكاء الأعمال — تحويل كل هذه البيانات إلى لوحات تقود القرارات.`,
      },
    },
  ],
};
