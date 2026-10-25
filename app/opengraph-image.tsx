import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { CONTACT, HERO } from "@/lib/content"
import { SITE_TITLE } from "@/lib/seo"

/**
 * The link preview: what WhatsApp, iMessage, Slack, LinkedIn and X show when
 * the URL is shared. 1200x630, the size every one of them crops to.
 *
 * The site itself, in miniature: near-black, the hairline grid, one card with
 * the name, the promise and the address, and the avatar on a soft glow (the
 * site's one accent) rather than in a box.
 *
 * Set in Barlow Condensed, the site's display face. The site's mono face only
 * ships as woff2, which the renderer can't read, so the small line is Barlow
 * too.
 *
 * Wired into metadata explicitly (OG_IMAGE in lib/seo.ts): the per-tab
 * openGraph and twitter objects in page.tsx replace the parent's, and with them
 * the image this file would otherwise supply.
 *
 * Applies to every route: it sits at the app root, above the tab catch-all.
 */

export const alt = SITE_TITLE
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const BG       = "#0a0a0a"
const FG       = "#f0f0f0"
const DIM      = "#666666"
const HAIRLINE = "#1f1f1f"

export default async function Image() {
  const [barlow, avatar] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/BarlowCondensed-Black.ttf")),
    // icon.png, not apple-icon.png: this one has a transparent background.
    readFile(join(process.cwd(), "app/icon.png"), "base64"),
  ])
  const site = new URL(CONTACT.site).host

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
        <div
          style={{
            flex: 1,
            display: "flex",
            border: "1px solid #2a2a2a",
            background: "#0d0d0d",
            boxShadow: "0 0 60px 6px rgba(240,240,240,0.06)",
            padding: "52px 56px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700 }}>
            {/* The name. The site outlines "MRAD."; Satori has no text-stroke,
                so two tones carry the same contrast. */}
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 0.86 }}>
              <span style={{ fontSize: 132 }}>MIKEL</span>
              <span style={{ fontSize: 132, color: "#5c5c5c" }}>MRAD.</span>
            </div>

            <span style={{ fontSize: 54, lineHeight: 1, letterSpacing: 1 }}>
              {HERO.headline.toUpperCase()}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 10, height: 10, borderRadius: 10, background: FG,
                  boxShadow: "0 0 12px 3px rgba(240,240,240,0.6)",
                }}
              />
              <span style={{ fontSize: 28, letterSpacing: 4, color: DIM }}>{site}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 340 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 330,
                height: 330,
                borderRadius: 330,
                background: "radial-gradient(circle, rgba(240,240,240,0.14) 0%, rgba(240,240,240,0.04) 55%, transparent 72%)",
              }}
            >
              <img src={`data:image/png;base64,${avatar}`} width={280} height={280} alt="" />
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
