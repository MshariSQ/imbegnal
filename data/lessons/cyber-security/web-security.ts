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
- Why they happen: mixing *data* with *code*
- How to detect and prevent them
- You'll write a real input-sanitizer

⚠️ **Ethics first:** these techniques are for defending systems and testing *your own* (or authorized) applications. Attacking systems you don't own is a crime.`,
        ar: `## ماذا ستتعلم

- أشهر هجومين على الويب: **حقن SQL** و**XSS**
- لماذا يحدثان: خلط *البيانات* بـ*الكود*
- كيف تكتشفهما وتمنعهما
- ستكتب مُنقّي مدخلات حقيقياً

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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- SQLi and XSS both come from mixing untrusted **data** with **code**
- Fix SQLi with parameterized queries; fix XSS by escaping output
- You built a real \`escape_html\` sanitizer
- Study the **OWASP Top 10** (Resources tab) — the industry checklist of web risks

**Next:** SOC Analysis — monitoring and responding to attacks in a real security team.`,
        ar: `## الخلاصة

- حقن SQL وXSS كلاهما من خلط **بيانات** غير موثوقة بـ**كود**
- عالِج حقن SQL بالاستعلامات المُعامَلة؛ وعالِج XSS بتهريب المخرجات
- بنيت مُنقّي \`escape_html\` حقيقياً
- ادرس **OWASP Top 10** (تبويب المصادر) — قائمة الصناعة لمخاطر الويب

**التالي:** تحليل SOC — مراقبة الهجمات والاستجابة لها في فريق أمن حقيقي.`,
      },
    },
  ],
};
