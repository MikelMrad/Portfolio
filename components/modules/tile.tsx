"use client"
import { CONTACT, EDUCATION, IDENTITY, PROJECTS, STACK, STATS } from "@/lib/content"
import { LiveDot } from "@/components/ui/bits"
import type { ModuleId, TabId } from "@/lib/grid"

/**
 * Mobile only. Every section is one row; nothing scrolls.
 *
 * A row only becomes tappable if expanding it actually reveals more than its
 * own title. Anything whose whole content fits on the row shows it inline
 * (`detail`), and anything that is purely a destination is a link. Modules
 * absent from MOBILE_ORDER don't exist on mobile at all — the WebGL surface
 * carries no information, and "most recent" and "04 projects" just restate
 * what the nav and the project rows already say.
 */

type TileSpec = {
  label: string
  title: string
  /** Square thumbnail shown at the head of the row. */
  /** Inline content for rows that don't need expanding. */
  detail?: string
  /** Omitted = static row, not tappable. */
  action?: "expand" | "home" | { href: string; newTab?: boolean }
  live?: boolean
  links?: { label: string; href: string }[]
}

/** Explicit order and membership per tab. */
export const MOBILE_ORDER: Record<TabId, ModuleId[]> = {
  index:   ["identity", "stats", "experience", "location"],
  work:    ["identity", "project-01", "project-02", "project-03", "project-04", "cv"],
  stack:   ["identity", "cat-languages", "cat-frameworks", "cat-tools", "cat-databases", "education"],
  contact: ["identity", "email", "form", "socials"],
}

const [s0, s1, s2] = STATS

export const TILE_SPEC: Partial<Record<ModuleId, TileSpec>> = {
  identity: {
    label:  "PORTFOLIO — 2026",
    title:  IDENTITY.name + ".",
    detail: "FRONT-END / FULL-STACK DEVELOPER",
    action: "home",
    live:   true,
  },
  stats: {
    label:  "BY THE NUMBERS",
    title:  `${s0.value}${s0.suffix} ${s0.label}`,
    detail: `${s1.value} ${s1.label} · ${s2.value}${s2.suffix} ${s2.label}`,
  },
  experience: { label: "YORK PRESS", title: "EXPERIENCE", detail: "INTERN → MOBILE LEAD · 4 ROLES", action: "expand" },
  location:   { label: "BASED",      title: "BEIRUT",     detail: "GMT+3 · REMOTE-READY · WORLDWIDE" },

  cv: {
    label:  "CURRICULUM VITAE",
    title:  "2026 CV",
    detail: "EXPERIENCE · STACK · EDUCATION",
    action: { href: CONTACT.cv, newTab: true },
  },

  "cat-languages":  { label: "STACK", title: STACK[0].label, detail: `${STACK[0].skills.length} ENTRIES`, action: "expand" },
  "cat-frameworks": { label: "STACK", title: STACK[1].label, detail: `${STACK[1].skills.length} ENTRIES`, action: "expand" },
  "cat-tools":      { label: "STACK", title: STACK[2].label, detail: `${STACK[2].skills.length} ENTRIES`, action: "expand" },
  // Only two entries — they fit on the row, so there's nothing to expand into.
  "cat-databases":  { label: "STACK", title: STACK[3].label, detail: STACK[3].skills.join(" · ") },
  education:        { label: "EDUCATION", title: EDUCATION.map((e) => e.short).join(" · "), detail: "BSc COMPUTER SCIENCE · 2021—2024", action: "expand" },

  email: {
    label:  "DIRECT",
    title:  CONTACT.email.toUpperCase(),
    detail: CONTACT.phone,
    action: { href: `mailto:${CONTACT.email}` },
  },
  form:    { label: "FORM", title: "SEND A MESSAGE", detail: "NAME · EMAIL · MESSAGE", action: "expand" },
  socials: {
    label: "ELSEWHERE",
    title: "FIND ME",
    links: [
      { label: "GITHUB",   href: CONTACT.github },
      { label: "LINKEDIN", href: CONTACT.linkedin },
      { label: "CV ↓",     href: CONTACT.cv },
    ],
  },
}

for (const p of PROJECTS) {
  TILE_SPEC[`project-0${p.num.slice(-1)}` as ModuleId] = {
    label:  `WORK — ${p.num}`,
    title:  p.title.replace("\n", " "),
    detail: `${p.role} · ${p.year}`,
    action: "expand",
  }
}

export const isExpandable = (id: ModuleId) => TILE_SPEC[id]?.action === "expand"

// ── rendering ─────────────────────────────────────────────────────────────────

function Body({ spec }: { spec: TileSpec }) {
  return (
    <>
      <span className="min-w-0 flex-1 flex flex-col gap-1">
        <span className="font-mono text-[8px] uppercase tracking-[0.28em] text-dim">{spec.label}</span>

        <span className="font-display text-fg leading-none tracking-tight truncate text-[clamp(1rem,min(8cqw,30cqh),2.25rem)]">
          {spec.title}
        </span>

        {spec.links ? (
          <span className="flex flex-wrap gap-1.5 mt-1">
            {spec.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[9px] uppercase tracking-[0.16em] border border-hairline text-mid px-2 py-1 active:border-fg active:text-fg"
              >
                {l.label}
              </a>
            ))}
          </span>
        ) : spec.detail ? (
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-mid truncate">
            {spec.detail}
          </span>
        ) : null}

        {spec.live && (
          <span className="flex items-center gap-2 mt-0.5">
            <LiveDot />
            <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-mid">OPEN TO WORK</span>
          </span>
        )}
      </span>

      {spec.action && (
        <span aria-hidden className="font-mono text-[11px] text-dim shrink-0 group-active:text-fg transition-colors">
          {spec.action === "expand" ? "↗" : spec.action === "home" ? "↖" : "→"}
        </span>
      )}
    </>
  )
}

export function Tile({ id, onOpen }: { id: ModuleId; onOpen: (id: ModuleId) => void }) {
  const spec = TILE_SPEC[id]
  if (!spec) return null

  const shell = "group h-full w-full flex items-center justify-between gap-3 px-4 text-left"

  if (spec.action === "expand" || spec.action === "home") {
    return <button onClick={() => onOpen(id)} className={shell}><Body spec={spec} /></button>
  }

  if (spec.action) {
    const { href, newTab } = spec.action
    return (
      <a
        href={href}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={shell}
      >
        <Body spec={spec} />
      </a>
    )
  }

  return <div className={shell}><Body spec={spec} /></div>
}
