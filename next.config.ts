import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Verified against Motion 12's layout/layoutId engine and the r3f canvas:
  // build, scatter transition, identity morph and project expand all behave
  // identically with this on. Matches the v3 portfolio's setup.
  reactCompiler: true,
  // STACK became ABOUT (how I work, experience, stack, education). Old links
  // and search results land on the new tab.
  async redirects() {
    return [{ source: "/stack", destination: "/about", permanent: true }]
  },
}

export default nextConfig
