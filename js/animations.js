/* =========================================================================
   ANIMATIONS.JS  —  Elio
   ملف مستقل بالكامل للأنيميشن (CSS + JS في ملف واحد).
   - مبيغيّرش أي حاجة في الكود الأساسي (HTML / style.css / app.js ...).
   - بيضيف CSS الخاص بيه لوحده ويشتغل فوق الموجود.
   - للإلغاء الكامل: شيل سطر <script src="js/animations.js"></script> من الصفحات.
   - بيحترم prefers-reduced-motion (لو المستخدم مفعّلها بيتوقف تمامًا).

   الفهرس:
   1) الإعدادات (سرعة / مسافات / أهداف الـ scroll reveal)
   2) الـ CSS
   3) الـ JS: reveal + progress bar + cart micro-interactions
   ========================================================================= */
(function () {
  "use strict";

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window) || !("MutationObserver" in window)) return;

  /* ---------------------------------------------------------------------
     1) الإعدادات
     --------------------------------------------------------------------- */
  const CFG = {
    ease: "cubic-bezier(.22, 1, .36, 1)",
    duration: 0.8,          // مدة الـ reveal بالثواني
    stagger: 0.08,          // الفرق بين كل عنصر والتاني (ثانية)
    maxStagger: 8,          // أقصى عدد عناصر بتتتابع في نفس الدفعة
    distance: 32,           // مسافة الطلوع لفوق (px)
    progressBar: true       // الشريط الدهبي فوق الصفحة
  };

  // [selector, variant]  variants: up | left | right | zoom | fade | line
  const TARGETS = [
    [".section__eyebrow-line, .split__eyebrow-line", "line"],
    [".page-header .container > *", "up"],
    [".about-hero .container > *", "up"],
    [".section__head", "up"],
    [".product-card", "up"],
    [".value-item", "up"],
    [".stats-band__item", "up"],
    [".split__media", "zoom"],
    [".split__body > *:not(.split__eyebrow-line)", "up"],
    [".contact-cta .container > *", "up"],
    [".contact-info h2, .contact-info-row, .contact-social, .map-placeholder", "up"],
    [".catalog-toolbar", "up"],
    [".cart-summary", "right"],
    [".empty-state", "up"],
    [".footer-grid > *", "up"],
    [".footer-bottom", "fade"]
  ];

  /* ---------------------------------------------------------------------
     2) الـ CSS  (كله متقيّد بـ html.aa-ready عشان لو الملف فشل مفيش حاجة تختفي)
     --------------------------------------------------------------------- */
  const R = ".aa-ready";
  let css = `
:root { --aa-ease: ${CFG.ease}; }

/* ---------- حالات البداية للـ scroll reveal ---------- */
${R} [data-aa].aa-pre { opacity: 0; }
${R} [data-aa="up"].aa-pre    { translate: 0 ${CFG.distance}px; }
${R} [data-aa="left"].aa-pre  { translate: -${CFG.distance + 12}px 0; }
${R} [data-aa="right"].aa-pre { translate: ${CFG.distance + 12}px 0; }
${R} [data-aa="zoom"].aa-pre  { scale: .94; }
${R} [data-aa="line"].aa-pre  { opacity: 1; scale: 0 1; transform-origin: left center; }

${R} [data-aa].aa-in { animation: aa-KIND ${CFG.duration}s var(--aa-ease) var(--aa-delay, 0s) backwards; }
${R} [data-aa="up"].aa-in    { animation-name: aa-up; }
${R} [data-aa="left"].aa-in  { animation-name: aa-left; }
${R} [data-aa="right"].aa-in { animation-name: aa-right; }
${R} [data-aa="zoom"].aa-in  { animation-name: aa-zoom; animation-duration: 1.1s; }
${R} [data-aa="fade"].aa-in  { animation-name: aa-fade; }
${R} [data-aa="line"].aa-in  { animation-name: aa-line; transform-origin: left center; }

@keyframes aa-up    { from { opacity: 0; translate: 0 ${CFG.distance}px; } to { opacity: 1; translate: 0 0; } }
@keyframes aa-up-sm { from { opacity: 0; translate: 0 14px; }               to { opacity: 1; translate: 0 0; } }
@keyframes aa-left  { from { opacity: 0; translate: -${CFG.distance + 12}px 0; } to { opacity: 1; translate: 0 0; } }
@keyframes aa-right { from { opacity: 0; translate: ${CFG.distance + 12}px 0; }  to { opacity: 1; translate: 0 0; } }
@keyframes aa-zoom  { from { opacity: 0; scale: .94; } to { opacity: 1; scale: 1; } }
@keyframes aa-fade  { from { opacity: 0; } to { opacity: 1; } }
@keyframes aa-line  { from { scale: 0 1; } to { scale: 1 1; } }

/* ---------- الهيدر: ينزل من فوق ---------- */
@keyframes aa-header { from { opacity: 0; translate: 0 -100%; } to { opacity: 1; translate: 0 0; } }
${R} .site-header { animation: aa-header .8s var(--aa-ease) backwards; }

/* ---------- الهيرو: نصوص بتتتابع + القوس بيتفتح + اللوح الدهبي بيتمدد ---------- */
${R} .hero__content > * { animation: aa-up 1s var(--aa-ease) backwards; }
${R} .hero__content > *:nth-child(1) { animation-delay: .30s; }
${R} .hero__content > *:nth-child(2) { animation-delay: .45s; }
${R} .hero__content > *:nth-child(3) { animation-delay: .60s; }
${R} .hero__content > *:nth-child(4) { animation-delay: .75s; }

@keyframes aa-arch  { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes aa-panel { from { scale: 0 1; } to { scale: 1 1; } }
${R} .hero--split .hero__media img { animation: aa-arch 1.3s var(--aa-ease) .25s backwards; }
${R} .hero--split .hero__media::before { transform-origin: right center; animation: aa-panel 1.1s var(--aa-ease) backwards; }

/* ---------- زرار primary: لمعة بتعدّي عليه ---------- */
.btn--primary { position: relative; overflow: hidden; }
.btn--primary::after {
  content: ""; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,.30), transparent);
  transform: skewX(-20deg); translate: 0 0; pointer-events: none;
  transition: translate .8s var(--aa-ease);
}
.btn--primary:hover::after { translate: 420% 0; }

/* ---------- لينكات النافيجيشن: خط بيتمدد ---------- */
${R} .nav-item > a { position: relative; }
${R} .nav-item > a::after {
  content: ""; position: absolute; left: 16px; right: 16px; bottom: 5px; height: 1.5px;
  background: var(--accent, currentColor); scale: 0 1; transform-origin: left center;
  transition: scale .4s var(--aa-ease);
}
${R} .nav-item > a:hover::after { scale: 1 1; }

/* ---------- الـ mega menu + المنيو بتاع الموبايل: عناصر بتتتابع ---------- */
${R} .nav-item--categories.is-open .mega-menu__link { animation: aa-up-sm .45s var(--aa-ease) backwards; }
${R} .mobile-nav.is-open > a,
${R} .mobile-nav.is-open .mobile-nav__categories { animation: aa-up-sm .45s var(--aa-ease) backwards; }

/* ---------- المودال: الصورة تكبر والتفاصيل تتتابع ---------- */
${R} .modal.is-open .modal-product__gallery { animation: aa-zoom .8s var(--aa-ease) .1s backwards; }
${R} .modal.is-open .modal-product__info > * { animation: aa-up-sm .6s var(--aa-ease) backwards; }

/* ---------- البحث + الفلاتر ---------- */
${R} .search-result { animation: aa-up-sm .4s var(--aa-ease) backwards; }
@keyframes aa-pop { from { opacity: 0; scale: .85; } to { opacity: 1; scale: 1; } }
${R} .filter-chip { animation: aa-pop .35s var(--aa-ease) backwards; }

/* ---------- صور المنتجات: fade-in لما تخلّص تحميل ---------- */
@keyframes aa-img { from { opacity: 0; scale: 1.06; } to { opacity: 1; scale: 1; } }
${R} img.aa-img-pre { opacity: 0; }
${R} img.aa-img-in  { animation: aa-img .8s var(--aa-ease) backwards; }

/* ---------- الكارت: bump للعداد + pulse للزرار ---------- */
@keyframes aa-bump  { 0% { scale: 1; } 40% { scale: 1.5; } 100% { scale: 1; } }
@keyframes aa-pulse { 0% { scale: 1; } 35% { scale: 1.22; } 100% { scale: 1; } }
${R} .cart-count.aa-bump  { animation: aa-bump .5s var(--aa-ease); }
${R} .aa-pulse            { animation: aa-pulse .45s var(--aa-ease); }

/* ---------- Value items: الأيقونة بتطلع شوية ---------- */
${R} .value-item__icon { transition: translate .4s var(--aa-ease); }
${R} .value-item:hover .value-item__icon { translate: 0 -6px; }

/* ---------- شريط التقدم ---------- */
.aa-progress {
  position: fixed; top: 0; left: 0; width: 100%; height: 3px; z-index: 900;
  background: linear-gradient(90deg, var(--accent, #7C1F3D), var(--taupe, #C99A3D));
  transform: scaleX(0); transform-origin: left center; pointer-events: none;
}
`;

  // الـ delays اللي محتاجة nth-child (بتتولّد بلوب بدل ما تتكتب بإيدك)
  for (let i = 1; i <= 9; i++) {
    css += `${R} .modal.is-open .modal-product__info > *:nth-child(${i}) { animation-delay: ${(0.18 + i * 0.06).toFixed(2)}s; }\n`;
  }
  for (let i = 1; i <= 8; i++) {
    css += `${R} .nav-item--categories.is-open .mega-menu__link:nth-child(${i}) { animation-delay: ${(0.05 + i * 0.045).toFixed(3)}s; }\n`;
    css += `${R} .mobile-nav.is-open > *:nth-child(${i}) { animation-delay: ${(0.08 + i * 0.06).toFixed(2)}s; }\n`;
    css += `${R} .search-result:nth-child(${i}) { animation-delay: ${(i * 0.04).toFixed(2)}s; }\n`;
  }
  css = css.replace("aa-KIND", "aa-up");

  const style = document.createElement("style");
  style.id = "Elio-animations";
  style.textContent = css;
  document.head.appendChild(style);
  document.documentElement.classList.add("aa-ready");

  /* ---------------------------------------------------------------------
     3) الـ JS
     --------------------------------------------------------------------- */
  const seen = new WeakSet();

  /* ---- Scroll reveal ---- */
  const io = new IntersectionObserver(entries => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => (a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

    visible.forEach((entry, i) => {
      const el = entry.target;
      io.unobserve(el);
      const delay = Math.min(i, CFG.maxStagger) * CFG.stagger;
      el.style.setProperty("--aa-delay", delay + "s");
      el.classList.remove("aa-pre");
      el.classList.add("aa-in");

      const cleanup = () => {
        el.removeEventListener("animationend", onEnd);
        el.classList.remove("aa-in");
        el.removeAttribute("data-aa");
        el.style.removeProperty("--aa-delay");
      };
      const onEnd = ev => { if (ev.target === el && /^aa-/.test(ev.animationName)) cleanup(); };
      el.addEventListener("animationend", onEnd);
      setTimeout(cleanup, (CFG.duration + delay + 1.5) * 1000); // احتياطي
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  function prepare(el, variant) {
    if (seen.has(el)) return;
    seen.add(el);
    el.setAttribute("data-aa", variant);
    el.classList.add("aa-pre");
    io.observe(el);
  }

  /* ---- صور المنتجات ---- */
  function prepareImage(img) {
    if (seen.has(img) || img.complete) return;
    seen.add(img);
    img.classList.add("aa-img-pre");
    const done = () => {
      img.classList.remove("aa-img-pre");
      img.classList.add("aa-img-in");
      setTimeout(() => img.classList.remove("aa-img-in"), 1000);
    };
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", () => img.classList.remove("aa-img-pre"), { once: true });
  }

  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    TARGETS.forEach(([sel, variant]) => {
      if (root.matches && root.matches(sel)) prepare(root, variant);
      root.querySelectorAll(sel).forEach(el => prepare(el, variant));
    });
    root.querySelectorAll(".product-card__media img").forEach(prepareImage);
  }

  /* ---- Cart bump ---- */
  const lastCount = new WeakMap();
  const t0 = performance.now();
  function checkCartCount(el) {
    const now = el.textContent;
    const prev = lastCount.get(el);
    lastCount.set(el, now);
    if (performance.now() - t0 < 1500) return; // تجاهل التحديث الأول وقت تحميل الصفحة
    if (prev === undefined || prev === now) return;
    el.classList.remove("aa-bump");
    void el.offsetWidth;
    el.classList.add("aa-bump");
    setTimeout(() => el.classList.remove("aa-bump"), 600);
  }

  /* ---- مراقبة أي عناصر بتتضاف ديناميكيًا (كروت المنتجات، نتايج البحث...) ---- */
  const mo = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(n => scan(n));
      m.removedNodes.forEach(n => {
        if (n.nodeType === 1) {
          if (n.hasAttribute && n.hasAttribute("data-aa")) io.unobserve(n);
          n.querySelectorAll && n.querySelectorAll("[data-aa]").forEach(el => io.unobserve(el));
        }
      });
      const t = m.target && m.target.nodeType === 1 ? m.target : null;
      if (t && t.classList.contains("js-cart-count")) checkCartCount(t);
    });
  });

  /* ---- Pulse لزرار الكارت عند الضغط (بيشتغل جنب الـ handler الأساسي من غير ما يتدخل فيه) ---- */
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-cart-id]");
    if (!btn) return;
    document.querySelectorAll(`[data-cart-id="${CSS.escape(btn.dataset.cartId)}"]`).forEach(b => {
      b.classList.remove("aa-pulse");
      void b.offsetWidth;
      b.classList.add("aa-pulse");
      setTimeout(() => b.classList.remove("aa-pulse"), 550);
    });
  });

  /* ---- Scroll progress bar ---- */
  function initProgress() {
    if (!CFG.progressBar || document.querySelector(".aa-progress")) return;
    const bar = document.createElement("div");
    bar.className = "aa-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    let ticking = false;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
      bar.style.transform = `scaleX(${p})`;
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  function start() {
    mo.observe(document.documentElement, { childList: true, subtree: true });
    scan(document.body);
    document.querySelectorAll(".js-cart-count").forEach(el => lastCount.set(el, el.textContent));
    initProgress();
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start);
})();
