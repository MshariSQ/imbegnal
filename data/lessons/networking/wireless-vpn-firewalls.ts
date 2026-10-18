import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "wireless-vpn-firewalls",
  title: { en: "Wireless, VPNs & Firewalls — Guarding the Edges", ar: "الشبكات اللاسلكية والشبكات الافتراضية الخاصة والجدران النارية — حراسة الأطراف" },
  estMinutes: 43,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- How **Wi-Fi** shares the air, and how **WPA2** and **WPA3** protect it (and why WEP and WPS do not)
- How a **VPN** carries your packets inside an encrypted **tunnel**, with **WireGuard** and **IPsec** as examples
- How **stateless** and **stateful firewalls** decide which packets may pass, and why the rule order matters
- How **NAT** lets a whole home share one public address, and what a **DMZ** and **network segmentation** are for
- You will build three tools: a first-match firewall, a NAT translation table and WireGuard's cryptokey routing

⚠️ **Ethics first:** configure and test only networks and devices you own or have written permission to test. Connecting to someone else's Wi-Fi without permission, cracking its password or getting around a firewall you do not control are crimes in most countries. This lesson is about building the defences.

## The building with a guard 🏢

Think of your network as an office building. **Wi-Fi** is a meeting room with the windows open: everyone outside can hear what is said, so you must speak in a code only your colleagues know. A **VPN** is an armoured van that carries your documents through the public streets to another office: people see a van, not the papers. The **firewall** is the guard at the door with a list of who may enter and leave. **NAT** is the reception desk that sends all outgoing letters with the company's single street address and knows which employee each reply is for. And the **DMZ** is the lobby: visitors meet staff there and never walk into the offices.`,
        ar: `## ماذا ستتعلم

- كيف تتقاسم **Wi-Fi** الهواء، وكيف يحميها **WPA2** و**WPA3** (ولماذا لا يحميها WEP وWPS)
- كيف تحمل **الشبكة الافتراضية الخاصة (VPN)** حزمك داخل **نفق** مشفّر، مع **WireGuard** و**IPsec** مثالين
- كيف تقرّر **الجدران النارية عديمة الحالة (stateless)** و**ذات الحالة (stateful)** أي الحزم يُسمح بمرورها، ولماذا يهم ترتيب القواعد
- كيف يسمح **NAT** لبيت كامل بأن يتشارك عنواناً عاماً واحداً، وما فائدة **المنطقة منزوعة السلاح (DMZ)** و**تجزئة الشبكة (segmentation)**
- ستبني ثلاث أدوات: جداراً نارياً بأول تطابق، وجدول ترجمة NAT، وتوجيه المفاتيح التشفيرية (cryptokey routing) في WireGuard

⚠️ **الأخلاق أولاً:** لا تضبط ولا تختبر إلا الشبكات والأجهزة التي تملكها أو لديك إذن مكتوب باختبارها. فالاتصال بشبكة Wi-Fi لغيرك دون إذن، أو كسر كلمة مرورها، أو الالتفاف على جدار ناري لا تتحكم فيه، جرائم في أغلب الدول. وهذا الدرس عن بناء الدفاعات.

## المبنى وحارسه 🏢

تخيّل شبكتك مبنى مكاتب. **Wi-Fi** غرفة اجتماعات نوافذها مفتوحة: كل من في الخارج يسمع ما يُقال، فيجب أن تتكلم بشيفرة لا يعرفها إلا زملاؤك. و**الشبكة الافتراضية الخاصة (VPN)** شاحنة مصفّحة تنقل وثائقك عبر الشوارع العامة إلى مكتب آخر: يرى الناس شاحنة لا الأوراق. و**الجدار الناري** هو الحارس على الباب ومعه قائمة بمن يُسمح له بالدخول والخروج. و**NAT** هو مكتب الاستقبال الذي يرسل كل الرسائل الصادرة بعنوان الشركة الوحيد، ويعرف لأي موظف كل رد. أما **المنطقة منزوعة السلاح (DMZ)** فهي البهو: يلتقي فيه الزوار بالموظفين ولا يدخلون المكاتب أبداً.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Wi-Fi: one shared radio channel

Wi-Fi is the IEEE **802.11** family. The Wi-Fi Alliance gives the generations simple names: **Wi-Fi 4** (802.11n), **Wi-Fi 5** (802.11ac), **Wi-Fi 6** (802.11ax), **Wi-Fi 6E** (802.11ax extended to the 6 GHz band) and **Wi-Fi 7** (802.11be). Devices talk to an **access point** (AP). The network has a name, the **SSID**, and each AP radio has its own MAC address, the **BSSID**. A device first **associates** with an AP, then (on a protected network) proves it knows the key, and only then may it send data.

Radio is a **shared medium**: only one device can transmit on a channel at a time, and a transmitter cannot hear a collision while it is sending. So Wi-Fi uses **CSMA/CA** (collision *avoidance*): listen first, wait a random time, then send, and every unicast frame is acknowledged. That is why a crowded channel feels slow for everyone, and why channel planning matters:

- **2.4 GHz**: long range, walls hurt less, but only a few non-overlapping channels and plenty of interference (Bluetooth, microwave ovens, neighbours). Channels are 5 MHz apart while each transmission is about 20 MHz wide, which is why \`1\`, \`6\` and \`11\` are the classic choice.
- **5 GHz** and **6 GHz**: many more and wider channels, higher speeds, shorter range.

The most important security fact about Wi-Fi follows from the shared medium: **anyone in range receives every frame**. Security therefore depends entirely on encryption and authentication.`,
        ar: `## Wi-Fi: قناة راديوية واحدة مشتركة

شبكات Wi-Fi هي عائلة **IEEE 802.11**. ويعطي تحالف Wi-Fi الأجيال أسماء بسيطة: **Wi-Fi 4** (802.11n)، و**Wi-Fi 5** (802.11ac)، و**Wi-Fi 6** (802.11ax)، و**Wi-Fi 6E** (802.11ax ممتداً إلى نطاق 6 GHz)، و**Wi-Fi 7** (802.11be). وتتحدث الأجهزة مع **نقطة وصول (access point / AP)**. وللشبكة اسم هو **SSID**، ولكل راديو في نقطة الوصول عنوان MAC خاص به هو **BSSID**. يرتبط الجهاز (**associates**) أولاً بنقطة الوصول، ثم (في الشبكة المحمية) يثبت أنه يعرف المفتاح، وعندها فقط يُسمح له بإرسال البيانات.

والراديو **وسط مشترك**: لا يستطيع إلا جهاز واحد أن يرسل على القناة في اللحظة نفسها، ولا يستطيع المرسل أن يسمع التصادم أثناء إرساله. لذلك تستخدم Wi-Fi آلية **CSMA/CA** (*تجنّب* التصادم): استمع أولاً، وانتظر زمناً عشوائياً، ثم أرسل، وكل إطار أحادي يُقَرّ باستلامه. ولهذا تبدو القناة المزدحمة بطيئة للجميع، ولهذا يهم تخطيط القنوات:

- **2.4 GHz**: مدى طويل، والجدران تؤثر أقل، لكن القنوات غير المتداخلة قليلة والتداخل كثير (Bluetooth وأفران الميكروويف والجيران). والقنوات تبعد 5 MHz بعضها عن بعض بينما يبلغ عرض كل إرسال نحو 20 MHz، ولهذا كانت \`1\` و\`6\` و\`11\` الاختيار الكلاسيكي.
- **5 GHz** و**6 GHz**: قنوات أكثر بكثير وأعرض، وسرعات أعلى، ومدى أقصر.

وأهم حقيقة أمنية عن Wi-Fi تنتج عن الوسط المشترك: **كل من في المدى يستقبل كل إطار**. لذلك يعتمد الأمان كلياً على التشفير والتوثيق.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: String.raw`# 2.4 GHz Wi-Fi channels are only 5 MHz apart, but each transmission is about 20-22 MHz wide.
def centre(channel):
    """Centre frequency in MHz (channel 14 exists only in Japan, for old 802.11b)."""
    return 2484 if channel == 14 else 2407 + 5 * channel


def overlap(a, b, width):
    return abs(centre(a) - centre(b)) < width


def non_overlapping(width, channels):
    chosen = []
    for ch in channels:
        if all(not overlap(ch, c, width) for c in chosen):
            chosen.append(ch)
    return chosen


for ch in (1, 6, 11):
    print("channel %2d -> %d MHz" % (ch, centre(ch)))
print("do channels 1 and 3 overlap at 22 MHz?", overlap(1, 3, 22))
print("22 MHz wide (802.11b), channels 1-11:", non_overlapping(22, range(1, 12)))
print("20 MHz wide (802.11g/n), channels 1-13:", non_overlapping(20, range(1, 14)))
`,
      explanation: {
        en: "Each channel number moves the centre by only 5 MHz, so neighbouring channels share most of their spectrum and interfere. With the 22 MHz width of the original 802.11b signal you can fit three channels side by side in 1 to 11 (1, 6, 11); with 20 MHz OFDM signals and channels up to 13, as allowed in many countries, four fit (1, 5, 9, 13). Try a 40 MHz width and see why wide channels make little sense at 2.4 GHz.",
        ar: "كل رقم قناة يحرّك المركز 5 MHz فقط، فتتشارك القنوات المتجاورة معظم طيفها ويتداخل بعضها مع بعض. ومع عرض 22 MHz لإشارة 802.11b الأصلية تتسع ثلاث قنوات متجاورة ضمن 1 إلى 11 (1 و6 و11)؛ ومع إشارات OFDM بعرض 20 MHz وقنوات حتى 13، كما يُسمح في دول كثيرة، تتسع أربع (1 و5 و9 و13). جرّب عرض 40 MHz وانظر لماذا لا معنى كبيراً للقنوات العريضة في 2.4 GHz.",
      },
    },
    {
      type: "text",
      body: {
        en: `## Securing Wi-Fi: from WEP to WPA3

- **Open networks** encrypt nothing: anyone nearby can read unencrypted traffic. Newer access points can offer **Enhanced Open** (OWE, RFC 8110), which encrypts each client's traffic without a password, though it does not prove the AP is genuine.
- **WEP** (1997) is broken beyond repair: its RC4-based design leaks the key after enough traffic. Never use it.
- **WPA** with TKIP was a stopgap for old hardware and is deprecated.
- **WPA2** (IEEE 802.11i, 2004) uses **AES-CCMP**. In **WPA2-Personal** everybody shares one passphrase (a **PSK**), and a **4-way handshake** derives fresh session keys. Its weakness: someone who records a handshake can test password guesses **offline**, as fast as their hardware allows, so a short or common passphrase falls quickly. (The 2017 KRACK attack on the handshake was fixed by software updates.)
- **WPA2/WPA3-Enterprise** replaces the shared passphrase with **802.1X**: each user or device logs in with its own credentials, checked by a RADIUS server, so a leaving employee loses access without changing everyone's password.
- **WPA3** (2018) replaces the PSK handshake with **SAE** (Simultaneous Authentication of Equals). Every guess now needs a live exchange with the AP, so recorded traffic cannot be attacked offline, and each session gets **forward secrecy**. WPA3 also requires **Protected Management Frames** (802.11w), which stops forged "disconnect" frames.

A sound home or office setup: **WPA3** (or WPA2/WPA3 transition mode for older devices), a long random passphrase, **WPS switched off** (its 8-digit PIN can be brute-forced because the protocol checks the two halves separately), a separate **guest network** in its own VLAN, a changed admin password and current firmware. On someone else's hotspot, assume others can see your traffic and rely on **TLS** and a **VPN**.`,
        ar: `## تأمين Wi-Fi: من WEP إلى WPA3

- **الشبكات المفتوحة** لا تشفّر شيئاً: يستطيع أي قريب أن يقرأ الحركة غير المشفّرة. ويمكن لنقاط الوصول الأحدث أن تقدّم **Enhanced Open** (OWE، RFC 8110) التي تشفّر حركة كل عميل دون كلمة مرور، وإن كانت لا تثبت أن نقطة الوصول أصلية.
- **WEP** (1997) معطوب بلا أمل في إصلاحه: تصميمه القائم على RC4 يسرّب المفتاح بعد قدر كافٍ من الحركة. لا تستخدمه أبداً.
- **WPA** مع TKIP كان حلاً مؤقتاً للأجهزة القديمة، وهو مُهمل الآن.
- **WPA2** (IEEE 802.11i، 2004) يستخدم **AES-CCMP**. وفي **WPA2-Personal** يتشارك الجميع عبارة مرور واحدة (**PSK**)، و**مصافحة رباعية (4-way handshake)** تشتق مفاتيح جلسة جديدة. ونقطة ضعفه: من يسجّل مصافحة يستطيع أن يجرّب تخمينات كلمة المرور **دون اتصال (offline)**، بأسرع ما يسمح به عتاده، فتسقط عبارة المرور القصيرة أو الشائعة بسرعة. (وقد أُصلح هجوم KRACK على المصافحة عام 2017 بتحديثات برمجية.)
- **WPA2/WPA3-Enterprise** يستبدل بعبارة المرور المشتركة **802.1X**: يسجّل كل مستخدم أو جهاز الدخول ببيانات اعتماده الخاصة، ويتحقق منها خادم RADIUS، فيفقد الموظف المغادر صلاحيته دون تغيير كلمة مرور الجميع.
- **WPA3** (2018) يستبدل بمصافحة PSK بروتوكول **SAE** (المصادقة المتزامنة بين الأنداد). فكل تخمين يحتاج الآن إلى تبادل حي مع نقطة الوصول، فلا يمكن مهاجمة الحركة المسجّلة دون اتصال، وتحصل كل جلسة على **السرية الأمامية**. ويشترط WPA3 أيضاً **إطارات الإدارة المحمية (802.11w)**، التي تمنع إطارات "قطع الاتصال" المزوّرة.

والإعداد السليم للبيت أو المكتب: **WPA3** (أو وضع الانتقال WPA2/WPA3 للأجهزة القديمة)، وعبارة مرور طويلة عشوائية، و**إيقاف WPS** (فرقم PIN ذو الأرقام الثمانية يمكن تخمينه بالقوة لأن البروتوكول يتحقق من نصفيه كلٍّ على حدة)، و**شبكة ضيوف** منفصلة في VLAN خاصة بها، وكلمة مرور إدارة مغيَّرة، وبرنامج ثابت (firmware) محدَّث. وعلى نقطة اتصال لغيرك افترض أن الآخرين يرون حركتك واعتمد على **TLS** و**VPN**.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## VPNs: a private tunnel across a public network

A **VPN** takes each packet, encrypts and authenticates it, and puts it inside a new packet addressed to the other end of the tunnel. On the way, observers see only the outer header: your address, the VPN server's address and an encrypted blob.

\`\`\`text
inner packet:   | IP 10.0.0.2 -> 10.0.0.1 | TCP | data |
on the wire:    | IP 192.0.2.10 -> 203.0.113.1 | UDP 51820 | WireGuard header | encrypted inner packet | tag |
                  outer header (visible)                       (unreadable and tamper-proof)
\`\`\`

There are two common shapes. **Remote access**: a laptop on a café network connects to the office or to a VPN provider. **Site-to-site**: two office routers keep a permanent tunnel so the branches act like one network. A **full tunnel** sends all traffic through the VPN; a **split tunnel** only sends the company's prefixes and lets the rest go directly to the Internet.

The main protocols:

- **IPsec**: the long-standing standard (architecture RFC 4301, ESP RFC 4303), with **IKEv2** (RFC 7296) to authenticate the peers and agree on keys. Common for site-to-site links between firewalls.
- **WireGuard**: a small, modern design that runs over UDP (51820 by convention) with a fixed set of modern algorithms (Curve25519, ChaCha20-Poly1305, BLAKE2s). It has been part of the Linux kernel since version 5.6. Each peer is identified by a public key.
- **TLS-based VPNs** such as OpenVPN run over TLS and work even where only HTTPS-like traffic gets through.

A WireGuard configuration shows the most elegant idea, **cryptokey routing**. Each peer has a public key and a list of **AllowedIPs** (the keys below are placeholders):

\`\`\`text
[Interface]
PrivateKey = <laptop-private-key>
Address    = 10.0.0.2/32

[Peer]
PublicKey  = <office-public-key>
Endpoint   = 203.0.113.1:51820
AllowedIPs = 10.0.0.0/24, 192.168.50.0/24
\`\`\`

The AllowedIPs list works in both directions. **Sending**: a packet for \`192.168.50.17\` is encrypted for the peer whose AllowedIPs contain it (longest prefix wins). **Receiving**: after decryption, a packet is accepted only if its inner source address maps back to the peer that sent it. So a peer can never pretend to be another address. Tunnels add headers: over IPv4 WireGuard adds 60 bytes (20 IP + 8 UDP + 16 WireGuard header + 16 authentication tag), over IPv6 80 bytes, which is why tunnel MTUs are smaller than 1500.

Know what a VPN does **not** do. It protects the path to the VPN server, not what happens after it; the VPN operator can see your traffic; and it does not make you anonymous or stop malware.`,
        ar: `## الشبكات الافتراضية الخاصة: نفق خاص عبر شبكة عامة

تأخذ **الشبكة الافتراضية الخاصة (VPN)** كل حزمة، فتشفّرها وتوثّقها، وتضعها داخل حزمة جديدة موجهة إلى الطرف الآخر من النفق. وفي الطريق لا يرى المراقبون إلا الترويسة الخارجية: عنوانك، وعنوان خادم VPN، وكتلة مشفّرة.

\`\`\`text
الحزمة الداخلية:  | IP 10.0.0.2 -> 10.0.0.1 | TCP | data |
على السلك:        | IP 192.0.2.10 -> 203.0.113.1 | UDP 51820 | WireGuard header | encrypted inner packet | tag |
                    الترويسة الخارجية (مرئية)                    (غير مقروءة ومحمية من العبث)
\`\`\`

وهناك شكلان شائعان. **الوصول عن بُعد (remote access)**: حاسوب محمول على شبكة مقهى يتصل بالمكتب أو بمزوّد VPN. و**من موقع إلى موقع (site-to-site)**: راوترا مكتبين يُبقيان نفقاً دائماً فيعمل الفرعان كشبكة واحدة. و**النفق الكامل (full tunnel)** يرسل كل الحركة عبر VPN؛ أما **النفق المجزّأ (split tunnel)** فلا يرسل إلا بادئات الشركة ويترك البقية تذهب مباشرة إلى الإنترنت.

البروتوكولات الرئيسية:

- **IPsec**: المعيار الراسخ (المعمارية في RFC 4301، وESP في RFC 4303)، ومعه **IKEv2** (RFC 7296) لتوثيق الأنداد والاتفاق على المفاتيح. وهو شائع في الروابط من موقع إلى موقع بين الجدران النارية.
- **WireGuard**: تصميم صغير حديث يعمل فوق UDP (المنفذ 51820 اصطلاحاً) بمجموعة ثابتة من الخوارزميات الحديثة (Curve25519 وChaCha20-Poly1305 وBLAKE2s). وهو جزء من نواة Linux منذ الإصدار 5.6. ويُعرَّف كل ند بمفتاح عام.
- **الشبكات الافتراضية القائمة على TLS** مثل OpenVPN تعمل فوق TLS، وتنجح حتى حيث لا تمر إلا حركة تشبه HTTPS.

ويُظهر ملف إعداد WireGuard أجمل فكرة فيه، **توجيه المفاتيح التشفيرية (cryptokey routing)**. لكل ند مفتاح عام وقائمة **AllowedIPs** (والمفاتيح أدناه مجرد عناصر نائبة):

\`\`\`text
[Interface]
PrivateKey = <laptop-private-key>
Address    = 10.0.0.2/32

[Peer]
PublicKey  = <office-public-key>
Endpoint   = 203.0.113.1:51820
AllowedIPs = 10.0.0.0/24, 192.168.50.0/24
\`\`\`

تعمل قائمة AllowedIPs في الاتجاهين. **عند الإرسال**: الحزمة الموجهة إلى \`192.168.50.17\` تُشفَّر للند الذي تحتويها قائمة AllowedIPs الخاصة به (والبادئة الأطول تفوز). **وعند الاستقبال**: بعد فك التشفير لا تُقبل الحزمة إلا إذا كان عنوان مصدرها الداخلي يعود إلى الند الذي أرسلها. فلا يستطيع الند أبداً أن يتظاهر بعنوان آخر. والأنفاق تضيف ترويسات: فوق IPv4 يضيف WireGuard ستين بايتاً (20 لـ IP و8 لـ UDP و16 لترويسة WireGuard و16 لوسم التوثيق)، وفوق IPv6 ثمانين بايتاً، ولهذا تكون وحدة MTU في الأنفاق أصغر من 1500.

واعرف ما **لا** تفعله VPN. فهي تحمي المسار إلى خادم VPN، لا ما يحدث بعده؛ ومشغّل VPN يستطيع أن يرى حركتك؛ ولا تجعلك مجهول الهوية ولا توقف البرمجيات الخبيثة.`,
      },
    },
    {
      type: "lab",
      id: "wg-cryptokey",
      lang: "go",
      prompt: {
        en: `Implement WireGuard's **cryptokey routing** table.

**Input**, one item per line:

- \`peer <name> <cidr>[,<cidr>...]\`: a peer and its allowed IPv4 ranges (a peer may also have none). All ranges are different.
- \`send <destination-ip>\`: the interface wants to send a packet.
- \`recv <peer> <source-ip>\`: a packet arrived from that peer and decrypted correctly; its inner source address is \`<source-ip>\`.

**Rules.** Build one table from all allowed ranges. **Looking up** an address means finding the range that contains it with the **longest prefix**, and taking its peer.

- \`send\`: \`encrypt for <peer>\` with the peer found by the lookup, or \`drop (no peer)\`.
- \`recv\`: if the peer name was never declared, \`drop (unknown peer)\`. Otherwise look up the source address: if it gives this same peer, \`accept\`; if it gives another peer, \`drop (source belongs to <that peer>)\`; if it gives nothing, \`drop (source not allowed)\`.

**Output**, one line per \`send\` or \`recv\`: the command as given, a colon, a space and the result.

**Example**

\`\`\`text
Input:
peer laptop 10.0.0.2/32
peer office 10.0.0.3/32,192.168.50.0/24
peer gateway 0.0.0.0/0
send 192.168.50.17
send 198.51.100.7
recv office 192.168.50.9
recv laptop 10.0.0.3

Output:
send 192.168.50.17: encrypt for office
send 198.51.100.7: encrypt for gateway
recv office 192.168.50.9: accept
recv laptop 10.0.0.3: drop (source belongs to office)
\`\`\``,
        ar: `نفّذ جدول **توجيه المفاتيح التشفيرية (cryptokey routing)** في WireGuard.

**الإدخال**، عنصر في كل سطر:

- \`peer <name> <cidr>[,<cidr>...]\`: ند ونطاقات IPv4 المسموحة له (وقد لا يكون للند أي نطاق). وكل النطاقات مختلفة.
- \`send <destination-ip>\`: تريد الواجهة أن ترسل حزمة.
- \`recv <peer> <source-ip>\`: وصلت حزمة من ذلك الند وفُكّ تشفيرها بنجاح؛ وعنوان مصدرها الداخلي هو \`<source-ip>\`.

**القواعد.** ابنِ جدولاً واحداً من كل النطاقات المسموحة. و**البحث** عن عنوان يعني إيجاد النطاق الذي يحتويه بـ **أطول بادئة**، وأخذ نده.

- \`send\`: \`encrypt for <peer>\` مع الند الذي وجده البحث، أو \`drop (no peer)\`.
- \`recv\`: إذا لم يُعلَن اسم الند أبداً فالنتيجة \`drop (unknown peer)\`. وإلا فابحث عن عنوان المصدر: إن أعطى الند نفسه فالنتيجة \`accept\`؛ وإن أعطى نداً آخر فالنتيجة \`drop (source belongs to <ذلك الند>)\`؛ وإن لم يعطِ شيئاً فالنتيجة \`drop (source not allowed)\`.

**الإخراج**، سطر لكل \`send\` أو \`recv\`: الأمر كما ورد، ثم نقطتان رأسيتان ومسافة ثم النتيجة.

**مثال**

\`\`\`text
الإدخال:
peer laptop 10.0.0.2/32
peer office 10.0.0.3/32,192.168.50.0/24
peer gateway 0.0.0.0/0
send 192.168.50.17
send 198.51.100.7
recv office 192.168.50.9
recv laptop 10.0.0.3

الإخراج:
send 192.168.50.17: encrypt for office
send 198.51.100.7: encrypt for gateway
recv office 192.168.50.9: accept
recv laptop 10.0.0.3: drop (source belongs to office)
\`\`\``,
      },
      starterCode: String.raw`package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
)

type allowed struct {
	peer   string
	base   uint32
	prefix int
}

func parseIP(s string) (uint32, bool) {
	parts := strings.Split(s, ".")
	if len(parts) != 4 {
		return 0, false
	}
	var v uint32
	for _, p := range parts {
		n, err := strconv.Atoi(p)
		if err != nil || n < 0 || n > 255 {
			return 0, false
		}
		v = v<<8 | uint32(n)
	}
	return v, true
}

func mask(prefix int) uint32 {
	if prefix == 0 {
		return 0
	}
	return ^uint32(0) << (32 - prefix)
}

// lookup returns the peer whose allowed IPs contain ip with the longest prefix ("" if none).
func lookup(table []allowed, ip uint32) string {
	// TODO: keep the matching entry with the largest prefix, not the first one.
	for _, a := range table {
		if ip&mask(a.prefix) == a.base {
			return a.peer
		}
	}
	return ""
}

func main() {
	var table []allowed
	peers := map[string]bool{}
	in := bufio.NewScanner(os.Stdin)
	for in.Scan() {
		f := strings.Fields(in.Text())
		if len(f) < 2 {
			continue
		}
		switch f[0] {
		case "peer": // peer <name> <cidr>[,<cidr>...]
			peers[f[1]] = true
			if len(f) < 3 {
				continue
			}
			for _, c := range strings.Split(f[2], ",") {
				addr, bits, _ := strings.Cut(c, "/")
				ip, ok := parseIP(addr)
				prefix, err := strconv.Atoi(bits)
				if ok && err == nil && prefix >= 0 && prefix <= 32 {
					table = append(table, allowed{f[1], ip & mask(prefix), prefix})
				}
			}
		case "send": // send <destination-ip>
			ip, _ := parseIP(f[1])
			if p := lookup(table, ip); p != "" {
				fmt.Printf("send %s: encrypt for %s\n", f[1], p)
			} else {
				fmt.Printf("send %s: drop (no peer)\n", f[1])
			}
		case "recv": // recv <peer> <source-ip>
			if len(f) < 3 {
				continue
			}
			// TODO: unknown peer, then look up the source address and compare its owner with f[1].
			fmt.Printf("recv %s %s: accept\n", f[1], f[2])
		}
	}
}
`,
      solution: String.raw`package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
)

type allowed struct {
	peer   string
	base   uint32
	prefix int
}

func parseIP(s string) (uint32, bool) {
	parts := strings.Split(s, ".")
	if len(parts) != 4 {
		return 0, false
	}
	var v uint32
	for _, p := range parts {
		n, err := strconv.Atoi(p)
		if err != nil || n < 0 || n > 255 {
			return 0, false
		}
		v = v<<8 | uint32(n)
	}
	return v, true
}

func mask(prefix int) uint32 {
	if prefix == 0 {
		return 0
	}
	return ^uint32(0) << (32 - prefix)
}

// lookup returns the peer whose allowed IPs contain ip with the longest prefix ("" if none).
// WireGuard uses this one table both to choose where to send and to check what it receives.
func lookup(table []allowed, ip uint32) string {
	best, bestLen := "", -1
	for _, a := range table {
		if ip&mask(a.prefix) == a.base && a.prefix > bestLen {
			best, bestLen = a.peer, a.prefix
		}
	}
	return best
}

func main() {
	var table []allowed
	peers := map[string]bool{}
	in := bufio.NewScanner(os.Stdin)
	for in.Scan() {
		f := strings.Fields(in.Text())
		if len(f) < 2 {
			continue
		}
		switch f[0] {
		case "peer": // peer <name> <cidr>[,<cidr>...]
			peers[f[1]] = true
			if len(f) < 3 {
				continue
			}
			for _, c := range strings.Split(f[2], ",") {
				addr, bits, _ := strings.Cut(c, "/")
				ip, ok := parseIP(addr)
				prefix, err := strconv.Atoi(bits)
				if ok && err == nil && prefix >= 0 && prefix <= 32 {
					table = append(table, allowed{f[1], ip & mask(prefix), prefix})
				}
			}
		case "send": // send <destination-ip>
			ip, _ := parseIP(f[1])
			if p := lookup(table, ip); p != "" {
				fmt.Printf("send %s: encrypt for %s\n", f[1], p)
			} else {
				fmt.Printf("send %s: drop (no peer)\n", f[1])
			}
		case "recv": // recv <peer> <source-ip>
			if len(f) < 3 {
				continue
			}
			ip, _ := parseIP(f[2])
			owner := lookup(table, ip)
			switch {
			case !peers[f[1]]:
				fmt.Printf("recv %s %s: drop (unknown peer)\n", f[1], f[2])
			case owner == f[1]:
				fmt.Printf("recv %s %s: accept\n", f[1], f[2])
			case owner == "":
				fmt.Printf("recv %s %s: drop (source not allowed)\n", f[1], f[2])
			default:
				fmt.Printf("recv %s %s: drop (source belongs to %s)\n", f[1], f[2], owner)
			}
		}
	}
}
`,
      hints: [
        { en: "Longest prefix: keep `best` and `bestLen := -1`, and replace them whenever an entry matches with `a.prefix > bestLen`. A `/0` entry then only wins when nothing more specific matches.", ar: "أطول بادئة: احتفظ بـ `best` و`bestLen := -1`، واستبدلهما كلما طابق مُدخل بشرط `a.prefix > bestLen`. وعندها لا يفوز مُدخل `/0` إلا حين لا يطابق شيء أكثر تحديداً." },
        { en: "`recv` uses the same lookup as `send`, applied to the **source** address. Accepting just because the source is inside *one* of the peer's ranges is not enough: a more specific range of another peer wins.", ar: "يستخدم `recv` البحث نفسه الذي يستخدمه `send`، مطبَّقاً على عنوان **المصدر**. والقبول لمجرد أن المصدر داخل *أحد* نطاقات الند لا يكفي: فالنطاق الأكثر تحديداً لند آخر يفوز." },
        { en: "Check the cases in order with a tagless `switch`: unknown peer (`!peers[f[1]]`), then `owner == f[1]`, then `owner == \"\"`, otherwise it belongs to someone else.", ar: "افحص الحالات بالترتيب بعبارة `switch` بلا وسم: ند مجهول (`!peers[f[1]]`)، ثم `owner == f[1]`، ثم `owner == \"\"`، وإلا فالمصدر يخص نداً آخر." },
      ],
      tests: [
        {
          name: { en: "The worked example, plus a gateway that claims an office address", ar: "المثال المحلول، مع بوابة تدّعي عنواناً يخص المكتب" },
          stdin: "peer laptop 10.0.0.2/32\npeer office 10.0.0.3/32,192.168.50.0/24\npeer gateway 0.0.0.0/0\nsend 192.168.50.17\nsend 10.0.0.2\nsend 198.51.100.7\nrecv office 192.168.50.9\nrecv laptop 10.0.0.3\nrecv gateway 198.51.100.7\nrecv gateway 192.168.50.9\n",
          expected: "send 192.168.50.17: encrypt for office\nsend 10.0.0.2: encrypt for laptop\nsend 198.51.100.7: encrypt for gateway\nrecv office 192.168.50.9: accept\nrecv laptop 10.0.0.3: drop (source belongs to office)\nrecv gateway 198.51.100.7: accept\nrecv gateway 192.168.50.9: drop (source belongs to office)\n",
        },
        {
          name: { en: "A more specific range inside another peer's range; unknown peers and unknown sources", ar: "نطاق أكثر تحديداً داخل نطاق ند آخر؛ وأنداد مجهولون ومصادر غير مسموحة" },
          stdin: "peer phone 10.0.0.4/32\npeer nas 10.0.0.5/32,10.10.0.0/16\npeer lab 10.10.20.0/24\nsend 10.10.20.30\nsend 10.10.21.30\nsend 10.0.0.4\nsend 10.0.0.6\nsend 192.0.2.1\nrecv lab 10.10.20.30\nrecv nas 10.10.20.30\nrecv phone 10.0.0.9\nrecv printer 10.0.0.4\n",
          expected: "send 10.10.20.30: encrypt for lab\nsend 10.10.21.30: encrypt for nas\nsend 10.0.0.4: encrypt for phone\nsend 10.0.0.6: drop (no peer)\nsend 192.0.2.1: drop (no peer)\nrecv lab 10.10.20.30: accept\nrecv nas 10.10.20.30: drop (source belongs to lab)\nrecv phone 10.0.0.9: drop (source not allowed)\nrecv printer 10.0.0.4: drop (unknown peer)\n",
        },
        {
          name: { en: "Three nested ranges and their exact edges", ar: "ثلاثة نطاقات متداخلة وحدودها الدقيقة" },
          stdin: "peer a 10.1.0.0/16\npeer b 10.1.2.0/24\npeer c 10.1.2.128/25\nsend 10.1.2.200\nsend 10.1.2.100\nsend 10.1.3.1\nsend 10.1.2.127\nsend 10.1.2.128\n",
          expected: "send 10.1.2.200: encrypt for c\nsend 10.1.2.100: encrypt for b\nsend 10.1.3.1: encrypt for a\nsend 10.1.2.127: encrypt for b\nsend 10.1.2.128: encrypt for c\n",
        },
        {
          name: { en: "A peer without allowed IPs can send nothing and claim nothing", ar: "الند الذي لا نطاقات مسموحة له لا يرسل شيئاً ولا يدّعي شيئاً" },
          stdin: "peer spare\npeer laptop 10.0.0.2/32\nsend 10.0.0.2\nrecv spare 10.0.0.2\nrecv spare 10.9.9.9\n",
          expected: "send 10.0.0.2: encrypt for laptop\nrecv spare 10.0.0.2: drop (source belongs to laptop)\nrecv spare 10.9.9.9: drop (source not allowed)\n",
        },
        {
          name: { en: "No peers at all", ar: "لا أنداد إطلاقاً" },
          stdin: "send 10.0.0.1\nrecv laptop 10.0.0.2\n",
          expected: "send 10.0.0.1: drop (no peer)\nrecv laptop 10.0.0.2: drop (unknown peer)\n",
        },
      ],
      sampleInput: "peer laptop 10.0.0.2/32\npeer office 10.0.0.3/32,192.168.50.0/24\npeer gateway 0.0.0.0/0\nsend 192.168.50.17\nsend 198.51.100.7\nrecv office 192.168.50.9\nrecv laptop 10.0.0.3\n",
    },
    {
      type: "code-demo",
      lang: "js",
      code: String.raw`// What a WireGuard tunnel adds to every packet, and what that means for the MTU.
const OUTER_IP = { IPv4: 20, IPv6: 40 };
const UDP = 8;
const WG_HEADER = 16; // message type (1) + reserved (3) + receiver index (4) + counter (8)
const TAG = 16;       // Poly1305 authentication tag after the encrypted packet
const LINK_MTU = 1500; // an ordinary Ethernet link

for (const family of Object.keys(OUTER_IP)) {
  const overhead = OUTER_IP[family] + UDP + WG_HEADER + TAG;
  console.log("tunnel over " + family + ": " + overhead + " bytes of overhead, so inner packets up to " + (LINK_MTU - overhead) + " bytes fit");
}
console.log("wg-quick subtracts 80 from the link MTU when none is configured: " + (LINK_MTU - 80));

// WireGuard also pads the inner packet to a multiple of 16 bytes (never past the tunnel MTU),
// so the result below is a lower bound.
const inner = 1500;
const outer = inner + OUTER_IP.IPv4 + UDP + WG_HEADER + TAG;
console.log("a full " + inner + "-byte packet would need at least " + outer + " bytes on a " + LINK_MTU + "-byte link: it does not fit");
`,
      explanation: {
        en: "Encapsulation is not free: every tunnel shrinks the largest packet that fits. If the tunnel's MTU is set too high, large packets must be fragmented or are dropped, which produces the 'small requests work, big uploads hang' symptom from the troubleshooting lesson. Change LINK_MTU to 1420 (a tunnel inside a tunnel) and see how much room is left.",
        ar: "التغليف ليس مجانياً: كل نفق يصغّر أكبر حزمة يمكن أن تمر. وإذا ضُبطت MTU للنفق أعلى مما ينبغي فيجب تجزئة الحزم الكبيرة أو تُسقط، وهذا يُنتج عَرَض 'الطلبات الصغيرة تعمل وعمليات الرفع الكبيرة تعلق' من درس التشخيص. غيّر LINK_MTU إلى 1420 (نفق داخل نفق) وانظر كم يبقى من المساحة.",
      },
    },
    {
      type: "text",
      body: {
        en: `## Firewalls: stateless and stateful

A **firewall** applies a policy to traffic between zones. The rules match on fields of each packet: interface and direction, protocol, source and destination address, and port. Two principles apply everywhere:

- **First match wins.** Rules are read top to bottom and the first rule that matches decides. A broad \`allow\` above a specific \`deny\` silently disables the deny.
- **Default deny.** Anything that no rule allows is dropped. You list what is needed (an *allowlist*) instead of trying to list everything bad.

A **stateless** packet filter (a router's access control list, for example) judges every packet alone. That makes return traffic awkward: to let replies from web servers back in, you must allow inbound packets *from* port 443 to high ports, and an attacker can send packets that look exactly like such replies.

A **stateful** firewall keeps a **connection tracking table**. When an inside host opens a connection that the policy allows, the firewall records its 5-tuple; packets of that connection in either direction are then **ESTABLISHED** and pass, related ICMP errors are **RELATED** and pass, and an unsolicited packet from outside matches nothing and is dropped. A minimal Linux host policy in **nftables**:

\`\`\`text
table inet filter {
  chain input {
    type filter hook input priority 0; policy drop;
    ct state established,related accept
    iif "lo" accept
    ip saddr 192.168.1.0/24 tcp dport 22 accept
    tcp dport { 80, 443 } accept
    icmp type echo-request limit rate 5/second accept
  }
}
\`\`\`

Read it as: drop by default; accept replies to connections this host started; accept loopback; SSH only from the local subnet; web for everyone; a rate-limited ping. Beyond packet filters there are **application-level** controls (proxies, web application firewalls, "next-generation" firewalls) that look inside the traffic. Remember **egress** too: limiting what inside machines may send out makes it much harder for malware to call home.`,
        ar: `## الجدران النارية: عديمة الحالة وذات الحالة

يطبّق **الجدار الناري** سياسة على الحركة بين المناطق. وتطابق القواعد حقول كل حزمة: الواجهة والاتجاه، والبروتوكول، وعنوان المصدر والوجهة، والمنفذ. ومبدآن يسريان في كل مكان:

- **أول تطابق يفوز.** تُقرأ القواعد من الأعلى إلى الأسفل، وأول قاعدة تطابق هي التي تقرّر. والقاعدة الواسعة \`allow\` فوق قاعدة محددة \`deny\` تعطّل الثانية بصمت.
- **الرفض افتراضياً (default deny).** كل ما لا تسمح به قاعدة يُسقط. فأنت تسرد ما تحتاجه (*قائمة سماح*) بدلاً من محاولة سرد كل ما هو سيئ.

**مرشّح الحزم عديم الحالة** (مثل قائمة التحكم في الوصول في الراوتر) يحكم على كل حزمة وحدها. وهذا يجعل حركة العودة مربكة: فلتسمح بعودة الردود من خوادم الويب يجب أن تسمح بالحزم الواردة *من* المنفذ 443 إلى المنافذ العالية، ويستطيع المهاجم أن يرسل حزماً تشبه تلك الردود تماماً.

أما **الجدار الناري ذو الحالة** فيحتفظ بـ **جدول تتبع الاتصالات (connection tracking)**. فحين يفتح جهاز داخلي اتصالاً تسمح به السياسة، يسجّل الجدار الناري الـ 5-tuple الخاص به؛ فتصبح حزم ذلك الاتصال في الاتجاهين **ESTABLISHED** وتمر، وتصبح رسائل خطأ ICMP المرتبطة به **RELATED** وتمر، أما الحزمة غير المطلوبة الآتية من الخارج فلا تطابق شيئاً وتُسقط. وهذه سياسة دنيا لجهاز Linux بـ **nftables**:

\`\`\`text
table inet filter {
  chain input {
    type filter hook input priority 0; policy drop;
    ct state established,related accept
    iif "lo" accept
    ip saddr 192.168.1.0/24 tcp dport 22 accept
    tcp dport { 80, 443 } accept
    icmp type echo-request limit rate 5/second accept
  }
}
\`\`\`

اقرأها هكذا: أسقِط افتراضياً؛ واقبل الردود على الاتصالات التي بدأها هذا الجهاز؛ واقبل واجهة الاسترجاع؛ وSSH من الشبكة الفرعية المحلية فقط؛ والويب للجميع؛ وping بمعدل محدود. وأبعد من مرشّحات الحزم توجد ضوابط على **مستوى التطبيق** (الوسطاء، وجدران حماية تطبيقات الويب، والجدران النارية "من الجيل التالي") تنظر داخل الحركة. وتذكّر **الحركة الصادرة (egress)** أيضاً: فتقييد ما تستطيع الأجهزة الداخلية إرساله إلى الخارج يجعل اتصال البرمجيات الخبيثة بمشغّليها أصعب بكثير.`,
      },
    },
    {
      type: "lab",
      id: "acl-first-match",
      lang: "python",
      prompt: {
        en: `Write a **stateless packet filter** with first-match rules and a default deny.

**Input:** rule lines, then a line \`---\`, then packet lines.

- Rule: \`<allow|deny> <proto|any> <source-cidr|any> <destination-cidr|any> <port|low-high|any>\`. Rules are numbered from 1 in input order.
- Packet: \`<proto> <source-ip> <destination-ip> <destination-port>\`. ICMP packets have no port and show \`-\`; only a rule port of \`any\` matches \`-\`.

A rule matches when the protocol is equal (or the rule says \`any\`), both addresses are inside the rule's blocks (or \`any\`), and the port is equal to the rule's port, inside its inclusive range, or the rule says \`any\`.

**Output**, one line per packet: \`<packet as given>: ALLOW (rule <n>)\` or \`DENY (rule <n>)\` for the **first** matching rule, or \`DENY (default)\` if no rule matches.

**Example**

\`\`\`text
Input:
allow tcp any 203.0.113.10/32 80-443
allow tcp 198.51.100.0/24 203.0.113.10/32 22
---
tcp 192.0.2.7 203.0.113.10 443
tcp 192.0.2.7 203.0.113.10 22
tcp 198.51.100.40 203.0.113.10 22

Output:
tcp 192.0.2.7 203.0.113.10 443: ALLOW (rule 1)
tcp 192.0.2.7 203.0.113.10 22: DENY (default)
tcp 198.51.100.40 203.0.113.10 22: ALLOW (rule 2)
\`\`\``,
        ar: `اكتب **مرشّح حزم عديم الحالة** بقواعد أول تطابق ورفض افتراضي.

**الإدخال:** أسطر القواعد، ثم سطر \`---\`، ثم أسطر الحزم.

- القاعدة: \`<allow|deny> <proto|any> <source-cidr|any> <destination-cidr|any> <port|low-high|any>\`. وتُرقَّم القواعد من 1 بترتيب الإدخال.
- الحزمة: \`<proto> <source-ip> <destination-ip> <destination-port>\`. وحزم ICMP لا منفذ لها وتُظهر \`-\`؛ ولا يطابق \`-\` إلا منفذ القاعدة \`any\`.

تطابق القاعدةُ الحزمةَ حين يتساوى البروتوكول (أو تقول القاعدة \`any\`)، ويكون العنوانان داخل كتلتي القاعدة (أو \`any\`)، ويساوي المنفذ منفذ القاعدة، أو يقع داخل مداها الشامل لطرفيه، أو تقول القاعدة \`any\`.

**الإخراج**، سطر لكل حزمة: \`<الحزمة كما وردت>: ALLOW (rule <n>)\` أو \`DENY (rule <n>)\` بحسب **أول** قاعدة مطابقة، أو \`DENY (default)\` إذا لم تطابق أي قاعدة.

**مثال**

\`\`\`text
الإدخال:
allow tcp any 203.0.113.10/32 80-443
allow tcp 198.51.100.0/24 203.0.113.10/32 22
---
tcp 192.0.2.7 203.0.113.10 443
tcp 192.0.2.7 203.0.113.10 22
tcp 198.51.100.40 203.0.113.10 22

الإخراج:
tcp 192.0.2.7 203.0.113.10 443: ALLOW (rule 1)
tcp 192.0.2.7 203.0.113.10 22: DENY (default)
tcp 198.51.100.40 203.0.113.10 22: ALLOW (rule 2)
\`\`\``,
      },
      starterCode: String.raw`import sys


def ip_to_int(text):
    a, b, c, d = (int(x) for x in text.split("."))
    return (a << 24) | (b << 16) | (c << 8) | d


def in_net(ip, cidr):
    """True if the address is inside the CIDR block ("any" matches everything)."""
    if cidr == "any":
        return True
    # TODO: compare the network bits: build the mask from the prefix length
    return ip == cidr.split("/")[0]


def port_matches(port, rule):
    # TODO: "any" matches everything, "-" (ICMP) matches only "any", and "low-high" is an inclusive range
    return rule == "any" or port == rule


lines = [l.split() for l in sys.stdin.read().splitlines() if l.strip()]
split = next((i for i, l in enumerate(lines) if l == ["---"]), len(lines))
rules, packets = lines[:split], lines[split + 1:]

for proto, src, dst, port in packets:
    verdict = "DENY (default)"           # default deny: anything not allowed is dropped
    for number, (action, r_proto, r_src, r_dst, r_port) in enumerate(rules, start=1):
        if (r_proto in ("any", proto) and in_net(src, r_src) and in_net(dst, r_dst)
                and port_matches(port, r_port)):
            verdict = action.upper() + " (rule " + str(number) + ")"
            # TODO: the first matching rule decides
    print(" ".join([proto, src, dst, port]) + ": " + verdict)
`,
      solution: String.raw`import sys


def ip_to_int(text):
    a, b, c, d = (int(x) for x in text.split("."))
    return (a << 24) | (b << 16) | (c << 8) | d


def in_net(ip, cidr):
    """True if the address is inside the CIDR block ("any" matches everything)."""
    if cidr == "any":
        return True
    base, prefix = cidr.split("/")
    mask = (0xFFFFFFFF << (32 - int(prefix))) & 0xFFFFFFFF
    return ip_to_int(ip) & mask == ip_to_int(base) & mask


def port_matches(port, rule):
    if rule == "any":
        return True
    if port == "-":                      # ICMP has no port: only "any" matches it
        return False
    low, _, high = rule.partition("-")
    return int(low) <= int(port) <= int(high or low)


lines = [l.split() for l in sys.stdin.read().splitlines() if l.strip()]
split = next((i for i, l in enumerate(lines) if l == ["---"]), len(lines))
rules, packets = lines[:split], lines[split + 1:]

for proto, src, dst, port in packets:
    verdict = "DENY (default)"           # default deny: anything not allowed is dropped
    for number, (action, r_proto, r_src, r_dst, r_port) in enumerate(rules, start=1):
        if (r_proto in ("any", proto) and in_net(src, r_src) and in_net(dst, r_dst)
                and port_matches(port, r_port)):
            verdict = action.upper() + " (rule " + str(number) + ")"
            break                        # first match wins
    print(" ".join([proto, src, dst, port]) + ": " + verdict)
`,
      hints: [
        { en: "Inside a block: `mask = (0xFFFFFFFF << (32 - prefix)) & 0xFFFFFFFF`, then compare `ip_to_int(ip) & mask` with `ip_to_int(base) & mask`. A `/0` mask is 0, so it matches every address.", ar: "داخل الكتلة: `mask = (0xFFFFFFFF << (32 - prefix)) & 0xFFFFFFFF`، ثم قارن `ip_to_int(ip) & mask` بـ `ip_to_int(base) & mask`. وقناع `/0` يساوي 0، فيطابق كل عنوان." },
        { en: "Ports: `low, _, high = rule.partition(\"-\")` gives `high == \"\"` for a single port, so compare with `int(high or low)`. Return `False` for `-` unless the rule is `any`.", ar: "المنافذ: `low, _, high = rule.partition(\"-\")` تعطي `high == \"\"` للمنفذ المفرد، فقارن بـ `int(high or low)`. وأعد `False` لـ `-` ما لم تكن القاعدة `any`." },
        { en: "Without a `break`, a later matching rule overwrites the verdict: that is \"last match wins\". Stop at the first match.", ar: "من دون `break` تكتب قاعدة مطابقة لاحقة فوق الحكم: وهذا \"آخر تطابق يفوز\". توقّف عند أول تطابق." },
      ],
      tests: [
        {
          name: { en: "The worked example, plus a deny rule that comes too late", ar: "المثال المحلول، مع قاعدة رفض تأتي متأخرة" },
          stdin: "allow tcp any 203.0.113.10/32 80-443\nallow tcp 198.51.100.0/24 203.0.113.10/32 22\ndeny any 192.0.2.66/32 any any\nallow icmp any 203.0.113.0/24 any\n---\ntcp 192.0.2.7 203.0.113.10 443\ntcp 192.0.2.7 203.0.113.10 22\ntcp 198.51.100.40 203.0.113.10 22\ntcp 192.0.2.66 203.0.113.10 80\nudp 192.0.2.66 203.0.113.10 53\nicmp 192.0.2.7 203.0.113.99 -\n",
          expected: "tcp 192.0.2.7 203.0.113.10 443: ALLOW (rule 1)\ntcp 192.0.2.7 203.0.113.10 22: DENY (default)\ntcp 198.51.100.40 203.0.113.10 22: ALLOW (rule 2)\ntcp 192.0.2.66 203.0.113.10 80: ALLOW (rule 1)\nudp 192.0.2.66 203.0.113.10 53: DENY (rule 3)\nicmp 192.0.2.7 203.0.113.99 -: ALLOW (rule 4)\n",
        },
        {
          name: { en: "First match wins: a specific deny before a broad allow", ar: "أول تطابق يفوز: رفض محدد قبل سماح واسع" },
          stdin: "deny tcp 10.0.0.0/8 any 23\nallow tcp 10.0.0.0/8 any any\nallow tcp 10.1.0.0/16 any 23\n---\ntcp 10.1.2.3 192.0.2.1 23\ntcp 10.1.2.3 192.0.2.1 24\ntcp 11.0.0.1 192.0.2.1 80\n",
          expected: "tcp 10.1.2.3 192.0.2.1 23: DENY (rule 1)\ntcp 10.1.2.3 192.0.2.1 24: ALLOW (rule 2)\ntcp 11.0.0.1 192.0.2.1 80: DENY (default)\n",
        },
        {
          name: { en: "Protocols differ, ranges include both ends, ICMP needs port any", ar: "البروتوكولات تختلف، والمدى يشمل طرفيه، وICMP يحتاج منفذ any" },
          stdin: "allow udp any 192.0.2.53/32 53\nallow tcp any any 1024-65535\n---\nudp 203.0.113.5 192.0.2.53 53\ntcp 203.0.113.5 192.0.2.53 53\ntcp 203.0.113.5 192.0.2.80 1023\ntcp 203.0.113.5 192.0.2.80 1024\ntcp 203.0.113.5 192.0.2.80 65535\nicmp 203.0.113.5 192.0.2.80 -\n",
          expected: "udp 203.0.113.5 192.0.2.53 53: ALLOW (rule 1)\ntcp 203.0.113.5 192.0.2.53 53: DENY (default)\ntcp 203.0.113.5 192.0.2.80 1023: DENY (default)\ntcp 203.0.113.5 192.0.2.80 1024: ALLOW (rule 2)\ntcp 203.0.113.5 192.0.2.80 65535: ALLOW (rule 2)\nicmp 203.0.113.5 192.0.2.80 -: DENY (default)\n",
        },
        {
          name: { en: "The edge of a /25 source block", ar: "حافة كتلة مصدر /25" },
          stdin: "allow any 192.168.1.0/25 any any\n---\nudp 192.168.1.127 198.51.100.53 53\nudp 192.168.1.128 192.0.2.1 53\nicmp 192.168.1.1 192.0.2.1 -\n",
          expected: "udp 192.168.1.127 198.51.100.53 53: ALLOW (rule 1)\nudp 192.168.1.128 192.0.2.1 53: DENY (default)\nicmp 192.168.1.1 192.0.2.1 -: ALLOW (rule 1)\n",
        },
        {
          name: { en: "No rules: everything is denied by default", ar: "لا قواعد: كل شيء مرفوض افتراضياً" },
          stdin: "---\ntcp 192.0.2.1 192.0.2.2 80\nicmp 192.0.2.1 192.0.2.2 -\n",
          expected: "tcp 192.0.2.1 192.0.2.2 80: DENY (default)\nicmp 192.0.2.1 192.0.2.2 -: DENY (default)\n",
        },
      ],
      sampleInput: "allow tcp any 203.0.113.10/32 80-443\nallow tcp 198.51.100.0/24 203.0.113.10/32 22\n---\ntcp 192.0.2.7 203.0.113.10 443\ntcp 192.0.2.7 203.0.113.10 22\ntcp 198.51.100.40 203.0.113.10 22\n",
    },
    {
      type: "text",
      body: {
        en: `## NAT, DMZs and segmentation

**NAT.** Your home has many devices with **private addresses** (RFC 1918: \`10.0.0.0/8\`, \`172.16.0.0/12\`, \`192.168.0.0/16\`), which are not routed on the Internet, and one **public address** from your ISP. The router performs **NAPT** (network address and port translation, called "traditional NAT" in RFC 3022, and often "PAT" or "masquerading"): it rewrites the source of every outgoing packet to its public address and a public port, and remembers the mapping:

\`\`\`text
inside                      NAT table                          outside
192.168.1.10:51514  ->  198.51.100.1:40000  ->  203.0.113.80:443
192.168.1.11:51514  ->  198.51.100.1:40001  ->  203.0.113.80:443
replies to 198.51.100.1:40001 are sent back to 192.168.1.11:51514
\`\`\`

Two inside hosts may use the same source port; the public ports keep them apart. A packet from outside that matches no mapping has nowhere to go and is dropped, which is why NAT *looks* like a firewall. It is not a security policy, though: use a real stateful firewall as well. To run a server behind NAT you add a **port forward** (destination NAT), for example public port 8443 to \`192.168.1.50:443\`, which opens that service to the whole Internet. Many ISPs now put customers behind a second layer, **carrier-grade NAT**, using the shared range \`100.64.0.0/10\` (RFC 6598). IPv6 has enough addresses for every device, so it does not need NAT, but it still needs a firewall.

**DMZ.** Servers that the Internet must reach (web, mail, VPN gateway) should not sit next to employees' laptops and the database. A **DMZ** (screened subnet) is a separate zone between the Internet and the internal network:

\`\`\`text
Internet --- [ firewall ] --- DMZ: web server, mail relay
                  |
                  +---------- internal: staff, database
rules:  Internet -> DMZ        only 80/443 (and 25 to the mail relay)
        DMZ -> internal        only the web server to the database port
        internal -> Internet   allowed, through a proxy
        Internet -> internal   nothing
\`\`\`

If the web server is compromised, the attacker is still in the lobby: the firewall stops them from reaching the rest. **Segmentation** applies the same idea everywhere: separate zones (VLANs and subnets) for guests, IoT devices, staff, servers and management, with firewall rules that allow only the flows each zone really needs. The next lesson builds on this with the principles of least privilege and defence in depth.`,
        ar: `## NAT والمنطقة منزوعة السلاح والتجزئة

**NAT.** في بيتك أجهزة كثيرة لها **عناوين خاصة** (RFC 1918: \`10.0.0.0/8\` و\`172.16.0.0/12\` و\`192.168.0.0/16\`)، وهذه لا تُوجَّه على الإنترنت، وعنوان **عام** واحد من مزوّد الخدمة. ويجري الراوتر **NAPT** (ترجمة عناوين الشبكة والمنافذ، ويسميه RFC 3022 "NAT التقليدي"، وكثيراً ما يُسمى "PAT" أو "التنكّر / masquerading"): يعيد كتابة مصدر كل حزمة صادرة إلى عنوانه العام ومنفذ عام، ويتذكر هذا الربط:

\`\`\`text
الداخل                      جدول NAT                           الخارج
192.168.1.10:51514  ->  198.51.100.1:40000  ->  203.0.113.80:443
192.168.1.11:51514  ->  198.51.100.1:40001  ->  203.0.113.80:443
الردود إلى 198.51.100.1:40001 تُعاد إلى 192.168.1.11:51514
\`\`\`

قد يستخدم جهازان داخليان منفذ المصدر نفسه؛ والمنافذ العامة تفصل بينهما. والحزمة الآتية من الخارج التي لا تطابق أي ربط لا مكان تذهب إليه فتُسقط، ولهذا *يبدو* NAT كأنه جدار ناري. لكنه ليس سياسة أمنية: فاستخدم معه جداراً نارياً حقيقياً ذا حالة. ولتشغيل خادم خلف NAT تضيف **إعادة توجيه منفذ (port forward)** (أي NAT للوجهة)، مثل المنفذ العام 8443 إلى \`192.168.1.50:443\`، وهذا يفتح تلك الخدمة للإنترنت كله. وكثير من مزوّدي الخدمة يضعون العملاء الآن خلف طبقة ثانية، **NAT على مستوى المشغّل (carrier-grade NAT)**، مستخدمين النطاق المشترك \`100.64.0.0/10\` (RFC 6598). أما IPv6 ففيه عناوين تكفي كل جهاز، فلا يحتاج إلى NAT، لكنه ما زال يحتاج إلى جدار ناري.

**المنطقة منزوعة السلاح (DMZ).** الخوادم التي يجب أن يصل إليها الإنترنت (الويب، والبريد، وبوابة VPN) لا ينبغي أن تجلس بجوار حواسيب الموظفين وقاعدة البيانات. و**المنطقة منزوعة السلاح** (الشبكة الفرعية المحجوبة / screened subnet) منطقة منفصلة بين الإنترنت والشبكة الداخلية:

\`\`\`text
Internet --- [ firewall ] --- DMZ: web server, mail relay
                  |
                  +---------- internal: staff, database
القواعد:  Internet -> DMZ        المنفذان 80/443 فقط (و25 إلى مرحّل البريد)
          DMZ -> internal        خادم الويب وحده إلى منفذ قاعدة البيانات
          internal -> Internet   مسموح، عبر وسيط (proxy)
          Internet -> internal   لا شيء
\`\`\`

فإذا اختُرق خادم الويب يبقى المهاجم في البهو: يمنعه الجدار الناري من الوصول إلى البقية. و**التجزئة (segmentation)** تطبّق الفكرة نفسها في كل مكان: مناطق منفصلة (VLANs وشبكات فرعية) للضيوف وأجهزة إنترنت الأشياء والموظفين والخوادم والإدارة، بقواعد جدار ناري لا تسمح إلا بالتدفقات التي تحتاجها كل منطقة فعلاً. والدرس التالي يبني على هذا بمبدأي أقل صلاحية والدفاع في العمق.`,
      },
    },
    {
      type: "lab",
      id: "napt",
      lang: "javascript",
      prompt: {
        en: `Build the **translation table of a NAT router** (NAPT) that also filters unsolicited inbound traffic.

**Input:** the first line is \`public <public-ip> ports <first-port>\`. Every following line is an event:

- \`out <proto> <inside-ip:port> <remote-ip:port>\`: an inside host sends a packet out.
- \`in <proto> <remote-ip:port> <public-ip:port>\`: a packet arrives from outside.
- \`forward <proto> <public-port> <inside-ip:port>\`: add a static port forward.

**Rules**

- \`out\`: if a mapping already exists for (proto, inside endpoint), reuse its public port, whatever the remote is; otherwise hand out the next public port, starting at \`<first-port>\` and counting up by 1 (one counter for all protocols). Remember that this mapping has contacted \`<remote-ip:port>\`. Result: \`as <public-ip>:<public-port>\`.
- \`in\`: find the mapping or forward for (proto, public port). If the address is not the public address or nothing is found: \`drop (no mapping)\`. A dynamic mapping only accepts packets from remotes it has contacted: otherwise \`drop (not contacted)\`. A port forward accepts every remote. Result: \`to <inside-ip:port>\`.
- \`forward\`: result \`ok\`.

**Output**, one line per event: \`<the event line>: <result>\`.

**Example**

\`\`\`text
Input:
public 198.51.100.1 ports 40000
out tcp 192.168.1.10:51514 203.0.113.80:443
in tcp 203.0.113.80:443 198.51.100.1:40000
out tcp 192.168.1.11:51514 203.0.113.80:443
in tcp 203.0.113.80:443 198.51.100.1:40002

Output:
out tcp 192.168.1.10:51514 203.0.113.80:443: as 198.51.100.1:40000
in tcp 203.0.113.80:443 198.51.100.1:40000: to 192.168.1.10:51514
out tcp 192.168.1.11:51514 203.0.113.80:443: as 198.51.100.1:40001
in tcp 203.0.113.80:443 198.51.100.1:40002: drop (no mapping)
\`\`\``,
        ar: `ابنِ **جدول الترجمة في راوتر NAT** (أي NAPT) يرشّح أيضاً الحركة الواردة غير المطلوبة.

**الإدخال:** السطر الأول هو \`public <public-ip> ports <first-port>\`. وكل سطر بعده حدث:

- \`out <proto> <inside-ip:port> <remote-ip:port>\`: جهاز داخلي يرسل حزمة إلى الخارج.
- \`in <proto> <remote-ip:port> <public-ip:port>\`: تصل حزمة من الخارج.
- \`forward <proto> <public-port> <inside-ip:port>\`: أضف إعادة توجيه منفذ ثابتة.

**القواعد**

- \`out\`: إذا وُجد ربط سابق لـ (البروتوكول، الطرف الداخلي) فأعد استخدام منفذه العام أياً كان الطرف البعيد؛ وإلا فأعطِ المنفذ العام التالي، بدءاً من \`<first-port>\` وزيادةً بـ 1 (عدّاد واحد لكل البروتوكولات). وتذكّر أن هذا الربط قد تواصل مع \`<remote-ip:port>\`. والنتيجة: \`as <public-ip>:<public-port>\`.
- \`in\`: ابحث عن الربط أو إعادة التوجيه لـ (البروتوكول، المنفذ العام). إذا لم يكن العنوان هو العنوان العام أو لم يوجد شيء فالنتيجة \`drop (no mapping)\`. والربط الديناميكي لا يقبل الحزم إلا من الأطراف البعيدة التي تواصل معها: وإلا \`drop (not contacted)\`. وإعادة توجيه المنفذ تقبل كل طرف بعيد. والنتيجة: \`to <inside-ip:port>\`.
- \`forward\`: النتيجة \`ok\`.

**الإخراج**، سطر لكل حدث: \`<سطر الحدث>: <النتيجة>\`.

**مثال**

\`\`\`text
الإدخال:
public 198.51.100.1 ports 40000
out tcp 192.168.1.10:51514 203.0.113.80:443
in tcp 203.0.113.80:443 198.51.100.1:40000
out tcp 192.168.1.11:51514 203.0.113.80:443
in tcp 203.0.113.80:443 198.51.100.1:40002

الإخراج:
out tcp 192.168.1.10:51514 203.0.113.80:443: as 198.51.100.1:40000
in tcp 203.0.113.80:443 198.51.100.1:40000: to 192.168.1.10:51514
out tcp 192.168.1.11:51514 203.0.113.80:443: as 198.51.100.1:40001
in tcp 203.0.113.80:443 198.51.100.1:40002: drop (no mapping)
\`\`\``,
      },
      starterCode: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n").map((l) => l.trim()).filter((l) => l !== "");

if (lines.length > 0) {
  // public <ip> ports <first port to hand out>
  const [, publicIp, , firstPort] = lines[0].split(/\s+/);
  let nextPort = Number(firstPort);
  const byInside = new Map();   // "proto inside-ip:port" -> mapping
  const byPublic = new Map();   // "proto public-port"    -> mapping or port forward

  for (const line of lines.slice(1)) {
    const [kind, proto, a, b] = line.split(/\s+/);
    if (kind === "forward") {
      // TODO: store a port forward in byPublic under "proto public-port"
      console.log(line + ": ok");
    } else if (kind === "out") {
      // TODO: reuse an existing mapping for the same inside endpoint, and remember the remote it contacted
      const m = { inside: a, port: nextPort++, contacted: new Set([b]) };
      byInside.set(proto + " " + a, m);
      byPublic.set(proto + " " + m.port, m);
      console.log(line + ": as " + publicIp + ":" + m.port);
    } else if (kind === "in") {
      // TODO: check the public address, then "not contacted" for dynamic mappings
      const port = b.slice(b.lastIndexOf(":") + 1);
      const m = byPublic.get(proto + " " + port);
      console.log(line + ": " + (m ? "to " + m.inside : "drop (no mapping)"));
    }
  }
}
`,
      solution: String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n").map((l) => l.trim()).filter((l) => l !== "");

if (lines.length > 0) {
  // public <ip> ports <first port to hand out>
  const [, publicIp, , firstPort] = lines[0].split(/\s+/);
  let nextPort = Number(firstPort);
  const byInside = new Map();   // "proto inside-ip:port" -> mapping
  const byPublic = new Map();   // "proto public-port"    -> mapping or port forward

  for (const line of lines.slice(1)) {
    const [kind, proto, a, b] = line.split(/\s+/);
    if (kind === "forward") {
      // forward <proto> <public-port> <inside-ip>:<port>: a static rule, open to every remote host
      byPublic.set(proto + " " + a, { inside: b, forward: true });
      console.log(line + ": ok");
    } else if (kind === "out") {
      // out <proto> <inside-ip>:<port> <remote-ip>:<port>
      let m = byInside.get(proto + " " + a);
      if (!m) {
        m = { inside: a, port: nextPort++, contacted: new Set() };
        byInside.set(proto + " " + a, m);
        byPublic.set(proto + " " + m.port, m);
      }
      m.contacted.add(b); // replies are accepted only from endpoints this mapping has talked to
      console.log(line + ": as " + publicIp + ":" + m.port);
    } else if (kind === "in") {
      // in <proto> <remote-ip>:<port> <public-ip>:<port>
      const cut = b.lastIndexOf(":");
      const m = b.slice(0, cut) === publicIp ? byPublic.get(proto + " " + b.slice(cut + 1)) : undefined;
      if (!m) console.log(line + ": drop (no mapping)");
      else if (!m.forward && !m.contacted.has(a)) console.log(line + ": drop (not contacted)");
      else console.log(line + ": to " + m.inside);
    }
  }
}
`,
      hints: [
        { en: "Key both maps with the protocol included (`proto + \" \" + endpoint`), so TCP and UDP on the same port never mix. A forward is stored in `byPublic` as `{ inside, forward: true }`.", ar: "اجعل مفتاح الخريطتين يتضمن البروتوكول (`proto + \" \" + endpoint`)، حتى لا يختلط TCP وUDP على المنفذ نفسه أبداً. وتُخزَّن إعادة التوجيه في `byPublic` على شكل `{ inside, forward: true }`." },
        { en: "For `out`, look the inside endpoint up first; only create a mapping (and advance `nextPort`) when none exists. Either way, add the remote to `m.contacted`.", ar: "في `out` ابحث عن الطرف الداخلي أولاً؛ ولا تنشئ ربطاً (ولا تزِد `nextPort`) إلا إذا لم يوجد. وفي الحالتين أضف الطرف البعيد إلى `m.contacted`." },
        { en: "For `in`, split the destination at its last `:`. Wrong address or no entry is `no mapping`; a dynamic entry (`!m.forward`) whose `contacted` set lacks the remote is `not contacted`.", ar: "في `in` قسّم الوجهة عند آخر `:`. والعنوان الخاطئ أو غياب المُدخل يعني `no mapping`؛ والمُدخل الديناميكي (`!m.forward`) الذي لا تحتوي مجموعته `contacted` الطرف البعيد يعني `not contacted`." },
      ],
      tests: [
        {
          name: { en: "The worked example, then the reply for the second host", ar: "المثال المحلول، ثم الرد على الجهاز الثاني" },
          stdin: "public 198.51.100.1 ports 40000\nout tcp 192.168.1.10:51514 203.0.113.80:443\nin tcp 203.0.113.80:443 198.51.100.1:40000\nout tcp 192.168.1.11:51514 203.0.113.80:443\nin tcp 203.0.113.80:443 198.51.100.1:40001\nin tcp 203.0.113.80:443 198.51.100.1:40002\n",
          expected: "out tcp 192.168.1.10:51514 203.0.113.80:443: as 198.51.100.1:40000\nin tcp 203.0.113.80:443 198.51.100.1:40000: to 192.168.1.10:51514\nout tcp 192.168.1.11:51514 203.0.113.80:443: as 198.51.100.1:40001\nin tcp 203.0.113.80:443 198.51.100.1:40001: to 192.168.1.11:51514\nin tcp 203.0.113.80:443 198.51.100.1:40002: drop (no mapping)\n",
        },
        {
          name: { en: "One mapping for two remotes; a stranger is filtered", ar: "ربط واحد لطرفين بعيدين؛ والغريب يُرشَّح" },
          stdin: "public 198.51.100.1 ports 50000\nout udp 192.168.1.20:5060 203.0.113.5:3478\nout udp 192.168.1.20:5060 203.0.113.9:5060\nin udp 203.0.113.9:5060 198.51.100.1:50000\nin udp 203.0.113.66:5060 198.51.100.1:50000\nin udp 203.0.113.5:3478 198.51.100.1:50000\nin tcp 203.0.113.5:3478 198.51.100.1:50000\n",
          expected: "out udp 192.168.1.20:5060 203.0.113.5:3478: as 198.51.100.1:50000\nout udp 192.168.1.20:5060 203.0.113.9:5060: as 198.51.100.1:50000\nin udp 203.0.113.9:5060 198.51.100.1:50000: to 192.168.1.20:5060\nin udp 203.0.113.66:5060 198.51.100.1:50000: drop (not contacted)\nin udp 203.0.113.5:3478 198.51.100.1:50000: to 192.168.1.20:5060\nin tcp 203.0.113.5:3478 198.51.100.1:50000: drop (no mapping)\n",
        },
        {
          name: { en: "TCP and UDP from the same inside port get separate mappings", ar: "TCP وUDP من المنفذ الداخلي نفسه يحصلان على ربطين منفصلين" },
          stdin: "public 198.51.100.1 ports 40000\nout tcp 192.168.1.10:40000 203.0.113.80:443\nout udp 192.168.1.10:40000 203.0.113.53:53\nin udp 203.0.113.53:53 198.51.100.1:40001\nin udp 203.0.113.53:53 198.51.100.1:40000\nin tcp 203.0.113.80:443 198.51.100.1:40000\n",
          expected: "out tcp 192.168.1.10:40000 203.0.113.80:443: as 198.51.100.1:40000\nout udp 192.168.1.10:40000 203.0.113.53:53: as 198.51.100.1:40001\nin udp 203.0.113.53:53 198.51.100.1:40001: to 192.168.1.10:40000\nin udp 203.0.113.53:53 198.51.100.1:40000: drop (no mapping)\nin tcp 203.0.113.80:443 198.51.100.1:40000: to 192.168.1.10:40000\n",
        },
        {
          name: { en: "A port forward is open to everyone; other ports and addresses are not", ar: "إعادة توجيه المنفذ مفتوحة للجميع؛ أما المنافذ والعناوين الأخرى فلا" },
          stdin: "public 198.51.100.1 ports 40000\nforward tcp 8443 192.168.1.50:443\nin tcp 203.0.113.7:51000 198.51.100.1:8443\nin tcp 192.0.2.99:60000 198.51.100.1:8443\nin tcp 203.0.113.7:51000 198.51.100.1:22\nin tcp 203.0.113.7:51000 198.51.100.2:8443\n",
          expected: "forward tcp 8443 192.168.1.50:443: ok\nin tcp 203.0.113.7:51000 198.51.100.1:8443: to 192.168.1.50:443\nin tcp 192.0.2.99:60000 198.51.100.1:8443: to 192.168.1.50:443\nin tcp 203.0.113.7:51000 198.51.100.1:22: drop (no mapping)\nin tcp 203.0.113.7:51000 198.51.100.2:8443: drop (no mapping)\n",
        },
        {
          name: { en: "No events: nothing is printed", ar: "لا أحداث: لا يُطبع شيء" },
          stdin: "public 198.51.100.1 ports 40000\n",
          expected: "",
        },
      ],
      sampleInput: "public 198.51.100.1 ports 40000\nout tcp 192.168.1.10:51514 203.0.113.80:443\nin tcp 203.0.113.80:443 198.51.100.1:40000\nout tcp 192.168.1.11:51514 203.0.113.80:443\nin tcp 203.0.113.80:443 198.51.100.1:40002\n",
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Why is WPA3-Personal better than WPA2-Personal against password guessing?", ar: "لماذا يتفوق WPA3-Personal على WPA2-Personal في مقاومة تخمين كلمة المرور؟" },
          choices: [
            { en: "WPA3 requires passwords of at least 20 characters", ar: "يشترط WPA3 كلمات مرور من 20 حرفاً على الأقل" },
            { en: "WPA3 hides the network name", ar: "يخفي WPA3 اسم الشبكة" },
            { en: "With SAE every guess needs a live exchange with the access point, so a recorded handshake cannot be attacked offline", ar: "مع SAE يحتاج كل تخمين إلى تبادل حي مع نقطة الوصول، فلا يمكن مهاجمة مصافحة مسجّلة دون اتصال" },
            { en: "WPA3 switches off the radio when it detects an attacker", ar: "يطفئ WPA3 الراديو حين يكتشف مهاجماً" },
          ],
          answer: 2,
          explain: {
            en: "In WPA2-Personal, anyone who records the 4-way handshake can test guesses on their own hardware as fast as it allows. WPA3's SAE handshake makes each guess an online attempt the access point can see and limit, and adds forward secrecy. A long passphrase still matters, and hiding the SSID adds no real security.",
            ar: "في WPA2-Personal يستطيع كل من يسجّل المصافحة الرباعية أن يجرّب التخمينات على عتاده بأسرع ما يسمح به. أما مصافحة SAE في WPA3 فتجعل كل تخمين محاولة حية تراها نقطة الوصول وتستطيع تقييدها، وتضيف السرية الأمامية. وما زالت عبارة المرور الطويلة مهمة، وإخفاء SSID لا يضيف أماناً حقيقياً.",
          },
        },
        {
          q: { en: "A firewall's first rule is `allow tcp any any 1-65535` and its second rule is `deny tcp 192.0.2.66/32 any 22`. What happens to SSH from 192.0.2.66?", ar: "القاعدة الأولى في جدار ناري هي `allow tcp any any 1-65535` والثانية `deny tcp 192.0.2.66/32 any 22`. ماذا يحدث لاتصال SSH من 192.0.2.66؟" },
          choices: [
            { en: "It is allowed: the first matching rule decides, so the deny is never reached", ar: "يُسمح به: أول قاعدة مطابقة تقرّر، فلا يُبلغ الرفض أبداً" },
            { en: "It is denied, because deny rules always take priority", ar: "يُرفض، لأن قواعد الرفض لها الأولوية دائماً" },
            { en: "It is denied, because the more specific rule wins", ar: "يُرفض، لأن القاعدة الأكثر تحديداً تفوز" },
            { en: "The firewall refuses to load contradictory rules", ar: "يرفض الجدار الناري تحميل القواعد المتناقضة" },
          ],
          answer: 0,
          explain: {
            en: "Packet filters evaluate rules in order and stop at the first match. The broad allow matches SSH from 192.0.2.66 before the deny is ever checked. Put specific denies above broad allows, and end with a default deny. 'Most specific wins' is how routing tables work, not firewall rule lists.",
            ar: "تقيّم مرشّحات الحزم القواعد بالترتيب وتتوقف عند أول تطابق. فالسماح الواسع يطابق SSH من 192.0.2.66 قبل أن يُفحص الرفض أصلاً. ضع قواعد الرفض المحددة فوق قواعد السماح الواسعة، واختم برفض افتراضي. أما 'الأكثر تحديداً يفوز' فهي طريقة عمل جداول التوجيه، لا قوائم قواعد الجدار الناري.",
          },
        },
        {
          q: { en: "What does a stateful firewall do that a stateless packet filter cannot?", ar: "ماذا يفعل الجدار الناري ذو الحالة مما لا يستطيعه مرشّح الحزم عديم الحالة؟" },
          choices: [
            { en: "Encrypt traffic between two sites", ar: "يشفّر الحركة بين موقعين" },
            { en: "Translate private addresses to public ones", ar: "يترجم العناوين الخاصة إلى عامة" },
            { en: "Block traffic by port number", ar: "يحجب الحركة بحسب رقم المنفذ" },
            { en: "Remember connections, so replies to inside requests pass while unsolicited packets from outside are dropped", ar: "يتذكر الاتصالات، فتمر الردود على طلبات الداخل وتُسقط الحزم غير المطلوبة الآتية من الخارج" },
          ],
          answer: 3,
          explain: {
            en: "Both kinds can filter by address, protocol and port. Only a stateful firewall keeps a connection table, so it can accept ESTABLISHED and RELATED packets and drop anything that does not belong to a known connection. Encryption is a VPN's job and address translation is NAT's, although one device often does all three.",
            ar: "يستطيع النوعان الترشيح بحسب العنوان والبروتوكول والمنفذ. لكن الجدار الناري ذا الحالة وحده يحتفظ بجدول اتصالات، فيقبل حزم ESTABLISHED وRELATED ويُسقط كل ما لا ينتمي إلى اتصال معروف. والتشفير مهمة VPN، وترجمة العناوين مهمة NAT، وإن كان جهاز واحد يؤدي الثلاثة غالباً.",
          },
        },
        {
          q: { en: "A WireGuard peer `office` has AllowedIPs `192.168.50.0/24`, and peer `gateway` has `0.0.0.0/0`. A packet decrypted from `gateway` has the inner source address 192.168.50.9. What does WireGuard do?", ar: "للند `office` قائمة AllowedIPs فيها `192.168.50.0/24`، وللند `gateway` القيمة `0.0.0.0/0`. حزمة فُكّ تشفيرها من `gateway` عنوان مصدرها الداخلي 192.168.50.9. ماذا يفعل WireGuard؟" },
          choices: [
            { en: "Accepts it, because 0.0.0.0/0 contains every address", ar: "يقبلها، لأن 0.0.0.0/0 يحتوي كل عنوان" },
            { en: "Drops it, because that source address maps to office, not to the peer that sent it", ar: "يُسقطها، لأن عنوان المصدر ذاك يعود إلى office لا إلى الند الذي أرسلها" },
            { en: "Forwards it to office", ar: "يمرّرها إلى office" },
            { en: "Closes the tunnel to gateway", ar: "يغلق النفق مع gateway" },
          ],
          answer: 1,
          explain: {
            en: "Cryptokey routing uses one longest-prefix table in both directions. 192.168.50.9 maps to office (/24 beats /0), so a packet claiming that source must come from office. This stops one peer from impersonating addresses that belong to another peer, without any extra firewall rule.",
            ar: "يستخدم توجيه المفاتيح التشفيرية جدولاً واحداً بأطول بادئة في الاتجاهين. فالعنوان 192.168.50.9 يعود إلى office (فـ /24 تتفوق على /0)، فيجب أن تأتي الحزمة التي تدّعي ذلك المصدر من office. وهذا يمنع نداً من انتحال عناوين تخص نداً آخر، دون أي قاعدة جدار ناري إضافية.",
          },
        },
        {
          q: { en: "Where should a company's public web server go, and why?", ar: "أين ينبغي أن يوضع خادم الويب العام للشركة، ولماذا؟" },
          choices: [
            { en: "On the staff network, so employees can reach it quickly", ar: "في شبكة الموظفين، ليصل إليه الموظفون بسرعة" },
            { en: "Directly on the Internet without any firewall, so it is fast", ar: "على الإنترنت مباشرة دون أي جدار ناري، ليكون سريعاً" },
            { en: "In a DMZ, so that if it is compromised the firewall still separates it from the internal network", ar: "في منطقة منزوعة السلاح، حتى إذا اختُرق يبقى الجدار الناري فاصلاً بينه وبين الشبكة الداخلية" },
            { en: "Behind NAT only, because NAT replaces a firewall", ar: "خلف NAT فقط، لأن NAT يغني عن الجدار الناري" },
          ],
          answer: 2,
          explain: {
            en: "Internet-facing servers are the most exposed machines. In a DMZ the firewall lets the Internet reach only their public ports and lets them reach only the specific internal services they need, so a break-in does not hand over the whole network. NAT hides addresses but is not a security policy.",
            ar: "الخوادم المواجهة للإنترنت أكثر الأجهزة تعرّضاً. وفي المنطقة منزوعة السلاح لا يسمح الجدار الناري للإنترنت إلا بالوصول إلى منافذها العامة، ولا يسمح لها إلا بالوصول إلى الخدمات الداخلية المحددة التي تحتاجها، فلا يسلّم الاختراق الشبكة كلها. وNAT يخفي العناوين لكنه ليس سياسة أمنية.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Recap

- **Wi-Fi** (802.11) is a shared radio medium using CSMA/CA; everyone in range receives every frame. Use **WPA3** (SAE, protected management frames) or at least WPA2 with a long passphrase, Enterprise mode (802.1X) for organisations, and switch **WPS** off. WEP and TKIP are broken.
- A **VPN** encrypts and encapsulates packets in a tunnel: **IPsec** with IKEv2, **WireGuard** with cryptokey routing, or TLS-based designs. Tunnels add overhead (60 or 80 bytes for WireGuard), so their MTU is smaller.
- **Firewalls**: first match wins, default deny. **Stateless** filters judge packets alone; **stateful** ones track connections and let replies back in.
- **NAT** maps many private addresses onto one public address and port range; it is not a security policy. Put public servers in a **DMZ** and **segment** the rest.

**Practice next:** log in to your own router, check that it uses WPA3 or WPA2 with AES, that WPS is off and that no port forwards are open that you do not need. On a Linux machine you own, read \`sudo nft list ruleset\` and explain each rule. Next lesson: network attacks and the defences against them.`,
        ar: `## الخلاصة

- **Wi-Fi** (802.11) وسط راديوي مشترك يستخدم CSMA/CA؛ وكل من في المدى يستقبل كل إطار. استخدم **WPA3** (SAE وإطارات الإدارة المحمية) أو على الأقل WPA2 بعبارة مرور طويلة، ووضع Enterprise (802.1X) للمؤسسات، وأوقف **WPS**. أما WEP وTKIP فمعطوبان.
- **الشبكة الافتراضية الخاصة** تشفّر الحزم وتغلّفها في نفق: **IPsec** مع IKEv2، أو **WireGuard** مع توجيه المفاتيح التشفيرية، أو تصاميم قائمة على TLS. والأنفاق تضيف حِملاً (60 أو 80 بايتاً في WireGuard)، فتكون MTU فيها أصغر.
- **الجدران النارية**: أول تطابق يفوز، والرفض افتراضياً. المرشّحات **عديمة الحالة** تحكم على الحزم منفردة؛ و**ذات الحالة** تتتبع الاتصالات وتسمح بعودة الردود.
- **NAT** يربط عناوين خاصة كثيرة بعنوان عام واحد ومدى من المنافذ؛ وليس سياسة أمنية. ضع الخوادم العامة في **منطقة منزوعة السلاح** و**جزّئ** البقية.

**تدرّب بعد ذلك:** ادخل إلى راوترك أنت، وتحقق من أنه يستخدم WPA3 أو WPA2 مع AES، وأن WPS متوقف، وأنه لا توجد إعادات توجيه منافذ مفتوحة لا تحتاجها. وعلى جهاز Linux تملكه اقرأ \`sudo nft list ruleset\` واشرح كل قاعدة. والدرس التالي: هجمات الشبكات والدفاعات ضدها.`,
      },
    },
  ],
};
