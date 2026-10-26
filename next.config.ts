import type { NextConfig } from "next"

/** Anything served on the portfolio subdomain (see proxy.ts). */
const PORTFOLIO = [{ type: "host" as const, value: "portfolio\\..*" }]

const nextConfig: NextConfig = {
  // Verified against Motion 12's layout/layoutId engine: build, scatter
  // transition, identity morph and project expand all behave identically with
  // this on. Matches the v3 portfolio's setup.
  reactCompiler: true,

  // STACK became ABOUT on the business site (how I work, experience, stack,
  // education); old links and search results land on the new tab. Not on the
  // portfolio subdomain, where STACK is still a tab: redirects run before
  // proxy.ts, so without the host condition this would break it.
  async redirects() {
    return [{
      source: "/stack",
      destination: "/about",
      permanent: true,
      missing: [...PORTFOLIO, { type: "query", key: "variant" }],
    }]
  },

  // The portfolio stays out of search so it never competes with mikelmrad.dev.
  // Its pages also say noindex in a meta tag; the header covers everything
  // else served on that host (the preview image, the PDF, the screenshots).
  async headers() {
    return [{
      source: "/:path*",
      has: PORTFOLIO,
      headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
    }]
  },
}

export default nextConfig
