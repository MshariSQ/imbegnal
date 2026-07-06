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
- Write a real web page with your own hands, using semantic tags
- Master the CSS box model — padding, border, and margin, precisely
- Style it with colors, spacing, and rounded corners
- Build a real layout with **Flexbox** — the tool behind almost every navbar and card grid on the web
- Pass hands-on exercises checked automatically by the browser, including a live layout challenge

You don't need to install anything. The code runs right here on this page.`,
        ar: `## ماذا ستتعلم

في نهاية هذا الدرس ستكون قادراً على:

- فهم ما هو HTML وما هو CSS **فعلياً** (بدون كلمات مخيفة)
- كتابة صفحة ويب حقيقية بيدك، باستخدام وسوم دلالية
- إتقان نموذج الصندوق في CSS — الحشو والحدود والهامش، بدقة
- تنسيقها بالألوان والمسافات والزوايا الدائرية
- بناء تخطيط حقيقي بـ **Flexbox** — الأداة خلف كل شريط تنقّل وشبكة بطاقات تقريباً على الويب
- اجتياز تمارين عملية يصحّحها المتصفح تلقائياً، بما فيها تحدٍّ تخطيط حقيقي

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
        en: `## Semantic HTML — tags with meaning 🏷️

So far you've used generic tags. But HTML has special tags that describe *what a section of the page means*, not just how it looks. These are called **semantic tags**:

\`\`\`html
<header>   <!-- the top of the page: logo, title -->
<nav>      <!-- the navigation links -->
<main>     <!-- the main content, once per page -->
<section>  <!-- a themed group of content -->
<article>  <!-- a self-contained piece, like a blog post -->
<footer>   <!-- the bottom: copyright, links -->
\`\`\`

You *could* build a whole page out of \`<div>\` alone — the browser wouldn't complain. So why bother?

1. **Screen readers depend on it.** A blind user's screen reader announces "navigation" when it hits a \`<nav>\`, letting them jump straight to it. A page built entirely of \`<div>\`s is a maze with no signposts for them.
2. **Search engines read it.** Google gives more weight to text inside \`<article>\` and \`<h1>\` than inside a meaningless \`<div>\` — semantic tags are a free SEO boost.
3. **Other developers (including future you) read it faster.** \`<footer>\` instantly tells a reader of your code what that block is, no comment needed.

Rule of thumb: reach for a semantic tag first. Only fall back to a plain \`<div>\` when nothing else fits.`,
        ar: `## HTML الدلالي — وسوم لها معنى 🏷️

استخدمت حتى الآن وسوماً عامة. لكن HTML لديه وسوم خاصة تصف *ماذا يعني جزء من الصفحة*، لا شكله فقط. تُسمى **الوسوم الدلالية**:

\`\`\`html
<header>   <!-- أعلى الصفحة: الشعار، العنوان -->
<nav>      <!-- روابط التنقّل -->
<main>     <!-- المحتوى الرئيسي، مرة واحدة في الصفحة -->
<section>  <!-- مجموعة محتوى بموضوع واحد -->
<article>  <!-- قطعة قائمة بذاتها، كمقال مدونة -->
<footer>   <!-- الأسفل: حقوق النشر، الروابط -->
\`\`\`

كان بإمكانك بناء صفحة كاملة من \`<div>\` فقط — والمتصفح لن يعترض. فلماذا العناء؟

1. **قارئات الشاشة تعتمد عليها.** قارئ شاشة مستخدم كفيف يعلن "تنقّل" عند وصوله لـ \`<nav>\`، فيقفز إليه مباشرة. الصفحة المبنية بالكامل من \`<div>\` متاهة بلا لافتات إرشادية له.
2. **محركات البحث تقرؤها.** قوقل يعطي وزناً أكبر للنص داخل \`<article>\` و\`<h1>\` مقارنة بـ\`<div>\` بلا معنى — الوسوم الدلالية دفعة مجانية لـ SEO.
3. **المطورون الآخرون (وأنت مستقبلاً) يقرؤون كودك أسرع.** \`<footer>\` يخبر قارئ كودك فوراً ماذا يعني ذلك الجزء، بلا حاجة لتعليق.

قاعدة عامة: الجأ للوسم الدلالي أولاً. استخدم \`<div>\` العادي فقط حين لا يناسب شيء آخر.`,
      },
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
      type: "text",
      body: {
        en: `## The box model — every element is a box 📦

Here's the single most important mental model in CSS: **every HTML element is a rectangular box**, made of four layers, from the inside out:

\`\`\`
┌─────────────────────────────────┐
│           margin (outside)       │
│  ┌─────────────────────────────┐ │
│  │        border                │ │
│  │  ┌───────────────────────┐  │ │
│  │  │     padding            │  │ │
│  │  │  ┌─────────────────┐  │  │ │
│  │  │  │     content      │  │  │ │
│  │  │  └─────────────────┘  │  │ │
│  │  └───────────────────────┘  │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
\`\`\`

- **Content** — the actual text or image.
- **Padding** — space between the content and the border (increasing it makes the box bigger, pushing the border outward).
- **Border** — a visible (or invisible) line around the padding.
- **Margin** — space *outside* the border, pushing away other elements.

**The gotcha every beginner hits:** by default, \`width: 200px\` sets the width of the *content only* — padding and border get added on top, so a box with \`width: 200px; padding: 20px; border: 2px;\` actually renders **244px** wide. This surprises everyone at least once.

The fix, used in almost every professional stylesheet:

\`\`\`css
* {
  box-sizing: border-box;
}
\`\`\`

This changes the rule so \`width\` includes padding and border — what you set is what you get. Add this once at the top of your CSS and the surprise disappears forever.`,
        ar: `## نموذج الصندوق — كل عنصر صندوق 📦

إليك أهم نموذج ذهني واحد في CSS: **كل عنصر HTML صندوق مستطيل**، مكوّن من أربع طبقات، من الداخل للخارج:

\`\`\`
┌─────────────────────────────────┐
│         الهامش margin (خارجي)     │
│  ┌─────────────────────────────┐ │
│  │        الحدود border          │ │
│  │  ┌───────────────────────┐  │ │
│  │  │     الحشو padding        │  │ │
│  │  │  ┌─────────────────┐  │  │ │
│  │  │  │  المحتوى content   │  │  │ │
│  │  │  └─────────────────┘  │  │ │
│  │  └───────────────────────┘  │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
\`\`\`

- **المحتوى (Content)** — النص أو الصورة الفعلية.
- **الحشو (Padding)** — مسافة بين المحتوى والحدود (زيادته يكبّر الصندوق، فيدفع الحدود للخارج).
- **الحدود (Border)** — خط مرئي (أو غير مرئي) حول الحشو.
- **الهامش (Margin)** — مسافة *خارج* الحدود، تدفع العناصر الأخرى بعيداً.

**الفخ الذي يقع فيه كل مبتدئ:** افتراضياً، \`width: 200px\` تضبط عرض *المحتوى فقط* — يُضاف الحشو والحدود فوق ذلك، فصندوق بـ \`width: 200px; padding: 20px; border: 2px;\` يُعرض فعلياً بعرض **244px**. هذا يفاجئ الجميع مرة واحدة على الأقل.

الحل، المستخدم في كل ورقة أنماط احترافية تقريباً:

\`\`\`css
* {
  box-sizing: border-box;
}
\`\`\`

هذا يغيّر القاعدة بحيث يشمل \`width\` الحشو والحدود — ما تضبطه هو ما تحصل عليه. أضف هذا مرة في أعلى CSS وتختفي المفاجأة للأبد.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Flexbox — real layout, not guesswork 📐

Before Flexbox, lining up boxes side by side (like a navbar, or a row of cards) required fragile hacks. **Flexbox** fixed this: give a container \`display: flex\` and it automatically arranges its children in a row (or column), and gives you simple controls for spacing and alignment.

\`\`\`css
.container {
  display: flex;             /* turn on flexbox */
  justify-content: space-between; /* spacing along the row */
  align-items: center;       /* alignment across the row */
  gap: 16px;                 /* space between items */
}
\`\`\`

Think of \`.container\` as a shelf, and its direct children as books on it:

- \`display: flex\` — "arrange my children in a row" (the default direction).
- \`justify-content\` — how items spread out **along** the row: \`flex-start\` (packed left), \`center\`, \`space-between\` (edges touch the container, gaps spread evenly between), \`space-around\`.
- \`align-items\` — how items line up **across** the row: \`flex-start\` (top), \`center\`, \`stretch\` (fill the height).
- \`gap\` — clean, even spacing between items — no more fiddly margins on every child.

This one tool builds navbars, card grids, centered modals, and sidebars — probably 80% of the layouts you'll ever build.`,
        ar: `## Flexbox — تخطيط حقيقي، لا تخمين 📐

قبل Flexbox، كان ترتيب الصناديق جنباً إلى جنب (كشريط تنقّل، أو صف بطاقات) يتطلب حيلاً هشّة. **Flexbox** حلّ هذا: أعطِ الحاوية \`display: flex\` فترتّب أبناءها تلقائياً في صف (أو عمود)، وتمنحك تحكّماً بسيطاً بالمسافات والمحاذاة.

\`\`\`css
.container {
  display: flex;             /* فعّل Flexbox */
  justify-content: space-between; /* التباعد على طول الصف */
  align-items: center;       /* المحاذاة عبر الصف */
  gap: 16px;                 /* مسافة بين العناصر */
}
\`\`\`

تخيّل \`.container\` رفّاً، وأبناءه المباشرين كتباً عليه:

- \`display: flex\` — "رتّب أبنائي في صف" (الاتجاه الافتراضي).
- \`justify-content\` — كيف تتوزع العناصر **على طول** الصف: \`flex-start\` (متجمّعة يساراً)، \`center\`، \`space-between\` (الأطراف تلامس الحاوية، والفجوات تتوزع بالتساوي بينها)، \`space-around\`.
- \`align-items\` — كيف تتراصف العناصر **عبر** الصف: \`flex-start\` (أعلى)، \`center\`، \`stretch\` (تملأ الارتفاع).
- \`gap\` — تباعد نظيف ومتساوٍ بين العناصر — لا مزيد من الهوامش المزعجة على كل ابن.

هذه الأداة الواحدة تبني أشرطة التنقّل وشبكات البطاقات والنوافذ المتمركزة والأشرطة الجانبية — على الأرجح 80% من التخطيطات التي ستبنيها يوماً ما.`,
      },
    },
    {
      type: "code-demo",
      lang: "web",
      code: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; margin: 0; }
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #0D1117;
        padding: 16px 24px;
      }
      .navbar .logo { color: #10b981; font-weight: bold; }
      .navbar .links { display: flex; gap: 20px; }
      .navbar a { color: white; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="navbar">
      <div class="logo">MySite</div>
      <div class="links">
        <a href="#">Home</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
      </div>
    </div>
  </body>
</html>`,
      explanation: {
        en: `A real navbar, built with two nested flex containers: the outer one spaces the logo and links apart (\`space-between\`), the inner one lines up the links with a \`gap\`. Try changing \`justify-content\` to \`center\` and watch everything move.`,
        ar: `شريط تنقّل حقيقي، مبني بحاويتي flex متداخلتين: الخارجية تباعد الشعار والروابط (\`space-between\`)، والداخلية ترصّ الروابط بـ\`gap\`. جرّب تغيير \`justify-content\` إلى \`center\` وشاهد كل شيء يتحرك.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `**Build a row of pricing cards.** The HTML has 3 \`.card\` divs inside a \`.row\` container. Make \`.row\`:
1. \`display: flex\`
2. \`gap\` of **at least 16px** between the cards

The cards should end up in a neat horizontal row with visible space between them.`,
        ar: `**ابنِ صفاً من بطاقات الأسعار.** الـ HTML فيه 3 عناصر \`.card\` داخل حاوية \`.row\`. اجعل \`.row\`:
1. \`display: flex\`
2. \`gap\` بمقدار **16px على الأقل** بين البطاقات

يجب أن تنتهي البطاقات في صف أفقي مرتّب بمسافة واضحة بينها.`,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; padding: 20px; background: #f0f4f8; }
      .row {
        /* make this a flex row with a gap */
      }
      .card {
        background: white;
        border-radius: 10px;
        padding: 20px;
        flex: 1;
      }
    </style>
  </head>
  <body>
    <div class="row">
      <div class="card">Basic</div>
      <div class="card">Pro</div>
      <div class="card">Team</div>
    </div>
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; padding: 20px; background: #f0f4f8; }
      .row {
        display: flex;
        gap: 20px;
      }
      .card {
        background: white;
        border-radius: 10px;
        padding: 20px;
        flex: 1;
      }
    </style>
  </head>
  <body>
    <div class="row">
      <div class="card">Basic</div>
      <div class="card">Pro</div>
      <div class="card">Team</div>
    </div>
  </body>
</html>`,
      hints: [
        { en: `In .row, add: display: flex;`, ar: `في .row، أضف: display: flex;` },
        { en: `Then add: gap: 20px; on the same .row rule.`, ar: `ثم أضف: gap: 20px; في نفس قاعدة .row.` },
      ],
      tests: [
        {
          name: { en: ".row is a flex container", ar: ".row حاوية flex" },
          check: `getComputedStyle(document.querySelector(".row")).display === "flex"`,
        },
        {
          name: { en: "Cards are side by side (row direction)", ar: "البطاقات جنباً إلى جنب (اتجاه صف)" },
          check: `(function(){ var cards = document.querySelectorAll(".card"); return cards.length === 3 && cards[0].getBoundingClientRect().top === cards[1].getBoundingClientRect().top; })()`,
        },
        {
          name: { en: "Gap between cards is at least 16px", ar: "المسافة بين البطاقات 16px على الأقل" },
          check: `parseFloat(getComputedStyle(document.querySelector(".row")).gap) >= 16`,
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: this exact site 🔍

You don't need to imagine a real example — you're using one right now. Open your browser's DevTools (press **F12**, or right-click → "Inspect"), click the arrow-cursor icon, then click on the top navigation bar of this very page.

You'll find the top nav is built almost exactly like the pricing-card exercise you just solved: a flex container spacing the logo on one side and the links + buttons on the other, with \`gap\` handling the spacing between the nav links. The rounded cards you see on the roadmaps and certifications pages use the same \`border-radius\` + \`padding\` + \`box-shadow\` combination from the card exercise earlier in this lesson.

This is the actual, honest truth about frontend work: the fundamentals you just practiced — box model, flexbox, semantic tags — are not "toy" exercises. They are *literally* what every production website, including this one, is built from.`,
        ar: `## دراسة حالة واقعية: هذا الموقع بالضبط 🔍

لا تحتاج تخيّل مثال حقيقي — أنت تستخدم واحداً الآن. افتح أدوات المطوّر في متصفحك (اضغط **F12**، أو زر الفأرة الأيمن ← "Inspect")، اضغط أيقونة مؤشر السهم، ثم اضغط على شريط التنقّل العلوي لهذه الصفحة نفسها.

ستجد أن الشريط العلوي مبني تقريباً تماماً كتمرين بطاقات الأسعار الذي حللته للتو: حاوية flex تباعد الشعار في جهة والروابط + الأزرار في الجهة الأخرى، مع \`gap\` يتولى التباعد بين روابط التنقّل. والبطاقات الدائرية التي تراها في صفحتي خرائط التعلم والشهادات تستخدم نفس تركيبة \`border-radius\` + \`padding\` + \`box-shadow\` من تمرين البطاقة سابقاً في هذا الدرس.

هذه هي الحقيقة الصادقة عن عمل الواجهات: الأساسيات التي تدرّبت عليها للتو — نموذج الصندوق، Flexbox، الوسوم الدلالية — ليست تمارين "لعب". إنها *حرفياً* ما يُبنى منه كل موقع إنتاجي، بما فيه هذا الموقع.`,
      },
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
        {
          q: { en: "Why use <nav> instead of a plain <div> for navigation links?", ar: "لماذا نستخدم <nav> بدل <div> عادي لروابط التنقّل؟" },
          choices: [
            { en: "Screen readers and search engines understand its meaning", ar: "قارئات الشاشة ومحركات البحث تفهم معناه" },
            { en: "<div> cannot contain links", ar: "<div> لا يمكن أن يحتوي روابط" },
            { en: "<nav> makes the page load faster", ar: "<nav> يجعل الصفحة تحمّل أسرع" },
          ],
          answer: 0,
          explain: {
            en: "Semantic tags like <nav> carry meaning that assistive technology and search engines use — a plain <div> looks identical but says nothing.",
            ar: "الوسوم الدلالية مثل <nav> تحمل معنى تستخدمه تقنيات المساعدة ومحركات البحث — أما <div> العادي فيبدو مطابقاً لكنه لا يقول شيئاً.",
          },
        },
        {
          q: { en: "With the default box-sizing, if width: 200px and padding: 20px, how wide does the box actually render?", ar: "بصندوق افتراضي، إذا كان width: 200px و padding: 20px، كم يُعرض عرض الصندوق فعلياً؟" },
          choices: [
            { en: "200px", ar: "200px" },
            { en: "240px (padding adds to both sides)", ar: "240px (الحشو يُضاف على الجانبين)" },
            { en: "180px", ar: "180px" },
          ],
          answer: 1,
          explain: {
            en: "By default, width sets only the content box — padding (20px × 2 sides) is added on top, making it 240px. box-sizing: border-box fixes this.",
            ar: "افتراضياً، width تضبط صندوق المحتوى فقط — يُضاف الحشو (20px × جانبين) فوق ذلك، فيصبح 240px. و box-sizing: border-box يعالج هذا.",
          },
        },
        {
          q: { en: "What does display: flex do to a container's direct children?", ar: "ماذا يفعل display: flex بأبناء الحاوية المباشرين؟" },
          choices: [
            { en: "Arranges them automatically in a row (by default), with easy spacing and alignment controls", ar: "يرتّبهم تلقائياً في صف (افتراضياً)، مع تحكّم سهل بالتباعد والمحاذاة" },
            { en: "Hides them", ar: "يخفيهم" },
            { en: "Deletes their padding", ar: "يحذف الحشو الخاص بهم" },
          ],
          answer: 0,
          explain: {
            en: "Flexbox turns a container into a row (or column) layout engine — justify-content, align-items, and gap give you full control without hacks.",
            ar: "Flexbox يحوّل الحاوية إلى محرك تخطيط صف (أو عمود) — و justify-content و align-items و gap تمنحك تحكّماً كاملاً بلا حيل.",
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
- Used semantic tags (\`<nav>\`, \`<header>\`, \`<footer>\`) that screen readers and search engines understand
- Mastered the box model — content, padding, border, margin — and the \`box-sizing: border-box\` fix
- Styled a card with background, padding and rounded corners
- Built a real flexbox layout — a navbar and a row of pricing cards
- Learned the three-part anatomy of every CSS rule

**What's next?** CSS Grid (for two-dimensional layouts) is worth exploring on your own via the freeCodeCamp course in the Resources tab — then move to the **JavaScript** lesson to make your pages come alive.

> Practice idea: rebuild the navbar demo from memory tomorrow, then try turning it into a mobile-friendly layout. If you can, you've truly learned it.`,
        ar: `## أحسنت! 🎉

اليوم أنت:

- بنيت صفحات حقيقية بعناوين وفقرات وقوائم وروابط
- استخدمت وسوماً دلالية (\`<nav>\`، \`<header>\`، \`<footer>\`) تفهمها قارئات الشاشة ومحركات البحث
- أتقنت نموذج الصندوق — المحتوى والحشو والحدود والهامش — وحل \`box-sizing: border-box\`
- نسّقت بطاقة بخلفية ومسافات وزوايا دائرية
- بنيت تخطيط flexbox حقيقياً — شريط تنقّل وصف بطاقات أسعار
- تعلمت التركيبة الثلاثية لكل قاعدة CSS

**ما التالي؟** يستحق CSS Grid (للتخطيطات ثنائية الأبعاد) استكشافه بنفسك عبر دورة freeCodeCamp في تبويب المصادر — ثم انتقل إلى درس **JavaScript** لتجعل صفحاتك تنبض بالحياة.

> فكرة للتمرين: أعد بناء عرض شريط التنقّل من الذاكرة غداً، ثم جرّب تحويله لتخطيط صديق للجوال. إن استطعت، فقد تعلمته حقاً.`,
      },
    },
  ],
};
