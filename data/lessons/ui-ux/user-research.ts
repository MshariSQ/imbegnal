import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "user-research",
  title: { en: "User Research — Design for Real People", ar: "بحث المستخدم — صمّم لأناس حقيقيين" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why "you are not the user"
- Research methods: interviews, surveys, usability testing
- Personas and user journeys
- How research prevents building the wrong thing`,
        ar: `## ماذا ستتعلم

- لماذا "أنت لست المستخدم"
- طرق البحث: المقابلات، الاستبيانات، اختبار الاستخدام
- الشخصيات (Personas) ورحلات المستخدم
- كيف يمنع البحث بناء الشيء الخطأ`,
      },
    },
    {
      type: "text",
      body: {
        en: `## You are not the user 🧑‍🤝‍🧑

The most expensive mistake in product design is building something beautiful that **nobody needs** — or that real people can't figure out. The cause is almost always the same trap: the designer assumes *everyone thinks like them*. But **you are not the user.** You know where every button is because you made it; a first-timer is lost. **User research** is how you escape your own head and design for reality.

**Key research methods:**
- **Interviews** — talk to real (potential) users one-on-one. Ask about their problems and habits, *not* "would you like this feature?" (people are bad at predicting their own behavior). Listen far more than you talk.
- **Surveys** — questions sent to many people. Great for quantitative signal ("70% abandon at the payment step") but shallow — pair with interviews for the *why*.
- **Usability testing** — the gold standard. Put your design (even a rough prototype) in front of a real person, give them a task ("try to buy this item"), and **watch silently** as they struggle or succeed. You'll spot problems you were completely blind to. Amazingly, testing with just ~5 people uncovers most major issues.

**Tools to organize what you learn:**
- **Personas** — a short profile of a typical user ("Sara, 28, busy nurse, shops on her phone between shifts, low patience for slow apps"). It keeps the team designing for a specific human, not a vague "everyone."
- **User journey map** — the step-by-step path a user takes to reach a goal, marking where they feel frustrated or delighted. It reveals the painful moments to fix.

**The mindset shift:** research replaces *"I think..."* with *"I observed..."*. Opinions are cheap and often wrong; evidence from real users is what builds products people actually adopt. Even a little research — testing a prototype with five friends — dramatically improves your design and saves you from confidently building the wrong thing. This is also what separates a *designer* from a *decorator*: designing the right solution, verified with real people.`,
        ar: `## أنت لست المستخدم 🧑‍🤝‍🧑

أغلى خطأ في تصميم المنتجات بناء شيء جميل **لا يحتاجه أحد** — أو لا يفهمه الناس الحقيقيون. السبب دائماً تقريباً نفس الفخ: يفترض المصمّم أن *الجميع يفكّر مثله*. لكن **أنت لست المستخدم.** تعرف مكان كل زر لأنك صنعته؛ والمستخدم لأول مرة تائه. **بحث المستخدم** هو كيف تخرج من رأسك وتصمّم للواقع.

**طرق البحث الأساسية:**
- **المقابلات** — تحدّث مع مستخدمين (محتملين) حقيقيين فردياً. اسأل عن مشاكلهم وعاداتهم، *لا* "هل تريد هذه الميزة؟" (الناس سيئون في توقّع سلوكهم). استمع أكثر بكثير مما تتكلّم.
- **الاستبيانات** — أسئلة تُرسل لكثيرين. رائعة لإشارة كمّية ("70% يتخلّون عند خطوة الدفع") لكنها سطحية — ازوجها بمقابلات لمعرفة *لماذا*.
- **اختبار الاستخدام** — المعيار الذهبي. ضع تصميمك (حتى نموذجاً خاماً) أمام شخص حقيقي، أعطه مهمة ("حاول شراء هذا")، و**راقب بصمت** وهو يتعثّر أو ينجح. سترصد مشاكل كنت أعمى عنها تماماً. والمدهش أن الاختبار مع ~5 أشخاص فقط يكشف معظم المشاكل الكبرى.

**أدوات لتنظيم ما تتعلّمه:**
- **الشخصيات (Personas)** — ملف قصير لمستخدم نموذجي ("Sara، 28، ممرضة مشغولة، تتسوّق بهاتفها بين المناوبات، صبرها قليل مع التطبيقات البطيئة"). يُبقي الفريق يصمّم لإنسان محدد، لا "الجميع" الغامض.
- **خريطة رحلة المستخدم** — المسار خطوة بخطوة الذي يسلكه المستخدم لهدف، معلّماً أين يشعر بالإحباط أو البهجة. تكشف اللحظات المؤلمة لإصلاحها.

**التحوّل الذهني:** البحث يستبدل *"أعتقد..."* بـ *"لاحظتُ..."*. الآراء رخيصة وخاطئة غالباً؛ ودليل المستخدمين الحقيقيين هو ما يبني منتجات يتبنّاها الناس فعلاً. حتى قليل من البحث — اختبار نموذج مع خمسة أصدقاء — يحسّن تصميمك بشدة وينقذك من بناء الشيء الخطأ بثقة. وهذا أيضاً ما يفصل *المصمّم* عن *المزخرِف*: تصميم الحل الصحيح، مُتحقَّقاً منه مع أناس حقيقيين.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Quick, cheap tests you can run this week 🧪

Not all research requires recruiting strangers and scheduling calls. A few lightweight tests fit into an afternoon and still catch major problems:

- **The 5-second test.** Show someone your design for exactly 5 seconds, then hide it and ask: "What was this? What was it for? What would you click first?" If they can't answer, your hierarchy and messaging aren't communicating fast enough — real visitors also glance and judge in seconds, so this simulates that ruthless first impression cheaply.
- **Card sorting.** Write every piece of content or feature on its own index card (or sticky note), then ask a few people to group the cards into categories that make sense *to them*, and name each group. Do this with 5 people and patterns emerge — this is how you build navigation/IA (from the wireframing lesson) that matches how real users think, instead of how your team happens to be organized internally.
- **The "first click" test.** Show a screen and a task ("find where to update your password"), and just watch where they click first — nothing else. Research shows that if the first click is right, people usually complete the task; if it's wrong, they often struggle. One click tells you a lot.
- **Guerrilla testing.** No lab required — sit in a coffee shop or ask 3 coworkers "can I get 5 minutes of your time?" and run a mini usability test on your phone or laptop. Imperfect, but *some* real-user feedback beats zero, and it costs nothing but asking.

None of these require a research budget or a dedicated researcher — they require only the willingness to show your work to a real person before you're finished, which is the actual hard part.`,
        ar: `## اختبارات سريعة رخيصة يمكنك تشغيلها هذا الأسبوع 🧪

ليس كل بحث يتطلب تجنيد غرباء وجدولة مكالمات. بضعة اختبارات خفيفة تناسب بعد ظهر واحد وما زالت تكشف مشاكل كبرى:

- **اختبار الخمس ثوانٍ.** أرِ أحدهم تصميمك لخمس ثوانٍ بالضبط، ثم أخفِه واسأل: "ما هذا؟ ما غرضه؟ ماذا ستنقر أولاً؟" إن لم يستطع الإجابة، فتسلسلك ورسالتك لا يتواصلان بسرعة كافية — الزوار الحقيقيون أيضاً يلقون نظرة ويحكمون خلال ثوانٍ، فهذا يحاكي ذلك الانطباع الأول القاسي برخص.
- **فرز البطاقات (Card sorting).** اكتب كل قطعة محتوى أو ميزة على بطاقة فهرسة (أو ملاحظة لاصقة) خاصة بها، ثم اطلب من بضعة أشخاص تجميع البطاقات في فئات منطقية *بالنسبة لهم*، وتسمية كل مجموعة. افعل هذا مع 5 أشخاص وستظهر الأنماط — هكذا تبني تنقّلاً/IA (من درس الإطار السلكي) يطابق كيف يفكّر المستخدمون الحقيقيون، لا كيف يصادف أن يُنظَّم فريقك داخلياً.
- **اختبار "النقرة الأولى".** أرِ شاشة ومهمة ("جد أين تحدّث كلمة مرورك")، وراقب فقط أين ينقرون أولاً — لا شيء آخر. تُظهر الأبحاث أنه إن كانت النقرة الأولى صحيحة، يكمل الناس المهمة عادة؛ وإن كانت خاطئة، غالباً يتعثّرون. نقرة واحدة تخبرك بالكثير.
- **الاختبار الارتجالي (Guerrilla testing).** لا مختبر مطلوب — اجلس في مقهى أو اسأل 3 زملاء "هل أحصل على 5 دقائق من وقتك؟" وشغّل اختبار استخدام مصغّراً على هاتفك أو حاسوبك. غير مثالي، لكن *بعض* ملاحظات المستخدمين الحقيقية أفضل من لا شيء، ولا يكلّف سوى السؤال.

لا شيء من هذا يتطلب ميزانية بحث أو باحثاً مخصصاً — يتطلب فقط الاستعداد لإظهار عملك لشخص حقيقي قبل أن تنتهي، وهذا هو الجزء الصعب فعلاً.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Try it yourself: run a 5-second test today 🔍

Pick any screen or page you've designed (or even a screenshot of an app you admire) and do this right now:

1. Find a friend, family member, or coworker willing to give you 60 seconds.
2. Show them the design for exactly 5 seconds (count it, or use a phone timer), then hide the screen.
3. Ask: "What is this? What's it for? What would you click or tap first?"
4. Write down their answer *exactly*, without correcting or explaining anything, even if they got it "wrong."

If their answer matches what you intended, your hierarchy and messaging are working. If it doesn't, you've just learned — for the cost of one minute — something no amount of staring at your own design would have revealed, because you already know what it's supposed to say.`,
        ar: `## جرّب بنفسك: شغّل اختبار خمس ثوانٍ اليوم 🔍

اختر أي شاشة أو صفحة صمّمتها (أو حتى لقطة شاشة لتطبيق تعجبك) وافعل هذا الآن:

1. جد صديقاً أو أحد العائلة أو زميلاً مستعداً لمنحك 60 ثانية.
2. أرِه التصميم لخمس ثوانٍ بالضبط (عدّها، أو استخدم مؤقّت الهاتف)، ثم أخفِ الشاشة.
3. اسأل: "ما هذا؟ ما غرضه؟ ماذا ستنقر أو تلمس أولاً؟"
4. اكتب إجابته *بالضبط*، بلا تصحيح أو شرح أي شيء، حتى لو أخطأ.

إن طابقت إجابته ما قصدته، فتسلسلك ورسالتك يعملان. وإن لم تطابق، فقد تعلّمت للتو — بتكلفة دقيقة واحدة — شيئاً لم يكن ليكشفه أي قدر من التحديق بتصميمك، لأنك تعرف مسبقاً ما يُفترض أن يقوله.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the checkout field that cost millions 🔍

One of the most famous stories in UX research concerns an e-commerce checkout form that required every visitor to create an account before buying — an extra "Register" step with a password field, standing between a shopper and their purchase. Analytics and user research consistently pointed to the same problem: a huge share of shoppers abandoned their cart at exactly that step, frustrated at being forced to create yet another password just to buy something.

The team running the research proposed a small, almost boring change: replace the "Register" button with a "Continue" button, and simply ask for an email address at checkout — turning account creation into an *optional* step offered only after the purchase was complete, framed around removing friction rather than demanding commitment upfront. The change was tested and rolled out, and the resulting jump in completed purchases was large enough that the story is still cited in UX and conversion-research circles as a canonical example of how research-driven insight into a single, unglamorous field can move revenue enormously.

The lesson isn't "always remove registration" — it's that research turned a vague, arguable business opinion ("users should create accounts") into an observed fact ("this exact step is where real people quit"), and that a famously small, unglamorous change, backed by evidence instead of assumption, outperformed a much flashier redesign would have.`,
        ar: `## دراسة حالة واقعية: حقل الدفع الذي كلّف ملايين 🔍

من أشهر القصص في بحث UX نموذج دفع لمتجر إلكتروني كان يتطلّب من كل زائر إنشاء حساب قبل الشراء — خطوة "تسجيل" إضافية بحقل كلمة مرور، تقف بين المتسوّق وشرائه. أشارت التحليلات وبحث المستخدم باستمرار لنفس المشكلة: نسبة هائلة من المتسوّقين تخلّت عن سلتها عند تلك الخطوة بالضبط، محبَطين من إجبارهم على إنشاء كلمة مرور أخرى فقط ليشتروا شيئاً.

اقترح الفريق القائم بالبحث تغييراً صغيراً يكاد يكون مملاً: استبدال زر "تسجيل" بزر "متابعة،" وطلب بريد إلكتروني فقط عند الدفع — محوّلين إنشاء الحساب لخطوة *اختيارية* تُعرض فقط بعد اكتمال الشراء، مؤطَّرة حول إزالة الاحتكاك لا المطالبة بالتزام مسبق. اختُبر التغيير ونُشر، وكانت القفزة الناتجة في المشتريات المكتملة كبيرة بما يكفي أن تُذكر القصة حتى الآن في أوساط UX وبحث التحويل كمثال كلاسيكي على كيف يمكن لرؤية مدفوعة بالبحث في حقل واحد غير برّاق أن تحرّك الإيرادات بشدة.

الدرس ليس "أزل التسجيل دائماً" — بل أن البحث حوّل رأي عمل غامضاً قابلاً للجدل ("يجب أن ينشئ المستخدمون حسابات") إلى حقيقة مُلاحَظة ("هذه الخطوة بالضبط هي حيث ينسحب الناس الحقيقيون")، وأن تغييراً صغيراً غير برّاق بشكل مشهور، مدعوماً بالدليل لا الافتراض، تفوّق على ما كانت لتحققه إعادة تصميم أكثر بريقاً بكثير.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What does 'you are not the user' mean?", ar: "ماذا يعني 'أنت لست المستخدم'؟" },
          choices: [
            { en: "Don't assume users think or behave like you — research reality", ar: "لا تفترض أن المستخدمين يفكّرون أو يتصرّفون مثلك — ابحث الواقع" },
            { en: "You can't use your own app", ar: "لا يمكنك استخدام تطبيقك" },
            { en: "Users don't matter", ar: "المستخدمون لا يهمّون" },
          ],
          answer: 0,
          explain: {
            en: "You know your design intimately; real users don't. Assuming they're like you is how the wrong thing gets built.",
            ar: "تعرف تصميمك عن قرب؛ والمستخدمون الحقيقيون لا. افتراض أنهم مثلك هو كيف يُبنى الشيء الخطأ.",
          },
        },
        {
          q: { en: "In usability testing, what should you mostly do?", ar: "في اختبار الاستخدام، ماذا يجب أن تفعل غالباً؟" },
          choices: [
            { en: "Give a task and watch silently as they attempt it", ar: "أعطِ مهمة وراقب بصمت وهم يحاولونها" },
            { en: "Explain how to use everything first", ar: "اشرح كيفية استخدام كل شيء أولاً" },
            { en: "Argue when they get confused", ar: "جادل عندما يرتبكون" },
          ],
          answer: 0,
          explain: {
            en: "Watching silently reveals real friction. If you guide them, you hide the exact problems you need to find.",
            ar: "المراقبة بصمت تكشف الاحتكاك الحقيقي. إن أرشدتهم، أخفيت المشاكل التي تحتاج إيجادها بالضبط.",
          },
        },
        {
          q: { en: "What is a persona?", ar: "ما هي الشخصية (persona)؟" },
          choices: [
            { en: "A short profile of a typical user to design for", ar: "ملف قصير لمستخدم نموذجي تصمّم له" },
            { en: "A real customer's full legal identity", ar: "الهوية القانونية الكاملة لعميل حقيقي" },
            { en: "A color scheme", ar: "نظام ألوان" },
          ],
          answer: 0,
          explain: {
            en: "A persona keeps the team focused on a specific human's needs and context instead of a vague 'everyone'.",
            ar: "الشخصية تُبقي الفريق مركّزاً على احتياجات إنسان محدد وسياقه بدل 'الجميع' الغامض.",
          },
        },
        {
          q: { en: "What does a 5-second test measure?", ar: "ماذا يقيس اختبار الخمس ثوانٍ؟" },
          choices: [
            { en: "Whether a design's purpose and hierarchy communicate fast enough for a quick first impression", ar: "هل يتواصل غرض التصميم وتسلسله بسرعة كافية لانطباع أول سريع" },
            { en: "How fast a page loads technically", ar: "كم تحمّل الصفحة تقنياً بسرعة" },
            { en: "The number of colors used", ar: "عدد الألوان المستخدمة" },
          ],
          answer: 0,
          explain: {
            en: "It simulates the ruthless glance-and-judge moment real visitors give a page, cheaply and in under a minute.",
            ar: "يحاكي لحظة النظرة والحكم القاسية التي يمنحها الزوار الحقيقيون للصفحة، برخص وفي أقل من دقيقة.",
          },
        },
        {
          q: { en: "What does card sorting help you build?", ar: "بماذا يساعدك فرز البطاقات في البناء؟" },
          choices: [
            { en: "Navigation/IA that matches how real users naturally group and name things", ar: "تنقّل/IA يطابق كيف يجمّع المستخدمون الحقيقيون الأشياء ويسمّونها طبيعياً" },
            { en: "The color palette", ar: "لوحة الألوان" },
            { en: "The database schema", ar: "مخطط قاعدة البيانات" },
          ],
          answer: 0,
          explain: {
            en: "Letting real users group and label content reveals a structure that matches their mental model, not your internal org chart.",
            ar: "السماح للمستخدمين الحقيقيين بتجميع وتسمية المحتوى يكشف بنية تطابق نموذجهم الذهني، لا مخطط شركتك الداخلي.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- You are not the user — research replaces assumptions with evidence
- Methods: interviews (why), surveys (how many), usability testing (watch them struggle)
- Personas and journey maps keep design focused on real people and pain points
- Cheap tests you can run this week: 5-second test, card sorting, first-click test, guerrilla testing
- The famous checkout case study: one research-driven field change moved revenue enormously
- Even testing with ~5 people uncovers most major problems

**Next:** Wireframing & IA — turning research insights into the skeleton of a design.`,
        ar: `## الخلاصة

- أنت لست المستخدم — البحث يستبدل الافتراضات بالأدلة
- الطرق: المقابلات (لماذا)، الاستبيانات (كم)، اختبار الاستخدام (راقبهم يتعثّرون)
- الشخصيات وخرائط الرحلة تُبقي التصميم مركّزاً على الناس الحقيقيين ونقاط الألم
- اختبارات رخيصة تشغّلها هذا الأسبوع: اختبار الخمس ثوانٍ، فرز البطاقات، اختبار النقرة الأولى، الاختبار الارتجالي
- دراسة حالة الدفع الشهيرة: تغيير حقل واحد مدفوع بالبحث حرّك الإيرادات بشدة
- حتى الاختبار مع ~5 أشخاص يكشف معظم المشاكل الكبرى

**التالي:** الإطار السلكي وهندسة المعلومات — تحويل رؤى البحث إلى هيكل التصميم.`,
      },
    },
  ],
};
