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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- pandas = programmable Excel; the DataFrame is its core table
- Daily loop: select → filter → group → aggregate → sort
- ~80% of the job is cleaning and exploring data
- You implemented group-and-average from scratch

**Practice:** \`pip install pandas\`, load any CSV with \`pd.read_csv\`, and explore it. **Next:** SQL for Data — querying databases, the other half of a data scientist's toolkit.`,
        ar: `## الخلاصة

- pandas = Excel قابل للبرمجة؛ والـ DataFrame جدوله الأساسي
- الحلقة اليومية: اختر ← صفِّ ← جمّع ← لخّص ← رتّب
- ~80% من العمل تنظيف واستكشاف البيانات
- نفّذت التجميع-والمتوسط من الصفر

**تدرّب:** \`pip install pandas\`، حمّل أي CSV بـ \`pd.read_csv\`، واستكشفه. **التالي:** SQL للبيانات — استعلام قواعد البيانات، النصف الآخر من عدّة عالِم البيانات.`,
      },
    },
  ],
};
