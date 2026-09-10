/* ==========================================================================
   auth.js
   Frontend-only authentication + "List Your Property" storage simulation.
   - Users are stored in localStorage under "rp_users" (array of {name,email,phone,password})
     NOTE: demo only - never store real passwords in plain text in production.
   - The active session is stored under "rp_session" ({name,email}).
   - MyListings stores properties a user has published via the listing form
     under "rp_my_listings", using the same shape as PROPERTIES so they can
     be rendered by the same card renderer.
   ========================================================================== */

const Auth = (function () {
  const USERS_KEY = "rp_users";
  const SESSION_KEY = "rp_session";

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (e) { return []; }
  }
  function saveUsers(list) { localStorage.setItem(USERS_KEY, JSON.stringify(list)); }

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
  }
  function isLoggedIn() { return !!getSession(); }

  function signup({ name, email, phone, password }) {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, message: "An account with this email already exists." };
    }
    users.push({ name, email, phone, password });
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name, email }));
    return { ok: true };
  }

  function login({ email, password }) {
    const users = getUsers();
    const match = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!match) return { ok: false, message: "Incorrect email or password." };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: match.name, email: match.email }));
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  return { signup, login, logout, isLoggedIn, getSession };
})();

const MyListings = (function () {
  const KEY = "rp_my_listings";
  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function add(listing) {
    const all = getAll();
    listing.id = 9000 + all.length + 1;
    listing.featured = false;
    listing.rating = 0;
    listing.dateAdded = new Date().toISOString().slice(0, 10);
    all.push(listing);
    localStorage.setItem(KEY, JSON.stringify(all));
    return listing;
  }
  return { getAll, add };
})();

/* ---- Wire up modals once DOM is ready ---- */
document.addEventListener("DOMContentLoaded", () => {

  refreshAuthUI();

  // LOGIN FORM
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearFormErrors(loginForm);
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;
      let valid = true;
      if (!validEmail(email)) { showFieldError(loginForm.email, "Enter a valid email address."); valid = false; }
      if (!password) { showFieldError(loginForm.password, "Password is required."); valid = false; }
      if (!valid) return;

      const result = Auth.login({ email, password });
      if (!result.ok) {
        Toast.show(result.message, "error");
        return;
      }
      Toast.show(`Welcome back, ${Auth.getSession().name}!`, "success");
      closeModal("loginModal");
      loginForm.reset();
      refreshAuthUI();
    });
  }

  // SIGNUP FORM
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearFormErrors(signupForm);
      const name = signupForm.name.value.trim();
      const email = signupForm.email.value.trim();
      const phone = signupForm.phone.value.trim();
      const password = signupForm.password.value;
      const confirm = signupForm.confirmPassword.value;
      let valid = true;
      if (name.length < 3) { showFieldError(signupForm.name, "Enter your full name."); valid = false; }
      if (!validEmail(email)) { showFieldError(signupForm.email, "Enter a valid email address."); valid = false; }
      if (!/^03\d{9}$/.test(phone.replace(/[\s-]/g, ""))) { showFieldError(signupForm.phone, "Enter a valid Pakistani number, e.g. 03001234567."); valid = false; }
      if (password.length < 6) { showFieldError(signupForm.password, "Password must be at least 6 characters."); valid = false; }
      if (password !== confirm) { showFieldError(signupForm.confirmPassword, "Passwords do not match."); valid = false; }
      if (!valid) return;

      const result = Auth.signup({ name, email, phone, password });
      if (!result.ok) {
        Toast.show(result.message, "error");
        return;
      }
      Toast.show(`Account created. Welcome, ${name}!`, "success");
      closeModal("signupModal");
      signupForm.reset();
      refreshAuthUI();
    });
  }

  // LIST YOUR PROPERTY FORM
  const listForm = document.getElementById("listPropertyForm");
  if (listForm) {
    listForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearFormErrors(listForm);
      const data = Object.fromEntries(new FormData(listForm).entries());
      let valid = true;
      if (!data.fullName || data.fullName.trim().length < 3) { showFieldError(listForm.fullName, "Enter your full name."); valid = false; }
      if (!/^03\d{9}$/.test((data.phone || "").replace(/[\s-]/g, ""))) { showFieldError(listForm.phone, "Enter a valid Pakistani number."); valid = false; }
      if (!validEmail(data.email)) { showFieldError(listForm.email, "Enter a valid email address."); valid = false; }
      if (!data.city) { showFieldError(listForm.city, "Select a city."); valid = false; }
      if (!data.propertyType) { showFieldError(listForm.propertyType, "Select a property type."); valid = false; }
      if (!data.purpose) { showFieldError(listForm.purpose, "Select a purpose."); valid = false; }
      if (!data.price || Number(data.price) <= 0) { showFieldError(listForm.price, "Enter a valid price."); valid = false; }
      if (!data.size) { showFieldError(listForm.size, "Enter the property size."); valid = false; }
      if (!data.description || data.description.trim().length < 20) { showFieldError(listForm.description, "Description should be at least 20 characters."); valid = false; }
      if (!valid) { Toast.show("Please fix the highlighted fields.", "error"); return; }

      const seed = "user" + Date.now();
      const listing = {
        title: data.title || `${data.propertyType} in ${data.society || data.city}`,
        type: data.propertyType,
        purpose: data.purpose,
        city: data.city,
        society: data.society || "N/A",
        area: data.society || data.city,
        price: Number(data.price),
        priceType: data.purpose === "Rent" ? "month" : "night",
        bedrooms: Number(data.bedrooms) || 0,
        bathrooms: Number(data.bathrooms) || 0,
        size: data.size,
        furnished: data.furnished || "Unfurnished",
        image: imgSet(seed)[0],
        gallery: imgSet(seed),
        description: data.description,
        amenities: [],
        ownerName: data.fullName,
        ownerPhone: data.phone,
        ownerEmail: data.email
      };
      MyListings.add(listing);
      Toast.show("Your property has been published!", "success");
      closeModal("listPropertyModal");
      listForm.reset();
      if (document.getElementById("view-dashboard")?.classList.contains("is-active")) renderMyProperties();
    });
  }

  // LOGOUT
  document.querySelectorAll("[data-logout]").forEach(btn => {
    btn.addEventListener("click", () => {
      Auth.logout();
      Toast.show("You have been logged out.", "info");
      refreshAuthUI();
      navigateTo("home");
    });
  });
});

function refreshAuthUI() {
  const session = Auth.getSession();
  const loginBtns = document.querySelectorAll("[data-open-login]");
  const userChips = document.querySelectorAll("[data-user-chip]");
  loginBtns.forEach(b => b.style.display = session ? "none" : "");
  userChips.forEach(chip => {
    chip.style.display = session ? "" : "none";
    const nameEl = chip.querySelector("[data-user-name]");
    if (nameEl && session) nameEl.textContent = session.name.split(" ")[0];
  });
  const dashProfile = document.getElementById("dashProfileName");
  if (dashProfile && session) {
    dashProfile.textContent = session.name;
    const emailEl = document.getElementById("dashProfileEmail");
    if (emailEl) emailEl.textContent = session.email;
  }
}

function renderMyProperties() {
  const listings = MyListings.getAll();
  renderGrid("myPropertiesGrid", listings, "property");
  const emptyEl = document.getElementById("myPropertiesEmpty");
  if (emptyEl) emptyEl.style.display = listings.length ? "none" : "block";
}

/* ---- Small form helpers shared across forms ---- */
function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}
function showFieldError(field, message) {
  if (!field) return;
  field.classList.add("has-error");
  let err = field.parentElement.querySelector(".field-error");
  if (!err) {
    err = document.createElement("span");
    err.className = "field-error";
    field.parentElement.appendChild(err);
  }
  err.textContent = message;
}
function clearFormErrors(form) {
  form.querySelectorAll(".has-error").forEach(f => f.classList.remove("has-error"));
  form.querySelectorAll(".field-error").forEach(e => e.remove());
}
