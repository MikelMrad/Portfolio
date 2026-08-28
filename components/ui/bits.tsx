import type { ReactNode } from "react"

/** Small caps mono label that heads every module. */
export function Label({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 shrink-0">
      <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-dim">{children}</span>
      {right ? <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-dim">{right}</span> : null}
    </div>
  )
}

/** Bordered technology chip. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[9px] uppercase tracking-[0.16em] border border-hairline text-mid px-2 py-1 whitespace-nowrap transition-colors duration-200 hover:border-fg hover:text-fg">
      {children}
    </span>
  )
}

/** The glowing hairline from v3's WorkDivider, reusable. */
export function GlowRule({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-full h-px shrink-0 ${className}`}
      style={{
        background: "linear-gradient(to right, transparent, #f0f0f0 18%, #f0f0f0 82%, transparent)",
        boxShadow: "0 0 18px 3px rgba(240,240,240,0.28), 0 0 55px 8px rgba(240,240,240,0.08)",
      }}
    />
  )
}

/** Blinking availability dot with a soft halo. */
export function LiveDot() {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full bg-fg shrink-0"
      style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
    />
  )
}

/** Left-hand column for a desktop zoom: close control plus context. */
export function ZoomNav({
  label, title, meta, onClose,
}: { label: string; title: string; meta?: string; onClose: () => void }) {
  return (
    <div className="h-full flex flex-col justify-between p-4 @[260px]:p-5 gap-3 min-h-0">
      <button
        onClick={onClose}
        className="font-mono text-[9px] uppercase tracking-[0.24em] text-mid hover:text-fg transition-colors flex items-center gap-2 self-start"
      >
        <span aria-hidden>←</span> CLOSE <span className="text-dim">ESC</span>
      </button>

      <div className="min-w-0">
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-dim block">{label}</span>
        <span className="font-display text-fg leading-[0.9] block tracking-tight mt-1 text-[clamp(1.25rem,min(18cqw,20cqh),3rem)]">
          {title}
        </span>
      </div>

      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim leading-relaxed">
        {meta}
      </span>
    </div>
  )
}
