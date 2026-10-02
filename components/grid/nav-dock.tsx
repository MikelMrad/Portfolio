"use client"
import { TABS, type TabId } from "@/lib/grid"
import { Magnetic } from "@/components/ui/magnetic"
import { useContent } from "@/lib/i18n"
import { toggleTheme, useThemeStore } from "@/lib/theme"

/**
 * Fixed furniture. Lives outside the pan container so it stays reachable while
 * the desktop view is being dragged around underneath it.
 */
export function NavDock({
  tab, onSelect, detailOpen, onReset, onToggleLang,
}: {
  tab: TabId
  onSelect: (t: TabId) => void
  detailOpen: boolean
  /** Present only once this tab's cards have been rearranged. */
  onReset?: () => void
  onToggleLang: () => void
}) {
  const { UI } = useContent()
  const theme = useThemeStore()

  const resetButton = (className: string) => onReset && (
    <button
      onClick={onReset}
      aria-label={UI.dock.resetAria}
      className={`p-2 md:p-2.5 items-center gap-2 group ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="text-fg">
        <path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v2.8h2.8" stroke="currentColor" />
      </svg>
      <span className="hidden md:inline font-mono text-[8px] uppercase tracking-[0.22em] text-mid group-hover:text-fg transition-colors">
        {UI.dock.reset}
      </span>
    </button>
  )

  const themeButton = (className: string) => (
    <button
      // The wipe grows from the button itself (lib/theme.tsx).
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
      }}
      aria-label={theme === "light" ? UI.dock.toDark : UI.dock.toLight}
      aria-pressed={theme === "light"}
      className={`p-2 md:p-2.5 text-mid hover:text-fg transition-colors ${className}`}
    >
      {/* Half-filled: the same mark either way, since the site is the same two
          colours either way — only which one is the ground. */}
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" />
        <path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />
      </svg>
    </button>
  )

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
              // The guided tour finds the tabs by this, not by their label —
              // which is in whichever language is showing.
              data-tab={t.id}
              // 2.5 rather than 3 on a phone: the start margin holds the
              // language toggle and, after a swap, the reset beside it.
              className="relative px-2.5 md:px-5 py-2 group focus-visible:outline-none"
            >
              <span
                className={`font-mono text-[9px] md:text-[10px] uppercase tracking-[0.24em] transition-colors duration-300 ${
                  active ? "text-fg" : "text-dim group-hover:text-mid group-focus-visible:text-mid"
                }`}
              >
                {UI.tabs[t.id]}
              </span>
              {/* The glow is the accent — there is no colour on this site. */}
              <span
                className="absolute left-1/2 -translate-x-1/2 bottom-0 block h-px bg-fg transition-all duration-400 ease-out"
                style={{
                  width: active ? "100%" : 0,
                  opacity: active ? 1 : 0,
                  boxShadow: active ? "0 0 12px 2px rgb(var(--glow) / calc(0.65 * var(--glow-k)))" : "none",
                }}
              />
              <span className="sr-only"> (press {t.key})</span>
            </button>
          </Magnetic>
        )
      })}

      {/*
        The start margin — left in English, right in Arabic — holds the language
        and on a desktop the theme toggle and the reset beside it. On a phone the
        theme toggle and the reset sit in the end margin instead (bottom-right in
        English): the start margin is ~71px there, and language + theme + reset
        would be ~90. The end margin has the key hints on a desktop.
      */}
      <div className="absolute start-1 md:start-6 flex items-center">
        <button
          onClick={onToggleLang}
          aria-label={UI.dock.langAria}
          // The target language, written in itself: "عربي" from English,
          // "EN" from Arabic.
          lang={UI.dock.lang === "EN" ? "en" : "ar"}
          className="px-1 md:px-2 py-2 font-mono text-[9px] md:text-[11px] text-mid hover:text-fg border border-transparent hover:border-hairline transition-colors"
        >
          {UI.dock.lang}
        </button>
        {themeButton("hidden md:block")}
        {resetButton("hidden md:flex")}
      </div>

      <span className="hidden lg:block absolute end-6 font-mono text-[8px] uppercase tracking-[0.22em] text-dim">
        {UI.dock.hints}
      </span>

      {/*
        Phone only, and icon-only by necessity: the four tab labels already take
        267 of a 393px screen, which leaves room for a glyph and not a word.
        Sits in the dock's end margin, clear of the centred tabs.
      */}
      <div className="absolute end-1 md:hidden flex items-center">
        {resetButton("flex")}
        {themeButton("block")}
      </div>
    </nav>
  )
}
