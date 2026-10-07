import type { Lesson } from "../types";

// 3,000 deterministic orders (no randomness): customers 1..200 with 15 orders each,
// four statuses, and dates spread over 2024-01-01 .. 2025-12-30.
const ORDERS_SEED = `import sqlite3
import sys

db = sqlite3.connect(":memory:")
db.executescript("""
    CREATE TABLE orders (
        id          INTEGER PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        reference   TEXT NOT NULL,
        status      TEXT NOT NULL,
        created_at  TEXT NOT NULL,      -- ISO 8601 date: YYYY-MM-DD
        total_cents INTEGER NOT NULL
    );
    WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 3000)
    INSERT INTO orders (id, customer_id, reference, status, created_at, total_cents)
    SELECT i,
           (i * 37) % 200 + 1,
           printf('ORD-%06d', i),
           CASE i % 4 WHEN 0 THEN 'new' WHEN 1 THEN 'paid' WHEN 2 THEN 'shipped' ELSE 'cancelled' END,
           date('2024-01-01', '+' || (i * 7 % 730) || ' days'),
           500 + (i * 53) % 9000
    FROM n;
""")
`;

const LOOKUP_TAIL = `
# stdin: "<column> <value>" where column is customer_id or reference.
column, value = sys.stdin.read().split()

# The column name picks a fixed query from an allow-list: never paste user input into SQL text.
LOOKUPS = {
    "customer_id": ("SELECT id, total_cents FROM orders WHERE customer_id = ?", int),
    "reference": ("SELECT id, total_cents FROM orders WHERE reference = ?", str),
}
db.executescript(index_sql)
sql, convert = LOOKUPS[column]
param = (convert(value),)
rows = db.execute(sql, param).fetchall()
plan = [row[3] for row in db.execute("EXPLAIN QUERY PLAN " + sql, param)]

print(f"rows: {len(rows)}")
print("access: " + ("index search" if plan[0].startswith("SEARCH") else "full table scan"))
`;

const LATEST_TAIL = `
# stdin: an order status.
status = sys.stdin.read().strip()

latest_sql = """
    SELECT id, created_at FROM orders
    WHERE status = ?
    ORDER BY created_at DESC, id DESC
    LIMIT 5
"""
db.executescript(index_sql)
rows = db.execute(latest_sql, (status,)).fetchall()
plan = [row[3] for row in db.execute("EXPLAIN QUERY PLAN " + latest_sql, (status,))]

for order_id, day in rows:
    print(f"order {order_id} on {day}")
print("access: " + ("index search" if plan[0].startswith("SEARCH") else "full table scan"))
print("sort: " + ("extra sort step" if any("TEMP B-TREE" in step for step in plan) else "none"))
`;

const YEAR_TAIL = `
# stdin: a year, for example 2025.
year = int(sys.stdin.read())
params = {
    "year": str(year),                    # "2025"
    "year_start": f"{year}-01-01",        # first day of the year
    "year_end": f"{year + 1}-01-01",      # first day of the NEXT year
}
plan = [row[3] for row in db.execute("EXPLAIN QUERY PLAN " + count_sql, params)]
count = db.execute(count_sql, params).fetchone()[0]

print(f"orders in {year}: {count}")
print("access: " + ("index search" if plan[0].startswith("SEARCH") else "full table scan"))
`;

export const lesson: Lesson = {
  nodeId: "indexes-performance",
  title: { en: "Indexes & Query Performance", ar: "الفهارس وأداء الاستعلامات" },
  estMinutes: 45,
  sections: [
    {
      type: "text",
      body: {
        en: `## The cookbook with no index at the back 📖

You own a 500-page cookbook and want every recipe with **saffron**. With no index you must read every page from the first to the last. With an **index** at the back, you look up "saffron" in an alphabetical list, read "pages 41, 187, 302" and jump straight there.

A database index is exactly that: a **small, sorted side structure** that tells the database where rows live, so it can jump instead of reading everything. It comes with a price too: when the cookbook gets a new recipe, the index at the back must be updated as well.

Until now your queries were *correct*. This lesson is about making them *fast*, and about **proving** it instead of guessing.

## What you'll learn

- How an index works (a sorted tree) and why it turns a million steps into a handful
- \`CREATE INDEX\`, and how to read a query plan with \`EXPLAIN QUERY PLAN\`
- Composite indexes and why **column order** matters
- Writing queries an index can actually use ("sargable" conditions)
- What indexes cost, and when **not** to add one

In the labs you work with **SQLite** from Python and check the query plan with your own eyes.

## Scan or search?

With no index, answering \`WHERE customer_id = 7\` forces a **full table scan**: the database reads every row and keeps the matching ones. Ten rows, no problem. Ten million rows, every query reads ten million rows.

An index stores the values of one or more columns **in sorted order**, each with a pointer to its row. Sorted data can be searched like a dictionary: open in the middle, decide left or right, repeat. Searching a million sorted values takes about 20 comparisons (log2 of a million). Real databases use a **B-tree**: a shallow, wide tree of pages where each page narrows the search a lot, so even a table with millions of rows is usually reached in 3-4 page reads.

\`\`\`sql
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE UNIQUE INDEX idx_users_email ON users (email);   -- also forbids duplicates
DROP INDEX idx_orders_customer;
\`\`\`

Because the entries are sorted, one index helps with several jobs: equality (\`= 7\`), ranges (\`BETWEEN\`, \`>=\`, \`<\`) and \`ORDER BY\` on the same column.

Good to know: \`PRIMARY KEY\` and \`UNIQUE\` constraints already create an index for you. Most databases do **not** index a foreign-key column automatically (MySQL's InnoDB is an exception), so the \`customer_id\` in \`orders\` usually needs your own index.`,
        ar: `## كتاب الطبخ الذي بلا فهرس في آخره 📖

عندك كتاب طبخ من 500 صفحة وتريد كل وصفة فيها **الزعفران**. بلا فهرس عليك قراءة كل الصفحات من الأولى إلى الأخيرة. ومع **فهرس (index)** في آخر الكتاب تبحث عن "زعفران" في قائمة مرتبة أبجدياً، فتقرأ "الصفحات 41 و187 و302" وتقفز إليها مباشرة.

فهرس قاعدة البيانات هو هذا بالضبط: **بنية جانبية صغيرة ومرتبة** تخبر القاعدة أين تقع الصفوف، فتقفز بدل أن تقرأ كل شيء. وله ثمن أيضاً: حين تُضاف وصفة جديدة إلى الكتاب يجب تحديث الفهرس في آخره كذلك.

كانت استعلاماتك حتى الآن *صحيحة*. أما هذا الدرس فهو عن جعلها *سريعة*، و**إثبات** ذلك بدل التخمين.

## ماذا ستتعلم

- كيف يعمل الفهرس (شجرة مرتبة) ولماذا يحوّل مليون خطوة إلى بضع خطوات
- \`CREATE INDEX\`، وكيف تقرأ خطة الاستعلام بـ \`EXPLAIN QUERY PLAN\`
- الفهارس المركّبة ولماذا يهم **ترتيب الأعمدة**
- كتابة استعلامات يستطيع الفهرس استخدامها فعلاً (شروط "sargable")
- ما تكلفة الفهارس، ومتى **لا** تضيف فهرساً

في المختبرات تعمل مع **SQLite** من Python وتفحص خطة الاستعلام بعينيك.

## مسح أم بحث؟

بلا فهرس يضطر الجواب عن \`WHERE customer_id = 7\` إلى **مسح كامل للجدول (full table scan)**: تقرأ القاعدة كل صف وتُبقي المطابق منها. عشرة صفوف لا مشكلة. عشرة ملايين صف يعني أن كل استعلام يقرأ عشرة ملايين صف.

الفهرس يخزّن قيم عمود واحد أو أكثر **بترتيب مرتب**، ومع كل قيمة مؤشر إلى صفها. والبيانات المرتبة يمكن البحث فيها مثل القاموس: افتح من المنتصف، قرّر يميناً أو يساراً، وكرّر. البحث في مليون قيمة مرتبة يحتاج نحو 20 مقارنة (لوغاريتم مليون للأساس 2). وتستخدم القواعد الحقيقية **B-tree**: شجرة عريضة قليلة العمق من الصفحات، تضيّق كل صفحة فيها البحث كثيراً، فيُوصل عادةً إلى جدول بملايين الصفوف في 3-4 قراءات صفحات.

\`\`\`sql
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE UNIQUE INDEX idx_users_email ON users (email);   -- also forbids duplicates
DROP INDEX idx_orders_customer;
\`\`\`

ولأن الإدخالات مرتبة، يفيد فهرس واحد في عدة مهام: المساواة (\`= 7\`)، والمجالات (\`BETWEEN\` و\`>=\` و\`<\`)، و\`ORDER BY\` على العمود نفسه.

معلومة مفيدة: قيدا \`PRIMARY KEY\` و\`UNIQUE\` ينشئان فهرساً تلقائياً. أما عمود المفتاح الأجنبي فلا تفهرسه أغلب القواعد تلقائياً (InnoDB في MySQL استثناء)، لذلك يحتاج \`customer_id\` في \`orders\` عادةً إلى فهرس تنشئه بنفسك.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Reading a query plan

You never guess whether an index is used: you **ask the database**. In SQLite put \`EXPLAIN QUERY PLAN\` in front of the query (PostgreSQL and MySQL have \`EXPLAIN\`, and PostgreSQL's \`EXPLAIN ANALYZE\` also runs the query and reports real timings).

\`\`\`sql
EXPLAIN QUERY PLAN
SELECT id, total_cents FROM orders WHERE customer_id = 7;

-- no index:       SCAN orders
-- with an index:  SEARCH orders USING INDEX idx_orders_customer (customer_id=?)
\`\`\`

The two key words:

- **SCAN**: every row (or every index entry) is visited. Cost grows with the table.
- **SEARCH**: the database jumps to the matching entries through an index. The part in parentheses shows which conditions the index handled.

Careful with one look-alike: \`SCAN orders USING COVERING INDEX ...\` still **walks the whole index**. It is cheaper than reading the table, but it is a scan, not a jump. The exact wording of plans differs between versions and databases, so read them for the idea (scan versus search), not as a stable text format.

A plan can also say \`USE TEMP B-TREE FOR ORDER BY\`: the database had to collect rows and sort them itself. An index whose order already matches the \`ORDER BY\` removes that step, which matters a lot for "latest 10 orders" style queries.

### Why not index everything?

Every index must be updated by every \`INSERT\`, \`DELETE\`, and by an \`UPDATE\` of an indexed column, and it takes disk space. Reads get faster, writes get slower. The art is to index what your **real queries** filter, join, and sort on, and to **verify with the plan**.`,
        ar: `## قراءة خطة الاستعلام

لا تخمّن أبداً هل يُستخدم الفهرس: **اسأل القاعدة**. في SQLite ضع \`EXPLAIN QUERY PLAN\` قبل الاستعلام (في PostgreSQL وMySQL يوجد \`EXPLAIN\`، وأمر \`EXPLAIN ANALYZE\` في PostgreSQL ينفّذ الاستعلام فعلاً ويعطي أزمنة حقيقية).

\`\`\`sql
EXPLAIN QUERY PLAN
SELECT id, total_cents FROM orders WHERE customer_id = 7;

-- no index:       SCAN orders
-- with an index:  SEARCH orders USING INDEX idx_orders_customer (customer_id=?)
\`\`\`

الكلمتان المفتاحيتان:

- **SCAN**: تُزار كل الصفوف (أو كل إدخالات الفهرس). تزداد التكلفة مع حجم الجدول.
- **SEARCH**: تقفز القاعدة إلى الإدخالات المطابقة عبر فهرس. ويبيّن ما بين القوسين أي الشروط عالجها الفهرس.

انتبه إلى شبيه مضلّل: \`SCAN orders USING COVERING INDEX ...\` لا يزال **يمشي على الفهرس كله**. هو أرخص من قراءة الجدول لكنه مسح لا قفزة. وصياغة الخطط تختلف بين الإصدارات والقواعد، فاقرأها لفكرتها (مسح أم بحث) لا بوصفها نصاً ثابت الشكل.

وقد تقول الخطة \`USE TEMP B-TREE FOR ORDER BY\`: اضطرت القاعدة إلى جمع الصفوف وترتيبها بنفسها. والفهرس الذي يطابق ترتيبه جملة \`ORDER BY\` يزيل هذه الخطوة، وهذا مهم جداً في استعلامات من نوع "آخر 10 طلبات".

### لماذا لا نفهرس كل شيء؟

كل فهرس يجب تحديثه عند كل \`INSERT\` و\`DELETE\` وعند \`UPDATE\` لعمود مفهرس، ويشغل مساحة على القرص. القراءة تصير أسرع والكتابة أبطأ. الفن أن تفهرس ما تستخدمه **استعلاماتك الحقيقية** في الفلترة والربط والترتيب، وأن **تتحقق بالخطة**.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `# Finding one id among a million sorted ids: scanning versus binary search.
# A B-tree is a wider, disk-friendly cousin of binary search.
ids = list(range(0, 2_000_000, 2))  # 1,000,000 sorted ids
target = 1_999_998                  # the very last one: worst case for a scan


def scan(items, wanted):
    steps = 0
    for value in items:
        steps += 1
        if value == wanted:
            break
    return steps


def binary_search(items, wanted):
    low, high, steps = 0, len(items) - 1, 0
    while low <= high:
        steps += 1
        mid = (low + high) // 2
        if items[mid] == wanted:
            break
        if items[mid] < wanted:
            low = mid + 1
        else:
            high = mid - 1
    return steps


print("full scan steps:   ", scan(ids, target))
print("binary search steps:", binary_search(ids, target))`,
      explanation: {
        en: "The scan visits all 1,000,000 values before finding the last one, while binary search needs about 20 steps because the data is sorted. That sortedness is what an index buys you, and it is also why the index must be kept in order when rows change.",
        ar: "يزور المسح الخطي كل القيم المليون قبل أن يجد الأخيرة، بينما يحتاج البحث الثنائي نحو 20 خطوة لأن البيانات مرتبة. هذا الترتيب هو ما يشتريه لك الفهرس، وهو أيضاً سبب وجوب إبقاء الفهرس مرتباً عند تغيّر الصفوف.",
      },
    },
    {
      type: "lab",
      id: "first-indexes",
      lang: "python",
      prompt: {
        en: `A table \`orders\` with 3,000 rows exists, with columns \`id\`, \`customer_id\`, \`reference\` (like \`ORD-000500\`, unique per order), \`status\`, \`created_at\` and \`total_cents\`. The program looks up orders either by \`customer_id\` or by \`reference\`, then asks SQLite for the query plan.

Write \`index_sql\` (one or more \`CREATE INDEX\` statements) so that **both** lookups become an index **search** instead of a full table scan. Make the index on \`reference\` \`UNIQUE\`, since a reference identifies exactly one order.

**Input:** one line: \`customer_id <number>\` or \`reference <text>\`.

**Output:** \`rows: N\` (how many orders match) and \`access: index search\` or \`access: full table scan\`.

Example: \`customer_id 7\` prints \`rows: 15\` and \`access: index search\`.`,
        ar: `يوجد جدول \`orders\` فيه 3,000 صف بأعمدة \`id\` و\`customer_id\` و\`reference\` (مثل \`ORD-000500\`، فريد لكل طلب) و\`status\` و\`created_at\` و\`total_cents\`. يبحث البرنامج عن الطلبات إما بـ \`customer_id\` أو بـ \`reference\`، ثم يسأل SQLite عن خطة الاستعلام.

اكتب \`index_sql\` (عبارة \`CREATE INDEX\` واحدة أو أكثر) بحيث يصير **كلا** البحثين **بحثاً بالفهرس** بدل مسح كامل للجدول. اجعل فهرس \`reference\` من نوع \`UNIQUE\` لأن الـ reference يحدد طلباً واحداً بالضبط.

**الدخل:** سطر واحد: \`customer_id <number>\` أو \`reference <text>\`.

**الخرج:** \`rows: N\` (عدد الطلبات المطابقة) و\`access: index search\` أو \`access: full table scan\`.

مثال: \`customer_id 7\` يطبع \`rows: 15\` و\`access: index search\`.`,
      },
      starterCode: `${ORDERS_SEED}
# TODO: write the CREATE INDEX statements, separated by semicolons.
# Right now there is no index, so both lookups scan the whole table.
index_sql = """
    -- CREATE INDEX idx_orders_customer ON ...;
"""
${LOOKUP_TAIL}`,
      solution: `${ORDERS_SEED}
# customer_id repeats (many orders per customer): a plain index.
# reference is unique per order: a UNIQUE index also enforces that rule.
index_sql = """
    CREATE INDEX idx_orders_customer ON orders (customer_id);
    CREATE UNIQUE INDEX idx_orders_reference ON orders (reference);
"""
${LOOKUP_TAIL}`,
      hints: [
        { en: "The syntax is CREATE INDEX name ON table (column); and CREATE UNIQUE INDEX for a unique one. Separate statements with a semicolon.", ar: "الصياغة CREATE INDEX name ON table (column); ومع UNIQUE للفهرس الفريد. افصل العبارات بفاصلة منقوطة." },
        { en: "You need two indexes: one on orders (customer_id) and one on orders (reference).", ar: "تحتاج فهرسين: واحداً على orders (customer_id) وآخر على orders (reference)." },
        { en: "Full answer shape: CREATE INDEX idx_orders_customer ON orders (customer_id); CREATE UNIQUE INDEX idx_orders_reference ON orders (reference);", ar: "الشكل الكامل: CREATE INDEX idx_orders_customer ON orders (customer_id); CREATE UNIQUE INDEX idx_orders_reference ON orders (reference);" },
      ],
      tests: [
        { name: { en: "Customer 7: 15 orders found by index", ar: "العميل 7: 15 طلباً عبر الفهرس" }, stdin: "customer_id 7\n", expected: "rows: 15\naccess: index search" },
        { name: { en: "Last customer id (boundary)", ar: "آخر رقم عميل (حد)" }, stdin: "customer_id 200\n", expected: "rows: 15\naccess: index search" },
        { name: { en: "Unknown customer: no rows, still an index search", ar: "عميل غير موجود: لا صفوف وما زال بحثاً بالفهرس" }, stdin: "customer_id 999\n", expected: "rows: 0\naccess: index search" },
        { name: { en: "Exact reference: one row", ar: "مرجع محدد: صف واحد" }, stdin: "reference ORD-000500\n", expected: "rows: 1\naccess: index search" },
        { name: { en: "Missing reference: zero rows", ar: "مرجع غير موجود: صفر صفوف" }, stdin: "reference ORD-999999\n", expected: "rows: 0\naccess: index search" },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Composite indexes: column order matters

An index can cover **several columns**. Think of a phone book sorted by **last name, then first name**. It finds "Haddad" instantly, and "Haddad, Amal" instantly, but "everyone called Amal" is hopeless: Amals are scattered through every letter.

\`\`\`sql
CREATE INDEX idx_people_name ON people (last_name, first_name);

-- uses the index (leftmost column first):
WHERE last_name = 'Haddad'
WHERE last_name = 'Haddad' AND first_name = 'Amal'
-- cannot jump (skips the leftmost column):
WHERE first_name = 'Amal'
\`\`\`

This is the **leftmost prefix rule**: a composite index helps queries that use its columns from the left, without gaps.

### Equality first, then the sort or range column

Take the common query "the 5 latest orders with status X":

\`\`\`sql
SELECT id, created_at FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC, id DESC
LIMIT 5;
\`\`\`

- An index on \`(status)\` finds the paid orders, but the database must then **sort them all** to find the latest 5 (\`USE TEMP B-TREE FOR ORDER BY\`).
- An index on \`(status, created_at)\` finds the paid orders **already sorted by date**. It reads the last 5 entries and stops: no sorting, no matter how many paid orders exist.
- An index on \`(created_at, status)\` is the wrong order: it cannot jump to one status.

Rule of thumb: put the columns tested with \`=\` first, then the column you range over or sort by. The primary key (here \`id\`) is implicitly the last part of every index in SQLite, which is why \`ORDER BY created_at DESC, id DESC\` costs nothing extra.

A **covering index** contains every column a query needs, so the database never visits the table at all. That is faster again, but it makes the index bigger.`,
        ar: `## الفهارس المركّبة: ترتيب الأعمدة مهم

يمكن للفهرس أن يغطي **عدة أعمدة**. فكّر في دليل هاتف مرتب حسب **اسم العائلة ثم الاسم الأول**. يجد "Haddad" فوراً، و"Haddad, Amal" فوراً، لكن "كل من اسمه Amal" ميؤوس منه: الـ Amal مبعثرون في كل الحروف.

\`\`\`sql
CREATE INDEX idx_people_name ON people (last_name, first_name);

-- uses the index (leftmost column first):
WHERE last_name = 'Haddad'
WHERE last_name = 'Haddad' AND first_name = 'Amal'
-- cannot jump (skips the leftmost column):
WHERE first_name = 'Amal'
\`\`\`

هذه هي **قاعدة البادئة اليسرى (leftmost prefix)**: الفهرس المركّب يفيد الاستعلامات التي تستخدم أعمدته من اليسار دون ثغرات.

### المساواة أولاً، ثم عمود الترتيب أو المجال

خذ الاستعلام الشائع "آخر 5 طلبات بحالة X":

\`\`\`sql
SELECT id, created_at FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC, id DESC
LIMIT 5;
\`\`\`

- فهرس على \`(status)\` يجد الطلبات المدفوعة، لكن على القاعدة بعدها أن **ترتبها كلها** لتجد آخر 5 (\`USE TEMP B-TREE FOR ORDER BY\`).
- فهرس على \`(status, created_at)\` يجد الطلبات المدفوعة **مرتبة أصلاً بالتاريخ**. يقرأ آخر 5 إدخالات ويتوقف: لا ترتيب مهما بلغ عدد الطلبات المدفوعة.
- فهرس على \`(created_at, status)\` ترتيبه خاطئ: لا يستطيع القفز إلى حالة واحدة.

قاعدة عملية: ضع الأعمدة المختبَرة بـ \`=\` أولاً، ثم العمود الذي تحدد عليه مجالاً أو ترتّب به. والمفتاح الأساسي (هنا \`id\`) هو ضمناً الجزء الأخير من كل فهرس في SQLite، ولهذا فإن \`ORDER BY created_at DESC, id DESC\` لا يكلف شيئاً إضافياً.

**الفهرس الغطائي (covering index)** يحوي كل الأعمدة التي يحتاجها الاستعلام، فلا تزور القاعدة الجدول إطلاقاً. وهذا أسرع أيضاً، لكنه يجعل الفهرس أكبر.`,
      },
    },
    {
      type: "lab",
      id: "latest-orders-index",
      lang: "python",
      prompt: {
        en: `The program shows the **5 latest orders** (by \`created_at\`, ties broken by larger \`id\`) for a status read from stdin, then prints how SQLite ran the query.

The starter has only an index on \`status\`. That finds the right orders but still needs an extra sorting step. Write \`index_sql\` with **one** composite index so the query is an index **search** and the plan has **no sort step**.

**Input:** one status: \`new\`, \`paid\`, \`shipped\`, \`cancelled\` (or any other word).

**Output:** up to 5 lines \`order ID on DATE\`, then \`access: ...\` and \`sort: none\` or \`sort: extra sort step\`.

Example: status \`paid\` prints five order lines, then \`access: index search\` and \`sort: none\`.`,
        ar: `يعرض البرنامج **آخر 5 طلبات** (حسب \`created_at\` وعند التساوي الأكبر \`id\` أولاً) لحالة تُقرأ من stdin، ثم يطبع كيف نفّذ SQLite الاستعلام.

في الكود الابتدائي فهرس واحد فقط على \`status\`. هو يجد الطلبات الصحيحة لكنه يحتاج خطوة ترتيب إضافية. اكتب \`index_sql\` بفهرس **مركّب واحد** بحيث يصير الاستعلام **بحثاً** بالفهرس وتخلو الخطة من **خطوة ترتيب**.

**الدخل:** حالة واحدة: \`new\` أو \`paid\` أو \`shipped\` أو \`cancelled\` (أو أي كلمة أخرى).

**الخرج:** حتى 5 أسطر \`order ID on DATE\`، ثم \`access: ...\` و\`sort: none\` أو \`sort: extra sort step\`.

مثال: الحالة \`paid\` تطبع خمسة أسطر طلبات ثم \`access: index search\` و\`sort: none\`.`,
      },
      starterCode: `${ORDERS_SEED}
# TODO: replace this single-column index with ONE composite index.
# Think: which column is compared with = (it goes first), and which column
# does the ORDER BY use (it goes second)?
index_sql = """
    CREATE INDEX idx_orders_status ON orders (status);
"""
${LATEST_TAIL}`,
      solution: `${ORDERS_SEED}
# Equality column first (status), then the ORDER BY column (created_at).
# Entries for one status are already sorted by date, and the rowid (id) is
# implicitly the last key, so the newest rows are simply the last entries.
index_sql = """
    CREATE INDEX idx_orders_status_created ON orders (status, created_at);
"""
${LATEST_TAIL}`,
      hints: [
        { en: "A composite index is written CREATE INDEX name ON orders (col1, col2). The order of the two columns is the whole point.", ar: "الفهرس المركّب يُكتب CREATE INDEX name ON orders (col1, col2). ترتيب العمودين هو لب الموضوع." },
        { en: "The WHERE uses status = ?, so status must be the first column. The ORDER BY uses created_at, so it comes second.", ar: "الـ WHERE يستخدم status = ? لذلك يجب أن يكون status العمود الأول. والـ ORDER BY يستخدم created_at فيأتي ثانياً." },
        { en: "Use CREATE INDEX idx_orders_status_created ON orders (status, created_at);", ar: "استخدم CREATE INDEX idx_orders_status_created ON orders (status, created_at);" },
      ],
      tests: [
        { name: { en: "Latest paid orders", ar: "آخر الطلبات المدفوعة" }, stdin: "paid\n", expected: "order 1877 on 2025-12-30\norder 417 on 2025-12-30\norder 1981 on 2025-12-28\norder 521 on 2025-12-28\norder 2085 on 2025-12-26\naccess: index search\nsort: none" },
        { name: { en: "Latest shipped orders", ar: "آخر الطلبات المشحونة" }, stdin: "shipped\n", expected: "order 2294 on 2025-12-29\norder 834 on 2025-12-29\norder 2398 on 2025-12-27\norder 938 on 2025-12-27\norder 2502 on 2025-12-25\naccess: index search\nsort: none" },
        { name: { en: "Another status: new", ar: "حالة أخرى: new" }, stdin: "new\n", expected: "order 1564 on 2025-12-29\norder 104 on 2025-12-29\norder 1668 on 2025-12-27\norder 208 on 2025-12-27\norder 1772 on 2025-12-25\naccess: index search\nsort: none" },
        { name: { en: "Cancelled orders", ar: "الطلبات الملغاة" }, stdin: "cancelled\n", expected: "order 2607 on 2025-12-30\norder 1147 on 2025-12-30\norder 2711 on 2025-12-28\norder 1251 on 2025-12-28\norder 2815 on 2025-12-26\naccess: index search\nsort: none" },
        { name: { en: "Unknown status: no rows, still a clean index plan", ar: "حالة غير معروفة: لا صفوف وخطة فهرس سليمة" }, stdin: "refunded\n", expected: "access: index search\nsort: none" },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Writing queries an index can use

An index stores the **raw column values**. If the query wraps the column in a function or an expression, the database can no longer compare it with the sorted entries, so it falls back to a scan. Conditions an index can use are called **sargable** (search-ARGument-able).

\`\`\`sql
-- Not sargable: the function hides the column from the index
WHERE substr(created_at, 1, 4) = '2025'
WHERE lower(email) = 'amal@example.com'
WHERE total_cents + 100 > 5000

-- Sargable: the bare column is compared with a constant
WHERE created_at >= '2025-01-01' AND created_at < '2026-01-01'
WHERE email = 'amal@example.com'     -- and store emails normalised to lower case
WHERE total_cents > 4900
\`\`\`

Rewrite recipes:

- **Move the work to the other side** of the comparison: \`total_cents > 4900\` instead of \`total_cents + 100 > 5000\`.
- Use a **half-open range** for dates: \`>= start AND < next_start\`. It also avoids bugs with the last day. ISO 8601 text (\`YYYY-MM-DD\`) sorts in date order, which is why such ranges work.
- A pattern that **starts with a wildcard** (\`LIKE '%saffron'\`) cannot use a normal B-tree, because the sorted order does not help when you do not know the first letters. \`LIKE 'saff%'\` can in many databases. Searching inside text at scale needs a full-text index instead.
- Many databases also support an **expression index**, such as \`CREATE INDEX ... ON users (lower(email))\`, when you really need to search by a computed value.

### When the planner ignores your index

The planner picks the cheapest plan it estimates. If a condition matches most of the table (a column with two values, half the rows each), reading the table directly can be cheaper than hopping through an index, so a plan with \`SCAN\` is not always a mistake. An index pays off on **selective** conditions: ones that keep a small fraction of the rows. Run \`ANALYZE\` (SQLite and PostgreSQL) so the planner has fresh statistics.`,
        ar: `## كتابة استعلامات يستطيع الفهرس استخدامها

الفهرس يخزّن **قيم العمود الخام**. فإذا لفّ الاستعلام العمود بدالة أو بتعبير، لم تعد القاعدة قادرة على مقارنته بالإدخالات المرتبة، فتعود إلى المسح. وتُسمى الشروط التي يستطيع الفهرس استخدامها **sargable** (search-ARGument-able).

\`\`\`sql
-- Not sargable: the function hides the column from the index
WHERE substr(created_at, 1, 4) = '2025'
WHERE lower(email) = 'amal@example.com'
WHERE total_cents + 100 > 5000

-- Sargable: the bare column is compared with a constant
WHERE created_at >= '2025-01-01' AND created_at < '2026-01-01'
WHERE email = 'amal@example.com'     -- and store emails normalised to lower case
WHERE total_cents > 4900
\`\`\`

وصفات إعادة الكتابة:

- **انقل العمل إلى الجهة الأخرى** من المقارنة: \`total_cents > 4900\` بدل \`total_cents + 100 > 5000\`.
- استخدم **مجالاً نصف مفتوح** للتواريخ: \`>= start AND < next_start\`. وهو يتجنب أيضاً أخطاء اليوم الأخير. نص ISO 8601 (\`YYYY-MM-DD\`) يُرتَّب بترتيب التاريخ، ولهذا تنجح هذه المجالات.
- النمط الذي **يبدأ بحرف بدل** (\`LIKE '%saffron'\`) لا يستطيع استخدام B-tree عادية، لأن الترتيب لا يفيد حين لا تعرف الحروف الأولى. أما \`LIKE 'saff%'\` فيمكنه ذلك في قواعد كثيرة. والبحث داخل النصوص على نطاق واسع يحتاج فهرس بحث نصي (full-text) بدلاً من ذلك.
- تدعم قواعد كثيرة أيضاً **فهرس تعبير (expression index)** مثل \`CREATE INDEX ... ON users (lower(email))\` حين تحتاج فعلاً إلى البحث بقيمة محسوبة.

### حين يتجاهل المخطِّط فهرسك

يختار المخطِّط (planner) أرخص خطة يقدّرها. فإذا طابق شرط معظم الجدول (عمود بقيمتين، نصف الصفوف لكل منهما) فقد تكون قراءة الجدول مباشرة أرخص من القفز عبر فهرس، فخطة فيها \`SCAN\` ليست دائماً خطأ. يؤتي الفهرس ثماره مع الشروط **الانتقائية (selective)**: التي تُبقي جزءاً صغيراً من الصفوف. شغّل \`ANALYZE\` (في SQLite وPostgreSQL) ليحصل المخطِّط على إحصاءات حديثة.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// A toy "index" in JavaScript: a lookup built once, then used for every query.
const orders = [];
for (let i = 1; i <= 5000; i++) {
  orders.push({ id: i, customerId: ((i * 37) % 200) + 1 });
}

// Without an index: look at every row.
let examined = 0;
const scanned = orders.filter((o) => {
  examined++;
  return o.customerId === 7;
});
console.log("scan:  examined", examined, "rows, found", scanned.length);

// With an index: building it costs one pass, then lookups jump straight to the rows.
const byCustomer = new Map();
for (const o of orders) {
  if (!byCustomer.has(o.customerId)) byCustomer.set(o.customerId, []);
  byCustomer.get(o.customerId).push(o);
}
const hits = byCustomer.get(7) ?? [];
console.log("index: examined", hits.length, "rows, found", hits.length);

// The price: every insert must now update the table AND the index.
function insertOrder(order) {
  orders.push(order);
  const bucket = byCustomer.get(order.customerId) ?? [];
  bucket.push(order);
  byCustomer.set(order.customerId, bucket);
}
insertOrder({ id: 5001, customerId: 7 });
console.log("after one insert:", byCustomer.get(7).length, "orders for customer 7");`,
      explanation: {
        en: "The scan examines all 5,000 rows to find 25 matches; the index jumps straight to those 25. Notice the cost side: building the lookup needs a pass over the data, and every insert has to maintain it. A real B-tree index is more capable than this Map (it also supports ranges and ordering), but the trade-off is the same.",
        ar: "يفحص المسح كل الصفوف الـ 5,000 ليجد 25 مطابقة؛ أما الفهرس فيقفز مباشرة إلى تلك الـ 25. لاحظ جانب الكلفة: بناء جدول البحث يحتاج مروراً على البيانات، وكل إدخال يجب أن يصونه. فهرس B-tree الحقيقي أقدر من هذه الـ Map (فهو يدعم المجالات والترتيب أيضاً) لكن المقايضة نفسها.",
      },
    },
    {
      type: "lab",
      id: "sargable-year-count",
      lang: "python",
      prompt: {
        en: `An index on \`orders (created_at)\` exists. The program counts the orders created in a given year, but the query wraps \`created_at\` in \`substr(...)\`, so SQLite scans every entry.

Rewrite \`count_sql\` so that it returns the **same count** but is an index **search**. Use the named parameters \`:year_start\` (\`YYYY-01-01\` of the year) and \`:year_end\` (\`01-01\` of the **next** year). Remember the upper bound must be **exclusive**.

**Input:** one year, for example \`2025\`.

**Output:** \`orders in YEAR: N\` and \`access: index search\` or \`access: full table scan\`.

Example: \`2024\` prints \`orders in 2024: 1516\` and \`access: index search\`.`,
        ar: `يوجد فهرس على \`orders (created_at)\`. يعدّ البرنامج الطلبات المنشأة في سنة معينة، لكن الاستعلام يلفّ \`created_at\` بـ \`substr(...)\` فيمسح SQLite كل الإدخالات.

أعد كتابة \`count_sql\` ليُرجع **العدد نفسه** لكن **بحثاً** بالفهرس. استخدم المعاملين المسمّيين \`:year_start\` (يوم \`YYYY-01-01\` من السنة) و\`:year_end\` (يوم \`01-01\` من السنة **التالية**). تذكّر أن الحد الأعلى يجب أن يكون **حصرياً**.

**الدخل:** سنة واحدة، مثل \`2025\`.

**الخرج:** \`orders in YEAR: N\` و\`access: index search\` أو \`access: full table scan\`.

مثال: \`2024\` يطبع \`orders in 2024: 1516\` و\`access: index search\`.`,
      },
      starterCode: `${ORDERS_SEED}
db.execute("CREATE INDEX idx_orders_created_at ON orders (created_at)")

# TODO: the correct count, but substr() hides created_at from the index.
# Rewrite the condition as a range on the bare column using :year_start and :year_end.
count_sql = """
    SELECT COUNT(*) FROM orders
    WHERE substr(created_at, 1, 4) = :year
"""
${YEAR_TAIL}`,
      solution: `${ORDERS_SEED}
db.execute("CREATE INDEX idx_orders_created_at ON orders (created_at)")

# A half-open range on the bare column: >= first day, < first day of the next year.
count_sql = """
    SELECT COUNT(*) FROM orders
    WHERE created_at >= :year_start AND created_at < :year_end
"""
${YEAR_TAIL}`,
      hints: [
        { en: "Do not apply any function to created_at. Compare the bare column with constants.", ar: "لا تطبّق أي دالة على created_at. قارن العمود مجرداً بثوابت." },
        { en: "A year is a range: from the first day of that year up to, but not including, the first day of the next year.", ar: "السنة مجال: من أول يوم فيها حتى أول يوم من السنة التالية دون أن يشمله." },
        { en: "WHERE created_at >= :year_start AND created_at < :year_end", ar: "WHERE created_at >= :year_start AND created_at < :year_end" },
      ],
      tests: [
        { name: { en: "2024: the upper bound must exclude 2025-01-01", ar: "2024: يجب أن يستثني الحد الأعلى 2025-01-01" }, stdin: "2024\n", expected: "orders in 2024: 1516\naccess: index search" },
        { name: { en: "2025", ar: "2025" }, stdin: "2025\n", expected: "orders in 2025: 1484\naccess: index search" },
        { name: { en: "A year before the data: zero rows", ar: "سنة قبل البيانات: صفر صفوف" }, stdin: "2023\n", expected: "orders in 2023: 0\naccess: index search" },
        { name: { en: "A year after the data: zero rows", ar: "سنة بعد البيانات: صفر صفوف" }, stdin: "2026\n", expected: "orders in 2026: 0\naccess: index search" },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Why does an index make WHERE email = ? fast on a big table?", ar: "لماذا يجعل الفهرس WHERE email = ? سريعاً على جدول كبير؟" },
          choices: [
            { en: "It stores a second copy of the whole table in random order", ar: "يخزّن نسخة ثانية من الجدول كله بترتيب عشوائي" },
            { en: "It caches the result of the last query", ar: "يخزّن مؤقتاً نتيجة آخر استعلام" },
            { en: "It keeps the column values sorted in a tree, so the database can jump to the matching entries instead of reading every row", ar: "يُبقي قيم العمود مرتبة في شجرة، فتقفز القاعدة إلى الإدخالات المطابقة بدل قراءة كل صف" },
            { en: "It compresses the table so the disk reads less data", ar: "يضغط الجدول فيقرأ القرص بيانات أقل" },
          ],
          answer: 2,
          explain: {
            en: "An index is a separate sorted structure (usually a B-tree) holding the column values and pointers to rows. Sorted data can be searched in a handful of steps instead of visiting every row. It is not a cache, a random copy, or compression.",
            ar: "الفهرس بنية مرتبة منفصلة (غالباً B-tree) تحمل قيم العمود ومؤشرات إلى الصفوف. والبيانات المرتبة يمكن البحث فيها بعدة خطوات بدل زيارة كل صف. وهو ليس ذاكرة مؤقتة ولا نسخة عشوائية ولا ضغطاً.",
          },
        },
        {
          q: { en: "There is an index on people (last_name, first_name). Which query cannot use it to jump straight to its rows?", ar: "يوجد فهرس على people (last_name, first_name). أي استعلام لا يستطيع استخدامه للقفز مباشرة إلى صفوفه؟" },
          choices: [
            { en: "WHERE last_name = 'Haddad'", ar: "WHERE last_name = 'Haddad'" },
            { en: "WHERE first_name = 'Amal'", ar: "WHERE first_name = 'Amal'" },
            { en: "WHERE last_name = 'Haddad' AND first_name = 'Amal'", ar: "WHERE last_name = 'Haddad' AND first_name = 'Amal'" },
            { en: "WHERE last_name = 'Haddad' ORDER BY first_name", ar: "WHERE last_name = 'Haddad' ORDER BY first_name" },
          ],
          answer: 1,
          explain: {
            en: "A composite index is sorted by its first column, then by the second within it, like a phone book. Skipping the leftmost column (last_name) leaves the Amals scattered throughout, so the index cannot jump to them. This is the leftmost prefix rule.",
            ar: "الفهرس المركّب مرتب بعموده الأول ثم بالثاني داخله، مثل دليل الهاتف. وتخطي العمود الأيسر (last_name) يترك الـ Amal مبعثرين في كل مكان، فلا يستطيع الفهرس القفز إليهم. هذه قاعدة البادئة اليسرى.",
          },
        },
        {
          q: { en: "There is a plain index on created_at. Which condition can use it to jump to the 2025 rows?", ar: "يوجد فهرس عادي على created_at. أي شرط يستطيع استخدامه للقفز إلى صفوف 2025؟" },
          choices: [
            { en: "created_at >= '2025-01-01' AND created_at < '2026-01-01'", ar: "created_at >= '2025-01-01' AND created_at < '2026-01-01'" },
            { en: "substr(created_at, 1, 4) = '2025'", ar: "substr(created_at, 1, 4) = '2025'" },
            { en: "strftime('%Y', created_at) = '2025'", ar: "strftime('%Y', created_at) = '2025'" },
            { en: "created_at || '' LIKE '2025%'", ar: "created_at || '' LIKE '2025%'" },
          ],
          answer: 0,
          explain: {
            en: "Only the first form compares the bare column with constants, so the sorted index entries can be used as a range. The other three wrap created_at in a function or expression, which hides it from the index and forces a scan.",
            ar: "الصيغة الأولى فقط تقارن العمود مجرداً بثوابت، فيمكن استخدام إدخالات الفهرس المرتبة كمجال. أما الثلاث الأخرى فتلفّ created_at بدالة أو تعبير، فيختفي عن الفهرس ويُفرض المسح.",
          },
        },
        {
          q: { en: "A teammate wants to add an index on every column \"to be safe\". What is the real downside?", ar: "يريد زميلك إضافة فهرس على كل عمود \"للاحتياط\". ما العيب الحقيقي؟" },
          choices: [
            { en: "SELECT results come back in a random order", ar: "تعود نتائج SELECT بترتيب عشوائي" },
            { en: "The database can no longer enforce primary keys", ar: "لم تعد القاعدة قادرة على فرض المفاتيح الأساسية" },
            { en: "Queries take longer to parse", ar: "يستغرق تحليل الاستعلامات وقتاً أطول" },
            { en: "Every INSERT, DELETE and indexed-column UPDATE must also maintain every index, and the indexes take disk space", ar: "كل INSERT وDELETE وUPDATE لعمود مفهرس يجب أن يصون كل فهرس أيضاً، والفهارس تشغل مساحة قرص" },
          ],
          answer: 3,
          explain: {
            en: "Indexes trade write speed and storage for read speed. Each extra index is more work on every write and more disk, and unused ones are pure cost. Index what real queries filter, join and sort on, and check the plan.",
            ar: "الفهارس تقايض سرعة الكتابة والتخزين بسرعة القراءة. كل فهرس إضافي عمل أكثر في كل كتابة ومساحة أكبر، والفهارس غير المستخدمة تكلفة صرفة. فهرس ما تفلتره وتربطه وترتب به استعلامات حقيقية، وافحص الخطة.",
          },
        },
        {
          q: { en: "Half of all rows have status = 'active'. You index status and run WHERE status = 'active'. What will the planner most likely do?", ar: "نصف كل الصفوف حالتها status = 'active'. فهرست status ونفّذت WHERE status = 'active'. ماذا سيفعل المخطِّط غالباً؟" },
          choices: [
            { en: "Use the index and run a thousand times faster", ar: "يستخدم الفهرس ويعمل أسرع بألف مرة" },
            { en: "Possibly scan the table anyway, because reading half the rows through an index is no cheaper than scanning", ar: "قد يمسح الجدول على أي حال، لأن قراءة نصف الصفوف عبر فهرس ليست أرخص من المسح" },
            { en: "Return wrong rows, because low-selectivity indexes are unreliable", ar: "يُرجع صفوفاً خاطئة لأن الفهارس قليلة الانتقائية غير موثوقة" },
          ],
          answer: 1,
          explain: {
            en: "An index shines when a condition is selective (keeps a small fraction of rows). When half the table matches, hopping through the index for every row can cost more than reading the table in order. Results are always correct either way; only the speed differs.",
            ar: "يتألق الفهرس حين يكون الشرط انتقائياً (يُبقي جزءاً صغيراً من الصفوف). وحين يطابق نصف الجدول قد يكلف القفز عبر الفهرس لكل صف أكثر من قراءة الجدول بالترتيب. النتائج صحيحة دائماً في الحالتين؛ والسرعة وحدها هي المختلفة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap and what to practice next

- An **index** is a sorted side structure (usually a **B-tree**) that lets the database **search** instead of **scan**. It costs disk space and slows writes.
- Check, do not guess: \`EXPLAIN QUERY PLAN\` (or \`EXPLAIN\` / \`EXPLAIN ANALYZE\`). **SEARCH** means a jump; **SCAN** reads everything, even \`SCAN ... USING COVERING INDEX\`.
- **Composite indexes** follow the leftmost prefix rule: equality columns first, then the range or \`ORDER BY\` column. The right order can remove a sort step completely.
- Keep conditions **sargable**: compare the bare column with constants, use half-open ranges for dates, avoid leading wildcards.
- Index **selective** conditions and the columns your real queries use. Foreign keys usually need a manual index.

**Practice next:** in the first lab, add a third lookup (by \`status\` and \`total_cents\`) and watch the plan. Try a composite index in the wrong column order and see the plan change. Then read about transactions: indexes and constraints are only trustworthy if concurrent changes are applied safely, which is the next topic on the roadmap.`,
        ar: `## الخلاصة وما تتدرب عليه بعد ذلك

- **الفهرس** بنية جانبية مرتبة (غالباً **B-tree**) تتيح للقاعدة أن **تبحث** بدل أن **تمسح**. وتكلفته مساحة قرص وبطء في الكتابة.
- تحقق ولا تخمّن: \`EXPLAIN QUERY PLAN\` (أو \`EXPLAIN\` / \`EXPLAIN ANALYZE\`). **SEARCH** تعني قفزة؛ و**SCAN** يقرأ كل شيء، حتى \`SCAN ... USING COVERING INDEX\`.
- **الفهارس المركّبة** تتبع قاعدة البادئة اليسرى: أعمدة المساواة أولاً ثم عمود المجال أو \`ORDER BY\`. والترتيب الصحيح قد يزيل خطوة الترتيب تماماً.
- أبقِ الشروط **sargable**: قارن العمود مجرداً بثوابت، واستخدم مجالات نصف مفتوحة للتواريخ، وتجنب الحرف البدل في البداية.
- افهرس الشروط **الانتقائية** والأعمدة التي تستخدمها استعلاماتك الحقيقية. والمفاتيح الأجنبية تحتاج غالباً إلى فهرس يدوي.

**تدرّب بعد ذلك:** في المختبر الأول أضف بحثاً ثالثاً (بـ \`status\` و\`total_cents\`) وراقب الخطة. جرّب فهرساً مركّباً بترتيب أعمدة خاطئ وشاهد تغيّر الخطة. ثم اقرأ عن المعاملات (transactions): الفهارس والقيود لا يُوثق بها إلا إذا طُبّقت التغييرات المتزامنة بأمان، وهو الموضوع التالي في خارطة الطريق.`,
      },
    },
  ],
};
