import type { L10nText } from "../../../../../shared/challenges";

/**
 * SERVER-ONLY hint texts for the systems (tracks: operating-systems, networking, cloud-computing, …) group, keyed by challenge id.
 * Matching public meta: data/challenges/systems.ts, which carries only the per-hint COST
 * (same order, same count; worker/tests/challenges/parity.test.ts enforces it). The text is
 * returned by POST /api/challenges/:id/hint after the cost is charged and must never be
 * imported by the site or copied into shared/ or data/.
 */
export const systemsHints: Record<string, L10nText[]> = {
  "cloud-cost-estimator": [
    {
      en: "Do not multiply the whole usage by one price. Each tier prices only the slice of usage that falls inside it.",
      ar: "لا تضرب الاستهلاك كله بسعر واحد. كل شريحة تُسعِّر فقط الجزء من الاستهلاك الذي يقع داخلها.",
    },
    {
      en: "Walk the tiers in order and remember where the previous one ended (`floor`). The slice is `min(usage, limit) - floor`, and you can stop as soon as `usage <= floor`.",
      ar: "امشِ على الشرائح بالترتيب وتذكّر أين انتهت الشريحة السابقة (`floor`). حجم الجزء هو `min(usage, limit) - floor`، ويمكنك التوقف حالما يصبح `usage <= floor`.",
    },
    {
      en: "Read the limit `inf` as a floating-point infinity (`float('inf')` in Python, `Infinity` in JavaScript), so the last tier needs no special case.",
      ar: "اقرأ الحد `inf` كما هو اللانهاية العشرية (`float('inf')` في Python و`Infinity` في JavaScript)، فلا تحتاج الشريحة الأخيرة إلى معاملة خاصة.",
    },
  ],
  "os-clock-faults": [
    {
      en: "Keep three things: a list of `k` frames (use `None` for an empty one), a parallel list of reference bits, and the hand position. A hit only sets the page's bit to 1; the hand does not move.",
      ar: "احتفظ بثلاثة أشياء: قائمة من `k` إطاراً (استخدم `None` للإطار الفارغ)، وقائمة موازية لبتات المرجع، وموضع المؤشر. الإصابة تضبط بتّ الصفحة على 1 فقط، ولا يتحرك المؤشر.",
    },
    {
      en: "On a fault, loop: if the frame under the hand is empty or its bit is 0, replace it, set the new bit to 1 and advance the hand, then stop. Otherwise clear the bit to 0, advance the hand (wrap with `% k`) and look again.",
      ar: "عند الخطأ كرّر: إن كان الإطار تحت المؤشر فارغاً أو بتّه 0 فاستبدله واضبط البتّ الجديد على 1 وحرّك المؤشر ثم توقف. وإلا فأعد البتّ إلى 0 وحرّك المؤشر (مع `% k` للالتفاف) وانظر مجدداً.",
    },
    {
      en: "Do not test emptiness with `if not frames[hand]`: page number 0 is valid and falsy. Compare with `None` explicitly.",
      ar: "لا تفحص الفراغ بـ `if not frames[hand]`: رقم الصفحة 0 صالح لكنه يُعدّ قيمة خاطئة. قارن مع `None` صراحةً.",
    },
  ],
  "devops-pipeline-order": [
    {
      en: "Parse first, schedule second. Collect `(name, needs)` pairs in definition order. A job line is indented by exactly 2 spaces and ends with `:`; the line that starts with `needs:` (and no other `needs...` key) holds its list.",
      ar: "حلّل أولاً ثم جدول. اجمع أزواج `(name, needs)` بترتيب التعريف. سطر المهمة مزاح بمسافتين بالضبط وينتهي بـ`:`؛ والسطر الذي يبدأ بـ`needs:` (وليس أي مفتاح آخر يبدأ بـ`needs`) يحمل القائمة.",
    },
    {
      en: "Repeat: scan the jobs in definition order, run the first one that is not done yet and whose needs are all done, then rescan from the top. If a full scan finds nothing while jobs remain, there is a cycle.",
      ar: "كرّر: امسح المهام بترتيب التعريف، ونفّذ أول مهمة لم تُنفَّذ بعد وكل ما تحتاجه منفَّذ، ثم أعد المسح من البداية. وإن لم يجد مسح كامل شيئاً بينما بقيت مهام فهناك حلقة.",
    },
    {
      en: "Check unknown dependencies BEFORE scheduling, scanning jobs in definition order and each `needs` list left to right. A missing job is an `error: unknown job`, never a `error: cycle`.",
      ar: "افحص التبعيات المجهولة قبل الجدولة، بمسح المهام بترتيب التعريف وكل قائمة `needs` من اليسار إلى اليمين. المهمة المفقودة هي `error: unknown job` وليست `error: cycle` أبداً.",
    },
  ],
  "net-route-aggregator": [
    {
      en: "Turn every block into an integer interval `[first, last]`. Sort the intervals, then merge the ones that overlap or touch (`next.first <= current.last + 1`). Work with integers, not strings.",
      ar: "حوّل كل كتلة إلى مجال من الأعداد الصحيحة `[first, last]`. رتّب المجالات ثم ادمج المتداخلة أو المتلاصقة (`next.first <= current.last + 1`). اشتغل بالأعداد لا بالنصوص.",
    },
    {
      en: "A merged interval is not always one CIDR block. Cover it greedily from its start: the biggest block that fits starts at `first` with a size that is a power of two, divides `first` exactly (alignment) and does not pass `last`. Emit it, move `first` forward, repeat.",
      ar: "المجال المدموج ليس دائماً كتلة CIDR واحدة. غطِّه بجشع من بدايته: أكبر كتلة تناسب تبدأ عند `first` وحجمها قوة للعدد 2 ويقسم `first` تماماً (المحاذاة) ولا يتجاوز `last`. أخرجها وحرّك `first` وكرّر.",
    },
    {
      en: "In JavaScript, `|`, `&` and `<<` work on signed 32-bit numbers, which breaks near 255.255.255.255. Use ordinary arithmetic (`*`, `%`, `Math.floor`) on numbers, which are exact up to 2^53.",
      ar: "في JavaScript تعمل المعاملات `|` و`&` و`<<` على أعداد 32 بت بإشارة، فتنكسر قرب 255.255.255.255. استخدم الحساب العادي (`*` و`%` و`Math.floor`) على الأعداد فهي دقيقة حتى 2^53.",
    },
  ],
  "os-mlfq": [
    {
      en: "Keep `k` FIFO queues of process indexes, `remaining[]` burst times and a clock `t`. Each step: take the head of the first non-empty queue, run it for `min(quantum[level], remaining)` and advance `t`.",
      ar: "احتفظ بـ`k` طابوراً FIFO لفهارس العمليات، ومصفوفة `remaining[]` للأزمنة المتبقية، وساعة `t`. في كل خطوة: خذ رأس أول طابور غير فارغ وشغّله `min(quantum[level], remaining)` وقدّم `t`.",
    },
    {
      en: "Admit arrivals (`arrival <= t`) into queue 0 BEFORE you re-queue the job that just ran, and again after every slice. If every queue is empty, jump `t` to the next arrival instead of looping.",
      ar: "أدخل الواصلين (`arrival <= t`) إلى الطابور 0 قبل إعادة إدراج المهمة التي انتهت شريحتها، وكرّر ذلك بعد كل شريحة. وإن كانت كل الطوابير فارغة فاقفز بـ`t` إلى الوصول التالي بدل الدوران.",
    },
    {
      en: "A job is demoted only if it used its FULL quantum and still has work left; a job that finishes inside its slice is done. In the last queue a job stays where it is (re-queued at the tail). Waiting time is `finish - arrival - burst`.",
      ar: "تُخفَّض المهمة فقط إن استهلكت الشريحة **كاملة** وبقي لها عمل؛ والمهمة التي تنتهي داخل شريحتها تكون قد انتهت. في الطابور الأخير تبقى المهمة مكانها (وتُعاد إلى الذيل). زمن الانتظار هو `finish - arrival - burst`.",
    },
  ],
  "cloud-iam-evaluate": [
    {
      en: "Evaluate each request against EVERY statement and remember two booleans: did a matching DENY exist, did a matching ALLOW exist. The order of statements must not matter.",
      ar: "قيّم كل طلب مقابل **كل** عبارة واحتفظ بقيمتين منطقيتين: هل وُجدت عبارة DENY مطابقة، وهل وُجدت عبارة ALLOW مطابقة. ترتيب العبارات يجب ألا يهم.",
    },
    {
      en: "Write a small `matches(pattern, text)` that handles only `*` and `?`. Do not feed policies to a regex or to `fnmatch` unescaped: `.`, `+`, `(` and `[` are plain characters here (and `fnmatch` gives `[...]` a special meaning).",
      ar: "اكتب دالة صغيرة `matches(pattern, text)` تتعامل مع `*` و`?` فقط. لا تمرّر السياسات إلى regex أو `fnmatch` بلا تهريب: الرموز `.` و`+` و`(` و`[` حروف عادية هنا (و`fnmatch` تعطي `[...]` معنى خاصاً).",
    },
    {
      en: "A pattern such as `*a*a*a*a*a*b` can make a naive regex take forever. Match with two indices and remember the position of the last `*`; on a mismatch, retry from just after it (one more character swallowed by the star).",
      ar: "نمط مثل `*a*a*a*a*a*b` قد يجعل regex ساذجاً يدور إلى الأبد. طابق بمؤشرين وتذكّر موضع آخر `*`؛ وعند عدم التطابق أعد المحاولة من بعده مباشرة (حرف إضافي تبتلعه النجمة).",
    },
  ],
  "devops-cron-next-run": [
    {
      en: "Parse each field into the set of allowed values first (`*`, `*/n`, `a`, `a-b`, `a-b/n`, comma lists), with the field's own range: minutes 0-59, hours 0-23, day of month 1-31, month 1-12, weekday 0-6. `*/n` starts at the field's minimum.",
      ar: "حلّل كل حقل أولاً إلى مجموعة القيم المسموحة (`*` و`*/n` و`a` و`a-b` و`a-b/n` والقوائم بالفاصلة) بمجاله الخاص: الدقائق 0-59 والساعات 0-23 ويوم الشهر 1-31 والشهر 1-12 ويوم الأسبوع 0-6. و`*/n` تبدأ من الحد الأدنى للحقل.",
    },
    {
      en: "Do not step minute by minute: walk day by day from the day of the first candidate minute. A day qualifies when its month is allowed and the day rule holds; on a qualifying day take the earliest (hour, minute) that is not before the start. Stop after about 12 years: then the answer is `never`.",
      ar: "لا تتقدّم دقيقة دقيقة: امشِ يوماً يوماً من يوم أول دقيقة مرشّحة. يصلح اليوم إن كان شهره مسموحاً وتحققت قاعدة اليوم؛ وفي اليوم الصالح خذ أبكر (ساعة، دقيقة) لا تسبق البداية. توقف بعد نحو 12 سنة: عندها الجواب `never`.",
    },
    {
      en: "The day rule: if the day-of-month text and the weekday text both do NOT start with `*`, the day is valid when EITHER matches. If at least one starts with `*` (so `*` and `*/2` count), BOTH must match. Let a date library do the calendar work: weekday numbers differ (Python's Monday is 0, cron's Sunday is 0).",
      ar: "قاعدة اليوم: إن كان نص يوم الشهر ونص يوم الأسبوع كلاهما **لا** يبدأ بـ`*` فاليوم صالح إذا طابق **أحدهما**. وإن بدأ واحد منهما على الأقل بـ`*` (فتُحسب `*` و`*/2`) فيجب أن يتطابق **الاثنان**. اترك للمكتبة عمل التقويم: أرقام الأيام تختلف (الاثنين في Python هو 0 وأما الأحد في cron فهو 0).",
    },
  ],
  "net-frame-dissect": [
    {
      en: "Peel one layer at a time. An Ethernet II header is 14 bytes, but if its EtherType is `81 00` an 802.1Q VLAN tag (4 bytes: the tag itself, then the REAL EtherType) comes first. Every frame in this capture is tagged.",
      ar: "قشّر طبقة واحدة في كل مرة. ترويسة Ethernet II من 14 بايت، لكن إن كان EtherType هو `81 00` فتسبقها وسم VLAN وفق 802.1Q (4 بايت: الوسم نفسه ثم EtherType **الحقيقي**). كل إطار في هذه اللقطة موسوم.",
    },
    {
      en: "The IPv4 header length is the LOW nibble of its first byte times 4 (options make it longer than 20 bytes); the TCP header length is the HIGH nibble of TCP byte 12 times 4. The data ends where the IPv4 total length says, so the 4 FCS bytes at the end of the frame are not data.",
      ar: "طول ترويسة IPv4 هو النصف الأدنى من بايتها الأول مضروباً في 4 (والخيارات تجعلها أطول من 20 بايت)؛ وطول ترويسة TCP هو النصف الأعلى من البايت 12 في TCP مضروباً في 4. وتنتهي البيانات حيث يقول الطول الكلي في IPv4، فبايتات FCS الأربعة في آخر الإطار ليست بيانات.",
    },
    {
      en: "Only one frame carries the HTTP request. Its `token` is hex text: turn every two hex digits into one byte, XOR the bytes with the four bytes of the destination IPv4 address in that frame's own header (a, b, c, d, a, b, c, d, ...), and read the result as ASCII. Remember to put the secret between the braces of `IMB{...}`.",
      ar: "إطار واحد فقط يحمل طلب HTTP. وقيمة `token` فيه نص سداسي عشري: حوّل كل رقمين إلى بايت، ثم اجمع (XOR) البايتات مع بايتات عنوان IPv4 الوجهة الأربعة في ترويسة ذلك الإطار نفسه (a وb وc وd وa وb وc وd ...)، واقرأ الناتج كنص ASCII. وتذكّر أن تضع السر بين قوسي `IMB{...}`.",
    },
  ],
};
