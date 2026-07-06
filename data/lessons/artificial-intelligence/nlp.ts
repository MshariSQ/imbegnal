import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "nlp",
  title: { en: "NLP & LLMs — How Machines Read", ar: "معالجة اللغة وLLMs — كيف تقرأ الآلات" },
  estMinutes: 40,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- How computers turn **words into numbers**
- Tokens, embeddings, and what makes an **LLM** tick
- Why ChatGPT is "just" predicting the next word
- You'll build a mini tokenizer and word counter`,
        ar: `## ماذا ستتعلم

- كيف تحوّل الحواسيب **الكلمات إلى أرقام**
- الرموز (tokens)، المتجهات الدلالية (embeddings)، وما الذي يشغّل **LLM**
- لماذا ChatGPT "مجرد" تنبؤ بالكلمة التالية
- ستبني مُرمِّزاً وعدّاد كلمات مصغّراً`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Turning language into math 🔤

Computers only do math on numbers — but language is words. **NLP** (Natural Language Processing) is the bridge.

**Step 1: Tokenization.** Break text into pieces called **tokens** (roughly words or word-parts). "I love AI" → \`["I", "love", "AI"]\`. This is the first thing every language model does to your input.

**Step 2: Embeddings.** Each token becomes a **vector** of numbers (remember vectors?) that captures its *meaning*. The magic: words with similar meanings get similar vectors. So "king" and "queen" land near each other, and famously \`king - man + woman ≈ queen\` in vector-math. Meaning becomes geometry.

**Step 3: The model.** An **LLM** (Large Language Model) like GPT is a giant neural network trained on a huge chunk of the internet with one deceptively simple goal: **predict the next token**. Given "The capital of France is", it learned that "Paris" is overwhelmingly likely.

That's the big secret: ChatGPT is a spectacularly good **next-word predictor**. Ask it a question and it predicts, word by word, what a helpful answer would look like — because it saw millions of helpful answers during training. Scale that up massively (billions of weights, most of the internet) and next-word prediction becomes something that looks a lot like understanding.

**Terms you'll hear:** a **prompt** is your input; **tokens** are the billing/length unit (that's why long chats cost more); **context window** is how many tokens the model can "see" at once; **hallucination** is when it confidently predicts something false (it optimizes for plausible, not true).`,
        ar: `## تحويل اللغة إلى رياضيات 🔤

الحواسيب لا تُجري رياضيات إلا على الأرقام — لكن اللغة كلمات. **NLP** (معالجة اللغة الطبيعية) هي الجسر.

**الخطوة 1: الترميز (Tokenization).** تقسيم النص إلى قطع تسمى **رموز (tokens)** (كلمات أو أجزاء كلمات تقريباً). "I love AI" ← \`["I", "love", "AI"]\`. هذا أول ما يفعله كل نموذج لغوي بمدخلك.

**الخطوة 2: المتجهات الدلالية (Embeddings).** كل رمز يصبح **متجهاً** من الأرقام (تذكّر المتجهات؟) يلتقط *معناه*. السحر: الكلمات المتقاربة المعنى تحصل على متجهات متقاربة. فـ "king" و"queen" تقعان قرب بعضهما، والشهير أن \`king - man + woman ≈ queen\` برياضيات المتجهات. المعنى يصبح هندسة.

**الخطوة 3: النموذج.** **LLM** (نموذج لغوي كبير) مثل GPT شبكة عصبية عملاقة دُرّبت على جزء ضخم من الإنترنت بهدف بسيط بشكل خادع: **التنبؤ بالرمز التالي**. بمعطى "عاصمة فرنسا هي"، تعلّم أن "باريس" هي الأرجح ساحقاً.

هذا هو السرّ الكبير: ChatGPT متنبّئ بالكلمة التالية بارع بشكل مذهل. اسأله سؤالاً فيتنبأ، كلمة كلمة، بما يبدو عليه جواب مفيد — لأنه رأى ملايين الأجوبة المفيدة أثناء التدريب. وسّع ذلك هائلاً (مليارات الأوزان، معظم الإنترنت) فيصبح التنبؤ بالكلمة التالية شيئاً يشبه الفهم كثيراً.

**مصطلحات ستسمعها:** الـ**prompt** هو مدخلك؛ والـ**tokens** وحدة الطول/الفوترة (لهذا المحادثات الطويلة أغلى)؛ و**نافذة السياق (context window)** كم رمزاً يرى النموذج دفعة واحدة؛ و**الهلوسة (hallucination)** حين يتنبأ بثقة بشيء خاطئ (يحسّن للمعقول لا للصحيح).`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Build the first step of every NLP pipeline. Write \`word_frequencies(text)\` that:
1. Lowercases the text and splits it into words (by spaces)
2. Returns a dictionary mapping each word → how many times it appears

Example: \`"the cat the dog"\` → \`{"the": 2, "cat": 1, "dog": 1}\``,
        ar: `ابنِ الخطوة الأولى في كل معالجة لغة. اكتب \`word_frequencies(text)\`:
1. تحوّل النص لأحرف صغيرة وتقسمه إلى كلمات (بالمسافات)
2. تعيد قاموساً يربط كل كلمة ← كم مرة تظهر

مثال: \`"the cat the dog"\` ← \`{"the": 2, "cat": 1, "dog": 1}\``,
      },
      starterCode: `def word_frequencies(text):
    counts = {}
    # lowercase, split on spaces, count each word
    return counts

print(word_frequencies("the cat the dog"))  # {'the': 2, 'cat': 1, 'dog': 1}`,
      solution: `def word_frequencies(text):
    counts = {}
    for word in text.lower().split():
        counts[word] = counts.get(word, 0) + 1
    return counts

print(word_frequencies("the cat the dog"))  # {'the': 2, 'cat': 1, 'dog': 1}`,
      hints: [
        { en: `text.lower().split() gives a list of lowercase words.`, ar: `text.lower().split() يعطي قائمة كلمات صغيرة.` },
        { en: `counts.get(word, 0) + 1 safely increments even the first time.`, ar: `counts.get(word, 0) + 1 يزيد بأمان حتى أول مرة.` },
      ],
      tests: [
        { name: { en: "Counts repeats correctly", ar: "يعدّ التكرارات بشكل صحيح" }, check: `assert word_frequencies("the cat the dog") == {"the":2,"cat":1,"dog":1}` },
        { name: { en: "Is case-insensitive", ar: "لا يميّز حالة الأحرف" }, check: `assert word_frequencies("Hi hi HI")["hi"] == 3` },
        { name: { en: "Empty text gives empty dict", ar: "نص فارغ يعطي قاموساً فارغاً" }, check: `assert word_frequencies("") == {}` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Attention: how a model knows what to focus on 🔦

Older language models read text strictly left to right, one word at a time, which made it hard to connect words that were far apart in a sentence. Modern LLMs are built on an architecture called the **Transformer**, and its core idea is **attention**.

Attention lets the model, for every word it processes, ask: "which *other* words in this sentence matter most for understanding me right now?" and weigh them accordingly. Take the sentence:

\`\`\`
"The trophy didn't fit in the suitcase because it was too big."
\`\`\`

What does "it" refer to — the trophy or the suitcase? A human resolves this instantly from context. Attention gives the model a mechanism to do the same: when processing the word "it," the model learns to assign a high attention *weight* to "trophy" and a low weight to "suitcase," effectively looking back at the most relevant earlier word instead of just the most recent one.

Crucially, attention lets every word look at *every other word simultaneously* (not just the previous one), and it does this with plain weighted sums — the same weights-and-dot-products math from the math-for-ML lesson, just applied cleverly. This parallelism is also why Transformers can be trained so much faster than older step-by-step architectures: instead of processing one word at a time in sequence, a GPU can compute attention across an entire sentence at once.

Stack many layers of attention on top of each other, scale up to billions of parameters and a huge chunk of internet text, and you get the GPT-style LLMs from earlier in this lesson.`,
        ar: `## الانتباه: كيف يعرف النموذج على ماذا يركّز 🔦

نماذج اللغة الأقدم قرأت النص من اليسار لليمين بصرامة، كلمة كلمة، ما صعّب ربط كلمات متباعدة في الجملة. نماذج LLM الحديثة مبنية على معمارية تسمى **المحوّل (Transformer)**، وفكرتها الجوهرية هي **الانتباه (attention)**.

الانتباه يتيح للنموذج، لكل كلمة يعالجها، أن يسأل: "أي الكلمات *الأخرى* في هذه الجملة الأهم لفهمي الآن؟" ويرجّحها تبعاً لذلك. خذ الجملة:

\`\`\`
"لم تتسع الجائزة في الحقيبة لأنها كانت كبيرة جداً."
\`\`\`

إلى ماذا تشير "ها" — الجائزة أم الحقيبة؟ يحلّ الإنسان هذا فوراً من السياق. يمنح الانتباه النموذج آلية لفعل الشيء نفسه: عند معالجة "ها"، يتعلّم النموذج إعطاء وزن انتباه عالٍ لـ"الجائزة" ووزناً منخفضاً لـ"الحقيبة"، فينظر فعلياً إلى الكلمة السابقة الأكثر صلة لا الأقرب فقط.

والأهم أن الانتباه يتيح لكل كلمة النظر إلى *كل كلمة أخرى في آن واحد* (لا الكلمة السابقة فقط)، ويفعل هذا بمجاميع مرجّحة بسيطة — نفس رياضيات الأوزان والجداءات النقطية من درس رياضيات تعلّم الآلة، لكن مطبّقة بذكاء. هذا التوازي أيضاً سبب تدريب Transformers أسرع بكثير من المعماريات التسلسلية القديمة خطوة بخطوة: بدلاً من معالجة كلمة واحدة بالتتابع، يستطيع GPU حساب الانتباه عبر جملة كاملة دفعة واحدة.

كدّس طبقات انتباه كثيرة فوق بعضها، وسّع إلى مليارات المعاملات وجزء ضخم من نص الإنترنت، فتحصل على نماذج LLM بنمط GPT من وقت سابق في هذا الدرس.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Build a tiny "next word predictor" — the same core idea an LLM uses, radically simplified. Write \`next_word_counts(text)\` that looks at every pair of consecutive words in \`text\` and returns a dictionary mapping each word to a dictionary of "words that followed it → how many times."

Example: \`"i like cats i like dogs"\` → \`{"i": {"like": 2}, "like": {"cats": 1, "dogs": 1}, "cats": {"i": 1}}\` (the last word "dogs" has nothing after it, so it's not a key).`,
        ar: `ابنِ "متنبّئ كلمة تالية" مصغّراً — نفس فكرة LLM الجوهرية، مبسّطة جذرياً. اكتب \`next_word_counts(text)\` تنظر إلى كل زوج كلمات متتاليتين في \`text\` وتعيد قاموساً يربط كل كلمة بقاموس "الكلمات التي تلتها ← كم مرة."

مثال: \`"i like cats i like dogs"\` ← \`{"i": {"like": 2}, "like": {"cats": 1, "dogs": 1}, "cats": {"i": 1}}\` (الكلمة الأخيرة "dogs" ليس بعدها شيء، فلا تكون مفتاحاً).`,
      },
      starterCode: `def next_word_counts(text):
    words = text.split()
    counts = {}
    # for each consecutive pair (word, next_word):
    #   counts.setdefault(word, {}) then increment counts[word][next_word]
    return counts

print(next_word_counts("i like cats i like dogs"))
# {'i': {'like': 2}, 'like': {'cats': 1, 'dogs': 1}, 'cats': {'i': 1}}`,
      solution: `def next_word_counts(text):
    words = text.split()
    counts = {}
    for word, next_word in zip(words, words[1:]):
        counts.setdefault(word, {})
        counts[word][next_word] = counts[word].get(next_word, 0) + 1
    return counts

print(next_word_counts("i like cats i like dogs"))
# {'i': {'like': 2}, 'like': {'cats': 1, 'dogs': 1}, 'cats': {'i': 1}}`,
      hints: [
        { en: `zip(words, words[1:]) pairs each word with the one right after it.`, ar: `zip(words, words[1:]) يزاوج كل كلمة بالتي تليها مباشرة.` },
        { en: `Use counts.setdefault(word, {}) to make sure a dict exists before incrementing counts[word][next_word].`, ar: `استخدم counts.setdefault(word, {}) لضمان وجود قاموس قبل زيادة counts[word][next_word].` },
      ],
      tests: [
        { name: { en: "Matches the example exactly", ar: "يطابق المثال تماماً" }, check: `assert next_word_counts("i like cats i like dogs") == {"i":{"like":2},"like":{"cats":1,"dogs":1},"cats":{"i":1}}` },
        { name: { en: "Single word gives empty dict", ar: "كلمة واحدة تعطي قاموساً فارغاً" }, check: `assert next_word_counts("hello") == {}` },
        { name: { en: "Two different words gives one entry", ar: "كلمتان مختلفتان تعطيان مدخلاً واحداً" }, check: `assert next_word_counts("a b") == {"a":{"b":1}}` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Google Translate goes neural 🔍

For years, machine translation services (including Google Translate) relied on **statistical machine translation** — systems that translated phrase-by-phrase using probabilities learned from huge bodies of paired text, without much sense of the whole sentence's meaning. Translations were often clunky, especially for languages with very different grammar from English.

In 2016, Google switched Translate to **Google Neural Machine Translation (GNMT)**, an approach built on deep neural networks that processed entire sentences at once rather than fragment by fragment. The jump in quality was large enough that Google's own researchers described the improvement as comparable to several years of the old system's incremental progress happening overnight. Translations became noticeably more fluent and better at handling context, word order, and idioms.

This transition — from phrase-based statistical methods to end-to-end neural networks reading whole sentences — is part of the same broader wave that led to the attention-based Transformer architecture you just learned about (the original Transformer paper itself was framed around improving machine translation). It's a clear, everyday example of how the shift from older NLP techniques to deep neural approaches translated directly into a better experience for hundreds of millions of daily users, almost overnight.`,
        ar: `## دراسة حالة واقعية: Google Translate يتحوّل عصبياً 🔍

لسنوات، اعتمدت خدمات الترجمة الآلية (بما فيها Google Translate) على **الترجمة الآلية الإحصائية** — أنظمة تترجم عبارة بعبارة باستخدام احتمالات متعلَّمة من مجموعات نصوص متوازية ضخمة، دون إحساس كبير بمعنى الجملة كاملة. كانت الترجمات غالباً ركيكة، خصوصاً للغات ذات قواعد مختلفة جداً عن الإنجليزية.

في 2016، حوّلت Google خدمة Translate إلى **الترجمة الآلية العصبية من Google (GNMT)**، نهج مبني على شبكات عصبية عميقة تعالج جملاً كاملة دفعة واحدة بدلاً من جزء بجزء. كانت القفزة في الجودة كبيرة لدرجة أن باحثي Google أنفسهم وصفوا التحسّن بأنه يعادل عدة سنوات من التقدّم التدريجي للنظام القديم حدثت بين ليلة وضحاها. أصبحت الترجمات أكثر سلاسة وأفضل في التعامل مع السياق وترتيب الكلمات والتعابير الاصطلاحية.

هذا التحوّل — من الأساليب الإحصائية القائمة على العبارات إلى شبكات عصبية شاملة تقرأ جملاً كاملة — جزء من الموجة الأوسع نفسها التي أدت إلى معمارية Transformer القائمة على الانتباه التي تعلّمتها للتو (وُرقة Transformer الأصلية نفسها صيغت حول تحسين الترجمة الآلية). إنه مثال واضح يومي على كيف ترجم التحوّل من تقنيات NLP القديمة إلى الأساليب العصبية العميقة مباشرة إلى تجربة أفضل لمئات ملايين المستخدمين اليوميين، بين ليلة وضحاها تقريباً.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is tokenization?", ar: "ما هو الترميز (tokenization)؟" },
          choices: [
            { en: "Breaking text into pieces (tokens) the model can process", ar: "تقسيم النص إلى قطع (رموز) يعالجها النموذج" },
            { en: "Encrypting the text", ar: "تشفير النص" },
            { en: "Translating to another language", ar: "الترجمة إلى لغة أخرى" },
          ],
          answer: 0,
          explain: {
            en: "Tokenization splits input into words/word-parts — the first step before turning them into numbers (embeddings).",
            ar: "الترميز يقسّم المدخل إلى كلمات/أجزاء كلمات — الخطوة الأولى قبل تحويلها إلى أرقام (embeddings).",
          },
        },
        {
          q: { en: "What is an embedding?", ar: "ما هو الـ embedding؟" },
          choices: [
            { en: "A vector of numbers that captures a word's meaning", ar: "متجه أرقام يلتقط معنى الكلمة" },
            { en: "A type of database", ar: "نوع قاعدة بيانات" },
            { en: "A password", ar: "كلمة مرور" },
          ],
          answer: 0,
          explain: {
            en: "Embeddings map words to vectors so similar meanings sit close together — meaning becomes geometry the model can compute on.",
            ar: "الـ embeddings تحوّل الكلمات إلى متجهات فتقترب المعاني المتشابهة — المعنى يصبح هندسة يحسب عليها النموذج.",
          },
        },
        {
          q: { en: "At its core, what is an LLM like GPT doing?", ar: "في جوهره، ماذا يفعل LLM مثل GPT؟" },
          choices: [
            { en: "Predicting the next token, over and over", ar: "التنبؤ بالرمز التالي، مراراً وتكراراً" },
            { en: "Searching Google", ar: "البحث في قوقل" },
            { en: "Storing every answer in a database", ar: "تخزين كل إجابة في قاعدة بيانات" },
          ],
          answer: 0,
          explain: {
            en: "It's a next-token predictor trained at massive scale. Generating an answer is just predicting one plausible word after another.",
            ar: "إنه متنبّئ بالرمز التالي دُرّب على نطاق هائل. توليد الإجابة مجرد تنبؤ بكلمة معقولة تلو الأخرى.",
          },
        },
        {
          q: { en: "What is a 'hallucination'?", ar: "ما هي 'الهلوسة'؟" },
          choices: [
            { en: "When the model confidently states something false", ar: "حين يذكر النموذج بثقة شيئاً خاطئاً" },
            { en: "A network error", ar: "خطأ شبكة" },
            { en: "A special fast mode", ar: "وضع سريع خاص" },
          ],
          answer: 0,
          explain: {
            en: "LLMs optimize for plausible-sounding text, not truth, so they can invent confident-but-wrong facts. Always verify.",
            ar: "نماذج LLM تحسّن للنص المعقول، لا للحقيقة، فقد تخترع حقائق واثقة لكن خاطئة. تحقّق دائماً.",
          },
        },
        {
          q: { en: "What does 'attention' let a Transformer model do?", ar: "ماذا يتيح 'الانتباه' لنموذج Transformer؟" },
          choices: [
            { en: "Weigh how much every other word in the sentence matters, all at once", ar: "ترجيح مدى أهمية كل كلمة أخرى في الجملة، دفعة واحدة" },
            { en: "Only look at the very next word", ar: "النظر فقط إلى الكلمة التالية مباشرة" },
            { en: "Delete unimportant words from the input", ar: "حذف الكلمات غير المهمة من المدخل" },
          ],
          answer: 0,
          explain: {
            en: "Attention lets every word look at every other word simultaneously and assign weights — e.g. resolving 'it' by attending back to the correct noun.",
            ar: "الانتباه يتيح لكل كلمة النظر إلى كل كلمة أخرى في آن واحد وإعطاءها أوزاناً — مثل تحديد مرجع 'ها' بالانتباه للاسم الصحيح.",
          },
        },
        {
          q: { en: "Why can Transformers train faster than older word-by-word models?", ar: "لماذا تتدرّب Transformers أسرع من النماذج القديمة كلمة بكلمة؟" },
          choices: [
            { en: "Attention lets a GPU process an entire sentence's relationships in parallel instead of one word at a time", ar: "الانتباه يتيح لـ GPU معالجة علاقات جملة كاملة بالتوازي بدلاً من كلمة واحدة في كل مرة" },
            { en: "They use fewer words in training data", ar: "تستخدم كلمات أقل في بيانات التدريب" },
            { en: "They skip the tokenization step entirely", ar: "تتخطى خطوة الترميز كلياً" },
          ],
          answer: 0,
          explain: {
            en: "Parallel attention computation across a whole sentence (versus strict sequential processing) is a major reason Transformers scale so well.",
            ar: "حساب الانتباه بالتوازي عبر جملة كاملة (مقابل المعالجة التسلسلية الصارمة) سبب رئيسي في قابلية توسّع Transformers جيداً.",
          },
        },
        {
          q: { en: "What changed when Google Translate switched to neural machine translation in 2016?", ar: "ما الذي تغيّر حين تحوّل Google Translate للترجمة الآلية العصبية عام 2016؟" },
          choices: [
            { en: "Whole sentences were translated by deep neural networks, producing a large jump in fluency over the old phrase-based system", ar: "تُرجمت جمل كاملة بشبكات عصبية عميقة، ما أنتج قفزة كبيرة في السلاسة مقارنة بالنظام القديم القائم على العبارات" },
            { en: "Translation became slower but more secure", ar: "أصبحت الترجمة أبطأ لكن أكثر أماناً" },
            { en: "Google Translate stopped supporting most languages", ar: "توقف Google Translate عن دعم معظم اللغات" },
          ],
          answer: 0,
          explain: {
            en: "GNMT replaced phrase-by-phrase statistical translation with neural networks reading whole sentences, a quality jump Google likened to years of incremental progress happening at once.",
            ar: "استبدل GNMT الترجمة الإحصائية عبارة بعبارة بشبكات عصبية تقرأ جملاً كاملة، وهي قفزة جودة شبّهتها Google بسنوات من التقدّم التدريجي تحدث دفعة واحدة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- NLP turns language into numbers: tokenize → embed → model
- Embeddings put meaning into vector space (king − man + woman ≈ queen)
- LLMs are giant next-token predictors; watch for hallucinations
- Attention lets Transformers weigh every word against every other word at once, resolving context and enabling fast, parallel training
- You built a real tokenizer + word counter, and a simple next-word predictor
- Case study: Google Translate's 2016 switch to neural machine translation showed this shift's real-world impact overnight

**Next:** Computer Vision — teaching machines to *see*.`,
        ar: `## الخلاصة

- معالجة اللغة تحوّل اللغة إلى أرقام: ترميز ← تضمين ← نموذج
- الـ embeddings تضع المعنى في فضاء المتجهات (king − man + woman ≈ queen)
- نماذج LLM متنبّئات عملاقة بالرمز التالي؛ احذر الهلوسة
- الانتباه يتيح لـ Transformers ترجيح كل كلمة مقابل كل كلمة أخرى دفعة واحدة، لحلّ السياق وتمكين تدريب متوازٍ سريع
- بنيت مُرمِّزاً + عدّاد كلمات حقيقياً، ومتنبّئ كلمة تالية بسيطاً
- دراسة الحالة: تحوّل Google Translate للترجمة العصبية عام 2016 أظهر أثر هذا التحوّل الواقعي بين ليلة وضحاها

**التالي:** الرؤية الحاسوبية — تعليم الآلات أن *ترى*.`,
      },
    },
  ],
};
