/* =========================================================================
   PRODUCTS-AR.JS
   Arabic text for the product catalog (shown when the site is in Arabic).

   Product NAMES and BRANDS stay in English on purpose.

   - PRODUCT_TEXT_AR.descriptions : English description  ->  Arabic description
   - PRODUCT_TEXT_AR.subcategories: English subcategory   ->  Arabic subcategory

   The lookup is by the exact English text, so a product you add later that
   reuses an existing description/subcategory is translated automatically.
   A product with new English text simply shows that English text until you
   add its Arabic line here. (products.js is left untouched, so
   manage-products.html can keep rewriting it safely.)
   ========================================================================= */
const PRODUCT_TEXT_AR = {
  descriptions: {
    "A standard-vial botulinum toxin type A formulation for the treatment of dynamic facial wrinkles and hyperhidrosis.":
      "تركيبة توكسين البوتولينيوم من النوع A (بوتوكس) في فيال قياسي لعلاج التجاعيد الديناميكية في الوجه وفرط التعرق.",
    "A 100-unit botulinum toxin type A vial formulated for precise treatment of dynamic wrinkles.":
      "فيال توكسين بوتولينيوم من النوع A (بوتوكس) سعة 100 وحدة، مصمم لعلاج دقيق للتجاعيد الديناميكية.",
    "A widely used botulinum toxin type A formulation for wrinkle treatment and management of excessive sweating.":
      "تركيبة توكسين بوتولينيوم من النوع A (بوتوكس) واسعة الاستخدام لعلاج التجاعيد والتحكم في التعرق المفرط.",
    "A botulinum toxin type A vial designed to smooth dynamic facial lines and refresh expression.":
      "فيال توكسين بوتولينيوم من النوع A (بوتوكس) مصمم لتنعيم خطوط الوجه الديناميكية وإضفاء مظهر أكثر انتعاشًا على التعبيرات.",
    "A 100-unit botulinum toxin type A formulation for dynamic wrinkle correction.":
      "تركيبة توكسين بوتولينيوم من النوع A (بوتوكس) سعة 100 وحدة لتصحيح التجاعيد الديناميكية.",
    "A hyaluronic-acid gel designed for facial and body volumizing and contouring.":
      "جل حمض الهيالورونيك (فيلر) مصمم لتعويض الحجم ونحت ملامح الوجه والجسم.",
    "A higher-volume hyaluronic-acid gel for facial and body contouring procedures.":
      "جل حمض الهيالورونيك (فيلر) بحجم أكبر لإجراءات نحت الوجه والجسم.",
    "A high-viscosity hyaluronic-acid filler intended for deep structural placement.":
      "فيلر حمض الهيالورونيك عالي اللزوجة، مخصص للحقن العميق لدعم بنية الوجه.",
    "A cohesive volumizing gel formulated for mid-face and structural support.":
      "جل متماسك لتعويض الحجم، مصمم لمنتصف الوجه والدعم البنيوي.",
    "A white-label hyaluronic-acid gel for facial contouring and body sculpting.":
      "جل حمض الهيالورونيك (وايت لابل) لنحت ملامح الوجه وتشكيل الجسم.",
    "A hyaluronic-acid gel formulated for definition of larger contouring areas.":
      "جل حمض الهيالورونيك مصمم لإبراز ملامح مناطق النحت الأكبر.",
    "A high-capacity volumizing hyaluronic-acid gel for facial and body use.":
      "جل حمض الهيالورونيك عالي السعة لتعويض الحجم، للاستخدام في الوجه والجسم.",
    "An extreme-density gel formulated for large-area contouring and definition.":
      "جل فائق الكثافة مصمم لنحت وإبراز المناطق الكبيرة.",
    "A medium-viscosity hyaluronic-acid filler for balanced volumizing results.":
      "فيلر حمض الهيالورونيك متوسط اللزوجة لنتائج متوازنة في تعويض الحجم.",
    "A high-viscosity hyaluronic-acid filler for structural definition.":
      "فيلر حمض الهيالورونيك عالي اللزوجة لإبراز الملامح الهيكلية.",
    "A dense hyaluronic-acid gel formulated for deep sub-dermal volumizing.":
      "جل حمض الهيالورونيك عالي الكثافة لتعويض الحجم في الطبقات العميقة تحت الأدمة.",
    "A standard-density hyaluronic-acid gel for general facial revitalization and fine-line improvement.":
      "جل حمض الهيالورونيك بكثافة قياسية لتنشيط الوجه بشكل عام وتحسين الخطوط الدقيقة.",
    "A high-density filler intended for revitalization and improvement of facial lines.":
      "فيلر عالي الكثافة مخصص لتنشيط البشرة وتحسين خطوط الوجه.",
    "A large-format hyaluronic-acid gel for body contouring and volumizing.":
      "جل حمض الهيالورونيك بعبوة كبيرة لنحت الجسم وتعويض الحجم.",
    "A large-format hyaluronic-acid gel for extensive body contouring procedures.":
      "جل حمض الهيالورونيك بعبوة كبيرة لإجراءات نحت الجسم الواسعة.",
    "A soft-density filler suited to superficial lines around the eyes and lips.":
      "فيلر ناعم الكثافة مناسب للخطوط السطحية حول العينين والشفاه.",
    "A medium-density filler for balanced facial revitalization.":
      "فيلر متوسط الكثافة لتنشيط متوازن لبشرة الوجه.",
    "A strong-density filler formulated for larger-area contouring and definition.":
      "فيلر قوي الكثافة مصمم لنحت وإبراز المناطق الأكبر.",
    "An implant-grade filler intended for deep structural placement.":
      "فيلر بدرجة الزرعات مخصص للحقن الهيكلي العميق.",
    "A deep-density hyaluronic-acid gel for superficial-to-deep line correction around the eyes and lips.":
      "جل حمض الهيالورونيك عميق الكثافة لتصحيح الخطوط من السطحية إلى العميقة حول العينين والشفاه.",
    "A poly-L-lactic acid (PLLA) biostimulator for gradual, long-lasting collagen stimulation.":
      "محفّز حيوي من حمض البولي-إل-لاكتيك (PLLA) لتحفيز الكولاجين تدريجيًا ولفترة طويلة.",
    "A PLLA-based biostimulator formulated for long-lasting collagen stimulation.":
      "محفّز حيوي قائم على PLLA لتحفيز الكولاجين لفترة طويلة.",
    "An intense-density hyaluronic-acid filler for pronounced volumizing and contouring.":
      "فيلر حمض الهيالورونيك مكثّف الكثافة لتعويض الحجم ونحت الملامح بشكل واضح.",
    "A hyaluronidase enzyme preparation used to dissolve hyaluronic-acid filler.":
      "مستحضر إنزيم الهيالورونيديز يُستخدم لإذابة فيلر حمض الهيالورونيك.",
    "A hyaluronic-acid gel designed for facial volumizing and contouring.":
      "جل حمض الهيالورونيك مصمم لتعويض حجم الوجه ونحت ملامحه.",
    "A hyaluronic-acid gel formulated for lip enhancement and superficial lines around the mouth.":
      "جل حمض الهيالورونيك مصمم لتحسين الشفاه وعلاج الخطوط السطحية حول الفم.",
    "A soft-formulation filler for superficial lines around the eyes and lips.":
      "فيلر بتركيبة ناعمة للخطوط السطحية حول العينين والشفاه.",
    "A deep-formulation filler for facial revitalization and line improvement.":
      "فيلر بتركيبة عميقة لتنشيط الوجه وتحسين الخطوط.",
    "A cohesive volumizing gel formulated for total-face contouring.":
      "جل متماسك لتعويض الحجم، مصمم لنحت الوجه بالكامل.",
    "A light-viscosity hyaluronic-acid gel for delicate facial areas.":
      "جل حمض الهيالورونيك خفيف اللزوجة لمناطق الوجه الحساسة.",
    "A long-lasting collagen-stimulating formulation for deep structural support.":
      "تركيبة محفّزة للكولاجين طويلة المفعول للدعم الهيكلي العميق.",
    "A volumizing hyaluronic-acid gel for facial and body contouring.":
      "جل حمض الهيالورونيك لتعويض الحجم ونحت الوجه والجسم.",
    "A calcium-hydroxyapatite formulation for structural volumizing and contouring.":
      "تركيبة هيدروكسي أباتيت الكالسيوم لتعويض الحجم البنيوي ونحت الملامح.",
    "A red-labeled volumizing hyaluronic-acid gel for facial contouring.":
      "جل حمض الهيالورونيك بالعبوة الحمراء لتعويض الحجم ونحت ملامح الوجه.",
    "A fine-viscosity filler formulated for superficial fine lines.":
      "فيلر دقيق اللزوجة مصمم للخطوط الدقيقة السطحية.",
    "A large-volume hyaluronic-acid gel for extensive body contouring.":
      "جل حمض الهيالورونيك بحجم كبير لنحت الجسم على نطاق واسع.",
    "A large-format body filler formulated for body contouring procedures.":
      "فيلر للجسم بعبوة كبيرة مصمم لإجراءات نحت الجسم.",
    "A fine-formulation hyaluronic-acid filler for delicate facial areas.":
      "فيلر حمض الهيالورونيك بتركيبة دقيقة لمناطق الوجه الحساسة.",
    "A deep-formulation hyaluronic-acid filler for structural volumizing.":
      "فيلر حمض الهيالورونيك بتركيبة عميقة لتعويض الحجم البنيوي.",
    "A dermal-layer hyaluronic-acid filler for mid-depth placement.":
      "فيلر حمض الهيالورونيك لطبقة الأدمة، للحقن بعمق متوسط.",
    "A hyaluronic-acid filler formulated specifically for lip enhancement.":
      "فيلر حمض الهيالورونيك مصمم خصيصًا لتحسين الشفاه.",
    "A large-format sub-skin hyaluronic-acid filler for body use.":
      "فيلر حمض الهيالورونيك بعبوة كبيرة لما تحت الجلد، للاستخدام في الجسم.",
    "A large-format deep hyaluronic-acid filler for body contouring.":
      "فيلر حمض الهيالورونيك عميق بعبوة كبيرة لنحت الجسم.",
    "A large-format dermal-layer hyaluronic-acid filler for body use.":
      "فيلر حمض الهيالورونيك لطبقة الأدمة بعبوة كبيرة، للاستخدام في الجسم.",
    "A large-format hyaluronic-acid body filler for extensive contouring.":
      "فيلر حمض الهيالورونيك للجسم بعبوة كبيرة لنحت الجسم على نطاق واسع.",
    "A concentrated hyaluronic-acid body filler for extensive contouring.":
      "فيلر حمض الهيالورونيك مركّز للجسم لنحت الجسم على نطاق واسع.",
    "A large-format concentrated hyaluronic-acid body filler.":
      "فيلر حمض الهيالورونيك مركّز للجسم بعبوة كبيرة.",
    "A hyaluronic-acid body filler formulated for body contouring.":
      "فيلر حمض الهيالورونيك للجسم مصمم لنحت الجسم.",
    "A poly-L-lactic acid biostimulator for long-lasting collagen stimulation.":
      "محفّز حيوي من حمض البولي-إل-لاكتيك لتحفيز الكولاجين لفترة طويلة.",
    "A calcium-hydroxyapatite filler for structural volumizing and contouring.":
      "فيلر هيدروكسي أباتيت الكالسيوم لتعويض الحجم البنيوي ونحت الملامح.",
    "An intra-articular hyaluronic-acid preparation for joint viscosupplementation.":
      "مستحضر حمض الهيالورونيك يُحقن داخل المفصل لتعويض لزوجة السائل المفصلي (Viscosupplementation).",
    "A large-format hyaluronic-acid gel for extensive body contouring.":
      "جل حمض الهيالورونيك بعبوة كبيرة لنحت الجسم على نطاق واسع.",
    "A large-format high-density hyaluronic-acid gel for body contouring.":
      "جل حمض الهيالورونيك عالي الكثافة بعبوة كبيرة لنحت الجسم.",
    "A cohesive volumizing gel formulated for structural facial support.":
      "جل متماسك لتعويض الحجم، مصمم للدعم الهيكلي للوجه.",
    "A high-volume gel formulated for extensive body contouring.":
      "جل بحجم عالٍ مصمم لنحت الجسم على نطاق واسع.",
    "A large-format body filler for contouring procedures.":
      "فيلر للجسم بعبوة كبيرة لإجراءات النحت.",
    "A large-format hyaluronic-acid gel for body volumizing and contouring.":
      "جل حمض الهيالورونيك بعبوة كبيرة لتعويض حجم الجسم ونحته.",
    "A structural collagen-stimulating formulation for long-lasting facial support.":
      "تركيبة هيكلية محفّزة للكولاجين لدعم الوجه لفترة طويلة.",
    "A sodium-hyaluronate skin booster formulated to support hydration and skin quality.":
      "معزز بشرة من هيالورونات الصوديوم مصمم لدعم الترطيب وجودة البشرة.",
    "An exosome-complex skin booster formulated to support skin revitalization.":
      "معزز بشرة بمركّب الإكسوسوم مصمم لدعم تنشيط البشرة وتجديد حيويتها.",
    "An active exosome preparation formulated for skin revitalization treatments.":
      "مستحضر إكسوسوم نشط مصمم لعلاجات تنشيط البشرة.",
    "A PDRN (polynucleotide) skin booster formulated to support skin repair and quality.":
      "معزز بشرة بـ PDRN (بولي نيوكليوتيد) مصمم لدعم إصلاح البشرة وتحسين جودتها.",
    "A succinic-acid and hyaluronic-acid complex formulated to support skin radiance.":
      "مركّب من حمض السكسينيك وحمض الهيالورونيك مصمم لدعم نضارة البشرة.",
    "A hydration-focused complex skin booster for improved skin moisture retention.":
      "معزز بشرة مركّب يركّز على الترطيب لتحسين احتفاظ البشرة بالرطوبة.",
    "A hyaluronic-acid and amino-acid complex formulated for long-lasting skin revitalization.":
      "مركّب من حمض الهيالورونيك والأحماض الأمينية لتنشيط البشرة لفترة طويلة.",
    "A pure hyaluronic-acid skin booster formulated for skin hydration and quality.":
      "معزز بشرة بحمض الهيالورونيك النقي لترطيب البشرة وتحسين جودتها.",
    "A multi-component starter kit for skin-booster treatment sessions.":
      "طقم بداية متعدد المكونات لجلسات علاج معززات البشرة.",
    "A hyaluronic-acid, amino-acid and peptide complex for skin revitalization.":
      "مركّب من حمض الهيالورونيك والأحماض الأمينية والببتيدات لتنشيط البشرة.",
    "A hyaluronic-acid skin booster available in clinic and multi-session formats.":
      "معزز بشرة بحمض الهيالورونيك متوفر بعبوات للعيادات وللجلسات المتعددة.",
    "A dual-molecular-weight (high and low HA) skin booster for layered hydration.":
      "معزز بشرة بوزنين جزيئيين (HA عالي ومنخفض) لترطيب متعدد الطبقات.",
    "A PDRN skin booster formulated to support skin repair and revitalization.":
      "معزز بشرة بـ PDRN مصمم لدعم إصلاح البشرة وتنشيطها.",
    "A type-I collagen powder formulated to support skin structure and quality.":
      "بودرة كولاجين من النوع الأول مصممة لدعم بنية البشرة وجودتها.",
    "A multi-active meso-booster complex for skin revitalization sessions.":
      "مركّب ميزو بوستر متعدد المكونات الفعالة لجلسات تنشيط البشرة.",
    "A PDRN and hyaluronic-acid complex formulated for skin rejuvenation.":
      "مركّب من PDRN وحمض الهيالورونيك مصمم لتجديد شباب البشرة.",
    "A cross-linked hyaluronic-acid skin booster for extended-duration hydration.":
      "معزز بشرة بحمض الهيالورونيك المتشابك لترطيب يدوم فترة أطول.",
    "A PDRN DNA-extract skin booster formulated to support skin repair.":
      "معزز بشرة بمستخلص DNA (PDRN) مصمم لدعم إصلاح البشرة.",
    "A concentrated hyaluronic-acid skin booster for professional use.":
      "معزز بشرة بحمض الهيالورونيك المركّز للاستخدام المهني.",
    "Whitening-focused stem-cell ampoules formulated for mesotherapy sessions.":
      "أمبولات الخلايا الجذعية لتفتيح البشرة، مصممة لجلسات الميزوثيرابي.",
    "A PDRN vial set formulated for mesotherapy revitalization sessions.":
      "مجموعة فيالات PDRN مصممة لجلسات الميزوثيرابي التنشيطية.",
    "A fullerene-complex vial set formulated for mesotherapy sessions.":
      "مجموعة فيالات بمركّب الفوليرين مصممة لجلسات الميزوثيرابي.",
    "A vitamin B12 vial set formulated for mesotherapy sessions.":
      "مجموعة فيالات فيتامين B12 مصممة لجلسات الميزوثيرابي.",
    "A glutathione vial set formulated for brightening mesotherapy sessions.":
      "مجموعة فيالات جلوتاثيون مصممة لجلسات الميزوثيرابي لتفتيح البشرة.",
    "A hyaluronic-acid and collagen vial set formulated for mesotherapy sessions.":
      "مجموعة فيالات حمض الهيالورونيك والكولاجين مصممة لجلسات الميزوثيرابي.",
    "A vitamin C vial set formulated for brightening mesotherapy sessions.":
      "مجموعة فيالات فيتامين C مصممة لجلسات الميزوثيرابي لتفتيح البشرة.",
    "An exosome-based whitening formula for brightening mesotherapy sessions.":
      "تركيبة تفتيح قائمة على الإكسوسوم لجلسات الميزوثيرابي لتفتيح البشرة.",
    "An exosome-based hair complex formulated for scalp mesotherapy sessions.":
      "مركّب للشعر قائم على الإكسوسوم مصمم لجلسات ميزوثيرابي فروة الرأس.",
    "An exosome-based formula formulated for acne-focused mesotherapy sessions.":
      "تركيبة قائمة على الإكسوسوم مصممة لجلسات الميزوثيرابي الموجّهة لحب الشباب.",
    "An exosome-based formula formulated for anti-aging mesotherapy sessions.":
      "تركيبة قائمة على الإكسوسوم مصممة لجلسات الميزوثيرابي لمقاومة الشيخوخة.",
    "An exosome-based repairing formula for post-procedure mesotherapy sessions.":
      "تركيبة إصلاح قائمة على الإكسوسوم لجلسات الميزوثيرابي بعد الإجراءات.",
    "A PDRN solution formulated for mesotherapy revitalization sessions.":
      "محلول PDRN مصمم لجلسات الميزوثيرابي التنشيطية.",
    "A hair-growth solution formulated for scalp mesotherapy sessions.":
      "محلول لتنمية الشعر مصمم لجلسات ميزوثيرابي فروة الرأس.",
    "Pure vitamin C ampoules formulated for brightening mesotherapy sessions.":
      "أمبولات فيتامين C النقي مصممة لجلسات الميزوثيرابي لتفتيح البشرة.",
    "Glutathione vials formulated for brightening mesotherapy sessions.":
      "فيالات جلوتاثيون مصممة لجلسات الميزوثيرابي لتفتيح البشرة.",
    "A multi-ingredient cocktail formulated for radiance-focused mesotherapy sessions.":
      "كوكتيل متعدد المكونات مصمم لجلسات الميزوثيرابي الهادفة إلى نضارة البشرة.",
    "A cold peeling-pack solution for surface skin renewal without downtime.":
      "محلول باقة التقشير البارد لتجديد سطح البشرة دون فترة نقاهة.",
    "A Luer-lock connector for use with injectable aesthetic products.":
      "وصلة لوير لوك للاستخدام مع المنتجات التجميلية القابلة للحقن.",
    "A micro-cannula for atraumatic delivery of dermal fillers and skin boosters.":
      "كانيولا دقيقة لحقن الفيلر ومعززات البشرة بأقل قدر من الصدمة للأنسجة.",
    "Fine disposable injection needles for precise aesthetic procedures.":
      "إبر حقن رفيعة للاستخدام الواحد للإجراءات التجميلية الدقيقة.",
    "A dermal filler designed for correcting medium wrinkles and adding balanced volume.":
      "فيلر مصمم لتصحيح التجاعيد المتوسطة وإضافة حجم متوازن.",
    "A dermal filler formulated for facial contouring, cheek volume, and jawline definition.":
      "فيلر مصمم لنحت ملامح الوجه، وتعويض حجم الخدين، وإبراز خط الفك.",
    "A lightweight dermal filler targeting fine lines and superficial wrinkles.":
      "فيلر خفيف يستهدف الخطوط الدقيقة والتجاعيد السطحية.",
    "A high-density dermal filler for deep structural support and facial sculpting.":
      "فيلر عالي الكثافة للدعم الهيكلي العميق ونحت الوجه.",
    "A specialized dermal filler created for lip augmentation, definition, and hydration.":
      "فيلر متخصص مصمم لتكبير الشفاه وتحديدها وترطيبها.",
    "A standard 100-unit botulinum toxin injection used to relax facial expression lines.":
      "حقنة توكسين بوتولينيوم (بوتوكس) قياسية سعة 100 وحدة تُستخدم لإرخاء خطوط التعبير في الوجه.",
    "A double-sized 200-unit botulinum toxin injection intended for larger treatment areas.":
      "حقنة توكسين بوتولينيوم (بوتوكس) بحجم مضاعف سعة 200 وحدة، مخصصة لمناطق العلاج الأكبر.",
  },
  subcategories: {
    "Standard Vial": "فيال قياسي",
    "Volumizing & Contouring": "تعويض الحجم والنحت",
    "High Viscosity": "لزوجة عالية",
    "Volumizer": "معوّض حجم",
    "Contour": "نحت الملامح",
    "Extreme Density": "كثافة فائقة",
    "Medium Viscosity": "لزوجة متوسطة",
    "Sub-Q": "تحت الجلد (Sub-Q)",
    "Standard Density": "كثافة قياسية",
    "High Density": "كثافة عالية",
    "Body Contouring": "نحت الجسم",
    "Soft Density": "كثافة ناعمة",
    "Medium Density": "كثافة متوسطة",
    "Strong Density": "كثافة قوية",
    "Implant Grade": "بدرجة الزرعات",
    "Deep Density": "كثافة عميقة",
    "Poly-L-Lactic Acid": "حمض البولي-إل-لاكتيك",
    "PLLA Bio-stimulator": "محفّز حيوي PLLA",
    "Intense HA Density": "كثافة HA مكثفة",
    "Hyaluronidase": "الهيالورونيديز",
    "Fine Lines": "الخطوط الدقيقة",
    "Revitalization": "التنشيط وتجديد الحيوية",
    "Light Viscosity": "لزوجة خفيفة",
    "Collagen Stimulator": "محفّز الكولاجين",
    "Calcium Hydroxyapatite": "هيدروكسي أباتيت الكالسيوم",
    "Volumizing HA": "HA لتعويض الحجم",
    "Fine Viscosity": "لزوجة دقيقة",
    "Large Volume": "حجم كبير",
    "Body Filler": "فيلر للجسم",
    "Fine": "دقيق",
    "Deep": "عميق",
    "Derm": "طبقة الأدمة",
    "Lips": "الشفاه",
    "Sub-Skin": "تحت الجلد",
    "Body": "الجسم",
    "PLLA Stimulator": "محفّز PLLA",
    "Intra-Articular": "داخل المفصل",
    "Volmatic": "Volmatic",
    "High Volume": "حجم عالٍ",
    "Ultra": "ألترا",
    "Structural": "هيكلي",
    "Sodium Hyaluronate": "هيالورونات الصوديوم",
    "Exosome Complex": "مركّب الإكسوسوم",
    "Exosomes": "الإكسوسومات",
    "PDRN Polynucleotide": "PDRN (بولي نيوكليوتيد)",
    "Succinic Acid + HA": "حمض السكسينيك + HA",
    "Super Hydra Complex": "مركّب سوبر هيدرا",
    "HA + Amino Acids": "HA + أحماض أمينية",
    "Pure HA": "HA نقي",
    "Starter Kit": "طقم البداية",
    "HA + Amino Acids + Peptides": "HA + أحماض أمينية + ببتيدات",
    "Skin Booster": "معزز البشرة",
    "High & Low HA": "HA عالي ومنخفض الوزن الجزيئي",
    "PDRN": "PDRN",
    "Type I Collagen Powder": "بودرة كولاجين النوع الأول",
    "Meso-Booster Complex": "مركّب ميزو بوستر",
    "PDRN + HA": "PDRN + HA",
    "Cross-Linked HA": "HA متشابك",
    "PDRN DNA Extract": "مستخلص DNA (PDRN)",
    "HA": "HA",
    "Stem Cell Ampoules": "أمبولات الخلايا الجذعية",
    "PDRN Vials": "فيالات PDRN",
    "Fullerene Vials": "فيالات الفوليرين",
    "Vitamin B12 Vials": "فيالات فيتامين B12",
    "Glutathione Vials": "فيالات الجلوتاثيون",
    "HA + Collagen Vials": "فيالات HA + كولاجين",
    "Vitamin C Vials": "فيالات فيتامين C",
    "Exosome Whitening Formula": "تركيبة الإكسوسوم للتفتيح",
    "Exosome Hair Complex": "مركّب الإكسوسوم للشعر",
    "Exosome Anti-Acne": "إكسوسوم لحب الشباب",
    "Exosome Anti-Aging": "إكسوسوم لمقاومة الشيخوخة",
    "Exosome Repairing": "إكسوسوم للإصلاح",
    "PDRN Solution": "محلول PDRN",
    "Hair Growth Solution": "محلول تنمية الشعر",
    "Vitamin C Ampoules": "أمبولات فيتامين C",
    "Glutathione": "الجلوتاثيون",
    "Multi-Ingredient Cocktail": "كوكتيل متعدد المكونات",
    "Peeling Solution": "محلول التقشير",
    "Connector": "وصلة",
    "Cannula": "كانيولا",
    "Needles": "إبر",
    "dermal-fillers": "فيلر",
    "botox": "بوتوكس",
  }
};
