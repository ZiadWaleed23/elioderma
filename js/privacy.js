/* =========================================================================
   PRIVACY.JS — behaviour for privacy.html only
   ========================================================================= */
(function () {
  /* Highlight the table-of-contents link of the section being read */
  const links = Array.from(document.querySelectorAll(".legal__toc a"));
  const sections = links.map(a => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    sections.forEach(s => io.observe(s));
  }

  /* "Clear my saved data" button: removes the cart + saved checkout details
     this site keeps in the visitor's browser (same keys used by app.js / cart.js). */
  const KEYS = ["Elio_cart", "Elio_customer"];
  const btn = document.getElementById("clear-local-data");
  const msg = document.getElementById("clear-local-msg");
  if (btn) {
    btn.addEventListener("click", () => {
      try { KEYS.forEach(k => localStorage.removeItem(k)); } catch (e) { /* storage blocked */ }
      document.querySelectorAll(".js-cart-count").forEach(el => { el.textContent = "0"; });
      if (msg) msg.textContent = t("js.cleared");
    });
  }
})();
