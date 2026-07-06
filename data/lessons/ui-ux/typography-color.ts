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
      type: "text",
      body: {
        en: `## Never rely on color alone 🎨🚫

About **1 in 12 men** and 1 in 200 women have some form of color blindness (most commonly red-green). If your design's *only* signal for something important is a color — a red vs. green dot for "offline/online," a red border on an invalid field with no other clue — a meaningful slice of your users literally cannot perceive the difference.

**The fix is simple and always works: pair color with a second signal.**
- An error field should get a red border **and** an icon **and** a text message ("Email is required") — not just red.
- A status dot should have color **and** a label ("● Online" vs "● Offline") or a distinct shape.
- A chart shouldn't rely on "the blue line vs the green line" alone — add different line styles (dashed/solid) or direct labels.

This is directly related to the type scale you just learned. A well-built **type scale** (a fixed set of font sizes, usually multiplying by a ratio like 1.25× or 1.333× each step: 16 → 20 → 25 → 31px) does something similar for hierarchy — it means *size alone*, not just color or boldness, reliably tells users what's most important, which helps low-vision users too. Redundant signals — color + icon + text, or size + weight + spacing — make a design robust for everyone, not just an edge case.

This single habit (never color alone) is one of the most-cited items in real accessibility audits, and it costs almost nothing to apply if you build it in from the start.`,
        ar: `## لا تعتمد على اللون وحده أبداً 🎨🚫

نحو **1 من كل 12 رجلاً** و1 من كل 200 امرأة لديهم شكل من عمى الألوان (الأشيع هو الأحمر-الأخضر). إن كانت إشارة تصميمك *الوحيدة* لشيء مهم هي لون — نقطة حمراء مقابل خضراء لـ"غير متصل/متصل"، أو حدّ أحمر على حقل غير صالح بلا أي دليل آخر — فشريحة معتبرة من مستخدميك لا يستطيعون فعلياً إدراك الفرق.

**الحل بسيط ويعمل دائماً: ازوج اللون بإشارة ثانية.**
- الحقل الخاطئ يجب أن يحصل على حدّ أحمر **و**أيقونة **و**رسالة نصية ("البريد الإلكتروني مطلوب") — لا الأحمر فقط.
- نقطة الحالة يجب أن تحمل لوناً **و**تسمية ("● متصل" مقابل "● غير متصل") أو شكلاً مميّزاً.
- الرسم البياني يجب ألّا يعتمد على "الخط الأزرق مقابل الأخضر" وحده — أضف أنماط خطوط مختلفة (متقطع/متصل) أو تسميات مباشرة.

هذا مرتبط مباشرة بمقياس الخط الذي تعلّمته للتو. **مقياس الخط** المبني جيداً (مجموعة ثابتة من أحجام الخط، عادة بضرب نسبة كـ1.25× أو 1.333× كل خطوة: 16 → 20 → 25 → 31px) يفعل شيئاً مشابهاً للتسلسل — يعني أن *الحجم وحده*، لا اللون أو العريض فقط، يخبر المستخدمين بموثوقية ما هو الأهم، وهذا يساعد ضعاف البصر أيضاً. الإشارات المتكررة — لون + أيقونة + نص، أو حجم + وزن + تباعد — تجعل التصميم متيناً للجميع، لا لحالة استثنائية فقط.

هذه العادة الواحدة (لا تعتمد على اللون وحده أبداً) من أكثر البنود المذكورة في تدقيقات الوصول الحقيقية، وتكلفتها شبه معدومة إن طبّقتها من البداية.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `Fix a color-only error state. The invalid field below only turns red — someone with color blindness (or on a washed-out screen) can't tell it's an error. In the HTML, add a text error message; in the \`<style>\`, style it clearly:
1. Add a \`<p class="error-msg">\` right after the input, with text like "Email is required" (any non-empty text)
2. Give \`.error-msg\` a \`color\` of red (or \`#dc2626\`) so it's visually tied to the error, IN ADDITION to the border — color is now a bonus signal, not the only one`,
        ar: `أصلِح حالة خطأ تعتمد على اللون وحده. الحقل غير الصالح أدناه يتحوّل للأحمر فقط — من لديه عمى ألوان (أو على شاشة باهتة) لا يستطيع معرفة أنه خطأ. في HTML، أضف رسالة خطأ نصية؛ وفي \`<style>\`، صمّمها بوضوح:
1. أضف \`<p class="error-msg">\` مباشرة بعد الحقل، بنص مثل "البريد الإلكتروني مطلوب" (أي نص غير فارغ)
2. أعطِ \`.error-msg\` لون \`color\` أحمر (أو \`#dc2626\`) ليرتبط بصرياً بالخطأ، بالإضافة إلى الحدّ — اللون الآن إشارة إضافية لا الوحيدة`,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; padding: 24px; }
      .field { border: 2px solid #dc2626; padding: 8px; border-radius: 6px; width: 220px; }
      .error-msg { }
    </style>
  </head>
  <body>
    <input class="field" type="email" placeholder="you@example.com">
    <!-- add an error message paragraph below -->
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; padding: 24px; }
      .field { border: 2px solid #dc2626; padding: 8px; border-radius: 6px; width: 220px; }
      .error-msg { color: #dc2626; font-size: 14px; margin-top: 6px; }
    </style>
  </head>
  <body>
    <input class="field" type="email" placeholder="you@example.com">
    <p class="error-msg">Email is required</p>
  </body>
</html>`,
      hints: [
        { en: `Add <p class="error-msg">Email is required</p> right after the <input>.`, ar: `أضف <p class="error-msg">البريد الإلكتروني مطلوب</p> مباشرة بعد <input>.` },
        { en: `In .error-msg add: color: #dc2626;`, ar: `في .error-msg أضف: color: #dc2626;` },
      ],
      tests: [
        { name: { en: "An error message paragraph with text exists", ar: "توجد فقرة رسالة خطأ بنص" }, check: `(function(){ var el = document.querySelector(".error-msg"); return el && el.textContent.trim().length > 0; })()` },
        { name: { en: "Error message uses a red color as a bonus signal", ar: "رسالة الخطأ تستخدم لوناً أحمر كإشارة إضافية" }, check: `(function(){ var c = getComputedStyle(document.querySelector(".error-msg")).color.match(/\\d+/g); return c && parseInt(c[0]) > 150 && parseInt(c[1]) < 100 && parseInt(c[2]) < 100; })()` },
        { name: { en: "The field still has its red border too (color is now a second signal, not the only one)", ar: "الحقل لا يزال له حدّه الأحمر أيضاً (اللون الآن إشارة ثانية لا وحيدة)" }, check: `(function(){ var b = getComputedStyle(document.querySelector(".field")).borderTopColor; return b && b !== "rgb(0, 0, 0)"; })()` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the traffic-light dashboard fix 🔍

A well-documented pattern in enterprise software: early analytics dashboards commonly used a plain red/yellow/green "traffic light" to show project or system status — color as the *only* signal. Accessibility audits (and real complaints from colorblind engineers and managers) repeatedly flagged the same problem: a red-green colorblind user looking at a dot could not reliably tell "critical" from "healthy" at a glance, especially in quick scans of large tables.

The fix that spread industry-wide is exactly the principle from this lesson: keep the color, but add a shape and a label — a filled circle for "critical," a triangle for "warning," a check mark for "healthy" — plus a text status column. Now the dashboard works correctly whether or not the viewer can distinguish red from green, and as a side effect it also became easier to read for *everyone*, including on low-quality screens, printed reports, and screenshots dropped into black-and-white slide decks.

This is the curb-cut effect again, now applied to color specifically: designing for colorblind users produced a dashboard that was simply better for every single viewer.`,
        ar: `## دراسة حالة واقعية: إصلاح لوحة تحكم "الإشارة الضوئية" 🔍

نمط موثّق جيداً في برمجيات المؤسسات: لوحات التحليلات المبكرة استخدمت غالباً "إشارة ضوئية" بسيطة أحمر/أصفر/أخضر لعرض حالة مشروع أو نظام — اللون بوصفه الإشارة *الوحيدة*. تدقيقات الوصول (وشكاوى حقيقية من مهندسين ومديرين مصابين بعمى الألوان) رصدت مراراً نفس المشكلة: مستخدم مصاب بعمى الألوان الأحمر-الأخضر ينظر لنقطة لا يستطيع بموثوقية تمييز "حرِج" عن "سليم" بلمحة سريعة، خصوصاً في مسح سريع لجداول كبيرة.

الإصلاح الذي انتشر في الصناعة كلها هو بالضبط مبدأ هذا الدرس: أبقِ اللون، لكن أضف شكلاً وتسمية — دائرة ممتلئة لـ"حرِج"، مثلث لـ"تحذير"، علامة صح لـ"سليم" — بالإضافة لعمود حالة نصي. الآن تعمل اللوحة بشكل صحيح سواء استطاع المُشاهد تمييز الأحمر عن الأخضر أم لا، وكأثر جانبي أصبحت أيضاً أسهل قراءة للجميع، بما في ذلك على شاشات رديئة الجودة وتقارير مطبوعة ولقطات شاشة موضوعة في عروض تقديمية بالأبيض والأسود.

هذا أثر منحدر الرصيف مجدداً، مطبّقاً هذه المرة على اللون تحديداً: التصميم لمستخدمي عمى الألوان أنتج لوحة تحكم أفضل ببساطة لكل مُشاهد على الإطلاق.`,
      },
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
