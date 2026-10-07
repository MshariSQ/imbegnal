import type { Lesson } from "../types";

const BOOKS_SEED = `import sqlite3
import sys

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL, year INTEGER NOT NULL, rating REAL)")
db.executemany(
    "INSERT INTO books (title, author, year, rating) VALUES (?, ?, ?, ?)",
    [
        ("Dune", "Frank Herbert", 1965, 4.5),
        ("Palace Walk", "Naguib Mahfouz", 1956, 4.4),
        ("Season of Migration to the North", "Tayeb Salih", 1966, 4.3),
        ("The Left Hand of Darkness", "Ursula K. Le Guin", 1969, 4.2),
        ("The Name of the Rose", "Umberto Eco", 1980, 3.9),
        ("Neuromancer", "William Gibson", 1984, 4.0),
        ("Beloved", "Toni Morrison", 1987, 4.2),
        ("A Brief History of Time", "Stephen Hawking", 1988, 4.0),
        ("The Remains of the Day", "Kazuo Ishiguro", 1989, 4.3),
        ("Snow Crash", "Neal Stephenson", 1992, 4.1),
        ("Kafka on the Shore", "Haruki Murakami", 2002, 4.1),
        ("Cloud Atlas", "David Mitchell", 2004, 3.9),
        ("The Road", "Cormac McCarthy", 2006, 4.2),
        ("Piranesi", "Susanna Clarke", 2020, None),
        ("Klara and the Sun", "Kazuo Ishiguro", 2021, None),
    ],
)

min_year, max_rows = map(int, sys.stdin.read().split())
`;

const PRODUCTS_SEED = `import sqlite3
import sys

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, stock INTEGER NOT NULL, price_cents INTEGER NOT NULL, discontinued INTEGER NOT NULL DEFAULT 0)")
db.executemany(
    "INSERT INTO products (name, stock, price_cents, discontinued) VALUES (?, ?, ?, ?)",
    [
        ("Notebook A5", 12, 450, 0),
        ("Gel Pen Black", 3, 175, 0),
        ("Stapler", 0, 1200, 0),
        ("Whiteboard Marker", 25, 220, 0),
        ("Desk Organizer", 4, 1850, 1),
        ("Sticky Notes", 8, 300, 0),
        ("Old Planner 2021", 30, 900, 1),
        ("Highlighter Set", 2, 650, 0),
    ],
)

threshold, qty = map(int, sys.stdin.read().split())
params = {"threshold": threshold, "qty": qty}
`;

const PRODUCTS_REPORT = `
print("restocked:", db.execute(restock_sql, params).rowcount)
print("deleted:", db.execute(delete_sql, params).rowcount)
print("inserted:", db.execute(insert_sql, params).rowcount)
for pid, name, stock, price in db.execute("SELECT id, name, stock, price_cents FROM products ORDER BY id"):
    print(f"{pid} {name} stock={stock} price={price / 100:.2f}")
`;

const STUDENTS_RUN = `
for line in sys.stdin.read().splitlines():
    if not line.strip():
        continue
    token, age = line.split()
    email = None if token == "NULL" else token
    try:
        db.execute("INSERT INTO students (email, age) VALUES (?, ?)", (email, int(age)))
        print("OK", token)
    except sqlite3.IntegrityError as err:
        # e.g. "UNIQUE constraint failed: students.email" -> "UNIQUE"
        print("REJECTED", token, "-", str(err).split(" constraint")[0])
print("rows:", db.execute("SELECT COUNT(*) FROM students").fetchone()[0])
`;

export const lesson: Lesson = {
  nodeId: "relational-sql-basics",
  title: { en: "Relational Model & SQL Basics", ar: "النموذج العلائقي وأساسيات SQL" },
  estMinutes: 40,
  sections: [
    {
      type: "text",
      body: {
        en: `## The library that never loses a card 📚

Picture a big library with 100,000 books and **no catalogue**. Someone asks: "Which books were published after 1990, best-rated first?" You would have to walk every shelf.

Now give the librarian a **card catalogue**. Every kind of thing gets its own drawer (books, members, loans). Every drawer holds identical cards, and every card has the same fields: title, author, year. Each card also has a unique number, so "card 42 in the members drawer" always means the same person.

That is a **relational database**:

- a **table** is a drawer (\`books\`)
- a **row** is one card (one book)
- a **column** is one field on the card (\`title\`, \`year\`)
- a **primary key** is the unique number on the card
- **SQL** (Structured Query Language) is how you ask the librarian questions

## What you'll learn

- How tables, rows, columns, **primary keys** and **foreign keys** fit together
- The everyday verbs: \`SELECT\`, \`INSERT\`, \`UPDATE\`, \`DELETE\`
- Filtering and sorting with \`WHERE\`, \`ORDER BY\` and \`LIMIT\`
- **NULL**, the "unknown" value that behaves unlike any other
- **Constraints** that make the database refuse bad data for you

In the labs, the database is **SQLite** (it ships inside Python's standard library). The program creates a tiny in-memory database, and **you write the SQL** inside a Python string.`,
        ar: `## المكتبة التي لا تضيّع بطاقة أبداً 📚

تخيّل مكتبة كبيرة فيها 100,000 كتاب و**بلا فهرس**. يسألك أحدهم: «ما الكتب الصادرة بعد 1990، من الأعلى تقييماً إلى الأدنى؟» ستضطر إلى المرور على كل رفّ.

الآن أعطِ أمين المكتبة **فهرس بطاقات**. كل نوع من الأشياء له درج خاص (الكتب، الأعضاء، الإعارات). كل درج يضم بطاقات متطابقة الشكل، ولكل بطاقة الحقول نفسها: العنوان، المؤلف، السنة. وكل بطاقة تحمل رقماً فريداً، فعبارة «البطاقة 42 في درج الأعضاء» تعني دائماً الشخص نفسه.

هذه هي **قاعدة البيانات العلائقية (relational database)**:

- **الجدول (table)** هو الدرج (\`books\`)
- **الصف (row)** هو بطاقة واحدة (كتاب واحد)
- **العمود (column)** هو حقل واحد في البطاقة (\`title\`، \`year\`)
- **المفتاح الأساسي (primary key)** هو الرقم الفريد على البطاقة
- **SQL** (لغة الاستعلام المهيكلة) هي الطريقة التي تسأل بها أمين المكتبة

## ماذا ستتعلم

- كيف تتكامل الجداول والصفوف والأعمدة و**المفاتيح الأساسية** و**المفاتيح الأجنبية**
- الأفعال اليومية: \`SELECT\` و\`INSERT\` و\`UPDATE\` و\`DELETE\`
- التصفية والترتيب بـ \`WHERE\` و\`ORDER BY\` و\`LIMIT\`
- **NULL**، قيمة «المجهول» التي تتصرف على غير ما تتصرف به أي قيمة أخرى
- **القيود (constraints)** التي تجعل قاعدة البيانات ترفض البيانات الخاطئة بدلاً منك

في المختبرات ستكون قاعدة البيانات هي **SQLite** (تأتي ضمن المكتبة القياسية لبايثون). ينشئ البرنامج قاعدة بيانات صغيرة في الذاكرة، و**أنت تكتب جملة SQL** داخل نص (string) بايثون.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Tables, keys and types

A table has a fixed list of **columns**, each with a name and a type (\`INTEGER\`, \`TEXT\`, \`REAL\`, ...). Every **row** supplies one value per column.

\`\`\`sql
CREATE TABLE books (
  id     INTEGER PRIMARY KEY,
  title  TEXT NOT NULL,
  author TEXT NOT NULL,
  year   INTEGER NOT NULL,
  rating REAL
);

INSERT INTO books (title, author, year, rating)
VALUES ('Dune', 'Frank Herbert', 1965, 4.5);
\`\`\`

- The **primary key** identifies exactly one row. Other tables point at a row by storing its key.
- A **foreign key** is a column whose value must match a key in another table. \`loans.book_id\` should always match some \`books.id\`. This is what makes the model *relational*: tables are linked by values, not by copying data.
- The order of rows in a table is **not** part of the model. If you want a specific order, you must ask for it.

> SQLite is flexible about column types (it treats them as hints). Other databases such as PostgreSQL are strict. Declare the types you mean anyway; it documents your intent and keeps your SQL portable.

## Asking questions: SELECT

\`\`\`sql
SELECT title, year          -- which columns to show
FROM books                  -- which table
WHERE year >= 1980          -- keep only matching rows
ORDER BY year DESC, title   -- sort (DESC = high to low)
LIMIT 5;                    -- stop after 5 rows
\`\`\`

You write the clauses in this order, but think of the database working in a different order: first **FROM** (pick the table), then **WHERE** (drop rows), then **SELECT** (choose columns), then **ORDER BY**, then **LIMIT**. Run the demo below to see that pipeline written as plain Python.`,
        ar: `## الجداول والمفاتيح والأنواع

للجدول قائمة ثابتة من **الأعمدة**، لكل عمود اسم ونوع (\`INTEGER\` و\`TEXT\` و\`REAL\` ...). وكل **صف** يقدّم قيمة واحدة لكل عمود.

\`\`\`sql
CREATE TABLE books (
  id     INTEGER PRIMARY KEY,
  title  TEXT NOT NULL,
  author TEXT NOT NULL,
  year   INTEGER NOT NULL,
  rating REAL
);

INSERT INTO books (title, author, year, rating)
VALUES ('Dune', 'Frank Herbert', 1965, 4.5);
\`\`\`

- **المفتاح الأساسي** يحدد صفاً واحداً بالضبط. تشير الجداول الأخرى إلى الصف بتخزين مفتاحه.
- **المفتاح الأجنبي (foreign key)** عمود يجب أن تطابق قيمته مفتاحاً في جدول آخر. يجب أن يطابق \`loans.book_id\` دائماً \`books.id\` موجوداً. وهذا ما يجعل النموذج *علائقياً*: الجداول مرتبطة بالقيم، لا بنسخ البيانات.
- ترتيب الصفوف في الجدول **ليس** جزءاً من النموذج. إن أردت ترتيباً معيناً فعليك أن تطلبه صراحةً.

> SQLite مرنة مع أنواع الأعمدة (تعاملها كتلميحات)، بينما قواعد أخرى مثل PostgreSQL صارمة. اكتب الأنواع التي تقصدها على أي حال؛ فهي توثّق نيّتك وتُبقي شيفرتك قابلة للنقل.

## طرح الأسئلة: SELECT

\`\`\`sql
SELECT title, year          -- أي الأعمدة تُعرض
FROM books                  -- أي جدول
WHERE year >= 1980          -- أبقِ الصفوف المطابقة فقط
ORDER BY year DESC, title   -- رتّب (DESC = من الأعلى للأدنى)
LIMIT 5;                    -- توقف بعد 5 صفوف
\`\`\`

تكتب العبارات بهذا الترتيب، لكن فكّر في أن قاعدة البيانات تعمل بترتيب مختلف: أولاً **FROM** (اختيار الجدول)، ثم **WHERE** (استبعاد الصفوف)، ثم **SELECT** (اختيار الأعمدة)، ثم **ORDER BY**، ثم **LIMIT**. شغّل المثال أدناه لترى هذا المسار مكتوباً ببايثون العادية.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `# The same query as plain Python, one step per SQL clause:
# SELECT title, rating FROM books
# WHERE year >= 1980 AND rating IS NOT NULL
# ORDER BY rating DESC LIMIT 3
books = [
    {"title": "Dune", "year": 1965, "rating": 4.5},
    {"title": "Neuromancer", "year": 1984, "rating": 4.0},
    {"title": "Beloved", "year": 1987, "rating": 4.2},
    {"title": "Snow Crash", "year": 1992, "rating": 4.1},
    {"title": "Cloud Atlas", "year": 2004, "rating": 3.9},
    {"title": "Piranesi", "year": 2020, "rating": None},  # not rated yet
]

rows = books                                                       # FROM books
rows = [b for b in rows if b["year"] >= 1980 and b["rating"] is not None]  # WHERE
rows = [(b["title"], b["rating"]) for b in rows]                   # SELECT title, rating
rows.sort(key=lambda r: r[1], reverse=True)                        # ORDER BY rating DESC
rows = rows[:3]                                                    # LIMIT 3

for title, rating in rows:
    print(title, rating)`,
      explanation: {
        en: "Every SQL clause is one transformation of a list of rows. Notice `rating is not None`: a missing rating is not a number, so it needs a special test. SQL has the same issue with NULL.",
        ar: "كل عبارة في SQL تحويل واحد لقائمة من الصفوف. لاحظ `rating is not None`: التقييم المفقود ليس رقماً، لذا يحتاج اختباراً خاصاً. ولدى SQL المشكلة نفسها مع NULL.",
      },
    },
    {
      type: "text",
      body: {
        en: `## Filtering well: WHERE, NULL and parameters

Inside \`WHERE\` you can combine tests with \`AND\`, \`OR\`, \`NOT\`, and use \`=\`, \`<>\`, \`<\`, \`>=\`, \`BETWEEN a AND b\`, \`IN (...)\` and \`LIKE 'Du%'\` (\`%\` means "anything").

**NULL means "unknown", not zero and not empty text.** Any comparison with an unknown is unknown, and \`WHERE\` keeps a row only when the test is **true**:

\`\`\`sql
SELECT * FROM books WHERE rating = NULL;    -- always returns nothing!
SELECT * FROM books WHERE rating IS NULL;   -- correct
SELECT * FROM books WHERE rating < 4;       -- also skips rows where rating is NULL
\`\`\`

**Never glue user input into SQL text.** Pass values separately as parameters (\`?\` or \`:name\`), and the database treats them as data, never as SQL. This is the foundation of protection against SQL injection, which a later lesson covers:

\`\`\`python
db.execute("SELECT title FROM books WHERE year >= ?", (1990,))
db.execute("SELECT title FROM books WHERE year >= :y LIMIT :n", {"y": 1990, "n": 5})
\`\`\`

**Sorting.** \`ORDER BY\` takes several keys. \`ORDER BY rating DESC, title\` sorts by rating, and breaks ties alphabetically. Without \`ORDER BY\`, the order of the result is **not guaranteed**, even if it looks stable today. \`LIMIT\` without \`ORDER BY\` gives you "some rows".

## Your turn: query the library

In the lab below, all the plumbing is written. You only write the \`SELECT\`.`,
        ar: `## التصفية الجيدة: WHERE وNULL والمعاملات

داخل \`WHERE\` يمكنك دمج الاختبارات بـ \`AND\` و\`OR\` و\`NOT\`، واستخدام \`=\` و\`<>\` و\`<\` و\`>=\` و\`BETWEEN a AND b\` و\`IN (...)\` و\`LIKE 'Du%'\` (الرمز \`%\` يعني «أي شيء»).

**NULL تعني «مجهول»، وليست صفراً ولا نصاً فارغاً.** أي مقارنة مع المجهول تعطي مجهولاً، و\`WHERE\` لا تُبقي الصف إلا إذا كان الاختبار **صحيحاً**:

\`\`\`sql
SELECT * FROM books WHERE rating = NULL;    -- لا تُرجع شيئاً أبداً!
SELECT * FROM books WHERE rating IS NULL;   -- الصحيح
SELECT * FROM books WHERE rating < 4;       -- تتخطى أيضاً الصفوف التي rating فيها NULL
\`\`\`

**لا تلصق مدخلات المستخدم داخل نص SQL أبداً.** مرّر القيم منفصلة كمعاملات (\`?\` أو \`:name\`) فتعاملها قاعدة البيانات كبيانات، لا كأوامر SQL. هذا أساس الحماية من حقن SQL (SQL injection) الذي يتناوله درس لاحق:

\`\`\`python
db.execute("SELECT title FROM books WHERE year >= ?", (1990,))
db.execute("SELECT title FROM books WHERE year >= :y LIMIT :n", {"y": 1990, "n": 5})
\`\`\`

**الترتيب.** يقبل \`ORDER BY\` عدة مفاتيح. \`ORDER BY rating DESC, title\` يرتّب حسب التقييم ثم أبجدياً عند التعادل. وبدون \`ORDER BY\` فإن ترتيب النتيجة **غير مضمون**، حتى لو بدا ثابتاً اليوم. و\`LIMIT\` بدون \`ORDER BY\` تعطيك «بعض الصفوف».

## دورك: استعلم عن المكتبة

في المختبر التالي كل الشيفرة المساعدة مكتوبة، وعليك فقط كتابة جملة \`SELECT\`.`,
      },
    },
    {
      type: "lab",
      id: "select-where-order",
      lang: "python",
      prompt: {
        en: `The club library is seeded in the \`books\` table (\`title\`, \`author\`, \`year\`, \`rating\`). Some books have no rating yet (\`rating\` is NULL).

Write the query that returns the **title, year and rating** of the books that were published **in or after** \`:min_year\` **and** have a rating of **at least 4.0** (unrated books are left out). Show the **best-rated first**, break ties by **title A to Z**, and return **at most** \`:max_rows\` rows.

**Input:** one line with two integers: \`min_year max_rows\`.
**Output:** one line per row, \`title | year | rating\`, or \`(no books)\` when nothing matches.

Example: input \`1990 3\` gives
\`\`\`
The Road | 2006 | 4.2
Kafka on the Shore | 2002 | 4.1
Snow Crash | 1992 | 4.1
\`\`\``,
        ar: `مكتبة النادي مُعبّأة في الجدول \`books\` (الأعمدة \`title\` و\`author\` و\`year\` و\`rating\`). بعض الكتب بلا تقييم بعد (قيمة \`rating\` هي NULL).

اكتب الاستعلام الذي يُرجع **العنوان والسنة والتقييم** للكتب التي صدرت **في** \`:min_year\` **أو بعدها** **و**تقييمها **4.0 على الأقل** (الكتب غير المقيّمة تُستبعد). اعرض **الأعلى تقييماً أولاً**، وعند التعادل رتّب حسب **العنوان من A إلى Z**، وأرجع **ما لا يزيد على** \`:max_rows\` صفاً.

**الدخل:** سطر واحد فيه عددان صحيحان: \`min_year max_rows\`.
**الخرج:** سطر لكل صف، \`title | year | rating\`، أو \`(no books)\` إن لم يتطابق شيء.

مثال: الدخل \`1990 3\` يعطي
\`\`\`
The Road | 2006 | 4.2
Kafka on the Shore | 2002 | 4.1
Snow Crash | 1992 | 4.1
\`\`\``,
      },
      starterCode: `${BOOKS_SEED}
# TODO: add a WHERE clause (year and rating), an ORDER BY and a LIMIT.
# Use the named parameters :min_year and :max_rows, never string formatting.
sql = "SELECT title, year, rating FROM books"

found = False
for title, year, rating in db.execute(sql, {"min_year": min_year, "max_rows": max_rows}):
    print(f"{title} | {year} | {rating}")
    found = True
if not found:
    print("(no books)")
`,
      solution: `${BOOKS_SEED}
# A NULL rating makes "rating >= 4.0" unknown, so WHERE drops unrated books by itself.
sql = """
    SELECT title, year, rating
    FROM books
    WHERE year >= :min_year AND rating >= 4.0
    ORDER BY rating DESC, title
    LIMIT :max_rows
"""

found = False
for title, year, rating in db.execute(sql, {"min_year": min_year, "max_rows": max_rows}):
    print(f"{title} | {year} | {rating}")
    found = True
if not found:
    print("(no books)")
`,
      hints: [
        { en: "Put both conditions in one WHERE joined by AND: the year test and the rating test. A NULL rating is never >= 4.0, so unrated books disappear on their own.", ar: "ضع الشرطين في WHERE واحدة تربطهما AND: شرط السنة وشرط التقييم. التقييم NULL لا يكون أبداً >= 4.0 فتختفي الكتب غير المقيّمة من تلقاء نفسها." },
        { en: "ORDER BY accepts several keys, each with its own direction: ORDER BY rating DESC, title.", ar: "يقبل ORDER BY عدة مفاتيح لكل منها اتجاهه: ORDER BY rating DESC, title." },
        { en: "Finish with LIMIT :max_rows.", ar: "اختم بـ LIMIT :max_rows." },
      ],
      tests: [
        {
          name: { en: "Modern books, top 3", ar: "كتب حديثة، أفضل 3" },
          stdin: "1990 3\n",
          expected: "The Road | 2006 | 4.2\nKafka on the Shore | 2002 | 4.1\nSnow Crash | 1992 | 4.1",
        },
        {
          name: { en: "Ties are broken by title", ar: "كسر التعادل حسب العنوان" },
          stdin: "1980 4\n",
          expected: "The Remains of the Day | 1989 | 4.3\nBeloved | 1987 | 4.2\nThe Road | 2006 | 4.2\nKafka on the Shore | 2002 | 4.1",
        },
        {
          name: { en: "Only unrated or low-rated books match: no rows", ar: "لا تطابق إلا كتب بلا تقييم أو منخفضة التقييم: لا صفوف" },
          stdin: "2010 5\n",
          expected: "(no books)",
        },
        {
          name: { en: "A limit larger than the result returns every match", ar: "حدّ أكبر من النتيجة يُرجع كل المطابقات" },
          stdin: "1950 20\n",
          expected: "Dune | 1965 | 4.5\nPalace Walk | 1956 | 4.4\nSeason of Migration to the North | 1966 | 4.3\nThe Remains of the Day | 1989 | 4.3\nBeloved | 1987 | 4.2\nThe Left Hand of Darkness | 1969 | 4.2\nThe Road | 2006 | 4.2\nKafka on the Shore | 2002 | 4.1\nSnow Crash | 1992 | 4.1\nA Brief History of Time | 1988 | 4.0\nNeuromancer | 1984 | 4.0",
        },
        {
          name: { en: "LIMIT 0 returns nothing", ar: "LIMIT 0 لا يُرجع شيئاً" },
          stdin: "1960 0\n",
          expected: "(no books)",
        },
      ],
      sampleInput: "1990 3\n",
    },
    {
      type: "text",
      body: {
        en: `## Changing data: INSERT, UPDATE, DELETE

\`\`\`sql
INSERT INTO products (name, stock, price_cents) VALUES ('Desk Lamp', 5, 2499);

UPDATE products SET stock = stock + 10 WHERE name = 'Stapler';

DELETE FROM products WHERE discontinued = 1;
\`\`\`

Together with \`SELECT\` these four verbs are called **CRUD** (Create, Read, Update, Delete).

> **The most expensive typo in SQL:** \`UPDATE\` or \`DELETE\` without a \`WHERE\` changes **every row**. Habit to build: write the \`WHERE\` first, test it as a \`SELECT\`, and only then turn it into an \`UPDATE\` or \`DELETE\`.

Two details worth knowing:

- In \`SET stock = stock + 10\` the right side is computed from the **current** value of the row. The database does the arithmetic, so you do not read the value into your program first.
- Every statement reports how many rows it touched (\`cursor.rowcount\` in Python's \`sqlite3\`). Checking it is a cheap way to notice a \`WHERE\` that matched nothing, or too much.

Money is stored here as **integer cents** (\`price_cents\`), not as \`REAL\`. Binary floating point cannot represent values like 0.10 exactly, and rounding errors in money are a classic bug.

## Your turn: run a stock-take`,
        ar: `## تغيير البيانات: INSERT وUPDATE وDELETE

\`\`\`sql
INSERT INTO products (name, stock, price_cents) VALUES ('Desk Lamp', 5, 2499);

UPDATE products SET stock = stock + 10 WHERE name = 'Stapler';

DELETE FROM products WHERE discontinued = 1;
\`\`\`

مع \`SELECT\` تسمى هذه الأفعال الأربعة **CRUD** (إنشاء، قراءة، تحديث، حذف).

> **أغلى خطأ إملائي في SQL:** تنفيذ \`UPDATE\` أو \`DELETE\` بدون \`WHERE\` يغيّر **كل الصفوف**. عادة يجب أن تتعلمها: اكتب \`WHERE\` أولاً، واختبرها كـ \`SELECT\`، ثم حوّلها إلى \`UPDATE\` أو \`DELETE\`.

تفصيلان يستحقان الانتباه:

- في \`SET stock = stock + 10\` يُحسب الطرف الأيمن من القيمة **الحالية** للصف. قاعدة البيانات تجري الحساب، فلا تحتاج إلى قراءة القيمة في برنامجك أولاً.
- كل جملة تُبلغ كم صفاً لمست (\`cursor.rowcount\` في \`sqlite3\` ببايثون). فحصها طريقة رخيصة لملاحظة \`WHERE\` لم تطابق شيئاً، أو طابقت أكثر من اللازم.

نخزّن المال هنا كـ **سنتات صحيحة** (\`price_cents\`) لا كـ \`REAL\`. فالفاصلة العائمة الثنائية لا تمثّل قيماً مثل 0.10 تمثيلاً دقيقاً، وأخطاء التقريب في المال خطأ برمجي كلاسيكي.

## دورك: جرد المخزون`,
      },
    },
    {
      type: "lab",
      id: "crud-stock-take",
      lang: "python",
      prompt: {
        en: `The \`products\` table has \`id\`, \`name\`, \`stock\`, \`price_cents\` and \`discontinued\` (1 = no longer sold, default 0). Write **three statements**:

1. \`restock_sql\`: add \`:qty\` to the stock of every product whose stock is **below** \`:threshold\` and which is **not** discontinued.
2. \`delete_sql\`: delete all discontinued products.
3. \`insert_sql\`: add a new product named \`Desk Lamp\` with stock \`5\` and price \`2499\` cents (let the database choose the \`id\`; \`discontinued\` takes its default).

**Input:** one line: \`threshold qty\`.
**Output:** \`restocked: N\`, \`deleted: N\`, \`inserted: N\` (the row counts), then one line per remaining product ordered by id. The program prints them for you.

Example: input \`10 20\` restocks 4 products, deletes 2, inserts 1.`,
        ar: `يحوي الجدول \`products\` الأعمدة \`id\` و\`name\` و\`stock\` و\`price_cents\` و\`discontinued\` (القيمة 1 = لم يعد يُباع، والافتراضي 0). اكتب **ثلاث جمل**:

1. \`restock_sql\`: أضف \`:qty\` إلى مخزون كل منتج مخزونه **أقل من** \`:threshold\` و**غير** متوقف.
2. \`delete_sql\`: احذف كل المنتجات المتوقفة.
3. \`insert_sql\`: أضف منتجاً جديداً اسمه \`Desk Lamp\` بمخزون \`5\` وسعر \`2499\` سنتاً (دع قاعدة البيانات تختار \`id\`، و\`discontinued\` يأخذ قيمته الافتراضية).

**الدخل:** سطر واحد: \`threshold qty\`.
**الخرج:** \`restocked: N\` و\`deleted: N\` و\`inserted: N\` (عدد الصفوف)، ثم سطر لكل منتج متبقٍ مرتّباً حسب id. يطبع البرنامج ذلك عنك.

مثال: الدخل \`10 20\` يعيد تخزين 4 منتجات ويحذف 2 ويُدخل 1.`,
      },
      starterCode: `${PRODUCTS_SEED}
# TODO: replace each placeholder with the real statement.
# Use :threshold and :qty as named parameters (the dict \`params\` is passed to every statement).
restock_sql = "SELECT 1"   # UPDATE ...
delete_sql = "SELECT 1"    # DELETE ...
insert_sql = "SELECT 1"    # INSERT ...
${PRODUCTS_REPORT}`,
      solution: `${PRODUCTS_SEED}
# Only active products below the threshold get restocked (strictly below).
restock_sql = "UPDATE products SET stock = stock + :qty WHERE stock < :threshold AND discontinued = 0"
delete_sql = "DELETE FROM products WHERE discontinued = 1"
# id is assigned automatically; discontinued falls back to its DEFAULT 0.
insert_sql = "INSERT INTO products (name, stock, price_cents) VALUES ('Desk Lamp', 5, 2499)"
${PRODUCTS_REPORT}`,
      hints: [
        { en: "Restock: UPDATE products SET stock = stock + :qty WHERE ... Both conditions go in the WHERE, joined with AND.", ar: "إعادة التخزين: UPDATE products SET stock = stock + :qty WHERE ... وضع الشرطين كليهما في WHERE بينهما AND." },
        { en: "'Below the threshold' is strict: a product with stock equal to the threshold is not restocked.", ar: "«أقل من الحد» صارمة: المنتج الذي مخزونه يساوي الحد لا يُعاد تخزينه." },
        { en: "INSERT INTO products (name, stock, price_cents) VALUES (...) lists only the columns you supply; id and discontinued are filled in automatically.", ar: "INSERT INTO products (name, stock, price_cents) VALUES (...) تذكر الأعمدة التي تقدّمها فقط؛ أما id وdiscontinued فيُملآن تلقائياً." },
      ],
      tests: [
        {
          name: { en: "Restock products below 10 by 20", ar: "إعادة تخزين ما دون 10 بمقدار 20" },
          stdin: "10 20\n",
          expected: "restocked: 4\ndeleted: 2\ninserted: 1\n1 Notebook A5 stock=12 price=4.50\n2 Gel Pen Black stock=23 price=1.75\n3 Stapler stock=20 price=12.00\n4 Whiteboard Marker stock=25 price=2.20\n6 Sticky Notes stock=28 price=3.00\n8 Highlighter Set stock=22 price=6.50\n9 Desk Lamp stock=5 price=24.99",
        },
        {
          name: { en: "Threshold 0: nothing is below it", ar: "الحد 0: لا شيء دونه" },
          stdin: "0 5\n",
          expected: "restocked: 0\ndeleted: 2\ninserted: 1\n1 Notebook A5 stock=12 price=4.50\n2 Gel Pen Black stock=3 price=1.75\n3 Stapler stock=0 price=12.00\n4 Whiteboard Marker stock=25 price=2.20\n6 Sticky Notes stock=8 price=3.00\n8 Highlighter Set stock=2 price=6.50\n9 Desk Lamp stock=5 price=24.99",
        },
        {
          name: { en: "Boundary: stock equal to the threshold is not restocked", ar: "حالة حدّية: المخزون المساوي للحد لا يُعاد تخزينه" },
          stdin: "12 1\n",
          expected: "restocked: 4\ndeleted: 2\ninserted: 1\n1 Notebook A5 stock=12 price=4.50\n2 Gel Pen Black stock=4 price=1.75\n3 Stapler stock=1 price=12.00\n4 Whiteboard Marker stock=25 price=2.20\n6 Sticky Notes stock=9 price=3.00\n8 Highlighter Set stock=3 price=6.50\n9 Desk Lamp stock=5 price=24.99",
        },
        {
          name: { en: "Huge threshold: every active product, no discontinued ones", ar: "حد ضخم: كل المنتجات الفعّالة دون المتوقفة" },
          stdin: "100 1\n",
          expected: "restocked: 6\ndeleted: 2\ninserted: 1\n1 Notebook A5 stock=13 price=4.50\n2 Gel Pen Black stock=4 price=1.75\n3 Stapler stock=1 price=12.00\n4 Whiteboard Marker stock=26 price=2.20\n6 Sticky Notes stock=9 price=3.00\n8 Highlighter Set stock=3 price=6.50\n9 Desk Lamp stock=5 price=24.99",
        },
      ],
      sampleInput: "10 20\n",
    },
    {
      type: "text",
      body: {
        en: `## Constraints: let the database say no

Validation in your application code is a good first line of defense, but it can be bypassed or forgotten: another service, a script, a bug. **Constraints** live in the database and apply to every writer.

\`\`\`sql
CREATE TABLE students (
  id    INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,                       -- required and no duplicates
  age   INTEGER CHECK (age BETWEEN 16 AND 100),     -- any condition you can express
  team  TEXT DEFAULT 'unassigned'                   -- used when the column is omitted
);
\`\`\`

- \`NOT NULL\`: the value may not be missing.
- \`UNIQUE\`: no two rows share this value. (NULLs do not count as equal to each other, so most databases allow several NULLs in a \`UNIQUE\` column.)
- \`CHECK (condition)\`: reject any row where the condition is false.
- \`PRIMARY KEY\`: identifies each row. It must be unique and is how other tables point at the row.
- \`FOREIGN KEY\`: \`team_id INTEGER REFERENCES teams(id)\` means the value must exist in \`teams\`. **SQLite only enforces foreign keys after \`PRAGMA foreign_keys = ON\`, once per connection.** Other databases enforce them always.

When a statement breaks a constraint, the **whole statement fails** with an error (Python raises \`sqlite3.IntegrityError\`) and nothing is written. Your program can catch it and report something useful to the user.

## Your turn: design the guard`,
        ar: `## القيود: دع قاعدة البيانات تقول «لا»

التحقق في شيفرة تطبيقك خط دفاع أول جيد، لكن يمكن تجاوزه أو نسيانه: خدمة أخرى، أو سكربت، أو خطأ برمجي. **القيود** تعيش داخل قاعدة البيانات وتسري على كل من يكتب فيها.

\`\`\`sql
CREATE TABLE students (
  id    INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,                       -- مطلوب وبلا تكرار
  age   INTEGER CHECK (age BETWEEN 16 AND 100),     -- أي شرط يمكنك التعبير عنه
  team  TEXT DEFAULT 'unassigned'                   -- تُستخدم عند إغفال العمود في الإدخال
);
\`\`\`

- \`NOT NULL\`: لا يجوز أن تكون القيمة مفقودة.
- \`UNIQUE\`: لا يتشارك صفان في هذه القيمة. (قيم NULL لا تُعد متساوية فيما بينها، لذا تسمح معظم القواعد بعدة قيم NULL في عمود \`UNIQUE\`.)
- \`CHECK (condition)\`: ارفض أي صف يكون الشرط فيه خاطئاً.
- \`PRIMARY KEY\`: يحدد كل صف. يجب أن يكون فريداً وبه تشير الجداول الأخرى إلى الصف.
- \`FOREIGN KEY\`: العبارة \`team_id INTEGER REFERENCES teams(id)\` تعني أن القيمة يجب أن توجد في \`teams\`. **لا تفرض SQLite المفاتيح الأجنبية إلا بعد \`PRAGMA foreign_keys = ON\`، مرة لكل اتصال.** أما القواعد الأخرى فتفرضها دائماً.

حين تخرق جملة ما قيداً **تفشل الجملة كلها** بخطأ (تُطلق بايثون \`sqlite3.IntegrityError\`) ولا يُكتب شيء. يستطيع برنامجك التقاط الخطأ وإبلاغ المستخدم بشيء مفيد.

## دورك: صمّم الحارس`,
      },
    },
    {
      type: "lab",
      id: "constraints-guard",
      lang: "python",
      prompt: {
        en: `Create the \`students\` table so that the database itself rejects bad rows. It needs \`id INTEGER PRIMARY KEY\`, \`email\` and \`age\`, and these rules:

- \`email\` is **required** and must be **unique**
- \`age\` must be **between 16 and 100 inclusive**

The program then tries to insert one student per input line and reports \`OK\` or \`REJECTED\` with the kind of constraint that failed.

**Input:** lines of \`email age\`. The word \`NULL\` instead of an email means "no email".
**Output:** per line \`OK email\` or \`REJECTED email - KIND\` (\`UNIQUE\`, \`NOT NULL\` or \`CHECK\`), then \`rows: N\`.

Example: the lines \`amal@mail.com 20\` and \`amal@mail.com 22\` print
\`\`\`
OK amal@mail.com
REJECTED amal@mail.com - UNIQUE
rows: 1
\`\`\``,
        ar: `أنشئ الجدول \`students\` بحيث ترفض قاعدة البيانات نفسها الصفوف الخاطئة. يحتاج إلى \`id INTEGER PRIMARY KEY\` و\`email\` و\`age\`، وبهذه القواعد:

- \`email\` **مطلوب** ويجب أن يكون **فريداً**
- \`age\` يجب أن يكون **بين 16 و100 شاملةً الحدّين**

بعدها يحاول البرنامج إدخال طالب لكل سطر دخل، ويُبلغ \`OK\` أو \`REJECTED\` مع نوع القيد الذي فشل.

**الدخل:** أسطر بصيغة \`email age\`. الكلمة \`NULL\` بدل البريد تعني «بلا بريد».
**الخرج:** لكل سطر \`OK email\` أو \`REJECTED email - KIND\` (\`UNIQUE\` أو \`NOT NULL\` أو \`CHECK\`)، ثم \`rows: N\`.

مثال: السطران \`amal@mail.com 20\` و\`amal@mail.com 22\` يطبعان
\`\`\`
OK amal@mail.com
REJECTED amal@mail.com - UNIQUE
rows: 1
\`\`\``,
      },
      starterCode: `import sqlite3
import sys

db = sqlite3.connect(":memory:")

# TODO: add the constraints: email NOT NULL + UNIQUE, age CHECK between 16 and 100.
db.execute("""
    CREATE TABLE students (
        id    INTEGER PRIMARY KEY,
        email TEXT,
        age   INTEGER
    )
""")
${STUDENTS_RUN}`,
      solution: `import sqlite3
import sys

db = sqlite3.connect(":memory:")

db.execute("""
    CREATE TABLE students (
        id    INTEGER PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        age   INTEGER CHECK (age BETWEEN 16 AND 100)
    )
""")
${STUDENTS_RUN}`,
      hints: [
        { en: "Constraints are written after the column type: email TEXT NOT NULL UNIQUE.", ar: "تُكتب القيود بعد نوع العمود: email TEXT NOT NULL UNIQUE." },
        { en: "CHECK takes any condition in parentheses: CHECK (age BETWEEN 16 AND 100). BETWEEN includes both ends.", ar: "يقبل CHECK أي شرط بين قوسين: CHECK (age BETWEEN 16 AND 100). والعبارة BETWEEN تشمل الحدّين." },
      ],
      tests: [
        { name: { en: "Two valid students", ar: "طالبان صالحان" }, stdin: "amal@mail.com 20\nbilal@mail.com 31\n", expected: "OK amal@mail.com\nOK bilal@mail.com\nrows: 2" },
        { name: { en: "Duplicate email is rejected", ar: "البريد المكرر يُرفض" }, stdin: "amal@mail.com 20\namal@mail.com 22\n", expected: "OK amal@mail.com\nREJECTED amal@mail.com - UNIQUE\nrows: 1" },
        { name: { en: "Missing email is rejected", ar: "البريد المفقود يُرفض" }, stdin: "NULL 25\n", expected: "REJECTED NULL - NOT NULL\nrows: 0" },
        {
          name: { en: "Age boundaries: 15 and 101 fail, 16 and 100 pass", ar: "حدود العمر: 15 و101 تفشلان و16 و100 تنجحان" },
          stdin: "kid@mail.com 15\nold@mail.com 101\nedge16@mail.com 16\nedge100@mail.com 100\n",
          expected: "REJECTED kid@mail.com - CHECK\nREJECTED old@mail.com - CHECK\nOK edge16@mail.com\nOK edge100@mail.com\nrows: 2",
        },
        { name: { en: "Empty input inserts nothing", ar: "الدخل الفارغ لا يُدخل شيئاً" }, stdin: "", expected: "rows: 0" },
      ],
      sampleInput: "amal@mail.com 20\namal@mail.com 22\nNULL 25\nkid@mail.com 15\n",
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What does a PRIMARY KEY guarantee?", ar: "ماذا يضمن المفتاح الأساسي (PRIMARY KEY)؟" },
          choices: [
            { en: "Each row can be identified by exactly one key value", ar: "يمكن تحديد كل صف بقيمة مفتاح واحدة بالضبط" },
            { en: "Rows are stored and returned sorted by that column", ar: "تُخزَّن الصفوف وتُرجَع مرتبة حسب ذلك العمود" },
            { en: "The value can never be changed once inserted", ar: "لا يمكن تغيير القيمة بعد إدخالها" },
            { en: "No other column in the table may contain duplicates", ar: "لا يجوز أن يحوي أي عمود آخر في الجدول قيماً مكررة" },
          ],
          answer: 0,
          explain: {
            en: "A primary key identifies a row uniquely, which is how other tables refer to it. It says nothing about the order rows come back in (use ORDER BY), it is not a lock on the value, and it only constrains its own column.",
            ar: "المفتاح الأساسي يحدد الصف بشكل فريد، وبه تشير إليه الجداول الأخرى. ولا يقول شيئاً عن ترتيب عودة الصفوف (استخدم ORDER BY)، وليس قفلاً على القيمة، ويقيّد عموده هو فقط.",
          },
        },
        {
          q: { en: "You run SELECT title FROM books LIMIT 3 without an ORDER BY. Which rows do you get?", ar: "تشغّل SELECT title FROM books LIMIT 3 بدون ORDER BY. أي الصفوف تحصل عليها؟" },
          choices: [
            { en: "The three oldest rows, because tables are stored in insertion order", ar: "أقدم ثلاثة صفوف، لأن الجداول تُخزَّن بترتيب الإدخال" },
            { en: "Some three rows: SQL does not promise any order", ar: "ثلاثة صفوف ما: SQL لا تَعِد بأي ترتيب" },
            { en: "The three rows with the smallest id", ar: "الصفوف الثلاثة ذات أصغر id" },
          ],
          answer: 1,
          explain: {
            en: "Without ORDER BY the order is whatever is convenient for the engine, and it can change after an index is added or data is updated. If you need the first three of something, say how to sort.",
            ar: "بدون ORDER BY يكون الترتيب ما يناسب المحرّك، وقد يتغير بعد إضافة فهرس أو تحديث البيانات. إن أردت أول ثلاثة من شيء ما فحدّد كيف يُرتَّب.",
          },
        },
        {
          q: { en: "Some books have rating = NULL. What does SELECT * FROM books WHERE rating = NULL return?", ar: "بعض الكتب قيمة rating فيها NULL. ماذا تُرجع SELECT * FROM books WHERE rating = NULL؟" },
          choices: [
            { en: "Exactly the books with no rating", ar: "الكتب التي بلا تقييم بالضبط" },
            { en: "Every book", ar: "كل الكتب" },
            { en: "No rows at all", ar: "لا صفوف إطلاقاً" },
            { en: "An error, because NULL cannot be compared", ar: "خطأ، لأن NULL لا يمكن مقارنتها" },
          ],
          answer: 2,
          explain: {
            en: "Comparing anything with NULL, even NULL = NULL, gives 'unknown', and WHERE only keeps rows where the test is true. Use rating IS NULL (or IS NOT NULL). There is no error, just a silent empty result.",
            ar: "مقارنة أي شيء بـ NULL، حتى NULL = NULL، تعطي «مجهول»، و WHERE لا تُبقي إلا الصفوف التي اختبارها صحيح. استخدم rating IS NULL (أو IS NOT NULL). لا يحدث خطأ، بل نتيجة فارغة صامتة.",
          },
        },
        {
          q: { en: "You run UPDATE products SET price_cents = 0; (no WHERE). What happens?", ar: "تشغّل UPDATE products SET price_cents = 0; (بدون WHERE). ماذا يحدث؟" },
          choices: [
            { en: "The database refuses and asks for a WHERE clause", ar: "ترفض قاعدة البيانات وتطلب عبارة WHERE" },
            { en: "Only the first row is updated", ar: "يُحدَّث الصف الأول فقط" },
            { en: "Every product in the table gets price 0", ar: "كل منتج في الجدول يصبح سعره 0" },
          ],
          answer: 2,
          explain: {
            en: "A statement without WHERE applies to all rows, and SQL does not ask for confirmation. Write the WHERE first, check it with a SELECT, and for risky changes use a transaction (a later lesson) so you can roll back.",
            ar: "الجملة بدون WHERE تسري على كل الصفوف، و SQL لا تطلب تأكيداً. اكتب WHERE أولاً وتحقق منها بـ SELECT، وللتغييرات الخطرة استخدم معاملة (transaction) في درس لاحق لتتمكن من التراجع.",
          },
        },
        {
          q: { en: "What does a FOREIGN KEY constraint enforce?", ar: "ماذا يفرض قيد المفتاح الأجنبي (FOREIGN KEY)؟" },
          choices: [
            { en: "The value must match an existing key in the referenced table", ar: "يجب أن تطابق القيمة مفتاحاً موجوداً في الجدول المُشار إليه" },
            { en: "The database copies the referenced row into this table", ar: "تنسخ قاعدة البيانات الصف المُشار إليه إلى هذا الجدول" },
            { en: "Queries on that column become faster automatically", ar: "تصبح الاستعلامات على ذلك العمود أسرع تلقائياً" },
            { en: "The column is encrypted", ar: "يُشفَّر العمود" },
          ],
          answer: 0,
          explain: {
            en: "That is referential integrity: no loan can point at a book that does not exist. It does not copy data, and it does not create an index on every database, so you often add one yourself. Remember that SQLite needs PRAGMA foreign_keys = ON for each connection.",
            ar: "هذه هي سلامة المراجع (referential integrity): لا يمكن لإعارة أن تشير إلى كتاب غير موجود. لا ينسخ بيانات، ولا ينشئ فهرساً في كل قواعد البيانات، لذا كثيراً ما تضيف واحداً بنفسك. وتذكّر أن SQLite تحتاج PRAGMA foreign_keys = ON في كل اتصال.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap and what to practice next

- A relational database stores data in **tables** of rows and columns; **primary keys** identify rows and **foreign keys** link tables.
- \`SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT\` reads data; \`INSERT\`, \`UPDATE\` and \`DELETE\` change it. Always scope changes with \`WHERE\`.
- **NULL** is unknown: use \`IS NULL\`, and remember that comparisons with it never come out true.
- Pass values as **parameters**, never by gluing strings.
- **Constraints** (\`NOT NULL\`, \`UNIQUE\`, \`CHECK\`, \`PRIMARY KEY\`, \`FOREIGN KEY\`) keep bad data out no matter who writes it.

**Practice next:** invent a small domain you know (a gym, a football league, a recipe box). Write its \`CREATE TABLE\` statements with constraints, insert ten rows and ask five different questions with \`SELECT\`. In the next lesson you will learn how to decide *which tables* a domain needs.`,
        ar: `## الخلاصة وما تتدرب عليه بعد ذلك

- تخزّن قاعدة البيانات العلائقية البيانات في **جداول** من صفوف وأعمدة؛ **المفاتيح الأساسية** تحدد الصفوف و**المفاتيح الأجنبية** تربط الجداول.
- \`SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT\` تقرأ البيانات؛ و\`INSERT\` و\`UPDATE\` و\`DELETE\` تغيّرها. حدّد التغييرات دائماً بـ \`WHERE\`.
- **NULL** تعني مجهول: استخدم \`IS NULL\`، وتذكّر أن المقارنات معها لا تكون صحيحة أبداً.
- مرّر القيم كـ **معاملات**، ولا تلصق النصوص أبداً.
- **القيود** (\`NOT NULL\` و\`UNIQUE\` و\`CHECK\` و\`PRIMARY KEY\` و\`FOREIGN KEY\`) تُبعد البيانات الخاطئة أياً كان من يكتب.

**تدرّب بعد ذلك:** اخترع مجالاً صغيراً تعرفه (نادٍ رياضي، دوري كرة قدم، صندوق وصفات). اكتب جمل \`CREATE TABLE\` له مع القيود، وأدخل عشرة صفوف واطرح خمسة أسئلة مختلفة بـ \`SELECT\`. في الدرس القادم ستتعلم كيف تقرر *أي جداول* يحتاجها المجال.`,
      },
    },
  ],
};
