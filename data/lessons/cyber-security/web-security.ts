import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "web-security",
  title: { en: "Web Security — Attacks on Websites", ar: "أمن الويب — الهجمات على المواقع" },
  estMinutes: 40,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- The two most famous web attacks: **SQL Injection** and **XSS**
- **CSRF** — tricking a logged-in user's own browser into acting against them
- Why they happen: mixing *data* with *code*
- How to detect and prevent them
- A real breach caused entirely by SQL injection
- You'll write a real input-sanitizer and a CSRF-token checker

⚠️ **Ethics first:** these techniques are for defending systems and testing *your own* (or authorized) applications. Attacking systems you don't own is a crime.`,
        ar: `## ماذا ستتعلم

- أشهر هجومين على الويب: **حقن SQL** و**XSS**
- **CSRF** — خداع متصفح مستخدم مسجّل الدخول ليتصرف ضد مصلحته
- لماذا يحدثان: خلط *البيانات* بـ*الكود*
- كيف تكتشفهما وتمنعهما
- اختراق حقيقي سببه حقن SQL بالكامل
- ستكتب مُنقّي مدخلات حقيقياً وفاحص رمز CSRF

⚠️ **الأخلاق أولاً:** هذه التقنيات للدفاع عن الأنظمة واختبار تطبيقاتك *أنت* (أو المصرّح لك بها). مهاجمة أنظمة لا تملكها جريمة.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The root cause: data treated as code 💉

Almost every web attack is the same mistake: the app takes **user input** and accidentally runs it as **instructions**.

**SQL Injection.** A login form builds a database query by gluing your input into a string:

\`\`\`
"SELECT * FROM users WHERE name = '" + input + "'"
\`\`\`

Type a normal name and it's fine. But type \`' OR '1'='1\` and the query becomes:

\`\`\`sql
SELECT * FROM users WHERE name = '' OR '1'='1'
\`\`\`

\`'1'='1'\` is always true → it returns **every** user, bypassing the login. The fix: **parameterized queries** (a.k.a. prepared statements) — the input is sent separately from the query, so it can *never* become code.

**XSS (Cross-Site Scripting).** A site shows user input on the page without cleaning it. An attacker posts a "comment" like:

\`\`\`html
<script>steal(document.cookie)</script>
\`\`\`

When other users view the page, their browser **runs** that script — stealing their session. The fix: **escape output** — turn \`<\` into \`&lt;\` so the browser shows it as text, never runs it. (This lesson platform's own code runner uses a sandboxed iframe for exactly this reason.)

**The golden rule:** *never trust user input.* Validate it, escape it, and keep data and code strictly separated.`,
        ar: `## السبب الجذري: بيانات تُعامَل ككود 💉

كل هجمات الويب تقريباً نفس الخطأ: يأخذ التطبيق **مدخلات المستخدم** وينفّذها بالخطأ كـ**تعليمات**.

**حقن SQL.** نموذج تسجيل دخول يبني استعلام قاعدة بيانات بلصق مدخلك في نص:

\`\`\`
"SELECT * FROM users WHERE name = '" + input + "'"
\`\`\`

اكتب اسماً عادياً فلا مشكلة. لكن اكتب \`' OR '1'='1\` فيصير الاستعلام:

\`\`\`sql
SELECT * FROM users WHERE name = '' OR '1'='1'
\`\`\`

\`'1'='1'\` صحيح دائماً ← يعيد **كل** المستخدمين، متجاوزاً تسجيل الدخول. الحل: **الاستعلامات المُعامَلة (parameterized queries)** — يُرسَل المدخل منفصلاً عن الاستعلام، فلا يصير كوداً *أبداً*.

**XSS (البرمجة عبر المواقع).** موقع يعرض مدخل المستخدم دون تنظيفه. ينشر مهاجم "تعليقاً" مثل:

\`\`\`html
<script>steal(document.cookie)</script>
\`\`\`

حين يشاهد مستخدمون آخرون الصفحة، **ينفّذ** متصفحهم ذلك السكربت — فيسرق جلستهم. الحل: **تهريب المخرجات (escape)** — تحويل \`<\` إلى \`&lt;\` ليعرضها المتصفح كنص، لا ينفّذها. (مُشغّل الكود في هذه المنصة نفسها يستخدم iframe معزولاً لهذا السبب بالضبط.)

**القاعدة الذهبية:** *لا تثق أبداً بمدخلات المستخدم.* تحقّق منها، هرّبها، وافصل البيانات عن الكود بصرامة.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Write a defensive function \`escape_html(text)\` that neutralizes XSS by replacing dangerous characters:
- \`<\` → \`&lt;\`
- \`>\` → \`&gt;\`
- \`&\` → \`&amp;\`

**Order matters:** replace \`&\` **first**, otherwise you'd double-escape the \`&\` in \`&lt;\`.`,
        ar: `اكتب دالة دفاعية \`escape_html(text)\` تُبطِل XSS باستبدال الأحرف الخطرة:
- \`<\` ← \`&lt;\`
- \`>\` ← \`&gt;\`
- \`&\` ← \`&amp;\`

**الترتيب مهم:** استبدل \`&\` **أولاً**، وإلا ستُهرّب \`&\` الموجودة في \`&lt;\` مرتين.`,
      },
      starterCode: `def escape_html(text):
    # replace & first, then < and >
    pass

print(escape_html("<script>alert(1)</script>"))
# &lt;script&gt;alert(1)&lt;/script&gt;`,
      solution: `def escape_html(text):
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    return text

print(escape_html("<script>alert(1)</script>"))
# &lt;script&gt;alert(1)&lt;/script&gt;`,
      hints: [
        { en: `Use text.replace(old, new) three times. Start with text.replace("&", "&amp;").`, ar: `استخدم text.replace(old, new) ثلاث مرات. ابدأ بـ text.replace("&", "&amp;").` },
        { en: `Then replace "<" with "&lt;" and ">" with "&gt;". Return the result.`, ar: `ثم استبدل "<" بـ "&lt;" و">" بـ "&gt;". أعِد النتيجة.` },
      ],
      tests: [
        { name: { en: "Escapes < and >", ar: "يهرّب < و >" }, check: `assert escape_html("<b>") == "&lt;b&gt;"` },
        { name: { en: "Neutralizes a script tag", ar: "يُبطِل وسم script" }, check: `assert "<script>" not in escape_html("<script>x</script>")` },
        { name: { en: "Escapes & correctly (first)", ar: "يهرّب & بشكل صحيح (أولاً)" }, check: `assert escape_html("a & b") == "a &amp; b"` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## CSRF — hijacking your browser's trust 🎯

SQLi and XSS trick a *server* or exploit *trust in user input*. **CSRF (Cross-Site Request Forgery)** is different: it tricks the **victim's own browser**, using a trust the server has in that browser's cookies.

Here's the attack: you're logged into \`yourbank.com\` (your browser holds a valid session cookie). You then visit a malicious page that contains:

\`\`\`html
<img src="https://yourbank.com/transfer?to=attacker&amount=1000">
\`\`\`

Your browser automatically attaches your \`yourbank.com\` cookies to *any* request to that domain — including this sneaky one hidden in an \`<img>\` tag. If the bank's server only checks "does this request have a valid session cookie?", it can't tell the difference between you clicking "transfer" on purpose and your browser being tricked into firing the same request on a stranger's page. This is called the **"confused deputy" problem** — your browser (the deputy) is confused into misusing its own authority.

**The fix: CSRF tokens.** The server embeds a random, secret, one-time token in its own forms. A real request from the bank's own page includes that token; a forged request from an attacker's page has no way to know it. The server rejects any request missing a valid, matching token.`,
        ar: `## CSRF — اختطاف ثقة متصفحك 🎯

حقن SQL وXSS يخدعان *الخادم* أو يستغلان *الثقة بمدخل المستخدم*. أما **CSRF (تزوير الطلب عبر المواقع)** فمختلف: يخدع **متصفح الضحية نفسه**، مستغلاً ثقة الخادم بكوكيز ذلك المتصفح.

إليك الهجوم: أنت مسجّل الدخول في \`yourbank.com\` (متصفحك يحمل كوكي جلسة صالحاً). ثم تزور صفحة خبيثة تحتوي:

\`\`\`html
<img src="https://yourbank.com/transfer?to=attacker&amount=1000">
\`\`\`

متصفحك يرفق تلقائياً كوكيز \`yourbank.com\` بـ*أي* طلب لذلك النطاق — بما فيه هذا الطلب الخبيث المخفي داخل وسم \`<img>\`. إن كان خادم البنك يفحص فقط "هل لهذا الطلب كوكي جلسة صالح؟"، فلا يستطيع التمييز بين ضغطك "تحويل" عمداً وخداع متصفحك ليطلق نفس الطلب على صفحة غريب. يسمى هذا **مشكلة "النائب المخدوع" (confused deputy)** — متصفحك (النائب) خُدع فأساء استخدام سلطته الخاصة.

**الحل: رموز CSRF.** يُضمّن الخادم رمزاً عشوائياً سرياً لمرة واحدة في نماذجه الخاصة. الطلب الحقيقي من صفحة البنك نفسه يتضمن ذلك الرمز؛ والطلب المُزوَّر من صفحة مهاجم لا طريقة له لمعرفته. يرفض الخادم أي طلب بلا رمز صالح مطابق.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `**Simulate CSRF-token validation.** Write \`isValidRequest(sessionToken, submittedToken)\` that returns \`true\` only if the two tokens match **exactly** — modeling how a server rejects a forged request with a missing or wrong token.`,
        ar: `**حاكِ التحقق من رمز CSRF.** اكتب \`isValidRequest(sessionToken, submittedToken)\` تعيد \`true\` فقط إذا تطابق الرمزان **تماماً** — محاكياً كيف يرفض الخادم طلباً مزوّراً برمز ناقص أو خاطئ.`,
      },
      starterCode: `function isValidRequest(sessionToken, submittedToken) {
  // return true only if they match exactly

}

console.log(isValidRequest("abc123", "abc123"));  // true
console.log(isValidRequest("abc123", "wrong"));   // false
console.log(isValidRequest("abc123", undefined)); // false (forged request, no token)`,
      solution: `function isValidRequest(sessionToken, submittedToken) {
  return sessionToken === submittedToken;
}

console.log(isValidRequest("abc123", "abc123"));  // true
console.log(isValidRequest("abc123", "wrong"));   // false
console.log(isValidRequest("abc123", undefined)); // false`,
      hints: [
        { en: `A single === comparison is the whole function.`, ar: `مقارنة === واحدة هي الدالة كاملة.` },
        { en: `return sessionToken === submittedToken;`, ar: `return sessionToken === submittedToken;` },
      ],
      tests: [
        { name: { en: "Matching tokens are valid", ar: "الرموز المتطابقة صالحة" }, check: `isValidRequest("abc123", "abc123") === true` },
        { name: { en: "Wrong token is rejected", ar: "الرمز الخاطئ يُرفض" }, check: `isValidRequest("abc123", "wrong") === false` },
        { name: { en: "Missing token is rejected", ar: "الرمز المفقود يُرفض" }, check: `isValidRequest("abc123", undefined) === false` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: TalkTalk (2015) 🔍

In 2015, UK telecom provider **TalkTalk** suffered a breach exposing the personal data of nearly 157,000 customers — names, addresses, bank details for some — after attackers used **SQL injection** against a legacy webpage the company had reportedly forgotten was still running. The vulnerability was in code that, by some reports, was over a decade old.

The cost wasn't just technical: TalkTalk was fined £400,000 by the UK's data protection regulator (the largest such fine at the time) and reportedly lost tens of thousands of customers. The root cause was exactly the pattern from this lesson: user-controllable input reaching a database query, unguarded by parameterized queries — the same class of bug you just learned to prevent.`,
        ar: `## دراسة حالة واقعية: TalkTalk (2015) 🔍

في 2015، تعرّضت شركة الاتصالات البريطانية **TalkTalk** لاختراق كشف بيانات نحو 157,000 عميل — أسماء، عناوين، وتفاصيل بنكية لبعضهم — بعد أن استخدم المهاجمون **حقن SQL** ضد صفحة ويب قديمة كانت الشركة، بحسب تقارير، قد نسيت أنها ما زالت تعمل. كانت الثغرة في كود يعود، بحسب بعض التقارير، لأكثر من عقد.

لم تكن التكلفة تقنية فقط: غُرّمت TalkTalk 400,000 جنيه إسترليني من جهة حماية البيانات البريطانية (أكبر غرامة من نوعها حينها)، وخسرت بحسب التقارير عشرات آلاف العملاء. السبب الجذري كان بالضبط نمط هذا الدرس: مدخل يتحكم به المستخدم يصل استعلام قاعدة بيانات، غير محمي باستعلامات مُعامَلة — نفس فئة الخطأ الذي تعلّمت للتو منعه.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is the root cause of SQL injection?", ar: "ما السبب الجذري لحقن SQL؟" },
          choices: [
            { en: "Weak passwords", ar: "كلمات مرور ضعيفة" },
            { en: "User input glued into a query so it becomes code", ar: "لصق مدخل المستخدم في استعلام فيصير كوداً" },
            { en: "Slow servers", ar: "خوادم بطيئة" },
          ],
          answer: 1,
          explain: {
            en: "Mixing untrusted data into the query string lets input change the query's meaning. Parameterized queries fix it.",
            ar: "خلط بيانات غير موثوقة في نص الاستعلام يتيح للمدخل تغيير معنى الاستعلام. الاستعلامات المُعامَلة تعالجه.",
          },
        },
        {
          q: { en: "How do you prevent SQL injection?", ar: "كيف تمنع حقن SQL؟" },
          choices: [
            { en: "Use parameterized queries (prepared statements)", ar: "استخدم الاستعلامات المُعامَلة (prepared statements)" },
            { en: "Make the password longer", ar: "أطِل كلمة المرور" },
            { en: "Hide the login page", ar: "أخفِ صفحة الدخول" },
          ],
          answer: 0,
          explain: {
            en: "Parameterized queries send data separately from SQL, so input can never be executed as code. The definitive fix.",
            ar: "الاستعلامات المُعامَلة ترسل البيانات منفصلة عن SQL، فلا يُنفَّذ المدخل ككود أبداً. الحل القاطع.",
          },
        },
        {
          q: { en: "XSS lets an attacker…", ar: "XSS يتيح للمهاجم…" },
          choices: [
            { en: "Run their script in other users' browsers", ar: "تشغيل سكربته في متصفحات المستخدمين الآخرين" },
            { en: "Physically steal the server", ar: "سرقة الخادم فعلياً" },
            { en: "Slow down the internet", ar: "إبطاء الإنترنت" },
          ],
          answer: 0,
          explain: {
            en: "Unescaped output means the browser runs attacker-supplied script — stealing cookies/sessions. Escaping output prevents it.",
            ar: "المخرجات غير المهرّبة تعني أن المتصفح ينفّذ سكربت المهاجم — فيسرق الكوكيز/الجلسات. تهريب المخرجات يمنعه.",
          },
        },
        {
          q: { en: "The golden rule of web security is…", ar: "القاعدة الذهبية لأمن الويب هي…" },
          choices: [
            { en: "Never trust user input", ar: "لا تثق أبداً بمدخلات المستخدم" },
            { en: "Always trust logged-in users", ar: "ثِق دائماً بالمستخدمين المسجّلين" },
            { en: "Encryption solves everything", ar: "التشفير يحل كل شيء" },
          ],
          answer: 0,
          explain: {
            en: "Validate, escape, and separate data from code. Every input is guilty until proven safe.",
            ar: "تحقّق، هرّب، وافصل البيانات عن الكود. كل مدخل مذنب حتى تثبت سلامته.",
          },
        },
        {
          q: { en: "What makes CSRF different from XSS?", ar: "ما الذي يميّز CSRF عن XSS؟" },
          choices: [
            { en: "CSRF abuses the victim's own browser and its trusted session cookies, not injected script", ar: "CSRF يستغل متصفح الضحية نفسه وكوكيز جلسته الموثوقة، لا سكربتاً مُحقناً" },
            { en: "They are exactly the same attack", ar: "نفس الهجوم تماماً" },
            { en: "CSRF only affects mobile apps", ar: "CSRF يؤثر فقط على تطبيقات الجوال" },
          ],
          answer: 0,
          explain: {
            en: "CSRF tricks the browser into sending a request it's already trusted to send (via cookies) — no script injection required, unlike XSS.",
            ar: "CSRF يخدع المتصفح ليرسل طلباً هو أصلاً موثوق بإرساله (عبر الكوكيز) — بلا حاجة لحقن سكربت، خلافاً لـXSS.",
          },
        },
        {
          q: { en: "How do CSRF tokens stop a forged request?", ar: "كيف توقف رموز CSRF طلباً مزوّراً؟" },
          choices: [
            { en: "A forged request from another site has no way to know the secret token", ar: "الطلب المزوّر من موقع آخر لا طريقة له لمعرفة الرمز السري" },
            { en: "They encrypt the entire website", ar: "تشفّر الموقع كاملاً" },
            { en: "They block all cookies", ar: "تحجب كل الكوكيز" },
          ],
          answer: 0,
          explain: {
            en: "The token must come from the bank's own page, which an attacker's page can't read or guess — so the server can reject requests without it.",
            ar: "يجب أن يأتي الرمز من صفحة البنك نفسها، التي لا يستطيع المهاجم قراءتها أو تخمينها — فيرفض الخادم الطلبات بدونه.",
          },
        },
        {
          q: { en: "What actually caused the 2015 TalkTalk breach?", ar: "ما الذي سبب اختراق TalkTalk عام 2015 فعلياً؟" },
          choices: [
            { en: "SQL injection against an old, forgotten webpage", ar: "حقن SQL ضد صفحة ويب قديمة منسية" },
            { en: "A stolen employee laptop", ar: "سرقة حاسوب موظف محمول" },
            { en: "A power outage", ar: "انقطاع كهرباء" },
          ],
          answer: 0,
          explain: {
            en: "Exactly the pattern from this lesson: unvalidated input reaching a database query, with a huge real-world cost (fines + lost customers).",
            ar: "بالضبط نمط هذا الدرس: مدخل غير مُتحقَّق منه يصل استعلام قاعدة بيانات، بتكلفة واقعية هائلة (غرامات + فقدان عملاء).",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- SQLi and XSS both come from mixing untrusted **data** with **code**
- CSRF abuses the victim's own trusted browser session — fixed with unpredictable tokens
- Fix SQLi with parameterized queries; fix XSS by escaping output; fix CSRF with tokens
- You built a real \`escape_html\` sanitizer and a CSRF-token validator
- TalkTalk (2015) shows the real financial cost of an unpatched SQL injection flaw
- Study the **OWASP Top 10** (Resources tab) — the industry checklist of web risks

**Next:** SOC Analysis — monitoring and responding to attacks in a real security team.`,
        ar: `## الخلاصة

- حقن SQL وXSS كلاهما من خلط **بيانات** غير موثوقة بـ**كود**
- CSRF يستغل جلسة متصفح الضحية الموثوقة نفسها — يُعالَج برموز لا يمكن التنبؤ بها
- عالِج حقن SQL بالاستعلامات المُعامَلة؛ وXSS بتهريب المخرجات؛ وCSRF بالرموز
- بنيت مُنقّي \`escape_html\` حقيقياً وفاحص رمز CSRF
- TalkTalk (2015) تُظهر التكلفة المالية الحقيقية لثغرة حقن SQL غير مُصلَحة
- ادرس **OWASP Top 10** (تبويب المصادر) — قائمة الصناعة لمخاطر الويب

**التالي:** تحليل SOC — مراقبة الهجمات والاستجابة لها في فريق أمن حقيقي.`,
      },
    },
  ],
};
