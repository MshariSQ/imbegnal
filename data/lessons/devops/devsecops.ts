import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "devsecops",
  title: { en: "DevSecOps — Security Built In", ar: "DevSecOps — الأمن مدمجاً" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why security can't be a final step anymore
- "Shift left" — catching issues early
- Automated security in the pipeline
- The mindset that ties DevOps and security together`,
        ar: `## ماذا ستتعلم

- لماذا لم يعد الأمن خطوة أخيرة
- "التحوّل يساراً (Shift left)" — التقاط المشاكل مبكراً
- الأمن الآلي في الخط
- العقلية التي تربط DevOps والأمن معاً`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Security as an ingredient, not a topping 🔒

The old way: build the software, and right before launch, throw it over the wall to a security team who scramble to find problems. By then, fixing a flaw is expensive and delays everything. **DevSecOps** fixes this with one idea: **build security into every stage**, automatically — it's an *ingredient mixed into the dough*, not a topping added at the end.

**"Shift left."** Picture the pipeline as a timeline flowing left (write code) to right (production). Traditionally security sat far right, at the end. DevSecOps **shifts it left** — security checks happen early and continuously, from the moment code is written. The earlier you catch a vulnerability, the cheaper and easier it is to fix (a bug caught while coding costs pennies; the same bug caught in production can cost a fortune and a breach).

**Automated security in the CI/CD pipeline** — bolt these onto the stages you already know:
- **SAST** (Static analysis) — scan the *source code* for vulnerable patterns as it's committed.
- **Dependency scanning** — check your libraries for known vulnerabilities (most apps are 80% third-party code — remember supply-chain risk).
- **Secret scanning** — block commits that accidentally contain passwords or API keys (a top cause of leaks, from the cloud track).
- **Container scanning** — inspect Docker images for vulnerable packages before they ship.
- **DAST** (Dynamic analysis) — attack the *running* app in staging to find holes.

Each becomes a pipeline gate: if a critical vulnerability is found, the build fails and the code doesn't ship — the same fail-fast principle as CI/CD tests, applied to security.

**The mindset:** security is *everyone's* job and it's *continuous*, not one person's final checkbox. This connects the whole picture — the secure coding from the cyber track, least privilege from cloud, and the automation from DevOps, all woven together. Companies want engineers who build fast *and* safe, which is exactly why DevSecOps skills command top salaries.`,
        ar: `## الأمن كمكوّن، لا كإضافة 🔒

الطريقة القديمة: ابنِ البرنامج، وقبيل الإطلاق ارمِه فوق الجدار لفريق أمن يهرع لإيجاد المشاكل. عندها يكون إصلاح خلل مكلفاً ويؤخّر كل شيء. **DevSecOps** يحل هذا بفكرة واحدة: **ادمج الأمن في كل مرحلة**، تلقائياً — إنه *مكوّن يُخلط في العجين*، لا إضافة توضع في النهاية.

**"التحوّل يساراً (Shift left)".** تخيّل الخط كخط زمني يتدفق من اليسار (اكتب الكود) إلى اليمين (الإنتاج). تقليدياً جلس الأمن أقصى اليمين، في النهاية. DevSecOps **يحوّله يساراً** — فحوص الأمن تحدث مبكراً وباستمرار، من لحظة كتابة الكود. كلما التقطت ثغرة أبكر، كان إصلاحها أرخص وأسهل (خطأ يُلتقط أثناء الكتابة يكلّف قروشاً؛ ونفس الخطأ في الإنتاج قد يكلّف ثروة واختراقاً).

**الأمن الآلي في خط CI/CD** — أضِف هذه إلى المراحل التي تعرفها:
- **SAST** (تحليل ساكن) — افحص *الكود المصدري* عن أنماط هشّة عند إيداعه.
- **فحص الاعتماديات** — تحقّق من مكتباتك للثغرات المعروفة (معظم التطبيقات 80% كود طرف ثالث — تذكّر خطر سلسلة التوريد).
- **فحص الأسرار** — امنع الإيداعات التي تحوي بالخطأ كلمات مرور أو مفاتيح API (سبب رئيسي للتسريبات، من مسار السحابة).
- **فحص الحاويات** — افحص صور Docker عن حِزَم هشّة قبل شحنها.
- **DAST** (تحليل ديناميكي) — هاجم التطبيق *العامل* في التجهيز لإيجاد الثغرات.

كل منها يصبح بوابة خط: إن وُجدت ثغرة حرجة، يفشل البناء ولا يُشحن الكود — نفس مبدأ الفشل السريع لاختبارات CI/CD، مطبّقاً على الأمن.

**العقلية:** الأمن مسؤولية *الجميع* وهو *مستمر*، لا خانة أخيرة لشخص واحد. يربط هذا الصورة كاملة — البرمجة الآمنة من مسار الأمن، وأقل صلاحية من السحابة، والأتمتة من DevOps، منسوجة معاً. الشركات تريد مهندسين يبنون بسرعة *وأمان*، ولهذا بالضبط تحصد مهارات DevSecOps أعلى الرواتب.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What does 'shift left' mean in DevSecOps?", ar: "ماذا يعني 'التحوّل يساراً' في DevSecOps؟" },
          choices: [
            { en: "Move security checks early into the process, not just at the end", ar: "انقل فحوص الأمن مبكراً في العملية، لا في النهاية فقط" },
            { en: "Write code right to left", ar: "اكتب الكود من اليمين لليسار" },
            { en: "Move servers to the left side of the room", ar: "انقل الخوادم ليسار الغرفة" },
          ],
          answer: 0,
          explain: {
            en: "On the pipeline timeline (left = early), shifting left means securing from the start — cheaper and safer than last-minute checks.",
            ar: "على خط الزمن (اليسار = مبكراً)، التحوّل يساراً يعني التأمين من البداية — أرخص وأأمن من فحوص اللحظة الأخيرة.",
          },
        },
        {
          q: { en: "Why catch a vulnerability early rather than in production?", ar: "لماذا نلتقط ثغرة مبكراً بدل الإنتاج؟" },
          choices: [
            { en: "It's far cheaper and easier to fix before it ships", ar: "أرخص وأسهل بكثير إصلاحها قبل الشحن" },
            { en: "Early bugs are more fun", ar: "الأخطاء المبكرة أمتع" },
            { en: "There's no difference", ar: "لا فرق" },
          ],
          answer: 0,
          explain: {
            en: "A flaw caught while coding costs pennies; the same flaw in production can cause a costly breach. Early = cheap.",
            ar: "خلل يُلتقط أثناء الكتابة يكلّف قروشاً؛ ونفسه في الإنتاج قد يسبب اختراقاً مكلفاً. مبكراً = رخيص.",
          },
        },
        {
          q: { en: "What does automated 'secret scanning' in a pipeline do?", ar: "ماذا يفعل 'فحص الأسرار' الآلي في الخط؟" },
          choices: [
            { en: "Blocks commits that accidentally contain passwords or API keys", ar: "يمنع الإيداعات التي تحوي بالخطأ كلمات مرور أو مفاتيح API" },
            { en: "Encrypts the whole repository", ar: "يشفّر المستودع كله" },
            { en: "Hides the source code", ar: "يخفي الكود المصدري" },
          ],
          answer: 0,
          explain: {
            en: "Leaked secrets in code are a top breach cause. Automated scanning catches them before they reach the repo or production.",
            ar: "الأسرار المسرّبة في الكود سبب رئيسي للاختراق. الفحص الآلي يمسكها قبل وصولها للمستودع أو الإنتاج.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Track complete! 🎓

Your DevOps foundation is built:

- Linux/shell + Git workflows — the automation cockpit
- Docker, CI/CD, Kubernetes — build, deliver, and orchestrate
- IaC, monitoring, and DevSecOps — reproducible, observable, secure systems

**Path to paid work:** DevOps is one of the highest-paid, most in-demand fields in tech. Build a real project that shows the full loop: an app in a Docker container, a GitHub Actions pipeline that tests and deploys it, defined with Terraform, with basic monitoring — all on GitHub. Get a cert (AWS or the Certified Kubernetes Administrator), combine with the "Getting Paid" lesson, and you're ready. Automate the boring stuff, and get paid well to do it! 🚀`,
        ar: `## اكتمل المسار! 🎓

أساس DevOps لديك مبنيّ:

- لينكس/الصدفة + سير عمل Git — قمرة قيادة الأتمتة
- Docker، CI/CD، Kubernetes — بناء وتسليم وتنسيق
- IaC، المراقبة، وDevSecOps — أنظمة قابلة للتكرار والملاحظة وآمنة

**طريق العمل المدفوع:** DevOps من أعلى المجالات أجراً وأكثرها طلباً في التقنية. ابنِ مشروعاً حقيقياً يُظهر الحلقة كاملة: تطبيق في حاوية Docker، خط GitHub Actions يختبره وينشره، معرّف بـ Terraform، بمراقبة أساسية — كله على GitHub. احصل على شهادة (AWS أو Certified Kubernetes Administrator)، اجمعها مع درس "التكسّب"، وتكون جاهزاً. أتمِت الأمور المملة، واكسب جيداً مقابل ذلك! 🚀`,
      },
    },
  ],
};
