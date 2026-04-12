"use client"
import { useRef } from "react"
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

      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 border-t border-hairline gap-px bg-hairline">
        {XPS.map((xp, i) => <XPCard key={xp.num} xp={xp} index={i} />)}
      </div>
    </section>
  )
}

function XPCard({ xp, index }: { xp: Experiment; index: number }) {
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
    <Reveal
      delay={index * 90}
      className="bg-bg"
    >
      <a
        ref={cardRef}
        href={xp.url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="group relative block overflow-hidden"
        style={{
          minHeight: "65vh",
          transformStyle: "preserve-3d",
          transition: "transform 0.1s linear",
          willChange: "transform",
        }}
      >
        <img
          src={xp.image}
          alt={xp.title.replace("\n", " ")}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out grayscale group-hover:grayscale-0"
        />

        <div className="absolute inset-0 bg-bg/[0.72] group-hover:bg-bg/[0.38] transition-all duration-500" />

        <span
          aria-hidden
          className="absolute font-display leading-none text-fg pointer-events-none select-none"
          style={{
            fontSize: "clamp(10rem, 30vw, 22rem)",
            opacity: 0.045,
            bottom: "-0.12em",
            right: "-0.04em",
          }}
        >
          {xp.num}
        </span>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 flex flex-col gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-mid">
            EXP — {xp.num}
          </span>
          <h3
            className="font-display text-fg leading-tight whitespace-pre-line"
            style={{ fontSize: "clamp(2rem, 4vw, 4.5rem)" }}
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
    </Reveal>
  )
}
