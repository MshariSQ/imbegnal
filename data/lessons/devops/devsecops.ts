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
      type: "text",
      body: {
        en: `## Threat modeling — thinking like an attacker on purpose 🧠

Automated scanners (SAST, DAST, dependency scanning) catch *known* patterns of vulnerabilities. But some of the worst security failures aren't a missing scan — they're a **design** that never considered how it could be abused. **Threat modeling** is a structured exercise, done *before* or *during* building a feature, where the team deliberately asks: "how could this be attacked?"

A popular, simple framework is **STRIDE**, which names six categories of things to check for on any feature:

- **S**poofing — can someone pretend to be another user?
- **T**ampering — can someone alter data they shouldn't (a request, a file, a database row)?
- **R**epudiation — can someone deny doing something, with no log to prove otherwise?
- **I**nformation disclosure — can private data leak to someone who shouldn't see it?
- **D**enial of service — can someone overwhelm the system so real users can't use it?
- **E**levation of privilege — can a normal user gain admin-level power?

For example: building a "reset password" feature? Threat model it: *Spoofing* — could someone request a reset for an email they don't own? *Tampering* — can the reset token be guessed or reused? *Denial of service* — can someone spam reset requests to lock an account? Answering these **before writing code** is far cheaper than finding the bug after attackers do — the ultimate "shift left."

Threat modeling doesn't replace automated scanning — it complements it. Scanners catch known-pattern bugs in code that already exists; threat modeling catches design flaws before the code is even written.`,
        ar: `## نمذجة التهديدات — التفكير كمهاجم عن قصد 🧠

الماسحات الآلية (SAST، DAST، فحص الاعتماديات) تلتقط أنماط ثغرات *معروفة*. لكن بعض أسوأ إخفاقات الأمن ليست فحصاً ناقصاً — بل **تصميماً** لم يفكّر أبداً كيف يمكن إساءة استخدامه. **نمذجة التهديدات (Threat modeling)** تمرين مُنظّم، يُجرى *قبل* أو *أثناء* بناء ميزة، حيث يسأل الفريق عمداً: "كيف يمكن مهاجمة هذا؟"

إطار عمل شائع وبسيط هو **STRIDE**، الذي يسمّي ست فئات للتحقق منها في أي ميزة:

- **S**poofing (انتحال) — هل يستطيع أحد التظاهر بأنه مستخدم آخر؟
- **T**ampering (عبث) — هل يستطيع أحد تعديل بيانات لا يجب أن يعدّلها (طلب، ملف، صف قاعدة بيانات)؟
- **R**epudiation (إنكار) — هل يستطيع أحد إنكار فعله لشيء، دون سجلّ يثبت العكس؟
- **I**nformation disclosure (كشف معلومات) — هل يمكن تسريب بيانات خاصة لمن لا يجب أن يراها؟
- **D**enial of service (حجب خدمة) — هل يستطيع أحد إغراق النظام فلا يستطيع المستخدمون الحقيقيون استخدامه؟
- **E**levation of privilege (تصعيد صلاحيات) — هل يستطيع مستخدم عادي اكتساب قوة مستوى المدير؟

مثلاً: تبني ميزة "إعادة تعيين كلمة مرور"؟ اُنمذج تهديدها: *الانتحال* — هل يمكن لأحد طلب إعادة تعيين لبريد لا يملكه؟ *العبث* — هل يمكن تخمين رمز إعادة التعيين أو إعادة استخدامه؟ *حجب الخدمة* — هل يمكن لأحد إغراق طلبات إعادة التعيين لقفل حساب؟ الإجابة على هذه *قبل كتابة الكود* أرخص بكثير من إيجاد الخطأ بعد أن يجده المهاجمون — "التحوّل يساراً" في أقصى صوره.

نمذجة التهديدات لا تستبدل الفحص الآلي — بل تكمّله. الماسحات تلتقط أخطاء الأنماط المعروفة في كود موجود بالفعل؛ ونمذجة التهديدات تلتقط عيوب التصميم قبل أن يُكتب الكود أصلاً.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Build a simple vulnerability severity classifier, the kind a security pipeline gate uses. Write \`classifyVuln(score)\` where \`score\` is a CVSS-style number from 0 to 10. Return:
- \`"low"\` for score < 4
- \`"medium"\` for 4 to less than 7
- \`"high"\` for 7 to less than 9
- \`"critical"\` for 9 and above

A real pipeline would fail the build automatically on any "critical" result.`,
        ar: `ابنِ مصنّف شدة ثغرات بسيطاً، من النوع الذي تستخدمه بوابة خط أمنية. اكتب \`classifyVuln(score)\` حيث \`score\` رقم بأسلوب CVSS من 0 إلى 10. أعِد:
- \`"low"\` لأقل من 4
- \`"medium"\` من 4 إلى أقل من 7
- \`"high"\` من 7 إلى أقل من 9
- \`"critical"\` لـ9 فأكثر

خط حقيقي سيُفشل البناء تلقائياً على أي نتيجة "critical".`,
      },
      starterCode: `function classifyVuln(score) {
  // TODO: return "low" | "medium" | "high" | "critical" based on score
}

console.log(classifyVuln(2));   // "low"
console.log(classifyVuln(9.8)); // "critical"`,
      solution: `function classifyVuln(score) {
  if (score < 4) return "low";
  if (score < 7) return "medium";
  if (score < 9) return "high";
  return "critical";
}

console.log(classifyVuln(2));   // "low"
console.log(classifyVuln(9.8)); // "critical"`,
      hints: [
        { en: `Check the boundaries in increasing order: < 4, then < 7, then < 9, else critical.`, ar: `تحقّق من الحدود بترتيب تصاعدي: < 4، ثم < 7، ثم < 9، وإلا critical.` },
        { en: `A score of exactly 9 should be "critical", not "high" — the "high" range stops just before 9.`, ar: `درجة تساوي 9 بالضبط يجب أن تكون "critical" لا "high" — نطاق "high" يتوقف قبل 9 مباشرة.` },
      ],
      tests: [
        { name: { en: "Score 2 is low", ar: "الدرجة 2 منخفضة" }, check: `classifyVuln(2) === "low"` },
        { name: { en: "Score 5 is medium", ar: "الدرجة 5 متوسطة" }, check: `classifyVuln(5) === "medium"` },
        { name: { en: "Score 7.5 is high", ar: "الدرجة 7.5 عالية" }, check: `classifyVuln(7.5) === "high"` },
        { name: { en: "Score 9.8 is critical", ar: "الدرجة 9.8 حرجة" }, check: `classifyVuln(9.8) === "critical"` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Log4Shell (2021) 🔍

In December 2021, researchers disclosed a vulnerability in **Log4j**, a Java logging library used, directly or indirectly, inside an enormous share of the world's server software. The flaw, nicknamed **Log4Shell**, let an attacker send a single specially crafted string — sometimes just in a chat message or a username field — that the library would interpret as a command, letting attackers run arbitrary code on the server. It scored a maximum **10.0 on the CVSS severity scale**: about as critical as a vulnerability gets.

The damage came from **dependency depth**: most teams didn't use Log4j directly — it was buried three or four layers deep inside other libraries they depended on. Exactly the "80% of your app is third-party code" supply-chain risk from this lesson. Security teams worldwide spent the following weeks scrambling to find out if Log4j was hiding *anywhere* in their stack, and patch it, because there was no simple way to know.

This is precisely why automated **dependency scanning** in the pipeline matters: a tool that continuously checks every library (including the invisible, deeply-nested ones) against a database of known vulnerabilities would have flagged Log4Shell automatically, instead of teams needing to manually hunt through their entire dependency tree during a live crisis.`,
        ar: `## دراسة حالة واقعية: Log4Shell (2021) 🔍

في ديسمبر 2021، أعلن باحثون عن ثغرة في **Log4j**، مكتبة تسجيل جافا مستخدَمة، مباشرة أو بشكل غير مباشر، داخل حصة هائلة من برمجيات خوادم العالم. الخلل، الملقّب **Log4Shell**، سمح لمهاجم بإرسال نص واحد مُعدّ خصيصاً — أحياناً في مجرد رسالة دردشة أو حقل اسم مستخدم — تفسّره المكتبة كأمر، فيشغّل المهاجمون كوداً عشوائياً على الخادم. سجّلت الثغرة أقصى درجة **10.0 على مقياس شدة CVSS**: أقرب ما يكون لثغرة حرجة قدر الإمكان.

جاء الضرر من **عمق الاعتماديات**: معظم الفرق لم تستخدم Log4j مباشرة — كانت مدفونة ثلاث أو أربع طبقات داخل مكتبات أخرى يعتمدون عليها. بالضبط خطر سلسلة التوريد "80% من تطبيقك كود طرف ثالث" من هذا الدرس. أمضت فرق الأمن حول العالم الأسابيع التالية تهرع لمعرفة إن كان Log4j مختبئاً في *أي مكان* في مجموعتها التقنية، وترقيعه، لأنه لم تكن هناك طريقة بسيطة لمعرفة ذلك.

هذا بالضبط سبب أهمية **فحص الاعتماديات** الآلي في الخط: أداة تتحقق باستمرار من كل مكتبة (بما فيها المدفونة عميقاً وغير المرئية) مقابل قاعدة بيانات ثغرات معروفة كانت ستعلّم Log4Shell تلقائياً، بدل حاجة الفرق للبحث يدوياً في شجرة اعتمادياتها كاملة أثناء أزمة حيّة.`,
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
        {
          q: { en: "What is threat modeling?", ar: "ما هي نمذجة التهديدات؟" },
          choices: [
            { en: "Deliberately asking 'how could this be attacked?' before or while building a feature", ar: "أن تسأل عمداً 'كيف يمكن مهاجمة هذا؟' قبل أو أثناء بناء ميزة" },
            { en: "A tool that automatically deletes vulnerable code", ar: "أداة تحذف الكود الهش تلقائياً" },
            { en: "Running the app under heavy simulated traffic", ar: "تشغيل التطبيق تحت حركة مرور محاكاة ثقيلة" },
          ],
          answer: 0,
          explain: {
            en: "Threat modeling (like the STRIDE framework) is a design-time exercise that catches abuse cases before code is even written — the ultimate shift-left.",
            ar: "نمذجة التهديدات (مثل إطار STRIDE) تمرين وقت التصميم يلتقط حالات إساءة الاستخدام قبل أن يُكتب الكود أصلاً — أقصى صور التحوّل يساراً.",
          },
        },
        {
          q: { en: "In STRIDE, what does the 'E' (Elevation of privilege) check for?", ar: "في STRIDE، عن ماذا يفحص حرف 'E' (تصعيد الصلاحيات)؟" },
          choices: [
            { en: "Whether a normal user could gain admin-level power", ar: "هل يستطيع مستخدم عادي اكتساب قوة مستوى المدير" },
            { en: "Whether the server has enough RAM", ar: "هل لدى الخادم ذاكرة كافية" },
            { en: "Whether the UI looks good on mobile", ar: "هل تبدو الواجهة جيدة على الجوال" },
          ],
          answer: 0,
          explain: {
            en: "Elevation of privilege is exactly the privilege-escalation risk from the Linux lesson, checked deliberately at design time.",
            ar: "تصعيد الصلاحيات هو بالضبط خطر تصعيد الصلاحيات من درس لينكس، يُفحص عمداً في وقت التصميم.",
          },
        },
        {
          q: { en: "Why was Log4Shell so hard for teams to find and fix?", ar: "لماذا كان من الصعب على الفرق إيجاد Log4Shell وإصلاحها؟" },
          choices: [
            { en: "Log4j was often buried several layers deep inside other dependencies, invisible to teams that never used it directly", ar: "كان Log4j غالباً مدفوناً طبقات عدة داخل اعتماديات أخرى، غير مرئي للفرق التي لم تستخدمه مباشرة" },
            { en: "It only affected one small, unpopular website", ar: "أثّر فقط على موقع صغير غير مشهور" },
            { en: "It had a very low CVSS severity score", ar: "كان له درجة شدة CVSS منخفضة جداً" },
          ],
          answer: 0,
          explain: {
            en: "Log4Shell scored a maximum 10.0 severity and hid deep in dependency trees — exactly why automated dependency scanning across the full tree matters.",
            ar: "سجّل Log4Shell أقصى شدة 10.0 واختبأ عميقاً في أشجار الاعتماديات — بالضبط سبب أهمية فحص الاعتماديات الآلي عبر الشجرة كاملة.",
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
