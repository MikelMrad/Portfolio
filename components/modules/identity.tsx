"use client"
import { IDENTITY } from "@/lib/content"
import { LiveDot } from "@/components/ui/bits"

/**
 * The anchor module. It never scatters — it morphs between its large INDEX slot
 * (5x4) and the compact slot it takes on every other tab (3x2).
 *
 * Everything here is sized in `cqw`/`cqh` against the card itself, chrome
 * included, so the whole card scales as one thing. That only works because
 * ModuleCard sets `container-type: size`; with Tailwind's default
 * `@container` (inline-size) the `cqh` terms silently resolve against the
 * viewport and the type stops responding to the card's height.
 */
export function Identity({ onHome }: { onHome?: () => void }) {
  const Shell = onHome ? "button" : "div"
  return (
    <Shell
      {...(onHome ? { onClick: onHome, type: "button" as const, "aria-label": "Go to index" } : {})}
      className="group relative h-full w-full text-left flex flex-col p-[clamp(0.6rem,4cqh,1.5rem)] gap-[clamp(0.35rem,2.5cqh,0.75rem)]"
    >
      {/* Only surfaces on hover — the card is the anchor on every tab, so it
          shouldn't advertise itself while you're reading it. */}
      {onHome && (
        <span className="absolute top-[clamp(0.6rem,4cqh,1.5rem)] right-[clamp(0.6rem,4cqh,1.5rem)] font-mono uppercase tracking-[0.24em] text-dim opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[clamp(7px,1.9cqh,9px)]">
          INDEX ↖
        </span>
      )}
      <div className="min-w-0 shrink-0 flex flex-col gap-0.5">
        <span className="font-mono uppercase tracking-[0.28em] text-dim text-[clamp(7px,1.9cqh,9px)]">
          PORTFOLIO — 2026
        </span>
        <span className="font-mono uppercase tracking-[0.16em] text-mid leading-relaxed text-[clamp(7px,2.1cqh,10px)]">
          {IDENTITY.role}
        </span>
      </div>

      {/* The name takes the slack. One line when the card is compact, two when
          there's room — the two-line cap is tighter because it needs the height
          twice over. */}
      <div className="flex-1 min-h-0 flex items-center overflow-hidden">
        <h1 className="font-display text-fg leading-[0.86] tracking-tight text-[clamp(1.1rem,min(13cqw,26cqh),4rem)] @[420px]:text-[clamp(1.5rem,min(13cqw,19cqh),7rem)]">
          <span className="inline @[420px]:block">MIKEL</span>{" "}
          <span className="inline @[420px]:block @[420px]:text-transparent @[420px]:[-webkit-text-stroke:2px_#f0f0f0]">
            MRAD.
          </span>
        </h1>
      </div>

      <div className="shrink-0 flex flex-col gap-1.5">
        <p className="hidden @[420px]:block font-mono uppercase tracking-[0.14em] text-dim leading-relaxed text-[clamp(8px,2.2cqh,10px)]">
          {IDENTITY.tagline}
        </p>
        <div className="flex items-center gap-2">
          <LiveDot />
          <span className="font-mono uppercase tracking-[0.22em] text-mid text-[clamp(7px,2cqh,9px)]">
            <span className="@[420px]:hidden">OPEN TO WORK</span>
            <span className="hidden @[420px]:inline">AVAILABLE FOR WORK</span>
          </span>
        </div>
      </div>
    </Shell>
  )
}
