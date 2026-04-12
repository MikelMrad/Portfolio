"use client"
import { Reveal } from "@/components/ui/reveal"
import { Magnetic } from "@/components/ui/magnetic"

type Work = {
  num:      string
  title:    string
  subtitle: string
  year:     string
  url:      string
  image:    string
  stack:    string[]
}

const WORKS: Work[] = [
  {
    num:      "01",
    title:    "UNCLE J\nNUTRITION",
    subtitle: "E-COMMERCE / SHOPIFY",
    year:     "2026",
    url:      "https://unclejnutrition.com",
    image:    "/images/unclejnutriotionproj.png",
    stack:    ["SHOPIFY", "LIQUID"],
  },
  {
    num:      "02",
    title:    "THE\nOUTLETS",
    subtitle: "E-COMMERCE / SHOPIFY",
    year:     "2024",
    url:      "https://theoutletslb.com",
    image:    "/images/theoutlets.png",
    stack:    ["SHOPIFY", "LIQUID"],
  },
]

// ── Glowing white line separator between work items ───────────────────────────
function WorkDivider() {
  return (
    <div className="relative w-full" style={{ height: "1px", overflow: "visible" }}>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, transparent, #f0f0f0 18%, #f0f0f0 82%, transparent)",
          boxShadow: "0 0 18px 3px rgba(240,240,240,0.45), 0 0 55px 8px rgba(240,240,240,0.13)",
        }}
      />
    </div>
  )
}

export function WorkSection() {
  return (
    <section>
      {WORKS.map((w, i) => (
        <div key={w.num}>
          {i > 0 && <WorkDivider />}
          <WorkItem work={w} flip={i % 2 !== 0} />
        </div>
      ))}
    </section>
  )
}

function WorkItem({ work, flip }: { work: Work; flip: boolean }) {
  return (
    <article
      id={`work-${work.num}`}
      data-snap=""
      className="relative border-t border-hairline bg-bg overflow-hidden"
      style={{ minHeight: "100svh" }}
    >
      {/* Ghost section number — structural depth, barely visible */}
      <span
        aria-hidden
        className="absolute font-display leading-none text-fg pointer-events-none select-none"
        style={{
          fontSize: "58vw",
          opacity: 0.028,
          bottom: "-0.12em",
          ...(flip ? { left: "-0.04em" } : { right: "-0.04em" }),
        }}
      >
        {work.num}
      </span>

      <div
        className="relative flex flex-col justify-between gap-10 p-10 md:p-16"
        style={{ minHeight: "100svh" }}
      >
        {/* Top bar */}
        <Reveal className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-mid">
            WORK — {work.num}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mid">
            {work.year}
          </span>
        </Reveal>

        {/* Main title — plain white, large display type */}
        <Reveal
          delay={70}
          className={`flex-1 flex items-center ${flip ? "justify-end" : "justify-start"}`}
        >
          <h2
            className={`font-display text-fg tracking-tight leading-[0.82] whitespace-pre-line ${flip ? "text-right" : "text-left"}`}
            style={{ fontSize: "clamp(3.2rem, 10.4vw, 13.6rem)" }}
          >
            {work.title}
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <div className={`w-full md:w-[42%] overflow-hidden border border-hairline group ${flip ? "ml-auto" : ""}`}>
            <img
              src={work.image}
              alt={work.title.replace("\n", " ")}
              className="w-full h-auto block transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="border-t border-hairline pt-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mid">
                {work.subtitle}
              </span>
              <div className="flex flex-wrap gap-2">
                {work.stack.map(s => (
                  <span
                    key={s}
                    className="font-mono text-[9px] uppercase tracking-[0.18em] border border-hairline text-mid px-2.5 py-1"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <Magnetic strength={0.35}>
              <a
                href={work.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.28em] text-fg border border-fg px-7 py-4 hover:bg-fg hover:text-bg transition-colors duration-150"
              >
                VISIT SITE <span aria-hidden>→</span>
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>

    </article>
  )
}
