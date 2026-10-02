"use client"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react"
import type { ModuleId, Placement } from "@/lib/grid"
import { useContent } from "@/lib/i18n"
import { flightVector, rankByRadius, type FlightGrid } from "@/lib/scatter"

/**
 * The guided tour that plays once the intro has settled.
 *
 * A non-scrolling bento with draggable cards explains itself badly, so a faint
 * grey finger walks through it, in the order a visitor needs it:
 *
 *   1. the tabs in the dock — how to move between pages;
 *   2. tapping a card open — EXPERIENCE or a project grows to the whole grid;
 *   3. dragging one card onto another — the two trade places (ModuleCard);
 *   4. flinging a card — off along its flight vector and back (throw.ts);
 *   5. on a touch screen, shaking to reset (shake.ts).
 *
 * It is a ghost, on purpose — outlines of the cards and tabs, never the real
 * ones. Nothing it shows changes the page, so it can play over a visitor who is
 * already exploring, and stopping it can't leave anything half-done.
 *
 * Every load. Only SKIP DEMO ends it — a touch or a keypress doesn't, so the
 * tour isn't lost to the first accidental tap. A tab switch or an opened card
 * does stop it, because the outlines are drawn over this layout.
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
  ready, cards, flight, touch = false, portrait = false,
}: {
  /** Modules mounted, nothing expanded, full-size, motion allowed. Not
   *  gated on the intro transition finishing — see START_DELAY_MS. */
  ready: boolean
  cards: [ModuleId, Placement][]
  flight: FlightGrid
  /** A touch screen: tap-worded captions, and the tour ends with shake-to-reset. */
  touch?: boolean
  /**
   * The portrait grid. The fling goes up instead of along the card's vector —
   * see step 6. Changing it mid-tour (a rotation) restarts the tour on the new
   * grid, since every outline belongs to the old one.
   */
  portrait?: boolean
}) {
  const { UI } = useContent()
  const [active, setActive] = useState(false)
  const played = useRef(false)
  /** A tour is on screen (between its start and stop()). */
  const runningTour = useRef(false)
  /** Bumped to replay the tour — on rotation, see below. */
  const [replay, setReplay] = useState(0)
  /** Delay before the finger appears; longer for a replay, which has to wait
   *  for the rotation's own scatter and gather to land. */
  const startDelay = useRef(START_DELAY_MS)
  const cancel = useRef<(() => void) | null>(null)

  const fx = useMotionValue(0)
  const fy = useMotionValue(0)
  const fo = useMotionValue(0)
  const fs = useMotionValue(1)
  /** The finger's tilt, about its tip — the rock of a press. */
  const fr = useMotionValue(0)
  /** The light under the fingertip: dark until a press, then a flash that
   *  spreads and fades, like a ripple from the point of contact. */
  const ho = useMotionValue(0)
  const hs = useMotionValue(0.6)
  const co = useMotionValue(0)
  const [caption, setCaption] = useState("")
  /**
   * Where the caption sits, kept fully on screen.
   *
   * It used to pick a side from a fixed guess — flip left within 170px of the
   * right edge — but captions run from ~120px to ~230px and differ again in
   * Arabic, so on a phone the longer ones ran off the right edge. Now its real
   * width is measured and its x is worked out from the finger every frame:
   * beside the finger when it fits, the other side when it doesn't, clamped to
   * the screen either way.
   */
  const captionRef = useRef<HTMLSpanElement>(null)
  const capW = useMotionValue(0)
  const capX = useTransform([fx, capW], ([x, w]: number[]) => {
    const vw = window.innerWidth, edge = 8, gap = 28
    const beside = x + gap + w <= vw - edge ? x + gap : x - gap - w
    return Math.min(Math.max(beside, edge), Math.max(edge, vw - edge - w))
  })
  // Measured after each caption change, before it paints.
  useLayoutEffect(() => {
    if (captionRef.current) capW.set(captionRef.current.offsetWidth)
  })
  /** Caption above the fingertip — for the dock, at the bottom of the screen. */
  const [captionAbove, setCaptionAbove] = useState(false)
  // The shake step: a phone glyph, and every card's outline shaking with it.
  const po = useMotionValue(0)
  const pr = useMotionValue(0)
  const go = useMotionValue(0)
  const gx = useMotionValue(0)
  const [all, setAll] = useState<Rect[]>([])
  const a = useGhost()
  const b = useGhost()
  const c = useGhost()

  // The page stopped being in a state to demonstrate on — a tab switch, a
  // project opened. Stop rather than draw over the transition.
  useEffect(() => {
    if (!ready) cancel.current?.()
  }, [ready])

  /**
   * Rotation mid-tour: the outlines it was drawing belong to the previous grid,
   * so stop and play it again on the new one. A tour that already finished, or
   * was skipped, stays finished.
   */
  const lastPortrait = useRef(portrait)
  useEffect(() => {
    if (lastPortrait.current === portrait) return
    lastPortrait.current = portrait
    if (!runningTour.current) return
    cancel.current?.()
    played.current = false
    startDelay.current = 1100
    setReplay((n) => n + 1)
  }, [portrait])

  useEffect(() => {
    if (!ready || played.current) return
    played.current = true
    runningTour.current = true

    let stopped = false
    const running: { stop: () => void }[] = []
    const run = <T,>(p: T & { stop: () => void }) => { running.push(p); return p }
    const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
    const alive = () => { if (stopped) throw new Error("stopped") }

    const stop = () => {
      if (stopped) return
      stopped = true
      runningTour.current = false
      running.forEach((r) => r.stop())
      // Fade out from wherever it got to, however it was interrupted.
      Promise.all([fo, co, po, go, a.o, b.o, c.o].map((v) => animate(v, 0, { duration: 0.25 })))
        .then(() => setActive(false))
    }
    cancel.current = stop

    const place = (g: Ghost, r: Rect) => { g.x.set(r.x); g.y.set(r.y); g.w.set(r.w); g.h.set(r.h); g.r.set(0) }
    const to = (g: Ghost, r: Rect, t: object) => Promise.all([
      run(animate(g.x, r.x, t)), run(animate(g.y, r.y, t)),
      run(animate(g.w, r.w, t)), run(animate(g.h, r.h, t)),
    ])
    /** Move the fingertip to a point. */
    const point = (p: { x: number; y: number }, t: object) =>
      Promise.all([run(animate(fx, p.x, t)), run(animate(fy, p.y, t))])

    const script = async () => {
      await wait(startDelay.current); alive()

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
      // Captions and the shake step follow the input; the fling's direction
      // follows the grid (see the props).
      const phone = portrait
      const glide = { duration: 0.8, ease: [0.45, 0, 0.2, 1] as const }
      /**
       * Appear mid-screen, hold a beat, then travel. Starting where the eye
       * already is — the middle — and moving from there is what gets the
       * finger noticed; appearing at its destination, it was missed even by
       * someone who knew where to look.
       */
      const enter = async (dest: { x: number; y: number }) => {
        fx.set(window.innerWidth / 2); fy.set(window.innerHeight / 2)
        await run(animate(fo, 1, { duration: 0.35 })); alive()
        await wait(380); alive()
        await point(dest, { duration: 0.95, ease: [0.45, 0, 0.2, 1] }); alive()
      }
      /** The touch itself: the light flashes out from the tip, the hand dips
       *  and rocks. */
      const flash = () => Promise.all([
        run(animate(ho, [0, 1, 0], { duration: 0.65, times: [0, 0.18, 1], ease: "easeOut" })),
        run(animate(hs, [0.5, 1.7], { duration: 0.65, ease: "easeOut" })),
      ])
      /** A tap: press and let go. */
      const click = () => Promise.all([
        flash(),
        run(animate(fr, [0, 10, 0], { duration: 0.34, ease: "easeInOut" })),
        run(animate(fs, [1, 0.84, 1], { duration: 0.3, ease: "easeInOut" })),
      ])
      /** Press and hold — a grab. The hand stays tilted until release(). */
      const press = () => Promise.all([
        flash(),
        run(animate(fr, 10, { duration: 0.16, ease: "easeOut" })),
        run(animate(fs, 0.84, { duration: 0.14 })),
      ])
      const release = (duration = 0.16) => Promise.all([
        run(animate(fr, 0, { duration, ease: "easeOut" })),
        run(animate(fs, 1, { duration })),
      ])
      const say = (text: string, above = false) => {
        setCaptionAbove(above)
        setCaption(text)
      }

      // ── Tour 1 — the tabs. Ghost outlines only: really switching would
      //    scatter the grid this tour is drawn over.
      const tabs = [...document.querySelectorAll<HTMLElement>("nav button[data-tab]")]
        .map((b) => {
          const r = b.getBoundingClientRect()
          return { x: r.left - 4, y: r.top + 2, w: r.width + 8, h: r.height - 4 }
        })
      if (tabs.length) {
        // From the middle of the screen, down to the first tab.
        await enter(centre(tabs[0]))
        place(a, tabs[0])
        say(touch ? UI.demo.tabsPhone : UI.demo.tabsDesktop, true)
        await Promise.all([run(animate(a.o, 1, { duration: 0.2 })), run(animate(co, 1, { duration: 0.3 })), click()]); alive()
        await wait(200); alive()
        // Along the dock, the outline riding from tab to tab with the finger.
        const hop = { duration: 0.42, ease: [0.45, 0, 0.2, 1] as const }
        for (const t of tabs.slice(1)) {
          await Promise.all([point(centre(t), hop), to(a, t, hop)]); alive()
          await click(); alive()
        }
        await wait(350); alive()
        await Promise.all([run(animate(a.o, 0, { duration: 0.25 })), run(animate(co, 0, { duration: 0.2 }))]); alive()
      }

      // ── Tour 2 — opening a card. The outline grows to the whole grid, the
      //    way the real one expands, holds, and shrinks back.
      const openable = cards.find(([id]) => id === "experience" || id.startsWith("project-"))?.[0]
      const rO = openable && rectOf(openable)
      const boxes = [...document.querySelectorAll("[data-module]")].map((el) => el.getBoundingClientRect())
      if (rO && boxes.length) {
        const whole = {
          x: Math.min(...boxes.map((b) => b.left)),
          y: Math.min(...boxes.map((b) => b.top)),
          w: Math.max(...boxes.map((b) => b.right)) - Math.min(...boxes.map((b) => b.left)),
          h: Math.max(...boxes.map((b) => b.bottom)) - Math.min(...boxes.map((b) => b.top)),
        }
        if (fo.get() < 0.5) await enter(centre(rO))
        else { await point(centre(rO), glide); alive() }
        say(UI.demo.open)
        place(b, rO)
        await Promise.all([
          click(),
          run(animate(co, 1, { duration: 0.3 })),
          run(animate(b.o, 1, { duration: 0.2 })),
        ]); alive()
        const grow = { type: "spring" as const, stiffness: 170, damping: 24 }
        await to(b, whole, grow); alive()
        await wait(550); alive()
        await to(b, rO, grow); alive()
        await Promise.all([run(animate(b.o, 0, { duration: 0.25 })), run(animate(co, 0, { duration: 0.2 }))]); alive()
      }

      // ── Tour 3 — onto the first card for the swap.
      const onA = { x: cA.x, y: cA.y + rA.h * 0.1 }
      if (fo.get() < 0.5) await enter(onA)
      else { await point(onA, glide); alive() }

      // 2 — press, and the card's outline lifts.
      say(UI.demo.swap)
      place(a, rA)
      await Promise.all([
        press(),
        run(animate(a.o, 1, { duration: 0.2 })),
        run(animate(co, 1, { duration: 0.3 })),
      ]); alive()

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
        release(),
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
      say(UI.demo.fling)
      place(c, rC)
      await Promise.all([
        press(),
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
      const raw = phone
        ? { x: Math.sign(window.innerWidth / 2 - cC.x) * 0.3, y: -1 }
        : flightVector(outer[1], flight)
      const len = Math.hypot(raw.x, raw.y) || 1
      const dir = { x: raw.x / len, y: raw.y / len }
      const far = Math.hypot(window.innerWidth, window.innerHeight)
      const out = { duration: phone ? 0.75 : 0.5, ease: [0.15, 0.6, 0.35, 1] as const }
      await Promise.all([
        point({ x: cC.x + dir.x * 90, y: cC.y + dir.y * 90 }, { duration: 0.16, ease: "easeOut" }),
        release(),
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

      // 8 — phones only: shake to reset. The finger has nothing to point at
      // for this one, so it gives way to a phone glyph mid-screen, and every
      // card's outline shakes in time with it.
      if (touch) {
        setAll(cards.map(([id]) => rectOf(id)).filter((r): r is Rect => !!r))
        setCaption("")
        await Promise.all([
          run(animate(fo, 0, { duration: 0.25 })),
          run(animate(po, 1, { duration: 0.3 })),
          run(animate(go, 1, { duration: 0.3 })),
        ]); alive()
        const shakeOnce = { duration: 0.75, ease: "easeInOut" as const }
        for (let i = 0; i < 2; i++) {
          await Promise.all([
            run(animate(pr, [0, -16, 16, -16, 16, -8, 0], shakeOnce)),
            run(animate(gx, [0, -7, 7, -7, 7, -3, 0], shakeOnce)),
          ]); alive()
          await wait(260); alive()
        }
        await wait(500); alive()
      }

      stop()
    }

    script().catch(() => { /* stopped mid-step */ })
    // Deliberately keyed on `ready` and `replay` alone: it runs once, on the
    // first settled grid (and again after a rotation), reading `cards`,
    // `flight` and the rest at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, replay])

  if (!active) return null

  return (
    // Above the dock (z-50): the tour's first stop is the tabs, and beneath
    // the dock the finger and outlines were simply hidden.
    <div className="fixed inset-0 z-[55] pointer-events-none">
      {/* The overlay ignores input; this is the one thing on it that doesn't.
          Its own pointerdown already ends the demo — the click is for
          keyboard users and screen readers. */}
      <motion.button
        type="button"
        onClick={() => cancel.current?.()}
        aria-label={UI.demo.skipAria}
        className="pointer-events-auto absolute top-3 right-3 md:top-4 md:right-4 z-10 flex items-center gap-2 px-3 py-2 border border-fg/50 bg-bg/80 backdrop-blur-sm text-fg shadow-glow-sm hover:border-fg hover:shadow-glow transition-[border-color,box-shadow] duration-300 [text-shadow:0_0_8px_rgba(240,240,240,0.5)]"
        style={{ opacity: fo }}
      >
        <span className="font-mono text-[9px] uppercase tracking-[0.22em]">{UI.demo.skip}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" />
        </svg>
      </motion.button>
      <div aria-hidden>
      {/* Shake-to-reset: every card's outline, moving as one. */}
      <motion.div className="absolute inset-0" style={{ x: gx, opacity: go }}>
        {all.map((r, i) => (
          <div
            key={i}
            className="absolute border border-mid/40 bg-mid/[0.05]"
            style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
          />
        ))}
      </motion.div>
      <motion.div
        className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4"
        style={{ opacity: po }}
      >
        <motion.svg
          width="46" height="76" viewBox="0 0 46 76" fill="none"
          className="text-mid/70 drop-shadow-[0_0_8px_rgba(170,170,170,0.3)]"
          style={{ rotate: pr }}
          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"
        >
          <rect x="2" y="2" width="42" height="72" rx="8" />
          <path d="M18 8h10" />
          <circle cx="23" cy="66" r="2.5" />
        </motion.svg>
        {/* Backed: mid-screen it lands on top of card copy. */}
        <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-fg/90 whitespace-nowrap px-2.5 py-1.5 bg-bg/85 [text-shadow:0_0_8px_rgba(240,240,240,0.45)]">
          {UI.demo.shake}
        </span>
      </motion.div>

      <GhostBox g={a} />
      <GhostBox g={b} />
      <GhostBox g={c} />

      {/* The finger. Its tip is the tracked point: the icon is 24 units with
          the tip at (8, 2), drawn at 40px. */}
      <motion.div className="absolute left-0 top-0" style={{ x: fx, y: fy, opacity: fo }}>
        {/* The light under the fingertip. Dark between touches; each press
            flashes it on and spreads it out as it fades (see flash()). */}
        <motion.span
          className="absolute -left-7 -top-7 w-14 h-14 rounded-full pointer-events-none"
          style={{
            opacity: ho,
            scale: hs,
            background: "radial-gradient(circle, rgba(240,240,240,0.55) 0%, rgba(240,240,240,0.18) 42%, transparent 70%)",
          }}
        />
        <motion.svg
          width="40" height="40" viewBox="0 0 24 24" fill="none"
          className="text-fg/85 -translate-x-[13px] -translate-y-[3px] origin-[13px_3px] [filter:drop-shadow(0_0_4px_rgba(240,240,240,0.75))_drop-shadow(0_0_14px_rgba(240,240,240,0.35))]"
          style={{ scale: fs, rotate: fr }}
          stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"
        >
          {/* Lucide "pointer" (ISC). */}
          <path d="M22 14a8 8 0 0 1-8 8" />
          <path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
          <path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" />
          <path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" />
          <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </motion.svg>
      </motion.div>

      {/* The caption: follows the finger vertically, placed horizontally by
          capX so it never leaves the screen. */}
      <motion.div className="absolute left-0 top-0" style={{ x: capX, y: fy, opacity: co }}>
        <span
          ref={captionRef}
          // Near-white and lit like the finger it belongs to, on a light dark
          // backing so it still reads where it crosses card copy.
          className={`absolute left-0 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.24em] text-fg/90 px-1.5 py-0.5 bg-bg/60 [text-shadow:0_0_8px_rgba(240,240,240,0.45)] ${
            // Clear of what the finger is touching: above, it sits over the
            // dock's top edge rather than across the tab labels.
            captionAbove ? "-top-14" : "top-11"
          }`}
        >
          {caption}
        </span>
      </motion.div>
      </div>
    </div>
  )
}
