import type { Metadata } from "next"
import { JetBrains_Mono, Barlow_Condensed } from "next/font/google"
import { LenisProvider } from "@/components/providers/lenis-provider"
import "./globals.css"

const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" })
const barlow = Barlow_Condensed({ subsets: ["latin"], variable: "--font-barlow-condensed", weight: ["400","500","600","700","800"], display: "swap" })

export const metadata: Metadata = {
  title: "Mikel Mrad — Fullstack Developer",
  description: "Commerce, interfaces, and the details in between.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jetbrains.variable} ${barlow.variable}`}>
      <body><LenisProvider>{children}</LenisProvider></body>
    </html>
  )
}