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
- The mental map you need before opening the docs

Next.js needs Node and a dev server, so this is a map-drawing lesson: theory + quiz, then you build locally.`,
        ar: `## ماذا ستتعلم

- ماذا يضيف "إطار العمل" فوق React
- التوجيه بالملفات، والعرض من الخادم، ولماذا يهمّان
- الخريطة الذهنية التي تحتاجها قبل فتح التوثيق

Next.js يحتاج Node وخادم تطوير، لذا هذا درس رسم خريطة: نظرية + اختبار، ثم تبني محلياً.`,
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

Open localhost:3000, then: add an \`app/about/page.tsx\`, link to it with \`<Link>\`, and deploy free on Vercel (connect your GitHub repo — it auto-deploys every push).

**Freelance note:** "business site + blog in Next.js, deployed" is one of the most sellable junior projects — it demonstrates React, routing, SEO and deployment in one artifact.`,
        ar: `## ابنِ أول تطبيق Next الليلة

\`\`\`
npx create-next-app@latest my-site
cd my-site && npm run dev
\`\`\`

افتح localhost:3000، ثم: أضف \`app/about/page.tsx\`، واربطها بـ \`<Link>\`، وانشر مجاناً على Vercel (اربط مستودع GitHub — ينشر تلقائياً مع كل push).

**ملاحظة للعمل الحر:** "موقع شركة + مدونة بـ Next.js منشور فعلياً" من أكثر مشاريع المبتدئين قابلية للبيع — يثبت React والتوجيه وSEO والنشر في عمل واحد.`,
      },
    },
  ],
};
