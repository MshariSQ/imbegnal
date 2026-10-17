import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "concurrency-sync",
  title: { en: "Concurrency, Locks & Deadlocks — Sharing Without Breaking", ar: "التزامن والأقفال والجمود — المشاركة دون كسر" },
  estMinutes: 41,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What a **race condition** is and why \`counter++\` is not one step
- How a **mutex** protects a **critical section**, and which hardware instructions make locks possible
- How **condition variables** let a thread sleep until something becomes true, and why you always wait in a \`while\` loop
- How **semaphores** count resources, as in the classic **producer-consumer** problem
- How **deadlocks** arise (the four **Coffman conditions**) and how a **consistent lock order** prevents them

You will build a real bounded buffer with POSIX threads in C, a semaphore simulator in Python and a lock-order checker in JavaScript.`,
        ar: `## ماذا ستتعلم

- ما هي **حالة السباق (race condition)** ولماذا ليست \`counter++\` خطوة واحدة
- كيف يحمي **القفل المتبادل (mutex)** **المقطع الحرج (critical section)**، وأي تعليمات في العتاد تجعل الأقفال ممكنة
- كيف تتيح **متغيرات الشرط (condition variables)** لخيط أن ينام حتى يصبح شيء ما صحيحاً، ولماذا تنتظر دائماً داخل حلقة \`while\`
- كيف تعدّ **الإشارات الحسابية (semaphores)** الموارد، كما في مسألة **المنتج والمستهلك (producer-consumer)** الكلاسيكية
- كيف ينشأ **الجمود (deadlock)** (شروط **Coffman** الأربعة) وكيف يمنعه **ترتيب ثابت للأقفال**

ستبني مخزناً محدوداً حقيقياً بخيوط POSIX بلغة C، ومحاكياً للإشارات الحسابية بلغة Python، ومدقّقاً لترتيب الأقفال بلغة JavaScript.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A race on one line of code 🏁

Two threads share a global \`counter\` and both run \`counter++\`. It looks like one step, but the CPU executes it as three instructions: **load** the value into a register, **add** 1, **store** it back. The scheduler may switch threads between any two of them:

\`\`\`
thread A                 thread B                 counter
load  rA = counter                                5
                         load  rB = counter       5
add   rA = rA + 1  (6)                            5
                         add   rB = rB + 1  (6)   5
store counter = rA                                6
                         store counter = rB       6   <- one increment lost
\`\`\`

Both threads did their work, yet the counter went from 5 to 6. This is a **race condition**: the result depends on the timing of the threads. Races are nasty because they are rare: a program passes a thousand tests and then fails on a busy production server. In C and C++ an unsynchronised **data race** is even **undefined behaviour** (C11), so the compiler may assume it never happens.

The code that touches shared data is a **critical section**. A correct solution must give:

- **Mutual exclusion**: at most one thread inside the critical section at a time
- **Progress**: if nobody is inside, a thread that wants to enter eventually can
- **Bounded waiting**: no thread waits forever while others keep entering

Count how often the race bites if every interleaving is equally likely:`,
        ar: `## سباق على سطر واحد من الكود 🏁

يتشارك خيطان متغيراً عاماً \`counter\` وكلاهما ينفّذ \`counter++\`. تبدو خطوة واحدة، لكن المعالج ينفّذها ثلاث تعليمات: **تحميل (load)** القيمة إلى مسجّل، و**إضافة (add)** 1، و**تخزين (store)** النتيجة. وقد يبدّل المجدول بين الخيطين بين أي اثنتين منها:

\`\`\`
thread A                 thread B                 counter
load  rA = counter                                5
                         load  rB = counter       5
add   rA = rA + 1  (6)                            5
                         add   rB = rB + 1  (6)   5
store counter = rA                                6
                         store counter = rB       6   <- one increment lost
\`\`\`

أنجز الخيطان عملهما، ومع ذلك انتقل العدّاد من 5 إلى 6 فقط. هذه **حالة سباق (race condition)**: النتيجة تعتمد على توقيت الخيوط. وحالات السباق خبيثة لأنها نادرة: يجتاز البرنامج ألف اختبار ثم يفشل على خادم إنتاج مزدحم. وفي C وC++ يُعدّ **سباق البيانات (data race)** غير المتزامن **سلوكاً غير معرَّف (undefined behaviour)** بحسب معيار C11، فيحق للمترجم أن يفترض أنه لا يحدث أبداً.

الكود الذي يلمس البيانات المشتركة هو **مقطع حرج (critical section)**. ويجب أن يضمن الحل الصحيح:

- **الاستبعاد المتبادل (mutual exclusion)**: خيط واحد على الأكثر داخل المقطع الحرج في أي لحظة
- **التقدّم (progress)**: إن لم يكن أحد بالداخل، فالخيط الذي يريد الدخول يستطيع ذلك في النهاية
- **الانتظار المحدود (bounded waiting)**: لا ينتظر أي خيط إلى الأبد بينما يواصل غيره الدخول

احسب كم مرة يقع السباق لو كانت كل طرق التداخل متساوية الاحتمال:`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `from itertools import combinations
from collections import Counter

# counter += 1 is really three steps: load into a register, add 1, store back.
STEPS = ["load", "add", "store"]

def run(schedule):
    """schedule is a list like ['A', 'B', 'A', ...]: whose next step runs."""
    counter = 0
    reg = {"A": None, "B": None}
    pc = {"A": 0, "B": 0}
    for t in schedule:
        step = STEPS[pc[t]]
        if step == "load":
            reg[t] = counter
        elif step == "add":
            reg[t] += 1
        else:
            counter = reg[t]
        pc[t] += 1
    return counter

# Every way to interleave A's three steps with B's three steps.
results = Counter()
for a_slots in combinations(range(6), 3):
    schedule = ["A" if i in a_slots else "B" for i in range(6)]
    results[run(schedule)] += 1

print("final value -> number of interleavings")
for value, n in sorted(results.items()):
    print(f"  counter = {value}: {n}")
print("one bad schedule: A B A B A B ->", run(list("ABABAB")))
`,
      explanation: {
        en: "Of the 20 ways to interleave the six steps, only 2 (one thread completely before the other) give the right answer 2; the other 18 lose an update. Real schedulers make bad interleavings rarer, never impossible. Try other schedules with run().",
        ar: "من بين 20 طريقة لتداخل الخطوات الست، طريقتان فقط (خيط ينهي كل خطواته قبل الآخر) تعطيان الجواب الصحيح 2؛ والـ 18 الباقية تُضيّع تحديثاً. المجدولات الحقيقية تجعل التداخلات السيئة أندر، لا مستحيلة. جرّب جداول أخرى مع run().",
      },
    },
    {
      type: "text",
      body: {
        en: `## Locks: one thread at a time 🔒

A **mutex** (mutual exclusion lock) has two operations: **lock** waits until the mutex is free and takes it; **unlock** releases it. With POSIX threads (\`pthreads(7)\`):

\`\`\`c
pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;

void increment(void) {
    pthread_mutex_lock(&m);     /* enter the critical section */
    counter++;                  /* only one thread can be here */
    pthread_mutex_unlock(&m);   /* leave it */
}
\`\`\`

Building a lock out of ordinary loads and stores is fragile on modern CPUs, which reorder memory accesses, so the hardware provides **atomic instructions** that read and modify memory in one indivisible step: **test-and-set**, **compare-and-swap** (\`lock cmpxchg\` on x86) or load-linked/store-conditional pairs (ARM). A **spinlock** loops on such an instruction until it wins; that wastes CPU time but suits very short sections inside the kernel. A **blocking mutex** puts the waiter to sleep instead. On Linux, glibc's mutex is built on the **futex** system call: without contention, lock and unlock are a single atomic instruction in user space, and the kernel is involved only to put a thread to sleep or wake it.

Rules of thumb:

- A lock protects **data**, not code: every access to that data, reads included, must hold the same lock
- Keep critical sections short; do not do slow I/O while holding a lock
- Unlock on **every** path, including early returns and errors`,
        ar: `## الأقفال: خيط واحد في كل مرة 🔒

لـ**القفل المتبادل (mutex)** عمليتان: **lock** تنتظر حتى يصبح القفل حراً ثم تأخذه؛ و**unlock** تحرّره. وبخيوط POSIX (\`pthreads(7)\`):

\`\`\`c
pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;

void increment(void) {
    pthread_mutex_lock(&m);     /* enter the critical section */
    counter++;                  /* only one thread can be here */
    pthread_mutex_unlock(&m);   /* leave it */
}
\`\`\`

بناء قفل من عمليات تحميل وتخزين عادية أمر هشّ على المعالجات الحديثة التي تعيد ترتيب الوصول إلى الذاكرة، لذا يوفّر العتاد **تعليمات ذرّية (atomic instructions)** تقرأ الذاكرة وتعدّلها في خطوة واحدة غير قابلة للتجزئة: **test-and-set** و**compare-and-swap** (\`lock cmpxchg\` في x86) أو أزواج load-linked/store-conditional (في ARM). و**قفل الدوران (spinlock)** يكرّر تعليمة كهذه حتى ينجح؛ وهذا يهدر وقت المعالج لكنه يناسب المقاطع القصيرة جداً داخل النواة. أما **القفل الحاجب (blocking mutex)** فيُنيم المنتظر بدلاً من ذلك. وفي لينكس يُبنى قفل glibc على استدعاء النظام **futex**: عند غياب التنافس يكون القفل والفتح تعليمة ذرّية واحدة في فضاء المستخدم، ولا تتدخل النواة إلا لإنامة خيط أو إيقاظه.

قواعد عملية:

- القفل يحمي **البيانات** لا الكود: كل وصول إلى تلك البيانات، بما فيه القراءة، يجب أن يمسك القفل نفسه
- أبقِ المقاطع الحرجة قصيرة؛ ولا تنفّذ إدخالاً/إخراجاً بطيئاً وأنت تمسك قفلاً
- حرّر القفل في **كل** مسار، بما فيه العودة المبكرة والأخطاء`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Waiting for a condition: condition variables ⏳

Often a thread must wait until something becomes true: a queue is no longer empty, a buffer has room. Spinning on \`while (count == 0) {}\` burns a CPU and still races. A **condition variable** lets a thread sleep until another thread signals it:

\`\`\`c
pthread_mutex_lock(&m);
while (count == 0)                       /* WHILE, not if */
    pthread_cond_wait(&not_empty, &m);   /* unlocks m, sleeps, relocks m on wake-up */
item = take_one();
pthread_cond_signal(&not_full);          /* someone may be waiting for room */
pthread_mutex_unlock(&m);
\`\`\`

\`pthread_cond_wait\` releases the mutex and goes to sleep **atomically**, so a signal cannot slip in between the check and the sleep. Always re-check the condition in a \`while\` loop: POSIX allows **spurious wake-ups**, and another thread may have taken the item between the signal and the moment you run again.

This is the heart of the **producer-consumer** (bounded buffer) problem: a producer adds items to a buffer with a fixed number of slots and a consumer removes them; the producer must wait while the buffer is full and the consumer while it is empty. The pipes from the shell lesson work exactly like this inside the kernel. Build one:`,
        ar: `## انتظار شرط: متغيرات الشرط ⏳

كثيراً ما يجب على خيط أن ينتظر حتى يصبح شيء ما صحيحاً: طابور لم يعد فارغاً، أو مخزن فيه متّسع. والدوران على \`while (count == 0) {}\` يحرق معالجاً ويبقى عرضة للسباق. أما **متغير الشرط (condition variable)** فيتيح لخيط أن ينام حتى ينبّهه خيط آخر:

\`\`\`c
pthread_mutex_lock(&m);
while (count == 0)                       /* WHILE, not if */
    pthread_cond_wait(&not_empty, &m);   /* unlocks m, sleeps, relocks m on wake-up */
item = take_one();
pthread_cond_signal(&not_full);          /* someone may be waiting for room */
pthread_mutex_unlock(&m);
\`\`\`

تحرّر \`pthread_cond_wait\` القفل وتنام **ذرّياً**، فلا يمكن لتنبيه أن يتسلّل بين الفحص والنوم. وأعد فحص الشرط دائماً في حلقة \`while\`: فمعيار POSIX يسمح بـ**الاستيقاظ الزائف (spurious wake-ups)**، وقد يأخذ خيط آخر العنصر بين التنبيه واللحظة التي تعمل فيها من جديد.

هذا لبّ مسألة **المنتج والمستهلك (producer-consumer)** أو المخزن المحدود (bounded buffer): يضيف المنتج عناصر إلى مخزن بعدد ثابت من الخانات ويزيلها المستهلك؛ وعلى المنتج أن ينتظر ما دام المخزن ممتلئاً، وعلى المستهلك أن ينتظر ما دام فارغاً. وتعمل أنابيب درس الـ shell بهذه الطريقة بالضبط داخل النواة. ابنِ واحداً:`,
      },
    },
    {
      type: "lab",
      id: "bounded-buffer",
      lang: "c",
      prompt: {
        en: `Build a real **bounded buffer** with POSIX threads: one producer thread puts items in, one consumer thread takes them out.

**Input:** \`capacity n\` (1 ≤ capacity ≤ 64, 0 ≤ n ≤ 1000) followed by \`n\` integers.

**What to write:** the two buffer functions. The starter already creates the threads: the producer calls \`buffer_put\` for every item in order, the consumer calls \`buffer_get\` \`n\` times and records what it gets.
- \`buffer_put(item)\`: wait while the buffer is **full** (\`count == capacity\`), then store the item at \`slots[in]\`, advance \`in\` around the ring and increment \`count\`
- \`buffer_get()\`: wait while the buffer is **empty**, then take the item at \`slots[out]\`, advance \`out\` and decrement \`count\`
- Hold the mutex \`lock\` for every access to the shared fields, and sleep and wake with the condition variables \`not_full\` and \`not_empty\`. Never busy-wait.

**Output** (printed by \`main\` after both threads are joined): \`order:\` followed by the received items, then \`total: <sum>\`. With one producer and one consumer a correct buffer delivers the items in exactly the order they were produced, however the threads are scheduled.

**Example:** \`4 6\` and \`5 3 8 1 9 2\` print

\`\`\`
order: 5 3 8 1 9 2
total: 28
\`\`\``,
        ar: `ابنِ **مخزناً محدوداً (bounded buffer)** حقيقياً بخيوط POSIX: خيط منتج يضع العناصر وخيط مستهلك يأخذها.

**المدخل:** \`capacity n\` (حيث 1 ≤ capacity ≤ 64 و0 ≤ n ≤ 1000) ثم \`n\` من الأعداد الصحيحة.

**ما الذي تكتبه:** دالّتا المخزن. كود البداية ينشئ الخيوط أصلاً: يستدعي المنتج \`buffer_put\` لكل عنصر بالترتيب، ويستدعي المستهلك \`buffer_get\` عدد \`n\` من المرات ويسجّل ما يحصل عليه.
- \`buffer_put(item)\`: انتظر ما دام المخزن **ممتلئاً** (\`count == capacity\`)، ثم خزّن العنصر في \`slots[in]\` وقدّم \`in\` حول الحلقة وزد \`count\`
- \`buffer_get()\`: انتظر ما دام المخزن **فارغاً**، ثم خذ العنصر من \`slots[out]\` وقدّم \`out\` وأنقص \`count\`
- أمسك القفل \`lock\` عند كل وصول إلى الحقول المشتركة، ونَم واستيقظ بمتغيري الشرط \`not_full\` و\`not_empty\`. ولا تنتظر انتظاراً مشغولاً (busy-wait) أبداً.

**المخرج** (تطبعه \`main\` بعد ضمّ الخيطين): \`order:\` متبوعة بالعناصر المستلمة، ثم \`total: <sum>\`. ومع منتج واحد ومستهلك واحد يسلّم المخزن الصحيح العناصر بالترتيب الذي أُنتجت به تماماً، مهما كانت جدولة الخيوط.

**مثال:** \`4 6\` و\`5 3 8 1 9 2\` تطبع

\`\`\`
order: 5 3 8 1 9 2
total: 28
\`\`\``,
      },
      starterCode: String.raw`#include <pthread.h>
#include <stdio.h>

#define MAX_ITEMS 1000
#define MAX_CAPACITY 64

/* The bounded buffer: a ring of capacity slots shared by the two threads. */
int slots[MAX_CAPACITY];
int capacity, count, in, out;
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t not_full = PTHREAD_COND_INITIALIZER;
pthread_cond_t not_empty = PTHREAD_COND_INITIALIZER;

int items[MAX_ITEMS], received[MAX_ITEMS], n;

void buffer_put(int item) {
    // TODO 1: lock; while the buffer is full, pthread_cond_wait(&not_full, &lock)
    // TODO 2: slots[in] = item; in = (in + 1) % capacity; count++
    // TODO 3: signal not_empty, then unlock
    (void)item;
}

int buffer_get(void) {
    // TODO 4: lock; while the buffer is empty, wait on not_empty
    // TODO 5: take slots[out]; advance out; count--; signal not_full; unlock
    return 0;
}

void *producer(void *arg) {
    (void)arg;
    for (int i = 0; i < n; i++) buffer_put(items[i]);
    return NULL;
}

void *consumer(void *arg) {
    (void)arg;
    for (int i = 0; i < n; i++) received[i] = buffer_get();
    return NULL;
}

int main(void) {
    if (scanf("%d %d", &capacity, &n) != 2) return 1;
    for (int i = 0; i < n; i++) {
        if (scanf("%d", &items[i]) != 1) return 1;
    }

    pthread_t p, c;
    pthread_create(&p, NULL, producer, NULL);
    pthread_create(&c, NULL, consumer, NULL);
    pthread_join(p, NULL);
    pthread_join(c, NULL);

    long total = 0;
    printf("order:");
    for (int i = 0; i < n; i++) {
        printf(" %d", received[i]);
        total += received[i];
    }
    printf("\ntotal: %ld\n", total);
    return 0;
}
`,
      solution: String.raw`#include <pthread.h>
#include <stdio.h>

#define MAX_ITEMS 1000
#define MAX_CAPACITY 64

/* The bounded buffer: a ring of capacity slots shared by the two threads. */
int slots[MAX_CAPACITY];
int capacity, count, in, out;
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t not_full = PTHREAD_COND_INITIALIZER;
pthread_cond_t not_empty = PTHREAD_COND_INITIALIZER;

int items[MAX_ITEMS], received[MAX_ITEMS], n;

void buffer_put(int item) {
    pthread_mutex_lock(&lock);
    while (count == capacity)                 /* full: sleep until the consumer makes room */
        pthread_cond_wait(&not_full, &lock);  /* releases the lock while asleep */
    slots[in] = item;
    in = (in + 1) % capacity;
    count++;
    pthread_cond_signal(&not_empty);          /* wake the consumer if it is waiting */
    pthread_mutex_unlock(&lock);
}

int buffer_get(void) {
    pthread_mutex_lock(&lock);
    while (count == 0)                        /* empty: sleep until the producer adds one */
        pthread_cond_wait(&not_empty, &lock);
    int item = slots[out];
    out = (out + 1) % capacity;
    count--;
    pthread_cond_signal(&not_full);           /* wake the producer if it is waiting */
    pthread_mutex_unlock(&lock);
    return item;
}

void *producer(void *arg) {
    (void)arg;
    for (int i = 0; i < n; i++) buffer_put(items[i]);
    return NULL;
}

void *consumer(void *arg) {
    (void)arg;
    for (int i = 0; i < n; i++) received[i] = buffer_get();
    return NULL;
}

int main(void) {
    if (scanf("%d %d", &capacity, &n) != 2) return 1;
    for (int i = 0; i < n; i++) {
        if (scanf("%d", &items[i]) != 1) return 1;
    }

    pthread_t p, c;
    pthread_create(&p, NULL, producer, NULL);
    pthread_create(&c, NULL, consumer, NULL);
    pthread_join(p, NULL);
    pthread_join(c, NULL);

    long total = 0;
    printf("order:");
    for (int i = 0; i < n; i++) {
        printf(" %d", received[i]);
        total += received[i];
    }
    printf("\ntotal: %ld\n", total);
    return 0;
}
`,
      hints: [
        {
          en: "Both functions have the same shape: pthread_mutex_lock(&lock); while (condition you cannot proceed under) pthread_cond_wait(&cv, &lock); do the update; pthread_cond_signal(&other_cv); pthread_mutex_unlock(&lock).",
          ar: "للدالتين الشكل نفسه: pthread_mutex_lock(&lock)؛ ثم while (الشرط الذي لا تستطيع المتابعة معه) pthread_cond_wait(&cv, &lock)؛ ثم التحديث؛ ثم pthread_cond_signal(&other_cv)؛ ثم pthread_mutex_unlock(&lock).",
        },
        {
          en: "The producer waits on not_full while count == capacity and signals not_empty after adding; the consumer waits on not_empty while count == 0 and signals not_full after removing.",
          ar: "ينتظر المنتج على not_full ما دام count == capacity وينبّه not_empty بعد الإضافة؛ وينتظر المستهلك على not_empty ما دام count == 0 وينبّه not_full بعد الإزالة.",
        },
        {
          en: "Use while, never if, around pthread_cond_wait: wake-ups can be spurious. The ring indexes wrap with in = (in + 1) % capacity, and the same for out. With capacity 1 the two threads must strictly take turns, which is a good test of your waiting logic.",
          ar: "استخدم while لا if حول pthread_cond_wait: فالاستيقاظ قد يكون زائفاً. وتلتفّ فهارس الحلقة بـ in = (in + 1) % capacity، ومثلها out. ومع capacity تساوي 1 يجب أن يتناوب الخيطان تناوباً صارماً، وهذا اختبار جيد لمنطق الانتظار عندك.",
        },
      ],
      tests: [
        {
          name: { en: "Example from the prompt", ar: "المثال من نص المسألة" },
          stdin: "4 6\n5 3 8 1 9 2\n",
          expected: "order: 5 3 8 1 9 2\ntotal: 28",
        },
        {
          name: { en: "Capacity 1: strict hand-over", ar: "سعة 1: تسليم بالتناوب الصارم" },
          stdin: "1 5\n10 20 30 40 50\n",
          expected: "order: 10 20 30 40 50\ntotal: 150",
        },
        {
          name: { en: "A buffer bigger than the input, negative items", ar: "مخزن أكبر من المدخل وعناصر سالبة" },
          stdin: "64 3\n7 -2 7\n",
          expected: "order: 7 -2 7\ntotal: 12",
        },
        {
          name: { en: "No items at all", ar: "لا عناصر إطلاقاً" },
          stdin: "3 0\n",
          expected: "order:\ntotal: 0",
        },
        {
          name: { en: "100 items through 2 slots", ar: "100 عنصر عبر خانتين" },
          stdin: "2 100\n100 99 98 97 96 95 94 93 92 91 90 89 88 87 86 85 84 83 82 81 80 79 78 77 76 75 74 73 72 71 70 69 68 67 66 65 64 63 62 61 60 59 58 57 56 55 54 53 52 51 50 49 48 47 46 45 44 43 42 41 40 39 38 37 36 35 34 33 32 31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1\n",
          expected:
            "order: 100 99 98 97 96 95 94 93 92 91 90 89 88 87 86 85 84 83 82 81 80 79 78 77 76 75 74 73 72 71 70 69 68 67 66 65 64 63 62 61 60 59 58 57 56 55 54 53 52 51 50 49 48 47 46 45 44 43 42 41 40 39 38 37 36 35 34 33 32 31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1\ntotal: 5050",
        },
      ],
      sampleInput: "4 6\n5 3 8 1 9 2\n",
    },
    {
      type: "text",
      body: {
        en: `## Semaphores: counting permits 🎫

A **semaphore** (introduced by Dijkstra in the 1960s) is an integer with two atomic operations:

- **wait** (P, \`sem_wait\`): if the value is above 0, decrement it and continue; otherwise sleep until that becomes possible
- **signal** (V, \`sem_post\`): increment the value, or hand the unit directly to one sleeping thread

Initialised to **1**, a semaphore works as a lock (a *binary semaphore*). Initialised to **N**, it counts N identical resources: database connections, buffer slots, parking spaces. Unlike a mutex, a semaphore has no owner: any thread may signal it. The bounded buffer written with semaphores uses three of them:

\`\`\`
slots = N  (free slots)     items = 0  (filled slots)     mutex = 1

producer:  wait(slots); wait(mutex); put(x);     signal(mutex); signal(items)
consumer:  wait(items); wait(mutex); x = take(); signal(mutex); signal(slots)
\`\`\`

Order matters here too: if the consumer did \`wait(mutex)\` before \`wait(items)\` on an empty buffer, it would sleep while holding the mutex, and the producer could never get in to add an item. That is a deadlock, the topic after the next lab.`,
        ar: `## الإشارات الحسابية: عدّ التصاريح 🎫

**الإشارة الحسابية (semaphore)** (قدّمها Dijkstra في الستينيات) عدد صحيح له عمليتان ذرّيتان:

- **wait** (P، \`sem_wait\`): إن كانت القيمة أكبر من 0 فأنقصها وتابع؛ وإلا فنَم حتى يصبح ذلك ممكناً
- **signal** (V، \`sem_post\`): زد القيمة، أو سلّم الوحدة مباشرة إلى خيط نائم واحد

إذا بدأت بالقيمة **1** عملت الإشارة الحسابية كقفل (*إشارة ثنائية، binary semaphore*). وإذا بدأت بالقيمة **N** عدّت N من الموارد المتماثلة: اتصالات قاعدة البيانات، وخانات المخزن، وأماكن الوقوف. وخلافاً للقفل المتبادل لا مالك للإشارة الحسابية: يستطيع أي خيط أن ينفّذ signal عليها. والمخزن المحدود المكتوب بالإشارات الحسابية يستخدم ثلاثاً منها:

\`\`\`
slots = N  (free slots)     items = 0  (filled slots)     mutex = 1

producer:  wait(slots); wait(mutex); put(x);     signal(mutex); signal(items)
consumer:  wait(items); wait(mutex); x = take(); signal(mutex); signal(slots)
\`\`\`

الترتيب مهم هنا أيضاً: لو نفّذ المستهلك \`wait(mutex)\` قبل \`wait(items)\` على مخزن فارغ، لنام وهو يمسك القفل، ولما استطاع المنتج الدخول أبداً ليضيف عنصراً. هذا جمود، وهو موضوع ما بعد المختبر التالي.`,
      },
    },
    {
      type: "lab",
      id: "semaphore-trace",
      lang: "python",
      prompt: {
        en: `Simulate **counting semaphores** with wait queues.

**Input:**
- Line 1: the semaphores and their initial values, for example \`slots=2 items=0 mutex=1\`
- Then one operation per line: \`<thread> wait <sem>\` or \`<thread> signal <sem>\` (blank lines are ignored)

**Rules:**
- \`wait\`: if the value is above 0, decrement it and print \`T wait S -> ok (S=<value>)\`. Otherwise the thread **blocks**: it joins the end of S's queue and \`T wait S -> blocked\` is printed
- \`signal\`: if threads are blocked on S, the **first** one in the queue wakes up and completes its wait (the value does not change): \`T signal S -> wakes U\`. Otherwise increment the value: \`T signal S -> S=<value>\`
- A blocked thread cannot do anything: any line for it prints \`T is blocked on S, ignored\`
- Values never go below 0. (Real implementations may wake waiters in any order; this simulator uses FIFO so that the output is predictable.)

**Output:** the line for every operation, then \`values: S=v ...\` in declaration order, then \`blocked: T(S) ...\` for every thread still asleep, in the order they blocked, or \`blocked: none\`.

**Example:**

\`\`\`
mutex=1
A wait mutex
B wait mutex
A signal mutex
B signal mutex
\`\`\`

prints

\`\`\`
A wait mutex -> ok (mutex=0)
B wait mutex -> blocked
A signal mutex -> wakes B
B signal mutex -> mutex=1
values: mutex=1
blocked: none
\`\`\``,
        ar: `حاكِ **الإشارات الحسابية العدّادة (counting semaphores)** مع طوابير الانتظار.

**المدخل:**
- السطر 1: الإشارات الحسابية وقيمها الابتدائية، مثل \`slots=2 items=0 mutex=1\`
- ثم عملية واحدة في كل سطر: \`<thread> wait <sem>\` أو \`<thread> signal <sem>\` (تُتجاهل الأسطر الفارغة)

**القواعد:**
- \`wait\`: إن كانت القيمة أكبر من 0 فأنقصها واطبع \`T wait S -> ok (S=<value>)\`. وإلا **يُحجب** الخيط: ينضم إلى آخر طابور S ويُطبع \`T wait S -> blocked\`
- \`signal\`: إن كانت هناك خيوط محجوبة على S يستيقظ **أولها** في الطابور ويُكمل انتظاره (ولا تتغير القيمة): \`T signal S -> wakes U\`. وإلا فزد القيمة: \`T signal S -> S=<value>\`
- الخيط المحجوب لا يستطيع فعل شيء: أي سطر له يطبع \`T is blocked on S, ignored\`
- لا تنزل القيم أبداً تحت 0. (قد توقظ التطبيقات الحقيقية المنتظرين بأي ترتيب؛ أما هذا المحاكي فيستخدم FIFO ليكون المخرج قابلاً للتنبؤ.)

**المخرج:** سطر كل عملية، ثم \`values: S=v ...\` بترتيب التصريح، ثم \`blocked: T(S) ...\` لكل خيط ما يزال نائماً بترتيب حجبه، أو \`blocked: none\`.

**مثال:**

\`\`\`
mutex=1
A wait mutex
B wait mutex
A signal mutex
B signal mutex
\`\`\`

يطبع

\`\`\`
A wait mutex -> ok (mutex=0)
B wait mutex -> blocked
A signal mutex -> wakes B
B signal mutex -> mutex=1
values: mutex=1
blocked: none
\`\`\``,
      },
      starterCode: `import sys
from collections import deque

lines = sys.stdin.read().splitlines()
values = {}                                  # semaphore -> current value (never negative)
queues = {}                                  # semaphore -> FIFO of blocked threads
for decl in (lines[0].split() if lines else []):
    name, value = decl.split("=")
    values[name] = int(value)
    queues[name] = deque()

blocked = {}                                 # thread -> semaphore it sleeps on (insertion order)
for line in lines[1:]:
    parts = line.split()
    if len(parts) != 3:
        continue                             # blank line
    thread, op, sem = parts
    # TODO 1: a thread in blocked cannot act: print "T is blocked on S, ignored"
    # TODO 2: wait: value > 0 -> decrement and print "... -> ok (S=v)";
    #         otherwise append to queues[sem], record it in blocked, print "... -> blocked"
    # TODO 3: signal: wake the first queued thread ("... -> wakes U") or increment ("... -> S=v")

print("values:", " ".join(f"{s}={v}" for s, v in values.items()))
print("blocked:", " ".join(f"{t}({s})" for t, s in blocked.items()) or "none")
`,
      solution: `import sys
from collections import deque

lines = sys.stdin.read().splitlines()
values = {}                                  # semaphore -> current value (never negative)
queues = {}                                  # semaphore -> FIFO of blocked threads
for decl in (lines[0].split() if lines else []):
    name, value = decl.split("=")
    values[name] = int(value)
    queues[name] = deque()

blocked = {}                                 # thread -> semaphore it sleeps on (insertion order)
for line in lines[1:]:
    parts = line.split()
    if len(parts) != 3:
        continue                             # blank line
    thread, op, sem = parts
    if thread in blocked:
        print(f"{thread} is blocked on {blocked[thread]}, ignored")
    elif op == "wait":
        if values[sem] > 0:
            values[sem] -= 1
            print(f"{thread} wait {sem} -> ok ({sem}={values[sem]})")
        else:
            queues[sem].append(thread)       # sleep until somebody signals
            blocked[thread] = sem
            print(f"{thread} wait {sem} -> blocked")
    elif op == "signal":
        if queues[sem]:
            woken = queues[sem].popleft()    # hand the unit straight to the first sleeper
            del blocked[woken]
            print(f"{thread} signal {sem} -> wakes {woken}")
        else:
            values[sem] += 1
            print(f"{thread} signal {sem} -> {sem}={values[sem]}")

print("values:", " ".join(f"{s}={v}" for s, v in values.items()))
print("blocked:", " ".join(f"{t}({s})" for t, s in blocked.items()) or "none")
`,
      hints: [
        {
          en: "Check the blocked dict first: a sleeping thread's line is only reported, never executed. Then branch on op.",
          ar: "افحص القاموس blocked أولاً: سطر الخيط النائم يُبلَّغ عنه فقط ولا يُنفَّذ أبداً. ثم فرّع حسب op.",
        },
        {
          en: "wait with value 0 does not decrement: append the thread to queues[sem] and set blocked[thread] = sem. signal looks at the queue before touching the value: if it is not empty, popleft() the first thread and delete it from blocked.",
          ar: "الأمر wait مع القيمة 0 لا يُنقص شيئاً: أضف الخيط إلى queues[sem] واضبط blocked[thread] = sem. ويفحص signal الطابور قبل أن يلمس القيمة: إن لم يكن فارغاً فخذ أول خيط بـ popleft() واحذفه من blocked.",
        },
        {
          en: "Waking a thread does not change the value: the unit goes straight to the sleeper, as POSIX sem_post does when someone is waiting. Only a signal with an empty queue increments.",
          ar: "إيقاظ خيط لا يغيّر القيمة: الوحدة تذهب مباشرة إلى النائم، كما تفعل sem_post في POSIX حين يوجد منتظر. وحده signal مع طابور فارغ يزيد القيمة.",
        },
      ],
      tests: [
        {
          name: { en: "Example: a semaphore used as a lock", ar: "المثال: إشارة حسابية تُستخدم كقفل" },
          stdin: "mutex=1\nA wait mutex\nB wait mutex\nA signal mutex\nB signal mutex\n",
          expected: `A wait mutex -> ok (mutex=0)
B wait mutex -> blocked
A signal mutex -> wakes B
B signal mutex -> mutex=1
values: mutex=1
blocked: none`,
        },
        {
          name: { en: "Producer and consumer with slots and items", ar: "منتج ومستهلك مع slots وitems" },
          stdin: "slots=2 items=0\nC wait items\nP wait slots\nP signal items\nP wait slots\nP signal items\nP wait slots\nC signal slots\nC wait items\nX wait items\n",
          expected: `C wait items -> blocked
P wait slots -> ok (slots=1)
P signal items -> wakes C
P wait slots -> ok (slots=0)
P signal items -> items=1
P wait slots -> blocked
C signal slots -> wakes P
C wait items -> ok (items=0)
X wait items -> blocked
values: slots=0 items=0
blocked: X(items)`,
        },
        {
          name: { en: "Two threads waiting for each other: a deadlock", ar: "خيطان ينتظر كل منهما الآخر: جمود" },
          stdin: "a=0 b=0\nT1 wait a\nT2 wait b\nT1 signal b\nT2 signal a\n",
          expected: `T1 wait a -> blocked
T2 wait b -> blocked
T1 is blocked on a, ignored
T2 is blocked on b, ignored
values: a=0 b=0
blocked: T1(a) T2(b)`,
        },
        {
          name: { en: "A pool of three, and a semaphore has no owner", ar: "مجمّع من ثلاثة، ولا مالك للإشارة الحسابية" },
          stdin: "pool=3\nA wait pool\nB wait pool\nC wait pool\nD wait pool\nE wait pool\nB signal pool\nA signal pool\nA signal pool\n",
          expected: `A wait pool -> ok (pool=2)
B wait pool -> ok (pool=1)
C wait pool -> ok (pool=0)
D wait pool -> blocked
E wait pool -> blocked
B signal pool -> wakes D
A signal pool -> wakes E
A signal pool -> pool=1
values: pool=1
blocked: none`,
        },
        {
          name: { en: "Declarations only", ar: "تصريحات فقط" },
          stdin: "x=0 y=5\n",
          expected: "values: x=0 y=5\nblocked: none",
        },
      ],
      sampleInput: "mutex=1\nA wait mutex\nB wait mutex\nA signal mutex\n",
    },
    {
      type: "text",
      body: {
        en: `## Deadlocks: everyone waits for everyone 🔁

A **deadlock** is a set of threads in which each one waits for a resource that another thread of the set holds, so none of them can ever continue. Coffman, Elphick and Shoshani (1971) showed that a deadlock needs **all four** of these conditions at once:

1. **Mutual exclusion**: a resource is held by one thread at a time
2. **Hold and wait**: a thread holds one resource while waiting for another
3. **No preemption**: a resource cannot be taken away; only its holder releases it
4. **Circular wait**: there is a cycle T1 → T2 → ... → T1 of threads waiting for each other

Break any one and deadlock becomes impossible. In practice the most useful target is **circular wait**: give every lock a place in one **global order** and always acquire locks in that order. If every thread that needs both \`accounts\` and \`audit\` takes \`accounts\` first, no cycle can form. Other tools:

- **Try and back off** (breaks hold and wait): \`pthread_mutex_trylock\` the second lock; if that fails, release the first and retry later. Beware of **livelock**, where threads keep retrying in lockstep and nobody progresses
- **Avoidance**: grant a request only if the system stays in a safe state (the **Banker's algorithm**). General-purpose OSes rarely do this because it needs to know every future request
- **Detection and recovery**: build the **wait-for graph**, look for a cycle and abort one victim; databases do this with transactions

The Linux kernel checks its own locks this way: **lockdep** records which lock was taken while holding which, and warns about a possible deadlock the first time it sees two locks taken in inverted order, even if the bad interleaving never actually happened. Watch a deadlock happen, then disappear with a consistent order:`,
        ar: `## الجمود: الكل ينتظر الكل 🔁

**الجمود (deadlock)** مجموعة من الخيوط ينتظر كل منها مورداً يمسكه خيط آخر من المجموعة، فلا يستطيع أي منها المتابعة أبداً. وقد بيّن Coffman وElphick وShoshani (1971) أن الجمود يحتاج إلى هذه الشروط **الأربعة كلها** في آن واحد:

1. **الاستبعاد المتبادل (mutual exclusion)**: يمسك المورد خيط واحد في كل مرة
2. **الإمساك والانتظار (hold and wait)**: يمسك خيط مورداً بينما ينتظر مورداً آخر
3. **عدم الانتزاع (no preemption)**: لا يمكن انتزاع المورد؛ لا يحرّره إلا ممسكه
4. **الانتظار الدائري (circular wait)**: توجد حلقة T1 → T2 → ... → T1 من خيوط ينتظر بعضها بعضاً

اكسر أياً منها فيصبح الجمود مستحيلاً. وعملياً أنفع هدف هو **الانتظار الدائري**: أعطِ كل قفل موضعاً في **ترتيب عام** واحد، واطلب الأقفال دائماً بهذا الترتيب. فإن كان كل خيط يحتاج \`accounts\` و\`audit\` معاً يأخذ \`accounts\` أولاً، فلا يمكن أن تتشكل حلقة. وهناك أدوات أخرى:

- **المحاولة ثم التراجع (try and back off)** (تكسر الإمساك والانتظار): جرّب القفل الثاني بـ \`pthread_mutex_trylock\`؛ فإن فشل فحرّر الأول وأعد المحاولة لاحقاً. واحذر **الجمود الحيّ (livelock)**، حيث تظل الخيوط تعيد المحاولة بخطى متطابقة دون أن يتقدّم أحد
- **التجنّب (avoidance)**: لا تلبِّ طلباً إلا إذا بقي النظام في حالة آمنة (**خوارزمية المصرفي، Banker's algorithm**). ونادراً ما تفعل ذلك أنظمة التشغيل العامة لأنها تحتاج إلى معرفة كل طلب مستقبلي
- **الكشف والاستعادة (detection and recovery)**: ابنِ **مخطط الانتظار (wait-for graph)**، وابحث عن حلقة، وأجهض ضحية واحدة؛ وقواعد البيانات تفعل هذا مع المعاملات

وتفحص نواة لينكس أقفالها بهذه الطريقة: تسجّل أداة **lockdep** أي قفل أُخذ أثناء إمساك أي قفل آخر، وتحذّر من جمود محتمل في أول مرة ترى فيها قفلين يؤخذان بترتيب معكوس، حتى لو لم يقع التداخل السيئ فعلاً. شاهد جموداً يحدث، ثم يختفي مع ترتيب ثابت:`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// Two threads, two locks. On every tick each thread tries to take its next lock.
function simulate(plans) {
  const owner = {};                       // lock -> index of the thread holding it
  const progress = plans.map(() => 0);
  for (let tick = 1; tick <= 6; tick++) {
    let moved = false;
    plans.forEach((plan, t) => {
      if (progress[t] === plan.length) return;            // already finished
      const lock = plan[progress[t]];
      const name = "T" + (t + 1);
      if (owner[lock] === undefined) {
        owner[lock] = t;
        progress[t]++;
        moved = true;
        console.log("  tick " + tick + ": " + name + " takes " + lock);
        if (progress[t] === plan.length) {
          plan.forEach((l) => delete owner[l]);           // done: release everything
          console.log("  tick " + tick + ": " + name + " finishes and releases " + plan.join(", "));
        }
      } else {
        console.log("  tick " + tick + ": " + name + " waits for " + lock + " (held by T" + (owner[lock] + 1) + ")");
      }
    });
    if (!moved && progress.some((p, t) => p < plans[t].length)) {
      console.log("  DEADLOCK: every unfinished thread waits for a lock another one holds");
      return;
    }
  }
}

console.log("Opposite order (T1: A then B, T2: B then A):");
simulate([["A", "B"], ["B", "A"]]);
console.log("One global order (both: A then B):");
simulate([["A", "B"], ["A", "B"]]);
`,
      explanation: {
        en: "With opposite orders, each thread holds the lock the other one needs: all four Coffman conditions hold, so nobody moves again. With one global order the second thread simply waits its turn. Try three threads with plans A-B, B-C and C-A.",
        ar: "مع الترتيبين المتعاكسين يمسك كل خيط القفل الذي يحتاجه الآخر: تتحقق شروط Coffman الأربعة كلها فلا يتحرك أحد بعدها. ومع ترتيب عام واحد ينتظر الخيط الثاني دوره ببساطة. جرّب ثلاثة خيوط بالخطط A-B وB-C وC-A.",
      },
    },
    {
      type: "lab",
      id: "lock-order",
      lang: "javascript",
      prompt: {
        en: `Build a **lock-order checker**, a tiny version of the kernel's lockdep.

**Input:** one line per thread: \`<thread>: <lock> <lock> ...\`, the locks that thread acquires **in that order**, each one taken while it still holds all the earlier ones. A lock appears at most once per line, a line may list no locks, and blank lines are ignored.

**Rules:**
- Every pair "lock X is held while lock Y is acquired" is an edge **X → Y** of the lock-order graph
- A lock is **on a cycle** if, following edges from it, you can come back to it. Cycles are potential deadlocks: two or more threads can each hold one lock of the cycle and wait for the next
- A thread is **involved** if one of its edges X → Y lies on a cycle, which means that Y can reach X

**Output:**
- If some lock is on a cycle: \`potential deadlock: <locks on cycles, sorted>\` and then \`threads: <involved threads in input order>\`
- Otherwise: \`consistent order: <every lock>\` in an order where each lock comes after every lock that has an edge to it; when several locks are possible, take the smallest name first (Kahn's algorithm). Print \`consistent order: none\` if there are no locks at all

Sort names with JavaScript's default \`sort()\` (code-unit order, so \`B\` comes before \`a\`).

**Example:**

\`\`\`
T1: accounts audit
T2: audit accounts
T3: log
\`\`\`

prints

\`\`\`
potential deadlock: accounts audit
threads: T1 T2
\`\`\``,
        ar: `ابنِ **مدقّقاً لترتيب الأقفال**، نسخة مصغّرة من lockdep في النواة.

**المدخل:** سطر لكل خيط: \`<thread>: <lock> <lock> ...\`، أي الأقفال التي يأخذها ذلك الخيط **بهذا الترتيب**، وكل قفل يؤخذ وهو ما يزال يمسك كل ما سبقه. يظهر القفل مرة واحدة على الأكثر في كل سطر، وقد لا يسرد السطر أي قفل، وتُتجاهل الأسطر الفارغة.

**القواعد:**
- كل زوج "القفل X ممسوك بينما يؤخذ القفل Y" هو حافة **X → Y** في مخطط ترتيب الأقفال
- القفل **على حلقة** إن استطعت، بتتبّع الحواف منه، أن تعود إليه. والحلقات جمود محتمل: يستطيع خيطان أو أكثر أن يمسك كل منها قفلاً من الحلقة وينتظر التالي
- الخيط **متورّط** إن كانت إحدى حوافه X → Y تقع على حلقة، أي أن Y تستطيع الوصول إلى X

**المخرج:**
- إن كان قفل ما على حلقة: \`potential deadlock: <locks on cycles, sorted>\` ثم \`threads: <involved threads in input order>\`
- وإلا: \`consistent order: <every lock>\` بترتيب يأتي فيه كل قفل بعد كل قفل له حافة نحوه؛ وحين تتاح عدة أقفال خذ أصغرها اسماً أولاً (خوارزمية Kahn). واطبع \`consistent order: none\` إن لم توجد أقفال إطلاقاً

رتّب الأسماء بالدالة \`sort()\` الافتراضية في JavaScript (ترتيب وحدات الترميز، فيأتي \`B\` قبل \`a\`).

**مثال:**

\`\`\`
T1: accounts audit
T2: audit accounts
T3: log
\`\`\`

يطبع

\`\`\`
potential deadlock: accounts audit
threads: T1 T2
\`\`\``,
      },
      starterCode: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n");

const edges = new Map();   // lock -> Set of locks taken while holding it
const locks = new Set();
const threadEdges = [];    // [thread, [[held, next], ...]] in input order

for (const line of lines) {
  const colon = line.indexOf(":");
  if (colon < 0) continue;                       // blank line
  const thread = line.slice(0, colon).trim();
  const order = line.slice(colon + 1).trim().split(/\s+/).filter(Boolean);
  const mine = [];
  order.forEach((lock, i) => {
    locks.add(lock);
    if (!edges.has(lock)) edges.set(lock, new Set());
    // TODO 1: every lock taken earlier in this line (still held) gets an edge to this lock;
    //         also remember the pair in mine
  });
  threadEdges.push([thread, mine]);
}

// TODO 2: write reaches(from, to): can you walk from "from" to "to" along the edges?
// TODO 3: a lock x is on a cycle if one of its successors y reaches x;
//         if any lock is, print the two "potential deadlock" lines
// TODO 4: otherwise print the consistent order with Kahn's algorithm
//         (always pick the smallest ready lock)
console.log("consistent order: none");
`,
      solution: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n");

const edges = new Map();   // lock -> Set of locks taken while holding it
const locks = new Set();
const threadEdges = [];    // [thread, [[held, next], ...]] in input order

for (const line of lines) {
  const colon = line.indexOf(":");
  if (colon < 0) continue;                       // blank line
  const thread = line.slice(0, colon).trim();
  const order = line.slice(colon + 1).trim().split(/\s+/).filter(Boolean);
  const mine = [];
  order.forEach((lock, i) => {
    locks.add(lock);
    if (!edges.has(lock)) edges.set(lock, new Set());
    for (const held of order.slice(0, i)) {      // every lock still held points to the new one
      edges.get(held).add(lock);
      mine.push([held, lock]);
    }
  });
  threadEdges.push([thread, mine]);
}

// Can we walk from "from" to "to" along the edges? (iterative depth-first search)
function reaches(from, to) {
  const seen = new Set();
  const stack = [from];
  while (stack.length) {
    const x = stack.pop();
    if (x === to) return true;
    if (seen.has(x)) continue;
    seen.add(x);
    for (const y of edges.get(x)) stack.push(y);
  }
  return false;
}

const sorted = [...locks].sort();
// A lock is on a cycle if one of its successors leads back to it.
const onCycle = sorted.filter((x) => [...edges.get(x)].some((y) => reaches(y, x)));

if (onCycle.length > 0) {
  console.log("potential deadlock: " + onCycle.join(" "));
  // An edge held -> next lies on a cycle when next can get back to held.
  const involved = threadEdges.filter(([, es]) => es.some(([a, b]) => reaches(b, a))).map(([t]) => t);
  console.log("threads: " + involved.join(" "));
} else {
  // Kahn's algorithm, always taking the smallest ready lock.
  const indegree = new Map(sorted.map((x) => [x, 0]));
  for (const x of sorted) for (const y of edges.get(x)) indegree.set(y, indegree.get(y) + 1);
  const ready = sorted.filter((x) => indegree.get(x) === 0);
  const order = [];
  while (ready.length) {
    ready.sort();
    const x = ready.shift();
    order.push(x);
    for (const y of edges.get(x)) {
      indegree.set(y, indegree.get(y) - 1);
      if (indegree.get(y) === 0) ready.push(y);
    }
  }
  console.log("consistent order: " + (order.length ? order.join(" ") : "none"));
}
`,
      hints: [
        {
          en: "Inside the forEach, order.slice(0, i) is exactly the set of locks still held when lock number i is taken. Add an edge from each of them to lock, and push [held, lock] into mine so you know which thread created it.",
          ar: "داخل forEach تكون order.slice(0, i) هي بالضبط الأقفال الممسوكة حين يؤخذ القفل رقم i. أضف حافة من كل منها إلى lock، وادفع [held, lock] إلى mine لتعرف أي خيط أنشأها.",
        },
        {
          en: "reaches(from, to) is a depth-first search with a stack and a seen set. Lock x is on a cycle if [...edges.get(x)].some((y) => reaches(y, x)); a thread is involved if one of its pairs [a, b] has reaches(b, a).",
          ar: "الدالة reaches(from, to) بحث بالعمق بمكدّس ومجموعة seen. ويكون القفل x على حلقة إن تحقق [...edges.get(x)].some((y) => reaches(y, x))؛ ويكون الخيط متورّطاً إن كان لأحد أزواجه [a, b] أن reaches(b, a).",
        },
        {
          en: "For Kahn's algorithm count incoming edges (indegree) per lock, start with every lock whose count is 0, and repeatedly remove the smallest ready lock, decrementing its successors and adding those that reach 0. Call ready.sort() before each pick.",
          ar: "في خوارزمية Kahn عُدّ الحواف الداخلة (indegree) لكل قفل، وابدأ بكل قفل عدّه 0، ثم أزل مراراً أصغر قفل جاهز وأنقص عدّ تواليه وأضف ما يصل منها إلى 0. استدعِ ready.sort() قبل كل اختيار.",
        },
      ],
      tests: [
        {
          name: { en: "Example: two locks taken in opposite orders", ar: "المثال: قفلان يؤخذان بترتيبين متعاكسين" },
          stdin: "T1: accounts audit\nT2: audit accounts\nT3: log\n",
          expected: "potential deadlock: accounts audit\nthreads: T1 T2",
        },
        {
          name: { en: "A consistent order with an independent lock", ar: "ترتيب ثابت مع قفل مستقل" },
          stdin: "T1: A B\nT2: B C\nT3: A C\nT4: log\n",
          expected: "consistent order: A B C log",
        },
        {
          name: { en: "A three-way cycle and a separate pair", ar: "حلقة ثلاثية وزوج منفصل" },
          stdin: "w1: a b\nw2: b c\nw3: c a\nw4: a d\nw5: x y\nw6: y x\n",
          expected: "potential deadlock: a b c x y\nthreads: w1 w2 w3 w5 w6",
        },
        {
          name: { en: "The order follows the edges, not the alphabet", ar: "الترتيب يتبع الحواف لا الأبجدية" },
          stdin: "T1:\n\nT2: zeta alpha mid\n",
          expected: "consistent order: zeta alpha mid",
        },
        {
          name: { en: "Empty input", ar: "مدخل فارغ" },
          stdin: "",
          expected: "consistent order: none",
        },
      ],
      sampleInput: "T1: accounts audit\nT2: audit accounts\n",
    },
    {
      type: "quiz",
      questions: [
        {
          q: {
            en: "Two threads each run counter++ 1,000 times on a shared counter that starts at 0, without a lock. Why can the result be below 2,000?",
            ar: "ينفّذ خيطان كل منهما counter++ ألف مرة على عدّاد مشترك يبدأ من 0، دون قفل. لماذا قد تكون النتيجة أقل من 2,000؟",
          },
          choices: [
            { en: "The CPU cache randomly drops writes", ar: "لأن ذاكرة المعالج المخبئية تُسقط الكتابات عشوائياً" },
            { en: "counter++ is a load, an add and a store; the other thread can run in between and one update overwrites the other", ar: "لأن counter++ تحميل وإضافة وتخزين؛ وقد يعمل الخيط الآخر بينها فيكتب أحد التحديثين فوق الآخر" },
            { en: "Each thread works on its own copy of global variables", ar: "لأن كل خيط يعمل على نسخته الخاصة من المتغيرات العامة" },
            { en: "The compiler deletes one of the two loops", ar: "لأن المترجم يحذف إحدى الحلقتين" },
          ],
          answer: 1,
          explain: {
            en: "Both threads can load the same old value, add 1 and store the same new value: two increments, one effect. Threads share globals (that is the problem), and caches are kept coherent by the hardware.",
            ar: "قد يحمّل الخيطان القيمة القديمة نفسها ويضيفان 1 ويخزّنان القيمة الجديدة نفسها: زيادتان وأثر واحد. فالخيوط تتشارك المتغيرات العامة (وهنا المشكلة)، والعتاد يحافظ على اتساق الذواكر المخبئية.",
          },
        },
        {
          q: {
            en: "Why must pthread_cond_wait be called inside a while loop that re-checks the condition?",
            ar: "لماذا يجب استدعاء pthread_cond_wait داخل حلقة while تعيد فحص الشرط؟",
          },
          choices: [
            { en: "Because pthread_cond_wait returns immediately the first time it is called", ar: "لأن pthread_cond_wait تعود فوراً في أول مرة تُستدعى" },
            { en: "To keep the CPU busy so the thread is not descheduled", ar: "لإبقاء المعالج مشغولاً كي لا تُزاح جدولة الخيط" },
            { en: "Because the mutex is not held when pthread_cond_wait returns", ar: "لأن القفل لا يكون ممسوكاً حين تعود pthread_cond_wait" },
            { en: "Wake-ups can be spurious, and another thread may change the state before the woken thread runs", ar: "لأن الاستيقاظ قد يكون زائفاً، وقد يغيّر خيط آخر الحالة قبل أن يعمل الخيط المستيقظ" },
          ],
          answer: 3,
          explain: {
            en: "POSIX allows spurious wake-ups, and between the signal and the moment the woken thread re-acquires the mutex another thread may consume the item. pthread_cond_wait always returns with the mutex locked again, so re-checking is safe.",
            ar: "يسمح POSIX بالاستيقاظ الزائف، وبين التنبيه ولحظة استعادة الخيط المستيقظ للقفل قد يستهلك خيط آخر العنصر. وتعود pthread_cond_wait دائماً والقفل ممسوك من جديد، فإعادة الفحص آمنة.",
          },
        },
        {
          q: {
            en: "A semaphore guards a pool of 3 database connections and its value is now 0. A fourth thread calls wait. What happens?",
            ar: "إشارة حسابية تحرس مجمّعاً من 3 اتصالات بقاعدة البيانات وقيمتها الآن 0. يستدعي خيط رابع wait. ماذا يحدث؟",
          },
          choices: [
            { en: "It sleeps until another thread signals (gives a connection back)", ar: "ينام حتى ينفّذ خيط آخر signal (يعيد اتصالاً)" },
            { en: "The value becomes -1 and the thread continues", ar: "تصبح القيمة -1 ويتابع الخيط" },
            { en: "wait fails at once with an error", ar: "يفشل wait فوراً مع خطأ" },
            { en: "The semaphore opens a fourth connection", ar: "تفتح الإشارة الحسابية اتصالاً رابعاً" },
          ],
          answer: 0,
          explain: {
            en: "With nothing left to hand out, wait blocks. Some textbooks let the value go negative to count the sleepers, but the thread still sleeps. (sem_trywait is the variant that fails immediately with EAGAIN instead.)",
            ar: "حين لا يبقى ما يُوزَّع، يُحجب wait. بعض الكتب تسمح بأن تصبح القيمة سالبة لتعدّ النائمين، لكن الخيط ينام مع ذلك. (أما sem_trywait فهي الصيغة التي تفشل فوراً بالخطأ EAGAIN بدلاً من ذلك.)",
          },
        },
        {
          q: {
            en: "Thread 1 locks A then B; thread 2 locks B then A. Which change makes a deadlock between them impossible?",
            ar: "يقفل الخيط 1 القفل A ثم B؛ ويقفل الخيط 2 القفل B ثم A. أي تغيير يجعل الجمود بينهما مستحيلاً؟",
          },
          choices: [
            { en: "Give thread 2 a higher priority", ar: "إعطاء الخيط 2 أولوية أعلى" },
            { en: "Add a short sleep between the two lock calls", ar: "إضافة نوم قصير بين استدعاءي القفل" },
            { en: "Make both threads lock A before B", ar: "جعل الخيطين كليهما يقفلان A قبل B" },
            { en: "Use spinlocks instead of mutexes", ar: "استخدام أقفال الدوران بدل الأقفال المتبادلة" },
          ],
          answer: 2,
          explain: {
            en: "One global order removes the circular wait, one of the four required conditions. Priorities and sleeps only change the timing, which makes the bug rarer but not impossible; spinlocks deadlock just the same while burning CPU.",
            ar: "الترتيب العام الواحد يزيل الانتظار الدائري، وهو أحد الشروط الأربعة اللازمة. أما الأولويات والنوم فيغيّران التوقيت فقط، فيجعلان العلّة أندر لا مستحيلة؛ وأقفال الدوران تتجمّد بالطريقة نفسها وهي تحرق المعالج.",
          },
        },
        {
          q: {
            en: "Which of these is NOT one of the four Coffman conditions for deadlock?",
            ar: "أي مما يلي ليس من شروط Coffman الأربعة للجمود؟",
          },
          choices: [
            { en: "Hold and wait", ar: "الإمساك والانتظار" },
            { en: "Circular wait", ar: "الانتظار الدائري" },
            { en: "No preemption", ar: "عدم الانتزاع" },
            { en: "Starvation of a low-priority thread", ar: "تجويع خيط منخفض الأولوية" },
          ],
          answer: 3,
          explain: {
            en: "The four conditions are mutual exclusion, hold and wait, no preemption and circular wait. Starvation is a different liveness problem: one thread never gets a turn while the others still make progress.",
            ar: "الشروط الأربعة هي الاستبعاد المتبادل والإمساك والانتظار وعدم الانتزاع والانتظار الدائري. أما التجويع فمشكلة حيوية مختلفة: خيط واحد لا يحصل على دوره أبداً بينما يتقدّم الآخرون.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A **race condition** happens when the result depends on thread timing; \`counter++\` is three instructions, so updates get lost. Code touching shared data is a **critical section** and needs mutual exclusion, progress and bounded waiting
- A **mutex** gives mutual exclusion; it is built on **atomic instructions** (test-and-set, compare-and-swap), and on Linux on **futex** so the uncontended case stays in user space
- A **condition variable** lets a thread sleep until a condition holds; \`pthread_cond_wait\` releases the mutex atomically, and you always wait in a \`while\` loop
- A **semaphore** counts permits: value 1 is a lock, value N guards N resources; the bounded buffer uses \`slots\`, \`items\` and \`mutex\`
- A **deadlock** needs all four **Coffman conditions**; a **global lock order** removes circular wait, and tools like lockdep check that order automatically
- You built a real pthread bounded buffer, a semaphore simulator and a lock-order checker

**Practice:** read \`pthreads(7)\` and \`sem_overview(7)\`, then compile the race from this lesson with real threads and \`gcc -fsanitize=thread\` on a Linux machine to watch ThreadSanitizer report it. **Next:** file systems, where a crash between two writes causes the same kind of inconsistency a race does.`,
        ar: `## الخلاصة

- تقع **حالة السباق** حين تعتمد النتيجة على توقيت الخيوط؛ فـ \`counter++\` ثلاث تعليمات، فتضيع التحديثات. والكود الذي يلمس البيانات المشتركة **مقطع حرج** يحتاج إلى الاستبعاد المتبادل والتقدّم والانتظار المحدود
- **القفل المتبادل** يحقق الاستبعاد المتبادل؛ ويُبنى على **التعليمات الذرّية** (test-and-set وcompare-and-swap)، وفي لينكس على **futex** فتبقى الحالة غير المتنافسة في فضاء المستخدم
- **متغير الشرط** يتيح لخيط أن ينام حتى يتحقق شرط؛ وتحرّر \`pthread_cond_wait\` القفل ذرّياً، وأنت تنتظر دائماً في حلقة \`while\`
- **الإشارة الحسابية** تعدّ التصاريح: القيمة 1 قفل، والقيمة N تحرس N من الموارد؛ ويستخدم المخزن المحدود \`slots\` و\`items\` و\`mutex\`
- **الجمود** يحتاج إلى شروط **Coffman** الأربعة كلها؛ و**الترتيب العام للأقفال** يزيل الانتظار الدائري، وأدوات مثل lockdep تفحص هذا الترتيب آلياً
- بنيت مخزناً محدوداً حقيقياً بخيوط pthread ومحاكياً للإشارات الحسابية ومدقّقاً لترتيب الأقفال

**تدرّب:** اقرأ \`pthreads(7)\` و\`sem_overview(7)\`، ثم صرّف السباق من هذا الدرس بخيوط حقيقية مع \`gcc -fsanitize=thread\` على جهاز لينكس لترى ThreadSanitizer يُبلغ عنه. **التالي:** أنظمة الملفات، حيث يسبّب انهيار بين كتابتين النوع نفسه من عدم الاتساق الذي يسبّبه السباق.`,
      },
    },
  ],
};
