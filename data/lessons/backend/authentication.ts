import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "authentication",
  title: { en: "Auth & Security — Who Are You?", ar: "المصادقة والأمن — من أنت؟" },
  estMinutes: 35,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- **Authentication** vs **Authorization** (two different questions)
- Why you must **never** store passwords as plain text
- What **hashing** and **tokens (JWT)** are
- You'll write a login-attempt checker`,
        ar: `## ماذا ستتعلم

- **المصادقة (Authentication)** مقابل **التخويل (Authorization)** (سؤالان مختلفان)
- لماذا يجب **ألا** تخزّن كلمات المرور كنص صريح
- ما هو **التجزئة (hashing)** و**الرموز (JWT)**
- ستكتب فاحص محاولات تسجيل دخول`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Two doors: ID check and permission slip 🔑

Two words sound alike but ask different questions:

- **Authentication** = "**Who are you?**" — proving identity (username + password, or GitHub login).
- **Authorization** = "**What are you allowed to do?**" — a logged-in *user* can read posts; only an *admin* can delete them.

Authenticate first, then authorize.

**The #1 rule: never store passwords as plain text.** If your database leaks (and databases leak), every password is exposed — and people reuse passwords everywhere. Instead you store a **hash**.

A **hash** is a one-way blender: it turns \`"pizza123"\` into something like \`a1b2c3...\`. Same input always gives the same hash, but you **cannot** reverse it back to the password. So at login you hash what the user typed and compare it to the stored hash — you never store or even *see* the real password. (Real systems use bcrypt/argon2, which also add a random "salt" so identical passwords get different hashes.)

**Tokens (JWT).** HTTP forgets you after every request. So after you log in, the server hands you a signed **token** (a JWT — JSON Web Token). Your browser sends it with each request, like a wristband at an event: the server checks the signature and knows it's really you, without asking for your password again. This very site does exactly that — a JWT in your browser keeps you signed in.`,
        ar: `## بابان: فحص الهوية وتصريح الإذن 🔑

كلمتان متشابهتان لكنهما تطرحان سؤالين مختلفين:

- **المصادقة** = "**من أنت؟**" — إثبات الهوية (اسم مستخدم + كلمة مرور، أو دخول GitHub).
- **التخويل** = "**ماذا يُسمح لك أن تفعل؟**" — *المستخدم* المسجّل يقرأ المنشورات؛ و*المدير* فقط يحذفها.

صادِق أولاً، ثم خوّل.

**القاعدة رقم 1: لا تخزّن كلمات المرور كنص صريح أبداً.** إن تسرّبت قاعدة بياناتك (وقواعد البيانات تتسرّب)، انكشفت كل كلمة مرور — والناس يعيدون استخدام كلماتهم في كل مكان. بدلاً من ذلك تخزّن **التجزئة (hash)**.

**التجزئة** خلّاط باتجاه واحد: يحوّل \`"pizza123"\` إلى شيء مثل \`a1b2c3...\`. نفس المدخل يعطي دائماً نفس التجزئة، لكنك **لا تستطيع** عكسها إلى كلمة المرور. فعند الدخول تجزّئ ما كتبه المستخدم وتقارنه بالتجزئة المخزّنة — لا تخزّن ولا حتى *ترى* كلمة المرور الحقيقية. (الأنظمة الحقيقية تستخدم bcrypt/argon2، وتضيف "ملحاً" عشوائياً ليعطي المتطابقون تجزئات مختلفة.)

**الرموز (JWT).** HTTP ينساك بعد كل طلب. فبعد تسجيل الدخول، يمنحك الخادم **رمزاً** موقّعاً (JWT — رمز ويب JSON). يرسله متصفحك مع كل طلب، مثل سوار في فعالية: يفحص الخادم التوقيع فيعرف أنه أنت حقاً، دون طلب كلمة المرور ثانية. هذا الموقع نفسه يفعل ذلك — رمز JWT في متصفحك يبقيك مسجّلاً.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Simulate a safe login check. You have a stored hash (pretend hashing = reversing the string, just for practice). Write \`check_login(stored_hash, typed_password)\` that hashes the typed password the same way and returns \`True\` only if it matches.

Use this fake hash function: \`fake_hash(pw)\` = the password reversed (\`pw[::-1]\`).`,
        ar: `حاكِ فحص تسجيل دخول آمن. لديك تجزئة مخزّنة (لنتظاهر أن التجزئة = عكس النص، للتدريب فقط). اكتب \`check_login(stored_hash, typed_password)\` تجزّئ كلمة المرور المكتوبة بنفس الطريقة وتعيد \`True\` فقط عند التطابق.

استخدم دالة التجزئة الوهمية: \`fake_hash(pw)\` = كلمة المرور معكوسة (\`pw[::-1]\`).`,
      },
      starterCode: `def fake_hash(pw):
    return pw[::-1]   # reverse the string (pretend hash)

def check_login(stored_hash, typed_password):
    # hash the typed password and compare to stored_hash
    pass

stored = fake_hash("pizza123")
print(check_login(stored, "pizza123"))  # True
print(check_login(stored, "wrong"))     # False`,
      solution: `def fake_hash(pw):
    return pw[::-1]

def check_login(stored_hash, typed_password):
    return fake_hash(typed_password) == stored_hash

stored = fake_hash("pizza123")
print(check_login(stored, "pizza123"))  # True
print(check_login(stored, "wrong"))     # False`,
      hints: [
        { en: `Hash the typed password: fake_hash(typed_password).`, ar: `جزّئ كلمة المرور المكتوبة: fake_hash(typed_password).` },
        { en: `Return whether it equals stored_hash — one line: return fake_hash(typed_password) == stored_hash`, ar: `أعِد هل تساوي stored_hash — سطر واحد: return fake_hash(typed_password) == stored_hash` },
      ],
      tests: [
        { name: { en: "Correct password passes", ar: "كلمة المرور الصحيحة تنجح" }, check: `assert check_login(fake_hash("pizza123"), "pizza123") == True` },
        { name: { en: "Wrong password fails", ar: "كلمة المرور الخاطئة تفشل" }, check: `assert check_login(fake_hash("pizza123"), "wrong") == False` },
        { name: { en: "Works for any password", ar: "يعمل لأي كلمة مرور" }, check: `assert check_login(fake_hash("Secret9"), "Secret9") == True` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Authentication answers which question?", ar: "المصادقة تجيب على أي سؤال؟" },
          choices: [
            { en: "What are you allowed to do?", ar: "ماذا يُسمح لك أن تفعل؟" },
            { en: "Who are you?", ar: "من أنت؟" },
            { en: "Where are you?", ar: "أين أنت؟" },
          ],
          answer: 1,
          explain: {
            en: "Authentication = proving identity. Authorization = what that identity may do. Two separate checks.",
            ar: "المصادقة = إثبات الهوية. التخويل = ما تستطيع تلك الهوية فعله. فحصان منفصلان.",
          },
        },
        {
          q: { en: "Why store a password hash instead of the password?", ar: "لماذا نخزّن تجزئة كلمة المرور بدل كلمة المرور؟" },
          choices: [
            { en: "Hashes take less space", ar: "التجزئات تأخذ مساحة أقل" },
            { en: "If the database leaks, the real passwords aren't exposed", ar: "إن تسرّبت قاعدة البيانات، لا تنكشف كلمات المرور الحقيقية" },
            { en: "Hashes are easier to type", ar: "التجزئات أسهل في الكتابة" },
          ],
          answer: 1,
          explain: {
            en: "Hashing is one-way, so a leaked hash can't be turned back into the password. Never store plain text.",
            ar: "التجزئة باتجاه واحد، فالتجزئة المسرّبة لا تُعاد إلى كلمة المرور. لا تخزّن نصاً صريحاً أبداً.",
          },
        },
        {
          q: { en: "What is a JWT used for?", ar: "لماذا يُستخدم JWT؟" },
          choices: [
            { en: "To keep a user logged in across requests without re-sending the password", ar: "لإبقاء المستخدم مسجّلاً عبر الطلبات دون إعادة إرسال كلمة المرور" },
            { en: "To encrypt the database", ar: "لتشفير قاعدة البيانات" },
            { en: "To speed up the network", ar: "لتسريع الشبكة" },
          ],
          answer: 0,
          explain: {
            en: "A signed token acts like an event wristband: the server verifies it each request instead of asking for credentials again.",
            ar: "الرمز الموقّع يعمل كسوار فعالية: يتحقق منه الخادم كل طلب بدل طلب بيانات الدخول مجدداً.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Authentication (who?) then Authorization (allowed to?)
- Never store plain passwords — store one-way hashes (bcrypt/argon2 + salt)
- JWT tokens keep users logged in without re-sending passwords
- You built a hash-based login check

**Security note:** you learned this properly — the same principles secure this very platform. **Next:** Node.js, a popular runtime for building these backends.`,
        ar: `## الخلاصة

- المصادقة (من؟) ثم التخويل (مسموح؟)
- لا تخزّن كلمات مرور صريحة — خزّن تجزئات باتجاه واحد (bcrypt/argon2 + ملح)
- رموز JWT تبقي المستخدمين مسجّلين دون إعادة إرسال كلمات المرور
- بنيت فحص دخول قائماً على التجزئة

**ملاحظة أمنية:** تعلّمت هذا بشكل صحيح — نفس المبادئ تؤمّن هذه المنصة. **التالي:** Node.js، بيئة تشغيل شائعة لبناء هذه الخلفيات.`,
      },
    },
  ],
};
