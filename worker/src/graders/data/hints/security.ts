import type { L10nText } from "../../../../../shared/challenges";

/**
 * SERVER-ONLY hint texts for the security (tracks: cyber-security, reverse-engineering) group, keyed by challenge id.
 * Matching public meta: data/challenges/security.ts, which carries only the per-hint COST
 * (same order, same count; worker/tests/challenges/parity.test.ts enforces it). The text is
 * returned by POST /api/challenges/:id/hint after the cost is charged and must never be
 * imported by the site or copied into shared/ or data/.
 */
export const securityHints: Record<string, L10nText[]> = {
  "sec-auth-log-hunt": [
    {
      en: "Keep two numbers per IP, not one: how many failures it had **before its first success**. An address that never got in is not the attacker, and failures after a success are noise.",
      ar: "احتفظ برقمين لكل عنوان لا برقم واحد: عدد إخفاقاته **قبل أول نجاح له**. العنوان الذي لم يدخل أبداً ليس المهاجم، والإخفاقات بعد النجاح مجرد ضجيج.",
    },
    {
      en: "Walk the file from top to bottom. For every IP keep a counter and a flag \"already logged in\". On a failure, add one only while the flag is off. On an accepted login, switch the flag on and remember the user.",
      ar: "امشِ على الملف من الأعلى إلى الأسفل. لكل عنوان احتفظ بعدّاد وبعلامة \"سبق أن دخل\". عند الإخفاق أضف واحداً ما دامت العلامة مطفأة. وعند الدخول الناجح شغّل العلامة واحفظ اسم المستخدم.",
    },
    {
      en: "A regular expression like `(Failed|Accepted) password for (?:invalid user )?(\\S+) from (\\S+)` captures the verb, the user and the IP of every relevant line in one go.",
      ar: "تعبير نمطي مثل `(Failed|Accepted) password for (?:invalid user )?(\\S+) from (\\S+)` يلتقط الفعل والمستخدم وعنوان IP لكل سطر مهم دفعة واحدة.",
    },
  ],
  "sec-salted-wordlist": [
    {
      en: "You cannot reverse a hash, but you can compute the hash of every candidate and compare. The salt is not a secret: it is stored next to the digest, so you simply use it as part of each guess.",
      ar: "لا يمكنك عكس التجزئة، لكن يمكنك حساب تجزئة كل مرشح ومقارنتها. الملح ليس سراً: فهو مخزَّن بجانب الناتج، فاستخدمه ببساطة جزءاً من كل تخمين.",
    },
    {
      en: "Rebuild the exact input the format describes: salt, then `:`, then the candidate, encoded as UTF-8. Validate your hashing on the `demo` line (the candidate `hello`) before you loop over the real table.",
      ar: "أعد بناء المدخل بالضبط كما تصف الصيغة: الملح ثم `:` ثم المرشح بترميز UTF-8. تحقق من تجزئتك على سطر `demo` (المرشح `hello`) قبل أن تدور على الجدول الحقيقي.",
    },
    {
      en: "Split each line with `line.split(\"$\")`: you get an empty string, `imb1`, the salt and the digest. Strip newlines from the wordlist lines, but do not change the case or drop punctuation.",
      ar: "قسّم كل سطر بـ `line.split(\"$\")`: ستحصل على نص فارغ ثم `imb1` ثم الملح ثم الناتج. أزل نهايات الأسطر من كلمات القائمة لكن لا تغيّر حالة الأحرف ولا تحذف علامات الترقيم.",
    },
  ],
  "sec-crypto-ladder": [
    {
      en: "Stage 1: there are only 25 possible shifts. Decode with each one and keep the output that reads as English. A line of code can print all 25.",
      ar: "المرحلة 1: لا توجد سوى 25 إزاحة ممكنة. فك الترميز بكل واحدة منها واحتفظ بالناتج الذي يُقرأ إنجليزية. يكفي سطر كود لطباعتها كلها.",
    },
    {
      en: "Stage 2: undo the layers in the order the note describes. Turn the hex into bytes, read those bytes as text, and then base64-decode that text. In Python: `bytes.fromhex(...)` then `base64.b64decode(...)`.",
      ar: "المرحلة 2: افكك الطبقات بالترتيب الذي تصفه الرسالة. حوّل الست عشري إلى بايتات، واقرأ هذه البايتات نصاً، ثم فكّ ترميز base64 لذلك النص. في بايثون: `bytes.fromhex(...)` ثم `base64.b64decode(...)`.",
    },
    {
      en: "Stage 3: you know the plaintext starts with `FLAG=`, which is exactly as long as the key. XOR the first 5 ciphertext bytes with those 5 characters to reveal the whole key, then XOR every byte with the key, repeating it.",
      ar: "المرحلة 3: أنت تعرف أن النص الأصلي يبدأ بـ `FLAG=` وهو بطول المفتاح تماماً. أجرِ XOR بين أول 5 بايتات من الشيفرة وهذه الأحرف الخمسة لينكشف المفتاح كاملاً، ثم أجرِ XOR لكل بايت مع المفتاح مكرراً.",
    },
  ],
  "sec-password-strength": [
    {
      en: "Find the pool by checking which character classes appear at all (lowercase, uppercase, digit, other) and adding their sizes. Punctuation and spaces share one class of 33.",
      ar: "اعثر على حجم المجموعة بفحص أي أصناف الأحرف تظهر أصلاً (صغيرة، كبيرة، رقم، آخر) وجمع أحجامها. علامات الترقيم والمسافات تشترك في صنف واحد حجمه 33.",
    },
    {
      en: "Rate with the exact value and round only when printing (`f\"{bits:.1f}\"` in Python, `bits.toFixed(1)` in JavaScript). Rounding first can push a password into the wrong band.",
      ar: "قيّم بالقيمة الدقيقة ولا تقرّب إلا عند الطباعة (`f\"{bits:.1f}\"` في بايثون، `bits.toFixed(1)` في جافاسكربت). التقريب أولاً قد ينقل كلمة المرور إلى الفئة الخطأ.",
    },
    {
      en: "Test the blacklist first, on the lower-cased password. An empty password has pool 0 and `log2(0)` is undefined, so handle that case explicitly and print `0.0 very weak`.",
      ar: "اختبر قائمة الحظر أولاً على كلمة المرور بعد تحويلها إلى أحرف صغيرة. كلمة المرور الفارغة مجموعتها 0 و`log2(0)` غير معرّفة، فعالج هذه الحالة صراحة واطبع `0.0 very weak`.",
    },
  ],
  "re-js-unmask": [
    {
      en: "Do not be scared by the escapes like `\\x41`: they are plain text written in a costly way. Find the line that decides ACCESS GRANTED and look at what `attempt` is compared with.",
      ar: "لا تخف من رموز مثل `\\x41`: إنها نص عادي مكتوب بطريقة مرهقة. اعثر على السطر الذي يقرر ACCESS GRANTED وانظر إلى ما تُقارَن به `attempt`.",
    },
    {
      en: "The secret has to exist in memory at the moment of comparison. You do not need to understand every step: you only need that one value. What could you add to the script to look at it?",
      ar: "لا بد أن يكون السر موجوداً في الذاكرة لحظة المقارنة. لست بحاجة إلى فهم كل خطوة، بل إلى تلك القيمة وحدها. ماذا يمكنك أن تضيف إلى السكربت لتراها؟",
    },
    {
      en: "The builder function joins the array pieces in the order given by the index list, base64-decodes them, XORs every byte with the repeating key `unmask`, and reverses the text. Call that function and print what it returns, or redo those steps yourself.",
      ar: "تضمّ دالة البناء قطع المصفوفة بالترتيب الذي تحدده قائمة الفهارس، وتفكّ ترميز base64، وتجري XOR لكل بايت مع المفتاح المتكرر `unmask`، ثم تعكس النص. استدعِ هذه الدالة واطبع ما تُرجعه، أو أعد هذه الخطوات بنفسك.",
    },
  ],
  "re-crackme-checker": [
    {
      en: "`check` has two stages: a loop over the characters that builds `out`, then a second loop that folds `out` from the end. A reverse-engineer undoes the LAST stage first.",
      ar: "في `check` مرحلتان: حلقة على المحارف تبني `out`، ثم حلقة ثانية تطوي `out` من النهاية. يبدأ المهندس العكسي بعكس المرحلة الأخيرة أولاً.",
    },
    {
      en: "After the fold, each final byte is `out[i] ^ final[i+1]` (the last one is just `out[15]`). So from the target table `_T` you get `out[i] = _T[i] ^ _T[i+1]` for i < 15 and `out[15] = _T[15]`.",
      ar: "بعد الطيّ، كل بايت نهائي هو `out[i] ^ final[i+1]` (والأخير هو `out[15]` وحده). فمن الجدول الهدف `_T` تحصل على `out[i] = _T[i] ^ _T[i+1]` لكل i < 15 و`out[15] = _T[15]`.",
    },
    {
      en: "Per character, from i = 0 (the running value `acc` depends on the earlier characters, so order matters): subtract `7 * i` modulo 256, rotate right by 3, XOR with the current `acc` to get the character code, then update `acc` with that recovered character exactly as the program does.",
      ar: "لكل محرف، ابتداءً من i = 0 (فالقيمة الجارية `acc` تعتمد على المحارف السابقة، فللترتيب أهمية): اطرح `7 * i` بمعيار 256، وأدِر لليمين بمقدار 3، ثم XOR مع `acc` الحالية لتحصل على رمز المحرف، ثم حدّث `acc` بذلك المحرف المسترجع تماماً كما يفعل البرنامج.",
    },
  ],
  "re-stack-vm": [
    {
      en: "The machine is just three things: the byte list, `pc` and the stack. Loop while `pc` is inside the program: read `code[pc]`, advance `pc`, then branch on the opcode. Instructions with an operand read the next byte and advance `pc` again.",
      ar: "الآلة ثلاثة أشياء فقط: قائمة البايتات و`pc` والمكدّس. كرّر ما دام `pc` داخل البرنامج: اقرأ `code[pc]` وقدّم `pc` ثم تفرّع حسب رمز العملية. التعليمات ذات المعامل تقرأ البايت التالي وتقدّم `pc` مرة أخرى.",
    },
    {
      en: "For binary operations pop `b` first and then `a`, and compute `a - b` and `a < b`, not the other way round. A conditional jump always pops its value, even when it is not taken, and then skips its operand byte.",
      ar: "في العمليات الثنائية اسحب `b` أولاً ثم `a`، واحسب `a - b` و`a < b` لا العكس. القفز الشرطي يسحب قيمته دائماً حتى لو لم يُنفَّذ، ثم يتخطى بايت معامله.",
    },
    {
      en: "Make faults explicit: check the stack depth before every pop, check that an operand byte exists, and check a jump target only when the jump is taken. Count executed instructions and stop with `LIMIT` before the 100001st. On any stop reason, print what the program produced and then `FAULT` or `LIMIT` immediately.",
      ar: "اجعل الأعطال صريحة: افحص عمق المكدّس قبل كل سحب، وافحص وجود بايت المعامل، وافحص هدف القفز فقط عندما يُنفَّذ. عُدّ التعليمات المنفَّذة وتوقف بـ `LIMIT` قبل التعليمة رقم 100001. وعند أي سبب إيقاف اطبع ما أنتجه البرنامج ثم `FAULT` أو `LIMIT` مباشرة.",
    },
  ],
};
