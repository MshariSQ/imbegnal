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
      type: "text",
      body: {
        en: `## Correlation is not causation 🔗

Once you can summarize one variable (mean, median, spread), the next question is almost always: **do two variables move together?** That's **correlation** — a number from **-1 to 1** describing how closely two variables track each other.

- **+1** — perfect positive: as one goes up, the other always goes up too (e.g. height and shoe size).
- **-1** — perfect negative: as one goes up, the other always goes down (e.g. price and quantity sold, roughly).
- **0** — no relationship at all.

In Python, \`df["ice_cream_sales"].corr(df["temperature"])\` might return something like \`0.85\` — a strong positive correlation. Tempting conclusion: "heat makes people buy ice cream!" That one's probably true — but the general trap is real: **correlation only tells you two things move together, never that one causes the other.**

The classic teaching example: ice cream sales and drowning deaths are strongly correlated across the year. Does ice cream cause drowning? No — a **hidden third variable** (hot summer weather) drives both: more people swim *and* more people buy ice cream. This hidden driver is called a **confounding variable**, and hunting for it is one of the most important habits a data scientist builds. Every time you see "X correlates with Y" in a headline, ask: *could something else be causing both?*

This is why real experiments (like A/B tests, covered elsewhere) exist — they're the main tool that lets you go from "these move together" to "this actually causes that."`,
        ar: `## الارتباط ليس سببية 🔗

بعد أن تستطيع تلخيص متغير واحد (متوسط، وسيط، تشتت)، يكون السؤال التالي غالباً: **هل يتحرّك متغيران معاً؟** هذا هو **الارتباط (correlation)** — رقم من **-1 إلى 1** يصف مدى تتبّع متغيرين لبعضهما.

- **+1** — ارتباط موجب تام: كلما ارتفع أحدهما ارتفع الآخر دائماً (مثل الطول ومقاس الحذاء).
- **-1** — ارتباط سالب تام: كلما ارتفع أحدهما انخفض الآخر (مثل السعر والكمية المُباعة، تقريباً).
- **0** — لا علاقة إطلاقاً.

في بايثون، \`df["ice_cream_sales"].corr(df["temperature"])\` قد تُعيد شيئاً كـ\`0.85\` — ارتباط موجب قوي. الاستنتاج المُغري: "الحر يجعل الناس يشترون الآيس كريم!" هذا على الأرجح صحيح — لكن الفخ العام حقيقي: **الارتباط يخبرك فقط أن متغيرين يتحركان معاً، أبداً أن أحدهما يسبب الآخر.**

المثال التعليمي الكلاسيكي: مبيعات الآيس كريم وحالات الغرق مرتبطة بقوة عبر العام. هل يسبب الآيس كريم الغرق؟ لا — **متغير ثالث خفي** (حرارة الصيف) يقود كليهما: مزيد من الناس يسبحون *و*مزيد منهم يشتري آيس كريم. هذا المحرّك الخفي يُسمّى **متغيراً مُربكاً (confounding variable)**، والبحث عنه من أهم العادات التي يبنيها عالِم البيانات. في كل مرة ترى "X يرتبط بـY" في عنوان خبر، اسأل: *هل قد يكون شيء آخر يسبب كليهما؟*

لهذا توجد التجارب الحقيقية (مثل اختبارات A/B، مذكورة في مكان آخر) — إنها الأداة الرئيسية التي تنقلك من "هذان يتحركان معاً" إلى "هذا يسبب ذاك فعلاً".`,
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
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Write \`same_direction_count(xs, ys)\` — a tiny taste of correlation without any library. Given two equal-length lists, count how many **consecutive pairs** move in the "same direction": both increase, or both decrease, from one index to the next.

Example: \`xs=[1,2,3,4]\`, \`ys=[5,6,5,8]\` → steps: xs always rises; ys rises, falls, rises → matches at steps 0 and 2 → \`2\`. This is the intuition behind correlation: do two series tend to move together?`,
        ar: `اكتب \`same_direction_count(xs, ys)\` — لمحة صغيرة عن الارتباط دون أي مكتبة. بمعطى قائمتين متساويتي الطول، عُدّ كم **زوجاً متتالياً** يتحرك في "نفس الاتجاه": كلاهما يزيد، أو كلاهما ينقص، من فهرس للذي يليه.

مثال: \`xs=[1,2,3,4]\`، \`ys=[5,6,5,8]\` ← الخطوات: xs يرتفع دائماً؛ ys يرتفع ثم ينخفض ثم يرتفع ← تطابق في الخطوتين 0 و2 ← \`2\`. هذه هي الحدس وراء الارتباط: هل تميل سلسلتان للتحرك معاً؟`,
      },
      starterCode: `def same_direction_count(xs, ys):
    count = 0
    # for each consecutive pair of indices i, i+1:
    #   x_up = xs[i+1] > xs[i]
    #   y_up = ys[i+1] > ys[i]
    #   if x_up == y_up: count += 1
    return count

print(same_direction_count([1,2,3,4], [5,6,5,8]))  # 2`,
      solution: `def same_direction_count(xs, ys):
    count = 0
    for i in range(len(xs) - 1):
        x_up = xs[i+1] > xs[i]
        y_up = ys[i+1] > ys[i]
        if x_up == y_up:
            count += 1
    return count

print(same_direction_count([1,2,3,4], [5,6,5,8]))  # 2`,
      hints: [
        { en: `Loop over range(len(xs) - 1) so you always have an i+1 to compare against.`, ar: `كرّر عبر range(len(xs) - 1) كي يكون لديك دائماً i+1 للمقارنة معه.` },
        { en: `x_up = xs[i+1] > xs[i]; y_up = ys[i+1] > ys[i]; count when they're equal (both True or both False).`, ar: `x_up = xs[i+1] > xs[i]؛ y_up = ys[i+1] > ys[i]؛ عُدّ حين يتساويان (كلاهما True أو كلاهما False).` },
      ],
      tests: [
        { name: { en: "Example gives 2", ar: "المثال يعطي 2" }, check: `assert same_direction_count([1,2,3,4],[5,6,5,8]) == 2` },
        { name: { en: "Perfectly matching direction", ar: "اتجاه متطابق تماماً" }, check: `assert same_direction_count([1,2,3],[10,20,30]) == 2` },
        { name: { en: "Perfectly opposite direction", ar: "اتجاه معاكس تماماً" }, check: `assert same_direction_count([1,2,3],[30,20,10]) == 0` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Anscombe's Quartet 🔍

In 1973, statistician Francis Anscombe built four small datasets — now called **Anscombe's Quartet** — that each have nearly **identical** mean, variance, and correlation. If you only looked at the summary numbers, you'd think all four datasets were the same.

They aren't. When plotted, the four look completely different: one is a clean straight-line relationship, one is a clear curve that a straight-line summary misrepresents, one is a perfect line wrecked by a single outlier, and one is a vertical cluster driven entirely by one extreme point. Same statistics, four totally different stories.

Anscombe built this specifically to warn statisticians against trusting summary numbers alone. It's the direct ancestor of the advice in this lesson and the next one on visualization: **always plot your data.** A mean, a median, and a correlation coefficient are useful shorthand — but they can hide a shape your eyes would catch in half a second.`,
        ar: `## دراسة حالة واقعية: رباعية أنسكومب 🔍

في 1973، بنى الإحصائي فرانسيس أنسكومب أربع مجموعات بيانات صغيرة — تُعرف الآن بـ**رباعية أنسكومب (Anscombe's Quartet)** — لكل منها متوسط وتباين وارتباط **شبه متطابق**. لو نظرت فقط إلى الأرقام الملخِّصة، لظننت أن المجموعات الأربع متماثلة.

لكنها ليست كذلك. عند رسمها، تبدو الأربع مختلفة تماماً: واحدة علاقة خطية نظيفة، وأخرى منحنى واضح يسيء الملخّص الخطي تمثيله، وثالثة خط تام دمّرته قيمة شاذة واحدة، ورابعة تجمّع عمودي يقوده بالكامل نقطة واحدة متطرفة. نفس الإحصاءات، أربع قصص مختلفة تماماً.

بنى أنسكومب هذا خصيصاً ليحذّر الإحصائيين من الثقة بالأرقام الملخِّصة وحدها. إنه السلف المباشر للنصيحة في هذا الدرس والدرس التالي عن التصوير المرئي: **ارسم بياناتك دائماً.** المتوسط والوسيط ومعامل الارتباط اختصارات مفيدة — لكنها قد تخفي شكلاً كانت عيناك ستلتقطانه خلال نصف ثانية.`,
      },
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
        {
          q: { en: "Ice cream sales and drowning deaths correlate strongly. Why?", ar: "مبيعات الآيس كريم وحالات الغرق مرتبطة بقوة. لماذا؟" },
          choices: [
            { en: "Ice cream directly causes drowning", ar: "الآيس كريم يسبب الغرق مباشرة" },
            { en: "A confounding variable (hot weather) drives both", ar: "متغيّر مُربك (الطقس الحار) يقود كليهما" },
            { en: "Correlation numbers are always wrong", ar: "أرقام الارتباط خاطئة دائماً" },
          ],
          answer: 1,
          explain: {
            en: "Hot weather makes people swim more AND buy more ice cream. Correlation ≠ causation — always hunt for a hidden driver.",
            ar: "الطقس الحار يجعل الناس يسبحون أكثر ويشترون آيس كريماً أكثر. الارتباط لا يعني السببية — ابحث دائماً عن محرّك خفي.",
          },
        },
        {
          q: { en: "What did Anscombe's Quartet prove?", ar: "ماذا أثبتت رباعية أنسكومب؟" },
          choices: [
            { en: "Datasets with nearly identical statistics can look completely different when plotted", ar: "مجموعات بيانات بإحصاءات شبه متطابقة يمكن أن تبدو مختلفة تماماً عند رسمها" },
            { en: "The mean is always more honest than the median", ar: "المتوسط دائماً أصدق من الوسيط" },
            { en: "Correlation coefficients are never useful", ar: "معاملات الارتباط ليست مفيدة أبداً" },
          ],
          answer: 0,
          explain: {
            en: "Same mean, variance, and correlation — four totally different shapes. The lesson: always plot your data, don't trust summaries alone.",
            ar: "نفس المتوسط والتباين والارتباط — أربعة أشكال مختلفة تماماً. الدرس: ارسم بياناتك دائماً، لا تثق بالملخّصات وحدها.",
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
- Correlation (-1 to 1) shows two variables move together — but never proves one causes the other; watch for confounding variables
- You coded mean, median, and a same-direction correlation check from scratch
- Anscombe's Quartet shows why you must plot data, not just summarize it

**Next:** Python for Data — pandas, the tool that makes real-world data analysis fast.`,
        ar: `## الخلاصة

- المتوسط مقابل الوسيط مقابل المنوال — القيم الشاذة تدمّر المتوسط، والوسيط يبقى صادقاً
- التشتت (الانحراف المعياري) لا يقل أهمية عن المتوسط
- الاحتمال (0–1) يقوم عليه كل تنبؤ
- الارتباط (-1 إلى 1) يُظهر أن متغيرين يتحركان معاً — لكنه لا يثبت أبداً أن أحدهما يسبب الآخر؛ انتبه للمتغيرات المُربكة
- برمجت المتوسط والوسيط وفحص تطابق الاتجاه من الصفر
- رباعية أنسكومب تُظهر لماذا يجب رسم البيانات لا تلخيصها فقط
- برمجت المتوسط والوسيط من الصفر

**التالي:** بايثون للبيانات — pandas، الأداة التي تجعل تحليل بيانات الواقع سريعاً.`,
      },
    },
  ],
};
