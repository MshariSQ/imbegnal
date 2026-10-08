import type { ChallengeMeta } from "../../shared/challenges";

/**
 * Public challenge metadata for tracks: networking, operating-systems, devops, cloud-computing.
 * Matching graders: worker/src/graders/data/systems.ts. Nothing secret lives here: the puzzle
 * material of flag challenges is public by design, the flags themselves are only hashed server-side.
 */
export const systemsChallenges: ChallengeMeta[] = [
  {
    id: "cloud-cost-estimator",
    track: "cloud-computing",
    topic: "cost-optimization",
    title: { en: "Tiered Storage Bill", ar: "فاتورة التخزين المتدرّجة" },
    summary: {
      en: "Price object-storage usage with graduated tiers: the first gigabytes are cheap, the next ones cost something else.",
      ar: "احسب فاتورة التخزين السحابي بأسعار متدرّجة: الغيغابايتات الأولى بسعر، والتي تليها بسعر مختلف.",
    },
    description: {
      en: `## The story

Your startup keeps its backups in a cloud **object store**. The provider does not charge one flat price per gigabyte: it uses **graduated tiers**. The first gigabytes of a month are cheap (or free), the next block costs a different price, and so on. Every gigabyte is priced by the tier it falls into, **not** by the total you store.

The finance team wants a script that turns a rate card and a list of customers into a monthly bill.

## The task

Read a rate card and a list of customers, and print the bill of every customer.

**Input** (whitespace-separated, read all of stdin):

1. \`T\`, the number of tiers.
2. \`T\` lines \`limit price\`. \`limit\` is the **cumulative** upper bound of the tier in GB (the first tier covers \`0 .. limit\`, the next one \`previous limit .. limit\`). The last tier has the limit \`inf\`. \`price\` is USD per GB **inside that tier**.
3. \`N\`, the number of customers.
4. \`N\` lines \`name gb\`. \`name\` has no spaces, \`gb\` is the stored amount and may be fractional.

**Output:** one line per customer, in input order: \`name cost\`, where \`cost\` is the total in USD rounded to **two decimals**. The checker compares the numbers with a tolerance of half a cent.

A customer with 0 GB pays 0.00. Usage that lands exactly on a limit belongs to the tier that ends there.

## Example

\`\`\`text
3
100 0.00
1000 0.023
inf 0.021
2
alice 50
bob 1500.5
\`\`\`

Output:

\`\`\`text
alice 0.00
bob 31.21
\`\`\`

\`alice\` stays inside the free first 100 GB. \`bob\` pays 0 for his first 100 GB, then 900 GB x 0.023 = 20.70, then the remaining 500.5 GB x 0.021 = 10.5105, a total of 31.2105.`,
      ar: `## القصة

تحفظ شركتك الناشئة نسخها الاحتياطية في **مخزن كائنات (object store)** سحابي. لا يفرض المزوّد سعراً ثابتاً واحداً لكل غيغابايت، بل يعتمد **شرائح متدرّجة**: الغيغابايتات الأولى في الشهر رخيصة (أو مجانية)، والكتلة التالية بسعر مختلف، وهكذا. كل غيغابايت يُسعَّر بحسب الشريحة التي يقع فيها، **وليس** بحسب إجمالي ما تخزّنه.

يريد فريق المالية سكربتاً يحوّل بطاقة الأسعار وقائمة العملاء إلى فاتورة شهرية.

## المطلوب

اقرأ بطاقة الأسعار وقائمة العملاء، ثم اطبع فاتورة كل عميل.

**المدخل** (مفصول بمسافات، اقرأ كل stdin):

1. \`T\`: عدد الشرائح.
2. \`T\` أسطر بصيغة \`limit price\`. الحد \`limit\` هو الحد الأعلى **التراكمي** للشريحة بالغيغابايت (الشريحة الأولى تغطي \`0 .. limit\` والتالية \`الحد السابق .. limit\`). وآخر شريحة حدّها \`inf\`. أما \`price\` فهو بالدولار لكل غيغابايت **داخل تلك الشريحة**.
3. \`N\`: عدد العملاء.
4. \`N\` أسطر بصيغة \`name gb\`. الاسم \`name\` بلا مسافات، و\`gb\` الكمية المخزّنة وقد تكون كسرية.

**المخرج:** سطر لكل عميل بترتيب الإدخال: \`name cost\`، حيث \`cost\` الإجمالي بالدولار مقرّباً إلى **منزلتين عشريتين**. يقارن المصحّح الأرقام بتسامح نصف سنت.

العميل الذي يخزّن 0 غيغابايت يدفع 0.00. والاستهلاك الذي يقع تماماً على حد ما يتبع الشريحة التي تنتهي عنده.

## مثال

\`\`\`text
3
100 0.00
1000 0.023
inf 0.021
2
alice 50
bob 1500.5
\`\`\`

المخرج:

\`\`\`text
alice 0.00
bob 31.21
\`\`\`

يبقى \`alice\` داخل أول 100 غيغابايت المجانية. أما \`bob\` فيدفع 0 عن أول 100 غيغابايت، ثم 900 × 0.023 = 20.70، ثم 500.5 × 0.021 = 10.5105 عن الباقي، فيكون المجموع 31.2105.`,
    },
    difficulty: 1,
    points: 50,
    estMinutes: 15,
    kind: "output",
    lang: "python",
    starterCode: {
      python: `import sys

tokens = sys.stdin.read().split()
pos = 0
tier_count = int(tokens[pos])
pos += 1
tiers = []  # (cumulative upper bound in GB, price per GB inside the tier)
for _ in range(tier_count):
    limit = float("inf") if tokens[pos] == "inf" else float(tokens[pos])
    tiers.append((limit, float(tokens[pos + 1])))
    pos += 2

customers = int(tokens[pos])
pos += 1
for _ in range(customers):
    name, gb = tokens[pos], float(tokens[pos + 1])
    pos += 2
    cost = 0.0
    # Your turn: add the price of each tier's slice of \`gb\` to \`cost\`.
    print(f"{name} {cost:.2f}")
`,
      javascript: `const tokens = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean);
let pos = 0;
const tierCount = Number(tokens[pos++]);
const tiers = []; // [cumulative upper bound in GB, price per GB inside the tier]
for (let i = 0; i < tierCount; i++) {
  const limit = tokens[pos] === "inf" ? Infinity : Number(tokens[pos]);
  tiers.push([limit, Number(tokens[pos + 1])]);
  pos += 2;
}

const customers = Number(tokens[pos++]);
for (let i = 0; i < customers; i++) {
  const name = tokens[pos];
  const gb = Number(tokens[pos + 1]);
  pos += 2;
  const cost = 0;
  // Your turn: add the price of each tier's slice of \`gb\` to \`cost\` (make it a \`let\`).
  console.log(\`\${name} \${cost.toFixed(2)}\`);
}
`,
    },
    sampleInput: "3\n100 0.00\n1000 0.023\ninf 0.021\n2\nalice 50\nbob 1500.5\n",
    hints: [
      { cost: 4 },
      { cost: 6 },
      { cost: 10 },
    ],
    lessons: ["cloud-computing/cloud-concepts", "cloud-computing/aws-core"],
    tags: ["pricing", "tiers", "finops", "float"],
    addedAt: "2026-10-07",
  },
  {
    id: "os-clock-faults",
    track: "operating-systems",
    topic: "memory-management",
    title: { en: "Clock: A Second Chance for Pages", ar: "ساعة الصفحات: فرصة ثانية" },
    summary: {
      en: "Implement the Clock (second-chance) page replacement policy that real kernels use to approximate LRU, and count its page faults.",
      ar: "نفّذ سياسة استبدال الصفحات Clock (الفرصة الثانية) التي تستخدمها الأنظمة الحقيقية لتقريب LRU، واحسب أخطاء الصفحات فيها.",
    },
    description: {
      en: `## The story

LRU is the ideal page replacement policy for programs with locality, but updating an exact "last used" timestamp on **every memory access** would make the CPU crawl. Real kernels settle for a cheap approximation: the **Clock** algorithm, also called **second chance**.

The hardware sets one **reference bit** per page whenever the page is touched. The OS arranges the frames in a circle and keeps a **hand** pointing at the next candidate for eviction. A page that was used since the hand last passed gets a second chance instead of being thrown out.

## The task

Write a function that returns the number of page faults a Clock-managed memory suffers for a reference string.

- **Python:** \`clock_faults(k, refs)\`
- **JavaScript:** \`clockFaults(k, refs)\`

\`k\` is the number of frames (an integer, at least 1) and \`refs\` is the list of page numbers referenced in order (integers, at least 0; it may be empty). Return an integer. The tests call your function for you: just define it, do not read input or print anything.

## The rules

Memory starts **empty**: \`k\` empty frames, all reference bits 0, and the hand on frame 0.

For every reference, in order:

1. **Hit** (the page is in a frame): set that frame's reference bit to 1. The hand does **not** move.
2. **Fault** (the page is not in memory): count one fault, then repeat the following until the page is placed:
   - If the frame under the hand is **empty** or its reference bit is **0**: put the new page there, set its reference bit to 1, advance the hand to the next frame (wrapping around) and stop.
   - Otherwise (the bit is 1): clear the bit to 0 and advance the hand. This is the second chance.

The loop always ends: after at most one full turn every bit is 0.

## Example

For \`k = 3\` and the reference string \`1 2 3 4 1 2 5 1 2 3 4 5\` the tests feed your function this input (first line \`k\`, then the references):

\`\`\`text
3
1 2 3 4 1 2 5 1 2 3 4 5
\`\`\`

The expected result is \`9\`. Replaying the start: pages 1, 2 and 3 fill the frames (3 faults) and the hand wraps to frame 0. Reference 4 faults and clears the bits of 1, 2 and 3 while the hand goes around once, then evicts page 1 from frame 0. Reference 1 then evicts page 2 (its bit is already 0), and so on.`,
      ar: `## القصة

LRU هي سياسة الاستبدال المثالية للبرامج ذات الترابط المكاني (locality)، لكن تحديث طابع زمني دقيق لـ"آخر استخدام" عند **كل وصول للذاكرة** سيجعل المعالج يزحف. لذلك تكتفي الأنظمة الحقيقية بتقريب رخيص هو خوارزمية **Clock** وتسمى أيضاً **الفرصة الثانية (second chance)**.

تضبط العتاد **بتّ مرجع (reference bit)** لكل صفحة كلما لُمست. ويرتّب النظام الإطارات في دائرة ويحتفظ بـ**مؤشر** يشير إلى المرشّح التالي للطرد. والصفحة التي استُخدمت منذ مرور المؤشر الأخير تنال فرصة ثانية بدل أن تُطرد.

## المطلوب

اكتب دالة تعيد عدد أخطاء الصفحات التي تعانيها ذاكرة تُدار بـ Clock لسلسلة مراجع معيّنة.

- **Python:** ‏\`clock_faults(k, refs)\`
- **JavaScript:** ‏\`clockFaults(k, refs)\`

\`k\` عدد الإطارات (عدد صحيح، 1 على الأقل) و\`refs\` قائمة أرقام الصفحات المرجوعة بالترتيب (أعداد صحيحة، 0 على الأقل؛ وقد تكون فارغة). أعد عدداً صحيحاً. الاختبارات تستدعي دالتك بنفسها: عرّفها فقط، ولا تقرأ مدخلاً ولا تطبع شيئاً.

## القواعد

تبدأ الذاكرة **فارغة**: \`k\` إطاراً فارغاً وكل بتّات المرجع 0 والمؤشر عند الإطار 0.

لكل مرجع، بالترتيب:

1. **إصابة (hit)** (الصفحة في أحد الإطارات): اضبط بتّ مرجع ذلك الإطار على 1. المؤشر **لا** يتحرك.
2. **خطأ (fault)** (الصفحة ليست في الذاكرة): احسب خطأً واحداً، ثم كرّر ما يلي حتى توضع الصفحة:
   - إن كان الإطار تحت المؤشر **فارغاً** أو بتّ مرجعه **0**: ضع الصفحة الجديدة فيه واضبط بتّها على 1 وحرّك المؤشر إلى الإطار التالي (مع الالتفاف) وتوقف.
   - وإلا (البتّ 1): أعد البتّ إلى 0 وحرّك المؤشر. هذه هي الفرصة الثانية.

تنتهي الحلقة دائماً: بعد دورة كاملة على الأكثر تصبح كل البتّات 0.

## مثال

من أجل \`k = 3\` وسلسلة المراجع \`1 2 3 4 1 2 5 1 2 3 4 5\` تعطي الاختبارات دالتك هذا المدخل (السطر الأول \`k\` ثم المراجع):

\`\`\`text
3
1 2 3 4 1 2 5 1 2 3 4 5
\`\`\`

النتيجة المتوقعة \`9\`. لنعد تتبّع البداية: الصفحات 1 و2 و3 تملأ الإطارات (3 أخطاء) ويلتف المؤشر إلى الإطار 0. المرجع 4 يسبب خطأً ويمسح بتّات 1 و2 و3 أثناء دوران المؤشر دورة كاملة، ثم يطرد الصفحة 1 من الإطار 0. بعدها المرجع 1 يطرد الصفحة 2 (بتّها 0 أصلاً)، وهكذا.`,
    },
    difficulty: 1,
    points: 50,
    estMinutes: 20,
    kind: "code",
    lang: "python",
    allowedLangs: ["python", "javascript"],
    starterCode: {
      python: `def clock_faults(k, refs):
    """Return the number of page faults of the Clock (second-chance) policy.

    k    -- number of frames (an integer >= 1)
    refs -- list of page numbers (integers >= 0), possibly empty
    """
    # Your turn: simulate the frames, their reference bits and the hand.
    return 0
`,
      javascript: `/**
 * Return the number of page faults of the Clock (second-chance) policy.
 *
 * @param {number} k      number of frames (an integer >= 1)
 * @param {number[]} refs page numbers (integers >= 0), possibly empty
 * @returns {number}
 */
function clockFaults(k, refs) {
  // Your turn: simulate the frames, their reference bits and the hand.
  return 0;
}
`,
    },
    sampleInput: "3\n1 2 3 4 1 2 5 1 2 3 4 5\n",
    hints: [
      { cost: 5 },
      { cost: 6 },
      { cost: 9 },
    ],
    lessons: ["operating-systems/memory-management"],
    tags: ["page-replacement", "clock", "second-chance", "simulation"],
    addedAt: "2026-10-07",
  },
  {
    id: "devops-pipeline-order",
    track: "devops",
    topic: "ci-cd",
    title: { en: "Pipeline Run Order", ar: "ترتيب تنفيذ خط الأنابيب" },
    summary: {
      en: "Parse a tiny CI pipeline file and print the order in which its jobs can run, honouring every `needs:` dependency and spotting cycles.",
      ar: "حلّل ملف خط أنابيب CI صغيراً واطبع الترتيب الذي يمكن به تنفيذ مهامه مع احترام كل تبعية `needs:` وكشف الحلقات.",
    },
    description: {
      en: `## The story

Your CI server reads a small pipeline file and has to decide **in which order to run the jobs**. Some jobs \`needs:\` the output of others (the tests need the build, the deploy needs the tests), and the file lists them in whatever order the author felt like. A job may only start after every job it needs has finished.

The platform team wants a quick checker that prints the run order for a pipeline file, or says why there is none.

## The file format

A hand-rolled, YAML-like format (do not use a YAML library: your program has to parse these few rules itself):

\`\`\`text
pipeline:
  build:
    needs: []
    script: make build
  test:
    needs: [build, lint]
  lint:
\`\`\`

- Everything after a \`#\` is a comment. Blank and comment-only lines are ignored.
- The \`pipeline:\` line is only a header.
- A line indented by **exactly 2 spaces** that ends with \`:\` defines a job; the name is the text before the colon.
- Lines indented by **4 or more spaces** are properties of the most recent job. The only property you care about is \`needs:\`, a list in square brackets (\`[]\`, \`[a]\`, \`[a, b]\`, spaces are free). Every other property (\`script:\`, \`image:\`, \`needs-review:\`, ...) is ignored, whatever its value looks like.
- A job without \`needs:\` depends on nothing. Job names are unique.

## The task

Read the pipeline from stdin and print the job names, one per line, in this order: **repeatedly pick, among the jobs not yet run whose needs have all been run, the one that is defined EARLIEST in the file**, until all jobs have run.

Two error cases print a single line and nothing else:

- \`error: unknown job <name>\`: a \`needs:\` list names a job that is not defined. Report the first one found, going through the jobs in definition order and through each list from left to right. This check comes first.
- \`error: cycle\`: no unknown jobs, but at some point nothing can run while jobs remain (including a job that needs itself).

## Example

\`\`\`text
pipeline:
  build:
    needs: []
    script: make build
  test:
    needs: [build, lint]
    script: make test
  lint:
    script: make lint
  deploy:
    needs: [test]
    script: ./deploy.sh
\`\`\`

Output:

\`\`\`text
build
lint
test
deploy
\`\`\`

\`build\` is the earliest defined job that is ready. \`test\` is defined before \`lint\` but has to wait for it, so \`lint\` runs second; then \`test\` and \`deploy\` follow.`,
      ar: `## القصة

يقرأ خادم CI ملف خط أنابيب صغيراً ويجب أن يقرر **بأي ترتيب يشغّل المهام**. بعض المهام تحتاج (\`needs:\`) نتائج مهام أخرى (الاختبارات تحتاج البناء، والنشر يحتاج الاختبارات)، والملف يسردها بالترتيب الذي راق لكاتبه. لا يجوز أن تبدأ المهمة إلا بعد انتهاء كل مهمة تحتاجها.

يريد فريق المنصة مدقّقاً سريعاً يطبع ترتيب التشغيل لملف خط الأنابيب، أو يقول لماذا لا يوجد ترتيب.

## صيغة الملف

صيغة مصنوعة يدوياً تشبه YAML (لا تستخدم مكتبة YAML: على برنامجك أن يحلّل هذه القواعد القليلة بنفسه):

\`\`\`text
pipeline:
  build:
    needs: []
    script: make build
  test:
    needs: [build, lint]
  lint:
\`\`\`

- كل ما بعد \`#\` تعليق. الأسطر الفارغة وأسطر التعليق وحدها تُتجاهل.
- سطر \`pipeline:\` مجرد ترويسة.
- السطر المزاح بمسافتين **بالضبط** والمنتهي بـ\`:\` يعرّف مهمة؛ واسمها هو النص قبل النقطتين.
- الأسطر المزاحة بـ**4 مسافات أو أكثر** هي خصائص آخر مهمة معرَّفة. والخاصية الوحيدة التي تهمك هي \`needs:\`، وهي قائمة بين قوسين مربعين (\`[]\` أو \`[a]\` أو \`[a, b]\` والمسافات حرة). وكل خاصية أخرى (\`script:\` و\`image:\` و\`needs-review:\` ...) تُتجاهل مهما بدت قيمتها.
- المهمة بلا \`needs:\` لا تعتمد على شيء. وأسماء المهام فريدة.

## المطلوب

اقرأ خط الأنابيب من stdin واطبع أسماء المهام، اسماً في كل سطر، بهذا الترتيب: **كرّر اختيار المهمة التي عُرّفت أولاً في الملف من بين المهام التي لم تُشغَّل بعد وكل ما تحتاجه قد شُغّل**، حتى تُشغَّل كل المهام.

حالتا خطأ تطبعان سطراً واحداً فقط ولا شيء غيره:

- \`error: unknown job <name>\`: قائمة \`needs:\` تذكر مهمة غير معرَّفة. أبلغ عن أول واحدة تجدها بالمرور على المهام بترتيب التعريف وعلى كل قائمة من اليسار إلى اليمين. هذا الفحص يأتي أولاً.
- \`error: cycle\`: لا مهام مجهولة، لكن في لحظة ما لا يمكن تشغيل شيء بينما بقيت مهام (ويشمل ذلك مهمة تحتاج نفسها).

## مثال

\`\`\`text
pipeline:
  build:
    needs: []
    script: make build
  test:
    needs: [build, lint]
    script: make test
  lint:
    script: make lint
  deploy:
    needs: [test]
    script: ./deploy.sh
\`\`\`

المخرج:

\`\`\`text
build
lint
test
deploy
\`\`\`

\`build\` هي أول مهمة معرَّفة وجاهزة. و\`test\` معرَّفة قبل \`lint\` لكنها يجب أن تنتظرها، فتعمل \`lint\` ثانياً؛ ثم تأتي \`test\` ثم \`deploy\`.`,
    },
    difficulty: 2,
    points: 100,
    estMinutes: 30,
    kind: "output",
    lang: "python",
    starterCode: {
      python: `import sys

jobs = []  # [name, needs] in the order the jobs are defined
for raw in sys.stdin.read().splitlines():
    line = raw.split("#", 1)[0].rstrip()  # '#' starts a comment
    text = line.strip()
    if not text:
        continue
    indent = len(line) - len(line.lstrip(" "))
    if indent == 2 and text.endswith(":"):
        jobs.append([text[:-1], []])
    # Your turn: when a deeper line starts with "needs:", store its list in jobs[-1][1]

# Your turn: report unknown jobs, then print the run order (or "error: cycle").
for name, needs in jobs:
    print(name)
`,
      javascript: `const jobs = []; // { name, needs } in the order the jobs are defined
for (const raw of require("fs").readFileSync(0, "utf8").split(/\\r?\\n/)) {
  const line = raw.split("#")[0].trimEnd(); // '#' starts a comment
  const text = line.trim();
  if (!text) continue;
  const indent = line.length - line.trimStart().length;
  if (indent === 2 && text.endsWith(":")) {
    jobs.push({ name: text.slice(0, -1), needs: [] });
  }
  // Your turn: when a deeper line starts with "needs:", store its list in the last job
}

// Your turn: report unknown jobs, then print the run order (or "error: cycle").
for (const job of jobs) console.log(job.name);
`,
    },
    sampleInput: "pipeline:\n  build:\n    needs: []\n    script: make build\n  test:\n    needs: [build, lint]\n    script: make test\n  lint:\n    script: make lint\n  deploy:\n    needs: [test]\n    script: ./deploy.sh\n",
    hints: [
      { cost: 8 },
      { cost: 14 },
      { cost: 18 },
    ],
    lessons: ["devops/cicd"],
    tags: ["ci-cd", "pipeline", "topological-sort", "parsing"],
    addedAt: "2026-10-07",
  },
  {
    id: "net-route-aggregator",
    track: "networking",
    topic: "routing",
    title: { en: "Route Aggregator", ar: "مُجمِّع المسارات" },
    summary: {
      en: "Collapse a messy list of IPv4 routes into the smallest equivalent list of CIDR blocks, the way routers summarise their tables.",
      ar: "اختصر قائمة فوضوية من مسارات IPv4 إلى أصغر قائمة مكافئة من كتل CIDR، كما تلخّص الموجِّهات جداولها.",
    },
    description: {
      en: `## The story

A branch office announces its networks to head office one \`/24\` at a time. After a few years of growth the routing table has hundreds of entries, many of them redundant: some networks are swallowed by bigger ones, some are listed twice, and many sit right next to each other and could be announced as one bigger block. Smaller tables mean faster lookups and less memory, so routers **summarise** (aggregate) routes whenever the addresses allow it.

## The task

Given a list of IPv4 networks in CIDR notation, print the **smallest possible list of CIDR blocks that covers exactly the same set of addresses**: no address may be added, none may be lost.

**Input:**

- the first line is \`n\` (1 to 2000), the number of networks;
- then \`n\` lines \`a.b.c.d/p\`. Every line is a proper network: its host bits are zero (\`10.1.2.0/24\`, never \`10.1.2.77/24\`). Duplicates, overlaps, and any order are possible.

**Output:** the blocks, one per line as \`a.b.c.d/p\`, **sorted by network address** (lowest first).

Merging only works when the blocks are adjacent **and aligned**: two \`/24\` networks join into a \`/23\` only if the first one starts on an even third octet. For example \`172.16.1.0/24\` + \`172.16.2.0/24\` cannot become one block, because \`172.16.1.0/23\` would also contain \`172.16.0.0/24\`, which was not in the list.

## Examples

\`\`\`text
4
192.168.0.0/24
192.168.1.0/24
192.168.2.0/24
192.168.3.0/24
\`\`\`

Output:

\`\`\`text
192.168.0.0/22
\`\`\`

The four networks are consecutive and the first is aligned on a multiple of four, so one \`/22\` covers them exactly.

\`\`\`text
3
172.16.1.0/24
172.16.2.0/24
172.16.0.0/24
\`\`\`

Output:

\`\`\`text
172.16.0.0/23
172.16.2.0/24
\`\`\`

Together the three networks span \`172.16.0.0\` to \`172.16.2.255\`. The best you can do is a \`/23\` (0 and 1) and a \`/24\` (2).`,
      ar: `## القصة

يعلن أحد الفروع عن شبكاته لدى المقر الرئيسي شبكة \`/24\` تلو الأخرى. وبعد سنوات من النمو صار جدول التوجيه فيه مئات المدخلات، كثير منها زائد: بعض الشبكات تبتلعها شبكات أكبر، وبعضها مذكور مرتين، وكثير منها متجاور ويمكن الإعلان عنه ككتلة أكبر واحدة. الجداول الأصغر تعني بحثاً أسرع وذاكرة أقل، لذلك **تلخّص** الموجِّهات (aggregate) المسارات كلما سمحت العناوين بذلك.

## المطلوب

بإعطائك قائمة شبكات IPv4 بصيغة CIDR، اطبع **أصغر قائمة ممكنة من كتل CIDR تغطي مجموعة العناوين نفسها تماماً**: لا يجوز إضافة أي عنوان ولا فقدان أي عنوان.

**المدخل:**

- السطر الأول \`n\` (من 1 إلى 2000) عدد الشبكات؛
- ثم \`n\` من الأسطر بصيغة \`a.b.c.d/p\`. كل سطر شبكة صحيحة: بتّات المضيف فيها أصفار (\`10.1.2.0/24\` وليس \`10.1.2.77/24\`). وقد توجد تكرارات وتداخلات وبأي ترتيب.

**المخرج:** الكتل، كتلة في كل سطر بصيغة \`a.b.c.d/p\`، **مرتّبة بحسب عنوان الشبكة** (الأصغر أولاً).

لا يصح الدمج إلا إذا كانت الكتل متجاورة **ومحاذاة**: تنضم شبكتان \`/24\` إلى \`/23\` فقط إذا بدأت الأولى عند قيمة زوجية للبايت الثالث. فمثلاً \`172.16.1.0/24\` + \`172.16.2.0/24\` لا تصيران كتلة واحدة، لأن \`172.16.1.0/23\` ستحتوي أيضاً \`172.16.0.0/24\` التي لم تكن في القائمة.

## أمثلة

\`\`\`text
4
192.168.0.0/24
192.168.1.0/24
192.168.2.0/24
192.168.3.0/24
\`\`\`

المخرج:

\`\`\`text
192.168.0.0/22
\`\`\`

الشبكات الأربع متتالية والأولى محاذاة على مضاعف الأربعة، فتغطيها \`/22\` واحدة بدقة.

\`\`\`text
3
172.16.1.0/24
172.16.2.0/24
172.16.0.0/24
\`\`\`

المخرج:

\`\`\`text
172.16.0.0/23
172.16.2.0/24
\`\`\`

تمتد الشبكات الثلاث معاً من \`172.16.0.0\` إلى \`172.16.2.255\`. وأفضل ما يمكنك فعله هو \`/23\` (للشبكتين 0 و1) و\`/24\` (للشبكة 2).`,
    },
    difficulty: 2,
    points: 150,
    estMinutes: 40,
    kind: "output",
    lang: "python",
    starterCode: {
      python: `import sys

tokens = sys.stdin.read().split()
count = int(tokens[0])

intervals = []  # (first address, last address) as integers
for text in tokens[1:1 + count]:
    address, prefix = text.split("/")
    a, b, c, d = (int(part) for part in address.split("."))
    first = (a << 24) | (b << 16) | (c << 8) | d
    intervals.append((first, first + (1 << (32 - int(prefix))) - 1))

# Your turn: merge the intervals, cover each one with the fewest CIDR blocks and print them.
for first, last in sorted(intervals):
    print(first, last)
`,
      javascript: `const tokens = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean);
const count = Number(tokens[0]);

const intervals = []; // [first address, last address] as numbers
for (const text of tokens.slice(1, 1 + count)) {
  const [address, prefix] = text.split("/");
  const [a, b, c, d] = address.split(".").map(Number);
  const first = ((a * 256 + b) * 256 + c) * 256 + d;
  intervals.push([first, first + 2 ** (32 - Number(prefix)) - 1]);
}

// Your turn: merge the intervals, cover each one with the fewest CIDR blocks and print them.
intervals.sort((x, y) => x[0] - y[0]);
for (const [first, last] of intervals) console.log(first, last);
`,
    },
    sampleInput: "4\n192.168.0.0/24\n192.168.1.0/24\n192.168.2.0/24\n192.168.3.0/24\n",
    hints: [
      { cost: 12 },
      { cost: 20 },
      { cost: 28 },
    ],
    lessons: ["networking/ip-subnetting"],
    tags: ["cidr", "route-summarization", "aggregation", "ipv4"],
    addedAt: "2026-10-07",
  },
  {
    id: "os-mlfq",
    track: "operating-systems",
    topic: "scheduling",
    title: { en: "Multilevel Feedback Queue", ar: "طوابير التغذية الراجعة متعددة المستويات" },
    summary: {
      en: "Simulate an MLFQ scheduler where jobs that burn their whole time slice sink to slower, longer-slice queues, and report each job's waiting time.",
      ar: "حاكِ مُجدوِل MLFQ حيث تنزل المهام التي تستهلك شريحتها كاملة إلى طوابير أبطأ بشرائح أطول، واحسب زمن انتظار كل مهمة.",
    },
    description: {
      en: `## The story

A plain Round Robin scheduler treats a quick keystroke handler and a week-long simulation the same. The **Multilevel Feedback Queue (MLFQ)** fixes that without knowing the job lengths in advance: every new job starts in the **top queue** with a **short** time slice. A job that uses its whole slice and still wants more is probably CPU-bound, so it is **demoted** to a lower queue with a longer slice; a job that finishes early stays responsive. The CPU always serves the highest non-empty queue first.

You are asked to simulate a small MLFQ and report how long each job waited.

## The rules

There are \`k\` queues, numbered \`0\` (top, highest priority) to \`k-1\` (bottom). Queue \`i\` has the time quantum \`q[i]\`. Every process has an \`arrival\` time and a CPU \`burst\` (no I/O). Time is in whole units.

1. A process enters **queue 0** at its arrival time. Processes with the same arrival time enter in input order.
2. Whenever the CPU is free, it takes the **first process of the highest-priority non-empty queue** (queues are FIFO) and runs it for \`min(q[level], remaining burst)\` units. Nothing interrupts a slice: a process that arrives meanwhile has to wait for it to end.
3. When a slice ends at time \`t\`:
   - first, every process with \`arrival <= t\` that has not entered yet is added to queue 0;
   - then, if the running process finished, record \`finish = t\`; otherwise it used its **whole** quantum, so it moves to the **tail of the next queue down** (a process in the bottom queue goes back to the tail of the bottom queue).
4. If every queue is empty, the CPU idles until the next arrival.

\`waiting = finish - arrival - burst\`.

## Input and output

**Input:** \`k\`; then the \`k\` quanta on one line; then \`n\`; then \`n\` lines \`name arrival burst\` (integers, \`burst >= 1\`; names have no spaces; the lines are in any order).

**Output:** one line \`name finish waiting\` per process **in input order**, then a last line \`average_wait <value>\` with the average waiting time to two decimals (the checker allows a tolerance of half a cent).

## Example

\`\`\`text
3
2 4 8
3
A 0 7
B 1 3
C 2 1
\`\`\`

Output:

\`\`\`text
A 11 4
B 10 6
C 5 2
average_wait 4.00
\`\`\`

How it unfolds: \`A\` runs alone at first and uses its whole quantum of 2 (time 0 to 2); \`B\` and \`C\` have arrived by then, so they join queue 0 and \`A\` drops to queue 1. \`B\` runs 2 to 4 and drops. \`C\` needs only 1 unit and finishes at 5. Queue 0 is empty, so queue 1 is served: \`A\` runs 5 to 9 (quantum 4) and drops to queue 2, \`B\` runs its last unit from 9 to 10, and \`A\` finishes its last unit at 11.`,
      ar: `## القصة

مُجدوِل Round Robin العادي يعامل معالج ضغطة مفتاح سريعاً ومحاكاة تستمر أسبوعاً بالطريقة نفسها. أما **طوابير التغذية الراجعة متعددة المستويات (MLFQ)** فتعالج ذلك دون معرفة أطوال المهام مسبقاً: كل مهمة جديدة تبدأ في **الطابور الأعلى** بشريحة زمنية **قصيرة**. والمهمة التي تستهلك شريحتها كاملة وما زالت تريد المزيد غالباً ما تكون كثيفة المعالج، فتُخفَّض إلى طابور أدنى بشريحة أطول؛ أما المهمة التي تنتهي مبكراً فتبقى سريعة الاستجابة. ويخدم المعالج دائماً أعلى طابور غير فارغ أولاً.

المطلوب أن تحاكي MLFQ صغيراً وتُبلغ كم انتظرت كل مهمة.

## القواعد

هناك \`k\` طابوراً مرقّمة من \`0\` (الأعلى وصاحب أعلى أولوية) إلى \`k-1\` (الأدنى). وللطابور \`i\` شريحة زمنية \`q[i]\`. ولكل عملية زمن وصول \`arrival\` وانفجار معالج \`burst\` (بلا إدخال/إخراج). والزمن بوحدات صحيحة.

1. تدخل العملية **الطابور 0** عند وقت وصولها. والعمليات المتساوية في وقت الوصول تدخل بترتيب الإدخال.
2. كلما فرغ المعالج أخذ **أول عملية في أعلى طابور غير فارغ** (الطوابير FIFO) وشغّلها \`min(q[level], الانفجار المتبقي)\` من الوحدات. لا شيء يقاطع الشريحة: العملية التي تصل أثناءها تنتظر انتهاءها.
3. عند انتهاء شريحة في الزمن \`t\`:
   - أولاً، تُضاف إلى الطابور 0 كل عملية \`arrival <= t\` لم تدخل بعد؛
   - ثم إن انتهت العملية الجارية سجّل \`finish = t\`؛ وإلا فقد استهلكت الشريحة **كاملة**، فتنتقل إلى **ذيل الطابور التالي نزولاً** (والعملية في الطابور الأدنى تعود إلى ذيل الطابور الأدنى نفسه).
4. إن كانت كل الطوابير فارغة يبقى المعالج خاملاً حتى الوصول التالي.

\`waiting = finish - arrival - burst\`.

## المدخل والمخرج

**المدخل:** \`k\`؛ ثم الشرائح الـ\`k\` في سطر واحد؛ ثم \`n\`؛ ثم \`n\` من الأسطر بصيغة \`name arrival burst\` (أعداد صحيحة، \`burst >= 1\`؛ والأسماء بلا مسافات؛ والأسطر بأي ترتيب).

**المخرج:** سطر \`name finish waiting\` لكل عملية **بترتيب الإدخال**، ثم سطر أخير \`average_wait <القيمة>\` بمتوسط زمن الانتظار لمنزلتين عشريتين (يسمح المصحّح بتسامح نصف سنت).

## مثال

\`\`\`text
3
2 4 8
3
A 0 7
B 1 3
C 2 1
\`\`\`

المخرج:

\`\`\`text
A 11 4
B 10 6
C 5 2
average_wait 4.00
\`\`\`

كيف تجري الأمور: تعمل \`A\` وحدها في البداية وتستهلك شريحتها كاملة وهي 2 (من 0 إلى 2)؛ وقد وصلت \`B\` و\`C\` حينها فتنضمان إلى الطابور 0 وتنزل \`A\` إلى الطابور 1. تعمل \`B\` من 2 إلى 4 ثم تنزل. وتحتاج \`C\` وحدة واحدة فقط فتنتهي عند 5. الطابور 0 فارغ فيُخدم الطابور 1: تعمل \`A\` من 5 إلى 9 (الشريحة 4) وتنزل إلى الطابور 2، وتعمل \`B\` وحدتها الأخيرة من 9 إلى 10، وتنهي \`A\` وحدتها الأخيرة عند 11.`,
    },
    difficulty: 2,
    points: 150,
    estMinutes: 45,
    kind: "output",
    lang: "python",
    starterCode: {
      python: `import sys

tokens = sys.stdin.read().split()
pos = 0
levels = int(tokens[pos])
pos += 1
quanta = [int(tokens[pos + i]) for i in range(levels)]
pos += levels
count = int(tokens[pos])
pos += 1
names, arrival, burst = [], [], []
for _ in range(count):
    names.append(tokens[pos])
    arrival.append(int(tokens[pos + 1]))
    burst.append(int(tokens[pos + 2]))
    pos += 3

finish = [0] * count
# Your turn: simulate the queues and fill in finish[i] for every process.

total = 0
for i in range(count):
    wait = finish[i] - arrival[i] - burst[i]
    total += wait
    print(names[i], finish[i], wait)
print(f"average_wait {total / count:.2f}")
`,
      javascript: `const tokens = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean);
let pos = 0;
const levels = Number(tokens[pos++]);
const quanta = [];
for (let i = 0; i < levels; i++) quanta.push(Number(tokens[pos++]));
const count = Number(tokens[pos++]);
const names = [];
const arrival = [];
const burst = [];
for (let i = 0; i < count; i++) {
  names.push(tokens[pos]);
  arrival.push(Number(tokens[pos + 1]));
  burst.push(Number(tokens[pos + 2]));
  pos += 3;
}

const finish = new Array(count).fill(0);
// Your turn: simulate the queues and fill in finish[i] for every process.

let total = 0;
for (let i = 0; i < count; i++) {
  const wait = finish[i] - arrival[i] - burst[i];
  total += wait;
  console.log(names[i], finish[i], wait);
}
console.log(\`average_wait \${(total / count).toFixed(2)}\`);
`,
    },
    sampleInput: "3\n2 4 8\n3\nA 0 7\nB 1 3\nC 2 1\n",
    hints: [
      { cost: 12 },
      { cost: 20 },
      { cost: 28 },
    ],
    lessons: ["operating-systems/cpu-scheduling"],
    tags: ["scheduler", "mlfq", "simulation", "round-robin"],
    addedAt: "2026-10-07",
  },
  {
    id: "cloud-iam-evaluate",
    track: "cloud-computing",
    topic: "iam",
    title: { en: "Who Can Do What? IAM Policy Evaluator", ar: "من يستطيع فعل ماذا؟ مُقيِّم سياسات IAM" },
    summary: {
      en: "Implement the core of cloud access control: wildcard matching, conditions, explicit deny that always wins and default deny.",
      ar: "نفّذ جوهر التحكم في الوصول السحابي: مطابقة الرموز العامة والشروط، والرفض الصريح الذي يغلب دائماً، والرفض الافتراضي.",
    },
    description: {
      en: `## The story

Every cloud request ("may \`alice\` read this bucket?") is answered by an **authorisation engine** that looks at the attached policies. The rules are simple to say and easy to get wrong, and getting them wrong is how data leaks happen:

1. Everything is **denied by default** (an *implicit deny*).
2. A matching \`Allow\` statement can open a door.
3. A matching \`Deny\` statement **always wins**, wherever it is written and however many allows match.

You are going to build that engine for a tiny policy language.

## The task

Read some policy statements, then a list of requests, and print the decision for each request.

**Input:**

- Lines starting with \`#\` and blank lines are ignored.
- **Statements**, one per line: \`EFFECT principal action resource\`, optionally followed by \`when key=pattern ...\`. \`EFFECT\` is \`ALLOW\` or \`DENY\`. All tokens are separated by spaces.
- A line containing only \`---\` ends the statements.
- **Requests**, one per line: \`principal action resource\`, optionally followed by attributes \`key=value ...\`.

**Patterns** (principal, action, resource and condition values) are matched against the **whole** text, **case-sensitively**, with two wildcards: \`*\` matches any run of characters (including none, and including \`/\` and \`:\`), and \`?\` matches exactly one character. **Every other character is literal**, including \`.\`, \`+\`, \`(\` and \`[\`. Policies may contain many \`*\`, so your matcher must stay fast.

A statement **applies** to a request when its principal, action and resource patterns all match **and** every \`key=pattern\` condition is met: the request carries an attribute \`key\` and its value matches the pattern. A request without that attribute does not meet the condition.

**Decision**, per request, one line:

- \`DENY explicit\`: at least one applicable \`DENY\` statement;
- else \`ALLOW\`: at least one applicable \`ALLOW\` statement;
- else \`DENY implicit\`.

## Example

\`\`\`text
ALLOW * s3:GetObject arn:aws:s3:::reports/*
ALLOW alice s3:PutObject arn:aws:s3:::reports/drafts/*
DENY * s3:* arn:aws:s3:::reports/secret/*
---
alice s3:GetObject arn:aws:s3:::reports/q1.csv
alice s3:GetObject arn:aws:s3:::reports/secret/plan.txt
bob s3:PutObject arn:aws:s3:::reports/drafts/a.txt
\`\`\`

Output:

\`\`\`text
ALLOW
DENY explicit
DENY implicit
\`\`\`

The first request matches the first allow. The second also matches the allow, but the \`DENY\` on \`reports/secret/*\` wins. The third is a \`PutObject\` by \`bob\`, and the only statement that covers it names \`alice\`, so nothing allows it.`,
      ar: `## القصة

كل طلب سحابي ("هل يستطيع \`alice\` قراءة هذه الحاوية؟") يجيب عنه **محرك تفويض** ينظر في السياسات المرتبطة. القواعد سهلة القول وسهلة الخطأ، والخطأ فيها هو ما يسبب تسرب البيانات:

1. كل شيء **مرفوض افتراضياً** (*رفض ضمني*).
2. عبارة \`Allow\` مطابقة قد تفتح باباً.
3. عبارة \`Deny\` مطابقة **تغلب دائماً**، أينما كُتبت ومهما بلغ عدد عبارات السماح المطابقة.

ستبني هذا المحرك للغة سياسات صغيرة.

## المطلوب

اقرأ بعض عبارات السياسة ثم قائمة طلبات، واطبع القرار لكل طلب.

**المدخل:**

- الأسطر التي تبدأ بـ\`#\` والأسطر الفارغة تُتجاهل.
- **العبارات**، واحدة في كل سطر: \`EFFECT principal action resource\`، ويتبعها اختيارياً \`when key=pattern ...\`. والتأثير \`EFFECT\` هو \`ALLOW\` أو \`DENY\`. وتفصل المسافات بين كل الرموز.
- سطر فيه \`---\` فقط ينهي العبارات.
- **الطلبات**، واحد في كل سطر: \`principal action resource\`، ويتبعه اختيارياً خصائص \`key=value ...\`.

**الأنماط** (الجهة والإجراء والمورد وقيم الشروط) تُطابَق مع النص **كاملاً** و**مع حساسية حالة الأحرف**، وفيها رمزان عامان: \`*\` يطابق أي سلسلة من الأحرف (بما فيها الفارغة، وبما فيها \`/\` و\`:\`)، و\`?\` يطابق حرفاً واحداً بالضبط. و**كل حرف آخر حرفي**، ومنه \`.\` و\`+\` و\`(\` و\`[\`. وقد تحتوي السياسات على كثير من \`*\`، فيجب أن تبقى دالة المطابقة سريعة.

تنطبق العبارة على الطلب حين تتطابق أنماط الجهة والإجراء والمورد كلها **ويتحقق** كل شرط \`key=pattern\`: أي يحمل الطلب خاصية \`key\` وتطابق قيمتها النمط. والطلب الذي لا يحمل تلك الخاصية لا يحقق الشرط.

**القرار**، لكل طلب سطر واحد:

- \`DENY explicit\`: توجد عبارة \`DENY\` منطبقة واحدة على الأقل؛
- وإلا \`ALLOW\`: توجد عبارة \`ALLOW\` منطبقة واحدة على الأقل؛
- وإلا \`DENY implicit\`.

## مثال

\`\`\`text
ALLOW * s3:GetObject arn:aws:s3:::reports/*
ALLOW alice s3:PutObject arn:aws:s3:::reports/drafts/*
DENY * s3:* arn:aws:s3:::reports/secret/*
---
alice s3:GetObject arn:aws:s3:::reports/q1.csv
alice s3:GetObject arn:aws:s3:::reports/secret/plan.txt
bob s3:PutObject arn:aws:s3:::reports/drafts/a.txt
\`\`\`

المخرج:

\`\`\`text
ALLOW
DENY explicit
DENY implicit
\`\`\`

الطلب الأول يطابق عبارة السماح الأولى. والثاني يطابق عبارة السماح أيضاً، لكن \`DENY\` على \`reports/secret/*\` تغلب. والثالث \`PutObject\` من \`bob\`، والعبارة الوحيدة التي تغطيه تذكر \`alice\`، فلا شيء يسمح به.`,
    },
    difficulty: 2,
    points: 150,
    estMinutes: 40,
    kind: "output",
    lang: "python",
    starterCode: {
      python: `import sys


def matches(pattern, text):
    # Your turn: '*' matches any run of characters (even none), '?' exactly one, the rest literally.
    return pattern == text


statements = []  # (effect, principal, action, resource, [(key, pattern), ...])
requests = []    # (principal, action, resource, {key: value})
in_requests = False
for raw in sys.stdin.read().splitlines():
    line = raw.strip()
    if not line or line.startswith("#"):
        continue
    if line == "---":
        in_requests = True
        continue
    parts = line.split()
    if in_requests:
        attrs = dict(token.split("=", 1) for token in parts[3:])
        requests.append((parts[0], parts[1], parts[2], attrs))
    else:
        conditions = [tuple(token.split("=", 1)) for token in parts[5:]] if len(parts) > 4 and parts[4] == "when" else []
        statements.append((parts[0], parts[1], parts[2], parts[3], conditions))

for principal, action, resource, attrs in requests:
    # Your turn: look at every statement, then print ALLOW, DENY explicit or DENY implicit.
    print("DENY implicit")
`,
      javascript: `function matches(pattern, text) {
  // Your turn: '*' matches any run of characters (even none), '?' exactly one, the rest literally.
  return pattern === text;
}

const split = (token) => {
  const at = token.indexOf("=");
  return [token.slice(0, at), token.slice(at + 1)];
};

const statements = []; // { effect, principal, action, resource, conditions: [[key, pattern], ...] }
const requests = []; // { principal, action, resource, attrs: Map }
let inRequests = false;
for (const raw of require("fs").readFileSync(0, "utf8").split(/\\r?\\n/)) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  if (line === "---") {
    inRequests = true;
    continue;
  }
  const parts = line.split(/\\s+/);
  if (inRequests) {
    requests.push({ principal: parts[0], action: parts[1], resource: parts[2], attrs: new Map(parts.slice(3).map(split)) });
  } else {
    const conditions = parts.length > 4 && parts[4] === "when" ? parts.slice(5).map(split) : [];
    statements.push({ effect: parts[0], principal: parts[1], action: parts[2], resource: parts[3], conditions });
  }
}

for (const request of requests) {
  // Your turn: look at every statement, then print ALLOW, DENY explicit or DENY implicit.
  console.log("DENY implicit");
}
`,
    },
    sampleInput: "ALLOW * s3:GetObject arn:aws:s3:::reports/*\nALLOW alice s3:PutObject arn:aws:s3:::reports/drafts/*\nDENY * s3:* arn:aws:s3:::reports/secret/*\n---\nalice s3:GetObject arn:aws:s3:::reports/q1.csv\nalice s3:GetObject arn:aws:s3:::reports/secret/plan.txt\nbob s3:PutObject arn:aws:s3:::reports/drafts/a.txt\n",
    hints: [
      { cost: 12 },
      { cost: 20 },
      { cost: 28 },
    ],
    lessons: ["cloud-computing/cloud-security"],
    tags: ["iam", "policy", "least-privilege", "wildcards"],
    addedAt: "2026-10-07",
  },
  {
    id: "devops-cron-next-run",
    track: "devops",
    topic: "scheduling",
    title: { en: "When Does Cron Run Next?", ar: "متى يعمل cron في المرة القادمة؟" },
    summary: {
      en: "Compute the next fire time of crontab expressions in UTC: lists, ranges, steps, month lengths, leap years and the famous day-of-month OR day-of-week rule.",
      ar: "احسب وقت التشغيل التالي لتعبيرات crontab بتوقيت UTC: القوائم والمجالات والخطوات وأطوال الأشهر والسنوات الكبيسة وقاعدة يوم الشهر أو يوم الأسبوع الشهيرة.",
    },
    description: {
      en: `## The story

Your team's job scheduler runs everything from a crontab. Before a risky change, an engineer wants to know **exactly when each job fires next** ("will the backup collide with the deploy window?"). Sounds easy until you meet months with 28 to 31 days, leap years, and the oldest quirk of cron: the *day-of-month OR day-of-week* rule.

Write the calculator. Everything is **UTC**.

## The task

**Input:**

1. a line with \`now\`, a Unix timestamp in seconds;
2. a line with \`n\`, the number of expressions;
3. \`n\` lines, each a crontab expression of five space-separated fields: \`minute hour day-of-month month day-of-week\`.

**Output:** for each expression, in order, the **first minute strictly after \`now\`** at which it fires, as \`YYYY-MM-DD HH:MM\` (UTC), or \`never\`.

**Field syntax.** Each field is a comma-separated list of items. An item is one of: \`*\` (every value), \`*/n\` (every n-th value, counting from the field's smallest value), \`a\` (one value), \`a-b\` (a range, inclusive), \`a-b/n\` (every n-th value in the range, starting at \`a\`).

| field | allowed values |
|---|---|
| minute | 0-59 |
| hour | 0-23 |
| day-of-month | 1-31 |
| month | 1-12 |
| day-of-week | 0-6 (0 = Sunday) |

All input is valid; there are no names (\`MON\`, \`JAN\`) and no \`@daily\` shortcuts.

**Which days qualify.** The month must be allowed. Then:

- if **neither** the day-of-month field **nor** the day-of-week field starts with \`*\`, a day qualifies when **either** matches (the classic OR rule);
- if at least one of the two starts with \`*\` (\`*\` and \`*/2\` both count), a day qualifies only when **both** match.

**Timing rules.** \`now\` is truncated to its minute and the search starts with the following minute: at \`22:13:59\` the next minute is \`22:14\`, and at exactly \`22:14:00\` it is \`22:15\`. Print \`never\` when the expression matches no real date at all (for example 31 April or 30 February). Any other expression fires within 12 years: 29 February can take up to 8 years, because 2100 is not a leap year.

## Example

\`\`\`text
1700000000
5
* * * * *
*/15 * * * *
0 9 * * 1-5
30 2 29 2 *
59 23 31 12 *
\`\`\`

\`1700000000\` is Tuesday 2023-11-14 22:13:20 UTC. Output:

\`\`\`text
2023-11-14 22:14
2023-11-14 22:15
2023-11-15 09:00
2024-02-29 02:30
2023-12-31 23:59
\`\`\`

The third expression means "09:00 on weekdays": today's 09:00 has passed, so the next one is Wednesday. The fourth needs the next leap day, in 2024.`,
      ar: `## القصة

يشغّل مجدوِل المهام في فريقك كل شيء من ملف crontab. وقبل تغيير محفوف بالمخاطر يريد مهندس أن يعرف **متى بالضبط تعمل كل مهمة في المرة القادمة** ("هل ستصطدم النسخة الاحتياطية بنافذة النشر؟"). يبدو الأمر سهلاً حتى تقابل أشهراً من 28 إلى 31 يوماً، والسنوات الكبيسة، وأقدم غرائب cron: قاعدة *يوم الشهر أو يوم الأسبوع*.

اكتب الحاسبة. كل شيء بتوقيت **UTC**.

## المطلوب

**المدخل:**

1. سطر فيه \`now\`، وهو طابع زمني Unix بالثواني؛
2. سطر فيه \`n\` عدد التعبيرات؛
3. \`n\` من الأسطر، كل منها تعبير crontab من خمسة حقول تفصل بينها مسافات: \`minute hour day-of-month month day-of-week\`.

**المخرج:** لكل تعبير بالترتيب، **أول دقيقة بعد \`now\` تماماً** (بعدها وليس عندها) يعمل فيها، بصيغة \`YYYY-MM-DD HH:MM\` (UTC) أو \`never\`.

**صيغة الحقول.** كل حقل قائمة عناصر تفصل بينها فواصل. والعنصر واحد مما يلي: \`*\` (كل القيم)، \`*/n\` (كل قيمة رقمها n، بالعدّ من أصغر قيمة في الحقل)، \`a\` (قيمة واحدة)، \`a-b\` (مجال شامل للطرفين)، \`a-b/n\` (كل قيمة رقمها n داخل المجال بدءاً من \`a\`).

| الحقل | القيم المسموحة |
|---|---|
| minute | 0-59 |
| hour | 0-23 |
| day-of-month | 1-31 |
| month | 1-12 |
| day-of-week | 0-6 (0 = الأحد) |

كل المدخلات صحيحة؛ ولا توجد أسماء (\`MON\` و\`JAN\`) ولا اختصارات مثل \`@daily\`.

**أي الأيام تصلح.** يجب أن يكون الشهر مسموحاً. ثم:

- إن كان **لا** حقل يوم الشهر **ولا** حقل يوم الأسبوع يبدأ بـ\`*\`، صلح اليوم إذا طابق **أحدهما** (قاعدة OR الكلاسيكية)؛
- وإن بدأ واحد منهما على الأقل بـ\`*\` (فتُحسب \`*\` و\`*/2\`)، لم يصلح اليوم إلا إذا تطابق **الاثنان**.

**قواعد التوقيت.** يُقتطع \`now\` إلى دقيقته ويبدأ البحث بالدقيقة التالية: عند \`22:13:59\` الدقيقة التالية هي \`22:14\`، وعند \`22:14:00\` بالضبط هي \`22:15\`. اطبع \`never\` حين لا يطابق التعبير أي تاريخ حقيقي (مثل 31 أبريل أو 30 فبراير). وأي تعبير آخر يعمل خلال 12 سنة: فقد يستغرق 29 فبراير حتى 8 سنوات، لأن 2100 ليست كبيسة.

## مثال

\`\`\`text
1700000000
5
* * * * *
*/15 * * * *
0 9 * * 1-5
30 2 29 2 *
59 23 31 12 *
\`\`\`

القيمة \`1700000000\` هي الثلاثاء 2023-11-14 الساعة 22:13:20 UTC. المخرج:

\`\`\`text
2023-11-14 22:14
2023-11-14 22:15
2023-11-15 09:00
2024-02-29 02:30
2023-12-31 23:59
\`\`\`

التعبير الثالث يعني "09:00 في أيام العمل": مرّت 09:00 اليوم، فالتالية يوم الأربعاء. والرابع يحتاج إلى يوم الكبس القادم في 2024.`,
    },
    difficulty: 3,
    points: 250,
    estMinutes: 60,
    kind: "output",
    lang: "python",
    starterCode: {
      python: `import sys
from datetime import datetime, timedelta, timezone

lines = sys.stdin.read().split("\\n")
now = int(lines[0])
count = int(lines[1])
start = datetime.fromtimestamp(now // 60 * 60 + 60, timezone.utc)  # the first minute that can fire

for expression in lines[2:2 + count]:
    minute_f, hour_f, day_f, month_f, weekday_f = expression.split()
    # Your turn: expand the five fields, then walk the days from \`start\` until one qualifies.
    print(start.strftime("%Y-%m-%d %H:%M"))
`,
      javascript: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const now = Number(lines[0]);
const count = Number(lines[1]);
const start = new Date((Math.floor(now / 60) * 60 + 60) * 1000); // the first minute that can fire
const pad = (n) => String(n).padStart(2, "0");

for (const expression of lines.slice(2, 2 + count)) {
  const [minuteField, hourField, dayField, monthField, weekdayField] = expression.split(/\\s+/);
  // Your turn: expand the five fields, then walk the days from \`start\` until one qualifies.
  console.log(\`\${start.getUTCFullYear()}-\${pad(start.getUTCMonth() + 1)}-\${pad(start.getUTCDate())} \${pad(start.getUTCHours())}:\${pad(start.getUTCMinutes())}\`);
}
`,
    },
    sampleInput: "1700000000\n5\n* * * * *\n*/15 * * * *\n0 9 * * 1-5\n30 2 29 2 *\n59 23 31 12 *\n",
    hints: [
      { cost: 25 },
      { cost: 35 },
      { cost: 40 },
    ],
    lessons: ["devops/linux-devops", "devops/cicd"],
    tags: ["cron", "scheduling", "datetime", "parsing"],
    addedAt: "2026-10-07",
  },
  {
    id: "net-frame-dissect",
    track: "networking",
    topic: "packet-analysis",
    title: { en: "Frame by Frame", ar: "إطاراً بعد إطار" },
    summary: {
      en: "Dissect a raw capture layer by layer (Ethernet, VLAN, IPv4, TCP) to reach an HTTP request and unmask the secret inside it.",
      ar: "فكّك لقطة شبكة خاماً طبقةً طبقة (Ethernet وVLAN وIPv4 وTCP) لتصل إلى طلب HTTP وتكشف السر المقنَّع بداخله.",
    },
    description: {
      en: `## The story

The security team mirrors a switch port onto an analysis box. During an incident review an analyst found that someone submitted a support ticket to an internal helpdesk **over plain HTTP** and included an API secret. The secret was not sent in the clear: the client library "protects" it by masking it with the address of the machine it talks to.

The capture below holds the whole short conversation. No Wireshark, no tools: you only have hex digits, the layer diagrams from your networking course, and a pencil (or a few lines of code in Code Lab).

## What you know

- The capture has **four frames**, numbered in the file, dumped like \`hexdump -C\`: an offset, 16 bytes in hex, and the printable characters between \`|\` bars. Offsets restart at 0 in every frame.
- Every frame is shown **exactly as it came off the wire**, including a trailing 4-byte **Ethernet FCS** (a checksum, not data).
- Exactly one frame carries an **HTTP request**. Its form body contains a field \`token=\`: the secret, in **lowercase hex**, masked like this: take the secret as ASCII bytes and XOR byte *i* with byte *(i mod 4)* of the **destination IPv4 address from that same packet** (the four address bytes repeat).
- The flag has the usual shape \`IMB{...}\`, with the unmasked secret between the braces.

## Layer cheat sheet

| Layer | Where the interesting bytes are |
|---|---|
| Ethernet II | 6 bytes destination MAC, 6 bytes source MAC, 2 bytes EtherType. EtherType \`81 00\` means an **802.1Q VLAN tag** follows: 2 bytes tag, then the real 2-byte EtherType (\`08 00\` = IPv4). |
| IPv4 | byte 0: version (high nibble) and **IHL** (low nibble, in 32-bit words, so the header is \`IHL x 4\` bytes and may include options); bytes 2-3: **total length** (header + data); byte 9: protocol (\`06\` = TCP); bytes 12-15: source address; bytes 16-19: **destination address**. |
| TCP | bytes 0-1: source port; bytes 2-3: destination port; byte 12: **data offset** (high nibble, in 32-bit words, so the header is \`offset x 4\` bytes, options included). The segment data follows. |

## Worked example (not from the capture)

An IPv4 header starting with \`45 00 00 28 ...\` has version 4 and IHL 5, so it is 20 bytes long and its total length is 0x0028 = 40 bytes. Masking the two ASCII bytes of \`ok\` (\`6f 6b\`) with the address \`10.0.0.7\` (\`0a 00 00 07\`) gives \`6f ^ 0a = 65\` and \`6b ^ 00 = 6b\`, that is \`656b\` as lowercase hex. Unmasking is the same operation again.

## The task

Find the HTTP request in \`capture.txt\`, unmask its token and submit the flag.`,
      ar: `## القصة

يعكس فريق الأمن منفذاً في المبدّل (switch) إلى جهاز تحليل. وأثناء مراجعة حادثة لاحظ محلل أن شخصاً أرسل تذكرة دعم إلى خدمة مساعدة داخلية **عبر HTTP العادي** وضمّنها سراً لواجهة برمجية. لم يُرسل السر صريحاً: فمكتبة العميل "تحميه" بإخفائه بعنوان الجهاز الذي تتحدث إليه.

تحتوي اللقطة أدناه المحادثة القصيرة كلها. لا Wireshark ولا أدوات: لا تملك إلا الأرقام السداسية عشرية ومخططات الطبقات من مقرر الشبكات وقلماً (أو بضعة أسطر برمجية في Code Lab).

## ما تعرفه

- في اللقطة **أربعة إطارات** مرقّمة في الملف ومفرّغة بأسلوب \`hexdump -C\`: إزاحة، و16 بايتاً بالنظام السداسي عشري، والحروف القابلة للطباعة بين خطّين \`|\`. وتبدأ الإزاحات من 0 في كل إطار.
- كل إطار معروض **تماماً كما خرج من السلك**، بما فيه **FCS الخاص بـEthernet** من 4 بايت في آخره (مجموع اختباري وليس بيانات).
- إطار واحد بالضبط يحمل **طلب HTTP**. وفي جسم نموذجه حقل \`token=\`: وهو السر بـ**نظام سداسي عشري بأحرف صغيرة**، مقنَّع هكذا: خذ السر كبايتات ASCII واجمع (XOR) البايت *i* مع البايت *(i mod 4)* من **عنوان IPv4 الوجهة في الحزمة نفسها** (تتكرر بايتات العنوان الأربعة).
- للعلم الشكل المعتاد \`IMB{...}\`، ويكون السر بعد كشفه بين القوسين.

## ورقة غش الطبقات

| الطبقة | أين البايتات المهمة |
|---|---|
| Ethernet II | 6 بايت لعنوان MAC الوجهة، و6 بايت لعنوان MAC المصدر، و2 بايت لـEtherType. القيمة \`81 00\` تعني أن **وسم VLAN وفق 802.1Q** يليها: 2 بايت للوسم ثم EtherType الحقيقي من 2 بايت (\`08 00\` = IPv4). |
| IPv4 | البايت 0: الإصدار (النصف الأعلى) و**IHL** (النصف الأدنى، بكلمات 32 بت، فطول الترويسة \`IHL x 4\` بايت وقد تتضمن خيارات)؛ البايتان 2-3: **الطول الكلي** (الترويسة + البيانات)؛ البايت 9: البروتوكول (\`06\` = TCP)؛ البايتات 12-15: عنوان المصدر؛ البايتات 16-19: **عنوان الوجهة**. |
| TCP | البايتان 0-1: منفذ المصدر؛ البايتان 2-3: منفذ الوجهة؛ البايت 12: **إزاحة البيانات** (النصف الأعلى، بكلمات 32 بت، فطول الترويسة \`offset x 4\` بايت بما فيها الخيارات). وبعدها بيانات المقطع. |

## مثال محلول (ليس من اللقطة)

ترويسة IPv4 تبدأ بـ\`45 00 00 28 ...\` إصدارها 4 وIHL فيها 5، فطولها 20 بايتاً وطولها الكلي 0x0028 = 40 بايتاً. وإخفاء بايتي ASCII للكلمة \`ok\` (\`6f 6b\`) بالعنوان \`10.0.0.7\` (\`0a 00 00 07\`) يعطي \`6f ^ 0a = 65\` و\`6b ^ 00 = 6b\`، أي \`656b\` بالنظام السداسي عشري بأحرف صغيرة. وكشف الإخفاء هو العملية نفسها مرة أخرى.

## المطلوب

جد طلب HTTP في \`capture.txt\` واكشف قيمة token فيه ثم أرسل العلم.`,
    },
    difficulty: 3,
    points: 250,
    estMinutes: 50,
    kind: "flag",
    flagFormat: "IMB{...}",
    files: [
      {
        name: "capture.txt",
        content: `# Mirror-port capture, 4 frames, hexdump -C style (offsets restart at every frame).
# Every frame ends with its 4-byte Ethernet FCS, exactly as it came off the wire.

frame 1 (82 bytes)
00000000  08 00 27 a1 b2 c3 52 54  00 12 35 02 81 00 00 2a  |..'...RT..5....*|
00000010  08 00 45 00 00 3c 3a 11  40 00 40 06 01 fb c0 00  |..E..<:.@.@.....|
00000020  02 75 cb 00 71 3a ca 82  1f 90 00 00 03 e8 00 00  |.u..q:..........|
00000030  00 00 a0 02 fa f0 3b 3d  00 00 02 04 05 b4 04 02  |......;=........|
00000040  08 0a 18 9c 0c 8b 00 00  00 00 01 03 03 07 31 36  |..............16|
00000050  46 31                                             |F1|

frame 2 (82 bytes)
00000000  52 54 00 12 35 02 08 00  27 a1 b2 c3 81 00 00 2a  |RT..5...'......*|
00000010  08 00 45 00 00 3c 00 00  40 00 40 06 3c 0c cb 00  |..E..<..@.@.<...|
00000020  71 3a c0 00 02 75 1f 90  ca 82 00 00 13 88 00 00  |q:...u..........|
00000030  03 e9 a0 12 fe 88 5d 7b  00 00 02 04 05 b4 04 02  |......]{........|
00000040  08 0a 05 e3 c0 ad 18 9c  0c 8b 01 03 03 07 9d ff  |................|
00000050  01 ff                                             |..|

frame 3 (351 bytes)
00000000  08 00 27 a1 b2 c3 52 54  00 12 35 02 81 00 00 2a  |..'...RT..5....*|
00000010  08 00 46 00 01 49 3a 12  40 00 40 06 6b e8 c0 00  |..F..I:.@.@.k...|
00000020  02 75 cb 00 71 3a 94 04  00 00 ca 82 1f 90 00 00  |.u..q:..........|
00000030  03 e9 00 00 13 89 80 18  01 f6 12 83 00 00 01 01  |................|
00000040  08 0a 18 9c 0c 8e 05 e3  c0 ad 50 4f 53 54 20 2f  |..........POST /|
00000050  61 70 69 2f 76 32 2f 73  75 70 70 6f 72 74 2f 74  |api/v2/support/t|
00000060  69 63 6b 65 74 73 20 48  54 54 50 2f 31 2e 31 0d  |ickets HTTP/1.1.|
00000070  0a 48 6f 73 74 3a 20 68  65 6c 70 64 65 73 6b 2e  |.Host: helpdesk.|
00000080  63 6f 72 70 2e 65 78 61  6d 70 6c 65 0d 0a 55 73  |corp.example..Us|
00000090  65 72 2d 41 67 65 6e 74  3a 20 63 75 72 6c 2f 38  |er-Agent: curl/8|
000000a0  2e 35 2e 30 0d 0a 41 63  63 65 70 74 3a 20 2a 2f  |.5.0..Accept: */|
000000b0  2a 0d 0a 43 6f 6e 74 65  6e 74 2d 54 79 70 65 3a  |*..Content-Type:|
000000c0  20 61 70 70 6c 69 63 61  74 69 6f 6e 2f 78 2d 77  | application/x-w|
000000d0  77 77 2d 66 6f 72 6d 2d  75 72 6c 65 6e 63 6f 64  |ww-form-urlencod|
000000e0  65 64 0d 0a 43 6f 6e 74  65 6e 74 2d 4c 65 6e 67  |ed..Content-Leng|
000000f0  74 68 3a 20 39 37 0d 0a  0d 0a 75 73 65 72 3d 61  |th: 97....user=a|
00000100  2e 6e 61 73 73 65 72 26  73 75 62 6a 65 63 74 3d  |.nasser&subject=|
00000110  56 50 4e 2b 6b 65 65 70  73 2b 64 72 6f 70 70 69  |VPN+keeps+droppi|
00000120  6e 67 26 74 6f 6b 65 6e  3d 62 63 36 39 30 33 35  |ng&token=bc69035|
00000130  66 39 34 33 33 31 34 35  65 66 39 33 32 34 37 30  |f9433145ef932470|
00000140  62 61 66 33 36 34 39 30  65 61 66 36 34 34 35 30  |baf36490eaf64450|
00000150  39 66 63 33 32 34 35 35  63 66 62 8c e3 8f 7e     |9fc32455cfb...~|

frame 4 (235 bytes)
00000000  52 54 00 12 35 02 08 00  27 a1 b2 c3 81 00 00 2a  |RT..5...'......*|
00000010  08 00 45 00 00 d5 9c 40  40 00 40 06 9f 32 cb 00  |..E....@@.@..2..|
00000020  71 3a c0 00 02 75 1f 90  ca 82 00 00 13 89 00 00  |q:...u..........|
00000030  04 fa 80 18 01 fd b7 2e  00 00 01 01 08 0a 05 e3  |................|
00000040  c1 29 18 9c 0c 8e 48 54  54 50 2f 31 2e 31 20 32  |.)....HTTP/1.1 2|
00000050  30 32 20 41 63 63 65 70  74 65 64 0d 0a 43 6f 6e  |02 Accepted..Con|
00000060  74 65 6e 74 2d 54 79 70  65 3a 20 61 70 70 6c 69  |tent-Type: appli|
00000070  63 61 74 69 6f 6e 2f 6a  73 6f 6e 0d 0a 43 6f 6e  |cation/json..Con|
00000080  74 65 6e 74 2d 4c 65 6e  67 74 68 3a 20 38 34 0d  |tent-Length: 84.|
00000090  0a 0d 0a 7b 22 73 74 61  74 75 73 22 3a 22 71 75  |...{"status":"qu|
000000a0  65 75 65 64 22 2c 22 74  69 63 6b 65 74 22 3a 22  |eued","ticket":"|
000000b0  48 44 2d 34 38 32 31 33  22 2c 22 72 65 63 65 69  |HD-48213","recei|
000000c0  70 74 22 3a 22 35 30 64  64 30 37 63 64 35 64 62  |pt":"50dd07cd5db|
000000d0  39 31 37 30 33 37 30 62  30 36 30 31 61 38 36 63  |9170370b0601a86c|
000000e0  35 33 37 35 34 22 7d b1  68 78 3f                 |53754"}.hx?|
`,
        description: { en: "Four frames from the mirror port, as a hex dump (hexdump -C style, one block per frame)", ar: "أربعة إطارات من منفذ المراقبة (mirror port) على شكل تفريغ سداسي عشري (بأسلوب hexdump -C، كتلة لكل إطار)" },
      },
    ],
    hints: [
      { cost: 25 },
      { cost: 35 },
      { cost: 40 },
    ],
    lessons: ["networking/osi-tcpip", "networking/transport-tcp-udp"],
    tags: ["packet-analysis", "ethernet", "ipv4", "tcp", "hexdump", "xor"],
    addedAt: "2026-10-07",
  },
];
