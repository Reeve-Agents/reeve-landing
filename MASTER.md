# Reeve landing: design system (MASTER)

Single source of truth for `apps/landing`. Every colour, size, radius and timing in the code comes
from `src/styles/tokens.css`, which mirrors this file. Change a value here first, then in the tokens.

## Theses (validated 18 Oct 2026)

**Visual thesis.** A night-shift control room for a small business, preserving the deck's palette
and fonts. The canvas is void black, lit only by one drifting volt → deep teal → ink grain gradient.
Lime `#C6FF33` marks proven states only; violet `#7D39EB` marks the Auditor only. Three faces for
three actors: Inter Tight 800 for Reeve, JetBrains Mono for the agents' logs and labels, one
Instrument Serif italic phrase per headline for the owner's voice. Airy 8px spacing. Each section is
one full-screen scene built around a single hero object; in the hero that object is the product
itself, the real Kos Melati SOP becoming a running operation. Captions take at most 35%. Components
are flat and sharp: 2px radius, 1px hairlines, solid ink fills, no drop shadows, no glass.

**Interaction thesis.** Measured, film-cut motion. Elements arrive by moving: 330ms on
`cubic-bezier(0.16, 1, 0.3, 1)` from 1.06× and a short offset, staggered 60ms; they leave in 220ms on
`cubic-bezier(0.7, 0, 0.84, 0)`. The hero is a connected flow: six product panels on a tilted
stage joined by a thread that lights step by step while a camera travels between them (900ms,
ease-in-out, the one move between two resting states). The loop opens on a wide shot of the whole
flow, dives into each step, and pulls back out once the kos is live (~20 s). The rail under the
stage jumps to any step and a button pauses it; the stage leans up to 2° toward the pointer.
Headlines rise line by line out of a mask (700ms). The page scrolls smoothly (ScrollSmoother) and
scroll scrubs the pinned scenes.
Numbers roll in over 900ms. Buttons pull up to 8px toward the pointer. Forbidden: growing from zero,
overshoot over 4%, bounce, parallax on running text, custom cursors.

**Allowed patterns.** The real product UI as the hero (chat, rule cards, terminal log, passkey
phone) built with real run data · mono eyebrow labels and 1px hairline rules · film grain and the
gradient as the light source · looping ambient motion that reports a state (the hero run, the
gradient drift, Hairline figures in `play`) · step numerals 01–06 (a real sequence) · live numbers
from the real CreateOS run · the blurred-to-sharp R in the closing scene · a flow-editor dot grid
behind the live-run node graph (the n8n idiom the owner already knows) · device frames for the
PWA phones in the mobile scene · the second live run (Minimarket Berkah): a 24-tile shelf and the
expiring-stock line replayed day by day from the real run's events, scrubbable, with a pause button ·
the model band: parsers wired into one Auditor node, status chips that claim only what was verified
(lime only for "same 8 cards · Auditor PASS").

**Feedback folded in.** Hero v1 (blurred R) rejected: the audience could not tell what Reeve is.
Hero v2 approved as an idea, then asked to be more commercial, professional and tidy, using the
UI resources given (Hairline figures as the icon system, React Bits for motion). A tabbed product
window was tried and rejected: the flow line between steps is what makes the hero read. Final:
the v2 flow, with v3's product-quality panels and Hairline icons.

## Dials

| Dial | Value | From |
|---|---|---|
| variance | 7 | "a single hero object… on a tilted stage", asymmetric scene layouts |
| motion | 8 | "the hero plays the run as a loop… scroll scrubs the pinned scenes" |
| density | 3 | "airy 8px spacing", "captions take at most 35%" |

Dataset proposal (ui-ux-pro-max): kept the Operations-landing section order (live product hero,
key metrics, how it works, CTA in nav and after metrics), the expo-out arrive curve and the 0.97
press scale. Dropped its purple/pink palette, Calistoga/Inter pairing (thesis faces win),
glassmorphism and ambient blobs (forbidden by the thesis).

## Colour

| Token | Hex | Role | On `#000` |
|---|---|---|---|
| `--void` | `#000000` | page canvas | |
| `--ink` | `#001F3F` | panels, cards | |
| `--ink-2` | `#012A52` | raised panel, chat bubble | |
| `--term` | `#00101F` | terminal ground | |
| `--ink-signal` | `#183A3D` | signal 12% over ink: active rows (figure plates match it) | |
| `--deep` | `#00545F` | gradient mid | |
| `--paper` | `#F6F7ED` | text | 19.4:1 |
| `--text-2` | paper 72% | secondary text | 9.8:1 |
| `--text-3` | paper 50% | captions, labels | 5.0:1 (4.7:1 on ink) |
| `--signal` | `#C6FF33` | proven state, primary CTA | 17.8:1 |
| `--volt` | `#D6FB00` | gradient light, CTA hover | 17.7:1 |
| `--spring` | `#DBE64C` | late-fee mark | |
| `--mint` | `#ECFFB6` | gradient highlight | |
| `--auditor` | `#7D39EB` | Auditor shapes, borders | 3.7:1 (shapes only) |
| `--auditor-text` | `#B48CFF` | Auditor labels | 8.1:1 |
| `--trust` | `#1E488F` | receipt shapes | 2.4:1 (shapes only) |
| `--trust-text` | `#7FA8FF` | receipt labels, hashes | 8.9:1 |
| `--green` / `--mantis` | `#00804C` / `#74C365` | green mode | mantis 9.7:1 |
| `--danger` | `#FF8A8A` | exit notice, broken lane | 9.3:1 |
| `--line` / `--line-2` | paper 12% / 22% | hairlines | |

Lime on void text: `#000` on `#C6FF33` = 17.8:1 for the primary button.

## Type

Faces (Google Fonts, `display=swap`):
- **Inter Tight** 500/600/800: Reeve's voice. Fallback `"Helvetica Neue", Arial, sans-serif`.
- **Instrument Serif** italic: the owner's voice, one phrase per headline. Fallback `Georgia, serif`.
- **JetBrains Mono** 400/600: the agents' voice, logs, hashes, labels. Fallback `ui-monospace, Menlo, monospace`.

| Step | Size | Line | Tracking | Weight |
|---|---|---|---|---|
| `--fs-mega` | clamp(120px, 26vw, 400px) | 0.8 | -0.06em | 800 |
| `--fs-h1` | clamp(40px, 5vw, 72px) | 0.98 | -0.04em | 800 |
| `--fs-h2` | clamp(34px, 4.2vw, 60px) | 1.0 | -0.035em | 800 |
| `--fs-h3` | 22px | 1.2 | -0.01em | 600 |
| `--fs-lede` | 19px | 1.5 | 0 | 400 |
| `--fs-body` | 16px | 1.55 | 0 | 400 |
| `--fs-small` | 14px | 1.5 | 0 | 400 |
| `--fs-label` | 12px mono | 1.4 | 0.14em, uppercase | 600 |
| `--fs-data` | 13px mono | 1.6 | 0 | 400 |

Mono stops at labels, logs, hashes and tabular figures.

## Space, radius, layout

8px base: `--sp-1` 4 · `--sp-2` 8 · `--sp-3` 12 · `--sp-4` 16 · `--sp-5` 24 · `--sp-6` 32 · `--sp-7` 48 ·
`--sp-8` 64 · `--sp-9` 96 · `--sp-10` 128. Radius `--r` 2px everywhere; the phone frame (a device
drawing) is the one exception at 28px. Container 1280px, gutter `clamp(16px, 4vw, 48px)`.
Each scene is ≥ 100vh on desktop, with the visual taking ≥ 65% of its area.

## Motion tokens

| Token | Value | Use |
|---|---|---|
| `--t-micro` | 150ms | hover, focus, press |
| `--t-arrive` | 330ms | element entry |
| `--t-leave` | 220ms | element exit |
| `--t-camera` | 900ms | hero camera between steps |
| `--t-headline` | 700ms | headline lines rising out of a mask |
| `--t-roll` | 900ms | number roll |
| `--stagger` | 60ms | sibling offset |
| `--ease-arrive` | cubic-bezier(0.16, 1, 0.3, 1) | GSAP `"arrive"` |
| `--ease-leave` | cubic-bezier(0.7, 0, 0.84, 0) | GSAP `"leave"` |
| `--ease-camera` | cubic-bezier(0.65, 0, 0.35, 1) | GSAP `"camera"`: moves between two rests |

Arrive from `scale: 1.06, y: 24`; leave to `scale: 0.98, y: -12, opacity: 0`. Scroll-scrubbed
tweens use `ease: "none"` with `scrub: 1`. Springs (Magnet) are damped to ~1% overshoot
(stiffness 170, damping 22). Under `prefers-reduced-motion`: no autoplay, no scrub, no pins; every
scene renders its final state.

## Resources in use

- **Hairline** (`@lucasmarkes/hairline`): every icon and scene figure, via `<Figure>`.
- **React Bits** (shadcn registry `@react-bits`): `Noise` (hero grain), `Magnet` (CTAs),
  `SplitText` (closing headline).
- **GSAP**: ScrollTrigger, ScrollSmoother, SplitText, CustomEase.
- Dropped: React Bits `FaultyTerminal` with the terminal-style glass box (owners found a terminal
  confusing; replaced by the node-graph live run), and `Grainient` (rendered grey in WebGL here; replaced by a CSS
  gradient of the same palette) and `Counter` (odometer digits garbled when throttled; replaced
  by `RollNumber`).

## Mobile

Owners of small businesses mostly work from a phone, so every scene is designed at 375px first:
the hero camera zooms to one panel at a time, the live-run graph turns into a column (tools on
top, the work below), and the mobile scene shows the owner app as a PWA (installed from the
browser, no app store). The landing itself ships a web manifest and icon so it can be installed.

## Components

- **Button** (`.btn`): 2px radius, 14/600 Inter Tight, 14×20px padding. Primary: void on signal;
  hover volt; active `scale(0.97)`; focus 2px signal outline offset 3px; disabled 40% opacity.
  Ghost: paper text, `--line-2` border, hover paper 6% fill.
- **Chip** (`.chip`): 12px mono label in a 1px hairline box. Auditor chips use `--auditor` border
  and `--auditor-text`.
- **Panel** (`.panel`): ink fill, 1px `--line` border, 2px radius, no shadow.
- **Figure** (`<Figure>`): Hairline figure in a 5:4 box; `--hairline-plate` set to the surface it
  sits on, `--hairline-hi` signal (Auditor figures: auditor-text).

## Figure map (Hairline as the icon system)

| Idea | Figure |
|---|---|
| Describe (owner writes) | `Keyboard` |
| Compile (rules → code) | `Format` |
| Simulate (sandbox run) | `Terminal` |
| Audit (tests filter bugs) | `Sieve` |
| Approve (passkey) | `Padlock` |
| Run (operations live) | `Hub` |
| Problem: agent wants the bank login | (illustration, no figure) |
| Builder | `Branches` · Auditor `Loupe` · Owner `Phone` |
| Agent → money, never connected | `Plug` |
| Maker-checker lane | `Relay` |
| LLM sees schema only | `Drawer` · sandbox `Cabinet` · keys `Vault` |
| Receipts · Merkle tree | `Stack` · `Settle` |
| Green meters | `Plot` |
| Live run inputs: owner chat · tenant list · payments · daily clock | `Phone` · `Drawer` · `Vault` · `Slow` |
| Model band: the one Auditor every parser feeds | `Loupe` (auditor tone) |
| Live run outputs: tenant messages · invoices and fees · room status · owner alerts | `Dish` · `Riffle` · `Lockers` · `Query` |
