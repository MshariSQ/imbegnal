import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "react",
  title: { en: "React — Think in Components", ar: "React — فكّر بالمكوّنات" },
  estMinutes: 35,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- The one idea behind React: **components**
- What **props** and **state** mean (with toys, not jargon)
- Write component-style code right here in the browser
- Know exactly what to install and study next

React itself needs a build setup, so our exercise uses plain JavaScript to practice *the React way of thinking* — the skill that actually matters.`,
        ar: `## ماذا ستتعلم

- الفكرة الوحيدة خلف React: **المكوّنات**
- ماذا تعني **props** و **state** (بالألعاب، لا بالمصطلحات)
- تكتب كوداً بأسلوب المكوّنات هنا في المتصفح
- تعرف بالضبط ماذا تثبّت وماذا تدرس بعد ذلك

React نفسه يحتاج تجهيزات بناء، لذلك تمريننا يستخدم JavaScript عادياً لنتدرّب على *طريقة تفكير React* — المهارة التي تهم فعلاً.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## LEGO blocks 🧱

Look at any app — Twitter/X for example. You'll see the same pieces repeated everywhere: a *tweet card*, a *like button*, an *avatar*.

**React's whole idea:** build each piece **once** as a *component*, then assemble your app from those pieces like LEGO.

A React component is literally just a **function that returns what it looks like**:

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// use it like an HTML tag — as many times as you want:
<Welcome name="Sara" />
<Welcome name="Omar" />
\`\`\`

Two words to own:

- **Props** = the *knobs* on the block. \`<Welcome name="Sara" />\` passes \`name\` in — same block, different output. Props go **in**, the component can't change them.
- **State** = the block's *memory*. A like button remembers "am I liked? how many likes?" When state changes, React **automatically redraws** that component. You never manually do \`element.textContent = ...\` again — that's the magic.

\`\`\`jsx
function LikeButton() {
  const [likes, setLikes] = useState(0);
  return <button onClick={() => setLikes(likes + 1)}>❤️ {likes}</button>;
}
\`\`\`

\`useState(0)\` gives you the memory box and a setter. Call \`setLikes(...)\` and the button redraws itself. Compare that with the click counter you built in the JavaScript lesson — same result, but React does the DOM updating *for you*.`,
        ar: `## مكعبات ليغو 🧱

انظر إلى أي تطبيق — تويتر/X مثلاً. سترى القطع نفسها مكررة في كل مكان: *بطاقة تغريدة*، *زر إعجاب*، *صورة شخصية*.

**فكرة React كلها:** ابنِ كل قطعة **مرة واحدة** كـ*مكوّن (component)*، ثم ركّب تطبيقك من هذه القطع مثل الليغو.

مكوّن React هو حرفياً **دالة تعيد شكلها**:

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// استخدمه كوسم HTML — كما تشاء من المرات:
<Welcome name="Sara" />
<Welcome name="Omar" />
\`\`\`

كلمتان يجب أن تمتلكهما:

- **Props** = *مقابض* المكعب. \`<Welcome name="Sara" />\` تمرر \`name\` للداخل — نفس المكعب، ناتج مختلف. الـ props تدخل **إلى** المكوّن ولا يستطيع تغييرها.
- **State** = *ذاكرة* المكعب. زر الإعجاب يتذكر "هل أنا معجَب؟ كم إعجاباً؟" عندما تتغير الـ state، يعيد React **رسم المكوّن تلقائياً**. لن تكتب \`element.textContent = ...\` يدوياً بعد الآن — هذا هو السحر.

\`\`\`jsx
function LikeButton() {
  const [likes, setLikes] = useState(0);
  return <button onClick={() => setLikes(likes + 1)}>❤️ {likes}</button>;
}
\`\`\`

\`useState(0)\` يعطيك صندوق الذاكرة ودالة التحديث. استدعِ \`setLikes(...)\` فيعيد الزر رسم نفسه. قارن ذلك بعدّاد النقرات الذي بنيته في درس JavaScript — نفس النتيجة، لكن React يتولى تحديث الـ DOM *بدلاً عنك*.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `**Practice component thinking** (in plain JS — no build tools needed):

Write a function \`UserCard(name, role)\` that **returns an HTML string** for one card: a \`<div class="card">\` containing an \`<h3>\` with the name and a \`<p>\` with the role.

Then render **three different cards** into \`#app\` by calling it three times (the starter shows how the first call is joined in).`,
        ar: `**تدرّب على تفكير المكوّنات** (بـ JS عادي — بلا أدوات بناء):

اكتب دالة \`UserCard(name, role)\` **تعيد نص HTML** لبطاقة واحدة: \`<div class="card">\` بداخلها \`<h3>\` فيه الاسم و \`<p>\` فيه الدور.

ثم اعرض **ثلاث بطاقات مختلفة** داخل \`#app\` باستدعائها ثلاث مرات (الكود المبدئي يوضح كيف يُدمج أول استدعاء).`,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; background: #f0f4f8; padding: 20px; }
      .card { background: white; border-radius: 10px; padding: 16px; margin-bottom: 10px; }
      .card h3 { margin: 0 0 4px; }
      .card p { margin: 0; color: #666; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script>
      // 1. write the component:
      // function UserCard(name, role) {
      //   return '<div class="card">...</div>';
      // }

      // 2. render three cards:
      // document.querySelector("#app").innerHTML =
      //   UserCard("Sara", "Designer") + UserCard(...) + UserCard(...);
    </script>
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; background: #f0f4f8; padding: 20px; }
      .card { background: white; border-radius: 10px; padding: 16px; margin-bottom: 10px; }
      .card h3 { margin: 0 0 4px; }
      .card p { margin: 0; color: #666; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script>
      function UserCard(name, role) {
        return '<div class="card"><h3>' + name + '</h3><p>' + role + '</p></div>';
      }

      document.querySelector("#app").innerHTML =
        UserCard("Sara", "Designer") +
        UserCard("Omar", "Developer") +
        UserCard("Lina", "Manager");
    </script>
  </body>
</html>`,
      hints: [
        { en: `Return one string that glues the pieces: \`'<div class="card"><h3>' + name + '</h3><p>' + role + '</p></div>'\``, ar: `أعد نصاً واحداً يجمع الأجزاء: \`'<div class="card"><h3>' + name + '</h3><p>' + role + '</p></div>'\`` },
        { en: `Join three calls with + and assign to \`document.querySelector("#app").innerHTML\`.`, ar: `اجمع ثلاثة استدعاءات بعلامة + وأسندها إلى \`document.querySelector("#app").innerHTML\`.` },
      ],
      tests: [
        {
          name: { en: "UserCard is a function returning a card string", ar: "UserCard دالة تعيد نص بطاقة" },
          check: `typeof UserCard === "function" && String(UserCard("Test","Role")).indexOf("card") !== -1 && String(UserCard("Test","Role")).indexOf("Test") !== -1`,
        },
        {
          name: { en: "Three cards are rendered on the page", ar: "ثلاث بطاقات معروضة في الصفحة" },
          check: `document.querySelectorAll("#app .card").length >= 3`,
        },
        {
          name: { en: "Each card shows a name in <h3>", ar: "كل بطاقة تعرض اسماً داخل <h3>" },
          check: `document.querySelectorAll("#app .card h3").length >= 3`,
        },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is a React component?", ar: "ما هو مكوّن React؟" },
          choices: [
            { en: "A CSS file", ar: "ملف CSS" },
            { en: "A function that returns what it looks like (its UI)", ar: "دالة تعيد شكلها (واجهتها)" },
            { en: "A database table", ar: "جدول في قاعدة بيانات" },
          ],
          answer: 1,
          explain: {
            en: "A component is a reusable function returning UI (JSX). Apps are trees of components composed like LEGO.",
            ar: "المكوّن دالة قابلة لإعادة الاستخدام تعيد واجهة (JSX). التطبيقات أشجار من المكوّنات تُركّب كالليغو.",
          },
        },
        {
          q: { en: "Props vs state — which is correct?", ar: "props مقابل state — أيهما صحيح؟" },
          choices: [
            { en: "Props come in from outside; state is the component's own memory", ar: "props تأتي من الخارج؛ state ذاكرة المكوّن الخاصة" },
            { en: "State comes from the parent; props are internal", ar: "state تأتي من الأب؛ props داخلية" },
            { en: "They are two names for the same thing", ar: "اسمان لنفس الشيء" },
          ],
          answer: 0,
          explain: {
            en: "Props = inputs passed by the parent (read-only). State = internal memory the component changes with its setter.",
            ar: "props = مدخلات يمررها الأب (للقراءة فقط). state = ذاكرة داخلية يغيّرها المكوّن عبر دالة التحديث.",
          },
        },
        {
          q: { en: "What happens when you call setLikes(5)?", ar: "ماذا يحدث عند استدعاء setLikes(5)؟" },
          choices: [
            { en: "Nothing until you refresh the page", ar: "لا شيء حتى تحدّث الصفحة" },
            { en: "React re-renders the component with the new value", ar: "يعيد React رسم المكوّن بالقيمة الجديدة" },
            { en: "The whole website restarts", ar: "يُعاد تشغيل الموقع بالكامل" },
          ],
          answer: 1,
          explain: {
            en: "That's React's core loop: state changes → component re-renders → the DOM is updated for you, efficiently.",
            ar: "هذه حلقة React الأساسية: تتغير state ← يُعاد رسم المكوّن ← يُحدَّث الـ DOM نيابة عنك وبكفاءة.",
          },
        },
        {
          q: { en: "Why did we return HTML from UserCard three times instead of copy-pasting the HTML three times?", ar: "لماذا أعدنا HTML من UserCard ثلاث مرات بدل نسخ الـ HTML ثلاث مرات؟" },
          choices: [
            { en: "Reuse: one definition, many uses — fixing it once fixes all", ar: "إعادة الاستخدام: تعريف واحد، استخدامات كثيرة — إصلاح واحد يصلح الكل" },
            { en: "It runs faster", ar: "لأنها أسرع في التنفيذ" },
            { en: "Browsers require functions", ar: "المتصفحات تشترط الدوال" },
          ],
          answer: 0,
          explain: {
            en: "This is the component mindset: define once, reuse with different props. Change the design in one place and every card updates.",
            ar: "هذه عقلية المكوّنات: عرّف مرة، وأعد الاستخدام بـ props مختلفة. غيّر التصميم في مكان واحد فتتحدث كل البطاقات.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Your path into real React

You already think in components now. To write real React:

1. **Install Node.js** (nodejs.org), then run: \`npm create vite@latest my-app -- --template react\`
2. Follow the official tutorial at **react.dev/learn** — genuinely one of the best tutorials in software
3. Rebuild the click counter and UserCard as real components with \`useState\` and props
4. The freeCodeCamp video in the Resources tab walks through everything on camera

**Rule of thumb:** if you catch yourself copy-pasting UI, that's a component waiting to be born.`,
        ar: `## طريقك إلى React الحقيقي

أنت الآن تفكر بالمكوّنات. لكتابة React حقيقي:

1. **ثبّت Node.js** (من nodejs.org)، ثم نفّذ: \`npm create vite@latest my-app -- --template react\`
2. اتبع الدرس الرسمي على **react.dev/learn** — فعلياً من أفضل الدروس في عالم البرمجة
3. أعد بناء عدّاد النقرات و UserCard كمكوّنات حقيقية بـ \`useState\` و props
4. فيديو freeCodeCamp في تبويب المصادر يشرح كل شيء بالتطبيق المصوّر

**قاعدة ذهبية:** إذا وجدت نفسك تنسخ وتلصق واجهة، فهناك مكوّن ينتظر أن يولد.`,
      },
    },
  ],
};
