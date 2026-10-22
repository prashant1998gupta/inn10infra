# CLAUDE.md — Inn10 Infra Website

Guide for Claude (and any developer) working on this repo. Read this first.

## What this is

Static marketing + property-portal website for **Inn10 Infra Projects LLP**, a real-estate
advisory in Indirapuram / Noida / Delhi NCR. It is a redesign of `inn10infra.com` that keeps
**all original content, images and brochures** and adds a premium 3D / real-estate experience.

- Repo: https://github.com/prashant1998gupta/inn10infra (branch `main`)
- Live (GitHub Pages, once enabled): https://prashant1998gupta.github.io/inn10infra/
- Contact data used everywhere: 8700 190 507 · 9990 913 542 · info@inn10infra.com · WhatsApp `918700190507`

## Tech stack — keep it this way

- **Plain HTML + CSS + vanilla JavaScript (ES5 style).** No framework, no bundler, no npm, no build step.
- CDN libraries only:
  - **Three.js 0.149.0** (`cdn.jsdelivr.net`) – 3D hero city + services tower
  - **Leaflet 1.9.4** (`unpkg.com`) – maps
  - **Google Fonts** – Cormorant Garamond (headings) + Manrope (body)
- Map tiles: **Esri World_Dark_Gray** (keyless). ⚠️ Do **not** switch back to CARTO basemaps — they now return an "API KEY REQUIRED" image.
- No backend. Forms open **WhatsApp** (`wa.me`) or **mailto:** with a pre-filled message.
- Code style: `var`, `function () {}`, IIFEs; no arrow functions / classes / modules (old-browser support). 2-space indent, double quotes in JS.

## File map

```
index.html          Home page (hero search, featured 3D carousel, projects grid, locations,
                    map, builders, services tower, EMI, about, testimonials, contact)
project.html        ONE template for all project pages → project.html?p=<slug>
css/style.css       1st: base layout (original version)
css/realestate.css  2nd: portal features (search bar, map, journey, EMI, drawer, project page)
css/responsive.css  3rd: device fixes (menu, hero sizing, breakpoints, print)
css/premium.css     4th / LAST: premium design layer — colours, typography, cards, mobile dock.
                    Most visual changes should go here.
js/data.js          ★ ALL CONTENT: company, slides, projects, developers, services,
                    testimonials, map coords (INN10.geo), office location
js/common.js        Shared by both pages → window.I10 (header/footer injection, icons,
                    shortlist, map, EMI, forms, card renderer, reveal, tilt, preloader)
js/main.js          Home-page logic (search, filters, sort, grid, locations, map list,
                    carousel, builders marquee, services, testimonials, contact form)
js/project.js       Project-page logic (reads ?p=slug, hero, facts, brochure viewer,
                    map + nearby, EMI, form, similar projects, SEO title / JSON-LD)
js/hero3d.js        Three.js night city in the home hero (falls back to slider images)
js/tower3d.js       Three.js tower built floor-by-floor on scroll (services section)
assets/images/      Logos, slider, about, developer logos, project images + PDF brochures
```

**Script order matters** (both pages): CDN libs → `data.js` → `common.js` → page script(s).
`main.js` / `project.js` depend on `window.I10` from `common.js`.

**CSS order matters:** `style.css` → `realestate.css` → `responsive.css` → `premium.css`.

## Data model (`js/data.js`)

```js
{ name: "Godrej Woods",            // display name; slug is auto-generated from it
  builder: "Godrej",               // must match developers[].name to show the logo, else "Others"
  types: ["residential"],          // any of: residential | commercial | office
  config: "3, 4 & 5 BHK Homes",
  location: "Sector 43, Noida",    // area derived: "Greater Noida" | "Noida Expressway" | "Noida" | "Delhi"
  image: "assets/images/projects/godrej-woods.jpg",
  brochure: "assets/images/projects/godrej-woods-noida.pdf",   // "" → "Request Brochure" flow
  featured: true }                 // optional → shown in the 3D carousel (keep ~8)
```

- Map pin: add `"Project Name": [lat, lng]` to `window.INN10.geo`. Coordinates are **approximate** (sector level).
- Slug rule (`U.slug`): lowercase, drop apostrophes, non-alphanumerics → `-` (e.g. `ithum's 62` → `ithums-62`).
- Renaming a project changes its URL (`project.html?p=<slug>`) — avoid unless intended.

### Add a project (most common task)
1. Copy the image (and PDF) into `assets/images/projects/`.
2. Add an object to `projects` in `js/data.js`.
3. Add its coordinates to `INN10.geo`.
4. Done — card, filters, map pin, location counts, project page and "similar projects" are generated.

## Shared helpers (`window.I10`, defined in `common.js`)

`$`, `$$`, `esc` (HTML-escape — **always** use for data put into innerHTML), `icon(name)`, `hydrateIcons`,
`slug`, `bySlug`, `url(p)`, `areaOf`, `areas`, `builders`, `builderLogo`, `km(a, b)`,
`inr`, `inrShort` (₹ Lakh / Cr), `card(p)`, `emiHTML` + `initEMI(root)`, `makeMap(el)`,
`pinIcon`, `popupHTML`, `bindForm(form, getProjectName)`, `isShort` / `toggleShort` / `renderSL`
(shortlist in `localStorage` key `inn10_shortlist`), `toast(msg)`, `bindTilt(els)`, `reveal(root)`, `isHome`.

- **Header, footer, floating buttons, mobile bottom dock, shortlist drawer and toast are injected by `common.js`** — they are not in the HTML files. Edit them in `common.js`.
- Icons are inline SVG line icons from the `ICONS` map in `common.js`. In HTML: `<i data-i="phone"></i>`; in JS: `U.icon("phone")`.
  Available: phone, whatsapp, mail, pin, heart, download, arrow, arrowLeft, arrowUp, share, check, x, search, building, home, store, briefcase, layers, map, file, compass, shield, chart, calendar, play, message.
- **No emojis in the UI** — they render differently per OS and were removed on purpose.

## Design system (`css/premium.css` → `:root`)

| Token | Use |
|---|---|
| `--ink #14181f` | headings on light |
| `--body #4a5161` | paragraphs on light |
| `--mute #5b6170` | small meta on light |
| `--gold-ink #7a5c15` | gold **text** on light backgrounds |
| `--gold #d9b46a` | gold text / accents on dark backgrounds |
| `--gold-btn #d4af6a` | gold button fill (dark text `#14110a` on it) |
| `--paper #faf8f3` / `--cream #f3efe6` | light section backgrounds |
| `--night #0b0f17` / `--night-2 #121826` | dark section backgrounds |
| `--on-night #c9ced8` / `--on-night-mute #a3abba` | text on dark |

- Section classes: `.section.light`, `.section.cream`, `.section.dark`.
- Headings use `<em>` for the gold-italic accent: `<h2>All <em>Projects</em></h2>`.
- Section header: `.section-head.split` (title left, `.head-note` right) or `.section-head.center`.
- **Contrast rule:** all text must pass WCAG AA (4.5:1 normal text, 3:1 for ≥24px or bold ≥18.7px). Never put `--gold` text on light backgrounds — use `--gold-ink`. Don't reintroduce gradient text (`.gold-text` is neutralised).
- Touch targets ≥ 44px. Inputs use 16px font on touch devices (prevents iOS zoom).


## Responsive behaviour — known traps (already hit, don't repeat)

- **Mobile menu ≤ 900px:** `#nav` becomes a full-screen fixed overlay. `backdrop-filter` (or `transform` / `filter`) on `#header` makes the header the containing block and squashes the menu into the header strip. On ≤ 900px the header blur is therefore disabled (`responsive.css` + `premium.css`). Keep it that way.
- **Preloader** is removed from the DOM after fading (`common.js`). An invisible fixed overlay once blocked every tap — never leave full-screen layers with `pointer-events` active.
- **3D services tower** runs only at `(min-width: 900px) and (min-height: 560px)`. This query exists in **three places** — `tower3d.js` (`desktop` matchMedia), `responsive.css`, `premium.css` — keep them in sync. Smaller screens show `.service-fallback` cards.
- **Phone overflow:** grid/flex children need `min-width: 0`; `.filters` must stay `flex-wrap: nowrap` (a wrapping column flexbox grew wider than the phone). Don't use `vw`-based negative margins for edge-to-edge scrollers.
- **≤ 820px:** floating WhatsApp/Call buttons are hidden and the **bottom dock** (`.m-dock`) is shown; `body` gets bottom padding for it. Respect `env(safe-area-inset-bottom)`.
- Desktop nav must fit between logo and right buttons from 901px up — re-check after adding nav items.

## Run & test

```bash
python -m http.server 8000      # open http://localhost:8000
node --check js/main.js         # syntax-check each JS file (Node is installed)
```
`file://` also works (all paths are relative).

Headless verification (Windows + Edge) used throughout this project:
```
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --allow-file-access-from-files --virtual-time-budget=12000 --dump-dom file:///<abs-path>/_test.html
```
Pattern: a throw-away `_test.html` loads `index.html` / `project.html?p=…` in iframes at many sizes
(320, 360, 375, 414, 600, 768, 900, 1024, 1366, 1440, 1920, 2560 + landscape 740×360, 844×390),
checks `scrollWidth > innerWidth`, JS errors, menu tappability (`elementFromPoint`), card counts and WCAG contrast,
writes results into a `<pre>`, and the dumped DOM is read back.
- Files starting with `_` are git-ignored; delete them when done.
- Runs longer than ~30 s hit the tool timeout → launch Edge with `Start-Process … -RedirectStandardOutput`, `Start-Sleep`, then read the file.

**Minimum checks before committing:** no JS errors · 20 project cards render · no horizontal scroll at 320 / 375 / 768 / 1440 · mobile menu opens full-screen and links are tappable · `project.html?p=godrej-woods` loads · an unknown slug shows "Project not found".

## Deploy

GitHub Pages from `main` / root (`.nojekyll` present).
```bash
git add -A
git commit -m "describe change"
git push origin main
```
Repo ≈ 77 MB (mostly PDF brochures, largest 12.3 MB). Keep single files < 50 MB (GitHub hard limit 100 MB).

## Content rules

- Keep the client's original text (About, services, testimonials). Already-fixed typos: "Residences", "Chhatarpur", "Home-in Realtors" → "Inn10 Infra".
- Copy written by us (hero headline, trust strip incl. "RERA-registered developers", section titles, project descriptions, disclaimer) **needs client approval** — flag it when you change it.
- **Never invent** prices, RERA numbers, possession dates or amenities — the data doesn't have them; route users to "Request Brochure" / Call.
- The footer disclaimer (images, brochures and map pins are indicative) must stay.

## Open items / ideas

- Exact map coordinates per project (currently approximate).
- Store enquiries (Google Sheets / Formspree) — forms only go to WhatsApp / e-mail today.
- Real-device check on iPhone Safari and Android Chrome.
- Optional: static per-project HTML pages for better SEO (currently one JS-rendered template).

