/* =========================================================================
   CART.JS
   Drives cart.html: renders the products currently in the cart (from
   the shared Cart helper in app.js), lets the user change quantities or
   remove items, shows prices + total (from prices.js), collects the
   customer's details, and builds the "Request via WhatsApp" message.
   Runs only on cart.html.
   ========================================================================= */

const CartPage = {

  CUSTOMER_KEY: "Elio_customer",

  init() {
    this.emptyEl = $("#cart-empty");
    this.layoutEl = $("#cart-layout");
    this.listEl = $("#cart-list");
    this.countEl = $("#cart-item-count");
    this.checkoutBtn = $("#cart-checkout-btn");
    this.subtotalEl = $("#cart-subtotal");
    this.totalEl = $("#cart-total");
    this.totalNoteEl = $("#cart-total-note");
    this.discountRowEl = $("#cart-discount-row");
    this.discountEl = $("#cart-discount");
    if (!this.listEl) return; // only run on cart.html

    this.fields = {
      name:    $("#co-name"),
      phone:   $("#co-phone"),
      email:   $("#co-email"),
      address: $("#co-address"),
      notes:   $("#co-notes")
    };

    if (this.checkoutBtn) this.checkoutBtn.href = SITE_CONFIG.contact.whatsappLink;

    this.restoreCustomer();
    this.bindEvents();
    this.render();
  },

  /* ------------------------------------------------------------------
     Data
     ------------------------------------------------------------------ */
  getItems() {
    // Cart stores product ids + quantities; look each id up in PRODUCTS so
    // removed/discontinued products never break the page (they're dropped).
    const items = [];
    Cart.entries().forEach(({ id, qty }) => {
      const product = PRODUCTS.find(p => p.id === id);
      if (product) items.push({ product, qty });
      else Cart.remove(id);
    });
    return items;
  },

  totals(items) {
    let total = 0, unpriced = 0, units = 0;
    items.forEach(({ product, qty }) => {
      units += qty;
      const price = getPrice(product);
      if (price === null) unpriced += 1;
      else total += price * qty;
    });
    return { total, unpriced, units };
  },

  /* % discount on the subtotal once SITE_CONFIG.discount.threshold is reached. */
  getDiscount(subtotal) {
    const cfg = SITE_CONFIG.discount;
    if (!cfg || subtotal < cfg.threshold) return 0;
    return Math.round(subtotal * (cfg.percent / 100));
  },

  /* ------------------------------------------------------------------
     Rendering
     ------------------------------------------------------------------ */
  render() {
    const items = this.getItems();

    if (!items.length) {
      if (this.countEl) this.countEl.textContent = t("cart.empty_count");
      this.emptyEl.style.display = "block";
      this.layoutEl.style.display = "none";
      return;
    }

    this.emptyEl.style.display = "none";
    this.layoutEl.style.display = "grid";
    this.listEl.innerHTML = items.map(({ product, qty }) => this.buildRow(product, qty)).join("");
    this.updateSummary(items);
  },

  buildRow(product, qty) {
    const cat = getCategoryById(product.category);
    const brandName = getBrandById(product.brand);
    const price = getPrice(product);
    const url = `products.html?view=${encodeURIComponent(product.id)}`;
    return `
      <div class="cart-item" data-id="${product.id}">
        <a href="${url}" class="cart-item__media">
          <img src="${product.image}" alt="${product.name}" loading="lazy" width="200" height="240">
        </a>
        <div class="cart-item__body">
          <p class="cart-item__eyebrow">${brandName} &nbsp;·&nbsp; ${catName(cat)}</p>
          <h3 class="cart-item__title">
            <a href="${url}">${product.name}</a>
          </h3>
          <p class="cart-item__unit">${price === null ? formatPrice(null) : t("price.each", { price: formatPrice(price) })}</p>

          <div class="cart-item__controls">
            <div class="qty" role="group" aria-label="${t("cart.qty_for", { name: product.name })}">
              <button type="button" class="qty__btn" data-qty-dec="${product.id}" aria-label="${t("cart.dec")}" ${qty <= 1 ? "disabled" : ""}>&minus;</button>
              <input class="qty__input" type="number" inputmode="numeric" min="1" max="${Cart.MAX_QTY}" value="${qty}" data-qty-input="${product.id}" aria-label="${t("cart.qty")}">
              <button type="button" class="qty__btn" data-qty-inc="${product.id}" aria-label="${t("cart.inc")}" ${qty >= Cart.MAX_QTY ? "disabled" : ""}>+</button>
            </div>
            <button class="cart-item__remove" data-cart-id="${product.id}" aria-label="${t("cart.remove_aria", { name: product.name })}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m2 0-1 13a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7"/></svg>
              ${t("cart.remove")}
            </button>
          </div>
        </div>
        <p class="cart-item__total" data-line-total>${price === null ? "&mdash;" : formatPrice(price * qty)}</p>
      </div>
    `;
  },

  /* Header count text + total box (cheap — called after every change) */
  updateSummary(items) {
    items = items || this.getItems();
    const { total, unpriced, units } = this.totals(items);
    const discount = this.getDiscount(total);
    const hasPricedTotal = total > 0 || !unpriced;

    if (this.countEl) {
      this.countEl.textContent = I18N.plural("cart.items", units);
    }
    if (this.subtotalEl) {
      this.subtotalEl.textContent = hasPricedTotal ? formatPrice(total) : formatPrice(null);
    }
    if (this.discountRowEl) {
      this.discountRowEl.hidden = !hasPricedTotal || discount <= 0;
    }
    if (this.discountEl) {
      /* \u200E (LRM) keeps the minus sign on the left of the number in right-to-left pages */
      this.discountEl.textContent = discount > 0 ? `\u200E-${formatPrice(discount)}` : formatPrice(0);
    }
    if (this.totalEl) {
      this.totalEl.textContent = hasPricedTotal ? formatPrice(total - discount) : formatPrice(null);
    }
    if (this.totalNoteEl) {
      this.totalNoteEl.textContent = unpriced ? I18N.plural("cart.unpriced", unpriced) : "";
      this.totalNoteEl.hidden = !unpriced;
    }
  },

  /* Update one row in place (keeps keyboard focus on the stepper) */
  updateRow(id) {
    const row = this.listEl.querySelector(`.cart-item[data-id="${CSS.escape(id)}"]`);
    if (!row) return;
    const qty = Cart.qty(id);
    const price = getPrice(id);
    $("[data-qty-input]", row).value = qty;
    $("[data-qty-dec]", row).disabled = qty <= 1;
    $("[data-qty-inc]", row).disabled = qty >= Cart.MAX_QTY;
    $("[data-line-total]", row).innerHTML = price === null ? "&mdash;" : formatPrice(price * qty);
    this.updateSummary();
  },

  /* ------------------------------------------------------------------
     Events
     ------------------------------------------------------------------ */
  bindEvents() {
    // Quantity +/-
    this.listEl.addEventListener("click", e => {
      const inc = e.target.closest("[data-qty-inc]");
      const dec = e.target.closest("[data-qty-dec]");
      if (inc) {
        const id = inc.dataset.qtyInc;
        Cart.setQty(id, Cart.qty(id) + 1);
        this.updateRow(id);
      } else if (dec) {
        const id = dec.dataset.qtyDec;
        Cart.setQty(id, Cart.qty(id) - 1);
        this.updateRow(id);
      }
    });

    // Typed quantity (applies when the field loses focus / Enter)
    this.listEl.addEventListener("change", e => {
      const input = e.target.closest("[data-qty-input]");
      if (!input) return;
      const id = input.dataset.qtyInput;
      const n = parseInt(input.value, 10);
      Cart.setQty(id, isNaN(n) ? 1 : n);
      this.updateRow(id);
    });
    this.listEl.addEventListener("keydown", e => {
      if (e.key === "Enter" && e.target.matches("[data-qty-input]")) {
        e.preventDefault();
        e.target.blur();
      }
    });

    // Customer details: remember them + clear an error once the field is fixed
    Object.entries(this.fields).forEach(([key, el]) => {
      if (!el) return;
      el.addEventListener("input", () => {
        this.saveCustomer();
        if (el.getAttribute("aria-invalid") === "true" && this.validators[key] && this.validators[key](el.value)) {
          this.setError(key, "");
        }
      });
      // Enter in a single-line field = send (textareas keep Enter for new lines)
      if (el.tagName === "INPUT") {
        el.addEventListener("keydown", e => {
          if (e.key === "Enter") { e.preventDefault(); this.checkoutBtn.click(); }
        });
      }
    });

    // WhatsApp button: validate first, then open the pre-filled chat
    // (also fires an order-sync copy to the external endpoint, if configured)
    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener("click", e => {
        const items = this.getItems();
        if (!items.length) { e.preventDefault(); return; }
        if (!this.validate()) { e.preventDefault(); return; }
        this.checkoutBtn.href = this.buildWhatsappLink(items);
        this.sendOrderToExternalSite(items);
        Cart.clear();
        this.render();
      });
    }

    // Cart changed in another tab
    window.addEventListener("storage", e => {
      if (e.key === Cart.KEY) this.render();
    });
  },

  /* ------------------------------------------------------------------
     Customer details: storage + validation
     ------------------------------------------------------------------ */
  validators: {
    name:    v => v.trim().length >= 2,
    phone:   v => { const d = v.replace(/\D/g, ""); return d.length >= 8 && d.length <= 15; },
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    address: v => v.trim().length >= 5
  },
  messages: {
    get name()    { return t("cart.err_name"); },
    get phone()   { return t("cart.err_phone"); },
    get email()   { return t("cart.err_email"); },
    get address() { return t("cart.err_address"); }
  },

  restoreCustomer() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.CUSTOMER_KEY)) || {};
      Object.keys(this.fields).forEach(k => {
        if (this.fields[k] && typeof saved[k] === "string") this.fields[k].value = saved[k];
      });
    } catch (e) { /* ignore corrupted data */ }
  },

  saveCustomer() {
    const data = {};
    Object.keys(this.fields).forEach(k => { if (this.fields[k]) data[k] = this.fields[k].value; });
    try { localStorage.setItem(this.CUSTOMER_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  },

  setError(key, message) {
    const el = this.fields[key];
    const errEl = $(`#co-${key}-error`);
    if (!el || !errEl) return;
    errEl.textContent = message;
    errEl.hidden = !message;
    el.setAttribute("aria-invalid", message ? "true" : "false");
  },

  validate() {
    let firstInvalid = null;
    Object.keys(this.validators).forEach(key => {
      const ok = this.validators[key](this.fields[key].value);
      this.setError(key, ok ? "" : this.messages[key]);
      if (!ok && !firstInvalid) firstInvalid = this.fields[key];
    });
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalid.focus({ preventScroll: true });
      return false;
    }
    return true;
  },

  /* ------------------------------------------------------------------
     WhatsApp message
     ------------------------------------------------------------------ */
  buildWhatsappLink(items) {
    const f = key => this.fields[key].value.trim();
    const { total, unpriced } = this.totals(items);
    const discount = this.getDiscount(total);

    const orderLines = items.map(({ product, qty }, i) => {
      const price = getPrice(product);
      const money = price === null ? formatPrice(null) : formatPrice(price * qty);
      return `${i + 1}. ${product.name} (${getBrandById(product.brand)}) x${qty} — ${money}`;
    });

    const customer = [
      `${t("wa.name")}: ${f("name")}`,
      `${t("wa.phone")}: ${f("phone")}`,
      `${t("wa.email")}: ${f("email")}`,
      `${t("wa.address")}: ${f("address")}`,
      f("notes") ? `${t("wa.notes")}: ${f("notes")}` : null
    ].filter(Boolean);

    const discountLine = discount > 0
      ? t("wa.discount", { pct: SITE_CONFIG.discount.percent, amount: formatPrice(discount) })
      : null;
    let totalLine = t("wa.total", { amount: formatPrice(total - discount) });
    if (unpriced) totalLine += I18N.plural("wa.unpriced", unpriced);

    const message = [
      t("wa.hello"),
      "",
      t("wa.customer"),
      ...customer,
      "",
      t("wa.order"),
      ...orderLines,
      "",
      discountLine,
      totalLine
    ].filter(line => line !== null).join("\n");

    return `${SITE_CONFIG.contact.whatsappLink}?text=${encodeURIComponent(message)}`;
  },

  /* ------------------------------------------------------------------
     Order sync — sends a copy of the order to an external endpoint
     (see SITE_CONFIG.orderSync). Fire-and-forget: it never blocks or
     interrupts the WhatsApp checkout flow, and any failure (offline,
     bad URL, endpoint down) is swallowed silently so the customer's
     order still goes through via WhatsApp either way.
     ------------------------------------------------------------------ */
  sendOrderToExternalSite(items) {
    const cfg = SITE_CONFIG.orderSync;
    if (!cfg || !cfg.enabled || !cfg.webhookUrl || cfg.webhookUrl.includes("PASTE_YOUR")) return;

    const f = key => this.fields[key].value.trim();
    const { total, unpriced } = this.totals(items);
    const discount = this.getDiscount(total);

    const payload = {
      timestamp: new Date().toISOString(),
      customer: {
        name: f("name"),
        phone: f("phone"),
        email: f("email"),
        address: f("address"),
        notes: f("notes")
      },
      items: items.map(({ product, qty }) => {
        const price = getPrice(product);
        return {
          id: product.id,
          name: product.name,
          brand: getBrandById(product.brand),
          qty,
          unitPrice: price,
          lineTotal: price === null ? null : price * qty
        };
      }),
      unpricedItems: unpriced,
      subtotal: total,
      discount,
      total: total - discount
    };

    try {
      // text/plain avoids a CORS preflight on Google Apps Script Web Apps;
      // mode: "no-cors" means we can't read the response, which is fine
      // here since we don't need one.
      fetch(cfg.webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      }).catch(() => { /* ignore network errors — WhatsApp flow still works */ });
    } catch (e) { /* ignore — never block checkout because of this */ }
  }
};

/* Removing an item: app.js's global [data-cart-id] click handler already
   toggles the product out of the Cart and updates every matching button
   on the page. We only need to re-render the list afterwards so the row
   disappears and the total stays in sync. */
document.addEventListener("click", e => {
  if (e.target.closest(".cart-item__remove")) {
    CartPage.render();
  }
});

document.addEventListener("DOMContentLoaded", () => CartPage.init());
