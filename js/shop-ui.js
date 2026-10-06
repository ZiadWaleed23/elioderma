/* =========================================================================
   SHOP-UI.JS — shared product pop-up + cart drawer (elio-store look)

   Loaded on every page. It is the site's only cart: the header cart icon on
   each page opens this drawer, and a product opens in the same pop-up
   everywhere. It injects its own markup (overlay, drawer,
   pop-up, toast) — pages only need css/shop.css + this file, after app.js.

   Checkout inside the drawer is two steps:
     1) cart list  ->  "Continue to checkout"
     2) customer details (name, phone, email, address, notes — validated, and
        remembered between visits)  ->  "Send order on WhatsApp"
   On send it builds the WhatsApp message, sends a copy to the Google Sheets webhook (SITE_CONFIG.orderSync), then clears
   the cart.
   ========================================================================= */

const ShopUI = {
  CUSTOMER_KEY: "Elio_customer",     // remembers the customer's details between visits
  byId: null,
  lastFocus: null,
  toastTimer: null,
  step: "cart",                      // "cart" | "details"
  ready: false,

  esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  },

  /* ------------------------------------------------------------------ */
  init() {
    if (this.ready) return;
    this.ready = true;
    this.byId = Object.create(null);
    PRODUCTS.forEach(p => { this.byId[p.id] = p; });
    this.injectScaffold();
    this.bindEvents();
    this.renderCart();
  },

  injectScaffold() {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="es-overlay" id="esOverlay" hidden></div>
      <aside class="es-drawer" id="esDrawer" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="esDrawerTitle">
        <div class="es-drawer__head">
          <h2 id="esDrawerTitle">${t("shop.cart_title")}</h2>
          <button type="button" class="es-x" id="esCartClose" aria-label="${t("shop.close_cart")}">&times;</button>
        </div>
        <div class="es-drawer__body" id="esCartBody"></div>
        <div class="es-drawer__foot" id="esCartFoot" hidden></div>
      </aside>
      <div class="es-modal" id="esModal" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="esModalTitle" hidden>
        <div class="es-modal__card" id="esModalCard"></div>
      </div>
      <div class="es-toast" id="esToast" role="status" aria-live="polite"></div>`;
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
  },

  /* ------------------------------------------------------------------ */
  /* Prices + cart data                                                  */
  /* ------------------------------------------------------------------ */
  priceHtml(p, cls) {
    const price = getPrice(p);
    return price === null
      ? `<span class="${cls} ${cls}--request">${formatPrice(null)}</span>`
      : `<span class="${cls}">${formatPrice(price)}</span>`;
  },

  add(id, qty) {
    const map = Cart._read();
    map[id] = Math.min(Cart.MAX_QTY, (map[id] || 0) + (qty || 1));
    Cart._write(map);
    this.renderCart();
    this.toast(t("shop.added"));
  },

  lines() {
    return Cart.entries().map(({ id, qty }) => {
      const p = this.byId[id];
      if (!p) { Cart.remove(id); return null; }       // discontinued product -> drop quietly
      return { p, qty };
    }).filter(Boolean);
  },

  totals(lines) {
    let total = 0, unpriced = 0;
    lines.forEach(({ p, qty }) => {
      const price = getPrice(p);
      if (price === null) unpriced += 1; else total += price * qty;
    });
    const cfg = SITE_CONFIG.discount;
    const discount = cfg && total >= cfg.threshold ? Math.round(total * (cfg.percent / 100)) : 0;
    return { total, unpriced, discount, hasPriced: total > 0 || !unpriced };
  },

  setQty(id, qty) {
    if (qty <= 0) Cart.remove(id); else Cart.setQty(id, qty);
    this.renderCart();
  },

  /* ------------------------------------------------------------------ */
  /* Drawer rendering                                                    */
  /* ------------------------------------------------------------------ */
  renderCart() {
    Cart.updateCount();
    const lines = this.lines();
    if (!lines.length) this.step = "cart";
    $("#esDrawerTitle").textContent = this.step === "details" ? t("shop.details_title") : t("shop.cart_title");
    if (this.step === "details") this.renderDetails(lines);
    else this.renderList(lines);
  },

  summaryHtml(lines) {
    const { total, unpriced, discount, hasPriced } = this.totals(lines);
    const cfg = SITE_CONFIG.discount;
    return `
      ${hasPriced && discount > 0 ? `
        <div class="es-totalrow es-totalrow--sub"><span>${t("shop.discount", { pct: cfg.percent })}</span><span>\u200E-${formatPrice(discount)}</span></div>` : ""}
      <div class="es-totalrow"><span>${t("shop.total")}</span><strong>${hasPriced ? formatPrice(total - discount) : formatPrice(null)}</strong></div>
      ${unpriced ? `<p class="es-note">${I18N.plural("cart.unpriced", unpriced)}</p>` : ""}`;
  },

  /* "Add X more to get 5% off" bar — hidden when nothing priced is in the cart */
  progressHtml(lines) {
    const cfg = SITE_CONFIG.discount;
    const { total } = this.totals(lines);
    if (!cfg || !cfg.threshold || total <= 0) return "";
    const unlocked = total >= cfg.threshold;
    const pct = Math.min(100, Math.round((total / cfg.threshold) * 100));
    const msg = unlocked
      ? t("shop.discount_unlocked", { pct: cfg.percent })
      : t("shop.discount_more", { amount: formatPrice(cfg.threshold - total), pct: cfg.percent });
    return `
      <div class="es-prog${unlocked ? " is-done" : ""}">
        <p class="es-prog__msg">${msg}</p>
        <div class="es-prog__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="${this.esc(msg)}"><span style="width:${pct}%"></span></div>
      </div>`;
  },

  renderList(lines) {
    const body = $("#esCartBody");
    const foot = $("#esCartFoot");
    if (!lines.length) {
      body.innerHTML = `<p class="es-cart-empty">${t("shop.cart_empty")}</p>`;
      foot.innerHTML = "";
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    body.innerHTML = lines.map(({ p, qty }) => {
      const id = this.esc(p.id);
      const price = getPrice(p);
      return `
        <div class="es-line">
          <div class="es-line__img es-media"><img src="${this.esc(p.image)}" alt="" loading="lazy"></div>
          <div>
            <div class="es-line__name">${this.esc(p.name)}</div>
            <div class="es-line__unit">${formatPrice(price)}</div>
            <div class="es-qty">
              <button type="button" data-es-dec="${id}" aria-label="${t("cart.dec")}">&minus;</button>
              <span>${qty}</span>
              <button type="button" data-es-inc="${id}" aria-label="${t("cart.inc")}">+</button>
            </div>
          </div>
          <div class="es-line__end">
            <div class="es-price">${price === null ? "&mdash;" : formatPrice(price * qty)}</div>
            <button type="button" class="es-rm" data-es-rm="${id}">${t("cart.remove")}</button>
          </div>
        </div>`;
    }).join("");

    foot.innerHTML = `
      ${this.progressHtml(lines)}
      ${this.summaryHtml(lines)}
      <button type="button" class="btn btn--primary btn--block" id="esCheckout">${t("shop.checkout")}</button>
      <button type="button" class="es-linkbtn" id="esClearCart">${t("shop.clear_cart")}</button>`;
  },

  renderDetails(lines) {
    const body = $("#esCartBody");
    const foot = $("#esCartFoot");
    foot.hidden = false;

    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(this.CUSTOMER_KEY)) || {}; } catch (e) { /* ignore */ }
    const v = k => this.esc(typeof saved[k] === "string" ? saved[k] : "");
    const field = (key, label, control, optional) => `
      <div class="es-field">
        <label for="esCo-${key}">${label} ${optional
          ? `<span class="es-opt">${t("shop.optional")}</span>`
          : `<span class="es-req" aria-hidden="true">*</span>`}</label>
        ${control}
        <p class="es-err" id="esCo-${key}-err" hidden></p>
      </div>`;

    body.innerHTML = `
      <p class="es-note es-note--top">${t("shop.details_hint")}</p>
      <form id="esDetailsForm" novalidate>
        ${field("name", t("shop.f_name"), `<input type="text" id="esCo-name" autocomplete="name" value="${v("name")}">`)}
        ${field("phone", t("shop.f_phone"), `<input type="tel" id="esCo-phone" inputmode="tel" autocomplete="tel" placeholder="+20 1XX XXX XXXX" value="${v("phone")}">`)}
        ${field("email", t("shop.f_email"), `<input type="email" id="esCo-email" inputmode="email" autocomplete="email" placeholder="you@example.com" value="${v("email")}">`)}
        ${field("address", t("shop.f_address"), `<textarea id="esCo-address" rows="2" autocomplete="street-address">${v("address")}</textarea>`)}
        ${field("notes", t("shop.f_notes"), `<textarea id="esCo-notes" rows="2">${v("notes")}</textarea>`, true)}
      </form>`;

    foot.innerHTML = `
      ${this.summaryHtml(lines)}
      <button type="button" class="btn btn--primary btn--block" id="esSendOrder">${t("shop.send_wa")}</button>
      <button type="button" class="es-linkbtn" id="esBack">${t("shop.back")}</button>`;
  },

  /* ------------------------------------------------------------------ */
  /* Customer details: validation                                        */
  /* ------------------------------------------------------------------ */
  validators: {
    name:    v => v.trim().length >= 2,
    phone:   v => { const d = v.replace(/\D/g, ""); return d.length >= 8 && d.length <= 15; },
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    address: v => v.trim().length >= 5
  },
  errKeys: { name: "cart.err_name", phone: "cart.err_phone", email: "cart.err_email", address: "cart.err_address" },

  fieldVal(key) { const el = $(`#esCo-${key}`); return el ? el.value.trim() : ""; },

  saveDetails() {
    const data = {};
    ["name", "phone", "email", "address", "notes"].forEach(k => { data[k] = $(`#esCo-${k}`) ? $(`#esCo-${k}`).value : ""; });
    try { localStorage.setItem(this.CUSTOMER_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  },

  setError(key, msg) {
    const el = $(`#esCo-${key}`), err = $(`#esCo-${key}-err`);
    if (!el || !err) return;
    err.textContent = msg;
    err.hidden = !msg;
    el.setAttribute("aria-invalid", msg ? "true" : "false");
  },

  validate() {
    let first = null;
    Object.keys(this.validators).forEach(key => {
      const ok = this.validators[key]($(`#esCo-${key}`).value);
      this.setError(key, ok ? "" : t(this.errKeys[key]));
      if (!ok && !first) first = $(`#esCo-${key}`);
    });
    if (first) { first.scrollIntoView({ behavior: "smooth", block: "center" }); first.focus({ preventScroll: true }); return false; }
    return true;
  },

  /* ------------------------------------------------------------------ */
  /* Order -> WhatsApp (+ Google Sheets copy)                            */
  /* ------------------------------------------------------------------ */
  buildWhatsappLink(lines) {
    const { total, unpriced, discount } = this.totals(lines);
    const orderLines = lines.map(({ p, qty }, i) => {
      const price = getPrice(p);
      return `${i + 1}. ${p.name} (${getBrandById(p.brand)}) x${qty} — ${price === null ? formatPrice(null) : formatPrice(price * qty)}`;
    });
    const f = k => this.fieldVal(k);
    const customer = [
      `${t("wa.name")}: ${f("name")}`,
      `${t("wa.phone")}: ${f("phone")}`,
      `${t("wa.email")}: ${f("email")}`,
      `${t("wa.address")}: ${f("address")}`,
      f("notes") ? `${t("wa.notes")}: ${f("notes")}` : null
    ].filter(Boolean);

    const discountLine = discount > 0
      ? t("wa.discount", { pct: SITE_CONFIG.discount.percent, amount: formatPrice(discount) }) : null;
    let totalLine = t("wa.total", { amount: formatPrice(total - discount) });
    if (unpriced) totalLine += I18N.plural("wa.unpriced", unpriced);

    const message = [t("wa.hello"), "", t("wa.customer"), ...customer, "", t("wa.order"), ...orderLines, "", discountLine, totalLine]
      .filter(line => line !== null).join("\n");
    return `${SITE_CONFIG.contact.whatsappLink}?text=${encodeURIComponent(message)}`;
  },

  sendOrderToExternalSite(lines) {
    const cfg = SITE_CONFIG.orderSync;
    if (!cfg || !cfg.enabled || !cfg.webhookUrl || cfg.webhookUrl.includes("PASTE_YOUR")) return;
    const { total, unpriced, discount } = this.totals(lines);
    const f = k => this.fieldVal(k);
    const payload = {
      timestamp: new Date().toISOString(),
      customer: { name: f("name"), phone: f("phone"), email: f("email"), address: f("address"), notes: f("notes") },
      items: lines.map(({ p, qty }) => {
        const price = getPrice(p);
        return { id: p.id, name: p.name, brand: getBrandById(p.brand), qty, unitPrice: price, lineTotal: price === null ? null : price * qty };
      }),
      unpricedItems: unpriced,
      subtotal: total,
      discount,
      total: total - discount
    };
    try {
      fetch(cfg.webhookUrl, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      }).catch(() => { /* never block the WhatsApp flow */ });
    } catch (e) { /* ignore */ }
  },

  sendOrder() {
    const lines = this.lines();
    if (!lines.length) return;
    if (!this.validate()) return;
    this.saveDetails();
    this.sendOrderToExternalSite(lines);
    window.open(this.buildWhatsappLink(lines), "_blank", "noopener");
    Cart.clear();
    this.step = "cart";
    this.renderCart();
    this.refreshCartButtons();
  },

  /* homepage cards' heart/cart buttons mirror the cart state */
  refreshCartButtons() {
    $$("[data-cart-id]").forEach(btn => {
      const inCart = Cart.has(btn.dataset.cartId);
      btn.classList.toggle("is-active", inCart);
      if (btn.hasAttribute("aria-pressed")) btn.setAttribute("aria-pressed", inCart);
    });
  },

  /* ------------------------------------------------------------------ */
  /* Drawer · pop-up · toast                                             */
  /* ------------------------------------------------------------------ */
  lockScroll() {
    const open = !$("#esModal").hidden || $("#esDrawer").classList.contains("is-open");
    document.body.classList.toggle("no-scroll", open);
  },

  openDrawer() {
    this.init();
    this.lastFocus = document.activeElement;
    this.step = "cart";
    this.renderCart();
    $("#esDrawer").classList.add("is-open");
    $("#esDrawer").setAttribute("aria-hidden", "false");
    $("#esOverlay").hidden = false;
    this.lockScroll();
    $("#esCartClose").focus();
  },
  closeDrawer() {
    $("#esDrawer").classList.remove("is-open");
    $("#esDrawer").setAttribute("aria-hidden", "true");
    $("#esOverlay").hidden = true;
    this.lockScroll();
    if (this.lastFocus && this.lastFocus.focus) this.lastFocus.focus();
  },

  openModal(id) {
    this.init();
    const p = this.byId[id];
    if (!p) return;
    const cat = getCategoryById(p.category);
    const gallery = [p.image, ...(p.gallery || [])].filter(Boolean);
    let qty = 1;
    this.lastFocus = document.activeElement;

    $("#esModalCard").innerHTML = `
      <button type="button" class="es-x es-modal__x" data-es-close aria-label="${t("js.close_details")}">&times;</button>
      <div class="es-modal__media es-media">
        <img id="esMainImg" src="${this.esc(gallery[0])}" alt="${this.esc(p.name)}">
        ${gallery.length > 1 ? `<div class="es-thumbs">${gallery.map((g, i) => `
          <button type="button" class="es-thumbsm ${i === 0 ? "is-active" : ""}" data-es-thumb="${this.esc(g)}">
            <img src="${this.esc(g)}" alt="${this.esc(t("js.thumb_alt", { name: p.name, n: i + 1 }))}"></button>`).join("")}</div>` : ""}
      </div>
      <div class="es-modal__info">
        <span class="es-brand">${this.esc(getBrandById(p.brand))} &nbsp;·&nbsp; ${this.esc(catName(cat))}</span>
        <h2 id="esModalTitle">${this.esc(p.name)}</h2>
        <div class="es-sub">${this.esc(productSubcategory(p))}</div>
        <div class="es-modal__price${getPrice(p) === null ? " es-modal__price--request" : ""}">${formatPrice(getPrice(p))}</div>
        <p class="es-desc">${this.esc(productDescription(p))}</p>
        ${(p.tags && p.tags.length) ? `<div class="es-tags">${p.tags.map(tag => `<span>${this.esc(tag)}</span>`).join("")}</div>` : ""}
        <p class="es-pro">${t("js.pro_notice")}</p>
        <div class="es-buy">
          <div class="es-qty">
            <button type="button" id="esMDec" aria-label="${t("cart.dec")}">&minus;</button>
            <span id="esMQty">1</span>
            <button type="button" id="esMInc" aria-label="${t("cart.inc")}">+</button>
          </div>
          <button type="button" class="btn btn--primary" id="esMAdd">${t("js.add_to_cart")}</button>
        </div>
        <a class="es-info-link" target="_blank" rel="noopener"
           href="${SITE_CONFIG.contact.whatsappLink}?text=${encodeURIComponent(t("js.wa_info_msg") + p.name)}">${t("js.request_info")}</a>
        <div class="es-share">
          <span>${t("shop.share")}</span>
          <button type="button" class="es-sharebtn" id="esCopyLink">${t("shop.copy_link")}</button>
          <a class="es-sharebtn" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(p.name + "\n" + this.productUrl(p.id))}">${t("shop.share_wa")}</a>
        </div>
      </div>`;

    $("#esMDec").onclick = () => { qty = Math.max(1, qty - 1); $("#esMQty").textContent = qty; };
    $("#esMInc").onclick = () => { qty = Math.min(Cart.MAX_QTY, qty + 1); $("#esMQty").textContent = qty; };
    $("#esCopyLink").onclick = () => this.copyText(this.productUrl(p.id)).then(ok => this.toast(t(ok ? "shop.link_copied" : "shop.copy_failed")));
    $("#esMAdd").onclick = () => { this.add(p.id, qty); this.refreshCartButtons(); this.closeModal(true); this.openDrawer(); };

    const modal = $("#esModal");
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    this.lockScroll();
    $(".es-modal__x", modal).focus();
  },
  closeModal(skipFocus) {
    const modal = $("#esModal");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    this.lockScroll();
    if (!skipFocus && this.lastFocus && this.lastFocus.focus) this.lastFocus.focus();
  },

  /* link that opens this product's pop-up on the products page */
  productUrl(id) {
    return new URL("products.html?view=" + encodeURIComponent(id), location.href).href;
  },

  copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(() => true, () => this.copyFallback(text));
    }
    return Promise.resolve(this.copyFallback(text));
  },
  copyFallback(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { /* ignore */ }
    ta.remove();
    return ok;
  },

  toast(msg) {
    const el = $("#esToast");
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove("is-show"), 1600);
  },

  /* ------------------------------------------------------------------ */
  bindEvents() {
    document.addEventListener("click", e => {
      const el = e.target.closest("[data-es-inc],[data-es-dec],[data-es-rm],[data-es-thumb],[data-es-close],#esCheckout,#esSendOrder,#esBack,#esClearCart,#esCartClose,#esOverlay");
      if (!el) return;
      const d = el.dataset;
      if (d.esInc) this.setQty(d.esInc, Cart.qty(d.esInc) + 1);
      else if (d.esDec) this.setQty(d.esDec, Cart.qty(d.esDec) - 1);
      else if (d.esRm) { this.setQty(d.esRm, 0); this.refreshCartButtons(); }
      else if (d.esThumb) {
        const main = $("#esMainImg");
        main.src = d.esThumb;
        main.parentElement.classList.remove("is-broken");
        $$(".es-thumbsm").forEach(b => b.classList.toggle("is-active", b === el));
      }
      else if (el.hasAttribute("data-es-close")) this.closeModal();
      else if (el.id === "esCheckout") { this.step = "details"; this.renderCart(); const f = $("#esCo-name"); if (f) f.focus(); }
      else if (el.id === "esBack") { this.step = "cart"; this.saveDetails(); this.renderCart(); const c = $("#esCheckout"); if (c) c.focus(); }
      else if (el.id === "esSendOrder") this.sendOrder();
      else if (el.id === "esClearCart") { Cart.clear(); this.renderCart(); this.refreshCartButtons(); }
      else if (el.id === "esCartClose" || el.id === "esOverlay") this.closeDrawer();
    });

    /* remember what the customer typed + clear an error once it is fixed */
    document.addEventListener("input", e => {
      const el = e.target;
      if (!el.id || !el.id.startsWith("esCo-")) return;
      this.saveDetails();
      const key = el.id.slice(5);
      if (el.getAttribute("aria-invalid") === "true" && this.validators[key] && this.validators[key](el.value)) this.setError(key, "");
    });
    /* Enter in a single-line field = send (textareas keep Enter for new lines) */
    document.addEventListener("keydown", e => {
      if (e.key === "Enter" && e.target.matches && e.target.matches("input[id^='esCo-']")) { e.preventDefault(); this.sendOrder(); }
    });

    /* keep Tab / Shift+Tab inside whichever dialog is open */
    document.addEventListener("keydown", e => {
      if (e.key !== "Tab") return;
      const box = !$("#esModal").hidden ? $("#esModal")
                : $("#esDrawer").classList.contains("is-open") ? $("#esDrawer") : null;
      if (!box) return;
      const items = [...box.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])')]
        .filter(el => el.getClientRects().length > 0);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1], active = document.activeElement;
      if (!box.contains(active)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    });

    $("#esModal").addEventListener("click", e => { if (e.target === $("#esModal")) this.closeModal(); });
    document.addEventListener("keydown", e => {
      if (e.key !== "Escape") return;
      this.closeModal();
      if ($("#esDrawer").classList.contains("is-open")) this.closeDrawer();
    });

    /* the header cart icon (every page) opens the drawer; middle/ctrl-click is ignored */
    $$('a[href="#cart"]').forEach(a => a.addEventListener("click", e => {
      e.preventDefault();
      if (e.button !== 0) return;
      this.openDrawer();
    }));

    /* cart changed in another tab */
    window.addEventListener("storage", ev => { if (ev.key === Cart.KEY) { this.renderCart(); this.refreshCartButtons(); } });

    /* broken photo -> neutral placeholder; a broken gallery thumbnail is simply hidden */
    document.addEventListener("error", ev => {
      const img = ev.target;
      if (!img || img.tagName !== "IMG") return;
      const holder = img.parentElement;
      if (!holder) return;
      if (holder.classList.contains("es-media")) holder.classList.add("is-broken");
      else if (holder.classList.contains("es-thumbsm")) holder.hidden = true;
    }, true);
  }
};

/* The homepage's product cards call openProductModal() (app.js). Point it at
   the shared pop-up so a product looks the same on every page. */
window.openProductModal = id => ShopUI.openModal(id);
window.closeProductModal = () => ShopUI.closeModal();

document.addEventListener("DOMContentLoaded", () => ShopUI.init());
