import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "python-for-ai",
  title: { en: "Python for AI — Your First Tools", ar: "بايثون للذكاء الاصطناعي — أدواتك الأولى" },
  estMinutes: 40,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why Python owns the AI world
- Lists and loops for handling data
- The idea behind **NumPy** (arrays of numbers)
- You'll compute real statistics on data, live`,
        ar: `## ماذا ستتعلم

- لماذا تهيمن بايثون على عالم الذكاء الاصطناعي
- القوائم والحلقات لمعالجة البيانات
- الفكرة خلف **NumPy** (مصفوفات الأرقام)
- ستحسب إحصاءات حقيقية على بيانات، مباشرة`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The language of intelligence 🧠

Almost all AI is built in **Python** — not because it's fastest, but because it's the easiest to think in, and every AI tool (NumPy, pandas, PyTorch, TensorFlow) lives there. AI is, at its core, **doing math on big piles of numbers**, and Python makes that readable.

Everything starts with data in **lists**:

\`\`\`python
temperatures = [22, 25, 19, 30, 28]

# the essentials for AI data work:
print(len(temperatures))       # 5  — how many
print(sum(temperatures))       # 124 — total
print(max(temperatures))       # 30 — biggest
print(min(temperatures))       # 19 — smallest
average = sum(temperatures) / len(temperatures)
print(average)                 # 24.8
\`\`\`

To transform every number at once, Python has a beautiful tool called a **list comprehension**:

\`\`\`python
doubled = [t * 2 for t in temperatures]   # [44, 50, 38, 60, 56]
hot_days = [t for t in temperatures if t > 24]  # [25, 30, 28]
\`\`\`

Read it as "give me \`t * 2\` for each \`t\` in temperatures." This one idea replaces whole loops and is everywhere in AI code.

Real AI uses **NumPy**, a library that makes arrays of numbers blazing fast and lets you do math on a whole array at once (\`array * 2\` doubles every element). But the mental model is exactly the list thinking above — NumPy just makes it fast enough for millions of numbers.`,
        ar: `## لغة الذكاء 🧠

كل الذكاء الاصطناعي تقريباً مبنيّ بـ**بايثون** — لا لأنها الأسرع، بل لأنها الأسهل للتفكير بها، وكل أدوات الذكاء (NumPy، pandas، PyTorch، TensorFlow) تعيش فيها. الذكاء الاصطناعي في جوهره **إجراء رياضيات على أكوام كبيرة من الأرقام**، وبايثون تجعل ذلك مقروءاً.

كل شيء يبدأ ببيانات في **قوائم**:

\`\`\`python
temperatures = [22, 25, 19, 30, 28]

# الأساسيات لعمل بيانات الذكاء:
print(len(temperatures))       # 5  — كم عدد
print(sum(temperatures))       # 124 — المجموع
print(max(temperatures))       # 30 — الأكبر
print(min(temperatures))       # 19 — الأصغر
average = sum(temperatures) / len(temperatures)
print(average)                 # 24.8
\`\`\`

لتحويل كل رقم دفعة واحدة، لبايثون أداة جميلة تسمى **list comprehension**:

\`\`\`python
doubled = [t * 2 for t in temperatures]   # [44, 50, 38, 60, 56]
hot_days = [t for t in temperatures if t > 24]  # [25, 30, 28]
\`\`\`

اقرأها "أعطني \`t * 2\` لكل \`t\` في temperatures." هذه الفكرة الواحدة تختصر حلقات كاملة وهي في كل مكان في كود الذكاء.

الذكاء الحقيقي يستخدم **NumPy**، مكتبة تجعل مصفوفات الأرقام فائقة السرعة وتتيح رياضيات على مصفوفة كاملة دفعة واحدة (\`array * 2\` يضاعف كل عنصر). لكن النموذج الذهني هو تماماً تفكير القوائم أعلاه — NumPy يجعله سريعاً بما يكفي لملايين الأرقام.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Dictionaries: giving data a name, not just a slot 🏷️

Lists are great when order is all that matters. But real-world AI data is usually a **record** — a set of *named* fields, like one row of a spreadsheet: \`{"name": "Ahmed", "age": 29, "score": 0.91}\`. Python's tool for this is the **dictionary** (\`dict\`): a collection of **key → value** pairs.

\`\`\`python
student = {"name": "Sara", "score": 88}
print(student["name"])   # "Sara"  — look up by key, not position
student["score"] = 91    # update a value
student["passed"] = True # add a new field
\`\`\`

Dictionaries are everywhere in AI code: a dataset row, a model's configuration (\`{"learning_rate": 0.01, "epochs": 10}\`), or the JSON a model API sends back. **pandas** (the library you'll meet constantly after this lesson) is essentially a giant, fast table built out of exactly this idea — every column is a named key, every row a record.

One pattern you'll use constantly is **grouping**: counting or summing values by a category. For example, given a list of purchases, "total spent *per customer*." The trick is a dictionary that starts empty and grows one key at a time:

\`\`\`python
totals = {}
for name, amount in [("Sara", 20), ("Ali", 15), ("Sara", 5)]:
    totals[name] = totals.get(name, 0) + amount
# totals == {"Sara": 25, "Ali": 15}
\`\`\`

\`.get(key, 0)\` is the safe way to read a key that might not exist yet — it returns \`0\` instead of crashing. This exact pattern (loop + dictionary + \`.get\`) is the seed of every "group by" you'll ever write, whether by hand or with pandas' \`.groupby()\`.`,
        ar: `## القواميس: تسمية البيانات، لا مجرد موضع 🏷️

القوائم رائعة حين يهم الترتيب فقط. لكن بيانات الذكاء الاصطناعي الواقعية عادة **سجل** — مجموعة حقول *مُسمّاة*، مثل صف واحد في جدول بيانات: \`{"name": "أحمد", "age": 29, "score": 0.91}\`. أداة بايثون لهذا هي **القاموس** (\`dict\`): مجموعة أزواج **مفتاح ← قيمة**.

\`\`\`python
student = {"name": "سارة", "score": 88}
print(student["name"])   # "سارة"  — ابحث بالمفتاح، لا بالموضع
student["score"] = 91    # حدّث قيمة
student["passed"] = True # أضف حقلاً جديداً
\`\`\`

القواميس في كل مكان في كود الذكاء: صف بيانات، إعدادات نموذج (\`{"learning_rate": 0.01, "epochs": 10}\`)، أو الـ JSON الذي يعيده API نموذج. مكتبة **pandas** (التي ستقابلها باستمرار بعد هذا الدرس) هي أساساً جدول عملاق وسريع مبني من هذه الفكرة بالضبط — كل عمود مفتاح مُسمّى، وكل صف سجل.

نمط ستستخدمه باستمرار هو **التجميع (grouping)**: عدّ أو جمع قيم حسب فئة. مثلاً، بمعطى قائمة مشتريات، "إجمالي الإنفاق *لكل عميل*." الحيلة قاموس يبدأ فارغاً وينمو مفتاحاً في كل مرة:

\`\`\`python
totals = {}
for name, amount in [("سارة", 20), ("علي", 15), ("سارة", 5)]:
    totals[name] = totals.get(name, 0) + amount
# totals == {"سارة": 25, "علي": 15}
\`\`\`

\`.get(key, 0)\` طريقة آمنة لقراءة مفتاح قد لا يكون موجوداً بعد — تعيد \`0\` بدل التعطل. هذا النمط بالضبط (حلقة + قاموس + \`.get\`) هو بذرة كل "تجميع حسب" ستكتبه يوماً، سواء يدوياً أو بـ \`.groupby()\` في pandas.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Data preparation is step one of every AI project. Write \`normalize(data)\` that scales a list of numbers to the 0–1 range using min-max normalization:

\`normalized = (x - min) / (max - min)\` for each value.

Example: \`[10, 20, 30]\` → \`[0.0, 0.5, 1.0]\``,
        ar: `تحضير البيانات هو الخطوة الأولى في كل مشروع ذكاء. اكتب \`normalize(data)\` التي تحجّم قائمة أرقام إلى المدى 0–1 باستخدام min-max:

\`normalized = (x - min) / (max - min)\` لكل قيمة.

مثال: \`[10, 20, 30]\` ← \`[0.0, 0.5, 1.0]\``,
      },
      starterCode: `def normalize(data):
    lo = min(data)
    hi = max(data)
    # return [ (x - lo) / (hi - lo) for x in data ]
    pass

print(normalize([10, 20, 30]))  # [0.0, 0.5, 1.0]`,
      solution: `def normalize(data):
    lo = min(data)
    hi = max(data)
    return [(x - lo) / (hi - lo) for x in data]

print(normalize([10, 20, 30]))  # [0.0, 0.5, 1.0]`,
      hints: [
        { en: `Find lo = min(data) and hi = max(data) first.`, ar: `جد lo = min(data) و hi = max(data) أولاً.` },
        { en: `Use a list comprehension: [(x - lo) / (hi - lo) for x in data]`, ar: `استخدم list comprehension: [(x - lo) / (hi - lo) for x in data]` },
      ],
      tests: [
        { name: { en: "Normalizes [10,20,30] to [0,0.5,1]", ar: "يحجّم [10,20,30] إلى [0,0.5,1]" }, check: `assert normalize([10,20,30]) == [0.0, 0.5, 1.0]` },
        { name: { en: "Min maps to 0, max maps to 1", ar: "الأصغر ← 0، الأكبر ← 1" }, check: `r = normalize([5, 15]); assert r[0] == 0.0 and r[1] == 1.0` },
        { name: { en: "Handles a longer list", ar: "يتعامل مع قائمة أطول" }, check: `assert normalize([0, 50, 100])[1] == 0.5` },
      ],
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Practice the "group by" pattern used everywhere in real data work. Write \`total_per_customer(purchases)\` where \`purchases\` is a list of \`(name, amount)\` tuples. Return a dictionary mapping each customer name to their **total** spend.

Example: \`[("Sara", 20), ("Ali", 15), ("Sara", 5)]\` → \`{"Sara": 25, "Ali": 15}\``,
        ar: `تدرّب على نمط "التجميع حسب" المستخدم في كل مكان بعمل البيانات الحقيقي. اكتب \`total_per_customer(purchases)\` حيث \`purchases\` قائمة صفوف \`(name, amount)\`. أعِد قاموساً يربط كل اسم عميل بـ**إجمالي** إنفاقه.

مثال: \`[("Sara", 20), ("Ali", 15), ("Sara", 5)]\` ← \`{"Sara": 25, "Ali": 15}\``,
      },
      starterCode: `def total_per_customer(purchases):
    totals = {}
    # for each (name, amount): totals[name] = totals.get(name, 0) + amount
    return totals

print(total_per_customer([("Sara", 20), ("Ali", 15), ("Sara", 5)]))  # {'Sara': 25, 'Ali': 15}`,
      solution: `def total_per_customer(purchases):
    totals = {}
    for name, amount in purchases:
        totals[name] = totals.get(name, 0) + amount
    return totals

print(total_per_customer([("Sara", 20), ("Ali", 15), ("Sara", 5)]))  # {'Sara': 25, 'Ali': 15}`,
      hints: [
        { en: `Loop with: for name, amount in purchases:`, ar: `كرّر بـ: for name, amount in purchases:` },
        { en: `Use totals[name] = totals.get(name, 0) + amount to safely accumulate.`, ar: `استخدم totals[name] = totals.get(name, 0) + amount للتجميع بأمان.` },
      ],
      tests: [
        { name: { en: "Sums repeated customers correctly", ar: "يجمع العملاء المتكررين بشكل صحيح" }, check: `assert total_per_customer([("Sara",20),("Ali",15),("Sara",5)]) == {"Sara":25,"Ali":15}` },
        { name: { en: "A single purchase works", ar: "شراء واحد يعمل" }, check: `assert total_per_customer([("Omar", 10)]) == {"Omar": 10}` },
        { name: { en: "Empty list gives empty dict", ar: "قائمة فارغة تعطي قاموساً فارغاً" }, check: `assert total_per_customer([]) == {}` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: NumPy, the library under everything 🔍

In 2020, the journal *Nature* published a paper titled "Array programming with NumPy" — an unusual honor for a piece of open-source software. It documented something remarkable: NumPy, a free library maintained largely by volunteers, had quietly become the numerical foundation underneath nearly the entire scientific Python stack — pandas, scikit-learn, PyTorch, and TensorFlow all convert your data into NumPy-style arrays before doing serious math on it.

The reason traces straight back to the list-vs-array idea from this lesson: plain Python lists are flexible but slow for millions of numbers, because Python checks each element's type one by one. NumPy stores numbers in one tightly-packed block of memory and processes them using fast, compiled C code — so \`array * 2\` multiplies a million numbers nearly as fast as multiplying one.

That single design decision — trade some flexibility for raw speed on numeric arrays — is why a research team can train a model on millions of images in hours instead of years. Every framework you'll use in this AI track (pandas' tables, PyTorch's tensors) is, underneath, still that same idea: numbers packed tightly, so math on huge piles of them stays fast.`,
        ar: `## دراسة حالة واقعية: NumPy، المكتبة التي يقوم عليها كل شيء 🔍

في 2020، نشرت مجلة *Nature* بحثاً بعنوان "Array programming with NumPy" — تكريم غير معتاد لبرمجية مفتوحة المصدر. وثّق البحث شيئاً لافتاً: NumPy، مكتبة مجانية يصونها متطوعون في الغالب، أصبحت بصمت الأساس العددي تحت كامل نظام بايثون العلمي تقريباً — pandas وscikit-learn وPyTorch وTensorFlow جميعها تحوّل بياناتك إلى مصفوفات بنمط NumPy قبل إجراء أي رياضيات جادة عليها.

يعود السبب مباشرة لفكرة القائمة مقابل المصفوفة من هذا الدرس: قوائم بايثون العادية مرنة لكنها بطيئة لملايين الأرقام، لأن بايثون تفحص نوع كل عنصر واحداً تلو الآخر. NumPy تخزّن الأرقام في كتلة ذاكرة واحدة متراصة وتعالجها بكود C سريع ومُترجَم — فتصبح \`array * 2\` تضاعف مليون رقم بسرعة تقارب مضاعفة رقم واحد.

هذا القرار التصميمي الواحد — التضحية ببعض المرونة مقابل سرعة خام على المصفوفات العددية — هو سبب قدرة فريق بحثي على تدريب نموذج على ملايين الصور خلال ساعات لا سنوات. كل إطار عمل ستستخدمه في مسار الذكاء هذا (جداول pandas، موترات PyTorch) لا يزال، في العمق، نفس الفكرة: أرقام متراصة بإحكام، كي تبقى الرياضيات عليها سريعة مهما كانت الكمية هائلة.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Why is Python dominant in AI?", ar: "لماذا تهيمن بايثون على الذكاء الاصطناعي؟" },
          choices: [
            { en: "It's readable and every AI library is built for it", ar: "سهلة القراءة وكل مكتبات الذكاء مبنية لها" },
            { en: "It's the fastest language", ar: "أسرع لغة" },
            { en: "It's the oldest language", ar: "أقدم لغة" },
          ],
          answer: 0,
          explain: {
            en: "Readability + the ecosystem (NumPy, pandas, PyTorch, TensorFlow) win. Heavy math actually runs in fast C under the hood.",
            ar: "سهولة القراءة + النظام (NumPy، pandas، PyTorch، TensorFlow) هما الفوز. الرياضيات الثقيلة تعمل فعلاً بـ C سريعة في الخلفية.",
          },
        },
        {
          q: { en: "What does [t*2 for t in nums] do?", ar: "ماذا يفعل [t*2 for t in nums]؟" },
          choices: [
            { en: "Doubles every number, returning a new list", ar: "يضاعف كل رقم، ويعيد قائمة جديدة" },
            { en: "Adds 2 to the first number", ar: "يضيف 2 لأول رقم" },
            { en: "Deletes the list", ar: "يحذف القائمة" },
          ],
          answer: 0,
          explain: {
            en: "A list comprehension transforms every element at once — the core pattern for processing AI data.",
            ar: "الـ list comprehension تحوّل كل عنصر دفعة واحدة — النمط الأساسي لمعالجة بيانات الذكاء.",
          },
        },
        {
          q: { en: "Why normalize data to 0–1?", ar: "لماذا نحجّم البيانات إلى 0–1؟" },
          choices: [
            { en: "So features on different scales are comparable and models train better", ar: "لتصبح السمات ذات المقاييس المختلفة قابلة للمقارنة وتتدرّب النماذج أفضل" },
            { en: "To make numbers bigger", ar: "لتكبير الأرقام" },
            { en: "It's required by Python", ar: "بايثون تفرضه" },
          ],
          answer: 0,
          explain: {
            en: "Normalization puts features on a common scale so one large-valued feature doesn't dominate. A standard prep step.",
            ar: "التحجيم يضع السمات على مقياس مشترك كي لا تهيمن سمة كبيرة القيم. خطوة تحضير قياسية.",
          },
        },
        {
          q: { en: "What is a Python dictionary best used for?", ar: "متى يُستخدم قاموس بايثون بشكل أفضل؟" },
          choices: [
            { en: "Storing named key → value fields, like one row of a spreadsheet", ar: "تخزين حقول مُسمّاة مفتاح ← قيمة، كصف واحد في جدول بيانات" },
            { en: "Only storing numbers in order", ar: "تخزين أرقام مرتّبة فقط" },
            { en: "Running code faster than a list", ar: "تشغيل الكود أسرع من القائمة" },
          ],
          answer: 0,
          explain: {
            en: "Dictionaries map keys to values, which is exactly how a data record (and later, a pandas row) is structured.",
            ar: "القواميس تربط مفاتيح بقيم، وهذا بالضبط شكل سجل البيانات (وصف pandas لاحقاً).",
          },
        },
        {
          q: { en: "In the group-by pattern `totals[name] = totals.get(name, 0) + amount`, what does `.get(name, 0)` do?", ar: "في نمط التجميع `totals[name] = totals.get(name, 0) + amount`، ماذا تفعل `.get(name, 0)`؟" },
          choices: [
            { en: "Returns 0 safely if the key doesn't exist yet, instead of crashing", ar: "تعيد 0 بأمان إذا لم يكن المفتاح موجوداً بعد، بدل التعطل" },
            { en: "Deletes the key from the dictionary", ar: "تحذف المفتاح من القاموس" },
            { en: "Always returns 0 no matter what", ar: "تعيد 0 دائماً بغض النظر" },
          ],
          answer: 0,
          explain: {
            en: "`.get(key, default)` avoids a KeyError on the first occurrence of a new customer, letting the total start from 0.",
            ar: "`.get(key, default)` تتجنّب خطأ KeyError عند أول ظهور لعميل جديد، فيبدأ الإجمالي من 0.",
          },
        },
        {
          q: { en: "Why does NumPy make array math so much faster than plain Python lists?", ar: "لماذا تجعل NumPy رياضيات المصفوفات أسرع بكثير من قوائم بايثون العادية؟" },
          choices: [
            { en: "It packs numbers tightly in memory and runs compiled C code on them", ar: "تُراصّ الأرقام بإحكام في الذاكرة وتشغّل عليها كود C مُترجَماً" },
            { en: "It uses a different programming language for the user's code", ar: "تستخدم لغة برمجة مختلفة لكود المستخدم" },
            { en: "It skips doing the math entirely", ar: "تتجاوز إجراء الرياضيات كلياً" },
          ],
          answer: 0,
          explain: {
            en: "Plain lists check each element's type one by one; NumPy stores one tightly-packed block and computes with fast compiled code.",
            ar: "القوائم العادية تفحص نوع كل عنصر واحداً تلو الآخر؛ NumPy تخزّن كتلة متراصة وتحسب بكود مُترجَم سريع.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Python is the language of AI thanks to readability + libraries
- Lists, len/sum/max/min, and list comprehensions handle data
- Dictionaries store named key → value records and power the "group by" pattern
- NumPy makes array math fast at scale by packing numbers tightly and using compiled C
- You wrote a real min-max normalizer and a group-by total-per-customer function
- Case study: NumPy's 2020 *Nature* paper shows how one array library underpins pandas, scikit-learn, PyTorch, and TensorFlow

**Next:** Math for ML — the surprisingly small amount of math you actually need, explained simply.`,
        ar: `## الخلاصة

- بايثون لغة الذكاء بفضل سهولة القراءة + المكتبات
- القوائم، len/sum/max/min، وlist comprehensions تعالج البيانات
- القواميس تخزّن سجلات مُسمّاة مفتاح ← قيمة وتشغّل نمط "التجميع حسب"
- NumPy يجعل رياضيات المصفوفات سريعة على نطاق واسع بترصيص الأرقام واستخدام كود C مُترجَم
- كتبت مُحجِّم min-max حقيقياً ودالة تجميع إجمالي لكل عميل
- دراسة الحالة: بحث NumPy في *Nature* عام 2020 يُظهر كيف تدعم مكتبة مصفوفات واحدة pandas وscikit-learn وPyTorch وTensorFlow

**التالي:** رياضيات تعلّم الآلة — القدر القليل المفاجئ من الرياضيات الذي تحتاجه فعلاً، مشروحاً ببساطة.`,
      },
    },
  ],
};
