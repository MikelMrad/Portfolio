"use client"
import { useEffect, useRef, useState } from "react"
import { animate, motion, useMotionValue, type MotionValue } from "motion/react"
import type { ModuleId, Placement } from "@/lib/grid"
import { flightVector, rankByRadius, type FlightGrid } from "@/lib/scatter"

/**
 * The one-time demonstration of throwable cards (see ModuleCard / throw.ts).
 *
 * Nothing on the page tells you the cards can be picked up, so once the intro
 * has settled a faint grey finger does it for you: it lifts the centre-most
 * card onto a neighbour and the two trade places, then flicks an outer card
 * off along its real flight vector and lets it spring back.
 *
 * It is a ghost, on purpose — outlines of the cards, never the cards. The real
 * layout is not touched, so interrupting it can't leave anything half-swapped,
 * and it can stop the instant the visitor does anything at all.
 *
 * Every load, since it is the only thing that tells anyone the cards move. The
 * close button in the top-right corner, Esc, or any touch of the page ends it.
 */

/**
 * From the loading screen handing over (the modules mounting) to the finger
 * appearing. Long enough for the cards to finish rising, short enough that
 * nobody has started exploring yet.
 */
const START_DELAY_MS = 500
/** How long the finger rests on the card before flinging it, so the caption can be read. */
const FLING_HOLD_MS = 550

type Rect = { x: number; y: number; w: number; h: number }
type Ghost = { x: MotionValue<number>; y: MotionValue<number>; w: MotionValue<number>; h: MotionValue<number>; r: MotionValue<number>; o: MotionValue<number> }

function rectOf(id: string): Rect | null {
  const el = document.querySelector(`[data-module="${id}"]`)
  if (!el) return null
  const b = el.getBoundingClientRect()
  return { x: b.left, y: b.top, w: b.width, h: b.height }
}
const centre = (r: Rect) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 })

function useGhost(): Ghost {
  return {
    x: useMotionValue(0), y: useMotionValue(0), w: useMotionValue(0), h: useMotionValue(0),
    r: useMotionValue(0), o: useMotionValue(0),
  }
}

function GhostBox({ g }: { g: Ghost }) {
  return (
    <motion.div
      className="absolute left-0 top-0 border border-mid/40 bg-mid/[0.05]"
      style={{ x: g.x, y: g.y, width: g.w, height: g.h, rotate: g.r, opacity: g.o }}
    />
  )
}

export function ThrowDemo({
  ready, cards, flight,
}: {
  /** Modules mounted, nothing expanded, full-size, motion allowed. Not
   *  gated on the intro transition finishing — see START_DELAY_MS. */
  ready: boolean
  cards: [ModuleId, Placement][]
  flight: FlightGrid
}) {
  const [active, setActive] = useState(false)
  const played = useRef(false)
  const cancel = useRef<(() => void) | null>(null)

  const fx = useMotionValue(0)
  const fy = useMotionValue(0)
  const fo = useMotionValue(0)
  const fs = useMotionValue(1)
  const co = useMotionValue(0)
  const [caption, setCaption] = useState("")
  /** Caption on the finger's left — for a finger near the right edge, where
   *  the caption would otherwise run off a phone screen. */
  const [captionLeft, setCaptionLeft] = useState(false)
  const a = useGhost()
  const b = useGhost()
  const c = useGhost()

  // The page stopped being in a state to demonstrate on — a tab switch, a
  // project opened. Stop rather than draw over the transition.
  useEffect(() => {
    if (!ready) cancel.current?.()
  }, [ready])

  useEffect(() => {
    if (!ready || played.current) return
    played.current = true

    let stopped = false
    const running: { stop: () => void }[] = []
    const run = <T,>(p: T & { stop: () => void }) => { running.push(p); return p }
    const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
    const alive = () => { if (stopped) throw new Error("stopped") }

    // Anything the visitor does ends it: they have found the page.
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const

    const stop = () => {
      if (stopped) return
      stopped = true
      // Removed here rather than in an effect cleanup: StrictMode's rehearsal
      // unmount would otherwise take them away while the script kept running.
      events.forEach((e) => window.removeEventListener(e, stop))
      running.forEach((r) => r.stop())
      // Fade out from wherever it got to, however it was interrupted.
      Promise.all([fo, co, a.o, b.o, c.o].map((v) => animate(v, 0, { duration: 0.25 })))
        .then(() => setActive(false))
    }
    cancel.current = stop

    events.forEach((e) => window.addEventListener(e, stop, { passive: true }))

    const place = (g: Ghost, r: Rect) => { g.x.set(r.x); g.y.set(r.y); g.w.set(r.w); g.h.set(r.h); g.r.set(0) }
    const to = (g: Ghost, r: Rect, t: object) => Promise.all([
      run(animate(g.x, r.x, t)), run(animate(g.y, r.y, t)),
      run(animate(g.w, r.w, t)), run(animate(g.h, r.h, t)),
    ])
    /** Move the fingertip to a point. */
    const point = (p: { x: number; y: number }, t: object) =>
      Promise.all([run(animate(fx, p.x, t)), run(animate(fy, p.y, t))])

    const script = async () => {
      await wait(START_DELAY_MS); alive()

      // Centre-most card, its nearest neighbour, and the outermost of the rest.
      const { inward, outward } = rankByRadius(cards, flight)
      const byIn  = [...cards].sort(([p], [q]) => inward[p] - inward[q])
      const idA   = byIn[0]?.[0]
      const rA    = idA && rectOf(idA)
      if (!idA || !rA) return stop()
      const cA    = centre(rA)
      const idB   = byIn
        .slice(1)
        .map(([id]) => ({ id, r: rectOf(id) }))
        .filter((e): e is { id: ModuleId; r: Rect } => !!e.r)
        .sort((p, q) => Math.hypot(centre(p.r).x - cA.x, centre(p.r).y - cA.y) - Math.hypot(centre(q.r).x - cA.x, centre(q.r).y - cA.y))[0]
      const outer = [...cards]
        .filter(([id]) => id !== idA && id !== idB?.id)
        .sort(([p], [q]) => outward[p] - outward[q])[0]
      if (!idB || !outer) return stop()
      const rB = idB.r
      const rC = rectOf(outer[0])
      if (!rC) return stop()

      setActive(true)

      // 1 — drift in from below and settle on the first card.
      fx.set(cA.x + 60); fy.set(window.innerHeight + 40)
      await Promise.all([
        run(animate(fo, 1, { duration: 0.4 })),
        point({ x: cA.x, y: cA.y + rA.h * 0.1 }, { duration: 0.9, ease: [0.22, 1, 0.36, 1] }),
      ]); alive()

      // 2 — press, and the card's outline lifts.
      setCaptionLeft(fx.get() > window.innerWidth - 170)
      setCaption("DRAG TO SWAP")
      place(a, rA)
      await Promise.all([
        run(animate(fs, 0.82, { duration: 0.14 })),
        run(animate(a.o, 1, { duration: 0.2 })),
        run(animate(co, 1, { duration: 0.3 })),
      ]); alive()
      await wait(120); alive()

      // 3 — carry it onto the neighbour. The outline travels with the finger,
      // centred where the card was grabbed, banking into the move.
      const grab = { x: fx.get() - rA.x, y: fy.get() - rA.y }
      const cB   = centre(rB)
      const carry = { duration: 1, ease: [0.45, 0, 0.2, 1] as const }
      const bank = Math.sign(cB.x - cA.x) * 4
      await Promise.all([
        point(cB, carry),
        run(animate(a.x, cB.x - grab.x, carry)),
        run(animate(a.y, cB.y - grab.y, carry)),
        run(animate(a.r, [0, bank, 0], carry)),
      ]); alive()

      // 4 — let go: the two outlines trade cells.
      place(b, rB)
      const slide = { type: "spring" as const, stiffness: 240, damping: 26 }
      await Promise.all([
        run(animate(fs, 1, { duration: 0.14 })),
        run(animate(b.o, 1, { duration: 0.15 })),
        to(a, rB, slide),
        to(b, rA, slide),
      ]); alive()
      await wait(350); alive()
      await Promise.all([
        run(animate(a.o, 0, { duration: 0.35 })),
        run(animate(b.o, 0, { duration: 0.35 })),
        run(animate(co, 0, { duration: 0.2 })),
      ]); alive()

      // 5 — over to the outer card for a flick.
      const cC = centre(rC)
      await point(cC, { duration: 0.8, ease: [0.45, 0, 0.2, 1] }); alive()
      setCaptionLeft(fx.get() > window.innerWidth - 170)
      setCaption("FLING TO THROW")
      place(c, rC)
      await Promise.all([
        run(animate(fs, 0.82, { duration: 0.12 })),
        run(animate(c.o, 1, { duration: 0.15 })),
        run(animate(co, 1, { duration: 0.25 })),
      ]); alive()
      await wait(FLING_HOLD_MS); alive()

      // 6 — the flick; the outline leaves spinning.
      //
      // On a desktop, along the card's real exit vector. On a phone, always
      // up and a little toward the middle: the outermost card there is usually
      // in the bottom rows, and its own vector sent the outline — and the
      // finger after it — straight off the bottom edge, so the one moment
      // worth seeing happened out of frame. Thrown upward it crosses the whole
      // screen. It also travels a little slower there, so the eye can follow it.
      const phone = window.matchMedia("(max-width: 767px)").matches
      const raw = phone
        ? { x: Math.sign(window.innerWidth / 2 - cC.x) * 0.3, y: -1 }
        : flightVector(outer[1], flight)
      const len = Math.hypot(raw.x, raw.y) || 1
      const dir = { x: raw.x / len, y: raw.y / len }
      const far = Math.hypot(window.innerWidth, window.innerHeight)
      const out = { duration: phone ? 0.75 : 0.5, ease: [0.15, 0.6, 0.35, 1] as const }
      await Promise.all([
        point({ x: cC.x + dir.x * 90, y: cC.y + dir.y * 90 }, { duration: 0.16, ease: "easeOut" }),
        run(animate(fs, 1, { duration: 0.16 })),
        run(animate(c.x, rC.x + dir.x * far, out)),
        run(animate(c.y, rC.y + dir.y * far, out)),
        run(animate(c.r, Math.sign(dir.x || 1) * 320, out)),
      ]); alive()
      await wait(380); alive()

      // 7 — and back into its cell.
      // The same return the real cards make (ModuleCard's fling): a slight
      // tilt to unwind and a near-critically damped spring, so the demo
      // promises the landing the visitor will actually get.
      c.r.set(Math.sign(dir.x || 1) * 14)
      const back = { type: "spring" as const, stiffness: 120, damping: 20 }
      await Promise.all([
        run(animate(c.x, rC.x, back)),
        run(animate(c.y, rC.y, back)),
        run(animate(c.r, 0, back)),
      ]); alive()
      await wait(300); alive()

      stop()
    }

    script().catch(() => { /* stopped mid-step */ })
    // Deliberately keyed on `ready` alone: it runs once, on the first settled
    // grid, and `cards`/`flight` are read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  if (!active) return null

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* The overlay ignores input; this is the one thing on it that doesn't.
          Its own pointerdown already ends the demo — the click is for
          keyboard users and screen readers. */}
      <motion.button
        type="button"
        onClick={() => cancel.current?.()}
        aria-label="Close the demonstration"
        className="pointer-events-auto absolute top-3 right-3 md:top-4 md:right-4 z-10 flex items-center gap-2 px-3 py-2 border border-mid/30 bg-bg/70 backdrop-blur-sm text-mid hover:text-fg hover:border-fg/60 transition-colors"
        style={{ opacity: fo }}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.22em]">SKIP DEMO</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" />
        </svg>
      </motion.button>
      <div aria-hidden>
      <GhostBox g={a} />
      <GhostBox g={b} />
      <GhostBox g={c} />

      {/* The finger. Its tip is the tracked point: the icon is 24 units with
          the tip at (8, 2), drawn at 40px. */}
      <motion.div className="absolute left-0 top-0" style={{ x: fx, y: fy, opacity: fo }}>
        <motion.svg
          width="40" height="40" viewBox="0 0 24 24" fill="none"
          className="text-mid/60 -translate-x-[13px] -translate-y-[3px] origin-[13px_3px] drop-shadow-[0_0_6px_rgba(170,170,170,0.25)]"
          style={{ scale: fs }}
          stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"
        >
          {/* Lucide "pointer" (ISC). */}
          <path d="M22 14a8 8 0 0 1-8 8" />
          <path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
          <path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" />
          <path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" />
          <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </motion.svg>
        <motion.span
          className={`absolute top-9 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.24em] text-mid/60 ${
            captionLeft ? "right-8" : "left-6"
          }`}
          style={{ opacity: co }}
        >
          {caption}
        </motion.span>
      </motion.div>
      </div>
    </div>
  )
}
