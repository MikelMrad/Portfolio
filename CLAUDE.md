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

Portfolio v2 for Mikel Mrad, written to **sell freelance work** (online stores,
websites and apps for businesses in Lebanon and the Gulf), not to read as a CV.
A **single, never-scrolling page**: one `100dvh`
bento grid where clicking a tab makes the current modules fly off to the four
edges while the next tab's modules fly in from the directions their new cells
imply. Inspired by alahmad.dev's modularity, but non-scrollable.

Eight sections across four tabs, in reading order: INDEX (hero with the proof
strip, four services), WORK (projects, testimonials once one is approved),
ABOUT (how I work, experience, stack, education), CONTACT (contact card, FAQ).
Keys 1-4 and ←/→ switch tabs. `/stack` redirects to `/about` (next.config.ts).

**Two sites from one codebase**, picked by hostname — see **Two variants**
below: this business site on mikelmrad.dev, and an engineering portfolio for
companies and recruiters on portfolio.mikelmrad.dev.

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
- No WebGL and no form SDK any more: the 3D arrows card and the EmailJS
  contact form were removed when the site was rewritten to sell (the phone
  grid had no room for the card, and CONTACT is WhatsApp / email buttons now).
  Both are in git history (`components/three/signature.tsx`,
  `ContactForm` in `contact-modules.tsx`).

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
   never hardcode copy in a component. **No em or en dashes in anything a
   visitor reads** (copy, titles, metadata, alt text): use a comma, period,
   colon or middle dot. Date ranges go through `UI.range(from, to)`.

5. **`lib/config.ts`** — contact constants: WhatsApp number, email, Cal.com
   URL, links. `whatsappUrl(text)` builds the wa.me link with the language's
   prefilled message (`UI.whatsapp.message`); `has(url)` is false for an empty
   string, and **a button whose URL is empty does not render** (BOOK A FREE CALL
   stays hidden until `calcom` is filled in).

6. **`lib/testimonials.ts`** — name, business, logo and `approved` per
   testimonial; quote and role are copy, in the content files under the same
   id. Only approved entries render, and **with none approved WORK uses a
   layout without the card** (`HAS_TESTIMONIALS` picks between `WORK` and
   `WORK_TESTIMONIALS` in `lib/grid.ts`, at build time, so the boot drawing
   matches). Both variants must tile; re-run the tiling check after editing
   either.

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
  effect.** If React ever discards the grid's DOM node — it did when a scaled
  desktop view (since removed) swapped the grid's wrapper element — an effect
  keyed on `[cols, rows]` does not re-run, and the observer sits watching a
  detached node forever. That put the identity card at 264x132 in a slot
  581x393.
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
- **Any other module** → `zoomLayout(id)` / `mobileZoomLayout(id)`, driven by
  `zoom`. The services, HOW I WORK, EXPERIENCE and STACK open it from their
  own card (on a phone they show only their headline, so the tap is how the
  detail is read); every module opens it from its compact face (below). A
  module with a dedicated expanded view renders it when `zoom === id`:
  `ExperienceDetail`, and a service drops its button shell to show its
  WhatsApp call to action. Give one to any module that looks empty blown up to
  the whole grid; the rest render as-is.

**Compact faces.** A card swapped into a cell under 80% of its composed size on
either axis (`isCramped()` in `stage.tsx`) shows only its title and EXPAND
(`CompactCard`, titles in `MODULE_TITLES`) rather than being crushed; tapping
it expands it. `ALWAYS_FITS` exempts the size-agnostic ones.

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
flew — EXPERIENCE expanding into its own zoom, or any card when the device
rotates between grids. Remounting turns that into a proper scatter and gather.

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

Cost: the grid's markup isn't in the SSR HTML, so there is a window where the
page is empty by design. That window is what the boot layer fills — see The
first load. `<head>` metadata still is server-rendered, so link previews are
unaffected, and Googlebot executes JS.

### The first load

Two pieces, and they solve different halves of the same problem.

**Nothing heavy is in the critical path.** The page once shipped ~473KB gzipped
of JS before the first pixel, mostly three.js and the EmailJS SDK. Both are gone
now. Weigh any new dependency of that size carefully, and lazy-load it
(`next/dynamic` / `await import()`) if it's only needed on one tab: the grid
can't paint until the bundle has.

**The boot layer covers what's left.** `components/grid/grid-boot.tsx` draws
*this tab's* bento as a line — one SVG rectangle per module in the layout the
route is about to render, stroked on centre-outward like a plan being drawn.
When the last line closes, the modules mount inside the boxes that were just
drawn for them and fade up in place (`reveal` in `lib/scatter.ts`), and the
drawing hands its outline to their real borders. Five things are load-bearing:

- **It is a server component with no JavaScript.** Its whole job is the frames
  *before* React exists, so the drawing is CSS keyframes (`.boot` in
  `globals.css`). JS only sets `data-booted` on `<html>`, which is the handoff.
- **It renders in `page.tsx`, not `layout.tsx`.** The layout also wraps
  `not-found`, which never mounts a Stage — nothing would set `data-booted`
  there and the drawing would sit on top of the 404 forever.
- **The modules are gated on it, not hidden behind it.** A line drawing has no
  fill, so a module that mounted early would show through its own outline.
  `resolved && booted` is the mount condition.
- **`.boot` restates the stage's grid geometry** — same padding, gaps and
  12x8 / 4x12 templates — and each box is placed with `gridStyle()`, the helper
  the real cards use. Change the grid container in `stage.tsx` and you must
  change `.boot` too. Both maps are in the markup and CSS picks, because the
  server can't know the viewport.
- **An `<svg>` grid item needs an explicit `width/height: 100%`.** It is a
  replaced element, so it takes its default 300x150 and ignores the cell it was
  placed in — every box the same size, in the wrong place.

**The drawing is paced by the load, not by a clock.** `--boot-draw` and
`STAGGER_MS` are deliberately slow — a seven-module tab runs ~2.6s — so that a
phone is still drawing when its JS lands. The moment the app is ready the stage
raises the animations' `playbackRate` to cover whatever is left in
`BOOT_FINISH_MS`, and hands over `BOOT_OVERLAP_MS` *before* the last line
closes, so the modules are rising inside the boxes as they finish. `BOOT_MIN_MS`
is the other end: a warm desktop resolves in a few hundred ms, and snapping the
drawing shut that fast reads as a flicker.

Three consequences worth keeping:

- **Don't replace the pacing with a duration constant.** The drawing is as long
  as the tab's layout has modules, and CSS animations start at first paint while
  `performance.now()` counts from navigation. A constant cuts a line off
  mid-stroke on one load and leaves a finished, empty wireframe on the next —
  which is exactly the complaint this design exists to answer.
- **The intro reveal is not the gather.** `revealDelay()` drops `ENTER_OFFSET`
  and tightens the stagger, because there is no scatter to overlap with and
  every frame of it is a frame spent looking at an empty outline.
- **The handoff is a timer, not `animation.finished`.** It has to fire before
  the drawing ends, and a tab loaded in the background throttles its animations
  — the content must not be held back with them.

Measured on a warm load: first paint 104ms, content starts rising 621ms, last
line closes 774ms, everything settled 966ms.

### Two grids, one site

On a portrait screen (`PORTRAIT_Q` in `stage.tsx`) the grid becomes **4 columns
x 12 rows** instead of 12 x 8. That is the entire difference.

**The grid is chosen by shape, the touch features by input — two questions.**
`PORTRAIT_Q` is any screen taller than 5:4 (phones *and tablets* held upright,
at any width) plus a narrow window that isn't landscape-phone short. Everything
else — desktops, tablets on their side, **landscape phones** — gets the 12x8 at
real size, with everything live. `TOUCH_Q` (`pointer: coarse`) separately turns
on shake-to-reset, the tour's shake step and its tap-worded captions, so those
work in landscape and on tablets too. `.boot` in `globals.css` restates
`PORTRAIT_Q`; change both together.

Rotating mid-session switches grids: the cards' keys carry the grid, so they
scatter and gather (the stage runs `beginTransition()` on the change), the
identity card morphs, and a tour that was playing restarts on the new layout. Same modules, same components,
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
out for the shape it is actually in — the hero takes six rows on a phone and
the services pair off 2x2 under it, projects pair off 2x2, the FAQ takes five
rows and scrolls inside itself (`data-no-drag`) on a short phone.

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

### There is no scaled desktop view

A portrait phone used to be able to toggle a pinch-and-pan view of the real
12x8 scaled to fit (~0.27 on a 393px phone). It was removed: landscape already
gives the real desktop grid at real size, with everything live, and the dock's
bottom-right slot went to the theme toggle. It is in git history
(`components/grid/pinch-pan.tsx`) if it is ever wanted back.

### Throwable cards

Every card except the identity anchor can be picked up (`ModuleCard`, plumbing
in `components/grid/throw.ts`). Drop it on another card and the two swap cells;
release it fast (`FLING_SPEED`) and it is thrown off-screen, comes back, and its
landing sends a shockwave through the other cards. `RESET GRID` in the dock
appears once a tab has been rearranged.

- **Swaps are placements, not transforms.** `swaps[layoutKey]` in `stage.tsx`
  overrides the tab's map and `activeMap` reads through it, so a swapped card
  also *scatters* from its new cell. Session only, on purpose: the boot drawing
  is server-rendered from the untouched maps.
- **The slide is a FLIP.** The stage records visual centres into `flipFrom`
  *before* committing the new placement; the card's layout effect reads its
  entry after and slides from there. Only record cards whose placement will
  actually change — an unused entry fires on some later re-layout.
- **`x`/`y`/`scale`/`rotate` are the card's own motion values**, passed through
  `style`, so the scatter variants, the drag, the throw and the slide all drive
  the same four numbers rather than fighting over the transform.
- **`ThrowDemo`** (`throw-demo.tsx`) is the guided tour. It **never plays on
  its own** — only from the dock's WATCH DEMO (bottom-right on a desktop, a
  play glyph beside the language toggle on a phone), which bumps `demoGen` in
  the stage. It walks through the dock's tabs, opening a
  card, swapping, flinging, and (phone grid only) shake-to-reset. It is a ghost
  — outlines drawn over the grid, never the real cards or tabs — so it can play
  over a visitor who is already exploring. Only SKIP DEMO ends it; a tab switch
  or an opened card stops it too, since the outlines belong to this layout.
- **Shake to reset** (`shake.tsx`, any touch screen): a shake bumps `shakeGen`,
  which is in every card's key, so the set scatters and gathers back into the
  tab's original layout. iOS gates motion behind a permission it only lets a
  page ask for from a tap: when the tour ends or is skipped, a popup offers it
  (ENABLE is that tap), and the first swap or fling also arms a request on the
  next click. A visitor who never watches the tour only gets that second
  route — the popup is tied to the tour ending. On iOS it needs https, that permission, and a
  listener attached after the answer. **`?debug=shake`
  shows a live readout** — secure page, permission, events, forces, spikes —
  for a phone that won't shake.
- Drag starts manually (`dragListener={false}`) so form fields are exempt, and a
  drag that ends on a button swallows the click. Disabled while `busy` and in
  an expanded view.

### English and Arabic

The dock's language toggle (`عربي` / `EN`) switches the whole site, and Arabic
is a mirrored site, not a translated one. `lib/i18n.tsx` explains the design;
the rules worth knowing before touching anything:

- **Copy lives in two files of one shape.** `lib/content.ts` is English and
  defines `Content` (including `UI`, every interface string); `lib/content-ar.ts`
  implements it, so a missing Arabic string is a type error. Components read
  `useContent()` — never the English constants, which remain only for the
  server-side link preview and metadata. **New copy goes in both files.**
- **The language is on `<html>`** (`lang` + `dir`), set before first paint by
  `LANG_BOOT` (`lib/lang-boot.ts`, inlined in `<head>`) from `?lang=`, the
  saved choice, or else the device language (Arabic only if it is Arabic), so the server-rendered boot drawing is mirrored on frame one.
- **CSS does the mirroring** — grid, flex and logical properties. So: write
  `ms-*`/`me-*`, `start-*`/`end-*`, `text-start`, `border-e`, never left/right.
  Directional arrows get `rtl:-scale-x-100`.
- **Hand-positioned things are mirrored explicitly:** `rectFor(..., cols, rtl)`
  for the identity card, `FlightGrid.rtl` for flight headings, and the ←/→ keys.
- **Latin inside Arabic needs `dir="ltr"`** wherever bidi would reorder it: the
  name (".MRAD"), tech names ("++C"), the phone number, the footer, counters
  ("+10"). Tags and stack rows already do it.
- **Arabic fonts** (IBM Plex Sans Arabic, Noto Kufi Arabic) are self-hosted
  Arabic-only subsets behind the Latin fonts in the stacks, never preloaded —
  English visitors never fetch them. `globals.css` zeroes letter-spacing and
  loosens display leading under `lang="ar"`: tracking breaks Arabic's joined
  letters, and Latin-tight leading clips its dots.
- Card keys carry the language, so switching scatters the set and gathers it
  into the mirrored grid while the identity card glides across.

### Inverted mode

The dock's ◐ toggle flips the site black-on-white — still strictly monochrome:
the six colour tokens swap (`:root[data-theme="light"]` in `globals.css`).
**The theme follows the visitor's device** (`prefers-color-scheme`), before
first paint via `PREFS_BOOT` (`lib/lang-boot.ts`) and live while the page is
open, until they use the toggle; `?theme=light|dark` overrides it. The toggle
is per-visit, never saved (the language is); `lib/theme.tsx` holds
the store and the switch: a disc of the new background scales out from the
button, the theme flips under it, and it fades. Transform and opacity only —
an earlier clip-path reveal juddered, because clip-path repaints every frame
and the area grows with the square of the radius.

- **Never write a literal white.** The site's one accent is light coming off
  the foreground: every glow is `rgb(var(--glow) / calc(α * var(--glow-k)))`
  and every stroke or rule is `var(--color-fg)`. In light mode `--glow` is near
  black at half strength (`--glow-k: 0.5`) — on white, a white glow vanishes
  and a full-strength black one is a smudge; half reads as the same lift.
- Anything drawn outside the DOM (a canvas) can't be reached by the CSS
  tokens and must read `useThemeStore()` for its colours.
- The link preview (`opengraph-image.tsx`) stays dark: it is one image for
  everyone.

### What crawlers see

The grid mounts after JavaScript, so without help a crawler sees an empty page.
`lib/seo.ts` derives, from `content.ts`, per-tab titles/descriptions with
`?lang=ar` alternates, Open Graph and Twitter tags (`generateMetadata` in
`page.tsx`), and one JSON-LD `@graph` with a Person and an FAQPage built from
`FAQ`; `app/sitemap.ts` and `app/robots.ts` list the four tabs. `components/static-cv.tsx` server-renders the whole CV as semantic
HTML: visually hidden during boot, given `hidden` by the stage once the grid
mounts (so screen readers get one copy), and shown as the page itself when
JavaScript is off (`<noscript>` in `page.tsx`). **New content in `content.ts`
belongs in the static CV too** if it matters to a client or a crawler.

### Two variants

One Next.js app, one Vercel project, two sites. `Variant` is `"business" |
"cv"` (`lib/content-types.ts`).

| | business | cv |
|---|---|---|
| Host | mikelmrad.dev | portfolio.mikelmrad.dev |
| Route | `app/[[...tab]]` | `app/cv/[[...tab]]` (internal) |
| Tabs | INDEX WORK ABOUT CONTACT | INDEX WORK STACK CONTACT |
| Copy | `content.ts`, `content-ar.ts` | `content-cv.ts`, `content-cv-ar.ts` |
| Maps | `LAYOUTS`, `MOBILE_LAYOUTS` | `CV_LAYOUTS`, `CV_MOBILE_LAYOUTS` |
| Search | indexed, sitemap, JSON-LD | **noindex**, not in sitemap |

- **`proxy.ts`** (Next 16's renamed middleware) rewrites the subdomain's clean
  paths to `/cv/...`, redirects `/cv` on the main domain (308) to the
  subdomain, and redirects `/cv/...` typed on the subdomain to the clean path.
  Locally `portfolio.localhost:3000` works, and `?variant=cv` is a fallback on
  localhost and `*.vercel.app` previews only. The matcher skips `_next` and any
  path with a file extension, so assets are shared.
- **`next.config.ts` redirects run before the proxy**: anything host-specific
  there needs a `has`/`missing` host condition (`/stack → /about` is business
  only). It also sets `X-Robots-Tag: noindex, follow` on the portfolio host.
  **Don't block the subdomain in robots.txt**: a crawler that can't fetch a page
  never sees its noindex.
- **Content:** shared components read `useContent()`, typed as `SharedContent`
  (the fields both sets have). A module that exists in one variant reads
  `useBusiness()` (sales-modules, the compact STACK card) or `useCv()`
  (`cv-modules.tsx`: figures, status, location, latest, CV card, toolbox, stack
  sheets, contact cards). Both content sets end with `satisfies SharedContent`.
  `GRIDS[variant]` in `lib/grid.ts` holds a variant's tabs and two maps.
- **Every URL the client writes is the public one.** `pathFor()` in the stage
  pushes `/work`, never `/cv/work`, and keeps the query string (so `?lang` and
  `?variant=cv` survive tab switches).
- The portfolio has no services, prices, plans, FAQ, testimonials, WhatsApp
  or link to the business site, and the business site doesn't link to it.
  Its copy is the pre-rewrite site (commit `c7e5dc1`) with dashes removed; the
  3D arrows card and the contact form were not restored.
- Each variant has its own link preview (`app/opengraph-image.tsx`,
  `app/cv/opengraph-image.tsx`), both drawn by `lib/og.tsx`, and its own static
  article (`StaticCv variant=...`).

### Routing

Tabs are real static routes (`/`, `/work`, `/about`, `/contact`; the portfolio's
`/`, `/work`, `/stack`, `/contact` through the proxy) via an optional
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
  grids put the same module in wildly different heights — a service is a
  ~180x121 block on a phone and a ~345x350 one on a desktop — so a width gate
  can't tell them apart. `.cq-h80` through `.cq-h320` in `globals.css` show
  their content only above that container height (`.cq-h320-hide` is the
  inverse). Gate the line the card can most afford to lose: the hero drops its
  proof strip, then its subline, and keeps headline and buttons; a service
  keeps title and price and drops its description; HOW I WORK keeps the step
  titles and drops their explanations; STACK keeps the categories and drops
  the lists.
  They set `display: revert`, which for a bare `<span>` is `inline` — so on a
  non-flex parent, gate a wrapper `<div>` instead, or `truncate` and vertical
  margins silently stop working.
- **Centre with `safe center` where content can outgrow the card.** Plain
  `justify-center` overflows in *both* directions; EDUCATION's first school rode
  up over its own label on a 360px phone. `[justify-content:safe_center]` falls
  back to flex-start and clips off the bottom like everything else.
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
(the old CV card's "DOWNLOAD ↓") shot sideways on hover. A definite width overrides
the stretch. Don't remove it, and don't paper over it with `self-start` at each
call site.

**The site is strictly monochrome.** There is no accent colour — white *glow*
plays that role (`shadow-glow-sm` / `shadow-glow` / `shadow-glow-lg`, plus
`GlowRule` and `LiveDot`). Do not introduce a hue.

## Assets

- `public/docs/Mikel-Mrad-CV.pdf` — the 2026 technical CV.
- `public/images/work/*.webp` — 4 screenshots per project.

## Content source of truth

The sales copy (hero, services, prices, process, FAQ, project write-ups,
experience blurbs) was supplied by Mikel in October 2026 and is final: change
it only when asked. Builds include onboarding and free bug
fixes (a year for stores and websites, 3 months for apps; `fixesNote` says what
that covers), and two yearly care plans (Care, Care+) live on the fourth
service card (`plans` on the `care` entry). Nothing offered may include data
entry (adding a client's products or content). The Outlets is
*Co-Founder & Developer since 2022*, with no sales figures. Uncle J has no live link and nothing on the site may say the
store closed.
