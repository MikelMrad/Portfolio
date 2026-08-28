/**
 * Single source of truth for every piece of copy on the site.
 * Reconciled from Mikel-Mrad-CV-Technical.pdf (Aug 2026) and the v3 portfolio.
 * Modules read from here — never hardcode strings in components.
 */

export const IDENTITY = {
  name:      "MIKEL MRAD",
  role:      "FRONT-END / FULL-STACK DEVELOPER",
  tagline:   "COMMERCE, INTERFACES, AND THE DETAILS IN BETWEEN.",
  location:  "BEIRUT, LEBANON",
  reach:     "BEIRUT → WORLDWIDE",
  available: true,
  /** Drop a file here and the monogram fallback stands down automatically. */
  avatar:    "/images/avatar.jpg",
  monogram:  "MM",
} as const

export const CONTACT = {
  email:    "mikelmrad.work@gmail.com",
  phone:    "+961 70 036 858",
  github:   "https://github.com/mikelmrad",
  linkedin: "https://www.linkedin.com/in/mikel-mrad/",
  cv:       "/docs/Mikel-Mrad-CV.pdf",
} as const

export const STATS = [
  { value: 2,  suffix: "+", label: "YEARS SHIPPING"  },
  { value: 5,  suffix: "",  label: "COUNTRY TENANTS" },
  { value: 10, suffix: "+", label: "PROJECTS BUILT"  },
] as const

// ── Experience ────────────────────────────────────────────────────────────────
// Four roles, one employer. The progression is the story, so `level` drives the
// height of each rung in the timeline module.

export type Role = {
  title:  string
  type:   string
  from:   string
  to:     string
  months: number
  /** 0 = entry, 3 = current. Drives rung height in the timeline. */
  level:  number
  blurb:  string
  skills: string[]
}

export const EMPLOYER = {
  name:     "YORK PRESS",
  location: "BEIRUT, LEBANON",
  span:     "2024 — PRESENT",
  summary:  "MULTI-TENANT EXAM-REGISTRATION PLATFORM. 5 COUNTRY TENANTS, ONE CODEBASE.",
} as const

export const ROLES: Role[] = [
  {
    title:  "FRONT-END ENGINEER & MOBILE LEAD",
    type:   "FULL-TIME",
    from:   "FEB 2026",
    to:     "PRESENT",
    months: 7,
    level:  3,
    blurb:
      "Became Front-End Lead after driving core platform initiatives — the school registration flow, education categories, and the dashboard builder. Took on Mobile Lead, leading a 3-engineer team building the iOS & Android app in React Native / Expo.",
    skills: ["REACT NATIVE", "EXPO", "ZUSTAND", "TYPESCRIPT"],
  },
  {
    title:  "FRONT-END DEVELOPER",
    type:   "FULL-TIME",
    from:   "MAY 2025",
    to:     "FEB 2026",
    months: 10,
    level:  2,
    blurb:
      "Owned frontend feature delivery across the platform. Architected a multi-gateway payment system using the Strategy Pattern to route PayPal and Paymob by country, and built an end-to-end UTM tracking pipeline attributing Meta and Google ad spend across domain redirects.",
    skills: ["NEXT.JS", "APOLLO", "GRAPHQL", "MUI"],
  },
  {
    title:  "FRONT-END DEVELOPER",
    type:   "PART-TIME",
    from:   "NOV 2024",
    to:     "MAY 2025",
    months: 7,
    level:  1,
    blurb:
      "Delivered frontend features for the exam registration platform. Built reusable React components, refined group-aware exam selection logic, and contributed to dashboard and core user-flow improvements. Earned a transition to full-time.",
    skills: ["REACT", "TYPESCRIPT", "MUI"],
  },
  {
    title:  "WEB DEVELOPMENT INTERN",
    type:   "INTERNSHIP",
    from:   "JUL 2024",
    to:     "OCT 2024",
    months: 4,
    level:  0,
    blurb:
      "First role on the engineering team. Contributed production frontend features in React and Next.js, built and styled UI components, and resolved bugs across the registration experience.",
    skills: ["REACT", "NEXT.JS"],
  },
]

// ── Work ──────────────────────────────────────────────────────────────────────

export type Project = {
  num:      string
  title:    string
  subtitle: string
  role:     string
  year:     string
  url:      string | null
  /** Set when the live site is gone — renders an ARCHIVED chip instead of a link. */
  archived?: boolean
  images:   string[]
  stack:    string[]
  detail:   string[]
}

export const PROJECTS: Project[] = [
  {
    num:      "01",
    title:    "BRAND\nATELIER",
    subtitle: "AGENCY SITE / BILINGUAL EN—AR",
    role:     "CUSTOM WEB PLATFORM",
    year:     "2026",
    url:      "https://brandatelier.vercel.app",
    images: [
      "/images/work/brandatelier-01.webp",
      "/images/work/brandatelier-02.webp",
      "/images/work/brandatelier-03.webp",
      "/images/work/brandatelier-04.webp",
    ],
    stack:  ["NEXT.JS 16", "MUI 9", "EMOTION", "NEXT-INTL"],
    detail: [
      "Bilingual English / Arabic marketing site on the Next.js 16 App Router with true RTL that physically flips CSS via a stylis-plugin-rtl Emotion cache and a direction-aware theme.",
      "GDPR-style consent-gated analytics across GA4, Meta Pixel and LinkedIn Insight Tag, plus SEO routes for sitemap, robots and metadata.",
      "An EmailJS contact form and a strict styled()-only component architecture throughout.",
    ],
  },
  {
    num:      "02",
    title:    "VINYLIZED",
    subtitle: "E-COMMERCE / ORDER-TO-WHATSAPP",
    role:     "SOLO DEVELOPER",
    year:     "2026",
    url:      "https://vinylizedlb.com",
    images: [
      "/images/work/vinylized-01.webp",
      "/images/work/vinylized-02.webp",
      "/images/work/vinylized-03.webp",
      "/images/work/vinylized-04.webp",
    ],
    stack:  ["NEXT.JS", "MUI", "SUPABASE", "CLOUDFLARE"],
    detail: [
      "Custom storefront where checkout hands off to WhatsApp — the order is composed client-side and delivered as a structured message, removing payment-gateway friction for a local market.",
      "Supabase backs the catalogue and order records; Cloudflare fronts delivery and caching.",
    ],
  },
  {
    num:      "03",
    title:    "UNCLE J\nNUTRITION",
    subtitle: "E-COMMERCE / SHOPIFY",
    role:     "FREELANCE",
    year:     "JAN 2026",
    url:      null,
    archived: true,
    images: [
      "/images/work/unclej-01.webp",
      "/images/work/unclej-02.webp",
      "/images/work/unclej-03.webp",
      "/images/work/unclej-04.webp",
    ],
    stack:  ["SHOPIFY", "LIQUID"],
    detail: [
      "Conversion-focused Shopify storefront with Liquid theming, custom sections and mobile-first responsive design.",
      "Delivered end-to-end as a freelance engagement: custom product and collection templates, theme performance tuning, and full store configuration.",
      "The store has since closed — these screenshots, captured Aug 2026, are the record of the build.",
    ],
  },
  {
    num:      "04",
    title:    "THE\nOUTLETS",
    subtitle: "E-COMMERCE / SHOPIFY",
    role:     "CO-FOUNDER & DEVELOPER",
    year:     "SINCE 2022",
    url:      "https://theoutletslb.com",
    images: [
      "/images/work/theoutlets-01.webp",
      "/images/work/theoutlets-02.webp",
      "/images/work/theoutlets-03.webp",
      "/images/work/theoutlets-04.webp",
    ],
    stack:  ["SHOPIFY", "LIQUID"],
    detail: [
      "Co-founded the business and built its custom Shopify Liquid storefront with bespoke sections and responsive product pages.",
      "Own product, operations and day-to-day decision-making — running the store end-to-end from catalogue and merchandising through to checkout.",
    ],
  },
]

// ── Stack ─────────────────────────────────────────────────────────────────────

export type StackCategory = { label: string; skills: string[] }

export const STACK: StackCategory[] = [
  {
    label: "LANGUAGES",
    skills: ["TYPESCRIPT", "JAVASCRIPT", "JAVA", "C++", "HTML", "CSS"],
  },
  {
    label: "FRAMEWORKS & LIBRARIES",
    skills: [
      "NEXT.JS", "REACT", "REACT NATIVE", "NODE.JS", "EXPRESS", "REDUX",
      "GRAPHQL", "APOLLO CLIENT", "MUI", "EMOTION", "TAILWIND", "SHOPIFY LIQUID",
    ],
  },
  {
    label: "TOOLS & PLATFORMS",
    skills: [
      "GIT", "DOCKER", "FIGMA", "POSTMAN", "SHOPIFY", "VERCEL",
      "ZUSTAND", "NEXT-INTL", "META PIXEL", "GA4", "PHOTOSHOP",
    ],
  },
  { label: "DATABASES", skills: ["MONGODB", "FIREBASE"] },
]

export const TECH_COUNT = STACK.reduce((n, c) => n + c.skills.length, 0)

export const EDUCATION = [
  {
    school: "HOLY SPIRIT UNIVERSITY OF KASLIK",
    short:  "USEK",
    place:  "KASLIK, LEBANON",
    award:  "BSc COMPUTER SCIENCE",
    years:  "2021 — 2024",
  },
  {
    school: "COLLÈGE SAINTE FAMILLE",
    short:  "CSF",
    place:  "ZALKA, LEBANON",
    award:  "LEBANESE BACCALAUREATE — GENERAL SCIENCES",
    years:  "2020 — 2021",
  },
] as const
