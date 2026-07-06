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
      type: "text",
      body: {
        en: `## Sessions, refresh, and revocation — the loose ends 🧵

A signed JWT proves "this really is Sara" — but two practical questions follow immediately: how long should that proof last, and what happens if you need to cancel it early?

**Short-lived tokens + refresh tokens.** If a JWT lasted forever, a stolen token would grant forever-access. So real systems issue a short-lived **access token** (minutes to hours) for everyday requests, plus a longer-lived **refresh token** stored more carefully (often an HttpOnly cookie) that's only used to silently mint a new access token when the old one expires. The user never notices — they just stay logged in — but a leaked access token expires quickly on its own.

**The revocation problem.** Here's the catch with JWTs: once signed, the server can't "unsign" one. If a token isn't expired yet, it stays valid everywhere it's presented — even if the user logs out or an admin bans them. Two common fixes:
- Keep tokens very short-lived, so a "logout" mostly just means "stop sending the refresh token."
- Maintain a small server-side **denylist** (recently revoked token IDs) checked on top of signature verification, until expiry catches up.

**Sessions vs tokens, in one line:** a classic **session** keeps the source of truth in server memory/DB (a session ID cookie), so logging out is instant — but it doesn't scale across many servers as easily. A **JWT** carries its own proof and scales beautifully across many servers, at the cost of exactly this revocation awkwardness. Neither is "wrong" — it's a trade-off, like most of backend engineering.`,
        ar: `## الجلسات والتحديث والإبطال — الأطراف السائبة 🧵

رمز JWT الموقّع يثبت "هذه Sara فعلاً" — لكن سؤالان عمليان يطرحان أنفسهما فوراً: كم يجب أن يدوم هذا الإثبات، وماذا يحدث إن احتجت إلغاءه مبكراً؟

**رموز قصيرة العمر + رموز تحديث.** لو دام JWT للأبد، لمنح رمز مسروق وصولاً أبدياً. لذا تصدر الأنظمة الحقيقية **رمز وصول (access token)** قصير العمر (دقائق إلى ساعات) للطلبات اليومية، إضافة إلى **رمز تحديث (refresh token)** أطول عمراً يُخزَّن بحذر أكبر (غالباً كوكي HttpOnly) يُستخدم فقط لصنع رمز وصول جديد بصمت عند انتهاء القديم. لا يلاحظ المستخدم شيئاً — يبقى مسجّلاً فقط — لكن رمز الوصول المسرّب ينتهي بسرعة من تلقاء نفسه.

**مشكلة الإبطال.** هنا المشكلة مع JWT: بمجرد التوقيع، لا يستطيع الخادم "إلغاء توقيعه". إن لم ينتهِ الرمز بعد، يبقى صالحاً أينما قُدِّم — حتى لو سجّل المستخدم خروجه أو حظره مدير. حلّان شائعان:
- أبقِ الرموز قصيرة العمر جداً، فيصبح "تسجيل الخروج" غالباً يعني "توقّف عن إرسال رمز التحديث".
- احتفظ بـ**قائمة حظر (denylist)** صغيرة على الخادم (معرّفات رموز أُبطلت حديثاً) تُفحص فوق التحقق من التوقيع، حتى يلحق بها الانتهاء الطبيعي.

**الجلسات مقابل الرموز، بسطر واحد:** **الجلسة (session)** الكلاسيكية تُبقي مصدر الحقيقة في ذاكرة/قاعدة بيانات الخادم (كوكي معرّف جلسة)، فتسجيل الخروج فوري — لكنها لا تتوسّع عبر خوادم كثيرة بسهولة. أما **JWT** فيحمل إثباته الخاص ويتوسّع بجمال عبر خوادم كثيرة، بثمن هذه الصعوبة بالضبط في الإبطال. لا أحدهما "خطأ" — إنها مقايضة، كمعظم هندسة الخلفية.`,
      },
    },
    {
      type: "exercise",
      lang: "js",
      prompt: {
        en: `Simulate authentication AND authorization together. Write \`canDeletePost(user, post)\` that returns \`true\` only if the user is **authenticated** (not \`null\`) AND is **authorized** — either they own the post (\`user.id === post.ownerId\`) or their role is \`"admin"\`.

This mirrors real middleware: check identity first, then permission.`,
        ar: `حاكِ المصادقة والتخويل معاً. اكتب \`canDeletePost(user, post)\` تعيد \`true\` فقط إذا كان المستخدم **مصادَقاً** (ليس \`null\`) **و**مخوَّلاً — إما أنه يملك المنشور (\`user.id === post.ownerId\`) أو دوره \`"admin"\`.

هذا يحاكي middleware حقيقياً: افحص الهوية أولاً، ثم الصلاحية.`,
      },
      starterCode: `function canDeletePost(user, post) {
  // 1. if user is null/undefined -> false (not authenticated)
  // 2. if user.id === post.ownerId -> true (owns it)
  // 3. if user.role === "admin" -> true
  // 4. otherwise -> false
}

const alice = { id: 1, role: "user" };
const admin = { id: 9, role: "admin" };
const post = { ownerId: 1 };

console.log(canDeletePost(alice, post)); // true (owner)
console.log(canDeletePost(admin, post)); // true (admin)
console.log(canDeletePost(null, post));  // false (not authenticated)`,
      solution: `function canDeletePost(user, post) {
  if (!user) return false;
  if (user.id === post.ownerId) return true;
  if (user.role === "admin") return true;
  return false;
}

const alice = { id: 1, role: "user" };
const admin = { id: 9, role: "admin" };
const post = { ownerId: 1 };

console.log(canDeletePost(alice, post));
console.log(canDeletePost(admin, post));
console.log(canDeletePost(null, post));`,
      hints: [
        { en: `Guard clause first: if (!user) return false; — that's the authentication check.`, ar: `فقرة حماية أولاً: if (!user) return false; — هذا فحص المصادقة.` },
        { en: `Then two authorization checks: ownership (user.id === post.ownerId) or role === "admin".`, ar: `ثم فحصا تخويل: الملكية (user.id === post.ownerId) أو role === "admin".` },
      ],
      tests: [
        { name: { en: "Owner can delete their own post", ar: "المالك يستطيع حذف منشوره" }, check: `canDeletePost({id:1,role:"user"}, {ownerId:1}) === true` },
        { name: { en: "Admin can delete any post", ar: "المدير يستطيع حذف أي منشور" }, check: `canDeletePost({id:9,role:"admin"}, {ownerId:1}) === true` },
        { name: { en: "Unauthenticated user cannot delete", ar: "المستخدم غير المصادَق لا يستطيع الحذف" }, check: `canDeletePost(null, {ownerId:1}) === false` },
        { name: { en: "A different, non-admin user cannot delete someone else's post", ar: "مستخدم آخر غير مدير لا يستطيع حذف منشور غيره" }, check: `canDeletePost({id:2,role:"user"}, {ownerId:1}) === false` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: this platform's actual login flow 🔍

Everything in this lesson is exactly how you logged into this very site. Its Worker (\`worker/src/index.ts\`) implements GitHub OAuth end to end. When you click "Sign in," \`handleAuthGitHub\` generates a random \`state\` value, stores it in an HttpOnly cookie, and redirects you to GitHub — that \`state\` round-trip is CSRF protection: it proves the callback that comes back a moment later actually started from this site, not from an attacker's forged link.

After you approve on GitHub, \`handleAuthCallback\` exchanges the OAuth \`code\` for an access token, fetches your GitHub profile, and **upserts** you into the \`users\` table with a single SQL statement (\`ON CONFLICT(github_id) DO UPDATE ...\`) — the same insert-or-update pattern you'd design yourself for a first-time-vs-returning user. Only then does it call \`signJWT\`, which builds a token good for 30 days and signs it with HMAC-SHA256 using \`crypto.subtle\` — no third-party auth library, just the Web Crypto API this lesson's hashing concepts are built on.

Notice one deliberate, non-obvious detail: the finished token is appended to the redirect URL as a **fragment** (\`#token=...\`), not a query parameter (\`?token=...\`). Fragments never get sent to any server, never appear in server access logs, and never leak via the \`Referer\` header when the page loads another resource — a small choice that meaningfully reduces where a token could accidentally leak. On every later request, \`getUser\` reads the \`Authorization: Bearer <token>\` header and calls \`verifyJWT\`, which re-checks the HMAC signature and explicitly rejects any token missing an \`exp\` field or past its expiry — exactly the "authenticate first" step this lesson describes, running for real, on every single API call this platform serves.`,
        ar: `## دراسة حالة واقعية: تدفّق تسجيل الدخول الفعلي لهذه المنصة 🔍

كل ما في هذا الدرس هو بالضبط كيف سجّلت دخولك في هذا الموقع نفسه. الـ Worker الخاص به (\`worker/src/index.ts\`) ينفّذ OAuth عبر GitHub من طرف إلى طرف. حين تنقر "تسجيل الدخول"، تُنشئ \`handleAuthGitHub\` قيمة \`state\` عشوائية، وتخزّنها في كوكي HttpOnly، وتحوّلك إلى GitHub — رحلة \`state\` هذه ذهاباً وإياباً هي حماية CSRF: تثبت أن الاستدعاء الذي يعود لحظة لاحقاً بدأ فعلاً من هذا الموقع، لا من رابط مزوّر لمهاجم.

بعد موافقتك على GitHub، تستبدل \`handleAuthCallback\` كود OAuth \`code\` برمز وصول، وتجلب ملفك الشخصي من GitHub، ثم **تُدرِج أو تُحدِّث (upsert)** بياناتك في جدول \`users\` بجملة SQL واحدة (\`ON CONFLICT(github_id) DO UPDATE ...\`) — نفس نمط الإدراج-أو-التحديث الذي كنت لتصممه بنفسك لمستخدم جديد مقابل عائد. عندها فقط تستدعي \`signJWT\`، التي تبني رمزاً صالحاً لثلاثين يوماً وتوقّعه بـ HMAC-SHA256 باستخدام \`crypto.subtle\` — دون أي مكتبة مصادقة خارجية، فقط واجهة Web Crypto التي بُنيت عليها مفاهيم التجزئة في هذا الدرس.

لاحظ تفصيلاً مقصوداً وغير واضح للوهلة الأولى: الرمز النهائي يُلحَق برابط التحويل كـ**جزء (fragment)** (\`#token=...\`)، لا كمعامل استعلام (\`?token=...\`). الأجزاء لا تُرسَل أبداً لأي خادم، ولا تظهر أبداً في سجلات وصول الخادم، ولا تتسرّب عبر ترويسة \`Referer\` عند تحميل الصفحة لموردٍ آخر — خيار صغير يقلّل بشكل معتبر أماكن تسرّب الرمز المحتملة. في كل طلب لاحق، تقرأ \`getUser\` ترويسة \`Authorization: Bearer <token>\` وتستدعي \`verifyJWT\`، التي تُعيد فحص توقيع HMAC وترفض صراحة أي رمز يفتقد حقل \`exp\` أو تجاوز انتهاءه — بالضبط خطوة "صادِق أولاً" التي يصفها هذا الدرس، تعمل فعلياً في كل استدعاء API واحد تخدمه هذه المنصة.`,
      },
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
        {
          q: { en: "Why do real systems pair a short-lived access token with a refresh token?", ar: "لماذا تقرن الأنظمة الحقيقية رمز وصول قصير العمر برمز تحديث؟" },
          choices: [
            { en: "So a stolen access token expires quickly, while the refresh token silently renews access for legitimate users", ar: "كي ينتهي رمز الوصول المسروق بسرعة، بينما يجدّد رمز التحديث الوصول بصمت للمستخدمين الشرعيين" },
            { en: "To make login slower on purpose", ar: "لجعل تسجيل الدخول أبطأ عمداً" },
            { en: "Because JWTs cannot be signed otherwise", ar: "لأن JWT لا يمكن توقيعها بطريقة أخرى" },
          ],
          answer: 0,
          explain: {
            en: "Short expiry limits the damage of a leaked token; the more carefully stored refresh token keeps the user experience seamless.",
            ar: "الانتهاء القصير يحدّ من ضرر الرمز المسرّب؛ ورمز التحديث المخزَّن بحذر أكبر يبقي تجربة المستخدم سلسة.",
          },
        },
        {
          q: { en: "Why does this platform put the JWT in the redirect URL's fragment (#token=...) instead of a query parameter?", ar: "لماذا تضع هذه المنصة JWT في جزء رابط التحويل (#token=...) بدل معامل استعلام؟" },
          choices: [
            { en: "Fragments are never sent to servers or logged, reducing where the token could leak", ar: "الأجزاء لا تُرسَل أبداً للخوادم ولا تُسجَّل، ما يقلل أماكن تسرّب الرمز المحتملة" },
            { en: "Fragments make the token load faster", ar: "الأجزاء تجعل تحميل الرمز أسرع" },
            { en: "It has no security purpose, only style", ar: "لا غرض أمني له، مجرد أسلوب" },
          ],
          answer: 0,
          explain: {
            en: "Query params can end up in server logs, proxies, and the Referer header; URL fragments stay client-side only.",
            ar: "معاملات الاستعلام قد تنتهي في سجلات الخادم والوسطاء وترويسة Referer؛ أجزاء الرابط تبقى في المتصفح فقط.",
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
- You built a hash-based login check, then an authenticate-then-authorize permission check
- Short-lived access tokens + refresh tokens balance security with staying logged in; revocation is the classic JWT trade-off
- This platform's real GitHub OAuth flow does all of this — CSRF-safe state, HMAC-signed JWTs, and a fragment-based token handoff

**Security note:** you learned this properly — the same principles secure this very platform. **Next:** Node.js, a popular runtime for building these backends.`,
        ar: `## الخلاصة

- المصادقة (من؟) ثم التخويل (مسموح؟)
- لا تخزّن كلمات مرور صريحة — خزّن تجزئات باتجاه واحد (bcrypt/argon2 + ملح)
- رموز JWT تبقي المستخدمين مسجّلين دون إعادة إرسال كلمات المرور
- بنيت فحص دخول قائماً على التجزئة، ثم فحص صلاحية مصادقة-فتخويل
- رموز الوصول قصيرة العمر + رموز التحديث توازن الأمن مع البقاء مسجّلاً؛ الإبطال هو المقايضة الكلاسيكية لـ JWT
- تدفّق GitHub OAuth الحقيقي لهذه المنصة يفعل كل هذا — حالة آمنة من CSRF، ورموز JWT موقّعة بـ HMAC، وتسليم رمز عبر جزء الرابط

**ملاحظة أمنية:** تعلّمت هذا بشكل صحيح — نفس المبادئ تؤمّن هذه المنصة. **التالي:** Node.js، بيئة تشغيل شائعة لبناء هذه الخلفيات.`,
      },
    },
  ],
};
