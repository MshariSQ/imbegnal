import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "design-systems",
  title: { en: "Design Systems — Consistency at Scale", ar: "أنظمة التصميم — الاتساق على نطاق واسع" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What a design system is and why big products need one
- **Design tokens** and reusable components
- How design systems connect design and code
- You'll define design tokens with CSS variables`,
        ar: `## ماذا ستتعلم

- ما هو نظام التصميم ولماذا تحتاجه المنتجات الكبيرة
- **رموز التصميم (Design tokens)** والمكوّنات المعاد استخدامها
- كيف تربط أنظمة التصميم التصميم بالكود
- ستعرّف رموز تصميم بمتغيرات CSS`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A LEGO kit for your product 🧱

Imagine a big product with 50 screens designed by 5 people. Without coordination you'd get 12 slightly different blues, 8 button styles, and inconsistent spacing everywhere — it looks unprofessional and confuses users. A **design system** solves this: it's a single, shared library of **reusable components and rules** that everyone builds from — a LEGO kit for your product where every piece fits.

A design system has two layers:

**1. Design tokens** — the smallest decisions, named and stored in one place: the exact brand colors, the font sizes, the spacing scale, the border radii. Instead of "this blue is #2563EB" scattered across 50 files, you define \`color-primary\` *once*. Change it in one place and the whole product updates. (You've seen this idea everywhere now — CSS variables, Tailwind's scale, Figma components: define once, reuse.)

**2. Components** — reusable, pre-designed elements built from those tokens: the Button, the Card, the Input, the Modal — each with defined states (hover, disabled, error). A designer grabs the standard Button instead of drawing a new one; a developer uses the coded Button component. Same button, everywhere, forever consistent.

**Why it's powerful:**
- **Consistency** — every screen feels like one coherent product, because it's built from the same parts.
- **Speed** — assembling from ready components is *far* faster than designing each screen from scratch.
- **Collaboration** — designers and developers share one language. A "Primary Button" means the exact same thing in Figma and in code.
- **Easy updates** — rebrand? Change the tokens, and thousands of screens update at once.

Famous examples: Google's **Material Design**, IBM's **Carbon**, Shopify's **Polaris**. This very IMBEGNAL site has an informal one — consistent emerald accents, the same card style, one spacing rhythm.

**The big idea unifying the whole track:** *define once, reuse everywhere.* It's the same principle as functions, React components, Tailwind utilities, and Figma components — a design system applies it to your entire product's visual language. Master this, and you can build interfaces that are consistent, fast to produce, and easy to maintain — exactly what companies pay senior designers and frontend engineers to do.`,
        ar: `## طقم ليغو لمنتجك 🧱

تخيّل منتجاً كبيراً بـ 50 شاشة صمّمها 5 أشخاص. بلا تنسيق ستحصل على 12 درجة زرقاء مختلفة قليلاً، و8 أنماط أزرار، ومسافات غير متسقة في كل مكان — يبدو غير احترافي ويربك المستخدمين. **نظام التصميم** يحل هذا: مكتبة واحدة مشتركة من **المكوّنات والقواعد المعاد استخدامها** يبني منها الجميع — طقم ليغو لمنتجك حيث تتناسب كل قطعة.

لنظام التصميم طبقتان:

**1. رموز التصميم (Design tokens)** — أصغر القرارات، مسمّاة ومخزّنة في مكان واحد: ألوان العلامة بالضبط، أحجام الخطوط، مقياس المسافات، أنصاف أقطار الحواف. بدل "هذا الأزرق #2563EB" مبعثراً عبر 50 ملفاً، تعرّف \`color-primary\` *مرة*. غيّره في مكان واحد فيتحدث المنتج كله. (رأيت هذه الفكرة في كل مكان الآن — متغيرات CSS، مقياس Tailwind، مكوّنات Figma: عرّف مرة، أعد الاستخدام.)

**2. المكوّنات (Components)** — عناصر معاد استخدامها مصمّمة مسبقاً من تلك الرموز: الزر، البطاقة، الحقل، النافذة — كلٌّ بحالات محددة (تمرير، معطّل، خطأ). المصمّم يأخذ الزر القياسي بدل رسم جديد؛ والمطوّر يستخدم مكوّن الزر المبرمج. نفس الزر، في كل مكان، متسق للأبد.

**لماذا هو قوي:**
- **الاتساق** — كل شاشة تبدو منتجاً متماسكاً واحداً، لأنها مبنية من نفس الأجزاء.
- **السرعة** — التجميع من مكوّنات جاهزة أسرع *بكثير* من تصميم كل شاشة من الصفر.
- **التعاون** — المصمّمون والمطوّرون يتشاركون لغة واحدة. "الزر الأساسي" يعني الشيء نفسه بالضبط في Figma والكود.
- **التحديثات السهلة** — إعادة علامة؟ غيّر الرموز، فتتحدث آلاف الشاشات دفعة واحدة.

أمثلة شهيرة: **Material Design** من قوقل، و**Carbon** من IBM، و**Polaris** من Shopify. وموقع IMBEGNAL نفسه له واحد غير رسمي — لمسات زمردية متسقة، نفس نمط البطاقة، إيقاع مسافات واحد.

**الفكرة الكبرى التي توحّد المسار كله:** *عرّف مرة، أعد الاستخدام في كل مكان.* إنه نفس مبدأ الدوال ومكوّنات React وأدوات Tailwind ومكوّنات Figma — نظام التصميم يطبّقه على لغة منتجك البصرية كاملة. أتقن هذا فتبني واجهات متسقة، سريعة الإنتاج، وسهلة الصيانة — بالضبط ما تدفع الشركات لكبار المصمّمين ومهندسي الواجهات مقابله.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `Build design tokens with CSS variables. In \`:root\`, define three tokens, then the two buttons below will use them. Define:
1. \`--color-primary\` set to any green (e.g. \`#10b981\`)
2. \`--radius\` set to at least \`8px\`

Both \`.btn\` buttons already reference \`var(--color-primary)\` and \`var(--radius)\` — define the tokens so they take effect. (Change one token → both buttons update: that's the power.)`,
        ar: `ابنِ رموز تصميم بمتغيرات CSS. في \`:root\`، عرّف ثلاثة رموز، فيستخدمها الزرّان أدناه. عرّف:
1. \`--color-primary\` بأي أخضر (مثل \`#10b981\`)
2. \`--radius\` بما لا يقل عن \`8px\`

كلا زرّي \`.btn\` يشيران أصلاً إلى \`var(--color-primary)\` و\`var(--radius)\` — عرّف الرموز لتأخذ مفعولها. (غيّر رمزاً واحداً ← يتحدث الزرّان: تلك هي القوة.)`,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <style>
      :root {
        /* define --color-primary and --radius here */
      }
      body { font-family: sans-serif; padding: 24px; }
      .btn {
        background: var(--color-primary);
        border-radius: var(--radius);
        color: white; border: none; padding: 12px 20px;
        font-size: 15px; margin-right: 8px; cursor: pointer;
      }
    </style>
  </head>
  <body>
    <button class="btn">Save</button>
    <button class="btn">Continue</button>
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <head>
    <style>
      :root {
        --color-primary: #10b981;
        --radius: 10px;
      }
      body { font-family: sans-serif; padding: 24px; }
      .btn {
        background: var(--color-primary);
        border-radius: var(--radius);
        color: white; border: none; padding: 12px 20px;
        font-size: 15px; margin-right: 8px; cursor: pointer;
      }
    </style>
  </head>
  <body>
    <button class="btn">Save</button>
    <button class="btn">Continue</button>
  </body>
</html>`,
      hints: [
        { en: `Inside :root, write --color-primary: #10b981; and --radius: 10px;`, ar: `داخل :root، اكتب --color-primary: #10b981; و --radius: 10px;` },
        { en: `CSS variables are defined with -- and read with var(--name).`, ar: `متغيرات CSS تُعرّف بـ -- وتُقرأ بـ var(--name).` },
      ],
      tests: [
        { name: { en: "Buttons have a green background from the token", ar: "للأزرار خلفية خضراء من الرمز" }, check: `(function(){ var bg = getComputedStyle(document.querySelector(".btn")).backgroundColor; var m = bg.match(/\\d+/g); return m && parseInt(m[1]) > parseInt(m[0]) && parseInt(m[1]) > parseInt(m[2]); })()` },
        { name: { en: "Border-radius from token is ≥ 8px", ar: "نصف قطر الحافة من الرمز ≥ 8px" }, check: `parseFloat(getComputedStyle(document.querySelector(".btn")).borderTopLeftRadius) >= 8` },
        { name: { en: "Both buttons share the token (consistent)", ar: "الزرّان يتشاركان الرمز (متسق)" }, check: `getComputedStyle(document.querySelectorAll(".btn")[0]).backgroundColor === getComputedStyle(document.querySelectorAll(".btn")[1]).backgroundColor` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Component states: the part beginners skip 🧩

A beginner designs one version of a button: the happy, default look. A real design system designs the button's **entire life cycle** — every state it can be in:

- **Default** — the normal resting look.
- **Hover** — a subtle change (darker shade, slight lift) when a mouse pointer is over it, telling sighted mouse users "this is clickable."
- **Focus** — the visible ring/outline when reached by keyboard (you met this in the accessibility lesson) — non-negotiable for a real system.
- **Active/pressed** — a brief visual change the instant it's clicked, giving immediate feedback that the click registered.
- **Disabled** — greyed out and un-clickable, with a lower-emphasis look, so people don't waste time clicking something inactive.
- **Loading** — a spinner or pulsing state while waiting on a server response, so a click doesn't feel ignored.

Design systems like Material Design and Polaris document all of these for every component, not just the button. Skipping states is exactly how you get an app where a disabled button looks clickable, or a click gives no feedback and people click it five times, or keyboard users can't tell what's focused. **A component isn't "done" until its states are, too** — this is the difference between a design system that merely looks good in a static mockup and one that survives real, messy use.`,
        ar: `## حالات المكوّن: الجزء الذي يتخطّاه المبتدئون 🧩

يصمّم المبتدئ نسخة واحدة من الزر: المظهر الافتراضي السعيد. أما نظام التصميم الحقيقي فيصمّم **دورة حياة الزر كاملة** — كل حالة يمكن أن يكون فيها:

- **الافتراضي (Default)** — المظهر العادي في السكون.
- **التمرير (Hover)** — تغيير خفيف (درجة أغمق، ارتفاع طفيف) حين يمرّ مؤشر الفأرة فوقه، مخبراً مستخدمي الفأرة المبصرين "هذا قابل للنقر."
- **التركيز (Focus)** — الحلقة/الإطار المرئي عند الوصول إليه بلوحة المفاتيح (قابلته في درس إمكانية الوصول) — غير قابل للتفاوض في نظام حقيقي.
- **النشط/المضغوط (Active)** — تغيير بصري لحظي فور النقر، يمنح تغذية راجعة فورية بأن النقرة سُجّلت.
- **المعطّل (Disabled)** — رمادي وغير قابل للنقر، بمظهر أقل بروزاً، حتى لا يهدر الناس وقتهم بالنقر على شيء غير نشط.
- **التحميل (Loading)** — مؤشر دوّار أو حالة نابضة أثناء انتظار استجابة الخادم، حتى لا تشعر النقرة بالتجاهل.

أنظمة تصميم مثل Material Design وPolaris توثّق كل هذه لكل مكوّن، لا الزر فقط. تخطّي الحالات هو بالضبط كيف تحصل على تطبيق فيه زر معطّل يبدو قابلاً للنقر، أو نقرة بلا تغذية راجعة فينقر الناس خمس مرات، أو مستخدمو لوحة مفاتيح لا يعرفون ما هو مُركَّز عليه. **المكوّن لا يكون "جاهزاً" حتى تجهز حالاته أيضاً** — هذا الفرق بين نظام تصميم يبدو جيداً في نموذج ساكن فقط، وآخر يصمد أمام الاستخدام الحقيقي الفوضوي.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Try it yourself: audit a real app's system 🔍

Open any well-built app you use daily (Gmail, a banking app, this very site) and go hunting for its design system, piece by piece:

1. **Find 3 buttons** that look different (a primary action, a secondary/outline button, a destructive "delete" button in red). Notice how each communicates its importance through color alone — that's tokens at work.
2. **Click and hold** a button — do you see an active/pressed state? Tab to it with your keyboard — is there a visible focus ring?
3. **Find the spacing rhythm.** Look at the padding around cards or list items — does it feel like the same handful of measurements repeating (8px, 16px, 24px), or does it feel random? Consistent spacing is a token, even if you never see the number.
4. **Try to break consistency:** can you find one screen where a button or heading looks *slightly* off from the rest? Big products occasionally have these gaps too — spotting them is exactly the skill this lesson teaches.

This 10-minute audit habit — done on apps you admire — trains your eye to see the invisible system holding a good interface together, faster than any tutorial.`,
        ar: `## جرّب بنفسك: دقّق نظام تطبيق حقيقي 🔍

افتح أي تطبيق جيد البناء تستخدمه يومياً (Gmail، تطبيق بنكي، هذا الموقع نفسه) واذهب تصطاد نظام تصميمه، قطعة بقطعة:

1. **ابحث عن 3 أزرار** تبدو مختلفة (إجراء أساسي، زر ثانوي/محاط بخط، زر "حذف" مدمّر بالأحمر). لاحظ كيف يوصل كلٌّ أهميته بالون وحده — تلك هي الرموز تعمل.
2. **انقر واستمر بالضغط** على زر — هل ترى حالة نشط/مضغوط؟ انتقل إليه بلوحة المفاتيح — هل توجد حلقة تركيز مرئية؟
3. **ابحث عن إيقاع المسافات.** انظر للحشو حول البطاقات أو عناصر القوائم — هل يبدو نفس حفنة القياسات تتكرر (8px، 16px، 24px)، أم يبدو عشوائياً؟ المسافة المتسقة رمز، حتى لو لم ترَ الرقم أبداً.
4. **حاول كسر الاتساق:** هل تجد شاشة فيها زر أو عنوان يبدو *مختلفاً قليلاً* عن البقية؟ المنتجات الكبرى فيها أحياناً هذه الفجوات أيضاً — اكتشافها بالضبط المهارة التي يعلّمها هذا الدرس.

عادة التدقيق هذه لعشر دقائق — على تطبيقات تعجبك — تدرّب عينك على رؤية النظام الخفي الذي يُبقي واجهة جيدة متماسكة، أسرع من أي درس.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Google's Material Design 🔍

In the early 2010s, Google's products famously looked inconsistent — Gmail, Android, and Search each had their own visual language, built by different teams making independent decisions. In 2014, Google introduced **Material Design**: a single, comprehensive design system with shared components, a spacing/elevation model, motion rules, and color guidelines, applied across virtually all of Google's products and offered publicly for any developer to use.

The impact was twofold. Internally, it let far-flung teams building Android, Gmail, Docs, and dozens of other products all "speak the same visual language" without needing to invent their own button or card from scratch — exactly the speed and consistency benefit from this lesson, at the scale of one of the largest companies on Earth. Externally, Material Design became one of the most widely adopted open design systems in the industry, used by countless third-party apps that wanted a professional, cohesive look without building a system from zero.

Material Design also keeps evolving (it has gone through several major revisions since), which illustrates another benefit of tokens: because the whole system was built on named, shared values rather than one-off decisions, Google could evolve its entire visual identity in stages across every product, instead of manually re-skinning each app one at a time.`,
        ar: `## دراسة حالة واقعية: Material Design من قوقل 🔍

في أوائل 2010، بدت منتجات قوقل غير متسقة بشكل مشهور — Gmail وAndroid والبحث لكل منها لغة بصرية خاصة، بناها فرق مختلفة تتّخذ قرارات مستقلة. في 2014، قدّمت قوقل **Material Design**: نظام تصميم شامل واحد بمكوّنات مشتركة، ونموذج مسافات/ارتفاع، وقواعد حركة، وإرشادات ألوان، طُبِّق عبر كل منتجات قوقل تقريباً وأُتيح علناً لأي مطوّر ليستخدمه.

كان الأثر مزدوجاً. داخلياً، أتاح لفرق متباعدة تبني Android وGmail وDocs وعشرات المنتجات الأخرى أن "تتحدث نفس اللغة البصرية" دون الحاجة لاختراع زرها أو بطاقتها من الصفر — بالضبط فائدة السرعة والاتساق من هذا الدرس، على نطاق إحدى أكبر الشركات على الأرض. خارجياً، صار Material Design من أكثر أنظمة التصميم المفتوحة اعتماداً في الصناعة، تستخدمه تطبيقات لا حصر لها أرادت مظهراً احترافياً متماسكاً دون بناء نظام من الصفر.

يستمر Material Design أيضاً بالتطوّر (مرّ بعدة مراجعات كبرى منذ ذلك الحين)، ما يوضّح فائدة أخرى للرموز: لأن النظام كله بُني على قيم مسمّاة مشتركة لا قرارات فردية، استطاعت قوقل تطوير هويتها البصرية كاملة على مراحل عبر كل منتج، بدل إعادة تلبيس كل تطبيق يدوياً واحداً تلو الآخر.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is a design token?", ar: "ما هو رمز التصميم (design token)؟" },
          choices: [
            { en: "A named, reusable design decision (color, spacing, radius) stored once", ar: "قرار تصميم مسمّى معاد استخدامه (لون، مسافة، نصف قطر) مخزّن مرة" },
            { en: "A cryptocurrency", ar: "عملة رقمية" },
            { en: "A login password", ar: "كلمة مرور دخول" },
          ],
          answer: 0,
          explain: {
            en: "Tokens like color-primary are defined once and reused everywhere — change one place, the whole product updates.",
            ar: "الرموز مثل color-primary تُعرّف مرة وتُعاد في كل مكان — غيّر مكاناً واحداً فيتحدث المنتج كله.",
          },
        },
        {
          q: { en: "Why do large products need a design system?", ar: "لماذا تحتاج المنتجات الكبيرة نظام تصميم؟" },
          choices: [
            { en: "Consistency, speed, and shared language between design and code", ar: "الاتساق والسرعة ولغة مشتركة بين التصميم والكود" },
            { en: "To use more colors", ar: "لاستخدام ألوان أكثر" },
            { en: "To slow down development", ar: "لإبطاء التطوير" },
          ],
          answer: 0,
          explain: {
            en: "Reusable components + tokens keep 50 screens coherent, speed up work, and let designers and devs share one vocabulary.",
            ar: "المكوّنات + الرموز المعاد استخدامها تُبقي 50 شاشة متماسكة، تسرّع العمل، وتتيح للمصمّمين والمطوّرين لغة واحدة.",
          },
        },
        {
          q: { en: "What single principle unifies functions, React components, and design systems?", ar: "ما المبدأ الواحد الذي يوحّد الدوال ومكوّنات React وأنظمة التصميم؟" },
          choices: [
            { en: "Define once, reuse everywhere", ar: "عرّف مرة، أعد الاستخدام في كل مكان" },
            { en: "Copy and paste often", ar: "انسخ والصق كثيراً" },
            { en: "Always start from scratch", ar: "ابدأ دائماً من الصفر" },
          ],
          answer: 0,
          explain: {
            en: "It's the throughline of the whole platform: one definition, reused and updated in one place. Design systems apply it to visuals.",
            ar: "إنه الخيط الناظم للمنصة كلها: تعريف واحد، معاد ومحدّث في مكان واحد. أنظمة التصميم تطبّقه على المرئيات.",
          },
        },
        {
          q: { en: "Why must a component's disabled and focus states be designed, not just its default look?", ar: "لماذا يجب تصميم حالتَي المكوّن المعطّل والمُركَّز، لا مظهره الافتراضي فقط؟" },
          choices: [
            { en: "Skipping states causes real problems: unclear disabled buttons, invisible focus for keyboard users, no click feedback", ar: "تخطّي الحالات يسبب مشاكل حقيقية: أزرار معطّلة غير واضحة، تركيز غير مرئي لمستخدمي لوحة المفاتيح، بلا تغذية راجعة للنقر" },
            { en: "It's purely decorative and optional", ar: "إنه زخرفي بحت واختياري" },
            { en: "Only the hover state actually matters", ar: "فقط حالة التمرير هي المهمة فعلاً" },
          ],
          answer: 0,
          explain: {
            en: "A component isn't done until its whole lifecycle — hover, focus, active, disabled, loading — is designed and consistent.",
            ar: "المكوّن لا يكتمل حتى تُصمَّم دورة حياته كاملة — تمرير، تركيز، نشط، معطّل، تحميل — بشكل متسق.",
          },
        },
        {
          q: { en: "What made Google's Material Design so impactful?", ar: "ما الذي جعل Material Design من قوقل مؤثراً جداً؟" },
          choices: [
            { en: "It unified visually inconsistent products under one shared system, used internally and adopted industry-wide", ar: "وحّد منتجات غير متسقة بصرياً تحت نظام مشترك واحد، استُخدم داخلياً واعتُمد في الصناعة كلها" },
            { en: "It was the first design tool ever made", ar: "كان أول أداة تصميم على الإطلاق" },
            { en: "It replaced the need for developers", ar: "استغنى عن الحاجة للمطوّرين" },
          ],
          answer: 0,
          explain: {
            en: "Before it, Google's own products looked inconsistent across teams. Material Design gave them (and the industry) one shared visual language.",
            ar: "قبله، بدت منتجات قوقل نفسها غير متسقة عبر الفرق. Material Design منحها (والصناعة) لغة بصرية مشتركة واحدة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A design system is a shared library of reusable components + tokens
- Design tokens (color, spacing, radius) are defined once and reused
- Benefits: consistency, speed, collaboration, easy rebranding
- A component isn't done until all its states (hover, focus, disabled, loading) are designed too
- Material Design shows how one shared system can unify products at massive scale
- You built real design tokens with CSS variables

**Next:** Accessibility — making sure your beautiful, consistent designs work for *everyone*.`,
        ar: `## الخلاصة

- نظام التصميم مكتبة مشتركة من مكوّنات + رموز معاد استخدامها
- رموز التصميم (لون، مسافة، نصف قطر) تُعرّف مرة وتُعاد
- الفوائد: الاتساق، السرعة، التعاون، إعادة العلامة السهلة
- المكوّن لا يكتمل حتى تُصمَّم كل حالاته (تمرير، تركيز، معطّل، تحميل) أيضاً
- Material Design يُظهر كيف يوحّد نظام مشترك واحد منتجات على نطاق هائل
- بنيت رموز تصميم حقيقية بمتغيرات CSS

**التالي:** إمكانية الوصول — التأكد من أن تصاميمك الجميلة المتسقة تعمل لـ*الجميع*.`,
      },
    },
  ],
};
