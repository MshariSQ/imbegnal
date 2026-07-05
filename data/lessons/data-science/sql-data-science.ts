import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "sql-data-science",
  title: { en: "SQL for Data — Ask Your Data Questions", ar: "SQL للبيانات — اسأل بياناتك" },
  estMinutes: 35,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why SQL is a must-have for data scientists
- SELECT, WHERE, GROUP BY, ORDER BY
- Aggregations: COUNT, SUM, AVG
- You'll replicate a GROUP BY query in code`,
        ar: `## ماذا ستتعلم

- لماذا SQL ضرورة لعلماء البيانات
- SELECT، WHERE، GROUP BY، ORDER BY
- التلخيصات: COUNT، SUM، AVG
- ستحاكي استعلام GROUP BY بالكود`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Data usually lives in a database 🗄️

You met SQL in the backend track — for data scientists it's just as essential, because company data almost always lives in SQL databases. Before you can analyze anything in pandas, you often have to **pull it with SQL**. It's consistently one of the most-requested skills in data job listings.

The analyst's core query pattern:

\`\`\`sql
SELECT   city, AVG(age) AS avg_age, COUNT(*) AS people
FROM     users
WHERE    age >= 18
GROUP BY city
ORDER BY avg_age DESC;
\`\`\`

Read it top to bottom like a sentence:
- **SELECT** — which columns/summaries you want (here: city, average age, count).
- **FROM** — which table.
- **WHERE** — filter rows *before* grouping (adults only).
- **GROUP BY** — collapse rows into groups (one row per city).
- **ORDER BY** — sort the result (highest average age first).

The **aggregation functions** do the summarizing across a group:
- \`COUNT(*)\` — how many rows
- \`SUM(x)\` — total
- \`AVG(x)\` — average
- \`MIN(x)\` / \`MAX(x)\` — smallest / largest

This one query answers "what's the average age and headcount per city, for adults, ranked?" — the exact kind of question a business asks daily. Notice it's the same **filter → group → aggregate → sort** loop as pandas. SQL and pandas are two dialects of the same idea; data scientists fluently switch between them.`,
        ar: `## البيانات عادة تعيش في قاعدة بيانات 🗄️

قابلت SQL في مسار الخلفية — ولعلماء البيانات لا تقل ضرورة، لأن بيانات الشركات تعيش غالباً في قواعد SQL. قبل أن تحلّل أي شيء في pandas، عليك غالباً **سحبها بـ SQL**. وهي باستمرار من أكثر المهارات طلباً في إعلانات وظائف البيانات.

نمط الاستعلام الأساسي للمحلّل:

\`\`\`sql
SELECT   city, AVG(age) AS avg_age, COUNT(*) AS people
FROM     users
WHERE    age >= 18
GROUP BY city
ORDER BY avg_age DESC;
\`\`\`

اقرأه من الأعلى للأسفل كجملة:
- **SELECT** — أي أعمدة/تلخيصات تريد (هنا: المدينة، متوسط العمر، العدد).
- **FROM** — أي جدول.
- **WHERE** — صفِّ الصفوف *قبل* التجميع (البالغون فقط).
- **GROUP BY** — اطوِ الصفوف في مجموعات (صف لكل مدينة).
- **ORDER BY** — رتّب النتيجة (أعلى متوسط عمر أولاً).

**دوال التلخيص** تلخّص عبر المجموعة:
- \`COUNT(*)\` — كم صفاً
- \`SUM(x)\` — المجموع
- \`AVG(x)\` — المتوسط
- \`MIN(x)\` / \`MAX(x)\` — الأصغر / الأكبر

هذا الاستعلام الواحد يجيب "ما متوسط العمر وعدد الأفراد لكل مدينة، للبالغين، مرتّباً؟" — بالضبط نوع السؤال الذي تطرحه الأعمال يومياً. لاحظ أنها نفس حلقة **صفِّ ← جمّع ← لخّص ← رتّب** التي في pandas. SQL وpandas لهجتان لنفس الفكرة؛ وعلماء البيانات ينتقلون بينهما بطلاقة.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Replicate \`SELECT category, SUM(amount) GROUP BY category\`. Given a list of \`(category, amount)\` sales, write \`total_by_category(sales)\` returning a dict of each category → its total amount.

Example: \`[("food", 10), ("toys", 5), ("food", 20)]\` → \`{"food": 30, "toys": 5}\``,
        ar: `حاكِ \`SELECT category, SUM(amount) GROUP BY category\`. بمعطى قائمة مبيعات \`(category, amount)\`، اكتب \`total_by_category(sales)\` تعيد قاموس كل فئة ← مجموع مبلغها.

مثال: \`[("food", 10), ("toys", 5), ("food", 20)]\` ← \`{"food": 30, "toys": 5}\``,
      },
      starterCode: `def total_by_category(sales):
    totals = {}
    # for each (category, amount), add amount to totals[category]
    return totals

data = [("food", 10), ("toys", 5), ("food", 20)]
print(total_by_category(data))  # {'food': 30, 'toys': 5}`,
      solution: `def total_by_category(sales):
    totals = {}
    for category, amount in sales:
        totals[category] = totals.get(category, 0) + amount
    return totals

data = [("food", 10), ("toys", 5), ("food", 20)]
print(total_by_category(data))  # {'food': 30, 'toys': 5}`,
      hints: [
        { en: `Loop: for category, amount in sales.`, ar: `كرّر: for category, amount in sales.` },
        { en: `Accumulate: totals[category] = totals.get(category, 0) + amount.`, ar: `اجمع: totals[category] = totals.get(category, 0) + amount.` },
      ],
      tests: [
        { name: { en: "Sums by category correctly", ar: "يجمع حسب الفئة بشكل صحيح" }, check: `assert total_by_category([("food",10),("toys",5),("food",20)]) == {"food":30,"toys":5}` },
        { name: { en: "Single category", ar: "فئة واحدة" }, check: `assert total_by_category([("a",1),("a",2),("a",3)]) == {"a":6}` },
        { name: { en: "Empty input gives empty dict", ar: "مدخل فارغ يعطي قاموساً فارغاً" }, check: `assert total_by_category([]) == {}` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "In SQL, what does GROUP BY do?", ar: "في SQL، ماذا يفعل GROUP BY؟" },
          choices: [
            { en: "Collapses rows into groups so you can aggregate each group", ar: "يطوي الصفوف في مجموعات لتلخّص كل مجموعة" },
            { en: "Deletes duplicate tables", ar: "يحذف الجداول المكررة" },
            { en: "Sorts alphabetically", ar: "يرتّب أبجدياً" },
          ],
          answer: 0,
          explain: {
            en: "GROUP BY city + AVG(age) gives one row per city with its average — the collapse-then-summarize pattern.",
            ar: "GROUP BY city + AVG(age) يعطي صفاً لكل مدينة بمتوسطها — نمط الطيّ ثم التلخيص.",
          },
        },
        {
          q: { en: "WHERE vs GROUP BY order — which is right?", ar: "ترتيب WHERE مقابل GROUP BY — أيهما صحيح؟" },
          choices: [
            { en: "WHERE filters rows before grouping", ar: "WHERE يصفّي الصفوف قبل التجميع" },
            { en: "GROUP BY always comes first", ar: "GROUP BY يأتي أولاً دائماً" },
            { en: "They can't be used together", ar: "لا يمكن استخدامهما معاً" },
          ],
          answer: 0,
          explain: {
            en: "Filter first (WHERE), then group. SELECT … FROM … WHERE … GROUP BY … ORDER BY is the canonical order.",
            ar: "صفِّ أولاً (WHERE)، ثم جمّع. SELECT … FROM … WHERE … GROUP BY … ORDER BY هو الترتيب المعتمد.",
          },
        },
        {
          q: { en: "Why do data scientists need SQL?", ar: "لماذا يحتاج علماء البيانات SQL؟" },
          choices: [
            { en: "Company data lives in databases; SQL pulls it out to analyze", ar: "بيانات الشركات في قواعد بيانات؛ وSQL يسحبها للتحليل" },
            { en: "SQL trains neural networks", ar: "SQL يدرّب الشبكات العصبية" },
            { en: "It's only for backend engineers", ar: "لمهندسي الخلفية فقط" },
          ],
          answer: 0,
          explain: {
            en: "Before pandas can touch it, the data must be queried from the database. SQL is a top-requested data-science skill.",
            ar: "قبل أن يلمسها pandas، يجب استعلام البيانات من القاعدة. وSQL من أكثر مهارات علم البيانات طلباً.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- SQL pulls data from databases; it's essential for data scientists
- SELECT / WHERE / GROUP BY / ORDER BY + aggregations (COUNT/SUM/AVG)
- Same filter→group→aggregate→sort loop as pandas
- You replicated a GROUP BY SUM query

**Practice:** free interactive SQL at sqlbolt.com and mode.com/sql-tutorial. **Next:** Data Visualization — turning your query results into charts that tell a story.`,
        ar: `## الخلاصة

- SQL يسحب البيانات من القواعد؛ وهو ضروري لعلماء البيانات
- SELECT / WHERE / GROUP BY / ORDER BY + التلخيصات (COUNT/SUM/AVG)
- نفس حلقة صفِّ←جمّع←لخّص←رتّب التي في pandas
- حاكيت استعلام GROUP BY SUM

**تدرّب:** SQL تفاعلي مجاني على sqlbolt.com وmode.com/sql-tutorial. **التالي:** التصوير المرئي للبيانات — تحويل نتائج استعلاماتك إلى رسوم تروي قصة.`,
      },
    },
  ],
};
