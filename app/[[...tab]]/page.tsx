import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { GridBoot } from "@/components/grid/grid-boot"
import { Stage } from "@/components/grid/stage"
import { NO_JS_CSS, StaticCv } from "@/components/static-cv"
import { TABS, type BusinessTabId } from "@/lib/grid"
import { OG_IMAGE, SITE_NAME, TAB_META, jsonLd, jsonLdScript } from "@/lib/seo"

type Params = { params: Promise<{ tab?: string[] }> }

/**
 * The business site, mikelmrad.dev. The engineering portfolio is the same app
 * under app/cv, served on portfolio.mikelmrad.dev (proxy.ts).
 *
 * Every tab is a real, statically-rendered URL, so links and hard reloads work.
 */
export function generateStaticParams() {
  return [{ tab: [] as string[] }, ...TABS.filter((t) => t.id !== "index").map((t) => ({ tab: [t.id] }))]
}

/**
 * The tab a path names, or null for anything that isn't one.
 *
 * Without the null the catch-all answers 200 for any path — including missing
 * static assets, which would then arrive as HTML instead of a 404.
 */
function tabOf(tab: string[] | undefined): BusinessTabId | null {
  if (!tab || tab.length === 0) return "index"
  if (tab.length > 1) return null
  return (TABS.find((t) => t.id === tab[0] && t.id !== "index")?.id as BusinessTabId | undefined) ?? null
}

/**
 * A title and description per tab, and the Arabic site declared as an
 * alternate. Static: no searchParams, so every tab still prerenders.
 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const id = tabOf((await params).tab)
  if (!id) return {}
  const m = TAB_META[id]
  return {
    title: m.title,
    description: m.description,
    alternates: {
      canonical: m.path,
      languages: { en: m.path, ar: `${m.path}?lang=ar`, "x-default": m.path },
    },
    openGraph: {
      type: "website",
      title: m.title,
      description: m.description,
      url: m.path,
      siteName: SITE_NAME,
      locale: "en_US",
      alternateLocale: ["ar_LB"],
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
      images: [OG_IMAGE],
    },
  }
}

export default async function Page({ params }: Params) {
  const id = tabOf((await params).tab)
  if (!id) notFound()

  return (
    <>
      {/* Structured data: the Person and the FAQ. See lib/seo.ts. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd()) }}
      />

      {/* With JavaScript off the canvas never comes, so the plain document is
          the page: shown, and the boot drawing (which would wait forever) hidden. */}
      <noscript>
        <style>{NO_JS_CSS}</style>
      </noscript>

      {/* The site as text, for everything that reads HTML without running it. */}
      <StaticCv variant="business" />

      {/* Server-rendered, so this tab's bento starts drawing on the first
          frame — long before the Stage below it has any JS to run. */}
      <GridBoot tab={id} variant="business" />
      <Stage initialTab={id} variant="business" />
    </>
  )
}
