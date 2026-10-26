import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { GridBoot } from "@/components/grid/grid-boot"
import { Stage } from "@/components/grid/stage"
import { NO_JS_CSS, StaticCv } from "@/components/static-cv"
import { CONTACT } from "@/lib/config"
import { CV_TABS, type CvTabId } from "@/lib/grid"
import { CV_OG_IMAGE, CV_TAB_META, SITE_NAME } from "@/lib/seo"

/**
 * The engineering portfolio, portfolio.mikelmrad.dev: the same Stage and
 * modules as the business site, run as the "cv" variant.
 *
 * Never reached at /cv: proxy.ts rewrites the subdomain's clean paths (/,
 * /work, /stack, /contact) here, and redirects /cv on the main domain to the
 * subdomain. So every URL built for this page is the subdomain's public one.
 *
 * Kept out of search (see lib/seo.ts): noindex, follow, no structured data,
 * not in the sitemap.
 */

type Params = { params: Promise<{ tab?: string[] }> }

export function generateStaticParams() {
  return [{ tab: [] as string[] }, ...CV_TABS.filter((t) => t.id !== "index").map((t) => ({ tab: [t.id] }))]
}

/** The tab a path names, or null (a 404) for anything that isn't one. */
function tabOf(tab: string[] | undefined): CvTabId | null {
  if (!tab || tab.length === 0) return "index"
  if (tab.length > 1) return null
  return (CV_TABS.find((t) => t.id === tab[0] && t.id !== "index")?.id as CvTabId | undefined) ?? null
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const id = tabOf((await params).tab)
  if (!id) return {}
  const m = CV_TAB_META[id]
  // Absolute throughout: the root layout's metadataBase is the business origin.
  const url = new URL(m.path, CONTACT.portfolio).toString()
  return {
    title: m.title,
    description: m.description,
    robots: { index: false, follow: true },
    alternates: {
      canonical: url,
      languages: { en: url, ar: `${url}?lang=ar`, "x-default": url },
    },
    openGraph: {
      type: "website",
      title: m.title,
      description: m.description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      alternateLocale: ["ar_LB"],
      images: [CV_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
      images: [CV_OG_IMAGE],
    },
  }
}

export default async function Page({ params }: Params) {
  const id = tabOf((await params).tab)
  if (!id) notFound()

  return (
    <>
      <noscript>
        <style>{NO_JS_CSS}</style>
      </noscript>
      <StaticCv variant="cv" />
      <GridBoot tab={id} variant="cv" />
      <Stage initialTab={id} variant="cv" />
    </>
  )
}
