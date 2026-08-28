"use client"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type MotionValue } from "motion/react"

import {
  GRID_COLS, GRID_ROWS, LAYOUTS, TABS,
  gridStyle, rectFor, type GridGeom, type ModuleId, type Placement, type TabId,
} from "@/lib/grid"
import { MORPH_TRANSITION, flightVector, rankByRadius, slideDirection, slideVariants } from "@/lib/scatter"
import { EMPLOYER, PROJECTS, STACK } from "@/lib/content"

import { ModuleCard } from "./module-card"
import { NavDock } from "./nav-dock"
import { Cursor } from "@/components/ui/cursor"
import { ZoomNav } from "@/components/ui/bits"
import { Identity } from "@/components/modules/identity"
import { Experience, ExperienceDetail, Latest, Location, Stats, Status } from "@/components/modules/index-modules"
import { CvCard, DetailNav, ProjectCard, ProjectDetail, WorkMeta } from "@/components/modules/work-modules"
import { Category, Education, TechCount } from "@/components/modules/stack-modules"
import { ContactForm, EmailCard, Footer, Headline, Socials } from "@/components/modules/contact-modules"
import { Signature } from "@/components/three/signature"
import { MOBILE_ORDER, Tile, isExpandable } from "@/components/modules/tile"

/**
 * An expanded project is just another layout. Opening one scatters the work
 * grid and gathers the detail in — the exact same engine, no second mechanic.
 */
const DETAIL_LAYOUT: Partial<Record<ModuleId, Placement>> = {
  identity:         { col: [1, 3], row: [1, 2] },
  "detail-nav":     { col: [1, 3], row: [3, 6] },
  "project-detail": { col: [4, 9], row: [1, 8] },
}

/** A desktop zoom (currently only the experience timeline) reuses the detail shape. */
const ZOOM_LAYOUT: Partial<Record<ModuleId, Placement>> = {
  identity:   { col: [1, 3], row: [1, 2] },
  "zoom-nav": { col: [1, 3], row: [3, 6] },
  experience: { col: [4, 9], row: [1, 8] },
}

/** Modules that expand on desktop, not just on a phone. */
const DESKTOP_ZOOMABLE: ModuleId[] = ["experience"]

/** How long the scatter runs end to end. Used to park the WebGL loop. */
const TRANSITION_MS = 950

/** Below this the grid becomes a stack of title tiles. */
const MOBILE_Q = "(max-width: 767px)"

/**
 * Which layout to draw, and whether that's been decided yet.
 *
 * The server can't know the viewport, so the SSR markup is always the desktop
 * grid. On a fast client the effect below resolves before the first paint and
 * nobody notices — but on a phone, hydration doesn't beat the paint, so the
 * desktop 12-column layout renders, reflows, and lands on the mobile stack.
 * `resolved` lets the stage stay hidden until the answer is in.
 */
function useViewportMode() {
  const [mode, setMode] = useState({ mobile: false, resolved: false })
  useLayoutEffect(() => {
    const mq = window.matchMedia(MOBILE_Q)
    const sync = () => setMode({ mobile: mq.matches, resolved: true })
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
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
  const { mobile: isMobile, resolved } = useViewportMode()
  const [zoom, setZoom]     = useState<ModuleId | null>(null) // mobile: expanded tile

  const mobileIds = useMemo(() => MOBILE_ORDER[tab], [tab])

  const cols = isMobile ? 1 : GRID_COLS
  const rows = isMobile ? Math.max(mobileIds.length, 1) : GRID_ROWS

  const reduced             = !!useReducedMotion()
  const panRef              = useRef<HTMLDivElement>(null)
  const gridRef             = useRef<HTMLDivElement>(null)
  const [geom, setGeom]     = useState<GridGeom | null>(null)

  // The identity card's box, in pixels. These are always set before paint, so
  // the card never renders without dimensions (animating `left/top/width/height`
  // via the `animate` prop collapses it to 0 on the first frame instead).
  const mLeft = useMotionValue(0)
  const mTop  = useMotionValue(0)
  const mW    = useMotionValue(0)
  const mH    = useMotionValue(0)
  const lastPlacement = useRef<Placement | null | undefined>(null)
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
    if (next === tab && !open) return
    slideDirection.current =
      TABS.findIndex((t) => t.id === next) >= TABS.findIndex((t) => t.id === tab) ? 1 : -1
    beginTransition()
    // Shallow: the URL updates, React never unmounts the grid.
    window.history.pushState(null, "", pathFor(next))
    setTab(next)
    setOpen(null)
    setZoom(null)
  }, [beginTransition, tab, open])

  /** Mobile: expand one tile to the whole grid, and collapse it again. */
  const openZoom = useCallback((id: ModuleId) => {
    if (isMobile ? !isExpandable(id) : !DESKTOP_ZOOMABLE.includes(id)) return
    slideDirection.current = 1   // drilling in
    beginTransition()
    setZoom(id)
  }, [beginTransition, isMobile])

  const closeZoom = useCallback(() => {
    slideDirection.current = -1  // popping back out
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

  // Back / forward.
  useEffect(() => {
    const onPop = () => {
      setOpen(null)
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

  // On a phone the grid is panned sideways — always land on its left edge.
  useEffect(() => { panRef.current?.scrollTo({ left: 0, behavior: "smooth" }) }, [tab, open])

  // Measured before paint so the identity card never renders at the wrong size.
  useLayoutEffect(() => {
    const el = gridRef.current
    if (!el) return
    const measure = () => {
      const cs = getComputedStyle(el)
      const gapX = parseFloat(cs.columnGap) || 0
      const gapY = parseFloat(cs.rowGap) || 0
      const padL = parseFloat(cs.paddingLeft) || 0
      const padT = parseFloat(cs.paddingTop) || 0
      const cw = el.clientWidth  - padL - (parseFloat(cs.paddingRight)  || 0)
      const ch = el.clientHeight - padT - (parseFloat(cs.paddingBottom) || 0)
      if (cw <= 0 || ch <= 0) return
      setGeom({
        padL, padT, gapX, gapY,
        cellW: (cw - gapX * (cols - 1)) / cols,
        cellH: (ch - gapY * (rows - 1)) / rows,
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [cols, rows])

  /**
   * Mobile is the same engine on a different grid: one column, one row per
   * module, each collapsed to a title tile. Expanding a tile hands it the whole
   * grid — identical to how a project detail works on desktop — so the tiles
   * scatter out and the expanded section gathers in. Nothing scrolls either way.
   */
  const activeMap: Partial<Record<ModuleId, Placement>> = useMemo(() => {
    if (!isMobile) {
      if (open) return DETAIL_LAYOUT
      if (zoom) return ZOOM_LAYOUT
      return LAYOUTS[tab]
    }
    const full: Placement = { col: [1, 1], row: [1, rows] }
    // A zoomed project shows its full detail rather than the card.
    if (zoom) return { [zoom.startsWith("project-0") ? "project-detail" : zoom]: full }
    return Object.fromEntries(
      mobileIds.map((id, i) => [id, { col: [1, 1], row: [i + 1, 1] } as Placement]),
    )
  }, [isMobile, open, tab, zoom, mobileIds, rows])

  const { entries, outward, inward, identityAt } = useMemo(() => {
    const all = Object.entries(activeMap) as [ModuleId, Placement][]
    const ranks = rankByRadius(all)
    return {
      // Desktop lifts the identity card out to morph it. Mobile has no anchor —
      // it's just another tile — so it scatters with everything else.
      entries: isMobile ? all : all.filter(([id]) => id !== "identity"),
      outward: ranks.outward,
      inward: ranks.inward,
      identityAt: activeMap.identity,
    }
  }, [activeMap, isMobile])

  // Springs the card's real box when the tab changes; snaps on resize and on
  // first paint. Animating width/height for real is what lets the card's
  // container queries — and therefore its contents — keep pace with the box.
  useLayoutEffect(() => {
    if (!geom || !identityAt || isMobile) return
    const r = rectFor(identityAt, geom)
    const pairs: [MotionValue<number>, number][] = [
      [mLeft, r.left], [mTop, r.top], [mW, r.width], [mH, r.height],
    ]
    const isMorph = lastPlacement.current !== null && lastPlacement.current !== identityAt
    lastPlacement.current = identityAt
    if (isMorph && !reduced) pairs.forEach(([mv, v]) => animate(mv, v, MORPH_TRANSITION))
    else                     pairs.forEach(([mv, v]) => mv.set(v))
  }, [geom, identityAt, isMobile, reduced, mLeft, mTop, mW, mH])

  const render = (id: ModuleId): React.ReactNode => {
    // Mobile, nothing expanded: every module is a title row.
    if (isMobile && !zoom) {
      return (
        <Tile
          id={id}
          onOpen={(next) => (next === "identity" ? goTab("index") : openZoom(next))}
        />
      )
    }
    // Mobile, a project expanded: show its detail, not its card.
    if (isMobile && id === "project-detail" && zoom?.startsWith("project-0")) {
      return <ProjectDetail num={`0${zoom.slice(-1)}`} />
    }

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
          : <Experience onOpen={DESKTOP_ZOOMABLE.includes("experience") ? () => openZoom("experience") : undefined} />
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

  return (
    <main className="fixed inset-0 bg-bg grid-bg">
      <Cursor />

      {/* Nothing scrolls, on any screen. Mobile fits because it collapses each
          module to a single title row rather than shrinking the desktop grid. */}
      <div ref={panRef} className="h-dvh w-full overflow-hidden">
        <div
          ref={gridRef}
          className={`relative h-dvh w-full p-3 md:p-4 pb-[4.5rem] md:pb-[5.5rem] grid gap-2 md:gap-2.5 ${
            isMobile && zoom ? "pt-[3.75rem]" : ""
          }`}
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows:    `repeat(${rows}, minmax(0, 1fr))`,
          }}
        >
          {/*
            Nothing is rendered until the viewport is known. Hiding the wrong
            layout isn't enough — mounting the desktop set means AnimatePresence
            has to animate it back out again, and that swap is visible however
            it's masked. Rendering only once `resolved` is true means the first
            set to mount is the right one, and the intro gather covers the wait.
          */}
          {resolved && (
          <>
          {/*
            Desktop anchor. Outside AnimatePresence because it must never
            unmount, and positioned absolutely once the grid has been measured
            so its width/height can be animated for real — see rectFor(). Until
            then it renders as an ordinary grid item, keeping it in the SSR
            markup. On mobile it's just another tile, handled below.
          */}
          {!isMobile && identityAt && (
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
            {entries.map(([id, placement], i) => (
              <ModuleCard
                /*
                  On mobile the key carries the zoom state so that expanding a
                  row which is already on screen (EXPERIENCE, a stack category)
                  remounts instead of persisting — otherwise it snaps straight
                  from a 184px row to full screen while everything else slides.
                  Remounting turns it into a proper push: the row leaves, the
                  section arrives.
                */
                key={isMobile ? `${id}:${zoom ? "z" : "l"}` : id}
                placement={placement}
                variants={isMobile ? slideVariants : undefined}
                custom={
                  isMobile
                    // Ranked by row, not by distance from centre: on a vertical
                    // list, sequential top-to-bottom reads as deliberate.
                    ? { rank: i, reduced }
                    : {
                        vector: flightVector(placement),
                        exitRank: outward[id] ?? 0,
                        enterRank: inward[id] ?? 0,
                        reduced,
                      }
                }
              >
                {render(id)}
              </ModuleCard>
            ))}
          </AnimatePresence>
          </>
          )}
        </div>
      </div>

      {/* A bar rather than a floating button: the grid reserves its height below,
          so it can never sit on top of the expanded section's own header. */}
      {isMobile && zoom && (
        <div className="fixed top-0 inset-x-0 z-50 h-12 flex items-center justify-between px-4 bg-bg/90 backdrop-blur-sm border-b border-hairline">
          <button
            onClick={closeZoom}
            className="font-mono text-[9px] uppercase tracking-[0.24em] text-fg flex items-center gap-2"
          >
            <span aria-hidden>←</span> CLOSE
          </button>
          <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-dim">
            {TABS.find((t) => t.id === tab)?.label}
          </span>
        </div>
      )}

      <NavDock tab={tab} onSelect={goTab} detailOpen={!!open || !!zoom} />
    </main>
  )
}
