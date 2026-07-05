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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Charts turn data into instant insight and communicate findings
- Match chart to question: bar (compare), line (time), scatter (relationship), histogram (distribution)
- Don't lie: start axes at zero, label clearly, don't cherry-pick
- Tools: matplotlib, seaborn, Plotly; Tableau/Power BI for dashboards

**Next:** Machine Learning for data science — turning your clean, visualized data into predictions.`,
        ar: `## الخلاصة

- الرسوم تحوّل البيانات إلى بصيرة فورية وتوصّل النتائج
- طابِق الرسم مع السؤال: أعمدة (مقارنة)، خط (زمن)، انتشار (علاقة)، مدرّج (توزيع)
- لا تكذب: ابدأ المحاور من صفر، سمِّ بوضوح، لا تنتقِ
- الأدوات: matplotlib، seaborn، Plotly؛ وTableau/Power BI للوحات

**التالي:** تعلّم الآلة لعلم البيانات — تحويل بياناتك النظيفة المصوّرة إلى تنبؤات.`,
      },
    },
  ],
};
