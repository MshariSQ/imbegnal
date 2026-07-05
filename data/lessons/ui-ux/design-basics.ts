import type { Lesson } from "../types";

export const lesson: Lesson = {
  nodeId: "design-basics",
  title: { en: "Design Principles — Why Some Things Just Work", ar: "مبادئ التصميم — لماذا تنجح بعض الأشياء ببساطة" },
  estMinutes: 35,
  sections: [
    {
      type: "text",
      body: {
        en: `## What you'll learn

- The core principles behind every good design
- **Hierarchy, contrast, alignment, whitespace**
- Why "good design is invisible"
- You'll fix a badly-designed card with CSS`,
        ar: `## ماذا ستتعلم

- المبادئ الجوهرية خلف كل تصميم جيد
- **التسلسل الهرمي، التباين، المحاذاة، المساحة البيضاء**
- لماذا "التصميم الجيد غير مرئي"
- ستُصلح بطاقة سيئة التصميم بـ CSS`,
      },
    },
    {
      type: "text",
      body: {
        en: `## Good design is invisible 👁️

When a design is great, you don't notice it — you just find what you need effortlessly. You only notice design when it's *bad*: a confusing form, a button you can't find. **UX (User Experience) design** is making things work so smoothly they feel obvious. It's not about decoration; it's about clarity. A few principles do most of the work:

**1. Visual Hierarchy.** Your eye should instantly know what's most important. Big, bold, high-contrast = important; small, light = secondary. A page where *everything* shouts (all bold, all huge) is a page where nothing stands out. Guide the eye: title > subtitle > body > caption.

**2. Contrast.** Elements that are different should *look* clearly different. The most important button should pop against the background. Light-gray text on a white background may look elegant to you but is invisible to many users (this is also an accessibility issue — later lesson).

**3. Alignment.** Line things up. Invisible grid lines connecting elements make a layout feel calm and professional; random positions feel chaotic and amateur. When in doubt, align to a common edge.

**4. Whitespace (negative space).** The empty space *around* things. Beginners cram everything together to "use the space"; pros add breathing room. Whitespace isn't wasted — it groups related items, separates unrelated ones, and makes content readable. Apple's designs are famous for generous whitespace.

**5. Proximity.** Things that belong together should be close together; unrelated things should be apart. A label sitting right next to its input "belongs" to it; a caption far from its image looks orphaned.

Master these five and your interfaces immediately look more professional — no artistic talent required. Design is a *learnable skill*, mostly about applying principles consistently, not innate creativity.`,
        ar: `## التصميم الجيد غير مرئي 👁️

حين يكون التصميم رائعاً، لا تلاحظه — بل تجد ما تحتاجه بلا جهد. تلاحظ التصميم فقط حين يكون *سيئاً*: نموذج محيّر، زر لا تجده. **تصميم تجربة المستخدم (UX)** هو جعل الأشياء تعمل بسلاسة حتى تبدو بديهية. ليس عن الزخرفة؛ بل عن الوضوح. بضعة مبادئ تؤدي معظم العمل:

**1. التسلسل الهرمي البصري.** يجب أن تعرف عينك فوراً ما الأهم. كبير، عريض، عالي التباين = مهم؛ صغير، خفيف = ثانوي. صفحة يصرخ فيها *كل شيء* (كله عريض، كله ضخم) هي صفحة لا يبرز فيها شيء. وجّه العين: عنوان > عنوان فرعي > نص > تعليق.

**2. التباين.** العناصر المختلفة يجب أن *تبدو* مختلفة بوضوح. الزر الأهم يجب أن يبرز عن الخلفية. نص رمادي فاتح على خلفية بيضاء قد يبدو أنيقاً لك لكنه غير مرئي لكثير من المستخدمين (وهذه أيضاً مسألة وصول — درس لاحق).

**3. المحاذاة.** نظّم الأشياء في خط. خطوط شبكة خفية تربط العناصر تجعل التخطيط هادئاً واحترافياً؛ والمواضع العشوائية تبدو فوضوية وهاوية. عند الشك، حاذِ إلى حافة مشتركة.

**4. المساحة البيضاء (الفراغ).** المساحة الفارغة *حول* الأشياء. المبتدئون يحشرون كل شيء "لاستغلال المساحة"؛ والمحترفون يضيفون مساحة تنفّس. المساحة البيضاء ليست مهدرة — تجمّع العناصر المترابطة، تفصل غير المترابطة، وتجعل المحتوى مقروءاً. تصاميم Apple شهيرة بمساحتها البيضاء السخية.

**5. التقارب.** ما ينتمي معاً يجب أن يكون قريباً؛ وغير المترابط بعيداً. تسمية بجوار حقلها "تنتمي" إليه؛ وتعليق بعيد عن صورته يبدو يتيماً.

أتقن هذه الخمسة فتبدو واجهاتك احترافية فوراً — بلا موهبة فنية. التصميم *مهارة قابلة للتعلّم*، معظمها تطبيق المبادئ باتساق، لا إبداع فطري.`,
      },
    },
    {
      type: "exercise",
      lang: "web",
      prompt: {
        en: `Apply hierarchy and whitespace. The card below has no visual hierarchy — everything is the same size and cramped. In the \`<style>\`, make:
1. \`.title\` bigger and bold — \`font-size\` at least \`24px\` and \`font-weight: bold\`
2. \`.card\` have breathing room — \`padding\` at least \`24px\``,
        ar: `طبّق التسلسل الهرمي والمساحة البيضاء. البطاقة أدناه بلا تسلسل بصري — كل شيء بنفس الحجم ومحشور. في \`<style>\`، اجعل:
1. \`.title\` أكبر وعريضاً — \`font-size\` لا يقل عن \`24px\` و\`font-weight: bold\`
2. \`.card\` لها مساحة تنفّس — \`padding\` لا يقل عن \`24px\``,
      },
      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; background: #f0f4f8; }
      .card { background: white; border-radius: 12px; }
      .title { }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="title">Premium Plan</div>
      <div class="price">$9/month</div>
      <div class="desc">Everything you need to get started.</div>
    </div>
  </body>
</html>`,
      solution: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; background: #f0f4f8; }
      .card { background: white; border-radius: 12px; padding: 28px; }
      .title { font-size: 26px; font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="title">Premium Plan</div>
      <div class="price">$9/month</div>
      <div class="desc">Everything you need to get started.</div>
    </div>
  </body>
</html>`,
      hints: [
        { en: `In .title add: font-size: 26px; font-weight: bold;`, ar: `في .title أضف: font-size: 26px; font-weight: bold;` },
        { en: `In .card add: padding: 28px; to give it breathing room.`, ar: `في .card أضف: padding: 28px; لمنحها مساحة تنفّس.` },
      ],
      tests: [
        { name: { en: "Title font-size ≥ 24px", ar: "حجم خط العنوان ≥ 24px" }, check: `parseFloat(getComputedStyle(document.querySelector(".title")).fontSize) >= 24` },
        { name: { en: "Title is bold", ar: "العنوان عريض" }, check: `(function(){ var w = getComputedStyle(document.querySelector(".title")).fontWeight; return w === "bold" || parseInt(w) >= 700; })()` },
        { name: { en: "Card padding ≥ 24px", ar: "مساحة البطاقة الداخلية ≥ 24px" }, check: `parseFloat(getComputedStyle(document.querySelector(".card")).paddingTop) >= 24` },
      ],
    },
    {
      type: "quiz",
      questions: [
        {
          q: { en: "What is visual hierarchy?", ar: "ما هو التسلسل الهرمي البصري؟" },
          choices: [
            { en: "Arranging elements so the eye sees the most important first", ar: "ترتيب العناصر لترى العين الأهم أولاً" },
            { en: "Making everything the same size", ar: "جعل كل شيء بنفس الحجم" },
            { en: "Using many colors", ar: "استخدام ألوان كثيرة" },
          ],
          answer: 0,
          explain: {
            en: "Size, weight, and contrast guide the eye: title > subtitle > body. If everything shouts, nothing stands out.",
            ar: "الحجم والوزن والتباين توجّه العين: عنوان > عنوان فرعي > نص. إن صرخ كل شيء، لا يبرز شيء.",
          },
        },
        {
          q: { en: "Whitespace (empty space) is…", ar: "المساحة البيضاء (الفراغ) هي…" },
          choices: [
            { en: "A tool that groups, separates, and improves readability", ar: "أداة تجمّع وتفصل وتحسّن القراءة" },
            { en: "Wasted space to always fill", ar: "مساحة مهدرة يجب ملؤها دائماً" },
            { en: "Only for printing", ar: "للطباعة فقط" },
          ],
          answer: 0,
          explain: {
            en: "Whitespace isn't emptiness to eliminate — it creates breathing room and structure. Pros use it generously.",
            ar: "المساحة البيضاء ليست فراغاً يُلغى — بل تخلق مساحة تنفّس وبنية. المحترفون يستخدمونها بسخاء.",
          },
        },
        {
          q: { en: "The principle of 'proximity' says…", ar: "مبدأ 'التقارب' يقول…" },
          choices: [
            { en: "Related items should be close; unrelated ones apart", ar: "العناصر المترابطة قريبة؛ وغير المترابطة بعيدة" },
            { en: "Everything should touch", ar: "كل شيء يجب أن يتلامس" },
            { en: "Spread everything evenly", ar: "وزّع كل شيء بالتساوي" },
          ],
          answer: 0,
          explain: {
            en: "Grouping by closeness signals relationship: a label next to its field belongs to it; distance implies separation.",
            ar: "التجميع بالقرب يشير للعلاقة: تسمية بجوار حقلها تنتمي إليه؛ والبُعد يعني الانفصال.",
          },
        },
      ],
    },
    {
      type: "text",
      body: {
        en: `## Summary

- Good UX is invisible — clarity over decoration
- Five principles: hierarchy, contrast, alignment, whitespace, proximity
- Design is a learnable skill, not innate talent
- You added hierarchy and whitespace to a real card

**Next:** Typography & Color — the two elements that most shape how a design feels.`,
        ar: `## الخلاصة

- UX الجيد غير مرئي — الوضوح قبل الزخرفة
- خمسة مبادئ: التسلسل، التباين، المحاذاة، المساحة البيضاء، التقارب
- التصميم مهارة قابلة للتعلّم، لا موهبة فطرية
- أضفت التسلسل والمساحة البيضاء لبطاقة حقيقية

**التالي:** الطباعة والألوان — العنصران الأكثر تشكيلاً لإحساس التصميم.`,
      },
    },
  ],
};
