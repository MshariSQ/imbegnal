import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "monitoring",
  title: { en: "Monitoring & Observability — Seeing Production", ar: "المراقبة وقابلية الملاحظة — رؤية الإنتاج" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why you can't fix what you can't see
- Metrics, logs, and traces (the 3 pillars)
- Alerts — being told before users complain
- You'll build an alerting threshold checker`,
        ar: `## ماذا ستتعلم

- لماذا لا تُصلح ما لا تراه
- المقاييس، السجلّات، والتتبّعات (الركائز الثلاث)
- التنبيهات — أن تُخبَر قبل شكوى المستخدمين
- ستبني فاحص عتبة تنبيه`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The dashboard in the cockpit ✈️

A pilot doesn't fly by feel — they watch instruments: altitude, speed, fuel. Running production software without **monitoring** is flying blind. Once your automated pipeline deploys code to servers you can't see, you *need* instruments telling you: is it healthy? is it fast? is it about to crash?

**The three pillars of observability:**

- **Metrics** — numbers over time. CPU usage, requests per second, error rate, response time. These are your gauges: "error rate is 0.2%, response time 120ms." Tools: **Prometheus** collects them, **Grafana** graphs them into dashboards.
- **Logs** — timestamped text records of events. "User 5 logged in", "Payment failed: timeout." When something breaks, logs tell you *what happened*. (You practiced log analysis in the security track.)
- **Traces** — follow a single request across all the services it touches. In a system with 10 microservices, a trace shows *where* the 3-second delay actually happened.

Metrics say *something is wrong*, logs and traces say *what and where*.

**Alerts — the whole point.** Collecting data is useless if no one looks until users complain. An **alert** watches a metric and notifies the team (Slack, email, phone) when it crosses a threshold: "error rate > 5% for 2 minutes → wake up the on-call engineer." Good monitoring means **you find out before your users do**.

The art is setting thresholds well: too sensitive and you get "alert fatigue" (so many false alarms people ignore them); too loose and you miss real problems. This ties back to the SOC triage from the security track — deciding what's a real signal versus noise.

**Why it matters for DevOps:** automation deploys fast, but speed without visibility is dangerous. Monitoring closes the loop — deploy, observe, learn, improve. It's how teams run reliable systems at scale and sleep at night.`,
        ar: `## اللوحة في قمرة القيادة ✈️

الطيّار لا يطير بالإحساس — بل يراقب الأجهزة: الارتفاع، السرعة، الوقود. تشغيل برمجيات الإنتاج بلا **مراقبة** طيران أعمى. متى نشر خطك المؤتمت كوداً على خوادم لا تراها، تحتاج أجهزة تخبرك: هل هو سليم؟ هل هو سريع؟ هل على وشك الانهيار؟

**ركائز قابلية الملاحظة الثلاث:**

- **المقاييس (Metrics)** — أرقام عبر الزمن. استخدام المعالج، الطلبات في الثانية، معدل الأخطاء، زمن الاستجابة. هذه عدّاداتك: "معدل الأخطاء 0.2%، زمن الاستجابة 120 مللي ثانية." أدوات: **Prometheus** يجمعها، و**Grafana** يرسمها في لوحات.
- **السجلّات (Logs)** — سجلّات نصية موقّتة للأحداث. "المستخدم 5 سجّل الدخول"، "فشل الدفع: انتهت المهلة." حين ينكسر شيء، السجلّات تخبرك *ماذا حدث*. (تدرّبت على تحليل السجلّات في مسار الأمن.)
- **التتبّعات (Traces)** — تتبّع طلباً واحداً عبر كل الخدمات التي يمسّها. في نظام بـ 10 خدمات مصغّرة، التتبّع يُظهر *أين* حدث التأخير ذو الـ 3 ثوانٍ فعلاً.

المقاييس تقول *شيء ما خطأ*، والسجلّات والتتبّعات تقول *ماذا وأين*.

**التنبيهات — الغاية كلها.** جمع البيانات عديم الفائدة إن لم ينظر أحد حتى يشتكي المستخدمون. **التنبيه** يراقب مقياساً ويُخطر الفريق (Slack، بريد، هاتف) حين يتجاوز عتبة: "معدل الأخطاء > 5% لمدة دقيقتين → أيقظ المهندس المناوب." المراقبة الجيدة تعني **أن تعرف قبل مستخدميك**.

الفنّ ضبط العتبات جيداً: حسّاسة جداً فتحصل على "إرهاق التنبيهات" (إنذارات كاذبة كثيرة يتجاهلها الناس)؛ ومرخية جداً فتفوّت مشاكل حقيقية. يعود هذا لفرز SOC من مسار الأمن — تحديد الإشارة الحقيقية مقابل الضجيج.

**لماذا يهم لـ DevOps:** الأتمتة تنشر بسرعة، لكن السرعة بلا رؤية خطرة. المراقبة تُغلق الحلقة — انشر، لاحظ، تعلّم، حسّن. هكذا تُشغّل الفرق أنظمة موثوقة على نطاق واسع وتنام ليلاً.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Build an alerting system. Write \`checkAlerts(readings, threshold)\` where \`readings\` is an array of error-rate numbers. Return an array of \`"ALERT"\` / \`"ok"\` — \`"ALERT"\` for any reading **strictly greater than** the threshold.

Example: \`checkAlerts([0.1, 6, 2, 8], 5)\` → \`["ok", "ALERT", "ok", "ALERT"]\``,
        ar: `ابنِ نظام تنبيه. اكتب \`checkAlerts(readings, threshold)\` حيث \`readings\` مصفوفة أرقام معدل أخطاء. أعِد مصفوفة \`"ALERT"\` / \`"ok"\` — \`"ALERT"\` لأي قراءة **أكبر تماماً** من العتبة.

مثال: \`checkAlerts([0.1, 6, 2, 8], 5)\` ← \`["ok", "ALERT", "ok", "ALERT"]\``,
      },
      starterCode: `function checkAlerts(readings, threshold) {
  // map each reading to "ALERT" if > threshold, else "ok"
}

console.log(checkAlerts([0.1, 6, 2, 8], 5)); // ["ok","ALERT","ok","ALERT"]`,
      solution: `function checkAlerts(readings, threshold) {
  return readings.map((r) => (r > threshold ? "ALERT" : "ok"));
}

console.log(checkAlerts([0.1, 6, 2, 8], 5)); // ["ok","ALERT","ok","ALERT"]`,
      hints: [
        { en: `Use map with a ternary: r > threshold ? "ALERT" : "ok".`, ar: `استخدم map مع شرط: r > threshold ? "ALERT" : "ok".` },
        { en: `Strictly greater than — a reading equal to the threshold is "ok".`, ar: `أكبر تماماً — قراءة تساوي العتبة هي "ok".` },
      ],
      tests: [
        { name: { en: "Flags readings above threshold", ar: "يعلّم القراءات فوق العتبة" }, check: `JSON.stringify(checkAlerts([0.1,6,2,8],5)) === JSON.stringify(["ok","ALERT","ok","ALERT"])` },
        { name: { en: "Value equal to threshold is ok", ar: "قيمة تساوي العتبة هي ok" }, check: `checkAlerts([5],5)[0] === "ok"` },
        { name: { en: "All calm when all below", ar: "الكل هادئ عندما الكل تحت" }, check: `JSON.stringify(checkAlerts([1,2,3],5)) === JSON.stringify(["ok","ok","ok"])` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What are the three pillars of observability?", ar: "ما ركائز قابلية الملاحظة الثلاث؟" },
          choices: [
            { en: "Metrics, logs, and traces", ar: "المقاييس، السجلّات، والتتبّعات" },
            { en: "CPU, RAM, and disk", ar: "المعالج، الذاكرة، والقرص" },
            { en: "Build, test, deploy", ar: "بناء، اختبار، نشر" },
          ],
          answer: 0,
          explain: {
            en: "Metrics (numbers over time), logs (event records), traces (a request's journey). Together they reveal system health.",
            ar: "المقاييس (أرقام عبر الزمن)، السجلّات (سجلّات أحداث)، التتبّعات (رحلة طلب). معاً تكشف صحة النظام.",
          },
        },
        {
          q: { en: "Metrics tell you X; logs and traces tell you Y. What are X and Y?", ar: "المقاييس تخبرك X؛ والسجلّات والتتبّعات تخبرك Y. ما X و Y؟" },
          choices: [
            { en: "X = something is wrong; Y = what and where", ar: "X = شيء ما خطأ؛ Y = ماذا وأين" },
            { en: "X = the weather; Y = the time", ar: "X = الطقس؛ Y = الوقت" },
            { en: "They tell you nothing", ar: "لا يخبرانك شيئاً" },
          ],
          answer: 0,
          explain: {
            en: "A metric spike says something's off; logs and traces let you drill into the exact cause and location.",
            ar: "قفزة مقياس تقول شيء ما خطأ؛ والسجلّات والتتبّعات تتيح التنقيب في السبب والمكان بالضبط.",
          },
        },
        {
          q: { en: "What's the danger of setting alert thresholds too sensitively?", ar: "ما خطر ضبط عتبات التنبيه بحساسية زائدة؟" },
          choices: [
            { en: "Alert fatigue — so many false alarms that people start ignoring them", ar: "إرهاق التنبيهات — إنذارات كاذبة كثيرة يبدأ الناس بتجاهلها" },
            { en: "The servers explode", ar: "تنفجر الخوادم" },
            { en: "Nothing, more alerts are always better", ar: "لا شيء، التنبيهات الأكثر أفضل دائماً" },
          ],
          answer: 0,
          explain: {
            en: "Too many false alarms train people to ignore alerts — so real incidents get missed. Tuning thresholds is a real skill.",
            ar: "الإنذارات الكاذبة الكثيرة تعوّد الناس على تجاهل التنبيهات — فتُفوَّت الحوادث الحقيقية. ضبط العتبات مهارة حقيقية.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- You can't fix what you can't see — monitoring gives production visibility
- Three pillars: metrics (numbers), logs (events), traces (request journeys)
- Alerts notify you before users complain; tune thresholds to avoid fatigue
- You built an alert threshold checker

**Next:** DevSecOps — baking security into every stage of the automated pipeline.`,
        ar: `## الخلاصة

- لا تُصلح ما لا تراه — المراقبة تمنح رؤية الإنتاج
- ثلاث ركائز: المقاييس (أرقام)، السجلّات (أحداث)، التتبّعات (رحلات الطلبات)
- التنبيهات تُخطرك قبل شكوى المستخدمين؛ اضبط العتبات لتجنّب الإرهاق
- بنيت فاحص عتبة تنبيه

**التالي:** DevSecOps — دمج الأمن في كل مرحلة من الخط المؤتمت.`,
      },
    },
  ],
};
