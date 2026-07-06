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
      type: "text",
      body: {
        en: `## Two families of creators: GANs and diffusion 🥊

Before diffusion models became dominant, the star of generative image AI was the **GAN (Generative Adversarial Network)** — a clever trick built on competition rather than denoising. A GAN pits two neural networks against each other:

- The **generator** tries to create fake images that look real.
- The **discriminator** tries to catch which images are fake vs. real.

They train together: the generator gets better at fooling the discriminator, and the discriminator gets better at catching fakes, pushing each other to improve — like a forger and an art detective locked in an escalating rivalry. Given enough rounds, the generator produces images realistic enough to fool even careful human inspection. GANs were behind some of the earliest viral "this person does not exist"-style photorealistic face generators.

**Diffusion models** (from the previous section) largely overtook GANs for state-of-the-art image generation because they tend to train more stably and produce a wider variety of outputs — a GAN's two-network competition can be finicky and sometimes collapses into generating only a narrow range of similar images. Both approaches, though, share the same core lesson from this track: a model that starts by *judging* (the discriminator, or the denoising step deciding "does this look more cat-like?") can be repurposed as the engine for *creating*.

Whichever architecture is under the hood, the output is still a **statistical guess** shaped by training data — not understanding. That's why generated images can get small details wrong (hands, text, reflections) even when the overall picture looks convincing, and it's exactly why the "use it responsibly" advice from this lesson matters.`,
        ar: `## عائلتان من المبدعين: GANs والانتشار 🥊

قبل أن تهيمن نماذج الانتشار، كانت نجمة ذكاء الصور التوليدي هي **GAN (الشبكة التوليدية التنافسية)** — حيلة ذكية مبنية على التنافس لا إزالة الضوضاء. تضع GAN شبكتين عصبيتين في مواجهة:

- **المولّد (generator)** يحاول إنشاء صور مزيّفة تبدو حقيقية.
- **المميّز (discriminator)** يحاول اكتشاف أي الصور مزيّفة وأيها حقيقية.

تتدرّبان معاً: يتحسّن المولّد في خداع المميّز، ويتحسّن المميّز في اكتشاف المزيّف، فيدفع كل منهما الآخر للتحسّن — كمزوّر ومحقق فني في تنافس متصاعد. بعد جولات كافية، ينتج المولّد صوراً واقعية بما يكفي لخداع حتى الفحص البشري الدقيق. كانت GANs خلف بعض أوائل مولّدات الوجوه الواقعية الفيروسية بنمط "هذا الشخص غير موجود".

تجاوزت **نماذج الانتشار** (من القسم السابق) GANs إلى حد كبير في توليد الصور المتطوّر لأنها تميل للتدريب بثبات أكبر وإنتاج تنوّع أوسع في المخرجات — تنافس الشبكتين في GAN قد يكون حسّاساً وينهار أحياناً لإنتاج نطاق ضيق فقط من صور متشابهة. لكن كلا النهجين يشتركان في نفس الدرس الجوهري لهذا المسار: نموذج يبدأ بـ*الحكم* (المميّز، أو خطوة إزالة الضوضاء التي تقرّر "هل يبدو هذا أشبه بقطة؟") يمكن إعادة توظيفه كمحرك لـ*الإبداع*.

أياً كانت المعمارية تحت الغطاء، يبقى المخرج **تخميناً إحصائياً** تشكّله بيانات التدريب — لا فهماً. لهذا قد تُخطئ الصور المولَّدة في تفاصيل صغيرة (الأيدي، النص، الانعكاسات) حتى حين تبدو الصورة كاملة مقنعة، ولهذا بالضبط نصيحة "استخدمه بمسؤولية" من هذا الدرس مهمة.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Build a tiny text generator using the same "predict what's likely next" idea as an LLM, radically simplified. Given a dictionary mapping each word to the list of words that followed it in some training text, write \`generate(start_word, transitions, length)\` that:
1. Starts with \`start_word\`
2. For each next step, picks the **first** word in \`transitions[current_word]\` (a simplified stand-in for "most likely next word")
3. Stops once the output has \`length\` words, or if the current word has no entry in \`transitions\`

Example: \`transitions = {"i": ["love"], "love": ["ai"]}\`, \`generate("i", transitions, 3)\` → \`["i", "love", "ai"]\``,
        ar: `ابنِ مولّد نص مصغّراً بنفس فكرة "تنبأ بما هو محتمل تالياً" لـ LLM، مبسّطة جذرياً. بمعطى قاموس يربط كل كلمة بقائمة الكلمات التي تلتها في نص تدريبي ما، اكتب \`generate(start_word, transitions, length)\`:
1. يبدأ بـ \`start_word\`
2. في كل خطوة تالية، يختار **أول** كلمة في \`transitions[current_word]\` (بديل مبسّط عن "الكلمة التالية الأرجح")
3. يتوقف عند وصول المخرج لـ \`length\` كلمة، أو إذا لم يكن للكلمة الحالية مدخل في \`transitions\`

مثال: \`transitions = {"i": ["love"], "love": ["ai"]}\`، \`generate("i", transitions, 3)\` ← \`["i", "love", "ai"]\``,
      },
      starterCode: `def generate(start_word, transitions, length):
    result = [start_word]
    current = start_word
    # while len(result) < length:
    #   if current not in transitions: break
    #   current = transitions[current][0]
    #   result.append(current)
    return result

transitions = {"i": ["love"], "love": ["ai"]}
print(generate("i", transitions, 3))  # ['i', 'love', 'ai']`,
      solution: `def generate(start_word, transitions, length):
    result = [start_word]
    current = start_word
    while len(result) < length:
        if current not in transitions or not transitions[current]:
            break
        current = transitions[current][0]
        result.append(current)
    return result

transitions = {"i": ["love"], "love": ["ai"]}
print(generate("i", transitions, 3))  # ['i', 'love', 'ai']`,
      hints: [
        { en: `Use a while loop that continues while len(result) < length.`, ar: `استخدم حلقة while تستمر ما دام len(result) < length.` },
        { en: `Break out of the loop if current word isn't a key in transitions; otherwise take transitions[current][0] and append it.`, ar: `اخرج من الحلقة إذا لم تكن الكلمة الحالية مفتاحاً في transitions؛ وإلا خذ transitions[current][0] وأضفها.` },
      ],
      tests: [
        { name: { en: "Matches the example exactly", ar: "يطابق المثال تماماً" }, check: `assert generate("i", {"i":["love"],"love":["ai"]}, 3) == ["i","love","ai"]` },
        { name: { en: "Stops early if a word has no transition", ar: "يتوقف مبكراً إذا لم يكن للكلمة انتقال" }, check: `assert generate("i", {"i":["love"]}, 5) == ["i","love"]` },
        { name: { en: "Length 1 just returns the start word", ar: "الطول 1 يعيد كلمة البداية فقط" }, check: `assert generate("hi", {"hi":["there"]}, 1) == ["hi"]` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the launch that made generative AI a household topic 🔍

Text generation research had been progressing for years inside AI labs, but for most of the public, generative AI became real in **late 2022**, when OpenAI released **ChatGPT** as a free, simple chat interface on top of an existing large language model. Nothing about the underlying next-token-prediction technology was brand new that week — what changed was that anyone with a web browser could now type a question and get a fluent, useful answer in seconds, no technical skill required.

The reaction was immediate and enormous: it became one of the fastest-growing consumer applications in history, reaching tens of millions of users within just weeks, driven almost entirely by word of mouth. Schools debated banning it over cheating concerns, companies scrambled to figure out policies for employees using it, and rival companies accelerated their own generative AI releases practically overnight.

The core lesson for anyone learning AI today: the technology behind these breakthroughs (transformers, next-token prediction, diffusion, GANs) had mostly existed for a few years already. What actually changed the world almost overnight was **making it accessible** through a simple, well-designed interface. That's a pattern worth remembering as you think about where the real opportunities are — sometimes the biggest impact doesn't come from inventing new AI, but from making existing AI usable by ordinary people.`,
        ar: `## دراسة حالة واقعية: الإطلاق الذي جعل الذكاء التوليدي حديث كل بيت 🔍

كانت أبحاث توليد النصوص تتقدّم لسنوات داخل معامل الذكاء الاصطناعي، لكن بالنسبة لمعظم الناس، أصبح الذكاء التوليدي حقيقياً في **أواخر 2022**، حين أطلقت OpenAI **ChatGPT** كواجهة محادثة مجانية بسيطة فوق نموذج لغوي كبير موجود أصلاً. لم يكن شيء في تقنية التنبؤ بالرمز التالي الأساسية جديداً تماماً ذلك الأسبوع — ما تغيّر هو أن أي شخص لديه متصفح إنترنت أصبح يستطيع كتابة سؤال والحصول على جواب سلس ومفيد خلال ثوانٍ، دون مهارة تقنية.

كان ردّ الفعل فورياً وهائلاً: أصبح أحد أسرع التطبيقات الاستهلاكية نمواً في التاريخ، ووصل لعشرات ملايين المستخدمين خلال أسابيع فقط، مدفوعاً بالكلام المتناقل شبه كلياً. ناقشت المدارس حظره بسبب مخاوف الغش، وسارعت الشركات لوضع سياسات لموظفيها المستخدمين له، وسرّعت الشركات المنافسة إطلاق منتجاتها التوليدية الخاصة بين ليلة وضحاها تقريباً.

الدرس الجوهري لأي متعلّم للذكاء اليوم: التقنية خلف هذه الاختراقات (المحوّلات، التنبؤ بالرمز التالي، الانتشار، GANs) كانت موجودة أصلاً لبضع سنوات. ما غيّر العالم فعلياً بين ليلة وضحاها تقريباً هو **جعله سهل الوصول** عبر واجهة بسيطة ومصمَّمة جيداً. هذا نمط يستحق التذكّر وأنت تفكّر أين الفرص الحقيقية — أحياناً لا يأتي الأثر الأكبر من اختراع ذكاء جديد، بل من جعل ذكاء موجود قابلاً للاستخدام لعامة الناس.`,
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
        {
          q: { en: "In a GAN, what do the generator and discriminator do?", ar: "في GAN، ماذا يفعل المولّد والمميّز؟" },
          choices: [
            { en: "The generator creates fake images while the discriminator tries to catch them, each pushing the other to improve", ar: "المولّد ينشئ صوراً مزيّفة بينما يحاول المميّز اكتشافها، ويدفع كل منهما الآخر للتحسّن" },
            { en: "They both only classify spam emails", ar: "كلاهما يصنّف رسائل مزعجة فقط" },
            { en: "The generator deletes bad training data", ar: "المولّد يحذف بيانات تدريب سيئة" },
          ],
          answer: 0,
          explain: {
            en: "GANs train through competition — like a forger and a detective improving against each other — until the generator's fakes become highly convincing.",
            ar: "تتدرّب GANs عبر التنافس — كمزوّر ومحقق يتحسّنان أحدهما ضد الآخر — حتى تصبح مزيّفات المولّد مقنعة جداً.",
          },
        },
        {
          q: { en: "What made ChatGPT's late-2022 launch such a turning point?", ar: "ما الذي جعل إطلاق ChatGPT أواخر 2022 نقطة تحوّل؟" },
          choices: [
            { en: "It made existing LLM technology accessible to anyone through a simple chat interface, not a brand-new underlying technology", ar: "جعل تقنية LLM الموجودة سهلة الوصول لأي شخص عبر واجهة محادثة بسيطة، لا تقنية أساسية جديدة تماماً" },
            { en: "It was the first time any computer had ever generated text", ar: "كانت أول مرة يولّد فيها أي حاسوب نصاً على الإطلاق" },
            { en: "It required advanced coding skills to use", ar: "تطلّب مهارات برمجة متقدمة لاستخدامه" },
          ],
          answer: 0,
          explain: {
            en: "The underlying next-token prediction technology already existed; making it accessible via a simple interface is what drove explosive, near-overnight adoption.",
            ar: "تقنية التنبؤ بالرمز التالي كانت موجودة أصلاً؛ وجعلها سهلة الوصول عبر واجهة بسيطة هو ما دفع تبنّياً هائلاً وسريعاً جداً.",
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
- NLP/LLMs, computer vision, MLOps, and generative AI (diffusion and GANs, plus a mini text generator you built yourself)
- Case study: ChatGPT's 2022 launch showed that making AI *accessible* can matter more than the underlying breakthrough

**Path to paid work:** the fastest route today is *applying* AI — learn one framework (start with scikit-learn, then PyTorch), master prompt engineering, and build 2–3 real projects (a chatbot, an image classifier, an LLM-powered app) on your GitHub. Combine that with the freelance/job skills from the Frontend track's "Getting Paid" lesson, and you're positioned for one of the most in-demand fields on earth. Build responsibly!`,
        ar: `## اكتمل المسار! 🎓

أساس الذكاء لديك مبنيّ:

- بايثون + حدس الرياضيات (الأوزان، الانحدار التدريجي)
- تعلّم الآلة، التعلّم العميق، والشبكات العصبية
- معالجة اللغة/LLMs، الرؤية الحاسوبية، MLOps، والذكاء التوليدي (الانتشار وGANs، بالإضافة لمولّد نص مصغّر بنيته بنفسك)
- دراسة الحالة: إطلاق ChatGPT عام 2022 أظهر أن جعل الذكاء *سهل الوصول* قد يكون أهم من الاختراق الأساسي نفسه

**طريق العمل المدفوع:** أسرع مسار اليوم هو *تطبيق* الذكاء — تعلّم إطاراً واحداً (ابدأ بـ scikit-learn ثم PyTorch)، أتقن هندسة الأوامر، وابنِ 2–3 مشاريع حقيقية (بوت محادثة، مصنّف صور، تطبيق مدعوم بـ LLM) على GitHub. اجمع ذلك مع مهارات العمل الحر/الوظيفة من درس "التكسّب" في مسار الواجهات، فتكون مهيّأً لأحد أكثر المجالات طلباً على الأرض. ابنِ بمسؤولية!`,
      },
    },
  ],
};
