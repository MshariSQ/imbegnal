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
- Rendering **lists** of components from an array — the pattern behind every feed, grid, and table
- Why real apps need **useEffect** to fetch data
- Write component-style code right here in the browser
- Know exactly what to install and study next

React itself needs a build setup, so our exercise uses plain JavaScript to practice *the React way of thinking* — the skill that actually matters.`,
        ar: `## ماذا ستتعلم

- الفكرة الوحيدة خلف React: **المكوّنات**
- ماذا تعني **props** و **state** (بالألعاب، لا بالمصطلحات)
- عرض **قوائم** من المكوّنات من مصفوفة — النمط خلف كل تغذية أخبار وشبكة وجدول
- لماذا تحتاج التطبيقات الحقيقية **useEffect** لجلب البيانات
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
      type: "text",
      body: {
        en: `## Lists — the pattern behind every feed and grid 📃

In the exercise above you called \`UserCard\` three times, by hand. Real apps don't know how many items they'll have — a feed might have 3 posts or 3,000. React's answer is \`.map()\`: transform an **array of data** into an **array of components**, in one line:

\`\`\`jsx
const users = [
  { name: "Sara", role: "Designer" },
  { name: "Omar", role: "Developer" },
  { name: "Lina", role: "Manager" },
];

function App() {
  return (
    <div>
      {users.map((u) => (
        <UserCard key={u.name} name={u.name} role={u.role} />
      ))}
    </div>
  );
}
\`\`\`

Add a 4th person to the \`users\` array and a 4th card appears automatically — no new \`<UserCard>\` line needed. That \`key={u.name}\` prop is required: it's a unique ID that helps React track which card is which when the list changes (adds, removes, reorders) — always give list items a stable, unique \`key\`.

This single pattern — **data array → \`.map()\` → components** — is how you'll build almost every list, grid, or feed you ever make in React.`,
        ar: `## القوائم — النمط خلف كل تغذية وشبكة 📃

في التمرين أعلاه استدعيت \`UserCard\` ثلاث مرات، يدوياً. التطبيقات الحقيقية لا تعرف كم عنصراً ستملك — قد تحتوي التغذية 3 منشورات أو 3000. إجابة React هي \`.map()\`: حوّل **مصفوفة بيانات** إلى **مصفوفة مكوّنات**، بسطر واحد:

\`\`\`jsx
const users = [
  { name: "Sara", role: "Designer" },
  { name: "Omar", role: "Developer" },
  { name: "Lina", role: "Manager" },
];

function App() {
  return (
    <div>
      {users.map((u) => (
        <UserCard key={u.name} name={u.name} role={u.role} />
      ))}
    </div>
  );
}
\`\`\`

أضف شخصاً رابعاً لمصفوفة \`users\` فتظهر بطاقة رابعة تلقائياً — بلا حاجة لسطر \`<UserCard>\` جديد. خاصية \`key={u.name}\` تلك مطلوبة: معرّف فريد يساعد React على تتبّع أي بطاقة هي أيّ عند تغيّر القائمة (إضافة، حذف، إعادة ترتيب) — أعطِ عناصر القائمة دائماً \`key\` فريداً ثابتاً.

هذا النمط الواحد — **مصفوفة بيانات ← \`.map()\` ← مكوّنات** — هو كيف تبني تقريباً كل قائمة أو شبكة أو تغذية ستصنعها في React.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `**Render from data, not by hand.** Extend the card idea: instead of calling \`UserCard\` manually per person, build the HTML string by looping over the \`users\` array (plain JS \`for\` or \`.map()\` both work — this models what React's \`.map()\` does).

Requirements: render **one \`.card\`** per entry in \`users\`, each showing that person's \`name\` in an \`<h3>\`.`,
        ar: `**اعرض من البيانات، لا يدوياً.** وسّع فكرة البطاقة: بدل استدعاء \`UserCard\` يدوياً لكل شخص، ابنِ نص HTML بالتكرار على مصفوفة \`users\` (\`for\` عادية أو \`.map()\` كلاهما يعمل — هذا يحاكي ما تفعله \`.map()\` في React).

المتطلبات: اعرض **بطاقة \`.card\`** واحدة لكل مُدخل في \`users\`، تُظهر كل منها اسم الشخص \`name\` داخل \`<h3>\`.`,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; background: #f0f4f8; padding: 20px; }
      .card { background: white; border-radius: 10px; padding: 16px; margin-bottom: 10px; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script>
      const users = [
        { name: "Sara", role: "Designer" },
        { name: "Omar", role: "Developer" },
        { name: "Lina", role: "Manager" },
        { name: "Yusuf", role: "QA Engineer" },
      ];

      // loop over users and build one .card per entry

    </script>
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; background: #f0f4f8; padding: 20px; }
      .card { background: white; border-radius: 10px; padding: 16px; margin-bottom: 10px; }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script>
      const users = [
        { name: "Sara", role: "Designer" },
        { name: "Omar", role: "Developer" },
        { name: "Lina", role: "Manager" },
        { name: "Yusuf", role: "QA Engineer" },
      ];

      let html = "";
      for (const u of users) {
        html += '<div class="card"><h3>' + u.name + '</h3><p>' + u.role + '</p></div>';
      }
      document.querySelector("#app").innerHTML = html;
    </script>
  </body>
</html>`,
      hints: [
        { en: `Start with an empty string: let html = "";`, ar: `ابدأ بنص فارغ: let html = "";` },
        { en: `In the loop: html += '<div class="card"><h3>' + u.name + '</h3></div>'; then set #app's innerHTML to html.`, ar: `في الحلقة: html += '<div class="card"><h3>' + u.name + '</h3></div>'; ثم اضبط innerHTML لـ #app على html.` },
      ],
      tests: [
        { name: { en: "There are 4 cards — one per user", ar: "توجد 4 بطاقات — واحدة لكل مستخدم" }, check: `document.querySelectorAll("#app .card").length === 4` },
        { name: { en: "Each card shows its person's name", ar: "كل بطاقة تعرض اسم صاحبها" }, check: `(function(){ var names = Array.from(document.querySelectorAll("#app .card h3")).map(function(h){return h.textContent;}); return names.includes("Sara") && names.includes("Yusuf"); })()` },
        { name: { en: "Adding a 5th user would add a 5th card (loop-driven, not hardcoded)", ar: "إضافة مستخدم خامس تضيف بطاقة خامسة (مدفوع بحلقة، لا مكتوب يدوياً)" }, check: `document.querySelectorAll("#app .card").length === users.length` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## useEffect — fetching real data 🌐

Everything so far lives inside the browser. But real apps load data from a server — a list of products, a user's profile. React handles this with \`useEffect\`, which runs code *after* the component appears on screen:

\`\`\`jsx
function ProfilePage({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/users/" + userId)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [userId]); // re-run whenever userId changes

  if (!user) return <p>Loading...</p>;
  return <h1>{user.name}</h1>;
}
\`\`\`

Read the \`[userId]\` at the end as "only re-run this fetch if \`userId\` changes" — without it, React would re-fetch on every single render, hammering your server. The pattern is always the same: start with \`null\`/loading state, fetch in \`useEffect\`, call \`setUser\` when data arrives, and React re-renders automatically with the real data. This exact pattern is how this platform's own Profile page loads your GitHub stats after you sign in.`,
        ar: `## useEffect — جلب بيانات حقيقية 🌐

كل ما سبق يعيش داخل المتصفح. لكن التطبيقات الحقيقية تحمّل بيانات من خادم — قائمة منتجات، ملف مستخدم شخصي. يتعامل React مع هذا بـ\`useEffect\`، الذي يشغّل كوداً *بعد* ظهور المكوّن على الشاشة:

\`\`\`jsx
function ProfilePage({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/users/" + userId)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [userId]); // أعد التشغيل فقط عند تغيّر userId

  if (!user) return <p>Loading...</p>;
  return <h1>{user.name}</h1>;
}
\`\`\`

اقرأ \`[userId]\` في النهاية كـ"أعد تشغيل هذا الجلب فقط إن تغيّر \`userId\`" — بدونها، سيعيد React الجلب مع كل رسم، مثقلاً خادمك. النمط دائماً واحد: ابدأ بـ\`null\`/حالة تحميل، اجلب داخل \`useEffect\`، استدعِ \`setUser\` عند وصول البيانات، ويعيد React الرسم تلقائياً بالبيانات الحقيقية. هذا النمط بالضبط هو كيف تُحمّل صفحة الملف الشخصي لهذه المنصة نفسها إحصائيات GitHub الخاصة بك بعد تسجيل الدخول.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: this site's own cards 🔍

Every roadmap card, certification card, and course card on this platform is **one component**, rendered exactly like the exercise above: a data array (\`data/roadmaps.ts\`, \`data/certifications.ts\`) is \`.map()\`-ed into a row of cards. Add a new roadmap to that one data file, and a new card appears on the site automatically — nobody hand-writes a new \`<RoadmapCard>\` line for it. That's the entire payoff of thinking in components: change the data, not the UI code.`,
        ar: `## دراسة حالة واقعية: بطاقات هذا الموقع نفسها 🔍

كل بطاقة خريطة تعلم وبطاقة شهادة وبطاقة دورة في هذه المنصة هي **مكوّن واحد**، تُعرَض تماماً كالتمرين أعلاه: مصفوفة بيانات (\`data/roadmaps.ts\`، \`data/certifications.ts\`) تُمرَّر عبر \`.map()\` إلى صف بطاقات. أضف خريطة تعلم جديدة لذلك الملف الواحد، وتظهر بطاقة جديدة على الموقع تلقائياً — لا أحد يكتب سطر \`<RoadmapCard>\` جديداً يدوياً لها. هذه هي الفائدة الكاملة للتفكير بالمكوّنات: غيّر البيانات، لا كود الواجهة.`,
      },
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
        {
          q: { en: "Why does React need a key prop when rendering a list with .map()?", ar: "لماذا يحتاج React خاصية key عند عرض قائمة بـ .map()؟" },
          choices: [
            { en: "It's a unique ID that helps React track each item when the list changes", ar: "معرّف فريد يساعد React على تتبّع كل عنصر عند تغيّر القائمة" },
            { en: "It sets the item's color", ar: "يضبط لون العنصر" },
            { en: "It's optional and does nothing", ar: "اختياري ولا يفعل شيئاً" },
          ],
          answer: 0,
          explain: {
            en: "Without a stable key, React can't reliably tell which item was added, removed, or reordered — leading to bugs when the list changes.",
            ar: "بلا key ثابت، لا يستطيع React معرفة أي عنصر أُضيف أو حُذف أو أُعيد ترتيبه بموثوقية — ما يسبب أخطاء عند تغيّر القائمة.",
          },
        },
        {
          q: { en: "What does [userId] at the end of a useEffect call mean?", ar: "ماذا تعني [userId] في نهاية استدعاء useEffect؟" },
          choices: [
            { en: "Only re-run the effect when userId changes", ar: "أعد تشغيل التأثير فقط عند تغيّر userId" },
            { en: "Delete userId after use", ar: "احذف userId بعد الاستخدام" },
            { en: "It has no effect at all", ar: "لا تأثير له إطلاقاً" },
          ],
          answer: 0,
          explain: {
            en: "That's the dependency array — it controls when the effect re-runs. Omitting it (or getting it wrong) is a very common source of React bugs.",
            ar: "هذه مصفوفة الاعتماديات — تتحكم بمتى يُعاد تشغيل التأثير. حذفها (أو ضبطها خطأً) سبب شائع جداً لأخطاء React.",
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
4. Practice \`.map()\`-ing a data array into a list of components, and fetching real data with \`useEffect\`
5. The freeCodeCamp video in the Resources tab walks through everything on camera

**Rule of thumb:** if you catch yourself copy-pasting UI, that's a component waiting to be born. If you catch yourself writing the same component call for every item in a list, that's a \`.map()\` waiting to happen.`,
        ar: `## طريقك إلى React الحقيقي

أنت الآن تفكر بالمكوّنات. لكتابة React حقيقي:

1. **ثبّت Node.js** (من nodejs.org)، ثم نفّذ: \`npm create vite@latest my-app -- --template react\`
2. اتبع الدرس الرسمي على **react.dev/learn** — فعلياً من أفضل الدروس في عالم البرمجة
3. أعد بناء عدّاد النقرات و UserCard كمكوّنات حقيقية بـ \`useState\` و props
4. تدرّب على تحويل مصفوفة بيانات إلى قائمة مكوّنات بـ\`.map()\`، وجلب بيانات حقيقية بـ\`useEffect\`
5. فيديو freeCodeCamp في تبويب المصادر يشرح كل شيء بالتطبيق المصوّر

**قاعدة ذهبية:** إذا وجدت نفسك تنسخ وتلصق واجهة، فهناك مكوّن ينتظر أن يولد. وإذا وجدت نفسك تكتب نفس استدعاء المكوّن لكل عنصر في قائمة، فهناك \`.map()\` ينتظر أن يحدث.`,
      },
    },
  ],
};
