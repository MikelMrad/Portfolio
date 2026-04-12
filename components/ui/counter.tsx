"use client"
import { useEffect, useRef, useState } from "react"

export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref     = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        const t0 = performance.now()
        const dur = 1600
        const tick = (now: number) => {
          const t    = Math.min(1, (now - t0) / dur)
          const ease = 1 - Math.pow(1 - t, 3)
          setVal(Math.round(ease * to))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        io.disconnect()
      },
      { threshold: 0.5 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [to])

  return <span ref={ref}>{val}{suffix}</span>
}
