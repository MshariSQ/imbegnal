import type { Lesson } from "../types";

// Three accounts with a CHECK constraint (no overdrafts). isolation_level=None turns off
// the sqlite3 module's implicit transactions, so BEGIN / COMMIT / ROLLBACK are explicit.
const TRANSFER_SEED = `import sqlite3
import sys

# isolation_level=None: Python's sqlite3 never opens a transaction behind your back.
# Every statement commits on its own unless YOU run BEGIN ... COMMIT.
db = sqlite3.connect(":memory:", isolation_level=None)
db.executescript("""
    CREATE TABLE accounts (
        id      TEXT PRIMARY KEY,
        balance INTEGER NOT NULL CHECK (balance >= 0)   -- no overdrafts
    );
    INSERT INTO accounts (id, balance) VALUES ('amal', 100), ('bilal', 50), ('carla', 0);
""")
`;

const TRANSFER_TAIL = `

# stdin: one transfer per line: "<from> <to> <amount>"
for line in sys.stdin.read().splitlines():
    if not line.strip():
        continue
    src, dst, amount = line.split()
    print(f"{src} -> {dst} {amount}: {transfer(src, dst, int(amount))}")

rows = db.execute("SELECT id, balance FROM accounts ORDER BY id").fetchall()
print(" ".join(f"{name}={balance}" for name, balance in rows))
print("total:", sum(balance for _, balance in rows))
`;

const STOCK_SEED = `import sqlite3
import sys

db = sqlite3.connect(":memory:", isolation_level=None)
db.executescript("""
    CREATE TABLE products (
        id      INTEGER PRIMARY KEY,
        name    TEXT NOT NULL,
        stock   INTEGER NOT NULL,
        version INTEGER NOT NULL DEFAULT 0     -- bumped by every successful write
    );
    INSERT INTO products (id, name, stock) VALUES (1, 'Notebook', 10);
""")
`;

const STOCK_TAIL = `

# stdin: a schedule of steps from several clients sharing product 1.
#   read <client>         the client loads the row (stock and version)
#   sell <client> <qty>   the client saves stock - qty, based on what IT read
remembered = {}
for line in sys.stdin.read().splitlines():
    step = line.split()
    if not step:
        continue
    if step[0] == "read":
        client = step[1]
        stock, version = db.execute("SELECT stock, version FROM products WHERE id = 1").fetchone()
        remembered[client] = (stock, version)
        print(f"{client} reads stock={stock} version={version}")
    elif step[0] == "sell":
        client, qty = step[1], int(step[2])
        stock, version = remembered.pop(client)
        if save(1, stock - qty, version):
            print(f"{client} sells {qty}: saved")
        else:
            print(f"{client} sells {qty}: conflict, read again")

stock, version = db.execute("SELECT stock, version FROM products WHERE id = 1").fetchone()
print(f"final stock={stock} version={version}")
`;

const WAITS_HEAD = `import sys

# stdin: one line per blocked transaction: "T<a> waits T<b>"
# meaning T<a> asked for a lock that T<b> holds. In this model a blocked
# transaction waits for exactly one other transaction.
waits_for = {}
for line in sys.stdin.read().splitlines():
    if line.strip():
        waiter, _, holder = line.split()
        waits_for[int(waiter[1:])] = int(holder[1:])
`;

const WAITS_TAIL = `

cycles = find_cycles(waits_for)
if not cycles:
    print("no deadlock")
for cycle in cycles:
    print("deadlock: " + " -> ".join(f"T{t}" for t in cycle + cycle[:1]))
    print(f"abort T{max(cycle)}")      # our policy: the youngest (highest number) is the victim
`;

export const lesson: Lesson = {
  nodeId: "transactions-acid",
  title: { en: "Transactions, ACID & Concurrency", ar: "المعاملات وACID والتزامن" },
  estMinutes: 45,
  sections: [
    {
      type: "text",
      body: {
        en: `## The bank transfer that stopped halfway 🏦

Amal sends 30 to Bilal. The bank's program runs two statements: *take 30 from Amal*, then *add 30 to Bilal*. The server loses power right between them. Amal is 30 poorer, Bilal is not richer, and the money has simply vanished.

The cure is a **transaction**: a group of statements the database treats as **one unit**. Either every statement takes effect, or none of them does. There is no "halfway".

## What you'll learn

- \`BEGIN\`, \`COMMIT\` and \`ROLLBACK\`, and what autocommit does when you write none of them
- The four **ACID** guarantees: atomicity, consistency, isolation, durability
- **Isolation levels** and the anomalies they prevent: dirty reads, non-repeatable reads, phantoms and lost updates
- **Locking**, **deadlocks**, and **optimistic concurrency control** with a version column

In the labs you control real SQLite transactions from Python, prevent a lost update and detect a deadlock.

## One unit of work

\`\`\`sql
BEGIN;                                                         -- start the unit of work
UPDATE accounts SET balance = balance - 30 WHERE id = 'amal';
UPDATE accounts SET balance = balance + 30 WHERE id = 'bilal';
COMMIT;                                                        -- make both changes permanent

-- if anything went wrong before COMMIT:
ROLLBACK;                                                      -- undo everything since BEGIN
\`\`\`

\`BEGIN TRANSACTION\` and \`START TRANSACTION\` are common spellings of the same idea. Until \`COMMIT\`, other connections do not see the changes (except at the READ UNCOMMITTED level described below), and \`ROLLBACK\` erases them as if they never happened.

**Autocommit:** when you do not write \`BEGIN\`, PostgreSQL, MySQL and SQLite run each statement as its own tiny transaction and commit it immediately. That is fine for one statement, and exactly the bug in the story for two. One trap in Python: by default the \`sqlite3\` module opens a transaction for you before \`INSERT\`, \`UPDATE\` and \`DELETE\`, and waits for \`commit()\`. The labs pass \`isolation_level=None\` so that nothing happens implicitly and you write \`BEGIN\` yourself.

Inside a transaction, a **savepoint** lets you undo only part of the work: \`SAVEPOINT item;\` ... \`ROLLBACK TO item;\` keeps everything before the savepoint and still lets you \`COMMIT\` the rest.`,
        ar: `## التحويل البنكي الذي توقف في منتصفه 🏦

ترسل أمل 30 إلى بلال. ينفّذ برنامج البنك عبارتين: *اخصم 30 من أمل*، ثم *أضف 30 إلى بلال*. وينقطع التيار عن الخادم بينهما تماماً. صارت أمل أفقر بـ 30، ولم يصر بلال أغنى، واختفى المال ببساطة.

العلاج هو **المعاملة (transaction)**: مجموعة عبارات تعاملها قاعدة البيانات **وحدةً واحدة**. فإما أن تنفذ كل العبارات، وإما ألا تنفذ أيٌّ منها. لا يوجد «منتصف الطريق».

## ماذا ستتعلم

- \`BEGIN\` و\`COMMIT\` و\`ROLLBACK\`، وما يفعله الالتزام التلقائي (autocommit) حين لا تكتب أياً منها
- ضمانات **ACID** الأربعة: الذرّية والاتساق والعزل والديمومة
- **مستويات العزل** والشذوذات التي تمنعها: القراءات القذرة، والقراءات غير القابلة للتكرار، والصفوف الشبحية، والتحديثات الضائعة
- **الأقفال (locks)** و**الجمود (deadlock)** و**التحكم المتفائل في التزامن (optimistic concurrency control)** بعمود إصدار

في المختبرات تتحكم في معاملات SQLite حقيقية من بايثون، وتمنع تحديثاً ضائعاً، وتكتشف حالة جمود.

## وحدة عمل واحدة

\`\`\`sql
BEGIN;                                                         -- start the unit of work
UPDATE accounts SET balance = balance - 30 WHERE id = 'amal';
UPDATE accounts SET balance = balance + 30 WHERE id = 'bilal';
COMMIT;                                                        -- make both changes permanent

-- if anything went wrong before COMMIT:
ROLLBACK;                                                      -- undo everything since BEGIN
\`\`\`

\`BEGIN TRANSACTION\` و\`START TRANSACTION\` صيغتان شائعتان للفكرة نفسها. وحتى \`COMMIT\` لا ترى الاتصالات الأخرى التغييرات (إلا في مستوى العزل READ UNCOMMITTED الموصوف أدناه)، و\`ROLLBACK\` يمحوها كأنها لم تحدث.

**الالتزام التلقائي (autocommit):** حين لا تكتب \`BEGIN\` تنفّذ PostgreSQL وMySQL وSQLite كل عبارة معاملةً صغيرة مستقلة وتلتزم بها فوراً. هذا مناسب لعبارة واحدة، وهو بالضبط الخلل الذي في القصة حين تكون عبارتين. وفي بايثون فخ: وحدة \`sqlite3\` تفتح افتراضياً معاملة بالنيابة عنك قبل \`INSERT\` و\`UPDATE\` و\`DELETE\` وتنتظر \`commit()\`. لذلك تمرّر المختبرات \`isolation_level=None\` كي لا يحدث شيء ضمنياً وتكتب \`BEGIN\` بنفسك.

وداخل المعاملة تتيح لك **نقطة الحفظ (savepoint)** التراجع عن جزء من العمل فقط: \`SAVEPOINT item;\` ثم \`ROLLBACK TO item;\` يُبقي كل ما قبل نقطة الحفظ ويسمح لك بعدها بتنفيذ \`COMMIT\` لبقية العمل.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## ACID: four promises

**Atomicity: all or nothing.** If a transaction fails or the server crashes before \`COMMIT\`, none of its changes remain. Databases make this possible by writing changes to a **log** first: SQLite uses a rollback journal or a write-ahead log (WAL), PostgreSQL uses its WAL. After a crash, recovery reads the log and discards whatever was not committed.

**Consistency: from one valid state to another.** Every constraint you declared (\`PRIMARY KEY\`, \`FOREIGN KEY\`, \`UNIQUE\`, \`CHECK\`) holds after the transaction, otherwise the offending statement fails and you roll back. Note the limit: the database only enforces the rules it knows. "The total amount of money never changes" is a rule your code keeps by putting both updates in one transaction.

**Isolation: concurrent transactions do not trip over each other.** Ideally the result is the same as if the transactions had run one after another (**serializable**). Because that can cost speed, databases offer weaker **isolation levels**, covered next.

**Durability: committed means saved.** Once \`COMMIT\` returns, the change survives a crash or power cut, because the log was flushed to disk *before* the database reported success. Some settings trade this safety for speed (PostgreSQL's \`synchronous_commit = off\`, SQLite's \`PRAGMA synchronous\`), and no setting protects you from losing the disk itself: that is the job of backups and replicas.

\`\`\`text
BEGIN ──▶ change 1 ──▶ change 2 ──▶ COMMIT ──▶ durable, visible to everyone
              │             │
              └─ error or crash before COMMIT ──▶ ROLLBACK: as if nothing happened
\`\`\``,
        ar: `## ACID: أربعة وعود

**الذرّية (atomicity): الكل أو لا شيء.** إذا فشلت المعاملة أو تعطل الخادم قبل \`COMMIT\` فلا يبقى شيء من تغييراتها. وتجعل القواعد ذلك ممكناً بكتابة التغييرات أولاً في **سجل (log)**: تستخدم SQLite سجل تراجع (rollback journal) أو سجل كتابة مسبقة (WAL)، وتستخدم PostgreSQL سجل WAL الخاص بها. وبعد التعطل يقرأ الاسترداد (recovery) السجل ويتجاهل كل ما لم يُلتزَم به.

**الاتساق (consistency): من حالة صحيحة إلى أخرى.** كل قيد أعلنته (\`PRIMARY KEY\` و\`FOREIGN KEY\` و\`UNIQUE\` و\`CHECK\`) يبقى متحققاً بعد المعاملة، وإلا فشلت العبارة المخالفة وتراجعت أنت. ولاحظ الحد هنا: القاعدة لا تفرض إلا القواعد التي تعرفها. أما «مجموع المال لا يتغير أبداً» فقاعدة يحفظها كودك بوضع التحديثين في معاملة واحدة.

**العزل (isolation): المعاملات المتزامنة لا يعرقل بعضها بعضاً.** المثالي أن تكون النتيجة كما لو نُفّذت المعاملات واحدة بعد الأخرى (**قابلة للتسلسل serializable**). ولأن ذلك قد يكلّف سرعة، تقدّم القواعد **مستويات عزل** أضعف نشرحها بعد قليل.

**الديمومة (durability): ما التُزم به محفوظ.** بمجرد أن يعود \`COMMIT\` يبقى التغيير بعد التعطل أو انقطاع التيار، لأن السجل كُتب إلى القرص *قبل* أن تعلن القاعدة النجاح. وبعض الإعدادات تقايض هذا الأمان بالسرعة (\`synchronous_commit = off\` في PostgreSQL و\`PRAGMA synchronous\` في SQLite)، ولا يحميك أي إعداد من فقدان القرص نفسه: تلك مهمة النسخ الاحتياطية والنسخ المتماثلة.

\`\`\`text
BEGIN ──▶ change 1 ──▶ change 2 ──▶ COMMIT ──▶ durable, visible to everyone
              │             │
              └─ error or crash before COMMIT ──▶ ROLLBACK: as if nothing happened
\`\`\``,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `# A tiny "database" with an undo log: the idea behind ROLLBACK.
balances = {"amal": 100, "bilal": 50}


class Crash(Exception):
    pass


def transfer(src, dst, amount, crash_after_debit=False):
    undo = []                                   # old values, recorded BEFORE each change
    try:
        undo.append((src, balances[src]))
        balances[src] -= amount
        if crash_after_debit:
            raise Crash("power cut")
        undo.append((dst, balances[dst]))
        balances[dst] += amount
        print("commit:  ", balances)
    except Crash as err:
        for key, old in reversed(undo):         # roll back: restore old values, newest first
            balances[key] = old
        print("rollback:", balances, "after a", err)


transfer("amal", "bilal", 30)
transfer("amal", "bilal", 30, crash_after_debit=True)
print("total is still", sum(balances.values()))`,
      explanation: {
        en: "The first transfer commits. The second one crashes after the debit, and the undo log puts Amal's old balance back, so the total stays 150. A real database keeps such a log on disk, which is how it can still roll back unfinished work after the machine restarts.",
        ar: "يلتزم التحويل الأول. أما الثاني فيتعطل بعد الخصم، فيعيد سجل التراجع رصيد أمل القديم، ويبقى المجموع 150. وقاعدة البيانات الحقيقية تحفظ سجلاً كهذا على القرص، وبه تستطيع التراجع عن العمل غير المكتمل حتى بعد إعادة تشغيل الجهاز.",
      },
    },
    {
      type: "lab",
      id: "atomic-transfer",
      lang: "python",
      prompt: {
        en: `The table \`accounts\` holds \`amal\` (100), \`bilal\` (50) and \`carla\` (0), with \`CHECK (balance >= 0)\`. The function \`transfer(src, dst, amount)\` runs two separate statements, so a failure in the middle leaves money missing or created from nothing.

Make \`transfer\` **all or nothing**: run \`BEGIN\` before the first \`UPDATE\` and \`COMMIT\` after the second. If the sender or recipient does not exist (an \`UPDATE\` changes \`rowcount != 1\` rows) or the \`CHECK\` fails (\`sqlite3.IntegrityError\`), run \`ROLLBACK\` and return \`"rejected"\`. Otherwise return \`"ok"\`.

**Input:** one transfer per line: \`<from> <to> <amount>\`.

**Output:** one result line per transfer, then the balances and \`total: N\`. Whatever happens, the total must stay 150.

Example: \`amal zed 40\` prints \`amal -> zed 40: rejected\` and Amal keeps her 100.`,
        ar: `يضم الجدول \`accounts\` الحسابات \`amal\` (100) و\`bilal\` (50) و\`carla\` (0)، مع القيد \`CHECK (balance >= 0)\`. تنفّذ الدالة \`transfer(src, dst, amount)\` عبارتين منفصلتين، فالفشل في المنتصف يترك مالاً مفقوداً أو مالاً نشأ من لا شيء.

اجعل \`transfer\` **كلاً أو لا شيء**: نفّذ \`BEGIN\` قبل أول \`UPDATE\` و\`COMMIT\` بعد الثاني. وإذا لم يكن المرسل أو المستلم موجوداً (أي غيّر \`UPDATE\` عدداً من الصفوف \`rowcount != 1\`) أو فشل الـ \`CHECK\` (\`sqlite3.IntegrityError\`) فنفّذ \`ROLLBACK\` وأعد \`"rejected"\`. وإلا فأعد \`"ok"\`.

**الدخل:** تحويل واحد في كل سطر: \`<from> <to> <amount>\`.

**الخرج:** سطر نتيجة لكل تحويل، ثم الأرصدة و\`total: N\`. ومهما حدث يجب أن يبقى المجموع 150.

مثال: \`amal zed 40\` يطبع \`amal -> zed 40: rejected\` وتحتفظ أمل بـ 100.`,
      },
      starterCode: `${TRANSFER_SEED}

def transfer(src, dst, amount):
    """Move amount from src to dst: both updates happen, or neither does."""
    # TODO: make this all-or-nothing.
    #  1. BEGIN before the first UPDATE and COMMIT after the second one.
    #  2. An UPDATE that matches no row (rowcount != 1) means an unknown account.
    #  3. A failed CHECK raises sqlite3.IntegrityError.
    #  In both cases ROLLBACK and return "rejected".
    db.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, src))
    db.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, dst))
    return "ok"
${TRANSFER_TAIL}`,
      solution: `${TRANSFER_SEED}

def transfer(src, dst, amount):
    """Move amount from src to dst: both updates happen, or neither does."""
    db.execute("BEGIN")
    try:
        debit = db.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, src))
        if debit.rowcount != 1:
            raise LookupError(src)                      # unknown sender
        credit = db.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, dst))
        if credit.rowcount != 1:
            raise LookupError(dst)                      # unknown recipient
        db.execute("COMMIT")
        return "ok"
    except (sqlite3.IntegrityError, LookupError):     # CHECK failed, or a missing account
        db.execute("ROLLBACK")                         # the debit is undone as well
        return "rejected"
${TRANSFER_TAIL}`,
      hints: [
        { en: "Call db.execute(\"BEGIN\") first, put both UPDATEs inside a try block and call db.execute(\"COMMIT\") at the end of it.", ar: "استدعِ db.execute(\"BEGIN\") أولاً، وضع عبارتَي UPDATE داخل كتلة try، واستدعِ db.execute(\"COMMIT\") في نهايتها." },
        { en: "db.execute returns a cursor: cursor.rowcount is the number of rows the UPDATE changed. Raise an exception yourself when it is not 1.", ar: "تُرجع db.execute مؤشراً (cursor): و cursor.rowcount هو عدد الصفوف التي غيّرها UPDATE. ارفع استثناءً بنفسك حين لا يساوي 1." },
        { en: "Catch sqlite3.IntegrityError together with your own exception (for example LookupError), call db.execute(\"ROLLBACK\") and return \"rejected\".", ar: "التقط sqlite3.IntegrityError مع استثنائك الخاص (مثل LookupError)، واستدعِ db.execute(\"ROLLBACK\") وأعد \"rejected\"." },
      ],
      tests: [
        { name: { en: "A valid transfer commits both updates", ar: "تحويل صحيح يلتزم بالتحديثين" }, stdin: "amal bilal 30\n", expected: "amal -> bilal 30: ok\namal=70 bilal=80 carla=0\ntotal: 150" },
        { name: { en: "An overdraft is rejected by the CHECK and rolled back", ar: "السحب على المكشوف يرفضه الـ CHECK ويُتراجع عنه" }, stdin: "bilal carla 80\n", expected: "bilal -> carla 80: rejected\namal=100 bilal=50 carla=0\ntotal: 150" },
        { name: { en: "Unknown recipient: the debit is undone", ar: "مستلم غير موجود: يُلغى الخصم" }, stdin: "amal zed 40\n", expected: "amal -> zed 40: rejected\namal=100 bilal=50 carla=0\ntotal: 150" },
        { name: { en: "Unknown sender: no money from nowhere", ar: "مرسل غير موجود: لا مال من العدم" }, stdin: "zed amal 10\n", expected: "zed -> amal 10: rejected\namal=100 bilal=50 carla=0\ntotal: 150" },
        { name: { en: "A sequence: exact balance allowed, later overdrafts rejected", ar: "سلسلة: الرصيد المساوي مسموح والسحب الزائد بعده مرفوض" }, stdin: "amal carla 100\ncarla bilal 60\nbilal amal 200\namal bilal 1\n", expected: "amal -> carla 100: ok\ncarla -> bilal 60: ok\nbilal -> amal 200: rejected\namal -> bilal 1: rejected\namal=0 bilal=110 carla=40\ntotal: 150" },
      ],
      sampleInput: "amal bilal 30\namal zed 40\n",
    },
    {
      type: "text",
      body: {
        en: `## Isolation levels and the anomalies they prevent

When transactions run at the same time, these are the classic things that can go wrong:

- **Dirty read:** you read a change another transaction has **not committed** yet. If it rolls back, you acted on data that never existed.
- **Non-repeatable read:** you read the same row twice in one transaction and get **different values**, because another transaction committed a change in between.
- **Phantom read:** you run the same \`WHERE\` query twice and get a **different set of rows**, because another transaction inserted or deleted matching rows.
- **Lost update:** two transactions read a value, both compute a new one from it, and the second write **silently overwrites** the first.

\`\`\`text
time  T1 (Amal's phone)               T2 (Bilal's laptop)
 1    SELECT stock -> 10
 2                                    SELECT stock -> 10
 3    UPDATE stock = 10 - 3  (7)
 4    COMMIT
 5                                    UPDATE stock = 10 - 2  (8)
 6                                    COMMIT        -- Amal's sale is lost: it should be 5
\`\`\`

The SQL standard (ISO/IEC 9075) defines four isolation levels by the anomalies they still allow:

- **READ UNCOMMITTED:** dirty reads are possible.
- **READ COMMITTED:** no dirty reads; non-repeatable reads and phantoms are possible.
- **REPEATABLE READ:** no dirty or non-repeatable reads; phantoms are possible.
- **SERIALIZABLE:** the result equals running the transactions one at a time, in some order.

Real databases differ in the details, so read your database's manual. **PostgreSQL** defaults to READ COMMITTED, treats READ UNCOMMITTED as READ COMMITTED, and its REPEATABLE READ (a snapshot of the data) also prevents phantoms. Its SERIALIZABLE level may abort a transaction with a *serialization failure* (SQLSTATE \`40001\`), and your code must then **retry** the whole transaction. **MySQL's InnoDB** defaults to REPEATABLE READ. **SQLite** transactions are serializable, because it allows only one writer at a time.

\`\`\`sql
BEGIN ISOLATION LEVEL SERIALIZABLE;   -- PostgreSQL; MySQL uses SET TRANSACTION ISOLATION LEVEL ...
\`\`\`

### Four ways to stop a lost update

1. **Let the database do the arithmetic:** \`UPDATE products SET stock = stock - 2 WHERE id = 1\`. The read and the write happen inside one statement, so no other write can slip in between.
2. **Pessimistic locking:** \`SELECT stock FROM products WHERE id = 1 FOR UPDATE\` (PostgreSQL, MySQL) locks the row until your transaction ends, so the second client waits.
3. **Optimistic concurrency control:** do not lock, but **detect** the conflict when saving, with a version column (the next lab).
4. **A stricter isolation level:** in PostgreSQL's REPEATABLE READ or SERIALIZABLE, the second writer gets an error instead of overwriting.`,
        ar: `## مستويات العزل والشذوذات التي تمنعها

حين تعمل المعاملات في الوقت نفسه، هذه هي الأخطاء الكلاسيكية الممكنة:

- **القراءة القذرة (dirty read):** تقرأ تغييراً لم **تلتزم** به معاملة أخرى بعد. فإن تراجعت، تكون قد تصرفت بناءً على بيانات لم توجد قط.
- **القراءة غير القابلة للتكرار (non-repeatable read):** تقرأ الصف نفسه مرتين في معاملة واحدة فتحصل على **قيمتين مختلفتين**، لأن معاملة أخرى التزمت بتغيير بينهما.
- **القراءة الشبحية (phantom read):** تنفّذ استعلام \`WHERE\` نفسه مرتين فتحصل على **مجموعة صفوف مختلفة**، لأن معاملة أخرى أدرجت صفوفاً مطابقة أو حذفتها.
- **التحديث الضائع (lost update):** تقرأ معاملتان قيمة، وتحسب كل منهما قيمة جديدة منها، فتكتب الثانية **فوق** الأولى بصمت.

\`\`\`text
time  T1 (Amal's phone)               T2 (Bilal's laptop)
 1    SELECT stock -> 10
 2                                    SELECT stock -> 10
 3    UPDATE stock = 10 - 3  (7)
 4    COMMIT
 5                                    UPDATE stock = 10 - 2  (8)
 6                                    COMMIT        -- Amal's sale is lost: it should be 5
\`\`\`

يعرّف معيار SQL (ISO/IEC 9075) أربعة مستويات عزل بحسب الشذوذات التي لا تزال مسموحة فيها:

- **READ UNCOMMITTED:** القراءات القذرة ممكنة.
- **READ COMMITTED:** لا قراءات قذرة؛ والقراءات غير القابلة للتكرار والصفوف الشبحية ممكنة.
- **REPEATABLE READ:** لا قراءات قذرة ولا غير قابلة للتكرار؛ والصفوف الشبحية ممكنة.
- **SERIALIZABLE:** النتيجة تساوي تنفيذ المعاملات واحدة تلو الأخرى، بترتيب ما.

وتختلف القواعد الحقيقية في التفاصيل، فاقرأ دليل قاعدتك. **PostgreSQL** مستواها الافتراضي READ COMMITTED، وتعامل READ UNCOMMITTED معاملة READ COMMITTED، ومستوى REPEATABLE READ فيها (لقطة من البيانات) يمنع الصفوف الشبحية أيضاً. وقد يُجهض مستوى SERIALIZABLE فيها معاملةً بـ *فشل تسلسل (serialization failure)* (SQLSTATE \`40001\`)، وعندها يجب أن **يعيد** كودك المعاملة كلها. ومستوى **InnoDB في MySQL** الافتراضي REPEATABLE READ. ومعاملات **SQLite** قابلة للتسلسل، لأنها لا تسمح إلا بكاتب واحد في كل لحظة.

\`\`\`sql
BEGIN ISOLATION LEVEL SERIALIZABLE;   -- PostgreSQL; MySQL uses SET TRANSACTION ISOLATION LEVEL ...
\`\`\`

### أربع طرق لإيقاف التحديث الضائع

1. **دع القاعدة تُجرِ الحساب:** \`UPDATE products SET stock = stock - 2 WHERE id = 1\`. القراءة والكتابة تحدثان داخل عبارة واحدة، فلا تستطيع كتابة أخرى التسلل بينهما.
2. **القفل المتشائم (pessimistic locking):** \`SELECT stock FROM products WHERE id = 1 FOR UPDATE\` (في PostgreSQL وMySQL) يقفل الصف حتى تنتهي معاملتك، فينتظر العميل الثاني.
3. **التحكم المتفائل في التزامن (optimistic concurrency control):** لا تقفل، بل **اكتشف** التعارض عند الحفظ، بعمود إصدار (المختبر التالي).
4. **مستوى عزل أشد:** في REPEATABLE READ أو SERIALIZABLE في PostgreSQL يتلقى الكاتب الثاني خطأً بدل أن يكتب فوق الأول.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// Two clients sell from the same stock, interleaved: read, read, write, write.
function run(strategy) {
  const row = { stock: 10, version: 0 };
  const seenByA = { ...row }; // client A reads
  const seenByB = { ...row }; // client B reads
  const log = [];
  for (const [name, seen, qty] of [["A", seenByA, 3], ["B", seenByB, 2]]) {
    if (strategy === "blind write") {
      row.stock = seen.stock - qty;            // UPDATE ... SET stock = <value computed earlier>
      log.push(name + " saved");
    } else if (strategy === "atomic") {
      row.stock = row.stock - qty;             // UPDATE ... SET stock = stock - qty
      log.push(name + " saved");
    } else if (row.version === seen.version) { // UPDATE ... WHERE id = 1 AND version = <read version>
      row.stock = seen.stock - qty;
      row.version += 1;
      log.push(name + " saved");
    } else {
      log.push(name + " conflict");
    }
  }
  console.log(strategy.padEnd(14), log.join(", ").padEnd(22), "final stock", row.stock);
}

["blind write", "atomic", "version check"].forEach(run);`,
      explanation: {
        en: "With blind writes the final stock is 8: Amal's sale of 3 is lost. The atomic UPDATE lets the database subtract from the current value and ends at the correct 5. The version check refuses B's stale write (stock 7 so far), so B must read again and retry, which is exactly what the next lab builds.",
        ar: "مع الكتابة العمياء يكون المخزون النهائي 8: ضاعت عملية بيع أمل للثلاث قطع. والـ UPDATE الذري يدع القاعدة تطرح من القيمة الحالية وينتهي عند 5 الصحيحة. أما فحص الإصدار فيرفض كتابة B القديمة (المخزون 7 حتى الآن)، فيجب على B أن يقرأ من جديد ويعيد المحاولة، وهذا بالضبط ما يبنيه المختبر التالي.",
      },
    },
    {
      type: "lab",
      id: "optimistic-update",
      lang: "python",
      prompt: {
        en: `Several clients edit product 1 (\`stock\` 10, \`version\` 0). Each client **reads** the row, then later **sells** some quantity by saving \`stock - qty\`, computed from what *it* read. The program calls \`save(product_id, new_stock, read_version)\`.

The starter does a blind write, so interleaved clients overwrite each other (a lost update). Rewrite \`save\` with **optimistic concurrency control**: update the row **only if** its \`version\` still equals \`read_version\`, increase \`version\` by 1 in the same statement, and return \`True\` when exactly one row changed, \`False\` otherwise (a conflict).

**Input:** a schedule of steps: \`read <client>\` or \`sell <client> <qty>\`.

**Output:** one line per step, then \`final stock=S version=V\`.

Example: \`read A\`, \`read B\`, \`sell A 3\`, \`sell B 2\` saves A, reports a conflict for B and ends with \`final stock=7 version=1\`.`,
        ar: `يعدّل عدة عملاء المنتج 1 (\`stock\` = 10 و\`version\` = 0). كل عميل **يقرأ** الصف، ثم لاحقاً **يبيع** كمية بحفظ \`stock - qty\` محسوبةً مما قرأه *هو*. يستدعي البرنامج \`save(product_id, new_stock, read_version)\`.

الكود الابتدائي يكتب كتابة عمياء، فيكتب العملاء المتداخلون بعضهم فوق بعض (تحديث ضائع). أعد كتابة \`save\` بـ **التحكم المتفائل في التزامن**: حدّث الصف **فقط إذا** كان \`version\` فيه لا يزال يساوي \`read_version\`، وزِد \`version\` بمقدار 1 في العبارة نفسها، وأعد \`True\` حين يتغير صف واحد بالضبط، و\`False\` في غير ذلك (تعارض).

**الدخل:** جدول خطوات: \`read <client>\` أو \`sell <client> <qty>\`.

**الخرج:** سطر لكل خطوة، ثم \`final stock=S version=V\`.

مثال: \`read A\` ثم \`read B\` ثم \`sell A 3\` ثم \`sell B 2\` يحفظ A، ويبلّغ عن تعارض لـ B، وينتهي بـ \`final stock=7 version=1\`.`,
      },
      starterCode: `${STOCK_SEED}

def save(product_id, new_stock, read_version):
    """Write new_stock only if nobody changed the row since we read read_version."""
    # TODO: this blind write overwrites whatever another client saved in the meantime.
    # Only update when the row still has read_version, bump the version on success,
    # and return False when no row matched (cursor.rowcount tells you how many did).
    db.execute("UPDATE products SET stock = ? WHERE id = ?", (new_stock, product_id))
    return True
${STOCK_TAIL}`,
      solution: `${STOCK_SEED}

def save(product_id, new_stock, read_version):
    """Write new_stock only if nobody changed the row since we read read_version."""
    cur = db.execute(
        "UPDATE products SET stock = ?, version = version + 1 WHERE id = ? AND version = ?",
        (new_stock, product_id, read_version),
    )
    return cur.rowcount == 1      # 0 rows: the version moved on, someone else saved first
${STOCK_TAIL}`,
      hints: [
        { en: "Add the version to the WHERE clause: ... WHERE id = ? AND version = ?. If someone saved in between, no row matches.", ar: "أضف الإصدار إلى جملة WHERE: ... WHERE id = ? AND version = ?. إن حفظ أحد بينهما فلن يطابق أي صف." },
        { en: "Bump the version in the same UPDATE: SET stock = ?, version = version + 1.", ar: "زِد الإصدار في عبارة UPDATE نفسها: SET stock = ?, version = version + 1." },
        { en: "Keep the cursor that db.execute returns and return cursor.rowcount == 1.", ar: "احتفظ بالمؤشر الذي تُرجعه db.execute وأعد cursor.rowcount == 1." },
      ],
      tests: [
        { name: { en: "One client after the other: both saved, version 2", ar: "عميل بعد آخر: الحفظان ناجحان والإصدار 2" }, stdin: "read A\nsell A 3\nread B\nsell B 2\n", expected: "A reads stock=10 version=0\nA sells 3: saved\nB reads stock=7 version=1\nB sells 2: saved\nfinal stock=5 version=2" },
        { name: { en: "Interleaved clients: the stale write is a conflict", ar: "عميلان متداخلان: الكتابة القديمة تعارض" }, stdin: "read A\nread B\nsell A 3\nsell B 2\n", expected: "A reads stock=10 version=0\nB reads stock=10 version=0\nA sells 3: saved\nB sells 2: conflict, read again\nfinal stock=7 version=1" },
        { name: { en: "Retry after a conflict reaches the correct stock", ar: "إعادة المحاولة بعد التعارض تصل إلى المخزون الصحيح" }, stdin: "read A\nread B\nsell A 3\nsell B 2\nread B\nsell B 2\n", expected: "A reads stock=10 version=0\nB reads stock=10 version=0\nA sells 3: saved\nB sells 2: conflict, read again\nB reads stock=7 version=1\nB sells 2: saved\nfinal stock=5 version=2" },
        { name: { en: "Three clients: only the first writer wins", ar: "ثلاثة عملاء: يفوز الكاتب الأول فقط" }, stdin: "read A\nread B\nread C\nsell C 1\nsell A 4\nsell B 2\nread A\nsell A 4\n", expected: "A reads stock=10 version=0\nB reads stock=10 version=0\nC reads stock=10 version=0\nC sells 1: saved\nA sells 4: conflict, read again\nB sells 2: conflict, read again\nA reads stock=9 version=1\nA sells 4: saved\nfinal stock=5 version=2" },
      ],
      sampleInput: "read A\nread B\nsell A 3\nsell B 2\n",
    },
    {
      type: "text",
      body: {
        en: `## Locks and deadlocks

To keep transactions apart, databases use **locks**. A **shared** lock lets many readers in; an **exclusive** lock gives one writer sole access. PostgreSQL and MySQL's InnoDB lock individual **rows**, and thanks to multiversion concurrency control (MVCC) a plain \`SELECT\` at the default isolation level neither blocks writers nor waits for them. Two transactions that **write the same row** still have to take turns: the second waits until the first commits or rolls back. SQLite is coarser: one writer for the whole database at a time (\`BEGIN IMMEDIATE\` takes the write lock at the start instead of at the first write).

A **deadlock** happens when transactions wait for each other in a circle:

\`\`\`text
T1: UPDATE accounts ... WHERE id = 'amal'    -- T1 locks amal
T2: UPDATE accounts ... WHERE id = 'bilal'   -- T2 locks bilal
T1: UPDATE accounts ... WHERE id = 'bilal'   -- T1 waits for T2
T2: UPDATE accounts ... WHERE id = 'amal'    -- T2 waits for T1: nobody can ever move

wait-for graph:    T1 ──waits for──▶ T2
                   ▲                  │
                   └────waits for─────┘
\`\`\`

Waiting longer cannot fix this, so the database steps in. It keeps a **wait-for graph** (an arrow from each waiting transaction to the one holding its lock), and a **cycle** in that graph is a deadlock. It then aborts one transaction of the cycle, the **victim**, which releases its locks so the others continue. PostgreSQL checks after a transaction has waited \`deadlock_timeout\` (1 second by default) and reports \`deadlock detected\` (SQLSTATE \`40P01\`); InnoDB detects deadlocks automatically and rolls back the transaction it judges smallest. The victim's application gets an error and should **retry** the whole transaction.

Better still, make deadlocks rare:

- **Lock in a consistent order.** If every transfer updates the account with the smaller id first, the circle above cannot form.
- **Keep transactions short.** Never wait for user input or a slow network call while holding locks.
- **Retry** on deadlock and serialization errors (\`40P01\`, \`40001\`), with a small limit on attempts.
- Optionally set a **lock timeout** (PostgreSQL's \`lock_timeout\`) so a stuck request fails fast instead of hanging.

**Optimistic or pessimistic?** Optimistic control (the version column) holds no locks, so it suits conflicts that are rare, such as two people editing the same profile. Pessimistic locking (\`FOR UPDATE\`) suits hot rows that conflict often, where retrying again and again would waste more work than waiting.`,
        ar: `## الأقفال والجمود

لإبقاء المعاملات منفصلة تستخدم القواعد **الأقفال (locks)**. **القفل المشترك (shared)** يُدخل قرّاء كثيرين؛ و**القفل الحصري (exclusive)** يمنح كاتباً واحداً وصولاً منفرداً. تقفل PostgreSQL وInnoDB في MySQL **صفوفاً** منفردة، وبفضل التحكم في التزامن متعدد الإصدارات (MVCC) لا يحجب \`SELECT\` العادي فيهما، في مستوى العزل الافتراضي، الكتّابَ ولا ينتظرهم. أما معاملتان **تكتبان الصف نفسه** فلا بد أن تتناوبا: تنتظر الثانية حتى تلتزم الأولى أو تتراجع. وSQLite أخشن من ذلك: كاتب واحد لقاعدة البيانات كلها في كل لحظة (\`BEGIN IMMEDIATE\` يأخذ قفل الكتابة عند البداية بدل أول كتابة).

يحدث **الجمود (deadlock)** حين تنتظر المعاملات بعضها بعضاً في دائرة:

\`\`\`text
T1: UPDATE accounts ... WHERE id = 'amal'    -- T1 locks amal
T2: UPDATE accounts ... WHERE id = 'bilal'   -- T2 locks bilal
T1: UPDATE accounts ... WHERE id = 'bilal'   -- T1 waits for T2
T2: UPDATE accounts ... WHERE id = 'amal'    -- T2 waits for T1: nobody can ever move

wait-for graph:    T1 ──waits for──▶ T2
                   ▲                  │
                   └────waits for─────┘
\`\`\`

الانتظار أطول لا يحل هذا، فتتدخل القاعدة. فهي تحتفظ بـ **مخطط الانتظار (wait-for graph)**: سهم من كل معاملة منتظرة إلى المعاملة التي تحمل قفلها، و**الدورة (cycle)** في هذا المخطط هي جمود. ثم تُجهض معاملة واحدة من الدورة، هي **الضحية (victim)**، فتتحرر أقفالها وتكمل البقية. تفحص PostgreSQL بعد أن تنتظر المعاملة مدة \`deadlock_timeout\` (ثانية واحدة افتراضياً) وتبلّغ بـ \`deadlock detected\` (SQLSTATE \`40P01\`)؛ ويكتشف InnoDB الجمود تلقائياً ويتراجع عن المعاملة التي يقدّر أنها الأصغر. ويتلقى تطبيق الضحية خطأً وعليه أن **يعيد** المعاملة كلها.

والأفضل من ذلك أن تجعل الجمود نادراً:

- **اقفل بترتيب ثابت.** إذا حدّث كل تحويل الحساب ذا المعرّف الأصغر أولاً، فلا يمكن أن تتكون الدائرة أعلاه.
- **أبقِ المعاملات قصيرة.** لا تنتظر أبداً إدخال مستخدم أو استدعاء شبكة بطيئاً وأنت تحمل أقفالاً.
- **أعد المحاولة** عند أخطاء الجمود والتسلسل (\`40P01\` و\`40001\`)، مع حد صغير لعدد المحاولات.
- اضبط اختيارياً **مهلة قفل** (\`lock_timeout\` في PostgreSQL) كي يفشل الطلب العالق سريعاً بدل أن يتعلق.

**متفائل أم متشائم؟** التحكم المتفائل (عمود الإصدار) لا يحمل أقفالاً، فيناسب التعارضات النادرة، مثل شخصين يعدّلان الملف الشخصي نفسه. والقفل المتشائم (\`FOR UPDATE\`) يناسب الصفوف الساخنة كثيرة التعارض، حيث تهدر إعادة المحاولة مرة بعد مرة عملاً أكثر من الانتظار.`,
      },
    },
    {
      type: "lab",
      id: "deadlock-detector",
      lang: "python",
      prompt: {
        en: `Build the heart of a deadlock detector. Each input line \`T<a> waits T<b>\` means transaction \`a\` waits for a lock held by transaction \`b\`; in this model a blocked transaction waits for exactly one other. The program stores this as the dictionary \`waits_for\` (\`{a: b}\`, numbers only) and calls \`find_cycles(waits_for)\`.

Write \`find_cycles\` so it returns **every cycle** of the wait-for graph as a list of transaction numbers in arrow order, each cycle **starting at its smallest number**, and the cycles **sorted**. A transaction that waits for a cycle but is not part of it (a "tail") is not in the cycle.

**Output:** for each cycle, \`deadlock: T4 -> T9 -> T6 -> T4\` and the victim \`abort T9\` (the program aborts the highest number, the youngest transaction), or \`no deadlock\`.

Example: \`T1 waits T2\` and \`T2 waits T1\` print \`deadlock: T1 -> T2 -> T1\` and \`abort T2\`.`,
        ar: `ابنِ قلب كاشف الجمود. كل سطر دخل \`T<a> waits T<b>\` يعني أن المعاملة \`a\` تنتظر قفلاً تحمله المعاملة \`b\`؛ وفي هذا النموذج تنتظر المعاملة المحجوبة معاملة واحدة أخرى بالضبط. يخزّن البرنامج ذلك في القاموس \`waits_for\` (\`{a: b}\`، أرقام فقط) ويستدعي \`find_cycles(waits_for)\`.

اكتب \`find_cycles\` لتُرجع **كل دورة** في مخطط الانتظار قائمةً بأرقام المعاملات بترتيب الأسهم، بحيث **تبدأ كل دورة بأصغر رقم فيها**، وتكون الدورات **مرتبة**. والمعاملة التي تنتظر دورة دون أن تكون جزءاً منها («ذيل») ليست في الدورة.

**الخرج:** لكل دورة \`deadlock: T4 -> T9 -> T6 -> T4\` والضحية \`abort T9\` (يُجهض البرنامج الرقم الأعلى، أي المعاملة الأحدث)، أو \`no deadlock\`.

مثال: \`T1 waits T2\` و\`T2 waits T1\` يطبعان \`deadlock: T1 -> T2 -> T1\` و\`abort T2\`.`,
      },
      starterCode: `${WAITS_HEAD}

def find_cycles(waits_for):
    """Every cycle of the wait-for graph, each starting at its smallest number, sorted."""
    # TODO: follow the arrows from each transaction (waits_for[t] is the one t waits for).
    # If a walk comes back to a transaction already on the current walk, the part of the
    # walk from that transaction onwards is a cycle: a deadlock. Rotate each cycle so it
    # starts at its smallest number and return the cycles sorted.
    return []
${WAITS_TAIL}`,
      solution: `${WAITS_HEAD}

def find_cycles(waits_for):
    """Every cycle of the wait-for graph, each starting at its smallest number, sorted."""
    cycles = []
    done = set()                       # transactions already fully explored
    for start in sorted(waits_for):
        path = []                      # the chain followed from start, in order
        on_path = {}                   # transaction -> its index in path
        node = start
        while node in waits_for and node not in done and node not in on_path:
            on_path[node] = len(path)
            path.append(node)
            node = waits_for[node]
        if node in on_path:            # the walk came back to itself: a cycle
            cycle = path[on_path[node]:]
            low = cycle.index(min(cycle))
            cycles.append(cycle[low:] + cycle[:low])
        done.update(path)
    return sorted(cycles)
${WAITS_TAIL}`,
      hints: [
        { en: "From each start transaction, walk node = waits_for[node] and remember the walk in a list. Stop when a node waits for nobody, was explored before, or is already on the current walk.", ar: "من كل معاملة بداية امشِ node = waits_for[node] واحفظ المسار في قائمة. توقف حين لا تنتظر العقدة أحداً، أو استُكشفت من قبل، أو كانت على المسار الحالي أصلاً." },
        { en: "If you stopped because the node is already on the current walk, the slice of the walk from that node to the end is the cycle. Keep a set of explored nodes so each cycle is found once.", ar: "إن توقفت لأن العقدة على المسار الحالي أصلاً، فالجزء من المسار بدءاً من تلك العقدة حتى النهاية هو الدورة. واحتفظ بمجموعة للعقد المستكشفة كي تجد كل دورة مرة واحدة." },
        { en: "Rotate with i = cycle.index(min(cycle)); cycle[i:] + cycle[:i]. Compare numbers, not strings, so T10 sorts after T2.", ar: "دوّر بـ i = cycle.index(min(cycle))؛ ثم cycle[i:] + cycle[:i]. قارن أرقاماً لا نصوصاً، كي يأتي T10 بعد T2." },
      ],
      tests: [
        { name: { en: "Two transactions waiting for each other", ar: "معاملتان تنتظر كل منهما الأخرى" }, stdin: "T1 waits T2\nT2 waits T1\n", expected: "deadlock: T1 -> T2 -> T1\nabort T2" },
        { name: { en: "A waiting chain without a cycle is not a deadlock", ar: "سلسلة انتظار بلا دورة ليست جموداً" }, stdin: "T1 waits T2\nT2 waits T3\nT4 waits T3\n", expected: "no deadlock" },
        { name: { en: "A three-way cycle with a waiting tail", ar: "دورة ثلاثية مع ذيل منتظر" }, stdin: "T7 waits T4\nT4 waits T9\nT9 waits T6\nT6 waits T4\n", expected: "deadlock: T4 -> T9 -> T6 -> T4\nabort T9" },
        { name: { en: "Two separate deadlocks, sorted", ar: "حالتا جمود منفصلتان ومرتبتان" }, stdin: "T3 waits T8\nT8 waits T3\nT5 waits T1\nT1 waits T2\nT2 waits T5\nT11 waits T12\n", expected: "deadlock: T1 -> T2 -> T5 -> T1\nabort T5\ndeadlock: T3 -> T8 -> T3\nabort T8" },
        { name: { en: "A tail with a smaller number stays out; the cycle starts at its own smallest", ar: "الذيل ذو الرقم الأصغر يبقى خارجاً؛ والدورة تبدأ بأصغر رقم فيها" }, stdin: "T1 waits T5\nT5 waits T9\nT9 waits T3\nT3 waits T5\n", expected: "deadlock: T3 -> T5 -> T9 -> T3\nabort T9" },
        { name: { en: "Numbers compare as numbers (T10 after T2)", ar: "الأرقام تُقارن أرقاماً (T10 بعد T2)" }, stdin: "T10 waits T2\nT2 waits T10\n", expected: "deadlock: T2 -> T10 -> T2\nabort T10" },
      ],
      sampleInput: "T1 waits T2\nT2 waits T3\nT3 waits T1\n",
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "A transfer runs BEGIN, debits Amal, and the server loses power before the credit and before COMMIT. What do you find after the restart?", ar: "تنفّذ عملية تحويل BEGIN وتخصم من أمل، ثم ينقطع التيار عن الخادم قبل الإيداع وقبل COMMIT. ماذا تجد بعد إعادة التشغيل؟" },
          choices: [
            { en: "The debit is kept and the credit is lost", ar: "يبقى الخصم ويضيع الإيداع" },
            { en: "Neither change: the unfinished transaction is rolled back", ar: "لا هذا ولا ذاك: يُتراجع عن المعاملة غير المكتملة" },
            { en: "Both changes, because the database finishes the transaction for you", ar: "التغييران معاً، لأن القاعدة تُكمل المعاملة بالنيابة عنك" },
            { en: "A corrupted table that must be restored from backup", ar: "جدول تالف يجب استرداده من نسخة احتياطية" },
          ],
          answer: 1,
          explain: {
            en: "Atomicity: a transaction that never committed leaves no trace. On restart, recovery reads the log and discards uncommitted changes. The database cannot finish the work for you, because it does not know the statements that never ran.",
            ar: "الذرّية: المعاملة التي لم يُلتزم بها لا تترك أثراً. وعند إعادة التشغيل يقرأ الاسترداد السجل ويتجاهل التغييرات غير الملتزم بها. ولا تستطيع القاعدة إكمال العمل بدلاً منك، لأنها لا تعرف العبارات التي لم تُنفَّذ قط.",
          },
        },
        {
          q: { en: "T1 reads a balance that T2 has updated but not committed. T2 then rolls back. Which anomaly did T1 suffer?", ar: "تقرأ T1 رصيداً حدّثته T2 دون أن تلتزم به. ثم تتراجع T2. أي شذوذ أصاب T1؟" },
          choices: [
            { en: "A phantom read", ar: "قراءة شبحية" },
            { en: "A lost update", ar: "تحديث ضائع" },
            { en: "A dirty read", ar: "قراءة قذرة" },
            { en: "A deadlock", ar: "جمود" },
          ],
          answer: 2,
          explain: {
            en: "Reading data another transaction has not committed is a dirty read: T1 saw a value that, after the rollback, never officially existed. Every level from READ COMMITTED upwards prevents it.",
            ar: "قراءة بيانات لم تلتزم بها معاملة أخرى هي قراءة قذرة: رأت T1 قيمة لم توجد رسمياً قط بعد التراجع. وكل مستوى من READ COMMITTED فما فوق يمنعها.",
          },
        },
        {
          q: { en: "Two clients each read stock = 10 and then save the value they computed. Which single statement avoids the lost update without locks or a version column?", ar: "يقرأ عميلان كلاهما stock = 10 ثم يحفظ كل منهما القيمة التي حسبها. أي عبارة واحدة تتجنب التحديث الضائع دون أقفال ولا عمود إصدار؟" },
          choices: [
            { en: "UPDATE products SET stock = stock - 2 WHERE id = 1", ar: "UPDATE products SET stock = stock - 2 WHERE id = 1" },
            { en: "UPDATE products SET stock = 8 WHERE id = 1", ar: "UPDATE products SET stock = 8 WHERE id = 1" },
            { en: "SELECT stock FROM products WHERE id = 1, run twice to be sure", ar: "SELECT stock FROM products WHERE id = 1 مرتين للتأكد" },
            { en: "DELETE the row and INSERT it again with the new stock", ar: "حذف الصف ثم إدراجه من جديد بالمخزون الجديد" },
          ],
          answer: 0,
          explain: {
            en: "stock = stock - 2 makes the database read and write the current value inside one statement, so a concurrent change cannot slip in between. Writing a value computed earlier (8) is exactly what loses the other client's update.",
            ar: "العبارة stock = stock - 2 تجعل القاعدة تقرأ القيمة الحالية وتكتبها داخل عبارة واحدة، فلا يستطيع تغيير متزامن التسلل بينهما. أما كتابة قيمة حُسبت سابقاً (8) فهي بالضبط ما يُضيّع تحديث العميل الآخر.",
          },
        },
        {
          q: { en: "UPDATE products SET stock = 6, version = version + 1 WHERE id = 1 AND version = 4 reports 0 rows changed. What does that mean?", ar: "العبارة UPDATE products SET stock = 6, version = version + 1 WHERE id = 1 AND version = 4 تبلّغ بتغيير 0 صفوف. ماذا يعني ذلك؟" },
          choices: [
            { en: "The database is down and the update must be sent again later", ar: "القاعدة متوقفة ويجب إرسال التحديث مرة أخرى لاحقاً" },
            { en: "The update worked; rowcount is always 0 for UPDATE", ar: "نجح التحديث؛ فـ rowcount يساوي 0 دائماً مع UPDATE" },
            { en: "Product 1 was deleted, so you should insert it", ar: "حُذف المنتج 1، فعليك أن تدرجه" },
            { en: "Someone saved a newer version since you read version 4: read again and redo your change, or report the conflict", ar: "حفظ أحدهم إصداراً أحدث منذ قرأت الإصدار 4: اقرأ من جديد وأعد تغييرك، أو بلّغ عن التعارض" },
          ],
          answer: 3,
          explain: {
            en: "That is how optimistic concurrency control detects a conflict: the version you read is no longer current, so the WHERE matched nothing and your stale value was not written. Re-read the row and apply the change again, or ask the user.",
            ar: "هكذا يكتشف التحكم المتفائل في التزامن التعارض: الإصدار الذي قرأته لم يعد الحالي، فلم يطابق WHERE شيئاً ولم تُكتب قيمتك القديمة. أعد قراءة الصف وطبّق التغيير من جديد، أو اسأل المستخدم.",
          },
        },
        {
          q: { en: "Transfers sometimes deadlock: one locks account A then B, another locks B then A. What is the most effective fix in the application?", ar: "تقع التحويلات أحياناً في جمود: إحداها تقفل الحساب A ثم B، والأخرى تقفل B ثم A. ما أنجع إصلاح في التطبيق؟" },
          choices: [
            { en: "Increase deadlock_timeout so transactions wait longer", ar: "زيادة deadlock_timeout لتنتظر المعاملات أطول" },
            { en: "Always lock the two accounts in the same order, for example the smaller id first", ar: "قفل الحسابين دائماً بالترتيب نفسه، مثل المعرّف الأصغر أولاً" },
            { en: "Switch every transaction to READ UNCOMMITTED", ar: "تحويل كل المعاملات إلى READ UNCOMMITTED" },
          ],
          answer: 1,
          explain: {
            en: "A deadlock needs a circle of waits. If every transaction takes its locks in the same global order, no circle can form. Waiting longer never resolves a cycle, and a weaker isolation level does not stop two writers from locking the same rows.",
            ar: "يحتاج الجمود إلى دائرة انتظار. فإذا أخذت كل معاملة أقفالها بالترتيب العام نفسه فلا يمكن أن تتكون دائرة. والانتظار الأطول لا يحل الدورة أبداً، ومستوى العزل الأضعف لا يمنع كاتبين من قفل الصفوف نفسها.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap and what to practice next

- A **transaction** (\`BEGIN\` ... \`COMMIT\`) is all or nothing; \`ROLLBACK\` undoes it, and **savepoints** undo part of it. Without \`BEGIN\`, autocommit makes every statement its own transaction.
- **ACID:** atomicity (all or nothing), consistency (declared constraints always hold), isolation (concurrent transactions do not interfere), durability (committed data survives a crash).
- The anomalies are **dirty reads**, **non-repeatable reads**, **phantoms** and **lost updates**. Stronger isolation levels prevent more of them; check what your database actually does, and retry on serialization failures.
- Stop lost updates with an **atomic UPDATE**, **\`SELECT ... FOR UPDATE\`**, or **optimistic concurrency control** with a version column and a rowcount check.
- A **deadlock** is a cycle in the wait-for graph. The database aborts a victim; you prevent most of them by **locking in a consistent order** and keeping transactions short.

**Practice next:** extend the first lab with a \`SAVEPOINT\` so a batch of transfers keeps the good ones and skips the bad ones in a single transaction. In the second lab, add an automatic retry loop with at most three attempts. Then move on to how data is modelled outside the relational world: NoSQL databases make different promises about transactions, and knowing ACID tells you exactly what to ask.`,
        ar: `## الخلاصة وما تتدرب عليه بعد ذلك

- **المعاملة** (\`BEGIN\` ... \`COMMIT\`) كلٌّ أو لا شيء؛ و\`ROLLBACK\` يتراجع عنها، و**نقاط الحفظ** تتراجع عن جزء منها. وبلا \`BEGIN\` يجعل الالتزام التلقائي كل عبارة معاملة مستقلة.
- **ACID:** الذرّية (الكل أو لا شيء)، والاتساق (القيود المعلنة متحققة دائماً)، والعزل (المعاملات المتزامنة لا تتداخل)، والديمومة (البيانات الملتزم بها تبقى بعد التعطل).
- الشذوذات هي **القراءات القذرة** و**القراءات غير القابلة للتكرار** و**الصفوف الشبحية** و**التحديثات الضائعة**. ومستويات العزل الأقوى تمنع المزيد منها؛ تحقّق مما تفعله قاعدتك فعلاً، وأعد المحاولة عند فشل التسلسل.
- أوقف التحديثات الضائعة بـ **UPDATE ذري**، أو **\`SELECT ... FOR UPDATE\`**، أو **التحكم المتفائل في التزامن** بعمود إصدار وفحص rowcount.
- **الجمود** دورة في مخطط الانتظار. تُجهض القاعدة ضحية؛ وتمنع أنت معظم حالاته **بالقفل بترتيب ثابت** وإبقاء المعاملات قصيرة.

**تدرّب بعد ذلك:** وسّع المختبر الأول بـ \`SAVEPOINT\` كي تحتفظ دفعة من التحويلات بالصحيحة منها وتتخطى الخاطئة في معاملة واحدة. وفي المختبر الثاني أضف حلقة إعادة محاولة تلقائية بثلاث محاولات على الأكثر. ثم انتقل إلى كيفية نمذجة البيانات خارج العالم العلائقي: قواعد NoSQL تقدم وعوداً مختلفة بشأن المعاملات، ومعرفتك بـ ACID تخبرك بالضبط عمّا تسأل.`,
      },
    },
  ],
};
