import type { Metadata, Viewport } from "next"
import { JetBrains_Mono, Barlow_Condensed } from "next/font/google"
import localFont from "next/font/local"
import { CONTACT } from "@/lib/content"
import { PREFS_BOOT } from "@/lib/lang-boot"
import "./globals.css"

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
})

/*
  Arabic. Neither font above has an Arabic glyph, so these sit *behind* them in
  the stacks (globals.css): Latin keeps JetBrains / Barlow — tech names in an
  Arabic line stay in the site's type — and only Arabic characters fall through.

  Self-hosted Arabic-only subsets, never preloaded, with the subset's
  unicode-range: an English visitor never downloads them. size-adjust because
  Arabic set at the size of Latin caps reads a size smaller — the mono labels
  are 8-10px, where that is the difference between legible and not.
*/
// The font loader only accepts literals, so the subset's unicode-range is
// written out in both declarations below.
const plexArabic = localFont({
  src: [
    { path: "../public/fonts/IBMPlexSansArabic-400-arabic.woff2", weight: "400" },
    { path: "../public/fonts/IBMPlexSansArabic-600-arabic.woff2", weight: "600" },
  ],
  variable: "--font-plex-arabic",
  display: "swap",
  preload: false,
  declarations: [
    { prop: "unicode-range", value: "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC" },
    { prop: "size-adjust", value: "122%" },
  ],
})

const kufiArabic = localFont({
  src: [{ path: "../public/fonts/NotoKufiArabic-var-arabic.woff2", weight: "100 900" }],
  variable: "--font-kufi-arabic",
  display: "swap",
  preload: false,
  declarations: [
    { prop: "unicode-range", value: "U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC" },
    { prop: "size-adjust", value: "88%" },
  ],
})

export const metadata: Metadata = {
  title: "Mikel Mrad — Front-End / Full-Stack Developer",
  description: "Commerce, interfaces, and the details in between. Beirut, Lebanon.",
  // Link previews need absolute URLs; app/opengraph-image.tsx supplies the image.
  metadataBase: new URL(CONTACT.site),
  twitter: { card: "summary_large_image" },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  // The page is a fixed canvas — stop mobile browsers from rubber-banding it.
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: PREFS_BOOT may set lang/dir/data-theme before
    // hydration — the one deliberate difference from the server markup.
    <html
      lang="en"
      className={`${jetbrains.variable} ${barlow.variable} ${plexArabic.variable} ${kufiArabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
