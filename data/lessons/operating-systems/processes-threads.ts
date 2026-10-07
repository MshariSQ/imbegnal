import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "processes-threads",
  title: { en: "Processes & Threads — Programs Come Alive", ar: "العمليات والخيوط — حين تدبّ الحياة في البرنامج" },
  estMinutes: 40,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- The difference between a **program** and a **process**
- What the OS remembers about every process (its **PCB**) and the **five states** a process moves through
- How \`fork\`, \`exec\` and \`wait\` create and clean up processes
- What **threads** are, what they share, and what they keep private
- How to read a \`ps\`-style process table and spot **zombies**

By the end you will have written a real \`fork\`/\`wait\` program in C and a process-state simulator.`,
        ar: `## ماذا ستتعلم

- الفرق بين **البرنامج (program)** و**العملية (process)**
- ما الذي يتذكره نظام التشغيل عن كل عملية (جدول **PCB**) و**الحالات الخمس** التي تمرّ بها العملية
- كيف تُنشئ \`fork\` و\`exec\` و\`wait\` العمليات وتنظّفها
- ما هي **الخيوط (threads)** وما الذي تتشاركه وما الذي تحتفظ به لنفسها
- كيف تقرأ جدول عمليات بأسلوب \`ps\` وتكتشف **عمليات الزومبي**

في النهاية ستكون قد كتبت برنامج \`fork\`/\`wait\` حقيقياً بلغة C ومحاكياً لحالات العمليات.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A recipe is not a meal 🍳

A **program** is a recipe: instructions sitting in a book (a file on disk). Nothing happens until somebody actually cooks.

A **process** is a cook who is cooking right now. The cook has a private kitchen: their own counter space, their own ingredients, and a bookmark showing which step of the recipe they are on. Run the same recipe twice and you get two cooks in two separate kitchens, each unaware of the other.

The operating system is the restaurant manager. It has only a few stoves (CPU cores) and many cooks, so it decides who gets a stove and for how long. To do that it keeps a clipboard for every cook.

### What a process owns

- An **address space**: its private view of memory, split into the **code** (text), **data** (globals), **heap** (memory you \`malloc\`) and **stack** (function calls and local variables)
- **CPU context**: the registers and the **program counter**, the "bookmark" in the recipe
- **Resources**: open files, sockets, the current directory, the user it runs as

The kernel stores this bookkeeping in a **process control block (PCB)**, which also holds the **PID** (process id), the **parent PID**, the **state** and scheduling information. Every process has a parent: on Linux the first process (PID 1, usually \`systemd\`) starts everyone else.`,
        ar: `## الوصفة ليست وجبة 🍳

**البرنامج** وصفة طبخ: تعليمات مكتوبة في كتاب (ملف على القرص). لا يحدث شيء ما لم يبدأ أحدهم بالطبخ فعلاً.

أما **العملية (process)** فهي طبّاخ يطبخ الآن. لهذا الطبّاخ مطبخ خاص: مساحة عمل خاصة ومكوّنات خاصة وعلامة تبيّن أي خطوة من الوصفة وصل إليها. شغّل الوصفة نفسها مرتين فستحصل على طبّاخين في مطبخين منفصلين، لا يعلم أحدهما بالآخر.

نظام التشغيل هو مدير المطعم. لديه مواقد قليلة (أنوية المعالج) وطبّاخون كثر، فيقرّر من يحصل على موقد ولكم من الوقت. ولكي يفعل ذلك يحتفظ بلوحة ملاحظات لكل طبّاخ.

### ما الذي تملكه العملية

- **فضاء عناوين (address space)**: رؤيتها الخاصة للذاكرة، مقسّمة إلى **الشيفرة** (text) و**البيانات** (المتغيرات العامة) و**الكومة (heap)** (الذاكرة التي تحجزها بـ \`malloc\`) و**المكدّس (stack)** (استدعاءات الدوال والمتغيرات المحلية)
- **سياق المعالج**: المسجّلات و**عدّاد البرنامج (program counter)**، أي "العلامة" في الوصفة
- **الموارد**: الملفات المفتوحة والمقابس والمجلد الحالي والمستخدم الذي تعمل باسمه

يخزّن النواة (kernel) هذه المعلومات في **كتلة تحكّم العملية (PCB)**، وفيها أيضاً **PID** (معرّف العملية) و**PID الأب** و**الحالة** ومعلومات الجدولة. لكل عملية أب: في لينكس تبدأ العملية الأولى (PID 1، وغالباً \`systemd\`) بتشغيل الجميع.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The life of a process

A process is not always running. At any moment it is in one of these states:

\`\`\`
              admit             dispatch
   NEW ───────────────▶ READY ───────────────▶ RUNNING ────exit────▶ TERMINATED
                          ▲  ◀──────preempt───────┘  │
                          │                          │ block (wait for I/O)
                          │ wake (I/O finished)      ▼
                          └─────────────────────── WAITING
\`\`\`

- **NEW**: being created
- **READY**: could run, waiting for a CPU
- **RUNNING**: executing on a CPU right now (at most one per core)
- **WAITING** (also called **blocked**): cannot continue until something happens, such as a disk read finishing or a key being pressed
- **TERMINATED**: finished, waiting to be cleaned up

Notice what is **not** allowed: a WAITING process never jumps straight to RUNNING. When its I/O finishes it becomes READY and must queue for the CPU again. Switching the CPU from one process to another is called a **context switch**: the kernel saves the old process's registers into its PCB and loads the new one's.`,
        ar: `## دورة حياة العملية

العملية لا تكون قيد التنفيذ دائماً. في أي لحظة تكون في إحدى هذه الحالات:

\`\`\`
              admit             dispatch
   NEW ───────────────▶ READY ───────────────▶ RUNNING ────exit────▶ TERMINATED
                          ▲  ◀──────preempt───────┘  │
                          │                          │ block (wait for I/O)
                          │ wake (I/O finished)      ▼
                          └─────────────────────── WAITING
\`\`\`

- **NEW**: قيد الإنشاء
- **READY**: جاهزة للتنفيذ وتنتظر معالجاً
- **RUNNING**: تُنفَّذ على معالج الآن (عملية واحدة كحدّ أقصى لكل نواة)
- **WAITING** (وتسمى أيضاً **blocked**): لا تستطيع المتابعة حتى يحدث شيء، كانتهاء قراءة من القرص أو ضغط مفتاح
- **TERMINATED**: انتهت وتنتظر التنظيف

لاحظ ما هو **غير مسموح**: العملية في حالة WAITING لا تقفز مباشرة إلى RUNNING. حين ينتهي الإدخال/الإخراج تصبح READY وعليها أن تقف في الطابور للحصول على المعالج من جديد. تسمى عملية تبديل المعالج من عملية إلى أخرى **تبديل السياق (context switch)**: تحفظ النواة مسجّلات العملية القديمة في الـ PCB الخاص بها وتحمّل مسجّلات الجديدة.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `# A process moves through these states; the OS keeps the current one in the PCB.
TRANSITIONS = {
    "NEW": ["READY"],
    "READY": ["RUNNING"],
    "RUNNING": ["READY", "WAITING", "TERMINATED"],
    "WAITING": ["READY"],
    "TERMINATED": [],
}

def move(state, new_state):
    if new_state not in TRANSITIONS[state]:
        raise ValueError(f"{state} -> {new_state} is not allowed")
    print(f"{state:<10} -> {new_state}")
    return new_state

state = "NEW"
for step in ["READY", "RUNNING", "WAITING", "READY", "RUNNING", "TERMINATED"]:
    state = move(state, step)

try:
    move("WAITING", "RUNNING")  # a blocked process must become READY first
except ValueError as err:
    print("Refused:", err)
`,
      explanation: {
        en: "A table of allowed transitions is all it takes to model a process lifecycle. Try changing a step to see the error for an illegal move.",
        ar: "جدول بالانتقالات المسموحة يكفي لنمذجة دورة حياة العملية. جرّب تغيير إحدى الخطوات لترى الخطأ عند انتقال غير مسموح.",
      },
    },
    {
      type: "text",
      body: {
        en: `## Creating processes: fork, exec, wait

On Unix-like systems a new process is born by **cloning**. \`fork()\` creates a child that is a copy of the caller: same code, same variables, same open files. The magic is that \`fork\` **returns twice**, once in each process:

- in the **parent** it returns the child's PID (a positive number)
- in the **child** it returns \`0\`
- on failure it returns \`-1\` and no child exists

\`\`\`c
#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void) {
    pid_t pid = fork();
    if (pid == 0) {
        printf("child: hello\\n");
        exit(7);                      /* child finishes with status 7 */
    }
    int status;
    waitpid(pid, &status, 0);         /* parent sleeps until the child ends */
    printf("child exited with %d\\n", WEXITSTATUS(status));
    return 0;
}
\`\`\`

Three calls form the Unix process toolkit:

- **\`fork()\`** clones the current process
- **\`exec()\`** (a family: \`execl\`, \`execvp\`, ...) replaces the current process's code with a different program. The PID stays the same. A shell runs \`ls\` by doing \`fork\` and then \`exec("ls")\` in the child
- **\`wait()\` / \`waitpid()\`** lets a parent collect a child's **exit status**

### Zombies and orphans

When a child exits, the kernel keeps a tiny record (its PID and exit status) until the parent calls \`wait\`. A child in that "dead but not yet collected" state is a **zombie** (\`Z\` in \`ps\`). It uses no CPU, and you cannot \`kill\` it, because it is already dead; the fix is for the parent to \`wait\` (or for the parent to exit, after which PID 1 adopts and reaps the zombie). An **orphan** is the opposite case: a child whose parent exited first. It is simply adopted by PID 1 and keeps running.

### Careful: buffered output and fork

When stdout is a pipe or file, C's \`printf\` collects text in a **buffer** and writes it later. \`fork\` copies that unwritten buffer too, so the child can print the parent's old lines a second time when it exits. Call \`fflush(stdout)\` before \`fork\`. You will meet this bug in the first lab.`,
        ar: `## إنشاء العمليات: fork وexec وwait

في أنظمة يونكس تولد العملية الجديدة بـ**الاستنساخ**. تنشئ \`fork()\` عملية ابنة هي نسخة من المستدعي: الشيفرة نفسها والمتغيرات نفسها والملفات المفتوحة نفسها. والسحر أن \`fork\` **تعود مرتين**، مرة في كل عملية:

- في **الأب** تعيد PID الابن (رقم موجب)
- في **الابن** تعيد \`0\`
- عند الفشل تعيد \`-1\` ولا تُنشأ عملية ابنة

\`\`\`c
#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void) {
    pid_t pid = fork();
    if (pid == 0) {
        printf("child: hello\\n");
        exit(7);                      /* child finishes with status 7 */
    }
    int status;
    waitpid(pid, &status, 0);         /* parent sleeps until the child ends */
    printf("child exited with %d\\n", WEXITSTATUS(status));
    return 0;
}
\`\`\`

ثلاثة استدعاءات تشكّل عدّة يونكس للعمليات:

- **\`fork()\`** تستنسخ العملية الحالية
- **\`exec()\`** (عائلة: \`execl\` و\`execvp\` ...) تستبدل شيفرة العملية الحالية ببرنامج آخر. يبقى الـ PID كما هو. يشغّل الـ shell الأمر \`ls\` بتنفيذ \`fork\` ثم \`exec("ls")\` في الابن
- **\`wait()\` / \`waitpid()\`** تتيح للأب جمع **حالة الخروج (exit status)** للابن

### الزومبي واليتامى

حين تنتهي عملية ابنة تحتفظ النواة بسجلّ صغير (الـ PID وحالة الخروج) حتى يستدعي الأب \`wait\`. العملية الابنة في هذه الحالة "ميتة لكن لم تُجمع بعد" تسمى **زومبي (zombie)** (الحرف \`Z\` في \`ps\`). لا تستهلك معالجاً، ولا يمكنك قتلها بـ\`kill\` لأنها ميتة أصلاً؛ الحل أن يستدعي الأب \`wait\` (أو أن ينتهي الأب، فتتبنّى العملية PID 1 الزومبي وتجمعه). أما **اليتيمة (orphan)** فهي الحالة المعاكسة: ابن انتهى أبوه قبله. تتبنّاه العملية PID 1 ببساطة ويستمر في العمل.

### انتبه: المخزن المؤقت للإخراج مع fork

حين يكون stdout أنبوباً أو ملفاً، تجمع \`printf\` في C النص في **مخزن مؤقت (buffer)** وتكتبه لاحقاً. وتنسخ \`fork\` هذا المخزن غير المكتوب أيضاً، فقد يطبع الابن أسطر الأب القديمة مرة ثانية عند خروجه. استدعِ \`fflush(stdout)\` قبل \`fork\`. ستصادف هذه المشكلة في المختبر الأول.`,
      },
    },
    {
      type: "lab",
      id: "fork-children",
      lang: "c",
      prompt: {
        en: `Write a C program that spawns children **one at a time** and reaps each before starting the next, so the output order is always the same.

**Input:** one integer \`n\` (0 to 10).

**Behaviour:**
1. Print \`parent: starting n children\`
2. For \`i\` from 1 to \`n\`: \`fork\` a child. The child prints \`child i: running\` and exits with status \`i * 10\`. The parent waits for that child and prints \`parent: child i exited with status S\` (use \`WEXITSTATUS\`)
3. Finally print \`parent: all children reaped\`

**Example** (input \`2\`):

\`\`\`
parent: starting 2 children
child 1: running
parent: child 1 exited with status 10
child 2: running
parent: child 2 exited with status 20
parent: all children reaped
\`\`\`

Watch out: the output goes through a pipe, so it is buffered. Without a flush, children re-print the parent's pending lines.`,
        ar: `اكتب برنامج C يُنشئ العمليات الابنة **واحدة تلو الأخرى** ويجمع كل واحدة قبل بدء التالية، فيكون ترتيب الإخراج ثابتاً دائماً.

**المدخل:** عدد صحيح واحد \`n\` (من 0 إلى 10).

**السلوك:**
1. اطبع \`parent: starting n children\`
2. من \`i = 1\` إلى \`n\`: نفّذ \`fork\` لابن. يطبع الابن \`child i: running\` ثم ينتهي بالحالة \`i * 10\`. ينتظر الأب هذا الابن ثم يطبع \`parent: child i exited with status S\` (استخدم \`WEXITSTATUS\`)
3. في النهاية اطبع \`parent: all children reaped\`

**مثال** (المدخل \`2\`):

\`\`\`
parent: starting 2 children
child 1: running
parent: child 1 exited with status 10
child 2: running
parent: child 2 exited with status 20
parent: all children reaped
\`\`\`

انتبه: الإخراج يمرّ عبر أنبوب، فهو مخزَّن مؤقتاً. بدون تفريغ (flush) ستعيد الأبناء طباعة أسطر الأب المعلّقة.`,
      },
      starterCode: String.raw`#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    printf("parent: starting %d children\n", n);

    for (int i = 1; i <= n; i++) {
        // TODO 1: flush stdout before every fork (see hint 1)
        // TODO 2: fork() a child. In the child: print "child i: running", then exit(i * 10)
        // TODO 3: in the parent: waitpid() for that child and print
        //         "parent: child i exited with status S" using WEXITSTATUS(status)
    }

    printf("parent: all children reaped\n");
    return 0;
}
`,
      solution: String.raw`#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    printf("parent: starting %d children\n", n);

    for (int i = 1; i <= n; i++) {
        // Empty the stdio buffer first: fork copies it, and the child would print it again.
        fflush(stdout);
        pid_t pid = fork();
        if (pid < 0) {
            perror("fork");
            return 1;
        }
        if (pid == 0) {
            printf("child %d: running\n", i);
            exit(i * 10); // exit() flushes the child's buffer
        }
        int status;
        waitpid(pid, &status, 0);
        printf("parent: child %d exited with status %d\n", i, WEXITSTATUS(status));
    }

    printf("parent: all children reaped\n");
    return 0;
}
`,
      hints: [
        {
          en: "fork() returns 0 in the child and the child's PID in the parent. Test pid == 0 to decide who is who.",
          ar: "تعيد fork() القيمة 0 في الابن وPID الابن في الأب. اختبر pid == 0 لتعرف من هو من.",
        },
        {
          en: "In the child, finish with exit(i * 10) so it never continues the loop and forks children of its own.",
          ar: "في الابن، أنهِ بـ exit(i * 10) كي لا يتابع الحلقة وينشئ أبناء له.",
        },
        {
          en: "Call fflush(stdout) right before fork(), otherwise the child inherits the parent's unflushed lines and prints them again. In the parent use waitpid(pid, &status, 0) and WEXITSTATUS(status).",
          ar: "استدعِ fflush(stdout) قبل fork() مباشرة، وإلا ورث الابن أسطر الأب غير المفرَّغة وطبعها مرة ثانية. في الأب استخدم waitpid(pid, &status, 0) وWEXITSTATUS(status).",
        },
      ],
      tests: [
        {
          name: { en: "Three children", ar: "ثلاثة أبناء" },
          stdin: "3\n",
          expected: `parent: starting 3 children
child 1: running
parent: child 1 exited with status 10
child 2: running
parent: child 2 exited with status 20
child 3: running
parent: child 3 exited with status 30
parent: all children reaped`,
        },
        {
          name: { en: "A single child", ar: "ابن واحد" },
          stdin: "1\n",
          expected: `parent: starting 1 children
child 1: running
parent: child 1 exited with status 10
parent: all children reaped`,
        },
        {
          name: { en: "Zero children: no fork at all", ar: "صفر أبناء: دون أي fork" },
          stdin: "0\n",
          expected: `parent: starting 0 children
parent: all children reaped`,
        },
        {
          name: { en: "Five children (no duplicated lines)", ar: "خمسة أبناء (دون أسطر مكرّرة)" },
          stdin: "5\n",
          expected: `parent: starting 5 children
child 1: running
parent: child 1 exited with status 10
child 2: running
parent: child 2 exited with status 20
child 3: running
parent: child 3 exited with status 30
child 4: running
parent: child 4 exited with status 40
child 5: running
parent: child 5 exited with status 50
parent: all children reaped`,
        },
        {
          name: { en: "Upper bound: ten children, last status is 100", ar: "الحد الأعلى: عشرة أبناء وآخر حالة 100" },
          stdin: "10\n",
          expected: `parent: starting 10 children
child 1: running
parent: child 1 exited with status 10
child 2: running
parent: child 2 exited with status 20
child 3: running
parent: child 3 exited with status 30
child 4: running
parent: child 4 exited with status 40
child 5: running
parent: child 5 exited with status 50
child 6: running
parent: child 6 exited with status 60
child 7: running
parent: child 7 exited with status 70
child 8: running
parent: child 8 exited with status 80
child 9: running
parent: child 9 exited with status 90
child 10: running
parent: child 10 exited with status 100
parent: all children reaped`,
        },
      ],
      sampleInput: "2\n",
    },
    {
      type: "text",
      body: {
        en: `## Threads: many hands, one kitchen

Back in the kitchen: instead of hiring a second cook with a whole new kitchen, what if two cooks **share one kitchen**? They share the counter and ingredients, but each follows their own step of the recipe. That is a **thread**.

A process can contain several threads. They run in the **same address space**:

- **Shared:** code, global variables, the **heap**, open files
- **Private to each thread:** its own **stack**, its own registers and program counter, its own thread id

\`\`\`c
#include <pthread.h>
#include <stdio.h>

void *work(void *arg) {
    printf("hello from thread %d\\n", *(int *)arg);
    return NULL;
}

int main(void) {
    pthread_t t;
    int id = 1;
    pthread_create(&t, NULL, work, &id);  /* start a thread */
    pthread_join(t, NULL);                /* wait for it, like wait() for processes */
    return 0;
}
\`\`\`

### Processes vs threads

- **Creating and switching** between threads is cheaper: no new address space is needed
- **Communicating** is easy for threads (just read and write shared memory) but needs great care: two threads changing the same variable at the same time cause a **race condition**. Processes must use explicit tools such as pipes or shared-memory segments
- **Isolation** is weaker with threads: a crash (say, a bad pointer) in one thread takes down the whole process, while a crashed process leaves its siblings alone

Real programs mix both: a web browser typically uses one process per tab (isolation) and many threads inside each (speed). The next topics, scheduling and synchronization, build on this picture.`,
        ar: `## الخيوط: أيادٍ كثيرة، مطبخ واحد

نعود إلى المطبخ: بدل توظيف طبّاخ ثانٍ بمطبخ جديد كلياً، ماذا لو **تشارك طبّاخان مطبخاً واحداً**؟ يتشاركان المنضدة والمكوّنات، لكن كلاً منهما يتبع خطوته الخاصة من الوصفة. هذا هو **الخيط (thread)**.

يمكن أن تحتوي العملية على عدة خيوط. تعمل في **فضاء العناوين نفسه**:

- **مشترَك:** الشيفرة والمتغيرات العامة و**الكومة (heap)** والملفات المفتوحة
- **خاص بكل خيط:** **المكدّس (stack)** الخاص به ومسجّلاته وعدّاد برنامجه ومعرّف الخيط

\`\`\`c
#include <pthread.h>
#include <stdio.h>

void *work(void *arg) {
    printf("hello from thread %d\\n", *(int *)arg);
    return NULL;
}

int main(void) {
    pthread_t t;
    int id = 1;
    pthread_create(&t, NULL, work, &id);  /* start a thread */
    pthread_join(t, NULL);                /* wait for it, like wait() for processes */
    return 0;
}
\`\`\`

### العمليات مقابل الخيوط

- **الإنشاء والتبديل** بين الخيوط أرخص: لا حاجة إلى فضاء عناوين جديد
- **التواصل** سهل بين الخيوط (قراءة وكتابة الذاكرة المشتركة) لكنه يحتاج حذراً شديداً: خيطان يعدّلان المتغير نفسه في الوقت نفسه يسبّبان **حالة سباق (race condition)**. أما العمليات فعليها استخدام أدوات صريحة مثل الأنابيب (pipes) أو مقاطع الذاكرة المشتركة
- **العزل** أضعف مع الخيوط: انهيار (مثل مؤشر خاطئ) في خيط واحد يُسقط العملية كلها، بينما العملية المنهارة لا تؤثر في أخواتها

البرامج الحقيقية تمزج بين الاثنين: متصفح الويب يستخدم عادةً عملية لكل تبويب (للعزل) وخيوطاً كثيرة داخل كل منها (للسرعة). المواضيع التالية، الجدولة والتزامن، تبني على هذه الصورة.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// fork() gives the child a COPY of the parent's memory; threads share ONE memory.
const parentMemory = { counter: 0 };

// "Process": the child works on its own copy (real fork is copy-on-write, same effect)
const childMemory = structuredClone(parentMemory);
childMemory.counter += 10;
console.log("after the child process changes its copy:");
console.log("  parent sees", parentMemory.counter, "| child sees", childMemory.counter);

// "Threads": both hold a reference to the very same object
const sharedMemory = { counter: 0 };
const threadA = sharedMemory;
const threadB = sharedMemory;
threadA.counter += 10;
console.log("after thread A changes the shared memory:");
console.log("  thread B sees", threadB.counter);
`,
      explanation: {
        en: "A copy is private: the parent never sees the child's change. A shared object is visible to everybody, which is both the power and the danger of threads.",
        ar: "النسخة خاصة: لا يرى الأب تغيير الابن أبداً. أما الكائن المشترك فيراه الجميع، وهذه قوة الخيوط وخطرها في آن واحد.",
      },
    },
    {
      type: "lab",
      id: "process-state-simulator",
      lang: "python",
      prompt: {
        en: `Build a tiny **process lifecycle checker** for a single-CPU machine.

**Input:** one event per line, \`<event> <process>\` (for example \`dispatch P1\`). Blank lines are ignored but still count when numbering lines (the first line is line 1).

**Legal transitions:**
- \`new\`: creates the process in state \`NEW\` (the process must not exist yet)
- \`admit\`: \`NEW\` to \`READY\`
- \`dispatch\`: \`READY\` to \`RUNNING\`
- \`preempt\`: \`RUNNING\` to \`READY\`
- \`block\`: \`RUNNING\` to \`WAITING\`
- \`wake\`: \`WAITING\` to \`READY\`
- \`exit\`: \`RUNNING\` to \`TERMINATED\`

**Rules:**
- Anything else (including unknown events and processes that were never created) prints \`line N: illegal EVENT PROCESS in state STATE\` and changes nothing. A process that does not exist has the state \`NONE\`.
- A legal \`dispatch\` while another process is \`RUNNING\` prints \`line N: CPU busy, cannot dispatch PROCESS\` and changes nothing.
- At the end print \`PROCESS: STATE\` for every process, in the order the processes were first created.

**Example:**

\`\`\`
new P1
new P2
admit P1
admit P2
dispatch P1
dispatch P2
block P1
dispatch P2
wake P1
exit P2
\`\`\`

prints

\`\`\`
line 6: CPU busy, cannot dispatch P2
P1: READY
P2: TERMINATED
\`\`\``,
        ar: `ابنِ **مدقّق دورة حياة عمليات** صغيراً لجهاز بمعالج واحد.

**المدخل:** حدث واحد في كل سطر بالشكل \`<event> <process>\` (مثلاً \`dispatch P1\`). تُتجاهل الأسطر الفارغة لكنها تُحتسب عند ترقيم الأسطر (السطر الأول هو السطر 1).

**الانتقالات المسموحة:**
- \`new\`: ينشئ العملية بحالة \`NEW\` (يجب ألا تكون موجودة من قبل)
- \`admit\`: من \`NEW\` إلى \`READY\`
- \`dispatch\`: من \`READY\` إلى \`RUNNING\`
- \`preempt\`: من \`RUNNING\` إلى \`READY\`
- \`block\`: من \`RUNNING\` إلى \`WAITING\`
- \`wake\`: من \`WAITING\` إلى \`READY\`
- \`exit\`: من \`RUNNING\` إلى \`TERMINATED\`

**القواعد:**
- أي شيء آخر (بما فيه الأحداث غير المعروفة والعمليات التي لم تُنشأ قط) يطبع \`line N: illegal EVENT PROCESS in state STATE\` ولا يغيّر شيئاً. العملية غير الموجودة حالتها \`NONE\`.
- أمر \`dispatch\` سليم بينما عملية أخرى في حالة \`RUNNING\` يطبع \`line N: CPU busy, cannot dispatch PROCESS\` ولا يغيّر شيئاً.
- في النهاية اطبع \`PROCESS: STATE\` لكل عملية، بترتيب إنشائها الأول.

**مثال:**

\`\`\`
new P1
new P2
admit P1
admit P2
dispatch P1
dispatch P2
block P1
dispatch P2
wake P1
exit P2
\`\`\`

يطبع

\`\`\`
line 6: CPU busy, cannot dispatch P2
P1: READY
P2: TERMINATED
\`\`\``,
      },
      starterCode: `import sys

# (event, current state) -> next state
TRANSITIONS = {
    ("admit", "NEW"): "READY",
    # TODO 1: add the remaining legal transitions (dispatch, preempt, block, wake, exit)
}

states = {}  # process name -> state; a dict keeps first-created order

for number, line in enumerate(sys.stdin.read().splitlines(), start=1):
    parts = line.split()
    if len(parts) != 2:
        continue  # blank line
    event, name = parts
    # TODO 2: handle "new" (create the process, or report it as illegal if it exists)
    # TODO 3: look up the transition; print the "illegal" message when there is none
    # TODO 4: refuse a legal dispatch while another process is RUNNING ("CPU busy")
    # TODO 5: otherwise apply the transition

# TODO 6: print "NAME: STATE" for every process
`,
      solution: `import sys

# (event, current state) -> next state
TRANSITIONS = {
    ("admit", "NEW"): "READY",
    ("dispatch", "READY"): "RUNNING",
    ("preempt", "RUNNING"): "READY",
    ("block", "RUNNING"): "WAITING",
    ("wake", "WAITING"): "READY",
    ("exit", "RUNNING"): "TERMINATED",
}

states = {}  # process name -> state; a dict keeps first-created order

for number, line in enumerate(sys.stdin.read().splitlines(), start=1):
    parts = line.split()
    if len(parts) != 2:
        continue  # blank line
    event, name = parts
    current = states.get(name, "NONE")

    if event == "new":
        if name in states:
            print(f"line {number}: illegal new {name} in state {current}")
        else:
            states[name] = "NEW"
        continue

    next_state = TRANSITIONS.get((event, current))
    if next_state is None:
        print(f"line {number}: illegal {event} {name} in state {current}")
    elif event == "dispatch" and "RUNNING" in states.values():
        print(f"line {number}: CPU busy, cannot dispatch {name}")
    else:
        states[name] = next_state

for name, state in states.items():
    print(f"{name}: {state}")
`,
      hints: [
        {
          en: "Keep a dict of the legal moves keyed by (event, current_state), and a second dict mapping each process name to its state. dict.get(key) returns None when the move is not allowed.",
          ar: "احتفظ بقاموس للحركات المسموحة مفتاحه (event, current_state)، وقاموس ثانٍ يربط اسم كل عملية بحالتها. تعيد dict.get(key) القيمة None حين لا تكون الحركة مسموحة.",
        },
        {
          en: "\"new\" is special: it is not in the table. It is legal only when the name is not in the states dict yet.",
          ar: "\"new\" حالة خاصة: ليست في الجدول. هي سليمة فقط حين لا يكون الاسم في قاموس الحالات بعد.",
        },
        {
          en: "Check the transition first. Only when it is legal AND the event is dispatch, test whether \"RUNNING\" in states.values() to report CPU busy. Dicts keep insertion order, so the final loop prints in first-created order.",
          ar: "افحص الانتقال أولاً. فقط حين يكون سليماً والحدث dispatch، اختبر هل \"RUNNING\" in states.values() للإبلاغ عن CPU busy. القواميس تحافظ على ترتيب الإدراج، فتطبع الحلقة الأخيرة بترتيب الإنشاء الأول.",
        },
      ],
      tests: [
        {
          name: { en: "Example from the prompt (CPU busy)", ar: "المثال من نص المسألة (CPU busy)" },
          stdin: "new P1\nnew P2\nadmit P1\nadmit P2\ndispatch P1\ndispatch P2\nblock P1\ndispatch P2\nwake P1\nexit P2\n",
          expected: `line 6: CPU busy, cannot dispatch P2
P1: READY
P2: TERMINATED`,
        },
        {
          name: { en: "Illegal events and unknown processes", ar: "أحداث غير سليمة وعمليات غير معروفة" },
          stdin: "admit P1\nnew P1\nnew P1\nblock P1\nsleep P1\n",
          expected: `line 1: illegal admit P1 in state NONE
line 3: illegal new P1 in state NEW
line 4: illegal block P1 in state NEW
line 5: illegal sleep P1 in state NEW
P1: NEW`,
        },
        {
          name: { en: "Empty input prints nothing", ar: "المدخل الفارغ لا يطبع شيئاً" },
          stdin: "",
          expected: "",
        },
        {
          name: { en: "Full lifecycle with preemption and blank lines", ar: "دورة حياة كاملة مع مقاطعة وأسطر فارغة" },
          stdin: "new A\nadmit A\n\ndispatch A\npreempt A\ndispatch A\nblock A\nwake A\ndispatch A\nexit A\n",
          expected: "A: TERMINATED",
        },
        {
          name: { en: "A READY process cannot exit directly", ar: "العملية READY لا تستطيع الخروج مباشرة" },
          stdin: "new A\nadmit A\nexit A\n",
          expected: `line 3: illegal exit A in state READY
A: READY`,
        },
        {
          name: { en: "Two CPUs are not allowed: dispatch is refused until preempt", ar: "لا يُسمح بمعالجين: يُرفض dispatch حتى preempt" },
          stdin: "new A\nnew B\nadmit A\nadmit B\ndispatch A\ndispatch B\npreempt A\ndispatch B\n",
          expected: `line 6: CPU busy, cannot dispatch B
A: READY
B: RUNNING`,
        },
      ],
      sampleInput: "new P1\nadmit P1\ndispatch P1\nblock P1\n",
    },
    {
      type: "text",
      body: {
        en: `## Reading the process table

On Linux, \`ps\` lists processes. A typical listing has columns for the **PID**, the **PPID** (parent PID), the **STAT** (state) and the command:

\`\`\`
  PID  PPID STAT COMMAND
    1     0 Ss   systemd
  801     1 Ssl  dockerd
  955   801 Z+   worker
 1300     1 R+   ps
\`\`\`

The first letter of **STAT** is the state:

- **R**: running or ready (on the run queue)
- **S**: sleeping, waiting for an event (interruptible: a signal can wake it)
- **D**: uninterruptible sleep, usually waiting for disk or other hardware I/O. It cannot be interrupted, which is why a stuck \`D\` process can resist even \`kill -9\`
- **T**: stopped (for example with Ctrl+Z)
- **Z**: zombie, finished but not yet reaped by its parent
- **I**: idle kernel thread

Extra characters after the letter add detail (\`s\` = session leader, \`l\` = multi-threaded, \`+\` = in the foreground). Process 955 above is a zombie whose parent is 801: the fix belongs in the parent (801 must \`wait\` for its children), not in a \`kill\` of 955.

Next you will write a shell pipeline that summarises such a table, the kind of one-liner every sysadmin writes.`,
        ar: `## قراءة جدول العمليات

في لينكس يعرض الأمر \`ps\` العمليات. يضم العرض النموذجي أعمدة لـ**PID** و**PPID** (الـ PID الأب) و**STAT** (الحالة) والأمر:

\`\`\`
  PID  PPID STAT COMMAND
    1     0 Ss   systemd
  801     1 Ssl  dockerd
  955   801 Z+   worker
 1300     1 R+   ps
\`\`\`

الحرف الأول من **STAT** هو الحالة:

- **R**: قيد التنفيذ أو جاهزة (في طابور التشغيل)
- **S**: نائمة تنتظر حدثاً (قابلة للمقاطعة: يمكن لإشارة أن توقظها)
- **D**: نوم غير قابل للمقاطعة، وغالباً بانتظار القرص أو عتاد آخر. لا يمكن مقاطعتها، ولهذا قد تقاوم عملية \`D\` عالقة حتى \`kill -9\`
- **T**: متوقفة (مثلاً بـ Ctrl+Z)
- **Z**: زومبي، انتهت لكن أبوها لم يجمعها بعد
- **I**: خيط نواة خامل

الأحرف الإضافية بعد الحرف تضيف تفاصيل (\`s\` = قائد جلسة، \`l\` = متعددة الخيوط، \`+\` = في المقدمة). العملية 955 أعلاه زومبي أبوها 801: العلاج عند الأب (على 801 أن يستدعي \`wait\` لأبنائه)، لا بتنفيذ \`kill\` على العملية 955.

ستكتب بعد قليل خط أنابيب (pipeline) في الـ shell يلخّص جدولاً كهذا، وهو من الأسطر التي يكتبها كل مسؤول نظام.`,
      },
    },
    {
      type: "lab",
      id: "ps-zombie-hunt",
      lang: "bash",
      prompt: {
        en: `Summarise a \`ps\`-style table read from **stdin** with a shell pipeline.

**Input:** a header line \`PID PPID STAT COMMAND\` followed by one process per line. The command may contain spaces. The state of a process is the **first letter** of its STAT column (\`Ss\` and \`S+\` are both \`S\`).

**Output:**
1. One line \`<letter>: <count>\` per state, sorted alphabetically by letter
2. A last line \`zombies: <pids>\` listing the PIDs of every process whose state is \`Z\`, in input order and separated by single spaces, or \`zombies: none\`

**Example:**

\`\`\`
PID PPID STAT COMMAND
1 0 Ss init
212 1 S sshd
340 212 R+ bash
341 340 Z defunct
\`\`\`

prints

\`\`\`
R: 1
S: 2
Z: 1
zombies: 341
\`\`\`

A table with only the header (or empty input) prints just \`zombies: none\`.`,
        ar: `لخّص جدولاً بأسلوب \`ps\` يُقرأ من **stdin** باستخدام خط أنابيب في الـ shell.

**المدخل:** سطر عناوين \`PID PPID STAT COMMAND\` ثم عملية واحدة في كل سطر. قد يحتوي الأمر على مسافات. حالة العملية هي **الحرف الأول** من عمود STAT (فكل من \`Ss\` و\`S+\` هي \`S\`).

**المخرج:**
1. سطر \`<letter>: <count>\` لكل حالة، مرتّبة أبجدياً حسب الحرف
2. سطر أخير \`zombies: <pids>\` يسرد PID كل عملية حالتها \`Z\` بترتيب ظهورها في المدخل ومفصولة بمسافة واحدة، أو \`zombies: none\`

**مثال:**

\`\`\`
PID PPID STAT COMMAND
1 0 Ss init
212 1 S sshd
340 212 R+ bash
341 340 Z defunct
\`\`\`

يطبع

\`\`\`
R: 1
S: 2
Z: 1
zombies: 341
\`\`\`

الجدول الذي فيه سطر العناوين فقط (أو المدخل الفارغ) يطبع \`zombies: none\` فقط.`,
      },
      starterCode: String.raw`#!/usr/bin/env bash
# Read the whole ps-like table from stdin.
table=$(cat)

# TODO 1: print one line "<letter>: <count>" per process state, sorted by letter.
#   Idea: skip the header, take the first character of column 3,
#   then use sort | uniq -c and reshape the result with awk.

# TODO 2: print "zombies:" followed by the PID of every process whose STAT starts with Z,
#   or "zombies: none" when there are none.
echo "zombies: none"
`,
      solution: String.raw`#!/usr/bin/env bash
# Read the whole ps-like table from stdin.
table=$(cat)

# 1) First letter of STAT for every process (skip the header), counted per letter.
printf '%s\n' "$table" \
  | awk 'NR > 1 && NF >= 4 { print substr($3, 1, 1) }' \
  | LC_ALL=C sort \
  | uniq -c \
  | awk '{ print $2 ": " $1 }'

# 2) PIDs of the zombies, in input order.
zombies=$(printf '%s\n' "$table" | awk 'NR > 1 && $3 ~ /^Z/ { printf " %s", $1 }')
if [ -z "$zombies" ]; then
  echo "zombies: none"
else
  echo "zombies:$zombies"
fi
`,
      hints: [
        {
          en: "awk 'NR > 1 { print substr($3, 1, 1) }' prints the first letter of the third column for every line except the header.",
          ar: "الأمر awk 'NR > 1 { print substr($3, 1, 1) }' يطبع الحرف الأول من العمود الثالث لكل سطر عدا العناوين.",
        },
        {
          en: "Counting is the classic sort | uniq -c pair (uniq only merges neighbouring lines, so sort first). uniq -c prints \"  3 S\", so swap the columns with awk '{ print $2 \": \" $1 }'.",
          ar: "العدّ هو الثنائي الكلاسيكي sort | uniq -c (يدمج uniq الأسطر المتجاورة فقط، لذا رتّب أولاً). يطبع uniq -c الشكل \"  3 S\"، فبدّل العمودين بـ awk '{ print $2 \": \" $1 }'.",
        },
        {
          en: "For the zombies, test $3 ~ /^Z/ in awk and collect $1 with printf \" %s\". Store the result in a variable and use [ -z \"$zombies\" ] to choose between the list and \"none\".",
          ar: "للزومبي، اختبر $3 ~ /^Z/ في awk واجمع $1 بـ printf \" %s\". خزّن النتيجة في متغير واستخدم [ -z \"$zombies\" ] للاختيار بين القائمة و\"none\".",
        },
      ],
      tests: [
        {
          name: { en: "Example from the prompt", ar: "المثال من نص المسألة" },
          stdin: "PID PPID STAT COMMAND\n1 0 Ss init\n212 1 S sshd\n340 212 R+ bash\n341 340 Z defunct\n",
          expected: `R: 1
S: 2
Z: 1
zombies: 341`,
        },
        {
          name: { en: "Several states and two zombies", ar: "حالات متعددة وزومبيان" },
          stdin: "PID PPID STAT COMMAND\n1 0 Ss systemd\n2 0 S kthreadd\n57 2 I kworker/0:1\n801 1 Ssl dockerd\n955 801 Z+ worker\n956 801 Z worker\n1203 1 D backup\n1300 1 R+ ps\n",
          expected: `D: 1
I: 1
R: 1
S: 3
Z: 2
zombies: 955 956`,
        },
        {
          name: { en: "Header only", ar: "سطر العناوين فقط" },
          stdin: "PID PPID STAT COMMAND\n",
          expected: "zombies: none",
        },
        {
          name: { en: "Empty input", ar: "مدخل فارغ" },
          stdin: "",
          expected: "zombies: none",
        },
        {
          name: { en: "No zombies; commands with spaces", ar: "دون زومبي؛ أوامر فيها مسافات" },
          stdin: "PID PPID STAT COMMAND\n10 1 S+ vim\n11 1 S+ less\n12 1 T top\n14 1 S sleep 100\n",
          expected: `S: 3
T: 1
zombies: none`,
        },
      ],
      sampleInput: "PID PPID STAT COMMAND\n1 0 Ss init\n341 340 Z defunct\n",
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What does fork() return inside the newly created child process?", ar: "ماذا تعيد fork() داخل العملية الابنة التي أُنشئت للتو؟" },
          choices: [
            { en: "The child's own PID", ar: "PID الابن نفسه" },
            { en: "0", ar: "0" },
            { en: "The parent's PID", ar: "PID الأب" },
            { en: "-1", ar: "-1" },
          ],
          answer: 1,
          explain: {
            en: "fork returns twice: the child gets 0, the parent gets the child's PID, and -1 means failure (no child). The child can learn its own PID with getpid(). Mixing up the first two is the classic fork mistake.",
            ar: "تعود fork مرتين: يحصل الابن على 0 ويحصل الأب على PID الابن، والقيمة -1 تعني الفشل (لا ابن). يستطيع الابن معرفة PID الخاص به بـ getpid(). الخلط بين الأولى والثانية هو الخطأ الكلاسيكي مع fork.",
          },
        },
        {
          q: { en: "Which of these is private to each thread of a process rather than shared?", ar: "أي مما يلي خاص بكل خيط في العملية وليس مشتركاً؟" },
          choices: [
            { en: "The heap", ar: "الكومة (heap)" },
            { en: "Global variables", ar: "المتغيرات العامة" },
            { en: "Open file descriptors", ar: "واصفات الملفات المفتوحة" },
            { en: "The stack", ar: "المكدّس (stack)" },
          ],
          answer: 3,
          explain: {
            en: "Each thread needs its own stack (and registers) to keep its own function calls and local variables. The heap, globals and open files all live in the shared address space, which is exactly why unsynchronised access causes races.",
            ar: "يحتاج كل خيط إلى مكدّسه الخاص (ومسجّلاته) ليحتفظ باستدعاءات دواله ومتغيراته المحلية. الكومة والمتغيرات العامة والملفات المفتوحة كلها في فضاء العناوين المشترك، ولهذا بالضبط يسبّب الوصول غير المتزامن حالات سباق.",
          },
        },
        {
          q: { en: "A process has just asked to read a file from a slow disk. Which state is it in until the data arrives?", ar: "طلبت عملية للتو قراءة ملف من قرص بطيء. في أي حالة تبقى حتى تصل البيانات؟" },
          choices: [
            { en: "RUNNING, because it is still using the CPU", ar: "RUNNING لأنها ما تزال تستخدم المعالج" },
            { en: "READY, waiting for its turn", ar: "READY تنتظر دورها" },
            { en: "WAITING (blocked)", ar: "WAITING (محجوبة)" },
            { en: "TERMINATED", ar: "TERMINATED" },
          ],
          answer: 2,
          explain: {
            en: "It cannot make progress, so the OS moves it to WAITING and gives the CPU to another process. When the disk finishes it becomes READY (not RUNNING) and queues for the CPU again.",
            ar: "لا تستطيع إحراز تقدّم، فينقلها النظام إلى WAITING ويعطي المعالج لعملية أخرى. وحين ينتهي القرص تصبح READY (لا RUNNING) وتقف في الطابور للحصول على المعالج من جديد.",
          },
        },
        {
          q: { en: "ps shows a process in state Z that uses no CPU. What is the correct fix?", ar: "يعرض ps عملية في الحالة Z لا تستهلك معالجاً. ما العلاج الصحيح؟" },
          choices: [
            { en: "Run kill -9 on the zombie", ar: "تنفيذ kill -9 على الزومبي" },
            { en: "Make its parent call wait() (or terminate the parent so PID 1 reaps it)", ar: "جعل أبيها يستدعي wait() (أو إنهاء الأب ليجمعها PID 1)" },
            { en: "Add more RAM", ar: "إضافة ذاكرة RAM" },
            { en: "Nothing, zombies are normal programs that are just idle", ar: "لا شيء، فالزومبي برامج عادية خاملة" },
          ],
          answer: 1,
          explain: {
            en: "A zombie has already finished; only its process-table entry remains until the parent collects the exit status. Signals cannot kill what is already dead. Lots of zombies point to a parent that forgets to wait().",
            ar: "الزومبي انتهى فعلاً، ولم يبقَ منه إلا مدخله في جدول العمليات حتى يجمع الأب حالة الخروج. الإشارات لا تقتل ما هو ميت أصلاً. كثرة الزومبي تدل على أب ينسى استدعاء wait().",
          },
        },
        {
          q: { en: "Why is switching between two threads of the same process usually cheaper than switching between two processes?", ar: "لماذا يكون التبديل بين خيطين من العملية نفسها أرخص عادةً من التبديل بين عمليتين؟" },
          choices: [
            { en: "Threads have no registers to save", ar: "ليس للخيوط مسجّلات تُحفظ" },
            { en: "Threads always run on different CPUs", ar: "الخيوط تعمل دائماً على معالجات مختلفة" },
            { en: "They share one address space, so the memory mappings and cached translations stay valid", ar: "تتشارك فضاء عناوين واحداً، فتبقى ربوطات الذاكرة والترجمات المخزّنة صالحة" },
            { en: "The kernel does not schedule threads at all", ar: "النواة لا تجدول الخيوط أصلاً" },
          ],
          answer: 2,
          explain: {
            en: "Both kinds of switch save and restore registers. A process switch also changes the address space (page tables, TLB contents), which is the expensive extra part. Threads of one process skip it. (Linux does schedule threads, each as its own schedulable entity.)",
            ar: "كلا نوعي التبديل يحفظ المسجّلات ويستعيدها. أما تبديل العمليات فيغيّر أيضاً فضاء العناوين (جداول الصفحات ومحتوى TLB)، وهذا هو الجزء الإضافي المكلف. خيوط العملية الواحدة تتخطاه. (لينكس يجدول الخيوط فعلاً، كل خيط ككيان قابل للجدولة.)",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A **program** is a file; a **process** is a running program with its own address space, CPU context and resources, tracked by the kernel in a **PCB**
- States: **NEW, READY, RUNNING, WAITING, TERMINATED**. A blocked process returns to READY, never straight to RUNNING
- \`fork\` clones (returns 0 in the child), \`exec\` replaces the program, \`wait\` collects the exit status. An uncollected child is a **zombie**
- **Threads** share the heap, globals and files but keep their own stack and registers: cheaper and easier to share data, but with races and weaker isolation
- You wrote a \`fork\`/\`wait\` program, a lifecycle checker and a \`ps\` summary pipeline

**Practice:** read \`man 2 fork\` and \`man 2 waitpid\`, then try \`ps -eo pid,ppid,stat,comm | head\` on a Linux machine. **Next:** CPU scheduling, how the OS picks which READY process gets the CPU.`,
        ar: `## الخلاصة

- **البرنامج** ملف؛ و**العملية** برنامج قيد التشغيل له فضاء عناوين وسياق معالج وموارد خاصة، وتتتبعه النواة في **PCB**
- الحالات: **NEW وREADY وRUNNING وWAITING وTERMINATED**. العملية المحجوبة تعود إلى READY، ولا تذهب مباشرة إلى RUNNING
- \`fork\` تستنسخ (وتعيد 0 في الابن)، و\`exec\` تستبدل البرنامج، و\`wait\` تجمع حالة الخروج. الابن غير المجموع **زومبي**
- **الخيوط** تتشارك الكومة والمتغيرات العامة والملفات وتحتفظ بمكدّسها ومسجّلاتها: أرخص وأسهل في تبادل البيانات، لكن مع حالات سباق وعزل أضعف
- كتبت برنامج \`fork\`/\`wait\` ومدقّق دورة حياة وخط أنابيب يلخّص \`ps\`

**تدرّب:** اقرأ \`man 2 fork\` و\`man 2 waitpid\`، ثم جرّب \`ps -eo pid,ppid,stat,comm | head\` على جهاز لينكس. **التالي:** جدولة المعالج، أي كيف يختار النظام أي عملية READY تحصل على المعالج.`,
      },
    },
  ],
};
