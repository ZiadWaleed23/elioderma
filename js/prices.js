/* =========================================================================
   PRICES.JS
   Price helpers only — the prices themselves live in js/products.js, in
   each product's  price:  field (add-product.html and manage-products.html
   both have a Price box, so you never edit this file for a new product).

   - price: 0 (or missing) shows "Price on request" and is left out of the
     cart total.
   - Change the currency / number format in PRICE_CONFIG below.
   ========================================================================= */

const PRICE_CONFIG = {
  currency: "EGP",        // shown before the number, e.g. "EGP 4,500"
  currencyAr: "ج.م",      // Arabic site: shown after the number, e.g. "4,500 ج.م"
  locale: "en-US",        // number formatting (thousands separator) — Western digits in both languages
  onRequestLabel: "Price on request",
  onRequestLabelAr: "السعر عند الطلب"
};

const PRICE_IS_AR = typeof I18N !== "undefined" && I18N.isAr;

/* Accepts a product object or a product id. Returns a number, or null when
   no price is set. */
function getPrice(productOrId) {
  const product = typeof productOrId === "string"
    ? PRODUCTS.find(p => p.id === productOrId)
    : productOrId;
  const value = product ? Number(product.price) : NaN;
  return value > 0 ? value : null;
}

function formatPrice(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return PRICE_IS_AR ? PRICE_CONFIG.onRequestLabelAr : PRICE_CONFIG.onRequestLabel;
  }
  const num = Number(amount).toLocaleString(PRICE_CONFIG.locale, { maximumFractionDigits: 2 });
  return PRICE_IS_AR ? `${num} ${PRICE_CONFIG.currencyAr}` : `${PRICE_CONFIG.currency} ${num}`;
}
