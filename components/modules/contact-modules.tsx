"use client"
import { useContent } from "@/lib/i18n"

export function Footer() {
  const { UI } = useContent()
  return (
    <div className="h-full flex items-center justify-between px-3 @[220px]:px-5 gap-3">
      <span dir="ltr" className="font-mono text-[8px] uppercase tracking-[0.2em] text-dim whitespace-nowrap">{UI.contact.footer}</span>
      {/* The colophon is the half that goes when the cell is a phone-width bar. */}
      <span className="hidden @[220px]:inline font-mono text-[8px] uppercase tracking-[0.2em] text-dim whitespace-nowrap" dir="ltr">{UI.contact.colophon}</span>
    </div>
  )
}
