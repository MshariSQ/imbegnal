import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "os-security",
  title: { en: "OS Security & Hardening — Least Privilege in Practice", ar: "أمن نظام التشغيل وتقويته — مبدأ أقل الامتيازات عملياً" },
  estMinutes: 42,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- How the kernel decides what a process may do: **kernel mode and user mode**, real and effective **UIDs**, and the principle of **least privilege**
- How Linux **capabilities** split root's power into about forty pieces, and how to read a process's capability sets
- How to sandbox a process with **seccomp**, **no_new_privs**, namespaces and systemd's sandboxing options
- What **NX**, **ASLR**, **stack canaries** and **RELRO** protect against, and what they do not
- A practical **hardening** routine: patching, minimal services, SSH, firewalls, file permissions and auditing

This lesson is about **defending systems you are responsible for**. You will write a capability decoder in C, a seccomp policy evaluator in Python and a permission audit in Bash, all working on made-up data.`,
        ar: `## ماذا ستتعلم

- كيف تقرّر النواة ما يحق للعملية فعله: **نمط النواة ونمط المستخدم (kernel mode / user mode)**، ومعرّفات **UID** الحقيقية والفعّالة، و**مبدأ أقل الامتيازات (least privilege)**
- كيف تقسّم **قدرات (capabilities)** لينكس قوة الجذر إلى نحو أربعين قطعة، وكيف تقرأ مجموعات قدرات عملية ما
- كيف تعزل عملية في **صندوق رمل (sandbox)** باستخدام **seccomp** و**no_new_privs** وفضاءات الأسماء وخيارات العزل في systemd
- مِمَّ تحمي **NX** و**ASLR** و**كناري المكدّس (stack canaries)** و**RELRO**، ومِمَّ لا تحمي
- روتين **تقوية (hardening)** عملي: التحديثات الأمنية، والحد الأدنى من الخدمات، وSSH، والجدران النارية، وصلاحيات الملفات، والتدقيق

يتناول هذا الدرس **الدفاع عن الأنظمة التي أنت مسؤول عنها**. ستكتب مفكّك قدرات بلغة C، ومقيّم سياسات seccomp بلغة Python، وتدقيقاً للصلاحيات بلغة Bash، وكلها تعمل على بيانات مختلَقة.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Rules of the road ⚖️

Security knowledge cuts both ways, so the ground rules come first:

- Practice on machines you **own** or have **written permission** to test: your laptop, a VM, a lab container. Probing or "testing" anyone else's system is a crime in most countries, even if you only look around
- Hardening a **production** system at work is a change like any other: get approval, test it and have a way back. A well-meant firewall rule can take a service down
- Everything in this lesson is defensive and uses **synthetic data**; no exercise touches a real system or network
- This is general education, **not legal advice**. If you are unsure, ask the system's owner first
- If you find a vulnerability, report it privately to the vendor or owner and give them time to fix it (**coordinated disclosure**)

## Users, privileges and least privilege 👤

The CPU runs the kernel in a privileged **kernel mode** and your programs in **user mode**, where instructions that touch hardware or page tables are forbidden. The only door between the two is the **system call**: every \`open\`, \`kill\` or \`mount\` asks the kernel, and the kernel checks the caller's **credentials** first.

Each process carries a **real UID** (who started it), an **effective UID** (whose rights it uses now) and a **saved UID**, and the same three for groups. They differ in **setuid** programs: \`/usr/bin/passwd\` is owned by root and has the setuid bit, so while you run it its effective UID is 0 and it can update \`/etc/shadow\`. That power is exactly why every setuid program is a target, and why distributions keep the list short.

The defence is the **principle of least privilege**: every program and every person gets the minimum rights needed, for the minimum time.

- Services run as dedicated **system accounts** with a \`nologin\` shell, never as root or as you
- **Privilege separation**: OpenSSH's sshd keeps a small privileged monitor and does the risky network parsing in an unprivileged child process
- \`sudo\` rules name specific commands for specific people, not \`ALL\`
- A program that starts as root to grab something (a low port, a log file) **drops privileges** right after, in the right order: supplementary groups, then the GID, then the UID, and then it checks that it cannot get root back. In the wrong order it keeps root's group:`,
        ar: `## قواعد الطريق ⚖️

المعرفة الأمنية سلاح ذو حدّين، لذا تأتي القواعد الأساسية أولاً:

- تدرّب على أجهزة **تملكها** أو لديك **إذن مكتوب** باختبارها: حاسوبك المحمول، أو جهاز افتراضي، أو حاوية مختبر. أما تحسّس نظام شخص آخر أو "اختباره" فجريمة في معظم الدول، حتى لو كنت "تتفرّج فقط"
- تقوية نظام **إنتاج** في العمل تغيير كأي تغيير آخر: احصل على الموافقة، واختبره، واحتفظ بطريق للرجوع. فقاعدة جدار ناري حسنة النية قد تُسقط خدمة
- كل ما في هذا الدرس دفاعي ويستخدم **بيانات مصطنعة**؛ ولا يلمس أي تمرين نظاماً حقيقياً أو شبكة حقيقية
- هذا تثقيف عام **وليس استشارة قانونية**. إن لم تكن متأكداً، فاسأل مالك النظام أولاً
- إن وجدت ثغرة، فأبلغ عنها الجهة المصنِّعة أو المالك سراً وامنحه وقتاً لإصلاحها (**coordinated disclosure**)

## المستخدمون والصلاحيات ومبدأ أقل الامتيازات 👤

يشغّل المعالج النواة في **نمط النواة (kernel mode)** المميَّز، ويشغّل برامجك في **نمط المستخدم (user mode)** حيث تُمنع التعليمات التي تلمس العتاد أو جداول الصفحات. والباب الوحيد بينهما هو **استدعاء النظام (system call)**: كل \`open\` أو \`kill\` أو \`mount\` طلب إلى النواة، والنواة تفحص **بيانات اعتماد (credentials)** المستدعي أولاً.

تحمل كل عملية **UID حقيقياً** (من شغّلها)، و**UID فعّالاً** (من تستخدم صلاحياته الآن)، و**UID محفوظاً**، والثلاثة نفسها للمجموعات. وتختلف هذه القيم في برامج **setuid**: فالبرنامج \`/usr/bin/passwd\` يملكه الجذر وعليه بتّ setuid، فيكون UID الفعّال له 0 ما دمت تشغّله، ويستطيع تحديث \`/etc/shadow\`. وهذه القوة بالضبط هي سبب كون كل برنامج setuid هدفاً، وسبب إبقاء التوزيعات قائمتها قصيرة.

والدفاع هو **مبدأ أقل الامتيازات (principle of least privilege)**: يحصل كل برنامج وكل شخص على أدنى الصلاحيات اللازمة، لأقصر وقت.

- تعمل الخدمات بـ**حسابات نظام** مخصّصة صدفتها \`nologin\`، ولا تعمل أبداً بالجذر أو بحسابك
- **فصل الصلاحيات (privilege separation)**: تُبقي sshd في OpenSSH مراقِباً صغيراً مميَّزاً، وتجري التحليل الشبكي الخطِر في عملية ابنة غير مميَّزة
- قواعد \`sudo\` تسمّي أوامر محددة لأشخاص محددين، لا \`ALL\`
- البرنامج الذي يبدأ بالجذر ليحجز شيئاً (منفذاً منخفضاً أو ملف سجلّ) **يتخلى عن صلاحياته (drops privileges)** فوراً بعد ذلك، وبالترتيب الصحيح: المجموعات الإضافية، ثم GID، ثم UID، ثم يتحقق من أنه لا يستطيع استعادة الجذر. وبالترتيب الخاطئ يحتفظ بمجموعة الجذر:`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `# A tiny model of the kernel's rules for setuid() and setgid() (see setuid(2), setgid(2)).
class Process:
    def __init__(self):
        self.uid = self.euid = self.suid = 0      # real, effective and saved user IDs: root
        self.gid = self.egid = self.sgid = 0
        self.groups = [0]

    def privileged(self):
        return self.euid == 0                     # simplification: euid 0 = every capability

    def setuid(self, uid):
        if self.privileged():
            self.uid = self.euid = self.suid = uid    # root changes all three: no way back
        elif uid in (self.uid, self.suid):
            self.euid = uid
        else:
            return "EPERM"
        return "ok"

    def setgid(self, gid):
        if self.privileged():
            self.gid = self.egid = self.sgid = gid
        elif gid in (self.gid, self.sgid):
            self.egid = gid
        else:
            return "EPERM"
        return "ok"

    def setgroups(self, groups):
        if not self.privileged():
            return "EPERM"
        self.groups = groups
        return "ok"

    def __str__(self):
        return f"uid={self.euid} gid={self.egid} groups={self.groups}"

wrong = Process()
print("wrong order: setuid(1000) ->", wrong.setuid(1000), "| setgid(1000) ->", wrong.setgid(1000))
print("  result:", wrong, " <- still in group 0 (root)!")

right = Process()
print("right order: setgroups([]) ->", right.setgroups([]), "| setgid(1000) ->", right.setgid(1000),
      "| setuid(1000) ->", right.setuid(1000))
print("  result:", right)
print("  try to get root back: setuid(0) ->", right.setuid(0))
`,
      explanation: {
        en: "Once root calls setuid(1000), the process has no privileges left, so it may no longer change its group: the later setgid fails and the process quietly stays in group root. Always drop groups and GID first, then the UID, and check the return values.",
        ar: "بمجرد أن يستدعي الجذر setuid(1000) لا يبقى للعملية أي امتياز، فلا يعود يحق لها تغيير مجموعتها: يفشل setgid اللاحق وتبقى العملية بصمت في مجموعة الجذر. تخلَّ دائماً عن المجموعات وGID أولاً، ثم UID، وافحص القيم المعادة.",
      },
    },
    {
      type: "text",
      body: {
        en: `## Capabilities: root in pieces 🧩

Since Linux 2.2 the kernel splits root's power into **capabilities** (\`capabilities(7)\`); recent kernels define 41 of them, numbered 0 to 40. A few examples:

- \`CAP_NET_BIND_SERVICE\` (10): bind to ports below 1024
- \`CAP_CHOWN\` (0): change any file's owner
- \`CAP_DAC_OVERRIDE\` (1): bypass file read, write and execute permission checks
- \`CAP_SYS_PTRACE\` (19): trace other processes and read their memory
- \`CAP_SYS_ADMIN\` (21): a huge grab bag (mounting, many device controls and more); the manual page itself calls it "the new root"

Each process has several capability **sets**: **permitted** (what it may use), **effective** (what is switched on right now), **inheritable**, **bounding** (an upper limit for it and its children) and **ambient** (kept across \`execve\` of unprivileged programs). The kernel shows them as 64-bit hex masks in \`/proc/<pid>/status\`, where bit *n* set means capability *n*:

\`\`\`
$ grep Cap /proc/self/status       # as root inside a container with Docker's defaults
CapInh: 0000000000000000
CapPrm: 00000000a80425fb
CapEff: 00000000a80425fb
CapBnd: 00000000a80425fb
CapAmb: 0000000000000000
\`\`\`

\`capsh --decode=00000000a80425fb\` turns a mask into names. Least privilege with capabilities means giving a program **only** the one it needs: \`setcap cap_net_bind_service=+ep ./server\` lets a web server bind port 443 without running as root, and \`docker run --cap-drop ALL --cap-add NET_BIND_SERVICE\` does the same for a container. The Code Lab runner that executes your lab code drops **all** capabilities and sets \`no-new-privileges\`.

Some capabilities are, in practice, as good as root, because each one opens a path to full control of the machine: \`CAP_SYS_ADMIN\`, \`CAP_SYS_MODULE\` (load code into the kernel), \`CAP_SYS_RAWIO\` (raw access to devices and I/O ports), \`CAP_SYS_PTRACE\` and \`CAP_DAC_READ_SEARCH\` (read any file). Seeing one of them on a service is worth a question.`,
        ar: `## القدرات: الجذر قطعاً 🧩

منذ لينكس 2.2 تقسّم النواة قوة الجذر إلى **قدرات (capabilities)** (\`capabilities(7)\`)؛ وتعرّف النوى الحديثة 41 قدرة مرقّمة من 0 إلى 40. بعض الأمثلة:

- \`CAP_NET_BIND_SERVICE\` (10): الربط بالمنافذ الأقل من 1024
- \`CAP_CHOWN\` (0): تغيير مالك أي ملف
- \`CAP_DAC_OVERRIDE\` (1): تجاوز فحوص صلاحيات القراءة والكتابة والتنفيذ على الملفات
- \`CAP_SYS_PTRACE\` (19): تتبّع العمليات الأخرى وقراءة ذاكرتها
- \`CAP_SYS_ADMIN\` (21): حقيبة ضخمة من الصلاحيات (التركيب، والتحكم في كثير من الأجهزة وغير ذلك)؛ وصفحة الدليل نفسها تسمّيه "الجذر الجديد"

لكل عملية عدة **مجموعات** من القدرات: **المسموحة (permitted)** (ما يحق لها استخدامه)، و**الفعّالة (effective)** (ما هو مفعّل الآن)، و**القابلة للتوريث (inheritable)**، و**المحدِّدة (bounding)** (سقف لها ولأبنائها)، و**المحيطة (ambient)** (تُحفظ عبر \`execve\` للبرامج غير المميَّزة). وتعرضها النواة أقنعةً سداسية عشرية من 64 بتّاً في \`/proc/<pid>/status\`، حيث يعني ضبط البتّ *n* وجود القدرة *n*:

\`\`\`
$ grep Cap /proc/self/status       # as root inside a container with Docker's defaults
CapInh: 0000000000000000
CapPrm: 00000000a80425fb
CapEff: 00000000a80425fb
CapBnd: 00000000a80425fb
CapAmb: 0000000000000000
\`\`\`

يحوّل \`capsh --decode=00000000a80425fb\` القناع إلى أسماء. وتطبيق مبدأ أقل الامتيازات على القدرات يعني أن تعطي البرنامج **فقط** ما يحتاجه: يتيح \`setcap cap_net_bind_service=+ep ./server\` لخادم ويب أن يربط المنفذ 443 دون أن يعمل بالجذر، ويفعل \`docker run --cap-drop ALL --cap-add NET_BIND_SERVICE\` الشيء نفسه لحاوية. ومشغّل Code Lab الذي ينفّذ كود مختبراتك يُسقط **كل** القدرات ويضبط \`no-new-privileges\`.

بعض القدرات تعادل الجذر عملياً، لأن كلاً منها يفتح طريقاً إلى السيطرة الكاملة على الجهاز: \`CAP_SYS_ADMIN\`، و\`CAP_SYS_MODULE\` (تحميل كود إلى النواة)، و\`CAP_SYS_RAWIO\` (الوصول الخام إلى الأجهزة ومنافذ الإدخال/الإخراج)، و\`CAP_SYS_PTRACE\`، و\`CAP_DAC_READ_SEARCH\` (قراءة أي ملف). ورؤية واحد منها على خدمة أمر يستحق السؤال.`,
      },
    },
    {
      type: "lab",
      id: "capeff-decoder",
      lang: "c",
      prompt: {
        en: `Decode **capability masks** the way \`capsh --decode\` does, and flag the dangerous capabilities.

**Input:** zero or more lines \`<label> <hex mask>\`, like the \`Cap*\` lines of \`/proc/<pid>/status\` (for example \`CapEff:\`, a tab and 16 hex digits). Only bits 0 to 40 can be set; hex digits may be lower or upper case.

**Output:** two lines per input line, with a trailing \`:\` removed from the label:
- \`<label> (<count>): <names>\`: the names of the set bits in bit order, separated by commas, or \`<label> (0): none\`
- \`<label> dangerous: <names>\`: the set bits that are among the dangerous five, in bit order, separated by commas, or \`none\`

The starter contains the 41 names in bit order (\`NAMES[n]\` is capability \`n\`) and the dangerous five: \`cap_dac_read_search\` (2), \`cap_sys_module\` (16), \`cap_sys_rawio\` (17), \`cap_sys_ptrace\` (19) and \`cap_sys_admin\` (21).

**Example:** the line \`CapEff: 00000000a80425fb\` prints

\`\`\`
CapEff (14): cap_chown,cap_dac_override,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_net_bind_service,cap_net_raw,cap_sys_chroot,cap_mknod,cap_audit_write,cap_setfcap
CapEff dangerous: none
\`\`\``,
        ar: `فكّك **أقنعة القدرات** كما يفعل \`capsh --decode\`، وأشِر إلى القدرات الخطرة.

**المدخل:** صفر أو أكثر من الأسطر \`<label> <hex mask>\`، مثل أسطر \`Cap*\` في \`/proc/<pid>/status\` (مثلاً \`CapEff:\` ثم مسافة جدولة (tab) ثم 16 رقماً سداسياً عشرياً). لا يمكن أن تُضبط إلا البتّات من 0 إلى 40؛ وقد تكون الأرقام السداسية العشرية بأحرف صغيرة أو كبيرة.

**المخرج:** سطران لكل سطر مدخل، مع حذف \`:\` من نهاية التسمية:
- \`<label> (<count>): <names>\`: أسماء البتّات المضبوطة بترتيب البتّات، مفصولة بفواصل، أو \`<label> (0): none\`
- \`<label> dangerous: <names>\`: البتّات المضبوطة التي تنتمي إلى الخمسة الخطرة، بترتيب البتّات، مفصولة بفواصل، أو \`none\`

يحتوي كود البداية على الأسماء الـ 41 بترتيب البتّات (\`NAMES[n]\` هو القدرة \`n\`) وعلى الخمسة الخطرة: \`cap_dac_read_search\` (2) و\`cap_sys_module\` (16) و\`cap_sys_rawio\` (17) و\`cap_sys_ptrace\` (19) و\`cap_sys_admin\` (21).

**مثال:** السطر \`CapEff: 00000000a80425fb\` يطبع

\`\`\`
CapEff (14): cap_chown,cap_dac_override,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_net_bind_service,cap_net_raw,cap_sys_chroot,cap_mknod,cap_audit_write,cap_setfcap
CapEff dangerous: none
\`\`\``,
      },
      starterCode: String.raw`#include <stdio.h>
#include <string.h>

/* Bit numbers from <linux/capability.h>: NAMES[n] is capability number n. */
const char *const NAMES[] = {
    "cap_chown", "cap_dac_override", "cap_dac_read_search", "cap_fowner",
    "cap_fsetid", "cap_kill", "cap_setgid", "cap_setuid",
    "cap_setpcap", "cap_linux_immutable", "cap_net_bind_service", "cap_net_broadcast",
    "cap_net_admin", "cap_net_raw", "cap_ipc_lock", "cap_ipc_owner",
    "cap_sys_module", "cap_sys_rawio", "cap_sys_chroot", "cap_sys_ptrace",
    "cap_sys_pacct", "cap_sys_admin", "cap_sys_boot", "cap_sys_nice",
    "cap_sys_resource", "cap_sys_time", "cap_sys_tty_config", "cap_mknod",
    "cap_lease", "cap_audit_write", "cap_audit_control", "cap_setfcap",
    "cap_mac_override", "cap_mac_admin", "cap_syslog", "cap_wake_alarm",
    "cap_block_suspend", "cap_audit_read", "cap_perfmon", "cap_bpf",
    "cap_checkpoint_restore",
};
#define NCAPS ((int)(sizeof NAMES / sizeof NAMES[0]))

/* The dangerous five: dac_read_search, sys_module, sys_rawio, sys_ptrace, sys_admin. */
const int DANGEROUS[] = {2, 16, 17, 19, 21};
#define NDANGEROUS ((int)(sizeof DANGEROUS / sizeof DANGEROUS[0]))

int main(void) {
    char label[64];
    unsigned long long mask;
    while (scanf("%63s %llx", label, &mask) == 2) {
        size_t len = strlen(label);
        if (len > 0 && label[len - 1] == ':') label[len - 1] = '\0';

        // TODO 1: count the bits of mask that are set (test mask & (1ULL << bit) for bit < NCAPS)
        // TODO 2: print "<label> (<count>): " and the names joined by commas, or "none"
        // TODO 3: print "<label> dangerous: " and the set bits listed in DANGEROUS, or "none"
        printf("%s (0): none\n", label);
        printf("%s dangerous: none\n", label);
    }
    return 0;
}
`,
      solution: String.raw`#include <stdio.h>
#include <string.h>

/* Bit numbers from <linux/capability.h>: NAMES[n] is capability number n. */
const char *const NAMES[] = {
    "cap_chown", "cap_dac_override", "cap_dac_read_search", "cap_fowner",
    "cap_fsetid", "cap_kill", "cap_setgid", "cap_setuid",
    "cap_setpcap", "cap_linux_immutable", "cap_net_bind_service", "cap_net_broadcast",
    "cap_net_admin", "cap_net_raw", "cap_ipc_lock", "cap_ipc_owner",
    "cap_sys_module", "cap_sys_rawio", "cap_sys_chroot", "cap_sys_ptrace",
    "cap_sys_pacct", "cap_sys_admin", "cap_sys_boot", "cap_sys_nice",
    "cap_sys_resource", "cap_sys_time", "cap_sys_tty_config", "cap_mknod",
    "cap_lease", "cap_audit_write", "cap_audit_control", "cap_setfcap",
    "cap_mac_override", "cap_mac_admin", "cap_syslog", "cap_wake_alarm",
    "cap_block_suspend", "cap_audit_read", "cap_perfmon", "cap_bpf",
    "cap_checkpoint_restore",
};
#define NCAPS ((int)(sizeof NAMES / sizeof NAMES[0]))

/* The dangerous five: dac_read_search, sys_module, sys_rawio, sys_ptrace, sys_admin. */
const int DANGEROUS[] = {2, 16, 17, 19, 21};
#define NDANGEROUS ((int)(sizeof DANGEROUS / sizeof DANGEROUS[0]))

int main(void) {
    char label[64];
    unsigned long long mask;
    while (scanf("%63s %llx", label, &mask) == 2) {
        size_t len = strlen(label);
        if (len > 0 && label[len - 1] == ':') label[len - 1] = '\0';

        int count = 0;
        for (int bit = 0; bit < NCAPS; bit++) {
            if (mask & (1ULL << bit)) count++;
        }
        printf("%s (%d):", label, count);
        const char *sep = " ";
        for (int bit = 0; bit < NCAPS; bit++) {
            if (mask & (1ULL << bit)) {
                printf("%s%s", sep, NAMES[bit]);
                sep = ",";     /* a space before the first name, commas after */
            }
        }
        if (count == 0) printf(" none");

        printf("\n%s dangerous:", label);
        int found = 0;
        for (int i = 0; i < NDANGEROUS; i++) {
            if (mask & (1ULL << DANGEROUS[i])) {
                printf("%s%s", found ? "," : " ", NAMES[DANGEROUS[i]]);
                found = 1;
            }
        }
        if (!found) printf(" none");
        printf("\n");
    }
    return 0;
}
`,
      hints: [
        {
          en: "Bit n is set when (mask & (1ULL << n)) != 0. Use 1ULL, not 1: shifting a plain int by 32 or more is undefined, and the masks are 64 bits wide.",
          ar: "يكون البتّ n مضبوطاً حين (mask & (1ULL << n)) != 0. استخدم 1ULL لا 1: فإزاحة int عادي بمقدار 32 أو أكثر سلوك غير معرَّف، والأقنعة بعرض 64 بتّاً.",
        },
        {
          en: "For the comma-separated list keep a separator string: print \" \" before the first name and \",\" before every later one. If nothing was printed, print \" none\" instead.",
          ar: "للقائمة المفصولة بفواصل احتفظ بنص فاصل: اطبع \" \" قبل الاسم الأول و\",\" قبل كل اسم بعده. وإن لم يُطبع شيء فاطبع \" none\" بدلاً من ذلك.",
        },
        {
          en: "For the dangerous line loop over DANGEROUS (already in bit order) and test each bit; NAMES[DANGEROUS[i]] gives the name. scanf's %llx accepts both a1b2 and A1B2.",
          ar: "في سطر الخطرة مرّ على DANGEROUS (المرتّبة أصلاً حسب البتّات) واختبر كل بتّ؛ ويعطيك NAMES[DANGEROUS[i]] الاسم. ويقبل %llx في scanf كلاً من a1b2 وA1B2.",
        },
      ],
      tests: [
        {
          name: { en: "Example: a container with Docker's default set", ar: "المثال: حاوية بمجموعة Docker الافتراضية" },
          stdin: "CapEff:\t00000000a80425fb\n",
          expected: `CapEff (14): cap_chown,cap_dac_override,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_net_bind_service,cap_net_raw,cap_sys_chroot,cap_mknod,cap_audit_write,cap_setfcap
CapEff dangerous: none`,
        },
        {
          name: { en: "Full root on a recent kernel", ar: "جذر كامل على نواة حديثة" },
          stdin: "CapBnd:\t000001ffffffffff\n",
          expected: `CapBnd (41): cap_chown,cap_dac_override,cap_dac_read_search,cap_fowner,cap_fsetid,cap_kill,cap_setgid,cap_setuid,cap_setpcap,cap_linux_immutable,cap_net_bind_service,cap_net_broadcast,cap_net_admin,cap_net_raw,cap_ipc_lock,cap_ipc_owner,cap_sys_module,cap_sys_rawio,cap_sys_chroot,cap_sys_ptrace,cap_sys_pacct,cap_sys_admin,cap_sys_boot,cap_sys_nice,cap_sys_resource,cap_sys_time,cap_sys_tty_config,cap_mknod,cap_lease,cap_audit_write,cap_audit_control,cap_setfcap,cap_mac_override,cap_mac_admin,cap_syslog,cap_wake_alarm,cap_block_suspend,cap_audit_read,cap_perfmon,cap_bpf,cap_checkpoint_restore
CapBnd dangerous: cap_dac_read_search,cap_sys_module,cap_sys_rawio,cap_sys_ptrace,cap_sys_admin`,
        },
        {
          name: { en: "A container given ptrace and admin rights", ar: "حاوية مُنحت قدرتَي ptrace وadmin" },
          stdin: "CapEff:\t0000000000280000\n",
          expected: "CapEff (2): cap_sys_ptrace,cap_sys_admin\nCapEff dangerous: cap_sys_ptrace,cap_sys_admin",
        },
        {
          name: { en: "An empty set and an ambient capability", ar: "مجموعة فارغة وقدرة محيطة" },
          stdin: "CapInh:\t0000000000000000\nCapAmb:\t0000000000000400\n",
          expected: "CapInh (0): none\nCapInh dangerous: none\nCapAmb (1): cap_net_bind_service\nCapAmb dangerous: none",
        },
        {
          name: { en: "Upper-case hex and the highest bit", ar: "أرقام سداسية عشرية كبيرة وأعلى بتّ" },
          stdin: "X 0000010000000001\nY 00000000000301C4\n",
          expected: `X (2): cap_chown,cap_checkpoint_restore
X dangerous: none
Y (6): cap_dac_read_search,cap_setgid,cap_setuid,cap_setpcap,cap_sys_module,cap_sys_rawio
Y dangerous: cap_dac_read_search,cap_sys_module,cap_sys_rawio`,
        },
      ],
      sampleInput: "CapPrm:\t00000000a80425fb\nCapBnd:\t000001ffffffffff\n",
    },
    {
      type: "text",
      body: {
        en: `## Sandboxing: seccomp, no_new_privs and friends 🏖️

Even an unprivileged process can call hundreds of different system calls, and each one is kernel code that a compromised program can poke at. **seccomp** shrinks that attack surface:

- **Strict mode** (the original, 2005): after entering it a process may only call \`read\`, \`write\`, \`_exit\` and \`sigreturn\`
- **Filter mode** (seccomp-bpf, Linux 3.5): the process installs a small BPF program that looks at each system call's number and arguments and returns an action: \`SECCOMP_RET_ALLOW\`, \`SECCOMP_RET_LOG\` (allow, but log it), \`SECCOMP_RET_ERRNO\` (fail with an error such as \`EPERM\`), \`SECCOMP_RET_KILL_PROCESS\` and a few more
- Filters **stack**: every installed filter runs, and the action with the **highest precedence** wins (KILL beats ERRNO, which beats LOG, which beats ALLOW). A filter can never be removed, and it is inherited across \`fork\` and kept across \`execve\`
- To install a filter without \`CAP_SYS_ADMIN\`, a process must first set **no_new_privs** (\`prctl(PR_SET_NO_NEW_PRIVS)\`). It guarantees that \`execve\` can never grant more privileges: setuid bits and file capabilities are ignored from then on

Docker, Podman, Chrome, Firefox, OpenSSH and systemd all use seccomp filters. systemd turns the whole toolbox into a few lines of a unit file (\`systemd.exec(5)\`), and \`systemd-analyze security <unit>\` rates how exposed a service is:

\`\`\`
[Service]
User=web
NoNewPrivileges=yes
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_BIND_SERVICE
SystemCallFilter=@system-service
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
\`\`\`

The namespaces from the previous lesson are sandboxing tools too (a private mount table, no network), and **mandatory access control** systems (**SELinux**, **AppArmor**) add rules that even root processes must obey.`,
        ar: `## صندوق الرمل: seccomp وno_new_privs ورفاقهما 🏖️

حتى العملية غير المميَّزة تستطيع أن تستدعي مئات من استدعاءات النظام المختلفة، وكل منها كود في النواة يستطيع برنامج مخترَق أن يعبث به. ويقلّص **seccomp** سطح الهجوم هذا:

- **الوضع الصارم (strict mode)** (الأصلي، 2005): بعد الدخول فيه لا يحق للعملية إلا استدعاء \`read\` و\`write\` و\`_exit\` و\`sigreturn\`
- **وضع المرشّح (filter mode)** (seccomp-bpf، منذ لينكس 3.5): تثبّت العملية برنامج BPF صغيراً ينظر في رقم كل استدعاء نظام ومعاملاته ويعيد إجراءً: \`SECCOMP_RET_ALLOW\`، و\`SECCOMP_RET_LOG\` (اسمح مع التسجيل)، و\`SECCOMP_RET_ERRNO\` (افشل بخطأ مثل \`EPERM\`)، و\`SECCOMP_RET_KILL_PROCESS\`، وغيرها قليل
- المرشّحات **تتكدّس**: يعمل كل مرشّح مثبَّت، ويفوز الإجراء ذو **الأسبقية الأعلى** (KILL يغلب ERRNO، الذي يغلب LOG، الذي يغلب ALLOW). ولا يمكن إزالة المرشّح أبداً، ويُورَّث عبر \`fork\` ويبقى عبر \`execve\`
- لتثبيت مرشّح دون \`CAP_SYS_ADMIN\` يجب على العملية أن تضبط أولاً **no_new_privs** (\`prctl(PR_SET_NO_NEW_PRIVS)\`). وهو يضمن ألا تمنح \`execve\` أي صلاحيات إضافية أبداً: فتُتجاهل بتّات setuid وقدرات الملفات من تلك اللحظة

يستخدم Docker وPodman وChrome وFirefox وOpenSSH وsystemd كلها مرشّحات seccomp. ويحوّل systemd صندوق الأدوات كله إلى بضعة أسطر في ملف وحدة (\`systemd.exec(5)\`)، ويقيّم \`systemd-analyze security <unit>\` مدى انكشاف الخدمة:

\`\`\`
[Service]
User=web
NoNewPrivileges=yes
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_BIND_SERVICE
SystemCallFilter=@system-service
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
\`\`\`

وفضاءات الأسماء من الدرس السابق أدوات عزل أيضاً (جدول تركيب خاص، ودون شبكة)، وأنظمة **التحكم الإلزامي في الوصول (mandatory access control)** (**SELinux** و**AppArmor**) تضيف قواعد يجب أن تلتزم بها حتى عمليات الجذر.`,
      },
    },
    {
      type: "lab",
      id: "seccomp-stack",
      lang: "python",
      prompt: {
        en: `Evaluate **stacked seccomp filters** for a trace of system calls.

**Input:**
- Zero or more filters. Each one starts with a line \`filter\`, followed by \`default <ACTION>\` and any number of rules \`<syscall> <ACTION>\`
- Then a line \`trace\` followed by the system calls the process makes, separated by spaces or newlines

ACTION is one of \`ALLOW\`, \`LOG\`, \`ERRNO\` and \`KILL\` (short for \`SECCOMP_RET_ALLOW\`, \`_LOG\`, \`_ERRNO\` and \`_KILL_PROCESS\`). Blank lines are ignored.

**Rules:**
- Each filter answers with the action of its rule for that system call, or with its default
- Like the kernel, use the answer with the **highest precedence**: \`KILL\` > \`ERRNO\` > \`LOG\` > \`ALLOW\`. With no filters at all everything is allowed
- After a \`KILL\` the process is dead: print \`process killed\` and ignore the rest of the trace

**Output:** \`<syscall> -> <ACTION>\` for every system call that runs, then \`summary: ALLOW=<n> LOG=<n> ERRNO=<n> KILL=<n>\`.

**Example:**

\`\`\`
filter
default ALLOW
ptrace ERRNO
reboot KILL
filter
default ERRNO
read ALLOW
write ALLOW
ptrace ALLOW
trace
read write openat
ptrace
reboot
write
\`\`\`

prints

\`\`\`
read -> ALLOW
write -> ALLOW
openat -> ERRNO
ptrace -> ERRNO
reboot -> KILL
process killed
summary: ALLOW=2 LOG=0 ERRNO=2 KILL=1
\`\`\``,
        ar: `قيّم **مرشّحات seccomp المتكدّسة** على سلسلة من استدعاءات النظام.

**المدخل:**
- صفر أو أكثر من المرشّحات. يبدأ كل منها بسطر \`filter\`، يليه \`default <ACTION>\` وأي عدد من القواعد \`<syscall> <ACTION>\`
- ثم سطر \`trace\` تليه استدعاءات النظام التي تجريها العملية، مفصولة بمسافات أو بأسطر جديدة

قيمة ACTION إحدى \`ALLOW\` و\`LOG\` و\`ERRNO\` و\`KILL\` (اختصاراً لـ \`SECCOMP_RET_ALLOW\` و\`_LOG\` و\`_ERRNO\` و\`_KILL_PROCESS\`). وتُتجاهل الأسطر الفارغة.

**القواعد:**
- يجيب كل مرشّح بإجراء قاعدته لذلك الاستدعاء، أو بإجرائه الافتراضي
- وكما تفعل النواة، استخدم الجواب ذا **الأسبقية الأعلى**: \`KILL\` > \`ERRNO\` > \`LOG\` > \`ALLOW\`. ودون أي مرشّح يُسمح بكل شيء
- بعد \`KILL\` تموت العملية: اطبع \`process killed\` وتجاهل بقية السلسلة

**المخرج:** \`<syscall> -> <ACTION>\` لكل استدعاء نظام يُنفَّذ، ثم \`summary: ALLOW=<n> LOG=<n> ERRNO=<n> KILL=<n>\`.

**مثال:**

\`\`\`
filter
default ALLOW
ptrace ERRNO
reboot KILL
filter
default ERRNO
read ALLOW
write ALLOW
ptrace ALLOW
trace
read write openat
ptrace
reboot
write
\`\`\`

يطبع

\`\`\`
read -> ALLOW
write -> ALLOW
openat -> ERRNO
ptrace -> ERRNO
reboot -> KILL
process killed
summary: ALLOW=2 LOG=0 ERRNO=2 KILL=1
\`\`\``,
      },
      starterCode: `import sys

# Highest precedence first (the order seccomp(2) uses for these actions).
PRECEDENCE = ["KILL", "ERRNO", "LOG", "ALLOW"]

filters = []                # each filter: {"default": action, "rules": {syscall: action}}
trace = []
section = None
for line in sys.stdin.read().splitlines():
    words = line.split()
    if not words:
        continue
    if words[0] == "filter":
        filters.append({"default": "ALLOW", "rules": {}})
        section = "filter"
    elif words[0] == "trace":
        section = "trace"
    elif section == "trace":
        trace.extend(words)
    elif words[0] == "default":
        filters[-1]["default"] = words[1]
    else:
        filters[-1]["rules"][words[0]] = words[1]

def decide(syscall):
    # TODO 1: ask every filter (its rule for syscall, or its default) and return the
    #         answer that comes first in PRECEDENCE; with no filters return "ALLOW"
    return "ALLOW"

counts = {action: 0 for action in PRECEDENCE}
for syscall in trace:
    action = decide(syscall)
    counts[action] += 1
    print(f"{syscall} -> {action}")
    # TODO 2: after a KILL print "process killed" and stop
print("summary: " + " ".join(f"{a}={counts[a]}" for a in ["ALLOW", "LOG", "ERRNO", "KILL"]))
`,
      solution: `import sys

# Highest precedence first (the order seccomp(2) uses for these actions).
PRECEDENCE = ["KILL", "ERRNO", "LOG", "ALLOW"]

filters = []                # each filter: {"default": action, "rules": {syscall: action}}
trace = []
section = None
for line in sys.stdin.read().splitlines():
    words = line.split()
    if not words:
        continue
    if words[0] == "filter":
        filters.append({"default": "ALLOW", "rules": {}})
        section = "filter"
    elif words[0] == "trace":
        section = "trace"
    elif section == "trace":
        trace.extend(words)
    elif words[0] == "default":
        filters[-1]["default"] = words[1]
    else:
        filters[-1]["rules"][words[0]] = words[1]

def decide(syscall):
    """Every filter votes; the vote with the highest precedence wins."""
    votes = [f["rules"].get(syscall, f["default"]) for f in filters]
    return min(votes, key=PRECEDENCE.index) if votes else "ALLOW"

counts = {action: 0 for action in PRECEDENCE}
for syscall in trace:
    action = decide(syscall)
    counts[action] += 1
    print(f"{syscall} -> {action}")
    if action == "KILL":
        print("process killed")
        break               # nothing after a KILL ever runs
print("summary: " + " ".join(f"{a}={counts[a]}" for a in ["ALLOW", "LOG", "ERRNO", "KILL"]))
`,
      hints: [
        {
          en: "Each filter's answer is f[\"rules\"].get(syscall, f[\"default\"]). Collect one answer per filter in a list.",
          ar: "جواب كل مرشّح هو f[\"rules\"].get(syscall, f[\"default\"]). اجمع جواباً واحداً لكل مرشّح في قائمة.",
        },
        {
          en: "The winner is the answer with the smallest index in PRECEDENCE: min(votes, key=PRECEDENCE.index). An empty list means no filter is installed, so the call is allowed.",
          ar: "الفائز هو الجواب ذو أصغر فهرس في PRECEDENCE: min(votes, key=PRECEDENCE.index). والقائمة الفارغة تعني أنه لا مرشّح مثبَّت، فيُسمح بالاستدعاء.",
        },
        {
          en: "KILL is counted and printed like the others, then print process killed and break out of the loop, so later calls are neither printed nor counted.",
          ar: "يُعدّ KILL ويُطبع كغيره، ثم اطبع process killed واخرج من الحلقة بـ break، فلا تُطبع الاستدعاءات اللاحقة ولا تُعدّ.",
        },
      ],
      tests: [
        {
          name: { en: "Example from the prompt", ar: "المثال من نص المسألة" },
          stdin: "filter\ndefault ALLOW\nptrace ERRNO\nreboot KILL\nfilter\ndefault ERRNO\nread ALLOW\nwrite ALLOW\nptrace ALLOW\ntrace\nread write openat\nptrace\nreboot\nwrite\n",
          expected: `read -> ALLOW
write -> ALLOW
openat -> ERRNO
ptrace -> ERRNO
reboot -> KILL
process killed
summary: ALLOW=2 LOG=0 ERRNO=2 KILL=1`,
        },
        {
          name: { en: "No filter installed", ar: "لا مرشّح مثبَّت" },
          stdin: "trace\nread write mount\n",
          expected: "read -> ALLOW\nwrite -> ALLOW\nmount -> ALLOW\nsummary: ALLOW=3 LOG=0 ERRNO=0 KILL=0",
        },
        {
          name: { en: "LOG beats ALLOW, ERRNO beats LOG", ar: "LOG يغلب ALLOW وERRNO يغلب LOG" },
          stdin: "filter\ndefault LOG\nread ALLOW\n\nfilter\ndefault ALLOW\nopenat LOG\nunshare ERRNO\ntrace\nread\nopenat\nunshare\nexecve\n",
          expected: `read -> ALLOW
openat -> LOG
unshare -> ERRNO
execve -> LOG
summary: ALLOW=1 LOG=2 ERRNO=1 KILL=0`,
        },
        {
          name: { en: "An allow-list filter kills on the first forbidden call", ar: "مرشّح قائمة سماح يقتل عند أول استدعاء ممنوع" },
          stdin: "filter\ndefault KILL\nread ALLOW\nwrite ALLOW\nexit_group ALLOW\ntrace\nread write\nwrite\nsocket\nexit_group\n",
          expected: `read -> ALLOW
write -> ALLOW
write -> ALLOW
socket -> KILL
process killed
summary: ALLOW=3 LOG=0 ERRNO=0 KILL=1`,
        },
        {
          name: { en: "A filter but an empty trace", ar: "مرشّح مع سلسلة فارغة" },
          stdin: "filter\ndefault ERRNO\ntrace\n",
          expected: "summary: ALLOW=0 LOG=0 ERRNO=0 KILL=0",
        },
      ],
      sampleInput: "filter\ndefault ALLOW\nptrace ERRNO\ntrace\nread ptrace write\n",
    },
    {
      type: "text",
      body: {
        en: `## Memory protections 🧱

C and C++ code can contain **memory-safety bugs**: a buffer overflow writes past the end of an array, a use-after-free reuses memory that was already released. If input controls what gets overwritten, such a bug can become code execution. The OS and the toolchain add layers that make that much harder:

- **NX / W^X**: a page is writable or executable, never both. Page-table entries have a no-execute bit (the PTE flags from the memory lesson), so the stack and the heap hold data only; the linker marks a non-executable stack with the \`PT_GNU_STACK\` header
- **ASLR** (address space layout randomization): the stack, the heap, shared libraries, \`mmap\` regions and, for **PIE** (position-independent executables), the program itself start at random addresses on every run, so an attacker cannot rely on fixed addresses. \`/proc/sys/kernel/randomize_va_space\` is 2 (full randomization) on mainstream distributions
- **Stack canaries** (\`-fstack-protector-strong\`): the compiler puts a random value next to the return address and checks it before the function returns; glibc aborts with \`*** stack smashing detected ***\` if it changed
- **RELRO** (\`-Wl,-z,relro,-z,now\`): the dynamic linker's tables (the GOT) become read-only after start-up
- **\`_FORTIFY_SOURCE\`**: adds size checks to calls such as \`memcpy\` and \`strcpy\` when the compiler knows the buffer size
- Newer CPUs add **shadow stacks** and indirect-branch tracking (Intel CET) or pointer authentication (ARM PAC)

None of these fixes the bug; they raise the cost of exploiting it, and attackers chain bugs together (an information leak can defeat ASLR, for example). The real fix is still correct code: bounds checks, fuzzing, sanitizers and memory-safe languages. See what ASLR changes from run to run:`,
        ar: `## حمايات الذاكرة 🧱

قد يحتوي كود C وC++ على **علل في أمان الذاكرة (memory-safety bugs)**: فيض المخزن المؤقت (buffer overflow) يكتب بعد نهاية مصفوفة، والاستخدام بعد التحرير (use-after-free) يعيد استخدام ذاكرة حُرّرت من قبل. وإن تحكّم المدخل فيما يُكتب فوقه، فقد تتحول علّة كهذه إلى تنفيذ كود. ويضيف نظام التشغيل وأدوات البناء طبقات تجعل ذلك أصعب بكثير:

- **NX / W^X**: الصفحة إما قابلة للكتابة وإما قابلة للتنفيذ، ولا تكون الاثنين معاً أبداً. ففي مداخل جدول الصفحات بتّ منع التنفيذ (أعلام PTE من درس الذاكرة)، فيحمل المكدّس والكومة بيانات فقط؛ ويَسِم الرابط (linker) المكدّسَ غير القابل للتنفيذ بالترويسة \`PT_GNU_STACK\`
- **ASLR** (التوزيع العشوائي لتخطيط فضاء العناوين): يبدأ المكدّس والكومة والمكتبات المشتركة ومناطق \`mmap\`، وفي حالة **PIE** (الملفات التنفيذية المستقلة عن الموضع) البرنامج نفسه، عند عناوين عشوائية في كل تشغيل، فلا يستطيع المهاجم الاعتماد على عناوين ثابتة. وقيمة \`/proc/sys/kernel/randomize_va_space\` هي 2 (توزيع عشوائي كامل) في التوزيعات الرئيسية
- **كناري المكدّس (stack canaries)** (\`-fstack-protector-strong\`): يضع المترجم قيمة عشوائية بجانب عنوان العودة ويفحصها قبل أن تعود الدالة؛ وتُجهض glibc البرنامج برسالة \`*** stack smashing detected ***\` إن تغيّرت
- **RELRO** (\`-Wl,-z,relro,-z,now\`): تصبح جداول الرابط الديناميكي (GOT) للقراءة فقط بعد بدء التشغيل
- **\`_FORTIFY_SOURCE\`**: يضيف فحوصاً للحجم إلى استدعاءات مثل \`memcpy\` و\`strcpy\` حين يعرف المترجم حجم المخزن
- وتضيف المعالجات الأحدث **المكدّسات الظلّية (shadow stacks)** وتتبّع القفزات غير المباشرة (Intel CET) أو مصادقة المؤشرات (ARM PAC)

لا شيء من هذا يصلح العلّة؛ إنما يرفع تكلفة استغلالها، والمهاجمون يربطون العلل بعضها ببعض (فتسريب معلومات قد يهزم ASLR مثلاً). والإصلاح الحقيقي ما يزال الكود الصحيح: فحوص الحدود، والاختبار بالبيانات العشوائية (fuzzing)، والمعقّمات (sanitizers)، واللغات الآمنة للذاكرة. انظر ماذا يغيّر ASLR من تشغيل إلى آخر:`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// A simplified model of ASLR for a position-independent executable (PIE) on x86-64 Linux:
// base = fixed start + a random number of pages, with RANDOM_BITS bits of randomness.
const PAGE = 4096n;
const START = 0x555555554000n;   // where a PIE is loaded when ASLR is turned off
const RANDOM_BITS = 28;          // check /proc/sys/vm/mmap_rnd_bits on your own machine

function randomBase() {
  const pages = BigInt(Math.floor(Math.random() * 2 ** RANDOM_BITS));
  return START + pages * PAGE;
}

const mainOffset = 0x1149n;      // where main() sits inside the binary (fixed at link time)
for (let run = 1; run <= 4; run++) {
  const base = randomBase();
  console.log("run " + run + ": base 0x" + base.toString(16) + "  main() at 0x" + (base + mainOffset).toString(16));
}
console.log("chance of guessing the base in one try: 1 in " + (2 ** RANDOM_BITS).toLocaleString("en-US"));
console.log("the low 12 bits (the offset inside a page) never change");
`,
      explanation: {
        en: "Every run moves the whole program by a random number of pages, so main() lands somewhere new, while its offset inside the page (149) stays put. That is why one leaked address is enough to undo ASLR for the whole binary. Run it again, or lower RANDOM_BITS to 8.",
        ar: "كل تشغيل يحرّك البرنامج كله بعدد عشوائي من الصفحات، فتقع main() في موضع جديد، بينما تبقى إزاحتها داخل الصفحة (149) ثابتة. ولهذا يكفي عنوان واحد مسرَّب لإبطال ASLR للملف التنفيذي كله. شغّله مرة أخرى، أو خفّض RANDOM_BITS إلى 8.",
      },
    },
    {
      type: "text",
      body: {
        en: `## A practical hardening routine 🧰

Most break-ins use known holes and sloppy configuration, not movie-style genius. A routine that covers the basics:

1. **Patch**: install security updates automatically (\`unattended-upgrades\`, \`dnf-automatic\`), and remember that a kernel update needs a reboot or live patching to take effect
2. **Minimal services**: every listening program is attack surface. List them with \`ss -tulpn\` and \`systemctl list-units --type=service --state=running\`, then disable or uninstall what you do not need
3. **Accounts and SSH**: key-based login, \`PasswordAuthentication no\` and \`PermitRootLogin no\` in \`sshd_config\`, named admins who use sudo, unused accounts locked
4. **Firewall**: deny inbound traffic by default and open only what you serve (nftables, ufw or firewalld)
5. **File permissions**: hunt for unexpected setuid programs (\`find / -xdev -perm -4000 -type f\`) and world-writable directories without the sticky bit (\`find / -xdev -type d -perm -0002 ! -perm -1000\`)
6. **Logging and auditing**: read \`journalctl\` and the authentication log, watch sensitive files with auditd (\`-w /etc/passwd -p wa -k identity\`), and send logs to another machine so an intruder cannot erase them
7. **Measure**: compare against a baseline such as the **CIS Benchmarks**, run \`lynis audit system\`, and keep **backups** you have actually restored once

Automate step 5 on the kind of listing \`find\` and \`stat\` produce:`,
        ar: `## روتين تقوية عملي 🧰

معظم الاختراقات تستغل ثغرات معروفة وإعدادات مهملة، لا عبقرية على طريقة الأفلام. وهذا روتين يغطي الأساسيات:

1. **حدّث**: ثبّت التحديثات الأمنية آلياً (\`unattended-upgrades\` و\`dnf-automatic\`)، وتذكّر أن تحديث النواة يحتاج إلى إعادة تشغيل أو ترقيع حيّ (live patching) ليسري
2. **الحد الأدنى من الخدمات**: كل برنامج يستمع على منفذ سطح هجوم. اسردها بـ \`ss -tulpn\` و\`systemctl list-units --type=service --state=running\`، ثم عطّل ما لا تحتاجه أو أزل تثبيته
3. **الحسابات وSSH**: الدخول بالمفاتيح، و\`PasswordAuthentication no\` و\`PermitRootLogin no\` في \`sshd_config\`، ومسؤولون مسمَّون يستخدمون sudo، وحسابات غير مستخدمة مقفلة
4. **الجدار الناري**: ارفض الحركة الواردة افتراضياً ولا تفتح إلا ما تقدّمه من خدمات (nftables أو ufw أو firewalld)
5. **صلاحيات الملفات**: ابحث عن برامج setuid غير متوقعة (\`find / -xdev -perm -4000 -type f\`) وعن مجلدات قابلة للكتابة من الجميع دون البتّ اللاصق (\`find / -xdev -type d -perm -0002 ! -perm -1000\`)
6. **التسجيل والتدقيق**: اقرأ \`journalctl\` وسجلّ المصادقة، وراقب الملفات الحساسة بـ auditd (\`-w /etc/passwd -p wa -k identity\`)، وأرسل السجلات إلى جهاز آخر كي لا يستطيع المتسلّل محوها
7. **قِس**: قارن بخط أساس مثل **CIS Benchmarks**، ونفّذ \`lynis audit system\`، واحتفظ بـ**نسخ احتياطية** جرّبت استعادتها فعلاً مرة واحدة على الأقل

أتمِت الخطوة 5 على نوع القوائم التي ينتجها \`find\` و\`stat\`:`,
      },
    },
    {
      type: "lab",
      id: "perm-audit",
      lang: "bash",
      prompt: {
        en: `Audit a listing of file modes for two classic mistakes: unexpected **setuid/setgid** programs and **world-writable** files and directories.

**Input** (read from stdin):
- Line 1: \`allow:\` followed by the setuid/setgid programs you expect (possibly none)
- Then one entry per line: \`<mode> <owner> <path>\`, where the mode is four octal digits (special bits, owner, group, other), and a path that ends in \`/\` is a directory. Paths contain no spaces

**Rules,** checked in this order for every entry:
1. A **file** with the setuid bit (4000) that is not in the allow list: \`REVIEW setuid <path> (owner <owner>)\`
2. A **file** with the setgid bit (2000) that is not in the allow list: \`REVIEW setgid <path> (owner <owner>)\` (setgid on a directory is normal: new files inherit its group)
3. A **file** writable by others (0002): \`FIX world-writable file <path>\`
4. A **directory** writable by others **without** the sticky bit (1000): \`FIX world-writable directory without sticky bit <path>\`

**Output:** every finding in input order, then \`findings: <count>\`.

**Example:**

\`\`\`
allow: /usr/bin/passwd /usr/bin/sudo
4755 root /usr/bin/passwd
4755 root /opt/backup/run
0666 www /var/www/config.php
1777 root /tmp/
0777 root /srv/upload/
\`\`\`

prints

\`\`\`
REVIEW setuid /opt/backup/run (owner root)
FIX world-writable file /var/www/config.php
FIX world-writable directory without sticky bit /srv/upload/
findings: 3
\`\`\``,
        ar: `دقّق قائمة بصلاحيات الملفات بحثاً عن خطأين كلاسيكيين: برامج **setuid/setgid** غير متوقعة، وملفات ومجلدات **قابلة للكتابة من الجميع (world-writable)**.

**المدخل** (يُقرأ من stdin):
- السطر 1: \`allow:\` متبوعة ببرامج setuid/setgid التي تتوقعها (وقد لا يوجد منها شيء)
- ثم مدخل واحد في كل سطر: \`<mode> <owner> <path>\`، حيث الصلاحيات أربعة أرقام ثمانية (البتّات الخاصة ثم المالك ثم المجموعة ثم البقية)، والمسار الذي ينتهي بـ \`/\` مجلد. ولا تحتوي المسارات على مسافات

**القواعد،** وتُفحص بهذا الترتيب لكل مدخل:
1. **ملف** عليه بتّ setuid (4000) وليس في قائمة السماح: \`REVIEW setuid <path> (owner <owner>)\`
2. **ملف** عليه بتّ setgid (2000) وليس في قائمة السماح: \`REVIEW setgid <path> (owner <owner>)\` (أما setgid على مجلد فأمر عادي: ترث الملفات الجديدة مجموعته)
3. **ملف** قابل للكتابة من البقية (0002): \`FIX world-writable file <path>\`
4. **مجلد** قابل للكتابة من البقية **دون** البتّ اللاصق (1000): \`FIX world-writable directory without sticky bit <path>\`

**المخرج:** كل نتيجة بترتيب المدخل، ثم \`findings: <count>\`.

**مثال:**

\`\`\`
allow: /usr/bin/passwd /usr/bin/sudo
4755 root /usr/bin/passwd
4755 root /opt/backup/run
0666 www /var/www/config.php
1777 root /tmp/
0777 root /srv/upload/
\`\`\`

يطبع

\`\`\`
REVIEW setuid /opt/backup/run (owner root)
FIX world-writable file /var/www/config.php
FIX world-writable directory without sticky bit /srv/upload/
findings: 3
\`\`\``,
      },
      starterCode: String.raw`#!/usr/bin/env bash
# Line 1: "allow: <path> <path> ..." lists the setuid/setgid programs we expect.
read -r _ allowed
findings=0

while read -r mode owner path; do
  [ -z "$mode" ] && continue
  m=$((8#$mode))                       # the mode is octal: 8# makes bash read it that way

  # TODO 1: expected=yes if " $allowed " contains " $path ", otherwise no (a case statement works)
  # TODO 2: isdir=yes if the path ends with /
  # TODO 3: the four checks, in order, with (( m & 04000 )), (( m & 02000 )), (( m & 0002 ))
  #         and (( m & 01000 )); echo each finding and add 1 to findings
done

echo "findings: $findings"
`,
      solution: String.raw`#!/usr/bin/env bash
# Line 1: "allow: <path> <path> ..." lists the setuid/setgid programs we expect.
read -r _ allowed
findings=0

while read -r mode owner path; do
  [ -z "$mode" ] && continue
  m=$((8#$mode))                       # the mode is octal: 8# makes bash read it that way

  case " $allowed " in
    *" $path "*) expected=yes ;;
    *) expected=no ;;
  esac
  case "$path" in
    */) isdir=yes ;;
    *) isdir=no ;;
  esac

  if [ "$isdir" = no ] && (( m & 04000 )) && [ "$expected" = no ]; then
    echo "REVIEW setuid $path (owner $owner)"; findings=$((findings + 1))
  fi
  if [ "$isdir" = no ] && (( m & 02000 )) && [ "$expected" = no ]; then
    echo "REVIEW setgid $path (owner $owner)"; findings=$((findings + 1))
  fi
  if (( m & 0002 )); then
    if [ "$isdir" = no ]; then
      echo "FIX world-writable file $path"; findings=$((findings + 1))
    elif ! (( m & 01000 )); then
      echo "FIX world-writable directory without sticky bit $path"; findings=$((findings + 1))
    fi
  fi
done

echo "findings: $findings"
`,
      hints: [
        {
          en: "Bash arithmetic reads a number with a 8# prefix as octal, and (( m & 04000 )) is true when the setuid bit is set. Without 8#, 0755 would also work in (( )), but 755 would be read as decimal.",
          ar: "تقرأ حسابات Bash العدد ذا البادئة 8# على أنه ثماني، ويكون (( m & 04000 )) صحيحاً حين يكون بتّ setuid مضبوطاً. ودون 8# قد يعمل 0755 داخل (( ))، لكن 755 سيُقرأ عشرياً.",
        },
        {
          en: "To test membership in a space-separated list, pad both sides with spaces: case \" $allowed \" in *\" $path \"*) ... esac. That way /usr/bin/su does not match /usr/bin/sudo.",
          ar: "لاختبار الانتماء إلى قائمة مفصولة بمسافات، أحِط الطرفين بمسافات: case \" $allowed \" in *\" $path \"*) ... esac. وبهذا لا يطابق /usr/bin/su المسار /usr/bin/sudo.",
        },
        {
          en: "Rules 1 and 2 apply only to files, and the allow list silences them but not the world-writable check. For a directory with o+w, ! (( m & 01000 )) is true when the sticky bit is missing.",
          ar: "القاعدتان 1 و2 للملفات فقط، وقائمة السماح تُسكتهما لكنها لا تُسكت فحص الكتابة من الجميع. وفي المجلد الذي عليه o+w يكون ! (( m & 01000 )) صحيحاً حين يغيب البتّ اللاصق.",
        },
      ],
      tests: [
        {
          name: { en: "Example from the prompt", ar: "المثال من نص المسألة" },
          stdin: "allow: /usr/bin/passwd /usr/bin/sudo\n4755 root /usr/bin/passwd\n4755 root /opt/backup/run\n0666 www /var/www/config.php\n1777 root /tmp/\n0777 root /srv/upload/\n",
          expected: `REVIEW setuid /opt/backup/run (owner root)
FIX world-writable file /var/www/config.php
FIX world-writable directory without sticky bit /srv/upload/
findings: 3`,
        },
        {
          name: { en: "setgid files versus setgid directories", ar: "ملفات setgid مقابل مجلدات setgid" },
          stdin: "allow: /usr/bin/passwd /usr/bin/sudo\n4755 root /usr/bin/passwd\n4755 root /usr/bin/sudo\n4755 root /opt/backup/run\n2755 root /usr/bin/ssh-agent\n0644 root /etc/hosts\n0666 www /var/www/config.php\n1777 root /tmp/\n0777 root /srv/upload/\n2775 root /srv/team/\n",
          expected: `REVIEW setuid /opt/backup/run (owner root)
REVIEW setgid /usr/bin/ssh-agent (owner root)
FIX world-writable file /var/www/config.php
FIX world-writable directory without sticky bit /srv/upload/
findings: 4`,
        },
        {
          name: { en: "Several findings on one line; allowed is not the same as safe", ar: "عدة نتائج في سطر واحد؛ والمسموح ليس آمناً بالضرورة" },
          stdin: "allow: /bin/x\n6777 root /bin/x\n6777 root /bin/y\n0757 ana /home/ana/\n0002 ana /home/ana/.netrc\n",
          expected: `FIX world-writable file /bin/x
REVIEW setuid /bin/y (owner root)
REVIEW setgid /bin/y (owner root)
FIX world-writable file /bin/y
FIX world-writable directory without sticky bit /home/ana/
FIX world-writable file /home/ana/.netrc
findings: 6`,
        },
        {
          name: { en: "An empty allow list", ar: "قائمة سماح فارغة" },
          stdin: "allow:\n4711 root /usr/local/bin/helper\n2711 root /usr/local/bin/mailer\n",
          expected: "REVIEW setuid /usr/local/bin/helper (owner root)\nREVIEW setgid /usr/local/bin/mailer (owner root)\nfindings: 2",
        },
        {
          name: { en: "A clean system", ar: "نظام نظيف" },
          stdin: "allow: /usr/bin/passwd\n4755 root /usr/bin/passwd\n0755 root /usr/bin/ls\n1777 root /tmp/\n2775 root /srv/team/\n0640 root /etc/shadow\n",
          expected: "findings: 0",
        },
      ],
      sampleInput: "allow: /usr/bin/passwd\n4755 root /usr/bin/passwd\n0777 root /srv/upload/\n",
    },
    {
      type: "quiz",
      questions: [
        {
          q: {
            en: "A web server must listen on port 443 but should not run as root. What is the least-privilege fix?",
            ar: "يجب أن يستمع خادم ويب على المنفذ 443 لكن لا ينبغي أن يعمل بالجذر. ما الحل وفق مبدأ أقل الامتيازات؟",
          },
          choices: [
            { en: "Run it as root and trust the code", ar: "شغّله بالجذر وثِق بالكود" },
            { en: "Give its account unrestricted sudo rights", ar: "امنح حسابه صلاحيات sudo غير مقيّدة" },
            { en: "Run it as an unprivileged user with only CAP_NET_BIND_SERVICE (setcap or systemd AmbientCapabilities)", ar: "شغّله بمستخدم غير مميَّز مع CAP_NET_BIND_SERVICE فقط (عبر setcap أو AmbientCapabilities في systemd)" },
            { en: "chmod 777 the server binary", ar: "نفّذ chmod 777 على الملف التنفيذي للخادم" },
          ],
          answer: 2,
          explain: {
            en: "Binding a port below 1024 needs exactly one capability. Granting just that one means a compromise of the server gives the attacker an ordinary account, not root. chmod 777 would let anyone replace the binary.",
            ar: "الربط بمنفذ أقل من 1024 يحتاج إلى قدرة واحدة بالضبط. ومنح هذه القدرة وحدها يعني أن اختراق الخادم يعطي المهاجم حساباً عادياً لا الجذر. أما chmod 777 فتتيح لأي أحد استبدال الملف التنفيذي.",
          },
        },
        {
          q: {
            en: "Why must a program running as root call setgid() before setuid() when it drops privileges?",
            ar: "لماذا يجب على برنامج يعمل بالجذر أن يستدعي setgid() قبل setuid() حين يتخلى عن صلاحياته؟",
          },
          choices: [
            { en: "After setuid() to a normal user it is no longer allowed to change its group, so it would stay in group root", ar: "لأنه بعد setuid() إلى مستخدم عادي لا يعود يحق له تغيير مجموعته، فيبقى في مجموعة الجذر" },
            { en: "Because setuid() resets the group to root", ar: "لأن setuid() تعيد المجموعة إلى الجذر" },
            { en: "Because setgid() always fails when called by root", ar: "لأن setgid() تفشل دائماً حين يستدعيها الجذر" },
            { en: "The order does not matter", ar: "الترتيب لا يهم" },
          ],
          answer: 0,
          explain: {
            en: "Changing the GID to an arbitrary value needs privilege. Once the UID is no longer 0 that privilege is gone, so a later setgid() fails with EPERM. Supplementary groups (setgroups) must be dropped first for the same reason, and return values must be checked.",
            ar: "تغيير GID إلى قيمة اعتباطية يحتاج إلى امتياز. وبمجرد أن يصبح UID غير 0 يزول ذلك الامتياز، فتفشل setgid() اللاحقة بالخطأ EPERM. ويجب التخلي عن المجموعات الإضافية (setgroups) أولاً للسبب نفسه، وفحص القيم المعادة.",
          },
        },
        {
          q: { en: "Which statement about seccomp filters is true?", ar: "أي العبارات الآتية عن مرشّحات seccomp صحيحة؟" },
          choices: [
            { en: "A process can unload its own filter when it needs more system calls", ar: "تستطيع العملية إزالة مرشّحها حين تحتاج إلى مزيد من استدعاءات النظام" },
            { en: "Once installed a filter cannot be removed, and child processes inherit it", ar: "بعد تثبيت المرشّح لا يمكن إزالته، وترثه العمليات الأبناء" },
            { en: "seccomp filters decide access by file path", ar: "مرشّحات seccomp تقرّر الوصول بحسب مسار الملف" },
            { en: "Only root can ever install a filter", ar: "لا يستطيع تثبيت مرشّح إلا الجذر" },
          ],
          answer: 1,
          explain: {
            en: "Filters are one-way: they can be added, never removed, and they survive fork and execve. Any process may install one after setting no_new_privs. seccomp sees system-call numbers and argument values, not file paths; path-based rules are the job of SELinux or AppArmor.",
            ar: "المرشّحات باتجاه واحد: يمكن إضافتها ولا يمكن إزالتها أبداً، وتنجو من fork وexecve. وتستطيع أي عملية تثبيت مرشّح بعد ضبط no_new_privs. ويرى seccomp أرقام استدعاءات النظام وقيم معاملاتها لا مسارات الملفات؛ أما القواعد القائمة على المسارات فمهمة SELinux أو AppArmor.",
          },
        },
        {
          q: { en: "What does ASLR do?", ar: "ماذا يفعل ASLR؟" },
          choices: [
            { en: "Encrypts the process's memory", ar: "يشفّر ذاكرة العملية" },
            { en: "Prevents buffer overflows from happening", ar: "يمنع حدوث فيض المخزن المؤقت" },
            { en: "Marks the stack as non-executable", ar: "يَسِم المكدّس بأنه غير قابل للتنفيذ" },
            { en: "Loads the stack, heap, libraries and (for PIE) the program at random addresses on each run", ar: "يحمّل المكدّس والكومة والمكتبات و(في حالة PIE) البرنامج عند عناوين عشوائية في كل تشغيل" },
          ],
          answer: 3,
          explain: {
            en: "ASLR hides where things are, so an exploit cannot hard-code addresses. It does not stop the overflow itself (that needs correct code) and it is not NX, which is the separate rule that data pages are not executable. An address leak can undo it.",
            ar: "يُخفي ASLR مواضع الأشياء، فلا يستطيع الاستغلال أن يثبّت العناوين في كوده. لكنه لا يوقف الفيض نفسه (فذلك يحتاج إلى كود صحيح)، وليس هو NX الذي يمثّل القاعدة المنفصلة بأن صفحات البيانات غير قابلة للتنفيذ. وتسريب عنوان واحد قد يُبطله.",
          },
        },
        {
          q: {
            en: "A shared directory has mode 0777 (drwxrwxrwx) and no sticky bit. What can any local user do there?",
            ar: "مجلد مشترك صلاحياته 0777 (drwxrwxrwx) ودون البتّ اللاصق. ماذا يستطيع أي مستخدم محلي أن يفعل فيه؟",
          },
          choices: [
            { en: "Delete or rename other users' files in it, even files they cannot read", ar: "حذف ملفات المستخدمين الآخرين فيه أو إعادة تسميتها، حتى الملفات التي لا يستطيع قراءتها" },
            { en: "Nothing harmful, as long as the files have mode 600", ar: "لا شيء ضار، ما دامت صلاحيات الملفات 600" },
            { en: "Only list the file names", ar: "سرد أسماء الملفات فقط" },
            { en: "Become root automatically", ar: "أن يصبح جذراً تلقائياً" },
          ],
          answer: 0,
          explain: {
            en: "Deleting and renaming are writes to the directory, not to the file, so w on the directory is enough. The sticky bit (1777, as on /tmp) restricts that to each file's owner. That is why the audit flags world-writable directories without it.",
            ar: "الحذف وإعادة التسمية كتابة في المجلد لا في الملف، فتكفي w على المجلد. ويقصر البتّ اللاصق (1777 كما في /tmp) ذلك على مالك كل ملف. ولهذا يُبلغ التدقيق عن المجلدات القابلة للكتابة من الجميع دونه.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Practice only on systems you own or are authorized to test, and treat production hardening as a reviewed change
- The kernel checks **credentials** at every system call. setuid programs run with their owner's effective UID; **least privilege** means dedicated service accounts, privilege separation, narrow sudo rules and dropping privileges in the right order (groups, GID, UID)
- **Capabilities** split root into 41 pieces shown as hex masks in \`/proc/<pid>/status\`; grant only what is needed (\`setcap\`, \`--cap-drop ALL\`) and question \`CAP_SYS_ADMIN\`, \`CAP_SYS_MODULE\`, \`CAP_SYS_RAWIO\`, \`CAP_SYS_PTRACE\` and \`CAP_DAC_READ_SEARCH\`
- **seccomp** filters stack, the highest-precedence action wins, they can never be removed, and **no_new_privs** makes them safe for unprivileged processes; systemd, namespaces and SELinux/AppArmor complete the sandbox
- **NX**, **ASLR**, **canaries**, **RELRO** and FORTIFY make memory bugs harder to exploit, but only correct code removes them
- Hardening is a routine: patch, minimise services, lock down SSH, firewall by default, audit permissions, log off-host and measure against a baseline
- You wrote a capability decoder, a seccomp evaluator and a permission audit

**Practice:** in a VM of your own, run \`grep Cap /proc/self/status\` as a user and as root, try \`systemd-analyze security\` on a few services, and run the two \`find\` commands from the routine. **Next:** I/O and device drivers, with the resources listed for that topic on the course map.`,
        ar: `## الخلاصة

- لا تتدرّب إلا على أنظمة تملكها أو مأذون لك باختبارها، وعامل تقوية أنظمة الإنتاج كتغيير يخضع للمراجعة
- تفحص النواة **بيانات الاعتماد** عند كل استدعاء نظام. وبرامج setuid تعمل بالـ UID الفعّال لمالكها؛ و**مبدأ أقل الامتيازات** يعني حسابات خدمة مخصّصة، وفصل الصلاحيات، وقواعد sudo ضيقة، والتخلي عن الصلاحيات بالترتيب الصحيح (المجموعات ثم GID ثم UID)
- **القدرات** تقسّم الجذر إلى 41 قطعة تظهر أقنعةً سداسية عشرية في \`/proc/<pid>/status\`؛ فامنح ما يلزم فقط (\`setcap\` و\`--cap-drop ALL\`) واسأل عن \`CAP_SYS_ADMIN\` و\`CAP_SYS_MODULE\` و\`CAP_SYS_RAWIO\` و\`CAP_SYS_PTRACE\` و\`CAP_DAC_READ_SEARCH\`
- مرشّحات **seccomp** تتكدّس ويفوز الإجراء ذو الأسبقية الأعلى، ولا يمكن إزالتها أبداً، و**no_new_privs** يجعلها آمنة للعمليات غير المميَّزة؛ ويكمل systemd وفضاءات الأسماء وSELinux/AppArmor صندوق الرمل
- تجعل **NX** و**ASLR** و**الكناري** و**RELRO** وFORTIFY استغلال علل الذاكرة أصعب، لكن الكود الصحيح وحده يزيلها
- التقوية روتين: حدّث، وقلّل الخدمات، وأحكِم SSH، واجعل الجدار الناري رافضاً افتراضياً، ودقّق الصلاحيات، وسجّل خارج المضيف، وقِس على خط أساس
- كتبت مفكّك قدرات ومقيّم seccomp وتدقيقاً للصلاحيات

**تدرّب:** في جهاز افتراضي تملكه، نفّذ \`grep Cap /proc/self/status\` بمستخدم عادي ثم بالجذر، وجرّب \`systemd-analyze security\` على بضع خدمات، ونفّذ أمري \`find\` من الروتين. **التالي:** الإدخال/الإخراج وبرامج تشغيل الأجهزة، بالمصادر المدرجة لهذا الموضوع في خريطة المقرر.`,
      },
    },
  ],
};
