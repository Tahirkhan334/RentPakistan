/* ==========================================================================
   properties.js
   Data layer for RentPakistan.
   - LOCATIONS: cities -> societies/areas (easy to extend)
   - PROPERTY_TYPES / PURPOSES: controlled vocabularies used across filters
   - PROPERTIES: sample listing data (30+ real-feeling Pakistani listings)
   - HOTELS: sample hotel data (15+ listings)
   - Rendering helpers used by search.js / app.js to paint cards into the DOM
   ========================================================================== */

/* ---- Locations -----------------------------------------------------------
   Add a new city by adding a key here. Add a new society by pushing into
   that city's array. Nothing else in the app needs to change - dropdowns
   and filters read this object directly. */
const LOCATIONS = {
  "Islamabad": ["DHA Islamabad", "Bahria Town Islamabad", "E-11", "F-11", "G-11", "G-13", "I-8", "I-10", "Blue Area"],
  "Rawalpindi": ["Bahria Town Rawalpindi", "DHA Phase 2", "Saddar", "Satellite Town", "Chaklala"],
  "Lahore": ["DHA Lahore", "Bahria Town Lahore", "Gulberg", "Johar Town", "Model Town", "Wapda Town", "Lake City", "Askari"],
  "Karachi": ["DHA Karachi", "Clifton", "Gulshan-e-Iqbal", "PECHS", "North Nazimabad", "Bahria Town Karachi"],
  "Peshawar": ["Hayatabad", "University Town", "Regi Model Town", "Warsak Road", "Ring Road", "Board Bazaar"],
  "Mardan": ["Sheikh Maltoon Town", "Mardan Cantt", "Takht Bhai", "Rustam", "Main Mardan City"],
  "Abbottabad": ["Jinnahabad", "Mandian", "Supply Bazaar"],
  "Swat": ["Mingora", "Saidu Sharif", "Kalam"],
  "Nowshera": ["Cantt Area", "Pabbi", "Akbarpura"],
  "Faisalabad": ["Susan Road", "Peoples Colony", "Madina Town"],
  "Multan": ["Cantt", "Gulgasht Colony", "Bosan Road"],
  "Gujranwala": ["Model Town", "Satellite Town", "Civil Lines"],
  "Sialkot": ["Cantt", "Model Town", "Paris Road"],
  "Quetta": ["Cantt", "Jinnah Town", "Satellite Town"],
  "Hyderabad": ["Latifabad", "Qasimabad", "City Area"]
};

const PROPERTY_TYPES = [
  "House", "Apartment", "Flat", "Room", "Hostel", "Hotel", "Guest House",
  "Villa", "Farm House", "Shop", "Office", "Commercial Building",
  "Vacation Rental", "Short-Term Rental", "Long-Term Rental", "Plaza", "Warehouse", "Restaurant"
];

const PURPOSES = ["Rent", "Short Stay", "Hotel", "Commercial"];

const AMENITIES_POOL = [
  "Lift", "Parking", "Security Guard", "Backup Generator", "Water Supply",
  "Gas Connection", "Electricity Meter", "Balcony", "CCTV", "Gym",
  "Servant Quarter", "Lawn", "Swimming Pool", "Community Park", "Solar Panels"
];

/* ---- Helper to build image sets without hunting for dead links.
   Picsum returns a real photograph for any seed and never breaks, which
   keeps the demo free of broken-image icons. Swap these for your own
   Unsplash/CDN URLs later - see README "Replacing Images". */
function imgSet(seed, count = 4) {
  const arr = [];
  for (let i = 1; i <= count; i++) arr.push(`https://picsum.photos/seed/${seed}-${i}/900/650`);
  return arr;
}

/* ---- Sample properties ---------------------------------------------------
   30 realistic listings spread across cities, types and purposes. */
const PROPERTIES = [
  { id: 1, title: "Modern 5 Marla House", type: "House", purpose: "Rent", city: "Lahore", society: "Bahria Town Lahore", area: "Bahria Town Lahore", price: 75000, priceType: "month", bedrooms: 3, bathrooms: 3, size: "5 Marla", furnished: "Semi Furnished", image: imgSet("house1")[0], gallery: imgSet("house1"), description: "A beautifully maintained 5 Marla house in a gated sector of Bahria Town Lahore, featuring an open-plan lounge, modern kitchen fittings and a small front lawn ideal for a young family.", amenities: ["Parking", "Security Guard", "Backup Generator", "Lawn", "Gas Connection"], featured: true, rating: 4.6, dateAdded: "2026-08-20" },
  { id: 2, title: "Luxury Apartment", type: "Apartment", purpose: "Rent", city: "Islamabad", society: "DHA Islamabad", area: "DHA Phase 2", price: 95000, priceType: "month", bedrooms: 3, bathrooms: 3, size: "1800 sqft", furnished: "Furnished", image: imgSet("apt1")[0], gallery: imgSet("apt1"), description: "Spacious 3-bed apartment on a high floor with panoramic Margalla Hills views, fully furnished with imported fittings, in a secure DHA Islamabad tower.", amenities: ["Lift", "Parking", "CCTV", "Gym", "Backup Generator"], featured: true, rating: 4.8, dateAdded: "2026-08-25" },
  { id: 3, title: "Family House", type: "House", purpose: "Rent", city: "Peshawar", society: "Hayatabad", area: "Phase 3, Hayatabad", price: 65000, priceType: "month", bedrooms: 4, bathrooms: 4, size: "10 Marla", furnished: "Unfurnished", image: imgSet("house2")[0], gallery: imgSet("house2"), description: "Spacious double-storey house in a quiet phase of Hayatabad, close to schools and Ring Road, with a wide driveway and separate portion for guests.", amenities: ["Parking", "Lawn", "Water Supply", "Gas Connection"], featured: true, rating: 4.4, dateAdded: "2026-08-15" },
  { id: 4, title: "Modern Villa", type: "Villa", purpose: "Rent", city: "Karachi", society: "Bahria Town Karachi", area: "Precinct 10", price: 150000, priceType: "month", bedrooms: 5, bathrooms: 5, size: "500 sqyd", furnished: "Furnished", image: imgSet("villa1")[0], gallery: imgSet("villa1"), description: "A premium villa with private swimming pool and landscaped garden inside Bahria Town Karachi's gated community, finished to a five-star standard.", amenities: ["Swimming Pool", "Parking", "Security Guard", "Servant Quarter", "Solar Panels"], featured: true, rating: 4.9, dateAdded: "2026-08-28" },
  { id: 5, title: "Cozy Studio Apartment", type: "Apartment", purpose: "Rent", city: "Islamabad", society: "E-11", area: "E-11/3", price: 45000, priceType: "month", bedrooms: 0, bathrooms: 1, size: "550 sqft", furnished: "Furnished", image: imgSet("studio1")[0], gallery: imgSet("studio1"), description: "Compact studio unit perfect for a student or working professional, walking distance from Centaurus Mall.", amenities: ["Lift", "Parking", "Backup Generator"], featured: false, rating: 4.2, dateAdded: "2026-08-10" },
  { id: 6, title: "2 Bed Flat Near Metro", type: "Flat", purpose: "Rent", city: "Rawalpindi", society: "Satellite Town", area: "Block A", price: 38000, priceType: "month", bedrooms: 2, bathrooms: 2, size: "900 sqft", furnished: "Semi Furnished", image: imgSet("flat1")[0], gallery: imgSet("flat1"), description: "Well-ventilated second-floor flat close to the metro bus corridor, ideal for small families or a shared setup.", amenities: ["Water Supply", "Gas Connection", "Parking"], featured: false, rating: 4.0, dateAdded: "2026-07-30" },
  { id: 7, title: "Single Room for Rent", type: "Room", purpose: "Rent", city: "Lahore", society: "Johar Town", area: "Block J1", price: 15000, priceType: "month", bedrooms: 1, bathrooms: 1, size: "150 sqft", furnished: "Furnished", image: imgSet("room1")[0], gallery: imgSet("room1"), description: "Furnished single room with attached bath in a shared house, suitable for a bachelor or student, bills included.", amenities: ["Water Supply", "Gas Connection", "Security Guard"], featured: false, rating: 3.9, dateAdded: "2026-07-22" },
  { id: 8, title: "Boys Hostel Seat", type: "Hostel", purpose: "Rent", city: "Peshawar", society: "University Town", area: "Old Jamrud Road", price: 12000, priceType: "month", bedrooms: 1, bathrooms: 1, size: "Shared", furnished: "Furnished", image: imgSet("hostel1")[0], gallery: imgSet("hostel1"), description: "Clean and secure hostel seat near University of Peshawar, mess facility available, mixed sharing rooms.", amenities: ["Security Guard", "CCTV", "Backup Generator"], featured: false, rating: 4.1, dateAdded: "2026-07-18" },
  { id: 9, title: "Guest House Room", type: "Guest House", purpose: "Short Stay", city: "Swat", society: "Mingora", area: "Fizagat Road", price: 8500, priceType: "night", bedrooms: 1, bathrooms: 1, size: "Standard", furnished: "Furnished", image: imgSet("guest1")[0], gallery: imgSet("guest1"), description: "Charming guest house with mountain views, a short drive from the Fizagat picnic spot, ideal for weekend travellers.", amenities: ["Parking", "Water Supply", "Backup Generator"], featured: false, rating: 4.5, dateAdded: "2026-08-01" },
  { id: 10, title: "10 Marla Farm House", type: "Farm House", purpose: "Short Stay", city: "Islamabad", society: "Bahria Town Islamabad", area: "Farmhouses Block", price: 45000, priceType: "night", bedrooms: 4, bathrooms: 4, size: "2 Kanal", furnished: "Furnished", image: imgSet("farm1")[0], gallery: imgSet("farm1"), description: "Private farmhouse with lawn, barbecue area and a small pond, popular for weekend family gatherings and events.", amenities: ["Lawn", "Parking", "Swimming Pool", "Security Guard"], featured: true, rating: 4.7, dateAdded: "2026-08-22" },
  { id: 11, title: "Corner Shop on Main Road", type: "Shop", purpose: "Commercial", city: "Lahore", society: "Model Town", area: "Main Boulevard", price: 60000, priceType: "month", bedrooms: 0, bathrooms: 1, size: "400 sqft", furnished: "Unfurnished", image: imgSet("shop1")[0], gallery: imgSet("shop1"), description: "High-visibility corner shop on Model Town's main boulevard, suitable for retail, mobile or food brands.", amenities: ["Parking", "Electricity Meter", "CCTV"], featured: false, rating: 4.3, dateAdded: "2026-08-05" },
  { id: 12, title: "Furnished Office Space", type: "Office", purpose: "Commercial", city: "Karachi", society: "Clifton", area: "Block 5", price: 120000, priceType: "month", bedrooms: 0, bathrooms: 2, size: "1500 sqft", furnished: "Furnished", image: imgSet("office1")[0], gallery: imgSet("office1"), description: "Grade-A office floor in Clifton with a reception area, three cabins and an open workstation zone, ready to move in.", amenities: ["Lift", "Parking", "Backup Generator", "CCTV"], featured: true, rating: 4.6, dateAdded: "2026-08-18" },
  { id: 13, title: "Commercial Plaza Floor", type: "Commercial Building", purpose: "Commercial", city: "Rawalpindi", society: "Saddar", area: "Bank Road", price: 200000, priceType: "month", bedrooms: 0, bathrooms: 3, size: "3000 sqft", furnished: "Unfurnished", image: imgSet("plaza1")[0], gallery: imgSet("plaza1"), description: "Entire floor of a commercial plaza on Bank Road, suitable for a bank branch, showroom or corporate office.", amenities: ["Lift", "Parking", "Electricity Meter"], featured: false, rating: 4.2, dateAdded: "2026-07-28" },
  { id: 14, title: "Beachside Vacation Home", type: "Vacation Rental", purpose: "Short Stay", city: "Karachi", society: "DHA Karachi", area: "Phase 8", price: 25000, priceType: "night", bedrooms: 3, bathrooms: 3, size: "400 sqyd", furnished: "Furnished", image: imgSet("vac1")[0], gallery: imgSet("vac1"), description: "Bright, breezy home minutes from Sea View, fully furnished for short getaways with family or friends.", amenities: ["Parking", "Balcony", "Backup Generator"], featured: true, rating: 4.7, dateAdded: "2026-08-27" },
  { id: 15, title: "Short-Term Serviced Flat", type: "Short-Term Rental", purpose: "Short Stay", city: "Islamabad", society: "F-11", area: "F-11 Markaz", price: 9000, priceType: "night", bedrooms: 1, bathrooms: 1, size: "700 sqft", furnished: "Furnished", image: imgSet("st1")[0], gallery: imgSet("st1"), description: "Serviced one-bed flat near F-11 Markaz with daily housekeeping, ideal for business travellers.", amenities: ["Lift", "Parking", "CCTV"], featured: false, rating: 4.4, dateAdded: "2026-08-12" },
  { id: 16, title: "Long-Term Family Apartment", type: "Long-Term Rental", purpose: "Rent", city: "Lahore", society: "Wapda Town", area: "Block J2", price: 55000, priceType: "month", bedrooms: 3, bathrooms: 2, size: "1400 sqft", furnished: "Semi Furnished", image: imgSet("lt1")[0], gallery: imgSet("lt1"), description: "Well-kept apartment suited to long-term family tenancy, close to parks and a well-known school network.", amenities: ["Parking", "Water Supply", "Gas Connection"], featured: false, rating: 4.1, dateAdded: "2026-07-25" },
  { id: 17, title: "3 Marla House", type: "House", purpose: "Rent", city: "Faisalabad", society: "Madina Town", area: "Block C", price: 28000, priceType: "month", bedrooms: 2, bathrooms: 2, size: "3 Marla", furnished: "Unfurnished", image: imgSet("house3")[0], gallery: imgSet("house3"), description: "Compact and efficient 3 Marla house on a quiet street, freshly painted and ready to move in.", amenities: ["Water Supply", "Gas Connection"], featured: false, rating: 3.8, dateAdded: "2026-07-10" },
  { id: 18, title: "7 Marla Double Storey House", type: "House", purpose: "Rent", city: "Gujranwala", society: "Model Town", area: "Block D", price: 42000, priceType: "month", bedrooms: 4, bathrooms: 3, size: "7 Marla", furnished: "Semi Furnished", image: imgSet("house4")[0], gallery: imgSet("house4"), description: "Double storey house with a separate drawing room and a small backyard, near Model Town park.", amenities: ["Parking", "Lawn", "Backup Generator"], featured: false, rating: 4.0, dateAdded: "2026-07-14" },
  { id: 19, title: "1 Kanal House with Lawn", type: "House", purpose: "Rent", city: "Lahore", society: "DHA Lahore", area: "Phase 6", price: 180000, priceType: "month", bedrooms: 5, bathrooms: 6, size: "1 Kanal", furnished: "Furnished", image: imgSet("house5")[0], gallery: imgSet("house5"), description: "Executive 1 Kanal residence in DHA Phase 6 with a manicured lawn, home theatre and servant quarters.", amenities: ["Swimming Pool", "Servant Quarter", "Security Guard", "Backup Generator", "Parking"], featured: true, rating: 4.9, dateAdded: "2026-08-29" },
  { id: 20, title: "2 Kanal Farm House", type: "Farm House", purpose: "Short Stay", city: "Multan", society: "Bosan Road", area: "Green Belt", price: 55000, priceType: "night", bedrooms: 5, bathrooms: 5, size: "2 Kanal", furnished: "Furnished", image: imgSet("farm2")[0], gallery: imgSet("farm2"), description: "Sprawling farm house with mango orchards on the outskirts of Multan, popular for weddings and retreats.", amenities: ["Lawn", "Parking", "Swimming Pool", "Solar Panels"], featured: false, rating: 4.5, dateAdded: "2026-08-08" },
  { id: 21, title: "4 Bed Apartment with Balcony", type: "Apartment", purpose: "Rent", city: "Karachi", society: "Gulshan-e-Iqbal", area: "Block 13-D", price: 70000, priceType: "month", bedrooms: 4, bathrooms: 3, size: "2000 sqft", furnished: "Semi Furnished", image: imgSet("apt2")[0], gallery: imgSet("apt2"), description: "Roomy fourth-floor apartment with two balconies overlooking the main avenue, close to NIPA chowrangi.", amenities: ["Lift", "Parking", "Water Supply", "Balcony"], featured: false, rating: 4.2, dateAdded: "2026-07-31" },
  { id: 22, title: "Bahria Enclave Villa", type: "Villa", purpose: "Rent", city: "Islamabad", society: "Bahria Town Islamabad", area: "Bahria Enclave", price: 220000, priceType: "month", bedrooms: 6, bathrooms: 6, size: "1 Kanal", furnished: "Furnished", image: imgSet("villa2")[0], gallery: imgSet("villa2"), description: "Statement villa in Bahria Enclave with a rooftop lounge and imported interiors, gated 24/7 community.", amenities: ["Swimming Pool", "Security Guard", "Parking", "Servant Quarter"], featured: true, rating: 4.8, dateAdded: "2026-08-26" },
  { id: 23, title: "Restaurant Space for Rent", type: "Restaurant", purpose: "Commercial", city: "Lahore", society: "Gulberg", area: "MM Alam Road", price: 350000, priceType: "month", bedrooms: 0, bathrooms: 2, size: "4000 sqft", furnished: "Furnished", image: imgSet("resto1")[0], gallery: imgSet("resto1"), description: "Fully fitted restaurant space on MM Alam Road with an existing kitchen exhaust and outdoor seating area.", amenities: ["Parking", "Backup Generator", "Gas Connection"], featured: false, rating: 4.4, dateAdded: "2026-08-02" },
  { id: 24, title: "Warehouse Near Ring Road", type: "Warehouse", purpose: "Commercial", city: "Peshawar", society: "Ring Road", area: "Industrial Zone", price: 150000, priceType: "month", bedrooms: 0, bathrooms: 1, size: "8000 sqft", furnished: "Unfurnished", image: imgSet("wh1")[0], gallery: imgSet("wh1"), description: "High-ceiling warehouse with truck access on Ring Road, suited for storage or light manufacturing.", amenities: ["Parking", "Electricity Meter", "Security Guard"], featured: false, rating: 4.0, dateAdded: "2026-07-19" },
  { id: 25, title: "Boutique Guest House", type: "Guest House", purpose: "Short Stay", city: "Abbottabad", society: "Mandian", area: "Jinnah Road", price: 11000, priceType: "night", bedrooms: 2, bathrooms: 2, size: "Standard", furnished: "Furnished", image: imgSet("guest2")[0], gallery: imgSet("guest2"), description: "Hill-view guest house tucked in Mandian, a favourite stopover on the way to Nathia Gali.", amenities: ["Parking", "Water Supply", "Lawn"], featured: false, rating: 4.3, dateAdded: "2026-07-27" },
  { id: 26, title: "2 Bed Flat in Askari", type: "Flat", purpose: "Rent", city: "Lahore", society: "Askari", area: "Askari 10", price: 48000, priceType: "month", bedrooms: 2, bathrooms: 2, size: "1100 sqft", furnished: "Semi Furnished", image: imgSet("flat2")[0], gallery: imgSet("flat2"), description: "Secure flat inside Askari 10 with a dedicated parking bay and 24-hour cantonment security.", amenities: ["Security Guard", "Parking", "Backup Generator"], featured: false, rating: 4.3, dateAdded: "2026-08-06" },
  { id: 27, title: "Girls Hostel Seat", type: "Hostel", purpose: "Rent", city: "Islamabad", society: "G-11", area: "G-11 Markaz", price: 18000, priceType: "month", bedrooms: 1, bathrooms: 1, size: "Shared", furnished: "Furnished", image: imgSet("hostel2")[0], gallery: imgSet("hostel2"), description: "Secure girls hostel near G-11 Markaz with CCTV coverage, mess and laundry service included.", amenities: ["Security Guard", "CCTV", "Water Supply"], featured: false, rating: 4.5, dateAdded: "2026-08-14" },
  { id: 28, title: "Small Office Cabin", type: "Office", purpose: "Commercial", city: "Peshawar", society: "Board Bazaar", area: "Arbab Road", price: 25000, priceType: "month", bedrooms: 0, bathrooms: 1, size: "300 sqft", furnished: "Semi Furnished", image: imgSet("office2")[0], gallery: imgSet("office2"), description: "Affordable single-cabin office suited to a small consultancy or startup team, near Arbab Road.", amenities: ["Parking", "Electricity Meter"], featured: false, rating: 3.9, dateAdded: "2026-07-16" },
  { id: 29, title: "Riverside Vacation Villa", type: "Vacation Rental", purpose: "Short Stay", city: "Swat", society: "Kalam", area: "Riverside", price: 30000, priceType: "night", bedrooms: 4, bathrooms: 4, size: "Standard", furnished: "Furnished", image: imgSet("vac2")[0], gallery: imgSet("vac2"), description: "Wooden riverside villa in Kalam with a private deck overlooking the Swat river, bonfire spot included.", amenities: ["Parking", "Lawn", "Backup Generator"], featured: true, rating: 4.9, dateAdded: "2026-08-30" },
  { id: 30, title: "Retail Shop in Hayatabad", type: "Shop", purpose: "Commercial", city: "Peshawar", society: "Hayatabad", area: "Phase 2 Commercial", price: 55000, priceType: "month", bedrooms: 0, bathrooms: 1, size: "500 sqft", furnished: "Unfurnished", image: imgSet("shop2")[0], gallery: imgSet("shop2"), description: "Busy commercial strip location in Hayatabad Phase 2, good footfall from nearby markets and schools.", amenities: ["Parking", "Electricity Meter", "CCTV"], featured: false, rating: 4.1, dateAdded: "2026-08-04" },
  { id: 31, title: "Executive Studio Flat", type: "Flat", purpose: "Rent", city: "Rawalpindi", society: "Chaklala", area: "Scheme 3", price: 32000, priceType: "month", bedrooms: 1, bathrooms: 1, size: "600 sqft", furnished: "Furnished", image: imgSet("flat3")[0], gallery: imgSet("flat3"), description: "Neat studio flat near Chaklala Scheme 3, popular with airport-area professionals.", amenities: ["Parking", "Backup Generator"], featured: false, rating: 4.0, dateAdded: "2026-07-21" },
  { id: 32, title: "Hilltop Farm House", type: "Farm House", purpose: "Short Stay", city: "Abbottabad", society: "Jinnahabad", area: "Hilltop", price: 40000, priceType: "night", bedrooms: 4, bathrooms: 3, size: "1 Kanal", furnished: "Furnished", image: imgSet("farm3")[0], gallery: imgSet("farm3"), description: "Pine-shaded farm house with valley views, a popular retreat for families visiting from Islamabad.", amenities: ["Lawn", "Parking", "Backup Generator"], featured: false, rating: 4.6, dateAdded: "2026-08-09" }
];

/* ---- Sample hotels --------------------------------------------------------
   15 hotels across major tourist and business cities. */
const HOTELS = [
  { id: 101, name: "Margalla Grand Hotel", city: "Islamabad", location: "Blue Area", stars: 5, reviews: 482, price: 32000, image: imgSet("hotelA")[0], gallery: imgSet("hotelA"), amenities: ["Free WiFi", "Swimming Pool", "Gym", "Breakfast Included", "Parking"] },
  { id: 102, name: "Gulberg Continental", city: "Lahore", location: "Gulberg", stars: 4, reviews: 356, price: 18500, image: imgSet("hotelB")[0], gallery: imgSet("hotelB"), amenities: ["Free WiFi", "Restaurant", "Parking", "Airport Shuttle"] },
  { id: 103, name: "Clifton Pearl Hotel", city: "Karachi", location: "Clifton", stars: 4, reviews: 601, price: 21000, image: imgSet("hotelC")[0], gallery: imgSet("hotelC"), amenities: ["Free WiFi", "Sea View", "Gym", "Breakfast Included"] },
  { id: 104, name: "Hayatabad Heights", city: "Peshawar", location: "Hayatabad", stars: 4, reviews: 214, price: 14000, image: imgSet("hotelD")[0], gallery: imgSet("hotelD"), amenities: ["Free WiFi", "Restaurant", "Parking"] },
  { id: 105, name: "Swat Serena Retreat", city: "Swat", location: "Mingora", stars: 5, reviews: 389, price: 27000, image: imgSet("hotelE")[0], gallery: imgSet("hotelE"), amenities: ["Mountain View", "Free WiFi", "Restaurant", "Bonfire Deck"] },
  { id: 106, name: "Murree Pines Hotel", city: "Murree", location: "Mall Road", stars: 4, reviews: 512, price: 19500, image: imgSet("hotelF")[0], gallery: imgSet("hotelF"), amenities: ["Free WiFi", "Restaurant", "Heating", "Parking"] },
  { id: 107, name: "Nathia Gali Woodlands", city: "Nathia Gali", location: "Upper Nathia Gali", stars: 3, reviews: 156, price: 12500, image: imgSet("hotelG")[0], gallery: imgSet("hotelG"), amenities: ["Mountain View", "Free WiFi", "Heating"] },
  { id: 108, name: "Hunza Serena Inn", city: "Hunza", location: "Karimabad", stars: 5, reviews: 298, price: 34000, image: imgSet("hotelH")[0], gallery: imgSet("hotelH"), amenities: ["Valley View", "Free WiFi", "Restaurant", "Heating"] },
  { id: 109, name: "Islamabad Marriott-style Suites", city: "Islamabad", location: "F-8 Markaz", stars: 5, reviews: 720, price: 38000, image: imgSet("hotelI")[0], gallery: imgSet("hotelI"), amenities: ["Free WiFi", "Swimming Pool", "Spa", "Gym", "Breakfast Included"] },
  { id: 110, name: "Lahore Fort View Hotel", city: "Lahore", location: "Mall Road", stars: 4, reviews: 340, price: 16000, image: imgSet("hotelJ")[0], gallery: imgSet("hotelJ"), amenities: ["Free WiFi", "Restaurant", "Parking"] },
  { id: 111, name: "Karachi Business Tower Hotel", city: "Karachi", location: "Saddar", stars: 4, reviews: 288, price: 20000, image: imgSet("hotelK")[0], gallery: imgSet("hotelK"), amenities: ["Free WiFi", "Business Centre", "Gym", "Airport Shuttle"] },
  { id: 112, name: "Peshawar Heritage Inn", city: "Peshawar", location: "University Town", stars: 3, reviews: 176, price: 11000, image: imgSet("hotelL")[0], gallery: imgSet("hotelL"), amenities: ["Free WiFi", "Restaurant", "Parking"] },
  { id: 113, name: "Faisalabad Grand Palace", city: "Faisalabad", location: "Susan Road", stars: 4, reviews: 203, price: 15500, image: imgSet("hotelM")[0], gallery: imgSet("hotelM"), amenities: ["Free WiFi", "Restaurant", "Banquet Hall"] },
  { id: 114, name: "Multan Serai Hotel", city: "Multan", location: "Cantt", stars: 3, reviews: 132, price: 10500, image: imgSet("hotelN")[0], gallery: imgSet("hotelN"), amenities: ["Free WiFi", "Parking", "Restaurant"] },
  { id: 115, name: "Quetta Highlands Hotel", city: "Quetta", location: "Jinnah Town", stars: 4, reviews: 148, price: 13500, image: imgSet("hotelO")[0], gallery: imgSet("hotelO"), amenities: ["Free WiFi", "Restaurant", "Heating", "Parking"] }
];

/* ---- Category metadata used on the homepage grid ---- */
const CATEGORIES = [
  { key: "House", label: "Houses", icon: "fa-house" },
  { key: "Apartment", label: "Apartments", icon: "fa-building" },
  { key: "Hotel", label: "Hotels", icon: "fa-hotel" },
  { key: "Room", label: "Rooms", icon: "fa-bed" },
  { key: "Villa", label: "Villas", icon: "fa-house-chimney" },
  { key: "Shop", label: "Shops", icon: "fa-store" },
  { key: "Office", label: "Offices", icon: "fa-briefcase" },
  { key: "Vacation Rental", label: "Vacation Rentals", icon: "fa-umbrella-beach" }
];

/* ---- Formatting helpers ---- */
function formatPKR(amount) {
  return "PKR " + Number(amount).toLocaleString("en-PK");
}
function priceLabel(p) {
  return `${formatPKR(p.price)} / ${p.priceType}`;
}
function categoryCount(typeKey) {
  return PROPERTIES.filter(p => p.type === typeKey).length + (typeKey === "Hotel" ? HOTELS.length : 0);
}

/* ---- Card renderers ---- */
function propertyCardHTML(p) {
  const isFav = Favorites.has(p.id);
  return `
  <article class="p-card" data-id="${p.id}" data-type="${p.type}">
    <div class="p-card__media">
      <img src="${p.image}" alt="${p.title} in ${p.area}, ${p.city}" loading="lazy">
      ${p.featured ? '<span class="badge badge--featured">Featured</span>' : ''}
      <span class="badge badge--type">${p.type}</span>
      <button class="fav-btn ${isFav ? 'is-active' : ''}" aria-label="Save to favorites" data-fav="${p.id}">
        <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
      </button>
    </div>
    <div class="p-card__body">
      <h3 class="p-card__title">${p.title}</h3>
      <p class="p-card__loc"><i class="fa-solid fa-location-dot"></i> ${p.area}, ${p.city}</p>
      <ul class="p-card__meta">
        ${p.bedrooms ? `<li><i class="fa-solid fa-bed"></i> ${p.bedrooms} Bed</li>` : ''}
        <li><i class="fa-solid fa-bath"></i> ${p.bathrooms} Bath</li>
        <li><i class="fa-solid fa-vector-square"></i> ${p.size}</li>
      </ul>
      <div class="p-card__foot">
        <span class="p-card__price">${priceLabel(p)}</span>
        <button class="btn btn--sm btn--primary" data-view="${p.id}">View Details</button>
      </div>
    </div>
  </article>`;
}

function hotelCardHTML(h) {
  const stars = Array.from({length: 5}, (_, i) => `<i class="fa-${i < h.stars ? 'solid' : 'regular'} fa-star"></i>`).join('');
  return `
  <article class="hotel-card" data-id="${h.id}">
    <div class="p-card__media">
      <img src="${h.image}" alt="${h.name} in ${h.city}" loading="lazy">
      <span class="badge badge--type">${h.city}</span>
    </div>
    <div class="p-card__body">
      <h3 class="p-card__title">${h.name}</h3>
      <p class="p-card__loc"><i class="fa-solid fa-location-dot"></i> ${h.location}, ${h.city}</p>
      <div class="hotel-card__stars">${stars} <span class="hotel-card__reviews">(${h.reviews} reviews)</span></div>
      <p class="hotel-card__amenities">${h.amenities.slice(0,3).join(" · ")}</p>
      <div class="p-card__foot">
        <span class="p-card__price">${formatPKR(h.price)} / night</span>
        <button class="btn btn--sm btn--primary" data-view-hotel="${h.id}">View Hotel</button>
      </div>
    </div>
  </article>`;
}

function renderGrid(containerId, items, type = "property") {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!items.length) {
    el.innerHTML = `<div class="empty-state"><i class="fa-regular fa-face-frown"></i><p>No listings match your filters yet. Try widening your search.</p></div>`;
    return;
  }
  el.innerHTML = items.map(type === "hotel" ? hotelCardHTML : propertyCardHTML).join("");
}

/* Populate a <select> with LOCATIONS cities */
function fillCitySelect(select, placeholder = "Any City") {
  if (!select) return;
  select.innerHTML = `<option value="">${placeholder}</option>` +
    Object.keys(LOCATIONS).map(c => `<option value="${c}">${c}</option>`).join("");
}
/* Populate a <select> with societies for a chosen city */
function fillSocietySelect(select, city, placeholder = "Any Society / Area") {
  if (!select) return;
  const list = LOCATIONS[city] || [];
  select.innerHTML = `<option value="">${placeholder}</option>` + list.map(s => `<option value="${s}">${s}</option>`).join("");
  select.disabled = list.length === 0;
}
function fillTypeSelect(select, placeholder = "Any Property Type") {
  if (!select) return;
  select.innerHTML = `<option value="">${placeholder}</option>` +
    PROPERTY_TYPES.map(t => `<option value="${t}">${t}</option>`).join("");
}
