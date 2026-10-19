import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "files-linux-shell",
  title: { en: "Files, Permissions & the Linux Shell — One Tree, Three Digits, Many Pipes", ar: "الملفات والصلاحيات وصدفة لينكس — شجرة واحدة وثلاثة أرقام وأنابيب كثيرة" },
  estMinutes: 42,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- How Linux arranges **every file in one tree** that starts at \`/\`, and how **absolute** and **relative** paths are resolved
- Who you are to the kernel: **users**, **groups**, **UIDs** and **GIDs**
- What the **permission bits** \`rwx\` mean for files and for directories, in symbolic and **octal** form, and how the kernel picks **one** class to check
- How **redirection** (\`>\`, \`<\`, \`2>&1\`) and **pipes** (\`|\`) rewire a program's input and output
- The text tools that make the shell productive: \`sort\`, \`uniq\`, \`cut\` and \`awk\`

You will build a path resolver in JavaScript, a permission checker in C and a shell pipeline that reports on an \`/etc/passwd\` file.`,
        ar: `## ماذا ستتعلم

- كيف يرتّب لينكس **كل الملفات في شجرة واحدة** تبدأ من \`/\`، وكيف تُحلَّل المسارات **المطلقة (absolute)** و**النسبية (relative)**
- من أنت في نظر النواة: **المستخدمون** و**المجموعات** و**UID** و**GID**
- ماذا تعني **بتّات الصلاحيات** \`rwx\` للملفات وللمجلدات، بالصيغة الرمزية وبالصيغة **الثمانية (octal)**، وكيف تختار النواة **فئة واحدة** لتفحصها
- كيف تعيد **إعادة التوجيه (redirection)** (\`>\` و\`<\` و\`2>&1\`) و**الأنابيب (pipes)** (\`|\`) توصيل مدخلات البرنامج ومخرجاته
- أدوات النصوص التي تجعل الصدفة (shell) منتجة: \`sort\` و\`uniq\` و\`cut\` و\`awk\`

ستبني محلّل مسارات بلغة JavaScript، ومدقّق صلاحيات بلغة C، وخط أنابيب في الـ shell يلخّص ملفاً بصيغة \`/etc/passwd\`.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## One tree, rooted at / 🌳

Windows gives every disk a letter (\`C:\`, \`D:\`). Linux has **one tree**. It starts at the **root directory** \`/\`, and every disk, USB stick or network share is **mounted** onto some directory of that tree. The usual layout follows the **Filesystem Hierarchy Standard (FHS)**:

\`\`\`
/
├── bin/, sbin/, usr/   programs (on most current distros /bin is a link to /usr/bin)
├── etc/                system configuration: passwd, group, hosts, ssh/
├── home/               one directory per user: /home/ana, /home/omar
├── root/               the root user's home
├── tmp/                temporary files, writable by everyone
├── var/                data that changes: log/, cache/, lib/
├── dev/                device files: /dev/null, /dev/sda
└── proc/, sys/         virtual files the kernel generates on the fly
\`\`\`

The last line hints at a Unix idea: **almost everything is a file**. Devices, kernel settings and even other processes (\`/proc/<pid>/\`) are opened and read with the same calls as a text file.

### Absolute and relative paths

- An **absolute path** starts with \`/\` and is read from the root: \`/home/ana/notes.txt\`
- A **relative path** does not start with \`/\` and is read from the process's **current working directory** (\`pwd\` prints it): from \`/home/ana\`, \`notes.txt\` means \`/home/ana/notes.txt\`
- Every directory contains two special names: \`.\` (itself) and \`..\` (its parent). In \`/\`, \`..\` is \`/\` again
- Repeated slashes count as one: \`/etc//ssh\` is \`/etc/ssh\`

POSIX calls this **pathname resolution**: the kernel walks the path one component at a time, starting at \`/\` or at the current directory. (It also follows symbolic links on the way; you will meet those in the file-systems lesson.)

Two details trip up beginners:

- \`~\` is **not** a path the kernel understands. The **shell** replaces a leading \`~\` with your home directory before the program runs (**tilde expansion**). A C program that opens \`"~/notes.txt"\` looks for a directory literally named \`~\`.
- The current directory belongs to **each process**, and a child gets a copy at \`fork\`. That is why \`cd\` must be a **shell built-in**: an external \`cd\` program would change only its own directory and then exit.

Watch the walk with a stack:`,
        ar: `## شجرة واحدة جذرها / 🌳

يعطي ويندوز كل قرص حرفاً (\`C:\` و\`D:\`). أما لينكس فلديه **شجرة واحدة**. تبدأ من **المجلد الجذر (root directory)** \`/\`، وكل قرص أو ذاكرة USB أو مجلد شبكي **يُركَّب (mount)** على مجلد ما من هذه الشجرة. ويتبع التنظيم المعتاد **معيار تسلسل نظام الملفات (FHS)**:

\`\`\`
/
├── bin/, sbin/, usr/   programs (on most current distros /bin is a link to /usr/bin)
├── etc/                system configuration: passwd, group, hosts, ssh/
├── home/               one directory per user: /home/ana, /home/omar
├── root/               the root user's home
├── tmp/                temporary files, writable by everyone
├── var/                data that changes: log/, cache/, lib/
├── dev/                device files: /dev/null, /dev/sda
└── proc/, sys/         virtual files the kernel generates on the fly
\`\`\`

يلمّح السطر الأخير إلى فكرة من يونكس: **كل شيء تقريباً ملف**. فالأجهزة وإعدادات النواة وحتى العمليات الأخرى (\`/proc/<pid>/\`) تُفتح وتُقرأ بالاستدعاءات نفسها التي يُقرأ بها ملف نصي.

### المسارات المطلقة والنسبية

- **المسار المطلق** يبدأ بـ \`/\` ويُقرأ من الجذر: \`/home/ana/notes.txt\`
- **المسار النسبي** لا يبدأ بـ \`/\` ويُقرأ من **مجلد العمل الحالي (current working directory)** للعملية (يطبعه \`pwd\`): من \`/home/ana\` يعني \`notes.txt\` المسار \`/home/ana/notes.txt\`
- في كل مجلد اسمان خاصان: \`.\` (المجلد نفسه) و\`..\` (المجلد الأب). وفي \`/\` يكون \`..\` هو \`/\` من جديد
- الشرطات المائلة المتكررة تُعدّ واحدة: \`/etc//ssh\` هو \`/etc/ssh\`

يسمّي معيار POSIX هذا **تحليل المسار (pathname resolution)**: تمشي النواة في المسار مكوّناً تلو مكوّن، بدءاً من \`/\` أو من المجلد الحالي. (وتتبع أيضاً الروابط الرمزية في طريقها؛ ستلتقي بها في درس أنظمة الملفات.)

تفصيلتان تُربكان المبتدئين:

- الرمز \`~\` **ليس** مساراً تفهمه النواة. فـ**الصدفة (shell)** هي التي تستبدل \`~\` في بداية الكلمة بمجلد المنزل قبل تشغيل البرنامج (**توسيع التلدة (tilde expansion)**). وبرنامج C يفتح \`"~/notes.txt"\` يبحث عن مجلد اسمه حرفياً \`~\`.
- المجلد الحالي ملك **لكل عملية على حدة**، ويحصل الابن على نسخة منه عند \`fork\`. ولهذا يجب أن يكون \`cd\` **أمراً مدمجاً في الـ shell (built-in)**: فبرنامج \`cd\` خارجي سيغيّر مجلده هو فقط ثم ينتهي.

راقب المشي بمكدّس:`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: String.raw`# Resolve a path the way the kernel walks it: one component at a time, with a stack.
def resolve(cwd, path):
    full = path if path.startswith("/") else cwd + "/" + path
    stack = []
    for part in full.split("/"):
        if part in ("", "."):
            continue              # "a//b" and "a/./b" both mean "a/b"
        if part == "..":
            if stack:
                stack.pop()       # go up one level (the root's parent is the root)
        else:
            stack.append(part)
        print(f"  {part:<8} stack = {stack}")
    return "/" + "/".join(stack)

cwd = "/home/ana/projects"
for path in ["../photos/./cat.png", "/etc//ssh/", "../../../../tmp"]:
    print(f"{path}  (from {cwd})")
    print("  =>", resolve(cwd, path))
`,
      explanation: {
        en: "Each component either pushes a name, pops one (..) or changes nothing (. and the empty parts that // and a trailing / produce). With more .. than levels the stack simply stays empty, which is the root. Try your own paths or another cwd.",
        ar: "كل مكوّن إما يضيف اسماً إلى المكدّس، أو يزيل واحداً (..)، أو لا يغيّر شيئاً (. والأجزاء الفارغة التي تنتج عن // أو عن / في النهاية). ومع عدد من .. أكبر من عدد المستويات يبقى المكدّس فارغاً ببساطة، وهذا هو الجذر. جرّب مسارات من عندك أو قيمة أخرى لـ cwd.",
      },
    },
    {
      type: "lab",
      id: "path-resolver",
      lang: "javascript",
      prompt: {
        en: `Write a **path resolver** that turns any path into a clean absolute path, the way \`realpath -m -s\` does (no symbolic links are followed and nothing needs to exist).

**Input:**
- Line 1: the current working directory (an absolute path)
- Line 2: the home directory (an absolute path)
- Then one path per line until the end of input (skip blank lines)

**Rules:**
1. A path that is exactly \`~\` or starts with \`~/\` begins with the home directory instead of the \`~\` (tilde expansion). Any other \`~\` is an ordinary character.
2. A path that does not start with \`/\` is relative to the current directory.
3. Empty components (from \`//\`) and \`.\` are skipped; \`..\` removes the previous component, and at the root it stays at the root.

**Output:** one line per path: \`<path> -> <resolved>\`. The result never ends with \`/\`, except the root itself.

**Example:**

\`\`\`
/home/ana/projects
/home/ana
notes.txt
../photos/./cat.png
/etc//ssh/
~/.bashrc
../../../../..
\`\`\`

prints

\`\`\`
notes.txt -> /home/ana/projects/notes.txt
../photos/./cat.png -> /home/ana/photos/cat.png
/etc//ssh/ -> /etc/ssh
~/.bashrc -> /home/ana/.bashrc
../../../../.. -> /
\`\`\``,
        ar: `اكتب **محلّل مسارات** يحوّل أي مسار إلى مسار مطلق نظيف، كما يفعل \`realpath -m -s\` (دون تتبّع أي روابط رمزية ودون اشتراط وجود أي شيء).

**المدخل:**
- السطر 1: مجلد العمل الحالي (مسار مطلق)
- السطر 2: مجلد المنزل (مسار مطلق)
- ثم مسار واحد في كل سطر حتى نهاية المدخل (تجاوز الأسطر الفارغة)

**القواعد:**
1. المسار الذي يساوي \`~\` تماماً أو يبدأ بـ \`~/\` يبدأ بمجلد المنزل بدلاً من \`~\` (توسيع التلدة). وأي \`~\` آخر حرف عادي.
2. المسار الذي لا يبدأ بـ \`/\` نسبي إلى المجلد الحالي.
3. تُتجاوز المكوّنات الفارغة (الناتجة عن \`//\`) و\`.\`؛ ويزيل \`..\` المكوّن السابق، وعند الجذر يبقى عند الجذر.

**المخرج:** سطر لكل مسار: \`<path> -> <resolved>\`. لا تنتهي النتيجة أبداً بـ \`/\`، إلا الجذر نفسه.

**مثال:**

\`\`\`
/home/ana/projects
/home/ana
notes.txt
../photos/./cat.png
/etc//ssh/
~/.bashrc
../../../../..
\`\`\`

يطبع

\`\`\`
notes.txt -> /home/ana/projects/notes.txt
../photos/./cat.png -> /home/ana/photos/cat.png
/etc//ssh/ -> /etc/ssh
~/.bashrc -> /home/ana/.bashrc
../../../../.. -> /
\`\`\``,
      },
      starterCode: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const cwd = (lines[0] || "/").trim();
const home = (lines[1] || "/").trim();

function resolve(cwd, home, path) {
  // TODO 1: replace a leading "~" (alone, or followed by "/") with the home directory
  // TODO 2: if the path is relative, put the current directory in front of it
  // TODO 3: split on "/" and walk the parts with a stack:
  //         skip "" and ".", pop on "..", push anything else
  // TODO 4: join the stack back into an absolute path ("/" when it is empty)
  return path;
}

for (const line of lines.slice(2)) {
  const path = line.trim();
  if (path === "") continue;
  console.log(path + " -> " + resolve(cwd, home, path));
}
`,
      solution: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const cwd = (lines[0] || "/").trim();
const home = (lines[1] || "/").trim();

function resolve(cwd, home, path) {
  // Tilde expansion is the shell's job: it happens before any program sees the path.
  if (path === "~" || path.startsWith("~/")) path = home + path.slice(1);
  // A relative path is looked up from the current directory.
  const full = path.startsWith("/") ? path : cwd + "/" + path;
  const stack = [];
  for (const part of full.split("/")) {
    if (part === "" || part === ".") continue; // "//" and "." change nothing
    if (part === "..") stack.pop();            // at the root there is nothing to pop
    else stack.push(part);
  }
  return "/" + stack.join("/");
}

for (const line of lines.slice(2)) {
  const path = line.trim();
  if (path === "") continue;
  console.log(path + " -> " + resolve(cwd, home, path));
}
`,
      hints: [
        {
          en: "Do the two prefix steps first: turn \"~\" or \"~/...\" into home + the rest, then put cwd + \"/\" in front of anything that does not start with \"/\". Extra slashes are harmless because the next step skips empty parts.",
          ar: "نفّذ خطوتي البادئة أولاً: حوّل \"~\" أو \"~/...\" إلى home مع بقية المسار، ثم ضع cwd + \"/\" أمام أي مسار لا يبدأ بـ \"/\". الشرطات الزائدة لا تضر لأن الخطوة التالية تتجاوز الأجزاء الفارغة.",
        },
        {
          en: "full.split(\"/\") gives the components. Keep an array as a stack: continue on \"\" and \".\", stack.pop() on \"..\" (popping an empty array is harmless and returns undefined), stack.push(part) otherwise.",
          ar: "يعطيك full.split(\"/\") المكوّنات. استخدم مصفوفة كمكدّس: تابع (continue) عند \"\" و\".\"، ونفّذ stack.pop() عند \"..\" (إزالة عنصر من مصفوفة فارغة لا تضر وتعيد undefined)، وstack.push(part) في غير ذلك.",
        },
        {
          en: "\"/\" + stack.join(\"/\") produces \"/\" for an empty stack and never a trailing slash. Only a leading \"~\" is special: \"~x/y\" and \"docs/~\" are relative paths with an ordinary character.",
          ar: "ينتج \"/\" + stack.join(\"/\") القيمة \"/\" للمكدّس الفارغ ولا يترك شرطة في النهاية أبداً. وحدها \"~\" في البداية خاصة: \"~x/y\" و\"docs/~\" مساران نسبيان فيهما حرف عادي.",
        },
      ],
      tests: [
        {
          name: { en: "Example from the prompt", ar: "المثال من نص المسألة" },
          stdin: "/home/ana/projects\n/home/ana\nnotes.txt\n../photos/./cat.png\n/etc//ssh/\n~/.bashrc\n../../../../..\n",
          expected: `notes.txt -> /home/ana/projects/notes.txt
../photos/./cat.png -> /home/ana/photos/cat.png
/etc//ssh/ -> /etc/ssh
~/.bashrc -> /home/ana/.bashrc
../../../../.. -> /`,
        },
        {
          name: { en: "Tilde is special only at the start", ar: "التلدة خاصة في البداية فقط" },
          stdin: "/srv/app\n/home/omar\n~\n~/a/../b\n~x/y\ndocs/~\n",
          expected: `~ -> /home/omar
~/a/../b -> /home/omar/b
~x/y -> /srv/app/~x/y
docs/~ -> /srv/app/docs/~`,
        },
        {
          name: { en: "Working from the root, with blank lines", ar: "العمل من الجذر مع أسطر فارغة" },
          stdin: "/\n/root\n.\n\n..\netc/./passwd\n\n./\n",
          expected: `. -> /
.. -> /
etc/./passwd -> /etc/passwd
./ -> /`,
        },
        {
          name: { en: "Absolute paths ignore the current directory", ar: "المسارات المطلقة تتجاهل المجلد الحالي" },
          stdin: "/var/log\n/home/ana\n/usr/bin/../lib/\n/../../tmp\n//\n/a/b/../../../c\n",
          expected: `/usr/bin/../lib/ -> /usr/lib
/../../tmp -> /tmp
// -> /
/a/b/../../../c -> /c`,
        },
        {
          name: { en: "No paths: nothing to print", ar: "لا مسارات: لا شيء يُطبع" },
          stdin: "/home/ana\n/home/ana\n",
          expected: "",
        },
      ],
      sampleInput: "/home/ana/projects\n/home/ana\n../photos/./cat.png\n~/.bashrc\n",
    },
    {
      type: "text",
      body: {
        en: `## Users, groups and permission bits 🔐

To the kernel you are not a name but a number. Every process runs with a **user ID (UID)** and a **group ID (GID)**, plus a list of **supplementary groups**. The names live in two text files:

- \`/etc/passwd\`: one account per line, \`name:password:UID:GID:GECOS:home:shell\` (the password field is just \`x\`; the hashes live in \`/etc/shadow\`, which only root can read)
- \`/etc/group\`: \`name:password:GID:members\`

\`id\` shows your identity, for example \`uid=1000(ana) gid=1000(ana) groups=1000(ana),27(sudo)\`. UID **0** is **root**, the superuser. On most current distributions regular accounts start at UID 1000.

### Reading ls -l

\`\`\`
-rw-r----- 1 ana staff 2048 Mar  3 10:15 report.txt
│└┬┘└┬┘└┬┘   │   │
│ │  │  │    │   └── group owner
│ │  │  │    └────── user owner
│ │  │  └─────────── other: ---  (nothing)
│ │  └────────────── group: r--  (read)
│ └───────────────── owner: rw-  (read, write)
└─────────────────── type: - file, d directory, l symbolic link
\`\`\`

The three letters mean different things for files and for directories:

- **r**: read the file's bytes / **list** the names in the directory
- **w**: change the file / **create, delete or rename** entries in the directory (so deleting a file depends on the *directory's* \`w\`, not the file's)
- **x**: run the file as a program / **enter** the directory and reach names inside it (\`cd\`, or any path that passes through it)

### Octal: three digits, one per class

Each class is three bits, so it fits in one octal digit: **r = 4, w = 2, x = 1**. Add them up: \`rw-\` = 6, \`r-x\` = 5, \`r--\` = 4. So \`-rw-r-----\` is **640** and \`rwxr-xr-x\` is **755**.

\`\`\`
chmod 640 report.txt         # owner rw, group r, other nothing
chmod u+x,o-r deploy.sh      # symbolic: add x for the owner, remove r for others
chown ana:staff report.txt   # change owner and group (giving a file away needs root)
\`\`\`

New files do not start at 777. A program usually asks for \`666\` (files) or \`777\` (directories) and the process's **umask** removes bits: with the common umask \`022\`, files become \`644\` and directories \`755\`.

### How the kernel decides

When a process opens a file, the kernel picks **exactly one** class, in this order (see \`path_resolution(7)\`):

1. If the process's UID is the file's owner, use the **owner** bits
2. Otherwise, if the file's group is one of the process's groups, use the **group** bits
3. Otherwise use the **other** bits

Only that class counts. A file with mode \`075\` denies its own owner, even though everybody else may read it. **Root** skips these checks for reading and writing, but may execute a file only if at least one \`x\` bit is set.

Three **special bits** sit in front of the usual nine: **setuid** (4000: the program runs with the file owner's UID, which is how \`passwd\` can update \`/etc/shadow\`), **setgid** (2000) and the **sticky bit** (1000: in a directory such as \`/tmp\`, mode \`1777\`, a file can be deleted only by its owner, the directory's owner or root). The security lesson comes back to them.`,
        ar: `## المستخدمون والمجموعات وبتّات الصلاحيات 🔐

أنت في نظر النواة رقم لا اسم. تعمل كل عملية بـ**معرّف مستخدم (UID)** و**معرّف مجموعة (GID)**، إضافة إلى قائمة **مجموعات إضافية (supplementary groups)**. أما الأسماء فتعيش في ملفين نصيين:

- \`/etc/passwd\`: حساب واحد في كل سطر بالشكل \`name:password:UID:GID:GECOS:home:shell\` (حقل كلمة المرور مجرد \`x\`؛ أما قيم التجزئة (hashes) ففي \`/etc/shadow\` الذي لا يقرؤه إلا الجذر)
- \`/etc/group\`: بالشكل \`name:password:GID:members\`

يعرض الأمر \`id\` هويتك، مثلاً \`uid=1000(ana) gid=1000(ana) groups=1000(ana),27(sudo)\`. والمعرّف **0** هو **الجذر (root)**، أي المستخدم الخارق. وفي معظم التوزيعات الحالية تبدأ الحسابات العادية من المعرّف 1000.

### قراءة ls -l

\`\`\`
-rw-r----- 1 ana staff 2048 Mar  3 10:15 report.txt
│└┬┘└┬┘└┬┘   │   │
│ │  │  │    │   └── group owner
│ │  │  │    └────── user owner
│ │  │  └─────────── other: ---  (nothing)
│ │  └────────────── group: r--  (read)
│ └───────────────── owner: rw-  (read, write)
└─────────────────── type: - file, d directory, l symbolic link
\`\`\`

للأحرف الثلاثة معانٍ مختلفة للملفات وللمجلدات:

- **r**: قراءة بايتات الملف / **سرد** الأسماء في المجلد
- **w**: تعديل الملف / **إنشاء المداخل أو حذفها أو إعادة تسميتها** في المجلد (فحذف ملف يعتمد على \`w\` الخاصة *بالمجلد* لا بالملف)
- **x**: تشغيل الملف كبرنامج / **دخول** المجلد والوصول إلى الأسماء داخله (\`cd\` أو أي مسار يمرّ عبره)

### الصيغة الثمانية: ثلاثة أرقام، رقم لكل فئة

كل فئة ثلاثة بتّات، فتتسع في رقم ثماني واحد: **r = 4 وw = 2 وx = 1**. اجمعها: \`rw-\` = 6 و\`r-x\` = 5 و\`r--\` = 4. إذن \`-rw-r-----\` هي **640** و\`rwxr-xr-x\` هي **755**.

\`\`\`
chmod 640 report.txt         # owner rw, group r, other nothing
chmod u+x,o-r deploy.sh      # symbolic: add x for the owner, remove r for others
chown ana:staff report.txt   # change owner and group (giving a file away needs root)
\`\`\`

لا تبدأ الملفات الجديدة بـ 777. يطلب البرنامج عادةً \`666\` (للملفات) أو \`777\` (للمجلدات) ثم يزيل **umask** العملية بعض البتّات: مع القيمة الشائعة \`022\` تصبح الملفات \`644\` والمجلدات \`755\`.

### كيف تقرّر النواة

حين تفتح عملية ملفاً تختار النواة **فئة واحدة بالضبط**، بهذا الترتيب (راجع \`path_resolution(7)\`):

1. إن كان UID العملية هو مالك الملف، تُستخدم بتّات **المالك**
2. وإلا، إن كانت مجموعة الملف إحدى مجموعات العملية، تُستخدم بتّات **المجموعة**
3. وإلا تُستخدم بتّات **البقية (other)**

تلك الفئة وحدها هي المعتبرة. فالملف ذو الصلاحيات \`075\` يمنع مالكه نفسه، مع أن كل من سواه يستطيع قراءته. أما **الجذر** فيتخطى هذه الفحوص في القراءة والكتابة، لكنه لا يستطيع تنفيذ ملف إلا إذا كان أحد بتّات \`x\` على الأقل مضبوطاً.

وتسبق التسعةَ المعتادة ثلاثةُ **بتّات خاصة**: **setuid** (4000: يعمل البرنامج بـ UID مالك الملف، وبهذا يستطيع \`passwd\` تحديث \`/etc/shadow\`)، و**setgid** (2000)، و**البتّ اللاصق (sticky bit)** (1000: في مجلد مثل \`/tmp\` صلاحياته \`1777\` لا يحذف الملف إلا مالكه أو مالك المجلد أو الجذر). وسيعود إليها درس الأمن.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// Permission bits: three octal digits, one per class (owner, group, other).
function symbolic(mode) {
  const letters = "rwxrwxrwx";
  let out = "";
  for (let bit = 8; bit >= 0; bit--) out += mode & (1 << bit) ? letters[8 - bit] : "-";
  return out;
}

for (const mode of [0o755, 0o644, 0o600, 0o750, 0o777]) {
  console.log(mode.toString(8).padStart(3, "0"), symbolic(mode));
}

// New files start from 666 (directories from 777); the umask removes bits.
for (const umask of [0o022, 0o077, 0o002]) {
  const file = 0o666 & ~umask;
  const dir = 0o777 & ~umask;
  console.log("umask " + umask.toString(8).padStart(3, "0") + ": file " + symbolic(file) + "  dir " + symbolic(dir));
}
`,
      explanation: {
        en: "Each octal digit is three bits: 7 = rwx, 5 = r-x, 4 = r--. The umask is removed bit by bit (666 AND NOT 022 = 644), which is why a umask never adds a permission. Try 0o027, a common choice on servers.",
        ar: "كل رقم ثماني ثلاثة بتّات: 7 = rwx و5 = r-x و4 = r--. ويُزال الـ umask بتّاً بتّاً (666 AND NOT 022 = 644)، ولهذا لا يضيف الـ umask صلاحية أبداً. جرّب 0o027، وهو خيار شائع على الخوادم.",
      },
    },
    {
      type: "lab",
      id: "permission-check",
      lang: "c",
      prompt: {
        en: `Write the kernel's **permission check** for one file.

**Input:**
- Line 1: \`<mode> <owner> <group>\`: the permission bits as octal digits (\`0\` to \`777\`, no special bits), the owning user and the owning group
- Then one request per line: \`<user> <groups> <op>\`, where \`<groups>\` is the comma-separated list of every group the user belongs to and \`<op>\` is \`r\`, \`w\` or \`x\`

**Output:**
- First the mode in symbolic form as \`ls -l\` shows it for a regular file, for example \`-rw-r-----\`
- Then one line per request: \`<user> <op>: allowed (<class>)\` or \`<user> <op>: denied (<class>)\`

**Rules:**
1. The user named \`root\` has class \`root\`: \`r\` and \`w\` are always allowed, \`x\` only if at least one of the three \`x\` bits is set
2. Otherwise, if the user is the owner the class is \`owner\`; else if the file's group is in the user's list it is \`group\`; else it is \`other\`
3. Only the bit of that one class is checked

**Example:**

\`\`\`
640 ana staff
ana ana r
bob bob,staff w
carol carol r
root root x
\`\`\`

prints

\`\`\`
-rw-r-----
ana r: allowed (owner)
bob w: denied (group)
carol r: denied (other)
root x: denied (root)
\`\`\``,
        ar: `اكتب **فحص الصلاحيات** الذي تجريه النواة على ملف واحد.

**المدخل:**
- السطر 1: \`<mode> <owner> <group>\`: بتّات الصلاحيات أرقاماً ثمانية (من \`0\` إلى \`777\`، دون بتّات خاصة)، والمستخدم المالك والمجموعة المالكة
- ثم طلب واحد في كل سطر: \`<user> <groups> <op>\`، حيث \`<groups>\` قائمة مفصولة بفواصل بكل مجموعة ينتمي إليها المستخدم، و\`<op>\` هي \`r\` أو \`w\` أو \`x\`

**المخرج:**
- أولاً الصلاحيات بالصيغة الرمزية كما يعرضها \`ls -l\` لملف عادي، مثل \`-rw-r-----\`
- ثم سطر لكل طلب: \`<user> <op>: allowed (<class>)\` أو \`<user> <op>: denied (<class>)\`

**القواعد:**
1. المستخدم المسمّى \`root\` فئته \`root\`: يُسمح دائماً بـ \`r\` و\`w\`، أما \`x\` فلا يُسمح بها إلا إذا كان أحد بتّات \`x\` الثلاثة على الأقل مضبوطاً
2. وإلا، إن كان المستخدم هو المالك فالفئة \`owner\`؛ وإلا إن كانت مجموعة الملف في قائمة المستخدم فهي \`group\`؛ وإلا فهي \`other\`
3. يُفحص بتّ تلك الفئة الواحدة فقط

**مثال:**

\`\`\`
640 ana staff
ana ana r
bob bob,staff w
carol carol r
root root x
\`\`\`

يطبع

\`\`\`
-rw-r-----
ana r: allowed (owner)
bob w: denied (group)
carol r: denied (other)
root x: denied (root)
\`\`\``,
      },
      starterCode: String.raw`#include <stdio.h>
#include <string.h>

/* Returns 1 if the comma-separated list contains this group (ready to use). */
int in_groups(const char *list, const char *group) {
    size_t n = strlen(group);
    const char *p = list;
    while (*p) {
        const char *end = strchr(p, ',');
        size_t len = end ? (size_t)(end - p) : strlen(p);
        if (len == n && strncmp(p, group, n) == 0) return 1;
        if (!end) break;
        p = end + 1;
    }
    return 0;
}

int main(void) {
    unsigned int mode;
    char owner[64], group[64];
    if (scanf("%o %63s %63s", &mode, owner, group) != 3) return 0;

    // TODO 1: build "-rwxrwxrwx" with '-' for every bit of mode that is 0
    //         (bit 8 is owner r, bit 0 is other x) and print it
    printf("----------\n");

    char user[64], groups[512], op[2];
    while (scanf("%63s %511s %1s", user, groups, op) == 3) {
        const char *who = "other";
        int allowed = 0;
        // TODO 2: root -> class "root": r and w allowed, x only if (mode & 0111) != 0
        // TODO 3: otherwise pick ONE class: owner, else group (use in_groups), else other
        // TODO 4: test that class's bit for the requested op (r = 4, w = 2, x = 1)
        printf("%s %s: %s (%s)\n", user, op, allowed ? "allowed" : "denied", who);
    }
    return 0;
}
`,
      solution: String.raw`#include <stdio.h>
#include <string.h>

/* Returns 1 if the comma-separated list contains this group (ready to use). */
int in_groups(const char *list, const char *group) {
    size_t n = strlen(group);
    const char *p = list;
    while (*p) {
        const char *end = strchr(p, ',');
        size_t len = end ? (size_t)(end - p) : strlen(p);
        if (len == n && strncmp(p, group, n) == 0) return 1;
        if (!end) break;
        p = end + 1;
    }
    return 0;
}

int main(void) {
    unsigned int mode;
    char owner[64], group[64];
    if (scanf("%o %63s %63s", &mode, owner, group) != 3) return 0;

    /* One letter per bit, from bit 8 (owner r) down to bit 0 (other x). */
    const char *letters = "rwxrwxrwx";
    char symbolic[11] = "-";
    for (int bit = 8; bit >= 0; bit--) {
        symbolic[9 - bit] = (mode & (1u << bit)) ? letters[8 - bit] : '-';
    }
    symbolic[10] = '\0';
    printf("%s\n", symbolic);

    char user[64], groups[512], op[2];
    while (scanf("%63s %511s %1s", user, groups, op) == 3) {
        int shift = (op[0] == 'r') ? 2 : (op[0] == 'w') ? 1 : 0;
        const char *who;
        int allowed;
        if (strcmp(user, "root") == 0) {
            /* root skips the checks, but execute needs at least one x bit somewhere */
            who = "root";
            allowed = (op[0] == 'x') ? (mode & 0111) != 0 : 1;
        } else {
            /* Exactly ONE class applies: owner, else group, else other. */
            int base;
            if (strcmp(user, owner) == 0) { who = "owner"; base = 6; }
            else if (in_groups(groups, group)) { who = "group"; base = 3; }
            else { who = "other"; base = 0; }
            allowed = (mode >> (base + shift)) & 1;
        }
        printf("%s %s: %s (%s)\n", user, op, allowed ? "allowed" : "denied", who);
    }
    return 0;
}
`,
      hints: [
        {
          en: "Bit 8 is the owner's r and bit 0 is other's x. Loop bit from 8 down to 0, test mode & (1u << bit) and write the matching letter of \"rwxrwxrwx\" or '-'. Do not forget the leading '-' for a regular file.",
          ar: "البتّ 8 هو r للمالك والبتّ 0 هو x للبقية. كرّر bit من 8 نزولاً إلى 0، واختبر mode & (1u << bit)، واكتب الحرف المقابل من \"rwxrwxrwx\" أو '-'. لا تنسَ الحرف '-' في البداية لأنه ملف عادي.",
        },
        {
          en: "Pick the class first and stop at the first match: strcmp(user, owner) == 0, then in_groups(groups, group), else other. The owner digit starts at bit 6, the group digit at bit 3 and the other digit at bit 0.",
          ar: "اختر الفئة أولاً وتوقف عند أول تطابق: strcmp(user, owner) == 0، ثم in_groups(groups, group)، وإلا فالبقية. رقم المالك يبدأ عند البتّ 6، ورقم المجموعة عند البتّ 3، ورقم البقية عند البتّ 0.",
        },
        {
          en: "Inside a digit r is 4 (shift 2), w is 2 (shift 1) and x is 1 (shift 0), so the answer is (mode >> (base + shift)) & 1. For root: r and w are allowed, and x is allowed only when (mode & 0111) != 0.",
          ar: "داخل الرقم تكون r هي 4 (إزاحة 2) وw هي 2 (إزاحة 1) وx هي 1 (إزاحة 0)، فالجواب هو (mode >> (base + shift)) & 1. وللجذر: يُسمح بـ r وw، ولا يُسمح بـ x إلا حين (mode & 0111) != 0.",
        },
      ],
      tests: [
        {
          name: { en: "Example from the prompt", ar: "المثال من نص المسألة" },
          stdin: "640 ana staff\nana ana r\nbob bob,staff w\ncarol carol r\nroot root x\n",
          expected: `-rw-r-----
ana r: allowed (owner)
bob w: denied (group)
carol r: denied (other)
root x: denied (root)`,
        },
        {
          name: { en: "The owner class applies even when it denies", ar: "فئة المالك تُطبَّق حتى حين تمنع" },
          stdin: "075 ana dev\nana ana,dev r\nbob bob,dev x\neve eve r\n",
          expected: `----rwxr-x
ana r: denied (owner)
bob x: allowed (group)
eve r: allowed (other)`,
        },
        {
          name: { en: "Supplementary groups count", ar: "المجموعات الإضافية معتبرة" },
          stdin: "750 deploy www\nomar omar,docker,www x\nlina lina,docker x\ndeploy deploy w\n",
          expected: `-rwxr-x---
omar x: allowed (group)
lina x: denied (other)
deploy w: allowed (owner)`,
        },
        {
          name: { en: "Root and the execute bits", ar: "الجذر وبتّات التنفيذ" },
          stdin: "001 ana ana\nroot root r\nroot root w\nroot root x\nana ana x\n",
          expected: `---------x
root r: allowed (root)
root w: allowed (root)
root x: allowed (root)
ana x: denied (owner)`,
        },
        {
          name: { en: "Mode only, no requests", ar: "الصلاحيات فقط دون طلبات" },
          stdin: "777 nobody nogroup\n",
          expected: "-rwxrwxrwx",
        },
      ],
      sampleInput: "640 ana staff\nana ana r\nbob bob,staff w\n",
    },
    {
      type: "text",
      body: {
        en: `## Redirection and pipes 🔀

Every process starts with three open **file descriptors**: **0 = stdin**, **1 = stdout**, **2 = stderr**. A program simply reads fd 0 and writes fds 1 and 2; the **shell** decides what they are connected to before it \`exec\`s the program:

\`\`\`
sort names.txt > sorted.txt        # fd 1 goes to a file (created or truncated)
echo done >> build.log             # append instead of truncate
wc -l < names.txt                  # fd 0 comes from a file
make 2> errors.txt                 # only stderr goes to the file
make > all.txt 2>&1                # stdout to the file, then stderr to wherever stdout points now
find / -name '*.conf' 2>/dev/null  # throw the "Permission denied" noise away
\`\`\`

Order matters: \`2>&1\` copies whatever fd 1 points to **at that moment**. \`cmd > all.txt 2>&1\` sends both streams to the file, while \`cmd 2>&1 > all.txt\` sends stderr to the terminal and only stdout to the file.

A **pipe** \`|\` connects the stdout of one command to the stdin of the next. The shell calls \`pipe()\` to get a kernel buffer with a write end and a read end, \`fork\`s once per command and wires the ends to fd 1 and fd 0. All the commands of a pipeline run **at the same time**: a writer that fills the buffer (64 KiB by default on Linux, see \`pipe(7)\`) blocks until the reader catches up, and a reader blocks until data arrives.

\`\`\`
ps -e --no-headers | wc -l   # how many processes (ps and wc included)? two programs, one pipe
\`\`\`

The **exit status** of a pipeline is the status of its last command, so a failure on the left can go unnoticed. In Bash, \`set -o pipefail\` makes the pipeline fail if any of its commands fails.`,
        ar: `## إعادة التوجيه والأنابيب 🔀

تبدأ كل عملية بثلاثة **واصفات ملفات (file descriptors)** مفتوحة: **0 = stdin** و**1 = stdout** و**2 = stderr**. البرنامج يقرأ الواصف 0 ويكتب في الواصفين 1 و2 فحسب؛ أما **الصدفة (shell)** فهي التي تقرّر بماذا تتصل قبل أن تنفّذ \`exec\` للبرنامج:

\`\`\`
sort names.txt > sorted.txt        # fd 1 goes to a file (created or truncated)
echo done >> build.log             # append instead of truncate
wc -l < names.txt                  # fd 0 comes from a file
make 2> errors.txt                 # only stderr goes to the file
make > all.txt 2>&1                # stdout to the file, then stderr to wherever stdout points now
find / -name '*.conf' 2>/dev/null  # throw the "Permission denied" noise away
\`\`\`

الترتيب مهم: \`2>&1\` تنسخ ما يشير إليه الواصف 1 **في تلك اللحظة**. فالأمر \`cmd > all.txt 2>&1\` يرسل المجريين كليهما إلى الملف، بينما \`cmd 2>&1 > all.txt\` يرسل stderr إلى الطرفية وstdout وحده إلى الملف.

**الأنبوب (pipe)** \`|\` يصل stdout لأمر بـ stdin للأمر التالي. تستدعي الصدفة \`pipe()\` فتحصل على مخزن مؤقت في النواة له طرف كتابة وطرف قراءة، ثم تنفّذ \`fork\` مرة لكل أمر وتوصل الطرفين بالواصفين 1 و0. وتعمل كل أوامر خط الأنابيب **في الوقت نفسه**: الكاتب الذي يملأ المخزن (سعته الافتراضية في لينكس 64 KiB، راجع \`pipe(7)\`) يُحجب حتى يلحق به القارئ، والقارئ يُحجب حتى تصل البيانات.

\`\`\`
ps -e --no-headers | wc -l   # how many processes (ps and wc included)? two programs, one pipe
\`\`\`

**حالة الخروج (exit status)** لخط الأنابيب هي حالة آخر أوامره، فقد يمرّ فشل في الطرف الأيسر دون أن يُلاحظ. وفي Bash يجعل الأمر \`set -o pipefail\` خط الأنابيب يفشل إذا فشل أي أمر من أوامره.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The text toolbox: sort, uniq, cut, awk 🧰

Unix tools each do one job and talk through plain lines of text, so pipes can combine them:

- \`cut -d: -f1,7 /etc/passwd\`: keep fields 1 and 7, using \`:\` as the separator
- \`sort\`: sort lines; \`-n\` numeric, \`-r\` reverse, \`-t:\` field separator, \`-k3,3n\` sort by field 3 as a number. Prefix \`LC_ALL=C\` for plain byte order, the same on every machine
- \`uniq\`: drop **adjacent** duplicate lines; \`-c\` prefixes each line with its count. Because only neighbours are merged, you almost always \`sort\` first
- \`awk\`: a small language for columns. It splits each line into fields \`$1\`, \`$2\`, ... (\`-F:\` changes the separator) and runs \`pattern { action }\` for every matching line. \`NR\` is the line number, \`NF\` the number of fields, and an \`END { }\` block runs after the last line

\`\`\`
awk -F: '$3 >= 1000 { print $1 }' /etc/passwd     # names of regular users
awk '{ sum += $2 } END { print sum }' sizes.txt    # add up column 2
\`\`\`

The most famous pipeline counts things. Which IP addresses hit a web server most often?

\`\`\`
cut -d' ' -f1 access.log | sort | uniq -c | sort -rn | head -3
     42 203.0.113.9
     17 198.51.100.4
      5 192.0.2.77
\`\`\`

\`cut\` extracts the first field, \`sort\` groups equal lines, \`uniq -c\` counts each group, \`sort -rn\` puts the biggest count first and \`head\` keeps the top three. (The addresses come from the documentation ranges reserved by RFC 5737.)

Now build the same kind of pipeline over a passwd file.`,
        ar: `## صندوق أدوات النصوص: sort وuniq وcut وawk 🧰

تؤدي كل أداة من أدوات يونكس مهمة واحدة وتتواصل عبر أسطر نصية بسيطة، فتستطيع الأنابيب الجمع بينها:

- \`cut -d: -f1,7 /etc/passwd\`: أبقِ الحقلين 1 و7 مستخدماً \`:\` فاصلاً
- \`sort\`: ترتّب الأسطر؛ \`-n\` ترتيب عددي، و\`-r\` عكسي، و\`-t:\` فاصل الحقول، و\`-k3,3n\` الترتيب حسب الحقل 3 كعدد. ضع \`LC_ALL=C\` قبلها لترتيب بايتي بسيط يتطابق على كل جهاز
- \`uniq\`: تحذف الأسطر المكرّرة **المتجاورة**؛ و\`-c\` تضع قبل كل سطر عدد مرات تكراره. ولأنها تدمج الجيران فقط فأنت تحتاج \`sort\` قبلها في أغلب الأحيان
- \`awk\`: لغة صغيرة للأعمدة. تقسم كل سطر إلى حقول \`$1\` و\`$2\` ... (و\`-F:\` تغيّر الفاصل) وتنفّذ \`pattern { action }\` لكل سطر مطابق. \`NR\` رقم السطر، و\`NF\` عدد الحقول، وكتلة \`END { }\` تعمل بعد آخر سطر

\`\`\`
awk -F: '$3 >= 1000 { print $1 }' /etc/passwd     # names of regular users
awk '{ sum += $2 } END { print sum }' sizes.txt    # add up column 2
\`\`\`

أشهر خط أنابيب هو الذي يعدّ الأشياء. ما عناوين IP التي زارت خادم الويب أكثر من غيرها؟

\`\`\`
cut -d' ' -f1 access.log | sort | uniq -c | sort -rn | head -3
     42 203.0.113.9
     17 198.51.100.4
      5 192.0.2.77
\`\`\`

تستخرج \`cut\` الحقل الأول، وتجمع \`sort\` الأسطر المتساوية، وتعدّ \`uniq -c\` كل مجموعة، وتضع \`sort -rn\` العدد الأكبر أولاً، وتُبقي \`head\` الثلاثة الأولى. (العناوين من نطاقات التوثيق التي يحجزها RFC 5737.)

ابنِ الآن خط أنابيب من النوع نفسه على ملف passwd.`,
      },
    },
    {
      type: "lab",
      id: "passwd-report",
      lang: "bash",
      prompt: {
        en: `Write a shell pipeline that reports on a file in \`/etc/passwd\` format, read from **stdin**.

**Input:** zero or more lines \`name:password:UID:GID:GECOS:home:shell\` (seven fields separated by \`:\`; the GECOS field may contain spaces and commas).

**Output:**
1. One line \`<count> <shell>\` per login shell (field 7), the most used shell first; shells with the same count are sorted by name (byte order). As \`passwd(5)\` says, an **empty** shell field means \`/bin/sh\`.
2. A last line \`humans: <names>\` with every account whose UID is **1000 or more**, except \`65534\` (\`nobody\`), in input order and separated by single spaces, or \`humans: none\`.

**Example:**

\`\`\`
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
ana:x:1000:1000:Ana Silva,,,:/home/ana:/bin/bash
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
\`\`\`

prints

\`\`\`
2 /bin/bash
2 /usr/sbin/nologin
humans: ana
\`\`\``,
        ar: `اكتب خط أنابيب في الـ shell يلخّص ملفاً بصيغة \`/etc/passwd\` يُقرأ من **stdin**.

**المدخل:** صفر أو أكثر من الأسطر بالشكل \`name:password:UID:GID:GECOS:home:shell\` (سبعة حقول يفصلها \`:\`؛ وقد يحتوي حقل GECOS على مسافات وفواصل).

**المخرج:**
1. سطر \`<count> <shell>\` لكل صدفة دخول (الحقل 7)، الأكثر استخداماً أولاً؛ والصدفات المتساوية في العدد تُرتَّب حسب الاسم (ترتيباً بايتياً). وكما يقول \`passwd(5)\`، حقل الصدفة **الفارغ** يعني \`/bin/sh\`.
2. سطر أخير \`humans: <names>\` بكل حساب معرّفه UID **يساوي 1000 أو أكثر**، باستثناء \`65534\` (\`nobody\`)، بترتيب المدخل ومفصولة بمسافة واحدة، أو \`humans: none\`.

**مثال:**

\`\`\`
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
ana:x:1000:1000:Ana Silva,,,:/home/ana:/bin/bash
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
\`\`\`

يطبع

\`\`\`
2 /bin/bash
2 /usr/sbin/nologin
humans: ana
\`\`\``,
      },
      starterCode: String.raw`#!/usr/bin/env bash
# Read the whole passwd-style file from stdin.
data=$(cat)

# TODO 1: print "<count> <shell>" for every login shell (field 7), most used first,
#   ties sorted by shell name. An empty shell field counts as /bin/sh.
#   Idea: awk -F: to print field 7, then sort | uniq -c, reshape with awk,
#   and sort again with: LC_ALL=C sort -k1,1nr -k2,2

# TODO 2: print "humans:" followed by the names of accounts with UID >= 1000
#   (except 65534, nobody), in input order, or "humans: none".
echo "humans: none"
`,
      solution: String.raw`#!/usr/bin/env bash
# Read the whole passwd-style file from stdin.
data=$(cat)

# 1) Login shell (field 7) of every account; an empty field means /bin/sh.
#    Count each shell, then sort by count (high first) and by name on ties.
printf '%s\n' "$data" \
  | awk -F: 'NF >= 7 { if ($7 == "") print "/bin/sh"; else print $7 }' \
  | LC_ALL=C sort \
  | uniq -c \
  | awk '{ print $1 " " $2 }' \
  | LC_ALL=C sort -k1,1nr -k2,2

# 2) Regular (human) accounts: UID 1000 or more, except nobody (65534).
humans=$(printf '%s\n' "$data" | awk -F: 'NF >= 7 && $3 >= 1000 && $3 != 65534 { printf " %s", $1 }')
if [ -z "$humans" ]; then
  echo "humans: none"
else
  echo "humans:$humans"
fi
`,
      hints: [
        {
          en: "awk -F: '{ print $7 }' prints the shell of every line. Turn an empty field into /bin/sh inside awk: if ($7 == \"\") print \"/bin/sh\"; else print $7. Add NF >= 7 as the pattern so the empty line that printf adds for empty input is ignored.",
          ar: "يطبع awk -F: '{ print $7 }' صدفة كل سطر. حوّل الحقل الفارغ إلى /bin/sh داخل awk: if ($7 == \"\") print \"/bin/sh\"; else print $7. وأضف النمط NF >= 7 كي يُتجاهل السطر الفارغ الذي تضيفه printf عند المدخل الفارغ.",
        },
        {
          en: "sort | uniq -c prints lines like \"      2 /bin/bash\". Reshape them with awk '{ print $1 \" \" $2 }', then LC_ALL=C sort -k1,1nr -k2,2 sorts by the count (numeric, reversed) and breaks ties by the shell name.",
          ar: "يطبع sort | uniq -c أسطراً مثل \"      2 /bin/bash\". أعد تشكيلها بـ awk '{ print $1 \" \" $2 }'، ثم يرتّب LC_ALL=C sort -k1,1nr -k2,2 حسب العدد (عددياً وعكسياً) ويحسم التعادل باسم الصدفة.",
        },
        {
          en: "For the humans line, awk compares $3 >= 1000 as numbers because the field looks numeric (so 999 is below 1000). Collect names with printf \" %s\", $1, store the result in a variable, and test it with [ -z \"$humans\" ].",
          ar: "في سطر humans يقارن awk الشرط $3 >= 1000 عددياً لأن الحقل يبدو رقماً (فيكون 999 أقل من 1000). اجمع الأسماء بـ printf \" %s\", $1، وخزّن النتيجة في متغير، واختبرها بـ [ -z \"$humans\" ].",
        },
      ],
      tests: [
        {
          name: { en: "Example from the prompt", ar: "المثال من نص المسألة" },
          stdin: "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nana:x:1000:1000:Ana Silva,,,:/home/ana:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\n",
          expected: `2 /bin/bash
2 /usr/sbin/nologin
humans: ana`,
        },
        {
          name: { en: "Ties, an empty shell field and nobody", ar: "تعادل وحقل صدفة فارغ وnobody" },
          stdin: "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nsshd:x:110:65534::/run/sshd:/usr/sbin/nologin\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\nana:x:1000:1000:Ana Silva,,,:/home/ana:/bin/bash\nomar:x:1001:1001:Omar:/home/omar:/bin/zsh\nsync:x:4:65534:sync:/bin:/bin/sync\nlegacy:x:1002:1002::/home/legacy:\n",
          expected: `3 /usr/sbin/nologin
2 /bin/bash
1 /bin/sh
1 /bin/sync
1 /bin/zsh
humans: ana omar legacy`,
        },
        {
          name: { en: "Empty input", ar: "مدخل فارغ" },
          stdin: "",
          expected: "humans: none",
        },
        {
          name: { en: "Only system accounts", ar: "حسابات النظام فقط" },
          stdin: "root:x:0:0:root:/root:/bin/bash\nsync:x:4:65534:sync:/bin:/bin/sync\n",
          expected: `1 /bin/bash
1 /bin/sync
humans: none`,
        },
        {
          name: { en: "UIDs compare as numbers: 999 is a system account", ar: "المعرّفات تُقارن كأعداد: 999 حساب نظام" },
          stdin: "svc:x:999:999::/var/lib/svc:/usr/sbin/nologin\nlina:x:1000:1000:Lina:/home/lina:/bin/zsh\nzed:x:60001:60001:Zed:/home/zed:/bin/zsh\n",
          expected: `2 /bin/zsh
1 /usr/sbin/nologin
humans: lina zed`,
        },
      ],
      sampleInput: "root:x:0:0:root:/root:/bin/bash\nana:x:1000:1000:Ana Silva,,,:/home/ana:/bin/bash\n",
    },
    {
      type: "quiz",
      questions: [
        {
          q: {
            en: "Your current directory is /home/ana/projects. Which file does the relative path ../../omar/./notes.txt name?",
            ar: "مجلدك الحالي هو /home/ana/projects. أي ملف يسمّيه المسار النسبي ../../omar/./notes.txt؟",
          },
          choices: [
            { en: "/home/ana/omar/notes.txt", ar: "/home/ana/omar/notes.txt" },
            { en: "/omar/notes.txt", ar: "/omar/notes.txt" },
            { en: "/home/omar/notes.txt", ar: "/home/omar/notes.txt" },
            { en: "/home/ana/projects/omar/notes.txt", ar: "/home/ana/projects/omar/notes.txt" },
          ],
          answer: 2,
          explain: {
            en: "Start at /home/ana/projects: the first .. goes to /home/ana, the second to /home, then omar enters /home/omar, . changes nothing and notes.txt is the file: /home/omar/notes.txt.",
            ar: "ابدأ من /home/ana/projects: الأولى .. تنقلك إلى /home/ana، والثانية إلى /home، ثم omar تدخل /home/omar، و. لا تغيّر شيئاً، وnotes.txt هو الملف: /home/omar/notes.txt.",
          },
        },
        {
          q: {
            en: "A file owned by ana has mode 044 (----r--r--). Can ana read it?",
            ar: "ملف تملكه ana صلاحياته 044 (----r--r--). هل تستطيع ana قراءته؟",
          },
          choices: [
            { en: "Yes, because everybody else may read it and ana is somebody", ar: "نعم، لأن كل من سواها يستطيع القراءة وana واحدة من الناس" },
            { en: "No: ana is the owner, so only the owner bits (---) are checked", ar: "لا: ana هي المالكة، فلا تُفحص إلا بتّات المالك (---)" },
            { en: "Yes, an owner can always read their own files", ar: "نعم، فالمالك يستطيع دائماً قراءة ملفاته" },
            { en: "Only if ana is also in the file's group", ar: "فقط إن كانت ana في مجموعة الملف أيضاً" },
          ],
          answer: 1,
          explain: {
            en: "The kernel picks exactly one class: the owner class matches first, and its bits are ---, so reading is denied. The owner may still chmod the file (only the owner or root can change the mode), but until then the read fails.",
            ar: "تختار النواة فئة واحدة بالضبط: فئة المالك تتطابق أولاً وبتّاتها ---، فتُمنع القراءة. تستطيع المالكة مع ذلك تنفيذ chmod على الملف (لا يغيّر الصلاحيات إلا المالك أو الجذر)، لكن القراءة تفشل حتى تفعل.",
          },
        },
        {
          q: {
            en: "Which permissions do you need to delete /data/report.txt?",
            ar: "ما الصلاحيات التي تحتاجها لحذف /data/report.txt؟",
          },
          choices: [
            { en: "w on report.txt", ar: "w على report.txt" },
            { en: "r and w on report.txt", ar: "r وw على report.txt" },
            { en: "x on report.txt", ar: "x على report.txt" },
            { en: "w and x on the directory /data", ar: "w وx على المجلد /data" },
          ],
          answer: 3,
          explain: {
            en: "Deleting removes a name from the directory, so it needs w (change entries) and x (reach names) on /data; the file's own bits do not matter. A sticky bit on /data would add one more rule: only the file's owner (or the directory's owner, or root) may delete it.",
            ar: "الحذف يزيل اسماً من المجلد، فيحتاج w (تعديل المداخل) وx (الوصول إلى الأسماء) على /data؛ ولا تهمّ بتّات الملف نفسه. ولو كان البتّ اللاصق مضبوطاً على /data لأضاف قاعدة أخرى: لا يحذف الملف إلا مالكه (أو مالك المجلد أو الجذر).",
          },
        },
        {
          q: {
            en: "What is the difference between cmd > out.txt 2>&1 and cmd 2>&1 > out.txt?",
            ar: "ما الفرق بين cmd > out.txt 2>&1 وcmd 2>&1 > out.txt؟",
          },
          choices: [
            { en: "The first sends stdout and stderr to out.txt; the second sends only stdout there and stderr to where stdout pointed before (the terminal)", ar: "الأول يرسل stdout وstderr إلى out.txt؛ والثاني يرسل stdout وحده إليه وstderr إلى حيث كان يشير stdout من قبل (الطرفية)" },
            { en: "There is no difference: both send everything to out.txt", ar: "لا فرق: كلاهما يرسل كل شيء إلى out.txt" },
            { en: "The first is a syntax error", ar: "الأول خطأ في الصياغة" },
            { en: "The second appends to out.txt instead of truncating it", ar: "الثاني يُلحق بـ out.txt بدلاً من تفريغه" },
          ],
          answer: 0,
          explain: {
            en: "Redirections are applied left to right, and 2>&1 copies fd 1 as it is at that moment. In the first form fd 1 already points to out.txt; in the second, fd 1 still points to the terminal when stderr copies it.",
            ar: "تُطبَّق عمليات إعادة التوجيه من اليسار إلى اليمين، و2>&1 تنسخ الواصف 1 كما هو في تلك اللحظة. في الصيغة الأولى يشير الواصف 1 إلى out.txt أصلاً؛ وفي الثانية ما يزال يشير إلى الطرفية حين ينسخه stderr.",
          },
        },
        {
          q: {
            en: "Why do pipelines almost always run sort before uniq -c?",
            ar: "لماذا تشغّل خطوط الأنابيب الأمر sort قبل uniq -c في أغلب الأحيان؟",
          },
          choices: [
            { en: "uniq -c only works on numbers, and sort turns lines into numbers", ar: "لأن uniq -c لا تعمل إلا على الأعداد، وsort تحوّل الأسطر إلى أعداد" },
            { en: "uniq merges only adjacent duplicate lines, so equal lines must be next to each other", ar: "لأن uniq تدمج الأسطر المكرّرة المتجاورة فقط، فيجب أن تتجاور الأسطر المتساوية" },
            { en: "sort deletes duplicates, and uniq then counts what is left", ar: "لأن sort تحذف المكرّرات ثم تعدّ uniq ما تبقى" },
            { en: "Without sort, uniq reads its input backwards", ar: "لأن uniq دون sort تقرأ مدخلها بالعكس" },
          ],
          answer: 1,
          explain: {
            en: "uniq compares each line only with the previous one. Unsorted input a b a gives three groups of one; sorted input a a b gives a counted twice and b once. (sort -u removes duplicates but cannot count them.)",
            ar: "تقارن uniq كل سطر بالسطر السابق فقط. فالمدخل غير المرتّب a b a يعطي ثلاث مجموعات من سطر واحد؛ والمدخل المرتّب a a b يعطي a مرتين وb مرة. (يحذف sort -u المكرّرات لكنه لا يعدّها.)",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Linux has **one tree** rooted at \`/\`; other disks are **mounted** into it. Absolute paths start at \`/\`, relative paths at the process's **current directory**; \`.\`, \`..\` and repeated slashes are resolved component by component
- \`~\` is expanded by the **shell**, and \`cd\` is a built-in because the current directory belongs to each process
- The kernel knows **UIDs and GIDs**. Permission bits \`rwx\` for owner, group and other fit in **three octal digits**; on a directory, w means create/delete entries and x means enter
- The kernel checks **exactly one class** (owner, else group, else other); root bypasses read and write checks, and execute needs at least one x bit
- **Redirection** rewires fds 0, 1 and 2 before \`exec\` (\`2>&1\` order matters); a **pipe** connects two concurrently running processes through a kernel buffer
- \`cut\`, \`sort\`, \`uniq -c\` and \`awk\` turn text into answers; you wrote a path resolver, a permission checker and a passwd report

**Practice:** on a Linux machine run \`ls -l /etc/passwd /etc/shadow\`, \`id\`, \`umask\` and \`stat -c '%a %U %G %n' ~\`, then rebuild the IP counting pipeline on any log file you own. **Next:** concurrency and locks, and then file systems, where you will see how a path turns into an inode and disk blocks.`,
        ar: `## الخلاصة

- للينكس **شجرة واحدة** جذرها \`/\`؛ وتُركَّب الأقراص الأخرى فيها. المسارات المطلقة تبدأ من \`/\`، والنسبية من **المجلد الحالي** للعملية؛ وتُحلَّل \`.\` و\`..\` والشرطات المتكررة مكوّناً تلو مكوّن
- تُوسَّع \`~\` على يد **الصدفة**، و\`cd\` أمر مدمج لأن المجلد الحالي ملك لكل عملية
- تعرف النواة **UID وGID**. وبتّات الصلاحيات \`rwx\` للمالك والمجموعة والبقية تتسع في **ثلاثة أرقام ثمانية**؛ وفي المجلد تعني w إنشاء المداخل وحذفها وتعني x الدخول
- تفحص النواة **فئة واحدة بالضبط** (المالك، وإلا المجموعة، وإلا البقية)؛ ويتخطى الجذر فحوص القراءة والكتابة، ويحتاج التنفيذ إلى بتّ x واحد على الأقل
- **إعادة التوجيه** تعيد توصيل الواصفات 0 و1 و2 قبل \`exec\` (وترتيب \`2>&1\` مهم)؛ و**الأنبوب** يصل عمليتين تعملان في الوقت نفسه عبر مخزن مؤقت في النواة
- تحوّل \`cut\` و\`sort\` و\`uniq -c\` و\`awk\` النص إلى إجابات؛ وقد كتبت محلّل مسارات ومدقّق صلاحيات وتقريراً عن ملف passwd

**تدرّب:** على جهاز لينكس نفّذ \`ls -l /etc/passwd /etc/shadow\` و\`id\` و\`umask\` و\`stat -c '%a %U %G %n' ~\`، ثم أعد بناء خط أنابيب عدّ عناوين IP على أي ملف سجلّ تملكه. **التالي:** التزامن والأقفال، ثم أنظمة الملفات حيث سترى كيف يتحول المسار إلى inode وكتل على القرص.`,
      },
    },
  ],
};
