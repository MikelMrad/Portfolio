"use client"
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"

/**
 * A drag-and-pinch window onto a fixed-size canvas.
 *
 * This is what "show me the desktop layout on my phone" actually costs: the
 * real 12x8 grid is laid out at its full 1440x900 and scaled to fit, which on a
 * 393px-wide phone is 0.26 — a 9px label lands at 2.3px. Unreadable is the
 * honest starting state, so the surface has to be explorable: drag to pan,
 * pinch to zoom in to something you can read, double-tap to fit again.
 *
 * The transform is written straight to the DOM rather than through React state.
 * A gesture fires a move event per frame, and re-rendering the entire grid —
 * WebGL canvas included — on each one drops the frame rate through the floor.
 */

const MAX_SCALE = 2.5
/** Past this much travel a gesture was a pan, and the click it ends with is not
 *  meant for whatever card happened to be under the finger. */
const DRAG_SLOP = 8

type Point = { x: number; y: number }
/** View state at the moment the pointer set last changed — every move is
 *  resolved against this, which makes pan and pinch the same calculation. */
type Anchor = { s: number; x: number; y: number; cx: number; cy: number; dist: number }

export function PinchPan({
  width, height, children,
}: { width: number; height: number; children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const view     = useRef({ s: 1, x: 0, y: 0, fit: 1 })
  const pointers = useRef<Map<number, Point>>(new Map())
  const anchor   = useRef<Anchor | null>(null)
  const moved    = useRef(0)
  const lastTap  = useRef(0)
  /** The gestures aren't discoverable at 0.27 — say so, once, until first use. */
  const [touched, setTouched] = useState(false)

  /** Clamp the view so the canvas can never be dragged off the frame, then paint. */
  const commit = useCallback(() => {
    const frame = frameRef.current
    const stage = stageRef.current
    if (!frame || !stage) return

    const v = view.current
    const fw = frame.clientWidth
    const fh = frame.clientHeight
    const cw = width * v.s
    const ch = height * v.s

    // Smaller than the frame on an axis? Centre on it — there is nothing to pan.
    v.x = cw <= fw ? (fw - cw) / 2 : Math.min(0, Math.max(fw - cw, v.x))
    v.y = ch <= fh ? (fh - ch) / 2 : Math.min(0, Math.max(fh - ch, v.y))

    stage.style.transform = `translate3d(${v.x}px, ${v.y}px, 0) scale(${v.s})`
  }, [width, height])

  /** Scale the canvas down until the whole thing is on screen, and centre it. */
  const reset = useCallback(() => {
    const frame = frameRef.current
    if (!frame) return
    const fit = Math.min(frame.clientWidth / width, frame.clientHeight / height)
    view.current = { s: fit, x: 0, y: 0, fit }
    commit()
  }, [commit, width, height])

  // Before paint, so the canvas is never briefly visible at 1:1.
  useLayoutEffect(() => {
    reset()
    const frame = frameRef.current
    if (!frame) return
    const ro = new ResizeObserver(() => {
      // Rotating the phone changes the fit floor; the current zoom may now be
      // below it, and the pan certainly needs re-clamping.
      const fit = Math.min(frame.clientWidth / width, frame.clientHeight / height)
      view.current.fit = fit
      view.current.s = Math.max(fit, view.current.s)
      commit()
    })
    ro.observe(frame)
    return () => ro.disconnect()
  }, [reset, commit, width, height])

  const capture = useCallback(() => {
    const pts = [...pointers.current.values()]
    if (!pts.length) { anchor.current = null; return }
    const cx = pts.reduce((n, p) => n + p.x, 0) / pts.length
    const cy = pts.reduce((n, p) => n + p.y, 0) / pts.length
    const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0
    anchor.current = { s: view.current.s, x: view.current.x, y: view.current.y, cx, cy, dist }
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Second finger down mid-drag must not restart the travel count, or a pinch
    // that lands on a card would be treated as a tap on it.
    if (!pointers.current.size) moved.current = 0
    setTouched(true)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    capture()
  }, [capture])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    const a = anchor.current
    if (!a) return
    const pts = [...pointers.current.values()]
    const cx = pts.reduce((n, p) => n + p.x, 0) / pts.length
    const cy = pts.reduce((n, p) => n + p.y, 0) / pts.length
    const dist = pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0

    const v = view.current
    // One finger leaves the ratio at 1, so this is a plain pan. Two makes it a
    // pinch about the midpoint — same expression either way.
    const s = a.dist > 0 && dist > 0
      ? Math.min(MAX_SCALE, Math.max(v.fit, (a.s * dist) / a.dist))
      : a.s
    const k = s / a.s

    v.s = s
    v.x = cx - (a.cx - a.x) * k
    v.y = cy - (a.cy - a.y) * k
    moved.current = Math.max(moved.current, Math.hypot(cx - a.cx, cy - a.cy))
    commit()
  }, [commit])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    capture() // re-anchor: lifting one finger of a pinch continues as a pan

    if (!pointers.current.size && moved.current < DRAG_SLOP) {
      const now = performance.now()
      // Double tap toggles between fitted and a readable 1:1.
      if (now - lastTap.current < 320) {
        const v = view.current
        v.s = v.s > v.fit * 1.05 ? v.fit : Math.min(MAX_SCALE, 1)
        commit()
        lastTap.current = 0
      } else {
        lastTap.current = now
      }
    }
  }, [capture, commit])

  /** Trackpad pinch and ctrl+wheel, so this is testable outside a phone. */
  const onWheel = useCallback((e: React.WheelEvent) => {
    const v = view.current
    const frame = frameRef.current
    if (!frame) return
    const r = frame.getBoundingClientRect()
    const cx = e.clientX - r.left
    const cy = e.clientY - r.top

    if (e.ctrlKey || e.metaKey) {
      const s = Math.min(MAX_SCALE, Math.max(v.fit, v.s * Math.exp(-e.deltaY / 260)))
      const k = s / v.s
      v.x = cx - (cx - v.x) * k
      v.y = cy - (cy - v.y) * k
      v.s = s
    } else {
      v.x -= e.deltaX
      v.y -= e.deltaY
    }
    commit()
  }, [commit])

  /*
    A pan ends in a click on whatever card the finger came to rest over. Caught
    in the capture phase, before the card's own handler, so dragging across the
    grid can't open a project.
  */
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const swallow = (e: MouseEvent) => {
      if (moved.current >= DRAG_SLOP) { e.stopPropagation(); e.preventDefault() }
      moved.current = 0
    }
    frame.addEventListener("click", swallow, true)
    return () => frame.removeEventListener("click", swallow, true)
  }, [])

  return (
    <div
      ref={frameRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      className="relative h-full w-full overflow-hidden"
      // The browser's own pan/zoom would fight every gesture here.
      style={{ touchAction: "none" }}
    >
      <div
        ref={stageRef}
        style={{ width, height, transformOrigin: "0 0", willChange: "transform" }}
      >
        {children}
      </div>

      {/* A chip, not bare text: on a landscape phone the canvas fills the frame
          top to bottom, so there is no empty margin to sit the hint in. */}
      {!touched && (
        <span className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 bg-bg/85 backdrop-blur-sm border border-hairline px-3 py-1.5 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.24em] text-dim">
          PINCH · DRAG · DOUBLE-TAP TO FIT
        </span>
      )}
    </div>
  )
}
