import type { Lesson, LabTest } from "../types";

// Test data for the SPF lab: a 10 x 10 grid of routers, every link cost 1, computed from r00-00.
// Router (i, j) costs i + j. Among equal-cost paths the smaller first hop wins: r00-01 ("go right
// first") beats r01-00 for every router that is not in column 0.
const gridSize = 10;
const gridName = (i: number, j: number) => "r" + String(i).padStart(2, "0") + "-" + String(j).padStart(2, "0");
const gridLinks: string[] = [];
const gridRoutes: string[] = [];
for (let i = 0; i < gridSize; i++) {
  for (let j = 0; j < gridSize; j++) {
    if (j + 1 < gridSize) gridLinks.push("link " + gridName(i, j) + " " + gridName(i, j + 1) + " 1");
    if (i + 1 < gridSize) gridLinks.push("link " + gridName(i, j) + " " + gridName(i + 1, j) + " 1");
    if (i > 0 || j > 0) gridRoutes.push(gridName(i, j) + " cost=" + (i + j) + " via " + (j > 0 ? gridName(0, 1) : gridName(1, 0)));
  }
}

const spfTests: LabTest[] = [
  {
    name: { en: "The worked example: the long way round is cheaper", ar: "المثال المحلول: الطريق الأطول أرخص" },
    stdin: "R1\nlink R1 R2 10\nlink R2 R3 5\nlink R1 R3 20\n",
    expected: "R2 cost=10 via R2\nR3 cost=15 via R2\n",
  },
  {
    name: { en: "Six routers: every shortest path leaves through B", ar: "ستة راوترات: كل أقصر مسار يخرج عبر B" },
    stdin: "A\nlink A B 2\nlink A C 5\nlink B C 1\nlink B D 7\nlink C D 2\nlink C E 6\nlink D E 1\nlink D F 4\nlink E F 1\n",
    expected: "B cost=2 via B\nC cost=3 via B\nD cost=5 via B\nE cost=6 via B\nF cost=7 via B\n",
  },
  {
    name: { en: "Equal-cost paths: the alphabetically smaller first hop wins", ar: "مسارات متساوية الكلفة: القفزة الأولى الأصغر أبجدياً تفوز" },
    stdin: "core\nlink core west 10\nlink core east 10\nlink west dc 10\nlink east dc 10\nlink core dc 30\nlink dc branch 1\n",
    expected: "branch cost=21 via east\ndc cost=20 via east\neast cost=10 via east\nwest cost=10 via west\n",
  },
  {
    name: { en: "A 10 x 10 grid of 100 routers", ar: "شبكة من 10 × 10 أي 100 راوتر" },
    stdin: gridName(0, 0) + "\n" + gridLinks.join("\n") + "\n",
    expected: gridRoutes.join("\n") + "\n",
  },
  {
    name: { en: "Parallel links use the cheapest one; an island is unreachable", ar: "الروابط المتوازية تُستخدم أرخصها؛ والجزيرة المعزولة لا يمكن الوصول إليها" },
    stdin: "R1\nlink R1 R2 50\nlink R2 R1 5\nlink R3 R4 1\nlink R4 R5 2\nlink R3 R3 1\n",
    expected: "R2 cost=5 via R2\nR3 unreachable\nR4 unreachable\nR5 unreachable\n",
  },
  {
    name: { en: "No links: nothing is printed", ar: "لا روابط: لا يُطبع شيء" },
    stdin: "R1\n",
    expected: "",
  },
];

export const lesson: Lesson = {
  nodeId: "routing-switching",
  title: { en: "Routing & Switching — How Packets Find Their Way", ar: "التوجيه والتبديل — كيف تجد الحزم طريقها" },
  estMinutes: 43,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- How an Ethernet **switch** learns where every device is and decides to **forward**, **flood** or **filter** each frame
- How **VLANs** split one physical switch into several separate networks, and what an **802.1Q** tag looks like
- How **ARP** finds the MAC address that belongs to an IP address, and when a host talks to its **default gateway** instead
- How a **router** reads its routing table, and the difference between **static** and **dynamic** routing
- The ideas behind **RIP**, **OSPF** and **BGP**, the protocols that keep the Internet's routes up to date
- You will build three tools: a learning switch, a host's ARP logic and an OSPF shortest-path calculator

## The office receptionist and the road signs 🚦

Inside an office building, a **receptionist** delivers internal mail. On day one she knows nobody, so she walks a letter around every floor. But every time someone hands her mail, she notes which office they sit in, and after a few days she delivers straight to the right door. That is a **switch**: it moves frames *inside* one network, using MAC addresses, and it learns by watching.

Mail for another city leaves the building. Now nobody knows the exact door; the post only follows **road signs**: "Riyadh: take exit 4", "everything else: highway north". That is a **router**: it moves packets *between* networks, using IP addresses and a table of signs called the **routing table**. Remember the one-line summary: **switches connect devices into a network; routers connect networks to each other.**`,
        ar: `## ماذا ستتعلم

- كيف يتعلّم **السويتش (switch)** في Ethernet مكان كل جهاز، ويقرّر لكل إطار أن **يمرّره (forward)** أو **يغمره (flood)** على كل المنافذ أو **يُسقطه (filter)**
- كيف تقسّم **الشبكات المحلية الافتراضية (VLANs)** سويتشاً مادياً واحداً إلى عدة شبكات منفصلة، وكيف يبدو وسم **802.1Q**
- كيف يجد **ARP** عنوان MAC الذي يخص عنوان IP، ومتى يتحدث الجهاز مع **البوابة الافتراضية (default gateway)** بدلاً من ذلك
- كيف يقرأ **الراوتر (router)** جدول توجيهه، والفرق بين التوجيه **الثابت (static)** و**الديناميكي (dynamic)**
- الأفكار التي تقوم عليها **RIP** و**OSPF** و**BGP**، وهي البروتوكولات التي تُبقي مسارات الإنترنت محدَّثة
- ستبني ثلاث أدوات: سويتشاً يتعلّم، ومنطق ARP في جهاز، وحاسبة لأقصر المسارات في OSPF

## موظفة الاستقبال واللافتات على الطريق 🚦

داخل مبنى مكاتب، توزّع **موظفة الاستقبال** البريد الداخلي. في يومها الأول لا تعرف أحداً، فتطوف بالرسالة على كل الطوابق. لكنها في كل مرة يسلّمها أحدٌ بريداً تسجّل المكتب الذي يجلس فيه، وبعد أيام قليلة توصل الرسائل مباشرة إلى الباب الصحيح. هذا هو **السويتش**: ينقل الإطارات *داخل* شبكة واحدة مستخدماً عناوين MAC، ويتعلّم بالملاحظة.

أما بريد مدينة أخرى فيغادر المبنى. وهنا لا يعرف أحد الباب الدقيق؛ فالبريد يتبع **لافتات الطريق** فقط: "الرياض: المخرج 4"، و"كل ما عدا ذلك: الطريق السريع شمالاً". هذا هو **الراوتر**: ينقل الحزم *بين* الشبكات مستخدماً عناوين IP وجدولاً من اللافتات اسمه **جدول التوجيه (routing table)**. وتذكّر الخلاصة في سطر واحد: **السويتشات تربط الأجهزة في شبكة؛ والراوترات تربط الشبكات بعضها ببعض.**`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Switching: learn, then forward, flood or filter

A switch keeps a **MAC address table** (also called the CAM table or forwarding database): which MAC address was last seen on which port. For every frame that arrives it does two things:

1. **Learn**: write down "the *source* MAC lives behind the port this frame came in on", with the current time.
2. **Decide** for the *destination* MAC:
   - **broadcast** (\`ff:ff:ff:ff:ff:ff\`) or **multicast** (the lowest bit of the first byte is 1): send it out of **every other port** (**flood**);
   - **unknown** unicast: also **flood**, and let the reply teach the switch where that device is;
   - **known**, on a different port: **forward** it out of that one port only;
   - **known**, on the *same* port it came in on: **filter** (drop) it, because the destination already received it on that segment.

\`\`\`text
           +------------------------------------+
           |  port 1   port 2   port 3   port 4 |
           +----|--------|--------|--------|----+
                A        B        C        D

MAC table after A -> B and B -> A:
  02:00:00:00:00:0a   port 1   seen at t=0
  02:00:00:00:00:0b   port 2   seen at t=1
\`\`\`

Entries **age out** when a device stays silent: the IEEE 802.1D default ageing time is **300 seconds**. That keeps the table small and lets a laptop that moved to another port be found again. On Linux you can see a software bridge's table with \`bridge fdb show\`; on a Cisco switch the command is \`show mac address-table\`.

Two consequences matter in practice. First, every switch port is its own collision domain and runs **full duplex**, so the old Ethernet collisions are gone. Second, all ports still share **one broadcast domain**: one ARP broadcast reaches every device. And if someone connects two switches with two cables, a broadcast circles forever and multiplies (a **broadcast storm**), because Ethernet frames have no TTL. The **Spanning Tree Protocol** (IEEE 802.1D, with the faster RSTP variant) prevents this by putting redundant links into a blocking state until they are needed.`,
        ar: `## التبديل: تعلّم ثم مرّر أو اغمر أو أسقِط

يحتفظ السويتش بـ **جدول عناوين MAC** (ويسمى أيضاً جدول CAM أو قاعدة بيانات التمرير): أي عنوان MAC شوهد آخر مرة على أي منفذ. ولكل إطار يصل يفعل شيئين:

1. **يتعلّم**: يسجّل أن "عنوان MAC *المصدر* يقع خلف المنفذ الذي دخل منه هذا الإطار"، مع الوقت الحالي.
2. **يقرّر** بحسب عنوان MAC *الوجهة*:
   - **بث (broadcast)** (\`ff:ff:ff:ff:ff:ff\`) أو **بث متعدد (multicast)** (أدنى بت في البايت الأول يساوي 1): يرسله من **كل المنافذ الأخرى** (**غمر / flood**)؛
   - عنوان أحادي **غير معروف**: **يغمره** أيضاً، ويترك الرد يعلّم السويتش مكان ذلك الجهاز؛
   - **معروف** على منفذ آخر: **يمرّره (forward)** من ذلك المنفذ وحده؛
   - **معروف** على *المنفذ نفسه* الذي دخل منه: **يُسقطه (filter)**، لأن الوجهة استلمته أصلاً على ذلك المقطع.

\`\`\`text
           +------------------------------------+
           |  port 1   port 2   port 3   port 4 |
           +----|--------|--------|--------|----+
                A        B        C        D

جدول MAC بعد A -> B ثم B -> A:
  02:00:00:00:00:0a   port 1   seen at t=0
  02:00:00:00:00:0b   port 2   seen at t=1
\`\`\`

**تتقادم** المدخلات حين يصمت الجهاز: ومدة التقادم الافتراضية في IEEE 802.1D هي **300 ثانية**. وهذا يُبقي الجدول صغيراً ويسمح بإيجاد حاسوب محمول انتقل إلى منفذ آخر من جديد. وفي Linux ترى جدول الجسر البرمجي (bridge) بالأمر \`bridge fdb show\`؛ وفي سويتش Cisco الأمر هو \`show mac address-table\`.

ولذلك نتيجتان مهمتان عملياً. الأولى أن كل منفذ في السويتش نطاق تصادم مستقل ويعمل **بالاتجاهين معاً (full duplex)**، فاختفت تصادمات Ethernet القديمة. والثانية أن كل المنافذ ما زالت تتشارك **نطاق بث واحداً**: بث ARP واحد يصل إلى كل جهاز. وإذا وصل أحدهم سويتشين بكبلين، يدور البث إلى الأبد ويتضاعف (**عاصفة بث / broadcast storm**)، لأن إطارات Ethernet لا تملك TTL. ويمنع ذلك **بروتوكول الشجرة الممتدة (Spanning Tree Protocol)** (IEEE 802.1D، مع نسخته الأسرع RSTP) بوضع الروابط الاحتياطية في حالة حجب حتى يُحتاج إليها.`,
      },
    },
    {
      type: "lab",
      id: "mac-learning",
      lang: "python",
      prompt: {
        en: `Simulate a **learning switch** with an ageing time of **300 seconds**.

**Input:** the first line is \`ports <n>\` (ports are numbered 1 to n). Every following non-blank line is a frame \`<time> <in-port> <source-mac> <destination-mac>\`, with times in whole seconds in increasing order and MAC addresses in lower case.

**For each frame**

1. Learn: the source MAC is now on \`<in-port>\`, last seen at \`<time>\` (this also moves a device that changed port).
2. Decide, for the destination MAC:
   - if it is broadcast or multicast (lowest bit of the first byte is 1), or unknown, or its entry is **300 seconds old or older** (\`time - last_seen >= 300\`): \`flood\` to every port except the in-port, in increasing order, comma-separated;
   - if it is known on the in-port: \`filter\`;
   - otherwise: \`forward <port>\`.

**Output**, one line per frame: \`<time> <source> -> <destination>: <action>\`.

**Example**

\`\`\`text
Input:
ports 4
0 1 02:00:00:00:00:0a 02:00:00:00:00:0b
1 2 02:00:00:00:00:0b 02:00:00:00:00:0a
2 1 02:00:00:00:00:0a 02:00:00:00:00:0b

Output:
0 02:00:00:00:00:0a -> 02:00:00:00:00:0b: flood 2,3,4
1 02:00:00:00:00:0b -> 02:00:00:00:00:0a: forward 1
2 02:00:00:00:00:0a -> 02:00:00:00:00:0b: forward 2
\`\`\``,
        ar: `حاكِ **سويتشاً يتعلّم** مدة التقادم فيه **300 ثانية**.

**الإدخال:** السطر الأول هو \`ports <n>\` (المنافذ مرقّمة من 1 إلى n). وكل سطر غير فارغ بعده إطار \`<time> <in-port> <source-mac> <destination-mac>\`، والأوقات ثوانٍ صحيحة بترتيب تصاعدي، وعناوين MAC بأحرف صغيرة.

**لكل إطار**

1. تعلّم: صار عنوان MAC المصدر على \`<in-port>\`، وآخر ظهور له عند \`<time>\` (وهذا ينقل أيضاً الجهاز الذي غيّر منفذه).
2. قرّر بحسب عنوان MAC الوجهة:
   - إذا كان بثاً أو بثاً متعدداً (أدنى بت في البايت الأول يساوي 1)، أو غير معروف، أو كان عمر مُدخله **300 ثانية أو أكثر** (\`time - last_seen >= 300\`): \`flood\` إلى كل المنافذ ما عدا منفذ الدخول، بترتيب تصاعدي ومفصولة بفواصل؛
   - إذا كان معروفاً على منفذ الدخول نفسه: \`filter\`؛
   - وإلا: \`forward <port>\`.

**الإخراج**، سطر لكل إطار: \`<time> <source> -> <destination>: <action>\`.

**مثال**

\`\`\`text
الإدخال:
ports 4
0 1 02:00:00:00:00:0a 02:00:00:00:00:0b
1 2 02:00:00:00:00:0b 02:00:00:00:00:0a
2 1 02:00:00:00:00:0a 02:00:00:00:00:0b

الإخراج:
0 02:00:00:00:00:0a -> 02:00:00:00:00:0b: flood 2,3,4
1 02:00:00:00:00:0b -> 02:00:00:00:00:0a: forward 1
2 02:00:00:00:00:0a -> 02:00:00:00:00:0b: forward 2
\`\`\``,
      },
      starterCode: String.raw`import sys

AGING = 300  # seconds an entry stays valid without being seen again

lines = [l.split() for l in sys.stdin.read().splitlines() if l.strip()]
ports = int(lines[0][1]) if lines else 0
table = {}  # mac -> (port, last_seen)

for t, port, src, dst in lines[1:]:
    now, port = int(t), int(port)
    table[src] = (port, now)  # learn (or refresh, or move) the sender first

    # TODO: decide what to do with the frame:
    #  - broadcast/multicast (int(dst[:2], 16) & 1), unknown, or aged (now - last_seen >= AGING): flood
    #  - known on the in-port: filter
    #  - known on another port: forward <port>
    others = [str(p) for p in range(1, ports + 1) if p != port]
    action = "flood " + ",".join(others)
    print(t + " " + src + " -> " + dst + ": " + action)
`,
      solution: String.raw`import sys

AGING = 300  # seconds an entry stays valid without being seen again

lines = [l.split() for l in sys.stdin.read().splitlines() if l.strip()]
ports = int(lines[0][1]) if lines else 0
table = {}  # mac -> (port, last_seen)

for t, port, src, dst in lines[1:]:
    now, port = int(t), int(port)
    table[src] = (port, now)  # learn (or refresh, or move) the sender first

    entry = table.get(dst)
    group = int(dst[:2], 16) & 1  # I/G bit: broadcast and multicast addresses have it set
    if group or entry is None or now - entry[1] >= AGING:
        others = [str(p) for p in range(1, ports + 1) if p != port]
        action = "flood " + ",".join(others)
    elif entry[0] == port:
        action = "filter"
    else:
        action = "forward " + str(entry[0])
    print(t + " " + src + " -> " + dst + ": " + action)
`,
      hints: [
        { en: "Look the destination up with `entry = table.get(dst)`: it is `None` when unknown, otherwise a `(port, last_seen)` pair.", ar: "ابحث عن الوجهة بـ `entry = table.get(dst)`: تكون `None` إذا كانت غير معروفة، وإلا فهي زوج `(port, last_seen)`." },
        { en: "`int(dst[:2], 16) & 1` is 1 for broadcast and multicast addresses (`ff:...`, `01:00:5e:...`, `33:33:...`). Those always flood, even if some device used that address as a source.", ar: "التعبير `int(dst[:2], 16) & 1` يساوي 1 لعناوين البث والبث المتعدد (`ff:...` و`01:00:5e:...` و`33:33:...`). وهذه تُغمر دائماً، حتى لو استخدم جهازٌ ما ذلك العنوان مصدراً." },
        { en: "Check in this order: group address, unknown or aged (`now - entry[1] >= AGING`) means flood; then `entry[0] == port` means filter; anything else forwards to `entry[0]`.", ar: "افحص بهذا الترتيب: عنوان جماعي، أو غير معروف، أو متقادم (`now - entry[1] >= AGING`) يعني غمراً؛ ثم `entry[0] == port` يعني إسقاطاً؛ وأي شيء آخر يُمرَّر إلى `entry[0]`." },
      ],
      tests: [
        {
          name: { en: "The worked example: flood once, then forward", ar: "المثال المحلول: غمر مرة واحدة ثم تمرير" },
          stdin: "ports 4\n0 1 02:00:00:00:00:0a 02:00:00:00:00:0b\n1 2 02:00:00:00:00:0b 02:00:00:00:00:0a\n2 1 02:00:00:00:00:0a 02:00:00:00:00:0b\n",
          expected: "0 02:00:00:00:00:0a -> 02:00:00:00:00:0b: flood 2,3,4\n1 02:00:00:00:00:0b -> 02:00:00:00:00:0a: forward 1\n2 02:00:00:00:00:0a -> 02:00:00:00:00:0b: forward 2\n",
        },
        {
          name: { en: "Broadcast and multicast frames are always flooded", ar: "إطارات البث والبث المتعدد تُغمر دائماً" },
          stdin: "ports 4\n0 1 02:00:00:00:00:0a ff:ff:ff:ff:ff:ff\n1 2 02:00:00:00:00:0b 02:00:00:00:00:0a\n2 2 02:00:00:00:00:0b 01:00:5e:00:00:fb\n3 3 02:00:00:00:00:0c 33:33:00:00:00:01\n4 1 02:00:00:00:00:0a 02:00:00:00:00:0c\n",
          expected: "0 02:00:00:00:00:0a -> ff:ff:ff:ff:ff:ff: flood 2,3,4\n1 02:00:00:00:00:0b -> 02:00:00:00:00:0a: forward 1\n2 02:00:00:00:00:0b -> 01:00:5e:00:00:fb: flood 1,3,4\n3 02:00:00:00:00:0c -> 33:33:00:00:00:01: flood 1,2,4\n4 02:00:00:00:00:0a -> 02:00:00:00:00:0c: forward 3\n",
        },
        {
          name: { en: "Two devices behind the same port: their frames are filtered", ar: "جهازان خلف المنفذ نفسه: إطاراتهما تُسقَط" },
          stdin: "ports 3\n0 3 02:00:00:00:00:0c 02:00:00:00:00:0d\n1 3 02:00:00:00:00:0d 02:00:00:00:00:0c\n2 1 02:00:00:00:00:0a 02:00:00:00:00:0d\n3 3 02:00:00:00:00:0c 02:00:00:00:00:0d\n",
          expected: "0 02:00:00:00:00:0c -> 02:00:00:00:00:0d: flood 1,2\n1 02:00:00:00:00:0d -> 02:00:00:00:00:0c: filter\n2 02:00:00:00:00:0a -> 02:00:00:00:00:0d: forward 3\n3 02:00:00:00:00:0c -> 02:00:00:00:00:0d: filter\n",
        },
        {
          name: { en: "Ageing: 299 seconds is still valid, 300 seconds is forgotten", ar: "التقادم: 299 ثانية ما زالت صالحة، و300 ثانية تُنسى" },
          stdin: "ports 4\n0 1 02:00:00:00:00:0a 02:00:00:00:00:0b\n10 2 02:00:00:00:00:0b 02:00:00:00:00:0a\n300 3 02:00:00:00:00:0c 02:00:00:00:00:0a\n309 3 02:00:00:00:00:0c 02:00:00:00:00:0b\n310 3 02:00:00:00:00:0c 02:00:00:00:00:0b\n",
          expected: "0 02:00:00:00:00:0a -> 02:00:00:00:00:0b: flood 2,3,4\n10 02:00:00:00:00:0b -> 02:00:00:00:00:0a: forward 1\n300 02:00:00:00:00:0c -> 02:00:00:00:00:0a: flood 1,2,4\n309 02:00:00:00:00:0c -> 02:00:00:00:00:0b: forward 2\n310 02:00:00:00:00:0c -> 02:00:00:00:00:0b: flood 1,2,4\n",
        },
        {
          name: { en: "A laptop moves to another port and is found there", ar: "حاسوب محمول ينتقل إلى منفذ آخر فيُعثر عليه هناك" },
          stdin: "ports 4\n0 1 02:00:00:00:00:0a 02:00:00:00:00:0b\n5 2 02:00:00:00:00:0b 02:00:00:00:00:0a\n6 4 02:00:00:00:00:0a 02:00:00:00:00:0b\n7 2 02:00:00:00:00:0b 02:00:00:00:00:0a\n",
          expected: "0 02:00:00:00:00:0a -> 02:00:00:00:00:0b: flood 2,3,4\n5 02:00:00:00:00:0b -> 02:00:00:00:00:0a: forward 1\n6 02:00:00:00:00:0a -> 02:00:00:00:00:0b: forward 2\n7 02:00:00:00:00:0b -> 02:00:00:00:00:0a: forward 4\n",
        },
        {
          name: { en: "No frames: nothing is printed", ar: "لا إطارات: لا يُطبع شيء" },
          stdin: "ports 8\n",
          expected: "",
        },
      ],
      sampleInput: "ports 4\n0 1 02:00:00:00:00:0a 02:00:00:00:00:0b\n1 2 02:00:00:00:00:0b 02:00:00:00:00:0a\n2 1 02:00:00:00:00:0a 02:00:00:00:00:0b\n",
    },
    {
      type: "text",
      body: {
        en: `## VLANs: several networks on one switch

Often you want the guests, the staff and the cameras on separate networks, without buying three switches. A **VLAN** (virtual LAN, IEEE 802.1Q) does that: the switch keeps a separate MAC table and a separate broadcast domain per VLAN, so a frame in VLAN 10 can never reach a port in VLAN 20. To get from one VLAN to another, traffic must go through a **router** (or a "layer 3 switch" that routes internally), where a firewall can check it.

Ports come in two kinds:

- An **access port** belongs to one VLAN. The device plugged in sends ordinary, **untagged** frames and has no idea VLANs exist.
- A **trunk port** carries many VLANs between switches (or to a router), so each frame gets a 4-byte **802.1Q tag** that says which VLAN it belongs to. Frames of one VLAN, the **native VLAN**, cross the trunk untagged.

The tag is inserted right after the source MAC:

\`\`\`text
untagged:  | dst MAC (6) | src MAC (6) | EtherType (2) | payload ...
tagged:    | dst MAC (6) | src MAC (6) | 0x8100 (2) | TCI (2) | EtherType (2) | payload ...

TCI = 16 bits:  PCP (3)  |  DEI (1)  |  VLAN ID (12)
                priority    drop        1 to 4094 usable (0 and 4095 are reserved)
\`\`\`

\`0x8100\` (the **TPID**) sits where the EtherType would be, which is how a receiver knows a tag follows. **PCP** is a priority (0-7) used for quality of service, such as giving voice traffic precedence. The 12-bit **VLAN ID** allows 4094 usable VLANs. A security note: leave the native VLAN unused by real devices, and never trust the VLAN alone to separate sensitive systems; misconfigured trunks allow **VLAN hopping**.`,
        ar: `## الشبكات المحلية الافتراضية: عدة شبكات على سويتش واحد

كثيراً ما تريد أن يكون الضيوف والموظفون والكاميرات على شبكات منفصلة، دون شراء ثلاثة سويتشات. وهذا ما تفعله **الشبكة المحلية الافتراضية (VLAN)** (IEEE 802.1Q): يحتفظ السويتش بجدول MAC مستقل ونطاق بث مستقل لكل VLAN، فلا يمكن لإطار في VLAN 10 أن يصل أبداً إلى منفذ في VLAN 20. وللانتقال من VLAN إلى أخرى يجب أن تمر الحركة عبر **راوتر** (أو "سويتش من الطبقة الثالثة" يوجّه داخلياً)، حيث يستطيع جدار ناري أن يفحصها.

والمنافذ نوعان:

- **منفذ الوصول (access port)** ينتمي إلى VLAN واحدة. والجهاز الموصول به يرسل إطارات عادية **غير موسومة (untagged)** ولا يعلم بوجود الشبكات الافتراضية أصلاً.
- **منفذ الجذع (trunk port)** يحمل عدة VLANs بين السويتشات (أو إلى راوتر)، فيحصل كل إطار على **وسم 802.1Q** من 4 بايتات يقول إلى أي VLAN ينتمي. وإطارات VLAN واحدة، هي **الشبكة الأصلية (native VLAN)**، تعبر الجذع دون وسم.

يُدرج الوسم مباشرة بعد عنوان MAC المصدر:

\`\`\`text
غير موسوم:  | dst MAC (6) | src MAC (6) | EtherType (2) | payload ...
موسوم:      | dst MAC (6) | src MAC (6) | 0x8100 (2) | TCI (2) | EtherType (2) | payload ...

TCI = 16 بتاً:  PCP (3)  |  DEI (1)  |  VLAN ID (12)
                الأولوية    الإسقاط     من 1 إلى 4094 صالحة (0 و4095 محجوزتان)
\`\`\`

القيمة \`0x8100\` (وتسمى **TPID**) تقع حيث كان سيقع EtherType، وبها يعرف المستقبِل أن وسماً يتبعها. و**PCP** أولوية (من 0 إلى 7) تُستخدم لجودة الخدمة، مثل إعطاء الحركة الصوتية الأسبقية. ويسمح **معرّف VLAN** ذو الـ 12 بتاً بـ 4094 شبكة صالحة. وملاحظة أمنية: اترك الشبكة الأصلية دون أجهزة حقيقية، ولا تعتمد على VLAN وحدها لعزل الأنظمة الحساسة؛ فالجذوع سيئة الإعداد تسمح بـ **القفز بين الشبكات الافتراضية (VLAN hopping)**.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: String.raw`# Read and add 802.1Q VLAN tags. The MAC addresses are made up (locally administered).
def describe(frame):
    tpid = int.from_bytes(frame[12:14], "big")
    if tpid != 0x8100:
        return "untagged, EtherType 0x%04x" % tpid
    tci = int.from_bytes(frame[14:16], "big")
    pcp, dei, vid = tci >> 13, (tci >> 12) & 1, tci & 0x0FFF
    ethertype = int.from_bytes(frame[16:18], "big")
    return "VLAN %d, priority %d, DEI %d, EtherType 0x%04x" % (vid, pcp, dei, ethertype)


def add_tag(frame, vid, pcp=0):
    """What a switch does when an untagged frame leaves through a trunk port."""
    tci = (pcp << 13) | vid
    return frame[:12] + (0x8100).to_bytes(2, "big") + tci.to_bytes(2, "big") + frame[12:]


arp_on_trunk = bytes.fromhex("ffffffffffff" "020000000001" "8100" "a064" "0806")
print(describe(arp_on_trunk))

untagged = bytes.fromhex("020000000002" "020000000001" "0800")
print(describe(untagged))
tagged = add_tag(untagged, 20, pcp=5)
print(describe(tagged), "->", tagged.hex())
print("usable VLAN IDs: 1 to", 0x0FFF - 1)
`,
      explanation: {
        en: "The first frame carries TCI 0xa064: the top 3 bits (101) give priority 5 and the low 12 bits (0x064) give VLAN 100. Adding a tag inserts 4 bytes after the source MAC, and the original EtherType moves back by 4 bytes. Try VLAN 4095 and decide whether a switch should accept it.",
        ar: "يحمل الإطار الأول TCI قيمته 0xa064: البتات الثلاث العليا (101) تعطي الأولوية 5، والبتات الاثنتا عشرة الدنيا (0x064) تعطي VLAN 100. وإضافة الوسم تُدرج 4 بايتات بعد عنوان MAC المصدر، فيتأخر EtherType الأصلي 4 بايتات. جرّب VLAN 4095 وقرّر هل ينبغي للسويتش أن يقبلها.",
      },
    },
    {
      type: "text",
      body: {
        en: `## ARP: from IP address to MAC address

Your laptop wants to send a packet to \`192.168.1.20\`. The packet needs an Ethernet frame around it, and the frame needs a **destination MAC**. Where does that come from? From **ARP** (Address Resolution Protocol, RFC 826). But first the host makes one decision, using its own address and mask:

- **Same subnet** (\`destination AND mask == my network\`): the destination is *on-link*, so the host needs **the destination's own MAC**.
- **Different subnet**: the packet must go to the **default gateway** (the router), so the host needs **the gateway's MAC**, even though the IP header still says the final destination.

Then it checks its **ARP cache**. If the MAC is unknown it broadcasts a question and waits for a unicast answer:

\`\`\`text
192.168.1.10 -> ff:ff:ff:ff:ff:ff   ARP request:  who has 192.168.1.20? tell 192.168.1.10
192.168.1.20 -> 192.168.1.10        ARP reply:    192.168.1.20 is at 02:00:00:00:00:20
\`\`\`

Answers are cached for a short while (typically seconds to minutes, depending on the system) and confirmed again when they go stale; see the cache with \`ip neigh\` on Linux or \`arp -a\` on Windows. A **gratuitous ARP**, an announcement nobody asked for, lets a device tell everyone its mapping, for example after a failover. IPv6 does the same job with the **Neighbor Discovery Protocol** (NDP, RFC 4861), using ICMPv6 instead of broadcasts.

Notice what this means for a packet that crosses routers, which you met in the OSI lesson: the **IP addresses stay the same from end to end, while the MAC addresses are rewritten at every hop**. Each router ARPs for the next hop on each link. And notice the weakness: ARP has **no authentication**. Any device on the LAN can answer "the gateway is at *my* MAC". You will see that attack, ARP spoofing, and its defences in the network security lesson.`,
        ar: `## ARP: من عنوان IP إلى عنوان MAC

يريد حاسوبك المحمول أن يرسل حزمة إلى \`192.168.1.20\`. والحزمة تحتاج إطار Ethernet حولها، والإطار يحتاج **عنوان MAC للوجهة**. فمن أين يأتي؟ من **ARP** (بروتوكول تحليل العناوين، RFC 826). لكن الجهاز يتخذ أولاً قراراً واحداً، مستخدماً عنوانه وقناعه:

- **الشبكة الفرعية نفسها** (\`destination AND mask == شبكتي\`): الوجهة *على الرابط (on-link)*، فيحتاج الجهاز إلى **عنوان MAC الخاص بالوجهة نفسها**.
- **شبكة فرعية مختلفة**: يجب أن تذهب الحزمة إلى **البوابة الافتراضية** (الراوتر)، فيحتاج الجهاز إلى **عنوان MAC الخاص بالبوابة**، رغم أن ترويسة IP ما زالت تذكر الوجهة النهائية.

ثم يفحص **ذاكرة ARP المؤقتة (ARP cache)**. فإن كان عنوان MAC مجهولاً يبث سؤالاً وينتظر جواباً أحادياً:

\`\`\`text
192.168.1.10 -> ff:ff:ff:ff:ff:ff   ARP request:  who has 192.168.1.20? tell 192.168.1.10
192.168.1.20 -> 192.168.1.10        ARP reply:    192.168.1.20 is at 02:00:00:00:00:20
\`\`\`

تُخزَّن الأجوبة مؤقتاً لمدة قصيرة (من ثوانٍ إلى دقائق عادةً، بحسب النظام) ويُعاد تأكيدها حين تتقادم؛ وترى الذاكرة بالأمر \`ip neigh\` في Linux أو \`arp -a\` في Windows. و**ARP المجاني (gratuitous ARP)**، أي إعلان لم يطلبه أحد، يسمح للجهاز بأن يخبر الجميع بربطه، مثلاً بعد التحويل إلى جهاز احتياطي (failover). ويؤدي IPv6 المهمة نفسها بـ **بروتوكول اكتشاف الجيران (NDP، RFC 4861)**، مستخدماً ICMPv6 بدلاً من البث.

ولاحظ ما يعنيه هذا لحزمة تعبر عدة راوترات، وقد قابلت ذلك في درس OSI: **عناوين IP تبقى كما هي من الطرف إلى الطرف، بينما تُعاد كتابة عناوين MAC عند كل قفزة**. فكل راوتر يرسل ARP للقفزة التالية على كل رابط. ولاحظ نقطة الضعف: ARP **لا توثيق فيه**. فأي جهاز على الشبكة المحلية يستطيع أن يجيب "البوابة عند عنوان MAC *الخاص بي*". وسترى هذا الهجوم، انتحال ARP (ARP spoofing)، ودفاعاته في درس أمن الشبكات.`,
      },
    },
    {
      type: "lab",
      id: "arp-resolve",
      lang: "java",
      prompt: {
        en: `Write the **ARP logic of a host**: for each packet it sends, choose the next hop and either use the cached MAC or ask for it.

**Input:** the first line is \`host <ip>/<prefix> gw <gateway-ip or none>\` (prefix 8 to 30). Every following line is an event:

- \`send <ip>\`: the host wants to send a packet to \`<ip>\`.
- \`reply <ip> <mac>\`: an ARP reply arrived.

**Rules for \`send\`**

- If \`<ip>\` is the **broadcast address of the host's own subnet**: \`frame to ff:ff:ff:ff:ff:ff (broadcast)\` (no ARP needed).
- The next hop is \`<ip>\` itself if it is in the host's subnet (\`on-link\`), otherwise the gateway (\`gateway\`). An off-link destination with \`gw none\` gives \`no route\`.
- If the next hop is in the ARP cache: \`next hop <hop> (<on-link|gateway>), frame to <mac>\`; otherwise \`next hop <hop> (<on-link|gateway>), ARP who-has <hop>\`.

**Rules for \`reply\`** (store MACs in lower case)

- From an IP outside the host's subnet: \`ignored (not on-link)\`.
- Otherwise: \`learned <mac>\` (new entry), \`refreshed <mac>\` (same MAC as before) or \`changed <old> -> <new>\`, and store it.

**Output**, one line per event: \`<send|reply> <ip>: <result>\`.

**Example**

\`\`\`text
Input:
host 192.168.1.10/24 gw 192.168.1.1
send 192.168.1.20
reply 192.168.1.20 02:00:00:00:00:20
send 192.168.1.20
send 203.0.113.5

Output:
send 192.168.1.20: next hop 192.168.1.20 (on-link), ARP who-has 192.168.1.20
reply 192.168.1.20: learned 02:00:00:00:00:20
send 192.168.1.20: next hop 192.168.1.20 (on-link), frame to 02:00:00:00:00:20
send 203.0.113.5: next hop 192.168.1.1 (gateway), ARP who-has 192.168.1.1
\`\`\``,
        ar: `اكتب **منطق ARP في جهاز مضيف**: لكل حزمة يرسلها، اختر القفزة التالية، ثم استخدم عنوان MAC المخزَّن أو اسأل عنه.

**الإدخال:** السطر الأول هو \`host <ip>/<prefix> gw <عنوان البوابة أو none>\` (البادئة من 8 إلى 30). وكل سطر بعده حدث:

- \`send <ip>\`: يريد الجهاز أن يرسل حزمة إلى \`<ip>\`.
- \`reply <ip> <mac>\`: وصل رد ARP.

**قواعد \`send\`**

- إذا كان \`<ip>\` هو **عنوان البث في الشبكة الفرعية للجهاز نفسه**: \`frame to ff:ff:ff:ff:ff:ff (broadcast)\` (لا حاجة إلى ARP).
- القفزة التالية هي \`<ip>\` نفسه إذا كان في الشبكة الفرعية للجهاز (\`on-link\`)، وإلا فهي البوابة (\`gateway\`). والوجهة خارج الرابط مع \`gw none\` تعطي \`no route\`.
- إذا كانت القفزة التالية في ذاكرة ARP: \`next hop <hop> (<on-link|gateway>), frame to <mac>\`؛ وإلا \`next hop <hop> (<on-link|gateway>), ARP who-has <hop>\`.

**قواعد \`reply\`** (خزّن عناوين MAC بأحرف صغيرة)

- من عنوان IP خارج الشبكة الفرعية للجهاز: \`ignored (not on-link)\`.
- وإلا: \`learned <mac>\` (مُدخل جديد)، أو \`refreshed <mac>\` (عنوان MAC نفسه كما كان)، أو \`changed <old> -> <new>\`، ثم خزّنه.

**الإخراج**، سطر لكل حدث: \`<send|reply> <ip>: <result>\`.

**مثال**

\`\`\`text
الإدخال:
host 192.168.1.10/24 gw 192.168.1.1
send 192.168.1.20
reply 192.168.1.20 02:00:00:00:00:20
send 192.168.1.20
send 203.0.113.5

الإخراج:
send 192.168.1.20: next hop 192.168.1.20 (on-link), ARP who-has 192.168.1.20
reply 192.168.1.20: learned 02:00:00:00:00:20
send 192.168.1.20: next hop 192.168.1.20 (on-link), frame to 02:00:00:00:00:20
send 203.0.113.5: next hop 192.168.1.1 (gateway), ARP who-has 192.168.1.1
\`\`\``,
      },
      starterCode: String.raw`import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

public class Main {
    static long ip(String dotted) {
        String[] p = dotted.split("\\.");
        long v = 0;
        for (String part : p) v = (v << 8) | Long.parseLong(part);
        return v;
    }

    public static void main(String[] args) throws Exception {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String first = in.readLine();
        if (first == null || first.isBlank()) return;
        // host <ip>/<prefix> gw <gateway or none>
        String[] h = first.trim().split("\\s+");
        String[] cidr = h[1].split("/");
        long me = ip(cidr[0]);
        int prefix = Integer.parseInt(cidr[1]);
        long mask = prefix == 0 ? 0 : (0xFFFFFFFFL << (32 - prefix)) & 0xFFFFFFFFL;
        long network = me & mask;
        // TODO: compute the subnet's broadcast address (all host bits set to 1)
        String gateway = h[3].equals("none") ? null : h[3];

        Map<String, String> cache = new HashMap<>(); // IP -> MAC (the ARP cache)
        String line;
        while ((line = in.readLine()) != null) {
            String[] f = line.trim().split("\\s+");
            if (f.length < 2) continue;
            long target = ip(f[1]);
            boolean onLink = (target & mask) == network;
            String out;
            if (f[0].equals("send")) {
                // TODO: broadcast address, off-link without a gateway ("no route"), and the gateway as next hop
                String mac = cache.get(f[1]);
                out = "next hop " + f[1] + " (on-link), " + (mac != null ? "frame to " + mac : "ARP who-has " + f[1]);
            } else {
                // TODO: ignore replies from outside the subnet; report learned / refreshed / changed
                String mac = f[2].toLowerCase();
                cache.put(f[1], mac);
                out = "learned " + mac;
            }
            System.out.println(f[0] + " " + f[1] + ": " + out);
        }
    }
}
`,
      solution: String.raw`import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

public class Main {
    static long ip(String dotted) {
        String[] p = dotted.split("\\.");
        long v = 0;
        for (String part : p) v = (v << 8) | Long.parseLong(part);
        return v;
    }

    public static void main(String[] args) throws Exception {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String first = in.readLine();
        if (first == null || first.isBlank()) return;
        // host <ip>/<prefix> gw <gateway or none>
        String[] h = first.trim().split("\\s+");
        String[] cidr = h[1].split("/");
        long me = ip(cidr[0]);
        int prefix = Integer.parseInt(cidr[1]);
        long mask = prefix == 0 ? 0 : (0xFFFFFFFFL << (32 - prefix)) & 0xFFFFFFFFL;
        long network = me & mask;
        long broadcast = network | (~mask & 0xFFFFFFFFL);
        String gateway = h[3].equals("none") ? null : h[3];

        Map<String, String> cache = new HashMap<>(); // IP -> MAC (the ARP cache)
        String line;
        while ((line = in.readLine()) != null) {
            String[] f = line.trim().split("\\s+");
            if (f.length < 2) continue;
            long target = ip(f[1]);
            boolean onLink = (target & mask) == network;
            String out;
            if (f[0].equals("send")) {
                if (target == broadcast) {
                    out = "frame to ff:ff:ff:ff:ff:ff (broadcast)";
                } else if (!onLink && gateway == null) {
                    out = "no route";
                } else {
                    String hop = onLink ? f[1] : gateway;
                    String how = hop + (onLink ? " (on-link)" : " (gateway)");
                    String mac = cache.get(hop);
                    out = "next hop " + how + ", " + (mac != null ? "frame to " + mac : "ARP who-has " + hop);
                }
            } else {
                String mac = f[2].toLowerCase();
                String old = cache.get(f[1]);
                if (!onLink) out = "ignored (not on-link)";
                else if (old == null) out = "learned " + mac;
                else if (old.equals(mac)) out = "refreshed " + mac;
                else out = "changed " + old + " -> " + mac;
                if (onLink) cache.put(f[1], mac);
            }
            System.out.println(f[0] + " " + f[1] + ": " + out);
        }
    }
}
`,
      hints: [
        { en: "The broadcast address has every host bit set: `network | (~mask & 0xFFFFFFFFL)`. Check it before anything else in `send`.", ar: "عنوان البث تكون فيه كل بتات المضيف مساوية لـ 1: `network | (~mask & 0xFFFFFFFFL)`. افحصه قبل أي شيء آخر في `send`." },
        { en: "The next hop is `onLink ? f[1] : gateway`, and the ARP cache is looked up with the **next hop**, not the final destination: every off-link packet uses the gateway's MAC.", ar: "القفزة التالية هي `onLink ? f[1] : gateway`، ويُبحث في ذاكرة ARP بـ **القفزة التالية** لا بالوجهة النهائية: فكل حزمة خارج الرابط تستخدم عنوان MAC الخاص بالبوابة." },
        { en: "For `reply`, read the old entry first with `cache.get(f[1])`, choose learned / refreshed / changed by comparing it, and only then `put` the new MAC (never for an off-link sender).", ar: "في `reply` اقرأ المُدخل القديم أولاً بـ `cache.get(f[1])`، واختر learned أو refreshed أو changed بالمقارنة معه، ثم ضع عنوان MAC الجديد بـ `put` (ولا تفعل ذلك أبداً لمرسل خارج الرابط)." },
      ],
      tests: [
        {
          name: { en: "The worked example, then a second off-link destination", ar: "المثال المحلول، ثم وجهة ثانية خارج الرابط" },
          stdin: "host 192.168.1.10/24 gw 192.168.1.1\nsend 192.168.1.20\nreply 192.168.1.20 02:00:00:00:00:20\nsend 192.168.1.20\nsend 203.0.113.5\nreply 192.168.1.1 02:00:00:00:00:01\nsend 198.51.100.7\n",
          expected: "send 192.168.1.20: next hop 192.168.1.20 (on-link), ARP who-has 192.168.1.20\nreply 192.168.1.20: learned 02:00:00:00:00:20\nsend 192.168.1.20: next hop 192.168.1.20 (on-link), frame to 02:00:00:00:00:20\nsend 203.0.113.5: next hop 192.168.1.1 (gateway), ARP who-has 192.168.1.1\nreply 192.168.1.1: learned 02:00:00:00:00:01\nsend 198.51.100.7: next hop 192.168.1.1 (gateway), frame to 02:00:00:00:00:01\n",
        },
        {
          name: { en: "Broadcast, a refreshed entry and a gateway whose MAC changes", ar: "البث، ومُدخل يُحدَّث، وبوابة يتغير عنوان MAC الخاص بها" },
          stdin: "host 10.1.2.3/16 gw 10.1.0.1\nsend 10.1.255.255\nreply 10.1.0.1 02:00:00:00:aa:01\nreply 10.1.0.1 02:00:00:00:AA:01\nreply 10.1.0.1 02:00:00:00:bb:02\nsend 198.51.100.1\nsend 10.1.200.9\n",
          expected: "send 10.1.255.255: frame to ff:ff:ff:ff:ff:ff (broadcast)\nreply 10.1.0.1: learned 02:00:00:00:aa:01\nreply 10.1.0.1: refreshed 02:00:00:00:aa:01\nreply 10.1.0.1: changed 02:00:00:00:aa:01 -> 02:00:00:00:bb:02\nsend 198.51.100.1: next hop 10.1.0.1 (gateway), frame to 02:00:00:00:bb:02\nsend 10.1.200.9: next hop 10.1.200.9 (on-link), ARP who-has 10.1.200.9\n",
        },
        {
          name: { en: "A /25: the other half of the /24 is off-link", ar: "شبكة /25: النصف الآخر من /24 خارج الرابط" },
          stdin: "host 192.168.1.130/25 gw 192.168.1.129\nsend 192.168.1.200\nsend 192.168.1.100\nreply 192.168.1.100 02:00:00:00:00:64\nsend 192.168.1.255\nsend 192.168.1.127\n",
          expected: "send 192.168.1.200: next hop 192.168.1.200 (on-link), ARP who-has 192.168.1.200\nsend 192.168.1.100: next hop 192.168.1.129 (gateway), ARP who-has 192.168.1.129\nreply 192.168.1.100: ignored (not on-link)\nsend 192.168.1.255: frame to ff:ff:ff:ff:ff:ff (broadcast)\nsend 192.168.1.127: next hop 192.168.1.129 (gateway), ARP who-has 192.168.1.129\n",
        },
        {
          name: { en: "No gateway: off-link destinations have no route", ar: "لا بوابة: الوجهات خارج الرابط لا مسار لها" },
          stdin: "host 172.16.5.10/24 gw none\nsend 172.16.5.1\nsend 172.16.6.1\nreply 172.16.5.1 02:00:00:00:00:01\nsend 172.16.5.1\n",
          expected: "send 172.16.5.1: next hop 172.16.5.1 (on-link), ARP who-has 172.16.5.1\nsend 172.16.6.1: no route\nreply 172.16.5.1: learned 02:00:00:00:00:01\nsend 172.16.5.1: next hop 172.16.5.1 (on-link), frame to 02:00:00:00:00:01\n",
        },
        {
          name: { en: "No events: nothing is printed", ar: "لا أحداث: لا يُطبع شيء" },
          stdin: "host 192.168.0.2/24 gw 192.168.0.1\n",
          expected: "",
        },
      ],
      sampleInput: "host 192.168.1.10/24 gw 192.168.1.1\nsend 192.168.1.20\nreply 192.168.1.20 02:00:00:00:00:20\nsend 192.168.1.20\nsend 203.0.113.5\n",
    },
    {
      type: "text",
      body: {
        en: `## Routing: static and dynamic

A router receives a packet, looks the destination up in its **routing table** with **longest-prefix match** (you implemented that in the IP lesson), decrements the **TTL**, and sends the packet out of the chosen interface towards the **next hop**. If the TTL reaches 0 the packet is dropped and an ICMP "time exceeded" message goes back to the sender; that rule stops a packet from looping forever, and it is exactly what \`traceroute\` uses. A Linux host's table looks like this:

\`\`\`text
$ ip route
default via 192.168.1.1 dev eth0 proto dhcp metric 100
10.20.0.0/16 via 192.168.1.254 dev eth0
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10
\`\`\`

The last line is a **connected** route (the subnet of an interface). The middle line is a **static** route, added by hand with \`ip route add 10.20.0.0/16 via 192.168.1.254\`. The first is the **default route**. \`ip route get 203.0.113.5\` asks the kernel which route it would pick.

**Static routes** are simple and predictable, but nobody updates them when a link fails, and typing hundreds of them does not scale. So routers run **dynamic routing protocols** that discover routes and react to failures. When two sources offer the same prefix, the router prefers the more trusted source; Cisco calls this **administrative distance** (by default connected 0, static 1, eBGP 20, OSPF 110, RIP 120, iBGP 200), and then compares the protocol's own **metric**.

### Three families of routing protocols

- **Distance vector** (RIP, RFC 2453): each router tells its neighbours "I can reach X at cost N", and they add their link cost. RIP counts hops, treats 16 as infinity and sends updates every 30 seconds. Simple, but slow to converge, and after a failure routers can "count to infinity" while bad news spreads.
- **Link state** (OSPF, RFC 2328 for IPv4 and RFC 5340 for IPv6; and IS-IS): every router floods a description of its own links (**LSAs**) to the whole area, so every router builds **the same map**, then runs **Dijkstra's shortest-path-first** algorithm from itself. Link costs are configurable; Cisco's default derives them from a 100 Mbit/s reference bandwidth. Large networks are split into **areas** around a backbone area 0. OSPF converges fast and is the usual choice inside a company.
- **Path vector** (BGP-4, RFC 4271): the routing protocol *between* organisations. Each **autonomous system** (an ISP, a cloud, a large company, identified by an AS number) announces the prefixes it can reach, together with the **AS path**, the list of ASes on the way. A router rejects a path that already contains its own AS, which prevents loops, and operators choose routes by **policy** (cost, contracts), not just by distance. BGP runs over TCP port 179. A mistaken or malicious announcement can pull traffic for someone else's prefix (a route leak or hijack); **RPKI** (RFC 6480) lets networks check that an AS is authorised to originate a prefix.

Inside one organisation you use an **IGP** such as OSPF; between organisations, the **EGP** of the Internet is BGP.`,
        ar: `## التوجيه: الثابت والديناميكي

يستقبل الراوتر الحزمة، ويبحث عن الوجهة في **جدول التوجيه** بـ **أطول بادئة مطابقة** (وقد نفّذت ذلك في درس IP)، ويُنقص **TTL**، ويرسل الحزمة من الواجهة المختارة نحو **القفزة التالية**. فإذا بلغ TTL الصفر أُسقطت الحزمة وعادت إلى المرسل رسالة ICMP من نوع "time exceeded"؛ وهذه القاعدة تمنع الحزمة من الدوران إلى الأبد، وهي بالضبط ما يستخدمه \`traceroute\`. ويبدو جدول جهاز Linux هكذا:

\`\`\`text
$ ip route
default via 192.168.1.1 dev eth0 proto dhcp metric 100
10.20.0.0/16 via 192.168.1.254 dev eth0
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10
\`\`\`

السطر الأخير مسار **متصل (connected)** (الشبكة الفرعية لواجهة ما). والسطر الأوسط مسار **ثابت (static)** أُضيف يدوياً بالأمر \`ip route add 10.20.0.0/16 via 192.168.1.254\`. والأول هو **المسار الافتراضي**. والأمر \`ip route get 203.0.113.5\` يسأل النواة أي مسار ستختار.

**المسارات الثابتة** بسيطة ويمكن توقعها، لكن لا أحد يحدّثها حين يتعطل رابط، وكتابة المئات منها لا تتسع. لذلك تشغّل الراوترات **بروتوكولات توجيه ديناميكية** تكتشف المسارات وتتفاعل مع الأعطال. وحين يعرض مصدران البادئة نفسها، يفضّل الراوتر المصدر الأوثق؛ وتسمي Cisco ذلك **المسافة الإدارية (administrative distance)** (افتراضياً: المتصل 0، والثابت 1، وeBGP 20، وOSPF 110، وRIP 120، وiBGP 200)، ثم يقارن **المقياس (metric)** الخاص بالبروتوكول.

### ثلاث عائلات من بروتوكولات التوجيه

- **متجه المسافة (distance vector)** (RIP، RFC 2453): يخبر كل راوتر جيرانه "أستطيع الوصول إلى X بكلفة N"، فيضيفون كلفة رابطهم. ويَعُدّ RIP القفزات، ويعامل 16 على أنها لانهاية، ويرسل التحديثات كل 30 ثانية. بسيط، لكنه بطيء التقارب، وبعد العطل قد "تَعُدّ الراوترات إلى اللانهاية" بينما ينتشر الخبر السيئ.
- **حالة الرابط (link state)** (OSPF، وRFC 2328 لـ IPv4 وRFC 5340 لـ IPv6؛ وكذلك IS-IS): يغمر كل راوتر المنطقة كلها بوصف لروابطه (**LSAs**)، فيبني كل راوتر **الخريطة نفسها**، ثم يشغّل **خوارزمية Dijkstra لأقصر مسار أولاً (SPF)** انطلاقاً من نفسه. وكُلف الروابط قابلة للضبط؛ والقيمة الافتراضية في Cisco تُشتق من عرض نطاق مرجعي قدره 100 Mbit/s. وتُقسَّم الشبكات الكبيرة إلى **مناطق (areas)** حول منطقة فقرية رقمها 0. ويتقارب OSPF بسرعة، وهو الخيار المعتاد داخل الشركات.
- **متجه المسار (path vector)** (BGP-4، RFC 4271): بروتوكول التوجيه *بين* المؤسسات. فكل **نظام مستقل (autonomous system)** (مزوّد خدمة أو سحابة أو شركة كبيرة، يُعرَّف برقم AS) يعلن البادئات التي يستطيع الوصول إليها، ومعها **مسار AS (AS path)**، أي قائمة الأنظمة المستقلة على الطريق. ويرفض الراوتر المسار الذي يحتوي نظامه المستقل أصلاً، فتُمنع الحلقات، ويختار المشغّلون المسارات بحسب **السياسة** (الكلفة والعقود) لا بحسب المسافة وحدها. ويعمل BGP فوق منفذ TCP رقم 179. والإعلان الخاطئ أو الخبيث قد يسحب حركة بادئة تخص غيرك (تسرّب مسار أو اختطافه)؛ ويسمح **RPKI** (RFC 6480) للشبكات بالتحقق من أن النظام المستقل مخوَّل بإعلان البادئة.

داخل المؤسسة الواحدة تستخدم **بروتوكول بوابة داخلياً (IGP)** مثل OSPF؛ وبين المؤسسات فإن **بروتوكول البوابة الخارجي (EGP)** للإنترنت هو BGP.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: String.raw`// Distance-vector routing, the idea behind RIP: a router only knows its neighbours and what
// they tell it. In every round all routers send their tables at the same time.
const links = { A: { B: 1, C: 5 }, B: { A: 1, C: 2 }, C: { A: 5, B: 2, D: 1 }, D: { C: 1 } };
const routers = Object.keys(links);
let table = {}; // table[router][destination] = { cost, via }
routers.forEach(function (r) {
  table[r] = {};
  table[r][r] = { cost: 0, via: "-" };
});

function show(round) {
  const row = routers.map(function (d) {
    const e = table.A[d];
    return d + "=" + (e ? e.cost + " via " + e.via : "?");
  });
  console.log("round " + round + ": A knows  " + row.join(" | "));
}

show(0);
for (let round = 1; round <= 10; round++) {
  const next = {};
  let changed = false;
  routers.forEach(function (r) {
    next[r] = {};
    next[r][r] = { cost: 0, via: "-" };
    Object.keys(links[r]).forEach(function (n) {
      Object.keys(table[n]).forEach(function (d) {
        const cost = links[r][n] + table[n][d].cost; // neighbour's cost plus the link to it
        if (!next[r][d] || cost < next[r][d].cost) next[r][d] = { cost: cost, via: n };
      });
    });
    routers.forEach(function (d) {
      const a = table[r][d], b = next[r][d];
      if ((a && a.cost) !== (b && b.cost)) changed = true;
    });
  });
  table = next;
  if (!changed) {
    console.log("round " + round + ": no change, the network has converged");
    break;
  }
  show(round);
}
`,
      explanation: {
        en: "A learns about D only in round 2, and only in round 3 does it find the cheaper path through B (1 + 2 + 1 = 4 instead of 5 + 1). Good news travels one hop per round, which is why distance-vector protocols converge slowly in big networks. Link-state protocols such as OSPF avoid this: every router gets the whole map and computes the result at once, as you will do in the lab. Change the A-C cost to 1 and predict the table first.",
        ar: "لا يعرف A بوجود D إلا في الجولة 2، ولا يجد المسار الأرخص عبر B إلا في الجولة 3 (1 + 2 + 1 = 4 بدلاً من 5 + 1). فالخبر السار ينتقل قفزة واحدة في كل جولة، ولهذا تتقارب بروتوكولات متجه المسافة ببطء في الشبكات الكبيرة. أما بروتوكولات حالة الرابط مثل OSPF فتتجنب ذلك: يحصل كل راوتر على الخريطة كاملة ويحسب النتيجة دفعة واحدة، كما ستفعل في المختبر. غيّر كلفة الرابط A-C إلى 1 وتوقّع الجدول أولاً.",
      },
    },
    {
      type: "lab",
      id: "ospf-spf",
      lang: "cpp",
      prompt: {
        en: `Be an **OSPF router**: you have the whole link-state map; compute your routing table with **Dijkstra's shortest-path-first** algorithm.

**Input:** the first line is the name of **your** router. Every following line is a link \`link <router-a> <router-b> <cost>\`. Links work in both directions with the same cost; costs are positive integers. If the same pair of routers appears more than once, only the **cheapest** link counts. Ignore links from a router to itself.

**Output:** one line for every other router that appears in a link, in alphabetical (byte) order:

- \`<router> cost=<total cost> via <first hop>\`, where the first hop is the neighbour of your router where the shortest path starts;
- \`<router> unreachable\` if no path exists.

If several shortest paths have the same cost, choose the one whose **first hop** comes first alphabetically. (Real OSPF would keep all of them and share the load: equal-cost multipath.)

**Example**

\`\`\`text
Input:
R1
link R1 R2 10
link R2 R3 5
link R1 R3 20

Output:
R2 cost=10 via R2
R3 cost=15 via R2
\`\`\``,
        ar: `كن **راوتر OSPF**: لديك خريطة حالة الروابط كاملة؛ احسب جدول توجيهك بـ **خوارزمية Dijkstra لأقصر مسار أولاً**.

**الإدخال:** السطر الأول هو اسم راوترك **أنت**. وكل سطر بعده رابط \`link <router-a> <router-b> <cost>\`. والروابط تعمل في الاتجاهين بالكلفة نفسها؛ والكُلف أعداد صحيحة موجبة. وإذا ظهر الزوج نفسه من الراوترات أكثر من مرة فالرابط **الأرخص** وحده هو المعتمد. وتجاهل الروابط من راوتر إلى نفسه.

**الإخراج:** سطر لكل راوتر آخر يظهر في رابط، بالترتيب الأبجدي (بحسب البايتات):

- \`<router> cost=<الكلفة الكلية> via <القفزة الأولى>\`، والقفزة الأولى هي جار راوترك الذي يبدأ منه أقصر مسار؛
- \`<router> unreachable\` إذا لم يوجد مسار.

وإذا تساوت كلفة عدة مسارات قصيرة، فاختر المسار الذي تأتي **قفزته الأولى** أولاً أبجدياً. (أما OSPF الحقيقي فيحتفظ بها كلها ويوزّع الحِمل عليها: التوجيه متعدد المسارات متساوية الكلفة ECMP.)

**مثال**

\`\`\`text
الإدخال:
R1
link R1 R2 10
link R2 R3 5
link R1 R3 20

الإخراج:
R2 cost=10 via R2
R3 cost=15 via R2
\`\`\``,
      },
      starterCode: String.raw`#include <iostream>
#include <map>
#include <queue>
#include <set>
#include <string>
#include <tuple>
#include <vector>

using namespace std;

int main() {
    string source;
    if (!(cin >> source)) return 0;

    // graph[a][b] = cheapest cost of a link between a and b (links work in both directions)
    map<string, map<string, long long>> graph;
    set<string> routers;
    string word, a, b;
    long long cost;
    while (cin >> word >> a >> b >> cost) {
        if (word != "link" || a == b) continue;
        routers.insert(a);
        routers.insert(b);
        for (auto [x, y] : {pair{a, b}, pair{b, a}}) {
            auto it = graph[x].find(y);
            if (it == graph[x].end() || cost < it->second) graph[x][y] = cost;
        }
    }

    // best[router] = (total cost, first hop)
    map<string, pair<long long, string>> best;
    // TODO: run Dijkstra from 'source' with a priority_queue. A label is (cost, first hop):
    // compare labels as pairs, so equal costs fall back to the smaller first hop.
    // For now only the direct neighbours are filled in.
    for (auto& [v, w] : graph[source]) best[v] = {w, v};

    for (const string& r : routers) {
        if (r == source) continue;
        auto it = best.find(r);
        if (it == best.end()) cout << r << " unreachable\n";
        else cout << r << " cost=" << it->second.first << " via " << it->second.second << "\n";
    }
    return 0;
}
`,
      solution: String.raw`#include <iostream>
#include <map>
#include <queue>
#include <set>
#include <string>
#include <tuple>
#include <vector>

using namespace std;

int main() {
    string source;
    if (!(cin >> source)) return 0;

    // graph[a][b] = cheapest cost of a link between a and b (links work in both directions)
    map<string, map<string, long long>> graph;
    set<string> routers;
    string word, a, b;
    long long cost;
    while (cin >> word >> a >> b >> cost) {
        if (word != "link" || a == b) continue;
        routers.insert(a);
        routers.insert(b);
        for (auto [x, y] : {pair{a, b}, pair{b, a}}) {
            auto it = graph[x].find(y);
            if (it == graph[x].end() || cost < it->second) graph[x][y] = cost;
        }
    }

    // Dijkstra. A label is (cost, first hop): lower cost wins, and among equal costs the
    // alphabetically smaller first hop wins, so the result does not depend on input order.
    map<string, pair<long long, string>> best;
    set<string> done;
    priority_queue<tuple<long long, string, string>, vector<tuple<long long, string, string>>, greater<>> pq;
    best[source] = {0, ""};
    pq.push({0, "", source});
    while (!pq.empty()) {
        auto [d, hop, u] = pq.top();
        pq.pop();
        if (done.count(u)) continue;
        done.insert(u);
        for (auto& [v, w] : graph[u]) {
            pair<long long, string> label = {d + w, u == source ? v : hop};
            auto it = best.find(v);
            if (it == best.end() || label < it->second) {
                best[v] = label;
                pq.push({label.first, label.second, v});
            }
        }
    }

    for (const string& r : routers) {
        if (r == source) continue;
        auto it = best.find(r);
        if (it == best.end()) cout << r << " unreachable\n";
        else cout << r << " cost=" << it->second.first << " via " << it->second.second << "\n";
    }
    return 0;
}
`,
      hints: [
        { en: "Use a min-heap of `(cost, firstHop, router)`: `priority_queue<tuple<long long, string, string>, vector<...>, greater<>>`. Push `(0, \"\", source)` first and skip routers you have already finalised.", ar: "استخدم كومة صغرى من `(cost, firstHop, router)`: `priority_queue<tuple<long long, string, string>, vector<...>, greater<>>`. ادفع `(0, \"\", source)` أولاً وتخطَّ الراوترات التي حسمتها سابقاً." },
        { en: "When you relax the edge u to v, the first hop is `v` itself if `u` is the source, otherwise it is inherited from `u`. Build the label `{d + w, firstHop}`.", ar: "حين تُرخي الحافة من u إلى v، تكون القفزة الأولى هي `v` نفسها إذا كان `u` هو المصدر، وإلا فهي موروثة من `u`. ابنِ الوسم `{d + w, firstHop}`." },
        { en: "Store the label only if it is smaller than the current one: comparing two `pair`s checks the cost first and then the first hop, which is exactly the tie rule.", ar: "خزّن الوسم فقط إذا كان أصغر من الحالي: مقارنة زوجين من نوع `pair` تفحص الكلفة أولاً ثم القفزة الأولى، وهذه بالضبط قاعدة كسر التعادل." },
      ],
      tests: spfTests,
      sampleInput: "R1\nlink R1 R2 10\nlink R2 R3 5\nlink R1 R3 20\n",
    },
    {
      type: "text",
      body: {
        en: `## Putting it together

Follow one packet from a laptop in VLAN 10 to a web server on the Internet:

1. The laptop sees the server is **off-link**, so it **ARPs for its gateway** and builds a frame to the gateway's MAC.
2. The **access switch** learns the laptop's MAC, looks up the gateway's MAC and forwards the frame up the **trunk** with a VLAN 10 tag.
3. The **router** (or layer 3 switch) strips the frame, finds the destination with **longest-prefix match**, decrements the TTL, and ARPs for its own next hop: a new frame, new MACs, same IP addresses.
4. Across the Internet, routers chosen by **OSPF inside each network and BGP between networks** repeat step 3 until the packet arrives.

When something breaks, ask the same questions in the same order: Is the port up and in the right VLAN (\`ip link\`, \`show interfaces\`)? Does the switch know the MAC (\`bridge fdb show\`, \`show mac address-table\`)? Does the host have the right ARP entry (\`ip neigh\`)? Does the routing table choose the expected route (\`ip route get\`)? The next lesson turns this into a complete troubleshooting method.`,
        ar: `## جمع القطع معاً

تتبّع حزمة واحدة من حاسوب محمول في VLAN 10 إلى خادم ويب على الإنترنت:

1. يرى الحاسوب أن الخادم **خارج الرابط**، فيرسل **ARP للبحث عن بوابته** ويبني إطاراً موجهاً إلى عنوان MAC الخاص بالبوابة.
2. يتعلّم **سويتش الوصول** عنوان MAC الخاص بالحاسوب، ويبحث عن عنوان MAC الخاص بالبوابة، ويمرّر الإطار صعوداً عبر **الجذع** موسوماً بـ VLAN 10.
3. ينزع **الراوتر** (أو سويتش الطبقة الثالثة) الإطار، ويجد الوجهة بـ **أطول بادئة مطابقة**، ويُنقص TTL، ويرسل ARP للبحث عن قفزته التالية هو: إطار جديد، وعناوين MAC جديدة، وعناوين IP نفسها.
4. عبر الإنترنت، تكرر الراوترات التي يختارها **OSPF داخل كل شبكة وBGP بين الشبكات** الخطوة 3 حتى تصل الحزمة.

وحين يتعطل شيء، اطرح الأسئلة نفسها بالترتيب نفسه: هل المنفذ يعمل وفي VLAN الصحيحة (\`ip link\` و\`show interfaces\`)؟ هل يعرف السويتش عنوان MAC (\`bridge fdb show\` و\`show mac address-table\`)؟ هل لدى الجهاز مُدخل ARP الصحيح (\`ip neigh\`)؟ هل يختار جدول التوجيه المسار المتوقع (\`ip route get\`)؟ والدرس التالي يحوّل هذا إلى منهج تشخيص كامل.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "A switch receives a frame for a unicast MAC address that is not in its MAC table. What does it do?", ar: "يستقبل سويتش إطاراً موجهاً إلى عنوان MAC أحادي غير موجود في جدوله. ماذا يفعل؟" },
          choices: [
            { en: "Drops it and sends an error back to the sender", ar: "يُسقطه ويعيد خطأً إلى المرسل" },
            { en: "Sends an ARP request to find the MAC address", ar: "يرسل طلب ARP ليجد عنوان MAC" },
            { en: "Floods it out of every port except the one it arrived on", ar: "يغمره على كل المنافذ ما عدا المنفذ الذي وصل منه" },
            { en: "Forwards it to the default gateway", ar: "يمرّره إلى البوابة الافتراضية" },
          ],
          answer: 2,
          explain: {
            en: "Unknown unicast is flooded, like a broadcast. When the destination replies, the switch learns which port it is on and forwards directly from then on. Switches never send ARP for frames they forward: ARP maps IP to MAC and is a host's job, and a layer 2 switch forwards on MAC addresses alone.",
            ar: "العنوان الأحادي المجهول يُغمر مثل البث. وحين ترد الوجهة يتعلّم السويتش منفذها ويمرّر إليها مباشرة بعد ذلك. والسويتشات لا ترسل ARP للإطارات التي تمرّرها: فـ ARP يربط IP بـ MAC وهو مهمة الجهاز المضيف، وسويتش الطبقة الثانية يمرّر بعناوين MAC وحدها.",
          },
        },
        {
          q: { en: "Host 192.168.1.10/24 with gateway 192.168.1.1 sends a packet to 198.51.100.7. Which MAC address is in the frame's destination field?", ar: "الجهاز 192.168.1.10/24 وبوابته 192.168.1.1 يرسل حزمة إلى 198.51.100.7. أي عنوان MAC يوضع في حقل الوجهة في الإطار؟" },
          choices: [
            { en: "The MAC address of 198.51.100.7", ar: "عنوان MAC الخاص بـ 198.51.100.7" },
            { en: "The MAC address of the gateway 192.168.1.1", ar: "عنوان MAC الخاص بالبوابة 192.168.1.1" },
            { en: "The broadcast address ff:ff:ff:ff:ff:ff", ar: "عنوان البث ff:ff:ff:ff:ff:ff" },
            { en: "The host's own MAC address", ar: "عنوان MAC الخاص بالجهاز نفسه" },
          ],
          answer: 1,
          explain: {
            en: "198.51.100.7 is outside 192.168.1.0/24, so the next hop is the gateway: the host ARPs for 192.168.1.1 and puts that MAC in the frame, while the IP header keeps 198.51.100.7 as the destination. A MAC address only means something on the local link.",
            ar: "العنوان 198.51.100.7 خارج 192.168.1.0/24، فالقفزة التالية هي البوابة: يرسل الجهاز ARP للبحث عن 192.168.1.1 ويضع عنوان MAC الخاص بها في الإطار، بينما تُبقي ترويسة IP العنوان 198.51.100.7 وجهةً. فعنوان MAC لا معنى له إلا على الرابط المحلي.",
          },
        },
        {
          q: { en: "Why do switches tag frames with an 802.1Q header on trunk links but not on access ports?", ar: "لماذا تضع السويتشات وسم 802.1Q على الإطارات في روابط الجذع لا في منافذ الوصول؟" },
          choices: [
            { en: "A trunk carries several VLANs, so each frame must say which VLAN it belongs to; an access port belongs to one VLAN", ar: "الجذع يحمل عدة VLANs، فيجب أن يقول كل إطار إلى أي VLAN ينتمي؛ أما منفذ الوصول فينتمي إلى VLAN واحدة" },
            { en: "The tag encrypts traffic between switches", ar: "الوسم يشفّر الحركة بين السويتشات" },
            { en: "Access ports are too slow to process tags", ar: "منافذ الوصول أبطأ من أن تعالج الوسوم" },
            { en: "The tag replaces the MAC addresses on trunks", ar: "الوسم يحل محل عناوين MAC في الجذوع" },
          ],
          answer: 0,
          explain: {
            en: "On an access port the VLAN is implied by the port, so the device sends ordinary frames. A trunk mixes frames of many VLANs on one cable, so the 4-byte tag carries the 12-bit VLAN ID (plus priority bits). The tag gives no confidentiality at all; it is only a label.",
            ar: "في منفذ الوصول تُفهم VLAN من المنفذ نفسه، فيرسل الجهاز إطارات عادية. أما الجذع فيخلط إطارات عدة VLANs على كبل واحد، فيحمل الوسم ذو البايتات الأربع معرّف VLAN ذا الـ 12 بتاً (مع بتات الأولوية). والوسم لا يوفر أي سرية إطلاقاً؛ إنه مجرد ملصق.",
          },
        },
        {
          q: { en: "What is the key difference between a link-state protocol such as OSPF and a distance-vector protocol such as RIP?", ar: "ما الفرق الجوهري بين بروتوكول حالة رابط مثل OSPF وبروتوكول متجه مسافة مثل RIP؟" },
          choices: [
            { en: "OSPF only works between autonomous systems", ar: "OSPF لا يعمل إلا بين الأنظمة المستقلة" },
            { en: "RIP uses Dijkstra's algorithm, OSPF counts hops", ar: "RIP يستخدم خوارزمية Dijkstra وOSPF يعدّ القفزات" },
            { en: "OSPF routers never exchange any information", ar: "راوترات OSPF لا تتبادل أي معلومات أبداً" },
            { en: "In OSPF every router learns the full map and computes shortest paths itself; in RIP routers only pass on distances from their neighbours", ar: "في OSPF يعرف كل راوتر الخريطة كاملة ويحسب أقصر المسارات بنفسه؛ وفي RIP تنقل الراوترات المسافات عن جيرانها فقط" },
          ],
          answer: 3,
          explain: {
            en: "Link-state routers flood descriptions of their own links, so all of them share one map and each runs SPF (Dijkstra). Distance-vector routers only hear 'I can reach X at cost N' from neighbours, which converges more slowly and can count to infinity. Between autonomous systems the Internet uses BGP, a path-vector protocol.",
            ar: "راوترات حالة الرابط تغمر الشبكة بأوصاف روابطها، فتتشارك كلها خريطة واحدة ويشغّل كل منها SPF (خوارزمية Dijkstra). أما راوترات متجه المسافة فلا تسمع من جيرانها إلا 'أستطيع الوصول إلى X بكلفة N'، فتتقارب ببطء أكبر وقد تَعُدّ إلى اللانهاية. وبين الأنظمة المستقلة يستخدم الإنترنت BGP، وهو بروتوكول متجه مسار.",
          },
        },
        {
          q: { en: "Two switches are connected by two cables and Spanning Tree is disabled. A host sends one broadcast. What happens?", ar: "سويتشان موصولان بكبلين وبروتوكول الشجرة الممتدة معطّل. يرسل جهاز بثاً واحداً. ماذا يحدث؟" },
          choices: [
            { en: "The second cable doubles the speed and nothing else changes", ar: "الكبل الثاني يضاعف السرعة ولا يتغير شيء آخر" },
            { en: "The broadcast loops between the switches and multiplies (a broadcast storm), because Ethernet frames have no TTL", ar: "يدور البث بين السويتشين ويتضاعف (عاصفة بث)، لأن إطارات Ethernet لا تملك TTL" },
            { en: "The second switch drops all broadcasts", ar: "السويتش الثاني يُسقط كل البث" },
            { en: "The frame's TTL reaches zero after a few hops and it disappears", ar: "يبلغ TTL الإطار الصفر بعد قفزات قليلة فيختفي" },
          ],
          answer: 1,
          explain: {
            en: "Each switch floods the broadcast out of every other port, including the second cable, so copies circle and multiply until the links are saturated, and MAC tables flap because the same source appears on different ports. Only IP packets carry a TTL; Ethernet relies on STP to block redundant links.",
            ar: "يغمر كل سويتش البث على كل منافذه الأخرى، بما فيها الكبل الثاني، فتدور النسخ وتتضاعف حتى تتشبع الروابط، وتضطرب جداول MAC لأن المصدر نفسه يظهر على منافذ مختلفة. فحزم IP وحدها تحمل TTL؛ أما Ethernet فيعتمد على STP لحجب الروابط الاحتياطية.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap

- A **switch** learns source MACs per port and then **forwards** known unicast, **floods** broadcast, multicast and unknown unicast, and **filters** frames for the port they came from. Entries age out (300 s by default); **STP** prevents loops.
- **VLANs** create separate broadcast domains on one switch; trunks carry a 4-byte **802.1Q** tag with a 12-bit VLAN ID. Traffic between VLANs needs a router.
- A host sends on-link traffic to the destination's MAC and everything else to the **gateway's MAC**, found with **ARP** (NDP in IPv6). ARP has no authentication.
- Routers use **longest-prefix match** and the **TTL**. **Static** routes are fixed; **RIP** (distance vector), **OSPF** (link state, Dijkstra) and **BGP** (path vector, between autonomous systems) keep routes up to date.

**Practice next:** run \`ip route\`, \`ip neigh\` and \`ip route get\` for a few destinations on your own machine and explain each line. Then move on to the troubleshooting toolkit.`,
        ar: `## الخلاصة

- **السويتش** يتعلّم عناوين MAC المصدر لكل منفذ، ثم **يمرّر** العنوان الأحادي المعروف، و**يغمر** البث والبث المتعدد والعنوان الأحادي المجهول، و**يُسقط** الإطارات الموجهة إلى المنفذ الذي جاءت منه. وتتقادم المدخلات (300 ثانية افتراضياً)؛ ويمنع **STP** الحلقات.
- **الشبكات المحلية الافتراضية** تنشئ نطاقات بث منفصلة على سويتش واحد؛ والجذوع تحمل وسم **802.1Q** من 4 بايتات فيه معرّف VLAN من 12 بتاً. والحركة بين الشبكات الافتراضية تحتاج راوتراً.
- يرسل الجهاز الحركة التي على الرابط إلى عنوان MAC الخاص بالوجهة، وكل ما عداها إلى **عنوان MAC الخاص بالبوابة**، ويجده بـ **ARP** (وبـ NDP في IPv6). وARP لا توثيق فيه.
- تستخدم الراوترات **أطول بادئة مطابقة** و**TTL**. والمسارات **الثابتة** لا تتغير؛ أما **RIP** (متجه المسافة) و**OSPF** (حالة الرابط، خوارزمية Dijkstra) و**BGP** (متجه المسار، بين الأنظمة المستقلة) فتُبقي المسارات محدَّثة.

**تدرّب بعد ذلك:** نفّذ \`ip route\` و\`ip neigh\` و\`ip route get\` لبضع وجهات على جهازك واشرح كل سطر. ثم انتقل إلى أدوات التشخيص.`,
      },
    },
  ],
};
