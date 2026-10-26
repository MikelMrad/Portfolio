"use client"
import type { Tab, TabId } from "@/lib/grid"
import { Magnetic } from "@/components/ui/magnetic"
import { useContent } from "@/lib/i18n"
import { toggleTheme, useThemeStore } from "@/lib/theme"
import { WhatsAppIcon } from "@/components/ui/bits"

/**
 * Fixed furniture. Lives outside the pan container so it stays reachable while
 * the desktop view is being dragged around underneath it.
 */
export function NavDock({
  tabs, tab, onSelect, detailOpen, onReset, onToggleLang, onDemo, whatsapp,
}: {
  /** The variant's four tabs (GRIDS in lib/grid.ts). */
  tabs: Tab[]
  tab: TabId
  onSelect: (t: TabId) => void
  detailOpen: boolean
  /** Present only once this tab's cards have been rearranged. */
  onReset?: () => void
  onToggleLang: () => void
  /** Plays the guided tour. Absent while a card is expanded. */
  onDemo?: () => void
  /** The WhatsApp button: business variant only, absent on the portfolio. */
  whatsapp?: { href: string; aria: string; label: string }
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

  // The tour never plays by itself — this is the only way in. A play glyph
  // everywhere, with the words beside it once there is room.
  const demoButton = (className: string) => onDemo && (
    <button
      onClick={onDemo}
      aria-label={UI.demo.watchAria}
      className={`p-2 md:p-2.5 items-center gap-2 group ${className}`}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="text-mid group-hover:text-fg transition-colors rtl:-scale-x-100">
        <path d="M3 1.5v9l7.5-4.5z" stroke="currentColor" strokeLinejoin="round" />
      </svg>
      <span className="hidden md:inline font-mono text-[8px] uppercase tracking-[0.22em] text-mid group-hover:text-fg transition-colors">
        {UI.demo.watch}
      </span>
    </button>
  )

  /**
   * The always-there WhatsApp button, in the dock's end corner: bottom-right in
   * English, bottom-left in Arabic (`end-*` mirrors it). In the dock rather
   * than floating above it, so it never sits on a card or the key hints.
   */
  const whatsappButton = (className: string, withLabel: boolean) => whatsapp && (
    <a
      href={whatsapp.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={whatsapp.aria}
      className={`wa-dock items-center justify-center gap-2 h-8 md:h-9 border border-fg/60 text-fg bg-bg shadow-glow-sm hover:border-fg hover:shadow-glow hover:bg-fg hover:text-bg transition-[background-color,color,border-color,box-shadow] duration-300 ${
        withLabel ? "px-3" : "w-8 md:w-9 rounded-full"
      } ${className}`}
    >
      <WhatsAppIcon size={15} />
      {withLabel && (
        <span className="font-mono text-[9px] uppercase tracking-[0.2em]">{whatsapp?.label}</span>
      )}
    </a>
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
      {tabs.map((t) => {
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
              className="relative px-2 md:px-5 py-2 group focus-visible:outline-none"
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
        The start margin (left in English, right in Arabic) holds the language
        and, on a desktop, the theme toggle and the reset beside it. A phone's
        margins are ~60px each, two glyphs: the language and WATCH DEMO here,
        with RESET taking the demo's place once there is something to reset,
        and the theme toggle and WhatsApp in the end margin.
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
        {onReset ? resetButton("flex md:hidden") : demoButton("flex md:hidden")}
        {themeButton("hidden md:block")}
        {resetButton("hidden md:flex")}
      </div>

      {/* The end margin on a desktop: WATCH DEMO, the key hints once the
          window is wide enough (and never on a touch screen, where there is
          no keyboard to press them on), and WhatsApp in the corner. */}
      <div className="hidden md:flex absolute end-6 items-center gap-4">
        {demoButton("flex")}
        <span className="hidden min-[1440px]:pointer-fine:block font-mono text-[8px] uppercase tracking-[0.22em] text-dim">
          {UI.dock.hints}
        </span>
        {whatsappButton("flex lg:hidden", false)}
        {whatsappButton("hidden lg:flex", true)}
      </div>

      {/*
        Phone only, and icon-only by necessity: the four tab labels take most
        of a 393px screen, which leaves room for a glyph and not a word.
      */}
      <div className="absolute end-1.5 md:hidden flex items-center gap-1">
        {themeButton("block !p-1.5")}
        {whatsappButton("flex", false)}
      </div>
    </nav>
  )
}
