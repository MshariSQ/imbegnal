import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "network-security-basics",
  title: { en: "Network Security Basics — Attacks and the Defences That Stop Them", ar: "أساسيات أمن الشبكات — الهجمات والدفاعات التي توقفها" },
  estMinutes: 43,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- The vocabulary of security: **assets, threats, vulnerabilities, risk** and the **CIA triad**
- How **spoofing** works at each layer (IP, MAC, ARP, DNS) and what stops it
- How a **man-in-the-middle** gets into the path, and why encryption with proper authentication defeats it
- The kinds of **denial of service**, and defences such as SYN cookies, rate limiting and filtering
- How **port scans** look in your logs and how to detect them
- The principles every security design is built on: **least privilege**, **segmentation** and **defence in depth**
- You will build three defensive tools: an ARP spoofing monitor, a token-bucket rate limiter and a port-scan detector

⚠️ **The line that matters:** this lesson explains attacks so you can recognise and stop them. Scanning, spoofing or flooding systems you do not own, or do not have **written permission** to test, is a crime in most countries, even "just to see". Practise only in your own lab. Every log and address in this lesson is made up.

## The castle 🏰

A medieval castle did not rely on one wall. It had a moat, an outer wall, a gate with guards who checked everyone, an inner wall, and a keep where the treasure was. Soldiers could only enter the rooms their duty required. If attackers crossed the moat, the wall stopped them; if they climbed the wall, the guards saw them. That is **defence in depth**, and it is still the best mental model for network security: no single control is perfect, so you stack several, each one covering the others' gaps.

## The vocabulary

- An **asset** is something worth protecting: customer data, a payment service, the availability of a website.
- A **threat** is something that could harm it: a criminal group, a careless insider, a flood.
- A **vulnerability** is a weakness a threat can use: an unpatched service, a weak Wi-Fi password, a flat network.
- **Risk** combines how likely harm is with how bad it would be. Security work is about reducing risk to an acceptable level, never to zero.

The **CIA triad** names what you protect: **confidentiality** (only the right people can read it), **integrity** (nobody can change it unnoticed) and **availability** (it works when needed). Each attack in this lesson aims at one or more of them: eavesdropping at confidentiality, spoofing and man-in-the-middle at integrity (and usually confidentiality), denial of service at availability.`,
        ar: `## ماذا ستتعلم

- مفردات الأمن: **الأصول والتهديدات والثغرات والمخاطر** و**ثلاثية CIA**
- كيف يعمل **الانتحال (spoofing)** في كل طبقة (IP وMAC وARP وDNS) وما الذي يوقفه
- كيف يدخل **الوسيط الخبيث (man-in-the-middle)** في المسار، ولماذا يهزمه التشفير مع التوثيق السليم
- أنواع **حجب الخدمة (denial of service)**، ودفاعات مثل SYN cookies وتحديد المعدل والترشيح
- كيف تبدو **عمليات فحص المنافذ** في سجلاتك وكيف تكتشفها
- المبادئ التي يُبنى عليها كل تصميم أمني: **الحد الأدنى من الصلاحيات** و**التجزئة** و**الدفاع في العمق**
- ستبني ثلاث أدوات دفاعية: مراقباً لانتحال ARP، ومحدِّداً للمعدل بدلو الرموز (token bucket)، وكاشفاً لفحص المنافذ

⚠️ **الخط الفاصل:** يشرح هذا الدرس الهجمات لتتعرف عليها وتوقفها. وفحص أنظمة لا تملكها أو انتحالها أو إغراقها، دون **إذن مكتوب** باختبارها، جريمة في أغلب الدول، حتى لو كان "لمجرد التجربة". تدرّب في مختبرك أنت فقط. وكل سجل وعنوان في هذا الدرس مصطنع.

## القلعة 🏰

لم تكن قلعة العصور الوسطى تعتمد على سور واحد. كان لها خندق، وسور خارجي، وبوابة عليها حراس يفحصون كل داخل، وسور داخلي، وبرج حصين فيه الكنز. ولم يكن الجنود يدخلون إلا الغرف التي تتطلبها مهامهم. فإذا عبر المهاجمون الخندق أوقفهم السور؛ وإذا تسلقوا السور رآهم الحراس. هذا هو **الدفاع في العمق (defence in depth)**، وما زال أفضل نموذج ذهني لأمن الشبكات: لا يوجد ضابط أمني واحد كامل، فتكدّس عدة ضوابط، يغطي كل منها ثغرات الآخر.

## المفردات

- **الأصل (asset)** شيء يستحق الحماية: بيانات العملاء، أو خدمة دفع، أو توافر موقع ويب.
- **التهديد (threat)** شيء قد يضره: عصابة إجرامية، أو موظف مهمل، أو فيضان.
- **الثغرة (vulnerability)** ضعف يستطيع التهديد استغلاله: خدمة غير محدَّثة، أو كلمة مرور Wi-Fi ضعيفة، أو شبكة مسطّحة بلا تجزئة.
- **الخطر (risk)** يجمع بين احتمال وقوع الضرر وشدته لو وقع. والعمل الأمني يخفّض الخطر إلى مستوى مقبول، لا إلى الصفر أبداً.

وتسمّي **ثلاثية CIA** ما تحميه: **السرية (confidentiality)** (لا يقرأ البيانات إلا الأشخاص المخوَّلون)، و**السلامة (integrity)** (لا يستطيع أحد تغييرها دون أن يُكتشف)، و**التوافر (availability)** (تعمل حين يُحتاج إليها). وكل هجوم في هذا الدرس يستهدف واحداً منها أو أكثر: التنصت يستهدف السرية، والانتحال والوسيط الخبيث يستهدفان السلامة (والسرية عادةً)، وحجب الخدمة يستهدف التوافر.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Spoofing: lying about who you are

**Spoofing** means forging an identity field so a packet seems to come from someone else. It exists at every layer because the basic protocols trust what they are told.

- **IP spoofing.** Anyone can write any source address into a packet they build. Replies go to the forged address, so the attacker never sees them; that is why spoofing is useful for one-way attacks (floods and reflection, below) and hard against TCP from outside the path, where the attacker would have to guess the server's unpredictable initial sequence number (RFC 6528). The defence is **ingress and egress filtering** at network edges (**BCP 38**, RFC 2827): an ISP drops customer packets whose source is not the customer's prefix, and a network drops incoming packets that claim to come from its own addresses. **Unicast reverse path forwarding** (uRPF, BCP 84) automates the check with the routing table.
- **MAC spoofing.** Changing a network card's MAC address is one command, so "only allow these MAC addresses" is not authentication. Use **802.1X** port authentication instead.
- **ARP spoofing (ARP poisoning).** Because ARP has no authentication, a device on the LAN can send replies saying "the gateway 192.168.1.1 is at *my* MAC". Victims update their caches and send their Internet traffic to the attacker, who forwards it on: a man-in-the-middle. Defences: switches with **Dynamic ARP Inspection** (which checks ARP against the DHCP snooping table), static entries for critical hosts, 802.1X, monitoring for changed mappings, and above all **encryption**, so intercepted traffic is useless.
- **DNS spoofing (cache poisoning).** An attacker races the real answer with forged ones, hoping a resolver caches the lie. Since the attacks published in 2008, resolvers randomise the **query ID and source port**, which makes blind guessing far harder; **DNSSEC** validation lets a resolver reject forged records outright, and DNS over TLS or HTTPS protects the path between you and your resolver.`,
        ar: `## الانتحال: الكذب بشأن هويتك

**الانتحال (spoofing)** يعني تزوير حقل هوية لتبدو الحزمة آتية من غير مرسلها. وهو موجود في كل طبقة لأن البروتوكولات الأساسية تصدّق ما يُقال لها.

- **انتحال IP.** يستطيع أي أحد أن يكتب أي عنوان مصدر في حزمة يبنيها. وتذهب الردود إلى العنوان المزوّر، فلا يراها المهاجم أبداً؛ ولهذا يفيد الانتحال في الهجمات أحادية الاتجاه (الإغراق والانعكاس، كما سيأتي)، ويصعب ضد TCP من خارج المسار، حيث سيضطر المهاجم إلى تخمين رقم التسلسل الابتدائي غير المتوقَّع للخادم (RFC 6528). والدفاع هو **ترشيح الحركة الواردة والصادرة** عند أطراف الشبكات (**BCP 38**، RFC 2827): يُسقط مزوّد الخدمة حزم العميل التي لا يقع مصدرها ضمن بادئة العميل، وتُسقط الشبكة الحزم الواردة التي تدّعي أنها آتية من عناوينها هي. و**التمرير عبر المسار العكسي (uRPF، BCP 84)** يؤتمت هذا الفحص بجدول التوجيه.
- **انتحال MAC.** تغيير عنوان MAC لبطاقة الشبكة أمر واحد، فعبارة "اسمح بهذه العناوين فقط" ليست توثيقاً. استخدم بدلاً منها توثيق المنافذ **802.1X**.
- **انتحال ARP (تسميم ARP).** لأن ARP لا توثيق فيه، يستطيع جهاز على الشبكة المحلية أن يرسل ردوداً تقول "البوابة 192.168.1.1 عند عنوان MAC *الخاص بي*". فيحدّث الضحايا ذاكرتهم المؤقتة ويرسلون حركة الإنترنت إلى المهاجم، الذي يمرّرها بدوره: وهذا وسيط خبيث. والدفاعات: سويتشات مزوّدة بـ **الفحص الديناميكي لـ ARP (Dynamic ARP Inspection)** (يقارن ARP بجدول DHCP snooping)، ومدخلات ثابتة للأجهزة الحرجة، و802.1X، ومراقبة الروابط التي تتغير، وفوق كل ذلك **التشفير**، فتصبح الحركة المعترَضة بلا فائدة.
- **انتحال DNS (تسميم الذاكرة المؤقتة).** يسابق المهاجم الجواب الحقيقي بأجوبة مزوّرة، آملاً أن يخزّن المحلّل الكذبة. ومنذ الهجمات التي نُشرت عام 2008 تجعل المحلّلات **معرّف الاستعلام ومنفذ المصدر** عشوائيين، فيصبح التخمين الأعمى أصعب بكثير؛ ويسمح التحقق بـ **DNSSEC** للمحلّل برفض السجلات المزوّرة مباشرة، ويحمي DNS over TLS أو HTTPS المسار بينك وبين محلّلك.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: String.raw`# BCP 38 (RFC 2827) at an edge router: check that source addresses make sense.
import ipaddress

OUR_PREFIXES = [ipaddress.ip_network("203.0.113.0/24")]  # what our ISP assigned to us
NEVER_FROM_INTERNET = [ipaddress.ip_network(n) for n in (
    "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16",  # private (RFC 1918)
    "127.0.0.0/8", "0.0.0.0/8", "169.254.0.0/16",      # loopback, "this network", link-local
)]


def inbound(src):
    a = ipaddress.ip_address(src)
    if any(a in n for n in OUR_PREFIXES):
        return "drop: claims to be one of our own addresses"
    if any(a in n for n in NEVER_FROM_INTERNET):
        return "drop: private or special address"
    return "accept"


def outbound(src):
    a = ipaddress.ip_address(src)
    return "accept" if any(a in n for n in OUR_PREFIXES) else "drop: not our address (spoofed?)"


for src in ("198.51.100.23", "203.0.113.5", "10.1.2.3", "127.0.0.1"):
    print("arriving from the Internet, source %-14s -> %s" % (src, inbound(src)))
for src in ("203.0.113.40", "192.0.2.99"):
    print("leaving for the Internet,  source %-14s -> %s" % (src, outbound(src)))
`,
      explanation: {
        en: "Inbound, a packet from outside cannot honestly carry one of our own addresses or a private one, so both are dropped. Outbound, filtering stops a compromised machine inside from sending spoofed packets: if every network did this, reflection attacks would be nearly impossible. Add 100.64.0.0/10 (shared address space, RFC 6598) to the special list and test 100.64.1.1.",
        ar: "في الاتجاه الوارد لا يمكن لحزمة آتية من الخارج أن تحمل بصدق أحد عناويننا أو عنواناً خاصاً، فتُسقط كلتاهما. وفي الاتجاه الصادر يمنع الترشيحُ جهازاً مخترَقاً في الداخل من إرسال حزم منتحَلة: ولو فعلت ذلك كل شبكة لصارت هجمات الانعكاس شبه مستحيلة. أضف 100.64.0.0/10 (مساحة العناوين المشتركة، RFC 6598) إلى القائمة الخاصة واختبر 100.64.1.1.",
      },
    },
    {
      type: "lab",
      id: "arp-watch",
      lang: "javascript",
      prompt: {
        en: `Write an **ARP monitor** that watches ARP replies on a LAN and reports suspicious changes, in the spirit of the classic \`arpwatch\` tool.

**Input:** the first line is \`gateway <ip>\`. Every following line is an observed reply \`<time> <ip> is-at <mac>\`. Treat MAC addresses as lower case.

**Rules**, for each reply:

- An IP never seen before: \`<time> new station <ip> <mac>\`.
- The same MAC as the IP has now: print nothing.
- A different MAC: if it is the MAC the IP had **before** its current one, the address is bouncing between two machines: \`<time> flip flop <ip> <current> -> <new>\`; otherwise \`<time> changed <ip> <current> -> <new>\`. Then remember the new MAC (and the old one as the previous).
- If that IP is the **gateway**, also print \`<time> ALERT gateway <ip> moved to <new>\`, followed by \` (also used by <ip>,<ip>...)\` when other IPs currently map to that same MAC, listed in the order they were first seen.

**Example**

\`\`\`text
Input:
gateway 192.168.1.1
100 192.168.1.1 is-at 02:00:00:00:00:01
102 192.168.1.66 is-at 02:00:00:00:00:66
130 192.168.1.1 is-at 02:00:00:00:00:01
200 192.168.1.1 is-at 02:00:00:00:00:66

Output:
100 new station 192.168.1.1 02:00:00:00:00:01
102 new station 192.168.1.66 02:00:00:00:00:66
200 changed 192.168.1.1 02:00:00:00:00:01 -> 02:00:00:00:00:66
200 ALERT gateway 192.168.1.1 moved to 02:00:00:00:00:66 (also used by 192.168.1.66)
\`\`\`

(The machine at .66 now claims to be the gateway as well: a classic sign of ARP poisoning.)`,
        ar: `اكتب **مراقباً لـ ARP** يراقب ردود ARP على الشبكة المحلية ويبلّغ عن التغييرات المريبة، على نهج الأداة الكلاسيكية \`arpwatch\`.

**الإدخال:** السطر الأول هو \`gateway <ip>\`. وكل سطر بعده رد ملاحَظ \`<time> <ip> is-at <mac>\`. وعامل عناوين MAC بأحرف صغيرة.

**القواعد**، لكل رد:

- عنوان IP لم يُرَ من قبل: \`<time> new station <ip> <mac>\`.
- عنوان MAC نفسه الذي لدى عنوان IP الآن: لا تطبع شيئاً.
- عنوان MAC مختلف: إن كان هو عنوان MAC الذي كان لعنوان IP **قبل** عنوانه الحالي، فالعنوان يتأرجح بين جهازين: \`<time> flip flop <ip> <current> -> <new>\`؛ وإلا \`<time> changed <ip> <current> -> <new>\`. ثم تذكّر عنوان MAC الجديد (والقديم على أنه السابق).
- وإذا كان عنوان IP ذاك هو **البوابة**، فاطبع أيضاً \`<time> ALERT gateway <ip> moved to <new>\`، يتبعه \` (also used by <ip>,<ip>...)\` حين تكون عناوين IP أخرى مرتبطة حالياً بعنوان MAC نفسه، مرتبةً بحسب أول ظهور لها.

**مثال**

\`\`\`text
الإدخال:
gateway 192.168.1.1
100 192.168.1.1 is-at 02:00:00:00:00:01
102 192.168.1.66 is-at 02:00:00:00:00:66
130 192.168.1.1 is-at 02:00:00:00:00:01
200 192.168.1.1 is-at 02:00:00:00:00:66

الإخراج:
100 new station 192.168.1.1 02:00:00:00:00:01
102 new station 192.168.1.66 02:00:00:00:00:66
200 changed 192.168.1.1 02:00:00:00:00:01 -> 02:00:00:00:00:66
200 ALERT gateway 192.168.1.1 moved to 02:00:00:00:00:66 (also used by 192.168.1.66)
\`\`\`

(الجهاز عند .66 يدّعي الآن أنه البوابة أيضاً: علامة كلاسيكية على تسميم ARP.)`,
      },
      starterCode: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n").map((l) => l.trim()).filter((l) => l !== "");

if (lines.length > 0) {
  const gateway = lines[0].split(/\s+/)[1];
  const current = new Map();  // ip -> MAC it has now
  const previous = new Map(); // ip -> MAC it had before that

  for (const line of lines.slice(1)) {
    const [time, ip, , rawMac] = line.split(/\s+/); // <time> <ip> is-at <mac>
    const mac = rawMac.toLowerCase();
    const now = current.get(ip);
    if (now === undefined) {
      console.log(time + " new station " + ip + " " + mac);
      current.set(ip, mac);
      continue;
    }
    // TODO: stay quiet when the MAC did not change
    // TODO: "flip flop" when the new MAC equals previous.get(ip), otherwise "changed"; update both maps
    // TODO: for the gateway, print the ALERT line with the other IPs that use the same MAC
    console.log(time + " changed " + ip + " " + now + " -> " + mac);
    current.set(ip, mac);
  }
}
`,
      solution: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n").map((l) => l.trim()).filter((l) => l !== "");

if (lines.length > 0) {
  const gateway = lines[0].split(/\s+/)[1];
  const current = new Map();  // ip -> MAC it has now
  const previous = new Map(); // ip -> MAC it had before that

  for (const line of lines.slice(1)) {
    const [time, ip, , rawMac] = line.split(/\s+/); // <time> <ip> is-at <mac>
    const mac = rawMac.toLowerCase();
    const now = current.get(ip);
    if (now === undefined) {
      console.log(time + " new station " + ip + " " + mac);
      current.set(ip, mac);
      continue;
    }
    if (now === mac) continue; // nothing new: stay quiet

    // Back to the MAC it had before: two machines are fighting over this address.
    const kind = previous.get(ip) === mac ? "flip flop" : "changed";
    console.log(time + " " + kind + " " + ip + " " + now + " -> " + mac);
    previous.set(ip, now);
    current.set(ip, mac);

    if (ip === gateway) {
      // A Map iterates in insertion order, which is the order the IPs were first seen.
      const others = [...current].filter(([other, m]) => other !== ip && m === mac).map(([other]) => other);
      console.log(time + " ALERT gateway " + ip + " moved to " + mac + (others.length ? " (also used by " + others.join(",") + ")" : ""));
    }
  }
}
`,
      hints: [
        { en: "After the `new station` case, compare `now === mac` first and `continue` silently: repeated replies are normal and must not flood the log.", ar: "بعد حالة `new station` قارن `now === mac` أولاً واستخدم `continue` بصمت: الردود المتكررة طبيعية ويجب ألّا تُغرق السجل." },
        { en: "Decide the word before you update anything: `previous.get(ip) === mac ? \"flip flop\" : \"changed\"`. Then `previous.set(ip, now)` and `current.set(ip, mac)`.", ar: "حدّد الكلمة قبل أن تحدّث أي شيء: `previous.get(ip) === mac ? \"flip flop\" : \"changed\"`. ثم `previous.set(ip, now)` و`current.set(ip, mac)`." },
        { en: "Other IPs with the same MAC: `[...current].filter(([other, m]) => other !== ip && m === mac)`. A `Map` keeps insertion order, which is the first-seen order the output needs.", ar: "عناوين IP الأخرى التي لها عنوان MAC نفسه: `[...current].filter(([other, m]) => other !== ip && m === mac)`. والخريطة `Map` تحفظ ترتيب الإدخال، وهو ترتيب أول ظهور الذي يحتاجه الإخراج." },
      ],
      tests: [
        {
          name: { en: "The worked example: a host takes over the gateway's address", ar: "المثال المحلول: جهاز يستولي على عنوان البوابة" },
          stdin: "gateway 192.168.1.1\n100 192.168.1.1 is-at 02:00:00:00:00:01\n101 192.168.1.20 is-at 02:00:00:00:00:20\n102 192.168.1.66 is-at 02:00:00:00:00:66\n130 192.168.1.1 is-at 02:00:00:00:00:01\n131 192.168.1.20 is-at 02:00:00:00:00:20\n200 192.168.1.1 is-at 02:00:00:00:00:66\n",
          expected: "100 new station 192.168.1.1 02:00:00:00:00:01\n101 new station 192.168.1.20 02:00:00:00:00:20\n102 new station 192.168.1.66 02:00:00:00:00:66\n200 changed 192.168.1.1 02:00:00:00:00:01 -> 02:00:00:00:00:66\n200 ALERT gateway 192.168.1.1 moved to 02:00:00:00:00:66 (also used by 192.168.1.66)\n",
        },
        {
          name: { en: "A host address that flip-flops between two machines", ar: "عنوان جهاز يتأرجح بين جهازين" },
          stdin: "gateway 10.0.0.1\n1 10.0.0.30 is-at 02:00:00:00:00:30\n2 10.0.0.30 is-at 02:00:00:00:00:99\n3 10.0.0.30 is-at 02:00:00:00:00:30\n4 10.0.0.30 is-at 02:00:00:00:00:99\n5 10.0.0.30 is-at 02:00:00:00:00:77\n",
          expected: "1 new station 10.0.0.30 02:00:00:00:00:30\n2 changed 10.0.0.30 02:00:00:00:00:30 -> 02:00:00:00:00:99\n3 flip flop 10.0.0.30 02:00:00:00:00:99 -> 02:00:00:00:00:30\n4 flip flop 10.0.0.30 02:00:00:00:00:30 -> 02:00:00:00:00:99\n5 changed 10.0.0.30 02:00:00:00:00:99 -> 02:00:00:00:00:77\n",
        },
        {
          name: { en: "The gateway itself flip-flops: an alert every time", ar: "البوابة نفسها تتأرجح: تنبيه في كل مرة" },
          stdin: "gateway 10.0.0.1\n10 10.0.0.1 is-at 02:00:00:00:aa:01\n20 10.0.0.1 is-at 02:00:00:00:bb:02\n30 10.0.0.1 is-at 02:00:00:00:aa:01\n40 10.0.0.5 is-at 02:00:00:00:aa:01\n50 10.0.0.1 is-at 02:00:00:00:bb:02\n",
          expected: "10 new station 10.0.0.1 02:00:00:00:aa:01\n20 changed 10.0.0.1 02:00:00:00:aa:01 -> 02:00:00:00:bb:02\n20 ALERT gateway 10.0.0.1 moved to 02:00:00:00:bb:02\n30 flip flop 10.0.0.1 02:00:00:00:bb:02 -> 02:00:00:00:aa:01\n30 ALERT gateway 10.0.0.1 moved to 02:00:00:00:aa:01\n40 new station 10.0.0.5 02:00:00:00:aa:01\n50 flip flop 10.0.0.1 02:00:00:00:aa:01 -> 02:00:00:00:bb:02\n50 ALERT gateway 10.0.0.1 moved to 02:00:00:00:bb:02\n",
        },
        {
          name: { en: "Capital letters do not count as a change; several IPs share one MAC", ar: "الأحرف الكبيرة لا تُعدّ تغييراً؛ وعدة عناوين IP تتشارك عنوان MAC واحداً" },
          stdin: "gateway 172.16.0.1\n1 172.16.0.1 is-at 02:00:00:00:00:AB\n2 172.16.0.1 is-at 02:00:00:00:00:ab\n3 172.16.0.9 is-at 02:00:00:00:00:CD\n4 172.16.0.10 is-at 02:00:00:00:00:cd\n5 172.16.0.11 is-at 02:00:00:00:00:cd\n6 172.16.0.1 is-at 02:00:00:00:00:Cd\n",
          expected: "1 new station 172.16.0.1 02:00:00:00:00:ab\n3 new station 172.16.0.9 02:00:00:00:00:cd\n4 new station 172.16.0.10 02:00:00:00:00:cd\n5 new station 172.16.0.11 02:00:00:00:00:cd\n6 changed 172.16.0.1 02:00:00:00:00:ab -> 02:00:00:00:00:cd\n6 ALERT gateway 172.16.0.1 moved to 02:00:00:00:00:cd (also used by 172.16.0.9,172.16.0.10,172.16.0.11)\n",
        },
        {
          name: { en: "No replies observed: nothing is printed", ar: "لا ردود ملاحَظة: لا يُطبع شيء" },
          stdin: "gateway 192.168.1.1\n",
          expected: "",
        },
      ],
      sampleInput: "gateway 192.168.1.1\n100 192.168.1.1 is-at 02:00:00:00:00:01\n102 192.168.1.66 is-at 02:00:00:00:00:66\n130 192.168.1.1 is-at 02:00:00:00:00:01\n200 192.168.1.1 is-at 02:00:00:00:00:66\n",
    },
    {
      type: "text",
      body: {
        en: `## Man-in-the-middle: getting into the path

A **man-in-the-middle** (MITM) attacker sits between two parties, reading and possibly changing what they say, while each side believes it talks directly to the other. Ways into the path include **ARP spoofing** on a LAN, a **rogue Wi-Fi access point** with a familiar name (an "evil twin"), a **rogue DHCP server** that hands out the attacker as gateway or DNS server, a compromised home router, and at Internet scale a **BGP hijack** of someone's prefix.

You cannot always keep attackers out of the path, so the defence is to make the path not matter: **end-to-end encryption with authentication**.

- **TLS with certificate validation.** An attacker in the middle can relay bytes but cannot produce a valid certificate for the real name. That only works if clients refuse invalid certificates: never click through a certificate warning on a network you do not trust.
- **HSTS** (RFC 6797). A site can tell browsers "only ever use HTTPS with me", which defeats **SSL stripping**, where the attacker quietly downgrades the first plain-HTTP request.
- **SSH host keys.** The first connection records the server's key in \`known_hosts\`; a later warning that the key changed may mean an interception.
- **VPNs and WPA3 or 802.1X** protect the local hop on networks you do not control, and **DHCP snooping** on switches stops rogue DHCP servers.

The mindset to take away: **assume the network is hostile** and protect the data itself.

## Denial of service: knocking it over

A **denial-of-service** (DoS) attack attacks availability. When it comes from many machines at once (usually a botnet of hijacked devices) it is a **distributed** DoS (DDoS). There are three broad kinds:

- **Volumetric**: more traffic than the links can carry. **Reflection and amplification** make this cheap: the attacker sends small UDP requests to open servers (DNS, NTP, memcached and others) with the **victim's address spoofed** as the source, and the servers send much larger replies to the victim. CISA's alert TA14-017A lists the amplification factors per protocol. Defences sit upstream: ISP filtering, scrubbing services, CDNs and anycast networks that spread the flood over many sites, plus BCP 38 everywhere and closing open resolvers.
- **Protocol / state exhaustion**: using up a table rather than bandwidth. A **SYN flood** sends many SYNs (often spoofed) and never completes the handshake, so the server's queue of half-open connections fills and real clients are refused. **SYN cookies** (RFC 4987) answer by encoding the connection details in the server's initial sequence number, so no state is stored until the client's final ACK proves it is real.
- **Application layer**: expensive requests (search pages, logins) or deliberately slow ones that tie up workers. Defences include **rate limiting** per client, caching, timeouts and challenge pages.

Rate limiting is usually done with a **token bucket**: each client has a bucket that holds up to *burst* tokens and refills at *rate* tokens per second; every request spends one token, and a request that finds the bucket empty is dropped (or delayed). Short bursts are allowed, sustained floods are not.`,
        ar: `## الوسيط الخبيث: الدخول في المسار

يجلس مهاجم **الوسيط الخبيث (man-in-the-middle / MITM)** بين طرفين، فيقرأ ما يقولانه وقد يغيّره، بينما يظن كل طرف أنه يتحدث مع الآخر مباشرة. ومن طرق الدخول في المسار **انتحال ARP** على الشبكة المحلية، و**نقطة وصول Wi-Fi مزيفة** باسم مألوف ("التوأم الشرير / evil twin")، و**خادم DHCP مزيف** يعطي المهاجم على أنه البوابة أو خادم DNS، وراوتر منزلي مخترَق، وعلى مستوى الإنترنت **اختطاف BGP** لبادئة شخص آخر.

ولا تستطيع دائماً أن تُبقي المهاجمين خارج المسار، لذلك يكون الدفاع بأن تجعل المسار غير مهم: **التشفير من طرف إلى طرف مع التوثيق**.

- **TLS مع التحقق من الشهادة.** يستطيع المهاجم في الوسط أن يمرّر البايتات، لكنه لا يستطيع أن ينتج شهادة صالحة للاسم الحقيقي. وهذا لا ينجح إلا إذا رفض العملاء الشهادات غير الصالحة: فلا تتجاوز تحذير الشهادة أبداً على شبكة لا تثق بها.
- **HSTS** (RFC 6797). يستطيع الموقع أن يقول للمتصفحات "لا تستخدموا معي إلا HTTPS أبداً"، وهذا يهزم **تجريد SSL (SSL stripping)**، حيث يخفّض المهاجم بهدوء أول طلب HTTP عادي.
- **مفاتيح المضيف في SSH.** أول اتصال يسجّل مفتاح الخادم في \`known_hosts\`؛ والتحذير اللاحق بأن المفتاح تغيّر قد يعني اعتراضاً.
- **الشبكات الافتراضية الخاصة وWPA3 أو 802.1X** تحمي القفزة المحلية على الشبكات التي لا تتحكم فيها، و**DHCP snooping** على السويتشات يوقف خوادم DHCP المزيفة.

والعقلية التي يجب أن تخرج بها: **افترض أن الشبكة معادية** واحمِ البيانات نفسها.

## حجب الخدمة: إسقاط الخدمة

يهاجم **حجب الخدمة (denial of service / DoS)** التوافر. وحين يأتي من أجهزة كثيرة في وقت واحد (عادةً شبكة روبوتات / botnet من أجهزة مختطفة) يكون **حجب خدمة موزّعاً (DDoS)**. وهناك ثلاثة أنواع عامة:

- **الحجمي (volumetric)**: حركة أكثر مما تحتمله الروابط. ويجعله **الانعكاس والتضخيم (reflection and amplification)** رخيصاً: يرسل المهاجم طلبات UDP صغيرة إلى خوادم مفتوحة (DNS وNTP وmemcached وغيرها) مع **انتحال عنوان الضحية** مصدراً، فترسل الخوادم ردوداً أكبر بكثير إلى الضحية. ويسرد تنبيه CISA ذو الرقم TA14-017A عوامل التضخيم لكل بروتوكول. والدفاعات تقع في المنبع: ترشيح مزوّد الخدمة، وخدمات التنقية (scrubbing)، وشبكات توصيل المحتوى (CDN) وشبكات anycast التي توزّع الإغراق على مواقع كثيرة، إضافةً إلى BCP 38 في كل مكان وإغلاق المحلّلات المفتوحة.
- **استنزاف البروتوكول / الحالة**: استهلاك جدول بدلاً من عرض النطاق. فـ **إغراق SYN (SYN flood)** يرسل حزم SYN كثيرة (منتحَلة غالباً) ولا يكمل المصافحة أبداً، فيمتلئ طابور الاتصالات نصف المفتوحة في الخادم ويُرفض العملاء الحقيقيون. وتجيب **SYN cookies** (RFC 4987) بترميز تفاصيل الاتصال في رقم التسلسل الابتدائي للخادم، فلا تُخزَّن أي حالة حتى يثبت الإقرار الأخير من العميل أنه حقيقي.
- **طبقة التطبيق**: طلبات مكلفة (صفحات البحث وتسجيل الدخول) أو بطيئة عمداً تشغل العمال (workers). ومن الدفاعات **تحديد المعدل (rate limiting)** لكل عميل، والتخزين المؤقت، والمهل الزمنية، وصفحات التحدي.

ويُنفَّذ تحديد المعدل عادةً بـ **دلو الرموز (token bucket)**: لكل عميل دلو يتسع لعدد *burst* من الرموز ويُعاد ملؤه بمعدل *rate* رمزاً في الثانية؛ وكل طلب ينفق رمزاً واحداً، والطلب الذي يجد الدلو فارغاً يُسقط (أو يُؤخَّر). فالدفعات القصيرة مسموحة، أما الإغراق المستمر فلا.`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: String.raw`// A SYN flood against a server whose queue holds 8 half-open connections, each kept for 5 ticks.
function simulate(useCookies) {
  const BACKLOG = 8;
  const TIMEOUT = 5;
  let halfOpen = []; // the tick at which each half-open entry expires
  let served = 0;
  let refused = 0;
  for (let tick = 0; tick < 20; tick++) {
    halfOpen = halfOpen.filter(function (expires) { return expires > tick; });
    // The attacker sends 4 spoofed SYNs per tick; those handshakes never complete.
    for (let i = 0; i < 4; i++) {
      if (useCookies) continue; // with SYN cookies a SYN creates no state at all
      if (halfOpen.length < BACKLOG) halfOpen.push(tick + TIMEOUT);
    }
    // One real client per tick, who will complete the handshake if it gets a SYN-ACK.
    if (useCookies || halfOpen.length < BACKLOG) served++;
    else refused++;
  }
  return "served " + served + ", refused " + refused;
}

console.log("without SYN cookies: " + simulate(false));
console.log("with SYN cookies:    " + simulate(true));
`,
      explanation: {
        en: "Four forged SYNs per tick are enough to keep all eight slots busy, because each one is held for five ticks: after the first tick every real client is refused. With SYN cookies the server keeps no state for a SYN, so the flood has nothing to fill. Real attacks are bigger, but the shape is the same. Try a backlog of 32 and see that a bigger queue only delays the problem.",
        ar: "أربع حزم SYN مزوّرة في كل وحدة زمنية تكفي لإبقاء الخانات الثماني مشغولة، لأن كلاً منها يُحتفظ به خمس وحدات: فبعد الوحدة الأولى يُرفض كل عميل حقيقي. ومع SYN cookies لا يحتفظ الخادم بأي حالة لحزمة SYN، فلا يجد الإغراق شيئاً يملؤه. والهجمات الحقيقية أكبر، لكن الشكل واحد. جرّب طابوراً من 32 خانة وانظر كيف أن الطابور الأكبر يؤخر المشكلة فقط.",
      },
    },
    {
      type: "lab",
      id: "token-bucket",
      lang: "c",
      prompt: {
        en: `Implement a per-source **token-bucket rate limiter** in C.

**Input:** the first line is \`rate <r> burst <b>\` (whole numbers: r tokens per second, at most b tokens in a bucket). Every following line is a request \`<time-ms> <source>\`, with times in milliseconds, never decreasing.

**Rules**

- Each source has its own bucket, created **full** (b tokens) at the time of its first request.
- Before deciding on a request, refill the bucket with \`r\` tokens per second for the time since its last refill, never above \`b\`. Partial tokens count: keep the amount in **thousandths of a token** (\`r\` thousandths per millisecond), so no floating point is needed.
- If the bucket holds at least one whole token, spend it and \`ACCEPT\`; otherwise \`DROP\` (a dropped request spends nothing).

**Output:** one line per request, \`<time-ms> <source> <ACCEPT|DROP>\`, then one summary line per source in alphabetical (byte) order: \`<source>: <a> accepted, <d> dropped\`.

**Example**

\`\`\`text
Input:
rate 2 burst 3
0 192.0.2.7
0 192.0.2.7
0 192.0.2.7
0 192.0.2.7
500 192.0.2.7

Output:
0 192.0.2.7 ACCEPT
0 192.0.2.7 ACCEPT
0 192.0.2.7 ACCEPT
0 192.0.2.7 DROP
500 192.0.2.7 ACCEPT
192.0.2.7: 4 accepted, 1 dropped
\`\`\`

(After three requests the bucket is empty; 500 ms at 2 tokens per second refills exactly one token.)`,
        ar: `نفّذ بلغة C **محدِّداً للمعدل بدلو الرموز (token bucket)** لكل مصدر.

**الإدخال:** السطر الأول هو \`rate <r> burst <b>\` (أعداد صحيحة: r رمزاً في الثانية، وb رمزاً على الأكثر في الدلو). وكل سطر بعده طلب \`<time-ms> <source>\`، والأزمنة بالملّي ثانية ولا تتناقص أبداً.

**القواعد**

- لكل مصدر دلو خاص به، يُنشأ **ممتلئاً** (b رمزاً) عند وقت أول طلب له.
- قبل الحكم على طلب، أعد ملء الدلو بمعدل \`r\` رمزاً في الثانية عن الزمن المنقضي منذ آخر إعادة ملء، دون أن يتجاوز \`b\` أبداً. والرموز الجزئية تُحتسب: احتفظ بالكمية **بأجزاء الألف من الرمز** (\`r\` جزءاً من الألف في كل ملّي ثانية)، فلا تحتاج إلى أعداد عشرية عائمة.
- إذا كان في الدلو رمز كامل واحد على الأقل فأنفقه واطبع \`ACCEPT\`؛ وإلا \`DROP\` (والطلب المُسقط لا ينفق شيئاً).

**الإخراج:** سطر لكل طلب، \`<time-ms> <source> <ACCEPT|DROP>\`، ثم سطر ملخّص لكل مصدر بالترتيب الأبجدي (بحسب البايتات): \`<source>: <a> accepted, <d> dropped\`.

**مثال**

\`\`\`text
الإدخال:
rate 2 burst 3
0 192.0.2.7
0 192.0.2.7
0 192.0.2.7
0 192.0.2.7
500 192.0.2.7

الإخراج:
0 192.0.2.7 ACCEPT
0 192.0.2.7 ACCEPT
0 192.0.2.7 ACCEPT
0 192.0.2.7 DROP
500 192.0.2.7 ACCEPT
192.0.2.7: 4 accepted, 1 dropped
\`\`\`

(بعد ثلاثة طلبات يفرغ الدلو؛ و500 ملّي ثانية بمعدل رمزين في الثانية تعيد ملء رمز واحد بالضبط.)`,
      },
      starterCode: String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_SOURCES 256

struct bucket {
    char name[64];
    long long millitokens; /* tokens x 1000, so refills never need floating point */
    long long last_ms;     /* time of the last refill */
    long accepted, dropped;
};

static struct bucket buckets[MAX_SOURCES];
static int count = 0;

static int by_name(const void *a, const void *b) {
    return strcmp(((const struct bucket *)a)->name, ((const struct bucket *)b)->name);
}

int main(void) {
    long long rate, burst;
    if (scanf(" rate %lld burst %lld", &rate, &burst) != 2) return 0;

    long long now;
    char src[64];
    while (scanf("%lld %63s", &now, src) == 2) {
        struct bucket *b = NULL;
        for (int i = 0; i < count; i++)
            if (strcmp(buckets[i].name, src) == 0) b = &buckets[i];
        if (b == NULL) {
            if (count == MAX_SOURCES) continue;
            b = &buckets[count++];
            strcpy(b->name, src);
            b->millitokens = burst * 1000; /* a new source starts with a full bucket */
            b->last_ms = now;
            b->accepted = b->dropped = 0;
        }
        /* TODO: refill: add (now - last_ms) * rate millitokens, cap at burst * 1000, update last_ms */

        /* TODO: ACCEPT only when at least 1000 millitokens are left, otherwise DROP */
        b->millitokens -= 1000;
        b->accepted++;
        printf("%lld %s ACCEPT\n", now, src);
    }

    qsort(buckets, count, sizeof buckets[0], by_name);
    for (int i = 0; i < count; i++)
        printf("%s: %ld accepted, %ld dropped\n", buckets[i].name, buckets[i].accepted, buckets[i].dropped);
    return 0;
}
`,
      solution: String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_SOURCES 256

struct bucket {
    char name[64];
    long long millitokens; /* tokens x 1000, so refills never need floating point */
    long long last_ms;     /* time of the last refill */
    long accepted, dropped;
};

static struct bucket buckets[MAX_SOURCES];
static int count = 0;

static int by_name(const void *a, const void *b) {
    return strcmp(((const struct bucket *)a)->name, ((const struct bucket *)b)->name);
}

int main(void) {
    long long rate, burst;
    if (scanf(" rate %lld burst %lld", &rate, &burst) != 2) return 0;

    long long now;
    char src[64];
    while (scanf("%lld %63s", &now, src) == 2) {
        struct bucket *b = NULL;
        for (int i = 0; i < count; i++)
            if (strcmp(buckets[i].name, src) == 0) b = &buckets[i];
        if (b == NULL) {
            if (count == MAX_SOURCES) continue;
            b = &buckets[count++];
            strcpy(b->name, src);
            b->millitokens = burst * 1000; /* a new source starts with a full bucket */
            b->last_ms = now;
            b->accepted = b->dropped = 0;
        }
        /* Refill: 'rate' tokens per second is 'rate' millitokens per millisecond, capped at the burst. */
        b->millitokens += (now - b->last_ms) * rate;
        if (b->millitokens > burst * 1000) b->millitokens = burst * 1000;
        b->last_ms = now;

        if (b->millitokens >= 1000) {
            b->millitokens -= 1000;
            b->accepted++;
            printf("%lld %s ACCEPT\n", now, src);
        } else {
            b->dropped++;
            printf("%lld %s DROP\n", now, src);
        }
    }

    qsort(buckets, count, sizeof buckets[0], by_name);
    for (int i = 0; i < count; i++)
        printf("%s: %ld accepted, %ld dropped\n", buckets[i].name, buckets[i].accepted, buckets[i].dropped);
    return 0;
}
`,
      hints: [
        { en: "Refill first: `b->millitokens += (now - b->last_ms) * rate;` then cap it with `if (b->millitokens > burst * 1000) b->millitokens = burst * 1000;` and set `b->last_ms = now;`.", ar: "أعد الملء أولاً: `b->millitokens += (now - b->last_ms) * rate;` ثم قيّده بـ `if (b->millitokens > burst * 1000) b->millitokens = burst * 1000;` واجعل `b->last_ms = now;`." },
        { en: "One token is 1000 millitokens. Spend it only when `b->millitokens >= 1000`; a dropped request leaves the bucket as it is.", ar: "الرمز الواحد يساوي 1000 جزء من الألف. لا تنفقه إلا حين يكون `b->millitokens >= 1000`؛ والطلب المُسقط يترك الدلو كما هو." },
        { en: "Count `accepted` and `dropped` per bucket; the starter already sorts the buckets by name with `qsort` and prints the summary.", ar: "عُدّ `accepted` و`dropped` لكل دلو؛ والمسودة ترتّب الدلاء بحسب الاسم بـ `qsort` وتطبع الملخّص أصلاً." },
      ],
      tests: [
        {
          name: { en: "The worked example, then too little time for another token", ar: "المثال المحلول، ثم وقت لا يكفي لرمز آخر" },
          stdin: "rate 2 burst 3\n0 192.0.2.7\n0 192.0.2.7\n0 192.0.2.7\n0 192.0.2.7\n0 192.0.2.7\n500 192.0.2.7\n600 192.0.2.7\n",
          expected: "0 192.0.2.7 ACCEPT\n0 192.0.2.7 ACCEPT\n0 192.0.2.7 ACCEPT\n0 192.0.2.7 DROP\n0 192.0.2.7 DROP\n500 192.0.2.7 ACCEPT\n600 192.0.2.7 DROP\n192.0.2.7: 4 accepted, 3 dropped\n",
        },
        {
          name: { en: "A flooding bot does not slow down a normal client", ar: "روبوت يُغرق لا يبطئ العميل العادي" },
          stdin: "rate 10 burst 2\n0 bot\n10 bot\n20 bot\n30 bot\n40 alice\n50 bot\n100 bot\n140 alice\n150 bot\n200 bot\n",
          expected: "0 bot ACCEPT\n10 bot ACCEPT\n20 bot DROP\n30 bot DROP\n40 alice ACCEPT\n50 bot DROP\n100 bot ACCEPT\n140 alice ACCEPT\n150 bot DROP\n200 bot ACCEPT\nalice: 2 accepted, 0 dropped\nbot: 4 accepted, 4 dropped\n",
        },
        {
          name: { en: "A long pause refills only up to the burst size", ar: "التوقف الطويل لا يملأ الدلو إلا حتى حجم الدفعة" },
          stdin: "rate 1 burst 2\n0 a\n0 a\n0 a\n60000 a\n60000 a\n60000 a\n",
          expected: "0 a ACCEPT\n0 a ACCEPT\n0 a DROP\n60000 a ACCEPT\n60000 a ACCEPT\n60000 a DROP\na: 4 accepted, 2 dropped\n",
        },
        {
          name: { en: "Partial tokens add up exactly (3 per second, burst 1)", ar: "الرموز الجزئية تتراكم بدقة (3 في الثانية، والدفعة 1)" },
          stdin: "rate 3 burst 1\n0 s\n300 s\n600 s\n900 s\n1000 s\n1333 s\n1334 s\n",
          expected: "0 s ACCEPT\n300 s DROP\n600 s ACCEPT\n900 s DROP\n1000 s ACCEPT\n1333 s DROP\n1334 s ACCEPT\ns: 4 accepted, 3 dropped\n",
        },
        {
          name: { en: "No requests: nothing is printed", ar: "لا طلبات: لا يُطبع شيء" },
          stdin: "rate 5 burst 5\n",
          expected: "",
        },
      ],
      sampleInput: "rate 2 burst 3\n0 192.0.2.7\n0 192.0.2.7\n0 192.0.2.7\n0 192.0.2.7\n500 192.0.2.7\n",
    },
    {
      type: "text",
      body: {
        en: `## Port scanning and how to see it

Before an attack comes **reconnaissance**: finding which hosts are up and which services they run. A **port scan** tries many ports and classifies them by the reply, using exactly what you learned in the TCP and troubleshooting lessons. A tool such as **nmap** reports:

- **open**: a SYN-ACK came back, so a service is listening;
- **closed**: a RST came back, so the host is up but nothing listens there;
- **filtered**: no answer, or an ICMP unreachable, so a firewall is in the way.

Scanning someone else's network without permission can be illegal and often breaks the provider's terms of service. Scanning **your own** network regularly is good practice: it shows you what an attacker would see, and \`ss -tlnp\` on each server tells you which program is behind each open port.

To **detect** scans, look at connection logs from a firewall or an IDS (**Snort**, **Suricata**) or a network monitor (**Zeek**). A normal client talks to a few services; a scanner touches many **distinct** targets in a short time:

- a **vertical** scan probes many ports on one host;
- a **horizontal** scan (a sweep) probes one port, say 22 or 3389, on many hosts;
- a mixed scan does both.

Counting **distinct** (host, port) pairs per source in a **sliding time window** catches most of this. It also has blind spots: a **slow scan** that sends one probe a minute stays under any short-window threshold, and some legitimate systems (monitoring servers, vulnerability scanners you run yourself) look exactly like scanners, so they need an allow list. Detection only helps if someone acts on it: block or rate-limit the source, check what it reached, and close ports that never needed to be open.`,
        ar: `## فحص المنافذ وكيف تراه

قبل الهجوم يأتي **الاستطلاع (reconnaissance)**: معرفة أي الأجهزة تعمل وأي الخدمات تشغّل. و**فحص المنافذ (port scan)** يجرّب منافذ كثيرة ويصنّفها بحسب الرد، مستخدماً بالضبط ما تعلمته في درسي TCP والتشخيص. وأداة مثل **nmap** تبلّغ بأن المنفذ:

- **open (مفتوح)**: عاد SYN-ACK، فهناك خدمة تستمع؛
- **closed (مغلق)**: عاد RST، فالجهاز يعمل لكن لا شيء يستمع هناك؛
- **filtered (مرشَّح)**: لا جواب، أو رسالة ICMP unreachable، فهناك جدار ناري في الطريق.

وفحص شبكة غيرك دون إذن قد يكون مخالفاً للقانون، وكثيراً ما يخالف شروط خدمة المزوّد. أما فحص شبكتك **أنت** بانتظام فممارسة جيدة: يُظهر لك ما سيراه المهاجم، و\`ss -tlnp\` على كل خادم يخبرك أي برنامج يقف خلف كل منفذ مفتوح.

ولـ **اكتشاف** الفحص، انظر في سجلات الاتصالات من جدار ناري أو نظام كشف تسلل (**Snort** و**Suricata**) أو أداة مراقبة شبكة (**Zeek**). فالعميل العادي يتحدث مع خدمات قليلة؛ أما الفاحص فيلمس أهدافاً **مختلفة** كثيرة في وقت قصير:

- **الفحص العمودي (vertical)** يجسّ منافذ كثيرة على جهاز واحد؛
- **الفحص الأفقي (horizontal)** (أو المسح) يجسّ منفذاً واحداً، مثل 22 أو 3389، على أجهزة كثيرة؛
- **الفحص المختلط** يفعل الأمرين.

وعدّ أزواج (الجهاز، المنفذ) **المختلفة** لكل مصدر داخل **نافذة زمنية منزلقة** يلتقط أغلب ذلك. وله أيضاً نقاط عمياء: **الفحص البطيء** الذي يرسل مجسّاً واحداً كل دقيقة يبقى تحت أي عتبة لنافذة قصيرة، وبعض الأنظمة المشروعة (خوادم المراقبة، وفاحصات الثغرات التي تشغّلها بنفسك) تبدو تماماً مثل الفاحصين، فتحتاج إلى قائمة سماح. والاكتشاف لا يفيد إلا إذا تصرّف أحدٌ بناءً عليه: احجب المصدر أو حدّد معدله، وتحقق مما وصل إليه، وأغلق المنافذ التي لم تكن تحتاج إلى أن تُفتح أصلاً.`,
      },
    },
    {
      type: "lab",
      id: "scan-detector",
      lang: "python",
      prompt: {
        en: `Write a **port-scan detector** for connection logs.

**Input:** the first line is \`window <w> threshold <n>\`. Every following line is a connection attempt \`<time> <source-ip> <destination-ip> <destination-port>\`, with whole-second times that never decrease.

**Rules**

- For each source, keep the attempts of the last \`w\` seconds: at time \`t\`, an attempt made at time \`s\` still counts if \`t - s < w\`.
- A **target** is a distinct (destination, port) pair: repeating the same one counts once.
- The first time a source has at least \`n\` targets in its window, print **one** alert and never alert for that source again:

\`\`\`text
ALERT t=<time> src=<source> targets=<k> hosts=<h> type=<vertical|horizontal|mixed>
\`\`\`

  where \`hosts\` is the number of distinct destinations among the targets, \`vertical\` means one host, \`horizontal\` means several hosts but a single port, and \`mixed\` is anything else.
- If no source is ever flagged, print \`no scans detected\`.

**Example**

\`\`\`text
Input:
window 10 threshold 5
0 192.0.2.50 203.0.113.10 443
1 198.51.100.7 203.0.113.10 21
1 198.51.100.7 203.0.113.10 22
2 198.51.100.7 203.0.113.10 23
3 198.51.100.7 203.0.113.10 25
3 198.51.100.7 203.0.113.10 80
5 192.0.2.50 203.0.113.10 443

Output:
ALERT t=3 src=198.51.100.7 targets=5 hosts=1 type=vertical
\`\`\``,
        ar: `اكتب **كاشفاً لفحص المنافذ** يعمل على سجلات الاتصالات.

**الإدخال:** السطر الأول هو \`window <w> threshold <n>\`. وكل سطر بعده محاولة اتصال \`<time> <source-ip> <destination-ip> <destination-port>\`، والأزمنة ثوانٍ صحيحة لا تتناقص أبداً.

**القواعد**

- لكل مصدر، احتفظ بمحاولات آخر \`w\` ثانية: عند الزمن \`t\` تبقى المحاولة التي جرت عند الزمن \`s\` محسوبة إذا كان \`t - s < w\`.
- **الهدف** زوج مختلف من (الوجهة، المنفذ): وتكرار الزوج نفسه يُحسب مرة واحدة.
- في أول مرة يبلغ فيها مصدرٌ \`n\` هدفاً على الأقل داخل نافذته، اطبع تنبيهاً **واحداً** ولا تنبّه عن ذلك المصدر مرة أخرى أبداً:

\`\`\`text
ALERT t=<time> src=<source> targets=<k> hosts=<h> type=<vertical|horizontal|mixed>
\`\`\`

  حيث \`hosts\` عدد الوجهات المختلفة بين الأهداف، و\`vertical\` تعني جهازاً واحداً، و\`horizontal\` تعني عدة أجهزة لكن بمنفذ واحد، و\`mixed\` أي شيء آخر.
- إذا لم يُعلَّم أي مصدر أبداً فاطبع \`no scans detected\`.

**مثال**

\`\`\`text
الإدخال:
window 10 threshold 5
0 192.0.2.50 203.0.113.10 443
1 198.51.100.7 203.0.113.10 21
1 198.51.100.7 203.0.113.10 22
2 198.51.100.7 203.0.113.10 23
3 198.51.100.7 203.0.113.10 25
3 198.51.100.7 203.0.113.10 80
5 192.0.2.50 203.0.113.10 443

الإخراج:
ALERT t=3 src=198.51.100.7 targets=5 hosts=1 type=vertical
\`\`\``,
      },
      starterCode: String.raw`import sys

lines = [l.split() for l in sys.stdin.read().splitlines() if l.strip()]
window, threshold = int(lines[0][1]), int(lines[0][3])

history = {}     # source -> list of (time, host, port), oldest first
flagged = set()  # sources already reported
alerts = 0

for t, src, host, port in lines[1:]:
    now = int(t)
    events = history.setdefault(src, [])
    events.append((now, host, port))
    # TODO: drop the attempts that are 'window' seconds old or older (now - time >= window)
    if src in flagged:
        continue
    # TODO: count DISTINCT (host, port) targets, then classify vertical / horizontal / mixed
    if len(events) >= threshold:
        print("ALERT t=%d src=%s targets=%d" % (now, src, len(events)))
        flagged.add(src)
        alerts += 1

# TODO: print "no scans detected" when nothing was flagged
`,
      solution: String.raw`import sys

lines = [l.split() for l in sys.stdin.read().splitlines() if l.strip()]
window, threshold = int(lines[0][1]), int(lines[0][3])

history = {}     # source -> list of (time, host, port), oldest first
flagged = set()  # sources already reported
alerts = 0

for t, src, host, port in lines[1:]:
    now = int(t)
    events = history.setdefault(src, [])
    events.append((now, host, port))
    # Keep only what happened in the last 'window' seconds (now - time < window).
    while events and now - events[0][0] >= window:
        events.pop(0)
    if src in flagged:
        continue
    targets = {(h, p) for _, h, p in events}  # repeating the same host:port counts once
    if len(targets) >= threshold:
        hosts = {h for h, _ in targets}
        ports = {p for _, p in targets}
        kind = "vertical" if len(hosts) == 1 else "horizontal" if len(ports) == 1 else "mixed"
        print("ALERT t=%d src=%s targets=%d hosts=%d type=%s" % (now, src, len(targets), len(hosts), kind))
        flagged.add(src)
        alerts += 1

if alerts == 0:
    print("no scans detected")
`,
      hints: [
        { en: "The list is oldest first, so pop from the front while `now - events[0][0] >= window`.", ar: "القائمة مرتبة من الأقدم، فأخرج من مقدمتها ما دام `now - events[0][0] >= window`." },
        { en: "`targets = {(h, p) for _, h, p in events}` removes repeats. From it, build the set of hosts and the set of ports to choose the type.", ar: "التعبير `targets = {(h, p) for _, h, p in events}` يزيل التكرار. ومنه ابنِ مجموعة الأجهزة ومجموعة المنافذ لتختار النوع." },
        { en: "Check `len(hosts) == 1` first (vertical), then `len(ports) == 1` (horizontal), otherwise mixed. Keep a counter so you can print `no scans detected` at the end.", ar: "افحص `len(hosts) == 1` أولاً (عمودي)، ثم `len(ports) == 1` (أفقي)، وإلا فمختلط. واحتفظ بعدّاد لتطبع `no scans detected` في النهاية." },
      ],
      tests: [
        {
          name: { en: "The worked example: a vertical scan next to normal HTTPS traffic", ar: "المثال المحلول: فحص عمودي بجوار حركة HTTPS عادية" },
          stdin: "window 10 threshold 5\n0 192.0.2.50 203.0.113.10 443\n1 198.51.100.7 203.0.113.10 21\n1 198.51.100.7 203.0.113.10 22\n2 198.51.100.7 203.0.113.10 23\n2 192.0.2.50 203.0.113.10 443\n3 198.51.100.7 203.0.113.10 25\n3 198.51.100.7 203.0.113.10 80\n4 198.51.100.7 203.0.113.10 110\n5 192.0.2.50 203.0.113.10 443\n",
          expected: "ALERT t=3 src=198.51.100.7 targets=5 hosts=1 type=vertical\n",
        },
        {
          name: { en: "A horizontal sweep of port 22", ar: "مسح أفقي للمنفذ 22" },
          stdin: "window 60 threshold 4\n10 198.51.100.9 203.0.113.1 22\n12 198.51.100.9 203.0.113.2 22\n15 198.51.100.9 203.0.113.3 22\n40 198.51.100.9 203.0.113.4 22\n41 198.51.100.9 203.0.113.5 22\n",
          expected: "ALERT t=40 src=198.51.100.9 targets=4 hosts=4 type=horizontal\n",
        },
        {
          name: { en: "A slow scan stays under the window: a known blind spot", ar: "الفحص البطيء يبقى تحت النافذة: نقطة عمياء معروفة" },
          stdin: "window 10 threshold 4\n0 198.51.100.7 203.0.113.10 22\n15 198.51.100.7 203.0.113.10 23\n30 198.51.100.7 203.0.113.10 25\n45 198.51.100.7 203.0.113.10 80\n60 198.51.100.7 203.0.113.10 443\n",
          expected: "no scans detected\n",
        },
        {
          name: { en: "Repeated connections count once; a mixed scan is still caught", ar: "الاتصالات المتكررة تُحسب مرة واحدة؛ والفحص المختلط يُلتقط مع ذلك" },
          stdin: "window 30 threshold 4\n0 192.0.2.80 203.0.113.10 443\n1 192.0.2.80 203.0.113.10 443\n2 192.0.2.80 203.0.113.11 443\n3 192.0.2.80 203.0.113.10 443\n4 192.0.2.80 203.0.113.11 443\n10 198.51.100.3 203.0.113.10 22\n11 198.51.100.3 203.0.113.11 80\n12 198.51.100.3 203.0.113.10 22\n13 198.51.100.3 203.0.113.12 3389\n14 198.51.100.3 203.0.113.10 445\n",
          expected: "ALERT t=14 src=198.51.100.3 targets=4 hosts=3 type=mixed\n",
        },
        {
          name: { en: "The window edge: 4 seconds old counts, 5 seconds old does not", ar: "حافة النافذة: عمر 4 ثوانٍ يُحسب، وعمر 5 ثوانٍ لا يُحسب" },
          stdin: "window 5 threshold 3\n0 198.51.100.7 203.0.113.10 22\n4 198.51.100.7 203.0.113.10 23\n5 198.51.100.7 203.0.113.10 25\n6 198.51.100.7 203.0.113.10 80\n",
          expected: "ALERT t=6 src=198.51.100.7 targets=3 hosts=1 type=vertical\n",
        },
        {
          name: { en: "An empty log: no scans detected", ar: "سجل فارغ: لم يُكتشف أي فحص" },
          stdin: "window 10 threshold 3\n",
          expected: "no scans detected\n",
        },
      ],
      sampleInput: "window 10 threshold 5\n0 192.0.2.50 203.0.113.10 443\n1 198.51.100.7 203.0.113.10 21\n1 198.51.100.7 203.0.113.10 22\n2 198.51.100.7 203.0.113.10 23\n3 198.51.100.7 203.0.113.10 25\n3 198.51.100.7 203.0.113.10 80\n5 192.0.2.50 203.0.113.10 443\n",
    },
    {
      type: "text",
      body: {
        en: `## The principles behind every defence

Individual attacks change every year; these principles do not.

- **Least privilege.** Every user, program and network flow gets only the access its job needs, and nothing more. A web server can reach the database port, not SSH on every machine. Administrators use separate accounts with multi-factor authentication, and management interfaces are reachable only from a management network or through a VPN.
- **Segmentation.** Divide the network into zones (users, servers, guests, IoT, management, the DMZ) and allow only the flows between them that are needed. A compromised printer should not be able to talk to the finance server. Taken further, **zero trust** (NIST SP 800-207) stops granting trust because of network location at all: every request is authenticated and authorised, wherever it comes from.
- **Defence in depth.** Layer independent controls so that one failure is not a disaster:

\`\`\`text
perimeter      firewall, DDoS protection, filtering (BCP 38)
network        segmentation, VLANs, 802.1X, WPA3, DHCP snooping, DAI
host           patching, host firewall, closed unused ports, endpoint protection
application    TLS everywhere, authentication, input validation, rate limiting
data           encryption at rest, backups you have tested
people         training, least privilege, multi-factor authentication
detection      logs, IDS, alerts that someone actually reads, an incident plan
\`\`\`

Add **secure defaults** (deny unless allowed, services off unless needed), **attack surface reduction** (every open port and every installed service is something to defend) and **monitoring with a response plan**, because prevention eventually fails and the question becomes how fast you notice. With this vocabulary you are ready for any security specialty; the Cyber Security track on this site builds on exactly these ideas.`,
        ar: `## المبادئ وراء كل دفاع

الهجمات الفردية تتغير كل عام؛ أما هذه المبادئ فلا.

- **الحد الأدنى من الصلاحيات (least privilege).** يحصل كل مستخدم وبرنامج وتدفق شبكي على الوصول الذي تحتاجه مهمته فقط، ولا أكثر. فخادم الويب يصل إلى منفذ قاعدة البيانات، لا إلى SSH على كل جهاز. ويستخدم المسؤولون حسابات منفصلة مع التحقق متعدد العوامل، ولا يمكن الوصول إلى واجهات الإدارة إلا من شبكة الإدارة أو عبر VPN.
- **التجزئة (segmentation).** قسّم الشبكة إلى مناطق (المستخدمون، والخوادم، والضيوف، وإنترنت الأشياء، والإدارة، والمنطقة منزوعة السلاح) ولا تسمح بينها إلا بالتدفقات اللازمة. فالطابعة المخترَقة يجب ألّا تستطيع التحدث مع خادم المالية. وإذا مضيت أبعد، فإن **انعدام الثقة (zero trust)** (NIST SP 800-207) يتوقف تماماً عن منح الثقة بسبب الموقع في الشبكة: كل طلب يُوثَّق ويُفوَّض، أياً كان مصدره.
- **الدفاع في العمق (defence in depth).** كدّس ضوابط مستقلة حتى لا يكون فشل واحد كارثة:

\`\`\`text
المحيط         الجدار الناري، والحماية من DDoS، والترشيح (BCP 38)
الشبكة         التجزئة، وVLANs، و802.1X، وWPA3، وDHCP snooping، وDAI
الجهاز         التحديثات، والجدار الناري المحلي، وإغلاق المنافذ غير المستخدمة، وحماية الأجهزة الطرفية
التطبيق        TLS في كل مكان، والتوثيق، والتحقق من المدخلات، وتحديد المعدل
البيانات       التشفير أثناء التخزين، ونسخ احتياطية جرّبت استعادتها
الأشخاص        التدريب، والحد الأدنى من الصلاحيات، والتحقق متعدد العوامل
الاكتشاف       السجلات، وأنظمة كشف التسلل، وتنبيهات يقرؤها أحد فعلاً، وخطة للحوادث
\`\`\`

وأضف **الإعدادات الآمنة افتراضياً** (الرفض ما لم يُسمح، والخدمات متوقفة ما لم تُحتج)، و**تقليص سطح الهجوم** (فكل منفذ مفتوح وكل خدمة مثبتة شيء يجب الدفاع عنه)، و**المراقبة مع خطة للاستجابة**، لأن الوقاية تفشل في النهاية ويصبح السؤال: كم بسرعة تلاحظ. وبهذه المفردات أنت مستعد لأي تخصص أمني؛ ومسار الأمن السيبراني في هذا الموقع يبني على هذه الأفكار بالضبط.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Why does IP spoofing work well for reflection attacks but poorly for opening a TCP connection from outside the path?", ar: "لماذا ينجح انتحال IP في هجمات الانعكاس لكنه يفشل غالباً في فتح اتصال TCP من خارج المسار؟" },
          choices: [
            { en: "Because routers check source addresses against a global list", ar: "لأن الراوترات تفحص عناوين المصدر مقابل قائمة عالمية" },
            { en: "Because TCP encrypts the handshake", ar: "لأن TCP يشفّر المصافحة" },
            { en: "Because UDP packets cannot be spoofed", ar: "لأن حزم UDP لا يمكن انتحالها" },
            { en: "Replies go to the forged address, so the attacker never sees the server's unpredictable sequence number needed to finish the handshake", ar: "تذهب الردود إلى العنوان المزوّر، فلا يرى المهاجم أبداً رقم التسلسل غير المتوقَّع للخادم اللازم لإكمال المصافحة" },
          ],
          answer: 3,
          explain: {
            en: "A reflection attack does not need replies: the replies are the weapon, aimed at the victim. A TCP handshake needs the attacker to acknowledge the server's random initial sequence number, which only travels to the forged address. Nothing checks source addresses globally, which is why BCP 38 filtering at every edge matters.",
            ar: "هجوم الانعكاس لا يحتاج إلى الردود: فالردود هي السلاح، موجهة إلى الضحية. أما مصافحة TCP فتحتاج من المهاجم أن يقرّ برقم التسلسل الابتدائي العشوائي للخادم، وهذا لا يسافر إلا إلى العنوان المزوّر. ولا يوجد ما يفحص عناوين المصدر عالمياً، ولهذا يهم ترشيح BCP 38 عند كل طرف.",
          },
        },
        {
          q: { en: "An attacker on a café Wi-Fi poisons ARP caches and relays everyone's traffic. What protects a user's online banking session best?", ar: "مهاجم على شبكة Wi-Fi في مقهى يسمّم ذاكرات ARP ويمرّر حركة الجميع. ما الذي يحمي جلسة الخدمات المصرفية لمستخدم على أفضل وجه؟" },
          choices: [
            { en: "HTTPS with a valid certificate (and HSTS), with the user never clicking through certificate warnings", ar: "HTTPS بشهادة صالحة (ومعه HSTS)، مع عدم تجاوز المستخدم أي تحذير للشهادة أبداً" },
            { en: "A strong Wi-Fi signal", ar: "إشارة Wi-Fi قوية" },
            { en: "Changing the laptop's MAC address", ar: "تغيير عنوان MAC الخاص بالحاسوب" },
            { en: "Turning off IPv6", ar: "إيقاف IPv6" },
          ],
          answer: 0,
          explain: {
            en: "The attacker is already in the path, so the protection must come from end-to-end encryption with authentication. TLS certificate validation prevents impersonation of the bank, and HSTS prevents a downgrade to plain HTTP. A VPN would also protect the local hop. Signal strength, MAC addresses and IPv6 do not stop a MITM.",
            ar: "المهاجم موجود أصلاً في المسار، فيجب أن تأتي الحماية من التشفير من طرف إلى طرف مع التوثيق. فالتحقق من شهادة TLS يمنع انتحال شخصية المصرف، وHSTS يمنع الخفض إلى HTTP العادي. وكانت VPN ستحمي القفزة المحلية أيضاً. أما قوة الإشارة وعناوين MAC وIPv6 فلا توقف الوسيط الخبيث.",
          },
        },
        {
          q: { en: "How do SYN cookies defend a server against a SYN flood?", ar: "كيف تدافع SYN cookies عن خادم ضد إغراق SYN؟" },
          choices: [
            { en: "They block every IP address that sends a SYN", ar: "تحجب كل عنوان IP يرسل SYN" },
            { en: "The server encodes the connection details in its initial sequence number and stores no state until the client's final ACK returns", ar: "يرمّز الخادم تفاصيل الاتصال في رقم تسلسله الابتدائي ولا يخزّن أي حالة حتى يعود الإقرار الأخير من العميل" },
            { en: "They store a cookie in the client's browser", ar: "تخزّن ملف تعريف ارتباط في متصفح العميل" },
            { en: "They make the half-open queue infinitely large", ar: "تجعل طابور الاتصالات نصف المفتوحة لا نهائياً" },
          ],
          answer: 1,
          explain: {
            en: "A SYN flood works by filling the table of half-open connections. With SYN cookies the server answers each SYN without remembering it; only a client that returns a valid ACK, which spoofed sources never do, makes the server create the connection. They have nothing to do with web cookies.",
            ar: "يعمل إغراق SYN بملء جدول الاتصالات نصف المفتوحة. ومع SYN cookies يجيب الخادم عن كل SYN دون أن يتذكره؛ ولا يدفع الخادمَ إلى إنشاء الاتصال إلا عميلٌ يعيد إقراراً صالحاً، والمصادر المنتحَلة لا تفعل ذلك أبداً. ولا علاقة لها بملفات تعريف الارتباط في الويب.",
          },
        },
        {
          q: { en: "Your firewall log shows one source connecting to port 22 on 200 different hosts within a minute. What is this?", ar: "يُظهر سجل جدارك الناري مصدراً واحداً يتصل بالمنفذ 22 على 200 جهاز مختلف خلال دقيقة. ما هذا؟" },
          choices: [
            { en: "A vertical scan", ar: "فحص عمودي" },
            { en: "A SYN flood against one server", ar: "إغراق SYN ضد خادم واحد" },
            { en: "A horizontal scan (a sweep) looking for SSH servers", ar: "فحص أفقي (مسح) يبحث عن خوادم SSH" },
            { en: "Normal SSH usage", ar: "استخدام عادي لـ SSH" },
          ],
          answer: 2,
          explain: {
            en: "One port across many hosts is a horizontal scan, typically looking for services to attack, such as SSH with weak passwords. A vertical scan is many ports on one host, and a flood aims a lot of traffic at one target. Investigate the source, block or rate-limit it, and make sure SSH only accepts keys.",
            ar: "منفذ واحد عبر أجهزة كثيرة فحص أفقي، يبحث عادةً عن خدمات لمهاجمتها، مثل SSH بكلمات مرور ضعيفة. أما الفحص العمودي فمنافذ كثيرة على جهاز واحد، والإغراق يوجّه حركة كثيفة إلى هدف واحد. تحقّق من المصدر، واحجبه أو حدّد معدله، وتأكد من أن SSH لا يقبل إلا المفاتيح.",
          },
        },
        {
          q: { en: "A company's web server is compromised, but the attacker cannot reach the HR database. Which principle did the most to stop them?", ar: "اختُرق خادم الويب في شركة، لكن المهاجم لم يستطع الوصول إلى قاعدة بيانات الموارد البشرية. أي مبدأ كان له الفضل الأكبر في إيقافه؟" },
          choices: [
            { en: "Using a strong Wi-Fi password", ar: "استخدام كلمة مرور Wi-Fi قوية" },
            { en: "Segmentation with least-privilege firewall rules between zones", ar: "التجزئة مع قواعد جدار ناري بالحد الأدنى من الصلاحيات بين المناطق" },
            { en: "Having a fast Internet connection", ar: "امتلاك اتصال إنترنت سريع" },
            { en: "Running the web server on port 443", ar: "تشغيل خادم الويب على المنفذ 443" },
          ],
          answer: 1,
          explain: {
            en: "Defences still fail sometimes; segmentation decides how far an attacker can go afterwards. If the DMZ may only reach the specific services it needs, a compromised web server is a contained incident instead of a full breach. That is defence in depth: the next layer catches what the first one missed.",
            ar: "الدفاعات ما زالت تفشل أحياناً؛ والتجزئة تقرر إلى أي مدى يستطيع المهاجم أن يمضي بعد ذلك. فإذا كانت المنطقة منزوعة السلاح لا تصل إلا إلى الخدمات المحددة التي تحتاجها، فإن اختراق خادم الويب يصبح حادثة محصورة بدلاً من اختراق شامل. وهذا هو الدفاع في العمق: الطبقة التالية تلتقط ما فات الأولى.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap

- Security protects **confidentiality, integrity and availability**; risk is likelihood times impact, reduced, never zero.
- **Spoofing** forges identities: IP (stopped by **BCP 38** filtering and uRPF), MAC (use **802.1X**), ARP (**Dynamic ARP Inspection**, monitoring, encryption) and DNS (randomised IDs and ports, **DNSSEC**).
- **Man-in-the-middle** attacks are defeated by **end-to-end encryption with authentication**: TLS with certificate validation, **HSTS**, SSH host keys, VPNs.
- **DoS/DDoS**: volumetric floods and amplification (filter upstream, CDNs, anycast), state exhaustion (**SYN cookies**), application floods (**rate limiting** with token buckets).
- **Port scans** show up as many distinct targets per source in a short window; slow scans and legitimate scanners are the blind spots.
- Build on **least privilege, segmentation and defence in depth**, with secure defaults and monitoring that someone acts on.

**Practice next:** in a lab you own (two virtual machines are enough), scan one from the other with nmap and find the scan in the target's firewall log, then enable rate limiting and see it in action. You have finished the core of the networking track; cloud networking is the natural next step.`,
        ar: `## الخلاصة

- يحمي الأمن **السرية والسلامة والتوافر**؛ والخطر هو الاحتمال مضروباً في الأثر، ويُخفَّض ولا يصل إلى الصفر أبداً.
- **الانتحال** يزوّر الهويات: IP (يوقفه ترشيح **BCP 38** وuRPF)، وMAC (استخدم **802.1X**)، وARP (**الفحص الديناميكي لـ ARP** والمراقبة والتشفير)، وDNS (المعرّفات والمنافذ العشوائية و**DNSSEC**).
- هجمات **الوسيط الخبيث** يهزمها **التشفير من طرف إلى طرف مع التوثيق**: TLS مع التحقق من الشهادة، و**HSTS**، ومفاتيح المضيف في SSH، والشبكات الافتراضية الخاصة.
- **DoS/DDoS**: الإغراق الحجمي والتضخيم (رشّح في المنبع، وCDN، وanycast)، واستنزاف الحالة (**SYN cookies**)، وإغراق التطبيقات (**تحديد المعدل** بدلاء الرموز).
- **فحص المنافذ** يظهر على شكل أهداف مختلفة كثيرة لكل مصدر في نافذة قصيرة؛ والفحص البطيء والفاحصات المشروعة هي النقاط العمياء.
- ابنِ على **الحد الأدنى من الصلاحيات والتجزئة والدفاع في العمق**، مع إعدادات آمنة افتراضياً ومراقبة يتصرّف أحدٌ بناءً عليها.

**تدرّب بعد ذلك:** في مختبر تملكه (يكفي جهازان افتراضيان)، افحص أحدهما من الآخر بـ nmap وابحث عن الفحص في سجل الجدار الناري للهدف، ثم فعّل تحديد المعدل وشاهده يعمل. لقد أنهيت جوهر مسار الشبكات؛ وشبكات السحابة هي الخطوة الطبيعية التالية.`,
      },
    },
  ],
};
