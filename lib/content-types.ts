/**
 * The shape every content set shares.
 *
 * The site runs as two variants from one codebase, picked by hostname
 * (proxy.ts): "business" on mikelmrad.dev (lib/content.ts, lib/content-ar.ts)
 * and "cv" on portfolio.mikelmrad.dev (lib/content-cv.ts,
 * lib/content-cv-ar.ts). Shared components read only what is declared here,
 * through useContent(); a module that belongs to one variant reads that
 * variant's full set through useBusiness() or useCv() (lib/i18n.tsx).
 */

export type Variant = "business" | "cv"

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

export type Project = {
  num:      string
  title:    string
  /** One line under the title: the outcome (business) or the kind of build (cv). */
  headline: string
  /** The write-up, one paragraph per entry. */
  body:     string[]
  role:     string
  year:     string
  url:      string | null
  images:   string[]
  stack:    string[]
}

/** `id` is stable across languages: the stage maps `cat-<id>` modules by it. */
export type StackCategory = { id: string; label: string; skills: string[] }

export type Education = { school: string; short: string; place: string; award: string; years: string }

/** Interface strings the shared components draw, in either variant. */
export type SharedUI = {
  identity:   { portfolio: string; home: string; homeAria: string }
  /** A date range, "FEB 2026 TO PRESENT". */
  range:      (from: string, to: string) => string
  experience: { label: string; months: string }
  workMeta:   { label: string; line: string; tags: string }
  project:    { label: string; views: string; visit: string }
  education:  { label: string }
  contact:    { github: string; linkedin: string; cv: string; footer: string; colophon: string }
  expand: string; close: string; esc: string; step: string; expanded: string
  roles: (n: number) => string
  tabs: Record<string, string>
  dock: {
    hints: string; reset: string; resetAria: string
    lang: string; langAria: string; toLight: string; toDark: string
  }
  demo: {
    tabsPhone: string; tabsDesktop: string; open: string; swap: string; fling: string
    shake: string; shakeOffer: string; shakeEnable: string; shakeLater: string
    skip: string; skipAria: string; watch: string; watchAria: string
  }
}

export type SharedContent = {
  IDENTITY: {
    name: string; role: string; tagline: string; location: string
    availability: { short: string; long: string }
  }
  MODULE_TITLES: Record<string, string>
  EMPLOYER: { name: string; location: string; span: string; summary: string }
  ROLES: Role[]
  PROJECTS: Project[]
  STACK: StackCategory[]
  TECH_COUNT: number
  EDUCATION: Education[]
  UI: SharedUI
}
