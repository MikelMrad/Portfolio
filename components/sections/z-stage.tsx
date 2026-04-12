"use client"
import { useEffect, useRef, useState } from "react"
import { Scene } from "@/components/three/scene"

const SCROLL_HEIGHT = "300vh"

export function ZStage() {
  const wrapperRef  = useRef<HTMLDivElement>(null)
  const overlayRef  = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const jumped      = useRef(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const wrapper = wrapperRef.current
    if (!wrapper) return
    let rafId = 0

    const update = () => {
      const scrollable = wrapper.offsetHeight - window.innerHeight
      const scrolled   = window.scrollY - wrapper.offsetTop
      const p = Math.max(0, Math.min(1, scrolled / scrollable))
      progressRef.current = p

      if (overlayRef.current) {
        overlayRef.current.style.opacity = String(Math.max(0, (p - 0.9) / 0.1))
      }

      if (p >= 0.98 && !jumped.current) {
        jumped.current = true
        setTimeout(() => {
          const el = document.getElementById("work-01")
          if (!el) return
          if (window.scrollY < wrapper.offsetTop + wrapper.offsetHeight) {
            const lenis = (window as any).__lenis
            if (lenis) lenis.scrollTo(el, { immediate: true })
            else window.scrollTo({ top: el.offsetTop })
          }
        }, 60)
      }

      if (p < 0.1) jumped.current = false

      rafId = requestAnimationFrame(update)
    }

    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div ref={wrapperRef} className="relative w-full" style={{ height: SCROLL_HEIGHT }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-bg">
        <Scene progressRef={progressRef} />

        {mounted && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-6 left-6 md:top-10 md:left-12 font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-mid flex items-center gap-3">
              <span className="inline-block w-1.5 h-1.5 bg-fg" />MIKEL MRAD / PORTFOLIO 2026
            </div>
            <div className="absolute top-6 right-6 md:top-10 md:right-12 font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-mid">FULLSTACK / SHOPIFY / WEB</div>
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-12 font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-mid">[01 / 02] — HERO</div>
            <div className="hidden sm:flex absolute bottom-6 right-6 md:bottom-10 md:right-12 font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-mid items-center gap-2">
              SCROLL TO ENTER<span className="inline-block w-6 h-px bg-mid" />
            </div>
          </div>
        )}

        <div
          ref={overlayRef}
          className="absolute inset-0 bg-bg pointer-events-none"
          style={{ opacity: 0, zIndex: 20 }}
        />
      </div>
    </div>
  )
}
