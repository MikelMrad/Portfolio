"use client"
import { useState } from "react"
import Image from "next/image"
import { CONTACT, whatsappUrl } from "@/lib/config"
import { useBusiness } from "@/lib/i18n"
import { Counter } from "@/components/ui/counter"
import { Label, LiveDot, WhatsAppIcon } from "@/components/ui/bits"
import { PRIMARY, SECONDARY, WhatsAppButton } from "./sales-modules"

/**
 * The business INDEX, work first: the showreel, the figures, what I build and
 * the way in. The site shows the work and keeps a door open beside it rather
 * than pitching; the prices are a line in a list, and every call to action is
 * one tap from wherever the visitor is looking.
 */

const Arrow = ({ glyph = "→" }: { glyph?: string }) => (
  <span aria-hidden className="inline-block rtl:-scale-x-100">{glyph}</span>
)

/**
 * The showreel: one project at a time, its screenshot in full colour (the
 * work is the content here, as in the expanded detail), the title and the
 * outcome under it, and a story-style bar per project.
 *
 * The bar is the clock: the active one fills by CSS (`.reel-run`), and its
 * animationend advances the reel. So hovering pauses it (animation-play-state)
 * with no timer to keep in step, a background tab throttles it with everything
 * else, and reduced motion simply stops it: the bars still pick a project.
 */
export function Reel({ onOpen }: { onOpen: (num: string) => void }) {
  const { PROJECTS, UI } = useBusiness()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const p = PROJECTS[i]
  const title = p.title.replace("\n", " ")
  const count = String(PROJECTS.length).padStart(2, "0")

  return (
    <div
      className="group h-full flex flex-col min-h-0"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setPaused(true) }}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="px-4 pt-4 @[420px]:px-5 @[420px]:pt-5">
        <Label right={<span dir="ltr">{p.num} / {count}</span>}>{UI.reel.label}</Label>
      </div>

      <button
        type="button"
        onClick={() => onOpen(p.num)}
        aria-label={`${UI.reel.open}: ${title}`}
        className="relative flex-1 min-h-0 mx-4 @[420px]:mx-5 mt-3 overflow-hidden border border-hairline bg-bg"
      >
        {PROJECTS.map((q, n) => (
          <Image
            key={q.num}
            src={q.images[0]}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            priority={n === 0}
            className={`object-cover object-top transition-[opacity,scale] duration-700 ease-out ${
              n === i ? "opacity-100 scale-100 group-hover:scale-[1.02]" : "opacity-0 scale-[1.04]"
            }`}
          />
        ))}
      </button>

      <button
        type="button"
        onClick={() => onOpen(p.num)}
        className="px-4 @[420px]:px-5 pt-3 flex items-end justify-between gap-4 min-w-0 text-start"
      >
        <div key={p.num} className="reel-copy min-w-0">
          <span className="block font-display uppercase text-fg leading-[0.88] tracking-tight truncate text-[clamp(1.25rem,min(7cqw,10cqh),4.5rem)]">
            {title}
          </span>
          <div className="cq-h240">
            <span className="block font-mono text-[9px] @[420px]:text-[10px] uppercase tracking-[0.1em] text-mid mt-1.5 truncate">
              {p.headline}
            </span>
          </div>
        </div>
        <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.22em] text-dim group-hover:text-fg transition-colors">
          <span className="hidden @[360px]:inline">{UI.reel.open} </span><Arrow glyph="↗" />
        </span>
      </button>

      <div className="px-4 @[420px]:px-5 pb-3 @[420px]:pb-4 pt-2 flex gap-1.5">
        {PROJECTS.map((q, n) => (
          <button
            key={q.num}
            type="button"
            onClick={() => setI(n)}
            aria-label={UI.reel.pick(q.num)}
            aria-current={n === i || undefined}
            className="flex-1 py-2"
          >
            <span className="block h-[2px] bg-hairline relative overflow-hidden">
              <span
                key={n === i ? `run-${i}` : `idle-${n}`}
                className={`absolute inset-0 bg-fg origin-left rtl:origin-right ${
                  n === i ? "reel-run" : n < i ? "scale-x-100" : "scale-x-0"
                }`}
                style={n === i ? { animationPlayState: paused ? "paused" : "running" } : undefined}
                onAnimationEnd={n === i ? () => setI((i + 1) % PROJECTS.length) : undefined}
              />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/** Four figures, counted up on arrival, in a row whatever the card's width. */
export function Numbers() {
  const { NUMBERS } = useBusiness()
  return (
    <div className="h-full flex flex-col justify-between p-4 @[420px]:p-5 gap-2">
      <Label>{NUMBERS.label}</Label>
      <div className="grid grid-cols-4 gap-3 @[420px]:gap-5">
        {NUMBERS.items.map((s, i) => (
          <div key={s.label} className="flex flex-col gap-1.5 min-w-0 border-t border-hairline pt-2 @[420px]:pt-3">
            <span className="font-display text-fg leading-[0.85] tracking-tight text-[clamp(1.4rem,min(15cqw,42cqh),8rem)]">
              <Counter to={s.value} suffix={s.suffix} delay={500 + i * 120} />
            </span>
            <span className="cq-h100 font-mono text-[7px] @[420px]:text-[8px] uppercase tracking-[0.14em] text-dim leading-tight">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * WHAT I BUILD as a list rather than four price cards: one row per service,
 * the price beside it where the card is wide enough, and each row opening
 * that service's full detail (its includes, the care plans, its WhatsApp).
 */
export function ServiceList({ onOpen }: { onOpen: (id: string) => void }) {
  const { SERVICES } = useBusiness()
  return (
    <div className="h-full flex flex-col p-4 @[300px]:p-5 gap-2 min-h-0">
      <Label right={String(SERVICES.items.length).padStart(2, "0")}>{SERVICES.label}</Label>
      <ul className="flex-1 min-h-0 flex flex-col">
        {SERVICES.items.map((s) => (
          <li key={s.id} className="flex-1 min-h-0 border-t border-hairline">
            <button
              type="button"
              onClick={() => onOpen(s.id)}
              className="group w-full h-full flex items-center gap-3 text-start min-w-0"
            >
              <span className="hidden @[260px]:inline font-mono text-[8px] tracking-[0.16em] text-dim tabular-nums shrink-0">
                {s.num}
              </span>
              <span className="flex-1 min-w-0 truncate font-display uppercase text-mid group-hover:text-fg transition-colors leading-none tracking-tight text-[clamp(0.95rem,min(9cqw,9cqh),2.5rem)]">
                {s.title.replace("\n", " ")}
              </span>
              <span className="hidden @[320px]:inline font-mono text-[9px] uppercase tracking-[0.12em] text-dim group-hover:text-mid transition-colors shrink-0">
                {s.price}
              </span>
              <span className="font-mono text-[10px] text-dim group-hover:text-fg transition-colors shrink-0">
                <Arrow glyph="↗" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The way in: live status, the outlined close, WhatsApp first. */
export function StartCta() {
  const { UI } = useBusiness()
  return (
    <div className="h-full flex flex-col justify-between p-4 @[300px]:p-5 gap-2 min-h-0">
      <div className="flex items-center gap-2 min-w-0">
        <LiveDot />
        <span className="font-mono text-[8px] @[260px]:text-[9px] uppercase tracking-[0.18em] text-mid truncate">
          {UI.cta.status}
        </span>
      </div>

      <div className="flex flex-col gap-2 min-h-0">
        <h2 className="font-display uppercase text-fg leading-[0.84] tracking-tight text-[clamp(1.3rem,min(15cqw,19cqh),4.5rem)]">
          {UI.cta.headline[0]}
          <br />
          <span className="text-transparent [-webkit-text-stroke:1px_var(--color-fg)]">{UI.cta.headline[1]}</span>
        </h2>
        <div className="cq-h240">
          <p className="font-mono text-[10px] leading-relaxed text-mid">{UI.cta.line}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <WhatsAppButton label={UI.contact.whatsapp} />
        <div className="cq-h220">
          <a href={`mailto:${CONTACT.email}`} title={CONTACT.email} className={SECONDARY}>
            {UI.cta.email}
          </a>
        </div>
      </div>
    </div>
  )
}

/** Under an opened project: "want one like this?", with the project named. */
export function ProjectCta({ title }: { title: string }) {
  const { UI } = useBusiness()
  return (
    <a
      href={whatsappUrl(UI.projectCta.message(title))}
      target="_blank"
      rel="noopener noreferrer"
      className={PRIMARY}
    >
      <WhatsAppIcon size={13} /> {UI.projectCta.label}
    </a>
  )
}
