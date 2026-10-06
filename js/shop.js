/* =========================================================================
   SHOP.JS — Products page (elio-store layout)

   Replaces filters.js on products.html (the catalog: filters, grid, sorting).
   The product pop-up and the cart drawer live in shop-ui.js. Reuses the
   site's shared pieces so nothing else has to change:
     - PRODUCTS / SITE_CONFIG / getPrice / formatPrice  (data, prices)
     - Cart (app.js, localStorage "Elio_cart")  -> the header counter always
       matches the side drawer
     - I18N / t()  -> English + Arabic (RTL)

   Features: search, category / brand / price / highlight filters, sorting,
   "load more", product pop-up (with gallery), side cart drawer and the
   "Send order on WhatsApp" button.
   URL params understood: ?category=  ?brand=  ?search=  ?view=<product id>
   ========================================================================= */

/* i18n.js keeps the visitor's category + search when switching language by
   reading Catalog.state on this page — this tiny shim keeps that working. */
const Catalog = {
  get state() {
    const s = Shop.state;
    return { category: s.cats.length === 1 ? s.cats[0] : "all", search: s.q };
  }
};

const Shop = {
  state: {
    q: "", cats: [], brands: [], min: null, max: null,
    featured: false, best: false, sort: "featured",
    shown: SITE_CONFIG.catalog.gridPageInitial
  },
  byId: Object.create(null),

  /* ------------------------------------------------------------------ */
  esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  },

  init() {
    if (!$("#esGrid")) return;
    PRODUCTS.forEach(p => { this.byId[p.id] = p; });

    this.applyUrlParams();
    this.renderFilterOptions();
    this.syncControls();
    this.bindEvents();
    this.render();

    const view = new URLSearchParams(location.search).get("view");
    if (view && this.byId[view]) ShopUI.openModal(view);
  },

  applyUrlParams() {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    const brand = params.get("brand");
    const search = params.get("search");
    if (cat && SITE_CONFIG.categories.some(c => c.id === cat)) this.state.cats = [cat];
    if (brand && PRODUCTS.some(p => p.brand === brand)) this.state.brands = [brand];
    if (search) this.state.q = search;
  },

  /* ------------------------------------------------------------------ */
  /* Filters                                                             */
  /* ------------------------------------------------------------------ */
  renderFilterOptions() {
    const cc = {}, bc = {};
    PRODUCTS.forEach(p => {
      cc[p.category] = (cc[p.category] || 0) + 1;
      bc[p.brand] = (bc[p.brand] || 0) + 1;
    });

    $("#esCats").innerHTML = SITE_CONFIG.categories.filter(c => cc[c.id]).map(c => `
      <label class="es-check"><input type="checkbox" data-es-cat="${this.esc(c.id)}">
        <span>${this.esc(catName(c))}</span><span class="es-c">${cc[c.id]}</span></label>`).join("");

    /* brands from config + any brand used by a product but missing from config */
    const brands = SITE_CONFIG.brands.filter(b => bc[b.id]);
    Object.keys(bc).forEach(id => { if (!brands.some(b => b.id === id)) brands.push({ id, name: id }); });
    $("#esBrands").innerHTML = brands.map(b => `
      <label class="es-check"><input type="checkbox" data-es-brand="${this.esc(b.id)}">
        <span>${this.esc(b.name)}</span><span class="es-c">${bc[b.id]}</span></label>`).join("");

    const cur = PRICE_IS_AR ? PRICE_CONFIG.currencyAr : PRICE_CONFIG.currency;
    $("#esPriceTitle").textContent = t("shop.price", { cur });
  },

  syncControls() {
    const s = this.state;
    $$("[data-es-cat]").forEach(el => { el.checked = s.cats.includes(el.dataset.esCat); });
    $$("[data-es-brand]").forEach(el => { el.checked = s.brands.includes(el.dataset.esBrand); });
    $("#esFeatured").checked = s.featured;
    $("#esBest").checked = s.best;
    $("#esMin").value = s.min === null ? "" : s.min;
    $("#esMax").value = s.max === null ? "" : s.max;
    $("#esSearch").value = s.q;
    $("#esSort").value = s.sort;
  },

  getFiltered() {
    const s = this.state;
    const term = I18N.normalize(s.q.trim());

    const list = PRODUCTS.filter(p => {
      if (s.cats.length && !s.cats.includes(p.category)) return false;
      if (s.brands.length && !s.brands.includes(p.brand)) return false;
      if (s.featured && !p.featured) return false;
      if (s.best && !p.bestseller) return false;
      if (s.min !== null || s.max !== null) {
        const price = getPrice(p);
        if (price === null) return false;            // "price on request" can't match a price range
        if (s.min !== null && price < s.min) return false;
        if (s.max !== null && price > s.max) return false;
      }
      if (term && !productSearchText(p).includes(term)) return false;
      return true;
    });

    const byPrice = dir => (a, b) => {
      const pa = getPrice(a), pb = getPrice(b);
      if (pa === null && pb === null) return 0;
      if (pa === null) return 1;                     // unpriced always last
      if (pb === null) return -1;
      return (pa - pb) * dir;
    };

    switch (s.sort) {
      case "newest":     list.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)); break;
      case "price-asc":  list.sort(byPrice(1)); break;
      case "price-desc": list.sort(byPrice(-1)); break;
      case "name":       list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default:           list.sort((a, b) => (Number(!!b.featured) - Number(!!a.featured)) || (Number(!!b.bestseller) - Number(!!a.bestseller)));
    }
    return list;
  },

  resetShown() {
    this.state.shown = SITE_CONFIG.catalog.gridPageInitial;
    this.render();
  },

  /* ------------------------------------------------------------------ */
  /* Grid                                                                */
  /* ------------------------------------------------------------------ */
  priceHtml(p, cls) {
    const price = getPrice(p);
    return price === null
      ? `<span class="${cls} ${cls}--request">${formatPrice(null)}</span>`
      : `<span class="${cls}">${formatPrice(price)}</span>`;
  },

  card(p) {
    const id = this.esc(p.id);
    return `
      <article class="es-card">
        <button type="button" class="es-thumb es-media" data-es-view="${id}" aria-label="${this.esc(p.name)}">
          <img src="${this.esc(p.image)}" alt="" loading="lazy" width="400" height="400">
          ${(p.featured || p.bestseller) ? `<span class="es-tagrow">
            ${p.featured ? `<span class="es-tag">${t("js.featured")}</span>` : ""}
            ${p.bestseller ? `<span class="es-tag es-tag--best">${t("js.bestseller")}</span>` : ""}
          </span>` : ""}
        </button>
        <div class="es-body">
          <span class="es-brand">${this.esc(getBrandById(p.brand))}</span>
          <button type="button" class="es-name" data-es-view="${id}">${this.esc(p.name)}</button>
          <span class="es-sub">${this.esc(productSubcategory(p))}</span>
          <div class="es-priceline">
            ${this.priceHtml(p, "es-price")}
            <button type="button" class="es-add" data-es-add="${id}">${t("js.add_to_cart")}</button>
          </div>
        </div>
      </article>`;
  },

  render() {
    const list = this.getFiltered();
    const part = list.slice(0, this.state.shown);

    $("#esGrid").innerHTML = part.map(p => this.card(p)).join("");
    $("#esCount").textContent = I18N.plural("count.products", list.length);

    const empty = $("#esEmpty");
    empty.hidden = list.length > 0;
    $(".es-empty__title", empty).textContent = t("js.empty_title");
    $(".es-empty__body", empty).textContent = t("js.empty_body");

    const remaining = list.length - this.state.shown;
    $("#esMoreWrap").hidden = remaining <= 0;
    if (remaining > 0) $("#esMore").textContent = t("js.load_more", { n: remaining });
  },

  /* ------------------------------------------------------------------ */
  /* Events                                                              */
  /* ------------------------------------------------------------------ */
  bindEvents() {
    const s = this.state;
    const toggle = (arr, v, on) => {
      const i = arr.indexOf(v);
      if (on && i < 0) arr.push(v);
      if (!on && i >= 0) arr.splice(i, 1);
    };
    const numOrNull = v => { const n = parseFloat(v); return isNaN(n) ? null : n; };

    document.addEventListener("click", e => {
      const el = e.target.closest("[data-es-add],[data-es-view]");
      if (!el) return;
      if (el.dataset.esAdd) ShopUI.add(el.dataset.esAdd, 1);
      else ShopUI.openModal(el.dataset.esView);
    });

    document.addEventListener("change", e => {
      const el = e.target;
      if (el.dataset.esCat) { toggle(s.cats, el.dataset.esCat, el.checked); this.resetShown(); }
      else if (el.dataset.esBrand) { toggle(s.brands, el.dataset.esBrand, el.checked); this.resetShown(); }
      else if (el.id === "esFeatured") { s.featured = el.checked; this.resetShown(); }
      else if (el.id === "esBest") { s.best = el.checked; this.resetShown(); }
      else if (el.id === "esSort") { s.sort = el.value; this.resetShown(); }
    });

    $("#esMin").addEventListener("input", e => { s.min = numOrNull(e.target.value); this.resetShown(); });
    $("#esMax").addEventListener("input", e => { s.max = numOrNull(e.target.value); this.resetShown(); });
    $("#esSearch").addEventListener("input", e => { s.q = e.target.value; this.resetShown(); });

    $("#esClear").addEventListener("click", () => {
      Object.assign(s, { q: "", cats: [], brands: [], min: null, max: null, featured: false, best: false });
      this.syncControls();
      this.resetShown();
    });
    $("#esMore").addEventListener("click", () => {
      s.shown += SITE_CONFIG.catalog.productsPerPage;
      this.render();
    });
    $("#esFilterToggle").addEventListener("click", e => {
      const open = $("#esFilters").classList.toggle("is-open");
      e.currentTarget.setAttribute("aria-expanded", String(open));
    });
  }
};

document.addEventListener("DOMContentLoaded", () => Shop.init());
