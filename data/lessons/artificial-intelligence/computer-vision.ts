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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Images are grids of numbers; color = R/G/B grids
- CNNs detect edges → shapes → objects, layer by layer
- Powers face unlock, self-driving, medical imaging, OCR
- You wrote a real image-inversion function

**Next:** MLOps — how AI models actually get deployed and maintained in the real world.`,
        ar: `## الخلاصة

- الصور شبكات أرقام؛ اللون = شبكات R/G/B
- CNNs تكتشف الحواف ← الأشكال ← الأجسام، طبقة طبقة
- تشغّل فتح الوجه، القيادة الذاتية، التصوير الطبي، OCR
- كتبت دالة عكس صورة حقيقية

**التالي:** MLOps — كيف تُنشر نماذج الذكاء وتُصان فعلاً في العالم الحقيقي.`,
      },
    },
  ],
};
