/**
 * What search engines, link scrapers and AI crawlers are told about the site.
 *
 * The page itself is a canvas that mounts after JavaScript — a crawler that
 * doesn't run JS sees the boot drawing and nothing else. Three things make up
 * for that, all derived from lib/content.ts so they can't drift from the site:
 *
 * - per-route titles and descriptions (TAB_META, used by generateMetadata);
 * - structured data — a schema.org ProfilePage about a Person (personJsonLd);
 * - the static CV text in components/static-cv.tsx, server-rendered into the
 *   page and set aside once the grid mounts.
 *
 * English only: the server can't know the language, and the Arabic site is
 * reached with ?lang=ar, declared as an alternate.
 */
import type { TabId } from "./grid"
import {
  CONTACT, EDUCATION, EMPLOYER, IDENTITY, PROJECTS, ROLES, STACK,
} from "./content"

export const SITE_NAME = "Mikel Mrad"

const cap = (s: string) =>
  s.toLowerCase().replace(/(^|[\s/—-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase())

export const TAB_META: Record<TabId, { path: string; title: string; description: string }> = {
  index: {
    path: "/",
    title: `${SITE_NAME} — ${cap(IDENTITY.role)}`,
    description:
      "Front-end / full-stack developer in Beirut. Next.js, React, TypeScript and React Native — multi-tenant platforms, custom storefronts and the interfaces in between. Available for freelance.",
  },
  work: {
    path: "/work",
    title: `Work — ${SITE_NAME}`,
    description: `Selected projects: ${PROJECTS.map((p) => cap(p.title.replace("\n", " "))).join(", ")}. Custom web platforms and e-commerce built with Next.js and Shopify.`,
  },
  stack: {
    path: "/stack",
    title: `Stack — ${SITE_NAME}`,
    description: `The tools: ${STACK.flatMap((c) => c.skills).slice(0, 12).join(", ")} and more. Plus education — BSc Computer Science, USEK.`,
  },
  contact: {
    path: "/contact",
    title: `Contact — ${SITE_NAME}`,
    description: `Get in touch about a freelance project — ${CONTACT.email}. Based in Beirut, working worldwide.`,
  },
}

/** schema.org ProfilePage → Person, for search engines and AI crawlers. */
export function personJsonLd(path: string) {
  const url = new URL(path, CONTACT.site).toString()
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    name: TAB_META.index.title,
    inLanguage: ["en", "ar"],
    mainEntity: {
      "@type": "Person",
      "@id": `${CONTACT.site}/#person`,
      name: SITE_NAME,
      jobTitle: cap(IDENTITY.role),
      description: cap(IDENTITY.tagline),
      url: CONTACT.site,
      email: `mailto:${CONTACT.email}`,
      image: `${CONTACT.site}/icon.png`,
      address: { "@type": "PostalAddress", addressLocality: "Beirut", addressCountry: "LB" },
      sameAs: [CONTACT.github, CONTACT.linkedin],
      worksFor: { "@type": "Organization", name: cap(EMPLOYER.name) },
      hasOccupation: {
        "@type": "Occupation",
        name: cap(ROLES[0].title),
        occupationLocation: { "@type": "City", name: "Beirut" },
      },
      alumniOf: EDUCATION.map((e) => ({ "@type": "EducationalOrganization", name: cap(e.school) })),
      knowsAbout: STACK.flatMap((c) => c.skills),
      knowsLanguage: ["en", "ar"],
    },
  }
}

/** JSON for a <script> tag — `<` escaped, per the Next.js JSON-LD guide. */
export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
