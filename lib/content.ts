/**
 * Single source of truth for every piece of copy on the site.
 * Modules read from here; never hardcode strings in components.
 *
 * Two languages. This file is English and defines the shape (`Content`);
 * lib/content-ar.ts is the Arabic set of the same shape. Components read the
 * active one through `useContent()` (lib/i18n.tsx), never these constants
 * directly. The named exports below remain for the server-side, English-only
 * consumers (the link preview, metadata, the static CV).
 *
 * House rule: no em or en dashes in anything a visitor reads. Use a comma, a
 * period, a colon or a middle dot (·).
 *
 * Contact details (numbers, addresses, links) are not copy: see lib/config.ts.
 */
export { CONTACT } from "./config"

export const IDENTITY = {
  name:      "MIKEL MRAD",
  /** The hero's eyebrow, carried by the identity card. */
  role:      "FRONT-END / FULL-STACK DEVELOPER · BEIRUT",
  tagline:   "ONLINE STORES, WEBSITES AND APPS.",
  location:  "BEIRUT, LEBANON",
  /**
   * Freelance only: the full-time seat is taken (see ROLES), so nothing on the
   * site may read as looking for another one. Two lengths because the line
   * lands in two box shapes: the identity card narrow and wide.
   */
  availability: {
    short: "OPEN TO FREELANCE",
    long:  "AVAILABLE FOR FREELANCE",
  },
}

// ── Hero ──────────────────────────────────────────────────────────────────────

export const HERO = {
  label:    "STORES · WEBSITES · APPS",
  langs:    "EN · AR",
  headline: "I build online stores and websites that sell.",
  subline:
    "For businesses in Lebanon, the Gulf and anywhere in the world. Shopify and Next.js, Arabic and English, with WhatsApp orders, cash on delivery and ad tracking set up from day one.",
  whatsapp: "MESSAGE ME ON WHATSAPP",
  work:     "SEE MY WORK",
}

/** The proof strip: replaces the old "2+ years / 10+ projects" figures. */
export const PROOF = {
  label: "TRACK RECORD",
  items: [
    "Front-end and mobile lead on a platform running in 5 countries",
    "Co-founder of a Lebanese online store",
    "Shipping since 2022",
  ],
}

// ── Services ──────────────────────────────────────────────────────────────────

/** A care plan, shown side by side when the CARE PLANS card is opened. */
export type CarePlan = { name: string; price: string; items: string[] }

/** `id` is stable across languages: the stage maps `svc-<id>` modules by it. */
export type Service = {
  id: string; num: string; title: string; body: string; price: string
  /** A line under the price: what's included, or when it applies. */
  note?: string
  /** What comes with the build, listed when the card is opened. */
  includes?: string[]
  plans?: CarePlan[]
}

/** What every build comes with: stores, websites and apps alike. */
const INCLUDED = [
  "Onboarding: a walkthrough so you can run it yourself",
  "1 year of free maintenance",
  "Everything set up in your name, with full access",
]

export const SERVICES = {
  label: "WHAT I BUILD",
  items: [
    {
      id: "stores", num: "01", title: "ONLINE\nSTORES",
      body: "Shopify stores built for how people here buy: WhatsApp orders, cash on delivery, Whish, delivery zones. Pixel and analytics ready for your ads.",
      price: "Starting at $600",
      note: "Includes onboarding and 1 year of free maintenance",
      includes: INCLUDED,
    },
    {
      id: "websites", num: "02", title: "WEBSITES",
      body: "Fast custom sites in English and Arabic, with real right-to-left layout, not flipped text. Built to show up on Google and turn visits into messages.",
      price: "Starting at $900",
      note: "Includes onboarding and 1 year of free maintenance",
      includes: INCLUDED,
    },
    {
      id: "apps", num: "03", title: "APPS",
      body: "iOS and Android apps in React Native, from booking systems to dashboards.",
      price: "Quoted after a call",
      note: "Includes onboarding and 1 year of free maintenance",
      includes: INCLUDED,
    },
    {
      id: "care", num: "04", title: "CARE\nPLANS",
      body: "After your free first year, I keep your site running and up to date. Care covers maintenance and small changes; Care+ adds more for a growing business.",
      price: "From $200 a year",
      note: "Starts after your free first year",
      plans: [
        {
          name: "CARE",
          price: "$200 a year",
          items: [
            "Updates, security and backups",
            "Any issue fixed within 48 hours",
            "Small fixes and design tweaks",
          ],
        },
        {
          name: "CARE+",
          price: "$450 a year",
          items: [
            "Everything in Care",
            "Bigger changes: new sections and pages",
            "Speed and SEO checkups",
            "Onboarding for new staff",
            "Priority support, replies within 24 hours",
          ],
        },
      ],
    },
  ] as Service[],
}

// ── How I work ────────────────────────────────────────────────────────────────

export const PROCESS = {
  label: "HOW I WORK",
  steps: [
    { title: "Free call",                 body: "20 minutes to understand your business and what you need." },
    { title: "Fixed quote in 48 hours",   body: "One price, a clear scope, no surprises." },
    { title: "Weekly previews",           body: "You see progress every week and give feedback as we go." },
    { title: "Launch and support",        body: "I launch it, train you, and look after it free for the first year." },
  ],
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

export const FAQ = {
  label: "FAQ",
  items: [
    {
      q: "How much does a website cost?",
      a: "Stores start at $600 and custom websites at $900. You get a fixed quote within 48 hours of our call.",
    },
    {
      q: "How long does it take?",
      a: "Most stores take 2 to 3 weeks and websites 3 to 4.",
    },
    {
      q: "Do you work with clients outside Lebanon?",
      a: "Yes. I work with clients in the Gulf, Europe and North America, fully remote.",
    },
    {
      q: "Can my customers pay by cash on delivery or WhatsApp?",
      a: "Yes. I set up cash on delivery, Whish, WhatsApp orders and card payments where available.",
    },
    {
      q: "Do I own my website?",
      a: "Yes. Everything is set up in your name, and you get full access.",
    },
    {
      q: "What happens after launch?",
      a: "Your first year of maintenance is free. After that, you can keep it on a Care or Care+ plan.",
    },
  ],
}

// ── Testimonials ──────────────────────────────────────────────────────────────

/**
 * Quote and role per testimonial, keyed by the `id` in lib/testimonials.ts,
 * which holds the name, business, logo and the `approved` switch.
 */
export const TESTIMONIALS: Record<string, { quote: string; role: string }> = {
  "brand-atelier": {
    quote: "Mikel was very professional from start to finish. He replied quickly and fixed issues fast, even when I changed the same thing several times. He delivered on time and at exactly the price we agreed.",
    role:  "",
  },
  vinylized: {
    quote: "Since the new website launched, we've been getting way more customers. It works as a real sales funnel for the business and it lifted the whole brand.",
    role:  "",
  },
}

/**
 * What a module is called when it is too small to show itself.
 *
 * A card moved into a cell much smaller than the one it was composed for
 * collapses to this title plus EXPAND, and opens full-size on tap (see
 * `isCramped()` in stage.tsx). Projects and services use their own titles, so
 * they're not listed here.
 */
export const MODULE_TITLES: Record<string, string> = {
  hero:         "WHAT I\nBUILD",
  "work-meta":  "SELECTED\nWORK",
  testimonials: "CLIENTS",
  process:      "HOW I\nWORK",
  experience:   "EXPERIENCE",
  stack:        "STACK",
  education:    "EDUCATION",
  contact:      "CONTACT",
  faq:          "FAQ",
}

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
  span:     "2024 TO PRESENT",
  summary:  "MULTI-TENANT EXAM-REGISTRATION PLATFORM. 5 COUNTRY TENANTS, ONE CODEBASE.",
}

export const ROLES: Role[] = [
  {
    title:  "FRONT-END ENGINEER & MOBILE LEAD",
    type:   "FULL-TIME",
    from:   "FEB 2026",
    to:     "PRESENT",
    months: 7,
    level:  3,
    blurb:
      "Lead a 3-engineer team shipping the iOS and Android app in React Native and Expo. Built OTP signup and password reset end to end, from the Node.js auth service to the app screens.",
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
      "Built payment routing that sends each country to PayPal or Paymob, and ad attribution tracking for Meta and Google across country domains.",
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
      "Built reusable React components and group-aware exam selection logic. Moved to full-time after six months.",
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
      "Shipped production features and bug fixes in React and Next.js.",
    skills: ["REACT", "NEXT.JS"],
  },
]

// ── Work ──────────────────────────────────────────────────────────────────────

export type Project = {
  num:      string
  title:    string
  /** The outcome, in one line. */
  headline: string
  body:     string
  role:     string
  year:     string
  url:      string | null
  images:   string[]
  stack:    string[]
}

export const PROJECTS: Project[] = [
  {
    num:      "01",
    title:    "VINYLIZED",
    headline: "A store where every order lands in WhatsApp.",
    body:
      "Customers pick their records and tap one button. The site writes the full order into a WhatsApp message, ready for the owner to confirm. No card forms and no gateway fees, in a market that already orders by WhatsApp. Since launch, the owner says the site brings in far more customers.",
    role:     "SOLO DEVELOPER",
    year:     "2026",
    url:      "https://vinylizedlb.com",
    images: [
      "/images/work/vinylized-01.webp",
      "/images/work/vinylized-02.webp",
      "/images/work/vinylized-03.webp",
      "/images/work/vinylized-04.webp",
    ],
    stack:  ["NEXT.JS", "SUPABASE", "CLOUDFLARE"],
  },
  {
    num:      "02",
    title:    "BRAND\nATELIER",
    headline: "A bilingual agency site built for the Gulf.",
    body:
      "English and Arabic with true right-to-left layout across every page. Privacy-first analytics for Google, Meta and LinkedIn, plus full SEO setup. Delivered on the agreed timeline and budget, through several rounds of changes.",
    role:     "CUSTOM WEB PLATFORM",
    year:     "2026",
    url:      "https://brandatelierdigital.com",
    images: [
      "/images/work/brandatelier-01.webp",
      "/images/work/brandatelier-02.webp",
      "/images/work/brandatelier-03.webp",
      "/images/work/brandatelier-04.webp",
    ],
    stack:  ["NEXT.JS 16", "MUI", "NEXT-INTL"],
  },
  {
    num:      "03",
    title:    "THE\nOUTLETS",
    headline: "I run my own store, so I build for sales, not just looks.",
    body:
      "I co-founded The Outlets and built its custom Shopify storefront. I run it every day: products, ads, orders and delivery. Every client store gets what I learned there.",
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
  },
  {
    num:      "04",
    title:    "UNCLE J\nNUTRITION",
    headline: "A Shopify storefront for a Canadian supplement brand.",
    body:
      "Custom product and collection templates, mobile-first design and performance tuning, delivered end to end for a client abroad.",
    role:     "FREELANCE",
    year:     "2026",
    url:      null,
    images: [
      "/images/work/unclej-01.webp",
      "/images/work/unclej-02.webp",
      "/images/work/unclej-03.webp",
      "/images/work/unclej-04.webp",
    ],
    stack:  ["SHOPIFY", "LIQUID"],
  },
]

// ── Stack ─────────────────────────────────────────────────────────────────────

export type StackCategory = { id: string; label: string; skills: string[] }

export const STACK: StackCategory[] = [
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

export const TECH_COUNT = STACK.reduce((n, c) => n + c.skills.length, 0)

export const EDUCATION = [
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

/**
 * Interface copy: every label, button and caption the modules draw that isn't
 * part of the content above. Arrows are not in these strings: components draw
 * them as separate glyphs that mirror under RTL (`rtl:-scale-x-100`).
 */
export const UI = {
  identity: { portfolio: "PORTFOLIO · 2026", home: "INDEX", homeAria: "Go to index" },
  /** A date range, "FEB 2026 TO PRESENT". */
  range: (from: string, to: string) => `${from} TO ${to}`,
  experience: { label: "EXPERIENCE", months: "MOS" },
  workMeta: { label: "SELECTED", line: "PROJECTS · 2022 TO 2026", tags: "SHOPIFY · NEXT.JS · E-COMMERCE" },
  project: { label: "WORK", views: "VIEWS", visit: "VISIT SITE" },
  service: { label: "SERVICE", cta: "ASK ABOUT THIS", plansCta: "ASK ABOUT CARE PLANS", included: "WHAT'S INCLUDED" },
  stack:   { label: "STACK", technologies: (n: number) => `${n} TECHNOLOGIES` },
  education: { label: "EDUCATION" },
  testimonials: { label: "WHAT CLIENTS SAY", next: "NEXT", nextAria: "Show the next testimonial", open: "“", close: "”" },
  faq: { count: (n: number) => `${n} QUESTIONS` },
  contact: {
    label: "CONTACT",
    headline: "Tell me what you're building.",
    line: "I usually reply within a few hours.",
    whatsapp: "WHATSAPP", book: "BOOK A FREE CALL", email: "EMAIL",
    github: "GITHUB", linkedin: "LINKEDIN", cv: "CV",
    footer: "© 2026 MikelMrad", colophon: "· NEXT.JS",
  },
  whatsapp: {
    /** Typed into the chat for the visitor; wa.me receives it URL-encoded. */
    message: "Hi Mikel, I'd like to talk about a website.",
    aria: "Message Mikel on WhatsApp",
  },
  expand: "EXPAND",
  close: "CLOSE",
  esc: "ESC",
  step: "TO STEP THROUGH",
  expanded: "EXPANDED",
  roles: (n: number) => `${n} ROLES`,
  tabs: { index: "INDEX", work: "WORK", about: "ABOUT", contact: "CONTACT" },
  dock: {
    hints: "DRAG · FLING · 1-4 · ← → · ESC",
    reset: "RESET GRID", resetAria: "Put the cards back",
    /** The *other* language, named in itself: what the toggle switches to. */
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

/** Everything a language supplies. lib/content-ar.ts implements this. */
export const EN = {
  IDENTITY, HERO, PROOF, SERVICES, PROCESS, FAQ, TESTIMONIALS, MODULE_TITLES,
  EMPLOYER, ROLES, PROJECTS, STACK, TECH_COUNT, EDUCATION, UI,
}
export type Content = typeof EN
