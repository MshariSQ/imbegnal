import type { Lesson } from "../types";

const JOIN_SEED = `import sqlite3
import sys

db = sqlite3.connect(":memory:")
db.executescript("""
    CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE orders (
        id          INTEGER PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        total_cents INTEGER NOT NULL
    );
    INSERT INTO customers (id, name) VALUES (1, 'Amal'), (2, 'Bilal'), (3, 'Carla'), (4, 'Dina'), (5, 'Emad');
    INSERT INTO orders (id, customer_id, total_cents) VALUES
        (1, 1, 2500), (2, 1, 900), (3, 2, 4100), (4, 4, 1500), (5, 1, 700), (6, 4, 300);
""")

# stdin: the minimum order total, in cents.
min_total = int(sys.stdin.read().strip() or 0)
`;

const JOIN_REPORT = `
for name, order_id, total in db.execute(report_sql, {"min_total": min_total}):
    if order_id is None:
        print(f"{name}: no matching order")
    else:
        print(f"{name}: order {order_id} ({total / 100:.2f})")
`;

const STAFF_SEED = `import sqlite3
import sys

db = sqlite3.connect(":memory:")
db.executescript("""
    CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE employees (
        id      INTEGER PRIMARY KEY,
        name    TEXT NOT NULL,
        dept_id INTEGER NOT NULL REFERENCES departments(id),
        salary  INTEGER NOT NULL
    );
    INSERT INTO departments (id, name) VALUES (1, 'Engineering'), (2, 'Design'), (3, 'Support'), (4, 'Legal');
    INSERT INTO employees (name, dept_id, salary) VALUES
        ('Hana', 1, 5200), ('Idris', 1, 4800), ('Jalal', 1, 6100), ('Kamal', 1, 4500),
        ('Lina', 2, 4100), ('Munir', 2, 3900),
        ('Nabil', 3, 2800), ('Omar', 3, 3000), ('Pia', 3, 2900), ('Qasim', 3, 3100), ('Rana', 3, 2700);
""")

# stdin: "<minimum headcount> <minimum salary>"
min_headcount, min_salary = map(int, sys.stdin.read().split())
`;

const STAFF_REPORT = `
rows = db.execute(report_sql, {"min_headcount": min_headcount, "min_salary": min_salary}).fetchall()
if not rows:
    print("no department qualifies")
for name, headcount, avg_salary, top in rows:
    print(f"{name}: headcount={headcount} avg={avg_salary:.1f} max={top}")
`;

const SHOP_SEED = `import sqlite3
import sys

db = sqlite3.connect(":memory:")
db.executescript("""
    CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL);
    -- product_id is NULL for a custom item that is not in the catalog.
    CREATE TABLE order_items (id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL, product_id INTEGER);
    INSERT INTO products (id, name, category) VALUES
        (1, 'Notebook', 'stationery'), (2, 'Pen', 'stationery'), (3, 'Stapler', 'office'),
        (4, 'Marker', 'office'), (5, 'Planner', 'stationery'), (6, 'Lamp', 'home'), (7, 'Kettle', 'kitchen');
    INSERT INTO order_items (order_id, product_id) VALUES
        (1, 1), (1, 2), (2, 2), (3, NULL), (4, 4), (5, 7);
""")

# stdin: a category, or * for every category.
category = sys.stdin.read().strip()
`;

const SHOP_REPORT = `
names = [row[0] for row in db.execute(report_sql, {"category": category})]
print(", ".join(names) if names else "(none)")
`;

export const lesson: Lesson = {
  nodeId: "joins-aggregation",
  title: { en: "Joins, Aggregation & Subqueries", ar: "الربط والتجميع والاستعلامات الفرعية" },
  estMinutes: 45,
  sections: [
    {
      type: "text",
      body: {
        en: `## The pizza shop with two notebooks 🍕

A pizza shop keeps two notebooks. One lists the **customers** (number, name). The other lists the **orders**, and each order only says "customer #3 paid 25.00". The boss asks: *"How much did each customer spend this month? And who has not ordered at all?"*

You flip between the notebooks, matching customer numbers: that is a **join**. You add up each customer's orders: that is **aggregation**. You spot the names that never show up in the order notebook: that is the job of an **outer join** or a **subquery**.

Last lesson you learned to split data into separate tables so every fact lives once. This lesson is the other half: **putting it back together** whenever you ask a question.

## What you'll learn

- \`INNER JOIN\` and \`LEFT JOIN\`, and when each one is right
- Why a filter in \`ON\` and a filter in \`WHERE\` behave differently on a left join
- Summaries with \`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`, \`GROUP BY\` and \`HAVING\`
- The trap of \`COUNT(*)\` versus \`COUNT(column)\`
- Subqueries, \`EXISTS\` and CTEs (\`WITH\`), and why \`NOT IN\` can silently return nothing

In the labs you keep writing SQL for **SQLite** inside Python strings.

## Joins: matching rows across tables

Take these two tables:

\`\`\`sql
-- customers: (1, Amal) (2, Bilal) (3, Carla)
-- orders:    (id 1, customer_id 1, 2500) (id 2, customer_id 1, 900) (id 3, customer_id 2, 4100)

SELECT c.name, o.id, o.total_cents
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id;
\`\`\`

\`FROM customers AS c JOIN orders AS o ON ...\` says: *pair every customer row with every order row, and keep only the pairs where the ON condition is true.* The short names \`c\` and \`o\` (aliases) save typing and tell columns apart.

The result is one row per **matching pair**: Amal appears twice (two orders), Bilal once, and **Carla does not appear at all** because no order matched her. That is an **INNER JOIN** (plain \`JOIN\` means the same thing).

To keep every customer, use a **LEFT JOIN**: *keep every row from the left table, and fill the right-side columns with NULL when nothing matches.*

\`\`\`sql
SELECT c.name, o.id, o.total_cents
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id;
-- Carla now appears once, with o.id = NULL and o.total_cents = NULL
\`\`\`

### The ON versus WHERE trap

Suppose you want every customer plus only their orders of 1000 or more.

\`\`\`sql
-- WRONG: Carla is kept by the join, then WHERE throws her away (NULL >= 1000 is not true).
... LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.total_cents >= 1000

-- RIGHT: the filter is part of the matching rule, so unmatched customers survive.
... LEFT JOIN orders o ON o.customer_id = c.id AND o.total_cents >= 1000
\`\`\`

\`ON\` decides **which rows match**. \`WHERE\` runs **after** the join and removes finished rows. On an inner join the two are equivalent, but on a left join they are not.

### Two more things worth knowing

- **Forgetting the join condition** makes a *cross join*: every row of one table paired with every row of the other. 3 customers and 4 orders give 12 rows, and 10,000 by 10,000 gives 100 million. If a query is suddenly slow and huge, look for a missing \`ON\`.
- **RIGHT JOIN** is a LEFT JOIN with the tables swapped. Most people simply write a LEFT JOIN with the main table first.`,
        ar: `## محل البيتزا ودفتراه 🍕

يحتفظ محل بيتزا بدفترين. الأول فيه **العملاء** (رقم، اسم). والثاني فيه **الطلبات**، وكل طلب لا يقول إلا «العميل رقم 3 دفع 25.00». يسأل المدير: *«كم أنفق كل عميل هذا الشهر؟ ومن لم يطلب أبداً؟»*

تقلّب بين الدفترين وتطابق أرقام العملاء: هذا هو **الربط (join)**. وتجمع طلبات كل عميل: هذا هو **التجميع (aggregation)**. وتلتقط الأسماء التي لا تظهر في دفتر الطلبات: وهذه مهمة **الربط الخارجي (outer join)** أو **الاستعلام الفرعي (subquery)**.

تعلّمت في الدرس السابق أن تقسّم البيانات إلى جداول منفصلة ليعيش كل معلومة مرة واحدة. وهذا الدرس هو النصف الآخر: **إعادة جمعها** كلما طرحت سؤالاً.

## ماذا ستتعلم

- \`INNER JOIN\` و\`LEFT JOIN\`، ومتى يناسب كل منهما
- لماذا يختلف الشرط في \`ON\` عن الشرط في \`WHERE\` في الـ left join
- التلخيص بـ \`COUNT\` و\`SUM\` و\`AVG\` و\`MIN\` و\`MAX\` و\`GROUP BY\` و\`HAVING\`
- فخ \`COUNT(*)\` مقابل \`COUNT(column)\`
- الاستعلامات الفرعية و\`EXISTS\` والـ CTE (\`WITH\`)، ولماذا قد تُرجع \`NOT IN\` لا شيء بصمت

في المختبرات تواصل كتابة SQL لـ **SQLite** داخل نصوص بايثون.

## الربط: مطابقة الصفوف بين الجداول

خذ هذين الجدولين:

\`\`\`sql
-- customers: (1, Amal) (2, Bilal) (3, Carla)
-- orders:    (id 1, customer_id 1, 2500) (id 2, customer_id 1, 900) (id 3, customer_id 2, 4100)

SELECT c.name, o.id, o.total_cents
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id;
\`\`\`

تقول \`FROM customers AS c JOIN orders AS o ON ...\`: *اقرن كل صف عميل بكل صف طلب، واحتفظ فقط بالأزواج التي يتحقق فيها شرط ON.* الأسماء القصيرة \`c\` و\`o\` (aliases) توفّر الكتابة وتميّز الأعمدة بعضها عن بعض.

النتيجة صف واحد لكل **زوج متطابق**: تظهر أمل مرتين (طلبان)، وبلال مرة، و**كارلا لا تظهر إطلاقاً** لأن أي طلب لم يطابقها. هذا هو **INNER JOIN** (والـ \`JOIN\` المجرد يعني الشيء نفسه).

للإبقاء على كل العملاء استخدم **LEFT JOIN**: *احتفظ بكل صفوف الجدول الأيسر، واملأ أعمدة الجهة اليمنى بـ NULL حين لا يوجد تطابق.*

\`\`\`sql
SELECT c.name, o.id, o.total_cents
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id;
-- تظهر كارلا الآن مرة واحدة، مع o.id = NULL و o.total_cents = NULL
\`\`\`

### فخ ON مقابل WHERE

لنفترض أنك تريد كل العملاء مع طلباتهم التي قيمتها 1000 أو أكثر فقط.

\`\`\`sql
-- خطأ: يُبقي الربطُ كارلا، ثم يرميها WHERE (NULL >= 1000 ليست صحيحة).
... LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.total_cents >= 1000

-- صحيح: الشرط جزء من قاعدة المطابقة، فينجو العملاء غير المطابَقين.
... LEFT JOIN orders o ON o.customer_id = c.id AND o.total_cents >= 1000
\`\`\`

يحدد \`ON\` **أي الصفوف تتطابق**. أما \`WHERE\` فيعمل **بعد** الربط ويزيل صفوفاً جاهزة. في الـ inner join يتكافأ الاثنان، أما في الـ left join فلا.

### أمران آخران يستحقان المعرفة

- **نسيان شرط الربط** ينتج *cross join*: كل صف من جدول يُقرن بكل صف من الآخر. 3 عملاء و4 طلبات يعطيان 12 صفاً، و10,000 في 10,000 تعطي 100 مليون. إن صار استعلام بطيئاً وضخماً فجأة فابحث عن \`ON\` مفقود.
- **RIGHT JOIN** هو LEFT JOIN بعد تبديل الجدولين. يكتب أغلب الناس LEFT JOIN والجدول الرئيسي أولاً.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `# What a join really does, with two nested loops.
customers = [(1, "Amal"), (2, "Bilal"), (3, "Carla")]
orders = [(1, 1, 2500), (2, 1, 900), (3, 2, 4100)]  # (id, customer_id, total_cents)

print("INNER JOIN")
for cid, name in customers:
    for oid, customer_id, total in orders:
        if customer_id == cid:          # the ON condition
            print(" ", name, oid, total)

print("LEFT JOIN")
for cid, name in customers:
    matched = False
    for oid, customer_id, total in orders:
        if customer_id == cid:
            matched = True
            print(" ", name, oid, total)
    if not matched:                      # keep the left row, fill the right side with NULL
        print(" ", name, None, None)`,
      explanation: {
        en: "An inner join prints only the matching pairs, so Carla vanishes. The left join adds one extra row for a left row that matched nothing, with None (NULL) on the right. Real databases use smarter strategies than nested loops, but the result is the same.",
        ar: "الـ inner join يطبع الأزواج المتطابقة فقط، فتختفي كارلا. أما الـ left join فيضيف صفاً إضافياً للصف الأيسر الذي لم يطابق شيئاً، مع None (أي NULL) في الجهة اليمنى. تستخدم قواعد البيانات الحقيقية استراتيجيات أذكى من الحلقات المتداخلة لكن النتيجة واحدة.",
      },
    },
    {
      type: "lab",
      id: "left-join-filter",
      lang: "python",
      prompt: {
        en: `The tables \`customers\` and \`orders\` exist. For a minimum total given on stdin (in cents), list **every customer** with **each of their orders whose total is at least that minimum**. A customer with no qualifying order still appears once.

Fix \`report_sql\` so it selects \`c.name, o.id, o.total_cents\` ordered by customer name, then order id. The query may use the named parameter \`:min_total\`. The program prints \`name: order ID (TOTAL)\` or \`name: no matching order\`.

**Input:** one integer, the minimum total in cents.

Example: the minimum \`1000\` prints, among other lines, \`Amal: order 1 (25.00)\` and \`Carla: no matching order\`.`,
        ar: `الجدولان \`customers\` و\`orders\` موجودان. من أجل حدّ أدنى للإجمالي يُعطى في stdin (بالسنتات) اعرض **كل عميل** مع **كل طلب من طلباته إجماليه لا يقل عن هذا الحد**. العميل الذي لا طلب مؤهَّلاً له يظهر مرة واحدة مع ذلك.

أصلح \`report_sql\` ليختار \`c.name, o.id, o.total_cents\` مرتّبةً باسم العميل ثم برقم الطلب. يمكن للاستعلام استخدام المعامل المسمّى \`:min_total\`. يطبع البرنامج \`name: order ID (TOTAL)\` أو \`name: no matching order\`.

**الدخل:** عدد صحيح واحد، الحد الأدنى للإجمالي بالسنتات.

مثال: الحد الأدنى \`1000\` يطبع، ضمن أسطر أخرى، \`Amal: order 1 (25.00)\` و\`Carla: no matching order\`.`,
      },
      starterCode: `${JOIN_SEED}
# TODO: every customer must appear, even without a qualifying order.
# This INNER JOIN + WHERE drops them. Use a LEFT JOIN and decide where the filter belongs.
report_sql = """
    SELECT c.name, o.id, o.total_cents
    FROM customers c
    JOIN orders o ON o.customer_id = c.id
    WHERE o.total_cents >= :min_total
    ORDER BY c.name, o.id
"""
${JOIN_REPORT}`,
      solution: `${JOIN_SEED}
# The total filter lives in ON: it decides which orders match,
# so customers without a matching order survive as NULL rows.
report_sql = """
    SELECT c.name, o.id, o.total_cents
    FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.id AND o.total_cents >= :min_total
    ORDER BY c.name, o.id
"""
${JOIN_REPORT}`,
      hints: [
        { en: "To keep customers that have no orders you need a LEFT JOIN with customers on the left.", ar: "للإبقاء على العملاء الذين بلا طلبات تحتاج LEFT JOIN مع customers في الجهة اليسرى." },
        { en: "A WHERE on o.total_cents runs after the join and removes the NULL rows again. Move that condition into the ON clause.", ar: "الـ WHERE على o.total_cents يعمل بعد الربط ويزيل صفوف NULL من جديد. انقل هذا الشرط إلى جملة ON." },
        { en: "The final shape is: LEFT JOIN orders o ON o.customer_id = c.id AND o.total_cents >= :min_total.", ar: "الشكل النهائي: LEFT JOIN orders o ON o.customer_id = c.id AND o.total_cents >= :min_total." },
      ],
      tests: [
        { name: { en: "Minimum 0: every order, customers without orders kept", ar: "الحد الأدنى 0: كل الطلبات مع إبقاء العملاء بلا طلبات" }, stdin: "0\n", expected: "Amal: order 1 (25.00)\nAmal: order 2 (9.00)\nAmal: order 5 (7.00)\nBilal: order 3 (41.00)\nCarla: no matching order\nDina: order 4 (15.00)\nDina: order 6 (3.00)\nEmad: no matching order" },
        { name: { en: "Minimum 1000: small orders drop out, their customers stay", ar: "الحد الأدنى 1000: تسقط الطلبات الصغيرة ويبقى أصحابها" }, stdin: "1000\n", expected: "Amal: order 1 (25.00)\nBilal: order 3 (41.00)\nCarla: no matching order\nDina: order 4 (15.00)\nEmad: no matching order" },
        { name: { en: "Boundary: an order equal to the minimum is included", ar: "الحد: الطلب المساوي للحد الأدنى يُحتسب" }, stdin: "2500\n", expected: "Amal: order 1 (25.00)\nBilal: order 3 (41.00)\nCarla: no matching order\nDina: no matching order\nEmad: no matching order" },
        { name: { en: "Minimum above every order: all customers, no matches", ar: "حد أدنى فوق كل الطلبات: كل العملاء بلا مطابقات" }, stdin: "99999\n", expected: "Amal: no matching order\nBilal: no matching order\nCarla: no matching order\nDina: no matching order\nEmad: no matching order" },
      ],
      sampleInput: "1000\n",
    },
    {
      type: "text",
      body: {
        en: `## Aggregation: from many rows to one answer

An **aggregate function** reads many rows and returns one value:

| Function | Meaning |
|---|---|

Since tables are not supported here, think of the five you will use daily: \`COUNT\` (how many), \`SUM\` (total), \`AVG\` (mean), \`MIN\` and \`MAX\`.

\`\`\`sql
SELECT COUNT(*), SUM(total_cents), MAX(total_cents) FROM orders;   -- one row for the whole table
\`\`\`

Add **GROUP BY** to get one row **per group** instead:

\`\`\`sql
SELECT customer_id, COUNT(*) AS orders, SUM(total_cents) AS spent
FROM orders
GROUP BY customer_id;
\`\`\`

Rule of thumb: every column in \`SELECT\` is either listed in \`GROUP BY\` or wrapped in an aggregate function. Most databases enforce it, because "which of the group's ten values should I show?" has no answer.

### WHERE versus HAVING

Think of the order in which the database works:

1. \`FROM\` / \`JOIN\`: build the rows
2. \`WHERE\`: **remove rows** (before grouping)
3. \`GROUP BY\`: form the groups
4. \`HAVING\`: **remove groups** (after aggregating)
5. \`SELECT\`, then \`ORDER BY\`, then \`LIMIT\`

\`\`\`sql
SELECT dept_id, COUNT(*) AS headcount, ROUND(AVG(salary), 1) AS avg_salary
FROM employees
WHERE salary >= 3000            -- employees below 3000 are never counted
GROUP BY dept_id
HAVING COUNT(*) >= 2            -- departments with fewer than 2 remaining employees disappear
ORDER BY avg_salary DESC;
\`\`\`

\`WHERE COUNT(*) >= 2\` is an error: when \`WHERE\` runs, no group exists yet.

### COUNT(*) versus COUNT(column)

\`COUNT(*)\` counts rows. \`COUNT(column)\` counts rows where that column is **not NULL**. All the other aggregates (\`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`) also **ignore NULLs**.

This matters on a left join. Carla has no orders, but the join still produced **one row** for her (with NULLs):

\`\`\`sql
SELECT c.name, COUNT(*) AS wrong, COUNT(o.id) AS right
FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id;
-- Carla: wrong = 1, right = 0
\`\`\`

Also note that \`SUM\` of zero rows is NULL, not 0. Wrap it: \`COALESCE(SUM(x), 0)\` gives 0 when nothing matched.`,
        ar: `## التجميع: من صفوف كثيرة إلى إجابة واحدة

**الدالة التجميعية (aggregate function)** تقرأ صفوفاً كثيرة وتُرجع قيمة واحدة. الخمس التي ستستخدمها يومياً: \`COUNT\` (كم العدد)، \`SUM\` (المجموع)، \`AVG\` (المتوسط)، \`MIN\` و\`MAX\`.

\`\`\`sql
SELECT COUNT(*), SUM(total_cents), MAX(total_cents) FROM orders;   -- صف واحد للجدول كله
\`\`\`

أضف **GROUP BY** لتحصل على صف **لكل مجموعة** بدلاً من ذلك:

\`\`\`sql
SELECT customer_id, COUNT(*) AS orders, SUM(total_cents) AS spent
FROM orders
GROUP BY customer_id;
\`\`\`

قاعدة عملية: كل عمود في \`SELECT\` إما مذكور في \`GROUP BY\` وإما ملفوف بدالة تجميعية. تفرض أغلب قواعد البيانات ذلك، لأن سؤال «أيّ قيمة من قيم المجموعة العشر أعرض؟» لا جواب له.

### WHERE مقابل HAVING

تذكّر الترتيب الذي تعمل به قاعدة البيانات:

1. \`FROM\` / \`JOIN\`: بناء الصفوف
2. \`WHERE\`: **إزالة صفوف** (قبل التجميع)
3. \`GROUP BY\`: تكوين المجموعات
4. \`HAVING\`: **إزالة مجموعات** (بعد التجميع)
5. \`SELECT\` ثم \`ORDER BY\` ثم \`LIMIT\`

\`\`\`sql
SELECT dept_id, COUNT(*) AS headcount, ROUND(AVG(salary), 1) AS avg_salary
FROM employees
WHERE salary >= 3000            -- الموظفون دون 3000 لا يُحتسبون إطلاقاً
GROUP BY dept_id
HAVING COUNT(*) >= 2            -- الأقسام التي بقي فيها أقل من موظفَين تختفي
ORDER BY avg_salary DESC;
\`\`\`

الكتابة \`WHERE COUNT(*) >= 2\` خطأ: حين يعمل \`WHERE\` لا توجد مجموعات بعد.

### COUNT(*) مقابل COUNT(column)

\`COUNT(*)\` يعدّ الصفوف. أما \`COUNT(column)\` فيعدّ الصفوف التي قيمة ذلك العمود فيها **ليست NULL**. وكل الدوال التجميعية الأخرى (\`SUM\` و\`AVG\` و\`MIN\` و\`MAX\`) **تتجاهل NULL** أيضاً.

يهم هذا في الـ left join. كارلا بلا طلبات، لكن الربط أنتج لها مع ذلك **صفاً واحداً** (فيه NULL):

\`\`\`sql
SELECT c.name, COUNT(*) AS wrong, COUNT(o.id) AS right
FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id;
-- كارلا: wrong = 1, right = 0
\`\`\`

ولاحظ أيضاً أن \`SUM\` لصفوف معدومة هو NULL لا 0. لفّه هكذا: \`COALESCE(SUM(x), 0)\` يعطي 0 حين لا يوجد تطابق.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// GROUP BY in plain JavaScript: WHERE, then group, then HAVING.
const staff = [
  { name: "Hana", dept: "Engineering", salary: 5200 },
  { name: "Idris", dept: "Engineering", salary: 4800 },
  { name: "Lina", dept: "Design", salary: 4100 },
  { name: "Nabil", dept: "Support", salary: 2800 },
  { name: "Omar", dept: "Support", salary: 3000 },
  { name: "Pia", dept: "Support", salary: null }, // unknown salary
];

const kept = staff.filter((s) => s.salary !== null && s.salary >= 3000); // WHERE
const groups = new Map();                                                 // GROUP BY dept
for (const s of kept) {
  if (!groups.has(s.dept)) groups.set(s.dept, []);
  groups.get(s.dept).push(s.salary);
}
for (const [dept, salaries] of groups) {
  if (salaries.length < 2) continue;                                      // HAVING COUNT(*) >= 2
  const avg = salaries.reduce((a, b) => a + b, 0) / salaries.length;
  console.log(dept, "headcount", salaries.length, "avg", avg);
}`,
      explanation: {
        en: "Only Engineering survives: WHERE removed the low and unknown salaries before grouping, Design is left with one employee, and Support with one, so HAVING dropped both. Aggregates in SQL skip NULL the same way the salary !== null test does here.",
        ar: "لا ينجو إلا Engineering: أزال WHERE الرواتب المنخفضة والمجهولة قبل التجميع، وبقي في Design موظف واحد وفي Support موظف واحد، فأسقط HAVING القسمين. وتتخطى الدوال التجميعية في SQL قيم NULL كما يفعل اختبار salary !== null هنا.",
      },
    },
    {
      type: "lab",
      id: "group-having",
      lang: "python",
      prompt: {
        en: `Tables \`departments\` and \`employees\` exist. Write \`report_sql\` to summarize each department:

- only count employees with \`salary >= :min_salary\` (a **WHERE** filter, applied before grouping)
- only show departments with at least \`:min_headcount\` such employees (a **HAVING** filter)
- select the department name, the headcount, the average salary and the highest salary (in that order)
- order by average salary, highest first, then by department name

**Input:** two integers: \`<min headcount> <min salary>\`.
**Output:** the program prints \`Name: headcount=N avg=A max=M\` per department, or \`no department qualifies\`.

Example: input \`3 3000\` prints \`Engineering: headcount=4 avg=5150.0 max=6100\` only (Design has 2 qualifying employees, Support has 2).`,
        ar: `الجدولان \`departments\` و\`employees\` موجودان. اكتب \`report_sql\` ليلخّص كل قسم:

- احسب فقط الموظفين الذين \`salary >= :min_salary\` (فلتر **WHERE** يُطبَّق قبل التجميع)
- اعرض فقط الأقسام فيها \`:min_headcount\` من هؤلاء الموظفين على الأقل (فلتر **HAVING**)
- اختر اسم القسم وعدد الموظفين ومتوسط الراتب وأعلى راتب (بهذا الترتيب)
- رتّب بمتوسط الراتب من الأعلى، ثم باسم القسم

**الدخل:** عددان صحيحان: \`<min headcount> <min salary>\`.
**الخرج:** يطبع البرنامج \`Name: headcount=N avg=A max=M\` لكل قسم، أو \`no department qualifies\`.

مثال: الدخل \`3 3000\` يطبع \`Engineering: headcount=4 avg=5150.0 max=6100\` فقط (في Design موظفان مؤهلان، وفي Support موظفان).`,
      },
      starterCode: `${STAFF_SEED}
# TODO: add the WHERE filter (salary) and the HAVING filter (headcount),
# and sort by average salary (highest first), then department name.
report_sql = """
    SELECT d.name, COUNT(*), AVG(e.salary), MAX(e.salary)
    FROM departments d
    JOIN employees e ON e.dept_id = d.id
    GROUP BY d.id
"""
${STAFF_REPORT}`,
      solution: `${STAFF_SEED}
# WHERE removes employees before grouping; HAVING removes groups afterwards.
report_sql = """
    SELECT d.name, COUNT(*) AS headcount, AVG(e.salary) AS avg_salary, MAX(e.salary)
    FROM departments d
    JOIN employees e ON e.dept_id = d.id
    WHERE e.salary >= :min_salary
    GROUP BY d.id
    HAVING COUNT(*) >= :min_headcount
    ORDER BY avg_salary DESC, d.name
"""
${STAFF_REPORT}`,
      hints: [
        { en: "A condition about one employee (their salary) goes in WHERE, before GROUP BY. A condition about a whole group (how many employees) goes in HAVING, after it.", ar: "الشرط المتعلق بموظف واحد (راتبه) يوضع في WHERE قبل GROUP BY. والشرط المتعلق بمجموعة كاملة (عدد الموظفين) يوضع في HAVING بعدها." },
        { en: "HAVING can use aggregates directly: HAVING COUNT(*) >= :min_headcount.", ar: "يستطيع HAVING استخدام الدوال التجميعية مباشرة: HAVING COUNT(*) >= :min_headcount." },
        { en: "Give AVG(e.salary) an alias such as avg_salary and use it in ORDER BY avg_salary DESC, d.name.", ar: "أعطِ AVG(e.salary) اسماً مستعاراً مثل avg_salary واستخدمه في ORDER BY avg_salary DESC, d.name." },
      ],
      tests: [
        { name: { en: "No real filter: every department with employees", ar: "بلا فلتر فعلي: كل قسم فيه موظفون" }, stdin: "1 0\n", expected: "Engineering: headcount=4 avg=5150.0 max=6100\nDesign: headcount=2 avg=4000.0 max=4100\nSupport: headcount=5 avg=2900.0 max=3100" },
        { name: { en: "Salary filter shrinks the groups before counting", ar: "فلتر الراتب يصغّر المجموعات قبل العدّ" }, stdin: "2 3000\n", expected: "Engineering: headcount=4 avg=5150.0 max=6100\nDesign: headcount=2 avg=4000.0 max=4100\nSupport: headcount=2 avg=3050.0 max=3100" },
        { name: { en: "HAVING removes small groups", ar: "HAVING يزيل المجموعات الصغيرة" }, stdin: "3 3000\n", expected: "Engineering: headcount=4 avg=5150.0 max=6100" },
        { name: { en: "Single employee above a high salary bar", ar: "موظف وحيد فوق حدّ راتب مرتفع" }, stdin: "1 6000\n", expected: "Engineering: headcount=1 avg=6100.0 max=6100" },
        { name: { en: "Nothing qualifies", ar: "لا شيء مؤهل" }, stdin: "9 0\n", expected: "no department qualifies" },
      ],
      sampleInput: "2 3000\n",
    },
    {
      type: "text",
      body: {
        en: `## Subqueries, EXISTS and CTEs

A **subquery** is a query inside another query. It can produce a single value, a list, or a whole table.

\`\`\`sql
-- A single value: employees paid more than the company average
SELECT name FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- A list: customers who placed at least one order
SELECT name FROM customers
WHERE id IN (SELECT customer_id FROM orders);
\`\`\`

A **correlated** subquery mentions a column of the outer query, so it is re-evaluated for each outer row. This finds employees who earn more than **their own department's** average:

\`\`\`sql
SELECT e.name
FROM employees e
WHERE e.salary > (SELECT AVG(x.salary) FROM employees x WHERE x.dept_id = e.dept_id);
\`\`\`

### Readable steps with a CTE

A **CTE** (common table expression, \`WITH\`) gives a subquery a name, so a long query reads top to bottom:

\`\`\`sql
WITH dept_avg AS (
  SELECT dept_id, AVG(salary) AS avg_salary FROM employees GROUP BY dept_id
)
SELECT e.name, e.salary, d.avg_salary
FROM employees e JOIN dept_avg d ON d.dept_id = e.dept_id
WHERE e.salary > d.avg_salary;
\`\`\`

### "Who has none?" and the NOT IN trap

To find rows with **no match**, the natural query is \`NOT IN\`:

\`\`\`sql
SELECT name FROM products
WHERE id NOT IN (SELECT product_id FROM order_items);   -- dangerous!
\`\`\`

If even one \`product_id\` in the subquery is **NULL**, this returns **no rows at all**. Why? \`id NOT IN (1, 2, NULL)\` means \`id <> 1 AND id <> 2 AND id <> NULL\`. The last comparison is **unknown**, never true, so the whole condition can never be true. There is no error, only a silently empty answer.

Two safe forms:

\`\`\`sql
-- 1. NOT EXISTS: does a matching row exist? NULLs never match, so they cause no harm.
SELECT p.name FROM products p
WHERE NOT EXISTS (SELECT 1 FROM order_items i WHERE i.product_id = p.id);

-- 2. LEFT JOIN, then keep the rows where the right side is missing.
SELECT p.name FROM products p
LEFT JOIN order_items i ON i.product_id = p.id
WHERE i.id IS NULL;
\`\`\`

\`EXISTS\` only asks "is there at least one row?", so what the inner \`SELECT\` returns does not matter (by convention \`SELECT 1\`). Use \`NOT EXISTS\` or the LEFT JOIN form, and keep \`NOT IN\` for fixed lists such as \`NOT IN ('a', 'b')\`.`,
        ar: `## الاستعلامات الفرعية وEXISTS والـ CTE

**الاستعلام الفرعي (subquery)** هو استعلام داخل استعلام آخر. يمكنه إنتاج قيمة واحدة أو قائمة أو جدول كامل.

\`\`\`sql
-- قيمة واحدة: الموظفون الذين يتقاضون أكثر من متوسط الشركة
SELECT name FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- قائمة: العملاء الذين قدّموا طلباً واحداً على الأقل
SELECT name FROM customers
WHERE id IN (SELECT customer_id FROM orders);
\`\`\`

الاستعلام الفرعي **المترابط (correlated)** يذكر عموداً من الاستعلام الخارجي، فيُعاد تقييمه لكل صف خارجي. هذا يجد الموظفين الذين يتقاضون أكثر من متوسط **قسمهم هم**:

\`\`\`sql
SELECT e.name
FROM employees e
WHERE e.salary > (SELECT AVG(x.salary) FROM employees x WHERE x.dept_id = e.dept_id);
\`\`\`

### خطوات مقروءة مع CTE

يمنح **CTE** (common table expression، أي \`WITH\`) استعلاماً فرعياً اسماً، فيُقرأ الاستعلام الطويل من الأعلى إلى الأسفل:

\`\`\`sql
WITH dept_avg AS (
  SELECT dept_id, AVG(salary) AS avg_salary FROM employees GROUP BY dept_id
)
SELECT e.name, e.salary, d.avg_salary
FROM employees e JOIN dept_avg d ON d.dept_id = e.dept_id
WHERE e.salary > d.avg_salary;
\`\`\`

### «من ليس له شيء؟» وفخ NOT IN

للعثور على صفوف **بلا مطابقة** يخطر لك أولاً \`NOT IN\`:

\`\`\`sql
SELECT name FROM products
WHERE id NOT IN (SELECT product_id FROM order_items);   -- خطِر!
\`\`\`

إن كانت ولو قيمة واحدة من \`product_id\` في الاستعلام الفرعي **NULL** فإن هذا يُرجع **صفر صفوف**. لماذا؟ لأن \`id NOT IN (1, 2, NULL)\` تعني \`id <> 1 AND id <> 2 AND id <> NULL\`. المقارنة الأخيرة **مجهولة (unknown)** ولا تكون صحيحة أبداً، فلا يمكن أن يصح الشرط كله. لا يظهر خطأ، بل جواب فارغ بصمت.

صيغتان آمنتان:

\`\`\`sql
-- 1. NOT EXISTS: هل يوجد صف مطابق؟ لا تطابق قيم NULL شيئاً فلا ضرر منها.
SELECT p.name FROM products p
WHERE NOT EXISTS (SELECT 1 FROM order_items i WHERE i.product_id = p.id);

-- 2. LEFT JOIN ثم أبقِ الصفوف التي تغيب فيها الجهة اليمنى.
SELECT p.name FROM products p
LEFT JOIN order_items i ON i.product_id = p.id
WHERE i.id IS NULL;
\`\`\`

يسأل \`EXISTS\` فقط «هل يوجد صف واحد على الأقل؟»، فلا يهم ما يُرجعه الـ \`SELECT\` الداخلي (والعرف \`SELECT 1\`). استخدم \`NOT EXISTS\` أو صيغة LEFT JOIN، وأبقِ \`NOT IN\` للقوائم الثابتة مثل \`NOT IN ('a', 'b')\`.`,
      },
    },
    {
      type: "lab",
      id: "never-ordered",
      lang: "python",
      prompt: {
        en: `Tables \`products\` and \`order_items\` exist. One order line is a custom item with \`product_id = NULL\`. List the products that were **never ordered**, optionally limited to one category.

Write \`report_sql\` so it selects the product \`name\` of every product with no order line, in alphabetical order. It may use the named parameter \`:category\`: when it is \`*\`, every category is included, otherwise only products of that category.

**Input:** a category name, or \`*\`.
**Output:** the names joined by \`, \`, or \`(none)\`.

Example: input \`office\` prints \`Stapler\` (the Marker was ordered).`,
        ar: `الجدولان \`products\` و\`order_items\` موجودان. أحد بنود الطلبات صنف مخصص قيمة \`product_id\` فيه \`NULL\`. اعرض المنتجات التي **لم تُطلب قط**، مع إمكان حصرها في فئة واحدة.

اكتب \`report_sql\` ليختار \`name\` لكل منتج ليس له بند طلب، بترتيب أبجدي. يمكنه استخدام المعامل المسمّى \`:category\`: حين تكون قيمته \`*\` تُحتسب كل الفئات، وإلا فمنتجات تلك الفئة فقط.

**الدخل:** اسم فئة، أو \`*\`.
**الخرج:** الأسماء مفصولة بـ \`, \`، أو \`(none)\`.

مثال: الدخل \`office\` يطبع \`Stapler\` (طُلب الـ Marker).`,
      },
      starterCode: `${SHOP_SEED}
# TODO: this NOT IN returns nothing, because one product_id in order_items is NULL.
# Rewrite the "never ordered" test so NULLs cannot break it (NOT EXISTS or LEFT JOIN).
report_sql = """
    SELECT p.name
    FROM products p
    WHERE p.id NOT IN (SELECT product_id FROM order_items)
      AND (:category = '*' OR p.category = :category)
    ORDER BY p.name
"""
${SHOP_REPORT}`,
      solution: `${SHOP_SEED}
# NOT EXISTS only asks "is there a matching line?", so the NULL product_id is harmless.
report_sql = """
    SELECT p.name
    FROM products p
    WHERE NOT EXISTS (SELECT 1 FROM order_items i WHERE i.product_id = p.id)
      AND (:category = '*' OR p.category = :category)
    ORDER BY p.name
"""
${SHOP_REPORT}`,
      hints: [
        { en: "Run the starter: NOT IN returns an empty list for every input. A NULL inside the subquery makes the comparison unknown for every product.", ar: "شغّل الشيفرة الابتدائية: NOT IN تُرجع قائمة فارغة لكل دخل. وجود NULL داخل الاستعلام الفرعي يجعل المقارنة مجهولة لكل منتج." },
        { en: "Use WHERE NOT EXISTS (SELECT 1 FROM order_items i WHERE i.product_id = p.id), a correlated subquery.", ar: "استخدم WHERE NOT EXISTS (SELECT 1 FROM order_items i WHERE i.product_id = p.id)، وهو استعلام فرعي مترابط." },
        { en: "Alternatively, add WHERE product_id IS NOT NULL inside the NOT IN subquery. Keep the category condition outside it.", ar: "بديلاً عن ذلك أضف WHERE product_id IS NOT NULL داخل استعلام NOT IN الفرعي. وأبقِ شرط الفئة خارجه." },
      ],
      tests: [
        { name: { en: "All categories", ar: "كل الفئات" }, stdin: "*\n", expected: "Lamp, Planner, Stapler" },
        { name: { en: "One category with a single unordered product", ar: "فئة فيها منتج واحد غير مطلوب" }, stdin: "office\n", expected: "Stapler" },
        { name: { en: "Stationery: only the planner is unordered", ar: "القرطاسية: الـ planner وحده غير مطلوب" }, stdin: "stationery\n", expected: "Planner" },
        { name: { en: "A category whose products were all ordered", ar: "فئة طُلبت كل منتجاتها" }, stdin: "kitchen\n", expected: "(none)" },
        { name: { en: "Unknown category", ar: "فئة غير موجودة" }, stdin: "toys\n", expected: "(none)" },
      ],
      sampleInput: "*\n",
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Customers is the left table and orders the right one. Which join returns a customer who has never placed an order?", ar: "customers هو الجدول الأيسر وorders هو الأيمن. أي ربط يُرجع عميلاً لم يقدّم أي طلب؟" },
          choices: [
            { en: "INNER JOIN, because it keeps all rows from both tables", ar: "INNER JOIN، لأنه يُبقي كل الصفوف من الجدولين" },
            { en: "LEFT JOIN, which keeps every customer and fills the order columns with NULL", ar: "LEFT JOIN، فهو يُبقي كل عميل ويملأ أعمدة الطلب بـ NULL" },
            { en: "Both of them, they only differ in speed", ar: "كلاهما، فالفرق بينهما في السرعة فقط" },
            { en: "Neither: you need GROUP BY", ar: "لا واحد منهما: تحتاج GROUP BY" },
          ],
          answer: 1,
          explain: {
            en: "An INNER JOIN keeps only matched pairs, so a customer without orders disappears. A LEFT JOIN keeps every left row and pads the right side with NULL. The two differ in results, not just in speed.",
            ar: "الـ INNER JOIN يُبقي الأزواج المتطابقة فقط، فيختفي العميل الذي بلا طلبات. أما LEFT JOIN فيُبقي كل صف أيسر ويملأ الجهة اليمنى بـ NULL. الفرق بينهما في النتائج لا في السرعة فقط.",
          },
        },
        {
          q: { en: "After a LEFT JOIN, Carla has no orders. What do COUNT(*) and COUNT(o.id) return for her group?", ar: "بعد LEFT JOIN لا طلبات لكارلا. ماذا يُرجع COUNT(*) وCOUNT(o.id) لمجموعتها؟" },
          choices: [
            { en: "0 and 0", ar: "0 و0" },
            { en: "NULL and NULL", ar: "NULL وNULL" },
            { en: "1 and 0", ar: "1 و0" },
            { en: "0 and 1", ar: "0 و1" },
          ],
          answer: 2,
          explain: {
            en: "The join still produced one row for Carla, filled with NULLs, so COUNT(*) counts that row and gives 1. COUNT(o.id) skips NULLs and gives 0, which is the number you actually want.",
            ar: "أنتج الربط صفاً واحداً لكارلا مملوءاً بـ NULL، فيعدّ COUNT(*) هذا الصف ويعطي 1. أما COUNT(o.id) فيتخطى NULL ويعطي 0، وهو العدد الذي تريده فعلاً.",
          },
        },
        {
          q: { en: "You want departments with more than 5 employees. Where does the condition go?", ar: "تريد الأقسام التي فيها أكثر من 5 موظفين. أين يوضع الشرط؟" },
          choices: [
            { en: "HAVING COUNT(*) > 5, after GROUP BY", ar: "HAVING COUNT(*) > 5 بعد GROUP BY" },
            { en: "WHERE COUNT(*) > 5, before GROUP BY", ar: "WHERE COUNT(*) > 5 قبل GROUP BY" },
            { en: "ORDER BY COUNT(*) > 5", ar: "ORDER BY COUNT(*) > 5" },
            { en: "In the ON clause of the join", ar: "في جملة ON الخاصة بالربط" },
          ],
          answer: 0,
          explain: {
            en: "WHERE filters individual rows before groups exist, so it cannot use an aggregate. HAVING filters whole groups after aggregation. ORDER BY only sorts and ON controls how rows match in a join.",
            ar: "يفلتر WHERE الصفوف الفردية قبل وجود المجموعات، فلا يستطيع استخدام دالة تجميعية. ويفلتر HAVING مجموعات كاملة بعد التجميع. أما ORDER BY فيرتّب فقط، وON يتحكم في كيفية تطابق الصفوف في الربط.",
          },
        },
        {
          q: { en: "products has ids 1 to 5, and order_items.product_id contains the values 1, 2 and NULL. What does SELECT id FROM products WHERE id NOT IN (SELECT product_id FROM order_items) return?", ar: "في products المعرّفات من 1 إلى 5، وفي order_items.product_id القيم 1 و2 وNULL. ماذا يُرجع SELECT id FROM products WHERE id NOT IN (SELECT product_id FROM order_items)؟" },
          choices: [
            { en: "3, 4 and 5", ar: "3 و4 و5" },
            { en: "1 and 2", ar: "1 و2" },
            { en: "An error about the NULL", ar: "خطأ بسبب الـ NULL" },
            { en: "No rows at all", ar: "لا صفوف إطلاقاً" },
          ],
          answer: 3,
          explain: {
            en: "id NOT IN (1, 2, NULL) expands to id <> 1 AND id <> 2 AND id <> NULL. The last part is unknown for every id, so the whole condition is never true. Use NOT EXISTS, or filter the NULLs out of the subquery.",
            ar: "تتوسع id NOT IN (1, 2, NULL) إلى id <> 1 AND id <> 2 AND id <> NULL. الجزء الأخير مجهول لكل id، فلا يصح الشرط كله أبداً. استخدم NOT EXISTS أو أخرج قيم NULL من الاستعلام الفرعي.",
          },
        },
        {
          q: { en: "Two tables hold 3 customers and 4 orders. You write FROM customers, orders (or a JOIN with no ON condition) and nothing else. How many rows come back?", ar: "جدولان فيهما 3 عملاء و4 طلبات. كتبت FROM customers, orders (أو JOIN بلا شرط ON) ولا شيء غير ذلك. كم صفاً يعود؟" },
          choices: [
            { en: "4, one per order", ar: "4، واحد لكل طلب" },
            { en: "12, every customer paired with every order", ar: "12، كل عميل مقرون بكل طلب" },
            { en: "3, one per customer", ar: "3، واحد لكل عميل" },
          ],
          answer: 1,
          explain: {
            en: "Without a join condition every row of one table is paired with every row of the other: 3 x 4 = 12, a cross join. On big tables this is an accidental explosion, so a query that is suddenly huge and slow often lacks its ON.",
            ar: "بلا شرط ربط يُقرن كل صف من جدول بكل صف من الآخر: 3 × 4 = 12، وهذا cross join. وعلى الجداول الكبيرة يكون انفجاراً غير مقصود، فالاستعلام الذي يصبح ضخماً وبطيئاً فجأة كثيراً ما ينقصه ON.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap and what to practice next

- A **join** matches rows through a condition. **INNER** keeps matched pairs only; **LEFT** keeps every left row and fills the right with NULL.
- On a left join, put filters about the right table in **ON**; a **WHERE** on it removes the NULL rows again.
- **GROUP BY** makes one row per group. **WHERE** filters rows before grouping, **HAVING** filters groups after.
- **COUNT(\\*)** counts rows, **COUNT(column)** counts non-NULL values, and aggregates ignore NULL. \`SUM\` of nothing is NULL: use \`COALESCE\`.
- **Subqueries** and **CTEs** break a question into steps. Prefer **NOT EXISTS** over \`NOT IN\` when NULLs are possible.

**Practice next:** take the two tables from the first lab and answer new questions: the customer with the highest total, the average order per customer, customers whose every order is above 1000 (hint: compare \`MIN\`). Then read a query plan: the next lesson shows why a join on a big table is fast with the right **index** and painfully slow without one.`,
        ar: `## الخلاصة وما تتدرب عليه بعد ذلك

- **الربط (join)** يطابق الصفوف عبر شرط. **INNER** يُبقي الأزواج المتطابقة فقط؛ و**LEFT** يُبقي كل صف أيسر ويملأ الأيمن بـ NULL.
- في الـ left join ضع الفلاتر الخاصة بالجدول الأيمن في **ON**؛ فـ **WHERE** عليه يزيل صفوف NULL من جديد.
- **GROUP BY** ينتج صفاً لكل مجموعة. **WHERE** يفلتر الصفوف قبل التجميع، و**HAVING** يفلتر المجموعات بعده.
- **COUNT(\\*)** يعدّ الصفوف، و**COUNT(column)** يعدّ القيم غير NULL، والدوال التجميعية تتجاهل NULL. و\`SUM\` لا شيء يساوي NULL: استخدم \`COALESCE\`.
- **الاستعلامات الفرعية** و**الـ CTE** تقسم السؤال إلى خطوات. فضّل **NOT EXISTS** على \`NOT IN\` حين يكون NULL محتملاً.

**تدرّب بعد ذلك:** خذ الجدولين من المختبر الأول وأجب عن أسئلة جديدة: العميل صاحب أعلى إجمالي، ومتوسط الطلب لكل عميل، والعملاء الذين كل طلباتهم فوق 1000 (تلميح: قارن \`MIN\`). ثم اقرأ خطة استعلام: يبين الدرس التالي لماذا يكون الربط على جدول كبير سريعاً مع **الفهرس (index)** المناسب وبطيئاً بشدة بدونه.`,
      },
    },
  ],
};
