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
      {
        text: {
          en: "Do not multiply the whole usage by one price. Each tier prices only the slice of usage that falls inside it.",
          ar: "لا تضرب الاستهلاك كله بسعر واحد. كل شريحة تُسعِّر فقط الجزء من الاستهلاك الذي يقع داخلها.",
        },
        cost: 4,
      },
      {
        text: {
          en: "Walk the tiers in order and remember where the previous one ended (`floor`). The slice is `min(usage, limit) - floor`, and you can stop as soon as `usage <= floor`.",
          ar: "امشِ على الشرائح بالترتيب وتذكّر أين انتهت الشريحة السابقة (`floor`). حجم الجزء هو `min(usage, limit) - floor`، ويمكنك التوقف حالما يصبح `usage <= floor`.",
        },
        cost: 6,
      },
      {
        text: {
          en: "Read the limit `inf` as a floating-point infinity (`float('inf')` in Python, `Infinity` in JavaScript), so the last tier needs no special case.",
          ar: "اقرأ الحد `inf` كما هو اللانهاية العشرية (`float('inf')` في Python و`Infinity` في JavaScript)، فلا تحتاج الشريحة الأخيرة إلى معاملة خاصة.",
        },
        cost: 10,
      },
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
      {
        text: {
          en: "Keep three things: a list of `k` frames (use `None` for an empty one), a parallel list of reference bits, and the hand position. A hit only sets the page's bit to 1; the hand does not move.",
          ar: "احتفظ بثلاثة أشياء: قائمة من `k` إطاراً (استخدم `None` للإطار الفارغ)، وقائمة موازية لبتات المرجع، وموضع المؤشر. الإصابة تضبط بتّ الصفحة على 1 فقط، ولا يتحرك المؤشر.",
        },
        cost: 5,
      },
      {
        text: {
          en: "On a fault, loop: if the frame under the hand is empty or its bit is 0, replace it, set the new bit to 1 and advance the hand, then stop. Otherwise clear the bit to 0, advance the hand (wrap with `% k`) and look again.",
          ar: "عند الخطأ كرّر: إن كان الإطار تحت المؤشر فارغاً أو بتّه 0 فاستبدله واضبط البتّ الجديد على 1 وحرّك المؤشر ثم توقف. وإلا فأعد البتّ إلى 0 وحرّك المؤشر (مع `% k` للالتفاف) وانظر مجدداً.",
        },
        cost: 6,
      },
      {
        text: {
          en: "Do not test emptiness with `if not frames[hand]`: page number 0 is valid and falsy. Compare with `None` explicitly.",
          ar: "لا تفحص الفراغ بـ `if not frames[hand]`: رقم الصفحة 0 صالح لكنه يُعدّ قيمة خاطئة. قارن مع `None` صراحةً.",
        },
        cost: 9,
      },
    ],
    lessons: ["operating-systems/memory-management"],
    tags: ["page-replacement", "clock", "second-chance", "simulation"],
    addedAt: "2026-10-07",
  },
];
