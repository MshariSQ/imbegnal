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
- **Conditionals** — how code makes decisions
- **Arrays and loops** — handling many things at once, not just one
- **The DOM** — how JavaScript touches the page
- Finish with a real interactive click counter

Everything runs right here. No setup.`,
        ar: `## ماذا ستتعلم

- ما الذي يفعله JavaScript فعلياً (بدون مصطلحات معقدة)
- **المتغيرات** — صناديق تتذكر الأشياء
- **الدوال** — وصفات تكتبها مرة وتعيد استخدامها للأبد
- **الشروط** — كيف يتخذ الكود قرارات
- **المصفوفات والحلقات** — التعامل مع أشياء كثيرة، لا شيء واحد فقط
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
        en: `## Conditionals — teaching the robot to decide 🤔

Real programs don't just run top to bottom blindly — they make decisions. "**If** it's raining, take an umbrella. **Otherwise**, don't." JavaScript writes that exact sentence:

\`\`\`js
const isRaining = true;

if (isRaining) {
  console.log("Take an umbrella");
} else {
  console.log("Enjoy the sun");
}
\`\`\`

To make decisions you need **comparisons**, which produce \`true\` or \`false\`:

\`\`\`js
5 > 3          // true
5 === 5        // true  ("===" means "is exactly equal to")
5 !== 3        // true  ("!==" means "is not equal to")
age >= 18      // true if age is 18 or more
\`\`\`

⚠️ **Common trap:** always use \`===\` (three equals) to compare values, not \`=\` (one equals, which *assigns* a value and would silently break your logic). This trips up every beginner at least once.

You can chain more conditions with \`else if\`:

\`\`\`js
const score = 75;

if (score >= 90) {
  console.log("Grade: A");
} else if (score >= 70) {
  console.log("Grade: B");
} else {
  console.log("Grade: C or below");
}
\`\`\``,
        ar: `## الشروط — تعليم الروبوت أن يقرر 🤔

البرامج الحقيقية لا تعمل من الأعلى للأسفل بعمى — بل تتخذ قرارات. "**إن** كانت السماء تمطر، خذ مظلة. **وإلا**، لا تفعل." JavaScript تكتب نفس الجملة بالضبط:

\`\`\`js
const isRaining = true;

if (isRaining) {
  console.log("Take an umbrella");
} else {
  console.log("Enjoy the sun");
}
\`\`\`

لاتخاذ قرارات تحتاج **مقارنات**، تُنتج \`true\` أو \`false\`:

\`\`\`js
5 > 3          // true
5 === 5        // true  ("===" تعني "يساوي تماماً")
5 !== 3        // true  ("!==" تعني "لا يساوي")
age >= 18      // true إن كان العمر 18 أو أكثر
\`\`\`

⚠️ **فخ شائع:** استخدم دائماً \`===\` (ثلاث علامات مساواة) لمقارنة القيم، لا \`=\` (علامة واحدة، التي *تُسند* قيمة وقد تكسر منطقك بصمت). هذا يوقع كل مبتدئ مرة واحدة على الأقل.

يمكنك سلسلة شروط أكثر بـ \`else if\`:

\`\`\`js
const score = 75;

if (score >= 90) {
  console.log("Grade: A");
} else if (score >= 70) {
  console.log("Grade: B");
} else {
  console.log("Grade: C or below");
}
\`\`\``,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Write a function \`checkAge(age)\` that returns:
- \`"child"\` if age is less than 13
- \`"teen"\` if age is 13 to 17 (inclusive)
- \`"adult"\` if age is 18 or more`,
        ar: `اكتب دالة \`checkAge(age)\` تعيد:
- \`"child"\` إذا كان العمر أقل من 13
- \`"teen"\` إذا كان العمر بين 13 و17 (شاملاً)
- \`"adult"\` إذا كان العمر 18 أو أكثر`,
      },
      starterCode: `function checkAge(age) {
  // use if / else if / else

}

console.log(checkAge(8));   // "child"
console.log(checkAge(15));  // "teen"
console.log(checkAge(30));  // "adult"`,
      solution: `function checkAge(age) {
  if (age < 13) {
    return "child";
  } else if (age <= 17) {
    return "teen";
  } else {
    return "adult";
  }
}

console.log(checkAge(8));   // "child"
console.log(checkAge(15));  // "teen"
console.log(checkAge(30));  // "adult"`,
      hints: [
        { en: `Check the smallest range first: if (age < 13) return "child";`, ar: `افحص أصغر نطاق أولاً: if (age < 13) return "child";` },
        { en: `Then: else if (age <= 17) return "teen"; else return "adult";`, ar: `ثم: else if (age <= 17) return "teen"; else return "adult";` },
      ],
      tests: [
        { name: { en: "checkAge(8) is \"child\"", ar: "checkAge(8) هي \"child\"" }, check: `checkAge(8) === "child"` },
        { name: { en: "checkAge(13) is \"teen\" (boundary)", ar: "checkAge(13) هي \"teen\" (الحد)" }, check: `checkAge(13) === "teen"` },
        { name: { en: "checkAge(17) is \"teen\" (boundary)", ar: "checkAge(17) هي \"teen\" (الحد)" }, check: `checkAge(17) === "teen"` },
        { name: { en: "checkAge(18) is \"adult\" (boundary)", ar: "checkAge(18) هي \"adult\" (الحد)" }, check: `checkAge(18) === "adult"` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Arrays and loops — many things, one instruction 📋

A **variable** holds one value. An **array** holds a whole *list* — like a shopping list in one box:

\`\`\`js
const fruits = ["apple", "banana", "mango"];

console.log(fruits[0]);      // "apple"  — arrays start counting at 0!
console.log(fruits.length);  // 3
fruits.push("orange");       // add to the end
\`\`\`

Now, what if you want to print *every* fruit? Writing \`console.log(fruits[0])\`, \`console.log(fruits[1])\`… by hand doesn't scale. A **loop** repeats an instruction for you:

\`\`\`js
for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}
\`\`\`

Read it as: "starting at \`i = 0\`, while \`i\` is less than the list's length, print \`fruits[i]\`, then add 1 to \`i\`, and repeat." This one pattern — loop over an array — is everywhere: rendering a list of products, checking every item in a cart, searching a list of users.

A shorter, modern version that many developers prefer:

\`\`\`js
for (const fruit of fruits) {
  console.log(fruit);
}
\`\`\`

This reads even more like English: "for each fruit of fruits, print it."`,
        ar: `## المصفوفات والحلقات — أشياء كثيرة، تعليمة واحدة 📋

**المتغير** يحمل قيمة واحدة. أما **المصفوفة (array)** فتحمل *قائمة* كاملة — كقائمة تسوق في صندوق واحد:

\`\`\`js
const fruits = ["apple", "banana", "mango"];

console.log(fruits[0]);      // "apple"  — المصفوفات تبدأ العدّ من 0!
console.log(fruits.length);  // 3
fruits.push("orange");       // أضف في النهاية
\`\`\`

الآن، ماذا لو أردت طباعة *كل* فاكهة؟ كتابة \`console.log(fruits[0])\`، \`console.log(fruits[1])\`… يدوياً لا يصلح لقوائم كبيرة. **الحلقة (loop)** تكرر تعليمة نيابة عنك:

\`\`\`js
for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}
\`\`\`

اقرأها: "ابدأ من \`i = 0\`، وطالما \`i\` أصغر من طول القائمة، اطبع \`fruits[i]\`، ثم أضف 1 إلى \`i\`، وكرّر." هذا النمط الواحد — التكرار على مصفوفة — موجود في كل مكان: عرض قائمة منتجات، فحص كل عنصر في سلة، البحث في قائمة مستخدمين.

نسخة أقصر وأحدث يفضّلها كثير من المطورين:

\`\`\`js
for (const fruit of fruits) {
  console.log(fruit);
}
\`\`\`

تُقرأ أشبه بالإنجليزية: "لكل فاكهة من fruits، اطبعها."`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Write a function \`sumArray(nums)\` that adds up every number in the array \`nums\` and returns the total, using a loop.`,
        ar: `اكتب دالة \`sumArray(nums)\` تجمع كل الأرقام في المصفوفة \`nums\` وتعيد المجموع، باستخدام حلقة.`,
      },
      starterCode: `function sumArray(nums) {
  let total = 0;
  // loop over nums and add each one to total

  return total;
}

console.log(sumArray([1, 2, 3]));    // 6
console.log(sumArray([10, 20]));     // 30`,
      solution: `function sumArray(nums) {
  let total = 0;
  for (const n of nums) {
    total = total + n;
  }
  return total;
}

console.log(sumArray([1, 2, 3]));    // 6
console.log(sumArray([10, 20]));     // 30`,
      hints: [
        { en: `for (const n of nums) { total = total + n; }`, ar: `for (const n of nums) { total = total + n; }` },
        { en: `Make sure total starts at 0 before the loop, and is returned after it.`, ar: `تأكّد أن total تبدأ من 0 قبل الحلقة، وتُعاد بعدها.` },
      ],
      tests: [
        { name: { en: "sumArray([1,2,3]) is 6", ar: "sumArray([1,2,3]) تساوي 6" }, check: `sumArray([1,2,3]) === 6` },
        { name: { en: "sumArray([10,20]) is 30", ar: "sumArray([10,20]) تساوي 30" }, check: `sumArray([10,20]) === 30` },
        { name: { en: "sumArray([]) is 0 (empty list)", ar: "sumArray([]) تساوي 0 (قائمة فارغة)" }, check: `sumArray([]) === 0` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the search bar on this site 🔍

The roadmap search on this very platform's homepage runs on exactly what you just learned. Conceptually, it does this:

\`\`\`js
const roadmaps = ["Frontend", "Cyber Security", "AI", "Cloud Computing"];
const query = "cloud";

for (const name of roadmaps) {
  if (name.toLowerCase().includes(query)) {
    console.log("Match:", name);
  }
}
\`\`\`

Loop over a list (\`roadmaps\`) + a condition (\`if\`) that checks each one against what you typed = a working live search. Every "search," "filter," or "sort" feature you've ever used on any website is this same combination, just with more polish around it. You already know the core of it.`,
        ar: `## دراسة حالة واقعية: شريط البحث في هذا الموقع 🔍

بحث خرائط التعلم في الصفحة الرئيسية لهذه المنصة نفسها يعمل بما تعلمته للتو بالضبط. مفاهيمياً، يفعل هذا:

\`\`\`js
const roadmaps = ["Frontend", "Cyber Security", "AI", "Cloud Computing"];
const query = "cloud";

for (const name of roadmaps) {
  if (name.toLowerCase().includes(query)) {
    console.log("Match:", name);
  }
}
\`\`\`

حلقة على قائمة (\`roadmaps\`) + شرط (\`if\`) يفحص كل عنصر مقابل ما كتبته = بحث حيّ عامل. كل ميزة "بحث" أو "تصفية" أو "ترتيب" استخدمتها على أي موقع هي نفس هذا التركيب، فقط بصقل أكثر حوله. أنت تعرف جوهرها بالفعل.`,
      },
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
        {
          q: { en: "Why should you use === instead of = to compare two values?", ar: "لماذا نستخدم === بدل = لمقارنة قيمتين؟" },
          choices: [
            { en: "= assigns a value (changes it); === checks equality without changing anything", ar: "= تُسند قيمة (تغيّرها)؛ و === تفحص التساوي دون تغيير أي شيء" },
            { en: "They are identical", ar: "متطابقتان" },
            { en: "=== is just faster", ar: "=== أسرع فقط" },
          ],
          answer: 0,
          explain: {
            en: "Using = in a condition silently overwrites the variable instead of comparing it — one of the most common beginner bugs in JavaScript.",
            ar: "استخدام = في شرط يستبدل قيمة المتغير بصمت بدل مقارنتها — أحد أشيع أخطاء المبتدئين في JavaScript.",
          },
        },
        {
          q: { en: "What does fruits[0] give you in const fruits = [\"apple\",\"banana\"]?", ar: "ماذا يعطيك fruits[0] في const fruits = [\"apple\",\"banana\"]؟" },
          choices: [
            { en: "\"apple\" — arrays start counting at 0", ar: "\"apple\" — المصفوفات تبدأ العدّ من 0" },
            { en: "\"banana\"", ar: "\"banana\"" },
            { en: "The number of items", ar: "عدد العناصر" },
          ],
          answer: 0,
          explain: {
            en: "Array indexes start at 0, not 1 — fruits[0] is the first item, fruits[1] is the second.",
            ar: "فهارس المصفوفة تبدأ من 0 لا 1 — fruits[0] هو العنصر الأول، وfruits[1] الثاني.",
          },
        },
        {
          q: { en: "What does a for loop let you do?", ar: "ماذا تتيح لك حلقة for؟" },
          choices: [
            { en: "Repeat an instruction automatically for every item in a list", ar: "تكرار تعليمة تلقائياً لكل عنصر في قائمة" },
            { en: "Delete an array", ar: "حذف مصفوفة" },
            { en: "Create a new function", ar: "إنشاء دالة جديدة" },
          ],
          answer: 0,
          explain: {
            en: "Instead of writing the same line once per item by hand, a loop runs it for you across the whole array — the pattern behind search, filtering, and rendering lists.",
            ar: "بدل كتابة نفس السطر يدوياً لكل عنصر، تشغّله الحلقة نيابة عنك عبر المصفوفة كلها — النمط خلف البحث والتصفية وعرض القوائم.",
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
- **Conditionals** (\`if\` / \`else if\` / \`else\`) — making decisions
- **Arrays and loops** — handling lists, not just single values
- **DOM** — grab, listen, change

**What's next?** Practice is everything in JavaScript. Try: a counter that also goes down, a button that changes the page color, a name-greeting input, a search box that filters a list of names as you type. Then continue to **Git & GitHub** to save your work like a professional — and later **React**, which builds on everything here.`,
        ar: `## اكتملت المرحلة 🏆

أنت الآن تعرف:

- **المتغيرات** (\`let\`، \`const\`) — تذكّر الأشياء
- **الدوال** — وصفات قابلة لإعادة الاستخدام مع \`return\`
- **الشروط** (\`if\` / \`else if\` / \`else\`) — اتخاذ القرارات
- **المصفوفات والحلقات** — التعامل مع القوائم، لا القيم المفردة فقط
- **DOM** — أمسِك، استمع، غيّر

**ما التالي؟** الممارسة هي كل شيء في JavaScript. جرّب: عدّاداً ينقص أيضاً، زراً يغيّر لون الصفحة، حقلَ اسمٍ يرحب بك، مربّع بحث يصفّي قائمة أسماء أثناء الكتابة. ثم تابع إلى **Git و GitHub** لتحفظ عملك كالمحترفين — ولاحقاً **React** الذي يبني على كل ما هنا.`,
      },
    },
  ],
};
