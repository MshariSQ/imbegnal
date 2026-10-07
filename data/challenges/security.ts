import type { ChallengeMeta } from "../../shared/challenges";

/**
 * Public challenge metadata for tracks: cyber-security, reverse-engineering.
 * Matching graders: worker/src/graders/data/security.ts (flag hashes, hidden tests).
 *
 * Everything here ships to the browser: puzzle material is public by design, flags and hidden
 * tests are not. Reference solutions live in tests/fixtures/challenge-references/security.ts.
 */

// ── cyber-security ────────────────────────────────────────────────────────────

const authLogHunt: ChallengeMeta = {
  id: "sec-auth-log-hunt",
  track: "cyber-security",
  topic: "log-analysis",
  title: { en: "Who Got In?", ar: "مَن الذي دخل؟" },
  summary: {
    en: "One night of SSH logs, one account taken over. Find the address whose guessing finally paid off.",
    ar: "سجل SSH لليلة كاملة وحساب واحد جرى اختراقه. اعثر على العنوان الذي نجح تخمينه في النهاية.",
  },
  description: {
    en: `## The incident

A monitoring alert says that one account on **web01** was used by someone who should not have had access. Before it happened, a bot hammered the SSH daemon with password guesses. The night's \`sshd\` lines are in \`auth.log\` (48 lines, oldest first). One address is the attacker: it failed again and again, then got in.

The loudest address is **not** automatically the culprit. Be precise.

## Your task

Work with these rules:

1. Only consider source IPs that have **at least one** \`Accepted password\` line.
2. For each of them, count its \`Failed password\` lines (both \`Failed password for <user>\` and \`Failed password for invalid user <user>\`) that appear **before that IP's first** \`Accepted password\` line. Failures after the first success do not count.
3. The attacker is the IP with the highest count (it is unique).
4. Take \`user\`, the account name in that IP's first \`Accepted password\` line, and \`count\`, the number you counted in step 2.

## The flag

Join the three values with \`|\` as \`ip|user|count\`, compute the **SHA-256** of that text and keep the **first 16 hex characters**. The flag is \`IMB{\`, then those 16 characters, then \`}\`.

Worked example (a different incident): for the text \`10.0.0.1|bob|3\` the digest starts with \`b79194c8cb9fcfe3\`, so that incident's flag would be \`IMB{\` + \`b79194c8cb9fcfe3\` + \`}\`.

In Python: \`hashlib.sha256(text.encode()).hexdigest()[:16]\`. You can do it all in Code Lab, or by hand with a pencil if you are patient.`,
    ar: `## الحادثة

ينبّه نظام المراقبة إلى أن حساباً على الخادم **web01** استخدمه شخص لا يملك الصلاحية. قبل ذلك أمطر بوتٌ خدمةَ SSH بتخمينات كلمات المرور. أسطر \`sshd\` لتلك الليلة في الملف \`auth.log\` (48 سطراً، الأقدم أولاً). أحد العناوين هو المهاجم: فشل مراراً ثم دخل.

العنوان الأكثر ضجيجاً **ليس** بالضرورة هو الفاعل، فكن دقيقاً.

## المطلوب

التزم بهذه القواعد:

1. انظر فقط في عناوين IP المصدر التي لها **سطر \`Accepted password\` واحد على الأقل**.
2. لكل عنوان منها، عُدّ أسطر \`Failed password\` (بصيغتيها \`Failed password for <user>\` و\`Failed password for invalid user <user>\`) التي تظهر **قبل أول** سطر \`Accepted password\` لذلك العنوان. الإخفاقات بعد أول نجاح لا تُحتسب.
3. المهاجم هو العنوان صاحب أعلى عدد (وهو وحيد).
4. خذ \`user\` وهو اسم الحساب في أول سطر \`Accepted password\` لذلك العنوان، و\`count\` وهو العدد الذي حسبته في الخطوة 2.

## العلَم

اربط القيم الثلاث بالرمز \`|\` على الصورة \`ip|user|count\`، واحسب **SHA-256** لهذا النص، واحتفظ بـ**أول 16 خانة سداسية عشرية**. العلَم هو \`IMB{\` ثم هذه الخانات الست عشرة ثم \`}\`.

مثال محلول (حادثة أخرى): للنص \`10.0.0.1|bob|3\` يبدأ الناتج بـ \`b79194c8cb9fcfe3\`، فيكون علَم تلك الحادثة \`IMB{\` + \`b79194c8cb9fcfe3\` + \`}\`.

في بايثون: \`hashlib.sha256(text.encode()).hexdigest()[:16]\`. يمكنك إنجاز كل شيء في Code Lab، أو بالقلم والورقة إن كنت صبوراً.`,
  },
  difficulty: 1,
  points: 50,
  estMinutes: 15,
  kind: "flag",
  flagFormat: "IMB{...}",
  files: [
    {
      name: "auth.log",
      content: `Oct 14 03:02:00 web01 CRON[1893]: pam_unix(cron:session): session opened for user root(uid=0) by (uid=0)
Oct 14 03:02:01 web01 CRON[1893]: pam_unix(cron:session): session closed for user root
Oct 14 03:02:43 web01 sshd[2204]: Failed password for root from 203.0.113.45 port 48978 ssh2
Oct 14 03:08:45 web01 sshd[2205]: Failed password for sam from 198.51.100.200 port 57890 ssh2
Oct 14 03:10:00 web01 sshd[2207]: Accepted password for ana from 192.0.2.15 port 55996 ssh2
Oct 14 03:11:17 web01 sshd[2211]: Failed password for invalid user admin from 203.0.113.45 port 36430 ssh2
Oct 14 03:11:53 web01 sshd[2214]: Failed password for invalid user test from 203.0.113.45 port 56411 ssh2
Oct 14 03:12:02 web01 sshd[2218]: Failed password for sam from 198.51.100.200 port 55983 ssh2
Oct 14 03:13:25 web01 sshd[2222]: Failed password for invalid user oracle from 203.0.113.45 port 57071 ssh2
Oct 14 03:14:55 web01 sshd[2225]: Failed password for invalid user ubuntu from 203.0.113.45 port 43386 ssh2
Oct 14 03:16:27 web01 sshd[2229]: Failed password for mina from 192.0.2.77 port 36494 ssh2
Oct 14 03:18:16 web01 sshd[2230]: Accepted password for sam from 198.51.100.200 port 45155 ssh2
Oct 14 03:19:01 web01 sshd[2232]: Failed password for mina from 192.0.2.77 port 37762 ssh2
Oct 14 03:21:38 web01 sshd[2234]: Failed password for invalid user guest from 203.0.113.45 port 59007 ssh2
Oct 14 03:22:39 web01 sshd[2237]: Failed password for invalid user postgres from 203.0.113.45 port 40002 ssh2
Oct 14 03:23:18 web01 sshd[2241]: Failed password for root from 198.51.100.23 port 60118 ssh2
Oct 14 03:23:45 web01 sshd[2244]: Failed password for invalid user user from 203.0.113.45 port 52895 ssh2
Oct 14 03:26:29 web01 sshd[2245]: Failed password for root from 203.0.113.45 port 57446 ssh2
Oct 14 03:27:16 web01 sshd[2247]: Failed password for sam from 198.51.100.200 port 36863 ssh2
Oct 14 03:28:40 web01 sshd[2251]: Failed password for mina from 192.0.2.77 port 35553 ssh2
Oct 14 03:29:13 web01 sshd[2253]: Failed password for sam from 198.51.100.200 port 48951 ssh2
Oct 14 03:30:00 web01 systemd-logind[612]: New session 41 of user ana.
Oct 14 03:31:44 web01 sshd[2254]: Accepted password for mina from 192.0.2.77 port 36672 ssh2
Oct 14 03:32:52 web01 sshd[2258]: Failed password for invalid user admin from 198.51.100.23 port 42498 ssh2
Oct 14 03:33:10 web01 sshd[2259]: Failed password for invalid user ubuntu from 198.51.100.23 port 49854 ssh2
Oct 14 03:33:23 web01 sshd[2262]: Failed password for invalid user git from 198.51.100.23 port 40813 ssh2
Oct 14 03:33:26 web01 sshd[2263]: Failed password for deploy from 198.51.100.23 port 39693 ssh2
Oct 14 03:36:15 web01 sshd[2265]: Failed password for sam from 198.51.100.200 port 37122 ssh2
Oct 14 03:37:53 web01 sshd[2268]: Failed password for deploy from 198.51.100.23 port 54511 ssh2
Oct 14 03:38:48 web01 sshd[2272]: Failed password for sam from 198.51.100.200 port 46033 ssh2
Oct 14 03:40:11 web01 sshd[2276]: Failed password for deploy from 198.51.100.23 port 50730 ssh2
Oct 14 03:44:26 web01 sshd[2277]: Failed password for invalid user admin from 203.0.113.45 port 36774 ssh2
Oct 14 03:45:39 web01 sshd[2280]: Failed password for sam from 198.51.100.200 port 47542 ssh2
Oct 14 03:48:34 web01 sshd[2282]: Failed password for invalid user test from 203.0.113.45 port 58549 ssh2
Oct 14 03:49:14 web01 sshd[2283]: Failed password for sam from 198.51.100.200 port 33007 ssh2
Oct 14 03:50:00 web01 sshd[2287]: Accepted password for ana from 192.0.2.15 port 60254 ssh2
Oct 14 03:50:10 web01 sshd[2291]: Failed password for invalid user oracle from 203.0.113.45 port 41889 ssh2
Oct 14 03:53:03 web01 sshd[2294]: Failed password for deploy from 198.51.100.23 port 41007 ssh2
Oct 14 03:55:40 web01 systemd-logind[612]: Removed session 41.
Oct 14 03:56:09 web01 sshd[2296]: Failed password for sam from 198.51.100.200 port 49898 ssh2
Oct 14 04:01:29 web01 sshd[2300]: Failed password for sam from 198.51.100.200 port 44507 ssh2
Oct 14 04:02:47 web01 sshd[2304]: Failed password for deploy from 198.51.100.23 port 51965 ssh2
Oct 14 04:02:53 web01 sshd[2307]: Accepted password for deploy from 198.51.100.23 port 50073 ssh2
Oct 14 04:04:04 web01 sshd[2309]: Failed password for sam from 198.51.100.200 port 46342 ssh2
Oct 14 04:12:20 web01 sshd[2311]: Failed password for invalid user ubuntu from 203.0.113.45 port 56025 ssh2
Oct 14 04:15:00 web01 CRON[2210]: pam_unix(cron:session): session opened for user root(uid=0) by (uid=0)
Oct 14 04:15:01 web01 CRON[2210]: pam_unix(cron:session): session closed for user root
Oct 14 04:15:41 web01 sshd[2315]: Failed password for invalid user guest from 203.0.113.45 port 37781 ssh2
`,
      description: {
        en: "One night of sshd lines from web01, oldest first.",
        ar: "أسطر sshd لليلة واحدة من الخادم web01، الأقدم أولاً.",
      },
    },
  ],
  hints: [
    {
      text: {
        en: "Keep two numbers per IP, not one: how many failures it had **before its first success**. An address that never got in is not the attacker, and failures after a success are noise.",
        ar: "احتفظ برقمين لكل عنوان لا برقم واحد: عدد إخفاقاته **قبل أول نجاح له**. العنوان الذي لم يدخل أبداً ليس المهاجم، والإخفاقات بعد النجاح مجرد ضجيج.",
      },
      cost: 5,
    },
    {
      text: {
        en: "Walk the file from top to bottom. For every IP keep a counter and a flag \"already logged in\". On a failure, add one only while the flag is off. On an accepted login, switch the flag on and remember the user.",
        ar: "امشِ على الملف من الأعلى إلى الأسفل. لكل عنوان احتفظ بعدّاد وبعلامة \"سبق أن دخل\". عند الإخفاق أضف واحداً ما دامت العلامة مطفأة. وعند الدخول الناجح شغّل العلامة واحفظ اسم المستخدم.",
      },
      cost: 5,
    },
    {
      text: {
        en: "A regular expression like `(Failed|Accepted) password for (?:invalid user )?(\\S+) from (\\S+)` captures the verb, the user and the IP of every relevant line in one go.",
        ar: "تعبير نمطي مثل `(Failed|Accepted) password for (?:invalid user )?(\\S+) from (\\S+)` يلتقط الفعل والمستخدم وعنوان IP لكل سطر مهم دفعة واحدة.",
      },
      cost: 8,
    },
  ],
  lessons: ["cyber-security/soc", "cyber-security/python"],
  tags: ["logs", "ssh", "brute-force", "python", "hashing"],
  addedAt: "2026-10-07",
};

const saltedWordlist: ChallengeMeta = {
  id: "sec-salted-wordlist",
  track: "cyber-security",
  topic: "password-cracking",
  title: { en: "Salt Doesn't Save Weak Passwords", ar: "الملح لا ينقذ كلمات المرور الضعيفة" },
  summary: {
    en: "A leaked password table uses a home-made salted SHA-256 format. Replay a small wordlist against it and find the admin's password.",
    ar: "جدول كلمات مرور مسرَّب بصيغة SHA-256 مملّحة صُنعت محلياً. أعد تجربة قائمة كلمات صغيرة عليه واكتشف كلمة مرور المدير.",
  },
  description: {
    en: `## The leak

A small internal tool was breached and its password table, \`shadow.txt\`, ended up in your inbox. The developers knew passwords must be salted, so every account has its own random salt and nobody can use a ready-made rainbow table. The trouble is that people still pick passwords from a very short list of favourites. \`wordlist.txt\` is that list (106 candidates).

## Entry format

Each line is \`user:$imb1$<salt>$<digest>\`:

* \`<salt>\` is 8 lowercase hex characters, written in the line itself.
* \`<digest>\` is the lowercase hex **SHA-256** of the text \`<salt>:<password>\`, that is the salt, a colon, then the password, all as UTF-8 text.

A made-up entry to test your code against:

\`\`\`
demo:$imb1$a1b2c3d4$78ea1c9cb9370892c90770ba32e672a11ae51a041f25913996292e0e9c78edec
\`\`\`

Its password is \`hello\`, which is not on the real list. Check your hashing on it first: salt \`a1b2c3d4\` and \`hello\` must reproduce that digest.

## Your task

Recover the password of the account named \`admin\`. Every password in the table appears in \`wordlist.txt\`, spelled exactly as listed (case and punctuation matter).

## The flag

The flag is \`IMB{\`, then the **first 16 hex characters of the SHA-256 of the admin password alone** (no salt), then \`}\`.

Hint on tooling: Python's \`hashlib.sha256(...).hexdigest()\` is all you need, and the whole attack is a ten-line loop.`,
    ar: `## التسريب

اختُرقت أداة داخلية صغيرة ووصلك جدول كلمات المرور الخاص بها في الملف \`shadow.txt\`. كان المطوّرون يعلمون أن كلمات المرور يجب أن تُملَّح، فلكل حساب ملح عشوائي خاص به ولا يمكن لأحد استخدام جدول قوس قزح جاهز. المشكلة أن الناس ما زالوا يختارون كلمات مرورهم من قائمة قصيرة جداً من المفضّلات. والملف \`wordlist.txt\` هو هذه القائمة (106 مرشحين).

## صيغة السطر

كل سطر بالشكل \`user:$imb1$<salt>$<digest>\`:

* \`<salt>\` هو 8 خانات سداسية عشرية صغيرة مكتوبة في السطر نفسه.
* \`<digest>\` هو **SHA-256** بالأحرف السداسية الصغيرة للنص \`<salt>:<password>\`، أي الملح ثم نقطتان رأسيتان ثم كلمة المرور، كلها نصاً بترميز UTF-8.

سطر تجريبي مُختلَق لتختبر كودك عليه:

\`\`\`
demo:$imb1$a1b2c3d4$78ea1c9cb9370892c90770ba32e672a11ae51a041f25913996292e0e9c78edec
\`\`\`

كلمة مروره \`hello\` وهي ليست في القائمة الحقيقية. تحقق من التجزئة عليه أولاً: يجب أن يعيد الملح \`a1b2c3d4\` مع \`hello\` هذا الناتج نفسه.

## المطلوب

استرجع كلمة مرور الحساب المسمّى \`admin\`. كل كلمات المرور في الجدول موجودة في \`wordlist.txt\` مكتوبة كما هي تماماً (حالة الأحرف وعلامات الترقيم مهمة).

## العلَم

العلَم هو \`IMB{\` ثم **أول 16 خانة سداسية عشرية من SHA-256 لكلمة مرور المدير وحدها** (دون ملح) ثم \`}\`.

ملاحظة عن الأدوات: يكفيك \`hashlib.sha256(...).hexdigest()\` في بايثون، والهجوم كله حلقة من عشرة أسطر.`,
  },
  difficulty: 2,
  points: 100,
  estMinutes: 25,
  kind: "flag",
  flagFormat: "IMB{...}",
  files: [
    {
      name: "shadow.txt",
      content: `admin:$imb1$a3f24563$e06488d035467667e61215006aca7daad8dca680b26639cbb26d5a9af44085c1
mira:$imb1$cec0f476$92494400a89db8178854171dc4a4bedbe6037877f97a396455d02d972fde550e
omar:$imb1$1fd1b8db$cc2af96e442a16d84942dd8791b466281d1de8851dd060478728b00f96b21f2b
lina:$imb1$d9941cdb$99b91733118cc80ce207234697c60093ccc4e291b4efc02f3f5d8e6e6ee49a0b
backup:$imb1$fbec8686$7e80ce1e9a3e42abe63516a6a580c076bfecb4d524e7a5dd4af5da46d94d0065
`,
      description: { en: "The leaked table: one salted SHA-256 entry per account.", ar: "الجدول المسرَّب: سطر SHA-256 مملّح لكل حساب." },
    },
    {
      name: "wordlist.txt",
      content: `Summer2024
summer
charlie
tigger
banana
planet
nutella
kitten
123456
superman
cookie
lemon28
ashley
Temp#123
pancake
shadow
abc12345
Admin@123
winter
rocket
iloveyou
jaguar
hello123
zebra123
password
Autumn#2023
Changeme1
Baseball1
coffee
Qwerty!23
victory
batman
qwerty123
pepper
Harley123
passw0rd
Gandalf7
thunder
Arsenal14
jordan
dragon
Test1234
P@ssw0rd
Liverpool9
Matrix01
ranger
monkey
Welcome2024
flower
wizard
hunter
quality
Chelsea1
lovely
cheese
Sunshine1
Hunter42
magic
donald
master
ninja
Winter2024!
falcon
guitar
whatever
bailey
yellow
welcome1
michael
Backup#2024
hockey
samurai
Football!
Company1
golden
silver
Pass1234
admin123
Monkey123
Letmein!
Spring2025!
trustno1
unicorn
soccer
Mustang1
Frodo123
oreo123
Passw0rd!
rainbow
princess
letmein
orange
sunshine
Maverick
freedom
starwars
Barcelona10
football1
Trustno1!
Dragon99
purple
mango99
Secret99
pirate
killer
dolphin
`,
      description: { en: "106 candidate passwords, one per line.", ar: "106 كلمات مرور مرشحة، واحدة في كل سطر." },
    },
  ],
  hints: [
    {
      text: {
        en: "You cannot reverse a hash, but you can compute the hash of every candidate and compare. The salt is not a secret: it is stored next to the digest, so you simply use it as part of each guess.",
        ar: "لا يمكنك عكس التجزئة، لكن يمكنك حساب تجزئة كل مرشح ومقارنتها. الملح ليس سراً: فهو مخزَّن بجانب الناتج، فاستخدمه ببساطة جزءاً من كل تخمين.",
      },
      cost: 8,
    },
    {
      text: {
        en: "Rebuild the exact input the format describes: salt, then `:`, then the candidate, encoded as UTF-8. Validate your hashing on the `demo` line (the candidate `hello`) before you loop over the real table.",
        ar: "أعد بناء المدخل بالضبط كما تصف الصيغة: الملح ثم `:` ثم المرشح بترميز UTF-8. تحقق من تجزئتك على سطر `demo` (المرشح `hello`) قبل أن تدور على الجدول الحقيقي.",
      },
      cost: 12,
    },
    {
      text: {
        en: "Split each line with `line.split(\"$\")`: you get an empty string, `imb1`, the salt and the digest. Strip newlines from the wordlist lines, but do not change the case or drop punctuation.",
        ar: "قسّم كل سطر بـ `line.split(\"$\")`: ستحصل على نص فارغ ثم `imb1` ثم الملح ثم الناتج. أزل نهايات الأسطر من كلمات القائمة لكن لا تغيّر حالة الأحرف ولا تحذف علامات الترقيم.",
      },
      cost: 15,
    },
  ],
  lessons: ["cyber-security/cyber-basics", "cyber-security/python"],
  tags: ["hashing", "salt", "wordlist", "password-cracking", "python"],
  addedAt: "2026-10-07",
};

const cryptoLadder: ChallengeMeta = {
  id: "sec-crypto-ladder",
  track: "cyber-security",
  topic: "crypto",
  title: { en: "Three Notes, Three Layers", ar: "ثلاث رسائل وثلاث طبقات" },
  summary: {
    en: "Climb a three-rung ladder of classic encodings: a Caesar shift, hex wrapped around base64, and a repeating-key XOR you crack with a known-plaintext crib.",
    ar: "اصعد سلّماً من ثلاث درجات من التشفيرات الكلاسيكية: إزاحة قيصر، ثم ست عشري يلفّ base64، ثم XOR بمفتاح متكرر تكسره بنص معروف مسبقاً.",
  },
  description: {
    en: `## The story

During a training exercise, the blue team intercepted three notes passed between two "agents". Each note unlocks the next one, and the last one hides the flag. None of this is strong cryptography: it is a ladder of encodings and toy ciphers, and the point is to learn to recognise each of them.

## Your task

Read \`stage1.txt\`, \`stage2.txt\` and \`stage3.txt\` in order. Every note, once decoded, tells you how to handle the next one. Stage 1 is a classic **Caesar cipher** on the letters of an English sentence (digits and punctuation are untouched). You are not told the shift.

Submit the flag from the last note. It looks like \`IMB{...}\` and is the whole text after the \`FLAG=\` marker.

## Toolbox, with one tiny example each

* **Caesar**: shift every letter by the same amount along the alphabet. Shifting \`Hello\` by 3 gives \`Khoor\`, and shifting back by 3 undoes it. There are only 25 useful shifts, so you can try them all.
* **Hex**: two hexadecimal digits per byte. \`48 65 6c 6c 6f\` is the text \`Hello\`.
* **Base64**: a text-safe encoding of bytes. \`SGVsbG8=\` is the text \`Hello\`.
* **XOR with a repeating key**: byte \`i\` of the text is XORed with byte \`i mod k\` of a key of length \`k\`. For example \`A\` (0x41) XOR \`b\` (0x62) is 0x23. XOR is its own inverse: ciphertext XOR key gives the plaintext back, and **ciphertext XOR plaintext gives the key**.

Everything can be done with a few lines of Python or JavaScript in Code Lab.`,
    ar: `## القصة

خلال تمرين تدريبي، اعترض الفريق الأزرق ثلاث رسائل تبادلها "عميلان". كل رسالة تفتح التي بعدها، وآخرها يخفي العلَم. لا شيء من هذا تشفير قوي: إنه سلّم من الترميزات والشيفرات اللعبية، والهدف أن تتعلم التعرّف على كل منها.

## المطلوب

اقرأ \`stage1.txt\` ثم \`stage2.txt\` ثم \`stage3.txt\` بالترتيب. كل رسالة، بعد فك ترميزها، تخبرك كيف تتعامل مع التي تليها. المرحلة الأولى **شيفرة قيصر** كلاسيكية على حروف جملة إنجليزية (الأرقام وعلامات الترقيم لا تتغير). ولا يُقال لك مقدار الإزاحة.

أرسل العلَم من الرسالة الأخيرة. شكله \`IMB{...}\` وهو كل النص الذي يلي العلامة \`FLAG=\`.

## صندوق الأدوات، بمثال صغير لكل أداة

* **قيصر**: إزاحة كل حرف بالمقدار نفسه على الأبجدية. إزاحة \`Hello\` بمقدار 3 تعطي \`Khoor\`، والرجوع بمقدار 3 يلغيها. هناك 25 إزاحة مفيدة فقط، فيمكنك تجربتها كلها.
* **ست عشري (Hex)**: خانتان سداسيتان عشريتان لكل بايت. \`48 65 6c 6c 6f\` هو النص \`Hello\`.
* **Base64**: ترميز نصي آمن للبايتات. \`SGVsbG8=\` هو النص \`Hello\`.
* **XOR بمفتاح متكرر**: البايت \`i\` من النص يُجرى عليه XOR مع البايت \`i mod k\` من مفتاح طوله \`k\`. مثلاً \`A\` (0x41) XOR \`b\` (0x62) يساوي 0x23. وXOR عكس نفسه: الشيفرة XOR المفتاح تعيد النص الأصلي، و**الشيفرة XOR النص الأصلي تعطي المفتاح**.

يمكن إنجاز كل شيء ببضعة أسطر من بايثون أو جافاسكربت في Code Lab.`,
  },
  difficulty: 2,
  points: 120,
  estMinutes: 30,
  kind: "flag",
  flagFormat: "IMB{...}",
  files: [
    {
      name: "stage1.txt",
      content: `Dysu meha, hushkyj. Jxu dunj deju yi yd ijqwu2.jnj. Yj mqi udsetut myjx rqiu64 vyhij qdt jxud mhyjjud ekj yd xunqtusycqb, ie fuub evv rejx bqouhi je huqt yj.
`,
      description: { en: "Note 1: a Caesar-shifted English sentence.", ar: "الرسالة 1: جملة إنجليزية بإزاحة قيصر." },
    },
    {
      name: "stage2.txt",
      content: `563256736243426b6232356c4c694255614755676247467a644342756233526c49476c7a49476c7549484e305957646c4d7935306548517349486479615852305a57346759584d67614756344c69424a6443427063794259543149675a57356a636e6c776447566b4948647064476767595342795a58426c59585270626d6367613256354947396d4947563459574e3062486b674e5342696558526c637934675432356a5a53426b5a574e79655842305a5751734948526f5a5342305a58683049484e3059584a30637942336158526f49455a4d51556339494746755a434230614756754948526f5a53427a5a574e795a585175
`,
      description: { en: "Note 2: hexadecimal text.", ar: "الرسالة 2: نص بالنظام الست عشري." },
    },
    {
      name: "stage3.txt",
      content: `2a3c343d53253d37013f1f20252d14092030431d14163d42585d4330390525292207
`,
      description: { en: "Note 3: hexadecimal bytes of an XOR-encrypted message.", ar: "الرسالة 3: بايتات سداسية عشرية لرسالة مشفّرة بـ XOR." },
    },
  ],
  hints: [
    {
      text: {
        en: "Stage 1: there are only 25 possible shifts. Decode with each one and keep the output that reads as English. A line of code can print all 25.",
        ar: "المرحلة 1: لا توجد سوى 25 إزاحة ممكنة. فك الترميز بكل واحدة منها واحتفظ بالناتج الذي يُقرأ إنجليزية. يكفي سطر كود لطباعتها كلها.",
      },
      cost: 10,
    },
    {
      text: {
        en: "Stage 2: undo the layers in the order the note describes. Turn the hex into bytes, read those bytes as text, and then base64-decode that text. In Python: `bytes.fromhex(...)` then `base64.b64decode(...)`.",
        ar: "المرحلة 2: افكك الطبقات بالترتيب الذي تصفه الرسالة. حوّل الست عشري إلى بايتات، واقرأ هذه البايتات نصاً، ثم فكّ ترميز base64 لذلك النص. في بايثون: `bytes.fromhex(...)` ثم `base64.b64decode(...)`.",
      },
      cost: 15,
    },
    {
      text: {
        en: "Stage 3: you know the plaintext starts with `FLAG=`, which is exactly as long as the key. XOR the first 5 ciphertext bytes with those 5 characters to reveal the whole key, then XOR every byte with the key, repeating it.",
        ar: "المرحلة 3: أنت تعرف أن النص الأصلي يبدأ بـ `FLAG=` وهو بطول المفتاح تماماً. أجرِ XOR بين أول 5 بايتات من الشيفرة وهذه الأحرف الخمسة لينكشف المفتاح كاملاً، ثم أجرِ XOR لكل بايت مع المفتاح مكرراً.",
      },
      cost: 20,
    },
  ],
  lessons: ["cyber-security/cyber-basics", "cyber-security/python"],
  tags: ["crypto", "encoding", "caesar", "base64", "xor", "known-plaintext"],
  addedAt: "2026-10-07",
};

export const securityChallenges: ChallengeMeta[] = [authLogHunt, saltedWordlist, cryptoLadder];
