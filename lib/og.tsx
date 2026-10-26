import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const OG_SIZE = { width: 1200, height: 630 }

const BG       = "#0a0a0a"
const FG       = "#f0f0f0"
const DIM      = "#666666"
const HAIRLINE = "#1f1f1f"

/**
 * The link-preview card, shared by both variants' opengraph-image routes: the
 * site in miniature (near-black, the hairline grid, one card with the name and
 * a line under it, the avatar on a soft glow). Set in Barlow Condensed, the
 * site's display face; the mono face only ships as woff2, which the renderer
 * can't read.
 */
export async function ogCard({ line, site }: { line: string; site?: string }) {
  const [barlow, avatar] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/BarlowCondensed-Black.ttf")),
    // icon.png, not apple-icon.png: this one has a transparent background.
    readFile(join(process.cwd(), "app/icon.png"), "base64"),
  ])
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
              {line.toUpperCase()}
            </span>

            {site ? <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 10, height: 10, borderRadius: 10, background: FG,
                  boxShadow: "0 0 12px 3px rgba(240,240,240,0.6)",
                }}
              />
              <span style={{ fontSize: 28, letterSpacing: 4, color: DIM }}>{site}</span>
            </div> : <div style={{ display: "flex" }} />}
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
              {/* Rendered to a PNG by Satori, not by a browser: next/image doesn't apply. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:image/png;base64,${avatar}`} width={280} height={280} alt="" />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Barlow", data: barlow, style: "normal", weight: 900 }],
    },
  )
}
