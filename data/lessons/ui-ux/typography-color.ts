import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "typography-color",
  title: { en: "Typography & Color — The Feel of Design", ar: "الطباعة والألوان — إحساس التصميم" },
  estMinutes: 35,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why typography is 90% of design
- Font pairing, sizing, and line-height
- Color theory basics and the 60-30-10 rule
- You'll build a readable, well-colored text block`,
        ar: `## ماذا ستتعلم

- لماذا الطباعة 90% من التصميم
- تزاوج الخطوط، الأحجام، وارتفاع السطر
- أساسيات نظرية الألوان وقاعدة 60-30-10
- ستبني كتلة نص مقروءة حسنة التلوين`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Words are most of the web ✍️

Most of what people do online is *read*. So **typography** — how text looks — is arguably 90% of design. Get it right and everything feels polished; get it wrong and no amount of pretty colors will save you.

**The essentials:**
- **Font choice.** Two broad families: **serif** (little feet on letters, like Times — traditional, editorial) and **sans-serif** (clean, no feet, like Arial — modern, digital). Most interfaces use sans-serif for clarity on screens. For Arabic, fonts like Tajawal or Cairo (this site uses Tajawal!) are made to read beautifully.
- **Font pairing.** Usually pick just **1–2 fonts** for a whole design (e.g. one for headings, one for body). More than that looks messy. When in doubt, use a single good font in different sizes and weights.
- **Size & hierarchy.** Body text around 16px; headings clearly bigger. Establish a scale (16 → 20 → 28 → 40) so sizes feel intentional, not random.
- **Line-height (leading).** The space between lines. Too tight and text feels cramped and hard to read; ~1.5× the font size is a comfortable default for body text. This one setting dramatically affects readability.
- **Line length.** ~50–75 characters per line is easiest to read. Very wide lines tire the eye.

**Color** sets the mood — but use it with discipline:
- **The 60-30-10 rule.** A balanced palette: **60%** a dominant/neutral color (usually the background), **30%** a secondary color, **10%** an accent for calls-to-action. This keeps things harmonious and tells the eye where to click.
- **Meaning.** Colors carry meaning: green = success, red = error/danger, yellow = warning, blue = trust/info. Use these consistently.
- **Less is more.** Beginners use too many colors. A restrained palette (one accent + neutrals) almost always looks more professional than a rainbow.

Together, clean typography and a disciplined palette do more for "looking professional" than any fancy graphic. They're the foundation every polished interface stands on.`,
        ar: `## الكلمات معظم الويب ✍️

معظم ما يفعله الناس على الإنترنت هو *القراءة*. لذا **الطباعة** — كيف يبدو النص — يمكن القول إنها 90% من التصميم. أتقنها فيبدو كل شيء مصقولاً؛ أخطئها فلن ينقذك أي قدر من الألوان الجميلة.

**الأساسيات:**
- **اختيار الخط.** عائلتان عريضتان: **مذيّل (serif)** (أقدام صغيرة على الحروف، مثل Times — تقليدي، تحريري) و**غير مذيّل (sans-serif)** (نظيف، بلا أقدام، مثل Arial — حديث، رقمي). معظم الواجهات تستخدم غير المذيّل للوضوح على الشاشات. وللعربية، خطوط مثل Tajawal أو Cairo (هذا الموقع يستخدم Tajawal!) مصنوعة لتُقرأ بجمال.
- **تزاوج الخطوط.** عادة اختر **خطاً أو اثنين** لتصميم كامل (مثلاً واحد للعناوين وواحد للنص). أكثر من ذلك يبدو فوضوياً. عند الشك، استخدم خطاً جيداً واحداً بأحجام وأوزان مختلفة.
- **الحجم والتسلسل.** نص الجسم حوالي 16px؛ والعناوين أكبر بوضوح. أنشئ مقياساً (16 → 20 → 28 → 40) لتبدو الأحجام مقصودة لا عشوائية.
- **ارتفاع السطر (leading).** المسافة بين الأسطر. ضيّق جداً فيبدو النص محشوراً وصعب القراءة؛ و~1.5× حجم الخط افتراضي مريح لنص الجسم. هذا الإعداد الواحد يؤثّر بشدة على القراءة.
- **طول السطر.** ~50–75 حرفاً في السطر أسهل للقراءة. الأسطر العريضة جداً تُتعب العين.

**اللون** يحدد المزاج — لكن استخدمه بانضباط:
- **قاعدة 60-30-10.** لوحة متوازنة: **60%** لون مهيمن/محايد (عادة الخلفية)، **30%** لون ثانوي، **10%** لون مميّز لأزرار الإجراء. يُبقي هذا الأمور متناغمة ويخبر العين أين تنقر.
- **المعنى.** الألوان تحمل معنى: أخضر = نجاح، أحمر = خطأ/خطر، أصفر = تحذير، أزرق = ثقة/معلومة. استخدمها باتساق.
- **الأقل أكثر.** المبتدئون يستخدمون ألواناً كثيرة. لوحة مقيّدة (لون مميّز + محايدات) تبدو دائماً تقريباً أكثر احترافية من قوس قزح.

معاً، الطباعة النظيفة واللوحة المنضبطة تفعلان لـ"المظهر الاحترافي" أكثر من أي رسم فاخر. إنهما الأساس الذي تقف عليه كل واجهة مصقولة.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `Make text readable. The article below is cramped and hard to read. In the \`<style>\`, set on \`.article\`:
1. \`line-height\` of at least \`1.5\`
2. \`max-width\` of \`700px\` or less (to keep lines from getting too wide)
3. an accent \`color\` on \`.article h1\` that isn't black (any non-black color)`,
        ar: `اجعل النص مقروءاً. المقال أدناه محشور وصعب القراءة. في \`<style>\`، اضبط على \`.article\`:
1. \`line-height\` لا يقل عن \`1.5\`
2. \`max-width\` بمقدار \`700px\` أو أقل (لمنع الأسطر من أن تصبح عريضة جداً)
3. لوناً مميّزاً \`color\` على \`.article h1\` ليس أسود (أي لون غير أسود)`,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; padding: 20px; }
      .article {
        /* add line-height and max-width */
      }
      .article h1 {
        /* add an accent color */
      }
    </style>
  </head>
  <body>
    <div class="article">
      <h1>The Art of Reading</h1>
      <p>Good typography makes text effortless to read. Line height, line length, and color all work together so the reader never has to struggle. When done well, you don't notice it at all.</p>
    </div>
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; padding: 20px; }
      .article {
        line-height: 1.6;
        max-width: 640px;
      }
      .article h1 {
        color: #2563eb;
      }
    </style>
  </head>
  <body>
    <div class="article">
      <h1>The Art of Reading</h1>
      <p>Good typography makes text effortless to read. Line height, line length, and color all work together so the reader never has to struggle. When done well, you don't notice it at all.</p>
    </div>
  </body>
</html>`,
      hints: [
        { en: `In .article: line-height: 1.6; max-width: 640px;`, ar: `في .article: line-height: 1.6; max-width: 640px;` },
        { en: `In .article h1: color: #2563eb; (or any non-black color).`, ar: `في .article h1: color: #2563eb; (أو أي لون غير أسود).` },
      ],
      tests: [
        { name: { en: "line-height is at least 1.5", ar: "ارتفاع السطر لا يقل عن 1.5" }, check: `(function(){ var el = document.querySelector(".article"); var lh = parseFloat(getComputedStyle(el).lineHeight); var fs = parseFloat(getComputedStyle(el).fontSize); return lh / fs >= 1.45; })()` },
        { name: { en: "max-width is 700px or less", ar: "أقصى عرض 700px أو أقل" }, check: `(function(){ var mw = parseFloat(getComputedStyle(document.querySelector(".article")).maxWidth); return mw > 0 && mw <= 700; })()` },
        { name: { en: "Heading has a non-black accent color", ar: "العنوان له لون مميّز غير أسود" }, check: `(function(){ var c = getComputedStyle(document.querySelector(".article h1")).color; return c !== "rgb(0, 0, 0)"; })()` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "How many fonts should a typical design use?", ar: "كم خطاً يجب أن يستخدم تصميم نموذجي؟" },
          choices: [
            { en: "1–2", ar: "1–2" },
            { en: "At least 5", ar: "5 على الأقل" },
            { en: "A different font per paragraph", ar: "خط مختلف لكل فقرة" },
          ],
          answer: 0,
          explain: {
            en: "One or two fonts keep a design cohesive. Vary size and weight for hierarchy instead of adding more typefaces.",
            ar: "خط أو اثنان يبقيان التصميم متماسكاً. نوّع الحجم والوزن للتسلسل بدل إضافة خطوط أكثر.",
          },
        },
        {
          q: { en: "What does the 60-30-10 rule describe?", ar: "ماذا تصف قاعدة 60-30-10؟" },
          choices: [
            { en: "A balanced color split: 60% dominant, 30% secondary, 10% accent", ar: "توزيع لون متوازن: 60% مهيمن، 30% ثانوي، 10% مميّز" },
            { en: "Font sizes", ar: "أحجام الخطوط" },
            { en: "Screen resolutions", ar: "دقّات الشاشة" },
          ],
          answer: 0,
          explain: {
            en: "60% neutral/background, 30% secondary, 10% accent for CTAs — a simple recipe for a harmonious palette.",
            ar: "60% محايد/خلفية، 30% ثانوي، 10% مميّز للإجراءات — وصفة بسيطة للوحة متناغمة.",
          },
        },
        {
          q: { en: "Why set line-height around 1.5 for body text?", ar: "لماذا نضبط ارتفاع السطر حوالي 1.5 لنص الجسم؟" },
          choices: [
            { en: "It gives lines breathing room, making text much easier to read", ar: "يمنح الأسطر مساحة تنفّس، فيصبح النص أسهل قراءة بكثير" },
            { en: "It makes the page load faster", ar: "يجعل الصفحة تحمّل أسرع" },
            { en: "It's required by HTML", ar: "HTML يفرضه" },
          ],
          answer: 0,
          explain: {
            en: "Cramped lines are hard to read; ~1.5× line spacing is a comfortable, standard default that boosts readability.",
            ar: "الأسطر المحشورة صعبة القراءة؛ و~1.5× تباعد السطر افتراضي مريح قياسي يعزّز القراءة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Typography is ~90% of design — font choice, size, line-height, line length
- Use 1–2 fonts; body ~16px with ~1.5 line-height and 50–75 char lines
- Color with discipline: 60-30-10, consistent meaning, fewer colors
- You made a cramped article readable

**Next:** Figma — the tool where you'll actually design interfaces.`,
        ar: `## الخلاصة

- الطباعة ~90% من التصميم — اختيار الخط، الحجم، ارتفاع السطر، طول السطر
- استخدم خطاً أو اثنين؛ الجسم ~16px بارتفاع سطر ~1.5 وأسطر 50–75 حرفاً
- اللون بانضباط: 60-30-10، معنى متسق، ألوان أقل
- جعلت مقالاً محشوراً مقروءاً

**التالي:** Figma — الأداة التي ستصمّم فيها الواجهات فعلاً.`,
      },
    },
  ],
};
