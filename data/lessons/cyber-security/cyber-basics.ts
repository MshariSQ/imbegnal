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
- **Social engineering** beyond phishing — the other human-targeted tricks
- A famous real-world case study: WannaCry
- Core defenses every organization needs
- How to *think* like a defender`,
        ar: `## ماذا ستتعلم

- **ثالوث CIA** — الأهداف الثلاثة لكل أمن
- أنواع الهجمات الشائعة، بلغة بسيطة
- **الهندسة الاجتماعية** إلى ما بعد التصيّد — الحيل الأخرى التي تستهدف البشر
- دراسة حالة واقعية شهيرة: WannaCry
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
      type: "text",
      body: {
        en: `## Social engineering — hacking the human, not the machine 🎭

Phishing is the most famous trick, but it's one member of a whole family called **social engineering**: manipulating people, not code, into breaking security. Know these by name too:

- **Pretexting** — inventing a believable fake scenario to extract information: "Hi, this is IT support, I need your password to fix your account." No technical hack at all — just a convincing lie.
- **Baiting** — leaving something tempting (a USB drive labeled "Salaries 2025" in a parking lot) that a curious victim plugs in themselves, installing malware.
- **Tailgating** — physically following an employee through a secure door without badging in, relying on politeness ("can you hold the door?").
- **Vishing / Smishing** — phishing over voice calls or SMS text instead of email — "Your bank card is blocked, call this number now."

**Why this matters:** you can buy the best firewall on Earth, but it does nothing against an employee who reads their password over the phone to someone who "sounds official." This is why security awareness training for *humans* is treated as seriously as technical controls.`,
        ar: `## الهندسة الاجتماعية — اختراق الإنسان لا الآلة 🎭

التصيّد أشهر حيلة، لكنه فرد واحد من عائلة كاملة تسمى **الهندسة الاجتماعية**: التلاعب بالبشر، لا بالكود، لكسر الأمن. اعرف هذه بالاسم أيضاً:

- **التذرّع (Pretexting)** — اختلاق سيناريو مزيّف مقنع لاستخراج معلومات: "مرحباً، أنا الدعم التقني، أحتاج كلمة مرورك لإصلاح حسابك." لا اختراق تقني إطلاقاً — مجرد كذبة مقنعة.
- **الطعم (Baiting)** — ترك شيء مغرٍ (فلاشة USB مكتوب عليها "رواتب 2025" في موقف سيارات) يوصّلها ضحية فضولي بنفسه، فتُثبَّت برمجية خبيثة.
- **التذييل (Tailgating)** — اتباع موظف فيزيائياً عبر باب آمن دون تمرير بطاقة، معتمداً على اللباقة ("هل تمسك الباب لي؟").
- **التصيّد الصوتي/عبر الرسائل (Vishing/Smishing)** — تصيّد عبر مكالمة صوتية أو رسالة SMS بدل البريد — "بطاقتك البنكية موقوفة، اتصل بهذا الرقم الآن."

**لماذا يهم هذا:** تستطيع شراء أفضل جدار ناري على وجه الأرض، لكنه لا يفعل شيئاً ضد موظف يقرأ كلمة مروره هاتفياً لشخص "يبدو رسمياً." لهذا يُعامَل التدريب التوعوي الأمني *للبشر* بجدية توازي الضوابط التقنية.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Write \`classifyCIA(scenario)\` that returns which CIA principle a scenario mainly breaks, by checking for keywords:
- if it includes \`"leak"\` or \`"steal"\` → \`"Confidentiality"\`
- if it includes \`"altered"\` or \`"changed"\` → \`"Integrity"\`
- if it includes \`"offline"\` or \`"down"\` → \`"Availability"\`
- otherwise → \`"Unknown"\``,
        ar: `اكتب \`classifyCIA(scenario)\` تعيد أي مبدأ CIA يكسره السيناريو أساساً، بفحص كلمات مفتاحية:
- إن احتوى \`"leak"\` أو \`"steal"\` ← \`"Confidentiality"\`
- إن احتوى \`"altered"\` أو \`"changed"\` ← \`"Integrity"\`
- إن احتوى \`"offline"\` أو \`"down"\` ← \`"Availability"\`
- وإلا ← \`"Unknown"\``,
      },
      starterCode: `function classifyCIA(scenario) {
  const s = scenario.toLowerCase();
  // check for the keywords, in order

}

console.log(classifyCIA("Attackers managed to steal customer records"));      // "Confidentiality"
console.log(classifyCIA("The invoice amount was altered before payment"));    // "Integrity"
console.log(classifyCIA("The website has been down for 3 hours"));           // "Availability"`,
      solution: `function classifyCIA(scenario) {
  const s = scenario.toLowerCase();
  if (s.includes("leak") || s.includes("steal")) return "Confidentiality";
  if (s.includes("altered") || s.includes("changed")) return "Integrity";
  if (s.includes("offline") || s.includes("down")) return "Availability";
  return "Unknown";
}

console.log(classifyCIA("Attackers managed to steal customer records"));      // "Confidentiality"
console.log(classifyCIA("The invoice amount was altered before payment"));    // "Integrity"
console.log(classifyCIA("The website has been down for 3 hours"));           // "Availability"`,
      hints: [
        { en: `Use .includes() on the lowercased string for each keyword pair, in order.`, ar: `استخدم .includes() على النص بأحرف صغيرة لكل زوج كلمات، بالترتيب.` },
        { en: `if (s.includes("leak") || s.includes("steal")) return "Confidentiality"; — repeat the pattern for the others.`, ar: `if (s.includes("leak") || s.includes("steal")) return "Confidentiality"; — كرّر النمط للبقية.` },
      ],
      tests: [
        { name: { en: "Detects a Confidentiality breach", ar: "يكتشف خرق سرّية" }, check: `classifyCIA("Attackers managed to steal customer records") === "Confidentiality"` },
        { name: { en: "Detects an Integrity breach", ar: "يكتشف خرق سلامة" }, check: `classifyCIA("The invoice amount was altered before payment") === "Integrity"` },
        { name: { en: "Detects an Availability breach", ar: "يكتشف خرق توفّر" }, check: `classifyCIA("The website has been down for 3 hours") === "Availability"` },
        { name: { en: "Returns Unknown when no keyword matches", ar: "يعيد Unknown عند عدم تطابق أي كلمة" }, check: `classifyCIA("Just a normal day") === "Unknown"` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: WannaCry (2017) 🔍

In May 2017, the **WannaCry** ransomware infected over 200,000 computers across 150 countries in days — including hospitals in the UK's NHS, forcing ambulances to be diverted and surgeries cancelled. It encrypted victims' files and demanded Bitcoin ransom to unlock them, a direct attack on **Availability** and **Integrity** at once.

The devastating detail: WannaCry spread through a Windows vulnerability called **EternalBlue** — and Microsoft had already released a patch fixing it **two months before** the attack. Every infected machine was running software that was already, provably fixable. This is the single most cited real-world proof of the lesson's own claim: patching is unglamorous, but it is the most effective defense that exists — and skipping it is exactly how a known, fixed hole becomes a global incident.`,
        ar: `## دراسة حالة واقعية: WannaCry (2017) 🔍

في مايو 2017، أصابت فدية **WannaCry** أكثر من 200,000 حاسوب عبر 150 دولة خلال أيام — بما فيها مستشفيات هيئة الصحة الوطنية البريطانية (NHS)، ما اضطر لتحويل سيارات الإسعاف وإلغاء عمليات جراحية. شفّرت ملفات الضحايا وطلبت فدية بالبيتكوين لفكّها، هجوم مباشر على **التوفّر** و**السلامة** معاً.

التفصيل المدمّر: انتشرت WannaCry عبر ثغرة ويندوز تسمى **EternalBlue** — وكانت مايكروسوفت قد أصدرت تصحيحاً يسدّها **قبل شهرين** من الهجوم. كل جهاز مصاب كان يشغّل برنامجاً كان بالفعل، وبشكل مثبت، قابلاً للإصلاح. هذا أكثر دليل واقعي يُستشهد به لادّعاء الدرس نفسه: التحديث غير برّاق، لكنه أكثر دفاع فعّال موجود — وتجاوزه هو بالضبط كيف تصبح ثغرة معروفة ومُصلَحة حادثاً عالمياً.`,
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
        {
          q: { en: "A USB drive labeled 'Salaries 2025' is left in a parking lot, hoping someone plugs it in. This is…", ar: "فلاشة USB مكتوب عليها 'رواتب 2025' تُترك في موقف سيارات، أملاً أن يوصّلها أحد. هذا هو…" },
          choices: [
            { en: "Baiting", ar: "الطعم (Baiting)" },
            { en: "Brute force", ar: "التخمين العنيف" },
            { en: "SQL Injection", ar: "حقن SQL" },
          ],
          answer: 0,
          explain: {
            en: "Baiting relies on curiosity to get a victim to compromise themselves — no hacking skill needed, just a tempting lure.",
            ar: "الطعم يعتمد على الفضول ليخترق الضحية نفسه — بلا حاجة لمهارة اختراق، فقط طُعم مغرٍ.",
          },
        },
        {
          q: { en: "What made WannaCry (2017) especially preventable?", ar: "ما الذي جعل WannaCry (2017) قابلاً للمنع خصوصاً؟" },
          choices: [
            { en: "Microsoft had released a patch for the exploited vulnerability two months earlier", ar: "كانت مايكروسوفت قد أصدرت تصحيحاً للثغرة المستغَلّة قبل شهرين" },
            { en: "It only affected outdated hardware that couldn't be fixed", ar: "أصاب فقط عتاداً قديماً لا يمكن إصلاحه" },
            { en: "There was no way to have prevented it", ar: "لم تكن هناك طريقة لمنعه" },
          ],
          answer: 0,
          explain: {
            en: "A known, already-patched Windows flaw (EternalBlue) still infected 200,000+ machines that simply hadn't applied the update — the real-world cost of skipping patching.",
            ar: "ثغرة ويندوز معروفة ومُصلَحة أصلاً (EternalBlue) ما زالت أصابت أكثر من 200,000 جهاز لم يطبّق التحديث ببساطة — الثمن الواقعي لتجاوز التحديث.",
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
- Social engineering also includes pretexting, baiting, tailgating, vishing/smishing
- WannaCry (2017) proved patching's value the hard way — a known, fixed flaw still caused a global incident
- Defenses: MFA, encryption, patching, least privilege, defense in depth
- You wrote a real CIA-classifier function

**Defender's mindset:** always ask "what could go wrong, and which of C-I-A does it threaten?" **Next:** Web Security — the specific attacks against websites, with hands-on detection.`,
        ar: `## الخلاصة

- **ثالوث CIA**: السرّية، السلامة، التوفّر — أهداف كل أمن
- الهجمات: التصيّد، البرمجيات الخبيثة، التخمين، الوسيط، الحقن
- الهندسة الاجتماعية تشمل أيضاً التذرّع والطعم والتذييل والتصيّد الصوتي/عبر الرسائل
- WannaCry (2017) أثبتت قيمة التحديث بالطريقة الصعبة — ثغرة معروفة ومُصلَحة سببت رغم ذلك حادثاً عالمياً
- الدفاعات: MFA، التشفير، التحديث، أقل صلاحية، الدفاع بالعمق
- كتبت دالة تصنيف CIA حقيقية

**عقلية المدافع:** اسأل دائماً "ما الذي قد يحدث، وأيّ عناصر C-I-A يهدّده؟" **التالي:** أمن الويب — الهجمات المحددة على المواقع، مع كشف عملي.`,
      },
    },
  ],
};
