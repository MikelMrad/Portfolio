"use client"
import { useEffect, useRef } from "react"

/**
 * Ported from v3, with one change: the grid remounts on every tab switch, so
 * hover targets can't be bound once at mount. Uses delegation instead.
 */
export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return

    let tx = -100, ty = -100, cx = -100, cy = -100
    let raf = 0
    let visible = false

    const onMove = (e: MouseEvent) => {
      tx = e.clientX; ty = e.clientY
      if (!visible) {
        visible = true
        if (dotRef.current)  dotRef.current.style.opacity  = "1"
        if (ringRef.current) ringRef.current.style.opacity = "1"
      }
      if (dotRef.current) dotRef.current.style.transform = `translate(${tx - 2}px,${ty - 2}px)`
    }

    const tick = () => {
      cx += (tx - cx) * 0.09
      cy += (ty - cy) * 0.09
      if (ringRef.current) ringRef.current.style.transform = `translate(${cx - 18}px,${cy - 18}px)`
      raf = requestAnimationFrame(tick)
    }

    const INTERACTIVE = "a,button,[data-cursor='grow'],input,textarea"

    // Delegated so it survives every remount of the grid.
    const onOver = (e: MouseEvent) => {
      const hit = (e.target as HTMLElement)?.closest?.(INTERACTIVE)
      const r = ringRef.current
      if (!r) return
      if (hit) {
        r.style.width = "52px"; r.style.height = "52px"
        r.style.borderColor = "var(--color-fg)"
        r.style.boxShadow = "var(--shadow-glow-sm)"
      } else {
        r.style.width = "36px"; r.style.height = "36px"
        r.style.borderColor = "var(--color-dim)"
        r.style.boxShadow = "none"
      }
    }

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseover", onOver)
    raf = requestAnimationFrame(tick)
    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseover", onOver)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        className="hidden md:block fixed top-0 left-0 w-1 h-1 bg-fg rounded-full pointer-events-none"
        style={{ zIndex: 9999, opacity: 0 }}
      />
      <div
        ref={ringRef}
        className="hidden md:block fixed top-0 left-0 rounded-full border border-dim pointer-events-none"
        style={{
          zIndex: 9999, width: 36, height: 36, opacity: 0,
          transition: "width .25s ease, height .25s ease, border-color .25s ease, box-shadow .25s ease",
        }}
      />
    </>
  )
}
