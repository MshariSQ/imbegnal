import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "design-basics",
  title: { en: "Design Principles — Why Some Things Just Work", ar: "مبادئ التصميم — لماذا تنجح بعض الأشياء ببساطة" },
  estMinutes: 35,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- The core principles behind every good design
- **Hierarchy, contrast, alignment, whitespace**
- Why "good design is invisible"
- You'll fix a badly-designed card with CSS`,
        ar: `## ماذا ستتعلم

- المبادئ الجوهرية خلف كل تصميم جيد
- **التسلسل الهرمي، التباين، المحاذاة، المساحة البيضاء**
- لماذا "التصميم الجيد غير مرئي"
- ستُصلح بطاقة سيئة التصميم بـ CSS`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Good design is invisible 👁️

When a design is great, you don't notice it — you just find what you need effortlessly. You only notice design when it's *bad*: a confusing form, a button you can't find. **UX (User Experience) design** is making things work so smoothly they feel obvious. It's not about decoration; it's about clarity. A few principles do most of the work:

**1. Visual Hierarchy.** Your eye should instantly know what's most important. Big, bold, high-contrast = important; small, light = secondary. A page where *everything* shouts (all bold, all huge) is a page where nothing stands out. Guide the eye: title > subtitle > body > caption.

**2. Contrast.** Elements that are different should *look* clearly different. The most important button should pop against the background. Light-gray text on a white background may look elegant to you but is invisible to many users (this is also an accessibility issue — later lesson).

**3. Alignment.** Line things up. Invisible grid lines connecting elements make a layout feel calm and professional; random positions feel chaotic and amateur. When in doubt, align to a common edge.

**4. Whitespace (negative space).** The empty space *around* things. Beginners cram everything together to "use the space"; pros add breathing room. Whitespace isn't wasted — it groups related items, separates unrelated ones, and makes content readable. Apple's designs are famous for generous whitespace.

**5. Proximity.** Things that belong together should be close together; unrelated things should be apart. A label sitting right next to its input "belongs" to it; a caption far from its image looks orphaned.

Master these five and your interfaces immediately look more professional — no artistic talent required. Design is a *learnable skill*, mostly about applying principles consistently, not innate creativity.`,
        ar: `## التصميم الجيد غير مرئي 👁️

حين يكون التصميم رائعاً، لا تلاحظه — بل تجد ما تحتاجه بلا جهد. تلاحظ التصميم فقط حين يكون *سيئاً*: نموذج محيّر، زر لا تجده. **تصميم تجربة المستخدم (UX)** هو جعل الأشياء تعمل بسلاسة حتى تبدو بديهية. ليس عن الزخرفة؛ بل عن الوضوح. بضعة مبادئ تؤدي معظم العمل:

**1. التسلسل الهرمي البصري.** يجب أن تعرف عينك فوراً ما الأهم. كبير، عريض، عالي التباين = مهم؛ صغير، خفيف = ثانوي. صفحة يصرخ فيها *كل شيء* (كله عريض، كله ضخم) هي صفحة لا يبرز فيها شيء. وجّه العين: عنوان > عنوان فرعي > نص > تعليق.

**2. التباين.** العناصر المختلفة يجب أن *تبدو* مختلفة بوضوح. الزر الأهم يجب أن يبرز عن الخلفية. نص رمادي فاتح على خلفية بيضاء قد يبدو أنيقاً لك لكنه غير مرئي لكثير من المستخدمين (وهذه أيضاً مسألة وصول — درس لاحق).

**3. المحاذاة.** نظّم الأشياء في خط. خطوط شبكة خفية تربط العناصر تجعل التخطيط هادئاً واحترافياً؛ والمواضع العشوائية تبدو فوضوية وهاوية. عند الشك، حاذِ إلى حافة مشتركة.

**4. المساحة البيضاء (الفراغ).** المساحة الفارغة *حول* الأشياء. المبتدئون يحشرون كل شيء "لاستغلال المساحة"؛ والمحترفون يضيفون مساحة تنفّس. المساحة البيضاء ليست مهدرة — تجمّع العناصر المترابطة، تفصل غير المترابطة، وتجعل المحتوى مقروءاً. تصاميم Apple شهيرة بمساحتها البيضاء السخية.

**5. التقارب.** ما ينتمي معاً يجب أن يكون قريباً؛ وغير المترابط بعيداً. تسمية بجوار حقلها "تنتمي" إليه؛ وتعليق بعيد عن صورته يبدو يتيماً.

أتقن هذه الخمسة فتبدو واجهاتك احترافية فوراً — بلا موهبة فنية. التصميم *مهارة قابلة للتعلّم*، معظمها تطبيق المبادئ باتساق، لا إبداع فطري.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `Apply hierarchy and whitespace. The card below has no visual hierarchy — everything is the same size and cramped. In the \`<style>\`, make:
1. \`.title\` bigger and bold — \`font-size\` at least \`24px\` and \`font-weight: bold\`
2. \`.card\` have breathing room — \`padding\` at least \`24px\``,
        ar: `طبّق التسلسل الهرمي والمساحة البيضاء. البطاقة أدناه بلا تسلسل بصري — كل شيء بنفس الحجم ومحشور. في \`<style>\`، اجعل:
1. \`.title\` أكبر وعريضاً — \`font-size\` لا يقل عن \`24px\` و\`font-weight: bold\`
2. \`.card\` لها مساحة تنفّس — \`padding\` لا يقل عن \`24px\``,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; background: #f0f4f8; }
      .card { background: white; border-radius: 12px; }
      .title { }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="title">Premium Plan</div>
      <div class="price">$9/month</div>
      <div class="desc">Everything you need to get started.</div>
    </div>
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; background: #f0f4f8; }
      .card { background: white; border-radius: 12px; padding: 28px; }
      .title { font-size: 26px; font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="title">Premium Plan</div>
      <div class="price">$9/month</div>
      <div class="desc">Everything you need to get started.</div>
    </div>
  </body>
</html>`,
      hints: [
        { en: `In .title add: font-size: 26px; font-weight: bold;`, ar: `في .title أضف: font-size: 26px; font-weight: bold;` },
        { en: `In .card add: padding: 28px; to give it breathing room.`, ar: `في .card أضف: padding: 28px; لمنحها مساحة تنفّس.` },
      ],
      tests: [
        { name: { en: "Title font-size ≥ 24px", ar: "حجم خط العنوان ≥ 24px" }, check: `parseFloat(getComputedStyle(document.querySelector(".title")).fontSize) >= 24` },
        { name: { en: "Title is bold", ar: "العنوان عريض" }, check: `(function(){ var w = getComputedStyle(document.querySelector(".title")).fontWeight; return w === "bold" || parseInt(w) >= 700; })()` },
        { name: { en: "Card padding ≥ 24px", ar: "مساحة البطاقة الداخلية ≥ 24px" }, check: `parseFloat(getComputedStyle(document.querySelector(".card")).paddingTop) >= 24` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Gestalt principles — how the eye groups things 🧩

There's a deeper reason those five principles work: the human brain doesn't see individual elements one by one — it automatically groups them into patterns. This is **Gestalt psychology** ("gestalt" = "shape/form" in German), and a handful of its rules explain almost every layout decision you'll ever make:

**1. Similarity.** Elements that look alike (same color, shape, or size) are perceived as related, even with no lines or boxes around them. Three blue buttons scattered across a page still read as "the same kind of thing" just because they share a color.

**2. Proximity revisited.** You already met this: closeness implies grouping. Gestalt explains *why* — the brain assumes nearby things share a purpose before it even reads the content.

**3. Common region.** Put a border or background behind a group of items (a card, a panel) and the brain treats everything inside as one unit — even more strongly than proximity alone. This is why "cards" are everywhere in modern UI: a shared background is the fastest way to say "these things belong together."

**4. Continuity.** The eye follows the smoothest path. Elements arranged along a line or curve are read as a connected sequence — this is why a horizontal row of steps ("1 → 2 → 3") feels like a process, not three random boxes.

**5. Closure.** The brain fills in missing gaps to perceive a complete shape. A logo made of a few disconnected arcs still reads as a circle. This lets designers imply shapes with less visual weight than drawing them fully.

Why this matters practically: when a layout "feels off" but you can't say why, it's often a Gestalt violation — items that *should* look related (same action) don't share a visual trait, or unrelated items are accidentally grouped by shared color or closeness. Naming the principle lets you diagnose and fix the actual cause instead of randomly nudging pixels.`,
        ar: `## مبادئ الجشطالت — كيف تُجمِّع العين الأشياء 🧩

هناك سبب أعمق تعمل لأجله تلك المبادئ الخمسة: الدماغ البشري لا يرى العناصر منفردة واحداً تلو الآخر — بل يجمّعها تلقائياً في أنماط. هذا هو **علم نفس الجشطالت (Gestalt)** ("جشطالت" تعني "شكل/صيغة" بالألمانية)، وقلة من قواعده تفسّر تقريباً كل قرار تخطيط ستتخذه:

**1. التشابه (Similarity).** العناصر المتشابهة (نفس اللون أو الشكل أو الحجم) تُدرَك كمترابطة، حتى بلا خطوط أو صناديق حولها. ثلاثة أزرار زرقاء مبعثرة في الصفحة تُقرأ كـ"نفس النوع من الأشياء" لمجرد تشاركها اللون.

**2. التقارب مجدداً.** قابلت هذا سابقاً: القرب يعني التجميع. الجشطالت يفسّر *لماذا* — الدماغ يفترض أن الأشياء المتقاربة تتشارك غرضاً حتى قبل أن يقرأ المحتوى.

**3. المنطقة المشتركة (Common region).** ضع حدوداً أو خلفية خلف مجموعة عناصر (بطاقة، لوحة) فيعامل الدماغ كل ما بداخلها كوحدة واحدة — بقوة أكبر حتى من التقارب وحده. لهذا "البطاقات" منتشرة في كل واجهة حديثة: خلفية مشتركة أسرع طريقة لقول "هذه الأشياء تنتمي معاً".

**4. الاستمرارية (Continuity).** العين تتبع المسار الأنعم. العناصر المرتّبة على خط أو منحنى تُقرأ كتسلسل مترابط — لهذا صف أفقي من الخطوات ("1 ← 2 ← 3") يبدو كعملية، لا ثلاثة صناديق عشوائية.

**5. الإغلاق (Closure).** الدماغ يملأ الفجوات الناقصة لإدراك شكل كامل. شعار مكوّن من بضع أقواس منفصلة لا يزال يُقرأ كدائرة. هذا يتيح للمصمّمين الإيحاء بأشكال بوزن بصري أقل من رسمها كاملة.

لماذا يهم هذا عملياً: حين يبدو تخطيط "غير صحيح" لكنك لا تعرف لماذا، غالباً هو انتهاك لمبدأ جشطالت — عناصر *يجب* أن تبدو مترابطة (نفس الإجراء) لا تتشارك سمة بصرية، أو عناصر غير مترابطة تجمّعت عرَضاً بلون أو قرب مشترك. تسمية المبدأ تتيح لك تشخيص السبب الحقيقي وإصلاحه بدل نقل البكسلات عشوائياً.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `Apply common region and similarity. The three items below are meant to be a single related group (a settings panel), but nothing visually groups them, and the "Danger" action doesn't stand out from the safe ones. In the \`<style>\`:
1. Give \`.panel\` a visible background (any color other than \`white\`/\`transparent\`) and \`border-radius\` of at least \`8px\` — this creates **common region** so the three rows read as one group
2. Give \`.danger\` a distinct \`color\` of \`red\` (or \`#dc2626\`) so it visually stands out as a different *kind* of action (Gestalt **similarity** — it should NOT match the other two rows)`,
        ar: `طبّق مبدأي المنطقة المشتركة والتشابه. العناصر الثلاثة أدناه يُفترض أنها مجموعة واحدة مترابطة (لوحة إعدادات)، لكن لا شيء يجمّعها بصرياً، وإجراء "الخطر" لا يبرز عن الآمنَين. في \`<style>\`:
1. أعطِ \`.panel\` خلفية مرئية (أي لون غير \`white\`/\`transparent\`) و\`border-radius\` لا يقل عن \`8px\` — هذا يخلق **منطقة مشتركة** فتُقرأ الصفوف الثلاثة كمجموعة واحدة
2. أعطِ \`.danger\` لون \`color\` مميّزاً \`red\` (أو \`#dc2626\`) ليبرز بصرياً كنوع *مختلف* من الإجراءات (**تشابه** الجشطالت — يجب ألّا يطابق الصفّين الآخرين)`,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; padding: 24px; background: #fff; }
      .panel { padding: 16px; }
      .row { padding: 10px 0; }
      .danger { }
    </style>
  </head>
  <body>
    <div class="panel">
      <div class="row">Edit profile</div>
      <div class="row">Change password</div>
      <div class="row danger">Delete account</div>
    </div>
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; padding: 24px; background: #fff; }
      .panel { padding: 16px; background: #f0f4f8; border-radius: 12px; }
      .row { padding: 10px 0; }
      .danger { color: #dc2626; }
    </style>
  </head>
  <body>
    <div class="panel">
      <div class="row">Edit profile</div>
      <div class="row">Change password</div>
      <div class="row danger">Delete account</div>
    </div>
  </body>
</html>`,
      hints: [
        { en: `In .panel add: background: #f0f4f8; border-radius: 12px;`, ar: `في .panel أضف: background: #f0f4f8; border-radius: 12px;` },
        { en: `In .danger add: color: #dc2626; (or the keyword red).`, ar: `في .danger أضف: color: #dc2626; (أو الكلمة red).` },
      ],
      tests: [
        { name: { en: "Panel has a non-white background", ar: "للوحة خلفية غير بيضاء" }, check: `(function(){ var bg = getComputedStyle(document.querySelector(".panel")).backgroundColor; return bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "rgb(255, 255, 255)"; })()` },
        { name: { en: "Panel has rounded corners ≥ 8px", ar: "للوحة زوايا مستديرة ≥ 8px" }, check: `parseFloat(getComputedStyle(document.querySelector(".panel")).borderTopLeftRadius) >= 8` },
        { name: { en: "Danger row is red, distinct from the rest", ar: "صف الخطر أحمر ومميّز عن البقية" }, check: `(function(){ var c = getComputedStyle(document.querySelector(".danger")).color.match(/\\d+/g); return c && parseInt(c[0]) > 150 && parseInt(c[1]) < 100 && parseInt(c[2]) < 100; })()` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Google's 41 shades of blue 🔍

In 2009, Google's design team wanted to pick one "best" blue for its links. Instead of a designer choosing by eye, Google ran an **A/B test**: they showed different, nearly identical shades of blue to slices of live search traffic and measured which shade got more clicks.

The winning shade reportedly earned Google an estimated **$200 million a year** in extra ad revenue — from a barely perceptible color change. The story became famous (and controversial) inside the design world: designer Douglas Bowman publicly resigned partly over this level of data-driven micro-optimization, arguing it crowded out design judgment and slowed everything down.

Both sides have a point, and that's exactly the lesson. Data can reveal real, high-value details (contrast and color genuinely change behavior at scale). But not every decision needs 41 variants tested — for most teams, applying the principles in this lesson well (hierarchy, contrast, alignment, whitespace, proximity, and Gestalt grouping) gets you 95% of the way, and real user research (a later lesson) tells you when it's actually worth testing further.`,
        ar: `## دراسة حالة واقعية: 41 درجة من الأزرق لدى Google 🔍

في 2009، أراد فريق تصميم Google اختيار درجة زرقاء "مثالية" واحدة لروابطه. بدل أن يختار مصمّم بعينه، أجرت Google **اختبار A/B**: عرضت درجات زرقاء مختلفة شبه متطابقة على شرائح من زوّار البحث الحقيقيين وقاست أيها يجلب نقرات أكثر.

الدرجة الفائزة جلبت لـGoogle، بحسب التقارير، ما يُقدَّر بـ**200 مليون دولار سنوياً** إضافية من عائدات الإعلانات — من تغيير لوني بالكاد يُلاحَظ. أصبحت القصة شهيرة (ومثيرة للجدل) داخل عالم التصميم: استقال المصمّم دوغلاس بومان علناً، جزئياً بسبب هذا المستوى من التحسين الجزئي القائم على البيانات، مجادلاً بأنه يزاحم الحكم التصميمي ويُبطئ كل شيء.

كلا الجانبين لديه وجهة نظر، وهذا بالضبط الدرس. البيانات يمكن أن تكشف تفاصيل حقيقية عالية القيمة (التباين واللون يغيّران السلوك فعلاً على نطاق واسع). لكن ليس كل قرار يحتاج اختبار 41 نسخة — لمعظم الفرق، تطبيق مبادئ هذا الدرس جيداً (التسلسل، التباين، المحاذاة، المساحة البيضاء، التقارب، وتجميع الجشطالت) يوصلك لـ95% من الطريق، والبحث الحقيقي مع المستخدمين (درس لاحق) يخبرك متى يستحق الأمر اختباراً أعمق.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is visual hierarchy?", ar: "ما هو التسلسل الهرمي البصري؟" },
          choices: [
            { en: "Arranging elements so the eye sees the most important first", ar: "ترتيب العناصر لترى العين الأهم أولاً" },
            { en: "Making everything the same size", ar: "جعل كل شيء بنفس الحجم" },
            { en: "Using many colors", ar: "استخدام ألوان كثيرة" },
          ],
          answer: 0,
          explain: {
            en: "Size, weight, and contrast guide the eye: title > subtitle > body. If everything shouts, nothing stands out.",
            ar: "الحجم والوزن والتباين توجّه العين: عنوان > عنوان فرعي > نص. إن صرخ كل شيء، لا يبرز شيء.",
          },
        },
        {
          q: { en: "Whitespace (empty space) is…", ar: "المساحة البيضاء (الفراغ) هي…" },
          choices: [
            { en: "A tool that groups, separates, and improves readability", ar: "أداة تجمّع وتفصل وتحسّن القراءة" },
            { en: "Wasted space to always fill", ar: "مساحة مهدرة يجب ملؤها دائماً" },
            { en: "Only for printing", ar: "للطباعة فقط" },
          ],
          answer: 0,
          explain: {
            en: "Whitespace isn't emptiness to eliminate — it creates breathing room and structure. Pros use it generously.",
            ar: "المساحة البيضاء ليست فراغاً يُلغى — بل تخلق مساحة تنفّس وبنية. المحترفون يستخدمونها بسخاء.",
          },
        },
        {
          q: { en: "The principle of 'proximity' says…", ar: "مبدأ 'التقارب' يقول…" },
          choices: [
            { en: "Related items should be close; unrelated ones apart", ar: "العناصر المترابطة قريبة؛ وغير المترابطة بعيدة" },
            { en: "Everything should touch", ar: "كل شيء يجب أن يتلامس" },
            { en: "Spread everything evenly", ar: "وزّع كل شيء بالتساوي" },
          ],
          answer: 0,
          explain: {
            en: "Grouping by closeness signals relationship: a label next to its field belongs to it; distance implies separation.",
            ar: "التجميع بالقرب يشير للعلاقة: تسمية بجوار حقلها تنتمي إليه؛ والبُعد يعني الانفصال.",
          },
        },
        {
          q: { en: "Which Gestalt principle explains why a card's background makes its contents feel like one group?", ar: "أي مبدأ جشطالت يفسّر لماذا تجعل خلفية البطاقة محتواها يبدو مجموعة واحدة؟" },
          choices: [
            { en: "Common region", ar: "المنطقة المشتركة" },
            { en: "Closure", ar: "الإغلاق" },
            { en: "Continuity", ar: "الاستمرارية" },
          ],
          answer: 0,
          explain: {
            en: "A shared border or background (common region) groups items even more strongly than proximity alone — it's why cards are everywhere in UI.",
            ar: "الحدود أو الخلفية المشتركة (المنطقة المشتركة) تجمّع العناصر بقوة أكبر من التقارب وحده — لهذا البطاقات منتشرة في كل واجهة.",
          },
        },
        {
          q: { en: "Why did three same-colored but scattered buttons still read as 'the same kind of thing'?", ar: "لماذا تُقرأ ثلاثة أزرار بنفس اللون لكن مبعثرة كـ'نفس النوع من الأشياء'؟" },
          choices: [
            { en: "Similarity — shared visual traits imply a shared purpose, regardless of position", ar: "التشابه — السمات البصرية المشتركة تعني غرضاً مشتركاً، بغضّ النظر عن الموضع" },
            { en: "They were placed inside the same div", ar: "وُضعت داخل نفس الـ div" },
            { en: "Coincidence — there's no principle behind it", ar: "صدفة — لا مبدأ خلف ذلك" },
          ],
          answer: 0,
          explain: {
            en: "Gestalt similarity means the brain groups by shared color, shape, or size, even with no lines or proximity connecting them.",
            ar: "تشابه الجشطالت يعني أن الدماغ يجمّع بحسب اللون أو الشكل أو الحجم المشترك، حتى بلا خطوط أو تقارب يربطها.",
          },
        },
        {
          q: { en: "What's the balanced takeaway from Google's '41 shades of blue' story?", ar: "ما الخلاصة المتوازنة من قصة '41 درجة من الأزرق' لدى Google؟" },
          choices: [
            { en: "Data-driven testing can reveal real value, but most decisions are well served by solid design principles without exhaustive A/B testing", ar: "الاختبار القائم على البيانات قد يكشف قيمة حقيقية، لكن معظم القرارات تُخدم جيداً بمبادئ تصميم متينة دون اختبار A/B شامل" },
            { en: "Every color decision needs 41 tested variants", ar: "كل قرار لون يحتاج 41 نسخة مُختبَرة" },
            { en: "A/B testing is always a waste of time", ar: "اختبار A/B مضيعة للوقت دائماً" },
          ],
          answer: 0,
          explain: {
            en: "The test found real value, but the resignation it triggered shows the cost of over-relying on micro-testing instead of design judgment.",
            ar: "الاختبار وجد قيمة حقيقية، لكن الاستقالة التي سببها تُظهر تكلفة الاعتماد المفرط على الاختبار الجزئي بدل الحكم التصميمي.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Good UX is invisible — clarity over decoration
- Five principles: hierarchy, contrast, alignment, whitespace, proximity
- Gestalt principles (similarity, common region, continuity, closure) explain *why* grouping works
- Design is a learnable skill, not innate talent
- You added hierarchy and whitespace to a real card, then grouped a settings panel with common region and similarity
- Google's "41 shades of blue" shows both the power and the cost of over-testing small decisions

**Next:** Typography & Color — the two elements that most shape how a design feels.`,
        ar: `## الخلاصة

- UX الجيد غير مرئي — الوضوح قبل الزخرفة
- خمسة مبادئ: التسلسل، التباين، المحاذاة، المساحة البيضاء، التقارب
- مبادئ الجشطالت (التشابه، المنطقة المشتركة، الاستمرارية، الإغلاق) تفسّر *لماذا* ينجح التجميع
- التصميم مهارة قابلة للتعلّم، لا موهبة فطرية
- أضفت التسلسل والمساحة البيضاء لبطاقة حقيقية، ثم جمّعت لوحة إعدادات بالمنطقة المشتركة والتشابه
- قصة "41 درجة من الأزرق" لدى Google تُظهر قوة وتكلفة الإفراط في اختبار القرارات الصغيرة معاً

**التالي:** الطباعة والألوان — العنصران الأكثر تشكيلاً لإحساس التصميم.`,
      },
    },
  ],
};
