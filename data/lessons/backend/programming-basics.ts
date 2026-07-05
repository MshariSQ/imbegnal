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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Every language shares 4 blocks: variables, conditions, loops, functions
- The real skill is decomposition — turning problems into ordered steps
- You solved cart-total and FizzBuzz, a genuine interview classic

**Next:** Databases & SQL — where backend applications store everything permanently.`,
        ar: `## الخلاصة

- كل لغة تشترك في 4 لبنات: المتغيرات، الشروط، الحلقات، الدوال
- المهارة الحقيقية هي التفكيك — تحويل المشكلات إلى خطوات مرتّبة
- حللت إجمالي السلة وFizzBuzz، كلاسيكيّة مقابلات حقيقية

**التالي:** قواعد البيانات وSQL — حيث تخزّن تطبيقات الخلفية كل شيء بشكل دائم.`,
      },
    },
  ],
};
