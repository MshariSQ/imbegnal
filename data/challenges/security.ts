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
    { cost: 5 },
    { cost: 5 },
    { cost: 8 },
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
    { cost: 8 },
    { cost: 12 },
    { cost: 15 },
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
    { cost: 10 },
    { cost: 15 },
    { cost: 20 },
  ],
  lessons: ["cyber-security/cyber-basics", "cyber-security/python"],
  tags: ["crypto", "encoding", "caesar", "base64", "xor", "known-plaintext"],
  addedAt: "2026-10-07",
};

const passwordStrength: ChallengeMeta = {
  id: "sec-password-strength",
  track: "cyber-security",
  topic: "authentication",
  title: { en: "Password Strength Meter", ar: "مقياس قوة كلمة المرور" },
  summary: {
    en: "Turn character pools and length into entropy bits, add a common-password blacklist, and rate each password like a real sign-up form would.",
    ar: "حوّل حجم مجموعة الأحرف والطول إلى بتّات إنتروبيا، وأضف قائمة حظر لكلمات المرور الشائعة، ثم قيّم كل كلمة مرور كما يفعل نموذج تسجيل حقيقي.",
  },
  description: {
    en: `## The story

The sign-up form of your startup needs a strength meter, and the security lead wants one that is based on **entropy** rather than "has a symbol". You are writing the scoring engine as a standalone program: passwords in, scores out.

## Input

The first line is \`N\` (1 ≤ N ≤ 100). Then come \`N\` lines, one password per line. Passwords are printable ASCII (letters, digits, punctuation and spaces inside the text), are at most 200 characters long and never start or end with a space. A password **can be empty** (an empty line).

## Rules

1. **Pool size.** Start at 0 and add 26 if the password contains a lowercase letter, 26 for an uppercase letter, 10 for a digit and 33 if it contains any other character (punctuation or a space; those count once, together).
2. **Entropy** in bits is \`length × log2(pool)\`. An empty password has 0 bits.
3. **Blacklist.** If the password, compared case-insensitively, is one of \`password\`, \`123456\`, \`12345678\`, \`qwerty\`, \`abc123\`, \`letmein\`, \`iloveyou\`, \`admin\`, its entropy is 0 whatever rule 2 says: attackers try these first.
4. **Rating** from the exact (unrounded) entropy: below 28 is \`very weak\`, below 36 \`weak\`, below 60 \`reasonable\`, below 128 \`strong\`, otherwise \`very strong\`.

## Output

For each password print one line: the entropy rounded to **one decimal place**, a space, and the rating.

## Examples

Input:

\`\`\`
3
hunter2
correct horse battery staple
PASSWORD
\`\`\`

Output:

\`\`\`
36.2 reasonable
164.7 very strong
0.0 very weak
\`\`\`

\`hunter2\` uses lowercase and a digit (pool 36), so 7 × log2(36) ≈ 36.2. The passphrase uses lowercase letters and spaces (pool 59), so 28 × log2(59) ≈ 164.7. \`PASSWORD\` is blacklisted.

Input:

\`\`\`
2
Tr0ub4dor&3
abc
\`\`\`

Output:

\`\`\`
72.3 strong
14.1 very weak
\`\`\`

Input:

\`\`\`
1
123456789012
\`\`\`

Output:

\`\`\`
39.9 reasonable
\`\`\`

Entropy assumes every character is drawn uniformly at random from the pool, which people never do. That is why real systems also check blacklists, and why **length** buys more than "complexity" rules.`,
    ar: `## القصة

يحتاج نموذج التسجيل في شركتك الناشئة إلى مقياس للقوة، ويريده مسؤول الأمن مبنياً على **الإنتروبيا** لا على "يحتوي رمزاً". أنت تكتب محرّك التقييم كبرنامج مستقل: كلمات مرور تدخل ودرجات تخرج.

## الدخل

السطر الأول هو \`N\` (1 ≤ N ≤ 100). ثم \`N\` سطراً، في كل سطر كلمة مرور. كلمات المرور من محارف ASCII القابلة للطباعة (حروف وأرقام وعلامات ترقيم ومسافات داخل النص)، لا يزيد طولها على 200 محرف، ولا تبدأ بمسافة ولا تنتهي بها. ويمكن أن تكون كلمة المرور **فارغة** (سطر فارغ).

## القواعد

1. **حجم المجموعة.** ابدأ من 0 وأضف 26 إن احتوت كلمة المرور حرفاً صغيراً، و26 لحرف كبير، و10 لرقم، و33 إن احتوت أي محرف آخر (علامة ترقيم أو مسافة؛ وهذه تُحسب مرة واحدة معاً).
2. **الإنتروبيا** بالبت هي \`length × log2(pool)\`. وكلمة المرور الفارغة إنتروبياها 0.
3. **قائمة الحظر.** إن كانت كلمة المرور، بمقارنة غير حسّاسة لحالة الأحرف، إحدى \`password\` و\`123456\` و\`12345678\` و\`qwerty\` و\`abc123\` و\`letmein\` و\`iloveyou\` و\`admin\` فإنتروبياها 0 مهما قالت القاعدة 2: فالمهاجمون يجرّبونها أولاً.
4. **التقييم** من الإنتروبيا الدقيقة (قبل التقريب): أقل من 28 هو \`very weak\`، وأقل من 36 هو \`weak\`، وأقل من 60 هو \`reasonable\`، وأقل من 128 هو \`strong\`، وغير ذلك \`very strong\`.

## الخرج

لكل كلمة مرور اطبع سطراً: الإنتروبيا مقرَّبة إلى **منزلة عشرية واحدة**، ثم مسافة، ثم التقييم.

## أمثلة

الدخل:

\`\`\`
3
hunter2
correct horse battery staple
PASSWORD
\`\`\`

الخرج:

\`\`\`
36.2 reasonable
164.7 very strong
0.0 very weak
\`\`\`

تستخدم \`hunter2\` حروفاً صغيرة ورقماً (المجموعة 36) فيكون 7 × log2(36) ≈ 36.2. وتستخدم عبارة المرور حروفاً صغيرة ومسافات (المجموعة 59) فيكون 28 × log2(59) ≈ 164.7. أما \`PASSWORD\` فمحظورة.

الدخل:

\`\`\`
2
Tr0ub4dor&3
abc
\`\`\`

الخرج:

\`\`\`
72.3 strong
14.1 very weak
\`\`\`

الدخل:

\`\`\`
1
123456789012
\`\`\`

الخرج:

\`\`\`
39.9 reasonable
\`\`\`

تفترض الإنتروبيا أن كل محرف يُسحب عشوائياً بانتظام من المجموعة، وهذا ما لا يفعله الناس أبداً. لذلك تفحص الأنظمة الحقيقية قوائم الحظر أيضاً، ولذلك يمنحك **الطول** أكثر مما تمنحه قواعد "التعقيد".`,
  },
  difficulty: 2,
  points: 100,
  estMinutes: 20,
  kind: "output",
  lang: "python",
  sampleInput: "3\nhunter2\ncorrect horse battery staple\nPASSWORD\n",
  starterCode: {
    python: `import math
import sys

lines = sys.stdin.read().split("\\n")
n = int(lines[0])
for password in lines[1:1 + n]:
    # Your turn: pool size, entropy in bits, rating.
    print("?")
`,
    javascript: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const n = parseInt(lines[0], 10);
for (const password of lines.slice(1, 1 + n)) {
  // Your turn: pool size, entropy in bits, rating.
  console.log("?");
}
`,
    c: `#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    char line[512];
    if (!fgets(line, sizeof line, stdin)) return 0;
    int n = atoi(line);
    for (int i = 0; i < n; i++) {
        if (!fgets(line, sizeof line, stdin)) line[0] = '\\0';
        line[strcspn(line, "\\r\\n")] = '\\0';
        /* Your turn: pool size, entropy in bits, rating. */
        printf("?\\n");
    }
    return 0;
}
`,
  },
  hints: [
    { cost: 8 },
    { cost: 12 },
    { cost: 15 },
  ],
  lessons: ["cyber-security/cyber-basics", "cyber-security/python"],
  tags: ["entropy", "passwords", "authentication", "python", "math"],
  addedAt: "2026-10-07",
};

// ── reverse-engineering ───────────────────────────────────────────────────────

const jsUnmask: ChallengeMeta = {
  id: "re-js-unmask",
  track: "reverse-engineering",
  topic: "deobfuscation",
  title: { en: "Obfuscation Is Not Encryption", ar: "التعتيم ليس تشفيراً" },
  summary: {
    en: "A contractor hid a secret in obfuscated JavaScript. Peel the encoding layers, or make the program hand the secret over, to recover it.",
    ar: "أخفى مقاول سراً داخل جافاسكربت معتَّمة. قشّر طبقات الترميز، أو اجعل البرنامج نفسه يسلّمك السر، لتستعيده.",
  },
  description: {
    en: `## The story

A freelancer left \`vault.js\` behind: the "access control" of an internal demo page. The only accepted password is stored inside the script, and the owner insists it is safe because the source code is obfuscated. It is an hour of work for you to prove otherwise.

## Your task

Open \`vault.js\`. It compares the variable \`attempt\` with a secret and prints \`ACCESS GRANTED\` or \`ACCESS DENIED\`. The only attempt that is accepted is the flag, which has the shape \`IMB{...}\`.

You can solve it two ways, and both are legitimate reverse-engineering:

* **Static analysis:** read the code and undo, by hand or with your own script, what it does to build the secret.
* **Dynamic analysis:** run it in Code Lab (JavaScript) and get the program to reveal the value it compares against.

The program never reads input and needs no network. Brute-forcing \`attempt\` is pointless: the comparison is exact.

## Things worth knowing

* The escape \`"\\x68\\x69"\` is just the text \`hi\`, and \`obj["\\x70\\x75\\x73\\x68"](x)\` is \`obj.push(x)\`. Hex escapes hide names from a casual reader, not from the interpreter.
* \`atob("aGk=")\` decodes base64 and returns \`hi\`.
* XOR undoes itself: \`(a ^ k) ^ k === a\`.

Submit the recovered flag.`,
    ar: `## القصة

ترك مستقلٌّ ملف \`vault.js\` خلفه: "التحكم في الوصول" لصفحة عرض داخلية. كلمة المرور المقبولة الوحيدة مخزّنة داخل السكربت، ويصرّ المالك على أنها آمنة لأن الشيفرة معتَّمة. ساعة عمل منك تكفي لإثبات العكس.

## المطلوب

افتح \`vault.js\`. يقارن المتغير \`attempt\` بسرّ ما ثم يطبع \`ACCESS GRANTED\` أو \`ACCESS DENIED\`. والمحاولة الوحيدة المقبولة هي العلَم الذي شكله \`IMB{...}\`.

يمكنك الحل بطريقتين، وكلتاهما هندسة عكسية مشروعة:

* **التحليل الساكن:** اقرأ الشيفرة وتراجع، يدوياً أو بسكربت من كتابتك، عمّا تفعله لبناء السر.
* **التحليل الديناميكي:** شغّلها في Code Lab (جافاسكربت) واجعل البرنامج يكشف القيمة التي يقارن بها.

لا يقرأ البرنامج أي دخل ولا يحتاج شبكة. التخمين العشوائي لـ \`attempt\` بلا فائدة: فالمقارنة دقيقة.

## معلومات مفيدة

* الرمز \`"\\x68\\x69"\` هو النص \`hi\` فقط، و\`obj["\\x70\\x75\\x73\\x68"](x)\` هو \`obj.push(x)\`. تخفي هذه الرموز الأسماء عن القارئ العابر لا عن المفسِّر.
* \`atob("aGk=")\` يفكّ ترميز base64 ويُرجع \`hi\`.
* XOR يلغي نفسه: \`(a ^ k) ^ k === a\`.

أرسل العلَم الذي استرجعته.`,
  },
  difficulty: 1,
  points: 50,
  estMinutes: 15,
  kind: "flag",
  flagFormat: "IMB{...}",
  files: [
    {
      name: "vault.js",
      content: `// vault.js: client-side "access control" for an internal demo page.
// The owner says the secret is safe because the source is obfuscated.
const _0x3c1e = ['\\x43\\x42\\x73\\x67\\x47\\x78\\x6b\\x36\\x47', '\\x63\\x6b\\x56\\x30\\x49\\x4e\\x47\\x54\\x51', '\\x41\\x45\\x4b\\x56\\x68\\x6f\\x54\\x4a\\x78', '\\x47\\x47\\x6a\\x45\\x6d\\x50\\x41\\x3d\\x3d'];
(function (_0x2b, _0x4d) {
  const _0x1f = function (_0x5a) {
    while (--_0x5a) {
      _0x2b['\\x70\\x75\\x73\\x68'](_0x2b['\\x73\\x68\\x69\\x66\\x74']());
    }
  };
  _0x1f(++_0x4d);
})(_0x3c1e, 0x92);

const _0x2e9a = function (_0x1a) {
  return _0x3c1e[_0x1a];
};

const _0x6d = [0x2, 0x0, 0x3, 0x1];
const _0x9b = [0x75, 0x6e, 0x6d, 0x61, 0x73, 0x6b];

function _0x71() {
  let _0xa = '';
  for (let _0xi = 0x0; _0xi < _0x6d['\\x6c\\x65\\x6e\\x67\\x74\\x68']; _0xi++) {
    _0xa += _0x2e9a(_0x6d[_0xi]);
  }
  const _0xb = atob(_0xa);
  let _0xc = '';
  for (let _0xi = 0x0; _0xi < _0xb['\\x6c\\x65\\x6e\\x67\\x74\\x68']; _0xi++) {
    _0xc += String['\\x66\\x72\\x6f\\x6d\\x43\\x68\\x61\\x72\\x43\\x6f\\x64\\x65'](_0xb['\\x63\\x68\\x61\\x72\\x43\\x6f\\x64\\x65\\x41\\x74'](_0xi) ^ _0x9b[_0xi % _0x9b['\\x6c\\x65\\x6e\\x67\\x74\\x68']]);
  }
  return _0xc['\\x73\\x70\\x6c\\x69\\x74']('')['\\x72\\x65\\x76\\x65\\x72\\x73\\x65']()['\\x6a\\x6f\\x69\\x6e']('');
}

function _0x90(_0xin) {
  return _0xin === _0x71();
}

// Try your luck: change the guess below.
const attempt = 'hunter2';
console.log(_0x90(attempt) ? 'ACCESS GRANTED' : 'ACCESS DENIED');
`,
      description: { en: "The obfuscated script. Runs as is in Code Lab (JavaScript).", ar: "السكربت المعتَّم. يعمل كما هو في Code Lab (جافاسكربت)." },
    },
  ],
  hints: [
    { cost: 5 },
    { cost: 5 },
    { cost: 8 },
  ],
  lessons: ["reverse-engineering/static-analysis-deobfuscation", "frontend/javascript"],
  tags: ["javascript", "obfuscation", "deobfuscation", "base64", "xor", "static-analysis"],
  addedAt: "2026-10-07",
};

const crackme: ChallengeMeta = {
  id: "re-crackme-checker",
  track: "reverse-engineering",
  topic: "crackme",
  title: { en: "Crackme: The Licence Check", ar: "كراك مي: فحص الترخيص" },
  summary: {
    en: "A Python licence checker accepts exactly one 16-character serial. Read it, invert its two stages, and recover the serial instead of guessing.",
    ar: "فاحص ترخيص بلغة بايثون يقبل رقماً تسلسلياً واحداً فقط من 16 محرفاً. اقرأه وعكس مرحلتيه واستعد الرقم بدل التخمين.",
  },
  description: {
    en: `## The story

You are handed \`crackme.py\`, the licence check of a small note-taking app. It reads one line (the serial) from standard input and prints \`licence accepted\` or \`invalid serial\`. You have no vendor, no keygen and no patience for 62^16 guesses. You do have the source, so you can reason about it.

## Your task

Find the one serial that makes the program print \`licence accepted\`. A serial is 16 characters from \`A-Z\`, \`a-z\` and \`0-9\`. The flag is \`IMB{\`, the serial, then \`}\`.

You can run the program in Code Lab (Python), feed it candidate serials on standard input, and add \`print\` calls to look inside. Typing random serials will not get you anywhere. The check has structure you can undo:

* Read it as a sequence of **stages** and work out which operations are reversible.
* Undo the stages in the **opposite order** to the one the program runs them.
* Some state (the variable the loop carries from one character to the next) depends on characters you have already recovered, so rebuild it as you go.

## Bit tricks used, with an example

* \`^\` is XOR. It undoes itself: \`(a ^ k) ^ k == a\`.
* \`& 0xFF\` keeps a value inside one byte. Addition modulo 256 is undone by subtracting modulo 256.
* A **rotate left by 3** inside one byte moves the top three bits to the bottom: \`0x96\` (\`10010110\`) becomes \`0xB4\` (\`10110100\`). Rotating **right** by 3 undoes it.

There is exactly one accepted serial.`,
    ar: `## القصة

وصلك الملف \`crackme.py\`، وهو فحص الترخيص في تطبيق صغير لتدوين الملاحظات. يقرأ سطراً واحداً (الرقم التسلسلي) من الدخل القياسي ويطبع \`licence accepted\` أو \`invalid serial\`. ليس عندك بائع ولا مولّد مفاتيح ولا صبر على 62^16 تخميناً. لكن عندك الشيفرة المصدرية، فيمكنك أن تستنتج.

## المطلوب

اعثر على الرقم التسلسلي الوحيد الذي يجعل البرنامج يطبع \`licence accepted\`. الرقم من 16 محرفاً من \`A-Z\` و\`a-z\` و\`0-9\`. والعلَم هو \`IMB{\` ثم الرقم ثم \`}\`.

يمكنك تشغيل البرنامج في Code Lab (بايثون) وتغذيته بأرقام مرشحة عبر الدخل القياسي وإضافة استدعاءات \`print\` لتنظر بداخله. كتابة أرقام عشوائية لن توصلك إلى شيء. في الفحص بنية يمكنك عكسها:

* اقرأه كسلسلة من **المراحل** وحدّد أي العمليات قابلة للعكس.
* افكك المراحل بالترتيب **المعاكس** للترتيب الذي ينفّذه البرنامج.
* بعض الحالة (المتغير الذي تحمله الحلقة من محرف إلى التالي) يعتمد على محارف استرجعتها بالفعل، فأعد بناءه أثناء تقدمك.

## حيل البتّات المستخدمة، مع مثال

* \`^\` هو XOR وهو يلغي نفسه: \`(a ^ k) ^ k == a\`.
* \`& 0xFF\` تُبقي القيمة داخل بايت واحد. والجمع بمعيار 256 يُلغى بالطرح بمعيار 256.
* **الدوران لليسار بمقدار 3** داخل بايت واحد ينقل أعلى ثلاث بتّات إلى الأسفل: يصير \`0x96\` (\`10010110\`) هو \`0xB4\` (\`10110100\`). والدوران **لليمين** بمقدار 3 يلغيه.

يوجد رقم تسلسلي مقبول واحد بالضبط.`,
  },
  difficulty: 3,
  points: 200,
  estMinutes: 40,
  kind: "flag",
  flagFormat: "IMB{...}",
  files: [
    {
      name: "crackme.py",
      content: `"""SnapNote Pro licence check (demo build).

Type your 16-character serial on one line, for example:  echo ABCDEFGHJKLMNPQR | python crackme.py
"""
import sys

_A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
_T = bytes.fromhex("4050605844e2dc532748589511b71a96")


def _rol(v, n):
    return ((v << n) | (v >> (8 - n))) & 0xFF


def check(serial):
    if len(serial) != 16 or any(c not in _A for c in serial):
        return False
    acc, out = 0x5A, []
    for i, ch in enumerate(serial):
        c = ord(ch)
        out.append((_rol((c ^ acc) & 0xFF, 3) + 7 * i) & 0xFF)
        acc = (acc * 3 + c + i) & 0xFF
    for i in range(14, -1, -1):
        out[i] ^= out[i + 1]
    return bytes(out) == _T


if __name__ == "__main__":
    entered = sys.stdin.readline().strip()
    print("licence accepted" if check(entered) else "invalid serial")
`,
      description: { en: "The licence checker. Reads the serial from standard input.", ar: "فاحص الترخيص. يقرأ الرقم التسلسلي من الدخل القياسي." },
    },
  ],
  hints: [
    { cost: 20 },
    { cost: 25 },
    { cost: 30 },
  ],
  lessons: ["reverse-engineering/static-analysis-deobfuscation", "reverse-engineering/assembly-basics"],
  tags: ["crackme", "python", "bit-manipulation", "xor", "static-analysis"],
  addedAt: "2026-10-07",
};

const stackVm: ChallengeMeta = {
  id: "re-stack-vm",
  track: "reverse-engineering",
  topic: "virtual-machines",
  title: { en: "Run the Bytecode: A Tiny Stack VM", ar: "شغّل الشيفرة الثنائية: آلة مكدّس افتراضية صغيرة" },
  summary: {
    en: "Implement the interpreter of a 15-opcode stack machine from its opcode table, and run bytecode that counts, loops, prints text and sometimes crashes on purpose.",
    ar: "نفّذ مفسِّر آلة مكدّس ذات 15 رمز عملية انطلاقاً من جدول الرموز، وشغّل شيفرة ثنائية تعدّ وتكرّر وتطبع نصاً وتنهار أحياناً عن قصد.",
  },
  description: {
    en: `## The story

Malware analysts, game modders and language designers all meet the same shape sooner or later: a **virtual machine**. A program is not machine code, it is a list of bytes that a small interpreter decodes one instruction at a time. To understand such a program you first need the interpreter. Today you write it.

The \`STK1\` machine has a **stack** of integers and a **program counter** (\`pc\`) that starts at 0. The program is a list of bytes. The machine repeats: read the opcode at \`pc\`, advance \`pc\`, execute it.

## Opcodes

| Hex | Name | Operand | Effect |
|---|---|---|---|
| \`00\` | HALT | none | stop the program |
| \`01\` | PUSH | 1 byte \`n\` (0-255) | push \`n\` |
| \`02\` | ADD | none | pop \`b\`, pop \`a\`, push \`a + b\` |
| \`03\` | SUB | none | pop \`b\`, pop \`a\`, push \`a - b\` |
| \`04\` | MUL | none | pop \`b\`, pop \`a\`, push \`a * b\` |
| \`05\` | DUP | none | push a copy of the top value |
| \`06\` | SWAP | none | exchange the top two values |
| \`07\` | POP | none | discard the top value |
| \`08\` | PRINT | none | pop a value and print it in decimal followed by a newline |
| \`09\` | PRINTC | none | pop a value and print the ASCII character with that code (no newline) |
| \`0A\` | JMP | 1 byte \`addr\` | set \`pc\` to \`addr\` |
| \`0B\` | JZ | 1 byte \`addr\` | pop a value; if it is 0 set \`pc\` to \`addr\` |
| \`0C\` | JNZ | 1 byte \`addr\` | pop a value; if it is not 0 set \`pc\` to \`addr\` |
| \`0D\` | LT | none | pop \`b\`, pop \`a\`, push 1 if \`a < b\`, else 0 |
| \`0E\` | OVER | none | push a copy of the second value from the top (\`a b\` becomes \`a b a\`) |

An operand byte follows its opcode in the program, so those instructions are two bytes long. Jump addresses are absolute positions in the program (the first byte is address 0). If a conditional jump is **not** taken, execution continues after its operand.

## Ending the run

* Executing \`HALT\`, or running past the last byte of the program, ends it normally.
* A **fault** ends it at once and prints \`FAULT\` followed by a newline right after whatever was already printed. A fault is: an unknown opcode, an instruction that needs more values than the stack holds, an operand byte missing at the end of the program, or a **taken** jump to an address that is at or beyond the program length.
* A program that has executed **100000** instructions is stopped before the next one: print \`LIMIT\` and a newline. (Real sandboxes need such a watchdog.)

## Input and output

The input is the program as hexadecimal byte values (one or two digits each, upper or lower case) separated by any whitespace, possibly across several lines. The program has at most 255 bytes, and an empty input is an empty program. Print whatever the program prints. Values fit in a signed 64-bit integer in every test.

## Examples

Input:

\`\`\`
01 03 05 08 01 01 03 05 0C 02 00
\`\`\`

Output:

\`\`\`
3
2
1
\`\`\`

Read as assembly: \`PUSH 3\`, then a loop at address 2 \`DUP, PRINT, PUSH 1, SUB, DUP, JNZ 2\`, then \`HALT\`.

Input:

\`\`\`
01 06 01 07 04 08 01 0A 01 04 03 08
\`\`\`

Output:

\`\`\`
42
6
\`\`\`

Input:

\`\`\`
01 4F 09 01 4B 09 01 0A 09
\`\`\`

Output:

\`\`\`
OK
\`\`\`

The hidden tests run much more than these three: loops, text, every fault, the instruction limit and awkward formatting.`,
    ar: `## القصة

يصادف محلّلو البرمجيات الخبيثة ومعدّلو الألعاب ومصمّمو اللغات الشكلَ نفسه عاجلاً أو آجلاً: **الآلة الافتراضية**. البرنامج ليس شيفرة آلة، بل قائمة بايتات يفكّ مفسِّر صغير ترميزها تعليمة بتعليمة. ولكي تفهم برنامجاً كهذا تحتاج أولاً إلى مفسِّره. وأنت اليوم تكتبه.

تملك الآلة \`STK1\` **مكدّساً** من الأعداد الصحيحة و**عدّاد برنامج** (\`pc\`) يبدأ من 0. والبرنامج قائمة بايتات. تكرّر الآلة: اقرأ رمز العملية عند \`pc\`، وقدّم \`pc\`، ونفّذ.

## رموز العمليات

| ست عشري | الاسم | المعامل | الأثر |
|---|---|---|---|
| \`00\` | HALT | لا يوجد | أوقف البرنامج |
| \`01\` | PUSH | بايت واحد \`n\` (0-255) | ادفع \`n\` |
| \`02\` | ADD | لا يوجد | اسحب \`b\` ثم \`a\` وادفع \`a + b\` |
| \`03\` | SUB | لا يوجد | اسحب \`b\` ثم \`a\` وادفع \`a - b\` |
| \`04\` | MUL | لا يوجد | اسحب \`b\` ثم \`a\` وادفع \`a * b\` |
| \`05\` | DUP | لا يوجد | ادفع نسخة من القيمة العليا |
| \`06\` | SWAP | لا يوجد | بدّل أعلى قيمتين |
| \`07\` | POP | لا يوجد | تخلَّ عن القيمة العليا |
| \`08\` | PRINT | لا يوجد | اسحب قيمة واطبعها بالنظام العشري يتبعها سطر جديد |
| \`09\` | PRINTC | لا يوجد | اسحب قيمة واطبع محرف ASCII الذي له هذا الرمز (دون سطر جديد) |
| \`0A\` | JMP | بايت واحد \`addr\` | اجعل \`pc\` يساوي \`addr\` |
| \`0B\` | JZ | بايت واحد \`addr\` | اسحب قيمة؛ فإن كانت 0 فاجعل \`pc\` يساوي \`addr\` |
| \`0C\` | JNZ | بايت واحد \`addr\` | اسحب قيمة؛ فإن لم تكن 0 فاجعل \`pc\` يساوي \`addr\` |
| \`0D\` | LT | لا يوجد | اسحب \`b\` ثم \`a\` وادفع 1 إن كان \`a < b\` وإلا 0 |
| \`0E\` | OVER | لا يوجد | ادفع نسخة من القيمة الثانية من القمة (يصير \`a b\` هو \`a b a\`) |

يأتي بايت المعامل بعد رمز عمليته في البرنامج، فطول هذه التعليمات بايتان. عناوين القفز مواضع مطلقة في البرنامج (البايت الأول عنوانه 0). وإذا لم يُنفَّذ القفز الشرطي فيتابع التنفيذ بعد معامله.

## انتهاء التشغيل

* ينتهي التشغيل طبيعياً بتنفيذ \`HALT\` أو بتجاوز آخر بايت في البرنامج.
* **العطل (fault)** يوقف التشغيل فوراً ويطبع \`FAULT\` يتبعه سطر جديد مباشرة بعد ما طُبع سابقاً. والعطل هو: رمز عملية غير معروف، أو تعليمة تحتاج قيماً أكثر مما في المكدّس، أو بايت معامل ناقص في نهاية البرنامج، أو قفزة **منفَّذة** إلى عنوان يساوي طول البرنامج أو يتجاوزه.
* البرنامج الذي نفّذ **100000** تعليمة يُوقَف قبل التعليمة التالية: اطبع \`LIMIT\` وسطراً جديداً. (فالصناديق الرملية الحقيقية تحتاج مراقباً كهذا.)

## الدخل والخرج

الدخل هو البرنامج بقيم بايتات سداسية عشرية (خانة أو خانتان لكل منها، بأحرف كبيرة أو صغيرة) تفصلها أي مسافات بيضاء، وقد تمتد على عدة أسطر. للبرنامج 255 بايتاً على الأكثر، والدخل الفارغ برنامج فارغ. اطبع ما يطبعه البرنامج. القيم تتسع في عدد صحيح بإشارة 64 بت في كل الاختبارات.

## أمثلة

الدخل:

\`\`\`
01 03 05 08 01 01 03 05 0C 02 00
\`\`\`

الخرج:

\`\`\`
3
2
1
\`\`\`

مقروءاً كلغة تجميع: \`PUSH 3\` ثم حلقة عند العنوان 2 هي \`DUP, PRINT, PUSH 1, SUB, DUP, JNZ 2\` ثم \`HALT\`.

الدخل:

\`\`\`
01 06 01 07 04 08 01 0A 01 04 03 08
\`\`\`

الخرج:

\`\`\`
42
6
\`\`\`

الدخل:

\`\`\`
01 4F 09 01 4B 09 01 0A 09
\`\`\`

الخرج:

\`\`\`
OK
\`\`\`

تشغّل الاختبارات المخفية أكثر بكثير من هذه الثلاثة: حلقات ونصوص وكل أنواع الأعطال وحد التعليمات وتنسيقات غريبة.`,
  },
  difficulty: 3,
  points: 250,
  estMinutes: 45,
  kind: "output",
  lang: "python",
  sampleInput: "01 03 05 08 01 01 03 05 0C 02 00\n",
  starterCode: {
    python: `import sys

code = [int(token, 16) for token in sys.stdin.read().split()]
stack = []
pc = 0
# Your turn: fetch, decode and execute instructions until the program ends.
`,
    javascript: `const code = require("fs").readFileSync(0, "utf8").split(/\\s+/).filter(Boolean).map((t) => parseInt(t, 16));
const stack = [];
let pc = 0;
// Your turn: fetch, decode and execute instructions until the program ends.
`,
    c: `#include <stdio.h>

int main(void) {
    unsigned code[256];
    int n = 0;
    unsigned byte;
    while (n < 256 && scanf("%x", &byte) == 1) code[n++] = byte;
    /* Your turn: fetch, decode and execute the n program bytes. */
    return 0;
}
`,
  },
  hints: [
    { cost: 15 },
    { cost: 25 },
    { cost: 30 },
  ],
  lessons: ["reverse-engineering/how-programs-run", "reverse-engineering/assembly-basics"],
  tags: ["virtual-machine", "bytecode", "interpreter", "stack", "opcodes"],
  addedAt: "2026-10-07",
};

export const securityChallenges: ChallengeMeta[] = [
  authLogHunt,
  saltedWordlist,
  cryptoLadder,
  passwordStrength,
  jsUnmask,
  crackme,
  stackVm,
];
