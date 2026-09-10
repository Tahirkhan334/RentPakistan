/* ==========================================================================
   app.js
   App shell: view routing (SPA-style, no reload), navbar behaviour, dark
   mode, modals, toasts, homepage sections, property details, FAQ, testimonial
   slider, recently-viewed, and "load more" pagination.
   ========================================================================== */

/* ---------------------------------------------------------------------- */
/* Toast notifications                                                     */
/* ---------------------------------------------------------------------- */
const Toast = (function () {
  let container;
  function ensure() {
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-stack";
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }
  }
  function show(message, type = "info") {
    ensure();
    const icon = { success: "fa-circle-check", error: "fa-circle-exclamation", info: "fa-circle-info" }[type] || "fa-circle-info";
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add("is-visible"));
    setTimeout(() => {
      el.classList.remove("is-visible");
      setTimeout(() => el.remove(), 300);
    }, 3200);
  }
  return { show };
})();

/* ---------------------------------------------------------------------- */
/* View routing - each top-level "page" is a <section class="view" id="view-x">
   Only one is visible at a time; nav links use data-nav="x".               */
/* ---------------------------------------------------------------------- */
function navigateTo(viewName, opts = {}) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("is-active"));
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.add("is-active");
  document.querySelectorAll("[data-nav]").forEach(l => l.classList.toggle("is-active", l.getAttribute("data-nav") === viewName));
  window.scrollTo({ top: 0, behavior: "smooth" });
  closeMobileNav();

  // Guard dashboard/favorites behind login where it makes sense for the demo
  if (viewName === "dashboard") {
    if (!Auth.isLoggedIn()) {
      Toast.show("Please log in to view your dashboard.", "info");
      openModal("loginModal");
      navigateTo("home");
      return;
    }
    renderMyProperties();
    renderDashboardFavorites();
  }
  if (viewName === "favorites") renderFavoritesPage();
  if (!opts.skipHistory) history.pushState({ view: viewName }, "", `#${viewName}`);
}

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-nav]");
  if (link) {
    e.preventDefault();
    navigateTo(link.getAttribute("data-nav"));
  }
});
window.addEventListener("popstate", (e) => {
  const view = (e.state && e.state.view) || (location.hash ? location.hash.slice(1) : "home");
  navigateTo(view, { skipHistory: true });
});

/* ---------------------------------------------------------------------- */
/* Navbar: sticky shadow-on-scroll + mobile hamburger                     */
/* ---------------------------------------------------------------------- */
function initNavbar() {
  const nav = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
  });
  const burger = document.getElementById("navBurger");
  const menu = document.getElementById("navMenu");
  burger.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    burger.classList.toggle("is-open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
  });
}
function closeMobileNav() {
  document.getElementById("navMenu")?.classList.remove("is-open");
  document.getElementById("navBurger")?.classList.remove("is-open");
}

/* ---------------------------------------------------------------------- */
/* Dark mode                                                               */
/* ---------------------------------------------------------------------- */
function initDarkMode() {
  const KEY = "rp_theme";
  const toggle = document.getElementById("themeToggle");
  const saved = localStorage.getItem(KEY);
  if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
  updateThemeIcon();

  toggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem(KEY, "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem(KEY, "dark");
    }
    updateThemeIcon();
  });

  function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    toggle.innerHTML = `<i class="fa-solid ${isDark ? "fa-sun" : "fa-moon"}"></i>`;
  }
}

/* ---------------------------------------------------------------------- */
/* Modals                                                                  */
/* ---------------------------------------------------------------------- */
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  document.querySelectorAll(".modal.is-open").forEach(m => closeModal(m.id));
  modal.classList.add("is-open");
  document.body.classList.add("no-scroll");
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("is-open");
  if (!document.querySelector(".modal.is-open")) document.body.classList.remove("no-scroll");
}
document.addEventListener("click", (e) => {
  if (e.target.matches("[data-open-modal]")) {
    e.preventDefault();
    openModal(e.target.getAttribute("data-open-modal"));
  }
  if (e.target.matches("[data-close-modal]") || e.target.matches(".modal__backdrop")) {
    const modal = e.target.closest(".modal");
    if (modal) closeModal(modal.id);
  }
  if (e.target.matches("[data-switch-modal]")) {
    e.preventDefault();
    const [from, to] = e.target.getAttribute("data-switch-modal").split("|");
    closeModal(from);
    openModal(to);
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.querySelectorAll(".modal.is-open").forEach(m => closeModal(m.id));
});

/* ---------------------------------------------------------------------- */
/* Homepage: categories, featured grid + load more, popular locations,    */
/* why-choose-us / how-it-works are static HTML, testimonials slider, FAQ */
/* ---------------------------------------------------------------------- */
function renderCategories() {
  const el = document.getElementById("categoryGrid");
  if (!el) return;
  el.innerHTML = CATEGORIES.map(c => `
    <button class="cat-card" data-category="${c.key}">
      <span class="cat-card__icon"><i class="fa-solid ${c.icon}"></i></span>
      <span class="cat-card__label">${c.label}</span>
      <span class="cat-card__count">${categoryCount(c.key)} listings</span>
    </button>
  `).join("");
  el.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-category]");
    if (!btn) return;
    const type = btn.getAttribute("data-category");
    if (type === "Hotel") { navigateTo("hotels"); return; }
    navigateTo("properties");
    requestAnimationFrame(() => {
      const scope = document.querySelector('[data-filter-scope="properties"]');
      scope.querySelector('[name="f-type"]').value = type;
      scope.querySelector('[name="f-type"]').dispatchEvent(new Event("change"));
    });
  });
}

let featuredShown = 8;
function renderFeatured() {
  const featured = PROPERTIES.slice().sort((a,b) => (b.featured - a.featured) || (b.rating - a.rating));
  renderGrid("featuredGrid", featured.slice(0, featuredShown), "property");
  const btn = document.getElementById("loadMoreBtn");
  if (btn) btn.style.display = featuredShown >= featured.length ? "none" : "";
}
function initLoadMore() {
  const btn = document.getElementById("loadMoreBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    featuredShown += 8;
    renderFeatured();
  });
}

function renderPopularLocations() {
  const el = document.getElementById("popularLocationsGrid");
  if (!el) return;
  const cities = [
    ["Islamabad", "islamabad"], ["Lahore", "lahore"], ["Karachi", "karachi"],
    ["Peshawar", "peshawar"], ["Mardan", "mardan"], ["Swat", "swat"],
    ["Murree", "murree"], ["Hunza", "hunza"]
  ];
  el.innerHTML = cities.map(([city, seed]) => {
    const count = PROPERTIES.filter(p => p.city === city).length;
    return `
    <div class="loc-card" data-loc="${city}">
      <img src="https://picsum.photos/seed/city-${seed}/600/450" alt="${city}, Pakistan" loading="lazy">
      <div class="loc-card__overlay">
        <h3>${city}</h3>
        <p>${count > 0 ? count : Math.floor(Math.random()*20)+5} properties</p>
        <button class="btn btn--sm btn--ghost-light" data-loc-explore="${city}">Explore <i class="fa-solid fa-arrow-right"></i></button>
      </div>
    </div>`;
  }).join("");
  el.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-loc-explore]");
    if (!btn) return;
    const city = btn.getAttribute("data-loc-explore");
    navigateTo("properties");
    requestAnimationFrame(() => {
      const scope = document.querySelector('[data-filter-scope="properties"]');
      const sel = scope.querySelector('[name="f-city"]');
      sel.value = city;
      sel.dispatchEvent(new Event("change"));
    });
  });
}

const TESTIMONIALS = [
  { name: "Ayesha Khan", city: "Islamabad", rating: 5, text: "RentPakistan helped me find a beautiful apartment in Islamabad within my budget. The filters made it so easy to narrow down DHA options." },
  { name: "Bilal Ahmed", city: "Lahore", rating: 5, text: "Listed my house in Bahria Town Lahore and had serious inquiries within two days. Much smoother than the usual classifieds." },
  { name: "Sana Malik", city: "Karachi", rating: 4, text: "Booked a short stay near Clifton for a family trip. The WhatsApp contact button made reaching the owner instant." },
  { name: "Hamza Yousafzai", city: "Peshawar", rating: 5, text: "Found a great 10 Marla house in Hayatabad. The society-level filtering is something other sites don't offer." },
  { name: "Mariam Sheikh", city: "Mardan", rating: 4, text: "Simple, fast and genuinely useful for finding hostels near campus in Mardan." }
];
let testimonialIndex = 0;
function renderTestimonials() {
  const track = document.getElementById("testimonialTrack");
  if (!track) return;
  track.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-card__stars">${'<i class="fa-solid fa-star"></i>'.repeat(t.rating)}${'<i class="fa-regular fa-star"></i>'.repeat(5 - t.rating)}</div>
      <p class="testimonial-card__text">&ldquo;${t.text}&rdquo;</p>
      <div class="testimonial-card__person">
        <span class="avatar">${t.name.split(" ").map(w => w[0]).join("")}</span>
        <div><strong>${t.name}</strong><br><small>${t.city}</small></div>
      </div>
    </div>
  `).join("");
  updateTestimonialPosition();
}
function updateTestimonialPosition() {
  const track = document.getElementById("testimonialTrack");
  if (!track) return;
  track.style.transform = `translateX(-${testimonialIndex * 100}%)`;
}
function initTestimonialSlider() {
  document.getElementById("testiPrev")?.addEventListener("click", () => {
    testimonialIndex = (testimonialIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length;
    updateTestimonialPosition();
  });
  document.getElementById("testiNext")?.addEventListener("click", () => {
    testimonialIndex = (testimonialIndex + 1) % TESTIMONIALS.length;
    updateTestimonialPosition();
  });
  setInterval(() => {
    testimonialIndex = (testimonialIndex + 1) % TESTIMONIALS.length;
    updateTestimonialPosition();
  }, 6000);
}

/* FAQ accordion */
function initFAQ() {
  document.querySelectorAll(".faq-item__question").forEach(q => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      const wasOpen = item.classList.contains("is-open");
      item.parentElement.querySelectorAll(".faq-item").forEach(i => i.classList.remove("is-open"));
      if (!wasOpen) item.classList.add("is-open");
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Property details modal                                                  */
/* ---------------------------------------------------------------------- */
const RecentlyViewed = (function () {
  const KEY = "rp_recent";
  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function add(id) {
    let list = getAll().filter(x => x !== id);
    list.unshift(id);
    list = list.slice(0, 8);
    localStorage.setItem(KEY, JSON.stringify(list));
  }
  return { getAll, add };
})();

function findPropertyById(id) {
  return PROPERTIES.concat(MyListings.getAll()).find(p => p.id === id);
}

function openPropertyDetails(id) {
  const p = findPropertyById(id);
  if (!p) return;
  RecentlyViewed.add(id);
  const body = document.getElementById("propertyDetailsBody");
  const isFav = Favorites.has(p.id);
  const whatsappNumber = "923001234567"; // demo owner number
  const waText = encodeURIComponent(`Hi, I'm interested in "${p.title}" (${p.area}, ${p.city}) listed on RentPakistan for ${priceLabel(p)}.`);
  body.innerHTML = `
    <div class="pd-gallery">
      <img class="pd-gallery__main" id="pdMainImg" src="${p.gallery[0]}" alt="${p.title}">
      <div class="pd-gallery__thumbs">
        ${p.gallery.map((src, i) => `<img src="${src}" data-thumb="${i}" class="${i === 0 ? 'is-active' : ''}" alt="${p.title} photo ${i+1}">`).join("")}
      </div>
    </div>
    <div class="pd-info">
      <div class="pd-info__head">
        <div>
          <span class="badge badge--type">${p.type}</span>
          <h2>${p.title}</h2>
          <p class="p-card__loc"><i class="fa-solid fa-location-dot"></i> ${p.area}, ${p.society ? p.society + ", " : ""}${p.city}</p>
        </div>
        <span class="pd-price">${priceLabel(p)}</span>
      </div>
      <ul class="pd-meta">
        ${p.bedrooms ? `<li><i class="fa-solid fa-bed"></i> ${p.bedrooms} Bedrooms</li>` : ""}
        <li><i class="fa-solid fa-bath"></i> ${p.bathrooms} Bathrooms</li>
        <li><i class="fa-solid fa-vector-square"></i> ${p.size}</li>
        <li><i class="fa-solid fa-couch"></i> ${p.furnished}</li>
      </ul>
      <h3>Description</h3>
      <p>${p.description}</p>
      <h3>Amenities</h3>
      <ul class="pd-amenities">
        ${(p.amenities || []).map(a => `<li><i class="fa-solid fa-circle-check"></i> ${a}</li>`).join("") || "<li>Not specified</li>"}
      </ul>
      <h3>Location</h3>
      <div class="pd-map-placeholder">
        <i class="fa-solid fa-map-location-dot"></i>
        <span>${p.area}, ${p.city} &mdash; map preview</span>
      </div>
      <h3>Owner / Agent</h3>
      <p class="pd-owner"><i class="fa-solid fa-user-tie"></i> ${p.ownerName || "RentPakistan Verified Partner"}</p>
      <div class="pd-actions">
        <button class="btn btn--outline ${isFav ? 'is-active' : ''}" data-fav="${p.id}"><i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i> ${isFav ? "Saved" : "Add to Favorites"}</button>
        <a class="btn btn--outline" href="tel:+${whatsappNumber}"><i class="fa-solid fa-phone"></i> Contact Owner</a>
        <a class="btn btn--whatsapp" target="_blank" rel="noopener" href="https://wa.me/${whatsappNumber}?text=${waText}"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
        <button class="btn btn--primary" data-open-modal="messageOwnerModal"><i class="fa-solid fa-paper-plane"></i> Send Message</button>
      </div>
    </div>
  `;
  body.querySelectorAll("[data-thumb]").forEach(thumb => {
    thumb.addEventListener("click", () => {
      document.getElementById("pdMainImg").src = thumb.src;
      body.querySelectorAll("[data-thumb]").forEach(t => t.classList.remove("is-active"));
      thumb.classList.add("is-active");
    });
  });
  openModal("propertyDetailsModal");
}

function openHotelDetails(id) {
  const h = HOTELS.find(x => x.id === id);
  if (!h) return;
  const body = document.getElementById("propertyDetailsBody");
  const stars = Array.from({length: 5}, (_, i) => `<i class="fa-${i < h.stars ? 'solid' : 'regular'} fa-star"></i>`).join('');
  body.innerHTML = `
    <div class="pd-gallery">
      <img class="pd-gallery__main" id="pdMainImg" src="${h.gallery[0]}" alt="${h.name}">
      <div class="pd-gallery__thumbs">
        ${h.gallery.map((src, i) => `<img src="${src}" data-thumb="${i}" class="${i === 0 ? 'is-active' : ''}" alt="${h.name} photo ${i+1}">`).join("")}
      </div>
    </div>
    <div class="pd-info">
      <div class="pd-info__head">
        <div>
          <h2>${h.name}</h2>
          <p class="p-card__loc"><i class="fa-solid fa-location-dot"></i> ${h.location}, ${h.city}</p>
          <div class="hotel-card__stars">${stars} <span class="hotel-card__reviews">(${h.reviews} reviews)</span></div>
        </div>
        <span class="pd-price">${formatPKR(h.price)} / night</span>
      </div>
      <h3>Amenities</h3>
      <ul class="pd-amenities">${h.amenities.map(a => `<li><i class="fa-solid fa-circle-check"></i> ${a}</li>`).join("")}</ul>
      <h3>Location</h3>
      <div class="pd-map-placeholder"><i class="fa-solid fa-map-location-dot"></i><span>${h.location}, ${h.city} &mdash; map preview</span></div>
      <div class="pd-actions">
        <button class="btn btn--primary" id="confirmBookingBtn"><i class="fa-solid fa-calendar-check"></i> Book Now</button>
        <a class="btn btn--whatsapp" target="_blank" rel="noopener" href="https://wa.me/923001234567?text=${encodeURIComponent('Hi, I would like to book ' + h.name + ' in ' + h.city + '.')}"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
      </div>
    </div>
  `;
  body.querySelectorAll("[data-thumb]").forEach(thumb => {
    thumb.addEventListener("click", () => {
      document.getElementById("pdMainImg").src = thumb.src;
      body.querySelectorAll("[data-thumb]").forEach(t => t.classList.remove("is-active"));
      thumb.classList.add("is-active");
    });
  });
  document.getElementById("confirmBookingBtn").addEventListener("click", () => {
    Toast.show(`Booking request sent for ${h.name}. Our team will confirm shortly.`, "success");
    closeModal("propertyDetailsModal");
  });
  openModal("propertyDetailsModal");
}

document.addEventListener("click", (e) => {
  const viewBtn = e.target.closest("[data-view]");
  if (viewBtn) openPropertyDetails(Number(viewBtn.getAttribute("data-view")));
  const viewHotelBtn = e.target.closest("[data-view-hotel]");
  if (viewHotelBtn) openHotelDetails(Number(viewHotelBtn.getAttribute("data-view-hotel")));
});

/* Contact / message-owner form (frontend-only) */
document.addEventListener("DOMContentLoaded", () => {
  const msgForm = document.getElementById("messageOwnerForm");
  if (msgForm) {
    msgForm.addEventListener("submit", (e) => {
      e.preventDefault();
      Toast.show("Your message has been sent to the owner.", "success");
      msgForm.reset();
      closeModal("messageOwnerModal");
    });
  }
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearFormErrors(contactForm);
      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();
      let valid = true;
      if (name.length < 2) { showFieldError(contactForm.name, "Enter your name."); valid = false; }
      if (!validEmail(email)) { showFieldError(contactForm.email, "Enter a valid email."); valid = false; }
      if (message.length < 10) { showFieldError(contactForm.message, "Message should be at least 10 characters."); valid = false; }
      if (!valid) return;
      Toast.show("Thanks! We'll get back to you shortly.", "success");
      contactForm.reset();
    });
  }
});

function renderDashboardFavorites() {
  const ids = Favorites.getAll();
  const allProps = PROPERTIES.concat(MyListings.getAll());
  const favProps = allProps.filter(p => ids.includes(p.id));
  renderGrid("dashFavoritesGrid", favProps, "property");
}

/* ---------------------------------------------------------------------- */
/* Scroll reveal (single, restrained pass - not on every card)             */
/* ---------------------------------------------------------------------- */
function initScrollReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

/* Dashboard sidebar panel switching */
function initDashboardNav() {
  document.querySelectorAll(".dash-nav button[data-dash-panel]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dash-nav button[data-dash-panel]").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      document.querySelectorAll(".dash-panel").forEach(p => p.classList.remove("is-active"));
      document.getElementById(`dashPanel-${btn.getAttribute("data-dash-panel")}`)?.classList.add("is-active");
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Boot                                                                    */
/* ---------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initDarkMode();
  renderCategories();
  renderFeatured();
  initLoadMore();
  renderPopularLocations();
  renderTestimonials();
  initTestimonialSlider();
  initFAQ();
  initHeroSearch();
  initHotelSearch();
  initScrollReveal();
  initDashboardNav();

  const statEl = document.getElementById("statListings");
  if (statEl) statEl.textContent = `${PROPERTIES.length + MyListings.getAll().length}+`;

  document.querySelectorAll('[data-filter-scope]').forEach(initFilterScope);

  // Populate filter-panel selects (city/society/type) wherever they exist
  document.querySelectorAll('[name="f-city"]').forEach(sel => fillCitySelect(sel));
  document.querySelectorAll('[name="f-type"]').forEach(sel => fillTypeSelect(sel));
  document.querySelectorAll('[name="f-society"]').forEach(sel => fillSocietySelect(sel, ""));
  document.querySelectorAll('[name="h-destination"]').forEach(sel => fillCitySelect(sel, "Any Destination"));

  // "List your property" form dropdowns
  const listCity = document.querySelector('#listPropertyForm [name="city"]');
  const listSociety = document.querySelector('#listPropertyForm [name="society"]');
  const listType = document.querySelector('#listPropertyForm [name="propertyType"]');
  if (listCity) fillCitySelect(listCity, "Select City");
  if (listType) fillTypeSelect(listType, "Select Property Type");
  if (listCity && listSociety) {
    listSociety.innerHTML = `<option value="">Select City First</option>`;
    listCity.addEventListener("change", () => fillSocietySelect(listSociety, listCity.value, "Select Society / Area"));
  }

  refreshAuthUI();

  // Initial route
  const startView = location.hash ? location.hash.slice(1) : "home";
  navigateTo(startView, { skipHistory: true });
});
