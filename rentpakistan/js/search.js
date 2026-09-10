/* ==========================================================================
   search.js
   All filtering / sorting logic. A single generic filter function is reused
   by the Properties, Houses, Apartments, Commercial and Hotels pages - each
   page just supplies a base dataset and reads a slightly different set of
   filter controls (all sharing the same class names).
   ========================================================================== */

const SearchState = {
  properties: {}, // current filter values for the main "Properties" page
  hotel: {}
};

function readFilterPanel(scopeEl) {
  const get = (name) => scopeEl.querySelector(`[name="${name}"]`);
  const val = (name) => (get(name) ? get(name).value : "");
  return {
    city: val("f-city"),
    society: val("f-society"),
    type: val("f-type"),
    purpose: val("f-purpose"),
    minPrice: Number(val("f-minPrice")) || 0,
    maxPrice: Number(val("f-maxPrice")) || Infinity,
    bedrooms: val("f-bedrooms"),
    bathrooms: val("f-bathrooms"),
    furnished: val("f-furnished"),
    keyword: val("f-keyword"),
    sort: val("f-sort") || "newest"
  };
}

function applyPropertyFilters(dataset, filters) {
  let list = dataset.filter(p => {
    if (filters.city && p.city !== filters.city) return false;
    if (filters.society && p.society !== filters.society) return false;
    if (filters.type && p.type !== filters.type) return false;
    if (filters.purpose && p.purpose !== filters.purpose) return false;
    if (p.price < filters.minPrice) return false;
    if (p.price > filters.maxPrice) return false;
    if (filters.bedrooms && filters.bedrooms !== "5+" && Number(p.bedrooms) !== Number(filters.bedrooms)) return false;
    if (filters.bedrooms === "5+" && Number(p.bedrooms) < 5) return false;
    if (filters.bathrooms && filters.bathrooms !== "5+" && Number(p.bathrooms) !== Number(filters.bathrooms)) return false;
    if (filters.bathrooms === "5+" && Number(p.bathrooms) < 5) return false;
    if (filters.furnished && p.furnished !== filters.furnished) return false;
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const hay = `${p.title} ${p.city} ${p.society} ${p.area} ${p.type}`.toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    return true;
  });

  switch (filters.sort) {
    case "price-low": list.sort((a, b) => a.price - b.price); break;
    case "price-high": list.sort((a, b) => b.price - a.price); break;
    case "popular": list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    default: list.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
  }
  return list;
}

/* Generic wiring for any filter panel + grid pair, identified by data attrs
   on a wrapping <section data-filter-scope="properties" data-grid="propertiesGrid" data-base="PROPERTIES">. */
function initFilterScope(scopeEl) {
  const gridId = scopeEl.getAttribute("data-grid");
  const baseName = scopeEl.getAttribute("data-base");
  const baseData = baseName === "PROPERTIES" ? PROPERTIES : PROPERTIES; // extend here for future datasets
  const extraFilter = scopeEl.getAttribute("data-fixed-type"); // e.g. "House" to lock the Houses page

  function run() {
    const filters = readFilterPanel(scopeEl);
    let dataset = baseData.concat(MyListings.getAll());
    if (extraFilter) dataset = dataset.filter(p => p.type === extraFilter || (extraFilter === "Commercial Building" && ["Shop","Office","Commercial Building","Warehouse","Plaza","Restaurant"].includes(p.type)));
    const results = applyPropertyFilters(dataset, filters);
    renderGrid(gridId, results, "property");
    const countEl = scopeEl.querySelector("[data-result-count]");
    if (countEl) countEl.textContent = `${results.length} ${results.length === 1 ? "property" : "properties"} found`;
  }

  scopeEl.querySelectorAll("select, input").forEach(input => {
    input.addEventListener("change", run);
    if (input.tagName === "INPUT" && input.type !== "range") input.addEventListener("input", debounce(run, 250));
  });

  const citySelect = scopeEl.querySelector('[name="f-city"]');
  const societySelect = scopeEl.querySelector('[name="f-society"]');
  if (citySelect && societySelect) {
    citySelect.addEventListener("change", () => fillSocietySelect(societySelect, citySelect.value));
  }

  const resetBtn = scopeEl.querySelector("[data-reset-filters]");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      scopeEl.querySelectorAll("select").forEach(s => s.selectedIndex = 0);
      scopeEl.querySelectorAll('input[type="text"], input[type="number"], input[type="search"]').forEach(i => i.value = "");
      if (societySelect) fillSocietySelect(societySelect, "");
      run();
    });
  }

  const applyBtn = scopeEl.querySelector("[data-apply-filters]");
  if (applyBtn) applyBtn.addEventListener("click", run);

  run(); // initial paint
  return run;
}

/* Hotel search (separate dataset/shape) */
function initHotelSearch() {
  const scope = document.getElementById("hotelSearchPanel");
  if (!scope) return;
  function run() {
    const destination = scope.querySelector('[name="h-destination"]').value;
    let list = HOTELS.slice();
    if (destination) list = list.filter(h => h.city === destination);
    renderGrid("hotelsGrid", list, "hotel");
    const countEl = document.getElementById("hotelsCount");
    if (countEl) countEl.textContent = `${list.length} ${list.length === 1 ? "hotel" : "hotels"} found`;
  }
  scope.querySelectorAll("select").forEach(s => s.addEventListener("change", run));
  const btn = scope.querySelector("[data-search-hotels]");
  if (btn) btn.addEventListener("click", (e) => { e.preventDefault(); run(); Toast.show("Showing available hotels for your dates.", "success"); });
  run();
}

/* Hero search: takes over and jumps to the Properties page pre-filtered */
function initHeroSearch() {
  const form = document.getElementById("heroSearchForm");
  if (!form) return;
  const citySel = form.querySelector('[name="hero-city"]');
  fillCitySelect(citySel, "Any City");
  const typeSel = form.querySelector('[name="hero-type"]');
  fillTypeSelect(typeSel, "Any Property Type");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    navigateTo("properties");
    requestAnimationFrame(() => {
      const scope = document.querySelector('[data-filter-scope="properties"]');
      if (!scope) return;
      const city = form.querySelector('[name="hero-city"]').value;
      const type = form.querySelector('[name="hero-type"]').value;
      const budget = form.querySelector('[name="hero-budget"]').value;
      const bedrooms = form.querySelector('[name="hero-bedrooms"]').value;
      if (city) scope.querySelector('[name="f-city"]').value = city;
      if (type) scope.querySelector('[name="f-type"]').value = type;
      if (budget) scope.querySelector('[name="f-maxPrice"]').value = budget;
      if (bedrooms) scope.querySelector('[name="f-bedrooms"]').value = bedrooms;
      scope.querySelector('[name="f-city"]').dispatchEvent(new Event("change"));
    });
  });

  document.querySelectorAll("[data-popular-search]").forEach(chip => {
    chip.addEventListener("click", () => {
      navigateTo("properties");
      requestAnimationFrame(() => {
        const scope = document.querySelector('[data-filter-scope="properties"]');
        const city = chip.getAttribute("data-popular-search");
        scope.querySelector('[name="f-city"]').value = city;
        scope.querySelector('[name="f-city"]').dispatchEvent(new Event("change"));
      });
    });
  });
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
