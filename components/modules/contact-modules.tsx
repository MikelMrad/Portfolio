"use client"
import { useState } from "react"
import { CONTACT } from "@/lib/content"
import { useContent } from "@/lib/i18n"
import { GlowRule, Label } from "@/components/ui/bits"
import { Magnetic } from "@/components/ui/magnetic"
import { ScrambleText } from "@/components/ui/scramble-text"

export function Headline() {
  const { IDENTITY, UI } = useContent()
  return (
    <div className="h-full flex flex-col justify-between p-4 @[300px]:p-6 overflow-hidden">
      <Label>{UI.contact.label}</Label>
      <h2 className="font-display text-fg leading-[0.82] tracking-tight text-[clamp(2rem,min(20cqw,26cqh),8rem)]">
        {UI.contact.headline[0]}
        <br />
        <span style={{ WebkitTextStroke: "2px var(--color-fg)", color: "transparent" }}>{UI.contact.headline[1]}</span>
      </h2>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim leading-relaxed">
        {IDENTITY.availability.long}
      </span>
    </div>
  )
}

export function EmailCard() {
  const { UI } = useContent()
  return (
    <div className="h-full flex flex-col justify-between p-4 @[400px]:p-5 gap-2 min-w-0">
      {/* The phone number and the address are left-to-right in either
          language — isolated, or an RTL page reorders "+961" to the end. */}
      <Label right={<span dir="ltr">{CONTACT.phone}</span>}>{UI.contact.direct}</Label>
      <a
        href={`mailto:${CONTACT.email}`}
        className="font-mono text-[11px] @[400px]:text-sm uppercase tracking-[0.14em] text-fg hover:text-mid transition-colors flex items-center gap-3 min-w-0"
      >
        <span className="inline-block w-4 h-px bg-fg shrink-0" style={{ boxShadow: "0 0 8px 1px rgb(var(--glow) / calc(0.5 * var(--glow-k)))" }} />
        <span dir="ltr" className="min-w-0"><ScrambleText text={CONTACT.email.toUpperCase()} speed={5} /></span>
      </a>
      <GlowRule />
    </div>
  )
}

type Status = "idle" | "sending" | "sent" | "error"

const FIELD =
  "bg-transparent border-0 border-b border-hairline text-fg font-mono text-[10px] uppercase tracking-[0.12em] py-2.5 outline-none w-full placeholder:text-dim focus:border-fg transition-colors duration-200"

export function ContactForm() {
  const { UI } = useContent()
  const [status, setStatus] = useState<Status>("idle")
  const [name, setName]   = useState("")
  const [email, setEmail] = useState("")
  const [msg, setMsg]     = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    try {
      // Loaded on submit, not on load. The SDK is only ever needed by the
      // person who actually presses this button, and a static import put it in
      // the bundle of every tab — including the three that have no form.
      const { default: emailjs } = await import("@emailjs/browser")
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
        { name, email, message: msg, title: "Portfolio Contact" },
        { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "" },
      )
      setStatus("sent")
      setName(""); setEmail(""); setMsg("")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="h-full flex flex-col p-4 @[400px]:p-6 gap-4 min-h-0">
      <Label right={status === "sent" ? UI.contact.sentTag : UI.contact.formTag}>{UI.contact.form}</Label>

      {status === "sent" ? (
        <div className="flex-1 flex flex-col justify-center gap-2">
          <span className="font-display text-fg leading-none tracking-tight text-[clamp(1.5rem,min(12cqw,18cqh),3rem)]">{UI.contact.received}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid">
            {UI.contact.reply}
          </span>
        </div>
      ) : (
        <form onSubmit={submit} className="flex-1 min-h-0 flex flex-col gap-4 @[400px]:gap-5">
          {/* Paired at 320px, not 400: a phone's form card is ~369px wide, and
              stacking the two inputs there costs 54px of the height the message
              field needs. Two 176px inputs hold a 72px placeholder fine. */}
          <div className="grid grid-cols-1 @[320px]:grid-cols-2 gap-4 @[400px]:gap-5 shrink-0">
            <input
              placeholder={UI.contact.name} value={name} onChange={(e) => setName(e.target.value)}
              required disabled={status === "sending"} className={FIELD}
            />
            <input
              // An address is left-to-right — but only once there is one: an
              // empty LTR field pushes the Arabic placeholder to the wrong side.
              type="email" dir={email ? "ltr" : undefined} placeholder={UI.contact.email} value={email} onChange={(e) => setEmail(e.target.value)}
              required disabled={status === "sending"} className={FIELD}
            />
          </div>

          <textarea
            placeholder={UI.contact.message} value={msg} onChange={(e) => setMsg(e.target.value)}
            required disabled={status === "sending"}
            className={`${FIELD} resize-none flex-1 min-h-0`}
          />

          {status === "error" && (
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim shrink-0">
              {UI.contact.error}
            </span>
          )}

          <Magnetic strength={0.25} className="self-start shrink-0">
            <button
              type="submit" disabled={status === "sending"}
              className="font-mono text-[10px] uppercase tracking-[0.24em] border border-fg text-fg px-6 py-3 hover:bg-fg hover:text-bg transition-colors duration-150 disabled:opacity-40"
            >
              {status === "sending" ? UI.contact.sending : <>{UI.contact.send} <span aria-hidden className="inline-block rtl:-scale-x-100">→</span></>}
            </button>
          </Magnetic>
        </form>
      )}
    </div>
  )
}

export function Socials() {
  const { UI } = useContent()
  const links = [
    { label: UI.contact.github,     href: CONTACT.github },
    { label: UI.contact.linkedin,   href: CONTACT.linkedin },
    { label: `${UI.contact.cv} ↓`,  href: CONTACT.cv },
  ]
  return (
    /* Three nowrap labels in a 180px phone cell only fit at the tighter of the
       two scales — hence the gates on gap, padding and tracking. */
    <div className="h-full flex items-center justify-between @[220px]:justify-start gap-2 @[220px]:gap-5 px-3 @[300px]:px-5">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[8px] @[220px]:text-[9px] uppercase tracking-[0.14em] @[220px]:tracking-[0.24em] text-mid hover:text-fg transition-colors whitespace-nowrap"
        >
          {l.label}
        </a>
      ))}
    </div>
  )
}

export function Footer() {
  const { UI } = useContent()
  return (
    <div className="h-full flex items-center justify-between px-3 @[220px]:px-5 gap-3">
      <span dir="ltr" className="font-mono text-[8px] uppercase tracking-[0.2em] text-dim whitespace-nowrap">{UI.contact.footer}</span>
      {/* The colophon is the half that goes when the cell is a phone-width bar. */}
      <span className="hidden @[220px]:inline font-mono text-[8px] uppercase tracking-[0.2em] text-dim whitespace-nowrap" dir="ltr">{UI.contact.colophon}</span>
    </div>
  )
}
