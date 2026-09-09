/**
 * The scatter / gather engine.
 *
 * Nothing here is hand-authored per card. A module's exit direction, its
 * rotation and its place in the stagger order are all derived from where it
 * sits on the grid, which is why adding a module costs nothing.
 */

import type { Variants } from "motion/react"
import {
  GRID_COLS, GRID_ROWS, MOBILE_COLS, MOBILE_ROWS, placementCenter, type Placement,
} from "./grid"

/**
 * The grid a flight is being computed against, plus how far offscreen a card
 * travels on it. Both matter: the angle comes from the cell's position in the
 * grid, and the distance has to clear the viewport that grid is filling.
 */
export type FlightGrid = { cols: number; rows: number; travelX: number; travelY: number }

/** Beyond the viewport in both axes. */
export const DESKTOP_FLIGHT: FlightGrid = {
  cols: GRID_COLS, rows: GRID_ROWS, travelX: 1400, travelY: 1000,
}

/**
 * A phone is a quarter the width and half the height of the window this was
 * tuned for. Sending a card 1400px sideways there means it spends the whole
 * spring travelling through empty space — it reads as a whip-pan rather than a
 * scatter. These clear a 430x932 screen and no more.
 */
export const MOBILE_FLIGHT: FlightGrid = {
  cols: MOBILE_COLS, rows: MOBILE_ROWS, travelX: 560, travelY: 900,
}

const EXIT_STAGGER  = 0.035 // outermost first
const ENTER_STAGGER = 0.045 // centre outward
/** Gather starts while scatter is still running — the overlap is the whole trick. */
const ENTER_OFFSET  = 0.2

/** Snap an angle to one of 8 compass directions. */
function snap8(angle: number) {
  return Math.round(angle / (Math.PI / 4)) * (Math.PI / 4)
}

export type Vector = { x: number; y: number; rotate: number; radius: number }

/**
 * Derive a card's flight path from its grid cell.
 * Cards left of centre fly left, top fly up, corners fly diagonally.
 */
export function flightVector(p: Placement, g: FlightGrid = DESKTOP_FLIGHT): Vector {
  const { cx, cy } = placementCenter(p, g.cols, g.rows)
  const dx = cx - 0.5
  const dy = cy - 0.5

  // A module dead-centre has no direction of its own — send it down.
  const radius = Math.hypot(dx, dy)
  const angle  = radius < 0.01 ? Math.PI / 2 : snap8(Math.atan2(dy, dx))

  return {
    x: Math.cos(angle) * g.travelX,
    y: Math.sin(angle) * g.travelY,
    // Rotation sign follows horizontal travel so cards bank into the turn.
    rotate: Math.cos(angle) >= 0 ? 3 : -3,
    radius,
  }
}

/**
 * Stagger delays. `rank` is the card's index once the tab's modules are sorted
 * by distance from centre — descending for exits, ascending for entrances.
 */
export function exitDelay(rank: number)  { return rank * EXIT_STAGGER }
export function enterDelay(rank: number) { return ENTER_OFFSET + rank * ENTER_STAGGER }

/**
 * Sort placements by distance from grid centre and return a lookup of
 * id -> rank, in both directions.
 */
export function rankByRadius<T extends string>(
  entries: [T, Placement][],
  g: FlightGrid = DESKTOP_FLIGHT,
): { outward: Record<string, number>; inward: Record<string, number> } {
  const withRadius = entries.map(([id, p]) => ({ id, r: flightVector(p, g).radius }))

  const inward: Record<string, number> = {}
  ;[...withRadius].sort((a, b) => a.r - b.r).forEach((e, i) => { inward[e.id] = i })

  const outward: Record<string, number> = {}
  ;[...withRadius].sort((a, b) => b.r - a.r).forEach((e, i) => { outward[e.id] = i })

  return { outward, inward }
}

/**
 * Variants for a scattering module. `custom` carries the per-card vector and
 * ranks so a single variant object drives every card differently.
 */
export type ScatterCustom = {
  vector: Vector
  exitRank: number
  enterRank: number
  reduced: boolean
}

export const scatterVariants: Variants = {
  enter: ({ vector, reduced }: ScatterCustom) =>
    reduced
      ? { opacity: 0 }
      : { opacity: 0, x: vector.x, y: vector.y, scale: 0.94, rotate: vector.rotate },

  settled: ({ enterRank, reduced }: ScatterCustom) => ({
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: reduced
      ? { duration: 0.2, delay: 0 }
      : {
          type: "spring",
          stiffness: 220,
          damping: 26,
          mass: 0.9,
          delay: enterDelay(enterRank),
          opacity: { duration: 0.28, delay: enterDelay(enterRank) },
        },
  }),

  exit: ({ vector, exitRank, reduced }: ScatterCustom) =>
    reduced
      ? { opacity: 0, transition: { duration: 0.15 } }
      : {
          opacity: 0,
          x: vector.x,
          y: vector.y,
          scale: 0.92,
          rotate: vector.rotate,
          transition: {
            duration: 0.42,
            delay: exitDelay(exitRank),
            ease: [0.5, 0, 0.75, 0],
            // Fade late so the card is still solid while it travels.
            opacity: { duration: 0.25, delay: exitDelay(exitRank) + 0.17 },
          },
        },
}

/**
 * The identity card doesn't scatter — it morphs between slots.
 *
 * It waits for ENTER_OFFSET before moving so the outgoing modules have visibly
 * launched and the incoming ones are arriving. Morphing at t=0 makes it look
 * like the card is collapsing on its own while the rest of the page is still
 * sitting there.
 */
export const MORPH_TRANSITION = {
  type: "spring" as const,
  stiffness: 200,
  damping: 28,
  mass: 0.8,
  delay: ENTER_OFFSET,
}
