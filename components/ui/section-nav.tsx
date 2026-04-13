"use client"
import { useState, useEffect } from "react"

const SECTIONS = [
  { id: "work-01",     label: "WORK 01"     },
  { id: "work-02",     label: "WORK 02"     },
  { id: "experiments", label: "EXPERIMENTS" },
  { id: "skills",      label: "SKILLS"      },
  { id: "about",       label: "ABOUT"       },
  { id: "contact",     label: "CONTACT"     },
]

function lenisScrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = (window as any).__lenis
  if (lenis) lenis.scrollTo(el, { duration: 1.1, easing: (t: number) => 1 - Math.pow(1 - t, 4) })
  else el.scrollIntoView({ behavior: "smooth" })
}

export function SectionNav() {
  const [active,  setActive]  = useState("")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) { setActive(e.target.id); setVisible(true) } })
      },
      { threshold: 0.35 }
    )
    const hideIo = new IntersectionObserver(
      entries => { entries.forEach(e => { if (!e.isIntersecting && e.target.id === "work-01") setVisible(false) }) },
      { threshold: 0 }
    )

    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) { io.observe(el); if (s.id === "work-01") hideIo.observe(el) }
    })
    return () => { io.disconnect(); hideIo.disconnect() }
  }, [])

  return (
    <nav
      className="hidden md:flex fixed right-10 top-1/2 -translate-y-1/2 flex-col gap-4 z-50 transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
      aria-label="Section navigation"
    >
      {SECTIONS.map(s => (
        <button
          key={s.id}
          title={s.label}
          onClick={() => lenisScrollTo(s.id)}
          className={`block h-px transition-all duration-300 ease-out ${
            active === s.id ? "w-8 bg-fg" : "w-2 bg-mid hover:w-5 hover:bg-fg"
          }`}
        />
      ))}
    </nav>
  )
}
