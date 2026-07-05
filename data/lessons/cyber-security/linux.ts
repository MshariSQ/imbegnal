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
- File permissions — the heart of Linux security`,
        ar: `## ماذا ستتعلم

- لماذا يعمل كل خادم وأداة أمن على لينكس
- سطر الأوامر: مخاطبة الحاسوب بـ**النص**
- الأوامر الأساسية التي ستكتبها للأبد
- صلاحيات الملفات — قلب أمن لينكس`,
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
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Linux = the OS of servers and security; you drive it by typing in the terminal
- Core commands: \`pwd\`, \`ls -la\`, \`cd\`, \`cat\`, \`grep\`
- Permissions (rwx for owner/group/others) are Linux's built-in defense

**Do this:** install Ubuntu in a free virtual machine (VirtualBox) or use WSL on Windows, and practice the commands above on real files. **Next:** Python, to automate all of this.`,
        ar: `## الخلاصة

- لينكس = نظام الخوادم والأمن؛ تقوده بالكتابة في الطرفية
- الأوامر الأساسية: \`pwd\`، \`ls -la\`، \`cd\`، \`cat\`، \`grep\`
- الصلاحيات (rwx للمالك/المجموعة/البقية) دفاع لينكس المدمج

**افعل هذا:** ثبّت أوبونتو في جهاز افتراضي مجاني (VirtualBox) أو استخدم WSL على ويندوز، وتدرّب على الأوامر أعلاه على ملفات حقيقية. **التالي:** بايثون، لأتمتة كل هذا.`,
      },
    },
  ],
};
