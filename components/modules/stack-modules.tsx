"use client"
import { useContent } from "@/lib/i18n"
import { Label } from "@/components/ui/bits"

/**
 * The whole toolbox in one card: each category with its count, and the
 * technologies themselves once the card is tall enough to list them. On a
 * phone it is a half-width block of four lines, and a tap expands it.
 */
export function Stack({ onOpen }: { onOpen?: () => void }) {
  const { STACK, TECH_COUNT, UI } = useContent()
  const Shell = onOpen ? "button" : "div"
  return (
    <Shell
      {...(onOpen ? { onClick: onOpen, type: "button" as const } : {})}
      className="group h-full w-full text-start flex flex-col p-4 @[260px]:p-5 gap-3 min-h-0 overflow-hidden"
    >
      {/* The arrow says the card opens; it goes once the card is tall
          enough to list everything, where there is nothing more to open. */}
      <Label right={<>{TECH_COUNT}{onOpen && <span className="cq-h320-hide"> <span aria-hidden className="inline-block rtl:-scale-x-100">↗</span></span>}</>}>
        {UI.stack.label}
      </Label>

      <ul className="flex-1 min-h-0 flex flex-col [justify-content:safe_center] gap-2.5 @[420px]:gap-4">
        {STACK.map((c) => (
          <li key={c.id} className="border-b border-hairline pb-2 last:border-0 last:pb-0 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[9px] @[420px]:text-[10px] uppercase tracking-[0.14em] text-fg truncate">
                {c.label}
              </span>
              <span className="font-mono text-[8px] tracking-[0.16em] text-dim tabular-nums shrink-0">
                {String(c.skills.length).padStart(2, "0")}
              </span>
            </div>
            <div className="cq-h320">
              {/* Technology names are Latin in both languages; each is
                  isolated, or an RTL line turns "C++" into "++C". */}
              <p className="font-mono text-[9px] @[420px]:text-[10px] uppercase tracking-[0.08em] text-mid leading-relaxed mt-1">
                {c.skills.map((sk, i) => (
                  <span key={sk}>
                    {i > 0 && <span className="text-dim"> · </span>}
                    <span dir="ltr">{sk}</span>
                  </span>
                ))}
              </p>
            </div>
          </li>
        ))}
      </ul>

    </Shell>
  )
}

export function Education() {
  const { EDUCATION, UI } = useContent()
  return (
    <div className="h-full flex flex-col p-4 @[260px]:p-5 gap-3 min-h-0">
      <Label>{UI.education.label}</Label>
      {/*
        `safe center` rather than plain centring. When the two entries are taller
        than the card, centred content overflows in *both* directions and the
        first school rides up over the EDUCATION label. Safe centring falls back
        to flex-start instead, so it clips off the bottom like everything else.
      */}
      <div className="flex-1 min-h-0 flex flex-col [justify-content:safe_center] gap-4">
        {EDUCATION.map((e) => (
          <div key={e.short} className="border-b border-hairline pb-3 last:border-0 last:pb-0">
            <span className="font-display text-fg leading-none block tracking-tight text-[clamp(1rem,min(15cqw,11cqh),1.875rem)]">
              {e.short}
            </span>
            <div className="cq-h160">
              <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-mid block mt-1.5 leading-relaxed">
                {e.award}
              </span>
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-dim block mt-1">
              {e.years}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
