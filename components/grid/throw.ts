/**
 * Shared plumbing for throwable cards.
 *
 * Two things cross between the stage and the cards without going through
 * React state, because they are about pixels at one instant rather than about
 * what the page is showing:
 *
 * - `flipFrom` — the box a card occupied just before a swap or a reset
 *   rewrote its placement, in the grid's own coordinates. The stage fills it at
 *   the drop; the card reads it in the layout effect after the commit and
 *   morphs its real box from there into its new cell. Taken before the commit
 *   because afterwards the old box no longer exists in the DOM.
 * - `impact()` — a shockwave from where a thrown card landed. Every idle card
 *   hears it and gets shoved away from that point, falling off with distance.
 */

export type Point = { x: number; y: number }

/** A box in the grid container's padding-box coordinates. */
export type Box = { x: number; y: number; w: number; h: number }

export const flipFrom = new Map<string, Box>()

export function centreOf(el: Element): Point {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

/**
 * Record where every card named currently is, ahead of a re-layout.
 *
 * Position is the *visual* centre — a dragged card is under the pointer, not in
 * its cell — but size is the layout size (offsetWidth/Height), which ignores
 * the pick-up scale, so the morph starts from the card's true box.
 */
export function captureBoxes(ids: string[]) {
  for (const id of ids) {
    const el = document.querySelector<HTMLElement>(`[data-module="${id}"]`)
    const grid = el?.offsetParent
    if (!el || !grid) continue
    const g = grid.getBoundingClientRect()
    const c = centreOf(el)
    const w = el.offsetWidth
    const h = el.offsetHeight
    flipFrom.set(id, { x: c.x - g.left - w / 2, y: c.y - g.top - h / 2, w, h })
  }
}

/**
 * Thrown cards come back one at a time.
 *
 * Several flung together used to return in the same instant and land in one
 * heap, each landing's shockwave lost in the others. This hands every returning
 * card a slot: no sooner than its own time away, and at least RETURN_GAP_MS
 * after the card before it — so they come back in the order they were thrown,
 * and each one lands into a grid the previous one has just shaken.
 */
const RETURN_GAP_MS = 220
let lastReturnAt = 0

/** How long to wait, from now, before coming back. */
export function returnSlot(awayMs: number): number {
  const now = performance.now()
  const at = Math.max(now + awayMs, lastReturnAt + RETURN_GAP_MS)
  lastReturnAt = at
  return at - now
}

/**
 * Stacking order for cards off the grid. Each pick-up takes the next layer, so
 * the most recently grabbed or returning card passes over the rest rather than
 * whichever happens to be later in the DOM.
 */
let liftCounter = 0
export function nextLift(): number {
  liftCounter = (liftCounter + 1) % 1000
  return 30 + liftCounter
}

const IMPACT = "grid:impact"
export type Impact = Point & { strength: number; source: string }

export function impact(detail: Impact) {
  window.dispatchEvent(new CustomEvent<Impact>(IMPACT, { detail }))
}

export function onImpact(fn: (i: Impact) => void) {
  const h = (e: Event) => fn((e as CustomEvent<Impact>).detail)
  window.addEventListener(IMPACT, h)
  return () => window.removeEventListener(IMPACT, h)
}

/** The card under a point, other than the one being dragged. */
export function cardAt(p: Point, except: string): string | null {
  for (const el of document.elementsFromPoint(p.x, p.y)) {
    const id = (el as HTMLElement).closest?.<HTMLElement>("[data-module]")?.dataset.module
    if (id && id !== except) return id
  }
  return null
}
