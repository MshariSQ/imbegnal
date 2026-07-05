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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- You are not the user — research replaces assumptions with evidence
- Methods: interviews (why), surveys (how many), usability testing (watch them struggle)
- Personas and journey maps keep design focused on real people and pain points
- Even testing with ~5 people uncovers most major problems

**Next:** Wireframing & IA — turning research insights into the skeleton of a design.`,
        ar: `## الخلاصة

- أنت لست المستخدم — البحث يستبدل الافتراضات بالأدلة
- الطرق: المقابلات (لماذا)، الاستبيانات (كم)، اختبار الاستخدام (راقبهم يتعثّرون)
- الشخصيات وخرائط الرحلة تُبقي التصميم مركّزاً على الناس الحقيقيين ونقاط الألم
- حتى الاختبار مع ~5 أشخاص يكشف معظم المشاكل الكبرى

**التالي:** الإطار السلكي وهندسة المعلومات — تحويل رؤى البحث إلى هيكل التصميم.`,
      },
    },
  ],
};
