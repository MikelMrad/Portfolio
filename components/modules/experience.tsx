"use client"
import { useContent } from "@/lib/i18n"
import { GlowRule, Label, Tag } from "@/components/ui/bits"

/**
 * Four roles, one employer, intern to lead.
 * Rung width encodes seniority so the climb is legible at a glance.
 */
export function Experience({ onOpen }: { onOpen?: () => void }) {
  const { EMPLOYER, ROLES, UI } = useContent()
  const Shell = onOpen ? "button" : "div"
  return (
    <Shell
      {...(onOpen ? { onClick: onOpen, type: "button" as const } : {})}
      className="group h-full w-full text-start flex flex-col p-4 @[420px]:p-5 gap-3 min-h-0"
    >
      <Label right={EMPLOYER.span}>{UI.experience.label} · {EMPLOYER.name}</Label>

      <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5">
        {ROLES.map((r) => (
          <div key={r.title + r.from} className="group relative flex gap-3 min-h-0">
            {/* Rung — width tracks level, current role glows. */}
            <div className="flex flex-col items-center pt-[7px] shrink-0">
              <span
                className="block h-px bg-fg transition-all duration-300"
                style={{
                  width: 8 + r.level * 7,
                  boxShadow: r.level === 3 ? "0 0 10px 1px rgb(var(--glow) / calc(0.6 * var(--glow-k)))" : "none",
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
                  {UI.range(r.from, r.to)}
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
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-dim group-hover:text-fg transition-colors flex items-center gap-2 shrink-0 ms-auto">
            {UI.expand} <span aria-hidden className="inline-block rtl:-scale-x-100">↗</span>
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
  const { EMPLOYER, ROLES, UI } = useContent()
  return (
    <div className="h-full flex flex-col p-5 @[700px]:p-6 gap-4 min-h-0 overflow-y-auto">
      <Label right={EMPLOYER.span}>{UI.experience.label} · {EMPLOYER.name}</Label>

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
                  boxShadow: r.level === 3 ? "0 0 10px 1px rgb(var(--glow) / calc(0.6 * var(--glow-k)))" : "none",
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
                  {UI.range(r.from, r.to)} · {r.months} {UI.experience.months} · {r.type}
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
