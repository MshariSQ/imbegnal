import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "network-troubleshooting",
  title: { en: "Troubleshooting Tools — Finding Where a Connection Breaks", ar: "أدوات التشخيص — كيف تجد موضع انقطاع الاتصال" },
  estMinutes: 44,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- A **method** that finds the broken step quickly instead of guessing: link, address, route, name, service
- How to read **ping**: loss, round-trip times, duplicates and "unreachable" messages
- How **traceroute** discovers the path with the TTL field, and why \`* * *\` often means nothing is wrong
- How to check names with **dig** and **nslookup**, and services with **ss** (or the older **netstat**)
- How to capture and read packets with **tcpdump** and **Wireshark**, including the difference between "refused" and "no answer"
- You will build three tools: a ping summariser, a traceroute reader and a handshake detector for tcpdump output

⚠️ **Ethics first:** capture and probe only your own devices and networks, or ones you have written permission to test. A packet capture can contain other people's private data, and intercepting traffic on someone else's network is illegal in most countries. Every sample in this lesson is made up, with addresses from the documentation ranges.

## The plumber's method 🔧

When water stops coming out of a tap, a good plumber does not tear down the wall. She checks the tap, then the pipe under the sink, then the valve, then the main supply, **one section at a time, in order**, until she finds the section where water goes in but does not come out.

A network connection is a pipe made of layers, and each layer needs the one below it. So check them **bottom up**, and stop at the first one that fails:

\`\`\`text
1. Link      is the cable plugged in / Wi-Fi associated?   ip link
2. Address   do I have an IP address and a gateway?         ip addr, ip route
3. Route     can I reach the gateway, then the far side?    ping, traceroute
4. Name      does the name resolve to the right address?    dig, nslookup
5. Service   is the program listening, and is it allowed?   ss, curl -v, nc -vz
   ... and when the tools disagree: look at the packets     tcpdump, Wireshark
\`\`\`

Two habits make the method work. **Change one thing at a time** and write down what you saw, so you know which change fixed it. And **know what "good" looks like**: run these tools on a healthy network first, so that an odd result stands out.`,
        ar: `## ماذا ستتعلم

- **منهجاً** يجد الخطوة المعطوبة بسرعة بدلاً من التخمين: الرابط، ثم العنوان، ثم المسار، ثم الاسم، ثم الخدمة
- كيف تقرأ **ping**: الفقد، وأزمنة الذهاب والإياب، والردود المكررة، ورسائل "unreachable"
- كيف يكتشف **traceroute** المسار بحقل TTL، ولماذا لا تعني \`* * *\` في الغالب أن شيئاً معطوب
- كيف تفحص الأسماء بـ **dig** و**nslookup**، والخدمات بـ **ss** (أو بالأداة الأقدم **netstat**)
- كيف تلتقط الحزم وتقرؤها بـ **tcpdump** و**Wireshark**، بما في ذلك الفرق بين "رُفض" و"لا جواب"
- ستبني ثلاث أدوات: ملخِّصاً لمخرجات ping، وقارئاً لمخرجات traceroute، وكاشفاً للمصافحات في مخرجات tcpdump

⚠️ **الأخلاق أولاً:** لا تلتقط ولا تفحص إلا أجهزتك وشبكاتك أنت، أو ما لديك إذن مكتوب باختباره. فالتقاط الحزم قد يحتوي بيانات خاصة لأشخاص آخرين، واعتراض الحركة على شبكة غيرك مخالف للقانون في أغلب الدول. وكل عينة في هذا الدرس مصطنعة، بعناوين من نطاقات التوثيق.

## منهج السبّاك 🔧

حين ينقطع الماء عن صنبور، لا تهدم السبّاكة الماهرة الجدار. بل تفحص الصنبور، ثم الأنبوب تحت المغسلة، ثم الصمام، ثم خط الإمداد الرئيسي، **قسماً بعد قسم وبالترتيب**، حتى تجد القسم الذي يدخله الماء ولا يخرج منه.

واتصال الشبكة أنبوب مكوَّن من طبقات، وكل طبقة تحتاج التي تحتها. لذلك افحصها **من الأسفل إلى الأعلى**، وتوقّف عند أول طبقة تفشل:

\`\`\`text
1. الرابط     هل الكبل موصول / هل ارتبط Wi-Fi؟                 ip link
2. العنوان    هل لديّ عنوان IP وبوابة؟                          ip addr, ip route
3. المسار     هل أصل إلى البوابة، ثم إلى الطرف البعيد؟          ping, traceroute
4. الاسم      هل يُحلّ الاسم إلى العنوان الصحيح؟                dig, nslookup
5. الخدمة     هل البرنامج يستمع، وهل الوصول إليه مسموح؟        ss, curl -v, nc -vz
   ... وحين تختلف الأدوات: انظر إلى الحزم نفسها                tcpdump, Wireshark
\`\`\`

وعادتان تجعلان المنهج ينجح. **غيّر شيئاً واحداً في كل مرة** ودوّن ما رأيت، لتعرف أي تغيير أصلح المشكلة. و**اعرف كيف يبدو "السليم"**: شغّل هذه الأدوات على شبكة سليمة أولاً، حتى تبرز النتيجة الغريبة.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Steps 1 to 3: link, address, and ping

Start with \`ip link\`: an interface marked \`state DOWN\` or \`NO-CARRIER\` has no working link (unplugged cable, Wi-Fi not associated, disabled port). Then \`ip addr\`: do you have an address? An IPv4 address in \`169.254.0.0/16\` is a **link-local** address the system gave itself (RFC 3927) because **DHCP failed**. Then \`ip route\`: is there a \`default via ...\` line?

Now **ping** the gateway, then something beyond it. Ping sends **ICMP echo requests** (type 8) and waits for **echo replies** (type 0), as defined in RFC 792:

\`\`\`text
$ ping -c 4 192.0.2.1
PING 192.0.2.1 (192.0.2.1) 56(84) bytes of data.
64 bytes from 192.0.2.1: icmp_seq=1 ttl=64 time=0.512 ms
64 bytes from 192.0.2.1: icmp_seq=2 ttl=64 time=0.498 ms
64 bytes from 192.0.2.1: icmp_seq=3 ttl=64 time=0.731 ms
64 bytes from 192.0.2.1: icmp_seq=4 ttl=64 time=0.455 ms

--- 192.0.2.1 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3005ms
rtt min/avg/max/mdev = 0.455/0.549/0.731/0.107 ms
\`\`\`

How to read it:

- **icmp_seq** numbers each request. A **gap** in the sequence is a lost packet (or a lost reply). A reply that arrives very late still counts; it just has a huge time.
- **time** is the round-trip time. Compare it with what is normal for that path: under a millisecond on a LAN, tens of milliseconds across a country. A large **mdev** (the spread) means the delay jumps around (**jitter**), which hurts calls and games.
- **ttl** is what is left of the reply's TTL. Systems start at different values (Linux commonly 64, Windows 128), so a reply with ttl=54 crossed about ten routers on the way back.
- **(DUP!)** marks a duplicate reply: the same packet arrived twice, a sign of a loop or a misbehaving device. Ping reports them separately as \`+N duplicates\`.
- \`From 192.168.1.10 icmp_seq=1 Destination Host Unreachable\` coming from **your own address** means your host could not even find the target's MAC address with ARP: the target is on your subnet but not answering. Ping counts these as \`+N errors\`.

One warning: many servers and firewalls block ICMP on purpose. **No reply to ping does not prove a host is down**, and a reply does not prove its web server works. Ping tests reachability at layer 3, nothing more.`,
        ar: `## الخطوات من 1 إلى 3: الرابط والعنوان وping

ابدأ بـ \`ip link\`: الواجهة الموسومة بـ \`state DOWN\` أو \`NO-CARRIER\` ليس لها رابط يعمل (كبل مفصول، أو Wi-Fi غير مرتبط، أو منفذ معطَّل). ثم \`ip addr\`: هل لديك عنوان؟ عنوان IPv4 في \`169.254.0.0/16\` هو عنوان **محلي للرابط (link-local)** أعطاه النظام لنفسه (RFC 3927) لأن **DHCP فشل**. ثم \`ip route\`: هل يوجد سطر \`default via ...\`؟

والآن أرسل **ping** إلى البوابة، ثم إلى شيء أبعد منها. يرسل ping **طلبات صدى ICMP (echo request)** (النوع 8) وينتظر **ردود الصدى (echo reply)** (النوع 0)، كما يعرّفها RFC 792:

\`\`\`text
$ ping -c 4 192.0.2.1
PING 192.0.2.1 (192.0.2.1) 56(84) bytes of data.
64 bytes from 192.0.2.1: icmp_seq=1 ttl=64 time=0.512 ms
64 bytes from 192.0.2.1: icmp_seq=2 ttl=64 time=0.498 ms
64 bytes from 192.0.2.1: icmp_seq=3 ttl=64 time=0.731 ms
64 bytes from 192.0.2.1: icmp_seq=4 ttl=64 time=0.455 ms

--- 192.0.2.1 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3005ms
rtt min/avg/max/mdev = 0.455/0.549/0.731/0.107 ms
\`\`\`

كيف تقرؤه:

- **icmp_seq** يرقّم كل طلب. و**الفجوة** في التسلسل حزمة ضائعة (أو رد ضائع). والرد الذي يصل متأخراً جداً ما زال يُحتسب؛ لكن زمنه كبير فقط.
- **time** هو زمن الذهاب والإياب. قارنه بما هو طبيعي لذلك المسار: أقل من ملّي ثانية في الشبكة المحلية، وعشرات الملّي ثواني عبر بلد كامل. و**mdev** الكبير (التشتت) يعني أن التأخير يقفز صعوداً وهبوطاً (**الارتعاش / jitter**)، وهذا يضر المكالمات والألعاب.
- **ttl** هو ما تبقى من TTL الرد. والأنظمة تبدأ بقيم مختلفة (Linux عادةً 64، وWindows عادةً 128)، فالرد الذي يحمل ttl=54 عبر نحو عشرة راوترات في طريق عودته.
- **(DUP!)** تعلّم رداً مكرراً: الحزمة نفسها وصلت مرتين، وهذه علامة على حلقة أو جهاز يسيء التصرف. ويبلّغ عنها ping منفصلة بالصيغة \`+N duplicates\`.
- السطر \`From 192.168.1.10 icmp_seq=1 Destination Host Unreachable\` الآتي من **عنوانك أنت** يعني أن جهازك لم يستطع حتى أن يجد عنوان MAC الخاص بالهدف عبر ARP: الهدف في شبكتك الفرعية لكنه لا يجيب. ويَعُدّ ping هذه الأسطر بالصيغة \`+N errors\`.

وتحذير واحد: كثير من الخوادم والجدران النارية تحجب ICMP عن قصد. **غياب الرد على ping لا يثبت أن الجهاز متوقف**، ووجود الرد لا يثبت أن خادم الويب فيه يعمل. فـ ping يختبر إمكانية الوصول في الطبقة 3، لا أكثر.`,
      },
    },
    {
      type: "lab",
      id: "ping-summary",
      lang: "python",
      prompt: {
        en: `Write the **statistics** part of ping yourself.

**Input:** the first line is \`sent <n>\`: the requests used \`icmp_seq\` 1 to n. The following lines are ping output in the Linux format. Two kinds of line matter; ignore every other line:

- a reply: \`<bytes> bytes from <ip>: icmp_seq=<s> ttl=<t> time=<ms> ms\`, possibly followed by \` (DUP!)\`;
- an error: \`From <ip> icmp_seq=<s> <message>\`.

**Rules**

- A reply counts as **received** the first time its \`icmp_seq\` appears. A reply marked \`(DUP!)\` or with an \`icmp_seq\` already received is a **duplicate**: count it, but do not use it for loss or times.
- Loss is \`(sent - received) * 100 / sent\`, printed with one decimal.
- Times: minimum, average and maximum of the received replies, three decimals each.

**Output**

\`\`\`text
<sent> sent, <received> received, <loss>% loss
rtt min/avg/max = <min>/<avg>/<max> ms        (or "rtt: none" if nothing was received)
missing icmp_seq: <comma-separated list>       (only if some sequence numbers got no reply)
duplicates: <count>                            (only if > 0)
errors: <count>                                (only if > 0)
\`\`\`

**Example**

\`\`\`text
Input:
sent 5
PING 198.51.100.20 (198.51.100.20) 56(84) bytes of data.
64 bytes from 198.51.100.20: icmp_seq=1 ttl=54 time=21.4 ms
64 bytes from 198.51.100.20: icmp_seq=2 ttl=54 time=19.8 ms
64 bytes from 198.51.100.20: icmp_seq=4 ttl=54 time=88.9 ms
64 bytes from 198.51.100.20: icmp_seq=5 ttl=54 time=20.3 ms

Output:
5 sent, 4 received, 20.0% loss
rtt min/avg/max = 19.800/37.600/88.900 ms
missing icmp_seq: 3
\`\`\``,
        ar: `اكتب بنفسك جزء **الإحصاءات** في ping.

**الإدخال:** السطر الأول هو \`sent <n>\`: استخدمت الطلبات \`icmp_seq\` من 1 إلى n. والأسطر التالية مخرجات ping بصيغة Linux. ونوعان من الأسطر يهمّان؛ وتجاهل كل سطر آخر:

- رد: \`<bytes> bytes from <ip>: icmp_seq=<s> ttl=<t> time=<ms> ms\`، وقد يتبعه \` (DUP!)\`؛
- خطأ: \`From <ip> icmp_seq=<s> <message>\`.

**القواعد**

- يُحتسب الرد **مستلَماً** أول مرة يظهر فيها \`icmp_seq\` الخاص به. والرد الموسوم بـ \`(DUP!)\` أو الذي يحمل \`icmp_seq\` استُلم من قبل هو **مكرر**: عُدّه، لكن لا تستخدمه في حساب الفقد ولا الأزمنة.
- الفقد هو \`(sent - received) * 100 / sent\`، ويُطبع بمنزلة عشرية واحدة.
- الأزمنة: أدنى زمن ومتوسطه وأقصاه للردود المستلمة، بثلاث منازل عشرية لكل منها.

**الإخراج**

\`\`\`text
<sent> sent, <received> received, <loss>% loss
rtt min/avg/max = <min>/<avg>/<max> ms        (أو "rtt: none" إن لم يُستلم شيء)
missing icmp_seq: <قائمة مفصولة بفواصل>         (فقط إن بقيت أرقام تسلسل بلا رد)
duplicates: <العدد>                            (فقط إن كان > 0)
errors: <العدد>                                (فقط إن كان > 0)
\`\`\`

**مثال**

\`\`\`text
الإدخال:
sent 5
PING 198.51.100.20 (198.51.100.20) 56(84) bytes of data.
64 bytes from 198.51.100.20: icmp_seq=1 ttl=54 time=21.4 ms
64 bytes from 198.51.100.20: icmp_seq=2 ttl=54 time=19.8 ms
64 bytes from 198.51.100.20: icmp_seq=4 ttl=54 time=88.9 ms
64 bytes from 198.51.100.20: icmp_seq=5 ttl=54 time=20.3 ms

الإخراج:
5 sent, 4 received, 20.0% loss
rtt min/avg/max = 19.800/37.600/88.900 ms
missing icmp_seq: 3
\`\`\``,
      },
      starterCode: String.raw`import re
import sys

REPLY = re.compile(r"^\d+ bytes from \S+: icmp_seq=(\d+) ttl=\d+ time=([\d.]+) ms( \(DUP!\))?$")
ERROR = re.compile(r"^From \S+ icmp_seq=(\d+) ")

lines = sys.stdin.read().splitlines()
sent = int(lines[0].split()[1]) if lines and lines[0].startswith("sent") else 0
received = {}  # icmp_seq -> round-trip time of the first reply
duplicates = 0
errors = 0
for line in lines[1:]:
    line = line.strip()
    m = REPLY.match(line)
    if m:
        seq, rtt = int(m.group(1)), float(m.group(2))
        # TODO: a reply marked (DUP!) (m.group(3)) or with a seq already in 'received' is a duplicate
        received[seq] = rtt
    # TODO: count error lines (ERROR.match)

loss = (sent - len(received)) * 100 / sent if sent else 0.0
print("%d sent, %d received, %.1f%% loss" % (sent, len(received), loss))
# TODO: print the rtt line (or "rtt: none"), then the optional missing / duplicates / errors lines
`,
      solution: String.raw`import re
import sys

REPLY = re.compile(r"^\d+ bytes from \S+: icmp_seq=(\d+) ttl=\d+ time=([\d.]+) ms( \(DUP!\))?$")
ERROR = re.compile(r"^From \S+ icmp_seq=(\d+) ")

lines = sys.stdin.read().splitlines()
sent = int(lines[0].split()[1]) if lines and lines[0].startswith("sent") else 0
received = {}  # icmp_seq -> round-trip time of the first reply
duplicates = 0
errors = 0
for line in lines[1:]:
    line = line.strip()
    m = REPLY.match(line)
    if m:
        seq, rtt, dup = int(m.group(1)), float(m.group(2)), m.group(3)
        if dup or seq in received:
            duplicates += 1        # a second copy of a reply: not a new packet
        else:
            received[seq] = rtt
    elif ERROR.match(line):
        errors += 1                # an ICMP error came back instead of an echo reply

loss = (sent - len(received)) * 100 / sent if sent else 0.0
print("%d sent, %d received, %.1f%% loss" % (sent, len(received), loss))
if received:
    rtts = list(received.values())
    print("rtt min/avg/max = %.3f/%.3f/%.3f ms" % (min(rtts), sum(rtts) / len(rtts), max(rtts)))
else:
    print("rtt: none")
missing = [str(s) for s in range(1, sent + 1) if s not in received]
if missing:
    print("missing icmp_seq: " + ",".join(missing))
if duplicates:
    print("duplicates: %d" % duplicates)
if errors:
    print("errors: %d" % errors)
`,
      hints: [
        { en: "`m.group(3)` is `\" (DUP!)\"` for a marked duplicate and `None` otherwise. Treat it, or a `seq` that is already a key of `received`, as a duplicate and skip the timing.", ar: "قيمة `m.group(3)` هي `\" (DUP!)\"` للرد المكرر الموسوم، و`None` في غير ذلك. اعتبرها، أو `seq` موجوداً أصلاً كمفتاح في `received`، رداً مكرراً وتجاوز حساب زمنه." },
        { en: "Use `elif ERROR.match(line):` after the reply check so an error line is never mistaken for a reply.", ar: "استخدم `elif ERROR.match(line):` بعد فحص الرد، حتى لا يُحسب سطر الخطأ رداً أبداً." },
        { en: "Missing numbers: `[str(s) for s in range(1, sent + 1) if s not in received]`. Format times with `\"%.3f\"`; the average is `sum(rtts) / len(rtts)`.", ar: "الأرقام المفقودة: `[str(s) for s in range(1, sent + 1) if s not in received]`. ونسّق الأزمنة بـ `\"%.3f\"`؛ والمتوسط هو `sum(rtts) / len(rtts)`." },
      ],
      tests: [
        {
          name: { en: "A healthy LAN: no loss", ar: "شبكة محلية سليمة: لا فقد" },
          stdin: "sent 4\nPING 192.0.2.1 (192.0.2.1) 56(84) bytes of data.\n64 bytes from 192.0.2.1: icmp_seq=1 ttl=64 time=0.512 ms\n64 bytes from 192.0.2.1: icmp_seq=2 ttl=64 time=0.498 ms\n64 bytes from 192.0.2.1: icmp_seq=3 ttl=64 time=0.731 ms\n64 bytes from 192.0.2.1: icmp_seq=4 ttl=64 time=0.455 ms\n",
          expected: "4 sent, 4 received, 0.0% loss\nrtt min/avg/max = 0.455/0.549/0.731 ms\n",
        },
        {
          name: { en: "The worked example: one reply missing", ar: "المثال المحلول: رد واحد مفقود" },
          stdin: "sent 5\nPING 198.51.100.20 (198.51.100.20) 56(84) bytes of data.\n64 bytes from 198.51.100.20: icmp_seq=1 ttl=54 time=21.4 ms\n64 bytes from 198.51.100.20: icmp_seq=2 ttl=54 time=19.8 ms\n64 bytes from 198.51.100.20: icmp_seq=4 ttl=54 time=88.9 ms\n64 bytes from 198.51.100.20: icmp_seq=5 ttl=54 time=20.3 ms\n",
          expected: "5 sent, 4 received, 20.0% loss\nrtt min/avg/max = 19.800/37.600/88.900 ms\nmissing icmp_seq: 3\n",
        },
        {
          name: { en: "A duplicate is not a new reply; a late reply still counts", ar: "الرد المكرر ليس رداً جديداً؛ والرد المتأخر ما زال يُحتسب" },
          stdin: "sent 3\nPING 192.0.2.1 (192.0.2.1) 56(84) bytes of data.\n64 bytes from 192.0.2.1: icmp_seq=1 ttl=64 time=1.20 ms\n64 bytes from 192.0.2.1: icmp_seq=1 ttl=64 time=1.31 ms (DUP!)\n64 bytes from 192.0.2.1: icmp_seq=3 ttl=64 time=1.05 ms\n64 bytes from 192.0.2.1: icmp_seq=2 ttl=64 time=950 ms\n",
          expected: "3 sent, 3 received, 0.0% loss\nrtt min/avg/max = 1.050/317.417/950.000 ms\nduplicates: 1\n",
        },
        {
          name: { en: "Destination Host Unreachable lines are errors", ar: "أسطر Destination Host Unreachable أخطاء" },
          stdin: "sent 4\nPING 192.168.1.50 (192.168.1.50) 56(84) bytes of data.\nFrom 192.168.1.10 icmp_seq=1 Destination Host Unreachable\nFrom 192.168.1.10 icmp_seq=2 Destination Host Unreachable\nFrom 192.168.1.10 icmp_seq=3 Destination Host Unreachable\n",
          expected: "4 sent, 0 received, 100.0% loss\nrtt: none\nmissing icmp_seq: 1,2,3,4\nerrors: 3\n",
        },
        {
          name: { en: "No replies at all (ICMP filtered or host down)", ar: "لا ردود إطلاقاً (ICMP محجوب أو الجهاز متوقف)" },
          stdin: "sent 3\nPING 203.0.113.99 (203.0.113.99) 56(84) bytes of data.\n",
          expected: "3 sent, 0 received, 100.0% loss\nrtt: none\nmissing icmp_seq: 1,2,3\n",
        },
        {
          name: { en: "Out-of-order replies and unknown lines are ignored correctly", ar: "الردود غير المرتبة والأسطر المجهولة تُعالج بشكل صحيح" },
          stdin: "sent 8\nPING 192.0.2.1 (192.0.2.1) 56(84) bytes of data.\n64 bytes from 192.0.2.1: icmp_seq=8 ttl=64 time=2.5 ms\n64 bytes from 192.0.2.1: icmp_seq=1 ttl=64 time=2.25 ms\nRequest timeout for icmp_seq 2\n",
          expected: "8 sent, 2 received, 75.0% loss\nrtt min/avg/max = 2.250/2.375/2.500 ms\nmissing icmp_seq: 2,3,4,5,6,7\n",
        },
      ],
      sampleInput: "sent 5\nPING 198.51.100.20 (198.51.100.20) 56(84) bytes of data.\n64 bytes from 198.51.100.20: icmp_seq=1 ttl=54 time=21.4 ms\n64 bytes from 198.51.100.20: icmp_seq=2 ttl=54 time=19.8 ms\n64 bytes from 198.51.100.20: icmp_seq=4 ttl=54 time=88.9 ms\n64 bytes from 198.51.100.20: icmp_seq=5 ttl=54 time=20.3 ms\n",
    },
    {
      type: "text",
      body: {
        en: `## Step 3, continued: traceroute

Ping says "the far side is (not) reachable". **traceroute** says **where** the packets go, hop by hop. It uses the TTL rule you learned in the routing lesson: every router decrements the TTL, and the router that brings it to 0 drops the packet and sends back **ICMP time exceeded** (type 11), revealing its address.

So traceroute sends probes with TTL 1, then TTL 2, then 3, and so on, usually three probes per hop. The first router answers the TTL 1 probes, the second router the TTL 2 probes, and when a probe finally reaches the destination, the destination answers instead: Linux \`traceroute\` sends UDP probes to high ports (from 33434 up), so the destination replies **port unreachable**; Windows \`tracert\` and \`traceroute -I\` use ICMP echo, so it replies with an echo reply; \`traceroute -T\` uses TCP SYN packets, which pass many firewalls.

\`\`\`text
$ traceroute -n 198.51.100.20
traceroute to 198.51.100.20 (198.51.100.20), 30 hops max, 60 byte packets
 1  192.168.1.1     0.812 ms  0.701 ms  0.655 ms     <- your router
 2  10.10.0.1       8.102 ms  7.950 ms  8.311 ms     <- the ISP
 3  * * *                                            <- a router that does not answer
 4  203.0.113.9    15.214 ms 14.902 ms 15.050 ms
 5  198.51.100.20  16.127 ms 16.301 ms 15.840 ms     <- the destination
\`\`\`

Reading it takes care:

- \`* * *\` means "no answer within the timeout". If **later hops answer**, that router forwards traffic fine; it just does not send ICMP, or rate-limits it. It is not the problem.
- If the stars continue **until the hop limit** (30 by default), the trail goes cold after the last hop that answered: either the path is broken there, or the destination (or a firewall in front of it) drops the probes. Try another probe type before blaming the network.
- A **jump in latency that stays** for every later hop shows a long or busy link (a long-distance cable, a congested uplink). A single slow hop whose successors are fast is a router that answers ICMP slowly while forwarding normally.
- The return path can differ from the forward path, so times include a path you cannot see. \`mtr\` combines ping and traceroute and keeps updating loss and delay per hop, which is better for intermittent problems.`,
        ar: `## تتمة الخطوة 3: traceroute

يقول ping "الطرف البعيد يمكن (أو لا يمكن) الوصول إليه". أما **traceroute** فيقول **أين** تذهب الحزم، قفزة بعد قفزة. وهو يستخدم قاعدة TTL التي تعلمتها في درس التوجيه: كل راوتر يُنقص TTL، والراوتر الذي يوصله إلى 0 يُسقط الحزمة ويعيد رسالة **ICMP time exceeded** (النوع 11)، فيكشف عنوانه.

لذلك يرسل traceroute مجسّات (probes) بـ TTL قيمته 1، ثم 2، ثم 3، وهكذا، وعادةً ثلاثة مجسّات لكل قفزة. يجيب الراوتر الأول عن مجسّات TTL 1، والراوتر الثاني عن مجسّات TTL 2، وحين يصل مجسّ أخيراً إلى الوجهة تجيب الوجهة بدلاً منها: فالأداة \`traceroute\` في Linux ترسل مجسّات UDP إلى منافذ عالية (من 33434 صعوداً)، فترد الوجهة بـ **port unreachable**؛ أما \`tracert\` في Windows و\`traceroute -I\` فيستخدمان ICMP echo، فترد بـ echo reply؛ و\`traceroute -T\` يستخدم حزم TCP SYN التي تعبر كثيراً من الجدران النارية.

\`\`\`text
$ traceroute -n 198.51.100.20
traceroute to 198.51.100.20 (198.51.100.20), 30 hops max, 60 byte packets
 1  192.168.1.1     0.812 ms  0.701 ms  0.655 ms     <- راوترك
 2  10.10.0.1       8.102 ms  7.950 ms  8.311 ms     <- مزوّد الخدمة
 3  * * *                                            <- راوتر لا يجيب
 4  203.0.113.9    15.214 ms 14.902 ms 15.050 ms
 5  198.51.100.20  16.127 ms 16.301 ms 15.840 ms     <- الوجهة
\`\`\`

وقراءته تحتاج إلى عناية:

- \`* * *\` تعني "لا جواب خلال المهلة". فإذا **أجابت القفزات اللاحقة**، فذلك الراوتر يمرّر الحركة جيداً؛ لكنه لا يرسل ICMP، أو يحدّ من معدّله. وليس هو المشكلة.
- وإذا استمرت النجوم **حتى حد القفزات** (30 افتراضياً)، فإن الأثر ينقطع بعد آخر قفزة أجابت: فإما أن المسار معطوب هناك، وإما أن الوجهة (أو جداراً نارياً أمامها) تُسقط المجسّات. جرّب نوع مجسّ آخر قبل أن تلوم الشبكة.
- **القفزة في زمن الاستجابة التي تبقى** في كل القفزات اللاحقة تدل على رابط طويل أو مزدحم (كبل لمسافات بعيدة، أو وصلة صاعدة مزدحمة). أما القفزة البطيئة الوحيدة التي تليها قفزات سريعة فهي راوتر يجيب على ICMP ببطء بينما يمرّر الحركة بشكل طبيعي.
- قد يختلف مسار العودة عن مسار الذهاب، فتشمل الأزمنة مساراً لا تراه. والأداة \`mtr\` تجمع ping وtraceroute وتحدّث الفقد والتأخير لكل قفزة باستمرار، وهي أفضل للمشكلات المتقطعة.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: String.raw`# traceroute in miniature. Each router on the path decrements the TTL; the one that brings it
# to 0 answers "time exceeded". The destination answers "port unreachable" instead.
PATH = [
    ("192.168.1.1", 0.7),     # your router
    ("10.10.0.1", 8.1),       # the ISP
    (None, 12.0),             # forwards packets, but never sends ICMP
    ("203.0.113.9", 15.1),
    ("198.51.100.20", 16.2),  # the destination
]
DESTINATION = "198.51.100.20"


def probe(ttl):
    """Follow one probe along the path. Returns (who answered, rtt, why)."""
    for hop, (address, rtt) in enumerate(PATH, start=1):
        if address == DESTINATION:
            return address, rtt, "port unreachable: arrived"
        if hop == ttl:  # the TTL reaches 0 at this router
            return address, rtt, "time exceeded"
    return None, 0, "lost"


for ttl in range(1, 31):
    address, rtt, why = probe(ttl)
    if address is None:
        print("%2d  * * *" % ttl)
    else:
        print("%2d  %-14s %5.1f ms   %s" % (ttl, address, rtt, why))
    if address == DESTINATION:
        break
`,
      explanation: {
        en: "Probe 3 reaches the silent router and gets no answer, yet probes 4 and 5 travel through it: a silent hop is not a broken hop. Now break the path: delete the last two entries, so that nothing after the silent router delivers the probes, and watch the stars continue to the hop limit of 30.",
        ar: "يصل المجسّ 3 إلى الراوتر الصامت ولا يتلقى جواباً، ومع ذلك تعبره المجسّات 4 و5: فالقفزة الصامتة ليست قفزة معطوبة. والآن اكسر المسار: احذف المُدخلين الأخيرين، فلا يبقى بعد الراوتر الصامت ما يوصل المجسّات، وشاهد النجوم تستمر حتى حد القفزات البالغ 30.",
      },
    },
    {
      type: "lab",
      id: "trace-reader",
      lang: "javascript",
      prompt: {
        en: `Write a **traceroute reader** that summarises output produced with \`traceroute -n\`.

**Input:** the first line is the header \`traceroute to <name> (<ip>), ...\`; the destination is the address in parentheses. Every following line is a hop: its number, then either one address followed by up to three times (\`<ms> ms\`, or \`*\` for a probe that got no answer), or just \`* * *\`.

**Output**

1. One line per hop: \`hop <n>: <ip> avg <average of its times, 3 decimals> ms\`, or \`hop <n>: no reply\` if it has no address.
2. \`silent hops: <comma-separated hop numbers>\` for hops with no reply that come **before** the last hop that answered, or \`silent hops: none\`.
3. \`largest jump: hop <n> (+<increase, 3 decimals> ms)\`: the biggest **increase** of the average between two consecutive *answering* hops (skip the silent ones; on a tie keep the first), or \`largest jump: none\` if no average ever increases.
4. \`result: reached <ip> at hop <n>\` if the last answering hop is the destination; otherwise \`result: not reached, last reply from <ip> at hop <n>\`, or \`result: not reached, no replies\`.

**Example**

\`\`\`text
Input:
traceroute to 198.51.100.20 (198.51.100.20), 30 hops max, 60 byte packets
 1  192.168.1.1  0.812 ms  0.701 ms  0.655 ms
 2  10.10.0.1  8.102 ms  7.950 ms  8.311 ms
 3  * * *
 4  203.0.113.9  15.214 ms  14.902 ms  15.050 ms
 5  198.51.100.20  16.127 ms  16.301 ms  15.840 ms

Output:
hop 1: 192.168.1.1 avg 0.723 ms
hop 2: 10.10.0.1 avg 8.121 ms
hop 3: no reply
hop 4: 203.0.113.9 avg 15.055 ms
hop 5: 198.51.100.20 avg 16.089 ms
silent hops: 3
largest jump: hop 2 (+7.398 ms)
result: reached 198.51.100.20 at hop 5
\`\`\``,
        ar: `اكتب **قارئاً لمخرجات traceroute** يلخّص المخرجات الناتجة عن \`traceroute -n\`.

**الإدخال:** السطر الأول هو الترويسة \`traceroute to <name> (<ip>), ...\`؛ والوجهة هي العنوان بين القوسين. وكل سطر بعده قفزة: رقمها، ثم إما عنوان واحد يتبعه حتى ثلاثة أزمنة (\`<ms> ms\`، أو \`*\` لمجسّ لم يتلقَّ جواباً)، وإما \`* * *\` فقط.

**الإخراج**

1. سطر لكل قفزة: \`hop <n>: <ip> avg <متوسط أزمنتها بثلاث منازل> ms\`، أو \`hop <n>: no reply\` إن لم يكن لها عنوان.
2. \`silent hops: <أرقام القفزات مفصولة بفواصل>\` للقفزات التي لا جواب لها والتي تأتي **قبل** آخر قفزة أجابت، أو \`silent hops: none\`.
3. \`largest jump: hop <n> (+<الزيادة بثلاث منازل> ms)\`: أكبر **زيادة** في المتوسط بين قفزتين متتاليتين *من القفزات التي أجابت* (تجاوز الصامتة؛ وعند التعادل احتفظ بالأولى)، أو \`largest jump: none\` إن لم يزد المتوسط أبداً.
4. \`result: reached <ip> at hop <n>\` إذا كانت آخر قفزة أجابت هي الوجهة؛ وإلا \`result: not reached, last reply from <ip> at hop <n>\`، أو \`result: not reached, no replies\`.

**مثال**

\`\`\`text
الإدخال:
traceroute to 198.51.100.20 (198.51.100.20), 30 hops max, 60 byte packets
 1  192.168.1.1  0.812 ms  0.701 ms  0.655 ms
 2  10.10.0.1  8.102 ms  7.950 ms  8.311 ms
 3  * * *
 4  203.0.113.9  15.214 ms  14.902 ms  15.050 ms
 5  198.51.100.20  16.127 ms  16.301 ms  15.840 ms

الإخراج:
hop 1: 192.168.1.1 avg 0.723 ms
hop 2: 10.10.0.1 avg 8.121 ms
hop 3: no reply
hop 4: 203.0.113.9 avg 15.055 ms
hop 5: 198.51.100.20 avg 16.089 ms
silent hops: 3
largest jump: hop 2 (+7.398 ms)
result: reached 198.51.100.20 at hop 5
\`\`\``,
      },
      starterCode: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n").filter((l) => l.trim() !== "");

const header = /^traceroute to \S+ \(([^)]+)\)/.exec(lines[0] || "");
const destination = header ? header[1] : "";

const hops = []; // { n, ip, avg } where ip is null for a hop with no reply at all
for (const line of lines.slice(1)) {
  const tokens = line.trim().split(/\s+/);
  const n = Number(tokens[0]);
  let ip = null;
  const times = [];
  for (const tok of tokens.slice(1)) {
    if (tok === "*" || tok === "ms") continue;
    if (/^\d+(\.\d+)?$/.test(tok)) times.push(Number(tok));
    else ip = tok;
  }
  const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
  hops.push({ n, ip, avg });
}

for (const h of hops) {
  console.log("hop " + h.n + ": " + (h.ip === null ? "no reply" : h.ip + " avg " + h.avg.toFixed(3) + " ms"));
}

// TODO: silent hops (no reply, but BEFORE the last hop that answered)
// TODO: largest increase of the average between consecutive answering hops
// TODO: the result line (reached / not reached, last reply from ... / no replies)
console.log("result: reached " + destination);
`,
      solution: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n").filter((l) => l.trim() !== "");

const header = /^traceroute to \S+ \(([^)]+)\)/.exec(lines[0] || "");
const destination = header ? header[1] : "";

const hops = []; // { n, ip, avg } where ip is null for a hop with no reply at all
for (const line of lines.slice(1)) {
  const tokens = line.trim().split(/\s+/);
  const n = Number(tokens[0]);
  let ip = null;
  const times = [];
  for (const tok of tokens.slice(1)) {
    if (tok === "*" || tok === "ms") continue;
    if (/^\d+(\.\d+)?$/.test(tok)) times.push(Number(tok));
    else ip = tok;
  }
  const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
  hops.push({ n, ip, avg });
}

for (const h of hops) {
  console.log("hop " + h.n + ": " + (h.ip === null ? "no reply" : h.ip + " avg " + h.avg.toFixed(3) + " ms"));
}

const answered = hops.filter((h) => h.ip !== null);
const last = answered.length ? answered[answered.length - 1] : null;

// Silent hops: no reply, but a later hop did answer. They hide, they do not break the path.
const silent = hops.filter((h) => h.ip === null && last && h.n < last.n).map((h) => h.n);
console.log("silent hops: " + (silent.length ? silent.join(",") : "none"));

// Largest increase of the average between two consecutive answering hops.
let jump = null;
for (let i = 1; i < answered.length; i++) {
  const d = answered[i].avg - answered[i - 1].avg;
  if (d > 0 && (jump === null || d > jump.d)) jump = { n: answered[i].n, d };
}
console.log("largest jump: " + (jump ? "hop " + jump.n + " (+" + jump.d.toFixed(3) + " ms)" : "none"));

if (last && last.ip === destination) console.log("result: reached " + destination + " at hop " + last.n);
else if (last) console.log("result: not reached, last reply from " + last.ip + " at hop " + last.n);
else console.log("result: not reached, no replies");
`,
      hints: [
        { en: "Keep `answered = hops.filter((h) => h.ip !== null)` and `last` = its final element (or `null`). Silent hops are the ones with `ip === null` and `h.n < last.n`.", ar: "احتفظ بـ `answered = hops.filter((h) => h.ip !== null)` وبـ `last` وهو آخر عنصر فيها (أو `null`). والقفزات الصامتة هي التي فيها `ip === null` و`h.n < last.n`." },
        { en: "For the jump, loop over `answered` from index 1 and compare `answered[i].avg - answered[i - 1].avg`. Only keep a strictly larger positive difference, so ties keep the first one.", ar: "للقفزة في الزمن، امشِ على `answered` من الفهرس 1 وقارن `answered[i].avg - answered[i - 1].avg`. ولا تحتفظ إلا بفرق موجب أكبر تماماً، فيبقى الأول عند التعادل." },
        { en: "The path reached its target only if `last.ip === destination`. Hops after `last` with no reply are where the trail stops, not silent hops.", ar: "لا يكون المسار قد بلغ هدفه إلا إذا كان `last.ip === destination`. والقفزات التي بعد `last` ولا جواب لها هي موضع انقطاع الأثر، وليست قفزات صامتة." },
      ],
      tests: [
        {
          name: { en: "The worked example: a silent hop on a working path", ar: "المثال المحلول: قفزة صامتة على مسار يعمل" },
          stdin: "traceroute to 198.51.100.20 (198.51.100.20), 30 hops max, 60 byte packets\n 1  192.168.1.1  0.812 ms  0.701 ms  0.655 ms\n 2  10.10.0.1  8.102 ms  7.950 ms  8.311 ms\n 3  * * *\n 4  203.0.113.9  15.214 ms  14.902 ms  15.050 ms\n 5  198.51.100.20  16.127 ms  16.301 ms  15.840 ms\n",
          expected: "hop 1: 192.168.1.1 avg 0.723 ms\nhop 2: 10.10.0.1 avg 8.121 ms\nhop 3: no reply\nhop 4: 203.0.113.9 avg 15.055 ms\nhop 5: 198.51.100.20 avg 16.089 ms\nsilent hops: 3\nlargest jump: hop 2 (+7.398 ms)\nresult: reached 198.51.100.20 at hop 5\n",
        },
        {
          name: { en: "The trail goes cold after hop 3", ar: "ينقطع الأثر بعد القفزة 3" },
          stdin: "traceroute to www.example.com (192.0.2.80), 30 hops max, 60 byte packets\n 1  192.168.1.1  1.020 ms  0.950 ms  0.991 ms\n 2  100.64.0.1  9.870 ms  10.112 ms  9.954 ms\n 3  198.51.100.1  11.402 ms  11.380 ms  11.611 ms\n 4  * * *\n 5  * * *\n 6  * * *\n",
          expected: "hop 1: 192.168.1.1 avg 0.987 ms\nhop 2: 100.64.0.1 avg 9.979 ms\nhop 3: 198.51.100.1 avg 11.464 ms\nhop 4: no reply\nhop 5: no reply\nhop 6: no reply\nsilent hops: none\nlargest jump: hop 2 (+8.992 ms)\nresult: not reached, last reply from 198.51.100.1 at hop 3\n",
        },
        {
          name: { en: "Lost single probes, and a long link whose delay stays", ar: "مجسّات مفردة ضائعة، ورابط طويل يبقى تأخيره" },
          stdin: "traceroute to 203.0.113.50 (203.0.113.50), 30 hops max, 60 byte packets\n 1  10.0.0.1  0.511 ms  *  0.493 ms\n 2  192.0.2.254  12.100 ms  11.900 ms  *\n 3  198.51.100.66  95.300 ms  96.100 ms  95.800 ms\n 4  198.51.100.70  94.900 ms  95.200 ms  95.400 ms\n 5  203.0.113.50  96.200 ms  95.900 ms  96.000 ms\n",
          expected: "hop 1: 10.0.0.1 avg 0.502 ms\nhop 2: 192.0.2.254 avg 12.000 ms\nhop 3: 198.51.100.66 avg 95.733 ms\nhop 4: 198.51.100.70 avg 95.167 ms\nhop 5: 203.0.113.50 avg 96.033 ms\nsilent hops: none\nlargest jump: hop 3 (+83.733 ms)\nresult: reached 203.0.113.50 at hop 5\n",
        },
        {
          name: { en: "No reply from any hop", ar: "لا جواب من أي قفزة" },
          stdin: "traceroute to 192.0.2.7 (192.0.2.7), 30 hops max, 60 byte packets\n 1  * * *\n 2  * * *\n 3  * * *\n",
          expected: "hop 1: no reply\nhop 2: no reply\nhop 3: no reply\nsilent hops: none\nlargest jump: none\nresult: not reached, no replies\n",
        },
        {
          name: { en: "Averages that only go down: no jump", ar: "متوسطات تنخفض فقط: لا قفزة" },
          stdin: "traceroute to 203.0.113.80 (203.0.113.80), 30 hops max, 60 byte packets\n 1  192.168.1.1  5.000 ms  5.000 ms  5.000 ms\n 2  10.0.0.1  4.000 ms  4.500 ms  4.250 ms\n 3  203.0.113.80  3.900 ms  4.000 ms  4.100 ms\n",
          expected: "hop 1: 192.168.1.1 avg 5.000 ms\nhop 2: 10.0.0.1 avg 4.250 ms\nhop 3: 203.0.113.80 avg 4.000 ms\nsilent hops: none\nlargest jump: none\nresult: reached 203.0.113.80 at hop 3\n",
        },
      ],
      sampleInput: "traceroute to 198.51.100.20 (198.51.100.20), 30 hops max, 60 byte packets\n 1  192.168.1.1  0.812 ms  0.701 ms  0.655 ms\n 2  10.10.0.1  8.102 ms  7.950 ms  8.311 ms\n 3  * * *\n 4  203.0.113.9  15.214 ms  14.902 ms  15.050 ms\n 5  198.51.100.20  16.127 ms  16.301 ms  15.840 ms\n",
    },
    {
      type: "text",
      body: {
        en: `## Steps 4 and 5: the name and the service

**The name.** If \`ping 192.0.2.80\` works but \`ping www.example.com\` fails, the problem is DNS. Ask directly and compare resolvers:

\`\`\`text
$ dig +short www.example.com              # your configured resolver
$ dig @192.0.2.53 www.example.com         # a specific server: same answer?
$ nslookup www.example.com                # also available on Windows
$ getent hosts www.example.com            # what programs see, /etc/hosts included
\`\`\`

\`resolvectl status\` (on systems with systemd-resolved) or \`/etc/resolv.conf\` tells you which resolver you are using. Read the status as in the DNS lesson: NXDOMAIN is a wrong or missing name, SERVFAIL a broken zone or DNSSEC failure, and a timeout means you cannot reach the resolver at all. A stale entry in \`/etc/hosts\` overrides DNS, a classic source of "it works on my machine".

**The service.** The name resolves and the host answers, but the application still fails. On the **server**, check that the program listens, on which address, and which process owns the socket:

\`\`\`text
$ ss -tlnp
State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port  Process
LISTEN  0       511           0.0.0.0:80          0.0.0.0:*      users:(("nginx",pid=901,fd=6))
LISTEN  0       4096        127.0.0.1:5432        0.0.0.0:*      users:(("postgres",pid=812,fd=6))
\`\`\`

The flags mean TCP (\`-t\`), listening (\`-l\`), numeric (\`-n\`) and processes (\`-p\`); \`ss -tn\` shows established connections. The **local address** matters: \`0.0.0.0\` (or \`[::]\`) accepts connections on every interface, while \`127.0.0.1\` only accepts them **from the same machine**. Here PostgreSQL cannot be reached from another host at all, by design or by mistake. On older systems \`netstat -tlnp\` gives the same information, and on Windows \`netstat -ano\`.

From the **client**, test the port itself: \`nc -vz 192.0.2.80 443\` or \`curl -v https://www.example.com/\`. Remember the TCP lesson: **"connection refused"** means the host answered with RST (nothing listens on that port), while a **timeout** means nothing answered (a firewall dropping packets, a wrong address or a broken route).`,
        ar: `## الخطوتان 4 و5: الاسم والخدمة

**الاسم.** إذا نجح \`ping 192.0.2.80\` وفشل \`ping www.example.com\` فالمشكلة في DNS. اسأل مباشرة وقارن بين المحلّلات:

\`\`\`text
$ dig +short www.example.com              # المحلّل المضبوط لديك
$ dig @192.0.2.53 www.example.com         # خادم بعينه: هل الجواب نفسه؟
$ nslookup www.example.com                # متاح في Windows أيضاً
$ getent hosts www.example.com            # ما تراه البرامج، بما فيه /etc/hosts
\`\`\`

الأمر \`resolvectl status\` (في الأنظمة التي تستخدم systemd-resolved) أو الملف \`/etc/resolv.conf\` يخبرك أي محلّل تستخدم. واقرأ الحالة كما في درس DNS: NXDOMAIN اسم خاطئ أو غير موجود، وSERVFAIL منطقة معطوبة أو فشل في DNSSEC، وانتهاء المهلة يعني أنك لا تصل إلى المحلّل أصلاً. والمُدخل القديم في \`/etc/hosts\` يتقدم على DNS، وهو مصدر كلاسيكي لعبارة "يعمل على جهازي".

**الخدمة.** الاسم يُحلّ والجهاز يجيب، لكن التطبيق ما زال يفشل. على **الخادم** تحقق من أن البرنامج يستمع، وعلى أي عنوان، وأي عملية تملك المقبس:

\`\`\`text
$ ss -tlnp
State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port  Process
LISTEN  0       511           0.0.0.0:80          0.0.0.0:*      users:(("nginx",pid=901,fd=6))
LISTEN  0       4096        127.0.0.1:5432        0.0.0.0:*      users:(("postgres",pid=812,fd=6))
\`\`\`

الخيارات تعني TCP (\`-t\`)، والاستماع (\`-l\`)، والأرقام (\`-n\`)، والعمليات (\`-p\`)؛ و\`ss -tn\` يعرض الاتصالات القائمة. و**العنوان المحلي** مهم: \`0.0.0.0\` (أو \`[::]\`) يقبل الاتصالات على كل الواجهات، بينما \`127.0.0.1\` لا يقبلها إلا **من الجهاز نفسه**. فهنا لا يمكن الوصول إلى PostgreSQL من جهاز آخر إطلاقاً، عن قصد أو عن خطأ. وفي الأنظمة الأقدم يعطي \`netstat -tlnp\` المعلومات نفسها، وفي Windows \`netstat -ano\`.

ومن **العميل** اختبر المنفذ نفسه: \`nc -vz 192.0.2.80 443\` أو \`curl -v https://www.example.com/\`. وتذكّر درس TCP: **"connection refused"** تعني أن الجهاز أجاب بـ RST (لا شيء يستمع على ذلك المنفذ)، أما **انتهاء المهلة** فيعني أن لا شيء أجاب (جدار ناري يُسقط الحزم، أو عنوان خاطئ، أو مسار معطوب).`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: String.raw`// Read "ss -tlnp" output (a made-up server) and say who can reach each service.
const output = [
  'State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port  Process',
  'LISTEN  0       511           0.0.0.0:80          0.0.0.0:*      users:(("nginx",pid=901,fd=6))',
  'LISTEN  0       128           0.0.0.0:22          0.0.0.0:*      users:(("sshd",pid=640,fd=3))',
  'LISTEN  0       4096        127.0.0.1:5432        0.0.0.0:*      users:(("postgres",pid=812,fd=6))',
  'LISTEN  0       511              [::]:80             [::]:*      users:(("nginx",pid=901,fd=7))',
  'LISTEN  0       4096     127.0.0.53%lo:53         0.0.0.0:*      users:(("systemd-resolve",pid=520,fd=14))',
  'LISTEN  0       128       192.0.2.10:8080         0.0.0.0:*      users:(("java",pid=1337,fd=40))',
];

output.slice(1).forEach(function (line) {
  const cols = line.trim().split(/\s+/);
  const local = cols[3];
  const cut = local.lastIndexOf(":");
  const address = local.slice(0, cut);
  const port = local.slice(cut + 1);
  const program = /\("([^"]+)"/.exec(cols[5])[1];
  let who;
  if (address === "0.0.0.0" || address === "[::]" || address === "*") who = "every interface";
  else if (address.startsWith("127.") || address === "[::1]" || address.includes("%lo")) who = "this machine only";
  else who = "only via " + address;
  console.log(program.padEnd(16) + "port " + port.padEnd(6) + who);
});
`,
      explanation: {
        en: "The address before the last colon decides who can connect. nginx and sshd accept connections on every interface (IPv4 and, for nginx, IPv6 too), PostgreSQL and the local DNS stub only accept them from the machine itself, and the Java service only on one address. When a service works locally but not from outside, this is the first thing to check, before the firewall. Add a line that listens on [::1]:6379 and predict the result.",
        ar: "العنوان الذي يسبق النقطتين الأخيرتين يحدد من يستطيع الاتصال. فـ nginx وsshd يقبلان الاتصالات على كل الواجهات (IPv4، وIPv6 أيضاً في حالة nginx)، وPostgreSQL ومحلّل DNS المحلي لا يقبلانها إلا من الجهاز نفسه، وخدمة Java على عنوان واحد فقط. وحين تعمل خدمة محلياً ولا تعمل من الخارج فهذا أول ما تفحصه، قبل الجدار الناري. أضف سطراً يستمع على [::1]:6379 وتوقّع النتيجة.",
      },
    },
    {
      type: "text",
      body: {
        en: `## When the tools disagree: read the packets

Sometimes every tool says "fine" and the application still fails. Then you look at what actually crosses the wire with **tcpdump** (command line, available on almost every server) or **Wireshark** (graphical, with decoders for hundreds of protocols). Both read and write the same \`.pcap\` files, so a common workflow is to capture on a server with \`tcpdump -w capture.pcap\` and open the file in Wireshark on your laptop.

Filters keep captures small and readable, and the two tools use **different filter languages**:

- **Capture filters** (BPF syntax, used by tcpdump and in Wireshark's capture dialog) decide what is recorded at all: \`tcpdump -i eth0 -n host 192.0.2.10 and port 443\`.
- **Display filters** (Wireshark only) hide packets that were already captured: \`ip.addr == 192.0.2.10 && tcp.port == 443\`, \`dns\`, \`tcp.flags.syn == 1 && tcp.flags.ack == 0\` (connection attempts) or \`tcp.analysis.retransmission\`.

A tcpdump line, read with \`-n\` so no names are looked up:

\`\`\`text
12:00:00.000000 IP 192.0.2.10.51514 > 203.0.113.80.443: Flags [S], seq 1000, win 64240, length 0
12:00:00.023412 IP 203.0.113.80.443 > 192.0.2.10.51514: Flags [S.], seq 5000, ack 1001, win 65160, length 0
12:00:00.023500 IP 192.0.2.10.51514 > 203.0.113.80.443: Flags [.], ack 5001, win 502, length 0
12:00:00.030000 IP 192.0.2.10.51520 > 203.0.113.80.22: Flags [S], seq 77, win 64240, length 0
12:00:00.030950 IP 203.0.113.80.22 > 192.0.2.10.51520: Flags [R.], seq 0, ack 78, win 0, length 0
\`\`\`

Each line is: timestamp, protocol, \`source.port > destination.port\`, then the TCP **flags**: \`S\` SYN, \`F\` FIN, \`P\` push, \`R\` RST, and \`.\` for ACK. So \`[S]\` is a connection attempt, \`[S.]\` the SYN-ACK, \`[.]\` a plain ACK and \`[R.]\` a reset. The first three lines are a complete handshake to port 443 (the SYN-ACK came back after 23.4 ms); the last two are a refusal from port 22. A third pattern is the one behind timeouts: the same SYN repeated after about 1, 2 and 4 seconds (the retransmission timeout doubling each time) with nothing coming back. With TLS you will not see the content of the conversation, only who talked to whom, when and how much, which is often enough to find the fault.`,
        ar: `## حين تختلف الأدوات: اقرأ الحزم

أحياناً تقول كل الأدوات "سليم" ومع ذلك يفشل التطبيق. عندها تنظر إلى ما يعبر السلك فعلاً بـ **tcpdump** (من سطر الأوامر، ومتاح على كل خادم تقريباً) أو **Wireshark** (برسوم، ومعه مفكّكات لمئات البروتوكولات). وكلاهما يقرأ ملفات \`.pcap\` نفسها ويكتبها، فمن أساليب العمل الشائعة أن تلتقط على الخادم بـ \`tcpdump -w capture.pcap\` ثم تفتح الملف في Wireshark على حاسوبك المحمول.

المرشّحات (filters) تُبقي الالتقاط صغيراً ومقروءاً، والأداتان تستخدمان **لغتي ترشيح مختلفتين**:

- **مرشّحات الالتقاط** (بصيغة BPF، يستخدمها tcpdump ونافذة الالتقاط في Wireshark) تقرر ما يُسجَّل أصلاً: \`tcpdump -i eth0 -n host 192.0.2.10 and port 443\`.
- **مرشّحات العرض** (في Wireshark وحده) تخفي حزماً التُقطت من قبل: \`ip.addr == 192.0.2.10 && tcp.port == 443\`، و\`dns\`، و\`tcp.flags.syn == 1 && tcp.flags.ack == 0\` (محاولات الاتصال) أو \`tcp.analysis.retransmission\`.

وهذا سطر tcpdump يُقرأ مع \`-n\` حتى لا يُبحث عن أي أسماء:

\`\`\`text
12:00:00.000000 IP 192.0.2.10.51514 > 203.0.113.80.443: Flags [S], seq 1000, win 64240, length 0
12:00:00.023412 IP 203.0.113.80.443 > 192.0.2.10.51514: Flags [S.], seq 5000, ack 1001, win 65160, length 0
12:00:00.023500 IP 192.0.2.10.51514 > 203.0.113.80.443: Flags [.], ack 5001, win 502, length 0
12:00:00.030000 IP 192.0.2.10.51520 > 203.0.113.80.22: Flags [S], seq 77, win 64240, length 0
12:00:00.030950 IP 203.0.113.80.22 > 192.0.2.10.51520: Flags [R.], seq 0, ack 78, win 0, length 0
\`\`\`

كل سطر هو: الطابع الزمني، والبروتوكول، و\`source.port > destination.port\`، ثم **أعلام** TCP: \`S\` لـ SYN، و\`F\` لـ FIN، و\`P\` لـ push، و\`R\` لـ RST، و\`.\` لـ ACK. فـ \`[S]\` محاولة اتصال، و\`[S.]\` هو SYN-ACK، و\`[.]\` إقرار عادي، و\`[R.]\` إعادة تعيين (reset). والأسطر الثلاثة الأولى مصافحة كاملة إلى المنفذ 443 (عاد SYN-ACK بعد 23.4 ملّي ثانية)؛ والسطران الأخيران رفض من المنفذ 22. وهناك نمط ثالث هو ما يقف خلف انتهاء المهلة: SYN نفسه يتكرر بعد نحو 1 ثم 2 ثم 4 ثوانٍ (مهلة إعادة الإرسال تتضاعف كل مرة) ولا يعود شيء. ومع TLS لن ترى محتوى الحوار، بل من تحدث مع من، ومتى، وبأي قدر، وكثيراً ما يكفي ذلك لإيجاد العطل.`,
      },
    },
    {
      type: "lab",
      id: "handshake-outcome",
      lang: "rust",
      prompt: {
        en: `Read **tcpdump** output and report how every TCP connection attempt ended.

**Input:** lines in the format of \`tcpdump -n\`. Only lines like this matter (ignore all others, such as ARP or UDP lines):

\`\`\`text
<HH:MM:SS.micro> IP <src-ip>.<src-port> > <dst-ip>.<dst-port>: Flags [<flags>], ...
\`\`\`

The flags contain \`S\` for SYN, \`R\` for RST and \`.\` for ACK (other letters may appear and can be ignored). All timestamps are on the same day.

**Rules**

- A packet whose flags contain \`S\` but not \`.\` is a **SYN** from a client. The first SYN for a (client, server) pair starts an **attempt**; later SYNs for the same pair, while it is still undecided, are retries.
- A packet from that server back to that client whose flags contain \`S\` and \`.\` (a SYN-ACK) makes the attempt \`established\`. One whose flags contain \`R\` makes it \`refused\`. Once decided, an attempt does not change.

**Output**, one line per attempt in order of its first SYN:

- \`<client> -> <server>: established (SYN-ACK after <ms> ms)\`, with the time from the **first** SYN, in milliseconds with three decimals;
- \`<client> -> <server>: refused (RST)\`;
- \`<client> -> <server>: no answer (<n> SYN)\` for one SYN, or \`(<n> SYNs)\` for several.

**Example**

\`\`\`text
Input:
12:00:00.000000 IP 192.0.2.10.51514 > 203.0.113.80.443: Flags [S], seq 1000, win 64240, length 0
12:00:00.023412 IP 203.0.113.80.443 > 192.0.2.10.51514: Flags [S.], seq 5000, ack 1001, win 65160, length 0
12:00:00.030000 IP 192.0.2.10.51520 > 203.0.113.80.22: Flags [S], seq 77, win 64240, length 0
12:00:00.030950 IP 203.0.113.80.22 > 192.0.2.10.51520: Flags [R.], seq 0, ack 78, win 0, length 0

Output:
192.0.2.10.51514 -> 203.0.113.80.443: established (SYN-ACK after 23.412 ms)
192.0.2.10.51520 -> 203.0.113.80.22: refused (RST)
\`\`\``,
        ar: `اقرأ مخرجات **tcpdump** وأبلغ كيف انتهت كل محاولة اتصال TCP.

**الإدخال:** أسطر بصيغة \`tcpdump -n\`. ولا تهم إلا الأسطر التي تشبه هذا (وتجاهل كل ما عداها، مثل أسطر ARP أو UDP):

\`\`\`text
<HH:MM:SS.micro> IP <src-ip>.<src-port> > <dst-ip>.<dst-port>: Flags [<flags>], ...
\`\`\`

تحتوي الأعلام \`S\` لـ SYN، و\`R\` لـ RST، و\`.\` لـ ACK (وقد تظهر أحرف أخرى يمكن تجاهلها). وكل الطوابع الزمنية في اليوم نفسه.

**القواعد**

- الحزمة التي تحتوي أعلامها \`S\` دون \`.\` هي **SYN** من عميل. وأول SYN لزوج (عميل، خادم) يبدأ **محاولة**؛ وأي SYN لاحق للزوج نفسه، ما دامت المحاولة لم تُحسم، هو إعادة محاولة.
- الحزمة من ذلك الخادم عائدةً إلى ذلك العميل وأعلامها تحتوي \`S\` و\`.\` (أي SYN-ACK) تجعل المحاولة \`established\`. والتي تحتوي أعلامها \`R\` تجعلها \`refused\`. وبعد الحسم لا تتغير المحاولة.

**الإخراج**، سطر لكل محاولة بترتيب أول SYN لها:

- \`<client> -> <server>: established (SYN-ACK after <ms> ms)\`، والزمن محسوب من **أول** SYN، بالملّي ثانية وبثلاث منازل عشرية؛
- \`<client> -> <server>: refused (RST)\`؛
- \`<client> -> <server>: no answer (<n> SYN)\` لـ SYN واحد، أو \`(<n> SYNs)\` لعدة.

**مثال**

\`\`\`text
الإدخال:
12:00:00.000000 IP 192.0.2.10.51514 > 203.0.113.80.443: Flags [S], seq 1000, win 64240, length 0
12:00:00.023412 IP 203.0.113.80.443 > 192.0.2.10.51514: Flags [S.], seq 5000, ack 1001, win 65160, length 0
12:00:00.030000 IP 192.0.2.10.51520 > 203.0.113.80.22: Flags [S], seq 77, win 64240, length 0
12:00:00.030950 IP 203.0.113.80.22 > 192.0.2.10.51520: Flags [R.], seq 0, ack 78, win 0, length 0

الإخراج:
192.0.2.10.51514 -> 203.0.113.80.443: established (SYN-ACK after 23.412 ms)
192.0.2.10.51520 -> 203.0.113.80.22: refused (RST)
\`\`\``,
      },
      starterCode: String.raw`use std::io::{self, Read};

struct Attempt {
    client: String,
    server: String,
    first_syn: u64, // microseconds since midnight
    syns: u32,
    outcome: Option<String>,
}

/// "12:00:01.250000" -> microseconds since midnight.
fn micros(stamp: &str) -> Option<u64> {
    let (hms, frac) = stamp.split_once('.')?;
    let parts: Vec<u64> = hms.split(':').map(|p| p.parse().ok()).collect::<Option<Vec<u64>>>()?;
    if parts.len() != 3 || frac.len() != 6 {
        return None;
    }
    Some(((parts[0] * 60 + parts[1]) * 60 + parts[2]) * 1_000_000 + frac.parse::<u64>().ok()?)
}

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let mut attempts: Vec<Attempt> = Vec::new();

    for line in input.lines() {
        // 12:00:00.000000 IP 192.0.2.10.51514 > 203.0.113.80.443: Flags [S], seq 1000, ...
        let t: Vec<&str> = line.split_whitespace().collect();
        if t.len() < 7 || t[1] != "IP" || t[3] != ">" || t[5] != "Flags" {
            continue;
        }
        let Some(time) = micros(t[0]) else { continue };
        let src = t[2];
        let dst = t[4].trim_end_matches(':');
        let flags = t[6].trim_start_matches('[').trim_end_matches(',').trim_end_matches(']');
        let syn = flags.contains('S');
        let ack = flags.contains('.');
        let rst = flags.contains('R');

        if syn && !ack {
            // TODO: a retry for an undecided attempt with the same client and server only adds 1 to 'syns'
            attempts.push(Attempt { client: src.to_string(), server: dst.to_string(), first_syn: time, syns: 1, outcome: None });
        }
        // TODO: a SYN-ACK (syn && ack) or a RST from the server back to the client decides a pending attempt.
        // Use time.saturating_sub(a.first_syn) for the delay in microseconds.
        let _ = (ack, rst);
    }

    for a in &attempts {
        let outcome = match &a.outcome {
            Some(o) => o.clone(),
            None => format!("no answer ({} SYN{})", a.syns, if a.syns == 1 { "" } else { "s" }),
        };
        println!("{} -> {}: {}", a.client, a.server, outcome);
    }
}
`,
      solution: String.raw`use std::io::{self, Read};

struct Attempt {
    client: String,
    server: String,
    first_syn: u64, // microseconds since midnight
    syns: u32,
    outcome: Option<String>,
}

/// "12:00:01.250000" -> microseconds since midnight.
fn micros(stamp: &str) -> Option<u64> {
    let (hms, frac) = stamp.split_once('.')?;
    let parts: Vec<u64> = hms.split(':').map(|p| p.parse().ok()).collect::<Option<Vec<u64>>>()?;
    if parts.len() != 3 || frac.len() != 6 {
        return None;
    }
    Some(((parts[0] * 60 + parts[1]) * 60 + parts[2]) * 1_000_000 + frac.parse::<u64>().ok()?)
}

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let mut attempts: Vec<Attempt> = Vec::new();

    for line in input.lines() {
        // 12:00:00.000000 IP 192.0.2.10.51514 > 203.0.113.80.443: Flags [S], seq 1000, ...
        let t: Vec<&str> = line.split_whitespace().collect();
        if t.len() < 7 || t[1] != "IP" || t[3] != ">" || t[5] != "Flags" {
            continue;
        }
        let Some(time) = micros(t[0]) else { continue };
        let src = t[2];
        let dst = t[4].trim_end_matches(':');
        let flags = t[6].trim_start_matches('[').trim_end_matches(',').trim_end_matches(']');
        let syn = flags.contains('S');
        let ack = flags.contains('.');
        let rst = flags.contains('R');

        if syn && !ack {
            // A client opens (or retries) a connection.
            match attempts.iter_mut().find(|a| a.client == src && a.server == dst) {
                Some(a) => {
                    if a.outcome.is_none() {
                        a.syns += 1;
                    }
                }
                None => attempts.push(Attempt { client: src.to_string(), server: dst.to_string(), first_syn: time, syns: 1, outcome: None }),
            }
        } else if let Some(a) = attempts.iter_mut().find(|a| a.client == dst && a.server == src && a.outcome.is_none()) {
            // The server answers the client.
            if syn && ack {
                let waited = time.saturating_sub(a.first_syn);
                a.outcome = Some(format!("established (SYN-ACK after {}.{:03} ms)", waited / 1000, waited % 1000));
            } else if rst {
                a.outcome = Some("refused (RST)".to_string());
            }
        }
    }

    for a in &attempts {
        let outcome = match &a.outcome {
            Some(o) => o.clone(),
            None => format!("no answer ({} SYN{})", a.syns, if a.syns == 1 { "" } else { "s" }),
        };
        println!("{} -> {}: {}", a.client, a.server, outcome);
    }
}
`,
      hints: [
        { en: "Before pushing a new attempt, search with `attempts.iter_mut().find(|a| a.client == src && a.server == dst)`. If one exists and is still undecided, increase `syns` instead.", ar: "قبل أن تضيف محاولة جديدة، ابحث بـ `attempts.iter_mut().find(|a| a.client == src && a.server == dst)`. فإن وُجدت ولم تُحسم بعد، فزِد `syns` بدلاً من ذلك." },
        { en: "A reply travels the other way: look for an attempt with `a.client == dst && a.server == src && a.outcome.is_none()`.", ar: "الرد يسير في الاتجاه المعاكس: ابحث عن محاولة فيها `a.client == dst && a.server == src && a.outcome.is_none()`." },
        { en: "Keep the time in whole microseconds and format without floats: `format!(\"{}.{:03}\", waited / 1000, waited % 1000)` prints 23412 µs as `23.412`.", ar: "احتفظ بالزمن بالميكروثواني الصحيحة ونسّقه دون أعداد عشرية عائمة: `format!(\"{}.{:03}\", waited / 1000, waited % 1000)` يطبع 23412 ميكروثانية على شكل `23.412`." },
      ],
      tests: [
        {
          name: { en: "The worked example plus the client's final ACK", ar: "المثال المحلول مع إقرار العميل الأخير" },
          stdin: "12:00:00.000000 IP 192.0.2.10.51514 > 203.0.113.80.443: Flags [S], seq 1000, win 64240, options [mss 1460], length 0\n12:00:00.023412 IP 203.0.113.80.443 > 192.0.2.10.51514: Flags [S.], seq 5000, ack 1001, win 65160, options [mss 1460], length 0\n12:00:00.023500 IP 192.0.2.10.51514 > 203.0.113.80.443: Flags [.], ack 5001, win 502, length 0\n12:00:00.030000 IP 192.0.2.10.51520 > 203.0.113.80.22: Flags [S], seq 77, win 64240, length 0\n12:00:00.030950 IP 203.0.113.80.22 > 192.0.2.10.51520: Flags [R.], seq 0, ack 78, win 0, length 0\n",
          expected: "192.0.2.10.51514 -> 203.0.113.80.443: established (SYN-ACK after 23.412 ms)\n192.0.2.10.51520 -> 203.0.113.80.22: refused (RST)\n",
        },
        {
          name: { en: "Retransmitted SYNs: one attempt times out, one succeeds on the retry", ar: "SYN يُعاد إرساله: محاولة تنتهي مهلتها وأخرى تنجح عند الإعادة" },
          stdin: "08:15:59.900000 IP 192.0.2.10.40001 > 198.51.100.9.5432: Flags [S], seq 1, win 64240, length 0\n08:16:00.920000 IP 192.0.2.10.40001 > 198.51.100.9.5432: Flags [S], seq 1, win 64240, length 0\n08:16:02.960000 IP 192.0.2.10.40001 > 198.51.100.9.5432: Flags [S], seq 1, win 64240, length 0\n08:16:03.000000 IP 192.0.2.10.40002 > 198.51.100.9.443: Flags [S], seq 9, win 64240, length 0\n08:16:04.010000 IP 192.0.2.10.40002 > 198.51.100.9.443: Flags [S], seq 9, win 64240, length 0\n08:16:04.052001 IP 198.51.100.9.443 > 192.0.2.10.40002: Flags [S.], seq 3, ack 10, win 65160, length 0\n",
          expected: "192.0.2.10.40001 -> 198.51.100.9.5432: no answer (3 SYNs)\n192.0.2.10.40002 -> 198.51.100.9.443: established (SYN-ACK after 1052.001 ms)\n",
        },
        {
          name: { en: "ECN flags, a reset after the handshake, and a single unanswered SYN", ar: "أعلام ECN، وإعادة تعيين بعد المصافحة، وSYN واحد بلا جواب" },
          stdin: "10:00:00.000000 IP 192.0.2.10.50000 > 203.0.113.5.80: Flags [SEW], seq 10, win 64240, length 0\n10:00:00.000400 IP 203.0.113.5.80 > 192.0.2.10.50000: Flags [S.E], seq 20, ack 11, win 65160, length 0\n10:00:00.001000 IP 192.0.2.10.50001 > 203.0.113.6.80: Flags [S], seq 30, win 64240, length 0\n10:00:00.002000 IP 203.0.113.6.80 > 192.0.2.10.50001: Flags [R.], seq 0, ack 31, win 0, length 0\n10:00:00.003000 IP 203.0.113.5.80 > 192.0.2.10.50000: Flags [R], seq 21, win 0, length 0\n10:00:00.500000 IP 192.0.2.10.50002 > 203.0.113.7.443: Flags [S], seq 40, win 64240, length 0\n",
          expected: "192.0.2.10.50000 -> 203.0.113.5.80: established (SYN-ACK after 0.400 ms)\n192.0.2.10.50001 -> 203.0.113.6.80: refused (RST)\n192.0.2.10.50002 -> 203.0.113.7.443: no answer (1 SYN)\n",
        },
        {
          name: { en: "No TCP at all: ARP and DNS lines print nothing", ar: "لا TCP إطلاقاً: أسطر ARP وDNS لا تطبع شيئاً" },
          stdin: "09:00:00.000000 ARP, Request who-has 192.0.2.1 tell 192.0.2.10, length 28\n09:00:00.100000 IP 192.0.2.10.53530 > 192.0.2.53.53: 4721+ A? www.example.com. (33)\n09:00:00.110000 IP 192.0.2.53.53 > 192.0.2.10.53530: 4721 1/0/0 A 192.0.2.80 (49)\n",
          expected: "",
        },
        {
          name: { en: "Microseconds are kept exactly", ar: "الميكروثواني تُحفظ بدقة" },
          stdin: "23:59:59.990000 IP 192.0.2.10.50010 > 203.0.113.9.443: Flags [S], seq 1, win 64240, length 0\n23:59:59.999999 IP 203.0.113.9.443 > 192.0.2.10.50010: Flags [S.], seq 2, ack 2, win 65160, length 0\n",
          expected: "192.0.2.10.50010 -> 203.0.113.9.443: established (SYN-ACK after 9.999 ms)\n",
        },
      ],
      sampleInput: "12:00:00.000000 IP 192.0.2.10.51514 > 203.0.113.80.443: Flags [S], seq 1000, win 64240, length 0\n12:00:00.023412 IP 203.0.113.80.443 > 192.0.2.10.51514: Flags [S.], seq 5000, ack 1001, win 65160, length 0\n12:00:00.030000 IP 192.0.2.10.51520 > 203.0.113.80.22: Flags [S], seq 77, win 64240, length 0\n12:00:00.030950 IP 203.0.113.80.22 > 192.0.2.10.51520: Flags [R.], seq 0, ack 78, win 0, length 0\n",
    },
    {
      type: "text",
      body: {
        en: `## The method in practice

**"The website does not load."** \`ip link\` shows the interface up, \`ip addr\` shows \`192.168.1.10/24\`, and \`ip route\` has a default route. \`ping 192.168.1.1\` works: link, address and gateway are fine. \`ping 192.0.2.80\` (the site's address) works too, so routing is fine. \`dig www.example.com\` returns SERVFAIL, and \`dig @192.0.2.53 www.example.com\` with another resolver returns the right address. The fault is your resolver, not the site: switch resolvers or report it, and stop looking at cables.

**"The app cannot reach the database."** On the database server, \`ss -tlnp\` shows PostgreSQL on \`127.0.0.1:5432\`, so it only accepts local connections. From the app server, \`nc -vz 10.0.0.5 5432\` says "connection refused" (a reply: the host is up, nothing listens on that address). Fix the listen address, then check that the firewall allows port 5432 from the app server only.

**"Some uploads hang."** Ping and small requests work, but large transfers stall. A capture shows big segments sent again and again with no ACK. Small packets pass and large ones vanish: a classic **MTU** problem, often on a VPN or tunnel where something blocks the ICMP messages that would tell the sender to use smaller packets.

Each case followed the same path: bottom up, one test per layer, and a packet capture only when the simple tools could not explain what was happening.`,
        ar: `## المنهج عملياً

**"الموقع لا يُحمَّل."** يُظهر \`ip link\` أن الواجهة تعمل، ويُظهر \`ip addr\` العنوان \`192.168.1.10/24\`، وفي \`ip route\` مسار افتراضي. وينجح \`ping 192.168.1.1\`: الرابط والعنوان والبوابة سليمة. وينجح \`ping 192.0.2.80\` (عنوان الموقع) أيضاً، فالتوجيه سليم. ويعيد \`dig www.example.com\` الحالة SERVFAIL، بينما يعيد \`dig @192.0.2.53 www.example.com\` بمحلّل آخر العنوان الصحيح. فالعطل في محلّلك لا في الموقع: بدّل المحلّل أو أبلغ عنه، وتوقّف عن فحص الكبلات.

**"التطبيق لا يصل إلى قاعدة البيانات."** على خادم قاعدة البيانات يُظهر \`ss -tlnp\` أن PostgreSQL على \`127.0.0.1:5432\`، فهو لا يقبل إلا الاتصالات المحلية. ومن خادم التطبيق يقول \`nc -vz 10.0.0.5 5432\` إن "connection refused" (أي هناك رد: الجهاز يعمل، ولا شيء يستمع على ذلك العنوان). أصلح عنوان الاستماع، ثم تحقق من أن الجدار الناري يسمح بالمنفذ 5432 من خادم التطبيق وحده.

**"بعض عمليات الرفع تعلق."** ينجح ping والطلبات الصغيرة، لكن عمليات النقل الكبيرة تتوقف. ويُظهر الالتقاط مقاطع كبيرة تُرسل مرة بعد مرة دون أي إقرار. فالحزم الصغيرة تعبر والكبيرة تختفي: وهذه مشكلة **MTU** كلاسيكية، وكثيراً ما تحدث في VPN أو نفق يحجب فيه شيءٌ ما رسائل ICMP التي كانت ستخبر المرسل بأن يستخدم حزماً أصغر.

وكل حالة سلكت الطريق نفسه: من الأسفل إلى الأعلى، واختبار واحد لكل طبقة، والتقاط الحزم فقط حين عجزت الأدوات البسيطة عن تفسير ما يحدث.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Your laptop has the address 169.254.37.12. What is the most likely problem?", ar: "عنوان حاسوبك المحمول هو 169.254.37.12. ما المشكلة الأرجح؟" },
          choices: [
            { en: "The DNS server is down", ar: "خادم DNS متوقف" },
            { en: "The laptop did not get an address from DHCP and assigned itself a link-local one", ar: "لم يحصل الحاسوب على عنوان من DHCP فأعطى نفسه عنواناً محلياً للرابط" },
            { en: "The website is blocking you", ar: "الموقع يحجبك" },
            { en: "Your ISP gave you a public address", ar: "أعطاك مزوّد الخدمة عنواناً عاماً" },
          ],
          answer: 1,
          explain: {
            en: "Addresses in 169.254.0.0/16 are IPv4 link-local addresses (RFC 3927) that a host picks for itself when DHCP gives no answer. Check the link, the Wi-Fi association and the DHCP server before anything at higher layers: without a proper address and gateway, DNS and websites cannot work.",
            ar: "العناوين في 169.254.0.0/16 عناوين IPv4 محلية للرابط (RFC 3927) يختارها الجهاز لنفسه حين لا يجيبه DHCP. افحص الرابط وارتباط Wi-Fi وخادم DHCP قبل أي شيء في الطبقات الأعلى: فمن دون عنوان صحيح وبوابة لا يمكن أن يعمل DNS ولا المواقع.",
          },
        },
        {
          q: { en: "In a traceroute, hop 4 shows `* * *` but hops 5 to 9 answer normally and the destination is reached. What does hop 4 tell you?", ar: "في مخرجات traceroute تُظهر القفزة 4 القيمة `* * *` لكن القفزات من 5 إلى 9 تجيب طبيعياً وتُبلغ الوجهة. ماذا تخبرك القفزة 4؟" },
          choices: [
            { en: "The connection is broken at hop 4", ar: "الاتصال معطوب عند القفزة 4" },
            { en: "Hop 4 is overloaded and loses all traffic", ar: "القفزة 4 مثقلة وتفقد كل الحركة" },
            { en: "That router forwards packets but does not send ICMP time-exceeded replies (or rate-limits them)", ar: "ذلك الراوتر يمرّر الحزم لكنه لا يرسل ردود ICMP time exceeded (أو يحدّ من معدلها)" },
            { en: "The destination is lying about its address", ar: "الوجهة تكذب بشأن عنوانها" },
          ],
          answer: 2,
          explain: {
            en: "Later hops could only answer if their probes passed through hop 4, so it forwards traffic. It simply does not answer probes that expire on it, which many routers do on purpose. Only stars that continue to the end of the trace point at a real break or at filtering near the destination.",
            ar: "ما كان للقفزات اللاحقة أن تجيب لولا أن مجسّاتها عبرت القفزة 4، فهي تمرّر الحركة. لكنها لا تجيب عن المجسّات التي تنتهي صلاحيتها عندها، وكثير من الراوترات يفعل ذلك عن قصد. والنجوم التي تستمر حتى نهاية التتبع هي وحدها ما يشير إلى انقطاع حقيقي أو إلى ترشيح قرب الوجهة.",
          },
        },
        {
          q: { en: "`ss -tlnp` on a server shows a service on `127.0.0.1:8080`. A colleague on another machine cannot connect. Why?", ar: "يُظهر `ss -tlnp` على خادم خدمةً على `127.0.0.1:8080`. وزميل على جهاز آخر لا يستطيع الاتصال. لماذا؟" },
          choices: [
            { en: "Port 8080 is reserved for the operating system", ar: "المنفذ 8080 محجوز لنظام التشغيل" },
            { en: "The service needs a DNS name before it accepts connections", ar: "الخدمة تحتاج إلى اسم DNS قبل أن تقبل الاتصالات" },
            { en: "TCP does not work on port 8080", ar: "TCP لا يعمل على المنفذ 8080" },
            { en: "It listens on the loopback address, so it only accepts connections from the same machine", ar: "إنها تستمع على عنوان الاسترجاع (loopback)، فلا تقبل إلا الاتصالات من الجهاز نفسه" },
          ],
          answer: 3,
          explain: {
            en: "127.0.0.1 is the loopback address: only programs on the same machine can reach it. To accept connections from the network the service must listen on 0.0.0.0 (all interfaces) or on the server's network address, and then the firewall must allow the port. 8080 is an ordinary registered port.",
            ar: "العنوان 127.0.0.1 هو عنوان الاسترجاع: لا تصل إليه إلا البرامج على الجهاز نفسه. ولقبول الاتصالات من الشبكة يجب أن تستمع الخدمة على 0.0.0.0 (كل الواجهات) أو على عنوان الخادم في الشبكة، ثم يجب أن يسمح الجدار الناري بالمنفذ. و8080 منفذ مسجَّل عادي.",
          },
        },
        {
          q: { en: "A capture shows the same `Flags [S]` packet to port 443 sent four times, with gaps of about 1, 2 and 4 seconds, and nothing comes back. What does that mean?", ar: "يُظهر الالتقاط الحزمة `Flags [S]` نفسها إلى المنفذ 443 مرسلة أربع مرات، بفواصل تقارب 1 ثم 2 ثم 4 ثوانٍ، ولا يعود شيء. ماذا يعني ذلك؟" },
          choices: [
            { en: "Nothing answered the SYN: a firewall drops it, the address is wrong or the route is broken", ar: "لم يُجب أحد عن SYN: جدار ناري يُسقطه، أو العنوان خاطئ، أو المسار معطوب" },
            { en: "The server refused the connection", ar: "رفض الخادم الاتصال" },
            { en: "The handshake completed but TLS failed", ar: "اكتملت المصافحة لكن TLS فشل" },
            { en: "The client is sending too much data", ar: "العميل يرسل بيانات أكثر من اللازم" },
          ],
          answer: 0,
          explain: {
            en: "A refusal would show a RST coming back, and a completed handshake a SYN-ACK. Repeated SYNs with growing gaps are TCP retransmitting because it heard nothing, which ends in a timeout. That points to silent drops or a wrong destination, not to the application.",
            ar: "الرفض كان سيُظهر RST عائداً، والمصافحة المكتملة كانت ستُظهر SYN-ACK. أما SYN المتكرر بفواصل متزايدة فهو TCP يعيد الإرسال لأنه لم يسمع شيئاً، وينتهي ذلك بانتهاء المهلة. وهذا يشير إلى إسقاط صامت أو وجهة خاطئة، لا إلى التطبيق.",
          },
        },
        {
          q: { en: "Which statement about tcpdump and Wireshark filters is correct?", ar: "أي عبارة عن مرشّحات tcpdump وWireshark صحيحة؟" },
          choices: [
            { en: "Both tools use exactly the same filter syntax everywhere", ar: "الأداتان تستخدمان صيغة المرشّحات نفسها تماماً في كل مكان" },
            { en: "Capture filters (BPF, like `host 192.0.2.10 and port 443`) decide what is recorded; Wireshark display filters (like `tcp.port == 443`) only hide packets already captured", ar: "مرشّحات الالتقاط (BPF، مثل `host 192.0.2.10 and port 443`) تقرر ما يُسجَّل؛ ومرشّحات العرض في Wireshark (مثل `tcp.port == 443`) تخفي فقط حزماً التُقطت من قبل" },
            { en: "Display filters reduce the size of the capture file on disk", ar: "مرشّحات العرض تقلّص حجم ملف الالتقاط على القرص" },
            { en: "Filters can decrypt TLS traffic", ar: "المرشّحات تستطيع فك تشفير حركة TLS" },
          ],
          answer: 1,
          explain: {
            en: "Capture filters use the BPF language and run while capturing, so filtered packets are never stored. Display filters are Wireshark's own richer language and only change what you see. No filter decrypts TLS; without the session keys you only see metadata.",
            ar: "مرشّحات الالتقاط تستخدم لغة BPF وتعمل أثناء الالتقاط، فالحزم المرشَّحة لا تُخزَّن أبداً. أما مرشّحات العرض فلغة Wireshark الخاصة الأغنى، ولا تغيّر إلا ما تراه. ولا يوجد مرشّح يفك تشفير TLS؛ فمن دون مفاتيح الجلسة لا ترى إلا البيانات الوصفية.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap

- Troubleshoot **bottom up**: link (\`ip link\`), address (\`ip addr\`, \`ip route\`), route (\`ping\`, \`traceroute\`), name (\`dig\`, \`nslookup\`), service (\`ss\`, \`curl -v\`, \`nc -vz\`). Change one thing at a time.
- **ping**: gaps in icmp_seq are loss, time and mdev show delay and jitter, DUP! means duplicates, and no reply does not prove the host is down.
- **traceroute** uses TTL expiry; \`* * *\` followed by answering hops is harmless; a delay that stays from one hop onward shows a long or busy link.
- **ss** shows what listens and on which address: \`127.0.0.1\` is local only. "Refused" means RST came back; a timeout means nothing did.
- **tcpdump** and **Wireshark** show the truth on the wire: \`[S]\`, \`[S.]\`, \`[.]\`, \`[R.]\`. Capture only where you are allowed to.

**Practice next:** on your own machine, run \`ping -c 5\` to your router, \`traceroute -n\` to a site you use, and \`ss -tlnp\`, and explain every line. Then capture your own DNS queries with \`sudo tcpdump -n -i any port 53\` while you browse. Next lesson: Wi-Fi, VPNs and firewalls.`,
        ar: `## الخلاصة

- شخّص **من الأسفل إلى الأعلى**: الرابط (\`ip link\`)، والعنوان (\`ip addr\` و\`ip route\`)، والمسار (\`ping\` و\`traceroute\`)، والاسم (\`dig\` و\`nslookup\`)، والخدمة (\`ss\` و\`curl -v\` و\`nc -vz\`). وغيّر شيئاً واحداً في كل مرة.
- **ping**: الفجوات في icmp_seq فقد، وtime وmdev يُظهران التأخير والارتعاش، وDUP! تعني ردوداً مكررة، وغياب الرد لا يثبت أن الجهاز متوقف.
- **traceroute** يستخدم انتهاء TTL؛ و\`* * *\` التي تليها قفزات تجيب لا ضرر منها؛ والتأخير الذي يبقى من قفزة فصاعداً يدل على رابط طويل أو مزدحم.
- **ss** يُظهر ما يستمع وعلى أي عنوان: \`127.0.0.1\` محلي فقط. و"Refused" تعني أن RST عاد؛ وانتهاء المهلة يعني أن لا شيء عاد.
- **tcpdump** و**Wireshark** يُظهران الحقيقة على السلك: \`[S]\` و\`[S.]\` و\`[.]\` و\`[R.]\`. ولا تلتقط إلا حيث يُسمح لك.

**تدرّب بعد ذلك:** على جهازك نفّذ \`ping -c 5\` إلى راوترك، و\`traceroute -n\` إلى موقع تستخدمه، و\`ss -tlnp\`، واشرح كل سطر. ثم التقط استعلامات DNS الخاصة بك بالأمر \`sudo tcpdump -n -i any port 53\` أثناء التصفح. والدرس التالي: Wi-Fi والشبكات الافتراضية الخاصة والجدران النارية.`,
      },
    },
  ],
};
