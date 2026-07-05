import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "html-css",
  title: { en: "HTML & CSS — Your First Web Page", ar: "HTML و CSS — أول صفحة ويب لك" },
  estMinutes: 45,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

By the end of this lesson you will:

- Understand what HTML and CSS actually **are** (no scary words)
- Write a real web page with your own hands
- Style it with colors, spacing, and rounded corners
- Pass 3 hands-on exercises checked automatically by the browser

You don't need to install anything. The code runs right here on this page.`,
        ar: `## ماذا ستتعلم

في نهاية هذا الدرس ستكون قادراً على:

- فهم ما هو HTML وما هو CSS **فعلياً** (بدون كلمات مخيفة)
- كتابة صفحة ويب حقيقية بيدك
- تنسيقها بالألوان والمسافات والزوايا الدائرية
- اجتياز 3 تمارين عملية يصحّحها المتصفح تلقائياً

لا تحتاج إلى تثبيت أي شيء. الكود يعمل هنا مباشرة في هذه الصفحة.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Imagine a house 🏠

Think of a web page like a **house**:

- **HTML is the walls and rooms.** It says: "here is a title, here is a paragraph, here is a picture." It's the *structure*.
- **CSS is the paint and furniture.** It says: "make the title green, put space around the picture, round the corners." It's the *style*.

The browser (Chrome, Safari…) is the builder. It reads your HTML and CSS like instructions and builds the page you see.

An HTML file is just **text** with special labels called **tags**. A tag looks like this: \`<h1>\` — the name inside angle brackets. Most tags come in pairs: an opening tag \`<h1>\` and a closing tag \`</h1>\` (note the slash). Whatever sits between them is what shows on the page:

\`\`\`html
<h1>Hello!</h1>
\`\`\`

That's it. That's HTML. You already know it.`,
        ar: `## تخيّل منزلاً 🏠

فكّر في صفحة الويب مثل **المنزل**:

- **HTML هو الجدران والغرف.** يقول: "هنا عنوان، هنا فقرة، هنا صورة." إنه *الهيكل*.
- **CSS هو الطلاء والأثاث.** يقول: "اجعل العنوان أخضر، ضع مسافة حول الصورة، دوّر الزوايا." إنه *التنسيق*.

المتصفح (كروم، سفاري…) هو عامل البناء. يقرأ HTML و CSS كأنها تعليمات ويبني الصفحة التي تراها.

ملف HTML هو مجرد **نص** فيه علامات خاصة تسمى **الوسوم (tags)**. الوسم يبدو هكذا: \`<h1>\` — اسم بين قوسين زاويين. معظم الوسوم تأتي أزواجاً: وسم فتح \`<h1>\` ووسم إغلاق \`</h1>\` (لاحظ الشرطة المائلة). وما بينهما هو ما يظهر على الصفحة:

\`\`\`html
<h1>مرحباً!</h1>
\`\`\`

هذا كل شيء. هذا هو HTML. أنت تعرفه الآن.`,
      },
    },
    {
      type: "code-demo",
      lang: "web",
      code: `<!DOCTYPE html>
<html>
  <body>
    <h1>My first page</h1>
    <p>I am learning HTML. This is a paragraph.</p>
    <p>Each paragraph gets its own line.</p>
  </body>
</html>`,
      explanation: {
        en: `Here is a complete tiny web page. \`<h1>\` is the biggest heading, \`<p>\` is a paragraph. Press "Try it yourself", change the text, then press Run and watch the preview update. Break it on purpose! You can't damage anything.`,
        ar: `هذه صفحة ويب كاملة صغيرة. \`<h1>\` هو العنوان الأكبر، و\`<p>\` فقرة. اضغط "جرّب بنفسك"، غيّر النص، ثم اضغط تشغيل وشاهد المعاينة تتحدث. جرّب أن تكسرها عمداً! لا يمكنك إتلاف أي شيء.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `**Your turn!** Build a page about yourself. It must have:
1. A big heading (\`<h1>\`) with your name
2. At least one paragraph (\`<p>\`) about you

Write anything you like — the checker only looks at the structure.`,
        ar: `**دورك الآن!** ابنِ صفحة عن نفسك. يجب أن تحتوي على:
1. عنوان كبير (\`<h1>\`) فيه اسمك
2. فقرة واحدة على الأقل (\`<p>\`) عنك

اكتب ما تشاء — المصحّح ينظر إلى الهيكل فقط.`,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <body>
    <!-- write your heading and paragraph here -->

  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <body>
    <h1>Mshari</h1>
    <p>I am learning web development to build amazing things.</p>
  </body>
</html>`,
      hints: [
        { en: `A heading is written like this: \`<h1>Your name</h1>\``, ar: `العنوان يُكتب هكذا: \`<h1>اسمك</h1>\`` },
        { en: `A paragraph is \`<p>some text</p>\` — put it right after the heading.`, ar: `الفقرة هي \`<p>أي نص</p>\` — ضعها مباشرة بعد العنوان.` },
      ],
      tests: [
        {
          name: { en: "The page has an <h1> heading", ar: "الصفحة تحتوي على عنوان <h1>" },
          check: `document.querySelector("h1") !== null`,
        },
        {
          name: { en: "The heading is not empty", ar: "العنوان ليس فارغاً" },
          check: `(document.querySelector("h1") && document.querySelector("h1").textContent.trim().length > 0)`,
        },
        {
          name: { en: "There is at least one paragraph <p>", ar: "توجد فقرة <p> واحدة على الأقل" },
          check: `document.querySelector("p") !== null && document.querySelector("p").textContent.trim().length > 0`,
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Lists and links 📋🔗

Two more building blocks you'll use every single day:

**A list** is like a shopping list. \`<ul>\` means "unordered list" (bullet points), and every item goes inside \`<li>\`:

\`\`\`html
<ul>
  <li>Pizza</li>
  <li>Dates</li>
  <li>Kabsa</li>
</ul>
\`\`\`

**A link** takes you to another page. The tag is \`<a>\` and the destination goes in something called an *attribute* — extra info written inside the opening tag:

\`\`\`html
<a href="https://google.com">Go to Google</a>
\`\`\`

\`href\` is the attribute (the address), and "Go to Google" is the text people click on.`,
        ar: `## القوائم والروابط 📋🔗

لبنتان أساسيتان ستستخدمهما كل يوم:

**القائمة** مثل قائمة التسوق. \`<ul>\` تعني "قائمة غير مرتبة" (نقاط)، وكل عنصر يوضع داخل \`<li>\`:

\`\`\`html
<ul>
  <li>Pizza</li>
  <li>Dates</li>
  <li>Kabsa</li>
</ul>
\`\`\`

**الرابط** ينقلك إلى صفحة أخرى. الوسم هو \`<a>\` والوجهة توضع في شيء يسمى *خاصية (attribute)* — معلومة إضافية تُكتب داخل وسم الفتح:

\`\`\`html
<a href="https://google.com">اذهب إلى قوقل</a>
\`\`\`

\`href\` هي الخاصية (العنوان)، و"اذهب إلى قوقل" هو النص الذي يضغط عليه الزائر.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `Build a "My favorite things" page:
1. A \`<ul>\` list with **at least 3** \`<li>\` items
2. A link (\`<a>\`) to any website — don't forget the \`href\` attribute`,
        ar: `ابنِ صفحة "أشيائي المفضلة":
1. قائمة \`<ul>\` فيها **3 عناصر** \`<li>\` على الأقل
2. رابط (\`<a>\`) إلى أي موقع — لا تنسَ خاصية \`href\``,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <body>
    <h1>My favorite things</h1>
    <!-- add your list and link here -->

  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <body>
    <h1>My favorite things</h1>
    <ul>
      <li>Coffee</li>
      <li>Coding</li>
      <li>Football</li>
    </ul>
    <a href="https://github.com">My GitHub</a>
  </body>
</html>`,
      hints: [
        { en: `Start with \`<ul>\` … \`</ul>\` and put each \`<li>item</li>\` inside.`, ar: `ابدأ بـ \`<ul>\` … \`</ul>\` وضع كل \`<li>عنصر</li>\` بداخلها.` },
        { en: `The link needs both parts: \`<a href="https://...">text</a>\``, ar: `الرابط يحتاج الجزأين: \`<a href="https://...">نص</a>\`` },
      ],
      tests: [
        {
          name: { en: "There is a <ul> list", ar: "توجد قائمة <ul>" },
          check: `document.querySelector("ul") !== null`,
        },
        {
          name: { en: "The list has at least 3 items", ar: "القائمة فيها 3 عناصر على الأقل" },
          check: `document.querySelectorAll("ul li").length >= 3`,
        },
        {
          name: { en: "There is a link with an href", ar: "يوجد رابط بخاصية href" },
          check: `document.querySelector("a[href]") !== null`,
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Now let's paint the house — CSS 🎨

Plain HTML looks like a document from 1995. **CSS** (Cascading Style Sheets) is how we make it beautiful.

A CSS rule has three parts:

\`\`\`css
h1 {
  color: green;
}
\`\`\`

1. **Selector** (\`h1\`) — *who* gets styled ("all h1 headings")
2. **Property** (\`color\`) — *what* changes
3. **Value** (\`green\`) — *how* it changes

Think of it like giving orders to a painter: "All the headings → paint them green."

The easiest place to write CSS is inside a \`<style>\` tag in your page. You can also target your own custom groups using a **class**: give any tag \`class="card"\`, then select it in CSS with a dot: \`.card { ... }\`.

The most useful properties to memorize first:

- \`color\` — text color
- \`background\` — background color
- \`padding\` — space **inside** the box
- \`margin\` — space **outside** the box
- \`border-radius\` — rounded corners
- \`font-size\` — text size`,
        ar: `## الآن لنطلي المنزل — CSS 🎨

صفحة HTML وحدها تبدو كمستند من عام 1995. **CSS** (أوراق الأنماط المتتالية) هي الطريقة التي نجمّلها بها.

قاعدة CSS لها ثلاثة أجزاء:

\`\`\`css
h1 {
  color: green;
}
\`\`\`

1. **المحدِّد** (\`h1\`) — *مَن* سيُنسَّق ("كل عناوين h1")
2. **الخاصية** (\`color\`) — *ماذا* سيتغير
3. **القيمة** (\`green\`) — *كيف* سيتغير

تخيّلها أوامر لعامل الدهان: "كل العناوين ← اطلِها بالأخضر."

أسهل مكان لكتابة CSS هو داخل وسم \`<style>\` في صفحتك. ويمكنك استهداف مجموعاتك الخاصة باستخدام **class**: أعطِ أي وسم \`class="card"\` ثم اختره في CSS بنقطة: \`.card { ... }\`.

أهم الخصائص التي تحفظها أولاً:

- \`color\` — لون النص
- \`background\` — لون الخلفية
- \`padding\` — مسافة **داخل** الصندوق
- \`margin\` — مسافة **خارج** الصندوق
- \`border-radius\` — زوايا دائرية
- \`font-size\` — حجم الخط`,
      },
    },
    {
      type: "code-demo",
      lang: "web",
      code: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: sans-serif;
        background: #f0f4f8;
      }
      h1 {
        color: #059669;
      }
      .card {
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
    </style>
  </head>
  <body>
    <h1>Styled page</h1>
    <div class="card">
      <p>This box has padding, rounded corners and a shadow.</p>
    </div>
  </body>
</html>`,
      explanation: {
        en: `Same HTML idea, but now with a \`<style>\` block. Notice \`.card\` — the dot means "everything with class='card'". Try changing the colors and the border-radius, then press Run.`,
        ar: `نفس فكرة HTML، لكن الآن مع كتلة \`<style>\`. لاحظ \`.card\` — النقطة تعني "كل ما يحمل class='card'". جرّب تغيير الألوان و border-radius ثم اضغط تشغيل.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `Style the card! The HTML is ready — write CSS inside the \`<style>\` tag so that the \`.card\` box has:
1. A background color (any color except transparent)
2. Rounded corners of **at least 8px** (\`border-radius\`)
3. Inner spacing of **at least 12px** (\`padding\`)`,
        ar: `نسّق البطاقة! الـ HTML جاهز — اكتب CSS داخل وسم \`<style>\` بحيث يصبح لصندوق \`.card\`:
1. لون خلفية (أي لون غير شفاف)
2. زوايا دائرية **8px على الأقل** (\`border-radius\`)
3. مسافة داخلية **12px على الأقل** (\`padding\`)`,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <style>
      /* write your CSS here */
      .card {

      }
    </style>
  </head>
  <body>
    <div class="card">
      <h2>Hello!</h2>
      <p>Make me pretty.</p>
    </div>
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <head>
    <style>
      .card {
        background: #e0f2fe;
        border-radius: 16px;
        padding: 24px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h2>Hello!</h2>
      <p>Make me pretty.</p>
    </div>
  </body>
</html>`,
      hints: [
        { en: `Write the properties between the { } of .card, e.g. \`background: lightblue;\``, ar: `اكتب الخصائص بين قوسي { } الخاصين بـ .card، مثلاً \`background: lightblue;\`` },
        { en: `Each property ends with a semicolon: \`border-radius: 12px;\` and \`padding: 16px;\``, ar: `كل خاصية تنتهي بفاصلة منقوطة: \`border-radius: 12px;\` و \`padding: 16px;\`` },
      ],
      tests: [
        {
          name: { en: "The .card box exists", ar: "صندوق .card موجود" },
          check: `document.querySelector(".card") !== null`,
        },
        {
          name: { en: "The card has a background color", ar: "البطاقة لها لون خلفية" },
          check: `(function(){ var c = getComputedStyle(document.querySelector(".card")).backgroundColor; return c !== "rgba(0, 0, 0, 0)" && c !== "transparent"; })()`,
        },
        {
          name: { en: "Rounded corners ≥ 8px", ar: "زوايا دائرية ≥ 8px" },
          check: `parseFloat(getComputedStyle(document.querySelector(".card")).borderTopLeftRadius) >= 8`,
        },
        {
          name: { en: "Padding ≥ 12px", ar: "مسافة داخلية ≥ 12px" },
          check: `parseFloat(getComputedStyle(document.querySelector(".card")).paddingTop) >= 12`,
        },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is HTML responsible for?", ar: "ما مسؤولية HTML؟" },
          choices: [
            { en: "The structure of the page (walls and rooms)", ar: "هيكل الصفحة (الجدران والغرف)" },
            { en: "The colors and styling", ar: "الألوان والتنسيق" },
            { en: "Making the page interactive", ar: "جعل الصفحة تفاعلية" },
          ],
          answer: 0,
          explain: {
            en: "HTML defines structure — headings, paragraphs, lists, images. CSS handles style, JavaScript handles interactivity.",
            ar: "HTML يحدد الهيكل — العناوين والفقرات والقوائم والصور. CSS للتنسيق، وJavaScript للتفاعل.",
          },
        },
        {
          q: { en: "Which is a correct closing tag?", ar: "أيها وسم إغلاق صحيح؟" },
          choices: [
            { en: "<h1>", ar: "<h1>" },
            { en: "</h1>", ar: "</h1>" },
            { en: "<h1/>", ar: "<h1/>" },
          ],
          answer: 1,
          explain: {
            en: "Closing tags start with a forward slash: </h1>. The pair <h1>…</h1> wraps the content.",
            ar: "وسوم الإغلاق تبدأ بشرطة مائلة: </h1>. الزوج <h1>…</h1> يحيط بالمحتوى.",
          },
        },
        {
          q: { en: "In CSS, what selects everything with class=\"card\"?", ar: "في CSS، ما الذي يختار كل ما يحمل class=\"card\"؟" },
          choices: [
            { en: "#card", ar: "#card" },
            { en: "card", ar: "card" },
            { en: ".card", ar: ".card" },
          ],
          answer: 2,
          explain: {
            en: "A dot selects classes (.card), a hash selects ids (#card), and a bare name selects tags (p, h1…).",
            ar: "النقطة تختار الكلاسات (card.)، وعلامة # تختار المعرّفات (card#)، والاسم المجرد يختار الوسوم (p، h1…).",
          },
        },
        {
          q: { en: "padding is the space…", ar: "الـ padding هو المسافة…" },
          choices: [
            { en: "outside the box", ar: "خارج الصندوق" },
            { en: "inside the box", ar: "داخل الصندوق" },
            { en: "between letters", ar: "بين الحروف" },
          ],
          answer: 1,
          explain: {
            en: "padding = inside spacing (between content and border). margin = outside spacing (between the box and its neighbors).",
            ar: "padding = مسافة داخلية (بين المحتوى والإطار). margin = مسافة خارجية (بين الصندوق وجيرانه).",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## You did it! 🎉

Today you:

- Built real pages with headings, paragraphs, lists and links
- Styled a card with background, padding and rounded corners
- Learned the three-part anatomy of every CSS rule

**What's next?** Learning flexbox and CSS Grid for layout (the freeCodeCamp course in the Resources tab covers them for free), then move to the **JavaScript** lesson to make your pages come alive.

> Practice idea: rebuild the demo card from memory tomorrow. If you can, you've truly learned it.`,
        ar: `## أحسنت! 🎉

اليوم أنت:

- بنيت صفحات حقيقية بعناوين وفقرات وقوائم وروابط
- نسّقت بطاقة بخلفية ومسافات وزوايا دائرية
- تعلمت التركيبة الثلاثية لكل قاعدة CSS

**ما التالي؟** تعلّم flexbox و CSS Grid للتخطيط (دورة freeCodeCamp في تبويب المصادر تغطيهما مجاناً)، ثم انتقل إلى درس **JavaScript** لتجعل صفحاتك تنبض بالحياة.

> فكرة للتمرين: أعد بناء البطاقة من الذاكرة غداً. إن استطعت، فقد تعلمتها حقاً.`,
      },
    },
  ],
};
