import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "programming-basics",
  title: { en: "Programming Basics — Logic That Runs the World", ar: "أساسيات البرمجة — منطق يُدير العالم" },
  estMinutes: 40,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- The building blocks shared by **every** language: variables, conditions, loops, functions
- How to break a problem into steps a computer can follow
- Write and run real logic, checked instantly
- The foundation everything else in backend builds on`,
        ar: `## ماذا ستتعلم

- اللبنات المشتركة بين **كل** لغة: المتغيرات، الشروط، الحلقات، الدوال
- كيف تُقسّم مشكلة إلى خطوات يتبعها الحاسوب
- تكتب وتشغّل منطقاً حقيقياً، يُصحَّح فوراً
- الأساس الذي يبني عليه كل شيء في الخلفية`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A recipe a computer can follow 📝

Programming is writing a recipe so exact that a machine — which has zero common sense — can follow it perfectly. Every recipe uses the same four ingredients, in every language:

\`\`\`js
// 1. VARIABLES — remember values
let total = 0;
const taxRate = 0.15;

// 2. CONDITIONS — make decisions
if (total > 100) {
  console.log("Big order");
} else {
  console.log("Small order");
}

// 3. LOOPS — repeat work
for (let i = 1; i <= 3; i++) {
  console.log("Item", i);
}

// 4. FUNCTIONS — package reusable steps
function withTax(price) {
  return price + price * 0.15;
}
\`\`\`

**The skill that matters most** isn't memorizing syntax — it's **decomposition**: taking "calculate the total of a shopping cart with tax" and breaking it into tiny, ordered steps:
1. Start total at 0
2. For each item, add its price to total
3. Multiply total by 1.15 for tax
4. Return the result

Once you can decompose a problem into steps, translating it into any language is the easy part.`,
        ar: `## وصفة يتبعها الحاسوب 📝

البرمجة كتابة وصفة دقيقة جداً بحيث تستطيع آلة — بلا أي حسّ سليم — اتباعها بإتقان. كل وصفة تستخدم نفس المكوّنات الأربعة، في كل لغة:

\`\`\`js
// 1. المتغيرات — تذكّر القيم
let total = 0;
const taxRate = 0.15;

// 2. الشروط — اتخذ القرارات
if (total > 100) {
  console.log("Big order");
} else {
  console.log("Small order");
}

// 3. الحلقات — كرّر العمل
for (let i = 1; i <= 3; i++) {
  console.log("Item", i);
}

// 4. الدوال — غلّف خطوات قابلة لإعادة الاستخدام
function withTax(price) {
  return price + price * 0.15;
}
\`\`\`

**المهارة الأهم** ليست حفظ الصياغة — بل **التفكيك (decomposition)**: أخذ "احسب إجمالي سلة تسوق مع الضريبة" وتقسيمه إلى خطوات صغيرة مرتّبة:
1. ابدأ الإجمالي من 0
2. لكل عنصر، أضف سعره إلى الإجمالي
3. اضرب الإجمالي في 1.15 للضريبة
4. أعِد النتيجة

متى استطعت تفكيك مشكلة إلى خطوات، صارت ترجمتها إلى أي لغة هي الجزء السهل.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Apply decomposition. Write a function \`cartTotal(prices)\` that takes a list (array) of item prices and returns the **total with 15% tax added**.

Example: \`cartTotal([100, 100])\` → \`230\` (200 + 15%).`,
        ar: `طبّق التفكيك. اكتب دالة \`cartTotal(prices)\` تأخذ قائمة (مصفوفة) أسعار وتعيد **الإجمالي مضافاً إليه ضريبة 15%**.

مثال: \`cartTotal([100, 100])\` ← \`230\` (200 + 15%).`,
      },
      starterCode: `function cartTotal(prices) {
  // 1. sum the prices
  // 2. add 15% tax
  // 3. return it
}

console.log(cartTotal([100, 100])); // 230
console.log(cartTotal([50]));       // 57.5`,
      solution: `function cartTotal(prices) {
  let total = 0;
  for (const price of prices) {
    total = total + price;
  }
  return total * 1.15;
}

console.log(cartTotal([100, 100])); // 230
console.log(cartTotal([50]));       // 57.5`,
      hints: [
        { en: `Loop with: for (const price of prices) { total += price; }`, ar: `كرّر بـ: for (const price of prices) { total += price; }` },
        { en: `Adding 15% = multiplying the sum by 1.15. Return total * 1.15.`, ar: `إضافة 15% = ضرب المجموع في 1.15. أعِد total * 1.15.` },
      ],
      tests: [
        { name: { en: "cartTotal([100, 100]) is 230", ar: "cartTotal([100, 100]) يساوي 230" }, check: `Math.abs(cartTotal([100,100]) - 230) < 0.001` },
        { name: { en: "cartTotal([50]) is 57.5", ar: "cartTotal([50]) يساوي 57.5" }, check: `Math.abs(cartTotal([50]) - 57.5) < 0.001` },
        { name: { en: "Empty cart is 0", ar: "سلة فارغة تساوي 0" }, check: `cartTotal([]) === 0` },
      ],
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Write \`fizzbuzz(n)\` — the famous interview question. Return:
- \`"FizzBuzz"\` if n is divisible by both 3 and 5
- \`"Fizz"\` if divisible by 3 only
- \`"Buzz"\` if divisible by 5 only
- otherwise the number itself (as a number)

(The trick: check 3-and-5 **first**.)`,
        ar: `اكتب \`fizzbuzz(n)\` — سؤال المقابلات الشهير. أعِد:
- \`"FizzBuzz"\` إذا كان n يقبل القسمة على 3 و5 معاً
- \`"Fizz"\` إذا قبل القسمة على 3 فقط
- \`"Buzz"\` إذا قبل القسمة على 5 فقط
- وإلا الرقم نفسه (كرقم)

(الحيلة: افحص 3-و-5 **أولاً**.)`,
      },
      starterCode: `function fizzbuzz(n) {
  // check divisible by 3 AND 5 first!
  // % gives the remainder: n % 3 === 0 means divisible by 3
}

console.log(fizzbuzz(15)); // "FizzBuzz"
console.log(fizzbuzz(9));  // "Fizz"
console.log(fizzbuzz(10)); // "Buzz"
console.log(fizzbuzz(7));  // 7`,
      solution: `function fizzbuzz(n) {
  if (n % 3 === 0 && n % 5 === 0) return "FizzBuzz";
  if (n % 3 === 0) return "Fizz";
  if (n % 5 === 0) return "Buzz";
  return n;
}

console.log(fizzbuzz(15)); // "FizzBuzz"
console.log(fizzbuzz(9));  // "Fizz"
console.log(fizzbuzz(10)); // "Buzz"
console.log(fizzbuzz(7));  // 7`,
      hints: [
        { en: `n % 3 === 0 tests "divisible by 3". Combine both with &&.`, ar: `n % 3 === 0 يفحص "يقبل القسمة على 3". اجمع الاثنين بـ &&.` },
        { en: `Order matters: test FizzBuzz (both) before Fizz and Buzz, or you'll never reach it.`, ar: `الترتيب مهم: افحص FizzBuzz (الاثنين) قبل Fizz وBuzz، وإلا لن تصله أبداً.` },
      ],
      tests: [
        { name: { en: "15 → FizzBuzz", ar: "15 ← FizzBuzz" }, check: `fizzbuzz(15) === "FizzBuzz"` },
        { name: { en: "9 → Fizz", ar: "9 ← Fizz" }, check: `fizzbuzz(9) === "Fizz"` },
        { name: { en: "10 → Buzz", ar: "10 ← Buzz" }, check: `fizzbuzz(10) === "Buzz"` },
        { name: { en: "7 → 7", ar: "7 ← 7" }, check: `fizzbuzz(7) === 7` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recursion — a function that calls itself 🔁

Loops repeat by going *around*; **recursion** repeats by going *inward* — a function that calls a smaller copy of itself until it reaches a simple case it can answer directly.

Think of Russian nesting dolls: to know how many dolls are in the set, you open the outer doll and ask the same question about the doll inside it — smaller and smaller — until you reach the tiny solid doll that can't open. That smallest doll is the **base case**: the point where the function stops calling itself and just returns an answer.

\`\`\`js
function countdown(n) {
  if (n <= 0) {              // base case — stop here
    console.log("Liftoff!");
    return;
  }
  console.log(n);
  countdown(n - 1);           // recursive case — a smaller version of the same problem
}
\`\`\`

Every recursive function needs exactly these two parts:
1. **Base case** — the simplest input, answered directly, with no further call (without this, it calls itself forever and crashes with a "stack overflow").
2. **Recursive case** — the function calls itself with an input that is *closer* to the base case.

Recursion isn't always the fastest choice, but for problems that are naturally "a small version of the same problem" — like walking nested folders, or summing a list — it's often the clearest way to express the idea. Any loop can be rewritten as recursion, and vice versa; it's a second lens for the same skill you just learned: decomposition.`,
        ar: `## العودية (Recursion) — دالة تستدعي نفسها 🔁

الحلقات تكرّر بالدوران *حول* المشكلة؛ أما **العودية (recursion)** فتكرّر بالتوغّل *داخل* المشكلة — دالة تستدعي نسخة أصغر من نفسها حتى تصل إلى حالة بسيطة تستطيع الإجابة عنها مباشرة.

تخيّل الدمى الروسية المتداخلة: لتعرف كم دمية في المجموعة، تفتح الدمية الخارجية وتسأل نفس السؤال عن الدمية بداخلها — أصغر فأصغر — حتى تصل إلى الدمية الصغيرة الصلبة التي لا تُفتح. تلك الدمية الأصغر هي **الحالة الأساس (base case)**: النقطة التي تتوقف عندها الدالة عن استدعاء نفسها وتُعيد إجابة مباشرة.

\`\`\`js
function countdown(n) {
  if (n <= 0) {              // الحالة الأساس — توقف هنا
    console.log("Liftoff!");
    return;
  }
  console.log(n);
  countdown(n - 1);           // الحالة العودية — نسخة أصغر من نفس المشكلة
}
\`\`\`

كل دالة عودية تحتاج بالضبط هذين الجزأين:
1. **الحالة الأساس** — أبسط مدخل، تُجاب مباشرة، بلا أي استدعاء إضافي (بدونها تستدعي الدالة نفسها إلى الأبد وتنهار بخطأ "stack overflow").
2. **الحالة العودية** — تستدعي الدالة نفسها بمدخل *أقرب* إلى الحالة الأساس.

العودية ليست دائماً الخيار الأسرع، لكن للمشكلات التي هي طبيعياً "نسخة أصغر من نفس المشكلة" — كالتجوّل في مجلدات متداخلة، أو جمع عناصر قائمة — غالباً ما تكون أوضح طريقة للتعبير عن الفكرة. أي حلقة يمكن إعادة كتابتها كعودية، والعكس صحيح؛ إنها عدسة ثانية لنفس المهارة التي تعلّمتها للتو: التفكيك.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Write \`sumRange(n)\` **recursively** (no loops!) that returns the sum of all whole numbers from \`1\` to \`n\`.

Example: \`sumRange(3)\` → \`6\` (1 + 2 + 3). Think: what's the base case (smallest n)? What's the recursive case (sumRange(n) in terms of sumRange(n-1))?`,
        ar: `اكتب \`sumRange(n)\` **بشكل عودي** (بلا حلقات!) تعيد مجموع كل الأعداد الصحيحة من \`1\` إلى \`n\`.

مثال: \`sumRange(3)\` ← \`6\` (1 + 2 + 3). فكّر: ما الحالة الأساس (أصغر n)؟ وما الحالة العودية (sumRange(n) بدلالة sumRange(n-1))؟`,
      },
      starterCode: `function sumRange(n) {
  // base case: if n is 0 (or less), the sum is 0
  // recursive case: n + sumRange(n - 1)
}

console.log(sumRange(3)); // 6
console.log(sumRange(1)); // 1
console.log(sumRange(0)); // 0`,
      solution: `function sumRange(n) {
  if (n <= 0) return 0;
  return n + sumRange(n - 1);
}

console.log(sumRange(3)); // 6
console.log(sumRange(1)); // 1
console.log(sumRange(0)); // 0`,
      hints: [
        { en: `Base case first: if (n <= 0) return 0;`, ar: `الحالة الأساس أولاً: if (n <= 0) return 0;` },
        { en: `Recursive case: return n + sumRange(n - 1); — each call handles one number and hands off the rest.`, ar: `الحالة العودية: return n + sumRange(n - 1); — كل استدعاء يعالج رقماً واحداً ويسلّم الباقي.` },
      ],
      tests: [
        { name: { en: "sumRange(3) is 6", ar: "sumRange(3) يساوي 6" }, check: `sumRange(3) === 6` },
        { name: { en: "sumRange(1) is 1", ar: "sumRange(1) يساوي 1" }, check: `sumRange(1) === 1` },
        { name: { en: "sumRange(0) is 0", ar: "sumRange(0) يساوي 0" }, check: `sumRange(0) === 0` },
        { name: { en: "sumRange(5) is 15", ar: "sumRange(5) يساوي 15" }, check: `sumRange(5) === 15` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: FizzBuzz as an industry filter 🔍

The exercise you just solved earlier in this lesson isn't a toy invented for this course — **FizzBuzz** is a real, widely-used technical-interview screening question, popularized around 2007 by programmer Imran Ghory and later written about extensively by Jeff Atwood (co-founder of Stack Overflow).

The backstory is blunt: hiring managers at real companies found that a large share of candidates who listed years of "programming experience" on their résumés **could not** write a program that prints numbers 1 to 100, substituting "Fizz" for multiples of 3 and "Buzz" for multiples of 5. Not because the logic is hard — it's a handful of conditions and a loop — but because some candidates had never truly practiced turning a plain-English rule into working, ordered code (exactly the decomposition skill from this lesson).

FizzBuzz became a standard early-round filter at many companies precisely because it separates "can talk about code" from "can actually write code that runs correctly." It's still used today, sometimes as a live-coding warm-up before a harder problem.

The lesson: the basics in this file — variables, conditions, loops, functions, and decomposing a problem step by step — aren't "beginner filler" to rush past. They are, quite literally, the bar that real companies use to filter candidates before anything else.`,
        ar: `## دراسة حالة واقعية: FizzBuzz كفلتر صناعي 🔍

التمرين الذي حللته سابقاً في هذا الدرس ليس لعبة اخترعناها لهذه الدورة — **FizzBuzz** سؤال حقيقي وواسع الانتشار في فرز مقابلات العمل التقنية، اشتهر حوالي عام 2007 بفضل المبرمج Imran Ghory، وكتب عنه لاحقاً باستفاضة Jeff Atwood (أحد مؤسسي Stack Overflow).

القصة صريحة: اكتشف مدراء التوظيف في شركات حقيقية أن نسبة كبيرة من المرشحين الذين يذكرون سنوات "خبرة برمجية" في سيرهم الذاتية **لم يستطيعوا** كتابة برنامج يطبع الأرقام من 1 إلى 100، مستبدلاً "Fizz" بمضاعفات 3 و"Buzz" بمضاعفات 5. ليس لأن المنطق صعب — فهو بضعة شروط وحلقة — بل لأن بعض المرشحين لم يتدرّبوا فعلياً على تحويل قاعدة بلغة عادية إلى كود عامل ومرتّب (بالضبط مهارة التفكيك في هذا الدرس).

أصبح FizzBuzz فلتراً معيارياً في الجولة الأولى لدى شركات كثيرة تحديداً لأنه يفصل "يستطيع الحديث عن الكود" عن "يستطيع فعلاً كتابة كود يعمل بشكل صحيح". ولا يزال يُستخدم اليوم، أحياناً كإحماء برمجي مباشر قبل مسألة أصعب.

الدرس: أساسيات هذا الملف — المتغيرات والشروط والحلقات والدوال وتفكيك المشكلة خطوة بخطوة — ليست "حشواً للمبتدئين" يجب تجاوزه بسرعة. إنها، حرفياً، المعيار الذي تستخدمه شركات حقيقية لفرز المرشحين قبل أي شيء آخر.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is the most important programming skill?", ar: "ما أهم مهارة برمجية؟" },
          choices: [
            { en: "Memorizing syntax", ar: "حفظ الصياغة" },
            { en: "Decomposition — breaking a problem into ordered steps", ar: "التفكيك — تقسيم المشكلة إلى خطوات مرتّبة" },
            { en: "Typing fast", ar: "الطباعة السريعة" },
          ],
          answer: 1,
          explain: {
            en: "Syntax you can look up. Turning a fuzzy problem into precise steps is the real, transferable skill.",
            ar: "الصياغة يمكن البحث عنها. تحويل مشكلة غامضة إلى خطوات دقيقة هو المهارة الحقيقية القابلة للنقل.",
          },
        },
        {
          q: { en: "What does n % 5 === 0 check?", ar: "ماذا يفحص n % 5 === 0؟" },
          choices: [
            { en: "n is greater than 5", ar: "n أكبر من 5" },
            { en: "n divides evenly by 5 (no remainder)", ar: "n يقبل القسمة على 5 بلا باقٍ" },
            { en: "n equals 5", ar: "n يساوي 5" },
          ],
          answer: 1,
          explain: {
            en: "% is the remainder (modulo) operator. A remainder of 0 means clean division — the core trick for divisibility.",
            ar: "% هو عامل الباقي (modulo). باقٍ يساوي 0 يعني قسمة نظيفة — الحيلة الأساسية لقابلية القسمة.",
          },
        },
        {
          q: { en: "Why must FizzBuzz check divisibility by 3 AND 5 first?", ar: "لماذا يجب أن يفحص FizzBuzz القسمة على 3 و5 أولاً؟" },
          choices: [
            { en: "Otherwise the Fizz or Buzz case catches it first and you never return FizzBuzz", ar: "وإلا تلتقطه حالة Fizz أو Buzz أولاً فلا تعيد FizzBuzz أبداً" },
            { en: "It runs faster", ar: "يعمل أسرع" },
            { en: "There's no reason", ar: "لا سبب" },
          ],
          answer: 0,
          explain: {
            en: "15 is divisible by 3, so a Fizz-first check would return early. The most specific condition must come first.",
            ar: "15 يقبل القسمة على 3، فلو فحصنا Fizz أولاً لعاد مبكراً. الشرط الأكثر تحديداً يجب أن يأتي أولاً.",
          },
        },
        {
          q: { en: "Every recursive function must have a…", ar: "كل دالة عودية يجب أن تملك…" },
          choices: [
            { en: "For loop inside it", ar: "حلقة for بداخلها" },
            { en: "Base case that stops the calls", ar: "حالة أساس توقف الاستدعاءات" },
            { en: "Global variable", ar: "متغيراً عاماً" },
          ],
          answer: 1,
          explain: {
            en: "Without a base case, a recursive function calls itself forever and crashes with a stack overflow.",
            ar: "بلا حالة أساس، تستدعي الدالة العودية نفسها إلى الأبد وتنهار بخطأ stack overflow.",
          },
        },
        {
          q: { en: "In sumRange(n) = n + sumRange(n - 1), what is the recursive case doing?", ar: "في sumRange(n) = n + sumRange(n - 1)، ماذا تفعل الحالة العودية؟" },
          choices: [
            { en: "Solving the whole problem at once", ar: "تحل المشكلة كاملة دفعة واحدة" },
            { en: "Handling one piece and delegating a smaller version of the problem to itself", ar: "تعالج جزءاً واحداً وتفوّض نسخة أصغر من المشكلة لنفسها" },
            { en: "Deleting the input", ar: "تحذف المدخل" },
          ],
          answer: 1,
          explain: {
            en: "Each call adds n, then hands off sumRange(n - 1) — a smaller version of the same problem — until n reaches the base case.",
            ar: "كل استدعاء يضيف n، ثم يسلّم sumRange(n - 1) — نسخة أصغر من نفس المشكلة — حتى يصل n إلى الحالة الأساس.",
          },
        },
        {
          q: { en: "Why is FizzBuzz used as a real hiring filter?", ar: "لماذا يُستخدم FizzBuzz كفلتر توظيف حقيقي؟" },
          choices: [
            { en: "It separates candidates who can actually write working code from those who can't", ar: "يفصل المرشحين القادرين فعلاً على كتابة كود عامل عن غيرهم" },
            { en: "It tests knowledge of a rare framework", ar: "يختبر معرفة إطار عمل نادر" },
            { en: "It measures typing speed only", ar: "يقيس سرعة الطباعة فقط" },
          ],
          answer: 0,
          explain: {
            en: "Many candidates could describe programming concepts but not translate a simple rule into ordered, working code — exactly what FizzBuzz exposes.",
            ar: "كثير من المرشحين استطاعوا وصف مفاهيم برمجية لكن دون ترجمة قاعدة بسيطة إلى كود مرتّب وعامل — وهذا بالضبط ما يكشفه FizzBuzz.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Every language shares 4 blocks: variables, conditions, loops, functions
- The real skill is decomposition — turning problems into ordered steps
- You solved cart-total and FizzBuzz, a genuine interview classic
- **Recursion** solves problems by calling a smaller version of themselves, with a base case to stop — you wrote a recursive \`sumRange\`
- FizzBuzz's real history shows why these fundamentals are an actual hiring filter, not "beginner filler"

**Next:** Databases & SQL — where backend applications store everything permanently.`,
        ar: `## الخلاصة

- كل لغة تشترك في 4 لبنات: المتغيرات، الشروط، الحلقات، الدوال
- المهارة الحقيقية هي التفكيك — تحويل المشكلات إلى خطوات مرتّبة
- حللت إجمالي السلة وFizzBuzz، كلاسيكيّة مقابلات حقيقية
- **العودية (Recursion)** تحل المشكلات باستدعاء نسخة أصغر من نفسها، مع حالة أساس للتوقف — كتبت \`sumRange\` عودية
- تاريخ FizzBuzz الحقيقي يُظهر لماذا هذه الأساسيات فلتر توظيف فعلي، لا "حشو للمبتدئين"

**التالي:** قواعد البيانات وSQL — حيث تخزّن تطبيقات الخلفية كل شيء بشكل دائم.`,
      },
    },
  ],
};
