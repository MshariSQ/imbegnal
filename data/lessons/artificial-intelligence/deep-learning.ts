import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "deep-learning",
  title: { en: "Deep Learning — Neural Networks", ar: "التعلّم العميق — الشبكات العصبية" },
  estMinutes: 35,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What a **neural network** is, using the brain analogy
- Neurons, layers, and why "deep"
- How networks learn (forward + backward)
- You'll implement a single neuron`,
        ar: `## ماذا ستتعلم

- ما هي **الشبكة العصبية**، بتشبيه الدماغ
- الخلايا العصبية، الطبقات، ولماذا "عميق"
- كيف تتعلّم الشبكات (أماماً + خلفاً)
- ستنفّذ خلية عصبية واحدة`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A team of tiny decision-makers 🧠

The human brain has billions of **neurons**, each doing one tiny thing, connected into a network that produces intelligence. **Deep learning** copies this idea in software.

An **artificial neuron** is simple. It:
1. Takes several inputs (numbers),
2. Multiplies each by a **weight** (importance — remember the weighted sum!),
3. Adds them up,
4. Passes the result through an **activation function** that decides "should I fire, and how strongly?"

One neuron is weak. But stack them in **layers** — the outputs of one layer feed the next — and something magical happens:
- The **first** layers learn simple things (edges in an image).
- **Middle** layers combine those into shapes (an eye, a wheel).
- **Later** layers combine those into concepts (a face, a car).

"**Deep**" just means *many layers*. More layers = ability to learn more complex patterns. This is why deep learning powers image recognition, voice assistants, and ChatGPT.

**How does it learn?** Two steps repeated millions of times:
1. **Forward pass** — push an example through the network, get a prediction.
2. **Backpropagation** — measure the error, then walk *backward* adjusting every weight a tiny bit to reduce that error (gradient descent again!).

Do that over huge datasets and the network gradually tunes millions of weights until its predictions are astonishingly good. You'll almost always use libraries like **PyTorch** or **TensorFlow** that handle the math — your job is designing and training, not doing calculus by hand.`,
        ar: `## فريق من صنّاع قرار صغار 🧠

الدماغ البشري فيه مليارات **الخلايا العصبية**، كل واحدة تؤدي شيئاً صغيراً، متصلة في شبكة تنتج الذكاء. **التعلّم العميق** ينسخ هذه الفكرة برمجياً.

**الخلية العصبية الاصطناعية** بسيطة. هي:
1. تأخذ عدة مدخلات (أرقام)،
2. تضرب كلاً بـ**وزن** (الأهمية — تذكّر المجموع المرجّح!)،
3. تجمعها،
4. تمرّر النتيجة عبر **دالة تفعيل (activation)** تقرّر "هل أُطلق، وبأي قوة؟"

الخلية الواحدة ضعيفة. لكن كدّسها في **طبقات** — مخرجات طبقة تغذّي التالية — فيحدث شيء ساحر:
- الطبقات **الأولى** تتعلّم أشياء بسيطة (الحواف في صورة).
- الطبقات **الوسطى** تجمعها في أشكال (عين، عجلة).
- الطبقات **المتأخرة** تجمعها في مفاهيم (وجه، سيارة).

"**عميق**" تعني ببساطة *طبقات كثيرة*. طبقات أكثر = قدرة على تعلّم أنماط أعقد. لهذا يشغّل التعلّم العميق التعرّف على الصور والمساعدات الصوتية وChatGPT.

**كيف يتعلّم؟** خطوتان تتكرران ملايين المرات:
1. **التمرير الأمامي** — ادفع مثالاً عبر الشبكة، احصل على تنبؤ.
2. **الانتشار الخلفي (Backpropagation)** — قِس الخطأ، ثم امشِ *خلفاً* معدّلاً كل وزن قليلاً لتقليل ذلك الخطأ (الانحدار التدريجي مجدداً!).

افعل ذلك على بيانات ضخمة فتضبط الشبكة تدريجياً ملايين الأوزان حتى تصبح تنبؤاتها مذهلة الدقة. ستستخدم دائماً تقريباً مكتبات مثل **PyTorch** أو **TensorFlow** تتولى الرياضيات — مهمتك التصميم والتدريب، لا حساب التفاضل يدوياً.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Implement one neuron. Write \`neuron(inputs, weights, bias)\` that:
1. Computes the weighted sum of inputs × weights
2. Adds the bias
3. Applies a simple activation: return \`1\` if the total is > 0, else \`0\` (a "step" activation)

Example: inputs \`[1, 1]\`, weights \`[0.5, 0.5]\`, bias \`-0.7\` → sum = 0.3 > 0 → \`1\``,
        ar: `نفّذ خلية عصبية واحدة. اكتب \`neuron(inputs, weights, bias)\`:
1. تحسب المجموع المرجّح inputs × weights
2. تضيف الانحياز (bias)
3. تطبّق تفعيلاً بسيطاً: أعِد \`1\` إذا كان المجموع > 0، وإلا \`0\` (تفعيل "خطوة")

مثال: inputs \`[1, 1]\`، weights \`[0.5, 0.5]\`، bias \`-0.7\` ← المجموع = 0.3 > 0 ← \`1\``,
      },
      starterCode: `def neuron(inputs, weights, bias):
    total = bias
    # add each input * weight to total
    # return 1 if total > 0 else 0
    pass

print(neuron([1, 1], [0.5, 0.5], -0.7))  # 1
print(neuron([0, 0], [0.5, 0.5], -0.7))  # 0`,
      solution: `def neuron(inputs, weights, bias):
    total = bias
    for i, w in zip(inputs, weights):
        total += i * w
    return 1 if total > 0 else 0

print(neuron([1, 1], [0.5, 0.5], -0.7))  # 1
print(neuron([0, 0], [0.5, 0.5], -0.7))  # 0`,
      hints: [
        { en: `Start total at bias, then add i*w for each pair via zip(inputs, weights).`, ar: `ابدأ total من bias، ثم أضف i*w لكل زوج عبر zip(inputs, weights).` },
        { en: `Final line: return 1 if total > 0 else 0`, ar: `السطر الأخير: return 1 if total > 0 else 0` },
      ],
      tests: [
        { name: { en: "Fires (1) when sum > 0", ar: "يُطلق (1) عندما المجموع > 0" }, check: `assert neuron([1,1],[0.5,0.5],-0.7) == 1` },
        { name: { en: "Stays 0 when sum <= 0", ar: "يبقى 0 عندما المجموع <= 0" }, check: `assert neuron([0,0],[0.5,0.5],-0.7) == 0` },
        { name: { en: "Works as an AND gate", ar: "يعمل كبوابة AND" }, check: `assert neuron([1,0],[0.5,0.5],-0.7) == 0` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Activation functions, and the trap of overfitting ⚡

The step activation you just coded (fire 1 or 0) is the simplest possible activation, but real networks almost always use smoother ones:

- **ReLU** (Rectified Linear Unit): \`max(0, x)\` — output the input unchanged if positive, otherwise 0. Dead simple, cheap to compute, and the most common activation in modern hidden layers.
- **Sigmoid**: squashes any number into a range between 0 and 1 — handy for outputs that represent a probability.
- **Softmax**: turns a list of raw scores into probabilities that all add up to 1 — used for "which of these 10 categories is this?" type outputs.

Without a nonlinear activation function like these, stacking layers would be pointless — a stack of purely linear steps collapses mathematically into a single linear step, no matter how many layers you add. The nonlinearity is what lets deep networks bend and curve to fit complex patterns instead of just straight lines.

**The trap: overfitting.** A large network with millions of weights is powerful enough to simply *memorize* every training example, including its noise and quirks, rather than learning the general pattern. The symptom is a model that scores nearly perfectly on training data but performs poorly on new, unseen data. Common fixes:

- **More training data** — harder to memorize, easier to generalize.
- **Dropout** — randomly "switch off" some neurons during training so the network can't over-rely on any single one.
- **Early stopping** — stop training once performance on held-out validation data stops improving, even if training accuracy keeps climbing.

A model that aces its training set but flops in the real world hasn't actually learned — it's cheated by memorizing the answer key.`,
        ar: `## دوال التفعيل، وفخ الإفراط في المطابقة ⚡

تفعيل الخطوة الذي برمجته للتو (أُطلق 1 أو 0) أبسط تفعيل ممكن، لكن الشبكات الحقيقية تستخدم غالباً تفعيلات أنعم:

- **ReLU** (وحدة الخطي المُقوَّم): \`max(0, x)\` — أخرج المدخل كما هو إن كان موجباً، وإلا 0. بسيط جداً، رخيص الحساب، وأشيع تفعيل في الطبقات الخفية الحديثة.
- **Sigmoid**: يضغط أي رقم إلى نطاق بين 0 و1 — مفيد لمخرجات تمثّل احتمالاً.
- **Softmax**: يحوّل قائمة درجات خام إلى احتمالات يجمع مجموعها 1 — يُستخدم لمخرجات نوع "أي هذه الفئات العشر هذا؟"

بدون دالة تفعيل غير خطية كهذه، تكديس الطبقات عديم الجدوى — كومة من خطوات خطية بحتة تنهار رياضياً إلى خطوة خطية واحدة، مهما أضفت طبقات. اللاخطية هي ما يتيح للشبكات العميقة الانحناء والالتواء لتطابق أنماطاً معقدة بدلاً من خطوط مستقيمة فقط.

**الفخ: الإفراط في المطابقة (overfitting).** شبكة كبيرة بملايين الأوزان قوية بما يكفي لتحفظ ببساطة كل مثال تدريبي، بما في ذلك ضوضاؤه وشوائبه، بدلاً من تعلّم النمط العام. العرض هو نموذج يسجّل شبه كمال على بيانات التدريب لكن يؤدي ضعيفاً على بيانات جديدة لم يرها. الحلول الشائعة:

- **بيانات تدريب أكثر** — يصعب حفظها، ويسهل التعميم منها.
- **Dropout** — "أطفئ" عشوائياً بعض الخلايا أثناء التدريب حتى لا تعتمد الشبكة كثيراً على خلية واحدة.
- **التوقف المبكر (Early stopping)** — أوقف التدريب حين يتوقف الأداء على بيانات تحقق منفصلة عن التحسّن، حتى لو استمرت دقة التدريب بالارتفاع.

نموذج يتفوّق في مجموعة تدريبه لكن يفشل في العالم الحقيقي لم يتعلّم فعلاً — بل غشّ بحفظ ورقة الإجابة.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Implement the most common activation function in deep learning: **ReLU**. Write \`relu(x)\` that returns \`x\` if \`x > 0\`, otherwise returns \`0\`.

Then write \`relu_layer(values)\` that applies \`relu\` to every number in a list (a whole layer's outputs at once).`,
        ar: `نفّذ أشيع دالة تفعيل في التعلّم العميق: **ReLU**. اكتب \`relu(x)\` تعيد \`x\` إذا كان \`x > 0\`، وإلا تعيد \`0\`.

ثم اكتب \`relu_layer(values)\` تطبّق \`relu\` على كل رقم في قائمة (مخرجات طبقة كاملة دفعة واحدة).`,
      },
      starterCode: `def relu(x):
    # return x if positive, else 0
    pass

def relu_layer(values):
    # apply relu to every value in the list
    return []

print(relu(5))            # 5
print(relu(-3))           # 0
print(relu_layer([-2, 0, 3, -1, 7]))  # [0, 0, 3, 0, 7]`,
      solution: `def relu(x):
    return x if x > 0 else 0

def relu_layer(values):
    return [relu(v) for v in values]

print(relu(5))            # 5
print(relu(-3))           # 0
print(relu_layer([-2, 0, 3, -1, 7]))  # [0, 0, 3, 0, 7]`,
      hints: [
        { en: `relu is one line: return x if x > 0 else 0`, ar: `relu سطر واحد: return x if x > 0 else 0` },
        { en: `relu_layer is a list comprehension: [relu(v) for v in values]`, ar: `relu_layer قائمة استيعابية: [relu(v) for v in values]` },
      ],
      tests: [
        { name: { en: "relu(5) is 5", ar: "relu(5) تساوي 5" }, check: `assert relu(5) == 5` },
        { name: { en: "relu(-3) is 0", ar: "relu(-3) تساوي 0" }, check: `assert relu(-3) == 0` },
        { name: { en: "relu(0) is 0", ar: "relu(0) تساوي 0" }, check: `assert relu(0) == 0` },
        { name: { en: "relu_layer zeroes out negatives only", ar: "relu_layer يصفّر السالب فقط" }, check: `assert relu_layer([-2,0,3,-1,7]) == [0,0,3,0,7]` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: AlphaGo 🔍

For decades, the ancient board game **Go** was considered a grand challenge for AI — far harder for a computer than chess, because the number of possible positions is so vast that brute-force search doesn't work. Experts predicted it would take decades more before a computer could beat a top human player.

In 2016, DeepMind's **AlphaGo** played a five-game match against Lee Sedol, one of the greatest Go players in history — and won four games to one. AlphaGo combined deep neural networks (trained on both human game records and self-play) with a search algorithm, letting it develop an intuition for the game similar in spirit to how the neurons in this lesson combine simple weighted sums into increasingly abstract judgments about "how good is this position?"

One moment from the match became famous: in game two, AlphaGo played a move so unusual that commentators initially thought it was a mistake — it later proved brilliant, a move no human professional would likely have played, showing the network had learned genuinely novel strategic ideas rather than just copying human style.

The result stunned the AI research community and the Go world alike, and is widely seen as a landmark moment showing deep learning could master domains requiring intuition and long-term strategic judgment, not just pattern recognition on static images or text.`,
        ar: `## دراسة حالة واقعية: AlphaGo 🔍

لعقود، اعتُبرت لعبة اللوح القديمة **Go** تحدياً كبيراً للذكاء الاصطناعي — أصعب على الحاسوب بكثير من الشطرنج، لأن عدد المواضع الممكنة هائل جداً لدرجة أن البحث الشامل لا يجدي. توقّع الخبراء أن يستغرق الأمر عقوداً إضافية قبل أن يتغلّب حاسوب على لاعب بشري من القمة.

في 2016، لعبت **AlphaGo** من DeepMind مباراة من خمس جولات ضد Lee Sedol، أحد أعظم لاعبي Go في التاريخ — وفازت بأربع جولات مقابل واحدة. جمعت AlphaGo بين شبكات عصبية عميقة (مدرَّبة على سجلات ألعاب بشرية ولعب ذاتي) وخوارزمية بحث، ما مكّنها من تطوير حدس للعبة يشبه بروحه كيف تجمع الخلايا العصبية في هذا الدرس مجاميع مرجّحة بسيطة في أحكام متزايدة التجريد حول "ما مدى جودة هذا الموضع؟"

اشتهرت لحظة من المباراة: في الجولة الثانية، لعبت AlphaGo نقلة غير اعتيادية لدرجة أن المعلّقين ظنّوها خطأ في البداية — تبيّن لاحقاً أنها عبقرية، نقلة لم يكن ليلعبها أي محترف بشري على الأرجح، ما أظهر أن الشبكة تعلّمت أفكاراً استراتيجية جديدة فعلاً لا مجرد نسخ أسلوب بشري.

صدمت النتيجة مجتمع أبحاث الذكاء الاصطناعي وعالم Go على حدّ سواء، وتُعتبر على نطاق واسع لحظة فارقة أظهرت أن التعلّم العميق يستطيع إتقان مجالات تتطلّب حدساً وحكماً استراتيجياً طويل المدى، لا مجرد التعرّف على أنماط في صور أو نصوص ثابتة.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What does an artificial neuron do?", ar: "ماذا تفعل الخلية العصبية الاصطناعية؟" },
          choices: [
            { en: "Weighted-sums its inputs, then applies an activation function", ar: "تجمع مدخلاتها مرجّحة، ثم تطبّق دالة تفعيل" },
            { en: "Stores files", ar: "تخزّن ملفات" },
            { en: "Sends emails", ar: "ترسل بريداً" },
          ],
          answer: 0,
          explain: {
            en: "Inputs × weights + bias → activation decides the output. Exactly the neuron you just coded.",
            ar: "مدخلات × أوزان + انحياز ← التفعيل يقرّر المخرج. تماماً الخلية التي برمجتها.",
          },
        },
        {
          q: { en: "What does 'deep' in deep learning mean?", ar: "ماذا تعني 'عميق' في التعلّم العميق؟" },
          choices: [
            { en: "Many layers of neurons stacked together", ar: "طبقات كثيرة من الخلايا مكدّسة معاً" },
            { en: "The data is stored deep underground", ar: "البيانات مخزّنة عميقاً تحت الأرض" },
            { en: "It's very difficult", ar: "أنه صعب جداً" },
          ],
          answer: 0,
          explain: {
            en: "Depth = number of layers. Early layers catch simple features; deeper layers combine them into complex concepts.",
            ar: "العمق = عدد الطبقات. الطبقات الأولى تلتقط سمات بسيطة؛ والأعمق تجمعها في مفاهيم معقدة.",
          },
        },
        {
          q: { en: "How does a network reduce its errors?", ar: "كيف تقلّل الشبكة أخطاءها؟" },
          choices: [
            { en: "Backpropagation — adjusting weights backward to lower error", ar: "الانتشار الخلفي — تعديل الأوزان خلفاً لتقليل الخطأ" },
            { en: "By restarting the computer", ar: "بإعادة تشغيل الحاسوب" },
            { en: "It can't reduce errors", ar: "لا تستطيع تقليل الأخطاء" },
          ],
          answer: 0,
          explain: {
            en: "Forward pass predicts; backpropagation measures error and nudges every weight to shrink it — gradient descent at scale.",
            ar: "التمرير الأمامي يتنبأ؛ والانتشار الخلفي يقيس الخطأ ويحرّك كل وزن لتقليصه — انحدار تدريجي على نطاق واسع.",
          },
        },
        {
          q: { en: "Why do neural networks need a nonlinear activation function (like ReLU)?", ar: "لماذا تحتاج الشبكات العصبية دالة تفعيل غير خطية (مثل ReLU)؟" },
          choices: [
            { en: "Without nonlinearity, stacking layers collapses into a single linear step, no matter how many layers", ar: "بدون اللاخطية، تنهار الطبقات المكدّسة إلى خطوة خطية واحدة، مهما بلغ عدد الطبقات" },
            { en: "It makes the code run without errors", ar: "يجعل الكود يعمل بلا أخطاء" },
            { en: "It's only needed for image data", ar: "يُحتاج فقط لبيانات الصور" },
          ],
          answer: 0,
          explain: {
            en: "Nonlinear activations let deep networks bend and curve to fit complex patterns; without them, depth would be mathematically pointless.",
            ar: "التفعيلات اللاخطية تتيح للشبكات العميقة الانحناء لتطابق أنماطاً معقدة؛ بدونها يكون العمق عديم الجدوى رياضياً.",
          },
        },
        {
          q: { en: "What is overfitting?", ar: "ما هو الإفراط في المطابقة (overfitting)؟" },
          choices: [
            { en: "A model memorizes training data quirks instead of learning general patterns, and performs poorly on new data", ar: "نموذج يحفظ خصائص بيانات التدريب العرضية بدلاً من تعلّم أنماط عامة، ويؤدي ضعيفاً على بيانات جديدة" },
            { en: "A model that trains too quickly", ar: "نموذج يتدرّب بسرعة زائدة" },
            { en: "A network with too few neurons", ar: "شبكة بخلايا قليلة جداً" },
          ],
          answer: 0,
          explain: {
            en: "Symptoms: near-perfect training accuracy but weak real-world performance. Fixes include more data, dropout, and early stopping.",
            ar: "الأعراض: دقة تدريب شبه كاملة لكن أداء ضعيف في الواقع. الحلول تشمل بيانات أكثر، وdropout، والتوقف المبكر.",
          },
        },
        {
          q: { en: "What made AlphaGo's 2016 victory over Lee Sedol significant?", ar: "ما الذي جعل فوز AlphaGo على Lee Sedol عام 2016 مهماً؟" },
          choices: [
            { en: "It showed deep learning could master a game requiring intuition and strategy, once thought decades away for AI", ar: "أظهر أن التعلّم العميق يستطيع إتقان لعبة تتطلّب حدساً واستراتيجية، كان يُعتقد أنها بعيدة عقوداً عن الذكاء الاصطناعي" },
            { en: "It was the first computer program to play any game", ar: "كان أول برنامج حاسوبي يلعب أي لعبة" },
            { en: "It proved Go was easier than chess for computers all along", ar: "أثبت أن Go كانت أسهل من الشطرنج على الحواسيب طوال الوقت" },
          ],
          answer: 0,
          explain: {
            en: "Go's vast search space made it a grand AI challenge; AlphaGo's deep-learning-plus-search approach, including genuinely novel moves, was a landmark result.",
            ar: "فضاء بحث Go الهائل جعلها تحدياً كبيراً للذكاء الاصطناعي؛ ونهج AlphaGo (تعلّم عميق مع بحث)، بما في ذلك نقلات جديدة فعلاً، كان نتيجة فارقة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Neural networks = layers of simple neurons (weighted sum + activation)
- "Deep" = many layers; early layers learn simple features, later layers learn concepts
- Learning = forward pass + backpropagation (gradient descent)
- Nonlinear activations (ReLU, sigmoid, softmax) are what let depth matter; overfitting is the trap of memorizing instead of generalizing
- You implemented a working neuron and a ReLU activation layer
- Case study: AlphaGo's 2016 win over Lee Sedol showed deep learning could master intuition-heavy strategic games

**Next:** NLP & LLMs — how machines understand language, the tech behind ChatGPT.`,
        ar: `## الخلاصة

- الشبكات العصبية = طبقات من خلايا بسيطة (مجموع مرجّح + تفعيل)
- "عميق" = طبقات كثيرة؛ الأولى تتعلّم سمات بسيطة، والمتأخرة تتعلّم مفاهيم
- التعلّم = تمرير أمامي + انتشار خلفي (انحدار تدريجي)
- التفعيلات اللاخطية (ReLU وSigmoid وSoftmax) هي ما يجعل العمق مهماً؛ والإفراط في المطابقة فخ حفظ البيانات بدل تعميمها
- نفّذت خلية عصبية عاملة وطبقة تفعيل ReLU
- دراسة الحالة: فوز AlphaGo على Lee Sedol عام 2016 أظهر أن التعلّم العميق يتقن ألعاباً استراتيجية تعتمد الحدس

**التالي:** معالجة اللغة الطبيعية وLLMs — كيف تفهم الآلات اللغة، التقنية خلف ChatGPT.`,
      },
    },
  ],
};
