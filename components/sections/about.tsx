"use client"
import { useRef } from "react"
import { Reveal } from "@/components/ui/reveal"
import { Counter } from "@/components/ui/counter"

const STATS = [
  { value: 3,  suffix: "+", label: "YEARS ACTIVE"    },
  { value: 10, suffix: "+", label: "PROJECTS BUILT"  },
  { value: 2,  suffix: "",  label: "SPECIALIZATIONS" },
]

const gridBg: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(var(--color-hairline) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-hairline) 1px, transparent 1px)
  `,
  backgroundSize: "60px 60px",
}

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const glowRef    = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!glowRef.current || !sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    glowRef.current.style.left    = `${e.clientX - rect.left}px`
    glowRef.current.style.top     = `${e.clientY - rect.top}px`
    glowRef.current.style.opacity = "1"
  }

  const onLeave = () => {
    if (glowRef.current) glowRef.current.style.opacity = "0"
  }

  return (
    <section
      ref={sectionRef}
      id="about"
      data-snap=""
      className="relative bg-bg border-t border-hairline min-h-screen flex flex-col justify-between p-8 md:p-16 overflow-hidden"
      style={gridBg}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        ref={glowRef}
        className="absolute pointer-events-none"
        style={{
          width:  "700px",
          height: "700px",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(240,240,240,0.055) 0%, transparent 65%)",
          zIndex: 0,
          opacity: 0,
          transition: "opacity 0.4s ease",
        }}
      />

      <Reveal className="relative z-10 flex justify-between items-start w-full">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-mid">ABOUT</span>
        <div className="flex flex-col items-end gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mid hidden md:block">
            BEIRUT → WORLDWIDE
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-mid flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-fg"
              style={{ animation: "blink 1.4s step-start infinite" }}
            />
            AVAILABLE FOR WORK
          </span>
        </div>
      </Reveal>

      <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-20 items-start lg:items-end mt-16">
        <Reveal>
          <h2
            className="font-display tracking-tight leading-[0.85]"
            style={{ fontSize: "clamp(5rem, 16vw, 20rem)" }}
          >
            <span className="text-fg">MIKEL</span>
            <br />
            <span style={{ WebkitTextStroke: "2px #f0f0f0", color: "transparent" }}>
              MRAD.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={120} className="flex flex-col gap-8 max-w-sm lg:pb-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mid leading-loose">
            FULLSTACK DEVELOPER SPECIALIZING IN SHOPIFY,
            HEADLESS COMMERCE, AND HIGH-PERFORMANCE WEB EXPERIENCES.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mid leading-loose">
            I BUILD THINGS THAT ARE FAST, PRECISE,
            AND DESIGNED TO CONVERT.
          </p>
          <div className="flex gap-8 pt-2">
            <a
              href="https://github.com/mikelmrad"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-fg hover:text-mid transition-colors duration-150"
            >
              GITHUB →
            </a>
            <a
              href="https://www.linkedin.com/in/mikel-mrad/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-fg hover:text-mid transition-colors duration-150"
            >
              LINKEDIN →
            </a>
          </div>
        </Reveal>
      </div>

      <Reveal
        delay={200}
        className="relative z-10 w-full border-t border-hairline mt-12 pt-8 grid grid-cols-3 gap-4"
      >
        {STATS.map(s => (
          <div key={s.label} className="flex flex-col gap-2">
            <span
              className="font-display text-fg leading-none"
              style={{ fontSize: "clamp(2.5rem, 6vw, 7rem)" }}
            >
              <Counter to={s.value} suffix={s.suffix} />
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-mid">
              {s.label}
            </span>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
