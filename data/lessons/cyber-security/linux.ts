import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "linux",
  title: { en: "Linux — The Hacker's Operating System", ar: "لينكس — نظام تشغيل المخترقين" },
  estMinutes: 30,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why every server and security tool runs on Linux
- The command line: talking to the computer with **text**
- The essential commands you'll type forever
- File permissions — the heart of Linux security
- **sudo** and root — the most dangerous, most necessary command
- Chaining commands together with pipes`,
        ar: `## ماذا ستتعلم

- لماذا يعمل كل خادم وأداة أمن على لينكس
- سطر الأوامر: مخاطبة الحاسوب بـ**النص**
- الأوامر الأساسية التي ستكتبها للأبد
- صلاحيات الملفات — قلب أمن لينكس
- **sudo** والمستخدم الجذر — أخطر أمر وأكثره ضرورة
- ربط الأوامر معاً بالأنابيب`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Talking instead of clicking 💬

On Windows you *click* icons. On Linux servers there are no icons — you **type commands** into a black window called the **terminal**. It feels alien for a day, then it becomes a superpower: precise, scriptable, and remote-friendly. ~90% of the world's servers run Linux, and nearly every security tool (Kali Linux, Wireshark, Metasploit) lives there.

The **filesystem** is a tree that starts at \`/\` (the root). You move around and inspect it with commands:

\`\`\`bash
pwd              # "print working directory" — where am I?
ls               # list files here
ls -la           # list ALL files, long format (shows permissions)
cd /var/log      # change directory
cat access.log   # print a file's contents
grep "error" access.log   # find lines containing "error"
\`\`\`

For security, \`grep\` is gold — it hunts through huge log files for exactly what you want.

**Permissions** are Linux's core defense. Every file says who can **r**ead, **w**rite, and e**x**ecute it, for three groups: the owner, the group, and everyone else. In \`ls -la\` you see:

\`\`\`
-rwxr-xr--
 │└┬┘└┬┘└┬┘
 │ │  │  └── others: read only
 │ │  └───── group: read + execute
 │ └──────── owner: read + write + execute
 └────────── file type
\`\`\`

\`chmod\` changes those permissions. A classic mistake — making a private key world-readable — is exactly the kind of misconfiguration attackers scan for.`,
        ar: `## المخاطبة بدل النقر 💬

في ويندوز *تنقر* الأيقونات. في خوادم لينكس لا أيقونات — بل **تكتب أوامر** في نافذة سوداء اسمها **الطرفية**. يبدو غريباً ليوم، ثم يصير قوة خارقة: دقيق، قابل للبرمجة، وصديق للعمل عن بُعد. نحو 90% من خوادم العالم تعمل بلينكس، وكل أداة أمن تقريباً (Kali Linux، Wireshark، Metasploit) تعيش هناك.

**نظام الملفات** شجرة تبدأ من \`/\` (الجذر). تتنقل فيه وتفحصه بالأوامر:

\`\`\`bash
pwd              # أين أنا؟
ls               # اعرض ملفات هنا
ls -la           # اعرض كل الملفات بصيغة مطوّلة (تُظهر الصلاحيات)
cd /var/log      # غيّر المجلد
cat access.log   # اطبع محتوى ملف
grep "error" access.log   # جد الأسطر التي تحوي "error"
\`\`\`

للأمن، \`grep\` كنز — يبحث في ملفات السجلّات الضخمة عن ما تريد بالضبط.

**الصلاحيات** هي دفاع لينكس الأساسي. كل ملف يحدد من يستطيع القراءة (r) والكتابة (w) والتنفيذ (x)، لثلاث فئات: المالك، المجموعة، والبقية. في \`ls -la\` ترى:

\`\`\`
-rwxr-xr--
 │└┬┘└┬┘└┬┘
 │ │  │  └── البقية: قراءة فقط
 │ │  └───── المجموعة: قراءة + تنفيذ
 │ └──────── المالك: قراءة + كتابة + تنفيذ
 └────────── نوع الملف
\`\`\`

\`chmod\` يغيّر هذه الصلاحيات. خطأ كلاسيكي — جعل مفتاح خاص قابلاً للقراءة من الجميع — هو بالضبط سوء الإعداد الذي يبحث عنه المهاجمون.`,
      },
    },
    {
      type: "exercise",
      lang: "python",
      prompt: {
        en: `Log analysis is a daily Linux task. You're given a multi-line log in the variable \`log\`. Write code that counts how many lines contain the word \`"ERROR"\` and stores it in \`error_count\`, then prints it.

(This mimics \`grep -c ERROR\`.)`,
        ar: `تحليل السجلّات مهمة يومية في لينكس. لديك سجلّ متعدد الأسطر في المتغير \`log\`. اكتب كوداً يعدّ كم سطراً يحوي كلمة \`"ERROR"\` ويخزّنه في \`error_count\`، ثم يطبعه.

(هذا يحاكي \`grep -c ERROR\`.)`,
      },
      starterCode: `log = """INFO user logged in
ERROR failed login from 10.0.0.5
INFO page loaded
ERROR disk full
WARN high memory"""

# count lines containing "ERROR"
error_count = 0
`,
      solution: `log = """INFO user logged in
ERROR failed login from 10.0.0.5
INFO page loaded
ERROR disk full
WARN high memory"""

error_count = 0
for line in log.split("\\n"):
    if "ERROR" in line:
        error_count += 1

print(error_count)  # 2`,
      hints: [
        { en: `Split into lines with log.split("\\n"), then loop over them.`, ar: `قسّم إلى أسطر بـ log.split("\\n") ثم كرّر عليها.` },
        { en: `Inside the loop: if "ERROR" in line: error_count += 1`, ar: `داخل الحلقة: if "ERROR" in line: error_count += 1` },
      ],
      tests: [
        { name: { en: "error_count is 2", ar: "error_count يساوي 2" }, check: `assert error_count == 2` },
        { name: { en: "The count was printed", ar: "طُبع العدد" }, check: `assert "2" in _stdout` },
      ],
    },
    {
      type: "text",
      body: {
        en: `## sudo and root — the master key 🔑

Every Linux system has a **root** user who can do *anything* — read any file, delete any file, install anything, break anything. Your everyday account is deliberately weaker, to protect you from your own mistakes (and from malware acting as you).

\`sudo\` ("superuser do") temporarily borrows root's power for one command:

\`\`\`bash
cat /etc/shadow        # Permission denied — this file holds password hashes
sudo cat /etc/shadow   # Works — you've temporarily borrowed root's power
\`\`\`

**Why this matters for security specifically:** a huge share of real attacks aren't about breaking in — they're about **privilege escalation**: an attacker gets a foothold as a low-privilege user, then hunts for a misconfigured \`sudo\` rule, a world-writable script that root runs, or a leaked root password to become root and own the entire machine. Defensively, the rule is **least privilege** (you met this idea before): give accounts only the \`sudo\` rights they truly need, never share the root password, and audit who can \`sudo\` regularly.`,
        ar: `## sudo والمستخدم الجذر — المفتاح الرئيسي 🔑

كل نظام لينكس فيه مستخدم **جذر (root)** يستطيع فعل *أي شيء* — قراءة أي ملف، حذف أي ملف، تثبيت أي شيء، كسر أي شيء. حسابك اليومي أضعف عمداً، ليحميك من أخطائك أنت (ومن برمجية خبيثة تتصرف بصفتك).

\`sudo\` ("superuser do") يستعير مؤقتاً قوة الجذر لأمر واحد:

\`\`\`bash
cat /etc/shadow        # رُفض الإذن — هذا الملف يحمل تجزئات كلمات المرور
sudo cat /etc/shadow   # يعمل — استعرت مؤقتاً قوة الجذر
\`\`\`

**لماذا يهم هذا للأمن تحديداً:** حصة هائلة من الهجمات الحقيقية ليست عن الاقتحام — بل عن **تصعيد الصلاحيات (privilege escalation)**: يحصل المهاجم على موطئ قدم كمستخدم منخفض الصلاحية، ثم يبحث عن قاعدة \`sudo\` سيئة الإعداد، أو سكربت قابل للكتابة من الجميع يشغّله الجذر، أو كلمة مرور جذر مسرّبة ليصبح جذراً ويملك الجهاز كاملاً. دفاعياً، القاعدة هي **أقل صلاحية** (قابلت هذه الفكرة سابقاً): امنح الحسابات فقط صلاحيات \`sudo\` التي تحتاجها فعلاً، لا تشارك كلمة مرور الجذر أبداً، وراجع من يستطيع \`sudo\` بانتظام.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Real-world case study: chmod 777 🔍

One of the most common real-world misconfigurations security scanners find is a file or folder set to \`chmod 777\` — permissions \`rwxrwxrwx\`, meaning *everyone* on the system can read, write, **and execute** it. Developers do this under deadline pressure when a permission error blocks them and \`777\` "just makes the error go away."

The problem: if that folder is reachable from the internet (a web upload directory, for example), an attacker who uploads *any* file can now also **execute** it — turning a simple file upload feature into full control of the server. The fix is always the same principle from this lesson: grant the *minimum* permission that works (usually \`755\` for folders, \`644\` for regular files — owner can write, everyone else can only read), never \`777\` as a "fix."`,
        ar: `## دراسة حالة واقعية: chmod 777 🔍

من أشيع سوء الإعدادات الواقعية التي تجدها ماسحات الأمن ملف أو مجلد مضبوط على \`chmod 777\` — صلاحيات \`rwxrwxrwx\`، أي أن *الجميع* على النظام يستطيع القراءة والكتابة **والتنفيذ**. يفعل المطورون هذا تحت ضغط الموعد النهائي حين يمنعهم خطأ صلاحية، و\`777\` "يُزيل الخطأ فقط."

المشكلة: إن كان ذلك المجلد قابلاً للوصول من الإنترنت (مجلد رفع ملفات على موقع، مثلاً)، يستطيع مهاجم يرفع *أي* ملف الآن أيضاً **تنفيذه** — محوّلاً ميزة رفع ملف بسيطة إلى تحكّم كامل بالخادم. الحل دائماً نفس مبدأ هذا الدرس: امنح *الحد الأدنى* من الصلاحية التي تعمل (عادة \`755\` للمجلدات، \`644\` للملفات العادية — المالك يكتب، والبقية يقرؤون فقط)، لا \`777\` أبداً كـ"حل."`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Which command searches a file for matching lines?", ar: "أي أمر يبحث في ملف عن أسطر مطابقة؟" },
          choices: [
            { en: "cd", ar: "cd" },
            { en: "grep", ar: "grep" },
            { en: "pwd", ar: "pwd" },
          ],
          answer: 1,
          explain: {
            en: "grep is the search workhorse — indispensable for digging through logs. cd changes directory, pwd shows where you are.",
            ar: "grep هو أداة البحث الأساسية — لا غنى عنها للتنقيب في السجلّات. cd يغيّر المجلد، وpwd يظهر مكانك.",
          },
        },
        {
          q: { en: "In permissions, what does 'x' allow?", ar: "في الصلاحيات، ماذا تسمح 'x'؟" },
          choices: [
            { en: "Delete the file", ar: "حذف الملف" },
            { en: "Execute (run) the file", ar: "تنفيذ (تشغيل) الملف" },
            { en: "Encrypt the file", ar: "تشفير الملف" },
          ],
          answer: 1,
          explain: {
            en: "r = read, w = write, x = execute. A program file needs x to run; a script without it just won't launch.",
            ar: "r = قراءة، w = كتابة، x = تنفيذ. ملف البرنامج يحتاج x ليعمل؛ والسكربت بدونها لن يُشغّل.",
          },
        },
        {
          q: { en: "Why do security professionals prefer Linux?", ar: "لماذا يفضّل محترفو الأمن لينكس؟" },
          choices: [
            { en: "It has the best games", ar: "فيه أفضل الألعاب" },
            { en: "Most servers and security tools run on it; it's scriptable and remote-friendly", ar: "معظم الخوادم وأدوات الأمن تعمل عليه؛ وهو قابل للبرمجة وصديق للعمل عن بُعد" },
            { en: "It has no permissions system", ar: "لا يملك نظام صلاحيات" },
          ],
          answer: 1,
          explain: {
            en: "Servers, cloud, and tooling are Linux-first, and the command line lets you automate and work remotely — core to the job.",
            ar: "الخوادم والسحابة والأدوات لينكس أولاً، وسطر الأوامر يتيح الأتمتة والعمل عن بُعد — جوهر المهنة.",
          },
        },
        {
          q: { en: "What is privilege escalation?", ar: "ما هو تصعيد الصلاحيات؟" },
          choices: [
            { en: "An attacker turning low-level access into root/admin access", ar: "مهاجم يحوّل وصولاً منخفض المستوى إلى وصول جذر/مدير" },
            { en: "A normal system update", ar: "تحديث نظام عادي" },
            { en: "Deleting a user account", ar: "حذف حساب مستخدم" },
          ],
          answer: 0,
          explain: {
            en: "Attackers rarely start as root — they get a small foothold, then hunt for a misconfiguration to escalate to full control.",
            ar: "نادراً ما يبدأ المهاجمون كجذر — يحصلون على موطئ قدم صغير، ثم يبحثون عن سوء إعداد للتصعيد إلى تحكّم كامل.",
          },
        },
        {
          q: { en: "What is wrong with chmod 777 on an internet-facing folder?", ar: "ما الخطأ في chmod 777 على مجلد متصل بالإنترنت؟" },
          choices: [
            { en: "Anyone can write AND execute files there — an uploaded file could run as code", ar: "يستطيع الجميع كتابة وتنفيذ الملفات هناك — قد يعمل ملف مرفوع ككود" },
            { en: "Nothing — 777 is always the safest setting", ar: "لا شيء — 777 دائماً الإعداد الأكثر أماناً" },
            { en: "It only affects file size", ar: "يؤثر فقط على حجم الملف" },
          ],
          answer: 0,
          explain: {
            en: "777 grants read+write+execute to everyone — on a reachable folder that turns a file upload feature into a way to run attacker code.",
            ar: "777 يمنح القراءة+الكتابة+التنفيذ للجميع — على مجلد متاح، هذا يحوّل ميزة رفع ملفات إلى طريقة لتشغيل كود المهاجم.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Linux = the OS of servers and security; you drive it by typing in the terminal
- Core commands: \`pwd\`, \`ls -la\`, \`cd\`, \`cat\`, \`grep\`
- Permissions (rwx for owner/group/others) are Linux's built-in defense
- \`sudo\`/root and privilege escalation — why least privilege matters even more here
- \`chmod 777\` is a classic, real-world misconfiguration attackers actively scan for

**Do this:** install Ubuntu in a free virtual machine (VirtualBox) or use WSL on Windows, and practice the commands above on real files. **Next:** Python, to automate all of this.`,
        ar: `## الخلاصة

- لينكس = نظام الخوادم والأمن؛ تقوده بالكتابة في الطرفية
- الأوامر الأساسية: \`pwd\`، \`ls -la\`، \`cd\`، \`cat\`، \`grep\`
- الصلاحيات (rwx للمالك/المجموعة/البقية) دفاع لينكس المدمج
- \`sudo\`/الجذر وتصعيد الصلاحيات — لماذا أقل صلاحية يهم هنا أكثر
- \`chmod 777\` سوء إعداد واقعي كلاسيكي يبحث عنه المهاجمون فعلياً

**افعل هذا:** ثبّت أوبونتو في جهاز افتراضي مجاني (VirtualBox) أو استخدم WSL على ويندوز، وتدرّب على الأوامر أعلاه على ملفات حقيقية. **التالي:** بايثون، لأتمتة كل هذا.`,
      },
    },
  ],
};
