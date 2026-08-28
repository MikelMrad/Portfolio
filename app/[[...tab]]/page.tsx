import { notFound } from "next/navigation"
import { Stage } from "@/components/grid/stage"
import { TABS, type TabId } from "@/lib/grid"

/** Every tab is a real, statically-rendered URL — so links and hard reloads work. */
export function generateStaticParams() {
  return [{ tab: [] as string[] }, ...TABS.filter((t) => t.id !== "index").map((t) => ({ tab: [t.id] }))]
}

export default async function Page({ params }: { params: Promise<{ tab?: string[] }> }) {
  const { tab } = await params

  // Without this the catch-all answers 200 for any path — including missing
  // static assets like /images/avatar.jpg, which then arrive as HTML.
  if (tab && tab.length > 0) {
    if (tab.length > 1) notFound()
    const match = TABS.find((t) => t.id === tab[0] && t.id !== "index")
    if (!match) notFound()
    return <Stage initialTab={match.id} />
  }

  return <Stage initialTab={"index" satisfies TabId} />
}
