import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "typescript",
  title: { en: "TypeScript — JavaScript with a Safety Net", ar: "TypeScript — جافاسكربت بشبكة أمان" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What "types" mean and why companies demand TypeScript
- Reading TypeScript signatures (you'll see them everywhere)
- Practice the *thinking* with a runnable exercise
- The exact setup steps for your machine

TypeScript needs a compile step, so the runnable part uses JavaScript to practice type-thinking — then you'll set up the real thing locally.`,
        ar: `## ماذا ستتعلم

- ماذا تعني "الأنواع (types)" ولماذا تشترط الشركات TypeScript
- قراءة توقيعات TypeScript (ستراها في كل مكان)
- التدرّب على *طريقة التفكير* بتمرين قابل للتشغيل
- خطوات التجهيز الدقيقة على جهازك

TypeScript يحتاج خطوة ترجمة، لذلك الجزء القابل للتشغيل يستخدم JavaScript للتدرّب على تفكير الأنواع — ثم تجهّز الأداة الحقيقية محلياً.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Labeled boxes 🏷️

In the JavaScript lesson, variables were boxes. JavaScript lets you put **anything** in **any** box, any time:

\`\`\`js
let age = 25;
age = "twenty five";   // JS says: sure, why not! 🤷
age * 2;               // NaN … your app just broke, silently
\`\`\`

That flexibility is exactly what causes most bugs in big projects.

**TypeScript = JavaScript + labels on the boxes.** You declare what a box may hold, and a checker yells at you **while you type** — not after your users find the bug:

\`\`\`ts
let age: number = 25;
age = "twenty five";
// ❌ Error: Type 'string' is not assignable to type 'number'
\`\`\`

Functions get labels too — this is the part you'll read every day in every modern codebase:

\`\`\`ts
function add(a: number, b: number): number {
  return a + b;
}

add(2, 3);      // ✅ 5
add(2, "3");    // ❌ caught before you even run it
\`\`\`

Read it as: "add takes two numbers and gives back a number." And you can define the shape of whole objects:

\`\`\`ts
interface User {
  name: string;
  age: number;
  email?: string;   // ? = optional
}
\`\`\`

**The payoff:** your editor autocompletes everything, refactors safely, and the compiler catches a whole category of bugs before they ship. That's why most job listings ask for it — TypeScript is not a new language to learn, it's the same JavaScript with the safety net on.`,
        ar: `## صناديق بملصقات 🏷️

في درس JavaScript كانت المتغيرات صناديق. جافاسكربت تسمح بوضع **أي شيء** في **أي** صندوق، في أي وقت:

\`\`\`js
let age = 25;
age = "twenty five";   // جافاسكربت تقول: ولمَ لا! 🤷
age * 2;               // NaN … انكسر تطبيقك بصمت
\`\`\`

هذه المرونة هي بالضبط سبب معظم الأخطاء في المشاريع الكبيرة.

**TypeScript = جافاسكربت + ملصقات على الصناديق.** تصرّح بما يحمله كل صندوق، فيصرخ المدقق في وجهك **أثناء الكتابة** — لا بعد أن يكتشف مستخدموك الخطأ:

\`\`\`ts
let age: number = 25;
age = "twenty five";
// ❌ خطأ: النوع 'string' لا يمكن إسناده إلى النوع 'number'
\`\`\`

الدوال أيضاً تأخذ ملصقات — وهذا ما ستقرؤه يومياً في كل مشروع حديث:

\`\`\`ts
function add(a: number, b: number): number {
  return a + b;
}

add(2, 3);      // ✅ 5
add(2, "3");    // ❌ يُكتشف قبل أن تشغّل أصلاً
\`\`\`

اقرأها: "add تأخذ رقمين وتعيد رقماً." ويمكنك تعريف شكل كائنات كاملة:

\`\`\`ts
interface User {
  name: string;
  age: number;
  email?: string;   // ? = اختياري
}
\`\`\`

**المكسب:** محررك يكمل تلقائياً كل شيء، وتعيد الهيكلة بأمان، ويصطاد المترجم فئة كاملة من الأخطاء قبل النشر. لهذا تطلبه معظم إعلانات الوظائف — TypeScript ليس لغة جديدة تتعلمها، بل هو نفس جافاسكربت مع شبكة الأمان.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `**Be the type checker!** Until your local TS is set up, play the compiler's role by hand.

Write a function \`safeAdd(a, b)\` that:
1. **Returns the sum** if both arguments are numbers
2. **Returns the text** \`"TypeError"\` if either one is not a number

(Check with \`typeof x === "number"\` — that's literally what the word TypeScript is about.)`,
        ar: `**كن أنت مدقق الأنواع!** إلى أن تجهّز TS محلياً، العب دور المترجم يدوياً.

اكتب دالة \`safeAdd(a, b)\`:
1. **تعيد المجموع** إذا كان كلا الوسيطين رقمين
2. **تعيد النص** \`"TypeError"\` إذا كان أحدهما ليس رقماً

(افحص بـ \`typeof x === "number"\` — هذا حرفياً ما تعنيه كلمة TypeScript.)`,
      },
      starterCode: `function safeAdd(a, b) {
  // if a or b is not a number -> return "TypeError"
  // otherwise -> return a + b

}

console.log(safeAdd(2, 3));      // should print 5
console.log(safeAdd(2, "3"));    // should print TypeError`,
      solution: `function safeAdd(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    return "TypeError";
  }
  return a + b;
}

console.log(safeAdd(2, 3));      // 5
console.log(safeAdd(2, "3"));    // TypeError`,
      hints: [
        { en: `typeof tells you what's in the box: \`typeof 5\` → "number", \`typeof "5"\` → "string".`, ar: `typeof يخبرك بما في الصندوق: \`typeof 5\` ← "number"، و \`typeof "5"\` ← "string".` },
        { en: `Check first, return early: \`if (typeof a !== "number" || typeof b !== "number") return "TypeError";\``, ar: `افحص أولاً وأعد مبكراً: \`if (typeof a !== "number" || typeof b !== "number") return "TypeError";\`` },
      ],
      tests: [
        {
          name: { en: "safeAdd(2, 3) returns 5", ar: "safeAdd(2, 3) تعيد 5" },
          check: `typeof safeAdd === "function" && safeAdd(2, 3) === 5`,
        },
        {
          name: { en: `safeAdd(2, "3") returns "TypeError"`, ar: `safeAdd(2, "3") تعيد "TypeError"` },
          check: `safeAdd(2, "3") === "TypeError"`,
        },
        {
          name: { en: `safeAdd("x", 1) returns "TypeError"`, ar: `safeAdd("x", 1) تعيد "TypeError"` },
          check: `safeAdd("x", 1) === "TypeError"`,
        },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What does TypeScript add to JavaScript?", ar: "ماذا يضيف TypeScript إلى JavaScript؟" },
          choices: [
            { en: "New HTML tags", ar: "وسوم HTML جديدة" },
            { en: "Static types checked before the code runs", ar: "أنواعاً ثابتة تُفحص قبل تشغيل الكود" },
            { en: "A faster runtime engine", ar: "محرك تشغيل أسرع" },
          ],
          answer: 1,
          explain: {
            en: "TS compiles to plain JS — the browser runs the same JavaScript. The gain is the checking (and editor tooling) before running.",
            ar: "يُترجم TS إلى JS عادي — المتصفح يشغّل نفس الجافاسكربت. المكسب هو الفحص (وأدوات المحرر) قبل التشغيل.",
          },
        },
        {
          q: { en: "What does this mean: function greet(name: string): string ?", ar: "ماذا يعني: function greet(name: string): string ؟" },
          choices: [
            { en: "greet takes a string and returns a string", ar: "greet تأخذ نصاً وتعيد نصاً" },
            { en: "greet takes two strings", ar: "greet تأخذ نصين" },
            { en: "greet is a string variable", ar: "greet متغير نصي" },
          ],
          answer: 0,
          explain: {
            en: "The first : string labels the parameter; the one after the parentheses labels the return value.",
            ar: "أول : string تصف الوسيط؛ والتي بعد الأقواس تصف القيمة المعادة.",
          },
        },
        {
          q: { en: "In interface User { email?: string } — what does the ? mean?", ar: "في interface User { email?: string } — ماذا تعني علامة ؟" },
          choices: [
            { en: "email is optional", ar: "email اختياري" },
            { en: "email is a question", ar: "email سؤال" },
            { en: "email must be validated", ar: "يجب التحقق من email" },
          ],
          answer: 0,
          explain: {
            en: "? marks an optional property: a User object is valid with or without email.",
            ar: "علامة ? تعني خاصية اختيارية: كائن User صالح مع email أو بدونه.",
          },
        },
        {
          q: { en: "When are TypeScript errors caught?", ar: "متى تُكتشف أخطاء TypeScript؟" },
          choices: [
            { en: "When users report them", ar: "عندما يبلّغ عنها المستخدمون" },
            { en: "While you type / at compile time — before running", ar: "أثناء الكتابة / عند الترجمة — قبل التشغيل" },
            { en: "Only in the browser console", ar: "فقط في وحدة تحكم المتصفح" },
          ],
          answer: 1,
          explain: {
            en: "That's the entire value: shifting bug discovery from production (users) to development (you, instantly, in the editor).",
            ar: "هذه هي القيمة كلها: نقل اكتشاف الأخطاء من الإنتاج (المستخدمون) إلى التطوير (أنت، فوراً، في المحرر).",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Set up the real thing (15 minutes)

1. In any project: \`npm install -D typescript\` then \`npx tsc --init\`
2. Rename a \`.js\` file to \`.ts\` — errors appear as red squiggles in VS Code
3. Label your functions' parameters and returns; define one \`interface\`
4. The official handbook (Resources tab) chapter "TypeScript for JavaScript Programmers" takes 20 minutes and covers 80% of daily usage

**Reality check:** on the job you'll mostly *read* types others wrote and add types to your own functions. You now know how to do both.`,
        ar: `## جهّز الأداة الحقيقية (15 دقيقة)

1. في أي مشروع: \`npm install -D typescript\` ثم \`npx tsc --init\`
2. غيّر امتداد ملف \`.js\` إلى \`.ts\` — ستظهر الأخطاء كخطوط حمراء في VS Code
3. ضع ملصقات على وسائط دوالك وقيمها المعادة؛ وعرّف \`interface\` واحدة
4. فصل "TypeScript for JavaScript Programmers" في الدليل الرسمي (تبويب المصادر) يستغرق 20 دقيقة ويغطي 80% من الاستخدام اليومي

**واقعياً:** في العمل ستقرأ غالباً أنواعاً كتبها غيرك وتضيف أنواعاً لدوالك. الآن تعرف كيف تفعل الاثنين.`,
      },
    },
  ],
};
