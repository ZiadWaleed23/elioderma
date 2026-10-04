# Elio — Professional Aesthetic Products Catalog & Ordering Website

**Version 2.4** · Bilingual (English / العربية) · Static front-end · No framework, no build step

Elio is a product-catalog and order-request website for a company that supplies professional aesthetic products (botulinum toxin, dermal fillers, skin boosters, mesotherapy, cold peeling and disposables) to clinics and skincare professionals in Egypt. Visitors browse the catalog, build a cart, and send their order through **WhatsApp**, while a copy of every order is automatically logged to a **Google Sheet** for tracking.

> نبذة
> : موقع كتالوج وطلبات لشركة منتجات تجميل احترافية (بوتوكس، فيلر، سكين بوسترز، ميزوثيرابي، تقشير بارد، مستلزمات). العميل بيتصفح المنتجات، يضيف للسلة، ويبعت الطلب على واتساب، وفي نفس الوقت الطلب بيتسجل تلقائيًا في Google Sheet لمتابعة الأوردرات. الموقع بيدعم العربي والإنجليزي (RTL/LTR).

---

## Features

**Storefront**
- Home page with hero, categories carousel, featured products and a "Selected Brands" section
- Product catalog with live search, category and brand filters, featured / bestseller filters, sorting, active-filter chips and "Load More" pagination
- Global search overlay (name, brand, category, tags) available from every page
- Product modal with gallery
- Persistent shopping cart (saved in `localStorage`) with quantity controls
- Automatic **bulk discount** (5% once the subtotal reaches EGP 50,000 — configurable)
- "Price on request" handling for products without a price
- Checkout through a pre-filled **WhatsApp** message; customer details are remembered for next time
- About, Contact, Privacy Policy and Terms pages

**Bilingual support**
- English ⇄ Arabic toggle with full **RTL** layout (`css/rtl.css`)
- Translated UI strings, categories, product descriptions and legal pages
- Language choice persisted between visits

**Order tracking (Google Sheets)**
- Every order is also POSTed to a Google Apps Script web app that writes a new row into an order-tracker sheet (status, customer, items, total, shipping fields, …)
- Can be switched off with one flag in `js/config.js`

**Admin tools (client-side)**
- `add-product.html` — form to add a product and generate its code
- `manage-products.html` — edit / delete products and export an updated `js/products.js`

**Polish**
- Custom "syringe" page loader (`js/loader.js`)
- Scroll-reveal animations and progress bar (`js/animations.js`), respecting `prefers-reduced-motion`
- Responsive design (mobile → desktop)

---

## Catalog at a glance

| Item | Count |
|---|---|
| Products | 119 |
| Brands | 40 |
| Categories | 6 — Botulinum Toxin, Dermal Fillers, Skin Boosters, Mesotherapy, Cold Peeling, Disposables & Accessories |
| Languages | 2 (English, Arabic) |

---

## Tech stack

- **HTML5**, **CSS3** (custom properties, responsive layout, RTL stylesheet)
- **Vanilla JavaScript (ES6+)** — no frameworks, no bundler
- **Google Apps Script** + **Google Sheets** for order logging
- **WhatsApp click-to-chat** (`wa.me`) for order submission
- Browser `localStorage` / `sessionStorage` for cart, customer details and language

---

## Project structure

```
.
├── index.html                  # Home page
├── products.html               # Catalog with filters/search/sort
├── cart.html                   # Cart + checkout form
├── about.html / contact.html
├── privacy.html / terms.html
├── add-product.html            # Admin: add a product
├── manage-products.html        # Admin: edit/delete products, export products.js
│
├── css/
│   ├── style.css               # Main styles
│   ├── responsive.css          # Breakpoints
│   ├── rtl.css                 # Arabic / RTL overrides
│   ├── hero-split.css
│   ├── categories-carousel.css
│   └── privacy.css / terms.css
│
├── js/
│   ├── config.js               # Brand, contact, categories, brands, discount, order sync
│   ├── products.js             # Product data (119 products)
│   ├── products-ar.js          # Arabic product descriptions / names
│   ├── prices.js               # Price & currency formatting
│   ├── app.js                  # Core: cart helper, rendering, modal, navigation
│   ├── cart.js                 # Cart page, checkout, WhatsApp message, order sync
│   ├── filters.js              # Catalog filtering / sorting / pagination
│   ├── search.js               # Global search overlay
│   ├── categories-carousel.js
│   ├── i18n.js / i18n-strings.js / legal-ar.js   # Internationalisation
│   ├── loader.js               # Syringe page loader
│   ├── animations.js           # Scroll reveal & micro-interactions
│   └── privacy.js / terms.js
│
├── img/                        # Logo and hero image
└── google-apps-script/
    ├── Code.gs                 # Apps Script web app that receives orders
    ├── Elio_Orders.xlsx        # Ready-made order tracker sheet
    └── GOOGLE_SHEETS_SETUP.md  # Step-by-step setup guide (Arabic)
```

---

## Getting started

No installation is required — it is a static site.

```bash
# Option 1: just open index.html in a browser

# Option 2: serve it locally
python3 -m http.server 8000
# then visit http://localhost:8000
```

### Configuration

Almost everything is edited in **`js/config.js`**:

| Setting | Purpose |
|---|---|
| `brand` | Name, tagline, short description (EN + AR) |
| `contact` | Email, phone, WhatsApp number/link, address, working hours |
| `social` | Instagram / Facebook / LinkedIn links |
| `categories` | Categories shown in menus, filters and home page |
| `brands` | "Selected Brands" list |
| `catalog` | Products per page / initial page size |
| `discount` | Bulk discount threshold and percentage |
| `orderSync` | Enable/disable Google Sheets logging and set the web-app URL |

### Managing products

1. Open `manage-products.html` (or `add-product.html`) in a browser.
2. Add / edit products.
3. Export the generated `js/products.js` and replace the file on the server.

Product shape:

```js
{
  id: "refinex-botx-100",
  name: "REFINEX Botulinum Toxin (100 Units)",
  brand: "refinex",
  category: "botox",
  subcategory: "Standard Vial",
  price: 1100,              // 0 = "Price on request"
  description: "...",
  image: "...",
  gallery: ["..."],
  featured: true,
  bestseller: true,
  dateAdded: "2026-01-10",
  tags: ["botox", "toxin"]
}
```

### Google Sheets order sync

See [`google-apps-script/GOOGLE_SHEETS_SETUP.md`](google-apps-script/GOOGLE_SHEETS_SETUP.md). In short: import `Elio_Orders.xlsx` into Google Sheets → paste `Code.gs` into Apps Script → deploy as a Web App → paste the URL into `orderSync.webhookUrl` in `js/config.js`.

---

## How an order flows

```
Customer adds products → Cart (localStorage)
        │
        ▼
 Checkout form (name, phone, email, address, notes)
        │
        ├──► WhatsApp opens with a ready-made order message
        └──► Same order is POSTed (JSON) to Google Apps Script
                     └──► New row in the "Orders" sheet, status = "New order"
```

---

## Author

**Ziad Waleed** — Frontend Web Developer and sole author of this project.

- GitHub: [github.com/ZiadWaleed23](https://github.com/ZiadWaleed23)
- LinkedIn: [linkedin.com/in/ziad-waleed-elkon](https://www.linkedin.com/in/ziad-waleed-elkon/)

Designed, developed and maintained by me, including: UI/UX design, the catalog and filtering logic, cart and checkout, the bilingual (EN/AR + RTL) system, the page loader and animations, the admin tools for managing products, and the Google Sheets order-tracking integration.

### Version history

| Version | Notes |
|---|---|
| V2.3 | Catalog, cart, WhatsApp checkout, admin tools |
| V2.4 | Bilingual EN/AR with RTL, Google Sheets order sync, loader and animations, bulk discount |

*(Adjust dates and notes to match your real history.)*

---

## License & ownership

© 2026 Ziad Waleed. All rights reserved.
The source code, design and structure of this project were created by the author above. Product names, brand names and trademarks belong to their respective owners. Reuse or redistribution of the code requires the author's written permission.
