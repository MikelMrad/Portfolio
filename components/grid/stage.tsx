"use client"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type MotionValue } from "motion/react"

import {
  GRID_COLS, GRID_ROWS, LAYOUTS, MOBILE_COLS, MOBILE_LAYOUTS, MOBILE_ROWS, TABS,
  gridStyle, rectFor, type GridGeom, type ModuleId, type Placement, type TabId,
} from "@/lib/grid"
import {
  DESKTOP_FLIGHT, MOBILE_FLIGHT, MORPH_TRANSITION, flightVector, rankByRadius,
} from "@/lib/scatter"
import { PROJECTS, type Content } from "@/lib/content"
import { CONTENT, LangProvider, setLang, useLangStore } from "@/lib/i18n"

import { ModuleCard } from "./module-card"
import { NavDock } from "./nav-dock"
import { PinchPan } from "./pinch-pan"
import { captureBoxes } from "./throw"
import { armMotionPermission, useShake } from "./shake"
import { ThrowDemo } from "./throw-demo"
import { Cursor } from "@/components/ui/cursor"
import { CompactCard, ZoomNav } from "@/components/ui/bits"
import { Identity } from "@/components/modules/identity"
import { Experience, ExperienceDetail, Latest, Location, Stats, StatsDetail, Status } from "@/components/modules/index-modules"
import { CvCard, DetailNav, ProjectCard, ProjectDetail, WorkMeta } from "@/components/modules/work-modules"
import { Category, Education, TechCount } from "@/components/modules/stack-modules"
import { ContactForm, EmailCard, Footer, Headline, Socials } from "@/components/modules/contact-modules"

/**
 * The one WebGL module, kept out of the first load.
 *
 * three.js and @react-three/fiber are ~290KB gzipped — more than half of what
 * the page used to ship — for a single 2x2 card that only exists on INDEX. A
 * static import put that in the critical path of all four tabs: /contact
 * downloaded the whole renderer to draw a form. Imported this way it never
 * loads on the other three, and on INDEX it arrives after the grid is up.
 *
 * `ssr: false` because it is a canvas either way — there is nothing for the
 * server to render, and prerendering it only puts the module back in the graph.
 */
const Signature = dynamic(() => import("@/components/three/signature").then((m) => m.Signature), {
  ssr: false,
})

/**
 * An expanded project is just another layout. Opening one scatters the grid and
 * gathers the detail in — the exact same engine, no second mechanic. Each grid
 * gets its own shape of it: a sidebar column on a desktop, a bar under the
 * detail on a phone, both driven by the same DetailNav.
 */
const DETAIL_LAYOUT: Partial<Record<ModuleId, Placement>> = {
  identity:         { col: [1, 3], row: [1, 2] },
  "detail-nav":     { col: [1, 3], row: [3, 6] },
  "project-detail": { col: [4, 9], row: [1, 8] },
}

const MOBILE_DETAIL_LAYOUT: Partial<Record<ModuleId, Placement>> = {
  identity:         { col: [1, 4], row: [1, 2] },
  "project-detail": { col: [1, 4], row: [3, 9] },
  "detail-nav":     { col: [1, 4], row: [12, 1] },
}

/** A zoomed module reuses the detail shape, whichever grid it lands on. */
const zoomLayout = (id: ModuleId): Partial<Record<ModuleId, Placement>> => ({
  identity:   { col: [1, 3], row: [1, 2] },
  "zoom-nav": { col: [1, 3], row: [3, 6] },
  [id]:       { col: [4, 9], row: [1, 8] },
})

const mobileZoomLayout = (id: ModuleId): Partial<Record<ModuleId, Placement>> => ({
  identity:   { col: [1, 4], row: [1, 2] },
  [id]:       { col: [1, 4], row: [3, 9] },
  "zoom-nav": { col: [1, 4], row: [12, 1] },
})

/*
 * Any module can expand into the whole grid (`zoom`). EXPERIENCE does it from
 * its normal card; every other module only from its compact face, when it has
 * been swapped somewhere too small — see isCramped().
 */

/** Size-agnostic modules: a canvas, and a one-line colophon. Never compacted. */
const ALWAYS_FITS: ModuleId[] = ["signature", "footer"]

/**
 * Has this card been swapped into a cell too small for what it holds?
 *
 * Measured against the cell it was composed for on this grid, not in pixels:
 * each layout was tuned so its module fits, so the composed cell is the real
 * minimum. Allowing 20% slack lets near-equal slots trade freely (a 5-wide and
 * a 4-wide project card), while anything genuinely smaller — EXPERIENCE's 4x4
 * block dropped into a 2x2 on a phone — shows its title instead.
 */
function isCramped(id: ModuleId, now: Placement, native: Placement | undefined) {
  if (!native || ALWAYS_FITS.includes(id)) return false
  return now.col[1] < native.col[1] * 0.8 || now.row[1] < native.row[1] * 0.8
}

function titleOf(id: ModuleId, t: Content): string {
  if (id.startsWith("project-0")) return t.PROJECTS.find((p) => p.num === id.slice(-2))?.title ?? id
  if (id.startsWith("cat-")) {
    return t.STACK.find((c) => c.id === id.slice(4))?.label.replace(" & ", " &\n") ?? id
  }
  return t.MODULE_TITLES[id] ?? id.toUpperCase()
}

/** How long the scatter runs end to end. Used to park the WebGL loop. */
const TRANSITION_MS = 950

/**
 * The boot drawing paces itself against the load rather than against a clock.
 *
 * It starts slow — `--boot-draw` and STAGGER_MS put a full tab at ~2.6s — so
 * that on a phone it is still drawing when the JS lands. The moment the app is
 * ready this speeds it up to cover whatever is left in BOOT_FINISH_MS, so the
 * last line closes as the modules arrive instead of the viewer watching a
 * finished wireframe wait for them. BOOT_MIN_MS is the other end of it: a warm
 * desktop load resolves in a few hundred ms, and snapping the drawing shut that
 * fast reads as a flicker rather than as a drawing.
 */
const BOOT_FINISH_MS = 300
const BOOT_MIN_MS    = 700

/**
 * How far before the last line lands the modules start arriving.
 *
 * The same trick the scatter plays with ENTER_OFFSET: overlapping the two reads
 * as one motion, and waiting for the drawing to be strictly finished leaves a
 * beat where the wireframe is complete and empty. By the time the final stroke
 * closes, the content is already up inside it.
 */
const BOOT_OVERLAP_MS = 180

/**
 * When the grid is the portrait 4x12 — decided by *shape*, not width.
 *
 * It used to be width alone (under 768px), which got two devices wrong. An
 * iPad held upright is 768-1024px wide and much taller than wide, and got the
 * 16:9 desktop grid squeezed into a portrait screen. And a landscape phone
 * under 768px wide (an SE, 667x375) was forced into the scaled desktop canvas,
 * where nothing can be dragged, thrown or shaken.
 *
 * Now: any screen taller than 5:4 gets the portrait grid — phones and tablets
 * held upright, at any width. The narrow-window clause keeps a slim desktop
 * browser window on it too, but not a landscape phone, which is too short for
 * twelve rows (~18px each) and gets the real desktop grid instead.
 *
 * MUST match `.boot` in globals.css, which draws the grid before this runs.
 */
const PORTRAIT_Q = "(max-aspect-ratio: 4/5), (max-width: 767px) and (min-height: 541px)"
/**
 * Touch, as a separate question from layout. Shake, the shake step of the
 * tour and tap-worded captions follow the finger, not the grid: a landscape
 * phone and an iPad are touch devices on the desktop grid.
 */
const TOUCH_Q = "(pointer: coarse)"

/** The window the desktop grid is composed for; what the scaled view shows. */
const DESKTOP_W = 1440
const DESKTOP_H = 900

/**
 * Which grid to draw, and whether that's been decided yet.
 *
 * The server can't know the viewport, so the SSR markup is always the desktop
 * grid. On a fast client the effect below resolves before the first paint and
 * nobody notices — but on a phone, hydration doesn't beat the paint, so the
 * desktop 12-column layout renders, reflows, and lands on the portrait one.
 * `resolved` lets the stage stay hidden until the answer is in.
 */
function useViewportMode() {
  const [mode, setMode] = useState({ portrait: false, touch: false, resolved: false })
  useLayoutEffect(() => {
    const pq = window.matchMedia(PORTRAIT_Q)
    const tq = window.matchMedia(TOUCH_Q)
    const sync = () => setMode({ portrait: pq.matches, touch: tq.matches, resolved: true })
    sync()
    // Fires on rotation: the grid switches, with a transition (see below).
    pq.addEventListener("change", sync)
    tq.addEventListener("change", sync)
    return () => {
      pq.removeEventListener("change", sync)
      tq.removeEventListener("change", sync)
    }
  }, [])
  return mode
}

/** Animation times are CSSNumberish — a number in every browser that matters,
 *  a CSSUnitValue in principle. */
function msOf(v: CSSNumberish | null | undefined): number {
  if (typeof v === "number") return v
  if (v && typeof v === "object" && "value" in v) return Number((v as { value: number }).value)
  return 0
}

const pathFor  = (t: TabId) => (t === "index" ? "/" : `/${t}`)
const tabOfPath = (p: string): TabId => {
  const seg = p.replace(/^\/+|\/+$/g, "")
  return TABS.find((t) => t.id === seg)?.id ?? "index"
}

export function Stage({ initialTab = "index" }: { initialTab?: TabId }) {
  const [tab, setTab]       = useState<TabId>(initialTab)
  const [open, setOpen]     = useState<string | null>(null)
  const [busy, setBusy]     = useState(true) // true on first paint for the intro gather
  /**
   * The boot drawing has finished and the modules may appear.
   *
   * This gates the mount rather than just hiding something, because the boot
   * layer is a line drawing — there is no fill to hide behind, so a module that
   * mounted early would simply show through its own outline.
   */
  const [booted, setBooted] = useState(false)
  /** First mount of the session: the cards rise in place instead of scattering. */
  const [intro, setIntro]   = useState(true)
  const [zoom, setZoom]     = useState<ModuleId | null>(null)
  /**
   * Rearrangements, per grid and tab. Dropping one card on another swaps their
   * placements here, and `activeMap` reads through it — so a swapped card also
   * *scatters* from its new cell, because the flight is derived from the cell.
   * Session only: the boot drawing is server-rendered from the untouched maps,
   * so a persisted arrangement would draw one layout and mount another.
   */
  const [swaps, setSwaps]   = useState<Record<string, Partial<Record<ModuleId, Placement>>>>({})
  /**
   * Bumped by a shake. It is part of every card's key, so a shake remounts the
   * whole set: the cards scatter out and gather back in — the same transition
   * as a tab switch, landing on the tab's original layout.
   */
  const [shakeGen, setShakeGen] = useState(0)
  /** The card another card is currently being dragged over. */
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const { portrait, touch, resolved } = useViewportMode()

  /**
   * The portrait grid's escape hatch: draw the real 12x8 at its full size and
   * scale it to fit, then let the viewer drag and pinch into it. Opt-in only —
   * a landscape phone gets the real desktop grid at real size instead, so
   * everything on it still works.
   */
  const [desktopView, setDesktopView] = useState(false)
  const scaled    = portrait && desktopView
  const phoneGrid = portrait && !scaled

  const cols   = phoneGrid ? MOBILE_COLS : GRID_COLS
  const rows   = phoneGrid ? MOBILE_ROWS : GRID_ROWS
  /**
   * English or Arabic — see lib/i18n.tsx. The language is on <html>, where it
   * also sets `dir`, so the grid and every logical property mirror in CSS. Only
   * what is positioned by hand needs telling: the identity card's pixel box
   * (rectFor) and the flight headings (FlightGrid.rtl).
   */
  const lang = useLangStore()
  const rtl  = lang === "ar"
  const t    = CONTENT[lang]
  const flight = useMemo(
    () => ({ ...(phoneGrid ? MOBILE_FLIGHT : DESKTOP_FLIGHT), rtl }),
    [phoneGrid, rtl],
  )

  const reduced             = !!useReducedMotion()
  const gridRef             = useRef<HTMLDivElement>(null)
  const roRef               = useRef<ResizeObserver | null>(null)
  const [geom, setGeom]     = useState<GridGeom | null>(null)
  /**
   * The same geometry, written during the measuring effect below.
   *
   * State lands one render late, and there is one moment where that matters:
   * switching between the two grids changes the grid's size and the identity
   * card's placement in the *same* commit. Reading `geom` there gives the
   * previous grid's cell size against the next grid's placement — the card
   * springs to a rect that belongs to neither. Layout effects run in
   * declaration order, so this ref is already correct when the identity effect
   * below reads it.
   */
  const geomRef             = useRef<GridGeom | null>(null)

  // The identity card's box, in pixels. These are always set before paint, so
  // the card never renders without dimensions (animating `left/top/width/height`
  // via the `animate` prop collapses it to 0 on the first frame instead).
  const mLeft = useMotionValue(0)
  const mTop  = useMotionValue(0)
  const mW    = useMotionValue(0)
  const mH    = useMotionValue(0)
  const lastPlacement = useRef<Placement | null | undefined>(null)
  const lastRtl       = useRef(false)
  /** The rect the card is currently headed for, so an unchanged one is a no-op
   *  rather than a set() that the running spring immediately overwrites. */
  const lastRect      = useRef<{ l: number; t: number; w: number; h: number } | null>(null)
  const running       = useRef<{ stop: () => void }[]>([])
  const busyTimer           = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  /** Every state change that reshuffles the grid goes through here. */
  const beginTransition = useCallback(() => {
    setBusy(true)
    // Whatever mounts from here on scatters. Flipping it at the start of the
    // first transition rather than on a timer means nothing re-renders the
    // cards mid-reveal.
    setIntro(false)
    clearTimeout(busyTimer.current)
    busyTimer.current = setTimeout(() => setBusy(false), reduced ? 200 : TRANSITION_MS)
  }, [reduced])

  // `busy` initialises to true so the intro gather is already covered; this only
  // schedules its release, from the moment the modules actually mount rather
  // than from first paint — they now wait for the boot drawing. Calling
  // beginTransition() here would setState synchronously in an effect body and
  // cascade a render.
  useEffect(() => {
    if (!booted) return
    busyTimer.current = setTimeout(() => setBusy(false), reduced ? 200 : TRANSITION_MS)
    return () => clearTimeout(busyTimer.current)
  }, [booted, reduced])

  /**
   * Hand the boot drawing over to the real grid.
   *
   * Two conditions, and it is the later of them: `resolved` (hydration has run,
   * so the modules know which grid they are on) and the drawing having closed
   * its last box — which the drawing itself reports, rather than a duration
   * copied out of the stylesheet. That matters twice over: the boxes are the
   * tab's own modules, so the drawing is as long as that layout is, and CSS
   * animations start at first paint while `performance.now()` counts from
   * navigation. A constant would cut a line off mid-stroke on one load and
   * leave a finished wireframe sitting there on the next.
   *
   * The attribute on <html> is what starts the outline's fade — the layer it
   * drives is server-rendered markup this component doesn't own, see
   * components/grid/grid-boot.tsx — and `booted` mounts the modules into it on
   * the same tick, so the line hands its box to a real border.
   */
  useEffect(() => {
    if (!resolved) return
    let settled = false
    const hand = () => {
      if (settled) return
      settled = true
      document.documentElement.dataset.booted = "1"
      setBooted(true)
    }

    // Empty under reduced motion, where the global rule in globals.css has
    // already collapsed every duration — nothing to wait for.
    const drawing = document.querySelector(".boot")?.getAnimations({ subtree: true }) ?? []
    if (drawing.length === 0) { hand(); return }

    // Close it. Every box shares a start, so they share a currentTime; the end
    // comes off the animations themselves rather than the stylesheet, because
    // how long the drawing is depends on how many modules this tab has.
    const at   = Math.max(...drawing.map((a) => msOf(a.currentTime)))
    const ends = Math.max(...drawing.map((a) => msOf(a.effect?.getComputedTiming().endTime)))
    const left = Math.max(0, ends - at)

    // The drawing outlasted the load — it was the app that was slow, and the
    // wireframe is already sitting there finished. Nothing to wait for.
    if (left === 0) { hand(); return }

    // Never slower than it was already going.
    const rate = Math.max(1, left / Math.max(BOOT_FINISH_MS, BOOT_MIN_MS - at))
    drawing.forEach((a) => { a.playbackRate = rate })

    // Deliberately a timer rather than `animation.finished`: this has to fire
    // *before* the drawing ends, and a throttled background tab must not be
    // able to hold the content back with it.
    const t = setTimeout(hand, Math.max(0, left / rate - BOOT_OVERLAP_MS))
    return () => { settled = true; clearTimeout(t) }
  }, [resolved])

  /**
   * Start the WebGL chunk downloading during the boot drawing.
   *
   * It is ~226KB and `next/dynamic` would otherwise not ask for it until the
   * card mounts — which is after the loading screen, so the one module that
   * needs it arrives last, into a box that is already on screen. Requesting it
   * here overlaps the download with the drawing instead. INDEX only: the whole
   * point of the dynamic import is that the other three tabs never fetch it.
   */
  useEffect(() => {
    if (!resolved || tab !== "index") return
    void import("@/components/three/signature")
  }, [resolved, tab])

  const goTab = useCallback((next: TabId) => {
    if (next === tab && !open && !zoom) return
    beginTransition()
    // Shallow: the URL updates, React never unmounts the grid.
    window.history.pushState(null, "", pathFor(next))
    setTab(next)
    setOpen(null)
    setZoom(null)
  }, [beginTransition, tab, open, zoom])

  /** Expand one module to the whole grid, and collapse it again. */
  const openZoom = useCallback((id: ModuleId) => {
    beginTransition()
    setZoom(id)
  }, [beginTransition])

  const closeZoom = useCallback(() => {
    beginTransition()
    setZoom(null)
  }, [beginTransition])

  const openProject = useCallback((num: string) => {
    beginTransition()
    setOpen(num)
  }, [beginTransition])

  const closeProject = useCallback(() => {
    beginTransition()
    setOpen(null)
  }, [beginTransition])

  const stepProject = useCallback((dir: 1 | -1) => {
    if (!open) return
    const i = PROJECTS.findIndex((p) => p.num === open)
    beginTransition()
    setOpen(PROJECTS[(i + dir + PROJECTS.length) % PROJECTS.length].num)
  }, [beginTransition, open])

  const toggleView = useCallback(() => {
    beginTransition()
    setDesktopView((v) => !v)
  }, [beginTransition])

  /**
   * Switch language. The cards' keys carry the language, so the whole set
   * scatters and gathers back in the mirrored grid; the identity card, which
   * never remounts, morphs across to its mirrored slot.
   */
  const toggleLang = useCallback(() => {
    beginTransition()
    setLang(rtl ? "en" : "ar")
  }, [beginTransition, rtl])

  // Back / forward.
  useEffect(() => {
    const onPop = () => {
      setOpen(null)
      setZoom(null)
      setTab(tabOfPath(window.location.pathname))
      beginTransition()
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [beginTransition])

  // Keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && /^(INPUT|TEXTAREA)$/.test(el.tagName)) return

      if (e.key === "Escape" && zoom) { e.preventDefault(); closeZoom(); return }
      if (e.key === "Escape" && open) { e.preventDefault(); closeProject(); return }

      if (open) {
        // "Next" is the way the page reads: rightward in English, leftward in
        // Arabic.
        const next = rtl ? "ArrowLeft" : "ArrowRight"
        const prev = rtl ? "ArrowRight" : "ArrowLeft"
        if (e.key === next) { e.preventDefault(); stepProject(1) }
        if (e.key === prev) { e.preventDefault(); stepProject(-1) }
        return
      }

      const byNumber = TABS.find((t) => t.key === e.key)
      if (byNumber) { e.preventDefault(); goTab(byNumber.id); return }

      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault()
        const i = TABS.findIndex((t) => t.id === tab)
        const d = (e.key === "ArrowRight") !== rtl ? 1 : -1
        goTab(TABS[(i + d + TABS.length) % TABS.length].id)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [tab, open, zoom, rtl, goTab, closeProject, closeZoom, stepProject])

  const measure = useCallback((el: HTMLDivElement) => {
    const cs = getComputedStyle(el)
    const gapX = parseFloat(cs.columnGap) || 0
    const gapY = parseFloat(cs.rowGap) || 0
    const padL = parseFloat(cs.paddingLeft) || 0
    const padT = parseFloat(cs.paddingTop) || 0
    const cw = el.clientWidth  - padL - (parseFloat(cs.paddingRight)  || 0)
    const ch = el.clientHeight - padT - (parseFloat(cs.paddingBottom) || 0)
    if (cw <= 0 || ch <= 0) return
    const next: GridGeom = {
      padL, padT, gapX, gapY,
      cellW: (cw - gapX * (cols - 1)) / cols,
      cellH: (ch - gapY * (rows - 1)) / rows,
    }
    geomRef.current = next
    setGeom(next)
  }, [cols, rows])

  /**
   * Attach the observer through the ref, not an effect.
   *
   * The grid's wrapper changes element type when the scaled view comes and goes
   * — a plain div becomes a PinchPan — so React discards the grid's DOM node and
   * mounts a new one. An effect keyed on [cols, rows] doesn't re-run for that
   * (a landscape phone resolves straight into the scaled view with the same 12x8),
   * leaving the observer watching a detached node and `geom` holding the
   * measurements of a grid that no longer exists. That put the identity card at
   * 264x132 in a slot 581x393.
   *
   * A ref callback re-runs whenever the node OR `measure` changes, which is
   * exactly when the geometry can be wrong. Refs are set before layout effects,
   * so the identity effect below still reads a fresh geomRef.
   */
  const attachGrid = useCallback((el: HTMLDivElement | null) => {
    gridRef.current = el
    roRef.current?.disconnect()
    roRef.current = null
    if (!el) return
    const ro = new ResizeObserver(() => measure(el))
    ro.observe(el)
    roRef.current = ro
    measure(el)
  }, [measure])

  /**
   * The grid, whichever grid it is. A phone runs the same four maps on a
   * portrait 4x12, expands the same modules into the same synthetic layouts,
   * and flies them with the same engine — only the proportions change.
   */
  const layoutKey = `${phoneGrid ? "m" : "d"}:${tab}`
  const baseMap   = phoneGrid ? MOBILE_LAYOUTS[tab] : LAYOUTS[tab]

  const activeMap: Partial<Record<ModuleId, Placement>> = useMemo(() => {
    if (open) return phoneGrid ? MOBILE_DETAIL_LAYOUT : DETAIL_LAYOUT
    if (zoom) return phoneGrid ? mobileZoomLayout(zoom) : zoomLayout(zoom)
    return swaps[layoutKey] ?? baseMap
  }, [phoneGrid, open, zoom, swaps, layoutKey, baseMap])

  /** Exchange two cards' cells. Both slide from where they visually are. */
  const swapCards = useCallback((a: ModuleId, b: ModuleId) => {
    // The grid has been rearranged, so a reset means something now: on iOS,
    // ask for motion access (for shake-to-reset) on the next tap.
    armMotionPermission()
    captureBoxes([a, b])
    setSwaps((prev) => {
      const cur = prev[layoutKey] ?? baseMap
      if (!cur[a] || !cur[b]) return prev
      return { ...prev, [layoutKey]: { ...cur, [a]: cur[b], [b]: cur[a] } }
    })
  }, [layoutKey, baseMap])

  /** Put this tab back the way it was composed — every card slides home. */
  const resetCards = useCallback(() => {
    // Only the cards that actually moved: a card whose placement doesn't change
    // never runs its slide, so a centre recorded for it would sit in `flipFrom`
    // and fire on some later, unrelated re-layout.
    const cur = activeMap as Record<string, Placement>
    const base = baseMap as Record<string, Placement>
    captureBoxes(Object.keys(cur).filter((id) => id !== "identity" && cur[id] !== base[id]))
    setSwaps((prev) => {
      const next = { ...prev }
      delete next[layoutKey]
      return next
    })
  }, [activeMap, baseMap, layoutKey])

  /** Only a settled, unexpanded grid at real size can be rearranged. */
  const canThrow = !busy && !open && !zoom && !scaled

  /**
   * Shake to reset, on the phone grid. Unlike RESET GRID's slide home it is a
   * full scatter and gather — a shake is a big gesture and gets a big answer —
   * and it plays even when nothing was moved, so the gesture always lands.
   */
  const shakeReset = useCallback(() => {
    beginTransition()
    setSwaps((prev) => {
      if (!prev[layoutKey]) return prev
      const next = { ...prev }
      delete next[layoutKey]
      return next
    })
    setShakeGen((g) => g + 1)
    navigator.vibrate?.(40)
  }, [beginTransition, layoutKey])

  // Any touch screen, any orientation — not just the portrait grid.
  useShake(shakeReset, touch && canThrow && !reduced)

  /**
   * Rotation. Turning the device switches grids, which remounts every card
   * (the key carries the grid), so it gets the same treatment as any other
   * re-layout: a transition, with throwing locked until the gather lands.
   * The identity card morphs to its new slot on its own (its placement
   * changed). Skipped on the first resolve, which is the intro's job.
   */
  const lastGrid = useRef<boolean | null>(null)
  useEffect(() => {
    if (!booted) return
    if (lastGrid.current !== null && lastGrid.current !== phoneGrid) beginTransition()
    lastGrid.current = phoneGrid
  }, [phoneGrid, booted, beginTransition])

  const { entries, outward, inward, identityAt } = useMemo(() => {
    const all = Object.entries(activeMap) as [ModuleId, Placement][]
    const ranks = rankByRadius(all, flight)
    return {
      // The identity card is lifted out on both grids — it morphs rather than
      // scattering, which needs a real animated box rather than a grid cell.
      entries: all.filter(([id]) => id !== "identity"),
      outward: ranks.outward,
      inward: ranks.inward,
      identityAt: activeMap.identity,
    }
  }, [activeMap, flight])

  // Springs the card's real box when the placement changes; snaps on resize and
  // on first paint. Animating width/height for real is what lets the card's
  // container queries — and therefore its contents — keep pace with the box.
  useLayoutEffect(() => {
    const g = geomRef.current ?? geom
    if (!g || !identityAt) return
    const r = rectFor(identityAt, g, cols, rtl)

    // Same box as last time — the grid re-measured to the value it already had.
    // Setting the values again would stutter a spring that is mid-flight.
    const prev = lastRect.current
    if (prev && prev.l === r.left && prev.t === r.top && prev.w === r.width && prev.h === r.height) return
    lastRect.current = { l: r.left, t: r.top, w: r.width, h: r.height }

    running.current.forEach((a) => a.stop())
    running.current = []

    const pairs: [MotionValue<number>, number][] = [
      [mLeft, r.left], [mTop, r.top], [mW, r.width], [mH, r.height],
    ]
    // A language switch is a morph too: the card glides to its mirrored slot.
    const isMorph = lastPlacement.current !== null &&
      (lastPlacement.current !== identityAt || lastRtl.current !== rtl)
    lastPlacement.current = identityAt
    lastRtl.current = rtl
    if (isMorph && !reduced) running.current = pairs.map(([mv, v]) => animate(mv, v, MORPH_TRANSITION))
    else                     pairs.forEach(([mv, v]) => mv.set(v))
  }, [geom, identityAt, reduced, cols, rtl, mLeft, mTop, mW, mH])

  const render = (id: ModuleId): React.ReactNode => {
    if (id.startsWith("project-0")) {
      const p = t.PROJECTS.find((x) => x.num === id.slice(-2))!
      return <ProjectCard project={p} onOpen={openProject} />
    }
    if (id.startsWith("cat-")) {
      const cat = t.STACK.find((c) => c.id === id.slice(4))!
      return <Category cat={cat} />
    }
    switch (id) {
      case "status":         return <Status />
      case "stats":          return zoom === "stats" ? <StatsDetail /> : <Stats />
      /*
        `busy` parks the WebGL loop while the grid is flying, which is what it
        is for. The intro is not a flight — the cards rise in place — so parking
        it there just leaves the card blank for TRANSITION_MS after everything
        else has arrived, which is the longest anything on the page waits.
      */
      case "signature":      return <Signature paused={busy && !intro} />
      case "experience":
        return zoom === "experience"
          ? <ExperienceDetail />
          : <Experience onOpen={() => openZoom("experience")} />
      case "location":       return <Location />
      case "latest":         return <Latest onGo={goTab} />
      case "work-meta":      return <WorkMeta />
      case "cv":             return <CvCard />
      case "tech-count":     return <TechCount />
      case "education":      return <Education />
      case "headline":       return <Headline />
      case "email":          return <EmailCard />
      case "form":           return <ContactForm />
      case "socials":        return <Socials />
      case "footer":         return <Footer />
      case "project-detail": return <ProjectDetail num={open!} />
      case "detail-nav":     return <DetailNav num={open!} onClose={closeProject} onOpen={openProject} />
      case "zoom-nav":
        return zoom === "experience"
          ? <ZoomNav label={t.EMPLOYER.name} title={t.UI.experience.label} meta={`${t.EMPLOYER.span} · ${t.UI.roles(t.ROLES.length)}`} onClose={closeZoom} />
          : <ZoomNav label={t.UI.expanded} title={titleOf(zoom!, t).replace(/\n/g, " ")} onClose={closeZoom} />
      default:               return null
    }
  }

  const grid = (
    <div
      ref={attachGrid}
      className={
        scaled
          // Desktop paddings by hand: the `md:` variants read the *window*,
          // which on a phone is small, so they'd apply the phone's spacing to a
          // 1440px canvas.
          // Its own background and border: at 0.27 the page would otherwise
          // float on a hairline grid drawn at full screen scale, which reads
          // as broken rather than as a scaled-down desktop.
          ? "relative bg-bg grid-bg border border-hairline p-4 pb-[5.5rem] grid gap-2.5"
          : "relative h-dvh w-full p-3 md:p-4 pb-[4.5rem] md:pb-[5.5rem] grid gap-2 md:gap-2.5"
      }
      style={{
        ...(scaled ? { width: DESKTOP_W, height: DESKTOP_H } : null),
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows:    `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {/*
        Nothing is rendered until the viewport is known *and* the boot drawing
        has closed. Hiding the wrong layout isn't enough — mounting the desktop
        set means AnimatePresence has to animate it back out again, and that
        swap is visible however it's masked. Rendering only once `resolved` is
        true means the first set to mount is the right one; waiting for `booted`
        on top of that means it mounts into a box that has already been drawn
        for it.
      */}
      {resolved && booted && (
      <>
      {/*
        The anchor. Outside AnimatePresence because it must never unmount, and
        positioned absolutely once the grid has been measured so its
        width/height can be animated for real — see rectFor(). Until then it
        renders as an ordinary grid item, keeping it in the SSR markup.
      */}
      {identityAt && (
        <motion.div
          style={
            geom
              ? { position: "absolute", left: mLeft, top: mTop, width: mW, height: mH }
              : gridStyle(identityAt)
          }
          className="module @container [container-type:size] z-10 min-h-0 min-w-0 hover:border-fg/35 hover:shadow-glow"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.28, delay: 0 }}
            className="h-full w-full"
          >
            <Identity onHome={() => goTab("index")} />
          </motion.div>
        </motion.div>
      )}

      {/* Everything else scatters and gathers. */}
      <AnimatePresence mode="sync">
        {entries.map(([id, placement]) => (
          <ModuleCard
            /*
              The key carries the grid and the expansion state, not just the id.
              A module that appears in both the outgoing and incoming layout —
              EXPERIENCE expanding into its own zoom, or any card when the
              desktop view is toggled — would otherwise persist and snap
              straight from one cell to the other while everything around it
              flew. Remounting turns that into a proper scatter and gather.
            */
            key={`${id}:${phoneGrid ? "m" : "d"}:${open ? "o" : zoom ? "z" : "l"}:${shakeGen}:${lang}`}
            id={id}
            placement={placement}
            throwable={{
              enabled: canThrow,
              target: dropTarget === id,
              onHover: setDropTarget,
              onFling: armMotionPermission,
              onDrop: (target) => {
                setDropTarget(null)
                if (target !== "identity") swapCards(id, target as ModuleId)
              },
            }}
            custom={{
              vector: flightVector(placement, flight),
              exitRank: outward[id] ?? 0,
              enterRank: inward[id] ?? 0,
              reduced,
              intro,
            }}
          >
            {!open && !zoom && isCramped(id, placement, baseMap[id])
              ? (
                <CompactCard
                  title={titleOf(id, t)}
                  onOpen={() => (id.startsWith("project-0") ? openProject(id.slice(-2)) : openZoom(id))}
                />
              )
              : render(id)}
          </ModuleCard>
        ))}
      </AnimatePresence>
      </>
      )}
    </div>
  )

  return (
    <LangProvider lang={lang}>
    <main className={`fixed inset-0 bg-bg ${scaled ? "" : "grid-bg"}`}>
      <Cursor />

      {/* Nothing scrolls, on any screen. The phone grid fits because it is a
          portrait grid, not a squeezed landscape one; the scaled view fits
          because it is scaled. */}
      {scaled
        // Fit above the dock, not behind it: on a landscape phone the canvas is
        // height-bound, so anything the dock covers is content you cannot reach.
        ? <div className="h-dvh w-full pb-14"><PinchPan width={DESKTOP_W} height={DESKTOP_H}>{grid}</PinchPan></div>
        : <div className="h-dvh w-full overflow-hidden">{grid}</div>}

      {/* Shows the throwable cards off, once, after the first settle. */}
      {resolved && booted && (
        <ThrowDemo
          ready={!open && !zoom && !scaled && !reduced}
          cards={entries}
          flight={flight}
          touch={touch}
          portrait={phoneGrid}
        />
      )}

      <NavDock
        tab={tab}
        onSelect={goTab}
        detailOpen={!!open || !!zoom}
        onReset={swaps[layoutKey] && !open && !zoom ? resetCards : undefined}
        desktopView={scaled}
        // Only where there's a choice to make: the portrait grid on a touch
        // screen. Landscape already *is* the desktop grid.
        onToggleView={portrait && touch ? toggleView : undefined}
        onToggleLang={toggleLang}
      />
    </main>
    </LangProvider>
  )
}
