/* =========================================================================
   I18N-STRINGS.JS — all translatable text in one place

   1) STATIC TEXT  (ar only)
      Keys match the data-i18n="..." attributes in the HTML files. The English
      text stays in the HTML itself, so only the Arabic version lives here.
      To translate a new piece of HTML text: add  data-i18n="my_key"  to the
      element, then add  my_key: "النص العربي"  below.

   2) JAVASCRIPT TEXT  (en + ar)
      Keys starting with "js.", "cart.", "wa." or "count." are used by the
      scripts through I18N.t("key") / I18N.plural("key", n). {name}, {n} ...
      are placeholders filled in by the code.

   Not here on purpose:
   - Category names / descriptions and brand tagline -> config.js (*_ar fields)
   - Product descriptions and subcategories          -> products-ar.js
   - Privacy Policy and Terms body text              -> legal-ar.js
   ========================================================================= */

/* ------------------------------------------------------------------------
   1) STATIC TEXT — Arabic
   ------------------------------------------------------------------------ */
I18N.add("ar", {
  /* page titles + meta descriptions */
  elio_elevating_aesthetic_excellence: "Elio — نرتقي بالتميّز في عالم التجميل",
  elio_is_a_curated_portfolio_of: "Elio مجموعة مختارة بعناية من منتجات التجميل والعناية الجمالية الاحترافية للعيادات ومتخصصي العناية بالبشرة.",
  products_elio: "المنتجات — Elio",
  browse_the_full_elio_professional_aesthetic: "تصفّح كتالوج Elio الكامل لمنتجات التجميل والعناية الجمالية الاحترافية.",
  your_cart_elio: "عربتك — Elio",
  review_the_products_you_ve_added: "راجع المنتجات التي أضفتها وأرسل طلبك إلى Elio.",
  about_us_elio: "من نحن — Elio",
  learn_about_elio_s_mission_values: "تعرّف على رسالة Elio وقيمها ونهجها في انتقاء منتجات التجميل الاحترافية.",
  contact_elio: "تواصل معنا — Elio",
  get_in_touch_with_elio_for: "تواصل مع Elio للحصول على معلومات المنتجات الاحترافية والاستفسارات.",
  privacy_policy_elio: "سياسة الخصوصية — Elio",
  how_elio_collects_uses_and_protects: "كيف تجمع Elio معلوماتك الشخصية وتستخدمها وتحميها عند تصفح الكتالوج وتقديم طلبات الشراء.",
  terms_conditions_elio: "الشروط والأحكام — Elio",
  the_terms_and_conditions_for_using: "الشروط والأحكام الخاصة باستخدام موقع Elio وطلب منتجات التجميل الاحترافية.",

  /* header / navigation / footer / shared */
  primary: "التنقل الرئيسي",
  mobile: "قائمة الجوال",
  open_menu: "فتح القائمة",
  home: "الرئيسية",
  products: "المنتجات",
  categories: "الأقسام",
  about_us: "من نحن",
  contact: "تواصل معنا",
  search_products: "ابحث في المنتجات",
  view_cart: "عرض العربة",
  back_to_top: "العودة للأعلى",
  quick_links: "روابط سريعة",
  privacy_policy: "سياسة الخصوصية",
  terms_conditions: "الشروط والأحكام",
  all_rights_reserved: "جميع الحقوق محفوظة.",
  contact_us: "تواصل معنا",
  view_all: "عرض الكل",
  view_all_products: "عرض كل المنتجات",

  /* search overlay */
  search_products_brands_categories: "ابحث عن منتجات أو علامات تجارية أو أقسام…",
  clear_search: "مسح البحث",
  close_search: "إغلاق البحث",
  start_typing_to_search_products_brands: "ابدأ الكتابة للبحث عن المنتجات والعلامات التجارية والأقسام.",

  /* home page */
  professional_aesthetic_treatment_room: "غرفة علاج تجميلي احترافية",
  professional_aesthetic_beauty_supply: "مستلزمات التجميل والعناية الجمالية الاحترافية",
  elevating_aesthetic_excellence: "نرتقي بالتميّز في عالم التجميل.",
  a_curated_portfolio_of_professional_grade: "مجموعة مختارة من منتجات التجميل والعناية الجمالية الاحترافية، اخترناها للعيادات والممارسين الذين يطلبون الدقة والجودة والخصوصية.",
  explore_products: "استكشف المنتجات",
  elio_in_numbers: "Elio بالأرقام",
  premium_products: "منتج مميز",
  trusted_brands: "علامة تجارية موثوقة",
  happy_customers: "عميل سعيد",
  expert_support: "دعم متخصص",
  featured_products: "منتجات مميزة",
  a_selection_currently_highlighted_across_our: "مختارات نسلّط عليها الضوء حاليًا في كتالوجنا الاحترافي.",
  our_categories: "أقسامنا",
  explore_our_professional_portfolio_by_treatment: "استكشف مجموعتنا الاحترافية حسب نوع العلاج.",
  previous_categories: "الأقسام السابقة",
  next_categories: "الأقسام التالية",
  why_choose_us: "لماذا تختارنا",
  a_supply_partner_built_around_precision: "شريك توريد قائم على الدقة لا على الكمية.",
  curated_product_portfolio: "مجموعة منتجات منتقاة",
  every_product_in_our_catalog_is: "كل منتج في كتالوجنا يُختار ليؤدي دورًا واضحًا ضمن قسمه، وليس لمجرد زيادة العدد.",
  professional_focus: "تركيز مهني",
  built_for_clinics_practitioners_and_skincare: "مصمم للعيادات والممارسين ومتخصصي العناية بالبشرة — وليس لتجارة التجزئة الاستهلاكية العامة.",
  quality_oriented_selection: "اختيار قائم على الجودة",
  products_are_chosen_with_an_emphasis: "تُختار المنتجات مع التركيز على جودة التركيبة وثباتها عبر مختلف الأقسام.",
  reliable_support: "دعم موثوق",
  a_responsive_team_ready_to_assist: "فريق سريع الاستجابة جاهز لمساعدتك في معلومات المنتجات وأسئلة الطلب.",
  let_s_talk_about_your_product: "دعنا نتحدث عن احتياجاتك من المنتجات.",
  reach_out_for_product_information_availability: "تواصل معنا لمعرفة معلومات المنتجات وتوفرها، أو لمناقشة طلب احترافي.",

  /* products page */
  professional_product_catalog: "كتالوج المنتجات الاحترافي",
  browse_our_full_portfolio_across_dermal: "تصفّح مجموعتنا الكاملة من الفيلر والمنتجات القابلة للحقن ومعززات البشرة والعناية الاحترافية بالبشرة وأدوات التجميل ومعدات التجميل الطبي.",
  search_products_brands_tags: "ابحث عن منتجات أو علامات تجارية أو وسوم…",
  filters: "الفلاتر",
  close_filters: "إغلاق الفلاتر",
  category: "القسم",
  brand: "العلامة التجارية",
  highlights: "أبرز المنتجات",
  featured_only: "المميزة فقط",
  bestsellers_only: "الأكثر مبيعًا فقط",
  clear_all_filters: "مسح كل الفلاتر",
  sort_featured: "الترتيب: المميز",
  sort_newest: "الترتيب: الأحدث",
  sort_a_z: "الترتيب: من A إلى Z",
  sort_z_a: "الترتيب: من Z إلى A",
  show_results: "عرض النتائج",
  can_t_find_what_you_re: "لا تجد ما تبحث عنه، أو تحتاج مزيدًا من المعلومات عن طلب احترافي؟",

  /* cart page */
  cart: "العربة",
  your_cart: "عربتك",
  loading_your_cart: "جارٍ تحميل عربتك…",
  your_next_favorite_product_is_waiting: "منتجك المفضل التالي في انتظارك..",
  browse_the_catalog_and_tap_the: "تصفّح الكتالوج واضغط على أيقونة العربة في أي منتج لإضافته هنا.",
  browse_products: "تصفّح المنتجات",
  order_summary: "ملخص الطلب",
  subtotal: "المجموع الفرعي",
  discount: "الخصم",
  total: "الإجمالي",
  your_details: "بياناتك",
  full_name: "الاسم الكامل",
  phone_whatsapp: "الهاتف / واتساب",
  email: "البريد الإلكتروني",
  delivery_address: "عنوان التوصيل",
  notes: "ملاحظات",
  optional: "(اختياري)",
  request_via_whatsapp: "اطلب عبر واتساب",
  your_order_details_are_sent_to: "تُرسل تفاصيل طلبك إلى فريقنا عبر واتساب، وسنؤكد معك التوفر والتوصيل.",
  continue_shopping: "متابعة التسوق",

  /* about page */
  elio_product_curation_process: "عملية انتقاء المنتجات في Elio",
  a_supply_partner_shaped_by_the: "شريك توريد صاغه أسلوب عمل المتخصصين.",
  our_story: "قصتنا",
  elio_began_with_a_simple_observation: "بدأت Elio من ملاحظة بسيطة: كان المتخصصون في التجميل يضطرون للاختيار بين موردين يخدمون تجارة التجزئة الفاخرة وموردين يخدمون التوزيع الطبي، ونادرًا ما يجدون الاثنين معًا. فبنينا مجموعة واحدة — الفيلر والمنتجات القابلة للحقن ومعززات البشرة والعناية الاحترافية بالبشرة وأدوات التجميل ومعدات التجميل الطبي — منظَّمة وفق طريقة عمل العيادة الفعلية.",
  we_re_happy_to_answer_questions: "يسعدنا الرد على أسئلتك حول مجموعتنا أو طلب احترافي معيّن.",

  /* contact page */
  reach_out_for_professional_product_information: "تواصل معنا للحصول على معلومات المنتجات الاحترافية وتوفرها، أو لأي استفسار عام. يرد فريقنا عادةً خلال يوم عمل واحد.",
  get_in_touch: "راسلنا",
  phone: "الهاتف",
  whatsapp: "واتساب",
  message_us_on_whatsapp: "راسلنا على واتساب",
  location: "الموقع",
  hours: "ساعات العمل",
  map_location_placeholder_embed_your_map: "مكان مخصص للخريطة — أضف هنا خدمة الخرائط التي تفضلها",

  /* privacy + terms (hero only; the body is in legal-ar.js) */
  how_we_collect_use_and_protect: "كيف نجمع معلوماتك ونستخدمها ونحميها عند استخدامك موقعنا.",
  the_terms_that_apply_when_you: "الشروط التي تنطبق عند تصفحك الكتالوج وتقديم طلب شراء."
});

/* ------------------------------------------------------------------------
   2) JAVASCRIPT TEXT — English
   ------------------------------------------------------------------------ */
I18N.add("en", {
  /* product cards + modal */
  "js.bestseller": "Bestseller",
  "js.featured": "Featured",
  "js.add_to_cart_aria": "Add {name} to cart",
  "js.view_product": "View Product",
  "js.empty_title": "No products matched your search.",
  "js.empty_body": "Try adjusting your filters or search terms.",
  "js.close_details": "Close product details",
  "js.thumb_alt": "{name} view {n}",
  "js.spec_brand": "Brand",
  "js.spec_category": "Category",
  "js.spec_subcategory": "Subcategory",
  "js.pro_notice": "For professional use only. Availability and use are subject to applicable regulations.",
  "js.request_info": "Request Product Information",
  "js.wa_info_msg": "I would like more information about: ",
  "js.add_to_cart": "Add to Cart",
  "js.added_to_cart": "Added to Cart",
  "js.browse": "Browse",

  /* prices */
  "price.on_request": "Price on request",
  "price.each": "{price} each",

  /* filters */
  "js.all_categories": "All Categories",
  "js.all_brands": "All Brands",
  "js.chip_search": "Search: \"{term}\"",
  "js.load_more": "Load More ({n} remaining)",
  "count.products.one": "{n} product",
  "count.products.other": "{n} products",

  /* global search */
  "search.hint": "Start typing to search products, brands and categories.",
  "search.none_title": "No products matched your search.",
  "search.none_body": "Try a different keyword, brand or category name.",
  "search.found.one": "{n} result found",
  "search.found.other": "{n} results found",
  "search.view_all": "View all {n} results",

  /* cart page */
  "cart.empty_count": "Your next favorite product is waiting.",
  "cart.items.one": "{n} item in your cart",
  "cart.items.other": "{n} items in your cart",
  "cart.unpriced.one": "{n} item is priced on request and not included in this total.",
  "cart.unpriced.other": "{n} items are priced on request and not included in this total.",
  "cart.qty_for": "Quantity for {name}",
  "cart.qty": "Quantity",
  "cart.dec": "Decrease quantity",
  "cart.inc": "Increase quantity",
  "cart.remove": "Remove",
  "cart.remove_aria": "Remove {name} from cart",
  "cart.err_name": "Please enter your full name.",
  "cart.err_phone": "Please enter a valid phone number (8–15 digits).",
  "cart.err_email": "Please enter a valid email address.",
  "cart.err_address": "Please enter your delivery address.",

  /* WhatsApp order message */
  "wa.hello": "Hello, I would like to place an order.",
  "wa.customer": "*Customer details*",
  "wa.name": "Name",
  "wa.phone": "Phone",
  "wa.email": "Email",
  "wa.address": "Address",
  "wa.notes": "Notes",
  "wa.order": "*Order*",
  "wa.discount": "Discount ({pct}%): -{amount}",
  "wa.total": "*Total: {amount}*",
  "wa.unpriced.one": " (+ {n} item priced on request)",
  "wa.unpriced.other": " (+ {n} items priced on request)",

  /* privacy page */
  "js.cleared": "Saved cart and checkout details cleared."
});

/* ------------------------------------------------------------------------
   3) JAVASCRIPT TEXT — Arabic
   ------------------------------------------------------------------------ */
I18N.add("ar", {
  "js.bestseller": "الأكثر مبيعًا",
  "js.featured": "مميز",
  "js.add_to_cart_aria": "أضف {name} إلى العربة",
  "js.view_product": "عرض المنتج",
  "js.empty_title": "لا توجد منتجات مطابقة لبحثك.",
  "js.empty_body": "جرّب تعديل الفلاتر أو كلمات البحث.",
  "js.close_details": "إغلاق تفاصيل المنتج",
  "js.thumb_alt": "{name} — صورة {n}",
  "js.spec_brand": "العلامة التجارية",
  "js.spec_category": "القسم",
  "js.spec_subcategory": "القسم الفرعي",
  "js.pro_notice": "للاستخدام المهني فقط. يخضع التوفر والاستخدام للوائح المعمول بها.",
  "js.request_info": "اطلب معلومات عن المنتج",
  "js.wa_info_msg": "أرغب في معلومات أكثر عن: ",
  "js.add_to_cart": "أضف إلى العربة",
  "js.added_to_cart": "تمت الإضافة إلى العربة",
  "js.browse": "تصفّح",

  "price.on_request": "السعر عند الطلب",
  "price.each": "{price} للقطعة",

  "js.all_categories": "كل الأقسام",
  "js.all_brands": "كل العلامات التجارية",
  "js.chip_search": "بحث: \"{term}\"",
  "js.load_more": "عرض المزيد ({n} متبقي)",
  "count.products.zero": "لا توجد منتجات",
  "count.products.one": "منتج واحد",
  "count.products.two": "منتجان",
  "count.products.few": "{n} منتجات",
  "count.products.other": "{n} منتج",

  "search.hint": "ابدأ الكتابة للبحث عن المنتجات والعلامات التجارية والأقسام.",
  "search.none_title": "لا توجد منتجات مطابقة لبحثك.",
  "search.none_body": "جرّب كلمة مختلفة أو اسم علامة تجارية أو قسم آخر.",
  "search.found.zero": "لا توجد نتائج",
  "search.found.one": "تم العثور على نتيجة واحدة",
  "search.found.two": "تم العثور على نتيجتين",
  "search.found.few": "تم العثور على {n} نتائج",
  "search.found.other": "تم العثور على {n} نتيجة",
  "search.view_all": "عرض كل النتائج ({n})",

  "cart.empty_count": "منتجك المفضل التالي في انتظارك.",
  "cart.items.zero": "عربتك فارغة",
  "cart.items.one": "منتج واحد في عربتك",
  "cart.items.two": "منتجان في عربتك",
  "cart.items.few": "{n} منتجات في عربتك",
  "cart.items.other": "{n} منتج في عربتك",
  "cart.unpriced.one": "منتج واحد سعره عند الطلب وغير محتسب ضمن هذا الإجمالي.",
  "cart.unpriced.two": "منتجان سعرهما عند الطلب وغير محتسبين ضمن هذا الإجمالي.",
  "cart.unpriced.few": "{n} منتجات أسعارها عند الطلب وغير محتسبة ضمن هذا الإجمالي.",
  "cart.unpriced.other": "{n} منتجًا أسعارها عند الطلب وغير محتسبة ضمن هذا الإجمالي.",
  "cart.qty_for": "الكمية لـ {name}",
  "cart.qty": "الكمية",
  "cart.dec": "تقليل الكمية",
  "cart.inc": "زيادة الكمية",
  "cart.remove": "إزالة",
  "cart.remove_aria": "إزالة {name} من العربة",
  "cart.err_name": "يرجى إدخال اسمك الكامل.",
  "cart.err_phone": "يرجى إدخال رقم هاتف صحيح (من 8 إلى 15 رقمًا).",
  "cart.err_email": "يرجى إدخال بريد إلكتروني صحيح.",
  "cart.err_address": "يرجى إدخال عنوان التوصيل.",

  "wa.hello": "مرحبًا، أرغب في تقديم طلب.",
  "wa.customer": "*بيانات العميل*",
  "wa.name": "الاسم",
  "wa.phone": "الهاتف",
  "wa.email": "البريد الإلكتروني",
  "wa.address": "العنوان",
  "wa.notes": "ملاحظات",
  "wa.order": "*الطلب*",
  "wa.discount": "الخصم ({pct}%): -{amount}",
  "wa.total": "*الإجمالي: {amount}*",
  "wa.unpriced.one": " (+ منتج واحد سعره عند الطلب)",
  "wa.unpriced.two": " (+ منتجان سعرهما عند الطلب)",
  "wa.unpriced.few": " (+ {n} منتجات أسعارها عند الطلب)",
  "wa.unpriced.other": " (+ {n} منتجًا أسعارها عند الطلب)",

  "js.cleared": "تم مسح العربة وبيانات إتمام الطلب المحفوظة."
});
