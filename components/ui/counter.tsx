"use client"
import { useEffect, useRef, useState } from "react"

/**
 * Ported from v3 but re-triggered on mount rather than on scroll into view —
 * nothing scrolls here, and cards arrive already visible.
 */
export function Counter({ to, suffix = "", delay = 0 }: { to: number; suffix?: string; delay?: number }) {
  const [val, setVal] = useState(0)
  const raf = useRef(0)

  useEffect(() => {
    const DUR = 1300
    let t0 = 0

    const tick = (now: number) => {
      if (!t0) t0 = now
      const t = Math.min(1, (now - t0) / DUR)
      setVal(Math.round((1 - Math.pow(1 - t, 3)) * to))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }

    const timer = setTimeout(() => { raf.current = requestAnimationFrame(tick) }, delay)
    return () => { clearTimeout(timer); cancelAnimationFrame(raf.current) }
  }, [to, delay])

  return <span>{val}{suffix}</span>
}
