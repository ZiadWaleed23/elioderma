/* =========================================================================
   CONFIG.JS
   Centralized, editable configuration for the entire site.
   Change the brand name, contact details, social links, categories and
   brand list here — every page and component reads from this one file.
   ========================================================================= */

const SITE_CONFIG = {

  // ---------------------------------------------------------------------
  // BRAND
  // ---------------------------------------------------------------------
  brand: {
    name: "Elio",
    tagline: "Elevating Aesthetic Excellence.",
    tagline_ar: "نرتقي بالتميّز في عالم التجميل.",
    shortDescription:
      "A curated portfolio of professional aesthetic and beauty products, selected for clinics and skincare professionals who expect more.",
    shortDescription_ar:
      "مجموعة مختارة من منتجات التجميل والعناية الجمالية الاحترافية، اخترناها للعيادات ومتخصصي العناية بالبشرة الذين يتطلعون إلى الأفضل.",
    logoLetter: "A" // used as a fallback mark if no image logo is supplied
  },

  // ---------------------------------------------------------------------
  // CONTACT & SOCIAL — placeholders, replace with real details
  // ---------------------------------------------------------------------
  contact: {
    email: "sales@elioderma.com",
    phone: "+201050208206",
    whatsapp: "+201050208206",
    whatsappLink: "https://wa.me/201050208206",
    location: "Hadaek Al-Ahram - 118",
    location_ar: "حدائق الأهرام - 118",
    hours: "Sun – Thu, 10 A.M – 10 P.M",
    hours_ar: "الأحد – الخميس، 10 ص – 10 م"
  },

  social: {
    instagram: "https://www.instagram.com/elioderma/",
    facebook: "https://www.facebook.com/elioderma",
    linkedin: "https://linkedin.com/company/elio"
  },

  // ---------------------------------------------------------------------
  // NAVIGATION CATEGORIES (used in mega-menu, footer, filters, homepage)
  // Add or edit entries here — every component that lists categories
  // reads from this array.
  // ---------------------------------------------------------------------
  categories: [
    {
      id: "botox",
      name: "Botulinum Toxin",
      name_ar: "توكسين البوتولينيوم (بوتوكس)",
      description: "Injectable neuromodulators for the treatment of dynamic wrinkles and hyperhidrosis.",
      description_ar: "مُعدِّلات عصبية قابلة للحقن لعلاج التجاعيد الديناميكية وفرط التعرق.",
      image: "https://beauty-vt.com/wp-content/uploads/2022/10/botulinum-toxin-in-aesthetic-medicine-everything-you-need-to-know.jpg"
    },
    {
      id: "dermal-fillers",
      name: "Dermal Fillers",
      name_ar: "الفيلر (حشوات الوجه)",
      description: "Hyaluronic-acid, PLLA and calcium-hydroxyapatite based volumizing and contouring formulations for professional aesthetic use.",
      description_ar: "تركيبات احترافية قائمة على حمض الهيالورونيك وPLLA وهيدروكسي أباتيت الكالسيوم لنفخ الحجم وتحديد ملامح الوجه.",
      image: "https://www.beautifi.com/wp-content/uploads/2021/12/23.-Dermal-Fillers.jpeg"
    },
    {
      id: "skin-boosters",
      name: "Skin Boosters",
      name_ar: "معززات البشرة (سكين بوسترز)",
      description: "Bio-revitalizing injectable treatments formulated to support skin hydration, quality and radiance.",
      description_ar: "علاجات حيوية قابلة للحقن تدعم ترطيب البشرة وجودتها ونضارتها.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4trJCcNqkFpDTco02n6IxH47gXrZXIWSbpBIIZ25vGw&s=10"
    },
    {
      id: "mesotherapy",
      name: "Mesotherapy",
      name_ar: "الميزوثيرابي",
      description: "Ampoules and vial complexes used in mesotherapy sessions for skin, hair and body revitalization.",
      description_ar: "أمبولات وفيالات مركّبة تُستخدم في جلسات الميزوثيرابي لتجديد البشرة والشعر والجسم.",
      image: "https://prp-london.com/images/mesotherapy-hair-scalp-london.webp"
    },
    {
      id: "cold-peeling",
      name: "Cold Peeling",
      name_ar: "التقشير البارد",
      description: "Non-thermal peeling solutions for surface renewal without downtime.",
      description_ar: "محاليل تقشير غير حرارية لتجديد سطح البشرة دون فترة نقاهة.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQUUmUEfkMGAmJM3CT8FPKWsl4Qhi8kcd5xgeFDodPT-b10iyniXKGi3I&s=10"
    },
    {
      id: "disposables",
      name: "Disposables & Accessories",
      name_ar: "المستلزمات والإكسسوارات",
      description: "Cannulas, needles and injection accessories for professional aesthetic procedures.",
      description_ar: "كانيولات وإبر وإكسسوارات حقن للإجراءات التجميلية الاحترافية.",
      image: "https://www.theaestheticsociety.org/sites/default/files/styles/tas_wide_l_3_2/public/content/hero/2021-09/_5ccc6e112986b.jpg?h=0ac13cd6&itok=4HxsfGQ0"
    }
  ],

  // ---------------------------------------------------------------------
  // BRANDS — "Selected Brands" section. Replace logo text with <img> tags
  // once real logos are available (see renderBrands() in app.js).
  // ---------------------------------------------------------------------
  brands: [
    { id: "refinex",       name: "REFINEX" },
    { id: "metox",         name: "METOX" },
    { id: "dysport",       name: "DYSPORT" },
    { id: "evetox",        name: "EVE TOX" },
    { id: "nabota",        name: "NABOTA" },
    { id: "demure",        name: "DEMURE" },
    { id: "dermofil",      name: "DERMOFIL" },
    { id: "hyamax",        name: "HYAMAX" },
    { id: "master-treat",  name: "MASTER TREAT" },
    { id: "audrey",        name: "AUDREY" },
    { id: "revolax",       name: "REVOLAX" },
    { id: "deneb",         name: "DENEB" },
    { id: "sedyfill",      name: "SEDYFILL" },
    { id: "celosome",      name: "CELOSOME" },
    { id: "sculptra",      name: "SCULPTRA" },
    { id: "olidia",        name: "OLIDIA" },
    { id: "vom",           name: "VOM" },
    { id: "premium",       name: "PREMIUM" },
    { id: "richesse",      name: "RICHESSE" },
    { id: "eptq",          name: "E.P.T.Q" },
    { id: "bella",         name: "BELLA" },
    { id: "hadurage",      name: "HADURAGE" },
    { id: "maxyfill",      name: "MAXYFILL" },
    { id: "bde-beaute",    name: "BDE BEAUTÉ" },
    { id: "hyaron",        name: "HYARON" },
    { id: "aqua",          name: "AQUA" },
    { id: "exo",           name: "EXO" },
    { id: "regloray",      name: "REGLORAY" },
    { id: "mesoheal",      name: "MESOHEAL" },
    { id: "rrs",           name: "RRS" },
    { id: "jalupro",       name: "JALUPRO" },
    { id: "nithya",        name: "NITHYA" },
    { id: "everline",      name: "EVERLINE" },
    { id: "kiara",         name: "KIARA" },
    { id: "remedium",      name: "REMEDIUM" },
    { id: "rablanca",      name: "RABLANCA" },
    { id: "medisupply",    name: "MEDISUPPLY" },
    { id: "clinic-select", name: "CLINIC SELECT" },
    { id: "reluma",        name: "Reluma" },
    { id: "axeniq",        name: "AxeniQ" },
  ],

  // ---------------------------------------------------------------------
  // CATALOG SETTINGS — tune performance/pagination behaviour here
  // ---------------------------------------------------------------------
  catalog: {
    productsPerPage: 12,     // number of cards revealed per "Load More" click
    gridPageInitial: 12      // number of cards rendered on first paint
  },

  // ---------------------------------------------------------------------
  // BULK DISCOUNT — subtotal discount that kicks in once the order
  // reaches "threshold". Change these two numbers only; the cart page
  // reads from here.
  // ---------------------------------------------------------------------
  discount: {
    threshold: 50000,   // order subtotal (EGP) needed to unlock the discount
    percent: 5           // % discount applied to the subtotal once unlocked
  },

  // ---------------------------------------------------------------------
  // ORDER SYNC — sends a copy of every order to an external endpoint
  // (e.g. a Google Sheets Web App) at the same time the WhatsApp message
  // is prepared. Set enabled to false to turn this off completely.
  // Paste the "Web app URL" you get after deploying the Apps Script
  // (see GOOGLE_SHEETS_SETUP.md) into webhookUrl below.
  // ---------------------------------------------------------------------
  orderSync: {
    enabled: true,
    webhookUrl: "https://script.google.com/macros/s/AKfycbweJljf289hmXqwMwPPQM3adOfLHVZOoRUiy5PPuIK0zxTdG99Adxx3FjJFqTkdhZ9nDQ/exec"
  }
};
