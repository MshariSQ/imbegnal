import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "generative-ai",
  title: { en: "Generative AI — Machines That Create", ar: "الذكاء التوليدي — آلات تُبدع" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What "generative" means (creating vs classifying)
- How image and text generation work, simply
- **Prompt engineering** — the real skill you can monetize now
- Where the paid opportunities are today`,
        ar: `## ماذا ستتعلم

- ماذا تعني "توليدية" (الإبداع مقابل التصنيف)
- كيف يعمل توليد الصور والنصوص، ببساطة
- **هندسة الأوامر (Prompt engineering)** — المهارة الحقيقية التي يمكنك تربحها الآن
- أين الفرص المدفوعة اليوم`,
      },
    },
    {
      type: "text",
      body: {
        en: `## From judging to creating 🎨

Earlier models were **discriminative** — they *judge*: "spam or not?", "cat or dog?". **Generative** models *create* new things: text (ChatGPT), images (Midjourney, DALL·E), code (GitHub Copilot), music, video.

**How does an image model create a picture from "a cat astronaut"?** Through a process called **diffusion**. Imagine starting with pure TV static (random noise), then removing a tiny bit of noise at a time, at each step nudging the pixels toward "more cat-astronaut-like," guided by your text. After ~50 steps of denoising, a clear image emerges. It learned to do this by watching millions of images get progressively noisier during training — then it runs that process in reverse.

**Text generation** you already understand from the NLP lesson: predict the next token, over and over, steered by your prompt.

**The skill worth money right now: prompt engineering.** The same model gives wildly different results depending on how you ask. Good prompting means:
- **Be specific:** "Write a poem" vs "Write a 4-line playful poem about coffee, rhyming, for a café menu."
- **Give context and a role:** "You are a senior lawyer. Explain this contract clause simply."
- **Show examples** of the output you want (called *few-shot* prompting).
- **Iterate:** treat it as a conversation, refining.

**Where the money is (today, for a beginner):** businesses need people who can integrate AI — build a customer-support bot, automate content, wire an LLM into an app via its API, or offer prompt-engineering/AI-consulting as a freelance service. You don't need to *train* models to earn from AI; you need to *apply* them well. That skill is in shortage right now.

⚠️ **Use it responsibly:** verify facts (hallucinations!), respect copyright, disclose AI-generated content where it matters, and never use it to deceive.`,
        ar: `## من الحُكم إلى الإبداع 🎨

النماذج الأقدم كانت **تمييزية** — *تحكم*: "مزعج أم لا؟"، "قطة أم كلب؟". النماذج **التوليدية** *تُنشئ* أشياء جديدة: نصوص (ChatGPT)، صور (Midjourney، DALL·E)، كود (GitHub Copilot)، موسيقى، فيديو.

**كيف ينشئ نموذج صورة لوحة من "قطة رائد فضاء"؟** عبر عملية تسمى **الانتشار (diffusion)**. تخيّل البدء بتشويش تلفاز خالص (ضوضاء عشوائية)، ثم إزالة قليل من الضوضاء في كل خطوة، مع دفع البكسلات نحو "أشبه بقطة-رائد-فضاء"، موجَّهاً بنصّك. بعد ~50 خطوة إزالة ضوضاء، تظهر صورة واضحة. تعلّم ذلك بمشاهدة ملايين الصور تزداد تشويشاً تدريجياً أثناء التدريب — ثم يشغّل العملية عكسياً.

**توليد النصوص** فهمته من درس معالجة اللغة: تنبّأ بالرمز التالي، مراراً، موجَّهاً بأمرك.

**المهارة التي تساوي مالاً الآن: هندسة الأوامر.** نفس النموذج يعطي نتائج مختلفة جذرياً حسب طريقة سؤالك. الأمر الجيد يعني:
- **كن محدداً:** "اكتب قصيدة" مقابل "اكتب قصيدة مرحة من 4 أسطر عن القهوة، مقفّاة، لقائمة مقهى."
- **أعطِ سياقاً ودوراً:** "أنت محامٍ خبير. اشرح بند العقد هذا ببساطة."
- **أرِ أمثلة** للمخرج الذي تريد (يسمى *few-shot*).
- **كرّر:** عامله كمحادثة، تصقلها.

**أين المال (اليوم، للمبتدئ):** الشركات تحتاج من يدمج الذكاء — بناء بوت دعم عملاء، أتمتة المحتوى، ربط LLM بتطبيق عبر API، أو تقديم هندسة أوامر/استشارات ذكاء كخدمة حرة. لا تحتاج أن *تدرّب* النماذج لتربح من الذكاء؛ تحتاج أن *تطبّقها* جيداً. وهذه المهارة نادرة الآن.

⚠️ **استخدمه بمسؤولية:** تحقّق من الحقائق (الهلوسة!)، احترم حقوق النشر، أفصح عن المحتوى المولّد بالذكاء حيث يهم، ولا تستخدمه للخداع أبداً.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What's the difference between discriminative and generative models?", ar: "ما الفرق بين النماذج التمييزية والتوليدية؟" },
          choices: [
            { en: "Discriminative judges/classifies; generative creates new content", ar: "التمييزية تحكم/تصنّف؛ والتوليدية تنشئ محتوى جديداً" },
            { en: "They are the same", ar: "متطابقان" },
            { en: "Generative is always smaller", ar: "التوليدية دائماً أصغر" },
          ],
          answer: 0,
          explain: {
            en: "Discriminative: 'cat or dog?'. Generative: 'draw me a cat.' Creation vs classification.",
            ar: "التمييزية: 'قطة أم كلب؟'. التوليدية: 'ارسم لي قطة.' إبداع مقابل تصنيف.",
          },
        },
        {
          q: { en: "How do diffusion image models create pictures?", ar: "كيف تنشئ نماذج الانتشار الصور؟" },
          choices: [
            { en: "By starting from noise and removing it step by step toward the prompt", ar: "بالبدء من ضوضاء وإزالتها خطوة خطوة نحو الأمر" },
            { en: "By copy-pasting existing photos", ar: "بنسخ ولصق صور موجودة" },
            { en: "By searching the web for images", ar: "بالبحث عن صور في الويب" },
          ],
          answer: 0,
          explain: {
            en: "Diffusion denoises random static into a coherent image guided by your text — it doesn't copy existing pictures.",
            ar: "الانتشار يزيل الضوضاء من تشويش عشوائي إلى صورة متماسكة موجَّهة بنصّك — لا ينسخ صوراً موجودة.",
          },
        },
        {
          q: { en: "What is prompt engineering?", ar: "ما هي هندسة الأوامر؟" },
          choices: [
            { en: "Crafting inputs (specific, with context/examples) to get better AI outputs", ar: "صياغة المدخلات (محددة، بسياق/أمثلة) للحصول على مخرجات ذكاء أفضل" },
            { en: "Building the physical computer", ar: "بناء الحاسوب الفيزيائي" },
            { en: "Training the model from scratch", ar: "تدريب النموذج من الصفر" },
          ],
          answer: 0,
          explain: {
            en: "The same model, prompted well (specific + context + examples + iteration), produces far better results. A monetizable skill today.",
            ar: "نفس النموذج، بأمر جيد (تحديد + سياق + أمثلة + تكرار)، ينتج نتائج أفضل بكثير. مهارة قابلة للتربّح اليوم.",
          },
        },
        {
          q: { en: "For a beginner, where's the realistic AI income today?", ar: "للمبتدئ، أين دخل الذكاء الواقعي اليوم؟" },
          choices: [
            { en: "Applying/integrating existing models (bots, automation, APIs, consulting)", ar: "تطبيق/دمج النماذج الموجودة (بوتات، أتمتة، APIs، استشارات)" },
            { en: "Only by training giant models yourself", ar: "فقط بتدريب نماذج عملاقة بنفسك" },
            { en: "There is no income in AI", ar: "لا دخل في الذكاء" },
          ],
          answer: 0,
          explain: {
            en: "You don't need to train models to earn — businesses pay to have existing models applied well. That skill is in short supply.",
            ar: "لا تحتاج تدريب نماذج لتربح — الشركات تدفع لتطبيق النماذج الموجودة جيداً. وهذه المهارة نادرة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Track complete! 🎓

Your AI foundation is built:

- Python + the math intuition (weights, gradient descent)
- Machine learning, deep learning, and neural networks
- NLP/LLMs, computer vision, MLOps, and generative AI

**Path to paid work:** the fastest route today is *applying* AI — learn one framework (start with scikit-learn, then PyTorch), master prompt engineering, and build 2–3 real projects (a chatbot, an image classifier, an LLM-powered app) on your GitHub. Combine that with the freelance/job skills from the Frontend track's "Getting Paid" lesson, and you're positioned for one of the most in-demand fields on earth. Build responsibly!`,
        ar: `## اكتمل المسار! 🎓

أساس الذكاء لديك مبنيّ:

- بايثون + حدس الرياضيات (الأوزان، الانحدار التدريجي)
- تعلّم الآلة، التعلّم العميق، والشبكات العصبية
- معالجة اللغة/LLMs، الرؤية الحاسوبية، MLOps، والذكاء التوليدي

**طريق العمل المدفوع:** أسرع مسار اليوم هو *تطبيق* الذكاء — تعلّم إطاراً واحداً (ابدأ بـ scikit-learn ثم PyTorch)، أتقن هندسة الأوامر، وابنِ 2–3 مشاريع حقيقية (بوت محادثة، مصنّف صور، تطبيق مدعوم بـ LLM) على GitHub. اجمع ذلك مع مهارات العمل الحر/الوظيفة من درس "التكسّب" في مسار الواجهات، فتكون مهيّأً لأحد أكثر المجالات طلباً على الأرض. ابنِ بمسؤولية!`,
      },
    },
  ],
};
