import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Verified against Motion 12's layout/layoutId engine and the r3f canvas:
  // build, scatter transition, identity morph and project expand all behave
  // identically with this on. Matches the v3 portfolio's setup.
  reactCompiler: true,
}

export default nextConfig
