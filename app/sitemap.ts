import type { MetadataRoute } from "next"
import { CONTACT } from "@/lib/config"
import { PROJECTS } from "@/lib/content"
import { TAB_META } from "@/lib/seo"

/**
 * Every tab. WORK lists each project's lead screenshot, for image search.
 *
 * No hreflang alternates here: each page already declares its Arabic version
 * (?lang=ar) in its own <head> (alternates in page.tsx), which is enough for
 * Google. Listing them here as well needs the xhtml namespace, and that makes
 * browsers render the sitemap as a page of run-together text instead of XML.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(TAB_META).map((m) => ({
    url: new URL(m.path, CONTACT.site).toString(),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: m.path === "/" ? 1 : 0.8,
    ...(m.path === "/work" && {
      images: PROJECTS.map((p) => new URL(p.images[0], CONTACT.site).toString()),
    }),
  }))
}
