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
      type: "text",
      body: {
        en: `## SLIs, SLOs, and error budgets 🎯

Beyond raw metrics, mature DevOps teams speak a precise language for "how reliable is reliable enough?" — three connected terms, easy to confuse but worth telling apart:

- **SLI (Service Level Indicator)** — the actual measured number. "99.94% of requests succeeded last month."
- **SLO (Service Level Objective)** — the internal *target* for that number. "We aim for 99.9% success rate." This is a goal your team sets for itself.
- **SLA (Service Level Agreement)** — an external, often contractual, *promise* to customers, usually with penalties if missed. "99.5% uptime or you get a refund."

Notice the SLO (99.9%) is usually *stricter* than the SLA (99.5%) — you give yourself a safety margin before you'd ever breach a customer-facing promise.

**The error budget** is what makes an SLO actionable instead of just aspirational: if your SLO is 99.9% uptime, your **error budget** is the remaining 0.1% — a concrete, spendable allowance for things going wrong (deploys that cause brief blips, planned maintenance, honest bugs). While budget remains, the team can ship features and take reasonable risks. Once the error budget is exhausted for the period, the team's priority *automatically* shifts: freeze risky releases, focus entirely on stability, until the budget resets next period.

This turns "be more reliable" from a vague slogan into a measurable, self-enforcing rule that balances **shipping speed** against **reliability** — the exact tension DevOps exists to manage.`,
        ar: `## SLI وSLO وميزانيات الخطأ 🎯

بعد المقاييس الخام، تتحدث فرق DevOps الناضجة لغة دقيقة لـ"كم الموثوقية موثوقة بما يكفي؟" — ثلاثة مصطلحات مترابطة، يسهل الخلط بينها لكن يستحق تمييزها:

- **SLI (مؤشّر مستوى الخدمة)** — الرقم المقيس فعلياً. "99.94% من الطلبات نجحت الشهر الماضي."
- **SLO (هدف مستوى الخدمة)** — *الهدف* الداخلي لذلك الرقم. "نستهدف معدل نجاح 99.9%." هذا هدف يضعه فريقك لنفسه.
- **SLA (اتفاقية مستوى الخدمة)** — *وعد* خارجي، غالباً تعاقدي، للعملاء، عادة مع عقوبات إن فُوِّت. "99.5% وقت تشغيل وإلا تحصل على استرداد."

لاحظ أن SLO (99.9%) عادة *أشد صرامة* من SLA (99.5%) — تمنح نفسك هامش أمان قبل أن تخرق وعداً للعملاء.

**ميزانية الخطأ (error budget)** هي ما يجعل SLO قابلاً للتنفيذ لا مجرد طموح: إن كان SLO لديك 99.9% وقت تشغيل، **ميزانية الخطأ** هي الـ 0.1% المتبقية — بدل ملموس قابل للإنفاق لأشياء تسوء (نشرات تسبب اهتزازات قصيرة، صيانة مخطَّطة، أخطاء صادقة). طالما بقيت ميزانية، يمكن للفريق شحن ميزات وأخذ مخاطر معقولة. بمجرد استنفاد ميزانية الخطأ للفترة، تتحوّل أولوية الفريق *تلقائياً*: جمّد الإصدارات الخطرة، ركّز كلياً على الاستقرار، حتى تُعاد الميزانية الفترة التالية.

هذا يحوّل "كن أكثر موثوقية" من شعار غامض إلى قاعدة قابلة للقياس وتفرض نفسها، توازن بين **سرعة الشحن** و**الموثوقية** — التوتر بالضبط الذي وُجد DevOps ليديره.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Build an error-budget calculator. Write \`errorBudgetRemaining(sloPercent, actualSuccessPercent)\` that returns the remaining error budget as a percentage (rounded to 2 decimals is not required — plain subtraction is fine). If the actual success rate is *below* the SLO, the budget is already **overspent** — return a negative number.

Example: \`errorBudgetRemaining(99.9, 99.95)\` → \`0.05\` (actual beat the target, budget partially unused)`,
        ar: `ابنِ حاسبة ميزانية خطأ. اكتب \`errorBudgetRemaining(sloPercent, actualSuccessPercent)\` تعيد ميزانية الخطأ المتبقية كنسبة مئوية (لا حاجة للتقريب لمنزلتين — الطرح المباشر يكفي). إن كان معدل النجاح الفعلي *أقل* من SLO، فالميزانية مُستنفَدة بالفعل بالسالب — أعِد رقماً سالباً.

مثال: \`errorBudgetRemaining(99.9, 99.95)\` ← \`0.05\` (الفعلي تفوّق على الهدف، الميزانية غير مستهلَكة جزئياً)`,
      },
      starterCode: `function errorBudgetRemaining(sloPercent, actualSuccessPercent) {
  // remaining budget = actual - slo
}

console.log(errorBudgetRemaining(99.9, 99.95)); // 0.05 (rounding OK)
console.log(errorBudgetRemaining(99.9, 99.8));  // -0.1 (overspent)`,
      solution: `function errorBudgetRemaining(sloPercent, actualSuccessPercent) {
  return actualSuccessPercent - sloPercent;
}

console.log(errorBudgetRemaining(99.9, 99.95)); // 0.05 (rounding OK)
console.log(errorBudgetRemaining(99.9, 99.8));  // -0.1 (overspent)`,
      hints: [
        { en: `The remaining budget is simply how far actual success is above (or below) the SLO target.`, ar: `الميزانية المتبقية هي ببساطة مقدار تجاوز النجاح الفعلي (أو نقصه) عن هدف SLO.` },
        { en: `return actualSuccessPercent - sloPercent — a negative result means the budget is overspent.`, ar: `return actualSuccessPercent - sloPercent — نتيجة سالبة تعني ميزانية مستنفَدة.` },
      ],
      tests: [
        { name: { en: "Positive budget when actual beats the SLO", ar: "ميزانية موجبة عندما الفعلي يتفوّق على SLO" }, check: `Math.abs(errorBudgetRemaining(99.9, 99.95) - 0.05) < 0.001` },
        { name: { en: "Negative budget when actual misses the SLO", ar: "ميزانية سالبة عندما الفعلي يفوّت SLO" }, check: `errorBudgetRemaining(99.9, 99.8) < 0` },
        { name: { en: "Zero budget when actual exactly meets the SLO", ar: "ميزانية صفرية عندما الفعلي يطابق SLO بالضبط" }, check: `errorBudgetRemaining(99.5, 99.5) === 0` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: AWS's 2017 S3 outage 🔍

In February 2017, a large chunk of the internet went down for about four hours — not because of a hack, but because an Amazon engineer, debugging a slow billing system, ran an authorized maintenance command intended to remove a small number of servers from one Amazon S3 subsystem. A typo-like input error caused it to remove far more capacity than intended, taking two critical internal subsystems offline entirely. Because so many popular websites and apps depended on S3 for storage, the outage cascaded into visible failures across a huge portion of the web.

The incident became famous in the industry for a wry detail: Amazon's own **service health dashboard**, which was supposed to show the outage status to customers, itself depended on the very S3 systems that had just gone down — so the status page showing "everything is fine" couldn't update. It's a textbook lesson in observability: your monitoring and alerting systems must be resilient *independently* of the systems they monitor, or you lose visibility at the exact moment you need it most.

Amazon's public post-incident report afterward detailed new safeguards — including slower, smaller removal operations and cooldown mechanisms — mirroring exactly the "guardrails around destructive operations" theme from this DevOps track.`,
        ar: `## دراسة حالة واقعية: انقطاع Amazon S3 عام 2017 🔍

في فبراير 2017، توقف جزء كبير من الإنترنت لنحو أربع ساعات — لا بسبب اختراق، بل لأن مهندساً في أمازون، أثناء تصحيح نظام فوترة بطيء، شغّل أمر صيانة مصرّحاً به يهدف لإزالة عدد صغير من الخوادم من أحد أنظمة Amazon S3 الفرعية. خطأ إدخال شبيه بخطأ طباعي تسبب في إزالة سعة أكبر بكثير من المقصود، مُسقِطاً نظامين فرعيين داخليين حسّاسين كلياً. ولأن مواقع وتطبيقات شهيرة كثيرة اعتمدت على S3 للتخزين، تتالى الانقطاع لأعطال ظاهرة عبر جزء ضخم من الويب.

صارت الحادثة شهيرة في الصناعة بتفصيل مفارق: **لوحة صحة الخدمة** الخاصة بأمازون نفسها، التي كان يُفترض أن تُظهر حالة الانقطاع للعملاء، اعتمدت هي نفسها على أنظمة S3 عينها التي كانت قد توقفت — فلم تستطع صفحة الحالة المُظهِرة لـ"كل شيء بخير" التحديث. إنه درس نموذجي في قابلية الملاحظة: أنظمة المراقبة والتنبيه لديك يجب أن تكون قوية *بشكل مستقل* عن الأنظمة التي تراقبها، وإلا تفقد الرؤية في اللحظة بالضبط التي تحتاجها أكثر.

تقرير أمازون العلني لما بعد الحادثة فصّل لاحقاً ضمانات جديدة — بما فيها عمليات إزالة أبطأ وأصغر وآليات تهدئة — تحاكي بالضبط موضوع "حواجز وقائية حول العمليات المدمّرة" من مسار DevOps هذا.`,
      },
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
        {
          q: { en: "What is an 'error budget'?", ar: "ما هي 'ميزانية الخطأ'؟" },
          choices: [
            { en: "The spendable allowance for failures implied by an SLO — e.g. a 99.9% SLO leaves a 0.1% budget", ar: "البدل القابل للإنفاق من الفشل الذي يُضمنه SLO — مثلاً SLO بـ99.9% يترك ميزانية 0.1%" },
            { en: "The money allocated to buy monitoring software", ar: "المال المخصَّص لشراء برمجيات مراقبة" },
            { en: "The maximum number of servers a team can run", ar: "أقصى عدد خوادم يمكن للفريق تشغيله" },
          ],
          answer: 0,
          explain: {
            en: "The error budget is the gap between 100% and your SLO — once it's spent on outages/incidents, the team pauses risky releases until it resets.",
            ar: "ميزانية الخطأ هي الفجوة بين 100% وSLO لديك — بمجرد إنفاقها على أعطال/حوادث، يوقف الفريق الإصدارات الخطرة حتى إعادة تعيينها.",
          },
        },
        {
          q: { en: "In the 2017 AWS S3 outage, why couldn't customers see the outage status on Amazon's own dashboard?", ar: "في انقطاع Amazon S3 عام 2017، لماذا تعذّر على العملاء رؤية حالة الانقطاع على لوحة أمازون نفسها؟" },
          choices: [
            { en: "The status dashboard itself depended on the same S3 systems that had just failed", ar: "لوحة الحالة نفسها اعتمدت على أنظمة S3 عينها التي فشلت للتو" },
            { en: "Amazon deliberately hid the outage", ar: "أمازون أخفت الانقطاع عمداً" },
            { en: "There was no dashboard at the time", ar: "لم تكن هناك لوحة حينها" },
          ],
          answer: 0,
          explain: {
            en: "A classic observability lesson: monitoring/status systems must be independent of what they monitor, or you lose visibility exactly when you need it most.",
            ar: "درس كلاسيكي في قابلية الملاحظة: أنظمة المراقبة/الحالة يجب أن تكون مستقلة عمّا تراقبه، وإلا تفقد الرؤية بالضبط حين تحتاجها أكثر.",
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
- SLIs measure reality, SLOs set internal targets, SLAs are external promises — and the error budget turns "be reliable" into an actionable, self-enforcing rule
- You built an alert threshold checker and an error-budget calculator
- AWS's 2017 S3 outage shows why monitoring systems must stay independent of what they monitor

**Next:** DevSecOps — baking security into every stage of the automated pipeline.`,
        ar: `## الخلاصة

- لا تُصلح ما لا تراه — المراقبة تمنح رؤية الإنتاج
- ثلاث ركائز: المقاييس (أرقام)، السجلّات (أحداث)، التتبّعات (رحلات الطلبات)
- التنبيهات تُخطرك قبل شكوى المستخدمين؛ اضبط العتبات لتجنّب الإرهاق
- SLI يقيس الواقع، وSLO يضع أهدافاً داخلية، وSLA وعود خارجية — وميزانية الخطأ تحوّل "كن موثوقاً" لقاعدة قابلة للتنفيذ تفرض نفسها
- بنيت فاحص عتبة تنبيه وحاسبة ميزانية خطأ
- انقطاع Amazon S3 عام 2017 يُظهر لماذا يجب أن تبقى أنظمة المراقبة مستقلة عمّا تراقبه

**التالي:** DevSecOps — دمج الأمن في كل مرحلة من الخط المؤتمت.`,
      },
    },
  ],
};
