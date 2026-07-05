import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "penetration-testing",
  title: { en: "Penetration Testing — Ethical Hacking", ar: "اختبار الاختراق — القرصنة الأخلاقية" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What a **penetration test** is (and how it's legal)
- The 5 phases every pentest follows
- The mindset: think like an attacker to defend better
- How this becomes a well-paid career

⚠️ **The line that matters:** a pentester has **written permission** to attack a system. Without it, the exact same actions are a serious crime. Ethics and authorization are the whole profession.`,
        ar: `## ماذا ستتعلم

- ما هو **اختبار الاختراق** (وكيف يكون قانونياً)
- المراحل الخمس التي يتبعها كل اختبار
- العقلية: فكّر كمهاجم لتدافع أفضل
- كيف يصبح هذا مساراً مهنياً جيّد الأجر

⚠️ **الخط الفاصل:** مختبِر الاختراق لديه **إذن مكتوب** بمهاجمة النظام. بدونه، نفس الأفعال جريمة خطيرة. الأخلاق والتصريح هما جوهر المهنة كلها.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Hiring a burglar to test your locks 🔓

Companies pay **ethical hackers** (penetration testers) to break into their own systems *on purpose*, then report every hole so it can be fixed before a real criminal finds it. It's like hiring a professional burglar to test your locks — with a signed contract.

Every engagement follows **5 phases**:

1. **Reconnaissance** — gather intel on the target. Public info, employee names, exposed servers. (Passive: looking without touching.)
2. **Scanning** — actively probe: which ports are open? what software and versions run? Tools like Nmap map the attack surface.
3. **Gaining Access** — exploit a weakness found in scanning to get in (a vulnerable app, a weak password, a known bug).
4. **Maintaining Access** — can an attacker stay hidden and keep the foothold? This shows the real-world impact.
5. **Reporting** — the most important phase. Document every finding, its risk, and exactly how to fix it. The report *is* the product the client pays for.

**The key insight:** offense teaches defense. Once you've seen how easily a weak password or an unpatched server gets exploited, you defend far more effectively. That's why many blue-team (defensive) pros learn red-team (offensive) skills.

**Getting started legally and free:** platforms like **TryHackMe**, **Hack The Box**, and **PortSwigger Web Security Academy** give you deliberately vulnerable machines to practice on — no risk, huge learning. Certifications like CompTIA PenTest+ and OSCP open doors to paid roles.`,
        ar: `## استئجار لصّ لاختبار أقفالك 🔓

تدفع الشركات لـ**المخترقين الأخلاقيين** (مختبِري الاختراق) ليقتحموا أنظمتها *عمداً*، ثم يبلّغوا عن كل ثغرة لتُصلَح قبل أن يجدها مجرم حقيقي. مثل استئجار لصّ محترف لاختبار أقفالك — بعقد موقّع.

كل مهمة تتبع **5 مراحل**:

1. **الاستطلاع (Reconnaissance)** — جمع معلومات عن الهدف. معلومات عامة، أسماء موظفين، خوادم مكشوفة. (سلبي: نظر دون لمس.)
2. **الفحص (Scanning)** — سبر نشط: أي منافذ مفتوحة؟ أي برامج وإصداراتها تعمل؟ أدوات مثل Nmap ترسم سطح الهجوم.
3. **الوصول (Gaining Access)** — استغلال ضعف وُجد في الفحص للدخول (تطبيق هشّ، كلمة مرور ضعيفة، ثغرة معروفة).
4. **الحفاظ على الوصول (Maintaining Access)** — هل يستطيع المهاجم البقاء مختفياً محتفظاً بموطئ القدم؟ يُظهر الأثر الواقعي.
5. **التقرير (Reporting)** — أهم مرحلة. توثيق كل اكتشاف وخطورته وكيفية إصلاحه بالضبط. التقرير *هو* المنتج الذي يدفع العميل مقابله.

**الفكرة الجوهرية:** الهجوم يعلّم الدفاع. حين ترى كم يسهل استغلال كلمة مرور ضعيفة أو خادم غير محدّث، تدافع بفعالية أكبر بكثير. لهذا يتعلّم كثير من محترفي الفريق الأزرق (الدفاعي) مهارات الفريق الأحمر (الهجومي).

**البداية قانونياً ومجاناً:** منصات مثل **TryHackMe** و**Hack The Box** و**PortSwigger Web Security Academy** تمنحك أجهزة هشّة عمداً للتدرّب عليها — بلا خطر، وتعلّم هائل. شهادات مثل CompTIA PenTest+ وOSCP تفتح أبواب الوظائف المدفوعة.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What makes penetration testing legal?", ar: "ما الذي يجعل اختبار الاختراق قانونياً؟" },
          choices: [
            { en: "Using special tools", ar: "استخدام أدوات خاصة" },
            { en: "Explicit written authorization from the system owner", ar: "تصريح مكتوب صريح من مالك النظام" },
            { en: "Doing it at night", ar: "فعله ليلاً" },
          ],
          answer: 1,
          explain: {
            en: "Authorization is the only difference between a pentester and a criminal. The actions can be identical; the permission is not.",
            ar: "التصريح هو الفرق الوحيد بين مختبِر الاختراق والمجرم. الأفعال قد تتطابق؛ أما الإذن فلا.",
          },
        },
        {
          q: { en: "Which phase maps open ports and running software?", ar: "أي مرحلة ترسم المنافذ المفتوحة والبرامج العاملة؟" },
          choices: [
            { en: "Scanning", ar: "الفحص" },
            { en: "Reporting", ar: "التقرير" },
            { en: "Recovery", ar: "التعافي" },
          ],
          answer: 0,
          explain: {
            en: "Scanning actively probes the target (e.g. with Nmap) to find the attack surface, after passive reconnaissance.",
            ar: "الفحص يسبر الهدف نشطاً (مثلاً بـ Nmap) لإيجاد سطح الهجوم، بعد الاستطلاع السلبي.",
          },
        },
        {
          q: { en: "Which phase is the actual deliverable to the client?", ar: "أي مرحلة هي المُخرَج الفعلي للعميل؟" },
          choices: [
            { en: "Gaining Access", ar: "الوصول" },
            { en: "Reporting", ar: "التقرير" },
            { en: "Reconnaissance", ar: "الاستطلاع" },
          ],
          answer: 1,
          explain: {
            en: "Breaking in is not the point — the report of findings and fixes is what the client pays for and acts on.",
            ar: "الاقتحام ليس الغاية — تقرير الاكتشافات والإصلاحات هو ما يدفع العميل مقابله ويتصرف بناءً عليه.",
          },
        },
        {
          q: { en: "Why do defensive (blue-team) pros learn offensive skills?", ar: "لماذا يتعلّم محترفو الدفاع (الفريق الأزرق) مهارات هجومية؟" },
          choices: [
            { en: "To attack competitors", ar: "لمهاجمة المنافسين" },
            { en: "Understanding how attacks work makes their defense far stronger", ar: "فهم كيفية عمل الهجمات يجعل دفاعهم أقوى بكثير" },
            { en: "It's required by law", ar: "القانون يفرضه" },
          ],
          answer: 1,
          explain: {
            en: "You can't defend against what you don't understand. Seeing the attacker's playbook sharpens every defensive decision.",
            ar: "لا يمكنك الدفاع ضد ما لا تفهمه. رؤية دليل المهاجم تصقل كل قرار دفاعي.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Track complete! 🎓

You've built a full security foundation:

- Computers, networking, and Linux — the terrain
- Python — your automation weapon
- Security basics, web attacks, SOC defense, and ethical pentesting

**Your path to paid work:** pick a side — defense (SOC Analyst) or offense (Pentester) — and go deep on TryHackMe/Hack The Box. Get a cert (Security+ to start, then PenTest+ or a SOC cert), build a GitHub of your scripts and writeups, and you're job-ready. Stay ethical, stay curious.`,
        ar: `## اكتمل المسار! 🎓

بنيت أساساً أمنياً كاملاً:

- الحواسيب والشبكات ولينكس — الأرض
- بايثون — سلاح الأتمتة
- أساسيات الأمن، هجمات الويب، دفاع SOC، والاختبار الأخلاقي

**طريقك إلى العمل المدفوع:** اختر جانباً — دفاع (محلل SOC) أو هجوم (مختبِر اختراق) — وتعمّق على TryHackMe/Hack The Box. احصل على شهادة (Security+ للبداية، ثم PenTest+ أو شهادة SOC)، ابنِ GitHub بسكربتاتك وتقاريرك، وتكون جاهزاً للوظيفة. ابقَ أخلاقياً، ابقَ فضولياً.`,
      },
    },
  ],
};
