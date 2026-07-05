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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A SOC watches for attacks 24/7 using a SIEM that aggregates logs and alerts
- Tier-1 analysts do triage: real threat or false alarm?
- IR lifecycle: Prepare → Identify → Contain → Eradicate → Recover → Learn

**Career:** SOC Analyst is the most common entry-level security role. Practice on free platforms like TryHackMe and Blue Team Labs (Resources). **Next:** Penetration Testing — the offensive side.`,
        ar: `## الخلاصة

- SOC يراقب الهجمات 24/7 باستخدام SIEM يجمع السجلّات ويطلق التنبيهات
- محللو المستوى الأول يفرزون: تهديد حقيقي أم إنذار كاذب؟
- دورة الاستجابة: تحضير ← تحديد ← احتواء ← استئصال ← تعافٍ ← تعلّم

**المسار المهني:** محلل SOC أشيع وظيفة أمن للمبتدئين. تدرّب على منصات مجانية مثل TryHackMe وBlue Team Labs (المصادر). **التالي:** اختبار الاختراق — الجانب الهجومي.`,
      },
    },
  ],
};
