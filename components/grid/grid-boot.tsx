import { LAYOUTS, MOBILE_LAYOUTS, gridStyle, type ModuleId, type Placement, type TabId } from "@/lib/grid"
import { DESKTOP_FLIGHT, MOBILE_FLIGHT, rankByRadius, type FlightGrid } from "@/lib/scatter"

/**
 * The boot layer: the tab's bento drawn as a line, before it exists.
 *
 * Not a generic spinner and not a generic grid — one SVG rectangle per module
 * in the layout this route is about to render, stroked on centre-outward like a
 * plan being drawn. When the last line closes, the modules fade up inside the
 * boxes that were just drawn for them (`reveal` in lib/scatter.ts), and the
 * drawing hands its outline over to their real borders.
 *
 * It exists because of a cost the architecture accepts on purpose: no module
 * mounts until `useViewportMode()` has resolved, so the SSR markup is an empty
 * grid and a phone sits on a black page while the JS lands. This draws through
 * that window instead, and holds the finished wireframe until the app is up.
 *
 * Three things keep it honest:
 *
 * 1. **No JavaScript.** It is a server component and the drawing is CSS
 *    keyframes (`.boot` in globals.css), because its whole job is the frames
 *    *before* React exists. JS only sets `data-booted` on <html>, which is the
 *    handoff.
 * 2. **It renders in `page.tsx`, not `layout.tsx`.** The layout also wraps
 *    `not-found`, which never mounts a Stage — nothing would ever set
 *    `data-booted` there and the drawing would sit on top of the 404 forever.
 * 3. **Placement comes from `gridStyle()`**, the same helper the real cards use,
 *    inside a container that restates the stage's grid geometry. The boxes are
 *    where the modules will be because they are placed the same way.
 *
 * The server can't know the viewport, so both maps are drawn and CSS picks —
 * the desktop 12x8 and the portrait 4x12, on exactly the query the stage
 * switches grids on.
 */

/**
 * The gap between one box starting to draw and the next. Per-box draw time is
 * `--boot-draw` in globals.css; nothing needs to know the total, because the
 * stage waits on these animations finishing rather than on a duration.
 */
const STAGGER_MS = 260

function boxes(map: Partial<Record<ModuleId, Placement>>, flight: FlightGrid, variant: "d" | "m") {
  const entries = Object.entries(map) as [ModuleId, Placement][]
  // Centre-outward — the order the modules themselves gather in.
  const { inward } = rankByRadius(entries, flight)

  return entries.map(([id, placement]) => (
    <svg
      key={id}
      className={`boot-box boot-${variant}`}
      style={{ ...gridStyle(placement), "--d": `${(inward[id] ?? 0) * STAGGER_MS}ms` } as React.CSSProperties}
    >
      {/* pathLength normalises the perimeter to 100 whatever the box measures,
          so one dash offset draws every rectangle at the same rate. */}
      <rect className="boot-line" x="0" y="0" width="100%" height="100%" pathLength={100} />
    </svg>
  ))
}

export function GridBoot({ tab }: { tab: TabId }) {
  return (
    <div className="boot" aria-hidden="true">
      {boxes(LAYOUTS[tab], DESKTOP_FLIGHT, "d")}
      {boxes(MOBILE_LAYOUTS[tab], MOBILE_FLIGHT, "m")}
    </div>
  )
}
