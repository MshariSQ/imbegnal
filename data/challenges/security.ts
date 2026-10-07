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

export const securityChallenges: ChallengeMeta[] = [authLogHunt];
