import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "setup",
  title: { en: "Setup & Prerequisites — Your First Notebook", ar: "الإعداد والمتطلبات — دفترك الأول" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll set up

Before your first model, you need a kitchen to cook in. In this lesson you will:

1. Install a **code editor** (VS Code) — for reading and writing AI code
2. Install **Python** on your machine — the language of every lesson ahead
3. Get a real **AI notebook** running — the fastest way possible, using Google Colab (or Anaconda if you prefer to work offline)
4. Create free accounts on **Kaggle** and **Hugging Face** — the two communities you'll return to constantly
5. Run and check a real script — your first working result today

No GPU, no expensive laptop, no prior experience needed. Let's go.`,
        ar: `## ما الذي ستجهّزه

قبل أول نموذج لك، تحتاج مطبخاً تطبخ فيه. في هذا الدرس ستقوم بـ:

1. تثبيت **محرر أكواد** (VS Code) — لقراءة وكتابة كود الذكاء الاصطناعي
2. تثبيت **بايثون** على جهازك — لغة كل درس قادم
3. تشغيل **دفتر ذكاء اصطناعي** حقيقي — بأسرع طريقة ممكنة، عبر Google Colab (أو Anaconda إن فضّلت العمل دون اتصال)
4. إنشاء حسابين مجانيين في **Kaggle** و**Hugging Face** — المجتمعان اللذان ستعود إليهما باستمرار
5. تشغيل سكربت حقيقي والتحقق منه — أول نتيجة عملية لك اليوم

بلا حاجة لمعالج رسومي، ولا حاسوب باهظ، ولا خبرة سابقة. لنبدأ.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A kitchen, not just a recipe 🍳

AI work looks different from regular programming in one big way: you write code in **notebooks**, not plain scripts. A notebook is a document made of **cells** — you write a bit of code in one cell, run just that cell, and see its output *immediately* right below it, before moving to the next. This "run one small piece, see the result, then continue" rhythm is exactly why AI work feels so hands-on — and it's also exactly the loop this whole roadmap uses.

Three things make up your kitchen:

- **A code editor** (VS Code) — for writing and reading code with helpful autocomplete and color-highlighting.
- **Python** — installed on your actual machine, the language behind NumPy, pandas, scikit-learn, PyTorch, and everything else you'll touch.
- **A notebook environment** — where you'll actually run AI code, cell by cell. You have two options, and you don't have to choose forever:
  - **Google Colab** — opens in your browser, needs zero installation, and gives you a **free GPU** (the special hardware that makes training models fast) — the easiest way to start today.
  - **Anaconda** — installs Python + Jupyter Notebooks + the core AI libraries (NumPy, pandas, scikit-learn, matplotlib) together on your own machine, for when you want to work offline.

Most beginners start with Colab (nothing to install, instant results) and move to a local setup later once they're hooked.`,
        ar: `## مطبخ، لا مجرد وصفة 🍳

عمل الذكاء الاصطناعي يختلف عن البرمجة العادية بشيء كبير: تكتب الكود في **دفاتر (notebooks)**، لا سكربتات عادية. الدفتر مستند مكوّن من **خلايا (cells)** — تكتب قليلاً من الكود في خلية، تشغّل تلك الخلية فقط، وترى ناتجها *فوراً* أسفلها مباشرة، قبل الانتقال للتالية. إيقاع "شغّل قطعة صغيرة، شاهد النتيجة، ثم تابع" هذا هو بالضبط ما يجعل عمل الذكاء الاصطناعي عملياً جداً — وهو بالضبط الحلقة التي يستخدمها هذا المسار كله.

ثلاثة أشياء تُشكّل مطبخك:

- **محرر أكواد** (VS Code) — لكتابة وقراءة الكود مع إكمال تلقائي مفيد وتلوين.
- **بايثون** — مثبَّت على جهازك الفعلي، اللغة خلف NumPy وpandas وscikit-learn وPyTorch وكل ما ستلمسه.
- **بيئة دفاتر** — حيث ستشغّل كود الذكاء الاصطناعي فعلياً، خلية بخلية. لديك خياران، ولست مضطراً للاختيار نهائياً:
  - **Google Colab** — يفتح في متصفحك، بلا حاجة لأي تثبيت، ويمنحك **معالج رسومي مجاني (GPU)** (العتاد الخاص الذي يجعل تدريب النماذج سريعاً) — أسهل طريقة للبدء اليوم.
  - **Anaconda** — يثبّت بايثون + دفاتر Jupyter + مكتبات الذكاء الأساسية (NumPy، pandas، scikit-learn، matplotlib) معاً على جهازك، لوقت تريد فيه العمل دون اتصال.

معظم المبتدئين يبدؤون بـ Colab (لا شيء لتثبيته، نتائج فورية) وينتقلون لإعداد محلي لاحقاً بعد أن يتحمّسوا.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Step 1 — Install a code editor

Download and install **[Visual Studio Code](https://code.visualstudio.com/download)** — free, for Windows, macOS, and Linux.

1. Click the link, download the installer for your OS, run it, accept the defaults
2. Open VS Code once installed
3. From the Extensions panel (the icon with four squares on the left sidebar), search for and install the **"Python"** extension and the **"Jupyter"** extension — these let VS Code run notebooks directly, if you ever prefer that over Colab

You now have a real AI development setup.`,
        ar: `## الخطوة 1 — ثبّت محرر أكواد

نزّل وثبّت **[Visual Studio Code](https://code.visualstudio.com/download)** — مجاني، لـ Windows وmacOS وLinux.

1. اضغط الرابط، نزّل المثبّت المناسب لنظامك، شغّله، اقبل الإعدادات الافتراضية
2. افتح VS Code بعد التثبيت
3. من لوحة الإضافات (الأيقونة ذات المربعات الأربعة في الشريط الجانبي الأيسر)، ابحث وثبّت إضافة **"Python"** وإضافة **"Jupyter"** — تتيحان لـ VS Code تشغيل الدفاتر مباشرة، إن فضّلت ذلك يوماً بدل Colab

الآن لديك إعداد تطوير ذكاء اصطناعي حقيقي.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Step 2 — Install Python on your machine

Go to **[python.org/downloads](https://www.python.org/downloads/)** and download the latest version.

⚠️ **On Windows:** tick **"Add python.exe to PATH"** on the installer's first screen *before* clicking Install.

Confirm it worked — open a terminal and type:

\`\`\`
python --version
\`\`\`

Seeing \`Python 3.12.x\` (or similar) means you're ready.`,
        ar: `## الخطوة 2 — ثبّت بايثون على جهازك

اذهب إلى **[python.org/downloads](https://www.python.org/downloads/)** ونزّل أحدث إصدار.

⚠️ **على ويندوز:** فعّل **"Add python.exe to PATH"** في الشاشة الأولى للمثبّت *قبل* الضغط على Install.

تأكّد أنه نجح — افتح طرفية واكتب:

\`\`\`
python --version
\`\`\`

ظهور \`Python 3.12.x\` (أو ما شابه) يعني أنك جاهز.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Step 3 — Run your first notebook

**The fast way (recommended to start):**

1. Go to **[colab.research.google.com](https://colab.research.google.com/)** and sign in with any Google account
2. Click **New notebook**
3. Click into the first cell, type \`print("Hello, AI")\`, then press **Shift + Enter** to run it
4. Watch the output appear right below the cell — that's the notebook rhythm you'll use constantly

That's it — you have a free GPU-backed AI environment with nothing installed.

**The offline way (optional, for later):** download **[Anaconda](https://www.anaconda.com/download)**, install it, then open "Jupyter Notebook" from your Start Menu / Applications — it bundles Python with NumPy, pandas, scikit-learn, and matplotlib already included.`,
        ar: `## الخطوة 3 — شغّل دفترك الأول

**الطريقة السريعة (مُوصى بها للبدء):**

1. اذهب إلى **[colab.research.google.com](https://colab.research.google.com/)** وسجّل الدخول بأي حساب Google
2. اضغط **New notebook**
3. اضغط داخل الخلية الأولى، اكتب \`print("Hello, AI")\`، ثم اضغط **Shift + Enter** لتشغيلها
4. شاهد الناتج يظهر مباشرة أسفل الخلية — هذا إيقاع الدفاتر الذي ستستخدمه باستمرار

هذا كل شيء — لديك بيئة ذكاء اصطناعي بمعالج رسومي مجاني دون تثبيت أي شيء.

**الطريقة دون اتصال (اختيارية، لوقت لاحق):** نزّل **[Anaconda](https://www.anaconda.com/download)**، ثبّته، ثم افتح "Jupyter Notebook" من قائمة ابدأ / التطبيقات — يأتي ببايثون مع NumPy وpandas وscikit-learn وmatplotlib مثبّتة مسبقاً.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Step 4 (optional but recommended) — Join the community

Two free accounts you'll use throughout this roadmap and beyond:

- **[Kaggle](https://www.kaggle.com/)** — free datasets, competitions, and free notebook compute (you'll use it heavily in the Machine Learning and Generative AI lessons)
- **[Hugging Face](https://huggingface.co/)** — the world's library of pre-trained AI models you can try or build on directly, no training required

Create both now — free, two minutes each.`,
        ar: `## الخطوة 4 (اختيارية لكن مُوصى بها) — انضم للمجتمع

حسابان مجانيان ستستخدمهما طوال هذا المسار وما بعده:

- **[Kaggle](https://www.kaggle.com/)** — بيانات مجانية، مسابقات، وحوسبة دفاتر مجانية (ستستخدمه بكثرة في درسي تعلّم الآلة والذكاء التوليدي)
- **[Hugging Face](https://huggingface.co/)** — مكتبة العالم من نماذج الذكاء المُدرَّبة مسبقاً، تجرّبها أو تبني عليها مباشرة، دون تدريب

أنشئ الحسابين الآن — مجانيان، دقيقتان لكل منهما.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `**Prove your setup works.** This runs right here in your browser — a preview of the notebook rhythm you just set up.

A model was tested 3 times with accuracy scores \`[0.91, 0.88, 0.95]\`. Write code that:
1. Stores the scores in a list called \`scores\`
2. Computes their average into a variable called \`avg\`
3. Prints \`"Average accuracy: <avg>"\`

This is your first checked, working AI-flavored result — small, but real.`,
        ar: `**أثبِت أن إعدادك يعمل.** هذا يعمل هنا مباشرة في متصفحك — معاينة لإيقاع الدفاتر الذي جهّزته للتو.

اختُبر نموذج 3 مرات بدرجات دقة \`[0.91, 0.88, 0.95]\`. اكتب كوداً:
1. يخزّن الدرجات في قائمة اسمها \`scores\`
2. يحسب متوسطها في متغير اسمه \`avg\`
3. يطبع \`"Average accuracy: <avg>"\`

هذه أول نتيجة حقيقية مُصحَّحة بنكهة الذكاء الاصطناعي — صغيرة، لكنها حقيقية.`,
      },
      starterCode: `scores = [0.91, 0.88, 0.95]

# compute avg and print "Average accuracy: <avg>"
`,
      solution: `scores = [0.91, 0.88, 0.95]
avg = sum(scores) / len(scores)

print("Average accuracy: " + str(avg))`,
      hints: [
        { en: `avg = sum(scores) / len(scores)`, ar: `avg = sum(scores) / len(scores)` },
        { en: `Print with: print("Average accuracy: " + str(avg))`, ar: `اطبع بـ: print("Average accuracy: " + str(avg))` },
      ],
      tests: [
        { name: { en: "scores has 3 values", ar: "scores فيها 3 قيم" }, check: `assert scores == [0.91, 0.88, 0.95]` },
        { name: { en: "avg is computed correctly", ar: "avg محسوبة بشكل صحيح" }, check: `assert abs(avg - 0.9133333333333333) < 0.001` },
        { name: { en: "The result was printed", ar: "طُبعت النتيجة" }, check: `assert "Average accuracy" in _stdout` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What makes a notebook different from a plain script?", ar: "ما الذي يميّز الدفتر عن السكربت العادي؟" },
          choices: [
            { en: "You run small cells one at a time and see each result immediately", ar: "تشغّل خلايا صغيرة واحدة تلو الأخرى وترى كل نتيجة فوراً" },
            { en: "Notebooks can't use Python", ar: "الدفاتر لا تستطيع استخدام بايثون" },
            { en: "Notebooks run automatically without any code", ar: "الدفاتر تعمل تلقائياً بلا أي كود" },
          ],
          answer: 0,
          explain: {
            en: "The cell-by-cell rhythm — write a bit, run it, see the output, continue — is exactly why AI work feels iterative and hands-on.",
            ar: "إيقاع خلية بخلية — اكتب قليلاً، شغّله، شاهد الناتج، تابع — هو بالضبط ما يجعل عمل الذكاء الاصطناعي تكرارياً وعملياً.",
          },
        },
        {
          q: { en: "Why do many AI beginners start with Google Colab?", ar: "لماذا يبدأ كثير من مبتدئي الذكاء الاصطناعي بـ Google Colab؟" },
          choices: [
            { en: "It needs zero installation and includes a free GPU", ar: "لا يحتاج أي تثبيت ويتضمن معالجاً رسومياً مجانياً" },
            { en: "It's the only way to write Python", ar: "إنه الطريقة الوحيدة لكتابة بايثون" },
            { en: "It replaces the need to learn AI concepts", ar: "يُغني عن تعلّم مفاهيم الذكاء الاصطناعي" },
          ],
          answer: 0,
          explain: {
            en: "Colab opens in the browser with nothing to install and gives free access to a GPU — the fastest path to a first working result.",
            ar: "Colab يفتح في المتصفح دون أي تثبيت ويمنح وصولاً مجانياً لمعالج رسومي — أسرع طريق لأول نتيجة عملية.",
          },
        },
        {
          q: { en: "What does Anaconda bundle together?", ar: "ماذا يجمع Anaconda معاً؟" },
          choices: [
            { en: "Python, Jupyter Notebooks, and core AI libraries in one installer", ar: "بايثون ودفاتر Jupyter ومكتبات الذكاء الأساسية في مثبّت واحد" },
            { en: "Only a code editor", ar: "محرر أكواد فقط" },
            { en: "A cloud GPU subscription", ar: "اشتراك معالج رسومي سحابي" },
          ],
          answer: 0,
          explain: {
            en: "One installer gives you Python + Jupyter + NumPy/pandas/scikit-learn/matplotlib — ideal for working offline.",
            ar: "مثبّت واحد يمنحك بايثون + Jupyter + NumPy/pandas/scikit-learn/matplotlib — مثالي للعمل دون اتصال.",
          },
        },
        {
          q: { en: "What is Hugging Face mainly used for?", ar: "لماذا يُستخدم Hugging Face أساساً؟" },
          choices: [
            { en: "A library of pre-trained AI models you can use or build on", ar: "مكتبة نماذج ذكاء مُدرَّبة مسبقاً يمكنك استخدامها أو البناء عليها" },
            { en: "Writing code in VS Code", ar: "كتابة الكود في VS Code" },
            { en: "Installing Python", ar: "تثبيت بايثون" },
          ],
          answer: 0,
          explain: {
            en: "Hugging Face hosts thousands of ready-to-use models — you'll return to it heavily in the NLP and Generative AI lessons.",
            ar: "يستضيف Hugging Face آلاف النماذج الجاهزة للاستخدام — ستعود إليه كثيراً في درسي معالجة اللغة والذكاء التوليدي.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## You're ready ✅

Your checklist:

- [x] Code editor installed (VS Code + Python/Jupyter extensions)
- [x] Python installed on your machine
- [x] A real notebook running (Google Colab or Anaconda)
- [x] Kaggle and Hugging Face accounts created
- [x] Your first working, checked script ran successfully

**Next up: Python for AI** — turning that same notebook rhythm toward NumPy, pandas, and real data.`,
        ar: `## أنت جاهز ✅

قائمتك:

- [x] محرر الأكواد مثبَّت (VS Code + إضافتا Python/Jupyter)
- [x] بايثون مثبَّت على جهازك
- [x] دفتر حقيقي يعمل (Google Colab أو Anaconda)
- [x] حسابا Kaggle وHugging Face جاهزان
- [x] أول سكربت حقيقي مُصحَّح عمل بنجاح

**التالي: بايثون للذكاء الاصطناعي** — توجيه نفس إيقاع الدفاتر نحو NumPy وpandas وبيانات حقيقية.`,
      },
    },
  ],
};
