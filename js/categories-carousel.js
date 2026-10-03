/* =========================================================================
   CATEGORIES-CAROUSEL.JS — Elio
   كاروسيل الأقسام (من SITE_CONFIG.categories في config.js).
   - لفّ مستمر وناعم (requestAnimationFrame) بدل القفزات: بيمشي بسرعة ثابتة
     بالبكسل في الثانية، ومفيش نهاية — بيلف في دايرة من غير ما يرجع لورا.
   - لما تقف بالماوس/الصباع بيهدّى تدريجيًا (ease) مش بيقف فجأة.
   - الأسهم بتحرّك بحركة easing ناعمة، والسحب باليد شغّال عادي.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------------- الإعدادات ---------------- */
  const AUTOPLAY     = true;   // false = يقفل اللف التلقائي
  const SPEED        = 45;     // سرعة اللف (بكسل / ثانية) — قلّلها للأبطأ
  const EASE_RATE    = 3;      // سرعة التهدئة/التسارع عند الوقوف والرجوع (أقل = أنعم)
  const RESUME_DELAY = 1200;   // ms قبل ما يرجع يلف بعد التحكم اليدوي
  const ARROW_MS     = 900;    // مدة حركة السهم (ms)

  function init() {
    const track = document.getElementById("categories-carousel-track");
    if (!track || typeof SITE_CONFIG === "undefined") return;

    /* ---------- بناء الكروت ---------- */
    const cardsHTML = SITE_CONFIG.categories.map(cat => `
      <a class="cat-card" href="products.html?category=${encodeURIComponent(cat.id)}" aria-label="${catName(cat)}">
        <img class="cat-card__img" src="${cat.image}" alt="" loading="lazy" width="900" height="1100">
        <div class="cat-card__body">
          <h3 class="cat-card__title">${catName(cat)}</h3>
          <p class="cat-card__desc">${catDescription(cat)}</p>
          <span class="cat-card__cta">${t("js.browse")}
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </span>
        </div>
      </a>`).join("");
    track.innerHTML = cardsHTML;

    // نسخة تانية من الكروت عشان اللف يكون بلا نهاية (بدون قفزة ملحوظة)
    const originals = Array.from(track.children);
    originals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.tabIndex = -1;
      track.appendChild(clone);
    });

    const prev = document.getElementById("cat-prev");
    const next = document.getElementById("cat-next");
    const wrap = track.parentElement;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- قياسات ---------- */
    let setW = 0, stepW = 300;
    const measure = () => {
      const first = originals[0];
      const firstClone = track.children[originals.length];
      setW  = firstClone.offsetLeft - first.offsetLeft;               // عرض مجموعة كروت كاملة (شامل الـ gap)
      stepW = originals.length > 1 ? originals[1].offsetLeft - first.offsetLeft : first.offsetWidth;
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });

    /* ---------- الحالة ---------- */
    let pos = track.scrollLeft;   // الموضع بالـ float (أنعم من scrollLeft اللي بيتقرّب)
    let applied = pos;            // آخر قيمة كتبناها في scrollLeft
    let factor = AUTOPLAY && !reduceMotion ? 1 : 0;   // معامل السرعة الحالي (0..1)
    let target = factor;          // المعامل المطلوب
    let tween = null;             // حركة السهم الحالية
    let resumeTimer = null, running = false, last = 0;
    let inView = true;

    const apply = () => { track.scrollLeft = pos; applied = track.scrollLeft; };
    const wrapPos = () => { if (setW) { while (pos >= setW) pos -= setW; while (pos < 0) pos += setW; } };
    const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);   // easeInOutCubic

    /* ---------- اللوب الرئيسي ---------- */
    function frame(now) {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      // لو المستخدم حرّك الـ scroll بإيده (سحب / wheel) نتابعه بدل ما نتعارض معاه
      if (Math.abs(track.scrollLeft - applied) > 1.5) { pos = track.scrollLeft; applied = pos; tween = null; }

      if (tween) {
        const t = Math.min((now - tween.start) / tween.dur, 1);
        pos = tween.from + (tween.to - tween.from) * ease(t);
        if (t >= 1) tween = null;
      } else {
        factor += (target - factor) * Math.min(1, dt * EASE_RATE);   // تهدئة ناعمة
        pos += SPEED * factor * dt;
      }

      // لو عدّينا المجموعة الأولى نرجع بمقدار عرضها (النسخة الثانية متطابقة فمفيش قفزة)
      if (!tween) wrapPos();
      else if (pos >= setW) { pos -= setW; tween.from -= setW; tween.to -= setW; }
      apply();
      requestAnimationFrame(frame);
    }
    const startLoop = () => {
      if (running || (!inView) || document.hidden) return;
      running = true; last = performance.now();
      pos = track.scrollLeft; applied = pos;
      requestAnimationFrame(frame);
    };
    const stopLoop = () => { running = false; };

    /* ---------- إيقاف / استئناف ---------- */
    const canPlay = AUTOPLAY && !reduceMotion;
    const pause  = () => { clearTimeout(resumeTimer); target = 0; };
    const resume = (delay = 0) => {
      clearTimeout(resumeTimer);
      if (!canPlay) return;
      resumeTimer = setTimeout(() => { target = 1; }, delay);
    };

    wrap.addEventListener("mouseenter", pause);
    wrap.addEventListener("mouseleave", () => resume(300));
    wrap.addEventListener("focusin", pause);
    wrap.addEventListener("focusout", () => resume(300));
    wrap.addEventListener("touchstart", pause, { passive: true });
    wrap.addEventListener("touchend", () => resume(RESUME_DELAY), { passive: true });
    wrap.addEventListener("wheel", () => { pause(); resume(RESUME_DELAY); }, { passive: true });

    document.addEventListener("visibilitychange", () => (document.hidden ? stopLoop() : startLoop()));
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        inView ? startLoop() : stopLoop();
      }, { threshold: 0.1 }).observe(wrap);
    }

    /* ---------- الأسهم ---------- */
    function go(dir) {
      const from0 = track.scrollLeft;
      pos = from0; wrapPos();
      if (dir < 0 && pos - stepW < 0) pos += setW;       // نقفز للنسخة التانية بشكل غير مرئي قبل الرجوع
      apply();
      const to = pos + dir * stepW;
      if (reduceMotion) { pos = to; wrapPos(); apply(); return; }
      tween = { from: pos, to, start: performance.now(), dur: ARROW_MS };
      pause(); resume(RESUME_DELAY + ARROW_MS);
      startLoop();
    }
    prev && prev.addEventListener("click", () => go(-1));
    next && next.addEventListener("click", () => go(1));

    startLoop();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();