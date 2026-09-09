"use client"
import { TABS, type TabId } from "@/lib/grid"
import { Magnetic } from "@/components/ui/magnetic"

/**
 * Fixed furniture. Lives outside the pan container so it stays reachable while
 * the desktop view is being dragged around underneath it.
 */
export function NavDock({
  tab, onSelect, detailOpen, desktopView, onToggleView,
}: {
  tab: TabId
  onSelect: (t: TabId) => void
  detailOpen: boolean
  desktopView?: boolean
  /** Omitted when there is no choice to offer — desktop, or a phone too short
   *  for the portrait grid, where the scaled view is the only thing that fits. */
  onToggleView?: () => void
}) {
  return (
    <nav
      aria-label="Sections"
      className="fixed bottom-0 left-0 right-0 z-50 h-14 md:h-16 flex items-center justify-center gap-1 md:gap-2 px-4 bg-bg/85 backdrop-blur-sm border-t border-hairline"
    >
      {TABS.map((t) => {
        const active = t.id === tab && !detailOpen
        return (
          <Magnetic key={t.id} strength={0.2}>
            <button
              onClick={() => onSelect(t.id)}
              aria-current={active ? "page" : undefined}
              className="relative px-3 md:px-5 py-2 group focus-visible:outline-none"
            >
              <span
                className={`font-mono text-[9px] md:text-[10px] uppercase tracking-[0.24em] transition-colors duration-300 ${
                  active ? "text-fg" : "text-dim group-hover:text-mid group-focus-visible:text-mid"
                }`}
              >
                {t.label}
              </span>
              {/* The glow is the accent — there is no colour on this site. */}
              <span
                className="absolute left-1/2 -translate-x-1/2 bottom-0 block h-px bg-fg transition-all duration-400 ease-out"
                style={{
                  width: active ? "100%" : 0,
                  opacity: active ? 1 : 0,
                  boxShadow: active ? "0 0 12px 2px rgba(240,240,240,0.65)" : "none",
                }}
              />
              <span className="sr-only"> (press {t.key})</span>
            </button>
          </Magnetic>
        )
      })}

      <span className="hidden lg:block absolute right-6 font-mono text-[8px] uppercase tracking-[0.22em] text-dim">
        1—4 · ← → · ESC
      </span>

      {/*
        Phone only, and icon-only by necessity: the four tab labels already take
        267 of a 393px screen, which leaves room for a glyph and not a word.
        Sits in the dock's right margin, clear of the centred tabs.
      */}
      {onToggleView && (
        <button
          onClick={onToggleView}
          aria-pressed={desktopView}
          aria-label={desktopView ? "Switch to the phone layout" : "Switch to the desktop layout"}
          className="absolute right-2 p-2.5"
        >
          {desktopView ? (
            // A phone: tap to come back to the portrait grid.
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-fg">
              <rect x="4.5" y="1.5" width="7" height="13" stroke="currentColor" />
              <path d="M4.5 4.5h7M6.5 12.5h3" stroke="currentColor" />
            </svg>
          ) : (
            // The 12x8 grid, abbreviated: tap to see the real thing.
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-dim">
              <rect x="1.5" y="2.5" width="13" height="11" stroke="currentColor" />
              <path d="M1.5 6.5h13M6.5 6.5v7M10.5 2.5v11" stroke="currentColor" />
            </svg>
          )}
        </button>
      )}
    </nav>
  )
}
