import { notFound } from "next/navigation"
import { GridBoot } from "@/components/grid/grid-boot"
import { Stage } from "@/components/grid/stage"
import { TABS, type TabId } from "@/lib/grid"

/** Every tab is a real, statically-rendered URL — so links and hard reloads work. */
export function generateStaticParams() {
  return [{ tab: [] as string[] }, ...TABS.filter((t) => t.id !== "index").map((t) => ({ tab: [t.id] }))]
}

export default async function Page({ params }: { params: Promise<{ tab?: string[] }> }) {
  const { tab } = await params

  // Without this the catch-all answers 200 for any path — including missing
  // static assets, which would then arrive as HTML instead of a 404.
  if (tab && tab.length > 0) {
    if (tab.length > 1) notFound()
    const match = TABS.find((t) => t.id === tab[0] && t.id !== "index")
    if (!match) notFound()
    return <><GridBoot tab={match.id} /><Stage initialTab={match.id} /></>
  }

  return (
    <>
      {/* Server-rendered, so this tab's bento starts drawing on the first
          frame — long before the Stage below it has any JS to run. */}
      <GridBoot tab="index" />
      <Stage initialTab={"index" satisfies TabId} />
    </>
  )
}
