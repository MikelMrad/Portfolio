"use client"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type MotionValue } from "motion/react"

import {
  GRID_COLS, GRID_ROWS, LAYOUTS, MOBILE_COLS, MOBILE_LAYOUTS, MOBILE_ROWS, TABS,
  gridStyle, rectFor, type GridGeom, type ModuleId, type Placement, type TabId,
} from "@/lib/grid"
import {
  DESKTOP_FLIGHT, MOBILE_FLIGHT, MORPH_TRANSITION, flightVector, rankByRadius,
} from "@/lib/scatter"
import { EMPLOYER, PROJECTS, STACK } from "@/lib/content"

import { ModuleCard } from "./module-card"
import { NavDock } from "./nav-dock"
import { PinchPan } from "./pinch-pan"
import { Cursor } from "@/components/ui/cursor"
import { ZoomNav } from "@/components/ui/bits"
import { Identity } from "@/components/modules/identity"
import { Experience, ExperienceDetail, Latest, Location, Stats, Status } from "@/components/modules/index-modules"
import { CvCard, DetailNav, ProjectCard, ProjectDetail, WorkMeta } from "@/components/modules/work-modules"
import { Category, Education, TechCount } from "@/components/modules/stack-modules"
import { ContactForm, EmailCard, Footer, Headline, Socials } from "@/components/modules/contact-modules"
import { Signature } from "@/components/three/signature"

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

/** Modules that expand into the whole grid. The same set on both grids. */
const ZOOMABLE: ModuleId[] = ["experience"]

/** How long the scatter runs end to end. Used to park the WebGL loop. */
const TRANSITION_MS = 950

/** Below this the grid becomes the portrait 4x12. */
const MOBILE_Q = "(max-width: 767px)"
/**
 * Too short for the portrait grid — twelve rows would be ~18px each. This is a
 * landscape phone, and the scaled desktop view is the only thing that fits it.
 */
const SHORT_Q = "(max-height: 540px)"

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
  const [mode, setMode] = useState({ mobile: false, short: false, resolved: false })
  useLayoutEffect(() => {
    const mq = window.matchMedia(MOBILE_Q)
    const sq = window.matchMedia(SHORT_Q)
    const sync = () => setMode({ mobile: mq.matches, short: sq.matches, resolved: true })
    sync()
    mq.addEventListener("change", sync)
    sq.addEventListener("change", sync)
    return () => {
      mq.removeEventListener("change", sync)
      sq.removeEventListener("change", sync)
    }
  }, [])
  return mode
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
  const [zoom, setZoom]     = useState<ModuleId | null>(null)
  const { mobile: isMobile, short: isShort, resolved } = useViewportMode()

  /**
   * The phone's escape hatch: draw the real 12x8 at its full size and scale it
   * to fit, then let the viewer drag and pinch into it. Forced on a landscape
   * phone, where the portrait grid has no room to exist.
   */
  const [desktopView, setDesktopView] = useState(false)
  const scaled    = isMobile && (isShort || desktopView)
  const phoneGrid = isMobile && !scaled

  const cols   = phoneGrid ? MOBILE_COLS : GRID_COLS
  const rows   = phoneGrid ? MOBILE_ROWS : GRID_ROWS
  const flight = phoneGrid ? MOBILE_FLIGHT : DESKTOP_FLIGHT

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
  /** The rect the card is currently headed for, so an unchanged one is a no-op
   *  rather than a set() that the running spring immediately overwrites. */
  const lastRect      = useRef<{ l: number; t: number; w: number; h: number } | null>(null)
  const running       = useRef<{ stop: () => void }[]>([])
  const busyTimer           = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  /** Every state change that reshuffles the grid goes through here. */
  const beginTransition = useCallback(() => {
    setBusy(true)
    clearTimeout(busyTimer.current)
    busyTimer.current = setTimeout(() => setBusy(false), reduced ? 200 : TRANSITION_MS)
  }, [reduced])

  // `busy` initialises to true so the intro gather is already covered; this only
  // schedules its release. Calling beginTransition() here would setState
  // synchronously in an effect body and cascade a render.
  useEffect(() => {
    busyTimer.current = setTimeout(() => setBusy(false), reduced ? 200 : TRANSITION_MS)
    return () => clearTimeout(busyTimer.current)
  }, [reduced])

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
    if (!ZOOMABLE.includes(id)) return
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
        if (e.key === "ArrowRight") { e.preventDefault(); stepProject(1) }
        if (e.key === "ArrowLeft")  { e.preventDefault(); stepProject(-1) }
        return
      }

      const byNumber = TABS.find((t) => t.key === e.key)
      if (byNumber) { e.preventDefault(); goTab(byNumber.id); return }

      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault()
        const i = TABS.findIndex((t) => t.id === tab)
        const d = e.key === "ArrowRight" ? 1 : -1
        goTab(TABS[(i + d + TABS.length) % TABS.length].id)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [tab, open, zoom, goTab, closeProject, closeZoom, stepProject])

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
  const activeMap: Partial<Record<ModuleId, Placement>> = useMemo(() => {
    if (open) return phoneGrid ? MOBILE_DETAIL_LAYOUT : DETAIL_LAYOUT
    if (zoom) return phoneGrid ? mobileZoomLayout(zoom) : zoomLayout(zoom)
    return phoneGrid ? MOBILE_LAYOUTS[tab] : LAYOUTS[tab]
  }, [phoneGrid, open, zoom, tab])

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
    const r = rectFor(identityAt, g)

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
    const isMorph = lastPlacement.current !== null && lastPlacement.current !== identityAt
    lastPlacement.current = identityAt
    if (isMorph && !reduced) running.current = pairs.map(([mv, v]) => animate(mv, v, MORPH_TRANSITION))
    else                     pairs.forEach(([mv, v]) => mv.set(v))
  }, [geom, identityAt, reduced, mLeft, mTop, mW, mH])

  const render = (id: ModuleId): React.ReactNode => {
    if (id.startsWith("project-0")) {
      const p = PROJECTS.find((x) => x.num === id.slice(-2))!
      return <ProjectCard project={p} onOpen={openProject} />
    }
    if (id.startsWith("cat-")) {
      const label = id.slice(4)
      const cat = STACK.find((c) => c.label.toLowerCase().startsWith(label))!
      return <Category cat={cat} />
    }
    switch (id) {
      case "status":         return <Status />
      case "stats":          return <Stats />
      case "signature":      return <Signature paused={busy} />
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
        return <ZoomNav label={EMPLOYER.name} title="EXPERIENCE" meta={`${EMPLOYER.span} · 4 ROLES`} onClose={closeZoom} />
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
        Nothing is rendered until the viewport is known. Hiding the wrong layout
        isn't enough — mounting the desktop set means AnimatePresence has to
        animate it back out again, and that swap is visible however it's masked.
        Rendering only once `resolved` is true means the first set to mount is
        the right one, and the intro gather covers the wait.
      */}
      {resolved && (
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
            transition={{ duration: 0.5, delay: 0.1 }}
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
            key={`${id}:${phoneGrid ? "m" : "d"}:${open ? "o" : zoom ? "z" : "l"}`}
            placement={placement}
            custom={{
              vector: flightVector(placement, flight),
              exitRank: outward[id] ?? 0,
              enterRank: inward[id] ?? 0,
              reduced,
            }}
          >
            {render(id)}
          </ModuleCard>
        ))}
      </AnimatePresence>
      </>
      )}
    </div>
  )

  return (
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

      <NavDock
        tab={tab}
        onSelect={goTab}
        detailOpen={!!open || !!zoom}
        desktopView={scaled}
        // No choice to offer on a desktop, or on a landscape phone where the
        // portrait grid has no room to exist.
        onToggleView={isMobile && !isShort ? toggleView : undefined}
      />
    </main>
  )
}
