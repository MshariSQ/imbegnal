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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Neural networks = layers of simple neurons (weighted sum + activation)
- "Deep" = many layers; early layers learn simple features, later layers learn concepts
- Learning = forward pass + backpropagation (gradient descent)
- You implemented a working neuron

**Next:** NLP & LLMs — how machines understand language, the tech behind ChatGPT.`,
        ar: `## الخلاصة

- الشبكات العصبية = طبقات من خلايا بسيطة (مجموع مرجّح + تفعيل)
- "عميق" = طبقات كثيرة؛ الأولى تتعلّم سمات بسيطة، والمتأخرة تتعلّم مفاهيم
- التعلّم = تمرير أمامي + انتشار خلفي (انحدار تدريجي)
- نفّذت خلية عصبية عاملة

**التالي:** معالجة اللغة الطبيعية وLLMs — كيف تفهم الآلات اللغة، التقنية خلف ChatGPT.`,
      },
    },
  ],
};
