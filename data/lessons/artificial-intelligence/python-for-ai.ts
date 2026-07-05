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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Python is the language of AI thanks to readability + libraries
- Lists, len/sum/max/min, and list comprehensions handle data
- NumPy makes array math fast at scale
- You wrote a real min-max normalizer

**Next:** Math for ML — the surprisingly small amount of math you actually need, explained simply.`,
        ar: `## الخلاصة

- بايثون لغة الذكاء بفضل سهولة القراءة + المكتبات
- القوائم، len/sum/max/min، وlist comprehensions تعالج البيانات
- NumPy يجعل رياضيات المصفوفات سريعة على نطاق واسع
- كتبت مُحجِّم min-max حقيقياً

**التالي:** رياضيات تعلّم الآلة — القدر القليل المفاجئ من الرياضيات الذي تحتاجه فعلاً، مشروحاً ببساطة.`,
      },
    },
  ],
};
