"use client"
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { animate, motion, useDragControls, useMotionValue, type Easing, type PanInfo } from "motion/react"
import { gridStyle, type Placement } from "@/lib/grid"
import { scatterVariants, type ScatterCustom } from "@/lib/scatter"
import { cardAt, centreOf, flipFrom, impact, nextLift, onImpact, returnSlot, type Point } from "./throw"

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

  /**
   * Picked up, or in the air after a throw: the z-index it holds above the
   * grid, or null when it is back in it. A number rather than a flag so cards
   * off the grid together stack in the order they were lifted (see nextLift).
   */
  const [lift, setLift] = useState<number | null>(null)
  const lifted = lift !== null
  const setLifted = (on: boolean) => setLift(on ? nextLift() : null)
  /** Set once the pointer has actually moved, so the release isn't a click. */
  const dragged  = useRef(false)
  /** Where a thrown card is: leaving, off screen, or coming back. */
  const flight   = useRef<"out" | "away" | "back" | null>(null)

  /**
   * The shockwave's shove, kept apart from x/y/rotate.
   *
   * Those four are already driven by the scatter, the drag, the throw and the
   * swap; a shove animated on them would cancel whichever of those was running
   * — which is why cards in the air used to ignore every landing. This writes
   * the CSS `translate` and `rotate` properties instead, which compose with
   * `transform` rather than replacing it, so a card still settling from its own
   * return can be knocked by the next one to land.
   */
  const shoveX = useMotionValue(0)
  const shoveY = useMotionValue(0)
  const shoveR = useMotionValue(0)
  useEffect(() => {
    const write = () => {
      const el = ref.current
      if (!el) return
      const sx = shoveX.get(), sy = shoveY.get(), sr = shoveR.get()
      el.style.translate = sx || sy ? `${sx}px ${sy}px` : ""
      el.style.rotate    = sr ? `${sr}deg` : ""
    }
    const offs = [shoveX, shoveY, shoveR].map((v) => v.on("change", write))
    return () => offs.forEach((off) => off())
  }, [shoveX, shoveY, shoveR])
  const reduced  = custom.reduced

  /** The swap morph in flight, so a second swap can take over from it. */
  const morph = useRef<{ stop: () => void } | null>(null)

  /**
   * Morph from the box the card had to its new cell — sliding *and* resizing.
   *
   * Not a transform. A scale would stretch the contents for the length of the
   * move, and snapping the size (what this used to do) made every swap jolt:
   * the card jumped to its new size on frame one and only its position
   * travelled. Instead, the card's real box is animated, the same way the
   * identity card morphs (see rectFor() in lib/grid.ts), so its container
   * queries — and therefore its type and layout — reflow continuously with it.
   *
   * The mechanism: for the length of the move the card is absolutely
   * positioned. Its grid-row/column still apply, and an absolutely positioned
   * grid item's containing block is *its grid area* — the destination cell. So
   * left/top are offsets from that cell, running from the old box to 0, while
   * width/height run from the old size to the cell's. At t=1 the box is exactly
   * the cell, and dropping back into flow changes nothing on screen.
   */
  useLayoutEffect(() => {
    const from = flipFrom.get(id)
    const el = ref.current
    if (!from || !el) return
    flipFrom.delete(id)

    morph.current?.stop()
    const st = el.style
    const release = () => {
      st.position = st.left = st.top = st.width = st.height = ""
      delete el.dataset.morphing
    }
    release()

    // The drag's offset is now carried by the box itself.
    x.stop(); y.stop()
    x.set(0); y.set(0)
    const settleTransform = { type: "spring" as const, stiffness: 260, damping: 30 }
    animate(rotate, 0, settleTransform)
    animate(scale, 1, settleTransform)
    if (reduced) return

    // The destination cell, measured in flow, in the same coordinates as `from`.
    const to = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight }
    const apply = (t: number) => {
      st.left   = `${(from.x - to.x) * (1 - t)}px`
      st.top    = `${(from.y - to.y) * (1 - t)}px`
      st.width  = `${from.w + (to.w - from.w) * t}px`
      st.height = `${from.h + (to.h - from.h) * t}px`
    }
    st.position = "absolute"
    el.dataset.morphing = "1"
    apply(0)

    // Near-critically damped: one soft settle, no wobble. A size that
    // overshoots makes the contents reflow back and forth, which reads as
    // jitter rather than as bounce.
    morph.current = animate(0, 1, {
      type: "spring", stiffness: 170, damping: 24, mass: 1,
      onUpdate: apply,
      onComplete: release,
    })
    return () => { morph.current?.stop(); release() }
  }, [id, placement, reduced, x, y, rotate, scale])

  // The shockwave from a landing. Idle cards only — a card mid-gesture or
  // mid-flight already has somewhere to be.
  useEffect(() => {
    if (reduced) return
    return onImpact(({ x: ix, y: iy, strength, source }) => {
      const el = ref.current
      // Not while held, and not while out of sight — but a card on its way back
      // or settling in feels every landing after its own.
      if (!el || source === id || dragged.current || !throwable?.enabled) return
      if (flight.current === "out" || flight.current === "away") return
      const c = centreOf(el)
      const dx = c.x - ix
      const dy = c.y - iy
      const dist = Math.hypot(dx, dy) || 1
      const push = strength * Math.max(0, 1 - dist / 900)
      if (push < 1) return
      const delay = dist / 2200 // the wave travels
      // Out and back as one smooth breath rather than a jolt: a gentle rise to
      // the peak, then a longer ease home.
      const opts = { duration: 0.8, times: [0, 0.3, 1], ease: ["easeOut", "easeInOut"] as Easing[], delay }
      // From wherever the last shove left it, so overlapping waves add up
      // instead of each snapping the card back to rest first.
      animate(shoveX, [shoveX.get(), (dx / dist) * push, 0], opts)
      animate(shoveY, [shoveY.get(), (dy / dist) * push, 0], opts)
      animate(shoveR, [shoveR.get(), (dx / dist) * push * 0.12, 0], opts)
    })
  }, [id, reduced, throwable?.enabled, shoveX, shoveY, shoveR])

  const onPointerDown = (e: React.PointerEvent) => {
    if (!throwable?.enabled || flight.current) return
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
    flight.current = "out"
    const dir  = { x: v.x / speed, y: v.y / speed }
    const far  = Math.hypot(window.innerWidth, window.innerHeight) * 1.1
    const spin = Math.sign(v.x || 1) * Math.min(540, 160 + speed / 12)

    const out = { duration: 0.55, ease: [0.15, 0.6, 0.35, 1] as const }
    await Promise.all([
      animate(x, x.get() + dir.x * far, out),
      animate(y, y.get() + dir.y * far, out),
      animate(rotate, rotate.get() + spin, out),
    ])
    flight.current = "away"
    // Its turn to come back — after any card thrown before it.
    await new Promise((r) => setTimeout(r, returnSlot(AWAY_MS)))
    flight.current = "back"
    // Returning cards stack in the order they come back.
    setLift(nextLift())

    // It is off screen, so the leftover spin can be reset unseen. Coming back
    // it only has a slight tilt to unwind — it used to return through up to
    // half a turn, which on top of a loose spring made the landing lurch.
    rotate.set(Math.sign(dir.x || 1) * 14)
    // Near-critically damped (ζ≈0.9): it decelerates into the cell and settles
    // once, instead of overshooting and wobbling back.
    const back = { type: "spring" as const, stiffness: 120, damping: 20, mass: 1 }
    const landing = Promise.all([
      animate(x, 0, back),
      animate(y, 0, back),
      animate(rotate, 0, back),
      animate(scale, 1, back),
    ])
    // Hit the grid as the card arrives, not after the spring has fully rested.
    setTimeout(() => {
      const el = ref.current
      if (el) impact({ ...centreOf(el), strength: 18, source: id })
    }, 480)
    await landing
    flight.current = null
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
        zIndex: lift ?? undefined,
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
