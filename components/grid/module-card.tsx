"use client"
import type { ReactNode } from "react"
import { motion } from "motion/react"
import { gridStyle, type Placement } from "@/lib/grid"
import { scatterVariants, type ScatterCustom, type SlideCustom } from "@/lib/scatter"
import type { Variants } from "motion/react"

/**
 * One tile. Everything about how it flies is carried in `custom`, which the
 * stage derives from the tile's grid cell — nothing is authored per module.
 *
 * `@container` matters: the same module can be 5x4 on one tab and 3x2 on
 * another, so its content sizes off the card, never the viewport.
 */
export function ModuleCard({
  placement, custom, children, padded = true, variants = scatterVariants,
}: {
  placement: Placement
  /** Shape must match `variants`: scatter on desktop, slide on mobile. */
  custom: ScatterCustom | SlideCustom
  children: ReactNode
  padded?: boolean
  variants?: Variants
}) {
  return (
    <motion.div
      custom={custom}
      variants={variants}
      initial="enter"
      animate="settled"
      exit="exit"
      style={{ ...gridStyle(placement), willChange: "transform, opacity" }}
      className={`module @container [container-type:size] min-h-0 min-w-0 hover:border-fg/35 hover:shadow-glow ${padded ? "" : "p-0"}`}
    >
      {children}
    </motion.div>
  )
}
