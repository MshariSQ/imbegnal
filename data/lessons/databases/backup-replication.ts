import type { Lesson } from "../types";

const RESTORE_SEED = `import sqlite3
import sys

# stdin: a logical backup ("dump") produced by a nightly job. Its first line is a
# manifest written at backup time: "-- manifest: customers=3 orders=4".
dump = sys.stdin.read()


def read_manifest(dump_text):
    """{"customers": 3, "orders": 4} from the manifest line, in the order it lists them."""
    first = dump_text.splitlines()[0]
    pairs = first.split(":", 1)[1].split()
    return {name: int(count) for name, count in (pair.split("=") for pair in pairs)}
`;

const RESTORE_TAIL = `

print(restore_and_verify(dump))
`;

const PITR_SEED = `import sqlite3
import sys

# The base backup, taken at midnight: the state recovery starts from.
db = sqlite3.connect(":memory:")
db.executescript("""
    CREATE TABLE products (name TEXT PRIMARY KEY, stock INTEGER NOT NULL);
    INSERT INTO products VALUES ('Notebook', 10), ('Pen', 50), ('Backpack', 5);
""")

# stdin line 1: "target HH:MM:SS", the moment to recover to.
# Then the archived log, in the order it was written: "HH:MM:SS <tx> <statement>",
# where <statement> is SQL, COMMIT or ROLLBACK. Transactions can interleave.
lines = sys.stdin.read().splitlines()
target = lines[0].split()[1]
records = [tuple(line.split(" ", 2)) for line in lines[1:] if line.strip()]
`;

const PITR_TAIL = `

replayed = recover(records, target)
print("replayed:", " ".join(replayed) if replayed else "(none)")
rows = db.execute("SELECT name, stock FROM products ORDER BY name").fetchall()
for name, stock in rows:
    print(f"{name}: {stock}")
if not rows:
    print("(no products)")
`;

const FAILOVER_SEED = `import sys

# stdin:
#   rpo <seconds>                          the most data loss (in time) the business accepts
#   primary <HH:MM:SS>                     the last commit the failed primary is known to have made
#   <replica> <HH:MM:SS> <healthy|down>    the last commit each replica has replayed, and its health


def to_seconds(hms):
    hours, minutes, seconds = map(int, hms.split(":"))
    return hours * 3600 + minutes * 60 + seconds


replicas = []
for line in sys.stdin.read().splitlines():
    words = line.split()
    if not words:
        continue
    if words[0] == "rpo":
        rpo = int(words[1])
    elif words[0] == "primary":
        primary = to_seconds(words[1])
    else:
        replicas.append((words[0], to_seconds(words[1]), words[2]))

for name, replayed, status in replicas:
    print(f"{name}: lag {primary - replayed}s, {status}")
`;

const FAILOVER_TAIL = `

for line in plan_failover(primary, replicas, rpo):
    print(line)
`;

// Test inputs shared by several cases: a complete dump and the archived log of one day.
const DUMP_HEAD = `-- manifest: customers=3 orders=4
BEGIN TRANSACTION;
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
INSERT INTO "customers" VALUES(1,'Amal');
INSERT INTO "customers" VALUES(2,'Bilal');
INSERT INTO "customers" VALUES(3,'Carla');
`;
const DUMP_ORDERS = `CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), total_cents INTEGER NOT NULL);
INSERT INTO "orders" VALUES(1,1,2500);
INSERT INTO "orders" VALUES(2,1,900);
INSERT INTO "orders" VALUES(3,2,4100);
`;
const DAY_LOG = `09:00:00 T1 UPDATE products SET stock = stock - 2 WHERE name = 'Notebook'
09:00:01 T1 COMMIT
10:15:00 T2 INSERT INTO products VALUES ('Lamp', 7)
10:15:02 T3 UPDATE products SET stock = stock - 10 WHERE name = 'Pen'
10:15:03 T2 COMMIT
11:30:00 T3 ROLLBACK
14:05:00 T4 UPDATE products SET stock = stock + 20 WHERE name = 'Pen'
14:06:00 T5 DELETE FROM products WHERE stock < 10
14:06:01 T5 COMMIT
14:07:00 T4 COMMIT
`;

export const lesson: Lesson = {
  nodeId: "backup-replication",
  title: { en: "Backup, Replication & High Availability", ar: "النسخ الاحتياطي والنسخ المتماثل والتوفر العالي" },
  estMinutes: 45,
  sections: [
    {
      type: "text",
      body: {
        en: `## The photos that were "backed up" 📸

Hana keeps every family photo on her phone, plus a copy in a second folder on the same phone, "just in case". The phone falls into the sea. Both copies are gone: a copy that shares the same fate is not a backup.

Databases fail in more ways than phones: disks die, a data centre loses power, ransomware encrypts the files, a deploy runs a migration with a bug, and somebody types \`DELETE FROM orders\` without a \`WHERE\`. This lesson is about getting the data back, and about staying online while one machine is down.

## What you'll learn

- **Logical** and **physical** backups, and how to take a **consistent** one
- **Point-in-time recovery** (PITR): restoring to the second before a mistake
- Why a backup you have never **restored** is only a hope
- **Replication** with a primary and replicas, **synchronous** versus **asynchronous**, **replication lag** and **failover**
- The two numbers that drive every design: **RPO** and **RTO**

The labs are in Python: you verify a restored dump, replay an archived log to a point in time, and plan a failover.

## Two numbers: RPO and RTO

- **RPO (Recovery Point Objective):** how much data, measured in time, the business can afford to lose. "RPO 5 minutes" means after a disaster at 14:06 you must be able to recover everything up to at least 14:01.
- **RTO (Recovery Time Objective):** how long the service may be down before it is back. "RTO 1 hour" means users are working again by 15:06.

Both are business decisions with a price. A nightly backup gives an RPO of up to 24 hours; continuous log archiving brings it down to minutes; a synchronous replica brings it close to zero for a failed server. A smaller RTO needs faster restores, or a standby that is already running.

**Replication is not a backup.** A replica copies every change within seconds, including \`DROP TABLE\`, a buggy migration and ransomware's writes. Replicas protect you from **failed machines**; backups protect you from **bad changes**. You need both.`,
        ar: `## الصور التي «نُسخت احتياطياً» 📸

تحتفظ هناء بكل صور العائلة على هاتفها، ومعها نسخة في مجلد ثانٍ على الهاتف نفسه «احتياطاً». ثم يسقط الهاتف في البحر. فتضيع النسختان: النسخة التي تشارك المصير نفسه ليست نسخة احتياطية.

وقواعد البيانات تتعطل بطرق أكثر من الهواتف: تموت الأقراص، وينقطع التيار عن مركز بيانات، وتشفّر برمجيات الفدية الملفات، وينفّذ نشرٌ هجرةً فيها خلل، ويكتب أحدهم \`DELETE FROM orders\` بلا \`WHERE\`. هذا الدرس عن استعادة البيانات، وعن البقاء متصلاً بينما تكون إحدى الآلات معطلة.

## ماذا ستتعلم

- النسخ الاحتياطية **المنطقية (logical)** و**الفيزيائية (physical)**، وكيف تأخذ نسخة **متسقة**
- **الاسترداد إلى نقطة زمنية (point-in-time recovery, PITR)**: الاستعادة إلى الثانية التي سبقت الخطأ
- لماذا لا تكون النسخة الاحتياطية التي لم **تستعدها** قط إلا أملاً
- **النسخ المتماثل (replication)** بخادم أساسي (primary) ونسخ متماثلة (replicas)، و**المتزامن** مقابل **غير المتزامن**، و**تأخر النسخ المتماثل (replication lag)** و**التحويل عند العطل (failover)**
- الرقمان اللذان يقودان كل تصميم: **RPO** و**RTO**

المختبرات ببايثون: تتحقق من نسخة مستعادة، وتعيد تشغيل سجل مؤرشف حتى نقطة زمنية، وتخطط لتحويل عند العطل.

## رقمان: RPO وRTO

- **RPO (هدف نقطة الاسترداد Recovery Point Objective):** مقدار البيانات، مقيساً بالزمن، الذي يحتمل العمل خسارته. «RPO خمس دقائق» يعني أنه بعد كارثة في 14:06 يجب أن تستطيع استرداد كل شيء حتى 14:01 على الأقل.
- **RTO (هدف زمن الاسترداد Recovery Time Objective):** المدة التي يجوز أن تتوقف فيها الخدمة قبل أن تعود. «RTO ساعة واحدة» يعني أن المستخدمين يعملون من جديد بحلول 15:06.

كلاهما قرار عمل له ثمن. النسخة الاحتياطية الليلية تعطي RPO يصل إلى 24 ساعة؛ وأرشفة السجل المستمرة تنزل به إلى دقائق؛ والنسخة المتماثلة المتزامنة تقرّبه من الصفر عند تعطل خادم. ويحتاج RTO الأصغر إلى استعادة أسرع، أو إلى خادم احتياطي يعمل أصلاً.

**النسخ المتماثل ليس نسخاً احتياطياً.** تنسخ النسخة المتماثلة كل تغيير خلال ثوانٍ، بما في ذلك \`DROP TABLE\` والهجرة المعيبة وكتابات برمجيات الفدية. النسخ المتماثلة تحميك من **الآلات المعطلة**؛ والنسخ الاحتياطية تحميك من **التغييرات السيئة**. وأنت تحتاج الاثنين.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Logical and physical backups

**Logical backups** save the data as SQL statements or a portable archive: PostgreSQL's \`pg_dump\`, MySQL's \`mysqldump\`, SQLite's \`.dump\`. They are readable, work across versions and platforms, and can restore a single table. They are slower to restore, because every row is inserted again and every index rebuilt. \`pg_dump\` takes a **consistent snapshot** even while the database is in use (\`mysqldump --single-transaction\` does the same for InnoDB tables), and it does not include roles: \`pg_dumpall --globals-only\` saves those.

**Physical backups** copy the database's files: \`pg_basebackup\`, storage snapshots, or for SQLite the online backup API (\`.backup\`, Python's \`Connection.backup()\`) and \`VACUUM INTO\`. They restore much faster, but only onto the same database major version and platform. Never just copy the files of a running database with \`cp\`: a write in the middle of the copy can leave you with a file that is inconsistent or corrupt. Use the tools made for it.

### Where backups live

- The **3-2-1 rule:** at least **3** copies of the data, on **2** different kinds of storage, with **1** copy off-site.
- Keep at least one copy **immutable or offline**, so ransomware or a stolen admin account cannot delete it.
- **Encrypt** backups and restrict who can read them: a backup is the whole database in one file.
- Decide **retention**: how many daily, weekly and monthly copies, and for how long.

### A backup is only a hope until you restore it

Backups fail silently: the job dumped an empty database, missed a new schema, ran out of disk halfway, or the files are encrypted with a key nobody can find. The only proof is a **restore**. Schedule restore drills: restore into a fresh server, check row counts and checksums against what the backup job recorded, run the application's smoke tests, and **time** the whole thing: that time is your real RTO.`,
        ar: `## النسخ الاحتياطية المنطقية والفيزيائية

**النسخ الاحتياطية المنطقية** تحفظ البيانات عبارات SQL أو أرشيفاً قابلاً للنقل: \`pg_dump\` في PostgreSQL و\`mysqldump\` في MySQL و\`.dump\` في SQLite. وهي مقروءة، وتعمل عبر الإصدارات والمنصات، ويمكنها استعادة جدول واحد. لكن استعادتها أبطأ، لأن كل صف يُدرج من جديد وكل فهرس يُعاد بناؤه. ويأخذ \`pg_dump\` **لقطة متسقة (consistent snapshot)** حتى أثناء استخدام القاعدة (ويفعل \`mysqldump --single-transaction\` الشيء نفسه لجداول InnoDB)، ولا يتضمن الأدوار: يحفظها \`pg_dumpall --globals-only\`.

**النسخ الاحتياطية الفيزيائية** تنسخ ملفات القاعدة: \`pg_basebackup\`، ولقطات التخزين، أو في SQLite واجهة النسخ الاحتياطي الحي (\`.backup\` و\`Connection.backup()\` في بايثون) و\`VACUUM INTO\`. وهي أسرع استعادة بكثير، لكن فقط على الإصدار الرئيسي نفسه للقاعدة والمنصة نفسها. ولا تنسخ أبداً ملفات قاعدة عاملة بمجرد \`cp\`: كتابة في منتصف النسخ قد تترك لك ملفاً غير متسق أو تالفاً. استخدم الأدوات المصنوعة لذلك.

### أين تعيش النسخ الاحتياطية

- **قاعدة 3-2-1:** ثلاث نسخ من البيانات على الأقل، على **نوعين** مختلفين من التخزين، ونسخة **واحدة** خارج الموقع.
- أبقِ نسخة واحدة على الأقل **غير قابلة للتعديل (immutable) أو غير متصلة (offline)**، كي لا تستطيع برمجيات الفدية أو حساب مدير مسروق حذفها.
- **شفّر** النسخ الاحتياطية وقيّد من يستطيع قراءتها: النسخة الاحتياطية هي القاعدة كلها في ملف واحد.
- قرّر **مدة الاحتفاظ (retention)**: كم نسخة يومية وأسبوعية وشهرية، ولأي مدة.

### النسخة الاحتياطية مجرد أمل حتى تستعيدها

تفشل النسخ الاحتياطية بصمت: نسخت المهمة قاعدة فارغة، أو فاتها مخطط جديد، أو امتلأ القرص في منتصفها، أو الملفات مشفّرة بمفتاح لا يجده أحد. والدليل الوحيد هو **الاستعادة (restore)**. جدول تدريبات استعادة: استعد إلى خادم جديد، وتحقق من أعداد الصفوف ومجاميع التحقق (checksums) مقابل ما سجّلته مهمة النسخ، وشغّل اختبارات التطبيق السريعة، و**قِس زمن** العملية كلها: ذلك الزمن هو RTO الحقيقي لديك.`,
      },
    },
    {
      type: "lab",
      id: "verify-restore",
      lang: "python",
      prompt: {
        en: `A nightly job writes a logical dump of a SQLite database. Its first line is a **manifest** with the row count of every table at backup time, such as \`-- manifest: customers=3 orders=4\`. The helper \`read_manifest(dump)\` returns it as a dictionary.

Write \`restore_and_verify(dump)\` so it restores the dump into a **fresh** in-memory database and returns exactly one line:

- \`restore FAILED: the dump does not run\` when running the dump raises \`sqlite3.Error\`
- \`restore FAILED: table T is missing\` when a manifest table does not exist after the restore
- \`restore FAILED: T has N rows, manifest says M\` for the first table whose count differs
- otherwise \`restore OK: customers=3 orders=4\` (every manifest table with its count)

Check tables in manifest order. Only count tables that really exist, so a strange name in the manifest never reaches your SQL.

Example: a dump cut off before its last \`INSERT\` prints \`restore FAILED: orders has 3 rows, manifest says 4\`.`,
        ar: `تكتب مهمة ليلية نسخة منطقية من قاعدة SQLite. سطرها الأول **بيان (manifest)** فيه عدد صفوف كل جدول وقت النسخ، مثل \`-- manifest: customers=3 orders=4\`. وتُرجعه الدالة المساعدة \`read_manifest(dump)\` قاموساً.

اكتب \`restore_and_verify(dump)\` لتستعيد النسخة إلى قاعدة **جديدة** في الذاكرة وتُرجع سطراً واحداً بالضبط:

- \`restore FAILED: the dump does not run\` حين يرفع تنفيذ النسخة \`sqlite3.Error\`
- \`restore FAILED: table T is missing\` حين لا يوجد جدول من البيان بعد الاستعادة
- \`restore FAILED: T has N rows, manifest says M\` لأول جدول يختلف عدده
- وإلا فـ \`restore OK: customers=3 orders=4\` (كل جداول البيان بأعدادها)

افحص الجداول بترتيب البيان. ولا تعدّ إلا الجداول الموجودة فعلاً، كي لا يصل اسم غريب في البيان إلى SQL الخاص بك أبداً.

مثال: نسخة مقطوعة قبل آخر \`INSERT\` فيها تطبع \`restore FAILED: orders has 3 rows, manifest says 4\`.`,
      },
      starterCode: `${RESTORE_SEED}

def restore_and_verify(dump_text):
    """Restore into a FRESH database and check it against the manifest. Return one line."""
    # TODO: this "restore" trusts the backup blindly. Make it prove the backup works:
    #  1. a dump that raises sqlite3.Error -> "restore FAILED: the dump does not run"
    #  2. a table from the manifest that does not exist -> "restore FAILED: table T is missing"
    #  3. a wrong row count -> "restore FAILED: T has N rows, manifest says M"
    #  4. otherwise -> "restore OK: customers=3 orders=4" (the manifest's tables and counts)
    fresh = sqlite3.connect(":memory:")
    fresh.executescript(dump_text)
    return "restore OK"
${RESTORE_TAIL}`,
      solution: `${RESTORE_SEED}

def restore_and_verify(dump_text):
    """Restore into a FRESH database and check it against the manifest. Return one line."""
    expected = read_manifest(dump_text)
    fresh = sqlite3.connect(":memory:")
    try:
        fresh.executescript(dump_text)
    except sqlite3.Error:
        return "restore FAILED: the dump does not run"
    tables = {row[0] for row in fresh.execute("SELECT name FROM sqlite_master WHERE type = 'table'")}
    for table, count in expected.items():
        if table not in tables:                     # also an allow-list for the name below
            return f"restore FAILED: table {table} is missing"
        actual = fresh.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0]
        if actual != count:
            return f"restore FAILED: {table} has {actual} rows, manifest says {count}"
    return "restore OK: " + " ".join(f"{table}={count}" for table, count in expected.items())
${RESTORE_TAIL}`,
      hints: [
        { en: "Wrap fresh.executescript(dump_text) in try / except sqlite3.Error and return the \"does not run\" line from the except branch.", ar: "ضع fresh.executescript(dump_text) داخل try / except sqlite3.Error وأعد سطر \"does not run\" من فرع except." },
        { en: "The restored tables are listed in sqlite_master: SELECT name FROM sqlite_master WHERE type = 'table'. Put the names in a set and test each manifest table against it.", ar: "الجداول المستعادة مدرجة في sqlite_master: SELECT name FROM sqlite_master WHERE type = 'table'. ضع الأسماء في مجموعة واختبر كل جدول من البيان مقابلها." },
        { en: "For a table that exists, count with SELECT COUNT(*) FROM \"table\" and compare with the manifest. Build the OK line with \" \".join(f\"{t}={n}\" for t, n in expected.items()).", ar: "لكل جدول موجود عُدّ بـ SELECT COUNT(*) FROM \"table\" وقارن بالبيان. وابنِ سطر النجاح بـ \" \".join(f\"{t}={n}\" for t, n in expected.items())." },
      ],
      tests: [
        { name: { en: "A complete dump restores and matches", ar: "نسخة كاملة تُستعاد وتطابق" }, stdin: `${DUMP_HEAD}${DUMP_ORDERS}INSERT INTO "orders" VALUES(4,3,1500);\nCOMMIT;\n`, expected: "restore OK: customers=3 orders=4" },
        { name: { en: "A dump cut off before the end loses a row", ar: "نسخة مقطوعة قبل نهايتها تفقد صفاً" }, stdin: `${DUMP_HEAD}${DUMP_ORDERS}`, expected: "restore FAILED: orders has 3 rows, manifest says 4" },
        { name: { en: "A corrupted dump does not run", ar: "نسخة تالفة لا تعمل" }, stdin: `-- manifest: customers=3 orders=4\nBEGIN TRANSACTION;\nCREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nINSERT INTO "customers" VALUES(1,'Amal');\nINSERT INTO "customers" VALUES(2,'Bil\n`, expected: "restore FAILED: the dump does not run" },
        { name: { en: "A table the backup job forgot", ar: "جدول نسيته مهمة النسخ" }, stdin: `${DUMP_HEAD}COMMIT;\n`, expected: "restore FAILED: table orders is missing" },
        { name: { en: "An empty table is fine when the manifest says 0", ar: "الجدول الفارغ سليم حين يقول البيان 0" }, stdin: `-- manifest: customers=2 orders=0\nBEGIN TRANSACTION;\nCREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nINSERT INTO "customers" VALUES(1,'Amal');\nINSERT INTO "customers" VALUES(2,'Bilal');\nCREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), total_cents INTEGER NOT NULL);\nCOMMIT;\n`, expected: "restore OK: customers=2 orders=0" },
      ],
      sampleInput: `${DUMP_HEAD}${DUMP_ORDERS}`,
    },
    {
      type: "text",
      body: {
        en: `## Point-in-time recovery

A nightly backup alone can only take you back to last night. **Point-in-time recovery** gets you to any moment since then, by combining two things:

1. a **base backup** (a physical copy taken at some point), and
2. the **archive of the write-ahead log** (WAL): every change the database made after that, in order.

To recover, you restore the base backup and **replay** the archived log up to a **target time**, for example the second before someone ran \`DELETE FROM products\` by mistake.

\`\`\`text
00:00 base backup     09:00 T1 commits     10:15 T2 commits       14:06 T5: the accidental DELETE
   │──────────────────────│────────────────────│──────────────────────────│──────────▶ archived WAL
   restore here, then replay ────────────────────────────────▶ stop at 14:05:59
\`\`\`

Replay applies only **committed** work. A transaction that rolled back, or that had not committed by the target time, leaves no trace, exactly as atomicity promises. In PostgreSQL you enable continuous archiving (\`archive_mode\` with \`archive_command\` or \`archive_library\`), take base backups with \`pg_basebackup\`, and recover by setting \`restore_command\` and \`recovery_target_time\`. By default (\`recovery_target_inclusive = on\`) a transaction that committed exactly at the target time is included. MySQL does the same by replaying its binary log with \`mysqlbinlog\`.

PITR also explains the RPO of a backup design: you can lose at most the log that had not been archived yet. Archive every few minutes, or stream it continuously, and the RPO shrinks to match.`,
        ar: `## الاسترداد إلى نقطة زمنية

النسخة الليلية وحدها لا تعيدك إلا إلى الليلة الماضية. أما **الاسترداد إلى نقطة زمنية** فيوصلك إلى أي لحظة بعدها، بالجمع بين أمرين:

1. **نسخة أساسية (base backup)**: نسخة فيزيائية أُخذت في لحظة ما، و
2. **أرشيف سجل الكتابة المسبقة (WAL)**: كل تغيير أجرته القاعدة بعد ذلك، بالترتيب.

وللاسترداد تستعيد النسخة الأساسية ثم **تعيد تشغيل** السجل المؤرشف حتى **زمن مستهدف**، مثل الثانية التي سبقت تنفيذ أحدهم \`DELETE FROM products\` بالخطأ.

\`\`\`text
00:00 base backup     09:00 T1 commits     10:15 T2 commits       14:06 T5: the accidental DELETE
   │──────────────────────│────────────────────│──────────────────────────│──────────▶ archived WAL
   restore here, then replay ────────────────────────────────▶ stop at 14:05:59
\`\`\`

إعادة التشغيل لا تطبّق إلا العمل **الملتزم به**. فالمعاملة التي تراجعت، أو التي لم تلتزم حتى الزمن المستهدف، لا تترك أثراً، تماماً كما تعد الذرّية. وفي PostgreSQL تفعّل الأرشفة المستمرة (\`archive_mode\` مع \`archive_command\` أو \`archive_library\`)، وتأخذ النسخ الأساسية بـ \`pg_basebackup\`، وتسترد بضبط \`restore_command\` و\`recovery_target_time\`. وافتراضياً (\`recovery_target_inclusive = on\`) تُضمَّن المعاملة التي التزمت في الزمن المستهدف بالضبط. وتفعل MySQL الشيء نفسه بإعادة تشغيل سجلها الثنائي (binary log) بـ \`mysqlbinlog\`.

ويفسّر PITR أيضاً قيمة RPO لتصميم النسخ: لا يمكنك أن تخسر أكثر من السجل الذي لم يُؤرشف بعد. أرشِف كل بضع دقائق، أو ابثّه بثاً مستمراً، فيصغر RPO بالقدر نفسه.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `# Worst-case data loss (RPO) and restore time (RTO) of three strategies, for one database.
# These are EXAMPLE figures: measure your own sizes and speeds in a real restore drill.
size_gb = 200
logical_restore_gb_per_min = 1      # re-runs every INSERT and rebuilds every index
physical_restore_gb_per_min = 4     # copies data files back
replay_min_per_log_hour = 3         # time to replay one hour of archived WAL

strategies = [
    # name, worst-case minutes of lost data, minutes to be back online
    ("nightly logical dump", 24 * 60, size_gb / logical_restore_gb_per_min),
    ("nightly base backup + WAL archived every 5 min", 5,
     size_gb / physical_restore_gb_per_min + 24 * replay_min_per_log_hour),
    ("synchronous replica, promoted on failure", 0, 1),
]

target_rpo, target_rto = 15, 60      # what the business asked for, in minutes
print(f"targets: lose at most {target_rpo} min of data, be back within {target_rto} min")
for name, rpo, rto in strategies:
    ok = "meets both" if rpo <= target_rpo and rto <= target_rto else "misses a target"
    print(f"{name:48} RPO {rpo:>5.0f} min   RTO {rto:>4.0f} min   {ok}")
print("but only a backup brings back a table that was dropped by mistake:")
print("the replica replays the DROP within seconds.")`,
      explanation: {
        en: "With these example figures the nightly dump misses both targets, PITR fixes the data loss but replaying a day of log keeps the restore slow, and only the standby replica meets both. Yet the last lines matter most: the replica would have copied the mistake, so a real design combines a replica for failures with backups and PITR for bad changes. Change the targets and sizes to see how the choice moves.",
        ar: "بهذه الأرقام المثالية تخطئ النسخة الليلية الهدفين، ويعالج PITR خسارة البيانات لكن إعادة تشغيل سجل يوم كامل تُبقي الاستعادة بطيئة، ولا يحقق الهدفين إلا النسخة المتماثلة الاحتياطية. غير أن الأسطر الأخيرة هي الأهم: كانت النسخة المتماثلة ستنسخ الخطأ، لذلك يجمع التصميم الحقيقي بين نسخة متماثلة للأعطال، ونسخ احتياطية مع PITR للتغييرات السيئة. غيّر الأهداف والأحجام لترى كيف يتغير الاختيار.",
      },
    },
    {
      type: "lab",
      id: "pitr-replay",
      lang: "python",
      prompt: {
        en: `The base backup (products \`Notebook\` 10, \`Pen\` 50, \`Backpack\` 5) is already restored. Now replay the **archived log** to a target time. Each record is \`(time, tx, statement)\` in log order, and \`statement\` is SQL, \`COMMIT\` or \`ROLLBACK\`. Transactions interleave, and one of them is an accidental \`DELETE\`.

Write \`recover(records, target)\` so it:

- ignores every record later than \`target\` (times are \`HH:MM:SS\` and compare as strings)
- applies a transaction's statements only when its \`COMMIT\` is reached **at or before** the target (inclusive, as in PostgreSQL)
- forgets a transaction on \`ROLLBACK\`, and drops any transaction with no \`COMMIT\` by the target
- returns the replayed transaction ids **in commit order**

**Input:** \`target HH:MM:SS\`, then the log. **Output:** \`replayed: ...\` and the products.

Example: target \`14:05:59\` replays \`T1 T2\`: Lamp is there, Pen is still 50, and nothing was deleted.`,
        ar: `النسخة الأساسية (المنتجات \`Notebook\` = 10 و\`Pen\` = 50 و\`Backpack\` = 5) مستعادة أصلاً. والآن أعد تشغيل **السجل المؤرشف** حتى زمن مستهدف. كل سجل \`(time, tx, statement)\` بترتيب السجل، و\`statement\` إما SQL أو \`COMMIT\` أو \`ROLLBACK\`. والمعاملات متداخلة، وإحداها \`DELETE\` نُفّذ بالخطأ.

اكتب \`recover(records, target)\` بحيث:

- تتجاهل كل سجل أحدث من \`target\` (الأزمنة بصيغة \`HH:MM:SS\` وتُقارن نصوصاً)
- تطبّق عبارات المعاملة فقط حين تصل إلى \`COMMIT\` الخاص بها **في الزمن المستهدف أو قبله** (شاملاً، كما في PostgreSQL)
- تنسى المعاملة عند \`ROLLBACK\`، وتُسقط أي معاملة ليس لها \`COMMIT\` حتى الزمن المستهدف
- تُرجع معرّفات المعاملات المعاد تشغيلها **بترتيب التزامها**

**الدخل:** \`target HH:MM:SS\` ثم السجل. **الخرج:** \`replayed: ...\` ثم المنتجات.

مثال: الزمن المستهدف \`14:05:59\` يعيد تشغيل \`T1 T2\`: يوجد Lamp، ويبقى Pen عند 50، ولم يُحذف شيء.`,
      },
      starterCode: `${PITR_SEED}

def recover(records, target):
    """Replay committed work up to target (inclusive). Return the replayed tx ids in commit order."""
    # TODO: this replays EVERY statement up to the target, including work that was
    # rolled back or not yet committed at the target time. Instead, collect each
    # transaction's statements and run them only when its COMMIT record is reached
    # (at or before the target). Forget a transaction on ROLLBACK, and drop whatever
    # has no COMMIT by the target. Return the replayed tx ids in commit order.
    replayed = []
    for time, tx, statement in records:
        if time <= target and statement not in ("COMMIT", "ROLLBACK"):
            db.execute(statement)
            if tx not in replayed:
                replayed.append(tx)
    return replayed
${PITR_TAIL}`,
      solution: `${PITR_SEED}

def recover(records, target):
    """Replay committed work up to target (inclusive). Return the replayed tx ids in commit order."""
    pending = {}                      # tx -> its statements seen so far, not yet committed
    replayed = []
    for time, tx, statement in records:
        if time > target:
            break                     # the log is in time order: everything after is too late
        if statement == "COMMIT":
            for sql in pending.pop(tx, []):
                db.execute(sql)       # a transaction takes effect at its commit, all at once
            replayed.append(tx)
        elif statement == "ROLLBACK":
            pending.pop(tx, None)     # rolled back: as if it never happened
        else:
            pending.setdefault(tx, []).append(statement)
    return replayed                   # whatever is still pending was not committed in time
${PITR_TAIL}`,
      hints: [
        { en: "Keep a dict pending = {tx: [statements]}. For an SQL record, append the statement to pending[tx] instead of running it.", ar: "احتفظ بقاموس pending = {tx: [statements]}. ولسجل SQL ألحق العبارة بـ pending[tx] بدل تنفيذها." },
        { en: "On COMMIT, run every statement in pending.pop(tx, []) and append tx to the result. On ROLLBACK, just pending.pop(tx, None).", ar: "عند COMMIT نفّذ كل عبارة في pending.pop(tx, []) وألحق tx بالنتيجة. وعند ROLLBACK اكتفِ بـ pending.pop(tx, None)." },
        { en: "Stop the loop at the first record with time > target. Anything left in pending afterwards had not committed in time, so it is simply never run.", ar: "أوقف الحلقة عند أول سجل زمنه > target. وكل ما يبقى في pending بعد ذلك لم يلتزم في الوقت المناسب، فلا يُنفَّذ أبداً ببساطة." },
      ],
      tests: [
        { name: { en: "Stop one second before the accidental DELETE", ar: "توقف قبل الحذف الخاطئ بثانية" }, stdin: `target 14:05:59\n${DAY_LOG}`, expected: "replayed: T1 T2\nBackpack: 5\nLamp: 7\nNotebook: 8\nPen: 50" },
        { name: { en: "A commit exactly at the target is included", ar: "الالتزام في الزمن المستهدف بالضبط مشمول" }, stdin: `target 09:00:01\n${DAY_LOG}`, expected: "replayed: T1\nBackpack: 5\nNotebook: 8\nPen: 50" },
        { name: { en: "Transactions not committed by the target leave no trace", ar: "المعاملات غير الملتزمة حتى الزمن المستهدف لا تترك أثراً" }, stdin: `target 10:15:02\n${DAY_LOG}`, expected: "replayed: T1\nBackpack: 5\nNotebook: 8\nPen: 50" },
        { name: { en: "Before the first commit: the base backup as it was", ar: "قبل أول التزام: النسخة الأساسية كما هي" }, stdin: `target 08:59:59\n${DAY_LOG}`, expected: "replayed: (none)\nBackpack: 5\nNotebook: 10\nPen: 50" },
        { name: { en: "Replaying everything repeats the accident, in commit order", ar: "إعادة تشغيل كل شيء تكرر الحادث بترتيب الالتزام" }, stdin: `target 23:59:59\n${DAY_LOG}`, expected: "replayed: T1 T2 T5 T4\nPen: 70" },
      ],
      sampleInput: `target 14:05:59\n${DAY_LOG}`,
    },
    {
      type: "text",
      body: {
        en: `## Replication: a primary and its replicas

With **replication**, one server, the **primary**, accepts writes and streams its changes to one or more **replicas** (also called standbys) that apply them in the same order. PostgreSQL's streaming replication ships the WAL; MySQL replicas read the primary's binary log. Replicas give you two things: a **warm copy** ready to take over when the primary fails, and extra servers for **read-only queries** (in PostgreSQL, a hot standby).

\`\`\`text
                writes             WAL / binlog stream
   app ──────────────────▶ PRIMARY ──────┬──────────────▶ replica A  (failover candidate, reads)
                                         └──────────────▶ replica B  (another zone, reads)
   app ◀──────────── reads that may lag ──────────────── replicas
\`\`\`

**Synchronous or asynchronous?**

- **Asynchronous:** the primary confirms a commit without waiting for replicas. Fast, but a replica can be behind, and if the primary dies, the commits it had not shipped yet are **lost** on failover. That gap is your RPO.
- **Synchronous:** the commit waits until at least one replica confirms it (PostgreSQL: \`synchronous_standby_names\`; MySQL offers semi-synchronous replication). Committed data survives the loss of the primary, but every commit pays a network round trip, and if the synchronous replica is unreachable, commits wait.

**Replication lag** is how far a replica is behind. It means a user can save a change and then not see it, because the next read went to a lagging replica. The usual cure is **read-your-writes**: send a user's reads to the primary for a short time after they write, or only to a replica that has already replayed their write's log position. Monitor lag (PostgreSQL's \`pg_stat_replication\` view shows it per replica) and alert on it.

## Failover and high availability

**Failover** promotes a replica to be the new primary when the old one fails. Choose the **healthiest, most up-to-date** replica, because with asynchronous replication anything newer than its last replayed commit is lost. Then point the application at the new primary and rebuild a new replica, so you are protected again.

The great danger is **split brain**: the old primary was only unreachable, not dead, and now **two** servers accept writes that conflict. Automatic failover tools prevent this with **quorum** (a majority of nodes in a consensus store such as etcd must agree, as Patroni does for PostgreSQL) and **fencing**, which makes sure the old primary can no longer accept writes. **High availability** is the result of all this: redundancy across machines and zones, tested failover, and monitoring, sized to the RTO. One more useful trick is a **delayed replica** (PostgreSQL's \`recovery_min_apply_delay\`), which stays an hour behind on purpose so a bad change can be caught before it reaches it.`,
        ar: `## النسخ المتماثل: خادم أساسي ونسخه المتماثلة

مع **النسخ المتماثل** يقبل خادم واحد، هو **الخادم الأساسي (primary)**، الكتابات ويبثّ تغييراته إلى **نسخة متماثلة (replica)** أو أكثر (تُسمى أيضاً standby) تطبّقها بالترتيب نفسه. ينقل النسخ المتماثل المتدفق في PostgreSQL سجل WAL؛ وتقرأ النسخ المتماثلة في MySQL السجل الثنائي للخادم الأساسي. وتمنحك النسخ المتماثلة أمرين: **نسخة دافئة** جاهزة لتتولى العمل حين يتعطل الخادم الأساسي، وخوادم إضافية لـ **الاستعلامات القرائية فقط** (في PostgreSQL تسمى hot standby).

\`\`\`text
                writes             WAL / binlog stream
   app ──────────────────▶ PRIMARY ──────┬──────────────▶ replica A  (failover candidate, reads)
                                         └──────────────▶ replica B  (another zone, reads)
   app ◀──────────── reads that may lag ──────────────── replicas
\`\`\`

**متزامن أم غير متزامن؟**

- **غير المتزامن (asynchronous):** يؤكد الخادم الأساسي الالتزام دون انتظار النسخ المتماثلة. سريع، لكن النسخة المتماثلة قد تتأخر، وإن مات الخادم الأساسي **ضاعت** عند التحويل الالتزامات التي لم يكن قد أرسلها بعد. تلك الفجوة هي RPO لديك.
- **المتزامن (synchronous):** ينتظر الالتزام حتى تؤكده نسخة متماثلة واحدة على الأقل (في PostgreSQL: \`synchronous_standby_names\`؛ وتقدّم MySQL نسخاً متماثلاً شبه متزامن). تبقى البيانات الملتزم بها بعد فقدان الخادم الأساسي، لكن كل التزام يدفع ثمن رحلة شبكة ذهاباً وإياباً، وإن تعذر الوصول إلى النسخة المتزامنة انتظرت الالتزامات.

**تأخر النسخ المتماثل (replication lag)** هو مقدار تأخر النسخة المتماثلة. ومعناه أن المستخدم قد يحفظ تغييراً ثم لا يراه، لأن القراءة التالية ذهبت إلى نسخة متأخرة. والعلاج المعتاد هو **قراءة ما كتبته (read-your-writes)**: أرسل قراءات المستخدم إلى الخادم الأساسي لمدة قصيرة بعد أن يكتب، أو فقط إلى نسخة متماثلة أعادت تشغيل موضع كتابته في السجل. وراقب التأخر (يُظهره عرض \`pg_stat_replication\` في PostgreSQL لكل نسخة) وأطلق تنبيهاً عليه.

## التحويل عند العطل والتوفر العالي

**التحويل عند العطل (failover)** يرقّي نسخة متماثلة لتصير الخادم الأساسي الجديد حين يتعطل القديم. اختر النسخة **الأسلم والأحدث**، لأنه مع النسخ غير المتزامن يضيع كل ما هو أحدث من آخر التزام أعادت تشغيله. ثم وجّه التطبيق إلى الخادم الأساسي الجديد وابنِ نسخة متماثلة جديدة، كي تعود محمياً.

والخطر الأكبر هو **انقسام الدماغ (split brain)**: الخادم الأساسي القديم كان متعذر الوصول فقط لا ميتاً، والآن يقبل **خادمان** كتابات متعارضة. وتمنع أدوات التحويل التلقائي ذلك بـ **النصاب (quorum)**، أي أن توافق أغلبية العقد في مخزن إجماع مثل etcd، كما يفعل Patroni مع PostgreSQL، وبـ **العزل (fencing)** الذي يضمن أن الخادم القديم لم يعد قادراً على قبول الكتابات. و**التوفر العالي (high availability)** هو حصيلة ذلك كله: تكرار عبر الآلات والمناطق، وتحويل مُختبَر، ومراقبة، بحجم يناسب RTO. وثمة حيلة مفيدة أخرى هي **النسخة المتماثلة المؤخَّرة (delayed replica)** (\`recovery_min_apply_delay\` في PostgreSQL)، التي تبقى متأخرة ساعة عمداً كي يُكتشف التغيير السيئ قبل أن يصل إليها.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// A primary and an asynchronous replica that applies each change 2 seconds late.
const LAG = 2;
const primary = { log: [], data: {} };
const replica = { applied: 0, data: {} };

function write(key, value, now) {
  primary.log.push({ key, value, at: now });
  primary.data[key] = value;
  return primary.log.length; // the position of this write in the log (like an LSN)
}

function catchUp(now) {
  while (replica.applied < primary.log.length && primary.log[replica.applied].at + LAG <= now) {
    const change = primary.log[replica.applied];
    replica.data[change.key] = change.value;
    replica.applied += 1;
  }
}

// Reads go to the replica unless it has not yet replayed the position the caller needs.
function read(key, now, needPosition = 0) {
  catchUp(now);
  if (replica.applied >= needPosition) return replica.data[key] + "  (replica)";
  return primary.data[key] + "  (primary: replica is behind)";
}

write("name:7", "Amal", -60);                      // an old value, long replicated
const myWrite = write("name:7", "Amal Haddad", 0); // the user renames herself at t=0

console.log("t=1 any replica read:     ", read("name:7", 1));
console.log("t=1 read-your-writes read:", read("name:7", 1, myWrite));
console.log("t=2 any replica read:     ", read("name:7", 2));`,
      explanation: {
        en: "One second after the rename, a plain replica read still returns the old name: that is replication lag as users see it. The read-your-writes read knows the log position of the user's own write, sees the replica has not reached it, and asks the primary instead. At t=2 the replica has caught up and both answers agree. Set LAG to 0 to model a fully caught-up replica.",
        ar: "بعد ثانية من تغيير الاسم ما زالت القراءة العادية من النسخة المتماثلة تُرجع الاسم القديم: هذا هو تأخر النسخ المتماثل كما يراه المستخدمون. أما قراءة «ما كتبته» فتعرف موضع كتابة المستخدم نفسه في السجل، وترى أن النسخة لم تصل إليه، فتسأل الخادم الأساسي بدلاً منها. وفي t=2 تكون النسخة قد لحقت ويتفق الجوابان. اضبط LAG على 0 لتحاكي نسخة لحقت تماماً.",
      },
    },
    {
      type: "lab",
      id: "failover-plan",
      lang: "python",
      prompt: {
        en: `The primary has failed. You know the time of its **last commit**, and for every replica the time of the **last commit it replayed** and whether it is \`healthy\` or \`down\`. The business set an **RPO** in seconds. The program already prints each replica's lag (times are converted to seconds for you), then calls \`plan_failover(primary, replicas, rpo)\`, where \`replicas\` is a list of \`(name, replayed, status)\`.

Write \`plan_failover\` so it returns the decision lines:

- if no replica is healthy: \`promote: none, restore from the latest backup\`
- otherwise promote the healthy replica with the **most recent** replayed commit (on a tie, the alphabetically smaller name): \`promote: NAME\`
- then \`data loss: Ns (RPO Rs met)\`, or \`violated\`, where \`N = primary - replayed\` of the promoted replica, and the RPO is met when \`N <= R\`

Example: with RPO 5, primary at 12:00:30 and healthy \`r1\` at 12:00:27, you get \`promote: r1\` and \`data loss: 3s (RPO 5s met)\`.`,
        ar: `تعطل الخادم الأساسي. أنت تعرف زمن **آخر التزام** له، ولكل نسخة متماثلة زمن **آخر التزام أعادت تشغيله** وهل هي \`healthy\` (سليمة) أو \`down\` (معطلة). وحدّد العمل قيمة **RPO** بالثواني. يطبع البرنامج تأخر كل نسخة أصلاً (الأزمنة محوّلة إلى ثوانٍ لأجلك)، ثم يستدعي \`plan_failover(primary, replicas, rpo)\`، حيث \`replicas\` قائمة من \`(name, replayed, status)\`.

اكتب \`plan_failover\` لتُرجع أسطر القرار:

- إن لم تكن أي نسخة سليمة: \`promote: none, restore from the latest backup\`
- وإلا فرقِّ النسخة السليمة صاحبة **أحدث** التزام معاد تشغيله (وعند التعادل الاسم الأصغر أبجدياً): \`promote: NAME\`
- ثم \`data loss: Ns (RPO Rs met)\` أو \`violated\`، حيث \`N = primary - replayed\` للنسخة المرقّاة، ويتحقق RPO حين \`N <= R\`

مثال: مع RPO = 5، والخادم الأساسي عند 12:00:30، والنسخة السليمة \`r1\` عند 12:00:27، تحصل على \`promote: r1\` و\`data loss: 3s (RPO 5s met)\`.`,
      },
      starterCode: `${FAILOVER_SEED}

def plan_failover(primary, replicas, rpo):
    """The lines that describe the failover decision."""
    # TODO: this promotes whichever replica is listed first, even a dead one.
    #  - only "healthy" replicas may be promoted; with none: "promote: none, restore from the latest backup"
    #  - pick the one with the most recent replayed commit; on a tie, the smaller name
    #  - loss = primary - replayed; add "data loss: Ns (RPO Rs met)" or "... violated" (met when loss <= rpo)
    name = replicas[0][0]
    return [f"promote: {name}"]
${FAILOVER_TAIL}`,
      solution: `${FAILOVER_SEED}

def plan_failover(primary, replicas, rpo):
    """The lines that describe the failover decision."""
    healthy = [(name, replayed) for name, replayed, status in replicas if status == "healthy"]
    if not healthy:
        return ["promote: none, restore from the latest backup"]
    # most up-to-date first (largest replayed time); ties go to the smaller name
    name, replayed = min(healthy, key=lambda r: (-r[1], r[0]))
    loss = primary - replayed                  # commits the new primary never received
    verdict = "met" if loss <= rpo else "violated"
    return [f"promote: {name}", f"data loss: {loss}s (RPO {rpo}s {verdict})"]
${FAILOVER_TAIL}`,
      hints: [
        { en: "First keep only the healthy replicas: [(name, replayed) for name, replayed, status in replicas if status == \"healthy\"]. If that list is empty, return the backup line.", ar: "أبقِ أولاً النسخ السليمة فقط: [(name, replayed) for name, replayed, status in replicas if status == \"healthy\"]. وإن كانت القائمة فارغة فأعد سطر النسخة الاحتياطية." },
        { en: "Pick the best with min(healthy, key=lambda r: (-r[1], r[0])): the minus sign prefers the largest replayed time, and the name breaks ties.", ar: "اختر الأفضل بـ min(healthy, key=lambda r: (-r[1], r[0])): إشارة السالب تفضّل أكبر زمن معاد تشغيله، والاسم يحسم التعادل." },
        { en: "loss = primary - replayed. The verdict is \"met\" when loss <= rpo, otherwise \"violated\". Return both lines in a list.", ar: "loss = primary - replayed. والحكم \"met\" حين loss <= rpo، وإلا \"violated\". وأعد السطرين في قائمة." },
      ],
      tests: [
        { name: { en: "Skip the down replica, promote the freshest healthy one", ar: "تخطَّ النسخة المعطلة ورقِّ أحدث نسخة سليمة" }, stdin: "rpo 5\nprimary 12:00:30\nr1 12:00:27 healthy\nr2 12:00:30 down\nr3 12:00:20 healthy\n", expected: "r1: lag 3s, healthy\nr2: lag 0s, down\nr3: lag 10s, healthy\npromote: r1\ndata loss: 3s (RPO 5s met)" },
        { name: { en: "A tie goes to the smaller name; zero loss", ar: "التعادل للاسم الأصغر؛ وخسارة صفرية" }, stdin: "rpo 0\nprimary 08:15:00\ndb-b 08:15:00 healthy\ndb-a 08:15:00 healthy\ndb-c 08:14:58 healthy\n", expected: "db-b: lag 0s, healthy\ndb-a: lag 0s, healthy\ndb-c: lag 2s, healthy\npromote: db-a\ndata loss: 0s (RPO 0s met)" },
        { name: { en: "The best replica is still too far behind: RPO violated", ar: "أفضل نسخة ما زالت متأخرة كثيراً: RPO منتهَك" }, stdin: "rpo 5\nprimary 23:59:50\nr1 23:59:42 healthy\nr2 23:59:31 healthy\n", expected: "r1: lag 8s, healthy\nr2: lag 19s, healthy\npromote: r1\ndata loss: 8s (RPO 5s violated)" },
        { name: { en: "No healthy replica: fall back to the backup", ar: "لا نسخة سليمة: ارجع إلى النسخة الاحتياطية" }, stdin: "rpo 60\nprimary 03:00:00\nr1 02:59:59 down\nr2 02:58:00 down\n", expected: "r1: lag 1s, down\nr2: lag 120s, down\npromote: none, restore from the latest backup" },
        { name: { en: "Exactly at the RPO counts as met", ar: "المساواة لقيمة RPO تُعدّ تحقيقاً له" }, stdin: "rpo 30\nprimary 10:00:00\nreplica-east 09:59:31 down\nreplica-west 09:59:30 healthy\n", expected: "replica-east: lag 29s, down\nreplica-west: lag 30s, healthy\npromote: replica-west\ndata loss: 30s (RPO 30s met)" },
      ],
      sampleInput: "rpo 5\nprimary 12:00:30\nr1 12:00:27 healthy\nr2 12:00:30 down\nr3 12:00:20 healthy\n",
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "The business says: \"We can lose at most 10 minutes of orders, and we must be back online within 2 hours.\" Which numbers are these?", ar: "يقول العمل: «يمكننا أن نخسر 10 دقائق من الطلبات على الأكثر، ويجب أن نعود للعمل خلال ساعتين.» ما هذان الرقمان؟" },
          choices: [
            { en: "RPO = 2 hours, RTO = 10 minutes", ar: "RPO = ساعتان وRTO = عشر دقائق" },
            { en: "Both are the replication lag", ar: "كلاهما تأخر النسخ المتماثل" },
            { en: "RPO = 10 minutes, RTO = 2 hours", ar: "RPO = عشر دقائق وRTO = ساعتان" },
            { en: "Both are the backup retention period", ar: "كلاهما مدة الاحتفاظ بالنسخ الاحتياطية" },
          ],
          answer: 2,
          explain: {
            en: "RPO (Recovery Point Objective) is the acceptable data loss measured in time: 10 minutes. RTO (Recovery Time Objective) is the acceptable downtime: 2 hours. Together they decide between nightly backups, log archiving and standby replicas.",
            ar: "RPO (هدف نقطة الاسترداد) هو خسارة البيانات المقبولة مقيسةً بالزمن: عشر دقائق. وRTO (هدف زمن الاسترداد) هو مدة التوقف المقبولة: ساعتان. ومعاً يحددان الاختيار بين النسخ الليلية وأرشفة السجل والنسخ المتماثلة الاحتياطية.",
          },
        },
        {
          q: { en: "Someone runs DROP TABLE orders on the primary. The database has two replicas. What saves you?", ar: "ينفّذ أحدهم DROP TABLE orders على الخادم الأساسي. للقاعدة نسختان متماثلتان. ما الذي ينقذك؟" },
          choices: [
            { en: "Promoting one of the replicas", ar: "ترقية إحدى النسختين المتماثلتين" },
            { en: "A backup with point-in-time recovery to the moment before the DROP", ar: "نسخة احتياطية مع استرداد إلى اللحظة التي سبقت الـ DROP" },
            { en: "Restarting the primary", ar: "إعادة تشغيل الخادم الأساسي" },
            { en: "Switching the replicas to synchronous mode", ar: "تحويل النسخ المتماثلة إلى الوضع المتزامن" },
          ],
          answer: 1,
          explain: {
            en: "Replicas apply every change within seconds, so the DROP has already reached them. Only a backup plus the archived log lets you restore the state just before the mistake. Replicas protect against failed machines, backups against bad changes.",
            ar: "تطبّق النسخ المتماثلة كل تغيير خلال ثوانٍ، فقد وصلها الـ DROP أصلاً. ولا يتيح لك استعادة الحالة التي سبقت الخطأ مباشرة إلا نسخة احتياطية مع السجل المؤرشف. النسخ المتماثلة تحمي من الآلات المعطلة، والنسخ الاحتياطية من التغييرات السيئة.",
          },
        },
        {
          q: { en: "With asynchronous replication, the primary crashes and a replica that was 4 seconds behind is promoted. What happens to the last 4 seconds of commits?", ar: "مع النسخ المتماثل غير المتزامن يتعطل الخادم الأساسي وتُرقّى نسخة كانت متأخرة 4 ثوانٍ. ماذا يحدث لالتزامات آخر 4 ثوانٍ؟" },
          choices: [
            { en: "They are lost: the new primary never received them", ar: "تضيع: لم يتلقها الخادم الأساسي الجديد قط" },
            { en: "The replica fetches them from the crashed primary automatically", ar: "تجلبها النسخة المتماثلة من الخادم المتعطل تلقائياً" },
            { en: "They are replayed from the application's memory", ar: "يُعاد تشغيلها من ذاكرة التطبيق" },
          ],
          answer: 0,
          explain: {
            en: "Asynchronous replication confirms commits before replicas have them, so whatever had not been shipped is gone when the primary dies. That gap is the RPO of the design; synchronous replication closes it at the cost of commit latency.",
            ar: "النسخ المتماثل غير المتزامن يؤكد الالتزامات قبل أن تصل إلى النسخ المتماثلة، فكل ما لم يُرسل يضيع حين يموت الخادم الأساسي. تلك الفجوة هي RPO للتصميم؛ والنسخ المتزامن يسدها مقابل زمن الالتزام.",
          },
        },
        {
          q: { en: "A user saves a new address, reloads the page and sees the old address. Reads are served by replicas. What is the most likely cause and fix?", ar: "يحفظ مستخدم عنواناً جديداً، ثم يعيد تحميل الصفحة فيرى العنوان القديم. القراءات تخدمها النسخ المتماثلة. ما السبب الأرجح والإصلاح؟" },
          choices: [
            { en: "The write failed; retry it until the address appears", ar: "فشلت الكتابة؛ أعد المحاولة حتى يظهر العنوان" },
            { en: "The browser cache; tell users to clear it", ar: "ذاكرة المتصفح المؤقتة؛ اطلب من المستخدمين مسحها" },
            { en: "The index on the address column is missing", ar: "الفهرس على عمود العنوان مفقود" },
            { en: "Replication lag; route the user's reads to the primary (or a caught-up replica) right after they write", ar: "تأخر النسخ المتماثل؛ وجّه قراءات المستخدم إلى الخادم الأساسي (أو نسخة لحقت) مباشرة بعد أن يكتب" },
          ],
          answer: 3,
          explain: {
            en: "The write reached the primary, but the replica serving the next read had not replayed it yet. Read-your-writes consistency fixes this by reading from the primary for a short time after a write, or only from a replica that has reached the write's log position.",
            ar: "وصلت الكتابة إلى الخادم الأساسي، لكن النسخة التي خدمت القراءة التالية لم تكن قد أعادت تشغيلها بعد. واتساق «قراءة ما كتبته» يصلح ذلك بالقراءة من الخادم الأساسي لمدة قصيرة بعد الكتابة، أو فقط من نسخة وصلت إلى موضع الكتابة في السجل.",
          },
        },
        {
          q: { en: "Your nightly backup job has reported \"success\" every night for a year. What actually proves you can recover?", ar: "أبلغت مهمة النسخ الليلية عن «نجاح» كل ليلة لمدة عام. ما الذي يثبت فعلاً أنك تستطيع الاسترداد؟" },
          choices: [
            { en: "The size of the backup files growing every month", ar: "تزايد حجم ملفات النسخ كل شهر" },
            { en: "The green status in the job scheduler", ar: "الحالة الخضراء في مجدول المهام" },
            { en: "A regular restore drill into a fresh server, checked against row counts or checksums and timed", ar: "تدريب استعادة منتظم إلى خادم جديد، يُتحقق منه بأعداد الصفوف أو مجاميع التحقق ويُقاس زمنه" },
            { en: "Keeping three copies in the same data centre", ar: "الاحتفاظ بثلاث نسخ في مركز البيانات نفسه" },
          ],
          answer: 2,
          explain: {
            en: "A job can succeed while dumping the wrong database, missing a schema or writing an unreadable file. Only restoring proves the backup works, and timing the drill tells you your real RTO. Three copies in one data centre also break the off-site part of the 3-2-1 rule.",
            ar: "قد تنجح المهمة وهي تنسخ القاعدة الخطأ، أو يفوتها مخطط، أو تكتب ملفاً غير مقروء. والاستعادة وحدها تثبت أن النسخة تعمل، وقياس زمن التدريب يخبرك بـ RTO الحقيقي. كما أن ثلاث نسخ في مركز بيانات واحد تخالف شرط النسخة خارج الموقع في قاعدة 3-2-1.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap and what to practice next

- **RPO** is how much data you may lose, **RTO** how long you may be down; both are business decisions that pick the design.
- **Logical** backups are portable and slower to restore; **physical** backups are fast and version-bound. Take consistent backups with the right tools, follow **3-2-1**, keep one copy immutable, and encrypt them.
- A backup is only a hope until a **restore drill** proves it, checked against counts or checksums, and timed.
- **PITR** restores a base backup and replays the archived WAL to a target time; only committed transactions come back.
- **Replication** keeps warm copies: asynchronous is fast but can lose the lag on failover, synchronous protects commits at a latency cost. Handle **lag** with read-your-writes, and **fail over** to the healthiest, most up-to-date replica while guarding against split brain.
- Replicas protect against failed machines, backups against bad changes: you need both.

**Practice next:** extend the failover lab so a replica in another data centre is preferred only when it is as fresh as the local one. In the PITR lab, add a target given as a transaction id ("stop just before T5"). Then move on to security: backups and replicas are full copies of your data, so the next lesson's least privilege, encryption and audit trails apply to them too.`,
        ar: `## الخلاصة وما تتدرب عليه بعد ذلك

- **RPO** مقدار البيانات الذي يجوز أن تخسره، و**RTO** المدة التي يجوز أن تتوقف فيها؛ وكلاهما قرار عمل يختار التصميم.
- النسخ **المنطقية** قابلة للنقل وأبطأ استعادة؛ والنسخ **الفيزيائية** سريعة ومرتبطة بالإصدار. خذ نسخاً متسقة بالأدوات الصحيحة، واتبع **3-2-1**، وأبقِ نسخة غير قابلة للتعديل، وشفّرها.
- النسخة الاحتياطية مجرد أمل حتى يثبتها **تدريب استعادة**، يُتحقق منه بالأعداد أو مجاميع التحقق ويُقاس زمنه.
- **PITR** يستعيد نسخة أساسية ثم يعيد تشغيل سجل WAL المؤرشف حتى زمن مستهدف؛ ولا تعود إلا المعاملات الملتزم بها.
- **النسخ المتماثل** يحفظ نسخاً دافئة: غير المتزامن سريع لكنه قد يخسر مقدار التأخر عند التحويل، والمتزامن يحمي الالتزامات مقابل زمن الاستجابة. عالج **التأخر** بقراءة ما كتبته، و**حوّل عند العطل** إلى النسخة الأسلم والأحدث مع الحذر من انقسام الدماغ.
- النسخ المتماثلة تحمي من الآلات المعطلة، والنسخ الاحتياطية من التغييرات السيئة: وأنت تحتاج الاثنين.

**تدرّب بعد ذلك:** وسّع مختبر التحويل كي تُفضَّل النسخة التي في مركز بيانات آخر فقط حين تكون بحداثة النسخة المحلية. وفي مختبر PITR أضف زمناً مستهدفاً يُعطى معرّفَ معاملة («توقف قبل T5 مباشرة»). ثم انتقل إلى الأمان: النسخ الاحتياطية والمتماثلة نسخ كاملة من بياناتك، فتنطبق عليها أيضاً أقل صلاحية والتشفير وسجلات التدقيق في الدرس التالي.`,
      },
    },
  ],
};
