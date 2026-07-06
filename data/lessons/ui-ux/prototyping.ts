import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "prototyping",
  title: { en: "Prototyping — Test Before You Build", ar: "النماذج الأولية — اختبر قبل أن تبني" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What a prototype is and why it's powerful
- Clickable prototypes in Figma
- Testing interactions before writing code
- The iterate-fast design loop`,
        ar: `## ماذا ستتعلم

- ما هو النموذج الأولي ولماذا هو قوي
- النماذج القابلة للنقر في Figma
- اختبار التفاعلات قبل كتابة الكود
- حلقة التصميم سريعة التكرار`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A fake that feels real 🎭

A **prototype** is a *simulation* of your product that a person can click through — it looks and behaves like the real app, but there's no code behind it. It's a movie set: the storefront looks real from the front, but it's held up by sticks. That fakery is exactly the point — it lets you **test the experience before spending weeks building it for real**.

In Figma, you turn static screens into a prototype by **linking them**: "when the user taps this *Login* button, go to the *Dashboard* screen." Chain these links across your screens and you get something that *feels* like a working app on a phone or in a browser — you can tap through the whole flow. You can even add transitions (slide, fade) to mimic real motion.

**Why prototypes are so valuable:**
- **Test real interactions** — a static wireframe can't reveal that your checkout flow is confusing; a clickable prototype can. Users *do* the task and you watch where they get stuck (usability testing from the research lesson — now with something clickable).
- **Catch problems for pennies** — fixing a flawed flow in Figma is dragging arrows around. Fixing it after developers built it costs weeks. Prototyping moves discovery to the cheapest possible moment.
- **Communicate clearly** — a clickable demo shows your team, boss, or client exactly what you mean far better than words or static images. It gets everyone aligned before a line of code is written.

**The design loop this enables:**
\`\`\`
Sketch idea → prototype it → test with users → learn → refine → test again → ...
\`\`\`

This fast, cheap loop is the heart of good UX design. Each turn of the loop costs little but improves the design a lot, so you *iterate your way* to something genuinely good — instead of guessing once, building it, and hoping. The best designers aren't the ones who get it perfect on the first try; they're the ones who iterate quickly with prototypes and real feedback.

Only after the prototype proves the experience works do you hand it to developers to build for real — now with confidence that you're building the *right* thing.`,
        ar: `## زيف يبدو حقيقياً 🎭

**النموذج الأولي (prototype)** *محاكاة* لمنتجك يستطيع شخص النقر خلالها — يبدو ويتصرّف كالتطبيق الحقيقي، لكن لا كود خلفه. إنه موقع تصوير سينمائي: الواجهة تبدو حقيقية من الأمام، لكنها مسنودة بعصيّ. ذلك الزيف هو الغاية بالضبط — يتيح لك **اختبار التجربة قبل إنفاق أسابيع في بنائها فعلاً**.

في Figma، تحوّل الشاشات الساكنة إلى نموذج بـ**ربطها**: "حين ينقر المستخدم زر *تسجيل الدخول* هذا، اذهب لشاشة *لوحة التحكم*." سلسِل هذه الروابط عبر شاشاتك فتحصل على شيء *يبدو* كتطبيق عامل على هاتف أو في متصفح — تنقر خلال التدفق كله. ويمكنك إضافة انتقالات (انزلاق، تلاشٍ) لمحاكاة الحركة الحقيقية.

**لماذا النماذج قيّمة جداً:**
- **اختبر التفاعلات الحقيقية** — إطار سلكي ساكن لا يكشف أن تدفق الدفع محيّر؛ ونموذج قابل للنقر يكشفه. المستخدمون *ينفّذون* المهمة وتراقب أين يعلقون (اختبار الاستخدام من درس البحث — الآن بشيء قابل للنقر).
- **امسك المشاكل بقروش** — إصلاح تدفق معيب في Figma هو سحب أسهم. وإصلاحه بعد أن بناه المطوّرون يكلّف أسابيع. النماذج تنقل الاكتشاف لأرخص لحظة ممكنة.
- **تواصل بوضوح** — عرض قابل للنقر يُري فريقك أو مديرك أو عميلك ما تعنيه بالضبط أفضل بكثير من الكلمات أو الصور الساكنة. يوائم الجميع قبل كتابة سطر كود.

**حلقة التصميم التي يتيحها هذا:**
\`\`\`
اسكتش فكرة → نمذجها → اختبر مع مستخدمين → تعلّم → صقل → اختبر مجدداً → ...
\`\`\`

هذه الحلقة السريعة الرخيصة قلب تصميم UX الجيد. كل دورة تكلّف قليلاً لكنها تحسّن التصميم كثيراً، فتـ*كرّر طريقك* إلى شيء جيد فعلاً — بدل التخمين مرة وبنائه والأمل. أفضل المصمّمين ليسوا من يتقنونه من أول محاولة؛ بل من يكرّرون بسرعة بالنماذج والملاحظات الحقيقية.

فقط بعد أن يثبت النموذج أن التجربة تعمل تسلّمه للمطوّرين ليبنوه فعلاً — الآن بثقة أنك تبني الشيء *الصحيح*.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Matching prototype fidelity to the question 🎚️

Not every prototype needs to be a polished, animated Figma flow. Matching the prototype's **fidelity** (how real/detailed it looks and behaves) to the stage of your question saves huge amounts of time:

- **Paper prototyping.** Literally sketch screens on paper, cut out a "menu" strip, and have a teammate act as "the computer" — swapping papers as a test user "taps" things. It sounds silly, but it can be built in minutes and is perfect for the earliest question: "does this flow even make sense?" You can run a paper test before opening any software at all.
- **Low-fidelity clickable.** Grey-box wireframes linked together in Figma — good for testing structure and flow (can people find the right screen?) without the distraction of color and copy.
- **High-fidelity clickable.** Polished screens with real colors, fonts, and content, closely mimicking the final product — good for testing details (is this button noticeable? is this copy clear?) once the flow itself is already validated.
- **The Wizard of Oz technique.** Make something *feel* automated while a human secretly does the work behind the curtain — e.g. testing a chatbot idea by having a real person type the "bot's" replies manually. It validates whether people even want the feature, before anyone builds the real automation.

**The rule of thumb:** the earlier and bigger the question, the rougher the prototype should be. Testing "should this feature exist at all?" with a beautifully polished mockup is a waste — a paper sketch answers it just as well, for a fraction of the effort. Save high-fidelity prototypes for late-stage detail questions, once you already know the big structural bets are right.`,
        ar: `## مطابقة دقة النموذج للسؤال 🎚️

ليس كل نموذج يحتاج أن يكون تدفق Figma مصقولاً متحركاً. مطابقة **دقة** النموذج (كم يبدو ويتصرّف واقعياً) مع مرحلة سؤالك توفّر وقتاً هائلاً:

- **النموذج الورقي.** ارسم الشاشات حرفياً على ورق، اقصص شريط "قائمة،" واجعل زميلاً يمثّل "الحاسوب" — يستبدل الأوراق بينما مستخدم اختبار "ينقر" أشياء. يبدو سخيفاً، لكن يمكن بناؤه بدقائق ومثالي لأبكر سؤال: "هل هذا التدفق منطقي أصلاً؟" يمكنك تشغيل اختبار ورقي قبل فتح أي برنامج إطلاقاً.
- **قابل للنقر منخفض الدقة.** إطارات سلكية رمادية مرتبطة في Figma — جيد لاختبار البنية والتدفق (هل يجد الناس الشاشة الصحيحة؟) دون تشتيت اللون والنص.
- **قابل للنقر عالي الدقة.** شاشات مصقولة بألوان وخطوط ومحتوى حقيقي، تحاكي المنتج النهائي عن قرب — جيد لاختبار التفاصيل (هل هذا الزر ملحوظ؟ هل هذا النص واضح؟) بمجرد التحقق من التدفق نفسه.
- **تقنية ساحر أوز (Wizard of Oz).** اجعل شيئاً *يبدو* آلياً بينما إنسان يقوم بالعمل سرّاً خلف الستار — مثلاً اختبار فكرة روبوت محادثة بجعل شخص حقيقي يكتب ردود "الروبوت" يدوياً. يتحقّق مما إن كان الناس يريدون الميزة أصلاً، قبل أن يبني أحد الأتمتة الحقيقية.

**القاعدة العامة:** كلما كان السؤال أبكر وأكبر، كلما وجب أن يكون النموذج أخشن. اختبار "هل يجب أن توجد هذه الميزة أصلاً؟" بنموذج مصقول جميل مضيعة — رسم ورقي يجيبه بنفس الجودة، بجزء يسير من الجهد. احتفظ بالنماذج عالية الدقة لأسئلة التفاصيل المتأخرة، بمجرد أن تعرف أن الرهانات البنيوية الكبرى صحيحة.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Try it yourself: a 10-minute paper prototype 📝

You don't need Figma or any software for this — grab a pen and paper (or a notes app) right now:

1. Pick one small flow you use often (e.g. "add an item to a cart and check out").
2. Sketch **3 screens** as rough boxes: labels for buttons, X's for images, lines for text — no need to draw well.
3. Number the taps: on screen 1, circle the button someone would tap, and draw an arrow to which screen it leads to.
4. Hand it to a friend or family member (or just imagine a first-time user) and ask them to "tap" through it with a finger while you narrate "screen changes" — watch where they hesitate or point to the wrong spot.

If you got confused feedback or they paused at some step, you just found a structural problem for the cost of a napkin sketch — the exact value this lesson is about. That's the whole prototyping mindset in miniature.`,
        ar: `## جرّب بنفسك: نموذج ورقي في 10 دقائق 📝

لا تحتاج Figma أو أي برنامج لهذا — خذ قلماً وورقة (أو تطبيق ملاحظات) الآن:

1. اختر تدفقاً صغيراً واحداً تستخدمه كثيراً (مثلاً "أضف عنصراً للسلة وأتمم الدفع").
2. ارسم **3 شاشات** كصناديق خام: تسميات للأزرار، Xإشارات للصور، خطوط للنص — لا حاجة للرسم الجيد.
3. رقّم النقرات: على الشاشة 1، ضع دائرة حول الزر الذي سينقره أحدهم، وارسم سهماً لأي شاشة يؤدي إليها.
4. أعطها لصديق أو أحد العائلة (أو تخيّل مستخدماً لأول مرة) واطلب منه "النقر" خلالها بإصبعه بينما تسرد "تغييرات الشاشة" — راقب أين يتردد أو يشير للمكان الخطأ.

إن حصلت على ملاحظات محيّرة أو توقّف عند خطوة ما، فقد وجدت للتو مشكلة بنيوية بتكلفة رسم على منديل — بالضبط القيمة التي يدور حولها هذا الدرس. تلك كامل عقلية النمذجة في نسخة مصغّرة.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the "Wizard of Oz" search engine test 🔍

A widely told story in product and UX circles describes how early search and AI-assistant style features were sometimes validated before the real technology existed to power them: instead of building a complex automated system upfront, a team would have a person behind the scenes manually reading incoming queries and typing back responses, while the test user believed they were interacting with a fully automatic system. This general technique became known as the "Wizard of Oz" method, named after the movie where a seemingly powerful wizard turns out to be an ordinary man operating machinery behind a curtain.

The insight behind it is exactly what this lesson teaches: before investing months of engineering into an automated feature, teams can validate the much cheaper, much more important question — do people actually want this, and does the interaction feel useful — with a human quietly standing in for the not-yet-built technology. If users love talking to the "smart" assistant, that's the green light to go build the real automation. If they don't, the team just saved months of engineering on a feature nobody wanted, for the cost of a person typing replies for an afternoon.

This is prototyping fidelity taken to its logical extreme: sometimes the cheapest, fastest prototype isn't a screen at all — it's a human pretending to be the software, precisely so you don't have to build the software to learn if the idea works.`,
        ar: `## دراسة حالة واقعية: اختبار محرّك بحث بـ"ساحر أوز" 🔍

قصة تُروى كثيراً في أوساط المنتجات وUX تصف كيف كانت ميزات بحث ومساعد ذكاء اصطناعي مبكرة تُختبر أحياناً قبل وجود التقنية الحقيقية لتشغيلها: بدل بناء نظام آلي معقد مسبقاً، يضع الفريق شخصاً خلف الكواليس يقرأ الاستفسارات الواردة يدوياً ويكتب الردود، بينما يعتقد مستخدم الاختبار أنه يتفاعل مع نظام آلي كامل. عُرفت هذه التقنية العامة بطريقة "ساحر أوز،" نسبة للفيلم حيث يتضح أن الساحر القوي ظاهرياً مجرد رجل عادي يشغّل آلات خلف ستار.

الفكرة وراءها هي بالضبط ما يعلّمه هذا الدرس: قبل استثمار أشهر من الهندسة في ميزة آلية، يستطيع الفريق التحقّق من السؤال الأرخص بكثير والأهم بكثير — هل يريد الناس هذا فعلاً، وهل يشعر التفاعل بأنه مفيد — بإنسان يقف بصمت مكان التقنية غير المبنية بعد. إن أحب المستخدمون التحدث للمساعد "الذكي،" فتلك الإشارة الخضراء لبناء الأتمتة الحقيقية. وإن لم يحبوا، فقد وفّر الفريق للتو أشهراً من الهندسة على ميزة لا يريدها أحد، بتكلفة شخص يكتب ردوداً لبعد ظهر واحد.

هذا تطبيق دقة النمذجة إلى أقصاها المنطقي: أحياناً أرخص وأسرع نموذج ليس شاشة إطلاقاً — بل إنسان يتظاهر بأنه البرنامج، بالضبط حتى لا تضطر لبناء البرنامج لمعرفة إن كانت الفكرة تعمل.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is a prototype?", ar: "ما هو النموذج الأولي؟" },
          choices: [
            { en: "A clickable simulation that feels real but has no code behind it", ar: "محاكاة قابلة للنقر تبدو حقيقية لكن لا كود خلفها" },
            { en: "The final production app", ar: "التطبيق النهائي في الإنتاج" },
            { en: "A database schema", ar: "مخطط قاعدة بيانات" },
          ],
          answer: 0,
          explain: {
            en: "It's a movie-set version of the app — looks and clicks like the real thing so you can test the experience early.",
            ar: "نسخة موقع تصوير من التطبيق — تبدو وتُنقر كالحقيقي لتختبر التجربة مبكراً.",
          },
        },
        {
          q: { en: "Why prototype before building for real?", ar: "لماذا ننمذج قبل البناء الفعلي؟" },
          choices: [
            { en: "Fixing flaws in a prototype costs minutes; fixing built code costs weeks", ar: "إصلاح العيوب في نموذج يكلّف دقائق؛ وإصلاح كود مبنيّ يكلّف أسابيع" },
            { en: "Prototypes are the final deliverable", ar: "النماذج هي المُخرَج النهائي" },
            { en: "It skips the design step", ar: "يتخطّى خطوة التصميم" },
          ],
          answer: 0,
          explain: {
            en: "Prototyping moves problem-discovery to the cheapest moment — dragging arrows, not rewriting production code.",
            ar: "النماذج تنقل اكتشاف المشاكل لأرخص لحظة — سحب أسهم، لا إعادة كتابة كود الإنتاج.",
          },
        },
        {
          q: { en: "What makes a great designer, per this lesson?", ar: "ما الذي يصنع مصمّماً عظيماً، حسب هذا الدرس؟" },
          choices: [
            { en: "Iterating quickly with prototypes and real feedback", ar: "التكرار السريع بالنماذج والملاحظات الحقيقية" },
            { en: "Getting it perfect on the first try", ar: "إتقانه من أول محاولة" },
            { en: "Never testing with users", ar: "عدم الاختبار مع المستخدمين أبداً" },
          ],
          answer: 0,
          explain: {
            en: "The iterate loop (prototype → test → refine) beats one-shot guessing. Great design is refined, not divined.",
            ar: "حلقة التكرار (نموذج ← اختبار ← صقل) تتفوّق على التخمين مرة واحدة. التصميم العظيم يُصقل لا يُلهَم.",
          },
        },
        {
          q: { en: "When should you use a rough paper prototype instead of a polished Figma one?", ar: "متى تستخدم نموذجاً ورقياً خشناً بدل نموذج Figma مصقول؟" },
          choices: [
            { en: "Early on, when testing a big question like whether the flow makes sense at all", ar: "مبكراً، عند اختبار سؤال كبير مثل هل التدفق منطقي أصلاً" },
            { en: "Only after the product has already launched", ar: "فقط بعد أن يُطلَق المنتج بالفعل" },
            { en: "Never — paper prototypes are outdated", ar: "أبداً — النماذج الورقية قديمة الطراز" },
          ],
          answer: 0,
          explain: {
            en: "Match fidelity to the question: rough sketches for big early structural questions, polished prototypes for late-stage detail questions.",
            ar: "طابق الدقة مع السؤال: رسوم خشنة للأسئلة البنيوية الكبيرة المبكرة، ونماذج مصقولة لأسئلة التفاصيل المتأخرة.",
          },
        },
        {
          q: { en: "What is the 'Wizard of Oz' prototyping technique?", ar: "ما هي تقنية النمذجة 'ساحر أوز'؟" },
          choices: [
            { en: "A human secretly performs the 'automated' task so you can test the idea before building real automation", ar: "إنسان يؤدي المهمة 'الآلية' سرّاً لتختبر الفكرة قبل بناء أتمتة حقيقية" },
            { en: "A type of animated screen transition", ar: "نوع من انتقالات الشاشة المتحركة" },
            { en: "A method for choosing brand colors", ar: "طريقة لاختيار ألوان العلامة" },
          ],
          answer: 0,
          explain: {
            en: "It validates whether people want a feature at all, for the cost of a person faking it, before investing months building the real thing.",
            ar: "يتحقّق من رغبة الناس بميزة أصلاً، بتكلفة شخص يزيّفها، قبل استثمار أشهر ببناء الشيء الحقيقي.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A prototype is a clickable, code-free simulation of your product
- Link Figma screens to test real interactions before building
- Catch flaws for pennies, communicate clearly, iterate fast
- Match fidelity to the question: paper sketches for big early questions, polish for late details
- The "Wizard of Oz" technique tests demand with a human standing in for unbuilt automation
- Great design = the sketch → prototype → test → refine loop

**Next:** Design Systems — turning your proven designs into reusable, consistent building blocks.`,
        ar: `## الخلاصة

- النموذج الأولي محاكاة قابلة للنقر بلا كود لمنتجك
- اربط شاشات Figma لاختبار التفاعلات الحقيقية قبل البناء
- امسك العيوب بقروش، تواصل بوضوح، كرّر بسرعة
- طابق الدقة مع السؤال: رسوم ورقية للأسئلة الكبيرة المبكرة، صقل للتفاصيل المتأخرة
- تقنية "ساحر أوز" تختبر الطلب بإنسان يقف مكان الأتمتة غير المبنية
- التصميم العظيم = حلقة اسكتش ← نموذج ← اختبار ← صقل

**التالي:** أنظمة التصميم — تحويل تصاميمك المثبتة إلى لبنات متسقة معاد استخدامها.`,
      },
    },
  ],
};
