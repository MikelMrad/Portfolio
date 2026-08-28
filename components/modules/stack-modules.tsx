"use client"
import { EDUCATION, STACK, TECH_COUNT, type StackCategory } from "@/lib/content"
import { Counter } from "@/components/ui/counter"
import { Label } from "@/components/ui/bits"

export function TechCount() {
  return (
    <div className="h-full flex flex-col justify-between p-4 @[260px]:p-5">
      <Label>TOOLBOX</Label>
      <div>
        <span className="font-display text-fg leading-none block text-[clamp(1.5rem,min(22cqw,26cqh),3.75rem)]">
          <Counter to={TECH_COUNT} delay={450} />
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim block mt-1">
          TECHNOLOGIES
        </span>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mid leading-relaxed">
        {STACK.length} CATEGORIES
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
            <span className="font-mono text-[10px] @[240px]:text-[11px] uppercase tracking-[0.12em] text-mid group-hover:text-fg transition-colors truncate">
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

export function Education() {
  return (
    <div className="h-full flex flex-col p-4 @[260px]:p-5 gap-3 min-h-0">
      <Label>EDUCATION</Label>
      <div className="flex-1 min-h-0 flex flex-col justify-center gap-4">
        {EDUCATION.map((e) => (
          <div key={e.short} className="border-b border-hairline pb-3 last:border-0 last:pb-0">
            <span className="font-display text-fg leading-none block tracking-tight text-[clamp(1rem,min(15cqw,11cqh),1.875rem)]">
              {e.short}
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-mid block mt-1.5 leading-relaxed">
              {e.award}
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-dim block mt-1">
              {e.years}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
