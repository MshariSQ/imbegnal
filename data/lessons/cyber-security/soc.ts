import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "soc",
  title: { en: "SOC Analysis — Defending in Real Time", ar: "تحليل SOC — الدفاع في الوقت الحقيقي" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What a **SOC** (Security Operations Center) is and does
- **SIEM**, alerts, and log analysis
- The incident response lifecycle
- This is the #1 entry-level security job — and you'll do a mini triage`,
        ar: `## ماذا ستتعلم

- ما هو **SOC** (مركز عمليات الأمن) وماذا يفعل
- **SIEM**، التنبيهات، وتحليل السجلّات
- دورة حياة الاستجابة للحوادث
- هذه أكثر وظيفة أمن للمبتدئين طلباً — وستجري فرزاً مصغّراً`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The security control room 🖥️

Imagine a building's security office: screens everywhere, guards watching camera feeds, ready to act the moment something looks wrong. A **SOC** is that, but for a company's computers — a team watching for attacks 24/7.

Their main tool is a **SIEM** (Security Information and Event Management). It's a giant funnel: every server, firewall, and laptop sends its **logs** to the SIEM, which correlates them and raises **alerts** when patterns look malicious.

A SOC **Analyst** (the entry role, often called Tier 1) spends the day doing **triage**: an alert fires → is it a real threat or a false alarm? For example:

- 1 failed login → normal, someone fat-fingered a password.
- 500 failed logins on one account in 2 minutes → **brute force attack** — escalate!

**The incident response lifecycle** (memorize the order):

1. **Preparation** — tools, plans, and training ready *before* anything happens.
2. **Identification** — detect and confirm: is this a real incident?
3. **Containment** — stop the bleeding: isolate the infected machine from the network.
4. **Eradication** — remove the malware / close the hole.
5. **Recovery** — restore systems, verify they're clean, bring them back online.
6. **Lessons Learned** — write it up so it can't happen the same way twice.

Tier-1 analysts mostly live in steps 2–3. It's pattern-recognition work, and it's the most common way people break into security.`,
        ar: `## غرفة التحكم الأمني 🖥️

تخيّل مكتب أمن مبنى: شاشات في كل مكان، حرّاس يراقبون الكاميرات، مستعدون للتحرك لحظة ظهور خلل. **SOC** هو ذلك، لكن لحواسيب الشركة — فريق يراقب الهجمات 24/7.

أداتهم الرئيسية **SIEM** (إدارة معلومات وأحداث الأمن). قمع عملاق: كل خادم وجدار ناري وحاسوب يرسل **سجلّاته** إلى SIEM، الذي يربطها ويطلق **تنبيهات** حين تبدو الأنماط خبيثة.

**محلل SOC** (وظيفة البداية، تسمى غالباً المستوى الأول Tier 1) يقضي يومه في **الفرز (triage)**: يُطلَق تنبيه ← هل هو تهديد حقيقي أم إنذار كاذب؟ مثلاً:

- محاولة دخول فاشلة واحدة ← عادي، أحدهم أخطأ في كلمة المرور.
- 500 محاولة فاشلة على حساب واحد خلال دقيقتين ← **هجوم تخمين عنيف** — صعّد!

**دورة حياة الاستجابة للحوادث** (احفظ الترتيب):

1. **التحضير** — الأدوات والخطط والتدريب جاهزة *قبل* وقوع أي شيء.
2. **التحديد** — اكتشف وأكّد: هل هذا حادث حقيقي؟
3. **الاحتواء** — أوقف النزيف: اعزل الجهاز المصاب عن الشبكة.
4. **الاستئصال** — أزِل البرمجية الخبيثة / أغلق الثغرة.
5. **التعافي** — استعِد الأنظمة، تأكّد من نظافتها، وأعِدها للعمل.
6. **الدروس المستفادة** — وثّق الحادث كي لا يتكرر بنفس الطريقة.

محللو المستوى الأول يعيشون غالباً في الخطوتين 2–3. عمل قائم على تمييز الأنماط، وهو أشيع طريق للدخول إلى مجال الأمن.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Alert severity and the alert-fatigue trap ⚠️

Not every alert deserves the same reaction. Most SOCs bucket alerts by **severity**:

- **Low** — a handful of failed logins, a blocked port scan. Log it, move on.
- **Medium** — unusual login location, a policy violation. Worth a quick look.
- **High** — signs of active compromise (malware signature match, mass failed logins). Investigate now.
- **Critical** — confirmed breach in progress. Drop everything.

There's also a crucial distinction: a **false positive** is an alert that looks bad but isn't (harmless), while a **false negative** is a real attack that *didn't* trigger an alert (the dangerous one — it's invisible until the damage is done).

Here's the trap: SIEMs can generate **thousands of alerts a day**. If most turn out to be false positives, analysts start tuning them out — this is **alert fatigue**. The real danger isn't a missing tool; it's a *real* high-severity alert getting lost in a sea of noise because everyone's stopped paying attention.`,
        ar: `## شدة التنبيهات وفخ إرهاق التنبيهات ⚠️

لا يستحق كل تنبيه نفس رد الفعل. تُصنّف معظم مراكز SOC التنبيهات حسب **الشدة**:

- **منخفضة** — بضع محاولات دخول فاشلة، فحص منفذ محجوب. سجّله وتابع.
- **متوسطة** — موقع دخول غير معتاد، مخالفة سياسة. تستحق نظرة سريعة.
- **عالية** — علامات اختراق نشط (تطابق توقيع برمجية خبيثة، محاولات دخول فاشلة جماعية). تحقّق الآن.
- **حرجة** — اختراق مؤكد وجارٍ. اترك كل شيء آخر.

هناك أيضاً تمييز جوهري: **الإيجابية الكاذبة** هي تنبيه يبدو سيئاً لكنه ليس كذلك (غير ضار)، بينما **السلبية الكاذبة** هجوم حقيقي *لم* يُطلق تنبيهاً (وهو الأخطر — يبقى خفياً حتى يقع الضرر).

هنا الفخ: قد تُطلق أنظمة SIEM **آلاف التنبيهات يومياً**. إذا تبيّن أن معظمها إيجابيات كاذبة، يبدأ المحللون بتجاهلها — هذا يُسمّى **إرهاق التنبيهات (alert fatigue)**. الخطر الحقيقي ليس أداة ناقصة؛ بل تنبيه *حقيقي* عالي الشدة يضيع وسط بحر من الضجيج لأن الجميع توقف عن الانتباه.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: "**Build an alert severity classifier.** Write `classifySeverity(failedAttempts)` that returns `\"low\"` for fewer than 5 attempts, `\"medium\"` for 5–49, `\"high\"` for 50 or more. This is exactly the first triage decision a Tier-1 analyst makes on a login-attempt alert.",
        ar: "**ابنِ مصنّف شدة التنبيهات.** اكتب `classifySeverity(failedAttempts)` تُعيد `\"low\"` لأقل من 5 محاولات، و`\"medium\"` بين 5 و49، و`\"high\"` لـ50 أو أكثر. هذا بالضبط قرار الفرز الأول الذي يتخذه محلل المستوى الأول على تنبيه محاولات دخول.",
      },
      starterCode: `function classifySeverity(failedAttempts) {
  // TODO: return "low", "medium", or "high"
}
`,
      solution: `function classifySeverity(failedAttempts) {
  if (failedAttempts < 5) return "low";
  if (failedAttempts < 50) return "medium";
  return "high";
}
`,
      hints: [
        { en: "Check the smallest bucket first, then the next, then fall through.", ar: "تحقّق من أصغر فئة أولاً، ثم التالية، ثم اترك الباقي." },
        { en: "Boundaries: <5 is low, <50 is medium, everything else is high.", ar: "الحدود: أقل من 5 منخفضة، أقل من 50 متوسطة، والباقي عالية." },
      ],
      tests: [
        { name: { en: "2 attempts is low", ar: "محاولتان منخفضة" }, check: `classifySeverity(2) === "low"` },
        { name: { en: "5 attempts is medium", ar: "5 محاولات متوسطة" }, check: `classifySeverity(5) === "medium"` },
        { name: { en: "49 attempts is medium", ar: "49 محاولة متوسطة" }, check: `classifySeverity(49) === "medium"` },
        { name: { en: "500 attempts is high", ar: "500 محاولة عالية" }, check: `classifySeverity(500) === "high"` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Target (2013) 🔍

In late 2013, Target's own security tools — built by FireEye and monitored by a SOC team — **did** detect the malware installed on Target's payment systems. Alerts fired. But Target's team, swamped with alert volume, didn't escalate them in time.

The result: attackers stole **~40 million credit and debit card numbers**, plus personal data on ~70 million customers, during the holiday shopping season. It became one of the largest retail breaches in history — not because the SOC lacked tools, but because a real alert got buried under noise.

The lesson for every future analyst: tuning out low-value alerts is necessary, but the goal is separating signal from noise — not tuning out *everything*.`,
        ar: `## دراسة حالة واقعية: Target (2013) 🔍

في أواخر 2013، اكتشفت أدوات الأمن الخاصة بـTarget — من صنع FireEye ويراقبها فريق SOC — **بالفعل** البرمجية الخبيثة المثبتة على أنظمة الدفع. أُطلقت التنبيهات. لكن فريق Target، المُثقَل بحجم التنبيهات، لم يصعّدها في الوقت المناسب.

النتيجة: سرق المهاجمون **نحو 40 مليون رقم بطاقة ائتمان وخصم**، إضافة إلى بيانات شخصية لنحو 70 مليون عميل، خلال موسم تسوق الأعياد. أصبحت واحدة من أكبر اختراقات التجزئة في التاريخ — ليس لأن SOC افتقر للأدوات، بل لأن تنبيهاً حقيقياً دُفن تحت الضجيج.

الدرس لكل محلل مستقبلي: تجاهل التنبيهات منخفضة القيمة ضروري، لكن الهدف فصل الإشارة عن الضجيج — لا تجاهل *كل شيء*.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What does a SIEM do?", ar: "ماذا يفعل SIEM؟" },
          choices: [
            { en: "Collects logs from everywhere and raises alerts on suspicious patterns", ar: "يجمع السجلّات من كل مكان ويطلق تنبيهات على الأنماط المشبوهة" },
            { en: "Encrypts the company's hard drives", ar: "يشفّر أقراص الشركة" },
            { en: "Blocks all internet access", ar: "يحجب كل وصول للإنترنت" },
          ],
          answer: 0,
          explain: {
            en: "A SIEM is the central funnel: aggregate logs, correlate them, and alert analysts. It's the SOC's main screen.",
            ar: "SIEM هو القمع المركزي: تجميع السجلّات، ربطها، وتنبيه المحللين. إنه الشاشة الرئيسية لـ SOC.",
          },
        },
        {
          q: { en: "500 failed logins on one account in 2 minutes suggests…", ar: "500 محاولة دخول فاشلة على حساب واحد خلال دقيقتين تشير إلى…" },
          choices: [
            { en: "A forgetful user", ar: "مستخدم كثير النسيان" },
            { en: "A brute-force attack — escalate", ar: "هجوم تخمين عنيف — صعّد" },
            { en: "A slow internet connection", ar: "اتصال إنترنت بطيء" },
          ],
          answer: 1,
          explain: {
            en: "That volume and speed is automated password guessing. Distinguishing this from noise is the core triage skill.",
            ar: "هذا الحجم والسرعة تخمين آلي لكلمات المرور. تمييز هذا عن الضجيج هو مهارة الفرز الجوهرية.",
          },
        },
        {
          q: { en: "In incident response, what comes right after Identification?", ar: "في الاستجابة للحوادث، ماذا يأتي مباشرة بعد التحديد؟" },
          choices: [
            { en: "Lessons Learned", ar: "الدروس المستفادة" },
            { en: "Containment", ar: "الاحتواء" },
            { en: "Preparation", ar: "التحضير" },
          ],
          answer: 1,
          explain: {
            en: "Order: Preparation → Identification → Containment → Eradication → Recovery → Lessons Learned. Contain to stop the spread first.",
            ar: "الترتيب: التحضير ← التحديد ← الاحتواء ← الاستئصال ← التعافي ← الدروس المستفادة. احتوِ لتوقف الانتشار أولاً.",
          },
        },
        {
          q: { en: "Why is 'containment' before 'eradication'?", ar: "لماذا 'الاحتواء' قبل 'الاستئصال'؟" },
          choices: [
            { en: "To stop the attack spreading while you prepare to remove it", ar: "لإيقاف انتشار الهجوم بينما تستعد لإزالته" },
            { en: "Because eradication is optional", ar: "لأن الاستئصال اختياري" },
            { en: "There's no reason", ar: "لا سبب" },
          ],
          answer: 0,
          explain: {
            en: "Isolate first (pull the machine off the network) so damage stops immediately, then take time to fully clean it.",
            ar: "اعزل أولاً (افصل الجهاز عن الشبكة) ليتوقف الضرر فوراً، ثم خذ وقتك لتنظيفه بالكامل.",
          },
        },
        {
          q: { en: "What is a 'false negative'?", ar: "ما هي 'السلبية الكاذبة'؟" },
          choices: [
            { en: "A real attack that did NOT trigger any alert", ar: "هجوم حقيقي لم يُطلق أي تنبيه" },
            { en: "A harmless event that triggered an alert", ar: "حدث غير ضار أطلق تنبيهاً" },
            { en: "An alert that fires twice", ar: "تنبيه يُطلق مرتين" },
          ],
          answer: 0,
          explain: {
            en: "False negatives are the most dangerous kind of miss — the attack is happening but invisible to the SOC until damage surfaces.",
            ar: "السلبيات الكاذبة هي أخطر أنواع الإغفال — الهجوم يحدث لكنه غير مرئي لـ SOC حتى يظهر الضرر.",
          },
        },
        {
          q: { en: "What actually went wrong in the 2013 Target breach?", ar: "ما الذي حدث فعلياً في اختراق Target عام 2013؟" },
          choices: [
            { en: "Real alerts fired but were buried under alert volume and not escalated in time", ar: "أُطلقت تنبيهات حقيقية لكنها دُفنت تحت حجم التنبيهات ولم تُصعَّد في الوقت المناسب" },
            { en: "Target had no security tools at all", ar: "لم يكن لدى Target أي أدوات أمنية إطلاقاً" },
            { en: "The attack happened through a phone call", ar: "حدث الهجوم عبر مكالمة هاتفية" },
          ],
          answer: 0,
          explain: {
            en: "This is the classic alert-fatigue failure: detection worked, but the human triage process didn't act on the signal in time.",
            ar: "هذا فشل إرهاق التنبيهات الكلاسيكي: الكشف نجح، لكن عملية الفرز البشري لم تتصرف بناءً على الإشارة في الوقت المناسب.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A SOC watches for attacks 24/7 using a SIEM that aggregates logs and alerts
- Tier-1 analysts do triage: real threat or false alarm?
- Alerts are bucketed by severity (low/medium/high/critical); false positives waste time, false negatives are dangerous
- You built a real \`classifySeverity\` triage function
- Target (2013) shows how alert fatigue can bury a real, already-detected attack
- IR lifecycle: Prepare → Identify → Contain → Eradicate → Recover → Learn

**Career:** SOC Analyst is the most common entry-level security role. Practice on free platforms like TryHackMe and Blue Team Labs (Resources). **Next:** Penetration Testing — the offensive side.`,
        ar: `## الخلاصة

- SOC يراقب الهجمات 24/7 باستخدام SIEM يجمع السجلّات ويطلق التنبيهات
- محللو المستوى الأول يفرزون: تهديد حقيقي أم إنذار كاذب؟
- تُصنَّف التنبيهات حسب الشدة (منخفضة/متوسطة/عالية/حرجة)؛ الإيجابيات الكاذبة تُهدر الوقت، والسلبيات الكاذبة خطيرة
- بنيت دالة فرز \`classifySeverity\` حقيقية
- Target (2013) تُظهر كيف يمكن لإرهاق التنبيهات أن يدفن هجوماً حقيقياً مُكتشَفاً بالفعل
- دورة الاستجابة: تحضير ← تحديد ← احتواء ← استئصال ← تعافٍ ← تعلّم

**المسار المهني:** محلل SOC أشيع وظيفة أمن للمبتدئين. تدرّب على منصات مجانية مثل TryHackMe وBlue Team Labs (المصادر). **التالي:** اختبار الاختراق — الجانب الهجومي.`,
      },
    },
  ],
};
