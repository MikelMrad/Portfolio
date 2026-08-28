"use client"
import { useEffect, useState } from "react"
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
export function Identity() {
  // Probed rather than handled with onError: the <img> is in the SSR HTML and
  // fails to decode before React hydrates, so an onError handler never fires.
  const [avatarOk, setAvatarOk] = useState(false)
  useEffect(() => {
    const probe = new window.Image()
    probe.onload  = () => setAvatarOk(probe.naturalWidth > 0)
    probe.onerror = () => setAvatarOk(false)
    probe.src = IDENTITY.avatar
    return () => { probe.onload = null; probe.onerror = null }
  }, [])

  return (
    <div className="h-full flex flex-col p-[clamp(0.6rem,4cqh,1.5rem)] gap-[clamp(0.35rem,2.5cqh,0.75rem)]">
      {/* Mark + meta */}
      <div className="flex items-start gap-3 shrink-0">
        <div className="relative shrink-0 aspect-square border border-hairline overflow-hidden bg-bg w-[clamp(1.6rem,20cqh,2.5rem)] @[420px]:w-[clamp(2.5rem,18cqh,5rem)]">
          {avatarOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={IDENTITY.avatar} alt="Mikel Mrad" className="w-full h-full object-cover grayscale" />
          ) : (
            <div className="w-full h-full grid place-items-center">
              <span className="font-display text-fg leading-none tracking-tight text-[clamp(0.7rem,9cqh,2.25rem)]">
                {IDENTITY.monogram}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          <span className="font-mono uppercase tracking-[0.28em] text-dim text-[clamp(7px,1.9cqh,9px)]">
            PORTFOLIO — 2026
          </span>
          <span className="font-mono uppercase tracking-[0.16em] text-mid leading-relaxed text-[clamp(7px,2.1cqh,10px)]">
            {IDENTITY.role}
          </span>
        </div>
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
    </div>
  )
}
