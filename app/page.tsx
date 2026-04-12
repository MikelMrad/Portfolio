import { ZStage }             from "@/components/sections/z-stage"
import { WorkSection }        from "@/components/sections/work"
import { ExperimentsSection } from "@/components/sections/experiments"
import { AboutSection }       from "@/components/sections/about"
import { ContactSection }     from "@/components/sections/contact-section"
import { Marquee }            from "@/components/ui/marquee"
import { Cursor }             from "@/components/ui/cursor"
import { SectionNav }         from "@/components/ui/section-nav"
import { SnapSections }       from "@/components/ui/snap-sections"

export default function Home() {
  return (
    <>
      <Cursor />
      <SectionNav />
      <main>
        <ZStage />
        <SnapSections>
          <WorkSection />
          <Marquee text="AVAILABLE FOR FREELANCE & FULL-TIME — SHOPIFY · NEXT.JS · THREE.JS · REACT · TS" speed={30} />
          <ExperimentsSection />
          <Marquee text="COMMERCE · INTERFACES · AND THE DETAILS IN BETWEEN" speed={40} />
          <AboutSection />
          <Marquee text="LET'S BUILD SOMETHING TOGETHER — MIKEL MRAD — 2026" speed={25} />
          <ContactSection />
        </SnapSections>
      </main>
    </>
  )
}
