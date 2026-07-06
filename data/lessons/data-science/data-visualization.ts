import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "data-visualization",
  title: { en: "Data Visualization — Charts That Tell Truth", ar: "التصوير المرئي — رسوم تقول الحقيقة" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why a chart beats a table of numbers
- Which chart type for which question
- How charts mislead (and how to be honest)
- The tools: matplotlib, seaborn, and beyond`,
        ar: `## ماذا ستتعلم

- لماذا يتفوّق الرسم على جدول أرقام
- أي نوع رسم لأي سؤال
- كيف تُضلِّل الرسوم (وكيف تكون صادقاً)
- الأدوات: matplotlib، seaborn، وما بعدها`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A picture worth a thousand rows 📈

You can stare at 10,000 numbers and see nothing. Put them in a chart and a pattern jumps out instantly. **Data visualization** is how analysis becomes insight a human can act on — and how you communicate findings to a boss who won't read your spreadsheet.

**Pick the chart for the question:**
- **Bar chart** — compare categories. "Sales per region." Different things, side by side.
- **Line chart** — show change over time. "Revenue by month." Anything with a timeline.
- **Scatter plot** — reveal a relationship between two numbers. "Does study time relate to test score?" Each dot is one observation.
- **Histogram** — show the distribution/spread of one variable. "How are ages spread?" (remember spread from the statistics lesson?)
- **Pie chart** — parts of a whole. Use sparingly; bars are usually clearer.

**The golden rule: don't lie with charts.** The classic trick is a **truncated y-axis** — starting a bar chart at 90 instead of 0 makes a tiny 2% difference look enormous. Honest charts usually start the axis at zero, use clear labels, and don't cherry-pick a flattering time range. As a data scientist your credibility *is* your product; a misleading chart destroys trust.

**The tools:** in Python, **matplotlib** is the foundational plotting library, **seaborn** makes prettier statistical charts with less code, and **Plotly** makes interactive ones. For business dashboards, **Tableau** and **Power BI** (next lessons) let non-coders explore data visually.

\`\`\`python
import matplotlib.pyplot as plt
plt.bar(["A", "B", "C"], [10, 25, 15])
plt.title("Sales by product")
plt.show()   # a chart appears
\`\`\``,
        ar: `## صورة تساوي ألف صف 📈

يمكنك التحديق في 10,000 رقم دون أن ترى شيئاً. ضعها في رسم فيقفز النمط فوراً. **التصوير المرئي** هو كيف يصبح التحليل بصيرة يتصرف بها الإنسان — وكيف توصّل نتائجك لمدير لن يقرأ جدولك.

**اختر الرسم حسب السؤال:**
- **الأعمدة (Bar)** — قارن فئات. "المبيعات لكل منطقة." أشياء مختلفة جنباً إلى جنب.
- **الخط (Line)** — أظهِر التغيّر عبر الزمن. "الإيراد شهرياً." أي شيء له خط زمني.
- **الانتشار (Scatter)** — اكشف علاقة بين رقمين. "هل يرتبط وقت الدراسة بدرجة الاختبار؟" كل نقطة ملاحظة واحدة.
- **المدرّج (Histogram)** — أظهِر توزيع/تشتت متغير واحد. "كيف تتوزع الأعمار؟" (تذكّر التشتت من درس الإحصاء؟)
- **الدائري (Pie)** — أجزاء من كل. استخدمه بحذر؛ الأعمدة عادة أوضح.

**القاعدة الذهبية: لا تكذب بالرسوم.** الحيلة الكلاسيكية **محور y مقتطع** — بدء رسم أعمدة من 90 بدل 0 يجعل فرق 2% ضئيلاً يبدو هائلاً. الرسوم الصادقة تبدأ المحور من صفر، تستخدم تسميات واضحة، ولا تنتقي مدى زمنياً مجاملاً. كعالِم بيانات مصداقيتك *هي* منتجك؛ ورسم مضلِّل يدمّر الثقة.

**الأدوات:** في بايثون، **matplotlib** مكتبة الرسم الأساسية، و**seaborn** تصنع رسوماً إحصائية أجمل بكود أقل، و**Plotly** تصنع تفاعلية. ولوحات الأعمال، **Tableau** و**Power BI** (الدروس التالية) تتيح لغير المبرمجين استكشاف البيانات بصرياً.

\`\`\`python
import matplotlib.pyplot as plt
plt.bar(["A", "B", "C"], [10, 25, 15])
plt.title("Sales by product")
plt.show()   # يظهر رسم
\`\`\``,
      },
    },
    {
      type: "text",
      body: {
        en: `## Color and clutter: the silent chart-wreckers 🎨

Chart *type* is only half the battle — even the right chart type can mislead or confuse through poor **color** and **clutter** choices.

**Color rules that matter:**
- **Use color to encode meaning, not decoration.** If every bar is a different random color for no reason, the reader wastes time hunting for a pattern that isn't there. Use one color for "our data," a second contrasting color only to highlight the one thing that matters (e.g., "this region is below target").
- **Red/green alone excludes colorblind readers** (~8% of men). Pair color with a label, shape, or pattern — never color alone to convey "good vs bad."
- **Sequential data (low → high) needs a sequential color scale** (light to dark of one hue), not a rainbow — a rainbow implies categories, not a smooth range.

**Clutter rules:**
- **Remove gridlines, borders, and 3D effects that add no information.** 3D bar charts in particular distort perceived height/depth — never use them for comparison.
- **Every element should earn its place.** If you can delete a legend, label, or line without losing meaning, delete it (a principle sometimes called "data-ink ratio" — maximize the ink that carries information, minimize the ink that doesn't).
- **Order matters.** Sort bar charts by value, not alphabetically, unless alphabetical order is itself meaningful — a sorted chart reveals rank at a glance.

The pattern across all of this: every visual choice should make the honest finding *easier* to see, never harder.`,
        ar: `## اللون والازدحام: مُخرِّبا الرسم الصامتان 🎨

نوع الرسم نصف المعركة فقط — حتى النوع الصحيح يمكن أن يُضلِّل أو يُربك بسبب اختيارات **لون** و**ازدحام** سيئة.

**قواعد اللون المهمة:**
- **استخدم اللون لترميز المعنى، لا للزينة.** إن كان كل عمود لوناً عشوائياً مختلفاً بلا سبب، يُضيّع القارئ وقته يبحث عن نمط لا وجود له. استخدم لوناً واحداً لـ"بياناتنا"، ولوناً ثانياً متبايناً فقط لإبراز الشيء الوحيد المهم (مثل "هذه المنطقة دون الهدف").
- **الأحمر/الأخضر وحدهما يستبعدان القراء المصابين بعمى الألوان** (~8% من الرجال). اقرن اللون بتسمية أو شكل أو نمط — لا اللون وحده أبداً لنقل "جيد مقابل سيئ".
- **البيانات المتسلسلة (منخفض ← مرتفع) تحتاج تدرّج لون متسلسلاً** (فاتح إلى داكن من صبغة واحدة)، لا قوس قزح — قوس القزح يوحي بفئات، لا مدى سلس.

**قواعد الازدحام:**
- **أزل خطوط الشبكة والحدود وتأثيرات الأبعاد الثلاثية التي لا تضيف معلومة.** رسوم الأعمدة ثلاثية الأبعاد خصوصاً تُشوّه الارتفاع/العمق المُدرَك — لا تستخدمها أبداً للمقارنة.
- **كل عنصر يجب أن يستحق مكانه.** إن استطعت حذف مفتاح أو تسمية أو خط دون فقدان المعنى، احذفه (مبدأ يُسمّى أحياناً "نسبة حبر البيانات" — عظّم الحبر الذي يحمل معلومة، وقلّل الحبر الذي لا يحملها).
- **الترتيب مهم.** رتّب رسوم الأعمدة حسب القيمة، لا أبجدياً، إلا إن كان الترتيب الأبجدي نفسه ذا معنى — الرسم المرتّب يكشف الرتبة بنظرة واحدة.

النمط عبر كل هذا: كل اختيار بصري يجب أن يجعل الاكتشاف الصادق *أسهل* رؤية، لا أصعب أبداً.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Before you even open matplotlib, practice picking the right chart. Write \`chart_for(question)\` — given a short lowercase string describing what's being asked, return the best chart type as a string: \`"bar"\`, \`"line"\`, \`"scatter"\`, or \`"histogram"\`.

Rules to implement:
- if the question contains \`"over time"\` or \`"trend"\` → \`"line"\`
- else if it contains \`"relationship"\` or \`"correlat"\` → \`"scatter"\`
- else if it contains \`"distribution"\` or \`"spread"\` → \`"histogram"\`
- else → \`"bar"\` (default: comparing categories)`,
        ar: `قبل أن تفتح matplotlib حتى، تدرّب على اختيار الرسم الصحيح. اكتب \`chart_for(question)\` — بمعطى نص قصير بأحرف صغيرة يصف ما يُسأل، أعِد نوع أفضل رسم كنص: \`"bar"\`، \`"line"\`، \`"scatter"\`، أو \`"histogram"\`.

قواعد للتنفيذ:
- إن احتوى السؤال \`"over time"\` أو \`"trend"\` ← \`"line"\`
- وإلا إن احتوى \`"relationship"\` أو \`"correlat"\` ← \`"scatter"\`
- وإلا إن احتوى \`"distribution"\` أو \`"spread"\` ← \`"histogram"\`
- وإلا ← \`"bar"\` (افتراضي: مقارنة فئات)`,
      },
      starterCode: `def chart_for(question):
    q = question.lower()
    # check for "over time" / "trend" -> line
    # check for "relationship" / "correlat" -> scatter
    # check for "distribution" / "spread" -> histogram
    # otherwise -> bar
    return "bar"

print(chart_for("Revenue over time"))               # line
print(chart_for("Relationship between age and pay")) # scatter
print(chart_for("Distribution of test scores"))       # histogram
print(chart_for("Sales by region"))                   # bar`,
      solution: `def chart_for(question):
    q = question.lower()
    if "over time" in q or "trend" in q:
        return "line"
    if "relationship" in q or "correlat" in q:
        return "scatter"
    if "distribution" in q or "spread" in q:
        return "histogram"
    return "bar"

print(chart_for("Revenue over time"))               # line
print(chart_for("Relationship between age and pay")) # scatter
print(chart_for("Distribution of test scores"))       # histogram
print(chart_for("Sales by region"))                   # bar`,
      hints: [
        { en: `Lowercase the string first, then use "in" to check for each keyword phrase.`, ar: `حوّل النص لأحرف صغيرة أولاً، ثم استخدم "in" للتحقق من كل عبارة مفتاحية.` },
        { en: `Check line and scatter and histogram conditions first; fall through to "bar" as the default at the end.`, ar: `تحقّق من شروط line وscatter وhistogram أولاً؛ واسقط إلى "bar" كافتراضي في النهاية.` },
      ],
      tests: [
        { name: { en: "'over time' gives line", ar: "'over time' يعطي line" }, check: `assert chart_for("Revenue over time") == "line"` },
        { name: { en: "'relationship' gives scatter", ar: "'relationship' يعطي scatter" }, check: `assert chart_for("Relationship between age and pay") == "scatter"` },
        { name: { en: "'distribution' gives histogram", ar: "'distribution' يعطي histogram" }, check: `assert chart_for("Distribution of test scores") == "histogram"` },
        { name: { en: "no keywords gives bar", ar: "بلا كلمات مفتاحية يعطي bar" }, check: `assert chart_for("Sales by region") == "bar"` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: the NASA Challenger O-ring chart 🔍

Before the Space Shuttle *Challenger* disaster in January 1986, engineers at Morton Thiokol were worried that cold temperatures would damage the rubber **O-rings** sealing the rocket boosters, and held a conference call the night before launch to argue against flying in the unusually cold forecast. They had the data to prove it — but the charts they faxed to NASA that night only plotted the launches where O-ring damage *had* occurred, sorted in a way that didn't clearly show temperature as the driver. Crucially, they left out the successful, undamaged launches, so the full pattern (damage got worse as temperature dropped) never popped visually. NASA management, unconvinced, approved the launch. The shuttle exploded 73 seconds after liftoff on an unusually cold morning, killing all seven crew members.

Statistician Edward Tufte later analyzed this disaster extensively in his writing on visualization, showing that a single, simple chart — all launches (not just the damaged ones) plotted with temperature on one axis and O-ring damage on the other — would have made the danger visually obvious even to a non-engineer.

It's one of the most sobering lessons in the entire field: **a chart that omits the "boring" or "successful" data points can hide the exact pattern that matters most.** Always plot the full picture, not just the exciting exceptions.`,
        ar: `## دراسة حالة واقعية: مخطط حلقات-O لتشالنجر ناسا 🔍

قبل كارثة مكوك الفضاء *تشالنجر* في يناير 1986، كان مهندسون في شركة Morton Thiokol قلقين من أن درجات الحرارة الباردة ستُتلف **حلقات-O (O-rings)** المطاطية التي تُحكم إغلاق معزّزات الصاروخ، وعقدوا مكالمة مؤتمر ليلة الإطلاق للاعتراض على الطيران في الطقس البارد غير المعتاد المتوقّع. كانت لديهم بيانات لإثبات ذلك — لكن الرسوم التي أرسلوها بالفاكس لناسا تلك الليلة رسمت فقط الإطلاقات التي حدث فيها تلف بحلقات-O، مرتّبة بطريقة لم تُظهر بوضوح الحرارة كمحرّك. والأهم أنهم أغفلوا الإطلاقات الناجحة غير المتضرّرة، فلم يبرز النمط الكامل (التلف يزداد سوءاً مع انخفاض الحرارة) بصرياً أبداً. إدارة ناسا، غير مقتنعة، وافقت على الإطلاق. انفجر المكوك بعد 73 ثانية من الإقلاع في صباح بارد غير معتاد، مما أودى بحياة طاقمه السبعة جميعاً.

حلّل الإحصائي إدوارد تافتي لاحقاً هذه الكارثة بتوسّع في كتاباته عن التصوير المرئي، مُظهراً أن رسماً واحداً بسيطاً — كل الإطلاقات (لا المتضرّرة فقط) مرسومة بالحرارة على محور وتلف حلقة-O على الآخر — كان سيجعل الخطر واضحاً بصرياً حتى لغير المهندس.

إنه أحد أكثر الدروس تنبيهاً في المجال كله: **رسم يُغفل نقاط البيانات "المملة" أو "الناجحة" يمكن أن يُخفي بالضبط النمط الأهم.** ارسم الصورة الكاملة دائماً، لا الاستثناءات المثيرة فقط.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "You want to show revenue change over 12 months. Best chart?", ar: "تريد إظهار تغيّر الإيراد عبر 12 شهراً. أفضل رسم؟" },
          choices: [
            { en: "Line chart", ar: "رسم خطي" },
            { en: "Pie chart", ar: "رسم دائري" },
            { en: "Scatter plot", ar: "رسم انتشار" },
          ],
          answer: 0,
          explain: {
            en: "Line charts show change over time. Pie = parts of a whole; scatter = relationship between two variables.",
            ar: "الرسوم الخطية تُظهر التغيّر عبر الزمن. الدائري = أجزاء من كل؛ والانتشار = علاقة بين متغيرين.",
          },
        },
        {
          q: { en: "To compare sales across 5 regions, use a…", ar: "لمقارنة المبيعات عبر 5 مناطق، استخدم…" },
          choices: [
            { en: "Bar chart", ar: "رسم أعمدة" },
            { en: "Line chart", ar: "رسم خطي" },
            { en: "Histogram", ar: "مدرّج تكراري" },
          ],
          answer: 0,
          explain: {
            en: "Bar charts compare separate categories side by side. Histograms show one variable's distribution, not category comparison.",
            ar: "رسوم الأعمدة تقارن فئات منفصلة جنباً إلى جنب. المدرّجات تُظهر توزيع متغير واحد، لا مقارنة فئات.",
          },
        },
        {
          q: { en: "How do bar charts most commonly mislead?", ar: "كيف تُضلِّل رسوم الأعمدة غالباً؟" },
          choices: [
            { en: "A truncated y-axis (not starting at zero) exaggerates differences", ar: "محور y مقتطع (لا يبدأ من صفر) يضخّم الفروق" },
            { en: "Using too many colors", ar: "استخدام ألوان كثيرة" },
            { en: "They can't mislead", ar: "لا يمكن أن تُضلِّل" },
          ],
          answer: 0,
          explain: {
            en: "Starting the axis above zero makes small gaps look huge. Honest bar charts start at zero. Your credibility depends on it.",
            ar: "بدء المحور فوق الصفر يجعل الفجوات الصغيرة تبدو هائلة. الرسوم الصادقة تبدأ من صفر. ومصداقيتك تعتمد عليه.",
          },
        },
        {
          q: { en: "Why is using red/green alone to mean 'bad/good' a problem?", ar: "لماذا استخدام الأحمر/الأخضر وحدهما لتعني 'سيئ/جيد' مشكلة؟" },
          choices: [
            { en: "It excludes colorblind readers — pair color with a label or shape too", ar: "يستبعد القراء المصابين بعمى الألوان — اقرن اللون بتسمية أو شكل أيضاً" },
            { en: "Red and green are always ugly together", ar: "الأحمر والأخضر قبيحان معاً دائماً" },
            { en: "It's not a problem at all", ar: "ليست مشكلة إطلاقاً" },
          ],
          answer: 0,
          explain: {
            en: "About 8% of men are colorblind. Color should support meaning, never be the only way to convey it.",
            ar: "نحو 8% من الرجال مصابون بعمى الألوان. اللون يجب أن يدعم المعنى، لا أن يكون الوسيلة الوحيدة لنقله.",
          },
        },
        {
          q: { en: "What was the key visualization failure before the Challenger disaster?", ar: "ما فشل التصوير المرئي الأساسي قبل كارثة تشالنجر؟" },
          choices: [
            { en: "The chart only showed damaged launches, omitting successful ones, hiding the temperature pattern", ar: "الرسم أظهر فقط الإطلاقات المتضرّرة، أغفل الناجحة، فأخفى نمط الحرارة" },
            { en: "The chart used too many bright colors", ar: "استخدم الرسم ألواناً زاهية كثيرة" },
            { en: "There was no chart at all", ar: "لم يكن هناك رسم إطلاقاً" },
          ],
          answer: 0,
          explain: {
            en: "By excluding the successful, undamaged launches, engineers' chart hid the clear temperature-damage pattern that would have been obvious with the full data.",
            ar: "باستبعاد الإطلاقات الناجحة غير المتضرّرة، أخفى رسم المهندسين نمط الحرارة-التلف الواضح الذي كان سيبدو جلياً بالبيانات الكاملة.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Charts turn data into instant insight and communicate findings
- Match chart to question: bar (compare), line (time), scatter (relationship), histogram (distribution)
- Don't lie: start axes at zero, label clearly, don't cherry-pick
- Color should encode meaning (not decoration), and clutter (gridlines, 3D effects, unsorted bars) should be removed
- You coded a simple chart-type picker based on the question being asked
- The Challenger disaster shows how omitting "boring" data points can hide the pattern that matters most
- Tools: matplotlib, seaborn, Plotly; Tableau/Power BI for dashboards

**Next:** Machine Learning for data science — turning your clean, visualized data into predictions.`,
        ar: `## الخلاصة

- الرسوم تحوّل البيانات إلى بصيرة فورية وتوصّل النتائج
- طابِق الرسم مع السؤال: أعمدة (مقارنة)، خط (زمن)، انتشار (علاقة)، مدرّج (توزيع)
- لا تكذب: ابدأ المحاور من صفر، سمِّ بوضوح، لا تنتقِ
- اللون يجب أن يرمّز المعنى (لا الزينة)، ويجب إزالة الازدحام (خطوط شبكة، تأثيرات ثلاثية الأبعاد، أعمدة غير مرتّبة)
- برمجت مُختار نوع رسم بسيط بناءً على السؤال المطروح
- كارثة تشالنجر تُظهر كيف يمكن لإغفال نقاط بيانات "مملة" أن يُخفي النمط الأهم
- الأدوات: matplotlib، seaborn، Plotly؛ وTableau/Power BI للوحات

**التالي:** تعلّم الآلة لعلم البيانات — تحويل بياناتك النظيفة المصوّرة إلى تنبؤات.`,
      },
    },
  ],
};
