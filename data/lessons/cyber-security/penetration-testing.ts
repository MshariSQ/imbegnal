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
      type: "text",
      body: {
        en: `## Scoring how bad a vulnerability really is: CVSS 📊

A pentest report can list dozens of findings. Which one gets fixed first? The industry standard answer is **CVSS** (Common Vulnerability Scoring System) — a score from 0 to 10 that turns "this looks bad" into a number a manager can prioritize against a deadline.

Rough bands used across the industry:

- **0.0 – 3.9** → Low
- **4.0 – 6.9** → Medium
- **7.0 – 8.9** → High
- **9.0 – 10.0** → Critical

A **Critical** finding (like a remote attacker gaining full server control with zero authentication) gets patched within hours. A **Low** finding (like a missing security header) might sit in the backlog for months. This is exactly why **Reporting** is the deliverable — a list of holes without severity scoring just overwhelms the client; a scored, prioritized list gets acted on.`,
        ar: `## تقييم مدى خطورة الثغرة فعلياً: CVSS 📊

قد يسرد تقرير اختبار الاختراق عشرات الاكتشافات. أيّها يُصلَح أولاً؟ الإجابة المعيارية في الصناعة هي **CVSS** (نظام تسجيل الثغرات الموحّد) — درجة من 0 إلى 10 تحوّل "هذا يبدو سيئاً" إلى رقم يستطيع المدير ترتيب أولوياته بناءً عليه مقابل موعد نهائي.

النطاقات التقريبية المستخدمة في الصناعة:

- **0.0 – 3.9** ← منخفضة
- **4.0 – 6.9** ← متوسطة
- **7.0 – 8.9** ← عالية
- **9.0 – 10.0** ← حرجة

اكتشاف **حرج** (كمهاجم عن بُعد يحصل على تحكم كامل بالخادم دون أي مصادقة) يُصلَح خلال ساعات. اكتشاف **منخفض** (كترويسة أمان مفقودة) قد يبقى في قائمة الانتظار لأشهر. هذا بالضبط سبب كون **التقرير** هو المُخرَج: قائمة ثغرات بلا تقييم شدة تُغرق العميل؛ أما قائمة مُقيَّمة ومرتّبة فتُنفَّذ فعلياً.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: "**Build a CVSS severity classifier.** Write `cvssSeverity(score)` that returns `\"low\"` (0–3.9), `\"medium\"` (4–6.9), `\"high\"` (7–8.9), or `\"critical\"` (9–10). This is the exact logic a report-generation tool uses to sort findings by urgency.",
        ar: "**ابنِ مصنّف شدة CVSS.** اكتب `cvssSeverity(score)` تُعيد `\"low\"` (0–3.9)، أو `\"medium\"` (4–6.9)، أو `\"high\"` (7–8.9)، أو `\"critical\"` (9–10). هذا بالضبط المنطق الذي تستخدمه أداة توليد التقارير لترتيب الاكتشافات حسب الإلحاح.",
      },
      starterCode: `function cvssSeverity(score) {
  // TODO: return "low", "medium", "high", or "critical"
}
`,
      solution: `function cvssSeverity(score) {
  if (score < 4) return "low";
  if (score < 7) return "medium";
  if (score < 9) return "high";
  return "critical";
}
`,
      hints: [
        { en: "Same pattern as any bucket classifier: check smallest boundary first.", ar: "نفس نمط أي مصنّف فئات: تحقّق من أصغر حد أولاً." },
        { en: "9 and above is critical, 7–8.9 is high, 4–6.9 is medium, below 4 is low.", ar: "9 فأعلى حرجة، 7–8.9 عالية، 4–6.9 متوسطة، أقل من 4 منخفضة." },
      ],
      tests: [
        { name: { en: "2.1 is low", ar: "2.1 منخفضة" }, check: `cvssSeverity(2.1) === "low"` },
        { name: { en: "5.5 is medium", ar: "5.5 متوسطة" }, check: `cvssSeverity(5.5) === "medium"` },
        { name: { en: "8.1 is high", ar: "8.1 عالية" }, check: `cvssSeverity(8.1) === "high"` },
        { name: { en: "9.8 is critical", ar: "9.8 حرجة" }, check: `cvssSeverity(9.8) === "critical"` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: Equifax (2017) 🔍

Equifax, one of the three major US credit bureaus, was running Apache Struts with a known vulnerability (**CVE-2017-5638**) that let attackers remotely execute code on the server. A patch for it had already been released — **two months before** the breach.

The vulnerability was never fixed on that server. Attackers found and exploited it, exfiltrating personal data — names, SSNs, birth dates, addresses — on **~147 million people**. It remains one of the costliest breaches in history (over $1.4 billion in cleanup and settlement costs).

This is precisely the gap penetration testing and vulnerability scanning exist to close: a scored, prioritized finding ("Critical: unpatched Struts CVE, remote code execution") sitting in a report is only useful if someone acts on it before an attacker does.`,
        ar: `## دراسة حالة واقعية: Equifax (2017) 🔍

كانت Equifax، إحدى وكالات الائتمان الأمريكية الثلاث الكبرى، تشغّل Apache Struts بثغرة معروفة (**CVE-2017-5638**) تتيح للمهاجمين تنفيذ كود عن بُعد على الخادم. كان الترقيع لها قد صدر بالفعل — **قبل شهرين** من الاختراق.

لم تُصلَح الثغرة على ذلك الخادم أبداً. وجدها المهاجمون واستغلّوها، وسرّبوا بيانات شخصية — أسماء وأرقام ضمان اجتماعي وتواريخ ميلاد وعناوين — لنحو **147 مليون شخص**. يبقى من أفدح الاختراقات في التاريخ (أكثر من 1.4 مليار دولار تكاليف تنظيف وتسويات).

هذه بالضبط الفجوة التي وُجد اختبار الاختراق وفحص الثغرات لسدّها: اكتشاف مُقيَّم ومُرتَّب ("حرج: Struts غير مُرقَّع، تنفيذ كود عن بُعد") في تقرير لا فائدة منه إلا إذا تصرّف أحدهم بناءً عليه قبل أن يفعل المهاجم.`,
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
        {
          q: { en: "A vulnerability scores 9.5 on CVSS. What's its severity?", ar: "ثغرة بدرجة 9.5 على CVSS. ما شدتها؟" },
          choices: [
            { en: "Low", ar: "منخفضة" },
            { en: "Critical", ar: "حرجة" },
            { en: "It has no severity", ar: "بلا شدة" },
          ],
          answer: 1,
          explain: {
            en: "9.0–10.0 is Critical — the top priority band, typically patched within hours, not months.",
            ar: "9.0–10.0 حرجة — أعلى فئة أولوية، تُرقَّع عادة خلال ساعات لا أشهر.",
          },
        },
        {
          q: { en: "What was the root cause of the 2017 Equifax breach?", ar: "ما السبب الجذري لاختراق Equifax عام 2017؟" },
          choices: [
            { en: "A known, already-patched vulnerability that was never applied to the affected server", ar: "ثغرة معروفة ومُرقَّعة بالفعل لكنها لم تُطبَّق على الخادم المتأثر" },
            { en: "A brand-new zero-day with no fix available", ar: "ثغرة يوم-صفر جديدة كلياً بلا إصلاح متاح" },
            { en: "An insider leaked the data intentionally", ar: "موظف داخلي سرّب البيانات عمداً" },
          ],
          answer: 0,
          explain: {
            en: "The patch existed two months before the breach. This is why prioritized, acted-upon vulnerability reports matter as much as finding the flaw.",
            ar: "كان الترقيع موجوداً قبل الاختراق بشهرين. لهذا تُعدّ تقارير الثغرات المُرتَّبة والمُنفَّذة بنفس أهمية اكتشاف الثغرة.",
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
- You built classifiers for brute-force severity, CVSS scoring, and CSRF-token validation — the real logic behind triage tools
- Case studies from Dyn, WannaCry, TalkTalk, Target, and Equifax show exactly what these skills prevent

**Your path to paid work:** pick a side — defense (SOC Analyst) or offense (Pentester) — and go deep on TryHackMe/Hack The Box. Get a cert (Security+ to start, then PenTest+ or a SOC cert), build a GitHub of your scripts and writeups, and you're job-ready. Stay ethical, stay curious.`,
        ar: `## اكتمل المسار! 🎓

بنيت أساساً أمنياً كاملاً:

- الحواسيب والشبكات ولينكس — الأرض
- بايثون — سلاح الأتمتة
- أساسيات الأمن، هجمات الويب، دفاع SOC، والاختبار الأخلاقي
- بنيت مصنّفات لشدة الهجوم العنيف، وتسجيل CVSS، وفحص رمز CSRF — المنطق الحقيقي خلف أدوات الفرز
- دراسات الحالة من Dyn وWannaCry وTalkTalk وTarget وEquifax تُظهر بالضبط ما تمنعه هذه المهارات

**طريقك إلى العمل المدفوع:** اختر جانباً — دفاع (محلل SOC) أو هجوم (مختبِر اختراق) — وتعمّق على TryHackMe/Hack The Box. احصل على شهادة (Security+ للبداية، ثم PenTest+ أو شهادة SOC)، ابنِ GitHub بسكربتاتك وتقاريرك، وتكون جاهزاً للوظيفة. ابقَ أخلاقياً، ابقَ فضولياً.`,
      },
    },
  ],
};
