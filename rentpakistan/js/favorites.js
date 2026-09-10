/* ==========================================================================
   favorites.js
   Favorites are stored in localStorage as an array of property IDs under
   the key "rp_favorites". Works for both sample and user-listed properties.
   ========================================================================== */

const Favorites = (function () {
  const KEY = "rp_favorites";

  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function has(id) {
    return getAll().includes(id);
  }

  function toggle(id) {
    let list = getAll();
    let nowActive;
    if (list.includes(id)) {
      list = list.filter(x => x !== id);
      nowActive = false;
    } else {
      list.push(id);
      nowActive = true;
    }
    save(list);
    updateFavCount();
    return nowActive;
  }

  function count() {
    return getAll().length;
  }

  function updateFavCount() {
    document.querySelectorAll("[data-fav-count]").forEach(el => {
      el.textContent = count();
      el.classList.toggle("is-visible", count() > 0);
    });
  }

  return { getAll, has, toggle, count, updateFavCount };
})();

/* Renders the Favorites page grid by pulling full objects from both the
   sample PROPERTIES array and any user-submitted listings in localStorage. */
function renderFavoritesPage() {
  const ids = Favorites.getAll();
  const userListings = MyListings.getAll();
  const allProps = PROPERTIES.concat(userListings);
  const favProps = allProps.filter(p => ids.includes(p.id));
  renderGrid("favoritesGrid", favProps, "property");
  const emptyEl = document.getElementById("favoritesEmpty");
  if (emptyEl) emptyEl.style.display = favProps.length ? "none" : "block";
}

/* Delegated click handler for heart buttons - works for any card injected
   anywhere in the document, present or future. */
document.addEventListener("click", function (e) {
  const btn = e.target.closest("[data-fav]");
  if (!btn) return;
  const id = Number(btn.getAttribute("data-fav"));
  const nowActive = Favorites.toggle(id);
  btn.classList.toggle("is-active", nowActive);
  const icon = btn.querySelector("i");
  if (icon) {
    icon.classList.toggle("fa-solid", nowActive);
    icon.classList.toggle("fa-regular", !nowActive);
  }
  btn.classList.add("fav-pop");
  setTimeout(() => btn.classList.remove("fav-pop"), 300);
  Toast.show(nowActive ? "Added to favorites" : "Removed from favorites", nowActive ? "success" : "info");
  if (document.getElementById("view-favorites")?.classList.contains("is-active")) {
    renderFavoritesPage();
  }
});

document.addEventListener("DOMContentLoaded", () => Favorites.updateFavCount());
