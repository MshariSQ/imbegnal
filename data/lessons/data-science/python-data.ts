import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "python-data",
  title: { en: "Python for Data — Meet pandas", ar: "بايثون للبيانات — تعرّف على pandas" },
  estMinutes: 40,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What **pandas** is and why data scientists live in it
- DataFrames: the spreadsheet in code
- Filtering, grouping, and aggregating data
- You'll analyze a real dataset in Python`,
        ar: `## ماذا ستتعلم

- ما هي **pandas** ولماذا يعيش علماء البيانات فيها
- الـ DataFrames: جدول البيانات في الكود
- تصفية البيانات وتجميعها وتلخيصها
- ستحلّل مجموعة بيانات حقيقية ببايثون`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Excel with superpowers 🐼

Data scientists spend most of their time not on fancy AI, but on **cleaning and exploring data**. Their tool is **pandas** — a Python library that's like Excel, but programmable and able to handle millions of rows.

The star is the **DataFrame**: a table with named columns and rows, just like a spreadsheet.

\`\`\`python
import pandas as pd

df = pd.DataFrame({
    "name": ["Sara", "Omar", "Lina"],
    "age":  [25, 30, 22],
    "city": ["Riyadh", "Jeddah", "Riyadh"],
})

df.head()          # peek at the first rows
df["age"].mean()   # 25.67 — average age in one line
df[df["age"] > 24] # only rows where age > 24 (filtering)
df.groupby("city").size()   # count people per city
\`\`\`

Look how much that does in so little code. The everyday moves:
- **Select** a column: \`df["age"]\`
- **Filter** rows: \`df[df["age"] > 24]\` — keep only matching rows
- **Group + aggregate**: \`df.groupby("city")["age"].mean()\` — average age per city
- **Sort**: \`df.sort_values("age")\`

This "filter, group, aggregate" loop is the daily bread of data analysis. Real datasets come from CSV files (\`pd.read_csv("data.csv")\`), and pandas loads, cleans, and reshapes them for you. Master pandas and you can answer real questions from messy real data — the core job.`,
        ar: `## Excel بقوى خارقة 🐼

علماء البيانات يقضون معظم وقتهم لا على الذكاء الفاخر، بل على **تنظيف البيانات واستكشافها**. أداتهم **pandas** — مكتبة بايثون كأنها Excel، لكنها قابلة للبرمجة وتتعامل مع ملايين الصفوف.

النجم هو الـ**DataFrame**: جدول بأعمدة وصفوف مسمّاة، تماماً كجدول بيانات.

\`\`\`python
import pandas as pd

df = pd.DataFrame({
    "name": ["Sara", "Omar", "Lina"],
    "age":  [25, 30, 22],
    "city": ["Riyadh", "Jeddah", "Riyadh"],
})

df.head()          # ألقِ نظرة على أول الصفوف
df["age"].mean()   # 25.67 — متوسط العمر بسطر واحد
df[df["age"] > 24] # الصفوف حيث العمر > 24 فقط (التصفية)
df.groupby("city").size()   # عدّ الأشخاص لكل مدينة
\`\`\`

انظر كم تفعل بكود قليل. الحركات اليومية:
- **اختر** عموداً: \`df["age"]\`
- **صفِّ** الصفوف: \`df[df["age"] > 24]\` — أبقِ المطابق فقط
- **جمّع + لخّص**: \`df.groupby("city")["age"].mean()\` — متوسط العمر لكل مدينة
- **رتّب**: \`df.sort_values("age")\`

حلقة "صفِّ، جمّع، لخّص" هذه خبز تحليل البيانات اليومي. البيانات الحقيقية تأتي من ملفات CSV (\`pd.read_csv("data.csv")\`)، وpandas يحمّلها وينظّفها ويعيد تشكيلها لك. أتقن pandas فتجيب على أسئلة حقيقية من بيانات واقعية فوضوية — جوهر العمل.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The gaps in real data: missing values 🕳️

Textbook data is complete. Real data has holes — a customer who skipped the "age" field, a sensor that dropped a reading, a survey question left blank. pandas represents a missing value as **NaN** ("Not a Number"), and dealing with it well is one of the most common tasks in the job.

pandas gives you three main moves:

\`\`\`python
df.isna()               # True/False grid: where are the gaps?
df["age"].isna().sum()  # how many missing ages?
df.dropna()             # drop any row that has a missing value
df.fillna(0)            # fill gaps with a specific value
df["age"].fillna(df["age"].mean(), inplace=True)  # fill with the column's mean
\`\`\`

**Why you can't just ignore NaN:** if you compute \`df["age"].mean()\` pandas quietly skips the missing rows for you — convenient, but dangerous if you don't realize a third of your data was silently excluded. And if a NaN slips into a machine-learning model later, most models will simply crash.

**Choosing a strategy matters:**
- **Drop rows** — fine if missing data is rare and random.
- **Fill with mean/median** — reasonable for numeric columns when you want to keep every row.
- **Fill with a placeholder** (like \`"unknown"\`) — often best for categorical/text columns, so you don't pretend to know something you don't.

There's no universally "correct" choice — the right one depends on *why* the data is missing, and a good data scientist always asks that question before typing \`.fillna()\`.`,
        ar: `## الثغرات في البيانات الحقيقية: القيم المفقودة 🕳️

بيانات الكتب المدرسية كاملة. أما البيانات الحقيقية ففيها ثغرات — عميل تخطّى حقل "العمر"، حسّاس أسقط قراءة، سؤال استبيان تُرك فارغاً. تمثّل pandas القيمة المفقودة بـ**NaN** ("ليست رقماً")، والتعامل الجيد معها من أشيع المهام في الوظيفة.

pandas يمنحك ثلاث حركات رئيسية:

\`\`\`python
df.isna()               # شبكة True/False: أين الثغرات؟
df["age"].isna().sum()  # كم عمراً مفقوداً؟
df.dropna()             # احذف أي صف فيه قيمة مفقودة
df.fillna(0)            # املأ الثغرات بقيمة محدّدة
df["age"].fillna(df["age"].mean(), inplace=True)  # املأ بمتوسط العمود
\`\`\`

**لماذا لا يمكنك تجاهل NaN فحسب:** إذا حسبت \`df["age"].mean()\` فإن pandas يتخطّى الصفوف المفقودة بصمت من أجلك — مريح، لكنه خطير إن لم تدرك أن ثلث بياناتك استُبعد بصمت. وإن تسرّبت NaN إلى نموذج تعلّم آلة لاحقاً، فمعظم النماذج ستتعطل ببساطة.

**اختيار الاستراتيجية مهم:**
- **حذف الصفوف** — مناسب إن كانت البيانات المفقودة نادرة وعشوائية.
- **الملء بالمتوسط/الوسيط** — معقول للأعمدة الرقمية حين تريد الاحتفاظ بكل صف.
- **الملء بقيمة بديلة** (مثل \`"unknown"\`) — غالباً الأفضل للأعمدة الفئوية/النصية، كي لا تتظاهر بمعرفة ما لا تعرفه.

لا يوجد خيار "صحيح" عالمياً — الخيار الصحيح يعتمد على *لماذا* البيانات مفقودة، وعالِم البيانات الجيد يسأل هذا السؤال دائماً قبل كتابة \`.fillna()\`.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Practice the "group and aggregate" idea (the heart of pandas) using plain Python. Given a list of \`(city, age)\` tuples, write \`average_age_by_city(people)\` that returns a dict mapping each city → the average age there.

Example: \`[("Riyadh", 20), ("Riyadh", 30), ("Jeddah", 25)]\` → \`{"Riyadh": 25.0, "Jeddah": 25.0}\``,
        ar: `تدرّب على فكرة "جمّع ولخّص" (قلب pandas) ببايثون عادي. بمعطى قائمة أزواج \`(city, age)\`، اكتب \`average_age_by_city(people)\` تعيد قاموساً يربط كل مدينة ← متوسط الأعمار فيها.

مثال: \`[("Riyadh", 20), ("Riyadh", 30), ("Jeddah", 25)]\` ← \`{"Riyadh": 25.0, "Jeddah": 25.0}\``,
      },
      starterCode: `def average_age_by_city(people):
    totals = {}   # city -> sum of ages
    counts = {}   # city -> number of people
    # fill totals and counts, then compute averages
    result = {}
    return result

data = [("Riyadh", 20), ("Riyadh", 30), ("Jeddah", 25)]
print(average_age_by_city(data))  # {'Riyadh': 25.0, 'Jeddah': 25.0}`,
      solution: `def average_age_by_city(people):
    totals = {}
    counts = {}
    for city, age in people:
        totals[city] = totals.get(city, 0) + age
        counts[city] = counts.get(city, 0) + 1
    result = {}
    for city in totals:
        result[city] = totals[city] / counts[city]
    return result

data = [("Riyadh", 20), ("Riyadh", 30), ("Jeddah", 25)]
print(average_age_by_city(data))  # {'Riyadh': 25.0, 'Jeddah': 25.0}`,
      hints: [
        { en: `Loop: for city, age in people. Accumulate totals[city] and counts[city] with .get(city, 0).`, ar: `كرّر: for city, age in people. اجمع totals[city] وcounts[city] بـ .get(city, 0).` },
        { en: `Then for each city: result[city] = totals[city] / counts[city].`, ar: `ثم لكل مدينة: result[city] = totals[city] / counts[city].` },
      ],
      tests: [
        { name: { en: "Groups and averages correctly", ar: "يجمّع ويحسب المتوسط بشكل صحيح" }, check: `assert average_age_by_city([("Riyadh",20),("Riyadh",30),("Jeddah",25)]) == {"Riyadh":25.0,"Jeddah":25.0}` },
        { name: { en: "Single city works", ar: "مدينة واحدة تعمل" }, check: `assert average_age_by_city([("A",10),("A",20)]) == {"A":15.0}` },
        { name: { en: "Handles three cities", ar: "يتعامل مع ثلاث مدن" }, check: `r = average_age_by_city([("A",10),("B",20),("C",30)]); assert r == {"A":10.0,"B":20.0,"C":30.0}` },
      ],
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Simulate \`fillna\` with the column mean, in plain Python. Write \`fill_missing_with_mean(values)\` where \`values\` is a list that may contain \`None\` for missing entries. Replace every \`None\` with the mean of the **non-missing** values (keep the original numbers unchanged).

Example: \`[10, None, 20, None, 30]\` → mean of \`[10,20,30]\` is \`20\` → result \`[10, 20, 20, 20, 30]\``,
        ar: `حاكِ \`fillna\` بمتوسط العمود، ببايثون عادي. اكتب \`fill_missing_with_mean(values)\` حيث \`values\` قائمة قد تحتوي \`None\` للمدخلات المفقودة. استبدل كل \`None\` بمتوسط القيم **غير المفقودة** (اترك الأرقام الأصلية دون تغيير).

مثال: \`[10, None, 20, None, 30]\` ← متوسط \`[10,20,30]\` هو \`20\` ← النتيجة \`[10, 20, 20, 20, 30]\``,
      },
      starterCode: `def fill_missing_with_mean(values):
    known = [v for v in values if v is not None]
    mean_value = sum(known) / len(known)
    # return a new list where every None becomes mean_value
    result = []
    return result

print(fill_missing_with_mean([10, None, 20, None, 30]))  # [10, 20, 20, 20, 30]`,
      solution: `def fill_missing_with_mean(values):
    known = [v for v in values if v is not None]
    mean_value = sum(known) / len(known)
    result = []
    for v in values:
        if v is None:
            result.append(mean_value)
        else:
            result.append(v)
    return result

print(fill_missing_with_mean([10, None, 20, None, 30]))  # [10, 20, 20, 20, 30]`,
      hints: [
        { en: `First compute mean_value from the entries that are not None.`, ar: `احسب أولاً mean_value من المدخلات التي ليست None.` },
        { en: `Then loop through the original list: keep real numbers, replace None with mean_value.`, ar: `ثم كرّر عبر القائمة الأصلية: أبقِ الأرقام الحقيقية، واستبدل None بـ mean_value.` },
      ],
      tests: [
        { name: { en: "Fills gaps with the mean of known values", ar: "يملأ الثغرات بمتوسط القيم المعروفة" }, check: `assert fill_missing_with_mean([10, None, 20, None, 30]) == [10, 20, 20, 20, 30]` },
        { name: { en: "No missing values leaves list unchanged", ar: "بلا قيم مفقودة تبقى القائمة كما هي" }, check: `assert fill_missing_with_mean([1,2,3]) == [1,2,3]` },
        { name: { en: "Single known value fills all gaps with it", ar: "قيمة معروفة واحدة تملأ كل الثغرات بها" }, check: `assert fill_missing_with_mean([None, 5, None]) == [5, 5, 5]` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the WHO and messy country data 🔍

International health and economic organizations like the **World Health Organization** and the **World Bank** publish datasets covering nearly every country on Earth — life expectancy, GDP, vaccination rates, and more. These are some of the most widely used real-world datasets in data science courses and tools like \`gapminder\`.

They're also a masterclass in messy data: some countries report every year without fail, others have huge gaps during wars, transitions, or simply lack of infrastructure to collect the numbers. Country names change or are spelled inconsistently ("Ivory Coast" vs "Côte d'Ivoire"), and older data is sometimes estimated rather than measured.

Any analyst who naively calls \`.mean()\` on this data without first checking **how much is missing, and for whom**, risks a badly misleading conclusion — for example, silently underrepresenting the poorest countries, which tend to have the most gaps. This is exactly why the "check first, then decide a strategy" habit from this lesson matters: real, high-stakes datasets are never clean by default, and the missing values themselves often carry meaning.`,
        ar: `## دراسة حالة واقعية: منظمة الصحة العالمية وبيانات الدول الفوضوية 🔍

تنشر منظمات صحية واقتصادية دولية مثل **منظمة الصحة العالمية** و**البنك الدولي** بيانات تغطي تقريباً كل دولة على الأرض — متوسط العمر المتوقع، الناتج المحلي، معدلات التطعيم، وغيرها. هذه من أكثر بيانات الواقع استخداماً في دورات علم البيانات وأدوات مثل \`gapminder\`.

وهي أيضاً درس رئيسي في فوضى البيانات: بعض الدول تُبلّغ كل سنة دون كلل، وأخرى فيها ثغرات هائلة خلال الحروب أو التحولات أو لمجرد نقص البنية لجمع الأرقام. أسماء الدول تتغيّر أو تُكتب بشكل غير متسق ("ساحل العاج" مقابل "Côte d'Ivoire")، والبيانات القديمة أحياناً تقديرية لا مقاسة.

أي محلّل يستدعي \`.mean()\` بسذاجة على هذه البيانات دون التحقق أولاً من **كمية المفقود ولمن**، يخاطر باستنتاج مُضلِّل بشدة — مثلاً، تمثيل ناقص بصمت لأفقر الدول، التي تميل لامتلاك أكثر الثغرات. لهذا بالضبط تهمّ عادة "تحقّق أولاً، ثم قرّر استراتيجية" من هذا الدرس: البيانات الحقيقية عالية المخاطر ليست نظيفة افتراضياً أبداً، والقيم المفقودة نفسها غالباً تحمل معنى.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is a pandas DataFrame?", ar: "ما هو pandas DataFrame؟" },
          choices: [
            { en: "A programmable table with named rows and columns", ar: "جدول قابل للبرمجة بصفوف وأعمدة مسمّاة" },
            { en: "A type of chart", ar: "نوع رسم بياني" },
            { en: "A machine learning model", ar: "نموذج تعلّم آلة" },
          ],
          answer: 0,
          explain: {
            en: "A DataFrame is a spreadsheet in code — the central object for loading, cleaning, and analyzing data in pandas.",
            ar: "الـ DataFrame جدول بيانات في الكود — الكائن المركزي لتحميل البيانات وتنظيفها وتحليلها في pandas.",
          },
        },
        {
          q: { en: "What does df[df['age'] > 24] do?", ar: "ماذا يفعل df[df['age'] > 24]؟" },
          choices: [
            { en: "Keeps only the rows where age is greater than 24", ar: "يبقي الصفوف حيث العمر أكبر من 24 فقط" },
            { en: "Adds 24 to every age", ar: "يضيف 24 لكل عمر" },
            { en: "Deletes the age column", ar: "يحذف عمود العمر" },
          ],
          answer: 0,
          explain: {
            en: "That's boolean filtering — keep rows matching a condition. The bread and butter of data exploration.",
            ar: "هذه تصفية منطقية — أبقِ الصفوف المطابقة لشرط. خبز استكشاف البيانات وزبدته.",
          },
        },
        {
          q: { en: "Where do data scientists spend most of their time?", ar: "أين يقضي علماء البيانات معظم وقتهم؟" },
          choices: [
            { en: "Cleaning and exploring data", ar: "تنظيف البيانات واستكشافها" },
            { en: "Training giant neural networks", ar: "تدريب شبكات عصبية عملاقة" },
            { en: "Designing logos", ar: "تصميم الشعارات" },
          ],
          answer: 0,
          explain: {
            en: "The famous rule: ~80% of data science is data cleaning and wrangling. pandas is the tool for exactly that.",
            ar: "القاعدة الشهيرة: ~80% من علم البيانات تنظيف وتهيئة. وpandas أداة ذلك بالضبط.",
          },
        },
        {
          q: { en: "What does pandas call a missing value?", ar: "بماذا تسمّي pandas القيمة المفقودة؟" },
          choices: [
            { en: "NaN (Not a Number)", ar: "NaN (ليست رقماً)" },
            { en: "NULL only", ar: "NULL فقط" },
            { en: "It has no special representation", ar: "لا تمثيل خاص لها" },
          ],
          answer: 0,
          explain: {
            en: "pandas uses NaN to mark missing entries. Left unhandled, it can silently skew means or crash a downstream ML model.",
            ar: "تستخدم pandas NaN لتمييز المدخلات المفقودة. إن تُركت دون معالجة، قد تحرّف المتوسطات بصمت أو تُعطّل نموذج تعلّم آلة لاحقاً.",
          },
        },
        {
          q: { en: "Why is checking missing data before analysis important, per the WHO/World Bank example?", ar: "لماذا التحقق من البيانات المفقودة قبل التحليل مهم، وفق مثال منظمة الصحة/البنك الدولي؟" },
          choices: [
            { en: "Missing data is often not random — it can quietly underrepresent specific groups", ar: "البيانات المفقودة غالباً ليست عشوائية — قد تُمثّل مجموعات معينة تمثيلاً ناقصاً بصمت" },
            { en: "Missing data never affects results", ar: "البيانات المفقودة لا تؤثر على النتائج أبداً" },
            { en: "Every country reports data identically", ar: "كل دولة تُبلّغ بياناتها بنفس الطريقة" },
          ],
          answer: 0,
          explain: {
            en: "Poorer or unstable countries tend to have more gaps, so naive averaging can silently bias conclusions toward better-documented places.",
            ar: "الدول الأفقر أو غير المستقرة تميل لامتلاك ثغرات أكثر، فحساب المتوسط بسذاجة قد يُحيّز الاستنتاجات بصمت نحو الأماكن الموثّقة بشكل أفضل.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- pandas = programmable Excel; the DataFrame is its core table
- Daily loop: select → filter → group → aggregate → sort
- ~80% of the job is cleaning and exploring data
- Missing values (NaN) need a deliberate strategy: drop, fill with mean/median, or fill with a placeholder
- You implemented group-and-average and a fill-missing-with-mean function from scratch
- The WHO/World Bank case study shows missing data is rarely random — check it before trusting any average

**Practice:** \`pip install pandas\`, load any CSV with \`pd.read_csv\`, and explore it. **Next:** SQL for Data — querying databases, the other half of a data scientist's toolkit.`,
        ar: `## الخلاصة

- pandas = Excel قابل للبرمجة؛ والـ DataFrame جدوله الأساسي
- الحلقة اليومية: اختر ← صفِّ ← جمّع ← لخّص ← رتّب
- ~80% من العمل تنظيف واستكشاف البيانات
- القيم المفقودة (NaN) تحتاج استراتيجية مقصودة: حذف، أو ملء بالمتوسط/الوسيط، أو ملء بقيمة بديلة
- نفّذت التجميع-والمتوسط ودالة ملء-المفقود-بالمتوسط من الصفر
- دراسة حالة منظمة الصحة/البنك الدولي تُظهر أن البيانات المفقودة نادراً ما تكون عشوائية — تحقّق منها قبل الثقة بأي متوسط

**تدرّب:** \`pip install pandas\`، حمّل أي CSV بـ \`pd.read_csv\`، واستكشفه. **التالي:** SQL للبيانات — استعلام قواعد البيانات، النصف الآخر من عدّة عالِم البيانات.`,
      },
    },
  ],
};
