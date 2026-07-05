import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "javascript",
  title: { en: "JavaScript — Make Pages Come Alive", ar: "JavaScript — اجعل الصفحات تنبض بالحياة" },
  estMinutes: 50,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What JavaScript actually does (with zero jargon)
- **Variables** — boxes that remember things
- **Functions** — recipes you write once and reuse forever
- **The DOM** — how JavaScript touches the page
- Finish with a real interactive click counter

Everything runs right here. No setup.`,
        ar: `## ماذا ستتعلم

- ما الذي يفعله JavaScript فعلياً (بدون مصطلحات معقدة)
- **المتغيرات** — صناديق تتذكر الأشياء
- **الدوال** — وصفات تكتبها مرة وتعيد استخدامها للأبد
- **الـ DOM** — كيف يلمس JavaScript الصفحة
- وتختم بعدّاد نقرات تفاعلي حقيقي

كل شيء يعمل هنا مباشرة. بدون أي تجهيز.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The robot in the house 🤖

Remember our house? HTML is the walls, CSS is the paint. **JavaScript is a robot living inside** that can *do things*: open doors when someone knocks, count visitors, change the wallpaper at night.

JavaScript is a list of **instructions** the browser follows, one line at a time, top to bottom.

The first instruction to learn: **remember something**. We do that with a **variable** — a labeled box:

\`\`\`js
let score = 0;        // a box called "score" holding 0
const name = "Sara";  // a box that can never be swapped
\`\`\`

- \`let\` makes a box you can change later (\`score = score + 1\`)
- \`const\` makes a locked box — trying to change it is an error

And to **see** what's in a box, we use \`console.log(...)\` — the robot's mouth. Whatever you put inside, it says out loud in the Console panel.`,
        ar: `## الروبوت داخل المنزل 🤖

تذكر منزلنا؟ HTML هو الجدران، وCSS هو الطلاء. **JavaScript روبوت يسكن بالداخل** ويستطيع *فعل الأشياء*: يفتح الباب عندما يطرقه أحد، يعدّ الزوار، يغيّر ورق الجدران ليلاً.

JavaScript هو قائمة **تعليمات** ينفذها المتصفح سطراً بسطر، من الأعلى إلى الأسفل.

أول تعليمة تتعلمها: **تذكَّر شيئاً**. نفعل ذلك بـ**المتغير** — صندوق عليه ملصق:

\`\`\`js
let score = 0;        // صندوق اسمه "score" بداخله 0
const name = "Sara";  // صندوق مقفل لا يمكن استبدال محتواه
\`\`\`

- \`let\` يصنع صندوقاً يمكنك تغييره لاحقاً (\`score = score + 1\`)
- \`const\` يصنع صندوقاً مقفلاً — محاولة تغييره خطأ

ولكي **ترى** ما في الصندوق نستخدم \`console.log(...)\` — فم الروبوت. كل ما تضعه بداخله يقوله بصوت عالٍ في لوحة وحدة التحكم.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `let score = 0;
const player = "Sara";

score = score + 10;
score = score + 5;

console.log(player, "has", score, "points");`,
      explanation: {
        en: `Run this and watch the Console below. The robot creates two boxes, adds points twice, then announces the result. Change the numbers and run again.`,
        ar: `شغّل هذا وراقب وحدة التحكم بالأسفل. الروبوت يصنع صندوقين، يضيف نقاطاً مرتين، ثم يعلن النتيجة. غيّر الأرقام وشغّل مجدداً.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Create your own boxes:
1. A variable \`myName\` holding your name (text goes in quotes: \`"..."\`)
2. A variable \`age\` holding a number
3. Print both with \`console.log(myName, age)\``,
        ar: `اصنع صناديقك الخاصة:
1. متغير \`myName\` يحمل اسمك (النص يوضع بين علامتي اقتباس: \`"..."\`)
2. متغير \`age\` يحمل رقماً
3. اطبعهما معاً بـ \`console.log(myName, age)\``,
      },
      starterCode: `// 1. create myName
// 2. create age
// 3. print them

`,
      solution: `const myName = "Mshari";
const age = 25;
console.log(myName, age);`,
      hints: [
        { en: `Text needs quotes: \`const myName = "Ali";\` — numbers don't: \`const age = 20;\``, ar: `النص يحتاج اقتباس: \`const myName = "Ali";\` — الأرقام لا تحتاج: \`const age = 20;\`` },
        { en: `console.log can take several things separated by commas.`, ar: `console.log يقبل عدة أشياء مفصولة بفواصل.` },
      ],
      tests: [
        {
          name: { en: "myName exists and is text", ar: "myName موجود وهو نص" },
          check: `typeof myName === "string" && myName.length > 0`,
        },
        {
          name: { en: "age exists and is a number", ar: "age موجود وهو رقم" },
          check: `typeof age === "number"`,
        },
        {
          name: { en: "Something was printed to the console", ar: "طُبع شيء في وحدة التحكم" },
          check: `window.__consoleLog.length >= 1`,
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Functions — recipes 👨‍🍳

Imagine you make tea 5 times a day. Would you re-explain the whole process every time? No — you'd write the recipe **once**, name it "make tea", and just say the name.

A **function** is exactly that: a named recipe.

\`\`\`js
function greet(person) {
  return "Hello, " + person + "!";
}

console.log(greet("Omar"));   // Hello, Omar!
console.log(greet("Lina"));   // Hello, Lina!
\`\`\`

- \`function greet(person)\` — recipe named \`greet\` that needs one ingredient: \`person\`
- \`return\` — what the recipe hands back when done
- \`greet("Omar")\` — *calling* the recipe with a real ingredient

Write once, use a thousand times. This is the single most important idea in programming.`,
        ar: `## الدوال — الوصفات 👨‍🍳

تخيّل أنك تعدّ الشاي 5 مرات يومياً. هل ستشرح العملية كاملة كل مرة؟ لا — ستكتب الوصفة **مرة واحدة**، تسميها "أعدّ الشاي"، ثم تنادي الاسم فقط.

**الدالة** هي هذا بالضبط: وصفة لها اسم.

\`\`\`js
function greet(person) {
  return "Hello, " + person + "!";
}

console.log(greet("Omar"));   // Hello, Omar!
console.log(greet("Lina"));   // Hello, Lina!
\`\`\`

- \`function greet(person)\` — وصفة اسمها \`greet\` تحتاج مكوّناً واحداً: \`person\`
- \`return\` — ما تعيده الوصفة عند الانتهاء
- \`greet("Omar")\` — *استدعاء* الوصفة بمكوّن حقيقي

اكتب مرة، استخدم ألف مرة. هذه أهم فكرة في البرمجة كلها.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Write a function called \`add\` that takes two numbers and **returns** their sum. Then print \`add(2, 3)\` to check it works.`,
        ar: `اكتب دالة اسمها \`add\` تستقبل رقمين و**تعيد** مجموعهما. ثم اطبع \`add(2, 3)\` للتأكد أنها تعمل.`,
      },
      starterCode: `// function add(a, b) { ... }

`,
      solution: `function add(a, b) {
  return a + b;
}

console.log(add(2, 3)); // 5`,
      hints: [
        { en: `The skeleton: \`function add(a, b) { return ???; }\``, ar: `الهيكل: \`function add(a, b) { return ???; }\`` },
        { en: `Inside, return a + b — don't forget the return word, printing is not returning!`, ar: `بالداخل أعد a + b — لا تنسَ كلمة return، فالطباعة ليست إعادة!` },
      ],
      tests: [
        {
          name: { en: "add is a function", ar: "add دالة" },
          check: `typeof add === "function"`,
        },
        {
          name: { en: "add(2, 3) returns 5", ar: "add(2, 3) تعيد 5" },
          check: `add(2, 3) === 5`,
        },
        {
          name: { en: "add(10, -4) returns 6", ar: "add(10, -4) تعيد 6" },
          check: `add(10, -4) === 6`,
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## The DOM — the robot's hands 🖐️

So far the robot only talks to the console. But it can also **touch the page**: read it, change it, react to clicks. The page, as JavaScript sees it, is called the **DOM** (Document Object Model) — think of it as the house's control panel.

Three magic moves:

\`\`\`js
// 1. GRAB an element (like CSS selectors!)
const btn = document.querySelector("#myBtn");

// 2. LISTEN for something happening
btn.addEventListener("click", function () {
  // 3. CHANGE the page
  document.querySelector("#msg").textContent = "You clicked!";
});
\`\`\`

- \`document.querySelector("#myBtn")\` — find the element with \`id="myBtn"\`
- \`addEventListener("click", ...)\` — "when clicked, run this recipe"
- \`.textContent = ...\` — replace the text inside an element

Grab → Listen → Change. That's 90% of everyday frontend JavaScript.`,
        ar: `## الـ DOM — يدا الروبوت 🖐️

حتى الآن الروبوت يتكلم مع وحدة التحكم فقط. لكنه يستطيع أيضاً **لمس الصفحة**: قراءتها، تغييرها، والاستجابة للنقرات. الصفحة كما يراها JavaScript تسمى **DOM** — تخيّلها لوحة تحكم المنزل.

ثلاث حركات سحرية:

\`\`\`js
// 1. أمسِك عنصراً (مثل محددات CSS تماماً!)
const btn = document.querySelector("#myBtn");

// 2. استمع لحدث
btn.addEventListener("click", function () {
  // 3. غيّر الصفحة
  document.querySelector("#msg").textContent = "نقرت!";
});
\`\`\`

- \`document.querySelector("#myBtn")\` — جد العنصر ذا \`id="myBtn"\`
- \`addEventListener("click", ...)\` — "عند النقر، نفّذ هذه الوصفة"
- \`.textContent = ...\` — استبدل النص داخل عنصر

أمسِك ← استمع ← غيّر. هذه 90% من JavaScript اليومي في الواجهات.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `**The click counter** — the classic first interactive app!

The HTML has a button and a \`<span id="count">\`. Write the script so that **every click adds 1** to the number shown.

Steps: grab both elements → make a \`let clicks = 0\` box → listen for "click" → increase the box → put it in the span.`,
        ar: `**عدّاد النقرات** — أول تطبيق تفاعلي كلاسيكي!

في الـ HTML زر و \`<span id="count">\`. اكتب السكربت بحيث **كل نقرة تضيف 1** إلى الرقم الظاهر.

الخطوات: أمسك العنصرين ← اصنع صندوق \`let clicks = 0\` ← استمع لـ "click" ← زد الصندوق ← ضعه في الـ span.`,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <body style="font-family: sans-serif; text-align: center; padding-top: 40px;">
    <h1>Clicks: <span id="count">0</span></h1>
    <button id="btn" style="font-size: 18px; padding: 10px 24px;">Click me!</button>

    <script>
      // your code here

    </script>
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <body style="font-family: sans-serif; text-align: center; padding-top: 40px;">
    <h1>Clicks: <span id="count">0</span></h1>
    <button id="btn" style="font-size: 18px; padding: 10px 24px;">Click me!</button>

    <script>
      const btn = document.querySelector("#btn");
      const count = document.querySelector("#count");
      let clicks = 0;

      btn.addEventListener("click", function () {
        clicks = clicks + 1;
        count.textContent = clicks;
      });
    </script>
  </body>
</html>`,
      hints: [
        { en: `Grab them: \`const btn = document.querySelector("#btn");\` and the same for \`#count\`.`, ar: `أمسكهما: \`const btn = document.querySelector("#btn");\` ومثله لـ \`#count\`.` },
        { en: `Inside the listener: \`clicks = clicks + 1; count.textContent = clicks;\``, ar: `داخل المستمع: \`clicks = clicks + 1; count.textContent = clicks;\`` },
        { en: `The whole listener: \`btn.addEventListener("click", function () { ... });\``, ar: `المستمع كاملاً: \`btn.addEventListener("click", function () { ... });\`` },
      ],
      tests: [
        {
          name: { en: "The button and counter exist", ar: "الزر والعدّاد موجودان" },
          check: `document.querySelector("#btn") !== null && document.querySelector("#count") !== null`,
        },
        {
          name: { en: "Clicking once shows 1", ar: "نقرة واحدة تُظهر 1" },
          check: `(function(){ var b = document.querySelector("#btn"); var c = document.querySelector("#count"); b.click(); return c.textContent.trim() === "1"; })()`,
        },
        {
          name: { en: "Two more clicks show 3", ar: "نقرتان إضافيتان تُظهران 3" },
          check: `(function(){ var b = document.querySelector("#btn"); var c = document.querySelector("#count"); b.click(); b.click(); return c.textContent.trim() === "3"; })()`,
        },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Which keyword makes a box you CAN change later?", ar: "أي كلمة تصنع صندوقاً يمكنك تغييره لاحقاً؟" },
          choices: [
            { en: "const", ar: "const" },
            { en: "let", ar: "let" },
            { en: "function", ar: "function" },
          ],
          answer: 1,
          explain: {
            en: "let allows reassignment; const locks the box. Use const by default and let only when you plan to change the value.",
            ar: "let تسمح بإعادة الإسناد؛ const تقفل الصندوق. استخدم const افتراضياً و let فقط عندما تنوي تغيير القيمة.",
          },
        },
        {
          q: { en: "What does return do inside a function?", ar: "ماذا تفعل return داخل الدالة؟" },
          choices: [
            { en: "Prints to the console", ar: "تطبع في وحدة التحكم" },
            { en: "Hands back the result and exits the function", ar: "تعيد النتيجة وتُنهي الدالة" },
            { en: "Repeats the function", ar: "تكرر الدالة" },
          ],
          answer: 1,
          explain: {
            en: "return sends a value back to whoever called the function and stops execution. console.log only displays — it returns nothing.",
            ar: "return ترسل قيمة لمن استدعى الدالة وتوقف التنفيذ. console.log تعرض فقط — ولا تعيد شيئاً.",
          },
        },
        {
          q: { en: "How do you find the element with id=\"save\"?", ar: "كيف تجد العنصر ذا id=\"save\"؟" },
          choices: [
            { en: `document.querySelector(".save")`, ar: `document.querySelector(".save")` },
            { en: `document.querySelector("#save")`, ar: `document.querySelector("#save")` },
            { en: `document.find("save")`, ar: `document.find("save")` },
          ],
          answer: 1,
          explain: {
            en: "querySelector uses CSS selector syntax: # for ids, . for classes — exactly like in CSS.",
            ar: "querySelector يستخدم صيغة محددات CSS: علامة # للمعرفات و . للكلاسات — تماماً كما في CSS.",
          },
        },
        {
          q: { en: "addEventListener(\"click\", fn) means…", ar: "addEventListener(\"click\", fn) تعني…" },
          choices: [
            { en: "Click the element right now", ar: "انقر العنصر الآن" },
            { en: "When a click happens, run fn", ar: "عندما يحدث نقر، نفّذ fn" },
            { en: "Prevent all clicks", ar: "امنع كل النقرات" },
          ],
          answer: 1,
          explain: {
            en: "It registers a recipe to run later, every time the event fires. Nothing happens until the user actually clicks.",
            ar: "تسجّل وصفة لتعمل لاحقاً، في كل مرة يقع الحدث. لا يحدث شيء حتى ينقر المستخدم فعلاً.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Level complete 🏆

You now know:

- **Variables** (\`let\`, \`const\`) — remembering things
- **Functions** — reusable recipes with \`return\`
- **DOM** — grab, listen, change

**What's next?** Practice is everything in JavaScript. Try: a counter that also goes down, a button that changes the page color, a name-greeting input. Then continue to **Git & GitHub** to save your work like a professional — and later **React**, which builds on everything here.`,
        ar: `## اكتملت المرحلة 🏆

أنت الآن تعرف:

- **المتغيرات** (\`let\`، \`const\`) — تذكّر الأشياء
- **الدوال** — وصفات قابلة لإعادة الاستخدام مع \`return\`
- **DOM** — أمسِك، استمع، غيّر

**ما التالي؟** الممارسة هي كل شيء في JavaScript. جرّب: عدّاداً ينقص أيضاً، زراً يغيّر لون الصفحة، حقلَ اسمٍ يرحب بك. ثم تابع إلى **Git و GitHub** لتحفظ عملك كالمحترفين — ولاحقاً **React** الذي يبني على كل ما هنا.`,
      },
    },
  ],
};
