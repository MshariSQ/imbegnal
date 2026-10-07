import type { Lesson } from "../types";

const SALES_SEED = `import sqlite3
import sys

db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys = ON")

# One wide table: everything about an order line, copied on every row.
db.execute("""
    CREATE TABLE sales_flat (
        order_id    INTEGER NOT NULL,
        customer    TEXT    NOT NULL,
        city        TEXT    NOT NULL,
        product     TEXT    NOT NULL,
        price_cents INTEGER NOT NULL,
        qty         INTEGER NOT NULL
    )
""")
db.executemany(
    "INSERT INTO sales_flat VALUES (?, ?, ?, ?, ?, ?)",
    [
        (1, "Amal", "Cairo", "Notebook", 450, 2),
        (1, "Amal", "Cairo", "Pen", 125, 5),
        (2, "Bilal", "Amman", "Pen", 125, 10),
        (3, "Amal", "Cairo", "Backpack", 3000, 1),
        (3, "Amal", "Cairo", "Notebook", 450, 1),
        (4, "Carla", "Beirut", "Backpack", 3000, 1),
        (5, "Bilal", "Amman", "Notebook", 450, 4),
        (6, "Dina", "Tunis", "Pen", 125, 20),
    ],
)

# The target design: every fact is stored exactly once.
db.executescript("""
    CREATE TABLE customers (
        id   INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        city TEXT NOT NULL
    );
    CREATE TABLE products (
        id          INTEGER PRIMARY KEY,
        name        TEXT NOT NULL UNIQUE,
        price_cents INTEGER NOT NULL
    );
    CREATE TABLE orders (
        id          INTEGER PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id)
    );
    CREATE TABLE order_lines (
        order_id   INTEGER NOT NULL REFERENCES orders(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        qty        INTEGER NOT NULL,
        PRIMARY KEY (order_id, product_id)
    );
""")
`;

const SALES_REPORT = `
def count(table):
    return db.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]

print("customers:", count("customers"))
print("products:", count("products"))
print("orders:", count("orders"))
print("order_lines:", count("order_lines"))

# Price changes come from stdin: "<product> <new price in cents>".
# With one row per product, a price change touches exactly one row.
for line in sys.stdin.read().splitlines():
    if line.strip():
        name, cents = line.split()
        changed = db.execute("UPDATE products SET price_cents = ? WHERE name = ?", (int(cents), name)).rowcount
        print(f"price of {name}: {changed} row changed")

total = db.execute(
    """SELECT COALESCE(SUM(l.qty * p.price_cents), 0)
       FROM order_lines l JOIN products p ON p.id = l.product_id"""
).fetchone()[0]
print(f"value at current prices: {total / 100:.2f}")
`;

const ENROLL_SEED = `import sqlite3
import sys

db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys = ON")  # SQLite enforces foreign keys only when asked

db.executescript("""
    CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE courses  (id INTEGER PRIMARY KEY, title TEXT NOT NULL);
    INSERT INTO students (id, name) VALUES (1, 'Amal'), (2, 'Bilal'), (3, 'Carla');
    INSERT INTO courses  (id, title) VALUES (10, 'Algebra'), (20, 'Biology'), (30, 'Chemistry');
""")
`;

const ENROLL_RUN = `
for line in sys.stdin.read().splitlines():
    if not line.strip():
        continue
    student_id, course_id = line.split()
    try:
        db.execute("INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)", (int(student_id), int(course_id)))
        print("OK", student_id, course_id)
    except sqlite3.IntegrityError as err:
        print("REJECTED", student_id, course_id, "-", str(err).split(" constraint")[0])

# Students per course; LEFT JOIN keeps courses nobody joined (count 0).
report = """
    SELECT c.title, COUNT(e.student_id)
    FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id
    GROUP BY c.id ORDER BY c.id
"""
for title, n in db.execute(report):
    print(f"{title}: {n}")
`;

export const lesson: Lesson = {
  nodeId: "data-modeling-normalization",
  title: { en: "Data Modeling & Normalization", ar: "نمذجة البيانات والتطبيع" },
  estMinutes: 45,
  sections: [
    {
      type: "text",
      body: {
        en: `## The school register with the teacher's phone on every card 🏫

A school keeps one paper card per student. On each card the clerk writes the student's name, the course, **and the teacher's phone number**. It works until the teacher changes number. Now the clerk must find and fix 140 cards. Miss three, and the school holds two different "truths" about the same teacher.

The fix is old and simple: write the teacher's phone **once**, on a teacher card, and let student cards point to the teacher. That idea is **normalization**: *store every fact in exactly one place*.

## What you'll learn

- Turning a real-world story into **entities, attributes and relationships**
- One-to-one, one-to-many and many-to-many relationships, and the **junction table**
- The three **anomalies** that a bad design causes
- **1NF, 2NF and 3NF** in plain language ("the key, the whole key, and nothing but the key")
- When breaking the rules on purpose (**denormalization**) is the right call
- How the same modeling question looks in a **document store**

## Step 1: find the nouns and the verbs

Read the requirements out loud and underline the nouns: *customers* place *orders* that contain *products*. Each noun that has facts of its own becomes an **entity**, which becomes a **table**. The facts become **attributes**, which become **columns**. The verbs become **relationships**.

\`\`\`
customers 1 ────< orders >──── order_lines ────< products   (crow's feet mean "many")
   one customer places many orders; one order has many lines; each line is one product
\`\`\`

- **One-to-many (1:N)**: the most common. Put a **foreign key on the "many" side**: \`orders.customer_id\` points to \`customers.id\`.
- **One-to-one (1:1)**: rare. Usually it is one table split for privacy or size (e.g. \`users\` and \`user_private_details\`), with the key shared.
- **Many-to-many (N:M)**: students take many courses and a course has many students. A single foreign key cannot express it. You need a third table, a **junction** (or "bridge") table, with one row per pair and two foreign keys. The pair is usually its primary key.`,
        ar: `## سجل المدرسة الذي يحمل هاتف المعلم على كل بطاقة 🏫

تحتفظ مدرسة ببطاقة ورقية لكل طالب. يكتب الموظف على كل بطاقة اسم الطالب والمادة، **ورقم هاتف المعلم**. ينجح هذا إلى أن يغيّر المعلم رقمه. عندها على الموظف أن يجد 140 بطاقة ويصحّحها. إن فاتته ثلاث بطاقات صار لدى المدرسة «حقيقتان» مختلفتان عن المعلم نفسه.

الحل قديم وبسيط: اكتب هاتف المعلم **مرة واحدة** على بطاقة معلم، ودع بطاقات الطلاب تشير إليها. هذه الفكرة هي **التطبيع (normalization)**: *خزّن كل معلومة في مكان واحد فقط*.

## ماذا ستتعلم

- تحويل قصة من الواقع إلى **كيانات وخصائص وعلاقات**
- علاقات واحد-إلى-واحد وواحد-إلى-متعدد ومتعدد-إلى-متعدد، و**الجدول الوسيط (junction table)**
- **الشذوذات (anomalies)** الثلاثة التي يسببها التصميم السيئ
- **1NF و2NF و3NF** بلغة بسيطة («المفتاح، والمفتاح كله، ولا شيء غير المفتاح»)
- متى يكون كسر القواعد عمداً (**إلغاء التطبيع denormalization**) هو القرار الصحيح
- كيف يبدو سؤال النمذجة نفسه في **مخزن المستندات (document store)**

## الخطوة 1: ابحث عن الأسماء والأفعال

اقرأ المتطلبات بصوت عالٍ وضع خطاً تحت الأسماء: *عملاء* يقدّمون *طلبات* تحتوي *منتجات*. كل اسم له معلومات خاصة به يصبح **كياناً (entity)** ثم **جدولاً**. والمعلومات تصبح **خصائص (attributes)** ثم **أعمدة**. والأفعال تصبح **علاقات (relationships)**.

\`\`\`
customers 1 ────< orders >──── order_lines ────< products   (الأقدام الغرابية تعني "متعدد")
   عميل واحد يقدّم طلبات كثيرة؛ للطلب الواحد بنود كثيرة؛ كل بند منتج واحد
\`\`\`

- **واحد-إلى-متعدد (1:N)**: الأشيع. ضع **مفتاحاً أجنبياً في جهة «المتعدد»**: \`orders.customer_id\` يشير إلى \`customers.id\`.
- **واحد-إلى-واحد (1:1)**: نادرة. غالباً هي جدول واحد قُسّم لأجل الخصوصية أو الحجم (مثل \`users\` و\`user_private_details\`)، مع مفتاح مشترك.
- **متعدد-إلى-متعدد (N:M)**: الطلاب يدرسون مواد كثيرة وللمادة طلاب كثيرون. لا يكفي مفتاح أجنبي واحد للتعبير عنها. تحتاج جدولاً ثالثاً هو **الجدول الوسيط (junction أو bridge)**، فيه صف لكل زوج ومفتاحان أجنبيان. والزوج هو عادةً مفتاحه الأساسي.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Why a wide table goes wrong: three anomalies

Imagine one wide table, \`sales_flat\`, with one row per order line and the customer, city and product price copied onto every row.

- **Update anomaly:** Amal moves to Giza. She has 3 rows, and you must change all of them. Change two and the database now says she lives in two cities.
- **Insert anomaly:** you want to add a new product to the catalog, but it has not been sold yet. There is no row to put it on, because rows only exist for sales.
- **Delete anomaly:** Carla's only order is cancelled and you delete the row. You also lost the fact that Carla exists and lives in Beirut.

All three come from the same disease: **one table mixes several independent facts**.

## The normal forms, without the jargon

Think of three increasingly strict questions you ask about every column.

1. **1NF: one value per cell.** No lists in a cell (\`phones = '0100,0111'\`) and no repeating columns (\`phone1\`, \`phone2\`, \`phone3\`). Each row has the same shape and a primary key.
2. **2NF: depend on the whole key.** If the key has two columns, say \`(order_id, product_id)\`, every other column must depend on *both*. \`customer\` depends on \`order_id\` alone, so it belongs in an \`orders\` table. (2NF only matters when the key is composite.)
3. **3NF: depend on nothing but the key.** A column must not depend on another non-key column. In \`employees(id, name, dept_id, dept_name)\`, \`dept_name\` depends on \`dept_id\`, not on the employee, so it moves to \`departments\`.

The classic summary: every column depends on **the key, the whole key, and nothing but the key**. For most application schemas, 3NF is the goal. (BCNF is a slightly stricter version of 3NF, rarely a practical concern at this level.)

## Keys you will choose

- A **surrogate key** (\`id INTEGER PRIMARY KEY\`) has no meaning outside the database and never needs to change. A **natural key** (an email, a country code) carries meaning, which means it can change. Most tables use a surrogate primary key, and add \`UNIQUE\` on the natural key.
- Name things consistently: singular or plural table names (pick one), \`<table>_id\` for foreign keys.
- Do not store what you can compute (a person's age instead of their birth date, an order total that can drift from its lines), unless you do it on purpose (see below).

## Denormalization: breaking the rules with open eyes

Joins cost time, and sometimes a copy is the right design:

- **History must not change.** An order line must keep the price **at the time of purchase**. If it only pointed to \`products.price\`, raising the price would silently rewrite last year's invoices. The copied price is not redundancy, it is a different fact.
- **Read-heavy reporting** tables or cached counters (\`comments_count\`) trade write complexity for fast reads.

The rule: normalize first, denormalize only for a **measured** need, and write down who keeps the copy consistent (a trigger, a job, application code).

## Your turn: split the wide table

In the lab, \`sales_flat\` already holds the data and the four target tables exist and are empty. You fill them with \`INSERT ... SELECT\`. This statement copies the *result of a query* into a table:

\`\`\`sql
INSERT INTO customers (name, city)
SELECT DISTINCT customer, city FROM sales_flat;   -- DISTINCT removes duplicate rows
\`\`\`

For \`orders\` and \`order_lines\` you must look up the new \`id\` of the customer or product. A **JOIN** matches rows of two tables on a condition. The next lesson studies joins in depth; here is the shape you need:

\`\`\`sql
SELECT f.order_id, c.id
FROM sales_flat f
JOIN customers c ON c.name = f.customer;   -- pair each flat row with its customer row
\`\`\``,
        ar: `## لماذا يفشل الجدول العريض: ثلاثة شذوذات

تخيّل جدولاً عريضاً واحداً \`sales_flat\` فيه صف لكل بند طلب، ومعه العميل والمدينة وسعر المنتج منسوخة في كل صف.

- **شذوذ التحديث (update anomaly):** انتقلت أمل إلى الجيزة. لها 3 صفوف، وعليك تغييرها كلها. غيّرت صفين فصارت قاعدة البيانات تقول إنها تسكن مدينتين.
- **شذوذ الإدخال (insert anomaly):** تريد إضافة منتج جديد إلى الكتالوج لكنه لم يُبَع بعد. لا يوجد صف تضعه فيه، لأن الصفوف لا توجد إلا للمبيعات.
- **شذوذ الحذف (delete anomaly):** أُلغي الطلب الوحيد لكارلا فحذفت الصف. فخسرت أيضاً معلومة أن كارلا موجودة وتسكن بيروت.

تأتي الثلاثة من المرض نفسه: **جدول واحد يخلط عدة معلومات مستقلة**.

## الصيغ المعيارية (Normal Forms) بدون مصطلحات ثقيلة

فكّر فيها كثلاثة أسئلة متزايدة الصرامة تطرحها عن كل عمود.

1. **1NF: قيمة واحدة في كل خلية.** لا قوائم داخل الخلية (\`phones = '0100,0111'\`) ولا أعمدة متكررة (\`phone1\` و\`phone2\` و\`phone3\`). لكل الصفوف الشكل نفسه ولها مفتاح أساسي.
2. **2NF: الاعتماد على المفتاح كله.** إن كان المفتاح عمودين، مثل \`(order_id, product_id)\`، فيجب أن يعتمد كل عمود آخر على *الاثنين معاً*. العمود \`customer\` يعتمد على \`order_id\` وحده، فمكانه جدول \`orders\`. (لا تهم 2NF إلا إذا كان المفتاح مركباً.)
3. **3NF: لا اعتماد على غير المفتاح.** يجب ألا يعتمد عمود على عمود آخر غير مفتاحي. في \`employees(id, name, dept_id, dept_name)\` يعتمد \`dept_name\` على \`dept_id\` لا على الموظف، فينتقل إلى \`departments\`.

الخلاصة الكلاسيكية: كل عمود يعتمد على **المفتاح، والمفتاح كله، ولا شيء غير المفتاح**. وفي أغلب مخططات التطبيقات يكون 3NF هو الهدف. (BCNF نسخة أشد قليلاً من 3NF، ونادراً ما تكون همّاً عملياً في هذا المستوى.)

## المفاتيح التي ستختارها

- **المفتاح البديل (surrogate key)** (\`id INTEGER PRIMARY KEY\`) لا معنى له خارج قاعدة البيانات ولا يحتاج إلى تغيير. أما **المفتاح الطبيعي (natural key)** (بريد إلكتروني، رمز دولة) فله معنى، أي أنه قد يتغير. تستخدم معظم الجداول مفتاحاً أساسياً بديلاً وتضيف \`UNIQUE\` على المفتاح الطبيعي.
- سمِّ الأشياء بثبات: أسماء الجداول بالمفرد أو بالجمع (اختر أحدهما)، و\`<table>_id\` للمفاتيح الأجنبية.
- لا تخزّن ما يمكنك حسابه (العمر بدل تاريخ الميلاد، أو إجمالي طلب قد ينحرف عن بنوده)، إلا إذا فعلت ذلك عمداً (انظر أدناه).

## إلغاء التطبيع: كسر القواعد بعينين مفتوحتين

الـ joins تكلّف وقتاً، وأحياناً تكون النسخة هي التصميم الصحيح:

- **التاريخ يجب ألا يتغير.** يجب أن يحتفظ بند الطلب بالسعر **وقت الشراء**. فلو اكتفى بالإشارة إلى \`products.price\` لأعاد رفعُ السعر كتابة فواتير العام الماضي بصمت. السعر المنسوخ ليس تكراراً، بل معلومة مختلفة.
- جداول **التقارير كثيرة القراءة** أو العدّادات المخزّنة (\`comments_count\`) تقايض تعقيد الكتابة بسرعة القراءة.

القاعدة: طبّع أولاً، ولا تُلغِ التطبيع إلا لحاجة **مقيسة**، ودوّن من يُبقي النسخة متسقة (trigger أو مهمة مجدولة أو شيفرة التطبيق).

## دورك: قسّم الجدول العريض

في المختبر يحمل \`sales_flat\` البيانات، والجداول الأربعة الهدف موجودة وفارغة. تملؤها بـ \`INSERT ... SELECT\`. تنسخ هذه الجملة *نتيجة استعلام* إلى جدول:

\`\`\`sql
INSERT INTO customers (name, city)
SELECT DISTINCT customer, city FROM sales_flat;   -- DISTINCT تزيل الصفوف المكررة
\`\`\`

أما \`orders\` و\`order_lines\` فعليك أن تبحث فيهما عن \`id\` الجديد للعميل أو المنتج. **JOIN** يطابق صفوف جدولين وفق شرط. سندرس الـ joins بعمق في الدرس التالي؛ وهذا هو الشكل الذي تحتاجه:

\`\`\`sql
SELECT f.order_id, c.id
FROM sales_flat f
JOIN customers c ON c.name = f.customer;   -- اقرن كل صف مسطّح بصف العميل الخاص به
\`\`\``,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `# The update anomaly in miniature.
# Design A: the teacher's phone is copied onto every student card.
cards = [
    {"student": "Amal", "teacher": "Mr. Samir", "teacher_phone": "0100"},
    {"student": "Bilal", "teacher": "Mr. Samir", "teacher_phone": "0100"},
    {"student": "Carla", "teacher": "Mr. Samir", "teacher_phone": "0100"},
]

# Mr. Samir changes number, but the clerk only fixes two cards.
cards[0]["teacher_phone"] = "0111"
cards[1]["teacher_phone"] = "0111"

phones = {c["teacher_phone"] for c in cards if c["teacher"] == "Mr. Samir"}
print("Design A phones for Mr. Samir:", sorted(phones))  # two truths!

# Design B: the phone lives once, on the teacher record.
teachers = {"Mr. Samir": {"phone": "0100"}}
students = [
    {"student": "Amal", "teacher": "Mr. Samir"},
    {"student": "Bilal", "teacher": "Mr. Samir"},
    {"student": "Carla", "teacher": "Mr. Samir"},
]
teachers["Mr. Samir"]["phone"] = "0111"  # one change
for s in students:
    print("Design B:", s["student"], "->", teachers[s["teacher"]]["phone"])`,
      explanation: {
        en: "Design A can contradict itself because the same fact is stored three times. Design B has one place to update, so it cannot disagree with itself. That single place is what a foreign key plus a JOIN gives you in SQL.",
        ar: "قد يناقض التصميم A نفسه لأن المعلومة ذاتها مخزّنة ثلاث مرات. أما التصميم B ففيه مكان واحد للتحديث فلا يمكنه أن يخالف نفسه. وهذا المكان الواحد هو ما يمنحك إياه المفتاح الأجنبي مع JOIN في SQL.",
      },
    },
    {
      type: "lab",
      id: "split-wide-table",
      lang: "python",
      prompt: {
        en: `Normalize \`sales_flat\` (one row per order line, everything copied) into four tables that already exist but are empty:

- \`customers (id, name, city)\`: one row per distinct customer
- \`products (id, name, price_cents)\`: one row per distinct product
- \`orders (id, customer_id)\`: one row per order, keeping the original \`order_id\` as \`id\`
- \`order_lines (order_id, product_id, qty)\`: one row per line

Write four \`INSERT ... SELECT\` statements (in this order, because of the foreign keys). The program then prints the row counts, applies price changes read from stdin (\`<product> <new price in cents>\`) and prints the value of all lines at current prices, computed through a JOIN.

**Output:** counts, one \`price of X: N row changed\` line per input line, then \`value at current prices: V\`.

Example: with correct inserts and empty input, the counts are \`customers: 4\`, \`products: 3\`, \`orders: 6\`, \`order_lines: 8\`.`,
        ar: `طبّع الجدول \`sales_flat\` (صف لكل بند طلب، وكل شيء منسوخ) إلى أربعة جداول موجودة لكنها فارغة:

- \`customers (id, name, city)\`: صف لكل عميل مختلف
- \`products (id, name, price_cents)\`: صف لكل منتج مختلف
- \`orders (id, customer_id)\`: صف لكل طلب، مع إبقاء \`order_id\` الأصلي كـ \`id\`
- \`order_lines (order_id, product_id, qty)\`: صف لكل بند

اكتب أربع جمل \`INSERT ... SELECT\` (بهذا الترتيب بسبب المفاتيح الأجنبية). بعدها يطبع البرنامج أعداد الصفوف، ويطبّق تغييرات الأسعار المقروءة من stdin (\`<product> <new price in cents>\`) ويطبع قيمة كل البنود بالأسعار الحالية، محسوبة عبر JOIN.

**الخرج:** الأعداد، وسطر \`price of X: N row changed\` لكل سطر دخل، ثم \`value at current prices: V\`.

مثال: مع إدخالات صحيحة ودخل فارغ تكون الأعداد \`customers: 4\` و\`products: 3\` و\`orders: 6\` و\`order_lines: 8\`.`,
      },
      starterCode: `${SALES_SEED}
# TODO: fill the four tables from sales_flat, in this order.
customers_sql = "SELECT 1"    # INSERT INTO customers (name, city) SELECT DISTINCT ...
products_sql = "SELECT 1"     # INSERT INTO products (name, price_cents) SELECT DISTINCT ...
orders_sql = "SELECT 1"       # INSERT INTO orders (id, customer_id) SELECT DISTINCT ... JOIN customers ...
lines_sql = "SELECT 1"        # INSERT INTO order_lines (order_id, product_id, qty) SELECT ... JOIN products ...

for sql in (customers_sql, products_sql, orders_sql, lines_sql):
    db.execute(sql)
${SALES_REPORT}`,
      solution: `${SALES_SEED}
# One row per distinct customer / product. IDs are assigned by the database.
customers_sql = "INSERT INTO customers (name, city) SELECT DISTINCT customer, city FROM sales_flat"
products_sql = "INSERT INTO products (name, price_cents) SELECT DISTINCT product, price_cents FROM sales_flat"

# An order belongs to the customer found by name; DISTINCT collapses its several lines to one row.
orders_sql = """
    INSERT INTO orders (id, customer_id)
    SELECT DISTINCT f.order_id, c.id
    FROM sales_flat f JOIN customers c ON c.name = f.customer
"""
# Each flat row becomes one line pointing at its product.
lines_sql = """
    INSERT INTO order_lines (order_id, product_id, qty)
    SELECT f.order_id, p.id, f.qty
    FROM sales_flat f JOIN products p ON p.name = f.product
"""

for sql in (customers_sql, products_sql, orders_sql, lines_sql):
    db.execute(sql)
${SALES_REPORT}`,
      hints: [
        { en: "customers and products are the easy ones: INSERT INTO customers (name, city) SELECT DISTINCT customer, city FROM sales_flat. DISTINCT keeps one row per unique combination.", ar: "العملاء والمنتجات هما الأسهل: INSERT INTO customers (name, city) SELECT DISTINCT customer, city FROM sales_flat. تُبقي DISTINCT صفاً واحداً لكل تركيبة فريدة." },
        { en: "For orders you need the customer's new id: JOIN customers c ON c.name = f.customer and select f.order_id, c.id. An order has several flat rows, so use DISTINCT.", ar: "في orders تحتاج إلى id العميل الجديد: JOIN customers c ON c.name = f.customer واختر f.order_id, c.id. للطلب عدة صفوف مسطّحة فاستخدم DISTINCT." },
        { en: "order_lines has one row per flat row (no DISTINCT): select f.order_id, p.id, f.qty and JOIN products p ON p.name = f.product.", ar: "في order_lines صف لكل صف مسطّح (بلا DISTINCT): اختر f.order_id, p.id, f.qty مع JOIN products p ON p.name = f.product." },
      ],
      tests: [
        { name: { en: "Row counts after normalizing", ar: "أعداد الصفوف بعد التطبيع" }, stdin: "", expected: "customers: 4\nproducts: 3\norders: 6\norder_lines: 8\nvalue at current prices: 135.25" },
        { name: { en: "One price change touches one row but changes every order", ar: "تغيير سعر واحد يمس صفاً واحداً ويغيّر كل الطلبات" }, stdin: "Pen 200\n", expected: "customers: 4\nproducts: 3\norders: 6\norder_lines: 8\nprice of Pen: 1 row changed\nvalue at current prices: 161.50" },
        { name: { en: "Several price changes", ar: "عدة تغييرات في الأسعار" }, stdin: "Pen 100\nBackpack 2500\nNotebook 500\n", expected: "customers: 4\nproducts: 3\norders: 6\norder_lines: 8\nprice of Pen: 1 row changed\nprice of Backpack: 1 row changed\nprice of Notebook: 1 row changed\nvalue at current prices: 120.00" },
        { name: { en: "Unknown product changes nothing", ar: "منتج غير معروف لا يغيّر شيئاً" }, stdin: "Eraser 99\n", expected: "customers: 4\nproducts: 3\norders: 6\norder_lines: 8\nprice of Eraser: 0 row changed\nvalue at current prices: 135.25" },
      ],
      sampleInput: "Pen 200\n",
    },
    {
      type: "lab",
      id: "junction-table",
      lang: "python",
      prompt: {
        en: `Students take many courses and courses have many students: a **many-to-many** relationship. \`students\` and \`courses\` already exist. Create the junction table \`enrollments\`:

- two columns, \`student_id\` and \`course_id\`, both \`INTEGER NOT NULL\`
- the **pair** \`(student_id, course_id)\` is the **primary key** (a student cannot join the same course twice)
- both columns are **foreign keys** (to \`students(id)\` and \`courses(id)\`)

The program (foreign keys are switched on for you) tries to enroll every \`student_id course_id\` pair from stdin, prints \`OK\` or \`REJECTED ... - KIND\`, then prints how many students each course has.

Example: the pairs \`1 10\` and \`1 10\` give \`OK 1 10\` and \`REJECTED 1 10 - UNIQUE\`.`,
        ar: `يدرس الطلاب مواد كثيرة وللمواد طلاب كثيرون: علاقة **متعدد-إلى-متعدد**. الجدولان \`students\` و\`courses\` موجودان. أنشئ الجدول الوسيط \`enrollments\`:

- عمودان \`student_id\` و\`course_id\` كلاهما \`INTEGER NOT NULL\`
- **الزوج** \`(student_id, course_id)\` هو **المفتاح الأساسي** (لا يستطيع الطالب الانضمام إلى المادة نفسها مرتين)
- العمودان كلاهما **مفتاحان أجنبيان** (إلى \`students(id)\` و\`courses(id)\`)

يحاول البرنامج (المفاتيح الأجنبية مفعّلة عنك) تسجيل كل زوج \`student_id course_id\` من stdin، ويطبع \`OK\` أو \`REJECTED ... - KIND\`، ثم يطبع عدد طلاب كل مادة.

مثال: الزوجان \`1 10\` و\`1 10\` يعطيان \`OK 1 10\` و\`REJECTED 1 10 - UNIQUE\`.`,
      },
      starterCode: `${ENROLL_SEED}
# TODO: add the composite PRIMARY KEY and the two FOREIGN KEYs.
db.execute("""
    CREATE TABLE enrollments (
        student_id INTEGER NOT NULL,
        course_id  INTEGER NOT NULL
    )
""")
${ENROLL_RUN}`,
      solution: `${ENROLL_SEED}
db.execute("""
    CREATE TABLE enrollments (
        student_id INTEGER NOT NULL REFERENCES students(id),
        course_id  INTEGER NOT NULL REFERENCES courses(id),
        PRIMARY KEY (student_id, course_id)
    )
""")
${ENROLL_RUN}`,
      hints: [
        { en: "A table-level constraint goes after the columns: PRIMARY KEY (student_id, course_id).", ar: "يوضع القيد على مستوى الجدول بعد الأعمدة: PRIMARY KEY (student_id, course_id)." },
        { en: "A column-level foreign key looks like: student_id INTEGER NOT NULL REFERENCES students(id).", ar: "يبدو المفتاح الأجنبي على مستوى العمود هكذا: student_id INTEGER NOT NULL REFERENCES students(id)." },
      ],
      tests: [
        { name: { en: "Valid enrollments and the roster", ar: "تسجيلات صالحة وقائمة الطلاب" }, stdin: "1 10\n1 20\n2 10\n", expected: "OK 1 10\nOK 1 20\nOK 2 10\nAlgebra: 2\nBiology: 1\nChemistry: 0" },
        { name: { en: "The same pair twice is rejected", ar: "الزوج نفسه مرتين يُرفض" }, stdin: "1 10\n1 10\n", expected: "OK 1 10\nREJECTED 1 10 - UNIQUE\nAlgebra: 1\nBiology: 0\nChemistry: 0" },
        { name: { en: "Unknown student or course is rejected", ar: "طالب أو مادة غير معروفين يُرفضان" }, stdin: "9 10\n1 99\n3 30\n", expected: "REJECTED 9 10 - FOREIGN KEY\nREJECTED 1 99 - FOREIGN KEY\nOK 3 30\nAlgebra: 0\nBiology: 0\nChemistry: 1" },
        { name: { en: "No input: every course is empty", ar: "بلا دخل: كل المواد فارغة" }, stdin: "", expected: "Algebra: 0\nBiology: 0\nChemistry: 0" },
      ],
      sampleInput: "1 10\n1 10\n9 10\n",
    },
    {
      type: "text",
      body: {
        en: `## The same question in a document store

A **document database** (MongoDB, Firestore, ...) stores JSON-like documents instead of table rows. There are no joins to lean on, so the modeling question becomes: **embed** or **reference**?

\`\`\`json
{ "id": 101, "total": 2500,
  "customer": { "id": 1, "name": "Amal", "city": "Cairo" } }   // embedded: one read, but copied

{ "id": 101, "total": 2500, "customerId": 1 }                   // referenced: small, needs a 2nd lookup
\`\`\`

- **Embed** when the child data is always read together with the parent, belongs to it alone and stays small (an order's address, a post's comments up to a limit). One read returns everything.
- **Reference** when the data is shared, grows without bound, or changes independently (a customer who has thousands of orders). Updating a customer's city then touches one document.

It is the same trade-off as before: copies make reads simple and updates dangerous. In the lab you do by hand what a migration from embedded to referenced documents does, in JavaScript.`,
        ar: `## السؤال نفسه في مخزن المستندات

تخزّن **قاعدة بيانات المستندات** (MongoDB وFirestore وغيرها) مستندات شبيهة بـ JSON بدل صفوف الجداول. لا توجد joins تعتمد عليها، فيصبح سؤال النمذجة: **نُضمّن (embed) أم نُحيل (reference)؟**

\`\`\`json
{ "id": 101, "total": 2500,
  "customer": { "id": 1, "name": "Amal", "city": "Cairo" } }   // مضمَّن: قراءة واحدة لكن منسوخ

{ "id": 101, "total": 2500, "customerId": 1 }                   // محال: صغير، ويحتاج بحثاً ثانياً
\`\`\`

- **ضمّن** حين تُقرأ بيانات الابن دائماً مع الأب، وتخصّه وحده، وتبقى صغيرة (عنوان الطلب، أو تعليقات منشور حتى حدّ معين). تُرجع قراءة واحدة كل شيء.
- **أحِل** حين تكون البيانات مشتركة، أو تنمو بلا حد، أو تتغير باستقلال (عميل لديه آلاف الطلبات). فيمسّ تحديث مدينة العميل مستنداً واحداً.

إنها المقايضة نفسها: النسخ تجعل القراءة بسيطة والتحديث خطراً. في المختبر تفعل يدوياً، بجافاسكربت، ما يفعله الترحيل (migration) من مستندات مضمَّنة إلى مستندات محالة.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// "Populate": resolving references yourself, the job a JOIN does in SQL.
const customers = new Map([
  [1, { id: 1, name: "Amal", city: "Cairo" }],
  [2, { id: 2, name: "Bilal", city: "Amman" }],
]);
const orders = [
  { id: 101, total: 2500, customerId: 1 },
  { id: 102, total: 900, customerId: 2 },
  { id: 103, total: 4100, customerId: 1 },
];

for (const o of orders) {
  const c = customers.get(o.customerId);
  console.log(\`order \${o.id}: \${o.total} cents, \${c.name} from \${c.city}\`);
}

// One update, visible everywhere the customer is referenced:
customers.get(1).city = "Giza";
console.log(orders.filter((o) => o.customerId === 1).map((o) => customers.get(o.customerId).city));`,
      explanation: {
        en: "References keep one copy of each customer, so a single change shows up in every order. The price is an extra lookup on every read, which is why embedding is attractive when the data never changes independently.",
        ar: "تُبقي الإحالات نسخة واحدة من كل عميل، فيظهر تغيير واحد في كل الطلبات. والثمن بحثٌ إضافي في كل قراءة، ولهذا يغري التضمين حين لا تتغير البيانات باستقلال.",
      },
    },
    {
      type: "lab",
      id: "embed-to-reference",
      lang: "javascript",
      prompt: {
        en: `Orders arrive as JSON documents with the customer **embedded**. Write \`normalize(orders)\` so it returns \`{ customers, orders }\`:

- \`customers\`: one object per distinct \`customer.id\`, in order of **first appearance**. If the same id shows up again with different data, the **later copy wins** (it is newer) but the customer keeps its original position.
- \`orders\`: each order as \`{ id, total, customerId }\` (keys in this order). A guest order has \`"customer": null\` and gets \`customerId: null\` (no customer is created).

**Input:** a JSON array of orders on stdin.
**Output:** two lines: \`JSON.stringify(customers)\` and \`JSON.stringify(orders)\` (the program prints them).

Example: \`[{"id":7,"total":50,"customer":{"id":1,"name":"Amal","city":"Cairo"}}]\` prints
\`\`\`
[{"id":1,"name":"Amal","city":"Cairo"}]
[{"id":7,"total":50,"customerId":1}]
\`\`\``,
        ar: `تصل الطلبات كمستندات JSON والعميل **مضمَّن** فيها. اكتب \`normalize(orders)\` لتُرجع \`{ customers, orders }\`:

- \`customers\`: كائن واحد لكل \`customer.id\` مختلف، بترتيب **أول ظهور**. إن ظهر المعرّف نفسه مجدداً ببيانات مختلفة فـ**النسخة اللاحقة تفوز** (فهي الأحدث) لكن يحتفظ العميل بموضعه الأصلي.
- \`orders\`: كل طلب بصيغة \`{ id, total, customerId }\` (المفاتيح بهذا الترتيب). طلب الضيف فيه \`"customer": null\` ويأخذ \`customerId: null\` (ولا يُنشأ عميل).

**الدخل:** مصفوفة JSON من الطلبات في stdin.
**الخرج:** سطران: \`JSON.stringify(customers)\` و\`JSON.stringify(orders)\` (يطبعهما البرنامج).

مثال: \`[{"id":7,"total":50,"customer":{"id":1,"name":"Amal","city":"Cairo"}}]\` يطبع
\`\`\`
[{"id":1,"name":"Amal","city":"Cairo"}]
[{"id":7,"total":50,"customerId":1}]
\`\`\``,
      },
      starterCode: `const fs = require("fs");

const input = JSON.parse(fs.readFileSync(0, "utf8"));

function normalize(orders) {
  // TODO: collect unique customers (later copies win, first position kept)
  // and rewrite every order as { id, total, customerId }.
  return { customers: [], orders: [] };
}

const result = normalize(input);
console.log(JSON.stringify(result.customers));
console.log(JSON.stringify(result.orders));
`,
      solution: `const fs = require("fs");

const input = JSON.parse(fs.readFileSync(0, "utf8"));

function normalize(orders) {
  // A Map keeps insertion order, and set() on an existing key keeps its position,
  // which is exactly "first position, latest data".
  const customers = new Map();
  const out = orders.map((o) => {
    if (o.customer) customers.set(o.customer.id, o.customer);
    return { id: o.id, total: o.total, customerId: o.customer ? o.customer.id : null };
  });
  return { customers: [...customers.values()], orders: out };
}

const result = normalize(input);
console.log(JSON.stringify(result.customers));
console.log(JSON.stringify(result.orders));
`,
      hints: [
        { en: "A Map keyed by customer id gives you de-duplication for free, and iterating it returns entries in insertion order.", ar: "الخريطة Map المفهرسة بمعرّف العميل تعطيك إزالة التكرار مجاناً، والمرور عليها يعيد العناصر بترتيب الإدخال." },
        { en: "map.set(id, customer) on an id that already exists replaces the value but does not move the entry. That matches 'later copy wins, first position kept'.", ar: "map.set(id, customer) على معرّف موجود يستبدل القيمة ولا يحرّك الإدخال. وهذا يطابق «النسخة اللاحقة تفوز والموضع الأول يبقى»." },
        { en: "Guest orders: check o.customer before reading o.customer.id, and use null for customerId.", ar: "طلبات الضيوف: افحص o.customer قبل قراءة o.customer.id، واستخدم null لـ customerId." },
      ],
      tests: [
        { name: { en: "Shared customers are stored once", ar: "العملاء المشتركون يُخزَّنون مرة واحدة" }, stdin: '[{"id":101,"total":2500,"customer":{"id":1,"name":"Amal","city":"Cairo"}},{"id":102,"total":900,"customer":{"id":2,"name":"Bilal","city":"Amman"}},{"id":103,"total":4100,"customer":{"id":1,"name":"Amal","city":"Cairo"}}]', expected: "[{\"id\":1,\"name\":\"Amal\",\"city\":\"Cairo\"},{\"id\":2,\"name\":\"Bilal\",\"city\":\"Amman\"}]\n[{\"id\":101,\"total\":2500,\"customerId\":1},{\"id\":102,\"total\":900,\"customerId\":2},{\"id\":103,\"total\":4100,\"customerId\":1}]" },
        { name: { en: "Empty input", ar: "دخل فارغ" }, stdin: "[]", expected: "[]\n[]" },
        { name: { en: "Guest order has no customer", ar: "طلب الضيف بلا عميل" }, stdin: '[{"id":1,"total":10,"customer":null},{"id":2,"total":20,"customer":{"id":5,"name":"Dina","city":"Tunis"}}]', expected: "[{\"id\":5,\"name\":\"Dina\",\"city\":\"Tunis\"}]\n[{\"id\":1,\"total\":10,\"customerId\":null},{\"id\":2,\"total\":20,\"customerId\":5}]" },
        { name: { en: "Stale copy: the later data wins, the position stays", ar: "نسخة قديمة: البيانات اللاحقة تفوز والموضع يبقى" }, stdin: '[{"id":1,"total":5,"customer":{"id":1,"name":"Amal","city":"Cairo"}},{"id":2,"total":6,"customer":{"id":2,"name":"Bilal","city":"Amman"}},{"id":3,"total":7,"customer":{"id":1,"name":"Amal","city":"Giza"}}]', expected: "[{\"id\":1,\"name\":\"Amal\",\"city\":\"Giza\"},{\"id\":2,\"name\":\"Bilal\",\"city\":\"Amman\"}]\n[{\"id\":1,\"total\":5,\"customerId\":1},{\"id\":2,\"total\":6,\"customerId\":2},{\"id\":3,\"total\":7,\"customerId\":1}]" },
      ],
      sampleInput: '[{"id":7,"total":50,"customer":{"id":1,"name":"Amal","city":"Cairo"}}]',
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "A wide table repeats each customer's city on every order row. A customer moves and only some of their rows are updated. What is this problem called?", ar: "جدول عريض يكرر مدينة كل عميل في كل صف طلب. انتقل عميل وحُدّثت بعض صفوفه فقط. ماذا تسمى هذه المشكلة؟" },
          choices: [
            { en: "An update anomaly", ar: "شذوذ تحديث (update anomaly)" },
            { en: "A deadlock", ar: "جمود (deadlock)" },
            { en: "A foreign key violation", ar: "انتهاك مفتاح أجنبي" },
            { en: "A phantom read", ar: "قراءة شبحية (phantom read)" },
          ],
          answer: 0,
          explain: {
            en: "Because the same fact is stored in many rows, an update can reach some copies and miss others, leaving the data self-contradictory. Deadlocks and phantom reads are concurrency issues, and nothing here breaks a foreign key.",
            ar: "لأن المعلومة نفسها مخزّنة في صفوف كثيرة، قد يصل التحديث إلى بعض النسخ ويفوت غيرها فتتناقض البيانات مع نفسها. أما الجمود والقراءة الشبحية فمشكلتا تزامن، ولا شيء هنا يخرق مفتاحاً أجنبياً.",
          },
        },
        {
          q: { en: "employees(id, name, dept_id, dept_name): which normal form does it break, and how do you fix it?", ar: "employees(id, name, dept_id, dept_name): أي صيغة معيارية تخرق، وكيف تصلحها؟" },
          choices: [
            { en: "1NF: put each value in its own table", ar: "1NF: ضع كل قيمة في جدول خاص" },
            { en: "3NF: dept_name depends on dept_id, so move it to a departments table", ar: "3NF: dept_name تعتمد على dept_id، فانقلها إلى جدول departments" },
            { en: "2NF: add a second column to the primary key", ar: "2NF: أضف عموداً ثانياً إلى المفتاح الأساسي" },
            { en: "None: duplicate names are harmless", ar: "لا شيء: تكرار الأسماء غير ضار" },
          ],
          answer: 1,
          explain: {
            en: "A non-key column (dept_name) depends on another non-key column (dept_id): a transitive dependency, which 3NF forbids. 2NF only concerns composite keys, and there is no repeating group, so 1NF holds.",
            ar: "عمود غير مفتاحي (dept_name) يعتمد على عمود غير مفتاحي آخر (dept_id): اعتماد متعدٍّ (transitive)، وهو ما تمنعه 3NF. أما 2NF فتخص المفاتيح المركبة فقط، ولا توجد مجموعة متكررة فـ 1NF محققة.",
          },
        },
        {
          q: { en: "How do you model a many-to-many relationship such as students and courses?", ar: "كيف تنمذج علاقة متعدد-إلى-متعدد مثل الطلاب والمواد؟" },
          choices: [
            { en: "Add a comma-separated course_ids column to students", ar: "أضف عموداً course_ids مفصولاً بفواصل إلى students" },
            { en: "Put a student_id foreign key in courses", ar: "ضع مفتاحاً أجنبياً student_id في courses" },
            { en: "Create a junction table with a foreign key to each side", ar: "أنشئ جدولاً وسيطاً فيه مفتاح أجنبي إلى كل جهة" },
            { en: "Duplicate each course row once per student", ar: "كرّر صف كل مادة مرة لكل طالب" },
          ],
          answer: 2,
          explain: {
            en: "A junction table has one row per (student, course) pair. A list in one cell breaks 1NF and cannot be constrained or joined cleanly, a single foreign key only expresses one-to-many, and duplicating course rows brings back the update anomaly.",
            ar: "في الجدول الوسيط صف لكل زوج (طالب، مادة). القائمة داخل خلية تكسر 1NF ولا يمكن فرض قيود عليها ولا ربطها بنظافة، والمفتاح الأجنبي الواحد يعبّر عن واحد-إلى-متعدد فقط، وتكرار صفوف المواد يعيد شذوذ التحديث.",
          },
        },
        {
          q: { en: "Which of these is a 1NF violation?", ar: "أي مما يلي انتهاك لـ 1NF؟" },
          choices: [
            { en: "A phones column containing '0100,0111'", ar: "عمود phones يحوي '0100,0111'" },
            { en: "Two customers living in the same city", ar: "عميلان يسكنان المدينة نفسها" },
            { en: "A foreign key that is NULL", ar: "مفتاح أجنبي قيمته NULL" },
            { en: "A table with a surrogate primary key", ar: "جدول له مفتاح أساسي بديل" },
          ],
          answer: 0,
          explain: {
            en: "1NF wants one atomic value per cell. A list packed into one cell cannot be searched, constrained or indexed properly: give each phone its own row in a related table. Shared cities are normal data, and a nullable foreign key just means 'no parent'.",
            ar: "تريد 1NF قيمة ذرّية واحدة في كل خلية. القائمة المحزومة في خلية واحدة لا يمكن البحث فيها أو تقييدها أو فهرستها جيداً: أعطِ كل هاتف صفاً خاصاً في جدول مرتبط. أما اشتراك مدينة فبيانات عادية، والمفتاح الأجنبي القابل لـ NULL يعني فقط «بلا أب».",
          },
        },
        {
          q: { en: "Order lines store the unit price at purchase time, even though products also has a price. Is this a design mistake?", ar: "تخزّن بنود الطلب سعر الوحدة وقت الشراء، مع أن products فيها سعر أيضاً. هل هذا خطأ تصميم؟" },
          choices: [
            { en: "Yes, every duplicate column is a 3NF violation and must be removed", ar: "نعم، كل عمود مكرر انتهاك لـ 3NF ويجب حذفه" },
            { en: "Yes, but only if the table has fewer than a million rows", ar: "نعم، لكن فقط إن كان في الجدول أقل من مليون صف" },
            { en: "No, it records a different fact (the historical price) that must not change when the catalog price changes", ar: "لا، فهو يسجّل معلومة مختلفة (السعر التاريخي) يجب ألا تتغير حين يتغير سعر الكتالوج" },
          ],
          answer: 2,
          explain: {
            en: "The catalog price is today's price, while the line price is what this customer was charged. They look alike but are different facts, so storing both is correct. Deliberate denormalization is justified when history or measured read cost demands it.",
            ar: "سعر الكتالوج هو سعر اليوم، أما سعر البند فهو ما حوسب به هذا العميل. يتشابهان لكنهما معلومتان مختلفتان، فتخزين الاثنين صحيح. إلغاء التطبيع المقصود مبرَّر حين يتطلبه التاريخ أو كلفة قراءة مقيسة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap and what to practice next

- Model by finding **entities** (nouns), **attributes** and **relationships**; one-to-many puts the foreign key on the "many" side; many-to-many needs a **junction table**.
- A wide table causes **update, insert and delete anomalies** because it stores many facts together.
- **1NF** one value per cell, **2NF** the whole key, **3NF** nothing but the key.
- **Denormalize deliberately**, for history or measured speed, and name who keeps the copies in sync.
- In document stores the same trade-off appears as **embed vs reference**.

**Practice next:** take a spreadsheet you actually use (expenses, a gym schedule, a team roster). List its columns, circle the ones that repeat the same fact on many rows, and sketch the tables you would split it into. Then try writing the \`CREATE TABLE\` statements with keys. The next lesson shows how to get the data back together with joins and aggregation.`,
        ar: `## الخلاصة وما تتدرب عليه بعد ذلك

- انمذج بإيجاد **الكيانات** (الأسماء) و**الخصائص** و**العلاقات**؛ واحد-إلى-متعدد يضع المفتاح الأجنبي في جهة «المتعدد»؛ ومتعدد-إلى-متعدد يحتاج **جدولاً وسيطاً**.
- الجدول العريض يسبب **شذوذات التحديث والإدخال والحذف** لأنه يخزّن معلومات كثيرة معاً.
- **1NF** قيمة واحدة في الخلية، **2NF** المفتاح كله، **3NF** لا شيء غير المفتاح.
- **ألغِ التطبيع عمداً**، لأجل التاريخ أو سرعة مقيسة، وسمِّ من يُبقي النسخ متزامنة.
- في مخازن المستندات تظهر المقايضة نفسها باسم **التضمين مقابل الإحالة**.

**تدرّب بعد ذلك:** خذ جدول بيانات تستعمله فعلاً (مصاريف، جدول نادٍ رياضي، قائمة فريق). اكتب أعمدته، وضع دائرة حول ما يكرر المعلومة نفسها في صفوف كثيرة، وارسم الجداول التي ستقسمه إليها. ثم جرّب كتابة جمل \`CREATE TABLE\` مع المفاتيح. يبيّن الدرس التالي كيف تعيد جمع البيانات بالـ joins والتجميع.`,
      },
    },
  ],
};
