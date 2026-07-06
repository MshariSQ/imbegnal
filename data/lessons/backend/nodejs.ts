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
      type: "text",
      body: {
        en: `## The event loop — one thread, thousands of requests 🔁

How does a single-threaded runtime like Node handle 10,000 simultaneous users without 10,000 threads? The answer is the **event loop**, and it's worth building a mental picture of it.

Node runs your JavaScript on **one thread**. When your code calls something slow — reading a file, querying a database, making a network request — Node doesn't wait there. It hands that slow operation off to the system (or a background thread pool) and immediately moves on to the *next* line of code that's ready to run. When the slow operation finishes, its callback gets placed in a queue, and the **event loop** picks it up the moment the main thread is free.

\`\`\`
Call stack (your running code)
     ↓ "this is slow, I'll notify you later"
Background (OS / thread pool handles file I/O, network, timers)
     ↓ "done! here's your callback"
Callback queue → event loop pushes it onto the call stack when it's empty
\`\`\`

This is why a single Node process can juggle thousands of open connections: it's never *computing* for all of them at once, it's just never sitting idle waiting for slow I/O either. The trade-off is the flip side of the same coin — if your own JavaScript code runs a genuinely slow **computation** (not I/O, like a giant loop), it blocks that one thread and everything else really does have to wait, since there's only one. That's why heavy CPU work in Node is usually pushed to a separate worker process, while I/O-bound work (which is most of what backends do — waiting on databases and APIs) is exactly what the event loop is built for.`,
        ar: `## حلقة الأحداث — خيط واحد، آلاف الطلبات 🔁

كيف تتعامل بيئة تشغيل أحادية الخيط كـ Node مع 10,000 مستخدم متزامن دون 10,000 خيط؟ الإجابة هي **حلقة الأحداث (event loop)**، ويستحق الأمر بناء صورة ذهنية لها.

يشغّل Node جافاسكربت الخاصة بك على **خيط واحد**. حين يستدعي كودك شيئاً بطيئاً — قراءة ملف، استعلام قاعدة بيانات، طلب شبكة — لا ينتظر Node هناك. بل يسلّم تلك العملية البطيئة للنظام (أو مجمع خيوط خلفي) وينتقل فوراً إلى *السطر التالي* من الكود الجاهز للتشغيل. حين تنتهي العملية البطيئة، توضع دالتها المؤجلة (callback) في طابور، وتلتقطها **حلقة الأحداث** لحظة تفرّغ الخيط الرئيسي.

\`\`\`
مكدس الاستدعاء (كودك العامل)
     ↓ "هذا بطيء، سأخبرك لاحقاً"
الخلفية (النظام / مجمع خيوط يتولى I/O الملفات والشبكة والمؤقتات)
     ↓ "انتهيت! إليك دالتك المؤجلة"
طابور الدوال المؤجلة ← حلقة الأحداث تدفعها إلى مكدس الاستدعاء حين يفرغ
\`\`\`

هذا سبب قدرة عملية Node واحدة على موازنة آلاف الاتصالات المفتوحة: إنها لا *تحسب* لكل واحد منها في آن، لكنها أيضاً لا تجلس خاملة أبداً منتظرة I/O بطيئاً. المقايضة هي الوجه الآخر لنفس العملة — إن نفّذ كودك الخاص **حساباً** بطيئاً فعلاً (لا I/O، كحلقة عملاقة)، يحجب ذلك الخيط الوحيد ويضطر كل شيء آخر فعلاً للانتظار، إذ لا يوجد سوى خيط واحد. لهذا يُدفع العمل الحسابي الثقيل في Node عادة لعملية عامل منفصلة، بينما العمل المرتبط بـ I/O (وهو معظم ما تفعله الخلفيات — انتظار قواعد البيانات وواجهات API) هو بالضبط ما بُنيت حلقة الأحداث من أجله.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Predict and produce event-loop ordering. Complete \`orderedLog()\` so that it logs (and returns as an array) the strings in the order Node's event loop would actually run them: synchronous code first, then the async one, in the order shown by the comments.

Push each string onto the \`order\` array instead of just console.log-ing it, so we can check the exact sequence.`,
        ar: `توقّع ورتّب تسلسل حلقة الأحداث. أكمل \`orderedLog()\` بحيث تسجّل (وتعيد كمصفوفة) النصوص بنفس الترتيب الذي ستشغّلها به حلقة أحداث Node فعلياً: الكود المتزامن أولاً، ثم غير المتزامن، بالترتيب الموضّح بالتعليقات.

ادفع كل نص إلى مصفوفة \`order\` بدل مجرد console.log، كي نتحقق من التسلسل بالضبط.`,
      },
      starterCode: `function orderedLog() {
  const order = [];

  order.push("1: sync start");

  setTimeout(() => {
    // this runs LAST (async, deferred to the event loop)
    order.push("4: setTimeout callback");
  }, 0);

  Promise.resolve().then(() => {
    // this runs AFTER sync code but BEFORE setTimeout
    order.push("3: promise callback");
  });

  order.push("2: sync end");

  return order; // note: this returns before the async ones ran! see below.
}

// Because async callbacks fire later, we need to wait before checking "order".
// This helper waits long enough for both the promise and the timeout to fire.
async function getFinalOrder() {
  const order = orderedLog();
  await new Promise(resolve => setTimeout(resolve, 10));
  return order;
}

getFinalOrder().then(o => console.log(o));
// ["1: sync start", "2: sync end", "3: promise callback", "4: setTimeout callback"]`,
      solution: `function orderedLog() {
  const order = [];

  order.push("1: sync start");

  setTimeout(() => {
    order.push("4: setTimeout callback");
  }, 0);

  Promise.resolve().then(() => {
    order.push("3: promise callback");
  });

  order.push("2: sync end");

  return order;
}

async function getFinalOrder() {
  const order = orderedLog();
  await new Promise(resolve => setTimeout(resolve, 10));
  return order;
}

getFinalOrder().then(o => console.log(o));`,
      hints: [
        { en: `All the synchronous order.push calls ("1" and "2") run immediately, before any callback — even setTimeout(fn, 0).`, ar: `كل استدعاءات order.push المتزامنة ("1" و"2") تعمل فوراً، قبل أي دالة مؤجلة — حتى setTimeout(fn, 0).` },
        { en: `Promise callbacks (microtasks) always run before setTimeout callbacks (macrotasks), even with a 0ms delay — that gives the "3 before 4" order.`, ar: `دوال الوعود المؤجلة (microtasks) تعمل دائماً قبل دوال setTimeout المؤجلة (macrotasks)، حتى بتأخير 0ms — هذا يعطي ترتيب "3 قبل 4".` },
      ],
      tests: [
        { name: { en: "Synchronous lines run first, in order", ar: "الأسطر المتزامنة تعمل أولاً، بالترتيب" }, check: `(async () => { const o = await getFinalOrder(); return o[0] === "1: sync start" && o[1] === "2: sync end"; })()` },
        { name: { en: "Promise callback runs before setTimeout callback", ar: "دالة الوعد المؤجلة تعمل قبل دالة setTimeout" }, check: `(async () => { const o = await getFinalOrder(); return o[2] === "3: promise callback" && o[3] === "4: setTimeout callback"; })()` },
        { name: { en: "All four entries are present", ar: "كل الإدخالات الأربعة موجودة" }, check: `(async () => { const o = await getFinalOrder(); return o.length === 4; })()` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: why Node.js exists at all 🔍

Node.js wasn't an accident — it was a direct reaction to a specific, well-known performance problem. Ryan Dahl, its creator, presented Node at JSConf in 2009, and the motivating example he opened with was famously simple: a file upload progress bar. On traditional web servers of that era (like Apache, using one thread or process per connection), handling thousands of slow, simultaneous connections — like many users uploading files at once — meant thousands of threads, each consuming memory just to sit around *waiting* for slow disk or network I/O to finish. That waiting was the whole problem: threads are expensive, and most of a web server's life is spent waiting on I/O, not computing.

Dahl's insight was to flip the model entirely: use one thread, but never let it sit idle waiting. Instead, hand off every slow operation and let an event loop route callbacks back in when they're ready — exactly the mechanism this lesson just walked through. Because JavaScript already had a natural culture of callbacks (from browser event handlers like "onclick") and, critically, no existing built-in blocking I/O APIs to break compatibility with, it turned out to be an unusually good fit for this non-blocking model — arguably better suited than most server-side languages available at the time.

The bet paid off dramatically: companies including Netflix, PayPal, LinkedIn, and Uber rebuilt significant parts of their backend infrastructure on Node specifically because I/O-heavy workloads (which is most of what a typical backend does — waiting on databases, APIs, and file systems) run remarkably efficiently on this model. LinkedIn famously reported replacing 30 servers running their old Ruby-based mobile backend with 3 Node.js servers after a rewrite. None of that is about JavaScript being a "faster" language in the raw-computation sense — it's entirely about the event loop model this lesson covers being the right tool for I/O-bound work.`,
        ar: `## دراسة حالة واقعية: لماذا يوجد Node.js أصلاً 🔍

لم يكن Node.js صدفة — بل كان رد فعل مباشراً على مشكلة أداء محددة ومعروفة جيداً. Ryan Dahl، مبتكره، قدّم Node في مؤتمر JSConf عام 2009، وكان المثال المُحفّز الذي افتتح به بسيطاً بشكل مشهور: شريط تقدّم رفع ملف. على خوادم الويب التقليدية في ذلك العصر (كـ Apache، التي تستخدم خيطاً أو عملية واحدة لكل اتصال)، كان التعامل مع آلاف الاتصالات البطيئة المتزامنة — كمستخدمين كثر يرفعون ملفات في آن — يعني آلاف الخيوط، كل واحد يستهلك ذاكرة فقط ليجلس *منتظراً* انتهاء قرص أو شبكة بطيئة. كان الانتظار هو المشكلة كلها: الخيوط مكلفة، ومعظم حياة خادم الويب تُقضى منتظرة I/O، لا حاسبة.

كانت بصيرة Dahl قلب النموذج كلياً: استخدم خيطاً واحداً، لكن لا تدعه يجلس خاملاً منتظراً أبداً. بدلاً من ذلك، سلّم كل عملية بطيئة ودع حلقة أحداث تعيد توجيه الدوال المؤجلة حين تصبح جاهزة — بالضبط الآلية التي استعرضها هذا الدرس للتو. ولأن جافاسكربت كانت تملك أصلاً ثقافة طبيعية من الدوال المؤجلة (من معالجات أحداث المتصفح كـ "onclick")، والأهم، لم تملك واجهات I/O حاجبة مدمجة موجودة مسبقاً قد تكسر التوافق معها، تبيّن أنها ملائمة بشكل استثنائي لهذا النموذج غير الحاجب — يُجادَل بأنها أنسب من معظم لغات الخلفية المتاحة حينها.

آتى الرهان ثماره بشكل كبير: شركات منها Netflix وPayPal وLinkedIn وUber أعادت بناء أجزاء مهمة من بنيتها التحتية الخلفية على Node تحديداً لأن أعباء العمل الثقيلة بـ I/O (وهي معظم ما تفعله خلفية نموذجية — انتظار قواعد البيانات وواجهات API وأنظمة الملفات) تعمل بكفاءة لافتة على هذا النموذج. أبلغت LinkedIn بشكل مشهور عن استبدال 30 خادماً يشغّل خلفية جوالها القديمة القائمة على Ruby بـ3 خوادم Node.js فقط بعد إعادة كتابة. لا شيء من هذا يتعلق بكون جافاسكربت لغة "أسرع" بمعنى الحساب الخام — الأمر كله يتعلق بنموذج حلقة الأحداث الذي يغطيه هذا الدرس كونه الأداة الصحيحة للعمل المرتبط بـ I/O.`,
      },
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
        {
          q: { en: "In Node's event loop, what runs first for a given piece of code?", ar: "في حلقة أحداث Node، ماذا يعمل أولاً لجزء معطى من الكود؟" },
          choices: [
            { en: "All synchronous code, before any callback — even a setTimeout with a 0ms delay", ar: "كل الكود المتزامن، قبل أي دالة مؤجلة — حتى setTimeout بتأخير 0ms" },
            { en: "setTimeout callbacks always run before synchronous code", ar: "دوال setTimeout المؤجلة تعمل دائماً قبل الكود المتزامن" },
            { en: "The order is completely random", ar: "الترتيب عشوائي تماماً" },
          ],
          answer: 0,
          explain: {
            en: "The main thread finishes all synchronous work first; only once it's idle does the event loop pull queued callbacks.",
            ar: "الخيط الرئيسي يُنهي كل العمل المتزامن أولاً؛ وفقط حين يتفرّغ تسحب حلقة الأحداث الدوال المؤجلة المصطفّة.",
          },
        },
        {
          q: { en: "What made JavaScript an especially good fit for Node's non-blocking model?", ar: "ما الذي جعل جافاسكربت ملائمة بشكل خاص لنموذج Node غير الحاجب؟" },
          choices: [
            { en: "It already had a callback culture and no legacy blocking I/O APIs to conflict with", ar: "كانت تملك أصلاً ثقافة دوال مؤجلة ولا واجهات I/O حاجبة قديمة تتعارض معها" },
            { en: "It was the fastest language for raw computation", ar: "كانت أسرع لغة للحساب الخام" },
            { en: "It didn't support functions", ar: "لم تكن تدعم الدوال" },
          ],
          answer: 0,
          explain: {
            en: "Browser-style callbacks (like click handlers) meant JS developers were already comfortable with 'run this when it's ready' code.",
            ar: "الدوال المؤجلة على طراز المتصفح (كمعالجات النقر) عنت أن مطوري JS كانوا مرتاحين أصلاً لكود 'شغّل هذا حين يجهز'.",
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
- You wrote real async/await code, then traced the exact order the **event loop** runs sync code, promises, and timers
- Node's whole design — one thread, never blocking on I/O — is why Netflix, PayPal, and LinkedIn rebuilt backends on it

**Build it:** \`npm init -y\`, \`npm install express\`, and make the tiny server above return your own JSON. **Next:** Caching & Queues — making backends fast and resilient.`,
        ar: `## الخلاصة

- Node.js يشغّل جافاسكربت على الخوادم — لغة واحدة، منظومة كاملة
- غير الحاجب async (async/await) يتيح لخادم واحد معالجة طلبات كثيرة
- npm يمنحك نظام مكتبات ضخماً؛ وExpress يبسّط توجيه REST
- كتبت كود async/await حقيقياً، ثم تتبّعت الترتيب بالضبط الذي تشغّل به **حلقة الأحداث** الكود المتزامن والوعود والمؤقتات
- تصميم Node بأكمله — خيط واحد، لا يحجب أبداً على I/O — هو سبب إعادة بناء Netflix وPayPal وLinkedIn لخلفياتها عليه

**ابنِه:** \`npm init -y\`، \`npm install express\`، واجعل الخادم الصغير أعلاه يعيد JSON خاصاً بك. **التالي:** التخزين المؤقت والطوابير — لجعل الخلفيات سريعة ومرنة.`,
      },
    },
  ],
};
