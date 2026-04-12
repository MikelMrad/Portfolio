"use client"
import { useRef, useState, useCallback } from "react"
import { Reveal } from "@/components/ui/reveal"

type Experiment = {
  num:   string
  title: string
  image: string
  stack: string[]
  url:   string
}

const XPS: Experiment[] = [
  {
    num:   "01",
    title: "SUPPLEMENT\nSTORE",
    image: "/images/supp.jpg",
    stack: ["MERN STACK"],
    url:   "https://github.com/MikelMrad/Supplement-Store",
  },
  {
    num:   "02",
    title: "TUTOR\nME",
    image: "/images/tutorme.jpg",
    stack: ["NEXT.JS", "TS", "PRISMA", "GQL"],
    url:   "https://github.com/MikelMrad/Final-Year-Project",
  },
  {
    num:   "03",
    title: "UNDER\nCONSTRUCTION",
    image: "/images/under-construction.png",
    stack: ["REACT", "PYTHON"],
    url:   "https://github.com/MikelMrad",
  },
]

export function ExperimentsSection() {
  const trackRef  = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const scrollToIdx = useCallback((idx: number) => {
    const track = trackRef.current
    if (!track) return
    const child = track.children[idx] as HTMLElement
    if (!child) return
    const offset = child.offsetLeft - (track.offsetWidth - child.offsetWidth) / 2
    track.scrollTo({ left: offset, behavior: "smooth" })
    setActive(idx)
  }, [])

  const onScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const center = track.scrollLeft + track.offsetWidth / 2
    let closest = 0
    let minDist  = Infinity
    Array.from(track.children).forEach((child, i) => {
      const el   = child as HTMLElement
      const dist = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center)
      if (dist < minDist) { minDist = dist; closest = i }
    })
    setActive(closest)
  }, [])

  return (
    <section
      id="experiments"
      data-snap=""
      className="bg-bg border-t border-hairline"
    >
      <Reveal className="flex items-end justify-between px-8 md:px-16 pt-14 md:pt-20 pb-0 gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-mid">
            EXPERIMENTS — NOT PRODUCTION
          </span>
          <h2
            className="font-display leading-none tracking-tight text-fg"
            style={{ fontSize: "clamp(3rem, 7.5vw, 9rem)" }}
          >
            SIDE WORK.
          </h2>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-mid hidden md:block pb-2">
          0{XPS.length} EXPERIMENTS
        </span>
      </Reveal>

      {/* ── Carousel ─────────────────────────────────────────────── */}
      <div className="mt-14 border-t border-hairline">

        {/* Track */}
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {XPS.map((xp, i) => (
            <div
              key={xp.num}
              className="snap-center shrink-0 w-full flex justify-center md:py-10 md:px-[10%]"
            >
              <div className="w-full">
                <XPCard xp={xp} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Controls bar ─────────────────────────────────────────── */}
        <div className="border-t border-hairline flex items-center justify-between px-8 md:px-16 py-5">

          {/* Index counter */}
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-mid">
            {String(active + 1).padStart(2, "0")} / {String(XPS.length).padStart(2, "0")}
          </span>

          {/* Dot indicators — matches SectionNav style */}
          <div className="flex items-center gap-3">
            {XPS.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIdx(i)}
                aria-label={`Go to experiment ${i + 1}`}
                className={`block h-px transition-all duration-300 ease-out ${
                  active === i
                    ? "w-8 bg-fg"
                    : "w-2 bg-mid hover:w-5 hover:bg-fg"
                }`}
              />
            ))}
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToIdx(Math.max(0, active - 1))}
              disabled={active === 0}
              aria-label="Previous experiment"
              className="w-8 h-8 rounded-full border border-fg flex items-center justify-center font-mono text-[11px] text-fg hover:bg-fg hover:text-bg transition-colors duration-150 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              ←
            </button>
            <button
              onClick={() => scrollToIdx(Math.min(XPS.length - 1, active + 1))}
              disabled={active === XPS.length - 1}
              aria-label="Next experiment"
              className="w-8 h-8 rounded-full border border-fg flex items-center justify-center font-mono text-[11px] text-fg hover:bg-fg hover:text-bg transition-colors duration-150 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function XPCard({ xp }: { xp: Experiment }) {
  const cardRef = useRef<HTMLAnchorElement>(null)

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width  - 0.5
    const y = (e.clientY - r.top)  / r.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 6}deg) scale3d(1.02,1.02,1.02)`
  }

  const onLeave = () => {
    const el = cardRef.current
    if (!el) return
    el.style.transform = ""
  }

  return (
    <a
      ref={cardRef}
      href={xp.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative block overflow-hidden"
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 0.1s linear",
        willChange: "transform",
      }}
    >
      {/* Image drives height naturally — no cropping */}
      <img
        src={xp.image}
        alt={xp.title.replace("\n", " ")}
        className="w-full h-auto block transition-all duration-700 ease-out grayscale group-hover:grayscale-0"
      />

      <div className="absolute inset-0 bg-bg/[0.72] group-hover:bg-bg/[0.38] transition-all duration-500" />

      {/* Ghost number */}
      <span
        aria-hidden
        className="absolute font-display leading-none text-fg pointer-events-none select-none"
        style={{
          fontSize: "clamp(8rem, 22vw, 20rem)",
          opacity: 0.045,
          bottom: "-0.12em",
          right: "-0.04em",
        }}
      >
        {xp.num}
      </span>

      {/* Card info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col gap-2 md:gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-mid">
          EXP — {xp.num}
        </span>
        <h3
          className="font-display text-fg leading-tight whitespace-pre-line"
          style={{ fontSize: "clamp(1.75rem, 4vw, 4.5rem)" }}
        >
          {xp.title}
        </h3>
        <div className="flex flex-wrap gap-2 mt-1">
          {xp.stack.map(s => (
            <span
              key={s}
              className="font-mono text-[8px] uppercase tracking-[0.2em] border border-hairline text-mid px-2.5 py-1"
            >
              {s}
            </span>
          ))}
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-mid group-hover:text-fg transition-colors duration-200 flex items-center gap-2 mt-2">
          VIEW ON GITHUB <span aria-hidden>→</span>
        </span>
      </div>
    </a>
  )
}
