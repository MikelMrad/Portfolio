/**
 * Shared plumbing for throwable cards.
 *
 * Two things cross between the stage and the cards without going through
 * React state, because they are about pixels at one instant rather than about
 * what the page is showing:
 *
 * - `flipFrom` — where a card *visually* was just before a swap or a reset
 *   rewrote its placement. The stage fills it at the drop; the card reads it in
 *   the layout effect after the commit and slides from there to its new cell.
 *   Taken before the commit because afterwards the old position no longer
 *   exists in the DOM.
 * - `impact()` — a shockwave from where a thrown card landed. Every idle card
 *   hears it and gets shoved away from that point, falling off with distance.
 */

export type Point = { x: number; y: number }

export const flipFrom = new Map<string, Point>()

export function centreOf(el: Element): Point {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

/** Record the current visual centre of every card named, ahead of a re-layout. */
export function captureCentres(ids: string[]) {
  for (const id of ids) {
    const el = document.querySelector(`[data-module="${id}"]`)
    if (el) flipFrom.set(id, centreOf(el))
  }
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
