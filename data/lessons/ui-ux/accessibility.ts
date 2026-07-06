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
      type: "text",
      body: {
        en: `## Forms and focus: the parts people forget 🔎

Beyond images and buttons, two more accessibility basics quietly make or break a product for many users:

**1. Labels on form fields.** An \`<input>\` with only a placeholder ("Email...") is a trap: the placeholder vanishes the moment someone starts typing, and screen readers often don't announce placeholder text as a label at all. The fix is a real \`<label>\` tied to the input with \`for\`/\`id\`: \`<label for="email">Email</label><input id="email">\`. Now a screen reader announces "Email, edit text" and — as a bonus — clicking the label text focuses the input, which helps anyone with shaky motor control aim more easily.

**2. Visible focus indicators.** When you press Tab, the browser draws an outline around the currently focused element by default. Many designers strip this with \`outline: none\` because they think it looks messy — but without it, a keyboard user has no idea where they are on the page. It's like hiding the cursor in a text editor. If you must restyle it, replace it with an equally clear alternative (a colored ring, a background change) — never delete it outright.

**3. Skip links.** On a page with a long navigation menu, a sighted mouse user just clicks past it — but a keyboard user must Tab through *every single link* before reaching the main content, every single page load. A "Skip to main content" link (visually hidden until it receives focus) lets keyboard users jump straight past the repeated navigation.

None of these are exotic. They're small, cheap details that separate a page that merely *looks* accessible from one that actually *is*.`,
        ar: `## النماذج والتركيز: الأجزاء التي ينساها الناس 🔎

بعد الصور والأزرار، أساسان آخران لإمكانية الوصول يصنعان أو يكسران المنتج بصمت لكثير من المستخدمين:

**1. تسميات حقول النماذج.** \`<input>\` بمجرد نص توضيحي placeholder ("البريد الإلكتروني...") فخ: النص التوضيحي يختفي لحظة يبدأ أحدهم الكتابة، وقارئات الشاشة غالباً لا تعلن نص placeholder كتسمية أصلاً. الحل \`<label>\` حقيقي مرتبط بالحقل بـ for/id: \`<label for="email">البريد</label><input id="email">\`. الآن يعلن قارئ الشاشة "البريد، تحرير نص" — وكمكافأة، النقر على نص التسمية يركّز الحقل، ما يساعد أي شخص بتحكّم حركي مرتجف على التصويب بسهولة أكبر.

**2. مؤشرات التركيز المرئية.** عند الضغط على Tab، يرسم المتصفح إطاراً حول العنصر المُركَّز عليه حالياً افتراضياً. كثير من المصمّمين يزيلونه بـ \`outline: none\` ظنّاً أنه يبدو فوضوياً — لكن بدونه، مستخدم لوحة المفاتيح لا يعرف أين هو في الصفحة إطلاقاً. مثل إخفاء المؤشر في محرّر نصوص. إن اضطررت لإعادة تصميمه، استبدله ببديل واضح بنفس القدر (حلقة ملوّنة، تغيير خلفية) — لا تحذفه إطلاقاً.

**3. روابط التخطي (Skip links).** في صفحة بقائمة تنقّل طويلة، المستخدم المبصر بالفأرة ينقر متجاوزاً إياها فقط — لكن مستخدم لوحة المفاتيح يجب أن يمرّ بـTab عبر *كل رابط* قبل الوصول للمحتوى الرئيسي، في كل تحميل صفحة. رابط "تخطَّ إلى المحتوى الرئيسي" (مخفي بصرياً حتى يتلقّى التركيز) يتيح لمستخدمي لوحة المفاتيح القفز مباشرة متجاوزين التنقّل المتكرر.

لا شيء من هذا غريب. إنها تفاصيل صغيرة رخيصة تفصل صفحة *تبدو* فقط متاحة عن أخرى *فعلاً* متاحة.`,
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
      type: "exercise",
      lang: "web",
      prompt: {
        en: `Give a form field a real label and a visible focus ring. Make two changes:
1. Add a \`<label for="name">\` with any text right before the \`<input id="name">\`, so the label and input are properly connected
2. In the \`<style>\`, give \`input:focus\` a visible \`outline\` (e.g. \`3px solid #2563eb\`) instead of the current \`outline: none\``,
        ar: `أعطِ حقل النموذج تسمية حقيقية وحلقة تركيز مرئية. أجرِ تغييرين:
1. أضف \`<label for="name">\` بأي نص مباشرة قبل \`<input id="name">\`، ليرتبط الحقل بالتسمية بشكل صحيح
2. في \`<style>\`، أعطِ \`input:focus\` إطاراً \`outline\` مرئياً (مثل \`3px solid #2563eb\`) بدل \`outline: none\` الحالي`,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; padding: 24px; }
      input { padding: 8px; border: 1px solid #999; border-radius: 6px; }
      input:focus { outline: none; }  /* keyboard users lose track of focus! */
    </style>
  </head>
  <body>
    <!-- add a <label for="name"> right here -->
    <input id="name" type="text" placeholder="Your name">
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; padding: 24px; }
      input { padding: 8px; border: 1px solid #999; border-radius: 6px; }
      input:focus { outline: 3px solid #2563eb; }
    </style>
  </head>
  <body>
    <label for="name">Your name</label>
    <input id="name" type="text" placeholder="Your name">
  </body>
</html>`,
      hints: [
        { en: `Add <label for="name">Your name</label> right before the <input>.`, ar: `أضف <label for="name">اسمك</label> مباشرة قبل <input>.` },
        { en: `Change input:focus { outline: none; } to input:focus { outline: 3px solid #2563eb; }`, ar: `غيّر input:focus { outline: none; } إلى input:focus { outline: 3px solid #2563eb; }` },
      ],
      tests: [
        { name: { en: "A <label> is connected to the input via for=\"name\"", ar: "يوجد <label> مرتبط بالحقل عبر for=\"name\"" }, check: `(function(){ var l = document.querySelector('label[for="name"]'); return l && l.textContent.trim().length > 0; })()` },
        { name: { en: "The input has id=\"name\" matching the label", ar: "الحقل له id=\"name\" مطابق للتسمية" }, check: `document.getElementById("name") !== null` },
        { name: { en: "input:focus has a visible outline (not none)", ar: "input:focus له إطار مرئي (لا none)" }, check: `(function(){ var el = document.getElementById("name"); el.focus(); var o = getComputedStyle(el).outlineStyle; return o && o !== "none"; })()` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the screen-reader user who couldn't checkout 🔍

A pattern reported again and again in accessibility audits and lawsuits (large retailers have been sued over exactly this) goes like this: an online store looks perfectly polished — until a blind customer using a screen reader tries to buy something. The "Add to Cart" button turns out to be a styled \`<div>\` with a click handler, invisible to keyboard navigation. The size dropdown has no associated \`<label>\`, so the screen reader just says "combo box" with no idea it means "shoe size." The checkout form's error messages appear only as a color change, silent to anyone who can't see red.

None of these are exotic bugs — each is one of the exact issues from this lesson: a fake button instead of a real one, a missing label, color-only feedback. Individually small, but stacked together they form a wall the customer cannot get past, at the exact moment they were ready to pay. The business loses a sale it never even knows it lost, silently, over and over, for every affected visitor.

The fix in every real case is the same, unglamorous checklist: real semantic elements, real labels, redundant (non-color) signals, and visible focus. None of it requires redesigning the store — it requires not skipping the basics. That's exactly why accessibility audits keep finding the same handful of issues: they're easy to overlook and cheap to fix, if you know to look.`,
        ar: `## دراسة حالة واقعية: مستخدم قارئ الشاشة الذي لم يستطع إتمام الشراء 🔍

نمط يُذكر مراراً في تدقيقات الوصول والدعاوى القضائية (متاجر كبرى رُفعت عليها دعاوى بسبب هذا بالضبط) يسير هكذا: متجر إلكتروني يبدو مصقولاً تماماً — حتى يحاول عميل كفيف يستخدم قارئ شاشة شراء شيء. يتضح أن زر "أضف للسلة" هو \`<div>\` مُنسَّق بمعالج نقر، غير مرئي لتنقّل لوحة المفاتيح. قائمة اختيار المقاس بلا \`<label>\` مرتبطة، فيقول قارئ الشاشة فقط "قائمة منسدلة" بلا أي فكرة أنها تعني "مقاس الحذاء." رسائل خطأ نموذج الدفع تظهر فقط كتغيير لون، صامتة لمن لا يرى الأحمر.

لا شيء من هذا خلل غريب — كلٌّ منها بالضبط إحدى المشاكل من هذا الدرس: زر مزيّف بدل حقيقي، تسمية مفقودة، تغذية راجعة بلون فقط. صغيرة فردياً، لكنها مجتمعة تشكّل جداراً لا يستطيع الزبون تجاوزه، في اللحظة بالضبط حين كان مستعداً للدفع. يخسر العمل بيعاً لا يعرف حتى أنه خسره، بصمت، مراراً وتكراراً، لكل زائر متأثر.

الإصلاح في كل حالة حقيقية هو نفس القائمة غير البرّاقة: عناصر دلالية حقيقية، تسميات حقيقية، إشارات متكررة (غير لونية)، وتركيز مرئي. لا شيء من هذا يتطلّب إعادة تصميم المتجر — يتطلّب فقط عدم تخطّي الأساسيات. لهذا بالضبط تستمر تدقيقات الوصول بإيجاد نفس الحفنة من المشاكل: يسهل تجاهلها ورخيصة الإصلاح، إن عرفت أين تنظر.`,
      },
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
        {
          q: { en: "What's wrong with using only a placeholder instead of a <label>?", ar: "ما الخطأ في استخدام placeholder فقط بدل <label>؟" },
          choices: [
            { en: "It disappears when typing starts and may not be announced as a label by screen readers", ar: "يختفي عند بدء الكتابة وقد لا يُعلَن كتسمية من قارئات الشاشة" },
            { en: "Nothing — placeholders are always a full replacement for labels", ar: "لا شيء — الـplaceholder يحل محل التسمية دائماً بالكامل" },
            { en: "Placeholders are only a decoration issue, not accessibility", ar: "الـplaceholder مسألة زخرفية فقط لا علاقة لها بالوصول" },
          ],
          answer: 0,
          explain: {
            en: "A real <label> stays announced and clickable at all times; a placeholder vanishes the moment the user types and is often skipped by assistive tech.",
            ar: "الـ<label> الحقيقي يبقى مُعلَناً وقابلاً للنقر دائماً؛ والـplaceholder يختفي لحظة الكتابة وغالباً تتجاهله التقنية المساعدة.",
          },
        },
        {
          q: { en: "Why should you avoid outline: none on :focus without replacing it?", ar: "لماذا نتجنب outline: none على :focus دون استبداله؟" },
          choices: [
            { en: "It removes the only visual clue keyboard users have for where they are on the page", ar: "يزيل الدليل البصري الوحيد لمستخدمي لوحة المفاتيح على مكانهم في الصفحة" },
            { en: "It's a syntax error in CSS", ar: "إنه خطأ نحوي في CSS" },
            { en: "It makes the page load more slowly", ar: "يجعل الصفحة أبطأ تحميلاً" },
          ],
          answer: 0,
          explain: {
            en: "Removing focus outlines is like hiding a text cursor — keyboard users lose all sense of where they are. Replace it, never delete it.",
            ar: "إزالة إطار التركيز أشبه بإخفاء مؤشر النص — يفقد مستخدمو لوحة المفاتيح كل إحساس بمكانهم. استبدله، لا تحذفه.",
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
- Labels, visible focus, and skip links — the form/keyboard details many designers forget
- The screen-reader checkout case study — small oversights stack into a wall users can't get past

**Path to paid work:** UX/UI designers are in high demand. Learn Figma deeply, rebuild 3–4 real app screens applying everything here, do one small user test, and assemble a portfolio (a personal site or Behance/Dribbble). If you also learned the Frontend track, you're a rare designer-who-codes — extremely employable and perfect for freelance. Pair it with the "Getting Paid" lesson and start landing clients. Design things people love — and that everyone can use! 🎨`,
        ar: `## اكتمل المسار! 🎓

أساس UI/UX لديك مبنيّ:

- مبادئ التصميم، الطباعة والألوان — أساسيات المظهر الجيد
- Figma، بحث المستخدم، الإطار السلكي، النماذج — عملية التصميم
- أنظمة التصميم وإمكانية الوصول — منتجات متسقة شاملة على نطاق واسع
- التسميات، تركيز مرئي، وروابط التخطي — تفاصيل النماذج/لوحة المفاتيح التي ينساها كثير من المصمّمين
- دراسة حالة قارئ الشاشة عند الدفع — إغفالات صغيرة تتراكم لجدار لا يتجاوزه المستخدمون

**طريق العمل المدفوع:** مصمّمو UX/UI مطلوبون بشدة. تعلّم Figma بعمق، أعد بناء 3–4 شاشات تطبيق حقيقية مطبّقاً كل ما هنا، أجرِ اختبار مستخدم صغيراً، واجمع معرضاً (موقع شخصي أو Behance/Dribbble). وإن تعلّمت مسار الواجهات أيضاً، فأنت مصمّم-يبرمج نادر — قابل للتوظيف بشدة ومثالي للعمل الحر. ازوجها بدرس "التكسّب" وابدأ بجذب العملاء. صمّم أشياء يحبها الناس — ويستطيع الجميع استخدامها! 🎨`,
      },
    },
  ],
};
