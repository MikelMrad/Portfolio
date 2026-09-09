/**
 * The whole site is one grid. Every tab is a placement map onto it.
 * Cards fly between arrangements because they share the same coordinate space.
 *
 * There are two grids, not two sites: 12x8 on a desktop, 4x12 on a phone. Both
 * hold the same modules and both feed the same scatter engine — only the
 * proportions differ, because a phone is portrait and a desktop is landscape.
 *
 * Adding a tab means adding a key to LAYOUTS *and* MOBILE_LAYOUTS — never
 * writing animation code.
 */

export const GRID_COLS = 12
export const GRID_ROWS = 8

/**
 * The phone grid. Same engine, different proportions: a phone is roughly 9:19
 * where a desktop is 16:9, so the grid is turned on its side — 4 narrow columns
 * and enough rows to give a card a sensible portrait shape.
 *
 * 12 rows is the granularity, not the module count: on a 393x852 phone a row is
 * ~57px, so a module can be one bar (a footer), two (a stat block) or nine (an
 * expanded project) without any of them being forced into the wrong height.
 */
export const MOBILE_COLS = 4
export const MOBILE_ROWS = 12

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

/**
 * The same modules, arranged for a portrait 4x12.
 *
 * Not a transposition of the desktop map — a phone column is ~86px, so what
 * works as a 5-wide band on a desktop has to become either a full-width bar or
 * a half-width block. Each tab is composed for the shape it is actually in.
 *
 * Every tab holds exactly the modules its desktop layout holds. If a module is
 * missing from one of these maps it does not exist on a phone, and the grid
 * will have a hole where it should be.
 */
export const MOBILE_LAYOUTS: Record<TabId, Partial<Record<ModuleId, Placement>>> = {
  // Identity, then the numbers, then the story — with the four small modules
  // paired off two-by-two down the bottom third.
  index: {
    identity:   { col: [1, 4], row: [1, 2] },
    stats:      { col: [1, 4], row: [3, 2] },
    experience: { col: [1, 4], row: [5, 4] },
    signature:  { col: [1, 2], row: [9, 2] },
    latest:     { col: [3, 2], row: [9, 2] },
    status:     { col: [1, 2], row: [11, 2] },
    location:   { col: [3, 2], row: [11, 2] },
  },
  // The projects are the tab, so they take four rows each in a 2x2 — a portrait
  // card at ~180x251, which is the shape a phone screenshot wants anyway.
  work: {
    identity:     { col: [1, 4], row: [1, 2] },
    "work-meta":  { col: [1, 2], row: [3, 2] },
    cv:           { col: [3, 2], row: [3, 2] },
    "project-01": { col: [1, 2], row: [5, 4] },
    "project-02": { col: [3, 2], row: [5, 4] },
    "project-03": { col: [1, 2], row: [9, 4] },
    "project-04": { col: [3, 2], row: [9, 4] },
  },
  // Two columns of spec sheets. Row count roughly tracks entry count, but the
  // spec-sheet rows are `flex-1` and share whatever they get, so the tighter
  // constraint is EDUCATION: at three rows its second school lost its dates off
  // the bottom. FRAMEWORKS gives up the row — a denser list is cosmetic, a
  // missing line is not.
  stack: {
    identity:         { col: [1, 4], row: [1, 2] },
    "tech-count":     { col: [1, 2], row: [3, 2] },
    "cat-databases":  { col: [3, 2], row: [3, 2] },
    "cat-languages":  { col: [1, 2], row: [5, 4] },
    "cat-tools":      { col: [1, 2], row: [9, 4] },
    "cat-frameworks": { col: [3, 2], row: [5, 4] },
    education:        { col: [3, 2], row: [9, 4] },
  },
  // HEADLINE needs three rows: its type is already at the floor of its clamp,
  // and `leading-[0.82]` lets the glyphs overflow their line boxes, so at two
  // rows "WORK." sat on top of the availability line. The form gives up the row
  // — its textarea is flex-1 and had the slack.
  contact: {
    identity: { col: [1, 4], row: [1, 2] },
    headline: { col: [1, 4], row: [3, 3] },
    email:    { col: [1, 4], row: [6, 2] },
    form:     { col: [1, 4], row: [8, 4] },
    socials:  { col: [1, 2], row: [12, 1] },
    footer:   { col: [3, 2], row: [12, 1] },
  },
}

/**
 * Normalised centre of a placement in 0..1 grid space.
 *
 * Takes the grid's dimensions rather than assuming the desktop 12x8, because
 * the same function ranks and aims the phone grid's 4x12.
 */
export function placementCenter(p: Placement, cols = GRID_COLS, rows = GRID_ROWS) {
  return {
    cx: (p.col[0] - 1 + p.col[1] / 2) / cols,
    cy: (p.row[0] - 1 + p.row[1] / 2) / rows,
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
