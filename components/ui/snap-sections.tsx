"use client"
import { useRef, useEffect, ReactNode } from "react"

export function SnapSections({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    let busy = false

    const snap = () => {
      if (busy || !ref.current) return
      if (ref.current.getBoundingClientRect().top > 50) return

      const sections = Array.from(ref.current.querySelectorAll<HTMLElement>("[data-snap]"))
      if (!sections.length) return

      let nearest = sections[0]
      let dist    = Infinity
      sections.forEach(s => {
        const d = Math.abs(s.getBoundingClientRect().top)
        if (d < dist) { dist = d; nearest = s }
      })

      if (dist < 2 || dist > window.innerHeight * 0.28) return

      busy = true
      const lenis = (window as any).__lenis
      if (lenis) {
        lenis.scrollTo(nearest, {
          duration: 0.9,
          easing:   (t: number) => 1 - Math.pow(1 - t, 3),
          onComplete: () => { busy = false },
        })
      } else {
        nearest.scrollIntoView({ behavior: "smooth" })
        setTimeout(() => { busy = false }, 900)
      }
    }

    const onScroll = () => { clearTimeout(timer); timer = setTimeout(snap, 250) }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(timer) }
  }, [])

  return <div ref={ref}>{children}</div>
}
