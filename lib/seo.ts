/**
 * What search engines, link scrapers and AI crawlers are told about the site.
 *
 * The page itself is a canvas that mounts after JavaScript: a crawler that
 * doesn't run JS sees the boot drawing and nothing else. Three things make up
 * for that, all derived from lib/content.ts so they can't drift from the site:
 *
 * - per-route titles and descriptions (TAB_META, used by generateMetadata);
 * - structured data: a Person and an FAQPage (jsonLd);
 * - the static CV text in components/static-cv.tsx, server-rendered into the
 *   page and set aside once the grid mounts.
 *
 * English only: the server can't know the language, and the Arabic site is
 * reached with ?lang=ar, declared as an alternate. No em dashes in any of it.
 */
import type { BusinessTabId, CvTabId } from "./grid"
import { CONTACT, FAQ, PROJECTS, SERVICES } from "./content"

export const SITE_NAME = "Mikel Mrad"

export const SITE_TITLE = "Mikel Mrad | Online stores and websites for Lebanon, the Gulf and worldwide"
export const SITE_DESCRIPTION =
  "Developer in Beirut. I build Shopify stores, Next.js websites and apps for businesses in Lebanon, the Gulf and anywhere in the world, in Arabic and English. Available for freelance."

/**
 * The link preview (app/opengraph-image.tsx), named in metadata explicitly:
 * a route that sets its own openGraph/twitter objects replaces the parent's,
 * and the file convention's image went with them, so no og:image was output.
 */
export const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: SITE_TITLE, type: "image/png" }

const cap = (s: string) =>
  s.toLowerCase().replace(/(^|[\s/-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase())

type Meta = { path: string; title: string; description: string }

export const TAB_META: Record<BusinessTabId, Meta> = {
  index: {
    path: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  work: {
    path: "/work",
    title: `Work | ${SITE_NAME}`,
    description: `Online stores and websites I've built: ${PROJECTS.map((p) => cap(p.title.replace("\n", " "))).join(", ")}. Shopify and Next.js, in Arabic and English.`,
  },
  about: {
    path: "/about",
    title: `How I work | ${SITE_NAME}`,
    description:
      "Free call, fixed quote in 48 hours, weekly previews, then launch with free bug fixes: a year for stores and websites, 3 months for apps. Front-end and mobile lead at York Press, building with Next.js, React Native and Shopify.",
  },
  contact: {
    path: "/contact",
    title: `Contact | ${SITE_NAME}`,
    description: `Tell me what you're building. Message me on WhatsApp or email ${CONTACT.email}. Stores from $600, websites from $900.`,
  },
}

// ── The portfolio variant (portfolio.mikelmrad.dev) ────────────────────────
// Kept out of search on purpose: it must not compete with mikelmrad.dev. Every
// page says noindex, follow, and next.config.ts adds an X-Robots-Tag header to
// everything served on that host. robots.txt does NOT block it: a crawler that
// can't fetch a page never sees its noindex, and can index the bare URL anyway.
// It is not in the sitemap, and nothing on the business site links to it.

export const CV_TITLE = "Mikel Mrad | Front-End / Full-Stack Developer"
export const CV_DESCRIPTION =
  "Front-end and full-stack developer in Beirut. Next.js, React, TypeScript and React Native: multi-tenant platforms, custom storefronts and mobile apps."

/** Absolute: the root layout's metadataBase is the business origin. */
export const CV_OG_IMAGE = {
  url: `${CONTACT.portfolio}/opengraph-image`, width: 1200, height: 630, alt: CV_TITLE, type: "image/png",
}

export const CV_TAB_META: Record<CvTabId, Meta> = {
  index:   { path: "/",        title: CV_TITLE,                 description: CV_DESCRIPTION },
  work:    { path: "/work",    title: `Work | ${SITE_NAME}`,    description: CV_DESCRIPTION },
  stack:   { path: "/stack",   title: `Stack | ${SITE_NAME}`,   description: CV_DESCRIPTION },
  contact: { path: "/contact", title: `Contact | ${SITE_NAME}`, description: CV_DESCRIPTION },
}

/**
 * schema.org structured data: the Person behind the site, and the FAQ as an
 * FAQPage. One @graph, so both sit in a single <script> tag.
 */
export function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${CONTACT.site}/#person`,
        name: SITE_NAME,
        jobTitle: "Front-end / full-stack developer",
        description: SITE_DESCRIPTION,
        url: CONTACT.site,
        email: `mailto:${CONTACT.email}`,
        telephone: `+${CONTACT.whatsapp}`,
        image: `${CONTACT.site}/icon.png`,
        address: { "@type": "PostalAddress", addressLocality: "Beirut", addressCountry: "LB" },
        sameAs: [CONTACT.github, CONTACT.linkedin],
        knowsLanguage: ["en", "ar"],
        makesOffer: SERVICES.items.map((s) => ({
          "@type": "Offer",
          name: cap(s.title.replace("\n", " ")),
          description: s.note ? `${s.body} ${s.note}.` : s.body,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${CONTACT.site}/#faq`,
        mainEntity: FAQ.items.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  }
}

/** JSON for a <script> tag: `<` escaped, per the Next.js JSON-LD guide. */
export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
