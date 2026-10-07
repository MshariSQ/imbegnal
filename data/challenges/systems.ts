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
];
