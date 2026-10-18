import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "legal-ethics-reporting",
  title: {
    en: "Law, Ethics & Responsible Disclosure — Doing the Right Thing with What You Find",
    ar: "القانون والأخلاقيات والإفصاح المسؤول — التصرّف الصحيح بما تكتشفه",
  },
  estMinutes: 46,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

By the end of this lesson you will be able to:

- State what you may and may not analyze, and how **licenses** and **anti-circumvention** laws shape the work
- Explain, in plain terms, the laws most often cited around reverse engineering, and why they **differ by country**
- Choose between **coordinated disclosure**, **full disclosure** and a **bug bounty**, and run a clean disclosure timeline
- Score a vulnerability with **CVSS**, write a useful report, and respect **embargoes** and third-party data
- Recognize **safe harbor** language and know when to stop and ask for permission or legal advice

## The locksmith's code 🔑

A skilled locksmith can open almost any lock. That skill is legal and valuable: it rescues people locked out of their homes and helps make better locks. The same skill, used on someone else's door without permission, is burglary. Nothing about the technique changed; only the **authorization** and the **intent** did.

Reverse engineering is the locksmithing of software. Everything in this track, reading binaries, debugging, decoding, analyzing malware, is a normal professional skill. What keeps it on the right side of the line is a small set of rules about **what you touch, with whose permission, and what you do with what you learn**. This lesson is that rulebook.

As always: this is **general education, not legal advice**. Laws differ by country and change over time, and a contract can restrict you even where the law would allow something. When the stakes are real, ask a lawyer.`,
        ar: `## ماذا ستتعلم

في نهاية هذا الدرس ستكون قادراً على:

- تحديد ما يجوز لك تحليله وما لا يجوز، وكيف تشكّل **التراخيص** وقوانين **منع التجاوز (anti-circumvention)** هذا العمل
- شرح أكثر القوانين التي تُذكر حول الهندسة العكسية، بكلمات بسيطة، ولماذا **تختلف باختلاف البلد**
- الاختيار بين **الإفصاح المنسّق (coordinated disclosure)** و**الإفصاح الكامل (full disclosure)** و**برنامج مكافآت الثغرات (bug bounty)**، وإدارة جدول إفصاح نظيف
- تقييم ثغرة بـ **CVSS**، وكتابة تقرير مفيد، واحترام **فترات الحظر (embargoes)** وبيانات الغير
- التعرّف على صياغة **الملاذ الآمن (safe harbor)** ومعرفة متى تتوقف وتطلب إذناً أو استشارة قانونية

## ميثاق صانع الأقفال 🔑

صانع الأقفال الماهر يستطيع فتح أي قفل تقريباً. وهذه المهارة قانونية وقيّمة: تُنقذ من حُبسوا خارج بيوتهم وتساعد على صنع أقفال أفضل. والمهارة نفسها، إن استُخدمت على باب شخص آخر دون إذن، سرقة باقتحام. لم يتغير شيء في التقنية؛ تغيّر فقط **التصريح (authorization)** و**النية**.

الهندسة العكسية هي صناعة الأقفال في عالم البرمجيات. كل ما في هذا المسار — قراءة الملفات الثنائية، والتنقيح، وفك الترميز، وتحليل البرمجيات الخبيثة — مهارة مهنية عادية. والذي يُبقيها في الجانب الصحيح من الخط مجموعة صغيرة من القواعد حول **ما تلمسه، وبإذن من، وماذا تفعل بما تتعلمه**. وهذا الدرس هو ذلك الكتيّب.

وكالعادة: هذا **تثقيف عام وليس استشارة قانونية**. القوانين تختلف باختلاف البلد وتتغير مع الزمن، والعقد قد يقيّدك حتى حيث يسمح القانون بشيء. وحين تكون المخاطر حقيقية، اسأل محامياً.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## What you may analyze

Start from the safe lane you met in the first lesson, now with the reasons:

- **Your own code and systems.** Always fair game.
- **Open-source software**, within its license. Reading and modifying is the point of open source, though licenses still set conditions (for example, sharing changes under the GPL).
- **Practice material:** crackmes, CTF binaries, deliberately vulnerable apps, training labs. Made for exactly this.
- **With written permission:** an employer's internal systems that you are assigned to, a client under a signed contract, or a target inside a **bug bounty program's scope**.

Outside that lane, two kinds of limit apply, and they are different things:

**Contracts (licenses / EULAs).** When you install or use software you often agree to terms that **forbid reverse engineering**. Breaking a contract is usually a civil matter (you could be sued, or lose your right to use the product), separate from any criminal law. In some places such clauses are limited by statute; for instance the EU Software Directive makes clauses that forbid decompilation **for interoperability** unenforceable, within strict conditions. Elsewhere the clause may hold. Read the terms, and do not assume.

**Laws.** Even with no contract, the law may restrict:

- **accessing systems** you do not own (covered next),
- **circumventing technical protection measures** such as DRM or copy protection,
- what you may **copy, publish or distribute** (copyright).

The practical test before you begin: *Is this mine, open, made for practice, or permitted in writing? If not, stop and get permission.*`,
        ar: `## ما الذي يجوز لك تحليله

ابدأ من المسار الآمن الذي قابلته في الدرس الأول، والآن مع الأسباب:

- **كودك وأنظمتك أنت.** مباح دائماً.
- **البرمجيات المفتوحة المصدر**، ضمن ترخيصها. القراءة والتعديل هما جوهر المصدر المفتوح، وإن كانت التراخيص تضع شروطاً (مثل مشاركة التعديلات بموجب GPL).
- **مواد التدريب:** ‏crackmes، وملفات CTF، والتطبيقات المُضعَّفة عمداً، ومختبرات التدريب. صُنعت لهذا بالضبط.
- **بإذن مكتوب:** أنظمة داخلية لجهة عملك كُلّفت بها، أو عميل بموجب عقد موقَّع، أو هدف ضمن **نطاق (scope) برنامج مكافآت الثغرات**.

خارج هذا المسار ينطبق نوعان من القيود، وهما شيئان مختلفان:

**العقود (التراخيص / EULAs).** حين تثبّت برنامجاً أو تستخدمه فإنك كثيراً ما توافق على شروط **تمنع الهندسة العكسية**. وخرق العقد عادةً مسألة مدنية (قد تُقاضى، أو تفقد حق استخدام المنتج)، منفصلة عن أي قانون جنائي. وفي بعض الأماكن تحدّ القوانين من هذه البنود؛ فمثلاً يجعل Software Directive في الاتحاد الأوروبي البنودَ التي تمنع فك التجميع (decompilation) **لأجل التشغيل البيني (interoperability)** غير قابلة للإنفاذ، ضمن شروط صارمة. وفي أماكن أخرى قد يسري البند. اقرأ الشروط، ولا تفترض.

**القوانين.** حتى بلا عقد، قد يقيّد القانون:

- **الدخول إلى أنظمة** لا تملكها (نتناوله تالياً)،
- **تجاوز إجراءات الحماية التقنية** مثل DRM أو الحماية من النسخ،
- ما يجوز لك **نسخه أو نشره أو توزيعه** (حقوق النشر).

والاختبار العملي قبل أن تبدأ: *هل هذا ملكي، أو مفتوح، أو مصنوع للتدريب، أو مصرَّح به كتابةً؟ وإن لم يكن كذلك، توقّف واحصل على إذن.*`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The laws most often cited

You do not need to be a lawyer, but you should recognize the instruments that come up, and remember that each one is a *national* law or a *regional* rule with its own exceptions.

- **Anti-circumvention (copyright).** The United States' **DMCA** section 1201 forbids bypassing technical measures that control access to copyrighted works. It has exemptions, some permanent (such as a narrow interoperability provision) and some granted every three years by the Librarian of Congress, including recurring ones for **good-faith security research**. The EU's Information Society Directive has its own anti-circumvention rules. The details and the exemptions differ, so check the current rules in your country.
- **Interoperability.** The **EU Software Directive** (2009/24/EC) permits limited **decompilation** strictly to achieve interoperability of an independently created program, under conditions, and forbids contracts from taking that right away. US courts have also, in several cases, treated reverse engineering for interoperability as a fair use.
- **Unauthorized access.** The US **Computer Fraud and Abuse Act (CFAA)** criminalizes accessing a computer "without authorization". In **Van Buren v. United States (2021)** the Supreme Court read its "exceeds authorized access" clause narrowly: it covers entering parts of a system that are off-limits to you, not misusing information you were entitled to reach, which is why breaking a website's terms of use is generally not a crime by itself. *Accessing systems or areas you have no right to* remains illegal. Most countries have an equivalent (the UK Computer Misuse Act, and so on).
- **International baseline.** The Council of Europe's **Budapest Convention on Cybercrime** asks its many state parties to criminalize illegal access, interception, data and system interference, and the misuse of attack tools, which is why these offences look similar across borders.
- **Personal data.** If anything you decode or observe contains personal data, data-protection law applies (the EU/UK **GDPR**, and national laws elsewhere). Do not collect, keep or share it beyond what your authorized task needs.

Two honest takeaways: reverse engineering is **not illegal in itself**, and the exact lines **move** with country, contract and year. When a project could touch any of these, written authorization and, for anything serious, a lawyer are not optional extras.`,
        ar: `## أكثر القوانين التي تُذكر

لست مضطراً لأن تكون محامياً، لكن ينبغي أن تتعرّف على الأدوات القانونية التي تتكرر، وأن تتذكّر أن كلاً منها قانون *وطني* أو قاعدة *إقليمية* لها استثناءاتها.

- **منع التجاوز (حقوق النشر).** المادة 1201 من قانون **DMCA** الأمريكي تمنع تجاوز الإجراءات التقنية التي تتحكم في الوصول إلى الأعمال المحمية. وله استثناءات، بعضها دائم (مثل بند ضيّق للتشغيل البيني) وبعضها يُمنح كل ثلاث سنوات من أمين مكتبة الكونغرس، ومنها استثناءات متكررة لـ**البحث الأمني بحسن نية**. وللاتحاد الأوروبي قواعده الخاصة لمنع التجاوز في Information Society Directive. والتفاصيل والاستثناءات تختلف، فتحقّق من القواعد الحالية في بلدك.
- **التشغيل البيني.** يسمح **EU Software Directive** ‏(2009/24/EC) بـ**فك تجميع (decompilation)** محدود حصراً لتحقيق التشغيل البيني لبرنامج أُنشئ باستقلال، وبشروط، ويمنع العقود من إسقاط هذا الحق. كما عاملت المحاكم الأمريكية، في عدة قضايا، الهندسة العكسية لأجل التشغيل البيني باعتبارها استخداماً عادلاً (fair use).
- **الدخول غير المصرَّح به.** قانون **Computer Fraud and Abuse Act (CFAA)** الأمريكي يجرّم الدخول إلى حاسوب "دون تصريح". وفي قضية **Van Buren v. United States (2021)** قرأت المحكمة العليا عبارة "يتجاوز الوصول المصرَّح به" فيه قراءة ضيّقة: فهي تشمل دخول أجزاء من النظام محظورة عليك، لا إساءة استخدام معلومات كان يحق لك الوصول إليها، ولهذا فإن مخالفة شروط استخدام موقع ليست في الغالب جريمة بذاتها. أما *الدخول إلى أنظمة أو مناطق لا حق لك فيها* فيبقى غير قانوني. ولمعظم الدول ما يعادله (قانون Computer Misuse Act في المملكة المتحدة، وهكذا).
- **الأساس الدولي.** اتفاقية **بودابست بشأن الجرائم الإلكترونية** الصادرة عن مجلس أوروبا تطلب من دولها الأطراف الكثيرة تجريم الدخول غير المشروع، والاعتراض، والتدخل في البيانات والأنظمة، وإساءة استخدام أدوات الهجوم، ولهذا تتشابه هذه الجرائم عبر الحدود.
- **البيانات الشخصية.** إن احتوى أي شيء تفكّه أو ترصده بيانات شخصية، فقانون حماية البيانات ينطبق (‏**GDPR** في الاتحاد الأوروبي والمملكة المتحدة، وقوانين وطنية في أماكن أخرى). لا تجمعها ولا تحتفظ بها ولا تشاركها بأكثر مما تتطلبه مهمتك المصرَّح بها.

خلاصتان صادقتان: الهندسة العكسية **ليست غير قانونية بذاتها**، والخطوط الدقيقة **تتحرك** بحسب البلد والعقد والسنة. وحين قد يمسّ مشروع أياً من هذه، فالتصريح المكتوب — ولأي أمر جدّي، محامٍ — ليسا رفاهية إضافية.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A professional ethic

Law is the floor, not the ceiling. Something can be arguably legal and still wrong. A short working ethic for this field:

- **Authorization before action.** Only touch what you are clearly allowed to touch. If you are unsure, you do not yet have permission.
- **Minimize harm.** Use the least intrusive method that answers the question. Do not degrade a service, delete data or pivot to other systems to "prove" a point.
- **Protect other people's data.** If you stumble on personal data, stop, do not copy it, and report that it is exposed. Do not read more than you must.
- **No hack-back.** Even against an attacker's own infrastructure, retaliating is unauthorized access. Report it instead.
- **Honour confidentiality and embargoes.** If a vendor asks for time, or you are under an NDA, keep the details private until the agreed moment.
- **Be honest and proportionate.** Report what you actually found, not an exaggeration; claim the impact you can demonstrate, no more.
- **Act in good faith.** Your purpose is to understand and to improve security, not to extort, show off, or gain an unfair advantage.

These are not just nice words: bug bounty rules, coordinated-disclosure policies and professional codes (for example the ISC2 Code of Ethics) encode exactly these expectations, and breaking them can cost you a reward, a job or your standing in the community.

## When to stop and ask

Pause the work and get an answer **in writing** before you continue when:

- the target is not clearly listed in your scope, or the scope is ambiguous;
- the next step means bypassing a protection measure (DRM, a license check, encryption) on something you do not own;
- you reach personal data, credentials, or another customer's systems;
- the work would affect production, other users, or a third party's service;
- you plan to publish a tool, key or technique that lets others bypass a protection;
- the vendor answers with a legal threat, or asks you to sign terms you do not understand.

Ask the right person: the program owner or client contact for **permission**, your employer's legal team or a lawyer for **advice**. In some countries digital-rights groups (in the US, for example, the EFF) help researchers find legal help. Asking costs a day; guessing wrong can cost far more.`,
        ar: `## أخلاقيات مهنية

القانون أرضية لا سقف. فقد يكون الشيء قانونياً في ظاهره ومع ذلك خطأً. وهذه أخلاقيات عمل موجزة لهذا المجال:

- **التصريح قبل الفعل.** لا تلمس إلا ما يُسمح لك بلمسه بوضوح. وإن لم تكن متأكداً فأنت لا تملك الإذن بعد.
- **قلّل الضرر.** استخدم أقل الأساليب تطفّلاً مما يجيب عن السؤال. لا تُضعف خدمة، ولا تحذف بيانات، ولا تنتقل إلى أنظمة أخرى "لتثبت" وجهة نظر.
- **احمِ بيانات الآخرين.** إن عثرت صدفةً على بيانات شخصية فتوقف، ولا تنسخها، وأبلغ أنها مكشوفة. ولا تقرأ أكثر مما يلزم.
- **لا ردّ للهجوم (hack-back).** حتى ضد بنية المهاجم نفسه، الانتقام دخول غير مصرَّح به. أبلغ بدلاً من ذلك.
- **احترم السرية وفترات الحظر.** إن طلبت الجهة المصنِّعة وقتاً، أو كنت تحت اتفاقية عدم إفصاح (NDA)، فأبقِ التفاصيل سراً حتى اللحظة المتفق عليها.
- **كن صادقاً ومتناسباً.** أبلغ بما وجدته فعلاً لا بمبالغة؛ وادّعِ الأثر الذي تستطيع إثباته، لا أكثر.
- **تصرّف بحسن نية.** غايتك الفهم وتحسين الأمن، لا الابتزاز أو الاستعراض أو كسب ميزة غير عادلة.

وهذه ليست كلمات لطيفة فحسب: قواعد برامج مكافآت الثغرات، وسياسات الإفصاح المنسّق، والمواثيق المهنية (مثل ميثاق أخلاقيات ISC2) تقنّن هذه التوقعات بالضبط، وخرقها قد يكلّفك مكافأة أو وظيفة أو مكانتك في المجتمع.

## متى تتوقف وتسأل

أوقف العمل واحصل على إجابة **مكتوبة** قبل أن تتابع عندما:

- لا يكون الهدف مُدرَجاً بوضوح في نطاقك، أو يكون النطاق غامضاً؛
- تعني الخطوة التالية تجاوز إجراء حماية (DRM، أو فحص ترخيص، أو تشفير) على شيء لا تملكه؛
- تصل إلى بيانات شخصية، أو بيانات اعتماد (credentials)، أو أنظمة عميل آخر؛
- قد يؤثر العمل على بيئة الإنتاج، أو مستخدمين آخرين، أو خدمة طرف ثالث؛
- تنوي نشر أداة أو مفتاح أو تقنية تتيح للآخرين تجاوز حماية؛
- تردّ الجهة المصنِّعة بتهديد قانوني، أو تطلب منك توقيع شروط لا تفهمها.

اسأل الشخص المناسب: مالك البرنامج أو جهة الاتصال لدى العميل لأجل **الإذن**، والفريق القانوني لجهة عملك أو محامياً لأجل **الاستشارة**. وفي بعض الدول تساعد مجموعات الحقوق الرقمية (في الولايات المتحدة مثلاً، EFF) الباحثين على إيجاد مساعدة قانونية. السؤال يكلّف يوماً؛ والتخمين الخاطئ قد يكلّف أكثر بكثير.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Disclosure: coordinated, full, or a bounty

You found a real vulnerability, in your own research or on an authorized target. What now? The goal is to get it **fixed** while causing the least harm to users. The recognized models:

- **Coordinated vulnerability disclosure (CVD)**, once called "responsible disclosure". You tell the vendor privately, agree on a timeline, and go public only after a fix (or after a fair deadline passes). This is the default and the one the standards describe: **ISO/IEC 29147** covers how a vendor should *receive* vulnerability reports and *publish* advisories, and **ISO/IEC 30111** how it should *handle* them internally.
- **Full disclosure.** Publishing all details at once, with no private window. Sometimes used when a vendor is unreachable or has ignored repeated reports; it pressures a fix but also arms attackers immediately, so it is a last resort and ethically heavy.
- **Bug bounty / VDP.** Many organizations run a **Vulnerability Disclosure Program** or a paid **bug bounty** with a published **scope** (what you may test), rules, and often **safe-harbor** language promising not to pursue good-faith researchers who follow the policy. Stay strictly inside the scope: testing something not listed is unauthorized, bounty or not.

A healthy coordinated timeline:

\`\`\`
day 0      report sent privately, with clear steps to reproduce and an impact assessment
days 1-3   vendor acknowledges receipt (a typical target, not a rule)
...        vendor triages and confirms; you answer questions, you do NOT go public
...        a fix is developed, tested and released; a CVE id is often assigned
fix/day N  public write-up after the fix (or after the agreed deadline), crediting fairly
\`\`\`

Common deadlines are around **90 days** (used by, for example, Google Project Zero), often with a short extension if a fix is nearly ready. A deadline is a tool to prevent a report from being ignored forever, not a threat. Always leave a trail: dated messages, what you sent, what you agreed.`,
        ar: `## الإفصاح: منسّق، أو كامل، أو عبر مكافأة

وجدت ثغرة حقيقية، في بحثك الخاص أو على هدف مصرَّح به. ماذا الآن؟ الهدف أن تُصلَح مع أقل ضرر للمستخدمين. والنماذج المعترف بها:

- **الإفصاح المنسّق عن الثغرات (CVD)**، وكان يُسمى "الإفصاح المسؤول". تُبلغ الجهة المصنِّعة سراً، وتتفقان على جدول زمني، ولا تُعلن إلا بعد الإصلاح (أو بعد انقضاء مهلة عادلة). وهذا هو الافتراضي والذي تصفه المعايير: ‏**ISO/IEC 29147** يتناول كيف ينبغي للجهة المصنِّعة أن *تستقبل* بلاغات الثغرات و*تنشر* النشرات الأمنية (advisories)، و**ISO/IEC 30111** كيف ينبغي أن *تعالجها* داخلياً.
- **الإفصاح الكامل.** نشر كل التفاصيل دفعة واحدة دون نافذة سرية. يُستخدم أحياناً حين تتعذّر مراسلة الجهة المصنِّعة أو تتجاهل بلاغات متكررة؛ وهو يضغط لأجل الإصلاح لكنه يسلّح المهاجمين فوراً، فهو ملاذ أخير وثقيل أخلاقياً.
- **مكافآت الثغرات / VDP.** كثير من المؤسسات تدير **برنامج إفصاح عن الثغرات (VDP)** أو **مكافأة ثغرات (bug bounty)** مدفوعة بـ**نطاق (scope)** منشور (ما يجوز لك اختباره)، وقواعد، وغالباً صياغة **ملاذ آمن (safe harbor)** تعد بعدم ملاحقة الباحثين ذوي النية الحسنة الذين يتبعون السياسة. ابقَ بدقة داخل النطاق: اختبار شيء غير مُدرَج دخول غير مصرَّح به، بمكافأة أو بدونها.

جدول منسّق سليم:

\`\`\`
day 0      report sent privately, with clear steps to reproduce and an impact assessment
days 1-3   vendor acknowledges receipt (a typical target, not a rule)
...        vendor triages and confirms; you answer questions, you do NOT go public
...        a fix is developed, tested and released; a CVE id is often assigned
fix/day N  public write-up after the fix (or after the agreed deadline), crediting fairly
\`\`\`

والمهل الشائعة نحو **90 يوماً** (يستخدمها مثلاً Google Project Zero)، وغالباً مع تمديد قصير إن كان الإصلاح شبه جاهز. والمهلة أداة تمنع تجاهل البلاغ إلى الأبد، لا تهديداً. واترك دائماً أثراً موثَّقاً: رسائل مؤرَّخة، وما أرسلته، وما اتفقتما عليه.`,
      },
    },
    {
      type: "lab",
      id: "disclosure-timeline",
      lang: "go",
      prompt: {
        en: `## Run a disclosure timeline

Track a coordinated-disclosure case against a policy window and classify how it ended.

**Input:** one event per line.

- \`policy N\`: the disclosure window is \`N\` days from the report (appears once, before the events)
- \`YYYY-MM-DD report\`: the private report was sent (appears once)
- \`YYYY-MM-DD ack\`: the vendor acknowledged (keep the earliest if repeated)
- \`YYYY-MM-DD extend K\`: the deadline was extended by \`K\` days (may appear several times; add them up)
- \`YYYY-MM-DD fix\`: a fix was released (keep the earliest)
- \`YYYY-MM-DD publish\`: details were made public (keep the earliest)

The **deadline** is the report date plus \`policy + total extensions\` days.

**Output**

\`\`\`
reported: <report date>
acknowledged: after <n> days          OR  acknowledged: no
deadline: <deadline date>
fixed: after <n> days                 OR  fixed: no
published: <publish date>             OR  published: no
verdict: <one of the four below>
\`\`\`

"after n days" counts whole days from the report. The **verdict**:

- \`not public yet\` if nothing was published
- \`coordinated disclosure (published after the fix)\` if a fix exists and publication is on or after the fix date
- \`deadline disclosure (no fix by the deadline)\` if there was no fix on or before the deadline (a fix released later still counts as none) and publication is on or after the deadline
- \`early disclosure (before the fix and the deadline)\` otherwise

**Example**

Input:

\`\`\`
policy 90
2026-01-10 report
2026-01-12 ack
2026-02-20 extend 14
2026-03-30 fix
2026-04-02 publish
\`\`\`

Output:

\`\`\`
reported: 2026-01-10
acknowledged: after 2 days
deadline: 2026-04-24
fixed: after 79 days
published: 2026-04-02
verdict: coordinated disclosure (published after the fix)
\`\`\``,
        ar: `## أدِر جدول إفصاح

تابِع حالة إفصاح منسّق مقابل نافذة سياسة، وصنّف كيف انتهت.

**المدخل:** حدث واحد في كل سطر.

- ‏\`policy N\`: نافذة الإفصاح \`N\` يوماً من البلاغ (تظهر مرة، قبل الأحداث)
- ‏\`YYYY-MM-DD report\`: أُرسل البلاغ السري (يظهر مرة)
- ‏\`YYYY-MM-DD ack\`: أقرّت الجهة المصنِّعة بالاستلام (خذ الأبكر إن تكرر)
- ‏\`YYYY-MM-DD extend K\`: مُدّدت المهلة بمقدار \`K\` يوماً (قد يظهر عدة مرات؛ اجمعها)
- ‏\`YYYY-MM-DD fix\`: صدر إصلاح (خذ الأبكر)
- ‏\`YYYY-MM-DD publish\`: أُعلنت التفاصيل (خذ الأبكر)

**المهلة (deadline)** هي تاريخ البلاغ زائد \`policy + مجموع التمديدات\` يوماً.

**المخرج**

\`\`\`
reported: <report date>
acknowledged: after <n> days          OR  acknowledged: no
deadline: <deadline date>
fixed: after <n> days                 OR  fixed: no
published: <publish date>             OR  published: no
verdict: <one of the four below>
\`\`\`

العبارة "after n days" تحسب أياماً كاملة من البلاغ. و**الحكم (verdict)**:

- ‏\`not public yet\` إن لم يُنشر شيء
- ‏\`coordinated disclosure (published after the fix)\` إن وُجد إصلاح وكان النشر في تاريخ الإصلاح أو بعده
- ‏\`deadline disclosure (no fix by the deadline)\` إن لم يوجد إصلاح في تاريخ المهلة أو قبله (والإصلاح الصادر لاحقاً يُعدّ كأنه غير موجود) وكان النشر في تاريخ المهلة أو بعده
- ‏\`early disclosure (before the fix and the deadline)\` فيما عدا ذلك

**مثال**

المدخل:

\`\`\`
policy 90
2026-01-10 report
2026-01-12 ack
2026-02-20 extend 14
2026-03-30 fix
2026-04-02 publish
\`\`\`

المخرج:

\`\`\`
reported: 2026-01-10
acknowledged: after 2 days
deadline: 2026-04-24
fixed: after 79 days
published: 2026-04-02
verdict: coordinated disclosure (published after the fix)
\`\`\``,
      },
      starterCode: `package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

const layout = "2006-01-02"

func days(from, to time.Time) int {
	return int(to.Sub(from).Hours() / 24)
}

func main() {
	scanner := bufio.NewScanner(os.Stdin)
	policy := 0
	extra := 0
	var report, ack, fix, publish time.Time

	for scanner.Scan() {
		f := strings.Fields(scanner.Text())
		if len(f) == 0 {
			continue
		}
		if f[0] == "policy" {
			policy, _ = strconv.Atoi(f[1])
			continue
		}
		date, err := time.Parse(layout, f[0])
		if err != nil || len(f) < 2 {
			continue
		}
		// TODO 1: on "report"/"ack"/"fix"/"publish" store the date (keep the earliest for ack/fix/publish);
		//         on "extend" add f[2] to extra.
		_ = date
	}

	// TODO 2: deadline = report + (policy + extra) days with report.AddDate(0, 0, policy+extra).
	// TODO 3: print the six lines, using "no" / "after n days" (see days) as required.
	// TODO 4: choose the verdict in the order: not public -> coordinated -> deadline -> early.
	_, _ = policy, extra
	_, _, _ = ack, fix, publish
	_ = days
	fmt.Println("reported:", report.Format(layout))
}
`,
      solution: `package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

const layout = "2006-01-02"

func days(from, to time.Time) int {
	return int(to.Sub(from).Hours() / 24)
}

func main() {
	scanner := bufio.NewScanner(os.Stdin)
	policy := 0
	extra := 0
	var report, ack, fix, publish time.Time

	for scanner.Scan() {
		f := strings.Fields(scanner.Text())
		if len(f) == 0 {
			continue
		}
		if f[0] == "policy" {
			policy, _ = strconv.Atoi(f[1])
			continue
		}
		date, err := time.Parse(layout, f[0])
		if err != nil || len(f) < 2 {
			continue
		}
		switch f[1] {
		case "report":
			report = date
		case "ack":
			if ack.IsZero() {
				ack = date // keep the first acknowledgement
			}
		case "extend":
			n, _ := strconv.Atoi(f[2])
			extra += n
		case "fix":
			if fix.IsZero() {
				fix = date
			}
		case "publish":
			if publish.IsZero() {
				publish = date
			}
		}
	}

	deadline := report.AddDate(0, 0, policy+extra)
	fmt.Println("reported:", report.Format(layout))
	if ack.IsZero() {
		fmt.Println("acknowledged: no")
	} else {
		fmt.Printf("acknowledged: after %d days\\n", days(report, ack))
	}
	fmt.Println("deadline:", deadline.Format(layout))
	if fix.IsZero() {
		fmt.Println("fixed: no")
	} else {
		fmt.Printf("fixed: after %d days\\n", days(report, fix))
	}

	if publish.IsZero() {
		fmt.Println("published: no")
	} else {
		fmt.Println("published:", publish.Format(layout))
	}

	fixedByDeadline := !fix.IsZero() && !fix.After(deadline)
	verdict := "early disclosure (before the fix and the deadline)"
	switch {
	case publish.IsZero():
		verdict = "not public yet"
	case !fix.IsZero() && !publish.Before(fix):
		verdict = "coordinated disclosure (published after the fix)"
	case !fixedByDeadline && !publish.Before(deadline):
		verdict = "deadline disclosure (no fix by the deadline)"
	}
	fmt.Println("verdict:", verdict)
}
`,
      hints: [
        { en: "`time.Parse(\"2006-01-02\", s)` reads the dates; `report.AddDate(0, 0, policy+extra)` gives the deadline. Guard `ack`, `fix` and `publish` with `IsZero()` so you keep the earliest one.", ar: "الدالة `time.Parse(\"2006-01-02\", s)` تقرأ التواريخ؛ و`report.AddDate(0, 0, policy+extra)` تعطي المهلة. واحمِ `ack` و`fix` و`publish` بـ `IsZero()` لتبقي الأبكر." },
        { en: "`!publish.Before(fix)` means \"published on or after the fix\". Build the verdict as a `switch` with the cases in order: not public, then coordinated, then deadline, then early.", ar: "التعبير `!publish.Before(fix)` يعني \"نُشر في تاريخ الإصلاح أو بعده\". وابنِ الحكم بـ `switch` بالحالات مرتبة: غير منشور، ثم منسّق، ثم مهلة، ثم مبكر." },
        { en: "\"No fix by the deadline\" also covers a fix that arrived *after* the deadline: compute `fixedByDeadline := !fix.IsZero() && !fix.After(deadline)` and use its negation. Whatever is left after the first three cases is \"early disclosure\".", ar: "عبارة \"لا إصلاح حتى المهلة\" تشمل أيضاً إصلاحاً وصل *بعد* المهلة: احسب `fixedByDeadline := !fix.IsZero() && !fix.After(deadline)` واستخدم نفيه. وما يتبقى بعد الحالات الثلاث الأولى هو \"early disclosure\"." },
      ],
      tests: [
        { name: { en: "The worked example: coordinated, with an extension", ar: "المثال المحلول: منسّق، مع تمديد" }, stdin: `policy 90
2026-01-10 report
2026-01-12 ack
2026-02-20 extend 14
2026-03-30 fix
2026-04-02 publish
`, expected: `reported: 2026-01-10
acknowledged: after 2 days
deadline: 2026-04-24
fixed: after 79 days
published: 2026-04-02
verdict: coordinated disclosure (published after the fix)
` },
        { name: { en: "No acknowledgement, no fix, published at the deadline", ar: "لا إقرار ولا إصلاح، والنشر عند المهلة" }, stdin: `policy 90
2026-03-02 report
2026-05-31 publish
`, expected: `reported: 2026-03-02
acknowledged: no
deadline: 2026-05-31
fixed: no
published: 2026-05-31
verdict: deadline disclosure (no fix by the deadline)
` },
        { name: { en: "Published before the fix and before the deadline", ar: "نُشر قبل الإصلاح وقبل المهلة" }, stdin: `policy 45
2026-03-02 report
2026-03-09 ack
2026-03-20 publish
2026-04-01 fix
`, expected: `reported: 2026-03-02
acknowledged: after 7 days
deadline: 2026-04-16
fixed: after 30 days
published: 2026-03-20
verdict: early disclosure (before the fix and the deadline)
` },
        { name: { en: "Two extensions, fixed late, not yet public", ar: "تمديدان، وإصلاح متأخر، ولم يُنشر بعد" }, stdin: `policy 90
2026-06-01 report
2026-06-03 ack
2026-07-15 extend 30
2026-08-20 extend 14
2026-09-10 fix
`, expected: `reported: 2026-06-01
acknowledged: after 2 days
deadline: 2026-10-13
fixed: after 101 days
published: no
verdict: not public yet
` },
        { name: { en: "The fix came only after the deadline, publication in between: deadline disclosure", ar: "جاء الإصلاح بعد المهلة فقط، والنشر بينهما: إفصاح عند المهلة" }, stdin: `policy 90
2026-01-01 report
2026-01-06 ack
2026-05-01 fix
2026-04-15 publish
`, expected: `reported: 2026-01-01
acknowledged: after 5 days
deadline: 2026-04-01
fixed: after 120 days
published: 2026-04-15
verdict: deadline disclosure (no fix by the deadline)
` },
        { name: { en: "A leap-year deadline, only the first ack kept", ar: "مهلة في سنة كبيسة، وإبقاء أول إقرار فقط" }, stdin: `policy 30
2028-02-01 report
2028-02-05 ack
2028-02-20 ack
2028-03-02 publish
`, expected: `reported: 2028-02-01
acknowledged: after 4 days
deadline: 2028-03-02
fixed: no
published: 2028-03-02
verdict: deadline disclosure (no fix by the deadline)
` },
      ],
      sampleInput: `policy 90
2026-01-10 report
2026-01-12 ack
2026-02-20 extend 14
2026-03-30 fix
2026-04-02 publish
`,
    },
    {
      type: "text",
      body: {
        en: `## The report, the CVE, and security.txt

A vulnerability report that gets fixed quickly has a predictable shape:

\`\`\`
Title           short and specific
Summary         what the bug is and why it matters, in two or three sentences
Affected        product, exact versions, configuration
Steps           minimal, reliable steps to reproduce
Impact          what an attacker gains; a CVSS vector and score
Proof           the least proof needed (a screenshot or short log), no real victim data
Suggested fix   optional, if you have one
Reporter        how to reach you, your disclosure expectations, any embargo
\`\`\`

- Give **reproduction steps**, not just a claim. The faster a vendor can confirm, the faster the fix.
- Attach the **least** proof necessary. A proof of concept that only demonstrates the flaw is right; one that exfiltrates real data or runs on other users is not.
- Vulnerabilities in software that others install usually get a **CVE** identifier (the industry catalogue of publicly known vulnerabilities, written \`CVE-<year>-<number>\`). A CVE Numbering Authority (CNA), often the vendor itself, reserves the id while the issue is coordinated, and the record is published with the advisory. CVEs let everyone refer to the same bug.
- Keep the whole exchange **professional and private** until the agreed disclosure date.

**Severity with CVSS.** The *Impact* line usually carries a **CVSS** vector and score. CVSS (the Common Vulnerability Scoring System) is published by **FIRST**. Version **3.1** (2019) is still the one most advisories and databases quote, and version **4.0** (2023) is being adopted alongside it, so always say which version you used. The **base score**, from 0.0 to 10.0, describes the vulnerability's intrinsic severity; other metric groups adjust it for how mature exploits are and for a particular environment. A score summarizes the report; it never replaces the explanation.

**How to reach a vendor.** Many publish a **\`security.txt\`** file at \`/.well-known/security.txt\` (standardized in **RFC 9116**) that lists a \`Contact\`, an \`Expires\` date, encryption keys and a policy link. If there is none, look for a security page, a VDP, or a general contact, and keep trying through more than one channel before concluding that the vendor is unreachable.

Before the labs, one habit for the *Proof* line: redact before you attach. The demo below masks personal data in a log excerpt while keeping what proves the bug. Then the last two labs build two tools of the trade: a CVSS v3.1 calculator and a \`security.txt\` validator.`,
        ar: `## التقرير، وCVE، وsecurity.txt

تقرير الثغرة الذي يُصلَح بسرعة له شكل متوقَّع:

\`\`\`
Title           short and specific
Summary         what the bug is and why it matters, in two or three sentences
Affected        product, exact versions, configuration
Steps           minimal, reliable steps to reproduce
Impact          what an attacker gains; a CVSS vector and score
Proof           the least proof needed (a screenshot or short log), no real victim data
Suggested fix   optional, if you have one
Reporter        how to reach you, your disclosure expectations, any embargo
\`\`\`

- أعطِ **خطوات إعادة الإنتاج**، لا مجرد ادّعاء. فكلما أسرعت الجهة المصنِّعة في التأكيد، أسرع الإصلاح.
- أرفق **أقل** قدر ضروري من الإثبات. إثبات المفهوم (proof of concept) الذي يُظهر العيب فقط صحيح؛ أما الذي يسرّب بيانات حقيقية أو يعمل على مستخدمين آخرين فلا.
- الثغرات في البرمجيات التي يثبّتها الآخرون تأخذ عادةً معرّف **CVE** (الفهرس الصناعي للثغرات المعروفة علناً، ويُكتب \`CVE-<year>-<number>\`). وتحجز جهة ترقيم CVE ‏(CNA)، وكثيراً ما تكون الجهة المصنِّعة نفسها، المعرّفَ أثناء تنسيق الثغرة، ويُنشر السجل مع النشرة الأمنية. ومعرّفات CVE تتيح للجميع الإشارة إلى الثغرة نفسها.
- أبقِ التبادل كله **مهنياً وسرياً** حتى تاريخ الإفصاح المتفق عليه.

**الخطورة بـ CVSS.** سطر *Impact* يحمل عادةً متجه **CVSS** ودرجته. وCVSS ‏(نظام تسجيل الثغرات الشائع) تنشره **FIRST**. والإصدار **3.1** ‏(2019) ما زال الأكثر ذكراً في النشرات الأمنية وقواعد البيانات، والإصدار **4.0** ‏(2023) يُعتمد إلى جانبه، فاذكر دائماً الإصدار الذي استخدمته. و**درجة الأساس (base score)**، من 0.0 إلى 10.0، تصف خطورة الثغرة الجوهرية؛ ومجموعات مقاييس أخرى تعدّلها بحسب نضج الاستغلالات وبيئة بعينها. والدرجة تلخّص التقرير؛ ولا تحلّ محل الشرح أبداً.

**كيف تصل إلى الجهة المصنِّعة.** كثير منها ينشر ملف **\`security.txt\`** عند \`/.well-known/security.txt\` (مُوحَّد في **RFC 9116**) يسرد \`Contact\` وتاريخ \`Expires\` ومفاتيح تشفير ورابط سياسة. وإن لم يوجد، فابحث عن صفحة أمان أو برنامج VDP أو جهة اتصال عامة، وجرّب عبر أكثر من قناة قبل أن تستنتج أن الجهة غير قابلة للوصول.

وقبل التمارين، عادة واحدة لسطر *Proof*: نقِّح قبل أن ترفق. فالعرض التالي يحجب البيانات الشخصية في مقتطف سجل مع إبقاء ما يُثبت الثغرة. ثم يبني التمرينان الأخيران أداتين من أدوات هذا المجال: حاسبة CVSS v3.1، ومدقّقاً لملف \`security.txt\`.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `import re

# A made-up excerpt from an authorized test of your own staging app (example.com, RFC 5737 IPs).
# It proves an access-control bug: the user who owns order 1043 can also read order 1044.
log = """09:14:02 GET /api/orders/1043 user=lina.k@example.com ip=203.0.113.24 -> 200
09:14:02 Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.ZGVtbw.c2lnbmF0dXJl
09:14:05 GET /api/orders/1044 user=lina.k@example.com ip=203.0.113.24 -> 200
09:14:05 body={"order": 1044, "owner": "omar.h@example.com", "card": "4111 1111 1111 1111"}"""

people = {}  # the same address always gets the same pseudonym, so the proof survives


def pseudonym(match):
    return people.setdefault(match.group(0), f"<user-{len(people) + 1}>")


RULES = [
    ("email", re.compile(r"[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+"), pseudonym),
    ("token", re.compile(r"(Bearer\\s+)[\\w.-]+"), r"\\1<token>"),
    ("card", re.compile(r"\\b(?:\\d[ -]?){12,18}\\d\\b"), "<card>"),
    ("ipv4", re.compile(r"\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b"), "<ip>"),
]

redacted = log
for name, pattern, replacement in RULES:
    redacted, count = pattern.subn(replacement, redacted)
    print(f"{name:5} {count} replaced")

print()
print(redacted)`,
      explanation: {
        en: "Run it: emails become consistent pseudonyms (<user-1> stays <user-1>), so the redacted log still proves the bug, one user reading another user's order, while no address, session token, card number or IP leaves your machine. Keep what demonstrates the flaw (the endpoint, the ids, the status codes) and remove what identifies people or grants access. Regexes are a safety net, not a guarantee: read the result yourself before you attach it, and invalidate any real token that appeared in a log. 4111 1111 1111 1111 is a well-known test card number, never a real one.",
        ar: "شغّله: تتحول عناوين البريد إلى أسماء مستعارة ثابتة (يبقى <user-1> هو <user-1>)، فيظل السجل المنقَّح يُثبت الثغرة، أي مستخدماً يقرأ طلب مستخدم آخر، دون أن يغادر جهازَك أي عنوان أو رمز جلسة أو رقم بطاقة أو عنوان IP. أبقِ ما يُظهر العيب (نقطة النهاية، والمعرّفات، ورموز الحالة) وأزل ما يعرّف الأشخاص أو يمنح الوصول. والتعابير النمطية شبكة أمان لا ضمان: اقرأ الناتج بنفسك قبل إرفاقه، وأبطِل أي رمز حقيقي ظهر في سجل. والرقم 4111 1111 1111 1111 رقم بطاقة اختبار معروف، وليس رقماً حقيقياً أبداً.",
      },
    },
    {
      type: "lab",
      id: "cvss-score",
      lang: "python",
      prompt: {
        en: `## Score a vulnerability with CVSS

The *Impact* line of your report needs a severity. Compute the **CVSS v3.1 base score** from a vector string, exactly as FIRST's specification defines it, so your number matches the official calculator.

A vector is \`CVSS:3.1\` followed by eight metrics, each \`CODE:VALUE\`, separated by \`/\`, in any order:

\`\`\`
AV Attack Vector        N 0.85  A 0.62  L 0.55  P 0.20
AC Attack Complexity    L 0.77  H 0.44
PR Privileges Required  N 0.85  L 0.62  H 0.27   (if Scope is Changed: L 0.68, H 0.50)
UI User Interaction     N 0.85  R 0.62
S  Scope                U       C
C  Confidentiality      H 0.56  L 0.22  N 0.00
I  Integrity            H 0.56  L 0.22  N 0.00
A  Availability         H 0.56  L 0.22  N 0.00
\`\`\`

The formulas (ISS is the impact sub-score):

\`\`\`
ISS   = 1 - (1-C) * (1-I) * (1-A)
Impact = 6.42 * ISS                                        if Scope Unchanged
       = 7.52 * (ISS-0.029) - 3.25 * (ISS-0.02)**15        if Scope Changed
Exploitability = 8.22 * AV * AC * PR * UI
BaseScore = 0                                              if Impact <= 0
          = Roundup(min(Impact + Exploitability, 10))      if Scope Unchanged
          = Roundup(min(1.08 * (Impact + Exploitability), 10))   if Scope Changed
\`\`\`

**Roundup(x)** is the smallest one-decimal number that is not less than x (so 4.02 rounds up to 4.1, and 4.00 stays 4.0). Severity: 0.0 None, 0.1-3.9 Low, 4.0-6.9 Medium, 7.0-8.9 High, 9.0-10.0 Critical.

For each input line print \`<vector> -> <score to one decimal> <severity>\`, or \`<vector> -> invalid vector\` when the prefix is wrong, a metric is missing, repeated or unknown, or a value is not allowed.

**Example**

Input:

\`\`\`
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
\`\`\`

Output:

\`\`\`
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H -> 9.8 Critical
\`\`\``,
        ar: `## قيّم ثغرة بـ CVSS

سطر *Impact* في تقريرك يحتاج إلى درجة خطورة. احسب **درجة الأساس (base score) لـ CVSS v3.1** من نص المتجه (vector)، تماماً كما تعرّفها مواصفة FIRST، لتطابق درجتُك الحاسبةَ الرسمية.

المتجه هو \`CVSS:3.1\` يتبعه ثمانية مقاييس، كل منها \`CODE:VALUE\`، تفصل بينها \`/\`، بأي ترتيب:

\`\`\`
AV Attack Vector        N 0.85  A 0.62  L 0.55  P 0.20
AC Attack Complexity    L 0.77  H 0.44
PR Privileges Required  N 0.85  L 0.62  H 0.27   (if Scope is Changed: L 0.68, H 0.50)
UI User Interaction     N 0.85  R 0.62
S  Scope                U       C
C  Confidentiality      H 0.56  L 0.22  N 0.00
I  Integrity            H 0.56  L 0.22  N 0.00
A  Availability         H 0.56  L 0.22  N 0.00
\`\`\`

الصيغ (‏ISS هي درجة الأثر الفرعية):

\`\`\`
ISS   = 1 - (1-C) * (1-I) * (1-A)
Impact = 6.42 * ISS                                        if Scope Unchanged
       = 7.52 * (ISS-0.029) - 3.25 * (ISS-0.02)**15        if Scope Changed
Exploitability = 8.22 * AV * AC * PR * UI
BaseScore = 0                                              if Impact <= 0
          = Roundup(min(Impact + Exploitability, 10))      if Scope Unchanged
          = Roundup(min(1.08 * (Impact + Exploitability), 10))   if Scope Changed
\`\`\`

الدالة **Roundup(x)** تعطي أصغر عدد بخانة عشرية واحدة ليس أقل من x (فيصبح 4.02 هو 4.1، ويبقى 4.00 هو 4.0). والخطورة: ‏0.0 None، و0.1-3.9 Low، و4.0-6.9 Medium، و7.0-8.9 High، و9.0-10.0 Critical.

لكل سطر مدخل اطبع \`<vector> -> <score to one decimal> <severity>\`، أو \`<vector> -> invalid vector\` عندما تكون البادئة خاطئة، أو مقياس مفقوداً أو مكرراً أو غير معروف، أو قيمة غير مسموحة.

**مثال**

المدخل:

\`\`\`
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
\`\`\`

المخرج:

\`\`\`
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H -> 9.8 Critical
\`\`\``,
      },
      starterCode: `import math
import sys

WEIGHTS = {
    "AV": {"N": 0.85, "A": 0.62, "L": 0.55, "P": 0.2},
    "AC": {"L": 0.77, "H": 0.44},
    "PR": {"N": 0.85, "L": 0.62, "H": 0.27},   # L/H differ when Scope is Changed
    "UI": {"N": 0.85, "R": 0.62},
    "S": {"U": "U", "C": "C"},
    "C": {"H": 0.56, "L": 0.22, "N": 0.0},
    "I": {"H": 0.56, "L": 0.22, "N": 0.0},
    "A": {"H": 0.56, "L": 0.22, "N": 0.0},
}


def roundup(x):
    """Smallest one-decimal number >= x. Work in integer hundred-thousandths to avoid float noise."""
    i = int(round(x * 100000))
    if i % 10000 == 0:
        return i / 100000.0
    return (math.floor(i / 10000) + 1) / 10.0


def severity(s):
    # TODO 1: return "None"/"Low"/"Medium"/"High"/"Critical" from the score.
    return "None"


def score(vector):
    # TODO 2: split on "/", check the "CVSS:3.1" prefix, parse each CODE:VALUE into a dict m.
    #         Reject an unknown code, a repeat, a bad value, or a missing metric (need all 8).
    # TODO 3: pick the PR weight (Scope Changed uses L 0.68, H 0.50), compute ISS, Impact,
    #         Exploitability and the base score with the formulas above.
    return None


for line in sys.stdin:
    v = line.strip()
    if not v:
        continue
    s = score(v)
    print(f"{v} -> invalid vector" if s is None else f"{v} -> {s:.1f} {severity(s)}")
`,
      solution: `import math
import sys

WEIGHTS = {
    "AV": {"N": 0.85, "A": 0.62, "L": 0.55, "P": 0.2},
    "AC": {"L": 0.77, "H": 0.44},
    "PR": {"N": 0.85, "L": 0.62, "H": 0.27},   # L/H differ when Scope is Changed
    "UI": {"N": 0.85, "R": 0.62},
    "S": {"U": "U", "C": "C"},
    "C": {"H": 0.56, "L": 0.22, "N": 0.0},
    "I": {"H": 0.56, "L": 0.22, "N": 0.0},
    "A": {"H": 0.56, "L": 0.22, "N": 0.0},
}


def roundup(x):
    """Smallest one-decimal number >= x. Work in integer hundred-thousandths to avoid float noise."""
    i = int(round(x * 100000))
    if i % 10000 == 0:
        return i / 100000.0
    return (math.floor(i / 10000) + 1) / 10.0


def severity(s):
    if s == 0:
        return "None"
    if s < 4.0:
        return "Low"
    if s < 7.0:
        return "Medium"
    if s < 9.0:
        return "High"
    return "Critical"


def score(vector):
    parts = vector.split("/")
    if parts[0] != "CVSS:3.1":
        return None
    m = {}
    for p in parts[1:]:
        code, _, val = p.partition(":")
        if code not in WEIGHTS or code in m or val not in WEIGHTS[code]:
            return None
        m[code] = val
    if len(m) != len(WEIGHTS):
        return None

    changed = m["S"] == "C"
    pr = {"N": 0.85, "L": 0.68, "H": 0.5}[m["PR"]] if changed else WEIGHTS["PR"][m["PR"]]
    iss = 1 - (1 - WEIGHTS["C"][m["C"]]) * (1 - WEIGHTS["I"][m["I"]]) * (1 - WEIGHTS["A"][m["A"]])
    impact = 7.52 * (iss - 0.029) - 3.25 * (iss - 0.02) ** 15 if changed else 6.42 * iss
    exploitability = 8.22 * WEIGHTS["AV"][m["AV"]] * WEIGHTS["AC"][m["AC"]] * pr * WEIGHTS["UI"][m["UI"]]
    if impact <= 0:
        return 0.0
    raw = 1.08 * (impact + exploitability) if changed else impact + exploitability
    return roundup(min(raw, 10))


for line in sys.stdin:
    v = line.strip()
    if not v:
        continue
    s = score(v)
    print(f"{v} -> invalid vector" if s is None else f"{v} -> {s:.1f} {severity(s)}")
`,
      hints: [
        { en: "Parse into a dict first and validate as you go: reject an unknown code, a duplicate (`code in m`) and a value that is not a key of `WEIGHTS[code]`, then require all eight metrics.", ar: "حلّل إلى قاموس أولاً وتحقّق أثناء ذلك: ارفض الرمز غير المعروف، والمكرر (‏`code in m`)، والقيمة التي ليست مفتاحاً في `WEIGHTS[code]`، ثم اشترط المقاييس الثمانية كلها." },
        { en: "`PR` is the only weight that depends on Scope: when `S` is `C`, use L=0.68 and H=0.50 instead of the table values.", ar: "‏`PR` هو الوزن الوحيد الذي يعتمد على Scope: عندما يكون `S` هو `C` استخدم L=0.68 وH=0.50 بدل قيم الجدول." },
        { en: "Follow the formulas exactly and only round at the very end with the given `roundup`. A score of exactly 0 is \"None\"; test your severity thresholds at 3.9/4.0 and 8.9/9.0.", ar: "اتبع الصيغ تماماً ولا تقرّب إلا في النهاية بدالة `roundup` المعطاة. والدرجة 0 بالضبط هي \"None\"؛ واختبر حدود الخطورة عند 3.9/4.0 و8.9/9.0." },
      ],
      tests: [
        { name: { en: "Textbook critical: remote, no interaction, full impact", ar: "حرج نموذجي: عن بُعد، بلا تفاعل، أثر كامل" }, stdin: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
`, expected: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H -> 9.8 Critical
` },
        { name: { en: "Scope change pushes the score to the maximum", ar: "تغيّر الـScope يرفع الدرجة إلى الحد الأقصى" }, stdin: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H
`, expected: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H -> 10.0 Critical
` },
        { name: { en: "A reflected-XSS-style vector, and a local privilege escalation", ar: "متجه بنمط XSS المنعكس، وتصعيد صلاحيات محلي" }, stdin: `CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N
CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H
`, expected: `CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N -> 6.1 Medium
CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H -> 7.8 High
` },
        { name: { en: "No impact scores zero; order of metrics does not matter", ar: "لا أثر يعني درجة صفر؛ وترتيب المقاييس لا يهم" }, stdin: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N
CVSS:3.1/C:H/I:H/A:H/AV:N/AC:L/PR:N/UI:N/S:U
`, expected: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N -> 0.0 None
CVSS:3.1/C:H/I:H/A:H/AV:N/AC:L/PR:N/UI:N/S:U -> 9.8 Critical
` },
        { name: { en: "Physical access, availability only; and a high-complexity info leak", ar: "وصول فيزيائي، وتوافر فقط؛ وتسريب معلومات عالي التعقيد" }, stdin: `CVSS:3.1/AV:P/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L
CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N
`, expected: `CVSS:3.1/AV:P/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L -> 2.4 Low
CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N -> 5.9 Medium
` },
        { name: { en: "Malformed vectors are rejected", ar: "المتجهات المشوّهة تُرفض" }, stdin: `CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H
CVSS:3.1/AV:X/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
CVSS:3.1/AV:N/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
`, expected: `CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H -> invalid vector
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H -> invalid vector
CVSS:3.1/AV:X/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H -> invalid vector
CVSS:3.1/AV:N/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H -> invalid vector
` },
      ],
      sampleInput: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
`,
    },
    {
      type: "lab",
      id: "securitytxt-lint",
      lang: "javascript",
      prompt: {
        en: `## Lint a security.txt file

Check a \`security.txt\` file (RFC 9116) so a researcher knows how to reach the vendor and whether the file is still valid.

**Input:** the first line is \`today <RFC3339 timestamp>\` (the moment of the check). The rest is the file: \`Field: value\` lines (field names are case-insensitive), with blank lines and \`#\` comment lines ignored; a line without a colon is ignored.

**Checks**

- Collect valid **Contact** values (in file order). A Contact is valid when it starts with \`mailto:\`, \`https://\` or \`tel:\` (case-insensitive scheme). That is this lab's simplification: RFC 9116 accepts any URI but requires \`https://\` for web addresses, and those three schemes are the ones it shows. Record every invalid Contact as an error, and if **no** valid Contact exists, add the error \`no valid Contact\`.
- **Expires** is required and must appear **once**. Missing: error. More than once: error with the count. Present once but not a valid RFC3339 timestamp (\`YYYY-MM-DDThh:mm:ss\` then \`Z\` or a numeric offset): error. Valid but on or before \`today\`: error (\`the file has expired\`). Valid but more than 365 days after \`today\`: a **warning** (not an error).
- **Preferred-Languages** may appear at most once; more than once is an error.

**Output.** First, for every recognized field, a normalized line (in this order, keeping file order within a field):

\`\`\`
contact: <value>
encryption: <value>
policy: <value>
languages: <comma+space-joined, trimmed list>
\`\`\`

Then every problem in this order: invalid Contacts, the no-valid-Contact error, the Expires problems, the Preferred-Languages problem. Each error line starts with \`error: \` and each warning with \`warning: \`. Finish with \`status: valid\` if there were no errors (warnings are allowed), otherwise \`status: invalid\`.

**Example**

Input:

\`\`\`
today 2026-10-17T00:00:00Z
Contact: mailto:security@example.com
Expires: 2026-01-01T00:00:00Z
\`\`\`

Output:

\`\`\`
contact: mailto:security@example.com
error: the file has expired
status: invalid
\`\`\``,
        ar: `## دقّق ملف security.txt

افحص ملف \`security.txt\` (‏RFC 9116) ليعرف الباحث كيف يصل إلى الجهة المصنِّعة وهل الملف ما زال صالحاً.

**المدخل:** السطر الأول \`today <RFC3339 timestamp>\` (لحظة الفحص). والباقي هو الملف: أسطر \`Field: value\` (أسماء الحقول غير حساسة لحالة الأحرف)، مع تجاهل الأسطر الفارغة وأسطر التعليق التي تبدأ بـ \`#\`؛ والسطر بلا نقطتين يُتجاهل.

**الفحوص**

- اجمع قيم **Contact** الصالحة (بترتيب الملف). والقيمة صالحة إذا بدأت بـ \`mailto:\` أو \`https://\` أو \`tel:\` (نظام العنوان غير حساس لحالة الأحرف). وهذا تبسيط خاص بهذا التمرين: فـ RFC 9116 يقبل أي URI لكنه يشترط \`https://\` لعناوين الويب، وهذه الأنظمة الثلاثة هي التي يعرضها. سجّل كل Contact غير صالح كخطأ، وإن لم توجد أي قيمة Contact صالحة فأضف الخطأ \`no valid Contact\`.
- الحقل **Expires** مطلوب ويجب أن يظهر **مرة واحدة**. غيابه: خطأ. أكثر من مرة: خطأ مع العدد. وجوده مرة لكن ليس طابعاً زمنياً صالحاً بصيغة RFC3339 ‏(\`YYYY-MM-DDThh:mm:ss\` ثم \`Z\` أو إزاحة رقمية): خطأ. وصالح لكن في تاريخ \`today\` أو قبله: خطأ (‏\`the file has expired\`). وصالح لكن بعد \`today\` بأكثر من 365 يوماً: **تحذير** (لا خطأ).
- الحقل **Preferred-Languages** يظهر مرة واحدة على الأكثر؛ وأكثر من مرة خطأ.

**المخرج.** أولاً، لكل حقل معروف، سطر موحَّد (بهذا الترتيب، مع حفظ ترتيب الملف داخل الحقل الواحد):

\`\`\`
contact: <value>
encryption: <value>
policy: <value>
languages: <comma+space-joined, trimmed list>
\`\`\`

ثم كل مشكلة بهذا الترتيب: قيم Contact غير الصالحة، ثم خطأ عدم وجود Contact صالح، ثم مشكلات Expires، ثم مشكلة Preferred-Languages. كل سطر خطأ يبدأ بـ \`error: \` وكل تحذير بـ \`warning: \`. واختم بـ \`status: valid\` إن لم تكن هناك أخطاء (التحذيرات مسموحة)، وإلا \`status: invalid\`.

**مثال**

المدخل:

\`\`\`
today 2026-10-17T00:00:00Z
Contact: mailto:security@example.com
Expires: 2026-01-01T00:00:00Z
\`\`\`

المخرج:

\`\`\`
contact: mailto:security@example.com
error: the file has expired
status: invalid
\`\`\``,
      },
      starterCode: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const today = new Date(lines[0].replace(/^today\\s+/, "").trim());

const fields = {}; // lower-case field name -> values, in file order
for (const raw of lines.slice(1)) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const colon = line.indexOf(":");
  if (colon < 0) continue;
  const name = line.slice(0, colon).trim().toLowerCase();
  const value = line.slice(colon + 1).trim();
  (fields[name] ??= []).push(value);
}
const all = (name) => fields[name] ?? [];

const out = [];
const problems = [];
let errors = 0;

// TODO 1: Contact: print each valid one as "contact: ...", record invalid ones, and the
//         "no valid Contact" error when none is valid. Valid = starts with mailto:, tel:, or https: plus two slashes.
// TODO 2: also print "encryption: ...", "policy: ...", "languages: ..." for those fields.
// TODO 3: Expires: required, exactly once, RFC3339, after today; > 365 days away is a warning.
// TODO 4: Preferred-Languages must not appear more than once.

for (const line of [...out, ...problems]) console.log(line);
console.log(errors === 0 ? "status: valid" : "status: invalid");
`,
      solution: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const today = new Date(lines[0].replace(/^today\\s+/, "").trim());

const fields = {}; // lower-case field name -> values, in file order
for (const raw of lines.slice(1)) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const colon = line.indexOf(":");
  if (colon < 0) continue;
  const name = line.slice(0, colon).trim().toLowerCase();
  const value = line.slice(colon + 1).trim();
  (fields[name] ??= []).push(value);
}
const all = (name) => fields[name] ?? [];

const out = [];
const problems = [];
let errors = 0;
const fail = (msg) => { problems.push("error: " + msg); errors++; };

const contacts = all("contact");
const validContact = (v) => /^(mailto:|https:\\/\\/|tel:)/i.test(v);
for (const c of contacts) if (validContact(c)) out.push("contact: " + c);
for (const e of all("encryption")) out.push("encryption: " + e);
for (const p of all("policy")) out.push("policy: " + p);
for (const l of all("preferred-languages")) {
  out.push("languages: " + l.split(",").map((s) => s.trim()).join(", "));
}

for (const c of contacts) if (!validContact(c)) fail("invalid Contact " + c);
if (!contacts.some(validContact)) fail("no valid Contact");

const expires = all("expires");
const rfc3339 = /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(Z|[+-]\\d{2}:\\d{2})$/;
if (expires.length === 0) {
  fail("Expires is missing");
} else if (expires.length > 1) {
  fail("Expires appears " + expires.length + " times");
} else {
  const when = new Date(expires[0]);
  if (!rfc3339.test(expires[0]) || Number.isNaN(when.getTime())) {
    fail("Expires is not a valid date");
  } else if (when <= today) {
    fail("the file has expired");
  } else if (when - today > 365 * 24 * 3600 * 1000) {
    problems.push("warning: Expires is more than a year away");
  }
}

const langs = all("preferred-languages");
if (langs.length > 1) fail("Preferred-Languages appears " + langs.length + " times");

for (const line of [...out, ...problems]) console.log(line);
console.log(errors === 0 ? "status: valid" : "status: invalid");
`,
      hints: [
        { en: "Split \"Field: value\" at the first colon only (`line.indexOf(\":\")`), because values such as `https://...` and timestamps contain more colons. Lower-case the field name.", ar: "افصل \"Field: value\" عند أول نقطتين فقط (‏`line.indexOf(\":\")`)، لأن قيماً مثل `https://...` والطوابع الزمنية تحتوي نقطتين أخرى. وحوّل اسم الحقل إلى أحرف صغيرة." },
        { en: "Print all the normalized field lines first (contact, encryption, policy, languages), then the problems. Keep a running error count and only treat warnings as non-fatal.", ar: "اطبع كل أسطر الحقول الموحَّدة أولاً (‏contact وencryption وpolicy وlanguages)، ثم المشكلات. واحتفظ بعدّاد أخطاء، وعامل التحذيرات وحدها على أنها غير قاتلة." },
        { en: "Compare dates with `new Date(...)`. `when <= today` is expired; `when - today > 365*24*3600*1000` ms is the \"more than a year\" warning. Validate the RFC3339 shape with a regex before trusting `Date`.", ar: "قارن التواريخ بـ `new Date(...)`. و`when <= today` يعني منتهياً؛ و`when - today > 365*24*3600*1000` مللي ثانية هو تحذير \"أكثر من سنة\". وتحقّق من شكل RFC3339 بتعبير نمطي قبل الوثوق بـ `Date`." },
      ],
      tests: [
        { name: { en: "A complete, valid file", ar: "ملف كامل وصالح" }, stdin: `today 2026-10-17T00:00:00Z
# security.txt for example.com (RFC 9116)
Contact: mailto:security@example.com
Contact: https://example.com/security/report
Expires: 2027-06-30T23:59:59Z
Encryption: https://example.com/pgp-key.txt
Preferred-Languages: en,ar
Policy: https://example.com/security/policy
Canonical: https://example.com/.well-known/security.txt
`, expected: `contact: mailto:security@example.com
contact: https://example.com/security/report
encryption: https://example.com/pgp-key.txt
policy: https://example.com/security/policy
languages: en, ar
status: valid
` },
        { name: { en: "A bare email and an http URL are not valid contacts, and the file has expired", ar: "بريد مجرّد وعنوان http ليسا جهتَي اتصال صالحتين، والملف منتهٍ" }, stdin: `today 2026-10-17T00:00:00Z
contact: security@example.org
CONTACT: http://example.org/report
Expires: 2026-01-01T00:00:00Z
Hiring: https://example.org/jobs
`, expected: `error: invalid Contact security@example.org
error: invalid Contact http://example.org/report
error: no valid Contact
error: the file has expired
status: invalid
` },
        { name: { en: "Duplicate Expires and Preferred-Languages, a tel: contact", ar: "تكرار Expires وPreferred-Languages، مع جهة اتصال tel:" }, stdin: `today 2026-10-17T00:00:00Z
Contact: tel:+1-201-555-0123
Expires: 2026-12-01T00:00:00+03:00
Expires: 2027-12-01T00:00:00Z
Preferred-Languages: en
Preferred-Languages: fr, de
`, expected: `contact: tel:+1-201-555-0123
languages: en
languages: fr, de
error: Expires appears 2 times
error: Preferred-Languages appears 2 times
status: invalid
` },
        { name: { en: "Valid, but Expires is more than a year away (a warning, still valid)", ar: "صالح، لكن Expires بعد أكثر من سنة (تحذير، ويبقى صالحاً)" }, stdin: `today 2026-10-17T12:00:00Z
Contact: mailto:psirt@example.net
Expires: 2028-10-17T12:00:00Z
This line has no colon and is ignored
X-Custom-Field: ignored too
`, expected: `contact: mailto:psirt@example.net
warning: Expires is more than a year away
status: valid
` },
        { name: { en: "Expires is present but not a valid timestamp", ar: "‏Expires موجود لكنه ليس طابعاً زمنياً صالحاً" }, stdin: `today 2026-10-17T00:00:00Z
Contact: mailto:security@example.com
Expires: sometime next year
`, expected: `contact: mailto:security@example.com
error: Expires is not a valid date
status: invalid
` },
        { name: { en: "Nothing useful at all", ar: "لا شيء مفيد إطلاقاً" }, stdin: `today 2026-10-17T00:00:00Z
# this file forgot the important fields
Acknowledgments: https://example.com/thanks
`, expected: `error: no valid Contact
error: Expires is missing
status: invalid
` },
      ],
      sampleInput: `today 2026-10-17T00:00:00Z
Contact: mailto:security@example.com
Contact: https://example.com/security/report
Expires: 2027-06-30T23:59:59Z
Preferred-Languages: en,ar
Policy: https://example.com/security/policy
`,
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "A commercial program's license agreement forbids reverse engineering. What does that mean for you?", ar: "اتفاقية ترخيص برنامج تجاري تمنع الهندسة العكسية. ماذا يعني ذلك لك؟" },
          choices: [
            { en: "Nothing, because licenses are never enforceable", ar: "لا شيء، لأن التراخيص غير قابلة للإنفاذ أبداً" },
            { en: "Breaking it is a criminal offence everywhere", ar: "خرقها جريمة جنائية في كل مكان" },
            { en: "It is a contract term: breaking it is usually a civil matter, though in some places statutes limit such clauses (for example EU interoperability)", ar: "إنه بند عقدي: خرقه عادةً مسألة مدنية، وإن كانت القوانين في بعض الأماكن تحدّ من هذه البنود (مثل التشغيل البيني في الاتحاد الأوروبي)" },
            { en: "It only applies to companies, never to individuals", ar: "ينطبق على الشركات فقط لا على الأفراد" },
          ],
          answer: 2,
          explain: {
            en: "A EULA is a contract, so breaching it is generally a civil matter, separate from criminal law, and its reach varies: some jurisdictions make anti-decompilation clauses unenforceable for interoperability, others uphold them. It is neither always void nor automatically a crime, and it binds individuals too.",
            ar: "اتفاقية الترخيص عقد، فخرقها عادةً مسألة مدنية منفصلة عن القانون الجنائي، ومداها يختلف: بعض الولايات تجعل بنود منع فك التجميع غير قابلة للإنفاذ لأجل التشغيل البيني، وأخرى تُبقيها. فهي ليست باطلة دائماً ولا جريمة تلقائياً، وتُلزم الأفراد أيضاً.",
          },
        },
        {
          q: { en: "You find a serious flaw in a product during authorized research. What is the standard first step?", ar: "تجد عيباً خطيراً في منتج أثناء بحث مصرَّح به. ما الخطوة الأولى المعيارية؟" },
          choices: [
            { en: "Publish full exploit details immediately so users are warned", ar: "نشر تفاصيل الاستغلال كاملة فوراً لتحذير المستخدمين" },
            { en: "Report it privately to the vendor and agree on a disclosure timeline (coordinated disclosure)", ar: "إبلاغ الجهة المصنِّعة سراً والاتفاق على جدول إفصاح (إفصاح منسّق)" },
            { en: "Sell the exploit to the highest bidder", ar: "بيع الاستغلال لمن يدفع أكثر" },
            { en: "Use it quietly on live systems to measure the real impact", ar: "استخدامه بهدوء على أنظمة حيّة لقياس الأثر الحقيقي" },
          ],
          answer: 1,
          explain: {
            en: "Coordinated disclosure gets the bug fixed with the least harm: report privately, give the vendor a fair window, then publish. Immediate full disclosure arms attackers before a fix exists, selling exploits and testing on live systems are not defensive acts, and the latter is likely illegal.",
            ar: "الإفصاح المنسّق يُصلح الثغرة بأقل ضرر: أبلغ سراً، وامنح الجهة مهلة عادلة، ثم انشر. أما الإفصاح الكامل الفوري فيسلّح المهاجمين قبل وجود إصلاح، وبيع الاستغلالات والاختبار على أنظمة حيّة ليسا عملاً دفاعياً، والأخير غالباً غير قانوني.",
          },
        },
        {
          q: { en: "What did the U.S. Supreme Court's Van Buren v. United States (2021) decision clarify about the CFAA?", ar: "ماذا أوضحت قضية Van Buren v. United States ‏(2021) أمام المحكمة العليا الأمريكية بشأن قانون CFAA؟" },
          choices: [
            { en: "That 'exceeds authorized access' means entering parts of a system that are off-limits to you, not misusing information you were entitled to reach; accessing systems you have no right to remains illegal", ar: "أن 'يتجاوز الوصول المصرَّح به' تعني دخول أجزاء من النظام محظورة عليك، لا إساءة استخدام معلومات كان يحق لك الوصول إليها؛ ويبقى الدخول إلى أنظمة لا حق لك فيها غير قانوني" },
            { en: "That reverse engineering is always a federal crime", ar: "أن الهندسة العكسية جريمة فيدرالية دائماً" },
            { en: "That the CFAA no longer applies to anyone", ar: "أن قانون CFAA لم يعد ينطبق على أحد" },
            { en: "That bug bounty programs are illegal", ar: "أن برامج مكافآت الثغرات غير قانونية" },
          ],
          answer: 0,
          explain: {
            en: "Van Buren read 'exceeds authorized access' narrowly: it is about which parts of a system you may enter, not your purpose for using data you were allowed to see. That is why breaking a site's terms of use is generally not a CFAA crime by itself, while entering areas or systems you were never permitted to reach still is. The CFAA remains in force, and the ruling says nothing against bug bounties.",
            ar: "قرأت القضية عبارة 'يتجاوز الوصول المصرَّح به' قراءة ضيّقة: فالمسألة هي أي أجزاء النظام يحق لك دخولها، لا غرضك من استخدام بيانات سُمح لك برؤيتها. ولهذا فإن مخالفة شروط استخدام موقع ليست في الغالب جريمة بموجب CFAA بذاتها، بينما يبقى دخول مناطق أو أنظمة لم يُسمح لك بها قط جريمة. والقانون ما زال سارياً، والحكم لا يقول شيئاً ضد مكافآت الثغرات.",
          },
        },
        {
          q: { en: "While testing inside a bug bounty program's scope, you discover a database of real users' personal data is exposed. What should you do?", ar: "أثناء اختبار داخل نطاق برنامج مكافآت ثغرات، تكتشف أن قاعدة بيانات فيها بيانات شخصية لمستخدمين حقيقيين مكشوفة. ماذا تفعل؟" },
          choices: [
            { en: "Download the whole database as proof", ar: "تنزّل قاعدة البيانات كلها كدليل" },
            { en: "Post a sample publicly so the company takes it seriously", ar: "تنشر عيّنة علناً كي تأخذ الشركة الأمر بجدية" },
            { en: "Keep a copy in case you need it later", ar: "تحتفظ بنسخة تحسّباً للحاجة لاحقاً" },
            { en: "Stop, avoid copying the data, note the minimum needed to show it is exposed, and report it", ar: "تتوقف، وتتجنب نسخ البيانات، وتدوّن الحد الأدنى اللازم لإظهار أنها مكشوفة، وتبلّغ عنها" },
          ],
          answer: 3,
          explain: {
            en: "Minimizing harm and protecting personal data come first: demonstrate the exposure with the least access possible, never exfiltrate or publish real data, and report it through the program. Downloading, keeping or posting the data would cause the very harm you are trying to prevent, and likely breaks data-protection law.",
            ar: "تقليل الضرر وحماية البيانات الشخصية أولاً: أثبت الكشف بأقل وصول ممكن، ولا تسرّب بيانات حقيقية ولا تنشرها أبداً، وأبلغ عبر البرنامج. فتنزيل البيانات أو الاحتفاظ بها أو نشرها يُحدث الضرر نفسه الذي تحاول منعه، وغالباً يخالف قانون حماية البيانات.",
          },
        },
        {
          q: { en: "A CVSS v3.1 base score is 8.1. Which severity band is that, and what does the number mainly convey?", ar: "درجة أساس CVSS v3.1 تساوي 8.1. في أي نطاق خطورة تقع، وماذا ينقل الرقم أساساً؟" },
          choices: [
            { en: "Critical, and it certifies the bug is being exploited right now", ar: "Critical، وهي تشهد بأن الثغرة تُستغل الآن" },
            { en: "High, a standardized, comparable measure of the vulnerability's intrinsic severity", ar: "High، وهي مقياس موحَّد وقابل للمقارنة لخطورة الثغرة الجوهرية" },
            { en: "Medium, and it is a legal risk rating", ar: "Medium، وهي تصنيف للمخاطر القانونية" },
            { en: "Low, and it measures how hard the bug was to find", ar: "Low، وهي تقيس صعوبة العثور على الثغرة" },
          ],
          answer: 1,
          explain: {
            en: "7.0-8.9 is the High band. A CVSS base score is a standardized, vendor-neutral estimate of a vulnerability's intrinsic technical severity, which makes reports comparable; it does not assert active exploitation, legal risk, or how hard the bug was to find (those are separate concerns, some captured by other CVSS metric groups).",
            ar: "النطاق 7.0-8.9 هو High. ودرجة أساس CVSS تقدير موحَّد ومحايد تجاه الجهات لخطورة الثغرة التقنية الجوهرية، مما يجعل التقارير قابلة للمقارنة؛ وهي لا تؤكد استغلالاً فعلياً، ولا مخاطر قانونية، ولا صعوبة الاكتشاف (تلك أمور منفصلة، بعضها في مجموعات مقاييس CVSS أخرى).",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary and what to practice next

- Reverse engineering is a legitimate skill; what matters is **authorization** and **intent**. Analyze only what is yours, open, made for practice, or permitted in writing.
- **Licenses** (contracts) and **laws** are different limits. Laws commonly cited include anti-circumvention rules (**DMCA** 1201 and its security-research exemptions), the **EU Software Directive** on interoperability, unauthorized-access laws (**CFAA**, narrowed by **Van Buren**), the **Budapest Convention** baseline, and data-protection law (**GDPR**). They **differ by country** and change over time.
- A professional **ethic** sits above the law: minimize harm, protect other people's data, never hack back, honour embargoes, act in good faith.
- Prefer **coordinated disclosure**; use **full disclosure** only as a last resort; stay inside a **bug bounty's scope** and look for **safe-harbor** terms.
- Rate issues with **CVSS**, write clear reports with reproduction steps and the least necessary proof, respect the timeline and **CVE** process, and reach vendors via **\`security.txt\`** (RFC 9116).
- When in doubt, **stop and ask** for permission or legal advice. This lesson is education, not legal advice.

**Practice next:** open the \`/.well-known/security.txt\` of a few services you use (reading a public file is harmless) and run your validator on them. Read one published vulnerability disclosure policy and find its scope, its rules and its safe-harbor wording. Take three published advisories, score their CVSS v3.1 vectors with your calculator and compare with the score each advisory states. Then write a full mock report, with redacted proof, for a bug you find in a deliberately vulnerable app running on your own machine, such as OWASP Juice Shop. Next, the optional node on packers, anti-debugging and obfuscators.

**This is the ethical backbone of the whole track.** Everything you learned, reading binaries, debugging, deobfuscation, malware analysis, becomes valuable precisely because you apply it responsibly: to defend systems, to make software safer, and to help others, never to harm. Carry these rules into every project.`,
        ar: `## الخلاصة وماذا تتدرّب عليه بعد ذلك

- الهندسة العكسية مهارة مشروعة؛ والمهم هو **التصريح** و**النية**. حلّل فقط ما هو ملكك، أو مفتوح، أو مصنوع للتدريب، أو مصرَّح به كتابةً.
- **التراخيص** (العقود) و**القوانين** قيدان مختلفان. ومن أكثر القوانين ذكراً: قواعد منع التجاوز (المادة 1201 من **DMCA** واستثناءات البحث الأمني فيها)، و**EU Software Directive** للتشغيل البيني، وقوانين الدخول غير المصرَّح به (**CFAA** الذي ضيّقته قضية **Van Buren**)، وأساس **اتفاقية بودابست**، وقانون حماية البيانات (**GDPR**). وهي **تختلف باختلاف البلد** وتتغير مع الزمن.
- تعلو **الأخلاقيات** المهنية على القانون: قلّل الضرر، واحمِ بيانات الآخرين، ولا تردّ الهجوم أبداً، واحترم فترات الحظر، وتصرّف بحسن نية.
- فضّل **الإفصاح المنسّق**؛ ولا تلجأ إلى **الإفصاح الكامل** إلا كملاذ أخير؛ وابقَ داخل **نطاق مكافأة الثغرات** وابحث عن بنود **الملاذ الآمن**.
- قيّم الثغرات بـ **CVSS**، واكتب تقارير واضحة بخطوات إعادة الإنتاج وأقل إثبات ضروري، واحترم الجدول الزمني وعملية **CVE**، وصِل إلى الجهات المصنِّعة عبر **\`security.txt\`** ‏(RFC 9116).
- وعند الشك، **توقّف واسأل** عن إذن أو استشارة قانونية. هذا الدرس تثقيف وليس استشارة قانونية.

**تدرّب بعد ذلك:** افتح ملف \`/.well-known/security.txt\` لبضع خدمات تستخدمها (قراءة ملف عام أمر غير ضار) وشغّل مدقّقك عليها. واقرأ سياسة إفصاح عن الثغرات منشورة واحدة وحدّد نطاقها وقواعدها وصياغة الملاذ الآمن فيها. وخذ ثلاث نشرات أمنية منشورة، واحسب درجات متجهات CVSS v3.1 فيها بحاسبتك وقارنها بالدرجة التي تذكرها كل نشرة. ثم اكتب تقريراً تجريبياً كاملاً، بإثبات منقَّح، لثغرة تجدها في تطبيق مُضعَّف عمداً يعمل على جهازك أنت، مثل OWASP Juice Shop. وبعد ذلك، العقدة الاختيارية عن المضغوطات (packers) ومقاومة التنقيح وأدوات التعتيم.

**هذا هو العمود الأخلاقي للمسار كله.** كل ما تعلمته — قراءة الملفات الثنائية، والتنقيح، وفك التعتيم، وتحليل البرمجيات الخبيثة — يصبح قيّماً تحديداً لأنك تطبّقه بمسؤولية: لحماية الأنظمة، ولجعل البرمجيات أكثر أماناً، ولمساعدة الآخرين، لا للإضرار أبداً. احمل هذه القواعد في كل مشروع.`,
      },
    },
  ],
};
