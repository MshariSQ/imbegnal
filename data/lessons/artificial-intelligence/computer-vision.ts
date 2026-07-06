import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "computer-vision",
  title: { en: "Computer Vision — Teaching Machines to See", ar: "الرؤية الحاسوبية — تعليم الآلات أن ترى" },
  estMinutes: 35,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- How an image is just **numbers** to a computer
- What convolutions detect (edges → shapes → objects)
- Real applications: faces, self-driving, medical scans
- You'll process a mini image grid in code`,
        ar: `## ماذا ستتعلم

- كيف تكون الصورة مجرد **أرقام** للحاسوب
- ماذا تكتشف الالتفافات (convolutions): حواف ← أشكال ← أجسام
- تطبيقات حقيقية: الوجوه، القيادة الذاتية، الأشعة الطبية
- ستعالج شبكة صورة مصغّرة بالكود`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A picture is a spreadsheet of numbers 🖼️

To you, a photo is a beach. To a computer, it's a **grid of numbers** — each pixel is a brightness value (0 = black, 255 = white). A color image is three such grids: Red, Green, Blue. That's it. Every image AI does is math on these number grids.

\`\`\`
A tiny 3×3 grayscale image:
 [ 255, 255, 255 ]      all white row
 [ 0,   0,   0   ]      a black line!
 [ 255, 255, 255 ]      all white row
\`\`\`

See that black row? A computer spots it by noticing where numbers suddenly change — that's an **edge**. This is the key trick of **Convolutional Neural Networks (CNNs)**, the workhorses of computer vision:

- **Early layers** slide small filters over the image to detect **edges** and simple textures.
- **Middle layers** combine edges into **shapes** (a curve, a corner, a circle).
- **Deep layers** combine shapes into **objects** (an eye, then a whole face).

It's the same "simple → complex, layer by layer" idea from the deep learning lesson, applied to pixels.

**Real-world uses you touch daily:**
- **Face unlock** on your phone
- **Self-driving cars** spotting pedestrians and lane lines
- **Medical imaging** flagging tumors in X-rays, sometimes better than humans
- **OCR** turning a photo of text into editable text

The core skills: represent images as arrays (NumPy again), and use CNNs via PyTorch/TensorFlow. Libraries like **OpenCV** handle everyday image operations.`,
        ar: `## الصورة جدول أرقام 🖼️

بالنسبة لك الصورة شاطئ. للحاسوب هي **شبكة أرقام** — كل بكسل قيمة سطوع (0 = أسود، 255 = أبيض). الصورة الملوّنة ثلاث شبكات كهذه: أحمر، أخضر، أزرق. هذا كل شيء. كل ذكاء صور هو رياضيات على شبكات الأرقام هذه.

\`\`\`
صورة رمادية صغيرة 3×3:
 [ 255, 255, 255 ]      صف أبيض كامل
 [ 0,   0,   0   ]      خط أسود!
 [ 255, 255, 255 ]      صف أبيض كامل
\`\`\`

أترى الصف الأسود؟ يكتشفه الحاسوب بملاحظة أين تتغير الأرقام فجأة — تلك **حافة (edge)**. هذه الحيلة الأساسية لـ**الشبكات العصبية الالتفافية (CNNs)**، عمّال الرؤية الحاسوبية:

- **الطبقات الأولى** تُمرّر مرشحات صغيرة على الصورة لكشف **الحواف** والملامس البسيطة.
- **الطبقات الوسطى** تجمع الحواف في **أشكال** (منحنى، زاوية، دائرة).
- **الطبقات العميقة** تجمع الأشكال في **أجسام** (عين، ثم وجه كامل).

إنها نفس فكرة "بسيط ← معقد، طبقة طبقة" من درس التعلّم العميق، مطبّقة على البكسلات.

**استخدامات تلمسها يومياً:**
- **فتح القفل بالوجه** في هاتفك
- **السيارات ذاتية القيادة** ترصد المشاة وخطوط المسار
- **التصوير الطبي** يرصد الأورام في الأشعة، أحياناً أفضل من البشر
- **OCR** يحوّل صورة نص إلى نص قابل للتحرير

المهارات الأساسية: تمثيل الصور كمصفوفات (NumPy مجدداً)، واستخدام CNNs عبر PyTorch/TensorFlow. ومكتبات مثل **OpenCV** تتولى عمليات الصور اليومية.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Process an image like a computer does. An image is a list of rows (each row a list of pixel brightnesses 0–255). Write \`invert(image)\` that returns a **negative** of the image: each pixel becomes \`255 - pixel\`.

This is a real image operation (color inversion).`,
        ar: `عالِج صورة كما يفعل الحاسوب. الصورة قائمة صفوف (كل صف قائمة سطوع بكسلات 0–255). اكتب \`invert(image)\` تعيد **سالب** الصورة: كل بكسل يصبح \`255 - pixel\`.

هذه عملية صور حقيقية (عكس الألوان).`,
      },
      starterCode: `def invert(image):
    # return a new grid where each pixel is 255 - pixel
    result = []
    return result

img = [[0, 255], [128, 100]]
print(invert(img))  # [[255, 0], [127, 155]]`,
      solution: `def invert(image):
    result = []
    for row in image:
        result.append([255 - pixel for pixel in row])
    return result

img = [[0, 255], [128, 100]]
print(invert(img))  # [[255, 0], [127, 155]]`,
      hints: [
        { en: `Loop over each row, then build a new row with [255 - pixel for pixel in row].`, ar: `كرّر على كل صف، ثم ابنِ صفاً جديداً بـ [255 - pixel for pixel in row].` },
        { en: `Append each new row to result.`, ar: `أضف كل صف جديد إلى result.` },
      ],
      tests: [
        { name: { en: "Inverts the example correctly", ar: "يعكس المثال بشكل صحيح" }, check: `assert invert([[0,255],[128,100]]) == [[255,0],[127,155]]` },
        { name: { en: "Black becomes white", ar: "الأسود يصبح أبيض" }, check: `assert invert([[0]]) == [[255]]` },
        { name: { en: "Keeps the grid shape", ar: "يحافظ على شكل الشبكة" }, check: `r = invert([[10,20,30]]); assert len(r) == 1 and len(r[0]) == 3` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Before training: preprocessing and data augmentation 🧹

Raw photos are messy — different sizes, lighting, orientations. Before a CNN ever sees an image, it almost always goes through **preprocessing**:

- **Resizing** every image to the same fixed dimensions (a CNN expects a consistent input shape).
- **Normalizing** pixel values from the 0–255 range down to something like 0–1, which helps training converge faster and more stably.
- **Grayscale or channel adjustments** depending on the task.

Even more important is **data augmentation** — artificially creating more training variety by taking each image and generating slightly altered copies: flipped horizontally, rotated a few degrees, cropped, or brightness-shifted. A photo of a cat flipped left-right is still obviously a cat, but to the network it's a "new" example.

Why bother? Because vision models are notorious for **overfitting** — memorizing quirks of the exact training photos (like always seeing cats photographed indoors) rather than learning the general concept "cat." Augmentation forces the model to focus on the actual object, not incidental details like background, angle, or lighting. It's one of the cheapest, highest-leverage tricks in the entire computer vision toolbox — free extra data from data you already have.`,
        ar: `## قبل التدريب: المعالجة المسبقة وتضخيم البيانات 🧹

الصور الخام فوضوية — أحجام وإضاءات واتجاهات مختلفة. قبل أن ترى شبكة CNN أي صورة، تمرّ غالباً بـ**معالجة مسبقة**:

- **تغيير الحجم** لكل صورة إلى أبعاد ثابتة موحّدة (تتوقّع CNN شكل مدخل ثابتاً).
- **التطبيع (Normalizing)** لقيم البكسلات من نطاق 0–255 إلى شيء كـ 0–1، ما يساعد التدريب على التقارب أسرع وأثبت.
- **تعديلات الرمادي أو القنوات** حسب المهمة.

الأهم هو **تضخيم البيانات (data augmentation)** — خلق تنوّع تدريب إضافي اصطناعياً بأخذ كل صورة وتوليد نسخ معدّلة قليلاً منها: معكوسة أفقياً، مدارة بضع درجات، مقصوصة، أو بإضاءة مختلفة. صورة قطة معكوسة يميناً-يساراً تبقى قطة واضحة، لكن للشبكة هي مثال "جديد".

لماذا العناء؟ لأن نماذج الرؤية سيئة الصيت بـ**الإفراط في المطابقة (overfitting)** — حفظ خصائص الصور التدريبية بالتحديد (مثل رؤية القطط دوماً مصوَّرة داخلياً) بدلاً من تعلّم مفهوم "قطة" العام. التضخيم يجبر النموذج على التركيز على الجسم الفعلي، لا التفاصيل العرضية كالخلفية أو الزاوية أو الإضاءة. إنها من أرخص وأقوى الحيل في صندوق أدوات الرؤية الحاسوبية كله — بيانات إضافية مجانية من بيانات تملكها أصلاً.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the ImageNet moment 🔍

For decades, computer vision progressed slowly with hand-crafted rules ("edges look like this, corners look like that"). Then in 2012, a team entered the **ImageNet** competition — a benchmark of over a million labeled images across 1,000 categories — with a deep CNN called **AlexNet**. It didn't just win; it beat the second-place entry by a stunning margin, roughly halving the error rate of the best traditional approaches.

The result sent a shockwave through the entire field. Researchers who had spent careers hand-designing feature detectors realized that a deep CNN, given enough data (ImageNet) and enough compute (trained on GPUs, which were a relatively new trick for this at the time), could learn better features automatically than humans could design by hand. Within a couple of years, nearly every serious computer vision system had switched to deep learning.

This single competition result is widely credited as a turning point that kicked off the modern deep learning boom — the same core CNN ideas from this lesson (convolutions detecting edges → shapes → objects) scaled up with more data and more layers. It's a vivid reminder that in AI, sometimes the breakthrough isn't a clever new trick, but simply proving that a simple idea works dramatically better once you have enough data and computing power behind it.`,
        ar: `## دراسة حالة واقعية: لحظة ImageNet 🔍

لعقود، تقدّمت الرؤية الحاسوبية ببطء بقواعد مصمَّمة يدوياً ("الحواف تبدو هكذا، الزوايا هكذا"). ثم في 2012، شارك فريق في مسابقة **ImageNet** — معيار من أكثر من مليون صورة موسومة عبر 1000 فئة — بشبكة CNN عميقة تسمى **AlexNet**. لم تفز فقط؛ بل تفوّقت على المركز الثاني بفارق مذهل، وخفّضت تقريباً نسبة خطأ أفضل الأساليب التقليدية إلى النصف.

أحدثت النتيجة صدمة في المجال كله. الباحثون الذين أمضوا مسيرات مهنية في تصميم كاشفات سمات يدوياً أدركوا أن CNN عميقة، بمعطى بيانات كافية (ImageNet) وحوسبة كافية (مدرَّبة على وحدات GPU، حيلة جديدة نسبياً حينها لهذا الغرض)، تستطيع تعلّم سمات أفضل تلقائياً مما يصممه البشر يدوياً. خلال عامين تقريباً، تحوّل كل نظام رؤية حاسوبية جاد تقريباً إلى التعلّم العميق.

تُنسب نتيجة هذه المسابقة الواحدة على نطاق واسع كنقطة تحوّل أشعلت طفرة التعلّم العميق الحديثة — نفس أفكار CNN الأساسية من هذا الدرس (الالتفافات تكتشف حواف ← أشكال ← أجسام) موسّعة ببيانات وطبقات أكثر. إنها تذكير حيّ بأن الاختراق في الذكاء الاصطناعي أحياناً ليس حيلة ذكية جديدة، بل مجرد إثبات أن فكرة بسيطة تعمل بشكل أفضل بكثير حين يكون خلفها بيانات وحوسبة كافية.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "To a computer, an image is…", ar: "بالنسبة للحاسوب، الصورة هي…" },
          choices: [
            { en: "A grid of numbers (pixel brightness values)", ar: "شبكة أرقام (قيم سطوع البكسلات)" },
            { en: "A magic file only humans understand", ar: "ملف سحري يفهمه البشر فقط" },
            { en: "Always exactly 255 pixels", ar: "دائماً 255 بكسل بالضبط" },
          ],
          answer: 0,
          explain: {
            en: "Every pixel is a number (0–255); color = 3 grids (R,G,B). All vision AI is math on these grids.",
            ar: "كل بكسل رقم (0–255)؛ واللون = 3 شبكات (R،G،B). كل ذكاء الرؤية رياضيات على هذه الشبكات.",
          },
        },
        {
          q: { en: "What do the early layers of a CNN detect?", ar: "ماذا تكتشف الطبقات الأولى في CNN؟" },
          choices: [
            { en: "Whole faces immediately", ar: "الوجوه كاملة فوراً" },
            { en: "Simple edges and textures", ar: "الحواف والملامس البسيطة" },
            { en: "The image's file name", ar: "اسم ملف الصورة" },
          ],
          answer: 1,
          explain: {
            en: "Early layers find edges; middle layers assemble shapes; deep layers recognize objects. Simple to complex.",
            ar: "الطبقات الأولى تجد الحواف؛ والوسطى تجمع الأشكال؛ والعميقة تتعرّف الأجسام. من البسيط للمعقد.",
          },
        },
        {
          q: { en: "How does a computer detect an edge?", ar: "كيف يكتشف الحاسوب حافة؟" },
          choices: [
            { en: "Where pixel values change sharply", ar: "حيث تتغيّر قيم البكسلات بحدّة" },
            { en: "By reading the image caption", ar: "بقراءة تعليق الصورة" },
            { en: "Edges can't be detected", ar: "لا يمكن كشف الحواف" },
          ],
          answer: 0,
          explain: {
            en: "A sudden jump between neighboring pixel values (e.g. white 255 next to black 0) marks an edge — the CNN's basic signal.",
            ar: "قفزة مفاجئة بين قيم بكسلات متجاورة (مثل أبيض 255 بجوار أسود 0) تعلّم حافة — الإشارة الأساسية لـ CNN.",
          },
        },
        {
          q: { en: "Why do we use data augmentation on training images?", ar: "لماذا نستخدم تضخيم البيانات على صور التدريب؟" },
          choices: [
            { en: "It creates useful variety (flips, rotations, crops) so the model generalizes instead of memorizing quirks", ar: "يخلق تنوعاً مفيداً (عكس، دوران، قص) فيعمّم النموذج بدلاً من حفظ الخصائص العرضية" },
            { en: "It makes images load faster on websites", ar: "يجعل الصور تحمّل أسرع في المواقع" },
            { en: "It deletes low-quality images automatically", ar: "يحذف الصور رديئة الجودة تلقائياً" },
          ],
          answer: 0,
          explain: {
            en: "Augmentation fights overfitting: a flipped or rotated cat is still a cat, forcing the model to learn the real concept, not incidental details.",
            ar: "التضخيم يكافح الإفراط في المطابقة: قطة معكوسة أو مدارة تبقى قطة، فيجبر النموذج على تعلّم المفهوم الحقيقي لا التفاصيل العرضية.",
          },
        },
        {
          q: { en: "What made the 2012 ImageNet result (AlexNet) so significant?", ar: "ما الذي جعل نتيجة ImageNet عام 2012 (AlexNet) مهمة جداً؟" },
          choices: [
            { en: "A deep CNN dramatically beat hand-crafted approaches, kicking off the modern deep learning boom", ar: "تفوّقت CNN عميقة بشكل كبير على الأساليب المصمَّمة يدوياً، ما أشعل طفرة التعلّم العميق الحديثة" },
            { en: "It was the first image ever digitized", ar: "كانت أول صورة تُرقمن على الإطلاق" },
            { en: "It proved computers could never understand images", ar: "أثبتت أن الحواسيب لن تفهم الصور أبداً" },
          ],
          answer: 0,
          explain: {
            en: "AlexNet's huge margin of victory showed that CNNs with enough data and GPU compute could learn better features than hand-designed rules — nearly the whole field switched to deep learning within a couple of years.",
            ar: "فارق فوز AlexNet الكبير أظهر أن CNNs بمعطى بيانات وحوسبة GPU كافية تتعلّم سمات أفضل من القواعد المصمَّمة يدوياً — تحوّل المجال كله تقريباً للتعلّم العميق خلال عامين.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Images are grids of numbers; color = R/G/B grids
- CNNs detect edges → shapes → objects, layer by layer
- Powers face unlock, self-driving, medical imaging, OCR
- Preprocessing (resize, normalize) and data augmentation (flips, rotations) fight overfitting and improve generalization
- You wrote a real image-inversion function
- Case study: the 2012 ImageNet/AlexNet result kicked off the modern deep learning boom in vision

**Next:** MLOps — how AI models actually get deployed and maintained in the real world.`,
        ar: `## الخلاصة

- الصور شبكات أرقام؛ اللون = شبكات R/G/B
- CNNs تكتشف الحواف ← الأشكال ← الأجسام، طبقة طبقة
- تشغّل فتح الوجه، القيادة الذاتية، التصوير الطبي، OCR
- المعالجة المسبقة (تغيير الحجم، التطبيع) وتضخيم البيانات (عكس، دوران) يكافحان الإفراط في المطابقة ويحسّنان التعميم
- كتبت دالة عكس صورة حقيقية
- دراسة الحالة: نتيجة ImageNet/AlexNet عام 2012 أشعلت طفرة التعلّم العميق الحديثة في الرؤية

**التالي:** MLOps — كيف تُنشر نماذج الذكاء وتُصان فعلاً في العالم الحقيقي.`,
      },
    },
  ],
};
