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

1. **`lib/grid.ts`** — the 12x8 grid, the four tabs, and `LAYOUTS`: a map of
   `TabId -> { ModuleId: Placement }`. Each tab's map tiles the grid completely,
   no gaps or overlaps. **Adding a tab means adding a key here**, nothing else.

2. **`lib/scatter.ts`** — derives every card's flight from its grid cell.
   `flightVector()` takes the cell's centre, snaps its angle to one of eight
   compass directions, and returns travel + rotation. `rankByRadius()` orders
   modules by distance from centre: exits stagger outermost-first, entrances
   stagger centre-outward. Gather starts 200ms in, while scatter is still
   running — that overlap is what makes it read as one motion.

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

Two traps if you touch this:
- The motion values must always hold a concrete number. Switching to
  `position: absolute` and letting the `animate` prop supply the box collapses
  the card to 0x0 on the first frame.
- Springs only when the *placement* changed; a resize must snap, or the card
  lags behind the window.

### Expandable sections

Two modules expand on desktop, both through the same mechanism — a synthetic
layout handed to `activeMap`, so the grid scatters and the expanded view gathers
in:

- **Projects** → `DETAIL_LAYOUT`, driven by `open` (a project number).
- **Experience** → `ZOOM_LAYOUT`, driven by `zoom`. Membership is
  `DESKTOP_ZOOMABLE` in `stage.tsx`; add an id there and give it an expanded
  render branch.

Both put the identity card top-left and a close/context column beneath it
(`DetailNav`, `ZoomNav`). `Esc` closes either.

`Experience` renders as a clickable card when handed `onOpen`, and
`ExperienceDetail` is the expanded view — full role write-ups plus per-role
stacks, which the card can only show as two clamped lines.

### Two things that look like special cases but aren't

- **The identity card persists** because modules are keyed by `ModuleId` alone.
  Any module present in both the outgoing and incoming layout is never unmounted,
  so Motion's `layout` morphs it between cells instead of scattering it. That
  behaviour falls out of the keying — it isn't special-cased.
- **An expanded project is just another layout** (`DETAIL_LAYOUT` in
  `stage.tsx`). Opening one reuses the identical engine rather than introducing
  a second interaction language.

### Nothing renders until the viewport is known

`useViewportMode()` returns `{ mobile, resolved }`, and **no modules mount until
`resolved` is true**. This is not caution, it fixes a real defect: the server
can't know the viewport, so the SSR markup is always the desktop grid. On a
phone hydration doesn't beat the first paint, so the 12-column desktop layout
painted, reflowed, and landed on the mobile stack — visibly.

Hiding the wrong layout behind `opacity: 0` is **not** sufficient, and was tried:
mounting the desktop set means AnimatePresence has to animate it back out when
`isMobile` flips, and that swap shows however it's masked. Rendering only once
the answer is in means the first set to mount is the correct one, and the intro
gather covers the wait.

Cost: the grid's markup isn't in the SSR HTML. `<head>` metadata still is, so
link previews are unaffected, and Googlebot executes JS. Verified under 6x CPU
throttle at 360px: 0 modules at +100ms, then 4 full-width rows — the desktop
layout is never visible at any frame.

### Mobile is the same engine on a different grid

Below 767px (`MOBILE_Q` in `stage.tsx`) the grid becomes **one column, one row
per section**. Tapping an expandable row hands it the whole grid — mechanically
identical to expanding a project on desktop — so the rows scatter out and the
section gathers in.

`components/modules/tile.tsx` owns mobile entirely. `MOBILE_ORDER` is the
explicit membership and order per tab; anything not listed **does not exist on
mobile**. `TILE_SPEC` gives each row one of three behaviours:

| behaviour | when | example |
|---|---|---|
| `action: "expand"` | expanding reveals genuinely more | EXPERIENCE, projects, stack categories, the form |
| `action: { href }` | the row is just a destination | CV (opens the PDF), email (mailto) |
| no `action` | the whole content fits on the row, shown via `detail` | identity, stats, BEIRUT, DATABASES (2 entries) |

**A row must never expand into a restatement of its own title.** That was the
first cut's mistake — STATUS expanded to the word "OPEN", the WebGL surface
expanded to a decoration carrying no information, and "MOST RECENT" duplicated
the WORK tab. They were dropped or folded into `detail` instead.

### Mobile transitions are a push/pop, not the scatter

The scatter engine degenerates at one column — every cell shares the grid's
horizontal centre, so `dx` is 0 and every row flies straight up or down 1000px,
tilted 3°. On full-width bars that reads as cheap. Mobile uses `slideVariants`
instead: rows leave one way, the next screen arrives from the other, ordered top
to bottom, **no rotation and no scaling**.

Three things here are load-bearing:
- `slideVariants` **must reset `y`, `rotate` and `scale`**, not just animate `x`.
  The first paint renders desktop (before `isMobile` resolves), so a row can be
  mid-scatter when the variants swap; anything slide doesn't reset stays frozen
  forever. This shipped as a row stuck permanently at `y: 1000px`.
- Direction lives in `slideDirection.current`, a module-level value read when a
  variant resolves — **not** in `custom`. An exiting child keeps the props from
  its last render, which still holds the previous direction, so "back" would
  slide out the same way as "forward". AnimatePresence's `custom` override would
  also work but replaces the whole object, losing each child's stagger rank.
- The mobile `key` carries the zoom state. Expanding a row that's already on
  screen would otherwise keep it mounted and snap it from 184px to full screen.

Consequences worth knowing before changing it:
- **The identity card is not an anchor on mobile.** It's an ordinary tile inside
  AnimatePresence. The pixel-positioned morphing card is desktop-only and guarded
  by `!isMobile` — without that guard it renders *in addition to* its tile.
- A tapped project tile expands to `ProjectDetail`, not `ProjectCard`.
- Long content inside an *expanded* section may scroll within that section. That
  is the one permitted scroll; the tile stack itself never scrolls. In
  `ProjectDetail` the **outer** element is the scroller on narrow screens and the
  reel takes a definite `cqh` height — making the copy `shrink-0` with its own
  `overflow-y-auto` does nothing, because it then sizes to its content and the
  module's `overflow: hidden` just clips it.
- The close control is a **bar**, and the grid adds top padding when zoomed to
  reserve its height. As a floating button it sat on top of each expanded
  section's own header.
- Container queries inside an expanded section see a **narrow but tall** box
  (~366px x ~740px on a phone). Gate optional content on `min-height`, not
  `min-width` — a 420px width gate hid the experience blurbs on every phone.
- Adding a module means adding it to `MOBILE_ORDER` **and** `TILE_SPEC`, or it
  won't appear on mobile at all.

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
- **Nothing scrolls, on any screen** — no vertical scroll, no horizontal pan.

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
