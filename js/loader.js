/* =========================================================================
   LOADER.JS  —  Elio  ("Syringe Loader")
   ملف مستقل بالكامل (CSS + HTML + JS في ملف واحد) زي animations.js.
   - حقنة بتتملي بسائل شفاف (زي الفيلر) والمكبس بيطلع مع نسبة التحميل.
     في الآخر نقطة بتنزل من طرف الإبرة وبعدها الصفحة بتظهر.
   - بيظهر في أول زيارة بس (لكل جلسة/تاب). بعد كده مبيعملش أي حاجة.
   - مبيغيّرش أي حاجة في الكود الأساسي (HTML / style.css / app.js ...).
   - لازم يتحط في <head> قبل ملفات الـ CSS عشان يغطي الصفحة من أول لحظة:
       <script src="js/loader.js"></script>
   - للإلغاء الكامل: شيل سطر السكريبت ده من الصفحات.
   - بيحترم prefers-reduced-motion (لو مفعّلة بيتخطى اللودر خالص).
   - لما يخلص بيبعت event اسمه "loader:done" وبيضيف class "is-loaded" على <html>.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     1) الإعدادات
     --------------------------------------------------------------------- */
  var CFG = {
    storage: "session",          // "session" = مرة لكل تاب/جلسة  |  "local" = مرة واحدة بس في عمر الزائر
    key: "elio_loader_seen",
    brand: "Elio",
    minTime: 2000,               // أقل مدة يفضل فيها اللودر (ms) — كفاية عشان الحقنة تتملي بشكل واضح
    maxTime: 8000,               // حد أمان: يخلص حتى لو في حاجة اتعلقت (ms)
    phases: [[0, "Preparing the catalog"], [35, "Setting up your space"], [75, "Almost there"], [100, "Welcome"]]
  };
  /* Arabic site: show the status messages in Arabic (language is set by i18n.js, loaded just before this file) */
  if (window.I18N && I18N.isAr) {
    CFG.phases = [[0, "نجهّز الكتالوج"], [35, "نُعدّ لك المكان"], [75, "على وشك الانتهاء"], [100, "أهلًا بك"]];
  }

  /* ---------------------------------------------------------------------
     2) شروط التشغيل: أول زيارة بس + مفيش reduced-motion
     --------------------------------------------------------------------- */
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    var store = CFG.storage === "local" ? window.localStorage : window.sessionStorage;
    if (store.getItem(CFG.key)) return;   // شافه قبل كده
    store.setItem(CFG.key, "1");
  } catch (e) { return; }                 // التخزين مقفول (private mode) -> مفيش لودر أحسن من لودر في كل صفحة

  var root = document.documentElement;

  /* ---------------------------------------------------------------------
     3) الـ CSS
     --------------------------------------------------------------------- */
  var css = [
    "#ld{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;",
    "gap:clamp(10px,2.4vmin,22px);color:#FCF6FB;font-family:'Plus Jakarta Sans','Helvetica Neue','Segoe UI',system-ui,-apple-system,sans-serif;",
    "background:radial-gradient(90% 80% at 50% 42%,#4D3D66 0%,#3A2A4D 55%,#2A1C3A 100%);",
    "-webkit-user-select:none;user-select:none;overscroll-behavior:contain}",
    "#ld.revealing{-webkit-mask-image:radial-gradient(circle at 50% 50%,transparent var(--hole,0px),#000 calc(var(--hole,0px) + 2px));",
    "mask-image:radial-gradient(circle at 50% 50%,transparent var(--hole,0px),#000 calc(var(--hole,0px) + 2px))}",
    "#ld *{box-sizing:border-box}",
    "#ld .ld-stage{position:relative;z-index:1;width:min(68vmin,400px);aspect-ratio:1}",
    "#ld .ld-svg{width:100%;height:100%;overflow:visible;display:block}",
    "#ld .ld-count{position:relative;z-index:1;display:flex;align-items:flex-start;justify-content:center;",
    "font-family:'Helvetica Neue','Segoe UI',system-ui,-apple-system,Arial,sans-serif;",
    "font-size:clamp(46px,10.5vmin,92px);line-height:1;font-weight:200;letter-spacing:-.03em;font-variant-numeric:tabular-nums}",
    "#ld .ld-col{position:relative;display:inline-block;width:.6em;height:1em;overflow:hidden;text-align:center}",
    "#ld .ld-col.h{width:0;opacity:0;transition:width .45s cubic-bezier(.2,.9,.2,1),opacity .45s}",
    "#ld .ld-col.h.on{width:.6em;opacity:1}",
    "#ld .ld-col .d{position:absolute;inset:0;line-height:1}",
    "#ld .ld-col .in{animation:ld-in .38s cubic-bezier(.2,.9,.2,1) both}",
    "#ld .ld-col .out{animation:ld-out .3s ease-in both}",
    "@keyframes ld-in{from{transform:translateY(70%);opacity:0;filter:blur(5px)}}",
    "@keyframes ld-out{to{transform:translateY(-70%);opacity:0;filter:blur(5px)}}",
    "#ld .ld-pct{align-self:flex-start;margin:.14em 0 0 .12em;font-size:.3em;font-weight:400;opacity:.6;letter-spacing:0}",
    "#ld .ld-status{position:relative;z-index:1;height:1.4em;font-size:clamp(13px,2.2vmin,16px);opacity:.75}",
    "#ld .ld-status.sw{animation:ld-swap .5s cubic-bezier(.2,.9,.2,1)}",
    "@keyframes ld-swap{from{opacity:0;transform:translateY(6px)}}",
    "#ld .ld-brand{position:absolute;left:0;right:0;bottom:max(28px,env(safe-area-inset-bottom));text-align:center;",
    "font-family:'Fraunces',Georgia,serif;font-size:1.25rem;font-weight:480;letter-spacing:.02em;opacity:.85}",
    "#ld-shock{position:fixed;left:50%;top:50%;z-index:100000;width:0;height:0;opacity:0;border-radius:50%;box-sizing:border-box;",
    "pointer-events:none;transform:translate(-50%,-50%);border:2px solid rgba(252,246,251,.9);",
    "box-shadow:0 0 28px 3px #FFAFCC,0 0 90px 10px #CDB4DB,inset 0 0 30px 2px #A2D2FF}"
  ].join("");

  /* ---------------------------------------------------------------------
     4) الـ HTML  (الحقنة مرسومة أفقي جوه الـ SVG وبتتلف -45° بالكود)
        محور الحقنة = المحور X:  الإبرة عند x سالب، المكبس عند x موجب.
     --------------------------------------------------------------------- */
  var ticks = "";
  for (var t = -40; t <= 40; t += 10) {
    var long = (t % 20 === 0);
    ticks += '<line x1="' + t + '" y1="7" x2="' + t + '" y2="' + (long ? 3.4 : 5.2) + '"/>';
  }
  var bubbles = "";
  for (var b = 0; b < 8; b++) bubbles += '<circle class="ld-bub" r="0.9"/>';

  var html = [
    '<div class="ld-stage">',
    '<svg class="ld-svg" viewBox="-125 -125 250 250" aria-hidden="true">',
    '<defs>',
    '<radialGradient id="ld-aura-g" cx="50%" cy="50%" r="50%">',
    '<stop offset="0" stop-color="#A2D2FF" stop-opacity=".30"/><stop offset=".6" stop-color="#CDB4DB" stop-opacity=".10"/><stop offset="1" stop-color="#CDB4DB" stop-opacity="0"/>',
    '</radialGradient>',
    /* السائل الشفاف: تقريبًا زجاج — بس بياخد لمعة من الحواف وتدرّج خفيف */
    '<linearGradient id="ld-liq" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0" stop-color="#FFFFFF" stop-opacity=".62"/><stop offset=".22" stop-color="#D9EEFF" stop-opacity=".34"/>',
    '<stop offset=".55" stop-color="#BDE0FE" stop-opacity=".24"/><stop offset=".85" stop-color="#E6D6F0" stop-opacity=".34"/>',
    '<stop offset="1" stop-color="#FFFFFF" stop-opacity=".55"/>',
    '</linearGradient>',
    '<linearGradient id="ld-stop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC8DD"/><stop offset="1" stop-color="#E88DB3"/></linearGradient>',
    '<clipPath id="ld-clip"><path d="M50 -6.2 H-52 L-63 -1.5 V1.5 L-52 6.2 H50 Z"/></clipPath>',
    '</defs>',
    '<circle id="ld-aura" r="120" fill="url(#ld-aura-g)" opacity="0"/>',
    '<g id="ld-syr">',
    /* الإبرة + الـ hub */
    '<path d="M-72 -0.75 L-114 -0.75 L-124 0.75 L-72 0.75 Z" fill="#FCF6FB" fill-opacity=".95"/>',
    '<rect x="-72" y="-3" width="8" height="6" rx="1.2" fill="#A2D2FF"/>',
    /* زجاج الأسطوانة */
    '<path d="M50 -7 H-52 L-64 -1.8 V1.8 L-52 7 H50" fill="#FFFFFF" fill-opacity=".05"/>',
    /* السائل (بيتقصّ على شكل الأسطوانة) + الفقاقيع */
    '<g clip-path="url(#ld-clip)">',
    '<rect id="ld-liquid" x="-65" y="-7" width="0" height="14" fill="url(#ld-liq)"/>',
    '<line id="ld-face" x1="0" y1="-6.2" x2="0" y2="6.2" stroke="#FFFFFF" stroke-opacity=".7" stroke-width=".9" opacity="0"/>',
    '<g id="ld-bubs" fill="#FFFFFF" fill-opacity=".12" stroke="#FFFFFF" stroke-opacity=".7" stroke-width=".45">' + bubbles + '</g>',
    '</g>',
    /* جناح الأسطوانة */
    '<rect x="50" y="-13" width="3.6" height="26" rx="1.8" fill="#FCF6FB" fill-opacity=".92"/>',
    /* المكبس: بيتحرك كله مع بعض (transform) */
    '<g id="ld-plg">',
    '<rect x="8" y="-1.5" width="107.5" height="3" rx="1" fill="#FCF6FB" fill-opacity=".9"/>',
    '<line x1="8" y1="0" x2="115.5" y2="0" stroke="#3A2A4D" stroke-opacity=".28" stroke-width=".6"/>',
    '<rect x="115.5" y="-11" width="4.5" height="22" rx="2.2" fill="#FCF6FB"/>',
    '<rect x="0" y="-6.2" width="8" height="12.4" rx="1.8" fill="url(#ld-stop)"/>',
    '<line x1="2.7" y1="-5.6" x2="2.7" y2="5.6" stroke="#3A2A4D" stroke-opacity=".35" stroke-width=".7"/>',
    '<line x1="5.3" y1="-5.6" x2="5.3" y2="5.6" stroke="#3A2A4D" stroke-opacity=".35" stroke-width=".7"/>',
    '</g>',
    /* إطار الزجاج + اللمعات + التدريج فوق كل حاجة */
    '<path d="M50 -7 H-52 L-64 -1.8 V1.8 L-52 7 H50" fill="none" stroke="#FCF6FB" stroke-opacity=".62" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round"/>',
    '<line x1="-44" y1="-4.6" x2="44" y2="-4.6" stroke="#FFFFFF" stroke-opacity=".5" stroke-width="1.3" stroke-linecap="round"/>',
    '<line x1="-30" y1="-2.6" x2="16" y2="-2.6" stroke="#FFFFFF" stroke-opacity=".22" stroke-width=".7" stroke-linecap="round"/>',
    '<line x1="-44" y1="4.4" x2="30" y2="4.4" stroke="#FFFFFF" stroke-opacity=".16" stroke-width=".8" stroke-linecap="round"/>',
    '<g stroke="#FCF6FB" stroke-opacity=".55" stroke-width=".6" stroke-linecap="round">' + ticks + '</g>',
    '</g>',
    /* النقطة اللي بتنزل من الإبرة في الآخر */
    '<ellipse id="ld-drop" rx="0" ry="0" fill="#DEF0FF" fill-opacity=".55" stroke="#FFFFFF" stroke-opacity=".85" stroke-width=".8" opacity="0"/>',
    '</svg></div>',
    '<div class="ld-count" aria-hidden="true"><span class="ld-col h" data-c="h"></span><span class="ld-col" data-c="t"></span><span class="ld-col" data-c="o"></span><span class="ld-pct">%</span></div>',
    '<div class="ld-status" aria-hidden="true"></div>',
    '<div class="ld-brand"></div>'
  ].join("");

  var styleEl = document.createElement("style");
  styleEl.id = "ld-style";
  styleEl.textContent = css;
  (document.head || root).appendChild(styleEl);

  var el = document.createElement("div");
  el.id = "ld";
  el.setAttribute("role", "progressbar");
  el.setAttribute("aria-label", "Loading");
  el.setAttribute("aria-valuemin", "0");
  el.setAttribute("aria-valuemax", "100");
  el.setAttribute("aria-valuenow", "0");
  el.innerHTML = html;
  var shock = document.createElement("div");
  shock.id = "ld-shock";
  root.appendChild(el);      // بنضيفه على <html> عشان يغطي الصفحة قبل ما الـ <body> يتبني
  root.appendChild(shock);
  root.style.overflow = "hidden";
  el.querySelector(".ld-brand").textContent = CFG.brand;

  /* ---------------------------------------------------------------------
     5) الحركة
     --------------------------------------------------------------------- */
  var $ = function (s) { return el.querySelector(s); };
  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var easeInOut = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  var syr = $("#ld-syr"), plg = $("#ld-plg"), liquid = $("#ld-liquid"), face = $("#ld-face"), aura = $("#ld-aura"), drop = $("#ld-drop");
  var countBox = $(".ld-count"), statusEl = $(".ld-status");
  var colH = $('[data-c="h"]'), colT = $('[data-c="t"]'), colO = $('[data-c="o"]');

  /* أبعاد الحقنة (بوحدات الـ SVG) */
  var TIP_X = -124;            // طرف الإبرة
  var LIQ_X0 = -64;            // بداية السائل (عند الـ hub)
  var SX0 = -48, SX1 = 38;     // مكان وش المكبس: فاضية -> مليانة
  var PAD_END0 = 72, PAD_END1 = 158;   // طرف المقبض في الحالتين (بنستخدمهم عشان نوسّط الرسمة)
  var C0 = (TIP_X + PAD_END0) / 2, C1 = (TIP_X + PAD_END1) / 2;
  var COS45 = Math.SQRT1_2;

  var bubs = Array.prototype.map.call(el.querySelectorAll(".ld-bub"), function (c, i) {
    return { el: c, speed: .26 + (i % 4) * .07, ph: i / 8, wob: 1.6 + i * .9, r: .6 + (i % 3) * .3 };
  });

  /* عداد الأرقام: خانة الآحاد بتتغيّر بسرعة فبنبدّلها فورًا، والعشرات/المئات بتلف بحركة */
  function put(col, ch, animate) {
    if (col.getAttribute("data-v") === ch) return;
    col.setAttribute("data-v", ch);
    if (!animate) {
      col.innerHTML = "";
      var s = document.createElement("span");
      s.className = "d"; s.textContent = ch;
      col.appendChild(s);
      return;
    }
    Array.prototype.forEach.call(col.children, function (o) {
      o.className = "d out";
      o.addEventListener("animationend", function () { if (o.parentNode) o.parentNode.removeChild(o); }, { once: true });
    });
    while (col.children.length > 3) col.removeChild(col.firstChild);
    var n = document.createElement("span");
    n.className = "d in"; n.textContent = ch;
    col.appendChild(n);
  }
  function setCount(v) {
    colH.classList.toggle("on", v >= 100);
    put(colH, v >= 100 ? "1" : "0", true);
    put(colT, v >= 100 ? "0" : String(Math.floor(v / 10) % 10), true);
    put(colO, v >= 100 ? "0" : String(v % 10), false);
    el.setAttribute("aria-valuenow", v);
  }

  /* التقدم الحقيقي: الـ DOM + الصور + حدث load */
  var loaded = false;
  window.addEventListener("load", function () { loaded = true; }, { once: true });
  if (document.readyState === "complete") loaded = true;

  function realProgress() {
    if (loaded) return 1;
    if (document.readyState === "loading") return 0;
    var n = 0, c = 0, imgs = document.images;
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].loading === "lazy") continue;
      n++; if (imgs[i].complete) c++;
    }
    return .3 + .6 * (n ? c / n : 1);
  }

  var raf = 0, start = performance.now(), last = start, T = 0;
  var phase = "load", phaseStart = 0, shown = 0, lastV = -1, lastPhase = -1, maxR = 0;
  var DOSE_MS = 800, REVEAL_MS = 1000;

  function complete() {
    cancelAnimationFrame(raf);
    if (el.parentNode) el.parentNode.removeChild(el);
    if (shock.parentNode) shock.parentNode.removeChild(shock);
    if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
    root.style.overflow = "";
    root.classList.add("is-loaded");
    document.dispatchEvent(new CustomEvent("loader:done"));
  }

  function startReveal() {
    maxR = Math.hypot(window.innerWidth, window.innerHeight) / 2 * 1.06;
    el.classList.add("revealing");
    root.classList.add("is-loaded");
  }

  function doReveal(k) {
    var r = maxR * easeInOut(k);
    el.style.setProperty("--hole", r + "px");
    if (r > 3) {
      shock.style.width = shock.style.height = (r * 2) + "px";
      shock.style.opacity = k < .8 ? 1 : (1 - k) / .2;
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    var elapsed = now - start;
    T += dt;

    if (phase === "load") {
      if (elapsed > CFG.maxTime) loaded = true;
      var real = realProgress();
      if (!loaded) real = Math.min(.92, Math.max(real, elapsed / CFG.maxTime * .9));   // زحف بطيء عشان مايبانش متجمّد
      var target = Math.min(real, clamp(elapsed / CFG.minTime));
      shown += (target - shown) * (1 - Math.exp(-dt * 5));
      if (target >= 1 && shown > .996) { shown = 1; phase = "dose"; phaseStart = now; }
    }

    var dose = 0;      // 0..1 خلال مرحلة النقطة
    if (phase === "dose") {
      dose = clamp((now - phaseStart) / DOSE_MS);
      if (dose >= 1) { phase = "reveal"; phaseStart = now; startReveal(); }
    } else if (phase === "reveal") {
      var k2 = clamp((now - phaseStart) / REVEAL_MS);
      dose = 1;
      doReveal(k2);
      if (k2 >= 1) { complete(); return; }
    }

    var p = shown;

    /* الحقنة: بتتوسّط وبتتلف -45° (الإبرة تحت الشمال، المكبس فوق اليمين) */
    var c = lerp(C0, C1, p);
    syr.setAttribute("transform", "rotate(-45) translate(" + (-c).toFixed(2) + " 0)");

    /* المكبس بيتسحب مع النسبة، وفي الآخر بيدفع شوية عشان تنزل النقطة */
    var push = easeInOut(clamp(dose / .5)) * 8;
    var sx = lerp(SX0, SX1, p) - push;
    plg.setAttribute("transform", "translate(" + sx.toFixed(2) + " 0)");

    /* السائل: يدخل من الإبرة أول 10% وبعدها يمشي ورا المكبس */
    var front = lerp(LIQ_X0, sx, easeOut(clamp(p / .1)));
    liquid.setAttribute("width", Math.max(0, front - (-65)).toFixed(2));
    face.setAttribute("x1", front.toFixed(2)); face.setAttribute("x2", front.toFixed(2));
    face.setAttribute("opacity", clamp((front - LIQ_X0) / 6).toFixed(2));

    /* الفقاقيع: بتدخل من طرف الإبرة وتمشي مع السحب لحد المكبس */
    for (var i = 0; i < bubs.length; i++) {
      var o = bubs[i];
      var u = (T * o.speed + o.ph) % 1;
      var bx = lerp(LIQ_X0 - 2, front - 3, u);
      var amp = 1 + 3.4 * clamp((bx - LIQ_X0) / 14);
      o.el.setAttribute("cx", bx.toFixed(2));
      o.el.setAttribute("cy", (Math.sin(T * 1.7 + i * 1.9) * amp * .8).toFixed(2));
      o.el.setAttribute("r", o.r.toFixed(2));
      o.el.style.opacity = (Math.pow(Math.sin(Math.PI * u), .8) * clamp((front - LIQ_X0) / 12)).toFixed(3);
    }

    /* الهالة + اختفاء الحقنة أثناء النقطة */
    var vanish = clamp((dose - .55) / .45);
    aura.setAttribute("opacity", ((.35 + .65 * p) * (1 - vanish)).toFixed(3));
    syr.style.opacity = (1 - vanish).toFixed(3);

    /* النقطة: بتتكوّن على طرف الإبرة وبعدين تنزل لتحت */
    if (dose > 0 && dose < 1) {
      var lx = TIP_X - c;                              // طرف الإبرة بعد الإزاحة (محلي)
      var tx = lx * COS45, ty = -lx * COS45;           // بعد تدوير -45°
      var f = easeOut(clamp(dose / .4));
      var g = clamp((dose - .4) / .6);
      var rx = 4.4 * f, ry = rx * (1 + .9 * g);
      drop.setAttribute("cx", tx.toFixed(2));
      drop.setAttribute("cy", (ty + ry * .9 + 58 * g * g).toFixed(2));
      drop.setAttribute("rx", rx.toFixed(2));
      drop.setAttribute("ry", ry.toFixed(2));
      drop.setAttribute("opacity", (1 - g * g).toFixed(3));
    } else {
      drop.setAttribute("opacity", "0");
    }

    /* العداد + الحالة */
    var v = Math.round(p * 100);
    if (v !== lastV) { lastV = v; setCount(v); }
    var idx = 0;
    for (var j = 0; j < CFG.phases.length; j++) if (v >= CFG.phases[j][0]) idx = j;
    if (idx !== lastPhase) {
      lastPhase = idx;
      statusEl.textContent = CFG.phases[idx][1];
      statusEl.classList.remove("sw"); void statusEl.offsetWidth; statusEl.classList.add("sw");
    }
    var fade = (1 - clamp((dose - .3) / .7)).toFixed(3);
    countBox.style.opacity = fade;
    statusEl.style.opacity = (fade * .75).toFixed(3);
  }

  setCount(0);
  raf = requestAnimationFrame(frame);
})();