/* =========================================================================
   TERMS.JS — behaviour for terms.html only
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
})();
