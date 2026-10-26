"use client"
import { CONTACT } from "@/lib/config"
import type { StackCategory } from "@/lib/content-types"
import type { TabId } from "@/lib/grid"
import { useCv } from "@/lib/i18n"
import { Counter } from "@/components/ui/counter"
import { ScrambleText } from "@/components/ui/scramble-text"
import { GlowRule, Label, LiveDot } from "@/components/ui/bits"
import { Magnetic } from "@/components/ui/magnetic"

/**
 * The modules only the portfolio variant (portfolio.mikelmrad.dev) draws,
 * restored from the site as it was before the business rewrite (commit
 * c7e5dc1): the figures, status, location and latest cards, the CV card, the
 * stack sheets and the contact cards. Everything else on that site is the
 * shared modules, reading the portfolio's copy.
 */

export function Status() {
  const { IDENTITY, UI } = useCv()
  return (
    <div className="h-full flex flex-col justify-between p-4 @[260px]:p-5">
      <Label>{UI.status.label}</Label>
      <div className="flex items-center gap-2.5">
        <LiveDot />
        <span className="font-display text-fg leading-none tracking-tight text-[clamp(1.1rem,min(14cqw,24cqh),2.5rem)]">
          {UI.status.value}
        </span>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim leading-relaxed">
        {IDENTITY.availability.note}
      </span>
    </div>
  )
}

export function Stats() {
  const { STATS, UI } = useCv()
  return (
    <div className="h-full flex flex-col justify-between p-4 @[300px]:p-5">
      <Label>{UI.stats.label}</Label>
      {/* Column count follows the data — the row fills whether STATS holds two
          entries or four, with no class to keep in sync. */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${STATS.length}, minmax(0, 1fr))` }}>
        {STATS.map((s, i) => (
          <div key={s.label} className="flex flex-col gap-1 min-w-0">
            <span className="font-display text-fg leading-none text-[clamp(1.1rem,min(9cqw,22cqh),3rem)]">
              <Counter to={s.value} suffix={s.suffix} delay={500 + i * 120} />
            </span>
            {/* A landscape phone gives this card ~65px, which is a numeral and
                nothing else. The captions go rather than being sliced in half. */}
            <span className="cq-h80 font-mono text-[7px] @[300px]:text-[8px] uppercase tracking-[0.16em] text-dim leading-tight">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * BY THE NUMBERS at full size. Two numerals in a whole-grid box read as an
 * empty page, so the expanded view carries the figures behind them — a spec
 * sheet of six, each with the line that qualifies it. Two columns in a
 * portrait box, three in a landscape one.
 */
export function StatsDetail() {
  const { STATS_DETAIL, UI } = useCv()
  return (
    <div className="h-full flex flex-col p-4 @[420px]:p-6 gap-4 min-h-0">
      <Label right={UI.stats.figures(STATS_DETAIL.length)}>{UI.stats.label}</Label>
      <div className="stats-detail flex-1 min-h-0 grid gap-x-4 @[420px]:gap-x-6">
        {STATS_DETAIL.map((s, i) => (
          <div key={s.label} className="flex flex-col justify-end gap-2 border-t border-hairline pt-3 pb-1 min-h-0 min-w-0">
            <span className="font-display text-fg leading-[0.85] tracking-tight text-[clamp(2.25rem,min(13cqw,17cqh),9rem)]">
              <Counter to={s.value} suffix={s.suffix ?? ""} delay={250 + i * 90} />
            </span>
            <span className="font-mono text-[9px] @[420px]:text-[10px] uppercase tracking-[0.18em] text-fg truncate">
              {s.label}
            </span>
            <span className="font-mono text-[8px] @[420px]:text-[9px] uppercase tracking-[0.16em] text-dim truncate">
              {s.note}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Location() {
  const { IDENTITY, UI } = useCv()
  return (
    <div className="h-full flex flex-col justify-between p-4 @[260px]:p-5 overflow-hidden">
      <Label>{UI.location.label}</Label>
      <div>
        <span className="font-display text-fg leading-[0.9] block tracking-tight text-[clamp(1.25rem,min(18cqw,26cqh),3.25rem)]">
          {UI.location.city}
        </span>
        <div className="cq-h100">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-dim mt-1.5 block">
            {IDENTITY.reach}
          </span>
        </div>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mid">
        {UI.location.note}
      </span>
    </div>
  )
}

/** Deep-links into the WORK tab. */
export function Latest({ onGo }: { onGo: (t: TabId) => void }) {
  const { PROJECTS, UI } = useCv()
  const p = PROJECTS[0]
  return (
    <button
      onClick={() => onGo("work")}
      className="h-full w-full text-start flex flex-col justify-between p-4 @[300px]:p-5 group"
    >
      <Label right={p.year}>{UI.latest.label}</Label>
      <div className="min-w-0">
        <span className="font-display text-fg leading-[0.88] block tracking-tight whitespace-pre-line text-[clamp(1.1rem,min(11cqw,17cqh),2.5rem)]">
          {p.title}
        </span>
        {/* Two rows on a 360px phone is 86px — enough for the title and the
            link out, and not for this as well. The link is the point.
            Gated on the wrapper: .cq-h100 reverts `display`, and `truncate`
            needs a block box to have anything to overflow. */}
        <div className="cq-h100">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim mt-2 block truncate">
            {p.headline}
          </span>
        </div>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-mid group-hover:text-fg transition-colors flex items-center gap-2">
        {UI.latest.cta} <span aria-hidden className="inline-block rtl:-scale-x-100">→</span>
      </span>
    </button>
  )
}

export function CvCard() {
  const { UI } = useCv()
  return (
    <div className="h-full flex flex-col justify-between p-4 @[260px]:p-5">
      <Label right="PDF">{UI.cv.label}</Label>
      <div className="flex flex-col gap-2">
        {/* One line in the phone's full-width bar, two in the desktop card's
            portrait box — the break is gated on the same height as the contents
            line below it. */}
        <span className="font-display text-fg leading-[0.88] block tracking-tight text-[clamp(1.25rem,min(20cqw,20cqh),3rem)]">
          {UI.cv.top}{" "}
          <br className="cq-h160" />
          {UI.cv.bottom}
        </span>
        {/* First thing to go when the card is short — the CV itself says this,
            and DOWNLOAD is the only line here that has to survive. */}
        <span className="cq-h160 font-mono text-[9px] uppercase tracking-[0.16em] text-dim leading-relaxed">
          {UI.cv.contents}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <GlowRule />
        <Magnetic strength={0.25}>
          <a
            href={CONTACT.cv}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[9px] uppercase tracking-[0.24em] text-mid hover:text-fg transition-colors flex items-center gap-2"
          >
            {UI.cv.download} <span aria-hidden>↓</span>
          </a>
        </Magnetic>
      </div>
    </div>
  )
}

export function TechCount() {
  const { STACK, TECH_COUNT, UI } = useCv()
  return (
    <div className="h-full flex flex-col justify-between p-4 @[260px]:p-5">
      <Label>{UI.toolbox.label}</Label>
      <div>
        <span className="font-display text-fg leading-none block text-[clamp(1.5rem,min(22cqw,26cqh),3.75rem)]">
          <Counter to={TECH_COUNT} delay={450} />
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim block mt-1">
          {UI.toolbox.technologies}
        </span>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mid leading-relaxed">
        {UI.toolbox.categories(STACK.length)}
      </span>
    </div>
  )
}

export function Category({ cat }: { cat: StackCategory }) {
  return (
    <div className="h-full flex flex-col p-4 @[240px]:p-5 gap-3 min-h-0">
      <Label right={String(cat.skills.length).padStart(2, "0")}>{cat.label}</Label>

      {/* A spec sheet, not a chip cloud. Each row takes an equal share of the
          column, so the card fills whether it holds 2 entries or 12. */}
      <ul className="flex-1 min-h-0 flex flex-col">
        {cat.skills.map((skill, i) => (
          <li
            key={skill}
            className="flex-1 min-h-0 flex items-center justify-between gap-2 border-b border-hairline last:border-0 group"
          >
            {/* Technology names are Latin in both languages; isolated, or an
                RTL line turns "C++" into "++C". */}
            <span dir="ltr" className="font-mono text-[10px] @[240px]:text-[11px] uppercase tracking-[0.12em] text-mid group-hover:text-fg transition-colors truncate">
              {skill}
            </span>
            <span className="font-mono text-[8px] tracking-[0.16em] text-dim shrink-0 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Headline() {
  const { IDENTITY, UI } = useCv()
  return (
    <div className="h-full flex flex-col justify-between p-4 @[300px]:p-6 overflow-hidden">
      <Label>{UI.contact.label}</Label>
      <h2 className="font-display text-fg leading-[0.82] tracking-tight text-[clamp(2rem,min(20cqw,26cqh),8rem)]">
        {UI.contact.headline[0]}
        <br />
        <span style={{ WebkitTextStroke: "2px var(--color-fg)", color: "transparent" }}>{UI.contact.headline[1]}</span>
      </h2>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim leading-relaxed">
        {IDENTITY.availability.long}
      </span>
    </div>
  )
}

export function EmailCard() {
  const { UI } = useCv()
  return (
    <div className="h-full flex flex-col justify-between p-4 @[400px]:p-5 gap-2 min-w-0">
      {/* The phone number and the address are left-to-right in either
          language — isolated, or an RTL page reorders "+961" to the end. */}
      <Label right={<span dir="ltr">{CONTACT.phone}</span>}>{UI.contact.direct}</Label>
      <a
        href={`mailto:${CONTACT.email}`}
        className="font-mono text-[11px] @[400px]:text-sm uppercase tracking-[0.14em] text-fg hover:text-mid transition-colors flex items-center gap-3 min-w-0"
      >
        <span className="inline-block w-4 h-px bg-fg shrink-0" style={{ boxShadow: "0 0 8px 1px rgb(var(--glow) / calc(0.5 * var(--glow-k)))" }} />
        <span dir="ltr" className="min-w-0"><ScrambleText text={CONTACT.email.toUpperCase()} speed={5} /></span>
      </a>
      <GlowRule />
    </div>
  )
}

export function Socials() {
  const { UI } = useCv()
  const links = [
    { label: UI.contact.github,     href: CONTACT.github },
    { label: UI.contact.linkedin,   href: CONTACT.linkedin },
    { label: `${UI.contact.cv} ↓`,  href: CONTACT.cv },
  ]
  return (
    /* Three nowrap labels in a 180px phone cell only fit at the tighter of the
       two scales — hence the gates on gap, padding and tracking. */
    <div className="h-full flex items-center justify-between @[220px]:justify-start gap-2 @[220px]:gap-5 px-3 @[300px]:px-5">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[8px] @[220px]:text-[9px] uppercase tracking-[0.14em] @[220px]:tracking-[0.24em] text-mid hover:text-fg transition-colors whitespace-nowrap"
        >
          {l.label}
        </a>
      ))}
    </div>
  )
}
