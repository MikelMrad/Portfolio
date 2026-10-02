"use client"
import type { ReactNode } from "react"
import { useContent } from "@/lib/i18n"

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

/**
 * A module that has been moved into a cell too small for it (see isCramped()
 * in stage.tsx): just its title, and a tap opens it at full size. Better one
 * clear word than a whole module crushed into overlapping lines.
 *
 * Built to hold in anything down to a one-row phone bar (~57px): the title is
 * capped on height as well as width, and EXPAND drops to a bare arrow below
 * 100px tall.
 */
export function CompactCard({ title, onOpen }: { title: string; onOpen: () => void }) {
  const { UI } = useContent()
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group h-full w-full text-start flex flex-col justify-between p-3 @[220px]:p-4 min-h-0 min-w-0 overflow-hidden"
    >
      <span className="font-display text-fg leading-[0.9] tracking-tight whitespace-pre-line text-[clamp(0.95rem,min(15cqw,30cqh),3.5rem)]">
        {title}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-dim group-hover:text-fg transition-colors self-end">
        <span className="cq-h100">{UI.expand} </span><span aria-hidden className="inline-block rtl:-scale-x-100">↗</span>
      </span>
    </button>
  )
}

/** Bordered technology chip. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    // Technology names — left-to-right in either language (see Category).
    <span dir="ltr" className="font-mono text-[9px] uppercase tracking-[0.16em] border border-hairline text-mid px-2 py-1 whitespace-nowrap transition-colors duration-200 hover:border-fg hover:text-fg">
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
        background: "linear-gradient(to right, transparent, var(--color-fg) 18%, var(--color-fg) 82%, transparent)",
        boxShadow: "0 0 18px 3px rgb(var(--glow) / calc(0.28 * var(--glow-k))), 0 0 55px 8px rgb(var(--glow) / calc(0.08 * var(--glow-k)))",
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
  const { UI } = useContent()
  return (
    <div className="chrome h-full flex justify-between p-4 @[260px]:p-5 gap-3 min-h-0 min-w-0">
      <button
        onClick={onClose}
        className="font-mono text-[9px] uppercase tracking-[0.24em] text-mid hover:text-fg transition-colors flex items-center gap-2 self-center shrink-0"
      >
        <span aria-hidden className="inline-block rtl:-scale-x-100">←</span> {UI.close} <span className="cq-h160 text-dim">{UI.esc}</span>
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
