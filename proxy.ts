import { NextResponse, type NextRequest } from "next/server"

/**
 * One app, two sites, picked by hostname.
 *
 * - mikelmrad.dev is the business site: app/[[...tab]], untouched here.
 * - portfolio.mikelmrad.dev is the engineering portfolio: its clean public
 *   paths (/, /work, /stack, /contact, /opengraph-image) are rewritten to the
 *   internal /cv route (app/cv), so the address bar never shows /cv.
 * - /cv on the main domain redirects to the subdomain, so the portfolio is
 *   never reachable, or indexable, under mikelmrad.dev.
 *
 * Local development: portfolio.localhost:3000 works like the subdomain (browsers
 * resolve *.localhost to the machine). ?variant=cv is a fallback for testing,
 * honoured only on localhost and Vercel preview hosts, never in production,
 * where it would put the portfolio on the main domain.
 *
 * Static files are left alone (the matcher below): /_next, the images, the CV
 * PDF, robots.txt and the sitemap are the same files on both hosts.
 */

const PORTFOLIO_HOST = "portfolio.mikelmrad.dev"

const isLocal   = (host: string) => /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host)
const isPreview = (host: string) => host.endsWith(".vercel.app")

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? ""
  const url = request.nextUrl
  const path = url.pathname

  const portfolioHost = host.startsWith("portfolio.")
  const fallback = url.searchParams.get("variant") === "cv" && (isLocal(host) || isPreview(host))

  // The portfolio's internal route, asked for directly on the main domain:
  // send it to the subdomain, keeping the rest of the path and the query.
  if (!portfolioHost && (path === "/cv" || path.startsWith("/cv/"))) {
    const target = new URL(request.url)
    target.host = isLocal(host) ? `portfolio.${host}` : PORTFOLIO_HOST
    if (!isLocal(host)) { target.protocol = "https:"; target.port = "" }
    target.pathname = path.slice(3) || "/"
    return NextResponse.redirect(target, 308)
  }

  if (portfolioHost || fallback) {
    // The internal path typed on the subdomain: back to the clean one.
    if (path === "/cv" || path.startsWith("/cv/")) {
      const clean = url.clone()
      clean.pathname = path.slice(3) || "/"
      return NextResponse.redirect(clean, 308)
    }
    const target = url.clone()
    target.pathname = path === "/" ? "/cv" : `/cv${path}`
    return NextResponse.rewrite(target)
  }

  return NextResponse.next()
}

export const config = {
  // Everything but Next's own assets and files with an extension.
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
}
