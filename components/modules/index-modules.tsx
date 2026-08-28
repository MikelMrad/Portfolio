"use client"
import { EMPLOYER, IDENTITY, PROJECTS, ROLES, STATS } from "@/lib/content"
import { Counter } from "@/components/ui/counter"
import { GlowRule, Label, LiveDot, Tag } from "@/components/ui/bits"
import type { TabId } from "@/lib/grid"

export function Status() {
  return (
    <div className="h-full flex flex-col justify-between p-4 @[260px]:p-5">
      <Label>STATUS</Label>
      <div className="flex items-center gap-2.5">
        <LiveDot />
        <span className="font-display text-fg leading-none tracking-tight text-[clamp(1.1rem,min(14cqw,24cqh),2.5rem)]">
          OPEN
        </span>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim leading-relaxed">
        FREELANCE & FULL-TIME
      </span>
    </div>
  )
}

export function Stats() {
  return (
    <div className="h-full flex flex-col justify-between p-4 @[300px]:p-5">
      <Label>BY THE NUMBERS</Label>
      <div className="grid grid-cols-3 gap-2">
        {STATS.map((s, i) => (
          <div key={s.label} className="flex flex-col gap-1 min-w-0">
            <span className="font-display text-fg leading-none text-[clamp(1.1rem,min(9cqw,22cqh),3rem)]">
              <Counter to={s.value} suffix={s.suffix} delay={500 + i * 120} />
            </span>
            <span className="font-mono text-[7px] @[300px]:text-[8px] uppercase tracking-[0.16em] text-dim leading-tight">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Location() {
  return (
    <div className="h-full flex flex-col justify-between p-4 @[260px]:p-5 overflow-hidden">
      <Label>BASED</Label>
      <div>
        <span className="font-display text-fg leading-[0.9] block tracking-tight text-[clamp(1.25rem,min(18cqw,26cqh),3.25rem)]">
          BEIRUT
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-dim mt-1.5 block">
          {IDENTITY.reach}
        </span>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mid">
        GMT+3 · REMOTE-READY
      </span>
    </div>
  )
}

/** Deep-links into the WORK tab. */
export function Latest({ onGo }: { onGo: (t: TabId) => void }) {
  const p = PROJECTS[0]
  return (
    <button
      onClick={() => onGo("work")}
      className="h-full w-full text-left flex flex-col justify-between p-4 @[300px]:p-5 group"
    >
      <Label right={p.year}>MOST RECENT</Label>
      <div className="min-w-0">
        <span className="font-display text-fg leading-[0.88] block tracking-tight whitespace-pre-line text-[clamp(1.1rem,min(11cqw,17cqh),2.5rem)]">
          {p.title}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim mt-2 block truncate">
          {p.subtitle}
        </span>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-mid group-hover:text-fg transition-colors flex items-center gap-2">
        ALL WORK <span aria-hidden>→</span>
      </span>
    </button>
  )
}

/**
 * The strongest module on the site: four roles, one employer, intern → lead.
 * Rung width encodes seniority so the climb is legible at a glance.
 */
export function Experience({ onOpen }: { onOpen?: () => void }) {
  const Shell = onOpen ? "button" : "div"
  return (
    <Shell
      {...(onOpen ? { onClick: onOpen, type: "button" as const } : {})}
      className="group h-full w-full text-left flex flex-col p-4 @[420px]:p-5 gap-3 min-h-0"
    >
      <Label right={EMPLOYER.span}>EXPERIENCE — {EMPLOYER.name}</Label>

      <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5">
        {ROLES.map((r) => (
          <div key={r.title + r.from} className="group relative flex gap-3 min-h-0">
            {/* Rung — width tracks level, current role glows. */}
            <div className="flex flex-col items-center pt-[7px] shrink-0">
              <span
                className="block h-px bg-fg transition-all duration-300"
                style={{
                  width: 8 + r.level * 7,
                  boxShadow: r.level === 3 ? "0 0 10px 1px rgba(240,240,240,0.6)" : "none",
                  opacity: 0.35 + r.level * 0.22,
                }}
              />
            </div>

            <div className="min-w-0 flex-1 border-b border-hairline pb-1.5 last:border-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[9px] @[420px]:text-[10px] uppercase tracking-[0.12em] text-fg truncate">
                  {r.title}
                </span>
                <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-dim shrink-0">
                  {r.from} — {r.to}
                </span>
              </div>
              {/* The clamp lives on the inner <p>: putting it alongside
                  `@[420px]:block` overrode line-clamp's own display value. */}
              <div className="role-blurb mt-1">
                <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-dim leading-relaxed line-clamp-2">
                  {r.blurb}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="hidden @[420px]:flex flex-wrap gap-1.5">
          {["REACT NATIVE", "NEXT.JS", "GRAPHQL", "TYPESCRIPT"].map((s) => <Tag key={s}>{s}</Tag>)}
        </div>
        {onOpen && (
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-dim group-hover:text-fg transition-colors flex items-center gap-2 shrink-0 ml-auto">
            EXPAND <span aria-hidden>↗</span>
          </span>
        )}
      </div>
    </Shell>
  )
}

/**
 * The expanded timeline. Same data, but every role gets its full write-up and
 * its own stack — the card can only ever show two clamped lines.
 */
export function ExperienceDetail() {
  return (
    <div className="h-full flex flex-col p-5 @[700px]:p-6 gap-4 min-h-0 overflow-y-auto">
      <Label right={EMPLOYER.span}>EXPERIENCE — {EMPLOYER.name}</Label>

      <div className="shrink-0">
        <h2 className="font-display text-fg leading-[0.86] tracking-tight text-[clamp(1.75rem,min(9cqw,14cqh),4.5rem)]">
          {EMPLOYER.name}
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mid mt-2 leading-relaxed">
          {EMPLOYER.summary}
        </p>
      </div>

      <GlowRule />

      {/* Spread down the panel rather than pooling at the top. If the content
          is ever taller than the panel this behaves as flex-start and the
          wrapper scrolls, so nothing is lost. */}
      <div className="flex-1 min-h-0 flex flex-col justify-between gap-4 @[700px]:gap-5">
        {ROLES.map((r) => (
          <div key={r.title + r.from} className="flex gap-3 @[700px]:gap-4">
            {/* Rung width tracks seniority; the current role glows. */}
            <div className="flex flex-col items-center pt-2 shrink-0">
              <span
                className="block h-px bg-fg"
                style={{
                  width: 12 + r.level * 9,
                  boxShadow: r.level === 3 ? "0 0 10px 1px rgba(240,240,240,0.6)" : "none",
                  opacity: 0.35 + r.level * 0.22,
                }}
              />
            </div>

            <div className="min-w-0 flex-1 border-b border-hairline pb-4 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-mono text-[11px] @[700px]:text-xs uppercase tracking-[0.12em] text-fg">
                  {r.title}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim shrink-0">
                  {r.from} — {r.to} · {r.months} MOS · {r.type}
                </span>
              </div>

              <p className="font-mono text-[10px] leading-relaxed text-mid mt-2">{r.blurb}</p>

              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {r.skills.map((sk) => <Tag key={sk}>{sk}</Tag>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
