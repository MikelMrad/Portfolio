'use client';

import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Urbanist } from 'next/font/google'
import theme from '../theme/theme'
import { Analytics } from "@vercel/analytics/next"
import '@/styles/globals.css'

const urbanist = Urbanist({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={urbanist.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
