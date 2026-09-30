"use client"
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { animate, motion, useDragControls, useMotionValue, type PanInfo } from "motion/react"
import { gridStyle, type Placement } from "@/lib/grid"
import { scatterVariants, type ScatterCustom } from "@/lib/scatter"
import { cardAt, centreOf, flipFrom, impact, onImpact, type Point } from "./throw"

/** Release faster than this (px/s) and the card is thrown, not dropped. */
const FLING_SPEED = 1100
/** How long a thrown card stays gone before it comes back. */
const AWAY_MS = 420
/** Drag starts on anything but a form field — typing must still work. */
const NO_DRAG = "input,textarea,select,[contenteditable]"

export type Throwable = {
  /** Off during a transition, in an expanded view and in the scaled canvas. */
  enabled: boolean
  /** Another card is being dragged over this one. */
  target: boolean
  onHover: (target: string | null) => void
  onDrop: (target: string) => void
}

/**
 * One tile. Everything about how it flies is carried in `custom`, which the
 * stage derives from the tile's grid cell — nothing is authored per module.
 *
 * `@container` matters: the same module can be 5x4 on a desktop tab, 3x2 on
 * another and 2x4 on a phone, so its content sizes off the card, never the
 * viewport.
 *
 * It can also be picked up. `x`, `y`, `scale` and `rotate` are this card's own
 * motion values, handed to the element through `style`, so the scatter
 * variants, the drag gesture, the throw and the swap slide all drive the same
 * four numbers rather than fighting over the transform.
 */
export function ModuleCard({
  id, placement, custom, children, padded = true, throwable,
}: {
  id: string
  placement: Placement
  custom: ScatterCustom
  children: ReactNode
  padded?: boolean
  throwable?: Throwable
}) {
  const ref      = useRef<HTMLDivElement>(null)
  const x        = useMotionValue(0)
  const y        = useMotionValue(0)
  const scale    = useMotionValue(1)
  const rotate   = useMotionValue(0)
  const controls = useDragControls()

  /** Picked up, or in the air after a throw — both keep it above the grid. */
  const [lifted, setLifted] = useState(false)
  /** Set once the pointer has actually moved, so the release isn't a click. */
  const dragged  = useRef(false)
  const flying   = useRef(false)
  const reduced  = custom.reduced

  /**
   * Slide from where the card visually was to its new cell.
   *
   * The placement has already changed, so the element is in its new cell with
   * whatever transform it had. Zeroing x/y gives the cell's own centre; the
   * difference from the recorded centre is where it has to start. Size snaps —
   * the contents re-lay out once, at the new size, rather than being stretched
   * by a scale for the length of the slide — and a short scale dip covers it.
   */
  useLayoutEffect(() => {
    const from = flipFrom.get(id)
    const el = ref.current
    if (!from || !el) return
    flipFrom.delete(id)

    x.stop(); y.stop()
    x.set(0); y.set(0)
    const to = centreOf(el)
    x.set(from.x - to.x)
    y.set(from.y - to.y)
    if (reduced) { x.set(0); y.set(0); return }

    const spring = { type: "spring" as const, stiffness: 260, damping: 26, mass: 0.9 }
    animate(x, 0, spring)
    animate(y, 0, spring)
    animate(rotate, 0, spring)
    animate(scale, [0.94, 1], { duration: 0.45, ease: [0.22, 1, 0.36, 1] })
  }, [id, placement, reduced, x, y, rotate, scale])

  // The shockwave from a landing. Idle cards only — a card mid-gesture or
  // mid-flight already has somewhere to be.
  useEffect(() => {
    if (reduced) return
    return onImpact(({ x: ix, y: iy, strength, source }) => {
      const el = ref.current
      if (!el || source === id || flying.current || dragged.current || !throwable?.enabled) return
      const c = centreOf(el)
      const dx = c.x - ix
      const dy = c.y - iy
      const dist = Math.hypot(dx, dy) || 1
      const push = strength * Math.max(0, 1 - dist / 900)
      if (push < 1) return
      const delay = dist / 2200 // the wave travels
      const opts = { duration: 0.6, times: [0, 0.22, 1], ease: "easeOut" as const, delay }
      animate(x, [0, (dx / dist) * push, 0], opts)
      animate(y, [0, (dy / dist) * push, 0], opts)
      animate(rotate, [0, (dx / dist) * push * 0.12, 0], opts)
    })
  }, [id, reduced, throwable?.enabled, x, y, rotate])

  const onPointerDown = (e: React.PointerEvent) => {
    if (!throwable?.enabled || flying.current) return
    if ((e.target as HTMLElement).closest(NO_DRAG)) return
    dragged.current = false
    // Stops the browser's own image/link drag and text selection hijacking it.
    e.preventDefault()
    controls.start(e)
  }

  const onDragStart = () => {
    dragged.current = true
    setLifted(true)
    x.stop(); y.stop()
    animate(scale, 1.04, { type: "spring", stiffness: 400, damping: 25 })
  }

  const onDrag = (_: unknown, info: PanInfo) => {
    // Bank into the direction of travel, like a card held by one corner.
    const want = Math.max(-9, Math.min(9, info.velocity.x / 140))
    rotate.set(rotate.get() + (want - rotate.get()) * 0.18)
    throwable?.onHover(cardAt(info.point, id))
  }

  const settle = () => {
    const spring = { type: "spring" as const, stiffness: 300, damping: 24 }
    animate(x, 0, spring)
    animate(y, 0, spring)
    animate(rotate, 0, spring)
    animate(scale, 1, spring).then(() => setLifted(false))
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    throwable?.onHover(null)
    // The click (if any) fires synchronously after pointerup, so clear the
    // flag just after it — otherwise the card stays "dragged" and ignores
    // every shockwave until the next press.
    setTimeout(() => { dragged.current = false }, 0)
    const speed = Math.hypot(info.velocity.x, info.velocity.y)

    if (speed > FLING_SPEED && !reduced) { void fling(info.velocity, speed); return }

    const target = cardAt(info.point, id)
    if (target) {
      // The stage records both centres and swaps the placements; the layout
      // effect above then slides this card from under the pointer.
      throwable?.onDrop(target)
      animate(scale, 1, { type: "spring", stiffness: 300, damping: 24 }).then(() => setLifted(false))
      return
    }
    settle()
  }

  /**
   * Thrown: it leaves along the release velocity, spinning with it, and comes
   * back the way it went — the grid keeps its hole while it is gone. The
   * landing sends a shockwave through the other cards.
   */
  const fling = async (v: Point, speed: number) => {
    flying.current = true
    const dir  = { x: v.x / speed, y: v.y / speed }
    const far  = Math.hypot(window.innerWidth, window.innerHeight) * 1.1
    const spin = Math.sign(v.x || 1) * Math.min(540, 160 + speed / 12)

    const out = { duration: 0.55, ease: [0.15, 0.6, 0.35, 1] as const }
    await Promise.all([
      animate(x, x.get() + dir.x * far, out),
      animate(y, y.get() + dir.y * far, out),
      animate(rotate, rotate.get() + spin, out),
    ])
    await new Promise((r) => setTimeout(r, AWAY_MS))

    // Unwind the spin to the nearest upright so it doesn't come back with
    // several turns still to go.
    rotate.set(((rotate.get() % 360) + 540) % 360 - 180)
    const back = { type: "spring" as const, stiffness: 110, damping: 15, mass: 1 }
    const landing = Promise.all([
      animate(x, 0, back),
      animate(y, 0, back),
      animate(rotate, 0, back),
      animate(scale, 1, back),
    ])
    // Hit the grid as the card arrives, not after the spring has fully rested.
    setTimeout(() => {
      const el = ref.current
      if (el) impact({ ...centreOf(el), strength: 26, source: id })
    }, 420)
    await landing
    flying.current = false
    setLifted(false)
  }

  // A drag that ends over a button must not also press it.
  const onClickCapture = (e: React.MouseEvent) => {
    if (!dragged.current) return
    dragged.current = false
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <motion.div
      ref={ref}
      data-module={id}
      custom={custom}
      variants={scatterVariants}
      /* The first cards of the session rise into the boxes the boot layer drew
         for them; every card after that scatters. */
      initial={custom.intro ? "reveal" : "enter"}
      animate="settled"
      exit="exit"
      drag={!!throwable?.enabled}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      onPointerDown={onPointerDown}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      onClickCapture={onClickCapture}
      style={{
        ...gridStyle(placement),
        x, y, scale, rotate,
        willChange: "transform, opacity",
        zIndex: lifted ? 30 : undefined,
        touchAction: throwable?.enabled ? "none" : undefined,
      }}
      className={`module @container [container-type:size] min-h-0 min-w-0 hover:border-fg/35 hover:shadow-glow ${
        lifted ? "!border-fg/60 shadow-glow-lg" : ""
      } ${throwable?.target ? "!border-fg shadow-glow-lg" : ""} ${padded ? "" : "p-0"}`}
    >
      {children}
    </motion.div>
  )
}
