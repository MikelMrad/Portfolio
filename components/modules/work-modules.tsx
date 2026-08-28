"use client"
import Image from "next/image"
import { CONTACT, PROJECTS, type Project } from "@/lib/content"
import { GlowRule, Label, Tag } from "@/components/ui/bits"
import { Magnetic } from "@/components/ui/magnetic"

export function WorkMeta() {
  return (
    <div className="h-full flex flex-col justify-between p-4 @[260px]:p-5">
      <Label>SELECTED</Label>
      <div>
        <span className="font-display text-fg leading-none block text-[clamp(1.5rem,min(22cqw,26cqh),3.75rem)]">04</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim block mt-1">
          PROJECTS · 2022—2026
        </span>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mid leading-relaxed">
        SHOPIFY · HEADLESS · COMMERCE
      </span>
    </div>
  )
}

export function CvCard() {
  return (
    <div className="h-full flex flex-col justify-between p-4 @[260px]:p-5">
      <Label right="PDF">CURRICULUM VITAE</Label>
      <div className="flex flex-col gap-2">
        <span className="font-display text-fg leading-[0.88] block tracking-tight text-[clamp(1.25rem,min(20cqw,20cqh),3rem)]">
          2026
          <br />
          CV
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-dim leading-relaxed">
          EXPERIENCE · STACK · EDUCATION
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <GlowRule />
        <Magnetic strength={0.25}>
          <a
            href={CONTACT.cv}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[9px] uppercase tracking-[0.24em] text-mid hover:text-fg transition-colors flex items-center gap-2"
          >
            DOWNLOAD <span aria-hidden>↓</span>
          </a>
        </Magnetic>
      </div>
    </div>
  )
}

/** A project tile. Click expands it — handled by the stage, not here. */
export function ProjectCard({ project, onOpen }: { project: Project; onOpen: (num: string) => void }) {
  return (
    <button
      onClick={() => onOpen(project.num)}
      className="group h-full w-full text-left relative overflow-hidden"
    >
      <Image
        src={project.images[0]}
        alt={project.title.replace("\n", " ")}
        fill
        sizes="(max-width: 768px) 50vw, 40vw"
        /* Blurred on purpose: at readable sharpness the screenshot's own
           headlines collide with this card's title and label. Sharpens on hover. */
        className="object-cover object-top opacity-[0.22] blur-[5px] group-hover:opacity-45 group-hover:blur-[1px] group-hover:scale-[1.03] transition-all duration-700 ease-out"
      />
      {/* Darkest at top and bottom — where the label, title and chips sit — and
          lightest through the middle, so the imagery reads without fighting text. */}
      <div className="absolute inset-0 bg-gradient-to-b from-card via-card/70 to-card" />

      {/* Ghost number, echoing v3's oversized section numerals. */}
      <span
        aria-hidden
        className="absolute font-display leading-none text-fg pointer-events-none select-none right-[-0.04em] bottom-[-0.14em]"
        style={{ fontSize: "clamp(5rem, 22cqw, 16rem)", opacity: 0.05 }}
      >
        {project.num}
      </span>

      <div className="relative h-full flex flex-col justify-between p-4 @[300px]:p-5">
        <Label right={project.year}>WORK — {project.num}</Label>

        <h3 className="font-display text-fg leading-[0.86] tracking-tight whitespace-pre-line text-[clamp(1.35rem,min(11cqw,22cqh),4rem)]">
          {project.title}
        </h3>

        <div className="flex flex-col gap-2 min-w-0">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-mid truncate">
            {project.role}
          </span>
          <div className="hidden @[300px]:flex flex-wrap gap-1.5">
            {project.stack.slice(0, 4).map((s) => <Tag key={s}>{s}</Tag>)}
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-dim group-hover:text-fg transition-colors flex items-center gap-2">
            {project.archived ? "ARCHIVED — VIEW" : "EXPAND"} <span aria-hidden>↗</span>
          </span>
        </div>
      </div>
    </button>
  )
}

// ── Expanded detail ───────────────────────────────────────────────────────────

/**
 * Vertical filmstrip of the project's screenshots.
 *
 * Each shot is shown at full width and its natural aspect ratio — nothing is
 * cropped — and the strip scrolls upward continuously. The list is rendered
 * twice so the -50% translate in @keyframes marquee-y loops seamlessly.
 */
function VerticalReel({ images, alt }: { images: string[]; alt: string }) {
  const loop = [...images, ...images]

  return (
    <div className="group/reel relative h-full w-full overflow-hidden bg-bg [--reel-speed:48s] @[900px]:[--reel-speed:40s]">
      <div
        /* Runs continuously — no hover pause. (motion-reduce still wins: that's
           an OS accessibility preference, not an interaction.) */
        className="flex flex-col w-full motion-reduce:animate-none"
        style={{
          animationName: "marquee-y",
          animationDuration: "var(--reel-speed)",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      >
        {loop.map((src, i) => (
          <div key={`${src}-${i}`} className="w-full shrink-0 border-b border-hairline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={i < images.length ? `${alt} — view ${i + 1}` : ""}
              aria-hidden={i >= images.length}
              /* Full colour: the screenshots are the content here. Monochrome
                 is a rule for type and chrome, not for the work itself. */
              className="block w-full h-auto"
            />
          </div>
        ))}
      </div>

      {/* Soft top/bottom falloff so the strip bleeds rather than hard-cutting. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-card to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-card to-transparent" />

      <span className="pointer-events-none absolute bottom-3 right-4 font-mono text-[8px] uppercase tracking-[0.22em] text-dim">
        {String(images.length).padStart(2, "0")} VIEWS
      </span>
    </div>
  )
}

export function ProjectDetail({ num }: { num: string }) {
  const project = PROJECTS.find((p) => p.num === num)!
  const title = project.title.replace("\n", " ")

  return (
    <div className="h-full flex flex-col @[700px]:flex-row min-h-0">
      {/* Reel — full-bleed, uncropped, always the widest thing on screen. */}
      <div className="relative flex-1 min-h-0 min-w-0 border-b @[700px]:border-b-0 @[700px]:border-r border-hairline">
        <VerticalReel images={project.images} alt={title} />
      </div>

      {/* Copy */}
      <div className="w-full @[700px]:w-[36%] shrink-0 flex flex-col gap-4 p-5 @[700px]:p-6 min-h-0 overflow-y-auto">
        <Label right={project.year}>WORK — {project.num}</Label>

        <h2 className="font-display text-fg leading-[0.86] tracking-tight whitespace-pre-line text-4xl @[700px]:text-6xl">
          {project.title}
        </h2>

        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mid">{project.role}</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim">{project.subtitle}</span>
        </div>

        <GlowRule />

        <div className="flex flex-col gap-3">
          {project.detail.map((para, i) => (
            <p key={i} className="font-mono text-[10px] leading-relaxed text-mid">{para}</p>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {project.stack.map((s) => <Tag key={s}>{s}</Tag>)}
        </div>

        {project.url ? (
          <Magnetic strength={0.3}>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-fg border border-fg px-5 py-3 hover:bg-fg hover:text-bg transition-colors duration-150"
            >
              VISIT SITE <span aria-hidden>→</span>
            </a>
          </Magnetic>
        ) : (
          <span className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-dim border border-hairline px-5 py-3 self-start">
            ARCHIVED — SITE OFFLINE
          </span>
        )}
      </div>
    </div>
  )
}

/** Sidebar shown alongside an expanded project: close, plus jump to siblings. */
export function DetailNav({
  num, onClose, onOpen,
}: { num: string; onClose: () => void; onOpen: (n: string) => void }) {
  return (
    <div className="h-full flex flex-col justify-between p-4 @[260px]:p-5 gap-3 min-h-0">
      <button
        onClick={onClose}
        className="font-mono text-[9px] uppercase tracking-[0.24em] text-mid hover:text-fg transition-colors flex items-center gap-2 self-start"
      >
        <span aria-hidden>←</span> CLOSE <span className="text-dim">ESC</span>
      </button>

      {/* Rows share the column evenly, matching the STACK spec sheets, so the
          sidebar fills instead of pooling its content in the middle. */}
      <div className="flex-1 min-h-0 flex flex-col">
        {PROJECTS.map((p) => {
          const active = p.num === num
          return (
            <button
              key={p.num}
              onClick={() => onOpen(p.num)}
              className="text-left group flex flex-1 min-h-0 items-center gap-2 border-b border-hairline last:border-0"
            >
              <span className={`font-mono text-[9px] tracking-[0.2em] ${active ? "text-fg" : "text-dim"}`}>
                {p.num}
              </span>
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.12em] truncate transition-colors ${
                  active ? "text-fg" : "text-dim group-hover:text-mid"
                }`}
              >
                {p.title.replace("\n", " ")}
              </span>
              {active && (
                <span
                  className="ml-auto block w-4 h-px bg-fg shrink-0"
                  style={{ boxShadow: "0 0 8px 1px rgba(240,240,240,0.6)" }}
                />
              )}
            </button>
          )
        })}
      </div>

      <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-dim leading-relaxed">
        ← → TO STEP THROUGH
      </span>
    </div>
  )
}
