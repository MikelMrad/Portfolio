"use client"
import { Reveal } from "@/components/ui/reveal"

type SkillCategory = {
  label: string
  skills: string[]
}

const SKILLS: SkillCategory[] = [
  {
    label: "LANGUAGES",
    skills: [ "JAVASCRIPT", "TYPESCRIPT", "C++", "JAVA"],
  },
  {
    label: "FRAMEWORKS",
    skills: ["REACT", "REACT NATIVE", "NEXT.JS", "NODE.JS", "EXPRESS", "GRAPHQL", "REDUX", "LIQUID"],
  },
  {
    label: "TOOLS",
    skills: ["HTML", "CSS", "TAILWIND", "GIT", "DOCKER", "FIGMA", "PHOTOSHOP", "POSTMAN", "SHOPIFY"],
  },
  {
    label: "DATABASES",
    skills: ["MONGODB", "FIREBASE"],
  },
]

export function SkillsSection() {
  return (
    <section
      id="skills"
      data-snap=""
      className="bg-bg border-t border-hairline"
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <Reveal className="flex items-end justify-between px-8 md:px-16 pt-14 md:pt-20 pb-0 gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-mid">
            STACK — WHAT I USE
          </span>
          <h2
            className="font-display leading-none tracking-tight text-fg"
            style={{ fontSize: "clamp(3rem, 7.5vw, 9rem)" }}
          >
            SKILLS.
          </h2>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-mid hidden md:block pb-2">
          {SKILLS.reduce((acc, cat) => acc + cat.skills.length, 0)} TECHNOLOGIES
        </span>
      </Reveal>

      {/* ── Skill table ──────────────────────────────────────────── */}
      <div className="mt-14 border-t border-hairline">
        {SKILLS.map((cat, i) => (
          <Reveal
            key={cat.label}
            delay={i * 60}
            className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-0 px-8 md:px-16 py-7 border-b border-hairline group"
          >
            {/* Category label */}
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-mid sm:w-36 md:w-44 shrink-0 pt-0.5">
              {cat.label}
            </span>

            {/* Skill tags */}
            <div className="flex flex-wrap gap-2">
              {cat.skills.map(skill => (
                <span
                  key={skill}
                  className="font-mono text-[9px] uppercase tracking-[0.18em] border border-hairline text-mid px-3 py-1.5 transition-all duration-200 hover:border-fg hover:text-fg"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
