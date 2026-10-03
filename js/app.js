/* =========================================================================
   APP.JS
   Shared site behaviour: navigation, footer, product card rendering,
   product detail modal, cart, homepage sections, contact form.
   Runs on every page.
   ========================================================================= */

/* -------------------------------------------------------------------------
   Small helpers
   ------------------------------------------------------------------------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function getCategoryById(id) {
  return SITE_CONFIG.categories.find(c => c.id === id) || null;
}
function getBrandById(id) {
  const found = SITE_CONFIG.brands.find(b => b.id === id);
  return found ? found.name : id;
}

/* -------------------------------------------------------------------------
   Language helpers (the engine itself is js/i18n.js)
   Brand names and product names always stay in English.
   ------------------------------------------------------------------------- */
const t = (key, vars) => I18N.t(key, vars);

function catName(cat) { return cat ? I18N.loc(cat, "name") : ""; }
function catDescription(cat) { return cat ? I18N.loc(cat, "description") : ""; }

/* Arabic description / subcategory of a product (falls back to the English text) */
function productDescription(p) {
  if (I18N.isAr && typeof PRODUCT_TEXT_AR !== "undefined") {
    const ar = PRODUCT_TEXT_AR.descriptions[p.description];
    if (ar) return ar;
  }
  return p.description;
}
function productSubcategory(p) {
  if (I18N.isAr && typeof PRODUCT_TEXT_AR !== "undefined") {
    const ar = PRODUCT_TEXT_AR.subcategories[p.subcategory];
    if (ar) return ar;
  }
  return p.subcategory;
}

/* Text used by both search boxes. Always includes the Arabic names too, so
   Arabic keywords (e.g. "فيلر", "بوتوكس") work even if the page is in English. */
function productSearchText(p) {
  const cat = getCategoryById(p.category);
  const arSub = (typeof PRODUCT_TEXT_AR !== "undefined" && PRODUCT_TEXT_AR.subcategories[p.subcategory]) || "";
  const arDesc = (typeof PRODUCT_TEXT_AR !== "undefined" && PRODUCT_TEXT_AR.descriptions[p.description]) || "";
  return I18N.normalize([
    p.name, getBrandById(p.brand), p.category, p.subcategory, ...(p.tags || []),
    cat ? cat.name : "", cat ? (cat.name_ar || "") : "", arSub, arDesc
  ].join(" "));
}

/* -------------------------------------------------------------------------
   Cart (persisted in localStorage)
   ------------------------------------------------------------------------- */
const Cart = {
  KEY: "Elio_cart",
  MAX_QTY: 99,

  /* Storage format: { "<productId>": quantity }.
     Older visits stored a plain array of ids — that is migrated on read,
     so nobody's existing cart is lost. */
  _read() {
    let raw;
    try { raw = JSON.parse(localStorage.getItem(this.KEY)); } catch (e) { raw = null; }
    const map = Object.create(null);   // no inherited keys like "constructor"
    if (Array.isArray(raw)) {
      raw.forEach(id => { if (typeof id === "string") map[id] = (map[id] || 0) + 1; });
    } else if (raw && typeof raw === "object") {
      Object.keys(raw).forEach(id => {
        const q = Math.floor(Number(raw[id]));
        if (q > 0) map[id] = Math.min(q, this.MAX_QTY);
      });
    }
    return map;
  },
  _write(map) {
    try { localStorage.setItem(this.KEY, JSON.stringify(map)); } catch (e) { /* storage full / blocked */ }
    this.updateCount();
  },

  /* Product ids in the cart (same return shape as before) */
  get() { return Object.keys(this._read()); },
  /* [{ id, qty }] — used by the cart page */
  entries() { return Object.entries(this._read()).map(([id, qty]) => ({ id, qty })); },
  has(id) { return id in this._read(); },
  qty(id) { return this._read()[id] || 0; },
  totalQty() { return Object.values(this._read()).reduce((sum, q) => sum + q, 0); },

  /* Add/remove toggle used by the heart-style cart buttons on cards + modal */
  toggle(id) {
    const map = this._read();
    if (id in map) delete map[id];
    else map[id] = 1;
    this._write(map);
    return id in map;
  },
  setQty(id, qty) {
    const map = this._read();
    qty = Math.floor(Number(qty));
    if (!(id in map) || isNaN(qty)) return;
    if (qty < 1) qty = 1;                       // use remove() to delete
    map[id] = Math.min(qty, this.MAX_QTY);
    this._write(map);
  },
  remove(id) {
    const map = this._read();
    delete map[id];
    this._write(map);
  },
  clear() { this._write({}); },

  updateCount() {
    const count = this.totalQty();
    $$(".js-cart-count").forEach(el => {
      el.textContent = count;
      el.classList.toggle("is-visible", count > 0);
    });
  }
};

/* Keep the header counter in sync when the cart changes in another tab */
window.addEventListener("storage", e => {
  if (e.key === Cart.KEY) Cart.updateCount();
});

/* -------------------------------------------------------------------------
   Product card + detail markup builders
   Used by index.html (featured/bestsellers) and products.html (grid)
   ------------------------------------------------------------------------- */
/* Price line shared by cards and the product modal (prices live in prices.js) */
function priceMarkup(product, className) {
  if (typeof getPrice !== "function") return "";   // prices.js not loaded on this page
  const price = getPrice(product);
  return price === null
    ? `<p class="${className} ${className}--request">${formatPrice(null)}</p>`
    : `<p class="${className}">${formatPrice(price)}</p>`;
}

function buildProductCard(product) {
  const cat = getCategoryById(product.category);
  const brandName = getBrandById(product.brand);
  const inCart = Cart.has(product.id);
  const badge = product.bestseller
    ? `<span class="product-badge product-badge--bestseller">${t("js.bestseller")}</span>`
    : (product.featured ? `<span class="product-badge product-badge--featured">${t("js.featured")}</span>` : "");

  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.id = product.id;

  card.innerHTML = `
    <div class="product-card__media">
      <img src="${product.image}" alt="${product.name}" loading="lazy" width="700" height="860">
      ${badge}
      <button class="cart-btn ${inCart ? "is-active" : ""}" aria-pressed="${inCart}" aria-label="${t("js.add_to_cart_aria", { name: product.name })}" data-cart-id="${product.id}">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="9" cy="21" r="1.3"/><circle cx="18" cy="21" r="1.3"/><path d="M2.5 3h2.4l2.3 12.4a2 2 0 002 1.6h8.6a2 2 0 002-1.6L21 7H6"/></svg>
      </button>
    </div>
    <div class="product-card__body">
      <p class="product-card__eyebrow">${brandName} &nbsp;·&nbsp; ${catName(cat)}</p>
      <h3 class="product-card__title">${product.name}</h3>
      ${priceMarkup(product, "product-card__price")}
      <button class="btn btn--outline btn--small product-card__view" data-view-id="${product.id}">${t("js.view_product")}</button>
    </div>
  `;
  return card;
}

function renderProductGridInto(container, products, { emptyMessage } = {}) {
  container.innerHTML = "";
  if (!products.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      <p class="empty-state__title">${emptyMessage || t("js.empty_title")}</p>
      <p class="empty-state__body">${t("js.empty_body")}</p>
    `;
    container.appendChild(empty);
    return;
  }
  const frag = document.createDocumentFragment();
  products.forEach(p => frag.appendChild(buildProductCard(p)));
  container.appendChild(frag);
}

/* -------------------------------------------------------------------------
   Product detail modal
   ------------------------------------------------------------------------- */
function ensureModalScaffold() {
  if ($("#product-modal")) return;
  const modal = document.createElement("div");
  modal.id = "product-modal";
  modal.className = "modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="modal__backdrop" data-modal-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button class="modal__close" data-modal-close aria-label="${t("js.close_details")}">&times;</button>
      <div class="modal__content"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener("click", e => {
    if (e.target.hasAttribute("data-modal-close")) closeProductModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeProductModal();
  });
}

function openProductModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  ensureModalScaffold();
  const modal = $("#product-modal");
  const cat = getCategoryById(product.category);
  const brandName = getBrandById(product.brand);

  const gallery = [product.image, ...(product.gallery || [])];

  $(".modal__content", modal).innerHTML = `
    <div class="modal-product">
      <div class="modal-product__gallery">
        <div class="modal-product__main">
          <img src="${gallery[0]}" alt="${product.name}" id="modal-main-image" width="700" height="860">
        </div>
        ${gallery.length > 1 ? `
        <div class="modal-product__thumbs">
          ${gallery.map((g, i) => `<button class="modal-thumb ${i === 0 ? "is-active" : ""}" data-thumb-src="${g}"><img src="${g}" alt="${t("js.thumb_alt", { name: product.name, n: i + 1 })}"></button>`).join("")}
        </div>` : ""}
      </div>
      <div class="modal-product__info">
        <p class="modal-product__eyebrow">${brandName} &nbsp;·&nbsp; ${catName(cat)}</p>
        <h2 class="modal-product__title" id="modal-title">${product.name}</h2>
        ${priceMarkup(product, "modal-product__price")}
        <p class="modal-product__desc">${productDescription(product)}</p>

        <table class="modal-product__specs">
          <tbody>
            <tr><th>${t("js.spec_brand")}</th><td>${brandName}</td></tr>
            <tr><th>${t("js.spec_category")}</th><td>${catName(cat)}</td></tr>
            <tr><th>${t("js.spec_subcategory")}</th><td>${productSubcategory(product)}</td></tr>
          </tbody>
        </table>

        <p class="modal-product__notice">${t("js.pro_notice")}</p>

        <div class="modal-product__actions">
          <a href="${SITE_CONFIG.contact.whatsappLink}?text=${encodeURIComponent(t("js.wa_info_msg") + product.name)}" target="_blank" rel="noopener" class="btn btn--primary">${t("js.request_info")}</a>
          <button class="btn btn--outline cart-btn-inline ${Cart.has(product.id) ? "is-active" : ""}" data-cart-id="${product.id}">
            ${Cart.has(product.id) ? t("js.added_to_cart") : t("js.add_to_cart")}
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeProductModal() {
  const modal = $("#product-modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

/* Delegated clicks for "View Product", cart, and modal thumbnails/related */
document.addEventListener("click", e => {
  const viewBtn = e.target.closest("[data-view-id]");
  if (viewBtn) {
    openProductModal(viewBtn.dataset.viewId);
    return;
  }
  const cartBtn = e.target.closest("[data-cart-id]");
  if (cartBtn) {
    const isNowInCart = Cart.toggle(cartBtn.dataset.cartId);
    document.querySelectorAll(`[data-cart-id="${CSS.escape(cartBtn.dataset.cartId)}"]`).forEach(btn => {
      btn.classList.toggle("is-active", isNowInCart);
      if (btn.classList.contains("cart-btn-inline")) {
        btn.textContent = isNowInCart ? t("js.added_to_cart") : t("js.add_to_cart");
      }
      if (btn.hasAttribute("aria-pressed")) btn.setAttribute("aria-pressed", isNowInCart);
    });
    return;
  }
  const thumb = e.target.closest(".modal-thumb");
  if (thumb) {
    $$(".modal-thumb").forEach(t => t.classList.remove("is-active"));
    thumb.classList.add("is-active");
    $("#modal-main-image").src = thumb.dataset.thumbSrc;
  }
});

/* -------------------------------------------------------------------------
   Navigation: mobile menu, mega-menu, sticky shadow, back to top
   ------------------------------------------------------------------------- */
function initNavigation() {
  const header = $(".site-header");
  const menuToggle = $(".nav-toggle");
  const mobileMenu = $(".mobile-nav");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("no-scroll", isOpen);
    });
    $$(".mobile-nav a").forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
      });
    });
  }

  const megaTrigger = $(".nav-item--categories");
  if (megaTrigger) {
    megaTrigger.addEventListener("mouseenter", () => megaTrigger.classList.add("is-open"));
    megaTrigger.addEventListener("mouseleave", () => megaTrigger.classList.remove("is-open"));
    const link = $(".nav-item--categories > a");
    link.addEventListener("click", e => {
      if (window.innerWidth < 981) {
        e.preventDefault();
        megaTrigger.classList.toggle("is-open");
      }
    });
  }

  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const backToTop = $(".back-to-top");
  if (backToTop) {
    const toggleVisibility = () => backToTop.classList.toggle("is-visible", window.scrollY > 600);
    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  $$('a[href^="#"]').forEach(link => {
    link.addEventListener("click", e => {
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* -------------------------------------------------------------------------
   Populate nav categories mega-menu + footer categories (from config)
   ------------------------------------------------------------------------- */
function renderNavCategories() {
  $$(".js-nav-categories").forEach(container => {
    container.innerHTML = SITE_CONFIG.categories.map(cat => `
      <a href="products.html?category=${cat.id}" class="mega-menu__link">
        <span>${catName(cat)}</span>
      </a>
    `).join("");
  });
  $$(".js-footer-categories").forEach(container => {
    container.innerHTML = SITE_CONFIG.categories.slice(0, 4).map(cat => `
      <li><a href="products.html?category=${cat.id}">${catName(cat)}</a></li>
    `).join("");
  });
}

/* -------------------------------------------------------------------------
   Brand name / contact info injection (from config) — edit config.js only
   ------------------------------------------------------------------------- */
function injectBrandAndContact() {
  $$(".js-brand-name").forEach(el => el.textContent = SITE_CONFIG.brand.name);
  $$(".js-brand-tagline").forEach(el => el.textContent = I18N.loc(SITE_CONFIG.brand, "tagline"));
  $$(".js-brand-desc").forEach(el => el.textContent = I18N.loc(SITE_CONFIG.brand, "shortDescription"));
  $$(".js-contact-email").forEach(el => { el.textContent = SITE_CONFIG.contact.email; el.href = `mailto:${SITE_CONFIG.contact.email}`; });
  $$(".js-contact-phone").forEach(el => { el.textContent = SITE_CONFIG.contact.phone; el.href = `tel:${SITE_CONFIG.contact.phone.replace(/[^\d+]/g, "")}`; });
  $$(".js-contact-whatsapp").forEach(el => { el.href = SITE_CONFIG.contact.whatsappLink; });
  $$(".js-contact-location").forEach(el => el.textContent = I18N.loc(SITE_CONFIG.contact, "location"));
  $$(".js-contact-hours").forEach(el => el.textContent = I18N.loc(SITE_CONFIG.contact, "hours"));
  $$(".js-social-instagram").forEach(el => el.href = SITE_CONFIG.social.instagram);
  $$(".js-social-facebook").forEach(el => el.href = SITE_CONFIG.social.facebook);
  $$(".js-social-linkedin").forEach(el => el.href = SITE_CONFIG.social.linkedin);
  $$(".js-year").forEach(el => el.textContent = new Date().getFullYear());
}

/* -------------------------------------------------------------------------
   Homepage sections
   ------------------------------------------------------------------------- */
function renderFeaturedProducts() {
  const el = $("#featured-products-grid");
  if (!el) return;
  const items = PRODUCTS.filter(p => p.featured).slice(0, 4);
  renderProductGridInto(el, items);
}

function renderBestSellers() {
  const el = $("#bestsellers-grid");
  if (!el) return;
  const items = PRODUCTS.filter(p => p.bestseller).slice(0, 8);
  renderProductGridInto(el, items);
}

/* -------------------------------------------------------------------------
   Stats band: count-up when scrolled into view (homepage only)
   The final value is already in the HTML, so it still reads correctly
   without JS, with reduced-motion, or if IntersectionObserver is missing.
   ------------------------------------------------------------------------- */
function initStatsCounters() {
  const nums = $$("[data-count-to]");
  if (!nums.length) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  const animate = el => {
    // Read the number straight from the visible text, so editing the HTML is enough.
    const raw = el.dataset.countFinal || el.textContent.trim();
    el.dataset.countFinal = raw;
    const m = raw.match(/^([\d][\d,\.]*)(.*)$/);
    if (!m) return;
    const useCommas = m[1].includes(",");
    const target = parseFloat(m[1].replace(/,/g, ""));
    const suffix = m[2];
    if (isNaN(target)) return;
    const duration = 1600;
    const start = performance.now();
    const fmt = n => (useCommas ? n.toLocaleString("en-US") : String(n));
    const tick = now => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = raw;
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animate(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  nums.forEach(n => io.observe(n));
}

/* -------------------------------------------------------------------------
   Init
   ------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  injectBrandAndContact();
  renderNavCategories();
  initNavigation();
  Cart.updateCount();
  renderFeaturedProducts();
  renderBestSellers();
  initStatsCounters();
});