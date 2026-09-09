# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build
npm run lint     # ESLint
npm run start    # serve production build
```

No test suite. Verification is visual — drive the app and look at it.

## What this is

Portfolio v2 for Mikel Mrad. A **single, never-scrolling page**: one `100dvh`
bento grid where clicking a tab makes the current modules fly off to the four
edges while the next tab's modules fly in from the directions their new cells
imply. Inspired by alahmad.dev's modularity, but non-scrollable.

A phone gets the same site, not a reduced one: every module, its real content,
the same scatter. It runs on a portrait grid instead of a landscape one — see
**Two grids, one site** below.

## Stack

- **Next.js 16.2.3**, App Router, **React Compiler on** (`reactCompiler: true`).
  Verified compatible with Motion's layout engine — don't disable it casually.
- **React 19**, so avoid manual memoization the compiler already handles.
- **Tailwind v4** — tokens live in `@theme {}` inside `app/globals.css`. There is
  no `tailwind.config.*`.
- **Motion 12** (`motion/react`) drives the whole transition.
- **@react-three/fiber** for exactly one module (`components/three/signature.tsx`
  — a field of arrows that all turn to face the cursor, drawn as raw line
  segments to match the site's hairline weight). It listens for `pointermove` on
  **`window`**, not the canvas, so the field reacts while the cursor is anywhere
  on the page; each arrow eases toward its target, which is what drags a wave
  through the grid as you move.

  Two React Compiler constraints bite here: read `camera`/`pointer` off the
  `useFrame` state rather than `useThree()`, and keep per-frame mutable state
  (the easing angles) in a **ref** — the lint rules reject mutating anything a
  hook returned.

  **The canvas rect is measured every frame, on purpose.** Caching it on mount
  is wrong: the card enters under a scatter transform of up to ±1400px, so a
  rect read then is pinned to the entrance position — and a `ResizeObserver`
  never corrects it, because the card's *size* never changes, only its position.
  That offset made every arrow point the same wrong way.

## Architecture

The site is a data structure, not a set of pages.

1. **`lib/grid.ts`** — the two grids, the four tabs, and two placement maps of
   `TabId -> { ModuleId: Placement }`: `LAYOUTS` on the desktop 12x8 and
   `MOBILE_LAYOUTS` on the portrait 4x12. Each map tiles its grid completely, no
   gaps or overlaps, and **both hold the same module set per tab**. **Adding a
   tab means adding a key to both**, nothing else. Adding a *module* to a tab
   means placing it in both, and re-tiling the neighbours around it.

2. **`lib/scatter.ts`** — derives every card's flight from its grid cell.
   `flightVector(placement, flightGrid)` takes the cell's centre, snaps its angle
   to one of eight compass directions, and returns travel + rotation. The
   `FlightGrid` argument (`DESKTOP_FLIGHT` / `MOBILE_FLIGHT`) carries the grid's
   dimensions and how far a card has to travel to clear that viewport — a phone
   uses 560x900 where a desktop uses 1400x1000, because 1400px sideways on a
   393px screen reads as a whip-pan rather than a scatter. `rankByRadius()`
   orders modules by distance from centre: exits stagger outermost-first,
   entrances stagger centre-outward. Gather starts 200ms in, while scatter is
   still running — that overlap is what makes it read as one motion.

3. **`components/grid/stage.tsx`** — owns tab state, URL sync, keyboard, and the
   expanded-project state. Renders the grid.

4. **`lib/content.ts`** — every string on the site. Modules read from it;
   never hardcode copy in a component.

### The identity card is positioned in pixels, not by the grid

It is the one card that morphs between slots, and it is **absolutely positioned
with animated `left/top/width/height`** driven by motion values (`rectFor()` in
`lib/grid.ts` derives the rect from the measured grid).

This is deliberate and worth not "simplifying" back. Motion's `layout` prop
animates a **transform**: the element's real layout size jumps to its final value
on frame one and only *looks* like it is travelling. Container queries read
layout size, so the card's contents snapped to the new size instantly while the
box was still visually moving — the type shrank before the transition. Animating
the box for real keeps the container query, and therefore every `cqw`/`cqh` value
inside the card, in step with it.

It is the anchor on **both** grids — it is the one module whose placement is
read from measured pixels rather than handed to CSS grid, so it is also the one
module that breaks when the measurement is stale. Four traps if you touch this:

- The motion values must always hold a concrete number. Switching to
  `position: absolute` and letting the `animate` prop supply the box collapses
  the card to 0x0 on the first frame.
- Springs only when the *placement* changed; a resize must snap, or the card
  lags behind the window.
- **The ResizeObserver is attached through a ref callback (`attachGrid`), not an
  effect.** The grid's wrapper changes element type when the scaled view comes
  and goes — a plain `div` becomes a `PinchPan` — so React discards the grid's
  DOM node. An effect keyed on `[cols, rows]` does not re-run for that (a
  landscape phone resolves straight into the scaled view on the same 12x8), and
  the observer sits watching a detached node forever. That put the identity card
  at 264x132 in a slot 581x393.
- **The identity effect reads `geomRef`, not the `geom` state.** Switching grids
  changes the grid's size and the card's placement in the *same* commit, and
  state lands a render later — so `geom` there is the previous grid's cell size
  against the next grid's placement, a rect belonging to neither. Layout effects
  run in declaration order and refs are set before them, so the ref is already
  correct. `lastRect` then makes the follow-up render a no-op instead of a
  `set()` that stutters the spring it is chasing.

### Expandable sections

Two modules expand, on both grids, through the same mechanism — a synthetic
layout handed to `activeMap`, so the grid scatters and the expanded view gathers
in:

- **Projects** → `DETAIL_LAYOUT` / `MOBILE_DETAIL_LAYOUT`, driven by `open` (a
  project number).
- **Experience** → `zoomLayout(id)` / `mobileZoomLayout(id)`, driven by `zoom`.
  Membership is `ZOOMABLE` in `stage.tsx`; add an id there and give it an
  expanded render branch.

All four put the identity card at the top and the close/context chrome
(`DetailNav`, `ZoomNav`) opposite the expanded module. On a desktop that chrome
is a left-hand column; on a phone it is a bar along the bottom row. **Same
component either way** — `.chrome` in `globals.css` flips it, gated on the
card's height. `Esc` closes either.

`Experience` renders as a clickable card when handed `onOpen`, and
`ExperienceDetail` is the expanded view — full role write-ups plus per-role
stacks, which the card can only show as two clamped lines.

### Two things that look like special cases but aren't

- **An expanded project is just another layout** (`DETAIL_LAYOUT` in
  `stage.tsx`). Opening one reuses the identical engine rather than introducing
  a second interaction language.
- **A phone is just another grid.** `MOBILE_LAYOUTS` feeds the same `activeMap`,
  the same `ModuleCard`, the same `scatterVariants`. There is no mobile
  component, no mobile transition and no mobile content set.

One thing that *is* deliberate: **every card's key carries the grid and the
expansion state** (`` `${id}:${phoneGrid ? "m" : "d"}:${open ? "o" : zoom ? "z" : "l"}` ``).
A module present in both the outgoing and incoming layout would otherwise
persist and snap straight from one cell to the other while everything around it
flew — EXPERIENCE expanding into its own zoom, or any card when the desktop view
is toggled. Remounting turns that into a proper scatter and gather.

### Nothing renders until the viewport is known

`useViewportMode()` returns `{ mobile, short, resolved }`, and **no modules mount
until `resolved` is true**. This is not caution, it fixes a real defect: the
server can't know the viewport, so the SSR markup is always the desktop grid. On
a phone hydration doesn't beat the first paint, so the 12-column desktop layout
painted, reflowed, and landed on the portrait one — visibly.

Hiding the wrong layout behind `opacity: 0` is **not** sufficient, and was tried:
mounting the desktop set means AnimatePresence has to animate it back out when
`isMobile` flips, and that swap shows however it's masked. Rendering only once
the answer is in means the first set to mount is the correct one, and the intro
gather covers the wait.

Cost: the grid's markup isn't in the SSR HTML. `<head>` metadata still is, so
link previews are unaffected, and Googlebot executes JS.

### Two grids, one site

Below 767px (`MOBILE_Q` in `stage.tsx`) the grid becomes **4 columns x 12 rows**
instead of 12 x 8. That is the entire difference. Same modules, same components,
same content, same scatter — `MOBILE_LAYOUTS` is a second placement map, and
everything downstream of `activeMap` is shared.

Why 4 x 12: a phone is roughly 9:19 where a desktop is 16:9, so the grid turns on
its side. Twelve rows is granularity, not module count — on a 393x852 phone a row
is ~57px, so a module can take one row (a footer), two (a stat block), four (a
project card) or nine (an expanded project) without any of them being forced into
the wrong height. Cells come out ~86 x 57, so a 2x4 module is 180x251 and a 4x2 is
369x121.

Composition is per tab, not transposed. What works as a 5-wide band on a desktop
has to become either a full-width bar or a half-width block, so each tab is laid
out for the shape it is actually in — projects pair off 2x2, the stack becomes two
columns of spec sheets, the contact form takes five rows because its textarea
collapses to nothing at four.

**Both maps must hold the same module set for a tab.** There is a check worth
re-running after any edit: every map must tile its grid exactly (no holes, no
overlaps) and the two must agree per tab. A hole shows as a gap in the bento; a
module missing from `MOBILE_LAYOUTS` silently vanishes on phones.

Things worth knowing before changing it:
- **The identity card is the anchor on both grids.** It is lifted out of
  `entries` and pixel-positioned in either case — see the section above, and its
  two measurement traps.
- The scatter is not degenerate here the way a single column was: half the cards
  are half-width and fly diagonally. Full-width cards sit on the grid's
  horizontal centre and fly straight up or down, which is correct — they have no
  horizontal bias to derive.
- A tapped project expands to `ProjectDetail`, not `ProjectCard`.
- Long content inside an *expanded* section may scroll within that section. That
  is the one permitted scroll; the grid itself never scrolls. In `ProjectDetail`
  the **outer** element is the scroller on narrow screens and the reel takes a
  definite `cqh` height — making the copy `shrink-0` with its own
  `overflow-y-auto` does nothing, because it then sizes to its content and the
  module's `overflow: hidden` just clips it.
- Container queries inside a phone card see a **narrow but short** box where the
  desktop equivalent is narrow but tall. Gate optional content on `min-height`,
  not `min-width` — see the `.cq-h*` utilities under Layout rules.

### The desktop view is an escape hatch, and a fallback

A phone can also be shown the **real 12x8**, laid out at its full 1440x900 inside
`components/grid/pinch-pan.tsx` and scaled to fit, with drag to pan and pinch to
zoom. The nav dock carries the toggle (phone only, icon-only — the four tab
labels already take 267 of a 393px screen).

Be honest about what this mode is. Fit on a 393px phone is **0.27**, so a 9px
label lands at 2.4px: it shows you the composition, and you pinch in to read
anything. That is why the gestures are advertised in a chip on first view.

It is also not optional in one case. `SHORT_Q` (`max-height: 540px`) is a
landscape phone, where twelve rows would be ~18px each; there `scaled` is forced
and the toggle is hidden, because the portrait grid has no room to exist.

Two things that break if you touch it:
- **The scaled canvas paints its own `bg-bg grid-bg` and border.** Left to the
  `<main>` background, the hairline grid draws at full screen scale behind a 0.27
  page, which reads as broken rather than as a scaled-down desktop.
- **The WebGL canvas needs `resize={{ offsetSize: true }}`.** R3F measures with
  `getBoundingClientRect`, which is transform-aware, so inside the scaled stage
  the canvas sized itself to the *visual* box — a quarter size, tucked in the
  corner of its card. `offsetWidth/offsetHeight` are not. The per-frame pointer
  maths in `signature.tsx` still reads the rect, and still should: it normalises
  by rect width, so the ratio holds at any scale.

### Routing

Tabs are real static routes (`/`, `/work`, `/stack`, `/contact`) via an optional
catch-all with `generateStaticParams`, so links and hard reloads work. Client-side
switching uses `window.history.pushState`, so React never unmounts the grid and
the identity morph survives. The catch-all calls `notFound()` on unknown
segments — without that it answers 200 for missing static assets and they arrive
as HTML.

## Layout rules

- Nothing scrolls. `html, body { overflow: hidden }`. If content doesn't fit a
  cell, make the content smaller — do not add a scrollbar.
- **Use container queries, not viewport breakpoints**, inside modules. The same
  module is 5x4 on one tab and 3x2 on another; `@[420px]:` responds to the card,
  `md:` responds to the window and will be wrong.
- Every grid cell needs `minmax(0, 1fr)` and children need `min-h-0 / min-w-0`,
  or long content blows the row height out.
- **Cards are `container-type: size`, not `inline-size`.** ModuleCard sets
  `[container-type:size]` explicitly. This matters: Tailwind's `@container`
  utility only sets `inline-size`, under which **`cqh` units silently resolve
  against the viewport** instead of the card. Height caps then do nothing and
  type keeps growing as a card gets shorter until it collides with whatever is
  below it. If display type ever starts overlapping again, check this first.
- **Size display type against the card, not in fixed steps.** Every numeral and
  heading uses `clamp(min, min(Ncqw, Mcqh), max)` — capped on *both* axes. Fixed
  `text-5xl`-style steps respond to nothing and crunch in short windows.
- **`@[420px]:` variants are width-only.** For anything that needs room in both
  directions, write a real two-axis container query in `globals.css`. See
  `.role-blurb`, which hides experience blurbs when a card is too short for them.
- **Drop optional lines with the `.cq-h*` gates, don't let them clip.** The two
  grids put the same module in boxes of similar width and wildly different
  height — the CV card is 180x121 on a phone and ~290x340 on a desktop — so a
  width gate can't tell them apart. `.cq-h80`, `.cq-h100` and `.cq-h160` in
  `globals.css` show their content only above that container height. Gate the
  line the card can most afford to lose: STATS keeps its numerals and drops the
  captions, LATEST keeps its link and drops the subtitle, the CV card keeps
  DOWNLOAD and drops the contents list.
  They set `display: revert`, which for a bare `<span>` is `inline` — so on a
  non-flex parent, gate a wrapper `<div>` instead, or `truncate` and vertical
  margins silently stop working.
- **Centre with `safe center` where content can outgrow the card.** Plain
  `justify-center` overflows in *both* directions; EDUCATION's first school rode
  up over its own label on a 360px phone. `[justify-content:safe_center]` falls
  back to flex-start and clips off the bottom like everything else.
- **Nothing scrolls, on any screen** — no vertical scroll, no horizontal pan. The
  one exception is the desktop view's pan/pinch surface, which is a transform,
  not a scroller.

## Imagery rules

Project screenshots are 2160x1350 (landscape 16:10) and appear in two places,
with opposite jobs:

- **Project cards** use them as *backdrop texture*. They are blurred (`blur-[5px]`)
  and held at 22% opacity on purpose — at readable sharpness the screenshots'
  own headlines collide with the card's title and label ("VINYLIZED" landing on
  top of "our Music. Your"). The scrim is `bg-gradient-to-b from-card via-card/70
  to-card`: darkest at top and bottom where the label, title and chips sit.
  Hover sharpens to `blur-[1px]` / 45%.
- **The expanded detail** uses them as *the content*. `VerticalReel` shows each
  shot at full column width and natural aspect — never cropped — and scrolls the
  strip upward continuously via `@keyframes marquee-y`. The list renders twice so
  the -50% translate lands exactly one set on, making the loop seamless. Hover
  pauses; `motion-reduce` stops it. Speed is `--reel-speed` (~47px/s).

Never use `object-cover` on a screenshot in the detail view — that was the
original "half-cut image" problem.

## Design tokens (globals.css)

| Token | Value |
|---|---|
| `bg` | `#0a0a0a` |
| `fg` | `#f0f0f0` |
| `mid` | `#aaaaaa` |
| `dim` | `#666666` |
| `hairline` | `#1f1f1f` |
| `card` | `#0d0d0d` |
| `font-mono` | JetBrains Mono |
| `font-display` | Barlow Condensed |

### `Magnetic` must not stretch

`components/ui/magnetic.tsx` sets `width: fit-content` alongside its
`inline-block`. That is load-bearing: as a **flex item** the wrapper otherwise
stretches to the container's full width, putting its centre far from the content
it wraps. The offset is measured from that centre, so a left-aligned label
(the CV card's "DOWNLOAD ↓") shot sideways on hover. A definite width overrides
the stretch. Don't remove it, and don't paper over it with `self-start` at each
call site.

**The site is strictly monochrome.** There is no accent colour — white *glow*
plays that role (`shadow-glow-sm` / `shadow-glow` / `shadow-glow-lg`, plus
`GlowRule` and `LiveDot`). Do not introduce a hue.

## Assets

- `public/docs/Mikel-Mrad-CV.pdf` — the 2026 technical CV.
- `public/images/work/*.webp` — 4 screenshots per project.

## Content source of truth

`lib/content.ts` was reconciled from the 2026 technical CV, which supersedes the
v3 portfolio where they disagree: 2+ years (not 3+), and The Outlets is
*Co-Founder & Developer since 2022* (not a 2024 build).
