import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "statistics",
  title: { en: "Statistics — Making Sense of Data", ar: "الإحصاء — فهم البيانات" },
  estMinutes: 40,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- **Mean, median, mode** — and when each lies
- **Spread**: why the average alone fools you
- Probability basics
- You'll compute real statistics in Python`,
        ar: `## ماذا ستتعلم

- **المتوسط، الوسيط، المنوال** — ومتى يخدعك كلٌّ منها
- **التشتت**: لماذا يخدعك المتوسط وحده
- أساسيات الاحتمال
- ستحسب إحصاءات حقيقية ببايثون`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The averages that lie 📊

Data science begins with statistics: the art of summarizing many numbers into a few that tell the truth (or a lie, if you're careless).

**Three "middles":**
- **Mean** (average) — add everything, divide by count. \`[2,4,6]\` → 4.
- **Median** — the middle value when sorted. \`[2,4,90]\` → 4. Notice the mean is 32, but the median is 4!
- **Mode** — the most frequent value.

**Why it matters:** imagine 9 workers earn \$40k and the boss earns \$1,000k. The **mean** salary is \$136k — a number *nobody* actually earns. The **median** is \$40k — the honest "typical" worker. Outliers (extreme values) wreck the mean but barely move the median. This is the #1 way statistics mislead people, so always ask *which* average.

**Spread tells the rest of the story.** Two classes both average 70% on a test. Class A: everyone scored 68–72. Class B: half scored 40, half scored 100. Same mean, totally different reality. **Standard deviation** measures this spread — small = clustered, large = scattered. The average without the spread is half a story.

**Probability** is just "how likely, from 0 to 1." A fair coin: P(heads) = 0.5. It underlies everything predictive — a spam filter really outputs "0.92 probability this is spam."

These aren't abstract: every chart you'll build and every model you'll train rests on knowing what your numbers actually *say*.`,
        ar: `## المتوسطات التي تكذب 📊

علم البيانات يبدأ بالإحصاء: فن تلخيص أرقام كثيرة إلى قليلة تقول الحقيقة (أو كذبة، إن كنت مهملاً).

**ثلاثة "أوساط":**
- **المتوسط (Mean)** — اجمع الكل، اقسم على العدد. \`[2,4,6]\` ← 4.
- **الوسيط (Median)** — القيمة الوسطى بعد الترتيب. \`[2,4,90]\` ← 4. لاحظ أن المتوسط 32، لكن الوسيط 4!
- **المنوال (Mode)** — القيمة الأكثر تكراراً.

**لماذا يهم:** تخيّل 9 عمّال يكسبون 40 ألفاً والمدير يكسب مليوناً. **متوسط** الراتب 136 ألفاً — رقم *لا أحد* يكسبه فعلاً. أما **الوسيط** فهو 40 ألفاً — العامل "النمطي" الصادق. القيم الشاذة (المتطرفة) تدمّر المتوسط لكنها بالكاد تحرّك الوسيط. هذه أشيع طريقة تُضلِّل بها الإحصاءات الناس، فاسأل دائماً *أيّ* متوسط.

**التشتت يروي بقية القصة.** فصلان متوسطهما 70% في اختبار. الفصل أ: الجميع بين 68–72. الفصل ب: النصف 40، والنصف 100. نفس المتوسط، واقع مختلف تماماً. **الانحراف المعياري** يقيس هذا التشتت — صغير = متجمّع، كبير = متناثر. المتوسط بلا التشتت نصف قصة.

**الاحتمال** مجرد "ما مدى الترجيح، من 0 إلى 1." عملة عادلة: P(صورة) = 0.5. يقوم عليه كل ما هو تنبؤي — مرشّح البريد المزعج فعلياً يُخرج "احتمال 0.92 أن هذا مزعج."

هذه ليست تجريدية: كل رسم بياني ستبنيه وكل نموذج ستدرّبه يقوم على معرفة ما تقوله أرقامك فعلاً.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Compute the two most important statistics. Write \`mean(nums)\` and \`median(nums)\`:
- \`mean\` = sum ÷ count
- \`median\` = the middle value after sorting (for an even count, average the two middle values)

Example: \`median([3, 1, 2])\` → \`2\`; \`median([1, 2, 3, 4])\` → \`2.5\``,
        ar: `احسب أهم إحصائيتين. اكتب \`mean(nums)\` و\`median(nums)\`:
- \`mean\` = المجموع ÷ العدد
- \`median\` = القيمة الوسطى بعد الترتيب (للعدد الزوجي، متوسط القيمتين الوسطيين)

مثال: \`median([3, 1, 2])\` ← \`2\`؛ \`median([1, 2, 3, 4])\` ← \`2.5\``,
      },
      starterCode: `def mean(nums):
    return sum(nums) / len(nums)

def median(nums):
    s = sorted(nums)
    n = len(s)
    # if n is odd -> middle element s[n//2]
    # if n is even -> average of s[n//2 - 1] and s[n//2]
    pass

print(mean([2, 4, 6]))        # 4.0
print(median([3, 1, 2]))      # 2
print(median([1, 2, 3, 4]))   # 2.5`,
      solution: `def mean(nums):
    return sum(nums) / len(nums)

def median(nums):
    s = sorted(nums)
    n = len(s)
    if n % 2 == 1:
        return s[n // 2]
    return (s[n // 2 - 1] + s[n // 2]) / 2

print(mean([2, 4, 6]))        # 4.0
print(median([3, 1, 2]))      # 2
print(median([1, 2, 3, 4]))   # 2.5`,
      hints: [
        { en: `Sort first: s = sorted(nums). Odd length → s[n//2].`, ar: `رتّب أولاً: s = sorted(nums). طول فردي ← s[n//2].` },
        { en: `Even length → (s[n//2 - 1] + s[n//2]) / 2.`, ar: `طول زوجي ← (s[n//2 - 1] + s[n//2]) / 2.` },
      ],
      tests: [
        { name: { en: "mean([2,4,6]) is 4", ar: "mean([2,4,6]) يساوي 4" }, check: `assert mean([2,4,6]) == 4` },
        { name: { en: "median of odd list", ar: "وسيط قائمة فردية" }, check: `assert median([3,1,2]) == 2` },
        { name: { en: "median of even list", ar: "وسيط قائمة زوجية" }, check: `assert median([1,2,3,4]) == 2.5` },
        { name: { en: "median resists an outlier", ar: "الوسيط يقاوم قيمة شاذة" }, check: `assert median([2,4,90]) == 4` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "9 people earn $40k, 1 earns $1M. Which is the honest 'typical' value?", ar: "9 أشخاص يكسبون 40 ألفاً، وواحد يكسب مليوناً. أيّها القيمة 'النمطية' الصادقة؟" },
          choices: [
            { en: "The mean (~$136k)", ar: "المتوسط (~136 ألفاً)" },
            { en: "The median ($40k)", ar: "الوسيط (40 ألفاً)" },
            { en: "Neither is useful", ar: "لا فائدة من أيهما" },
          ],
          answer: 1,
          explain: {
            en: "The outlier drags the mean to a value no one earns. The median ($40k) reflects the typical person. Ask which average!",
            ar: "القيمة الشاذة تجرّ المتوسط إلى رقم لا أحد يكسبه. الوسيط (40 ألفاً) يعكس الشخص النمطي. اسأل أيّ متوسط!",
          },
        },
        {
          q: { en: "Two classes average 70%. Why might they be very different?", ar: "فصلان متوسطهما 70%. لماذا قد يختلفان كثيراً؟" },
          choices: [
            { en: "They can't differ — same mean means same data", ar: "لا يمكن أن يختلفا — نفس المتوسط يعني نفس البيانات" },
            { en: "Spread differs: one clustered, one split between extremes", ar: "التشتت يختلف: أحدهما متجمّع، والآخر منقسم بين الأطراف" },
            { en: "Because of probability", ar: "بسبب الاحتمال" },
          ],
          answer: 1,
          explain: {
            en: "Standard deviation captures spread. Same mean, different spread = very different realities. Never report a mean alone.",
            ar: "الانحراف المعياري يلتقط التشتت. نفس المتوسط، تشتت مختلف = واقعان مختلفان جداً. لا تذكر المتوسط وحده أبداً.",
          },
        },
        {
          q: { en: "A probability of 0.92 means…", ar: "احتمال 0.92 يعني…" },
          choices: [
            { en: "Highly likely (92%)", ar: "مرجّح جداً (92%)" },
            { en: "Impossible", ar: "مستحيل" },
            { en: "Exactly 92 times", ar: "بالضبط 92 مرة" },
          ],
          answer: 0,
          explain: {
            en: "Probability runs 0 (never) to 1 (certain). 0.92 = very likely — like a spam filter's confidence a message is spam.",
            ar: "الاحتمال من 0 (أبداً) إلى 1 (مؤكد). و0.92 = مرجّح جداً — كثقة مرشّح البريد أن رسالة مزعجة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Mean vs median vs mode — outliers wreck the mean, median stays honest
- Spread (standard deviation) is as important as the average
- Probability (0–1) underlies all prediction
- You coded mean and median from scratch

**Next:** Python for Data — pandas, the tool that makes real-world data analysis fast.`,
        ar: `## الخلاصة

- المتوسط مقابل الوسيط مقابل المنوال — القيم الشاذة تدمّر المتوسط، والوسيط يبقى صادقاً
- التشتت (الانحراف المعياري) لا يقل أهمية عن المتوسط
- الاحتمال (0–1) يقوم عليه كل تنبؤ
- برمجت المتوسط والوسيط من الصفر

**التالي:** بايثون للبيانات — pandas، الأداة التي تجعل تحليل بيانات الواقع سريعاً.`,
      },
    },
  ],
};
