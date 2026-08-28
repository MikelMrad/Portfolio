import type { Metadata, Viewport } from "next"
import { JetBrains_Mono, Barlow_Condensed } from "next/font/google"
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

export const metadata: Metadata = {
  title: "Mikel Mrad — Front-End / Full-Stack Developer",
  description: "Commerce, interfaces, and the details in between. Beirut, Lebanon.",
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
    <html lang="en" className={`${jetbrains.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  )
}
