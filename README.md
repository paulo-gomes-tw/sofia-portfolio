# Sofia Ferraz — Brand & Art Direction Studio

A premium, editorial single-page portfolio for **Sofia Ferraz**, an independent
brand & art director. Designed to feel like a boutique creative studio — generous
whitespace, oversized serif typography, a restrained warm palette, and quiet,
intentional motion.

> Built as a **self-contained static site**. No build step, no dependencies —
> open `index.html` in any modern browser and it just works.

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

**Type** — Headlines in **Instrument Serif** (with Cormorant Garamond / Georgia
fallbacks); body in **Inter**. Type is used large and confidently: a fluid scale
drives the hero to ~96px and section titles to ~64px on wide screens.

## Sections

`Hero → About → Services → Selected Work → Philosophy → Kind Words → Contact → Footer`

Backgrounds alternate subtly between the paper background and white to keep each
section visually distinct while staying cohesive.

## Craft & interactions

- Scroll-reveal (fade + rise) with staggered groups, via `IntersectionObserver`
- Masked, cascading hero headline reveal
- Subtle parallax on hero & about imagery
- Magnetic primary buttons and a blended custom cursor (fine-pointer only)
- Editorial hover states on the services list and work gallery
- Animated statistic counters
- Sticky header that condenses on scroll and hides on scroll-down
- Full-screen mobile menu

All motion is **opt-out**: `prefers-reduced-motion` disables animation, the
custom cursor, parallax, and marquee, and everything renders immediately.

## Accessibility

- Semantic landmarks, a skip link, and visible focus styles
- AA-contrast palette, ARIA labels on icon-only controls
- Keyboard-operable navigation, menu (`Esc` to close), and focus moved to the
  target on in-page navigation
- Content is authored in the HTML — the site is fully readable with JavaScript
  disabled (JS only enhances)

## Imagery

The image blocks are rendered as **art-directed CSS/SVG placeholders** (palette
duotones + film grain) so the site is fully self-contained and never shows a
broken image. To use real photography, replace a `.media--*` block with an
`<img>` and remove the corresponding gradient rule in `assets/css/styles.css`.

## Structure

```
index.html
assets/
  css/styles.css     # design system + all styles
  js/main.js         # interactions (no dependencies)
  favicon.svg
```

## Running locally

Just open the file:

```bash
open index.html          # macOS
# or serve it
python3 -m http.server 8000   # then visit http://localhost:8000
```

---

_Design & front-end for Sofia Ferraz Studio._
