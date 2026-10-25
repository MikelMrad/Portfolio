/**
 * Client testimonials: who said it, and whether it may be shown.
 *
 * The quote and the person's role are copy, so they live in lib/content.ts and
 * lib/content-ar.ts under TESTIMONIALS, keyed by the same `id`. This file holds
 * what doesn't translate.
 *
 * Only entries with `approved: true` render. With none approved the
 * testimonials card is left out of the WORK layout altogether, and the grid
 * re-tiles without it (TESTIMONIAL_LAYOUTS in lib/grid.ts).
 */
export type Testimonial = {
  id:       string
  /** The person quoted. Fill in before approving. */
  name:     string
  business: string
  /** Optional logo or photo, a path under /public. */
  logo?:    string
  approved: boolean
}

export const TESTIMONIALS: Testimonial[] = [
  { id: "brand-atelier", name: "", business: "Brand Atelier", approved: false },
  { id: "vinylized",     name: "", business: "Vinylized",     approved: false },
]

export const APPROVED_TESTIMONIALS = TESTIMONIALS.filter((t) => t.approved)
export const HAS_TESTIMONIALS = APPROVED_TESTIMONIALS.length > 0
