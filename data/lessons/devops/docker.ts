import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "docker",
  title: { en: "Docker — Containers for DevOps", ar: "Docker — الحاويات لـ DevOps" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Containers vs virtual machines (why containers won)
- The Dockerfile → image → container flow
- Docker's role in the DevOps pipeline
- The commands you'll run daily`,
        ar: `## ماذا ستتعلم

- الحاويات مقابل الأجهزة الافتراضية (لماذا انتصرت الحاويات)
- تدفق Dockerfile ← صورة ← حاوية
- دور Docker في خط DevOps
- الأوامر التي ستشغّلها يومياً`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The container, DevOps-style 📦

You met Docker in the backend track as the fix for "works on my machine." For DevOps, it's the **standard unit of deployment** — the thing pipelines build and ship.

**Containers vs Virtual Machines** — why containers took over:
- A **VM** virtualizes a *whole computer*, including a full guest operating system. It's heavy (gigabytes) and slow to start (minutes).
- A **container** shares the host's OS kernel and packages *just your app + its dependencies*. It's tiny (megabytes) and starts in *milliseconds*.

Think of VMs as separate houses (each with its own foundation, plumbing, everything) and containers as apartments in one building (sharing the structure, but isolated inside). You can run *far* more containers than VMs on the same hardware — which is exactly what you want when deploying and scaling.

**The core flow** (recap, now as your daily DevOps loop):
\`\`\`
Dockerfile  →  docker build  →  Image  →  docker run  →  Container
(the recipe)                   (the box)              (running app)
\`\`\`

The everyday commands:
- \`docker build -t myapp .\` — build an image from the Dockerfile in this folder.
- \`docker run myapp\` — start a container from that image.
- \`docker ps\` — list running containers.
- \`docker push myapp\` — upload the image to a registry (like Docker Hub) so servers can pull it.

**Where it fits in DevOps:** your CI/CD pipeline (next lesson) builds a Docker image on every push, tests it, pushes it to a registry, and deploys that exact image to production. Because the image is identical everywhere, "it worked in testing" reliably means "it works in production." Containers make deployments predictable — the foundation everything else in DevOps stands on.`,
        ar: `## الحاوية، بأسلوب DevOps 📦

قابلت Docker في مسار الخلفية كحلّ لـ "يعمل على جهازي". في DevOps، إنه **وحدة النشر القياسية** — ما تبنيه الخطوط وتشحنه.

**الحاويات مقابل الأجهزة الافتراضية** — لماذا اجتاحت الحاويات:
- **الجهاز الافتراضي (VM)** يحاكي *حاسوباً كاملاً*، بما فيه نظام تشغيل ضيف كامل. ثقيل (جيجابايتات) وبطيء الإقلاع (دقائق).
- **الحاوية** تتشارك نواة نظام المضيف وتحزم *تطبيقك + اعتمادياته فقط*. صغيرة (ميجابايتات) وتقلع في *أجزاء من الثانية*.

فكّر في الأجهزة الافتراضية كبيوت منفصلة (لكلٍّ أساسه وسباكته وكل شيء) والحاويات كشقق في مبنى واحد (تتشارك الهيكل، لكنها معزولة داخلياً). تشغّل حاويات *أكثر بكثير* من الأجهزة الافتراضية على نفس العتاد — وهو بالضبط ما تريده عند النشر والتوسّع.

**التدفق الأساسي** (تلخيص، الآن كحلقتك اليومية في DevOps):
\`\`\`
Dockerfile  →  docker build  →  صورة  →  docker run  →  حاوية
(الوصفة)                     (الصندوق)              (تطبيق عامل)
\`\`\`

الأوامر اليومية:
- \`docker build -t myapp .\` — ابنِ صورة من Dockerfile في هذا المجلد.
- \`docker run myapp\` — شغّل حاوية من تلك الصورة.
- \`docker ps\` — اعرض الحاويات العاملة.
- \`docker push myapp\` — ارفع الصورة إلى مستودع (مثل Docker Hub) لتسحبها الخوادم.

**أين يندمج في DevOps:** خط CI/CD (الدرس التالي) يبني صورة Docker مع كل دفعة، يختبرها، يدفعها لمستودع، وينشر تلك الصورة بالضبط للإنتاج. ولأن الصورة متطابقة في كل مكان، "نجح في الاختبار" يعني بموثوقية "يعمل في الإنتاج". الحاويات تجعل النشر متوقعاً — الأساس الذي يقف عليه كل شيء آخر في DevOps.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Layers and the build cache 🧱

A Docker image isn't one solid block — it's built from **layers**, stacked like transparent sheets. Each line in a Dockerfile creates one layer:

\`\`\`dockerfile
FROM node:20          # layer 1: base OS + Node
COPY package.json .   # layer 2: just the manifest
RUN npm install       # layer 3: installed dependencies
COPY . .              # layer 4: your actual source code
CMD ["node", "app.js"]
\`\`\`

Docker **caches** each layer. If you rebuild and a layer's inputs haven't changed, Docker reuses the cached layer instantly instead of redoing the work — and once one layer changes, *every layer after it* must be rebuilt.

This is why the **order of your Dockerfile matters enormously**. Notice \`package.json\` is copied and \`npm install\` run *before* the rest of the source code is copied. Your dependencies change rarely; your source code changes on every commit. If you copied everything first, *any* code change would invalidate the cache and force a full, slow \`npm install\` on every single build. Ordering slow, rarely-changing steps first — and fast, frequently-changing steps last — is the single biggest lever for fast CI/CD builds.

**Multi-stage builds** take this further: use one stage with all the build tools to compile your app, then copy *only the finished output* into a tiny final image — shrinking a 1GB image with compilers and source code down to a lean, secure production image with just the binary.`,
        ar: `## الطبقات وذاكرة التخزين المؤقت للبناء 🧱

صورة Docker ليست كتلة واحدة صلبة — بل مبنية من **طبقات**، مكدّسة كصفائح شفافة. كل سطر في Dockerfile ينشئ طبقة واحدة:

\`\`\`dockerfile
FROM node:20          # طبقة 1: نظام أساسي + Node
COPY package.json .   # طبقة 2: البيان فقط
RUN npm install       # طبقة 3: الاعتماديات المثبَّتة
COPY . .              # طبقة 4: كود مصدرك الفعلي
CMD ["node", "app.js"]
\`\`\`

Docker **يخزّن مؤقتاً** كل طبقة. إن أعدت البناء ولم تتغيّر مدخلات طبقة، يعيد Docker استخدام الطبقة المخزَّنة فوراً بدل إعادة العمل — وبمجرد تغيّر طبقة واحدة، يجب إعادة بناء *كل طبقة بعدها*.

هذا سبب أن **ترتيب Dockerfile يهم بشدة**. لاحظ أن \`package.json\` يُنسخ وأن \`npm install\` يُشغَّل *قبل* نسخ بقية كود المصدر. اعتمادياتك تتغيّر نادراً؛ وكودك المصدري يتغيّر مع كل commit. لو نسخت كل شيء أولاً، *أي* تغيير كود سيُبطل ذاكرة التخزين المؤقت ويفرض \`npm install\` كامل بطيء مع كل بناء. ترتيب الخطوات البطيئة نادرة التغيّر أولاً — والسريعة كثيرة التغيّر أخيراً — هو أكبر رافعة لبناءات CI/CD سريعة.

**البناءات متعددة المراحل** تأخذ هذا أبعد: استخدم مرحلة بكل أدوات البناء لتصريف تطبيقك، ثم انسخ *فقط الناتج النهائي* إلى صورة أخيرة صغيرة — مقلّصاً صورة بحجم 1 جيجابايت فيها مصرّفات وكود مصدر إلى صورة إنتاج نحيلة وآمنة تحوي الثنائي فقط.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Simulate Docker's layer cache. Write \`layersToRebuild(changedLayerIndex, totalLayers)\` — given which layer index changed (0-based) and the total number of layers, return an array of the layer indexes that must be **rebuilt** (the changed layer and everything after it; earlier layers stay cached).

Example: \`layersToRebuild(2, 5)\` → \`[2, 3, 4]\` (layers 0 and 1 stay cached)`,
        ar: `حاكِ ذاكرة التخزين المؤقت لطبقات Docker. اكتب \`layersToRebuild(changedLayerIndex, totalLayers)\` — بمعرفة فهرس الطبقة التي تغيّرت (بدءاً من 0) وعدد الطبقات الكلي، أعِد مصفوفة فهارس الطبقات الواجب **إعادة بنائها** (الطبقة المتغيّرة وكل ما بعدها؛ الطبقات الأقدم تبقى مخزَّنة).

مثال: \`layersToRebuild(2, 5)\` ← \`[2, 3, 4]\` (الطبقتان 0 و1 تبقيان مخزَّنتين)`,
      },
      starterCode: `function layersToRebuild(changedLayerIndex, totalLayers) {
  // return [changedLayerIndex, changedLayerIndex + 1, ..., totalLayers - 1]
}

console.log(layersToRebuild(2, 5)); // [2, 3, 4]`,
      solution: `function layersToRebuild(changedLayerIndex, totalLayers) {
  const result = [];
  for (let i = changedLayerIndex; i < totalLayers; i++) {
    result.push(i);
  }
  return result;
}

console.log(layersToRebuild(2, 5)); // [2, 3, 4]`,
      hints: [
        { en: `Loop from changedLayerIndex up to (but not including) totalLayers, pushing each index.`, ar: `كرّر من changedLayerIndex حتى (دون تضمين) totalLayers، مضيفاً كل فهرس.` },
        { en: `Layers before changedLayerIndex are never included — they're still cached.`, ar: `الطبقات قبل changedLayerIndex لا تُدرَج أبداً — تبقى مخزَّنة.` },
      ],
      tests: [
        { name: { en: "Rebuilds from the changed layer onward", ar: "يعيد البناء من الطبقة المتغيّرة فصاعداً" }, check: `JSON.stringify(layersToRebuild(2,5)) === JSON.stringify([2,3,4])` },
        { name: { en: "Changing the first layer rebuilds everything", ar: "تغيير الطبقة الأولى يعيد بناء كل شيء" }, check: `JSON.stringify(layersToRebuild(0,4)) === JSON.stringify([0,1,2,3])` },
        { name: { en: "Changing the last layer rebuilds just that one", ar: "تغيير الطبقة الأخيرة يعيد بناءها فقط" }, check: `JSON.stringify(layersToRebuild(4,5)) === JSON.stringify([4])` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the leaky secrets in public images 🔍

A recurring, well-documented problem across the Docker ecosystem: developers bake secrets — API keys, AWS credentials, private certificates — directly into an image, usually by \`COPY\`-ing a \`.env\` file or hardcoding a key in a \`RUN\` command, then push that image to a **public** registry. Security researchers have repeatedly scanned Docker Hub's public images and found thousands containing live, extractable credentials, because every layer of an image is inspectable — even a secret added in one layer and "deleted" in a later layer is still sitting in the earlier layer's history, just like an unwanted file in Git history.

The fix mirrors what you learned about \`.gitignore\`: secrets belong in environment variables injected **at runtime** (\`docker run -e API_KEY=...\` or a secrets manager), never baked into the image itself. Multi-stage builds also help here — if your secret is only needed to *build* the app (like a private package registry token), keep it in an early build stage that never makes it into the final shipped image.

This is why scanning images for embedded secrets (part of the DevSecOps pipeline you'll meet later) is now standard practice at serious engineering organizations.`,
        ar: `## دراسة حالة واقعية: الأسرار المتسرّبة في الصور العامة 🔍

مشكلة متكررة وموثّقة جيداً عبر نظام Docker: يخبز المطوّرون أسراراً — مفاتيح API، بيانات اعتماد AWS، شهادات خاصة — مباشرة داخل صورة، عادة بنسخ (\`COPY\`) ملف \`.env\` أو ترميز مفتاح داخل أمر \`RUN\`، ثم يدفعون تلك الصورة إلى مستودع **عام**. باحثو أمن مسحوا مراراً صور Docker Hub العامة ووجدوا آلافاً تحوي بيانات اعتماد حيّة قابلة للاستخراج، لأن كل طبقة في الصورة قابلة للفحص — وحتى سر أُضيف في طبقة و"حُذف" في طبقة لاحقة لا يزال جالساً في سجلّ الطبقة الأقدم، تماماً كملف غير مرغوب في سجلّ Git.

الحل يحاكي ما تعلمته عن \`.gitignore\`: الأسرار مكانها متغيرات بيئة تُحقَن **وقت التشغيل** (\`docker run -e API_KEY=...\` أو مدير أسرار)، لا أن تُخبَز داخل الصورة نفسها. البناءات متعددة المراحل تساعد هنا أيضاً — إن كان سرّك مطلوباً فقط *لبناء* التطبيق (مثل رمز مستودع حزم خاص)، أبقِه في مرحلة بناء مبكرة لا تصل أبداً للصورة النهائية المشحونة.

هذا سبب أن فحص الصور بحثاً عن أسرار مدمجة (جزء من خط DevSecOps الذي ستقابله لاحقاً) صار ممارسة معيارية في المؤسسات الهندسية الجادة.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "How does a container differ from a virtual machine?", ar: "كيف تختلف الحاوية عن الجهاز الافتراضي؟" },
          choices: [
            { en: "A container shares the host OS kernel; a VM includes a full guest OS", ar: "الحاوية تتشارك نواة نظام المضيف؛ والجهاز الافتراضي يتضمن نظام ضيف كامل" },
            { en: "They are identical", ar: "متطابقان" },
            { en: "Containers are larger and slower", ar: "الحاويات أكبر وأبطأ" },
          ],
          answer: 0,
          explain: {
            en: "Containers are lightweight (share the kernel, package just the app) — MBs and milliseconds vs a VM's GBs and minutes.",
            ar: "الحاويات خفيفة (تتشارك النواة، تحزم التطبيق فقط) — ميجابايتات وأجزاء ثانية مقابل جيجابايتات ودقائق للجهاز الافتراضي.",
          },
        },
        {
          q: { en: "What's the correct Docker flow?", ar: "ما تدفق Docker الصحيح؟" },
          choices: [
            { en: "Dockerfile → build → image → run → container", ar: "Dockerfile ← build ← صورة ← run ← حاوية" },
            { en: "Container → image → Dockerfile", ar: "حاوية ← صورة ← Dockerfile" },
            { en: "Image → Dockerfile → run", ar: "صورة ← Dockerfile ← run" },
          ],
          answer: 0,
          explain: {
            en: "Write the Dockerfile (recipe), build it into an image (box), then run the image to get a live container.",
            ar: "اكتب Dockerfile (الوصفة)، ابنِه صورة (صندوق)، ثم شغّل الصورة لتحصل على حاوية حيّة.",
          },
        },
        {
          q: { en: "Why do containers make DevOps deployments predictable?", ar: "لماذا تجعل الحاويات نشر DevOps متوقعاً؟" },
          choices: [
            { en: "The identical image runs the same in testing and production", ar: "الصورة المتطابقة تعمل بنفس الشكل في الاختبار والإنتاج" },
            { en: "They delete bugs automatically", ar: "تحذف الأخطاء تلقائياً" },
            { en: "They make code run faster", ar: "تجعل الكود أسرع" },
          ],
          answer: 0,
          explain: {
            en: "Same image everywhere means 'passed in testing' reliably equals 'works in production' — no environment surprises.",
            ar: "نفس الصورة في كل مكان يعني 'نجح في الاختبار' يساوي بموثوقية 'يعمل في الإنتاج' — بلا مفاجآت بيئة.",
          },
        },
        {
          q: { en: "Why does Dockerfile order matter for build speed?", ar: "لماذا يهم ترتيب Dockerfile لسرعة البناء؟" },
          choices: [
            { en: "Changing a layer invalidates the cache for every layer after it, so rarely-changing steps should come first", ar: "تغيير طبقة يُبطل ذاكرة التخزين المؤقت لكل طبقة بعدها، فيجب أن تأتي الخطوات نادرة التغيّر أولاً" },
            { en: "Order has no effect on Docker builds", ar: "الترتيب لا يؤثر على بناءات Docker" },
            { en: "Docker always rebuilds every layer regardless of order", ar: "Docker يعيد بناء كل طبقة دوماً بغض النظر عن الترتيب" },
          ],
          answer: 0,
          explain: {
            en: "Docker caches layers; put slow, rarely-changing steps (like installing dependencies) before frequently-changing source code to maximize cache hits.",
            ar: "Docker يخزّن الطبقات مؤقتاً؛ ضع الخطوات البطيئة نادرة التغيّر (مثل تثبيت الاعتماديات) قبل كود المصدر كثير التغيّر لتعظيم إصابات ذاكرة التخزين المؤقت.",
          },
        },
        {
          q: { en: "Why is baking a secret into a Docker image dangerous, even if a later layer 'deletes' it?", ar: "لماذا خبز سر داخل صورة Docker خطر، حتى لو 'حذفته' طبقة لاحقة؟" },
          choices: [
            { en: "Every layer's history is still inspectable, so the secret remains recoverable from the earlier layer", ar: "سجلّ كل طبقة يبقى قابلاً للفحص، فيبقى السر قابلاً للاستعادة من الطبقة الأقدم" },
            { en: "Docker automatically encrypts all layers", ar: "Docker يشفّر كل الطبقات تلقائياً" },
            { en: "Deleting in a later layer fully erases it from the image", ar: "الحذف في طبقة لاحقة يمحوه كلياً من الصورة" },
          ],
          answer: 0,
          explain: {
            en: "Just like Git history, earlier Docker layers persist in the image even if a later layer removes the file — secrets should be injected at runtime instead.",
            ar: "تماماً كسجلّ Git، الطبقات الأقدم في Docker تبقى في الصورة حتى لو أزال ملفاً طبقة لاحقة — يجب حقن الأسرار وقت التشغيل بدلاً من ذلك.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Containers share the host kernel — tiny and fast vs heavyweight VMs
- Flow: Dockerfile → build → image → run → container; push to a registry
- Docker is the DevOps unit of deployment: build once, run identically everywhere
- Predictable images make "works in prod" reliable
- Images are built from cached layers — ordering rarely-changing steps first speeds up every build; multi-stage builds keep final images small
- You simulated Docker's layer cache, and saw why baked-in secrets leak even after being "deleted"

**Next:** CI/CD Pipelines — the automation that builds, tests, and ships these containers on every commit.`,
        ar: `## الخلاصة

- الحاويات تتشارك نواة المضيف — صغيرة وسريعة مقابل الأجهزة الافتراضية الثقيلة
- التدفق: Dockerfile ← build ← صورة ← run ← حاوية؛ ادفع لمستودع
- Docker وحدة النشر في DevOps: ابنِ مرة، شغّل بشكل مطابق في كل مكان
- الصور المتوقعة تجعل "يعمل في الإنتاج" موثوقاً
- الصور تُبنى من طبقات مخزَّنة مؤقتاً — ترتيب الخطوات نادرة التغيّر أولاً يسرّع كل بناء؛ البناءات متعددة المراحل تُبقي الصور النهائية صغيرة
- حاكيت ذاكرة التخزين المؤقت لطبقات Docker، ورأيت لماذا تتسرّب الأسرار المخبوزة حتى بعد "حذفها"

**التالي:** خطوط CI/CD — الأتمتة التي تبني وتختبر وتشحن هذه الحاويات مع كل commit.`,
      },
    },
  ],
};
