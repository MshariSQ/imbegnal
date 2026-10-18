import type { Lesson } from "../types";

// A small product collection whose documents do not share one shape, plus the helper
// that follows dotted paths. The learner writes the matcher (MongoDB-style semantics).
const CATALOG_SEED = `import json
import sys

# A tiny "products" collection: documents do not all have the same fields.
products = [
    {"_id": 1, "name": "Laptop Air", "category": "laptop", "price": 1200,
     "tags": ["ultralight", "work"], "specs": {"ram_gb": 16, "cores": 8}},
    {"_id": 2, "name": "Laptop Pro", "category": "laptop", "price": 2400,
     "tags": ["work", "creator"], "specs": {"ram_gb": 32, "cores": 12}},
    {"_id": 3, "name": "Desk Lamp", "category": "home", "price": 35, "tags": ["office"]},
    {"_id": 4, "name": "T-Shirt", "category": "clothing", "price": 15,
     "sizes": ["S", "M", "L"], "color": "navy"},
    {"_id": 5, "name": "Gaming Laptop", "category": "laptop", "price": 1800,
     "tags": ["gaming"], "specs": {"ram_gb": 32, "cores": 16, "gpu": "discrete"}},
    {"_id": 6, "name": "Hoodie", "category": "clothing", "price": 40,
     "sizes": ["M", "L", "XL"], "color": "black"},
]

MISSING = object()   # marks "this path does not exist in the document"


def get_path(doc, path):
    """Follow a dotted path such as "specs.ram_gb"; return MISSING if any step is absent."""
    value = doc
    for key in path.split("."):
        if not isinstance(value, dict) or key not in value:
            return MISSING
        value = value[key]
    return value
`;

const CATALOG_TAIL = `

# stdin: a query document in JSON, for example {"category": "laptop", "price": {"$lt": 2000}}
query = json.loads(sys.stdin.read())
found = [doc for doc in products if matches(doc, query)]
for doc in found:
    print(doc["_id"], doc["name"])
print("count:", len(found))
`;

const SHOP_SEED = `import json
import sqlite3
import sys

# The shop's normalized tables (the source of truth).
db = sqlite3.connect(":memory:")
db.executescript("""
    CREATE TABLE customers (
        id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, city TEXT NOT NULL
    );
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        placed_on TEXT NOT NULL
    );
    CREATE TABLE order_lines (
        id          INTEGER PRIMARY KEY,
        order_id    INTEGER NOT NULL REFERENCES orders(id),
        product     TEXT NOT NULL,
        qty         INTEGER NOT NULL,
        price_cents INTEGER NOT NULL          -- the price paid, frozen at purchase time
    );
    INSERT INTO customers VALUES
        (7, 'Amal', 'amal@example.com', 'Cairo'), (8, 'Bilal', 'bilal@example.com', 'Amman');
    INSERT INTO orders VALUES
        (1001, 7, '2025-03-02'), (1002, 8, '2025-03-05'), (1003, 7, '2025-03-09'), (1004, 8, '2025-03-11');
    INSERT INTO order_lines (order_id, product, qty, price_cents) VALUES
        (1001, 'Notebook', 2, 450), (1001, 'Pen', 5, 125), (1002, 'Backpack', 1, 3000),
        (1004, 'Stapler', 1, 1200), (1004, 'Eraser', 3, 90), (1004, 'Marker', 2, 220);
""")
`;

const SHOP_TAIL = `

# stdin: an order id
order_id = int(sys.stdin.read())
doc = build_order_doc(order_id)
print(json.dumps(doc, sort_keys=True) if doc else f"order {order_id} not found")
`;

const GRAPH_SEED = `import sys

# stdin: one friendship per line ("Amal Bilal" means they are friends, both ways),
# then a final line "? <name>": the person who wants friend suggestions.
graph = {}                      # adjacency sets: name -> set of friends
person = None
for line in sys.stdin.read().splitlines():
    parts = line.split()
    if len(parts) != 2:
        continue
    if parts[0] == "?":
        person = parts[1]
    else:
        a, b = parts
        graph.setdefault(a, set()).add(b)
        graph.setdefault(b, set()).add(a)
`;

const GRAPH_TAIL = `

suggestions = suggest(graph, person)
if not suggestions:
    print("no suggestions")
for name, count in suggestions:
    print(f"{name} ({count} mutual)")
`;

export const lesson: Lesson = {
  nodeId: "nosql-models",
  title: { en: "NoSQL: Document, Key-Value, Graph", ar: "NoSQL: مخازن المستندات والمفتاح-قيمة والبيانية" },
  estMinutes: 45,
  sections: [
    {
      type: "text",
      body: {
        en: `## One shop, four filing systems 🗂️

An online shop keeps its orders in a relational database, and that works well. Then three new problems arrive. The **product catalogue** needs different fields for every kind of product: a T-shirt has sizes and a colour, a laptop has memory and cores. **Login sessions and shopping carts** are read thousands of times per second, always by their id and nothing else. And the **"people you may know"** feature has to walk friendships two or three hops deep.

Each problem fits a different kind of store. **NoSQL** ("not only SQL") is the umbrella name for databases that do not use the relational table model. Many of them have a query language too, but they organise data around a different idea.

## What you'll learn

- The four main families: **key-value**, **document**, **wide-column** and **graph** stores, and what each is good at
- How a document database is queried (nested fields, arrays, operators)
- **Embedding versus referencing**, and why **access patterns** drive NoSQL schema design
- The trade-offs against SQL: consistency, transactions, joins and schema

The labs are in Python: you write a MongoDB-style query matcher, shape relational rows into an order document, and run a friends-of-friends graph query.

## The four families

- **Key-value** stores are a giant dictionary: a **key** points to a **value** the database does not look inside. You \`GET\`, \`SET\` and \`DELETE\` by key, often with an expiry time (TTL). Examples: Redis, Memcached, Amazon DynamoDB. Good for sessions, carts, caches, counters and feature flags. Weak at any question other than "give me the value for this key".
- **Document** stores keep self-contained **documents** (JSON-like; MongoDB stores a binary form called BSON) with nested objects and arrays. Documents in one **collection** need not share the same fields. You can query and index any field. Examples: MongoDB, Couchbase, Firestore. Good for aggregates that are read and written together, such as an order with its lines.
- **Wide-column** stores group rows into **partitions** by a partition key and keep the rows of a partition sorted, spreading partitions across many machines. Examples: Apache Cassandra, ScyllaDB, Apache HBase, Google Bigtable. Good for huge write volumes: event logs, sensor readings, chat messages.
- **Graph** databases store **nodes** and **relationships** (edges), both with properties, and queries **walk** the relationships. Examples: Neo4j (query language Cypher) and Amazon Neptune; ISO standardised a graph query language, GQL, as ISO/IEC 39075:2024. Good for social networks, recommendations, fraud rings and dependency graphs.

The same fact, "Amal ordered two notebooks", in each shape:

\`\`\`text
key-value    "cart:amal"  ->  "notebook x2"                  (an opaque value)
document     { _id: "amal", name: "Amal", orders: [ { item: "notebook", qty: 2 } ] }
wide-column  partition "amal" | 2025-03-02 -> notebook x2 | 2025-03-09 -> pen x5
graph        (Amal:Person) -[:ORDERED {qty: 2}]-> (Notebook:Product)
\`\`\``,
        ar: `## متجر واحد وأربعة أنظمة حفظ 🗂️

يحفظ متجر إلكتروني طلباته في قاعدة بيانات علائقية، وهذا يعمل جيداً. ثم تصل ثلاث مشكلات جديدة. **كتالوج المنتجات** يحتاج حقولاً مختلفة لكل نوع من المنتجات: للقميص مقاسات ولون، وللحاسوب المحمول ذاكرة وأنوية. و**جلسات الدخول وسلال التسوق** تُقرأ آلاف المرات في الثانية، دائماً بمعرّفها ولا شيء غيره. وميزة **«أشخاص قد تعرفهم»** يجب أن تمشي على علاقات الصداقة قفزتين أو ثلاثاً.

كل مشكلة تناسب نوعاً مختلفاً من المخازن. و**NoSQL** («ليس SQL فقط») اسم جامع لقواعد البيانات التي لا تستخدم نموذج الجداول العلائقي. كثير منها له لغة استعلام أيضاً، لكنها تنظّم البيانات حول فكرة مختلفة.

## ماذا ستتعلم

- العائلات الأربع الرئيسية: مخازن **المفتاح-قيمة (key-value)** و**المستندات (document)** و**العمود العريض (wide-column)** و**البيانية (graph)**، وفيمَ تتفوق كل منها
- كيف تُستعلَم قاعدة بيانات المستندات (الحقول المتداخلة والمصفوفات وعوامل المقارنة)
- **التضمين مقابل الإحالة (embedding vs referencing)**، ولماذا تقود **أنماط الوصول (access patterns)** تصميم مخطط NoSQL
- المفاضلات مقابل SQL: الاتساق والمعاملات والربط والمخطط

المختبرات ببايثون: تكتب مطابِق استعلامات على طريقة MongoDB، وتشكّل صفوفاً علائقية في مستند طلب، وتنفّذ استعلام «أصدقاء الأصدقاء» على مخطط بياني.

## العائلات الأربع

- مخازن **المفتاح-قيمة** قاموس عملاق: **مفتاح** يشير إلى **قيمة** لا تنظر القاعدة داخلها. تنفّذ \`GET\` و\`SET\` و\`DELETE\` بالمفتاح، وغالباً مع مدة صلاحية (TTL). أمثلة: Redis وMemcached وAmazon DynamoDB. مناسبة للجلسات والسلال والذاكرة المؤقتة والعدّادات ومفاتيح تفعيل الميزات. وضعيفة في أي سؤال غير «أعطني القيمة لهذا المفتاح».
- مخازن **المستندات** تحفظ **مستندات** مكتفية بذاتها (شبيهة بـ JSON؛ وتخزّن MongoDB صيغة ثنائية اسمها BSON) فيها كائنات ومصفوفات متداخلة. ولا يلزم أن تتشارك مستندات **المجموعة (collection)** الواحدة الحقول نفسها. ويمكنك الاستعلام عن أي حقل وفهرسته. أمثلة: MongoDB وCouchbase وFirestore. مناسبة للتجميعات التي تُقرأ وتُكتب معاً، مثل طلب مع بنوده.
- مخازن **العمود العريض** تجمع الصفوف في **أقسام (partitions)** بحسب مفتاح التقسيم (partition key)، وتُبقي صفوف كل قسم مرتبة، وتوزّع الأقسام على آلات كثيرة. أمثلة: Apache Cassandra وScyllaDB وApache HBase وGoogle Bigtable. مناسبة لأحجام الكتابة الهائلة: سجلات الأحداث وقراءات الحساسات ورسائل الدردشة.
- قواعد البيانات **البيانية** تخزّن **عُقداً (nodes)** و**علاقات (relationships)** أي حوافاً، لكلٍّ منها خصائص، والاستعلامات **تمشي** على العلاقات. أمثلة: Neo4j (لغة استعلامها Cypher) وAmazon Neptune؛ وقد وحّدت ISO لغة استعلام بيانية اسمها GQL في المعيار ISO/IEC 39075:2024. مناسبة للشبكات الاجتماعية والتوصيات وحلقات الاحتيال ومخططات الاعتماديات.

الحقيقة نفسها، «طلبت أمل دفترين»، بكل شكل:

\`\`\`text
key-value    "cart:amal"  ->  "notebook x2"                  (an opaque value)
document     { _id: "amal", name: "Amal", orders: [ { item: "notebook", qty: 2 } ] }
wide-column  partition "amal" | 2025-03-02 -> notebook x2 | 2025-03-09 -> pen x5
graph        (Amal:Person) -[:ORDERED {qty: 2}]-> (Notebook:Product)
\`\`\``,
      },
    },
    {
      type: "text",
      body: {
        en: `## Querying a document store

In MongoDB you query a collection with a **query document**: you describe the documents you want, field by field.

\`\`\`js
db.products.find({ category: "laptop", price: { $lt: 2000 } })  // every field must match (AND)
db.products.find({ "specs.ram_gb": 32 })      // dot notation reaches into embedded documents
db.products.find({ tags: "work" })            // matches when the tags array CONTAINS "work"
db.products.find({ category: { $in: ["home", "clothing"] } })
db.products.createIndex({ category: 1, price: 1 })   // secondary indexes, as in SQL
\`\`\`

Three rules make this work:

- A query document is an implicit **AND**: a document matches only if every listed field matches.
- A **dotted path** such as \`"specs.ram_gb"\` follows embedded objects. A document without that path does not match a value or a comparison (one exception: \`{ field: null }\` also matches documents that lack the field).
- A plain value matches an **array** field when **any element** equals it. Operators such as \`$gt\`, \`$gte\`, \`$lt\`, \`$lte\` and \`$in\` take an object instead of a value.

**"Schemaless" really means schema-on-read.** The database will accept a product with \`prise\` instead of \`price\`, but your code will not find it. The structure still exists, it just lives in your application, so serious projects add validation (MongoDB supports \`$jsonSchema\` validators) and handle documents written in older shapes.`,
        ar: `## الاستعلام في مخزن المستندات

في MongoDB تستعلم مجموعةً بـ **مستند استعلام (query document)**: يصف المستندات التي تريدها حقلاً حقلاً.

\`\`\`js
db.products.find({ category: "laptop", price: { $lt: 2000 } })  // every field must match (AND)
db.products.find({ "specs.ram_gb": 32 })      // dot notation reaches into embedded documents
db.products.find({ tags: "work" })            // matches when the tags array CONTAINS "work"
db.products.find({ category: { $in: ["home", "clothing"] } })
db.products.createIndex({ category: 1, price: 1 })   // secondary indexes, as in SQL
\`\`\`

ثلاث قواعد تجعل ذلك يعمل:

- مستند الاستعلام **AND** ضمني: لا يطابق المستند إلا إذا طابق كل حقل مذكور.
- **المسار المنقّط (dotted path)** مثل \`"specs.ram_gb"\` يتبع الكائنات المضمّنة. والمستند الذي ليس فيه هذا المسار لا يطابق قيمةً ولا مقارنة (باستثناء واحد: \`{ field: null }\` يطابق أيضاً المستندات التي ليس فيها الحقل).
- القيمة المجردة تطابق حقل **مصفوفة** حين يساويها **أي عنصر** فيها. والعوامل مثل \`$gt\` و\`$gte\` و\`$lt\` و\`$lte\` و\`$in\` تأخذ كائناً بدل القيمة.

**«بلا مخطط (schemaless)» تعني في الحقيقة المخطط عند القراءة (schema-on-read).** ستقبل القاعدة منتجاً فيه \`prise\` بدل \`price\`، لكن كودك لن يجده. فالبنية لا تزال موجودة، لكنها تعيش في تطبيقك، لذلك تضيف المشاريع الجادة تحققاً (تدعم MongoDB مدقّقات \`$jsonSchema\`) وتتعامل مع المستندات المكتوبة بأشكال أقدم.`,
      },
    },
    {
      type: "lab",
      id: "document-query",
      lang: "python",
      prompt: {
        en: `A \`products\` collection of six documents exists; not every document has the same fields. The helper \`get_path(doc, "specs.ram_gb")\` returns a nested value, or \`MISSING\` when the path does not exist.

Complete \`matches(doc, query)\` so it follows MongoDB's rules for these cases:

- every field of the query must match (implicit AND), and a \`MISSING\` path never matches (this lab never queries for \`null\`)
- a **dotted path** reaches into embedded documents
- a plain value matches an **array** field when **any element** matches
- an **operator object** such as \`{"$gte": 35, "$lt": 2000}\` supports \`$gt\`, \`$gte\`, \`$lt\`, \`$lte\` and \`$in\` (the value is one of a list); all its operators must hold

**Input:** one query document in JSON.

**Output:** \`ID NAME\` for each match in collection order, then \`count: N\`.

Example: \`{"tags": "work"}\` prints \`1 Laptop Air\`, \`2 Laptop Pro\` and \`count: 2\`.`,
        ar: `توجد مجموعة \`products\` من ستة مستندات؛ وليست لكل المستندات الحقول نفسها. الدالة المساعدة \`get_path(doc, "specs.ram_gb")\` تُرجع قيمة متداخلة، أو \`MISSING\` حين لا يوجد المسار.

أكمل \`matches(doc, query)\` لتتبع قواعد MongoDB في هذه الحالات:

- يجب أن يطابق كل حقل في الاستعلام (AND ضمني)، والمسار \`MISSING\` لا يطابق أبداً (لا يستعلم هذا المختبر عن \`null\`)
- **المسار المنقّط** يصل إلى داخل المستندات المضمّنة
- القيمة المجردة تطابق حقل **مصفوفة** حين يطابق **أي عنصر** فيها
- **كائن العوامل** مثل \`{"$gte": 35, "$lt": 2000}\` يدعم \`$gt\` و\`$gte\` و\`$lt\` و\`$lte\` و\`$in\` (القيمة واحدة من قائمة)؛ ويجب أن تتحقق كل عوامله

**الدخل:** مستند استعلام واحد بصيغة JSON.

**الخرج:** \`ID NAME\` لكل مستند مطابق بترتيب المجموعة، ثم \`count: N\`.

مثال: \`{"tags": "work"}\` يطبع \`1 Laptop Air\` و\`2 Laptop Pro\` و\`count: 2\`.`,
      },
      starterCode: `${CATALOG_SEED}

def matches(doc, query):
    """True when the document satisfies EVERY field of the query (an implicit AND)."""
    # TODO: this only handles top-level equality. Add, step by step:
    #  1. dotted paths ("specs.ram_gb"): use get_path(doc, path); MISSING never matches
    #  2. array fields: {"tags": "work"} matches when the list CONTAINS "work"
    #  3. operator objects: {"price": {"$lt": 2000}} with $gt, $gte, $lt, $lte and $in
    for path, condition in query.items():
        if doc.get(path) != condition:
            return False
    return True
${CATALOG_TAIL}`,
      solution: `${CATALOG_SEED}

def match_value(value, condition):
    """Does one field value satisfy one condition (a plain value or an operator object)?"""
    if value is MISSING:
        return False                                   # an absent field never matches
    if isinstance(value, list):                        # an array matches if ANY element does
        return value == condition or any(match_value(item, condition) for item in value)
    if isinstance(condition, dict) and all(key.startswith("$") for key in condition):
        # operators: {"$gte": 35, "$lt": 2000} (any other object is compared as a whole)
        for op, arg in condition.items():
            if op == "$in":
                ok = value in arg
            elif op == "$gt":
                ok = value > arg
            elif op == "$gte":
                ok = value >= arg
            elif op == "$lt":
                ok = value < arg
            elif op == "$lte":
                ok = value <= arg
            else:
                raise ValueError("unsupported operator " + op)
            if not ok:
                return False
        return True
    return value == condition


def matches(doc, query):
    """True when the document satisfies EVERY field of the query (an implicit AND)."""
    return all(match_value(get_path(doc, path), condition) for path, condition in query.items())
${CATALOG_TAIL}`,
      hints: [
        { en: "Split the work: a helper match_value(value, condition) for ONE field, and matches() returns all(match_value(get_path(doc, path), cond) for path, cond in query.items()).", ar: "قسّم العمل: دالة مساعدة match_value(value, condition) لحقل واحد، وتُرجع matches() القيمة all(match_value(get_path(doc, path), cond) for path, cond in query.items())." },
        { en: "In match_value: return False for MISSING; if value is a list, return any(match_value(item, condition) for item in value); otherwise compare.", ar: "في match_value: أعد False عند MISSING؛ وإن كانت القيمة قائمة فأعد any(match_value(item, condition) for item in value)؛ وإلا فقارن." },
        { en: "If condition is a dict, loop over its items: \"$in\" means value in arg, \"$gt\" means value > arg, and so on. Return False as soon as one operator fails.", ar: "إن كان الشرط قاموساً فمرّ على عناصره: \"$in\" تعني value in arg، و\"$gt\" تعني value > arg، وهكذا. أعد False فور فشل أي عامل." },
      ],
      tests: [
        { name: { en: "Top-level equality", ar: "مساواة في المستوى الأعلى" }, stdin: "{\"category\": \"laptop\"}\n", expected: "1 Laptop Air\n2 Laptop Pro\n5 Gaming Laptop\ncount: 3" },
        { name: { en: "Dotted path into an embedded document", ar: "مسار منقّط إلى داخل مستند مضمّن" }, stdin: "{\"specs.ram_gb\": 32}\n", expected: "2 Laptop Pro\n5 Gaming Laptop\ncount: 2" },
        { name: { en: "An array field matches by element", ar: "حقل المصفوفة يطابق بعنصر منه" }, stdin: "{\"tags\": \"work\"}\n", expected: "1 Laptop Air\n2 Laptop Pro\ncount: 2" },
        { name: { en: "Equality AND an operator", ar: "مساواة وعامل معاً (AND)" }, stdin: "{\"category\": \"laptop\", \"price\": {\"$lt\": 2000}}\n", expected: "1 Laptop Air\n5 Gaming Laptop\ncount: 2" },
        { name: { en: "$in and $gte together", ar: "$in و$gte معاً" }, stdin: "{\"category\": {\"$in\": [\"home\", \"clothing\"]}, \"price\": {\"$gte\": 35}}\n", expected: "3 Desk Lamp\n6 Hoodie\ncount: 2" },
        { name: { en: "Missing paths never match; $in on an array field", ar: "المسارات المفقودة لا تطابق؛ و$in على حقل مصفوفة" }, stdin: "{\"specs.ram_gb\": {\"$gt\": 8}, \"tags\": {\"$in\": [\"gaming\", \"creator\"]}}\n", expected: "2 Laptop Pro\n5 Gaming Laptop\ncount: 2" },
      ],
      sampleInput: "{\"category\": \"laptop\", \"price\": {\"$lt\": 2000}}\n",
    },
    {
      type: "text",
      body: {
        en: `## Embed or reference?

The biggest design decision in a document database is whether related data lives **inside** a document (**embedding**) or in **another document** that you point to by id (**referencing**).

\`\`\`text
Embedded: one read shows the page            Referenced: one read per document
orders: {                                     orders:    { _id: 1001, customer_id: 7, line_ids: [...] }
  _id: 1001,                                  customers: { _id: 7, name: "Amal", email: ... }
  customer: { id: 7, name: "Amal" },          lines:     { _id: 31, order_id: 1001, product: ... }
  lines: [ { product: "Notebook", qty: 2 },
           { product: "Pen", qty: 5 } ]
}
\`\`\`

**Embed** when the data is read together, the relationship is one-to-few, the child has no life of its own (an order line without its order), and its size stays bounded.

**Reference** when the relationship is many-to-many, the list can grow without limit (the comments of a viral post: MongoDB caps a document at 16 MiB), or the data is shared and updated on its own (a customer's email).

A useful middle way is the **extended reference**: store the id **plus** the few fields the page shows, such as \`{ id: 7, name: "Amal" }\`. Every copy is redundancy, though, and the update anomaly from the normalization lesson comes back: if Amal changes her name, every copy must be found and fixed. Copy only what rarely changes, or what *should* be frozen, like the price an order was paid at.

### Access patterns come first

In a relational database you normalize first and can then ask almost any question with joins. In most NoSQL stores, joins are limited or missing, so you work the other way round:

1. **List the queries** the application runs most: "show an order page", "list a customer's last 10 orders".
2. **Shape the data** so each frequent query reads **one document** or **one partition**.
3. Accept **duplication** where it buys those fast reads, and keep it in sync on purpose.

That is why a Cassandra design often has one table **per query**. DynamoDB reaches the same goal another way: AWS recommends as few tables as possible, in most cases a single table whose keys are designed so that each access pattern reads one partition. Either way, a design that is perfect for one access pattern can be painful for a question nobody planned.`,
        ar: `## تضمين أم إحالة؟

أكبر قرار تصميمي في قاعدة بيانات المستندات هو أن تعيش البيانات المرتبطة **داخل** المستند (**التضمين embedding**) أو في **مستند آخر** تشير إليه بمعرّفه (**الإحالة referencing**).

\`\`\`text
Embedded: one read shows the page            Referenced: one read per document
orders: {                                     orders:    { _id: 1001, customer_id: 7, line_ids: [...] }
  _id: 1001,                                  customers: { _id: 7, name: "Amal", email: ... }
  customer: { id: 7, name: "Amal" },          lines:     { _id: 31, order_id: 1001, product: ... }
  lines: [ { product: "Notebook", qty: 2 },
           { product: "Pen", qty: 5 } ]
}
\`\`\`

**ضمّن** حين تُقرأ البيانات معاً، وتكون العلاقة واحداً-إلى-قليل، ولا تكون للابن حياة مستقلة (بند طلب بلا طلبه)، ويبقى حجمها محدوداً.

**أحِل** حين تكون العلاقة متعدداً-إلى-متعدد، أو يمكن أن تنمو القائمة بلا حد (تعليقات منشور منتشر: تحدّ MongoDB حجم المستند بـ 16 MiB)، أو تكون البيانات مشتركة وتُحدَّث وحدها (بريد العميل الإلكتروني).

وثمة طريق وسط مفيد هو **الإحالة الموسّعة (extended reference)**: خزّن المعرّف **مع** الحقول القليلة التي تعرضها الصفحة، مثل \`{ id: 7, name: "Amal" }\`. لكن كل نسخة تكرار، فيعود شذوذ التحديث من درس التطبيع: إن غيّرت أمل اسمها فيجب العثور على كل نسخة وإصلاحها. انسخ فقط ما يندر أن يتغير، أو ما *ينبغي* أن يُجمَّد، مثل السعر الذي دُفع به الطلب.

### أنماط الوصول أولاً

في القاعدة العلائقية تطبّع أولاً ثم تستطيع طرح أي سؤال تقريباً بالربط. أما في معظم مخازن NoSQL فالربط محدود أو غائب، فتعمل بالاتجاه المعاكس:

1. **اسرد الاستعلامات** التي ينفّذها التطبيق أكثر: «اعرض صفحة طلب»، «اعرض آخر 10 طلبات لعميل».
2. **شكّل البيانات** بحيث يقرأ كل استعلام متكرر **مستنداً واحداً** أو **قسماً واحداً**.
3. اقبل **التكرار** حيث يشتري هذه القراءات السريعة، وأبقِه متزامناً عن قصد.

لهذا كثيراً ما يكون في تصميم Cassandra جدول **لكل استعلام**. وتبلغ DynamoDB الهدف نفسه بطريقة أخرى: توصي AWS بأقل عدد ممكن من الجداول، وفي أغلب الحالات جدول واحد تُصمَّم مفاتيحه بحيث يقرأ كل نمط وصول قسماً واحداً. وفي الحالتين قد يكون التصميم المثالي لنمط وصول واحد مؤلماً لسؤال لم يخطط له أحد.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `# Rendering one order page: referenced documents versus one embedded document.
customers = {7: {"name": "Amal", "email": "amal@example.com"}}
products = {"P1": {"name": "Notebook", "price": 450}, "P2": {"name": "Pen", "price": 125}}
orders = {1001: {"customer_id": 7, "lines": [{"product_id": "P1", "qty": 2}, {"product_id": "P2", "qty": 5}]}}

reads = 0


def get(collection, key):
    global reads
    reads += 1                     # every get is one round trip to the database
    return collection[key]


order = get(orders, 1001)
customer = get(customers, order["customer_id"])
lines = [(get(products, line["product_id"]), line["qty"]) for line in order["lines"]]
print("referenced:", reads, "reads for", customer["name"], [p["name"] for p, _ in lines])

# Embedded: the order document already carries what the page shows.
order_docs = {
    1001: {
        "customer": {"id": 7, "name": "Amal"},
        "lines": [{"product": "Notebook", "price": 450, "qty": 2}, {"product": "Pen", "price": 125, "qty": 5}],
    }
}
reads = 0
doc = get(order_docs, 1001)
print("embedded:  ", reads, "read  for", doc["customer"]["name"], [line["product"] for line in doc["lines"]])

# The price of embedding: Amal changes her name, and every copy must be found and fixed.
customers[7]["name"] = "Amal H."
print("customer record now says:", customers[7]["name"], "| old order copy says:", doc["customer"]["name"])`,
      explanation: {
        en: "The referenced design needs four round trips (order, customer, two products) where the embedded one needs one, and the gap grows with every line. The last line shows the bill: the copy of Amal's name inside the order is now stale until some code updates it.",
        ar: "يحتاج التصميم بالإحالة أربع رحلات ذهاب وإياب (الطلب والعميل ومنتجان) بينما يحتاج التصميم المضمَّن رحلة واحدة، ويتسع الفارق مع كل بند. ويُظهر السطر الأخير الفاتورة: نسخة اسم أمل داخل الطلب صارت قديمة إلى أن يحدّثها كود ما.",
      },
    },
    {
      type: "lab",
      id: "order-document",
      lang: "python",
      prompt: {
        en: `The shop's normalized tables \`customers\`, \`orders\` and \`order_lines\` exist in SQLite. The order page is the most frequent query, so you will serve it from **one document per order**.

Write \`build_order_doc(order_id)\` so it returns \`None\` for an unknown order, otherwise a dictionary with exactly these keys:

- \`_id\` and \`placed_on\` from the order
- \`customer\`: an **extended reference** with only \`id\` and \`name\` (no email or city)
- \`lines\`: the **embedded** order lines, each \`{"product", "qty", "price_cents"}\`, in the order they were added (by line \`id\`); an order without lines has \`[]\`
- \`total_cents\`: the sum of \`qty * price_cents\`

**Input:** an order id. **Output:** the document as JSON with sorted keys, or \`order N not found\`.

Example: order \`1002\` prints \`{"_id": 1002, "customer": {"id": 8, "name": "Bilal"}, "lines": [{"price_cents": 3000, "product": "Backpack", "qty": 1}], "placed_on": "2025-03-05", "total_cents": 3000}\`.`,
        ar: `توجد جداول المتجر المطبّعة \`customers\` و\`orders\` و\`order_lines\` في SQLite. صفحة الطلب هي الاستعلام الأكثر تكراراً، لذلك ستخدمها من **مستند واحد لكل طلب**.

اكتب \`build_order_doc(order_id)\` لتُرجع \`None\` لطلب غير موجود، وإلا فقاموساً بهذه المفاتيح بالضبط:

- \`_id\` و\`placed_on\` من الطلب
- \`customer\`: **إحالة موسّعة** فيها \`id\` و\`name\` فقط (بلا بريد ولا مدينة)
- \`lines\`: بنود الطلب **مضمّنة**، كل منها \`{"product", "qty", "price_cents"}\`، بترتيب إضافتها (بحسب \`id\` البند)؛ والطلب الذي بلا بنود قيمته \`[]\`
- \`total_cents\`: مجموع \`qty * price_cents\`

**الدخل:** معرّف طلب. **الخرج:** المستند بصيغة JSON بمفاتيح مرتبة، أو \`order N not found\`.

مثال: الطلب \`1002\` يطبع \`{"_id": 1002, "customer": {"id": 8, "name": "Bilal"}, "lines": [{"price_cents": 3000, "product": "Backpack", "qty": 1}], "placed_on": "2025-03-05", "total_cents": 3000}\`.`,
      },
      starterCode: `${SHOP_SEED}

def build_order_doc(order_id):
    """One document with everything the order page shows, or None if there is no such order."""
    # TODO: this is just the orders row. Shape it for the order page:
    #  - "customer": {"id": ..., "name": ...}  (only those two fields, not email or city)
    #  - "lines": [{"product", "qty", "price_cents"}, ...] in the order they were added (by id)
    #  - "total_cents": the sum of qty * price_cents over the lines
    #  and drop "customer_id": the customer object replaces it.
    row = db.execute("SELECT id, placed_on, customer_id FROM orders WHERE id = ?", (order_id,)).fetchone()
    if row is None:
        return None
    return {"_id": row[0], "placed_on": row[1], "customer_id": row[2]}
${SHOP_TAIL}`,
      solution: `${SHOP_SEED}

def build_order_doc(order_id):
    """One document with everything the order page shows, or None if there is no such order."""
    row = db.execute(
        "SELECT o.id, o.placed_on, c.id, c.name FROM orders o "
        "JOIN customers c ON c.id = o.customer_id WHERE o.id = ?",
        (order_id,),
    ).fetchone()
    if row is None:
        return None
    oid, placed_on, customer_id, customer_name = row
    lines = [
        {"product": product, "qty": qty, "price_cents": price}
        for product, qty, price in db.execute(
            "SELECT product, qty, price_cents FROM order_lines WHERE order_id = ? ORDER BY id",
            (order_id,),
        )
    ]
    return {
        "_id": oid,
        "placed_on": placed_on,
        "customer": {"id": customer_id, "name": customer_name},   # extended reference: id + what we show
        "lines": lines,                                           # embedded: always read with the order
        "total_cents": sum(line["qty"] * line["price_cents"] for line in lines),
    }
${SHOP_TAIL}`,
      hints: [
        { en: "Join orders with customers to get the order and the customer's id and name in one query: ... FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.id = ?", ar: "اربط orders مع customers لتحصل على الطلب ومعرّف العميل واسمه في استعلام واحد: ... FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.id = ?" },
        { en: "Run a second query for the lines: SELECT product, qty, price_cents FROM order_lines WHERE order_id = ? ORDER BY id, and turn each row into a small dict.", ar: "نفّذ استعلاماً ثانياً للبنود: SELECT product, qty, price_cents FROM order_lines WHERE order_id = ? ORDER BY id، وحوّل كل صف إلى قاموس صغير." },
        { en: "Build the result with keys _id, placed_on, customer, lines and total_cents; total_cents = sum(l[\"qty\"] * l[\"price_cents\"] for l in lines) is 0 for an empty list.", ar: "ابنِ النتيجة بالمفاتيح _id وplaced_on وcustomer وlines وtotal_cents؛ والمجموع sum(l[\"qty\"] * l[\"price_cents\"] for l in lines) يساوي 0 للقائمة الفارغة." },
      ],
      tests: [
        { name: { en: "An order with two lines", ar: "طلب ببندين" }, stdin: "1001\n", expected: "{\"_id\": 1001, \"customer\": {\"id\": 7, \"name\": \"Amal\"}, \"lines\": [{\"price_cents\": 450, \"product\": \"Notebook\", \"qty\": 2}, {\"price_cents\": 125, \"product\": \"Pen\", \"qty\": 5}], \"placed_on\": \"2025-03-02\", \"total_cents\": 1525}" },
        { name: { en: "Another customer's order", ar: "طلب عميل آخر" }, stdin: "1002\n", expected: "{\"_id\": 1002, \"customer\": {\"id\": 8, \"name\": \"Bilal\"}, \"lines\": [{\"price_cents\": 3000, \"product\": \"Backpack\", \"qty\": 1}], \"placed_on\": \"2025-03-05\", \"total_cents\": 3000}" },
        { name: { en: "Lines keep the order they were added in", ar: "البنود تحتفظ بترتيب إضافتها" }, stdin: "1004\n", expected: "{\"_id\": 1004, \"customer\": {\"id\": 8, \"name\": \"Bilal\"}, \"lines\": [{\"price_cents\": 1200, \"product\": \"Stapler\", \"qty\": 1}, {\"price_cents\": 90, \"product\": \"Eraser\", \"qty\": 3}, {\"price_cents\": 220, \"product\": \"Marker\", \"qty\": 2}], \"placed_on\": \"2025-03-11\", \"total_cents\": 1910}" },
        { name: { en: "An order without lines: empty list, total 0", ar: "طلب بلا بنود: قائمة فارغة ومجموع 0" }, stdin: "1003\n", expected: "{\"_id\": 1003, \"customer\": {\"id\": 7, \"name\": \"Amal\"}, \"lines\": [], \"placed_on\": \"2025-03-09\", \"total_cents\": 0}" },
        { name: { en: "Unknown order", ar: "طلب غير موجود" }, stdin: "999\n", expected: "order 999 not found" },
      ],
      sampleInput: "1001\n",
    },
    {
      type: "text",
      body: {
        en: `## Key-value, wide-column and graph in practice

**Key-value (Redis):** the key design is the schema. Names like \`session:<id>\` and \`rate:<user>\` make it obvious what lives where.

\`\`\`text
SET session:9f2c '{"user":"amal"}' EX 1800   # value with a 30-minute expiry
GET session:9f2c
INCR rate:amal                                # atomic counter, no read-modify-write race
EXPIRE rate:amal 60
\`\`\`

**Wide-column (Cassandra, CQL):** the **partition key** decides which machines store a row, and the **clustering column** sorts rows inside the partition. Queries are expected to name the partition key; anything else means scanning the cluster.

\`\`\`sql
CREATE TABLE messages_by_room (
    room_id     text,
    message_id  timeuuid,          -- time-based id: sorts by time and never collides
    author      text,
    body        text,
    PRIMARY KEY ((room_id), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

SELECT author, body FROM messages_by_room WHERE room_id = 'general' LIMIT 50;
\`\`\`

**Graph (Neo4j, Cypher):** relationships are stored as first-class data, so a query that hops through friends of friends follows them directly instead of joining a big table to itself again and again.

\`\`\`text
MATCH (me:Person {name: "Amal"})-[:FRIEND]-(f:Person)-[:FRIEND]-(fof:Person)
WHERE fof <> me AND NOT (me)-[:FRIEND]-(fof)
RETURN fof.name AS suggestion, count(f) AS mutual
ORDER BY mutual DESC, suggestion
\`\`\`

## The trade-offs against SQL

- **Scaling out.** Many NoSQL systems were built to spread data over many machines (**sharding**) from day one. Relational databases scale up well and can be sharded too, with more effort.
- **Consistency.** Distributed stores often copy data asynchronously, so a read may briefly return old data (**eventual consistency**); Cassandra lets each query choose a consistency level such as \`ONE\`, \`QUORUM\` or \`ALL\`. The **CAP theorem** (Brewer's conjecture, proved by Gilbert and Lynch in 2002) says that during a network partition a distributed store must choose between staying consistent and staying available.
- **Transactions.** Support varies: MongoDB has multi-document ACID transactions (since 4.0 for replica sets, 4.2 for sharded clusters), Redis has \`MULTI\`/\`EXEC\`, and Cassandra's lightweight transactions are compare-and-set on one partition. Ask exactly which ACID guarantees you get.
- **Joins and new questions.** Limited or costly; a question nobody planned may need a new document shape or table.
- **Schema.** Flexible to write, but the schema moves into your code, and documents in old shapes stay until you migrate them.

The line is blurry: PostgreSQL's \`jsonb\` type (with GIN indexes) and SQLite's JSON functions give relational databases document features. A sensible default is a relational database, adding a specialised store when a concrete access pattern needs it. Using several stores side by side is called **polyglot persistence**, and its price is running and securing several systems.`,
        ar: `## المفتاح-قيمة والعمود العريض والبياني عملياً

**المفتاح-قيمة (Redis):** تصميم المفاتيح هو المخطط. أسماء مثل \`session:<id>\` و\`rate:<user>\` تجعل واضحاً ما الذي يعيش أين.

\`\`\`text
SET session:9f2c '{"user":"amal"}' EX 1800   # value with a 30-minute expiry
GET session:9f2c
INCR rate:amal                                # atomic counter, no read-modify-write race
EXPIRE rate:amal 60
\`\`\`

**العمود العريض (Cassandra بلغة CQL):** **مفتاح التقسيم (partition key)** يحدد الآلات التي تخزّن الصف، و**عمود التجميع (clustering column)** يرتّب الصفوف داخل القسم. ويُتوقع من الاستعلامات أن تذكر مفتاح التقسيم؛ وأي شيء غير ذلك يعني مسح العنقود (cluster) كله.

\`\`\`sql
CREATE TABLE messages_by_room (
    room_id     text,
    message_id  timeuuid,          -- time-based id: sorts by time and never collides
    author      text,
    body        text,
    PRIMARY KEY ((room_id), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

SELECT author, body FROM messages_by_room WHERE room_id = 'general' LIMIT 50;
\`\`\`

**البياني (Neo4j بلغة Cypher):** العلاقات مخزّنة بيانات من الدرجة الأولى، فالاستعلام الذي يقفز عبر أصدقاء الأصدقاء يتبعها مباشرة بدل ربط جدول كبير بنفسه مرة بعد مرة.

\`\`\`text
MATCH (me:Person {name: "Amal"})-[:FRIEND]-(f:Person)-[:FRIEND]-(fof:Person)
WHERE fof <> me AND NOT (me)-[:FRIEND]-(fof)
RETURN fof.name AS suggestion, count(f) AS mutual
ORDER BY mutual DESC, suggestion
\`\`\`

## المفاضلات مقابل SQL

- **التوسع الأفقي (scaling out).** بُني كثير من أنظمة NoSQL لتوزيع البيانات على آلات كثيرة (**التجزئة sharding**) منذ اليوم الأول. والقواعد العلائقية تتوسع رأسياً جيداً ويمكن تجزئتها أيضاً، بجهد أكبر.
- **الاتساق.** كثيراً ما تنسخ المخازن الموزّعة البيانات بشكل غير متزامن، فقد تُرجع القراءة بيانات قديمة لوقت قصير (**الاتساق النهائي eventual consistency**)؛ وتسمح Cassandra لكل استعلام باختيار مستوى اتساق مثل \`ONE\` أو \`QUORUM\` أو \`ALL\`. وتنص **مبرهنة CAP** (حدسية Brewer التي برهنها Gilbert وLynch عام 2002) على أن المخزن الموزّع أثناء انقسام الشبكة يجب أن يختار بين البقاء متسقاً والبقاء متاحاً.
- **المعاملات.** الدعم متفاوت: في MongoDB معاملات ACID متعددة المستندات (منذ 4.0 لمجموعات النسخ المتماثلة و4.2 للعناقيد المجزّأة)، وفي Redis الأمران \`MULTI\`/\`EXEC\`، والمعاملات الخفيفة في Cassandra مقارنة-وتعيين (compare-and-set) على قسم واحد. اسأل بالضبط عن ضمانات ACID التي تحصل عليها.
- **الربط والأسئلة الجديدة.** محدود أو مكلف؛ وقد يحتاج سؤال لم يخطط له أحد شكلاً جديداً للمستند أو جدولاً جديداً.
- **المخطط.** مرن عند الكتابة، لكن المخطط ينتقل إلى كودك، وتبقى المستندات ذات الأشكال القديمة حتى ترحّلها (migration).

والحد غير واضح: نوع \`jsonb\` في PostgreSQL (مع فهارس GIN) ودوال JSON في SQLite تمنح القواعد العلائقية ميزات من مخازن المستندات. والخيار الافتراضي المعقول قاعدة علائقية، مع إضافة مخزن متخصص حين يحتاجه نمط وصول محدد. ويسمى استخدام عدة مخازن جنباً إلى جنب **الاستمرارية متعددة اللغات (polyglot persistence)**، وثمنه تشغيل عدة أنظمة وتأمينها.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// A key-value store in a few lines: GET/SET by key, optional expiry (TTL), atomic INCR.
const store = new Map();
let now = 0; // seconds, simulated so the demo is instant

function set(key, value, ttlSeconds) {
  store.set(key, { value, expiresAt: ttlSeconds ? now + ttlSeconds : Infinity });
}
function get(key) {
  const entry = store.get(key);
  if (!entry || entry.expiresAt <= now) {
    store.delete(key); // expired keys vanish on their own
    return null;
  }
  return entry.value;
}
function incr(key, ttlSeconds) {
  if (get(key) === null) {
    set(key, 1, ttlSeconds); // first request: start the counter and its time window
    return 1;
  }
  store.get(key).value += 1; // in Redis, INCR is one atomic command
  return store.get(key).value;
}

set("session:9f2c", JSON.stringify({ user: "amal", cart: ["notebook"] }), 1800);
console.log("t=0    ", get("session:9f2c"));
now = 1799;
console.log("t=1799 ", get("session:9f2c") ? "session still valid" : "expired");
now = 1800;
console.log("t=1800 ", get("session:9f2c") ?? "expired: log in again");

// Rate limiting: at most 3 requests per user per 60-second window.
now = 0;
for (let i = 1; i <= 4; i++) {
  console.log("request", i, incr("rate:amal", 60) <= 3 ? "allowed" : "blocked (429)");
}
now = 60;
console.log("new window:", incr("rate:amal", 60) <= 3 ? "allowed" : "blocked (429)");`,
      explanation: {
        en: "The session disappears exactly when its 30-minute TTL runs out, with no cleanup job. The counter shows a classic key-value pattern, a fixed-window rate limiter: the fourth request in a window is refused, and a fresh window starts once the key expires. Note what you cannot do here: ask for all sessions of user amal without scanning every key.",
        ar: "تختفي الجلسة بالضبط حين تنتهي صلاحيتها البالغة 30 دقيقة، دون أي مهمة تنظيف. ويُظهر العدّاد نمطاً كلاسيكياً للمفتاح-قيمة، هو محدِّد معدل بنافذة ثابتة: يُرفض الطلب الرابع في النافذة، وتبدأ نافذة جديدة بعد انتهاء صلاحية المفتاح. ولاحظ ما لا تستطيع فعله هنا: أن تطلب كل جلسات المستخدم amal دون مسح كل المفاتيح.",
      },
    },
    {
      type: "lab",
      id: "friends-of-friends",
      lang: "python",
      prompt: {
        en: `A social graph is given as friendships (each line \`A B\` means A and B are friends, both ways). The program stores it as adjacency sets in \`graph\` and asks \`suggest(graph, person)\` for friend suggestions, the query graph databases are famous for.

Write \`suggest\` so it returns a list of \`(name, mutual_count)\` pairs for every **friend of a friend** who is **not the person** and **not already a friend**. \`mutual_count\` is how many of the person's friends know that candidate. Sort by \`mutual_count\` (highest first), then by name. A person who is not in the graph gets an empty list.

**Input:** friendship lines, then \`? <name>\`.

**Output:** \`Name (N mutual)\` per suggestion, or \`no suggestions\`.

Example: with Amal-Bilal, Amal-Carla, Bilal-Dina, Carla-Dina, Carla-Emad, the query \`? Amal\` prints \`Dina (2 mutual)\` then \`Emad (1 mutual)\`.`,
        ar: `يُعطى مخطط اجتماعي على هيئة صداقات (كل سطر \`A B\` يعني أن A وB صديقان في الاتجاهين). يخزّنه البرنامج مجموعاتِ تجاور في \`graph\` ويطلب من \`suggest(graph, person)\` اقتراحات أصدقاء، وهو الاستعلام الذي تشتهر به قواعد البيانات البيانية.

اكتب \`suggest\` لتُرجع قائمة أزواج \`(name, mutual_count)\` لكل **صديق صديق** **ليس هو الشخص نفسه** و**ليس صديقاً له أصلاً**. و\`mutual_count\` هو عدد أصدقاء الشخص الذين يعرفون ذلك المرشح. رتّب بحسب \`mutual_count\` (الأعلى أولاً) ثم بالاسم. والشخص غير الموجود في المخطط يحصل على قائمة فارغة.

**الدخل:** أسطر الصداقات، ثم \`? <name>\`.

**الخرج:** \`Name (N mutual)\` لكل اقتراح، أو \`no suggestions\`.

مثال: مع الصداقات Amal-Bilal وAmal-Carla وBilal-Dina وCarla-Dina وCarla-Emad، يطبع الاستعلام \`? Amal\` السطر \`Dina (2 mutual)\` ثم \`Emad (1 mutual)\`.`,
      },
      starterCode: `${GRAPH_SEED}

def suggest(graph, person):
    """Friends of friends who are not the person and not already friends, best first."""
    # TODO: this only walks ONE hop, so it suggests people who are already friends.
    # Walk a second hop (the friends of each friend), skip the person and their
    # current friends, count how many mutual friends lead to each candidate, and sort
    # by that count (highest first), then by name.
    friends = graph.get(person, set())
    return [(friend, 1) for friend in sorted(friends)]
${GRAPH_TAIL}`,
      solution: `${GRAPH_SEED}

def suggest(graph, person):
    """Friends of friends who are not the person and not already friends, best first."""
    friends = graph.get(person, set())
    mutual = {}
    for friend in friends:                       # hop 1
        for candidate in graph[friend]:          # hop 2
            if candidate != person and candidate not in friends:
                mutual[candidate] = mutual.get(candidate, 0) + 1
    # most mutual friends first, then alphabetical
    return sorted(mutual.items(), key=lambda item: (-item[1], item[0]))
${GRAPH_TAIL}`,
      hints: [
        { en: "friends = graph.get(person, set()). Then loop over each friend, and inside it over graph[friend]: those are the friends of friends.", ar: "friends = graph.get(person, set()). ثم مرّ على كل صديق، وداخل ذلك على graph[friend]: هؤلاء هم أصدقاء الأصدقاء." },
        { en: "Skip a candidate if it is the person or already in friends. Count the others in a dict: mutual[c] = mutual.get(c, 0) + 1.", ar: "تخطَّ المرشح إن كان هو الشخص أو كان ضمن friends أصلاً. وعُدّ الآخرين في قاموس: mutual[c] = mutual.get(c, 0) + 1." },
        { en: "Return sorted(mutual.items(), key=lambda item: (-item[1], item[0])): the minus sign sorts the counts from high to low.", ar: "أعد sorted(mutual.items(), key=lambda item: (-item[1], item[0])): إشارة السالب ترتّب الأعداد من الأعلى إلى الأدنى." },
      ],
      tests: [
        { name: { en: "Two suggestions ranked by mutual friends", ar: "اقتراحان مرتبان بعدد الأصدقاء المشتركين" }, stdin: "Amal Bilal\nAmal Carla\nBilal Dina\nCarla Dina\nCarla Emad\nDina Farid\n? Amal\n", expected: "Dina (2 mutual)\nEmad (1 mutual)" },
        { name: { en: "Existing friends are never suggested", ar: "الأصدقاء الحاليون لا يُقترحون أبداً" }, stdin: "Amal Bilal\nAmal Carla\nBilal Carla\nBilal Dina\n? Amal\n", expected: "Dina (1 mutual)" },
        { name: { en: "More mutual friends rank first, before the alphabet", ar: "الأكثر أصدقاء مشتركين أولاً، قبل الترتيب الأبجدي" }, stdin: "Amal Bilal\nAmal Carla\nBilal Zed\nCarla Zed\nBilal Dina\n? Amal\n", expected: "Zed (2 mutual)\nDina (1 mutual)" },
        { name: { en: "Ties are broken by name", ar: "التعادل يُحسم بالاسم" }, stdin: "Hana Idris\nHana Jalal\nIdris Kamal\nJalal Kamal\nIdris Lina\nJalal Lina\nHana Munir\nMunir Omar\n? Hana\n", expected: "Kamal (2 mutual)\nLina (2 mutual)\nOmar (1 mutual)" },
        { name: { en: "Everyone already knows each other", ar: "الجميع يعرف بعضهم أصلاً" }, stdin: "Amal Bilal\nBilal Carla\nAmal Carla\n? Carla\n", expected: "no suggestions" },
        { name: { en: "A person who is not in the graph", ar: "شخص غير موجود في المخطط" }, stdin: "Amal Bilal\n? Zed\n", expected: "no suggestions" },
      ],
      sampleInput: "Amal Bilal\nAmal Carla\nBilal Dina\nCarla Dina\nCarla Emad\n? Amal\n",
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Login sessions are read on every request, always by session id, and should disappear after 30 minutes. Which store fits best?", ar: "تُقرأ جلسات الدخول مع كل طلب، دائماً بمعرّف الجلسة، وينبغي أن تختفي بعد 30 دقيقة. أي مخزن يناسب أكثر؟" },
          choices: [
            { en: "A graph database", ar: "قاعدة بيانات بيانية" },
            { en: "A wide-column store partitioned by date", ar: "مخزن عمود عريض مقسّم بالتاريخ" },
            { en: "A key-value store with an expiry (TTL) on each key", ar: "مخزن مفتاح-قيمة مع مدة صلاحية (TTL) لكل مفتاح" },
            { en: "A data warehouse", ar: "مستودع بيانات" },
          ],
          answer: 2,
          explain: {
            en: "The only access pattern is get or set by one key, and expiry is built in (for example SET ... EX 1800 in Redis). That is exactly what key-value stores are optimised for; relationships, partitions by date or analytics add nothing here.",
            ar: "نمط الوصول الوحيد هو القراءة أو الكتابة بمفتاح واحد، وانتهاء الصلاحية مدمج (مثل SET ... EX 1800 في Redis). وهذا بالضبط ما صُممت مخازن المفتاح-قيمة لأجله؛ ولا تضيف العلاقات ولا الأقسام بالتاريخ ولا التحليلات شيئاً هنا.",
          },
        },
        {
          q: { en: "A post can collect hundreds of thousands of comments. How should the comments be stored in a document database?", ar: "قد يجمع منشور مئات الآلاف من التعليقات. كيف ينبغي تخزين التعليقات في قاعدة بيانات مستندات؟" },
          choices: [
            { en: "Embedded in an array inside the post document", ar: "مضمّنة في مصفوفة داخل مستند المنشور" },
            { en: "As separate comment documents that reference the post by id", ar: "مستندات تعليقات منفصلة تحيل إلى المنشور بمعرّفه" },
            { en: "As one long string field on the post", ar: "حقلاً نصياً طويلاً واحداً في المنشور" },
          ],
          answer: 1,
          explain: {
            en: "The list grows without limit, so embedding would make the post document huge (MongoDB caps documents at 16 MiB) and slow every read of the post. Comments that reference the post can be paged and indexed by post id. Embedding suits bounded, one-to-few data.",
            ar: "القائمة تنمو بلا حد، فالتضمين سيجعل مستند المنشور ضخماً (تحدّ MongoDB المستند بـ 16 MiB) ويبطّئ كل قراءة للمنشور. أما التعليقات التي تحيل إلى المنشور فيمكن تقسيمها إلى صفحات وفهرستها بمعرّف المنشور. والتضمين يناسب البيانات المحدودة من نوع واحد-إلى-قليل.",
          },
        },
        {
          q: { en: "A product document has tags: [\"red\", \"sale\"]. Does the MongoDB query { tags: \"sale\" } match it?", ar: "في مستند منتج الحقل tags: [\"red\", \"sale\"]. هل يطابقه استعلام MongoDB التالي { tags: \"sale\" }؟" },
          choices: [
            { en: "Yes: a plain value matches an array field when any element equals it", ar: "نعم: القيمة المجردة تطابق حقل المصفوفة حين يساويها أي عنصر" },
            { en: "No: the whole array would have to equal \"sale\"", ar: "لا: يجب أن تساوي المصفوفة كلها \"sale\"" },
            { en: "Only if tags has an index", ar: "فقط إذا كان على tags فهرس" },
            { en: "No: arrays can only be queried with $in", ar: "لا: المصفوفات لا تُستعلَم إلا بـ $in" },
          ],
          answer: 0,
          explain: {
            en: "Equality on an array field matches if any element is equal, which makes tag and category queries natural. Indexes change only the speed, never which documents match, and $in is for testing one value against a list of candidates.",
            ar: "المساواة على حقل مصفوفة تطابق إذا ساوى أي عنصر، وهذا يجعل استعلامات الوسوم والفئات طبيعية. والفهارس تغيّر السرعة فقط ولا تغيّر أبداً المستندات المطابقة، و$in لاختبار قيمة واحدة مقابل قائمة مرشحين.",
          },
        },
        {
          q: { en: "You design a Cassandra table for \"the latest 50 messages in a chat room\". What should the partition key be?", ar: "تصمم جدول Cassandra لـ «آخر 50 رسالة في غرفة دردشة». ماذا ينبغي أن يكون مفتاح التقسيم؟" },
          choices: [
            { en: "The message text, so messages spread evenly", ar: "نص الرسالة، لتتوزع الرسائل بالتساوي" },
            { en: "The author, because authors are fewer than messages", ar: "المؤلف، لأن المؤلفين أقل من الرسائل" },
            { en: "A random number for every row", ar: "رقم عشوائي لكل صف" },
            { en: "The room id, with a time-based clustering column sorted newest first", ar: "معرّف الغرفة، مع عمود تجميع زمني مرتب من الأحدث" },
          ],
          answer: 3,
          explain: {
            en: "Wide-column design starts from the query: it looks up one room, so the room id is the partition key and all its messages sit together, already sorted by the clustering column. Partitioning by text, author or a random value would scatter one room's messages across the cluster.",
            ar: "يبدأ تصميم العمود العريض من الاستعلام: إنه يبحث عن غرفة واحدة، فمعرّف الغرفة هو مفتاح التقسيم وتجتمع رسائلها كلها معاً، مرتبة أصلاً بعمود التجميع. أما التقسيم بالنص أو المؤلف أو قيمة عشوائية فسيبعثر رسائل الغرفة الواحدة في أنحاء العنقود.",
          },
        },
        {
          q: { en: "Which question is a graph database best at compared with a relational one?", ar: "في أي سؤال تتفوق قاعدة البيانات البيانية أكثر من العلائقية؟" },
          choices: [
            { en: "The total revenue per month over five years", ar: "إجمالي الإيرادات لكل شهر خلال خمس سنوات" },
            { en: "Which accounts are connected to a known fraud account within four hops", ar: "أي الحسابات متصلة بحساب احتيال معروف في حدود أربع قفزات" },
            { en: "Fetching one user's profile by id", ar: "جلب الملف الشخصي لمستخدم واحد بمعرّفه" },
            { en: "Storing a million sensor readings per second", ar: "تخزين مليون قراءة حساس في الثانية" },
          ],
          answer: 1,
          explain: {
            en: "Multi-hop relationship traversal is where graphs shine: in SQL each hop is another self-join, while a graph database follows stored relationships directly. Monthly totals suit SQL or a warehouse, lookups by id suit any store, and huge write streams suit wide-column stores.",
            ar: "تتبّع العلاقات متعددة القفزات هو ما تتألق فيه المخططات البيانية: في SQL كل قفزة ربط ذاتي إضافي، بينما تتبع القاعدة البيانية العلاقات المخزّنة مباشرة. أما الإجماليات الشهرية فتناسب SQL أو المستودع، والبحث بالمعرّف يناسب أي مخزن، وتدفقات الكتابة الهائلة تناسب مخازن العمود العريض.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap and what to practice next

- **Key-value** stores answer "the value for this key" very fast, with TTLs and atomic counters. **Document** stores keep nested, flexible documents you can query and index by any field. **Wide-column** stores partition rows across machines for huge write volumes. **Graph** databases follow relationships directly.
- Document queries are an implicit AND; dotted paths reach into embedded documents, and a plain value matches an array when any element matches.
- **Embed** data that is read together, one-to-few and bounded; **reference** data that is shared, many-to-many or unbounded; the **extended reference** copies only what the page shows.
- NoSQL design starts from **access patterns**: shape the data so each frequent query reads one document or one partition, and own the duplication you create.
- Compared with SQL you often gain scale-out and flexibility, and pay with weaker or narrower transactions, limited joins and a schema that lives in your code.

**Practice next:** extend the query lab with \`$ne\` and \`$exists\`. In the order lab, add a second access pattern, "a customer's orders", and decide whether it needs its own document shape. Then turn to protecting data: whatever the model, the next lessons cover keeping it safe from attackers and from accidents.`,
        ar: `## الخلاصة وما تتدرب عليه بعد ذلك

- مخازن **المفتاح-قيمة** تجيب عن «القيمة لهذا المفتاح» بسرعة كبيرة، مع مدد صلاحية وعدّادات ذرّية. ومخازن **المستندات** تحفظ مستندات متداخلة ومرنة يمكنك استعلامها وفهرستها بأي حقل. ومخازن **العمود العريض** توزّع الصفوف على الآلات لأحجام الكتابة الهائلة. والقواعد **البيانية** تتبع العلاقات مباشرة.
- استعلامات المستندات AND ضمني؛ والمسارات المنقّطة تصل إلى المستندات المضمّنة، والقيمة المجردة تطابق المصفوفة حين يطابق أي عنصر.
- **ضمّن** البيانات التي تُقرأ معاً وتكون واحداً-إلى-قليل ومحدودة؛ و**أحِل** البيانات المشتركة أو المتعددة-إلى-متعدد أو غير المحدودة؛ و**الإحالة الموسّعة** تنسخ فقط ما تعرضه الصفحة.
- يبدأ تصميم NoSQL من **أنماط الوصول**: شكّل البيانات بحيث يقرأ كل استعلام متكرر مستنداً واحداً أو قسماً واحداً، وتحمّل مسؤولية التكرار الذي تُنشئه.
- مقارنةً بـ SQL كثيراً ما تكسب التوسع الأفقي والمرونة، وتدفع الثمن معاملاتٍ أضعف أو أضيق، وربطاً محدوداً، ومخططاً يعيش في كودك.

**تدرّب بعد ذلك:** وسّع مختبر الاستعلام بـ \`$ne\` و\`$exists\`. وفي مختبر الطلب أضف نمط وصول ثانياً، «طلبات عميل»، وقرّر هل يحتاج شكل مستند خاصاً به. ثم انتقل إلى حماية البيانات: مهما كان النموذج، تتناول الدروس التالية حفظها آمنة من المهاجمين ومن الحوادث.`,
      },
    },
  ],
};
