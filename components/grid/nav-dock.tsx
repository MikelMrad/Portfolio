"use client"
import { TABS, type TabId } from "@/lib/grid"
import { Magnetic } from "@/components/ui/magnetic"

/**
 * Fixed furniture. Lives outside the pan container so it stays reachable when
 * the grid is panned sideways on a phone.
 */
export function NavDock({
  tab, onSelect, detailOpen,
}: { tab: TabId; onSelect: (t: TabId) => void; detailOpen: boolean }) {
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
    </nav>
  )
}
