/* =========================================================================
   FILTERS.JS
   Drives the Products page: search, category/brand filters,
   sorting, active-filter chips and "Load More" pagination.

   Written to work identically whether PRODUCTS has 26 items or 250 —
   nothing here assumes a fixed catalog size. All filtering happens over
   PRODUCTS in memory (no DOM re-reads), and only the currently-visible
   slice is ever rendered to the DOM.
   ========================================================================= */

const Catalog = {
  state: {
    search: "",
    category: "all",
    brand: "all",
    featuredOnly: false,
    bestsellerOnly: false,
    sort: "featured",
    visibleCount: SITE_CONFIG.catalog.gridPageInitial
  },

  els: {},

  init() {
    if (!$("#products-page")) return; // only run on products.html

    this.cacheEls();
    this.applyUrlParams();
    this.renderSidebarCategoryList();
    this.renderSidebarBrandList();
    this.bindEvents();
    this.render();

    const params = new URLSearchParams(window.location.search);
    const viewId = params.get("view");
    if (viewId && PRODUCTS.some(p => p.id === viewId)) {
      openProductModal(viewId);
    }
  },

  cacheEls() {
    this.els = {
      grid: $("#product-grid"),
      count: $("#result-count"),
      chips: $("#active-filter-chips"),
      searchInput: $("#catalog-search"),
      sortSelect: $("#sort-select"),
      categoryList: $("#filter-category-list"),
      brandList: $("#filter-brand-list"),
      featuredCheckbox: $("#filter-featured"),
      bestsellerCheckbox: $("#filter-bestseller"),
      clearBtn: $("#clear-filters"),
      loadMoreBtn: $("#load-more-btn"),
      mobileFilterToggle: $("#mobile-filter-toggle"),
      mobileSortToggle: $("#mobile-sort-toggle"),
      filterPanel: $("#filter-panel"),
      filterPanelClose: $("#filter-panel-close"),
      filterApply: $("#filter-apply"),
      filterOverlay: $("#filter-panel-overlay")
    };
  },

  applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const search = params.get("search");
    if (category && SITE_CONFIG.categories.some(c => c.id === category)) {
      this.state.category = category;
    }
    if (search) {
      this.state.search = search;
    }
  },

  renderSidebarCategoryList() {
    const list = this.els.categoryList;
    if (!list) return;
    const all = `<li><button class="filter-pill ${this.state.category === "all" ? "is-active" : ""}" data-category="all">${t("js.all_categories")}</button></li>`;
    const items = SITE_CONFIG.categories.map(cat => `
      <li><button class="filter-pill ${this.state.category === cat.id ? "is-active" : ""}" data-category="${cat.id}">${catName(cat)}</button></li>
    `).join("");
    list.innerHTML = all + items;
  },

  renderSidebarBrandList() {
    const list = this.els.brandList;
    if (!list) return;
    const all = `<li><label class="filter-check"><input type="radio" name="brand" value="all" ${this.state.brand === "all" ? "checked" : ""}> ${t("js.all_brands")}</label></li>`;
    const items = SITE_CONFIG.brands.map(b => `
      <li><label class="filter-check"><input type="radio" name="brand" value="${b.id}" ${this.state.brand === b.id ? "checked" : ""}> ${b.name}</label></li>
    `).join("");
    list.innerHTML = all + items;
  },

  bindEvents() {
    const { els } = this;

    if (els.searchInput) {
      els.searchInput.value = this.state.search;
      els.searchInput.addEventListener("input", () => {
        this.state.search = els.searchInput.value;
        this.state.visibleCount = SITE_CONFIG.catalog.gridPageInitial;
        this.render();
      });
    }

    if (els.categoryList) {
      els.categoryList.addEventListener("click", e => {
        const btn = e.target.closest("[data-category]");
        if (!btn) return;
        this.state.category = btn.dataset.category;
        this.state.visibleCount = SITE_CONFIG.catalog.gridPageInitial;
        this.renderSidebarCategoryList();
        this.render();
      });
    }

    if (els.brandList) {
      els.brandList.addEventListener("change", e => {
        if (e.target.name !== "brand") return;
        this.state.brand = e.target.value;
        this.state.visibleCount = SITE_CONFIG.catalog.gridPageInitial;
        this.render();
      });
    }

    if (els.featuredCheckbox) {
      els.featuredCheckbox.addEventListener("change", () => {
        this.state.featuredOnly = els.featuredCheckbox.checked;
        this.state.visibleCount = SITE_CONFIG.catalog.gridPageInitial;
        this.render();
      });
    }

    if (els.bestsellerCheckbox) {
      els.bestsellerCheckbox.addEventListener("change", () => {
        this.state.bestsellerOnly = els.bestsellerCheckbox.checked;
        this.state.visibleCount = SITE_CONFIG.catalog.gridPageInitial;
        this.render();
      });
    }

    if (els.sortSelect) {
      els.sortSelect.addEventListener("change", () => {
        this.state.sort = els.sortSelect.value;
        this.render();
      });
    }

    if (els.clearBtn) {
      els.clearBtn.addEventListener("click", () => this.clearAll());
    }

    if (els.chips) {
      els.chips.addEventListener("click", e => {
        const chip = e.target.closest("[data-remove-filter]");
        if (!chip) return;
        this.removeFilter(chip.dataset.removeFilter);
      });
    }

    if (els.loadMoreBtn) {
      els.loadMoreBtn.addEventListener("click", () => {
        this.state.visibleCount += SITE_CONFIG.catalog.productsPerPage;
        this.render(true);
      });
    }

    const openPanel = () => {
      els.filterPanel?.classList.add("is-open");
      els.filterOverlay?.classList.add("is-open");
      $(".filter-panel__apply")?.classList.add("is-open");
      document.body.classList.add("no-scroll");
    };
    const closePanel = () => {
      els.filterPanel?.classList.remove("is-open");
      els.filterOverlay?.classList.remove("is-open");
      $(".filter-panel__apply")?.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
    };

    if (els.mobileFilterToggle) els.mobileFilterToggle.addEventListener("click", openPanel);
    if (els.filterPanelClose) els.filterPanelClose.addEventListener("click", closePanel);
    if (els.filterApply) els.filterApply.addEventListener("click", closePanel);
    if (els.filterOverlay) els.filterOverlay.addEventListener("click", closePanel);
    if (els.mobileSortToggle) {
      els.mobileSortToggle.addEventListener("click", () => {
        const sortBar = $("#sort-bar");
        if (sortBar) sortBar.classList.toggle("is-open");
      });
    }
  },

  clearAll() {
    this.state = {
      search: "",
      category: "all",
      brand: "all",
      featuredOnly: false,
      bestsellerOnly: false,
      sort: "featured",
      visibleCount: SITE_CONFIG.catalog.gridPageInitial
    };
    if (this.els.searchInput) this.els.searchInput.value = "";
    if (this.els.featuredCheckbox) this.els.featuredCheckbox.checked = false;
    if (this.els.bestsellerCheckbox) this.els.bestsellerCheckbox.checked = false;
    if (this.els.sortSelect) this.els.sortSelect.value = "featured";
    const brandAll = $('input[name="brand"][value="all"]');
    if (brandAll) brandAll.checked = true;
    this.renderSidebarCategoryList();
    this.render();
  },

  removeFilter(key) {
    if (key === "search") this.state.search = "";
    if (key === "category") this.state.category = "all";
    if (key === "brand") this.state.brand = "all";
    if (key === "featured") this.state.featuredOnly = false;
    if (key === "bestseller") this.state.bestsellerOnly = false;
    this.cacheEls();
    if (this.els.searchInput) this.els.searchInput.value = this.state.search;
    if (this.els.featuredCheckbox) this.els.featuredCheckbox.checked = this.state.featuredOnly;
    if (this.els.bestsellerCheckbox) this.els.bestsellerCheckbox.checked = this.state.bestsellerOnly;
    if (key === "brand") {
      const brandAll = $('input[name="brand"][value="all"]');
      if (brandAll) brandAll.checked = true;
    }
    this.renderSidebarCategoryList();
    this.render();
  },

  getFiltered() {
    const s = this.state;
    const term = I18N.normalize(s.search.trim());

    let list = PRODUCTS.filter(p => {
      if (s.category !== "all" && p.category !== s.category) return false;
      if (s.brand !== "all" && p.brand !== s.brand) return false;
      if (s.featuredOnly && !p.featured) return false;
      if (s.bestsellerOnly && !p.bestseller) return false;
      if (term && !productSearchText(p).includes(term)) return false;
      return true;
    });

    switch (s.sort) {
      case "newest":
        list.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        break;
      case "az":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "featured":
      default:
        list.sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1));
        break;
    }

    return list;
  },

  renderChips() {
    const s = this.state;
    const chips = [];
    if (s.search) chips.push({ key: "search", label: t("js.chip_search", { term: s.search }) });
    if (s.category !== "all") chips.push({ key: "category", label: catName(getCategoryById(s.category)) || s.category });
    if (s.brand !== "all") chips.push({ key: "brand", label: getBrandById(s.brand) });
    if (s.featuredOnly) chips.push({ key: "featured", label: t("js.featured") });
    if (s.bestsellerOnly) chips.push({ key: "bestseller", label: t("js.bestseller") });

    if (!this.els.chips) return;
    if (!chips.length) {
      this.els.chips.innerHTML = "";
      this.els.chips.classList.remove("is-visible");
      return;
    }
    this.els.chips.classList.add("is-visible");
    this.els.chips.innerHTML = chips.map(c => `
      <button class="filter-chip" data-remove-filter="${c.key}">
        ${c.label} <span aria-hidden="true">&times;</span>
      </button>
    `).join("");
  },

  render(isLoadMore = false) {
    const filtered = this.getFiltered();
    const visible = filtered.slice(0, this.state.visibleCount);

    if (this.els.count) {
      this.els.count.textContent = I18N.plural("count.products", filtered.length);
    }

    renderProductGridInto(this.els.grid, visible);
    this.renderChips();

    if (this.els.loadMoreBtn) {
      const hasMore = this.state.visibleCount < filtered.length;
      this.els.loadMoreBtn.style.display = hasMore ? "inline-flex" : "none";
      this.els.loadMoreBtn.textContent = hasMore
        ? t("js.load_more", { n: filtered.length - this.state.visibleCount })
        : "";
    }

    if (isLoadMore) {
      const newlyVisible = $$(".product-card", this.els.grid).slice(visible.length - SITE_CONFIG.catalog.productsPerPage);
      newlyVisible.forEach(el => el.classList.add("is-revealing"));
    }
  }
};

document.addEventListener("DOMContentLoaded", () => Catalog.init());
