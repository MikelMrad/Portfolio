"use client"
import { useRef } from "react"

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&"

interface ScrambleTextProps {
  text: string
  className?: string
  speed?: number
}

export function ScrambleText({ text, className, speed = 6 }: ScrambleTextProps) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const rafRef  = useRef(0)
  const iterRef = useRef(0)

  const start = () => {
    cancelAnimationFrame(rafRef.current)
    iterRef.current = 0

    const tick = () => {
      if (!spanRef.current) return
      const iter = iterRef.current
      spanRef.current.textContent = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " "
          if (i < iter) return char
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
        .join("")

      if (iter < text.length) {
        iterRef.current += 1 / speed
        rafRef.current = requestAnimationFrame(tick)
      } else {
        spanRef.current.textContent = text
      }
    }

    tick()
  }

  const stop = () => {
    cancelAnimationFrame(rafRef.current)
    if (spanRef.current) spanRef.current.textContent = text
  }

  return (
    <span
      ref={spanRef}
      className={className}
      onMouseEnter={start}
      onMouseLeave={stop}
    >
      {text}
    </span>
  )
}
