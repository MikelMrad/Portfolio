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
 *
 * Two variants run on it (lib/content-types.ts): the business site, with the
 * maps below, and the portfolio (CV_LAYOUTS / CV_MOBILE_LAYOUTS further down).
 * GRIDS picks a variant's tabs and maps.
 */

import type { Variant } from "./content-types"
import { HAS_TESTIMONIALS } from "./testimonials"

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

export type BusinessTabId = "index" | "work" | "about" | "contact"
export type CvTabId = "index" | "work" | "stack" | "contact"
export type TabId = BusinessTabId | CvTabId

export type Tab = { id: TabId; key: string }

/**
 * Four tabs, eight sections, in reading order:
 *   INDEX   hero (with the proof strip), services
 *   WORK    projects, testimonials (only once one is approved)
 *   ABOUT   how I work, experience, stack, education
 *   CONTACT contact, FAQ
 */
export const TABS: Tab[] = [
  { id: "index",   key: "1" },
  { id: "work",    key: "2" },
  { id: "about",   key: "3" },
  { id: "contact", key: "4" },
]

/** The portfolio's four: INDEX, WORK, STACK, CONTACT. Labels are copy (UI.tabs). */
export const CV_TABS: Tab[] = [
  { id: "index",   key: "1" },
  { id: "work",    key: "2" },
  { id: "stack",   key: "3" },
  { id: "contact", key: "4" },
]

export type ModuleId =
  // shared
  | "identity"
  // index
  | "hero" | "svc-stores" | "svc-websites" | "svc-apps" | "svc-care"
  // work
  | "work-meta" | "testimonials" | "project-01" | "project-02" | "project-03" | "project-04"
  // about
  | "process" | "experience" | "stack" | "education"
  // contact
  | "contact" | "faq" | "footer"
  // portfolio variant only
  | "status" | "stats" | "location" | "latest" | "cv"
  | "tech-count" | "cat-languages" | "cat-frameworks" | "cat-tools" | "cat-databases"
  | "headline" | "email" | "socials"
  // expanded project: a synthetic layout, see DETAIL_LAYOUT in stage.tsx
  | "project-detail" | "detail-nav"
  // generic zoom chrome
  | "zoom-nav"

/** [startLine, span]: 1-indexed, matching CSS grid lines. */
export type Placement = { col: [number, number]; row: [number, number] }

export type Map = Partial<Record<ModuleId, Placement>>

/**
 * WORK comes in two shapes: with the testimonials card (in place of the
 * SELECTED counter) and without it. Which
 * one ships is decided by lib/testimonials.ts at build time, so the boot
 * drawing (server-rendered from these maps) always matches what mounts.
 */
const WORK: Map = {
  identity:     { col: [1, 3],  row: [1, 4] },
  "work-meta":  { col: [1, 3],  row: [5, 4] },
  "project-01": { col: [4, 5],  row: [1, 4] },
  "project-02": { col: [9, 4],  row: [1, 4] },
  "project-03": { col: [4, 5],  row: [5, 4] },
  "project-04": { col: [9, 4],  row: [5, 4] },
}
/** With quotes to show, they take the SELECTED counter's place. */
const WORK_TESTIMONIALS: Map = {
  identity:     { col: [1, 3],  row: [1, 3] },
  testimonials: { col: [1, 3],  row: [4, 5] },
  "project-01": WORK["project-01"],
  "project-02": WORK["project-02"],
  "project-03": WORK["project-03"],
  "project-04": WORK["project-04"],
}

/**
 * Each map tiles the full 12x8 with no gaps and no overlaps.
 * Order within an object is irrelevant: placement is absolute.
 */
export const LAYOUTS: Record<BusinessTabId, Map> = {
  // The hero (pitch, buttons, proof strip) beside the name; the four
  // services share the bottom band as equal columns.
  index: {
    identity:       { col: [1, 4],  row: [1, 4] },
    hero:           { col: [5, 8],  row: [1, 4] },
    "svc-stores":   { col: [1, 3],  row: [5, 4] },
    "svc-websites": { col: [4, 3],  row: [5, 4] },
    "svc-apps":     { col: [7, 3],  row: [5, 4] },
    "svc-care":     { col: [10, 3], row: [5, 4] },
  },
  work: HAS_TESTIMONIALS ? WORK_TESTIMONIALS : WORK,
  // How I work runs across the top as four steps; the CV material sits under
  // it, experience widest, stack and education compact beside it.
  about: {
    identity:   { col: [1, 3],  row: [1, 3] },
    process:    { col: [4, 9],  row: [1, 3] },
    experience: { col: [1, 6],  row: [4, 5] },
    stack:      { col: [7, 3],  row: [4, 5] },
    education:  { col: [10, 3], row: [4, 5] },
  },
  contact: {
    identity: { col: [1, 4],  row: [1, 3] },
    contact:  { col: [1, 4],  row: [4, 5] },
    faq:      { col: [5, 8],  row: [1, 7] },
    footer:   { col: [5, 8],  row: [8, 1] },
  },
}

const MOBILE_WORK: Map = {
  identity:     { col: [1, 4], row: [1, 2] },
  "work-meta":  { col: [1, 4], row: [3, 2] },
  "project-01": { col: [1, 2], row: [5, 4] },
  "project-02": { col: [3, 2], row: [5, 4] },
  "project-03": { col: [1, 2], row: [9, 4] },
  "project-04": { col: [3, 2], row: [9, 4] },
}
const MOBILE_WORK_TESTIMONIALS: Map = {
  identity:     { col: [1, 4], row: [1, 2] },
  testimonials: { col: [1, 4], row: [3, 4] },
  "project-01": { col: [1, 2], row: [7, 3] },
  "project-02": { col: [3, 2], row: [7, 3] },
  "project-03": { col: [1, 2], row: [10, 3] },
  "project-04": { col: [3, 2], row: [10, 3] },
}

/**
 * The same modules, arranged for a portrait 4x12.
 *
 * Not a transposition of the desktop map: a phone column is ~86px, so what
 * works as a 5-wide band on a desktop has to become either a full-width bar or
 * a half-width block. Each tab is composed for the shape it is actually in.
 *
 * Every tab holds exactly the modules its desktop layout holds. If a module is
 * missing from one of these maps it does not exist on a phone, and the grid
 * will have a hole where it should be.
 *
 * Small cards keep their headline and drop the detail (the `.cq-h*` gates);
 * every one of them is a button that expands to the whole grid, so the detail
 * is one tap away rather than squeezed in.
 */
export const MOBILE_LAYOUTS: Record<BusinessTabId, Map> = {
  index: {
    identity:       { col: [1, 4], row: [1, 2] },
    hero:           { col: [1, 4], row: [3, 6] },
    "svc-stores":   { col: [1, 2], row: [9, 2] },
    "svc-websites": { col: [3, 2], row: [9, 2] },
    "svc-apps":     { col: [1, 2], row: [11, 2] },
    "svc-care":     { col: [3, 2], row: [11, 2] },
  },
  work: HAS_TESTIMONIALS ? MOBILE_WORK_TESTIMONIALS : MOBILE_WORK,
  about: {
    identity:   { col: [1, 4], row: [1, 2] },
    process:    { col: [1, 4], row: [3, 3] },
    experience: { col: [1, 4], row: [6, 4] },
    stack:      { col: [1, 2], row: [10, 3] },
    education:  { col: [3, 2], row: [10, 3] },
  },
  contact: {
    identity: { col: [1, 4], row: [1, 2] },
    contact:  { col: [1, 4], row: [3, 4] },
    faq:      { col: [1, 4], row: [7, 5] },
    footer:   { col: [1, 4], row: [12, 1] },
  },
}

// ── The portfolio variant ───────────────────────────────────────────────────
// The pre-rewrite composition (commit c7e5dc1). The arrows card that sat
// beside the figures on INDEX is gone with three.js, so the figures, status,
// location and latest cards re-tile around it; CONTACT has no form, so the CV
// card and BASED take its place.

export const CV_LAYOUTS: Record<CvTabId, Map> = {
  index: {
    identity:   { col: [1, 5],  row: [1, 4] },
    stats:      { col: [6, 7],  row: [1, 3] },
    status:     { col: [6, 3],  row: [4, 2] },
    location:   { col: [6, 3],  row: [6, 3] },
    latest:     { col: [9, 4],  row: [4, 5] },
    experience: { col: [1, 5],  row: [5, 4] },
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
    headline: { col: [1, 4],  row: [4, 5] },
    cv:       { col: [5, 4],  row: [3, 5] },
    location: { col: [9, 4],  row: [3, 5] },
    socials:  { col: [5, 5],  row: [8, 1] },
    footer:   { col: [10, 3], row: [8, 1] },
  },
}

export const CV_MOBILE_LAYOUTS: Record<CvTabId, Map> = {
  index: {
    identity:   { col: [1, 4], row: [1, 2] },
    stats:      { col: [1, 4], row: [3, 2] },
    experience: { col: [1, 4], row: [5, 4] },
    latest:     { col: [1, 4], row: [9, 2] },
    status:     { col: [1, 2], row: [11, 2] },
    location:   { col: [3, 2], row: [11, 2] },
  },
  work: {
    identity:     { col: [1, 4], row: [1, 2] },
    "work-meta":  { col: [1, 4], row: [3, 2] },
    "project-01": { col: [1, 2], row: [5, 3] },
    "project-02": { col: [3, 2], row: [5, 3] },
    "project-03": { col: [1, 2], row: [8, 3] },
    "project-04": { col: [3, 2], row: [8, 3] },
    cv:           { col: [1, 4], row: [11, 2] },
  },
  stack: {
    identity:         { col: [1, 4], row: [1, 2] },
    "tech-count":     { col: [1, 2], row: [3, 2] },
    "cat-databases":  { col: [3, 2], row: [3, 2] },
    "cat-languages":  { col: [1, 2], row: [5, 4] },
    "cat-tools":      { col: [1, 2], row: [9, 4] },
    "cat-frameworks": { col: [3, 2], row: [5, 4] },
    education:        { col: [3, 2], row: [9, 4] },
  },
  contact: {
    identity: { col: [1, 4], row: [1, 2] },
    headline: { col: [1, 4], row: [3, 3] },
    email:    { col: [1, 4], row: [6, 2] },
    cv:       { col: [1, 2], row: [8, 4] },
    location: { col: [3, 2], row: [8, 4] },
    socials:  { col: [1, 2], row: [12, 1] },
    footer:   { col: [3, 2], row: [12, 1] },
  },
}

/** A variant's tabs and its two placement maps. */
export const GRIDS: Record<Variant, {
  tabs: Tab[]
  desktop: Partial<Record<TabId, Map>>
  mobile:  Partial<Record<TabId, Map>>
}> = {
  business: { tabs: TABS,    desktop: LAYOUTS,    mobile: MOBILE_LAYOUTS },
  cv:       { tabs: CV_TABS, desktop: CV_LAYOUTS, mobile: CV_MOBILE_LAYOUTS },
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
export function rectFor(p: Placement, g: GridGeom, cols: number, rtl = false) {
  const width = g.cellW * p.col[1] + g.gapX * (p.col[1] - 1)
  const fromStart = (g.cellW + g.gapX) * (p.col[0] - 1)
  // Under dir="rtl" CSS grid counts columns from the right, so the card has to
  // as well — mirrored inside the content box (the padding is symmetric).
  const content = g.cellW * cols + g.gapX * (cols - 1)
  return {
    left:   g.padL + (rtl ? content - fromStart - width : fromStart),
    top:    g.padT + (g.cellH + g.gapY) * (p.row[0] - 1),
    width,
    height: g.cellH * p.row[1] + g.gapY * (p.row[1] - 1),
  }
}

export function gridStyle(p: Placement): React.CSSProperties {
  return {
    gridColumn: `${p.col[0]} / span ${p.col[1]}`,
    gridRow:    `${p.row[0]} / span ${p.row[1]}`,
  }
}
