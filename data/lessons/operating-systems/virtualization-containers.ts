import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "virtualization-containers",
  title: { en: "Virtualization & Containers — Many Machines, One Box", ar: "المحاكاة الافتراضية والحاويات — أجهزة كثيرة في صندوق واحد" },
  estMinutes: 43,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- How a **hypervisor** runs whole **virtual machines**, from trap-and-emulate to hardware support (VT-x, AMD-V, nested paging)
- Why a **container** is just an ordinary process with a restricted view, built from **namespaces**
- How container **images** are stacked layers merged by **OverlayFS**, and what a whiteout is
- How **cgroups** limit CPU, memory and process counts, hierarchically
- What isolation each approach **does and does not** give you, and where gVisor and microVMs fit in

You will simulate PID namespaces in Python, merge image layers in Go and enforce hierarchical memory limits in JavaScript.`,
        ar: `## ماذا ستتعلم

- كيف يشغّل **المُراقِب (hypervisor)** **أجهزة افتراضية (virtual machines)** كاملة، من أسلوب الاعتراض والمحاكاة (trap-and-emulate) إلى دعم العتاد (VT-x وAMD-V والتصفيح المتداخل)
- لماذا ليست **الحاوية (container)** إلا عملية عادية برؤية مقيَّدة، مبنية من **فضاءات الأسماء (namespaces)**
- كيف تتكوّن **صور (images)** الحاويات من طبقات مكدّسة يدمجها **OverlayFS**، وما هو ملف المحو (whiteout)
- كيف تحدّ **مجموعات التحكم (cgroups)** المعالج والذاكرة وعدد العمليات، بشكل هرمي
- ما العزل الذي يعطيك إياه كل أسلوب **وما لا يعطيه**، وأين يقع gVisor والأجهزة الافتراضية المصغّرة (microVMs)

ستحاكي فضاءات أسماء PID بلغة Python، وتدمج طبقات الصور بلغة Go، وتفرض حدود ذاكرة هرمية بلغة JavaScript.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Two ways to share one machine 🖥️

A big server is too large for one program, so we split it. There are two very different ways to do that:

\`\`\`
     virtual machines                        containers
+-----------+ +-----------+          +-----------+ +-----------+
|  app A    | |  app B    |          |  app A    | |  app B    |
|  libs     | |  libs     |          |  libs     | |  libs     |
|  guest OS | |  guest OS |          +-----------+ +-----------+
|  kernel   | |  kernel   |          |   container runtime     |
+-----------+ +-----------+          +-------------------------+
|        hypervisor       |          |   ONE shared host kernel |
+-------------------------+          +-------------------------+
|        hardware         |          |        hardware         |
+-------------------------+          +-------------------------+
\`\`\`

A **virtual machine** pretends to be a whole computer, so each one boots its **own kernel**. A **container** is a group of normal processes on the **host's kernel**, each given a private view of the system. Everything else in this lesson follows from that one difference.

## Hypervisors and virtual machines

A **hypervisor** (virtual machine monitor) must, as Popek and Goldberg put it in 1974, give a guest an environment **equivalent** to the real machine, keep **control** of the real resources, and run most instructions **directly** on the CPU for speed. The classic technique is **trap and emulate**: the guest kernel runs without full privileges, so every privileged instruction it tries (changing page tables, talking to devices, disabling interrupts) **traps** into the hypervisor, which emulates the effect on the guest's virtual hardware.

Early x86 broke that rule: some sensitive instructions (\`POPF\` is the famous one) silently behaved differently instead of trapping. VMware worked around it with **binary translation** and Xen with **paravirtualization** (a guest kernel modified to call the hypervisor directly). Since 2005-2006 CPUs have **hardware virtualization**: **Intel VT-x** and **AMD-V** add a guest mode that traps exactly what the hypervisor asks for, and **nested paging** (Intel EPT, AMD NPT) adds a second level of address translation, *guest-physical → host-physical*, on top of the page tables from the memory lesson. Disks and network cards are usually **paravirtual** (**virtio**) because emulating real hardware register by register is slow.

- **Type 1** (bare metal) hypervisors run directly on the hardware: Xen, VMware ESXi, Microsoft Hyper-V. **KVM** turns the Linux kernel itself into one (QEMU supplies the virtual devices)
- **Type 2** (hosted) hypervisors run as an application on a normal OS: VirtualBox, VMware Workstation`,
        ar: `## طريقتان لتقاسم جهاز واحد 🖥️

الخادم الكبير أكبر من أن يشغّله برنامج واحد، لذا نقسمه. وتوجد لذلك طريقتان مختلفتان جداً:

\`\`\`
     virtual machines                        containers
+-----------+ +-----------+          +-----------+ +-----------+
|  app A    | |  app B    |          |  app A    | |  app B    |
|  libs     | |  libs     |          |  libs     | |  libs     |
|  guest OS | |  guest OS |          +-----------+ +-----------+
|  kernel   | |  kernel   |          |   container runtime     |
+-----------+ +-----------+          +-------------------------+
|        hypervisor       |          |   ONE shared host kernel |
+-------------------------+          +-------------------------+
|        hardware         |          |        hardware         |
+-------------------------+          +-------------------------+
\`\`\`

**الجهاز الافتراضي (virtual machine)** يتظاهر بأنه حاسوب كامل، فيُقلع كل واحد منها **نواته الخاصة**. أما **الحاوية (container)** فمجموعة من العمليات العادية على **نواة المضيف**، أُعطيت كل منها رؤية خاصة للنظام. وكل ما في هذا الدرس ينبع من هذا الفرق الواحد.

## المُراقِبات والأجهزة الافتراضية

على **المُراقِب (hypervisor)**، أو مراقب الأجهزة الافتراضية، كما صاغ ذلك Popek وGoldberg عام 1974، أن يعطي الضيف بيئة **مكافئة** للجهاز الحقيقي، وأن يحتفظ بـ**السيطرة** على الموارد الحقيقية، وأن ينفّذ معظم التعليمات **مباشرة** على المعالج لأجل السرعة. والأسلوب الكلاسيكي هو **الاعتراض والمحاكاة (trap and emulate)**: تعمل نواة الضيف دون صلاحيات كاملة، فكل تعليمة مميَّزة تحاولها (تغيير جداول الصفحات، أو مخاطبة الأجهزة، أو تعطيل المقاطعات) **تُعترض (trap)** إلى المُراقِب الذي يحاكي أثرها على العتاد الافتراضي للضيف.

كسرت معمارية x86 المبكرة هذه القاعدة: فبعض التعليمات الحساسة (\`POPF\` أشهرها) كانت تتصرف بشكل مختلف بصمت بدلاً من أن تُعترض. فالتفّت VMware على ذلك بـ**الترجمة الثنائية (binary translation)**، والتفّ Xen بـ**المحاكاة الافتراضية الموازية (paravirtualization)** (نواة ضيف معدَّلة تستدعي المُراقِب مباشرة). ومنذ 2005-2006 صارت المعالجات تدعم **المحاكاة الافتراضية بالعتاد**: يضيف **Intel VT-x** و**AMD-V** وضعاً للضيف يعترض بالضبط ما يطلبه المُراقِب، ويضيف **التصفيح المتداخل (nested paging)** (Intel EPT وAMD NPT) مستوى ثانياً من ترجمة العناوين، *من الفيزيائي عند الضيف إلى الفيزيائي عند المضيف*، فوق جداول الصفحات التي عرفتها في درس الذاكرة. أما الأقراص وبطاقات الشبكة فتكون عادةً **موازية افتراضياً** (**virtio**) لأن محاكاة العتاد الحقيقي مسجّلاً تلو مسجّل بطيئة.

- المُراقِبات من **النوع 1** (على العتاد مباشرة، bare metal) تعمل على العتاد نفسه: Xen وVMware ESXi وMicrosoft Hyper-V. ويحوّل **KVM** نواة لينكس نفسها إلى واحد منها (ويوفّر QEMU الأجهزة الافتراضية)
- المُراقِبات من **النوع 2** (المستضافة، hosted) تعمل كتطبيق على نظام تشغيل عادي: VirtualBox وVMware Workstation`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Containers: processes with a restricted view 📦

There is no "container" object in the Linux kernel. A container is an ordinary process (and its children) placed in a set of **namespaces**, each of which gives it a private copy of one global resource. \`namespaces(7)\` lists eight kinds:

- **Mount**: the list of mounted file systems (the container gets its own root file system)
- **UTS**: the hostname and domain name
- **IPC**: System V IPC objects and POSIX message queues
- **PID**: process IDs (the first process inside becomes **PID 1**)
- **Network**: network interfaces, IP addresses, routing tables, firewall rules, ports
- **User**: user and group IDs, so UID 0 inside can be an unprivileged UID outside
- **Cgroup**: which part of the cgroup tree the process sees as its root
- **Time**: the boot-time and monotonic clocks (since Linux 5.6)

You can see a process's namespaces as links in \`/proc/<pid>/ns/\` and list them all with \`lsns\`. As root, \`unshare --pid --fork --mount-proc bash\` starts a shell in a new PID namespace where \`ps\` shows only two processes: the shell is PID 1 there and \`ps\` is PID 2.

Namespaces nest. A PID namespace has a parent, and a process has **a PID in its own namespace and in every ancestor**: inside the container nginx may be PID 1 while the host knows it as PID 48213. The parent can see and signal processes in child namespaces; the child cannot see the parent's. And if the PID 1 of a namespace exits, the kernel kills every other process in that namespace (\`pid_namespaces(7)\`).

**User namespaces** remap IDs the same way through \`/proc/<pid>/uid_map\`. Rootless Podman, for example, maps root inside the container to your own UID and the other container UIDs to a range from \`/etc/subuid\`:`,
        ar: `## الحاويات: عمليات برؤية مقيَّدة 📦

لا يوجد كائن اسمه "حاوية" في نواة لينكس. الحاوية عملية عادية (مع أبنائها) وُضعت في مجموعة من **فضاءات الأسماء (namespaces)**، يعطيها كل منها نسخة خاصة من مورد عام واحد. ويسرد \`namespaces(7)\` ثمانية أنواع:

- **Mount**: قائمة أنظمة الملفات المركّبة (فتحصل الحاوية على نظام ملفات جذري خاص بها)
- **UTS**: اسم المضيف واسم النطاق
- **IPC**: كائنات System V IPC وطوابير رسائل POSIX
- **PID**: معرّفات العمليات (تصبح أول عملية في الداخل **PID 1**)
- **Network**: واجهات الشبكة وعناوين IP وجداول التوجيه وقواعد الجدار الناري والمنافذ
- **User**: معرّفات المستخدمين والمجموعات، فيمكن أن يكون UID 0 في الداخل معرّفاً غير مميَّز في الخارج
- **Cgroup**: أي جزء من شجرة cgroups تراه العملية جذراً لها
- **Time**: ساعتا وقت الإقلاع والساعة الرتيبة (monotonic) (منذ لينكس 5.6)

ترى فضاءات أسماء أي عملية على شكل روابط في \`/proc/<pid>/ns/\`، ويسردها كلها \`lsns\`. وبصلاحيات الجذر يبدأ الأمر \`unshare --pid --fork --mount-proc bash\` صدفةً في فضاء أسماء PID جديد لا يُظهر فيه \`ps\` إلا عمليتين: الصدفة هي PID 1 هناك و\`ps\` هي PID 2.

فضاءات الأسماء تتداخل. لفضاء أسماء PID أب، وللعملية **PID في فضائها الخاص وفي كل فضاء سلف**: قد تكون nginx هي PID 1 داخل الحاوية بينما يعرفها المضيف بالرقم 48213. ويستطيع الأب أن يرى العمليات في فضاءات الأبناء ويرسل إليها الإشارات؛ أما الابن فلا يرى عمليات الأب. وإذا انتهت العملية PID 1 في فضاء ما، تقتل النواة كل عملية أخرى في ذلك الفضاء (\`pid_namespaces(7)\`).

وتعيد **فضاءات أسماء المستخدمين (user namespaces)** ربط المعرّفات بالطريقة نفسها عبر \`/proc/<pid>/uid_map\`. فـ Podman بلا صلاحيات الجذر (rootless) مثلاً يربط الجذر داخل الحاوية بمعرّفك أنت، وبقية معرّفات الحاوية بنطاق من \`/etc/subuid\`:`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: String.raw`# /proc/<pid>/uid_map of a rootless container, one range per line:
#   ID-inside-namespace  ID-outside-namespace  length
uid_map = """
0      1000    1
1      100000  65536
"""
ranges = [tuple(map(int, line.split())) for line in uid_map.strip().splitlines()]

def to_host(uid):
    for inside, outside, length in ranges:
        if inside <= uid < inside + length:
            return outside + (uid - inside)
    return None                      # unmapped IDs show up as the overflow ID 65534

for uid in [0, 1, 33, 1000, 65536, 70000]:
    host = to_host(uid)
    shown = host if host is not None else "unmapped (seen as 65534)"
    print(f"container uid {uid:>5} -> host uid {shown}")
`,
      explanation: {
        en: "Root in the container (UID 0) is plain UID 1000 on the host, and www-data (33) is 100032, a UID nobody owns. A process that escapes the container lands with those powerless IDs. Try mapping 0 to 0 to see why a container without a user namespace is riskier.",
        ar: "الجذر في الحاوية (UID 0) هو المعرّف العادي 1000 على المضيف، وwww-data (33) هو 100032، وهو معرّف لا يملكه أحد. والعملية التي تفلت من الحاوية تصل بهذه المعرّفات العاجزة. جرّب ربط 0 بـ 0 لترى لماذا تكون الحاوية بلا فضاء أسماء مستخدمين أخطر.",
      },
    },
    {
      type: "lab",
      id: "pid-namespaces",
      lang: "python",
      prompt: {
        en: `Simulate **PID namespaces**: one process can have a different PID in every namespace it is visible from.

**Input:** one command per line. At the start only \`init\` exists, PID 1 of the root namespace.
- \`spawn NAME PARENT\`: start NAME as a child of PARENT, in PARENT's PID namespace
- \`spawn NAME PARENT newns\`: the same, but NAME becomes the first process of a **new** PID namespace nested inside PARENT's namespace (like \`clone()\` with \`CLONE_NEWPID\`)
- \`pids NAME\`: print NAME's PID in its own namespace, then in each ancestor namespace up to the root
- \`ps NAME\`: list the processes NAME can see, those in its namespace and in every namespace nested inside it, with their PIDs **as seen from NAME's namespace**
- \`exit NAME\`: NAME exits. If NAME is PID 1 of a nested namespace, the kernel also kills every process of that namespace and of the namespaces nested inside it

**Rules:** in every namespace PIDs are handed out 1, 2, 3, ... in creation order, counting every process created in that namespace or in any namespace nested inside it; they are never reused. The input is valid: names exist, new names are unique, \`init\` never exits and nothing is spawned into a namespace that was killed. Blank lines are ignored.

**Output:**
- \`pids NAME: <own> <parent namespace> ... <root>\`
- \`ps NAME: <pid>=<name> ...\` sorted by PID
- \`exit NAME\`, followed by \`: also killed <names in creation order>\` when others died with it

**Example:**

\`\`\`
spawn sshd init
spawn box init newns
spawn nginx box
ps init
ps nginx
pids nginx
exit box
ps init
\`\`\`

prints

\`\`\`
ps init: 1=init 2=sshd 3=box 4=nginx
ps nginx: 1=box 2=nginx
pids nginx: 2 4
exit box: also killed nginx
ps init: 1=init 2=sshd
\`\`\``,
        ar: `حاكِ **فضاءات أسماء PID**: يمكن أن يكون للعملية الواحدة PID مختلف في كل فضاء تُرى منه.

**المدخل:** أمر واحد في كل سطر. في البداية لا توجد إلا \`init\`، وهي PID 1 في فضاء الأسماء الجذر.
- \`spawn NAME PARENT\`: شغّل NAME ابناً لـ PARENT في فضاء أسماء PID الخاص بـ PARENT
- \`spawn NAME PARENT newns\`: مثل السابق، لكن NAME تصبح أول عملية في فضاء أسماء PID **جديد** متداخل داخل فضاء PARENT (مثل \`clone()\` مع \`CLONE_NEWPID\`)
- \`pids NAME\`: اطبع PID العملية NAME في فضائها الخاص، ثم في كل فضاء سلف حتى الجذر
- \`ps NAME\`: اسرد العمليات التي تراها NAME، أي التي في فضائها وفي كل فضاء متداخل داخله، مع أرقام PID **كما تُرى من فضاء NAME**
- \`exit NAME\`: تنتهي NAME. وإن كانت NAME هي PID 1 في فضاء متداخل، تقتل النواة أيضاً كل عملية في ذلك الفضاء وفي الفضاءات المتداخلة داخله

**القواعد:** في كل فضاء أسماء تُوزَّع أرقام PID بالترتيب 1 و2 و3 ... حسب ترتيب الإنشاء، مع احتساب كل عملية أُنشئت في ذلك الفضاء أو في أي فضاء متداخل داخله؛ ولا يُعاد استخدامها أبداً. والمدخل سليم: الأسماء موجودة، والأسماء الجديدة فريدة، و\`init\` لا تنتهي أبداً، ولا يُشغَّل شيء في فضاء قُتل. وتُتجاهل الأسطر الفارغة.

**المخرج:**
- \`pids NAME: <own> <parent namespace> ... <root>\`
- \`ps NAME: <pid>=<name> ...\` مرتّبة حسب PID
- \`exit NAME\`، متبوعة بـ \`: also killed <names in creation order>\` حين تموت معها عمليات أخرى

**مثال:**

\`\`\`
spawn sshd init
spawn box init newns
spawn nginx box
ps init
ps nginx
pids nginx
exit box
ps init
\`\`\`

يطبع

\`\`\`
ps init: 1=init 2=sshd 3=box 4=nginx
ps nginx: 1=box 2=nginx
pids nginx: 2 4
exit box: also killed nginx
ps init: 1=init 2=sshd
\`\`\``,
      },
      starterCode: String.raw`import sys

# Namespace 0 is the root PID namespace. parent[ns] is the namespace it was created in.
parent = {0: None}
counter = {0: 1}                     # last PID handed out in each namespace
procs = {"init": {"ns": 0, "pids": {0: 1}}}   # name -> own namespace + its PID at every level
order = ["init"]                     # creation order of the processes still alive

def levels(ns):
    """The namespace itself, then each ancestor up to the root."""
    while ns is not None:
        yield ns
        ns = parent[ns]

for line in sys.stdin.read().splitlines():
    parts = line.split()
    if not parts:
        continue
    cmd = parts[0]
    if cmd == "spawn":
        name, mother = parts[1], parts[2]
        ns = procs[mother]["ns"]
        # TODO 1: with "newns", create namespace len(parent) whose parent is ns (counter 0)
        # TODO 2: give the process the next PID in its namespace AND in every ancestor
        procs[name] = {"ns": ns, "pids": {}}
        order.append(name)
    elif cmd == "pids":
        # TODO 3: print "pids NAME: ..." from the own namespace up to the root
        pass
    elif cmd == "ps":
        # TODO 4: the processes that have a PID in NAME's namespace, sorted by that PID
        pass
    elif cmd == "exit":
        # TODO 5: remove the process; if it is PID 1 of a nested namespace,
        #         also remove every process that has a PID in that namespace
        pass
`,
      solution: String.raw`import sys

# Namespace 0 is the root PID namespace. parent[ns] is the namespace it was created in.
parent = {0: None}
counter = {0: 1}                     # last PID handed out in each namespace
procs = {"init": {"ns": 0, "pids": {0: 1}}}   # name -> own namespace + its PID at every level
order = ["init"]                     # creation order of the processes still alive

def levels(ns):
    """The namespace itself, then each ancestor up to the root."""
    while ns is not None:
        yield ns
        ns = parent[ns]

for line in sys.stdin.read().splitlines():
    parts = line.split()
    if not parts:
        continue
    cmd = parts[0]
    if cmd == "spawn":
        name, mother = parts[1], parts[2]
        ns = procs[mother]["ns"]
        if len(parts) > 3 and parts[3] == "newns":
            new = len(parent)        # a fresh namespace nested inside the parent's one
            parent[new] = ns
            counter[new] = 0
            ns = new
        pids = {}
        for level in levels(ns):     # one PID in its own namespace and in every ancestor
            counter[level] += 1
            pids[level] = counter[level]
        procs[name] = {"ns": ns, "pids": pids}
        order.append(name)
    elif cmd == "pids":
        name = parts[1]
        p = procs[name]
        print(f"pids {name}: " + " ".join(str(p["pids"][level]) for level in levels(p["ns"])))
    elif cmd == "ps":
        name = parts[1]
        ns = procs[name]["ns"]
        visible = [(procs[n]["pids"][ns], n) for n in order if ns in procs[n]["pids"]]
        print(f"ps {name}: " + " ".join(f"{pid}={n}" for pid, n in sorted(visible)))
    elif cmd == "exit":
        name = parts[1]
        p = procs[name]
        victims = [name]
        if p["pids"][p["ns"]] == 1 and p["ns"] != 0:
            # The init of a PID namespace died: the kernel SIGKILLs everything inside it.
            victims += [n for n in order if n != name and p["ns"] in procs[n]["pids"]]
        for n in victims:
            del procs[n]
            order.remove(n)
        extra = victims[1:]
        print(f"exit {name}" + (": also killed " + " ".join(extra) if extra else ""))
`,
      hints: [
        {
          en: "Store, for every process, a dict namespace -> PID. On spawn walk levels(ns): for each level add 1 to counter[level] and record it. A brand-new namespace starts with counter 0, so its first process gets PID 1.",
          ar: "خزّن لكل عملية قاموساً من فضاء الأسماء إلى PID. وعند spawn امشِ في levels(ns): أضف 1 إلى counter[level] لكل مستوى وسجّله. والفضاء الجديد كلياً يبدأ بالعدّاد 0، فتحصل أول عملية فيه على PID 1.",
        },
        {
          en: "A process is visible from namespace ns exactly when it has a PID there: ns in procs[n][\"pids\"]. For ps collect (pid in ns, name) pairs and sort them; for pids join the PIDs along levels(own namespace).",
          ar: "تكون العملية مرئية من الفضاء ns تماماً حين يكون لها PID فيه: ns in procs[n][\"pids\"]. وفي ps اجمع أزواج (PID في ns، الاسم) ورتّبها؛ وفي pids اربط أرقام PID على طول levels(الفضاء الخاص).",
        },
        {
          en: "On exit, a process whose PID in its own namespace is 1 (and that namespace is not 0) takes down every process that has a PID in that namespace, which includes the nested ones. Remove them from procs and order, and list them in creation order.",
          ar: "عند exit، العملية التي يكون PID الخاص بها في فضائها هو 1 (وذلك الفضاء ليس 0) تُسقط معها كل عملية لها PID في ذلك الفضاء، وهذا يشمل الفضاءات المتداخلة. أزلها من procs ومن order، واسردها بترتيب الإنشاء.",
        },
      ],
      tests: [
        {
          name: { en: "Example from the prompt", ar: "المثال من نص المسألة" },
          stdin: "spawn sshd init\nspawn box init newns\nspawn nginx box\nps init\nps nginx\npids nginx\nexit box\nps init\n",
          expected: `ps init: 1=init 2=sshd 3=box 4=nginx
ps nginx: 1=box 2=nginx
pids nginx: 2 4
exit box: also killed nginx
ps init: 1=init 2=sshd`,
        },
        {
          name: { en: "Namespaces inside namespaces", ar: "فضاءات داخل فضاءات" },
          stdin: "spawn sshd init\nspawn box init newns\nspawn nginx box\nspawn worker nginx\nps init\nps nginx\npids worker\nspawn inner worker newns\nspawn job inner\npids job\nps box\nps job\nexit box\nps init\n",
          expected: `ps init: 1=init 2=sshd 3=box 4=nginx 5=worker
ps nginx: 1=box 2=nginx 3=worker
pids worker: 3 5
pids job: 2 5 7
ps box: 1=box 2=nginx 3=worker 4=inner 5=job
ps job: 1=inner 2=job
exit box: also killed nginx worker inner job
ps init: 1=init 2=sshd`,
        },
        {
          name: { en: "A normal exit kills nobody else and PIDs are not reused", ar: "الخروج العادي لا يقتل أحداً وأرقام PID لا يُعاد استخدامها" },
          stdin: "spawn a init\nspawn b init\nexit a\nspawn c init\nps init\npids c\nexit b\nps c\n",
          expected: `exit a
ps init: 1=init 3=b 4=c
pids c: 4
exit b
ps c: 1=init 4=c`,
        },
        {
          name: { en: "A nested init takes down only its own namespace", ar: "init المتداخلة لا تُسقط إلا فضاءها" },
          stdin: "spawn box init newns\nspawn web box\n\nspawn inner web newns\nspawn job inner\npids job\nexit inner\nps box\nps init\n",
          expected: `pids job: 2 4 5
exit inner: also killed job
ps box: 1=box 2=web
ps init: 1=init 2=box 3=web`,
        },
        {
          name: { en: "Only init", ar: "init وحدها" },
          stdin: "ps init\npids init\n",
          expected: "ps init: 1=init\npids init: 1",
        },
      ],
      sampleInput: "spawn sshd init\nspawn box init newns\nspawn nginx box\nps init\nps nginx\npids nginx\n",
    },
    {
      type: "text",
      body: {
        en: `## Images: layers stacked with OverlayFS 🧅

A container image is not one big disk file. It is a stack of read-only **layers**, each a tarball of the files a build step added or changed (OCI image spec). At run time the **mount namespace** gets a root file system assembled by **OverlayFS**:

\`\`\`
merged view (what the container sees)       /app/server.py  /bin/sh  /etc/os-release
                                                   ▲             ▲          ▲
upperdir   (writable, per container)               │             │          │
layer 3    (read-only)   /app/server.py v2  ───────┘             │          │
layer 2    (read-only)   /app/server.py v1, /etc/.wh.motd        │          │
layer 1    (read-only)   /bin/sh, /etc/os-release, /etc/motd ────┴──────────┘
\`\`\`

- A file in a **higher** layer hides the same path in lower layers
- Layers are never modified. The first write to a lower file **copies it up** into the container's writable upper layer, so a hundred containers can share one image on disk
- Deleting needs a marker, because a lower layer cannot change: a **whiteout**. In image layers it is an empty file named \`.wh.<name>\`; \`/etc/.wh.motd\` deletes \`/etc/motd\` from the layers below. The special name \`.wh..wh..opq\` makes a directory **opaque**: nothing below it in lower layers shows through
- A whiteout only applies to **lower** layers, never to files of its own layer

This is why \`RUN rm big.tar\` in a later build step does not shrink an image: the file still sits in the earlier layer, only hidden.`,
        ar: `## الصور: طبقات يكدّسها OverlayFS 🧅

صورة الحاوية ليست ملف قرص واحداً كبيراً. إنها كومة من **الطبقات (layers)** للقراءة فقط، كل منها أرشيف tar بالملفات التي أضافتها خطوة بناء أو غيّرتها (مواصفة صور OCI). وعند التشغيل يحصل **فضاء أسماء التركيب (mount namespace)** على نظام ملفات جذري يجمّعه **OverlayFS**:

\`\`\`
merged view (what the container sees)       /app/server.py  /bin/sh  /etc/os-release
                                                   ▲             ▲          ▲
upperdir   (writable, per container)               │             │          │
layer 3    (read-only)   /app/server.py v2  ───────┘             │          │
layer 2    (read-only)   /app/server.py v1, /etc/.wh.motd        │          │
layer 1    (read-only)   /bin/sh, /etc/os-release, /etc/motd ────┴──────────┘
\`\`\`

- الملف في طبقة **أعلى** يحجب المسار نفسه في الطبقات الأدنى
- لا تُعدَّل الطبقات أبداً. وأول كتابة في ملف من طبقة أدنى **تنسخه إلى الأعلى (copy up)** في الطبقة العليا القابلة للكتابة الخاصة بالحاوية، فتستطيع مئة حاوية أن تتشارك صورة واحدة على القرص
- الحذف يحتاج إلى علامة، لأن الطبقة الأدنى لا تتغير: **ملف المحو (whiteout)**. وفي طبقات الصور هو ملف فارغ اسمه \`.wh.<name>\`؛ فالملف \`/etc/.wh.motd\` يحذف \`/etc/motd\` من الطبقات التي تحته. والاسم الخاص \`.wh..wh..opq\` يجعل المجلد **معتماً (opaque)**: لا يظهر شيء مما تحته في الطبقات الأدنى
- ملف المحو لا يسري إلا على الطبقات **الأدنى**، ولا يسري أبداً على ملفات طبقته هو

ولهذا لا يصغّر \`RUN rm big.tar\` في خطوة بناء لاحقة حجم الصورة: فالملف ما يزال قابعاً في الطبقة السابقة، مخفياً فقط.`,
      },
    },
    {
      type: "lab",
      id: "image-layers",
      lang: "go",
      prompt: {
        en: `Merge the layers of a container image the way OverlayFS presents them, including **OCI whiteouts**.

**Input:** a line \`layer\` starts a new layer; the first layer is the bottom one. Inside a layer each line is an entry with an absolute path:
- \`<path> <content>\`: a regular file (the content is the rest of the line, possibly empty)
- \`<dir>/.wh.<name>\`: a **whiteout**: \`<dir>/<name>\` and everything below it disappear from the lower layers
- \`<dir>/.wh..wh..opq\`: an **opaque** marker: everything below \`<dir>\` disappears from the lower layers (\`/.wh..wh..opq\` hides everything)

Blank lines are ignored. Only files are listed; directories exist implicitly.

**Rules:** apply the layers bottom to top. For each layer, first apply its whiteouts and opaque markers to the result of the **lower** layers, then add its files (a file replaces the same path from below). A whiteout never hides a file of its own layer.

**Output:** every file of the merged view sorted by path (Go's \`sort.Strings\`), one per line as \`<path> <content>\`, then \`files: <count>\`.

**Example:**

\`\`\`
layer
/etc/os-release debian 12
/etc/motd welcome
/bin/sh dash
layer
/etc/.wh.motd
/app/server.py v1
layer
/app/server.py v2
\`\`\`

prints

\`\`\`
/app/server.py v2
/bin/sh dash
/etc/os-release debian 12
files: 3
\`\`\``,
        ar: `ادمج طبقات صورة حاوية كما يعرضها OverlayFS، بما في ذلك **ملفات المحو في OCI**.

**المدخل:** السطر \`layer\` يبدأ طبقة جديدة؛ والطبقة الأولى هي السفلى. وداخل الطبقة كل سطر مدخل بمسار مطلق:
- \`<path> <content>\`: ملف عادي (المحتوى هو بقية السطر، وقد يكون فارغاً)
- \`<dir>/.wh.<name>\`: **ملف محو (whiteout)**: يختفي \`<dir>/<name>\` وكل ما تحته من الطبقات الأدنى
- \`<dir>/.wh..wh..opq\`: علامة **إعتام (opaque)**: يختفي كل ما تحت \`<dir>\` من الطبقات الأدنى (و\`/.wh..wh..opq\` يُخفي كل شيء)

تُتجاهل الأسطر الفارغة. ولا تُسرد إلا الملفات؛ والمجلدات موجودة ضمنياً.

**القواعد:** طبّق الطبقات من الأسفل إلى الأعلى. ولكل طبقة، طبّق أولاً ملفات المحو وعلامات الإعتام فيها على نتيجة الطبقات **الأدنى**، ثم أضف ملفاتها (الملف يستبدل المسار نفسه القادم من الأسفل). ولا يُخفي ملف المحو أبداً ملفاً من طبقته.

**المخرج:** كل ملف في الرؤية المدمجة مرتّباً حسب المسار (\`sort.Strings\` في Go)، واحداً في كل سطر بالشكل \`<path> <content>\`، ثم \`files: <count>\`.

**مثال:**

\`\`\`
layer
/etc/os-release debian 12
/etc/motd welcome
/bin/sh dash
layer
/etc/.wh.motd
/app/server.py v1
layer
/app/server.py v2
\`\`\`

يطبع

\`\`\`
/app/server.py v2
/bin/sh dash
/etc/os-release debian 12
files: 3
\`\`\``,
      },
      starterCode: String.raw`package main

import (
	"bufio"
	"fmt"
	"os"
	"path"
	"sort"
	"strings"
)

const whiteoutPrefix = ".wh."
const opaqueMarker = ".wh..wh..opq"

// applyLayer merges one layer onto the view of the layers below it.
// Each entry is {path, content}.
func applyLayer(merged map[string]string, entries [][2]string) {
	// TODO 1: first pass over the entries, for the whiteouts of this layer:
	//   - base name == opaqueMarker: delete every merged path that starts with dir + "/"
	//   - base name starts with whiteoutPrefix: delete dir/<name> and every path under it
	// TODO 2: second pass: add the regular files (they replace lower ones)
	for _, e := range entries {
		if !strings.HasPrefix(path.Base(e[0]), whiteoutPrefix) {
			merged[e[0]] = e[1]
		}
	}
}

func main() {
	merged := map[string]string{}
	var layer [][2]string
	started := false
	sc := bufio.NewScanner(os.Stdin)
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" {
			continue
		}
		if line == "layer" {
			if started {
				applyLayer(merged, layer)
			}
			layer, started = nil, true
			continue
		}
		parts := strings.SplitN(line, " ", 2)
		content := ""
		if len(parts) == 2 {
			content = parts[1]
		}
		layer = append(layer, [2]string{parts[0], content})
	}
	if started {
		applyLayer(merged, layer)
	}

	paths := make([]string, 0, len(merged))
	for p := range merged {
		paths = append(paths, p)
	}
	sort.Strings(paths)
	for _, p := range paths {
		fmt.Printf("%s %s\n", p, merged[p])
	}
	fmt.Printf("files: %d\n", len(paths))
}
`,
      solution: String.raw`package main

import (
	"bufio"
	"fmt"
	"os"
	"path"
	"sort"
	"strings"
)

const whiteoutPrefix = ".wh."
const opaqueMarker = ".wh..wh..opq"

// applyLayer merges one layer onto the view of the layers below it.
// Each entry is {path, content}. Whiteouts only hide entries of LOWER layers,
// so they are applied before the layer's own files are added.
func applyLayer(merged map[string]string, entries [][2]string) {
	for _, e := range entries {
		dir, base := path.Dir(e[0]), path.Base(e[0])
		if base == opaqueMarker {
			// Opaque directory: everything below dir from lower layers disappears.
			prefix := strings.TrimSuffix(dir, "/") + "/"
			for p := range merged {
				if strings.HasPrefix(p, prefix) {
					delete(merged, p)
				}
			}
		} else if strings.HasPrefix(base, whiteoutPrefix) {
			// Whiteout: hide dir/<name> and, if it was a directory, everything under it.
			target := path.Join(dir, strings.TrimPrefix(base, whiteoutPrefix))
			for p := range merged {
				if p == target || strings.HasPrefix(p, target+"/") {
					delete(merged, p)
				}
			}
		}
	}
	for _, e := range entries {
		if !strings.HasPrefix(path.Base(e[0]), whiteoutPrefix) {
			merged[e[0]] = e[1] // a file in an upper layer replaces the lower one
		}
	}
}

func main() {
	merged := map[string]string{}
	var layer [][2]string
	started := false
	sc := bufio.NewScanner(os.Stdin)
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" {
			continue
		}
		if line == "layer" {
			if started {
				applyLayer(merged, layer)
			}
			layer, started = nil, true
			continue
		}
		parts := strings.SplitN(line, " ", 2)
		content := ""
		if len(parts) == 2 {
			content = parts[1]
		}
		layer = append(layer, [2]string{parts[0], content})
	}
	if started {
		applyLayer(merged, layer)
	}

	paths := make([]string, 0, len(merged))
	for p := range merged {
		paths = append(paths, p)
	}
	sort.Strings(paths)
	for _, p := range paths {
		fmt.Printf("%s %s\n", p, merged[p])
	}
	fmt.Printf("files: %d\n", len(paths))
}
`,
      hints: [
        {
          en: "path.Dir and path.Base split an entry like /etc/.wh.motd into /etc and .wh.motd. Check for the opaque marker first, because it also starts with .wh.",
          ar: "تقسم path.Dir وpath.Base مدخلاً مثل /etc/.wh.motd إلى /etc و.wh.motd. افحص علامة الإعتام أولاً لأنها تبدأ هي أيضاً بـ .wh.",
        },
        {
          en: "For a whiteout the target is path.Join(dir, strings.TrimPrefix(base, \".wh.\")). Delete the target itself and every path that starts with target + \"/\", but not a sibling such as /ab when the target is /a.",
          ar: "في ملف المحو يكون الهدف path.Join(dir, strings.TrimPrefix(base, \".wh.\")). احذف الهدف نفسه وكل مسار يبدأ بـ target + \"/\"، لكن لا تحذف شقيقاً مثل /ab حين يكون الهدف /a.",
        },
        {
          en: "For the opaque marker the prefix is strings.TrimSuffix(dir, \"/\") + \"/\", which also works for the root (dir \"/\"). Deleting from a Go map while ranging over it is allowed.",
          ar: "في علامة الإعتام تكون البادئة strings.TrimSuffix(dir, \"/\") + \"/\"، وهي تعمل للجذر أيضاً (حين يكون dir هو \"/\"). وحذف عناصر من خريطة Go أثناء المرور عليها بـ range مسموح.",
        },
      ],
      tests: [
        {
          name: { en: "Example: an upper file wins, a whiteout deletes", ar: "المثال: الملف الأعلى يفوز وملف المحو يحذف" },
          stdin: "layer\n/etc/os-release debian 12\n/etc/motd welcome\n/bin/sh dash\nlayer\n/etc/.wh.motd\n/app/server.py v1\nlayer\n/app/server.py v2\n",
          expected: "/app/server.py v2\n/bin/sh dash\n/etc/os-release debian 12\nfiles: 3",
        },
        {
          name: { en: "An opaque directory and a directory whiteout", ar: "مجلد معتم وملف محو لمجلد" },
          stdin: "layer\n/var/cache/apt/a.deb 1\n/var/cache/apt/b.deb 2\n/var/cache/x 3\n/var/log/syslog 4\n/var/lib/dpkg/status ok\nlayer\n/var/cache/.wh..wh..opq\n/var/cache/new fresh\nlayer\n/var/.wh.log\n",
          expected: "/var/cache/new fresh\n/var/lib/dpkg/status ok\nfiles: 2",
        },
        {
          name: { en: "A whiteout hides /a and /a/b but not /ab", ar: "ملف المحو يُخفي /a و/a/b لا /ab" },
          stdin: "layer\n/a/b 1\n/a 2\n/ab 3\nlayer\n/.wh.a\n",
          expected: "/ab 3\nfiles: 1",
        },
        {
          name: { en: "A whiteout never hides a file of its own layer", ar: "ملف المحو لا يُخفي ملفاً من طبقته" },
          stdin: "layer\n/x old\n/y keep\nlayer\n/x new\n/.wh.x\nlayer\n/.wh..wh..opq\n/z only\n",
          expected: "/z only\nfiles: 1",
        },
        {
          name: { en: "No layers at all", ar: "لا طبقات إطلاقاً" },
          stdin: "",
          expected: "files: 0",
        },
      ],
      sampleInput: "layer\n/etc/motd welcome\n/bin/sh dash\nlayer\n/etc/.wh.motd\n",
    },
    {
      type: "text",
      body: {
        en: `## cgroups: how much a group may use 📏

Namespaces control what a process can **see**; **control groups (cgroups)** control how much it can **use**. Modern distributions mount the unified **cgroup v2** hierarchy at \`/sys/fs/cgroup\`: every directory is a cgroup, \`mkdir\` creates one and writing a PID to its \`cgroup.procs\` file moves a process into it. Each controller exposes plain files:

- **cpu**: \`cpu.max\` holds \`QUOTA PERIOD\` in microseconds. \`50000 100000\` allows 50 ms of CPU time per 100 ms period, half a CPU; \`max 100000\` (the default) means no limit. \`cpu.weight\` sets a relative share instead of a hard cap
- **memory**: \`memory.current\` is the usage of the cgroup **and all its descendants**; \`memory.high\` throttles and reclaims above a soft limit; \`memory.max\` is the hard limit. When usage would exceed it and the kernel cannot reclaim enough, the **OOM killer** kills a process inside that cgroup
- **pids**: \`pids.max\` caps the number of processes and threads, which stops a fork bomb
- **io**: \`io.max\` limits bytes or operations per second per device

Limits are **hierarchical**: a cgroup can never use more than any of its ancestors allows, because its usage is charged to every ancestor too. \`docker run --memory=512m --cpus=1.5 --pids-limit=64\` just writes \`memory.max\`, \`cpu.max = 150000 100000\` and \`pids.max\`. The Code Lab runner that grades your labs sets the same kind of limits for every program you submit: \`--memory\`, \`--cpus\` and \`--pids-limit\`, plus \`--network none\` and a read-only root file system. See what \`cpu.max\` does to a CPU-bound job:`,
        ar: `## مجموعات التحكم: كم يحق لمجموعة أن تستهلك 📏

فضاءات الأسماء تتحكم فيما تستطيع العملية **رؤيته**؛ أما **مجموعات التحكم (cgroups)** فتتحكم في مقدار ما تستطيع **استهلاكه**. وتركّب التوزيعات الحديثة التسلسل الموحّد **cgroup v2** في \`/sys/fs/cgroup\`: كل مجلد مجموعة تحكم، والأمر \`mkdir\` ينشئ واحدة، وكتابة PID في ملفها \`cgroup.procs\` تنقل العملية إليها. ويعرض كل متحكّم (controller) ملفات بسيطة:

- **cpu**: يحمل \`cpu.max\` القيمة \`QUOTA PERIOD\` بالميكروثانية. فـ \`50000 100000\` تسمح بـ 50 ms من وقت المعالج في كل فترة من 100 ms، أي نصف معالج؛ و\`max 100000\` (الافتراضية) تعني بلا حد. أما \`cpu.weight\` فيضبط حصة نسبية بدلاً من سقف صارم
- **memory**: \`memory.current\` هو استهلاك مجموعة التحكم **وكل المتفرّعة عنها**؛ و\`memory.high\` يبطّئ ويستعيد الذاكرة فوق حد مرن؛ و\`memory.max\` هو الحد الصارم. وحين يوشك الاستهلاك أن يتجاوزه ولا تستطيع النواة استعادة ما يكفي، يقتل **قاتل نفاد الذاكرة (OOM killer)** عملية داخل تلك المجموعة
- **pids**: يحدّ \`pids.max\` عدد العمليات والخيوط، وهذا يوقف قنبلة fork
- **io**: يحدّ \`io.max\` البايتات أو العمليات في الثانية لكل جهاز

الحدود **هرمية**: لا تستطيع مجموعة التحكم أن تستهلك أكثر مما يسمح به أي سلف لها، لأن استهلاكها يُحتسب على كل سلف أيضاً. والأمر \`docker run --memory=512m --cpus=1.5 --pids-limit=64\` لا يفعل إلا كتابة \`memory.max\` و\`cpu.max = 150000 100000\` و\`pids.max\`. ومشغّل Code Lab الذي يصحّح مختبراتك يضع النوع نفسه من الحدود لكل برنامج ترسله: \`--memory\` و\`--cpus\` و\`--pids-limit\`، مع \`--network none\` ونظام ملفات جذري للقراءة فقط. انظر ماذا يفعل \`cpu.max\` بمهمة تستهلك المعالج:`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// cpu.max is "QUOTA PERIOD" in microseconds: the cgroup may use QUOTA of CPU time
// in every PERIOD, then it is throttled until the next period starts.
function wallTimeMs(cpuMax, cpuMs) {
  const [quota, period] = cpuMax.split(" ");
  if (quota === "max") return cpuMs;                     // no limit
  const p = Number(period) / 1000;
  const q = Math.min(Number(quota) / 1000, p);           // one thread can use at most one CPU
  const throttledPeriods = Math.ceil(cpuMs / q) - 1;     // every period but the last ends throttled
  return throttledPeriods * p + (cpuMs - throttledPeriods * q);
}

const job = 250; // a single-threaded job that needs 250 ms of CPU time
for (const cpuMax of ["max 100000", "50000 100000", "25000 100000", "150000 100000"]) {
  const [quota, period] = cpuMax.split(" ");
  const cpus = quota === "max" ? "unlimited" : (Number(quota) / Number(period)) + " CPU";
  console.log(("cpu.max \\"" + cpuMax + "\\"").padEnd(24) + ("(" + cpus + ")").padEnd(14) + "-> done after " + wallTimeMs(cpuMax, job) + " ms");
}
`,
      explanation: {
        en: "With half a CPU the job runs 50 ms, waits 50 ms, and finishes after 450 ms. A quota of 1.5 CPUs does not help a single thread, which can only use one CPU at a time. Try a 10 ms period with the same ratio to see why short periods make throttling smoother.",
        ar: "مع نصف معالج تعمل المهمة 50 ms وتنتظر 50 ms، وتنتهي بعد 450 ms. ولا تفيد حصة 1.5 معالج خيطاً واحداً لأنه لا يستطيع استخدام أكثر من معالج واحد في كل لحظة. جرّب فترة 10 ms بالنسبة نفسها لترى لماذا تجعل الفترات القصيرة الكبحَ أنعم.",
      },
    },
    {
      type: "lab",
      id: "cgroup-memory",
      lang: "javascript",
      prompt: {
        en: `Enforce **hierarchical memory limits** like cgroup v2's \`memory.max\`.

**Input:** one command per line (blank lines are ignored). The root cgroup \`/\` always exists and has no limit. Sizes are whole MiB.
- \`mkdir PATH MAX\`: create a cgroup; MAX is a number or \`max\` (no limit). Errors: \`mkdir PATH: File exists\` if it exists, \`mkdir PATH: No such file or directory\` if its parent does not
- \`charge PATH N\`: a process in PATH wants N more MiB. The usage counts against PATH **and every ancestor**. If any of them would go above its MAX, the charge is refused and \`charge PATH N: OOM in <cgroup>\` names the **closest** such cgroup, starting from PATH and walking up; otherwise every cgroup on the way grows by N and \`charge PATH N: ok\` is printed
- \`uncharge PATH N\`: PATH and every ancestor shrink by N (the input never frees more than was charged)
- \`show\`: one line per cgroup in creation order, root first: \`<path> current=<MiB> max=<MAX>\`

Reaching the limit exactly is allowed. (In the kernel a charge over \`memory.max\` first triggers reclaim, and if that fails the OOM killer kills a process in the cgroup; here the charge is simply refused.)

**Example:**

\`\`\`
mkdir /web 512
mkdir /web/api 300
charge /web/api 200
charge /web/api 120
show
\`\`\`

prints

\`\`\`
charge /web/api 200: ok
charge /web/api 120: OOM in /web/api
/ current=200 max=max
/web current=200 max=512
/web/api current=200 max=300
\`\`\``,
        ar: `افرض **حدود ذاكرة هرمية** مثل \`memory.max\` في cgroup v2.

**المدخل:** أمر واحد في كل سطر (تُتجاهل الأسطر الفارغة). مجموعة التحكم الجذر \`/\` موجودة دائماً ولا حد لها. والأحجام أعداد صحيحة بوحدة MiB.
- \`mkdir PATH MAX\`: أنشئ مجموعة تحكم؛ MAX عدد أو \`max\` (بلا حد). الأخطاء: \`mkdir PATH: File exists\` إن كانت موجودة، و\`mkdir PATH: No such file or directory\` إن لم يكن أبوها موجوداً
- \`charge PATH N\`: عملية في PATH تريد N من MiB إضافية. ويُحتسب الاستهلاك على PATH **وعلى كل سلف لها**. فإن كان أي منها سيتجاوز MAX الخاص به، يُرفض الطلب ويُطبع \`charge PATH N: OOM in <cgroup>\` باسم **أقرب** مجموعة كهذه، بدءاً من PATH وصعوداً؛ وإلا تكبر كل مجموعة في الطريق بمقدار N ويُطبع \`charge PATH N: ok\`
- \`uncharge PATH N\`: تصغر PATH وكل سلف لها بمقدار N (لا يحرّر المدخل أبداً أكثر مما احتُسب)
- \`show\`: سطر لكل مجموعة تحكم بترتيب الإنشاء، والجذر أولاً: \`<path> current=<MiB> max=<MAX>\`

بلوغ الحد بالضبط مسموح. (في النواة، الطلب الذي يتجاوز \`memory.max\` يطلق أولاً استعادة الذاكرة (reclaim)، فإن فشلت قتل قاتل نفاد الذاكرة عملية في المجموعة؛ أما هنا فيُرفض الطلب ببساطة.)

**مثال:**

\`\`\`
mkdir /web 512
mkdir /web/api 300
charge /web/api 200
charge /web/api 120
show
\`\`\`

يطبع

\`\`\`
charge /web/api 200: ok
charge /web/api 120: OOM in /web/api
/ current=200 max=max
/web current=200 max=512
/web/api current=200 max=300
\`\`\``,
      },
      starterCode: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n");

// path -> { max: MiB (Infinity = no limit), current: MiB used by the cgroup and its descendants }
const groups = new Map([["/", { max: Infinity, current: 0 }]]);

function parentOf(p) {
  const i = p.lastIndexOf("/");
  return i === 0 ? "/" : p.slice(0, i);
}

// TODO 1: chain(p) returns [p, parent, grandparent, ..., "/"]

for (const line of lines) {
  const [cmd, p, arg] = line.trim().split(/\s+/);
  if (!cmd) continue;
  if (cmd === "mkdir") {
    // TODO 2: the two errors, otherwise create { max, current: 0 } ("max" means Infinity)
  } else if (cmd === "charge") {
    // TODO 3: find the first cgroup in chain(p) that would exceed its max:
    //         print "OOM in ..." for it, or add the amount everywhere and print "ok"
  } else if (cmd === "uncharge") {
    // TODO 4: subtract the amount from p and every ancestor
  } else if (cmd === "show") {
    for (const [g, v] of groups) {
      console.log(g + " current=" + v.current + " max=" + (v.max === Infinity ? "max" : v.max));
    }
  }
}
`,
      solution: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n");

// path -> { max: MiB (Infinity = no limit), current: MiB used by the cgroup and its descendants }
const groups = new Map([["/", { max: Infinity, current: 0 }]]);

function parentOf(p) {
  const i = p.lastIndexOf("/");
  return i === 0 ? "/" : p.slice(0, i);
}

// The cgroup itself, then every ancestor up to the root.
function chain(p) {
  const out = [p];
  while (p !== "/") {
    p = parentOf(p);
    out.push(p);
  }
  return out;
}

for (const line of lines) {
  const [cmd, p, arg] = line.trim().split(/\s+/);
  if (!cmd) continue;
  if (cmd === "mkdir") {
    if (groups.has(p)) console.log("mkdir " + p + ": File exists");
    else if (!groups.has(parentOf(p))) console.log("mkdir " + p + ": No such file or directory");
    else groups.set(p, { max: arg === "max" ? Infinity : Number(arg), current: 0 });
  } else if (cmd === "charge") {
    const amount = Number(arg);
    // Usage counts against the cgroup AND every ancestor: the closest full one says no.
    const limiter = chain(p).find((g) => groups.get(g).current + amount > groups.get(g).max);
    if (limiter) {
      console.log("charge " + p + " " + amount + ": OOM in " + limiter);
    } else {
      for (const g of chain(p)) groups.get(g).current += amount;
      console.log("charge " + p + " " + amount + ": ok");
    }
  } else if (cmd === "uncharge") {
    for (const g of chain(p)) groups.get(g).current -= Number(arg);
  } else if (cmd === "show") {
    for (const [g, v] of groups) {
      console.log(g + " current=" + v.current + " max=" + (v.max === Infinity ? "max" : v.max));
    }
  }
}
`,
      hints: [
        {
          en: "chain(p) is a loop: start with [p] and keep pushing parentOf(p) until you reach \"/\". Every command that changes usage walks this chain.",
          ar: "الدالة chain(p) حلقة: ابدأ بـ [p] وتابع إضافة parentOf(p) حتى تصل إلى \"/\". وكل أمر يغيّر الاستهلاك يمشي في هذه السلسلة.",
        },
        {
          en: "Check before you change anything: chain(p).find((g) => groups.get(g).current + amount > groups.get(g).max) returns the closest cgroup that says no, or undefined. Only when it is undefined add the amount to every cgroup of the chain.",
          ar: "افحص قبل أن تغيّر أي شيء: تعيد chain(p).find((g) => groups.get(g).current + amount > groups.get(g).max) أقرب مجموعة ترفض، أو undefined. ولا تضف المقدار إلى كل مجموعة في السلسلة إلا حين تكون النتيجة undefined.",
        },
        {
          en: "Store \"max\" as Infinity so the comparison needs no special case, and print it back as max in show. Number(\"512\") turns the other values into numbers; a Map keeps creation order for show.",
          ar: "خزّن \"max\" على شكل Infinity فلا تحتاج المقارنة إلى حالة خاصة، واطبعه max من جديد في show. وتحوّل Number(\"512\") القيم الأخرى إلى أعداد؛ ويحافظ Map على ترتيب الإنشاء لأجل show.",
        },
      ],
      tests: [
        {
          name: { en: "Example: the cgroup's own limit", ar: "المثال: حد المجموعة نفسها" },
          stdin: "mkdir /web 512\nmkdir /web/api 300\ncharge /web/api 200\ncharge /web/api 120\nshow\n",
          expected: `charge /web/api 200: ok
charge /web/api 120: OOM in /web/api
/ current=200 max=max
/web current=200 max=512
/web/api current=200 max=300`,
        },
        {
          name: { en: "A parent's limit stops a child without one", ar: "حد الأب يوقف ابناً لا حد له" },
          stdin: "mkdir /web 512\nmkdir /web/api 300\nmkdir /web/static max\ncharge /web/api 200\ncharge /web/static 250\ncharge /web/api 120\ncharge /web/static 100\nuncharge /web/api 200\ncharge /web/static 100\nshow\n",
          expected: `charge /web/api 200: ok
charge /web/static 250: ok
charge /web/api 120: OOM in /web/api
charge /web/static 100: OOM in /web
charge /web/static 100: ok
/ current=350 max=max
/web current=350 max=512
/web/api current=0 max=300
/web/static current=350 max=max`,
        },
        {
          name: { en: "mkdir errors and reaching the limit exactly", ar: "أخطاء mkdir وبلوغ الحد بالضبط" },
          stdin: "mkdir /a/b 10\nmkdir /a 10\nmkdir /a 5\n\ncharge / 1000000\ncharge /a 10\ncharge /a 1\nshow\n",
          expected: `mkdir /a/b: No such file or directory
mkdir /a: File exists
charge / 1000000: ok
charge /a 10: ok
charge /a 1: OOM in /a
/ current=1000010 max=max
/a current=10 max=10`,
        },
        {
          name: { en: "Three levels: the closest full cgroup is reported", ar: "ثلاثة مستويات: يُبلَّغ عن أقرب مجموعة ممتلئة" },
          stdin: "mkdir /k8s 1024\nmkdir /k8s/pod 256\nmkdir /k8s/pod/app max\nmkdir /k8s/other max\ncharge /k8s/other 900\ncharge /k8s/pod/app 200\ncharge /k8s/pod/app 50\nuncharge /k8s/other 900\ncharge /k8s/pod/app 100\ncharge /k8s/pod/app 107\nshow\n",
          expected: `charge /k8s/other 900: ok
charge /k8s/pod/app 200: OOM in /k8s
charge /k8s/pod/app 50: ok
charge /k8s/pod/app 100: ok
charge /k8s/pod/app 107: OOM in /k8s/pod
/ current=150 max=max
/k8s current=150 max=1024
/k8s/pod current=150 max=256
/k8s/pod/app current=150 max=max
/k8s/other current=0 max=max`,
        },
        {
          name: { en: "Only the root", ar: "الجذر وحده" },
          stdin: "show\n",
          expected: "/ current=0 max=max",
        },
      ],
      sampleInput: "mkdir /web 512\nmkdir /web/api 300\ncharge /web/api 200\nshow\n",
    },
    {
      type: "text",
      body: {
        en: `## What isolation do you really get? 🛡️

**Virtual machines**

- Each guest has its **own kernel**, so a kernel bug or a root compromise inside the guest stays inside it. The boundary is the hypervisor and the CPU's virtualization hardware, a much smaller interface than a full system-call table
- Costs: a whole OS to boot (seconds), patch and keep in memory for every VM
- This is why public clouds separate different customers with VMs

**Containers**

- Every container shares the **host kernel**. Namespaces **hide** things; they do not make the kernel any harder to attack. A kernel vulnerability reachable through a system call can become an escape for every container on the host
- Without a **user namespace**, root in the container is UID 0 on the host; rootless containers remove that risk
- Docker and Podman reduce the attack surface by default: a reduced set of **capabilities**, a **seccomp** filter that blocks rarely needed system calls, and an AppArmor or SELinux profile. The security lesson covers these tools
- Settings that throw the isolation away: \`--privileged\` (all capabilities, all host devices, no seccomp), mounting \`/var/run/docker.sock\` (control of the host's container engine, which is root-equivalent), \`--pid=host\` or \`--network=host\`, and writable mounts of host directories
- Without cgroup limits one container can starve the others of memory, CPU or PIDs. Isolation includes **resources**, not just visibility

**In between**

- **gVisor** puts an application kernel, written in Go, between the container and the host and implements most system calls itself, so far fewer reach the host kernel
- **Kata Containers** and **Firecracker** run each container or function in a lightweight **microVM** that boots in a fraction of a second; Firecracker runs AWS Lambda and Fargate workloads

And one thing that is **not** a boundary at all: \`chroot\` only changes how paths are resolved, and a root process can leave it.`,
        ar: `## أي عزل تحصل عليه فعلاً؟ 🛡️

**الأجهزة الافتراضية**

- لكل ضيف **نواته الخاصة**، فتبقى علّة في النواة أو اختراق لصلاحيات الجذر داخل الضيف حبيسة فيه. والحدّ الفاصل هو المُراقِب وعتاد المحاكاة الافتراضية في المعالج، وهي واجهة أصغر بكثير من جدول استدعاءات نظام كامل
- التكاليف: نظام تشغيل كامل يُقلَع (ثوانٍ) ويُرقَّع ويبقى في الذاكرة لكل جهاز افتراضي
- ولهذا تفصل السحابات العامة بين العملاء المختلفين بالأجهزة الافتراضية

**الحاويات**

- تتشارك كل الحاويات **نواة المضيف**. وفضاءات الأسماء **تُخفي** الأشياء؛ لكنها لا تجعل مهاجمة النواة أصعب. فثغرة في النواة يمكن بلوغها عبر استدعاء نظام قد تصبح منفذاً للإفلات (escape) لكل حاوية على المضيف
- دون **فضاء أسماء مستخدمين** يكون الجذر في الحاوية هو UID 0 على المضيف؛ والحاويات بلا صلاحيات الجذر (rootless) تزيل هذا الخطر
- يقلّص Docker وPodman سطح الهجوم افتراضياً: مجموعة مخفّضة من **الامتيازات (capabilities)**، ومرشّح **seccomp** يحجب استدعاءات النظام النادرة الحاجة، وملف تعريف AppArmor أو SELinux. ويتناول درس الأمن هذه الأدوات
- إعدادات ترمي العزل جانباً: \`--privileged\` (كل الامتيازات وكل أجهزة المضيف ودون seccomp)، وتركيب \`/var/run/docker.sock\` (سيطرة على محرّك الحاويات في المضيف، وهي تعادل الجذر)، و\`--pid=host\` أو \`--network=host\`، والتركيبات القابلة للكتابة لمجلدات المضيف
- دون حدود cgroups تستطيع حاوية واحدة أن تحرم الأخريات من الذاكرة أو المعالج أو أرقام PID. فالعزل يشمل **الموارد** لا الرؤية فقط

**بين الاثنين**

- يضع **gVisor** نواة تطبيقات مكتوبة بلغة Go بين الحاوية والمضيف وينفّذ معظم استدعاءات النظام بنفسه، فيصل عدد أقل بكثير منها إلى نواة المضيف
- ويشغّل **Kata Containers** و**Firecracker** كل حاوية أو دالة في **جهاز افتراضي مصغّر (microVM)** يُقلع في جزء من الثانية؛ وFirecracker هو ما يشغّل أحمال AWS Lambda وFargate

وشيء واحد **ليس** حداً فاصلاً إطلاقاً: \`chroot\` لا يغيّر إلا طريقة تحليل المسارات، وتستطيع عملية بصلاحيات الجذر مغادرته.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is the most important isolation difference between a VM and a container?", ar: "ما أهم فرق في العزل بين الجهاز الافتراضي والحاوية؟" },
          choices: [
            { en: "Each VM runs its own kernel, while all containers on a host share the host kernel", ar: "كل جهاز افتراضي يشغّل نواته الخاصة، بينما تتشارك كل الحاويات على المضيف نواة المضيف" },
            { en: "Containers cannot limit memory, VMs can", ar: "الحاويات لا تستطيع حدّ الذاكرة، والأجهزة الافتراضية تستطيع" },
            { en: "VMs cannot run Linux guests", ar: "الأجهزة الافتراضية لا تستطيع تشغيل ضيوف لينكس" },
            { en: "Containers always run as root on the host", ar: "الحاويات تعمل دائماً بصلاحيات الجذر على المضيف" },
          ],
          answer: 0,
          explain: {
            en: "A shared kernel is both why containers are light and why their boundary is weaker: a kernel bug affects every container. cgroups limit container memory fine, and rootless containers do not run as host root.",
            ar: "النواة المشتركة هي سبب خفّة الحاويات وسبب ضعف حدّها الفاصل في آن: فعلّة في النواة تمسّ كل حاوية. وتحدّ cgroups ذاكرة الحاويات دون مشكلة، والحاويات بلا صلاحيات الجذر لا تعمل بصلاحيات جذر المضيف.",
          },
        },
        {
          q: { en: "Which kernel feature gives a container its own PID 1 and hides the host's processes?", ar: "أي ميزة في النواة تعطي الحاوية PID 1 خاصاً بها وتُخفي عمليات المضيف؟" },
          choices: [
            { en: "A cgroup", ar: "مجموعة تحكم (cgroup)" },
            { en: "seccomp", ar: "seccomp" },
            { en: "A PID namespace", ar: "فضاء أسماء PID" },
            { en: "OverlayFS", ar: "OverlayFS" },
          ],
          answer: 2,
          explain: {
            en: "Namespaces change what a process sees; a PID namespace gives it a private PID numbering. cgroups limit usage, seccomp filters system calls and OverlayFS builds the root file system.",
            ar: "فضاءات الأسماء تغيّر ما تراه العملية؛ وفضاء أسماء PID يعطيها ترقيماً خاصاً للعمليات. أما cgroups فتحدّ الاستهلاك، وseccomp يرشّح استدعاءات النظام، وOverlayFS يبني نظام الملفات الجذري.",
          },
        },
        {
          q: {
            en: "A container's cgroup has memory.max = 512M. A process inside needs more, and the kernel cannot reclaim enough. What happens?",
            ar: "مجموعة التحكم الخاصة بحاوية فيها memory.max = 512M. تحتاج عملية في الداخل إلى المزيد، ولا تستطيع النواة استعادة ما يكفي. ماذا يحدث؟",
          },
          choices: [
            { en: "Nothing: memory.max is only a hint", ar: "لا شيء: memory.max مجرد تلميح" },
            { en: "The OOM killer kills a process inside that cgroup", ar: "يقتل قاتل نفاد الذاكرة عملية داخل تلك المجموعة" },
            { en: "The host's swap grows without limit", ar: "تكبر منطقة التبديل في المضيف بلا حد" },
            { en: "The container is paused until memory is free", ar: "تُوقَف الحاوية مؤقتاً حتى تتحرّر الذاكرة" },
          ],
          answer: 1,
          explain: {
            en: "memory.max is the hard limit: above it, after reclaim fails, the OOM killer acts inside the cgroup, so the rest of the host is protected. The softer memory.high is the knob that throttles instead of killing.",
            ar: "memory.max هو الحد الصارم: فوقه، وبعد فشل الاستعادة، يعمل قاتل نفاد الذاكرة داخل مجموعة التحكم، فيبقى بقية المضيف محمياً. أما memory.high الأكثر مرونة فهو المفتاح الذي يبطّئ بدل أن يقتل.",
          },
        },
        {
          q: {
            en: "The top layer of an image contains an empty file /etc/.wh.motd, and a lower layer has /etc/motd. What does the container see?",
            ar: "تحتوي الطبقة العليا من صورة على ملف فارغ /etc/.wh.motd، وفي طبقة أدنى يوجد /etc/motd. ماذا ترى الحاوية؟",
          },
          choices: [
            { en: "A file named .wh.motd in /etc", ar: "ملفاً اسمه .wh.motd في /etc" },
            { en: "/etc/motd from the lowest layer", ar: "/etc/motd من الطبقة السفلى" },
            { en: "An empty /etc directory", ar: "مجلد /etc فارغاً" },
            { en: "No /etc/motd at all, although its bytes still exist in the lower layer", ar: "لا وجود لـ /etc/motd إطلاقاً، مع أن بايتاته ما تزال في الطبقة الأدنى" },
          ],
          answer: 3,
          explain: {
            en: "A whiteout hides the path in all lower layers; only motd disappears, the rest of /etc is untouched. Lower layers are read-only, so the data is still in the image, which is why deleting a file in a later layer does not make an image smaller.",
            ar: "ملف المحو يُخفي المسار في كل الطبقات الأدنى؛ ولا يختفي إلا motd وتبقى بقية /etc كما هي. والطبقات الأدنى للقراءة فقط، فتبقى البيانات في الصورة، ولهذا لا يصغّر حذف ملف في طبقة لاحقة حجم الصورة.",
          },
        },
        {
          q: { en: "Why is mounting /var/run/docker.sock into a container dangerous?", ar: "لماذا يُعدّ تركيب /var/run/docker.sock داخل حاوية خطيراً؟" },
          choices: [
            { en: "Whoever can talk to the Docker daemon can create privileged containers with host directories mounted, which is equivalent to root on the host", ar: "لأن من يستطيع مخاطبة خادم Docker يستطيع إنشاء حاويات مميَّزة تُركَّب فيها مجلدات المضيف، وهذا يعادل الجذر على المضيف" },
            { en: "It slows down the container's network", ar: "لأنه يبطّئ شبكة الحاوية" },
            { en: "It copies the container's logs to the host", ar: "لأنه ينسخ سجلات الحاوية إلى المضيف" },
            { en: "It turns off the container's cgroup limits", ar: "لأنه يعطّل حدود cgroups للحاوية" },
          ],
          answer: 0,
          explain: {
            en: "The socket is the API of a daemon that runs as root on the host. Docker's own documentation warns that only trusted users should control it. Give a container that access only if it truly manages containers, and treat it as host root.",
            ar: "المقبس هو واجهة برمجية لخادم يعمل بصلاحيات الجذر على المضيف. وتحذّر وثائق Docker نفسها من أنه لا ينبغي أن يتحكم فيه إلا المستخدمون الموثوقون. لا تعطِ حاوية هذا الوصول إلا إذا كانت تدير الحاويات فعلاً، وعاملها كأنها جذر المضيف.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A **hypervisor** runs complete **VMs**, each with its own kernel; trap-and-emulate became practical on x86 with **VT-x/AMD-V**, **nested paging** and **virtio**. Type 1 runs on the hardware, type 2 on a host OS, and KVM turns Linux into a hypervisor
- A **container** is a normal process in a set of **namespaces** (mount, UTS, IPC, PID, network, user, cgroup, time). PID namespaces nest, so a process has one PID per level, and the death of a namespace's PID 1 kills the namespace
- **Images** are read-only layers merged by **OverlayFS**; writes copy up, and **whiteouts** (\`.wh.\`, \`.wh..wh..opq\`) hide lower files
- **cgroups v2** limit usage hierarchically: \`cpu.max\`, \`memory.max\` (then the OOM killer), \`pids.max\`, \`io.max\`
- VMs give a stronger boundary at a higher cost; containers share the kernel, so add **user namespaces**, dropped capabilities, seccomp and resource limits, and never \`--privileged\` or the Docker socket without need. gVisor and microVMs sit in between
- You simulated PID namespaces, merged image layers with whiteouts and enforced hierarchical memory limits

**Practice:** on a Linux machine run \`lsns\`, \`ls -l /proc/self/ns\` and \`cat /proc/self/cgroup\`, then look at \`/sys/fs/cgroup\` and a running container's \`memory.max\`. **Next:** OS security and hardening, where capabilities, seccomp and memory protections get a lesson of their own.`,
        ar: `## الخلاصة

- يشغّل **المُراقِب** **أجهزة افتراضية** كاملة لكل منها نواته؛ وصار الاعتراض والمحاكاة عملياً على x86 بفضل **VT-x/AMD-V** و**التصفيح المتداخل** و**virtio**. النوع 1 يعمل على العتاد، والنوع 2 على نظام مضيف، وKVM يحوّل لينكس إلى مُراقِب
- **الحاوية** عملية عادية في مجموعة من **فضاءات الأسماء** (mount وUTS وIPC وPID وnetwork وuser وcgroup وtime). وفضاءات أسماء PID تتداخل، فللعملية PID في كل مستوى، وموت PID 1 في فضاء يقتل الفضاء
- **الصور** طبقات للقراءة فقط يدمجها **OverlayFS**؛ والكتابات تُنسخ إلى الأعلى، و**ملفات المحو** (\`.wh.\` و\`.wh..wh..opq\`) تُخفي ملفات الطبقات الأدنى
- تحدّ **cgroups v2** الاستهلاك هرمياً: \`cpu.max\` و\`memory.max\` (ثم قاتل نفاد الذاكرة) و\`pids.max\` و\`io.max\`
- تعطي الأجهزة الافتراضية حداً فاصلاً أقوى بتكلفة أعلى؛ أما الحاويات فتتشارك النواة، فأضف **فضاءات أسماء المستخدمين** وخفّض الامتيازات وطبّق seccomp وحدود الموارد، ولا تستخدم \`--privileged\` أو مقبس Docker دون حاجة. ويقع gVisor والأجهزة الافتراضية المصغّرة بين الاثنين
- حاكيت فضاءات أسماء PID، ودمجت طبقات الصور مع ملفات المحو، وفرضت حدود ذاكرة هرمية

**تدرّب:** على جهاز لينكس نفّذ \`lsns\` و\`ls -l /proc/self/ns\` و\`cat /proc/self/cgroup\`، ثم انظر في \`/sys/fs/cgroup\` وفي \`memory.max\` لحاوية قيد التشغيل. **التالي:** أمن نظام التشغيل وتقويته، حيث تحظى الامتيازات وseccomp وحمايات الذاكرة بدرس خاص بها.`,
      },
    },
  ],
};
