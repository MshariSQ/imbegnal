import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "cyber-basics",
  title: { en: "Security Basics — The Defender's Mindset", ar: "أساسيات الأمن — عقلية المدافع" },
  estMinutes: 25,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- The **CIA triad** — the 3 goals of all security
- Common attack types, in plain language
- Core defenses every organization needs
- How to *think* like a defender`,
        ar: `## ماذا ستتعلم

- **ثالوث CIA** — الأهداف الثلاثة لكل أمن
- أنواع الهجمات الشائعة، بلغة بسيطة
- الدفاعات الأساسية التي تحتاجها كل مؤسسة
- كيف *تفكّر* كمدافع`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The three treasures: C-I-A 🛡️

All of security protects three things (memorize this — interviewers ask):

- **Confidentiality** — only the right people can see the data. (Your medical records stay private.)
- **Integrity** — data isn't secretly changed. (Your bank balance shows the real number.)
- **Availability** — the system is up when you need it. (The website works, not knocked offline.)

Every attack breaks at least one. A data leak breaks Confidentiality; tampering breaks Integrity; a DDoS flood breaks Availability.

**The common attacks (know these by name):**

- **Phishing** — a fake email/message tricks you into giving a password. (Still the #1 cause of breaches — humans, not code.)
- **Malware** — malicious software: viruses, ransomware (locks your files for ransom), spyware.
- **Brute force** — trying millions of passwords until one works.
- **Man-in-the-Middle** — an attacker secretly sits between you and a site, reading traffic.
- **SQL Injection / XSS** — tricking a website into running attacker input as code (next lesson).

**The core defenses:**

- **Strong auth + MFA** — a password *plus* a second factor (phone code). Kills most account attacks.
- **Encryption** — scramble data so a thief gets gibberish.
- **Patching** — updating software to fix known holes. Boring, and the most effective thing you can do.
- **Least privilege** — give each account the *minimum* access it needs. Limits the damage when one is compromised.
- **Defense in depth** — many layers, so one failure doesn't sink you.`,
        ar: `## الكنوز الثلاثة: C-I-A 🛡️

كل الأمن يحمي ثلاثة أشياء (احفظها — تُسأل عنها في المقابلات):

- **السرّية (Confidentiality)** — الأشخاص المخوّلون فقط يرون البيانات. (سجلّك الطبي يبقى خاصاً.)
- **السلامة (Integrity)** — البيانات لا تُغيَّر خفية. (رصيدك البنكي يُظهر الرقم الحقيقي.)
- **التوفّر (Availability)** — النظام يعمل حين تحتاجه. (الموقع يشتغل، لا يُسقَط.)

كل هجوم يكسر واحداً على الأقل. تسريب البيانات يكسر السرّية؛ التلاعب يكسر السلامة؛ هجوم الحرمان DDoS يكسر التوفّر.

**الهجمات الشائعة (اعرفها بالاسم):**

- **التصيّد (Phishing)** — رسالة مزيّفة تخدعك لتسليم كلمة مرور. (ما زال السبب رقم 1 للاختراقات — البشر، لا الكود.)
- **البرمجيات الخبيثة (Malware)** — فيروسات، فدية (تقفل ملفاتك مقابل فدية)، تجسّس.
- **التخمين العنيف (Brute force)** — تجربة ملايين كلمات المرور حتى تنجح واحدة.
- **الوسيط (Man-in-the-Middle)** — مهاجم يجلس خفية بينك والموقع يقرأ البيانات.
- **حقن SQL / XSS** — خداع موقع لتنفيذ مدخلات المهاجم ككود (الدرس التالي).

**الدفاعات الأساسية:**

- **مصادقة قوية + MFA** — كلمة مرور *بالإضافة* لعامل ثانٍ (رمز الهاتف). يقتل معظم هجمات الحسابات.
- **التشفير** — تشويش البيانات ليحصل السارق على طلاسم.
- **التحديث (Patching)** — تحديث البرامج لسدّ الثغرات المعروفة. ممل، وأكثر شيء فعّال يمكنك فعله.
- **أقل صلاحية (Least privilege)** — أعطِ كل حساب *الحد الأدنى* من الوصول. يحدّ الضرر عند اختراق أحدها.
- **الدفاع بالعمق** — طبقات كثيرة، فلا يُسقطك فشل واحد.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "A hacker floods a website so it goes offline. Which CIA goal is broken?", ar: "مهاجم يُغرِق موقعاً حتى يتوقف. أي هدف من CIA كُسر؟" },
          choices: [
            { en: "Confidentiality", ar: "السرّية" },
            { en: "Integrity", ar: "السلامة" },
            { en: "Availability", ar: "التوفّر" },
          ],
          answer: 2,
          explain: {
            en: "Taking a service offline attacks Availability. This is what a DDoS (Distributed Denial of Service) does.",
            ar: "إسقاط الخدمة يهاجم التوفّر. هذا ما يفعله هجوم الحرمان الموزّع DDoS.",
          },
        },
        {
          q: { en: "What is phishing?", ar: "ما هو التصيّد (phishing)؟" },
          choices: [
            { en: "Flooding a network with traffic", ar: "إغراق شبكة بالبيانات" },
            { en: "Tricking a person into revealing secrets via fake messages", ar: "خداع شخص لكشف أسراره عبر رسائل مزيّفة" },
            { en: "Cracking encryption", ar: "كسر التشفير" },
          ],
          answer: 1,
          explain: {
            en: "Phishing targets the human, not the machine — which is why it's so effective and why awareness training matters.",
            ar: "التصيّد يستهدف الإنسان لا الآلة — ولهذا هو فعّال جداً، ولهذا يهمّ التدريب التوعوي.",
          },
        },
        {
          q: { en: "What does 'least privilege' mean?", ar: "ماذا تعني 'أقل صلاحية'؟" },
          choices: [
            { en: "Give every account full admin to be safe", ar: "امنح كل حساب صلاحيات مدير كاملة للأمان" },
            { en: "Give each account only the minimum access it needs", ar: "امنح كل حساب الحد الأدنى فقط مما يحتاجه" },
            { en: "Remove all passwords", ar: "احذف كل كلمات المرور" },
          ],
          answer: 1,
          explain: {
            en: "Minimum necessary access limits the blast radius: if one account is compromised, the attacker can't reach everything.",
            ar: "الحد الأدنى اللازم من الوصول يحدّ نطاق الضرر: إذا اختُرق حساب، لا يصل المهاجم إلى كل شيء.",
          },
        },
        {
          q: { en: "What is the single most effective everyday defense?", ar: "ما أكثر دفاع يومي فعالية؟" },
          choices: [
            { en: "Keeping software patched/updated", ar: "إبقاء البرامج محدّثة" },
            { en: "Changing your desktop wallpaper", ar: "تغيير خلفية سطح المكتب" },
            { en: "Turning the computer off at night", ar: "إطفاء الحاسوب ليلاً" },
          ],
          answer: 0,
          explain: {
            en: "Most breaches exploit known, already-patched vulnerabilities. Updating closes those doors — unglamorous but crucial.",
            ar: "معظم الاختراقات تستغل ثغرات معروفة ومُرقّعة أصلاً. التحديث يغلق تلك الأبواب — غير برّاق لكنه حاسم.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- **CIA triad**: Confidentiality, Integrity, Availability — the goals of all security
- Attacks: phishing, malware, brute force, MITM, injection
- Defenses: MFA, encryption, patching, least privilege, defense in depth

**Defender's mindset:** always ask "what could go wrong, and which of C-I-A does it threaten?" **Next:** Web Security — the specific attacks against websites, with hands-on detection.`,
        ar: `## الخلاصة

- **ثالوث CIA**: السرّية، السلامة، التوفّر — أهداف كل أمن
- الهجمات: التصيّد، البرمجيات الخبيثة، التخمين، الوسيط، الحقن
- الدفاعات: MFA، التشفير، التحديث، أقل صلاحية، الدفاع بالعمق

**عقلية المدافع:** اسأل دائماً "ما الذي قد يحدث، وأيّ عناصر C-I-A يهدّده؟" **التالي:** أمن الويب — الهجمات المحددة على المواقع، مع كشف عملي.`,
      },
    },
  ],
};
