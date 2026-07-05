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

**Practice:** try free interactive SQL at sqlbolt.com. **Next:** APIs & REST — how the frontend and other services talk to your database-backed server.`,
        ar: `## الخلاصة

- قواعد البيانات تخزّن البيانات دائماً كجداول (صفوف + أعمدة)
- SQL تنفّذ CRUD: SELECT وINSERT وUPDATE وDELETE
- SQL = مهيكلة + علائقية؛ NoSQL = مرنة + قابلة للتوسّع
- حاكيت استعلام WHERE في بايثون

**تدرّب:** جرّب SQL التفاعلي المجاني على sqlbolt.com. **التالي:** APIs وREST — كيف تتحدث الواجهة والخدمات الأخرى مع خادمك.`,
      },
    },
  ],
};
