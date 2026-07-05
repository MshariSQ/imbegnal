import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "nodejs",
  title: { en: "Node.js — JavaScript on the Server", ar: "Node.js — جافاسكربت على الخادم" },
  estMinutes: 35,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What Node.js is and why it changed backend development
- The idea of **non-blocking** (async) code
- Modules, npm, and a simple server shape
- You'll write async logic that actually runs`,
        ar: `## ماذا ستتعلم

- ما هو Node.js ولماذا غيّر تطوير الخلفية
- فكرة الكود **غير الحاجب** (async)
- الوحدات، npm، وشكل خادم بسيط
- ستكتب منطقاً غير متزامن يعمل فعلاً`,
      },
    },
    {
      type: "text",
      body: {
        en: `## JavaScript escapes the browser 🚀

For years JavaScript only ran inside browsers. **Node.js** freed it: a runtime that runs JS **anywhere** — on servers, your laptop, tiny devices. Suddenly you could use *one language* for both frontend and backend. That's a huge part of why Node exploded.

Node's superpower is being **non-blocking**. Imagine a waiter taking your order, then — instead of standing frozen at the kitchen until your food is ready — going to serve other tables, and coming back when the food's up. That's **asynchronous** code: start a slow task (read a file, query a database), don't freeze, handle other work, react when it finishes.

We express "do this when it's ready" with **async/await**:

\`\`\`js
async function getUser(id) {
  const user = await database.find(id);  // "await" = wait here, but don't freeze the whole server
  return user;
}
\`\`\`

Node also uses **modules** (split code into files) and **npm** (the Node Package Manager) — the world's largest library of free, reusable code. Need a web framework? \`npm install express\`. A date library? It's one command away.

A tiny Express server looks like this — notice it's just the REST routing you already learned:

\`\`\`js
const express = require("express");
const app = express();

app.get("/users", (req, res) => {
  res.json([{ id: 1, name: "Sara" }]);
});

app.listen(3000);  // now listening for requests on port 3000
\`\`\``,
        ar: `## جافاسكربت تهرب من المتصفح 🚀

لسنوات، جافاسكربت عملت داخل المتصفحات فقط. **Node.js** حرّرها: بيئة تشغّل JS **في أي مكان** — على الخوادم، حاسوبك، أجهزة صغيرة. فجأة أمكن استخدام *لغة واحدة* للواجهة والخلفية معاً. هذا سبب كبير في انفجار Node.

قوة Node الخارقة أنها **غير حاجبة (non-blocking)**. تخيّل نادلاً يأخذ طلبك، ثم — بدل الوقوف مجمّداً عند المطبخ حتى يجهز طعامك — يخدم طاولات أخرى، ويعود حين يجهز الطعام. هذا هو الكود **غير المتزامن**: ابدأ مهمة بطيئة (قراءة ملف، استعلام قاعدة بيانات)، لا تتجمّد، عالِج عملاً آخر، وتفاعل عند انتهائها.

نعبّر عن "افعل هذا حين يجهز" بـ**async/await**:

\`\`\`js
async function getUser(id) {
  const user = await database.find(id);  // "await" = انتظر هنا، لكن لا تجمّد الخادم كله
  return user;
}
\`\`\`

يستخدم Node أيضاً **الوحدات (modules)** (تقسيم الكود إلى ملفات) و**npm** (مدير حزم Node) — أكبر مكتبة كود مجاني قابل لإعادة الاستخدام في العالم. تحتاج إطار ويب؟ \`npm install express\`. مكتبة تواريخ؟ أمر واحد.

خادم Express صغير يبدو هكذا — لاحظ أنه توجيه REST الذي تعلّمته:

\`\`\`js
const express = require("express");
const app = express();

app.get("/users", (req, res) => {
  res.json([{ id: 1, name: "Sara" }]);
});

app.listen(3000);  // يستمع الآن للطلبات على المنفذ 3000
\`\`\``,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Practice async. Write an \`async\` function \`fetchDouble(n)\` that uses \`await\` on the provided \`slowDouble\` helper (it returns a promise that doubles a number) and returns the doubled value.

\`slowDouble\` is given. Just \`await\` it and return the result.`,
        ar: `تدرّب على async. اكتب دالة \`async\` اسمها \`fetchDouble(n)\` تستخدم \`await\` على المساعد \`slowDouble\` المرفق (يعيد وعداً يضاعف رقماً) وتعيد القيمة المضاعفة.

\`slowDouble\` معطاة. فقط \`await\` عليها وأعِد النتيجة.`,
      },
      starterCode: `// given: returns a promise that resolves to n * 2
function slowDouble(n) {
  return new Promise(resolve => setTimeout(() => resolve(n * 2), 10));
}

async function fetchDouble(n) {
  // await slowDouble(n) and return it
}

fetchDouble(5).then(result => console.log(result)); // 10`,
      solution: `function slowDouble(n) {
  return new Promise(resolve => setTimeout(() => resolve(n * 2), 10));
}

async function fetchDouble(n) {
  const result = await slowDouble(n);
  return result;
}

fetchDouble(5).then(result => console.log(result)); // 10`,
      hints: [
        { en: `Inside the async function: const result = await slowDouble(n);`, ar: `داخل الدالة async: const result = await slowDouble(n);` },
        { en: `Then return result. await pauses until the promise resolves.`, ar: `ثم return result. تُوقف await حتى يتحقق الوعد.` },
      ],
      tests: [
        { name: { en: "fetchDouble is async (returns a promise)", ar: "fetchDouble غير متزامنة (تعيد وعداً)" }, check: `typeof fetchDouble(1).then === "function"` },
        { name: { en: "fetchDouble(5) resolves to 10", ar: "fetchDouble(5) تتحقق بـ 10" }, check: `(await fetchDouble(5)) === 10` },
        { name: { en: "fetchDouble(0) resolves to 0", ar: "fetchDouble(0) تتحقق بـ 0" }, check: `(await fetchDouble(0)) === 0` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What did Node.js make possible?", ar: "ماذا أتاح Node.js؟" },
          choices: [
            { en: "Running JavaScript outside the browser (e.g. on servers)", ar: "تشغيل جافاسكربت خارج المتصفح (مثل الخوادم)" },
            { en: "Running Python in the browser", ar: "تشغيل بايثون في المتصفح" },
            { en: "Replacing HTML", ar: "استبدال HTML" },
          ],
          answer: 0,
          explain: {
            en: "Node is a JS runtime for servers and tools — enabling one language across the whole stack.",
            ar: "Node بيئة تشغيل JS للخوادم والأدوات — تتيح لغة واحدة عبر المنظومة كاملة.",
          },
        },
        {
          q: { en: "What does 'non-blocking' mean?", ar: "ماذا يعني 'غير حاجب'؟" },
          choices: [
            { en: "The server freezes during slow tasks", ar: "يتجمّد الخادم أثناء المهام البطيئة" },
            { en: "The server keeps handling other work while a slow task runs", ar: "يواصل الخادم عملاً آخر بينما تعمل مهمة بطيئة" },
            { en: "It blocks all users", ar: "يحجب كل المستخدمين" },
          ],
          answer: 1,
          explain: {
            en: "Like the waiter serving other tables while food cooks, Node handles many requests without waiting idle.",
            ar: "كالنادل يخدم طاولات أخرى بينما يُطهى الطعام، يعالج Node طلبات كثيرة دون انتظار خامل.",
          },
        },
        {
          q: { en: "What is npm?", ar: "ما هو npm؟" },
          choices: [
            { en: "Node's package manager — a huge library of reusable code", ar: "مدير حزم Node — مكتبة ضخمة من الكود القابل لإعادة الاستخدام" },
            { en: "A programming language", ar: "لغة برمجة" },
            { en: "A database", ar: "قاعدة بيانات" },
          ],
          answer: 0,
          explain: {
            en: "npm install <package> pulls in free, community-built libraries — one of Node's biggest strengths.",
            ar: "npm install <package> يجلب مكتبات مجانية بناها المجتمع — من أكبر نقاط قوة Node.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Node.js runs JavaScript on servers — one language, whole stack
- Non-blocking async (async/await) lets one server handle many requests
- npm gives you a giant library ecosystem; Express makes REST routing simple
- You wrote real async/await code

**Build it:** \`npm init -y\`, \`npm install express\`, and make the tiny server above return your own JSON. **Next:** Caching & Queues — making backends fast and resilient.`,
        ar: `## الخلاصة

- Node.js يشغّل جافاسكربت على الخوادم — لغة واحدة، منظومة كاملة
- غير الحاجب async (async/await) يتيح لخادم واحد معالجة طلبات كثيرة
- npm يمنحك نظام مكتبات ضخماً؛ وExpress يبسّط توجيه REST
- كتبت كود async/await حقيقياً

**ابنِه:** \`npm init -y\`، \`npm install express\`، واجعل الخادم الصغير أعلاه يعيد JSON خاصاً بك. **التالي:** التخزين المؤقت والطوابير — لجعل الخلفيات سريعة ومرنة.`,
      },
    },
  ],
};
