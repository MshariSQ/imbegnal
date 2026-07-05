import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "accessibility",
  title: { en: "Accessibility — Design for Everyone", ar: "إمكانية الوصول — صمّم للجميع" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What accessibility (a11y) means and why it matters
- Color contrast, alt text, keyboard navigation
- The idea that a11y helps *everyone*
- You'll fix a page's accessibility issues`,
        ar: `## ماذا ستتعلم

- ماذا تعني إمكانية الوصول (a11y) ولماذا تهم
- تباين الألوان، النص البديل، التنقّل بلوحة المفاتيح
- فكرة أن a11y تساعد *الجميع*
- ستُصلح مشاكل وصول في صفحة`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Design for everyone 🌍

Over **1 billion people** live with some disability — vision, hearing, motor, or cognitive. **Accessibility** (often "a11y" — a, then 11 letters, then y) means designing so *everyone* can use your product, including people who are blind, have low vision, are colorblind, can't use a mouse, or use assistive technology. It's not a niche add-on; it's part of designing well. In many countries it's also a *legal requirement*.

**The key practices** (each simple, each huge for someone):

**1. Color contrast.** Text must stand out enough from its background to be readable. That trendy light-grey-on-white looks elegant but is invisible to many. The standard (WCAG) requires a contrast ratio of at least **4.5:1** for normal text. Free tools (WebAIM Contrast Checker) tell you instantly. This also just makes your design more readable for *everyone*, in sunlight or on cheap screens.

**2. Alt text.** Every meaningful image needs an \`alt\` attribute describing it: \`<img src="dog.jpg" alt="A golden retriever catching a ball">\`. A blind user's screen reader reads this aloud. Without alt text, they hear "image" — useless. (It also helps SEO and shows when images fail to load.)

**3. Keyboard navigation.** Many people can't use a mouse (motor disabilities, or power users). Everything clickable must also work with the **Tab** key to move and **Enter** to activate. Use real \`<button>\` and \`<a>\` elements (which are keyboard-friendly by default) instead of clickable \`<div>\`s.

**4. Semantic HTML.** Use the right tag for the job: \`<button>\` for buttons, \`<h1>\`–\`<h6>\` for headings in order, \`<nav>\` for navigation. Screen readers use this structure to let users jump around. A page of meaningless \`<div>\`s is a maze for them.

**The curb-cut effect.** Sidewalk ramps were built for wheelchairs — but they help everyone with strollers, luggage, and bikes. Accessibility is the same: captions help deaf users *and* anyone in a noisy room; high contrast helps blind users *and* everyone in bright sunlight; keyboard support helps motor-impaired users *and* fast power users. **Designing for the edges improves the experience for all.**

Accessibility isn't extra work bolted on at the end — it's a mark of a thoughtful, professional designer, and increasingly, a skill employers specifically look for.`,
        ar: `## صمّم للجميع 🌍

أكثر من **مليار شخص** يعيشون مع إعاقة ما — بصرية، سمعية، حركية، أو إدراكية. **إمكانية الوصول** (غالباً "a11y" — a ثم 11 حرفاً ثم y) تعني التصميم بحيث يستطيع *الجميع* استخدام منتجك، بمن فيهم المكفوفون، وضعاف البصر، ومصابو عمى الألوان، ومن لا يستطيعون استخدام الفأرة، ومستخدمو التقنيات المساعدة. ليست إضافة هامشية؛ بل جزء من التصميم الجيد. وفي دول كثيرة *متطلّب قانوني* أيضاً.

**الممارسات الأساسية** (كلٌّ بسيطة، وكلٌّ هائلة لأحدهم):

**1. تباين الألوان.** يجب أن يبرز النص عن خلفيته بما يكفي للقراءة. الرمادي الفاتح على الأبيض العصري يبدو أنيقاً لكنه غير مرئي لكثيرين. المعيار (WCAG) يتطلّب نسبة تباين لا تقل عن **4.5:1** للنص العادي. أدوات مجانية (WebAIM Contrast Checker) تخبرك فوراً. وهذا أيضاً يجعل تصميمك أوضح قراءة لـ*الجميع*، في الشمس أو على شاشات رخيصة.

**2. النص البديل (Alt text).** كل صورة ذات معنى تحتاج خاصية \`alt\` تصفها: \`<img src="dog.jpg" alt="كلب قولدن ريتريفر يلتقط كرة">\`. قارئ شاشة الكفيف يقرؤها بصوت عالٍ. وبدونها يسمع "صورة" — عديمة الفائدة. (تساعد SEO أيضاً وتظهر حين تفشل الصور في التحميل.)

**3. التنقّل بلوحة المفاتيح.** كثيرون لا يستطيعون استخدام الفأرة (إعاقات حركية، أو مستخدمون محترفون). كل ما يُنقر يجب أن يعمل أيضاً بمفتاح **Tab** للتنقّل و**Enter** للتفعيل. استخدم عناصر \`<button>\` و\`<a>\` الحقيقية (صديقة للوحة المفاتيح افتراضياً) بدل \`<div>\` قابلة للنقر.

**4. HTML الدلالي.** استخدم الوسم الصحيح للمهمة: \`<button>\` للأزرار، و\`<h1>\`–\`<h6>\` للعناوين بالترتيب، و\`<nav>\` للتنقّل. قارئات الشاشة تستخدم هذه البنية لتتيح للمستخدمين القفز. وصفحة من \`<div>\` بلا معنى متاهة لهم.

**أثر منحدر الرصيف.** منحدرات الأرصفة بُنيت للكراسي المتحركة — لكنها تساعد الجميع بعربات الأطفال والحقائب والدراجات. إمكانية الوصول مثلها: التسميات التوضيحية تساعد الصمّ *وأي أحد* في غرفة صاخبة؛ والتباين العالي يساعد المكفوفين *والجميع* في شمس ساطعة؛ ودعم لوحة المفاتيح يساعد ذوي الإعاقة الحركية *والمحترفين السريعين*. **التصميم للأطراف يحسّن التجربة للكل.**

إمكانية الوصول ليست عملاً إضافياً يُلصق في النهاية — بل علامة مصمّم مدروس محترف، ومتزايداً، مهارة يبحث عنها أصحاب العمل تحديداً.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `Fix this page's accessibility. Make three changes:
1. Give the \`<img>\` a descriptive \`alt\` attribute (any non-empty description)
2. Change the clickable \`<div id="cta">\` into a real \`<button>\` (keyboard-accessible) — keep the text "Get Started"
3. In the \`<style>\`, fix \`.low\` text so its \`color\` is dark enough to read — set it to \`#333\` or darker (not the current light grey)`,
        ar: `أصلِح إمكانية وصول هذه الصفحة. أجرِ ثلاثة تغييرات:
1. أعطِ \`<img>\` خاصية \`alt\` وصفية (أي وصف غير فارغ)
2. حوّل \`<div id="cta">\` القابل للنقر إلى \`<button>\` حقيقي (متاح بلوحة المفاتيح) — أبقِ النص "Get Started"
3. في \`<style>\`، أصلِح نص \`.low\` بحيث يكون \`color\` داكناً بما يكفي للقراءة — اجعله \`#333\` أو أدكن (لا الرمادي الفاتح الحالي)`,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; padding: 24px; }
      .low { color: #cccccc; }   /* too light to read */
      button, #cta { padding: 10px 18px; background: #10b981; color: white; border: none; border-radius: 8px; }
    </style>
  </head>
  <body>
    <img src="team.jpg" width="120">
    <p class="low">Welcome to our platform.</p>
    <div id="cta">Get Started</div>
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; padding: 24px; }
      .low { color: #333; }
      button, #cta { padding: 10px 18px; background: #10b981; color: white; border: none; border-radius: 8px; }
    </style>
  </head>
  <body>
    <img src="team.jpg" width="120" alt="Our team working together">
    <p class="low">Welcome to our platform.</p>
    <button id="cta">Get Started</button>
  </body>
</html>`,
      hints: [
        { en: `Add alt="..." inside the <img> tag. Replace <div id="cta"> and </div> with <button id="cta"> and </button>.`, ar: `أضف alt="..." داخل وسم <img>. استبدل <div id="cta"> و</div> بـ <button id="cta"> و</button>.` },
        { en: `In .low change color to #333 (or #000) so the contrast is high enough.`, ar: `في .low غيّر color إلى #333 (أو #000) ليكون التباين كافياً.` },
      ],
      tests: [
        { name: { en: "Image has non-empty alt text", ar: "الصورة لها نص بديل غير فارغ" }, check: `(function(){ var img = document.querySelector("img"); return img && img.getAttribute("alt") && img.getAttribute("alt").trim().length > 0; })()` },
        { name: { en: "CTA is a real <button>", ar: "زر الإجراء عنصر <button> حقيقي" }, check: `(function(){ var el = document.querySelector("#cta"); return el && el.tagName === "BUTTON"; })()` },
        { name: { en: "Low text now has readable dark color", ar: "نص low صار بلون داكن مقروء" }, check: `(function(){ var c = getComputedStyle(document.querySelector(".low")).color.match(/\\d+/g); return c && parseInt(c[0]) <= 80 && parseInt(c[1]) <= 80 && parseInt(c[2]) <= 80; })()` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What does 'alt text' do?", ar: "ماذا يفعل 'النص البديل'؟" },
          choices: [
            { en: "Describes an image so screen readers can read it aloud", ar: "يصف صورة ليقرأها قارئ الشاشة بصوت عالٍ" },
            { en: "Makes the image bigger", ar: "يكبّر الصورة" },
            { en: "Changes the image color", ar: "يغيّر لون الصورة" },
          ],
          answer: 0,
          explain: {
            en: "alt describes the image for blind users (and shows if it fails to load, and helps SEO). Essential accessibility.",
            ar: "alt يصف الصورة للمكفوفين (ويظهر إن فشل تحميلها، ويساعد SEO). وصول أساسي.",
          },
        },
        {
          q: { en: "Why prefer a real <button> over a clickable <div>?", ar: "لماذا نفضّل <button> حقيقياً على <div> قابل للنقر؟" },
          choices: [
            { en: "Buttons are keyboard-accessible and understood by screen readers by default", ar: "الأزرار متاحة بلوحة المفاتيح ومفهومة لقارئات الشاشة افتراضياً" },
            { en: "Divs are illegal", ar: "الـ divs غير قانونية" },
            { en: "Buttons load faster", ar: "الأزرار تحمّل أسرع" },
          ],
          answer: 0,
          explain: {
            en: "Semantic elements come with keyboard support and meaning built in; a clickable div excludes keyboard and screen-reader users.",
            ar: "العناصر الدلالية تأتي بدعم لوحة المفاتيح والمعنى مدمجين؛ وdiv قابل للنقر يستبعد مستخدمي لوحة المفاتيح وقارئات الشاشة.",
          },
        },
        {
          q: { en: "What is the 'curb-cut effect'?", ar: "ما هو 'أثر منحدر الرصيف'؟" },
          choices: [
            { en: "Designing for disabilities ends up helping everyone", ar: "التصميم للإعاقات ينتهي بمساعدة الجميع" },
            { en: "A type of CSS animation", ar: "نوع من حركات CSS" },
            { en: "A bug in browsers", ar: "خطأ في المتصفحات" },
          ],
          answer: 0,
          explain: {
            en: "Ramps help wheelchairs AND strollers; captions help the deaf AND noisy rooms. Accessibility lifts the whole experience.",
            ar: "المنحدرات تساعد الكراسي والعربات؛ والتسميات تساعد الصمّ والغرف الصاخبة. الوصول يرفع التجربة كلها.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Track complete! 🎓

Your UI/UX foundation is built:

- Design principles, typography & color — the fundamentals of looking good
- Figma, user research, wireframing, prototyping — the design process
- Design systems & accessibility — consistent, inclusive products at scale

**Path to paid work:** UX/UI designers are in high demand. Learn Figma deeply, rebuild 3–4 real app screens applying everything here, do one small user test, and assemble a portfolio (a personal site or Behance/Dribbble). If you also learned the Frontend track, you're a rare designer-who-codes — extremely employable and perfect for freelance. Pair it with the "Getting Paid" lesson and start landing clients. Design things people love — and that everyone can use! 🎨`,
        ar: `## اكتمل المسار! 🎓

أساس UI/UX لديك مبنيّ:

- مبادئ التصميم، الطباعة والألوان — أساسيات المظهر الجيد
- Figma، بحث المستخدم، الإطار السلكي، النماذج — عملية التصميم
- أنظمة التصميم وإمكانية الوصول — منتجات متسقة شاملة على نطاق واسع

**طريق العمل المدفوع:** مصمّمو UX/UI مطلوبون بشدة. تعلّم Figma بعمق، أعد بناء 3–4 شاشات تطبيق حقيقية مطبّقاً كل ما هنا، أجرِ اختبار مستخدم صغيراً، واجمع معرضاً (موقع شخصي أو Behance/Dribbble). وإن تعلّمت مسار الواجهات أيضاً، فأنت مصمّم-يبرمج نادر — قابل للتوظيف بشدة ومثالي للعمل الحر. ازوجها بدرس "التكسّب" وابدأ بجذب العملاء. صمّم أشياء يحبها الناس — ويستطيع الجميع استخدامها! 🎨`,
      },
    },
  ],
};
