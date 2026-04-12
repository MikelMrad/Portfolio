"use client"
import { useEffect, useRef } from "react"

export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return

    let tx = -100, ty = -100, cx = -100, cy = -100
    let raf: number
    let visible = false

    const onMove = (e: MouseEvent) => {
      tx = e.clientX; ty = e.clientY
      if (!visible) {
        visible = true
        dotRef.current!.style.opacity  = "1"
        ringRef.current!.style.opacity = "1"
      }
      if (dotRef.current)
        dotRef.current.style.transform = `translate(${tx - 2}px,${ty - 2}px)`
    }

    const tick = () => {
      cx += (tx - cx) * 0.09
      cy += (ty - cy) * 0.09
      if (ringRef.current)
        ringRef.current.style.transform = `translate(${cx - 18}px,${cy - 18}px)`
      raf = requestAnimationFrame(tick)
    }

    const grow   = () => { ringRef.current!.style.width = "52px"; ringRef.current!.style.height = "52px"; ringRef.current!.style.borderColor = "var(--color-fg)" }
    const shrink = () => { ringRef.current!.style.width = "36px"; ringRef.current!.style.height = "36px"; ringRef.current!.style.borderColor = "var(--color-mid)" }
    document.querySelectorAll("a,button").forEach(el => {
      el.addEventListener("mouseenter", grow)
      el.addEventListener("mouseleave", shrink)
    })

    document.addEventListener("mousemove", onMove)
    raf = requestAnimationFrame(tick)
    return () => { document.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf) }
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
        className="hidden md:block fixed top-0 left-0 rounded-full border border-mid pointer-events-none"
        style={{ zIndex: 9999, width: 36, height: 36, opacity: 0, transition: "width 0.25s ease, height 0.25s ease, border-color 0.25s ease" }}
      />
    </>
  )
}
