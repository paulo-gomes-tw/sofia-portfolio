# Sofia Ferraz — Brand & Art Direction Studio

A premium, editorial portfolio for **Sofia Ferraz**, an independent brand & art
director. Designed to feel like a boutique creative studio — generous whitespace,
oversized serif typography, a restrained warm palette, and quiet, intentional motion.

**Trilingual** (EN-US / PT-BR / ES-ES) and the **Work section is data-driven**,
populated from Sofia's Behance account.

> No bundler, no framework. Plain HTML/CSS/JS — but it does need to be served
> over `http://` (not opened as a `file://` path) so the project data loads.

---

## Running locally

```bash
git clone https://github.com/paulo-gomes-tw/sofia-portfolio.git
cd sofia-portfolio
git checkout claude/premium-agency-visual-design-01w1xt
```

Then serve the folder — any static server works:

```bash
python3 -m http.server 3000          # → http://localhost:3000
```

In VS Code, the **Live Server** extension (right-click `index.html` → *Open with
Live Server*) is the smoothest option.

> **Avoid `npx serve`** for this project: its clean-URL rewriting redirects
> `project.html?p=slug` → `/project` and **drops the query string**, which breaks
> project pages. `python3 -m http.server`, Live Server, and `http-server` are all fine.

There is **no build step** for the site itself. The only scripts are for syncing
Behance data (below).

---

## Design language

| Token | Value | Use |
| --- | --- | --- |
| Background | `#F8F7F4` | Primary canvas |
| Surface | `#FFFFFF` | Alternating sections, form, cards |
| Ink | `#181818` | Headlines & body |
| Muted | `#6B6B6B` | Secondary text |
| Border | `#ECEAE4` | Hairline dividers |
| Terracotta | `#C46B4B` | Primary accent |
| Olive | `#8C8A63` | Secondary accent |
| Gold | `#C8A96A` | Optional accent |

**Type** — Headlines in **Instrument Serif** (Cormorant Garamond / Georgia
fallbacks); body in **Inter**. A fluid scale drives the hero to ~96px and section
titles to ~64px on wide screens.

**Sections** — `Hero → About → Services → Selected Work → Philosophy → Kind Words → Contact → Footer`,
with backgrounds alternating subtly between the paper background and white.

---

## Languages

A switcher sits in the header (top right) offering **EN-US**, **PT-BR**, and **ES-ES**.
Switching re-renders the entire page — navigation, headings, body copy, service
tags, the marquee, form labels, project categories, `<title>`, and the meta
description — with no page reload.

- Copy lives in one place: `assets/js/i18n.js`
- Locale is resolved as: `?lang=pt-BR` → saved choice (`localStorage`) → browser
  language → `en-US`
- `<html lang>` updates so screen readers switch voice
- Add a language by adding one block to `DICT` and one `<li>` to the switcher in
  `index.html` / `project.html`

Markup hooks: `data-i18n` (text), `data-i18n-html` (curated strings with `<em>`),
`data-i18n-attr` (attributes), `data-i18n-list` (arrays → `<li>`),
`data-i18n-lines` (the masked hero headline).

---

## Work — synced from Behance

The Work grid and every project page read from **`assets/data/projects.json`**.
Nothing about the gallery is hardcoded in HTML.

```
assets/data/projects.json   ← canonical data (edit this / written by sync)
assets/data/projects.js     ← generated wrapper (do not edit)
```

### Why a sync script rather than calling Behance from the browser

This is a static site, so a browser-side API call would mean **shipping the API
key to every visitor**, and Behance does not send CORS headers for cross-origin
browser requests. Instead the fetch happens server-side, the normalised result is
committed, and the site reads that. Consequences: no exposed secrets, no CORS,
and the gallery still renders if Behance is down or rate-limiting.

### Running a sync

```bash
export BEHANCE_USER=her-handle          # the part after behance.net/
export BEHANCE_API_KEY=your-key         # or: export BEHANCE_TOKEN=oauth-token

npm run sync:behance:dry                # preview — fetches, writes nothing
npm run sync:behance -- --detail        # write projects.json (+ prose & gallery)
npm run build:data                      # regenerate the wrapper (sync does this too)
```

Flags: `--dry-run`, `--detail` (pull per-project modules for prose + gallery
images), `--limit=N`, `--locale=xx-XX` (which locale the Behance copy fills).

### Translations survive syncing

Behance stores **one language per project**. So sync writes the Behance copy into
the source locale (default `en-US`) and **preserves any `pt-BR` / `es-ES` blocks
you have written by hand** under each project's `i18n` key. Your editorial choices
for `featured` (full-width card), `placeholder`, and `meta` are preserved too.

### If the API is unavailable

Adobe closed public Behance API-key registration (around 2019–2020); keys are now
issued only to approved developer accounts. If you cannot get one, the data format
is the contract — anything that produces a valid `projects.json` works:

1. **Edit `assets/data/projects.json` by hand**, then `npm run build:data`. Fully
   supported; this is what the committed seed data does.
2. **Export from Behance** and map the fields into the same shape.
3. **Serverless proxy** — if you want live data, host a small function that holds
   the token and returns the same JSON, then point `DATA_URL` in
   `assets/js/projects.js` at it.

### Project pages

`project.html?p=<id>` renders a project from the same data: cover, meta sidebar
(client / year / role / services), prose with a drop cap, an optional image
gallery, a next-project link, and a CTA. Unknown ids get a graceful, localised
not-found state. `project.html#<id>` also works, as a fallback for hosts that
rewrite clean URLs.

---

## Craft & interactions

- Scroll reveals (fade + rise) with staggered groups, re-run for dynamic content
- Masked, cascading hero headline that rebuilds per language
- Subtle parallax on hero & about imagery
- Magnetic buttons and a blended custom cursor (fine-pointer only)
- Editorial hover states on the services list and work gallery
- Animated statistic counters; sticky header that condenses and hides on scroll
- Full-screen mobile menu

All motion is **opt-out**: `prefers-reduced-motion` disables animation, the custom
cursor, parallax, and the marquee.

## Accessibility

- Semantic landmarks, skip link, visible focus styles, AA-contrast palette
- Language switcher is a proper `listbox`: full keyboard support
  (`Enter`/`Space`/`Arrows`/`Home`/`End`/`Esc`), `aria-selected`, focus returned
  to the trigger on choose
- `<html lang>` tracks the active locale
- Content is authored in HTML and readable without JavaScript; the JS-rendered
  gallery degrades to a `<noscript>` message with direct links

## Imagery

Project covers use **art-directed CSS placeholders** (palette duotones + film
grain) whenever a project has no `cover.src`, so the page never shows a broken
image. A synced Behance cover — or any URL you put in `cover.src` — replaces the
placeholder automatically.

## Structure

```
index.html
project.html
package.json
assets/
  css/styles.css        # design system + all styles
  js/i18n.js            # locales & translation engine
  js/projects.js        # data layer + gallery/detail renderers
  js/main.js            # interactions
  data/projects.json    # canonical project data
  data/projects.js      # generated wrapper
  favicon.svg
scripts/
  sync-behance.mjs      # Behance API → projects.json
  build-data.mjs        # projects.json → projects.js
```

---

_Design & front-end for Sofia Ferraz Studio._
