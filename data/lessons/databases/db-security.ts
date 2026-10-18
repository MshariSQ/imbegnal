import type { Lesson } from "../types";

// Everything here runs against a tiny in-memory database the program creates itself:
// the "attack" inputs are benign strings aimed at our own sample data.
const SEARCH_SEED = `import sqlite3
import sys

db = sqlite3.connect(":memory:")
db.executescript("""
    CREATE TABLE orders (
        id          INTEGER PRIMARY KEY,
        customer    TEXT NOT NULL,
        item        TEXT NOT NULL,
        total_cents INTEGER NOT NULL
    );
    INSERT INTO orders (customer, item, total_cents) VALUES
        ('amal', 'Notebook', 900), ('amal', 'Backpack', 3000), ('bilal', 'Pen', 625),
        ('d''arcy', 'Lamp', 3500), ('carla', 'Stapler', 1200), ('amal', 'Marker', 440);
""")
`;

const SEARCH_TAIL = `

# stdin line 1: the customer name typed into a search box (untrusted!)
# stdin line 2: the sort option sent by the page (also untrusted)
customer, sort = sys.stdin.read().splitlines()[:2]
try:
    rows = find_orders(customer, sort)
except ValueError:
    rows = None
if rows is None:
    print("error: unsupported sort")
else:
    print(f"rows: {len(rows)}")
    for order_id, item, total in rows:
        print(f"{order_id} {item} {total / 100:.2f}")
`;

const ROLES_SEED = `import sys

# A model of PostgreSQL's privilege system, fed with simplified statements:
#   GRANT SELECT, INSERT ON orders TO shop_api     (table privileges)
#   GRANT reader TO shop_api                       (role membership: shop_api joins reader)
#   REVOKE INSERT ON orders FROM shop_api
#   CHECK shop_api INSERT orders                   (ask: may this role do this now?)
grants = {}      # role -> set of (privilege, table) granted DIRECTLY to that role
member_of = {}   # role -> set of roles it is a member of (directly)
`;

const ROLES_TAIL = `

for line in sys.stdin.read().splitlines():
    words = line.replace(",", " ").split()
    if not words:
        continue
    if words[0] in ("GRANT", "REVOKE") and "ON" in words:
        at = words.index("ON")
        role_privileges = grants.setdefault(words[-1], set())
        for privilege in words[1:at]:
            if words[0] == "GRANT":
                role_privileges.add((privilege, words[at + 1]))
            else:
                role_privileges.discard((privilege, words[at + 1]))
    elif words[0] == "GRANT":
        member_of.setdefault(words[3], set()).add(words[1])
    elif words[0] == "CHECK":
        role, privilege, table = words[1:4]
        verdict = "allowed" if has_privilege(role, privilege, table) else "denied"
        print(f"{role} {privilege} {table}: {verdict}")
`;

const AUDIT_SEED = `import sqlite3
import sys

db = sqlite3.connect(":memory:", isolation_level=None)
db.executescript("""
    CREATE TABLE accounts (id INTEGER PRIMARY KEY, owner TEXT NOT NULL, balance INTEGER NOT NULL);
    INSERT INTO accounts (id, owner, balance) VALUES (1, 'amal', 100), (2, 'bilal', 50), (3, 'carla', 0);

    -- Who is acting right now. In PostgreSQL you would read current_user or a session setting.
    CREATE TABLE current_actor (username TEXT NOT NULL);
    INSERT INTO current_actor (username) VALUES ('system');

    CREATE TABLE audit_log (
        id          INTEGER PRIMARY KEY,
        action      TEXT NOT NULL,          -- 'UPDATE' or 'DELETE'
        account_id  INTEGER NOT NULL,
        old_balance INTEGER,
        new_balance INTEGER,                -- NULL for a DELETE
        changed_by  TEXT NOT NULL
    );
""")
`;

const AUDIT_TAIL = `
db.executescript(audit_sql)

# stdin: one action per line
#   as <user>              the following actions are made by <user>
#   set <id> <balance>     UPDATE an account's balance
#   delete <id>            DELETE an account
#   tamper                 someone tries to erase the audit log
for line in sys.stdin.read().splitlines():
    cmd = line.split()
    if not cmd:
        continue
    if cmd[0] == "as":
        db.execute("UPDATE current_actor SET username = ?", (cmd[1],))
    elif cmd[0] == "set":
        db.execute("UPDATE accounts SET balance = ? WHERE id = ?", (int(cmd[2]), int(cmd[1])))
    elif cmd[0] == "delete":
        db.execute("DELETE FROM accounts WHERE id = ?", (int(cmd[1]),))
    elif cmd[0] == "tamper":
        try:
            db.execute("DELETE FROM audit_log")
            print("tamper: audit log erased")
        except sqlite3.DatabaseError:
            print("tamper: blocked")

rows = db.execute("SELECT id, action, account_id, old_balance, new_balance, changed_by FROM audit_log ORDER BY id")
count = 0
for entry_id, action, account_id, old, new, who in rows:
    count += 1
    after = "(deleted)" if new is None else new
    print(f"#{entry_id} {action} account {account_id}: {old} -> {after} by {who}")
print("entries:", count)
`;

export const lesson: Lesson = {
  nodeId: "db-security",
  title: { en: "Database Security", ar: "أمن قواعد البيانات" },
  estMinutes: 45,
  sections: [
    {
      type: "text",
      body: {
        en: `## The hotel with one master key 🏨

In a well-run hotel, a guest's key card opens one room and the gym. A cleaner's card opens the rooms of one floor. The master key sits in the manager's safe. If a guest's card is stolen, the thief gets one room, not the whole building.

Database security works the same way. Attackers rarely break the database itself; they come in **through the application**: a query that pastes user input into SQL, a password committed to a repository, a backup left in a public bucket. Once inside, they can do whatever the **application's account** is allowed to do. So most database security is about two things: keeping attackers from running their own SQL, and **limiting what a compromised application account can do**.

## What you'll learn

- How **SQL injection** happens and why **parameterized queries** stop it; what to do for column names
- **Least privilege** with roles, \`GRANT\` and \`REVOKE\`, and how privileges are inherited
- Protecting **credentials**, and **encryption in transit and at rest**
- **Audit trails** that record who changed what, and that attackers cannot quietly erase

⚠️ **Ethics first:** these techniques are for defending systems and testing **your own** databases and applications, or ones you have **written permission** to test. Trying injection or stolen credentials against systems you do not own is a crime. Every example in this lesson runs against a small sample database the program creates itself.

## SQL injection: when data becomes code

Here is a search the way it is too often written:

\`\`\`python
sql = "SELECT id, item FROM orders WHERE customer = '" + name + "'"
\`\`\`

With \`name = "amal"\` the database receives \`... WHERE customer = 'amal'\`. With \`name = "x' OR '1'='1"\` it receives \`... WHERE customer = 'x' OR '1'='1'\`. The quote in the input **closed the string**, and \`OR '1'='1'\` became part of the **SQL code**: the condition is now true for every row, and every customer's orders are returned. Other inputs can change data or read other tables. Even an honest customer called **D'Arcy** breaks this query with a syntax error.

The fix is to keep code and data apart with a **parameterized query** (a *prepared statement*): the SQL text contains a placeholder, and the value is sent **separately**, so it can never be parsed as SQL.

\`\`\`python
db.execute("SELECT id, item FROM orders WHERE customer = ?", (name,))       # SQLite, Python
\`\`\`
\`\`\`text
PostgreSQL: WHERE customer = $1        psycopg: WHERE customer = %s  (a placeholder, NOT % formatting)
JDBC:       WHERE customer = ?         named:   WHERE customer = :name
\`\`\`

Rules from the OWASP SQL Injection Prevention Cheat Sheet, in its order of preference: use **prepared statements with parameters**; stored procedures are safe only if they do not build SQL from strings themselves; use **allow-list validation** where parameters cannot be used; escaping user input yourself is strongly discouraged.

**Placeholders work for values only.** Table names, column names and sort directions are **identifiers**, and they cannot be bound. When the user picks a sort column, map their choice through a **fixed allow-list** to a column name you wrote yourself, and reject everything else. ORMs use parameters for you, but their "raw SQL" escape hatches are injectable in exactly the same way.`,
        ar: `## الفندق ذو المفتاح الرئيسي الواحد 🏨

في الفندق حسن الإدارة تفتح بطاقة النزيل غرفة واحدة والنادي الرياضي. وتفتح بطاقة عامل التنظيف غرف طابق واحد. أما المفتاح الرئيسي فيبقى في خزنة المدير. فإن سُرقت بطاقة نزيل نال السارق غرفة واحدة، لا المبنى كله.

وأمن قواعد البيانات يعمل بالطريقة نفسها. نادراً ما يخترق المهاجمون القاعدة نفسها؛ بل يدخلون **عبر التطبيق**: استعلام يلصق إدخال المستخدم في SQL، أو كلمة مرور رُفعت إلى مستودع كود، أو نسخة احتياطية تُركت في حاوية تخزين عامة. وبعد الدخول يستطيعون فعل كل ما يُسمح لـ **حساب التطبيق** بفعله. لذلك يدور معظم أمن قواعد البيانات حول أمرين: منع المهاجمين من تشغيل SQL خاص بهم، و**تقييد ما يستطيع حساب تطبيق مخترَق فعله**.

## ماذا ستتعلم

- كيف يحدث **حقن SQL (SQL injection)** ولماذا توقفه **الاستعلامات المُعامَلة (parameterized queries)**؛ وماذا تفعل مع أسماء الأعمدة
- **أقل صلاحية (least privilege)** بالأدوار و\`GRANT\` و\`REVOKE\`، وكيف تُورَث الصلاحيات
- حماية **بيانات الاعتماد (credentials)**، و**التشفير أثناء النقل وأثناء التخزين**
- **سجلات التدقيق (audit trails)** التي تسجّل من غيّر ماذا، ولا يستطيع المهاجمون محوها بهدوء

⚠️ **الأخلاق أولاً:** هذه التقنيات للدفاع عن الأنظمة واختبار قواعد بياناتك وتطبيقاتك **أنت**، أو تلك التي لديك **إذن مكتوب** باختبارها. ومحاولة الحقن أو استخدام بيانات اعتماد مسروقة ضد أنظمة لا تملكها جريمة. وكل مثال في هذا الدرس يعمل على قاعدة بيانات نموذجية صغيرة ينشئها البرنامج بنفسه.

## حقن SQL: حين تصير البيانات كوداً

هذا بحث مكتوب كما يُكتب كثيراً للأسف:

\`\`\`python
sql = "SELECT id, item FROM orders WHERE customer = '" + name + "'"
\`\`\`

مع \`name = "amal"\` تتلقى القاعدة \`... WHERE customer = 'amal'\`. ومع \`name = "x' OR '1'='1"\` تتلقى \`... WHERE customer = 'x' OR '1'='1'\`. فقد **أغلقت** علامة الاقتباس في الإدخال النص، وصار \`OR '1'='1'\` جزءاً من **كود SQL**: الشرط الآن صحيح لكل صف، فتعود طلبات كل العملاء. ويمكن لإدخالات أخرى أن تغيّر البيانات أو تقرأ جداول أخرى. بل إن عميلاً أميناً اسمه **D'Arcy** يكسر هذا الاستعلام بخطأ صياغة.

والإصلاح هو فصل الكود عن البيانات بـ **استعلام مُعامَل** (*عبارة مُحضَّرة prepared statement*): يحوي نص SQL عنصراً نائباً (placeholder)، وتُرسل القيمة **منفصلة**، فلا يمكن أبداً أن تُحلَّل على أنها SQL.

\`\`\`python
db.execute("SELECT id, item FROM orders WHERE customer = ?", (name,))       # SQLite, Python
\`\`\`
\`\`\`text
PostgreSQL: WHERE customer = $1        psycopg: WHERE customer = %s  (a placeholder, NOT % formatting)
JDBC:       WHERE customer = ?         named:   WHERE customer = :name
\`\`\`

قواعد من ورقة OWASP المرجعية لمنع حقن SQL، بترتيب أفضليتها: استخدم **العبارات المُحضَّرة مع المعاملات**؛ والإجراءات المخزّنة (stored procedures) آمنة فقط إن لم تبنِ هي نفسها SQL من النصوص؛ واستخدم **التحقق بقائمة السماح (allow-list)** حيث لا يمكن استخدام المعاملات؛ أما تهريب (escaping) إدخال المستخدم بنفسك فغير مستحسن بشدة.

**العناصر النائبة للقيم فقط.** أسماء الجداول والأعمدة واتجاهات الترتيب **معرّفات (identifiers)**، ولا يمكن ربطها كمعاملات. فحين يختار المستخدم عمود الترتيب، حوّل اختياره عبر **قائمة سماح ثابتة** إلى اسم عمود كتبته أنت، وارفض كل ما عداه. وأطر ORM تستخدم المعاملات بالنيابة عنك، لكن منافذ «SQL الخام» فيها قابلة للحقن بالطريقة نفسها تماماً.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `# What the database receives: user input pasted into SQL versus a fixed statement plus values.


def code_part(sql):
    """Blank out the inside of '...' literals: what remains is what the database runs as code."""
    out, in_string = [], False
    for ch in sql:
        if ch == "'":
            in_string = not in_string
            out.append(ch)
        elif not in_string:
            out.append(ch)
    return "".join(out)


for name in ["amal", "x' OR '1'='1", "d'arcy"]:
    pasted = "SELECT id, item FROM orders WHERE customer = '" + name + "'"
    print("input:  ", name)
    print("  pasted SQL:     ", pasted)
    print("  its code part:  ", code_part(pasted))

statement = "SELECT id, item FROM orders WHERE customer = ?"
print()
print("parameterized code part, for EVERY input:", code_part(statement))
print("the input travels separately, as a value:", ("x' OR '1'='1",))`,
      explanation: {
        en: "For a normal name the code part is the query you meant. For the malicious input the code part gains OR ''='': the input rewrote the query. For D'Arcy the quotes no longer balance, which is the syntax error a real database reports. With a placeholder the code part is identical for every input, because the value never enters the SQL text.",
        ar: "مع الاسم العادي يكون جزء الكود هو الاستعلام الذي قصدته. ومع الإدخال الخبيث يكتسب جزء الكود OR ''='': لقد أعاد الإدخال كتابة الاستعلام. ومع D'Arcy لم تعد علامات الاقتباس متوازنة، وهذا هو خطأ الصياغة الذي تبلّغ به قاعدة حقيقية. أما مع العنصر النائب فجزء الكود متطابق لكل إدخال، لأن القيمة لا تدخل نص SQL أبداً.",
      },
    },
    {
      type: "lab",
      id: "fix-injection",
      lang: "python",
      prompt: {
        en: `A sample \`orders\` table exists (one customer is called \`d'arcy\`). \`find_orders(customer, sort)\` pastes **both** inputs into the SQL text, so it is injectable twice and crashes on an apostrophe.

Rewrite \`find_orders\` safely:

- pass \`customer\` as a **parameter** (\`?\`) instead of pasting it
- \`sort\` is a column choice, which cannot be a parameter: map \`id\`, \`item\` and \`total\` to the columns \`id\`, \`item\` and \`total_cents\` with an **allow-list**, and \`raise ValueError\` for anything else
- keep the selected columns \`id, item, total_cents\` and sort ascending

**Input:** line 1 is the customer name, line 2 the sort option. **Output:** \`rows: N\` and one line per order, or \`error: unsupported sort\`.

Example: \`amal\` and \`total\` print \`rows: 3\`, then Marker, Notebook and Backpack. The input \`x' OR '1'='1\` must find **0** rows: it is just an odd name.`,
        ar: `يوجد جدول \`orders\` نموذجي (اسم أحد العملاء \`d'arcy\`). تلصق \`find_orders(customer, sort)\` **كلا** الإدخالين في نص SQL، فهي قابلة للحقن مرتين وتتعطل عند علامة الاقتباس المفردة.

أعد كتابة \`find_orders\` بأمان:

- مرّر \`customer\` **معاملاً** (\`?\`) بدل لصقه
- \`sort\` اختيار عمود، ولا يمكن أن يكون معاملاً: حوّل \`id\` و\`item\` و\`total\` إلى الأعمدة \`id\` و\`item\` و\`total_cents\` بـ **قائمة سماح**، وارفع \`ValueError\` لأي شيء آخر
- أبقِ الأعمدة المختارة \`id, item, total_cents\` والترتيب تصاعدياً

**الدخل:** السطر 1 اسم العميل، والسطر 2 خيار الترتيب. **الخرج:** \`rows: N\` وسطر لكل طلب، أو \`error: unsupported sort\`.

مثال: \`amal\` و\`total\` يطبعان \`rows: 3\` ثم Marker وNotebook وBackpack. والإدخال \`x' OR '1'='1\` يجب أن يجد **0** صفوف: إنه مجرد اسم غريب.`,
      },
      starterCode: `${SEARCH_SEED}

def find_orders(customer, sort):
    """The customer's orders, sorted by the chosen column. Raise ValueError for an unknown sort."""
    # TODO: two injection holes. Both inputs are pasted into the SQL text.
    #  1. customer is a VALUE: use a ? placeholder and pass (customer,) to execute.
    #  2. sort is an IDENTIFIER (a column name), which cannot be a placeholder:
    #     map "id", "item" and "total" to id, item and total_cents with a dict,
    #     and raise ValueError for anything else.
    sql = f"SELECT id, item, total_cents FROM orders WHERE customer = '{customer}' ORDER BY {sort}"
    return db.execute(sql).fetchall()
${SEARCH_TAIL}`,
      solution: `${SEARCH_SEED}
# Identifiers (column names) cannot be bound as parameters, so the page's choice
# is mapped through a fixed allow-list to a column name we wrote ourselves.
SORT_COLUMNS = {"id": "id", "item": "item", "total": "total_cents"}


def find_orders(customer, sort):
    """The customer's orders, sorted by the chosen column. Raise ValueError for an unknown sort."""
    column = SORT_COLUMNS.get(sort)
    if column is None:
        raise ValueError(sort)
    sql = "SELECT id, item, total_cents FROM orders WHERE customer = ? ORDER BY " + column
    return db.execute(sql, (customer,)).fetchall()     # the value travels separately from the SQL
${SEARCH_TAIL}`,
      hints: [
        { en: "Write WHERE customer = ? in the SQL and call db.execute(sql, (customer,)). Note the comma: the parameters are a tuple.", ar: "اكتب WHERE customer = ? في SQL واستدعِ db.execute(sql, (customer,)). لاحظ الفاصلة: المعاملات صفّ (tuple)." },
        { en: "A placeholder cannot stand for a column name. Make a dict such as {\"id\": \"id\", \"item\": \"item\", \"total\": \"total_cents\"} and look the sort option up in it.", ar: "لا يمكن للعنصر النائب أن يمثّل اسم عمود. أنشئ قاموساً مثل {\"id\": \"id\", \"item\": \"item\", \"total\": \"total_cents\"} وابحث فيه عن خيار الترتيب." },
        { en: "If the lookup returns None, raise ValueError(sort). Otherwise append the column you got from YOUR dict to the SQL text: it is one of three strings you wrote.", ar: "إن أعاد البحث None فارفع ValueError(sort). وإلا فألحق بنص SQL العمود الذي حصلت عليه من قاموسك أنت: إنه واحد من ثلاثة نصوص كتبتها بنفسك." },
      ],
      tests: [
        { name: { en: "A normal search sorted by item", ar: "بحث عادي مرتب بالصنف" }, stdin: "amal\nitem\n", expected: "rows: 3\n2 Backpack 30.00\n6 Marker 4.40\n1 Notebook 9.00" },
        { name: { en: "Injection input is treated as a plain name", ar: "إدخال الحقن يُعامل اسماً عادياً" }, stdin: "x' OR '1'='1\nid\n", expected: "rows: 0" },
        { name: { en: "A real name with an apostrophe works", ar: "اسم حقيقي فيه علامة اقتباس يعمل" }, stdin: "d'arcy\nid\n", expected: "rows: 1\n4 Lamp 35.00" },
        { name: { en: "The sort option is mapped through the allow-list", ar: "خيار الترتيب يمر عبر قائمة السماح" }, stdin: "amal\ntotal\n", expected: "rows: 3\n6 Marker 4.40\n1 Notebook 9.00\n2 Backpack 30.00" },
        { name: { en: "A sort option outside the allow-list is refused", ar: "خيار ترتيب خارج قائمة السماح يُرفض" }, stdin: "amal\ntotal_cents; DROP TABLE orders\n", expected: "error: unsupported sort" },
      ],
      sampleInput: "amal\ntotal\n",
    },
    {
      type: "text",
      body: {
        en: `## Least privilege: roles, GRANT and REVOKE

**Least privilege** means every account gets exactly the permissions its job needs, and nothing more. If the application only reads products and writes orders, an attacker who steals its credentials (or finds an injection hole) can only read products and write orders: no \`DROP TABLE\`, no reading the staff table, no creating new users.

In PostgreSQL, users and groups are both **roles**. A common pattern is a **group role** that holds the permissions and a **login role** for the application that joins it:

\`\`\`sql
CREATE ROLE shop_rw NOLOGIN;                         -- the permissions live here
GRANT CONNECT ON DATABASE shop TO shop_rw;
GRANT USAGE ON SCHEMA app TO shop_rw;
GRANT SELECT ON app.products TO shop_rw;
GRANT SELECT, INSERT, UPDATE ON app.orders, app.order_lines TO shop_rw;

CREATE ROLE shop_api LOGIN;                          -- the app logs in as this; password set separately
GRANT shop_rw TO shop_api;                           -- membership: shop_api inherits shop_rw's privileges

REVOKE ALL ON DATABASE shop FROM PUBLIC;             -- PUBLIC means "every role"
\`\`\`

How privileges add up:

- A role has the privileges **granted to it**, plus those of every role it is a **member of** (and their roles in turn), plus those granted to **\`PUBLIC\`**, which every role belongs to.
- Membership flows **one way**: \`shop_api\` gains \`shop_rw\`'s privileges, never the reverse.
- \`REVOKE\` removes only a **direct** grant. If the same privilege still arrives through a group role or \`PUBLIC\`, the role keeps it, a classic surprise when cleaning up access.
- PostgreSQL 15 stopped letting \`PUBLIC\` create objects in the \`public\` schema by default; on older versions, revoke that yourself.

Practical rules:

- **Separate accounts per job:** the application (data changes only), migrations (schema changes, used only by deploys), read-only reporting, and personal accounts for humans. Never run the application as a superuser such as \`postgres\`.
- Expose a subset of columns through a **view**, and in PostgreSQL restrict rows with **row-level security** (\`ALTER TABLE ... ENABLE ROW LEVEL SECURITY\` and \`CREATE POLICY\`).
- Check what a role can really do: PostgreSQL's \`has_table_privilege('shop_api', 'app.orders', 'DELETE')\` answers the same question as the next lab.`,
        ar: `## أقل صلاحية: الأدوار وGRANT وREVOKE

**أقل صلاحية (least privilege)** تعني أن يحصل كل حساب على الأذونات التي يحتاجها عمله بالضبط، ولا شيء أكثر. فإن كان التطبيق يقرأ المنتجات ويكتب الطلبات فقط، فالمهاجم الذي يسرق بيانات اعتماده (أو يجد ثغرة حقن) لا يستطيع إلا قراءة المنتجات وكتابة الطلبات: لا \`DROP TABLE\`، ولا قراءة جدول الموظفين، ولا إنشاء مستخدمين جدد.

في PostgreSQL يكون المستخدمون والمجموعات كلهم **أدواراً (roles)**. والنمط الشائع **دور مجموعة** يحمل الأذونات، و**دور دخول** للتطبيق ينضم إليه:

\`\`\`sql
CREATE ROLE shop_rw NOLOGIN;                         -- the permissions live here
GRANT CONNECT ON DATABASE shop TO shop_rw;
GRANT USAGE ON SCHEMA app TO shop_rw;
GRANT SELECT ON app.products TO shop_rw;
GRANT SELECT, INSERT, UPDATE ON app.orders, app.order_lines TO shop_rw;

CREATE ROLE shop_api LOGIN;                          -- the app logs in as this; password set separately
GRANT shop_rw TO shop_api;                           -- membership: shop_api inherits shop_rw's privileges

REVOKE ALL ON DATABASE shop FROM PUBLIC;             -- PUBLIC means "every role"
\`\`\`

كيف تتجمع الصلاحيات:

- للدور الصلاحيات **الممنوحة له**، إضافة إلى صلاحيات كل دور هو **عضو فيه** (وأدوار تلك الأدوار بدورها)، إضافة إلى ما مُنح لـ **\`PUBLIC\`** الذي ينتمي إليه كل دور.
- العضوية تسري **في اتجاه واحد**: يكتسب \`shop_api\` صلاحيات \`shop_rw\`، ولا يحدث العكس أبداً.
- \`REVOKE\` يزيل المنح **المباشر** فقط. فإن كانت الصلاحية نفسها لا تزال تصل عبر دور مجموعة أو عبر \`PUBLIC\` احتفظ بها الدور، وهذه مفاجأة كلاسيكية عند تنظيف الصلاحيات.
- توقفت PostgreSQL 15 افتراضياً عن السماح لـ \`PUBLIC\` بإنشاء كائنات في المخطط \`public\`؛ وفي الإصدارات الأقدم اسحب هذه الصلاحية بنفسك.

قواعد عملية:

- **حسابات منفصلة لكل مهمة:** التطبيق (تغيير البيانات فقط)، والهجرات (تغيير المخطط، تُستخدم في النشر فقط)، والتقارير للقراءة فقط، وحسابات شخصية للبشر. ولا تشغّل التطبيق أبداً بحساب مستخدم خارق (superuser) مثل \`postgres\`.
- اعرض جزءاً من الأعمدة عبر **عرض (view)**، وقيّد الصفوف في PostgreSQL بـ **أمن مستوى الصف (row-level security)** (\`ALTER TABLE ... ENABLE ROW LEVEL SECURITY\` و\`CREATE POLICY\`).
- تحقّق مما يستطيع الدور فعله حقاً: الدالة \`has_table_privilege('shop_api', 'app.orders', 'DELETE')\` في PostgreSQL تجيب عن السؤال نفسه الذي يجيب عنه المختبر التالي.`,
      },
    },
    {
      type: "lab",
      id: "role-privileges",
      lang: "python",
      prompt: {
        en: `The program models PostgreSQL privileges. It reads \`GRANT ... ON table TO role\`, \`GRANT group TO role\` (membership) and \`REVOKE ... ON table FROM role\` statements in order and keeps two dictionaries: \`grants[role]\` (a set of \`(privilege, table)\` granted **directly**) and \`member_of[role]\` (the roles it joined **directly**). For each \`CHECK role PRIVILEGE table\` line it calls \`has_privilege\`.

Write \`has_privilege(role, privilege, table)\` so it returns \`True\` when the privilege was granted:

- directly to the role, or
- to \`PUBLIC\` (every role is a member of it), or
- to any role the role is a member of, **directly or through other roles** (a chain like \`alice\` → \`staff\` → \`analyst\`)

Membership never flows from a member back to its group. Guard against visiting a role twice.

**Output:** \`role PRIVILEGE table: allowed\` or \`denied\` per check.

Example: after \`GRANT SELECT ON products TO reader\` and \`GRANT reader TO shop_api\`, the check \`CHECK shop_api SELECT products\` prints \`allowed\`.`,
        ar: `يحاكي البرنامج صلاحيات PostgreSQL. يقرأ بالترتيب عبارات \`GRANT ... ON table TO role\` و\`GRANT group TO role\` (عضوية) و\`REVOKE ... ON table FROM role\`، ويحتفظ بقاموسين: \`grants[role]\` (مجموعة أزواج \`(privilege, table)\` ممنوحة **مباشرة**) و\`member_of[role]\` (الأدوار التي انضم إليها **مباشرة**). ولكل سطر \`CHECK role PRIVILEGE table\` يستدعي \`has_privilege\`.

اكتب \`has_privilege(role, privilege, table)\` لتُرجع \`True\` حين تكون الصلاحية ممنوحة:

- للدور مباشرة، أو
- لـ \`PUBLIC\` (كل دور عضو فيه)، أو
- لأي دور يكون الدور عضواً فيه، **مباشرة أو عبر أدوار أخرى** (سلسلة مثل \`alice\` ← \`staff\` ← \`analyst\`)

ولا تسري العضوية أبداً من العضو عائدةً إلى مجموعته. واحمِ الدالة من زيارة الدور نفسه مرتين.

**الخرج:** \`role PRIVILEGE table: allowed\` أو \`denied\` لكل فحص.

مثال: بعد \`GRANT SELECT ON products TO reader\` و\`GRANT reader TO shop_api\` يطبع الفحص \`CHECK shop_api SELECT products\` النتيجة \`allowed\`.`,
      },
      starterCode: `${ROLES_SEED}

def has_privilege(role, privilege, table):
    """Like PostgreSQL's has_table_privilege(role, table, privilege)."""
    # TODO: only privileges granted directly to the role are checked. A role also has:
    #  - every privilege granted to PUBLIC (all roles belong to PUBLIC)
    #  - every privilege of the roles it is a member of, and of THEIR roles, and so on
    #    (member_of[role] lists the roles it joined; remember which ones you visited)
    return (privilege, table) in grants.get(role, set())
${ROLES_TAIL}`,
      solution: `${ROLES_SEED}

def has_privilege(role, privilege, table):
    """Like PostgreSQL's has_table_privilege(role, table, privilege)."""
    wanted = (privilege, table)
    to_visit = [role, "PUBLIC"]          # every role is implicitly a member of PUBLIC
    seen = set()
    while to_visit:
        current = to_visit.pop()
        if current in seen:
            continue
        seen.add(current)
        if wanted in grants.get(current, set()):
            return True
        to_visit.extend(member_of.get(current, ()))   # inherit from the roles it belongs to
    return False
${ROLES_TAIL}`,
      hints: [
        { en: "Keep a list of roles still to look at, starting with [role, \"PUBLIC\"], and a set of roles already seen.", ar: "احتفظ بقائمة الأدوار التي لم تُفحص بعد، تبدأ بـ [role, \"PUBLIC\"]، وبمجموعة للأدوار التي فُحصت." },
        { en: "Pop a role; skip it if seen. If (privilege, table) is in grants.get(current, set()), return True. Otherwise add member_of.get(current, ()) to the list.", ar: "اسحب دوراً؛ وتخطَّه إن كان قد فُحص. وإن كان (privilege, table) ضمن grants.get(current, set()) فأعد True. وإلا فأضف member_of.get(current, ()) إلى القائمة." },
        { en: "When the list is empty and nothing matched, return False. Never look at who is a member OF the role: privileges flow from groups to members only.", ar: "حين تفرغ القائمة دون تطابق أعد False. ولا تنظر أبداً إلى من هم أعضاء في الدور: الصلاحيات تسري من المجموعات إلى الأعضاء فقط." },
      ],
      tests: [
        { name: { en: "Direct grants: allowed only what was granted", ar: "المنح المباشر: يُسمح فقط بما مُنح" }, stdin: "GRANT SELECT, INSERT ON orders TO shop_api\nCHECK shop_api INSERT orders\nCHECK shop_api DELETE orders\nCHECK shop_api SELECT customers\n", expected: "shop_api INSERT orders: allowed\nshop_api DELETE orders: denied\nshop_api SELECT customers: denied" },
        { name: { en: "A privilege inherited from a group role", ar: "صلاحية موروثة من دور مجموعة" }, stdin: "GRANT SELECT ON products TO reader\nGRANT reader TO shop_api\nCHECK shop_api SELECT products\nCHECK reader SELECT products\nCHECK shop_api UPDATE products\n", expected: "shop_api SELECT products: allowed\nreader SELECT products: allowed\nshop_api UPDATE products: denied" },
        { name: { en: "Inheritance through a chain of roles", ar: "الوراثة عبر سلسلة أدوار" }, stdin: "GRANT SELECT ON reports TO analyst\nGRANT analyst TO staff\nGRANT staff TO alice\nCHECK alice SELECT reports\nCHECK bob SELECT reports\n", expected: "alice SELECT reports: allowed\nbob SELECT reports: denied" },
        { name: { en: "REVOKE removes only the direct grant", ar: "REVOKE يزيل المنح المباشر فقط" }, stdin: "GRANT SELECT ON orders TO shop_api\nGRANT SELECT ON orders TO reader\nGRANT reader TO shop_api\nREVOKE SELECT ON orders FROM shop_api\nCHECK shop_api SELECT orders\nREVOKE SELECT ON orders FROM reader\nCHECK shop_api SELECT orders\n", expected: "shop_api SELECT orders: allowed\nshop_api SELECT orders: denied" },
        { name: { en: "Grants to PUBLIC apply to every role", ar: "المنح لـ PUBLIC يسري على كل دور" }, stdin: "GRANT SELECT ON menu TO PUBLIC\nCHECK guest SELECT menu\nCHECK guest INSERT menu\n", expected: "guest SELECT menu: allowed\nguest INSERT menu: denied" },
        { name: { en: "A group never inherits from its members", ar: "المجموعة لا ترث أبداً من أعضائها" }, stdin: "GRANT reader TO shop_api\nGRANT INSERT ON orders TO shop_api\nCHECK reader INSERT orders\nCHECK shop_api INSERT orders\n", expected: "reader INSERT orders: denied\nshop_api INSERT orders: allowed" },
      ],
      sampleInput: "GRANT SELECT ON products TO reader\nGRANT reader TO shop_api\nCHECK shop_api SELECT products\nCHECK shop_api DELETE products\n",
    },
    {
      type: "text",
      body: {
        en: `## Credentials and encryption

**Credentials are the keys to the building.** Keep them out of source code and out of the repository: load them from the environment or, better, from a **secrets manager**, with a different account and password for every environment (development, staging, production). Rotate them when people leave or a leak is suspected, and never print a connection string in logs. Use the strongest authentication the server offers: PostgreSQL uses \`scram-sha-256\` password hashing by default since version 14, and a database should not accept connections from the whole internet at all, only from the application's network.

**Encryption in transit** (TLS) stops anyone on the network path from reading queries, results and passwords. Turning it on is not enough; the client must also **verify** the server, or an attacker in the middle can present their own certificate. PostgreSQL's client library calls this \`sslmode\`: the default \`prefer\` silently falls back to plain text, \`require\` encrypts without checking who answers, and **\`verify-full\`** checks the certificate and the host name. On the server side, \`hostssl\` lines in \`pg_hba.conf\` (PostgreSQL) or \`require_secure_transport\` (MySQL) refuse unencrypted clients.

**Encryption at rest** protects data files, disks and **backups** if they are stolen or mislaid: volume or disk encryption, and features such as Transparent Data Encryption in SQL Server and Oracle, or InnoDB's data-at-rest encryption in MySQL. Know its limit: the running database decrypts data for anyone who can log in, so at-rest encryption does **nothing** against a compromised application account. That is the job of least privilege. For a few especially sensitive fields you can add **application-level encryption**, with keys kept outside the database.

**Passwords of your users are never stored, only hashed**, with a slow, salted password-hashing function (OWASP recommends Argon2id, then scrypt or bcrypt), never a fast hash like plain SHA-256 and never reversible encryption.`,
        ar: `## بيانات الاعتماد والتشفير

**بيانات الاعتماد هي مفاتيح المبنى.** أبقِها خارج الكود المصدري وخارج المستودع: حمّلها من متغيرات البيئة، والأفضل من **مدير أسرار (secrets manager)**، مع حساب وكلمة مرور مختلفين لكل بيئة (التطوير والتجهيز والإنتاج). غيّرها حين يغادر أشخاص أو يُشتبه في تسريب، ولا تطبع سلسلة اتصال في السجلات أبداً. واستخدم أقوى مصادقة يقدّمها الخادم: تستخدم PostgreSQL تجزئة كلمات المرور \`scram-sha-256\` افتراضياً منذ الإصدار 14، وينبغي ألا تقبل قاعدة البيانات اتصالات من الإنترنت كله أصلاً، بل من شبكة التطبيق فقط.

**التشفير أثناء النقل** (TLS) يمنع أي أحد على مسار الشبكة من قراءة الاستعلامات والنتائج وكلمات المرور. وتفعيله لا يكفي؛ يجب أن **يتحقق** العميل من الخادم أيضاً، وإلا استطاع مهاجم في المنتصف تقديم شهادته الخاصة. وتسمي مكتبة عميل PostgreSQL هذا \`sslmode\`: القيمة الافتراضية \`prefer\` تعود بصمت إلى النص الصريح، و\`require\` تشفّر دون التحقق ممن يجيب، و**\`verify-full\`** تتحقق من الشهادة ومن اسم المضيف. وعلى جانب الخادم ترفض أسطر \`hostssl\` في \`pg_hba.conf\` (في PostgreSQL) أو \`require_secure_transport\` (في MySQL) العملاء غير المشفّرين.

**التشفير أثناء التخزين** يحمي ملفات البيانات والأقراص و**النسخ الاحتياطية** إن سُرقت أو ضاعت: تشفير وحدات التخزين أو الأقراص، وميزات مثل Transparent Data Encryption في SQL Server وOracle، أو تشفير البيانات المخزّنة في InnoDB في MySQL. واعرف حدّه: القاعدة العاملة تفك تشفير البيانات لكل من يستطيع تسجيل الدخول، فالتشفير أثناء التخزين **لا يفعل شيئاً** ضد حساب تطبيق مخترَق. تلك مهمة أقل صلاحية. ولحقول قليلة شديدة الحساسية يمكنك إضافة **تشفير على مستوى التطبيق**، مع حفظ المفاتيح خارج قاعدة البيانات.

**كلمات مرور مستخدميك لا تُخزَّن أبداً، بل تُجزَّأ (hashing)** بدالة تجزئة كلمات مرور بطيئة ومملّحة (توصي OWASP بـ Argon2id ثم scrypt أو bcrypt)، لا بتجزئة سريعة مثل SHA-256 المجردة، ولا بتشفير قابل للعكس أبداً.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// Treat a connection string like a password: never log it raw, and check its TLS setting.
const dsn = "postgresql://shop_api:not-a-real-password@db.internal:5432/shop?sslmode=require";

const url = new URL(dsn);
const user = url.username;
if (url.password) url.password = "*****";
console.log("safe to log:", url.toString());

const mode = url.searchParams.get("sslmode") || "prefer"; // libpq's default when absent
const meaning = {
  disable: "no encryption",
  allow: "plain text first, encryption only if the server demands it",
  prefer: "encryption if available, silent fallback to plain text",
  require: "encrypted, but the server's identity is not verified",
  "verify-ca": "encrypted, certificate checked, host name not checked",
  "verify-full": "encrypted, certificate and host name checked",
};
console.log("sslmode=" + mode + ":", meaning[mode]);
if (mode !== "verify-full") console.log("advice: use sslmode=verify-full with the server's CA certificate");
console.log(["postgres", "root", "admin", "sa"].includes(user)
  ? "advice: never let the app log in as a superuser"
  : "user " + user + ": a dedicated application role");`,
      explanation: {
        en: "The password is masked before anything is printed, which is how connection strings should appear in logs and error reports. The sslmode check flags require: the traffic is encrypted, but without verifying the server's certificate an attacker in the middle could still pose as the database. Change the string to verify-full or to the postgres user and run it again.",
        ar: "تُخفى كلمة المرور قبل طباعة أي شيء، وهكذا ينبغي أن تظهر سلاسل الاتصال في السجلات وتقارير الأخطاء. ويُنبّه فحص sslmode إلى require: الحركة مشفّرة، لكن دون التحقق من شهادة الخادم يستطيع مهاجم في المنتصف أن ينتحل صفة القاعدة. غيّر السلسلة إلى verify-full أو إلى المستخدم postgres وشغّلها من جديد.",
      },
    },
    {
      type: "text",
      body: {
        en: `## Audit trails

When something goes wrong, the first questions are *who changed what, and when?* An **audit trail** answers them. Typical sources:

- **Database logs:** connections, failed logins, schema changes. In PostgreSQL, settings such as \`log_connections\` and the **pgAudit** extension record sessions and statements; managed cloud databases offer audit logging as a setting.
- **Change history:** a trigger that copies the old and new values of sensitive rows into an audit table, together with the acting user.
- **Application events:** "user 42 exported the customer list" is meaningful in the app, not in SQL.

\`\`\`text
UPDATE accounts SET balance = 70 WHERE id = 1
        │
        └─ AFTER UPDATE trigger ──▶ audit_log: UPDATE account 1: 100 -> 70 by amal, at 10:42
\`\`\`

An audit trail is only worth something if an attacker cannot quietly edit it. The application account must not be allowed to \`UPDATE\` or \`DELETE\` audit rows (privileges again), the table can reject changes outright, and important logs are copied to a **separate system** the database accounts cannot reach. Remember the limit of triggers: anyone with rights to change the schema can drop them, which is one more reason the application must not hold those rights. Finally, record what you need and no more: an audit log full of passwords or card numbers becomes a target itself.`,
        ar: `## سجلات التدقيق

حين يحدث خطأ ما تكون الأسئلة الأولى: *من غيّر ماذا، ومتى؟* و**سجل التدقيق (audit trail)** يجيب عنها. مصادره المعتادة:

- **سجلات قاعدة البيانات:** الاتصالات، ومحاولات الدخول الفاشلة، وتغييرات المخطط. في PostgreSQL تسجّل إعدادات مثل \`log_connections\` وامتداد **pgAudit** الجلسات والعبارات؛ وتقدّم قواعد البيانات السحابية المُدارة سجل التدقيق إعداداً جاهزاً.
- **تاريخ التغييرات:** مُطلِق (trigger) ينسخ القيم القديمة والجديدة للصفوف الحساسة إلى جدول تدقيق، مع المستخدم الفاعل.
- **أحداث التطبيق:** «صدّر المستخدم 42 قائمة العملاء» حدث له معنى في التطبيق لا في SQL.

\`\`\`text
UPDATE accounts SET balance = 70 WHERE id = 1
        │
        └─ AFTER UPDATE trigger ──▶ audit_log: UPDATE account 1: 100 -> 70 by amal, at 10:42
\`\`\`

لا قيمة لسجل التدقيق إلا إذا عجز المهاجم عن تعديله بهدوء. يجب ألا يُسمح لحساب التطبيق بتنفيذ \`UPDATE\` أو \`DELETE\` على صفوف التدقيق (الصلاحيات مرة أخرى)، ويمكن للجدول أن يرفض التغييرات رفضاً قاطعاً، وتُنسخ السجلات المهمة إلى **نظام منفصل** لا تصل إليه حسابات القاعدة. وتذكّر حد المُطلِقات: كل من يملك حق تغيير المخطط يستطيع حذفها، وهذا سبب إضافي لئلا يملك التطبيق هذا الحق. وأخيراً سجّل ما تحتاجه ولا أكثر: سجل تدقيق مليء بكلمات المرور أو أرقام البطاقات يصير هو نفسه هدفاً.`,
      },
    },
    {
      type: "lab",
      id: "audit-trigger",
      lang: "python",
      prompt: {
        en: `An \`accounts\` table, an \`audit_log\` table and a one-row \`current_actor\` table (who is acting) exist. Your SQL in \`audit_sql\` runs once, then the program replays actions: balance updates, account deletions and a **tamper** attempt (\`DELETE FROM audit_log\`).

The trigger that logs balance **updates** is written for you. Add, in \`audit_sql\`:

1. a trigger \`AFTER DELETE ON accounts\` that inserts \`'DELETE'\`, the account id, the **old** balance, \`NULL\` as new balance and the current actor (in a DELETE trigger only \`OLD\` exists)
2. two triggers, \`BEFORE UPDATE\` and \`BEFORE DELETE ON audit_log\`, that abort the statement with \`SELECT RAISE(ABORT, 'audit_log is append-only');\`

**Input:** lines \`as <user>\`, \`set <id> <balance>\`, \`delete <id>\` or \`tamper\`.

**Output:** \`tamper: blocked\` (or \`erased\`), then every audit entry and \`entries: N\`.

Example: \`as admin\` then \`delete 2\` prints \`#1 DELETE account 2: 50 -> (deleted) by admin\` and \`entries: 1\`.`,
        ar: `توجد الجداول \`accounts\` و\`audit_log\` وجدول \`current_actor\` ذو الصف الواحد (من الفاعل الآن). يُنفَّذ SQL الذي تكتبه في \`audit_sql\` مرة واحدة، ثم يعيد البرنامج تشغيل الإجراءات: تحديثات أرصدة، وحذف حسابات، ومحاولة **عبث** (\`DELETE FROM audit_log\`).

المُطلِق الذي يسجّل **تحديثات** الرصيد مكتوب لك. أضف في \`audit_sql\`:

1. مُطلِقاً \`AFTER DELETE ON accounts\` يُدرج \`'DELETE'\` ومعرّف الحساب والرصيد **القديم** و\`NULL\` رصيداً جديداً والفاعل الحالي (في مُطلِق DELETE لا يوجد إلا \`OLD\`)
2. مُطلِقين، \`BEFORE UPDATE\` و\`BEFORE DELETE ON audit_log\`، يُجهضان العبارة بـ \`SELECT RAISE(ABORT, 'audit_log is append-only');\`

**الدخل:** أسطر \`as <user>\` أو \`set <id> <balance>\` أو \`delete <id>\` أو \`tamper\`.

**الخرج:** \`tamper: blocked\` (أو \`erased\`)، ثم كل مدخلات التدقيق و\`entries: N\`.

مثال: \`as admin\` ثم \`delete 2\` يطبعان \`#1 DELETE account 2: 50 -> (deleted) by admin\` و\`entries: 1\`.`,
      },
      starterCode: `${AUDIT_SEED}
audit_sql = """
    -- Done for you: every balance change is recorded with who made it.
    CREATE TRIGGER audit_balance_update AFTER UPDATE OF balance ON accounts
    BEGIN
        INSERT INTO audit_log (action, account_id, old_balance, new_balance, changed_by)
        VALUES ('UPDATE', OLD.id, OLD.balance, NEW.balance, (SELECT username FROM current_actor));
    END;

    -- TODO 1: a trigger AFTER DELETE ON accounts that logs 'DELETE' with the old
    --         balance and new_balance NULL (inside a DELETE trigger only OLD exists).
    -- TODO 2: two triggers, BEFORE UPDATE and BEFORE DELETE ON audit_log, that stop the
    --         statement with SELECT RAISE(ABORT, 'audit_log is append-only');
"""
${AUDIT_TAIL}`,
      solution: `${AUDIT_SEED}
audit_sql = """
    CREATE TRIGGER audit_balance_update AFTER UPDATE OF balance ON accounts
    BEGIN
        INSERT INTO audit_log (action, account_id, old_balance, new_balance, changed_by)
        VALUES ('UPDATE', OLD.id, OLD.balance, NEW.balance, (SELECT username FROM current_actor));
    END;

    CREATE TRIGGER audit_account_delete AFTER DELETE ON accounts
    BEGIN
        INSERT INTO audit_log (action, account_id, old_balance, new_balance, changed_by)
        VALUES ('DELETE', OLD.id, OLD.balance, NULL, (SELECT username FROM current_actor));
    END;

    -- The log is append-only: nobody may rewrite or erase history through SQL.
    CREATE TRIGGER audit_log_no_update BEFORE UPDATE ON audit_log
    BEGIN
        SELECT RAISE(ABORT, 'audit_log is append-only');
    END;

    CREATE TRIGGER audit_log_no_delete BEFORE DELETE ON audit_log
    BEGIN
        SELECT RAISE(ABORT, 'audit_log is append-only');
    END;
"""
${AUDIT_TAIL}`,
      hints: [
        { en: "Copy the UPDATE trigger, change it to AFTER DELETE ON accounts, insert 'DELETE' as the action and use NULL instead of NEW.balance: a deleted row has no NEW.", ar: "انسخ مُطلِق UPDATE وغيّره إلى AFTER DELETE ON accounts، وأدرج 'DELETE' إجراءً واستخدم NULL بدل NEW.balance: الصف المحذوف ليس له NEW." },
        { en: "A trigger body can stop the statement: CREATE TRIGGER audit_log_no_delete BEFORE DELETE ON audit_log BEGIN SELECT RAISE(ABORT, 'audit_log is append-only'); END;", ar: "يستطيع جسم المُطلِق إيقاف العبارة: CREATE TRIGGER audit_log_no_delete BEFORE DELETE ON audit_log BEGIN SELECT RAISE(ABORT, 'audit_log is append-only'); END;" },
        { en: "Write the same kind of trigger once more for BEFORE UPDATE ON audit_log, with a different trigger name. Every statement inside BEGIN ... END ends with a semicolon.", ar: "اكتب المُطلِق نفسه مرة أخرى لـ BEFORE UPDATE ON audit_log باسم مُطلِق مختلف. وكل عبارة داخل BEGIN ... END تنتهي بفاصلة منقوطة." },
      ],
      tests: [
        { name: { en: "A balance update is logged with its author", ar: "تحديث الرصيد يُسجَّل مع صاحبه" }, stdin: "as amal\nset 1 70\n", expected: "#1 UPDATE account 1: 100 -> 70 by amal\nentries: 1" },
        { name: { en: "A deleted account is logged with its old balance", ar: "الحساب المحذوف يُسجَّل برصيده القديم" }, stdin: "as admin\ndelete 2\n", expected: "#1 DELETE account 2: 50 -> (deleted) by admin\nentries: 1" },
        { name: { en: "Erasing the audit log is blocked", ar: "محو سجل التدقيق محجوب" }, stdin: "as amal\nset 1 70\nas bilal\nset 2 80\ntamper\n", expected: "tamper: blocked\n#1 UPDATE account 1: 100 -> 70 by amal\n#2 UPDATE account 2: 50 -> 80 by bilal\nentries: 2" },
        { name: { en: "Covering tracks fails: the whole story stays", ar: "إخفاء الآثار يفشل: تبقى القصة كاملة" }, stdin: "as mallory\nset 3 500\ndelete 3\ntamper\n", expected: "tamper: blocked\n#1 UPDATE account 3: 0 -> 500 by mallory\n#2 DELETE account 3: 500 -> (deleted) by mallory\nentries: 2" },
        { name: { en: "Deleting a missing account logs nothing", ar: "حذف حساب غير موجود لا يسجّل شيئاً" }, stdin: "as admin\ndelete 9\n", expected: "entries: 0" },
      ],
      sampleInput: "as amal\nset 1 70\nas mallory\ndelete 1\ntamper\n",
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Why does a parameterized query stop SQL injection?", ar: "لماذا يوقف الاستعلام المُعامَل حقن SQL؟" },
          choices: [
            { en: "It removes every quote character from the input", ar: "يزيل كل علامات الاقتباس من الإدخال" },
            { en: "It encrypts the input before sending it", ar: "يشفّر الإدخال قبل إرساله" },
            { en: "The SQL text is fixed and the value is sent separately, so the value is never parsed as SQL", ar: "نص SQL ثابت والقيمة تُرسل منفصلة، فلا تُحلَّل القيمة على أنها SQL أبداً" },
            { en: "It only allows letters and digits in the input", ar: "لا يسمح إلا بالحروف والأرقام في الإدخال" },
          ],
          answer: 2,
          explain: {
            en: "Injection happens when input is mixed into the code. With a placeholder the database parses the statement first and receives the value as data, so x' OR '1'='1 is just an odd name. The input is not altered, which is also why names like D'Arcy keep working.",
            ar: "يحدث الحقن حين يُخلط الإدخال بالكود. ومع العنصر النائب تحلّل القاعدة العبارة أولاً وتتلقى القيمة بيانات، فيصير x' OR '1'='1 مجرد اسم غريب. ولا يُعدَّل الإدخال، ولهذا تظل أسماء مثل D'Arcy تعمل.",
          },
        },
        {
          q: { en: "A page lets users choose the column to sort by. How do you put it into the query safely?", ar: "تسمح صفحة للمستخدمين باختيار عمود الترتيب. كيف تضعه في الاستعلام بأمان؟" },
          choices: [
            { en: "Map the choice through a fixed allow-list to a column name you wrote, and reject anything else", ar: "حوّل الاختيار عبر قائمة سماح ثابتة إلى اسم عمود كتبته بنفسك، وارفض كل ما عداه" },
            { en: "Bind it as a ? parameter like any other value", ar: "اربطه معاملاً ? مثل أي قيمة أخرى" },
            { en: "Paste it in after removing semicolons", ar: "الصقه بعد إزالة الفواصل المنقوطة" },
          ],
          answer: 0,
          explain: {
            en: "Placeholders stand for values, not identifiers: ORDER BY ? would sort by a constant, not by a column. Filtering characters such as semicolons misses other tricks. An allow-list means the only text that can reach the query is text you wrote.",
            ar: "العناصر النائبة تمثّل قيماً لا معرّفات: فـ ORDER BY ? يرتّب بقيمة ثابتة لا بعمود. وتصفية محارف مثل الفاصلة المنقوطة تفوّت حيلاً أخرى. أما قائمة السماح فتعني أن النص الوحيد الذي يصل إلى الاستعلام نص كتبته أنت.",
          },
        },
        {
          q: { en: "shop_api is a member of reader, which has SELECT on orders. You run REVOKE SELECT ON orders FROM shop_api. Can shop_api still read orders?", ar: "الدور shop_api عضو في reader الذي يملك SELECT على orders. نفّذت REVOKE SELECT ON orders FROM shop_api. هل يستطيع shop_api قراءة orders بعد ذلك؟" },
          choices: [
            { en: "No: REVOKE removes the privilege from every path", ar: "لا: REVOKE يزيل الصلاحية من كل المسارات" },
            { en: "No: REVOKE also removes the role from reader", ar: "لا: REVOKE يزيل الدور من reader أيضاً" },
            { en: "Only after the next restart", ar: "فقط بعد إعادة التشغيل التالية" },
            { en: "Yes: REVOKE removed only the direct grant, and SELECT still arrives through membership in reader", ar: "نعم: أزال REVOKE المنح المباشر فقط، ولا تزال SELECT تصل عبر العضوية في reader" },
          ],
          answer: 3,
          explain: {
            en: "A role's privileges are its direct grants plus those of every role it belongs to, plus PUBLIC's. REVOKE touches only the direct grant, so to really remove access you must also revoke it from reader or remove shop_api from reader. Check the result with has_table_privilege.",
            ar: "صلاحيات الدور هي منحه المباشر إضافة إلى صلاحيات كل دور ينتمي إليه، إضافة إلى صلاحيات PUBLIC. وREVOKE لا يمس إلا المنح المباشر، فلإزالة الوصول حقاً يجب أيضاً سحبه من reader أو إخراج shop_api من reader. وتحقّق من النتيجة بـ has_table_privilege.",
          },
        },
        {
          q: { en: "An attacker steals the application's database credentials. Which measure limits the damage most?", ar: "يسرق مهاجم بيانات اعتماد قاعدة البيانات الخاصة بالتطبيق. أي إجراء يحدّ من الضرر أكثر؟" },
          choices: [
            { en: "Encryption at rest on the database disks", ar: "التشفير أثناء التخزين على أقراص القاعدة" },
            { en: "A least-privilege application role that can only touch the tables and operations the app needs", ar: "دور تطبيق بأقل صلاحية لا يستطيع إلا لمس الجداول والعمليات التي يحتاجها التطبيق" },
            { en: "A longer password for the superuser", ar: "كلمة مرور أطول للمستخدم الخارق" },
            { en: "Turning off the slow query log", ar: "إيقاف سجل الاستعلامات البطيئة" },
          ],
          answer: 1,
          explain: {
            en: "With valid credentials the attacker logs in normally and the database decrypts data for them, so at-rest encryption does not help here. What limits the damage is what that account may do: least privilege keeps a stolen app key from opening every door.",
            ar: "ببيانات اعتماد صحيحة يدخل المهاجم دخولاً عادياً وتفك القاعدة تشفير البيانات له، فلا يفيد التشفير أثناء التخزين هنا. ما يحدّ من الضرر هو ما يُسمح لذلك الحساب بفعله: أقل صلاحية تمنع مفتاح التطبيق المسروق من فتح كل الأبواب.",
          },
        },
        {
          q: { en: "Your application connects to PostgreSQL with sslmode=require. What is still missing?", ar: "يتصل تطبيقك بـ PostgreSQL مع sslmode=require. ما الذي لا يزال ناقصاً؟" },
          choices: [
            { en: "Nothing: the traffic is encrypted, so it is fully protected", ar: "لا شيء: الحركة مشفّرة فهي محمية تماماً" },
            { en: "Compression of the traffic", ar: "ضغط الحركة" },
            { en: "Verification of the server's certificate and host name (verify-full), so an attacker in the middle cannot pose as the database", ar: "التحقق من شهادة الخادم واسم المضيف (verify-full)، كي لا يستطيع مهاجم في المنتصف انتحال صفة القاعدة" },
          ],
          answer: 2,
          explain: {
            en: "require encrypts the connection but does not check who is answering, so a man-in-the-middle with their own certificate would be accepted. verify-full checks that the certificate is signed by a trusted CA and matches the host name. Compression is unrelated to security.",
            ar: "require يشفّر الاتصال لكنه لا يتحقق ممن يجيب، فيُقبل مهاجم في المنتصف يحمل شهادته الخاصة. أما verify-full فيتحقق من أن الشهادة موقّعة من جهة إصدار موثوقة وأنها تطابق اسم المضيف. والضغط لا علاقة له بالأمان.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap and what to practice next

- Attackers usually reach the database **through the application**, so the goals are: no attacker-controlled SQL, and an application account that can do as little as possible.
- **Parameterized queries** keep data out of the SQL code; **allow-lists** handle identifiers such as sort columns. Never build SQL by pasting input, not even in an ORM's raw queries.
- **Least privilege:** separate roles per job, privileges granted to group roles, no superuser for the app. A role inherits from the roles it belongs to and from \`PUBLIC\`, and \`REVOKE\` removes only the direct grant.
- Keep **credentials** in a secrets manager, encrypt **in transit** with server verification (\`verify-full\`) and **at rest** (including backups), and hash users' passwords with a slow, salted function.
- **Audit trails** record who changed what; protect them with privileges, append-only rules and a copy outside the database.

**Practice next:** in the first lab, add a \`direction\` option (\`asc\` or \`desc\`) through the same allow-list idea. In the privilege lab, add support for \`REVOKE group FROM role\`. Finally, revisit your backup plan with these eyes: every backup and replica holds the same data as the database, so it needs the same protection: encrypted, reachable only by the accounts that need it, and kept where a compromised application account cannot delete it.`,
        ar: `## الخلاصة وما تتدرب عليه بعد ذلك

- يصل المهاجمون عادةً إلى قاعدة البيانات **عبر التطبيق**، فالأهداف: لا SQL يتحكم فيه المهاجم، وحساب تطبيق يستطيع أقل ما يمكن.
- **الاستعلامات المُعامَلة** تُبقي البيانات خارج كود SQL؛ و**قوائم السماح** تعالج المعرّفات مثل أعمدة الترتيب. ولا تبنِ SQL بلصق الإدخال أبداً، ولا حتى في استعلامات ORM الخام.
- **أقل صلاحية:** أدوار منفصلة لكل مهمة، وصلاحيات تُمنح لأدوار المجموعات، ولا مستخدم خارق للتطبيق. ويرث الدور من الأدوار التي ينتمي إليها ومن \`PUBLIC\`، و\`REVOKE\` يزيل المنح المباشر فقط.
- احفظ **بيانات الاعتماد** في مدير أسرار، وشفّر **أثناء النقل** مع التحقق من الخادم (\`verify-full\`) و**أثناء التخزين** (بما في ذلك النسخ الاحتياطية)، وجزّئ كلمات مرور المستخدمين بدالة بطيئة ومملّحة.
- **سجلات التدقيق** تسجّل من غيّر ماذا؛ احمِها بالصلاحيات وقواعد الإلحاق فقط ونسخة خارج القاعدة.

**تدرّب بعد ذلك:** في المختبر الأول أضف خيار \`direction\` (\`asc\` أو \`desc\`) بفكرة قائمة السماح نفسها. وفي مختبر الصلاحيات أضف دعماً لـ \`REVOKE group FROM role\`. وأخيراً راجع خطة نسخك الاحتياطي بهذه العين: كل نسخة احتياطية ونسخة متماثلة تحمل البيانات نفسها التي في القاعدة، فتحتاج الحماية نفسها: أن تكون مشفّرة، ولا تصل إليها إلا الحسابات التي تحتاجها، ومحفوظة حيث لا يستطيع حساب تطبيق مخترَق حذفها.`,
      },
    },
  ],
};
