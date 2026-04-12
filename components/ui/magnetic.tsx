"use client"
import { useRef, useEffect, ReactNode } from "react"

interface MagneticProps {
  children: ReactNode
  strength?: number
  className?: string
}

export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const ref     = useRef<HTMLDivElement>(null)
  const rafRef  = useRef(0)
  const posRef  = useRef({ x: 0, y: 0 })
  const curRef  = useRef({ x: 0, y: 0 })
  const tickRef = useRef<() => void>(() => {})

  useEffect(() => {
    const tick = () => {
      if (!ref.current) return
      const tx = posRef.current.x
      const ty = posRef.current.y
      curRef.current.x += (tx - curRef.current.x) * 0.12
      curRef.current.y += (ty - curRef.current.y) * 0.12
      ref.current.style.transform = `translate(${curRef.current.x}px, ${curRef.current.y}px)`
      if (
        Math.abs(tx - curRef.current.x) > 0.05 ||
        Math.abs(ty - curRef.current.y) > 0.05
      ) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    tickRef.current = tick
  }, [])

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    posRef.current = {
      x: (e.clientX - rect.left - rect.width  / 2) * strength,
      y: (e.clientY - rect.top  - rect.height / 2) * strength,
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tickRef.current)
  }

  const handleLeave = () => {
    posRef.current = { x: 0, y: 0 }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tickRef.current)
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ display: "inline-block", willChange: "transform" }}
    >
      {children}
    </div>
  )
}
