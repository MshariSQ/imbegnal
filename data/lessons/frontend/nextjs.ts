import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "nextjs",
  title: { en: "Next.js — React, Production-Ready", ar: "Next.js — React جاهز للإنتاج" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What a "framework" adds on top of React
- File-based routing, server rendering, and why they matter
- The **3 rendering modes** — SSR, SSG, and static export — and when each applies
- A hands-on exercise modeling the file-based router
- The mental map you need before opening the docs

Next.js needs Node and a dev server, so this is mostly a map-drawing lesson: theory + quiz + one router-modeling exercise, then you build locally.`,
        ar: `## ماذا ستتعلم

- ماذا يضيف "إطار العمل" فوق React
- التوجيه بالملفات، والعرض من الخادم، ولماذا يهمّان
- **أنماط العرض الثلاثة** — SSR وSSG والتصدير الثابت — ومتى يُستخدم كلٌّ
- تمرين عملي يحاكي التوجيه بالملفات
- الخريطة الذهنية التي تحتاجها قبل فتح التوثيق

Next.js يحتاج Node وخادم تطوير، لذا هذا درس رسم خريطة في معظمه: نظرية + اختبار + تمرين واحد يحاكي التوجيه، ثم تبني محلياً.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The furnished apartment 🏢

React gives you excellent **bricks** (components). But a real app also needs plumbing: multiple pages, URLs, fast first load, SEO, images, deployment. Wiring those by hand is weeks of work.

**Next.js is the furnished apartment** — React with the plumbing pre-installed:

**1. File-based routing.** Make a file → you have a page. No router setup:

\`\`\`
app/
├── page.tsx          →  yoursite.com/
├── about/page.tsx    →  yoursite.com/about
└── blog/[slug]/page.tsx  →  yoursite.com/blog/anything
\`\`\`

\`[slug]\` is a wildcard — one file serves /blog/hello, /blog/react-tips, etc.

**2. Server rendering (SSR/SSG).** Plain React sends an empty page plus a big JS bundle; the user stares at white until it boots. Next renders the HTML **on the server (or at build time)** and ships the finished page — fast first paint, and Google can read it (SEO). This very site is Next.js exported as static files.

**3. Server components.** By default components run on the server: they can read databases directly and ship **zero JS** to the browser. You add \`"use client"\` only where interactivity (useState, onClick) is needed.

**4. Batteries.** \`<Image>\` optimizes pictures, \`<Link>\` prefetches pages so clicks feel instant, API routes let you write backend endpoints in the same repo.`,
        ar: `## الشقة المفروشة 🏢

يمنحك React **طوباً** ممتازاً (المكوّنات). لكن التطبيق الحقيقي يحتاج تمديدات أيضاً: صفحات متعددة، عناوين URL، تحميل أول سريع، SEO، صور، نشر. توصيلها يدوياً أسابيع من العمل.

**Next.js هو الشقة المفروشة** — React مع التمديدات جاهزة:

**١. التوجيه بالملفات.** أنشئ ملفاً ← لديك صفحة. بلا إعداد موجّه:

\`\`\`
app/
├── page.tsx          ←  yoursite.com/
├── about/page.tsx    ←  yoursite.com/about
└── blog/[slug]/page.tsx  ←  yoursite.com/blog/anything
\`\`\`

\`[slug]\` بطاقة جامحة — ملف واحد يخدم /blog/hello و /blog/react-tips وغيرها.

**٢. العرض من الخادم (SSR/SSG).** React وحده يرسل صفحة فارغة مع حزمة JS كبيرة؛ يحدّق المستخدم في البياض حتى تعمل. أما Next فيرسم HTML **على الخادم (أو وقت البناء)** ويرسل الصفحة الجاهزة — ظهور أول سريع، وقوقل يقرؤها (SEO). هذا الموقع نفسه Next.js مُصدَّر كملفات ثابتة.

**٣. مكوّنات الخادم.** افتراضياً تعمل المكوّنات على الخادم: تقرأ قواعد البيانات مباشرة وترسل **صفر JS** للمتصفح. تضيف \`"use client"\` فقط حيث يلزم التفاعل (useState، onClick).

**٤. البطاريات.** \`<Image>\` يحسّن الصور، و\`<Link>\` يجلب الصفحات مسبقاً فتبدو النقرات لحظية، ومسارات API تتيح كتابة نقاط خلفية في نفس المستودع.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      runnable: false,
      code: `// app/blog/[slug]/page.tsx — a complete Next.js page
export default async function BlogPost({ params }) {
  const { slug } = await params;          // "react-tips" from /blog/react-tips
  const post = await getPost(slug);       // runs ON THE SERVER — can hit a DB

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}`,
      explanation: {
        en: `A real Next.js page: the file's location defines its URL, the component is async and fetches data on the server, and the browser receives finished HTML. (Runs in a Next project, not in this sandbox.)`,
        ar: `صفحة Next.js حقيقية: موقع الملف يحدد عنوانها، والمكوّن غير متزامن ويجلب البيانات على الخادم، ويستلم المتصفح HTML جاهزاً. (تعمل في مشروع Next، لا في هذا الصندوق.)`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Three ways to render — pick per page 🎛️

"Server rendering" isn't one thing — Next.js gives you three modes, and real apps mix them page by page:

1. **SSR (Server-Side Rendering)** — the server builds the HTML **fresh on every request**. Best for pages that change per-visitor (a personalized dashboard, live prices).
2. **SSG (Static Site Generation)** — the HTML is built **once, at build time**, then served instantly to everyone, like a plain file. Best for pages that rarely change (a blog post, a marketing page) — this is why Next sites feel instant.
3. **Static export** (\`output: "export"\`) — takes SSG further: the *entire site* becomes a folder of plain HTML/CSS/JS files, with no server needed at all. You can host it anywhere that serves files — including free static hosts like GitHub Pages.

**This is not theoretical** — this exact learning platform's \`next.config.ts\` contains \`output: "export"\`. Every lesson, every roadmap page, is pre-built once and shipped as static files to GitHub Pages, which is why the site works without running any backend server at all (only the small login API is a separate server).`,
        ar: `## ثلاث طرق للعرض — اختر لكل صفحة 🎛️

"العرض من الخادم" ليس شيئاً واحداً — يمنحك Next.js ثلاثة أنماط، والتطبيقات الحقيقية تمزجها صفحة بصفحة:

1. **SSR (العرض من جهة الخادم)** — يبني الخادم HTML **جديداً مع كل طلب**. الأفضل للصفحات التي تتغير حسب الزائر (لوحة تحكم شخصية، أسعار حيّة).
2. **SSG (توليد الموقع الثابت)** — يُبنى HTML **مرة واحدة، وقت البناء**، ثم يُقدَّم فوراً للجميع، كملف عادي. الأفضل للصفحات التي نادراً ما تتغير (منشور مدونة، صفحة تسويقية) — لهذا مواقع Next تبدو فورية.
3. **التصدير الثابت** (\`output: "export"\`) — يأخذ SSG أبعد: يصبح *الموقع كله* مجلداً من ملفات HTML/CSS/JS عادية، بلا حاجة لخادم إطلاقاً. تستطيع استضافته في أي مكان يخدم ملفات — بما فيها استضافات ثابتة مجانية مثل GitHub Pages.

**هذا ليس نظرياً** — ملف \`next.config.ts\` لمنصة التعلّم هذه بالضبط يحتوي \`output: "export"\`. كل درس، وكل صفحة خريطة تعلم، تُبنى مسبقاً مرة واحدة وتُشحن كملفات ثابتة إلى GitHub Pages، ولهذا يعمل الموقع دون تشغيل أي خادم خلفي إطلاقاً (فقط واجهة تسجيل الدخول الصغيرة خادم منفصل).`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `**Model the file-based router.** Write \`fileToRoute(filePath)\` that converts a Next.js file path into its URL:
- \`"app/page.tsx"\` → \`"/"\`
- \`"app/about/page.tsx"\` → \`"/about"\`
- \`"app/blog/[slug]/page.tsx"\` → \`"/blog/:slug"\` (dynamic segments become \`:name\`)

(Remove \`"app"\` and \`"page.tsx"\`, turn \`[x]\` into \`:x\`.)`,
        ar: `**حاكِ التوجيه بالملفات.** اكتب \`fileToRoute(filePath)\` تحوّل مسار ملف Next.js إلى رابطه:
- \`"app/page.tsx"\` ← \`"/"\`
- \`"app/about/page.tsx"\` ← \`"/about"\`
- \`"app/blog/[slug]/page.tsx"\` ← \`"/blog/:slug"\` (المقاطع الديناميكية تصير \`:name\`)

(احذف \`"app"\` و\`"page.tsx"\`، وحوّل \`[x]\` إلى \`:x\`.)`,
      },
      starterCode: `function fileToRoute(filePath) {
  // "app/blog/[slug]/page.tsx" -> "/blog/:slug"

}

console.log(fileToRoute("app/page.tsx"));               // "/"
console.log(fileToRoute("app/about/page.tsx"));         // "/about"
console.log(fileToRoute("app/blog/[slug]/page.tsx"));   // "/blog/:slug"`,
      solution: `function fileToRoute(filePath) {
  let route = filePath
    .replace("app", "")
    .replace("/page.tsx", "")
    .replace(/\\[(.+?)\\]/g, ":$1");
  return route === "" ? "/" : route;
}

console.log(fileToRoute("app/page.tsx"));               // "/"
console.log(fileToRoute("app/about/page.tsx"));         // "/about"
console.log(fileToRoute("app/blog/[slug]/page.tsx"));   // "/blog/:slug"`,
      hints: [
        { en: `Start by removing "app" and "/page.tsx" with .replace().`, ar: `ابدأ بحذف "app" و"/page.tsx" بـ .replace().` },
        { en: `Use a regex to turn [slug] into :slug: .replace(/\\[(.+?)\\]/g, ":$1")`, ar: `استخدم regex لتحويل [slug] إلى :slug: .replace(/\\[(.+?)\\]/g, ":$1")` },
        { en: `If the result is an empty string, return "/" for the homepage.`, ar: `إن كانت النتيجة نصاً فارغاً، أعِد "/" للصفحة الرئيسية.` },
      ],
      tests: [
        { name: { en: "Homepage file maps to /", ar: "ملف الصفحة الرئيسية يُطابق /" }, check: `fileToRoute("app/page.tsx") === "/"` },
        { name: { en: "Static route maps correctly", ar: "المسار الثابت يُطابق بشكل صحيح" }, check: `fileToRoute("app/about/page.tsx") === "/about"` },
        { name: { en: "Dynamic segment becomes :slug", ar: "المقطع الديناميكي يصير :slug" }, check: `fileToRoute("app/blog/[slug]/page.tsx") === "/blog/:slug"` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "In the App Router, how do you create the page yoursite.com/contact?", ar: "في App Router، كيف تنشئ صفحة yoursite.com/contact؟" },
          choices: [
            { en: "Create app/contact/page.tsx", ar: "أنشئ app/contact/page.tsx" },
            { en: "Register it in routes.config.js", ar: "سجّلها في routes.config.js" },
            { en: "Add <Route path=\"/contact\"> in App.js", ar: "أضف <Route path=\"/contact\"> في App.js" },
          ],
          answer: 0,
          explain: {
            en: "Routing is the file system: folder = URL segment, page.tsx = the page. No route registration anywhere.",
            ar: "التوجيه هو نظام الملفات: المجلد = مقطع URL، و page.tsx = الصفحة. لا تسجيل مسارات في أي مكان.",
          },
        },
        {
          q: { en: "What does [slug] in a folder name mean?", ar: "ماذا يعني [slug] في اسم مجلد؟" },
          choices: [
            { en: "A hidden page", ar: "صفحة مخفية" },
            { en: "A dynamic segment — one file handles many URLs", ar: "مقطع ديناميكي — ملف واحد يخدم عناوين كثيرة" },
            { en: "A test page", ar: "صفحة تجريبية" },
          ],
          answer: 1,
          explain: {
            en: "app/blog/[slug]/page.tsx serves /blog/a, /blog/b… and receives the actual value through params.",
            ar: "app/blog/[slug]/page.tsx يخدم /blog/a و /blog/b… ويستلم القيمة الفعلية عبر params.",
          },
        },
        {
          q: { en: "Why does server rendering improve first load?", ar: "لماذا يحسّن العرض من الخادم التحميل الأول؟" },
          choices: [
            { en: "The server has a faster internet connection", ar: "الخادم لديه إنترنت أسرع" },
            { en: "The browser receives ready HTML instead of waiting for JS to build the page", ar: "يستلم المتصفح HTML جاهزاً بدل انتظار JS ليبني الصفحة" },
            { en: "It compresses images", ar: "يضغط الصور" },
          ],
          answer: 1,
          explain: {
            en: "Content is visible immediately (and crawlable by search engines); JavaScript then 'hydrates' it to add interactivity.",
            ar: "المحتوى يظهر فوراً (ومحركات البحث تقرؤه)؛ ثم تأتي JavaScript فتضيف التفاعلية.",
          },
        },
        {
          q: { en: "When do you add \"use client\" to a component?", ar: "متى تضيف \"use client\" إلى مكوّن؟" },
          choices: [
            { en: "On every component, always", ar: "على كل مكوّن، دائماً" },
            { en: "When it needs interactivity or browser APIs (useState, onClick…)", ar: "عندما يحتاج تفاعلاً أو واجهات المتصفح (useState، onClick…)" },
            { en: "Only on the home page", ar: "على الصفحة الرئيسية فقط" },
          ],
          answer: 1,
          explain: {
            en: "Server components are the default (less JS shipped). Opt into the client only where the user actually interacts.",
            ar: "مكوّنات الخادم هي الافتراضي (JS أقل يُرسل). اختر العميل فقط حيث يتفاعل المستخدم فعلاً.",
          },
        },
        {
          q: { en: "Which rendering mode fits a personalized dashboard that differs per visitor?", ar: "أي نمط عرض يناسب لوحة تحكم شخصية تختلف لكل زائر؟" },
          choices: [
            { en: "SSR — rebuilt fresh on every request", ar: "SSR — يُعاد بناؤها جديدة مع كل طلب" },
            { en: "Static export — built once for everyone", ar: "التصدير الثابت — يُبنى مرة واحدة للجميع" },
            { en: "There is no way to do this in Next.js", ar: "لا توجد طريقة لفعل هذا في Next.js" },
          ],
          answer: 0,
          explain: {
            en: "Content that must be fresh and different per visitor needs SSR. Static export is for content that's the same for everyone, built once.",
            ar: "المحتوى الذي يجب أن يكون جديداً ومختلفاً لكل زائر يحتاج SSR. أما التصدير الثابت فللمحتوى المتماثل للجميع، يُبنى مرة واحدة.",
          },
        },
        {
          q: { en: "What does output: \"export\" produce?", ar: "ماذا ينتج output: \"export\"؟" },
          choices: [
            { en: "A folder of plain HTML/CSS/JS files needing no server at all", ar: "مجلد من ملفات HTML/CSS/JS عادية لا يحتاج خادماً إطلاقاً" },
            { en: "A database export", ar: "تصدير قاعدة بيانات" },
            { en: "A single compressed image", ar: "صورة واحدة مضغوطة" },
          ],
          answer: 0,
          explain: {
            en: "Static export takes SSG further — the whole site becomes static files, hostable anywhere (like this very platform, on GitHub Pages).",
            ar: "التصدير الثابت يأخذ SSG أبعد — يصبح الموقع كله ملفات ثابتة، قابلة للاستضافة في أي مكان (كهذه المنصة نفسها، على GitHub Pages).",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Build your first Next app tonight

\`\`\`
npx create-next-app@latest my-site
cd my-site && npm run dev
\`\`\`

Open localhost:3000, then: add an \`app/about/page.tsx\`, link to it with \`<Link>\`, and deploy free on Vercel (connect your GitHub repo — it auto-deploys every push). If you want a fully static, server-free site like this platform, add \`output: "export"\` to \`next.config.ts\` and deploy the resulting \`out/\` folder to GitHub Pages instead.

**Freelance note:** "business site + blog in Next.js, deployed" is one of the most sellable junior projects — it demonstrates React, routing, SEO and deployment in one artifact.`,
        ar: `## ابنِ أول تطبيق Next الليلة

\`\`\`
npx create-next-app@latest my-site
cd my-site && npm run dev
\`\`\`

افتح localhost:3000، ثم: أضف \`app/about/page.tsx\`، واربطها بـ \`<Link>\`، وانشر مجاناً على Vercel (اربط مستودع GitHub — ينشر تلقائياً مع كل push). إن أردت موقعاً ثابتاً بالكامل بلا خادم كهذه المنصة، أضف \`output: "export"\` إلى \`next.config.ts\` وانشر مجلد \`out/\` الناتج على GitHub Pages بدلاً من ذلك.

**ملاحظة للعمل الحر:** "موقع شركة + مدونة بـ Next.js منشور فعلياً" من أكثر مشاريع المبتدئين قابلية للبيع — يثبت React والتوجيه وSEO والنشر في عمل واحد.`,
      },
    },
  ],
};
