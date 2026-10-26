"use client"
import { useId, useState } from "react"
import Image from "next/image"
import { CONTACT, has, whatsappUrl } from "@/lib/config"
import type { Service } from "@/lib/content"
import { useBusiness } from "@/lib/i18n"
import { APPROVED_TESTIMONIALS } from "@/lib/testimonials"
import { GlowRule, Label, WhatsAppIcon } from "@/components/ui/bits"

/**
 * The modules that sell: hero (with the proof strip), services, how I work, testimonials, FAQ
 * and the contact card. Same rules as every other module: sized against the
 * card (`cqw`/`cqh`), optional lines dropped by the `.cq-h*` height gates
 * rather than clipped, and every string from useBusiness().
 */

/** The filled, inverted button: the one action a card wants taken. */
const PRIMARY =
  "inline-flex items-center gap-2 font-mono text-[9px] @[420px]:text-[10px] uppercase tracking-[0.1em] @[420px]:tracking-[0.16em] px-3 @[420px]:px-3.5 py-2.5 bg-fg text-bg border border-fg shadow-glow-sm hover:shadow-glow transition-shadow duration-300 whitespace-nowrap"
/** The outlined one beside it. */
const SECONDARY =
  "inline-flex items-center gap-2 font-mono text-[9px] @[420px]:text-[10px] uppercase tracking-[0.1em] @[420px]:tracking-[0.16em] px-3 @[420px]:px-3.5 py-2.5 border border-fg/40 text-fg hover:border-fg hover:bg-fg hover:text-bg transition-colors duration-150 whitespace-nowrap"

/** "Message me on WhatsApp", with the visitor's first line already typed. */
function WhatsAppButton({ label, className = PRIMARY }: { label: string; className?: string }) {
  const { UI } = useBusiness()
  return (
    <a href={whatsappUrl(UI.whatsapp.message)} target="_blank" rel="noopener noreferrer" className={className}>
      <WhatsAppIcon size={13} /> {label}
    </a>
  )
}

const Arrow = ({ glyph = "→" }: { glyph?: string }) => (
  <span aria-hidden className="inline-block rtl:-scale-x-100">{glyph}</span>
)

// ── INDEX ─────────────────────────────────────────────────────────────────────

/**
 * The pitch. The identity card beside it carries the name and the eyebrow;
 * this carries the promise, the two ways in, and the proof strip under them
 * (where the old "2+ years / 10+ projects" figures were).
 *
 * What goes first when the card is short: the proof strip, then the subline.
 * The headline and the buttons always stay.
 */
export function Hero({ onWork }: { onWork: () => void }) {
  const { HERO, PROOF } = useBusiness()
  return (
    <div className="h-full flex flex-col p-[clamp(0.75rem,4cqh,1.75rem)] gap-[clamp(0.5rem,2.5cqh,1.25rem)] min-h-0">
      <Label right={HERO.langs}>{HERO.label}</Label>

      <div className="flex-1 min-h-0 flex flex-col [justify-content:safe_center] gap-[clamp(0.5rem,2.5cqh,1rem)]">
        <h2 className="font-display uppercase text-fg leading-[0.88] tracking-tight text-balance text-[clamp(1.5rem,min(8.5cqw,15cqh),6rem)]">
          {HERO.headline}
        </h2>
        <div className="cq-h220">
          <p className="font-mono text-[10px] @[560px]:text-[11px] leading-relaxed text-mid max-w-[64ch]">
            {HERO.subline}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <WhatsAppButton label={HERO.whatsapp} />
        <button type="button" onClick={onWork} className={SECONDARY}>
          {HERO.work} <Arrow />
        </button>
      </div>

      {/* The proof strip: three short facts, a column on a phone and a row
          across a wide card. */}
      <div className="cq-h320 shrink-0">
        <ul aria-label={PROOF.label} className="grid grid-cols-1 @[640px]:grid-cols-3 gap-x-5 gap-y-1.5 border-t border-hairline pt-3">
          {PROOF.items.map((item, i) => (
            <li key={item} className="flex items-baseline gap-2.5 min-w-0">
              <span className="font-mono text-[8px] tracking-[0.16em] text-dim tabular-nums shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-mid leading-snug">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * One service. On the grid it is a button that expands it to the whole grid;
 * expanded (`onOpen` absent) it adds the WhatsApp call to action, which a
 * button can't contain. CARE PLANS expands into its plans side by side.
 */
export function ServiceCard({ svc, onOpen }: { svc: Service; onOpen?: () => void }) {
  const { SERVICES, UI } = useBusiness()
  const Shell = onOpen ? "button" : "div"
  const plans = !onOpen && svc.plans

  return (
    <Shell
      {...(onOpen ? { onClick: onOpen, type: "button" as const } : {})}
      className="group h-full w-full text-start flex flex-col p-3 @[220px]:p-4 @[320px]:p-5 gap-3 min-h-0 overflow-hidden"
    >
      <div className="cq-h100"><Label right={svc.num}>{SERVICES.label}</Label></div>

      <div className={`flex-1 min-h-0 flex flex-col gap-3 ${onOpen ? "[justify-content:safe_center]" : "overflow-y-auto"}`}>
        <h3 className="font-display uppercase text-fg leading-[0.88] tracking-tight whitespace-pre-line text-[clamp(1.1rem,min(14cqw,16cqh),5rem)]">
          {plans ? svc.title.replace("\n", " ") : svc.title}
        </h3>
        <div className="cq-h220">
          <p className="font-mono text-[10px] @[480px]:text-[11px] leading-relaxed text-mid max-w-[52ch]">{svc.body}</p>
        </div>

        {!onOpen && svc.includes && (
          <div className="flex flex-col gap-2 border border-hairline p-3 @[560px]:p-4 mt-1 max-w-[60ch]">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-dim">{UI.service.included}</span>
            <ul className="flex flex-col gap-1.5">
              {svc.includes.map((item) => (
                <li key={item} className="flex gap-2 font-mono text-[10px] leading-relaxed text-mid">
                  <span aria-hidden className="text-dim shrink-0">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {plans && (
          <div className="grid grid-cols-1 @[560px]:grid-cols-2 gap-3 mt-1">
            {plans.map((plan) => (
              <div key={plan.name} className="flex flex-col gap-2.5 border border-hairline p-3 @[560px]:p-4">
                <div className="flex items-baseline justify-between gap-3">
                  {/* Latin in both languages: isolated, or an RTL line moves
                      the "+" of CARE+ to the front. */}
                  <span dir="ltr" className="font-display text-fg leading-none tracking-tight text-[clamp(1.25rem,min(6cqw,7cqh),2.5rem)]">
                    {plan.name}
                  </span>
                  <span className="font-mono text-[9px] @[420px]:text-[10px] uppercase tracking-[0.14em] text-fg shrink-0">
                    {plan.price}
                  </span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {plan.items.map((item) => (
                    <li key={item} className="flex gap-2 font-mono text-[10px] leading-relaxed text-mid">
                      <span aria-hidden className="text-dim shrink-0">+</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* What the free bug fixes do and don't cover, under the detail of
            every opened service. */}
        {!onOpen && (
          <p className="font-mono text-[9px] @[480px]:text-[10px] leading-relaxed text-dim max-w-[70ch]">
            {SERVICES.fixesNote}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <div className="cq-h220"><GlowRule /></div>
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-mono text-[9px] @[220px]:text-[10px] uppercase tracking-[0.14em] text-fg">
              {svc.price}
            </span>
            {/* Too much for a phone's ~120px service card, where the title
                and price have to fit; it shows there once the card is opened. */}
            {svc.note && (
              <div className="cq-h160">
                <span className="font-mono text-[8px] @[220px]:text-[9px] uppercase tracking-[0.12em] text-dim leading-snug block">
                  {svc.note}
                </span>
              </div>
            )}
          </div>
          {onOpen && (
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-dim group-hover:text-fg transition-colors shrink-0">
              <span className="cq-h160">{UI.expand} </span><Arrow glyph="↗" />
            </span>
          )}
        </div>
        {!onOpen && <div className="mt-1"><WhatsAppButton label={svc.plans ? UI.service.plansCta : UI.service.cta} /></div>}
      </div>
    </Shell>
  )
}

// ── ABOUT ─────────────────────────────────────────────────────────────────────

/**
 * How I work: four numbered steps. Four across in a wide card, two by two in a
 * phone's; the explanations show once the card is tall enough for them, and
 * the card expands to show them on a phone.
 */
export function Process({ onOpen }: { onOpen?: () => void }) {
  const { PROCESS, UI } = useBusiness()
  const Shell = onOpen ? "button" : "div"
  return (
    <Shell
      {...(onOpen ? { onClick: onOpen, type: "button" as const } : {})}
      className="group h-full w-full text-start flex flex-col p-4 @[420px]:p-5 gap-3 min-h-0 overflow-hidden"
    >
      <Label right={onOpen ? <span className="group-hover:text-fg transition-colors">{UI.expand} <Arrow glyph="↗" /></span> : undefined}>
        {PROCESS.label}
      </Label>
      {!onOpen ? (
        /* Expanded: one step per full-width row, sharing the panel's height,
           so the four fill it instead of sitting in a strip along the top.
           The numeral column has a fixed width (sized like the numerals), so
           the titles line up whatever the digits' widths. */
        <ol className="flex-1 min-h-0 grid grid-rows-4">
          {PROCESS.steps.map((s, i) => (
            <li
              key={s.title}
              className="grid grid-cols-[clamp(2.4rem,min(11cqw,14.5cqh),7.8rem)_minmax(0,1fr)] @[700px]:grid-cols-[clamp(2.4rem,min(11cqw,14.5cqh),7.8rem)_minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-x-5 @[700px]:gap-x-8 gap-y-1.5 border-t border-hairline min-h-0"
            >
              <span className="row-span-2 @[700px]:row-span-1 font-display text-fg leading-none tracking-tight text-[clamp(2rem,min(10cqw,13cqh),7rem)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="self-end @[700px]:self-center font-display uppercase text-fg leading-[0.95] tracking-tight text-[clamp(1.1rem,min(4.5cqw,6cqh),3rem)]">
                {s.title}
              </span>
              <p className="self-start @[700px]:self-center font-mono text-[10px] @[700px]:text-xs leading-relaxed text-mid max-w-[52ch]">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      ) : (
      <ol className="flex-1 min-h-0 grid grid-cols-2 @[640px]:grid-cols-4 gap-x-4 gap-y-3">
        {PROCESS.steps.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-1.5 border-t border-hairline pt-2.5 min-h-0 min-w-0">
            {/* Numeral and title share a line, so a step costs one row of
                height in a phone's short card rather than two. */}
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-display text-fg leading-none shrink-0 text-[clamp(1rem,min(5cqw,10cqh),2.5rem)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[9px] @[420px]:text-[10px] uppercase tracking-[0.1em] text-fg leading-snug">
                {s.title}
              </span>
            </div>
            <div className="cq-h240">
              <p className="font-mono text-[10px] leading-relaxed text-mid">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      )}
    </Shell>
  )
}

// ── WORK ──────────────────────────────────────────────────────────────────────

/**
 * Approved client quotes (lib/testimonials.ts). Only mounted when at least one
 * is approved: the WORK layout has no cell for it otherwise.
 */
export function Testimonials() {
  const { TESTIMONIALS, UI } = useBusiness()
  const [i, setI] = useState(0)
  const list = APPROVED_TESTIMONIALS
  if (list.length === 0) return null
  const t = list[i % list.length]
  const copy = TESTIMONIALS[t.id]
  const by = [t.name, copy?.role, t.business].filter(Boolean).join(" · ")

  return (
    <figure className="h-full flex flex-col p-4 @[300px]:p-5 gap-3 min-h-0">
      <Label right={list.length > 1 ? `${(i % list.length) + 1}/${list.length}` : undefined}>
        {UI.testimonials.label}
      </Label>

      <blockquote className="flex-1 min-h-0 overflow-hidden flex flex-col [justify-content:safe_center]">
        <p className="font-mono text-[10px] @[340px]:text-[11px] leading-relaxed text-fg">
          {UI.testimonials.open}{copy?.quote}{UI.testimonials.close}
        </p>
      </blockquote>

      <div className="flex items-center gap-3 shrink-0 min-w-0">
        {t.logo && (
          <Image src={t.logo} alt="" width={28} height={28} className="shrink-0 rounded-full border border-hairline object-cover" />
        )}
        <figcaption className="font-mono text-[9px] uppercase tracking-[0.16em] text-mid truncate min-w-0">{by}</figcaption>
        {list.length > 1 && (
          <button
            type="button"
            onClick={() => setI((n) => n + 1)}
            aria-label={UI.testimonials.nextAria}
            className="ms-auto shrink-0 font-mono text-[9px] uppercase tracking-[0.22em] text-dim hover:text-fg transition-colors"
          >
            {UI.testimonials.next} <Arrow />
          </button>
        )}
      </div>
    </figure>
  )
}

// ── CONTACT ───────────────────────────────────────────────────────────────────

/**
 * Questions before the first message. An accordion of real buttons: each has
 * aria-expanded and aria-controls, Enter and Space toggle it, one answer is
 * open at a time so the card's height stays bounded.
 *
 * The list may scroll inside the card on a short phone, the one scroll this
 * site allows outside an expanded view. `data-no-drag` keeps a swipe on it a
 * scroll rather than the start of a card throw (ModuleCard).
 */
export function Faq() {
  const { FAQ, UI } = useBusiness()
  const [open, setOpen] = useState<number | null>(0)
  const base = useId()
  return (
    <div className="h-full flex flex-col p-4 @[480px]:p-6 gap-3 min-h-0">
      <Label right={UI.faq.count(FAQ.items.length)}>{FAQ.label}</Label>
      <div data-no-drag className="flex-1 min-h-0 overflow-y-auto overscroll-contain [touch-action:pan-y]">
        <ul className="flex flex-col">
          {FAQ.items.map((item, n) => {
            const isOpen = open === n
            const q = `${base}-q${n}`
            const a = `${base}-a${n}`
            return (
              <li key={item.q} className="border-b border-hairline last:border-0">
                <h3>
                  <button
                    type="button"
                    id={q}
                    aria-expanded={isOpen}
                    aria-controls={a}
                    onClick={() => setOpen(isOpen ? null : n)}
                    className="group w-full flex items-center justify-between gap-4 py-2.5 @[600px]:py-3.5 text-start"
                  >
                    <span className={`font-mono text-[10px] @[600px]:text-xs uppercase tracking-[0.1em] leading-snug transition-colors ${isOpen ? "text-fg" : "text-mid group-hover:text-fg"}`}>
                      {item.q}
                    </span>
                    <span
                      aria-hidden
                      className={`font-mono text-sm text-dim shrink-0 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "rotate-45 text-fg" : ""}`}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div id={a} role="region" aria-labelledby={q} hidden={!isOpen}>
                  <p className="pb-3 @[600px]:pb-4 font-mono text-[10px] @[600px]:text-[11px] leading-relaxed text-mid max-w-[70ch]">
                    {item.a}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/**
 * The close. WhatsApp first because that is how the people this site is for
 * actually get in touch; the booking link only renders once CONTACT.calcom is
 * filled in (lib/config.ts).
 */
export function ContactCard() {
  const { UI } = useBusiness()
  const links = [
    { label: UI.contact.github,   href: CONTACT.github },
    { label: UI.contact.linkedin, href: CONTACT.linkedin },
    { label: UI.contact.cv,       href: CONTACT.cv, glyph: "↓" },
  ]
  return (
    <div className="h-full flex flex-col p-4 @[420px]:p-6 gap-2.5 min-h-0">
      <Label>{UI.contact.label}</Label>

      <div className="flex-1 min-h-0 flex flex-col [justify-content:safe_center] gap-2">
        <h2 className="font-display uppercase text-fg leading-[0.88] tracking-tight text-balance text-[clamp(1.4rem,min(11cqw,13cqh),5rem)]">
          {UI.contact.headline}
        </h2>
        <div className="cq-h160">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-dim leading-relaxed">{UI.contact.line}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        <WhatsAppButton label={UI.contact.whatsapp} />
        {has(CONTACT.calcom) && (
          <a href={CONTACT.calcom} target="_blank" rel="noopener noreferrer" className={SECONDARY}>
            {UI.contact.book}
          </a>
        )}
        <a href={`mailto:${CONTACT.email}`} title={CONTACT.email} className={SECONDARY}>
          {UI.contact.email}
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 shrink-0 border-t border-hairline pt-2.5">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[9px] uppercase tracking-[0.2em] text-mid hover:text-fg transition-colors whitespace-nowrap"
          >
            {l.label}{l.glyph && <> <span aria-hidden>{l.glyph}</span></>}
          </a>
        ))}
      </div>
    </div>
  )
}
