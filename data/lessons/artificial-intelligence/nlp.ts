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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- NLP turns language into numbers: tokenize → embed → model
- Embeddings put meaning into vector space (king − man + woman ≈ queen)
- LLMs are giant next-token predictors; watch for hallucinations
- You built a real tokenizer + word counter

**Next:** Computer Vision — teaching machines to *see*.`,
        ar: `## الخلاصة

- معالجة اللغة تحوّل اللغة إلى أرقام: ترميز ← تضمين ← نموذج
- الـ embeddings تضع المعنى في فضاء المتجهات (king − man + woman ≈ queen)
- نماذج LLM متنبّئات عملاقة بالرمز التالي؛ احذر الهلوسة
- بنيت مُرمِّزاً + عدّاد كلمات حقيقياً

**التالي:** الرؤية الحاسوبية — تعليم الآلات أن *ترى*.`,
      },
    },
  ],
};
