import type { MetadataRoute } from "next"
import { CONTACT } from "@/lib/content"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", CONTACT.site).toString(),
  }
}
