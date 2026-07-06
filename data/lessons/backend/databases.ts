import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "databases",
  title: { en: "Databases & SQL — Where Data Lives", ar: "قواعد البيانات وSQL — حيث تعيش البيانات" },
  estMinutes: 40,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What a database is and why apps need one
- **Tables, rows, columns** — the spreadsheet model
- **SQL** — the language to ask questions of data
- SQL vs NoSQL, and you'll write query logic yourself`,
        ar: `## ماذا ستتعلم

- ما هي قاعدة البيانات ولماذا تحتاجها التطبيقات
- **الجداول والصفوف والأعمدة** — نموذج جدول البيانات
- **SQL** — لغة طرح الأسئلة على البيانات
- SQL مقابل NoSQL، وستكتب منطق الاستعلام بنفسك`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A giant, smart spreadsheet 📊

When you close an app, your data doesn't vanish — a **database** stored it permanently. The most common type, a **relational database** (MySQL, PostgreSQL, SQLite), organizes data like linked spreadsheets:

- A **table** = one sheet (e.g. \`users\`)
- A **column** = a field (\`id\`, \`name\`, \`email\`)
- A **row** = one record (one actual user)

\`\`\`
users table
┌────┬─────────┬──────────────────┐
│ id │ name    │ email            │
├────┼─────────┼──────────────────┤
│ 1  │ Sara    │ sara@mail.com    │
│ 2  │ Omar    │ omar@mail.com    │
└────┴─────────┴──────────────────┘
\`\`\`

You talk to it with **SQL** (Structured Query Language) — remarkably close to English:

\`\`\`sql
SELECT name FROM users WHERE id = 1;          -- get Sara's name
INSERT INTO users (name, email) VALUES ('Lina', 'lina@mail.com');
UPDATE users SET email = 'new@mail.com' WHERE id = 2;
DELETE FROM users WHERE id = 2;
\`\`\`

These four — SELECT, INSERT, UPDATE, DELETE — are called **CRUD** (Create, Read, Update, Delete) and are 95% of what backends do all day.

**SQL vs NoSQL:** SQL databases have a strict structure (every user row has the same columns) — great when data is well-defined and relationships matter. **NoSQL** databases (MongoDB, etc.) store flexible documents — great when structure varies or you need massive scale. Most apps start with SQL; reach for NoSQL for specific needs.`,
        ar: `## جدول بيانات ضخم وذكي 📊

حين تغلق تطبيقاً، لا تختفي بياناتك — **قاعدة البيانات** خزّنتها بشكل دائم. النوع الأشيع، **قاعدة البيانات العلائقية** (MySQL، PostgreSQL، SQLite)، تنظّم البيانات كجداول مترابطة:

- **الجدول (table)** = ورقة واحدة (مثل \`users\`)
- **العمود (column)** = حقل (\`id\`، \`name\`، \`email\`)
- **الصف (row)** = سجلّ واحد (مستخدم فعلي)

\`\`\`
جدول users
┌────┬─────────┬──────────────────┐
│ id │ name    │ email            │
├────┼─────────┼──────────────────┤
│ 1  │ Sara    │ sara@mail.com    │
│ 2  │ Omar    │ omar@mail.com    │
└────┴─────────┴──────────────────┘
\`\`\`

تخاطبها بـ**SQL** (لغة الاستعلام المهيكلة) — قريبة جداً من الإنجليزية:

\`\`\`sql
SELECT name FROM users WHERE id = 1;          -- احصل على اسم Sara
INSERT INTO users (name, email) VALUES ('Lina', 'lina@mail.com');
UPDATE users SET email = 'new@mail.com' WHERE id = 2;
DELETE FROM users WHERE id = 2;
\`\`\`

هذه الأربعة — SELECT وINSERT وUPDATE وDELETE — تسمى **CRUD** (إنشاء، قراءة، تحديث، حذف) وهي 95% مما تفعله الخلفيات طوال اليوم.

**SQL مقابل NoSQL:** قواعد SQL ذات بنية صارمة (كل صف مستخدم له نفس الأعمدة) — رائعة حين تكون البيانات محددة والعلاقات مهمة. أما **NoSQL** (MongoDB وغيرها) فتخزّن مستندات مرنة — رائعة حين تتغير البنية أو تحتاج مقياساً هائلاً. معظم التطبيقات تبدأ بـ SQL؛ وتلجأ إلى NoSQL لاحتياجات محددة.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Simulate a \`SELECT ... WHERE\` query. Given a list of user dictionaries in \`users\`, write \`find_by_email(users, email)\` that returns the **user dict** whose email matches, or \`None\` if not found.

This is exactly what a database does under the hood.`,
        ar: `حاكِ استعلام \`SELECT ... WHERE\`. بمعطى قائمة قواميس مستخدمين في \`users\`، اكتب \`find_by_email(users, email)\` تعيد **قاموس المستخدم** الذي يطابق بريده، أو \`None\` إن لم يوجد.

هذا بالضبط ما تفعله قاعدة البيانات في الخلفية.`,
      },
      starterCode: `users = [
    {"id": 1, "name": "Sara", "email": "sara@mail.com"},
    {"id": 2, "name": "Omar", "email": "omar@mail.com"},
]

def find_by_email(users, email):
    # loop and return the matching user, else None
    pass

print(find_by_email(users, "omar@mail.com"))  # {'id': 2, ...}
print(find_by_email(users, "nobody@mail.com")) # None`,
      solution: `users = [
    {"id": 1, "name": "Sara", "email": "sara@mail.com"},
    {"id": 2, "name": "Omar", "email": "omar@mail.com"},
]

def find_by_email(users, email):
    for user in users:
        if user["email"] == email:
            return user
    return None

print(find_by_email(users, "omar@mail.com"))
print(find_by_email(users, "nobody@mail.com"))`,
      hints: [
        { en: `Loop: for user in users: — then compare user["email"] == email.`, ar: `كرّر: for user in users: — ثم قارن user["email"] == email.` },
        { en: `Return the user on a match; after the loop, return None.`, ar: `أعِد المستخدم عند التطابق؛ وبعد الحلقة أعِد None.` },
      ],
      tests: [
        { name: { en: "Finds an existing user", ar: "يجد مستخدماً موجوداً" }, check: `assert find_by_email(users, "omar@mail.com")["id"] == 2` },
        { name: { en: "Returns None when not found", ar: "يعيد None عند عدم الوجود" }, check: `assert find_by_email(users, "x@mail.com") is None` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Indexes and JOINs — speed and relationships 🔗

Two ideas turn a plain table of data into a real, fast, relational database.

**Indexes — the book's table of contents.** Without an index, finding \`WHERE email = 'sara@mail.com'\` in a million-row table means scanning every single row, one by one — a **full table scan**. Slow. An **index** is a separate, pre-sorted lookup structure (like a book's index at the back) that lets the database jump almost straight to the matching rows instead of reading everything:

\`\`\`sql
CREATE INDEX idx_users_email ON users(email);
-- now WHERE email = '...' is fast even with millions of rows
\`\`\`

The trade-off: indexes speed up reads but slightly slow down writes (every INSERT/UPDATE must also update the index) and use extra disk space. You index the columns you filter or sort by often — not every column.

**JOINs — connecting tables.** Real data is rarely one flat table. An e-commerce app has \`users\` and separately \`orders\`, linked by a \`user_id\` column in \`orders\` pointing back to a user's \`id\`. A **JOIN** stitches matching rows from two tables into one result:

\`\`\`sql
SELECT users.name, orders.total
FROM orders
JOIN users ON orders.user_id = users.id;
-- "Sara" | 45.00
-- "Omar" | 120.00
\`\`\`

This is the core idea behind "**relational**" in relational database: tables relate to each other through shared keys (a **foreign key** like \`user_id\`), instead of duplicating every user's name inside every single order row.`,
        ar: `## الفهارس وJOIN — السرعة والعلاقات 🔗

فكرتان تحوّلان جدول بيانات عادياً إلى قاعدة بيانات علائقية حقيقية وسريعة.

**الفهارس (indexes) — فهرس الكتاب.** بلا فهرس، إيجاد \`WHERE email = 'sara@mail.com'\` في جدول مليون صف يعني مسح كل صف على حدة — **مسح كامل للجدول (full table scan)**. بطيء. **الفهرس** بنية بحث منفصلة مُرتّبة مسبقاً (كفهرس كتاب في آخره) تتيح للقاعدة القفز مباشرة تقريباً إلى الصفوف المطابقة بدل قراءة كل شيء:

\`\`\`sql
CREATE INDEX idx_users_email ON users(email);
-- الآن WHERE email = '...' سريع حتى مع ملايين الصفوف
\`\`\`

المقايضة: الفهارس تسرّع القراءة لكنها تبطئ الكتابة قليلاً (كل INSERT/UPDATE يجب أن يُحدّث الفهرس أيضاً) وتستهلك مساحة قرص إضافية. تُفهرس الأعمدة التي تُصفّي أو تُرتّب بها كثيراً — لا كل عمود.

**JOIN — ربط الجداول.** البيانات الحقيقية نادراً ما تكون جدولاً مسطحاً واحداً. تطبيق تجارة إلكترونية لديه \`users\` وبشكل منفصل \`orders\`، مرتبطان بعمود \`user_id\` في \`orders\` يشير إلى \`id\` مستخدم. **JOIN** يخيط الصفوف المتطابقة من جدولين في نتيجة واحدة:

\`\`\`sql
SELECT users.name, orders.total
FROM orders
JOIN users ON orders.user_id = users.id;
-- "Sara" | 45.00
-- "Omar" | 120.00
\`\`\`

هذه هي الفكرة الجوهرية خلف كلمة "**علائقية**" في قاعدة البيانات العلائقية: الجداول ترتبط ببعضها عبر مفاتيح مشتركة (**مفتاح أجنبي (foreign key)** مثل \`user_id\`)، بدل تكرار اسم كل مستخدم داخل كل صف طلب.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Simulate what an **index** buys you. Build an index dict from a list of orders, then look up a user's orders instantly instead of scanning the whole list.

Write \`build_index(orders)\` that returns a dict mapping \`user_id\` → list of that user's orders. Then write \`orders_for_user(index, user_id)\` that returns the list for that user (or an empty list \`[]\` if none).`,
        ar: `حاكِ ما يمنحك إياه **الفهرس**. ابنِ قاموس فهرسة من قائمة طلبات، ثم ابحث عن طلبات مستخدم فوراً بدل مسح القائمة كلها.

اكتب \`build_index(orders)\` تعيد قاموساً يربط \`user_id\` بقائمة طلبات ذلك المستخدم. ثم اكتب \`orders_for_user(index, user_id)\` تعيد القائمة لذلك المستخدم (أو قائمة فارغة \`[]\` إن لم توجد).`,
      },
      starterCode: `orders = [
    {"user_id": 1, "total": 45.0},
    {"user_id": 2, "total": 120.0},
    {"user_id": 1, "total": 30.0},
]

def build_index(orders):
    # return { user_id: [orders...] }
    pass

def orders_for_user(index, user_id):
    # return index[user_id] if present, else []
    pass

idx = build_index(orders)
print(orders_for_user(idx, 1))  # both of Sara's orders
print(orders_for_user(idx, 3))  # []`,
      solution: `orders = [
    {"user_id": 1, "total": 45.0},
    {"user_id": 2, "total": 120.0},
    {"user_id": 1, "total": 30.0},
]

def build_index(orders):
    index = {}
    for order in orders:
        uid = order["user_id"]
        if uid not in index:
            index[uid] = []
        index[uid].append(order)
    return index

def orders_for_user(index, user_id):
    return index.get(user_id, [])

idx = build_index(orders)
print(orders_for_user(idx, 1))
print(orders_for_user(idx, 3))`,
      hints: [
        { en: `In build_index, loop the orders; use order["user_id"] as the dict key and append to a list under that key.`, ar: `في build_index، كرّر على الطلبات؛ استخدم order["user_id"] كمفتاح قاموس وأضِف إلى قائمة تحت ذلك المفتاح.` },
        { en: `orders_for_user is one line: return index.get(user_id, []) — .get with a default avoids a KeyError.`, ar: `orders_for_user سطر واحد: return index.get(user_id, []) — .get مع قيمة افتراضية يتجنّب خطأ KeyError.` },
      ],
      tests: [
        { name: { en: "Index groups orders by user_id", ar: "الفهرس يجمّع الطلبات حسب user_id" }, check: `assert len(build_index(orders)[1]) == 2` },
        { name: { en: "orders_for_user finds an existing user's orders", ar: "orders_for_user يجد طلبات مستخدم موجود" }, check: `assert len(orders_for_user(build_index(orders), 2)) == 1` },
        { name: { en: "Missing user returns empty list, not an error", ar: "المستخدم غير الموجود يعيد قائمة فارغة، لا خطأ" }, check: `assert orders_for_user(build_index(orders), 999) == []` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: this platform's own database 🔍

This is not hypothetical — this very learning platform runs on a real relational database. Its backend (a Cloudflare Worker) uses **D1**, Cloudflare's managed SQLite database, with a schema that starts like this:

\`\`\`sql
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id   TEXT UNIQUE NOT NULL,
  username    TEXT NOT NULL,
  email       TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
\`\`\`

Notice the exact concepts from this lesson: \`id\` is the primary key (uniquely identifies each row), \`github_id\` is marked \`UNIQUE\` so no two users can share one GitHub account, and there's a real **index** on \`username\` — because the app looks up users by username often enough that a full table scan would be wasteful as the user count grows.

Every query in the Worker's code uses parameterized queries like \`env.DB.prepare("SELECT * FROM users WHERE github_id = ?").bind(user.sub)\` — the \`?\` placeholder plus \`.bind()\` is the standard, safe way to insert values into SQL without exposing the app to **SQL injection** (an attacker sneaking SQL commands through a text field). This lesson's abstractions aren't academic — they're exactly what runs in production for the app you're learning in right now.`,
        ar: `## دراسة حالة واقعية: قاعدة بيانات هذه المنصة نفسها 🔍

هذا ليس افتراضياً — هذه منصة التعلّم نفسها تعمل على قاعدة بيانات علائقية حقيقية. خلفيتها (Cloudflare Worker) تستخدم **D1**، قاعدة بيانات SQLite المُدارة من Cloudflare، بمخطط يبدأ هكذا:

\`\`\`sql
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id   TEXT UNIQUE NOT NULL,
  username    TEXT NOT NULL,
  email       TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
\`\`\`

لاحظ المفاهيم بالضبط من هذا الدرس: \`id\` هو المفتاح الرئيسي (يحدد كل صف بشكل فريد)، و\`github_id\` مُعلَّم \`UNIQUE\` كي لا يشارك مستخدمان نفس حساب GitHub، وهناك **فهرس** حقيقي على \`username\` — لأن التطبيق يبحث عن المستخدمين بالاسم كثيراً بما يكفي ليكون المسح الكامل للجدول مُهدراً مع تزايد عدد المستخدمين.

كل استعلام في كود الـ Worker يستخدم استعلامات مُعامَلة مثل \`env.DB.prepare("SELECT * FROM users WHERE github_id = ?").bind(user.sub)\` — العنصر النائب \`?\` مع \`.bind()\` هي الطريقة الآمنة والمعيارية لإدخال القيم في SQL دون تعريض التطبيق لـ**حقن SQL (SQL injection)** (مهاجم يُهرّب أوامر SQL عبر حقل نصي). تجريدات هذا الدرس ليست أكاديمية — إنها بالضبط ما يعمل في الإنتاج للتطبيق الذي تتعلّم فيه الآن.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "In a relational database, a 'row' is…", ar: "في قاعدة بيانات علائقية، 'الصف' هو…" },
          choices: [
            { en: "A single record (e.g. one user)", ar: "سجلّ واحد (مثل مستخدم واحد)" },
            { en: "A field like 'email'", ar: "حقل مثل 'email'" },
            { en: "The whole database", ar: "قاعدة البيانات كاملة" },
          ],
          answer: 0,
          explain: {
            en: "Table = sheet, column = field, row = one record. Sara's entire entry is one row.",
            ar: "الجدول = ورقة، العمود = حقل، الصف = سجلّ واحد. مُدخل Sara كاملاً صفّ واحد.",
          },
        },
        {
          q: { en: "What does CRUD stand for?", ar: "ماذا تعني CRUD؟" },
          choices: [
            { en: "Create, Read, Update, Delete", ar: "إنشاء، قراءة، تحديث، حذف" },
            { en: "Copy, Run, Undo, Deploy", ar: "نسخ، تشغيل، تراجع، نشر" },
            { en: "Cache, Route, Use, Debug", ar: "تخزين، توجيه، استخدام، تصحيح" },
          ],
          answer: 0,
          explain: {
            en: "CRUD = the four basic data operations, mapping to SQL's INSERT, SELECT, UPDATE, DELETE.",
            ar: "CRUD = العمليات الأربع الأساسية للبيانات، تقابل INSERT وSELECT وUPDATE وDELETE في SQL.",
          },
        },
        {
          q: { en: "When is a SQL database usually the better default?", ar: "متى تكون قاعدة SQL عادةً الخيار الافتراضي الأفضل؟" },
          choices: [
            { en: "When data is well-structured and relationships matter", ar: "حين تكون البيانات جيدة البنية والعلاقات مهمة" },
            { en: "Always, never use anything else", ar: "دائماً، لا تستخدم غيرها أبداً" },
            { en: "Only for tiny apps", ar: "فقط للتطبيقات الصغيرة جداً" },
          ],
          answer: 0,
          explain: {
            en: "SQL shines with structured, related data and guarantees. NoSQL fits flexible/huge-scale cases. Match the tool to the data.",
            ar: "SQL تتألق مع البيانات المهيكلة المترابطة والضمانات. وNoSQL تناسب الحالات المرنة/الضخمة. طابِق الأداة مع البيانات.",
          },
        },
        {
          q: { en: "What does a database index mainly do?", ar: "ماذا يفعل فهرس قاعدة البيانات أساساً؟" },
          choices: [
            { en: "Lets lookups jump to matching rows instead of scanning the whole table", ar: "يتيح للبحث القفز إلى الصفوف المطابقة بدل مسح الجدول كله" },
            { en: "Deletes duplicate rows automatically", ar: "يحذف الصفوف المكرّرة تلقائياً" },
            { en: "Encrypts the table", ar: "يشفّر الجدول" },
          ],
          answer: 0,
          explain: {
            en: "An index is a pre-sorted lookup structure, like a book's index — it trades a little extra write cost and disk space for much faster reads.",
            ar: "الفهرس بنية بحث مُرتّبة مسبقاً، كفهرس كتاب — يقايض تكلفة كتابة ومساحة قرص إضافية بسيطة مقابل قراءة أسرع بكثير.",
          },
        },
        {
          q: { en: "What does a JOIN do?", ar: "ماذا يفعل JOIN؟" },
          choices: [
            { en: "Combines matching rows from two related tables into one result", ar: "يدمج الصفوف المتطابقة من جدولين مترابطين في نتيجة واحدة" },
            { en: "Deletes a table", ar: "يحذف جدولاً" },
            { en: "Makes a backup of the database", ar: "ينشئ نسخة احتياطية من قاعدة البيانات" },
          ],
          answer: 0,
          explain: {
            en: "JOIN links tables through a shared key (like user_id), avoiding duplicated data — this is what 'relational' means.",
            ar: "JOIN يربط الجداول عبر مفتاح مشترك (مثل user_id)، متجنّباً تكرار البيانات — هذا ما تعنيه كلمة 'علائقية'.",
          },
        },
        {
          q: { en: "Why does this platform's own users table use .prepare(\"...WHERE github_id = ?\").bind(value)?", ar: "لماذا يستخدم جدول المستخدمين لهذه المنصة نفسها .prepare(\"...WHERE github_id = ?\").bind(value)؟" },
          choices: [
            { en: "To safely insert values into SQL and prevent SQL injection", ar: "لإدخال القيم بأمان في SQL ومنع حقن SQL" },
            { en: "To make the query run in a different language", ar: "لجعل الاستعلام يعمل بلغة مختلفة" },
            { en: "It has no real purpose, just style", ar: "لا غرض حقيقي له، مجرد أسلوب" },
          ],
          answer: 0,
          explain: {
            en: "Parameterized queries (? placeholders + bind) keep user input as data, never as executable SQL — the standard defense against SQL injection.",
            ar: "الاستعلامات المُعامَلة (عناصر نائبة ? مع bind) تُبقي مدخلات المستخدم كبيانات، لا كـ SQL قابل للتنفيذ — الدفاع المعياري ضد حقن SQL.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Databases store data permanently as tables (rows + columns)
- SQL does CRUD: SELECT, INSERT, UPDATE, DELETE
- SQL = structured + relational; NoSQL = flexible + scalable
- You simulated a WHERE query in Python
- **Indexes** make lookups fast at scale; **JOINs** connect related tables through keys — you built an index-style lookup by user_id
- This platform's own D1 database shows these ideas in production, including safe parameterized queries against SQL injection

**Practice:** try free interactive SQL at sqlbolt.com. **Next:** APIs & REST — how the frontend and other services talk to your database-backed server.`,
        ar: `## الخلاصة

- قواعد البيانات تخزّن البيانات دائماً كجداول (صفوف + أعمدة)
- SQL تنفّذ CRUD: SELECT وINSERT وUPDATE وDELETE
- SQL = مهيكلة + علائقية؛ NoSQL = مرنة + قابلة للتوسّع
- حاكيت استعلام WHERE في بايثون
- **الفهارس** تجعل البحث سريعاً عند التوسّع؛ و**JOIN** يربط الجداول المترابطة عبر المفاتيح — بنيت بحثاً بأسلوب الفهرسة حسب user_id
- قاعدة بيانات D1 لهذه المنصة نفسها تُظهر هذه الأفكار في الإنتاج، بما في ذلك الاستعلامات المُعامَلة الآمنة ضد حقن SQL

**تدرّب:** جرّب SQL التفاعلي المجاني على sqlbolt.com. **التالي:** APIs وREST — كيف تتحدث الواجهة والخدمات الأخرى مع خادمك.`,
      },
    },
  ],
};
