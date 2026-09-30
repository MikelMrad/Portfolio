import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { CONTACT, IDENTITY } from "@/lib/content"

/**
 * The link preview — what WhatsApp, iMessage, Slack and LinkedIn show when the
 * URL is shared.
 *
 * Without one they fell back to apple-icon.png: a 180px avatar with its black
 * background baked in, which reads as a hole in the preview card. A preview
 * image can't be transparent (every app fills it with something), so this
 * designs the background instead: the site itself — near-black, the hairline
 * grid, the identity card — with the avatar placed on it rather than boxed.
 *
 * Applies to every route: it sits at the app root, above the tab catch-all.
 */

export const alt = `${IDENTITY.name} — ${IDENTITY.role}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const BG       = "#0a0a0a"
const FG       = "#f0f0f0"
const DIM      = "#666666"
const MID      = "#aaaaaa"
const HAIRLINE = "#1f1f1f"

export default async function Image() {
  const [barlow, avatar] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/BarlowCondensed-Black.ttf")),
    // icon.png, not apple-icon.png: this one has a transparent background.
    readFile(join(process.cwd(), "app/icon.png"), "base64"),
  ])
  const site = new URL(CONTACT.site).host.toUpperCase()

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BG,
          backgroundImage: `linear-gradient(${HAIRLINE} 1px, transparent 1px), linear-gradient(90deg, ${HAIRLINE} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          padding: 40,
          fontFamily: "Barlow",
          color: FG,
        }}
      >
        {/* The identity card, as it sits on the site. */}
        <div
          style={{
            flex: 1,
            display: "flex",
            border: `1px solid #2a2a2a`,
            background: "#0d0d0d",
            boxShadow: "0 0 60px 6px rgba(240,240,240,0.06)",
            padding: "48px 56px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 22, letterSpacing: 6, color: DIM }}>PORTFOLIO — 2026</span>
              <span style={{ fontSize: 24, letterSpacing: 5, color: MID }}>{IDENTITY.role}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", lineHeight: 0.86 }}>
              <span style={{ fontSize: 150 }}>MIKEL</span>
              {/* The site outlines MRAD. — Satori has no text-stroke, and faking
                  one with shadows draws a ragged edge that only gets worse at
                  thumbnail size. Two tones carry the same contrast cleanly. */}
              <span style={{ fontSize: 150, color: "#5c5c5c" }}>MRAD.</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 22, letterSpacing: 4, color: DIM }}>{IDENTITY.tagline}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 10, height: 10, borderRadius: 10, background: FG,
                    boxShadow: "0 0 12px 3px rgba(240,240,240,0.6)",
                  }}
                />
                <span style={{ fontSize: 22, letterSpacing: 5, color: FG }}>{IDENTITY.availability.long}</span>
                <span style={{ fontSize: 22, letterSpacing: 5, color: DIM }}>· {site}</span>
              </div>
            </div>
          </div>

          {/* The avatar, on the card rather than in a box — a soft white glow
              is the only thing behind it, the site's one accent. */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 360 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 340,
                height: 340,
                borderRadius: 340,
                background: "radial-gradient(circle, rgba(240,240,240,0.14) 0%, rgba(240,240,240,0.04) 55%, transparent 72%)",
              }}
            >
              <img src={`data:image/png;base64,${avatar}`} width={290} height={290} alt="" />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Barlow", data: barlow, style: "normal", weight: 900 }],
    },
  )
}
