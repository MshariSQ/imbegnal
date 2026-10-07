import type { Lesson, LabTest } from "../types";

// Test data for the checksum lab. 1400 bytes (about one Ethernet payload) following a simple
// rule, so the input is easy to reproduce: byte i is i mod 251.
const checksumBigHex = Array.from({ length: 1400 }, (_, i) => (i % 251).toString(16).padStart(2, "0")).join("");

// Test data for the ACK lab: 500 segments of 100 bytes that arrive in exactly reverse order.
const reverseSegments = Array.from({ length: 500 }, (_, i) => (499 - i) * 100 + " 100");
const reverseAcks = Array.from({ length: 500 }, (_, i) => (i < 499 ? "ack=0" : "ack=50000"));

const checksumTests: LabTest[] = [
  {
    name: { en: "The example from RFC 1071", ar: "المثال الوارد في RFC 1071" },
    stdin: "0001f203f4f5f6f7\n",
    expected: "checksum=0x220d\n",
  },
  {
    name: { en: "An IPv4 header: checksum field zeroed, then filled in (verifies to zero)", ar: "ترويسة IPv4: حقل الفحص صفر، ثم معبّأ (يتحقق بصفر)" },
    stdin: "450000730000400040110000c0a80001c0a800c7\n45000073000040004011b861c0a80001c0a800c7\n",
    expected: "checksum=0xb861\nchecksum=0x0000\n",
  },
  {
    name: { en: "An odd number of bytes is padded with a zero byte", ar: "عدد فردي من البايتات يُحشى ببايت صفري" },
    stdin: "ff\nabcdef\n",
    expected: "checksum=0x00ff\nchecksum=0x6531\n",
  },
  {
    name: { en: "All zeros and all ones", ar: "كل البتات أصفار وكلها واحدات" },
    stdin: "00000000\nffffffff\n",
    expected: "checksum=0xffff\nchecksum=0x0000\n",
  },
  {
    name: { en: "Invalid hex is reported and blank lines are skipped", ar: "النص الست عشري غير الصالح يُبلَّغ عنه والأسطر الفارغة تُتجاهل" },
    stdin: "xyz1\n\nabc\n",
    expected: "error: invalid hex\nerror: invalid hex\n",
  },
  {
    name: { en: "1400 bytes of data (many carries to fold)", ar: "1400 بايت من البيانات (حمل كثير يجب طيّه)" },
    stdin: checksumBigHex + "\n",
    expected: "checksum=0xd408\n",
  },
];

const ackTests: LabTest[] = [
  {
    name: { en: "Segments arrive in order", ar: "وصول المقاطع بالترتيب" },
    stdin: "1000\n1000 100\n1100 100\n1200 50\n",
    expected: "ack=1100\nack=1200\nack=1250\n",
  },
  {
    name: { en: "One segment is lost and arrives late: duplicate ACKs, then a jump", ar: "فقدان مقطع ووصوله متأخراً: إقرارات مكررة ثم قفزة" },
    stdin: "1000\n1000 100\n1200 100\n1300 100\n1400 100\n1100 100\n",
    expected: "ack=1100\nack=1100\nack=1100\nack=1100\nack=1500\n",
  },
  {
    name: { en: "A retransmission that overlaps already received bytes", ar: "إعادة إرسال تتداخل مع بايتات استُلمت سابقاً" },
    stdin: "5000\n5000 100\n5050 100\n5000 100\n5300 50\n5150 150\n",
    expected: "ack=5100\nack=5150\nack=5150\nack=5150\nack=5350\n",
  },
  {
    name: { en: "A complete duplicate does not move the ACK", ar: "تكرار كامل لا يحرّك الإقرار" },
    stdin: "0\n0 10\n0 10\n10 10\n",
    expected: "ack=10\nack=10\nack=20\n",
  },
  {
    name: { en: "No segments: nothing is printed", ar: "لا مقاطع: لا يُطبع شيء" },
    stdin: "42\n",
    expected: "",
  },
  {
    name: { en: "500 segments arriving in reverse order", ar: "500 مقطع تصل بترتيب معكوس" },
    stdin: "0\n" + reverseSegments.join("\n") + "\n",
    expected: reverseAcks.join("\n") + "\n",
  },
];

export const lesson: Lesson = {
  nodeId: "transport-tcp-udp",
  title: { en: "TCP, UDP & Ports — Conversations Between Programs", ar: "TCP وUDP والمنافذ — حوارات بين البرامج" },
  estMinutes: 42,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- What a **port** is and how one server can talk to thousands of clients on the same port
- How **UDP** works: small, fast and fire-and-forget
- How **TCP** works: the **three-way handshake**, sequence and acknowledgment numbers, retransmission, flow control, congestion control, and closing a connection
- How to detect corrupted data with the **Internet checksum**
- How to choose between TCP and UDP
- You will build three tools: a TCP **state machine**, a **cumulative-ACK** receiver and a checksum calculator

## The apartment building and the phone call 📞

The IP address gets a packet to the right **building**. But a building has many apartments, and each one is a different program: your browser, your music app, your chat client. The **port number** is the apartment number. IP delivers to the computer; the transport layer delivers to the right program on it.

Now compare two ways of talking. **UDP** is like shouting a message through a window or dropping a postcard in the mailbox: quick, no setup, but you never learn whether it arrived, and two postcards can arrive in the wrong order. **TCP** is like a phone call: you dial, the other side picks up and says hello, you both know the line works, you talk in order, anything garbled gets repeated ("sorry, say that again?"), and at the end you both say goodbye. The call costs a little more effort, but you can trust what you hear.`,
        ar: `## ماذا ستتعلم

- ما هو **المنفذ (port)** وكيف يستطيع خادم واحد التحدث مع آلاف العملاء على المنفذ نفسه
- كيف يعمل **UDP**: صغير وسريع و"أرسل وانسَ"
- كيف يعمل **TCP**: **المصافحة الثلاثية (three-way handshake)**، وأرقام التسلسل والإقرار، وإعادة الإرسال، والتحكم في التدفق، والتحكم في الازدحام، وإغلاق الاتصال
- كيف تكتشف تلف البيانات بـ **Internet checksum**
- كيف تختار بين TCP وUDP
- ستبني ثلاث أدوات: **آلة حالات (state machine)** لـ TCP، ومستقبِلاً يرسل **إقراراً تراكمياً (cumulative ACK)**، وحاسبة checksum

## العمارة السكنية والمكالمة الهاتفية 📞

عنوان IP يوصل الحزمة إلى **العمارة** الصحيحة. لكن في العمارة شقق كثيرة، وكل شقة برنامج مختلف: متصفحك، وتطبيق الموسيقى، وتطبيق المحادثة. و**رقم المنفذ** هو رقم الشقة. IP يسلّم إلى الحاسوب، وطبقة النقل تسلّم إلى البرنامج الصحيح فيه.

قارن الآن بين طريقتين للتخاطب. **UDP** مثل أن تصيح برسالة من نافذة أو تُلقي بطاقة بريدية في صندوق: سريع وبلا تجهيز، لكنك لا تعرف أبداً هل وصلت، وقد تصل بطاقتان بترتيب خاطئ. أما **TCP** فمثل مكالمة هاتفية: تتصل، فيرد الطرف الآخر ويقول مرحباً، وتعرفان أن الخط يعمل، وتتحدثان بالترتيب، وأي كلام مشوَّش يُعاد ("عفواً، أعد ما قلت؟")، وفي النهاية يودّع كل منكما الآخر. المكالمة تكلّف جهداً أكبر قليلاً، لكنك تثق بما تسمعه.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Ports and sockets

A port is a **16-bit** number, so it ranges from 0 to 65535. IANA divides the range by convention:

- **0 to 1023, well-known (system) ports**: standard services. \`22\` SSH, \`25\` SMTP, \`53\` DNS, \`80\` HTTP, \`123\` NTP, \`443\` HTTPS. On Unix-like systems, listening on them normally requires elevated privileges.
- **1024 to 49151, registered ports**: applications such as \`3306\` MySQL, \`5432\` PostgreSQL and \`8080\` (a common alternative for HTTP).
- **49152 to 65535, dynamic / ephemeral ports**: handed out by your operating system as the *source* port of outgoing connections. (Linux by default uses 32768-60999, so do not be surprised by other numbers.)

A server **listens** on a well-known port. A client picks a free ephemeral port for itself and connects. A **socket** is one endpoint: an IP address plus a port, for example \`203.0.113.80:443\`. A TCP connection is identified by **both** endpoints together with the protocol, the **5-tuple**:

\`\`\`text
(protocol, source IP, source port, destination IP, destination port)
\`\`\`

That is how a web server handles thousands of clients on one port, 443. Every client has a different source IP or source port, so every 5-tuple is different. TCP port 53 and UDP port 53 are also completely separate. You can see what your machine is listening on with \`ss -tuln\` (TCP and UDP, listening, numeric) on Linux.`,
        ar: `## المنافذ والمقابس (sockets)

المنفذ رقم من **16 بتاً**، فمداه من 0 إلى 65535. وتقسّم IANA هذا المدى بالاصطلاح:

- **من 0 إلى 1023، المنافذ المعروفة (well-known / system)**: للخدمات القياسية. \`22\` لـ SSH و\`25\` لـ SMTP و\`53\` لـ DNS و\`80\` لـ HTTP و\`123\` لـ NTP و\`443\` لـ HTTPS. وفي أنظمة شبيهة بـ Unix يتطلب الاستماع عليها عادةً صلاحيات مرتفعة.
- **من 1024 إلى 49151، المنافذ المسجّلة (registered)**: للتطبيقات مثل \`3306\` لـ MySQL و\`5432\` لـ PostgreSQL و\`8080\` (بديل شائع لـ HTTP).
- **من 49152 إلى 65535، المنافذ الديناميكية / المؤقتة (ephemeral)**: يعطيها نظام التشغيل كمنفذ *مصدر* للاتصالات الصادرة. (وفي Linux يكون المدى الافتراضي 32768-60999، فلا تستغرب أرقاماً أخرى.)

الخادم **يستمع (listens)** على منفذ معروف. والعميل يختار لنفسه منفذاً مؤقتاً حراً ويتصل. و**المقبس (socket)** هو طرف واحد: عنوان IP مع منفذ، مثل \`203.0.113.80:443\`. واتصال TCP يتحدد بالطرفين **معاً** مع البروتوكول، وهو ما يسمى **5-tuple**:

\`\`\`text
(protocol, source IP, source port, destination IP, destination port)
\`\`\`

هكذا يخدم خادم ويب آلاف العملاء على منفذ واحد هو 443. فلكل عميل عنوان مصدر أو منفذ مصدر مختلف، فيختلف الـ 5-tuple في كل اتصال. ومنفذ TCP رقم 53 ومنفذ UDP رقم 53 منفصلان تماماً أيضاً. ويمكنك أن ترى ما يستمع عليه حاسوبك بالأمر \`ss -tuln\` (TCP وUDP، الاستماع، أرقام) في Linux.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: String.raw`SERVICES = {22: "SSH", 25: "SMTP", 53: "DNS", 80: "HTTP", 123: "NTP", 443: "HTTPS"}


def port_kind(port):
    if port <= 1023:
        return "well-known"
    if port <= 49151:
        return "registered"
    return "dynamic/ephemeral"


for port in (22, 80, 443, 3306, 8080, 51514):
    print(str(port).rjust(5), port_kind(port).ljust(18), SERVICES.get(port, "-"))

# One server port, three different clients: every 5-tuple is unique.
connections = {
    ("TCP", "198.51.100.10", 51514, "203.0.113.80", 443),
    ("TCP", "198.51.100.10", 51515, "203.0.113.80", 443),  # same client, new source port
    ("TCP", "198.51.100.77", 51514, "203.0.113.80", 443),  # other client, same source port
}
print(len(connections), "distinct connections, all to server port 443")
`,
      explanation: {
        en: "Ports below 1024 are the well-known service ports and 49152 and above are the dynamic range. The three connections share the server's IP and port 443, yet none of them clashes with another, because the source IP or source port differs. Try adding a fourth tuple that repeats an existing one and see that a set keeps only one: two identical 5-tuples cannot exist at the same time.",
        ar: "المنافذ تحت 1024 هي منافذ الخدمات المعروفة، و49152 وما فوقها هي المدى الديناميكي. الاتصالات الثلاثة تتشارك عنوان IP الخادم والمنفذ 443، ومع ذلك لا يتعارض أيٌّ منها مع غيره لأن عنوان المصدر أو منفذ المصدر يختلف. جرّب إضافة tuple رابعة تكرر واحدة موجودة وانظر كيف تحتفظ المجموعة (set) بواحدة فقط: لا يمكن أن يوجد 5-tuple متطابقان في الوقت نفسه.",
      },
    },
    {
      type: "text",
      body: {
        en: `## UDP: send it and forget it

**UDP** (User Datagram Protocol) is the thin protocol. Its header is only **8 bytes**: source port, destination port, length and checksum (16 bits each). That is all. UDP does not set up a connection, does not number or re-send data and does not slow down when the network is busy. Each \`sendto\` becomes one self-contained **datagram** whose boundaries are preserved; datagrams may be lost, duplicated or reordered, and it is the application's job to cope.

Why would anyone want that? Because no handshake means no delay, and because for some traffic an old packet is worthless. In a voice call, a retransmitted packet that arrives a second late is garbage; a short glitch is better than waiting. UDP is used for **DNS** queries (one small question, one small answer), **DHCP**, **NTP**, live audio and video, online games, and **QUIC** (the transport under HTTP/3, which builds its own reliability on top of UDP). If you send UDP to a port where nobody listens, the destination usually answers with an ICMP "port unreachable" message.

## TCP: a reliable stream

**TCP** (Transmission Control Protocol) gives programs a **reliable, ordered stream of bytes** over an unreliable network. It does that with a bigger header (**20 bytes** minimum), whose main fields are:

- **source port** and **destination port** (16 bits each)
- **sequence number** (32 bits): the number of the first data byte in this segment. TCP numbers *bytes*, not packets
- **acknowledgment number** (32 bits): the next byte the sender of this segment expects to receive
- **flags**: \`SYN\` (start), \`ACK\` (acknowledging), \`FIN\` (done sending), \`RST\` (abort), and more
- **window size** (16 bits): how much more data the receiver can accept
- **checksum** (16 bits), and optional **options**

### Opening: the three-way handshake

Before any data flows, both sides agree on their starting sequence numbers (the **ISN**, chosen unpredictably for security):

\`\`\`text
Client                                   Server
  |---- SYN      seq=100 ------------------->|
  |<--- SYN+ACK  seq=300 ack=101 ------------|
  |---- ACK      seq=101 ack=301 ------------>|
\`\`\`

1. The client sends **SYN** with its initial number (100).
2. The server answers **SYN+ACK**: its own initial number (300) and \`ack=101\`, "I got your SYN, I expect byte 101 next". A SYN uses up one sequence number.
3. The client confirms with **ACK** (\`ack=301\`). Now both sides are **ESTABLISHED**.

### Closing: FIN in each direction

Each direction is closed separately. The side that is done sends **FIN**, the other side acknowledges it; later the other side sends its own FIN and gets acknowledged. The side that closed first then waits in **TIME_WAIT** (about a minute on Linux, twice the maximum segment lifetime) so late stray packets cannot be mistaken for a new connection. A connection can also be aborted at once with **RST**; that is what a machine sends back when you connect to a TCP port nobody is listening on, and what you see as "connection refused".`,
        ar: `## UDP: أرسِل وانسَ

**UDP** (بروتوكول بيانات المستخدم) هو البروتوكول الرفيع. ترويسته **8 بايتات** فقط: منفذ المصدر ومنفذ الوجهة والطول وchecksum (16 بتاً لكل منها). هذا كل شيء. UDP لا يبني اتصالاً، ولا يرقّم البيانات ولا يعيد إرسالها، ولا يبطئ حين تزدحم الشبكة. كل استدعاء \`sendto\` يصبح **datagram** مكتفياً بذاته وتُحفظ حدوده؛ وقد تضيع الـ datagrams أو تتكرر أو تتبدل ترتيباتها، وعلى التطبيق أن يتعامل مع ذلك.

لماذا يريد أحد ذلك؟ لأن غياب المصافحة يعني غياب التأخير، ولأن الحزمة القديمة في بعض أنواع الحركة بلا قيمة. في مكالمة صوتية، حزمة أُعيد إرسالها ووصلت متأخرة ثانية كاملة هي ضجيج؛ وانقطاع قصير أفضل من الانتظار. يُستخدم UDP في استعلامات **DNS** (سؤال صغير وجواب صغير)، و**DHCP**، و**NTP**، والصوت والفيديو المباشرين، وألعاب الإنترنت، و**QUIC** (طبقة النقل تحت HTTP/3 وهو يبني موثوقيته الخاصة فوق UDP). وإذا أرسلت UDP إلى منفذ لا يستمع عليه أحد فالوجهة ترد عادةً برسالة ICMP من نوع "port unreachable".

## TCP: تدفق موثوق

يعطي **TCP** (بروتوكول التحكم بالنقل) البرامج **تدفقاً موثوقاً ومرتباً من البايتات** فوق شبكة غير موثوقة. ويفعل ذلك بترويسة أكبر (**20 بايتاً** على الأقل)، وأهم حقولها:

- **منفذ المصدر** و**منفذ الوجهة** (16 بتاً لكل منهما)
- **رقم التسلسل (sequence number)** (32 بتاً): رقم أول بايت بيانات في هذا المقطع. TCP يرقّم *البايتات* لا الحزم
- **رقم الإقرار (acknowledgment number)** (32 بتاً): البايت التالي الذي يتوقع مرسل هذا المقطع أن يستقبله
- **الأعلام (flags)**: \`SYN\` (بدء)، و\`ACK\` (إقرار)، و\`FIN\` (انتهيت من الإرسال)، و\`RST\` (إلغاء)، وغيرها
- **حجم النافذة (window)** (16 بتاً): كم من البيانات يستطيع المستقبِل أن يقبل بعد
- **checksum** (16 بتاً)، و**options** اختيارية

### الفتح: المصافحة الثلاثية

قبل أن تتدفق أي بيانات يتفق الطرفان على أرقام التسلسل الابتدائية (**ISN**، وتُختار بشكل غير متوقَّع لأسباب أمنية):

\`\`\`text
Client                                   Server
  |---- SYN      seq=100 ------------------->|
  |<--- SYN+ACK  seq=300 ack=101 ------------|
  |---- ACK      seq=101 ack=301 ------------>|
\`\`\`

1. يرسل العميل **SYN** برقمه الابتدائي (100).
2. يرد الخادم بـ **SYN+ACK**: رقمه الابتدائي (300) و\`ack=101\`، أي "استلمت SYN الخاص بك وأتوقع البايت 101 تالياً". والـ SYN يستهلك رقم تسلسل واحداً.
3. يؤكد العميل بـ **ACK** (\`ack=301\`). والآن صار الطرفان في حالة **ESTABLISHED**.

### الإغلاق: FIN في كل اتجاه

يُغلق كل اتجاه على حدة. الطرف الذي انتهى يرسل **FIN** ويقرّ به الطرف الآخر؛ ثم يرسل الطرف الآخر FIN الخاص به ويُقَرّ به. وبعدها ينتظر الطرف الذي أغلق أولاً في حالة **TIME_WAIT** (نحو دقيقة في Linux، أي ضعف أقصى عمر للمقطع) حتى لا تُحسب حزم متأخرة شاردة على أنها اتصال جديد. ويمكن أيضاً إلغاء الاتصال فوراً بـ **RST**؛ وهذا ما يعيده الجهاز حين تتصل بمنفذ TCP لا يستمع عليه أحد، وهو ما تراه على شكل "connection refused".`,
      },
    },
    {
      type: "lab",
      id: "tcp-state-machine",
      lang: "python",
      prompt: {
        en: `Model a **TCP endpoint** as a state machine. It starts in \`CLOSED\`. Each input line is one **event**. After each event print the new state, or an error if that event is not allowed in the current state.

Allowed transitions (this is a simplified version of the real diagram; anything not listed is an error):

- \`CLOSED\`: \`listen\` goes to \`LISTEN\`; \`connect\` goes to \`SYN_SENT\`
- \`LISTEN\`: \`recv SYN\` goes to \`SYN_RECEIVED\`; \`close\` goes to \`CLOSED\`
- \`SYN_SENT\`: \`recv SYN+ACK\` goes to \`ESTABLISHED\`; \`close\` goes to \`CLOSED\`
- \`SYN_RECEIVED\`: \`recv ACK\` goes to \`ESTABLISHED\`; \`close\` goes to \`FIN_WAIT_1\`
- \`ESTABLISHED\`: \`close\` goes to \`FIN_WAIT_1\`; \`recv FIN\` goes to \`CLOSE_WAIT\`
- \`FIN_WAIT_1\`: \`recv ACK\` goes to \`FIN_WAIT_2\`; \`recv FIN\` goes to \`CLOSING\`
- \`FIN_WAIT_2\`: \`recv FIN\` goes to \`TIME_WAIT\`
- \`CLOSING\`: \`recv ACK\` goes to \`TIME_WAIT\`
- \`CLOSE_WAIT\`: \`close\` goes to \`LAST_ACK\`
- \`LAST_ACK\`: \`recv ACK\` goes to \`CLOSED\`
- \`TIME_WAIT\`: \`timeout\` goes to \`CLOSED\`

**Output**, one line per event (blank lines are skipped): \`<event> -> <STATE>\`. For a disallowed event print \`<event> -> error (stays <STATE>)\` and keep the current state.

**Example**

\`\`\`text
Input:
connect
recv SYN+ACK
recv SYN

Output:
connect -> SYN_SENT
recv SYN+ACK -> ESTABLISHED
recv SYN -> error (stays ESTABLISHED)
\`\`\``,
        ar: `نمذِج **طرف اتصال TCP** على شكل آلة حالات. تبدأ في الحالة \`CLOSED\`. كل سطر إدخال هو **حدث (event)** واحد. بعد كل حدث اطبع الحالة الجديدة، أو خطأ إن كان الحدث غير مسموح في الحالة الحالية.

الانتقالات المسموحة (نسخة مبسّطة من المخطط الحقيقي؛ وكل ما لم يُذكر فهو خطأ):

- \`CLOSED\`: الحدث \`listen\` ينقل إلى \`LISTEN\`؛ و\`connect\` ينقل إلى \`SYN_SENT\`
- \`LISTEN\`: الحدث \`recv SYN\` ينقل إلى \`SYN_RECEIVED\`؛ و\`close\` ينقل إلى \`CLOSED\`
- \`SYN_SENT\`: الحدث \`recv SYN+ACK\` ينقل إلى \`ESTABLISHED\`؛ و\`close\` ينقل إلى \`CLOSED\`
- \`SYN_RECEIVED\`: الحدث \`recv ACK\` ينقل إلى \`ESTABLISHED\`؛ و\`close\` ينقل إلى \`FIN_WAIT_1\`
- \`ESTABLISHED\`: الحدث \`close\` ينقل إلى \`FIN_WAIT_1\`؛ و\`recv FIN\` ينقل إلى \`CLOSE_WAIT\`
- \`FIN_WAIT_1\`: الحدث \`recv ACK\` ينقل إلى \`FIN_WAIT_2\`؛ و\`recv FIN\` ينقل إلى \`CLOSING\`
- \`FIN_WAIT_2\`: الحدث \`recv FIN\` ينقل إلى \`TIME_WAIT\`
- \`CLOSING\`: الحدث \`recv ACK\` ينقل إلى \`TIME_WAIT\`
- \`CLOSE_WAIT\`: الحدث \`close\` ينقل إلى \`LAST_ACK\`
- \`LAST_ACK\`: الحدث \`recv ACK\` ينقل إلى \`CLOSED\`
- \`TIME_WAIT\`: الحدث \`timeout\` ينقل إلى \`CLOSED\`

**الإخراج**، سطر لكل حدث (وتُتجاهل الأسطر الفارغة): \`<event> -> <STATE>\`. وللحدث غير المسموح اطبع \`<event> -> error (stays <STATE>)\` وأبقِ الحالة الحالية.

**مثال**

\`\`\`text
الإدخال:
connect
recv SYN+ACK
recv SYN

الإخراج:
connect -> SYN_SENT
recv SYN+ACK -> ESTABLISHED
recv SYN -> error (stays ESTABLISHED)
\`\`\``,
      },
      starterCode: String.raw`import sys

# (state, event) -> next state
# TODO: add every transition listed in the prompt
TRANSITIONS = {
    ("CLOSED", "listen"): "LISTEN",
    ("CLOSED", "connect"): "SYN_SENT",
}

state = "CLOSED"
for line in sys.stdin:
    event = line.strip()
    if not event:
        continue
    # TODO: look up (state, event). If it exists, move to the next state and print
    # "<event> -> <STATE>"; otherwise print "<event> -> error (stays <STATE>)"
`,
      solution: String.raw`import sys

# (state, event) -> next state
TRANSITIONS = {
    ("CLOSED", "listen"): "LISTEN",
    ("CLOSED", "connect"): "SYN_SENT",
    ("LISTEN", "recv SYN"): "SYN_RECEIVED",
    ("LISTEN", "close"): "CLOSED",
    ("SYN_SENT", "recv SYN+ACK"): "ESTABLISHED",
    ("SYN_SENT", "close"): "CLOSED",
    ("SYN_RECEIVED", "recv ACK"): "ESTABLISHED",
    ("SYN_RECEIVED", "close"): "FIN_WAIT_1",
    ("ESTABLISHED", "close"): "FIN_WAIT_1",
    ("ESTABLISHED", "recv FIN"): "CLOSE_WAIT",
    ("FIN_WAIT_1", "recv ACK"): "FIN_WAIT_2",
    ("FIN_WAIT_1", "recv FIN"): "CLOSING",
    ("FIN_WAIT_2", "recv FIN"): "TIME_WAIT",
    ("CLOSING", "recv ACK"): "TIME_WAIT",
    ("CLOSE_WAIT", "close"): "LAST_ACK",
    ("LAST_ACK", "recv ACK"): "CLOSED",
    ("TIME_WAIT", "timeout"): "CLOSED",
}

state = "CLOSED"
for line in sys.stdin:
    event = line.strip()
    if not event:
        continue
    next_state = TRANSITIONS.get((state, event))
    if next_state is None:
        print(event + " -> error (stays " + state + ")")
    else:
        state = next_state
        print(event + " -> " + state)
`,
      hints: [
        { en: "A dictionary keyed by the pair `(state, event)` is the cleanest way to write a state machine: one line per allowed transition, copied from the prompt.", ar: "القاموس الذي مفتاحه الزوج `(state, event)` هو أنظف طريقة لكتابة آلة حالات: سطر واحد لكل انتقال مسموح، تنسخه من نص التمرين." },
        { en: "`TRANSITIONS.get((state, event))` returns `None` when the pair is not in the table. That is your error case; do not change `state` then.", ar: "الدالة `TRANSITIONS.get((state, event))` تعيد `None` حين لا يوجد الزوج في الجدول. هذه حالة الخطأ؛ ولا تغيّر `state` عندها." },
        { en: "Watch the exact text: events like `recv SYN+ACK` contain a space, and the output is `<event> -> <STATE>` with the state name in capitals and underscores.", ar: "انتبه إلى النص الدقيق: الأحداث مثل `recv SYN+ACK` تحتوي مسافة، والإخراج هو `<event> -> <STATE>` واسم الحالة بأحرف كبيرة وشرطات سفلية." },
      ],
      tests: [
        { name: { en: "A client opens, closes actively and waits in TIME_WAIT", ar: "عميل يفتح ثم يغلق بنفسه وينتظر في TIME_WAIT" }, stdin: "connect\nrecv SYN+ACK\nclose\nrecv ACK\nrecv FIN\ntimeout\n", expected: "connect -> SYN_SENT\nrecv SYN+ACK -> ESTABLISHED\nclose -> FIN_WAIT_1\nrecv ACK -> FIN_WAIT_2\nrecv FIN -> TIME_WAIT\ntimeout -> CLOSED\n" },
        { name: { en: "A server accepts a connection and is closed by the peer", ar: "خادم يقبل اتصالاً ويغلقه الطرف الآخر" }, stdin: "listen\nrecv SYN\nrecv ACK\nrecv FIN\nclose\nrecv ACK\n", expected: "listen -> LISTEN\nrecv SYN -> SYN_RECEIVED\nrecv ACK -> ESTABLISHED\nrecv FIN -> CLOSE_WAIT\nclose -> LAST_ACK\nrecv ACK -> CLOSED\n" },
        { name: { en: "Simultaneous close goes through CLOSING", ar: "الإغلاق المتزامن يمر عبر CLOSING" }, stdin: "connect\nrecv SYN+ACK\nclose\nrecv FIN\nrecv ACK\ntimeout\n", expected: "connect -> SYN_SENT\nrecv SYN+ACK -> ESTABLISHED\nclose -> FIN_WAIT_1\nrecv FIN -> CLOSING\nrecv ACK -> TIME_WAIT\ntimeout -> CLOSED\n" },
        { name: { en: "Giving up early from LISTEN, SYN_SENT and SYN_RECEIVED", ar: "التخلي مبكراً من LISTEN وSYN_SENT وSYN_RECEIVED" }, stdin: "listen\nclose\nconnect\nclose\nlisten\nrecv SYN\nclose\n", expected: "listen -> LISTEN\nclose -> CLOSED\nconnect -> SYN_SENT\nclose -> CLOSED\nlisten -> LISTEN\nrecv SYN -> SYN_RECEIVED\nclose -> FIN_WAIT_1\n" },
        { name: { en: "Events that are not allowed leave the state unchanged", ar: "الأحداث غير المسموحة تُبقي الحالة كما هي" }, stdin: "recv ACK\nlisten\nconnect\nrecv SYN+ACK\nlisten\nbogus\n", expected: "recv ACK -> error (stays CLOSED)\nlisten -> LISTEN\nconnect -> error (stays LISTEN)\nrecv SYN+ACK -> error (stays LISTEN)\nlisten -> error (stays LISTEN)\nbogus -> error (stays LISTEN)\n" },
        { name: { en: "Empty input prints nothing", ar: "الإدخال الفارغ لا يطبع شيئاً" }, stdin: "", expected: "" },
      ],
      sampleInput: "connect\nrecv SYN+ACK\nrecv SYN\n",
    },
    {
      type: "text",
      body: {
        en: `## Reliability: sequence numbers, ACKs and retransmission

Packets get lost, duplicated and reordered, yet TCP delivers a perfect stream. The mechanism is built from the numbers in the header:

- The receiver sends back an **acknowledgment number**: "everything before this byte arrived; send me this one next". ACKs are **cumulative**: they only ever name the next byte still *missing*, even if later bytes have already arrived.
- If a segment is lost, the receiver keeps repeating the same ACK for each later segment (**duplicate ACKs**). After **three duplicate ACKs** the sender retransmits the missing segment at once (**fast retransmit**), without waiting.
- If no ACK arrives at all, a **retransmission timeout (RTO)** fires, computed from the measured round-trip time, and the sender retransmits.
- Out-of-order segments are **buffered** by the receiver and handed to the application in order, once the gap is filled. Duplicates are discarded.

Two more mechanisms stop TCP from overwhelming anyone:

- **Flow control** protects the *receiver*. Every segment carries a **window size**: how many more bytes the receiver has room for. The sender never has more unacknowledged bytes in flight than that.
- **Congestion control** protects the *network*. The sender keeps a **congestion window** and treats loss as a sign of overload. In the classic scheme it starts small and grows quickly (**slow start**), then grows by about one segment per round trip (**congestion avoidance**), and cuts the window roughly in half when it detects loss. Modern stacks use refined algorithms such as CUBIC or BBR, but the idea is the same: be fast, but back off when the network says stop.

Watch the difference between the two protocols on a link that loses some transmissions:`,
        ar: `## الموثوقية: أرقام التسلسل والإقرارات وإعادة الإرسال

الحزم تضيع وتتكرر وتتبدل ترتيباتها، ومع ذلك يسلّم TCP تدفقاً سليماً. وتُبنى الآلية من الأرقام الموجودة في الترويسة:

- يرسل المستقبِل **رقم إقرار**: "كل ما قبل هذا البايت وصل؛ أرسل لي هذا البايت تالياً". والإقرارات **تراكمية (cumulative)**: لا تسمّي إلا البايت التالي الذي ما زال *مفقوداً*، حتى لو وصلت بايتات لاحقة.
- إذا ضاع مقطع فإن المستقبِل يكرر الإقرار نفسه مع كل مقطع لاحق (**إقرارات مكررة / duplicate ACKs**). وبعد **ثلاثة إقرارات مكررة** يعيد المرسل إرسال المقطع المفقود فوراً (**fast retransmit**) دون انتظار.
- وإذا لم يصل أي إقرار على الإطلاق ينتهي **مؤقّت إعادة الإرسال (RTO)**، ويُحسب من زمن الذهاب والإياب المقيس، فيعيد المرسل الإرسال.
- المقاطع التي تصل بغير ترتيب **يخزّنها** المستقبِل مؤقتاً ويسلّمها إلى التطبيق بالترتيب حين تُسدّ الفجوة. والمكرر يُهمَل.

وهناك آليتان أخريان تمنعان TCP من إغراق أحد:

- **التحكم في التدفق (flow control)** يحمي *المستقبِل*. يحمل كل مقطع **حجم النافذة**: كم بايتاً إضافياً يتسع له المستقبِل. ولا يتجاوز المرسل هذا القدر من البايتات غير المقَرّ بها المرسلة في آن واحد.
- **التحكم في الازدحام (congestion control)** يحمي *الشبكة*. يحتفظ المرسل بـ**نافذة ازدحام** ويعدّ الفقد علامة على الحِمل الزائد. في الأسلوب الكلاسيكي يبدأ صغيراً وينمو بسرعة (**slow start**)، ثم ينمو بنحو مقطع واحد في كل ذهاب وإياب (**congestion avoidance**)، ويقلّص النافذة إلى نحو النصف عند اكتشاف الفقد. وتستخدم الأنظمة الحديثة خوارزميات مطوّرة مثل CUBIC أو BBR، لكن الفكرة واحدة: كن سريعاً، وتراجع حين تقول الشبكة قف.

شاهد الفرق بين البروتوكولين على رابط يفقد بعض الإرسالات:`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: String.raw`// A link that loses certain transmissions. There is no randomness: the loss pattern is fixed.
const messages = ["m1", "m2", "m3", "m4", "m5"];
const lostOnFirstTry = new Set(["m2", "m4"]);

// UDP style: send every message once and never look back.
const udpReceived = messages.filter(function (m) { return !lostOnFirstTry.has(m); });
console.log("UDP received:", udpReceived.join(", "));

// TCP style: keep each message until it is acknowledged, retransmit after a timeout.
const tcpReceived = [];
let transmissions = 0;
messages.forEach(function (m) {
  for (let attempt = 1; ; attempt++) {
    transmissions++;
    const lost = lostOnFirstTry.has(m) && attempt === 1;
    if (!lost) {
      tcpReceived.push(m);
      break;
    }
    console.log("TCP " + m + " lost on attempt " + attempt + ": timeout, retransmit");
  }
});
console.log("TCP received:", tcpReceived.join(", "));
console.log("TCP needed " + transmissions + " transmissions for " + messages.length + " messages");
`,
      explanation: {
        en: "UDP delivered three of five messages and never knew. TCP delivered all five, in order, at the price of two extra transmissions and some waiting. Neither is better in general: it depends on whether a late message is worth having. Add `m3` to the lost set and run it again.",
        ar: "UDP سلّم ثلاث رسائل من خمس ولم يعلم بذلك. أما TCP فسلّم الخمس كلها بالترتيب، بثمن إرسالين إضافيين وبعض الانتظار. ولا أحدهما أفضل مطلقاً: الأمر يتوقف على ما إذا كانت الرسالة المتأخرة تستحق أن تُستلم. أضف `m3` إلى مجموعة الفقد وشغّل المثال من جديد.",
      },
    },
    {
      type: "lab",
      id: "cumulative-ack",
      lang: "javascript",
      prompt: {
        en: `Write a TCP **receiver** that answers every arriving segment with a **cumulative ACK**.

**Input:** the first line is the sequence number of the first byte the receiver expects (the initial *expected* number). Every following line is an arriving segment \`<seq> <length>\`: it carries the bytes \`seq\` up to \`seq + length - 1\`. Segments can arrive out of order, duplicated or overlapping.

**Rules:** the receiver keeps out-of-order segments in a buffer. After each segment, the *expected* number moves forward over every contiguous byte it now has. It never moves backwards.

**Output:** after each segment print \`ack=<expected>\`, the acknowledgment number the receiver would send.

**Example**

\`\`\`text
Input:
1000
1000 100
1200 100
1100 100

Output:
ack=1100
ack=1100
ack=1300
\`\`\`

(The segment at 1200 arrives before 1100, so the receiver repeats \`ack=1100\`: a duplicate ACK. Once 1100 shows up, 1100-1299 are complete.)`,
        ar: `اكتب **مستقبِل** TCP يرد على كل مقطع واصل بـ**إقرار تراكمي (cumulative ACK)**.

**الإدخال:** السطر الأول هو رقم تسلسل أول بايت يتوقعه المستقبِل (الرقم *المتوقَّع* الابتدائي). وكل سطر بعده هو مقطع واصل \`<seq> <length>\`: يحمل البايتات من \`seq\` إلى \`seq + length - 1\`. وقد تصل المقاطع بغير ترتيب، أو مكررة، أو متداخلة.

**القواعد:** يحتفظ المستقبِل بالمقاطع غير المرتبة في مخزن مؤقت. وبعد كل مقطع يتقدم الرقم *المتوقَّع* فوق كل بايت متصل صار لديه. ولا يتراجع أبداً.

**الإخراج:** بعد كل مقطع اطبع \`ack=<expected>\`، أي رقم الإقرار الذي سيرسله المستقبِل.

**مثال**

\`\`\`text
الإدخال:
1000
1000 100
1200 100
1100 100

الإخراج:
ack=1100
ack=1100
ack=1300
\`\`\`

(المقطع عند 1200 وصل قبل 1100، فيكرر المستقبِل \`ack=1100\`: إقرار مكرر. وحين يصل 1100 تكتمل البايتات 1100-1299.)`,
      },
      starterCode: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n").map((l) => l.trim()).filter((l) => l !== "");

if (lines.length > 0) {
  let expected = Number(lines[0]); // next byte the receiver is waiting for
  let pending = [];                // buffered segments: { seq, end } where end = seq + length

  for (const line of lines.slice(1)) {
    const [seq, length] = line.split(/\s+/).map(Number);
    pending.push({ seq, end: seq + length });
    // TODO: move 'expected' forward over every buffered segment that touches it
    // (a segment helps when seq <= expected < end), and drop segments that are no longer needed.
    // Then print: ack=<expected>
  }
}
`,
      solution: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n").map((l) => l.trim()).filter((l) => l !== "");

if (lines.length > 0) {
  let expected = Number(lines[0]); // next byte the receiver is waiting for
  let pending = [];                // buffered segments: { seq, end } where end = seq + length

  for (const line of lines.slice(1)) {
    const [seq, length] = line.split(/\s+/).map(Number);
    pending.push({ seq, end: seq + length });

    // Keep consuming buffered segments while one of them covers the byte we are waiting for.
    let progressed = true;
    while (progressed) {
      progressed = false;
      for (const seg of pending) {
        if (seg.seq <= expected && seg.end > expected) {
          expected = seg.end; // overlap is fine: we jump to the end of the segment
          progressed = true;
        }
      }
    }
    // Segments entirely below 'expected' are already delivered: forget them.
    pending = pending.filter((seg) => seg.end > expected);

    console.log("ack=" + expected);
  }
}
`,
      hints: [
        { en: "Store every arriving segment as `{ seq, end: seq + length }`. A segment is *useful now* if `seq <= expected` and `end > expected`: then everything up to `end` is contiguous, so set `expected = end`.", ar: "خزّن كل مقطع واصل على شكل `{ seq, end: seq + length }`. المقطع *مفيد الآن* إذا كان `seq <= expected` و`end > expected`: عندها كل شيء حتى `end` متصل، فاجعل `expected = end`." },
        { en: "One new segment can unlock several buffered ones, so repeat the scan in a loop until a full pass makes no progress.", ar: "مقطع جديد واحد قد يفتح الباب لعدة مقاطع مخزّنة، لذلك كرّر الفحص في حلقة حتى تمر دورة كاملة دون أي تقدّم." },
        { en: "A duplicate or old segment has `end <= expected`, so it changes nothing and the ACK stays the same. Print `\"ack=\" + expected` after every segment, even when it did not change.", ar: "المقطع المكرر أو القديم له `end <= expected` فلا يغيّر شيئاً ويبقى الإقرار كما هو. اطبع `\"ack=\" + expected` بعد كل مقطع حتى لو لم يتغير." },
      ],
      tests: ackTests,
      sampleInput: "1000\n1000 100\n1200 100\n1100 100\n",
    },
    {
      type: "text",
      body: {
        en: `## Detecting corruption: the Internet checksum

Wires and radios flip bits now and then. The Ethernet FCS catches corruption on one link, but a packet can also be damaged inside a router. So IPv4, TCP and UDP carry a 16-bit **Internet checksum** (RFC 1071), computed like this:

1. Treat the data as a sequence of **16-bit big-endian words**. If the byte count is odd, pretend there is one extra zero byte at the end.
2. Add all words with **one's complement addition**: whenever the sum overflows 16 bits, the carry is added back into the low bits ("folded").
3. The checksum is the **bitwise NOT** of the folded sum.

The sender stores it in the header field (which counts as zero while computing). The receiver sums *everything including the checksum field*; if nothing changed, the folded sum is \`0xFFFF\`, so recomputing gives **0**. The checksum is cheap to compute but weak: it catches most random damage, not all, and it offers no protection against an attacker. For that you need cryptography (TLS).

For UDP and TCP the checksum also covers a **pseudo-header** (source IP, destination IP, protocol, length) so that a segment delivered to the wrong host is detected. Here you will compute the raw checksum, in **C**, the language this code lives in inside every operating system.`,
        ar: `## اكتشاف التلف: Internet checksum

الأسلاك والموجات الراديوية تقلب بتات بين حين وآخر. يلتقط FCS في Ethernet التلف على رابط واحد، لكن الحزمة قد تتضرر داخل الراوتر أيضاً. لذلك تحمل IPv4 وTCP وUDP **checksum** من 16 بتاً (RFC 1071)، يُحسب هكذا:

1. عامل البيانات كسلسلة **كلمات من 16 بتاً بترتيب big-endian**. وإذا كان عدد البايتات فردياً فافترض وجود بايت صفري إضافي في النهاية.
2. اجمع كل الكلمات بـ**جمع المتمم الأحادي (one's complement)**: كلما فاض المجموع عن 16 بتاً أُعيد الحمل (carry) وأُضيف إلى البتات الدنيا ("يُطوى").
3. الـ checksum هو **NOT على مستوى البتات** للمجموع المطوي.

يخزّنه المرسل في حقل الترويسة (الذي يُعدّ صفراً أثناء الحساب). ويجمع المستقبِل *كل شيء بما فيه حقل checksum*؛ فإذا لم يتغير شيء فالمجموع المطوي هو \`0xFFFF\`، فتعطي إعادة الحساب **0**. حساب الـ checksum رخيص لكنه ضعيف: يلتقط أغلب التلف العشوائي لا كله، ولا يحمي من مهاجم. وللحماية منه تحتاج التشفير (TLS).

وفي UDP وTCP يغطي الـ checksum أيضاً **ترويسة وهمية (pseudo-header)** (عنوان IP المصدر وعنوان الوجهة والبروتوكول والطول) حتى يُكتشف المقطع الذي سُلّم إلى جهاز خاطئ. وهنا ستحسب الـ checksum الخام بلغة **C**، اللغة التي يعيش بها هذا الكود داخل كل نظام تشغيل.`,
      },
    },
    {
      type: "lab",
      id: "internet-checksum",
      lang: "c",
      prompt: {
        en: `Compute the **Internet checksum** (RFC 1071) in C. Each input line is a hexadecimal string (no spaces, upper or lower case) that encodes the data bytes. Blank lines are skipped.

**Output**, one line per input line: \`checksum=0x<4 lowercase hex digits>\`. If a line has an odd number of hex digits or a character that is not a hex digit, print \`error: invalid hex\` instead.

The starter already decodes the hex into bytes. You write \`internet_checksum\`: add the bytes as **16-bit big-endian words** (a missing last byte counts as 0), **fold** the carries back into 16 bits, then return the **bitwise NOT**.

**Example**

\`\`\`text
Input:
0001f203f4f5f6f7

Output:
checksum=0x220d
\`\`\`

(The words are 0001, f203, f4f5, f6f7. Their sum is 0x2ddf0, folded it becomes 0xddf2, and the NOT of that is 0x220d.)`,
        ar: `احسب **Internet checksum** (RFC 1071) بلغة C. كل سطر إدخال هو نص ست عشري (بلا مسافات، بأحرف كبيرة أو صغيرة) يمثّل بايتات البيانات. وتُتجاهل الأسطر الفارغة.

**الإخراج**، سطر لكل سطر إدخال: \`checksum=0x<4 أرقام ست عشرية صغيرة>\`. وإذا كان عدد الأرقام الست عشرية في السطر فردياً أو فيه محرف ليس رقماً ست عشرياً فاطبع \`error: invalid hex\` بدلاً من ذلك.

المسودة تفك الترميز الست عشري إلى بايتات أصلاً. وأنت تكتب \`internet_checksum\`: اجمع البايتات ككلمات من **16 بتاً بترتيب big-endian** (والبايت الأخير الناقص يُعدّ 0)، ثم **اطوِ** الحمل في 16 بتاً، ثم أعد **NOT على مستوى البتات**.

**مثال**

\`\`\`text
الإدخال:
0001f203f4f5f6f7

الإخراج:
checksum=0x220d
\`\`\`

(الكلمات هي 0001 وf203 وf4f5 وf6f7. مجموعها 0x2ddf0، وبعد الطيّ يصبح 0xddf2، والـ NOT له هو 0x220d.)`,
      },
      starterCode: String.raw`#include <ctype.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

static int hex_digit(int c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    return -1;
}

/* Decodes a hex string into bytes. Returns the byte count, or -1 if the text is not valid hex. */
static int decode_hex(const char *text, uint8_t *out, size_t max) {
    size_t len = strlen(text);
    if (len % 2 != 0 || len / 2 > max) return -1;
    for (size_t i = 0; i < len; i += 2) {
        int hi = hex_digit(text[i]), lo = hex_digit(text[i + 1]);
        if (hi < 0 || lo < 0) return -1;
        out[i / 2] = (uint8_t)((hi << 4) | lo);
    }
    return (int)(len / 2);
}

static uint16_t internet_checksum(const uint8_t *data, size_t n) {
    /* TODO: add the bytes as 16-bit big-endian words (a missing last byte counts as 0),
       fold the carries back into 16 bits, and return the bitwise NOT of the result. */
    (void)data;
    (void)n;
    return 0;
}

int main(void) {
    static char line[1 << 16];
    static uint8_t bytes[1 << 15];
    while (fgets(line, sizeof line, stdin)) {
        size_t len = strlen(line);
        while (len > 0 && isspace((unsigned char)line[len - 1])) line[--len] = '\0';
        if (len == 0) continue;
        int n = decode_hex(line, bytes, sizeof bytes);
        if (n < 0) {
            puts("error: invalid hex");
            continue;
        }
        printf("checksum=0x%04x\n", internet_checksum(bytes, (size_t)n));
    }
    return 0;
}
`,
      solution: String.raw`#include <ctype.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

static int hex_digit(int c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    return -1;
}

/* Decodes a hex string into bytes. Returns the byte count, or -1 if the text is not valid hex. */
static int decode_hex(const char *text, uint8_t *out, size_t max) {
    size_t len = strlen(text);
    if (len % 2 != 0 || len / 2 > max) return -1;
    for (size_t i = 0; i < len; i += 2) {
        int hi = hex_digit(text[i]), lo = hex_digit(text[i + 1]);
        if (hi < 0 || lo < 0) return -1;
        out[i / 2] = (uint8_t)((hi << 4) | lo);
    }
    return (int)(len / 2);
}

static uint16_t internet_checksum(const uint8_t *data, size_t n) {
    uint32_t sum = 0;
    for (size_t i = 0; i < n; i += 2) {
        uint32_t word = (uint32_t)data[i] << 8;  /* first byte is the high half (network order) */
        if (i + 1 < n) word |= data[i + 1];      /* an odd last byte is padded with a zero byte */
        sum += word;
    }
    while (sum >> 16) sum = (sum & 0xFFFF) + (sum >> 16);  /* fold the carries back in */
    return (uint16_t)~sum;
}

int main(void) {
    static char line[1 << 16];
    static uint8_t bytes[1 << 15];
    while (fgets(line, sizeof line, stdin)) {
        size_t len = strlen(line);
        while (len > 0 && isspace((unsigned char)line[len - 1])) line[--len] = '\0';
        if (len == 0) continue;
        int n = decode_hex(line, bytes, sizeof bytes);
        if (n < 0) {
            puts("error: invalid hex");
            continue;
        }
        printf("checksum=0x%04x\n", internet_checksum(bytes, (size_t)n));
    }
    return 0;
}
`,
      hints: [
        { en: "Loop `i` from 0 in steps of 2. Build each word as `(data[i] << 8) | data[i + 1]`, but when `i + 1 == n` use only the high byte (the missing byte is 0). Accumulate into a `uint32_t` so the carries are not lost.", ar: "اجعل `i` يبدأ من 0 بخطوة 2. ابنِ كل كلمة بـ `(data[i] << 8) | data[i + 1]`، لكن حين يكون `i + 1 == n` استخدم البايت العالي فقط (البايت الناقص يساوي 0). وراكم في `uint32_t` حتى لا تضيع الأحمال." },
        { en: "Folding: `while (sum >> 16) sum = (sum & 0xFFFF) + (sum >> 16);` keeps adding the overflow bits back until the sum fits in 16 bits.", ar: "الطيّ: `while (sum >> 16) sum = (sum & 0xFFFF) + (sum >> 16);` يستمر في إضافة بتات الفيض إلى المجموع حتى يتسع في 16 بتاً." },
        { en: "Return `(uint16_t)~sum`. Print with `%04x` so the checksum always has four hex digits (`0x00ff`, not `0xff`).", ar: "أعد `(uint16_t)~sum`. واطبع بـ `%04x` ليكون للـ checksum أربعة أرقام ست عشرية دائماً (`0x00ff` وليس `0xff`)." },
      ],
      tests: checksumTests,
      sampleInput: "0001f203f4f5f6f7\n",
    },
    {
      type: "text",
      body: {
        en: `## TCP or UDP?

Ask one question: **what should happen when data is lost?**

- **Every byte must arrive, in order**, and a short delay is fine: web pages (HTTP/1.1 and HTTP/2), email, file transfer, SSH, databases. Use **TCP**.
- **Fresh data matters more than complete data**, or the application already handles loss itself: voice and video calls, games, DNS lookups, sensor readings, QUIC. Use **UDP**.

Remember the cost of TCP: a round trip for the handshake before the first byte, buffering and head-of-line blocking (one lost segment delays everything behind it), and per-connection state on both ends. Remember the cost of UDP: you must handle loss, ordering, congestion and sometimes security yourself, which is hard to do well. Many modern protocols, QUIC first of all, are exactly that work done once, properly, on top of UDP.

## Troubleshooting with what you know

- "Connection refused" immediately: the packet arrived, but nothing listens on that port (the machine answered with **RST**).
- A connection that just **hangs and times out**: the SYN never got an answer. A firewall silently dropping it, a wrong IP or a broken route are typical causes. This difference between "refused" and "timed out" is one of the most useful clues in networking.
- \`ss -tuln\` shows what is listening locally; \`ss -tn\` shows established TCP connections with their ports.`,
        ar: `## TCP أم UDP؟

اسأل سؤالاً واحداً: **ماذا يجب أن يحدث حين تضيع البيانات؟**

- **يجب أن يصل كل بايت وبالترتيب**، ولا بأس بتأخير قصير: صفحات الويب (HTTP/1.1 وHTTP/2)، والبريد الإلكتروني، ونقل الملفات، وSSH، وقواعد البيانات. استخدم **TCP**.
- **البيانات الحديثة أهم من البيانات الكاملة**، أو أن التطبيق يعالج الفقد بنفسه: مكالمات الصوت والفيديو، والألعاب، واستعلامات DNS، وقراءات الحساسات، وQUIC. استخدم **UDP**.

تذكّر كلفة TCP: ذهاب وإياب للمصافحة قبل أول بايت، والتخزين المؤقت وانسداد مقدمة الطابور (head-of-line blocking) (مقطع واحد ضائع يؤخر كل ما خلفه)، وحالة لكل اتصال عند الطرفين. وتذكّر كلفة UDP: عليك أن تعالج بنفسك الفقد والترتيب والازدحام وأحياناً الأمان، وهذا صعب الإتقان. وكثير من البروتوكولات الحديثة، وأولها QUIC، هي هذا العمل نفسه أُنجز مرة واحدة وبإتقان فوق UDP.

## تشخيص الأعطال بما تعرفه

- "Connection refused" فوراً: وصلت الحزمة لكن لا شيء يستمع على ذلك المنفذ (ردّ الجهاز بـ **RST**).
- اتصال **يعلق وينتهي بمهلة**: لم يحصل الـ SYN على جواب. ومن الأسباب المعتادة جدار ناري يُسقطه بصمت، أو عنوان IP خاطئ، أو مسار معطوب. وهذا الفرق بين "refused" و"timed out" من أنفع القرائن في الشبكات.
- الأمر \`ss -tuln\` يعرض ما يستمع محلياً؛ و\`ss -tn\` يعرض اتصالات TCP القائمة مع منافذها.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is the correct order of the TCP three-way handshake?", ar: "ما الترتيب الصحيح للمصافحة الثلاثية في TCP؟" },
          choices: [
            { en: "SYN, ACK, SYN+ACK", ar: "SYN ثم ACK ثم SYN+ACK" },
            { en: "SYN+ACK, SYN, ACK", ar: "SYN+ACK ثم SYN ثم ACK" },
            { en: "SYN, SYN+ACK, ACK", ar: "SYN ثم SYN+ACK ثم ACK" },
            { en: "SYN, SYN, ACK", ar: "SYN ثم SYN ثم ACK" },
          ],
          answer: 2,
          explain: {
            en: "The client sends SYN, the server answers SYN+ACK (acknowledging the client's number and offering its own), and the client finishes with ACK. Only then are both sides ESTABLISHED and ready to send data.",
            ar: "يرسل العميل SYN، ويرد الخادم بـ SYN+ACK (يقرّ برقم العميل ويعرض رقمه الخاص)، ويختم العميل بـ ACK. عندها فقط يصبح الطرفان ESTABLISHED وجاهزين لإرسال البيانات.",
          },
        },
        {
          q: { en: "Two different clients connect to the same server on port 443. How does the server tell their connections apart?", ar: "يتصل عميلان مختلفان بالخادم نفسه على المنفذ 443. كيف يفرّق الخادم بين اتصاليهما؟" },
          choices: [
            { en: "By the full 5-tuple: protocol, source IP, source port, destination IP and destination port", ar: "بالـ 5-tuple كاملاً: البروتوكول وعنوان المصدر ومنفذ المصدر وعنوان الوجهة ومنفذ الوجهة" },
            { en: "Each client must use a different server port, otherwise the second connection is refused", ar: "يجب أن يستخدم كل عميل منفذاً مختلفاً على الخادم وإلا رُفض الاتصال الثاني" },
            { en: "By the clients' MAC addresses, which TCP puts into its header", ar: "بعناوين MAC الخاصة بالعملاء التي يضعها TCP في ترويسته" },
            { en: "It cannot: a port can only serve one connection at a time", ar: "لا يستطيع: المنفذ يخدم اتصالاً واحداً فقط في الوقت نفسه" },
          ],
          answer: 0,
          explain: {
            en: "A listening port can carry thousands of connections because each one has a unique 5-tuple; the source IP or source port differs. MAC addresses live in layer 2 and are not part of TCP at all.",
            ar: "يمكن للمنفذ المستمع أن يحمل آلاف الاتصالات لأن لكل اتصال 5-tuple فريداً؛ فعنوان المصدر أو منفذ المصدر يختلف. أما عناوين MAC فتعيش في الطبقة 2 وليست جزءاً من TCP أصلاً.",
          },
        },
        {
          q: { en: "Which application is the best fit for UDP?", ar: "أي تطبيق هو الأنسب لـ UDP؟" },
          choices: [
            { en: "Downloading a software installer", ar: "تنزيل ملف تثبيت برنامج" },
            { en: "A live voice call", ar: "مكالمة صوتية مباشرة" },
            { en: "Sending an email over SMTP", ar: "إرسال بريد إلكتروني عبر SMTP" },
            { en: "Copying files over SSH", ar: "نسخ ملفات عبر SSH" },
          ],
          answer: 1,
          explain: {
            en: "In a live call a packet that arrives a second late is useless, so waiting for retransmission makes things worse than a tiny glitch. The other three need every byte, intact and in order: that is TCP's job.",
            ar: "في المكالمة المباشرة تكون الحزمة التي تصل متأخرة ثانية بلا فائدة، فالانتظار لإعادة الإرسال أسوأ من انقطاع صغير. أما الثلاثة الأخرى فتحتاج كل بايت سليماً ومرتباً: وهذه مهمة TCP.",
          },
        },
        {
          q: { en: "A receiver expects byte 1000. A 100-byte segment starting at 1000 arrives, then a 100-byte segment starting at 1200 (the one at 1100 was lost). What ACK number does it send after the second segment?", ar: "مستقبِل يتوقع البايت 1000. يصل مقطع من 100 بايت يبدأ عند 1000، ثم مقطع من 100 بايت يبدأ عند 1200 (والمقطع عند 1100 ضاع). ما رقم الإقرار الذي يرسله بعد المقطع الثاني؟" },
          choices: [
            { en: "1300, because that is everything received so far", ar: "1300 لأنه كل ما استُلم حتى الآن" },
            { en: "1200, the start of the newest segment", ar: "1200 وهو بداية أحدث مقطع" },
            { en: "No ACK is sent until the gap is filled", ar: "لا يُرسل إقرار حتى تُسدّ الفجوة" },
            { en: "1100, the next byte that is still missing", ar: "1100 وهو البايت التالي الذي ما زال مفقوداً" },
          ],
          answer: 3,
          explain: {
            en: "TCP ACKs are cumulative: the number names the first byte not yet received, which is 1100. The receiver sends it again (a duplicate ACK) for every later segment, and three duplicates tell the sender to retransmit the missing one.",
            ar: "إقرارات TCP تراكمية: الرقم يسمّي أول بايت لم يُستلم بعد، وهو 1100. ويرسله المستقبِل مرة أخرى (إقرار مكرر) مع كل مقطع لاحق، وثلاثة إقرارات مكررة تخبر المرسل بإعادة إرسال المقطع المفقود.",
          },
        },
        {
          q: { en: "You connect to a TCP port and get \"connection refused\" at once. What does that most likely mean?", ar: "تتصل بمنفذ TCP فتحصل فوراً على \"connection refused\". ما معنى ذلك على الأرجح؟" },
          choices: [
            { en: "The machine is reachable, but no program is listening on that port, so it answered with RST", ar: "الجهاز يمكن الوصول إليه لكن لا برنامج يستمع على ذلك المنفذ، فردّ بـ RST" },
            { en: "A firewall silently dropped the SYN packet", ar: "جدار ناري أسقط حزمة SYN بصمت" },
            { en: "The machine is switched off or unreachable", ar: "الجهاز مُطفأ أو لا يمكن الوصول إليه" },
            { en: "The server is overloaded and will accept the connection later", ar: "الخادم مثقل وسيقبل الاتصال لاحقاً" },
          ],
          answer: 0,
          explain: {
            en: "An immediate refusal needs a reply, so something answered with RST: the host is up and its network works, but the port is closed. A silently dropped SYN or a dead machine would give a timeout instead. Refused versus timed out is a key diagnostic clue.",
            ar: "الرفض الفوري يحتاج رداً، أي أن شيئاً ما أجاب بـ RST: الجهاز يعمل وشبكته سليمة لكن المنفذ مغلق. أما الـ SYN المُسقَط بصمت أو الجهاز المعطّل فيعطيان انتهاء مهلة. والفرق بين refused وtimed out قرينة تشخيصية أساسية.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap

- A **port** (16 bits) picks the program; a connection is identified by the **5-tuple**. Well-known ports are 0-1023, ephemeral ports are used by clients.
- **UDP**: 8-byte header, no connection, no reliability. Best for DNS, real-time media, games and as a base for QUIC.
- **TCP**: reliable ordered byte stream. **SYN, SYN+ACK, ACK** opens it; **FIN** in each direction closes it; **RST** aborts it.
- Reliability comes from **sequence numbers**, **cumulative ACKs**, **retransmission** (timeout or three duplicate ACKs); **flow control** protects the receiver and **congestion control** protects the network.
- The **Internet checksum** is a 16-bit one's complement sum, inverted; it detects most accidental corruption.
- "Refused" means something answered; "timed out" means nothing did.

**Practice next:** run \`ss -tn\` while loading a web page and find your ephemeral source port and the server's port 443. If you can, capture a handshake with Wireshark or \`tcpdump\` and find the SYN, SYN+ACK and ACK. Then move on to DNS, HTTP and TLS.`,
        ar: `## الخلاصة

- **المنفذ** (16 بتاً) يحدد البرنامج؛ والاتصال يتحدد بالـ **5-tuple**. المنافذ المعروفة هي 0-1023، والمنافذ المؤقتة يستخدمها العملاء.
- **UDP**: ترويسة 8 بايتات، بلا اتصال، بلا موثوقية. الأنسب لـ DNS والوسائط الآنية والألعاب وقاعدةً لـ QUIC.
- **TCP**: تدفق بايتات موثوق ومرتب. يفتحه **SYN ثم SYN+ACK ثم ACK**؛ ويغلقه **FIN** في كل اتجاه؛ ويلغيه **RST**.
- تأتي الموثوقية من **أرقام التسلسل** و**الإقرارات التراكمية** و**إعادة الإرسال** (بانتهاء المهلة أو بثلاثة إقرارات مكررة)؛ و**التحكم في التدفق** يحمي المستقبِل و**التحكم في الازدحام** يحمي الشبكة.
- **Internet checksum** هو مجموع متمم أحادي من 16 بتاً مقلوب؛ ويكشف أغلب التلف العرضي.
- "Refused" تعني أن شيئاً ما ردّ؛ و"timed out" تعني أن لا شيء ردّ.

**تدرّب بعد ذلك:** شغّل \`ss -tn\` أثناء تحميل صفحة ويب وابحث عن منفذ المصدر المؤقت لديك ومنفذ الخادم 443. وإن استطعت فالتقط مصافحة بـ Wireshark أو \`tcpdump\` وابحث عن SYN وSYN+ACK وACK. ثم انتقل إلى DNS وHTTP وTLS.`,
      },
    },
  ],
};
