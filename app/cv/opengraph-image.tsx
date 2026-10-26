import { CV_EN } from "@/lib/content-cv"
import { ogCard, OG_SIZE } from "@/lib/og"
import { CV_TITLE } from "@/lib/seo"

/**
 * The portfolio's link preview: the same card as the business site's
 * (lib/og.tsx), with the role in place of the pitch. Served publicly at
 * portfolio.mikelmrad.dev/opengraph-image, which proxy.ts rewrites here.
 */

export const alt = CV_TITLE
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return ogCard({ line: CV_EN.IDENTITY.role })
}
