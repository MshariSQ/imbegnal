import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "file-systems",
  title: { en: "File Systems & Storage — From a Name to Disk Blocks", ar: "أنظمة الملفات والتخزين — من الاسم إلى كتل القرص" },
  estMinutes: 43,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- How a file system lays out a disk: **superblock**, **bitmaps**, the **inode table** and **data blocks**
- What an **inode** stores (and the one thing it does not: the file's name), and how **directories** map names to inode numbers
- How an inode finds its blocks with **direct and indirect pointers** or **extents**, and what limits a file's size
- The difference between **hard links** and **symbolic links**, and when a file's space is really freed
- How the **page cache** speeds things up, why a crash can corrupt a naive file system and how **journaling** prevents it
- The trade-offs between **ext4, XFS, Btrfs** and friends

You will code an inode block mapper in Go, a links-and-inodes simulator in Python and a journal recovery tool in Java.`,
        ar: `## ماذا ستتعلم

- كيف ينظّم نظام الملفات القرص: **الكتلة الفائقة (superblock)** و**خرائط البتّات (bitmaps)** و**جدول الـ inodes** و**كتل البيانات**
- ماذا يخزّن **الـ inode** (والشيء الوحيد الذي لا يخزّنه: اسم الملف)، وكيف تربط **المجلدات** الأسماء بأرقام الـ inodes
- كيف يجد الـ inode كتله بـ**المؤشرات المباشرة وغير المباشرة** أو بـ**الامتدادات (extents)**، وما الذي يحدّ حجم الملف
- الفرق بين **الروابط الصلبة (hard links)** و**الروابط الرمزية (symbolic links)**، ومتى تتحرّر مساحة الملف فعلاً
- كيف تسرّع **ذاكرة الصفحات المخبئية (page cache)** العمل، ولماذا قد يُفسد الانهيار نظام ملفات ساذجاً، وكيف يمنع ذلك **السجل اليومي (journaling)**
- المفاضلة بين **ext4 وXFS وBtrfs** وأخواتها

ستبرمج راسماً لكتل الـ inode بلغة Go، ومحاكياً للروابط والـ inodes بلغة Python، وأداة استعادة من السجل اليومي بلغة Java.`,
      },
    },
    {
      type: "text",
      body: {
        en: `## A disk is a long row of numbered blocks 🧱

A drive offers the OS one thing: an array of fixed-size **blocks** (commonly 4 KiB in a file system) that can be read or written by number. Files, folders and names are an illusion that a **file system** builds on top: a data structure stored in those blocks. A very small one, in the style of the simple file system in *OSTEP*, looks like this:

\`\`\`
block:  0        1          2          3 ... 7         8 ... 63
      +--------+----------+----------+-------------+-----------------+
      | super  | inode    | data     | inode table | data blocks     |
      | block  | bitmap   | bitmap   | (inodes)    | (file contents) |
      +--------+----------+----------+-------------+-----------------+
\`\`\`

- The **superblock** describes the file system: its type, size, block size and where everything else starts
- Two **bitmaps** record which inodes and which data blocks are free (one bit each)
- The **inode table** holds fixed-size records, one per file, numbered from 1 upwards
- **Data blocks** hold file contents and directory listings

ext4 uses the same ideas, repeated in **block groups** spread across the disk.

### The inode: everything except the name

An **inode** (index node) describes one file. \`inode(7)\` lists what it stores: the **file type and mode** (permission bits), the **owner UID and GID**, the **size**, **timestamps** (last access, last modification, last status change and, on some file systems, creation), the **link count**, and where the **data blocks** are. Run \`stat notes.txt\` to see them.

What is **not** in the inode is the **name**. Names live in **directories**. A directory is just a file whose content is a list of **directory entries**: pairs of *name → inode number*. Every directory also lists \`.\` (itself) and \`..\` (its parent). \`ls -i\` prints the inode numbers.

### Following a path

Opening \`/home/ana/notes.txt\` means walking the tree. On ext2/3/4 the root directory is always **inode 2**, so the kernel:

1. reads inode 2, then its data block, and finds \`home → 4321\`
2. reads inode 4321, then its data block, and finds \`ana → 5120\`
3. reads inode 5120, then its data block, and finds \`notes.txt → 6007\`
4. reads inode 6007, which says where the bytes are

That is seven reads before the first byte of data. Real kernels keep recently used inodes and names in memory (the **inode cache** and the **dentry cache**), so a second lookup costs almost nothing.`,
        ar: `## القرص صفّ طويل من الكتل المرقّمة 🧱

يقدّم القرص لنظام التشغيل شيئاً واحداً: مصفوفة من **الكتل (blocks)** ثابتة الحجم (غالباً 4 KiB في نظام الملفات) تُقرأ وتُكتب برقمها. أما الملفات والمجلدات والأسماء فوهمٌ يبنيه فوقها **نظام الملفات (file system)**: بنية بيانات مخزّنة في تلك الكتل. ويبدو نظام صغير جداً، على طريقة نظام الملفات البسيط في كتاب *OSTEP*، هكذا:

\`\`\`
block:  0        1          2          3 ... 7         8 ... 63
      +--------+----------+----------+-------------+-----------------+
      | super  | inode    | data     | inode table | data blocks     |
      | block  | bitmap   | bitmap   | (inodes)    | (file contents) |
      +--------+----------+----------+-------------+-----------------+
\`\`\`

- **الكتلة الفائقة (superblock)** تصف نظام الملفات: نوعه وحجمه وحجم كتلته وأين يبدأ كل شيء آخر
- **خريطتا بتّات (bitmaps)** تسجّلان أي الـ inodes وأي كتل البيانات حرّة (بتّ واحد لكل منها)
- **جدول الـ inodes** يحمل سجلات ثابتة الحجم، سجلاً لكل ملف، مرقّمة من 1 صعوداً
- **كتل البيانات** تحمل محتويات الملفات وقوائم المجلدات

ويستخدم ext4 الأفكار نفسها، مكرّرة في **مجموعات كتل (block groups)** موزّعة على القرص.

### الـ inode: كل شيء عدا الاسم

**الـ inode** (عقدة الفهرس، index node) يصف ملفاً واحداً. ويسرد \`inode(7)\` ما يخزّنه: **نوع الملف وصلاحياته** (بتّات الصلاحيات)، و**UID وGID للمالك**، و**الحجم**، و**الطوابع الزمنية** (آخر وصول، وآخر تعديل، وآخر تغيّر في الحالة، ووقت الإنشاء في بعض أنظمة الملفات)، و**عدد الروابط (link count)**، وأين توجد **كتل البيانات**. نفّذ \`stat notes.txt\` لتراها.

أما ما **ليس** في الـ inode فهو **الاسم**. الأسماء تعيش في **المجلدات**. والمجلد مجرد ملف محتواه قائمة من **مداخل المجلد (directory entries)**: أزواج *اسم ← رقم inode*. وكل مجلد يسرد أيضاً \`.\` (نفسه) و\`..\` (أباه). ويطبع \`ls -i\` أرقام الـ inodes.

### تتبّع المسار

فتح \`/home/ana/notes.txt\` يعني المشي في الشجرة. في ext2/3/4 يكون المجلد الجذر دائماً **الـ inode رقم 2**، فتقوم النواة بما يلي:

1. تقرأ الـ inode رقم 2 ثم كتلة بياناته، فتجد \`home → 4321\`
2. تقرأ الـ inode رقم 4321 ثم كتلة بياناته، فتجد \`ana → 5120\`
3. تقرأ الـ inode رقم 5120 ثم كتلة بياناته، فتجد \`notes.txt → 6007\`
4. تقرأ الـ inode رقم 6007 الذي يقول أين توجد البايتات

هذه سبع قراءات قبل أول بايت من البيانات. وتحتفظ النوى الحقيقية بالـ inodes والأسماء المستخدمة حديثاً في الذاكرة (**ذاكرة الـ inodes المخبئية** و**ذاكرة مداخل المجلدات المخبئية (dentry cache)**)، فلا يكاد البحث الثاني يكلّف شيئاً.`,
      },
    },
    {
      type: "code-demo",
      lang: "python",
      code: `# A toy disk: inodes, and the data blocks of directories (name -> inode number).
inodes = {
    2:    {"type": "dir",  "block": 100},    # inode 2 is the root directory on ext2/3/4
    4321: {"type": "dir",  "block": 230},
    5120: {"type": "dir",  "block": 377},
    6007: {"type": "file", "size": 1800, "block": 912},
}
blocks = {
    100: {".": 2, "..": 2, "home": 4321, "etc": 12},
    230: {".": 4321, "..": 2, "ana": 5120},
    377: {".": 5120, "..": 4321, "notes.txt": 6007},
}

def lookup(path):
    reads = 0
    number = 2                                       # start at the root inode
    for name in [p for p in path.split("/") if p]:
        node = inodes[number]; reads += 1            # read the directory's inode
        entries = blocks[node["block"]]; reads += 1  # read its data block
        number = entries[name]
        print(f"  '{name}' found in block {node['block']} -> inode {number}")
    reads += 1                                       # finally read the file's own inode
    print(f"  {path}: inode {number}, {inodes[number]['size']} bytes, {reads} disk reads")

lookup("/home/ana/notes.txt")
`,
      explanation: {
        en: "The name notes.txt appears only in block 377, the content of directory ana. The file's inode knows its size and blocks but not its name. Add a deeper directory to see how every level costs two more reads.",
        ar: "لا يظهر الاسم notes.txt إلا في الكتلة 377، أي محتوى المجلد ana. أما inode الملف فيعرف حجمه وكتله لكنه لا يعرف اسمه. أضف مجلداً أعمق لترى كيف يكلّف كل مستوى قراءتين إضافيتين.",
      },
    },
    {
      type: "text",
      body: {
        en: `## Finding the data blocks: pointers and extents

An inode has room for only a handful of block addresses. The classic Unix design (used by ext2 and ext3) builds a small tree:

\`\`\`
inode
├── direct[0] ... direct[11] ──▶ data blocks 0-11
├── single indirect ──▶ [ 1024 pointers ] ──▶ data blocks
├── double indirect ──▶ [ 1024 ] ──▶ [ 1024 each ] ──▶ data blocks
└── triple indirect ──▶ [ 1024 ] ──▶ [ 1024 ] ──▶ [ 1024 ] ──▶ data blocks
\`\`\`

With 4 KiB blocks and 4-byte block numbers, one indirect block holds 4096 / 4 = **1024** pointers, so:

- 12 direct pointers reach 12 × 4 KiB = **48 KiB**
- the single indirect block adds 1024 × 4 KiB = **4 MiB**
- the double indirect block adds 1024² × 4 KiB = **4 GiB**
- the triple indirect block adds 1024³ × 4 KiB = **4 TiB**

Small files, which are the vast majority, need no extra reads at all; a byte deep inside a huge file costs up to three extra reads for the indirect blocks. (Other inode fields can lower the real limit: ext3 caps files at 2 TiB with 4 KiB blocks.)

**ext4** replaces most of this with **extents**: one entry says "logical blocks 0-999 are physical blocks 81,920-82,919". A single extent covers up to 32,768 blocks (128 MiB with 4 KiB blocks), so a large file written in one go needs a few entries instead of thousands of pointers.`,
        ar: `## العثور على كتل البيانات: المؤشرات والامتدادات

لا يتسع الـ inode إلا لعدد قليل من عناوين الكتل. فيبني تصميم يونكس الكلاسيكي (الذي يستخدمه ext2 وext3) شجرة صغيرة:

\`\`\`
inode
├── direct[0] ... direct[11] ──▶ data blocks 0-11
├── single indirect ──▶ [ 1024 pointers ] ──▶ data blocks
├── double indirect ──▶ [ 1024 ] ──▶ [ 1024 each ] ──▶ data blocks
└── triple indirect ──▶ [ 1024 ] ──▶ [ 1024 ] ──▶ [ 1024 ] ──▶ data blocks
\`\`\`

مع كتل من 4 KiB وأرقام كتل من 4 بايت، تتسع الكتلة غير المباشرة الواحدة لـ 4096 / 4 = **1024** مؤشراً، إذن:

- تصل المؤشرات المباشرة الـ 12 إلى 12 × 4 KiB = **48 KiB**
- وتضيف الكتلة غير المباشرة الأحادية (single indirect) مقدار 1024 × 4 KiB = **4 MiB**
- وتضيف الثنائية (double indirect) مقدار 1024² × 4 KiB = **4 GiB**
- وتضيف الثلاثية (triple indirect) مقدار 1024³ × 4 KiB = **4 TiB**

الملفات الصغيرة، وهي الأغلبية الساحقة، لا تحتاج إلى أي قراءة إضافية؛ أما بايت في عمق ملف ضخم فيكلّف حتى ثلاث قراءات إضافية للكتل غير المباشرة. (وقد تخفّض حقول أخرى في الـ inode الحدَّ الفعلي: فـ ext3 يحدّ الملفات بـ 2 TiB مع كتل من 4 KiB.)

ويستبدل **ext4** معظم هذا بـ**الامتدادات (extents)**: مدخل واحد يقول "الكتل المنطقية 0-999 هي الكتل الفيزيائية 81,920-82,919". ويغطي الامتداد الواحد حتى 32,768 كتلة (أي 128 MiB مع كتل من 4 KiB)، فيحتاج ملف كبير كُتب دفعة واحدة إلى بضعة مداخل بدل آلاف المؤشرات.`,
      },
    },
    {
      type: "lab",
      id: "inode-block-map",
      lang: "go",
      prompt: {
        en: `Map byte offsets of a file to the pointer that leads to their data block, in a classic inode with direct, single, double and triple indirect pointers.

**Input** (whitespace-separated numbers):
- \`block_size ptr_size direct\`: the block size in bytes, the size of one block number in bytes, and the number of direct pointers in the inode
- then zero or more **byte offsets** until the end of input

**Rules:** \`k = block_size / ptr_size\` pointers fit in one indirect block. The logical block of an offset is \`n = offset / block_size\`. Blocks \`0\` to \`direct-1\` are direct; the next \`k\` go through the single indirect block, the next \`k²\` through the double, the next \`k³\` through the triple. Inside each region number from 0: for the double, entry \`i = n / k\` of the top block and \`j = n % k\` below it; for the triple, \`n / k²\`, \`(n / k) % k\` and \`n % k\`. Fetching the data block costs 1, 2, 3 or 4 disk reads (the inode is already in memory).

**Output:** first \`max file size: <bytes> bytes\` (all reachable blocks times the block size), then for each offset:
- \`<offset> -> block <n> via <path>, reads=<r>\` with \`<path>\` one of \`direct[a]\`, \`single[a]\`, \`double[a][b]\`, \`triple[a][b][c]\`
- or \`<offset> -> TOO LARGE\`

**Example:** \`4096 4 12\` and the offsets \`0 49152 4243456\` print

\`\`\`
max file size: 4402345721856 bytes
0 -> block 0 via direct[0], reads=1
49152 -> block 12 via single[0], reads=2
4243456 -> block 1036 via double[0][0], reads=3
\`\`\``,
        ar: `اربط إزاحات البايتات في ملف بالمؤشر الذي يقود إلى كتلة بياناتها، في inode كلاسيكي بمؤشرات مباشرة وغير مباشرة أحادية وثنائية وثلاثية.

**المدخل** (أعداد تفصلها مسافات بيضاء):
- \`block_size ptr_size direct\`: حجم الكتلة بالبايت، وحجم رقم الكتلة الواحد بالبايت، وعدد المؤشرات المباشرة في الـ inode
- ثم صفر أو أكثر من **إزاحات البايتات** حتى نهاية المدخل

**القواعد:** تتسع الكتلة غير المباشرة الواحدة لـ \`k = block_size / ptr_size\` مؤشراً. والكتلة المنطقية للإزاحة هي \`n = offset / block_size\`. الكتل من \`0\` إلى \`direct-1\` مباشرة؛ والـ \`k\` التالية تمرّ عبر الكتلة الأحادية، والـ \`k²\` التالية عبر الثنائية، والـ \`k³\` التالية عبر الثلاثية. رقّم داخل كل منطقة من 0: في الثنائية، المدخل \`i = n / k\` في الكتلة العليا و\`j = n % k\` تحتها؛ وفي الثلاثية \`n / k²\` و\`(n / k) % k\` و\`n % k\`. وجلب كتلة البيانات يكلّف 1 أو 2 أو 3 أو 4 قراءات من القرص (الـ inode موجود في الذاكرة أصلاً).

**المخرج:** أولاً \`max file size: <bytes> bytes\` (كل الكتل التي يمكن الوصول إليها مضروبة في حجم الكتلة)، ثم لكل إزاحة:
- \`<offset> -> block <n> via <path>, reads=<r>\` حيث \`<path>\` أحد \`direct[a]\` أو \`single[a]\` أو \`double[a][b]\` أو \`triple[a][b][c]\`
- أو \`<offset> -> TOO LARGE\`

**مثال:** \`4096 4 12\` والإزاحات \`0 49152 4243456\` تطبع

\`\`\`
max file size: 4402345721856 bytes
0 -> block 0 via direct[0], reads=1
49152 -> block 12 via single[0], reads=2
4243456 -> block 1036 via double[0][0], reads=3
\`\`\``,
      },
      starterCode: `package main

import "fmt"

// locate maps a logical block number to its place in the pointer tree and the
// number of disk reads needed to fetch that data block (the inode is already in
// memory). ok is false when the block lies beyond the triple indirect tree.
func locate(n, direct, k uint64) (path string, reads int, ok bool) {
	// TODO 1: n < direct              -> "direct[n]", 1 read
	// TODO 2: subtract direct; n < k   -> "single[n]", 2 reads
	// TODO 3: subtract k; n < k*k      -> "double[n/k][n%k]", 3 reads
	// TODO 4: subtract k*k; n < k*k*k  -> "triple[a][b][c]", 4 reads
	//         (a = n/(k*k), b = (n/k)%k, c = n%k)
	return "", 0, false
}

func main() {
	var blockSize, ptrSize, direct uint64
	if _, err := fmt.Scan(&blockSize, &ptrSize, &direct); err != nil {
		return
	}
	k := blockSize / ptrSize // pointers that fit in one indirect block

	// TODO 5: the largest file has (direct + k + k*k + k*k*k) blocks
	maxBytes := direct * blockSize
	fmt.Printf("max file size: %d bytes\\n", maxBytes)

	var offset uint64
	for {
		if _, err := fmt.Scan(&offset); err != nil {
			break
		}
		n := offset / blockSize // logical block number inside the file
		path, reads, ok := locate(n, direct, k)
		if !ok {
			fmt.Printf("%d -> TOO LARGE\\n", offset)
			continue
		}
		fmt.Printf("%d -> block %d via %s, reads=%d\\n", offset, n, path, reads)
	}
}
`,
      solution: `package main

import "fmt"

// locate maps a logical block number to its place in the pointer tree and the
// number of disk reads needed to fetch that data block (the inode is already in
// memory). ok is false when the block lies beyond the triple indirect tree.
func locate(n, direct, k uint64) (path string, reads int, ok bool) {
	if n < direct {
		return fmt.Sprintf("direct[%d]", n), 1, true
	}
	n -= direct
	if n < k {
		return fmt.Sprintf("single[%d]", n), 2, true // the indirect block, then the data
	}
	n -= k
	if n < k*k {
		return fmt.Sprintf("double[%d][%d]", n/k, n%k), 3, true
	}
	n -= k * k
	if n < k*k*k {
		return fmt.Sprintf("triple[%d][%d][%d]", n/(k*k), (n/k)%k, n%k), 4, true
	}
	return "", 0, false
}

func main() {
	var blockSize, ptrSize, direct uint64
	if _, err := fmt.Scan(&blockSize, &ptrSize, &direct); err != nil {
		return
	}
	k := blockSize / ptrSize // pointers that fit in one indirect block

	// Each level adds the blocks it can reach: direct, k, k*k and k*k*k.
	maxBytes := (direct + k + k*k + k*k*k) * blockSize
	fmt.Printf("max file size: %d bytes\\n", maxBytes)

	var offset uint64
	for {
		if _, err := fmt.Scan(&offset); err != nil {
			break
		}
		n := offset / blockSize // logical block number inside the file
		path, reads, ok := locate(n, direct, k)
		if !ok {
			fmt.Printf("%d -> TOO LARGE\\n", offset)
			continue
		}
		fmt.Printf("%d -> block %d via %s, reads=%d\\n", offset, n, path, reads)
	}
}
`,
      hints: [
        {
          en: "Work region by region and subtract as you go: if n < direct you are done; otherwise n -= direct and compare with k; then n -= k and compare with k*k; then n -= k*k and compare with k*k*k.",
          ar: "اعمل منطقة تلو منطقة واطرح كلما تقدّمت: إن كان n < direct انتهيت؛ وإلا فـ n -= direct وقارن بـ k؛ ثم n -= k وقارن بـ k*k؛ ثم n -= k*k وقارن بـ k*k*k.",
        },
        {
          en: "Inside the double region the top-level index is n / k and the second-level index is n % k. In the triple region use n / (k*k), (n / k) % k and n % k. The read count is the depth: 1 for direct, plus one per indirect block on the way.",
          ar: "داخل المنطقة الثنائية يكون فهرس المستوى الأعلى n / k وفهرس المستوى الثاني n % k. وفي الثلاثية استخدم n / (k*k) و(n / k) % k وn % k. وعدد القراءات هو العمق: 1 للمباشر، ثم واحدة لكل كتلة غير مباشرة في الطريق.",
        },
        {
          en: "The maximum is (direct + k + k*k + k*k*k) * blockSize. With 4096-byte blocks this is about 4.4e12, far beyond 32 bits, so keep everything in uint64 as the starter does.",
          ar: "الحد الأقصى هو (direct + k + k*k + k*k*k) * blockSize. ومع كتل من 4096 بايت يبلغ نحو 4.4e12، وهو أكبر بكثير من 32 بتّاً، فأبقِ كل شيء في uint64 كما يفعل كود البداية.",
        },
      ],
      tests: [
        {
          name: { en: "Example from the prompt", ar: "المثال من نص المسألة" },
          stdin: "4096 4 12\n0 49152 4243456\n",
          expected: `max file size: 4402345721856 bytes
0 -> block 0 via direct[0], reads=1
49152 -> block 12 via single[0], reads=2
4243456 -> block 1036 via double[0][0], reads=3`,
        },
        {
          name: { en: "Last byte of each region", ar: "آخر بايت في كل منطقة" },
          stdin: "4096 4 12\n49151\n4243455\n4299210751\n4402345721855\n",
          expected: `max file size: 4402345721856 bytes
49151 -> block 11 via direct[11], reads=1
4243455 -> block 1035 via single[1023], reads=2
4299210751 -> block 1049611 via double[1023][1023], reads=3
4402345721855 -> block 1074791435 via triple[1023][1023][1023], reads=4`,
        },
        {
          name: { en: "Triple indirect and beyond the limit", ar: "الثلاثية وما بعد الحد" },
          stdin: "4096 4 12\n4299210752\n4402345721856\n",
          expected: `max file size: 4402345721856 bytes
4299210752 -> block 1049612 via triple[0][0][0], reads=4
4402345721856 -> TOO LARGE`,
        },
        {
          name: { en: "1 KiB blocks", ar: "كتل من 1 KiB" },
          stdin: "1024 4 12\n13000\n281600\n",
          expected: `max file size: 17247252480 bytes
13000 -> block 12 via single[0], reads=2
281600 -> block 275 via double[0][7], reads=3`,
        },
        {
          name: { en: "8-byte pointers and only 4 direct blocks", ar: "مؤشرات من 8 بايت و4 كتل مباشرة فقط" },
          stdin: "512 8 4\n2047 2048 34816 2000000000\n",
          expected: `max file size: 136349696 bytes
2047 -> block 3 via direct[3], reads=1
2048 -> block 4 via single[0], reads=2
34816 -> block 68 via double[0][0], reads=3
2000000000 -> TOO LARGE`,
        },
      ],
      sampleInput: "4096 4 12\n0 49152 4243456\n",
    },
    {
      type: "text",
      body: {
        en: `## Hard links and symbolic links 🔗

Because names and inodes are separate, one inode can have **several names**:

\`\`\`
directory docs/                         inodes
  report.txt ──┐
               ├──▶ inode 1201 (file, links = 2) ──▶ data blocks
  final.txt  ──┘
  latest     ──▶ inode 1305 (symlink, links = 1) ──▶ "report.txt"
\`\`\`

- A **hard link** (\`ln report.txt final.txt\`) is a second directory entry with the **same inode number**. Both names are equally real; the inode's **link count** (the number after the permissions in \`ls -l\`) is now 2. Hard links cannot cross file systems (inode numbers are unique only inside one) and cannot point to directories
- A **symbolic link** (\`ln -s report.txt latest\`) is a **separate, tiny file** whose content is a path. The kernel follows it during path resolution. It can point anywhere, even to another file system or to a directory, and it **dangles** when its target disappears. Linux gives up after following 40 symbolic links in one lookup (error \`ELOOP\`)

\`rm\` does not really "delete a file": it calls \`unlink()\`, which removes **one name** and decrements the link count. The inode and its blocks are freed only when the link count reaches **0 and no process still has the file open**. That is why deleting a huge log that a running service still writes to frees no space until the service closes it (\`lsof +L1\` lists such files).`,
        ar: `## الروابط الصلبة والروابط الرمزية 🔗

لأن الأسماء منفصلة عن الـ inodes، يمكن أن يكون للـ inode الواحد **عدة أسماء**:

\`\`\`
directory docs/                         inodes
  report.txt ──┐
               ├──▶ inode 1201 (file, links = 2) ──▶ data blocks
  final.txt  ──┘
  latest     ──▶ inode 1305 (symlink, links = 1) ──▶ "report.txt"
\`\`\`

- **الرابط الصلب (hard link)** (\`ln report.txt final.txt\`) مدخل ثانٍ في المجلد بـ**رقم الـ inode نفسه**. الاسمان حقيقيان بالقدر نفسه؛ وصار **عدد الروابط** للـ inode (الرقم بعد الصلاحيات في \`ls -l\`) يساوي 2. ولا يمكن للروابط الصلبة أن تعبر أنظمة الملفات (أرقام الـ inodes فريدة داخل النظام الواحد فقط) ولا أن تشير إلى مجلدات
- **الرابط الرمزي (symbolic link)** (\`ln -s report.txt latest\`) **ملف منفصل صغير جداً** محتواه مسار. تتبعه النواة أثناء تحليل المسار. ويمكنه أن يشير إلى أي مكان، حتى إلى نظام ملفات آخر أو إلى مجلد، ويصبح **معلّقاً (dangling)** حين يختفي هدفه. ويتوقف لينكس بعد تتبّع 40 رابطاً رمزياً في بحث واحد (الخطأ \`ELOOP\`)

لا "يحذف" \`rm\` الملف حقاً: إنه يستدعي \`unlink()\` التي تزيل **اسماً واحداً** وتنقص عدد الروابط. ولا يتحرّر الـ inode وكتله إلا حين يصل عدد الروابط إلى **0 ولا تبقي أي عملية الملف مفتوحاً**. ولهذا فإن حذف سجلّ ضخم ما تزال خدمة عاملة تكتب فيه لا يحرّر أي مساحة حتى تغلقه الخدمة (يسرد \`lsof +L1\` مثل هذه الملفات).`,
      },
    },
    {
      type: "lab",
      id: "link-table",
      lang: "python",
      prompt: {
        en: `Simulate one directory of a file system with **inodes, hard links and symbolic links**.

**Input:** one command per line:
- \`create NAME TEXT\`: a new regular file whose content is TEXT (the rest of the line)
- \`link EXISTING NEW\`: a hard link. NEW becomes another name for the same inode as EXISTING (like Linux \`link()\`, it does not follow symlinks)
- \`symlink TARGET NAME\`: a new symbolic link whose content is the name TARGET (which need not exist)
- \`rm NAME\`: remove the name; the inode loses one link and is freed when it has none left
- \`cat NAME\`: print the file's content, following symlinks

**Rules:**
- Inode numbers start at 1, go up by one for every new inode (files and symlinks) and are never reused. A new inode has 1 link.
- Errors print one line and change nothing: \`create NAME: File exists\`, \`symlink NAME: File exists\`, \`link NEW: File exists\` (checked after EXISTING), \`link EXISTING: No such file or directory\`, \`rm NAME: No such file or directory\`, and for \`cat\` either \`cat NAME: No such file or directory\` (a missing name anywhere on the way) or \`cat NAME: Too many levels of symbolic links\` (more than 40 symlinks followed)
- At the end print every name in sorted order as \`<inode> <links> <name>\`, plus \` -> <target>\` for a symlink, then \`inodes in use: <count>\`

**Example:**

\`\`\`
create report.txt draft v1
link report.txt final.txt
symlink report.txt latest
rm report.txt
cat final.txt
cat latest
\`\`\`

prints

\`\`\`
draft v1
cat latest: No such file or directory
1 1 final.txt
2 1 latest -> report.txt
inodes in use: 2
\`\`\``,
        ar: `حاكِ مجلداً واحداً من نظام ملفات فيه **inodes وروابط صلبة وروابط رمزية**.

**المدخل:** أمر واحد في كل سطر:
- \`create NAME TEXT\`: ملف عادي جديد محتواه TEXT (بقية السطر)
- \`link EXISTING NEW\`: رابط صلب. يصبح NEW اسماً آخر للـ inode نفسه الذي يحمله EXISTING (ومثل \`link()\` في لينكس لا يتبع الروابط الرمزية)
- \`symlink TARGET NAME\`: رابط رمزي جديد محتواه الاسم TARGET (الذي لا يلزم أن يكون موجوداً)
- \`rm NAME\`: أزل الاسم؛ يفقد الـ inode رابطاً واحداً ويتحرّر حين لا يبقى له أي رابط
- \`cat NAME\`: اطبع محتوى الملف متتبّعاً الروابط الرمزية

**القواعد:**
- تبدأ أرقام الـ inodes من 1 وتزيد واحداً مع كل inode جديد (ملفاً كان أو رابطاً رمزياً) ولا يُعاد استخدامها أبداً. وللـ inode الجديد رابط واحد.
- الأخطاء تطبع سطراً واحداً ولا تغيّر شيئاً: \`create NAME: File exists\` و\`symlink NAME: File exists\` و\`link NEW: File exists\` (يُفحص بعد EXISTING) و\`link EXISTING: No such file or directory\` و\`rm NAME: No such file or directory\`، ولـ \`cat\` إما \`cat NAME: No such file or directory\` (اسم مفقود في أي موضع من الطريق) أو \`cat NAME: Too many levels of symbolic links\` (تُتُبّع أكثر من 40 رابطاً رمزياً)
- في النهاية اطبع كل اسم بترتيب مرتّب بالشكل \`<inode> <links> <name>\`، مع \` -> <target>\` للرابط الرمزي، ثم \`inodes in use: <count>\`

**مثال:**

\`\`\`
create report.txt draft v1
link report.txt final.txt
symlink report.txt latest
rm report.txt
cat final.txt
cat latest
\`\`\`

يطبع

\`\`\`
draft v1
cat latest: No such file or directory
1 1 final.txt
2 1 latest -> report.txt
inodes in use: 2
\`\`\``,
      },
      starterCode: `import sys

MAX_SYMLINKS = 40          # Linux gives up after following 40 symbolic links

inodes = {}                # inode number -> {"type": "file" or "symlink", "links": n, "data": text}
names = {}                 # the directory: name -> inode number
next_inode = 1

def new_inode(kind, data):
    global next_inode
    number = next_inode
    next_inode += 1
    inodes[number] = {"type": kind, "links": 1, "data": data}
    return number

for line in sys.stdin.read().splitlines():
    parts = line.split(" ", 2)
    cmd = parts[0]
    if cmd == "create":
        name = parts[1]
        if name in names:
            print(f"create {name}: File exists")
        else:
            names[name] = new_inode("file", parts[2] if len(parts) > 2 else "")
    # TODO 1: "link": the new name gets the SAME inode number; add one to its link count
    # TODO 2: "symlink": a new inode of type "symlink" whose data is the target name
    # TODO 3: "rm": remove the name, take one link away, delete the inode at 0 links
    # TODO 4: "cat": follow symlinks (at most MAX_SYMLINKS) and print the file's data

# TODO 5: list every name in sorted order, then the number of inodes in use
`,
      solution: `import sys

MAX_SYMLINKS = 40          # Linux gives up after following 40 symbolic links

inodes = {}                # inode number -> {"type": "file" or "symlink", "links": n, "data": text}
names = {}                 # the directory: name -> inode number
next_inode = 1

def new_inode(kind, data):
    global next_inode
    number = next_inode
    next_inode += 1
    inodes[number] = {"type": kind, "links": 1, "data": data}
    return number

def follow(name):
    """Resolve symlinks like open() does: an inode number, or an error message."""
    for _ in range(MAX_SYMLINKS + 1):
        if name not in names:
            return "No such file or directory"
        node = inodes[names[name]]
        if node["type"] != "symlink":
            return names[name]
        name = node["data"]           # a symlink only stores a name
    return "Too many levels of symbolic links"

for line in sys.stdin.read().splitlines():
    parts = line.split(" ", 2)
    cmd = parts[0]
    if cmd == "create":
        name = parts[1]
        if name in names:
            print(f"create {name}: File exists")
        else:
            names[name] = new_inode("file", parts[2] if len(parts) > 2 else "")
    elif cmd == "link":
        old, new = parts[1], parts[2]
        if old not in names:
            print(f"link {old}: No such file or directory")
        elif new in names:
            print(f"link {new}: File exists")
        else:
            names[new] = names[old]   # a second name for the SAME inode
            inodes[names[old]]["links"] += 1
    elif cmd == "symlink":
        target, name = parts[1], parts[2]
        if name in names:
            print(f"symlink {name}: File exists")
        else:
            names[name] = new_inode("symlink", target)
    elif cmd == "rm":
        name = parts[1]
        if name not in names:
            print(f"rm {name}: No such file or directory")
        else:
            number = names.pop(name)  # unlink(): one name less
            inodes[number]["links"] -= 1
            if inodes[number]["links"] == 0:
                del inodes[number]    # the last name is gone: free the inode
    elif cmd == "cat":
        name = parts[1]
        result = follow(name)
        if isinstance(result, str):
            print(f"cat {name}: {result}")
        else:
            print(inodes[result]["data"])

for name in sorted(names):
    number = names[name]
    node = inodes[number]
    if node["type"] == "symlink":
        print(f"{number} {node['links']} {name} -> {node['data']}")
    else:
        print(f"{number} {node['links']} {name}")
print(f"inodes in use: {len(inodes)}")
`,
      hints: [
        {
          en: "A hard link is one line of bookkeeping: names[new] = names[old], then add 1 to inodes[names[old]][\"links\"]. Check that old exists before checking that new is free, in that order.",
          ar: "الرابط الصلب سطر واحد من مسك الدفاتر: names[new] = names[old]، ثم أضف 1 إلى inodes[names[old]][\"links\"]. افحص وجود old قبل أن تفحص أن new غير مستخدم، بهذا الترتيب.",
        },
        {
          en: "rm pops the name and decrements the link count; only when it reaches 0 do you delete the inode. A symlink is never followed by rm or link: they work on the name itself.",
          ar: "يزيل rm الاسم بـ pop وينقص عدد الروابط؛ ولا تحذف الـ inode إلا حين يصل إلى 0. ولا يتتبّع rm ولا link الرابط الرمزي أبداً: إنهما يعملان على الاسم نفسه.",
        },
        {
          en: "For cat, loop at most MAX_SYMLINKS + 1 times: a missing name means \"No such file or directory\", a regular file ends the walk, and a symlink replaces the name with its data. If the loop runs out, report \"Too many levels of symbolic links\".",
          ar: "في cat كرّر بحد أقصى MAX_SYMLINKS + 1 مرة: الاسم المفقود يعني \"No such file or directory\"، والملف العادي ينهي المشي، والرابط الرمزي يستبدل الاسم بمحتواه. وإن نفدت الحلقة فأبلغ عن \"Too many levels of symbolic links\".",
        },
      ],
      tests: [
        {
          name: { en: "Example: a hard link survives rm, a symlink dangles", ar: "المثال: الرابط الصلب ينجو من rm والرابط الرمزي يتعلّق" },
          stdin: "create report.txt draft v1\nlink report.txt final.txt\nsymlink report.txt latest\nrm report.txt\ncat final.txt\ncat latest\n",
          expected: `draft v1
cat latest: No such file or directory
1 1 final.txt
2 1 latest -> report.txt
inodes in use: 2`,
        },
        {
          name: { en: "A symlink chain works, a symlink loop does not", ar: "سلسلة روابط رمزية تعمل وحلقة روابط لا تعمل" },
          stdin: "symlink b a\nsymlink a b\ncat a\ncreate c hello world\nsymlink c d\nsymlink d e\ncat e\n",
          expected: `cat a: Too many levels of symbolic links
hello world
1 1 a -> b
2 1 b -> a
3 1 c
4 1 d -> c
5 1 e -> d
inodes in use: 5`,
        },
        {
          name: { en: "Errors change nothing", ar: "الأخطاء لا تغيّر شيئاً" },
          stdin: "create a x\ncreate a y\nlink a a\nlink nope b\nrm nope\ncat nope\nsymlink a a\ncat a\n",
          expected: `create a: File exists
link a: File exists
link nope: No such file or directory
rm nope: No such file or directory
cat nope: No such file or directory
symlink a: File exists
x
1 1 a
inodes in use: 1`,
        },
        {
          name: { en: "Link counts and inode numbers that are never reused", ar: "أعداد الروابط وأرقام inodes لا يُعاد استخدامها" },
          stdin: "create f data\nlink f g\nlink g h\nrm f\nrm g\ncat h\ncreate i new file\nrm h\n",
          expected: `data
2 1 i
inodes in use: 1`,
        },
        {
          name: { en: "A hard link to a symlink shares the symlink's inode", ar: "الرابط الصلب إلى رابط رمزي يشاركه الـ inode" },
          stdin: "create t text\nsymlink t s\nlink s s2\nrm t\ncat s2\ncreate t back again\ncat s2\n",
          expected: `cat s2: No such file or directory
back again
2 2 s -> t
2 2 s2 -> t
3 1 t
inodes in use: 2`,
        },
        {
          name: { en: "Empty input", ar: "مدخل فارغ" },
          stdin: "",
          expected: "inodes in use: 0",
        },
      ],
      sampleInput: "create report.txt draft v1\nlink report.txt final.txt\nrm report.txt\ncat final.txt\n",
    },
    {
      type: "text",
      body: {
        en: `## The page cache, crashes and journaling 📒

Disks are slow compared with RAM, so Linux keeps recently used file data in the **page cache**. Reads of cached data never touch the disk (\`free -h\` shows the cache as buff/cache). Writes normally land in the cache too: the page is marked **dirty** and written back later, typically within about 30 seconds (\`vm.dirty_expire_centisecs\`). A program that must not lose data calls \`fsync(fd)\`, which returns only after that file's data and metadata have reached the device; databases do this on every commit.

### The crash-consistency problem

Appending one block to a file needs **three** separate writes: the **data block**, the **inode** (new pointer and size) and the **data bitmap** (block now used). The disk completes them one at a time, and the power can fail in between. Depending on which writes made it, the file system is fine, leaks space, or has an inode pointing at a block that is marked free. See every case:`,
        ar: `## ذاكرة الصفحات المخبئية والانهيارات والسجل اليومي 📒

الأقراص بطيئة مقارنة بالذاكرة RAM، لذا يحتفظ لينكس ببيانات الملفات المستخدمة حديثاً في **ذاكرة الصفحات المخبئية (page cache)**. وقراءة البيانات المخزّنة فيها لا تلمس القرص أبداً (يعرضها \`free -h\` في عمود buff/cache). والكتابات تقع عادةً في الذاكرة المخبئية أيضاً: تُوسم الصفحة بأنها **متّسخة (dirty)** وتُكتب على القرص لاحقاً، غالباً خلال نحو 30 ثانية (\`vm.dirty_expire_centisecs\`). والبرنامج الذي لا يحتمل فقدان بياناته يستدعي \`fsync(fd)\` التي لا تعود إلا بعد أن تصل بيانات ذلك الملف وبياناته الوصفية إلى الجهاز؛ وقواعد البيانات تفعل هذا عند كل التزام (commit).

### مشكلة الاتساق عند الانهيار

إلحاق كتلة واحدة بملف يحتاج إلى **ثلاث** كتابات منفصلة: **كتلة البيانات**، و**الـ inode** (مؤشر جديد وحجم جديد)، و**خريطة بتّات البيانات** (الكتلة صارت مستخدمة). وينجزها القرص واحدة تلو الأخرى، وقد ينقطع التيار بينها. وبحسب الكتابات التي نجحت، يكون نظام الملفات سليماً، أو يتسرّب منه حيّز، أو يحوي inode يشير إلى كتلة موسومة بأنها حرّة. انظر كل الحالات:`,
      },
    },
    {
      type: "code-demo",
      lang: "js",
      code: `// Appending one block needs three separate writes. What if power fails between them?
const writes = ["bitmap", "inode", "data"];

function verdict(done) {
  const b = done.has("bitmap"), i = done.has("inode"), d = done.has("data");
  if (i && !b) return "INCONSISTENT: the inode points to a block the bitmap calls free";
  if (b && !i) return "INCONSISTENT: block marked used, but no inode points to it (space leak)";
  if (i && b && !d) return "consistent metadata, but the file now contains garbage";
  if (i && b && d) return "consistent: the append happened";
  return "consistent: as if the append never happened";
}

for (let mask = 0; mask < 8; mask++) {
  const done = new Set(writes.filter((_, k) => mask & (1 << k)));
  const label = done.size ? [...done].join(" + ") : "nothing";
  console.log((label + " reached the disk").padEnd(40) + verdict(done));
}
`,
      explanation: {
        en: "Only two of the eight outcomes are what we want: all three writes or none of them. Journaling exists to make the update all-or-nothing. Notice that 'data only' looks harmless but silently loses the new data.",
        ar: "اثنتان فقط من النتائج الثماني هما ما نريد: الكتابات الثلاث كلها أو لا شيء منها. والسجل اليومي موجود ليجعل التحديث كلاً أو لا شيء. ولاحظ أن حالة 'البيانات فقط' تبدو غير ضارة لكنها تُضيّع البيانات الجديدة بصمت.",
      },
    },
    {
      type: "text",
      body: {
        en: `## Journaling: write it down first

The old fix was \`fsck\`: after a crash, scan every inode and bitmap and repair contradictions. On a multi-terabyte disk that can take hours. A **journaling** file system (ext3, ext4, XFS) instead uses **write-ahead logging**, the same idea databases use:

1. **Journal write**: write the blocks you are about to change into a reserved area, the **journal**
2. **Journal commit**: once those writes are on disk, write a small **commit record**. The transaction has now officially happened
3. **Checkpoint**: write the blocks to their real locations
4. **Free** the transaction's space in the journal

After a crash the kernel **replays** every transaction that has a commit record and **ignores** the rest. Replay is safe to repeat (writing the same value to a block twice changes nothing), so even a crash during recovery is harmless. Recovery takes seconds because only the journal is read.

Writing everything twice is expensive, so ext4 by default uses **ordered mode** (\`data=ordered\`): only **metadata** goes through the journal, and data blocks are written to their final place **before** the metadata that points to them is committed. \`data=journal\` logs file data too; \`data=writeback\` drops the ordering for speed. **Copy-on-write** file systems (Btrfs, ZFS) take another route: they never overwrite live blocks, they write new copies and then switch one root pointer atomically.`,
        ar: `## السجل اليومي: دوِّن أولاً

كان الحل القديم هو \`fsck\`: بعد الانهيار تُمسح كل الـ inodes وخرائط البتّات وتُصلح التناقضات. وعلى قرص بعدة تيرابايتات قد يستغرق ذلك ساعات. أما نظام الملفات ذو **السجل اليومي (journaling)** (مثل ext3 وext4 وXFS) فيستخدم بدلاً من ذلك **التسجيل المسبق للكتابة (write-ahead logging)**، وهي الفكرة نفسها التي تستخدمها قواعد البيانات:

1. **الكتابة في السجل**: اكتب الكتل التي توشك على تغييرها في منطقة محجوزة هي **السجل اليومي (journal)**
2. **الالتزام في السجل**: بعد أن تصل تلك الكتابات إلى القرص، اكتب **سجل التزام (commit record)** صغيراً. الآن حدثت المعاملة رسمياً
3. **نقطة التثبيت (checkpoint)**: اكتب الكتل في مواضعها الحقيقية
4. **حرّر** مساحة المعاملة في السجل

بعد الانهيار **تعيد النواة تنفيذ (replay)** كل معاملة لها سجل التزام و**تتجاهل** الباقي. وإعادة التنفيذ آمنة التكرار (كتابة القيمة نفسها في كتلة مرتين لا تغيّر شيئاً)، فحتى الانهيار أثناء الاستعادة لا ضرر منه. وتستغرق الاستعادة ثوانيَ لأن السجل وحده هو الذي يُقرأ.

كتابة كل شيء مرتين مكلفة، لذا يستخدم ext4 افتراضياً **الوضع المرتّب (ordered mode)** (\`data=ordered\`): لا تمرّ عبر السجل إلا **البيانات الوصفية (metadata)**، وتُكتب كتل البيانات في موضعها النهائي **قبل** الالتزام بالبيانات الوصفية التي تشير إليها. أما \`data=journal\` فيسجّل بيانات الملفات أيضاً، و\`data=writeback\` يتخلى عن الترتيب لأجل السرعة. وتسلك أنظمة الملفات القائمة على **النسخ عند الكتابة (copy-on-write)** (مثل Btrfs وZFS) طريقاً آخر: لا تكتب أبداً فوق كتل حيّة، بل تكتب نسخاً جديدة ثم تبدّل مؤشر جذر واحداً بشكل ذرّي (atomic).`,
      },
    },
    {
      type: "lab",
      id: "journal-replay",
      lang: "java",
      prompt: {
        en: `Write the **recovery step** of a journaling file system: replay committed transactions and discard the rest.

**Input:**
- Line 1: the disk as it was before the journal was written: one word per block, block 0 first
- Then the journal records that survived the crash, one per line:
  - \`begin T\`: transaction T starts
  - \`write T B VALUE\`: T will set block B (0-based) to VALUE
  - \`commit T\`: T's commit record reached the disk
- The journal is well formed: every \`write\` and \`commit\` names a transaction that has begun, and none commits twice. Transactions may interleave. Blank lines are ignored.

**Recovery rule:** apply the writes of every **committed** transaction, transaction by transaction **in commit order**, each one's writes in journal order. Transactions without a commit record are discarded.

**Output:** three lines:

\`\`\`
replayed: <ids in commit order, or none>
discarded: <ids of uncommitted transactions in begin order, or none>
disk: <every block after recovery>
\`\`\`

**Example:**

\`\`\`
a b c d
begin T1
write T1 0 A
write T1 2 C
commit T1
begin T2
write T2 1 B
\`\`\`

prints

\`\`\`
replayed: T1
discarded: T2
disk: A b C d
\`\`\``,
        ar: `اكتب **خطوة الاستعادة** في نظام ملفات ذي سجل يومي: أعد تنفيذ المعاملات الملتزَم بها وتخلّص من الباقي.

**المدخل:**
- السطر 1: القرص كما كان قبل الكتابة في السجل: كلمة لكل كتلة، بدءاً من الكتلة 0
- ثم سجلات السجل اليومي التي نجت من الانهيار، سجلاً في كل سطر:
  - \`begin T\`: تبدأ المعاملة T
  - \`write T B VALUE\`: ستضبط T الكتلة B (من الصفر) على VALUE
  - \`commit T\`: وصل سجل التزام T إلى القرص
- السجل سليم البنية: كل \`write\` و\`commit\` يسمّي معاملة بدأت، ولا تلتزم أي معاملة مرتين. وقد تتداخل المعاملات. وتُتجاهل الأسطر الفارغة.

**قاعدة الاستعادة:** طبّق كتابات كل معاملة **ملتزَم بها**، معاملة تلو معاملة **بترتيب الالتزام**، وكتابات كل منها بترتيب السجل. والمعاملات التي ليس لها سجل التزام تُهمَل.

**المخرج:** ثلاثة أسطر:

\`\`\`
replayed: <ids in commit order, or none>
discarded: <ids of uncommitted transactions in begin order, or none>
disk: <every block after recovery>
\`\`\`

**مثال:**

\`\`\`
a b c d
begin T1
write T1 0 A
write T1 2 C
commit T1
begin T2
write T2 1 B
\`\`\`

يطبع

\`\`\`
replayed: T1
discarded: T2
disk: A b C d
\`\`\``,
      },
      starterCode: `import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String first = in.readLine();
        if (first == null) return;
        String[] disk = first.trim().split("\\\\s+");

        // Transaction id -> its logged writes {block, value}, in "begin" order.
        Map<String, List<String[]>> txs = new LinkedHashMap<>();
        List<String> committed = new ArrayList<>(); // in commit order

        String line;
        while ((line = in.readLine()) != null) {
            String[] p = line.trim().split("\\\\s+");
            if (p.length < 2) continue; // blank line
            // TODO 1: "begin T"          -> txs.put(T, new ArrayList<>())
            // TODO 2: "write T B VALUE"  -> remember {B, VALUE} in T's list
            // TODO 3: "commit T"         -> committed.add(T)
        }

        // TODO 4: for each committed id (in commit order) apply its writes to disk
        // TODO 5: the discarded ids are the begun transactions that never committed
        List<String> discarded = new ArrayList<>();

        System.out.println("replayed: " + (committed.isEmpty() ? "none" : String.join(" ", committed)));
        System.out.println("discarded: " + (discarded.isEmpty() ? "none" : String.join(" ", discarded)));
        System.out.println("disk: " + String.join(" ", disk));
    }
}
`,
      solution: `import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        String first = in.readLine();
        if (first == null) return;
        String[] disk = first.trim().split("\\\\s+");

        // Transaction id -> its logged writes {block, value}, in "begin" order.
        Map<String, List<String[]>> txs = new LinkedHashMap<>();
        List<String> committed = new ArrayList<>(); // in commit order

        String line;
        while ((line = in.readLine()) != null) {
            String[] p = line.trim().split("\\\\s+");
            if (p.length < 2) continue; // blank line
            switch (p[0]) {
                case "begin" -> txs.put(p[1], new ArrayList<>());
                case "write" -> txs.get(p[1]).add(new String[] {p[2], p[3]});
                case "commit" -> committed.add(p[1]);
                default -> { }
            }
        }

        // Redo: every committed transaction, in commit order. Uncommitted ones never happened.
        for (String id : committed) {
            for (String[] w : txs.get(id)) {
                disk[Integer.parseInt(w[0])] = w[1];
            }
        }
        List<String> discarded = new ArrayList<>();
        for (String id : txs.keySet()) {
            if (!committed.contains(id)) discarded.add(id);
        }

        System.out.println("replayed: " + (committed.isEmpty() ? "none" : String.join(" ", committed)));
        System.out.println("discarded: " + (discarded.isEmpty() ? "none" : String.join(" ", discarded)));
        System.out.println("disk: " + String.join(" ", disk));
    }
}
`,
      hints: [
        {
          en: "Collect first, apply later: while reading, only record the writes per transaction and the commit order. A transaction's writes must not touch the disk array until you know it committed.",
          ar: "اجمع أولاً وطبّق لاحقاً: أثناء القراءة سجّل فقط كتابات كل معاملة وترتيب الالتزام. ولا يجوز لكتابات معاملة أن تلمس مصفوفة القرص قبل أن تعرف أنها التزمت.",
        },
        {
          en: "A switch on p[0] handles the three record types. For write, store new String[] {p[2], p[3]} in txs.get(p[1]); Integer.parseInt turns the block number into an index later.",
          ar: "تعالج جملة switch على p[0] أنواع السجلات الثلاثة. في write خزّن new String[] {p[2], p[3]} في txs.get(p[1])؛ وتحوّل Integer.parseInt رقم الكتلة إلى فهرس لاحقاً.",
        },
        {
          en: "Replay by iterating over committed (commit order, not begin order), so when two transactions write the same block the one that committed last wins. LinkedHashMap keeps begin order for the discarded list.",
          ar: "أعد التنفيذ بالمرور على committed (ترتيب الالتزام لا ترتيب البدء)، فحين تكتب معاملتان الكتلة نفسها تفوز التي التزمت أخيراً. ويحافظ LinkedHashMap على ترتيب البدء لقائمة المهمَلة.",
        },
      ],
      tests: [
        {
          name: { en: "Example from the prompt", ar: "المثال من نص المسألة" },
          stdin: "a b c d\nbegin T1\nwrite T1 0 A\nwrite T1 2 C\ncommit T1\nbegin T2\nwrite T2 1 B\n",
          expected: "replayed: T1\ndiscarded: T2\ndisk: A b C d",
        },
        {
          name: { en: "Interleaved transactions: commit order decides", ar: "معاملات متداخلة: ترتيب الالتزام يحسم" },
          stdin: "free free free\nbegin t9\nbegin t3\nwrite t9 0 x\nwrite t3 0 y\ncommit t3\nwrite t9 1 z\ncommit t9\nbegin t4\nwrite t4 2 lost\n",
          expected: "replayed: t3 t9\ndiscarded: t4\ndisk: x z free",
        },
        {
          name: { en: "Crash before any commit", ar: "انهيار قبل أي التزام" },
          stdin: "old old\nbegin A\nwrite A 0 new\nbegin B\nwrite B 1 new\n",
          expected: "replayed: none\ndiscarded: A B\ndisk: old old",
        },
        {
          name: { en: "An empty journal", ar: "سجل فارغ" },
          stdin: "only\n",
          expected: "replayed: none\ndiscarded: none\ndisk: only",
        },
        {
          name: { en: "The same block twice in one transaction, and blank lines", ar: "الكتلة نفسها مرتين في معاملة واحدة مع أسطر فارغة" },
          stdin: "s0 s1 s2 s3 s4\nbegin m1\nwrite m1 4 first\n\nwrite m1 4 second\nwrite m1 0 head\ncommit m1\n\nbegin m2\ncommit m2\n",
          expected: "replayed: m1 m2\ndiscarded: none\ndisk: head s1 s2 s3 second",
        },
      ],
      sampleInput: "a b c d\nbegin T1\nwrite T1 0 A\ncommit T1\nbegin T2\nwrite T2 1 B\n",
    },
    {
      type: "text",
      body: {
        en: `## Choosing a Linux file system

- **ext4**: the default on Debian and Ubuntu. Mature, journaled, uses extents, can be grown and (offline) shrunk. A safe default for almost anything
- **XFS**: the default on Red Hat Enterprise Linux since version 7. Excellent with large files and many parallel writers; it can be grown but **not shrunk**
- **Btrfs**: copy-on-write with **snapshots**, **checksums** on data and metadata, compression and multi-disk support; the default on Fedora Workstation and openSUSE. More features, more to learn
- **ZFS** (through OpenZFS): similar ideas to Btrfs and popular on storage servers, but kept outside the mainline kernel because its CDDL license is considered incompatible with the GPL
- **tmpfs**: a file system in RAM (and swap), used for \`/run\` and \`/dev/shm\`; everything in it vanishes at reboot
- **FAT32 / exFAT**: for USB sticks and SD cards shared with other systems; no Unix permissions, and FAT32 cannot store a file of 4 GiB or more

\`df -hT\` shows each mounted file system with its type, and \`lsblk -f\` lists the disks and partitions underneath.`,
        ar: `## اختيار نظام ملفات في لينكس

- **ext4**: الافتراضي في Debian وUbuntu. ناضج وذو سجل يومي ويستخدم الامتدادات، ويمكن تكبيره وتصغيره (دون تركيب). خيار افتراضي آمن لكل شيء تقريباً
- **XFS**: الافتراضي في Red Hat Enterprise Linux منذ الإصدار 7. ممتاز مع الملفات الكبيرة والكتّاب المتوازين الكثر؛ ويمكن تكبيره **لا تصغيره**
- **Btrfs**: قائم على النسخ عند الكتابة مع **اللقطات (snapshots)** و**المجاميع الاختبارية (checksums)** للبيانات والبيانات الوصفية والضغط ودعم الأقراص المتعددة؛ وهو الافتراضي في Fedora Workstation وopenSUSE. ميزات أكثر وتعلّم أكثر
- **ZFS** (عبر OpenZFS): أفكار مشابهة لـ Btrfs ومنتشر على خوادم التخزين، لكنه يبقى خارج النواة الرئيسية لأن ترخيصه CDDL يُعدّ غير متوافق مع GPL
- **tmpfs**: نظام ملفات في الذاكرة RAM (ومنطقة التبديل swap)، يُستخدم لـ \`/run\` و\`/dev/shm\`؛ وكل ما فيه يختفي عند إعادة التشغيل
- **FAT32 / exFAT**: لذواكر USB وبطاقات SD المشتركة مع أنظمة أخرى؛ لا صلاحيات يونكس فيها، ولا يستطيع FAT32 تخزين ملف حجمه 4 GiB أو أكثر

يعرض \`df -hT\` كل نظام ملفات مركّب مع نوعه، ويسرد \`lsblk -f\` الأقراص والأقسام التي تحته.`,
      },
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "Where is a file's name stored?", ar: "أين يُخزَّن اسم الملف؟" },
          choices: [
            { en: "In the file's inode, next to its size", ar: "في inode الملف، بجانب حجمه" },
            { en: "In the superblock", ar: "في الكتلة الفائقة" },
            { en: "In a directory entry that maps the name to the inode number", ar: "في مدخل مجلد يربط الاسم برقم الـ inode" },
            { en: "In the first data block of the file", ar: "في أول كتلة بيانات من الملف" },
          ],
          answer: 2,
          explain: {
            en: "Inodes hold metadata and block locations but no name. Names are directory entries, which is exactly what makes hard links possible: two entries, one inode.",
            ar: "تحمل الـ inodes البيانات الوصفية ومواضع الكتل لكن لا اسم فيها. فالأسماء مداخل في المجلدات، وهذا بالضبط ما يجعل الروابط الصلبة ممكنة: مدخلان وinode واحد.",
          },
        },
        {
          q: {
            en: "With 4 KiB blocks, 4-byte block pointers and 12 direct pointers, which pointer leads to the block that holds byte 50,000 of a file?",
            ar: "مع كتل من 4 KiB ومؤشرات كتل من 4 بايت و12 مؤشراً مباشراً، أي مؤشر يقود إلى الكتلة التي تحوي البايت 50,000 من الملف؟",
          },
          choices: [
            { en: "direct[11]", ar: "direct[11]" },
            { en: "The first entry of the single indirect block", ar: "المدخل الأول في الكتلة غير المباشرة الأحادية" },
            { en: "The double indirect block", ar: "الكتلة غير المباشرة الثنائية" },
            { en: "direct[12]", ar: "direct[12]" },
          ],
          answer: 1,
          explain: {
            en: "50,000 / 4096 = 12 (integer division), so it is logical block 12. Direct pointers cover blocks 0-11 (bytes 0-49,151), so block 12 is entry 0 of the single indirect block. There is no direct[12].",
            ar: "50,000 / 4096 = 12 (قسمة صحيحة)، فهي الكتلة المنطقية 12. والمؤشرات المباشرة تغطي الكتل 0-11 (البايتات 0-49,151)، فالكتلة 12 هي المدخل 0 في الكتلة غير المباشرة الأحادية. ولا يوجد direct[12].",
          },
        },
        {
          q: {
            en: "You rm a 20 GB log file, but df shows no free space gained. What is the most likely cause?",
            ar: "حذفت بـ rm ملف سجلّ حجمه 20 GB، لكن df لا يُظهر أي مساحة حرّة إضافية. ما السبب الأرجح؟",
          },
          choices: [
            { en: "A running process still has the file open, so the inode is freed only when it closes it", ar: "ما تزال عملية عاملة تُبقي الملف مفتوحاً، فلا يتحرّر الـ inode إلا حين تغلقه" },
            { en: "rm only moves files to a trash folder", ar: "rm تنقل الملفات إلى مجلد المهملات فقط" },
            { en: "Linux frees disk space only at reboot", ar: "لينكس لا يحرّر مساحة القرص إلا عند إعادة التشغيل" },
            { en: "A symbolic link still points to the file", ar: "ما يزال رابط رمزي يشير إلى الملف" },
          ],
          answer: 0,
          explain: {
            en: "unlink() removed the last name, but an open file descriptor keeps the inode alive. Restart or reload the service (or find it with lsof +L1). A symlink would not keep it alive: it only stores a path. Another hard link would, though.",
            ar: "أزالت unlink() آخر اسم، لكن واصف ملف مفتوحاً يُبقي الـ inode حياً. أعد تشغيل الخدمة أو أعد تحميلها (أو اعثر عليها بـ lsof +L1). أما الرابط الرمزي فلا يُبقيه حياً: إنه يخزّن مساراً فقط. لكن رابطاً صلباً آخر كان سيُبقيه.",
          },
        },
        {
          q: { en: "What does a journaling file system do when it mounts after a crash?", ar: "ماذا يفعل نظام الملفات ذو السجل اليومي حين يُركَّب بعد انهيار؟" },
          choices: [
            { en: "Scans every inode and bitmap on the disk, like fsck", ar: "يمسح كل inode وخريطة بتّات على القرص، مثل fsck" },
            { en: "Restores the most recent snapshot", ar: "يستعيد أحدث لقطة" },
            { en: "Rolls back every write since the last boot", ar: "يتراجع عن كل كتابة منذ آخر إقلاع" },
            { en: "Replays the journaled transactions that have a commit record and discards incomplete ones", ar: "يعيد تنفيذ المعاملات المسجّلة التي لها سجل التزام ويتخلّص من غير المكتملة" },
          ],
          answer: 3,
          explain: {
            en: "Only the journal is read, so recovery is fast. A committed transaction is redone (even if it was already partly checkpointed, which is safe); an uncommitted one never reached its real location, so dropping it leaves the old consistent state.",
            ar: "لا يُقرأ إلا السجل، فتكون الاستعادة سريعة. والمعاملة الملتزَم بها يُعاد تنفيذها (حتى لو كانت قد ثُبّتت جزئياً، وهذا آمن)؛ أما غير الملتزَم بها فلم تصل قط إلى موضعها الحقيقي، فإهمالها يُبقي الحالة القديمة المتسقة.",
          },
        },
        {
          q: { en: "Which statement about symbolic links is true?", ar: "أي العبارات الآتية عن الروابط الرمزية صحيحة؟" },
          choices: [
            { en: "A symlink shares its target's inode and increases its link count", ar: "يشارك الرابط الرمزي هدفه الـ inode ويزيد عدد روابطه" },
            { en: "A symlink cannot point to a directory", ar: "لا يمكن للرابط الرمزي أن يشير إلى مجلد" },
            { en: "A symlink is a separate small file that stores a path, so it can dangle or point to another file system", ar: "الرابط الرمزي ملف صغير منفصل يخزّن مساراً، فيمكن أن يتعلّق أو يشير إلى نظام ملفات آخر" },
            { en: "Deleting the target also deletes every symlink to it", ar: "حذف الهدف يحذف معه كل رابط رمزي يشير إليه" },
          ],
          answer: 2,
          explain: {
            en: "A symlink has its own inode whose content is a path, resolved each time it is used. That flexibility (directories, other file systems) is also its weakness: if the target goes away, the link dangles. Sharing the inode describes a hard link.",
            ar: "للرابط الرمزي inode خاص به محتواه مسار يُحلَّل في كل مرة يُستخدم. وهذه المرونة (المجلدات وأنظمة الملفات الأخرى) هي نقطة ضعفه أيضاً: إن اختفى الهدف تعلّق الرابط. أما مشاركة الـ inode فهي وصف للرابط الصلب.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- A file system is a data structure on numbered blocks: **superblock**, **bitmaps**, **inode table**, **data blocks**
- An **inode** holds type, mode, owner, size, timestamps, the link count and the block map, but **not the name**; **directories** map names to inode numbers, and the root is inode 2 on ext2/3/4
- Blocks are found through **direct and indirect pointers** (48 KiB, 4 MiB, 4 GiB and 4 TiB reach with 4 KiB blocks) or, on ext4, **extents**
- A **hard link** is another name for the same inode; a **symbolic link** is a small file holding a path. Space is freed at **0 links and no open descriptors**
- The **page cache** absorbs reads and writes; \`fsync\` forces data to disk. **Journaling** (write-ahead logging) makes multi-block updates all-or-nothing, and ext4's default is \`data=ordered\`
- **ext4** is the safe default, **XFS** shines with big parallel workloads, **Btrfs** brings snapshots and checksums
- You wrote an inode block mapper, a links-and-inodes simulator and a journal recovery tool

**Practice:** on a Linux machine try \`stat\`, \`ls -li\`, \`ln\` and \`ln -s\` in a scratch directory, watch the link count change, and run \`df -hT\`. **Next:** virtualization and containers, where mount namespaces and layered file systems give every container its own view of the tree.`,
        ar: `## الخلاصة

- نظام الملفات بنية بيانات فوق كتل مرقّمة: **الكتلة الفائقة** و**خرائط البتّات** و**جدول الـ inodes** و**كتل البيانات**
- يحمل **الـ inode** النوع والصلاحيات والمالك والحجم والطوابع الزمنية وعدد الروابط وخريطة الكتل، لكن **لا يحمل الاسم**؛ و**المجلدات** تربط الأسماء بأرقام الـ inodes، والجذر هو الـ inode رقم 2 في ext2/3/4
- تُوجد الكتل عبر **المؤشرات المباشرة وغير المباشرة** (مدى 48 KiB و4 MiB و4 GiB و4 TiB مع كتل من 4 KiB) أو، في ext4، عبر **الامتدادات**
- **الرابط الصلب** اسم آخر للـ inode نفسه؛ و**الرابط الرمزي** ملف صغير يحمل مساراً. وتتحرّر المساحة عند **صفر روابط ودون واصفات مفتوحة**
- **ذاكرة الصفحات المخبئية** تمتص القراءات والكتابات؛ و\`fsync\` تُجبر البيانات على الوصول إلى القرص. و**السجل اليومي** (التسجيل المسبق للكتابة) يجعل التحديثات متعددة الكتل كلاً أو لا شيء، والوضع الافتراضي في ext4 هو \`data=ordered\`
- **ext4** هو الخيار الافتراضي الآمن، و**XFS** يتألق مع أحمال العمل الكبيرة المتوازية، و**Btrfs** يأتي باللقطات والمجاميع الاختبارية
- كتبت راسماً لكتل الـ inode ومحاكياً للروابط والـ inodes وأداة استعادة من السجل اليومي

**تدرّب:** على جهاز لينكس جرّب \`stat\` و\`ls -li\` و\`ln\` و\`ln -s\` في مجلد تجارب، وراقب تغيّر عدد الروابط، ونفّذ \`df -hT\`. **التالي:** المحاكاة الافتراضية والحاويات، حيث تمنح فضاءات أسماء التركيب (mount namespaces) وأنظمة الملفات الطبقية كل حاوية رؤيتها الخاصة للشجرة.`,
      },
    },
  ],
};
