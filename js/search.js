/* =========================================================================
   SEARCH.JS
   Global search overlay, available from the nav search icon on every page.
   Performs a live, client-side match against PRODUCTS by name, brand,
   category and tags.
   ========================================================================= */

const GlobalSearch = {
  MAX_RESULTS: 6,

  init() {
    this.overlay = $("#search-overlay");
    this.input = $("#search-overlay-input");
    this.resultsEl = $("#search-overlay-results");
    this.countEl = $("#search-overlay-count");
    if (!this.overlay) return;

    $$(".js-open-search").forEach(btn => {
      btn.addEventListener("click", () => this.open());
    });
    $("#search-overlay-close")?.addEventListener("click", () => this.close());
    this.overlay.addEventListener("click", e => {
      if (e.target === this.overlay) this.close();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") this.close();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        this.open();
      }
    });
    this.input?.addEventListener("input", () => this.runSearch());
    $("#search-overlay-clear")?.addEventListener("click", () => {
      this.input.value = "";
      this.runSearch();
      this.input.focus();
    });
    $("#search-overlay-form")?.addEventListener("submit", e => {
      e.preventDefault();
      const term = this.input.value.trim();
      if (term) window.location.href = `products.html?search=${encodeURIComponent(term)}`;
    });
  },

  open() {
    this.overlay.classList.add("is-open");
    this.overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    setTimeout(() => this.input?.focus(), 60);
    this.runSearch();
  },

  close() {
    this.overlay.classList.remove("is-open");
    this.overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  },

  runSearch() {
    const rawTerm = (this.input?.value || "").trim();
    const term = I18N.normalize(rawTerm);

    if (!term) {
      this.resultsEl.innerHTML = "";
      this.countEl.textContent = t("search.hint");
      return;
    }

    const matches = PRODUCTS.filter(p => productSearchText(p).includes(term));

    if (!matches.length) {
      this.countEl.textContent = t("search.none_title");
      this.resultsEl.innerHTML = `
        <div class="empty-state">
          <p class="empty-state__title">${t("search.none_title")}</p>
          <p class="empty-state__body">${t("search.none_body")}</p>
        </div>
      `;
      return;
    }

    this.countEl.textContent = I18N.plural("search.found", matches.length);
    const shown = matches.slice(0, this.MAX_RESULTS);

    this.resultsEl.innerHTML = shown.map(p => `
      <button class="search-result" data-search-result-id="${p.id}">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="search-result__text">
          <strong>${p.name}</strong>
          <em>${getBrandById(p.brand)} &nbsp;·&nbsp; ${catName(getCategoryById(p.category))}</em>
        </span>
      </button>
    `).join("") + (matches.length > this.MAX_RESULTS ? `
      <a class="search-result search-result--all" href="products.html?search=${encodeURIComponent(rawTerm)}">
        ${t("search.view_all", { n: matches.length })} <span class="search-result__arrow" aria-hidden="true">&rarr;</span>
      </a>` : "");
  }
};

document.addEventListener("click", e => {
  const result = e.target.closest("[data-search-result-id]");
  if (!result) return;
  const id = result.dataset.searchResultId;
  GlobalSearch.close();
  if ($("#products-page")) {
    openProductModal(id);
  } else {
    window.location.href = `products.html?view=${encodeURIComponent(id)}`;
  }
});

document.addEventListener("DOMContentLoaded", () => GlobalSearch.init());
