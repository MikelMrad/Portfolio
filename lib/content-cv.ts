/**
 * The portfolio variant (portfolio.mikelmrad.dev): the engineering portfolio
 * for companies and recruiters. Restored from the site as it was before the
 * business rewrite (commit c7e5dc1), with every em and en dash replaced.
 *
 * Shares its shape with the business set (lib/content-types.ts) wherever the
 * shared components read it, and adds what only this variant draws: the
 * figures, the status and location cards, the CV card, the stack sheets and
 * the contact cards. No services, prices, plans, FAQ, testimonials or
 * WhatsApp: none of that belongs here, and nothing links to the business site.
 *
 * lib/content-cv-ar.ts is the Arabic set of the same shape.
 */
import type { Project, Role, SharedContent, StackCategory } from "./content-types"

const IDENTITY = {
  name:      "MIKEL MRAD",
  role:      "FRONT-END / FULL-STACK DEVELOPER",
  tagline:   "COMMERCE, INTERFACES, AND THE DETAILS IN BETWEEN.",
  location:  "BEIRUT, LEBANON",
  reach:     "BEIRUT → WORLDWIDE",
  availability: {
    short: "OPEN TO FREELANCE",
    long:  "AVAILABLE FOR FREELANCE",
    note:  "FREELANCE PROJECTS ONLY",
  },
}

const STATS: { value: number; suffix: string; label: string }[] = [
  { value: 2,  suffix: "+", label: "YEARS SHIPPING" },
  { value: 10, suffix: "+", label: "PROJECTS BUILT" },
]

/** What a module is called when it is too small to show itself (isCramped()). */
const MODULE_TITLES: Record<string, string> = {
  status:       "STATUS",
  stats:        "BY THE\nNUMBERS",
  experience:   "EXPERIENCE",
  location:     "BASED",
  latest:       "MOST\nRECENT",
  "work-meta":  "SELECTED\nWORK",
  cv:           "2026 CV",
  "tech-count": "TOOLBOX",
  education:    "EDUCATION",
  headline:     "CONTACT",
  email:        "DIRECT",
  socials:      "ELSEWHERE",
}

const EMPLOYER = {
  name:     "YORK PRESS",
  location: "BEIRUT, LEBANON",
  span:     "2024 TO PRESENT",
  summary:  "MULTI-TENANT EXAM-REGISTRATION PLATFORM. 5 COUNTRY TENANTS, ONE CODEBASE.",
}

const ROLES: Role[] = [
  {
    title:  "FRONT-END ENGINEER & MOBILE LEAD",
    type:   "FULL-TIME",
    from:   "FEB 2026",
    to:     "PRESENT",
    months: 7,
    level:  3,
    blurb:
      "Became Front-End Lead after driving core platform initiatives: the school registration flow, education categories, and the dashboard builder. Took on Mobile Lead, leading a 3-engineer team building the iOS & Android app in React Native / Expo, and shipped OTP verification for mobile signup and password reset full-stack, from the Node.js auth microservice to the app screens.",
    skills: ["REACT NATIVE", "EXPO", "NODE.JS", "ZUSTAND", "TYPESCRIPT"],
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

const PROJECTS: Project[] = [
  {
    num:      "01",
    title:    "BRAND\nATELIER",
    headline: "AGENCY SITE / BILINGUAL EN · AR",
    role:     "CUSTOM WEB PLATFORM",
    year:     "2026",
    url:      "https://brandatelierdigital.com",
    images: [
      "/images/work/brandatelier-01.webp",
      "/images/work/brandatelier-02.webp",
      "/images/work/brandatelier-03.webp",
      "/images/work/brandatelier-04.webp",
    ],
    stack:  ["NEXT.JS 16", "MUI 9", "EMOTION", "NEXT-INTL"],
    body: [
      "Bilingual English / Arabic marketing site on the Next.js 16 App Router with true RTL that physically flips CSS via a stylis-plugin-rtl Emotion cache and a direction-aware theme.",
      "GDPR-style consent-gated analytics across GA4, Meta Pixel and LinkedIn Insight Tag, plus SEO routes for sitemap, robots and metadata.",
      "An EmailJS contact form and a strict styled()-only component architecture throughout.",
    ],
  },
  {
    num:      "02",
    title:    "VINYLIZED",
    headline: "E-COMMERCE / ORDER-TO-WHATSAPP",
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
    body: [
      "Custom storefront where checkout hands off to WhatsApp: the order is composed client-side and delivered as a structured message, removing payment-gateway friction for a local market.",
      "Supabase backs the catalogue and order records; Cloudflare fronts delivery and caching.",
    ],
  },
  {
    num:      "03",
    title:    "UNCLE J\nNUTRITION",
    headline: "E-COMMERCE / SHOPIFY",
    role:     "FREELANCE",
    year:     "JAN 2026",
    url:      null,
    images: [
      "/images/work/unclej-01.webp",
      "/images/work/unclej-02.webp",
      "/images/work/unclej-03.webp",
      "/images/work/unclej-04.webp",
    ],
    stack:  ["SHOPIFY", "LIQUID"],
    body: [
      "Conversion-focused Shopify storefront with Liquid theming, custom sections and mobile-first responsive design.",
      "Delivered end-to-end as a freelance engagement: custom product and collection templates, theme performance tuning, and full store configuration.",
    ],
  },
  {
    num:      "04",
    title:    "THE\nOUTLETS",
    headline: "E-COMMERCE / SHOPIFY",
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
    body: [
      "Co-founded the business and built its custom Shopify Liquid storefront with bespoke sections and responsive product pages.",
      "Own product, operations and day-to-day decision-making, running the store end-to-end from catalogue and merchandising through to checkout.",
    ],
  },
]

const STACK: StackCategory[] = [
  {
    id:    "languages",
    label: "LANGUAGES",
    skills: ["TYPESCRIPT", "JAVASCRIPT", "JAVA", "C++", "HTML", "CSS"],
  },
  {
    id:    "frameworks",
    label: "FRAMEWORKS & LIBRARIES",
    skills: [
      "NEXT.JS", "REACT", "REACT NATIVE", "NODE.JS", "EXPRESS", "REDUX",
      "GRAPHQL", "APOLLO CLIENT", "MUI", "EMOTION", "TAILWIND", "SHOPIFY LIQUID",
    ],
  },
  {
    id:    "tools",
    label: "TOOLS & PLATFORMS",
    skills: [
      "GIT", "DOCKER", "FIGMA", "POSTMAN", "SHOPIFY", "VERCEL",
      "ZUSTAND", "NEXT-INTL", "META PIXEL", "GA4", "PHOTOSHOP",
    ],
  },
  { id: "databases", label: "DATABASES", skills: ["MONGODB", "FIREBASE"] },
]

const TECH_COUNT = STACK.reduce((n, c) => n + c.skills.length, 0)

/** BY THE NUMBERS, expanded: the figures behind the two on the card. */
const STATS_DETAIL: { value: number; suffix?: string; label: string; note: string }[] = [
  { ...STATS[0], note: "NEXT.JS, REACT, TYPESCRIPT" },
  { ...STATS[1], note: `${PROJECTS.length} OF THEM UNDER WORK` },
  {
    value: ROLES.reduce((n, r) => n + r.months, 0),
    label: "MONTHS AT YORK PRESS",
    note:  `${ROLES.length} ROLES, INTERN → LEAD`,
  },
  { value: 5, label: "COUNTRY TENANTS", note: "ONE CODEBASE" },
  { value: 3, label: "ENGINEERS LED", note: "IOS & ANDROID, REACT NATIVE" },
  { value: TECH_COUNT, label: "TECHNOLOGIES", note: `ACROSS ${STACK.length} CATEGORIES` },
]

const EDUCATION = [
  {
    school: "HOLY SPIRIT UNIVERSITY OF KASLIK",
    short:  "USEK",
    place:  "KASLIK, LEBANON",
    award:  "BSc COMPUTER SCIENCE",
    years:  "2021 TO 2024",
  },
  {
    school: "COLLÈGE SAINTE FAMILLE",
    short:  "CSF",
    place:  "ZALKA, LEBANON",
    award:  "LEBANESE BACCALAUREATE · GENERAL SCIENCES",
    years:  "2020 TO 2021",
  },
]

const UI = {
  identity: { portfolio: "PORTFOLIO · 2026", home: "INDEX", homeAria: "Go to index" },
  range: (from: string, to: string) => `${from} TO ${to}`,
  status:   { label: "STATUS", value: "OPEN" },
  stats:    { label: "BY THE NUMBERS", figures: (n: number) => `${n} FIGURES` },
  location: { label: "BASED", city: "BEIRUT", note: "GMT+3 · REMOTE-READY" },
  latest:   { label: "MOST RECENT", cta: "ALL WORK" },
  experience: { label: "EXPERIENCE", months: "MOS" },
  workMeta: { label: "SELECTED", line: "PROJECTS · 2022 TO 2026", tags: "SHOPIFY · HEADLESS · COMMERCE" },
  cv: {
    label: "CURRICULUM VITAE", top: "2026", bottom: "CV",
    contents: "EXPERIENCE · STACK · EDUCATION", download: "DOWNLOAD",
  },
  project:   { label: "WORK", views: "VIEWS", visit: "VISIT SITE" },
  toolbox:   { label: "TOOLBOX", technologies: "TECHNOLOGIES", categories: (n: number) => `${n} CATEGORIES` },
  education: { label: "EDUCATION" },
  contact: {
    label: "CONTACT", headline: ["LET'S", "WORK."] as [string, string],
    direct: "DIRECT",
    github: "GITHUB", linkedin: "LINKEDIN", cv: "CV",
    footer: "© 2026 MikelMrad", colophon: "· NEXT.JS",
  },
  expand: "EXPAND",
  close: "CLOSE",
  esc: "ESC",
  step: "TO STEP THROUGH",
  expanded: "EXPANDED",
  roles: (n: number) => `${n} ROLES`,
  tabs: { index: "INDEX", work: "WORK", stack: "STACK", contact: "CONTACT" } as Record<string, string>,
  dock: {
    hints: "DRAG · FLING · 1-4 · ← → · ESC",
    reset: "RESET GRID", resetAria: "Put the cards back",
    lang: "عربي", langAria: "التبديل إلى العربية",
    toLight: "Switch to light mode", toDark: "Switch to dark mode",
  },
  demo: {
    tabsPhone: "TAP A TAB TO SWITCH PAGE",
    tabsDesktop: "TABS SWITCH PAGE · OR PRESS 1-4",
    open: "TAP A CARD TO OPEN IT",
    swap: "DRAG ONTO ANOTHER TO SWAP",
    fling: "FLING TO THROW",
    shake: "SHAKE TO RESET",
    shakeOffer: "SHAKE YOUR PHONE TO RESET THE GRID",
    shakeEnable: "ENABLE", shakeLater: "NOT NOW",
    skip: "SKIP DEMO", skipAria: "Close the demonstration",
    watch: "WATCH DEMO", watchAria: "Play a short demonstration of how the site works",
  },
}

export const CV_EN = {
  VARIANT: "cv" as const,
  IDENTITY, STATS, MODULE_TITLES, EMPLOYER, ROLES, PROJECTS, STACK, TECH_COUNT,
  STATS_DETAIL, EDUCATION, UI,
}
export type CvContent = typeof CV_EN

// The portfolio set must offer everything the shared components read.
CV_EN satisfies SharedContent
