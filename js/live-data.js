/* =========================================================================
   LIVE-DATA.JS — lets the owner dashboard change prices / products

   Loaded right after products.js + products-ar.js and BEFORE the rest of the
   site, so every existing script keeps reading the same global PRODUCTS array
   (nothing else in the site had to change).

   How it works
     1. No Firebase settings        -> does nothing; site uses products.js.
     2. A saved copy of the live    -> applied instantly (before first paint).
        catalog exists in this
        browser
     3. In the background the live catalog is fetched from Firestore. If it
        differs from what the page is showing, the copy is refreshed and the
        page reloads ONCE so the visitor sees the newest prices.
   To save Firestore reads, a browser that already has a saved copy only asks
   Firestore again after 5 minutes (add ?fresh=1 to a page address to force an
   immediate check, e.g. right after you change something and want to see it).
   The same settings document can also switch on an announcement bar (set from
   the owner dashboard). It is only drawn when the owner turns it on.
   If Firestore is unreachable, empty, or anything fails, the page simply keeps
   showing what it already has. It can never leave the site blank.
   ========================================================================= */
(function () {
  var FB = window.ELIO_FIREBASE || {};
  if (!FB.projectId || !FB.apiKey) return;

  var CACHE = "Elio_live_v1";
  var ORDER = {}; PRODUCTS.forEach(function (p, i) { ORDER[p.id] = i; });   // keep the site's existing product order
  var BASE = "https://firestore.googleapis.com/v1/projects/" + FB.projectId + "/databases/(default)/documents";
  var T0 = Date.now();

  function hash(str) { var h = 5381; for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return String(h); }

  /* Firestore typed value -> plain JS */
  function val(v) {
    if (!v) return null;
    if ("stringValue" in v) return v.stringValue;
    if ("integerValue" in v) return Number(v.integerValue);
    if ("doubleValue" in v) return v.doubleValue;
    if ("booleanValue" in v) return v.booleanValue;
    if ("arrayValue" in v) return (v.arrayValue.values || []).map(val);
    if ("mapValue" in v) { var o = {}, f = v.mapValue.fields || {}; Object.keys(f).forEach(function (k) { o[k] = val(f[k]); }); return o; }
    return null;
  }
  function fields(d) { var o = {}, f = d.fields || {}; Object.keys(f).forEach(function (k) { o[k] = val(f[k]); }); return o; }

  /* shape a Firestore product exactly like the entries in products.js */
  function shape(p) {
    var price = Number(p.price);
    return {
      id: String(p.id), name: String(p.name || ""), brand: String(p.brand || ""), brandName: p.brandName || "",
      category: p.category || "", subcategory: p.subcategory || "",
      price: price > 0 ? price : null,
      description: p.description || "", description_ar: p.description_ar || "",
      image: p.image || "img/logo.png",
      gallery: Array.isArray(p.gallery) ? p.gallery.filter(Boolean) : [],
      featured: !!p.featured, bestseller: !!p.bestseller, hidden: !!p.hidden,
      dateAdded: p.dateAdded || "", tags: Array.isArray(p.tags) ? p.tags : []
    };
  }

  /* put the live catalog into the existing globals (in place, same objects) */
  function apply(data) {
    var list = (data.products || []).filter(function (p) { return p.name && !p.hidden; });
    if (!list.length) return false;
    PRODUCTS.length = 0;
    list.forEach(function (p) { PRODUCTS.push(p); });

    var brands = SITE_CONFIG.brands, ids = {};
    brands.forEach(function (b) { ids[b.id] = true; });
    list.forEach(function (p) {
      if (p.brandName && !ids[p.brand]) { brands.push({ id: p.brand, name: p.brandName }); ids[p.brand] = true; }
      if (p.description_ar && typeof PRODUCT_TEXT_AR !== "undefined") PRODUCT_TEXT_AR.descriptions[p.description] = p.description_ar;
    });

    var d = data.settings && data.settings.discount;
    if (d && Number(d.threshold) >= 0 && Number(d.percent) >= 0) {
      SITE_CONFIG.discount = { threshold: Number(d.threshold), percent: Number(d.percent) };
    }
    return true;
  }

  /* ---- announcement bar (owner turns it on from the dashboard) ---------- */
  var SKEY = "Elio_live_settings", CLOSED = "Elio_ann_closed";
  function readSettings() { try { return JSON.parse(localStorage.getItem(SKEY)) || {}; } catch (e) { return {}; } }

  function drawAnnouncement(settings) {
    var a = settings && settings.announcement;
    if (!a || !a.enabled) return;
    var lang; try { lang = localStorage.getItem("Elio_lang"); } catch (e) {}
    var ar = lang === "ar";
    var text = String((ar ? (a.text_ar || a.text) : (a.text || a.text_ar)) || "").trim();
    if (!text) return;
    var id = hash(text + "|" + (a.link || ""));
    try { if (sessionStorage.getItem(CLOSED) === id) return; } catch (e) {}

    if (!document.getElementById("elio-ann-style")) {
      var st = document.createElement("style"); st.id = "elio-ann-style";
      st.textContent = ".elio-ann{position:relative;z-index:501;display:flex;align-items:center;justify-content:center;gap:12px;" +
        "padding:10px 48px;background:var(--charcoal,#3A2A4D);color:#fff;font:500 .9rem/1.45 var(--font-body,system-ui,sans-serif);text-align:center}" +
        ".elio-ann a{color:inherit;text-decoration:underline;text-underline-offset:3px}" +
        ".elio-ann button{position:absolute;inset-block:0;inset-inline-end:8px;width:36px;background:none;border:0;color:inherit;font-size:1.4rem;line-height:1;cursor:pointer;opacity:.8}" +
        ".elio-ann button:hover{opacity:1}";
      document.head.appendChild(st);
    }
    var bar = document.createElement("div");
    bar.className = "elio-ann"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", ar ? "إعلان" : "Announcement");
    bar.dir = ar ? "rtl" : "ltr";
    var link = String(a.link || "").trim();
    var okLink = /^(https?:\/\/|\/(?!\/)|[a-z0-9][a-z0-9._-]*\.html)/i.test(link);
    var msg = document.createElement(okLink ? "a" : "span");
    msg.textContent = text;                                   // text only: never HTML
    if (okLink) { msg.href = link; if (/^https?:/i.test(link)) { msg.target = "_blank"; msg.rel = "noopener"; } }
    var x = document.createElement("button");
    x.type = "button"; x.textContent = "\u00d7"; x.setAttribute("aria-label", ar ? "إغلاق" : "Close");
    x.onclick = function () { try { sessionStorage.setItem(CLOSED, id); } catch (e) {} bar.remove(); };
    bar.appendChild(msg); bar.appendChild(x);
    /* the bar pushes the page down; stop the browser from "anchoring" (scrolling) to compensate */
    var root = document.documentElement, prev = root.style.overflowAnchor;
    root.style.overflowAnchor = "none";
    document.body.insertBefore(bar, document.body.firstChild);
    setTimeout(function () { root.style.overflowAnchor = prev; }, 1500);
  }
  function whenReady(fn) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn(); }
  whenReady(function () { drawAnnouncement(readSettings()); });

  function readCache() { try { return JSON.parse(localStorage.getItem(CACHE)); } catch (e) { return null; } }

  var applied = null, cached = readCache();
  if (cached && cached.products && apply(cached)) applied = cached.hash;

  /* ask Firestore at most once every 5 minutes per browser */
  var CHECKED = "Elio_live_checked", EVERY = 5 * 60 * 1000;
  try {
    var recent = Date.now() - Number(localStorage.getItem(CHECKED) || 0) < EVERY;
    if (applied !== null && recent && !/[?&]fresh=1/.test(location.search)) return;
  } catch (e) { /* storage blocked: just check every time */ }

  function fetchJson(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function fetchAll() {
    var out = [];
    function page(token) {
      var u = BASE + "/products?pageSize=300&key=" + encodeURIComponent(FB.apiKey) + (token ? "&pageToken=" + encodeURIComponent(token) : "");
      return fetchJson(u).then(function (j) {
        (j.documents || []).forEach(function (d) { var p = fields(d); p.id = p.id || d.name.split("/").pop(); out.push(shape(p)); });
        return j.nextPageToken ? page(j.nextPageToken) : out;
      });
    }
    return page("");
  }

  Promise.all([fetchAll(), fetchJson(BASE + "/settings/site?key=" + encodeURIComponent(FB.apiKey)).then(fields, function () { return {}; })])
    .then(function (r) {
      var products = r[0], settings = r[1];
      try { localStorage.setItem(CHECKED, String(Date.now())); } catch (e) {}
      if (!products.length) return;                      // database not filled yet: keep products.js
      products.sort(function (a, b) {                    // existing products keep their place; new ones go last, newest first
        var x = ORDER[a.id], y = ORDER[b.id];
        if (x !== undefined && y !== undefined) return x - y;
        if (x !== undefined) return -1;
        if (y !== undefined) return 1;
        return String(b.dateAdded).localeCompare(String(a.dateAdded));
      });
      var data = { products: products, settings: settings };
      data.hash = hash(JSON.stringify(data));
      try { localStorage.setItem(SKEY, JSON.stringify(settings)); } catch (e) {}
      if (data.hash === applied) return;                 // page already shows the latest
      var stored = false;
      try { localStorage.setItem(CACHE, JSON.stringify(data)); stored = true; } catch (e) { /* too big: handled below */ }
      var guard = "Elio_live_reloaded:" + data.hash + ":" + location.pathname + location.search;
      var fresh = Date.now() - T0 < 9000;                // don't interrupt someone who is already browsing
      var done = false; try { done = !!sessionStorage.getItem(guard); } catch (e) { done = true; }
      if (fresh && !done) { try { sessionStorage.setItem(guard, "1"); } catch (e) {} location.reload(); }
    })
    .catch(function () { /* offline / blocked: keep whatever the page is showing */ });
})();
