# RentPakistan

A complete, responsive property rental & accommodation website for Pakistan, built with plain HTML5, CSS3 and vanilla JavaScript — no frameworks, no build step.

## 1. Running the project locally

Because the app loads its JS as ES-less `<script>` files and fetches remote images, open it through a local server rather than double-clicking the HTML file (double-clicking works too in most browsers, but a local server avoids any `file://` quirks):

```bash
cd rentpakistan
python3 -m http.server 8080
# then open http://localhost:8080 in your browser
```

Or with Node's `serve`:

```bash
npx serve .
```

No build tools, npm install, or backend are required — it's static files only.

## 2. Project structure

```
index.html            All pages/sections (single-page app with JS-driven view switching)
css/
  style.css           Design system: colors, type, layout, components
  responsive.css       Breakpoint overrides (1024 / 900 / 768 / 480 / 375px)
js/
  properties.js        Data: LOCATIONS, PROPERTY_TYPES, PROPERTIES, HOTELS + card renderers
  favorites.js          Favorites system (localStorage)
  auth.js               Login / signup / "List Your Property" simulation (localStorage)
  search.js             All filter + sort logic for every listing page
  app.js                Routing, navbar, dark mode, modals, toasts, homepage sections
```

The brief allowed a single-page app "if multiple files would be unnecessarily complex" —
that's the approach used here: one `index.html` with `<section class="view" id="view-x">`
blocks that `app.js` shows/hides to simulate Home, Properties, Houses, Apartments, Hotels,
Commercial, Favorites, Dashboard, About and Contact "pages", with real `#hash` URLs and
working browser back/forward.

## 3. Replacing images

All sample photos come from `https://picsum.photos/seed/<name>/<w>/<h>` — a placeholder
service that always returns a real photo for a given seed, so nothing ever shows a broken
image icon.

To use your own photos:

- **Per property/hotel:** open `js/properties.js` and replace the `image` / `gallery`
  values for that entry with your own URLs (any public image URL works), e.g.:
  ```js
  image: "https://your-cdn.com/photos/house1-main.jpg",
  gallery: [
    "https://your-cdn.com/photos/house1-1.jpg",
    "https://your-cdn.com/photos/house1-2.jpg"
  ],
  ```
- **Hero background:** edit the `<img>` inside `.hero__bg` in `index.html`.
- **Popular Locations / About images:** same pattern — swap the `src` attribute or the
  `picsum.photos/seed/...` URL used in `renderPopularLocations()` in `js/app.js`.
- **Local images:** drop files into `assets/images/` and point `src`/`image` fields at
  `assets/images/yourfile.jpg` instead of a remote URL.

## 4. Adding new properties, cities or hotels

Everything lives in `js/properties.js`, in plain JS objects/arrays — no build step needed.

**Add a city or society** — extend `LOCATIONS`:
```js
const LOCATIONS = {
  ...
  "Sargodha": ["Cantt", "Satellite Town"], // new city
};
```
Every dropdown and filter reads this object directly, so nothing else needs to change.

**Add a property** — push a new object into `PROPERTIES` following the existing shape:
```js
{
  id: 33, title: "New Listing", type: "House", purpose: "Rent",
  city: "Sargodha", society: "Cantt", area: "Cantt",
  price: 40000, priceType: "month", bedrooms: 3, bathrooms: 2, size: "5 Marla",
  furnished: "Unfurnished", image: imgSet("newlisting")[0], gallery: imgSet("newlisting"),
  description: "...", amenities: ["Parking"], featured: false, rating: 4.0,
  dateAdded: "2026-09-01"
}
```
Use a unique numeric `id`. `imgSet("seed")` auto-generates 4 placeholder photos.

**Add a hotel** — same idea, push into the `HOTELS` array.

**Add a property type** — add the string to `PROPERTY_TYPES`; it will appear in every
"Property Type" dropdown automatically.

## 5. How localStorage is used

The app is entirely frontend, so localStorage stands in for a backend/database:

| Key                | Holds                                                         | Managed by      |
|---------------------|----------------------------------------------------------------|-----------------|
| `rp_favorites`      | Array of saved property IDs                                   | `favorites.js`  |
| `rp_users`          | Array of `{name, email, phone, password}` signed-up accounts (demo only — plaintext, never do this in production) | `auth.js` |
| `rp_session`        | The currently logged-in user's `{name, email}`                | `auth.js`       |
| `rp_my_listings`    | Properties published via "List Your Property", using the same shape as `PROPERTIES` so they render with the same cards | `auth.js` |
| `rp_theme`          | `"dark"` or `"light"` — remembers the dark-mode preference     | `app.js`        |
| `rp_recent`         | Last 8 property IDs viewed, most recent first                 | `app.js`        |

Clearing your browser's site data resets the whole demo (logs you out, clears favorites,
listings and theme).

## 6. Notable interactive features

- Full client-side filtering/sorting shared across Properties, Houses, Apartments,
  Commercial and Hotels pages (city → society cascading dropdowns, price range,
  bedrooms/bathrooms, furnished status, keyword search, sort order).
- Favorites with heart-button animation + toast confirmation, persisted across visits.
- Login / signup / "List Your Property" forms with real client-side validation and
  localStorage-backed simulation of an account system.
- Property details modal with image gallery, amenities, a map placeholder, and working
  `tel:`, `wa.me` (WhatsApp) and message-owner actions.
- Dashboard (Profile / My Properties / Favorites / Messages / Settings) gated behind
  a simulated login.
- Dark mode toggle, sticky navbar with scroll shadow, mobile hamburger menu, FAQ
  accordion, testimonial slider, scroll-reveal animation, and a "Load More" button on
  the homepage's featured grid.

## 7. Known limitations (by design, frontend-only)

- No real backend, payments, authentication security, or persistence beyond the current
  browser (a different browser or device won't see your listings/favorites).
- Map sections are styled placeholders rather than a live map — swap in Leaflet/OpenStreetMap
  if you add a backend later.
- Uploaded property images in "List Your Property" are accepted by the file input but not
  actually read/stored (there's nowhere to persist binary files without a backend); the
  listing uses a placeholder photo instead.
