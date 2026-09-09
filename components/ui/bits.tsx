import type { ReactNode } from "react"

/**
 * Small caps mono label that heads every module.
 *
 * Two things keep it on one line in a 180px phone cell. Tracking tightens below
 * 220px, which buys back ~20% of the width for free — at 9px nobody reads the
 * letter-spacing, they read the gap. And the left half truncates as a backstop:
 * losing a few letters of "FRAMEWORKS & LIBRARIES" beats pushing the count off
 * the card entirely.
 */
export function Label({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 shrink-0 min-w-0">
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] @[220px]:tracking-[0.28em] text-dim truncate min-w-0">
        {children}
      </span>
      {right ? (
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] @[220px]:tracking-[0.22em] text-dim shrink-0">
          {right}
        </span>
      ) : null}
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

/**
 * Chrome for a zoomed section: close control plus context.
 *
 * A left-hand column beside a desktop zoom, a bar beneath a phone one — see
 * `.chrome` in globals.css. The order of the three children reads correctly
 * either way round, which is why one component covers both.
 */
export function ZoomNav({
  label, title, meta, onClose,
}: { label: string; title: string; meta?: string; onClose: () => void }) {
  return (
    <div className="chrome h-full flex justify-between p-4 @[260px]:p-5 gap-3 min-h-0 min-w-0">
      <button
        onClick={onClose}
        className="font-mono text-[9px] uppercase tracking-[0.24em] text-mid hover:text-fg transition-colors flex items-center gap-2 self-center shrink-0"
      >
        <span aria-hidden>←</span> CLOSE <span className="cq-h160 text-dim">ESC</span>
      </button>

      <div className="min-w-0">
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-dim block truncate">{label}</span>
        {/* Wrapped, not gated directly: .cq-h160 reverts `display`, which for a
            bare <span> is `inline` — and an inline heading drops its margin. */}
        <div className="cq-h160">
          <span className="font-display text-fg leading-[0.9] block tracking-tight mt-1 text-[clamp(1.25rem,min(18cqw,20cqh),3rem)]">
            {title}
          </span>
        </div>
      </div>

      <span className="cq-h160 font-mono text-[9px] uppercase tracking-[0.2em] text-dim leading-relaxed">
        {meta}
      </span>
    </div>
  )
}
