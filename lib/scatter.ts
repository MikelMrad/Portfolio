/**
 * The scatter / gather engine.
 *
 * Nothing here is hand-authored per card. A module's exit direction, its
 * rotation and its place in the stagger order are all derived from where it
 * sits on the grid, which is why adding a module costs nothing.
 */

import type { Variants } from "motion/react"
import { placementCenter, type Placement } from "./grid"

/** How far offscreen a card travels. Beyond the viewport in both axes. */
const TRAVEL_X = 1400
const TRAVEL_Y = 1000

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
export function flightVector(p: Placement): Vector {
  const { cx, cy } = placementCenter(p)
  const dx = cx - 0.5
  const dy = cy - 0.5

  // A module dead-centre has no direction of its own — send it down.
  const radius = Math.hypot(dx, dy)
  const angle  = radius < 0.01 ? Math.PI / 2 : snap8(Math.atan2(dy, dx))

  return {
    x: Math.cos(angle) * TRAVEL_X,
    y: Math.sin(angle) * TRAVEL_Y,
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
): { outward: Record<string, number>; inward: Record<string, number> } {
  const withRadius = entries.map(([id, p]) => ({ id, r: flightVector(p).radius }))

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

// ── Mobile ────────────────────────────────────────────────────────────────────

/**
 * The scatter engine degenerates at one column: every cell shares the grid's
 * horizontal centre, so `dx` is 0 and all rows fly straight up or down — each
 * one tilted, each one travelling 1000px. On full-width bars that reads as
 * cheap rather than choreographed.
 *
 * Mobile navigation is lateral (tab to tab) or a drill-in (row to section), so
 * it gets a push/pop instead: rows leave one way, the next screen arrives from
 * the other. No rotation, no scaling, ordered top to bottom.
 */

/** A little over a phone width — far enough to clear, near enough to stay quick. */
const SLIDE = 460

const SLIDE_EXIT_STAGGER  = 0.028
const SLIDE_ENTER_STAGGER = 0.034
const SLIDE_ENTER_OFFSET  = 0.13

/**
 * Direction of travel, read at the moment a variant is resolved.
 *
 * It deliberately isn't part of `custom`: an exiting child keeps the props from
 * its last render, which still holds the *previous* direction, so a "back"
 * navigation would slide the outgoing screen the same way as a "forward" one.
 * Variants resolve after the handler has run, so reading it here is correct for
 * entering and exiting children alike — and unlike AnimatePresence's `custom`
 * override, it leaves each child's own rank intact for the stagger.
 */
export const slideDirection = { current: 1 as 1 | -1 }

export type SlideCustom = {
  /** Row order, top to bottom. Sequential reads as deliberate; radius doesn't. */
  rank: number
  reduced: boolean
}

export const slideVariants: Variants = {
  enter: ({ reduced }: SlideCustom) =>
    reduced
      ? { opacity: 0, x: 0, y: 0, rotate: 0, scale: 1 }
      : { opacity: 0, x: slideDirection.current * SLIDE, y: 0, rotate: 0, scale: 1 },

  settled: ({ rank, reduced }: SlideCustom) => {
    const delay = SLIDE_ENTER_OFFSET + rank * SLIDE_ENTER_STAGGER
    return {
      opacity: 1,
      x: 0,
      // Reset every axis the scatter variants can touch — the first paint may
      // have started this card under them.
      y: 0,
      rotate: 0,
      scale: 1,
      transition: reduced
        ? { duration: 0.2 }
        : {
            // Firm enough not to wobble — a list of bars bouncing looks tacky.
            type: "spring",
            stiffness: 340,
            damping: 36,
            mass: 0.7,
            delay,
            opacity: { duration: 0.2, delay },
          },
    }
  },

  exit: ({ rank, reduced }: SlideCustom) => {
    const delay = rank * SLIDE_EXIT_STAGGER
    return reduced
      ? { opacity: 0, y: 0, rotate: 0, scale: 1, transition: { duration: 0.15 } }
      : {
          opacity: 0,
          x: -slideDirection.current * SLIDE,
          y: 0,
          rotate: 0,
          scale: 1,
          transition: {
            duration: 0.28,
            delay,
            ease: [0.4, 0, 1, 1],
            opacity: { duration: 0.2, delay: delay + 0.06 },
          },
        }
  },
}
