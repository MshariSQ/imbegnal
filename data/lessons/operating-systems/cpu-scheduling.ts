import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "cpu-scheduling",
  title: { en: "CPU Scheduling — Who Gets the Processor Next?", ar: "جدولة المعالج — من يحصل على المعالج تالياً؟" },
  estMinutes: 40,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why the OS needs a **scheduler** and what it optimises
- The metrics: **arrival, burst, completion, turnaround, waiting**
- **FCFS**, **SJF**, **Round Robin** and **priority** scheduling, and where each one hurts
- **Starvation** and how **aging** fixes it
- How to simulate schedulers and compare them with numbers

You will code three simulators: FCFS vs SJF in Python, Round Robin in Java and priority-with-aging in JavaScript.`,
        ar: `## ماذا ستتعلم

- لماذا يحتاج نظام التشغيل إلى **مُجدوِل (scheduler)** وما الذي يحسّنه
- المقاييس: **الوصول (arrival) والانفجار (burst) والاكتمال (completion) والدوران (turnaround) والانتظار (waiting)**
- جدولة **FCFS** و**SJF** و**Round Robin** و**الأولوية (priority)**، وأين تضرّ كل واحدة
- **التجويع (starvation)** وكيف يعالجه **التقادم (aging)**
- كيف تحاكي المُجدوِلات وتقارنها بالأرقام

ستبرمج ثلاثة محاكيات: FCFS مقابل SJF بلغة Python، وRound Robin بلغة Java، والأولوية مع التقادم بلغة JavaScript.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## One checkout counter, many customers 🛒

Picture a supermarket with **one** open checkout counter. The cashier is the **CPU**, the customers waiting in line are the **processes in the READY queue**, and the store's rule for who goes next is the **scheduling policy**.

- "First come, first served"? Simple and fair, but one customer with a full cart makes everyone behind them wait.
- "Quickest basket first"? Short waits for most people, but the person with the huge cart might wait forever.
- "Everybody gets two minutes, then back of the line"? Nobody waits too long to *start*, but the line shuffles a lot.

That is the whole subject. A real CPU core runs one process at a time, so the OS **scheduler** repeatedly picks the next READY process. It runs when a process blocks or exits, when a timer interrupt ends a time slice, and when a process becomes READY.

### Two kinds of processes

- **CPU-bound**: long stretches of computation (video encoding, compiling)
- **I/O-bound**: short bursts of computing between waits for disk, network or the user (an editor, a web server)

A good scheduler keeps interactive, I/O-bound programs snappy while still letting CPU-bound jobs make progress.

### Preemptive or not?

A **non-preemptive** scheduler lets a process keep the CPU until it blocks or exits. A **preemptive** one can take the CPU away (usually when a timer fires). Every modern general-purpose OS is preemptive, because otherwise one infinite loop would freeze the machine. Each switch costs a **context switch**, which is pure overhead.`,
        ar: `## نافذة دفع واحدة وزبائن كثر 🛒

تخيّل سوبرماركت فيه نافذة دفع **واحدة** مفتوحة. أمينة الصندوق هي **المعالج (CPU)**، والزبائن المنتظرون في الصف هم **العمليات في طابور READY**، وقاعدة المتجر في تحديد من يأتي بعد من هي **سياسة الجدولة (scheduling policy)**.

- "من يأتِ أولاً يُخدَم أولاً"؟ بسيطة وعادلة، لكن زبوناً بعربة ممتلئة يجعل كل من خلفه ينتظر.
- "أصغر سلة أولاً"؟ انتظار قصير لمعظم الناس، لكن صاحب العربة الضخمة قد ينتظر إلى الأبد.
- "لكل واحد دقيقتان ثم يعود إلى آخر الصف"؟ لا ينتظر أحد طويلاً قبل أن *يبدأ*، لكن الصف يُعاد ترتيبه كثيراً.

هذا هو الموضوع كله. نواة المعالج الحقيقية تنفّذ عملية واحدة في كل لحظة، لذا يختار **المُجدوِل** مراراً العملية READY التالية. يعمل المُجدوِل حين تتوقف عملية أو تنتهي، وحين تُنهي مقاطعة المؤقت (timer interrupt) شريحة زمنية، وحين تصبح عملية READY.

### نوعان من العمليات

- **مرتبطة بالمعالج (CPU-bound)**: فترات حساب طويلة (ترميز الفيديو، التصريف)
- **مرتبطة بالإدخال/الإخراج (I/O-bound)**: دفعات حساب قصيرة بين انتظارات القرص أو الشبكة أو المستخدم (محرر نصوص، خادم ويب)

المُجدوِل الجيد يُبقي البرامج التفاعلية المرتبطة بالإدخال/الإخراج سريعة الاستجابة ويدع أعمال المعالج الثقيلة تتقدم أيضاً.

### استباقية أم لا؟

المُجدوِل **غير الاستباقي (non-preemptive)** يترك العملية تحتفظ بالمعالج حتى تتوقف أو تنتهي. أما **الاستباقي (preemptive)** فيستطيع سحب المعالج منها (عادةً حين يطلق المؤقت). كل أنظمة التشغيل العامة الحديثة استباقية، وإلا جمّدت حلقة لا نهائية واحدة الجهاز كله. وكل تبديل يكلّف **تبديل سياق (context switch)** وهو عبء خالص.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Measuring a schedule

To compare policies we need numbers. For each process:

- **Arrival time**: when it enters the READY queue
- **Burst time**: how much CPU time it needs in total
- **Completion time**: the clock value when it finishes
- **Turnaround time** = completion − arrival (how long it was in the system)
- **Waiting time** = turnaround − burst (how long it sat READY without running)
- **Response time** = first run − arrival (how long until it first got the CPU)

Schedulers are usually compared on **average waiting time** and **average turnaround time**, plus fairness and responsiveness.

### A worked example

Four processes (arrival, burst): **P1 (0, 7)**, **P2 (2, 4)**, **P3 (4, 1)**, **P4 (5, 4)**.

- **FCFS** runs them in arrival order: P1 0–7, P2 7–11, P3 11–12, P4 12–16. Waiting times: 0, 5, 7, 7, so the average is **4.75**.
- **SJF** (non-preemptive): at time 7 the ready jobs are P2 (4), P3 (1), P4 (4), so it runs the shortest, P3, first: P1 0–7, P3 7–8, P2 8–12, P4 12–16. Waiting times: 0, 6, 3, 7, so the average is **4.00**.

Run it yourself:`,
        ar: `## قياس الجدولة

لمقارنة السياسات نحتاج إلى أرقام. لكل عملية:

- **زمن الوصول (Arrival time)**: متى تدخل طابور READY
- **زمن الانفجار (Burst time)**: كم من وقت المعالج تحتاجه في المجموع
- **زمن الاكتمال (Completion time)**: قيمة الساعة حين تنتهي
- **زمن الدوران (Turnaround time)** = الاكتمال − الوصول (كم بقيت في النظام)
- **زمن الانتظار (Waiting time)** = الدوران − الانفجار (كم جلست READY دون تنفيذ)
- **زمن الاستجابة (Response time)** = أول تنفيذ − الوصول (كم مرّ حتى حصلت على المعالج أول مرة)

تُقارَن المُجدوِلات عادةً بـ**متوسط زمن الانتظار** و**متوسط زمن الدوران**، إضافة إلى العدالة وسرعة الاستجابة.

### مثال محلول

أربع عمليات (الوصول، الانفجار): **P1 (0, 7)** و**P2 (2, 4)** و**P3 (4, 1)** و**P4 (5, 4)**.

- **FCFS** يشغّلها بترتيب الوصول: P1 من 0 إلى 7، وP2 من 7 إلى 11، وP3 من 11 إلى 12، وP4 من 12 إلى 16. أزمنة الانتظار: 0 و5 و7 و7، فالمتوسط **4.75**.
- **SJF** (غير استباقي): عند الزمن 7 الأعمال الجاهزة هي P2 (4) وP3 (1) وP4 (4)، فيشغّل الأقصر، P3، أولاً: P1 من 0 إلى 7، وP3 من 7 إلى 8، وP2 من 8 إلى 12، وP4 من 12 إلى 16. أزمنة الانتظار: 0 و6 و3 و7، فالمتوسط **4.00**.

شغّله بنفسك:`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `# name -> (arrival, burst): the textbook set from the lesson
procs = {"P1": (0, 7), "P2": (2, 4), "P3": (4, 1), "P4": (5, 4)}

def report(title, order):
    clock = 0
    total_wait = total_turn = 0
    print(title)
    for name in order:
        arrival, burst = procs[name]
        clock = max(clock, arrival)       # the CPU may sit idle until a process arrives
        wait = clock - arrival
        clock += burst
        turnaround = clock - arrival
        total_wait += wait
        total_turn += turnaround
        print(f"  {name}: starts {clock - burst:>2}, finishes {clock:>2}, waited {wait}, turnaround {turnaround}")
    n = len(order)
    print(f"  average wait {total_wait / n:.2f}, average turnaround {total_turn / n:.2f}")

report("FCFS (arrival order)", ["P1", "P2", "P3", "P4"])
report("SJF (shortest ready job first)", ["P1", "P3", "P2", "P4"])
`,
      explanation: {
        en: "The only difference between the two schedules is the order. Same work, but SJF lowers the average wait because short jobs stop waiting behind long ones.",
        ar: "الفرق الوحيد بين الجدولتين هو الترتيب. العمل نفسه، لكن SJF يخفض متوسط الانتظار لأن الأعمال القصيرة لا تعود تنتظر خلف الطويلة.",
      },
    },
    {
      type: "text",
      body: {
        en: `## The classic policies

**FCFS (First Come, First Served).** A plain queue. Easy to implement, no starvation. Its weakness is the **convoy effect**: one long CPU-bound job at the front makes many short jobs wait, so the average wait can be terrible.

**SJF (Shortest Job First).** Always run the ready job with the smallest burst. For a known set of jobs it gives the **lowest possible average waiting time**. Two problems: the OS cannot know the next burst in advance (real systems *estimate* it from the process's history), and long jobs can **starve** if short ones keep arriving. Its preemptive form is **SRTF** (Shortest Remaining Time First).

**Round Robin (RR).** FCFS plus a timer. Each process runs for at most one **time quantum**, then goes to the **back** of the queue. Good response time and fairness. The quantum is a trade-off: if it is huge, RR degenerates into FCFS; if it is tiny, the CPU wastes its time on context switches.

**Priority scheduling.** Each process has a priority, and the highest priority READY process runs. Great for urgent work (audio, interrupts), but low-priority processes can starve. The cure is **aging**: the longer a process waits, the more its priority improves.

**MLFQ (Multi-Level Feedback Queue).** Several queues with different priorities. New jobs start at the top; a job that uses its whole quantum is demoted, while one that blocks early (I/O-bound) stays high; every so often everything is boosted back up to prevent starvation. It learns what each process is like without being told.

Real kernels combine these ideas. Linux's default scheduler aims for fair sharing of CPU time among normal tasks, and offers separate real-time policies (\`SCHED_FIFO\`, \`SCHED_RR\`); see \`man 7 sched\`.

### Your turn: FCFS vs SJF

In the first lab you will simulate both policies, including the awkward case where the CPU sits **idle** until the next process arrives.`,
        ar: `## السياسات الكلاسيكية

**FCFS (من يأتِ أولاً يُخدَم أولاً).** طابور عادي. سهل التنفيذ ولا تجويع فيه. ضعفه هو **تأثير القافلة (convoy effect)**: عمل واحد طويل مرتبط بالمعالج في المقدمة يجعل أعمالاً قصيرة كثيرة تنتظر، فيصير متوسط الانتظار سيئاً جداً.

**SJF (الأقصر أولاً).** شغّل دائماً العمل الجاهز ذا أصغر انفجار. وهو يعطي لمجموعة أعمال معروفة **أقل متوسط انتظار ممكن**. وله مشكلتان: النظام لا يعرف الانفجار التالي مسبقاً (الأنظمة الحقيقية *تقدّره* من تاريخ العملية)، وقد **تتجوّع** الأعمال الطويلة إن ظلّت القصيرة تصل. وصورته الاستباقية هي **SRTF** (أقل زمن متبقٍّ أولاً).

**Round Robin (RR).** هو FCFS مع مؤقت. تعمل كل عملية لمدة **شريحة زمنية (time quantum)** كحدّ أقصى ثم تذهب إلى **آخر** الطابور. استجابة جيدة وعدالة. والشريحة مفاضلة: إن كانت ضخمة تحوّل RR إلى FCFS؛ وإن كانت ضئيلة ضيّع المعالج وقته في تبديلات السياق.

**الجدولة بالأولوية (Priority).** لكل عملية أولوية، وتعمل العملية READY ذات الأولوية الأعلى. ممتازة للأعمال العاجلة (الصوت، المقاطعات)، لكن العمليات منخفضة الأولوية قد تتجوّع. والعلاج هو **التقادم (aging)**: كلما طال انتظار العملية تحسّنت أولويتها.

**MLFQ (طوابير التغذية الراجعة متعددة المستويات).** عدة طوابير بأولويات مختلفة. تبدأ الأعمال الجديدة من الأعلى؛ والعمل الذي يستهلك شريحته كاملة يُخفَّض، بينما الذي يتوقف مبكراً (مرتبط بالإدخال/الإخراج) يبقى عالياً؛ ومن حين لآخر يُرفع كل شيء إلى الأعلى لمنع التجويع. فيتعلّم طبيعة كل عملية دون أن يُخبَر بها.

تجمع النواة الحقيقية هذه الأفكار. المُجدوِل الافتراضي في لينكس يهدف إلى توزيع وقت المعالج بعدالة بين المهام العادية، ويوفّر سياسات منفصلة للزمن الحقيقي (\`SCHED_FIFO\` و\`SCHED_RR\`)؛ راجع \`man 7 sched\`.

### دورك: FCFS مقابل SJF

في المختبر الأول ستحاكي السياستين، بما في ذلك الحالة المربكة حين يبقى المعالج **خاملاً** حتى وصول العملية التالية.`,
      },
    },
    {
      type: "lab",
      id: "fcfs-vs-sjf",
      lang: "python",
      prompt: {
        en: `Simulate **FCFS** and **non-preemptive SJF** on the same set of processes and report both averages.

**Input:** the first number is \`n\`, followed by \`n\` lines \`name arrival burst\` (integers, in any order).

**Rules:**
- The CPU runs one process at a time and never stops a running process.
- If no process has arrived yet, the CPU idles until the next arrival.
- **FCFS** picks the ready process that arrived first (ties: earlier in the input).
- **SJF** picks the ready process with the smallest burst (ties: earlier arrival, then earlier in the input).
- waiting = start − arrival, turnaround = completion − arrival.

**Output:** two lines with the averages rounded to 2 decimals (both 0.00 when \`n\` is 0):

\`\`\`
FCFS avg_wait=<w> avg_turnaround=<t>
SJF avg_wait=<w> avg_turnaround=<t>
\`\`\`

**Example** (the lesson's worked example):

\`\`\`
4
P1 0 7
P2 2 4
P3 4 1
P4 5 4
\`\`\`

prints

\`\`\`
FCFS avg_wait=4.75 avg_turnaround=8.75
SJF avg_wait=4.00 avg_turnaround=8.00
\`\`\``,
        ar: `حاكِ **FCFS** و**SJF غير الاستباقي** على مجموعة العمليات نفسها وأبلغ عن المتوسطين.

**المدخل:** الرقم الأول هو \`n\`، يليه \`n\` سطراً بالشكل \`name arrival burst\` (أعداد صحيحة، بأي ترتيب).

**القواعد:**
- ينفّذ المعالج عملية واحدة في كل لحظة ولا يوقف عملية قيد التنفيذ أبداً.
- إن لم تصل أي عملية بعد، يبقى المعالج خاملاً حتى وصول التالية.
- **FCFS** يختار العملية الجاهزة التي وصلت أولاً (عند التعادل: الأسبق في المدخل).
- **SJF** يختار العملية الجاهزة ذات أصغر انفجار (عند التعادل: الأسبق وصولاً، ثم الأسبق في المدخل).
- الانتظار = البدء − الوصول، والدوران = الاكتمال − الوصول.

**المخرج:** سطران بالمتوسطين مقرَّبين إلى خانتين عشريتين (كلاهما 0.00 حين تكون \`n\` صفراً):

\`\`\`
FCFS avg_wait=<w> avg_turnaround=<t>
SJF avg_wait=<w> avg_turnaround=<t>
\`\`\`

**مثال** (المثال المحلول في الدرس):

\`\`\`
4
P1 0 7
P2 2 4
P3 4 1
P4 5 4
\`\`\`

يطبع

\`\`\`
FCFS avg_wait=4.75 avg_turnaround=8.75
SJF avg_wait=4.00 avg_turnaround=8.00
\`\`\``,
      },
      starterCode: `import sys

def read_processes():
    tokens = sys.stdin.read().split()
    n = int(tokens[0]) if tokens else 0
    return [(tokens[1 + 3 * i], int(tokens[2 + 3 * i]), int(tokens[3 + 3 * i])) for i in range(n)]

def simulate(procs, pick):
    """Run non-preemptively. pick(ready) returns the index of the process to run next.
    Returns (average waiting time, average turnaround time)."""
    # TODO 1: keep a clock and the list of processes that have not run yet
    # TODO 2: collect the ready ones (arrival <= clock); if none, jump the clock to the next arrival
    # TODO 3: run the chosen one to completion and add its waiting and turnaround time
    return 0.0, 0.0

procs = read_processes()

# TODO 4: write the two policies as "pick" functions (see the rules in the prompt)
fcfs = simulate(procs, lambda ready: ready[0])
sjf = simulate(procs, lambda ready: ready[0])

print(f"FCFS avg_wait={fcfs[0]:.2f} avg_turnaround={fcfs[1]:.2f}")
print(f"SJF avg_wait={sjf[0]:.2f} avg_turnaround={sjf[1]:.2f}")
`,
      solution: `import sys

def read_processes():
    tokens = sys.stdin.read().split()
    n = int(tokens[0]) if tokens else 0
    return [(tokens[1 + 3 * i], int(tokens[2 + 3 * i]), int(tokens[3 + 3 * i])) for i in range(n)]

def simulate(procs, pick):
    """Run non-preemptively. pick(ready) returns the index of the process to run next.
    Returns (average waiting time, average turnaround time)."""
    pending = list(range(len(procs)))
    clock = total_wait = total_turn = 0
    while pending:
        ready = [i for i in pending if procs[i][1] <= clock]
        if not ready:
            clock = min(procs[i][1] for i in pending)  # CPU idles until the next arrival
            continue
        i = pick(ready)
        _, arrival, burst = procs[i]
        total_wait += clock - arrival
        clock += burst
        total_turn += clock - arrival
        pending.remove(i)
    n = len(procs)
    return (total_wait / n, total_turn / n) if n else (0.0, 0.0)

procs = read_processes()

# A policy is just "which ready process goes next": min() with a sort key does the job.
# The index is the last key, so remaining ties follow input order.
fcfs = simulate(procs, lambda ready: min(ready, key=lambda i: (procs[i][1], i)))
sjf = simulate(procs, lambda ready: min(ready, key=lambda i: (procs[i][2], procs[i][1], i)))

print(f"FCFS avg_wait={fcfs[0]:.2f} avg_turnaround={fcfs[1]:.2f}")
print(f"SJF avg_wait={sjf[0]:.2f} avg_turnaround={sjf[1]:.2f}")
`,
      hints: [
        {
          en: "Loop while some process has not run. Build ready = [i for i in pending if arrival <= clock]. If it is empty, set clock to the smallest arrival among the pending ones and continue.",
          ar: "كرّر ما دامت هناك عملية لم تُنفَّذ. ابنِ ready = [i for i in pending if arrival <= clock]. إن كانت فارغة فاضبط clock على أصغر زمن وصول بين المعلّقة ثم تابع.",
        },
        {
          en: "Running process i: waiting = clock - arrival; then clock += burst; turnaround = clock - arrival.",
          ar: "عند تشغيل العملية i: الانتظار = clock - arrival؛ ثم clock += burst؛ والدوران = clock - arrival.",
        },
        {
          en: "A policy is a sort key. FCFS: min(ready, key=lambda i: (arrival, i)). SJF: min(ready, key=lambda i: (burst, arrival, i)). Careful with n = 0: avoid dividing by zero.",
          ar: "السياسة مفتاح فرز. FCFS: min(ready, key=lambda i: (arrival, i)). وSJF: min(ready, key=lambda i: (burst, arrival, i)). انتبه لحالة n = 0: تجنّب القسمة على صفر.",
        },
      ],
      tests: [
        {
          name: { en: "The lesson's worked example", ar: "المثال المحلول في الدرس" },
          stdin: "4\nP1 0 7\nP2 2 4\nP3 4 1\nP4 5 4\n",
          expected: `FCFS avg_wait=4.75 avg_turnaround=8.75
SJF avg_wait=4.00 avg_turnaround=8.00`,
        },
        {
          name: { en: "Convoy effect: a long job first", ar: "تأثير القافلة: عمل طويل أولاً" },
          stdin: "3\nP1 0 10\nP2 0 1\nP3 0 1\n",
          expected: `FCFS avg_wait=7.00 avg_turnaround=11.00
SJF avg_wait=1.00 avg_turnaround=5.00`,
        },
        {
          name: { en: "CPU idles between arrivals", ar: "المعالج يخمل بين الوصولين" },
          stdin: "2\nP1 0 2\nP2 10 3\n",
          expected: `FCFS avg_wait=0.00 avg_turnaround=2.50
SJF avg_wait=0.00 avg_turnaround=2.50`,
        },
        {
          name: { en: "Input is not sorted by arrival", ar: "المدخل غير مرتّب حسب الوصول" },
          stdin: "3\nC 3 2\nA 0 4\nB 1 3\n",
          expected: `FCFS avg_wait=2.33 avg_turnaround=5.33
SJF avg_wait=2.00 avg_turnaround=5.00`,
        },
        {
          name: { en: "Single process", ar: "عملية واحدة" },
          stdin: "1\nX 5 6\n",
          expected: `FCFS avg_wait=0.00 avg_turnaround=6.00
SJF avg_wait=0.00 avg_turnaround=6.00`,
        },
        {
          name: { en: "No processes", ar: "لا عمليات" },
          stdin: "0\n",
          expected: `FCFS avg_wait=0.00 avg_turnaround=0.00
SJF avg_wait=0.00 avg_turnaround=0.00`,
        },
      ],
      sampleInput: "4\nP1 0 7\nP2 2 4\nP3 4 1\nP4 5 4\n",
    },
    {
      type: "text",
      body: {
        en: `## Round Robin in motion

Round Robin is the scheduler behind "everybody gets a turn". The rules:

1. Processes wait in a FIFO queue.
2. Take the front process and run it for \`min(quantum, remaining)\` time units.
3. If it still has work left, it goes to the **back** of the queue; otherwise it is done.

One subtle detail every implementation must decide: if a new process **arrives while another is running**, it joins the queue *before* the preempted process is put back. (If both happen at the same instant, the newcomer goes first.) That is the convention you will use in the lab.

Watch it work on A needs 5, B needs 3, C needs 1, quantum 2, all arriving at time 0:`,
        ar: `## Round Robin أثناء العمل

Round Robin هو المُجدوِل خلف فكرة "الجميع يأخذ دوراً". قواعده:

1. تنتظر العمليات في طابور FIFO.
2. خذ العملية الأمامية وشغّلها \`min(quantum, remaining)\` من وحدات الزمن.
3. إن بقي لديها عمل تذهب إلى **آخر** الطابور؛ وإلا فقد انتهت.

تفصيل دقيق يجب أن يحسمه كل تنفيذ: إن **وصلت عملية جديدة أثناء تشغيل أخرى** فإنها تدخل الطابور *قبل* إعادة العملية المقاطَعة إليه. (وإن حدث الأمران في اللحظة نفسها يتقدّم القادم الجديد.) هذه هي الاصطلاحية التي ستستخدمها في المختبر.

شاهده يعمل: A تحتاج 5 وB تحتاج 3 وC تحتاج 1، والشريحة 2، وكلها تصل عند الزمن 0:`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `const quantum = 2;
const queue = [{ name: "A", left: 5 }, { name: "B", left: 3 }, { name: "C", left: 1 }];
let clock = 0;
const gantt = [];

while (queue.length > 0) {
  const p = queue.shift();                    // front of the ready queue
  const run = Math.min(quantum, p.left);
  gantt.push(p.name + " " + clock + "-" + (clock + run));
  clock += run;
  p.left -= run;
  if (p.left > 0) queue.push(p);              // unfinished: back of the queue
  else console.log(p.name + " finishes at " + clock);
}

console.log(gantt.join(" | "));
`,
      explanation: {
        en: "The Gantt chart shows the CPU timeline. Short job C escapes early at time 5, while long job A needs three turns. Change the quantum to 1 or to 10 and see how the timeline changes.",
        ar: "يعرض مخطط غانت الخط الزمني للمعالج. العمل القصير C يخرج مبكراً عند الزمن 5، بينما يحتاج العمل الطويل A إلى ثلاث دورات. غيّر الشريحة إلى 1 أو إلى 10 وانظر كيف يتغير الخط الزمني.",
      },
    },
    {
      type: "lab",
      id: "round-robin",
      lang: "java",
      prompt: {
        en: `Implement **Round Robin** with a given time quantum.

**Input:** the quantum \`q\`, then \`n\`, then \`n\` lines \`name arrival burst\` (integers; any order; names have no spaces).

**Rules:**
- Processes join the ready queue in arrival order (ties: input order).
- The front process runs for \`min(q, remaining)\` units. Processes that arrive at or before the end of that slice are queued **before** the preempted process goes back to the end.
- If the queue is empty, the clock jumps to the next arrival.
- turnaround = finish − arrival, waiting = turnaround − burst.

**Output:** one line per process, **in input order**, then the average waiting time:

\`\`\`
<name>: finish=<f> turnaround=<t> waiting=<w>
...
avg_wait=<x.xx>
\`\`\`

For \`n = 0\` print only \`avg_wait=0.00\`.

**Example:** \`q = 2\`, processes A 0 5, B 0 3, C 0 1:

\`\`\`
A: finish=9 turnaround=9 waiting=4
B: finish=8 turnaround=8 waiting=5
C: finish=5 turnaround=5 waiting=4
avg_wait=4.33
\`\`\``,
        ar: `نفّذ **Round Robin** بشريحة زمنية معطاة.

**المدخل:** الشريحة \`q\`، ثم \`n\`، ثم \`n\` سطراً بالشكل \`name arrival burst\` (أعداد صحيحة؛ بأي ترتيب؛ الأسماء بلا مسافات).

**القواعد:**
- تدخل العمليات طابور الجاهزية بترتيب الوصول (عند التعادل: ترتيب المدخل).
- تعمل العملية الأمامية \`min(q, remaining)\` من الوحدات. العمليات التي تصل في نهاية تلك الشريحة أو قبلها تُدخَل الطابور **قبل** أن تعود العملية المقاطَعة إلى آخره.
- إن كان الطابور فارغاً تقفز الساعة إلى الوصول التالي.
- الدوران = الانتهاء − الوصول، والانتظار = الدوران − الانفجار.

**المخرج:** سطر لكل عملية، **بترتيب المدخل**، ثم متوسط الانتظار:

\`\`\`
<name>: finish=<f> turnaround=<t> waiting=<w>
...
avg_wait=<x.xx>
\`\`\`

عند \`n = 0\` اطبع \`avg_wait=0.00\` فقط.

**مثال:** \`q = 2\` والعمليات A 0 5 وB 0 3 وC 0 1:

\`\`\`
A: finish=9 turnaround=9 waiting=4
B: finish=8 turnaround=8 waiting=5
C: finish=5 turnaround=5 waiting=4
avg_wait=4.33
\`\`\``,
      },
      starterCode: String.raw`import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int quantum = in.nextInt();
        int n = in.nextInt();
        String[] name = new String[n];
        int[] arrival = new int[n];
        int[] burst = new int[n];
        for (int i = 0; i < n; i++) {
            name[i] = in.next();
            arrival[i] = in.nextInt();
            burst[i] = in.nextInt();
        }

        int[] finish = new int[n];
        // TODO 1: remember the processes sorted by arrival (stable sort keeps input order on ties)
        // TODO 2: simulate with an ArrayDeque<Integer> ready queue and a clock:
        //         enqueue arrivals, run the front for min(quantum, remaining), enqueue
        //         newcomers FIRST and then the preempted process, record finish times

        long totalWait = 0;
        for (int i = 0; i < n; i++) {
            int turnaround = finish[i] - arrival[i];
            int waiting = turnaround - burst[i];
            totalWait += waiting;
            System.out.println(name[i] + ": finish=" + finish[i] + " turnaround=" + turnaround + " waiting=" + waiting);
        }
        System.out.println(String.format(Locale.US, "avg_wait=%.2f", n == 0 ? 0.0 : (double) totalWait / n));
    }
}
`,
      solution: String.raw`import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int quantum = in.nextInt();
        int n = in.nextInt();
        String[] name = new String[n];
        int[] arrival = new int[n];
        int[] burst = new int[n];
        for (int i = 0; i < n; i++) {
            name[i] = in.next();
            arrival[i] = in.nextInt();
            burst[i] = in.nextInt();
        }

        // Indices sorted by arrival; the sort is stable, so ties keep input order.
        Integer[] byArrival = new Integer[n];
        for (int i = 0; i < n; i++) byArrival[i] = i;
        Arrays.sort(byArrival, Comparator.comparingInt(i -> arrival[i]));

        int[] remaining = burst.clone();
        int[] finish = new int[n];
        Deque<Integer> ready = new ArrayDeque<>();
        int next = 0;   // next process (in arrival order) that has not been queued yet
        int clock = 0;
        int done = 0;

        while (done < n) {
            while (next < n && arrival[byArrival[next]] <= clock) ready.addLast(byArrival[next++]);
            if (ready.isEmpty()) {
                clock = arrival[byArrival[next]]; // CPU idles until the next arrival
                continue;
            }
            int p = ready.pollFirst();
            int slice = Math.min(quantum, remaining[p]);
            clock += slice;
            remaining[p] -= slice;
            // Newcomers get in line before the preempted process returns.
            while (next < n && arrival[byArrival[next]] <= clock) ready.addLast(byArrival[next++]);
            if (remaining[p] > 0) {
                ready.addLast(p);
            } else {
                finish[p] = clock;
                done++;
            }
        }

        long totalWait = 0;
        for (int i = 0; i < n; i++) {
            int turnaround = finish[i] - arrival[i];
            int waiting = turnaround - burst[i];
            totalWait += waiting;
            System.out.println(name[i] + ": finish=" + finish[i] + " turnaround=" + turnaround + " waiting=" + waiting);
        }
        System.out.println(String.format(Locale.US, "avg_wait=%.2f", n == 0 ? 0.0 : (double) totalWait / n));
    }
}
`,
      hints: [
        {
          en: "State you need: the remaining time per process, a clock, an ArrayDeque for the ready queue and an index next into the arrival-sorted list. Each round, first move every process with arrival <= clock into the queue.",
          ar: "الحالة التي تحتاجها: الزمن المتبقي لكل عملية، وساعة، وArrayDeque لطابور الجاهزية، ومؤشر next في القائمة المرتّبة حسب الوصول. في كل جولة انقل أولاً كل عملية وصلت (arrival <= clock) إلى الطابور.",
        },
        {
          en: "After running the front process for slice = min(quantum, remaining) units, advance the clock, enqueue the newly arrived processes, and only then add the preempted process back if it has time left. Otherwise record finish = clock.",
          ar: "بعد تشغيل العملية الأمامية slice = min(quantum, remaining) من الوحدات، قدّم الساعة، وأدخل العمليات التي وصلت حديثاً، ثم أعد العملية المقاطَعة فقط إن بقي لها زمن. وإلا سجّل finish = clock.",
        },
        {
          en: "Queue empty but processes remain? Jump the clock to the next arrival time. Sort indices with Arrays.sort(Integer[], Comparator): it is stable, which gives the input-order tie-break for free.",
          ar: "الطابور فارغ لكن بقيت عمليات؟ اقفز بالساعة إلى زمن الوصول التالي. رتّب المؤشرات بـ Arrays.sort(Integer[], Comparator): فهو مستقر، وهذا يمنحك حسم التعادل بترتيب المدخل دون جهد.",
        },
      ],
      tests: [
        {
          name: { en: "Example from the prompt (q = 2)", ar: "المثال من نص المسألة (q = 2)" },
          stdin: "2\n3\nA 0 5\nB 0 3\nC 0 1\n",
          expected: `A: finish=9 turnaround=9 waiting=4
B: finish=8 turnaround=8 waiting=5
C: finish=5 turnaround=5 waiting=4
avg_wait=4.33`,
        },
        {
          name: { en: "Textbook case (q = 4)", ar: "حالة الكتاب الدراسي (q = 4)" },
          stdin: "4\n3\nP1 0 24\nP2 0 3\nP3 0 3\n",
          expected: `P1: finish=30 turnaround=30 waiting=6
P2: finish=7 turnaround=7 waiting=4
P3: finish=10 turnaround=10 waiting=7
avg_wait=5.67`,
        },
        {
          name: { en: "A newcomer is queued before the preempted process", ar: "القادم الجديد يُدخَل قبل العملية المقاطَعة" },
          stdin: "2\n3\nA 0 4\nB 1 3\nC 4 1\n",
          expected: `A: finish=6 turnaround=6 waiting=2
B: finish=8 turnaround=7 waiting=4
C: finish=7 turnaround=3 waiting=2
avg_wait=2.67`,
        },
        {
          name: { en: "CPU idles before a late arrival", ar: "المعالج يخمل قبل وصول متأخر" },
          stdin: "3\n2\nA 0 2\nB 10 4\n",
          expected: `A: finish=2 turnaround=2 waiting=0
B: finish=14 turnaround=4 waiting=0
avg_wait=0.00`,
        },
        {
          name: { en: "Quantum 1 with five processes", ar: "شريحة 1 مع خمس عمليات" },
          stdin: "1\n5\nA 0 3\nB 1 2\nC 2 4\nD 6 1\nE 30 2\n",
          expected: `A: finish=6 turnaround=6 waiting=3
B: finish=5 turnaround=4 waiting=2
C: finish=10 turnaround=8 waiting=4
D: finish=8 turnaround=2 waiting=1
E: finish=32 turnaround=2 waiting=0
avg_wait=2.00`,
        },
        {
          name: { en: "No processes", ar: "لا عمليات" },
          stdin: "2\n0\n",
          expected: "avg_wait=0.00",
        },
      ],
      sampleInput: "2\n3\nA 0 5\nB 0 3\nC 0 1\n",
    },
    {
      type: "text",
      body: {
        en: `## Priorities, starvation and aging

Suppose each process has a **priority number** (here, *smaller number = more urgent*, like Unix \`nice\` values where -20 is the most favoured). A strict priority scheduler always runs the most urgent READY process.

The danger is **starvation**: if urgent work keeps arriving, a low-priority process can wait indefinitely. A famous legend says that when the IBM 7094 at MIT was shut down in 1973 they found a low-priority job submitted in 1967 that had never run. Whether or not the story is exact, the problem is real.

**Aging** is the fix: raise the priority of a process every time it waits a while. Eventually even the least important process becomes the most urgent one and gets its turn.

In the next lab each process runs one time unit at a time. Its **effective priority** is

\`\`\`
effective = max(0, priority - floor(waited / A))
\`\`\`

where \`waited\` counts the time units it has spent not running since it last ran and \`A\` is the aging interval. A huge \`A\` means no aging, and you will see starvation in the output.`,
        ar: `## الأولويات والتجويع والتقادم

افترض أن لكل عملية **رقم أولوية** (هنا *الرقم الأصغر = الأكثر إلحاحاً*، كقيم \`nice\` في يونكس حيث -20 هي الأكثر تفضيلاً). المُجدوِل الصارم بالأولوية يشغّل دائماً العملية READY الأكثر إلحاحاً.

الخطر هو **التجويع (starvation)**: إن ظل العمل العاجل يصل، فقد تنتظر عملية منخفضة الأولوية إلى أجل غير مسمى. وتروي أسطورة شهيرة أنه حين أُغلق حاسوب IBM 7094 في MIT عام 1973 وُجد فيه عمل منخفض الأولوية قُدّم عام 1967 ولم يُنفَّذ قط. سواء كانت القصة دقيقة أم لا، فالمشكلة حقيقية.

**التقادم (aging)** هو العلاج: ارفع أولوية العملية كلما انتظرت مدة. وفي النهاية تصبح حتى أقل العمليات أهمية هي الأكثر إلحاحاً وتنال دورها.

في المختبر التالي تعمل كل عملية وحدة زمنية واحدة في كل مرة. و**الأولوية الفعلية** لها هي

\`\`\`
effective = max(0, priority - floor(waited / A))
\`\`\`

حيث \`waited\` هو عدد وحدات الزمن التي قضتها دون تنفيذ منذ آخر مرة عملت فيها، و\`A\` هي فترة التقادم. و\`A\` الضخمة تعني لا تقادم، وسترى التجويع في المخرجات.`,
      },
    },
    {
      type: "lab",
      id: "priority-aging",
      lang: "javascript",
      prompt: {
        en: `Simulate priority scheduling with aging, one time unit per step.

**Input:** the aging interval \`A\` (at least 1), then \`n\`, then \`n\` lines \`name priority burst\`. All processes are ready at time 0. A **smaller priority number is more urgent**.

**Each time unit:**
1. For every unfinished process compute \`effective = max(0, priority - floor(waited / A))\`.
2. Run the process with the **smallest effective priority** for one unit (ties: the one that appears **earlier in the input**).
3. The process that ran gets \`waited = 0\`; every other unfinished process gets \`waited += 1\`.

**Output:** the timeline on a single line, consecutive units of the same process merged, as \`name:units\` separated by spaces. For \`n = 0\` print an empty line.

**Example:** \`A = 1000\` (no aging), H 1 6 and L 3 2 would print \`H:6 L:2\`: L must wait for H to finish. With \`A = 1\` the same input prints

\`\`\`
H:3 L:1 H:3 L:1
\`\`\`

because L's priority number drops by one for every unit it waits, until it beats H for a turn.`,
        ar: `حاكِ الجدولة بالأولوية مع التقادم، بوحدة زمنية واحدة في كل خطوة.

**المدخل:** فترة التقادم \`A\` (واحد على الأقل)، ثم \`n\`، ثم \`n\` سطراً بالشكل \`name priority burst\`. كل العمليات جاهزة عند الزمن 0. **الرقم الأصغر للأولوية هو الأكثر إلحاحاً**.

**في كل وحدة زمنية:**
1. لكل عملية لم تنتهِ احسب \`effective = max(0, priority - floor(waited / A))\`.
2. شغّل العملية ذات **أصغر أولوية فعلية** وحدة واحدة (عند التعادل: التي تظهر **أولاً في المدخل**).
3. العملية التي عملت تأخذ \`waited = 0\`؛ وكل عملية أخرى لم تنتهِ تزيد \`waited += 1\`.

**المخرج:** الخط الزمني في سطر واحد، مع دمج الوحدات المتتالية للعملية نفسها، بالشكل \`name:units\` مفصولاً بمسافات. عند \`n = 0\` اطبع سطراً فارغاً.

**مثال:** \`A = 1000\` (دون تقادم)، وH 1 6 وL 3 2 ستطبع \`H:6 L:2\`: على L أن تنتظر انتهاء H. أما مع \`A = 1\` فالمدخل نفسه يطبع

\`\`\`
H:3 L:1 H:3 L:1
\`\`\`

لأن رقم أولوية L ينخفض بمقدار واحد عن كل وحدة تنتظرها، حتى تتغلّب على H في دور واحد.`,
      },
      starterCode: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n").map((l) => l.trim()).filter((l) => l !== "");
const aging = Number(lines[0]);
const n = Number(lines[1]);
const procs = lines.slice(2, 2 + n).map((line) => {
  const [name, priority, burst] = line.split(/\s+/);
  return { name, priority: Number(priority), left: Number(burst), waited: 0 };
});

const timeline = []; // [{ name, units }]

// TODO 1: loop while some process still has time left (left > 0)
// TODO 2: pick the unfinished process with the smallest effective priority:
//         Math.max(0, priority - Math.floor(waited / aging)); strict "<" keeps the earlier one on ties
// TODO 3: run it one unit (left--), reset its waited to 0, and add 1 to waited of every other unfinished process
// TODO 4: append to the timeline, merging with the previous entry when it is the same process

console.log(timeline.map((s) => s.name + ":" + s.units).join(" "));
`,
      solution: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n").map((l) => l.trim()).filter((l) => l !== "");
const aging = Number(lines[0]);
const n = Number(lines[1]);
const procs = lines.slice(2, 2 + n).map((line) => {
  const [name, priority, burst] = line.split(/\s+/);
  return { name, priority: Number(priority), left: Number(burst), waited: 0 };
});

const timeline = []; // [{ name, units }]

while (procs.some((p) => p.left > 0)) {
  // Pick the most urgent unfinished process (strict "<" keeps the earlier one on ties).
  let best = null;
  let bestEffective = Infinity;
  for (const p of procs) {
    if (p.left === 0) continue;
    const effective = Math.max(0, p.priority - Math.floor(p.waited / aging));
    if (effective < bestEffective) {
      best = p;
      bestEffective = effective;
    }
  }

  // Run it for one time unit; everybody else ages.
  best.left--;
  for (const p of procs) {
    if (p !== best && p.left > 0) p.waited++;
  }
  best.waited = 0;

  const last = timeline[timeline.length - 1];
  if (last && last.name === best.name) last.units++;
  else timeline.push({ name: best.name, units: 1 });
}

console.log(timeline.map((s) => s.name + ":" + s.units).join(" "));
`,
      hints: [
        {
          en: "Parse the lines into objects { name, priority, left, waited }. The main loop is while (procs.some(p => p.left > 0)), one iteration per time unit.",
          ar: "حوّل الأسطر إلى كائنات { name, priority, left, waited }. الحلقة الرئيسية while (procs.some(p => p.left > 0)) بتكرار واحد لكل وحدة زمنية.",
        },
        {
          en: "To choose, keep bestEffective = Infinity and compare with a strict < while looping in input order: the first of equals wins automatically.",
          ar: "للاختيار، احتفظ بـ bestEffective = Infinity وقارن بـ < الصارمة أثناء المرور بترتيب المدخل: يفوز الأول من المتساويين تلقائياً.",
        },
        {
          en: "After choosing: best.left--, then every OTHER unfinished process gets waited++, and best.waited = 0. Finally merge into the timeline when the last entry has the same name.",
          ar: "بعد الاختيار: best.left--، ثم تزداد waited++ لكل عملية أخرى لم تنتهِ، وbest.waited = 0. وأخيراً ادمج في الخط الزمني حين يكون آخر مدخل بالاسم نفسه.",
        },
      ],
      tests: [
        {
          name: { en: "Aging disabled (huge A): strict priority order", ar: "التقادم معطّل (A ضخمة): ترتيب أولوية صارم" },
          stdin: "1000\n3\nA 1 3\nB 2 2\nC 3 1\n",
          expected: "A:3 B:2 C:1",
        },
        {
          name: { en: "Aging lets the low-priority process take turns", ar: "التقادم يتيح للعملية منخفضة الأولوية أخذ أدوار" },
          stdin: "1\n2\nH 1 6\nL 3 2\n",
          expected: "H:3 L:1 H:3 L:1",
        },
        {
          name: { en: "Ties go to the earlier process in the input", ar: "التعادل يذهب للأسبق في المدخل" },
          stdin: "5\n2\nX 2 2\nY 2 2\n",
          expected: "X:2 Y:2",
        },
        {
          name: { en: "Three processes with moderate aging", ar: "ثلاث عمليات مع تقادم معتدل" },
          stdin: "2\n3\nA 3 4\nB 1 5\nC 5 2\n",
          expected: "B:4 A:1 B:1 C:1 A:3 C:1",
        },
        {
          name: { en: "A single process", ar: "عملية واحدة" },
          stdin: "3\n1\nP 0 4\n",
          expected: "P:4",
        },
        {
          name: { en: "No processes: an empty line", ar: "لا عمليات: سطر فارغ" },
          stdin: "1000\n0\n",
          expected: "",
        },
      ],
      sampleInput: "1\n2\nH 1 6\nL 3 2\n",
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "How is a process's turnaround time defined?", ar: "كيف يُعرَّف زمن الدوران (turnaround) لعملية؟" },
          choices: [
            { en: "Its total CPU burst", ar: "إجمالي انفجارها على المعالج" },
            { en: "Completion time minus arrival time", ar: "زمن الاكتمال ناقص زمن الوصول" },
            { en: "The time until it first runs", ar: "الزمن حتى تعمل أول مرة" },
            { en: "Only the time it spends in the READY queue", ar: "الزمن الذي تقضيه في طابور READY فقط" },
          ],
          answer: 1,
          explain: {
            en: "Turnaround = completion - arrival: the whole stay in the system. Waiting time is turnaround minus burst (time spent READY), and response time is first run minus arrival.",
            ar: "الدوران = الاكتمال - الوصول: كامل المدة في النظام. أما الانتظار فهو الدوران ناقص الانفجار (الوقت في حالة READY)، والاستجابة هي أول تنفيذ ناقص الوصول.",
          },
        },
        {
          q: { en: "What is the convoy effect in FCFS scheduling?", ar: "ما هو تأثير القافلة (convoy effect) في جدولة FCFS؟" },
          choices: [
            { en: "Several processes share one CPU time slice", ar: "عدة عمليات تتشارك شريحة زمنية واحدة" },
            { en: "The OS starts many processes at once", ar: "يبدأ النظام عمليات كثيرة دفعة واحدة" },
            { en: "Short processes queue up behind one long CPU-bound process", ar: "عمليات قصيرة تتكدّس خلف عملية طويلة مرتبطة بالمعالج" },
            { en: "High-priority processes are delayed by low-priority ones", ar: "عمليات عالية الأولوية تتأخر بسبب عمليات منخفضة الأولوية" },
          ],
          answer: 2,
          explain: {
            en: "A long job at the head of a plain FIFO queue delays everybody behind it, so the average wait balloons. SJF and Round Robin both soften this.",
            ar: "العمل الطويل في رأس طابور FIFO عادي يؤخّر كل من خلفه، فيتضخم متوسط الانتظار. كلٌّ من SJF وRound Robin يخفف ذلك.",
          },
        },
        {
          q: { en: "SJF gives the lowest average waiting time for a known set of jobs. Why can't real operating systems use it exactly as is?", ar: "يعطي SJF أقل متوسط انتظار لمجموعة أعمال معروفة. لماذا لا تستطيع أنظمة التشغيل الحقيقية استخدامه كما هو؟" },
          choices: [
            { en: "It cannot know the length of the next CPU burst in advance, and long jobs may starve", ar: "لا يعرف طول الانفجار التالي مسبقاً، وقد تتجوّع الأعمال الطويلة" },
            { en: "It needs one CPU core per process", ar: "يحتاج نواة معالج لكل عملية" },
            { en: "It is slower than FCFS at picking the next process", ar: "هو أبطأ من FCFS في اختيار العملية التالية" },
            { en: "It only works with I/O-bound processes", ar: "يعمل فقط مع العمليات المرتبطة بالإدخال/الإخراج" },
          ],
          answer: 0,
          explain: {
            en: "Burst lengths are unknown, so real schedulers estimate them from history (for example an exponential average). And because short jobs always win, a long job can wait forever if short ones keep arriving.",
            ar: "أطوال الانفجارات غير معروفة، لذا تقدّرها المُجدوِلات الحقيقية من التاريخ (مثلاً بمتوسط أسّي). ولأن الأعمال القصيرة تفوز دائماً، قد ينتظر العمل الطويل إلى الأبد إن ظلّت القصيرة تصل.",
          },
        },
        {
          q: { en: "What happens to Round Robin as the time quantum becomes very large (larger than every burst)?", ar: "ماذا يحدث لـ Round Robin حين تصبح الشريحة الزمنية كبيرة جداً (أكبر من كل انفجار)؟" },
          choices: [
            { en: "It behaves like SJF", ar: "يتصرف مثل SJF" },
            { en: "It behaves like FCFS", ar: "يتصرف مثل FCFS" },
            { en: "It performs far more context switches", ar: "ينفّذ تبديلات سياق أكثر بكثير" },
            { en: "Every process starves", ar: "تتجوّع كل العمليات" },
          ],
          answer: 1,
          explain: {
            en: "If no process ever uses up its slice, nobody is preempted and the order is simply arrival order: FCFS. The opposite extreme (tiny quantum) is where context-switch overhead dominates.",
            ar: "إن لم تستهلك أي عملية شريحتها فلن تُقاطَع أي عملية ويصير الترتيب هو ترتيب الوصول: FCFS. والطرف المعاكس (شريحة ضئيلة) هو حيث يهيمن عبء تبديل السياق.",
          },
        },
        {
          q: { en: "What problem does aging solve in priority scheduling?", ar: "ما المشكلة التي يحلّها التقادم (aging) في الجدولة بالأولوية؟" },
          choices: [
            { en: "Context switches taking too long", ar: "استغراق تبديلات السياق وقتاً طويلاً" },
            { en: "Deadlocks between processes", ar: "الجمود (deadlock) بين العمليات" },
            { en: "Memory fragmentation", ar: "تجزّؤ الذاكرة" },
            { en: "Starvation of low-priority processes", ar: "تجويع العمليات منخفضة الأولوية" },
          ],
          answer: 3,
          explain: {
            en: "Aging gradually improves the priority of processes that have waited a long time, so every READY process eventually gets the CPU. The other problems have different cures (faster switches, lock ordering, compaction or paging).",
            ar: "يحسّن التقادم تدريجياً أولوية العمليات التي انتظرت طويلاً، فتنال كل عملية READY المعالج في النهاية. أما المشكلات الأخرى فلها علاجات مختلفة (تبديل أسرع، ترتيب الأقفال، الضغط أو التصفيح).",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- The **scheduler** picks the next READY process; **preemptive** schedulers can take the CPU back, which all general-purpose systems need
- Compare policies with **waiting** (turnaround − burst) and **turnaround** (completion − arrival) times
- **FCFS**: simple, but suffers the convoy effect. **SJF**: optimal average wait, but needs burst predictions and can starve long jobs. **Round Robin**: fair and responsive; the quantum is the trade-off. **Priority**: urgent first, fixed with **aging** against starvation. **MLFQ** learns process behaviour
- You simulated FCFS vs SJF, Round Robin with its tie-breaking rule, and aging

**Practice:** add *response time* to the Round Robin lab, or run \`chrt -p $$\` and \`nice\` on a Linux machine to see real policies and priorities. **Next:** memory management, how every process gets the illusion of a private address space.`,
        ar: `## الخلاصة

- **المُجدوِل** يختار العملية READY التالية؛ والمُجدوِلات **الاستباقية** تستطيع استعادة المعالج، وهذا ما تحتاجه كل الأنظمة العامة
- قارن السياسات بأزمنة **الانتظار** (الدوران − الانفجار) و**الدوران** (الاكتمال − الوصول)
- **FCFS**: بسيط لكنه يعاني من تأثير القافلة. **SJF**: متوسط انتظار مثالي، لكنه يحتاج إلى تنبؤ بالانفجارات وقد يجوّع الأعمال الطويلة. **Round Robin**: عادل وسريع الاستجابة؛ والشريحة هي المفاضلة. **الأولوية**: العاجل أولاً، ويُعالَج التجويع بـ**التقادم**. **MLFQ** يتعلّم سلوك العمليات
- حاكيت FCFS مقابل SJF، وRound Robin بقاعدة حسم التعادل، والتقادم

**تدرّب:** أضف *زمن الاستجابة* إلى مختبر Round Robin، أو نفّذ \`chrt -p $$\` و\`nice\` على جهاز لينكس لترى السياسات والأولويات الفعلية. **التالي:** إدارة الذاكرة، أي كيف تحصل كل عملية على وهم فضاء عناوين خاص بها.`,
      },
    },
  ],
};
