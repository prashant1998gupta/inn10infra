# Inn10 Infra – Real Estate Website

Redesigned website for **Inn10 Infra Projects LLP** – trusted real estate advisor in Indirapuram, Noida, Noida Extension & Delhi NCR.

📞 8700 190 507 · 9990 913 542 · ✉️ info@inn10infra.com

## Features

- **3D animated city hero** (Three.js) with property search bar (type / location / builder / keyword)
- **3D rotating featured-projects carousel** (drag / swipe)
- **20 projects** with filters (type, location, builder), search, sort by distance & ♥ shortlist
- **Project detail page** for every project – `project.html?p=<slug>` – with brochure viewer, location map, EMI calculator, site-visit form & similar projects
- **Interactive map** of all projects (Leaflet + Esri dark tiles, no API key)
- **Scroll-built 3D tower** presenting the 4 services
- **Home-loan EMI calculator** (Indian ₹ Lakh / Cr format)
- **Shortlist** saved in the browser → one-click WhatsApp enquiry
- Enquiry forms send via **WhatsApp or e-mail** – no server needed
- Fully **responsive** (320px phones → 4K), touch-friendly, print-friendly

## Project structure

```
index.html          Home page
project.html        Project detail page (one template for all projects)
css/style.css       Base theme (navy & gold)
css/realestate.css  Portal features (search, map, EMI, project page …)
css/responsive.css  Device-specific fixes – loaded last
js/data.js          ★ ALL CONTENT: projects, builders, services, testimonials, map coordinates
js/common.js        Shared header/footer, shortlist, map, EMI, forms
js/main.js          Home page logic
js/project.js       Project page logic
js/hero3d.js        3D city hero
js/tower3d.js       3D services tower
assets/images/      Logos, project images, builder logos & PDF brochures
```

## Add or edit a project

Edit **`js/data.js`** only:

1. Add an entry to `projects` (name, builder, types, config, location, image, brochure).
2. Add its `[lat, lng]` under `window.INN10.geo` for the map pin.

The card, map pin, filters and project page are generated automatically.

## Run locally

It is a static site – no build step.

```bash
python -m http.server 8000
# open http://localhost:8000
```

## Notes

- Map pin locations are **approximate** (sector / market level) – replace with exact coordinates in `js/data.js`.
- Three.js, Leaflet and Google Fonts load from CDNs, so an internet connection is required.

© Inn10 Infra Projects LLP. All rights reserved.
