import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "osi-tcpip",
  title: { en: "The OSI & TCP/IP Models — How Data Travels", ar: "نموذجا OSI وTCP/IP — كيف تنتقل البيانات" },
  estMinutes: 42,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- Why networks are built in **layers**, and what each layer is responsible for
- The **7-layer OSI model** and the **4-layer TCP/IP model**, and how they line up
- **Encapsulation**: how your data is wrapped in headers on the way down and unwrapped on the way up
- What changes (and what does not) when a packet crosses a router
- You will build three small tools: a layer lookup, a frame-overhead calculator and an Ethernet header parser

## The postal system analogy 📬

Imagine you want to send a birthday card to a friend in another country. You do not drive it there yourself. You write the card (**the message**), put it in an envelope with the friend's name (**who it is for**), and hand it over. The post office puts that envelope in a bag labelled with a city. The bag goes on a truck labelled with the next sorting centre. Each step only cares about its own label, and nobody on the truck reads your card.

Networks work the same way. Sending a web page involves dozens of small jobs: turning bits into electrical or radio signals, finding the next device, finding the right computer anywhere on Earth, making sure nothing is lost, and finally speaking the language of the application. Instead of one giant program that does everything, we split the work into **layers**. Each layer does one job, talks only to the layer directly above and below it, and can be replaced without breaking the others. That is why your phone can use Wi-Fi at home and 5G outside, and the same apps keep working.`,
        ar: `## ماذا ستتعلم

- لماذا تُبنى الشبكات على شكل **طبقات**، وما مسؤولية كل طبقة
- **نموذج OSI** ذو الطبقات السبع و**نموذج TCP/IP** ذو الطبقات الأربع، وكيف يتقابلان
- **التغليف (Encapsulation)**: كيف تُلَفّ بياناتك برؤوس (headers) أثناء النزول، وتُفكّ أثناء الصعود
- ما الذي يتغيّر وما الذي لا يتغيّر حين تعبر الحزمة موجّهاً (router)
- ستبني ثلاث أدوات صغيرة: بحثاً عن الطبقة، وحاسبة لحجم الإضافات في الإطارات، ومحلّلاً لترويسة Ethernet

## تشبيه البريد 📬

تخيّل أنك تريد إرسال بطاقة تهنئة بعيد ميلاد لصديق في بلد آخر. أنت لا تقود السيارة بنفسك لتوصلها. تكتب البطاقة (**الرسالة**)، وتضعها في ظرف عليه اسم صديقك (**لمن هي**)، وتسلّمها للبريد. يضع البريد الظرف في كيس عليه اسم مدينة، ويوضع الكيس في شاحنة عليها اسم مركز الفرز التالي. كل خطوة تهتم بملصقها هي فقط، ولا أحد في الشاحنة يقرأ بطاقتك.

الشبكات تعمل بالطريقة نفسها. إرسال صفحة ويب يتضمن عشرات المهام الصغيرة: تحويل البتات إلى إشارات كهربائية أو راديوية، وإيجاد الجهاز التالي، والوصول إلى الحاسوب الصحيح في أي مكان في العالم، والتأكد من عدم ضياع شيء، وأخيراً التحدث بلغة التطبيق. وبدلاً من برنامج عملاق يفعل كل شيء، نقسّم العمل إلى **طبقات**. كل طبقة تؤدي وظيفة واحدة، وتتعامل فقط مع الطبقة التي فوقها والتي تحتها، ويمكن استبدالها دون كسر البقية. لهذا يعمل هاتفك على Wi-Fi في البيت وعلى 5G في الخارج، وتبقى التطبيقات نفسها تعمل.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## The seven layers of OSI

The **OSI model** (Open Systems Interconnection) is a *reference* model: a shared vocabulary for talking about networks. Engineers say "that is a layer 2 problem" all day, so you need to know the numbers.

\`\`\`text
7  Application   what the user's program speaks   HTTP, DNS, SMTP, SSH
6  Presentation  data format, encoding, encryption
5  Session       starting, keeping, ending dialogues
4  Transport     program to program, ports        TCP, UDP
3  Network       host to host across networks     IP, ICMP   (router)
2  Data Link     neighbour to neighbour           Ethernet, Wi-Fi (switch, MAC)
1  Physical      bits as signals on a medium      cable, radio, fibre (hub)
\`\`\`

A classic memory trick, from layer 7 down to 1: **A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing. Or from 1 up: **P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way.

Each layer has its own **address** and its own name for a chunk of data (the **PDU**, protocol data unit):

- **Layer 2** uses **MAC addresses** (48 bits, like \`02:00:00:aa:00:01\`). Chunk name: **frame**.
- **Layer 3** uses **IP addresses** (32 bits for IPv4, 128 for IPv6). Chunk name: **packet**.
- **Layer 4** uses **port numbers** (16 bits, 0 to 65535). Chunk name: **segment** for TCP, **datagram** for UDP.
- **Layers 5-7** just call it **data** or a **message**.

And each layer has typical devices: a **hub** repeats bits to every port (layer 1), a **switch** forwards frames using MAC addresses (layer 2), a **router** forwards packets using IP addresses (layer 3).

## The TCP/IP model: what the Internet actually uses

The Internet was built with the simpler **TCP/IP model**, which has four layers (some books split the bottom one in two and show five):

\`\`\`text
TCP/IP        OSI equivalent
Application   7 + 6 + 5   (HTTP, DNS, TLS, SSH ...)
Transport     4           (TCP, UDP)
Internet      3           (IP, ICMP)
Link          2 + 1       (Ethernet, Wi-Fi)
\`\`\`

The OSI model is the one used for *discussion* and exams; TCP/IP is the one implemented in your operating system. Real protocols do not always fit neatly: TLS sits somewhere between OSI layers 4 and 7 depending on who you ask, and ARP is usually placed between 2 and 3. Do not argue about it in an interview; explain what the protocol does and say where you would place it and why.`,
        ar: `## طبقات OSI السبع

**نموذج OSI** (الربط البيني للأنظمة المفتوحة) هو نموذج *مرجعي*: لغة مشتركة للحديث عن الشبكات. المهندسون يقولون طوال اليوم "هذه مشكلة في الطبقة الثانية"، لذلك يجب أن تعرف الأرقام.

\`\`\`text
7  Application   ما يتحدث به برنامج المستخدم       HTTP, DNS, SMTP, SSH
6  Presentation  تنسيق البيانات وترميزها وتشفيرها
5  Session       بدء الحوارات والحفاظ عليها وإنهاؤها
4  Transport     من برنامج إلى برنامج، المنافذ     TCP, UDP
3  Network       من جهاز إلى جهاز عبر الشبكات      IP, ICMP   (router)
2  Data Link     من جار إلى جاره                   Ethernet, Wi-Fi (switch, MAC)
1  Physical      البتات كإشارات على وسط ناقل       cable, radio, fibre (hub)
\`\`\`

حيلة حفظ مشهورة بالإنجليزية من الطبقة 1 صعوداً: **P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way (Physical, Data link, Network, Transport, Session, Presentation, Application).

لكل طبقة **عنوانها** الخاص واسمها الخاص لقطعة البيانات (وتُسمى **PDU**، وحدة بيانات البروتوكول):

- **الطبقة 2** تستخدم **عناوين MAC** (48 بتاً، مثل \`02:00:00:aa:00:01\`). اسم القطعة: **إطار (frame)**.
- **الطبقة 3** تستخدم **عناوين IP** (32 بتاً في IPv4 و128 في IPv6). اسم القطعة: **حزمة (packet)**.
- **الطبقة 4** تستخدم **أرقام المنافذ** (16 بتاً، من 0 إلى 65535). اسم القطعة: **segment** في TCP، و**datagram** في UDP.
- **الطبقات 5-7** تسمّيها ببساطة **بيانات** أو **رسالة**.

ولكل طبقة أجهزتها المعتادة: **الهاب (hub)** يكرّر البتات إلى كل المنافذ (الطبقة 1)، و**السويتش (switch)** يمرّر الإطارات بالاعتماد على عناوين MAC (الطبقة 2)، و**الراوتر (router)** يمرّر الحزم بالاعتماد على عناوين IP (الطبقة 3).

## نموذج TCP/IP: ما يستخدمه الإنترنت فعلياً

بُني الإنترنت على **نموذج TCP/IP** الأبسط، وله أربع طبقات (بعض الكتب تقسّم السفلى إلى طبقتين فتعرض خمساً):

\`\`\`text
TCP/IP        ما يقابله في OSI
Application   7 + 6 + 5   (HTTP, DNS, TLS, SSH ...)
Transport     4           (TCP, UDP)
Internet      3           (IP, ICMP)
Link          2 + 1       (Ethernet, Wi-Fi)
\`\`\`

نموذج OSI يُستخدم في *النقاش* والامتحانات، أما TCP/IP فهو المنفَّذ فعلياً في نظام التشغيل لديك. والبروتوكولات الحقيقية لا تتطابق دائماً بدقة: فـ TLS يقع بين الطبقتين 4 و7 بحسب من تسأل، وARP يوضع عادة بين 2 و3. لا تجادل في ذلك في مقابلة عمل؛ اشرح ما يفعله البروتوكول، وقل أين تضعه ولماذا.`,
      },
    },
    {
      type: "lab",
      id: "layer-lookup",
      lang: "python",
      prompt: {
        en: `Build a **layer lookup**. Each input line is the name of a protocol or device. Print the OSI layer it works at, using this table (case-insensitive):

- Layer 7 (Application): \`http\`, \`https\`, \`dns\`, \`ssh\`, \`smtp\`
- Layer 4 (Transport): \`tcp\`, \`udp\`
- Layer 3 (Network): \`ip\`, \`icmp\`, \`router\`
- Layer 2 (Data Link): \`ethernet\`, \`switch\`
- Layer 1 (Physical): \`hub\`, \`repeater\`

Layer names are: 7 Application, 6 Presentation, 5 Session, 4 Transport, 3 Network, 2 Data Link, 1 Physical.

**Output format:** one line per input line, \`<name as typed> -> <number> <layer name>\`. Names not in the table print \`<name as typed> -> unknown\`. Skip blank lines.

**Example**

\`\`\`text
Input:
TCP
router
laser

Output:
TCP -> 4 Transport
router -> 3 Network
laser -> unknown
\`\`\``,
        ar: `ابنِ **أداة بحث عن الطبقة**. كل سطر إدخال هو اسم بروتوكول أو جهاز. اطبع طبقة OSI التي يعمل عندها، بحسب هذا الجدول (دون حساسية لحالة الأحرف):

- الطبقة 7 (Application): \`http\`, \`https\`, \`dns\`, \`ssh\`, \`smtp\`
- الطبقة 4 (Transport): \`tcp\`, \`udp\`
- الطبقة 3 (Network): \`ip\`, \`icmp\`, \`router\`
- الطبقة 2 (Data Link): \`ethernet\`, \`switch\`
- الطبقة 1 (Physical): \`hub\`, \`repeater\`

أسماء الطبقات: 7 Application، 6 Presentation، 5 Session، 4 Transport، 3 Network، 2 Data Link، 1 Physical.

**صيغة الإخراج:** سطر لكل سطر إدخال، \`<الاسم كما كُتب> -> <الرقم> <اسم الطبقة>\`. الأسماء غير الموجودة في الجدول تطبع \`<الاسم كما كُتب> -> unknown\`. تجاهل الأسطر الفارغة.

**مثال**

\`\`\`text
الإدخال:
TCP
router
laser

الإخراج:
TCP -> 4 Transport
router -> 3 Network
laser -> unknown
\`\`\``,
      },
      starterCode: String.raw`import sys

LAYER_NAMES = {
    7: "Application",
    6: "Presentation",
    5: "Session",
    4: "Transport",
    3: "Network",
    2: "Data Link",
    1: "Physical",
}

# protocol or device (lowercase) -> OSI layer number
LAYER_OF = {
    "http": 7,
    # TODO: add every entry from the table in the prompt
}

for line in sys.stdin:
    name = line.strip()
    # TODO: skip blank lines, look the name up (ignoring case)
    # and print "<name> -> <number> <layer name>" or "<name> -> unknown"
`,
      solution: String.raw`import sys

LAYER_NAMES = {
    7: "Application",
    6: "Presentation",
    5: "Session",
    4: "Transport",
    3: "Network",
    2: "Data Link",
    1: "Physical",
}

# protocol or device (lowercase) -> OSI layer number
LAYER_OF = {
    "http": 7, "https": 7, "dns": 7, "ssh": 7, "smtp": 7,
    "tcp": 4, "udp": 4,
    "ip": 3, "icmp": 3, "router": 3,
    "ethernet": 2, "switch": 2,
    "hub": 1, "repeater": 1,
}

for line in sys.stdin:
    name = line.strip()
    if not name:
        continue
    layer = LAYER_OF.get(name.lower())
    if layer is None:
        print(f"{name} -> unknown")
    else:
        print(f"{name} -> {layer} {LAYER_NAMES[layer]}")
`,
      hints: [
        { en: "Read lines with `for line in sys.stdin`, then `name = line.strip()`. If `name` is empty, `continue`.", ar: "اقرأ الأسطر بـ `for line in sys.stdin` ثم `name = line.strip()`. إن كان `name` فارغاً فاستخدم `continue`." },
        { en: "Dictionary keys are lowercase, so look up `name.lower()`, but print the original `name`. `LAYER_OF.get(key)` returns `None` when the key is missing.", ar: "مفاتيح القاموس بأحرف صغيرة، فابحث بـ `name.lower()` لكن اطبع `name` الأصلي. الدالة `LAYER_OF.get(key)` تعيد `None` إذا لم يوجد المفتاح." },
        { en: "Print `f\"{name} -> {layer} {LAYER_NAMES[layer]}\"` when found, and `f\"{name} -> unknown\"` otherwise.", ar: "اطبع `f\"{name} -> {layer} {LAYER_NAMES[layer]}\"` عند الوجود، و`f\"{name} -> unknown\"` عند عدمه." },
      ],
      tests: [
        { name: { en: "Application-layer protocols", ar: "بروتوكولات طبقة التطبيق" }, stdin: "HTTP\ndns\nSSH\n", expected: "HTTP -> 7 Application\ndns -> 7 Application\nSSH -> 7 Application\n" },
        { name: { en: "Devices and lower layers", ar: "الأجهزة والطبقات الدنيا" }, stdin: "router\nswitch\nhub\nEthernet\n", expected: "router -> 3 Network\nswitch -> 2 Data Link\nhub -> 1 Physical\nEthernet -> 2 Data Link\n" },
        { name: { en: "Transport and network protocols", ar: "بروتوكولات النقل والشبكة" }, stdin: "tcp\nUDP\nIP\nicmp\n", expected: "tcp -> 4 Transport\nUDP -> 4 Transport\nIP -> 3 Network\nicmp -> 3 Network\n" },
        { name: { en: "Unknown names and blank lines", ar: "أسماء غير معروفة وأسطر فارغة" }, stdin: "laser\n\n  Repeater  \nHTTPS\n", expected: "laser -> unknown\nRepeater -> 1 Physical\nHTTPS -> 7 Application\n" },
        { name: { en: "Empty input prints nothing", ar: "الإدخال الفارغ لا يطبع شيئاً" }, stdin: "", expected: "" },
      ],
      sampleInput: "TCP\nrouter\nlaser\n",
    },
    {
      type: "text",
      body: {
        en: `## Encapsulation: envelopes inside envelopes

When your browser sends a request, the data travels **down** the stack. At each layer the sender adds a **header** (and the link layer also adds a **trailer**) that the *same layer on the receiving side* will read. This wrapping is called **encapsulation**; the receiver reverses it, which is **decapsulation**.

\`\`\`text
Application   [        HTTP request                     ]
Transport     [ TCP header | HTTP request              ]            segment
Network       [ IP header  | TCP header | HTTP request ]            packet
Link          [ Eth header | IP header | TCP header | HTTP request | FCS ]   frame
\`\`\`

Try it. This demo wraps a short message the way the stack does, using documentation-reserved addresses (they are guaranteed never to belong to a real host).`,
        ar: `## التغليف: ظروف داخل ظروف

حين يرسل متصفحك طلباً، تنتقل البيانات **نزولاً** عبر الطبقات. في كل طبقة يضيف المُرسِل **ترويسة (header)** (وطبقة الربط تضيف أيضاً **ذيلاً (trailer)**) ستقرؤها *الطبقة نفسها عند المستقبِل*. تُسمّى عملية اللفّ هذه **التغليف (encapsulation)**، والمستقبِل يعكسها، وهذا هو **فك التغليف (decapsulation)**.

\`\`\`text
Application   [        HTTP request                     ]
Transport     [ TCP header | HTTP request              ]            segment
Network       [ IP header  | TCP header | HTTP request ]            packet
Link          [ Eth header | IP header | TCP header | HTTP request | FCS ]   frame
\`\`\`

جرّب بنفسك. هذا المثال يغلّف رسالة قصيرة كما تفعل الطبقات، مستخدماً عناوين محجوزة للتوثيق (مضمون ألا تعود لأي جهاز حقيقي).`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: String.raw`message = "GET / HTTP/1.1"

def wrap(layer, header, payload):
    return "[" + layer + " " + header + " | " + payload + "]"

# Going DOWN the stack: each layer adds its own header.
segment = wrap("TCP", "src_port=51514 dst_port=80", message)
packet = wrap("IP", "src=198.51.100.10 dst=203.0.113.80", segment)
frame = wrap("Ethernet", "src=02:00:00:aa:00:01 dst=02:00:00:aa:00:02", packet)

print("segment:", segment)
print("packet: ", packet)
print("frame:  ", frame)

# Going UP the stack: the receiver peels the layers off in reverse order.
inner = frame
for layer in ["Ethernet", "IP", "TCP"]:
    inner = inner[inner.index("|") + 2 : -1]
    print("after", layer, "->", inner)
`,
      explanation: {
        en: "Read the output from the inside out: the HTTP request never changes, each layer just adds a labelled envelope around it. The receiver removes the envelopes in the opposite order. Change the ports or addresses and run it again.",
        ar: "اقرأ الناتج من الداخل إلى الخارج: طلب HTTP لا يتغير أبداً، وكل طبقة تضيف حوله ظرفاً عليه ملصق. والمستقبِل ينزع الظروف بالترتيب المعاكس. غيّر المنافذ أو العناوين وشغّل المثال مجدداً.",
      },
    },
    {
      type: "text",
      body: {
        en: `## Headers cost bytes: MTU and MSS

Every layer's header is overhead. A typical **Ethernet II** frame carries:

- **14-byte header**: destination MAC (6) + source MAC (6) + **EtherType** (2), which says what the payload is (\`0x0800\` = IPv4, \`0x0806\` = ARP, \`0x86DD\` = IPv6)
- the payload, at most **1500 bytes**; this limit is the **MTU** (maximum transmission unit)
- a **4-byte FCS** (frame check sequence), a CRC that lets the receiver detect corruption

A frame is never shorter than **64 bytes** (header, payload and FCS together). If your payload is tiny, the sender **pads** it. The maximum is therefore 14 + 1500 + 4 = **1518 bytes**. (The preamble and the gap between frames also use the wire, but they are not counted in the frame.)

Inside the 1500-byte MTU sits an IP packet: **20-byte IPv4 header** (without options) + the transport segment. For TCP, add a **20-byte TCP header** (without options). That leaves 1500 - 20 - 20 = **1460 bytes** of your data per frame. This number is the **MSS** (maximum segment size) you will see in packet captures. To send 100 KB the sender needs many frames, and every frame pays the header tax again.

Now you compute that tax yourself.`,
        ar: `## الترويسات تكلّف بايتات: MTU وMSS

ترويسة كل طبقة هي كلفة إضافية. إطار **Ethernet II** المعتاد يحمل:

- **ترويسة من 14 بايتاً**: عنوان MAC للوجهة (6) + عنوان MAC للمصدر (6) + **EtherType** (2) الذي يحدّد نوع الحمولة (\`0x0800\` = IPv4، \`0x0806\` = ARP، \`0x86DD\` = IPv6)
- الحمولة، بحد أقصى **1500 بايت**؛ وهذا الحد هو **MTU** (وحدة النقل القصوى)
- **FCS من 4 بايتات** (تسلسل فحص الإطار)، وهو CRC يتيح للمستقبِل اكتشاف التلف

لا يقل حجم الإطار أبداً عن **64 بايتاً** (الترويسة والحمولة والـ FCS معاً). فإذا كانت حمولتك صغيرة جداً، يُلحق المُرسِل **حشواً (padding)**. فالحد الأقصى إذن 14 + 1500 + 4 = **1518 بايتاً**. (المقدمة preamble والفجوة بين الإطارات تشغل السلك أيضاً، لكنها لا تُحسب ضمن الإطار.)

داخل MTU البالغ 1500 بايت توجد حزمة IP: **ترويسة IPv4 من 20 بايتاً** (بلا خيارات) + مقطع النقل. وفي TCP أضف **ترويسة TCP من 20 بايتاً** (بلا خيارات). يبقى 1500 - 20 - 20 = **1460 بايتاً** من بياناتك في كل إطار. هذا الرقم هو **MSS** (أقصى حجم لمقطع) الذي سترونه في التقاطات الحزم. ولإرسال 100 كيلوبايت يحتاج المُرسِل إلى إطارات كثيرة، وكل إطار يدفع ضريبة الترويسات من جديد.

الآن احسب هذه الضريبة بنفسك.`,
      },
    },
    {
      type: "lab",
      id: "frame-overhead",
      lang: "javascript",
      prompt: {
        en: `Write a **frame overhead calculator**. Each input line is the number of bytes of application data sent over TCP (a non-negative integer). Split the data into the fewest frames possible and report the cost.

Rules (the same as the lesson):

- each frame carries at most **1460** bytes of data (MSS)
- every frame has Ethernet header 14 + IP header 20 + TCP header 20 + FCS 4 = **58** bytes of overhead
- a frame is never smaller than **64** bytes in total; smaller ones are padded up to 64
- 0 bytes of data means 0 frames

**Output:** for each input line print \`frames=<n> wire=<total bytes on the wire> overhead=<wire minus data>\`.

**Example**

\`\`\`text
Input:
1460
1461

Output:
frames=1 wire=1518 overhead=58
frames=2 wire=1582 overhead=121
\`\`\`

(1461 bytes = one full frame of 1518 bytes + one frame with 1 byte of data: 59 bytes padded to 64.)`,
        ar: `اكتب **حاسبة لتكلفة الإطارات**. كل سطر إدخال هو عدد بايتات بيانات التطبيق المرسلة عبر TCP (عدد صحيح غير سالب). قسّم البيانات إلى أقل عدد ممكن من الإطارات وأبلغ عن الكلفة.

القواعد (كما في الدرس):

- كل إطار يحمل **1460** بايتاً من البيانات كحد أقصى (MSS)
- كل إطار فيه ترويسة Ethernet 14 + ترويسة IP 20 + ترويسة TCP 20 + FCS 4 = **58** بايتاً إضافية
- لا يقل الإطار عن **64** بايتاً في المجموع؛ والأصغر يُحشى حتى 64
- 0 بايت من البيانات يعني 0 إطار

**الإخراج:** لكل سطر إدخال اطبع \`frames=<n> wire=<مجموع البايتات على السلك> overhead=<wire ناقص البيانات>\`.

**مثال**

\`\`\`text
الإدخال:
1460
1461

الإخراج:
frames=1 wire=1518 overhead=58
frames=2 wire=1582 overhead=121
\`\`\`

(1461 بايتاً = إطار كامل بحجم 1518 بايتاً + إطار فيه بايت واحد من البيانات: 59 بايتاً تُحشى إلى 64.)`,
      },
      starterCode: String.raw`const MSS = 1460;        // max data bytes per frame
const OVERHEAD = 58;     // Ethernet 14 + IP 20 + TCP 20 + FCS 4
const MIN_FRAME = 64;    // smaller frames are padded to this size

const lines = require("fs").readFileSync(0, "utf8").split("\n");

for (const line of lines) {
  if (line.trim() === "") continue;
  const data = Number(line.trim());
  // TODO: work out how many frames are needed, the bytes on the wire
  // (remember the 64-byte minimum per frame) and the overhead,
  // then print: frames=<n> wire=<bytes> overhead=<bytes>
}
`,
      solution: String.raw`const MSS = 1460;        // max data bytes per frame
const OVERHEAD = 58;     // Ethernet 14 + IP 20 + TCP 20 + FCS 4
const MIN_FRAME = 64;    // smaller frames are padded to this size

const lines = require("fs").readFileSync(0, "utf8").split("\n");

for (const line of lines) {
  if (line.trim() === "") continue;
  const data = Number(line.trim());

  const fullFrames = Math.floor(data / MSS);
  const remainder = data % MSS;

  let wire = fullFrames * (MSS + OVERHEAD);
  let frames = fullFrames;
  if (remainder > 0) {
    // the last, smaller frame may need padding up to 64 bytes
    wire += Math.max(MIN_FRAME, remainder + OVERHEAD);
    frames += 1;
  }
  console.log("frames=" + frames + " wire=" + wire + " overhead=" + (wire - data));
}
`,
      hints: [
        { en: "Full frames: `Math.floor(data / 1460)`. Whatever is left over, `data % 1460`, goes into one more (smaller) frame, if it is greater than 0.", ar: "الإطارات الكاملة: `Math.floor(data / 1460)`. وما يتبقى `data % 1460` يوضع في إطار إضافي (أصغر) إن كان أكبر من 0." },
        { en: "A full frame is 1460 + 58 = 1518 bytes on the wire. The last frame is `remainder + 58` bytes, but never less than 64: use `Math.max(64, remainder + 58)`.", ar: "الإطار الكامل حجمه 1460 + 58 = 1518 بايتاً على السلك. والإطار الأخير حجمه `remainder + 58` لكن لا يقل عن 64: استخدم `Math.max(64, remainder + 58)`." },
        { en: "overhead = wire - data. Print with string concatenation: `\"frames=\" + frames + \" wire=\" + wire + ...`.", ar: "overhead = wire - data. اطبع بدمج النصوص: `\"frames=\" + frames + \" wire=\" + wire + ...`." },
      ],
      tests: [
        { name: { en: "Exactly one full frame", ar: "إطار كامل واحد بالضبط" }, stdin: "1460\n", expected: "frames=1 wire=1518 overhead=58\n" },
        { name: { en: "One byte over: second frame is padded", ar: "بايت واحد زائد: الإطار الثاني يُحشى" }, stdin: "1461\n", expected: "frames=2 wire=1582 overhead=121\n" },
        { name: { en: "Tiny payload is padded to 64 bytes", ar: "حمولة صغيرة تُحشى إلى 64 بايتاً" }, stdin: "1\n", expected: "frames=1 wire=64 overhead=63\n" },
        { name: { en: "Zero bytes needs no frames", ar: "صفر بايت لا يحتاج إطارات" }, stdin: "0\n", expected: "frames=0 wire=0 overhead=0\n" },
        { name: { en: "Several inputs, including 6 bytes (exactly 64 on the wire)", ar: "عدة مدخلات، منها 6 بايتات (64 بالضبط على السلك)" }, stdin: "6\n5\n2920\n", expected: "frames=1 wire=64 overhead=58\nframes=1 wire=64 overhead=59\nframes=2 wire=3036 overhead=116\n" },
        { name: { en: "A 100,000-byte transfer", ar: "نقل 100,000 بايت" }, stdin: "100000\n", expected: "frames=69 wire=104002 overhead=4002\n" },
      ],
      sampleInput: "1460\n1461\n",
    },
    {
      type: "text",
      body: {
        en: `## What changes at each hop?

A packet from your laptop to a server crosses several networks. Two kinds of addresses are involved, and they behave very differently:

- The **IP addresses** (layer 3) say where the packet is *ultimately* going. They stay the same from end to end. (NAT, which you will meet later, is the main exception.) Only the **TTL** (time to live) field changes: every router subtracts 1, and if it reaches 0 the packet is dropped. That stops packets from looping forever.
- The **MAC addresses** (layer 2) say who should receive the frame on *this one link*. Each router **removes** the old frame, looks at the IP packet, picks the next hop, and builds a **new frame** with new MAC addresses for the next link.

Run the simulation and watch which fields change.`,
        ar: `## ما الذي يتغيّر عند كل قفزة؟

الحزمة من حاسوبك المحمول إلى خادم تعبر عدة شبكات. وتشارك فيها نوعان من العناوين، يتصرفان بشكل مختلف تماماً:

- **عناوين IP** (الطبقة 3) تحدد إلى أين تتجه الحزمة *في النهاية*. وتبقى ثابتة من الطرف إلى الطرف. (وتُستثنى من ذلك أساساً ترجمة NAT التي ستقابلها لاحقاً.) الحقل الوحيد الذي يتغيّر هو **TTL** (زمن البقاء): كل راوتر يطرح منه 1، وإذا وصل إلى 0 تُسقط الحزمة. وهذا يمنع الحزم من الدوران إلى الأبد.
- **عناوين MAC** (الطبقة 2) تحدد من يجب أن يستقبل الإطار على *هذا الرابط وحده*. كل راوتر **ينزع** الإطار القديم، وينظر إلى حزمة IP، ويختار القفزة التالية، ثم يبني **إطاراً جديداً** بعناوين MAC جديدة للرابط التالي.

شغّل المحاكاة وراقب أي الحقول تتغيّر.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: String.raw`// A packet from a laptop to a server, crossing two routers.
// Addresses come from the ranges reserved for documentation.
const packet = { srcIp: "198.51.100.10", dstIp: "203.0.113.80", ttl: 64 };

const links = [
  { name: "laptop -> router A", srcMac: "02:00:00:00:00:01", dstMac: "02:00:00:00:00:0a" },
  { name: "router A -> router B", srcMac: "02:00:00:00:00:0b", dstMac: "02:00:00:00:00:0c" },
  { name: "router B -> server", srcMac: "02:00:00:00:00:0d", dstMac: "02:00:00:00:00:99" },
];

links.forEach(function (link, i) {
  if (i > 0) packet.ttl -= 1; // each router decrements TTL before forwarding
  console.log("Link " + (i + 1) + ": " + link.name);
  console.log("  frame:  " + link.srcMac + " -> " + link.dstMac + "   (new on every link)");
  console.log("  packet: " + packet.srcIp + " -> " + packet.dstIp + "   ttl=" + packet.ttl);
});
`,
      explanation: {
        en: "The MAC pair changes on every link, the IP pair never does, and the TTL drops by one per router. This is why a switch (which only looks at MACs) cannot send traffic between networks, and a router can.",
        ar: "زوج عناوين MAC يتغيّر على كل رابط، وزوج عناوين IP لا يتغيّر أبداً، وTTL ينقص واحداً عند كل راوتر. ولهذا لا يستطيع السويتش (الذي ينظر إلى MAC فقط) نقل البيانات بين الشبكات، بينما يستطيع الراوتر ذلك.",
      },
    },
    {
      type: "text",
      body: {
        en: `## Reading a raw Ethernet frame

Wireshark and \`tcpdump\` show you frames as hexadecimal bytes. Two hex digits are one byte. The first 14 bytes are always the Ethernet header, so you can read it by eye:

\`\`\`text
ffffffffffff 525400123456 0806 0001080006040001...
dst MAC      src MAC      type  payload (here an ARP request)
\`\`\`

Everything after the 14th byte is the payload. Time to write the parser that Wireshark has built in: for a hex string, print the MAC addresses, name the EtherType, and handle bad input. It is written in **Go**, a popular language for network tools.`,
        ar: `## قراءة إطار Ethernet خام

يعرض لك Wireshark وأداة \`tcpdump\` الإطارات كبايتات بالنظام الست عشري. كل رقمين ست عشريين يساويان بايتاً واحداً. أول 14 بايتاً هي دائماً ترويسة Ethernet، فيمكنك قراءتها بالعين:

\`\`\`text
ffffffffffff 525400123456 0806 0001080006040001...
dst MAC      src MAC      type  payload (here an ARP request)
\`\`\`

وكل ما بعد البايت الرابع عشر هو الحمولة. حان وقت كتابة المحلّل الذي يوفره Wireshark جاهزاً: بمعطى سلسلة ست عشرية، اطبع عناوين MAC، وسمِّ قيمة EtherType، وتعامل مع المدخلات الخاطئة. الكود مكتوب بلغة **Go**، وهي لغة شائعة في أدوات الشبكات.`,
      },
    },
    {
      type: "lab",
      id: "ethernet-header",
      lang: "go",
      prompt: {
        en: `Parse an **Ethernet II frame**. The input is one line of hexadecimal digits (no spaces, upper or lower case) containing a whole frame. Print:

\`\`\`text
dst=<MAC>[ (broadcast)| (multicast)]
src=<MAC>
type=<name> (0x<4 hex digits>)
payload=<n> bytes
\`\`\`

- MAC addresses are printed as six lowercase hex pairs separated by colons.
- The destination is **broadcast** if it is \`ff:ff:ff:ff:ff:ff\`; otherwise it is **multicast** if the lowest bit of its first byte is 1 (for example the first byte is \`33\` or \`01\`); otherwise add nothing.
- Type names: \`0x0800\` IPv4, \`0x0806\` ARP, \`0x86dd\` IPv6, anything else \`unknown\`.
- \`payload\` is the number of bytes after the 14-byte header.
- If the hex is invalid (odd length or a non-hex character) print \`error: invalid hex\`. If it decodes to fewer than 14 bytes print \`error: frame too short\`.

**Example**

\`\`\`text
Input:
0a00000000025254001234560800450000341c46400040060000c0000232cb007150

Output:
dst=0a:00:00:00:00:02
src=52:54:00:12:34:56
type=IPv4 (0x0800)
payload=20 bytes
\`\`\``,
        ar: `حلّل **إطار Ethernet II**. الإدخال سطر واحد من أرقام ست عشرية (بلا مسافات، بأحرف كبيرة أو صغيرة) يحوي إطاراً كاملاً. اطبع:

\`\`\`text
dst=<MAC>[ (broadcast)| (multicast)]
src=<MAC>
type=<الاسم> (0x<4 أرقام ست عشرية>)
payload=<n> bytes
\`\`\`

- تُطبع عناوين MAC كستة أزواج ست عشرية بأحرف صغيرة تفصل بينها نقطتان رأسيتان.
- الوجهة **broadcast** إذا كانت \`ff:ff:ff:ff:ff:ff\`؛ وإلا فهي **multicast** إذا كان أدنى بت في بايتها الأول يساوي 1 (مثلاً البايت الأول \`33\` أو \`01\`)؛ وإلا لا تضف شيئاً.
- أسماء الأنواع: \`0x0800\` IPv4، \`0x0806\` ARP، \`0x86dd\` IPv6، وأي قيمة أخرى \`unknown\`.
- \`payload\` هو عدد البايتات بعد الترويسة البالغة 14 بايتاً.
- إذا كان النص الست عشري غير صالح (طول فردي أو حرف غير ست عشري) اطبع \`error: invalid hex\`. وإذا فُكّ إلى أقل من 14 بايتاً اطبع \`error: frame too short\`.

**مثال**

\`\`\`text
الإدخال:
0a00000000025254001234560800450000341c46400040060000c0000232cb007150

الإخراج:
dst=0a:00:00:00:00:02
src=52:54:00:12:34:56
type=IPv4 (0x0800)
payload=20 bytes
\`\`\``,
      },
      starterCode: String.raw`package main

import (
	"bufio"
	"encoding/hex"
	"fmt"
	"os"
	"strings"
)

// formatMAC turns 6 bytes into "aa:bb:cc:dd:ee:ff".
func formatMAC(b []byte) string {
	// TODO: format every byte as two lowercase hex digits and join with ":"
	return ""
}

// etherTypeName names the EtherType value.
func etherTypeName(t uint16) string {
	// TODO: 0x0800 IPv4, 0x0806 ARP, 0x86dd IPv6, otherwise "unknown"
	return "unknown"
}

func main() {
	reader := bufio.NewReader(os.Stdin)
	line, _ := reader.ReadString('\n')
	frame, err := hex.DecodeString(strings.TrimSpace(line))
	if err != nil {
		fmt.Println("error: invalid hex")
		return
	}
	// TODO: reject frames shorter than 14 bytes, then print dst, src, type and payload
	_ = frame
}
`,
      solution: String.raw`package main

import (
	"bufio"
	"encoding/hex"
	"fmt"
	"os"
	"strings"
)

// formatMAC turns 6 bytes into "aa:bb:cc:dd:ee:ff".
func formatMAC(b []byte) string {
	parts := make([]string, len(b))
	for i, v := range b {
		parts[i] = fmt.Sprintf("%02x", v)
	}
	return strings.Join(parts, ":")
}

// etherTypeName names the EtherType value.
func etherTypeName(t uint16) string {
	switch t {
	case 0x0800:
		return "IPv4"
	case 0x0806:
		return "ARP"
	case 0x86dd:
		return "IPv6"
	}
	return "unknown"
}

func main() {
	reader := bufio.NewReader(os.Stdin)
	line, _ := reader.ReadString('\n')
	frame, err := hex.DecodeString(strings.TrimSpace(line))
	if err != nil {
		fmt.Println("error: invalid hex")
		return
	}
	if len(frame) < 14 {
		fmt.Println("error: frame too short")
		return
	}

	dst, src := frame[0:6], frame[6:12]
	etherType := uint16(frame[12])<<8 | uint16(frame[13]) // big-endian ("network order")

	dstText := formatMAC(dst)
	if dstText == "ff:ff:ff:ff:ff:ff" {
		dstText += " (broadcast)"
	} else if dst[0]&1 == 1 {
		dstText += " (multicast)"
	}

	fmt.Println("dst=" + dstText)
	fmt.Println("src=" + formatMAC(src))
	fmt.Printf("type=%s (0x%04x)\n", etherTypeName(etherType), etherType)
	fmt.Printf("payload=%d bytes\n", len(frame)-14)
}
`,
      hints: [
        { en: "The destination MAC is bytes 0-5, the source is bytes 6-11, the EtherType is bytes 12-13. Combine two bytes into one number with `uint16(frame[12])<<8 | uint16(frame[13])`: network protocols are big-endian.", ar: "عنوان MAC للوجهة هو البايتات 0-5، والمصدر 6-11، وEtherType هو البايتان 12-13. ادمج بايتين في رقم واحد بـ `uint16(frame[12])<<8 | uint16(frame[13])`: بروتوكولات الشبكة تستخدم ترتيب big-endian." },
        { en: "`fmt.Sprintf(\"%02x\", v)` prints a byte as two lowercase hex digits. Collect them in a `[]string` and use `strings.Join(parts, \":\")`.", ar: "الدالة `fmt.Sprintf(\"%02x\", v)` تطبع البايت برقمين ست عشريين صغيرين. اجمعها في `[]string` واستخدم `strings.Join(parts, \":\")`." },
        { en: "Multicast test: `dst[0]&1 == 1` (lowest bit of the first byte). Check broadcast first, because broadcast also has that bit set. Print the type with `fmt.Printf(\"type=%s (0x%04x)\\n\", name, etherType)`.", ar: "اختبار multicast: `dst[0]&1 == 1` (أدنى بت في البايت الأول). افحص broadcast أولاً لأنه يحمل هذا البت أيضاً. اطبع النوع بـ `fmt.Printf(\"type=%s (0x%04x)\\n\", name, etherType)`." },
      ],
      tests: [
        { name: { en: "IPv4 frame to a unicast address", ar: "إطار IPv4 إلى عنوان unicast" }, stdin: "0a00000000025254001234560800450000341c46400040060000c0000232cb007150\n", expected: "dst=0a:00:00:00:00:02\nsrc=52:54:00:12:34:56\ntype=IPv4 (0x0800)\npayload=20 bytes\n" },
        { name: { en: "ARP request sent to broadcast", ar: "طلب ARP مرسل إلى broadcast" }, stdin: "ffffffffffff52540012345608060001080006040001525400123456c0000232000000000000c0000201\n", expected: "dst=ff:ff:ff:ff:ff:ff (broadcast)\nsrc=52:54:00:12:34:56\ntype=ARP (0x0806)\npayload=28 bytes\n" },
        { name: { en: "LLDP frame sent to a multicast address", ar: "إطار LLDP مرسل إلى عنوان multicast" }, stdin: "0180c200000e525400123456" + "88cc" + "00".repeat(10) + "\n", expected: "dst=01:80:c2:00:00:0e (multicast)\nsrc=52:54:00:12:34:56\ntype=unknown (0x88cc)\npayload=10 bytes\n" },
        { name: { en: "Header only (upper-case hex): payload is 0 bytes", ar: "ترويسة فقط (أحرف كبيرة): الحمولة 0 بايت" }, stdin: "0A0000000002525400123456" + "86DD" + "\n", expected: "dst=0a:00:00:00:00:02\nsrc=52:54:00:12:34:56\ntype=IPv6 (0x86dd)\npayload=0 bytes\n" },
        { name: { en: "A frame shorter than 14 bytes is rejected", ar: "رفض الإطار الأقصر من 14 بايتاً" }, stdin: "0a0000000002525400\n", expected: "error: frame too short\n" },
        { name: { en: "Invalid hex is rejected", ar: "رفض النص الست عشري غير الصالح" }, stdin: "0a00zz\n", expected: "error: invalid hex\n" },
      ],
      sampleInput: "0a00000000025254001234560800450000341c46400040060000c0000232cb007150\n",
    },
    {
      type: "text",
      body: {
        en: `## Using layers to troubleshoot

The model is most useful as a **checklist**. When "the internet is broken", walk up the layers and stop at the first one that fails:

1. **Layer 1**: is the cable plugged in, is Wi-Fi switched on, is there a link light?
2. **Layer 2**: are you connected to the right Wi-Fi network or switch port, and can you reach your neighbour (the router)?
3. **Layer 3**: do you have a valid IP address, and can you \`ping\` the default gateway and then a public IP such as \`1.1.1.1\`?
4. **Layer 4**: is the destination port open, or does a firewall drop it?
5. **Layer 7**: does the name resolve (DNS) and does the application answer correctly?

A classic example: \`ping 1.1.1.1\` works but \`ping example.com\` fails. Layers 1-3 are fine, so the problem is name resolution, which is an application-layer service (DNS). Without the layered view you might spend an hour replacing cables.`,
        ar: `## استخدام الطبقات في إصلاح الأعطال

أنفع استخدام للنموذج هو أن تتعامل معه كـ **قائمة فحص**. حين تقول "الإنترنت معطّل"، اصعد الطبقات واحدة واحدة وتوقف عند أول طبقة تفشل:

1. **الطبقة 1**: هل الكابل موصول؟ وهل Wi-Fi مفعّل؟ وهل ضوء الرابط مضاء؟
2. **الطبقة 2**: هل أنت متصل بشبكة Wi-Fi أو منفذ سويتش الصحيح، وهل تصل إلى جارك (الراوتر)؟
3. **الطبقة 3**: هل لديك عنوان IP صالح، وهل ينجح \`ping\` إلى البوابة الافتراضية ثم إلى عنوان عام مثل \`1.1.1.1\`؟
4. **الطبقة 4**: هل المنفذ الوجهة مفتوح، أم أن جداراً ناراً يسقطه؟
5. **الطبقة 7**: هل يُحلّ الاسم (DNS) وهل يرد التطبيق بشكل صحيح؟

مثال كلاسيكي: ينجح \`ping 1.1.1.1\` ويفشل \`ping example.com\`. الطبقات 1-3 سليمة، فالمشكلة في حلّ الأسماء، وهي خدمة في طبقة التطبيق (DNS). ومن دون النظرة الطبقية قد تقضي ساعة في تبديل الكابلات.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "At which OSI layer does a router make its forwarding decisions?", ar: "عند أي طبقة من OSI يتخذ الراوتر قراراته في التمرير؟" },
          choices: [
            { en: "Layer 2, the Data Link layer (MAC addresses)", ar: "الطبقة 2، طبقة ربط البيانات (عناوين MAC)" },
            { en: "Layer 3, the Network layer (IP addresses)", ar: "الطبقة 3، طبقة الشبكة (عناوين IP)" },
            { en: "Layer 4, the Transport layer (port numbers)", ar: "الطبقة 4، طبقة النقل (أرقام المنافذ)" },
            { en: "Layer 1, the Physical layer (signals)", ar: "الطبقة 1، الطبقة الفيزيائية (الإشارات)" },
          ],
          answer: 1,
          explain: {
            en: "Routers forward packets by looking at the destination IP address, which is layer 3. Switches decide with MAC addresses (layer 2); that confusion is common because many home devices combine a router and a switch in one box.",
            ar: "الراوتر يمرّر الحزم بالنظر إلى عنوان IP الوجهة، وهذه الطبقة 3. أما السويتش فيقرر بعناوين MAC (الطبقة 2)؛ ويكثر الخلط بينهما لأن أجهزة كثيرة في البيوت تجمع الراوتر والسويتش في صندوق واحد.",
          },
        },
        {
          q: { en: "A packet crosses three routers on its way to a server. What happens to its addresses?", ar: "تعبر حزمة ثلاثة راوترات في طريقها إلى خادم. ماذا يحدث لعناوينها؟" },
          choices: [
            { en: "The IP addresses stay the same; the MAC addresses are replaced on every link", ar: "عناوين IP تبقى كما هي؛ وعناوين MAC تُستبدل عند كل رابط" },
            { en: "Both the IP and the MAC addresses stay the same end to end", ar: "عناوين IP وMAC تبقى كما هي من الطرف إلى الطرف" },
            { en: "The MAC addresses stay the same; the IP addresses change at every router", ar: "عناوين MAC تبقى كما هي؛ وعناوين IP تتغير عند كل راوتر" },
            { en: "Both change at every router", ar: "كلاهما يتغير عند كل راوتر" },
          ],
          answer: 0,
          explain: {
            en: "MAC addresses only make sense on one link, so each router builds a new frame with new MACs. IP addresses identify the endpoints and stay constant (apart from NAT). Only the TTL field is decremented.",
            ar: "عناوين MAC لا معنى لها إلا على رابط واحد، لذا يبني كل راوتر إطاراً جديداً بعناوين MAC جديدة. أما عناوين IP فتحدد الطرفين وتبقى ثابتة (باستثناء NAT). والحقل الوحيد الذي ينقص هو TTL.",
          },
        },
        {
          q: { en: "Which description of encapsulation is correct for a web request sent over TCP and Ethernet?", ar: "أي وصف للتغليف صحيح لطلب ويب يُرسل عبر TCP وEthernet؟" },
          choices: [
            { en: "The HTTP data goes in an Ethernet frame, which goes in an IP packet, which goes in a TCP segment", ar: "بيانات HTTP توضع في إطار Ethernet، وهو يوضع في حزمة IP، وهي توضع في segment من TCP" },
            { en: "The IP packet carries the Ethernet frame and the TCP segment side by side", ar: "حزمة IP تحمل إطار Ethernet وsegment من TCP جنباً إلى جنب" },
            { en: "The HTTP data goes in a TCP segment, which goes in an IP packet, which goes in an Ethernet frame", ar: "بيانات HTTP توضع في segment من TCP، وهو يوضع في حزمة IP، وهي توضع في إطار Ethernet" },
            { en: "Each layer sends its own separate message and the receiver combines them", ar: "كل طبقة ترسل رسالتها المنفصلة والمستقبِل يجمعها" },
          ],
          answer: 2,
          explain: {
            en: "Each lower layer treats everything from the layer above as opaque payload and adds its own header (plus a trailer for Ethernet). The outermost wrapper is the link-layer frame.",
            ar: "كل طبقة سفلية تعامل كل ما يأتيها من الطبقة العليا على أنه حمولة معتمة وتضيف ترويستها (مع ذيل في Ethernet). والغلاف الخارجي هو إطار طبقة الربط.",
          },
        },
        {
          q: { en: "Ethernet's MTU is 1500 bytes. Why can a TCP sender put only 1460 bytes of data in each frame?", ar: "قيمة MTU في Ethernet هي 1500 بايت. فلماذا لا يستطيع مُرسِل TCP وضع أكثر من 1460 بايتاً من البيانات في كل إطار؟" },
          choices: [
            { en: "The Ethernet header and FCS take 40 bytes of the MTU", ar: "ترويسة Ethernet والـ FCS تأخذان 40 بايتاً من MTU" },
            { en: "TCP reserves 40 bytes for acknowledgements in every segment", ar: "TCP يحجز 40 بايتاً للإقرارات في كل segment" },
            { en: "1460 is a safety margin chosen so frames are never dropped", ar: "الرقم 1460 هامش أمان يُختار حتى لا تُسقط الإطارات أبداً" },
            { en: "The 20-byte IPv4 header and 20-byte TCP header also have to fit inside the 1500 bytes", ar: "ترويسة IPv4 (20 بايتاً) وترويسة TCP (20 بايتاً) يجب أن تتسعا أيضاً ضمن الـ 1500 بايت" },
          ],
          answer: 3,
          explain: {
            en: "The MTU limits the IP packet, which contains the IP header, the TCP header and the data: 1500 - 20 - 20 = 1460. The Ethernet header (14) and FCS (4) are outside the MTU, which is why the full frame is 1518 bytes.",
            ar: "MTU يحدّ حجم حزمة IP، وهي تحوي ترويسة IP وترويسة TCP والبيانات: 1500 - 20 - 20 = 1460. أما ترويسة Ethernet (14) والـ FCS (4) فخارج MTU، ولهذا يبلغ الإطار الكامل 1518 بايتاً.",
          },
        },
        {
          q: { en: "You can ping 1.1.1.1 successfully, but pinging example.com says \"unknown host\". Which layer is the most likely culprit?", ar: "ينجح ping إلى 1.1.1.1 لكن ping إلى example.com يعطي \"unknown host\". أي طبقة هي المشتبه به الأرجح؟" },
          choices: [
            { en: "The physical layer: the cable is faulty", ar: "الطبقة الفيزيائية: الكابل معطوب" },
            { en: "The application layer: DNS name resolution is failing", ar: "طبقة التطبيق: حلّ الأسماء في DNS يفشل" },
            { en: "The data link layer: the MAC address is wrong", ar: "طبقة ربط البيانات: عنوان MAC خاطئ" },
            { en: "The network layer: the router cannot forward IP packets", ar: "طبقة الشبكة: الراوتر لا يستطيع تمرير حزم IP" },
          ],
          answer: 1,
          explain: {
            en: "Reaching a public IP proves layers 1-3 work: you have a link, an address and a route. Failing only when a name is used points to DNS, a service at the application layer. Work up the layers and stop at the first one that fails.",
            ar: "الوصول إلى عنوان IP عام يثبت أن الطبقات 1-3 تعمل: لديك رابط وعنوان ومسار. والفشل عند استخدام الاسم فقط يشير إلى DNS، وهو خدمة في طبقة التطبيق. اصعد الطبقات وتوقف عند أول طبقة تفشل.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap

- Layers split a hard problem into small jobs: **OSI** has 7, **TCP/IP** has 4.
- Going down, each layer **encapsulates** the data with its own header; the receiver **decapsulates**.
- Data units: **frame** (2), **packet** (3), **segment/datagram** (4).
- **MAC addresses** change on every link, **IP addresses** stay end to end, **ports** pick the program.
- An Ethernet frame is 64 to 1518 bytes; TCP over IPv4 carries at most 1460 data bytes per frame.

**Practice next:** open Wireshark (or run \`tcpdump -e -n\`) on your own computer, load a web page, and find the Ethernet, IP and TCP headers of one packet. Then move on to IP addressing and subnetting.`,
        ar: `## الخلاصة

- الطبقات تقسّم مشكلة صعبة إلى مهام صغيرة: **OSI** فيه 7 و**TCP/IP** فيه 4.
- أثناء النزول تقوم كل طبقة بـ**تغليف** البيانات بترويستها، والمستقبِل يقوم بـ**فك التغليف**.
- وحدات البيانات: **frame** (2)، و**packet** (3)، و**segment/datagram** (4).
- **عناوين MAC** تتغيّر عند كل رابط، و**عناوين IP** تبقى من الطرف إلى الطرف، و**المنافذ** تحدد البرنامج.
- إطار Ethernet حجمه من 64 إلى 1518 بايتاً؛ وTCP فوق IPv4 يحمل 1460 بايتاً كحد أقصى من البيانات في الإطار.

**تدرّب بعد ذلك:** افتح Wireshark (أو شغّل \`tcpdump -e -n\`) على حاسوبك، وحمّل صفحة ويب، وابحث عن ترويسات Ethernet وIP وTCP لحزمة واحدة. ثم انتقل إلى العنونة وتقسيم الشبكات.`,
      },
    },
  ],
};
