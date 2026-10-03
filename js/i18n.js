/* =========================================================================
   I18N.JS — language engine (English / Arabic)

   Loaded FIRST in <head> on every public page, so the page direction
   (ltr / rtl) is correct before anything paints.

   How the pieces fit together
   ---------------------------
   - The HTML files keep their English text. Elements that have an Arabic
     version carry  data-i18n="key"  (text), or  data-i18n-placeholder /
     data-i18n-aria-label / data-i18n-alt / data-i18n-title /
     data-i18n-content  (attributes).
   - The Arabic text for each key lives in js/i18n-strings.js.
   - Text built by JavaScript (product cards, cart, filters ...) uses
     I18N.t("key") or the helpers below.
   - The visitor's choice is saved in localStorage ("Elio_lang").
     Default is English. A link ending in  ?lang=ar  opens the site in
     Arabic (handy for sharing) and remembers the choice.
   - Switching language reloads the page. That keeps every part of the
     site (cards, modal, cart, filters) in one language with no stale text.
   ========================================================================= */
(function () {
  "use strict";

  var KEY = "Elio_lang";
  var SUPPORTED = ["en", "ar"];
  var DEFAULT_LANG = "en";

  /* Arabic web fonts — only downloaded when the site is in Arabic */
  var AR_FONTS_URL =
    "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap";

  /* ---- detect language ------------------------------------------------- */
  function detect() {
    var fromUrl = null;
    try { fromUrl = new URLSearchParams(location.search).get("lang"); } catch (e) { /* old browser */ }
    if (fromUrl && SUPPORTED.indexOf(fromUrl) > -1) {
      try { localStorage.setItem(KEY, fromUrl); } catch (e) { /* storage blocked */ }
      return fromUrl;
    }
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }
    return SUPPORTED.indexOf(saved) > -1 ? saved : DEFAULT_LANG;
  }

  var lang = detect();
  var isAr = lang === "ar";
  var root = document.documentElement;

  /* ---- set lang / dir immediately (before first paint) ------------------ */
  root.setAttribute("lang", lang);
  root.setAttribute("dir", isAr ? "rtl" : "ltr");
  root.setAttribute("data-lang", lang);

  if (isAr) {
    /* Load the Arabic fonts */
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = AR_FONTS_URL;
    document.head.appendChild(link);

    /* Hide the page for a split second while the Arabic text is swapped in,
       so visitors never see a flash of English. A safety timer guarantees
       the page is always revealed. */
    var hide = document.createElement("style");
    hide.id = "i18n-pending-style";
    hide.textContent = "html.i18n-pending body{visibility:hidden}";
    document.head.appendChild(hide);
    root.classList.add("i18n-pending");
    setTimeout(reveal, 2500);
  }

  function reveal() { root.classList.remove("i18n-pending"); }

  /* ---- dictionaries ----------------------------------------------------- */
  var strings = { en: {}, ar: {} };

  function add(l, obj) {
    if (!strings[l]) strings[l] = {};
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) strings[l][k] = obj[k];
  }

  /* t("key", { name: "x" }) — falls back to English, then to the key itself */
  function t(key, vars) {
    var s = strings[lang] && strings[lang][key];
    if (s == null) s = strings.en[key];
    if (s == null) s = key;
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, function (m, name) {
        return vars[name] != null ? vars[name] : m;
      });
    }
    return s;
  }

  /* Plural-aware text. Needs keys  base.one / base.other  (English) and
     base.zero / one / two / few / other  (Arabic). {n} is replaced. */
  function plural(base, n) {
    var cat;
    if (isAr) {
      cat = n === 0 ? "zero" : n === 1 ? "one" : n === 2 ? "two" : (n >= 3 && n <= 10) ? "few" : "other";
    } else {
      cat = n === 1 ? "one" : "other";
    }
    var key = base + "." + cat;
    var found = strings[lang] && strings[lang][key] != null;
    return t(found ? key : base + ".other", { n: n });
  }

  /* loc(obj, "name") — returns obj.name_ar in Arabic when it exists */
  function loc(obj, field) {
    if (!obj) return "";
    if (isAr && obj[field + "_ar"]) return obj[field + "_ar"];
    return obj[field];
  }

  /* Makes Arabic search forgiving: ignores diacritics, unifies alef / yaa / taa-marbuta */
  function normalize(s) {
    return String(s == null ? "" : s)
      .toLowerCase()
      .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
      .replace(/[\u0623\u0625\u0622\u0671]/g, "\u0627")
      .replace(/\u0649/g, "\u064A")
      .replace(/\u0629/g, "\u0647");
  }

  /* ---- translate the static HTML (Arabic only — English is the source) --- */
  var ATTRS = ["placeholder", "aria-label", "alt", "title", "content"];
  var missing = [];

  function decode(html) {
    var ta = document.createElement("textarea");
    ta.innerHTML = html;
    return ta.value;
  }

  function apply(scope) {
    if (!isAr) return;
    scope = scope || document;

    var nodes = scope.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute("data-i18n");
      var val = strings.ar[key];
      if (val == null) { missing.push(key); continue; }
      if (el.tagName === "TITLE") document.title = decode(val);
      else el.innerHTML = val;
    }

    ATTRS.forEach(function (attr) {
      var list = scope.querySelectorAll("[data-i18n-" + attr + "]");
      for (var j = 0; j < list.length; j++) {
        var k = list[j].getAttribute("data-i18n-" + attr);
        var v = strings.ar[k];
        if (v == null) { missing.push(k); continue; }
        list[j].setAttribute(attr, decode(v));
      }
    });
  }

  /* ---- language switch ---------------------------------------------------- */
  function set(newLang) {
    if (SUPPORTED.indexOf(newLang) === -1) return;
    try { localStorage.setItem(KEY, newLang); } catch (e) { /* storage blocked */ }
    try {
      var url = new URL(location.href);
      url.searchParams.delete("lang");          // the saved choice wins from now on
      /* On the products page keep the visitor's category + search through the reload */
      if (typeof Catalog !== "undefined" && Catalog.state && document.getElementById("products-page")) {
        var st = Catalog.state;
        if (st.category && st.category !== "all") url.searchParams.set("category", st.category);
        else url.searchParams.delete("category");
        if (st.search) url.searchParams.set("search", st.search);
        else url.searchParams.delete("search");
      }
      location.replace(url.toString());
    } catch (e) {
      location.reload();
    }
  }

  function toggle() { set(isAr ? "en" : "ar"); }

  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-lang-toggle]")) toggle();
  });

  function syncToggleButtons() {
    var btns = document.querySelectorAll("[data-lang-toggle]");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var txt = b.querySelector(".lang-toggle__text");
      if (isAr) {
        if (txt) txt.textContent = "EN";
        b.setAttribute("aria-label", "التبديل إلى اللغة الإنجليزية");
        b.setAttribute("title", "English");
      } else {
        if (txt) txt.textContent = "عربي";
        b.setAttribute("aria-label", "Switch language to Arabic");
        b.setAttribute("title", "العربية");
      }
    }
  }

  /* This listener is registered before any other script's, so the static text is
     translated first; app.js then builds the dynamic parts in the right language. */
  document.addEventListener("DOMContentLoaded", function () {
    apply(document);
    syncToggleButtons();
    if (isAr) {
      setTimeout(function () {
        reveal();
        if (missing.length && window.console && console.info) {
          console.info("[i18n] No Arabic text yet for:", missing.filter(function (k, i, a) { return a.indexOf(k) === i; }));
        }
      }, 0);
    }
  });

  window.I18N = {
    lang: lang,
    isAr: isAr,
    dir: isAr ? "rtl" : "ltr",
    add: add,
    t: t,
    plural: plural,
    loc: loc,
    normalize: normalize,
    apply: apply,
    set: set,
    toggle: toggle
  };
})();
