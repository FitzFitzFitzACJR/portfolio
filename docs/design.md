# Design system

## Colors

Colors are semantic tokens defined as CSS variables in `frontend/src/index.css` (one set for light,
one for `.dark`) and exposed to Tailwind in `frontend/tailwind.config.js` (`bg-surface`, `text-muted`,
`text-accent`, …). Components never use raw grays or pinks, so both themes stay consistent.

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#faf8f9` | `#121014` | page background |
| `surface` | `#ffffff` | `#1b181d` | cards, panels |
| `surface-2` | `#f4eff1` | `#26212a` | chips, subtle fills |
| `fg` | `#1a1418` | `#f4eff2` | body text |
| `muted` | `#4a4046` | `#cfc6cc` | secondary text |
| `subtle` | `#5f555b` | `#aaa0a7` | meta text |
| `line` | `#e7dde2` | `#342e38` | decorative borders |
| `field` | `#8c8088` | `#7a6f7d` | form control borders |
| `accent` | `#9b3a5a` | `#f4a3c0` | links, accent text, focus ring |
| `accent-bg` | `#b0406a` | `#b0406a` | filled buttons (white text) |
| `accent-soft` | `#fbe8ef` | `#3a2130` | badges |
| `hero-from` / `hero-to` | `#8c2f52` / `#5e1f38` | `#3d1a2b` / `#1b0f16` | hero gradient (white text) |
| `brand` | `#f7b4c6` | same | original pink, decorative only (never behind text) |

### What changed from the old palette

The old theme put white text on `primary-600 #d56c8b` (**3.3:1**, fails AA) and used light pinks for body
text. The brand pink `#f7b4c6` is kept as a decorative glow; text and buttons now use deeper
raspberry tones of the same hue.

### Contrast (WCAG 2.1 AA: 4.5:1 text, 3:1 large text and UI components)

Lowest ratios per pairing, measured for both themes:

| Pair | Light | Dark |
|---|---|---|
| `fg` on `surface-2` | 15.96 | 13.86 |
| `muted` on `surface-2` | 8.74 | 9.45 |
| `subtle` on `surface-2` | 6.29 | 6.22 |
| `accent` on `accent-soft` (badges) | 5.69 | 7.53 |
| `accent` on `surface-2` | 5.87 | 8.13 |
| white on `accent-bg` (buttons) | 5.54 | 5.54 |
| white on `accent-bg` at hover (`brightness-90`) | 6.51 | 6.51 |
| white on `hero-from` | 7.94 | 15.21 |
| white/85 on `hero-from` | 6.02 | (higher) |
| `field` border on `surface` (non-text, 3:1) | 3.78 | 3.68 |
| `red-700` / `red-300` error text on `surface` | 6.47 | 9.26 |

If you change a token, re-check its pairings (any WCAG contrast checker works).

## Typography

- Headings: **Space Grotesk** (variable), body: **Inter** (variable), self-hosted via `@fontsource-variable/*`
  (bundled by Vite, `font-display: swap`, no third-party requests).

## Motion

- Sections fade/slide in on scroll (`<Reveal>`, CSS in `index.css`). Disabled under
  `prefers-reduced-motion`, and content is never hidden when JavaScript is off.
- Smooth anchor scrolling, also disabled under reduced motion.

## Theme

- Class strategy (`.dark` on `<html>`). An inline script in `index.html` applies the saved choice
  (`localStorage.theme`) or the OS preference before first paint, so there's no flash.
- The navbar toggle saves the choice; until then the site follows OS changes live.
