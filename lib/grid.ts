/**
 * The whole site is one 12x8 grid. Every tab is a placement map onto it.
 * Cards fly between arrangements because they share the same coordinate space.
 *
 * Adding a tab means adding a key to LAYOUTS — never writing animation code.
 */

export const GRID_COLS = 12
export const GRID_ROWS = 8

export type TabId = "index" | "work" | "stack" | "contact"

export const TABS: { id: TabId; label: string; key: string }[] = [
  { id: "index",   label: "INDEX",   key: "1" },
  { id: "work",    label: "WORK",    key: "2" },
  { id: "stack",   label: "STACK",   key: "3" },
  { id: "contact", label: "CONTACT", key: "4" },
]

export type ModuleId =
  // shared
  | "identity"
  // index
  | "status" | "stats" | "signature" | "experience" | "location" | "latest"
  // work
  | "work-meta" | "cv" | "project-01" | "project-02" | "project-03" | "project-04"
  // stack
  | "tech-count" | "cat-languages" | "cat-frameworks" | "cat-tools" | "cat-databases" | "education"
  // contact
  | "headline" | "email" | "form" | "socials" | "footer"
  // expanded project — a synthetic layout, see DETAIL_LAYOUT in stage.tsx
  | "project-detail" | "detail-nav"
  // generic desktop zoom (currently the experience timeline)
  | "zoom-nav"

/** [startLine, span] — 1-indexed, matching CSS grid lines. */
export type Placement = { col: [number, number]; row: [number, number] }

/**
 * Each map tiles the full 12x8 with no gaps and no overlaps.
 * Order within an object is irrelevant — placement is absolute.
 */
export const LAYOUTS: Record<TabId, Partial<Record<ModuleId, Placement>>> = {
  index: {
    identity:   { col: [1, 5],  row: [1, 4] },
    status:     { col: [6, 3],  row: [1, 2] },
    stats:      { col: [9, 4],  row: [1, 2] },
    signature:  { col: [6, 7],  row: [3, 3] },
    experience: { col: [1, 5],  row: [5, 4] },
    location:   { col: [6, 3],  row: [6, 3] },
    latest:     { col: [9, 4],  row: [6, 3] },
  },
  work: {
    identity:     { col: [1, 3],  row: [1, 2] },
    "work-meta":  { col: [1, 3],  row: [3, 2] },
    "project-01": { col: [4, 5],  row: [1, 4] },
    "project-02": { col: [9, 4],  row: [1, 4] },
    cv:           { col: [1, 3],  row: [5, 4] },
    "project-03": { col: [4, 5],  row: [5, 4] },
    "project-04": { col: [9, 4],  row: [5, 4] },
  },
  // Four tall columns rather than wide bands: 12 chips need to wrap to fill a
  // card, and a 9-wide box just puts them all on one line with dead space below.
  stack: {
    identity:         { col: [1, 3],  row: [1, 2] },
    "tech-count":     { col: [1, 3],  row: [3, 2] },
    education:        { col: [1, 3],  row: [5, 4] },
    "cat-languages":  { col: [4, 3],  row: [1, 5] },
    "cat-databases":  { col: [4, 3],  row: [6, 3] },
    "cat-frameworks": { col: [7, 3],  row: [1, 8] },
    "cat-tools":      { col: [10, 3], row: [1, 8] },
  },
  contact: {
    identity: { col: [1, 4],  row: [1, 3] },
    email:    { col: [5, 8],  row: [1, 2] },
    form:     { col: [5, 8],  row: [3, 5] },
    headline: { col: [1, 4],  row: [4, 5] },
    socials:  { col: [5, 5],  row: [8, 1] },
    footer:   { col: [10, 3], row: [8, 1] },
  },
}

/** Normalised centre of a placement in 0..1 grid space. */
export function placementCenter(p: Placement) {
  return {
    cx: (p.col[0] - 1 + p.col[1] / 2) / GRID_COLS,
    cy: (p.row[0] - 1 + p.row[1] / 2) / GRID_ROWS,
  }
}

/** Measured geometry of the grid's content box, used to place the identity card. */
export type GridGeom = {
  padL: number; padT: number
  gapX: number; gapY: number
  cellW: number; cellH: number
}

/**
 * Pixel rect for a placement.
 *
 * The identity card is positioned and sized in real pixels rather than being a
 * grid item, because it's the one card that morphs: Motion's `layout` animates a
 * transform, which leaves the element's *layout* size at its final value from
 * frame one. Container queries read layout size, so the card's contents would
 * snap to the new size instantly while the box was still visually travelling.
 * Animating width/height for real keeps the contents in step with the box.
 */
export function rectFor(p: Placement, g: GridGeom) {
  return {
    left:   g.padL + (g.cellW + g.gapX) * (p.col[0] - 1),
    top:    g.padT + (g.cellH + g.gapY) * (p.row[0] - 1),
    width:  g.cellW * p.col[1] + g.gapX * (p.col[1] - 1),
    height: g.cellH * p.row[1] + g.gapY * (p.row[1] - 1),
  }
}

export function gridStyle(p: Placement): React.CSSProperties {
  return {
    gridColumn: `${p.col[0]} / span ${p.col[1]}`,
    gridRow:    `${p.row[0]} / span ${p.row[1]}`,
  }
}
