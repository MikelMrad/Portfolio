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
import type { TabId } from "./grid"
import { CONTACT, FAQ, PROJECTS, SERVICES } from "./content"

export const SITE_NAME = "Mikel Mrad"

export const SITE_TITLE = "Mikel Mrad | Online stores and websites for Lebanon, the Gulf and worldwide"
export const SITE_DESCRIPTION =
  "Developer in Beirut. I build Shopify stores, Next.js websites and apps for businesses in Lebanon, the Gulf and anywhere in the world, in Arabic and English. Available for freelance."

const cap = (s: string) =>
  s.toLowerCase().replace(/(^|[\s/-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase())

export const TAB_META: Record<TabId, { path: string; title: string; description: string }> = {
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
      "Free call, fixed quote in 48 hours, weekly previews, then launch with a free first year of maintenance. Front-end and mobile lead at York Press, building with Next.js, React Native and Shopify.",
  },
  contact: {
    path: "/contact",
    title: `Contact | ${SITE_NAME}`,
    description: `Tell me what you're building. Message me on WhatsApp or email ${CONTACT.email}. Stores from $600, websites from $900.`,
  },
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
          description: s.body,
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
