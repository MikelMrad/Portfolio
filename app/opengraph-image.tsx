import { CONTACT, HERO } from "@/lib/content"
import { ogCard, OG_SIZE } from "@/lib/og"
import { SITE_TITLE } from "@/lib/seo"

/**
 * The business site's link preview: what WhatsApp, iMessage, Slack, LinkedIn
 * and X show when mikelmrad.dev is shared. The card itself is lib/og.tsx.
 *
 * Wired into metadata explicitly (OG_IMAGE in lib/seo.ts): the per-tab
 * openGraph and twitter objects in page.tsx replace the parent's, and with them
 * the image this file would otherwise supply.
 */

export const alt = SITE_TITLE
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return ogCard({ line: HERO.headline, site: new URL(CONTACT.site).host })
}
